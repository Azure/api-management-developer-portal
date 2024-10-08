import { IWidgetHandler } from "@paperbits/common/editing";
import { ListOfApisModel } from "./listOfApisModel";

export class ListOfApisHandlers implements IWidgetHandler<ListOfApisModel> {
    public async getWidgetModel(): Promise<ListOfApisModel> {
        return new ListOfApisModel("list");
    }
}

export class ListOfApisTilesHandlers implements IWidgetHandler<ListOfApisModel> {
    public async getWidgetModel(): Promise<ListOfApisModel> {
        return new ListOfApisModel("tiles");
    }
}

export class ListOfApisDropdownHandlers implements IWidgetHandler<ListOfApisModel> {
    public async getWidgetModel(): Promise<ListOfApisModel> {
        return new ListOfApisModel("dropdown");
    }
}