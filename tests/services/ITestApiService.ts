import { ApiContract as SmapiApiContract } from "../models/apiContract";
export interface ITestApiService {
    
    putApi(apiId: string, apiContract: SmapiApiContract): Promise<SmapiApiContract> ;

    putApiProduct(productId: string, apiId: string): Promise<any> ;

    deleteApi(apiId: string): Promise<any> ;
}