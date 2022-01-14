import { widgetName } from "./constants";
import { IModelBinder } from "@paperbits/common/editing";
import { CustomWidgetModel } from "./customWidgetModel";
import { Contract } from "@paperbits/common";
import { CustomWidgetContract } from "./customWidgetContract";

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
        model.uri = contract.uri;
        model.styles = contract.styles || {};
        model.customInput1 = contract.customInput1 ?? "";
        model.customInputCode = contract.customInputCode ?? "";
        model.customInputCodeValue = contract.customInputCodeValue ?? "{}";
        return model;
    }

    public modelToContract(model: CustomWidgetModel): Contract {
        const contract: CustomWidgetContract = {
            type: widgetName,
            name: model.name,
            uri: model.uri,
            styles: model.styles,
            customInput1: model.customInput1,
            customInputCode: model.customInputCode,
            customInputCodeValue: model.customInputCodeValue,
        };

        return contract;
    }
}
