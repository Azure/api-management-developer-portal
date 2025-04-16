import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { Logger } from "@paperbits/common/logging";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { ApplicationDetailsHandlers } from "./applicationDetailsHandlers";
import { ApplicationDetailsModel } from "./applicationDetailsModel";
import { ApplicationDetailsModelBinder } from "./applicationDetailsModelBinder";
import { ApplicationDetailsViewModel } from "./react/ApplicationDetailsViewModel";
import { ApplicationDetailsViewModelBinder } from "./applicationDetailsViewModelBinder";
import { ApplicationDetailsEditor } from "./ko/applicationDetailsEditor";
import { Utils } from "../../../utils";
import { FEATURE_CLIENT_APPLICATIONS } from "../../../constants";

export class ApplicationDetailsDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("applicationDetailsEditor", ApplicationDetailsEditor);
        injector.bindSingleton("applicationDetailsModelBinder", ApplicationDetailsModelBinder);
        injector.bindSingleton("applicationDetailsViewModelBinder", ApplicationDetailsViewModelBinder)
        injector.bindSingleton("applicationDetailsHandlers", ApplicationDetailsHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");
        const logger = injector.resolve<Logger>("logger");
        const settingsProvider = injector.resolve<ISettingsProvider>("settingsProvider");

        Utils.getFeatureValueOrNull(FEATURE_CLIENT_APPLICATIONS, settingsProvider, logger)
            .then((isEnabled) => {
                if (isEnabled) {
                    widgetService.registerWidget("application-details", {
                        modelDefinition: ApplicationDetailsModel,
                        componentBinder: ReactComponentBinder,
                        componentDefinition: ApplicationDetailsViewModel,
                        modelBinder: ApplicationDetailsModelBinder,
                        viewModelBinder: ApplicationDetailsViewModelBinder,
                        componentFlow: ComponentFlow.Block
                    });

                    widgetService.registerWidgetEditor("application-details", {
                        displayName: "Application: Details",
                        category: "Applications",
                        iconClass: "widget-icon widget-icon-api-management",
                        componentBinder: KnockoutComponentBinder,
                        componentDefinition: ApplicationDetailsEditor,
                        handlerComponent: ApplicationDetailsHandlers
                    });
                }
            }
        );
    }
}