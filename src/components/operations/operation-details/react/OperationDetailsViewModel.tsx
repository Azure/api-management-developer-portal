import * as React from "react";
import { LocalStyles } from "@paperbits/common/styles";

export class OperationDetailsViewModel extends React.Component {
    public state: {
        isRedesignEnabled: boolean;
        styles: LocalStyles,
        enableConsole: boolean,
        useCorsProxy: boolean,
        includeAllHostnames: boolean,
        enableScrollTo: boolean,
        showExamples: boolean,
        defaultSchemaView: string
    };

    constructor(props) {
        super(props);

        this.state = {...props};
    }

    public render(): JSX.Element {
        const data = JSON.stringify(this.state);

        return this.state.isRedesignEnabled
            ? <fui-operation-details props={data} ></fui-operation-details>
            : <operation-details params={data}></operation-details>;
    }
}