import * as React from "react";
import {
    Body1Strong,
    Link,
    Table,
    TableBody,
    TableCell,
    TableCellLayout,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from "@fluentui/react-components";
import { Product } from "../../../../../models/product";
import { TProductsData } from "./utils";
import { MarkdownProcessor } from "../../../../react-markdown/MarkdownProcessor";

type Props = {
    getReferenceUrl: (product: Product) => string;
};

const TableBodyProducts = ({ products, getReferenceUrl }: Props & { products: Product[] }) => (
    <>
        {products?.map((product) => (
            <TableRow key={product.id}>
                <TableCell>
                    <Link href={getReferenceUrl(product)} title={product.displayName}>
                        {product.displayName}
                    </Link>
                </TableCell>
                <TableCell>
                    <TableCellLayout truncate title={product.description}>
                        <MarkdownProcessor markdownToDisplay={product.description}/>
                    </TableCellLayout>
                </TableCell>
            </TableRow>
        ))}
    </>
);

export const ProductsTable = ({ products, getReferenceUrl }: Props & { products: TProductsData }) => (
    <div className={"fui-table"}>
        <Table size={"small"} aria-label={"Products List table"}>
            <TableHeader>
                <TableRow className={"fui-table-headerRow"}>
                    <TableHeaderCell>
                        <Body1Strong>Name</Body1Strong>
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <Body1Strong>Description</Body1Strong>
                    </TableHeaderCell>
                </TableRow>
            </TableHeader>

            <TableBody>
                <TableBodyProducts
                    products={products.value}
                    getReferenceUrl={getReferenceUrl}
                />
            </TableBody>
        </Table>
    </div>
);
