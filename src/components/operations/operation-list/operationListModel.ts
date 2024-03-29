import { HyperlinkModel } from "@paperbits/common/permalinks";
import { LocalStyles } from "@paperbits/common/styles";

export class OperationListModel {
    /**
     * Indicated that an operations can be selected.
     */
    public allowSelection: boolean;

    /**
     * Indicated that an operations name should wraps to new line if it's too long.
     */
    public wrapText: boolean;

    /**
     * Allow switching between URL paths and operation names
     */
    public showToggleUrlPath: boolean;

    /**
     * Show URL paths instead of operation names by default.
     */
    public defaultShowUrlPath: boolean;

    /**
     * Default GroupByTag to enabled.
     */
    public defaultGroupByTagToEnabled: boolean;

    /**
     * Default to expand all GroupTags.
     */
    public defaultAllGroupTagsExpanded: boolean;

    /**
     * Link to a page that contains operation details.
     */
    public detailsPageHyperlink: HyperlinkModel;

    /**
     * Widget local styles.
     */
    public styles: LocalStyles = {};
}
