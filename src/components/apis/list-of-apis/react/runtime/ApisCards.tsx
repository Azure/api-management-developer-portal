import * as React from "react";
import { Body1Strong, Button, Caption1Stronger, Link, Subtitle1 } from "@fluentui/react-components";
import { Api } from "../../../../../models/api";
import { isApisGrouped, toggleValueInSet, TagGroupToggleBtn, TApisData } from "./utils";
import { TagGroup } from "../../../../../models/tagGroup";
import { MarkdownProcessor } from "../../../../react-markdown/MarkdownProcessor";
import { markdownMaxCharsMap } from "../../../../../constants";

type Props = {
    showApiType: boolean;
    getReferenceUrl: (apiName: string) => string;
    detailsPageTarget: string;
};

const ApiCard = ({ api, getReferenceUrl, showApiType, detailsPageTarget }: Props & { api: Api }) => {
    return (
        <div className={"fui-list-card"}>
            <div style={{ height: "100%" }}>
                {showApiType && (
                    <div className={"fui-list-card-tags"}>
                        <Caption1Stronger>API</Caption1Stronger>
                        <Caption1Stronger>{api.typeName}</Caption1Stronger>
                    </div>
                )}
                <Subtitle1>{api.displayName}</Subtitle1>

                <MarkdownProcessor markdownToDisplay={api.description} maxChars={markdownMaxCharsMap.cards} />
            </div>

            <div>
                <Link href={getReferenceUrl(api.name)} target={detailsPageTarget} title={api.displayName}>
                    <Button appearance={"outline"}>
                        Go to API
                    </Button>
                </Link>
            </div>
        </div>
    );
};

const ApisCardsContainer = ({ apis, ...props }: Props & { apis: Api[] }) => (
    <div className={"fui-list-cards-container"}>
        {apis?.map((api) => (
            <ApiCard
                {...props}
                key={api.id}
                api={api}
            />
        ))}
    </div>
);

const ApisGroupedCards = ({ tags, ...props }: Props & { tags: TagGroup<Api>[] }) => {
    const [expanded, setExpanded] = React.useState(new Set());

    return (
        <div className={"fui-list-tag-cards-container"}>
            {tags?.map(({ tag, items }) => (
                <div key={tag}>
                    <button
                        className={"fui-list-tag-cards no-border"}
                        onClick={() => setExpanded(old => toggleValueInSet(old, tag))}
                    >
                        <TagGroupToggleBtn expanded={expanded.has(tag)}/>

                        <Body1Strong style={{marginLeft: ".5rem"}}>
                            {tag}
                        </Body1Strong>
                    </button>

                    {expanded.has(tag) && (
                        <ApisCardsContainer
                            {...props}
                            apis={items}
                        />
                    )}
                </div>
            ))}
        </div>
    );
};

export const ApisCards = ({ apis, ...props }: Props & { apis: TApisData }) =>
    isApisGrouped(apis) ? (
        <ApisGroupedCards
            {...props}
            tags={apis.value}
        />
    ) : (
        <ApisCardsContainer
            {...props}
            apis={apis.value}
        />
    );
