import * as React from "react";
import { Button, Link, Subtitle1 } from "@fluentui/react-components";
import { Product } from "../../../../../models/product";
import { TProductsData } from "./utils";
import { MarkdownProcessor } from "../../../../react-markdown/MarkdownProcessor";
import { markdownMaxCharsMap } from "../../../../../constants";

type Props = {
    getReferenceUrl: (product: Product) => string;
};

const ProductCard = ({ product, getReferenceUrl }: Props & { product: Product }) => {
    return (
        <div className={"fui-list-card"}>
            <div style={{ height: "100%" }}>
                <Subtitle1>{product.displayName}</Subtitle1>

                <MarkdownProcessor markdownToDisplay={product.description} maxChars={markdownMaxCharsMap.cards} />
            </div>

            <div>
                <Link href={getReferenceUrl(product)} title={product.displayName}>
                    <Button appearance={"outline"}>
                        Go to Product
                    </Button>
                </Link>
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
