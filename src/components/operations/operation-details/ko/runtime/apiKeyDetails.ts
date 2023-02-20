export enum ApiKeyLocation {
    Query = "query",
    Header = "header"
}

export interface ApiKeyDetails {
    in: string;
    name: string;
}