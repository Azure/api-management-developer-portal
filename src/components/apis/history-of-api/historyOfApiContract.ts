import { Contract } from "@paperbits/common";
import { HyperlinkContract } from "@paperbits/common/editing";

export interface HistoryOfApiContract extends Contract {    
    /**
     * Link to a page that contains API details.
     */
    detailsPageHyperlink?: HyperlinkContract;

}
