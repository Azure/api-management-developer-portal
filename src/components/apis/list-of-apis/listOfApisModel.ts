import { HyperlinkModel } from "@paperbits/common/permalinks";
import { LocalStyles } from "@paperbits/common/styles";
import { FiltersPosition } from "./listOfApisContract";

export class ListOfApisModel {
    /**
     * List layout.
     */
    public layout?: string;

    /**
     * Indicated that an operations can be selected.
     */
    public allowSelection: boolean;

    /**
     * Show API type.
     */
    public showApiType: boolean;

    /**
     * Default GroupByTag to enabled.
     */
    public defaultGroupByTagToEnabled: boolean;

    /**
     * Link to a page that contains operation details.
     */
    public detailsPageHyperlink: HyperlinkModel;

    /**
     * Indicates position of filters.
     */
    public filtersPosition: FiltersPosition;

    /**
     * Indicates that view switching is allowed.
     */
    public allowViewSwitching: boolean;

    /**
     * Widget local styles.
     */
    public styles: LocalStyles = {};

    constructor(layout?: string) {
        this.layout = layout;
    }
}