import * as React from "react";
import { SignupModel } from "../signupModel";

export class SignUpEditor extends React.Component<any, any> {
    private onChange: any;
    private model: SignupModel;

    constructor(props) {
        super(props);

        this.onChange = props.onChange;
        this.model = props.model;

        this.onPropertyChange = this.onPropertyChange.bind(this);

        this.state = {
            requireHipCaptcha: this.model.requireHipCaptcha
        };
    }

    public onPropertyChange(event: any): void {
        this.model.requireHipCaptcha = event.target.checked;
        this.setState({ requireHipCaptcha: this.model.requireHipCaptcha });

        if (this.onChange) {
            this.onChange(this.model);
        }
    }

    public render(): JSX.Element {
        return (
            <fieldset className="form flex-item flex-item-grow">
                <div className="form-group">
                    <label htmlFor="requireHipCaptcha" className="form-label">
                        <input type="checkbox" id="requireHipCaptcha" checked={this.state.requireHipCaptcha} onChange={this.onPropertyChange} /> Require HipCaptcha on submit
                    </label>
                </div>
            </fieldset>
        );
    }
}