import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ChangePasswordModel } from "./changePasswordModel";

export class ChangePasswordHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "change-password",
            category: "User",
            displayName: "Password: Change form",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ChangePasswordModel()
        };

        return widgetOrder;
    }
}