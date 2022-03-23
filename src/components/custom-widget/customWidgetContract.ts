import { LocalStyles } from "@paperbits/common/styles";
import { Contract } from "@paperbits/common";

export interface CustomWidgetContract extends Contract {
    /**
     * This name is used to identify which custom-widget-binder to load into iframe.
     */
    name: string;

    /**
     * @deprecated. This name will be shown in editors and custom-widget-binder selector. (this will be removed from here and used only in WidgetHandlers)
     */
    widgetDisplayName: string;

    /**
     * This is custom-widget-binder configuration that you pass into iframe that hosts the custom-widget-binder.
     */
    customInputValue: string;

    styles: LocalStyles;
}
