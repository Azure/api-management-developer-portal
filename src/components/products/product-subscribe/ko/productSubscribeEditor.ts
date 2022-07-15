import * as ko from "knockout";
import template from "./productSubscribeEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { ProductSubscribeModel } from "../productSubscribeModel";


@Component({
    selector: "product-subscribe-editor",
    template: template
})
export class ProductSubscribeEditor {
    public readonly showTermsByDefault: ko.Observable<boolean>;


    constructor() {
        this.showTermsByDefault = ko.observable(false);
    }

    @Param()
    public model: ProductSubscribeModel;

    @Event()
    public onChange: (model: ProductSubscribeModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.showTermsByDefault(this.model.showTermsByDefault);
        this.showTermsByDefault.subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        this.model.showTermsByDefault = this.showTermsByDefault();
        this.onChange(this.model);
    }

}