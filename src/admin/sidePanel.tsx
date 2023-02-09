import * as React from "react";
import { Pages } from "./pages";

export class SidePanel extends React.Component {
    public render(): JSX.Element {
        return (
            <>
                <h1>
                    My side panel
                </h1>
                <Pages />
            </>
        );
    }
}