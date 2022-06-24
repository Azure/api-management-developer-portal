export interface TagContract {
    /**
     * Tag identifier.
     */
    id: string;

    /**
     * Tag name. Must be 1 to 160 characters long.
     */
    name: string;
}