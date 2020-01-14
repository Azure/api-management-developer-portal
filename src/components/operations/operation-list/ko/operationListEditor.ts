import * as ko from "knockout";
import template from "./operationListEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { OperationListModel } from "../operationListModel";
import { HyperlinkModel } from "@paperbits/common/permalinks";

@Component({
    selector: "operation-list-editor",
    template: template
})
export class OperationListEditor {
    public readonly allowSelection: ko.Observable<boolean>;
    public readonly defaultGroupByTagToEnabled: ko.Observable<boolean>;
    public readonly hyperlink: ko.Observable<HyperlinkModel>;
    public readonly hyperlinkTitle: ko.Computed<string>;

    constructor() {
        this.allowSelection = ko.observable(false);
        this.defaultGroupByTagToEnabled = ko.observable(false);
        this.hyperlink = ko.observable();
        this.hyperlinkTitle = ko.computed<string>(() => this.hyperlink() ? this.hyperlink().title : "Add a link...");
    }

    @Param()
    public model: OperationListModel;

    @Event()
    public onChange: (model: OperationListModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.allowSelection(this.model.allowSelection);
        this.defaultGroupByTagToEnabled(this.model.defaultGroupByTagToEnabled);
        this.hyperlink(this.model.detailsPageHyperlink);

        this.allowSelection.subscribe(this.applyChanges);
        this.defaultGroupByTagToEnabled.subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        this.model.allowSelection = this.allowSelection();
        this.model.defaultGroupByTagToEnabled = this.defaultGroupByTagToEnabled();
        this.model.detailsPageHyperlink = this.hyperlink();
        this.onChange(this.model);
    }

    public onHyperlinkChange(hyperlink: HyperlinkModel): void {
        this.hyperlink(hyperlink);
        this.applyChanges();
    }
}