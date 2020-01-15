import { IModelBinder } from "@paperbits/common/editing";
import { ConferenceSessionModel } from "./conferenceSessionModel";
import { Contract } from "@paperbits/common";
import { widgetName, defaultSessionNumber } from "./constants";
import { ConferenceSessionContract } from "./conferenceSessionContract";


export class ConferenceSessionModelBinder implements IModelBinder<ConferenceSessionModel> {
    public canHandleContract(contract: Contract): boolean {
        return contract.type === widgetName;
    }

    public canHandleModel(model: ConferenceSessionModel): boolean {
        return model instanceof ConferenceSessionModel;
    }

    public async contractToModel(contract: ConferenceSessionContract): Promise<ConferenceSessionModel> {
        const model = new ConferenceSessionModel();
        model.sessionNumber = contract.sessionNumber || defaultSessionNumber;
        return model;
    }

    public modelToContract(model: ConferenceSessionModel): Contract {
        const contract: ConferenceSessionContract = {
            type: widgetName,
            sessionNumber: model.sessionNumber
        };

        return contract;
    }
}
