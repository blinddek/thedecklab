# Build 29 — Checkout & Paystack Payment

> **Type:** Frontend + Backend
> **Estimated Time:** 3–4 hrs
> **Dependencies:** Build 27 (cart), Build 05 schema (orders)
> **Context Files:** TECHNICAL_DESIGN.md §4 (Checkout), Build 05 schema
> **Reuse from Blindly:** 🔶 60% — same Paystack integration, different order structure

---

## Objective

Build the full checkout flow: customer details form, delivery address, order review, Paystack payment integration, order confirmation page, and order creation in the database. Handles both deposit-only (installation) and full-payment (supply) flows.

---

## Tasks

### 1. Checkout Page

**`src/app/(public)/checkout/page.tsx`**

Multi-section form (single page, not multi-step):

```
┌─ Checkout ───────────────────────────────────────────────────────────┐
│                                                                       │
├─ 1. Customer Details ────────────────────────────────────────────────┤
│                                                                       │
│  Full Name:        [________________________]                        │
│  Email:            [________________________]                        │
│  Phone:            [________________________]                        │
│  Company (optional):[________________________]                       │
│                                                                       │
├─ 2. Delivery / Installation Address ─────────────────────────────────┤
│                                                                       │
│  (Only shown for installation or delivery orders)                    │
│                                                                       │
│  Street Address:   [________________________]                        │
│  Suburb:           [________________________]                        │
│  City:             [________________________]                        │
│  Province:         [Western Cape         ▼]                         │
│  Postal Code:      [________]                                        │
│                                                                       │
│  📍 Installation: We'll confirm the site visit date after payment    │
│  🚚 Delivery: Estimated 3-5 business days                           │
│                                                                       │
├─ 3. Order Notes (optional) ──────────────────────────────────────────┤
│                                                                       │
│  [                                                                   │
│   e.g., "Gate code is 1234", "Access from the back garden"          │
│  ]                                                                   │
│                                                                       │
├─ 4. Order Summary ───────────────────────────────────────────────────┤
│                                                                       │
│  [Same breakdown as cart but read-only]                              │
│                                                                       │
│  Subtotal:                                     R47,921.00           │
│  Delivery:                                     R      0  FREE      │
│  VAT (15%):                                    R 7,188.15           │
│  Total:                                        R55,109.15           │
│                                                                       │
│  ┌─ Payment ─────────────────────────────────────────────────────┐  │
│  │                                                                │  │
│  │  ⚠️ Installation order: 50% deposit required now              │  │
│  │                                                                │  │
│  │  Pay now:    R27,555 (deposit)                                │  │
│  │  Pay later:  R27,555 (balance on completion)                  │  │
│  │                                                                │  │
│  │  ─── OR ───                                                   │  │
│  │                                                                │  │
│  │  ✅ Supply order: full payment at checkout                    │  │
│  │  Pay now:    R55,109.15                                       │  │
│  │                                                                │  │
│  └────────────────────────────────────────────────────────────────┘  │
│                                                                       │
│  □ I agree to the Terms & Conditions and Privacy Policy              │
│                                                                       │
│  [💳 Pay R27,555 via Paystack]                                       │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

### 2. Form Validation

Zod schema:

```typescript
const CheckoutSchema = z.object({
  customer_name: z.string().min(2, 'Name is required'),
  customer_email: z.string().email('Valid email required'),
  customer_phone: z.string().min(10, 'Valid SA phone number required'),
  customer_company: z.string().optional(),
  delivery_address: z.object({
    street: z.string().min(3),
    suburb: z.string().min(2),
    city: z.string().min(2),
    province: z.string(),
    postal_code: z.string().regex(/^\d{4}$/, 'Valid 4-digit postal code'),
  }).optional(),  // only required for delivery/installation
  order_notes: z.string().max(500).optional(),
  terms_accepted: z.literal(true, { message: 'You must accept the terms' }),
})
```

### 3. Paystack Integration

**Initialize payment:**

```typescript
// POST /api/orders/create
// 1. Validate checkout form
// 2. Create order in database (status: 'pending')
// 3. Create configurator_items and shop_items
// 4. Initialize Paystack transaction
// 5. Return Paystack authorization URL

const response = await fetch('https://api.paystack.co/transaction/initialize', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: customer_email,
    amount: payNowCents,  // deposit or full amount
    currency: 'ZAR',
    reference: orderNumber,  // DL-2026-0001
    callback_url: `${SITE_URL}/order/${orderId}/confirmation`,
    metadata: {
      order_id: orderId,
      order_type: 'deposit' | 'full',
      custom_fields: [
        { display_name: 'Customer Name', variable_name: 'customer_name', value: customer_name },
        { display_name: 'Order Number', variable_name: 'order_number', value: orderNumber },
      ],
    },
  }),
})

// Redirect to Paystack checkout page
window.location.href = response.data.authorization_url
```

### 4. Paystack Webhook

**`src/app/api/webhooks/paystack/route.ts`**

```typescript
// POST /api/webhooks/paystack
// Verify webhook signature
// Handle events:
//   charge.success → update order payment status
//   charge.failed → mark order as failed

async function handleChargeSuccess(data: PaystackEvent) {
  const { reference, amount, metadata } = data
  const orderId = metadata.order_id

  // Update order
  await supabase.from('orders').update({
    payment_status: metadata.order_type === 'deposit' ? 'deposit_paid' : 'paid',
    deposit_paid: metadata.order_type === 'deposit' ? true : false,
    order_status: 'confirmed',
  }).eq('id', orderId)

  // Decrement stock for shop items
  await decrementStock(orderId)

  // Send confirmation email
  await sendOrderConfirmation(orderId)

  // If this was a saved quote, mark as converted
  if (metadata.quote_token) {
    await supabase.from('saved_quotes').update({
      converted_to_order_id: orderId,
    }).eq('quote_token', metadata.quote_token)
  }

  // Log activity
  await logActivity('order', 'payment_received', orderId, { amount, reference })
}
```

**Webhook signature verification:**
```typescript
import crypto from 'crypto'

function verifyPaystackSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(body)
    .digest('hex')
  return hash === signature
}
```

### 5. Order Creation

**`src/app/api/orders/create/route.ts`**

```typescript
async function createOrder(checkout: CheckoutData, cart: CartState) {
  // 1. Calculate totals (re-validate pricing server-side)
  const totals = await recalculateServerSide(cart)

  // 2. Determine order type
  const hasConfigurator = cart.items.some(i => i.type === 'configurator')
  const hasShop = cart.items.some(i => i.type === 'shop' || i.type === 'kit')
  const orderType = hasConfigurator && hasShop ? 'mixed' : hasConfigurator ? 'configurator' : 'shop'

  // 3. Determine delivery
  const configuratorItem = cart.items.find(i => i.type === 'configurator')
  const deliveryType = configuratorItem?.installation_type || 'supply_deliver'
  const deliveryRegion = configuratorItem?.delivery_region || checkout.delivery_region

  // 4. Deposit calculation
  const isInstallation = deliveryType === 'installation'
  const depositPercent = isInstallation ? await getDepositPercent() : 100
  const depositCents = Math.ceil(totals.total * depositPercent / 100)
  const balanceCents = totals.total - depositCents

  // 5. INSERT order
  const order = await supabase.from('orders').insert({
    order_type: orderType,
    customer_name: checkout.customer_name,
    customer_email: checkout.customer_email,
    customer_phone: checkout.customer_phone,
    customer_company: checkout.customer_company,
    delivery_type: deliveryType,
    delivery_region: deliveryRegion,
    delivery_address: checkout.delivery_address,
    order_notes: checkout.order_notes,
    subtotal_cents: totals.subtotal,
    delivery_fee_cents: totals.delivery,
    vat_cents: totals.vat,
    total_cents: totals.total,
    deposit_percent: depositPercent,
    deposit_cents: depositCents,
    balance_cents: balanceCents,
    payment_status: 'pending',
    order_status: 'new',
  }).select().single()

  // 6. INSERT configurator_items
  for (const item of cart.items.filter(i => i.type === 'configurator')) {
    await supabase.from('configurator_items').insert({
      order_id: order.id,
      deck_type_id: item.deck_type.id,
      material_type_id: item.material_type.id,
      length_m: item.dimensions.length_m,
      width_m: item.dimensions.width_m,
      area_m2: item.dimensions.area_m2,
      board_direction: item.board_direction.slug,
      board_profile: item.board_profile?.slug,
      finish_option: item.finish?.name,
      finish_colour: item.finish?.colour,
      deck_design: item.deck_design,  // full JSONB if designer was used
      selected_extras: item.extras,   // JSONB array
      materials_cost_cents: item.pricing.materials_cost_cents,
      substructure_cost_cents: item.pricing.substructure_cost_cents,
      fixings_cost_cents: item.pricing.fixings_cost_cents,
      staining_cost_cents: item.pricing.staining_cost_cents,
      labour_cost_cents: item.pricing.labour_cost_cents,
    })
  }

  // 7. INSERT shop_items (including exploded kit components)
  for (const item of cart.items) {
    if (item.type === 'shop') {
      await supabase.from('shop_items').insert({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        item_type: 'product',
        quantity: item.quantity,
        unit_price_cents: item.unit_price_cents,
      })
    }
    if (item.type === 'kit') {
      await supabase.from('shop_items').insert({
        order_id: order.id,
        kit_id: item.kit_id,
        item_type: 'kit',
        quantity: item.quantity,
        unit_price_cents: item.unit_price_cents,
      })
      // Also insert individual component items for stock tracking
      for (const comp of item.components) {
        await supabase.from('shop_items').insert({
          order_id: order.id,
          product_id: comp.product_id,
          variant_id: comp.variant_id,
          kit_id: item.kit_id,
          item_type: 'product',
          quantity: comp.quantity * item.quantity,
          unit_price_cents: 0,  // price is on the kit item
        })
      }
    }
  }

  return order
}
```

### 6. Order Confirmation Page

**`src/app/(public)/order/[id]/confirmation/page.tsx`**

After Paystack redirects back:

```
┌─ Order Confirmed! ──────────────────────────────────────────────────┐
│                                                                       │
│  ✅ Thank you for your order, {name}!                                │
│                                                                       │
│  Order Number: DL-2026-0001                                          │
│  Date: 20 February 2026                                              │
│  Payment: R27,555 deposit received                                   │
│                                                                       │
│  We've sent a confirmation email to {email}                          │
│                                                                       │
│  ┌─ What Happens Next ──────────────────────────────────────────┐   │
│  │                                                               │   │
│  │  ✅ Order confirmed                                          │   │
│  │  ⏳ Materials ordered from supplier                          │   │
│  │  ○  Installation date confirmed                              │   │
│  │  ○  Installation complete                                    │   │
│  │  ○  Final inspection & handover                              │   │
│  │  ○  Balance payment                                          │   │
│  │                                                               │   │
│  └───────────────────────────────────────────────────────────────┘   │
│                                                                       │
│  [📧 Email sent]  [📥 Download Invoice]  [📲 Share]                 │
│                                                                       │
│  Questions? Contact us at {email} or {phone}                         │
│                                                                       │
└───────────────────────────────────────────────────────────────────────┘
```

- Verify payment status via Paystack API (don't rely only on webhook)
- If payment pending: show "Payment processing..." with auto-refresh
- If payment failed: show error + retry button
- Clear cart after confirmed payment

### 7. Order Confirmation Email

**`src/lib/email/templates/order-confirmation.tsx`**

React Email:
- Order number + date
- Payment received amount
- Order summary (brief, not full breakdown)
- "What happens next" timeline
- "View your order" link → `/order/{id}`
- Contact info for questions

### 8. Stock Decrement

After payment confirmed:
```typescript
async function decrementStock(orderId: string) {
  const shopItems = await supabase
    .from('shop_items')
    .select('product_id, variant_id, quantity')
    .eq('order_id', orderId)
    .eq('item_type', 'product')

  for (const item of shopItems) {
    if (item.variant_id) {
      await supabase.rpc('decrement_variant_stock', {
        p_variant_id: item.variant_id,
        p_quantity: item.quantity,
      })
    } else {
      await supabase.rpc('decrement_product_stock', {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      })
    }
  }
}
```

### 9. Localization

```json
"checkout": {
  "title": "Checkout",
  "customerDetails": "Customer Details",
  "deliveryAddress": "Delivery / Installation Address",
  "orderNotes": "Order Notes",
  "orderNotesPlaceholder": "e.g., Gate code, access instructions",
  "orderSummary": "Order Summary",
  "payment": "Payment",
  "depositNote": "Installation order: 50% deposit required now",
  "fullPaymentNote": "Full payment at checkout",
  "payNow": "Pay now",
  "payLater": "Balance on completion",
  "termsAgree": "I agree to the Terms & Conditions and Privacy Policy",
  "payButton": "Pay {amount} via Paystack",
  "processing": "Processing payment...",
  "estimatedDelivery": "Estimated delivery: 3-5 business days"
},
"confirmation": {
  "title": "Order Confirmed!",
  "thankYou": "Thank you for your order, {name}!",
  "orderNumber": "Order Number",
  "paymentReceived": "{amount} deposit received",
  "emailSent": "We've sent a confirmation email to {email}",
  "whatNext": "What Happens Next",
  "downloadInvoice": "Download Invoice",
  "questions": "Questions? Contact us at {email} or {phone}"
}
```

---

## Acceptance Criteria

```
✅ Checkout form validates all required fields
✅ Address section shown only for delivery/installation orders
✅ Order created in database with correct type, amounts, and items
✅ Configurator items saved with full deck_design JSONB
✅ Shop items saved with correct quantities and prices
✅ Kit items exploded into component shop_items for stock tracking
✅ Paystack payment initializes with correct amount (deposit or full)
✅ Paystack webhook verifies signature
✅ Webhook updates order status on charge.success
✅ Stock decremented after payment confirmation
✅ Order confirmation page shows after redirect
✅ Confirmation email sent
✅ Cart cleared after successful payment
✅ Failed payment shows retry option
✅ Saved quote marked as converted (if applicable)
✅ Order number generated (DL-2026-NNNN sequence)
✅ Server-side price re-validation prevents tampered prices
✅ All text localized (EN/AF)
✅ Terms checkbox required before payment
```

---

## Notes for Claude Code

- **Server-side price re-validation is critical.** Never trust client-side pricing. The API must recalculate the full order total from current database rates before creating the Paystack transaction.
- Paystack uses ZAR cents for amounts. Our database also uses cents. No conversion needed.
- The webhook endpoint must be idempotent — Paystack may send the same event multiple times.
- For installation orders, the webhook sets payment_status to 'deposit_paid' (not 'paid'). 'paid' only happens when the balance is collected (manual process post-installation).
- Kit component shop_items have `unit_price_cents: 0` because the price is on the parent kit item. This avoids double-counting in revenue reports.
- The order confirmation page should verify payment via Paystack's API (`GET /transaction/verify/{reference}`) as a fallback in case the webhook hasn't fired yet.
