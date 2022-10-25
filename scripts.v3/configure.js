/**
 * This script automates configuration of the API Management developer portal in the current working copy.
 * In order to run it, you need to:
 *
 * 1) Clone the api-management-developer-portal repository:
 *    git clone https://github.com/Azure/api-management-developer-portal.git
 *
 * 2) Install NPM  packages:
 *    npm install
 *
 * 3) Run this script with a valid combination of arguments:
 *    node ./configure ^
 *   --subscriptionId < your subscription ID > ^
 *   --resourceGroupName < your resource group name > ^
 *   --serviceName < your service name >
 */

const path = require("path");
const fs = require("fs");
const { HttpClient } = require("./utils");

const yargs = require('yargs')
    .example(`node ./configure ^ \r
     --subscriptionId "< your subscription ID >" ^ \r
     --resourceGroupName "< your resource group name >" ^ \r
     --serviceName "< your service name >"\n`)
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
    .option('keyType', {
        type: 'string',
        default: 'primary',
        choices: ['primary', 'secondary'],
        description: 'The API Management key to be used to generate an access token for user.',
        demandOption: false,
        conflicts: ['accessToken']
    })
    .option('expiry', {
        type: 'string',
        default: (function () {
            const expiry = new Date();
            expiry.setDate(expiry.getDate() + 29);
            expiry.setMilliseconds(0);
            return expiry.toISOString();
        })(),
        description: 'The expiry time of the token to generate (in ISO8601 format). ',
        demandOption: false,
        conflicts: ['accessToken']
    })
    .option('accessToken', {
        type: 'string',
        description: 'API Management shared access authorization token.',
        demandOption: false,
        conflicts: ['keyType', 'expiry']
    })
    .help()
    .argv;

async function configure() {

    const httpClient = new HttpClient(
        yargs.subscriptionId,
        yargs.resourceGroupName,
        yargs.serviceName,
        null,
        null,
        null
    );

    const service = await httpClient.sendRequest("GET", "", "");
    const managementApiUrl = service.properties.managementApiUrl;
    const backendUrl = service.properties.developerPortalUrl;

    let accessToken;
    if (yargs.accessToken) {
        accessToken = yargs.accessToken
    } else {
        const secrets = await httpClient.sendRequest("POST", "/tenant/access/listSecrets", "");
        const expiry = yargs.expiry;
        const keyType = yargs.keyType;
        const userToken = await httpClient.sendRequest("POST", `/users/${secrets.principalId}/token`, { expiry, keyType });
        accessToken = userToken.value;
    }

    const managementApiAccessToken = `SharedAccessSignature ${accessToken}`;

    const configDesignFilename = path.join(__dirname, '..', 'src', 'config.design.json');
    const configDesignFile = fs.readFileSync(configDesignFilename, { encoding: 'utf-8' });
    const configDesign = JSON.parse(configDesignFile);
    fs.writeFileSync(configDesignFilename, JSON.stringify({ ...configDesign, ...{ managementApiUrl, managementApiAccessToken, backendUrl } }, null, 4));

    const configPublishFilename = path.join(__dirname, '..', 'src', 'config.publish.json');
    const configPublishFile = fs.readFileSync(configPublishFilename, { encoding: 'utf-8' });
    const configPublish = JSON.parse(configPublishFile);
    fs.writeFileSync(configPublishFilename, JSON.stringify({ ...configPublish, ...{ managementApiUrl, managementApiAccessToken } }, null, 4));

    const configRuntimeFilename = path.join(__dirname, '..', 'src', 'config.runtime.json');
    const configRuntimeFile = fs.readFileSync(configRuntimeFilename, { encoding: 'utf-8' });
    const configRuntime = JSON.parse(configRuntimeFile);
    fs.writeFileSync(configRuntimeFilename, JSON.stringify({ ...configRuntime, ...{ managementApiUrl, backendUrl } }, null, 4));
}

configure()
    .then(() => {
        console.log("DONE");
        process.exit(0);
    })
    .catch(error => {
        console.error(error.message);
        process.exit(1);
    });


module.exports = {
    configure
}
