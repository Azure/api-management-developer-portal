const { ImporterExporter } = require("./utils");

const yargs = require('yargs')
    .example(`node ./capture ^ \r
    --subscriptionId "< your subscription ID >" ^ \r
    --resourceGroupName "< your resource group name >" ^ \r
    --serviceName "< your service name >"\n`)
    .option('subscriptionId', {
        type: 'string',
        description: 'Azure subscription ID.',
        demandOption: true
    })
    .option('resourceGroupName', {
        type: 'string',
        description: 'Azure resource group name.',
        demandOption: true
    })
    .option('serviceName', {
        type: 'string',
        description: 'API Management service name.',
        demandOption: true
    })
    .argv;

async function capture() {
    const importerExporter = new ImporterExporter(
        yargs.subscriptionId,
        yargs.resourceGroupName,
        yargs.serviceName
    );

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