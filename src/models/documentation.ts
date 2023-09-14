import { DocumentationContract } from "../contracts/documentation";

export class Documentation{
    title: string;
    content: string;

    constructor(contract: DocumentationContract){
        if (contract == null) {
            return;
        }

        this.title = contract.properties.title;
        this.content = contract.properties.content;
    }
}