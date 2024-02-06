import * as React from "react";

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
            <div className={this.state.classNames}>
                <p className="not-configured">
                    This is an example widget that is yet to be implemented. You can use it as a scaffold for your own widget.
                </p>
                <p className="not-configured">
                    Please refer to documentation to learn about <a href="https://paperbits.io/wiki/widget-anatomy">widget anatomy</a>.
                </p>

                <div style={{ height: 100 }} dangerouslySetInnerHTML={{ __html: `<apis-list-v2-runtime props='{ "initialCount": ${this.state.initialCount} }'></apis-list-v2-runtime>` }} />
            </div>
        );
    }
}
