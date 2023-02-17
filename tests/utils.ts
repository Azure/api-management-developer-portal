import * as fs from "fs";
import * as crypto from "crypto";
import { User } from "./mocks";
import * as http from "http";

export class Utils {
    public static async getConfig(): Promise<any> {
        const configFile = await fs.promises.readFile("./src/config.validate.json", { encoding: "utf-8" });
        const validationConfig = JSON.parse(configFile);
        Object.keys(validationConfig.urls).forEach(key => {
            validationConfig.urls[key] = validationConfig.root + validationConfig.urls[key];
        });

        return validationConfig;
    }

    public static async getSharedAccessToken(apimUid: string, apimAccessKey: string, validDays: number): Promise<string> {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + validDays);

        const expiry = expiryDate.toISOString().replace(/\d+.\d+Z/, "00.0000000Z");
        const expiryShort = expiryDate.toISOString().substr(0, 16).replace(/[^\d]/g, "");
        const signature = crypto.createHmac("sha512", apimAccessKey).update(`${apimUid}\n${expiry}`).digest("base64");
        const sasToken = `SharedAccessSignature ${apimUid}&${expiryShort}&${signature}`;

        return sasToken;
    }

    public static async createMockServer(responses?: Object[]) {
        var obj = {};
        if (responses?.length){
            for (let responseObj of responses) {
                obj = {...obj, ...responseObj };
            }
        }

        var server = http
            .createServer((req, res) => {
                const urlWithoutParameters = req.url?.split("?")[0];
                res.setHeader("Access-Control-Allow-Methods", "*");
                res.setHeader("Access-Control-Allow-Credentials", "true");
                res.setHeader("Access-Control-Allow-Headers", "*");
                res.setHeader("Access-Control-Allow-Origin", "*");
                res.setHeader("Access-Control-Expose-Headers", "*");
                if (urlWithoutParameters && obj[urlWithoutParameters] != undefined) {
                    var response = obj[urlWithoutParameters];
                    var headers = {};
                    response.headers.forEach(element => {
                        res.setHeader(element.name, element.value);
                        headers[element.name] = element.value;
                    });
                    
                    res.writeHead(response.statusCode);
                    res.write(Buffer.from(JSON.stringify(response.body)));
                    res.end();
                } else {
                    res.writeHead(404);
                    res.write("Page not found");
                    res.end();
                }
            });
        
        server.listen(8181);
        return server;
    }
    public static closeServer(server){
        server.close();
    }
}
