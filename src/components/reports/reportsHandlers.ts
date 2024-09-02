import { IWidgetHandler } from "@paperbits/common/editing";
import { ReportsModel } from "./reportsModel";


export class ReportsHandlers implements IWidgetHandler<ReportsModel> {
    public async getWidgetModel(): Promise<ReportsModel> {
        return new ReportsModel()
    }
}