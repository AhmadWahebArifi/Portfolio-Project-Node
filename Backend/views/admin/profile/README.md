# Admin Profile Management

This directory contains the views for managing the admin user's profile.

## Features

1. **View Profile** (`index.ejs`)

   - Displays user information including name, email, role, and account status
   - Shows account creation date
   - Provides links to edit profile and change password

2. **Edit Profile** (`edit.ejs`)

   - Allows updating name and email
   - Shows account information (role, status, member since)
   - Includes client-side validation

3. **Change Password** (`change-password.ejs`)
   - Secure password change functionality
   - Requires current password for verification
   - Password strength validation
   - Client-side validation with visual feedback

## Routes

- `GET /admin/profile` - View profile
- `GET /admin/profile/edit` - Edit profile form
- `POST /admin/profile/update` - Update profile data
- `GET /admin/profile/change-password` - Change password form
- `POST /admin/profile/change-password` - Update password

## Security

- All routes are protected and require admin authentication
- Passwords are securely hashed using bcrypt
- Email uniqueness is enforced
- Current password verification required for password changes
