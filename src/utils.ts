import { sanitizeUrl } from "@braintree/sanitize-url";
import { ArmResource } from "./contracts/armResource";
import { JwtToken } from "./contracts/jwtToken";
import { js } from "js-beautify";
import { NameValuePair } from "./contracts/nameValuePair";
import { USER_ID, USER_SESSION } from "./constants";


export class Utils {
    public static getResourceName(resource: string, fullId: string, resultType: string = "name"): string {
        const regexp = new RegExp(`\/${resource}\/((?!${resource}\/).*)`);// negative lookahead to escape cases when "resource" is in "fullId" multiple times in a row (e.g. ...apis/operations/operations/foo - https://github.com/Azure/api-management-developer-portal/issues/2112 )
       const matches = regexp.exec(fullId);

        if (matches && matches.length > 1) {
            switch (resultType) {
                case "name":
                    return matches[1];

                case "shortId":
                    return `/${resource}/${matches[1]}`;

                default:
                    throw new Error(`Unknown resultType: ${resultType}`);
            }
        } else {
            throw new Error("Could not parse ID.");
        }
    }

    public static groupBy<T>(array: T[], valueAccessor: (item: T) => string): T[][] {
        const grouping = array.reduce((groups, item) => {
            let val = valueAccessor(item);

            if (!val) {
                val = "__ungrouped__";
            }

            groups[val] = groups[val] || [];
            groups[val].push(item);

            return groups;
        }, {});

        return Object.keys(grouping).map(x => grouping[x]);
    }

    public static ensureLeadingSlash(url: string): string {
        if (!url.startsWith("/")) {
            url = "/" + url;
        }

        return url;
    }

    public static ensureTrailingSlash(url: string): string {
        if (!url.endsWith("/")) {
            url = url + "/";
        }

        return url;
    }

    public static getQueryParams(queryString: string): any {
        const queryValues = {};
        queryString.split("&").forEach((item) => {
            const queryParam = item.split("=");
            queryValues[queryParam[0]] = queryParam[1];
        });
        return queryValues;
    }

    public static getUrlTemplateParams(uriTemplate: string): string[] {
        const result = [];
        const matches = uriTemplate.match(/{\*?[a-zA-Z0-9_$\-]*}/gm);

        if (matches) {
            matches.forEach((match) => {
                if (result.indexOf(match) === -1) {
                    result.push(match);
                }
            });
        }
        return result;
    }

    /**
     * Returns relative part of the URL.
     */
    public static getRelativeUrl(url: string): string {
        return url.replace(/^(.*\/\/)?[^\/]*/gm, "")
    }

    public static sanitizeReturnUrl(returnUrl: string): string {
        return sanitizeUrl(this.getRelativeUrl(returnUrl));
    }

    public static formatXml(xml: string): string {
        const original = xml;

        try {
            let formatted = "";
            const reg = /(>)(<)(\/*)/g;

            xml = xml.replace(reg, "$1\r\n$2$3");
            let pad = 0;

            xml.split("\r\n").forEach((node) => {
                let indent = 0;
                if (node.match(/.+<\/\w[^>]*>$/)) {
                    indent = 0;
                } else if (node.match(/^<\/\w/)) {
                    if (pad !== 0) {
                        pad -= 1;
                    }
                } else if (node.match(/^<\w[^>]*[^\/]>.*$/)) {
                    indent = 1;
                } else {
                    indent = 0;
                }

                let padding = "";
                for (let i = 0; i < pad; i++) {
                    padding += "    ";
                }

                formatted += padding + node + "\r\n";
                pad += indent;
            });

            return formatted;
        }
        catch (error) {
            return original;
        }
    }

    public static formatJson(json: string): string {
        if (!json) {
            return "";
        }

        if (typeof json === "object") {
            json = JSON.stringify(json);
        }

        const original = json;

        try {
            const formatted = js(json, { indent_size: 4 });

            return formatted;
        }
        catch (error) {
            return original;
        }
    }

    /**
     * Formats number into string.
     * @param num {number} Number to be formatted.
     */
    public static formatNumber(num: number): string {
        let suffix = "";
        let divider = 1;

        if (num > 1000) {
            suffix = " K";
            divider = 1024;
        }

        if (num > 1000 * 1000) {
            suffix = " M";
            divider = 1000 * 1000;
        }

        if (num > 1000 * 1000 * 1000) {
            suffix = " Gb";
            divider = 1000 * 1000 * 1000;
        }

        const result = Math.round(((num / divider) + Number.EPSILON) * 100) / 100;

        return `${result}${suffix}`;
    }

    /**
     * Formats number of bytes into string.
     * @param bytes
     */
    public static formatBytes(bytes: number): string {
        let suffix = " bytes";
        let divider = 1;

        if (bytes > 1024) {
            suffix = " Kb";
            divider = 1024;
        }

        if (bytes > 1024 * 1024) {
            suffix = " Mb";
            divider = 1024 * 1024;
        }

        if (bytes > 1024 * 1024 * 1024) {
            suffix = " Gb";
            divider = 1024 * 1024 * 1024;
        }

        // const result = Math.round(((bytes / divider) + Number.EPSILON) * 100) / 100;

        const result = Math.floor(bytes / divider);

        return `${result}${suffix}`;
    }

    /**
     * Formats time span into string.
     * @param bytes
     */
    public static formatTimespan(milliseconds: number): string {
        let suffix = " ms";
        let divider = 1;

        if (milliseconds >= 1000) {
            suffix = " s";
            divider = 1000;
        }

        if (milliseconds >= 1000 * 60) {
            suffix = " m";
            divider = 1000 * 60;
        }

        if (milliseconds >= 1000 * 60 * 60) {
            suffix = " h";
            divider = 1000 * 60 * 60;
        }

        return `${(milliseconds / divider).toFixed(0)}${suffix}`;
    }

    public static parseHeaderString(headerString: string): NameValuePair[] {
        if (!headerString) {
            return [];
        }

        const headers = [];
        const headerPairs = headerString.split("\u000d\u000a");

        for (const headerPair of headerPairs) {
            const index = headerPair.indexOf("\u003a\u0020");

            if (index > 0) {
                const name = headerPair.substring(0, index);
                const value = headerPair.substring(index + 2);

                const header: NameValuePair = {
                    name: name,
                    value: value
                };

                headers.push(header);
            }
        }
        return headers;
    }

    public static addQueryParameter(uri: string, name: string, value?: string): string {
        uri += `${uri.indexOf("?") >= 0 ? "&" : "?"}${name}`;
        if (value) {
            uri += `=${value}`;
        }
        return uri;
    }

    private static reservedURIComponentCharactersTuples = [
        ["&", "%26"],
        ["+", "%2B"],
        ["/", "%2F"],
        ["?", "%3F"],
        ["#", "%23"],
    ];
    /**
     * Encodes reserved URI character not encoded by the native encodeURI function
     * (encodeURIComponent encodes many characters, which are desired unencoded)
     *
     * @param uri string to be encoded
     * @param additionalReservedTuples optional array of additional reserved tuples to replace
     * @returns encoded string
     */
    public static encodeURICustomized(uri: string, additionalReservedTuples?: [string, string][]): string {
        let encoded = encodeURI(uri);
        const iterateReplace = ([char, charEncoded]: [string, string]) => {
            encoded = encoded.replaceAll(char, charEncoded);
        };
        this.reservedURIComponentCharactersTuples.forEach(iterateReplace);
        if (additionalReservedTuples) additionalReservedTuples.forEach(iterateReplace);
        return encoded;
    }

    public static getBsonObjectId(): string {
        const timestamp = (new Date().getTime() / 1000 | 0).toString(16);

        return timestamp + "xxxxxxxxxxxxxxxx".replace(/[x]/g, () => {
            return (Math.random() * 16 | 0).toString(16);
        }).toLowerCase();
    }

    public static parseJwt(jwtToken: string): JwtToken {
        const base64Url = jwtToken.split(".")[1];
        const base64 = base64Url.replace("-", "+").replace("_", "/");
        const decodedToken = JSON.parse(Buffer.from(base64, "base64").toString());

        if (decodedToken.exp) {
            decodedToken.exp = new Date(parseInt(decodedToken.exp) * 1000);
        }

        if (decodedToken.nfb) {
            decodedToken.nfb = new Date(parseInt(decodedToken.nfb) * 1000);
        }

        if (decodedToken.iat) {
            decodedToken.iat = new Date(parseInt(decodedToken.iat) * 1000);
        }

        return decodedToken;
    }

    public static scrollTo(id: string): void {
        const e = document.getElementById(id);

        if (!!e && e.scrollIntoView) {
            e.scrollIntoView();
        }
    }

    public static ensureUrlArmified(resourceUrl: string): string {
        const regex = /subscriptions\/.*\/resourceGroups\/.*\/providers\/microsoft.ApiManagement\/service/i;
        const isArmUrl = regex.test(resourceUrl);

        if (isArmUrl) {
            return resourceUrl;
        }

        const url = new URL(resourceUrl);
        const protocol = url.protocol;
        const hostname = url.hostname;
        const pathname = url.pathname.endsWith("/")
            ? url.pathname.substring(0, url.pathname.length - 1)
            : url.pathname;

        resourceUrl = `${protocol}//${hostname}/subscriptions/sid/resourceGroups/rgid/providers/Microsoft.ApiManagement/service/sid${pathname}`;

        return resourceUrl;
    }

    public static armifyContract(resource: string, contract: any): ArmResource {
        contract = Utils.clone(contract);
        contract.displayName = contract.name;

        const armifiedContract: ArmResource = {
            id: contract.id,
            name: this.getResourceName(resource, contract.id, "name"),
            properties: contract
        };

        delete contract.id;
        delete contract.name;

        return armifiedContract;
    }

    /**
     * This is a function used to generate long date format like (Weekday, Month, Day, Year)
     *
     * @param time time string
     */
    public static formatDateTime(time: string): string {
        const options: any = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
        return new Date(time).toLocaleDateString("en-US", options);
    }

    public static clone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

    public static readFileAsByteArray(file: File): Promise<Uint8Array> {
        return new Promise<Uint8Array>(resolve => {
            const reader = new FileReader();

            reader.onload = (event: any) => {
                resolve(event.target.result);
            };

            reader.readAsArrayBuffer(file);
        });
    }

    public static guid(): string {
        function s4(): string {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }
        return s4() + s4() + "-" + s4() + "-" + s4() + "-" +
            s4() + "-" + s4() + s4() + s4();
    }

    public static toTitleCase(value: string): string {
        return value
            .toLowerCase()
            .split(" ")
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
    }

    public static isJsonContentType(contentType: string): boolean {
        return /\bjson\b/i.test(contentType.toLocaleLowerCase());
    }

    public static isXmlContentType(contentType: string): boolean {
        return /\bxml\b/i.test(contentType.toLocaleLowerCase());
    }

    public static getCookie(name: string): { name: string, value: string, expiresInDays?: number } | null {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length !== 2) {
            return null;
        }

        const cookieValue = parts.pop().split(';').shift();
        const cookieParts = document.cookie.split(';').map(cookie => cookie.trim());
        const cookieString = cookieParts.find(cookie => cookie.startsWith(`${name}=`));
        let expiresInDays: number | undefined;

        if (cookieString) {
            const expiresPart = cookieString.split(';').find(part => part.trim().startsWith('expires='));
            if (expiresPart) {
                const expiresDate = new Date(expiresPart.split('=')[1]);
                const currentDate = new Date();
                expiresInDays = Math.ceil((expiresDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));
            }
        }

        return { name, value: cookieValue, expiresInDays };
    }

    public static setCookie(name: string, value: string, days?: number): void {
        let expires = "";
        if (days) {
            expires = `; expires=${new Date(Date.now() + days * 24 * 60 * 60 * 1000).toUTCString()}`;
        }
        document.cookie = `${name}=${value}${expires}; path=/`;
    }

    public static getUserData(): { userId: string; sessionId: string; } {
        return {
            userId: localStorage.getItem(USER_ID),
            sessionId: sessionStorage.getItem(USER_SESSION)
        };
    }
}
