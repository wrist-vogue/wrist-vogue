import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Product {
  id: string;
  name: string;
  category: "men" | "women" | "accessories";
  price: number;
  image: string;
  description: string;
}

export default function Admin() {
  const [products, setProducts] = useState<Product[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Product>>({
    name: "",
    category: "men",
    price: 0,
    image: "",
    description: ""
  });

  // Load products from localStorage
  useEffect(() => {
    const savedProducts = localStorage.getItem("wristVogueProducts");
    if (savedProducts) {
      setProducts(JSON.parse(savedProducts));
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "price" ? parseFloat(value) : value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.image || !formData.description) {
      alert("Please fill in all fields");
      return;
    }

    if (editingId) {
      // Update existing product
      const updatedProducts = products.map(p =>
        p.id === editingId
          ? { ...p, ...formData as Product }
          : p
      );
      setProducts(updatedProducts);
      localStorage.setItem("wristVogueProducts", JSON.stringify(updatedProducts));
      setEditingId(null);
    } else {
      // Add new product
      const newProduct: Product = {
        id: Date.now().toString(),
        name: formData.name || "",
        category: formData.category as "men" | "women" | "accessories",
        price: formData.price || 0,
        image: formData.image || "",
        description: formData.description || ""
      };
      const updatedProducts = [...products, newProduct];
      setProducts(updatedProducts);
      localStorage.setItem("wristVogueProducts", JSON.stringify(updatedProducts));
    }

    setFormData({
      name: "",
      category: "men",
      price: 0,
      image: "",
      description: ""
    });
    setShowForm(false);
  };

  const handleEdit = (product: Product) => {
    setFormData(product);
    setEditingId(product.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this product?")) {
      const updatedProducts = products.filter(p => p.id !== id);
      setProducts(updatedProducts);
      localStorage.setItem("wristVogueProducts", JSON.stringify(updatedProducts));
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
                    <label className="block text-sm font-semibold mb-2">Image URL</label>
                    <input
                      type="url"
                      name="image"
                      value={formData.image || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-background border border-border text-foreground focus:outline-none focus:border-primary transition-smooth"
                      placeholder="https://..."
                    />
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

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth"
                  >
                    {editingId ? "Update Product" : "Add Product"}
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
                          className="p-2 hover:bg-card transition-smooth text-destructive"
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

          {products.length === 0 && (
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
