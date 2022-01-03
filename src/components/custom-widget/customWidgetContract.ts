import { LocalStyles } from "@paperbits/common/styles";
import { Contract } from "@paperbits/common";

export interface CustomWidgetContract extends Contract {
    name: string;
    storageUri: string | undefined;
    styles: LocalStyles;
    customInput1: string;
}
