import { createServerAction, createActionConfig } from "./createAction";
import * as z from "zod";

describe("createServerAction", () => {
  it("should create a server action function", () => {
    const schema = z.object({
      name: z.string(),
    });

    const handler = jest.fn().mockResolvedValue({ name: "test" });
    const action = createServerAction(schema, handler);

    expect(typeof action).toBe("function");
  });

  it("should handle form data correctly", async () => {
    const schema = z.object({
      name: z.string(),
    });

    const handler = jest.fn().mockResolvedValue({ name: "John" });
    const action = createServerAction(schema, handler);

    const formData = new FormData();
    formData.append("name", "John");

    const result = await action({ name: "" }, formData);

    expect(handler).toHaveBeenCalledWith({ name: "John" });
    expect(result).toEqual({ name: "John" });
  });

  it("should throw error for invalid data", async () => {
    const schema = z.object({
      name: z.string().min(1),
    });

    const handler = jest.fn();
    const action = createServerAction(schema, handler);

    const formData = new FormData();
    formData.append("name", "");

    await expect(action({ name: "" }, formData)).rejects.toThrow();
    expect(handler).not.toHaveBeenCalled();
  });
});

describe("createActionConfig", () => {
  it("should create action configuration object", () => {
    const schema = z.object({
      name: z.string(),
    });

    const action = jest.fn();
    const initialData = { name: "" };

    const config = createActionConfig(schema, action, initialData);

    expect(config.schema).toBe(schema);
    expect(config.action).toBe(action);
    expect(config.initialData).toBe(initialData);
  });
});
