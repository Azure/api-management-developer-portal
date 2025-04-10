import * as Constants from "../constants";
import { IApiClient } from "../clients";
import { Page } from "../models/page";
import { SearchQuery } from "../contracts/searchQuery";
import { Utils } from "../utils";
import { ApplicationContract } from "../contracts/application";
import { Application } from "../models/application";

export class ApplicationService {
     constructor(
        private readonly apiClient: IApiClient,
        //private readonly delegationService: IDelegationService
    ) { }

    public async getClientApplications(userId: string, searchQuery?: SearchQuery): Promise<Page<ApplicationContract>> {
        console.log('getClientApplications', userId, searchQuery);

        if (!userId) {
            throw new Error(`Parameter "userId" not specified.`);
        }

        const skip = searchQuery && searchQuery.skip || 0;
        const take = searchQuery && searchQuery.take || Constants.defaultPageSize;
        const odataFilterEntries = [];

        const pageOfApplications = new Page<ApplicationContract>();
        let query = `clientApplications?$top=${take}&$skip=${skip}`;

        if (searchQuery?.pattern) {
            const pattern = Utils.encodeURICustomized(searchQuery.pattern, Constants.reservedCharTuplesForOData);
            odataFilterEntries.push(`(contains(name,'${pattern}'))`);
        }

        if (odataFilterEntries.length > 0) {
            query = Utils.addQueryParameter(query, `$filter=` + odataFilterEntries.join(" and "));
        }
       
        try {
            const pageContract = await this.apiClient.get<Page<ApplicationContract>>(`users/${userId}/${query}`);//, [await this.apiClient.getPortalHeader("getApis")]);.
            console.log('pageContract', pageContract);

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

    public async getApplication(userId: string, applicationId: string): Promise<any> {
        console.log('getApplication', userId, applicationId);

        if (!userId) {
            throw new Error(`Parameter "userId" not specified.`);
        }

        if (!applicationId) {
            throw new Error(`Parameter "applicationId" not specified.`);
        }

        const app = await this.apiClient.get<ApplicationContract>(`users/${userId}/clientApplications/${applicationId}`);//, [await this.apiClient.getPortalHeader("getApis")]);

        console.log('app', app);
        return;
    }

    public async getApplicationProducts(userId: string, applicationId: string): Promise<any[]> {
        console.log('getApplicationProducts', userId, applicationId);

        if (!userId) {
            throw new Error(`Parameter "userId" not specified.`);
        }

        if (!applicationId) {
            throw new Error(`Parameter "applicationId" not specified.`);
        }

        const products = await this.apiClient.get(`users/${userId}/clientApplications/${applicationId}/products`);//, [await this.apiClient.getPortalHeader("getApis")]);

        console.log('products', products);
        return;
    }
}