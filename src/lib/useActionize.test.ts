/**
 * @jest-environment jsdom
 */
import { renderHook, act } from "@testing-library/react";
import { useActionize } from "./useActionize";
import * as z from "zod";

jest.mock("react", () => ({
  ...jest.requireActual("react"),
  useActionState: jest.fn((action, initialState) => [initialState, action]),
  useTransition: jest.fn(() => [false, jest.fn()]),
}));

describe("useActionize", () => {
  const schema = z.object({
    name: z.string().min(1, "Name is required"),
  });

  const mockAction = jest.fn().mockResolvedValue({ name: "test" });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should initialize with correct default values", () => {
    const { result } = renderHook(() =>
      useActionize({
        schema,
        action: mockAction,
        initialData: { name: "" },
      })
    );

    expect(result.current.isPending).toBe(false);
    expect(result.current.isValid).toBe(true);
    expect(result.current.errors).toEqual({});
    expect(result.current.formData).toEqual({});
  });

  it("should provide register function with correct properties", () => {
    const { result } = renderHook(() =>
      useActionize({
        schema,
        action: mockAction,
        initialData: { name: "" },
      })
    );

    const registerResult = result.current.register("name");

    expect(registerResult).toHaveProperty("name", "name");
    expect(registerResult).toHaveProperty("onChange");
    expect(registerResult).toHaveProperty("onBlur");
    expect(registerResult).toHaveProperty("value", "");
  });

  it("should return getFieldError function", () => {
    const { result } = renderHook(() =>
      useActionize({
        schema,
        action: mockAction,
        initialData: { name: "" },
      })
    );

    expect(typeof result.current.getFieldError).toBe("function");
    expect(result.current.getFieldError("name")).toBeUndefined();
  });

  it("should provide formAction and executeAction functions", () => {
    const { result } = renderHook(() =>
      useActionize({
        schema,
        action: mockAction,
        initialData: { name: "" },
      })
    );

    expect(typeof result.current.formAction).toBe("function");
    expect(typeof result.current.executeAction).toBe("function");
  });
});
