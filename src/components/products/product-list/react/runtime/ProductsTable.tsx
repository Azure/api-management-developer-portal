import * as React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
} from "@fluentui/react-components";
import { Product } from "../../../../../models/product";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";
import { ScrollableTableContainer } from "../../../../utils/react/ScrollableTableContainer";
import { NoRecordsRow } from "../../../../utils/react/NoRecordsRow";
import { markdownMaxCharsMap } from "../../../../../constants";

type Props = {
    products: Product[];
    getReferenceUrl: (productName: string) => string;
};

const TableBodyProducts = ({ products, getReferenceUrl }: Props) => (
    <>
        {products?.length > 0
            ? products.map((product) => (
                <TableRow key={product.id}>
                    <TableCell>
                        <a href={getReferenceUrl(product.name)} title={product.displayName}>
                            {product.displayName}
                        </a>
                    </TableCell>
                    <TableCell>
                        <MarkdownProcessor markdownToDisplay={product.description} maxChars={markdownMaxCharsMap.table} />
                    </TableCell>
                </TableRow>
            ))
            : <NoRecordsRow colspan={2} customText="No products to display" />
        }
    </>
);

export const ProductsTable = ({ products, getReferenceUrl }: Props) => (
    <ScrollableTableContainer>
        <Table className={"fui-table"} size={"small"} aria-label={"Products List table"}>
            <TableHeader>
                <TableRow className={"fui-table-headerRow"}>
                    <TableHeaderCell>
                        <span className="strong">Name</span>
                    </TableHeaderCell>
                    <TableHeaderCell>
                        <span className="strong">Description</span>
                    </TableHeaderCell>
                </TableRow>
            </TableHeader>

            <TableBody>
                <TableBodyProducts
                    products={products}
                    getReferenceUrl={getReferenceUrl}
                />
            </TableBody>
        </Table>
    </ScrollableTableContainer>
);
