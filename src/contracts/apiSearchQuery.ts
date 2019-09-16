import { Tag } from "../models/tag";

export interface ApiSearchQuery {
    pattern: string;
    tags: Tag[];
    skip?: string;
    top?: string;
    grouping?: string;
}