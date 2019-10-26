import { HyperlinkModel } from "@paperbits/common/permalinks";

export class OperationListModel { 
    /**
     * Indicated that an operations can be selected.
     */
    public allowSelection: boolean;

    /**
     * Link to a page that contains operation details.
     */
    public detailsPageHyperlink: HyperlinkModel;
}
