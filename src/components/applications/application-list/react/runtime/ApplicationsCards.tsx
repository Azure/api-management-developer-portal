import * as React from "react";
import { Stack } from "@fluentui/react";
import { markdownMaxCharsMap } from "../../../../../constants";
import { MarkdownProcessor } from "../../../../utils/react/MarkdownProcessor";

type Props = {
    getReferenceUrl: (productName: string) => string;
};

const ApplicationCard = ({ application, getReferenceUrl }) => {
    return (
        <div className={"fui-list-card"}>
            <div style={{ height: "100%" }}>
                <h4>{application.displayName}</h4>

                <MarkdownProcessor markdownToDisplay={application.description} maxChars={markdownMaxCharsMap.cards} />
            </div>

            <Stack horizontal>
                <a
                    href={getReferenceUrl(application.name)}
                    title={application.displayName}
                    role="button"
                    className="button"
                >
                    Go to Application
                </a>
            </Stack>
        </div>
    );
};

export const ApplicationsCards = ({ applications, getReferenceUrl }) => (
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
