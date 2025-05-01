import * as React from "react";
import { TableCell, TableRow } from "@fluentui/react-components";
import { InfoTable, MarkdownRenderer } from "@microsoft/api-docs-ui";
import { Product } from "../../../../../models/product";
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
                        <MarkdownRenderer markdown={product.description} maxLength={markdownMaxCharsMap.table} />
                    </TableCell>
                </TableRow>
            ))
            : <NoRecordsRow colspan={2} customText="No products to display" />
        }
    </>
);

export const ProductsTable = ({ products, getReferenceUrl }: Props) => (
    <InfoTable
        title={"Products List table"}
        columnLabels={["Name", "Description"]}
        children={
            <TableBodyProducts
                products={products}
                getReferenceUrl={getReferenceUrl}
            />
        }
    />
);
