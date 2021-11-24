import { widgetName, widgetDisplayName, widgetCategory, widgetIconClass } from "./constants";
import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { HTMLInjectionWidgetModel } from "./widgetModel";
import { htmlCodeInitial, htmlCodeSizeStylesInitial } from "./ko/constants"

/**
 * Handlers giving the editor required context to manupulate the widget. For example,
 * it describes how the widget gets created, how it responds to drag'n'drop events,
 * what contextual commands is supports, etc.
 */
export class HTMLInjectionWidgetHandlers implements IWidgetHandler {
    /**
     * This method invoked when the widget gets added to the content.
     */
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: widgetName,
            category: widgetCategory,
            requires: [],
            displayName: widgetDisplayName,
            iconClass: widgetIconClass,

            /**
             * This method invoked when the widget gets added to the content.
             */
            createModel: async () => { 
                const model = new HTMLInjectionWidgetModel();
                model.htmlCode = htmlCodeInitial;
                model.htmlCodeSizeStyles = htmlCodeSizeStylesInitial;
                return model;
            }
        };

        return widgetOrder;
    }
}