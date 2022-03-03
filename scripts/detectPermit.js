const PermitDetector = require('./permitsLib');

const run = async () => {
    const token = process.argv[2];
    if (!token) {
        console.log('No token address provided. See README');
        return;
    }
    const pertmitDetector = new PermitDetector();
    const result = await pertmitDetector.detectToken(token); 

    if (result.permitType) {
        console.log("DETECTED:", result.permitType, 'type');
        console.log(result.domain);
    } else if (!result.domainSeparator && !result.typeHash && !result.unexpectedError) {
        console.log("No permit support detected");
        console.log(result);
    } else {
        console.log("ERROR");
        console.log(result);
    }
};

run().then(() => process.exit());
