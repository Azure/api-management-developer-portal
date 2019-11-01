import { Contract } from "@paperbits/common";
import { HyperlinkContract } from "@paperbits/common/editing";

export interface DetailsOfApiContract extends Contract {
    /**
     * Link to a page that contains API changlog.
     */
    changeLogPageHyperlink?: HyperlinkContract;
}
