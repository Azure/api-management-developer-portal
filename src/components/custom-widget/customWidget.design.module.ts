import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { IWidgetService } from "@paperbits/common/widgets";
import { KnockoutComponentBinder } from "@paperbits/core/ko/knockoutComponentBinder";
import { CustomWidgetModelBinder } from ".";
import { CustomWidgetModel } from "../custom-widget-list/customWidgetModel";
import { CustomWidgetEditorViewModel, CustomWidgetViewModel, CustomWidgetViewModelBinder } from "./ko";
import { ListenForSecretsRequests } from "./listenForSecretsRequests";

export class CustomWidgetDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("customWidgetScaffoldEditor", CustomWidgetEditorViewModel);
        injector.bindSingleton("customWidgetModelBinder", CustomWidgetModelBinder);
        injector.bindSingleton("customWidgetViewModelBinder", CustomWidgetViewModelBinder);
        injector.bindToCollection("autostart", ListenForSecretsRequests);

        const widgetService = injector.resolve<IWidgetService>("widgetService");

        widgetService.registerWidget("custom-widget", {
            modelDefinition: CustomWidgetModel,
            componentBinder: KnockoutComponentBinder,
            componentDefinition: CustomWidgetViewModel,
            modelBinder: CustomWidgetModelBinder,
            viewModelBinder: CustomWidgetViewModelBinder
        });
    }
}
