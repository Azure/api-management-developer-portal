import * as React from "react";
import { Stack } from "@fluentui/react";
import {
    Switch,
    Toolbar,
    ToolbarRadioButton,
    ToolbarRadioGroup,
} from "@fluentui/react-components";
import { AppsList24Regular, Grid24Regular } from "@fluentui/react-icons";
import { TableFiltersButton, TFilterActive, TFilterGroup } from "./TableFilters";

export enum TLayout {
    "cards" = "cards",
    "table" = "table",
    "dropdown" = "dropdown",
}

export const layoutsMap = {
    "tiles": TLayout.cards,
    "list": TLayout.table,
    "dropdown": TLayout.dropdown,
}

export const GroupByTag = ({
    groupByTag,
    setGroupByTag,
    setPageNumber,
    labelAfter = false
}: {
    groupByTag: boolean;
    setGroupByTag: React.Dispatch<React.SetStateAction<boolean>>;
    setPageNumber: React.Dispatch<React.SetStateAction<number>>;
    labelAfter?: boolean;
}) => (
    <Switch
        label={"Group by tag"}
        labelPosition={labelAfter ? "after" : "before"}
        checked={groupByTag}
        onChange={(_, { checked }) => {
            setPageNumber(1);
            setGroupByTag(checked);
        }}
    />
);

const LayoutSwitchPure = ({layout, setLayout}: { layout: TLayout; setLayout: (newLayout: TLayout) => void }) => (
    <Toolbar
        style={{padding: 0}}
        checkedValues={{layout: [layout]}}
        onCheckedValueChange={(_, {checkedItems}) => setLayout(checkedItems[0] as TLayout)}
    >
        <ToolbarRadioGroup>
            <ToolbarRadioButton name={"layout"} value={TLayout.cards} icon={<Grid24Regular/>}/>
            <ToolbarRadioButton name={"layout"} value={TLayout.table} icon={<AppsList24Regular/>}/>
        </ToolbarRadioGroup>
    </Toolbar>
)

type ApisTableInfoProps = {
    layout: TLayout
    setLayout: React.Dispatch<React.SetStateAction<TLayout>>
    filters?: TFilterActive
    setFilters?: React.Dispatch<React.SetStateAction<TFilterActive>>
    filtersOptions?: TFilterGroup[]
    pattern: string | undefined
    setPattern: React.Dispatch<React.SetStateAction<string | undefined>>
    setPageNumber: React.Dispatch<React.SetStateAction<number>>
    groupByTag?: boolean
    setGroupByTag?: React.Dispatch<React.SetStateAction<boolean>>
    allowViewSwitching: boolean
}

export const TableListInfo = ({
    layout,
    setLayout,
    filtersOptions,
    filters,
    setFilters,
    setPattern,
    setPageNumber,
    groupByTag,
    setGroupByTag,
    allowViewSwitching,
}: ApisTableInfoProps) => (
    <Stack horizontal horizontalAlign="space-between">
        <Stack horizontal tokens={{ childrenGap: "1rem" }}>
            {filters && setFilters && !!filtersOptions?.filter(e => e.items.length).length && (
                <TableFiltersButton
                    filtersActive={filters}
                    setFiltersActive={setFilters}
                    filtersOptions={filtersOptions}
                    accordionProps={{ defaultOpenItems: "tags" }}
                />
            )}

            <div className="form-group" style={{ marginTop: 0, marginBottom: 0 }}>
                <input
                    type="search"
                    autoComplete="off"
                    className="form-control"
                    onChange={e => {
                        setPattern(e.target.value);
                        setPageNumber(1);
                    }}
                    placeholder={"Search"}
                    aria-label={"Search"}
                    style={{ marginBottom: 0 }}
                />
            </div>
        </Stack>

        {/*
        <p style={{margin: 0}}>
            Displaying <b>{
                ((pageNumber - 1) * Constants.defaultPageSize) + 1
            }</b> to <b>{
                Math.min(pageNumber * Constants.defaultPageSize, apis?.count)
            }</b> of <b>{apis?.count}</b> items
        </p>
        */}

        <Stack horizontal tokens={{ childrenGap: "1rem" }}>
            {setGroupByTag && (
                <GroupByTag
                    groupByTag={groupByTag}
                    setGroupByTag={setGroupByTag}
                    setPageNumber={setPageNumber}
                />
            )}
            {allowViewSwitching && (
                <LayoutSwitchPure layout={layout} setLayout={setLayout} />
            )}
        </Stack>
    </Stack>
);
