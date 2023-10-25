import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ValidationSummaryModel } from "./validationSummaryModel";
import { ValidationSummaryContract } from "./validationSummaryContract";


export class ValidationSummaryModelBinder implements IModelBinder<ValidationSummaryModel> {
    public async contractToModel(contract: ValidationSummaryContract): Promise<ValidationSummaryModel> {
        const model = new ValidationSummaryModel();
        model.styles = contract.styles ?? {};

        return model;
    }

    public modelToContract(model: ValidationSummaryModel): Contract {
        const contract: ValidationSummaryContract = {
            type: "validationSummary",
            styles: model.styles
        };

        return contract;
    }
}