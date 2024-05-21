import * as React from "react";
import { Body1, Body1Strong, Button, Caption1, Caption1Stronger, Link, Subtitle1 } from "@fluentui/react-components";
import { Api } from "../../../../../models/api";
import { isApisGrouped, toggleValueInSet, TagGroupToggleBtn, TApisData } from "./utils";
import { TagGroup } from "../../../../../models/tagGroup";
import { MarkdownProcessor } from "../../../../react-markdown/MarkdownProcessor";

type Props = {
    showApiType: boolean;
    getReferenceUrl: (api: Api) => string;
};

const ApiCard = ({ api, getReferenceUrl, showApiType }: Props & { api: Api }) => {
    return (
        <div className={"fui-list-card"}>
            <div style={{ height: "100%" }}>
                {showApiType && (
                    <div className={"fui-list-card-tags"}>
                        <Caption1Stronger>API</Caption1Stronger>
                        <span>{api.typeName}</span>
                    </div>
                )}
                <Subtitle1>{api.displayName}</Subtitle1>

                <MarkdownProcessor markdownToDisplay={api.description}/>
            </div>

            <div>
                <Link href={getReferenceUrl(api)} title={api.displayName}>
                    <Button appearance={"outline"}>
                        Go to API
                    </Button>
                </Link>
            </div>
        </div>
    );
};

const ApisCardsContainer = ({ showApiType, apis, getReferenceUrl }: Props & { apis: Api[] }) => (
    <div className={"fui-list-cards-container"}>
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
        <div className={"fui-list-tag-cards-container"}>
            {tags?.map(({ tag, items }) => (
                <div key={tag}>
                    <div
                        className={"fui-list-tag-cards"}
                        onClick={() => setExpanded(old => toggleValueInSet(old, tag))}
                    >
                        <TagGroupToggleBtn expanded={expanded.has(tag)}/>

                        <Body1Strong>
                            {tag}
                        </Body1Strong>
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
