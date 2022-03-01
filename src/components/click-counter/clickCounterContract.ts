/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file and at https://paperbits.io/license/mit.
 */

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