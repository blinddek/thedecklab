# Build 27 — Cart System

> **Type:** Frontend + Backend
> **Estimated Time:** 2–3 hrs
> **Dependencies:** Build 23 (configurator add-to-cart), Build 25 (shop add-to-cart)
> **Context Files:** Build 05 schema (orders), PROJECT_BRIEF.md §3–4
> **Reuse from Blindly:** 🔶 40% — cart pattern similar, item types different

---

## Objective

Build the unified cart that holds configurator deck items, shop products, and kits together. The cart persists in localStorage for anonymous users and syncs to a server session on login. Supports mixed orders (a configured deck + extra stain in the same cart).

---

## Tasks

### 1. Cart Context & State

**`src/lib/cart/cart-context.tsx`**

```typescript
type CartItem = ConfiguratorCartItem | ShopCartItem | KitCartItem

interface CartState {
  items: CartItem[]
  created_at: string
  updated_at: string
}

interface CartActions {
  addItem: (item: CartItem) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, qty: number) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
}
```

**Storage:**
- Anonymous: localStorage key `decklab_cart`
- Logged-in: same localStorage (no server cart for v1 — keep it simple)
- Cart items are self-contained snapshots with all pricing data

### 2. Cart Page

**`src/app/(public)/cart/page.tsx`**

```
┌─ Your Cart ──────────────────────────────────────────────────────────┐
│                                                                       │
│  ┌─ Configured Deck ─────────────────────────────────────────────┐  │
│  │  🏗️ Raised Deck — SA Pine CCA                                 │  │
│  │  4.5m × 3.2m (14.4 m²) · Lengthwise · Walnut stain          │  │
│  │  Full Installation (Western Cape)                              │  │
│  │                                                                │  │
│  │  Extras: 4 steps, 6.4m railings (Stainless + Wood)           │  │
│  │                                                                │  │
│  │  [View full breakdown ▼]                                      │  │
│  │                                                                │  │
│  │                                R43,046     [Edit] [Remove]    │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─ Shop Items ──────────────────────────────────────────────────┐  │
│  │  [img]  Walnut Stain 5L         Qty: [▼ 2 ▲]    R590.00     │  │
│  │         SKU: DL-ST-WAL-5L                         [Remove]    │  │
│  │                                                                │  │
│  │  [img]  50mm Stainless Screws   Qty: [▼ 1 ▲]    R85.00      │  │
│  │         (Box of 200)                              [Remove]    │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  ┌─ Kit ─────────────────────────────────────────────────────────┐  │
│  │  [img]  Railing Kit 3m          Qty: [▼ 1 ▲]    R4,200      │  │
│  │         Stainless + Wood                          [Remove]    │  │
│  │         (10% bundle discount)                                  │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
├─ Summary ─────────────────────────────────────────────────────────────┤
│                                                                       │
│  Subtotal:                                         R47,921.00       │
│  Delivery:                                         R      0  FREE  │
│  VAT (15%):                                        R 7,188.15       │
│  ──────────────────────────────────────────────────────────────────  │
│  Total:                                            R55,109.15       │
│                                                                       │
│  ⚠️ This order includes installation. A 50% deposit (R27,555)       │
│     is required at checkout. Balance due on completion.              │
│                                                                       │
│  [Proceed to Checkout →]                                             │
│                                                                       │
│  [Continue Shopping]                                                  │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### 3. Cart Item Display by Type

**Configurator item:**
- Summary line: deck type, material, dimensions, direction, finish
- Extras listed
- Installation type badge
- "View full breakdown" → collapsible price breakdown (same as Step 8)
- "Edit" → returns to configurator Step 8 with this configuration loaded
- Non-editable quantity (always 1 configured deck per item)

**Shop item:**
- Product image thumbnail
- Product name + variant label (localized)
- SKU
- Quantity adjuster (inline +/-)
- Unit price × qty = line total
- Bulk discount shown if applicable
- "Remove" button

**Kit item:**
- Kit image
- Kit name (localized)
- Bundle discount badge
- Quantity adjuster
- Kit price × qty
- "Remove" button

### 4. Price Recalculation

On cart load and on every quantity change:

```typescript
function recalculateCart(items: CartItem[]): CartSummary {
  let subtotal = 0
  let delivery = 0
  let hasInstallation = false
  let depositRequired = false

  for (const item of items) {
    if (item.type === 'configurator') {
      subtotal += item.pricing.subtotal_cents
      delivery += item.pricing.delivery_fee_cents
      if (item.installation_type === 'installation') {
        hasInstallation = true
        depositRequired = true
      }
    } else {
      subtotal += item.line_total_cents
    }
  }

  // Shop items: check delivery fee
  const shopTotal = items
    .filter(i => i.type !== 'configurator')
    .reduce((sum, i) => sum + i.line_total_cents, 0)
  
  if (!hasInstallation && shopTotal > 0) {
    // Add delivery fee for shop-only items (from site_settings)
    delivery += getDeliveryFee(deliveryRegion, shopTotal)
  }

  const vat = Math.ceil((subtotal + delivery) * 0.15)
  const total = subtotal + delivery + vat

  return {
    subtotal,
    delivery,
    vat,
    total,
    deposit: depositRequired ? Math.ceil(total * 0.5) : null,
    balance: depositRequired ? total - Math.ceil(total * 0.5) : null,
    hasInstallation,
    itemCount: items.length,
  }
}
```

### 5. Price Staleness Check

Cart items store price snapshots. Prices may change between cart add and checkout:

- On cart page load, re-fetch current prices for all shop items
- If a price changed: show a yellow banner per item: "Price updated: was R85.00, now R89.00"
- Auto-update the cart item with the new price
- For configurator items: re-run the pricing engine with the stored config
- If a product is now out of stock: show red banner, disable checkout for that item

### 6. Empty Cart State

```
Your cart is empty.

[🔧 Configure a Deck] → /configure
[🛒 Browse Materials] → /products
```

### 7. Cart Header Icon

**`src/components/layout/cart-icon.tsx`**

In the public header:
- Shopping cart icon (ShoppingCart from lucide)
- Badge showing item count (animated on add)
- Click → /cart page
- On hover (desktop): mini cart dropdown showing first 3 items + total + "View Cart" button

### 8. Delivery Region Handling

If the cart contains both a configured deck (with installation, WC only) AND shop items:
- Installation delivery is free (installer brings materials)
- Additional shop items: check if they can be added to the install delivery for free, or if they ship separately

For supply-only orders: delivery region comes from the configurator or is selected at checkout.

### 9. Localization

```json
"cart": {
  "title": "Your Cart",
  "empty": "Your cart is empty",
  "configureDeck": "Configure a Deck",
  "browseMaterials": "Browse Materials",
  "configuredDeck": "Configured Deck",
  "shopItems": "Shop Items",
  "kitItem": "Kit",
  "viewBreakdown": "View full breakdown",
  "edit": "Edit",
  "remove": "Remove",
  "subtotal": "Subtotal",
  "delivery": "Delivery",
  "vat": "VAT (15%)",
  "total": "Total",
  "free": "FREE",
  "depositNote": "This order includes installation. A 50% deposit ({amount}) is required at checkout. Balance due on completion.",
  "priceUpdated": "Price updated: was {old}, now {new}",
  "outOfStock": "This item is currently out of stock",
  "proceedToCheckout": "Proceed to Checkout",
  "continueShopping": "Continue Shopping",
  "bundleDiscount": "{percent}% bundle discount"
}
```

---

## Acceptance Criteria

```
✅ Cart page displays all three item types (configurator, shop, kit)
✅ Configurator item shows summary + collapsible breakdown
✅ Shop item quantity adjustable with +/- buttons
✅ Kit item quantity adjustable
✅ Removing items works with confirmation
✅ Subtotal, delivery, VAT, total calculate correctly
✅ Mixed order: configurator + shop items in same cart
✅ Installation deposit/balance shown when applicable
✅ Free delivery for installation orders
✅ Delivery fee applies for supply-only orders
✅ Price staleness check on page load
✅ Updated prices show yellow banner
✅ Out of stock items show red banner + disable checkout
✅ Empty cart state with CTAs
✅ Cart header icon shows item count badge
✅ Mini cart dropdown on hover (desktop)
✅ localStorage persistence works across sessions
✅ All text localized (EN/AF)
✅ Dark mode renders correctly
✅ Mobile: items stack, quantities touchable
```

---

## Notes for Claude Code

- Cart is localStorage-only for v1. No server-side cart or cart table in the database. This keeps it simple and avoids auth requirements for cart functionality.
- The configurator cart item stores the FULL pricing snapshot. Don't re-fetch on every page load — only re-validate on cart page load.
- "Edit" on a configurator item should restore the full wizard state and navigate to /configure. This means the ConfiguratorCartItem must contain enough data to reconstruct the wizard at Step 8.
- Cart → Checkout handoff: the cart state is passed to checkout (Build 29) which creates the actual order in the database.
- Quantity limits: shop items limited by stock_quantity. Kits limited by the minimum component stock. Configurator items always qty 1.
