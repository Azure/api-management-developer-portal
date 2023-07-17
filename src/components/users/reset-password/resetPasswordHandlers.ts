import { IWidgetHandler } from "@paperbits/common/editing";
import { ResetPasswordModel } from "./resetPasswordModel";

export class ResetPasswordHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ResetPasswordModel> {
        return new ResetPasswordModel()
    }
}