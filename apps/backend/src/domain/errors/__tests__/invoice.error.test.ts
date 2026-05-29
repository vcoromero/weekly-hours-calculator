import { describe, it, expect } from "vitest";
import { InvoiceError } from "../invoice.error";

describe("InvoiceError", () => {
  it("has statusCode 400", () => {
    const error = new InvoiceError("test message");
    expect(error.statusCode).toBe(400);
  });

  it("has name InvoiceError", () => {
    const error = new InvoiceError("test message");
    expect(error.name).toBe("InvoiceError");
  });

  it("stores the message", () => {
    const error = new InvoiceError("Invoice generation failed");
    expect(error.message).toBe("Invoice generation failed");
  });

  it("is an instance of Error", () => {
    const error = new InvoiceError("test");
    expect(error instanceof Error).toBe(true);
  });
});
