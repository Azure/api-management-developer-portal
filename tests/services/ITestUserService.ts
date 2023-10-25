import { UserContract } from "../../src/contracts/user";
export interface ITestUserService {
    
    putUser(userId: string, userContract: UserContract): Promise<UserContract> ;

    deleteUser(userId: string, deleteSubs: boolean): Promise<any> ;
}