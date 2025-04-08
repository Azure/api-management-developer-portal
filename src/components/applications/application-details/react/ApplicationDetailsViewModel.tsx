import * as React from "react";
import { StyleModel } from "@paperbits/common/styles";

export class ApplicationDetailsViewModel extends React.Component {
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

        return;
        
        // return this.state.isRedesignEnabled
        //     ? <fui-application-details key={data} props={data}></fui-application-details>
        //     : <application-details params={data}></application-details>;
    }
}
