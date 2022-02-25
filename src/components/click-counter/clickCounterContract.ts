import { Contract } from "@paperbits/common";
import { LocalStyles } from "@paperbits/common/styles";

export interface ClickCounterContract extends Contract {
  /**
   * Initial count.
   */
  initialCount: number;

  /**
   * Widget local styles.
   */
  styles?: LocalStyles;
}
