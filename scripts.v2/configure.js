const fs = require('fs'),
    path = require('path'),
    configDesignFile = path.join(__dirname, '\\..\\src\\config.design.json'),
    configPublishFile = path.join(__dirname, '\\..\\src\\config.publish.json'),
    configRuntimeFile = path.join(__dirname, '\\..\\src\\config.runtime.json');

const managementEndpoint = process.argv[2];
const apimSasAccessTokenValue = process.argv[3];
const backendUrlValue = process.argv[4];
const apimServiceNameValue = process.argv[5];
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