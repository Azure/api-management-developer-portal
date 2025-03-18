import * as React from "react";
import { useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import { FluentProvider, Spinner } from "@fluentui/react-components";
import { CircleSmallFilled } from "@fluentui/react-icons";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";
import { Product } from "../../../../../models/product";
import { ProductService } from "../../../../../services/productService";
import { UsersService } from "../../../../../services/usersService";
import { ProductState } from "../../../../../contracts/product";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";
import { fuiTheme } from "../../../../../constants";

type ProductSubscribeRuntimeProps = {}
type ProductDetailsRuntimeFCProps = ProductSubscribeRuntimeProps & {
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

const ProductDetailsRuntimeFC = ({ usersService, productService, productName }: ProductDetailsRuntimeFCProps) => {
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
            <h1>{product.displayName}</h1>

            <span className="caption1"> Product {!!product.state && <><CircleSmallFilled /> {productStateToLabel(product.state)}</>}</span>

            {product.description &&
                <span><MarkdownProcessor markdownToDisplay={product.description} /></span>
            }
        </Stack>
    );
};

export class ApplicationListRuntime extends React.Component<
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
            <FluentProvider theme={fuiTheme}>
                <ProductDetailsRuntimeFC
                    {...this.props}
                    usersService={this.usersService}
                    productService={this.productService}
                    productName={this.state.productName}
                />
            </FluentProvider>
        );
    }
}
