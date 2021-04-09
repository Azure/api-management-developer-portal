import { Contract } from "@paperbits/common";
import { HyperlinkContract } from "@paperbits/common/editing";

/**
 * Product API list widget configuration.
 */
export interface ProductApisContract extends Contract {
    /**
     * List layout. "list" or "tiles"
     */
    itemStyleView?: string;
    
    /**
     * Link to a page that contains operation details.
     */
    detailsPageHyperlink?: HyperlinkContract;
}
