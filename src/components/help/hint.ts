/**
 * Entity describing the issue and its potential solution.
 */
export interface Hint {
    /**
     * Short text defining the issue.
     */
    issue: string;

    /**
     * Free text explaining what can be done to resolve this issue.
     */
    suggestion: string;
}