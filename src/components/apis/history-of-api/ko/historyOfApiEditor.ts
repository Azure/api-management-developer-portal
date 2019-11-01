import * as ko from "knockout";
import template from "./historyOfApiEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { HistoryOfApiModel } from "../historyOfApiModel";
import { HyperlinkModel } from "@paperbits/common/permalinks";

@Component({
    selector: "history-of-api-editor",
    template: template,
    injectable: "historyOfApiEditor"
})
export class HistoryOfApiEditor {
    public readonly hyperlink: ko.Observable<HyperlinkModel>;
    public readonly hyperlinkTitle: ko.Computed<string>;

    constructor() {
        this.hyperlink = ko.observable();
        this.hyperlinkTitle = ko.computed<string>(
            () => this.hyperlink() ? this.hyperlink().title : "Add a link...");
    }

    @Param()
    public model: HistoryOfApiModel;

    @Event()
    public onChange: (model: HistoryOfApiModel) => void;

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