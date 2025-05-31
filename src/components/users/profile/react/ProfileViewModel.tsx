import * as React from "react";

export class ProfileViewModel extends React.Component<any, any> {
    constructor(props) {
        super(props);

        this.state = {
            isRedesignEnabled: props.isRedesignEnabled,
            classNames: props.styles
        };
    }

    public render(): JSX.Element {
        return this.state.isRedesignEnabled
            ? <fui-profile-runtime props={JSON.stringify(this.state)} ></fui-profile-runtime>
            : <profile-runtime params={JSON.stringify(this.state)}></profile-runtime>;
    }
}