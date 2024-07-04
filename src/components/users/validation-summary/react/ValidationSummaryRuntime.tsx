import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import {
    FluentProvider,
    MessageBar,
    MessageBarBody,
} from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { EventManager } from "@paperbits/common/events";
import * as Constants from "../../../../constants";
import { onValidationErrors } from "../constants";
import { ValidationReport } from "../../../../contracts/validationReport";

export const selector = "fui-validation-summary";

type ValidationSummaryRuntimeProps = {};
type ValidationSummaryRuntimeFCProps = ValidationSummaryRuntimeProps & {
    eventManager: EventManager;
};

const errorGroups: Record<string, string[]> = {};

const ProductSubscribeRuntimeFC = ({
    eventManager,
}: ValidationSummaryRuntimeFCProps) => {
    const [errorMsgs, setErrorMsgs] = useState<string[]>([]);

    const showValidationSummary = useCallback((event: ValidationReport) => {
        errorGroups[event.source] = event.errors;
        const errorSum = [];
        Object.values(errorGroups).forEach((curGroup) => {
            curGroup.forEach((error) => errorSum.push(error));
        });
        setErrorMsgs(errorSum);

        document.getElementsByTagName(selector)[0]?.scrollIntoView();
    }, []);

    useEffect(() => {
        eventManager.addEventListener(onValidationErrors, showValidationSummary);
        return () => eventManager.removeEventListener(onValidationErrors, showValidationSummary);
    }, [showValidationSummary]);

    if (!errorMsgs.length) return <></>;

    return (
        <>
            {errorMsgs.map((msg) => (
                <MessageBar key={msg} intent="error" style={{ marginBottom: "1rem" }}>
                    <MessageBarBody>{msg}</MessageBarBody>
                </MessageBar>
            ))}
        </>
    );
};

export class ValidationSummaryRuntime extends React.Component<ValidationSummaryRuntimeProps> {
    @Resolve("eventManager")
    public eventManager: EventManager;

    render() {
        return (
            <FluentProvider theme={Constants.fuiTheme}>
                <ProductSubscribeRuntimeFC
                    {...this.props}
                    eventManager={this.eventManager}
                />
            </FluentProvider>
        );
    }
}
