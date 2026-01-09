---
name: Email-based Inline Auth in Checkout
overview: Remove blue block. Add email existence check on blur. Show login prompt and password field inline when account exists. Update checkbox text based on login status.
todos: []
---

# Email-based Inline Authentication in Checkout

## Overview

Remove the blue authentication block. Instead, check if an email exists when the user focuses out of the email field. If an account exists, show a small message with "Login" or "Continue as Guest" options. When user clicks "Login", show password field inline. After successful login, prefilled address appears and password field disappears. Update checkbox text based on login status.

## Changes Required

### 1. Add Email Existence Check Function ([src/services/customerAuth.js](src/services/customerAuth.js))

Add a new function to check if a customer email exists:
- Function: `checkEmailExists(email: string): Promise<boolean>`
- Query Firestore `customers` collection for email
- Return `true` if customer document exists, `false` otherwise
- Handle errors gracefully (return `false` on error)

### 2. Update State Management ([src/pages/StoreFront.jsx](src/pages/StoreFront.jsx))

Add new state variables:
- `emailExists` (boolean) - tracks if entered email has an existing account
- `showLoginPrompt` (boolean) - controls visibility of "Login or Continue as Guest" message
- `showPasswordField` (boolean) - controls visibility of password field below email
- `loginPassword` (string) - stores password for inline login
- `checkingEmail` (boolean) - loading state while checking email

Remove or keep `showLoginModal` (can be removed since we're not using modal anymore)

### 3. Add Email Blur Handler ([src/pages/StoreFront.jsx](src/pages/StoreFront.jsx))

Create `handleEmailBlur` function:
- Skip check if `currentUser` exists (user is already logged in)
- Validate email format first
- If valid, call `checkEmailExists(customerInfo.email)`
- Set `emailExists` and `showLoginPrompt` based on result
- Set `checkingEmail` during the check
- Only show prompt if email exists and user is not already logged in
- If email changes while password field is visible, hide password field and reset login prompt state

### 4. Update Email Input Field (lines 905-920)

Modify the email input to:
- Add `onBlur={handleEmailBlur}` handler
- Disable the email field if `currentUser` exists (user is logged in)
- Show loading indicator while checking email (if `checkingEmail` is true)
- Display email existence message below email field when `showLoginPrompt` is true
- Keep email value when user clicks "Continue as Guest" (don't clear it)

### 5. Add Email Existence Message UI

Add inline message below email field (after line 920):
- Tiny note text: "User exists with this email. Login or Continue as Guest."
- Two inline buttons/links:
  - "Login" button - sets `showPasswordField = true`
  - "Continue as Guest" button - sets `showLoginPrompt = false` and `showPasswordField = false`, but keeps the email value
- Style as small, subtle text with clickable links (no visual indicators like checkmarks)

### 6. Add Inline Password Field

Add password input field below email existence message (conditional rendering):
- Only show when `showPasswordField === true` and `emailExists === true`
- Place between email field and phone field
- Include label "Password *"
- Add "Sign In" button (required - not auto-submit on Enter)
- Show error message if login fails, but keep password field visible
- On successful login, hide password field and load address
- If user changes email while password field is visible, hide password field and re-check new email

### 7. Update Login Handler

Modify `handleLogin` function:
- Remove modal-related code
- Use `loginPassword` state instead of `loginFormData.password`
- Use `customerInfo.email` instead of `loginFormData.email`
- After successful login:
  - Set `showPasswordField = false`
  - Set `showLoginPrompt = false`
  - Call `checkCustomerAuth()` to load and prefilled address
  - Clear `loginPassword`

### 8. Update Checkbox Text Logic (lines 976-991)

Modify the checkbox label text:
- When `currentUser` exists: "Save this address for future orders" (already correct)
- When `currentUser` is null: "Create an account and save address" (already correct)
- Ensure it updates immediately when user logs in

### 9. Remove Blue Block and Login Modal

Remove:
- The blue "Have an account?" block (lines 826-863)
- The entire login modal JSX (lines 1200-1298)
- All `showLoginModal` related code and state

### 10. Handle "Continue as Guest" Action

When user clicks "Continue as Guest":
- Set `showLoginPrompt = false`
- Set `showPasswordField = false`
- Set `emailExists = false`
- Keep the email value (don't clear it)
- Allow user to continue filling checkout form normally

## Implementation Details

### Email Check Flow

```
User enters email → Focus out (blur) → Validate email format
  → If valid: Check Firestore for email
    → If exists: Show "User exists... Login or Continue as Guest"
    → If not exists: No message (user can create account via checkbox)
```

### Login Flow

```
User clicks "Login" → Password field appears
  → User enters password → Click "Sign In" button
    → Call loginCustomer(email, password)
      → On success: Hide password field, load address, disable email field, update checkbox text
      → On error: Show error message, keep password field visible with error
```

### UI Layout

```
[Email Field *] (disabled if currentUser exists)
  [Loading indicator while checking...] (if checkingEmail)
  [Tiny note: User exists with this email. Login or Continue as Guest.] (if showLoginPrompt)
    [Login] [Continue as Guest] (inline buttons/links)
  [Password Field *] [Sign In button] (if showPasswordField)
    [Error message if login fails]
[Phone Field *]
[Address Field *]
...
[Checkbox: "Save this address..." or "Create an account..."] (based on currentUser)
```

## Files to Modify

- `src/services/customerAuth.js` - Add `checkEmailExists` function
- `src/pages/StoreFront.jsx` - Main implementation (email blur handler, inline password field, remove blue block and modal)
