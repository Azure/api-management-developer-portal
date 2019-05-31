import * as ko from "knockout";
import template from "./productListEditor.html";
import { StyleService } from "@paperbits/styles";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { ProductListModel } from "../productListModel";

@Component({
    selector: "product-list-editor",
    template: template,
    injectable: "productListEditor"
})
export class ProductListEditor {
    constructor(private readonly styleService: StyleService) { }

    @Param()
    public model: ProductListModel;

    @Event()
    public onChange: (model: ProductListModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        // TODO: Implement
    }

    private applyChanges(): void {
        // TODO: Implement
        this.onChange(this.model);
    }
}