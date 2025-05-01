import * as React from "react";
import { Body1, TableCell, TableRow } from "@fluentui/react-components";
import { ArrowDownFilled, ArrowUpFilled } from "@fluentui/react-icons";
import { InfoTable, SyntaxHighlighter } from "@microsoft/api-docs-ui";
import { LogItem } from "./ws-utilities/websocketClient";

export const ConsoleWsLogItems = ({ wsLogItems }: { wsLogItems: LogItem[] }) => (
    <>
        {wsLogItems.length === 0
            ? <Body1 block className={"ws-output-placeholder"}>Sent and received messages will appear here. Send a payload to begin.</Body1>
            : <InfoTable
                title={"WebSocket log"}
                columnLabels={["Time", "", "Data"]}
                columnWidths={["25%", "8%", "67%"]}
                className={"ws-output-table"}
                children={wsLogItems.map((item, index) => (
                    <TableRow key={index} className={"fui-table-body-row"}>
                        <TableCell>{item.logTime}</TableCell>
                        <TableCell>{
                            item.logType === "SendData"
                                ? <ArrowDownFilled className={"ws-log-send"} />
                                : item.logType === "GetData" && <ArrowUpFilled className={"ws-log-get"} />
                        }</TableCell>
                        <TableCell>{
                            item.logType === "SendData" || item.logType === "GetData"
                                ? <SyntaxHighlighter language="json" children={item.logData} />
                                : item.logData
                        }</TableCell>
                    </TableRow>
                ))}
            />
        }
    </>
);