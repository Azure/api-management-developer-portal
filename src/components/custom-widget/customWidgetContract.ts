import { Contract } from "@paperbits/common";
import { LocalStyles } from "@paperbits/common/styles";

export interface CustomWidgetContract extends Contract {
    /**
     * The unique widget identifier.
     */
    name: string;

    /**
     * The display name used in "Add widget" dialog.
     */
    displayName: string;

    /**
     * @deprecated. The display name used in "Add widget" dialog.
     */
    widgetDisplayName: string;

    /**
     * The configuration passed to custom widget.
     */
    customInputValue: string;

    /**
     * ID of this particular instance of the widget.
     */
    instanceKey: string;

    /**
     * Local styles.
     */
    styles: LocalStyles;

    /**
     * allow iframe to load content from the same origin.
     * @default false
     * */
    allowSameOrigin: boolean;
}
