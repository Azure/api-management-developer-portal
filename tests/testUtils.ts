import * as fs from "fs";
import * as crypto from "crypto";
import * as http from "http";

export class TestUtils {
    public static async getConfigAsync(): Promise<object> {
        const configFile = await fs.promises.readFile("./src/config.validate.json", { encoding: "utf-8" });
        const validationConfig = JSON.parse(configFile);
        Object.keys(validationConfig.urls).forEach(key => {
            validationConfig.urls[key] = validationConfig.root + validationConfig.urls[key];
        });

        return validationConfig;
    }

    public static getTestData(testKey: string): object {
        const configFile = fs.readFileSync("./tests/mocks/mockServerData.json", { encoding: "utf-8" });
        const validationConfig = JSON.parse(configFile);
        if(validationConfig[testKey] == undefined){
            throw new Error(`Test data not found for ${testKey}`);
        }
        return validationConfig[testKey];
    }

    public static async IsLocalEnv(): Promise<boolean> {
        let config = await TestUtils.getConfigAsync();
        return config["isLocalRun"] === true;
    }

    public static addQueryParameter(uri: string, name: string, value?: string): string {
        uri += `${uri.indexOf("?") >= 0 ? "&" : "?"}${name}`;
        if (value) {
            uri += `=${value}`;
        }
        return uri;
    }

    public static getSharedAccessToken(apimUid: string, apimAccessKey: string, validDays: number): string {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + validDays);

        const expiry = expiryDate.toISOString().replace(/\d+.\d+Z/, "00.0000000Z");
        const expiryShort = expiryDate.toISOString().substr(0, 16).replace(/[^\d]/g, "");
        const signature = crypto.createHmac("sha512", apimAccessKey).update(`${apimUid}\n${expiry}`).digest("base64");
        const sasToken = `SharedAccessSignature ${apimUid}&${expiryShort}&${signature}`;

        return sasToken;
    }

    public static randomIdentifier(length: number = 8, includeNumers = true): string {
        let result = "";
        let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
        if (includeNumers){
            characters = characters + "0123456789";
        }

        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    public static createMockServer(responses?: Object) {
        var obj = {...responses} ?? {};
        for (const key in obj) {
            var newKey = key;

            if (obj[key]["methods"] && obj[key]["methods"].length > 0){
                const methods = `(${obj[key]["methods"].join("|")})`;
                newKey = `${methods}/${key}`;    
            }else{
                newKey = `(GET|POST|PUT|DELETE|OPTIONS)/${key}`;
            }
            obj[key]['regex'] = new RegExp("^" + newKey + "$");
        }

        var server = http
            .createServer((req, res) => {
                const urlWithoutParameters = req.url?.split("?")[0];
                res.setHeader("Access-Control-Allow-Methods", "*");
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Allow-Headers", "*");
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Expose-Headers", "*");

                var urlToSearch = `${req.method}/${urlWithoutParameters}`;
                var response = null;

                for (const key in obj) {
                    if (obj[key]['regex'].test(urlToSearch)) {
                        response = {...obj[key]};
                        delete response['regex'];
                        break;
                    }
                }

                if (response != null && response != undefined) {
                    // default header response, the specified header 
                    res.setHeader("Content-Type", "application/json");

                    if (response.headers && response.headers.length > 0){
                        response.headers.forEach(element => {
                            res.setHeader(element.name, element.value);
                        });
                    }
                    
                    res.writeHead(response.statusCode);
                    res.write(Buffer.from(JSON.stringify(response.body)));
                    res.end();
                } else {
                    res.writeHead(404);
                    res.write("Page not found");
                    res.end();
                }
            });
        
        return server;
    }
    public static closeServer(server){
        if (server != null){
            server.close();
        }
    }
}
