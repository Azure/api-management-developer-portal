import { TagContract } from "../contracts/tag";
import { PageContract } from "../contracts/page";
import { Page } from "../models/page";
import { Tag } from "../models/tag";
import { Utils } from "../utils";
import { MapiClient } from "./mapiClient";
import * as Constants from "../constants";
import { SearchQuery } from "../contracts/searchQuery";

export class TagService {
    constructor(private readonly mapiClient: MapiClient) { }

    public async getTags(scope?: string, filter?: string, searchQuery?: SearchQuery): Promise<Page<Tag>> {
        let query = "/tags";

        if (searchQuery && (searchQuery.skip || searchQuery.take)) {
            const skip = searchQuery.skip || 0;
            const take = searchQuery.take || Constants.defaultPageSize;

            query = Utils.addQueryParameter(query, `skip=${skip}`);
            query = Utils.addQueryParameter(query, `top=${take}`);
        }

        if (scope) {
            query = Utils.addQueryParameter(query, `scope=${scope}`);
        }

        if (filter) {
            query = Utils.addQueryParameter(query, `$filter=(startswith(properties/displayName,'${filter}'))`);
        }

        const pageOfTags = await this.mapiClient.get<PageContract<TagContract>>(query, [await this.mapiClient.getPortalHeader("getTags")]);

        const page = new Page<Tag>();
        page.value = pageOfTags.value.map(x => new Tag(x));
        page.nextLink = pageOfTags.nextLink;

        return page;
    }
}