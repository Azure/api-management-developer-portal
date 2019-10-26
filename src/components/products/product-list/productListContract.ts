import { Contract } from "@paperbits/common";
import { HyperlinkContract } from "@paperbits/common/editing";

/**
 * Product list widget configuration.
 */
export interface ProductListContract extends Contract {
    /**
     * Product list layout, e.g. "list", "dropdown".
     */
    itemStyleView?: string;

    /**
     * Indicated that a product can be selected.
     */
    allowSelection: boolean;

    /**
     * Link to a page that contains operation details.
     */
    detailsPageHyperlink?: HyperlinkContract;
}
