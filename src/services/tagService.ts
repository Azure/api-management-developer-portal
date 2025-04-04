import { TagContract } from "../contracts/tag";
import { PageContract } from "../contracts/page";
import { Page } from "../models/page";
import { Tag } from "../models/tag";
import { Utils } from "../utils";
import { IApiClient } from "../clients";

export class TagService {
    constructor(private readonly apiClient: IApiClient) { }

    public async getTags(scope?: string, filter?: string): Promise<Page<Tag>> {
        let query = "/tags";

        if (scope) {
            query = Utils.addQueryParameter(query, `scope=${scope}`);
        }

        if (filter) {
            query = Utils.addQueryParameter(query, `$filter=(startswith(name,'${filter}'))`);
        }

        const pageOfTags = await this.apiClient.get<PageContract<TagContract>>(query, [await this.apiClient.getPortalHeader("getTags"), Utils.getIsUserResourceHeader()]);

        const page = new Page<Tag>();
        page.value = pageOfTags.value.map(x => new Tag(x));
        page.nextLink = pageOfTags.nextLink;

        return page;
    }
}