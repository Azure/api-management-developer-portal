import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { ValidationErrorModel } from "./validationErrorModel";

export class ValidationErrorHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "validation-error",
            category: "User",
            displayName: "Validation Error",
            iconClass: "paperbits-cheque-3",
            requires: ["scripts"],
            createModel: async () => new ValidationErrorModel()
        };

        return widgetOrder;
    }
}