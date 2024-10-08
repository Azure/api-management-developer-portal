import { IWidgetHandler } from "@paperbits/common/editing";
import { ProfileModel } from "./profileModel";

export class ProfileHandlers implements IWidgetHandler<ProfileModel> {
    public async getWidgetModel(): Promise<ProfileModel> {
        return new ProfileModel()
    }
}