import { IWidgetHandler } from "@paperbits/common/editing";
import { ReportsModel } from "./reportsModel";


export class ReportsHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ReportsModel> {
        return new ReportsModel()
    }
}