import * as Constants from "../constants";
import { IApiClient } from "../clients";
import { Page } from "../models/page";
import { SearchQuery } from "../contracts/searchQuery";
import { Utils } from "../utils";
import { ApplicationContract } from "../contracts/application";
import { Application } from "../models/application";
import { ProductContract } from "../contracts/product";
import { Product } from "../models/product";
import { EntraSecretContract } from "../contracts/entraSecret";
import { EntraSecret } from "../models/entraSecret";

export class ApplicationService {
     constructor(private readonly apiClient: IApiClient) { }

    public async getClientApplications(userId: string, searchQuery?: SearchQuery): Promise<Page<Application>> {
        if (!userId) {
            throw new Error(`Parameter "userId" not specified.`);
        }

        const skip = searchQuery && searchQuery.skip || 0;
        const take = searchQuery && searchQuery.take || Constants.defaultPageSize;
        const odataFilterEntries = [];

        const pageOfApplications = new Page<Application>();
        let query = `clientApplications?$top=${take}&$skip=${skip}`;

        if (searchQuery?.pattern) {
            const pattern = Utils.encodeURICustomized(searchQuery.pattern, Constants.reservedCharTuplesForOData);
            odataFilterEntries.push(`(contains(name,'${pattern}'))`);
        }

        if (odataFilterEntries.length > 0) {
            query = Utils.addQueryParameter(query, `$filter=` + odataFilterEntries.join(" and "));
        }
       
        try {
            const pageContract = await this.apiClient.get<Page<ApplicationContract>>(`users/${userId}/${query}`);

            pageOfApplications.value = pageContract.value.map((item) => new Application(item));
            pageOfApplications.nextLink = pageContract.nextLink;

            return pageOfApplications;
        }
        catch (error) {
            if (error?.code === "ResourceNotFound") {
                return pageOfApplications;
            }

            throw new Error(`Unable to retrieve applications for user with ID "${userId}". Error: ${error.message}`);
        }
    }

    public async getApplication(userId: string, applicationId: string): Promise<Application | undefined> {
        if (!userId) {
            throw new Error(`Parameter "userId" not specified.`);
        }

        if (!applicationId) {
            throw new Error(`Parameter "applicationId" not specified.`);
        }

        try {
            const contract = await this.apiClient.get<ApplicationContract>(`users/${userId}/clientApplications/${applicationId}`);

            if (contract) {
                return new Application(contract);
            }
        } catch (error) {
            throw new Error(`Unable to retrieve application with ID "${applicationId}". Error: ${error.message}`);
        }

        return undefined;
    }

    public async getApplicationProducts(userId: string, applicationId: string): Promise<Page<Product>> {
        if (!userId) {
            throw new Error(`Parameter "userId" not specified.`);
        }

        if (!applicationId) {
            throw new Error(`Parameter "applicationId" not specified.`);
        }

        const pageOfProducts = new Page<Product>();
        
        try {
            const pageContract = await this.apiClient.get<Page<ProductContract>>(`users/${userId}/clientApplications/${applicationId}/products`);

            pageOfProducts.value = pageContract.value.map((item) => new Product(item));
            pageOfProducts.nextLink = pageContract.nextLink;

            return pageOfProducts;
        } catch (error) {
            throw new Error(`Unable to retrieve products for the application with ID "${applicationId}". Error: ${error.message}`);
        }

        return pageOfProducts;
    }

    public async createNewSecret(userId: string, applicationId: string): Promise<EntraSecret | undefined> {
        if (!userId) {
            throw new Error(`Parameter "userId" not specified.`);
        }

        if (!applicationId) {
            throw new Error(`Parameter "applicationId" not specified.`);
        }
        
        try {
            const contract = await this.apiClient.post<EntraSecretContract>(`users/${userId}/clientApplications/${applicationId}/listSecrets`);

            if (contract) {
                return new EntraSecret(contract);
            }
        } catch (error) {
            throw new Error(`Unable to create a secret for the application with ID "${applicationId}". Error: ${error.message}`);
        }

        return undefined;
    }
}