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

export const ApisTable = ({showApiType, apis, getReferenceUrl}) => (
  <div className={"fui-table"}>
    <Table size={"small"} aria-label={"APIs List table"}>
      <TableHeader>
        <TableRow>
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
        {apis?.value?.map((api) => (
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
      </TableBody>
    </Table>
  </div>
);
