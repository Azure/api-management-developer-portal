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

type ProfileRuntimeProps = {};
type ProfileRuntimeFCProps = ProfileRuntimeProps & {
    usersService: UsersService;
};

const initUser = async (usersService: UsersService) => {
    await usersService.ensureSignedIn();
    return usersService.getCurrentUser();
};

const ProductSubscribeRuntimeFC = ({ usersService }: ProfileRuntimeFCProps) => {
    const [working, setWorking] = useState(true);
    const [user, setUser] = useState<User>();

    useEffect(() => {
        setWorking(true);
        initUser(usersService)
            .then(value => setUser(value))
            .finally(() => setWorking(false));
    }, [usersService]);

    const save = async (firstName: string, lastName: string) => console.log({ firstName, lastName });

    const changePassword = async (newPassword: string) => alert("TODO");

    const deleteAccount = async () => alert("TODO");

    if (working) return <Spinner label={"Loading current user"} labelPosition="below" />;
    if (!user) return <>User not found</>;
    return <ProfileTable user={user} save={save} changePassword={changePassword} deleteAccount={deleteAccount} />;
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

    render() {
        return (
            <FluentProvider theme={Constants.fuiTheme}>
                <ProductSubscribeRuntimeFC
                    {...this.props}
                    usersService={this.usersService}
                />
            </FluentProvider>
        );
    }
}
