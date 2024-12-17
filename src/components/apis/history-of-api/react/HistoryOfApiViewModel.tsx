import * as React from "react";
import { StyleModel } from "@paperbits/common/styles";

export class HistoryOfApiViewModel extends React.Component {
    public state: {
        isRedesignEnabled: boolean;
        styles: StyleModel;
        detailsPageUrl: string;
    };

    constructor(props) {
        super(props);

        this.state = {
            isRedesignEnabled: props.isRedesignEnabled,
            styles: props.styles,
            detailsPageUrl: props.detailsPageUrl
        };
    }

    public render(): JSX.Element {
        const data = JSON.stringify(this.state);
        return this.state.isRedesignEnabled
            ? <fui-api-history key={data} props={data}></fui-api-history>
            : <api-history params={data}></api-history>;
    }
}