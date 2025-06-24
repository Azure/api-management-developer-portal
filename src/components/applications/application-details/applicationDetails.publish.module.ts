import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";
import { Logger } from "@paperbits/common/logging";
import { ISettingsProvider } from "@paperbits/common/configuration";
import { ApplicationDetailsModelBinder } from "./applicationDetailsModelBinder";
import { ApplicationDetailsViewModelBinder } from "./applicationDetailsViewModelBinder";
import { ApplicationDetailsModel } from "./applicationDetailsModel";
import { ApplicationDetailsViewModel } from "./react/ApplicationDetailsViewModel";
import { Utils } from "../../../utils";
import { FEATURE_CLIENT_APPLICATIONS } from "../../../constants";


export class ApplicationDetailsPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ApplicationDetailsModelBinder);
        injector.bindToCollection("viewModelBinders", ApplicationDetailsViewModelBinder);

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
                }
            })
            .catch((error) => {
                logger.trackError(error, { message: "Failed to get feature value for client applications in ApplicationDetailsPublishModule." });
            }
        );
    }
}