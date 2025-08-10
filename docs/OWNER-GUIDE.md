# Ask Dahlia - Owner Setup Guide

This guide will help you set up Ask Dahlia for the first time, create your admin account, and test the access request flow.

## Step 1: Configure Environment Variables

Add these environment variables in Netlify:

```
ADMIN_SETUP_TOKEN=<generate-a-long-random-string>
JWT_SECRET=<generate-a-long-random-string>
RESEND_API_KEY=<your-resend-api-key>
ACCESS_REQUEST_NOTIFY_TO=<your-email-address>
DATABASE_URL=<your-neon-database-url>
```

For the random strings, use at least 32 characters. You can generate them with:
```
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Step 2: Deploy the Application

Deploy the application to Netlify. This will make the bootstrap endpoint available.

## Step 3: Create Admin Account

Once deployed, create your admin account by running the following command (replace placeholders with your values):

```bash
curl -X POST "https://<your-netlify-domain>/api/admin/bootstrap" \
  -H "x-setup-token: <your-ADMIN_SETUP_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"email":"<your-email>","password":"<secure-password>"}'
```

Example:
```bash
curl -X POST "https://ask-dahlia.netlify.app/api/admin/bootstrap" \
  -H "x-setup-token: 3f7d8a6e2c5b1a9d4e7f2c5b8a6d3f7e" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"SecurePass2024!"}'
```

You should receive a response like:
```json
{"success":true,"message":"Admin user created successfully","userId":"..."}
```

## Step 4: Sign In to Your Account

1. Visit `https://<your-netlify-domain>/login`
2. Sign in with the email and password you used in Step 3
3. You should be redirected to the dashboard

## Step 5: Test Access Request Flow

1. Open an incognito browser or use another device
2. Visit `https://<your-netlify-domain>/login`
3. Click "Ask Dahlia for access"
4. Fill out the access request form with a different email address
5. Submit the request

You should receive an email notification at the address you specified in `ACCESS_REQUEST_NOTIFY_TO`.

## Step 6: Approve the Access Request

1. In your admin account, go to `/approvals`
2. You should see the pending access request
3. Click "Approve" to create a user account
4. A welcome email will be sent to the user

## Step 7: Verify the New User Account

1. Check the email of the user you just approved
2. Use the temporary password to sign in
3. Verify that the user can access the dashboard but not admin features

## Step 8: Secure Your Setup

After confirming everything works, remove the bootstrap endpoint by either:

1. Setting `ADMIN_SETUP_TOKEN` to an empty string in Netlify environment variables, or
2. Commenting out the bootstrap route in your codebase and redeploying

## Next Steps

With the authentication system in place, you can now:

1. Start integrating the Worker API for heavy operations
2. Implement RAG capabilities for document processing
3. Connect to LLM providers for chat functionality
4. Set up SEC EDGAR integration
5. Add voice and export features

## Troubleshooting

### Common Issues

1. **Login fails**: Check that the database connection is working and that you've used the correct email/password.
2. **Email notifications not sending**: Verify your Resend API key and that the `ACCESS_REQUEST_NOTIFY_TO` email is correct.
3. **Database connection issues**: Check your Neon database connection string and ensure pgvector extension is enabled.

For any other issues, check the Netlify function logs for error messages.
