import * as React from "react";
import { useState } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from "@fluentui/react-components";
import {
    isApisGrouped,
    TagGroupToggleBtn,
    TApisData,
    toggleValueInSet,
} from "./utils";
import { Api } from "../models/api";
import { Page } from "../models/page";
import { TagGroup } from "../models/tagGroup";
import { NoRecordsRow } from "../utils/NoRecordsRow";
import { markdownMaxCharsMap } from "../constants";
import { MarkdownProcessor } from "../utils/MarkdownProcessor";

type Props = {
    showApiType: boolean;
    getReferenceUrl: (apiName: string) => string;
    detailsPageTarget: string;
};

const TableBodyApis = ({ showApiType, apis, getReferenceUrl, detailsPageTarget }: Props & { apis: Api[] }) => (
    <>
        {apis?.length > 0
            ? apis.map((api) => (
                <TableRow key={api.id}>
                    <TableCell>
                        <a href={getReferenceUrl(api.name)} target={detailsPageTarget} title={api.displayName}>
                            {api.displayName}
                            {/* {!!api.apiVersion && " - " + api.apiVersion} */}
                        </a>
                    </TableCell>
                    <TableCell style={{padding: ".5rem 0"}}>
                        <MarkdownProcessor markdownToDisplay={api.description} maxChars={markdownMaxCharsMap.table} />
                    </TableCell>
                    <TableCell>{api.type}</TableCell>
                </TableRow>
            ))
            : <NoRecordsRow colspan={showApiType ? 3 : 2} customText="No APIs to display" />
        }
    </>
);

const TableBodyTags = ({ tags, ...props }: Props & { tags: Page<TagGroup<Api>> }) => {
    const [expanded, setExpanded] = useState(new Set());

    return (
        <>
            {tags?.value?.map(({ tag, items }) => (
                <React.Fragment key={tag}>
                    <TableRow
                        className={"fui-table-collapsibleRow"}
                        onClick={() =>
                            setExpanded((old) => toggleValueInSet(old, tag))
                        }
                    >
                        <TableCell>
                            <button className={"no-border align-center"}>
                                <span className="strong" style={{ marginRight: ".375rem" }}>
                                    {tag}
                                </span>

                                <TagGroupToggleBtn
                                    expanded={expanded.has(tag)}
                                />
                            </button>
                        </TableCell>
                        {/* in lines with tag, no content to display but empty cells needed to match width */}
                        <TableCell></TableCell>
                        {props.showApiType && <TableCell></TableCell>}
                    </TableRow>

                    {expanded.has(tag) && (
                        <TableBodyApis {...props} apis={items} />
                    )}
                </React.Fragment>
            ))}
        </>
    );
};

export const ApisTable = ({ apis, ...props }: Props & { apis: TApisData }) => (
    <Table className={"fui-table"} size={"small"} aria-label={"APIs List table"}>
        <TableHeader>
            <TableRow className={"fui-table-headerRow"}>
                <TableHeaderCell>
                    <span className="strong">Name</span>
                </TableHeaderCell>
                <TableHeaderCell>
                    <span className="strong">Description</span>
                </TableHeaderCell>
                {props.showApiType && (
                    <TableHeaderCell style={{ width: "8em" }}>
                        <span className="strong">Type</span>
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
);
