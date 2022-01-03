import { LocalStyles } from "@paperbits/common/styles";

export class CustomWidgetModel {
    public name: string;
    public storageUri: string | undefined;
    public inheritStyling: boolean;
    public customInput1: string;

    /**
     * Local styles.
     */
    public styles: LocalStyles;

    constructor() {
        this.styles = {};
    }
}