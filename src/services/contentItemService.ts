
import * as Utils from "@paperbits/common/utils";
import { ContentItemContract, IContentItemService } from "@paperbits/common/contentItems";
import { IBlockService } from "@paperbits/common/blocks";
import { Contract } from "@paperbits/common/contract";
import { SmapiClient } from "../services/smapiClient";
import { Page } from "../models/page";
import { HttpHeader } from "@paperbits/common/http";

const contentItemsPath = "contentTypes/contentItem/contentItems";
const documentsPath = "contentTypes/document/contentItems";
const templateBlockKey = "contentTypes/block/contentItems/new-contentItem-template";

export class ContentItemService implements IContentItemService {
    constructor(
        private readonly smapiClient: SmapiClient,
        private readonly blockService: IBlockService
    ) { }

    public async getContentItemByPermalink(permalink: string): Promise<ContentItemContract> {
        const contentItemOfContentItems = await this.smapiClient.get<Page<ContentItemContract>>(`/contentTypes/contentItem/contentItems?$filter=permalink eq '${permalink}'`);

        if (contentItemOfContentItems.count > 0) {
            return contentItemOfContentItems.value[0];
        }
        else {
            return null;
        }
    }

    public async getContentItemByKey(key: string): Promise<ContentItemContract> {
        return await this.smapiClient.get<ContentItemContract>(key);
    }

    public async search(pattern: string): Promise<ContentItemContract[]> {
        const contentItemOfContentItems = await this.smapiClient.get<Page<ContentItemContract>>(`/contentTypes/contentItem/contentItems?$orderby=title&$filter=contains(title,'${pattern}')`);
        return contentItemOfContentItems.value;
    }

    public async deleteContentItem(contentItem: ContentItemContract): Promise<void> {
        const headers: HttpHeader[] = [];
        headers.push({ name: "If-Match", value: "*" });

        await this.smapiClient.delete(contentItem.contentKey, headers);
        await this.smapiClient.delete(contentItem.key, headers);
    }

    public async createContentItem(url: string, title: string, description: string, keywords): Promise<ContentItemContract> {
        const identifier = Utils.guid();
        const contentItemKey = `${contentItemsPath}/${identifier}`;
        const contentKey = `${documentsPath}/${identifier}`;

        const contentItem: ContentItemContract = {
            key: contentItemKey,
            title: title,
            description: description,
            keywords: keywords,
            contentKey: contentKey,
            permalink: "/new"
        };

        const block = await this.blockService.getBlockByKey(templateBlockKey);
        const template = await this.blockService.getBlockContent(block.key);

        await this.smapiClient.put<ContentItemContract>(contentItemKey, [], contentItem);
        await this.smapiClient.put<any>(contentKey, [], template);

        return contentItem;
    }

    public async updateContentItem(contentItem: ContentItemContract): Promise<void> {
        const headers: HttpHeader[] = [];
        headers.push({ name: "If-Match", value: "*" });

        await this.smapiClient.put<Contract>(contentItem.key, headers, contentItem);
    }

    public async getContentItemContent(contentItemKey: string): Promise<Contract> {
        const contentItem = await this.smapiClient.get<ContentItemContract>(contentItemKey);
        const document = await this.smapiClient.get<any>(contentItem.contentKey);
        return document;
    }

    public async updateContentItemContent(contentItemKey: string, content: Contract): Promise<void> {
        const contentItem = await this.smapiClient.get<ContentItemContract>(contentItemKey);

        const headers: HttpHeader[] = [];
        headers.push({ name: "If-Match", value: "*" });

        await this.smapiClient.put<Contract>(contentItem.contentKey, headers, content);
    }
}