import { MapiClient } from "../mapiClient";
import { ProductContract } from "../../src/contracts/product";
import { ITestProductService } from "./ITestProductService";

export class TestProductService implements ITestProductService {
    private readonly mapiClient: MapiClient
    constructor() { 
        this.mapiClient = MapiClient.Instance;
    }

    public async putProduct(productId: string, productContract: ProductContract): Promise<ProductContract> {
        if (!productId) {
            throw new Error(`Parameter "productId" not specified.`);
        }

        const contract = await this.mapiClient.put<ProductContract>(productId, undefined, productContract);
        return contract;
    }

    public async putProductGroup(productId: string, groupId: string): Promise<any> {
        if (!productId) {
            throw new Error(`Parameter "productId" not specified.`);
        }

        if (!groupId) {
            throw new Error(`Parameter "groupId" not specified.`);
        }

        var result = await this.mapiClient.put<any>(productId + "/" + groupId, undefined);
        return result;
    }

    public async deleteProduct(productId: string, deleteSubs: boolean): Promise<any> {
        if (!productId) {
            throw new Error(`Parameter "productId" not specified.`);
        }

        if (deleteSubs){
            productId = productId + "?deleteSubscriptions=True";
        }

        var result = await this.mapiClient.delete<any>(productId, undefined);
        return result;
    }
}