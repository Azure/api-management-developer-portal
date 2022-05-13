import { IWidgetOrder, IWidgetHandler } from "@paperbits/common/editing";
import { StyleDefinition } from "@paperbits/common/styles";
import { OperationListModel } from "./operationListModel";

export class OperationListHandlers implements IWidgetHandler {
    public async getWidgetOrder(): Promise<IWidgetOrder> {
        const widgetOrder: IWidgetOrder = {
            name: "operationList",
            category: "Operations",
            displayName: "List of operations",
            iconClass: "widget-icon widget-icon-api-management",
            requires: ["html"],
            createModel: async () => new OperationListModel()
        };

        return widgetOrder;
    }

    public getStyleDefinitions(): StyleDefinition {
        return {
            components: {
                operationList: {
                    displayName: "Operation List",
                    plugins: ["background", "typography"],
                    defaults: {
                        typography: {
                            colorKey: "colors/default"
                        }
                    },
                    components: {
                        searchInput: {
                            displayName: "Search input",
                            plugins: ["typography", "border", "states"],
                            defaults: {
                                allowedStates: [
                                    "focus"
                                ],
                                typography: {
                                    fontSize: "1rem",
                                    colorKey: "colors/default",
                                    lineHeight: "1.5"
                                },
                                border: {
                                    bottom: {
                                        width: "1px",
                                        style: "solid",
                                        colorKey: "colors/default"
                                    }
                                },
                                states: {
                                    focus: {
                                        typography: {
                                            fontSize: "1rem",
                                            colorKey: "colors/default",
                                            lineHeight: "1.5"
                                        },
                                        border: {
                                            bottom: {
                                                width: "1",
                                                style: "solid",
                                                colorKey: "colors/default"
                                            }
                                        }
                                    }
                                }
                            }
                        },
                        tagInput: {
                            displayName: "tag input",
                            plugins: ["background", "border", "typography"],
                            defaults: {
                                border: {
                                    bottom: {
                                        width: 1,
                                        style: "solid",
                                        colorKey: "colors/tagButtonColor"
                                    },
                                    top: {
                                        width: 1,
                                        style: "solid",
                                        colorKey: "colors/tagButtonColor"
                                    },
                                    right: {
                                        width: 1,
                                        style: "solid",
                                        colorKey: "colors/tagButtonColor"
                                    },
                                    left: {
                                        width: 1,
                                        style: "solid",
                                        colorKey: "colors/tagButtonColor"
                                    }
                                },

                                typography: {
                                    colorKey: "colors/tagButtonColor",
                                    textDecoration: "none"
                                },
                                padding: {
                                    top: 2,
                                    right: 7,
                                    bottom: 2,
                                    left: 7
                                },
                                margin: {
                                    top: 2,
                                    right: 2,
                                    bottom: 2,
                                    left: 2
                                },
                                size: {
                                    minHeight: "2em"
                                },
                                container: {
                                    alignItems: "center"
                                }
                            }
                        },
                        toggleButtonLabel: {
                            displayName: "Label",
                            plugins: ["typography"],
                            defaults: {
                                typography: {
                                    colorKey: "colors/default"
                                }
                            }
                        },
                        widgetText: {
                            displayName: "Text",
                            plugins: ["typography"],
                            defaults: {
                                typography: {
                                    colorKey: "colors/default",
                                    fontStyle: "normal",
                                    fontWeight: "normal"
                                }
                            }
                        },
                        tagCard: {
                            displayName: "Tag Card",
                            plugins: ["background", "typography", "padding", "margin", "border"],
                            defaults: {
                                typography: {
                                    colorKey: "colors/tagButtonColor",
                                },
                                border: {
                                    bottom: {
                                        width: "1",
                                        style: "solid",
                                        colorKey: "colors/tagButtonColor"
                                    },
                                    top: {
                                        width: "1",
                                        style: "solid",
                                        colorKey: "colors/tagButtonColor"
                                    },
                                    left: {
                                        width: "1",
                                        style: "solid",
                                        colorKey: "colors/tagButtonColor"
                                    },
                                    right: {
                                        width: "1",
                                        style: "solid",
                                        colorKey: "colors/tagButtonColor"
                                    }
                                },
                                margin: {
                                    top: 2,
                                    right: 2,
                                    bottom: 2,
                                    left: 2
                                },
                                padding: {
                                    top: 2,
                                    right: 7,
                                    bottom: 2,
                                    left: 7
                                },
                                size: {
                                    minHeight: "2em"
                                }
                            }
                        },
                        dropdownInput: {
                            displayName: "Input",
                            plugins: ["background", "typography", "border", "margin", "padding"],
                            defaults: {
                                background: {
                                    colorKey: "colors/defaultBg"
                                },
                                typography: {
                                    fontSize: "1rem",
                                    lineHeight: "1.5",
                                    colorKey: "colors/displayTextColor"
                                },
                                padding: {
                                    top: "7px",
                                    right: "10px",
                                    bottom: "5px",
                                    left: "10px"
                                },
                                margin: {
                                    top: 0,
                                    right: 0,
                                    bottom: 0,
                                    left: 0
                                },
                                border: {
                                    top: {
                                        width: 1,
                                        style: "solid",
                                        colorKey: "colors/default"
                                    },
                                    right: {
                                        width: 0
                                    },
                                    bottom: {
                                        width: 1,
                                        style: "solid",
                                        colorKey: "colors/default"
                                    },
                                    left: {
                                        width: 1,
                                        style: "solid",
                                        colorKey: "colors/default"
                                    }
                                }
                            }
                        },
                        dropdownInputButton: {
                            displayName: "Input Button",
                            plugins: ["background", "typography", "border", "margin", "padding"],
                            defaults: {
                                background: {
                                    colorKey: "colors/defaultBg"
                                },
                                typography: {
                                    colorKey: "colors/default"
                                },
                                padding: {
                                    top: "7px",
                                    right: "10px",
                                    bottom: "5px",
                                    left: "10px"
                                },
                                border: {
                                    top: {
                                        width: 1,
                                        style: "solid",
                                        colorKey: "colors/default"
                                    },
                                    right: {
                                        width: 1,
                                        style: "solid",
                                        colorKey: "colors/default"
                                    },
                                    bottom: {
                                        width: 1,
                                        style: "solid",
                                        colorKey: "colors/default"
                                    },
                                    left: {
                                        width: 1,
                                        style: "solid",
                                        colorKey: "colors/default"
                                    }
                                },
                                margin: {
                                    top: 0,
                                    right: 0,
                                    bottom: 0,
                                    left: 0
                                },
                                dispaly: "block"
                            }
                        },
                        dropdownContainer: {
                            displayName: "Dropdown",
                            plugins: ["background", "typography"],
                            defaults: {
                                background: {
                                    colorKey: "colors/defaultBg"
                                }
                            }
                        },
                    }

                }
            }
        };
    }
}