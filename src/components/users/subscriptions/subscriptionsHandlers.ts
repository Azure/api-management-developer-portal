import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { SubscriptionsModel } from "./subscriptionsModel";

export class SubscriptionsHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "userSubscriptions",
            category: "User",
            displayName: "User: Subscriptions",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new SubscriptionsModel()
        };

        return widgetOrder;
    }
}