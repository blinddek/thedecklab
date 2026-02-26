"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";

export interface CartItem {
  product_id: string;
  variant_id?: string;
  variant_name?: string;
  name: string;
  price_cents: number;
  quantity: number;
  image?: string;
  slug: string;
}

function cartKey(item: { product_id: string; variant_id?: string }): string {
  return item.product_id + (item.variant_id ?? "");
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotalCents: number;
}

const CartContext = createContext<CartContextValue | null>(null);

const STORAGE_KEY = "yt-cart";

function readStoredCart(): CartItem[] {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [items, setItems] = useState<CartItem[]>(readStoredCart);
  const hydratedRef = useRef(globalThis.localStorage !== undefined); // NOSONAR — React ref

  // Persist to localStorage
  useEffect(() => {
    if (!hydratedRef.current) return;
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const addItem = useCallback(
    (item: Omit<CartItem, "quantity">, quantity = 1) => {
      setItems((prev) => {
        const key = cartKey(item);
        const existing = prev.find((i) => cartKey(i) === key);
        if (existing) {
          return prev.map((i) =>
            cartKey(i) === key
              ? { ...i, quantity: i.quantity + quantity }
              : i
          );
        }
        return [...prev, { ...item, quantity }];
      });
    },
    []
  );

  const removeItem = useCallback((productId: string, variantId?: string) => {
    const key = productId + (variantId ?? "");
    setItems((prev) => prev.filter((i) => cartKey(i) !== key));
  }, []);

  const updateQuantity = useCallback(
    (productId: string, quantity: number, variantId?: string) => {
      if (quantity <= 0) {
        removeItem(productId, variantId);
        return;
      }
      const key = productId + (variantId ?? "");
      setItems((prev) =>
        prev.map((i) =>
          cartKey(i) === key ? { ...i, quantity } : i
        )
      );
    },
    [removeItem]
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotalCents = items.reduce(
    (sum, i) => sum + i.price_cents * i.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotalCents,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
