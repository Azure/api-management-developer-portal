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

        if (contract) {
            this.name = contract.name;
            this.description = contract.description;
            this.versioningScheme = contract.versioningScheme;
            this.versionQueryName = contract.versionQueryName;
            this.versionHeaderName = contract.versionHeaderName;
        }
    }
}