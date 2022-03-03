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
const nonStandardTokens = require('../../curated/nonStandardPermits');

const provider = new ethers.providers.JsonRpcProvider(process.env.JSON_RPC_URL);
const signer = ethers.Wallet.createRandom().connect(provider);

const detectToken = async (token) => {
    const signTypedData = signer._signTypedData
        ? signer._signTypedData.bind(signer)
        : signer.signTypedData.bind(signer);
    const TypedDataEncoder = ethers.utils._TypedDataEncoder || ethers.utils.TypedDataEncoder;

    const multicall2Contract = new ethers.Contract(
        MULTICALL2_ADDRESS,
        MULTICALL2_ABI,
        signer,
    )

    const spender = '0x'+'a'.repeat(40);
    const value = ethers.utils.parseEther('1.23');

    const result = { logs: [] };

    const multicallPermit = async (tokenContract, owner, spender, permitPayload) => {
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

    const testDomain = async (testName, domain) => {
        if (!domain) return;

        if (result.domainSeparator && TypedDataEncoder.hashDomain(domain) !== result.domainSeparator) {
            result.logs.push(`${testName}: Unrecognized domain separator `);
        }

        let contract;
        // are you EIP2612?
        try {
            contract = new ethers.Contract(token, ABI_PERMIT, signer)
            const deadline = ethers.constants.MaxUint256;

            const rawSignature = await signTypedData(domain, TYPES_PERMIT, {
                owner: signer.address,
                spender,
                value,
                nonce,
                deadline,
            });

            const { r, s, v } = ethers.utils.splitSignature(rawSignature);

            const permitPayload =  contract.interface.encodeFunctionData('permit', [signer.address, spender, value, deadline, v, r, s]);
            const allowance = await multicallPermit(contract, signer.address, spender, permitPayload);

            if (allowance.eq(value)) {
                result.permitType = 'EIP2612';
                result.domain = domain;
                return;
            } else {
                result.logs.push(`${testName}: EIP2612 allowance doesn't match value`);
            }
        } catch (e) {
            if (!e.message.includes('PERMIT_CALL_FAILED')) {
                result.logs.push(`${testName}: EIP2612 error: ${e}`);
                result.unexpectedError = true;
            }
        }

        // are you packed signature?
        try {
            contract = new ethers.Contract(token, ABI_PERMIT_PACKED, signer)
            const deadline = ethers.constants.MaxUint256;

            const rawSignature = await signTypedData(domain, TYPES_PERMIT, {
                owner: signer.address,
                spender,
                value,
                nonce,
                deadline,
            });

            const permitPayload = contract.interface.encodeFunctionData('permit', [signer.address, spender, value, deadline, rawSignature]);
            const allowance = await multicallPermit(contract, signer.address, spender, permitPayload);

            if (allowance.eq(value)) {
                result.permitType = 'Packed';
                result.domain = domain;
                return;
            } else {
                result.logs.push(`${testName}: Packed type allowance doesn't match value`);
            }
        } catch (e) {
            if (!e.message.includes('PERMIT_CALL_FAILED')) {
                result.logs.push(`${testName}: Packed type error: ${e}`);
                result.unexpectedError = true;
            }
        }

        // are you `allowed` type permit?
        try {
            contract = new ethers.Contract(token, ABI_PERMIT_ALLOWED, signer)
            const expiry = ethers.constants.MaxUint256;

            const rawSignature = await signTypedData(domain, TYPES_PERMIT_ALLOWED, {
                holder: signer.address,
                spender,
                nonce,
                expiry,
                allowed: true,
            });

            const { r, s, v } = ethers.utils.splitSignature(rawSignature);

            const permitPayload =  contract.interface.encodeFunctionData('permit', [signer.address, spender, nonce, expiry, true, v, r, s]);
            let allowance = await multicallPermit(contract, signer.address, spender, permitPayload);
            allowance = ethers.BigNumber.from(allowance);

            if (allowance.eq(ethers.constants.MaxUint256)) {
                result.permitType = 'Allowed';
                result.domain = domain;
                return;
            } else {
                result.logs.push(`${testName}: Allowed type allowance is not max uint`);
            }
        } catch (e) {
            if (!e.message.includes('PERMIT_CALL_FAILED')) {
                result.logs.push(`${testName}: Allowed type error: ${e}`);
                result.unexpectedError = true;
            }
        }
    }

    if (nonStandardTokens[token] === 'not supported' || nonStandardTokens[token] === 'non-standard') return result;
    
    let contract;
    contract = new ethers.Contract(token, ABI_PERMIT, signer)
    try {
        result.typeHash = await contract.PERMIT_TYPEHASH();
        result.typeHash = {[PERMIT_TYPE_HASH]: 'EIP2612', [PERMIT_ALLOWED_TYPE_HASH]: 'Allowed'}[result.typeHash] || result.typeHash;
    } catch {};

    try {
        result.domainSeparator = await contract.DOMAIN_SEPARATOR();
    } catch {
        result.logs.push('No DOMAIN_SEPARATOR');
    };

    try {
        nonce = await contract.nonces(signer.address);
    } catch (e) {
        result.logs.push(`Nonces call failed ${e}`);
        return result;
    }


    if (nonStandardTokens[token]) await testDomain('NON-STANDARD', nonStandardTokens[token].domain);
    if (result.permitType) return result;

    let version = "1";
    try {
        version = await contract.version();
    } catch {}

    let contractName = await contract.name();
    let symbol = await contract.symbol();

    await testDomain('FULL', {
        name: contractName,
        version,
        chainId: 1,
        verifyingContract: token,
    });

    await testDomain('SYMBOL FOR NAME', {
        name: symbol,
        version,
        chainId: 1,
        verifyingContract: token,
    });
    
    if (result.permitType) return result;

    await testDomain('VERSION 2', {
        name: contractName,
        version: '2',
        chainId: 1,
        verifyingContract: token,
    });
    
    if (result.permitType) return result;
    
    await testDomain('NO VERSION', {
        name: contractName,
        chainId: 1,
        verifyingContract: token,
    });

    if (result.permitType) return result;

    await testDomain('VERSION 1.0', {
        name: contractName,
        chainId: 1,
        version: "1.0",
        verifyingContract: token,
    });

    if (result.permitType) return result;

    await testDomain('NO VERSION NO NAME', {
        chainId: 1,
        verifyingContract: token,
    });

    return result;
};

const detectList = async (tokenList, filePath, batchSize) => {
    const errorsPath = './detect-permit-errors.log';

    const counts = { yes: 0, no: 0, error: 0 };
    fs.writeFileSync(errorsPath, '');

    for (let batch of chunk(tokenList.tokens, batchSize)) {
        await Promise.all(batch.map(async token => {
            const result = await detectToken(token.address);
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
                result
            }
            console.log('ERROR', error);
            fs.appendFileSync(errorsPath, JSON.stringify(error, null, 2) + '\n\n\n');
            counts.error++;
        }));
    }
    console.log("DETECTED TOTAL:", counts.yes);
    console.log("NO SUPPORT TOTAL:", counts.no);
    console.log("ERRORS TOTAL:", counts.error);
};

module.exports = {
    detectToken,
    detectList,
};
