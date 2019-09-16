import { ProductContract } from "./../contracts/product";
import { ApiContract } from "../contracts/api";
import { TagResourceContract } from "../contracts/tagResource";
import { PageContract } from "../contracts/page";
import { ApiSearchQuery } from "../contracts/apiSearchQuery";
import { Api } from "../models/api";
import { VersionSet } from "../models/versionSet";
import { Page } from "../models/page";
import { Operation } from "../models/operation";
import { Product } from "../models/product";
import { Schema } from "../models/schema";
import { MapiClient } from "./mapiClient";
import { Utils } from "../utils";
import { OperationContract } from "../contracts/operation";
import { SchemaContract } from "../contracts/schema";
import { VersionSetContract } from "../contracts/apiVersionSet";
import { HttpHeader } from "@paperbits/common/http/httpHeader";


export class ApiService {
    constructor(private readonly smapiClient: MapiClient) { }

    public async getApis(searchRequest?: ApiSearchQuery): Promise<Page<Api>> {
        let query = "/apis?expandApiVersionSet=true";

        if (searchRequest) {
            searchRequest.tags.forEach((tag, index) => {
                query = Utils.addQueryParameter(query, `tags[${index}]=${tag.name}`);
            });

            if (searchRequest.pattern) {
                const pattern = Utils.escapeValueForODataFilter(searchRequest.pattern);
                query = Utils.addQueryParameter(query, `$filter=contains(properties/name,'${encodeURIComponent(pattern)}')`);
            }
        }

        const result = await this.smapiClient.get<Page<ApiContract>>(query);

        // return {
        //     value: result.value.map(x => new Api(x)),
        //     count: result.count,
        //     nextPage: result.nextPage
        // };

        const page = new Page<Api>();
        page.value = result.value.map(x => new Api(x));

        return page;
    }

    public async getVersionSetApis(versionSetId: string): Promise<Api[]> {
        if (!versionSetId) {
            return null;
        }
        const query = "/apis?expandApiVersionSet=true";

        const apisPage = await this.smapiClient.get<Page<ApiContract>>(query);

        const result = apisPage.value.filter(x => x.properties.apiVersionSetId && Utils.getResourceName("api-version-sets", x.properties.apiVersionSetId, "shortId") === versionSetId).map(x => new Api(x));

        return result;
    }

    public async getApisByTags(searchRequest?: ApiSearchQuery): Promise<PageContract<TagResourceContract[]>> {
        throw new Error("Not implemented.");
    }

    public async getApi(apiId: string, revision?: string): Promise<Api> {
        let apiResourceUri = apiId;

        if (revision) {
            apiResourceUri += `;rev=${revision}`;
        }

        apiResourceUri += `?expandApiVersionSet=true`; // TODO: doesn't work in non-ARM resources

        const apiContract = await this.smapiClient.get<ApiContract>(apiResourceUri);

        if (!apiContract) {
            return null;
        }

        const api = new Api(apiContract);

        if (apiContract.properties.apiVersionSetId && !api.apiVersionSet) {
            const setId = Utils.getResourceName("api-version-sets", apiContract.properties.apiVersionSetId, "shortId");
            api.apiVersionSet = await this.getApiVersionSet(setId);
        }

        return api;
    }

    public exportApi(apiId: string, format: string): Promise<string> {
        const header: HttpHeader = {
            name: "Accept",
            value: "application/vnd.swagger.doc+json"
        };
        switch (format) {
            case "wadl":
                header.value = "application/vnd.sun.wadl+xml";
                break;
            case "wsdl":
                header.value = "application/wsdl+xml";
                break;
            case "swagger": //json 2.0
                header.value = "application/vnd.swagger.doc+json";
                break;
            case "openapi": //yaml 3.0
                header.value = "application/vnd.oai.openapi";
                break;
            case "openapi+json": //json 3.0
                header.value = "application/vnd.oai.openapi+json";
                break;
            default:
        }

        return this.smapiClient.get<string>(apiId, [header]);
    }

    public async getApiVersionSet(versionSetId: string): Promise<VersionSet> {
        const versionSetContract = await this.smapiClient.get<VersionSetContract>(versionSetId);
        return new VersionSet(versionSetContract.id, versionSetContract);
    }

    public async getOperation(operationId: string): Promise<Operation> {
        const operationContract = await this.smapiClient.get<OperationContract>(operationId);

        if (!operationContract) {
            return null;
        }

        const operation = new Operation(operationContract);

        return operation;
    }

    public async getOperations(apiId: string, searchQuery?: ApiSearchQuery): Promise<Page<Operation>> {
        let query = `${apiId}/operations`;

        let top;

        if (searchQuery) {
            searchQuery.tags.forEach((tag, index) => {
                query = Utils.addQueryParameter(query, `tags[${index}]=${tag.name}`);
            });

            if (searchQuery.pattern) {
                const pattern = Utils.escapeValueForODataFilter(searchQuery.pattern);
                query = Utils.addQueryParameter(query, `$filter=contains(properties/name,'${encodeURIComponent(pattern)}')`);
            }

            top = searchQuery.top;

            if (searchQuery.skip) {
                query = Utils.addQueryParameter(query, `$skip=${searchQuery.skip}`);
            }
        }

        query = Utils.addQueryParameter(query, `$top=${top || 20}`);

        const result = await this.smapiClient.get<Page<OperationContract>>(query);
        const page = new Page<Operation>();

        page.value = result.value.map(c => new Operation(<any>c));
        page.nextLink = result.nextLink;

        return page;
    }

    private lastApiSchemas = {};

    public async getApiSchema(schemaId: string): Promise<Schema> {
        const apiId = schemaId.split("/schemas").shift();
        let cachedApi = this.lastApiSchemas[apiId];
        if (!cachedApi) {
            // clean cache if apiId changed
            if (Object.keys(this.lastApiSchemas).length > 0) {
                this.lastApiSchemas = {};
            }
            this.lastApiSchemas[apiId] = {};
            cachedApi = this.lastApiSchemas[apiId];
        }

        const cached = cachedApi && cachedApi[schemaId];
        if (cached) {
            return cached;
        }
        
        const schema = await this.smapiClient.get<SchemaContract>(`${schemaId}`);
        const loaded = new Schema(schema);
        
        cachedApi[schemaId] = loaded;

        return loaded;
    }

    public async getSchemas(api: Api): Promise<Page<Schema>> {
        const result = await this.smapiClient.get<Page<SchemaContract>>(`${api.id}/schemas?$top=20`);
        const schemaReferences = result.value;
        const schemas = await Promise.all(schemaReferences.map(schemaReference => this.getApiSchema(schemaReference.id)));

        // return schemas;
        // const result = await this.smapiClient.get<Page<SchemaContract>>(`${api.id}/schemas?$top=20`, null);
        // const schemas = await Promise.all(schemaReferences.map(schemaReference => this.getApiSchema(schemaReference.id)));
        // return schemas;

        const page = new Page<Schema>();
        page.value = schemas;
        return page;
    }

    private lastApiProducts = {};

    public async getAllApiProducts(apiId: string): Promise<Page<Product>> {
        let cachedApi = this.lastApiProducts[apiId];
        if (!cachedApi) {
            // clean cache if apiId changed
            if (Object.keys(this.lastApiProducts).length > 0) {
                this.lastApiProducts = {};
            }
        } else {
            return cachedApi;
        }

        const result = [];
        const pageOfProducts = await this.smapiClient.get<Page<ProductContract>>(`${apiId}/products`);

        if (pageOfProducts && pageOfProducts.value) {
            pageOfProducts.value.map(item => result.push(new Product(item)));
        }

        const page = new Page<Product>();
        page.value = result;
        page.count = pageOfProducts.count;
        // page.nextPage = pageOfProductContracts.nextPage;

        this.lastApiProducts[apiId] = page;
        return page;
    }

    public async getProductApis(productId: string): Promise<Page<Api>> {
        const result: Api[] = [];

        const pageOfApis = await this.smapiClient.get<Page<ApiContract>>(`${productId}/apis`);

        if (pageOfApis && pageOfApis.value) {
            pageOfApis.value.map(item => result.push(new Api(item)));
        }

        const page = new Page<Api>();
        page.value = result;
        page.count = pageOfApis.count;

        return page;
    }
}