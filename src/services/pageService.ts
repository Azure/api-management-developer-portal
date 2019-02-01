
import * as Utils from "@paperbits/common/utils";
import { PageContract, IPageService } from "@paperbits/common/pages";
import { IBlockService } from "@paperbits/common/blocks";
import { Contract } from "@paperbits/common/contract";
import { SmapiClient } from "../services/smapiClient";
import { Page } from "../models/page";
import { HttpHeader } from "@paperbits/common/http";

const pagesPath = "contentTypes/page/contentItems";
const documentsPath = "contentTypes/document/contentItems";
const templateBlockKey = "contentTypes/block/contentItems/new-page-template";

export class PageService implements IPageService {
    constructor(
        private readonly smapiClient: SmapiClient,
        private readonly blockService: IBlockService
    ) { }

    public async getPageByPermalink(permalink: string): Promise<PageContract> {
        const pageOfPages = await this.smapiClient.get<Page<PageContract>>(`${pagesPath}?$filter=permalink eq '${permalink}'`);

        if (pageOfPages.count > 0) {
            return pageOfPages.value[0];
        }
        else {
            return null;
        }
    }

    public async getPageByKey(key: string): Promise<PageContract> {
        return await this.smapiClient.get<PageContract>(key);
    }

    public async search(pattern: string): Promise<PageContract[]> {
        const pageOfPages = await this.smapiClient.get<Page<PageContract>>(`${pagesPath}?$orderby=title&$filter=contains(title,'${pattern}')`);
        return pageOfPages.value;
    }

    public async deletePage(page: PageContract): Promise<void> {
        const headers: HttpHeader[] = [];
        headers.push({ name: "If-Match", value: "*" });

        await this.smapiClient.delete(page.contentKey, headers);
        await this.smapiClient.delete(page.key, headers);
    }

    public async createPage(url: string, title: string, description: string, keywords): Promise<PageContract> {
        const identifier = Utils.guid();
        const pageKey = `${pagesPath}/${identifier}`;
        const contentKey = `${documentsPath}/${identifier}`;

        const page: PageContract = {
            key: pageKey,
            title: title,
            description: description,
            keywords: keywords,
            contentKey: contentKey,
            permalink: "/new"
        };

        const block = await this.blockService.getBlockByKey(templateBlockKey);
        const template = await this.blockService.getBlockContent(block.key);

        await this.smapiClient.put<PageContract>(pageKey, [], page);
        await this.smapiClient.put<any>(contentKey, [], template);

        return page;
    }

    public async updatePage(page: PageContract): Promise<void> {
        const headers: HttpHeader[] = [];
        headers.push({ name: "If-Match", value: "*" });

        await this.smapiClient.put<Contract>(page.key, headers, page);
    }

    public async getPageContent(pageKey: string): Promise<Contract> {
        const page = await this.smapiClient.get<PageContract>(pageKey);
        const document = await this.smapiClient.get<any>(page.contentKey);
        return document;
    }

    public async updatePageContent(pageKey: string, content: Contract): Promise<void> {
        const page = await this.smapiClient.get<PageContract>(pageKey);

        const headers: HttpHeader[] = [];
        headers.push({ name: "If-Match", value: "*" });

        await this.smapiClient.put<Contract>(page.contentKey, headers, content);
    }
}