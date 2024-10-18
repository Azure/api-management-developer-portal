import * as React from "react";
import {
    Body1Strong,
    Link,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from "@fluentui/react-components";
import { Product } from "../../../../../models/product";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";
import { NoRecordsRow } from "../../../../utils/react/NoRecordsRow";
import { markdownMaxCharsMap } from "../../../../../constants";
import { TProductsData } from "./utils";

type Props = {
    getReferenceUrl: (productName: string) => string;
};

const TableBodyProducts = ({ products, getReferenceUrl }: Props & { products: Product[] }) => (
    <>
        {products?.length > 0
            ? products.map((product) => (
                <TableRow key={product.id}>
                    <TableCell>
                        <Link href={getReferenceUrl(product.name)} title={product.displayName}>
                            {product.displayName}
                        </Link>
                    </TableCell>
                    <TableCell style={{padding: ".5rem 0"}}>
                        <MarkdownProcessor markdownToDisplay={product.description} maxChars={markdownMaxCharsMap.table} />
                    </TableCell>
                </TableRow>
            ))
            : <NoRecordsRow colspan={2} customText="No products to display" />
        }
    </>
);

export const ProductsTable = ({ products, getReferenceUrl }: Props & { products: TProductsData }) => (
    <Table className={"fui-table"} size={"small"} aria-label={"Products List table"}>
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
);
