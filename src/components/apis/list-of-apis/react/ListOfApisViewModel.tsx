import * as React from "react";
import { StyleModel } from "@paperbits/common/styles";

export class ListOfApisViewModel extends React.Component {
    public state: {
        isRedesignEnabled: boolean;
        styles: StyleModel,
        layout: string,
        layoutDefault: string,
        allowSelection: boolean,
        allowViewSwitching: boolean,
        filtersPosition: string,
        showApiType: boolean,
        defaultGroupByTagToEnabled: boolean,
        detailsPageUrl: string,
        detailsPageTarget: string
    };

    constructor(props) {
        super(props);

        this.state = {...props};
    }

    public render(): JSX.Element {
        const data = JSON.stringify(this.state);

        return this.state.isRedesignEnabled
            ? <fui-api-list-runtime props={data} ></fui-api-list-runtime>
            : this.state.layout === 'tiles'
                ? <api-list-tiles params={data}></api-list-tiles>
                    : this.state.layout === 'dropdown'
                        ? <api-list-dropdown params={data}></api-list-dropdown>
                        : <api-list params={data}></api-list>;
        }
}