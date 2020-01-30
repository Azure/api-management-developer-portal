import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ValidationSummaryModel } from "../validation-summary/validationSummaryModel";

export class ValidationSummaryHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "validation-summary",
            category: "User",
            displayName: "Validation summary",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new ValidationSummaryModel()
        };

        return widgetOrder;
    }
}