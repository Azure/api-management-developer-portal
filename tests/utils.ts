import { User } from "./mocks";
import * as crypto from "crypto";
import * as fs from "fs";
import { Page } from "puppeteer";
import { Utils as SrcUtils } from "../src/utils";

export class Utils {
    public static async getConfig(): Promise<any> {
        const configFile = await fs.promises.readFile("./src/config.validate.json", { encoding: "utf-8" });
        const validationConfig = JSON.parse(configFile);

        return validationConfig;
    }

    public static async getRandomUser(): Promise<User> {
        return {
            firstName: Utils.randomIdentifier(),
            lastName: Utils.randomIdentifier(),
            email: `${Utils.randomIdentifier()}@contoso.com`,
            password: Utils.randomIdentifier()
        };
    }

    public static async getConfirmedUserBasic(): Promise<User> {
        const config = await Utils.getConfig();

        return {
            firstName: config.signin.firstName,
            lastName: config.signin.lastName,
            email: config.signin.credentials.basic.email,
            password: config.signin.credentials.basic.password
        };
        return config.user;
    }

    public static async getConfirmedUserAadB2C(): Promise<User> {
        const config = await Utils.getConfig();

        return {
            firstName: config.signin.firstName,
            lastName: config.signin.lastName,
            email: config.signin.credentials.aadB2C.email,
            password: config.signin.credentials.aadB2C.password
        };
        return config.user;
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

    public static async getSharedAccessToken(apimUid: string, apimAccessKey: string, validDays: number): Promise<string> {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + validDays);

        const expiry = expiryDate.toISOString().replace(/\d+.\d+Z/, "00.0000000Z");
        const expiryShort = expiryDate.toISOString().substr(0, 16).replace(/[^\d]/g, "");
        const signature = crypto.createHmac("sha512", apimAccessKey).update(`${apimUid}\n${expiry}`).digest("base64");
        const sasToken = `SharedAccessSignature ${apimUid}&${expiryShort}&${signature}`;

        return sasToken;
    }

    /**
     * If '--mock' param is present in process.argv, intercepts and mocks API calls.
     *
     * @param page puppeteer Page obj
     * @param urls pairs of URLs and JSON/string body response
     */
    public static async mock(page: Page, urls: Record<string, Record<string, any> | string>): Promise<void> {
        const mock = process.argv.includes("--mock");
        if (mock) return this.mockPure(page, urls);
    }

    public static async mockPure(page: Page, urls: Record<string, Record<string, any> | string>): Promise<void> {
        await page.setRequestInterception(true);
        page.on('request', request => {
            const found = Object.entries(urls).find(([url, body]) => {
                if (!SrcUtils.getRelativeUrl(request.url()).includes(SrcUtils.getRelativeUrl(url))) return false;

                console.log("MOCK", SrcUtils.getRelativeUrl(request.url()));

                if (request.isInterceptResolutionHandled()) return;
                request.respond({
                    status: 200,
                    contentType: 'application/json',
                    headers: {
                        "Access-Control-Allow-Origin": "*",
                        "Access-Control-Allow-Headers": "*",
                        "Access-Control-Expose-Headers": "*",
                        "Date": new Date(),
                        "Ocp-Apim-Sas-Token": 'token="foo-bar&299910242302&aaaaaaaaaaaaaaaaa/aaaaaaaaaaaaaaaaaa/aaaaaaaaaaaaa/aaaaaaaaaaaaaaaaaaaaa/aaaaaaaaaaaaa==",refresh="true"',
                    },
                    body: typeof body === "string" ? body : JSON.stringify(body),
                }, 1);
                return true;
            })

            if (!found) {
                console.log("pass", SrcUtils.getRelativeUrl(request.url()));
                if (request.isInterceptResolutionHandled()) return;
                request.continue(undefined, 0);
            }
        });
    }
}
