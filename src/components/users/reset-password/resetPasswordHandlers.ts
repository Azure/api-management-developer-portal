import { IWidgetHandler } from "@paperbits/common/editing";
import { ResetPasswordModel } from "./resetPasswordModel";

export class ResetPasswordHandlers implements IWidgetHandler<ResetPasswordModel> {
    public async getWidgetModel(): Promise<ResetPasswordModel> {
        return new ResetPasswordModel()
    }
}