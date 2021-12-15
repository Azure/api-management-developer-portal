import { widgetName } from "./constants";
import { IModelBinder } from "@paperbits/common/editing";
import { HTMLInjectionModel } from "./htmlInjectionModel";
import { Contract } from "@paperbits/common";
import { HTMLInjectionContract } from "./htmlInjectionContract";
import { htmlCodeInitial, htmlCodeSizeStylesInitial } from "./ko/constants";

/**
 * This is a class that helps to prepare the model using data described
 * in the contract.
 */
export class HTMLInjectionModelBinder implements IModelBinder<HTMLInjectionModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === widgetName;
    }

    public canHandleModel(model: any): boolean {
        return model instanceof HTMLInjectionModel;
    }

    public async contractToModel(contract: HTMLInjectionContract): Promise<HTMLInjectionModel> {
        const model = new HTMLInjectionModel();
        model.htmlCode = contract.htmlCode ?? htmlCodeInitial;
        model.htmlCodeSizeStyles = contract.htmlCodeSizeStyles ?? htmlCodeSizeStylesInitial;
        model.inheritStyling = contract.inheritStyling ?? true;
        model.styles = contract.styles || {};
        return model;
    }

    public modelToContract(model: HTMLInjectionModel): Contract {
        const contract: HTMLInjectionContract = {
            type: widgetName,
            htmlCode: model.htmlCode,
            htmlCodeSizeStyles: model.htmlCodeSizeStyles,
            inheritStyling: model.inheritStyling,
            styles: model.styles
        };

        return contract;
    }
}
