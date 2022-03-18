import { widgetName } from "./constants";
import { IModelBinder } from "@paperbits/common/editing";
import { CustomWidgetInstanceModel } from "./customWidgetInstanceModel";
import { Contract } from "@paperbits/common";
import { CustomWidgetInstanceContract } from "./customWidgetInstanceContract";

export class CustomWidgetInstanceModelBinder implements IModelBinder<CustomWidgetInstanceModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === widgetName;
    }

    public canHandleModel(model: any): boolean {
        return model instanceof CustomWidgetInstanceModel;
    }

    public async contractToModel(contract: CustomWidgetInstanceContract): Promise<CustomWidgetInstanceModel> {
        const model = new CustomWidgetInstanceModel();
        model.name = contract.name ?? "";
        model.widgetDisplayName = contract.widgetDisplayName;
        model.customInputValue = contract.customInputValue ?? "{}";

        model.uri = contract.uri;
        model.styles = contract.styles || {};
        return model;
    }

    public modelToContract(model: CustomWidgetInstanceModel): Contract {
        const contract: CustomWidgetInstanceContract = {
            type: widgetName,
            name: model.name,
            widgetDisplayName: model.widgetDisplayName,
            customInputValue: model.customInputValue,

            uri: model.uri,
            styles: model.styles,
        };

        return contract;
    }
}
