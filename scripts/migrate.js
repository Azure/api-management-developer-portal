/**
 * Important: this script is no longer maintained. It can automate deployments of self-hosted portals with explicitly-defined Storage Accounts only. Refer to documentation for more details. New scripts are located in the scripts.v2 folder.
 * 
 * This script automates deployments between developer portal instances.
 * In order to run it, you need to:
 * 
 * 1) Clone the api-management-developer-portal repository
 * 2) `npm install` in the root of the project
 * 3) Install az-cli (https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)
 * 4) Run this script with a valid combination of arguments
 * 
 * Managed portal command example:
 * node migrate --sourceEndpoint from.management.azure-api.net --destEndpoint to.management.azure-api.net --publishEndpoint to.developer.azure-api.net --sourceToken "SharedAccessSignature integration&2020..." --destToken "SharedAccessSignature integration&2020..."
 * 
 * If you run with the --selfHosted flag, you are expected to supply a sourceStorage and destStorage parameters.
 * Auto-publishing is not supported for self-hosted versions, so make sure you publish the portal (for example, locally) and upload the generated static files to your hosting after the migration is completed.
 * 
 * You can specify the SAS tokens directly (via sourceToken and destToken), or you can supply an identifier and key,
 * and the script will generate tokens that expire in 1 hour. (via sourceId, sourceKey, destId, destKey)
 */

const https = require('https');
const moment = require('moment');
const crypto = require('crypto');
const mkdirSync = require('fs').mkdirSync;
const execSync = require('child_process').execSync;

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
        --sourceStorage <connectionString> \
        --destEndpoint <name.management.azure-api.net> \
        --destToken <token> \
        --destStorage <connectionString>', 'Self-Hosted')
    /*.option('interactive', {
        alias: 'i',
        type: 'boolean',
        description: 'Whether to use interactive login',
        conflicts: ['sourceToken', 'sourceId', 'sourceKey', 'destToken', 'destId', 'destKey']
    })*/
    .option('selfHosted', {
        alias: 'h',
        type: 'boolean',
        description: 'If the portal is self-hosted',
        implies: ['sourceStorage', 'destStorage']
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
    .option('sourceStorage', {
        type: 'string',
        description: 'The connection string for self-hosted portals',
        example: 'DefaultEndpointsProtocol=…',
        implies: 'selfHosted'
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
    .argv;

async function run() {
    const sourceEndpoint = yargs.sourceEndpoint;
    const sourceToken = await getTokenOrThrow(yargs.sourceToken, yargs.sourceId, yargs.sourceKey);
    const sourceStorage = await getStorageConnectionOrThrow(yargs.sourceStorage, sourceEndpoint, sourceToken);

    const destEndpoint = yargs.destEndpoint;
    const destToken = await getTokenOrThrow(yargs.destToken, yargs.destId, yargs.destKey);
    const destStorage = await getStorageConnectionOrThrow(yargs.destStorage, destEndpoint, destToken);
    const publishEndpoint = yargs.publishEndpoint;
    
    // the rest of this mirrors migrate.bat, but since we're JS, we're platform-agnostic.
    const dataFile = '../dist/data.json';
    const mediaFolder = '../dist/content';
    const mediaContainer = 'content';

    // capture the content of the source portal (excl. media)
    execSync(`node ./capture ${sourceEndpoint} "${sourceToken}" ${dataFile}`);

    // remove all content of the target portal (incl. media)
    execSync(`node ./cleanup ${destEndpoint} "${destToken}" "${destStorage}"`);

    // upload the content of the source portal (excl. media)
    execSync(`node ./generate ${destEndpoint} "${destToken}" ${dataFile}`);

    // download media files from the source portal
    mkdirSync(mediaFolder, { recursive: true });
    execSync(`az storage blob download-batch --source ${mediaContainer} --destination ${mediaFolder} --connection-string "${sourceStorage}"`);

    // upload media files to the target portal
    execSync(`az storage blob upload-batch --source ${mediaFolder} --destination ${mediaContainer} --connection-string "${destStorage}"`);

    if (publishEndpoint && !yargs.selfHosted) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        publish(publishEndpoint, destToken);
    } else if (publishEndpoint) {
        console.warn("Auto-publishing self-hosted portal is not supported.");
    }
}

/**
 * A wrapper for making a request and returning its response body.
 * @param {Object} options https options
 */
async function request(url, options) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (resp) => {
            let data = '';

            resp.on('data', (chunk) => {
                data += chunk;
            });

            resp.on('end', () => {
                try {
                    resolve(data);
                }
                catch (e) {
                    reject(e);
                }
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        req.end();
    });
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
 * Attempts to get a develoer portal storage connection string in two ways:
 * 1) if the connection string is explicitly set by the user, use it.
 * 2) retrieving the connection string from the management API using the instance endpoint and SAS token
 * @param {string} storage an optionally specified storage connection string
 * @param {string} endpoint the management endpoint of service instance
 * @param {string} token the SAS token
 */
async function getStorageConnectionOrThrow(storage, endpoint, token) {
    if (storage) {
        return storage;
    }
    if (token) {
        // token should always be available, because we call
        // getTokenOrThrow before this
        return await getStorageConnection(endpoint, token);
    }
    throw Error('Storage connection could not be retrieved');
}

/**
 * Gets a storage connection string from the management API for the specified APIM instance and
 * SAS token.
 * @param {string} endpoint the management endpoint of service instance
 * @param {string} token the SAS token
 */
async function getStorageConnection(endpoint, token) {
    const options = {
        port: 443,
        method: 'GET',
        headers: {
            'Authorization': token
        }
    };

    const raw = await request(`https://${endpoint}/tenant/settings?api-version=2018-01-01`, options);
    const body = JSON.parse(raw);
    return body.settings.PortalStorageConnectionString;
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
    await request(url, options);
}

run();