import * as React from "react";
import { useEffect, useState } from "react";
import { TApisData } from "./utils";
import { Stack } from "@fluentui/react";
import { Spinner } from "@fluentui/react-components";
import { Tag } from "../../../../../models/tag";
import { TableFiltersSidebar, TFilterActive } from "../../../../utils/react/TableFilters";
import { TableListInfo, TLayout } from "../../../../utils/react/TableListInfo";
import { useTableFiltersTags } from "../../../../utils/react/useTableFiltersTags";
import { Pagination } from "../../../../utils/react/Pagination";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { defaultPageSize } from "../../../../../constants";
import { FiltersPosition } from "../../listOfApisContract";
import { ApisTable } from "./ApisTable";
import { ApisCards } from "./ApisCards";
import { TApiListRuntimeFCProps } from "./ApiListRuntime";

type TApiListTableCards = TApiListRuntimeFCProps;

export const ApiListTableCards = ({
    apiService,
    tagService,
    layoutDefault,
    getReferenceUrl,
    productName,
    showApiType,
    allowViewSwitching,
    filtersPosition,
    detailsPageTarget,
    defaultGroupByTagToEnabled
}: TApiListTableCards) => {
    const [layout, setLayout] = useState<TLayout>(layoutDefault ?? TLayout.table);
    const [working, setWorking] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [apis, setApis] = useState<TApisData>();
    const [pattern, setPattern] = useState<string>();
    const [groupByTag, setGroupByTag] = useState(!!defaultGroupByTagToEnabled);
    const [filters, setFilters] = useState<{ tags: Tag[] }>({ tags: [] });

    const filterOptionTags = useTableFiltersTags(tagService);

    useEffect(() => {
        const query: SearchQuery = {
            pattern,
            tags: filters.tags,
            skip: (pageNumber - 1) * defaultPageSize,
            take: defaultPageSize
        };

        setWorking(true);
        loadApis(query, groupByTag, productName)
            .then(apis => setApis(apis))
            .finally(() => setWorking(false));
    }, [apiService, pageNumber, groupByTag, filters, pattern, productName]);

    const loadApis = async (query: SearchQuery, groupByTag?: boolean, productName?: string) => {
        let apis: TApisData;
    
        try {
            if (productName) {
                apis = await apiService.getProductApis(`products/${productName}`, query);
            } else if (groupByTag) {
                apis = await apiService.getApisByTags(query);
            } else {
                apis = await apiService.getApis(query);
            }
        } catch (error) {
            throw new Error(`Unable to load APIs. Error: ${error.message}`);
        }
    
        return apis;
    }

    const content = (
        <Stack tokens={{ childrenGap: "1rem" }}>
            <TableListInfo
                layout={layout}
                setLayout={setLayout}
                pattern={pattern}
                setPattern={setPattern}
                filters={filters}
                setFilters={setFilters}
                setPageNumber={setPageNumber}
                filtersOptions={filtersPosition === FiltersPosition.popup ? [filterOptionTags] : undefined}
                setGroupByTag={productName ? undefined : setGroupByTag} // don't allow grouping by tags when filtering for product APIs due to missing BE support
                allowViewSwitching={allowViewSwitching}
            />

            {working || !apis ? (
                <Spinner
                    label="Loading APIs"
                    labelPosition="below"
                    size="small"
                />
            ) : (
                <>
                    <div style={{ margin: "1rem auto" }}>
                        <Pagination
                            pageNumber={pageNumber}
                            setPageNumber={setPageNumber}
                            hasNextPage={!!apis?.nextLink}
                        />
                    </div>

                    <div>
                        {layout === TLayout.table ? (
                            <ApisTable
                                apis={apis}
                                showApiType={showApiType}
                                getReferenceUrl={getReferenceUrl}
                                detailsPageTarget={detailsPageTarget}
                            />
                        ) : (
                            <ApisCards
                                apis={apis}
                                showApiType={showApiType}
                                getReferenceUrl={getReferenceUrl}
                                detailsPageTarget={detailsPageTarget}
                            />
                        )}
                    </div>

                    <div style={{ margin: "1rem auto" }}>
                        <Pagination
                            pageNumber={pageNumber}
                            setPageNumber={setPageNumber}
                            hasNextPage={!!apis?.nextLink}
                        />
                    </div>
                </>
            )}
        </Stack>
    );

    return filtersPosition !== FiltersPosition.sidebar ? (
        content
    ) : (
        <Stack horizontal tokens={{ childrenGap: "2rem" }}>
            <div
                style={{ minWidth: "12rem", width: "15%", maxWidth: "20rem" }}
            >
                <TableFiltersSidebar
                    filtersActive={filters}
                    setFiltersActive={setFilters}
                    filtersOptions={groupByTag ? [] : [filterOptionTags]}
                />
            </div>
            <div style={{ width: "100%" }}>{content}</div>
        </Stack>
    );
};
