import { UserContract } from "../../src/contracts/user";
export interface IUserService {
    
    putUser(userId: string, userContract: UserContract): Promise<UserContract> ;

    deleteUser(userId: string, deleteSubs: boolean): Promise<any> ;
}