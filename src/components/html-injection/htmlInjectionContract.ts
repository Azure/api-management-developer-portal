import { LocalStyles } from "@paperbits/common/styles";
import { Contract } from "@paperbits/common";

export interface HTMLInjectionContract extends Contract {
    htmlCode: string;
    inheritStyling: boolean;
    styles: LocalStyles;
}