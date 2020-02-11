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
const mkdirSync = require('fs').mkdirSync;
const execSync = require('child_process').execSync;

const yargs = require('yargs')
    .example('$0 --autoPublish --sourceName <name>.management.azure-api.net --sourceToken <token> --destName <name>.management.azure-api.net --destToken <token>\n', 'Managed')
    .example('$0 --selfHosted --autoPublish --sourceName <name>.management.azure-api.net --sourceToken <token> --sourceStorage <connectionString> --destName <name.management.azure-api.net> --destToken <token> --destStorage <connectionString>', 'Self-Hosted')
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
        example: '',
        description: 'A SAS token for the source portal',
        conflicts: ['sourceId, sourceToken']
    })
    .option('sourceStorage', {
        type: 'string',
        description: 'The connection string for self-hosted portals',
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
        example: '',
        description: 'A SAS token for the destination portal',
        conflicts: ['destId, destToken']
    })
    .option('destStorage', {
        type: 'string',
        description: 'The connection string for self-hosted portals',
        implies: 'selfHosted'
    })
    .argv;

async function run() {
    const sourceName = yargs.sourceName;
    const sourceToken = await getTokenOrThrow(yargs.sourceToken, yargs.sourceId, yargs.sourceKey);
    const sourceStorage = await getStorageConnectionOrThrow(yargs.sourceStorage, sourceName, sourceToken);

    const destName = yargs.destName;
    const destToken = await getTokenOrThrow(yargs.destToken, yargs.destId, yargs.destKey);
    const destStorage = await getStorageConnectionOrThrow(yargs.destStorage, destName, destToken);

    // the rest of this mirrors migrate.bat, but since we're JS, we're platform-agnostic.
    const dataFile = '../dist/data.json';
    const mediaFolder = '../dist/content';
    const mediaContainer = 'content';

    // capture the content of the source portal (excl. media)
    execSync(`node ./capture ${sourceName} ${sourceToken} ${dataFile}`);

    // remove all content of the target portal (incl. media)
    execSync(`node ./cleanup ${destName} ${destToken} ${destStorage}`);

    // upload the content of the source portal (excl. media)
    execSync(`node ./generate ${destName} ${destToken} ${dataFile}`);

    // download media files from the source portal
    mkdirSync(mediaFolder);
    execSync(`az storage blob download-batch --source ${mediaContainer} --destination ${mediaFolder} --connection-string ${sourceStorage}`);

    // upload media files to the target portal
    execSync(`az storage blob upload-batch --source ${mediaFolder} --destination ${mediaContainer} --connection-string ${destStorage}`);

    if (yargs.autoPublish) {
        publish(destName, destToken);
    }
}

/**
 * A wrapper for making a request and returning its response body as a json object.
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
                    resolve(JSON.parse(data));
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
        return generateSASToken(id, key);
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
 * @param {number} expiresIn 
 */
async function generateSASToken(id, key, expiresIn = 3600) {
    const now = new Date();
    const expiry = now.getTime() / 1000 + expiresIn; // seconds

    
}

async function getStorageConnectionOrThrow(storage, name, token) {
    if (storage) {
        return storage;
    }
    if (token) {
        // token should always be available, because we call
        // getTokenOrThrow before this
        return getStorageConnection(name, token);    
    }
    throw Error('Storage connection could not be retrieved');
}

/**
 * 
 * @param {string} token 
 */
async function getStorageConnection(name, token) {
    const options = {
        port: 443,
        method: 'GET',
        headers: {
            'Authorization': token
        }
    };

    const body = await request(`https://${name}/tenant/settings?api-version=2018-01-01`, options);
    return body.settings.PortalStorageConnectionString;
}

async function publish(name, token) {

}

run();
