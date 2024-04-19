import * as React from "react";
import { useEffect, useState } from "react";
import { Accordion, AccordionHeader, AccordionItem, AccordionPanel, Body1, Body1Strong, Button, FluentProvider, Link, Menu, MenuButton, MenuItem, MenuList, MenuPopover, MenuTrigger, SearchBox, Spinner, Text } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import * as Constants from "../../../../../constants";
import { Api } from "../../../../../models/api";
import { Tag } from "../../../../../models/tag";
import { Page } from "../../../../../models/page";
import { ApiService } from "../../../../../services/apiService";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Router } from "@paperbits/common/routing";
import { fuiTheme } from "../../../../../constants/fuiTheme";
import { Operation } from "../../../../../models/operation";
import { Stack } from "@fluentui/react";
import { ChevronDownRegular, FilterRegular, MoreHorizontalRegular, SearchRegular } from "@fluentui/react-icons";
import { TagGroup } from "../../../../../models/tagGroup";

interface OperationListProps {
    allowSelection?: boolean,
    wrapText?: boolean,
    showToggleUrlPath?: boolean,
    defaultShowUrlPath?: boolean,
    defaultGroupByTagToEnabled?: boolean,
    defaultAllGroupTagsExpanded?: boolean,
    detailsPageUrl: string
}

interface OperationListState {
    apiName: string,
    operationName: string
}

const OperationListFC = ({ 
    apiService,
    apiName,
    operationName,
    routeHelper,
    router,
    allowSelection,
    wrapText,
    showToggleUrlPath,
    defaultShowUrlPath,
    defaultGroupByTagToEnabled,
    defaultAllGroupTagsExpanded
}: OperationListProps & { apiService: ApiService, apiName: string, operationName: string, routeHelper: RouteHelper, router: Router }) => {
    const [working, setWorking] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [hasNextPage, setHasNextPage] = useState<boolean>(false);
    const [operations, setOperations] = useState<Operation[]>([]);
    const [operationsByTags, setOperationsByTags] = useState<TagGroup<Operation>[]>([]);
    const [selectedOperationName, setSelectedOperationName] = useState<string>();
    const [pattern, setPattern] = useState<string>();
    const [showUrlPath, setShowUrlPath] = useState<boolean>(defaultShowUrlPath)
    const [tags, setTags] = useState(new Set<Tag>())
    const [groupByTag, setGroupByTag] = useState<boolean>(defaultGroupByTagToEnabled)

    useEffect(() => {
        const query: SearchQuery = {
            pattern,
            tags: [...tags],
            skip: (pageNumber - 1) * Constants.defaultPageSize,
            take: Constants.defaultPageSize,
            grouping: groupByTag ? "tag" : "none"
        };

        if (apiName) {
            setWorking(true)
            if (groupByTag) {
                loadOperationsByTag(query)
                    .then(loadedOperations => {
                        if (pageNumber > 1) {
                            setOperationsByTags([...operationsByTags, ...loadedOperations.value])
                        } else {
                            setOperationsByTags([...loadedOperations.value])
                        }
            
                        setHasNextPage(!!loadedOperations.nextLink)
            
                        if (allowSelection && !operationName && !selectedOperationName) selectOperation(loadedOperations.value[0].items[0])
                    })
                    .finally(() => setWorking(false))
            } else {
                loadOperations(query)
                    .then(loadedOperations => {
                        if (pageNumber > 1) {
                            setOperations([...operations, ...loadedOperations.value])
                        } else {
                            setOperations([...loadedOperations.value])
                        }
                        setHasNextPage(!!loadedOperations.nextLink)

                        if (allowSelection && !operationName && !selectedOperationName) selectOperation(loadedOperations.value[0])
                    })
                    .finally(() => setWorking(false))
            }
        }
    }, [apiName, pageNumber, pattern, tags])

    const loadOperations = async (query: SearchQuery) => {
        let api: Api;
        let pageOfOperations;
        let type;

        console.log(query);
    
        try {
            api = await apiService.getApi(`apis/${apiName}`);
            //type = api?.type;
            pageOfOperations = await apiService.getOperations(`apis/${apiName}`, query);
            console.log(pageOfOperations)
        } catch (error) {
            throw new Error(`Unable to load the API. Error: ${error.message}`);
        }
    
        return pageOfOperations;
    }

    const loadOperationsByTag = async (query: SearchQuery) => {
        let api: Api;
        let pageOfOperations: Page<TagGroup<Operation>>;
        let type;

        console.log(query);
    
        try {
            api = await apiService.getApi(`apis/${apiName}`);
            //type = api?.type;
            
            pageOfOperations = await apiService.getOperationsByTags(apiName, query);
            console.log(pageOfOperations)
        } catch (error) {
            throw new Error(`Unable to load the API. Error: ${error.message}`);
        }
    
        return pageOfOperations;
    }

    const selectOperation = (operation: Operation): void => {
        allowSelection && setSelectedOperationName(operation.name);
        const operationUrl = routeHelper.getOperationReferenceUrl(apiName, operation.name); //this.detailsPageUrl()
        router.navigateTo(operationUrl);
    }

    const renderOperation = (operation: Operation) => (
        <Stack
            key={operation.id}
            horizontal
            //verticalAlign="center"
            className={`operation ${operation.name === selectedOperationName && `is-selected-operation`}`}
            onClick={() => selectOperation(operation)}
        >
            {operation.name === selectedOperationName ?
                <>
                    <Body1Strong className={`operation-method method-${operation.method}`}>{operation.method}</Body1Strong>
                    <Body1Strong className={`operation-name${!wrapText ? " nowrap" : ""}`}>{showUrlPath ? operation.urlTemplate : operation.displayName}</Body1Strong>
                </>
                :
                <>
                    <Body1 className={`operation-method method-${operation.method}`}>{operation.method}</Body1>
                    <Body1 className={`operation-name${!wrapText ? " nowrap" : ""}`}>{showUrlPath ? operation.urlTemplate : operation.displayName}</Body1>
                </>
            }
        </Stack>
    )

    return (
        <div className={"operation-list-container"}>
            <Stack horizontal verticalAlign="center">
                <Body1Strong block className={"operation-list-title"}>Operations</Body1Strong>
                <Stack horizontal>
                    <Menu onOpenChange={e => e.stopPropagation()}>
                        <MenuTrigger disableButtonEnhancement>
                            <MenuButton
                                appearance={"transparent"}
                                icon={<MoreHorizontalRegular />}
                                className={"operation-more"}
                            />
                        </MenuTrigger>

                        <MenuPopover>
                            <MenuList>
                                <MenuItem onClick={() => setGroupByTag(!groupByTag)}>
                                    {groupByTag ? "Ungroup by tag" : "Group by tag"}
                                </MenuItem>
                                {showToggleUrlPath &&
                                    <MenuItem onClick={() => setShowUrlPath(!showUrlPath)}>
                                        {showUrlPath ? "Show operation names" : "Show URL path"}
                                    </MenuItem>
                                }
                            </MenuList>
                        </MenuPopover>
                    </Menu>
                    <Button icon={<ChevronDownRegular />} appearance={"transparent"} />
                    {/* className={"operation-filter"} /> */}
                </Stack>
            </Stack>
            <Stack horizontal verticalAlign="center" className={"operation-search-container"}>
                <SearchBox
                    placeholder={"Search"}
                    contentBefore={<SearchRegular className={"fui-search-icon"} />}
                    className={"operation-search"}
                    onChange={(event, data) => {
                        // TODO: add delay
                        setPageNumber(1)
                        setSelectedOperationName(null)
                        setPattern(data.value)
                    }}
                />
                <Button icon={<FilterRegular />} className={"operation-filter"} />
            </Stack>
            <div className={"operation-list"}>
                {groupByTag
                    ?
                        <>
                            {(!operationsByTags || operationsByTags.length <= 0)
                                ? <Body1>No operations found</Body1>
                                : 
                                    <Accordion
                                        multiple
                                        collapsible
                                        defaultOpenItems={defaultAllGroupTagsExpanded && [...Array(operationsByTags.length).keys()]}
                                    >
                                        {operationsByTags.map((tag, index) => (
                                            <AccordionItem value={index}>
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
                    : 
                    <>
                        {(!operations || operations.length <= 0)
                            ? <Body1>No operations found</Body1>
                            : operations.map(operation =>
                                renderOperation(operation)
                            )
                        }
                        {hasNextPage && <Link className={"show-more-operations"} onClick={() => setPageNumber(prev => prev + 1)}>Show more</Link>}
                    </>
                }
            </div>
        </div>
    );
}

export class OperationList extends React.Component<OperationListProps, OperationListState> {
    @Resolve("apiService")
    public apiService: ApiService;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    @Resolve("router")
    public router: Router;

    constructor(props: OperationListProps) {
        super(props);

        this.state = {
            apiName: null,
            operationName: null
        }
    }

    componentDidMount(): void {
        console.log(this.props);
        this.getApiName();
    }

    componentDidUpdate(prevProps: Readonly<OperationListProps>, prevState: Readonly<OperationListState>, snapshot?: any): void {
        console.log(this.props);
    }

    getApiName = (): void => {
        const apiName = this.routeHelper.getApiName();
        const operationName = this.routeHelper.getOperationName();
        this.setState({ apiName, operationName });
    }

    render() {
        return (
            <FluentProvider theme={fuiTheme}>
                <OperationListFC
                    {...this.props}
                    apiService={this.apiService}
                    apiName={this.state.apiName}
                    operationName={this.state.operationName}
                    routeHelper={this.routeHelper}
                    router={this.router}
                />
            </FluentProvider>
        );
    }
}
