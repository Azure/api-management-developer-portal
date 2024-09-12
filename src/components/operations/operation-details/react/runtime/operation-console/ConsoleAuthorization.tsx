import * as React from "react";
import { useState } from "react";
import { Stack } from "@fluentui/react";
import { Body1, Body1Strong, Button, Dropdown, Input, Label, Option, OptionGroup } from "@fluentui/react-components";
import { ChevronUp20Regular } from "@fluentui/react-icons";
import { AuthorizationServer } from "../../../../../../models/authorizationServer";

interface SubscriptionKey {
    name: string,
    value: string,
}

export interface ProductSubscriptionKeys {
    name: string,
    subscriptionKeys: SubscriptionKey[]
}

type ConsoleAuthorizationProps = {
    authorizationServers: AuthorizationServer[];
    subscriptionRequired: boolean;
    products: ProductSubscriptionKeys[];
    onGrantTypeChange: (selectedServer: AuthorizationServer, grantType: string) => void;
    authorizeWithPassword: (selectedServer: AuthorizationServer, username: string, password: string) => void;
    selectSubscriptionKey: (key: string) => void;
}

const noAuthFlow = "no-auth";

export const ConsoleAuthorization = ({
    authorizationServers,
    subscriptionRequired,
    products,
    onGrantTypeChange,
    authorizeWithPassword,
    selectSubscriptionKey
}: ConsoleAuthorizationProps) => {
    const [isAuthorizationCollapsed, setIsAuthorizationCollapsed] = useState<boolean>(false);
    const [selectedAuthorizationServer, setSelectedAuthorizationServer] = useState<AuthorizationServer>(authorizationServers[0] ?? null);
    const [selectedAuthorizationFlow, setSelectedAuthorizationFlow] = useState<string>(noAuthFlow);
    const [selectedSubscriptionKey, setSelectedSubscriptionKey] = useState(products[0]?.subscriptionKeys[0] ?? null);
    const [username, setUsername] = useState<string>("");
    const [password, setPassword] = useState<string>("");

    return (
        <div className={"operation-table"}>
            <div className={"operation-table-header"}>
                <Stack horizontal verticalAlign="center">
                    <ChevronUp20Regular
                        onClick={() => setIsAuthorizationCollapsed(!isAuthorizationCollapsed)}
                        className={`collapse-button${isAuthorizationCollapsed ? " is-collapsed" : ""}`}
                    />
                    <Body1Strong>Authorization</Body1Strong>
                </Stack>
            </div>
            {!isAuthorizationCollapsed &&
                <div className={"operation-table-body-console"}>
                    {authorizationServers.length > 0 && selectedAuthorizationServer &&
                        <>
                            <Stack className="auth-detail">
                                <Label htmlFor="auth-servers-dropdown">Authorization server</Label>
                                {authorizationServers.length === 1
                                    ? <Body1>{selectedAuthorizationServer.name}</Body1>
                                    : <Dropdown
                                            id="auth-servers-dropdown"
                                            value={selectedAuthorizationServer.name}
                                            selectedOptions={[selectedAuthorizationServer.name]}
                                            placeholder="Select authorization server"
                                            onOptionSelect={(_, data) => setSelectedAuthorizationServer(authorizationServers.find(server => server.name === data.optionValue))}
                                        >
                                        {authorizationServers.map(server => (
                                            <Option key={server.name} value={server.name}>{server.name}</Option>
                                        ))}
                                    </Dropdown>
                                }
                            </Stack>
                            <Stack className="auth-detail">
                                <Label htmlFor="auth-servers-flow-dropdown">Authorization flow</Label>
                                <Dropdown
                                    id="auth-servers-flow-dropdown"
                                    value={selectedAuthorizationFlow === noAuthFlow ? "No auth" : selectedAuthorizationFlow}
                                    selectedOptions={[selectedAuthorizationFlow ?? noAuthFlow]}
                                    placeholder="Select authorization flow"
                                    onOptionSelect={(_, data) => {
                                        setSelectedAuthorizationFlow(data.optionValue);
                                        onGrantTypeChange(selectedAuthorizationServer, data.optionValue);
                                    }}
                                >
                                    <Option value={noAuthFlow}>No auth</Option>
                                    {selectedAuthorizationServer?.grantTypes?.map(grantType => (
                                        <Option key={grantType} value={grantType}>{grantType}</Option>
                                    ))}
                                </Dropdown>
                            </Stack>
                            {selectedAuthorizationFlow === "password" &&
                                <>
                                    <Stack className="auth-detail">
                                        <Label htmlFor="auth-username">Username</Label>
                                        <Input
                                            id="auth-username"
                                            type="text"
                                            placeholder="Enter username"
                                            value={username}
                                            onChange={(_, data) => setUsername(data.value)}
                                        />
                                    </Stack>
                                    <Stack className="auth-detail" styles={{ root: { marginBottom: 24 } }}>
                                        <Label htmlFor="auth-password">Password</Label>
                                        <Input
                                            id="auth-password"
                                            type="password"
                                            placeholder="Enter password"
                                            value={password}
                                            onChange={(_, data) => setPassword(data.value)}
                                        />
                                    </Stack>
                                    <Button onClick={() => authorizeWithPassword(selectedAuthorizationServer, username, password)}>Authorize</Button>
                                </>
                            }
                        </>
                    }
                    {subscriptionRequired && (
                        (products.length > 0 && selectedSubscriptionKey)
                            ? <Stack className="auth-detail">
                                <Label htmlFor="subscription-key-dropdown">Subscription key</Label>
                                <Dropdown
                                    id="subscription-key-dropdown"
                                    value={selectedSubscriptionKey.name}
                                    selectedOptions={[selectedSubscriptionKey.value]}
                                    placeholder="Select subscription key"
                                    onOptionSelect={(_, data) => {
                                        setSelectedSubscriptionKey({ name: data.optionText, value: data.optionValue });
                                        selectSubscriptionKey(data.optionValue);
                                    }}
                                >
                                    {products.map(product => (
                                        <OptionGroup key={product.name} label={product.name}>
                                            {product.subscriptionKeys.map(key => (
                                                <Option key={key.value} value={key.value}>{key.name}</Option>
                                            ))}
                                        </OptionGroup>
                                    ))}
                                </Dropdown>
                              </Stack>
                            : <Stack className="auth-detail">
                                <Label htmlFor="subscription-key-input">Subscription key</Label>
                                <Input
                                    id="subscription-key-input"
                                    type="password"
                                    placeholder="Enter subscription key"
                                    value={selectedSubscriptionKey?.value}
                                    onChange={(_, data) => selectSubscriptionKey(data.value)}
                                />
                              </Stack>
                    )}
                </div>
            }
        </div>
    );
}