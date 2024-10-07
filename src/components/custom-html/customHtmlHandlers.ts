import { IWidgetHandler } from "@paperbits/common/editing";
import { StyleHelper } from "@paperbits/styles";
import { CustomHtmlModel } from "./customHtmlModel";
import { htmlCodeInitial, htmlCodeSizeStylesInitial } from "./ko/constants";

export class HTMLInjectionHandlers implements IWidgetHandler<CustomHtmlModel> {
    public async getWidgetModel(): Promise<CustomHtmlModel> {
        const model = new CustomHtmlModel();
        model.htmlCode = htmlCodeInitial;
        model.inheritStyling = true;
        StyleHelper.setPluginConfigForLocalStyles(model.styles, "size", htmlCodeSizeStylesInitial);
        return model;
    }
}