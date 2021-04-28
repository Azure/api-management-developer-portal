import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { DocumentDetailsModel } from "./documentDetailsModel";
import { widgetName, widgetDisplayName, widgetCategory,defaultFileName } from "./constants";


export class DocumentDetailsHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: widgetName,
            displayName: widgetDisplayName,
            category: widgetCategory,
            iconClass: "widget-icon widget-icon-component",
            requires: ["html"],
            createModel: async () => {
                const model = new DocumentDetailsModel();
                model.fileName = defaultFileName;
                return model;
            }
        };

        return widgetOrder;
    }
}