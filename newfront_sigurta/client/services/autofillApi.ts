import axios from "axios";

const API_BASE_URL =
  (import.meta.env.VITE_API_URL?.replace(/\/$/, "") ?? "http://localhost:3000/api");

export type AutofillCandidate = {
  from: "syrian_vehicles" | "vehicle_registry";
  score: number;
  preview: Record<string, any>;
  patch: Record<string, any>;
};

export async function fetchAutofill(params: {
  plateNumber?: string;
  plateCountry?: string;
  plateRegion?: string;
  chassisNumber?: string;
  engineNumber?: string;
  ownerName?: string;
  nationalId?: string;
  excludeId?: string;
}) {
  const { data } = await axios.get(`${API_BASE_URL}/autofill`, { params });
  return data as { success: boolean; match: any | null; candidates: AutofillCandidate[] };
}
