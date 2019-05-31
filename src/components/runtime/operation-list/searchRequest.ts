import { Tag } from "../../../models/tag";

export interface SearchRequest {
    pattern: string;
    tags: Tag[];
    skip?: string;
    top?: string;
    grouping?: string;
}