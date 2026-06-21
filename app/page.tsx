"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

type Guest = {
  full_name: string;
  category: string | null;
  invite_code: string;
  rsvp_status: string | null;
};

export default function Home() {
  const [code, setCode] = useState("");
  const [guest, setGuest] = useState<Guest | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();

    setLoading(true);
    setGuest(null);
    setError("");

    const cleanedCode = code.trim().toUpperCase();

    const { data, error } = await supabase
      .from("guests")
      .select("full_name, category, invite_code, rsvp_status")
      .eq("invite_code", cleanedCode)
      .single();

    if (error || !data) {
      setError("ACCESS DENIED: Invalid invite code");
    } else {
      setGuest(data);
    }

    setLoading(false);
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950 text-white px-4">
      <div className="w-full max-w-md bg-white text-black rounded-2xl p-8 shadow-xl">
        <h1 className="text-3xl font-bold text-center">
          Celebrating Pastor Obi Chiemeka
        </h1>

        <p className="text-center mt-3 text-gray-600">
          Enter your private invitation code to verify access.
        </p>

        <form onSubmit={verifyCode} className="mt-6 space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter invite code"
            className="w-full border rounded-xl px-4 py-3 text-lg outline-none"
          />

          <button
            type="submit"
            className="w-full bg-black text-white rounded-xl py-3 font-semibold"
          >
            {loading ? "Checking..." : "Verify Access"}
          </button>
        </form>

        {guest && (
          <div className="mt-6 rounded-xl bg-green-100 border border-green-300 p-5">
            <h2 className="text-2xl font-bold text-green-800">
              ACCESS GRANTED
            </h2>
            <p className="mt-2">
              <strong>Name:</strong> {guest.full_name}
            </p>
            <p>
              <strong>Category:</strong> {guest.category}
            </p>
            <p>
              <strong>Code:</strong> {guest.invite_code}
            </p>
            <p>
              <strong>RSVP:</strong> {guest.rsvp_status}
            </p>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-xl bg-red-100 border border-red-300 p-5">
            <h2 className="text-xl font-bold text-red-800">{error}</h2>
          </div>
        )}
      </div>
    </main>
  );
}