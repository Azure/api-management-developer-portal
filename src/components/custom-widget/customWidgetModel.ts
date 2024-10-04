import { LocalStyles } from "@paperbits/common/styles";

export class CustomWidgetModel {
    /**
     * This name is used to identify which custom-widget-binder to load into iframe.
     */
    public name: string;

    /**
     * This name will be shown in editors and custom-widget-binder selector.
     */
    public displayName: string;

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

    /**
     * Allow iframe to load content from the same origin.
     */
    public allowSameOrigin: boolean;

    constructor() {
        this.styles = {};
    }
}