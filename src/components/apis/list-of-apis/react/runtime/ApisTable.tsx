import * as React from "react";
import {
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

type Props = {
    showApiType: boolean;
    getReferenceUrl: (api: Api) => string;
};

const TableBodyApis = ({ showApiType, apis, getReferenceUrl }: Props & { apis: Api[] }) => (
    <>
        {apis?.map((api) => (
            <TableRow key={api.id}>
                <TableCell>
                    <a href={getReferenceUrl(api)} title={api.displayName}>
                        {api.displayName}
                        {!!api.apiVersion && " - " + api.apiVersion}
                    </a>
                </TableCell>
                <TableCell>
                    <TableCellLayout truncate title={api.description}>
                        {api.description}
                    </TableCellLayout>
                </TableCell>
                {showApiType && <TableCell>{api.typeName}</TableCell>}
            </TableRow>
        ))}
    </>
);

const TableBodyTags = ({ showApiType, tags, getReferenceUrl }: Props & { tags: Page<TagGroup<Api>> }) => {
    const [expanded, setExpanded] = React.useState(new Set());

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
                            <b style={{ fontWeight: 600, paddingRight: "1em" }}>
                                {tag}
                            </b>

                            <TagGroupToggleBtn expanded={expanded.has(tag)}/>
                        </TableCell>
                        <TableCell></TableCell>
                        {showApiType && <TableCell></TableCell>}
                    </TableRow>

                    {expanded.has(tag) && (
                        <TableBodyApis
                            apis={items}
                            showApiType={showApiType}
                            getReferenceUrl={getReferenceUrl}
                        />
                    )}
                </React.Fragment>
            ))}
        </>
    );
};

export const ApisTable = ({ showApiType, apis, getReferenceUrl }: Props & { apis: TApisData }) => (
    <div className={"fui-table"}>
        <Table size={"small"} aria-label={"APIs List table"}>
            <TableHeader>
                <TableRow style={{ background: "#F5F5F5" }}>
                    <TableHeaderCell>
                        <b>Name</b>
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <b>Description</b>
                    </TableHeaderCell>
                    {showApiType && (
                        <TableHeaderCell style={{ width: "8em" }}>
                            <b>Type</b>
                        </TableHeaderCell>
                    )}
                </TableRow>
            </TableHeader>

            <TableBody>
                {isApisGrouped(apis) ? (
                    <TableBodyTags
                        tags={apis}
                        showApiType={showApiType}
                        getReferenceUrl={getReferenceUrl}
                    />
                ) : (
                    <TableBodyApis
                        apis={apis.value}
                        showApiType={showApiType}
                        getReferenceUrl={getReferenceUrl}
                    />
                )}
            </TableBody>
        </Table>
    </div>
);
