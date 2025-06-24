import { EntraSecretContract, EntraSecretObject } from "../contracts/entraSecret";

/**
 * Entra secret model.
 */
export class EntraSecret {
    /**
     * Entra secret object.
     */
    public entra: EntraSecretObject;

    constructor(contract?: EntraSecretContract) {
        if (!contract) {
            return;
        }

        this.entra = contract.entra;
    }
}