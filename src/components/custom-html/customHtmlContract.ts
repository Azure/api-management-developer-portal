import { LocalStyles } from "@paperbits/common/styles";
import { Contract } from "@paperbits/common";

export interface CustomHtmlContract extends Contract {
    htmlCode: string;
    inheritStyling: boolean;
    styles: LocalStyles;
}