import { Utils } from "../utils";

export class AccessToken {
    constructor(
        /**
         * Type of token, i.e. Bearer or SharedAccessSignature.
         */
        public readonly type: string,

        /**
         * Token value.
         */
        public readonly value: string,

        /**
         * Token expiration date time (UTC).
         */
        public readonly expires: Date,

        /**
         * User for whom the token was issued.
         */
        public readonly userId?: string) {
    }

    private static parseExtendedSharedAccessSignature(value: string): AccessToken {
        const regex = /token=\"(.*==)\"/gm;
        const match = regex.exec(value);

        if (match && match.length >= 2) {
            const tokenValue = match[1];

            return AccessToken.parseSharedAccessSignature(tokenValue);
        }

        throw new Error(`SharedAccessSignature token format is not valid.`);
    }

    private static parseSharedAccessSignature(value: string): AccessToken {
        const regex = /^[\w\-]*\&(\d*)\&/gm;
        const match = regex.exec(value);

        if (!match || match.length < 2) {
            throw new Error(`SharedAccessSignature token format is not valid.`);
        }

        const dateTime = match[1];
        const year = dateTime.substr(0, 4);
        const month = dateTime.substr(4, 2);
        const day = dateTime.substr(6, 2);
        const hour = dateTime.substr(8, 2);
        const minute = dateTime.substr(10, 2);
        const dateTimeIso = `${year}-${month}-${day}T${hour}:${minute}:00.000Z`;
        const expirationDateUtc = new Date(dateTimeIso);

        return new AccessToken("SharedAccessSignature", value, expirationDateUtc);
    }

    private static parseBearerToken(value: string): AccessToken {
        const decodedToken = Utils.parseJwt(value);
        return new AccessToken("Bearer", value, decodedToken.exp);
    }

    public static parse(token: string): AccessToken {
        if (!token) {
            throw new Error("Access token not specified.");
        }

        if (token.startsWith("Bearer ")) {
            return AccessToken.parseBearerToken(token.replace("Bearer ", ""));
        }

        if (token.startsWith("SharedAccessSignature ")) {
            const value = token.replace("SharedAccessSignature ", "");

            if (value.startsWith("token=")) {
                return AccessToken.parseExtendedSharedAccessSignature(value);
            }
            else {
                return AccessToken.parseSharedAccessSignature(value);
            }
        }

        if (token.startsWith("token=")) {
            return AccessToken.parseExtendedSharedAccessSignature(token);
        }

        const result = AccessToken.parseSharedAccessSignature(token);

        if (result) {
            return result;
        }

        throw new Error(`Access token format is not valid. Please use "Bearer" or "SharedAccessSignature".`);
    }

    public isExpired(): boolean {
        const now = new Date();
        return now > this.expires;
    }

    public expiresInMs(): number {
        return this.expires.getTime() - (new Date()).getTime();
    }

    public toString(): string {
        return `${this.type} token="${this.value}",refresh="true"`;
    }
}