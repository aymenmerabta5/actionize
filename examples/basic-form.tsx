// examples/basic-form.tsx
"use client";

import React from "react";
import { useActionize, createActionConfig } from "next-actionize";
import * as z from "zod";

// This would typically be in a separate server action file
// For this example, we'll assume you have the nameAction imported
// import { nameAction } from "./server-actions";

const nameSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must not exceed 50 characters"),
});

// You would create this config in a separate file
// export const nameActionConfig = createActionConfig(
//   nameSchema,
//   nameAction,
//   { name: "" }
// );

export default function BasicForm() {
  // Assuming you have imported nameActionConfig
  const {
    state,
    isPending,
    isValid,
    register,
    getFieldError,
    formAction,
    buttonDisabled,
  } = useActionize({
    schema: nameSchema,
    action: async (prevState, formData) => {
      // This would be your actual server action
      const data = Object.fromEntries(formData.entries());
      console.log("Form submitted:", data);
      return { name: data.name as string };
    },
    initialData: { name: "" },
    onError: (error) => {
      console.error("Form error:", error.message);
      // You could show a toast notification here
    },
    onSuccess: (result) => {
      console.log("Form submitted successfully:", result);
      // You could show a success message or redirect here
    },
  });

  return (
    <div className="max-w-md mx-auto mt-8 p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">
        Basic Form Example
      </h2>

      <form action={formAction} className="space-y-4">
        <div>
          <label
            htmlFor="name"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Name
          </label>
          <input
            {...register("name")}
            type="text"
            placeholder="Enter your name"
            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              getFieldError("name") ? "border-red-500" : "border-gray-300"
            }`}
          />
          {getFieldError("name") && (
            <p className="mt-1 text-sm text-red-600">
              {getFieldError("name").message}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={buttonDisabled}
          className={`w-full py-2 px-4 rounded-md font-medium transition-colors ${
            buttonDisabled
              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
              : "bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          }`}
        >
          {isPending ? "Submitting..." : "Submit"}
        </button>
      </form>

      {state.name && (
        <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-md">
          <p className="text-green-800">Current state: {state.name}</p>
        </div>
      )}

      <div className="mt-4 text-sm text-gray-600">
        <p>Form valid: {isValid ? "✅" : "❌"}</p>
        <p>Is pending: {isPending ? "⏳" : "✅"}</p>
      </div>
    </div>
  );
}
