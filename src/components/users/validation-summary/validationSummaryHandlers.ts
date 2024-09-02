import { IWidgetHandler } from "@paperbits/common/editing";
import { ValidationSummaryModel } from "../validation-summary/validationSummaryModel";


export class ValidationSummaryHandlers implements IWidgetHandler<ValidationSummaryModel> {
    public async getWidgetModel(): Promise<ValidationSummaryModel> {
        return new ValidationSummaryModel()
    }
}