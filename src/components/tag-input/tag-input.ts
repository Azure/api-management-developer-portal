import * as ko from "knockout";
import * as Constants from "../../constants";
import template from "./tag-input.html";
import tagListTemplate from "./tag-list.html";
import { Component, Event, Param, OnMounted } from "@paperbits/common/ko/decorators";
import { Tag } from "../../models/tag";
import { TagService } from "../../services/tagService";

@Component({
    selector: "tag-input",
    template: template,
    childTemplates: { tagList: tagListTemplate }
})
export class TagInput {
    public readonly tags: ko.ObservableArray<Tag>;
    public readonly selection: ko.ObservableArray<Tag>;
    public readonly pattern: ko.Observable<string>;
    public readonly empty: ko.Computed<boolean>;
    public readonly canAddTags: ko.Computed<boolean>;
    public readonly availableTags: ko.Computed<Tag[]>;

    constructor(private readonly tagService: TagService) {
        this.tags = ko.observableArray();
        this.scope = ko.observable();
        this.pattern = ko.observable();
        this.selection = ko.observableArray([]);
        this.availableTags = ko.computed<Tag[]>(() => this.tags().filter(tag => !this.selection().map(x => x.id).includes(tag.id)));
        this.empty = ko.computed(() => this.availableTags().length === 0);
        this.onDismiss = new ko.subscribable<Tag[]>();
    }

    @Param()
    public scope: ko.Observable<string>;

    @Event()
    public onChange: (tags: Tag[]) => void;

    public onDismiss: ko.Subscribable;

    @OnMounted()
    public async initialize(): Promise<void> {
        if (!this.scope) {
            return;
        }

        await this.resetSearch();

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.resetSearch);

        this.scope
            .subscribe(this.resetSearch);
    }

    public async loadPageOfTags(): Promise<void> {
        const pageOfTags = await this.tagService.getTags(this.scope(), this.pattern());
        const tags = pageOfTags.value.filter(tag => !this.selection().map(x => x.id).includes(tag.id));

        this.tags(tags);
    }

    public async resetSearch(): Promise<void> {
        await this.loadPageOfTags();
    }

    public addTag(tag: Tag): void {
        this.selection.push(tag);

        if (this.onChange) {
            this.onChange(this.selection());
            this.onDismiss.notifySubscribers();
        }
    }

    public removeTag(tag: Tag): void {
        this.selection.remove(tag);

        if (this.onChange) {
            this.onChange(this.selection());
            this.onDismiss.notifySubscribers();
        }
    }
}