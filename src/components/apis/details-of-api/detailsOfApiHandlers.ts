import { IWidgetHandler } from "@paperbits/common/editing";
import { DetailsOfApiModel } from "./detailsOfApiModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";
import { StyleDefinition } from "@paperbits/common/styles";

export class DetailsOfApiHandlers implements IWidgetHandler {
    public async getWidgetModel(): Promise<DetailsOfApiModel> {
        return new DetailsOfApiModel();
    }
    public getStyleDefinitions(): StyleDefinition {
        return {
            colors: {
                badgeColor: {
                    displayName: "API type badge color",
                    defaults: {
                        value: "#636363"
                    }
                }
            },
            components: {
                apiDetails: {
                    displayName: "API details",
                    plugins: ["background", "typography", "margin", "padding"],
                    components: {
                        apiVersionsCombobox: DefaultStyleDefinitions.getComboboxStyleDefinition(),
                        apiDefinitionsCombobox: DefaultStyleDefinitions.getComboboxStyleDefinition(),
                        titleText: {
                            displayName: "Title",
                            plugins: ["typography"]
                        },
                        apiTypeBadge: DefaultStyleDefinitions.getApiTypeBadgeStyleDefinition(),
                        widgetText: DefaultStyleDefinitions.getWidgetTextStyleDefinition(),
                        detailsTitle: DefaultStyleDefinitions.getWidgetTitleStyleDefinition()
                    }
                }
            }
        };
    }
}