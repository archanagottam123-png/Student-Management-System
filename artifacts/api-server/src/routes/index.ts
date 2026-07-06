import { Router, type IRouter } from "express";
import healthRouter from "./health";
import dashboardRouter from "./dashboard";
import departmentsRouter from "./departments";
import coursesRouter from "./courses";
import studentsRouter from "./students";

const router: IRouter = Router();

router.use(healthRouter);
router.use(dashboardRouter);
router.use(departmentsRouter);
router.use(coursesRouter);
router.use(studentsRouter);

export default router;
