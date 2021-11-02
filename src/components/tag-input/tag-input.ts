import * as ko from "knockout";
import * as Constants from "../../constants";
import template from "./tag-input.html";
import tagListTemplate from "./tag-list.html";
import { Component, Event, Param, OnMounted } from "@paperbits/common/ko/decorators";
import { Tag } from "../../models/tag";
import { TagService } from "../../services/tagService";
import { RouteHelper } from "../../routing/routeHelper";
import { TagContract } from "../../contracts/tag";
import { Utils } from "../../utils";

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

    constructor(
        private readonly tagService: TagService,
        private readonly routeHelper: RouteHelper
    ) {
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

        this.initTagsFilter();

        await this.resetSearch();

        this.pattern
            .extend({ rateLimit: { timeout: Constants.defaultInputDelayMs, method: "notifyWhenChangesStop" } })
            .subscribe(this.resetSearch);

        this.scope
            .subscribe(this.resetSearch);
    }

    private initTagsFilter(): void {
        const tagsValue = this.routeHelper.getTags();

        if (!tagsValue) {
            return;
        }

        const tags = tagsValue.split("|");
        const tagItems = [];

        if (tags && tags.length > 0) {
            for (const tag of tags) {
                const tagContract: TagContract = Utils.armifyContract("tags", {
                    id: `/tags/${tag}`,
                    name: tag
                });
                tagItems.push(new Tag(tagContract));

            }
            
            this.selection(tagItems);

            if (this.onChange) {
                this.onChange(this.selection());
                this.onDismiss.notifySubscribers();
            }
        }
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
        this.routeHelper.setHashParameter("tags", this.selection().map(t => t.name).join("|"));

        if (this.onChange) {
            this.onChange(this.selection());
            this.onDismiss.notifySubscribers();
        }
    }

    public removeTag(tag: Tag): void {
        this.selection.remove(tag);
        this.routeHelper.setHashParameter("tags", this.selection().map(t => t.name).join("|"));

        if (this.onChange) {
            this.onChange(this.selection());
            this.onDismiss.notifySubscribers();
        }
    }
}