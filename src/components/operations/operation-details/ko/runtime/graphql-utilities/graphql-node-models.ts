import { Utils } from "../../../../../../utils";
import * as GraphQL from "graphql";
import * as ko from "knockout";
import * as _ from "lodash";

export function getType(type: GraphQL.GraphQLOutputType | GraphQL.GraphQLInputType) {
    while ((type instanceof GraphQL.GraphQLList) || (type instanceof GraphQL.GraphQLNonNull)) {
        type = type.ofType;
    }
    return type;
}

function isNonNull(type: GraphQL.GraphQLOutputType | GraphQL.GraphQLInputType) {
    while (type instanceof GraphQL.GraphQLList) {
        type = type.ofType;
    }
    return GraphQL.isNonNullType(type);
}

export abstract class GraphQLTreeNode {
    public id: string = Utils.getBsonObjectId();
    public label: ko.Observable<string>;
    public selected: ko.Observable<boolean>;
    public data: GraphQL.GraphQLField<any, any> | GraphQL.GraphQLInputField;
    public children: ko.ObservableArray<GraphQLTreeNode> = ko.observableArray([]);
    public isRequired: ko.Observable<boolean>;
    public generateDocument: () => void;
    public parent: ko.Observable<GraphQLTreeNode>;

    constructor(label: string, generateDocument: () => void, parent: GraphQLTreeNode) {
        this.label = ko.observable(label);
        this.selected = ko.observable(false);
        this.generateDocument = generateDocument;
        this.parent = ko.observable(parent);
    }

    public isInputNode(): boolean {
        return this instanceof GraphQLInputTreeNode;
    }

    public isScalarType(): boolean {
        return getType(this.data.type) instanceof GraphQL.GraphQLScalarType;
    }

    public isEnumType(): boolean {
        return getType(this.data.type) instanceof GraphQL.GraphQLEnumType;
    }

    public toggle(value?: boolean, regenerateDoc = true): void {
        let preCondition: boolean;
        if (value === true || value === false) {
            preCondition = !value
        } else {
            preCondition = this.selected();
        }
        if (!preCondition) {
            this.selected(true);
            this.generateNodes();
        }
        else {
            this.selected(false);
        }

        if (regenerateDoc) {
            this.generateDocument();
        }
    }

    public clear(): void {
        this.toggle(false, false);
        for (let child of this.children()) {
            child.clear();
        }
    }

    public hasActiveChild(): boolean {
        return !!this.children().find(c => c.selected());
    }

    abstract generateNodes(): void
}

export class GraphQLOutputTreeNode extends GraphQLTreeNode {
    public data: GraphQL.GraphQLField<any, any>;
    public level: number;

    public variables: {
        name: string,
        type: string
    }[] = [];

    constructor(label: string, data: GraphQL.GraphQLField<any, any>, generateDocument: () => void, parent: GraphQLTreeNode) {
        super(label, generateDocument, parent);
        this.children([]);
        this.data = data;
        this.isRequired = ko.observable(isNonNull(this.data.type));
    }

    public generateNodes() {
        let args = this.data?.args || [];
        let type = getType(this.data?.type) || this.data;

        let argsNodes: GraphQLInputTreeNode[] = [];
        let fieldNodes: GraphQLOutputTreeNode[] = [];

        if (this.children().length === 0) {
            for (let arg of args) {
                let inputTreeeNode = new GraphQLInputTreeNode(arg.name, arg, this.generateDocument, this);
                argsNodes.push(inputTreeeNode)
            }
            if (type instanceof GraphQL.GraphQLObjectType || type instanceof GraphQL.GraphQLInterfaceType) {
                let fields = type.getFields();
                for (let name in fields) {
                    fieldNodes.push(new GraphQLOutputTreeNode(name, fields[name], this.generateDocument, this))
                }
            }
            if (type instanceof GraphQL.GraphQLUnionType) {
                let subtypes = type.getTypes();
                _.forEach(subtypes, (subtype) => {
                    fieldNodes.push(new GraphQLOutputTreeNode(subtype['name'], subtype, this.generateDocument, this))
                })
            }
            this.children([...argsNodes.sort((a, b) => a.label().localeCompare(b.label())), ...fieldNodes.sort((a, b) => a.label().localeCompare(b.label()))])
        }
        return this;
    }
}

export class GraphQLInputTreeNode extends GraphQLTreeNode {
    public children: ko.ObservableArray<GraphQLInputTreeNode>;
    public data: GraphQL.GraphQLInputField;
    public inputValue?: ko.Observable<string>;
    public options?: ko.ObservableArray<string>;

    constructor(label: string, data: GraphQL.GraphQLInputField, generateDocument: () => void, parent: GraphQLTreeNode) {
        super(label, generateDocument, parent);
        this.children = ko.observableArray([]);;
        this.data = data;
        this.isRequired = ko.observable(isNonNull(data.type));
        if (this.isRequired()) {
            this.toggle(true);
        }

        this.inputValue = ko.observable("");
        let type = getType(data.type);
        if (type instanceof GraphQL.GraphQLEnumType) {
            this.options = ko.observableArray(type.getValues().map(v => v.name));
            if (this.options().length > 0) {
                this.inputValue(this.options()[0]);
            }
        } else if (type instanceof GraphQL.GraphQLScalarType) {
            switch (type.name) {
                case "String":
                    this.inputValue(`"string"`);
                    break;
                case "Int":
                    this.inputValue("10");
                    break;
                case "Float":
                    this.inputValue("0.0");
                    break;
                case "Boolean":
                    this.inputValue("false");
                    break;
                case "ID":
                    this.inputValue(`"id"`);
                    break;
                default:
                    this.inputValue(`""`)
                    break;
            }
        }
    }

    public changeInput(): void {
        this.generateDocument();
    }

    public generateNodes(): void {
        let data = this.data;
        let type = getType(data.type);
        if (type instanceof GraphQL.GraphQLInputObjectType && this.children().length === 0) {
            let fields = type.getFields();
            for (let name in fields) {
                const inputTreeNode = new GraphQLInputTreeNode(name, fields[name], this.generateDocument, this);
                this.children.push(inputTreeNode)
            }
        }
    }
}