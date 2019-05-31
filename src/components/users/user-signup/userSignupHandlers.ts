import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { UserSignupModel } from "./userSignupModel";

export class UserSignupHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "userSignup",
            displayName: "User signup",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new UserSignupModel()
        };

        return widgetOrder;
    }
}