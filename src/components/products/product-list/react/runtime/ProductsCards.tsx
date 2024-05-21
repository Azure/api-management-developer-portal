import * as React from "react";
import { Button } from "@fluentui/react-components";
import { Product } from "../../../../../models/product";
import { TProductsData } from "./utils";

type Props = {
    getReferenceUrl: (product: Product) => string;
};

const ProductCard = ({ product, getReferenceUrl }: Props & { product: Product }) => {
    return (
        <div className={"fui-list-card"}>
            <div style={{ height: "100%" }}>
                <h4>{product.displayName}</h4>
                <p>
                    {product.description} {/* TODO render markdown/HTML description */}
                </p>
            </div>

            <div>
                <a href={getReferenceUrl(product)} title={product.displayName}>
                    <Button appearance={"outline"}>
                        Go to Product
                    </Button>
                </a>
            </div>
        </div>
    );
};

const ProductsCardsContainer = ({ products, getReferenceUrl }: Props & { products: Product[] }) => (
    <div className={"fui-list-cards-container"}>
        {products?.map((product) => (
            <ProductCard
                key={product.id}
                product={product}
                getReferenceUrl={getReferenceUrl}
            />
        ))}
    </div>
);

export const ProductsCards = ({ products, getReferenceUrl }: Props & { products: TProductsData }) => (
    <ProductsCardsContainer
        products={products.value}
        getReferenceUrl={getReferenceUrl}
    />
);
