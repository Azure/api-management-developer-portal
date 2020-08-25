"use strict"
/**
 * This script contains functions used by backup.js and restore.js. It is copied from migrate.js.
 */

const https = require('https');
const moment = require('moment');
const crypto = require('crypto');

module.exports.request = request;
module.exports.getTokenOrThrow = getTokenOrThrow;
module.exports.getStorageConnectionOrThrow = getStorageConnectionOrThrow;

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
