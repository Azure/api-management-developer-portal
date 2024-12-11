import * as React from "react";
import { Stack } from "@fluentui/react";
import {
    Accordion,
    AccordionHeader,
    AccordionItem,
    AccordionPanel,
    Body1,
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
    id: string;
    name: string;
};

export type TFilterGroup = TFilterItem & {
    items: TFilterItem[];
    working?: boolean;
    nextPage?(): void;
};

export type TFilterActive = Record<string, TFilterItem[]>;

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
}: TTableFilterProps) => {
    const FilterGroup = ({ filter }: { filter: TFilterGroup }) =>
        filter.working ? (
            <div>Loading...</div>
        ) : (
            <Stack>
                {filter.items.map((item) => (
                    <Checkbox
                        key={filter.id + item.id}
                        value={item.id}
                        label={item.name}
                        checked={filtersActive[filter.id]?.includes(item) ?? false}
                        onChange={(_, { checked }) =>
                            setFiltersActive((old) => ({
                                ...old,
                                [filter.id]:
                                    checked ?
                                        [...(old[filter.id] ?? []), item]
                                        :
                                        (old[filter.id] ?? []).filter((e) => e.id !== item.id),
                            }))
                        }
                    />
                ))}

                {typeof filter.nextPage === "function" && (
                    <Link onClick={() => filter.nextPage()}>Load more</Link>
                )}
            </Stack>
        );

    if (filtersOptions.length === 0) return <Body1 block className={"tags-no-results"}>No items found</Body1>; // should never happen

    return filtersOptions.length > 1 ? (
        <>
            <Subtitle2>Filter by</Subtitle2>

            <Accordion className={"fui-filterBy-container"} {...accordionProps}>
                {filtersOptions.map((filter) => (
                    <AccordionItem key={filter.id} value={filter}>
                        <AccordionHeader expandIconPosition={"end"}>
                            <Subtitle2>{filter.name}</Subtitle2>
                        </AccordionHeader>
                        <AccordionPanel>
                            <FilterGroup filter={filter} />
                        </AccordionPanel>
                    </AccordionItem>
                ))}
            </Accordion>
        </>
    ) : (
        <>
            <Subtitle2 style={{ display: "block", marginBottom: ".375rem" }}>Filter by {filtersOptions[0].name}</Subtitle2>

            <FilterGroup filter={filtersOptions[0]} />
        </>
    );
}

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
            defaultOpenItems: props.filtersOptions.map((e) => e.id),
        }}
        {...props}
    />
);
