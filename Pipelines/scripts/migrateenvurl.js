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

const { UpdateUrl } = require('./utilsupdateurl.js');

const yargs = require('yargs')
    .example(`node ./migrate ^ \r
    *    --existingEnvUrls "< optional (urls used in the developer portal from source apim to replace - if we have multiple urls then comma separated values to be given.) > \r
    *    --destEnvUrls "< optional (urls to be replaced in the developer portal in destination apim in same order - if we have multiple urls then comma separated values to be given.) > \r
    *    --destSubscriptionId "< your subscription ID > \r
    *    --destResourceGroupName "< your resource group name > \r
    *    --destServiceName "< your service name > \r
    *    --destTenantid "< optional (needed if source and destination is in different subscription) destination tenantid > \r
    *    --destServiceprincipal "< optional (needed if source and destination is in different subscription) destination serviceprincipal or user name. > \r
    *    --destSecret "< optional (needed if source and destination is in different subscription) secret or password for service principal or az login for the destination. >\n`)
    .option('existingEnvUrls', {
        type: 'string',
        description: '(urls used in the developer portal from source apim to replace - if we have multiple urls then comma separated values to be given.).',
        demandOption: true
    })
    .option('destEnvUrls', {
        type: 'string',
        description: 'urls to be replaced in the developer portal in destination apim in same order - if we have multiple urls then comma separated values to be given.',
        demandOption: true
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
        const destIUpdateUrl = new UpdateUrl(yargs.destSubscriptionId, yargs.destResourceGroupName, yargs.destServiceName, yargs.destTenantid, yargs.destServiceprincipal, yargs.destSecret);
        await destIUpdateUrl.updateContentUrl(yargs.existingEnvUrls.split(','), yargs.destEnvUrls.split(','));
    
    }
    catch (error) {
        throw new Error(`Unable to complete url migration. ${error.message}`);
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
