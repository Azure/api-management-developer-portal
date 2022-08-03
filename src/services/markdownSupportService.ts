import { MarkdownArmResource } from "../contracts/markdown-arm";
import { Page } from "../models/page";
import { MapiClient } from "./mapiClient";


export class MarkdownSupportService {
    constructor(
        private readonly mapiClient: MapiClient
    ) { }

    public async getMarkdownDocuments(filter?: string): Promise<Page<MarkdownArmResource>> {
        let url = `/contentTypes/markdownDocument/contentItems?&$skip=0&$top=15&$orderby=en_us/title`;
        if (filter) {
            url = url.concat(`&$filter=contains(en_us/title, '${filter}')`);
        }
        return await this.mapiClient
            .get<Page<MarkdownArmResource>>(url, [await this.mapiClient.getPortalHeader()]);
    }

    public async getMarkownDocumentsByContinuationToken(token: string): Promise<Page<MarkdownArmResource>> {
        return await this.mapiClient.get<Page<MarkdownArmResource>>(token, [await this.mapiClient.getPortalHeader()]);
    }

    public async getMarkdownDocument(id: string) {
        const parts = id.split("/");
        const url = `/contentTypes/markdownDocument/contentItems/${parts[parts.length - 1]}`;
        return await this.mapiClient.get<MarkdownArmResource>(url, [await this.mapiClient.getPortalHeader()]);
    }
}