"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import QRCode from "react-qr-code";

type Guest = {
  id: string;
  full_name: string;
  email: string | null;
  whatsapp: string | null;
  category: string | null;
  invite_code: string;
  rsvp_status: string | null;
};

export default function AdminPage() {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [category, setCategory] = useState("Guest");
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchGuests();
  }, []);

  async function fetchGuests() {
    setLoading(true);

    const { data, error } = await supabase
      .from("guests")
      .select("*")
      .order("created_at", { ascending: false });

    if (!error && data) setGuests(data);

    setLoading(false);
  }

  function generateInviteCode(name: string) {
    const cleanedName = name.replace(/[^a-zA-Z]/g, "").toUpperCase().slice(0, 4);
    const randomNumber = Math.floor(1000 + Math.random() * 9000);
    return `${cleanedName}${randomNumber}`;
  }

  async function addGuest(e: React.FormEvent) {
    e.preventDefault();

    if (!fullName.trim()) {
      alert("Guest name is required");
      return;
    }

    setAdding(true);

    const inviteCode = generateInviteCode(fullName);

    const { error } = await supabase.from("guests").insert({
      full_name: fullName.trim(),
      email: email.trim() || null,
      whatsapp: whatsapp.trim() || null,
      category,
      invite_code: inviteCode,
      rsvp_status: "Pending",
    });

    if (error) {
      alert(error.message);
    } else {
      setFullName("");
      setEmail("");
      setWhatsapp("");
      setCategory("Guest");
      await fetchGuests();
    }

    setAdding(false);
  }

  function copyInviteLink(inviteCode: string) {
    const inviteLink = `http://localhost:3000/invite?code=${inviteCode}`;
    navigator.clipboard.writeText(inviteLink);
    alert("Invite link copied");
  }

  const filteredGuests = guests.filter((guest) => {
    const searchText = search.toLowerCase();

    return (
      guest.full_name?.toLowerCase().includes(searchText) ||
      guest.invite_code?.toLowerCase().includes(searchText) ||
      guest.whatsapp?.toLowerCase().includes(searchText) ||
      guest.category?.toLowerCase().includes(searchText)
    );
  });

  const totalGuests = guests.length;
  const vipGuests = guests.filter((g) => g.category === "VIP").length;
  const familyGuests = guests.filter((g) => g.category === "Family").length;
  const ministerGuests = guests.filter((g) => g.category === "Minister").length;

  return (
    <main className="min-h-screen bg-neutral-950 text-white p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>

        <p className="text-gray-400 mt-2">
          Celebrating Pastor Obi Chiemeka Guest Management
        </p>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
          <StatCard title="Total Guests" value={totalGuests} />
          <StatCard title="VIP" value={vipGuests} />
          <StatCard title="Family" value={familyGuests} />
          <StatCard title="Ministers" value={ministerGuests} />
        </div>

        <div className="mt-8 bg-white text-black rounded-2xl p-5">
          <h2 className="text-xl font-bold">Add Guest</h2>

          <form
            onSubmit={addGuest}
            className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-4"
          >
            <input
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Full name"
              className="border rounded-xl px-4 py-3"
            />

            <input
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="border rounded-xl px-4 py-3"
            />

            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="WhatsApp"
              className="border rounded-xl px-4 py-3"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="border rounded-xl px-4 py-3"
            >
              <option>Guest</option>
              <option>VIP</option>
              <option>Family</option>
              <option>Minister</option>
            </select>

            <button
              type="submit"
              className="bg-black text-white rounded-xl px-4 py-3 font-semibold"
            >
              {adding ? "Adding..." : "Add Guest"}
            </button>
          </form>
        </div>

        <div className="mt-8 bg-white text-black rounded-2xl overflow-hidden">
          <div className="p-5 border-b">
            <h2 className="text-xl font-bold">Guest List</h2>

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, code, phone or category"
              className="mt-4 w-full border rounded-xl px-4 py-3"
            />
          </div>

          {loading ? (
            <p className="p-5">Loading guests...</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Invite Code</th>
                    <th className="p-4">RSVP</th>
                    <th className="p-4">WhatsApp</th>
                    <th className="p-4">QR Code</th>
                    <th className="p-4">Invite Link</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredGuests.map((guest) => {
                    const qrValue = `http://localhost:3000/admin/verify?code=${guest.invite_code}`;

                    return (
                      <tr key={guest.id} className="border-t">
                        <td className="p-4 font-medium">{guest.full_name}</td>
                        <td className="p-4">{guest.category}</td>
                        <td className="p-4 font-mono">{guest.invite_code}</td>
                        <td className="p-4">{guest.rsvp_status}</td>
                        <td className="p-4">{guest.whatsapp}</td>

                        <td className="p-4">
                          <div className="bg-white p-2 inline-block border rounded-lg">
                            <QRCode value={qrValue} size={64} />
                          </div>
                        </td>

                        <td className="p-4">
                          <button
                            onClick={() => copyInviteLink(guest.invite_code)}
                            className="bg-black text-white px-4 py-2 rounded-lg text-sm"
                          >
                            Copy Link
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {filteredGuests.length === 0 && (
                <div className="p-8 text-center text-gray-500">
                  No guests found
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

function StatCard({ title, value }: { title: string; value: number }) {
  return (
    <div className="bg-white text-black rounded-2xl p-5">
      <p className="text-gray-500">{title}</p>
      <h2 className="text-3xl font-bold mt-2">{value}</h2>
    </div>
  );
}