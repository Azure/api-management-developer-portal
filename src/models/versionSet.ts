import { VersionSetContract } from "../contracts/apiVersionSet";
import { Utils } from "../utils";

export class VersionSet {
    public readonly id: string;
    public name: string;
    public description: string;
    public versioningScheme: string;
    public versionQueryName: string;
    public versionHeaderName: string;

    constructor(id: string, contract?: VersionSetContract) {
        this.id = Utils.getResourceName("apiVersionSets", id, "shortId");

        if (!contract) {
            return;
        }

        if (contract.properties) {
            this.name = contract.properties.displayName;
            this.description = contract.properties.description;
            this.versioningScheme = contract.properties.versioningScheme;
            this.versionQueryName = contract.properties.versionQueryName;
            this.versionHeaderName = contract.properties.versionHeaderName;
        }
    }
}