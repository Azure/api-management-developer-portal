import * as React from "react";
import { useEffect, useState } from "react";
import {
    FluentProvider,
    Spinner,
} from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";
import { EventManager } from "@paperbits/common/events";
import { Logger } from "@paperbits/common/logging";
import * as Constants from "../../../../constants";
import { User } from "../../../../models/user";
import { UsersService } from "../../../../services";
import { RouteHelper } from "../../../../routing/routeHelper";
import { TenantService } from "../../../../services/tenantService";
import { BackendService } from "../../../../services/backendService";
import { ProfileTable } from "./ProfileTable";
import { dispatchErrors, parseAndDispatchError } from "../../validation-summary/utils";
import { ErrorSources } from "../../validation-summary/constants";
import { DelegationAction, DelegationParameters } from "../../../../contracts/tenantSettings";
import { Utils } from "../../../../utils";
import { pageUrlChangePassword } from "../../../../constants";

type ProfileRuntimeProps = {};
type ProfileRuntimeFCProps = ProfileRuntimeProps & {
    usersService: UsersService
    eventManager: EventManager
    router: Router
    logger: Logger
    applyDelegation(action: DelegationAction, userId: string): Promise<boolean>
};

const initUser = async (usersService: UsersService) => {
    await usersService.ensureSignedIn();
    return usersService.getCurrentUser();
};

const getCloseAccountWarning = (isBasicAccount: boolean, firstName: string, lastName: string, email: string): string => (
    `Dear ${firstName} ${lastName}, \nYou are about to close your account associated with email address ${email}.\n${isBasicAccount ? "You will not be able to sign in to or restore your closed account. " : ""}Are you sure you want to close your account?`
);

const ProfileRuntimeFC = ({
    usersService,
    eventManager,
    router,
    logger,
    applyDelegation,
}: ProfileRuntimeFCProps) => {
    const [working, setWorking] = useState(true);
    const [user, setUser] = useState<User>();

    useEffect(() => {
        setWorking(true);
        initUser(usersService)
            .then((value) => setUser(value))
            .finally(() => setWorking(false));
    }, [usersService]);

    const save = async (firstName: string, lastName: string) => {
        dispatchErrors(eventManager, ErrorSources.changeProfile, []);
        try {
            const userNew = await usersService.updateUser(user.id, firstName, lastName);
            setUser(userNew);
        } catch (error) {
            parseAndDispatchError(eventManager, ErrorSources.changeProfile, error, logger);
        }
    };

    const changePassword = async () => {
        const isDelegationEnabled = await applyDelegation(DelegationAction.changePassword, user.id);
        if (isDelegationEnabled) return;

        await router.navigateTo(pageUrlChangePassword);
    };

    const deleteAccount = async () => {
        const isDelegationEnabled = await applyDelegation(DelegationAction.closeAccount, user.id);
        if (isDelegationEnabled) return;

        const confirmed = window.confirm(getCloseAccountWarning(user.isBasicAccount, user.firstName, user.lastName, user.email));
        if (confirmed) {
            await usersService.deleteUser(user.id);
        }
    };

    const delegationEdit = () => applyDelegation(DelegationAction.changeProfile, user.id);

    if (working) return <Spinner label={"Loading current user"} labelPosition="below" />;
    if (!user) return <>User not found</>;

    return (
        <ProfileTable
            user={user}
            save={save}
            changePassword={changePassword}
            deleteAccount={deleteAccount}
            delegationEdit={delegationEdit}
        />
    );
};

export class ProfileRuntime extends React.Component<ProfileRuntimeProps> {
    @Resolve("usersService")
    public usersService: UsersService;

    @Resolve("eventManager")
    public eventManager: EventManager;

    @Resolve("tenantService")
    public tenantService: TenantService;

    @Resolve("backendService")
    public backendService: BackendService;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    @Resolve("router")
    public router: Router;

    @Resolve("logger")
    public logger: Logger;

    private async applyDelegation(action: DelegationAction, userId: string): Promise<boolean> {
        if (!userId) return false;
        const isDelegationEnabled = await this.tenantService.isDelegationEnabled();
        if (isDelegationEnabled) {
            const delegationParam = {};
            delegationParam[DelegationParameters.UserId] = Utils.getResourceName("users", userId);
            const delegationUrl = await this.backendService.getDelegationString(action, delegationParam);
            if (delegationUrl) {
                location.assign(delegationUrl);
            }
        }

        return isDelegationEnabled;
    }

    render() {
        return (
            <FluentProvider theme={Constants.fuiTheme}>
                <ProfileRuntimeFC
                    {...this.props}
                    usersService={this.usersService}
                    eventManager={this.eventManager}
                    router={this.router}
                    logger={this.logger}
                    applyDelegation={this.applyDelegation.bind(this)}
                />
            </FluentProvider>
        );
    }
}