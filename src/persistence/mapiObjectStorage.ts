import * as Objects from "@paperbits/common";
import { IObjectStorage, Query, Operator, Page } from "@paperbits/common/persistence";
import { MapiClient } from "../services/mapiClient";
import { HttpHeader } from "@paperbits/common/http";
import { ArmResource } from "../contracts/armResource";
import { AppError } from "../errors";
import { defaultPageSize } from "../constants";
import { PageContract } from "../contracts/page";
import { LocaleModel } from "@paperbits/common/localization";
import { PopupModel } from "@paperbits/core/popup";


const localizedContentTypes = ["page", "layout", "blogpost", "navigation", "block"];
const selectedLocale = "en_us";
const reservedArmIds = ["containerId", "webContainerId", "appId", "accountId"];
const reservedPaperbitsIds = ["containerKey", "webContainerKey"];


export class MapiObjectStorage implements IObjectStorage {
    constructor(private readonly mapiClient: MapiClient) { }

    private getContentTypeFromResource(resource: string): string {
        const regex = /contentTypes\/([\w]*)/gm;
        const match = regex.exec(resource);

        if (match && match.length > 0) {
            const contentType = match[1];
            return contentType;
        }

        throw new AppError(`Could not determine content type by resource: ${resource}`);
    }

    private delocalizeBlock(contract: any): void {
        contract.contentKey = contract["locales"]["en-us"]["contentKey"];
        contract.title = contract["locales"]["en-us"]["title"];
        contract.description = contract["locales"]["en-us"]["description"];
        contract.type = contract["locales"]["en-us"]["type"];

        delete contract["locales"];
    }

    private localizeBlock(contract: any): void {
        contract.locales = {
            "en-us": {
                contentKey: contract.contentKey,
                title: contract.title,
                description: contract.description,
                type: contract.type
            }
        };

        delete contract["contentKey"];
        delete contract["title"];
        delete contract["description"];
    }

    public armResourceToPaperbitsKey(resource: string): string {
        if (!resource.includes("contentTypes")) {
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
                throw new AppError(`Unknown content type: "${mapiContentType}"`);
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

            case "popups":
                mapiContentType = "popups";
                mapiContentItem = contentItem;
                break;

            default:
                // throw new AppError(`Unknown content type: "${contentType}"`);
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
            const headers: HttpHeader[] = [MapiClient.getPortalHeader("addObject")];
            await this.mapiClient.put<T>(resource, headers, { properties: converted });
        }
        catch (error) {
            throw new AppError(`Could not add object '${path}'.`, error);
        }
    }

    public async getObject<T>(key: string): Promise<T> {
        try {
            if (key === "locales") {
                return <any>{
                    key: `contentTypes/locales/contentItem/en_us`,
                    code: "en-us",
                    displayName: "English (US)"
                };
            }

            const resource = this.paperbitsKeyToArmResource(key);
            const contentType = this.getContentTypeFromResource(resource);
            const isLocalized = localizedContentTypes.includes(contentType);
            const item = await this.mapiClient.get<T>(`${resource}`, [MapiClient.getPortalHeader("getObject")]);
            const converted = this.convertArmContractToPaperbitsContract(item, isLocalized);

            if (key.startsWith("blocks/")) {
                this.delocalizeBlock(converted);
            }

            if (key.includes("settings") || key.includes("styles")) {
                return (<any>converted).nodes[0];
            }

            if (key.includes("navigationItems")) {
                return (<any>converted).nodes;
            }

            return converted;
        }
        catch (error) {
            if (error?.code === "ResourceNotFound") {
                return null;
            }

            throw new AppError(`Could not get object '${key}'.`, error);
        }
    }

    public async deleteObject(path: string): Promise<void> {
        const resource = this.paperbitsKeyToArmResource(path);

        try {
            const headers: HttpHeader[] = [];
            headers.push({ name: "If-Match", value: "*" }, MapiClient.getPortalHeader("deleteObject"));

            await this.mapiClient.delete(resource, headers);
        }
        catch (error) {
            throw new AppError(`Could not delete object '${path}'.`, error);
        }
    }

    public async updateObject<T>(key: string, dataObject: T): Promise<void> {
        const resource = this.paperbitsKeyToArmResource(key);
        const contentType = this.getContentTypeFromResource(resource);
        const isLocalized = localizedContentTypes.includes(contentType);
        let paperbitsContract;

        if (isLocalized) {
            const locale = selectedLocale.replace("_", "-");

            if (key.startsWith("blocks/")) {
                this.localizeBlock(dataObject);
            }

            paperbitsContract = {
                [selectedLocale]: dataObject["locales"][locale]
            };
        }
        else {
            paperbitsContract = dataObject;
        }

        let armContract = this.convertPaperbitsContractToArmContract(paperbitsContract);

        delete armContract["id"];

        let exists: boolean;

        try {
            if (key.includes("settings") || key.includes("styles")) {
                armContract = { nodes: [armContract] };
            }

            if (key.includes("navigationItems")) {
                armContract = { nodes: armContract };
            }

            if (key.includes("files")) {
                delete armContract["type"];
            }

            await this.mapiClient.head<T>(resource);
            exists = true;
        }
        catch (error) {
            if (error?.code === "ResourceNotFound") {
                exists = false;
            }
            else {
                throw new AppError(`Could not update object '${key}'.`, error);
            }
        }

        try {
            const headers: HttpHeader[] = [MapiClient.getPortalHeader("updateObject")];

            if (exists) {
                headers.push({ name: "If-Match", value: "*" });
            }

            await this.mapiClient.put<T>(resource, headers, { properties: armContract });
        }
        catch (error) {
            throw new AppError(`Could not update object '${key}'.`, error);
        }
    }

    private async loadNextPage<T>(resource: string, localeSearchPrefix: string, filterQueryString: string, orderQueryString: string, skip: number, isLocalized: boolean): Promise<Page<T>> {
        const url = `${resource}?$skip=${skip}&$top=${defaultPageSize}${filterQueryString}${orderQueryString}`;
        const pageOfTs = await this.mapiClient.get<PageContract<T>>(url, [MapiClient.getPortalHeader("getPageData")]);
        const searchResult = [];

        for (const item of pageOfTs.value) {
            const converted = this.convertArmContractToPaperbitsContract(item, isLocalized);

            if (resource.startsWith("contentTypes/block/contentItems")) {
                this.delocalizeBlock(converted);
            }

            searchResult.push(converted);
        }

        const resultPage: Page<T> = {
            value: searchResult,
            takeNext: async (): Promise<Page<T>> => {
                return await this.loadNextPage(resource, localeSearchPrefix, filterQueryString, orderQueryString, skip + defaultPageSize, isLocalized);
            }
        };

        if (!pageOfTs.nextLink || pageOfTs.value.length === 0) {
            resultPage.takeNext = null;
        }

        return resultPage;
    }

    public async searchObjects<T>(key: string, query: Query<T>): Promise<Page<T>> {
        const resource = this.paperbitsKeyToArmResource(key);
        const contentType = this.getContentTypeFromResource(resource);
        const isLocalized = localizedContentTypes.includes(contentType);
        const localeSearchPrefix = isLocalized ? `${selectedLocale}/` : "";

        if (key === "popups") {
            const pageOfPopups: Page<PopupModel> = {
                value: []
            };

            return <any>pageOfPopups;
        }

        if (key === "locales") {
            const pageOfLocales: Page<LocaleModel> = {
                value: [{
                    key: `contentTypes/locales/contentItem/en_us`,
                    code: "en-us",
                    displayName: "English (US)"
                }]
            };

            return <any>pageOfLocales;
        }

        try {
            let filterQueryString = "";
            let orderQueryString = "";

            if (query?.filters.length > 0) {
                const filterExpressions = [];

                for (const filter of query.filters) {
                    const operator = filter.operator;

                    if (resource.startsWith("contentTypes/block/contentItems")) {
                        filter.left = `en_us/${filter.left}`;
                    }

                    filter.left = filter.left.replace("locales/en-us/", "en_us/");

                    switch (operator) {
                        case Operator.equals:
                            filterExpressions.push(`${filter.left} eq '${filter.right}'`);
                            break;

                        case Operator.contains:
                            if (filter.left !== "mimeType") { // Need to make this field indexable in content type first.
                                filterExpressions.push(`contains(${filter.left},'${filter.right}')`);
                            }

                            break;

                        default:
                            throw new AppError(`Cannot translate operator into OData query.`);
                    }
                }

                if (filterExpressions.length > 0) {
                    filterQueryString = `&$filter=${filterExpressions.join(" and ")}`;
                }
            }

            if (query?.orderingBy) {
                query.orderingBy = query.orderingBy.replace("locales/en-us/", localeSearchPrefix);
                orderQueryString = `&$orderby=${query.orderingBy}`;
            }

            if (key.includes("navigationItems")) {
                const armContract = await this.mapiClient.get<any>(`${resource}?$orderby=${localeSearchPrefix}title${filterQueryString}`, [MapiClient.getPortalHeader("searchObjects")]);
                const paperbitsContract = this.convertArmContractToPaperbitsContract(armContract, isLocalized);
                return paperbitsContract.nodes;
            }

            return await this.loadNextPage(resource, localeSearchPrefix, filterQueryString, orderQueryString, 0, isLocalized);
        }
        catch (error) {
            throw new AppError(`Could not search object '${key}'. Error: ${error.message}`, error);
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

                if (!reservedPaperbitsIds.includes(convertedKey)) {
                    convertedKey = propertyName
                        .replace(/contentKey/gm, "documentId")
                        .replace(/Key\b/gm, "Id")
                        .replace(/\bkey\b/gm, "id");
                }

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

                if (!reservedArmIds.includes(propertyName)) {
                    convertedKey = propertyName
                        .replace(/documentId/gm, "contentKey")
                        .replace(/Id\b/gm, "Key")
                        .replace(/\bid\b/gm, "key");
                }

                if (typeof propertyValue === "string" && propertyValue.includes("contentType")) {
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