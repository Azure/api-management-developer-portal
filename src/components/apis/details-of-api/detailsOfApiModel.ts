import { HyperlinkModel } from "@paperbits/common/permalinks";
import { LocalStyles } from "@paperbits/common/styles";

export class DetailsOfApiModel {
    /**
     * Link to a page that contains API changelog.
     */
    public changeLogPageHyperlink: HyperlinkModel;

    /**
     * Widget local styles.
     */
    public styles: LocalStyles = {};
}
