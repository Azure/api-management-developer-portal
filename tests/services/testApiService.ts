import { ApiContract } from "../../src/contracts/api";
import { MapiClient } from "../mapiClient";
import { ITestApiService } from "./ITestApiService";

export class TestApiService implements ITestApiService {
    private readonly mapiClient: MapiClient
    constructor() { 
        this.mapiClient = MapiClient.Instance;
    }
    
    public async putApi(apiId: string, apiContract: ApiContract): Promise<ApiContract> {
        if (!apiId) {
            throw new Error(`Parameter "apiId" not specified.`);
        }

        const contract = await this.mapiClient.put<ApiContract>(apiId, [], apiContract);
        return contract;
    }
    
    public async putApiProduct(productId: string, apiId: string): Promise<any> {
        if (!productId) {
            throw new Error(`Parameter "productId" not specified.`);
        }

        if (!apiId) {
            throw new Error(`Parameter "groupId" not specified.`);
        }

        var result = await this.mapiClient.put<any>(productId + "/" + apiId, undefined);
        return result;
    }

    public async deleteApi(apiId: string): Promise<any> {
        
        if (!apiId) {
            throw new Error(`Parameter "productId" not specified.`);
        }

        var result = await this.mapiClient.delete<any>(apiId, undefined);
        return result;
        
    }
}