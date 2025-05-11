import * as React from "react";
import { LocalStyles } from "@paperbits/common/styles";

export class ReportsViewModel extends React.Component<any, any> {
    constructor(props) {
        super(props);

        this.state = {...props};
    }

    public render(): JSX.Element {
        const data = JSON.stringify(this.state);

        return this.state.isRedesignEnabled
            ? <fui-reports-runtime props={data} ></fui-reports-runtime>
            : <reports-runtime params={data}></reports-runtime>;
    }
}