import { widgetName, widgetDisplayName, widgetCategory, widgetIconClass } from "./constants";
import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { HTMLInjectionModel } from "./customHtmlModel";
import { htmlCodeInitial, htmlCodeSizeStylesInitial } from "./ko/constants";
import { StyleHelper } from "@paperbits/styles";

export class HTMLInjectionHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: widgetName,
            category: widgetCategory,
            requires: [],
            displayName: widgetDisplayName,
            iconClass: widgetIconClass,

            createModel: async () => { 
                const model = new HTMLInjectionModel();
                model.htmlCode = htmlCodeInitial;
                model.inheritStyling = true;
                StyleHelper.setPluginConfigForLocalStyles(model.styles, "size", htmlCodeSizeStylesInitial);
                return model;
            }
        };

        return widgetOrder;
    }
}