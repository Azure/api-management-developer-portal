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

    fs.writeFileSync(dataFile, JSON.stringify(result));
}


capture().then(() => {
    console.log("DONE");
})