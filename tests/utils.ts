import { User } from "./mocks/user";
import * as crypto from "crypto";
import * as fs from "fs";

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
}

