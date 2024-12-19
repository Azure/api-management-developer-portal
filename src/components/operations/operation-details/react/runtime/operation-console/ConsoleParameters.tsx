import * as React from "react";
import { useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import { Body1Strong, Button, Dropdown, Field, Input, Label, Option, Tooltip } from "@fluentui/react-components";
import { AddCircleRegular, ChevronUp20Regular, DeleteRegular } from "@fluentui/react-icons";
import { ConsoleParameter } from "../../../../../../models/console/consoleParameter";
import { getValidationMessage, getValidationState, RevealSecretButton } from "./consoleUtils";

type ConsoleParametersProps = {
    queryParameters: ConsoleParameter[];
    templateParameters?: ConsoleParameter[];
    updateParameters: (queryParameters: ConsoleParameter[], templateParameters?: ConsoleParameter[]) => void;
    isGqlConsole?: boolean;
}

export const ConsoleParameters = ({ queryParameters, templateParameters, updateParameters, isGqlConsole }: ConsoleParametersProps) => {
    const [isParametersCollapsed, setIsParametersCollapsed] = useState<boolean>(queryParameters.length === 0 && (!templateParameters || templateParameters.length === 0));
    const [queryParams, setQueryParams] = useState<ConsoleParameter[]>(queryParameters);
    const [templateParams, setTemplateParams] = useState<ConsoleParameter[]>(templateParameters);
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        setTemplateParams(templateParameters);
        setQueryParams(queryParameters);
        setIsParametersCollapsed(queryParameters.length === 0 && templateParameters?.length === 0);
    }, [queryParameters, templateParameters]);

    useEffect(() => {
        updateParameters(queryParams, templateParams);
    }, [queryParams, templateParams]);

    const addParameter = (): void => {
        const newParam = new ConsoleParameter();
        queryParams.push(newParam);
        setQueryParams([...queryParams]);
        isParametersCollapsed && setIsParametersCollapsed(false);
    }

    const removeParameter = (parameter: ConsoleParameter): void => {
        queryParams.remove(parameter);
        setQueryParams([...queryParams]);
        queryParams.length === 0 && setIsParametersCollapsed(true);
    }

    const changeQueryParameter = (parameterId: string, fieldName: string, newValue: string): void => {
        const newParameters: ConsoleParameter[] = queryParams.map(param => {
            if (param.id === parameterId) {
                fieldName === "name" ? param.name(newValue) : fieldName === "value" && param.value(newValue);
            }
            return param;
        });
        setQueryParams([...newParameters]);
    }

    const changeTemplateParameterValue = (parameterId: string, newValue: string): void => {
        const newParameters: ConsoleParameter[] = templateParams.map(param => {
            param.id === parameterId && param.value(newValue);
            return param;
        });
        setTemplateParams([...newParameters]);
    }

    const renderParameter = (parameter: ConsoleParameter, isTemplate: boolean = false) => (
        <Stack horizontal verticalAlign="center" key={parameter.id} className="param-detail">
            <div className={"param-name"}>
                {parameter.required
                    ? <Label htmlFor={`param-dropdown-${parameter.id}`} className={parameter.required ? "required" : ""}>{parameter.name()}</Label>
                    : <Input
                        type="text"
                        placeholder="Enter parameter name"
                        value={parameter.name() ?? ""}
                        onChange={(_, data) => changeQueryParameter(parameter.id, "name", data.value)}
                      />
                }
            </div>
            <div className={"param-value"}>
                <Field validationState={getValidationState(parameter)} validationMessage={getValidationMessage(parameter)}>
                {parameter.options.length > 0
                    ? <Dropdown
                        id={`param-dropdown-${parameter.id}`}
                        value={parameter.value() ?? ""}
                        selectedOptions={[parameter.value() ?? ""]}
                        placeholder={`Select ${parameter.name()} value`}
                        onOptionSelect={(_, data) =>
                            isTemplate
                                ? changeTemplateParameterValue(parameter.id, data.optionValue)
                                : changeQueryParameter(parameter.id, "value", data.optionValue)
                        }
                    >
                        {parameter.options.map(option => (
                            <Option key={option} value={option}>{option}</Option>
                        ))}
                    </Dropdown>
                    :
                    <Input
                        type={parameter.secret ? "password" : "text"}
                        placeholder="Enter parameter value"
                        value={parameter.value() ?? ""}
                        onChange={(_, data) =>
                            isTemplate
                                ? changeTemplateParameterValue(parameter.id, data.value)
                                : changeQueryParameter(parameter.id, "value", data.value)
                        }
                    />
                }
                </Field>
            </div>
            <div className={"param-remove"}>
                {(!parameter.required &&
                    <Tooltip content="Remove parameter" relationship="label">
                        <Button icon={<DeleteRegular />} appearance="subtle" onClick={() => removeParameter(parameter)} />
                    </Tooltip>) ||
                (parameter.secret &&
                    <RevealSecretButton showSecret={showPassword} onClick={() => setShowPassword(!showPassword)} ></RevealSecretButton>)
                }
            </div>
        </Stack>
    );

    if (isGqlConsole) return (
        <>
            {queryParams?.length > 0 && queryParams.map(param => renderParameter(param))}
            <Button appearance="subtle" icon={<AddCircleRegular />} onClick={() => addParameter()}>Add parameter</Button>
        </>
    );

    return (
        <div className={"operation-table"}>
            <div className={"operation-table-header"}>
                <Stack horizontal verticalAlign="center" horizontalAlign="space-between">
                    <Stack horizontal verticalAlign="center">
                        <ChevronUp20Regular
                            onClick={() => setIsParametersCollapsed(!isParametersCollapsed)}
                            className={`collapse-button${isParametersCollapsed ? " is-collapsed" : ""}`}
                        />
                        <Body1Strong>Parameters</Body1Strong>
                    </Stack>
                    <Button icon={<AddCircleRegular />} onClick={() => addParameter()}>Add parameter</Button>
                </Stack>
            </div>
            {!isParametersCollapsed && (templateParams?.length > 0 || queryParams?.length > 0) &&
                <div className={"operation-table-body-console"}>
                    {templateParams?.length > 0 && templateParams.map(param => renderParameter(param, true))}
                    {queryParams?.length > 0 && queryParams.map(param => renderParameter(param))}
                </div>
            }
        </div>
    );
}