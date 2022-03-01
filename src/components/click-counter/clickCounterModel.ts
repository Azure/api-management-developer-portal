/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file and at https://paperbits.io/license/mit.
 */

import { LocalStyles } from "@paperbits/common/styles";

export class ClickCounterModel {
    /**
     * Inital count.
     */
    public initialCount: number;

    /**
     * Widget local styles.
     */
    public styles: LocalStyles;

    constructor() {
        this.initialCount = 0;
        this.styles = {
            appearance: "components/card/default"
        };
    }
}
