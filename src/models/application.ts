import { ApplicationContract, ApplicationState } from "../contracts/application";

/**
 * Application model.
 */
export class Application {
    /**
     * Unique identifier.
     */
    public readonly id: string;

    /**
     * Application name.
     */
    public name: string;

    /**
     * Application identifier in Entra platform.
     */
    public entraApplicationId: string;

    /**
     * Application state.
     * Possible values: pending, active, rejected, approved.
     */
    public readonly state?: ApplicationState

    /**
     * Description of the application.
     */
    public description?: string;

    constructor(contract?: ApplicationContract) {
        if (!contract) {
            return;
        }

        this.id = contract.id;
        this.name = contract.id;
        this.entraApplicationId = contract.entraApplicationId;
        this.state = contract.state || "approved";
        this.description = contract.description;
    }
}