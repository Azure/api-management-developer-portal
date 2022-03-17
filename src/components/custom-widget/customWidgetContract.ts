import { LocalStyles } from "@paperbits/common/styles";
import { Contract } from "@paperbits/common";
import { TControl, TTech } from "scaffold/scaffold";

export interface CustomWidgetContract extends Contract {
    name: string | null;
    tech: TTech | null;
    sourceControl: TControl;
}
