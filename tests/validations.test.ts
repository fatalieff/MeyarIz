import { describe,expect,it } from "vitest";
import { examSchema,groupIdSchema,groupSchema,studentUpdateSchema,teacherProfileSchema } from "@/lib/validations/schemas";

describe("teacher profile validation",()=>{
  it("trims valid profile values",()=>expect(teacherProfileSchema.parse({fullName:"  Aysel Məmmədova  ",workspaceName:"  MathRank  "})).toEqual({fullName:"Aysel Məmmədova",workspaceName:"MathRank"}));
  it("rejects an empty workspace name",()=>expect(teacherProfileSchema.safeParse({fullName:"Aysel Məmmədova",workspaceName:" "}).success).toBe(false));
});

describe("student update validation",()=>{
  it("accepts editable student and parent fields",()=>expect(studentUpdateSchema.parse({fullName:"  Əli Məmmədov  ",groupId:"11111111-1111-4111-8111-111111111111",phone:"",preparationLevel:"orta",privateNotes:"",motherName:"  Aygün Məmmədova  ",motherPhone:"+994 50 111 22 33",fatherName:"",fatherPhone:""})).toMatchObject({fullName:"Əli Məmmədov",preparationLevel:"orta",motherName:"Aygün Məmmədova",motherPhone:"+994 50 111 22 33"}));
  it("rejects an invalid group",()=>expect(studentUpdateSchema.safeParse({fullName:"Əli Məmmədov",groupId:"not-a-group"}).success).toBe(false));
});

describe("group update validation",()=>{
  it("accepts and trims editable group fields",()=>expect(groupSchema.parse({name:"  Abituriyent 2027  ",description:" Riyaziyyat qrupu ",preparationLevel:"orta",color:"#4f5fe7"})).toMatchObject({name:"Abituriyent 2027",description:"Riyaziyyat qrupu",color:"#4f5fe7"}));
  it("rejects an invalid group id",()=>expect(groupIdSchema.safeParse("invalid").success).toBe(false));
});

describe("multi-group exam validation",()=>{
  const base={title:"Noyabr sınağı",groupIds:["11111111-1111-4111-8111-111111111111","22222222-2222-4222-8222-222222222222"],examDate:"2026-11-20",totalQuestions:"25",description:""};
  it("accepts multiple groups",()=>expect(examSchema.parse(base).groupIds).toHaveLength(2));
  it("removes duplicate groups",()=>expect(examSchema.parse({...base,groupIds:[base.groupIds[0],base.groupIds[0]]}).groupIds).toEqual([base.groupIds[0]]));
  it("requires at least one group",()=>expect(examSchema.safeParse({...base,groupIds:[]}).success).toBe(false));
});
