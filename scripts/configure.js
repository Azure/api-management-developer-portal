
var apimServiceValue = process.argv[2]; //"apimservice";
var apimSasAccessTokenValue = process.argv[3]; //"token";
var storageSasUrlValue = process.argv[4]; //"bloburl";
var storageConnectionStringValue = process.argv[4]; //"strconnstr";

var apimServiceUrlValue = `https://${apimServiceValue}.management.azure-api.net`;

const apimServiceParameter = "managementApiUrl";
const apimSasAccessTokenParameter = "managementApiAccessToken";
const storageSasUrlParameter = "blobStorageUrl";
const storageConnectionStringParameter = "blobStorageConnectionString";

var fs = require('fs'),
    path = require('path'),    
    configDesignFile = path.join(__dirname, '\\..\\src\\config.design.json'),
    configPublishFile = path.join(__dirname, '\\..\\src\\config.publish.json'),
    configRuntimeFile = path.join(__dirname, '\\..\\src\\config.runtime.json');

fs.readFile(configDesignFile, {encoding: 'utf-8'}, function(err,data){
    if (!err) {
        var obj = JSON.parse(data);
        obj[apimServiceParameter] = apimServiceUrlValue;
        obj[apimSasAccessTokenParameter] = apimSasAccessTokenValue;
        obj[storageSasUrlParameter] = storageSasUrlValue;
        console.log(obj);
    } else {
        console.log(err);
    }
});

fs.readFile(configPublishFile, {encoding: 'utf-8'}, function(err,data){
    if (!err) {
        var obj = JSON.parse(data);
        obj[apimServiceParameter] = apimServiceUrlValue;
        obj[apimSasAccessTokenParameter] = apimSasAccessTokenValue;
        obj[storageConnectionStringParameter] = storageConnectionStringValue;
        console.log(obj);
    } else {
        console.log(err);
    }
});

fs.readFile(configRuntimeFile, {encoding: 'utf-8'}, function(err,data){
    if (!err) {
        var obj = JSON.parse(data);
        obj[apimServiceParameter] = apimServiceUrlValue;
        console.log(obj);
    } else {
        console.log(err);
    }
});