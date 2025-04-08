import * as React from "react";
import { useEffect, useState } from "react";
import { FluentProvider, Spinner } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";
import { EventManager } from "@paperbits/common/events";
import { Logger } from "@paperbits/common/logging";
import { Subscription } from "../../../../../models/subscription";
import { DelegationAction, DelegationParameters } from "../../../../../contracts/tenantSettings";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { UsersService } from "../../../../../services/usersService";
import { ProductService } from "../../../../../services/productService";
import { IDelegationService } from "../../../../../services/IDelegationService";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { Utils } from "../../../../../utils";
import { dispatchErrors, parseAndDispatchError } from "../../../validation-summary/utils";
import { ErrorSources } from "../../../validation-summary/constants";
import { defaultPageSize, fuiTheme } from "../../../../../constants";
import { SubscriptionsTable } from "./SubscriptionsTable";

type SubscriptionsRuntimeProps = {};
type SubscriptionsRuntimeFCProps = SubscriptionsRuntimeProps & {
    usersService: UsersService
    productService: ProductService
    eventManager: EventManager
    router: Router
    logger: Logger
    applyDelegation(subscriptionId: string): Promise<boolean>
};

const initSubscriptions = async (usersService: UsersService, productService: ProductService, eventManager: EventManager, pageNumber: number) => {
    const userId = await usersService.ensureSignedIn();

    try {
        const query: SearchQuery = {
            skip: (pageNumber - 1) * defaultPageSize,
            take: defaultPageSize
        };

        const subscriptionsPage = await productService.getUserSubscriptionsWithProductName(userId, query);

        return subscriptionsPage.value;
    } catch (error) {
        throw new Error(`Unable to load subscriptions. Error: ${error.message}`);
    }
};

const replaceSub = (subscriptionId: string, updated: Subscription) => (prev: Subscription[]): Subscription[] => {
    const next = [...prev];
    const index = next.findIndex((item) => item.id === subscriptionId);
    updated.productName = next[index].productName;
    next[index] = updated;
    return next;
}

const SubscriptionsRuntimeFC = ({
    usersService,
    productService,
    eventManager,
    router,
    logger,
    applyDelegation,
}: SubscriptionsRuntimeFCProps) => {
    const [working, setWorking] = useState(true);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>();

    useEffect(() => {
        setWorking(true);
        initSubscriptions(usersService, productService, eventManager, 1)
            .then((value) => setSubscriptions(value))
            .finally(() => setWorking(false));
    }, [usersService, productService, eventManager]);

    const saveName = async (subscriptionId: string, editName: string): Promise<void> => {
        dispatchErrors(eventManager, ErrorSources.renameSubscription, []);
        try {
            const updated = await productService.renameSubscription(subscriptionId, editName);
            setSubscriptions(replaceSub(subscriptionId, updated));
        } catch (error) {
            parseAndDispatchError(eventManager, ErrorSources.renameSubscription, error, logger);
        }
    }

    const cancelSubscription = async (subscriptionId: string): Promise<void> => {
        try {
            if (await applyDelegation(subscriptionId)) return;

            const updated = await productService.cancelSubscription(subscriptionId);
            setSubscriptions(replaceSub(subscriptionId, updated));
        } catch (error) {
            if (error.code === "Unauthorized") {
                usersService.navigateToSignin();
                return;
            }

            parseAndDispatchError(eventManager, ErrorSources.cancelSubscription, error, logger);
        }
    }

    const regeneratePKey = async (subscriptionId: string): Promise<void> => {
        dispatchErrors(eventManager, ErrorSources.regeneratePKey, []);
        try {
            const updated = await productService.regeneratePrimaryKey(subscriptionId);
            setSubscriptions(replaceSub(subscriptionId, updated));
        } catch (error) {
            parseAndDispatchError(eventManager, ErrorSources.regeneratePKey, error, logger);
        }
    }

    const regenerateSKey = async (subscriptionId: string): Promise<void> => {
        dispatchErrors(eventManager, ErrorSources.regenerateSKey, []);
        try {
            const updated = await productService.regenerateSecondaryKey(subscriptionId);
            setSubscriptions(replaceSub(subscriptionId, updated));
        } catch (error) {
            parseAndDispatchError(eventManager, ErrorSources.regenerateSKey, error, logger);
        }
    }

    if (working) return <Spinner label={"Loading your subscriptions..."} labelPosition="below" size="small" />;
    if (!subscriptions) return <>Subscriptions not found</>;

    return (
        <SubscriptionsTable
            subscriptions={subscriptions}
            saveName={saveName}
            cancelSubscription={cancelSubscription}
            regeneratePKey={regeneratePKey}
            regenerateSKey={regenerateSKey}
        />
    );
};

export class SubscriptionsRuntime extends React.Component<SubscriptionsRuntimeProps> {
    @Resolve("usersService")
    public usersService: UsersService;

    @Resolve("productService")
    public productService: ProductService;

    @Resolve("eventManager")
    public eventManager: EventManager;

    @Resolve("delegationService")
    public delegationService: IDelegationService;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    @Resolve("router")
    public router: Router;

    @Resolve("logger")
    public logger: Logger;

    private async applyDelegation(subscriptionId: string): Promise<boolean> {
        const isDelegationEnabled = await this.delegationService.isSubscriptionDelegationEnabled();
        if (isDelegationEnabled) {
            const userResource = await this.usersService.getCurrentUserId();
            const userId = Utils.getResourceName("users", userResource);
            const delegationParam = {};
            delegationParam[DelegationParameters.UserId] = userId;
            delegationParam[DelegationParameters.SubscriptionId] = Utils.isArmUrl(subscriptionId) ? Utils.getResourceName("subscriptions", subscriptionId) : subscriptionId;
            const delegationUrl = await this.delegationService.getUserDelegationUrl(userId, DelegationAction.unsubscribe, delegationParam);
            if (delegationUrl) {
                location.assign(delegationUrl);
            }
        }
        return isDelegationEnabled;
    }

    render() {
        return (
            <FluentProvider theme={fuiTheme}>
                <SubscriptionsRuntimeFC
                    {...this.props}
                    usersService={this.usersService}
                    productService={this.productService}
                    eventManager={this.eventManager}
                    router={this.router}
                    logger={this.logger}
                    applyDelegation={this.applyDelegation.bind(this)}
                />
            </FluentProvider>
        );
    }
}
