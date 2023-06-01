import { Component, Param, Event, OnMounted } from "@paperbits/common/ko/decorators";
import template from "./apiDetailsPageEditor.html";
import * as ko from "knockout";
import { ApiDetailsPageModel } from "../apiDetailsPageModel";

@Component({
    selector: "api-details-page-editor",
    template: template
})

export class ApiDetailsPageEditor {
    public readonly groupOperationsByTag: ko.Observable<boolean>;
    public readonly showUrlPath: ko.Observable<boolean>;
    public readonly wrapText: ko.Observable<boolean>;
    public readonly enableConsole: ko.Observable<boolean>;
    public readonly defaultSchemaView: ko.Observable<string>;
    public readonly showExamples: ko.Observable<boolean>;
    public readonly includeAllHostnames: ko.Observable<boolean>;
    public readonly useCorsProxy: ko.Observable<boolean>;

    @Param()
    public model: ApiDetailsPageModel;

    @Event()
    public onChange: (model: ApiDetailsPageModel) => void;

    constructor() {
        this.groupOperationsByTag = ko.observable(false);
        this.showUrlPath = ko.observable(false);
        this.wrapText = ko.observable(false);

        this.enableConsole = ko.observable(false);
        this.defaultSchemaView = ko.observable("table");
        this.showExamples = ko.observable(false);
        this.includeAllHostnames = ko.observable(false);
        this.useCorsProxy = ko.observable(false);
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.groupOperationsByTag(this.model.groupOperationsByTag);
        this.showUrlPath(this.model.showUrlPath);
        this.wrapText(this.model.wrapText);

        this.enableConsole(this.model.enableConsole);
        this.defaultSchemaView(this.model.defaultSchemaView);
        this.showExamples(this.model.showExamples);
        this.includeAllHostnames(this.model.includeAllHostnames);
        this.useCorsProxy(this.model.useCorsProxy);

        this.groupOperationsByTag.subscribe(this.applyChanges);
        this.showUrlPath.subscribe(this.applyChanges);
        this.wrapText.subscribe(this.applyChanges);

        this.enableConsole.subscribe(this.applyChanges);
        this.defaultSchemaView.subscribe(this.applyChanges);
        this.showExamples.subscribe(this.applyChanges);
        this.includeAllHostnames.subscribe(this.applyChanges);
        this.useCorsProxy.subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        this.model.groupOperationsByTag = this.groupOperationsByTag();
        this.model.showUrlPath = this.showUrlPath();
        this.model.wrapText = this.wrapText();

        this.model.enableConsole = this.enableConsole();
        this.model.defaultSchemaView = this.defaultSchemaView();
        this.model.showExamples = this.showExamples();
        this.model.includeAllHostnames = this.includeAllHostnames();
        this.model.useCorsProxy = this.useCorsProxy();

        this.onChange(this.model);
    }
}