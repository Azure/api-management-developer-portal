import { IToolButton } from "@paperbits/common/ui";
import { IEventManager } from "@paperbits/common/events";

export class SaveChangesToolButton implements IToolButton {
    public iconClass: string = "paperbits-icon paperbits-floppy-disk";
    public title: string = "Save changes";

    constructor(private readonly eventManager: IEventManager) { }

    public onActivate(): void {
        this.eventManager.dispatchEvent("onSaveChanges");
    }
}