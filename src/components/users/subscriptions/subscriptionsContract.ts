import { Contract } from "@paperbits/common";
import { LocalStyles } from "@paperbits/common/styles";

export interface SubscriptionsContract extends Contract {
    /**
     * Widget local styles.
     */
    styles?: LocalStyles;
}
