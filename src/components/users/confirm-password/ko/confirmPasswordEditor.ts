import template from "./confirmPasswordEditor.html";
import { Component, Param, Event } from "@paperbits/common/ko/decorators";
import { ConfirmPasswordModel } from "../confirmPasswordModel";

@Component({
    selector: "confirm-passwor-editor",
    template: template
})
export class ConfirmPasswordEditor {
    @Param()
    public model: ConfirmPasswordModel;

    @Event()
    public onChange: (model: ConfirmPasswordModel) => void;
}