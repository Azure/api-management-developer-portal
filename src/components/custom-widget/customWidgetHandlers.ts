import { CustomWidgetCommonConfig } from "@azure/api-management-custom-widgets-scaffolder";
import { IWidgetHandler } from "@paperbits/common/editing";
import { StyleHelper } from "@paperbits/styles";
import { CustomWidgetModel } from "./customWidgetModel";
import { sizeStylesInitial } from "./ko/constants";
import { customWidgetPrefixName } from "./ko/utils";

export interface TCustomWidgetConfig extends CustomWidgetCommonConfig {
    name: string;
    displayName: string;
    deployedOn?: string;
    override?: string | boolean;
}

export class CustomWidgetHandlers implements IWidgetHandler {
    constructor(private readonly configuration: TCustomWidgetConfig) {
        this.getWidgetModel = this.getWidgetModel.bind(this);
    }

    public async getWidgetModel(): Promise<CustomWidgetModel> {
        const id = customWidgetPrefixName(this.configuration.name); // add prefix to prevent conflicts with existing widgets

        const model = new CustomWidgetModel();
        model.name = id;
        model.displayName = this.configuration.displayName;
        model.customInputValue = "{}";
        StyleHelper.setPluginConfigForLocalStyles(model.styles, "size", sizeStylesInitial);
        model.instanceId = model.name + "_" + Math.random();
        return model;
    }
}