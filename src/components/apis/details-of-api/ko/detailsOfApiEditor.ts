import * as ko from "knockout";
import template from "./detailsOfApiEditor.html";
import { HyperlinkModel } from "@paperbits/common/permalinks";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { DetailsOfApiModel } from "../detailsOfApiModel";

@Component({
    selector: "details-of-api-editor",
    template: template,
    injectable: "detailsOfApiEditor"
})
export class DetailsOfApiEditor {
    public readonly allowSelection: ko.Observable<boolean>;
    public readonly hyperlink: ko.Observable<HyperlinkModel>;
    public readonly hyperlinkTitle: ko.Computed<string>;
    constructor() { 
        this.allowSelection = ko.observable(false);
        this.hyperlink = ko.observable();
        this.hyperlinkTitle = ko.computed<string>(
            () => this.hyperlink()
                ? this.hyperlink().title
                : "Add a link...");
    }

    @Param()
    public model: DetailsOfApiModel;

    @Event()
    public onChange: (model: DetailsOfApiModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.allowSelection(this.model.allowSelection);
        this.hyperlink(this.model.detailsPageHyperlink);

        this.allowSelection.subscribe(this.applyChanges);
    }
    private applyChanges(): void {
        this.model.allowSelection = this.allowSelection();
        this.model.detailsPageHyperlink = this.hyperlink();
        this.onChange(this.model);
    }

    public onHyperlinkChange(hyperlink: HyperlinkModel): void {
        this.hyperlink(hyperlink);
        this.applyChanges();
    }
}