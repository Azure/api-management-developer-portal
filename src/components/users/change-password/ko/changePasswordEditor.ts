import * as ko from "knockout";
import template from "./changePasswordEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { ChangePasswordModel } from "../changePasswordModel";

@Component({
    selector: "change-password-editor",
    template: template
})
export class ChangePasswordEditor {
    public requireHipCaptcha: ko.Observable<boolean>;

    constructor() {
        this.requireHipCaptcha = ko.observable<boolean>();
    }

    @Param()
    public model: ChangePasswordModel;

    @Event()
    public onChange: (model: ChangePasswordModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.requireHipCaptcha(this.model.requireHipCaptcha);
        this.requireHipCaptcha.subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        this.model.requireHipCaptcha = this.requireHipCaptcha();
        this.onChange(this.model);
    }
}