import { describe, it, expect } from "vitest";
import { PaymentError } from "../payment.error";

describe("PaymentError", () => {
  it("has statusCode 400", () => {
    const	error = new PaymentError("test message");
    expect(error.statusCode).toBe(400);
  });

  it("has name PaymentError", () => {
    const error = new PaymentError("test message");
    expect(error.name).toBe("PaymentError");
  });

  it("stores the message", () => {
    const error = new PaymentError("Payment processing failed");
    expect(error.message).toBe("Payment processing failed");
  });

  it("is an instance of Error", () => {
    const error = new PaymentError("test");
    expect(error instanceof Error).toBe(true);
  });
});
