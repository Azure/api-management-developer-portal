import { useEffect, useState } from "react";
import * as Constants from "../constants";
import { TagService } from "../data/tagService";
import { TFilterGroup } from "./TableFilters";
import { Page } from "../models/page";
import { Tag } from "../models/tag";

const loadTags = async (tagService: TagService, pageNumber?: number) => {
    const skip = (pageNumber - 1) * Constants.defaultPageSize;
    const take = Constants.defaultPageSize;

    return await tagService.getTags("apis", undefined, { skip, take });
};

export const useTableFiltersTags = (tagService: TagService): TFilterGroup => {
    const [tags, setTags] = useState<Omit<Page<Tag>, "getSkip">>();
    const [pageNumber, setPageNumber] = useState(1);
    const [working, setWorking] = useState(false);

    useEffect(() => {
        setWorking(true);
        loadTags(tagService, pageNumber)
            .then((next) => next && setTags((old) => ({
                    ...next,
                    value: [...(old?.value ?? []), ...next.value],
                })))
            .finally(() => setWorking(false));
    }, [tagService, pageNumber]);

    return {
        value: "tags",
        label: "Tags",
        items: tags?.value?.map((tag) => ({ value: tag.id, label: tag.name })) ?? [],
        nextPage: tags?.nextLink
            ? () => setPageNumber((old) => old + 1)
            : undefined,
        working,
    };
};
