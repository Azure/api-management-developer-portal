import { IWidgetHandler } from "@paperbits/common/editing";
import { DetailsOfApiModel } from "./detailsOfApiModel";

export class DetailsOfApiHandlers implements IWidgetHandler<DetailsOfApiModel> {
    public async getWidgetModel(): Promise<DetailsOfApiModel> {
        return new DetailsOfApiModel();
    }
}