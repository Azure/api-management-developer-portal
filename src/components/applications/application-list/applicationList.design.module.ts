import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { Logger } from "@paperbits/common/logging";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { ApplicationListHandlers } from "./applicationListHandlers";
import { ApplicationListModel } from "./applicationListModel";
import { ApplicationListModelBinder } from "./applicationListModelBinder";
import { ApplicationListViewModel } from "./react/ApplicationListViewModel";
import { ApplicationListViewModelBinder } from "./applicationListViewModelBinder";
import { ApplicationListEditor } from "./ko/applicationListEditor";
import { Utils } from "../../../utils";
import { FEATURE_CLIENT_APPLICATIONS } from "../../../constants";

export class ApplicationListDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("applicationListEditor", ApplicationListEditor);
        injector.bindSingleton("applicationListModelBinder", ApplicationListModelBinder);
        injector.bindSingleton("applicationListViewModelBinder", ApplicationListViewModelBinder)
        injector.bindSingleton("applicationListHandlers", ApplicationListHandlers);

        const widgetService = injector.resolve<IWidgetService>("widgetService");
        const logger = injector.resolve<Logger>("logger");
        const settingsProvider = injector.resolve<ISettingsProvider>("settingsProvider");

        Utils.getFeatureValueOrNull(FEATURE_CLIENT_APPLICATIONS, settingsProvider, logger)
            .then((isEnabled) => {
                if (isEnabled) {
                    widgetService.registerWidget("application-list", {
                        modelDefinition: ApplicationListModel,
                        componentBinder: ReactComponentBinder,
                        componentDefinition: ApplicationListViewModel,
                        modelBinder: ApplicationListModelBinder,
                        viewModelBinder: ApplicationListViewModelBinder,
                        componentFlow: ComponentFlow.Block
                    });

                    widgetService.registerWidgetEditor("application-list", {
                        displayName: "Application: List",
                        category: "Applications",
                        iconClass: "widget-icon widget-icon-api-management",
                        componentBinder: KnockoutComponentBinder,
                        componentDefinition: ApplicationListEditor,
                        handlerComponent: ApplicationListHandlers
                    });
                }
            }
        );
    }
}