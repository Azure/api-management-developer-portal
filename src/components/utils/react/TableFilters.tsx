import * as React from "react";
import { Stack } from "@fluentui/react";
import {
    Accordion,
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    Button,
    Checkbox,
    Link,
    Popover,
    PopoverSurface,
    PopoverTrigger,
    Subtitle2,
} from "@fluentui/react-components";
import { Filter16Regular } from "@fluentui/react-icons";

type TFilterItem = {
    value: string;
    label: string;
};

export type TFilterGroup = TFilterItem & {
    items: TFilterItem[];
    working?: boolean;
    nextPage?(): void;
};

export type TFilterActive = Record<string, string[]>;

export type TTableFilterProps = {
    filtersActive: TFilterActive;
    setFiltersActive: React.Dispatch<React.SetStateAction<TFilterActive>>;
    filtersOptions: TFilterGroup[];
    accordionProps?: React.ComponentProps<typeof Accordion>;
};

export const TableFilter = ({
    filtersActive,
    setFiltersActive,
    filtersOptions,
    accordionProps,
}: TTableFilterProps) => (
    <>
        <Subtitle2>Filter by</Subtitle2>

        <Accordion className={"fui-filterBy-container"} {...accordionProps}>
            {filtersOptions.map((filter) => (
                <AccordionItem key={filter.value} value={filter.value}>
                    <AccordionHeader expandIconPosition={"end"}>
                        <Subtitle2>{filter.label}</Subtitle2>
                    </AccordionHeader>
                    <AccordionPanel>
                        {filter.working ? <div>Loading...</div> : (
                            <Stack>
                                {filter.items.map((item) => (
                                    <Checkbox
                                        key={filter.value + item.value}
                                        value={item.value}
                                        label={item.label}
                                        checked={filtersActive[filter.value]?.includes(item.value) ?? false}
                                        onChange={(_, { checked }) => setFiltersActive((old) => ({
                                            ...old,
                                            [filter.value]: checked
                                                ? [...(old[filter.value] ?? []), item.value]
                                                : (old[filter.value] ?? []).filter((e) => e !== item.value),
                                        }))}
                                    />
                                ))}
                                {typeof filter.nextPage === "function" && (
                                    <Link onClick={() => filter.nextPage()}>
                                        Load more
                                    </Link>
                                )}
                            </Stack>
                        )}
                    </AccordionPanel>
                </AccordionItem>
            ))}
        </Accordion>
    </>
);

// export type TableFiltersButton =

export const TableFiltersButton = (props: TTableFilterProps) => (
    <Popover withArrow>
        <PopoverTrigger disableButtonEnhancement>
            <Button icon={<Filter16Regular />} title={"Open filters"} />
        </PopoverTrigger>

        <PopoverSurface tabIndex={-1}>
            <TableFilter {...props} />
        </PopoverSurface>
    </Popover>
);

export const TableFiltersSidebar = (props: TTableFilterProps) => (
    <TableFilter
        accordionProps={{
            multiple: true,
            collapsible: true,
            defaultOpenItems: props.filtersOptions.map((e) => e.value),
        }}
        {...props}
    />
);
