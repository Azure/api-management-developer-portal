import * as ko from "knockout";
import template from "./signinSocialEditor.html";
import { StyleService } from "@paperbits/styles";
import { HyperlinkModel } from "@paperbits/common/permalinks";
import { SigninSocialModel } from "../signinSocialModel";
import { Component, OnMounted, Param, Event } from "@paperbits/common/ko/decorators";
import { LocalStyles } from "@paperbits/common/styles";


@Component({
    selector: "signin-social-editor",
    template: template
})
export class SignInSocialEditor {
    public readonly appearanceStyle: ko.Observable<LocalStyles>;
    public readonly aadLabel: ko.Observable<string>;
    public readonly aadB2CLabel: ko.Observable<string>;

    constructor(private readonly styleService: StyleService) {
        this.aadLabel = ko.observable<string>();
        this.aadB2CLabel = ko.observable<string>();
        this.appearanceStyle = ko.observable<any>();
    }

    @Param()
    public model: SigninSocialModel;

    @Event()
    public onChange: (model: SigninSocialModel) => void;

    @OnMounted()
    public async initialize(): Promise<void> {
        const buttonVariations = await this.styleService.getComponentVariations("button");

        this.aadLabel(this.model.aadLabel);
        this.aadB2CLabel(this.model.aadB2CLabel);

        if (this.model.styles) {
            const selectedAppearence = buttonVariations.find(x => x.category === "appearance" && x.key === this.model.styles.appearance);
            this.appearanceStyle(selectedAppearence);
        }

        this.aadLabel.subscribe(this.applyChanges);
        this.aadB2CLabel.subscribe(this.applyChanges);
    }

    public onVariationSelected(snippet: LocalStyles): void {
        this.appearanceStyle(snippet);
        this.applyChanges();
    }

    public onRoleSelect(roles: string[]): void {
        this.model.roles = roles;
        this.applyChanges();
    }

    private applyChanges(): void {
        this.model.aadLabel = this.aadLabel();
        this.model.aadB2CLabel = this.aadB2CLabel();
        this.model.styles = {
            appearance: this.appearanceStyle().key
        };

        this.onChange(this.model);
    }
}