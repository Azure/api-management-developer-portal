import * as React from "react";
import { LocalStyles } from "@paperbits/common/styles";

interface ComponentProps {
    isRedesignEnabled: boolean;
    styles: LocalStyles,
    enableConsole: boolean,
    useCorsProxy: boolean,
    includeAllHostnames: boolean,
    enableScrollTo: boolean,
    showExamples: boolean,
    defaultSchemaView: string
}

interface ComponentState extends ComponentProps { }

export class OperationDetailsViewModel extends React.Component<ComponentProps, ComponentState> {
    constructor(props) {
        super(props);

        this.state = { ...props };
    }

    public render(): JSX.Element {
        const data = JSON.stringify(this.state);

        return this.state.isRedesignEnabled
            ? <fui-operation-details key={data} props={data} ></fui-operation-details>
            : <operation-details params={data}></operation-details>;
    }
}