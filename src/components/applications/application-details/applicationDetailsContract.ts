import { Contract } from "@paperbits/common";
import { HyperlinkContract } from "@paperbits/common/editing";
import { LocalStyles } from "@paperbits/common/styles";

/**
 * Application list widget configuration.
 */
export interface ApplicationDetailsContract extends Contract {
     /**
     * Application list layout, e.g. "list", "dropdown".
     */
    itemStyleView?: string;

    /**
     * Link to a page that contains application details.
     */
    detailsPageHyperlink?: HyperlinkContract;

    /**
     * Indicates that view switching is allowed.
     */
    allowViewSwitching: boolean;

    /**
     * Widget local styles.
     */
    styles?: LocalStyles;
}
