import * as ko from "knockout";
import template from "./operationDetailsEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { OperationDetailsModel } from "../operationDetailsModel";

@Component({
    selector: "operation-details-editor",
    template: template
})
export class OperationDetailsEditor {
    public readonly enableConsole: ko.Observable<boolean>;
    public readonly enableScrollTo: ko.Observable<boolean>;
    public readonly defaultSchemaView: ko.Observable<string>;
    public readonly useCorsProxy: ko.Observable<boolean>;

    constructor() {
        this.enableConsole = ko.observable();
        this.enableScrollTo = ko.observable();
        this.defaultSchemaView = ko.observable();
        this.useCorsProxy = ko.observable();
    }

    @Param()
    public model: OperationDetailsModel;

    @Event()
    public onChange: (model: OperationDetailsModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.enableConsole(this.model.enableConsole);
        this.useCorsProxy(this.model.useCorsProxy);
        this.enableScrollTo(this.model.enableScrollTo);
        this.defaultSchemaView(this.model.defaultSchemaView || "table");
        
        this.enableConsole.subscribe(this.applyChanges);
        this.useCorsProxy.subscribe(this.applyChanges);
        this.enableScrollTo.subscribe(this.applyChanges);
        this.defaultSchemaView.subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        this.model.enableConsole = this.enableConsole();
        this.model.useCorsProxy = this.useCorsProxy();
        this.model.enableScrollTo = this.enableScrollTo();
        this.model.defaultSchemaView = this.defaultSchemaView();
        this.onChange(this.model);
    }
}