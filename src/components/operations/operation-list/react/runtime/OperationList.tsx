import * as React from "react";
import { useEffect, useState } from "react";
import { Router } from "@paperbits/common/routing";
import { Stack } from "@fluentui/react";
import {
    Accordion,
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    Button,
    Menu,
    MenuButton,
    MenuGroup,
    MenuGroupHeader,
    MenuItemCheckbox,
    MenuList,
    MenuPopover,
    MenuTrigger,
    SearchBox,
    Spinner
} from "@fluentui/react-components";
import { ChevronUpRegular, FilterRegular, MoreHorizontalRegular, SearchRegular } from "@fluentui/react-icons";
import { defaultPageSize } from "../../../../../constants";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { Tag } from "../../../../../models/tag";
import { Page } from "../../../../../models/page";
import { Operation } from "../../../../../models/operation";
import { TagGroup } from "../../../../../models/tagGroup";
import { ApiService } from "../../../../../services/apiService";
import { TagService } from "../../../../../services/tagService";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { OperationListRuntimeProps } from "./OperationListRuntime";

enum TListProps {
    groupByTag = "group-by-tag",
    showUrlPath = "show-url-path"
}

export const OperationList = ({
    apiName,
    operationName,
    apiService,
    tagService,
    routeHelper,
    router,
    allowSelection,
    wrapText,
    showToggleUrlPath,
    defaultShowUrlPath,
    defaultGroupByTagToEnabled,
    defaultAllGroupTagsExpanded,
    detailsPageUrl
}: OperationListRuntimeProps & { apiName: string, operationName: string, apiService: ApiService, tagService: TagService, routeHelper: RouteHelper, router: Router }) => {
    const [working, setWorking] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasNextPage, setHasNextPage] = useState<boolean>(false);
    const [operations, setOperations] = useState<Operation[]>([]);
    const [operationsByTags, setOperationsByTags] = useState<TagGroup<Operation>[]>([]);
    const [selectedOperationName, setSelectedOperationName] = useState<string>();
    const [pattern, setPattern] = useState<string>();
    const [showUrlPath, setShowUrlPath] = useState<boolean>(defaultShowUrlPath);
    const [tags, setTags] = useState<Tag[]>([]);
    const [selectedTags, setSelectedTags] = useState<Tag[]>([]);
    const [groupByTag, setGroupByTag] = useState<boolean>(defaultGroupByTagToEnabled);
    const [searchByTags, setSearchByTags] = useState<boolean>(false);
    const [tagPattern, setTagPattern] = useState<string>();

    useEffect(() => {
        if (!apiName) return;

        const query: SearchQuery = {
            pattern,
            tags: [...selectedTags],
            skip: (pageNumber - 1) * defaultPageSize,
            take: defaultPageSize,
            grouping: groupByTag ? "tag" : "none",
            propertyName: showUrlPath ? "urlTemplate" : ""
        };

        setWorking(true);
        if (groupByTag) {
            loadOperationsByTag(query)
                .then(loadedOperations => {
                    if (pageNumber > 1) {
                        // Check if the tag is already displayed. If yes, add to this tag
                        loadedOperations.value.forEach(newOperation => {
                            const existingTagIndex = operationsByTags.findIndex(item => item.tag === newOperation.tag);
                            if (existingTagIndex !== -1) {
                                operationsByTags[existingTagIndex].items.push(...newOperation.items);
                            } else {
                                operationsByTags.push(newOperation);
                            }
                        });
                        setOperationsByTags(operationsByTags);
                    } else {
                        setOperationsByTags([...loadedOperations.value]);
                    }

                    setHasNextPage(!!loadedOperations.nextLink);

                    if (allowSelection && loadedOperations.count > 0) {
                        if (!operationName) {
                            selectOperation(loadedOperations.value[0].items[0]);
                        } else {
                            const selectedOperation = loadedOperations.value.find(operation => operation.items.some(item => item.name === operationName));
                            selectedOperation && selectOperation(selectedOperation.items.find(item => item.name === operationName));
                        }
                    }
                })
                .finally(() => setWorking(false));
        } else {
            loadOperations(query)
                .then(loadedOperations => {
                    if (pageNumber > 1) {
                        setOperations([...operations, ...loadedOperations.value]);
                    } else {
                        setOperations([...loadedOperations.value]);
                    }
                    setHasNextPage(!!loadedOperations.nextLink);

                    if (allowSelection && loadedOperations.count > 0) {
                        if (!operationName) {
                            selectOperation(loadedOperations.value[0]);
                        } else {
                            const selectedOperation = loadedOperations.value.find(operation => operation.name === operationName);
                            selectedOperation && selectOperation(selectedOperation);
                        }
                    }
                })
                .finally(() => setWorking(false));
        }
    }, [apiName, pageNumber, pattern, selectedTags, groupByTag]);

    useEffect(() => {
        if (apiName) {
            loadTags().then(loadedTags => setTags(loadedTags.value));
        }
    }, [apiName, tagPattern]);

    const loadOperations = async (query: SearchQuery): Promise<Page<Operation>> => {
        let pageOfOperations: Page<Operation>;

        try {
            pageOfOperations = await apiService.getOperations(`apis/${apiName}`, query);
        } catch (error) {
            throw new Error(`Unable to load the API. Error: ${error.message}`);
        }

        return pageOfOperations;
    }

    const loadOperationsByTag = async (query: SearchQuery): Promise<Page<TagGroup<Operation>>> => {
        let pageOfOperations: Page<TagGroup<Operation>>;

        try {
            pageOfOperations = await apiService.getOperationsByTags(apiName, query);
        } catch (error) {
            throw new Error(`Unable to load the API. Error: ${error.message}`);
        }

        return pageOfOperations;
    }

    const loadTags = async (): Promise<Page<Tag>> => {
        let pageOfTags: Page<Tag>;

        try {
            pageOfTags = await tagService.getTags(`apis/${apiName}`, tagPattern);
        } catch (error) {
            throw new Error(`Unable to load tags. Error: ${error.message}`);
        }

        return pageOfTags;
    }

    const getDefaultListProps = (): Array<string> => {
        const defaultProps = [];
        defaultGroupByTagToEnabled && defaultProps.push(TListProps.groupByTag);
        defaultShowUrlPath && defaultProps.push(TListProps.showUrlPath);

        return defaultProps;
    }

    const selectOperation = (operation: Operation): void => {
        if (!operation) return;

        allowSelection && setSelectedOperationName(operation.name);
        const operationUrl = routeHelper.getOperationReferenceUrl(apiName, operation.name, detailsPageUrl);
        router.navigateTo(operationUrl);
    }

    const renderOperation = (operation: Operation): JSX.Element => (
        <Stack
            key={operation.id}
            horizontal
            className={`operation ${operation.name === selectedOperationName ? `is-selected-operation` : ""}`}
            onClick={() => selectOperation(operation)}
            onKeyDown={e => e.key === "Enter" && selectOperation(operation)}
            tabIndex={0}
        >
            {operation.name === selectedOperationName
                ? <>
                    <span className={`operation-method method-${operation.method} strong`}>
                        {operation.method}
                    </span>
                    <span className={`operation-name${!wrapText ? " nowrap" : ""} strong`}>
                        {showUrlPath ? operation.urlTemplate : operation.displayName}
                    </span>
                  </>
                : <>
                    <span className={`operation-method method-${operation.method}`}>
                        {operation.method}
                    </span>
                    <span className={`operation-name${!wrapText ? " nowrap" : ""}`}>
                        {showUrlPath ? operation.urlTemplate : operation.displayName}
                    </span>
                  </>
            }
        </Stack>
    )

    return (
        <div className={"operation-list-container"}>
            <Stack horizontal verticalAlign="center">
                <span style={{display: "block"}} className={"operation-list-title strong"}>Operations</span>
                <Stack horizontal>
                    <Menu defaultCheckedValues={{ "operation-list-props": getDefaultListProps() }}>
                        <MenuTrigger disableButtonEnhancement>
                            <MenuButton
                                icon={<MoreHorizontalRegular />}
                                appearance={"transparent"}
                                className={"operation-more"}
                                aria-label={"More options"}
                            />
                        </MenuTrigger>

                        <MenuPopover>
                            <MenuList>
                                <MenuItemCheckbox
                                    name={"operation-list-props"}
                                    value={TListProps.groupByTag}
                                    onClick={() => {
                                        setPageNumber(1);
                                        setGroupByTag(!groupByTag);
                                    }}
                                >
                                    Group operations by tag
                                </MenuItemCheckbox>
                                {showToggleUrlPath &&
                                    <MenuItemCheckbox
                                        name={"operation-list-props"}
                                        value={TListProps.showUrlPath}
                                        onClick={() => setShowUrlPath(!showUrlPath)}
                                    >
                                        Show URL path
                                    </MenuItemCheckbox>
                                }
                            </MenuList>
                        </MenuPopover>
                    </Menu>
                    <Button
                        icon={<ChevronUpRegular />}
                        appearance={"transparent"}
                        className={`collapse-operations-button${isCollapsed ? " is-collapsed" : ""}`}
                        onClick={() => setIsCollapsed(!isCollapsed)}
                        aria-label={isCollapsed ? "Show operations" : "Hide operations"}
                    />
                </Stack>
            </Stack>
            <div className={`operation-list-collapsible${isCollapsed ? " is-collapsed" : ""}`}>
                <Stack horizontal verticalAlign="center" className={"operation-search-container"}>
                    <div className="form-group" style={{ margin: 0, width: '100%' }}>
                        <input
                            type="search"
                            autoComplete="off"
                            className="form-control"
                            onChange={e => {
                                setPageNumber(1);
                                setSelectedOperationName(null);
                                setPattern(e.target.value);
                            }}
                            placeholder={"Search"}
                            aria-label={"Search"}
                            style={{ marginBottom: 0 }}
                        />
                    </div>
                    <Menu onCheckedValueChange={(_, data) => {
                        setPageNumber(1);
                        setSelectedTags(tags.filter(tag => data.checkedItems.indexOf(tag.name) > -1));
                    }}>
                        <MenuTrigger disableButtonEnhancement>
                            <Button
                                icon={<FilterRegular />}
                                className={"operation-filter"}
                                onClick={() => setSearchByTags(!searchByTags)}
                                aria-label={"Filter by tags"}
                            />
                        </MenuTrigger>
                        <MenuPopover className={"fui-tags-popover"}>
                            <MenuList>
                                <MenuGroup>
                                    <MenuGroupHeader>Search by tag</MenuGroupHeader>
                                    <Stack className="form-group" style={{ margin: 0 }}>
                                        <input
                                            type="search"
                                            autoComplete="off"
                                            className="form-control"
                                            onChange={e => setTagPattern(e.target.value)}
                                            placeholder={"Search"}
                                            aria-label={"Search"}
                                            style={{ marginBottom: 0 }}
                                        />
                                    </Stack>
                                    {tags.length === 0
                                        ? <div className={"tags-no-results"}>No tags found</div>
                                        : tags.map(tag => (
                                            <MenuItemCheckbox name={"tag"} value={tag.name} key={tag.name}>
                                                {tag.name}
                                            </MenuItemCheckbox>
                                          ))
                                    }
                                </MenuGroup>
                            </MenuList>
                        </MenuPopover>
                    </Menu>
                </Stack>
                <div className={"operation-list"}>
                    {working
                        ? <Spinner label="Loading operations..." labelPosition="below" size="extra-small" />
                        : <>
                            {groupByTag
                                ? <>
                                    {(!operationsByTags || operationsByTags.length === 0)
                                        ? <span>No operations found.</span>
                                        : <Accordion
                                            multiple
                                            collapsible
                                            defaultOpenItems={defaultAllGroupTagsExpanded ? [...Array(operationsByTags.length).keys()] : []}
                                          >
                                            {operationsByTags.map((tag, index) => (
                                                <AccordionItem value={index} key={tag.tag}>
                                                    <AccordionHeader expandIconPosition="end">{tag.tag}</AccordionHeader>
                                                    <AccordionPanel className={"operation-accordion-panel"}>
                                                        {tag.items.map(operation =>
                                                            renderOperation(operation)
                                                        )}
                                                    </AccordionPanel>
                                                </AccordionItem>
                                            ))}
                                          </Accordion>
                                    }
                                  </>
                                : <>
                                    {(!operations || operations.length <= 0)
                                        ? <span>No operations found.</span>
                                        : operations.map(operation =>
                                            renderOperation(operation)
                                          )
                                    }
                                  </>
                            }
                            {hasNextPage && <a className={"show-more-operations"} onClick={() => setPageNumber(prev => prev + 1)}>Show more</a>}
                          </>
                    }
                </div>
            </div>
        </div>
    );
}