import template from "./validationErrorEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { ValidationErrorModel } from "../validationErrorModel";

@Component({
    selector: "validation-error-editor",
    template: template,
    injectable: "validationErrorEditor"
})
export class ValidationErrorEditor {
    constructor() { }

    @Param()
    public model: ValidationErrorModel;
}