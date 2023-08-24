import { LocalStyles } from "@paperbits/common/styles";

export class CustomHtmlModel {
    public htmlCode: string;
    public inheritStyling: boolean;

    /**
     * Local styles.
     */
    public styles: LocalStyles;

    constructor() {
        this.styles = {};
    }
}