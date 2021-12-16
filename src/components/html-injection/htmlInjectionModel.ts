import { LocalStyles } from "@paperbits/common/styles";
import { SizeStylePluginConfig } from "@paperbits/styles/plugins";

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