import * as ko from "knockout";
import template from "./userSignupEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { UserSignupModel } from "../userSignupModel";

@Component({
    selector: "user-signup-editor",
    template: template
})
export class UserSignupEditor {
    public requireHipCaptcha: ko.Observable<boolean>;

    constructor() {
        this.requireHipCaptcha = ko.observable<boolean>();
    }

    @Param()
    public model: UserSignupModel;

    @Event()
    public onChange: (model: UserSignupModel) => void;

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