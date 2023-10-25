import { IWidgetHandler } from "@paperbits/common/editing";
import { ApiProductsModel } from "./apiProductsModel";

export class ApiProductsHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ApiProductsModel> {
        return new ApiProductsModel("list");
    }
}

export class ApiProductsDropdownHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ApiProductsModel> {
        return new ApiProductsModel("dropdown");
    }
}

export class ApiProductsTilesHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ApiProductsModel> {
        return new ApiProductsModel("tiles");
    }
}