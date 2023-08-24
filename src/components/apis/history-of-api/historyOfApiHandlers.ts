import { IWidgetHandler } from "@paperbits/common/editing";
import { HistoryOfApiModel } from "./historyOfApiModel";

export class HistoryOfApiHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<HistoryOfApiModel> {
        return new HistoryOfApiModel();
    }
}