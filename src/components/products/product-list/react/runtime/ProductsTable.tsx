import * as React from "react";
import {
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

type Props = {
    getReferenceUrl: (product: Product) => string;
};

const TableBodyProducts = ({ products, getReferenceUrl }: Props & { products: Product[] }) => (
    <>
        {products?.map((product) => (
            <TableRow key={product.id}>
                <TableCell>
                    <a href={getReferenceUrl(product)} title={product.displayName}>
                        {product.displayName}
                    </a>
                </TableCell>
                <TableCell>
                    <TableCellLayout truncate title={product.description}>
                        {product.description}
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
                <TableRow style={{ background: "#F5F5F5" }}>
                    <TableHeaderCell>
                        <b>Name</b>
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <b>Description</b>
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
