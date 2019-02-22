const https = require("https");
const serviceName = process.argv[2]
const accessToken = process.argv[3]

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

var options = {
    port: 443,
    method: "GET",
    headers: {
        "Authorization": accessToken,
        "If-Match": "*"
    }
};

async function request(method, url) {
    return new Promise((resolve, reject) => {
        options.method = method;

        const req = https.request(url, options, (resp) => {
            let data = "";

            resp.on("data", (chunk) => {
                data += chunk;
            });

            resp.on("end", () => {
                if (data) {
                    try {
                        resolve(JSON.parse(data));
                    }
                    catch (e) {
                        console.log(url);
                        reject(e);
                    }
                }
                else {
                    resolve();
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
    const data = await request("GET", `https://${serviceName}.management.azure-api.net/contentTypes?api-version=2018-06-01-preview`);
    const contentTypes = data.value.map(x => x.id.replace("\/contentTypes\/", ""));

    return contentTypes;
}

async function getContentItems(contentType) {
    const data = await request("GET", `https://${serviceName}.management.azure-api.net/contentTypes/${contentType}/contentItems?api-version=2018-06-01-preview`);
    const contentItems = data.value;

    return contentItems;
}

async function capture() {
    const contentTypes = await getContentTypes();

    for (const contentType of contentTypes) {
        const contentItems = await getContentItems(contentType);

        for (const contentItem of contentItems) {
            await request("DELETE", `https://${serviceName}.management.azure-api.net${contentItem.id}?api-version=2018-06-01-preview`);
        }
    }
}

capture().then(() => {
    console.log("DONE");
})