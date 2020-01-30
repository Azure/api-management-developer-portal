import * as ko from "knockout";
import { Subscription } from "../../../../../models/subscription";

export class SubscriptionListItem {
    private hiddenKey = "XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX";
    private showLabel = "Show";
    private hideLabel = "Hide";
    public primaryKey: ko.Observable<string>;
    public secondaryKey: ko.Observable<string>;
    public primaryKeyBtnLabel: ko.Observable<string>;
    public secondaryKeyBtnLabel: ko.Observable<string>;
    public isPRegenerating: ko.Observable<boolean>;
    public isSRegenerating: ko.Observable<boolean>;
    public changedItem: ko.Observable<string>;

    public editName: ko.Observable<string>;
    public isEdit: ko.Observable<boolean>;

    constructor(public model: Subscription) {
        this.primaryKey = ko.observable(this.hiddenKey);
        this.secondaryKey = ko.observable(this.hiddenKey);
        this.primaryKeyBtnLabel = ko.observable(this.showLabel);
        this.secondaryKeyBtnLabel = ko.observable(this.showLabel);
        this.isPRegenerating = ko.observable(false);
        this.isSRegenerating = ko.observable(false);
        this.changedItem = ko.observable();
        this.editName = ko.observable(model.name);
        this.isEdit = ko.observable(false);
    }

    public toggleEdit(): void {
        this.isEdit(!this.isEdit());
    }

    public togglePrimaryKey(): void {
        const isShown = this.showLabel === this.primaryKeyBtnLabel();
        this.primaryKey(isShown ? this.model.primaryKey : this.hiddenKey);
        this.primaryKeyBtnLabel(isShown ? this.hideLabel : this.showLabel);
    }

    public toggleSecondaryKey(): void {
        const isShown = this.showLabel === this.secondaryKeyBtnLabel();
        this.secondaryKey(isShown ? this.model.secondaryKey : this.hiddenKey);
        this.secondaryKeyBtnLabel(isShown ? this.hideLabel : this.showLabel);
    }
}