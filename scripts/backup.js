"use strict"
/**
 * This script saves the developer portal instance.
 * In order to run it, you need to:
 * 
 * 1) Clone the api-management-developer-portal repository
 * 2) `npm install` in the root of the project
 * 3) Install az-cli (https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)
 * 4) Run this script with a valid combination of arguments
 * 
 * Managed portal command example:
 * node backup --sourceEndpoint from.management.azure-api.net --publishEndpoint to.developer.azure-api.net --sourceToken "SharedAccessSignature integration&2020..."  --dataFile d:\apim-portal\great.json --mediaFolder d:\apim-portal\great\
 * 
 * If you run with the --selfHosted flag, you are expected to supply a sourceStorage parameter.
 * 
 * You can specify the SAS tokens directly (via sourceToken), or you can supply an identifier and key,
 * and the script will generate tokens that expire in 1 hour. (via sourceId, sourceKey).
 */

const path = require("path");
const mkdirSync = require('fs').mkdirSync;
const execSync = require('child_process').execSync;

const shared = require('./shared');

const yargs = require('yargs')
.version('1.0.2')
    .example('$0 \
        --sourceEndpoint contoso.management.azure-api.net \
        --sourceToken <token> \
        --dataFile d:\apim-portal\contoso.json \
        --mediaFolder d:\apim-portal\contoso \n')
    .example('$0 \
        --sourceEndpoint great.management.azure-api.net \
        --sourceId integration \
        --sourceKey Sshbh493lagtssTH3902kdfksjslqa65saa239hJKdjaWtmmnssPhcCthhcEisagaYyalLalaTWMwuqcosa7sv== \
        --dataFile d:\apim-portal\great.json \
        --mediaFolder d:\apim-portal\great\
        --addTimestamp\n')
    .example('$0 --selfHosted \
        --sourceEndpoint halibut.management.azure-api.net> \
        --sourceToken <token> \
        --sourceStorage <connectionString>\
        --dataFile d:\apim-portal\halibut\data.json \
        --mediaFolder d:\apim-portal\halibut\media\n')
    .option('selfHosted', {
        alias: 'h',
        type: 'boolean',
        description: 'If the portal is self-hosted',
        implies: 'sourceStorage'
    })
    .option('addTimestamp', {
        type: 'boolean',
        description: 'Adds a timestamp to the data file name and the media folder name'
    })
    .option('sourceEndpoint', {
        type: 'string',
        description: 'The hostname of the management endpoint of the source API Management service',
        example: 'name.management.azure-api.net',
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
    .option('dataFile', {
        type: 'string',
        description: 'The path to the file which will store the content of the portal except the media files',
        example: '..\dist\data.json',
        demandOption: 'true'
    })
    .option('mediaFolder', {
        type: 'string',
        description: 'The path to the folder which will store the media content of the portal',
        example: '..\dist\content',
        demandOption: 'true'
    })
    .argv;

async function run() {
    const sourceEndpoint = yargs.sourceEndpoint;
    const sourceToken = await shared.getTokenOrThrow(yargs.sourceToken, yargs.sourceId, yargs.sourceKey);
    const sourceStorage = await shared.getStorageConnectionOrThrow(yargs.sourceStorage, sourceEndpoint, sourceToken);
    const dataFile = yargs.dataFile;
    var mediaFolder = yargs.mediaFolder;
    
    const mediaContainer = 'content';

    console.log(`Starting backup of ${sourceEndpoint}.`);

    // capture the content of the source portal (excl. media)
    var absoluteFilePath = path.resolve(dataFile);
    const dataFileFolder = path.parse(absoluteFilePath).dir;

    // add the time
    if(yargs.addTimestamp){ 
        const timestamp = new Date();
        const postfix = "-" +
            timestamp.getFullYear() +
            makeTwo(timestamp.getMonth() + 1) +
            makeTwo(timestamp.getDate()) +
            makeTwo(timestamp.getHours()) +
            makeTwo(timestamp.getMinutes()) +
            makeTwo(timestamp.getSeconds());

        absoluteFilePath = path.format({
            dir: dataFileFolder,
            name: path.parse(absoluteFilePath).name + postfix,
            ext: path.parse(absoluteFilePath).ext
        });

        mediaFolder += postfix;
    }

    // make sure the folders are created before writing to them
    mkdirSync(dataFileFolder, {recursive: true});
    mkdirSync(mediaFolder, { recursive: true });

    // create the data file
    console.log(`Capturing portal customizations except media to ${absoluteFilePath}.`);
    execSync(`node ./capture "${sourceEndpoint}" "${sourceToken}" "${absoluteFilePath}"`);

    // download media files from the source portal
    const absoluteMediaFolder = path.resolve(mediaFolder);
    console.log(`Saving media files to  ${absoluteMediaFolder}.`);
    execSync(`az storage blob download-batch\
        --source "${mediaContainer}"\
        --destination "${absoluteMediaFolder}"\
        --connection-string "${sourceStorage}"`);

    console.log(`The backup operation of ${sourceEndpoint} is finished.`);
}

function makeTwo(digits) {
    const asString = digits.toString();

    if(asString.length == 0) {
        return "00";
    }

    if (asString.length == 1) {
        return "0" + asString;
    }

    return asString.slice(-2);
}


run();