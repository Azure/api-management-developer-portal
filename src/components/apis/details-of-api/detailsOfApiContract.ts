import { Contract } from "@paperbits/common";
import { HyperlinkContract } from "@paperbits/common/editing";
import { LocalStyles } from "@paperbits/common/styles";

export interface DetailsOfApiContract extends Contract {
    /**
     * Link to a page that contains API changelog.
     */
    changeLogPageHyperlink?: HyperlinkContract;

    /**
     * Widget local styles.
     */
    styles?: LocalStyles;
}
