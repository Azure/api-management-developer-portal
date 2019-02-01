import { VersionSetContract } from "../contracts/apiVersionSet";

export class VersionSet {
    public readonly id: string;
    public name: string;
    public description: string;
    public versioningScheme: string;
    public versionQueryName: string;
    public versionHeaderName: string;

    constructor(contract?: VersionSetContract) {
        if (!contract) {
            return;
        }

        this.id = contract.id;
        this.name = contract.name;
        this.description = contract["description"];
        this.versioningScheme = contract["versioningScheme"];
        this.versionQueryName = contract["versionQueryName"];
        this.versionHeaderName = contract["versionHeaderName"];

        if (contract.properties) {
            this.description = contract.description;
            this.versioningScheme = contract.versioningScheme;
            this.versionQueryName = contract.versionQueryName;
            this.versionHeaderName = contract.versionHeaderName;
        }
    }
}