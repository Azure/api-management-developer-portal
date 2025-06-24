import * as React from "react";
import { useEffect, useState } from "react";
import { Logger } from "@paperbits/common/logging";
import { Spinner, Table, TableBody, TableCell, TableHeader, TableHeaderCell, TableRow } from "@fluentui/react-components";
import { CheckmarkCircleFilled, ChevronDownRegular, ChevronRightRegular } from "@fluentui/react-icons";
import { Product } from "../../../../../models/product";
import { ProductService } from "../../../../../services/productService";
import { ScrollableTableContainer } from "../../../../utils/react/ScrollableTableContainer";
import { NoRecordsRow } from "../../../../utils/react/NoRecordsRow";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";

const ProductRow = ({
    product,
    getProductReferenceUrl
}: {
    product: Product,
    getProductReferenceUrl: (productName: string) => string
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <>
            <TableRow key={product.id}>
                <TableCell>
                    {isExpanded
                        ? <ChevronDownRegular onClick={() => setIsExpanded(!isExpanded)} style={{ marginRight: "10px" }} />
                        : <ChevronRightRegular onClick={() => setIsExpanded(!isExpanded)} style={{ marginRight: "10px" }} />
                    }
                    <a href={getProductReferenceUrl(product.name)} title={product.displayName}>
                        {product.displayName}
                    </a> 
                </TableCell>
                <TableCell>{product.applicationSettings?.entra?.applicationId}</TableCell>                
                <TableCell><CheckmarkCircleFilled style={{ color: "#428000" }} /> Approved</TableCell> {/* add actual value */}
            </TableRow>
            {isExpanded && (
                <div className="application-product-options-container">
                    <div className="application-product-options">
                        <span className="strong">Description</span>
                        <div><MarkdownProcessor markdownToDisplay={product.description} /></div>
                        <span className="strong">Credential types</span>
                        <div>Oauth and API key</div>
                        <span className="strong">Redirect URI (OAuth)</span>
                        <div>{product.applicationSettings?.entra?.audience}</div>
                        <span className="strong">Product application ID (OAuth)</span>
                        <div>{product.applicationSettings?.entra?.applicationId}</div>
                    </div>
                </div>
            )}
        </>
    )
}

export const ApplicationsProducts = ({
    products,
    productService,
    logger,
    getProductReferenceUrl
}: {
    products: Product[],
    productService: ProductService,
    logger: Logger,
    getProductReferenceUrl: (productName: string) => string
}) => {
    const [loadedProducts, setLoadedProducts] = useState<Product[]>([]);
    const [working, setWorking] = useState(true);

    useEffect(() => {
        setWorking(true);

        if (products) {
            products.forEach((product) => {
                loadProduct(product.id)
                    .then((loadedProduct) => {
                        setLoadedProducts((prevProducts) => [...prevProducts, loadedProduct]);
                    });
            });
        }
    }, [products, productService]);

    const loadProduct = async (productName: string): Promise<Product> => {
        let product: Product;

        try {
            product = await productService.getProduct(productName);
        } catch (error) {
            logger.trackError(error, { message: `Unable to load product ${productName}.` });
        }

        return product;
    };

    if (working) {
        return <Spinner label="Loading products..." labelPosition="below" size="small" />;
    }

    return (
        <div className={"fui-application-details-container"}>
            <h3>Products</h3>
            <ScrollableTableContainer>
                <Table className={"fui-table"} aria-label={"Application's products table"}>
                    <TableHeader>
                        <TableRow className={"fui-table-headerRow"}>
                            <TableHeaderCell><span className="strong">Product name</span></TableHeaderCell>
                            <TableHeaderCell><span className="strong">Product application ID</span></TableHeaderCell>
                            <TableHeaderCell><span className="strong">Approval status</span></TableHeaderCell>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loadedProducts?.length > 0
                            ? loadedProducts.map((product) => <ProductRow product={product} getProductReferenceUrl={getProductReferenceUrl} />)
                            : <NoRecordsRow colspan={3} customText="No products to display" />
                        }
                    </TableBody>
                </Table>
            </ScrollableTableContainer>
        </div>
    );
}
