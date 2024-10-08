import { IWidgetHandler } from "@paperbits/common/editing";
import { SubscriptionsModel } from "./subscriptionsModel";

export class SubscriptionsHandlers implements IWidgetHandler<SubscriptionsModel> {
    public async getWidgetModel(): Promise<SubscriptionsModel> {
        return new SubscriptionsModel()
    }
}