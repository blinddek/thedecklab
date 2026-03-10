import { Hr, Text, Section, Link } from "@react-email/components";
import {
  BaseLayout,
  CtaButton,
  InfoRow,
  brand,
  styles,
  formatCurrency,
} from "./_base-layout";

export interface QuoteSavedProps {
  customerName: string;
  quoteId: string;
  totalCents: number;
  deckType?: string;
  material?: string;
  areaSqm?: number;
  siteUrl?: string;
}

export default function QuoteSaved({
  customerName = "there",
  quoteId = "xxxxxxxx-xxxx",
  totalCents = 0,
  deckType,
  material,
  areaSqm,
  siteUrl,
}: QuoteSavedProps) {
  const baseUrl = siteUrl || brand.siteUrl;

  return (
    <BaseLayout
      preview={`Your deck quote is saved — ${formatCurrency(totalCents / 100)}`}
      showPortalLink={false}
    >
      <Text style={styles.h1}>Your quote is saved 🎉</Text>
      <Text style={styles.paragraph}>Hi {customerName},</Text>
      <Text style={styles.paragraph}>
        Thanks for using the The Deck Lab configurator. Your deck quote has been
        saved and our team will be in touch to discuss the next steps.
      </Text>

      <InfoRow
        label="Estimated Total"
        value={formatCurrency(totalCents / 100)}
      />

      {(deckType || material || areaSqm) && (
        <Section style={styles.infoBox}>
          {deckType && (
            <>
              <Text style={styles.infoLabel}>Deck Type</Text>
              <Text style={{ ...styles.infoValue, marginBottom: "12px" }}>
                {deckType}
              </Text>
            </>
          )}
          {material && (
            <>
              <Text style={styles.infoLabel}>Material</Text>
              <Text style={{ ...styles.infoValue, marginBottom: "12px" }}>
                {material}
              </Text>
            </>
          )}
          {areaSqm != null && (
            <>
              <Text style={styles.infoLabel}>Deck Area</Text>
              <Text style={styles.infoValue}>{areaSqm} m²</Text>
            </>
          )}
        </Section>
      )}

      <Text style={styles.paragraph}>
        This is an indicative estimate based on the configuration you selected.
        Final pricing will be confirmed after a site visit or detailed
        consultation.
      </Text>

      <CtaButton href={`${baseUrl}/configure`}>
        Adjust Your Quote
      </CtaButton>

      <Hr style={styles.hr} />

      <Text style={styles.paragraph}>
        Want to chat sooner?{" "}
        <Link href={`${baseUrl}/contact`} style={styles.link}>
          Contact us
        </Link>{" "}
        and reference your quote ID below.
      </Text>

      <Section style={{ ...styles.infoBox, textAlign: "center" as const }}>
        <Text style={styles.infoLabel}>Quote Reference</Text>
        <Text
          style={{
            ...styles.infoValue,
            fontFamily: "monospace",
            fontSize: "13px",
            letterSpacing: "1px",
          }}
        >
          {quoteId}
        </Text>
      </Section>
    </BaseLayout>
  );
}
