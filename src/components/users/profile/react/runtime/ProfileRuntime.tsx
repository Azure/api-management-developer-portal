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
import { User } from "../../../../../models/user";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { UsersService } from "../../../../../services/usersService";
import { IDelegationService } from "../../../../../services/IDelegationService";
import { dispatchErrors, parseAndDispatchError } from "../../../validation-summary/utils";
import { ErrorSources } from "../../../validation-summary/constants";
import { Identity } from "../../../../../contracts/identity";
import { DelegationAction, DelegationParameters } from "../../../../../contracts/tenantSettings";
import { Utils } from "../../../../../utils";
import { fuiTheme, pageUrlChangePassword } from "../../../../../constants";
import { ProfileTable } from "./ProfileTable";

type ProfileRuntimeProps = {};
type ProfileRuntimeFCProps = ProfileRuntimeProps & {
    usersService: UsersService
    eventManager: EventManager
    router: Router
    logger: Logger
    applyDelegation(action: DelegationAction, userId: string): Promise<boolean>
};

const isBasicAccount = (identity: Identity) => identity.provider === "Basic";

const initUser = async (usersService: UsersService) => {
    await usersService.ensureSignedIn();
    const user = await usersService.getCurrentUser()
    const identity: Identity = await usersService.getCurrentUserIdWithProvider();
    return { user, isBasicAccount: isBasicAccount(identity) };
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
    const [isBasicAccount, setIsBasicAccount] = useState<boolean>();

    useEffect(() => {
        setWorking(true);
        initUser(usersService)
            .then(({ user, isBasicAccount }) => {
                setUser(user);
                setIsBasicAccount(isBasicAccount);
            })
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

        const confirmed = window.confirm(getCloseAccountWarning(isBasicAccount, user.firstName, user.lastName, user.email));
        if (confirmed) {
            await usersService.deleteUser(user.id);
        }
    };

    const delegationEdit = () => applyDelegation(DelegationAction.changeProfile, user.id);

    if (working) return <Spinner label={"Loading current user..."} labelPosition="below" size="small" />;
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
    public declare usersService: UsersService;

    @Resolve("eventManager")
    public declare eventManager: EventManager;

    @Resolve("delegationService")
    public declare delegationService: IDelegationService;

    @Resolve("routeHelper")
    public declare routeHelper: RouteHelper;

    @Resolve("router")
    public declare router: Router;

    @Resolve("logger")
    public declare logger: Logger;

    private async applyDelegation(action: DelegationAction, userId: string): Promise<boolean> {
        if (!userId) return false;

        const isDelegationEnabled = await this.delegationService.isUserRegistrationDelegationEnabled();
        if (isDelegationEnabled) {
            const userIdentifier = Utils.getResourceName("users", userId);
            const delegationParam = {};
            delegationParam[DelegationParameters.UserId] = userIdentifier;
            const delegationUrl = await this.delegationService.getUserDelegationUrl(userIdentifier, action, delegationParam);
            if (delegationUrl) {
                location.assign(delegationUrl);
            }
        }

        return isDelegationEnabled;
    }

    render() {
        return (
            <FluentProvider theme={fuiTheme}>
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
