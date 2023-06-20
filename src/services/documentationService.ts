import { DocumentationContract } from "../contracts/documentation";
import { Documentation } from "../models/documentation";
import { Utils } from "../utils";
import { MapiClient } from "./mapiClient";

export class DocumentationService {

    constructor(private readonly mapiClient: MapiClient) { }

    public async getDocumentation(documentationId: string): Promise<Documentation> {
        let query = `documentations/${documentationId}`;
        query = Utils.addQueryParameter(query, "api-version=2022-08-01");
        const documentationContract = await this.mapiClient.get<DocumentationContract>(query, [await this.mapiClient.getPortalHeader("getDocumentation")]);
        
        return new Documentation(documentationContract);
    }
}