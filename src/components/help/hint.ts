/**
 * Entity describing the issue and its potential soultion.
 */
export interface Hint {
    /**
     * Short text defining the issue.
     */
    issue: string;

    /**
     * Free text explaning what can be done to resolve this issue.
     */
    suggestion: string;
}