import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { SigninModel } from "./signinModel";

export class SigninHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "signin",
            category: "User",
            displayName: "Sign-in form: Basic",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new SigninModel()
        };

        return widgetOrder;
    }
}