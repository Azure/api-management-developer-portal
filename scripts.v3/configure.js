const fs = require('fs'),
    crypto = require('crypto'),
    path = require('path'),
    configDesignFile = path.join(__dirname, '\\..\\src\\config.design.json'),
    configPublishFile = path.join(__dirname, '\\..\\src\\config.publish.json'),
    configRuntimeFile = path.join(__dirname, '\\..\\src\\config.runtime.json');

const apimServiceNameValue = process.argv[2];
const apimAccountKey = process.argv[3];

const managementEndpoint =  `${apimServiceNameValue}.management.azure-api.net`;
const apimSasAccessTokenValue = createSharedAccessToken("integration", apimAccountKey, 14);
const backendUrlValue = `https://${apimServiceNameValue}.developer.azure-api.net`;

const apimServiceUrlValue = `https://${managementEndpoint}/subscriptions/00000/resourceGroups/00000/providers/Microsoft.ApiManagement/service/${apimServiceNameValue}`;

const apimServiceParameter = "managementApiUrl";
const apimSasAccessTokenParameter = "managementApiAccessToken";
const backendUrlParameter = "backendUrl";

fs.readFile(configDesignFile, { encoding: 'utf-8' }, function (err, data) {
    if (!err) {
        const obj = JSON.parse(data);
        obj[apimServiceParameter] = apimServiceUrlValue;
        obj[apimSasAccessTokenParameter] = apimSasAccessTokenValue;
        obj[backendUrlParameter] = backendUrlValue;
        fs.writeFile(configDesignFile, JSON.stringify(obj, null, 4), function (errWrite) {
            if (errWrite) {
                return console.log(errWrite);
            }
        });
    } else {
        console.log(err);
    }
});

fs.readFile(configPublishFile, { encoding: 'utf-8' }, function (err, data) {
    if (!err) {
        const obj = JSON.parse(data);
        obj[apimServiceParameter] = apimServiceUrlValue;
        obj[apimSasAccessTokenParameter] = apimSasAccessTokenValue;
        fs.writeFile(configPublishFile, JSON.stringify(obj, null, 4), function (errWrite) {
            if (errWrite) {
                return console.log(errWrite);
            }
        });
    } else {
        console.log(err);
    }
});

fs.readFile(configRuntimeFile, { encoding: 'utf-8' }, function (err, data) {
    if (!err) {
        const obj = JSON.parse(data);
        obj[apimServiceParameter] = apimServiceUrlValue;
        obj[backendUrlParameter] = backendUrlValue;
        fs.writeFile(configRuntimeFile, JSON.stringify(obj, null, 4), function (errWrite) {
            if (errWrite) {
                return console.log(errWrite);
            }
        });
    } else {
        console.log(err);
    }
});

function createSharedAccessToken(apimUid, apimAccessKey, validDays) {

    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + validDays)

    let expiry = expiryDate.toISOString().replace(/\d+.\d+Z/, "00.0000000Z")
    let expiryShort = expiryDate.toISOString().substr(0,16).replace(/[^\d]/g,'',)

    const signature = crypto.createHmac('sha512', apimAccessKey).update(`${apimUid}\n${expiry}`).digest('base64');
    const sasToken = `SharedAccessSignature ${apimUid}&${expiryShort}&${signature}`;

    return sasToken;
}