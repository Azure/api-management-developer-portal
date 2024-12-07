import * as React from "react";
import { ChevronDown16Regular, ChevronUp16Regular } from "@fluentui/react-icons";
import { Api } from "../models/api";
import { Page } from "../models/page";
import { TagGroup } from "../models/tagGroup";

export type TApisData = Page<Api> | Page<TagGroup<Api>>;

export const isApisGrouped = (apis?: TApisData): apis is Page<TagGroup<Api>> =>
    apis?.value[0] && "tag" in apis.value[0];

export const toggleValueInSet = <T = any>(set: Set<T>, value: T): Set<T> => {
    const newSet = new Set(set);
    if (set.has(value)) {
        newSet.delete(value);
    } else {
        newSet.add(value);
    }
    return newSet;
};

export const TagGroupToggleBtn = ({ expanded }: { expanded: boolean }) =>
    expanded ? <ChevronUp16Regular /> : <ChevronDown16Regular />;
