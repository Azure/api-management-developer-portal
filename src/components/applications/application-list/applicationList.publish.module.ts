import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { Logger } from "@paperbits/common/logging";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { ApplicationListModelBinder } from "./applicationListModelBinder";
import { ApplicationListViewModelBinder } from "./applicationListViewModelBinder";
import { ApplicationListModel } from "./applicationListModel";
import { ApplicationListViewModel } from "./react/ApplicationListViewModel";
import { Utils } from "../../../utils";
import { FEATURE_CLIENT_APPLICATIONS } from "../../../constants";

export class ApplicationListPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ApplicationListModelBinder);
        injector.bindToCollection("viewModelBinders", ApplicationListViewModelBinder);

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
                }
            })
            .catch((error) => {
                logger.trackError(error, { message: "Failed to get feature value for client applications in ApplicationListPublishModule." });
            }
        );
    }
}