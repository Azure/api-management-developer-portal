import template from "./help.html";
import { Component } from "@paperbits/common/ko/decorators";

@Component({
    selector: "help-workshop",
    template: template,
    injectable: "helpWorkshop"
})
export class HelpWorkshop {
}
