import { LocalStyles } from "@paperbits/common/styles";

export class CustomWidgetModel {
    /**
     * This name is used to identify which custom-widget-binder to load into iframe.
     */
    public name: string;

    /**
     * @deprecated. This name will be shown in editors and custom-widget-binder selector. (this will be removed from here and used only in WidgetHandlers)
     */
    public widgetDisplayName: string;

    /**
     * This is custom-widget-binder configuration that you pass into iframe that hosts the custom-widget-binder.
     */
    public customInputValue: string;

    /**
     * Local styles.
     */
    public styles: LocalStyles;

    /**
     * ID of particular instance of the widget.
     */
    public instanceId: string;

    constructor() {
        this.styles = {};
    }
}