import { ProductContract as SmapiProductContract } from "../models/productContract";
import { SubscriptionContract as SmapiSubscriptionContract } from "../models/subscriptionContract";
export interface ITestProductService {

    putProduct(productId: string, productContract: SmapiProductContract): Promise<SmapiProductContract>;

    putProductGroup(productId: string, groupId: string): Promise<any>;

    deleteProduct(productId: string, deleteSubs: boolean): Promise<any>;
    
    putProductSubscription(id: String, subscriptionContract: SmapiSubscriptionContract): Promise<any>;
}