import * as React from "react";
import { StyleModel } from "@paperbits/common/styles";

interface ComponentProps {
    isRedesignEnabled: boolean;
    styles: StyleModel;
    changeLogPageUrl: string;
}

interface ComponentState extends ComponentProps { }

export class DetailsOfApiViewModel extends React.Component<ComponentProps, ComponentState> {
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