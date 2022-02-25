import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ClickCounterModel } from "./clickCounterModel";
import { widgetDisplayName, widgetIconClass, widgetName } from "./constants";


export class ClickCounterHandlers implements IWidgetHandler {
  public async getWidgetOrder(): Promise<IWidgetOrder> {
    const widgetOrder: IWidgetOrder = {
      name: widgetName,
      displayName: widgetDisplayName,
      iconClass: widgetIconClass,
      requires: ["html", "js"],
      createModel: async () => {
        return new ClickCounterModel();
      }
    };

    return widgetOrder;
  }
}
