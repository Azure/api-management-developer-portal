import * as ko from "knockout";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { HyperlinkModel } from "@paperbits/common/permalinks";
import { ApplicationDetailsModel } from "../applicationDetailsModel";
import template from "./applicationDetailsEditor.html";

@Component({
    selector: "application-details-editor",
    template: template
})
export class ApplicationDetailsEditor {
    public readonly hyperlink: ko.Observable<HyperlinkModel>;
    public readonly hyperlinkTitle: ko.Computed<string>;

    constructor() {
        this.hyperlink = ko.observable();
        this.hyperlinkTitle = ko.computed<string>(() => this.hyperlink() ? this.hyperlink().title : "Add a link...");
    }

    @Param()
    public model: ApplicationDetailsModel;

    @Event()
    public onChange: (model: ApplicationDetailsModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.hyperlink(this.model.detailsPageHyperlink);
    }

    private applyChanges(): void {
        this.model.detailsPageHyperlink = this.hyperlink();
        this.onChange(this.model);
    }

    public onHyperlinkChange(hyperlink: HyperlinkModel): void {
        this.hyperlink(hyperlink);
        this.applyChanges();
    }
}