import { IUserService } from "@paperbits/common/user";

export class UserService implements IUserService {
    public async getUserPhotoUrl(): Promise<string> {
        return "";
    }
}