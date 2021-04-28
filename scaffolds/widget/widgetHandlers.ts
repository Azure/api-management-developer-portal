import { widgetName, widgetDisplayName, widgetCategory } from "./constants";
import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { WidgetModel } from "./widgetModel";

/**
 * Handlers giving the editor required context to manupulate the widget. For example,
 * it describes how the widget gets created, how it responds to drag'n'drop events,
 * what contextual commands is supports, etc.
 */
export class WidgetHandlers implements IWidgetHandler {
    /**
     * This method invoked when the widget gets added to the content.
     */
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: widgetName,
            category: widgetCategory,
            requires: [],
            displayName: widgetDisplayName,
            iconClass: "widget-icon widget-icon-component",

            /**
             * This method invoked when the widget gets added to the content.
             */
            createModel: async () => { 
                const model = new WidgetModel();
                // model.property = "< initial value >";
                return model;
            }
        };

        return widgetOrder;
    }
}