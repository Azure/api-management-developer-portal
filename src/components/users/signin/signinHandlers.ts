import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { SigninModel } from "./signinModel";

export class SigninHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "signin",
            category: "User",
            displayName: "Sign-in form: basic",
            iconClass: "paperbits-cheque-3",
            requires: ["html"],
            createModel: async () => new SigninModel()
        };

        return widgetOrder;
    }
}