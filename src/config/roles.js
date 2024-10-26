export const Roles = {
  SUPER_USER: "SUPER_USER",
  USER: "USER",
};

export const Permissions = {
  APPROVE_USERS: "APPROVE_USERS",
  MANAGE_USERS: "MANAGE_USERS",
  VIEW_ALL_BOOKINGS: "VIEW_ALL_BOOKINGS",
  MANAGE_BOOKINGS: "MANAGE_BOOKINGS",
  VIEW_REPORTS: "VIEW_REPORTS",
};

export const RolePermissions = {
  [Roles.SUPER_USER]: [
    Permissions.APPROVE_USERS,
    Permissions.MANAGE_USERS,
    Permissions.VIEW_ALL_BOOKINGS,
    Permissions.MANAGE_BOOKINGS,
    Permissions.VIEW_REPORTS,
  ],
  [Roles.USER]: [],
};
