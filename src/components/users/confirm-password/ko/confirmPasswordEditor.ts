import * as ko from "knockout";
import template from "./confirmPasswordEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { ConfirmPasswordModel } from "../confirmPasswordModel";

@Component({
    selector: "confirm-passwor-editor",
    template: template,
    injectable: "confirmPasswordEditor"
})
export class ConfirmPasswordEditor {
    constructor() {}

    @Param()
    public model: ConfirmPasswordModel;

    @Event()
    public onChange: (model: ConfirmPasswordModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {}

    private applyChanges(): void {
        this.onChange(this.model);
    }
}