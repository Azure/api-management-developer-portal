import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ResetPasswordModel } from "./resetPasswordModel";

export class ResetPasswordHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "reset-password",
            category: "User",
            displayName: "Password: Reset form",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ResetPasswordModel()
        };

        return widgetOrder;
    }
}