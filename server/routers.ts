import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { z } from "zod";
import { getAllProducts, getProductById, createProduct, updateProduct, deleteProduct } from "./db";
import { storagePut } from "./storage";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),

  // Product management router
  products: router({
    // Get all products (public)
    list: publicProcedure.query(() => getAllProducts()),
    
    // Get single product (public)
    get: publicProcedure
      .input(z.object({ id: z.string() }))
      .query(({ input }) => getProductById(input.id)),
    
    // Create product (admin only)
    create: protectedProcedure
      .input(z.object({
        name: z.string().min(1),
        category: z.enum(["men", "women", "accessories"]),
        price: z.string().or(z.number()),
        image: z.string().url(),
        description: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can create products");
        }
        return createProduct({
          id: `product-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: input.name,
          category: input.category,
          price: input.price.toString(),
          image: input.image,
          description: input.description,
        });
      }),
    
    // Update product (admin only)
    update: protectedProcedure
      .input(z.object({
        id: z.string(),
        name: z.string().min(1).optional(),
        category: z.enum(["men", "women", "accessories"]).optional(),
        price: z.string().or(z.number()).optional(),
        image: z.string().url().optional(),
        description: z.string().min(1).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can update products");
        }
        const { id, price, ...rest } = input;
        const updates: any = rest;
        if (price !== undefined) {
          updates.price = price.toString();
        }
        return updateProduct(id, updates);
      }),
    
    // Delete product (admin only)
    delete: protectedProcedure
      .input(z.object({ id: z.string() }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can delete products");
        }
        await deleteProduct(input.id);
        return { success: true };
      }),
    
    // Upload product image
    uploadImage: protectedProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        if (ctx.user?.role !== "admin") {
          throw new Error("Only admins can upload images");
        }
        
        const buffer = Buffer.from(input.fileData, "base64");
        const fileKey = `products/${ctx.user.id}/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        
        return { url, fileKey };
      }),
  }),
});

export type AppRouter = typeof appRouter;
