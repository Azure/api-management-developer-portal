import * as React from "react";
import { StyleModel } from "@paperbits/common/styles";

export class ApiDetailsViewModel extends React.Component {
    public state: {
        isRedesignEnabled: boolean;
        styles: StyleModel;
        changeLogPageUrl: string;
    };

    constructor(props) {
        super(props);

        this.state = {
            isRedesignEnabled: props.isRedesignEnabled,
            styles: props.styles,
            changeLogPageUrl: props.changeLogPageUrl
        };
    }

    public render(): JSX.Element {
        const data = JSON.stringify(this.state);
        return this.state.isRedesignEnabled
            ? <fui-api-details key={data} props={data}></fui-api-details>
            : <api-details params={data}></api-details>;
    }
}