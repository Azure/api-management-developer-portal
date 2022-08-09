import { ComponentStyleDefinition } from "@paperbits/common/styles";

export function getSearchInputStyleDefinition(): ComponentStyleDefinition {
    return {
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
                    width: 1,
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
                            width: 1,
                            style: "solid",
                            colorKey: "colors/default"
                        }
                    }
                }
            }
        }
    };
}

export function getDropdownInputStyleDefinition(): ComponentStyleDefinition {
    return {
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
    };
}

export function getDropdownInputButtonStyleDefinition(): ComponentStyleDefinition {
    return {
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
    };
}

export function getDropdownContainerStyleDefinition(): ComponentStyleDefinition {
    return {
        displayName: "Dropdown",
        plugins: ["background", "typography"],
        defaults: {
            background: {
                colorKey: "colors/defaultBg"
            }
        }
    };
}

export function getCardStyleDefinition(): ComponentStyleDefinition {
    return {
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
    };
}

export function getCardTitleStyleDefinition(): ComponentStyleDefinition {
    return {
        displayName: "Card Title",
        plugins: ["typography"],
    };
}

export function getCardTextStyleDefinition(): ComponentStyleDefinition {
    return {
        displayName: "Card Text",
        plugins: ["typography"],
    };
}

export function getWidgetTextStyleDefinition(): ComponentStyleDefinition {
    return {
        displayName: "Text",
        plugins: ["typography"]
    };
}

export function getConsoleWidgetTextStyleDefinition(): ComponentStyleDefinition {
    return {
        displayName: "Text",
        plugins: ["typography"],
        defaults: {
            typography: {
                colorKey: "colors/default"
            }
        }
    };
}

export function getWidgetTitleStyleDefinition(): ComponentStyleDefinition {
    return {
        displayName: "Title",
        plugins: ["typography"]
    };
}

export function getTagInputStyleDefinition(): ComponentStyleDefinition {
    return {
        displayName: "Tag Input",
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
    };
}

export function getToggleButtonLabelStyleDefinition(): ComponentStyleDefinition {
    return {
        displayName: "Label",
        plugins: ["typography"],
        defaults: {
            typography: {
                colorKey: "colors/default"
            }
        }
    };
}

export function getTableRowStyleDefinition(): ComponentStyleDefinition {
    return {
        displayName: "Table Row",
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
    };
}

export function getTableHeadStyleDefinition(): ComponentStyleDefinition {
    return {
        displayName: "Table Head",
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
    };
}

export function getTagCardStyleDefinition(): ComponentStyleDefinition {
    return {
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
    };
}

export function getInputStyleDefinition(): ComponentStyleDefinition {
    return {
        displayName: "Input",
        plugins: ["typography", "background", "border"],
        defaults: {
            typography: {
                colorKey: "colors/default",
                fontStyle: "normal",
                fontWeight: "normal",
                fontSize: "1rem"
            },
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
            padding: {
                top: 7,
                left: 10,
                right: 10,
                bottom: 5
            },
            margin: {
                top: 5,
                right: 10,
                bottom: 20
            },
            size: {
                width: "100%"
            }
        }
    };
}

export function getComboboxStyleDefinition(): ComponentStyleDefinition {
    return {
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
    };
}

export function getApiTypeBadgeStyleDefinition(): ComponentStyleDefinition {
    return {
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
            }
        }
    };
}

export function getAlertStyleDefinition(): ComponentStyleDefinition {
    return {
        displayName: "Displayed Alert",
        plugins: ["background", "typography", "margin", "padding", "border"],
        defaults: {
            typography: {
                colorKey: "colors/validationTextColor"
            },
            background: {
                colorKey: "colors/validationBackgroundColor"
            },
            border: {
                bottom: {
                    width: 1,
                    style: "solid",
                    colorKey: "colors/validationBorderColor"
                },
                left: {
                    width: 1,
                    style: "solid",
                    colorKey: "colors/validationBorderColor"
                },
                top: {
                    width: 1,
                    style: "solid",
                    colorKey: "colors/validationBorderColor"
                },
                right: {
                    width: 1,
                    style: "solid",
                    colorKey: "colors/validationBorderColor"
                }
            }
        }
    };
}

export function getButtonStyleDefinition(): ComponentStyleDefinition {
    return {
        displayName: "Button",
        plugins: ["background", "typography", "states", "shadow", "size", "margin", "border", "padding"],
        defaults: {
            allowedStates: [
                "hover",
                "focus",
                "active",
                "disabled"
            ],
        }
    }
}

export function getTermsOfUseCheckboxDefinition(): ComponentStyleDefinition {
    return {
        displayName: "Terms Of Use Checkbox",
        plugins: ["typography"]
    };
}

export function getTermsOfUseTextAreaDefinition(): ComponentStyleDefinition {
    return {
        displayName: "Terms Of Use",
        plugins: ["backround", "typography", "size", "border"]
    };
}

export function getDefaultButtonStyleDefinition(): ComponentStyleDefinition {
    return {
        displayName: "Button",
        plugins: ["background", "typography", "states", "shadow", "size", "margin", "border", "padding"],
        defaults: {
            allowedStates: [
                "active",
                "disabled"
            ],
            background: {
                colorKey: "colors/defaultBg"
            },
            border: {
                bottom: {
                    width: "1",
                    style: "solid",
                    colorKey: "colors/default"
                },
                top: {
                    width: "1",
                    style: "solid",
                    colorKey: "colors/default"
                },
                left: {
                    width: "1",
                    style: "solid",
                    colorKey: "colors/default"
                },
                right: {
                    width: "1",
                    style: "solid",
                    colorKey: "colors/default"
                }
            },
            states: {
                disabled: {
                    background: {
                        colorKey: "colors/HUebs"
                    }
                }
            }
        }
    };
}

export function getTableRowCellStyleDefinition(): ComponentStyleDefinition {
    return {
        displayName: "Table Row Cell",
        plugins: ["background", "typography", "border"],
        defaults: {
            typography: {
                fontWeight: "normal",
                colorKey: "colors/default"
            }
        }
    };
}

export function getTableHeadCellStyleDefinition(): ComponentStyleDefinition {
    return {
        displayName: "Table Head Cell",
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
            }
        }
    };
}

export function getConsoleInputStyleDefinition(): ComponentStyleDefinition {
    return {
        displayName: "Input",
        plugins: ["typography", "background", "border"],
        defaults: {
            typography: {
                colorKey: "colors/borderColor",
                fontStyle: "normal",
                fontWeight: "normal",
                fontSize: "1rem"
            },
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
            padding: {
                right: 10,
                bottom: 5
            }
        }
    };
}

export function getIconButtonStyleDefinition(): ComponentStyleDefinition {
    return {
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
            }
        }
    }
}