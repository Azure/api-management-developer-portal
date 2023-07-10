import { widgetName } from "./constants";
import { IModelBinder } from "@paperbits/common/editing";
import { CustomHtmlModel } from "./customHtmlModel";
import { Contract } from "@paperbits/common";
import { CustomHtmlContract } from "./customHtmlContract";
import { htmlCodeInitial } from "./ko/constants";

export class CustomHtmlModelBinder implements IModelBinder<CustomHtmlModel> {
    public async contractToModel(contract: CustomHtmlContract): Promise<CustomHtmlModel> {
        const model = new CustomHtmlModel();
        model.htmlCode = contract.htmlCode ?? htmlCodeInitial;
        model.inheritStyling = contract.inheritStyling ?? true;
        model.styles = contract.styles || {};
        return model;
    }

    public modelToContract(model: CustomHtmlModel): Contract {
        const contract: CustomHtmlContract = {
            type: widgetName,
            htmlCode: model.htmlCode,
            inheritStyling: model.inheritStyling,
            styles: model.styles
        };
        return contract;
    }
}
