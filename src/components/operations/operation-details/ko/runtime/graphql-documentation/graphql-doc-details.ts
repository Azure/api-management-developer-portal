import * as ko from "knockout";
import template from "./graphql-doc-details.html";
import { Component, OnMounted } from "@paperbits/common/ko/decorators";
import { GraphDocService } from "./graphql-doc-service";
import { GraphQLTreeNode, GraphQLOutputTreeNode, GraphQLInputTreeNode } from "../graphql-utilities/graphql-node-models";
import * as GraphQL from "graphql";

@Component({
    selector: "graphql-details",
    template: template
})

export class GraphqlDetails {
    
    public readonly working: ko.Observable<boolean>;

    constructor(
        private readonly graphDocService: GraphDocService
    ) {
        this.working = ko.observable(true);
    }


    @OnMounted()
    public async initialize(): Promise<void> {
        this.working(true);
        
        this.working(false);
    }

    public getName(): string {
        if(this.graphDocService.navigation()[this.currentSelected()]) {
            const name = this.graphDocService.navigation()[this.currentSelected()]['name'];
            return (name) ? name : "No Name";
        } 
    }

    public getDescription(): string {
        if(this.graphDocService.navigation()[this.currentSelected()]) {
            const description = this.graphDocService.navigation()[this.currentSelected()]['description'];
            return (description) ? description : "No Description";
        } 
    }
    
    private currentSelected() {
        return this.graphDocService.navigation().length - 1;
    }
}