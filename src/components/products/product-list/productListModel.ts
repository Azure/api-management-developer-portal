import { HyperlinkModel } from "@paperbits/common/permalinks";
import { LocalStyles } from "@paperbits/common/styles";

/**
 * Product list widget configuration.
 */
export class ProductListModel {
    /**
     * Product list layout, e.g. "list", "dropdown", "tiles".
     */
    public layout?: string;

    /**
     * Indicated that a product can be selected.
     */
    public allowSelection: boolean;

    /**
     * Link to a page that contains operation details.
     */
    public detailsPageHyperlink: HyperlinkModel;

    /**
     * Widget local styles.
     */
    public styles: LocalStyles = {};

    constructor(layout: string = "list") {
        this.layout = layout;
    }
}
