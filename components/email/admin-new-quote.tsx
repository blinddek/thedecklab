import { Text } from "@react-email/components";
import {
  BaseLayout,
  CtaButton,
  InfoRow,
  brand,
  styles,
  formatCurrency,
} from "./_base-layout";

export interface AdminNewQuoteProps {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  quoteId: string;
  totalCents: number;
  deckType?: string;
  material?: string;
  areaSqm?: number;
  adminUrl: string;
}

export default function AdminNewQuote({
  customerName = "Unknown",
  customerEmail = "",
  customerPhone,
  quoteId = "xxxxxxxx-xxxx",
  totalCents = 0,
  deckType,
  material,
  areaSqm,
  adminUrl = "/admin",
}: AdminNewQuoteProps) {
  return (
    <BaseLayout
      preview={`New quote from ${customerName} — ${formatCurrency(totalCents / 100)}`}
      showPortalLink={false}
    >
      <Text style={styles.h1}>New Quote Saved</Text>
      <Text style={styles.paragraph}>
        A customer has saved a configurator quote.
      </Text>

      <InfoRow label="Customer" value={customerName} />
      <InfoRow label="Email" value={customerEmail} />
      {customerPhone && <InfoRow label="Phone" value={customerPhone} />}
      <InfoRow
        label="Estimated Total"
        value={formatCurrency(totalCents / 100)}
      />

      {(deckType || material || areaSqm) && (
        <>
          {deckType && <InfoRow label="Deck Type" value={deckType} />}
          {material && <InfoRow label="Material" value={material} />}
          {areaSqm != null && (
            <InfoRow label="Area" value={`${areaSqm} m²`} />
          )}
        </>
      )}

      <InfoRow label="Quote ID" value={quoteId} />

      <CtaButton href={adminUrl}>View in Admin</CtaButton>

      <Text
        style={{ ...styles.paragraph, color: brand.textMuted, fontSize: "13px" }}
      >
        This is an automated notification. Reply directly to the customer at{" "}
        {customerEmail}.
      </Text>
    </BaseLayout>
  );
}
