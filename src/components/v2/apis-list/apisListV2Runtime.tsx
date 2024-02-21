import * as React from "react";
import {
    Button,
    FluentProvider,
    Table, TableBody, TableCell, TableCellLayout,
    TableHeader,
    TableHeaderCell,
    TableRow,
    webLightTheme
} from "@fluentui/react-components";
import { Link } from "@fluentui/react";
import { Resolve } from "@paperbits/react/decorators";
import { ApiService } from "../../../services/apiService";

const columns = [
    {columnKey: "name", label: "Name"},
    {columnKey: "description", label: "Description"},
    {columnKey: "type", label: "Type"},
]

const apis = [{id: 123, label: "Echo", description: "Foo"} as const]

export interface ApisListV2State {
    clickCount: number;
}

export class ApisListV2Runtime extends React.Component {
    @Resolve('apiService')
    public apiService: ApiService;

    public state: ApisListV2State;

    constructor(props) {
        super(props);

        console.log({props})

        this.state = {
            clickCount: props.initialCount || 0
        };

        this.increaseCount = this.increaseCount.bind(this);
    }

    public increaseCount(): void {
        this.setState({ clickCount: this.state.clickCount + 1 });
    }

    public render(): JSX.Element {
        console.log(this.apiService.getApis().then(console.log))

        return (
            <FluentProvider theme={webLightTheme}>
                <Table size={"small"} aria-label={"APIs List table"}>
                    <TableHeader>
                        <TableRow>
                            {columns.map(column => (
                                <TableHeaderCell key={column.columnKey}>
                                    <b>{column.label}</b>
                                </TableHeaderCell>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {apis.map(api => (
                            <TableRow key={api.id}>
                                <TableCell>
                                    <a href={"detail/" + api.id + window.location.search}>
                                        {api.label}
                                    </a>
                                </TableCell>
                                <TableCell>
                                    <TableCellLayout truncate title={api.description}>
                                        {api.description}
                                    </TableCellLayout>
                                </TableCell>
                                <TableCell>TODO</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </FluentProvider>
        );
    }
}
