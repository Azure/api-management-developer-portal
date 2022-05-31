import * as Constants from "../constants";
import { TagContract } from "./../contracts/tag";
import { ProductContract } from "./../contracts/product";
import { ApiContract } from "../contracts/api";
import { ApiTagResourceContract } from "../contracts/tagResource";
import { PageContract } from "../contracts/page";
import { SearchQuery } from "../contracts/searchQuery";
import { Api } from "../models/api";
import { VersionSet } from "../models/versionSet";
import { Page } from "../models/page";
import { Operation } from "../models/operation";
import { Product } from "../models/product";
import { Schema } from "../models/schema";
import { Utils } from "../utils";
import { OperationContract } from "../contracts/operation";
import { SchemaContract, SchemaType } from "../contracts/schema";
import { Hostname } from "./../contracts/hostname";
import { VersionSetContract } from "../contracts/apiVersionSet";
import { HttpHeader } from "@paperbits/common/http/httpHeader";
import { ChangeLogContract } from "../contracts/apiChangeLog";
import { TagGroup } from "../models/tagGroup";
import { Bag } from "@paperbits/common";
import { Tag } from "../models/tag";
import { IApiClient } from "../clients";

export class ApiService {
    constructor(private readonly apiClient: IApiClient) { }

    /**
     * Returns APIs matching search request (if specified).
     * @param searchQuery 
     */
    public async getApis(searchQuery?: SearchQuery): Promise<Page<Api>> {
        const skip = searchQuery && searchQuery.skip || 0;
        const take = searchQuery && searchQuery.take || Constants.defaultPageSize;

        let query = `/apis?$top=${take}&$skip=${skip}`;

        if (searchQuery) {
            if (searchQuery.tags) {
                searchQuery.tags.forEach((tag, index) => {
                    query = Utils.addQueryParameter(query, `tags[${index}]=${tag.name}`);
                });
            }
        }

        const pageOfApis = await this.apiClient.get<Page<ApiContract>>(query, [await this.apiClient.getPortalHeader("getApis")]);

        const page = new Page<Api>();
        page.value = pageOfApis.value.map(x => new Api(x));
        page.nextLink = pageOfApis.nextLink;
        page.count = pageOfApis.count;
        return page;
    }

    /**
     * Returns APIs in specified version set.
     * @param versionSetId Unique version set identifier.
     */
    public async getApisInVersionSet(versionSetId: string): Promise<Api[]> {
        if (!versionSetId) {
            return null;
        }

        const query = "/apis";
        const apisPage = await this.apiClient.get<Page<ApiContract>>(query, [await this.apiClient.getPortalHeader("getApisInVersionSet")]);
        const result = apisPage.value
            .filter(x => x.apiVersionSetId === versionSetId)
            .map(x => new Api(x));

        return result;
    }

    /**
     * Returns Tag/Operation pairs matching search request (if specified).
     * @param searchRequest Search request definition.
     */
    public async getOperationsByTags(apiId: string, searchQuery?: SearchQuery): Promise<Page<TagGroup<Operation>>> {
        if (!apiId) {
            throw new Error(`Parameter "apiId" not specified.`);
        }

        const skip = searchQuery && searchQuery.skip || 0;
        const take = searchQuery && searchQuery.take || Constants.defaultPageSize;

        let query = `apis/${apiId}/operationsByTags?includeNotTaggedOperations=true&$top=${take}&$skip=${skip}`;
        const odataFilterEntries = [];

        if (searchQuery) {
            if (searchQuery.tags && searchQuery.tags.length > 0) {
                const tagFilterEntries = searchQuery.tags.map((tag) => `tag/id eq '${Utils.getResourceName("tags", tag.id)}'`);
                odataFilterEntries.push(`(${tagFilterEntries.join(" or ")})`);
            }

            if (searchQuery.pattern) {
                const pattern = Utils.encodeURICustomized(searchQuery.pattern, Constants.reservedCharTuplesForOData);
                odataFilterEntries.push(`(contains(operation/${searchQuery.propertyName || 'name'},'${pattern}'))`);
            }
        }

        if (odataFilterEntries.length > 0) {
            query = Utils.addQueryParameter(query, `$filter=` + odataFilterEntries.join(" and "));
        }
        const pageOfOperationsByTag = await this.apiClient.get<PageContract<ApiTagResourceContract>>(query, [await this.apiClient.getPortalHeader("getOperationsByTags")]);
        const page = new Page<TagGroup<Operation>>();
        const tagGroups: Bag<TagGroup<Operation>> = {};

        pageOfOperationsByTag.value.forEach(x => {
            const tagContract: TagContract = x.tag ? Utils.armifyContract("tags", x.tag) : null;
            const operationContract: OperationContract = x.operation

            let tagGroup: TagGroup<Operation>;
            let tagName: string;

            if (tagContract) {
                tagName = tagContract.properties.displayName;
            } else {
                tagName = "Untagged";
            }
            tagGroup = tagGroups[tagName];

            if (!tagGroup) {
                tagGroup = new TagGroup<Operation>();
                tagGroup.tag = tagName;
                tagGroups[tagName] = tagGroup;
            }
            tagGroup.items.push(new Operation(operationContract));
        });
        page.value = Object.keys(tagGroups).map(x => tagGroups[x]);
        page.nextLink = pageOfOperationsByTag.nextLink;
        page.count = pageOfOperationsByTag.count;

        return page;
    }

    /**
     * Returns Tag/API pairs matching search request (if specified).
     * @param searchRequest Search request definition.
     */
    public async getApisByTags(searchRequest?: SearchQuery): Promise<Page<TagGroup<Api>>> {
        const skip = searchRequest && searchRequest.skip || 0;
        const take = searchRequest && searchRequest.take || Constants.defaultPageSize;

        let query = `/apisByTags?includeNotTaggedApis=true&$top=${take}&$skip=${skip}`;

        const odataFilterEntries = [];
        odataFilterEntries.push(`api/isCurrent eq true`);

        if (searchRequest) {
            if (searchRequest.tags && searchRequest.tags.length > 0) {
                const tagFilterEntries = searchRequest.tags.map((tag) => `tag/id eq '${Utils.getResourceName("tags", tag.id)}'`);
                odataFilterEntries.push(`(${tagFilterEntries.join(" or ")})`);
            }

            if (searchRequest.pattern) {
                const pattern = Utils.encodeURICustomized(searchRequest.pattern, Constants.reservedCharTuplesForOData);
                odataFilterEntries.push(`(contains(api/name,'${pattern}'))`);
            }
        }

        if (odataFilterEntries.length > 0) {
            query = Utils.addQueryParameter(query, `$filter=` + odataFilterEntries.join(" and "));
        }

        const pageOfApiTagResources = await this.apiClient.get<PageContract<ApiTagResourceContract>>(query, [await this.apiClient.getPortalHeader("getApisByTags")]);
        const page = new Page<TagGroup<Api>>();
        const tagGroups: Bag<TagGroup<Api>> = {};

        pageOfApiTagResources.value.forEach((x) => {
            const tagContract: TagContract = x.tag ? Utils.armifyContract("tags", x.tag) : null;
            const apiContract: ApiContract = x.api

            let tagGroup: TagGroup<Api>;
            let tagName: string;

            if (tagContract) {
                tagName = tagContract.properties.displayName;
            }
            else {
                tagName = "Untagged";
            }

            tagGroup = tagGroups[tagName];

            if (!tagGroup) {
                tagGroup = new TagGroup<Api>();
                tagGroup.tag = tagName;
                tagGroups[tagName] = tagGroup;
            }
            tagGroup.items.push(new Api(apiContract));
        });

        page.value = Object.keys(tagGroups).map(x => tagGroups[x]);
        page.nextLink = pageOfApiTagResources.nextLink;
        page.count = pageOfApiTagResources.count;
        return page;
    }

    /**
     * Returns tags associated with specified operation.
     * @param operationId {string} ARM-formatted operation identifier.
     */
    public async getOperationTags(operationId: string): Promise<Tag[]> {
        if (!operationId) {
            throw new Error(`Parameter "operationId" not specified.`);
        }

        const result = await this.apiClient.get<Page<TagContract>>(`${operationId}/tags`, [await this.apiClient.getPortalHeader("getOperationTags")]);
        return result.value.map(contract => new Tag(contract));
    }

    /**
     * Returns API with specified ID and revision.
     * @param apiId Unique API indentifier.
     * @param revision 
     */
    public async getApi(apiId: string, revision?: string): Promise<Api> {
        if (!apiId) {
            throw new Error(`Parameter "apiId" not specified.`);
        }

        let apiResourceUri = apiId;

        if (revision) {
            apiResourceUri += `;rev=${revision}`;
        }

        apiResourceUri += `?expandApiVersionSet=true`; // TODO: doesn't work in non-ARM resources

        const apiContract = await this.apiClient.get<ApiContract>(apiResourceUri, [await this.apiClient.getPortalHeader("getApi")]);

        if (!apiContract) {
            return null;
        }

        if (apiContract.apiVersionSetId && !apiContract.apiVersionSet) { // Filling the missing version set
            const apiVersionSetContract = await this.getApiVersionSet(apiContract.apiVersionSetId);
            apiContract.apiVersionSet = apiVersionSetContract;
        }

        return new Api(apiContract);
    }

    /**
     * Returns a document of exported API in specified format.
     * @param apiId {string} Unique identifier.
     * @param format {string} Export format.
     */
    public async exportApi(apiId: string, format: string): Promise<any> {
        if (!apiId) {
            throw new Error(`Parameter "apiId" not specified.`);
        }

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
            case "swagger": // json 2.0
                header.value = "application/vnd.swagger.doc+json";
                break;
            case "openapi": // yaml 3.0
                header.value = "application/vnd.oai.openapi";
                break;
            case "openapi+json": // json 3.0
                header.value = "application/vnd.oai.openapi+json";
                break;
            default:
        }

        const headers: HttpHeader[] = [await this.apiClient.getPortalHeader("exportApi")];
        headers.push(header);
        return this.apiClient.get<string>(apiId, headers);
    }

    /**
     * This is a function to get all change log pages for the API
     * 
     * @param apiId A string parameter which is the id of the API
     * @returns all changelog pages
     */
    public async getApiChangeLog(apiId: string, skip: number): Promise<Page<ChangeLogContract>> {
        if (!apiId) {
            throw new Error(`Parameter "apiId" not specified.`);
        }

        let apiResourceUri = apiId;
        const take = Constants.defaultPageSize;
        apiResourceUri += `/releases?$top=${take}&$skip=${skip}`;

        const changelogContracts = await this.apiClient.get<Page<ChangeLogContract>>("apis/" + apiResourceUri, [await this.apiClient.getPortalHeader("getApiChangeLog")]);
        if (!changelogContracts) {
            return null;
        }

        return changelogContracts;
    }

    public async getApiVersionSet(versionSetId: string): Promise<VersionSet> {
        const versionSetContract = await this.apiClient.get<VersionSetContract>("apiVersionSets/" + versionSetId, [await this.apiClient.getPortalHeader("getApiVersionSet")]);
        return new VersionSet(versionSetContract.id, versionSetContract);
    }

    public async getOperation(operationId: string): Promise<Operation> {
        if (!operationId) {
            throw new Error(`Parameter "operationId" not specified.`);
        }

        const operationContract = await this.apiClient.get<OperationContract>(operationId, [await this.apiClient.getPortalHeader("getOperation")]);

        if (!operationContract) {
            return null;
        }

        const operation = new Operation(operationContract);

        return operation;
    }

    public async getOperations(apiId: string, searchQuery?: SearchQuery): Promise<Page<Operation>> {
        if (!apiId) {
            throw new Error(`Parameter "apiId" not specified.`);
        }

        let query = `${apiId}/operations`;

        let top;

        if (searchQuery) {
            searchQuery.tags.forEach((tag, index) => {
                query = Utils.addQueryParameter(query, `tags[${index}]=${tag.name}`);
            });

            if (searchQuery.pattern) {
                const pattern = Utils.encodeURICustomized(searchQuery.pattern, Constants.reservedCharTuplesForOData);
                query = Utils.addQueryParameter(query, `$filter=contains(properties/${searchQuery.propertyName || 'displayName'},'${pattern}')`);
            }

            top = searchQuery && searchQuery.take || Constants.defaultPageSize;

            if (searchQuery.skip) {
                query = Utils.addQueryParameter(query, `$skip=${searchQuery.skip}`);
            }
        }
        query = Utils.addQueryParameter(query, `$top=${top || 20}`);

        const result = await this.apiClient.get<Page<OperationContract>>(query, [await this.apiClient.getPortalHeader("getOperations")]);
        const page = new Page<Operation>();

        page.value = result.value.map(c => new Operation(<any>c));
        page.nextLink = result.nextLink;
        page.count = result.count;

        return page;
    }

    /**
     * Returns API schema with sepcified identifier.
     * @param schemaId {string} ARM-formatted schema identifier.
     */
    public async getApiSchema(schemaId: string): Promise<Schema> {
        const contract = await this.apiClient.get<SchemaContract>(schemaId, [await this.apiClient.getPortalHeader("getApiSchema")]);
        const model = new Schema(contract);
        return model;
    }

    public async getSchemas(api: Api): Promise<Page<Schema>> {
        const result = await this.apiClient.get<Page<SchemaContract>>(`${api.id}/schemas`, [await this.apiClient.getPortalHeader("getSchemas")]);
        const schemaReferences = result.value;
        const schemaType = this.getSchemasType(schemaReferences);
        const schemas = await Promise.all(schemaReferences.filter(schema => schema.contentType === schemaType).map(schemaReference => this.getApiSchema((schemaType === SchemaType.graphQL) ? `${api.id}/schemas/${schemaReference.id}` : schemaReference.id)));

        // return schemas;
        // const result = await this.apiClient.get<Page<SchemaContract>>(`${api.id}/schemas?$top=20`, null);
        // const schemas = await Promise.all(schemaReferences.map(schemaReference => this.getApiSchema(schemaReference.id)));
        // return schemas;

        const page = new Page<Schema>();
        page.value = schemas;
        return page;
    }

    private getSchemasType(schemas: SchemaContract[]): SchemaType {
        if (schemas && schemas.length > 0) {

            const gql = schemas.find(s => s.contentType === SchemaType.graphQL);
            if (gql) return SchemaType.graphQL;

            const is2 = !!schemas.find(item => item.contentType === SchemaType.swagger)
                &&
                !schemas.find(item => item.contentType === SchemaType.openapi);
            if (is2) {
                return SchemaType.swagger;
            }
        }
        return SchemaType.openapi;
    }

    public async getAllApiProducts(apiId: string): Promise<Page<Product>> {
        if (!apiId) {
            throw new Error(`Parameter "apiId" not specified.`);
        }

        const result = [];
        const pageOfProducts = await this.apiClient.get<Page<ProductContract>>(`${apiId}/products`, [await this.apiClient.getPortalHeader("getAllApiProducts")]);

        if (pageOfProducts && pageOfProducts.value) {
            pageOfProducts.value.map(item => result.push(new Product(item)));
        }

        const page = new Page<Product>();
        page.value = result;
        page.count = pageOfProducts.count;

        return page;
    }

    /**
     * Returns page of API products filtered by name.
     */
    public async getApiProductsPage(apiName: string, filter: SearchQuery): Promise<Page<Product>> {
        const skip = filter.skip || 0;
        const take = filter.take || Constants.defaultPageSize;
        let query = `/apis/${apiName}/products?$top=${take}&$skip=${skip}`;

        if (filter.pattern) {
            query = Utils.addQueryParameter(query, `$filter=(contains(properties/displayName,'${encodeURIComponent(filter.pattern)}'))`);
        }

        const page = await this.apiClient.get<Page<ProductContract>>(query, [await this.apiClient.getPortalHeader("getApiProductsPage")]);
        const result = new Page<Product>();
        result.count = page.count;
        result.nextLink = page.nextLink;
        result.value = page.value.map(item => new Product(item));
        return result;
    }

    public async getProductApis(productId: string, searchQuery: SearchQuery): Promise<Page<Api>> {
        let query = `${productId}/apis`;

        if (searchQuery.pattern) {
            const pattern = Utils.encodeURICustomized(searchQuery.pattern, Constants.reservedCharTuplesForOData);
            query = Utils.addQueryParameter(query, `$filter=contains(properties/displayName,'${pattern}')`);
        }

        if (searchQuery.skip) {
            query = Utils.addQueryParameter(query, `$skip=${searchQuery.skip}`);
        }

        query = Utils.addQueryParameter(query, `$top=${searchQuery.take}`);

        const result = await this.apiClient.get<Page<ApiContract>>(query, [await this.apiClient.getPortalHeader("getProductApis")]);
        const page = new Page<Api>();

        page.value = result.value.map(item => new Api(item));
        page.nextLink = result.nextLink;
        page.count = result.count;

        return page;
    }

    public async getHostnames(): Promise<string[]> {
        const query = `gateway/hostnames`;
        const result = await this.apiClient.get<{
            hostnames: string[]
        }>(query, [await this.apiClient.getPortalHeader("getApiHostnames")]);

        return result.hostnames;
    }
}