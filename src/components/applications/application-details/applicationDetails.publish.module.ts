import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ApplicationDetailsModelBinder } from "./applicationDetailsModelBinder";
import { ApplicationDetailsViewModelBinder } from "./applicationDetailsViewModelBinder";
import { ApplicationDetailsModel } from "./applicationDetailsModel";
import { ApplicationDetailsViewModel } from "./react/ApplicationDetailsViewModel";
import { IWidgetService } from "@paperbits/common/widgets";
import { ReactComponentBinder } from "@paperbits/react/bindings";
import { ComponentFlow } from "@paperbits/common/components";


export class ApplicationDetailsPublishModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bindToCollection("modelBinders", ApplicationDetailsModelBinder);
        injector.bindToCollection("viewModelBinders", ApplicationDetailsViewModelBinder);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("application-details", {
            modelDefinition: ApplicationDetailsModel,
            componentBinder: ReactComponentBinder,
            componentDefinition: ApplicationDetailsViewModel,
            modelBinder: ApplicationDetailsModelBinder,
            viewModelBinder: ApplicationDetailsViewModelBinder,
            componentFlow: ComponentFlow.Block
        });
    }
}