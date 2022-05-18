import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { DetailsOfApiModel } from "./detailsOfApiModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";
import { cloneDeep } from "lodash";


export class DetailsOfApiHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "apiDetails",
            category: "APIs",
            displayName: "API: Details",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new DetailsOfApiModel()
        };

        return widgetOrder;
    }
    public getStyleDefinitions(): StyleDefinition {
        return {

            colors: {
                badgeColor: {
                    displayName: "API type badge color",
                    defaults: {
                        value: "red"
                    }
                }
            },
            components: {
                apiDetails: {
                    displayName: "API details",
                    plugins: ["background", "typography", "margin", "padding"],
                    components: {
                        apiVersionsCombobox: cloneDeep(DefaultStyleDefinitions.Combobox),
                        apiDefinitionsCombobox: cloneDeep(DefaultStyleDefinitions.Combobox),
                        titleText: {
                            displayName: "Title",
                            plugins: ["typography"]
                        },
                        apiTypeBadge: {
                            displayName: "API Type Badge",
                            plugins: ["background", "typography", "border", "padding", "margin"],
                            defaults: {
                                typography: {
                                    colorKey: "colors/borderColor",
                                    fontWeight: "normal",
                                    fontSize: "10px",
                                    fontFamily: "Menlo,Monaco,Consolas,\"Courier New\",monospace"
                                },
                                border: {
                                    bottom: {
                                        width: "1",
                                        style: "solid",
                                        colorKey: "colors/borderColor"
                                    },
                                    top: {
                                        width: "1",
                                        style: "solid",
                                        colorKey: "colors/borderColor"
                                    },
                                    left: {
                                        width: "1",
                                        style: "solid",
                                        colorKey: "colors/borderColor"
                                    },
                                    right: {
                                        width: "1",
                                        style: "solid",
                                        colorKey: "colors/borderColor"
                                    }
                                },
                                padding: {
                                    top: 0,
                                    right: 2,
                                    bottm: 0,
                                    left: 2
                                },
                                margin: {
                                    top: 2,
                                    right: 2,
                                    bottm: 2,
                                    left: 2
                                },
                            }
                        }
                    }
                }
            }
        };
    }
}