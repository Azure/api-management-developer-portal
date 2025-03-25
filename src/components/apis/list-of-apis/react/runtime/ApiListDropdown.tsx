import * as React from "react";
import { useEffect, useState } from "react";
import {
    Badge,
    Combobox,
    Option,
    OptionGroup,
    Spinner,
} from "@fluentui/react-components";
import { GroupByTag } from "../../../../utils/react/TableListInfo";
import * as Constants from "../../../../../constants";
import { Api } from "../../../../../models/api";
import { Tag } from "../../../../../models/tag";
import { TagGroup } from "../../../../../models/tagGroup";
import { Page } from "../../../../../models/page";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { TApiListRuntimeFCProps } from "./ApiListRuntime";
import { TagGroupToggleBtn, toggleValueInSet } from "./utils";

type TApiListDropdown = Omit<
    TApiListRuntimeFCProps,
    "tagService" | "layoutDefault" | "productName"
>;

const TagLabel = ({
    tag,
    expanded,
    onClick,
}: {
    tag: string;
    expanded: Set<string>;
    onClick(): void;
}) => (
    <button onClick={onClick} className={"no-border"}>
        <TagGroupToggleBtn expanded={expanded.has(tag)} />
        <span style={{ marginLeft: ".575rem" }}>{tag}</span>
    </button>
);

const ApiTypeBadge = ({ api }: { api: Api }) =>
    !!api.typeName &&
    api.typeName !== "REST" && (
        <Badge appearance="outline" size="small">{api.typeName}</Badge>
    );

const ApiVersionBadge = ({ api }: { api: Api }) =>
    !!api.apiVersion && (
        <Badge appearance="tint" shape="rounded" color="informative" title={"API version"}>{api.apiVersion}</Badge>
    );

const Options = ({
    apis,
    getReferenceUrl,
}: {
    apis: Api[];
    getReferenceUrl: TApiListRuntimeFCProps["getReferenceUrl"];
}) => (
    <>
        {apis.map((api) => (
            <Option key={api.id} value={api.name} text={api.displayName}>
                <a href={getReferenceUrl(api.name)} className="dropdown-link">{api.displayName}</a>{" "}
                <ApiTypeBadge api={api} /> <ApiVersionBadge api={api} />
            </Option>
        ))}
    </>
);

export const ApiListDropdown = ({
    apiService,
    getReferenceUrl,
    selectedApi,
    defaultGroupByTagToEnabled
}: TApiListDropdown & { selectedApi?: Api }) => {
    const [expanded, setExpanded] = React.useState(new Set<string>());
    const [working, setWorking] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasNextPage, setHasNextPage] = useState<boolean>(false);
    const [apis, setApis] = useState<Api[]>([]);
    const [apisByTag, setApisByTag] = useState<TagGroup<Api>[]>([]);
    const [pattern, setPattern] = useState<string>();
    const [groupByTag, setGroupByTag] = useState(!!defaultGroupByTagToEnabled);
    const [filters, setFilters] = useState<{ tags: Tag[] }>({ tags: [] });

    const toggleTag = (tag: string) =>
        setExpanded((old) => toggleValueInSet(old, tag));

    useEffect(() => {
        const query: SearchQuery = {
            pattern,
            tags: filters.tags,
            skip: (pageNumber - 1) * Constants.defaultPageSize,
            take: Constants.defaultPageSize
        };

        setWorking(true);
        if (groupByTag) {
            loadApisByTag(query)
                .then(loadedApis => {
                    if (pageNumber > 1) {
                        // Check if the tag is already displayed. If yes, add to this tag
                        loadedApis.value.forEach(newApi => {
                            const existingTagIndex = apisByTag.findIndex(item => item.tag === newApi.tag);
                            if (existingTagIndex !== -1) {
                                apisByTag[existingTagIndex].items.push(...newApi.items);
                            } else {
                                apisByTag.push(newApi);
                            }
                        });
                        setApisByTag(apisByTag);
                    } else {
                        setApisByTag([...loadedApis.value]);
                    }
                    setHasNextPage(!!loadedApis.nextLink);
                })
                .finally(() => setWorking(false));
        } else {
            loadApis(query)
                .then(loadedApis => {
                    if (pageNumber > 1) {
                        setApis([...apis, ...loadedApis.value]);
                    } else {
                        setApis([...loadedApis.value]);
                    }
                    setHasNextPage(!!loadedApis.nextLink);
                })
                .finally(() => setWorking(false));
        }
    }, [apiService, pageNumber, groupByTag, filters, pattern]);

    const loadApis = async (query: SearchQuery) => {
        let apis: Page<Api>;
    
        try {
            apis = await apiService.getApis(query);
        } catch (error) {
            throw new Error(`Unable to load APIs. Error: ${error.message}`);
        }
    
        return apis;
    }

    const loadApisByTag = async (query: SearchQuery) => {
        let apis: Page<TagGroup<Api>>;
    
        try {
            apis = await apiService.getApisByTags(query);
        } catch (error) {
            throw new Error(`Unable to load APIs. Error: ${error.message}`);
        }
    
        return apis;
    }

    const content = !apis || !selectedApi ? (
        <>Loading APIs</> // if data are not loaded yet ComboBox sometimes fails to initialize properly - edge case, in most cases almost instant from the cache
    ) : (
        <Combobox
            style={{ width: "100%", minWidth: 0 }}
            placeholder={"Select API"}
            onInput={(event) => setPattern(event.target?.["value"])}
            defaultValue={selectedApi?.displayName}
            defaultSelectedOptions={[selectedApi?.name]}
            onOptionSelect={(_, { optionValue }) => {
                if (!optionValue) return;
                window.location.hash = getReferenceUrl(optionValue);
            }}
        >
            {working ? (
                <Spinner
                    label={"Loading APIs"}
                    labelPosition={"above"}
                    size={"small"}
                    style={{ padding: "1rem" }}
                />
            ) : (
                <>
                    <Option
                        disabled
                        value={"group by tag switch"}
                        text={"group by tag switch"}
                        style={{ columnGap: 0 }}
                        className="group-by-tag-switch"
                    >
                        <GroupByTag
                            groupByTag={groupByTag}
                            setGroupByTag={setGroupByTag}
                            setPageNumber={setPageNumber}
                            labelAfter
                        />
                    </Option>

                    {groupByTag ? (
                        apisByTag?.map(({ tag, items }) => (
                            <OptionGroup
                                key={tag}
                                label={
                                    <TagLabel
                                        onClick={() => toggleTag(tag)}
                                        tag={tag}
                                        expanded={expanded}
                                    />
                                }
                            >
                                {expanded.has(tag) && (
                                    <Options
                                        apis={items}
                                        getReferenceUrl={getReferenceUrl}
                                    />
                                )}
                            </OptionGroup>
                        ))
                    ) : (
                        <Options
                            apis={apis}
                            getReferenceUrl={getReferenceUrl}
                        />
                    )}

                    {hasNextPage && (
                        <Option
                            disabled
                            value={"pagination"}
                            text={"pagination"}
                            checkIcon={<></>}
                            style={{ columnGap: 0 }}
                        >
                            <button className={"button button-default show-more-options"} onClick={() => setPageNumber(prev => prev + 1)}>Show more</button>
                        </Option>
                    )}
                </>
            )}
        </Combobox>
    );

    return (
        <>
            <span className="strong">API</span>
            <div style={{ padding: ".25rem 0 1rem" }}>{content}</div>
        </>
    );
};
