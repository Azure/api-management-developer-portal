import * as ko from "knockout";
import template from "./markdownEditor.html";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import {MarkdownModel} from "../markdownModel";
import { MarkdownSupportService } from "../../../services/markdownSupportService";
import { MarkdownArmResource } from "../../../contracts/markdown-arm";
import { MarkdownService } from "../../../services/markdownService";

@Component({
    selector: "markdown-editor",
    template: template
})
export class MarkdownEditor {
    public filter: ko.Observable<string>;
    public isWorking: ko.Observable<boolean>;
    public nextLink?: string;
    public count: ko.Observable<number>;
    public loadMore: ko.Computed<boolean>;
    public formatAmountOfDocuments: ko.Computed<string>;
    public documents: ko.ObservableArray<MarkdownArmResource>;
    public selectedDocuments: ko.ObservableArray<MarkdownArmResource>;

    constructor(
        private readonly markdownSupportService: MarkdownSupportService,
        private readonly markdownService: MarkdownService
        ) {
        this.filter = ko.observable();
        this.isWorking = ko.observable();
        this.documents = ko.observableArray();
        this.selectedDocuments = ko.observableArray();
        this.count = ko.observable(0);
        this.loadMore = ko.computed<boolean>(() => this.count() > this.documents().length);
        this.formatAmountOfDocuments = ko.computed<string>(() => this.documents().length + "/" + this.count());
    }

    @Param()
    public model: MarkdownModel;

    @Event()
    public onChange: (model: MarkdownModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> { 
        this.filter.subscribe(this.search);
        this.isWorking(true);
        this.loadMarkdownDocuments();
        if (this.model.id) {
            this.initSeletectedDocument();
        }
    }

    public async onEndReach() {
        if (!this.nextLink || !this.loadMore() || this.isWorking()) return;
        this.isWorking(true);
        const docs = await this.markdownSupportService.getMarkownDocumentsByContinuationToken(this.nextLink);
        if (!docs.value) return;
        this.documents(this.documents().concat(docs.value));
        this.nextLink = docs.nextLink;
        this.count(docs.count);
        this.isWorking(false);
    }

    private async loadMarkdownDocuments(): Promise<void> {
        const documents = await this.markdownSupportService.getMarkdownDocuments();
        if (!documents.value) return;
        this.documents(documents.value);
        this.nextLink = documents.nextLink;
        this.count(documents.count);
        this.isWorking(false);
    }

    private async search(filter): Promise<void> {
        const docs = await this.markdownSupportService.getMarkdownDocuments(filter);
        if (!docs.value) return;
        this.documents(docs.value);
        this.nextLink = docs.nextLink;
        this.count(docs.count)
        this.filter(filter);
    }

    public selectDocument(document: MarkdownArmResource): void {
        const processed = this.markdownService.processMarkdown(document.properties.en_us.content);
        this.model.compiledContent = processed.toString();
        this.model.id = document.id;
        this.selectedDocuments([document]);
        this.onChange(this.model);
    }

    public isSelected(document: MarkdownArmResource): boolean {
        return this.selectedDocuments().some(x => x.id === document.id);
    }

    private async initSeletectedDocument() {
        let doc = await this.markdownSupportService.getMarkdownDocument(this.model.id);
        this.selectDocument(doc);
    }

}