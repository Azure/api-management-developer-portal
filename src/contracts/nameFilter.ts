/**
 * Filter object used for making pageable and filtrable queries.
 */
export interface PatternFilter {

    /**
     * Amount of records to skip.
     */
    skip?: number;

    /**
     * Amount of records to take.
     */
    take?: number;

    /**
     * A pattern to filter list.
     */
    pattern?: string;
}