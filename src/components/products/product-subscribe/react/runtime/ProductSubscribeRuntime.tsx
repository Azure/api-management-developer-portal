import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { FluentProvider, Spinner } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";
import { Product } from "../../../../../models/product";
import { SubscriptionState } from "../../../../../contracts/subscription";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { UsersService } from "../../../../../services/usersService";
import { ProductService } from "../../../../../services/productService";
import { IDelegationService } from "../../../../../services/IDelegationService";
import { DelegationAction, DelegationParameters } from "../../../../../contracts/tenantSettings";
import { Utils } from "../../../../../utils";
import { fuiTheme } from "../../../../../constants";
import { ProductSubscribeForm, TSubscribe } from "./ProductSubscribeForm";

type ProductSubscribeRuntimeProps = {
    showTermsByDefault: boolean;
}
type ProductSubscribeRuntimeFCProps = ProductSubscribeRuntimeProps & {
    delegationService: IDelegationService;
    usersService: UsersService;
    productService: ProductService;
    productName: string;
};

const loadProduct = async (usersService: UsersService, delegationService: IDelegationService, productService: ProductService, productName: string) => {
    const promises = [
        await delegationService.isSubscriptionDelegationEnabled(),
        await productService.getProduct(`products/${productName}`),
        await usersService.getCurrentUserId(),
    ] as const;
    const [isDelegationEnabled, product, userId] = await Promise.all(promises);

    let isLimitReached = false;
    if (userId && product) {
        const subscriptions = await productService.getSubscriptionsForProduct(userId, product.id);
        const activeSubscriptions = subscriptions.value.filter(item => item.state === SubscriptionState.active || item.state === SubscriptionState.submitted) || [];
        const numberOfSubscriptions = activeSubscriptions.length;
        isLimitReached = (product.subscriptionsLimit || product.subscriptionsLimit === 0) && product.subscriptionsLimit <= numberOfSubscriptions;
    }

    return { userId, product, isLimitReached, isDelegationEnabled };
};

const handleSubscribing = async (
    delegationService: IDelegationService,
    productService: ProductService,
    productName: string,
    userId: string,
    subscriptionName: string,
    isDelegationEnabled: boolean,
) => {
    if (isDelegationEnabled) {
        const userIdentifier = Utils.getResourceName("users", userId);
        const delegationParam = {};
        delegationParam[DelegationParameters.ProductId] = productName;
        delegationParam[DelegationParameters.UserId] = userIdentifier;
        const delegationUrl = await delegationService.getUserDelegationUrl(userIdentifier, DelegationAction.subscribe, delegationParam);
        if (delegationUrl) {
            location.assign(delegationUrl);
            return;
        }
    }

    const subscriptionId = `/subscriptions/${Utils.getBsonObjectId()}`;
    const productId = `/products/${productName}`;

    return productService.createSubscription(subscriptionId, userId, productId, subscriptionName);
}

const ProductSubscribeRuntimeFC = ({ usersService, delegationService, productService, productName, showTermsByDefault }: ProductSubscribeRuntimeFCProps) => {
    const [working, setWorking] = useState(true);
    const [{ product, isLimitReached, isDelegationEnabled, userId }, setData] = useState<{
        product?: Product;
        isLimitReached?: boolean;
        isDelegationEnabled?: boolean;
        userId?: string;
    }>({});

    useEffect(() => {
        setWorking(true);
        loadProduct(usersService, delegationService, productService, productName)
            .then(setData)
            .catch((error) => {
                if (error.code === "Unauthorized") {
                    usersService.navigateToSignin();
                    return;
                }

                // TODO better error handling & logging
                if (error.code === "ResourceNotFound") {
                    return;
                }

                throw new Error(`Unable to load products. Error: ${error.message}`);
            })
            .finally(() => setWorking(false));
    }, [usersService, delegationService, productService, productName]);

    const hasToS = !!product?.terms;
    const subscribe: TSubscribe = useCallback(async (subscriptionName: string, consented?: boolean) => {
        const canSubscribe = (isDelegationEnabled || subscriptionName.length > 0) && (!hasToS || consented);
        if (!userId) {
            usersService.navigateToSignin();
            return;
        }
        if (!productName || !canSubscribe) return;

        return handleSubscribing(delegationService, productService, productName, userId, subscriptionName, isDelegationEnabled)
            .then(() => usersService.navigateToProfile())
            .catch((error) => {
                if (error.code === "Unauthorized") {
                    usersService.navigateToSignin();
                    return;
                }
                // TODO better error handling & logging
                throw new Error(`Unable to subscribe to a product. Error: ${error.message}`);
            })
    }, [delegationService, productService, productName, userId, isDelegationEnabled, hasToS]);

    if (working) return <Spinner size="extra-tiny" label={"Loading data"} labelPosition={"after"} />;
    if (isLimitReached) return <span className="strong" style={{ display: "block", padding: "1rem 0" }}>You've reached maximum number of subscriptions.</span>;

    return <ProductSubscribeForm subscribe={subscribe} termsOfUse={product?.terms} showTermsByDefault={showTermsByDefault} />;
};

export class ProductSubscribeRuntime extends React.Component<
    ProductSubscribeRuntimeProps,
    { productName?: string | null }
> {
    @Resolve("delegationService")
    public declare delegationService: IDelegationService;

    @Resolve("usersService")
    public declare usersService: UsersService;

    @Resolve("productService")
    public declare productService: ProductService;

    @Resolve("routeHelper")
    public declare routeHelper: RouteHelper;

    @Resolve("router")
    public declare router: Router;

    constructor(props: ProductSubscribeRuntimeProps) {
        super(props);

        this.state = { productName: undefined };
    }

    componentDidMount() {
        this.setProductName();
        this.router.addRouteChangeListener(this.setProductName.bind(this));
    }

    componentWillUnmount() {
        this.router.removeRouteChangeListener(this.setProductName.bind(this));
    }

    setProductName() {
        this.setState({ productName: this.routeHelper.getProductName() });
    }

    render() {
        if (!this.state.productName) return <>Please select a product</>;

        return (
            <FluentProvider theme={fuiTheme}>
                <ProductSubscribeRuntimeFC
                    {...this.props}
                    delegationService={this.delegationService}
                    usersService={this.usersService}
                    productService={this.productService}
                    productName={this.state.productName}
                />
            </FluentProvider>
        );
    }
}
