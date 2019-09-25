import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { UserResetPswdModel } from "./userResetPswdModel";

export class UserResetPswdHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "userResetPswd",
            category: "User",
            displayName: "Password reset",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new UserResetPswdModel()
        };

        return widgetOrder;
    }
}