import * as React from "react";
import { Button } from "@fluentui/react-components";
import { Api } from "../../../../../models/api";
import { isApisGrouped, toggleValueInSet, TagGroupToggleBtn, TApisData } from "./utils";
import { TagGroup } from "../../../../../models/tagGroup";

type Props = {
    showApiType: boolean;
    getReferenceUrl: (api: Api) => string;
};

const ApiCard = ({ api, getReferenceUrl, showApiType }: Props & { api: Api }) => {
    return (
        <div className={"fui-api-card"}>
            <div style={{ height: "100%" }}>
                {showApiType && (
                    <div className={"fui-api-card-tags"}>
                        <span>API</span>
                        <span>{api.typeName}</span>
                    </div>
                )}
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
    );
};

const ApisCardsContainer = ({ showApiType, apis, getReferenceUrl }: Props & { apis: Api[] }) => (
    <div className={"fui-api-cards-container"}>
        {apis?.map((api) => (
            <ApiCard
                key={api.id}
                api={api}
                getReferenceUrl={getReferenceUrl}
                showApiType={showApiType}
            />
        ))}
    </div>
);

const ApisGroupedCards = ({ showApiType, tags, getReferenceUrl }: Props & { tags: TagGroup<Api>[] }) => {
    const [expanded, setExpanded] = React.useState(new Set());

    return (
        <div className={"fui-api-tag-cards-container"}>
            {tags?.map(({ tag, items }) => (
                <div key={tag}>
                    <div
                        className={"fui-api-tag-cards"}
                        onClick={() => setExpanded(old => toggleValueInSet(old, tag))}
                    >
                        <TagGroupToggleBtn expanded={expanded.has(tag)}/>

                        <b style={{ fontWeight: 600, paddingLeft: "1em" }}>
                            {tag}
                        </b>
                    </div>

                    {expanded.has(tag) && (
                        <ApisCardsContainer
                            apis={items}
                            getReferenceUrl={getReferenceUrl}
                            showApiType={showApiType}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export const ApisCards = ({ showApiType, apis, getReferenceUrl }: Props & { apis: TApisData }) =>
    isApisGrouped(apis) ? (
        <ApisGroupedCards
            tags={apis.value}
            getReferenceUrl={getReferenceUrl}
            showApiType={showApiType}
        />
    ) : (
        <ApisCardsContainer
            apis={apis.value}
            getReferenceUrl={getReferenceUrl}
            showApiType={showApiType}
        />
    );
