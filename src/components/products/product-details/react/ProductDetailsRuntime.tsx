import * as React from "react";
import { useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import { Body1, Caption1, FluentProvider, Spinner, Title1 } from "@fluentui/react-components";
import { CircleSmallFilled } from "@fluentui/react-icons";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";
import * as Constants from "../../../../constants";
import { UsersService } from "../../../../services";
import { Product } from "../../../../models/product";
import { ProductState } from "../../../../contracts/product";
import { RouteHelper } from "../../../../routing/routeHelper";
import { ProductService } from "../../../../services/productService";
import { MarkdownProcessor } from "../../../utils/react/MarkdownProcessor";

type ProductSubscribeRuntimeProps = {
}
type ProductSubscribeRuntimeFCProps = ProductSubscribeRuntimeProps & {
    usersService: UsersService;
    productService: ProductService;
    productName: string;
};

const productStateToLabel = (state: ProductState) => {
    switch (state) {
        case "published":
            return "Published";
        case "notPublished":
            return "Not published";
        default:
            return state;
    }
}

const loadProduct = async (productService: ProductService, productName: string) => {
    return productService.getProduct("/products/" + productName);
};

const ProductSubscribeRuntimeFC = ({ usersService, productService, productName }: ProductSubscribeRuntimeFCProps) => {
    const [product, setProduct] = useState<Product>();
    const [working, setWorking] = useState(true);

    useEffect(() => {
        setWorking(true);
        loadProduct(productService, productName)
            .then(setProduct)
            .catch((error) => {
                if (error.code === "Unauthorized") {
                    usersService.navigateToSignin();
                    return;
                }

                // TODO better error handling & logging
                if (error.code === "ResourceNotFound") {
                    return;
                }

                throw new Error(`Unable to load product ${productName}. Error: ${error.message}`);
            })
            .finally(() => setWorking(false));
    }, [usersService, productService, productName]);

    if (working)
        return (
            <Spinner label={"Loading product details"} labelPosition="below" />
        );

    return (
        <Stack tokens={{ childrenGap: 20 }}>
            <Title1>{product.displayName}</Title1>

            <Caption1 block>
                Product {!!product.state && <><CircleSmallFilled /> {productStateToLabel(product.state)}</>}
            </Caption1>

            {product.description &&
                <Body1 block><MarkdownProcessor markdownToDisplay={product.description} /></Body1>
            }
        </Stack>
    );
};

export class ProductDetailsRuntime extends React.Component<
    ProductSubscribeRuntimeProps,
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
                    usersService={this.usersService}
                    productService={this.productService}
                    productName={this.state.productName}
                />
            </FluentProvider>
        );
    }
}
