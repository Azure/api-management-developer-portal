import { HyperlinkModel } from "@paperbits/common/permalinks";
import { LocalStyles } from "@paperbits/common/styles";

export class ApplicationListModel {
    /**
     * Application list layout, e.g. "list", "tiles".
     */
    public layout?: string;

    /**
     * Link to a page that contains application details.
     */
    public detailsPageHyperlink: HyperlinkModel;

    /**
     * Indicates that view switching is allowed.
     */
    public allowViewSwitching: boolean;

    /**
     * Widget local styles.
     */
    public styles: LocalStyles = {};

    constructor(layout: string = "list") {
        this.layout = layout;
    }
}
