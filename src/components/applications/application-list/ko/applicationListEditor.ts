import * as ko from "knockout";
import template from "./applicationListEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { HyperlinkModel } from "@paperbits/common/permalinks";
import { ApplicationListModel } from "../applicationListModel";


@Component({
    selector: "application-list-editor",
    template: template
})
export class ApplicationListEditor {
    public readonly allowViewSwitching: ko.Observable<boolean>;
    public readonly hyperlink: ko.Observable<HyperlinkModel>;
    public readonly hyperlinkTitle: ko.Computed<string>;

    constructor() {
        this.allowViewSwitching = ko.observable(true);
        this.hyperlink = ko.observable();
        this.hyperlinkTitle = ko.computed<string>(() => this.hyperlink() ? this.hyperlink().title : "Add a link...");
    }

    @Param()
    public model: ApplicationListModel;

    @Event()
    public onChange: (model: ApplicationListModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.allowViewSwitching(this.model.allowViewSwitching);
        this.hyperlink(this.model.detailsPageHyperlink);

        this.allowViewSwitching.subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        this.model.allowViewSwitching = this.allowViewSwitching();
        this.model.detailsPageHyperlink = this.hyperlink();
        this.onChange(this.model);
    }

    public onHyperlinkChange(hyperlink: HyperlinkModel): void {
        this.hyperlink(hyperlink);
        this.applyChanges();
    }
}