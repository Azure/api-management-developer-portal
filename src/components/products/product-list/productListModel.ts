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
     * Link to a page that contains product details.
     */
    public detailsPageHyperlink: HyperlinkModel;

    /**
     * Indicates that view switching is allowed.
     */
    public allowViewSwitching: boolean;

    /**
     * Widget local styles.
     */
    public styles: LocalStyles = {};

    constructor(layout: string = "list") {
        this.layout = layout;
    }
}
