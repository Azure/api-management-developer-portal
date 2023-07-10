import { ISettingsProvider } from "@paperbits/common/configuration";
import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder, WidgetState } from "@paperbits/common/widgets";
import { JssCompiler } from "@paperbits/styles/jssCompiler";
import { CustomHtmlModel } from "../customHtmlModel";
import { CustomHtmlViewModel } from "./customHtmlViewModel";


export class CustomHtmlViewModelBinder implements ViewModelBinder<CustomHtmlModel, CustomHtmlViewModel>  {
    constructor(
        private readonly styleCompiler: StyleCompiler,
        private readonly settingsProvider: ISettingsProvider,
    ) { }

    public stateToInstance(state: WidgetState, componentInstance: CustomHtmlViewModel): void {
        componentInstance.styles(state.styles);
        componentInstance.htmlCode(state.htmlCode);
    }

    public async modelToState(model: CustomHtmlModel, state: WidgetState): Promise<void> {
        let htmlInheritedStyles: string = "";

        if (model.inheritStyling) {
            const environment = await this.settingsProvider.getSetting<string>("environment");

            htmlInheritedStyles = '<link href="/styles/theme.css" rel="stylesheet" type="text/css">';

            if (environment === "development") {
                const globalStyleSheet = await this.styleCompiler.getStyleSheet();
                const compiler = new JssCompiler();
                htmlInheritedStyles += `<style>${compiler.compile(globalStyleSheet)}</style>`;
            } else {
                htmlInheritedStyles += '<link href="/styles/styles.css" rel="stylesheet" type="text/css">';
            }
        }

        state.htmlCode = htmlInheritedStyles + model.htmlCode;

        if (model.styles) {
            state.styles = await this.styleCompiler.getStyleModelAsync(model.styles);
        }
    }
}