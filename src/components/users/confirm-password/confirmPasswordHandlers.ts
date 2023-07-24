import { IWidgetHandler } from "@paperbits/common/editing";
import { ConfirmPasswordModel } from "./confirmPasswordModel";


export class ConfirmPasswordHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ConfirmPasswordModel> {
        return new ConfirmPasswordModel()
    }
}