/**
 * This script automates deleting the content of API Management developer portals.
 * In order to run it, you need to:
 * 
 * 1) Clone the api-management-developer-portal repository:
 *    git clone https://github.com/Azure/api-management-developer-portal.git
 * 
 * 2) Install NPM  packages:
 *    npm install
 * 
 * 3) Run this script with a valid combination of arguments:
 *    node ./cleanup ^
 *    --sourceSubscriptionId "< your subscription ID >" ^
 *    --sourceResourceGroupName "< your resource group name >" ^
 *    --sourceServiceName "< your service name >" ^
 *    --destSubscriptionId "< your subscription ID >" ^
 *    --destResourceGroupName "< your resource group name >" ^
 *    --destServiceName "< your service name >"
 */

/*
* 12.18.2025 - Added below arguments to align with migrate.js
*    --TenantId "< optional (needed if tenant ID is different > \r
*    --ServicePrincipal "< optional service principal or user name. > \r
*    --ServicePrincipalSecret "< optional secret or password for service principal or az login for the destination. >\n`)
*/

const { ImporterExporter } = require("./utils");

const yargs = require('yargs')
    .example(`node ./cleanup ^ \r
    --subscriptionId "< your subscription ID >" ^ \r
    --resourceGroupName "< your resource group name >" ^ \r
    --serviceName "< your service name >"\n`)
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
    .option('tenantId', {
        type: 'string',
        description: 'Azure tenant ID (optional, required if different from your default tenant).',
        demandOption: false
    })
    .option('servicePrincipal', {
        type: 'string',
        description: 'service principal or user name.',
        demandOption: false
    })
    .option('servicePrincipalSecret', {
        type: 'string',
        description: 'service principal secret.',
        demandOption: false
    })
    .help()
    .argv;

async function cleanup() {
    const importerExporter = new ImporterExporter(
        yargs.subscriptionId,
        yargs.resourceGroupName,
        yargs.serviceName,
        yargs.tenantId,
        yargs.servicePrincipal,
        yargs.servicePrincipalSecret
    );

    await importerExporter.cleanup();
}

cleanup()
    .then(() => {
        console.log("DONE");
        process.exit(0);
    })
    .catch(error => {
        console.error(error.message);
        process.exit(1);
    });

module.exports = {
    cleanup
}
