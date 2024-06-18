import * as React from "react";
import { useCallback, useEffect, useState } from "react";
import { Body1Strong, FluentProvider, Spinner } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";
import * as Constants from "../../../../constants";
import { Utils } from "../../../../utils";
import { UsersService } from "../../../../services";
import { RouteHelper } from "../../../../routing/routeHelper";
import { TenantService } from "../../../../services/tenantService";
import { BackendService } from "../../../../services/backendService";
import { ProductService } from "../../../../services/productService";
import { SubscriptionState } from "../../../../contracts/subscription";
import { DelegationAction, DelegationParameters } from "../../../../contracts/tenantSettings";
import { Product } from "../../../../models/product";
import { ProductSubscribeForm, TSubscribe } from "./ProductSubscribeForm";

type ProductSubscribeRuntimeProps = {
    showTermsByDefault: boolean;
}
type ProductSubscribeRuntimeFCProps = ProductSubscribeRuntimeProps & {
    backendService: BackendService;
    usersService: UsersService;
    tenantService: TenantService;
    productService: ProductService;
    productName: string;
};

const loadProduct = async (usersService: UsersService, tenantService: TenantService, productService: ProductService, productName: string) => {
    const promises = [
        await tenantService.isSubscriptionDelegationEnabled(),
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
    backendService: BackendService,
    productService: ProductService,
    productName: string,
    userId: string,
    subscriptionName: string,
    isDelegationEnabled: boolean,
) => {
    if (isDelegationEnabled) {
        const delegationParam = {};
        delegationParam[DelegationParameters.ProductId] = productName;
        delegationParam[DelegationParameters.UserId] =  Utils.getResourceName("users", userId);
        const delegationUrl = await backendService.getDelegationString(DelegationAction.subscribe, delegationParam);
        if (delegationUrl) {
            location.assign(delegationUrl);
            return;
        }
    }

    const subscriptionId = `/subscriptions/${Utils.getBsonObjectId()}`;
    const productId = `/products/${productName}`;

    return productService.createSubscription(subscriptionId, userId, productId, subscriptionName);
}

const ProductSubscribeRuntimeFC = ({ backendService, usersService, tenantService, productService, productName, showTermsByDefault }: ProductSubscribeRuntimeFCProps) => {
    const [working, setWorking] = useState(true);
    const [{ product, isLimitReached, isDelegationEnabled, userId }, setData] = useState<{
        product?: Product;
        isLimitReached?: boolean;
        isDelegationEnabled?: boolean;
        userId?: string;
    }>({});

    useEffect(() => {
        setWorking(true);
        loadProduct(usersService, tenantService, productService, productName)
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
    }, [usersService, tenantService, productService, productName]);

    const hasToS = !!product?.terms;
    const subscribe: TSubscribe = useCallback(async (subscriptionName: string, consented?: boolean) => {
        const canSubscribe = (isDelegationEnabled || subscriptionName.length > 0) && (!hasToS || consented);
        if (!productName || !userId || !canSubscribe) return;

        return handleSubscribing(backendService, productService, productName, userId, subscriptionName, isDelegationEnabled)
            .then(() => usersService.navigateToProfile())
            .catch((error) => {
                if (error.code === "Unauthorized") {
                    usersService.navigateToSignin();
                    return;
                }
                // TODO better error handling & logging
                throw new Error(`Unable to subscribe to a product. Error: ${error.message}`);
            })
    }, [backendService, productService, productName, userId, isDelegationEnabled, hasToS]);

    if (working) return <Spinner size="extra-tiny" label={"Loading data"} labelPosition={"after"} />;
    if (isLimitReached) return <Body1Strong style={{ display: "block", padding: "1rem 0" }}>You've reached maximum number of subscriptions.</Body1Strong>;

    return <ProductSubscribeForm subscribe={subscribe} tos={product?.terms} showTermsByDefault={showTermsByDefault} />;
};

export class ProductSubscribeRuntime extends React.Component<
    ProductSubscribeRuntimeProps,
    { productName?: string | null }
> {
    @Resolve("backendService")
    public backendService: BackendService;

    @Resolve("usersService")
    public usersService: UsersService;

    @Resolve("productService")
    public productService: ProductService;

    @Resolve("tenantService")
    public tenantService: TenantService;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    @Resolve("router")
    public router: Router;

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
            <FluentProvider theme={Constants.fuiTheme}>
                <ProductSubscribeRuntimeFC
                    {...this.props}
                    backendService={this.backendService}
                    usersService={this.usersService}
                    productService={this.productService}
                    tenantService={this.tenantService}
                    productName={this.state.productName}
                />
            </FluentProvider>
        );
    }
}
