import template from "./validationSummaryEditor.html";
import { Component, Param} from "@paperbits/common/ko/decorators";
import { ValidationSummaryModel } from "../../validation-summary/validationSummaryModel";

@Component({
    selector: "validation-summary-editor",
    template: template,
    injectable: "validationSummaryEditor"
})
export class ValidationSummaryEditor {
    constructor() { }

    @Param()
    public model: ValidationSummaryModel;
}