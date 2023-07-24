import { IWidgetHandler } from "@paperbits/common/editing";
import { OperationDetailsModel } from "./operationDetailsModel";

export class OperationDetailsHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<OperationDetailsModel> {
        return new OperationDetailsModel();
    }
}