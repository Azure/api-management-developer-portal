/**
 * This script automates deployments between developer portal instances.
 * In order to run it, you need to:
 * 
 * 1) Clone the api-management-developer-portal repository
 * 2) `npm install` in the root of the project
 * 3) Run this script with a valid combination of arguments
 * 
 * Managed portal command example:
 * node migrate --sourceEndpoint from.management.azure-api.net --destEndpoint to.management.azure-api.net --publishEndpoint to.developer.azure-api.net --sourceToken "SharedAccessSignature integration&2020..." --destToken "SharedAccessSignature integration&2020..."
 * 
 * Auto-publishing is not supported for self-hosted versions, so make sure you publish the portal (for example, locally) and upload the generated static files to your hosting after the migration is completed.
 * 
 * You can specify the SAS tokens directly (via sourceToken and destToken), or you can supply an identifier and key,
 * and the script will generate tokens that expire in 1 hour. (via sourceId, sourceKey, destId, destKey)
 */

// az login
// az login -u <username> -p <password>
// az login --service-principal -u <app-url> -p <password-or-cert> --tenant <tenant>


const { HttpClient, ImporterExporter } = require('./utils.js');


// const yargs = require('yargs')
//     // .example('$0 \
//     //     --publishEndpoint <name.developer.azure-api.net> \
//     //     --sourceEndpoint <name.management.azure-api.net> \
//     //     --sourceToken <token> \
//     //     --destEndpoint <name.management.azure-api.net> \
//     //     --destToken <token>\n', 'Managed')
//     // .example('$0 \
//     //     --sourceEndpoint <name.management.azure-api.net> \
//     //     --sourceToken <token> \
//     //     --destEndpoint <name.management.azure-api.net> \
//     //     --destToken <token>')
//     // .option('sourceEndpoint', {
//     //     type: 'string',
//     //     description: 'The hostname of the management endpoint of the source API Management service',
//     //     example: '<name.management.azure-api.net>',
//     //     demandOption: true
//     // })
//     // .option('sourceId', {
//     //     type: 'string',
//     //     description: 'The management API identifier',
//     //     implies: 'sourceKey',
//     //     conflicts: 'sourceToken'
//     // })
//     // .option('sourceKey', {
//     //     type: 'string',
//     //     description: 'The management API key (primary or secondary)',
//     //     implies: 'sourceId',
//     //     conflicts: 'sourceToken'
//     // })
//     // .option('sourceToken', {
//     //     type: 'string',
//     //     description: 'A SAS token for the source portal',
//     //     example: 'SharedAccessSignature…',
//     //     conflicts: ['sourceId, sourceToken']
//     // })
//     // .option('destEndpoint', {
//     //     type: 'string',
//     //     description: 'The hostname of the management endpoint of the destination API Management service',
//     //     example: '<name.management.azure-api.net>',
//     //     demandOption: true
//     // })
//     // .option('destId', {
//     //     type: 'string',
//     //     description: 'The management API identifier',
//     //     implies: 'destKey',
//     //     conflicts: 'destToken'
//     // })
//     // .option('destKey', {
//     //     type: 'string',
//     //     description: 'The management API key (primary or secondary)',
//     //     implies: 'destId',
//     //     conflicts: 'destToken'
//     // })
//     // .option('destToken', {
//     //     type: 'string',
//     //     example: 'SharedAccessSignature…',
//     //     description: 'A SAS token for the destination portal',
//     //     conflicts: ['destId, destToken']
//     // })
//     // .argv;


const yargs = require('yargs')
    .example('$0 \
        --subscriptionId <bla bla> \
        --resourceGroupName <MyResourceGroup> \
        --serviceName <myservice>\n')
    .option('sourceSubscriptionId', {
        type: 'string',
        description: 'Azure subscription ID.',
        example: '<bla bla>',
        demandOption: true
    })
    .option('sourceResourceGroupName', {
        type: 'string',
        description: 'Azure resource group name.'
    })
    .option('sourceServiceName', {
        type: 'string',
        description: 'API Management service name.',
    })
    .option('destSubscriptionId', {
        type: 'string',
        description: 'Azure subscription ID.',
        example: '<bla bla>',
        demandOption: true
    })
    .option('destResourceGroupName', {
        type: 'string',
        description: 'Azure resource group name.'
    })
    .option('destServiceName', {
        type: 'string',
        description: 'API Management service name.',
    })
    .argv;

async function migrate() {
    // const sourceManagementApiEndpoint = yargs.sourceEndpoint;
    // const sourceManagementApiAccessToken = await getTokenOrThrow(yargs.sourceToken, yargs.sourceId, yargs.sourceKey);

    // const destManagementApiEndpoint = yargs.destEndpoint;
    // const destManagementApiAccessToken = await getTokenOrThrow(yargs.destToken, yargs.destId, yargs.destKey);

    // // the rest of this mirrors migrate.bat, but since we're JS, we're platform-agnostic.
    // const snapshotFolder = '../dist/snapshot';

    // // capture the content of the source portal
    // await capture(sourceManagementApiEndpoint, sourceManagementApiAccessToken, snapshotFolder);

    // // remove all content of the target portal
    // await cleanup(destManagementApiEndpoint, destManagementApiAccessToken);

    // // upload the content of the source portal
    // await generate(destManagementApiEndpoint, destManagementApiAccessToken, snapshotFolder);

    // await publish(destManagementApiEndpoint, destManagementApiAccessToken);

    const sourceHttpClient = new HttpClient(yargs.sourceSubscriptionId, yargs.sourceResourceGroupName, yargs.sourceServiceName);
    const sourceImporterExporter = new ImporterExporter(sourceHttpClient);
    await sourceImporterExporter.export();

    const destHttpClient = new HttpClient(yargs.destSubscriptionId, yargs.destResourceGroupName, yargs.destServiceName);
    const destIimporterExporter = new ImporterExporter(destHttpClient);
    await destIimporterExporter.cleanup();
    await destIimporterExporter.import();

    // await publish(destManagementApiEndpoint, destManagementApiAccessToken);
}

migrate()
    .then(() => {
        console.log("DONE");
        process.exit(0);
    })
    .catch(error => {
        console.error(error);
        process.exit(1);
    });