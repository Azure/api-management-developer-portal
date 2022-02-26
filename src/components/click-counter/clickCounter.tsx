import * as React from "react";
import { ClickCounterRuntime } from "./clickCounterRuntime";

interface TProps {
  eventManager: any;
  initialCount: number;
}

interface TState {
  classNames: string;
  initialCount: number;
}

export class ClickCounter extends React.Component<TProps, TState> {
  constructor(props: TProps) {
    super(props);

    this.state = {
      initialCount: props.initialCount,
      classNames: "",
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

        direct
        <div style={{ height: 100 }}>
          {console.log(this.state.initialCount)}
          <ClickCounterRuntime initialCount={this.state.initialCount} eventManager={this.props.eventManager} />
        </div>

        dangerously Set Inner HTML
        <div style={{ height: 100 }}
             dangerouslySetInnerHTML={{
               __html: `<click-counter-runtime props='{ "initialCount": ${this.state.initialCount} }'></click-counter-runtime>`
             }} />
      </div>
    );
  }
}
