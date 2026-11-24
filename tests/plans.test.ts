import { describe, expect, it } from "vitest";
import { subscriptionPlans } from "@/lib/plans";

describe("subscription plan configuration", () => {
  it("Basic, Plus və Ultra planlarını düzgün ardıcıllıqla saxlayır", () => {
    expect(subscriptionPlans.map((plan) => plan.id)).toEqual(["basic", "plus", "ultra"]);
  });

  it("Plus planını tövsiyə olunan plan kimi vurğulayır", () => {
    const plus = subscriptionPlans.find((plan) => plan.id === "plus");
    expect(plus?.featured).toBe(true);
    expect(plus?.current).toBe(true);
  });

  it("Ultra üçün sabit qiymət və süni şagird limiti təyin etmir", () => {
    const ultra = subscriptionPlans.find((plan) => plan.id === "ultra");
    expect(ultra?.price).toBeNull();
    expect(ultra?.priceLabel).toBe("Fərdi qiymət");
    expect(ultra?.studentLimit).toContain("Ehtiyacınıza uyğun");
  });
});
