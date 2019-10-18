import { Contract } from "@paperbits/common";
import { IModelBinder } from "@paperbits/common/editing";
import { ValidationErrorModel } from "./validationErrorModel";
import { ValidationErrorContract } from "./validationErrorContract";


export class ValidationErrorModelBinder implements IModelBinder<ValidationErrorModel> {
    public canHandleModel(model: Object): boolean {
        return model instanceof ValidationErrorModel;
    }

    public async contractToModel(contract: ValidationErrorContract): Promise<ValidationErrorModel> {
        return new ValidationErrorModel();
    }

    public canHandleContract(contract: Contract): boolean {
        return contract.type === "validationError";
    }

    public modelToContract(model: ValidationErrorModel): Contract {
        const contract: ValidationErrorContract = {
            type: "validationError"
        };

        return contract;
    }
}