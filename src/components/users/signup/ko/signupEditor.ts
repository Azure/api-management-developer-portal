import * as ko from "knockout";
import template from "./signupEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { SignupModel } from "../signupModel";

@Component({
    selector: "signup-editor",
    template: template
})
export class SignupEditor {
    public requireHipCaptcha: ko.Observable<boolean>;

    constructor() {
        this.requireHipCaptcha = ko.observable<boolean>();
    }

    @Param()
    public model: SignupModel;

    @Event()
    public onChange: (model: SignupModel) => void;

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