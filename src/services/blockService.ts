import * as Utils from "@paperbits/common/utils";
import { IBlockService, BlockContract } from "@paperbits/common/blocks";
import { Contract } from "@paperbits/common/contract";
import { SmapiClient } from "../services/smapiClient";
import { Page } from "../models/page";

const blockPath = "/contentTypes/block/contentItems";

export class BlockService implements IBlockService {
    constructor(private readonly smapiClient: SmapiClient) {
    }

    public async getBlockByKey(key: string): Promise<BlockContract> {
        return await this.smapiClient.get<BlockContract>(key);
    }

    public async search(pattern: string): Promise<BlockContract[]> {
        const pageOfBlocks = await this.smapiClient.get<Page<BlockContract>>(`${blockPath}?$orderby=title&$filter=contains(title,'${pattern}')`);
        return pageOfBlocks.value;
    }

    public async deleteBlock(block: BlockContract): Promise<void> {
        await this.smapiClient.delete(block.contentKey);
        await this.smapiClient.delete(block.key);
    }

    public async createBlock(title: string, description: string, content: Contract): Promise<void> {
         const key = `${blockPath}/${Utils.guid()}`;

        const block: BlockContract = {
            key: key,
            title: title,
            description: description,
            content: content
        };

        throw new Error("Not implemented");
    }

    public updateBlock(block: BlockContract): Promise<void> {
        throw new Error("Not implemented");
    }

    public async getBlockContent(blockKey: string): Promise<Contract> {
        const block = await this.smapiClient.get<BlockContract>(blockKey);
        const document = await this.smapiClient.get<any>(block.contentKey);
        return document;
    }
}