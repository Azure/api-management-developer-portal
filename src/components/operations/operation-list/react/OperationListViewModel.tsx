import { StyleModel } from "@paperbits/common/styles";
import * as React from "react";

export class OperationListViewModel extends React.Component {
    public state: {
        isRedesignEnabled: boolean;
        styles: StyleModel,
        allowSelection: boolean,
        wrapText: boolean,
        showToggleUrlPath: boolean,
        defaultShowUrlPath: boolean,
        defaultGroupByTagToEnabled: boolean,
        defaultAllGroupTagsExpanded: boolean,
        detailsPageUrl: string
    };

    constructor(props) {
        super(props);

        this.state = {...props};
    }

    public render(): JSX.Element {
        const data = JSON.stringify(this.state);
        return this.state.isRedesignEnabled
            ? <fui-operation-list key={data} props={data}></fui-operation-list>
            : <operation-list params={data}></operation-list>;
    }
}
