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
 *    --sourceTenantid "< optional (needed if source and destination is in different subscription) source tenant id >" ^
 *    --sourceServiceprincipal "< optional (needed if source and destination is in different subscription) source serviceprincipal or user name. >" ^
 *    --sourceSecret "< optional (needed if source and destination is in different subscription) secret or password for service principal or az login for the source apim. >" ^
 *    --destSubscriptionId "< your subscription ID >" ^
 *    --destResourceGroupName "< your resource group name >" ^
 *    --destServiceName "< your service name >"
 *    --destTenantid "< optional (needed if source and destination is in different subscription) destination tenantid >"
 *    --destServiceprincipal "< optional (needed if source and destination is in different subscription)destination serviceprincipal or user name. >"
 *    --destSecret "< optional (needed if source and destination is in different subscription) secret or password for service principal or az login for the destination. >"
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
    *    --sourceTenantid "< optional (needed if source and destination is in different subscription) source tenant id > \r
    *    --sourceServiceprincipal "< optional (needed if source and destination is in different subscription) source serviceprincipal or user name. > \r
    *    --sourceSecret "< optional (needed if source and destination is in different subscription) secret or password for service principal or az login for the source apim. > \r
    *    --destSubscriptionId "< your subscription ID > \r
    *    --destResourceGroupName "< your resource group name > \r
    *    --destServiceName "< your service name > \r
    *    --destTenantid "< optional (needed if source and destination is in different subscription) destination tenantid > \r
    *    --destServiceprincipal "< optional (needed if source and destination is in different subscription) destination serviceprincipal or user name. > \r
    *    --destSecret "< optional (needed if source and destination is in different subscription) secret or password for service principal or az login for the destination. >\n`)
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
    .option('sourceTenantid', {
        type: 'string',
        description: 'source tenantid.',
        demandOption: false
    })
    .option('sourceServiceprincipal', {
        type: 'string',
        description: 'source serviceprincipal or user name.',
        demandOption: false
    })
    .option('sourceSecret', {
        type: 'string',
        description: 'secret or password for service principal or az login for the source apim.',
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
    .option('destTenantid', {
        type: 'string',
        description: ' destination tenantid.',
        demandOption: false
    })
    .option('destServiceprincipal', {
        type: 'string',
        description: 'destination serviceprincipal or user name.',
        demandOption: false
    })
    .option('destSecret', {
        type: 'string',
        description: 'secret or password for service principal or az login for the destination.',
        demandOption: false
    })
    .help()
    .argv;

async function migrate() {
    try {
        const sourceImporterExporter = new ImporterExporter(yargs.sourceSubscriptionId, yargs.sourceResourceGroupName, yargs.sourceServiceName, yargs.sourceTenantid, yargs.sourceServiceprincipal, yargs.sourceSecret);
        await sourceImporterExporter.export();

        const destIimporterExporter = new ImporterExporter(yargs.destSubscriptionId, yargs.destResourceGroupName, yargs.destServiceName, yargs.destTenantid, yargs.destServiceprincipal, yargs.destSecret);
        await destIimporterExporter.cleanup();
        await destIimporterExporter.import();
        await destIimporterExporter.publish();
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
