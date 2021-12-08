import { widgetName } from "./constants";
import { IModelBinder } from "@paperbits/common/editing";
import { HTMLInjectionWidgetModel } from "./widgetModel";
import { Contract } from "@paperbits/common";
import { HTMLInjectionWidgetContract } from "./widgetContract";
import { htmlCodeInitial, htmlCodeSizeStylesInitial } from "./ko/constants";

/**
 * This is a class that helps to prepare the model using data described
 * in the contract.
 */
export class HTMLInjectionWidgetModelBinder implements IModelBinder<HTMLInjectionWidgetModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === widgetName;
    }

    public canHandleModel(model: any): boolean {
        return model instanceof HTMLInjectionWidgetModel;
    }

    public async contractToModel(contract: HTMLInjectionWidgetContract): Promise<HTMLInjectionWidgetModel> {
        const model = new HTMLInjectionWidgetModel();
        model.htmlCode = contract.htmlCode ?? htmlCodeInitial;
        model.htmlCodeSizeStyles = contract.htmlCodeSizeStyles ?? htmlCodeSizeStylesInitial;
        model.inheritStyling = contract.inheritStyling ?? true;
        return model;
    }

    public modelToContract(model: HTMLInjectionWidgetModel): Contract {
        const contract: HTMLInjectionWidgetContract = {
            type: widgetName,
            htmlCode: model.htmlCode,
            htmlCodeSizeStyles: model.htmlCodeSizeStyles,
            inheritStyling: model.inheritStyling,
        };

        return contract;
    }
}
