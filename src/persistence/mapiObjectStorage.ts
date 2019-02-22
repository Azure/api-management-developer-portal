import * as _ from "lodash";
import * as Objects from "@paperbits/common";
import { IObjectStorage, Query, Operator } from "@paperbits/common/persistence";
import { MapiClient } from "../services/mapiClient";
import { Page } from "../models/page";
import { HttpHeader } from "@paperbits/common/http";


export class MapiObjectStorage implements IObjectStorage {
    constructor(private readonly smapiClient: MapiClient) { }

    public ArmResourceToPaperbitsKey(resource: string): string {
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
            await this.smapiClient.put<T>(resource, headers, converted);
        }
        catch (error) {
            throw new Error(`Could not add object '${path}'. Error: ${error}`);
        }
    }

    public async getObject<T>(path: string): Promise<T> {
        try {
            const resource = this.paperbitsKeyToArmResource(path);
            const item = await this.smapiClient.get<T>(`${resource}`);
            const converted = this.convertArmContractToPaperbitsContract(item);

            if (path.contains("settings") || path.contains("styles")) {
                return (<any>converted).nodes[0];
            }

            if (path.contains("navigationItems")) {
                return (<any>converted).nodes;
            }

            return converted;
        }
        catch (error) {
            console.warn(`Could not get object '${path}'. Error: ${error}.`);
        }
    }

    public async deleteObject(path: string): Promise<void> {
        const resource = this.paperbitsKeyToArmResource(path);

        try {
            const headers: HttpHeader[] = [];
            headers.push({ name: "If-Match", value: "*" });

            await this.smapiClient.delete(resource, headers);
        }
        catch (error) {
            throw new Error(`Could not delete object '${path}'. Error: ${error}.`);
        }
    }

    public async updateObject<T>(path: string, dataObject: T): Promise<void> {
        let converted = this.convertPaperbitsContractToArmContract(dataObject);
        const resource = this.paperbitsKeyToArmResource(path);

        let exists: boolean;

        try {

            if (path.contains("settings") || path.contains("styles")) {
                converted = { nodes: [converted ] };
            }

            if (path.contains("navigationItems")) {
                converted = { nodes: converted };
            }

            await this.smapiClient.head<T>(resource);
            exists = true;
        }
        catch (error) {
            if (error && error.code === "ResourceNotFound") {
                exists = false;
            }
            else {
                throw new Error(`Could not update object '${path}'. Error: ${error}`);
            }
        }

        try {
            const headers: HttpHeader[] = [];

            if (exists) {
                headers.push({ name: "If-Match", value: "*" });
            }

            await this.smapiClient.put<T>(resource, headers, converted);
        }
        catch (error) {
            throw new Error(`Could not update object '${path}'. Error: ${error}`);
        }
    }

    public async searchObjects<T>(path: string, query: Query<T>): Promise<T[]> {
        const resource = this.paperbitsKeyToArmResource(path);

        if (!resource.contains("contentTypes")) {
            debugger;
        }

        try {
            let filterQueryString = "";

            if (query && query.filters.length > 0) {
                for (const filter of query.filters) {
                    const operator = filter.operator;

                    switch (operator) {
                        case Operator.equals:
                            filterQueryString += `&$filter=permalink eq '${filter.right}'`;
                            break;

                        case Operator.contains:
                            filterQueryString += `&$filter=contains(${filter.left},'${filter.right}')`;
                            break;

                        default:
                            throw new Error(`Cannot translate operator into OData query.`);
                    }
                }
            }

            if (path.contains("navigationItems")) {
                const item = await this.smapiClient.get<any>(`${resource}?$orderby=title${filterQueryString}`);
                const converted = this.convertArmContractToPaperbitsContract(item);
                return converted.nodes;
            }
            else {
                const pageOfTs = await this.smapiClient.get<Page<T>>(`${resource}?$orderby=title${filterQueryString}`);
                const searchResult = {};

                for (const item of pageOfTs.value) {
                    const converted = this.convertArmContractToPaperbitsContract(item);

                    const segments = converted.key.split("/");
                    const key = segments[1];

                    searchResult[key] = converted;
                }

                return <any>searchResult;
            }
        }
        catch (error) {
            console.warn(`Could not search object '${path}'. Error: ${error}.`);
            // throw new Error(`Could not search object '${path}'. Error: ${error}.`);
        }
    }

    private convertPaperbitsContractToArmContract(contract: any): any {
        const converted = {};

        Object.keys(contract).forEach(propertyName => {
            const propertyValue = contract[propertyName];
            let convertedKey = propertyName;
            let convertedValue = propertyValue;

            if (propertyValue && Array.isArray(propertyValue)) {
                convertedValue = propertyValue.map(x => this.convertPaperbitsContractToArmContract(x));
            }
            else if (propertyValue && typeof propertyValue === "object") {
                convertedValue = this.convertPaperbitsContractToArmContract(propertyValue);
            }
            else {
                convertedKey = propertyName
                    .replace(/contentKey/gm, "documentId")
                    .replace(/Key\b/gm, "Id")
                    .replace(/\bkey\b/gm, "id");

                if (typeof propertyValue === "string" && propertyName !== convertedKey) {
                    convertedValue = this.paperbitsKeyToArmResource(propertyValue);
                }
            }

            converted[convertedKey] = convertedValue;
        });

        return converted;
    }

    private convertArmContractToPaperbitsContract(contract: any): any {
        const converted = {};

        Object.keys(contract).forEach(propertyName => {
            const propertyValue = contract[propertyName];
            let convertedKey = propertyName;
            let convertedValue = propertyValue;

            if (propertyValue && Array.isArray(propertyValue)) {
                convertedValue = propertyValue.map(x => this.convertArmContractToPaperbitsContract(x));
            }
            else if (propertyValue && typeof propertyValue === "object") {
                convertedValue = this.convertArmContractToPaperbitsContract(propertyValue);
            }
            else {
                convertedKey = propertyName
                    .replace(/documentId/gm, "contentKey")
                    .replace(/Id\b/gm, "Key")
                    .replace(/\bid\b/gm, "key");

                if (typeof propertyValue === "string" && propertyValue.contains("contentType")) {
                    convertedValue = this.ArmResourceToPaperbitsKey(propertyValue);
                }
            }

            converted[convertedKey] = convertedValue;
        });

        return converted;
    }

    public async saveChanges(delta: Object): Promise<void> {
        console.log("Saving changes...");

        const saveTasks = [];
        const keys = [];

        Object.keys(delta).map(key => {
            const firstLevelObject = delta[key];

            if (["pages", "layouts", "files", "uploads", "blocks", "urls"].contains(key)) {
                Object.keys(firstLevelObject).forEach(subkey => {
                    keys.push(`${key}/${subkey}`);
                });
            }

            if (["navigationItems", "settings", "styles"].contains(key)) {
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