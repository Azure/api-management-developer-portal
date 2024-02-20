import * as React from "react";
import {
    FluentProvider,
    webLightTheme,
    Button,
} from "@fluentui/react-components";


export class ApisListV2 extends React.Component {
    public state: any;

    constructor(props) {
        super(props);

        this.state = {
            initialCount: props.initialCount || 0
        };
    }

    public render(): JSX.Element {
        return (
            <FluentProvider theme={webLightTheme}>
                <Button>Test fluent btn</Button>
                <div style={{ width: "100%" }} dangerouslySetInnerHTML={{ __html: `<apis-list-v2-runtime props='{ "initialCount": ${this.state.initialCount} }'></apis-list-v2-runtime>` }} />
            </FluentProvider>
        );
    }
}
