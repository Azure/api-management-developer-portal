import * as React from "react";
import { Stack } from "@fluentui/react";
import {
    SearchBox,
    Body1Stronger,
    Label,
    Switch,
    Button,
    Input,
    Toolbar,
    ToolbarRadioButton,
    ToolbarRadioGroup,
} from "@fluentui/react-components";
import { Grid24Regular, AppsList24Regular } from "@fluentui/react-icons";
import { TableFiltersButton, TFilterActive, TFilterGroup } from "./TableFilters";

export enum TLayout {
    "cards" = "cards",
    "table" = "table",
}

export const layoutsMap = {
    "tiles": TLayout.cards,
    "list": TLayout.table,
    "dropdown": undefined, // TODO
}

const groupByTagId = "groupByTagId";
const GroupByTag = ({
    setGroupByTag,
    defaultGroupByTagToEnabled,
}: {
    setGroupByTag: React.Dispatch<React.SetStateAction<boolean>>;
    defaultGroupByTagToEnabled: boolean;
}) => (
    <div>
        <Label htmlFor={groupByTagId}>
            <Body1Stronger>Group by tag</Body1Stronger>
        </Label>

        <Switch
            id={groupByTagId}
            aria-labelledby={groupByTagId}
            defaultChecked={defaultGroupByTagToEnabled}
            onChange={(_, { checked }) => setGroupByTag(checked)}
        />
    </div>
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
    setGroupByTag?: React.Dispatch<React.SetStateAction<boolean>>
    allowViewSwitching: boolean
    defaultGroupByTagToEnabled?: boolean
}

export const TableListInfo = ({
    layout,
    setLayout,
    filtersOptions,
    filters,
    setFilters,
    setPattern,
    setGroupByTag,
    allowViewSwitching,
    defaultGroupByTagToEnabled,
}: ApisTableInfoProps) => (
    <Stack horizontal horizontalAlign="space-between">
        <Stack.Item>
            <Stack horizontal tokens={{ childrenGap: "1rem" }}>
                {filters && setFilters && filtersOptions && (
                    <Stack.Item>
                        <TableFiltersButton
                            filtersActive={filters}
                            setFiltersActive={setFilters}
                            filtersOptions={filtersOptions}
                            accordionProps={{ defaultOpenItems: "tags" }}
                        />
                    </Stack.Item>
                )}

                <Stack.Item>
                    <SearchBox
                        onChange={(_, { value }) => setPattern(value)}
                        placeholder={"Search"}
                        aria-label={"Search"}
                    />
                </Stack.Item>
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
        </Stack.Item>

        <Stack.Item>
            <Stack horizontal tokens={{ childrenGap: "1rem" }}>
                {setGroupByTag && (
                    <GroupByTag
                        setGroupByTag={setGroupByTag}
                        defaultGroupByTagToEnabled={defaultGroupByTagToEnabled}
                    />
                )}
                {allowViewSwitching && (
                    <LayoutSwitchPure layout={layout} setLayout={setLayout} />
                )}
            </Stack>
        </Stack.Item>
    </Stack>
);
