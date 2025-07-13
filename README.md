# Actionize

A powerful TypeScript React library for handling server actions with type-safe validation, built for Next.js applications with React 19+ and Zod schema validation.

## Features

- 🔒 **Type-safe**: Full TypeScript support with Zod schema validation
- ⚡ **React 19+ compatible**: Uses the latest React features like `useActionState` and `useTransition`
- 🎯 **Form validation**: Real-time field validation with error handling
- 🚀 **Server actions**: Seamless integration with Next.js server actions
- 🎨 **Developer friendly**: Simple API with excellent TypeScript inference
- ⚖️ **Lightweight**: Minimal dependencies, only requires Zod and React

## Installation

```bash
npm install actionize zod
```

or

```bash
yarn add actionize zod
```

or

```bash
pnpm add actionize zod
```

## Quick Start

### 1. Create a Server Action

```typescript
// actions/nameAction.ts
"use server";

import * as z from "zod";
import { createServerAction } from "actionize";

const nameSchema = z.object({
  name: z
    .string()
    .min(1, "Name must be at least 1 character")
    .max(6, "Name must not exceed 6 characters"),
});

export const nameAction = createServerAction(nameSchema, async (data) => {
  console.log("Server action executed with data:", data);
  // Process the data here (e.g., save to database)
  return { name: data.name.trim() };
});
```

### 2. Create Action Configuration

```typescript
// config/actions.ts
import { createActionConfig } from "actionize";
import { nameAction } from "../actions/nameAction";

const nameSchema = z.object({
  name: z
    .string()
    .min(1, "Name must be at least 1 character")
    .max(6, "Name must not exceed 6 characters"),
});

export const nameActionConfig = createActionConfig(
  nameSchema,
  nameAction,
  { name: "" } // Initial data
);
```

### 3. Use in React Component

```typescript
// components/MyForm.tsx
"use client";

import { useActionize } from "actionize";
import { nameActionConfig } from "../config/actions";

export default function MyForm() {
  const {
    state,
    isPending,
    isValid,
    register,
    getFieldError,
    formAction,
    buttonDisabled,
  } = useActionize({
    ...nameActionConfig,
    onError: (error) => {
      console.error("Action error:", error.message);
    },
    onSuccess: (result) => {
      console.log("Action succeeded with result:", result);
    },
  });

  return (
    <form action={formAction} className="space-y-4">
      <div>
        <input
          {...register("name")}
          placeholder="Enter your name"
          className="border p-2 rounded"
        />
        {getFieldError("name") && (
          <span className="text-red-500 text-sm">
            {getFieldError("name").message}
          </span>
        )}
      </div>

      <button
        type="submit"
        disabled={buttonDisabled}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isPending ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
}
```

## API Reference

### `createServerAction`

Creates a server action with Zod schema validation.

```typescript
const createServerAction = <TSchema extends z.ZodType>(
  schema: TSchema,
  handler: (data: z.infer<TSchema>) => Promise<z.infer<TSchema>>
) => ServerAction;
```

**Parameters:**

- `schema`: Zod schema for validation
- `handler`: Async function that processes the validated data

**Returns:** A server action function compatible with Next.js

### `createActionConfig`

Creates a configuration object for use with `useActionize`.

```typescript
const createActionConfig = <TSchema extends z.ZodType>(
  schema: TSchema,
  action: ServerAction,
  initialData: z.infer<TSchema>
) => ActionConfig;
```

**Parameters:**

- `schema`: Zod schema for validation
- `action`: Server action created with `createServerAction`
- `initialData`: Initial state data

**Returns:** Configuration object for `useActionize`

### `useActionize`

React hook for managing form state and server actions.

```typescript
const useActionize = <TSchema extends z.ZodObject<any>>({
  schema,
  action,
  initialData,
  onSuccess?,
  onError?,
}) => ActionizeReturn
```

**Parameters:**

- `schema`: Zod object schema for form validation
- `action`: Server action function
- `initialData`: Initial form state
- `onSuccess`: Optional success callback
- `onError`: Optional error callback

**Returns:**

- `state`: Current form state
- `isPending`: Whether action is currently executing
- `isValid`: Whether form is currently valid
- `buttonDisabled`: Whether submit button should be disabled
- `errors`: Current validation errors
- `register`: Function to register form fields
- `getFieldError`: Function to get field-specific errors
- `formAction`: Enhanced form action for use with forms
- `executeAction`: Function to programmatically execute the action
- `formData`: Current form data

## Advanced Usage

### Complex Forms

```typescript
const userSchema = z
  .object({
    email: z.string().email("Invalid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
    age: z.number().min(18, "Must be at least 18 years old"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

const userAction = createServerAction(userSchema, async (data) => {
  // Create user in database
  const user = await createUser(data);
  return { success: true, userId: user.id };
});

function UserRegistration() {
  const { register, getFieldError, formAction, buttonDisabled, isPending } =
    useActionize({
      schema: userSchema,
      action: userAction,
      initialData: { email: "", password: "", confirmPassword: "", age: 0 },
      onSuccess: (result) => {
        router.push(`/user/${result.userId}`);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });

  return (
    <form action={formAction}>
      <input {...register("email")} type="email" />
      {getFieldError("email") && <span>{getFieldError("email").message}</span>}

      <input {...register("password")} type="password" />
      {getFieldError("password") && (
        <span>{getFieldError("password").message}</span>
      )}

      <input {...register("confirmPassword")} type="password" />
      {getFieldError("confirmPassword") && (
        <span>{getFieldError("confirmPassword").message}</span>
      )}

      <input {...register("age")} type="number" />
      {getFieldError("age") && <span>{getFieldError("age").message}</span>}

      <button type="submit" disabled={buttonDisabled}>
        {isPending ? "Creating Account..." : "Create Account"}
      </button>
    </form>
  );
}
```

### Programmatic Action Execution

```typescript
function MyComponent() {
  const { executeAction, isPending } = useActionize({
    schema: mySchema,
    action: myAction,
    initialData: {
      /* ... */
    },
  });

  const handleSpecialAction = async () => {
    await executeAction({
      name: "special value",
      // ... other data
    });
  };

  return (
    <button onClick={handleSpecialAction} disabled={isPending}>
      Execute Special Action
    </button>
  );
}
```

## Requirements

- React 19.0.0 or higher
- Next.js (for server actions)
- Zod 3.0.0 or higher
- TypeScript (recommended)

## Best Practices

1. **Schema Definition**: Define your schemas in separate files for reusability
2. **Error Handling**: Always provide `onError` handlers for better UX
3. **Loading States**: Use `isPending` to show loading indicators
4. **Validation**: Leverage Zod's powerful validation features for complex rules
5. **Type Safety**: Let TypeScript infer types from your schemas

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT © Aimen Merabta

## Changelog

### 1.0.0

- Initial release
- Server action creation with Zod validation
- React hook for form management
- TypeScript support
- Real-time validation
