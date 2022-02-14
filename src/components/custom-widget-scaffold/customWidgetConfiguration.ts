export interface CustomWidgetConfiguration {
    name: string;
    displayName: string;
    uri: string | undefined;
    category: string;
    iconUrl?: string;
    customInputValue: string;
}
