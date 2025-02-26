import * as React from "react";
import { Stack } from "@fluentui/react";
import { Product } from "../../../../../models/product";
import { markdownMaxCharsMap } from "../../../../../constants";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";

type Props = {
    getReferenceUrl: (productName: string) => string;
};

const ProductCard = ({ product, getReferenceUrl }: Props & { product: Product }) => {
    return (
        <div className={"fui-list-card"}>
            <div style={{ height: "100%" }}>
                <h4>{product.displayName}</h4>

                <MarkdownProcessor markdownToDisplay={product.description} maxChars={markdownMaxCharsMap.cards} />
            </div>

            <Stack horizontal>
                <a
                    href={getReferenceUrl(product.name)}
                    title={product.displayName}
                    role="button"
                    className="button"
                >
                    Go to Product
                </a>
            </Stack>
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

export const ProductsCards = ({ products, getReferenceUrl }: Props & { products: Product[] }) => (
    <ProductsCardsContainer
        products={products}
        getReferenceUrl={getReferenceUrl}
    />
);
