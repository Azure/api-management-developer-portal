import { Page } from "../models/page";
import { SearchQuery } from "../models/searchQuery";
import { Tag } from "../models/tag";

export interface TagService {
    getTags(scope?: string, filter?: string, searchQuery?: SearchQuery): Promise<Page<Tag>>
}