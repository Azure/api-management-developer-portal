import * as ko from "knockout";
import { Subscription } from "../../../models/subscription";

export class SubscriptionViewModel {
    private hiddenKey = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
    private showLabel = "Show";
    private hideLabel = "Hide";
    public primaryKey: KnockoutObservable<string>;
    public secondaryKey: KnockoutObservable<string>;
    public primaryKeyBtnLabel: KnockoutObservable<string>;
    public secondaryKeyBtnLabel: KnockoutObservable<string>;
    public isPRegenerating: KnockoutObservable<boolean>;
    public isSRegenerating: KnockoutObservable<boolean>;

    public editName: KnockoutObservable<string>;
    public isEdit: KnockoutObservable<boolean>;
    
    constructor(public model: Subscription) {
        this.primaryKey = ko.observable(this.hiddenKey);
        this.secondaryKey = ko.observable(this.hiddenKey);
        this.primaryKeyBtnLabel = ko.observable(this.showLabel);
        this.secondaryKeyBtnLabel = ko.observable(this.showLabel);
        this.isPRegenerating = ko.observable(false);
        this.isSRegenerating = ko.observable(false);
        this.editName = ko.observable(model.name);
        this.isEdit = ko.observable(false);
    }

    public toggleEdit() {
        this.isEdit(!this.isEdit());
    }

    public togglePrimaryKey() {
        const isShown = this.showLabel === this.primaryKeyBtnLabel();
        this.primaryKey(isShown ? this.model.primaryKey : this.hiddenKey);
        this.primaryKeyBtnLabel(isShown ? this.hideLabel: this.showLabel);
    }

    public toggleSecondaryKey() {
        const isShown = this.showLabel === this.secondaryKeyBtnLabel();
        this.secondaryKey(isShown ? this.model.secondaryKey : this.hiddenKey);
        this.secondaryKeyBtnLabel(isShown ? this.hideLabel: this.showLabel);
    }
}