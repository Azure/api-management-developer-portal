import * as fs from "fs";
import * as crypto from "crypto";
import * as http from "http";
import { ConsoleMessage, Page } from 'puppeteer';

export class Utils {
    public static async getConfig(): Promise<any> {
        const configFile = await fs.promises.readFile("./src/config.validate.json", { encoding: "utf-8" });
        const validationConfig = JSON.parse(configFile);
        Object.keys(validationConfig.urls).forEach(key => {
            validationConfig.urls[key] = validationConfig.root + validationConfig.urls[key];
        });

        return validationConfig;
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

    public static randomIdentifier(length: number = 8): string {
        let result = "";
        const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }

        return result;
    }

    public static createMockServer(responses?: Object[]) {
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
        
        
        return server;
    }
    public static closeServer(server){
        if (server != null){
            server.close();
        }
    }

    public static startTest(server, validate, done){
        server.on("ready", () => {
            validate().then(() => {
                done();
            }).catch((err) => {
                done(err);
            })
        });

        server.listen(8181,"127.0.0.1", function(){
            server.emit("ready");
        });
    }

    public static async  getBrowserNewPage(browser): Promise<Page>{
        const page = await browser.newPage();
            
        page.on('console', async (message: ConsoleMessage) => {
            console.log(message.text());
        });

        return page;
    }

}
