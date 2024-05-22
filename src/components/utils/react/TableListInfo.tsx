import * as React from "react";
import { Stack } from "@fluentui/react";
import { Body1Stronger, Label, Switch, Button, Input, Toolbar, ToolbarRadioButton, ToolbarRadioGroup } from "@fluentui/react-components";
import { Search16Regular, Dismiss16Regular, AppsList24Regular } from "@fluentui/react-icons";

export enum TLayout {
    "cards" = "cards",
    "table" = "table",
}

export const layoutsMap = {
    "tiles": TLayout.cards,
    "list": TLayout.table,
    "dropdown": undefined, // TODO
}

const CardsIcon = () => (
    <svg xmlns={"http://www.w3.org/2000/svg"} width={"18"} height={"18"} viewBox={"0 0 18 18"} fill={"none"}>
        <path d={"M1.92904 7.71437C1.66789 7.71437 1.42014 7.66415 1.18578 7.56371C0.951421 7.46327 0.747194 7.326 0.573098 7.15191C0.399002 6.97781 0.258386 6.77024 0.151251 6.52918C0.0441147 6.28812 -0.00610517 6.04037 0.000590823 5.78593V1.92904C0.000590823 1.66789 0.0508107 1.42014 0.151251 1.18578C0.25169 0.951421 0.388958 0.747194 0.563054 0.573098C0.73715 0.399002 0.944725 0.258386 1.18578 0.151251C1.42684 0.0441147 1.67459 -0.00610517 1.92904 0.000590823H5.78593C6.04707 0.000590823 6.29482 0.0508107 6.52918 0.151251C6.76354 0.25169 6.96777 0.388958 7.14186 0.563054C7.31596 0.73715 7.45657 0.944725 7.56371 1.18578C7.67085 1.42684 7.72107 1.67459 7.71437 1.92904V5.78593C7.71437 6.04707 7.66415 6.29482 7.56371 6.52918C7.46327 6.76354 7.326 6.96777 7.15191 7.14186C6.97781 7.31596 6.77024 7.45657 6.52918 7.56371C6.28812 7.67085 6.04037 7.72107 5.78593 7.71437H1.92904ZM12.2141 7.71437C11.9529 7.71437 11.7052 7.66415 11.4708 7.56371C11.2365 7.46327 11.0322 7.326 10.8581 7.15191C10.684 6.97781 10.5434 6.77024 10.4363 6.52918C10.3292 6.28812 10.2789 6.04037 10.2856 5.78593V1.92904C10.2856 1.66789 10.3358 1.42014 10.4363 1.18578C10.5367 0.951421 10.674 0.747194 10.8481 0.573098C11.0222 0.399002 11.2298 0.258386 11.4708 0.151251C11.7119 0.0441147 11.9596 -0.00610517 12.2141 0.000590823H16.071C16.3321 0.000590823 16.5799 0.0508107 16.8142 0.151251C17.0486 0.25169 17.2528 0.388958 17.4269 0.563054C17.601 0.73715 17.7416 0.944725 17.8487 1.18578C17.9559 1.42684 18.0061 1.67459 17.9994 1.92904V5.78593C17.9994 6.04707 17.9492 6.29482 17.8487 6.52918C17.7483 6.76354 17.611 6.96777 17.4369 7.14186C17.2628 7.31596 17.0553 7.45657 16.8142 7.56371C16.5732 7.67085 16.3254 7.72107 16.071 7.71437H12.2141ZM5.78593 6.42874C5.96002 6.42874 6.11068 6.36513 6.2379 6.2379C6.36513 6.11068 6.42874 5.96002 6.42874 5.78593V1.92904C6.42874 1.75494 6.36513 1.60428 6.2379 1.47706C6.11068 1.34983 5.96002 1.28622 5.78593 1.28622H1.92904C1.75494 1.28622 1.60428 1.34983 1.47706 1.47706C1.34983 1.60428 1.28622 1.75494 1.28622 1.92904V5.78593C1.28622 5.96002 1.34983 6.11068 1.47706 6.2379C1.60428 6.36513 1.75494 6.42874 1.92904 6.42874H5.78593ZM16.071 6.42874C16.2451 6.42874 16.3957 6.36513 16.5229 6.2379C16.6502 6.11068 16.7138 5.96002 16.7138 5.78593V1.92904C16.7138 1.75494 16.6502 1.60428 16.5229 1.47706C16.3957 1.34983 16.2451 1.28622 16.071 1.28622H12.2141C12.04 1.28622 11.8893 1.34983 11.7621 1.47706C11.6349 1.60428 11.5713 1.75494 11.5713 1.92904V5.78593C11.5713 5.96002 11.6349 6.11068 11.7621 6.2379C11.8893 6.36513 12.04 6.42874 12.2141 6.42874H16.071ZM1.92904 17.9994C1.66789 17.9994 1.42014 17.9492 1.18578 17.8487C0.951421 17.7483 0.747194 17.611 0.573098 17.4369C0.399002 17.2628 0.258386 17.0553 0.151251 16.8142C0.0441147 16.5732 -0.00610517 16.3254 0.000590823 16.071V12.2141C0.000590823 11.9529 0.0508107 11.7052 0.151251 11.4708C0.25169 11.2365 0.388958 11.0322 0.563054 10.8581C0.73715 10.684 0.944725 10.5434 1.18578 10.4363C1.42684 10.3292 1.67459 10.2789 1.92904 10.2856H5.78593C6.04707 10.2856 6.29482 10.3358 6.52918 10.4363C6.76354 10.5367 6.96777 10.674 7.14186 10.8481C7.31596 11.0222 7.45657 11.2298 7.56371 11.4708C7.67085 11.7119 7.72107 11.9596 7.71437 12.2141V16.071C7.71437 16.3321 7.66415 16.5799 7.56371 16.8142C7.46327 17.0486 7.326 17.2528 7.15191 17.4269C6.97781 17.601 6.77024 17.7416 6.52918 17.8487C6.28812 17.9559 6.04037 18.0061 5.78593 17.9994H1.92904ZM12.2141 17.9994C11.9529 17.9994 11.7052 17.9492 11.4708 17.8487C11.2365 17.7483 11.0322 17.611 10.8581 17.4369C10.684 17.2628 10.5434 17.0553 10.4363 16.8142C10.3292 16.5732 10.2789 16.3254 10.2856 16.071V12.2141C10.2856 11.9529 10.3358 11.7052 10.4363 11.4708C10.5367 11.2365 10.674 11.0322 10.8481 10.8581C11.0222 10.684 11.2298 10.5434 11.4708 10.4363C11.7119 10.3292 11.9596 10.2789 12.2141 10.2856H16.071C16.3321 10.2856 16.5799 10.3358 16.8142 10.4363C17.0486 10.5367 17.2528 10.674 17.4269 10.8481C17.601 11.0222 17.7416 11.2298 17.8487 11.4708C17.9559 11.7119 18.0061 11.9596 17.9994 12.2141V16.071C17.9994 16.3321 17.9492 16.5799 17.8487 16.8142C17.7483 17.0486 17.611 17.2528 17.4369 17.4269C17.2628 17.601 17.0553 17.7416 16.8142 17.8487C16.5732 17.9559 16.3254 18.0061 16.071 17.9994H12.2141ZM5.78593 16.7138C5.96002 16.7138 6.11068 16.6502 6.2379 16.5229C6.36513 16.3957 6.42874 16.2451 6.42874 16.071V12.2141C6.42874 12.04 6.36513 11.8893 6.2379 11.7621C6.11068 11.6349 5.96002 11.5713 5.78593 11.5713H1.92904C1.75494 11.5713 1.60428 11.6349 1.47706 11.7621C1.34983 11.8893 1.28622 12.04 1.28622 12.2141V16.071C1.28622 16.2451 1.34983 16.3957 1.47706 16.5229C1.60428 16.6502 1.75494 16.7138 1.92904 16.7138H5.78593ZM16.071 16.7138C16.2451 16.7138 16.3957 16.6502 16.5229 16.5229C16.6502 16.3957 16.7138 16.2451 16.7138 16.071V12.2141C16.7138 12.04 16.6502 11.8893 16.5229 11.7621C16.3957 11.6349 16.2451 11.5713 16.071 11.5713H12.2141C12.04 11.5713 11.8893 11.6349 11.7621 11.7621C11.6349 11.8893 11.5713 12.04 11.5713 12.2141V16.071C11.5713 16.2451 11.6349 16.3957 11.7621 16.5229C11.8893 16.6502 12.04 16.7138 12.2141 16.7138H16.071Z"} fill={"currentColor"} />
    </svg>
)

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
            <ToolbarRadioButton name={"layout"} value={TLayout.cards} icon={<CardsIcon/>}/>
            <ToolbarRadioButton name={"layout"} value={TLayout.table} icon={<AppsList24Regular/>}/>
        </ToolbarRadioGroup>
    </Toolbar>
)

type ApisTableInfoProps = {
    // apis: TApisData,
    layout: TLayout,
    setLayout: React.Dispatch<React.SetStateAction<TLayout>>
    pattern: string | undefined,
    setPattern: React.Dispatch<React.SetStateAction<string | undefined>>
    setGroupByTag?: React.Dispatch<React.SetStateAction<boolean>>
    allowViewSwitching: boolean,
    defaultGroupByTagToEnabled?: boolean,
}

export const TableListInfo = ({layout, setLayout, pattern, setPattern, setGroupByTag, allowViewSwitching, defaultGroupByTagToEnabled}: ApisTableInfoProps) => (
    <Stack horizontal horizontalAlign="space-between">
        <Stack.Item>
            <Input
                value={pattern ?? ""}
                onChange={(_, {value}) => setPattern(value)}
                contentBefore={<Search16Regular/>}
                contentAfter={<Button onClick={() => setPattern(undefined)} appearance={"transparent"}
                                      icon={<Dismiss16Regular/>}/>}
                placeholder={"Search"}
            />

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
            <Stack horizontal tokens={{childrenGap: "1rem"}}>
                {setGroupByTag && <GroupByTag setGroupByTag={setGroupByTag} defaultGroupByTagToEnabled={defaultGroupByTagToEnabled} />}
                {allowViewSwitching && <LayoutSwitchPure layout={layout} setLayout={setLayout} />}
            </Stack>
        </Stack.Item>
    </Stack>
)
