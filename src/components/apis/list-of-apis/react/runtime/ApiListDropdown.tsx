import * as React from "react";
import { useState } from "react";
import {
    Combobox,
    Link,
    Option,
    OptionGroup,
    Spinner,
} from "@fluentui/react-components";
import { Resolve } from "@paperbits/react/decorators";
import { GroupByTag } from "../../../../utils/react/TableListInfo";
import { Pagination } from "../../../../utils/react/Pagination";
import * as Constants from "../../../../../constants";
import { Api } from "../../../../../models/api";
import { TApiListRuntimeFC } from "./ApiListRuntime";
import {
    isApisGrouped,
    TagGroupToggleBtn,
    TApisData,
    toggleValueInSet,
} from "./utils";
import { RouteHelper } from "../../../../../routing/routeHelper";
import { ApiService } from "../../../../../services/apiService";

type TApiListDropdown = Omit<
    TApiListRuntimeFC,
    "apiService" | "layoutDefault" | "productName"
> & {
    working: boolean;
    apis: TApisData;
    statePageNumber: ReturnType<typeof useState<number>>;
    statePattern: ReturnType<typeof useState<string>>;
    stateGroupByTag: ReturnType<typeof useState<boolean>>;
};

const TagLabel = ({
    tag,
    expanded,
    onClick,
}: {
    tag: string;
    expanded: Set<string>;
    onClick(): void;
}) => (
    <button onClick={onClick} className={"no-border"}>
        <TagGroupToggleBtn expanded={expanded.has(tag)} />
        <span style={{ marginLeft: ".575rem" }}>{tag}</span>
    </button>
);

const Options = ({
    apis,
    getReferenceUrl,
}: {
    apis: Api[];
    getReferenceUrl: TApiListRuntimeFC["getReferenceUrl"];
}) => (
    <>
        {apis.map((api) => (
            <Option key={api.id} value={api.name} text={api.displayName}>
                <Link href={getReferenceUrl(api.name)}>{api.displayName}</Link>
            </Option>
        ))}
    </>
);

const ApiListDropdownFC = ({
    working,
    apis,
    getReferenceUrl,
    selectedApi,
    statePageNumber: [pageNumber, setPageNumber],
    statePattern: [_, setPattern],
    stateGroupByTag: [groupByTag, setGroupByTag],
}: TApiListDropdown & { selectedApi?: Api }) => {
    const [expanded, setExpanded] = React.useState(new Set<string>());

    const pageMax = Math.ceil(apis?.count / Constants.defaultPageSize);

    const toggleTag = (tag: string) =>
        setExpanded((old) => toggleValueInSet(old, tag));

    return (
        <Combobox
            style={{ width: "100%" }}
            onInput={(event) => setPattern(event.target?.["value"])}
            defaultSelectedOptions={[selectedApi?.name]}
            onOptionSelect={(_, { optionValue }) => {
                window.location.hash = getReferenceUrl(optionValue);
            }}
        >
            {working || !apis ? (
                <Spinner
                    label={"Loading APIs"}
                    labelPosition={"above"}
                    size={"small"}
                    style={{ padding: "1rem" }}
                />
            ) : (
                <>
                    <Option
                        disabled
                        value={"group by tag switch"}
                        text={"group by tag switch"}
                    >
                        <GroupByTag
                            groupByTag={groupByTag}
                            setGroupByTag={setGroupByTag}
                        />
                    </Option>

                    {isApisGrouped(apis) ? (
                        apis?.value.map(({ tag, items }) => (
                            <OptionGroup
                                key={tag}
                                label={
                                    <TagLabel
                                        onClick={() => toggleTag(tag)}
                                        tag={tag}
                                        expanded={expanded}
                                    />
                                }
                            >
                                {expanded.has(tag) && (
                                    <Options
                                        apis={items}
                                        getReferenceUrl={getReferenceUrl}
                                    />
                                )}
                            </OptionGroup>
                        ))
                    ) : (
                        <Options
                            apis={apis.value}
                            getReferenceUrl={getReferenceUrl}
                        />
                    )}

                    {pageMax > 1 && (
                        <Option
                            disabled
                            value={"pagination"}
                            text={"pagination"}
                        >
                            <Pagination
                                pageNumber={pageNumber}
                                setPageNumber={setPageNumber}
                                pageMax={pageMax}
                            />
                        </Option>
                    )}
                </>
            )}
        </Combobox>
    );
};

export class ApiListDropdown extends React.Component<
    TApiListDropdown,
    { working: boolean; api?: Api }
> {
    @Resolve("apiService")
    public apiService: ApiService;

    @Resolve("routeHelper")
    public routeHelper: RouteHelper;

    constructor(props: TApiListDropdown) {
        super(props);

        this.state = {
            working: false,
            api: undefined,
        };
    }

    public componentDidMount() {
        this.loadSelectedApi();
    }

    async loadSelectedApi() {
        const apiName = this.routeHelper.getApiName();
        if (!apiName) return;

        this.setState({ working: true, api: undefined });

        return this.apiService
            .getApi(`apis/${apiName}`)
            .then((api) => this.setState({ api }))
            .finally(() => this.setState({ working: false }));
    }

    render() {
        return (
            <ApiListDropdownFC
                {...this.props}
                working={this.props.working || this.state.working}
                selectedApi={this.state.api}
            />
        );
    }
}
