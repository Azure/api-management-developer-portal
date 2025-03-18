import * as React from "react";
import { StyleModel } from "@paperbits/common/styles";

export class ApplicationListViewModel extends React.Component {
    public state: {
        isRedesignEnabled: boolean;
        styles: StyleModel
    };

    constructor(props) {
        super(props);

        this.state = {...props};
    }

    public render(): JSX.Element {
        const data = JSON.stringify(this.state);
        
        return this.state.isRedesignEnabled
            ? <fui-application-list key={data} props={data}></fui-application-list>
            : <application-list params={data}></application-list>;
    }
}
