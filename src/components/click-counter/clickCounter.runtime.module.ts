/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file and at https://paperbits.io/license/mit.
 */

import { IInjector, IInjectorModule } from "@paperbits/common/injection";
import { ClickCounterRuntime } from "./clickCounterRuntime";

export class ClickCounterRuntimeModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("clickCounterRuntime", ClickCounterRuntime);
    }
}