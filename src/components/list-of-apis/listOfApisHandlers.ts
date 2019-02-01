import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ListOfApisModel } from "./listOfApisModel";

export class ListOfApisHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "listOfApis",
            displayName: "List of APIs",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new ListOfApisModel()
        };

        return widgetOrder;
    }
}