import { SizeStylePluginConfig } from "@paperbits/styles/plugins";

/**
 * Model (business layer) is a primary representation of the widget in the system,
 * which gets updated by editors and rendered by the presentation layer.
 */
export class HTMLInjectionWidgetModel { 
    public htmlCode: string;
    public htmlCodeSizeStyles: SizeStylePluginConfig;
    public inheritStyling: boolean;
}