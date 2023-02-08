import { router } from "../trpc";
import { locationRouter } from "./location";
import { authRouter } from "./auth";

export const appRouter = router({
  location: locationRouter,
  auth: authRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
