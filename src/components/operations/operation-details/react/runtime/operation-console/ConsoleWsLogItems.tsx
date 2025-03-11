import * as React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { a11yLight } from "react-syntax-highlighter/dist/esm/styles/hljs";
import {
    Body1,
    Body1Strong,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from "@fluentui/react-components";
import { ArrowDownFilled, ArrowUpFilled } from "@fluentui/react-icons";
import { ScrollableTableContainer } from "../../../../../utils/react/ScrollableTableContainer";
import { LogItem } from "./ws-utilities/websocketClient";

export const ConsoleWsLogItems = ({ wsLogItems }: { wsLogItems: LogItem[] }) => (
    <>
        {wsLogItems.length === 0
            ? <Body1 block className={"ws-output-placeholder"}>Sent and received messages will appear here. Send a payload to begin.</Body1>
            : <ScrollableTableContainer>
                <Table className={"fui-table ws-output-table"} style={{ display: "table" }}>
                    <TableHeader>
                        <TableRow className={"fui-table-headerRow"}>
                            <TableHeaderCell style={{ width: "25%" }}><Body1Strong>Time</Body1Strong></TableHeaderCell>
                            <TableHeaderCell style={{ width: "8%" }}></TableHeaderCell>
                            <TableHeaderCell><Body1Strong>Data</Body1Strong></TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {wsLogItems.map((item, index) => (
                            <TableRow key={index} className={"fui-table-body-row"}>
                                <TableCell>{item.logTime}</TableCell>
                                <TableCell>{
                                    item.logType === "SendData"
                                        ? <ArrowDownFilled className={"ws-log-send"} />
                                        : item.logType === "GetData" && <ArrowUpFilled className={"ws-log-get"} />
                                }</TableCell>
                                <TableCell>{
                                    item.logType === "SendData" || item.logType === "GetData"
                                        ? <SyntaxHighlighter language="json" style={a11yLight}>
                                            {item.logData}
                                        </SyntaxHighlighter>
                                        : item.logData
                                }</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </ScrollableTableContainer>
        }
    </>
);