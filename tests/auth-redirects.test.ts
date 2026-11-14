import { describe,expect,it } from "vitest";
import { safeNextPath } from "@/lib/auth/redirects";

describe("auth callback redirects",()=>{
  it("allows an internal reset path",()=>expect(safeNextPath("/reset-password")).toBe("/reset-password"));
  it("blocks absolute external URLs",()=>expect(safeNextPath("https://example.com")).toBe("/dashboard"));
  it("blocks protocol-relative URLs",()=>expect(safeNextPath("//example.com")).toBe("/dashboard"));
});
