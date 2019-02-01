import { IUrlService, UrlContract } from "@paperbits/common/urls";
import * as Utils from "@paperbits/common/utils";
import { Contract } from "@paperbits/common/contract";
import { SmapiClient } from "../services/smapiClient";
import { Page } from "../models/page";
import { HttpHeader } from "@paperbits/common/http";

const urlsPath = "/contentTypes/url/contentItems";

export class UrlService implements IUrlService {
    constructor(private readonly smapiClient: SmapiClient) { }

    public async getUrlByKey(key: string): Promise<UrlContract> {
        return await this.smapiClient.get<UrlContract>(key);
    }

    public async search(pattern: string): Promise<UrlContract[]> {
        const pageOfPages = await this.smapiClient.get<Page<UrlContract>>(`${urlsPath}?$orderby=title&$filter=contains(title,'${pattern}')`);
        return pageOfPages.value;
    }

    public async deleteUrl(url: UrlContract): Promise<void> {
        const headers: HttpHeader[] = [];
        headers.push({ name: "If-Match", value: "*" });

        await this.smapiClient.delete(url.key, headers);
    }

    public async createUrl(permalink: string, title: string, description?: string): Promise<UrlContract> {
        const key = `${urlsPath}/${Utils.guid()}`;

        const url: UrlContract = {
            key: key,
            title: title,
            description: description,
            permalink: permalink
        };

        await this.smapiClient.put<UrlContract>(key, [], url);

        return url;
    }

    public async updateUrl(url: UrlContract): Promise<void> {
        const headers: HttpHeader[] = [];
        headers.push({ name: "If-Match", value: "*" });

        await this.smapiClient.put<Contract>(url.key, headers, url);
    }
}