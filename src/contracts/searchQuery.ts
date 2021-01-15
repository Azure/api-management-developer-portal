import { Tag } from "./../models/tag";

export interface SearchQuery {
    propertyName?: string;
    pattern?: string;
    tags?: Tag[];
    skip?: number;
    take?: number;
    grouping?: string;
}