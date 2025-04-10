import * as React from "react";
import { Stack } from "@fluentui/react";
import { Application } from "../../../../../models/application";
import { markdownMaxCharsMap } from "../../../../../constants";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";

type Props = {
    getReferenceUrl: (applicationName: string) => string;
};

const ApplicationCard = ({ application, getReferenceUrl }: Props & { application: Application }) => {
    return (
        <div className={"fui-list-card"}>
            <div style={{ height: "100%" }}>
                <h4>{application.name}</h4>

                <MarkdownProcessor markdownToDisplay={application.description} maxChars={markdownMaxCharsMap.cards} />
            </div>

            <Stack horizontal>
                <a
                    href={getReferenceUrl(application.name)}
                    title={application.name}
                    role="button"
                    className="button"
                >
                    Go to Application
                </a>
            </Stack>
        </div>
    );
};

export const ApplicationsCards = ({ applications, getReferenceUrl }: Props & { applications: Application[] }) => (
    <div className={"fui-list-cards-container"}>
        {applications?.map((application) => (
            <ApplicationCard
                key={application.id}
                application={application}
                getReferenceUrl={getReferenceUrl}
            />
        ))}
    </div>
);
