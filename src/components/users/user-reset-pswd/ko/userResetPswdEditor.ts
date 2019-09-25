import * as ko from "knockout";
import template from "./userResetPswdEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { UserResetPswdModel } from "../userResetPswdModel";

@Component({
    selector: "user-reset-pswd-editor",
    template: template,
    injectable: "userResetPswdEditor"
})
export class UserResetPswdEditor {
    constructor() {}

    @Param()
    public model: UserResetPswdModel;

    @Event()
    public onChange: (model: UserResetPswdModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {}

    private applyChanges(): void {
        this.onChange(this.model);
    }
}