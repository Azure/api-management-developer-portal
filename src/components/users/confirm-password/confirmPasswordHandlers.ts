import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ConfirmPasswordModel } from "./confirmPasswordModel";

export class ConfirmPasswordHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "confirmPassword",
            category: "User",
            displayName: "Confirm password",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new ConfirmPasswordModel()
        };

        return widgetOrder;
    }
}