import * as React from "react";
import { useEffect, useState } from "react";
import { FluentProvider, Spinner } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";
import * as Constants from "../../../../constants";
import { UsersService } from "../../../../services";
import { RouteHelper } from "../../../../routing/routeHelper";
import { EventManager } from "@paperbits/common/events";
import { SignInForm } from "./SignInForm";

type SignInRuntimeProps = {
    delegationUrl: string
    termsEnabled: boolean
    termsOfUse: string
    isConsentRequired: boolean
}
type SignInRuntimeFCProps = SignInRuntimeProps & {
    usersService: UsersService
    eventManager: EventManager
    router: Router
    routeHelper: RouteHelper
};

const initUser = async (usersService: UsersService, redirectUrl: string) => {
    let userId: string;
    try {
        userId = await usersService.getCurrentUserId();
    } catch (error) {
        // those errors are expected
        if (error.code !== "Unauthorized" && error.code !== "ResourceNotFound") throw error;
    }

    if (userId) {
        usersService.navigateToHome();
    } else if (redirectUrl) {
        location.assign(redirectUrl);
    }
};

const ProductSubscribeRuntimeFC = ({ router, routeHelper, usersService, eventManager, delegationUrl }: SignInRuntimeFCProps) => {
    const [working, setWorking] = useState(true);

    useEffect(() => {
        setWorking(true);
        initUser(usersService, delegationUrl)
            .finally(() => setWorking(false));
    }, [usersService, delegationUrl]);

    if (working) return <Spinner label={"Loading current user"} labelPosition="below" />;

    return (
        <SignInForm router={router} eventManager={eventManager} routeHelper={routeHelper} usersService={usersService} />
    );
};

export class SignInRuntime extends React.Component<SignInRuntimeProps> {
    @Resolve("usersService")
    public usersService: UsersService;

    @Resolve("eventManager")
    public eventManager: EventManager;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    @Resolve("router")
    public router: Router;

    render() {
        return (
            <FluentProvider theme={Constants.fuiTheme}>
                <ProductSubscribeRuntimeFC
                    {...this.props}
                    usersService={this.usersService}
                    eventManager={this.eventManager}
                    routeHelper={this.routeHelper}
                    router={this.router}
                />
            </FluentProvider>
        );
    }
}
