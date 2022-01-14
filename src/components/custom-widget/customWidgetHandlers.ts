import { widgetName, widgetDisplayName, widgetCategory, widgetIconClass } from "./constants";
import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { CustomWidgetModel } from "./customWidgetModel";
import { sizeStylesInitial } from "./ko/constants";
import { StyleHelper } from "@paperbits/styles";

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
                model.uri = undefined;
                model.inheritStyling = true;
                model.customInput1 = "";
                model.customInputCode = "";
                model.customInputCodeValue = "{}";
                StyleHelper.setPluginConfigForLocalStyles(model.styles, "size", sizeStylesInitial);
                return model;
            }
        };

        return widgetOrder;
    }
}