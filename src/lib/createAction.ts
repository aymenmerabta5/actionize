import * as z from "zod";

/**
 * Creates a server action with Zod schema validation.
 *
 * @template TSchema - The Zod schema type
 * @param schema - Zod schema for validating the form data
 * @param handler - Async function that processes the validated data
 * @returns A server action function compatible with Next.js
 *
 * @example
 * ```typescript
 * const nameSchema = z.object({
 *   name: z.string().min(1, "Name is required")
 * });
 *
 * export const nameAction = createServerAction(nameSchema, async (data) => {
 *   console.log("Processing:", data.name);
 *   return { name: data.name.trim() };
 * });
 * ```
 */
export const createServerAction = <TSchema extends z.ZodType>(
  schema: TSchema,
  handler: (data: z.infer<TSchema>) => Promise<z.infer<TSchema>>
) => {
  return async (prevState: z.infer<TSchema>, formData: FormData) => {
    try {
      const data = Object.fromEntries(formData.entries());
      const parsedData = schema.parse(data);
      return await handler(parsedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(error.issues.map((issue) => issue.message).join(", "));
      }
      throw error;
    }
  };
};

/**
 * Creates a configuration object for use with the useActionize hook.
 *
 * @template TSchema - The Zod schema type
 * @param schema - Zod schema for form validation
 * @param action - Server action created with createServerAction
 * @param initialData - Initial state data that matches the schema
 * @returns Configuration object for useActionize hook
 *
 * @example
 * ```typescript
 * export const nameActionConfig = createActionConfig(
 *   nameSchema,
 *   nameAction,
 *   { name: "" }
 * );
 * ```
 */
export const createActionConfig = <TSchema extends z.ZodType>(
  schema: TSchema,
  action: (
    prevState: z.infer<TSchema>,
    formData: FormData
  ) => Promise<z.infer<TSchema>>,
  initialData: z.infer<TSchema>
) => {
  return {
    schema,
    action,
    initialData,
  };
};
