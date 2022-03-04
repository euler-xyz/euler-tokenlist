const { ethers } = require('ethers');
require('dotenv').config();
const { chunk } = require('lodash');

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

module.exports = class PermitDetector {
    constructor(chainId, withLogs = false) {
        this.chainId = chainId;
        this.withLogs = withLogs;

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
        );

        const allowancePayload = tokenContract.interface.encodeFunctionData('allowance', [owner, spender]);

        const res = await multicall2Contract.callStatic.tryAggregate(false, [
            { target: tokenContract.address, callData: permitPayload },
            { target: tokenContract.address, callData: allowancePayload },
        ]);

        if (!res[0].success) {
            // if there was a revert reason decoding will throw it
            tokenContract.interface.decodeFunctionResult('permit', res[0].returnData);
            throw new Error('PERMIT_CALL_FAILED');
        }
        return ethers.BigNumber.from(res[1].returnData);
    }

    async testDomain(tmpResult, token, testName, domain) {
        if (!domain) return;

        if (tmpResult.domainSeparator && this.TypedDataEncoder.hashDomain(domain) !== tmpResult.domainSeparator) {
            tmpResult.logs.push(`${testName}: Unrecognized domain separator`);
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
                tmpResult.permitType = 'PACKED';
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
                tmpResult.permitType = 'ALLOWED';
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

        let contract = new ethers.Contract(token, ABI_PERMIT, this.signer);
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
        } catch(e1) {
            try {
                tmpResult.nonce = await contract._nonces(this.signer.address);
                tmpResult.variant = 'UNDERSCORE_NONCES';
            } catch(e2) {
                tmpResult.logs.push(`Nonces call failed ${e1} ${e2}`);
                return tmpResult;
            }
        }

        if (curatedList[token]) await this.testDomain(tmpResult, token, 'CURATED', curatedList[token].domain);
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
            chainId: this.chainId,
            verifyingContract: token,
        });

        await this.testDomain(tmpResult, token, 'SYMBOL FOR NAME', {
            name: symbol,
            version,
            chainId: this.chainId,
            verifyingContract: token,
        });

        if (tmpResult.permitType) return tmpResult;

        await this.testDomain(tmpResult, token, 'VERSION 2', {
            name: contractName,
            version: '2',
            chainId: this.chainId,
            verifyingContract: token,
        });

        if (tmpResult.permitType) return tmpResult;

        await this.testDomain(tmpResult, token, 'NO VERSION', {
            name: contractName,
            chainId: this.chainId,
            verifyingContract: token,
        });

        if (tmpResult.permitType) return tmpResult;

        await this.testDomain(tmpResult, token, 'VERSION 1.0', {
            name: contractName,
            chainId: this.chainId,
            version: "1.0",
            verifyingContract: token,
        });

        if (tmpResult.permitType) return tmpResult;

        await this.testDomain(tmpResult, token, 'NO VERSION NO NAME', {
            chainId: this.chainId,
            verifyingContract: token,
        });

        return tmpResult;
    }

    async verifyToken(list, token) {
        const currentToken = list.tokens.find(t => t.address.toLowerCase() === token.address.toLowerCase());

        if (currentToken && currentToken.extensions && currentToken.extensions.permit) {
            let contract = new ethers.Contract(token.address, ABI_PERMIT, this.signer);

            const result = { logs: [] };
            try {
                if (currentToken.extensions.permit.variant === 'UNDERSCORE_NONCE') {
                    result.nonce = await contract._nonces(this.signer.address);
                    result.variant = 'UNDERSCORE_NONCE';
                } else {
                    result.nonce = await contract.nonces(this.signer.address);
                }
            } catch (e) {
                result.unexpectedError = true;
                result.logs.push(`VERIFY nonces call failed ${e}`);
            }
            await this.testDomain(result, token.address, 'VERIFY', currentToken.extensions.permit.domain);
            return result;
        }
    }

    async detectList(curatedList = {}, currentList, tokenList, batchSize) {
        const counts = { yes: 0, no: 0, error: 0 };
        const retryList = [];
        const errors = [];

        const processList = async (list, isRetry) => {
            for (let batch of chunk(list, batchSize)) {
                await Promise.all(batch.map(async token => {
                    let result = await this.verifyToken(currentList, token);

                    if (result && result.permitType) {
                        result.verified = true
                    } else {
                        result = await this.detectToken(token.address, curatedList);
                    }

                    if (result.permitType) {
                        this.log(`${token.symbol}: ${result.verified ? 'VERIFIED' : 'DETECTED'} ${result.permitType} ${result.variant || ''}`);
                        token.extensions = {
                            permit: {
                                type: result.permitType,
                                domain: result.domain,
                            },
                        };
                        if (result.variant) {
                            token.extensions.permit.variant = result.variant;
                        }
                        counts.yes++;
                        return;
                    }

                    if (!result.domainSeparator && !result.typeHash && !result.unexpectedError) {
                        this.log(`${token.symbol}: not detected`);
                        counts.no++;
                        return;
                    }

                    if (!isRetry && result.logs.some(l => l.includes('SERVER_ERROR'))) {
                        retryList.push(token);
                        return;
                    }

                    const error = {
                        token: token.symbol,
                        address: token.address,
                        result,
                    };

                    this.log('ERROR', error);
                    errors.push(error);
                    counts.error++;
                }));
            }
        }

        await processList(tokenList.tokens);
        if (retryList.length) {
            this.log(`RETRYING ${retryList.length}`)
            await processList(retryList, true);
        }

        return {
            counts,
            processedList: tokenList,
            errors,
        };
    }

    log(...args) {
        if (this.withLogs) console.log(...args);
    }
}

