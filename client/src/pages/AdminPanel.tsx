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
                    <label className="block text-sm font-semibold mb-2">Price (UGX)</label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-smooth"
                      placeholder="e.g., 2500000"
                      step="1"
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
                      <td className="py-4 px-4 text-primary font-bold">UGX {typeof product.price === 'string' ? parseInt(product.price).toLocaleString() : (product.price as number).toLocaleString()}</td>
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
