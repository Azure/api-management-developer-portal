import { Page } from "../models/page";
import { SearchQuery } from "../models/searchQuery";
import { TagGroup } from "../models/tagGroup";
import { Api } from "../models/api";
import { TApisData } from "../types";

export interface ApiService {
    /**
     * Returns APIs matching search request (if specified).
     * @param searchQuery
     */
    getApis(searchQuery?: SearchQuery): Promise<TApisData>;

    /**
     * Returns Tag/API pairs matching search request (if specified).
     * @param searchRequest Search request definition.
     */
    getApisByTags(searchRequest?: SearchQuery): Promise<Page<TagGroup<Api>>>
}