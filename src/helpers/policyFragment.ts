import { PolicyMap } from "./policyMap";
import { JObject } from "./jObject";

export interface Badge {
    name: string;
    value: string;
    muted?: boolean;
    levelPrefix: string;
    xmlString: string;
    terminatesExecution: boolean;
    fragment?: PolicyFragment;
}


export class PolicyFragment {
    private readonly config: JObject;

    public readonly policyName: string;
    public hasFormEditor: boolean;
    public terminal: boolean;
    public selectedChild: PolicyFragment;
    public policies: PolicyFragment[];
    public identifier: string;

    constructor(policyName: string) {
        this.policyName = policyName;
        this.terminal = false;
        this.hasFormEditor = false;
        this.policies = [];
        this.config = new JObject(policyName);
    }

    public static fromConfig(policyConfig: JObject): PolicyFragment {
        const policyClass = PolicyMap[policyConfig.name];

        let policyInstance;

        if (policyClass) {
            policyInstance = policyClass.fromConfig(policyConfig);
        }
        else {
            policyInstance = new PolicyFragment(policyConfig.name);
            policyInstance.config = policyConfig;
            policyConfig.children.forEach(childPolicyConfig => {
                policyInstance.policies.push(PolicyFragment.fromConfig(childPolicyConfig));
            });
        }

        return policyInstance;
    }

    public toConfig(): JObject {
        // this is default handler, so we process config one-to-one:
        const config = new JObject(this.config.name, this.config.ns);

        config.type = this.config.type;
        config.value = this.config.value;
        config.attributes = this.config.attributes;

        // ...except children, because child policies may have other handlers:
        config.children = this.policies.map(childPolicy => childPolicy.toConfig());

        return config;
    }

    public findChildPolicies(policyName: string): PolicyFragment[] {
        const results: PolicyFragment[] = [];

        if (!policyName) {
            return results;
        }

        for (const policy of this.policies) {
            const nameCondition = policy.policyName === policyName || (policy.config && policy.config.name === policyName);

            if (nameCondition) {
                results.push(policy);
            }

            const childPolicies = policy.findChildPolicies(policyName);

            childPolicies.forEach(x => results.push(x));
        }

        return results;
    }

    public findChildPoliciesById(identifier: string): PolicyFragment[] {
        const results: PolicyFragment[] = [];

        if (!identifier) {
            return results;
        }


        for (let i = 0; i < this.policies.length; i++) {
            const policy = this.policies[i];
            const identifierCondition = policy.identifier === identifier;

            if (identifierCondition) {
                results.push(policy);
            }

            const childPolicies = policy.findChildPoliciesById(identifier);

            childPolicies.forEach(x => results.push(x));
        }

        return results;
    }

    public findChildPolicy(policyName: string): PolicyFragment {
        const policies = this.findChildPolicies(policyName);

        if (policies.length > 0) {
            return policies[0];
        }
        else {
            return null;
        }
    }

    /**
     * Appends specified child policy.
     * @param policy Child policy
     */
    public addChildPolicy(policy: PolicyFragment): void {
        this.policies.push(policy);
    }

    /**
     * Appends specified child policy by replacing an existing one of this type.
     * @param policy Child policy
     */
    public setChildPolicy(policy: PolicyFragment): void {
        this.removeChildPolicyOfType(policy.policyName);
        this.addChildPolicy(policy);
    }

    /**
     * Removes specified child policy.
     * @param policy Child policy
     */
    public removeChildPolicy(policy: PolicyFragment): void {
        const index = this.policies.indexOf(policy);

        if (index >= 0) {
            this.policies.splice(index, 1);
        }
    }

    /**
     * Removed first child policy of a specific type.
     * @param policyType Child policy type, i.e. "set-header".
     */
    public removeChildPolicyOfType(policyType: string): void {
        const policy = this.findChildPolicy(policyType);
        const index = this.policies.indexOf(policy);

        if (index >= 0) {
            this.policies.splice(index, 1);
        }
    }

    public moveChildPolicy(from: number, to: number): void {
        const policy = this.policies[from];
        this.policies.splice(from, 1);
        this.policies.splice(to, 0, policy);
    }
}