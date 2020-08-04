import { Tag } from "./../models/tag";

export interface SearchQuery {
    pattern?: string;
    tags?: Tag[];
    skip?: number;
    take?: number;
    grouping?: string;
}