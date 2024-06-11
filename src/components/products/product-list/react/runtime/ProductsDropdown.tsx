import * as React from "react";
import { useState } from "react";
import {
    Body1Strong,
    Combobox,
    Link,
    Option,
    OptionGroup,
    Spinner,
} from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { Pagination } from "../../../../utils/react/Pagination";
import * as Constants from "../../../../../constants";
import { Product } from "../../../../../models/product";
import { TProductListRuntimeFCProps } from "./ProductsListRuntime";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { ProductService } from "../../../../../services/productService";
import { TProductsData } from "./utils";

type TProductListDropdown = Omit<
    TProductListRuntimeFCProps,
    "productService" | "layoutDefault" | "productName"
> & {
    working: boolean;
    products: TProductsData;
    statePageNumber: ReturnType<typeof useState<number>>;
    statePattern: ReturnType<typeof useState<string>>;
};

const Options = ({
    products,
    getReferenceUrl,
}: {
    products: Product[];
    getReferenceUrl: TProductListRuntimeFCProps["getReferenceUrl"];
}) => (
    <>
        {products.map((product) => (
            <Option key={product.id} value={product.name} text={product.displayName}>
                <Link href={getReferenceUrl(product.name)}>{product.displayName}</Link>
            </Option>
        ))}
    </>
);

const ProductsDropdownFC = ({
    working,
    products,
    getReferenceUrl,
    selectedProduct,
    statePageNumber: [pageNumber, setPageNumber],
    statePattern: [_, setPattern],
}: TProductListDropdown & { selectedProduct?: Product }) => {
    const pageMax = Math.ceil(products?.count / Constants.defaultPageSize);

    const content = !products || !selectedProduct ? (
        <>Loading Products</> // if data are not loaded yet ComboBox sometimes fails to initialize properly - edge case, in most cases almost instant from the cache
    ) : (
        <Combobox
            style={{ width: "100%", minWidth: 0 }}
            onInput={(event) => setPattern(event.target?.["value"])}
            defaultValue={selectedProduct?.displayName}
            defaultSelectedOptions={[selectedProduct?.name]}
            onOptionSelect={(_, { optionValue }) => {
                if (!optionValue) return;
                window.location.hash = getReferenceUrl(optionValue);
            }}
        >
            {working ? (
                <Spinner
                    label={"Loading Products"}
                    labelPosition={"above"}
                    size={"small"}
                    style={{ padding: "1rem" }}
                />
            ) : (
                <>
                   <Options
                        products={products.value}
                        getReferenceUrl={getReferenceUrl}
                    />

                    {pageMax > 1 && (
                        <Option
                            disabled
                            value={"pagination"}
                            text={"pagination"}
                        >
                            <Pagination
                                pageNumber={pageNumber}
                                setPageNumber={setPageNumber}
                                pageMax={pageMax}
                            />
                        </Option>
                    )}
                </>
            )}
        </Combobox>
    );

    return (
        <>
            <Body1Strong block>Product</Body1Strong>
            <div style={{ padding: ".25rem 0 1rem" }}>{content}</div>
        </>
    );
};

export class ProductsDropdown extends React.Component<
    TProductListDropdown,
    { working: boolean; selectedProduct?: Product }
> {
    @Resolve("productService")
    public productService: ProductService;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    constructor(props: TProductListDropdown) {
        super(props);

        this.state = {
            working: false,
            selectedProduct: undefined,
        };
    }

    public componentDidMount() {
        this.loadSelectedProduct();
    }

    async loadSelectedProduct() {
        const productName = this.routeHelper.getProductName();
        if (!productName) return;

        this.setState({ working: true, selectedProduct: undefined });

        return this.productService
            .getProduct(`products/${productName}`)
            .then((selectedProduct) => this.setState({ selectedProduct }))
            .finally(() => this.setState({ working: false }));
    }

    render() {
        return (
            <ProductsDropdownFC
                {...this.props}
                working={this.props.working || this.state.working}
                selectedProduct={this.state.selectedProduct}
            />
        );
    }
}
