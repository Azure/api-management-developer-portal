import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { SigninSocialModel } from "./signinSocialModel";


export class SigninSocialHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "signinSocial",
            category: "User",
            displayName: "Sign-in button: OAuth",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => {
                const model = new SigninSocialModel();
                model.aadLabel = "Azure Active Directory";
                model.aadB2CLabel = "Azure Active Directory B2C";
                return model;
            }
        };

        return widgetOrder;
    }
}