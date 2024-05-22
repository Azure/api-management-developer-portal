import * as React from "react";
import {
    Body1Strong,
    Link,
    Table,
    TableBody,
    TableCell,
    TableCellLayout,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from "@fluentui/react-components";
import { Api } from "../../../../../models/api";
import { Page } from "../../../../../models/page";
import { TagGroup } from "../../../../../models/tagGroup";
import { isApisGrouped, toggleValueInSet, TagGroupToggleBtn, TApisData } from "./utils";
import { MarkdownProcessor } from "../../../../react-markdown/MarkdownProcessor";
import { markdownMaxCharsMap } from "../../../../../constants";

type Props = {
    showApiType: boolean;
    getReferenceUrl: (api: Api) => string;
    detailsPageTarget: string;
};

const TableBodyApis = ({ showApiType, apis, getReferenceUrl, detailsPageTarget }: Props & { apis: Api[] }) => (
    <>
        {apis?.map((api) => (
            <TableRow key={api.id}>
                <TableCell>
                    <Link href={getReferenceUrl(api)} target={detailsPageTarget} title={api.displayName}>
                        {api.displayName}
                        {!!api.apiVersion && " - " + api.apiVersion}
                    </Link>
                </TableCell>
                <TableCell style={{padding: ".5rem 0"}}>
                    <MarkdownProcessor markdownToDisplay={api.description} maxChars={markdownMaxCharsMap.table} />
                </TableCell>
                {showApiType && <TableCell>{api.typeName}</TableCell>}
            </TableRow>
        ))}
    </>
);

const TableBodyTags = ({ tags, ...props }: Props & { tags: Page<TagGroup<Api>> }) => {
    const [expanded, setExpanded] = React.useState(new Set());

    return (
        <>
            {tags?.value?.map(({ tag, items }) => (
                <React.Fragment key={tag}>
                    <TableRow
                        className={"fui-table-collapsibleRow"}
                        onClick={() => setExpanded((old) => toggleValueInSet(old, tag))}
                    >
                        <TableCell>
                            <Body1Strong>
                                {tag}
                            </Body1Strong>

                            <TagGroupToggleBtn expanded={expanded.has(tag)}/>
                        </TableCell>
                        <TableCell></TableCell>
                        {props.showApiType && <TableCell></TableCell>}
                    </TableRow>

                    {expanded.has(tag) && (
                        <TableBodyApis
                            {...props}
                            apis={items}
                        />
                    )}
                </React.Fragment>
            ))}
        </>
    );
};

export const ApisTable = ({ apis, ...props }: Props & { apis: TApisData }) => (
    <div className={"fui-table"}>
        <Table size={"small"} aria-label={"APIs List table"}>
            <TableHeader>
                <TableRow className={"fui-table-headerRow"}>
                    <TableHeaderCell>
                        <Body1Strong>Name</Body1Strong>
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <Body1Strong>Description</Body1Strong>
                    </TableHeaderCell>
                    {props.showApiType && (
                        <TableHeaderCell style={{ width: "8em" }}>
                            <Body1Strong>Type</Body1Strong>
                        </TableHeaderCell>
                    )}
                </TableRow>
            </TableHeader>

            <TableBody>
                {isApisGrouped(apis) ? (
                    <TableBodyTags
                        {...props}
                        tags={apis}
                    />
                ) : (
                    <TableBodyApis
                        {...props}
                        apis={apis.value}
                    />
                )}
            </TableBody>
        </Table>
    </div>
);
