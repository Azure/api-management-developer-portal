import * as React from "react";
import { Button } from "@fluentui/react-components";
import { Api } from "../../../../../models/api";
import { Page } from "../../../../../models/page";

type Props = {
    showApiType: boolean,
    getReferenceUrl: (api: Api) => string
}

const ApiCard = ({api, getReferenceUrl, showApiType}: Props & {api: Api}) => {
    return (
        <div className={"fui-api-card"}>
            <div style={{height: "100%"}}>
                {showApiType && <div className={"fui-api-card-tags"}><span>API</span><span>{api.typeName}</span></div>}
                <h4>{api.displayName}</h4>
                <p>
                    {api.description} {/* TODO render markdown/HTML description */}
                </p>
            </div>

            <div>
                <a href={getReferenceUrl(api)} title={api.displayName}>
                    <Button appearance={"outline"}>
                        Go to API
                    </Button>
                </a>
            </div>
        </div>
    )
}

export const ApisCards = ({ showApiType, apis, getReferenceUrl }: Props & {apis: Page<Api>}) => {
    return (
        <div className={"fui-api-cards-container"}>
            {apis?.value?.map((api) => (
                <ApiCard key={api.id} api={api} getReferenceUrl={getReferenceUrl} showApiType={showApiType} />
            ))}
        </div>
    );
};
