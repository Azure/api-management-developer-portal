import { Contract } from "@paperbits/common";
import { HyperlinkContract } from "@paperbits/common/editing";


/**
 * API list widget contract.
 */
export interface ListOfApisContract extends Contract {
    /**
     * API list layout.
     */
    itemStyleView?: string;

    /**
     * Indicated that an APIs can be selected.
     */
    allowSelection: boolean;

    /**
     * Link to a page that contains API details.
     */
    detailsPageHyperlink?: HyperlinkContract;
 }
