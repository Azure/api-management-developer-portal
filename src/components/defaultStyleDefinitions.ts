import { ComponentStyleDefinition } from "@paperbits/common/styles"

export const SearchInput: ComponentStyleDefinition = {
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
                colorKey: "colors/borderColor"
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
}

export const DropdownInput: ComponentStyleDefinition = {
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
}

export const DropdownInputButton: ComponentStyleDefinition = {
    displayName: "Input",
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
}

export const DropdownContainer: ComponentStyleDefinition = {
    displayName: "Dropdown",
    plugins: ["background", "typography"],
    defaults: {
        background: {
            colorKey: "colors/defaultBg"
        }
    }
}

export const Card: ComponentStyleDefinition = {
    displayName: "Card",
    plugins: ["background", "shadow", "border", "margin", "padding"],
    defaults: {
        margin: {
            left: 0,
            right: 0,
            top: 30,
            bottom: 30
        },
        padding: {
            top: 50,
            right: 30,
            bottom: 50,
            left: 30

        },
        border: {
            left: 0,
            right: 0,
            top: 0,
            bottom: 0
        },
        shadow: {
            shadowKey: "shadows/shadow1"
        }
    }
}

export const CardTitle: ComponentStyleDefinition = {
    displayName: "Card Title",
    plugins: ["typography"],
}

export const CardText: ComponentStyleDefinition = {
    displayName: "Card Text",
    plugins: ["typography"],
}

export const WidgetText: ComponentStyleDefinition = {
    displayName: "Text",
    plugins: ["typography"],
    defaults: {
        typography: {
            colorKey: "colors/default",
            fontStyle: "normal",
            fontWeight: "normal"
        }
    }
}

export const TagInput: ComponentStyleDefinition = {
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
}

export const ToggleButtonLabel: ComponentStyleDefinition = {
    displayName: "Label",
    plugins: ["typography"],
    defaults: {
        typography: {
            colorKey: "colors/default"
        }
    }
}

export const GridRow: ComponentStyleDefinition = {
    displayName: "Grid Row",
    plugins: ["background", "typography", "border"],
    defaults: {
        border: {
            top: {
                width: "1",
                style: "solid",
                colorKey: "colors/gridBorderColor"
            }
        },
        typography: {
            fontWeight: "normal",
            colorKey: "colors/default"
        },
        display: "flex",
        padding: {
            top: ".75rem",
            bottom: ".75rem"

        }
    }
}

export const GridHeader: ComponentStyleDefinition = {
    displayName: "Grid Header",
    plugins: ["background", "typography", "border"],
    defaults: {
        border: {
            bottom: {
                width: "1",
                style: "solid",
                colorKey: "colors/gridBorderColor"
            }
        },
        typography: {
            fontWeight: "bold",
            colorKey: "colors/default"
        },
        display: "flex",
        padding: {
            top: ".75rem",
            bottom: ".75rem"
        }
    }
}

export const TagCard: ComponentStyleDefinition = {
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
}

export const Combobox: ComponentStyleDefinition = {
    displayName: "Combobox",
    plugins: ["background", "typography", "border"],
    defaults: {
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
        margin: {
            top: 5,
            right: 10,
            bottom: 20
        },
        padding: {
            top: 7,
            left: 10,
            right: 10,
            bottom: 5
        },
        typography: {
            fontSize: "1rem",
            colorKey: "colors/borderColor"
        }
    }
}

export const ApiTypeBadge: ComponentStyleDefinition = {
    displayName: "API Type Badge",
    plugins: ["background", "typography", "border", "padding", "margin"],
    defaults: {
        typography: {
            colorKey: "colors/badgeColor",
            fontWeight: "normal",
            fontSize: "10px",
            fontFamily: "Menlo,Monaco,Consolas,\"Courier New\",monospace"
        },
        border: {
            bottom: {
                width: "1",
                style: "solid",
                colorKey: "colors/badgeColor"
            },
            top: {
                width: "1",
                style: "solid",
                colorKey: "colors/badgeColor"
            },
            left: {
                width: "1",
                style: "solid",
                colorKey: "colors/badgeColor"
            },
            right: {
                width: "1",
                style: "solid",
                colorKey: "colors/badgeColor"
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