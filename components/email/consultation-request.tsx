import { Hr, Text, Section, Link } from "@react-email/components";
import { BaseLayout, CtaButton, InfoRow, brand, styles } from "./_base-layout";

export interface ConsultationRequestProps {
  customerName: string;
  preferredDate?: string;
  address?: string;
  siteUrl?: string;
}

export default function ConsultationRequest({
  customerName = "there",
  preferredDate,
  address,
  siteUrl,
}: ConsultationRequestProps) {
  const baseUrl = siteUrl || brand.siteUrl;

  return (
    <BaseLayout
      preview="We've received your consultation request — we'll be in touch soon"
      showPortalLink={false}
    >
      <Text style={styles.h1}>Consultation request received</Text>
      <Text style={styles.paragraph}>Hi {customerName},</Text>
      <Text style={styles.paragraph}>
        Thanks for reaching out! We've received your deck consultation request
        and one of our team members will contact you within 1–2 business days to
        arrange a site visit.
      </Text>

      {(preferredDate || address) && (
        <Section style={styles.infoBox}>
          {preferredDate && (
            <>
              <Text style={styles.infoLabel}>Preferred Date</Text>
              <Text style={{ ...styles.infoValue, marginBottom: "12px" }}>
                {preferredDate}
              </Text>
            </>
          )}
          {address && (
            <>
              <Text style={styles.infoLabel}>Site Address</Text>
              <Text style={styles.infoValue}>{address}</Text>
            </>
          )}
        </Section>
      )}

      <Text style={styles.paragraph}>
        In the meantime, feel free to explore our deck configurator to get an
        idea of the options available.
      </Text>

      <CtaButton href={`${baseUrl}/configure`}>Explore Deck Options</CtaButton>

      <Hr style={styles.hr} />

      <Text style={styles.paragraph}>
        Have questions?{" "}
        <Link href={`${baseUrl}/contact`} style={styles.link}>
          Contact us
        </Link>{" "}
        and we'll get back to you right away.
      </Text>

      <Text
        style={{ ...styles.paragraph, color: brand.textMuted, fontSize: "13px" }}
      >
        If you didn't submit this request, you can safely ignore this email.
      </Text>
    </BaseLayout>
  );
}
