import * as React from "react";
import { useState } from "react";
import { ApiCard } from "@microsoft/api-docs-ui";
import { Api } from "../../../../../models/api";
import { TagGroup } from "../../../../../models/tagGroup";
import { isApisGrouped, toggleValueInSet, TagGroupToggleBtn, TApisData } from "./utils";

type Props = {
    showApiType: boolean;
    getReferenceUrl: (apiName: string) => string;
    detailsPageTarget: string;
};

const ApisCardsContainer = ({ apis, ...props }: Props & { apis: Api[] }) => (
    <>
        {apis?.length > 0
            ? <div className={"fui-list-cards-container"}>
                {apis.map((api) => (
                    <ApiCard
                        {...props}
                        key={api.id}
                        api={api}
                    />
                ))}
            </div>
            : <span style={{ textAlign: "center" }}>No APIs to display</span>
        }
    </>
);

const ApisGroupedCards = ({ tags, ...props }: Props & { tags: TagGroup<Api>[] }) => {
    const [expanded, setExpanded] = useState(new Set());

    return (
        <div className={"fui-list-tag-cards-container"}>
            {tags?.map(({ tag, items }) => (
                <div key={tag}>
                    <button
                        className={"fui-list-tag-cards no-border"}
                        onClick={() => setExpanded(old => toggleValueInSet(old, tag))}
                    >
                        <TagGroupToggleBtn expanded={expanded.has(tag)}/>

                        <span className="strong" style={{marginLeft: ".5rem"}}>
                            {tag}
                        </span>
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
