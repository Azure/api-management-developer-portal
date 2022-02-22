import { LocalStyles } from "@paperbits/common/styles";
import { Contract } from "@paperbits/common";

export interface CustomWidgetContract extends Contract {
    name: string | null;
    tech: string | null;
    sourceControl: string | null;
}
