"use server";

import { createClient } from "@/lib/supabase/server";

export async function saveQuote(
  _prevState: { success: boolean; quote_id?: string; error?: string } | null,
  formData: FormData
) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = (formData.get("phone") as string) || null;
    const configSnapshot = formData.get("config_snapshot") as string;
    const totalCents = Number(formData.get("total_cents"));
    const notes = (formData.get("notes") as string) || null;

    if (!name || !email || !configSnapshot || !totalCents) {
      return { success: false as const, error: "Name, email, and a valid quote are required." };
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(configSnapshot);
    } catch {
      return { success: false as const, error: "Invalid configuration snapshot." };
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("saved_quotes")
      .insert({
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        config_snapshot: parsed,
        total_cents: totalCents,
        notes,
        status: "draft",
      })
      .select("id")
      .single();

    if (error) {
      return { success: false as const, error: error.message };
    }

    return { success: true as const, quote_id: data.id };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}

export async function requestConsultation(
  _prevState: { success: boolean; error?: string } | null,
  formData: FormData
) {
  try {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = (formData.get("phone") as string) || null;
    const address = (formData.get("address") as string) || null;
    const preferredDate = (formData.get("preferred_date") as string) || null;
    const notes = (formData.get("notes") as string) || null;

    if (!name || !email) {
      return { success: false as const, error: "Name and email are required." };
    }

    const supabase = await createClient();

    const { error } = await supabase.from("consultation_requests").insert({
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      address,
      preferred_date: preferredDate || null,
      notes,
      status: "new",
    });

    if (error) {
      return { success: false as const, error: error.message };
    }

    return { success: true as const };
  } catch (err) {
    return {
      success: false as const,
      error: err instanceof Error ? err.message : "An unexpected error occurred.",
    };
  }
}
