export interface VersionSetContract {
    id?: string;
    name?: string;
    description?: string;
    versioningScheme?: string;
    versionQueryName?: string;
    versionHeaderName?: string;

    properties?: {
        name?: string;
        description?: string;
        versioningScheme?: string;
        versionQueryName?: string;
        versionHeaderName?: string;
    }
}