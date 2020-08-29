
import { RouteGuard, Route } from "@paperbits/common/routing";
import { ViewManager } from "@paperbits/common/ui/viewManager";
import { Toast } from "@paperbits/common/ui";

export class OldContentRouteGuard implements RouteGuard {
    private toast: Toast;

    constructor(private readonly viewManager: ViewManager) { }

    public async canActivate(route: Route): Promise<boolean> {
        if (sessionStorage.getItem("OldContent") || this.toast) {
            return true;
        }

        const main = window.document.getElementsByTagName("iframe");
        if (main.length > 0) {
            const iframe = main[0];
            const deprecatedNavItems = iframe.contentDocument.body.getElementsByTagName("navbar");
            if (deprecatedNavItems.length > 0) {
                this.toast = this.viewManager.addToast("Deprecated content detected", `Your developer portal's content is based off the pre-production version of default content. <a href="https://aka.ms/apimdocs/portal#preview-to-ga" target="_blank">Learn about the problems it may cause and how to switch to the production version of content</a>.`);
                setTimeout(() => {
                    this.viewManager.removeToast(this.toast);
                    sessionStorage.setItem("OldContent", "showed");
                }, 15000);
            }
        }
        
        return true;
    }
}