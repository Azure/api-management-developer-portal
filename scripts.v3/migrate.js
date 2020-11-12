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


const { sendRequest: request, getTokenOrThrow } = require('./utils.js');
import { capture } from "./capture";
import { cleanup } from "./cleanup";


const yargs = require('yargs')
    .example('$0 \
        --publishEndpoint <name.developer.azure-api.net> \
        --sourceEndpoint <name.management.azure-api.net> \
        --sourceToken <token> \
        --destEndpoint <name.management.azure-api.net> \
        --destToken <token>\n', 'Managed')
    .example('$0 --selfHosted \
        --sourceEndpoint <name.management.azure-api.net> \
        --sourceToken <token> \
        --destEndpoint <name.management.azure-api.net> \
        --destToken <token>')
    /*.option('interactive', {
        alias: 'i',
        type: 'boolean',
        description: 'Whether to use interactive login',
        conflicts: ['sourceToken', 'sourceId', 'sourceKey', 'destToken', 'destId', 'destKey']
    })*/
    .option('selfHosted', {
        alias: 'h',
        type: 'boolean',
        description: 'If the portal is self-hosted'
    })
    .option('publishEndpoint', {
        alias: 'p',
        type: 'string',
        description: 'Endpoint of the destination managed developer portal; if empty, destination portal will not be published; unsupported in self-hosted scenario',
        example: '<name.developer.azure-api.net>'
    })
    .option('sourceEndpoint', {
        type: 'string',
        description: 'The hostname of the management endpoint of the source API Management service',
        example: '<name.management.azure-api.net>',
        demandOption: true
    })
    .option('sourceId', {
        type: 'string',
        description: 'The management API identifier',
        implies: 'sourceKey',
        conflicts: 'sourceToken'
    })
    .option('sourceKey', {
        type: 'string',
        description: 'The management API key (primary or secondary)',
        implies: 'sourceId',
        conflicts: 'sourceToken'
    })
    .option('sourceToken', {
        type: 'string',
        description: 'A SAS token for the source portal',
        example: 'SharedAccessSignature…',
        conflicts: ['sourceId, sourceToken']
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
    .argv;

async function run() {
    const sourceManagementApiEndpoint = yargs.sourceEndpoint;
    const sourceManagementApiAccessToken = await getTokenOrThrow(yargs.sourceToken, yargs.sourceId, yargs.sourceKey);

    const destManagementApiEndpoint = yargs.destEndpoint;
    const destManagementApiAccessToken = await getTokenOrThrow(yargs.destToken, yargs.destId, yargs.destKey);
    const publishEndpoint = yargs.publishEndpoint;

    // the rest of this mirrors migrate.bat, but since we're JS, we're platform-agnostic.
    const snapshotFolder = '../dist/snapshot';

    // capture the content of the source portal
    await capture(sourceManagementApiEndpoint, sourceManagementApiAccessToken, snapshotFolder);

    // remove all content of the target portal
    await cleanup(destManagementApiEndpoint, destManagementApiAccessToken);

    // upload the content of the source portal
    await generate(destManagementApiEndpoint, destManagementApiAccessToken, snapshotFolder);

    if (publishEndpoint && !yargs.selfHosted) {
        await publish(publishEndpoint, destManagementApiAccessToken);
    }
    else if (publishEndpoint) {
        console.warn("Auto-publishing self-hosted portal is not supported.");
    }
}



/**
 * Publishes the content of the specified APIM instance using a SAS token.
 * @param {string} token the SAS token
 */
async function publish(token) {
    const timeStamp = new Date();
    const revision = timeStamp.toISOString().replace(/[\-\:\T]/g, "").substr(0, 14);
    const url = `/portalRevisions/${revision}`;
    const body = {
        description: `Migration from ${sourceManagementApiEndpoint} to ${destManagementApiEndpoint}.`,
        isCurrent: true
    }

    await request("PUT", url, token, body);
}

run()
    .then(() => {
        console.log("DONE");
    })
    .catch(error => {
        console.error(error);
        process.exitCode = 1;
    });
