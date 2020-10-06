import { NameValuePair } from "request";
import { ArmResource } from "./contracts/armResource";
import { JwtToken } from "./contracts/jwtToken";
import { js } from "js-beautify";


export class Utils {
    public static getResourceName(resource: string, fullId: string, resultType: string = "name"): string {
        const regexp = new RegExp(`\/${resource}\/(.*)`);
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

        if (milliseconds > 1000) {
            suffix = " s";
            divider = 1000;
        }

        if (milliseconds > 1000 * 60) {
            suffix = " h";
            divider = 1000 * 60;
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

    public static escapeValueForODataFilter(value: string): string {
        value = value
            .replace(/\%/g, "%25")
            .replace(/\"/g, `"`)
            .replace(/\+/g, "%2B")
            .replace(/\//g, "%2F")
            .replace(/\?/g, "%3F")
            .replace(/#/g, "%23")
            .replace(/\&/g, "%26");

        return value;
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
        const decodedToken = JSON.parse(window.atob(base64));

        const now = new Date();
        const offset = now.getTimezoneOffset() * 60000 * 1000;

        if (decodedToken.exp) {
            decodedToken.exp = new Date(decodedToken.exp + offset);
        }

        if (decodedToken.nfb) {
            decodedToken.nfb = new Date(decodedToken.nfb + offset);
        }

        if (decodedToken.iat) {
            decodedToken.iat = new Date(decodedToken.iat + offset);
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
        const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
        return new Date(time).toLocaleDateString("en-US", options);
    }

    public static clone<T>(obj: T): T {
        return JSON.parse(JSON.stringify(obj));
    }

    public static getUtcDateTime(): Date {
        const now = new Date();
        const utc = new Date(now.getTime() + now.getTimezoneOffset() * 60000);

        return utc;
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
}