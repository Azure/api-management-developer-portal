import { IToolButton, IViewManager, IView } from "@paperbits/common/ui";

export class HelpWorkshopSection implements IToolButton {
    public iconClass: string = "paperbits-icon paperbits-question-2";
    public title: string = "Help";

    constructor(private readonly viewManager: IViewManager) { }

    public onActivate(): void {
        this.viewManager.clearJourney();

        const view: IView = {
            heading: this.title,
            component: { name: "help-workshop" }
        };

        this.viewManager.openViewAsWorkshop(view);
    }
}