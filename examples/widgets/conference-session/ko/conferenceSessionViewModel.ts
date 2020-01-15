import * as ko from "knockout";
import template from "./conferenceSession.html";
import { Component } from "@paperbits/common/ko/decorators";
import { widgetSelector } from "../constants";


@Component({
    selector: widgetSelector,
    template: template
})
export class ConferenceSessionViewModel {
    public readonly runtimeConfig: ko.Observable<string>;

    constructor() {
        this.runtimeConfig = ko.observable();
    }
}
