import { LocalStyles } from "@paperbits/common/styles";

export class CustomHtmlModel {
    public htmlCode: string;
    public inheritStyling: boolean;
    public addCustomFonts: boolean;

    /**
     * Local styles.
     */
    public styles: LocalStyles;

    constructor() {
        this.styles = {};
    }
}