import { Contract } from "@paperbits/common";
import { HyperlinkContract } from "@paperbits/common/editing";

/**
 * Operation list widget configuration.
 */
export interface OperationListContract extends Contract {
    /**
     * Indicated that an operation can be selected.
     */
    allowSelection: boolean;

    /**
     * Indicated that an operations name should wraps to new line if it's too long.
     */
    wrapText: boolean;

    /**
     * Allow switching between URL paths and operation names
     */
    showToggleUrlPath: boolean;
    
    /**
     * Show URL paths instead of operation names by default.
     */
    defaultShowUrlPath: boolean;

    /**
     * Default GroupByTag to enabled.
     */
    defaultGroupByTagToEnabled?: boolean;

    /**
     * Link to a page that contains operation details.
     */
    detailsPageHyperlink?: HyperlinkContract;
}
