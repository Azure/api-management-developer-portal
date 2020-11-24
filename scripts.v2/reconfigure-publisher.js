const fs = require('fs'),
    crypto = require('crypto'),
    path = require('path'),
    configPublishFile = 'config.json',
    configRuntimeFile = path.normalize('assets\\config.json')

const apimServiceNameValue = process.argv[2];
const apimAccountKey = process.argv[3];

const managementApiUrlValue = `https://${apimServiceNameValue}.management.azure-api.net/subscriptions/00000/resourceGroups/00000/providers/Microsoft.ApiManagement/service/${apimServiceNameValue}`;
const managementApiAccessTokenValue = createSharedAccessToken("integration", apimAccountKey, 1);
const hotJarIdValue = process.argv[4];
const azureInsightsInstrumentationKeyValue = process.argv[5];
const backendUrlValue = `https://${apimServiceNameValue}.developer.azure-api.net`;
const apisWithGuidesValue = [];

// publishConfig
const managementApiUrlParameter = "managementApiUrl";
const managementApiAccessTokenParameter = "managementApiAccessToken";
const environmentParameter = "environment";
const useHipCaptchaParameter = "useHipCaptcha";
const hotJarIdParameter = "hotJarId";
const azureInsightsInstrumentationKeyParameter = "azureInsightsInstrumentationKey";

// runtimeConfig
const backendUrlParameter = "backendUrl";
const apisWithGuidesParameter = "apisWithGuides";

fs.readFile(configPublishFile, { encoding: 'utf-8' }, function (err, data) {
    if (!err) {
        const obj = JSON.parse(data);
        obj[managementApiUrlParameter] = managementApiUrlValue;
        obj[managementApiAccessTokenParameter] = managementApiAccessTokenValue;
        obj[environmentParameter] = "publishing";
        obj[useHipCaptchaParameter] = false;
        obj[hotJarIdParameter] = hotJarIdValue;
        obj[azureInsightsInstrumentationKeyParameter] = azureInsightsInstrumentationKeyValue;

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
        obj[managementApiUrlParameter] = managementApiUrlValue;
        obj[environmentParameter] = "runtime";
        obj[backendUrlParameter] = backendUrlValue;
        obj[apisWithGuidesParameter] = apisWithGuidesValue;

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
