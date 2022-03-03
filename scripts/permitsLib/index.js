const fs = require('fs');
const { ethers } = require('ethers');
const { chunk } = require('lodash');
require('dotenv').config();

const {
    PERMIT_TYPE_HASH,
    PERMIT_ALLOWED_TYPE_HASH,
    ABI_PERMIT,
    ABI_PERMIT_ALLOWED,
    ABI_PERMIT_PACKED,
    TYPES_PERMIT,
    TYPES_PERMIT_ALLOWED,
    MULTICALL2_ADDRESS,
    MULTICALL2_ABI,
} = require('./constants');

const CHAIN_ID = process.env.CHAIN_ID || 1;

module.exports = class PermitDetector {
    constructor() {
        this.provider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC_URL);
        this.signer = ethers.Wallet.createRandom().connect(this.provider);
        this.signTypedData = this.signer._signTypedData
            ? this.signer._signTypedData.bind(this.signer)
            : this.signer.signTypedData.bind(this.signer);
        this.TypedDataEncoder = ethers.utils._TypedDataEncoder || ethers.utils.TypedDataEncoder;
    }

    async multicallPermit(tokenContract, owner, spender, permitPayload) {
        const multicall2Contract = new ethers.Contract(
            MULTICALL2_ADDRESS,
            MULTICALL2_ABI,
            this.signer,
        )

        const allowancePayload = tokenContract.interface.encodeFunctionData('allowance', [owner, spender]);

        const res = await multicall2Contract.callStatic.tryAggregate(false, [
            { target: tokenContract.address, callData: permitPayload },
            { target: tokenContract.address, callData: allowancePayload },
        ]);

        if (!res[0].success) {
            // if there was a revert reason decoding will throw it
            tokenContract.interface.decodeFunctionResult('permit', res[0].returnData)
            throw new Error('PERMIT_CALL_FAILED')
        }
        return ethers.BigNumber.from(res[1].returnData);
    }

    async testDomain(tmpResult, token, testName, domain) {
        if (!domain) return;

        if (tmpResult.domainSeparator && this.TypedDataEncoder.hashDomain(domain) !== tmpResult.domainSeparator) {
            tmpResult.logs.push(`${testName}: Unrecognized domain separator `);
        }

        const spender = '0x'+'a'.repeat(40);
        const value = ethers.utils.parseEther('1.23');
        const nonce = tmpResult.nonce;

        let contract;
        // are you EIP2612?
        try {
            contract = new ethers.Contract(token, ABI_PERMIT, this.signer)
            const deadline = ethers.constants.MaxUint256;

            const rawSignature = await this.signTypedData(domain, TYPES_PERMIT, {
                owner: this.signer.address,
                spender,
                value,
                nonce,
                deadline,
            });

            const { r, s, v } = ethers.utils.splitSignature(rawSignature);

            const permitPayload =  contract.interface.encodeFunctionData('permit', [this.signer.address, spender, value, deadline, v, r, s]);
            const allowance = await this.multicallPermit(contract, this.signer.address, spender, permitPayload);

            if (allowance.eq(value)) {
                tmpResult.permitType = 'EIP2612';
                tmpResult.domain = domain;
                return;
            } else {
                tmpResult.logs.push(`${testName}: EIP2612 allowance doesn't match value`);
            }
        } catch (e) {
            if (!e.message.includes('PERMIT_CALL_FAILED')) {
                tmpResult.logs.push(`${testName}: EIP2612 error: ${e}`);
                tmpResult.unexpectedError = true;
            }
        }

        // are you packed signature?
        try {
            contract = new ethers.Contract(token, ABI_PERMIT_PACKED, this.signer)
            const deadline = ethers.constants.MaxUint256;

            const rawSignature = await this.signTypedData(domain, TYPES_PERMIT, {
                owner: this.signer.address,
                spender,
                value,
                nonce,
                deadline,
            });

            const permitPayload = contract.interface.encodeFunctionData('permit', [this.signer.address, spender, value, deadline, rawSignature]);
            const allowance = await this.multicallPermit(contract, this.signer.address, spender, permitPayload);

            if (allowance.eq(value)) {
                tmpResult.permitType = 'Packed';
                tmpResult.domain = domain;
                return;
            } else {
                tmpResult.logs.push(`${testName}: Packed type allowance doesn't match value`);
            }
        } catch (e) {
            if (!e.message.includes('PERMIT_CALL_FAILED')) {
                tmpResult.logs.push(`${testName}: Packed type error: ${e}`);
                tmpResult.unexpectedError = true;
            }
        }

        // are you `allowed` type permit?
        try {
            contract = new ethers.Contract(token, ABI_PERMIT_ALLOWED, this.signer)
            const expiry = ethers.constants.MaxUint256;

            const rawSignature = await this.signTypedData(domain, TYPES_PERMIT_ALLOWED, {
                holder: this.signer.address,
                spender,
                nonce,
                expiry,
                allowed: true,
            });

            const { r, s, v } = ethers.utils.splitSignature(rawSignature);

            const permitPayload =  contract.interface.encodeFunctionData('permit', [this.signer.address, spender, nonce, expiry, true, v, r, s]);
            let allowance = await this.multicallPermit(contract, this.signer.address, spender, permitPayload);
            allowance = ethers.BigNumber.from(allowance);

            if (allowance.eq(ethers.constants.MaxUint256)) {
                tmpResult.permitType = 'Allowed';
                tmpResult.domain = domain;
                return;
            } else {
                tmpResult.logs.push(`${testName}: Allowed type allowance is not max uint`);
            }
        } catch (e) {
            if (!e.message.includes('PERMIT_CALL_FAILED')) {
                tmpResult.logs.push(`${testName}: Allowed type error: ${e}`);
                tmpResult.unexpectedError = true;
            }
        }
    }

    async detectToken(token, curatedList = {}) {
        const tmpResult = { logs: [] };

        if (curatedList[token] === 'not supported' || curatedList[token] === 'non-standard') return tmpResult;

        let contract = new ethers.Contract(token, ABI_PERMIT, this.signer)
        try {
            tmpResult.typeHash = await contract.PERMIT_TYPEHASH();
            tmpResult.typeHash = {[PERMIT_TYPE_HASH]: 'EIP2612', [PERMIT_ALLOWED_TYPE_HASH]: 'Allowed'}[tmpResult.typeHash] || tmpResult.typeHash;
        } catch {}

        try {
            tmpResult.domainSeparator = await contract.DOMAIN_SEPARATOR();
        } catch {
            tmpResult.logs.push('No DOMAIN_SEPARATOR');
        }

        try {
            tmpResult.nonce = await contract.nonces(this.signer.address);
        } catch (e) {
            tmpResult.logs.push(`Nonces call failed ${e}`);
            return tmpResult;
        }

        if (curatedList[token]) await this.testDomain(tmpResult, token, 'NON-STANDARD', curatedList[token].domain);
        if (tmpResult.permitType) return tmpResult;

        let version = "1";
        try {
            version = await contract.version();
        } catch {}

        let contractName = await contract.name();
        let symbol = await contract.symbol();

        await this.testDomain(tmpResult, token, 'FULL', {
            name: contractName,
            version,
            chainId: CHAIN_ID,
            verifyingContract: token,
        });

        await this.testDomain(tmpResult, token, 'SYMBOL FOR NAME', {
            name: symbol,
            version,
            chainId: CHAIN_ID,
            verifyingContract: token,
        });

        if (tmpResult.permitType) return tmpResult;

        await this.testDomain(tmpResult, token, 'VERSION 2', {
            name: contractName,
            version: '2',
            chainId: CHAIN_ID,
            verifyingContract: token,
        });

        if (tmpResult.permitType) return tmpResult;

        await this.testDomain(tmpResult, token, 'NO VERSION', {
            name: contractName,
            chainId: CHAIN_ID,
            verifyingContract: token,
        });

        if (tmpResult.permitType) return tmpResult;

        await this.testDomain(tmpResult, token, 'VERSION 1.0', {
            name: contractName,
            chainId: CHAIN_ID,
            version: "1.0",
            verifyingContract: token,
        });

        if (tmpResult.permitType) return tmpResult;

        await this.testDomain(tmpResult, token, 'NO VERSION NO NAME', {
            chainId: CHAIN_ID,
            verifyingContract: token,
        });

        return tmpResult;
    };

    async detectList(curatedList = {}, tokenList, filePath, batchSize) {
        const errorsPath = './detect-permit-errors.log';

        const counts = { yes: 0, no: 0, error: 0 };
        fs.writeFileSync(errorsPath, '');

        for (let batch of chunk(tokenList.tokens, batchSize)) {
            await Promise.all(batch.map(async token => {
                const result = await this.detectToken(token.address, curatedList);
                if (result.permitType) {
                    console.log(`${token.symbol}: DETECTED ${result.permitType}`);
                    token.extensions = {
                        permit: {
                            type: result.permitType,
                            domain: result.domain,
                        },
                    };
                    fs.writeFileSync(filePath, JSON.stringify(tokenList, null, 2));
                    counts.yes++;
                    return;
                }

                if (!result.domainSeparator && !result.typeHash && !result.unexpectedError) {
                    console.log(`${token.symbol}: not detected`);
                    counts.no++;
                    return;
                }

                if (result.logs.some(l => l.includes('SERVER_ERROR')) && !token.retry) {
                    console.log(token.symbol + ": RETRYING ~~~~~~~~ ")
                    token.retry = true;
                    tokenList.tokens.push(token);
                    return;
                }

                const error = {
                    token: token.symbol,
                    address: token.address,
                    result,
                };

                console.log('ERROR', error);
                fs.appendFileSync(errorsPath, JSON.stringify(error, null, 2) + '\n\n\n');
                counts.error++;
            }));
        }
        return counts;
    };
};
