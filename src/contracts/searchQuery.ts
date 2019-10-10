export interface SearchQuery {
    pattern?: string;
    tags?: string[];
    skip?: number;
    take?: number;
    grouping?: string;
}