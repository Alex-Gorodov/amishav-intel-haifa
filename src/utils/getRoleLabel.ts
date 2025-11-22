import { Roles } from "../constants/Roles";
import { RoleValue } from "../types/User";

export function getRoleLabel(role: RoleValue) {
  return Roles.find(r => r.value === role)?.label ?? role;
}
