import { ArmResource } from "./armResource";

export interface VersionSetPropertiesContract {
    displayName?: string;
    description?: string;
    versioningScheme?: string;
    versionQueryName?: string;
    versionHeaderName?: string;
}

export interface VersionSetContract extends ArmResource {
    properties: VersionSetPropertiesContract;
}