"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCart } from "@/components/shop/cart-provider";
import { formatPrice } from "@/lib/shop/format";
import { AddressAutocomplete, type AddressResult } from "@/components/shop/address-autocomplete";
import { trackInitiateCheckout } from "@/lib/integrations/facebook-pixel";
import { siteConfig } from "@/config/site";
import { Loader2, Truck } from "lucide-react";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotalCents, totalItems, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Address state — auto-filled by autocomplete
  const [addressLine1, setAddressLine1] = useState("");
  const [city, setCity] = useState("");
  const [province, setProvince] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [addressLat, setAddressLat] = useState<number | null>(null);
  const [addressLng, setAddressLng] = useState<number | null>(null);

  // Delivery fee state
  const [calcingDelivery, setCalcingDelivery] = useState(false);
  const [deliveryKm, setDeliveryKm] = useState<number | null>(null);
  const [deliveryError, setDeliveryError] = useState<string | null>(null);

  useEffect(() => {
    if (totalItems > 0) {
      trackInitiateCheckout({
        value: subtotalCents / 100,
        currency: siteConfig.currency,
        num_items: totalItems,
      });
    }
  }, [totalItems, subtotalCents]);

  // Redirect if cart is empty
  if (items.length === 0 && !loading) {
    return (
      <div className="mx-auto max-w-[1280px] px-4 py-16 text-center md:px-8">
        <h1 className="text-2xl font-bold">Your cart is empty</h1>
        <p className="mt-2 text-muted-foreground">
          Add some products before checking out.
        </p>
        <Button className="mt-4" onClick={() => router.push("/shop")}>
          Browse Products
        </Button>
      </div>
    );
  }

  function handleAddressSelect(result: AddressResult) {
    setAddressLine1(result.street || result.display_name);
    setCity(result.city);
    setProvince(result.province);
    setPostalCode(result.postal_code);
    setAddressLat(result.lat);
    setAddressLng(result.lng);

    // Auto-calculate delivery distance
    setDeliveryKm(null);
    setDeliveryError(null);
    if (result.lat && result.lng) {
      setCalcingDelivery(true);
      fetch("/api/distance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: result.lat, lng: result.lng }),
      })
        .then((r) => r.json())
        .then((data: { distance_km?: number; error?: string }) => {
          if (data.distance_km != null) {
            setDeliveryKm(data.distance_km);
          } else {
            setDeliveryError(data.error ?? "Could not calculate delivery distance.");
          }
        })
        .catch(() => setDeliveryError("Delivery distance unavailable."))
        .finally(() => setCalcingDelivery(false));
    }
  }

  async function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const shipping = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      address_line_1: addressLine1 || (formData.get("address_line_1") as string),
      address_line_2: formData.get("address_line_2") as string,
      city: city || (formData.get("city") as string),
      province: province || (formData.get("province") as string),
      postal_code: postalCode || (formData.get("postal_code") as string),
    };

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.product_id,
            quantity: i.quantity,
          })),
          shipping,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Something went wrong");
        setLoading(false);
        return;
      }

      // Save order ref for success page, then clear cart
      sessionStorage.setItem("yt-order-ref", data.reference);
      sessionStorage.setItem("yt-order-email", shipping.email);
      clearCart();

      // Redirect to Paystack
      globalThis.location.href = data.authorization_url;
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 md:px-8">
      <h1 className="text-3xl font-bold text-foreground">Checkout</h1>

      {error && (
        <div className="mt-4 rounded-lg border border-destructive bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="mt-8 space-y-8">
        {/* Contact */}
        <div>
          <h2 className="text-lg font-semibold">Contact Information</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" name="name" required />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" required />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="phone">Phone</Label>
              <Input id="phone" name="phone" type="tel" required />
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div>
          <h2 className="text-lg font-semibold">Delivery Address</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Address Search</Label>
              <AddressAutocomplete
                onSelect={handleAddressSelect}
                placeholder="e.g. 12 Main Street, Cape Town"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Search to auto-fill your address, or fill in the fields below manually.
              </p>
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address_line_1">Address Line 1</Label>
              <Input
                id="address_line_1"
                name="address_line_1"
                value={addressLine1}
                onChange={(e) => setAddressLine1(e.target.value)}
                required
              />
            </div>
            <div className="sm:col-span-2">
              <Label htmlFor="address_line_2">Address Line 2 (optional)</Label>
              <Input id="address_line_2" name="address_line_2" />
            </div>
            <div>
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                name="city"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="province">Province</Label>
              <Input
                id="province"
                name="province"
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="postal_code">Postal Code</Label>
              <Input
                id="postal_code"
                name="postal_code"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
              />
            </div>

            {/* Delivery distance indicator */}
            {(calcingDelivery || deliveryKm !== null || deliveryError) && (
              <div className="sm:col-span-2 flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2 text-sm">
                <Truck className="h-4 w-4 shrink-0 text-muted-foreground" />
                {calcingDelivery && (
                  <span className="flex items-center gap-1.5 text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" />
                    Calculating delivery distance…
                  </span>
                )}
                {!calcingDelivery && deliveryKm !== null && (
                  <span className="text-foreground">
                    Approx. <strong>{deliveryKm} km</strong> from our depot — final delivery fee confirmed at dispatch.
                  </span>
                )}
                {!calcingDelivery && deliveryError && (
                  <span className="text-muted-foreground">{deliveryError}</span>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Order summary */}
        <div className="rounded-lg border p-4">
          <h2 className="text-lg font-semibold">Order Summary</h2>
          <div className="mt-3 divide-y text-sm">
            {items.map((item) => (
              <div
                key={item.product_id}
                className="flex justify-between py-2"
              >
                <span>
                  {item.name} x {item.quantity}
                </span>
                <span>{formatPrice(item.price_cents * item.quantity)}</span>
              </div>
            ))}
          </div>
          <div className="mt-3 border-t pt-3">
            <div className="flex justify-between font-semibold">
              <span>Subtotal</span>
              <span>{formatPrice(subtotalCents)}</span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Delivery fee and VAT calculated at checkout.
            </p>
          </div>
        </div>

        {/* POPIA notice */}
        <p className="text-xs text-muted-foreground">
          By placing this order you agree to our <a href="/terms" className="underline">Terms of Service</a> and <a href="/privacy" className="underline">Privacy Policy</a>. Your personal information will be processed in accordance with POPIA.
        </p>

        <Button type="submit" size="lg" className="w-full" disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing…
            </>
          ) : (
            `Proceed to Payment — ${formatPrice(subtotalCents)}`
          )}
        </Button>
      </form>
    </div>
  );
}
