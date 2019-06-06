import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ListOfApisModel } from "./listOfApisModel";

export class ListOfApisHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "listOfApis",
            displayName: "List of APIs",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new ListOfApisModel("list")
        };

        return widgetOrder;
    }
}
export class ListOfApisTilesHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "listOfApisTiles",
            displayName: "List of APIs (tiles)",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new ListOfApisModel("tiles")
        };

        return widgetOrder;
    }
}
export class ListOfApisDropdownHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "listOfApisDropdown",
            displayName: "List of APIs (dropdown)",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new ListOfApisModel("dropdown")
        };

        return widgetOrder;
    }
}