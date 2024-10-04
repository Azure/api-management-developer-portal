import { IWidgetHandler } from "@paperbits/common/editing";
import { OperationListModel } from "./operationListModel";

export class OperationListHandlers implements IWidgetHandler<OperationListModel> {
    public async getWidgetModel(): Promise<OperationListModel> {
        return new OperationListModel();
    }
}