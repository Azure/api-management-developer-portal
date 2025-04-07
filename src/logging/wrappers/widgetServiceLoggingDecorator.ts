import { Bag, Contract } from "@paperbits/common";
import { IWidgetBinding, IWidgetHandler, IWidgetOrder, WidgetBinding, WidgetDefinition, WidgetEditorDefinition } from "@paperbits/common/editing";
import { Logger } from "@paperbits/common/logging";
import { IWidgetService, ModelBinderSelector } from "@paperbits/common/widgets";
import { IModelBinder } from "@paperbits/common/editing";
import { WellKnownEventTypes } from "../wellKnownEventTypes";

export class WidgetServiceLoggingDecorator implements IWidgetService {
    constructor(
        private readonly widgetService: IWidgetService,
        private readonly modelBinderSelector: ModelBinderSelector,
        private readonly logger: Logger
    ) { }

    public getWidgetOrders(): Promise<IWidgetOrder<any>[]> {
        return this.widgetService.getWidgetOrders();
    }

    public getWidgetHandler(widgetBinding: IWidgetBinding<any, any>): IWidgetHandler<any> {
        return this.widgetService.getWidgetHandler(widgetBinding);
    }

    public registerWidget(widgetName: string, definition: WidgetDefinition): void {
        this.widgetService.registerWidget(widgetName, definition);
    }

    public unregisterWidget(widgetName: string): void {
        this.widgetService.unregisterWidget(widgetName);
    }

    public registerWidgetEditor(widgetName: string, definition: WidgetEditorDefinition): void {
        this.widgetService.registerWidgetEditor(widgetName, definition);
    }

    public unregisterWidgetEditor(widgetName: string): void {
        this.widgetService.unregisterWidgetEditor(widgetName);
    }

    public getWidgetDefinitionForModel<TModel>(model: TModel): WidgetDefinition {
        return this.widgetService.getWidgetDefinitionForModel(model);
    }

    public getModelBinder<TModel>(widgetName: string): IModelBinder<any> {
        const result = this.widgetService.getModelBinder(widgetName);

        if (result) {
            this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `WidgetService: Model binder '${result.constructor?.name}' for widget '${widgetName}' has been retrieved` });
            return result;
        }

        const legacyResolvedWidget = this.modelBinderSelector.getModelBinderByContract(<Contract>{ type: widgetName });
        if (!legacyResolvedWidget || legacyResolvedWidget.constructor?.name === "ContentPartModelBinder") {
            this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `WidgetService: Couldn't resolve handler for ${widgetName}`, level: "Error" });
        } else {
            const constructorName = legacyResolvedWidget.constructor?.name || Object.getPrototypeOf(legacyResolvedWidget)?.constructor?.name;
            this.logger.trackEvent(WellKnownEventTypes.Publishing, { message: `WidgetService: Model binder '${constructorName}' for widget '${widgetName}' has been retrieved successfully` });
        }

        return result;
    }

    public getModelBinderForModel<TModel>(model: unknown): IModelBinder<any> {
        return this.widgetService.getModelBinderForModel(model);
    }

    public createWidgetBinding<TModel, TViewModel>(definition: WidgetDefinition, model: TModel, bindingContext: Bag<any>): Promise<WidgetBinding<any, any>> {
        return this.widgetService.createWidgetBinding(definition, model, bindingContext);
    }
}