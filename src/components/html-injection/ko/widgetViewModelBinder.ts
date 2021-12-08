import { Bag } from "@paperbits/common";
import { EventManager, Events } from "@paperbits/common/events";
import { IWidgetBinding } from "@paperbits/common/editing";
import { widgetName, widgetDisplayName, widgetEditorSelector } from "../constants";
import { WidgetViewModel } from "./widgetViewModel";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { StyleCompiler } from "@paperbits/common/styles";
import { JssCompiler } from "@paperbits/styles/jssCompiler";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { HTMLInjectionWidgetModel } from "../widgetModel";

/**
 * This class describes how the model needs to be presented (as a view model)
 * in a specific UI framework.
 */
export class WidgetViewModelBinder implements ViewModelBinder<HTMLInjectionWidgetModel, WidgetViewModel>  {
    constructor(
        private readonly eventManager: EventManager,
        private readonly styleCompiler: StyleCompiler,
        private readonly settingsProvider: ISettingsProvider,
    ) { }

    public async updateViewModel(model: HTMLInjectionWidgetModel, viewModel: WidgetViewModel): Promise<void> {
        let htmlStyling: string = "";

        if (model.inheritStyling) {
            const environment = await this.settingsProvider.getSetting<string>("environment");

            htmlStyling = '<link href="/styles/theme.css" rel="stylesheet" type="text/css">';

            if (environment === "development") {
                // Access global style sheet
                const globalStyleSheet = await this.styleCompiler.getStyleSheet();

                // Compile to CSS
                const compiler = new JssCompiler();
                htmlStyling += `<style>${compiler.compile(globalStyleSheet)}</style>`;

                // Reflect style changes in designer
                // TODO: looks like this is not needed after all
                /* this.eventManager.addEventListener("onStyleChange", async (styleSheet) => {
                    console.log({styleSheet});
                    // viewModel.htmlStyling(styleSheet);
                    // await this.updateViewModel(model, viewModel);
                    // this.eventManager.dispatchEvent(Events.ContentUpdate);
                }); */
            } else {
                htmlStyling += '<link href="/styles.css" rel="stylesheet" type="text/css">';
            }
        }

        viewModel.runtimeConfig(JSON.stringify({
            htmlCode: model.htmlCode,
            htmlCodeSizeStyles: model.htmlCodeSizeStyles,
            htmlStyling,
        }));
    }

    public async modelToViewModel(model: HTMLInjectionWidgetModel, viewModel?: WidgetViewModel, bindingContext?: Bag<any>): Promise<WidgetViewModel> {
        if (!viewModel) {
            viewModel = new WidgetViewModel();

            const binding: IWidgetBinding<HTMLInjectionWidgetModel, WidgetViewModel> = {
                name: widgetName,
                displayName: widgetDisplayName,
                readonly: bindingContext ? bindingContext.readonly : false,
                model: model,
                flow: "block",
                editor: widgetEditorSelector,
                draggable: true,
                applyChanges: async () => {
                    await this.updateViewModel(model, viewModel);
                    this.eventManager.dispatchEvent(Events.ContentUpdate);
                }
            };

            viewModel["widgetBinding"] = binding;
        }

        this.updateViewModel(model, viewModel);

        return viewModel;
    }

    public canHandleModel(model: HTMLInjectionWidgetModel): boolean {
        return model instanceof HTMLInjectionWidgetModel;
    }
}