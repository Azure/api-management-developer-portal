import { HyperlinkModel } from "@paperbits/common/permalinks";
import { LocalStyles } from "@paperbits/common/styles";

/**
 * Product API list widget configuration.
 */
export class ProductApisModel {
    /**
     * List layout. "list" or "tiles"
     */
    public layout?: string;

    /**
     * Link to a page that contains API details.
     */
    public detailsPageHyperlink: HyperlinkModel;

    constructor(layout?: "list" | "tiles") {
        this.layout = layout;
    }

    /**
     * Widget local styles.
     */
    public styles: LocalStyles = {};
}
