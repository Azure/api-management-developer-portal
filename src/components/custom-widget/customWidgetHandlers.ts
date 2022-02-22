import { widgetName, widgetDisplayName, widgetCategory, widgetIconClass } from "./constants";
import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { CustomWidgetModel } from "./customWidgetModel";

export class CustomWidgetHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: widgetName,
            category: widgetCategory,
            requires: [],
            displayName: widgetDisplayName,
            iconClass: widgetIconClass,

            createModel: async () => { 
                const model = new CustomWidgetModel();
                model.name = "";
                model.tech = "";
                model.sourceControl = "";
                return model;
            }
        };

        return widgetOrder;
    }
}