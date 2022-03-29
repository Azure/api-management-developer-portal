import { HyperlinkModel } from "@paperbits/common/permalinks";

/**
 * Product API list widget configuration.
 */
export class ApiProductsModel {
    /**
     * List layout. "list", "dropdown" or "tiles"
     */
    public layout?: string;

    /**
     * Link to a page that contains API details.
     */
    public detailsPageHyperlink: HyperlinkModel;

    constructor(layout?: "list"|"dropdown"|"tiles") {
        this.layout = layout;
    }
}
