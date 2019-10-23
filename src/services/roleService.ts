import { BuiltInRoles, RoleModel } from "@paperbits/common/user";

/**
 * Static role service for demo purposes.
 */
export class StaticRoleService {
    public async getRoles(): Promise<RoleModel[]> {
        return [BuiltInRoles.everyone, BuiltInRoles.anonymous, BuiltInRoles.authenticated];
    }
}