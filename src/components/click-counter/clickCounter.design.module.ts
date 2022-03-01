/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file and at https://paperbits.io/license/mit.
 */

import { IInjectorModule, IInjector } from "@paperbits/common/injection";
import { ClickCounterEditor } from "./clickCounterEditor";
import { ClickCounterHandlers } from "./clickCounterHandlers";
import { ClickCounterModelBinder } from "./clickCounterModelBinder";
import { ClickCounterViewModelBinder } from "./clickCounterViewModelBinder";
import { ClickCounter } from "./clickCounter";

export class ClickCounterDesignModule implements IInjectorModule {
    public register(injector: IInjector): void {
        injector.bind("clickCounterEditor", ClickCounterEditor);
        injector.bindToCollection("widgetHandlers", ClickCounterHandlers);
        injector.bind("clickCounter", ClickCounter);
        injector.bindToCollection("modelBinders", ClickCounterModelBinder);
        injector.bindToCollection("viewModelBinders", ClickCounterViewModelBinder);
    }
}