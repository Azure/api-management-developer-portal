import { HyperlinkModel } from "@paperbits/common/permalinks";
import { LocalStyles } from "@paperbits/common/styles";

export class ApplicationDetailsModel {
    /**
     * Link to a page that contains product details.
     */
    public detailsPageHyperlink: HyperlinkModel;

    /**
     * Widget local styles.
     */
    public styles: LocalStyles = {};
}
