import { Page } from "./models/page";
import { TagGroup } from "./models/tagGroup";
import { Api } from "../models/api";

export enum TLayout {
    "cards" = "cards",
    "table" = "table"
}
export type TApisData = Page<Api> | Page<TagGroup<Api>>;

export enum FiltersPosition {
    sidebar = "sidebar",
    popup = "popup",
    none = "none",
}