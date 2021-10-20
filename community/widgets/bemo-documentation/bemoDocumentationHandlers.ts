import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { BemoDocumentationModel } from "./bemoDocumentationModel";
import { widgetName, widgetDisplayName, widgetCategory,defaultFileName } from "./constants";


export class BemoDocumentationHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: widgetName,
            displayName: widgetDisplayName,
            category: widgetCategory,
            iconClass: "widget-icon widget-icon-component",
            requires: ["html"],
            createModel: async () => {
                const model = new BemoDocumentationModel();
                model.fileName = defaultFileName;
                return model;
            }
        };

        return widgetOrder;
    }
}