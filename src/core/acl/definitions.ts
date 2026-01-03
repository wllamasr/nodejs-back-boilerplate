export const STATIC_ROLES = [
  {
    name: 'Super Admin',
    slug: 'super-admin',
    description: 'Has full access to the system',
  },
  {
    name: 'Admin',
    slug: 'admin',
    description: 'Administrator with high privileges',
  },
  {
    name: 'Moderator',
    slug: 'mod',
    description: 'Can moderate content',
  },
  {
    name: 'Staff',
    slug: 'staff',
    description: 'Staff member',
  },
  {
    name: 'User',
    slug: 'user',
    description: 'Standard user',
  },
];

export const STATIC_PERMISSIONS = [
  {
    name: 'Manage Users',
    slug: 'users.manage',
    description: 'Can create, update, delete users',
  },
  {
    name: 'View Dashboard',
    slug: 'dashboard.view',
    description: 'Can view the admin dashboard',
  },
  {
    name: 'Manage Content',
    slug: 'content.manage',
    description: 'Can manage content',
  },
];

// Map Roles to Permissions (Role Slug -> Array of Permission Slugs)
export const STATIC_ROLE_PERMISSIONS: Record<string, string[]> = {
  'super-admin': STATIC_PERMISSIONS.map((p) => p.slug),
  'admin': ['users.manage', 'dashboard.view'],
  'mod': ['content.manage'],
};
