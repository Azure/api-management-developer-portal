/**
 * This script automates deployments between developer portal instances.
 * In order to run it, you need to:
 * 
 * 1) clone the api-management-developer-portal repository
 * 2) npm install in the root of the project
 * 3) install az-cli (https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)
 * 4) run this script with a valid combination of arguments
 * 
 * If you run with the --selfHosted flag, you are expected to supply a sourceStorage and destStorage parameter.
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
    .example('$0 --autoPublish \
        --sourceName <name> \
        --sourceToken <token> \
        --destName <name>.management.azure-api.net \
        --destToken <token>\n', 'Managed')
    .example('$0 --selfHosted --autoPublish \
        --sourceName <name>.management.azure-api.net \
        --sourceToken <token> \
        --sourceStorage <connectionString> \
        --destName <name.management.azure-api.net> \
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
    .option('autoPublish', {
        alias: 'p',
        type: 'boolean',
        description: 'If set, publishes the destination portal'
    })
    .option('sourceName', {
        type: 'string',
        description: 'The hostname of the source portal',
        example: '<name>.management.azure-api.net',
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
    .option('destName', {
        type: 'string',
        description: 'The hostname of the destination portal',
        example: '<name>.management.azure-api.net',
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
    // we just need the name of the resource, but allow the user to input <name>.management.azure-api.net
    // for convenience / backwards compat.
    const sourceName = yargs.sourceName.replace('.management.azure-api.net', '');
    const sourceToken = await getTokenOrThrow(yargs.sourceToken, yargs.sourceId, yargs.sourceKey);
    const sourceStorage = await getStorageConnectionOrThrow(yargs.sourceStorage, sourceName, sourceToken);

    const destName = yargs.destName.replace('.management.azure-api.net', '');
    const destToken = await getTokenOrThrow(yargs.destToken, yargs.destId, yargs.destKey);
    const destStorage = await getStorageConnectionOrThrow(yargs.destStorage, destName, destToken);

    // the rest of this mirrors migrate.bat, but since we're JS, we're platform-agnostic.
    const dataFile = '../dist/data.json';
    const mediaFolder = '../dist/content';
    const mediaContainer = 'content';

    // capture the content of the source portal (excl. media)
    execSync(`node ./capture ${sourceName}.management.azure-api.net "${sourceToken}" ${dataFile}`);

    // remove all content of the target portal (incl. media)
    execSync(`node ./cleanup ${destName}.management.azure-api.net "${destToken}" "${destStorage}"`);

    // upload the content of the source portal (excl. media)
    execSync(`node ./generate ${destName}.management.azure-api.net "${destToken}" ${dataFile}`);

    // download media files from the source portal
    mkdirSync(mediaFolder, { recursive: true });
    execSync(`az storage blob download-batch --source ${mediaContainer} --destination ${mediaFolder} --connection-string "${sourceStorage}"`);

    // upload media files to the target portal
    execSync(`az storage blob upload-batch --source ${mediaFolder} --destination ${mediaContainer} --connection-string "${destStorage}"`);

    if (yargs.autoPublish) {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
        publish(destName, destToken);
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
 * 2) retrieving the connection string from the management API using the instance name and SAS token
 * @param {string} storage an optionally specified storage connection string
 * @param {string} name the name of the management instance
 * @param {string} token the SAS token
 */
async function getStorageConnectionOrThrow(storage, name, token) {
    if (storage) {
        return storage;
    }
    if (token) {
        // token should always be available, because we call
        // getTokenOrThrow before this
        return await getStorageConnection(name, token);
    }
    throw Error('Storage connection could not be retrieved');
}

/**
 * Gets a storage connection string from the management API for the specified APIM instance and
 * SAS token.
 * @param {string} name the name of the management instance
 * @param {string} token the SAS token
 */
async function getStorageConnection(name, token) {
    const options = {
        port: 443,
        method: 'GET',
        headers: {
            'Authorization': token
        }
    };

    const raw = await request(`https://${name}.management.azure-api.net/tenant/settings?api-version=2018-01-01`, options);
    const body = JSON.parse(raw);
    return body.settings.PortalStorageConnectionString;
}

/**
 * Publishes the content of the specified APIM instance using a SAS token.
 * @param {string} name the name of the management instance
 * @param {string} token the SAS token
 */
async function publish(name, token) {
    const options = {
        port: 443,
        method: 'POST',
        headers: {
            'Authorization': token
        }
    };

    // returns with literal OK (missing quotes), which is invalid json.
    await request(`https://${name}.developer.azure-api.net/publish`, options);
}

run();
