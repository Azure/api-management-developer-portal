import { UserContract as SmapiUserContract } from "../models/userContract";

export interface ITestUserService {
    
    putUser(userId: string, userContract: SmapiUserContract): Promise<any> ;

    deleteUser(userId: string, deleteSubs: boolean): Promise<any> ;
}