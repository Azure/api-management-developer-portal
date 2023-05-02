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

    @Param()
    public model: ApiDetailsPageModel;

    @Event()
    public onChange: (model: ApiDetailsPageModel) => void;

    constructor() {
        this.groupOperationsByTag = ko.observable(false);
        this.showUrlPath = ko.observable(false);
        this.wrapText = ko.observable(false);
        this.enableConsole = ko.observable(false);
    }

    @OnMounted()
    public async initialize(): Promise<void> {
        this.groupOperationsByTag(this.model.groupOperationsByTag);
        this.showUrlPath(this.model.showUrlPath);
        this.wrapText(this.model.wrapText);
        this.enableConsole(this.model.enableConsole);

        this.groupOperationsByTag.subscribe(this.applyChanges);
        this.showUrlPath.subscribe(this.applyChanges);
        this.wrapText.subscribe(this.applyChanges);
        this.enableConsole.subscribe(this.applyChanges);
    }

    private applyChanges(): void {
        this.model.groupOperationsByTag = this.groupOperationsByTag();
        this.model.showUrlPath = this.showUrlPath();
        this.model.wrapText = this.wrapText();
        this.model.enableConsole = this.enableConsole();

        this.onChange(this.model);
    }
}