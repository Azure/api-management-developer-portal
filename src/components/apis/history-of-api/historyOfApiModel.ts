import { HyperlinkModel } from "@paperbits/common/permalinks/hyperlinkModel";
import { LocalStyles } from "@paperbits/common/styles";

export class HistoryOfApiModel {

    /**
     * Link to a page that contains API details.
     */
    public detailsPageHyperlink: HyperlinkModel;

    /**
     * Widget local styles.
     */
    public styles: LocalStyles = {};
}
