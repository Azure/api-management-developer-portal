import { IWidgetHandler } from "@paperbits/common/editing";
import { SignupSocialModel } from "./signupSocialModel";

export class SignupSocialHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<SignupSocialModel> {
        return new SignupSocialModel()
    }
}