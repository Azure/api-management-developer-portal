import { Contract } from "@paperbits/common";
import { LocalStyles } from "@paperbits/common/styles";

/**
 * Application list widget configuration.
 */
export interface ApplicationListContract extends Contract {
    /**
     * Widget local styles.
     */
    styles?: LocalStyles;
}
