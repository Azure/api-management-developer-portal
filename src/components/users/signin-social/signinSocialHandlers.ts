import { IWidgetHandler, IWidgetOrder, WidgetContext } from "@paperbits/common/editing";
import { SigninSocialModel } from "./signinSocialModel";
import { IContextCommandSet, ViewManager } from "@paperbits/common/ui";
import { IVisibilityContextCommandProvider } from "@paperbits/core/security/visibilityContextCommandProvider";

export class SigninSocialHandlers implements IWidgetHandler<SigninSocialModel> {

    constructor(
        private readonly viewManager: ViewManager,
        private readonly visibilityCommandProvider: IVisibilityContextCommandProvider,
    ) {
    }

    public async getWidgetOrder(): Promise<IWidgetOrder<SigninSocialModel>> {
        return {
            name: "signinSocial",
            category: "User",
            displayName: "Sign-in button: OAuth",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => {
                const model = new SigninSocialModel();
                model.aadLabel = "Microsoft Entra ID";
                model.aadB2CLabel = "Azure Active Directory B2C";
                return model;
            }
        };
    }

    public getContextCommands(context: WidgetContext): IContextCommandSet {
        return {
            color: "#2b87da",
            selectCommands: [
                {
                    controlType: "toolbox-button",
                    displayName: "Edit sign-in button",
                    callback: () => this.viewManager.openWidgetEditor(context.binding)
                },
                {
                    controlType: "toolbox-splitter"
                },
                {
                    controlType: "toolbox-button",
                    tooltip: "Switch to parent",
                    iconClass: "paperbits-icon paperbits-enlarge-vertical",
                    callback: () => context.gridItem.getParent().select()
                },
                this.visibilityCommandProvider.create(context),
            ],
            deleteCommand: {
                controlType: "toolbox-button",
                tooltip: "Delete widget",
                callback: () => {
                    context.parentModel.widgets.remove(context.model);
                    context.parentBinding.applyChanges();
                    this.viewManager.clearContextualCommands();
                }
            }
        };
    }

    public async getWidgetModel(): Promise<SigninSocialModel> {
        const model = new SigninSocialModel();
        model.aadLabel = "Microsoft Entra ID";
        model.aadB2CLabel = "Azure Active Directory B2C";
        return model;
    }
}