import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { SignupSocialModel } from "./signupSocialModel";

export class SignupSocialHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "signup",
            category: "User",
            displayName: "Sign-up form: OAuth",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new SignupSocialModel()
        };

        return widgetOrder;
    }
}