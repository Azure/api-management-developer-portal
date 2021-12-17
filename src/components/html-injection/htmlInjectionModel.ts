import { LocalStyles } from "@paperbits/common/styles";

export class HTMLInjectionModel {
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