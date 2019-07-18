import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { UserDetailsModel } from "./userDetailsModel";

export class UserDetailsHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "userDetails",
            category: "User",
            displayName: "User: Profile",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new UserDetailsModel()
        };

        return widgetOrder;
    }
}