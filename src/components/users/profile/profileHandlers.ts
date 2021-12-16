import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ProfileModel } from "./profileModel";

export class ProfileHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "profile",
            category: "User",
            displayName: "User: Profile",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ProfileModel()
        };

        return widgetOrder;
    }
}