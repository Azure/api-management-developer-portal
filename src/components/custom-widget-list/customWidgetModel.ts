import { TScaffoldSourceControl, TScaffoldTech } from "@azure/apimanagement-custom-widget-scaffolder";

export class CustomWidgetModel {
    public name: string;
    public tech: TScaffoldTech | null;
    public sourceControl: TScaffoldSourceControl;
}
