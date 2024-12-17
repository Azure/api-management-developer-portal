import * as React from "react";
import { useEffect, useState } from "react";
import { FluentProvider } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";
import { Subscription } from "../../../../../models/subscription";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { UsersService } from "../../../../../services/usersService";
import { ProductService } from "../../../../../services/productService";
import { fuiTheme } from "../../../../../constants";
import { ProductSubscriptionsTable } from "./ProductSubscriptionsTable";

type ProductSubscriptionsProps = {}
type ProductSubscriptionsFCProps = ProductSubscriptionsProps & {
    usersService: UsersService;
    productService: ProductService;
    productName: string;
};

const loadSubscriptions = async (usersService: UsersService, productService: ProductService, productName: string) => {
    const userId = await usersService.getCurrentUserId();
    const { value: subscriptions } =
        await productService.getSubscriptionsForProduct(userId, `/products/${productName}`);

    return { userId, subscriptions };
};

const ProductSubscriptionsRuntimeFC = ({ usersService, productService, productName }: ProductSubscriptionsFCProps) => {
    const [working, setWorking] = useState(false);
    const [subscriptions, setSubscriptions] = useState<Subscription[]>();

    useEffect(() => {
        setWorking(true);
        loadSubscriptions(usersService, productService, productName)
            .then(({ subscriptions }) => setSubscriptions(subscriptions))
            .catch((error) => {
                if (error.code === "Unauthorized") {
                    usersService.navigateToSignin();
                    return;
                }
                // TODO better error handling & logging
                if (error.code === "ResourceNotFound") return;

                throw new Error(`Could not load product subscriptions. Error: ${error.message}`);
            })
            .finally(() => setWorking(false));
    }, [usersService, productService, productName]);

    return <ProductSubscriptionsTable subscriptions={subscriptions} working={working} />;
};

export class ProductSubscriptionsRuntime extends React.Component<
    ProductSubscriptionsProps,
    { productName?: string | null }
> {
    @Resolve("usersService")
    public usersService: UsersService;

    @Resolve("productService")
    public productService: ProductService;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    @Resolve("router")
    public router: Router;

    constructor(props: ProductSubscriptionsProps) {
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
                <ProductSubscriptionsRuntimeFC
                    {...this.props}
                    usersService={this.usersService}
                    productService={this.productService}
                    productName={this.state.productName}
                />
            </FluentProvider>
        );
    }
}
