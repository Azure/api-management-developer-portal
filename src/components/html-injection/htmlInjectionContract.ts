import { LocalStyles } from "@paperbits/common/styles";
import { Contract } from "@paperbits/common";
import { SizeStylePluginConfig } from "@paperbits/styles/plugins";

export interface HTMLInjectionContract extends Contract {
    htmlCode: string;
    inheritStyling: boolean;
    styles: LocalStyles;
}