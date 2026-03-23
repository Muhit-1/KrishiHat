"use client";

import { useState, useEffect, useCallback } from "react";

export function useCart() {
  const [cart, setCart] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cart");
      const json = await res.json();
      if (json.success) setCart(json.data);
    } catch {}
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchCart(); }, [fetchCart]);

  const addItem = async (productId: string, quantity = 1) => {
    const res = await fetch("/api/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ productId, quantity }),
    });
    const json = await res.json();
    if (json.success) await fetchCart();
    return json;
  };

  const removeItem = async (itemId: string) => {
    await fetch(`/api/cart/${itemId}`, { method: "DELETE" });
    await fetchCart();
  };

  const updateQty = async (itemId: string, quantity: number) => {
    await fetch(`/api/cart/${itemId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quantity }),
    });
    await fetchCart();
  };

  const total = cart?.items?.reduce(
    (sum: number, item: any) => sum + Number(item.product?.price || 0) * item.quantity,
    0
  ) ?? 0;

  return { cart, loading, addItem, removeItem, updateQty, total, refetch: fetchCart };
}