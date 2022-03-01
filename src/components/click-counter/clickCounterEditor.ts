/**
 * @license
 * Copyright Paperbits. All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file and at https://paperbits.io/license/mit.
 */

import * as ko from "knockout";
import template from "./clickCounterEditor.html";
import { ClickCounterModel } from "./clickCounterModel";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { WidgetEditor } from "@paperbits/common/widgets";
import { ChangeRateLimit } from "@paperbits/common/ko/consts";
import { BackgroundStylePluginConfig } from "@paperbits/styles/plugins";
import { StyleHelper } from "@paperbits/styles";

@Component({
    selector: "click-counter-editor",
    template: template
})
export class ClickCounterEditor implements WidgetEditor<ClickCounterModel> {
    public readonly initialCount: ko.Observable<number>;
    public readonly background: ko.Observable<BackgroundStylePluginConfig>;

    constructor() {
        this.initialCount = ko.observable(0);
        this.background = ko.observable<BackgroundStylePluginConfig>();
    }

    @Param()
    public model: ClickCounterModel;

    @Event()
    public onChange: (model: ClickCounterModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        /*
           This method is called after component created. At this moment all the parameters,
           includinig "model", are available.
        */

        this.initialCount(this.model.initialCount);
        this.initialCount
            .extend(ChangeRateLimit)
            .subscribe(this.applyChanges);

        const backgroundStyleConfig = StyleHelper.getPluginConfigForLocalStyles(this.model.styles, "background");
        this.background(backgroundStyleConfig);
    }

    private applyChanges(): void {
        this.model.initialCount = this.initialCount();
        this.onChange(this.model);
    }

    public onBackgroundChange(pluginConfig: BackgroundStylePluginConfig): void {
        StyleHelper.setPluginConfigForLocalStyles(this.model.styles, "background", pluginConfig);
        this.onChange(this.model);
    }
}
