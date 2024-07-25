import * as React from "react";
import { useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import { Body1, Body1Strong, Dropdown, Label, Option } from "@fluentui/react-components";
import { ChevronUp20Regular } from "@fluentui/react-icons";

type ConsoleHostsProps = {
    hostnames: string[];
    updateHostname: (hostname: string) => void;
}

export const ConsoleHosts = ({ hostnames, updateHostname }: ConsoleHostsProps) => {
    const [isHostsCollapsed, setIsHostsCollapsed] = useState<boolean>(false);
    const [selectedHostname, setSelectedHostname] = useState<string>(hostnames[0] ?? null);

    return (
        <div className={"operation-table"}>
            <div className={"operation-table-header"}>
                <Stack horizontal verticalAlign="center">
                    <ChevronUp20Regular
                        onClick={() => setIsHostsCollapsed(!isHostsCollapsed)}
                        className={`collapse-button${isHostsCollapsed ? " is-collapsed" : ""}`}
                    />
                    <Body1Strong>Hosts</Body1Strong>
                </Stack>
            </div>
            {!isHostsCollapsed &&
                <div className={"operation-table-body-console"}>
                    {hostnames.length > 0 && selectedHostname &&
                        <>
                            <Stack className="auth-detail">
                                <Label htmlFor="hostnames-dropdown">Hostname</Label>
                                {hostnames.length === 1
                                    ? <Body1>{selectedHostname}</Body1>
                                    : <Dropdown
                                            id="hostnames-dropdown"
                                            value={selectedHostname}
                                            selectedOptions={[selectedHostname]}
                                            placeholder="Select hostname"
                                            onOptionSelect={(e, data) => {
                                                setSelectedHostname(data.optionValue);
                                                updateHostname(data.optionValue);
                                            }}
                                        >
                                        {hostnames.map(hostname => (
                                            <Option key={hostname} value={hostname}>{hostname}</Option>
                                        ))}
                                    </Dropdown>
                                }
                            </Stack>
                        </>
                    }
                </div>
            }
        </div>
    );
}