import { Contract } from "@paperbits/common";
import { HyperlinkContract } from "@paperbits/common/editing";
import { LocalStyles } from "@paperbits/common/styles";

export enum FiltersPosition {
    sidebar = "sidebar",
    popup = "popup",
    none = "none",
}

/**
 * API list widget contract.
 */
export interface ListOfApisContract extends Contract {
    /**
     * API list layout.
     */
    itemStyleView?: string;

    /**
     * Indicated that an APIs can be selected.
     */
    allowSelection: boolean;

    /**
     * Show API type.
     */
    showApiType: boolean;

    /**
     * Default GroupByTag to enabled.
     */
    defaultGroupByTagToEnabled?: boolean;

    /**
     * Link to a page that contains API details.
     */
    detailsPageHyperlink?: HyperlinkContract;

    /**
     * Indicates position of filters.
     */
    filtersPosition: FiltersPosition;

    /**
     * Indicates that view switching is allowed.
     */
    allowViewSwitching: boolean;

    /**
     * Widget local styles.
     */
    styles?: LocalStyles;
}
