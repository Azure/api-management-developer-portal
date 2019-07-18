import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { UserSigninModel } from "./userSigninModel";

export class UserSigninHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "userSignin",
            category: "User",
            displayName: "Sign-in form",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new UserSigninModel()
        };

        return widgetOrder;
    }
}