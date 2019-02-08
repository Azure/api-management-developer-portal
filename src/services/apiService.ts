import { ProductContract } from "./../contracts/product";
import { ApiContract } from "../contracts/api";
import { TagResourceContract } from "../contracts/tagResource";
import { PageContract } from "../contracts/page";
import { SearchRequest } from "../components/runtime/api-list/searchRequest";
import { Api } from "../models/api";
import { VersionSet } from "../models/versionSet";
import { Page } from "../models/page";
import { Operation } from "../models/operation";
import { Product } from "../models/product";
import { Schema } from "../models/schema";
import { SmapiClient } from "./smapiClient";
import { Utils } from "../utils";
import { OperationContract } from "../contracts/operation";
import { SchemaContract } from "../contracts/schema";
import { VersionSetContract } from "../contracts/apiVersionSet";


export class ApiService {
    constructor(private readonly smapiClient: SmapiClient) { }

    public async getApis(searchRequest?: SearchRequest): Promise<Page<Api>> {
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




        //         const mockVersionSet = new VersionSet({
        //             "id": "/subscriptions/a200340d-6b82-494d-9dbf-687ba6e33f9e/resourceGroups/Api-Default-West-US/providers/Microsoft.ApiManagement/service/aztest/api-version-sets/00008d19-2026-4646-80b2-712b223d8a87",
        //             "name": "httpbin.org",
        //             "description": null,
        //             "versioningScheme": "Segment",
        //             "versionQueryName": null,
        //             "versionHeaderName": null
        //         });

        //         const apiV1 = new Api({
        //             "id": "/subscriptions/a200340d-6b82-494d-9dbf-687ba6e33f9e/resourceGroups/Api-Default-West-US/providers/Microsoft.ApiManagement/service/aztest/apis/httpbinv2",
        //             "type": "Microsoft.ApiManagement/service/apis",
        //             "name": "httpbinv2",
        //             "properties": {
        //                 "name": "httpbin.org",
        //                 "apiRevision": "1",
        //                 "description": "API Management facade for a very handy and free online HTTP tool.",
        //                 "serviceUrl": "https://httpbin.org/",
        //                 "path": "",
        //                 "protocols": [
        //                     "http",
        //                     "https"
        //                 ],
        //                 "authenticationSettings": null,
        //                 "subscriptionKeyParameterNames": null,
        //                 "isCurrent": true,
        //                 "apiVersion": "v2",
        //                 "apiVersionSetId": "/subscriptions/a200340d-6b82-494d-9dbf-687ba6e33f9e/resourceGroups/Api-Default-West-US/providers/Microsoft.ApiManagement/service/aztest/api-version-sets/00008d19-2026-4646-80b2-712b223d8a87",
        //                 "apiVersionSet": {
        //                     "id": "/subscriptions/a200340d-6b82-494d-9dbf-687ba6e33f9e/resourceGroups/Api-Default-West-US/providers/Microsoft.ApiManagement/service/aztest/api-version-sets/00008d19-2026-4646-80b2-712b223d8a87",
        //                     "name": "httpbin.org",
        //                     "description": null,
        //                     "versioningScheme": "Segment",
        //                     "versionQueryName": null,
        //                     "versionHeaderName": null
        //                 }
        //             }
        //         });


        //         /*
        // {
        //     "id": "1234567",
        //     "name": "Sparky",
        //     "category": {
        //         "id": "1",
        //         "name": "Dog"
        //     },
        //     "photoUrls": ["https://www.instagram.com/p/Bk5wigDgybz"]
        // }
        // */


        //         const apiV2 = new Api({
        //             "id": "/subscriptions/a200340d-6b82-494d-9dbf-687ba6e33f9e/resourceGroups/Api-Default-West-US/providers/Microsoft.ApiManagement/service/aztest/apis/httpbin-v1",
        //             "type": "Microsoft.ApiManagement/service/apis",
        //             "name": "httpbin-v1",
        //             "properties": {
        //                 "name": "httpbin.org",
        //                 "apiRevision": "1",
        //                 "description": "API Management facade for a very handy and free online HTTP tool.",
        //                 "serviceUrl": "https://httpbin.org/",
        //                 "path": "",
        //                 "protocols": [
        //                     "http",
        //                     "https"
        //                 ],
        //                 "authenticationSettings": null,
        //                 "subscriptionKeyParameterNames": null,
        //                 "isCurrent": true,
        //                 "apiVersion": "v1",
        //                 "apiVersionSetId": "/subscriptions/a200340d-6b82-494d-9dbf-687ba6e33f9e/resourceGroups/Api-Default-West-US/providers/Microsoft.ApiManagement/service/aztest/api-version-sets/00008d19-2026-4646-80b2-712b223d8a87",
        //                 "apiVersionSet": {
        //                     "id": "/subscriptions/a200340d-6b82-494d-9dbf-687ba6e33f9e/resourceGroups/Api-Default-West-US/providers/Microsoft.ApiManagement/service/aztest/api-version-sets/00008d19-2026-4646-80b2-712b223d8a87",
        //                     "name": "httpbin.org",
        //                     "description": null,
        //                     "versioningScheme": "Segment",
        //                     "versionQueryName": null,
        //                     "versionHeaderName": null
        //                 }
        //             }
        //         });

        //         const page = new Page<Api>();
        //         page.value = [apiV1, apiV2];

        //         return page;
    }

    public async getApisByTags(searchRequest?: SearchRequest): Promise<PageContract<TagResourceContract[]>> {
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

        if (apiContract.apiVersionSetId && !api.apiVersionSet) {
            api.apiVersionSet = await this.getApiVersionSet(apiContract.apiVersionSetId);
        }

        return api;
    }

    public async getApiVersionSet(versionSetId: string): Promise<VersionSet> {
        const versionSetContract = await this.smapiClient.get<VersionSetContract>(versionSetId);
        return new VersionSet(versionSetContract);
    }

    public async getOperations(api: Api, searchRequest?: SearchRequest): Promise<Page<Operation>> {
        let query = `${api.id}/operations`;

        let top;

        if (searchRequest) {
            searchRequest.tags.forEach((tag, index) => {
                query = Utils.addQueryParameter(query, `tags[${index}]=${tag.name}`);
            });

            if (searchRequest.pattern) {
                const pattern = Utils.escapeValueForODataFilter(searchRequest.pattern);
                query = Utils.addQueryParameter(query, `$filter=contains(properties/name,'${encodeURIComponent(pattern)}')`);
            }

            top = searchRequest.top;

            if (searchRequest.skip) {
                query = Utils.addQueryParameter(query, `$skip=${searchRequest.skip}`);
            }
        }

        query = Utils.addQueryParameter(query, `$top=${top || 20}`);

        const result = await this.smapiClient.get<Page<OperationContract>>(query);
        const page = new Page<Operation>();

        page.value = result.value.map(c => new Operation(<any>c));

        return page;
    }

    public async getApiSchema(schemaId: string): Promise<Schema> {
        const schema = await this.smapiClient.get<SchemaContract>(`${schemaId}`, null);
        return new Schema(schema);
    }

    public async getSchemas(api: Api): Promise<Page<Schema>> {
        const result = await this.smapiClient.get<Page<SchemaContract>>(`${api.id}/schemas?$top=20`, null);
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

    public async getAllApiProducts(apiId: string): Promise<Page<Product>> {
        const result = [];
        const pageOfProductContracts = await this.smapiClient.get<Page<ProductContract>>(`${apiId}/products`);

        if (pageOfProductContracts && pageOfProductContracts.value) {
            pageOfProductContracts.value.map(item => result.push(new Product(item)));
        }

        const page = new Page<Product>();
        page.value = result;
        page.count = pageOfProductContracts.count;
        // page.nextPage = pageOfProductContracts.nextPage;
        return page;
    }

    public async getProductApis(productId: string): Promise<Api[]> {
        const result = [];
        const contracts = await this.smapiClient.get<Page<ApiContract>>(`${productId}/apis`);
        if (contracts && contracts.value) {
            contracts.value.map(item => result.push(new Api(item)));
        }
        return result;
    }
}