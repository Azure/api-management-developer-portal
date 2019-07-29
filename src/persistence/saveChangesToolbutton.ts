import * as ko from "knockout";
import { IToolButton } from "@paperbits/common/ui";
import { IEventManager } from "@paperbits/common/events";
import { OfflineObjectStorage } from "@paperbits/common/persistence";

export class SaveChangesToolButton implements IToolButton {
    public iconClass: string = "paperbits-icon paperbits-floppy-disk";
    public title: string = "Save changes";
    public disabled: ko.Observable<boolean>;

    constructor(
        private readonly eventManager: IEventManager,
        private readonly offlineObjectStorage: OfflineObjectStorage
    ) {
        this.disabled = ko.observable(true);
        this.eventManager.addEventListener("onDataChange", this.onDataChange.bind(this));
    }

    private onDataChange(): void {
        this.disabled(!this.offlineObjectStorage.hasUnsavedChanges());
    }

    public onActivate(): void {
        this.eventManager.dispatchEvent("onSaveChanges");
    }
}