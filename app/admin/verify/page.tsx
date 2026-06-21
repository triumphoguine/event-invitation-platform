"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Guest = {
  full_name: string;
  category: string | null;
  invite_code: string;
  rsvp_status: string | null;
};

export default function VerifyPage() {
  return (
    <Suspense
      fallback={
        <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
          <p>Loading verification...</p>
        </main>
      }
    >
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();

  const [code, setCode] = useState("");
  const [guest, setGuest] = useState<Guest | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const codeFromUrl = searchParams.get("code");

    if (codeFromUrl) {
      setCode(codeFromUrl.toUpperCase());
      verifyCodeDirectly(codeFromUrl);
    }
  }, [searchParams]);

  async function verifyCodeDirectly(rawCode: string) {
    setLoading(true);
    setGuest(null);
    setError("");

    const cleanedCode = rawCode.trim().toUpperCase();

    const { data, error } = await supabase
      .from("guests")
      .select("full_name, category, invite_code, rsvp_status")
      .eq("invite_code", cleanedCode)
      .single();

    if (error || !data) {
      setError("ACCESS DENIED");
    } else {
      setGuest(data);
    }

    setLoading(false);
  }

  async function verifyCode(e: React.FormEvent) {
    e.preventDefault();
    await verifyCodeDirectly(code);
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center px-4">
      <div className="w-full max-w-lg rounded-3xl bg-white text-black p-8 shadow-2xl">
        <h1 className="text-3xl font-bold text-center">Gate Verification</h1>

        <p className="text-center text-gray-600 mt-2">
          Enter or scan guest invite code to confirm access.
        </p>

        <form onSubmit={verifyCode} className="mt-6 space-y-4">
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Enter or scan invite code"
            className="w-full border rounded-xl px-4 py-4 text-xl outline-none uppercase"
          />

          <button
            type="submit"
            className="w-full bg-black text-white rounded-xl py-4 font-bold text-lg"
          >
            {loading ? "Checking..." : "Verify Guest"}
          </button>
        </form>

        {guest && (
          <div className="mt-6 rounded-2xl bg-green-100 border border-green-400 p-6 text-center">
            <h2 className="text-4xl font-black text-green-800">
              ACCESS GRANTED
            </h2>

            <p className="mt-4 text-2xl font-bold">{guest.full_name}</p>
            <p className="text-lg mt-2">Category: {guest.category}</p>
            <p className="text-lg">Code: {guest.invite_code}</p>
            <p className="text-lg">RSVP: {guest.rsvp_status}</p>
          </div>
        )}

        {error && (
          <div className="mt-6 rounded-2xl bg-red-100 border border-red-400 p-6 text-center">
            <h2 className="text-4xl font-black text-red-800">
              ACCESS DENIED
            </h2>
            <p className="mt-2 text-lg">Invalid invitation code</p>
          </div>
        )}
      </div>
    </main>
  );
}