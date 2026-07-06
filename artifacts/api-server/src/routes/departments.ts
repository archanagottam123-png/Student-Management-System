import { Router, type IRouter } from "express";
import { eq, sql } from "drizzle-orm";
import { db, departmentsTable, coursesTable, studentsTable } from "@workspace/db";
import {
  CreateDepartmentBody,
  UpdateDepartmentBody,
  GetDepartmentParams,
  UpdateDepartmentParams,
  DeleteDepartmentParams,
  ListDepartmentsResponse,
  GetDepartmentResponse,
  CreateDepartmentResponse,
  UpdateDepartmentResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/departments", async (_req, res): Promise<void> => {
  const rows = await db
    .select({
      id: departmentsTable.id,
      name: departmentsTable.name,
      code: departmentsTable.code,
      description: departmentsTable.description,
      studentCount: sql<number>`count(distinct ${studentsTable.id})::int`,
      courseCount: sql<number>`count(distinct ${coursesTable.id})::int`,
    })
    .from(departmentsTable)
    .leftJoin(studentsTable, eq(studentsTable.departmentId, departmentsTable.id))
    .leftJoin(coursesTable, eq(coursesTable.departmentId, departmentsTable.id))
    .groupBy(departmentsTable.id)
    .orderBy(departmentsTable.name);

  res.json(ListDepartmentsResponse.parse(rows));
});

router.post("/departments", async (req, res): Promise<void> => {
  const parsed = CreateDepartmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [department] = await db
    .insert(departmentsTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(
    CreateDepartmentResponse.parse({ ...department, studentCount: 0, courseCount: 0 }),
  );
});

router.get("/departments/:id", async (req, res): Promise<void> => {
  const params = GetDepartmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select({
      id: departmentsTable.id,
      name: departmentsTable.name,
      code: departmentsTable.code,
      description: departmentsTable.description,
      studentCount: sql<number>`count(distinct ${studentsTable.id})::int`,
      courseCount: sql<number>`count(distinct ${coursesTable.id})::int`,
    })
    .from(departmentsTable)
    .leftJoin(studentsTable, eq(studentsTable.departmentId, departmentsTable.id))
    .leftJoin(coursesTable, eq(coursesTable.departmentId, departmentsTable.id))
    .where(eq(departmentsTable.id, params.data.id))
    .groupBy(departmentsTable.id);

  if (!row) {
    res.status(404).json({ error: "Department not found" });
    return;
  }

  res.json(GetDepartmentResponse.parse(row));
});

router.put("/departments/:id", async (req, res): Promise<void> => {
  const params = UpdateDepartmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateDepartmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [department] = await db
    .update(departmentsTable)
    .set(parsed.data)
    .where(eq(departmentsTable.id, params.data.id))
    .returning();

  if (!department) {
    res.status(404).json({ error: "Department not found" });
    return;
  }

  const [counts] = await db
    .select({
      studentCount: sql<number>`count(distinct ${studentsTable.id})::int`,
      courseCount: sql<number>`count(distinct ${coursesTable.id})::int`,
    })
    .from(departmentsTable)
    .leftJoin(studentsTable, eq(studentsTable.departmentId, departmentsTable.id))
    .leftJoin(coursesTable, eq(coursesTable.departmentId, departmentsTable.id))
    .where(eq(departmentsTable.id, params.data.id))
    .groupBy(departmentsTable.id);

  res.json(
    UpdateDepartmentResponse.parse({
      ...department,
      studentCount: counts?.studentCount ?? 0,
      courseCount: counts?.courseCount ?? 0,
    }),
  );
});

router.delete("/departments/:id", async (req, res): Promise<void> => {
  const params = DeleteDepartmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [department] = await db
    .delete(departmentsTable)
    .where(eq(departmentsTable.id, params.data.id))
    .returning();

  if (!department) {
    res.status(404).json({ error: "Department not found" });
    return;
  }

  res.sendStatus(204);
});

export default router;
