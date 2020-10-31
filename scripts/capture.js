const fs = require("fs");
const https = require("https");
const managementEndpoint = process.argv[2];
const accessToken = process.argv[3];
const dataFile = process.argv[4];

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

var options = {
    port: 443,
    method: "GET",
    headers: {
        "Authorization": accessToken
    }
};

async function request(url) {
    return new Promise((resolve, reject) => {
        const req = https.request(url, options, (resp) => {
            let data = "";
            resp.on("data", (chunk) => {
                data += chunk;
            });
            resp.on("end", () => {
                // reject on bad status
                if (resp.statusCode != 200) {
                    console.log('url: ' + url);
                    return reject(new Error('statusCode=' + resp.statusCode + ' for URL: ' + url));
                }
                try {
                    resolve(JSON.parse(data));
                }
                catch (e) {
                    reject(e);
                    console.log(url);
                }
            });
        });

        req.on("error", (e) => {
            reject(e);
        });

        req.end();
    });
}


async function getContentTypes() {
    const data = await request(`https://${managementEndpoint}/contentTypes?api-version=2018-06-01-preview`);
    const contentTypes = data.value.map(x => x.id.replace("\/contentTypes\/", ""));

    return contentTypes;
}

async function getContentItems(contentType) {
    const data = await request(`https://${managementEndpoint}/contentTypes/${contentType}/contentItems?api-version=2018-06-01-preview`);
    const contentItems = data.value;

    return contentItems;
}

function checkPath() {
    const folderSegments = dataFile.split("/");
    let checkedPath = dataFile;
    if (!folderSegments[0]) {
        folderSegments.splice(0, 1);
        checkedPath = checkedPath.slice(1);
    }
    if (folderSegments.length > 1) {
        folderSegments.splice(-1, 1);
        const folder = folderSegments.join("/");
        if (!fs.existsSync(folder)) {
            fs.mkdirSync(folder);
        }
    }
    return checkedPath;
}

async function capture() {
    const result = {};
    const contentTypes = await getContentTypes();

    for (const contentType of contentTypes) {
        const contentItems = await getContentItems(contentType);

        contentItems.forEach(contentItem => {
            result[contentItem.id] = contentItem;

            delete contentItem.id;
        });
    }

    const checkedPath = checkPath();

    fs.writeFileSync(checkedPath, JSON.stringify(result));
}


capture().then(() => {
    console.log("DONE");
}).catch((err) => {
    console.log(err);
});





