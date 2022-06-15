import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { ProfileModel } from "./profileModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";

export class ProfileHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "profile",
            category: "User",
            displayName: "User: Profile",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new ProfileModel()
        };

        return widgetOrder;
    }

    public getStyleDefinitions(): StyleDefinition {
        return {
            components: {
                profile: {
                    displayName: "User Profile",
                    plugins: ["background", "typography", "margin", "padding"],
                    defaults: {
                        typography: {
                            colorKey: "colors/default",
                        }
                    },
                    components: {
                        defaultButton: DefaultStyleDefinitions.getDefaultButtonStyleDefinition(),
                        input: DefaultStyleDefinitions.getInputStyleDefinition()
                    }
                }
            }
        };
    }
}