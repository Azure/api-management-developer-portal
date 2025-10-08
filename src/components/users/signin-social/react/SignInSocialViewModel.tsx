import * as React from "react";
import { StyleModel } from "@paperbits/common/styles";
import { SecurityModel } from "@paperbits/common/security";
import { Resolve } from "@paperbits/react/decorators";
import { BuiltInRoles, UserService } from "@paperbits/common/user";
import { EventManager, Events } from "@paperbits/common/events";

interface ComponentProps {
    isRedesignEnabled: boolean;
    styles: StyleModel;
    security: SecurityModel;
    aadConfig: string;
    aadB2CConfig: string;
    mode: string;
    visible: boolean;
    roles?: string;
}

interface ComponentState extends ComponentProps {}

export class SignInSocialViewModel extends React.Component<
    ComponentProps,
    ComponentState
> {
    @Resolve("userService")
    public declare userService: UserService;

    @Resolve("eventManager")
    public declare eventManager: EventManager;

    constructor(props) {
        super(props);

        this.applyVisibility = this.applyVisibility.bind(this);

        this.state = {
            isRedesignEnabled: props.isRedesignEnabled,
            styles: props.styles,
            security: props.security,
            aadConfig: props.aadConfig,
            aadB2CConfig: props.aadB2CConfig,
            mode: props.mode,
            visible: true,
        };
    }

    public async applyVisibility(): Promise<void> {
        const securitySettings: any = this.state.security;

        const widgetRolesArray = securitySettings?.roles || [
            BuiltInRoles.everyone.key,
        ];

        const userRoles = await this.userService.getUserRoles();

        const visibleToUser =
            userRoles.some((x) => widgetRolesArray.includes(x)) ||
            widgetRolesArray.includes(BuiltInRoles.everyone.key);

        this.setState({ visible: visibleToUser });
    }

    public componentDidMount(): void {
        this.eventManager.addEventListener(
            Events.UserRoleChanged,
            this.applyVisibility
        );
    }

    public render(): JSX.Element {
        if (
            !this.state.aadB2CConfig &&
            !this.state.aadConfig &&
            this.state.mode !== "publishing"
        ) {
            return;
            <placeholder-content>
                <div className="not-configured">
                    This widget will display a sign-up form when you configure{" "}
                    <a href="https://aka.ms/apim-how-to-aad" target="_blank">
                        Microsoft Entra ID
                    </a>{" "}
                    or{" "}
                    <a href="https://aka.ms/apim-how-to-aadb2c" target="_blank">
                        Azure Active Directory B2C
                    </a>{" "}
                    integration in your API Management service. This message
                    appears only in the portal's administrative mode and the
                    widget will be rendered as an empty space in the published
                    portal, so you don't need to remove it.
                </div>
            </placeholder-content>;
        }

        const aadConfig = JSON.stringify(this.state.aadConfig);
        const aadB2CConfig = JSON.stringify(this.state.aadB2CConfig);
        const classNames = ["flex", this.state.visible ? "" : "hidden"].join(
            " "
        );

        if (this.state.isRedesignEnabled) {
            return (
                <div className={classNames} data-role={this.state.roles}>
                    {this.state.aadConfig && (
                        <fui-signin-aad-runtime
                            key={aadConfig}
                            props={aadConfig}
                        ></fui-signin-aad-runtime>
                    )}
                    {this.state.aadB2CConfig && (
                        <fui-signin-aadb2c-runtime
                            key={aadB2CConfig}
                            props={aadB2CConfig}
                        ></fui-signin-aadb2c-runtime>
                    )}
                </div>
            );
        }
        return (
            <div className={classNames} data-role={this.state.roles}>
                {this.state.aadConfig && (
                    <signin-aad params={aadConfig}></signin-aad>
                )}
                {this.state.aadB2CConfig && (
                    <signin-aad-b2c params={aadB2CConfig}></signin-aad-b2c>
                )}
            </div>
        );
    }
}
