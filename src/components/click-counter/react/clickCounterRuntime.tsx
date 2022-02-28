import * as React from "react";
import { RuntimeComponent } from "@paperbits/react/decorators";
import { widgetRuntimeSelector } from "../constants";

export interface TClickCounterRuntimeProps {
  initialCount: number;
  eventManager?: any;
}

export interface ClickCounterState {
  initialCount: number;
  clickCount?: number;
}

window.customElements.define("test-element",
  class extends HTMLElement {
    private readonly myTitle: string;

    constructor() {
      super();
      this.innerHTML = `<h1>Loading</h1>`;

      this.myTitle = this.getAttribute("myTitle");
    }

    public connectedCallback(): void {
      this.initShadowDOM();
    }

    get template(): string {
      return `<span>${this.myTitle}</span>`;
    }

    private initShadowDOM(): void {
      const shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.innerHTML = this.template;
    }
  }
);

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
    return { ...state, initialCount: props.initialCount };
  }

  public increaseCount(): void {
    this.setState({ clickCount: 1 + (this.state.clickCount ?? this.state.initialCount) });
  }

  public render(): JSX.Element {
    return (
      <div className="text text-align-center">
        <button className="button" onClick={this.increaseCount}>
          <div dangerouslySetInnerHTML={{ __html: "<test-element myTitle='Click me!'></test-element>" }} />
        </button>
        <div>
          <label htmlFor="clickCount">Click count:</label>
          <b id="clickCount">{this.state.clickCount ?? this.state.initialCount}</b>

          {(this.state.clickCount ?? this.state.initialCount) % 2 ? (
            <div dangerouslySetInnerHTML={{ __html: "<test-element myTitle='odd'></test-element>" }} />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: "<test-element myTitle='even'></test-element>" }} />
          )}
        </div>
      </div>
    );
  }
}
