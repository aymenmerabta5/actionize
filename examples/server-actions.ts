// examples/server-actions.ts
"use server";

import * as z from "zod";
import { createServerAction } from "next-actionize";

// Basic name validation example
const nameSchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(50, "Name must not exceed 50 characters"),
});

export const nameAction = createServerAction(nameSchema, async (data) => {
  console.log("Processing name:", data.name);

  // Simulate some processing time
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return { name: data.name.trim(), timestamp: new Date().toISOString() };
});

// User registration example
const userRegistrationSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number"
    ),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  age: z
    .number()
    .int("Age must be a whole number")
    .min(18, "You must be at least 18 years old")
    .max(120, "Please enter a valid age"),
});

export const registerUserAction = createServerAction(
  userRegistrationSchema,
  async (data) => {
    console.log("Registering user:", data);

    // Simulate user creation
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // In a real app, you would:
    // 1. Hash the password
    // 2. Save to database
    // 3. Send welcome email
    // 4. Return user data (without password)

    return {
      email: data.email,
      firstName: data.firstName,
      lastName: data.lastName,
      age: data.age,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date().toISOString(),
    };
  }
);

// Contact form example
const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters long"),
});

export const contactAction = createServerAction(contactSchema, async (data) => {
  console.log("Contact form submission:", data);

  // In a real app, you would:
  // 1. Send email to support team
  // 2. Save to database
  // 3. Send confirmation email to user

  await new Promise((resolve) => setTimeout(resolve, 1500));

  return {
    success: true,
    message: "Thank you for your message. We'll get back to you soon!",
    submittedAt: new Date().toISOString(),
  };
});
