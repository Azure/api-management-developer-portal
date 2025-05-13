import { Contract } from "@paperbits/common";
import { HyperlinkContract } from "@paperbits/common/editing";
import { LocalStyles } from "@paperbits/common/styles";

/**
 * Application details widget configuration.
 */
export interface ApplicationDetailsContract extends Contract {
    /**
     * Link to a page that contains product details.
     */
    detailsPageHyperlink?: HyperlinkContract;

    /**
     * Widget local styles.
     */
    styles?: LocalStyles;
}
