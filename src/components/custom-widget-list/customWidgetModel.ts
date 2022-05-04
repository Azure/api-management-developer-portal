import { TControl, TTech } from "@azure/apimanagement-custom-widget-scaffolder";

export class CustomWidgetModel {
    public name: string;
    public tech: TTech | null;
    public sourceControl: TControl;
}