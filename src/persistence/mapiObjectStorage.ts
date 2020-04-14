import * as _ from "lodash";
import * as Objects from "@paperbits/common";
import { IObjectStorage, Query, Operator } from "@paperbits/common/persistence";
import { MapiClient } from "../services/mapiClient";
import { Page } from "../models/page";
import { HttpHeader } from "@paperbits/common/http";
import { ArmResource } from "../contracts/armResource";


const localizedContentTypes = ["page", "layout", "blogpost", "navigation", "block"];
const selectedLocale = "en_us";


export class MapiObjectStorage implements IObjectStorage {
    constructor(private readonly mapiClient: MapiClient) { }

    private getContentTypeFromResource(resource: string): string {
        const regex = /contentTypes\/([\w]*)/gm;
        const match = regex.exec(resource);

        if (match && match.length > 0) {
            const contentType = match[1];
            return contentType;
        }

        throw new Error(`Could not determine content type by resource: ${resource}`);
    }

    public armResourceToPaperbitsKey(resource: string): string {
        if (!resource.contains("contentTypes")) {
            return resource;
        }

        const regex = /contentTypes\/(.*)\/contentItems\/(.*)/gm;
        const match = regex.exec(resource);
        const mapiContentType = match[1];
        const mapiContentItem = match[2];

        let contentType;
        let contentItem;

        switch (mapiContentType) {
            case "page":
                contentType = "pages";
                contentItem = mapiContentItem;
                break;

            case "layout":
                contentType = "layouts";
                contentItem = mapiContentItem;
                break;

            case "blob":
                contentType = "uploads";
                contentItem = mapiContentItem;
                break;

            case "block":
                contentType = "blocks";
                contentItem = mapiContentItem;
                break;

            case "url":
                contentType = "urls";
                contentItem = mapiContentItem;
                break;

            case "navigation":
                contentType = "navigationItems";
                contentItem = null;
                break;

            case "configuration":
                contentType = "settings";
                contentItem = null;
                break;

            case "stylesheet":
                contentType = "styles";
                contentItem = null;
                break;

            case "document":
                contentType = "files";
                contentItem = mapiContentItem;
                break;

            default:
                throw new Error(`Unknown content type: "${mapiContentType}"`);
        }

        let key = contentType;

        if (contentItem) {
            key += `/${contentItem}`;
        }

        return key;
    }

    public paperbitsKeyToArmResource(key: string): string {
        if (key.startsWith("/")) {
            key = key.substring(1);
        }

        if (key.startsWith("contentTypes")) {
            return key;
        }

        const segments = key.split("/");
        const contentType = segments[0];
        const contentItem = segments[1];

        let mapiContentType;
        let mapiContentItem;

        switch (contentType) {
            case "pages":
                mapiContentType = "page";
                mapiContentItem = contentItem;
                break;

            case "layouts":
                mapiContentType = "layout";
                mapiContentItem = contentItem;
                break;

            case "uploads":
                mapiContentType = "blob";
                mapiContentItem = contentItem;
                break;

            case "blocks":
                mapiContentType = "block";
                mapiContentItem = contentItem;
                break;

            case "urls":
                mapiContentType = "url";
                mapiContentItem = contentItem;
                break;

            case "navigationItems":
                mapiContentType = "document";
                mapiContentItem = "navigation";
                break;

            case "settings":
                mapiContentType = "document";
                mapiContentItem = "configuration";
                break;

            case "styles":
                mapiContentType = "document";
                mapiContentItem = "stylesheet";
                break;

            case "files":
                mapiContentType = "document";
                mapiContentItem = contentItem;
                break;

            case "locales":
                mapiContentType = "locales";
                mapiContentItem = "en-us";
                break;

            default:
                // throw new Error(`Unknown content type: "${contentType}"`);
                return key;
        }

        let resource = `contentTypes/${mapiContentType}/contentItems`;

        if (mapiContentItem) {
            resource += `/${mapiContentItem}`;
        }

        return resource;
    }

    public async addObject<T>(path: string, dataObject: T): Promise<void> {
        const converted = this.convertPaperbitsContractToArmContract(dataObject);
        const resource = this.paperbitsKeyToArmResource(path);

        try {
            const headers: HttpHeader[] = [];
            await this.mapiClient.put<T>(resource, headers, converted);
        }
        catch (error) {
            throw new Error(`Could not add object '${path}'. Error: ${error.message}`);
        }
    }

    public async getObject<T>(key: string): Promise<T> {
        try {
            const resource = this.paperbitsKeyToArmResource(key);
            const contentType = this.getContentTypeFromResource(resource);
            const isLocalized = localizedContentTypes.includes(contentType);
            const item = await this.mapiClient.get<T>(`${resource}`);
            const converted = this.convertArmContractToPaperbitsContract(item, isLocalized);

            if (key === "locales") {
                return <any>{
                    key: `contentTypes/locales/contentItem/en_us`,
                    code: "en-us",
                    displayName: "English (US)"
                };
            }

            if (key.contains("settings") || key.contains("styles")) {
                return (<any>converted).nodes[0];
            }

            if (key.contains("navigationItems")) {
                return (<any>converted).nodes;
            }

            return converted;
        }
        catch (error) {
            if (error && error.code === "ResourceNotFound") {
                return null;
            }

            throw new Error(`Could not get object '${key}'. Error: ${error.message}`);
        }
    }

    public async deleteObject(path: string): Promise<void> {
        const resource = this.paperbitsKeyToArmResource(path);

        try {
            const headers: HttpHeader[] = [];
            headers.push({ name: "If-Match", value: "*" });

            await this.mapiClient.delete(resource, headers);
        }
        catch (error) {
            throw new Error(`Could not delete object '${path}'. Error: ${error.message}`);
        }
    }

    public async updateObject<T>(key: string, dataObject: T): Promise<void> {
        const resource = this.paperbitsKeyToArmResource(key);
        const contentType = this.getContentTypeFromResource(resource);
        const isLocalized = localizedContentTypes.includes(contentType);
        let paperbitsContract;

        if (isLocalized) {
            const locale = selectedLocale.replace("_", "-");

            paperbitsContract = {
                [selectedLocale]: dataObject["locales"][locale]
            };
        }
        else {
            paperbitsContract = dataObject;
        }

        let armContract = this.convertPaperbitsContractToArmContract(paperbitsContract);

        let exists: boolean;

        try {

            if (key.contains("settings") || key.contains("styles")) {
                armContract = { nodes: [armContract] };
            }

            if (key.contains("navigationItems")) {
                armContract = { nodes: armContract };
            }

            if (key.contains("files")) {
                delete armContract["type"];
            }

            await this.mapiClient.head<T>(resource);
            exists = true;
        }
        catch (error) {
            if (error && error.code === "ResourceNotFound") {
                exists = false;
            }
            else {
                throw new Error(`Could not update object '${key}'. Error: ${error.message}`);
            }
        }

        try {
            const headers: HttpHeader[] = [];

            if (exists) {
                headers.push({ name: "If-Match", value: "*" });
            }

            await this.mapiClient.put<T>(resource, headers, armContract);
        }
        catch (error) {
            throw new Error(`Could not update object '${key}'. Error: ${error.message}`);
        }
    }

    public async searchObjects<T>(key: string, query: Query<T>): Promise<T[]> {
        const resource = this.paperbitsKeyToArmResource(key);
        const contentType = this.getContentTypeFromResource(resource);
        const isLocalized = localizedContentTypes.includes(contentType);
        const localeSearchPrefix = isLocalized ? `${selectedLocale}/` : "";

        try {
            let filterQueryString = "";

            if (query && query.filters.length > 0) {
                const filterExpressions = [];

                for (const filter of query.filters) {
                    const operator = filter.operator;
                    filter.left = filter.left.replace("locales/en-us/", "en_us/");

                    switch (operator) {
                        case Operator.equals:
                            filterExpressions.push(`${filter.left} eq '${filter.right}'`);
                            break;

                        case Operator.contains:
                            filterExpressions.push(`contains(${filter.left},'${filter.right}')`);
                            break;

                        default:
                            throw new Error(`Cannot translate operator into OData query.`);
                    }
                }

                filterQueryString = `&$filter=${filterExpressions.join(" and ")}`;
            }

            if (key.contains("navigationItems")) {
                const armContract = await this.mapiClient.get<any>(`${resource}?$orderby=${localeSearchPrefix}title${filterQueryString}`);
                const paperbitsContract = this.convertArmContractToPaperbitsContract(armContract, isLocalized);
                return paperbitsContract.nodes;
            }
            else {
                const pageOfTs = await this.mapiClient.get<Page<T>>(`${resource}?$orderby=${localeSearchPrefix}title${filterQueryString}`);
                const searchResult = {};

                for (const item of pageOfTs.value) {
                    const converted = this.convertArmContractToPaperbitsContract(item, isLocalized);

                    const segments = converted.key.split("/");
                    const key = segments[1];

                    searchResult[key] = converted;
                }

                return <any>searchResult;
            }
        }
        catch (error) {
            throw new Error(`Could not search object '${key}'. Error: ${error.message}`);
        }
    }

    public convertPaperbitsContractToArmContract(contract: any): any {
        let converted;

        if (contract === null || contract === undefined) { // here we expect "false" as a value too
            return null;
        }

        if (Array.isArray(contract)) {
            converted = contract.map(x => this.convertPaperbitsContractToArmContract(x));
        }
        else if (typeof contract === "object") {
            converted = {};

            Object.keys(contract).forEach(propertyName => {
                const propertyValue = contract[propertyName];
                let convertedKey = propertyName;
                let convertedValue = propertyValue;

                convertedKey = propertyName
                    .replace(/contentKey/gm, "documentId")
                    .replace(/Key\b/gm, "Id")
                    .replace(/\bkey\b/gm, "id");

                if (typeof propertyValue === "string") {
                    if (propertyName !== convertedKey) {
                        convertedValue = this.paperbitsKeyToArmResource(propertyValue);
                    }
                }
                else {
                    convertedValue = this.convertPaperbitsContractToArmContract(propertyValue);
                }

                converted[convertedKey] = convertedValue;
            });
        }
        else {
            converted = contract;
        }

        return converted;
    }

    public convertArmContractToPaperbitsContract(contractObject: ArmResource | any, isLocalized: boolean = false, isArm: boolean = true): any {
        if (contractObject === null || contractObject === undefined) {
            return contractObject;
        }

        let contract: any;

        if (isLocalized) {
            const locale = selectedLocale.replace("_", "-");

            contract = {
                key: contractObject.id,
                locales: {
                    [locale]: contractObject.properties[selectedLocale]
                }
            };
        }
        else {
            if (isArm) {
                contract = contractObject.properties;
                contract.key = contractObject.id;
            }
            else {
                contract = contractObject;
            }
        }

        let converted;

        if (Array.isArray(contract)) {
            converted = contract.map(x => this.convertArmContractToPaperbitsContract(x, false, false));
        }
        else if (typeof contract === "object") {
            converted = {};

            Object.keys(contract).forEach(propertyName => {
                const propertyValue = contract[propertyName];
                let convertedKey = propertyName;
                let convertedValue = propertyValue;

                convertedKey = propertyName
                    .replace(/documentId/gm, "contentKey")
                    .replace(/Id\b/gm, "Key")
                    .replace(/\bid\b/gm, "key");

                if (typeof propertyValue === "string" && propertyValue.contains("contentType")) {
                    convertedValue = this.armResourceToPaperbitsKey(propertyValue);
                }
                else {
                    convertedValue = this.convertArmContractToPaperbitsContract(propertyValue, false, false);
                }

                converted[convertedKey] = convertedValue;
            });
        }
        else {
            converted = contract;
        }

        return converted;
    }

    public async saveChanges(delta: Object): Promise<void> {
        const saveTasks = [];
        const keys = [];

        Object.keys(delta).map(key => {
            const firstLevelObject = delta[key];

            if (["pages", "layouts", "files", "uploads", "blocks", "urls"].includes(key)) {
                Object.keys(firstLevelObject).forEach(subkey => {
                    keys.push(`${key}/${subkey}`);
                });
            }

            if (["navigationItems", "settings", "styles"].includes(key)) {
                keys.push(key);
            }
        });

        keys.forEach(key => {
            const changeObject = Objects.getObjectAt(key, delta);

            if (changeObject) {
                saveTasks.push(this.updateObject(key, changeObject));
            }
            else {
                saveTasks.push(this.deleteObject(key));
            }
        });

        await Promise.all(saveTasks);
    }
}