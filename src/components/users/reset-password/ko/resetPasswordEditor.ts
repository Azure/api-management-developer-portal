import * as ko from "knockout";
import template from "./resetPasswordEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { ResetPasswordModel } from "../resetPasswordModel";

@Component({
    selector: "reset-password-editor",
    template: template,
    injectable: "resetPasswordEditor"
})
export class ResetPasswordEditor {
    public requireHipCaptcha: ko.Observable<boolean>;

    constructor() {
        this.requireHipCaptcha = ko.observable<boolean>().extend({throttle: 500});
    }

    @Param()
    public model: ResetPasswordModel;

    @Event()
    public onChange: (model: ResetPasswordModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.requireHipCaptcha.subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        this.onChange(this.model);
    }
}