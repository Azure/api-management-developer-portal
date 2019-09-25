import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { UserResetModel } from "./userResetModel";

export class UserResetHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "userReset",
            category: "User",
            displayName: "Password reset request",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new UserResetModel()
        };

        return widgetOrder;
    }
}