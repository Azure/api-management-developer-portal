import template from "./spinner.html";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: "spinner",
    template: template,
    injectable: "spinner"
})
export class Spinner { }