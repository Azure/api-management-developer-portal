import { ApiContract } from "../../src/contracts/api";
export interface ITestApiService {
    
    putApi(apiId: string, apiContract: ApiContract): Promise<ApiContract> ;

    putApiProduct(productId: string, apiId: string): Promise<any> ;

    deleteApi(apiId: string): Promise<any> ;
}