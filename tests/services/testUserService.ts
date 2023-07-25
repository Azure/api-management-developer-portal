import { MapiClient } from "../mapiClient";
import { UserContract } from "../../src/contracts/user";
import { ITestUserService } from "./ITestUserService";

export class TestUserService implements ITestUserService {
    private readonly mapiClient: MapiClient
    constructor() { 
        this.mapiClient = MapiClient.Instance;
    }

    public async putUser(userId: string, userContract: UserContract): Promise<UserContract> {
        if (!userId) {
            throw new Error(`Parameter "userId" not specified.`);
        }

        const contract = await this.mapiClient.put<UserContract>(userId, undefined, userContract);
        return contract;
    }

    public async deleteUser(userId: string, deleteSubs: boolean): Promise<any> {
        if (!userId) {
            throw new Error(`Parameter "productId" not specified.`);
        }
        if (deleteSubs === true) {
            userId = `${userId}?deleteSubscriptions=true`;
        }
        var result = await this.mapiClient.delete<any>(userId, undefined);
        return result;
    }
}