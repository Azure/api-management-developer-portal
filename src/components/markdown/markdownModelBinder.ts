import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { MarkdownContract } from "./markdownContract";
import { MarkdownModel } from "./markdownModel";


export class MarkdownModelBinder implements IModelBinder<MarkdownModel> {
    constructor() { }
    
    public canHandleModel(model: Object): boolean {
        return model instanceof MarkdownModel;
    }

    public async contractToModel(contract: MarkdownContract): Promise<MarkdownModel> {
        const model = new MarkdownModel();
        if (!contract.id) return model;
        model.id = contract.id;
        return model;
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "markdown";
    }

    public modelToContract(model: MarkdownModel): Contract {
        if (!model.id) return {type: "markdown"};
        const contract: MarkdownContract = {
            type: "markdown",
            id: model.id,
        };

        return contract;
    }
}
