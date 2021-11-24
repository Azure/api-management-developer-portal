import { Contract } from "@paperbits/common";
import { SizeStylePluginConfig } from "@paperbits/styles/plugins";

/**
 * Data contact (data layer) that defines how widget configuration gets persisted.
 */
export interface HTMLInjectionWidgetContract extends Contract {
    htmlCode: string;
    htmlCodeSizeStyles: SizeStylePluginConfig;
}