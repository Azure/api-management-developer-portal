import { IModelBinder } from "@paperbits/common/editing";
import { Contract } from "@paperbits/common";
import { CustomWidgetModel } from "./customWidgetModel";
import { CustomWidgetContract } from "./customWidgetContract";
import { widgetName } from "./constants";

export class CustomWidgetModelBinder implements IModelBinder<CustomWidgetModel> {
    public canHandleModel(model: unknown): boolean {
        return model instanceof CustomWidgetModel;
    }

    public async contractToModel(contract: CustomWidgetContract): Promise<CustomWidgetModel> {
        const model = new CustomWidgetModel();
        model.name = contract.name ?? "";
        model.displayName = contract.displayName || contract.widgetDisplayName;
        model.customInputValue = contract.customInputValue ?? "{}";
        model.instanceId = contract.instanceKey;
        model.styles = contract.styles || {};
        return model;
    }

    public modelToContract(model: CustomWidgetModel): Contract {
        return {
            type: widgetName,
            name: model.name,
            displayName: model.displayName,
            customInputValue: model.customInputValue,
            instanceKey: model.instanceId,
            styles: model.styles,
        } as CustomWidgetContract;
    }
}
