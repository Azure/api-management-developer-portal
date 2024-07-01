import * as React from "react";
import { useEffect, useState } from "react";
import { Router } from "@paperbits/common/routing";
import { Stack } from "@fluentui/react";
import { Body1, Body1Strong, Button, Dropdown, Option, SearchBox, Spinner } from "@fluentui/react-components";
import { ChevronUpRegular, SearchRegular } from "@fluentui/react-icons";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { OperationListRuntimeProps } from "./OperationListRuntime";
import { GraphqlService, TGraphqlTypes } from "../../../../../services/graphqlService";

export const OperationListGql = ({
    apiName,
    graphName,
    graphType,
    graphqlService,
    routeHelper,
    router,
    allowSelection,
    wrapText,
    detailsPageUrl
}: OperationListRuntimeProps & { apiName: string, graphName: string, graphType: string, graphqlService: GraphqlService, routeHelper: RouteHelper, router: Router }) => {
    const [working, setWorking] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [graphqlTypes, setGraphqlTypes] = useState<TGraphqlTypes>();
    const [availableGraphqlTypes, setAvailableGraphqlTypes] = useState<string[]>([]);
    const [selectedGraphqlType, setSelectedGraphqlType] = useState<string>(null);
    const [selectedGraphqlTypeOperations, setSelectedGraphqlTypeOperations] = useState<object>();
    const [filteredOperations, setFilteredOperations] = useState<object>();
    const [selectedOperationName, setSelectedOperationName] = useState<string>();

    useEffect(() => {
        if (!apiName) return;

        setWorking(true);
        getGraphValues().then(loadedValues => {
            setGraphqlTypes(loadedValues.graphqlTypes);
            setAvailableGraphqlTypes(loadedValues.availableGraphqlTypes);
            
            const selectedType = graphType || loadedValues?.availableGraphqlTypes[0];
            if (selectedType) {
                const operations = loadedValues.graphqlTypes[selectedType.toLowerCase()];
                setSelectedGraphqlType(selectedType);
                setSelectedGraphqlTypeOperations(operations);
                setFilteredOperations(operations);
                if (Object.values(operations).length > 0) {
                    graphName 
                        ? setSelectedOperationName(graphName)
                        : selectOperation(Object.values(operations)[0], selectedType);
                }
            }
        }).finally(() => setWorking(false));
    }, [apiName, graphName, graphType]);

    const getGraphValues = async (): Promise<{graphqlTypes: TGraphqlTypes, availableGraphqlTypes: string[]}> => {
        let graphqlTypes: TGraphqlTypes;
        let availableGraphqlTypes: string[];

        try {
            graphqlTypes = (await graphqlService.getGraphqlTypesAndSchema(apiName))?.graphqlTypes;
            availableGraphqlTypes = await graphqlService.getAvailableGraphqlTypes(graphqlTypes);
        } catch (error) {
            throw new Error(`Unable to get GraphQL types. Error: ${error.message}`);
        }

        return {graphqlTypes, availableGraphqlTypes};
    }

    const selectOperation = (operation, selectedType?: string): void => {
        if (!operation) return;
        const graphType = selectedType || selectedGraphqlType;
        if (!graphType) return;

        allowSelection && setSelectedOperationName(operation.name);
        const operationUrl = routeHelper.getGraphReferenceUrl(apiName, graphType.toLowerCase(), operation.name, detailsPageUrl);
        router.navigateTo(operationUrl);
    }

    const filterOperations = (searchText?: string): void => {
        if (!searchText) {
            setFilteredOperations(selectedGraphqlTypeOperations);
        } else {
            const filteredOperations: {} = Object
                .values(selectedGraphqlTypeOperations)
                .filter(operation => operation["name"].toLowerCase().includes(searchText.toLowerCase()))
                .reduce((obj: object, item: any) => {
                    return {
                        ...obj,
                        [item.name]: item
                    };
                }, {});
            setFilteredOperations(filteredOperations);
        }
    }

    const renderOperation = (operation): JSX.Element => (
        <Stack
            key={operation.name}
            horizontal
            className={`operation ${operation.name === selectedOperationName && `is-selected-operation`}`}
            onClick={() => selectOperation(operation)}
        >
            {operation.name === selectedOperationName 
                ? <Body1Strong className={`operation-name${!wrapText ? " nowrap" : ""}`}>
                        {operation.name}
                  </Body1Strong>
                : <Body1 className={`operation-name${!wrapText ? " nowrap" : ""}`}>
                        {operation.name}
                  </Body1>
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
                    aria-label={isCollapsed ? "Show operations" : "Hide operations"}
                />
            </Stack>
            <div className={`operation-list-collapsible${isCollapsed ? " is-collapsed" : ""}`}>
                <Dropdown
                    className={"operation-type-dropdown"}
                    value={selectedGraphqlType}
                    selectedOptions={[selectedGraphqlType]}
                    onOptionSelect={(e, data) => {
                        setSelectedGraphqlType(data.optionValue);
                        setSelectedGraphqlTypeOperations(graphqlTypes[data.optionValue.toLowerCase()]);
                        setFilteredOperations(graphqlTypes[data.optionValue.toLowerCase()]);
                    }}
                >
                    {availableGraphqlTypes.map(type => (
                        <Option key={type} value={type}>{type}</Option>
                    ))}
                </Dropdown>
                <Stack horizontal verticalAlign="center" className={"operation-search-container"}>
                    <SearchBox
                        placeholder={"Search"}
                        contentBefore={<SearchRegular className={"fui-search-icon"} />}
                        className={"operation-search"}
                        onChange={(event, data) => filterOperations(data.value)}
                    />
                </Stack>
                <div className={"operation-list"}>
                    {working
                        ? <Spinner label="Loading operations..." labelPosition="below" size="extra-small" />
                        : (!filteredOperations || Object.entries(filteredOperations).length <= 0)
                            ? <Body1>No operations found.</Body1>
                            : Object.values(filteredOperations).map(operation => renderOperation(operation))
                    }
                </div>
            </div>
        </div>
    );
}