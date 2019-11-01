import { Contract } from "@paperbits/common";
import { HyperlinkContract } from "@paperbits/common/editing";

export interface DetailsOfApiContract extends Contract { 
     /**
     * Indicated that an APIs can be selected.
     */
    allowSelection: boolean;

    /**
     * Link to a page that contains API details.
     */
    detailsPageHyperlink?: HyperlinkContract;
}
