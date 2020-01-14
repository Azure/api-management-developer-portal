import * as ko from "knockout";
import template from "./detailsOfApiEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { DetailsOfApiModel } from "../detailsOfApiModel";
import { HyperlinkModel } from "@paperbits/common/permalinks";

@Component({
    selector: "details-of-api-editor",
    template: template
})
export class DetailsOfApiEditor {
    public readonly hyperlink: ko.Observable<HyperlinkModel>;
    public readonly hyperlinkTitle: ko.Computed<string>;

    constructor() {
        this.hyperlink = ko.observable();
        this.hyperlinkTitle = ko.computed<string>(
            () => this.hyperlink() ? this.hyperlink().title : "Add a link...");        
    }

    @Param()
    public model: DetailsOfApiModel;

    @Event()
    public onChange: (model: DetailsOfApiModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.hyperlink(this.model.changeLogPageHyperlink);
    }

    private applyChanges(): void {
        this.model.changeLogPageHyperlink = this.hyperlink();
        this.onChange(this.model);
    }

    public onHyperlinkChange(hyperlink: HyperlinkModel): void {
        this.hyperlink(hyperlink);
        this.applyChanges();
    }
}