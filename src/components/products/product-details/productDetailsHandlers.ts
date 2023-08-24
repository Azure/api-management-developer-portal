﻿import { IWidgetHandler } from "@paperbits/common/editing";
import { ProductDetailsModel } from "./productDetailsModel";

export class ProductDetailsHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<ProductDetailsModel> {
        return new ProductDetailsModel()
    }
}