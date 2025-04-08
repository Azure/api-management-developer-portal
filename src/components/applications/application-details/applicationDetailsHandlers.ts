import { IWidgetHandler } from "@paperbits/common/editing";
import { ApplicationDetailsModel } from "./applicationDetailsModel";

export class ApplicationDetailsHandlers implements IWidgetHandler<ApplicationDetailsModel> {
    public async getWidgetModel(): Promise<ApplicationDetailsModel> {
        return new ApplicationDetailsModel();
    }
}