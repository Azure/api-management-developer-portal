import * as ko from "knockout";
import template from "./signinSocialEditor.html";
import { StyleService } from "@paperbits/styles";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { LocalStyles } from "@paperbits/common/styles";
import { SigninSocialModel } from "../signinSocialModel";


@Component({
    selector: "signin-social-editor",
    template: template
})
export class SignInSocialEditor {
    public readonly aadLabel: ko.Observable<string>;
    public readonly aadReplyUrl: ko.Observable<string>;
    public readonly aadB2CLabel: ko.Observable<string>;
    public readonly aadB2CReplyUrl: ko.Observable<string>;
    public readonly appearanceStyle: ko.Observable;
    public readonly appearanceStyles: ko.ObservableArray;

    constructor(private readonly styleService: StyleService) {
        this.aadLabel = ko.observable<string>();
        this.aadReplyUrl = ko.observable<string>();
        this.aadB2CLabel = ko.observable<string>();
        this.aadB2CReplyUrl = ko.observable<string>();
        this.appearanceStyle = ko.observable();
        this.appearanceStyles = ko.observableArray();
    }

    @Param()
    public model: SigninSocialModel;

    @Event()
    public onChange: (model: SigninSocialModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        this.aadLabel(this.model.aadLabel);
        this.aadReplyUrl(this.model.aadReplyUrl);
        this.aadB2CLabel(this.model.aadB2CLabel);
        this.aadB2CReplyUrl(this.model.aadB2CReplyUrl);

        if (this.model.styles) {
            const variations = await this.styleService.getComponentVariations("button");
            this.appearanceStyles(variations.filter(x => x.category === "appearance"));
            this.appearanceStyle(this.model.styles?.appearance);
        }

        this.aadLabel.subscribe(this.applyChanges);
        this.aadReplyUrl.subscribe(this.applyChanges);
        this.aadB2CLabel.subscribe(this.applyChanges);
        this.aadB2CReplyUrl.subscribe(this.applyChanges);
        this.appearanceStyle.subscribe(this.applyChanges);
    }

    public onVariationSelected(snippet: LocalStyles): void {
        this.appearanceStyle(snippet);
        this.applyChanges();
    }

    public onRoleSelect(roles: string[]): void {
        this.model.security = { roles: roles };
        this.applyChanges();
    }

    private applyChanges(): void {
        this.model.aadLabel = this.aadLabel();
        this.model.aadB2CLabel = this.aadB2CLabel();
        this.model.aadReplyUrl = this.aadReplyUrl() || null;
        this.model.aadB2CReplyUrl = this.aadB2CReplyUrl() || null;
        this.model.styles = {
            appearance: this.appearanceStyle()
        };

        this.onChange(this.model);
    }
}