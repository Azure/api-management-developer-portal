import * as React from "react";
import { useEffect, useState } from "react";
import { Router } from "@paperbits/common/routing";
import { Stack } from "@fluentui/react";
import { 
    Accordion,
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    Body1,
    Body1Strong,
    Button,
    Dropdown,
    Link,
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

export const OperationListGql = ({
    apiName,
    operationName,
    apiService,
    tagService,
    routeHelper,
    router,
    allowSelection,
    wrapText,
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

    useEffect(() => {
        // const query: SearchQuery = {
        //     pattern,
        //     tags: [...selectedTags],
        //     skip: (pageNumber - 1) * defaultPageSize,
        //     take: defaultPageSize,
        //     grouping: groupByTag ? "tag" : "none",
        //     propertyName: showUrlPath ? "urlTemplate" : ""
        // };

        
    }, [apiName, pageNumber, pattern]);

    const loadOperations = async (query: SearchQuery): Promise<Page<Operation>> => {
        let pageOfOperations: Page<Operation>;

        try {
            pageOfOperations = await apiService.getOperations(`apis/${apiName}`, query);
        } catch (error) {
            throw new Error(`Unable to load the API. Error: ${error.message}`);
        }

        return pageOfOperations;
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
            className={`operation ${operation.name === selectedOperationName && `is-selected-operation`}`}
            onClick={() => selectOperation(operation)}
        >
            {operation.name === selectedOperationName 
                ?
                    <>
                        <Body1Strong className={`operation-method method-${operation.method}`}>
                            {operation.method}
                        </Body1Strong>
                        <Body1Strong className={`operation-name${!wrapText ? " nowrap" : ""}`}>
                            {operation.displayName}
                        </Body1Strong>
                    </>
                :
                    <>
                        <Body1 className={`operation-method method-${operation.method}`}>
                            {operation.method}
                        </Body1>
                        <Body1 className={`operation-name${!wrapText ? " nowrap" : ""}`}>
                            {operation.displayName}
                        </Body1>
                    </>
            }
        </Stack>
    )

    return (
        <div className={"operation-list-container"}>
            <Stack horizontal verticalAlign="center">
                <Body1Strong block className={"operation-list-title"}>Operations</Body1Strong>
                <Button
                    icon={<ChevronUpRegular />}
                    appearance={"transparent"}
                    className={`collapse-operations-button${isCollapsed ? " is-collapsed" : ""}`}
                    onClick={() => setIsCollapsed(!isCollapsed)} 
                />
            </Stack>
            <div className={`operation-list-collapsible${isCollapsed ? " is-collapsed" : ""}`}>
                <Dropdown>
                    
                </Dropdown>
                <Stack horizontal verticalAlign="center" className={"operation-search-container"}>
                    <SearchBox
                        placeholder={"Search"}
                        contentBefore={<SearchRegular className={"fui-search-icon"} />}
                        className={"operation-search"}
                        onChange={(event, data) => {
                            setPageNumber(1);
                            setSelectedOperationName(null);
                            setPattern(data.value);
                        }}
                    />
                </Stack>
                <div className={"operation-list"}>
                    {working
                        ? <Spinner label="Loading operations..." labelPosition="below" size="extra-small" />
                        : <>
                            {(!operations || operations.length <= 0)
                                ? <Body1>No operations found.</Body1>
                                : operations.map(operation =>
                                    renderOperation(operation)
                                )
                            }
                            {hasNextPage && <Link className={"show-more-operations"} onClick={() => setPageNumber(prev => prev + 1)}>Show more</Link>}
                          </>
                    }
                </div>
            </div>
        </div>
    );
}