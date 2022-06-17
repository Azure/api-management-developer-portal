import { Contract } from "@paperbits/common";
import { HyperlinkContract } from "@paperbits/common/editing";
import { LocalStyles } from "@paperbits/common/styles";

export interface HistoryOfApiContract extends Contract {
    /**
     * Link to a page that contains API details.
     */
    detailsPageHyperlink?: HyperlinkContract;

    /**
     * Widget local styles.
     */
    styles?: LocalStyles;

}
