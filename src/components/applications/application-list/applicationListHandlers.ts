import { IWidgetHandler } from "@paperbits/common/editing";
import { ApplicationListModel } from "./applicationListModel";

export class ApplicationListHandlers implements IWidgetHandler<ApplicationListModel> {
    public async getWidgetModel(): Promise<ApplicationListModel> {
        return new ApplicationListModel();
    }
}