import { IWidgetHandler } from "@paperbits/common/editing";
import { SigninModel } from "./signinModel";

export class SigninHandlers implements IWidgetHandler<SigninModel> {
    public async getWidgetModel(): Promise<SigninModel> {
        return new SigninModel()
    }
}