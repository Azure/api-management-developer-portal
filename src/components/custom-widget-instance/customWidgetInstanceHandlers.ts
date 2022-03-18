﻿import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { CustomWidgetInstanceModel } from "./customWidgetInstanceModel";
import { sizeStylesInitial } from "./ko/constants";
import { TCustomWidgetConfig } from "scaffold/scaffold";
import { StyleHelper } from "@paperbits/styles";

export class CustomWidgetInstanceHandlers implements IWidgetHandler {
    constructor(private readonly configuration: TCustomWidgetConfig) { }

    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: this.configuration.name,
            displayName: this.configuration.displayName,
            category: this.configuration.category,
            requires: [],

            createModel: async () => {
                const model = new CustomWidgetInstanceModel();
                model.name = this.configuration.name;
                model.uri = this.configuration.uri;
                model.customInputValue = "{}";
                StyleHelper.setPluginConfigForLocalStyles(model.styles, "size", sizeStylesInitial);

                model.widgetDisplayName = this.configuration.displayName;
                return model;
            }
        };

        if (this.configuration.iconUrl) widgetOrder.iconUrl = this.configuration.iconUrl;
        else widgetOrder.iconClass = "widget-icon widget-icon-api-management";

        return widgetOrder;
    }
}