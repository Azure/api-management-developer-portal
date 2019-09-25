import * as ko from "knockout";
import template from "./userResetEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { UserResetModel } from "../userResetModel";

@Component({
    selector: "user-reset-editor",
    template: template,
    injectable: "userResetEditor"
})
export class UserResetEditor {
    public requireHipCaptcha: ko.Observable<boolean>;

    constructor() {
        this.requireHipCaptcha = ko.observable<boolean>().extend({throttle: 500});
    }

    @Param()
    public model: UserResetModel;

    @Event()
    public onChange: (model: UserResetModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        // this.requireHipCaptcha(this.model.requireHipCaptcha);
        this.requireHipCaptcha.subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        // this.model.requireHipCaptcha = this.requireHipCaptcha();
        this.onChange(this.model);
    }
}