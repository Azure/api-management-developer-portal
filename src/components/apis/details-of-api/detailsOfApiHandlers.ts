import { IWidgetHandler } from "@paperbits/common/editing";
import { DetailsOfApiModel } from "./detailsOfApiModel";

export class DetailsOfApiHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<DetailsOfApiModel> {
        return new DetailsOfApiModel();
    }
}