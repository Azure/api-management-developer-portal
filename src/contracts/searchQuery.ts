import { Tag } from "./../models/tag";

/**
 * Search query.
 */
export interface SearchQuery {
    /**
     * Name of the property to search.
     */
    propertyName?: string;

    /**
     * The value of the property to search.
     */
    pattern?: string;

    /**
     * The tags to search for.
     */
    tags?: Tag[];

    /**
     * Number of items to skip.
     */
    skip?: number;

    /**
     * Number of items to return.
     */
    take?: number;

    /**
     * Result grouping, e.g. `tag` or `none`.
     */
    grouping?: string;
}