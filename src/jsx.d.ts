// React 19 / @types/react 19 moved the JSX namespace under `React.JSX` and no
// longer declares a populated global `JSX` namespace. The codebase relies on the
// legacy global `JSX` (e.g. `JSX.Element` return types), so re-expose it here.
import * as React from "react";

declare global {
    namespace JSX {
        type ElementType = React.JSX.ElementType;
        type Element = React.JSX.Element;
        type ElementClass = React.JSX.ElementClass;
        type ElementAttributesProperty = React.JSX.ElementAttributesProperty;
        type ElementChildrenAttribute = React.JSX.ElementChildrenAttribute;
        type LibraryManagedAttributes<C, P> = React.JSX.LibraryManagedAttributes<C, P>;
        type IntrinsicAttributes = React.JSX.IntrinsicAttributes;
        type IntrinsicClassAttributes<T> = React.JSX.IntrinsicClassAttributes<T>;
        interface IntrinsicElements extends React.JSX.IntrinsicElements { }
    }
}
