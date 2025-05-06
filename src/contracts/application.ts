export interface ApplicationContract {
    /**
     * Unique identifier.
     */
    id: string;

    /**
     * Application name.
     */
    name: string;

    /**
     * Application identifier in Entra platform.
     */
    entraApplicationId: string;

    /**
     * Application state.
     * Possible values: pending, active, rejected, approved.
     */
    state?: ApplicationState;

    /**
     * Description of the application.
     */
    description?: string;
}

export type ApplicationState = "pending" | "active" | "rejected" | "approved";