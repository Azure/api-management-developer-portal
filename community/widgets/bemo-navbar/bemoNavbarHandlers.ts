import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { BemoNavbarModel } from "./bemoNavbarModel";
import { widgetName, widgetDisplayName, widgetCategory } from "./constants";

/**
 * Handlers giving the editor required context to manupulate the widget. For example,
 * it describes how the widget gets created, how it responds to drag'n'drop events,
 * what contextual commands is supports, etc.
 */
export class BemoNavbarHandlers implements IWidgetHandler {
    /**
     * This method invoked when the widget gets added to the content.
     */
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: widgetName,
            displayName: widgetDisplayName,
            category: widgetCategory,
            requires: [],
            iconClass: "widget-icon widget-icon-component",

            /**
             * This method invoked when the widget gets added to the content.
             */
            createModel: async () => {
                const model = new BemoNavbarModel();
                return model;
            }
        };

        return widgetOrder;
    }
}