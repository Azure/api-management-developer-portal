import { Bag } from "@paperbits/common";
import { EventManager, Events } from "@paperbits/common/events";
import { ComponentFlow, IWidgetBinding } from "@paperbits/common/editing";
import { widgetName, widgetDisplayName, widgetEditorSelector } from "../constants";
import { CustomHtmlViewModel } from "./customHtmlViewModel";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { StyleCompiler } from "@paperbits/common/styles";
import { JssCompiler } from "@paperbits/styles/jssCompiler";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { HTMLInjectionModel } from "../customHtmlModel";

export class CustomHtmlViewModelBinder implements ViewModelBinder<HTMLInjectionModel, CustomHtmlViewModel>  {
    constructor(
        private readonly eventManager: EventManager,
        private readonly styleCompiler: StyleCompiler,
        private readonly settingsProvider: ISettingsProvider,
    ) { }

    public async updateViewModel(model: HTMLInjectionModel, viewModel: CustomHtmlViewModel, bindingContext: Bag<any>): Promise<void> {
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

        if (model.styles) {
            viewModel.styles(await this.styleCompiler.getStyleModelAsync(model.styles, bindingContext?.styleManager));
        }

        viewModel.htmlCode(htmlInheritedStyles + model.htmlCode);
    }

    public async modelToViewModel(model: HTMLInjectionModel, viewModel?: CustomHtmlViewModel, bindingContext?: Bag<any>): Promise<CustomHtmlViewModel> {
        if (!viewModel) {
            viewModel = new CustomHtmlViewModel();

            const binding: IWidgetBinding<HTMLInjectionModel, CustomHtmlViewModel> = {
                name: widgetName,
                displayName: widgetDisplayName,
                readonly: bindingContext ? bindingContext.readonly : false,
                model: model,
                flow: ComponentFlow.Contents,
                editor: widgetEditorSelector,
                draggable: true,
                applyChanges: async () => {
                    await this.updateViewModel(model, viewModel, bindingContext);
                    this.eventManager.dispatchEvent(Events.ContentUpdate);
                }
            };

            viewModel["widgetBinding"] = binding;
        }

        this.updateViewModel(model, viewModel, bindingContext);

        return viewModel;
    }

    public canHandleModel(model: HTMLInjectionModel): boolean {
        return model instanceof HTMLInjectionModel;
    }
}