import { IWidgetHandler } from "@paperbits/common/editing";
import { SignupModel } from "./signupModel";


export class SignupHandlers implements IWidgetHandler<SignupModel> {
    public async getWidgetModel(): Promise<SignupModel> {
        return new SignupModel()
    }
}