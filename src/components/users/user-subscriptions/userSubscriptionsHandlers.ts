import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { UserSubscriptionsModel } from "./userSubscriptionsModel";

export class UserSubscriptionsHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "userSubscriptions",
            category: "User",
            displayName: "User: Subscriptions",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new UserSubscriptionsModel()
        };

        return widgetOrder;
    }
}