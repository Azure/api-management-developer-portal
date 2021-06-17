import * as ko from "knockout";
import template from "./listOfApisEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { HyperlinkModel } from "@paperbits/common/permalinks";
import { ListOfApisModel } from "../listOfApisModel";


@Component({
    selector: "list-of-apis-editor",
    template: template
})
export class ListOfApisEditor {
    public readonly itemStyles: ko.ObservableArray<any>;
    public readonly itemStyle: ko.Observable<string>;
    public readonly allowSelection: ko.Observable<boolean>;
    public readonly showApiType: ko.Observable<boolean>;
    public readonly defaultGroupByTagToEnabled: ko.Observable<boolean>;
    public readonly hyperlink: ko.Observable<HyperlinkModel>;
    public readonly hyperlinkTitle: ko.Computed<string>;

    constructor() {
        this.allowSelection = ko.observable(false);
        this.showApiType = ko.observable(true);
        this.defaultGroupByTagToEnabled = ko.observable(false);
        this.hyperlink = ko.observable();
        this.hyperlinkTitle = ko.computed<string>(
            () => this.hyperlink()
                ? this.hyperlink().title
                : "Add a link...");

        this.itemStyles = ko.observableArray<any>([
            { name: "List", styleValue: "list" },
            { name: "Tiles", styleValue: "tiles" },
            { name: "Dropdown", styleValue: "dropdown" }
        ]);

        this.itemStyle = ko.observable<any>();
    }

    @Param()
    public model: ListOfApisModel;

    @Event()
    public onChange: (model: ListOfApisModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.allowSelection(this.model.allowSelection);
        this.showApiType(this.model.showApiType);
        this.defaultGroupByTagToEnabled(this.model.defaultGroupByTagToEnabled);
        this.hyperlink(this.model.detailsPageHyperlink);

        this.allowSelection.subscribe(this.applyChanges);
        this.showApiType.subscribe(this.applyChanges);
        this.defaultGroupByTagToEnabled.subscribe(this.applyChanges);        
    }

    private applyChanges(): void {
        this.model.allowSelection = this.allowSelection();
        this.model.showApiType = this.showApiType();
        this.model.defaultGroupByTagToEnabled = this.defaultGroupByTagToEnabled();
        this.model.detailsPageHyperlink = this.hyperlink();
        this.onChange(this.model);
    }

    public onHyperlinkChange(hyperlink: HyperlinkModel): void {
        this.hyperlink(hyperlink);
        this.applyChanges();
    }
}