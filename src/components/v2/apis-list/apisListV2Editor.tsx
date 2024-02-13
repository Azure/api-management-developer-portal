import * as React from "react";

export class ApisListV2Editor extends React.Component {
    public state: any;
    private onChange: any;
    private model: any;

    constructor(props) {
        super(props);

        this.onChange = props.onChange;
        this.model = props.model;

        this.onPropertyChange = this.onPropertyChange.bind(this);

        this.state = {
            initialCount: this.model.initialCount
        };
    }

    public onPropertyChange(event: any): void {
        const fieldName = event.target.name;
        const fieldValue = parseInt(event.target.value);

        this.model[fieldName] = fieldValue;
        this.setState({ [fieldName]: fieldValue });

        if (this.onChange) {
            this.onChange(this.model);
        }
    }

    public render(): JSX.Element {
        return (
            <div>
                <div id="basicCollapse" className="collapse form-group-collapse">
                    <div className="form-group">
                        <label htmlFor="initialCount" className="form-label">Initial count</label>
                        <input name="initialCount" type="number" className="form-control" min="0" value={this.state.initialCount} onChange={this.onPropertyChange} />
                    </div>
                </div>
            </div>
        );
    }
}
