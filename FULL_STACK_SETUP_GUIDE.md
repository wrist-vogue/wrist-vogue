# Full-Stack Setup Guide - Wrist Vogue with File Storage

This guide provides all the code you need to manually update your project files for the full-stack upgrade with file storage support.

## Files to Update/Create

### 1. `drizzle/schema.ts` - Add Products Table

Replace the entire file with this code:

```typescript
import { int, mysqlEnum, mysqlTable, text, timestamp, varchar, decimal } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// Products table for Wrist Vogue
export const products = mysqlTable("products", {
  id: varchar("id", { length: 64 }).primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["men", "women", "accessories"]).notNull(),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: text("image").notNull(), // URL to S3 or external image
  description: text("description").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;
```

**After updating this file, run in terminal:**
```bash
cd /home/ubuntu/wrist-vogue
pnpm db:push
```

---

### 2. `server/db.ts` - Add Product Query Helpers

Replace the entire file with this code:

```typescript
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, InsertProduct } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Product queries for Wrist Vogue
export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(products);
}

export async function getProductById(id: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(product: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(products).values(product);
  return product;
}

export async function updateProduct(id: string, updates: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(products).set(updates).where(eq(products.id, id));
  return getProductById(id);
}

export async function deleteProduct(id: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(products).where(eq(products.id, id));
}
```

---

### 3. `server/routers.ts` - Add Product Management API

Replace the entire file with this code:

```typescript
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
```

---

### 4. `client/src/App.tsx` - Update Routes

Replace the entire file with this code:

```typescript
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import AdminPanel from "./pages/AdminPanel";

/**
 * DESIGN PHILOSOPHY: Minimalist Luxury - "The Void Elegance"
 * - Deep black background (#0a0a0a) creates a void that makes gold accents shine
 * - White text for maximum contrast and readability
 * - Gold (#d4af37) as the sole accent color for interactive elements
 * - Smooth 300-400ms transitions throughout
 * - Playfair Display for elegant headings, Lato for clean body text
 */
function Router() {
  // make sure to consider if you need authentication for certain routes
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/admin"} component={AdminPanel} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="dark">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
```

---

### 5. `client/src/pages/AdminPanel.tsx` - Create New Admin Page

Create a new file at `client/src/pages/AdminPanel.tsx` with this code:

```typescript
import { useState } from "react";
import { Plus, Edit2, Trash2, X, Upload, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";

interface Product {
  id: string;
  name: string;
  category: "men" | "women" | "accessories";
  price: string | number;
  image: string;
  description: string;
}

export default function AdminPanel() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    category: "men",
    price: 0,
    image: "",
    description: ""
  });

  // Fetch products
  const { data: products = [], isLoading, refetch } = trpc.products.list.useQuery();
  const createMutation = trpc.products.create.useMutation();
  const updateMutation = trpc.products.update.useMutation();
  const deleteMutation = trpc.products.delete.useMutation();
  const uploadMutation = trpc.products.uploadImage.useMutation();

  // Redirect if not admin
  if (user && user.role !== "admin") {
    setLocation("/");
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const base64Data = base64.split(",")[1];

        const result = await uploadMutation.mutateAsync({
          fileName: file.name,
          fileData: base64Data,
          mimeType: file.type,
        });

        setFormData(prev => ({
          ...prev,
          image: result.url
        }));
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Upload failed:", error);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.price || !formData.image || !formData.description) {
      alert("Please fill in all fields");
      return;
    }

    try {
      if (editingId) {
        await updateMutation.mutateAsync({
          id: editingId,
          name: formData.name,
          category: formData.category as "men" | "women" | "accessories",
          price: formData.price,
          image: formData.image,
          description: formData.description,
        });
      } else {
        await createMutation.mutateAsync({
          name: formData.name,
          category: formData.category as "men" | "women" | "accessories",
          price: formData.price,
          image: formData.image,
          description: formData.description,
        });
      }

      setFormData({
        name: "",
        category: "men",
        price: 0,
        image: "",
        description: ""
      });
      setEditingId(null);
      setShowForm(false);
      refetch();
    } catch (error) {
      console.error("Submit failed:", error);
      alert("Failed to save product");
    }
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      try {
        await deleteMutation.mutateAsync({ id });
        refetch();
      } catch (error) {
        console.error("Delete failed:", error);
        alert("Failed to delete product");
      }
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: "",
      category: "men",
      price: 0,
      image: "",
      description: ""
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container flex items-center justify-between h-20">
          <h1 className="text-2xl font-bold tracking-wider">WRIST VOGUE - Admin</h1>
          <a href="/" className="hover-gold-underline text-sm uppercase tracking-wider transition-smooth">
            Back to Store
          </a>
        </div>
      </header>

      <main className="pt-24 pb-12">
        <div className="container">
          <div className="flex items-center justify-between mb-12">
            <h2 className="text-4xl font-bold">Product Management</h2>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth flex items-center gap-2"
            >
              <Plus size={20} />
              Add Product
            </Button>
          </div>

          {/* Form */}
          {showForm && (
            <div className="bg-card border border-border p-8 mb-12 animate-slide-up">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold">
                  {editingId ? "Edit Product" : "Add New Product"}
                </h3>
                <button
                  onClick={handleCancel}
                  className="transition-smooth hover:text-primary"
                >
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold mb-2">Product Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-smooth"
                      placeholder="e.g., Chronograph Elite"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category || "men"}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-smooth"
                    >
                      <option value="men">Men</option>
                      <option value="women">Women</option>
                      <option value="accessories">Accessories</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Price ($)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-smooth"
                      placeholder="e.g., 2499"
                      step="0.01"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">Image Upload</label>
                    <div className="flex gap-2">
                      <label className="flex-1 px-4 py-2 bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-smooth cursor-pointer hover:border-primary flex items-center gap-2">
                        <Upload size={18} />
                        {uploading ? "Uploading..." : "Choose File"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          className="hidden"
                        />
                      </label>
                    </div>
                    {formData.image && (
                      <div className="mt-2 text-sm text-green-500">
                        ✓ Image uploaded
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold mb-2">Description</label>
                  <textarea
                    name="description"
                    value={formData.description || ""}
                    onChange={handleInputChange}
                    className="w-full px-4 py-2 bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-smooth"
                    placeholder="Product description..."
                    rows={4}
                  />
                </div>

                {formData.image && (
                  <div className="mt-4">
                    <p className="text-sm font-semibold mb-2">Preview:</p>
                    <img src={formData.image} alt="Preview" className="w-32 h-32 object-cover" />
                  </div>
                )}

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    disabled={createMutation.isPending || updateMutation.isPending}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth flex items-center gap-2"
                  >
                    {createMutation.isPending || updateMutation.isPending ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Saving...
                      </>
                    ) : (
                      editingId ? "Update Product" : "Add Product"
                    )}
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCancel}
                    className="bg-muted text-muted-foreground hover:bg-muted/80 transition-smooth"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Products Table */}
          {isLoading ? (
            <div className="text-center py-12">
              <Loader2 className="animate-spin mx-auto mb-4" />
              <p>Loading products...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-semibold">Product</th>
                    <th className="text-left py-4 px-4 font-semibold">Category</th>
                    <th className="text-left py-4 px-4 font-semibold">Price</th>
                    <th className="text-left py-4 px-4 font-semibold">Description</th>
                    <th className="text-left py-4 px-4 font-semibold">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map(product => (
                    <tr key={product.id} className="border-b border-border hover:bg-card/50 transition-smooth">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-4">
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-12 h-12 object-cover"
                          />
                          <span className="font-semibold">{product.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 capitalize">{product.category}</td>
                      <td className="py-4 px-4 text-primary font-bold">${product.price}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground max-w-xs truncate">
                        {product.description}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(product)}
                            className="p-2 hover:bg-card transition-smooth text-primary"
                            title="Edit"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            disabled={deleteMutation.isPending}
                            className="p-2 hover:bg-card transition-smooth text-destructive disabled:opacity-50"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!isLoading && products.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground mb-6">No products yet. Add your first product!</p>
              <Button
                onClick={() => setShowForm(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth"
              >
                Add First Product
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
```

---

## Setup Steps

1. **Update `drizzle/schema.ts`** - Copy the code from section 1
2. **Update `server/db.ts`** - Copy the code from section 2
3. **Update `server/routers.ts`** - Copy the code from section 3
4. **Update `client/src/App.tsx`** - Copy the code from section 4
5. **Create `client/src/pages/AdminPanel.tsx`** - Copy the code from section 5

Then run these commands in your terminal:

```bash
cd /home/ubuntu/wrist-vogue

# Push database schema changes
pnpm db:push

# Restart the dev server
pnpm dev
```

## Features

✅ **Database Integration** - Products stored in MySQL database  
✅ **File Upload** - Upload product images directly to S3 storage  
✅ **Admin Panel** - Full CRUD operations for products  
✅ **API Endpoints** - tRPC procedures for all product operations  
✅ **Authentication** - Admin-only access to product management  
✅ **Real-time Updates** - Products sync across all pages  

## Next Steps

1. Paste all the code into the respective files
2. Run `pnpm db:push` to create the database tables
3. Restart the dev server with `pnpm dev`
4. Visit `/admin` to manage products
5. Upload product images directly from the admin panel
6. The images will be stored in S3 and products in the database

---

**Need help?** Check the error logs in the terminal or browser console for any issues.
