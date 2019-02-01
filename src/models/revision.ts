import { RevisionContract } from "../contracts/revision";

export class Revision {
    public apiId: string;
    public apiRevision: string;
    public createdDateTime: string;
    public updatedDateTime: string;
    public description: string;
    public privateUrl: string;
    public isOnline: boolean;
    public isCurrent: boolean;

    constructor(contract?: RevisionContract) {
        this.apiId = contract.apiId;
        this.apiRevision = contract.apiRevision;
        this.createdDateTime = contract.createdDateTime;
        this.updatedDateTime = contract.updatedDateTime;
        this.description = contract.description;
        this.privateUrl = contract.privateUrl;
        this.isOnline = contract.isOnline;
        this.isCurrent = contract.isCurrent;
    }
}