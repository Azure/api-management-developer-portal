import { IModelBinder } from "@paperbits/common/editing";
import { Contract } from "@paperbits/common";
import { CustomWidgetModel } from "./customWidgetModel";
import { CustomWidgetContract } from "./customWidgetContract";
import { widgetName } from "./constants";

export class CustomWidgetModelBinder implements IModelBinder<CustomWidgetModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === widgetName;
    }

    public canHandleModel(model: any): boolean {
        return model instanceof CustomWidgetModel;
    }

    public async contractToModel(contract: CustomWidgetContract): Promise<CustomWidgetModel> {
        const model = new CustomWidgetModel();
        model.name = contract.name ?? "";
        model.widgetDisplayName = contract.widgetDisplayName;
        model.customInputValue = contract.customInputValue ?? "{}";

        model.styles = contract.styles || {};
        return model;
    }

    public modelToContract(model: CustomWidgetModel): Contract {
        return {
            type: widgetName,
            name: model.name,
            widgetDisplayName: model.widgetDisplayName,
            customInputValue: model.customInputValue,

            styles: model.styles,
        } as CustomWidgetContract;
    }
}
