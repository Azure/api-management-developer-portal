/**
 * This script add the Google Tag Manager (GTM) configuration to the API Management developer portal and publishes it.
 * In order to run it, you need to:
 * 
 * 1) Clone the api-management-developer-portal repository:
 *    git clone https://github.com/Azure/api-management-developer-portal.git
 * 
 * 2) Install NPM  packages:
 *    npm install
 * 
 * 3) Run this script with a valid combination of arguments:
 *    node ./gtm ^
 *   --subscriptionId < your subscription ID > ^
 *   --resourceGroupName < your resource group name > ^
 *   --serviceName < your service name > ^
 *   --gtmContainerId < gtm container ID >
 */

 const { ImporterExporter } = require("./utils");
 
 const yargs = require('yargs')
     .example(`node ./generate ^ \r
     --subscriptionId "< your subscription ID >" ^ \r
     --resourceGroupName "< your resource group name >" ^ \r
     --serviceName "< your service name >"\r
     --gtmContainerId "< gtm container ID >"\n`)
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
     .option('gtmContainerId', {
         type: 'string',
         description: 'The Google Tag Manager container ID',
         example: 'UA-XXXXXXX-X',
         demandOption: true
     })
     .help()
     .argv;
 
 async function gtm() {   
     const importerExporter = new ImporterExporter(
         yargs.subscriptionId,
         yargs.resourceGroupName,
         yargs.serviceName,
         null,
         null,
         null,
         null,
     );
 
     await importerExporter.gtm(yargs.gtmContainerId);

     await importerExporter.publish();
 }
 
 gtm()
     .then(() => {
         console.log("DONE");
         process.exit(0);
     })
     .catch(error => {
         console.error(error.message);
         process.exit(1);
     });
 
 
 module.exports = {
     gtm
 }
 