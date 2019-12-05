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
     * Default GroupByTag to enabled.
     */
    defaultGroupByTagToEnabled?: boolean;

    /**
     * Link to a page that contains operation details.
     */
    detailsPageHyperlink?: HyperlinkContract;
}
