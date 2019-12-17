import * as moment from "moment";
import { Utils } from "../utils";
import { IAuthenticator, AccessToken } from "./../authentication";

export class DefaultAuthenticator implements IAuthenticator {
    public async getAccessToken(): Promise<string> {
        return sessionStorage.getItem("accessToken");
    }

    public async setAccessToken(accessToken: string): Promise<void> {
        sessionStorage.setItem("accessToken", accessToken);
    }

    public async clearAccessToken(): Promise<void> {
        sessionStorage.removeItem("accessToken");
    }

    public async isAuthenticated(): Promise<boolean> {
        const accessToken = await this.getAccessToken();

        if (!accessToken) {
            return false;
        }

        const parsedToken = this.parseAccessToken(accessToken);

        if (!parsedToken) {
            return false;
        }

        const now = Utils.getUtcDateTime();

        return now < parsedToken.expires;
    }

    private parseSharedAccessSignature(accessToken: string): AccessToken {
        const regex = /^[\w\-]*\&(\d*)\&/gm;
        const match = regex.exec(accessToken);

        if (!match || match.length < 2) {
            throw new Error(`SharedAccessSignature token format is not valid.`);
        }

        const dateTime = match[1];
        const dateTimeIso = `${dateTime.substr(0, 8)} ${dateTime.substr(8, 4)}`;
        const expirationDateUtc = moment(dateTimeIso).toDate();

        return { type: "SharedAccessSignature", expires: expirationDateUtc, value: accessToken };
    }

    private parseBearerToken(accessToken: string): AccessToken {
        const decodedToken = Utils.parseJwt(accessToken);
        const exp = moment(decodedToken.exp).toDate();

        return { type: "Bearer", expires: exp, value: accessToken };
    }

    public parseAccessToken(token: string): AccessToken {
        if (!token) {
            throw new Error("Access token is missing.");
        }

        let accessToken: AccessToken;

        if (token.startsWith("Bearer ")) {
            accessToken = this.parseBearerToken(token.replace("Bearer ", ""));
            return accessToken;
        }

        if (token.startsWith("SharedAccessSignature ")) {
            accessToken = this.parseSharedAccessSignature(token.replace("SharedAccessSignature ", ""));
            return accessToken;
        }

        throw new Error(`Access token format is not valid. Please use "Bearer" or "SharedAccessSignature".`);
    }
}