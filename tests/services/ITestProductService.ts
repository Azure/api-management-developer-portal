import { ProductContract } from "../../src/contracts/product";
export interface ITestProductService {
    
    putProduct(productId: string, productContract: ProductContract): Promise<ProductContract>;

    putProductGroup(productId: string, groupId: string): Promise<any>;

    deleteProduct(productId: string, deleteSubs: boolean): Promise<any>;
}