import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { OperationDetailsModel } from "./operationDetailsModel";
import * as DefaultStyleDefinitions from "../../defaultStyleDefinitions";

export class OperationDetailsHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "operationDetails",
            category: "Operations",
            displayName: "Operation: Details",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new OperationDetailsModel()
        };

        return widgetOrder;
    }

    public getStyleDefinitions(): StyleDefinition {
        return {
            colors: {
                tryItColor: {
                    displayName: "Try it button background",
                    defaults: {
                        value: "green"
                    }
                },
                borderColor: {
                    displayName: "Input border color",
                    defaults: {
                        value: "#505050"
                    }
                },
                consoleBackground: {
                    displayName: "Test Console Background",
                    defaults: {
                        value: "#fafafa"
                    }
                },
                consoleHighlightBackground: {
                    displayName: "Test Console Highlight Background",
                    defaults: {
                        value: "#f2f2f2"
                    }
                },
                mutedTextColor: {
                    displayName: "Muted Text Color",
                    defaults: {
                        value: "#d1c8b2"
                    }
                },
                tagButtonColor: {
                    displayName: "Tag button color",
                    defaults: {
                        value: "#555"
                    }
                },
                codeSnippetHoverColor: {
                    displayName: "Code Snippet Hover Color",
                    defaults: {
                        value: "#ccc"
                    }
                },
            },
            components: {
                operationDetails: {
                    displayName: "Operation Details",
                    plugins: ["margin", "padding", "background"],
                    components: {
                        tryItButton: {
                            displayName: "Try it button",
                            plugins: ["margin", "padding", "typography", "size", "background", "states"],
                            defaults: {
                                allowedStates: [
                                    "hover",
                                    "focus",
                                    "active",
                                    "disabled"
                                ],
                                typography: {
                                    fontStyle: "normal",
                                    fontWeight: 700,
                                    fontSize: ".8em",
                                    colorKey: "colors/defaultBg"
                                },
                                background: {
                                    colorKey: "colors/tryItColor"
                                },
                                size: {
                                    height: "30px",
                                    width: "60px"
                                },
                                border: {
                                    left: { width: 0 },
                                    right: { width: 0 },
                                    top: { width: 0 },
                                    bottom: { width: 0 }
                                },
                                padding: {
                                    left: 6,
                                    right: 6,
                                    top: 1,
                                    bottom: 1
                                },
                                states: {
                                    hover: {
                                        background: {
                                            colorKey: "colors/defaultBg"
                                        },
                                        typography: {
                                            colorKey: "colors/tryItColor",
                                        }
                                    }
                                }
                            }
                        },
                        titleText: DefaultStyleDefinitions.getWidgetTextStyleDefinition(),
                        widgetText: DefaultStyleDefinitions.getWidgetTextStyleDefinition(),
                        tagCard: DefaultStyleDefinitions.getTagCardStyleDefinition(),
                        tablePresetHead: DefaultStyleDefinitions.getTableHeadCellStyleDefinition(),
                        tablePresetRow: DefaultStyleDefinitions.getTableRowCellStyleDefinition(),
                        codeSnippetCommand: {
                            displayName: "Button",
                            plugins: ["typography", "states", "border", "background"],
                            defaults: {
                                allowedStates: [
                                    "hover",
                                    "focus",
                                    "active",
                                    "disabled"
                                ],
                                typography: {
                                    colorKey: "colors/default"
                                },
                                border: {
                                    bottom: {
                                        width: 0
                                    },
                                    left: {
                                        width: 1,
                                        style: "solid",
                                        colorKey: "colors/HUebs"
                                    },
                                    top: {
                                        width: 0
                                    },
                                    right: {
                                        width: 0
                                    }
                                }
                            }
                        },

                        sendButton: DefaultStyleDefinitions.getButtonStyleDefinition(),
                        connectButton: DefaultStyleDefinitions.getButtonStyleDefinition(),
                        iconButton: DefaultStyleDefinitions.getIconButtonStyleDefinition(),
                        collapseButton: DefaultStyleDefinitions.getIconButtonStyleDefinition(),
                        closeButton: DefaultStyleDefinitions.getIconButtonStyleDefinition(),
                        refreshButton: DefaultStyleDefinitions.getIconButtonStyleDefinition(),
                        consoleCodeSnippetCommand: {
                            displayName: "Button",
                            plugins: ["typography", "states", "border", "background"],
                            defaults: {
                                allowedStates: [
                                    "hover",
                                    "focus",
                                    "active",
                                    "disabled"
                                ],
                                typography: {
                                    colorKey: "colors/default"
                                },
                                border: {
                                    bottom: {
                                        width: 0
                                    },
                                    left: {
                                        width: 0
                                    },
                                    top: {
                                        width: 0
                                    },
                                    right: {
                                        width: 0
                                    }
                                },
                                states: {
                                    hover: {
                                        background: {
                                            colorKey: "colors/codeSnippetHoverColor"
                                        }
                                    }
                                }
                            }
                        },
                        uploadButton: DefaultStyleDefinitions.getIconButtonStyleDefinition(),
                        addButton: DefaultStyleDefinitions.getIconButtonStyleDefinition(),
                        revealButton: {
                            displayName: "Button",
                            plugins: ["typography", "states", "border", "background"],
                            defaults: {
                                allowedStates: [
                                    "hover",
                                    "focus",
                                    "active",
                                    "disabled"
                                ],
                                border: {
                                    bottom: {
                                        width: "1px",
                                        style: "solid",
                                        colorKey: "colors/borderColor"
                                    },
                                    top: {
                                        width: "1px",
                                        style: "solid",
                                        colorKey: "colors/borderColor"
                                    },
                                    left: {
                                        width: "1px",
                                        style: "solid",
                                        colorKey: "colors/borderColor"
                                    },
                                    right: {
                                        width: "1px",
                                        style: "solid",
                                        colorKey: "colors/borderColor"
                                    },

                                },
                            }
                        },
                        consoleText: DefaultStyleDefinitions.getConsoleWidgetTextStyleDefinition(),
                        consoleTitle: DefaultStyleDefinitions.getWidgetTitleStyleDefinition(),
                        input: DefaultStyleDefinitions.getConsoleInputStyleDefinition(),
                        combobox: DefaultStyleDefinitions.getComboboxStyleDefinition(),
                        operationConsole: {
                            displayName: "Test Console",
                            plugins: ["background"],
                            defaults: {
                                background: {
                                    colorKey: "colors/consoleBackground"
                                }
                            }
                        },
                        panelHighlight: {
                            displayName: "Console Panel HighLight",
                            plugins: ["background"],
                            defaults: {
                                background: {
                                    colorKey: "colors/consoleHighlightBackground"
                                }
                            }
                        },
                        textMuted: {
                            displayName: "Muted Text",
                            plugins: ["typography"],
                            defaults: {
                                typography: {
                                    colorKey: "colors/mutedTextColor"
                                }
                            }
                        }
                    }
                }
            }
        };
    }
}