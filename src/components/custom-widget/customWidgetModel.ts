import { LocalStyles } from "@paperbits/common/styles";

export class CustomWidgetModel {
    public name: string;
    public uri: string | undefined;
    public inheritStyling: boolean;
    public customInput1: string;
    public customInputCode: string;
    public customInputCodeValue: string;

    /**
     * Local styles.
     */
    public styles: LocalStyles;

    constructor() {
        this.styles = {};
    }
}