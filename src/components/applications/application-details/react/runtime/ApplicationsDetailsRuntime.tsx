import * as React from "react";
import { FluentProvider } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { Router } from "@paperbits/common/routing";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { ProductService } from "../../../../../services/productService";
import { UsersService } from "../../../../../services";
import { ApplicationService } from "../../../../../services/applicationService";
import { fuiTheme } from "../../../../../constants";
import { ApplicationDetails } from "./ApplicationDetails";

interface ApplicationsDetailsProps {
    detailsPageUrl: string;
}

interface ApplicationDetailsState {
    applicationName?: string | null;
}

export class ApplicationsDetailsRuntime extends React.Component<ApplicationsDetailsProps, ApplicationDetailsState> {
    @Resolve("usersService")
    public usersService: UsersService;

    @Resolve("applicationService")
    public applicationService: ApplicationService;

    @Resolve("productService")
    public productService: ProductService;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    @Resolve("router")
    public router: Router;

    constructor(props) {
        super(props);

        this.state = { applicationName: undefined };
    }

    componentDidMount() {
        this.setApplicationName();
        this.router.addRouteChangeListener(this.setApplicationName.bind(this));
    }

    componentWillUnmount() {
        this.router.removeRouteChangeListener(this.setApplicationName.bind(this));
    }

    setApplicationName() {
        this.setState({ applicationName: this.routeHelper.getApplicationName() });
    }

    getProductReferenceUrl(productName: string): string {
        return this.routeHelper.getProductReferenceUrl(productName, this.props.detailsPageUrl);
    }

    render() {
        return (
            <FluentProvider theme={fuiTheme}>
                <ApplicationDetails
                    usersService={this.usersService}
                    productService={this.productService}
                    applicationService={this.applicationService}
                    applicationName={this.state.applicationName}
                    getProductReferenceUrl={(productName) => this.getProductReferenceUrl(productName)}
                />
            </FluentProvider>
        );
    }
}
