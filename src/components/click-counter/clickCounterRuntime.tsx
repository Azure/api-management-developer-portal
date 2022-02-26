import * as React from "react";
import { RuntimeComponent } from "@paperbits/react/decorators";
import { widgetRuntimeSelector } from "./constants";

export interface TClickCounterRuntimeProps {
  initialCount: number;
  eventManager?: any;
}

export interface ClickCounterState {
  initialCount: number;
  clickCount?: number;
}

@RuntimeComponent({ selector: widgetRuntimeSelector })
export class ClickCounterRuntime extends React.Component<TClickCounterRuntimeProps> {
  public state: ClickCounterState;

  constructor(props: TClickCounterRuntimeProps) {
    super(props);

    this.state = {
      initialCount: props.initialCount,
      clickCount: undefined
    };

    this.increaseCount = this.increaseCount.bind(this);

    console.log({ eventManager: props.eventManager });
  }

  public componentDidMount(): void {
    window.addEventListener("resize", console.log);
  }

  public componentWillUnmount(): void {
    // cleanup
  }

  public static getDerivedStateFromProps(props: TClickCounterRuntimeProps, state: ClickCounterState): ClickCounterState {
    console.log(props, state);
    return {...state, initialCount: props.initialCount};
  }

  public increaseCount(): void {
    this.setState({ clickCount: 1 + (this.state.clickCount ?? this.state.initialCount) });
  }

  public render(): JSX.Element {
    return (
      <div className="text text-align-center">
        <button className="button" onClick={this.increaseCount}>
          Click me
        </button>
        <div>
          <label htmlFor="clickCount">Click count:</label>
          <b id="clickCount">{this.state.clickCount ?? this.state.initialCount}</b>
        </div>
      </div>
    );
  }
}
