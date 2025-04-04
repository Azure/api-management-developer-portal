import { MapiClient } from "../mapiClient";
import { ProductContract as SmapiProductContract } from "../models/productContract";
import { ITestProductService } from "./ITestProductService";
import { SubscriptionContract as SmapiSubscriptionContract } from "../models/subscriptionContract";

export class TestProductService implements ITestProductService {
    private readonly mapiClient: MapiClient
    constructor() {
        this.mapiClient = MapiClient.Instance;
    }

    public async putProduct(productId: string, productContract: SmapiProductContract): Promise<any> {
        if (!productId) {
            throw new Error(`Parameter "productId" not specified.`);
        }

        return await this.mapiClient.put<SmapiProductContract>(productId, undefined, productContract);
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

        if (deleteSubs) {
            productId = productId + "?deleteSubscriptions=True";
        }

        var result = await this.mapiClient.delete<any>(productId, undefined);
        return result;
    }
    
    public async putProductSubscription(id: string, subscriptionContract: SmapiSubscriptionContract): Promise<any> {

        if (!id) {
            throw new Error(`Parameter "Id" not specified.`);
        }

        const result = await this.mapiClient.put<any>(id, undefined, subscriptionContract);
        return result;
    }
}