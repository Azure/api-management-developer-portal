import * as React from "react";
import { useEffect, useState } from "react";
import { Stack } from "@fluentui/react";
import { Spinner } from "@fluentui/react-components";
import { Page } from "../../../../../models/page";
import { Application } from "../../../../../models/application";
import { TableListInfo, TLayout } from "../../../../utils/react/TableListInfo";
import { Pagination } from "../../../../utils/react/Pagination";
import { SearchQuery } from "../../../../../contracts/searchQuery";
import { defaultPageSize } from "../../../../../constants";
import { ApplicationsTable } from "./ApplicationsTable";
import { ApplicationsCards } from "./ApplicationsCards";
import { TApplicationsListRuntimeFCProps } from "./ApplicationsListRuntime";

type TApplicationTableCards = TApplicationsListRuntimeFCProps;

export const ApplicationsTableCards = ({
    getReferenceUrl,
    applicationService,
    layoutDefault,
    allowViewSwitching
}: TApplicationTableCards) => {
    const [working, setWorking] = useState(false);
    const [pageNumber, setPageNumber] = useState(1);
    const [applications, setApplications] = useState<Page<Application>>();
    const [layout, setLayout] = useState<TLayout>(layoutDefault ?? TLayout.table);
    const [pattern, setPattern] = useState<string>();
    
    useEffect(() => {
        const query: SearchQuery = {
            pattern,
            skip: (pageNumber - 1) * defaultPageSize,
            take: defaultPageSize,
        };

        setWorking(true);
        loadApplications(query)
            .then((loadedApplications) => setApplications(loadedApplications))
            .finally(() => setWorking(false));
    }, [applicationService, pageNumber, pattern]);

    const loadApplications = async (query: SearchQuery) => {
        let applications: Page<Application>;
    
        try {
            /*TODO : ADD USER ID*/
            applications = await applicationService.getClientApplications("maxpodriezov", query);
        } catch (error) {
            throw new Error(`Unable to load applications. Error: ${error.message}`);
        }
    
        return applications;
    }

    return (
        <Stack tokens={{ childrenGap: "1rem" }}>
            <TableListInfo
                layout={layout}
                setLayout={setLayout}
                pattern={pattern}
                setPattern={setPattern}
                setPageNumber={setPageNumber}
                allowViewSwitching={allowViewSwitching}
            />

            {working || !applications ? (
                <div className="table-body">
                    <Spinner label="Loading applications..." labelPosition="below" size="small" />
                </div>
            ) : (
                <>
                    {/* <div style={{ margin: "1rem auto 2rem" }}>
                        <Pagination pageNumber={pageNumber} setPageNumber={setPageNumber} pageMax={Math.ceil(applications?.count / defaultPageSize)} />
                    </div> */}

                    <div>
                        {layout === TLayout.table ? (
                            <ApplicationsTable applications={applications.value} getReferenceUrl={getReferenceUrl} />
                        ) : (
                            <ApplicationsCards applications={applications.value} getReferenceUrl={getReferenceUrl} />
                        )}
                    </div>

                    {/* <div style={{ margin: "1rem auto" }}>
                        <Pagination pageNumber={pageNumber} setPageNumber={setPageNumber} pageMax={Math.ceil(applications?.count / defaultPageSize)} />
                    </div> */}
                </>
            )}
        </Stack>
    );
};
