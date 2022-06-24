export interface VersionSetContract {

    /**
     *  API Version Set identifier
     */
    id?: string;

    /**
     * API Version Set name. Must be 1 to 100 characters long.
     */
    name?: string;

    /**
     *  API Version Set description
     */
    description?: string;

    /**
     *  Versioning scheme
     */
    versioningScheme?: string;

    /**
     * Version query name. Must be 1 to 100 characters long.
     */
    versionQueryName?: string;

    /**
     * Version header name. Must be 1 to 100 characters long.
     */
    versionHeaderName?: string;
}