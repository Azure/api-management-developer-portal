import * as ko from "knockout";
import template from "./conferenceSessionEditorView.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { WidgetEditor } from "@paperbits/common/widgets";
import { ConferenceSessionModel } from "../conferenceSessionModel";
import { widgetEditorSelector } from "..";


@Component({
    selector: widgetEditorSelector,
    template: template
})
export class ConferenceSessionEditor implements WidgetEditor<ConferenceSessionModel> {
    public readonly sessionNumber: ko.Observable<string>;

    constructor() {
        this.sessionNumber = ko.observable();
    }

    @Param()
    public model: ConferenceSessionModel;

    @Event()
    public onChange: (model: ConferenceSessionModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.sessionNumber(this.model.sessionNumber);
        this.sessionNumber.subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        this.model.sessionNumber = this.sessionNumber();
        this.onChange(this.model);
    }
}