import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { SignupModel } from "./signupModel";

export class SignupHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "signup-cymru",
            category: "User",
            displayName: "Sign-up CYMRU: basic",
            iconClass: "paperbits-cheque-3",
            requires: ["html"],
            createModel: async () => new SignupModel()
        };

        return widgetOrder;
    }
}