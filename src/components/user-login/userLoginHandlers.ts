import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { UserLoginModel } from "./userLoginModel";

export class UserLoginHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "userLogin",
            displayName: "User login",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new UserLoginModel()
        };

        return widgetOrder;
    }
}