import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ChangePasswordModel } from "./changePasswordModel";

export class ChangePasswordHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "change-password",
            category: "User",
            displayName: "Password: change form",
            iconClass: "paperbits-cheque-3",
            requires: ["html"],
            createModel: async () => new ChangePasswordModel()
        };

        return widgetOrder;
    }
}