import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ConferenceSessionModel } from "./conferenceSessionModel";
import { widgetName, widgetDisplayName, widgetCategory,defaultSessionNumber } from "./constants";


export class ConferenceSessionHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: widgetName,
            displayName: widgetDisplayName,
            category: widgetCategory,
            iconClass: "widget-icon widget-icon-component",
            requires: [],
            createModel: async () => {
                const model = new ConferenceSessionModel();
                model.sessionNumber = defaultSessionNumber;
                return model;
            }
        };

        return widgetOrder;
    }
}