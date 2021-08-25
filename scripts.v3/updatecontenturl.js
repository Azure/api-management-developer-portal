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
 *    node ./updatecontenturl ^
 *    --destSubscriptionId "< your subscription ID >" ^
 *    --destResourceGroupName "< your resource group name >" ^
 *    --destServiceName "< your service name >"
 *    --destTenantId "< optional (needed if source and destination is in different subscription) destination tenant ID >"
 *    --destServicePrincipal "< optional (needed if source and destination is in different subscription)destination servicePrincipal or user name. >"
 *    --destSecret "< optional (needed if source and destination is in different subscription) secret or password for service principal or az login for the destination. >"
 *    --existingEnvUrls "< optional (urls used in the developer portal from source apim to replace - if we have multiple urls then comma separated values to be given.) >"
 *    --destEnvUrls "< optional (urls to be replaced in the developer portal in destination apim in same order - if we have multiple urls then comma separated values to be given.) >"
 * 
 * Auto-publishing is not supported for self-hosted versions, so make sure you publish the portal (for example, locally)
 * and upload the generated static files to your hosting after the migration is completed.
 * 
 * You can specify the SAS tokens directly (via sourceToken and destToken), or you can supply an identifier and key,
 * and the script will generate tokens that expire in 1 hour. (via sourceId, sourceKey, destId, destKey)
 */

const { ImporterExporter } = require('./utils.js');

const yargs = require('yargs')
    .example(`node ./updatecontenturl ^ \r
    *    --destSubscriptionId "< your subscription ID > \r
    *    --destResourceGroupName "< your resource group name > \r
    *    --destServiceName "< your service name > \r
    *    --destTenantId "< optional (needed if source and destination is in different subscription) destination tenant ID > \r
    *    --destServicePrincipal "< optional (needed if source and destination is in different subscription) destination servicePrincipal or user name. > \r
    *    --destSecret "< optional (needed if source and destination is in different subscription) secret or password for service principal or az login for the destination. >\r 
    *    --existingEnvUrls "< optional (urls used in the developer portal from source apim to replace - if we have multiple urls then comma separated values to be given.) > \r
    *    --destEnvUrls "< optional (urls to be replaced in the developer portal in destination apim in same order - if we have multiple urls then comma separated values to be given.) > \n`)
    
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
        description: ' destination tenant ID.',
        demandOption: false
    })
    .option('destServicePrincipal', {
        type: 'string',
        description: 'destination servicePrincipal or user name.',
        demandOption: false
    })
    .option('destSecret', {
        type: 'string',
        description: 'secret or password for service principal or az login for the destination.',
        demandOption: false
    })
    .option('existingEnvUrls', {
        type: 'string',
        description: 'urls used in the developer portal from source apim to replace - if we have multiple urls then comma separated values to be given.',
        demandOption: false
    })
    .option('destEnvUrls', {
        type: 'string',
        description: 'urls to be replaced in the developer portal in destination apim in same order - if we have multiple urls then comma separated values to be given.',
        demandOption: false
    })
    .help()
    .argv;

async function updatecontenturl() {
    try {
        if (yargs.existingEnvUrls != "" && yargs.destEnvUrls != "") {
            const destIUpdateUrl = new ImporterExporter(yargs.destSubscriptionId, yargs.destResourceGroupName, yargs.destServiceName, yargs.destTenantId, yargs.destServicePrincipal, yargs.destSecret);
            await destIUpdateUrl.updateContentUrl(yargs.existingEnvUrls.split(','), yargs.destEnvUrls.split(','));

            await destIUpdateUrl.publish();
        }
    } catch (error) {
        throw new Error(`Unable to complete content url update. ${error.message}`);
    }
}

updatecontenturl()
    .then(() => {
        console.log("DONE");
        process.exit(0);
    })
    .catch(error => {
        console.error(error.message);
        process.exit(1);
    });