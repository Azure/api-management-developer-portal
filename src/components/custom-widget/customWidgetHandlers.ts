﻿import { CustomWidgetCommonConfig } from "@azure/api-management-custom-widgets-scaffolder";
import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleHelper } from "@paperbits/styles";
import { CustomWidgetModel } from "./customWidgetModel";
import { sizeStylesInitial } from "./ko/constants";
import { widgetCategory } from "./constants";

export interface TCustomWidgetConfig extends CustomWidgetCommonConfig {
  name: string;
  deployedOn?: string;
  override?: string | boolean;
}

export class CustomWidgetHandlers implements IWidgetHandler {
    constructor(private readonly configuration: TCustomWidgetConfig) { }

    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: this.configuration.name,
            displayName: this.configuration.displayName,
            category: widgetCategory, // TODO needed?
            requires: [],

            createModel: async () => {
                const model = new CustomWidgetModel();
                model.name = this.configuration.name;
                model.customInputValue = "{}";
                StyleHelper.setPluginConfigForLocalStyles(model.styles, "size", sizeStylesInitial);
                model.instanceId = model.name + "_" + Math.random();

                model.widgetDisplayName = this.configuration.displayName;
                return model;
            }
        };

        if (this.configuration.iconUrl) widgetOrder.iconUrl = this.configuration.iconUrl;
        else widgetOrder.iconClass = "widget-icon widget-icon-api-management";

        return widgetOrder;
    }
}