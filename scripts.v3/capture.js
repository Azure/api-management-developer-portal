const { HttpClient, ImporterExporter } = require("./utils");

const yargs = require('yargs')
    .example('$0 \
        --subscriptionId <bla bla> \
        --resourceGroupName <MyResourceGroup> \
        --serviceName <myservice>\n')
    .option('subscriptionId', {
        type: 'string',
        description: 'Azure subscription ID.',
        example: '<bla bla>',
        demandOption: true
    })
    .option('resourceGroupName', {
        type: 'string',
        description: 'Azure resource group name.'
    })
    .option('serviceName', {
        type: 'string',
        description: 'API Management service name.',
    })
    .argv;

async function capture() {
    const subscriptionId = yargs.subscriptionId;
    const resourceGroupName = yargs.resourceGroupName;
    const serviceName = yargs.serviceName;
    const httpClient = new HttpClient(subscriptionId, resourceGroupName, serviceName);
    const importerExporter = new ImporterExporter(httpClient);

    await importerExporter.export();
}

capture()
    .then(() => {
        console.log("DONE");
        process.exit(0);
    })
    .catch(error => {
        console.error(error);
        process.exit(1);
    });


module.exports = {
    capture
}