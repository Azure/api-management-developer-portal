import * as ko from "knockout";
import template from "./listOfApisEditor.html";
import { StyleService } from "@paperbits/styles";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { ListOfApisModel } from "../listOfApisModel";

@Component({
    selector: "list-of-apis-editor",
    template: template,
    injectable: "listOfApisEditor"
})
export class ListOfApisEditor {
    public itemStyles: ko.ObservableArray<any>;
    public itemStyle: ko.Observable<string>;

    constructor(private readonly styleService: StyleService) {
        this.itemStyles = ko.observableArray<any>([
            {name: "List", styleValue: "list"},
            {name: "Tiles", styleValue: "tiles"},
            {name: "Dropdown", styleValue: "dropdown"}
        ]);
        this.itemStyle = ko.observable<any>();
    }

    @Param()
    public model: ListOfApisModel;

    @Event()
    public onChange: (model: ListOfApisModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.itemStyle(this.model.itemStyleView || "");
        this.itemStyle.subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        this.model.itemStyleView = this.itemStyle();
        this.onChange(this.model);
    }
}