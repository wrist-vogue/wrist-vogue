import { useState, useEffect } from "react";
import { ShoppingCart, Menu, X, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";

/**
 * DESIGN PHILOSOPHY: Minimalist Luxury - "The Void Elegance"
 * Hero section uses asymmetrical layout with generous whitespace
 * Product grid is sparse (2-column) with staggered animations
 * Gold accents appear on hover and interactive elements
 */

interface Product {
  id: string;
  name: string;
  category: "men" | "women" | "accessories";
  price: number;
  image: string;
  description: string;
}

interface CartItem extends Product {
  quantity: number;
}

export default function Home() {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<"all" | "men" | "women" | "accessories">("all");

  // Fetch products from database
  const { data: dbProducts = [], isLoading, refetch } = trpc.products.list.useQuery();
  const [products, setProducts] = useState<Product[]>([]);

  // Update products when database products change
  useEffect(() => {
    if (dbProducts && dbProducts.length > 0) {
      const mappedProducts = dbProducts.map((p: any) => ({
        id: p.id,
        name: p.name,
        category: p.category,
        price: typeof p.price === 'string' ? parseFloat(p.price) : p.price,
        image: p.image,
        description: p.description,
      }));
      setProducts(mappedProducts);
    }
  }, [dbProducts]);

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("wristVogueCart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    localStorage.setItem("wristVogueCart", JSON.stringify(cart));
  }, [cart]);

  const filteredProducts = products.filter(product => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const addToCart = (product: Product) => {
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      setCart(cart.map(item =>
        item.id === product.id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter(item => item.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      setCart(cart.map(item =>
        item.id === productId
          ? { ...item, quantity }
          : item
      ));
    }
  };

  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container flex items-center justify-between h-20">
          <h1 className="text-2xl font-bold tracking-wider">WRIST VOGUE</h1>
          
          <div className="hidden md:flex items-center gap-8">
            <nav className="flex gap-6">
              <button
                onClick={() => setActiveCategory("all")}
                className={`hover-gold-underline text-sm uppercase tracking-wider transition-smooth ${
                  activeCategory === "all" ? "text-primary" : "text-foreground"
                }`}
              >
                All
              </button>
              <button
                onClick={() => setActiveCategory("men")}
                className={`hover-gold-underline text-sm uppercase tracking-wider transition-smooth ${
                  activeCategory === "men" ? "text-primary" : "text-foreground"
                }`}
              >
                Men
              </button>
              <button
                onClick={() => setActiveCategory("women")}
                className={`hover-gold-underline text-sm uppercase tracking-wider transition-smooth ${
                  activeCategory === "women" ? "text-primary" : "text-foreground"
                }`}
              >
                Women
              </button>
              <button
                onClick={() => setActiveCategory("accessories")}
                className={`hover-gold-underline text-sm uppercase tracking-wider transition-smooth ${
                  activeCategory === "accessories" ? "text-primary" : "text-foreground"
                }`}
              >
                Accessories
              </button>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {user && (
              <a href="/dashboard" className="text-xs uppercase tracking-wider hover:text-primary transition-smooth hidden md:block">
                Dashboard
              </a>
            )}
            <button
              onClick={() => setCartOpen(!cartOpen)}
              className="relative transition-smooth hover:text-primary"
            >
              <ShoppingCart size={24} />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="md:hidden transition-smooth hover:text-primary"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Menu */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute left-0 top-0 bottom-0 w-64 bg-card border-r border-border animate-slide-in-left">
            <nav className="pt-24 px-6 space-y-6">
              <button
                onClick={() => {
                  setActiveCategory("all");
                  setSidebarOpen(false);
                }}
                className="block w-full text-left text-sm uppercase tracking-wider hover:text-primary transition-smooth"
              >
                All
              </button>
              <button
                onClick={() => {
                  setActiveCategory("men");
                  setSidebarOpen(false);
                }}
                className="block w-full text-left text-sm uppercase tracking-wider hover:text-primary transition-smooth"
              >
                Men
              </button>
              <button
                onClick={() => {
                  setActiveCategory("women");
                  setSidebarOpen(false);
                }}
                className="block w-full text-left text-sm uppercase tracking-wider hover:text-primary transition-smooth"
              >
                Women
              </button>
              <button
                onClick={() => {
                  setActiveCategory("accessories");
                  setSidebarOpen(false);
                }}
                className="block w-full text-left text-sm uppercase tracking-wider hover:text-primary transition-smooth"
              >
                Accessories
              </button>
              <div className="pt-6 border-t border-border">
                <a href="#contact" className="block text-sm uppercase tracking-wider hover:text-primary transition-smooth">
                  Contact
                </a>
              </div>
            </nav>
          </div>
        </div>
      )}

      {/* Cart Sidebar */}
      {cartOpen && (
        <div className="fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/50" onClick={() => setCartOpen(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-96 bg-card border-l border-border overflow-y-auto animate-slide-in-left">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Your Cart</h2>
                <button onClick={() => setCartOpen(false)} className="transition-smooth hover:text-primary">
                  <X size={24} />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-12">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b border-border">
                        <img src={item.image} alt={item.name} className="w-20 h-20 object-cover" />
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-muted-foreground">${item.price}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="px-2 py-1 text-xs border border-border hover:border-primary transition-smooth"
                            >
                              -
                            </button>
                            <span className="text-sm">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              className="px-2 py-1 text-xs border border-border hover:border-primary transition-smooth"
                            >
                              +
                            </button>
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="ml-auto text-xs text-destructive hover:text-destructive/80 transition-smooth"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border pt-4">
                    <div className="flex justify-between mb-4">
                      <span className="font-semibold">Total:</span>
                      <span className="text-primary font-bold">UGX {(cartTotal * 3700).toLocaleString()}</span>
                    </div>
                    <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth">
                      Checkout
                    </Button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-20">
        {/* Hero Section */}
        <section className="relative h-screen flex items-center justify-center overflow-hidden bg-background">
          <div className="absolute inset-0">
            {/* Dark background */}
            <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-card" />
            
            {/* Floating Particles */}
            <div className="particle particle-1" style={{ width: '40px', height: '40px', top: '10%', left: '5%' }} />
            <div className="particle particle-2" style={{ width: '60px', height: '60px', top: '20%', right: '10%' }} />
            <div className="particle particle-3" style={{ width: '30px', height: '30px', bottom: '30%', left: '15%' }} />
            <div className="particle particle-1" style={{ width: '50px', height: '50px', top: '40%', right: '5%' }} />
            <div className="particle particle-2" style={{ width: '35px', height: '35px', bottom: '15%', right: '20%' }} />
            <div className="particle particle-3" style={{ width: '45px', height: '45px', top: '60%', left: '10%' }} />
            <div className="particle particle-1" style={{ width: '55px', height: '55px', bottom: '40%', left: '25%' }} />
            <div className="particle particle-2" style={{ width: '25px', height: '25px', top: '30%', left: '50%' }} />
            <div className="particle particle-3" style={{ width: '65px', height: '65px', bottom: '20%', right: '15%' }} />
            <div className="particle particle-1" style={{ width: '38px', height: '38px', top: '50%', right: '30%' }} />
          </div>

          <div className="container relative z-10 text-center">
            <div className="max-w-3xl mx-auto animate-fade-in">
              <h1 className="text-6xl md:text-8xl font-bold mb-6 text-white leading-tight">
                Timeless Elegance
              </h1>
              <p className="text-lg md:text-2xl text-gray-300 mb-8 font-light">
                Discover our curated collection of luxury watches, crafted for those who appreciate precision and beauty.
              </p>
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth px-8 py-3 text-lg">
                Explore Collection
              </Button>
            </div>
          </div>
        </section>

        {/* Search and Filter */}
        <section className="container py-12 border-b border-border">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
              <input
                type="text"
                placeholder="Search watches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-card border border-border text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary transition-smooth"
              />
            </div>
          </div>
        </section>

        {/* Products Grid */}
        <section className="container py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            {filteredProducts.map((product, index) => (
              <div
                key={product.id}
                className="animate-slide-up card-glow"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="relative overflow-hidden mb-6 aspect-square">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-smooth hover:scale-110"
                  />
                </div>
                <h3 className="text-2xl font-bold mb-2">{product.name}</h3>
                <p className="text-muted-foreground mb-4">{product.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold">UGX {(product.price * 3700).toLocaleString()}</span>
                  <Button
                    onClick={() => addToCart(product)}
                    className="bg-primary text-primary-foreground hover:bg-primary/90 transition-smooth"
                  >
                    Add to Cart
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-20">
              <p className="text-xl text-muted-foreground">No products found matching your criteria.</p>
            </div>
          )}
        </section>

        {/* Contact Section */}
        <section id="contact" className="bg-card border-t border-border py-20">
          <div className="container">
            <h2 className="text-4xl font-bold mb-12 text-center">Get in Touch</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Phone</h3>
                <a href="tel:+256783690283" className="hover-gold-underline text-muted-foreground hover:text-primary transition-smooth block mb-3">
                  +256 783 690 283
                </a>
                <p className="text-sm text-muted-foreground mb-4">WhatsApp & Call</p>
                <a 
                  href="https://wa.me/256757833620?text=Hello%20Wrist%20Vogue%2C%20I%20would%20like%20to%20order%20from%20your%20collection" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-block bg-primary text-primary-foreground px-6 py-2 rounded hover:bg-primary/90 transition-smooth font-semibold"
                >
                  💬 Order on WhatsApp
                </a>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold mb-2">Location & Services</h3>
                <p className="text-muted-foreground mb-2">Pioneer Mall, Kampala</p>
                <p className="text-sm text-muted-foreground mb-4">Watches • Jewelry • Accessories</p>
                <p className="text-sm text-primary font-semibold">✓ Delivery Countrywide Available</p>
              </div>
            </div>
            <div className="mt-12 text-center">
              <h3 className="text-lg font-bold mb-4">Follow Us</h3>
              <a 
                href="https://instagram.com/_wrist_vogue_" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-block text-primary hover:text-primary/80 transition-smooth font-semibold"
              >
                Instagram: @_wrist_vogue_
              </a>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-background border-t border-border py-8">
          <div className="container text-center text-muted-foreground text-sm">
            <p>&copy; 2024 Wrist Vogue. All rights reserved. Crafted with precision and elegance.</p>
          </div>
        </footer>
      </main>
    </div>
  );
}
