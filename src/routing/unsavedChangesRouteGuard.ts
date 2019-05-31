import { IRouteGuard } from "@paperbits/common/routing";
import { OfflineObjectStorage } from "@paperbits/common/persistence";
import { IViewManager } from "@paperbits/common/ui";


export class UnsavedChangesRouteGuard implements IRouteGuard {
    constructor(
        private readonly offlineObjectStorage: OfflineObjectStorage,
        private readonly viewManager: IViewManager
    ) { }

    public canActivate(path: string, metadata?: object): Promise<boolean> {
        return new Promise<boolean>((resolve) => {
            if (this.offlineObjectStorage.hasUnsavedChanges()) {
                const toast = this.viewManager.addToast("Unsaved changes", `You have unsaved changes. Do you want to save or discard them?`, [
                    {
                        title: "Save",
                        iconClass: "paperbits-check-2",
                        action: async (): Promise<void> => {
                            this.offlineObjectStorage.saveChanges();
                            this.viewManager.removeToast(toast);
                            resolve(true);
                        }
                    },
                    {
                        title: "Discard",
                        iconClass: "paperbits-simple-remove",
                        action: async (): Promise<void> => {
                            this.offlineObjectStorage.discardChanges();
                            this.viewManager.removeToast(toast);
                            resolve(true);
                        }
                    }
                ]);
            }
            else {
                resolve(true);
            }
        });
    }
}