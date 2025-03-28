import { IModelBinder } from "@paperbits/common/editing";
import { Contract } from "@paperbits/common";
import { CustomWidgetModel } from "./customWidgetModel";
import { CustomWidgetContract } from "./customWidgetContract";
import { widgetName } from "./constants";
import { customWidgetPrefixName, customWidgetRemovePrefixName } from "./ko/utils";

export class CustomWidgetModelBinder implements IModelBinder<CustomWidgetModel> {

    public async contractToModel(contract: CustomWidgetContract): Promise<CustomWidgetModel> {
        const model = new CustomWidgetModel();
        model.name = customWidgetPrefixName(contract.name) ?? "";
        model.displayName = contract.displayName || contract.widgetDisplayName;
        model.customInputValue = contract.customInputValue ?? "{}";
        model.instanceId = contract.instanceKey;
        model.styles = contract.styles || {};
        model.allowSameOrigin = contract.allowSameOrigin || false;
        return model;
    }

    public modelToContract(model: CustomWidgetModel): Contract {
        return {
            type: widgetName,
            name: customWidgetRemovePrefixName(model.name),
            displayName: model.displayName,
            customInputValue: model.customInputValue,
            instanceKey: model.instanceId,
            styles: model.styles,
            allowSameOrigin: model.allowSameOrigin,
        } as CustomWidgetContract;
    }
}
