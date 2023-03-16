import { WikiContract } from "../contracts/wiki";

export class WikiDocument {
    documentationId: string;
    title: string;
}

export class Wiki {
    documents: WikiDocument[];

    constructor(contract: WikiContract) {
        if (contract == null) {
            return;
        }

        // TO DO: map actual title here
        this.documents = contract.properties.documents.map(d => { return { documentationId: d.documentationId, title: d.documentationId }; });
    }
}