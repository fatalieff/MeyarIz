import { describe,expect,it } from "vitest";
import { teacherProfileSchema } from "@/lib/validations/schemas";

describe("teacher profile validation",()=>{
  it("trims valid profile values",()=>expect(teacherProfileSchema.parse({fullName:"  Aysel Məmmədova  ",workspaceName:"  MathRank  "})).toEqual({fullName:"Aysel Məmmədova",workspaceName:"MathRank"}));
  it("rejects an empty workspace name",()=>expect(teacherProfileSchema.safeParse({fullName:"Aysel Məmmədova",workspaceName:" "}).success).toBe(false));
});
