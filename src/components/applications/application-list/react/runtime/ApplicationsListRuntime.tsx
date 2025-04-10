import * as React from "react";
import { FluentProvider } from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { ApplicationService } from "../../../../../services/applicationService";
import { Application } from "../../../../../models/application";
import { fuiTheme } from "../../../../../constants";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { TLayout } from "../../../../utils/react/TableListInfo";
import { ApplicationsTableCards } from "./ApplicationsTableCards";

export interface ApplicationsListProps {
    allowSelection?: boolean;
    allowViewSwitching?: boolean;
    layoutDefault: TLayout;
    detailsPageUrl: string;
}

interface ApplicationsListState {
    working: boolean;
    selectedApplication?: Application | null;
}

export type TApplicationsListRuntimeFCProps = Omit<ApplicationsListProps, "detailsPageUrl"> & {
    getReferenceUrl: (applicationName: string) => string;
    applicationService: ApplicationService;
    selectedApplication?: Application | null;
};

export class ApplicationsListRuntime extends React.Component<ApplicationsListProps, ApplicationsListState> {
    @Resolve("applicationService")
    public applicationService: ApplicationService;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    constructor(props) {
        super(props);

        this.state = {
            working: false,
            selectedApplication: undefined,
        };
    }

    public componentDidMount() {
        this.loadSelectedApplication();        
    }

    async loadSelectedApplication() {
        const applicationName = this.routeHelper.getApplicationName();
        if (!applicationName) {
            this.setState({ selectedApplication: null });
            return;
        }

        this.setState({ working: true, selectedApplication: undefined });
        
        return this.applicationService
            .getApplication("maxpodriezov", applicationName) // TODO: get user id
            .then((selectedApplication) => this.setState({ selectedApplication }))
            .finally(() => this.setState({ working: false }));
    }

    getReferenceUrl(applicationName: string): string {
        return this.routeHelper.getApplicationReferenceUrl(applicationName, this.props.detailsPageUrl);
    }

    render() {
        return (
            <FluentProvider theme={fuiTheme}>
                <ApplicationsTableCards
                    {...this.props}
                    applicationService={this.applicationService}
                    getReferenceUrl={(applicationName) => this.getReferenceUrl(applicationName)}
                />
            </FluentProvider>
        );
    }
}
