import { TagContract } from "../contracts/tag";
import { PageContract } from "../contracts/page";

export class TagService {
    public async createTag(id: string, name: string): Promise<TagContract> {
        throw new Error("Not implemented.");
    }

    public async getTags(scope?: string): Promise<PageContract<TagContract[]>> {
        throw new Error("Not implemented.");
    }
}