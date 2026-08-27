# 06 - Testing & Debugging Guide

## 1. Running the API

To launch the project locally:

```powershell
dotnet run
```

The console will display the running URLs (e.g., `http://localhost:5000` / `https://localhost:5001`).

---

## 2. Interactive Testing via Scalar API Reference

Open your browser and navigate to:

```text
http://localhost:5000/scalar/v1
```

You can test all endpoints interactively directly from the browser UI.

---

## 3. Pre-Seeded Accounts for Testing

The application automatically seeds the following credentials via [DbInitializer.cs](../Data/DbInitializer.cs):

| Account | Email | Password | Roles | Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Super Admin** | `admin@example.com` | `Admin@123456` | `Admin`, `Manager` | Full bypass (All permissions) |
| **Manager** | `manager@example.com` | `Manager@123456` | `Manager` | `Users.View`, `Reports.View`, `Reports.Export` |
| **Standard User** | `user@example.com` | `User@123456` | `User` | `Users.View` |

---

## 4. Testing with `IdentityJwtDemo.http`

You can use the built-in [IdentityJwtDemo.http](../IdentityJwtDemo.http) file in VS Code or Visual Studio:

### Test Case 1: Login and Get Token

```http
POST http://localhost:5000/api/auth/login
Content-Type: application/json

{
  "email": "manager@example.com",
  "password": "Manager@123456"
}
```

### Test Case 2: Access Authorized Endpoint

```http
GET http://localhost:5000/api/resources/export-financial-report
Authorization: Bearer <your_access_token>
```

### Test Case 3: Test Dynamic Permission Rejection (403 Forbidden)

Log in as `user@example.com` (which only has `Users.View`) and try to access:

```http
GET http://localhost:5000/api/resources/export-financial-report
Authorization: Bearer <user_access_token>
```

**Response**: `403 Forbidden` because `user@example.com` lacks `Reports.Export`.

### Test Case 4: Dynamic Permission Granting at Runtime

1. Admin grants `Reports.Export` to `user@example.com`:

   ```http
   POST http://localhost:5000/api/auth/grant-permission
   Authorization: Bearer <admin_access_token>
   Content-Type: application/json

   {
     "email": "user@example.com",
     "permission": "Reports.Export"
   }
   ```

2. User logs in again to receive a fresh JWT containing the new claim.
3. User can now successfully access `GET /api/resources/export-financial-report`!

---

## 5. Common Troubleshooting & Error Codes

| Status Code | Cause | Fix |
| :--- | :--- | :--- |
| **`401 Unauthorized`** | Missing or invalid `Authorization: Bearer <token>` header, or token signature is invalid, or token is expired. | Verify header format, check token expiration, verify `SecretKey` and `Issuer`. |
| **`403 Forbidden`** | User is authenticated, but does not possess the required `Role` or `Permission` claim. | Grant the necessary role or claim to the user. |
| **`400 Bad Request`** | Password validation failed (e.g. missing uppercase/digit) or invalid model state. | Check password rules in [Program.cs](../Program.cs#L20-L26). |
| **Token Expired Error** | Token lifetime exceeded. | Call `/api/auth/refresh-token` with the refresh token to get a new access token. |
