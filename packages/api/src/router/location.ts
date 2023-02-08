import { router, publicProcedure, protectedProcedure } from "../trpc";
import { z } from "zod";

export const locationRouter = router({
  all: publicProcedure.query(({ ctx }) => {
    return ctx.prisma.location.findMany();
  }),
  byId: publicProcedure.input(z.string()).query(({ ctx, input }) => {
    return ctx.prisma.location.findFirst({ where: { id: input } });
  }),
  delete: protectedProcedure.input(z.string()).mutation(({ ctx, input }) => {
    return ctx.prisma.location.delete({ where: { id: input } });
  }),
  create: protectedProcedure
    .input(z.object({ name: z.string(), distance: z.number() }))
    .mutation(({ ctx, input }) => {
      return ctx.prisma.location.create({ data: input });
    }),
});
