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

const moment = require('moment');
const crypto = require('crypto');
const execSync = require('child_process').execSync;
const { request } = require('./utils.js');

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
    try {
        const sourceManagementApiEndpoint = yargs.sourceEndpoint;
        const sourceManagementApiAccessToken = await getTokenOrThrow(yargs.sourceToken, yargs.sourceId, yargs.sourceKey);

        const destManagementApiEndpoint = yargs.destEndpoint;
        const destManagementApiAccessToken = await getTokenOrThrow(yargs.destToken, yargs.destId, yargs.destKey);
        const publishEndpoint = yargs.publishEndpoint;

        // the rest of this mirrors migrate.bat, but since we're JS, we're platform-agnostic.
        const snapshotFolder = '../dist/snapshot';

        // capture the content of the source portal
        execSync(`node ./capture ${sourceManagementApiEndpoint} "${sourceManagementApiAccessToken}" "${snapshotFolder}"`);

        // remove all content of the target portal
        execSync(`node ./cleanup ${destManagementApiEndpoint} "${destManagementApiAccessToken}"`);

        // upload the content of the source portal
        execSync(`node ./generate ${destManagementApiEndpoint} "${destManagementApiAccessToken}" "${snapshotFolder}"`);

        if (publishEndpoint && !yargs.selfHosted) {
            process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
            await publish(publishEndpoint, destManagementApiAccessToken);
        }
        else if (publishEndpoint) {
            console.warn("Auto-publishing self-hosted portal is not supported.");
        }
    }
    catch (error) {
        throw new Error(`Unable to complete migration. ${error.message}`);
    }
}


/**
 * Attempts to get a SAS token in two ways:
 * 1) if the token is explicitly set by the user, use that token.
 * 2) if the id and key are specified, manually generate a SAS token.
 * @param {string} token an optionally specified token
 * @param {string} id the Management API identifier
 * @param {string} key the Management API key
 */
async function getTokenOrThrow(token, id, key) {
    if (token) {
        return token;
    }
    if (id && key) {
        return await generateSASToken(id, key);
    }
    throw Error('You need to specify either: token or id AND key');
}

/**
 * Generates a SAS token from the specified Management API id and key.  Optionally
 * specify the expiry time, in seconds.
 * 
 * See https://docs.microsoft.com/en-us/rest/api/apimanagement/apimanagementrest/azure-api-management-rest-api-authentication#ManuallyCreateToken
 * @param {string} id The Management API identifier.
 * @param {string} key The Management API key (primary or secondary)
 * @param {number} expiresIn The number of seconds in which the token should expire.
 */
async function generateSASToken(id, key, expiresIn = 3600) {
    const now = moment.utc(moment());
    const expiry = now.clone().add(expiresIn, 'seconds');
    const expiryString = expiry.format(`YYYY-MM-DD[T]HH:mm:ss.SSSSSSS[Z]`);

    const dataToSign = `${id}\n${expiryString}`;
    const signedData = crypto.createHmac('sha512', key).update(dataToSign).digest('base64');
    return `SharedAccessSignature uid=${id}&ex=${expiryString}&sn=${signedData}`;
}

/**
 * Publishes the content of the specified APIM instance using a SAS token.
 * @param {string} endpoint the publishing endpoint of the destination developer portal instance
 * @param {string} token the SAS token
 */
async function publish(endpoint, token) {
    try {
        const url = `https://${endpoint}/publish`;

        // returns with literal OK (missing quotes), which is invalid json.
        await request("POST", url, token);
    }
    catch (error) {
        throw new Error(`Unable to schedule website publishing. ${error.message}`);
    }
}

run()
    .then(() => {
        console.log("DONE");
    })
    .catch(error => {
        console.error(error.message);
        process.exitCode = 1;
    });
