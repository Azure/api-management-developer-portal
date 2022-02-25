import * as React from "react";
import { RuntimeComponent } from "@paperbits/react/decorators";
import { widgetRuntimeSelector } from "./constants";


export interface ClickCounterState {
  clickCount: number;
}

@RuntimeComponent({ selector: widgetRuntimeSelector })
export class ClickCounterRuntime extends React.Component {
  public state: ClickCounterState;

  constructor(props: any) {
    super(props);

    this.state = {
      clickCount: props.initialCount || 0
    };

    this.increaseCount = this.increaseCount.bind(this);
  }

  public increaseCount(): void {
    this.setState({ clickCount: this.state.clickCount + 1 });
  }

  public render(): JSX.Element {
    return (
      <div className="text text-align-center">
        <button className="button" onClick={this.increaseCount}>
          Click me
        </button>
        <div>
          <label htmlFor="clickCount">Click count:</label>
          <b id="clickCount">{this.state.clickCount}</b>
        </div>
      </div>
    );
  }
}
