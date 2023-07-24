import { Contract } from "@paperbits/common";
import { LocalStyles } from "@paperbits/common/styles";

export interface ProductSubscribeContract extends Contract {
    /**
     * Controls whether legal text is displayed by default or not.
     */
    showTermsByDefault: boolean;

    /**
     * Widget local styles.
     */
    styles?: LocalStyles;
}
