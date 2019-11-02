import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { UserSignupSocialModel } from "./userSignupSocialModel";

export class UserSignupSocialHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "user-signup",
            category: "User",
            displayName: "Sign up: OAuth",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new UserSignupSocialModel()
        };

        return widgetOrder;
    }
}