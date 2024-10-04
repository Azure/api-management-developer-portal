import { IWidgetHandler } from "@paperbits/common/editing";
import { SigninSocialModel } from "./signinSocialModel";


export class SigninSocialHandlers implements IWidgetHandler<SigninSocialModel> {
    public async getWidgetModel(): Promise<SigninSocialModel> {
        const model = new SigninSocialModel();
        model.aadLabel = "Azure Active Directory";
        model.aadB2CLabel = "Azure Active Directory B2C";
        return model;
    }
}