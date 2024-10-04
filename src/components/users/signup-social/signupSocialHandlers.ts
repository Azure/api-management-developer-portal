import { IWidgetHandler } from "@paperbits/common/editing";
import { SignupSocialModel } from "./signupSocialModel";

export class SignupSocialHandlers implements IWidgetHandler<SignupSocialModel> {
    public async getWidgetModel(): Promise<SignupSocialModel> {
        return new SignupSocialModel()
    }
}