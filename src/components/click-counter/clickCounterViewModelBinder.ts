/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file and at https://paperbits.io/license/mit.
 */

import { Bag } from "@paperbits/common";
import { ComponentFlow, WidgetBinding } from "@paperbits/common/editing";
import { EventManager } from "@paperbits/common/events";
import { StyleCompiler } from "@paperbits/common/styles";
import { ViewModelBinder } from "@paperbits/common/widgets";
import { ClickCounterModel } from "./clickCounterModel";
import { ClickCounter } from "./clickCounter";


export class ClickCounterViewModelBinder implements ViewModelBinder<ClickCounterModel, ClickCounter>  {
    constructor(
        private readonly eventManager: EventManager,
        private readonly styleCompiler: StyleCompiler
    ) { }

    public async createWidgetBinding(model: ClickCounterModel, bindingContext: Bag<any>): Promise<WidgetBinding<ClickCounterModel, ClickCounter>> {
        const binding = new WidgetBinding<ClickCounterModel, ClickCounter>();
        binding.framework = "react";
        binding.model = model;
        binding.name = "click-counter";
        binding.displayName = "Click counter";
        binding.editor = "click-counter-editor";
        binding.readonly = false;
        binding.flow = ComponentFlow.Block;
        binding.draggable = true;
        binding.viewModelClass = ClickCounter;
        binding.applyChanges = async () => {
            await this.modelToViewModel(model, binding.viewModel, bindingContext);
            this.eventManager.dispatchEvent("onContentUpdate");
        };
        binding.onCreate = async () => {
            await this.modelToViewModel(model, binding.viewModel, bindingContext);
        };
        binding.onDispose = async () => {
            if (model.styles?.instance) {
                bindingContext.styleManager.removeStyleSheet(model.styles.instance.key);
            }
        };

        return binding;
    }

    public async modelToViewModel(model: ClickCounterModel, viewModel: ClickCounter, bindingContext?: Bag<any>): Promise<ClickCounter> {
        let classNames = null;

        if (model.styles) {
            const styleModel = await this.styleCompiler.getStyleModelAsync(model.styles, bindingContext?.styleManager);

            if (styleModel.styleManager) {
                styleModel.styleManager.setStyleSheet(styleModel.styleSheet);
            }

            classNames = styleModel.classNames;
        }

        viewModel.setState(state => ({
            initialCount: model.initialCount,
            classNames: classNames
        }));

        return viewModel;
    }

    public canHandleModel(model: ClickCounterModel): boolean {
        return model instanceof ClickCounterModel;
    }
}