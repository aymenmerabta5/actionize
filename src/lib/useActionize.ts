"use client";

import { useState, useActionState, useTransition, useCallback } from "react";
import * as z from "zod";

interface ActionizeInput<TSchema extends z.ZodObject<any>> {
  schema: TSchema;
  action: (
    prevState: z.output<TSchema>,
    formData: FormData
  ) => Promise<z.output<TSchema>>;
  initialData: z.output<TSchema>;
  onSuccess?: (data: z.output<TSchema>) => void;
  onError?: (error: Error & { message: string | string[] }) => void;
}

interface FieldError {
  message: string;
  type: string;
}

/**
 * A React hook for managing forms with Zod schema validation and server actions.
 *
 * This hook provides comprehensive form state management, real-time validation,
 * error handling, and seamless integration with Next.js server actions.
 *
 * @template TSchema - The Zod object schema type for form validation
 * @param config - Configuration object containing schema, action, and callbacks
 * @param config.schema - Zod object schema for validating form data
 * @param config.action - Server action function that processes validated data
 * @param config.initialData - Initial form state that matches the schema
 * @param config.onSuccess - Optional callback executed on successful form submission
 * @param config.onError - Optional callback executed when an error occurs
 * @returns Object containing form state, validation methods, and action handlers
 *
 * @example
 * ```typescript
 * const userSchema = z.object({
 *   name: z.string().min(1, "Name is required"),
 *   email: z.string().email("Invalid email format")
 * });
 *
 * const userAction = createServerAction(userSchema, async (data) => {
 *   // Process user data on server
 *   return { name: data.name, email: data.email };
 * });
 *
 * function UserForm() {
 *   const {
 *     register,
 *     formAction,
 *     getFieldError,
 *     isPending,
 *     isValid
 *   } = useActionize({
 *     schema: userSchema,
 *     action: userAction,
 *     initialData: { name: "", email: "" },
 *     onSuccess: (data) => console.log("User saved:", data),
 *     onError: (error) => console.error("Form error:", error)
 *   });
 *
 *   return (
 *     <form action={formAction}>
 *       <input {...register("name")} placeholder="Name" />
 *       {getFieldError("name") && <span>{getFieldError("name").message}</span>}
 *
 *       <input {...register("email")} placeholder="Email" />
 *       {getFieldError("email") && <span>{getFieldError("email").message}</span>}
 *
 *       <button type="submit" disabled={!isValid || isPending}>
 *         {isPending ? "Saving..." : "Save User"}
 *       </button>
 *     </form>
 *   );
 * }
 * ```
 */
export const useActionize = <TSchema extends z.ZodObject<any>>({
  schema,
  action,
  initialData,
  onSuccess,
  onError,
}: ActionizeInput<TSchema>) => {
  const [isPending, startTransition] = useTransition();

  const wrappedAction = useCallback(
    async (state: Awaited<z.output<TSchema>>, formData: FormData) => {
      return await action(state as z.output<TSchema>, formData);
    },
    [action]
  );

  const [state] = useActionState(
    wrappedAction,
    initialData as Awaited<z.output<TSchema>>
  );

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [errors, setErrors] = useState<Record<string, FieldError>>({});
  const [touchedFields, setTouchedFields] = useState<Set<string>>(new Set());

  const validateField = useCallback(
    (name: string, value: any) => {
      try {
        const fieldSchema = schema.shape?.[name];
        if (fieldSchema) {
          fieldSchema.parse(value);
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors[name];
            return newErrors;
          });
        }
      } catch (error) {
        if (error instanceof z.ZodError) {
          setErrors((prev) => ({
            ...prev,
            [name]: {
              message: error.issues[0]?.message || "Invalid value",
              type: error.issues[0]?.code || "invalid",
            },
          }));
        }
      }
    },
    [schema]
  );

  const register = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (name: string, _options?: { required?: boolean }) => {
      return {
        name,
        onChange: (
          e: React.ChangeEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        ) => {
          const value = e.target.value;
          setFormData((prev) => ({ ...prev, [name]: value }));

          if (touchedFields.has(name)) {
            validateField(name, value);
          }
        },
        onBlur: (
          e: React.FocusEvent<
            HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
          >
        ) => {
          const value = e.target.value;
          setTouchedFields((prev) => new Set(prev).add(name));
          validateField(name, value);
        },
        value: formData[name] || "",
      };
    },
    [formData, touchedFields, validateField]
  );

  const getFieldError = useCallback(
    (name: string) => {
      return errors[name];
    },
    [errors]
  );

  const isValid = Object.keys(errors).length === 0;
  const enhancedFormAction = useCallback(
    async (formDataObj: FormData) => {
      try {
        const data = Object.fromEntries(formDataObj.entries());
        schema.parse(data);
        setErrors({});
        startTransition(async () => {
          try {
            const result = await action(
              state as z.output<TSchema>,
              formDataObj
            );
            if (onSuccess) {
              onSuccess(result);
            }
          } catch (error) {
            if (onError) {
              onError(error as Error & { message: string | string[] });
            }
          }
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          const fieldErrors: Record<string, FieldError> = {};
          error.issues.forEach((issue) => {
            const fieldName = issue.path[0]?.toString();
            if (fieldName) {
              fieldErrors[fieldName] = {
                message: issue.message,
                type: issue.code,
              };
            }
          });
          setErrors(fieldErrors);
        }
      }
    },
    [action, state, schema, onSuccess, onError]
  );

  const executeAction = useCallback(
    async (data?: Record<string, any>) => {
      try {
        const formData = new FormData();
        const dataToSubmit = data || formData;

        if (data) {
          Object.entries(data).forEach(([key, value]) => {
            formData.append(key, String(value));
          });
        }
        schema.parse(dataToSubmit);

        startTransition(async () => {
          try {
            const result = await action(state as z.output<TSchema>, formData);
            if (onSuccess) {
              onSuccess(result);
            }
          } catch (error) {
            if (onError) {
              onError(error as Error & { message: string | string[] });
            }
          }
        });
      } catch (error) {
        if (error instanceof z.ZodError && onError) {
          onError(
            new Error(
              error.issues.map((issue) => issue.message).join(", ")
            ) as Error & { message: string | string[] }
          );
        }
      }
    },
    [action, state, schema, onSuccess, onError]
  );

  const buttonDisabled = isPending || !isValid;

  return {
    state,
    isPending,
    isValid,
    buttonDisabled,
    errors,
    register,
    getFieldError,
    formAction: enhancedFormAction,
    executeAction,
    formData,
  };
};
