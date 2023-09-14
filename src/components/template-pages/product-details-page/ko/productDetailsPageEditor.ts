import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import template from "./productDetailsPageEditor.html";
import * as ko from "knockout";
import { ProductDetailsPageModel } from "../productDetailsPageModel";

@Component({
    selector: "product-details-page-editor",
    template: template
})
export class ProductDetailsPageEditor {
    public readonly wrapText: ko.Observable<boolean>;

    @Param()
    public model: ProductDetailsPageModel;

    @Event()
    public onChange: (model: ProductDetailsPageModel) => void;

    constructor() {
        this.wrapText = ko.observable(false);
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.wrapText(this.model.wrapText);

        this.wrapText.subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        this.model.wrapText = this.wrapText();
        this.onChange(this.model);
    }
}