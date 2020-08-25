"use strict"
/**
 * This script applies deployments to a developer portal instance.
 * In order to run it, you need to:
 * 
 * 1) Clone the api-management-developer-portal repository
 * 2) `npm install` in the root of the project
 * 3) Install az-cli (https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)
 * 4) Run this script with a valid combination of arguments
 * 
 * Managed portal command example:
 * node restore --destEndpoint to.management.azure-api.net --publishEndpoint to.developer.azure-api.net --destToken "SharedAccessSignature integration&2020..."   --dataFile d:\apim-portal\great.json --mediaFolder d:\apim-portal\great\
 * 
 * If you run with the --selfHosted flag, you are expected to supply a destStorage parameter.
 * Auto-publishing is not supported for self-hosted versions, so make sure you publish the portal (for example, locally) and upload the generated static files to your hosting after the migration is completed.
 * 
 * You can specify the SAS tokens directly (via destToken), or you can supply an identifier and key,
 * and the script will generate tokens that expire in 1 hour. (via destId, destKey)
 */

const path = require("path");
const execSync = require('child_process').execSync;

const shared = require('./shared');

const yargs = require('yargs')
    .version('1.0.2')
    .example('$0 \
        --publishEndpoint <name.management.azure-api.net> \
        --destEndpoint <name.management.azure-api.net> \
        --destToken <token> \
        --dataFile <filePath> \
        --mediaFolder <folderPath>\n')
    .example('$0 --selfHosted \
        --destEndpoint <name.management.azure-api.net> \
        --destToken <token> \
        --destStorage <connectionString>\
        --dataFile <filePath> \
        --mediaFolder <folderPath>\n')
    .option('selfHosted', {
        alias: 'h',
        type: 'boolean',
        description: 'If the portal is self-hosted',
        implies: 'destStorage'
    })
    .option('publishEndpoint', {
        alias: 'p',
        type: 'string',
        description: 'Endpoint of the destination managed developer portal; if empty, destination portal will not be published; unsupported in self-hosted scenario',
        example: '<name.developer.azure-api.net>'
    })
    .option('destEndpoint', {
        type: 'string',
        description: 'The hostname of the management endpoint of the destination API Management service',
        example: '<name.management.azure-api.net>',
        demandOption: true
    })
    .option('destId', {
        type: 'string',
        description: 'The management API identifier',
        implies: 'destKey',
        conflicts: 'destToken'
    })
    .option('destKey', {
        type: 'string',
        description: 'The management API key (primary or secondary)',
        implies: 'destId',
        conflicts: 'destToken'
    })
    .option('destToken', {
        type: 'string',
        example: 'SharedAccessSignature…',
        description: 'A SAS token for the destination portal',
        conflicts: ['destId, destToken']
    })
    .option('destStorage', {
        type: 'string',
        description: 'The connection string for self-hosted portals',
        example: 'DefaultEndpointsProtocol=…',
        implies: 'selfHosted'
    })
    .option('dataFile', {
        type: 'string',
        description: 'The path to the file which contains the content of the portal except the media files',
        example: '..\dist\data.json',
        demandOption: true
    })
    .option('mediaFolder', {
        type: 'string',
        description: 'The path to the folder which contains the media content of the portal',
        example: '..\dist\content',
        demandOption: true
    })
    .argv;

async function run() {
    const destEndpoint = yargs.destEndpoint;
    const destToken = await shared.getTokenOrThrow(yargs.destToken, yargs.destId, yargs.destKey);
    const destStorage = await shared.getStorageConnectionOrThrow(yargs.destStorage, destEndpoint, destToken);
    const dataFile = yargs.dataFile;
    const mediaFolder = yargs.mediaFolder;
    const publishEndpoint = yargs.publishEndpoint;
    
    const mediaContainer = 'content';
    
    console.log(`Starting restore to ${destEndpoint}.`);

    // remove all content of the target portal (incl. media)
    console.log(`Removing all content at ${destEndpoint}.`);
    execSync(`node ./cleanup ${destEndpoint} "${destToken}" "${destStorage}"`);

    // upload the content of the source portal (excl. media)
    console.log(`Applying data from ${dataFile} to ${destEndpoint}.`);
    execSync(`node ./generate ${destEndpoint} "${destToken}" ${dataFile}`);

    // upload media files to the target portal
    console.log(`Uploading media files from ${mediaFolder} to ${destStorage}.`);
    execSync(`az storage blob upload-batch\
        --source "${mediaFolder}"\
        --destination "${mediaContainer}"\
        --connection-string "${destStorage}"`);

    if (publishEndpoint && !yargs.selfHosted) {
        console.log(`Pulishing portal at ${publishEndpoint}.`);
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        publish(publishEndpoint, destToken);
    } else if (publishEndpoint) {
        console.warn("Auto-publishing self-hosted portal is not supported.");
    }

    console.log(`The restore operation to ${destEndpoint} is finished.`);
}

/**
 * Publishes the content of the specified APIM instance using a SAS token.
 * @param {string} endpoint the publishing endpoint of the destination developer portal instance
 * @param {string} token the SAS token
 */
async function publish(endpoint, token) {
    const options = {
        port: 443,
        method: 'POST',
        headers: {
            'Authorization': token
        }
    };
    
    const url = `https://${endpoint}/publish`;
    
    // returns with literal OK (missing quotes), which is invalid json.
    await shared.request(url, options);
}

run();