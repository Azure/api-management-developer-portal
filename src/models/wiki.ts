import { WikiContract } from "../contracts/wiki";

export class WikiDocument {
    documentationId: string;
}

export class Wiki {
    documents: WikiDocument[];

    constructor(contract: WikiContract) {
        if (contract == null) {
            return;
        }

        this.documents = contract.properties.documents;
    }
}