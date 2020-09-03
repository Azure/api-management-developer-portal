/*
 * Important: this script is no longer maintained; new scripts are located in the scripts.v2 folder.
*/

const fs = require("fs");
const https = require("https");
const managementEndpoint = process.argv[2]
const accessToken = process.argv[3]
const dataFile = process.argv[4];

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;

async function request(url, body) {
    return new Promise((resolve, reject) => {
        var options = {
            port: 443,
            method: "PUT",
            headers: {
                "If-Match": "*",
                "Content-Type": "application/json",
                "Content-Length": Buffer.byteLength(body),
                "Authorization": accessToken
            }
        };

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

        req.write(body);
        req.end();
    });
}

async function restore() {
    const data = fs.readFileSync(dataFile);
    const dataObj = JSON.parse(data);

    const keys = Object.keys(dataObj);

    for (const key of keys) {
        await request(`https://${managementEndpoint}${key}?api-version=2018-06-01-preview`, JSON.stringify(dataObj[key]));
    }
}

restore().then(() => {
    console.log("DONE");
})