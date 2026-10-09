import { Router, type IRouter } from "express";
import healthRouter from "./health";
import mcpRouter from "./mcp";
import paymentsRouter from "./payments";

const router: IRouter = Router();

router.use(healthRouter);
router.use(mcpRouter);
router.use(paymentsRouter);

export default router;
