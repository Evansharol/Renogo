import { useState, useEffect, useCallback } from "react";
import type { OrderItem } from "../../types/order";

const CART_STORAGE_KEY = "dealer_fleet_cart";
const CART_EVENT_NAME = "fleet_cart_updated";

function getStoredCart(): OrderItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as OrderItem[]) : [];
  } catch {
    return [];
  }
}

function saveCart(items: OrderItem[]) {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event(CART_EVENT_NAME));
  } catch {
    // ignore
  }
}

export function useFleetCart() {
  const [cart, setCart] = useState<OrderItem[]>(getStoredCart);

  useEffect(() => {
    const handleSync = () => {
      setCart(getStoredCart());
    };
    window.addEventListener(CART_EVENT_NAME, handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      window.removeEventListener(CART_EVENT_NAME, handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const addToCart = useCallback((item: OrderItem) => {
    setCart((prev) => {
      // If the exact same model and variant exists, increment quantity
      const existingIndex = prev.findIndex(
        (i) => i.model === item.model && i.variant === item.variant
      );
      let next: OrderItem[];
      if (existingIndex >= 0) {
        next = prev.map((curr, idx) =>
          idx === existingIndex
            ? { ...curr, quantity: curr.quantity + item.quantity }
            : curr
        );
      } else {
        next = [...prev, item];
      }
      saveCart(next);
      return next;
    });
  }, []);

  const updateQuantity = useCallback((itemId: string, quantity: number) => {
    const validQty = Math.max(1, quantity);
    setCart((prev) => {
      const next = prev.map((item) =>
        item.id === itemId ? { ...item, quantity: validQty } : item
      );
      saveCart(next);
      return next;
    });
  }, []);

  const removeFromCart = useCallback((itemId: string) => {
    setCart((prev) => {
      const next = prev.filter((item) => item.id !== itemId);
      saveCart(next);
      return next;
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    saveCart([]);
  }, []);

  const totalModels = cart.length;
  const totalVehicles = cart.reduce((sum, item) => sum + item.quantity, 0);

  return {
    cart,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    totalModels,
    totalVehicles,
  };
}
