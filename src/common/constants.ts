import { Theme, webLightTheme } from "@fluentui/react-components";

/**
 * Maximum number of items per page.
 */
export const defaultPageSize = 10;

/**
 * Customization of the Fluent UI Theme
 */
export const fuiTheme: Theme = {
    ...webLightTheme,
    fontFamilyBase: "inherit",
    fontFamilyMonospace: "inherit",
    fontFamilyNumeric: "inherit",
    fontSizeBase300: "inherit",
};

/**
 * Maximum number of characters to display in markdown
 */
export const markdownMaxCharsMap = {
    table: 120,
    cards: 250,
}