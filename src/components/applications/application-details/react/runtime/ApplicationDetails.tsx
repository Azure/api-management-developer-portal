import * as React from "react";
import { useEffect, useState } from "react";
import {
    Button,
    MessageBar,
    MessageBarBody,
    Popover,
    PopoverSurface,
    PopoverTrigger,
    Spinner,
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableHeaderCell,
    TableRow,
    Tooltip
} from "@fluentui/react-components";
import { Copy16Regular } from "@fluentui/react-icons";
import { UsersService } from "../../../../../services";
import { ProductService } from "../../../../../services/productService";
import { ApplicationService } from "../../../../../services/applicationService";
import { Application } from "../../../../../models/application";
import { EntraSecret } from "../../../../../models/entraSecret";
import { Page } from "../../../../../models/page";
import { Product } from "../../../../../models/product";
import { ScrollableTableContainer } from "../../../../utils/react/ScrollableTableContainer";
import { ApplicationsProducts } from "./ApplicationProducts";

const dateOptions: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
};

export const ApplicationDetails = ({
    usersService,
    productService,
    applicationService,
    applicationName,
    getProductReferenceUrl
}: {
    usersService: UsersService,
    applicationService: ApplicationService,
    productService: ProductService,
    applicationName: string,
    getProductReferenceUrl: (productName: string) => string
}) => {
    const [userId, setUserId] = useState<string>();
    const [application, setApplication] = useState<Application>();
    const [products, setProducts] = useState<Product[]>();
    const [working, setWorking] = useState(true);
    const [clientWorking, setClientWorking] = useState(false);
    const [clientSecret, setClientSecret] = useState<EntraSecret>();
    const [popoverOpen, setPopoverOpen] = useState(false);
    const [isCopied, setIsCopied] = useState(false);

    useEffect(() => {
        setWorking(true);

        initUser()
            .then((userId) => {
                setUserId(userId);
            });

        loadApplication(applicationName)
            .then(setApplication)
            .catch((error) => {
                if (error.code === "Unauthorized") {
                    usersService.navigateToSignin();
                    return;
                }

                throw new Error(`Unable to load application ${applicationName}. Error: ${error.message}`);
            });

        loadApplicationProducts(applicationName)
            .then((loadedProducts) => {
                setProducts(loadedProducts.value);
            })
            .finally(() => setWorking(false));
    }, [usersService, applicationService, productService, applicationName]);

    const initUser = async (): Promise<string> => {
        return await usersService.ensureSignedIn();
    }

    const loadApplication = async (applicationName: string): Promise<Application> => {
        let application: Application;
    
        try {
            application = await applicationService.getApplication(userId, applicationName);
        } catch (error) {
            throw new Error(`Unable to load application ${applicationName}. Error: ${error.message}`);
        }
    
        return application;
    }

    const generateClientSecret = async (): Promise<EntraSecret> => {
        let clientSecret: EntraSecret;
    
        try {
            clientSecret = await applicationService.createNewSecret(userId, applicationName);
        } catch (error) {
            throw new Error(`Unable to generate client secret for application ${applicationName}. Error: ${error.message}`);
        }
    
        return clientSecret;
    }

    const loadApplicationProducts = async (applicationName: string): Promise<Page<Product>> => {
        let products: Page<Product>;
    
        try {
            products = await applicationService.getApplicationProducts(userId, applicationName);
        } catch (error) {
            throw new Error(`Unable to load products for application ${applicationName}. Error: ${error.message}`);
        }
    
        return products;
    }

    if (working) {
        return (
            <Spinner label={"Loading application details..."} labelPosition="below" size="small" />
        );
    }

    return (
        <>
            <h1>{application.name}</h1>
            <span className="caption1">Application</span>
            <div className={"fui-application-details-container"}>
                <h3>Application</h3>
                <ScrollableTableContainer>
                    <Table className={"fui-table"} aria-label={"Application details table"}>
                        <TableHeader>
                            <TableRow className={"fui-table-headerRow"}>
                                <TableHeaderCell><span className="strong">Entra Application ID</span></TableHeaderCell>
                                <TableHeaderCell><span className="strong">Client Secret</span></TableHeaderCell>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableRow>
                                <TableCell>{application.entraApplicationId}</TableCell>
                                <TableCell>
                                    <Popover open={popoverOpen}>
                                        <PopoverTrigger>
                                            <Button
                                                appearance="transparent"
                                                onClick={async () => {
                                                    setClientWorking(true);
                                                    const newSecret = await generateClientSecret();
                                                    setClientSecret(newSecret);
                                                    setPopoverOpen(true);
                                                    setClientWorking(false);
                                                }
                                            }>
                                                {clientWorking ? <Spinner size="extra-small" /> : '+ New client secret'}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverSurface>
                                            <div className="popover-content" style={{ maxWidth: "560px" }}>
                                                <h4>New client secret</h4>
                                                <p>The secret is stored securely in Microsoft Entra ID. Rotate the secret before the expiration date for continued access. 
                                                    Client secret is valid until {new Date(clientSecret?.entra.expiresAt).toLocaleDateString(undefined, dateOptions)}.</p>                                                
                                                <p className="strong" style={{ margin: 0 }}>Client secret (only shown once)</p>
                                                <div className="flex flex-row align-items-center mb-20">
                                                    <span className="strong">{clientSecret?.entra.clientSecret}</span>
                                                    <Tooltip
                                                        content={
                                                            isCopied
                                                                ? "Copied to clipboard!"
                                                                : "Copy to clipboard"
                                                        }
                                                        relationship={"description"}
                                                        hideDelay={isCopied ? 3000 : 250}
                                                    >
                                                        <Button
                                                            icon={<Copy16Regular />}
                                                            appearance="transparent"
                                                            onClick={() => {
                                                                navigator.clipboard.writeText(
                                                                    clientSecret?.entra.clientSecret
                                                                );
                                                                setIsCopied(true);
                                                            }}
                                                        >
                                                            Copy
                                                        </Button>
                                                    </Tooltip>
                                                </div>
                                                <MessageBar>
                                                    <MessageBarBody>
                                                        <span className="caption1">The secret value is only shown once. Copy it at this time because it will not show again.</span>
                                                    </MessageBarBody>
                                                </MessageBar>
                                                <button className="button button-default" onClick={() => {
                                                    setClientSecret(undefined);
                                                    setPopoverOpen(false);
                                                }}>
                                                    Close
                                                </button>
                                            </div>
                                        </PopoverSurface>
                                    </Popover>
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </ScrollableTableContainer>
                <ApplicationsProducts
                    products={products}
                    productService={productService}
                    getProductReferenceUrl={getProductReferenceUrl}
                />
            </div>
        </>
    );
};
