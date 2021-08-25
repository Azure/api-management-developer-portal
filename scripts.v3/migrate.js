/**
 * This script automates deployments between developer portal instances.
 * In order to run it, you need to:
 * 
 * 1) Clone the api-management-developer-portal repository:
 *    git clone https://github.com/Azure/api-management-developer-portal.git
 * 
 * 2) Install NPM  packages:
 *    npm install
 * 
 * 3) Run this script with a valid combination of arguments:
 *    node ./migrate ^
 *    --sourceSubscriptionId "< your subscription ID >" ^
 *    --sourceResourceGroupName "< your resource group name >" ^
 *    --sourceServiceName "< your service name >" ^
 *    --sourceTenantId "< optional (needed if source and destination is in different subscription) source tenant ID >" ^
 *    --sourceServicePrincipal "< optional (needed if source and destination is in different subscription) source service principal or user name. >" ^
 *    --sourceServicePrincipalSecret "< optional (needed if source and destination is in different subscription) secret or password for service principal or az login for the source apim. >" ^
 *    --destSubscriptionId "< your subscription ID >" ^
 *    --destResourceGroupName "< your resource group name >" ^
 *    --destServiceName "< your service name >"
 *    --destTenantId "< optional (needed if source and destination is in different subscription) destination tenant ID >"
 *    --destServicePrincipal "< optional (needed if source and destination is in different subscription)destination service principal or user name. >"
 *    --destServicePrincipalSecret "< optional (needed if source and destination is in different subscription) secret or password for service principal or az login for the destination. >"
 * 
 * Auto-publishing is not supported for self-hosted versions, so make sure you publish the portal (for example, locally)
 * and upload the generated static files to your hosting after the migration is completed.
 * 
 * You can specify the SAS tokens directly (via sourceToken and destToken), or you can supply an identifier and key,
 * and the script will generate tokens that expire in 1 hour. (via sourceId, sourceKey, destId, destKey)
 */

const { ImporterExporter } = require('./utils.js');

const yargs = require('yargs')
    .example(`node ./migrate ^ \r
    *    --sourceSubscriptionId "< your subscription ID > \r
    *    --sourceResourceGroupName "< your resource group name > \r
    *    --sourceServiceName "< your service name > \r
    *    --sourceTenantId "< optional (needed if source and destination is in different subscription) source tenant ID > \r
    *    --sourceServicePrincipal "< optional (needed if source and destination is in different subscription) source service principal or user name. > \r
    *    --sourceServicePrincipalSecret "< optional (needed if source and destination is in different subscription) secret or password for service principal or az login for the source apim. > \r
    *    --destSubscriptionId "< your subscription ID > \r
    *    --destResourceGroupName "< your resource group name > \r
    *    --destServiceName "< your service name > \r
    *    --destTenantId "< optional (needed if source and destination is in different subscription) destination tenant ID > \r
    *    --destServicePrincipal "< optional (needed if source and destination is in different subscription) destination service principal or user name. > \r
    *    --destServicePrincipalSecret "< optional (needed if source and destination is in different subscription) secret or password for service principal or az login for the destination. >\n`)
    .option('sourceSubscriptionId', {
        type: 'string',
        description: 'Azure subscription ID.',
        demandOption: true
    })
    .option('sourceResourceGroupName', {
        type: 'string',
        description: 'Azure resource group name.',
        demandOption: true
    })
    .option('sourceServiceName', {
        type: 'string',
        description: 'API Management service name.',
        demandOption: true
    })
    .option('sourceTenantId', {
        type: 'string',
        description: 'source tenant ID.',
        demandOption: false
    })
    .option('sourceServicePrincipal', {
        type: 'string',
        description: 'source service principal ID.',
        demandOption: false
    })
    .option('sourceServicePrincipalSecret', {
        type: 'string',
        description: 'source service principal secret.',
        demandOption: false
    })
    .option('destSubscriptionId', {
        type: 'string',
        description: 'Azure subscription ID.',
        demandOption: true
    })
    .option('destResourceGroupName', {
        type: 'string',
        description: 'Azure resource group name.',
        demandOption: true
    })
    .option('destServiceName', {
        type: 'string',
        description: 'API Management service name.',
        demandOption: true
    })
    .option('destTenantId', {
        type: 'string',
        description: ' destination tenantId.',
        demandOption: false
    })
    .option('destServicePrincipal', {
        type: 'string',
        description: 'destination service principal or user name.',
        demandOption: false
    })
    .option('destServicePrincipalSecret', {
        type: 'string',
        description: 'destination service principal secret.',
        demandOption: false
    })
    .help()
    .argv;

async function migrate() {
    try {
        const sourceImporterExporter = new ImporterExporter(yargs.sourceSubscriptionId, yargs.sourceResourceGroupName, yargs.sourceServiceName, yargs.sourceTenantId, yargs.sourceServicePrincipal, yargs.sourceServicePrincipalSecret);
        await sourceImporterExporter.export();

        const destImporterExporter = new ImporterExporter(yargs.destSubscriptionId, yargs.destResourceGroupName, yargs.destServiceName, yargs.destTenantId, yargs.destServicePrincipal, yargs.destServicePrincipalSecret);
        await destImporterExporter.cleanup();
        await destImporterExporter.import();

        await destImporterExporter.publish();
    } 
    catch (error) {
        throw new Error(`Unable to complete migration. ${error.message}`);
    }
}

migrate()
    .then(() => {
        console.log("DONE");
        process.exit(0);
    })
    .catch(error => {
        console.error(error.message);
        process.exit(1);
    });