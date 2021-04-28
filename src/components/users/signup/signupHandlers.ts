import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { SignupModel } from "./signupModel";

export class SignupHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "signup",
            category: "User",
            displayName: "Sign-up form: Basic",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new SignupModel()
        };

        return widgetOrder;
    }
}