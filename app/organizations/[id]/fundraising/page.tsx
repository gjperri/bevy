"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Target, Link as LinkIcon, Trophy, DollarSign } from "lucide-react";

export default function FundraisingPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const organizationId = params.id as string;

  // Status states
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // --- SAMPLE DATA / STATE ---
  const [currentBalance, setCurrentBalance] = useState(3250.50);
  const [goalAmount, setGoalAmount] = useState(5000);
  const [fundraisingLink, setFundraisingLink] = useState(`https://give.example.com/org/${organizationId}`);
  // ---------------------------

  useEffect(() => {
    const checkAccess = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      const { data: membership } = await supabase
        .from("organization_memberships")
        .select("role")
        .eq("organization_id", organizationId)
        .eq("user_id", user.id)
        .single();

      if (!membership || membership.role !== "admin") {
        router.push(`/organizations/${organizationId}`);
        return;
      }

      setIsAdmin(true);
      setLoading(false);
    };

    checkAccess();
  }, [supabase, router, organizationId]);

  const handleUpdateGoal = () => {
    setSaving(true);
    // Simulate API call
    setTimeout(() => {
      setSaving(false);
      alert("Fundraising goal updated!");
    }, 500);
  };

  const progressPercentage = Math.min(Math.round((currentBalance / goalAmount) * 100), 100);

  if (loading) return <p style={{ padding: "2rem" }}>Loading fundraising data...</p>;
  if (!isAdmin) return null;

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "2rem", fontWeight: 600, marginBottom: "0.5rem" }}>Fundraising</h1>
      <p style={{ color: "#666", marginBottom: "2rem" }}>Track progress and manage your organization's campaigns.</p>

      {/* Progress Overview Card */}
      <div style={{
        backgroundColor: "#fff",
        border: "1px solid #e5e7eb",
        borderRadius: "12px",
        padding: "2rem",
        marginBottom: "1.5rem",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "1rem" }}>
          <div>
            <p style={{ color: "#666", fontSize: "0.875rem", fontWeight: 500 }}>Current Balance</p>
            <h2 style={{ fontSize: "2.5rem", fontWeight: 700, color: "#000" }}>
              ${currentBalance.toLocaleString()}
            </h2>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ color: "#666", fontSize: "0.875rem" }}>Goal: ${goalAmount.toLocaleString()}</p>
            <p style={{ fontWeight: 600, color: "#10b981" }}>{progressPercentage}% Reached</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div style={{ width: "100%", height: "12px", backgroundColor: "#f3f4f6", borderRadius: "10px", overflow: "hidden" }}>
          <div style={{ 
            width: `${progressPercentage}%`, 
            height: "100%", 
            backgroundColor: "#10b981", 
            transition: "width 0.5s ease-out" 
          }} />
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
        {/* Goal Settings Widget */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <Target size={20} color="#666" />
            <h3 style={{ fontWeight: 600 }}>Adjust Goal</h3>
          </div>
          <div style={{ position: "relative" }}>
            <span style={{ position: "absolute", left: "10px", top: "8px", color: "#666" }}>$</span>
            <input
              type="number"
              value={goalAmount}
              onChange={(e) => setGoalAmount(Number(e.target.value))}
              style={{
                width: "100%",
                padding: "0.5rem 0.5rem 0.5rem 1.5rem",
                border: "1px solid #d1d5db",
                borderRadius: "6px",
                marginBottom: "1rem"
              }}
            />
          </div>
          <Button onClick={handleUpdateGoal} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Set New Goal"}
          </Button>
        </div>

        {/* Link Widget */}
        <div style={{ backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1.5rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <LinkIcon size={20} color="#666" />
            <h3 style={{ fontWeight: 600 }}>Donation Link</h3>
          </div>
          <input
            type="text"
            value={fundraisingLink}
            onChange={(e) => setFundraisingLink(e.target.value)}
            style={{
              width: "100%",
              padding: "0.5rem",
              border: "1px solid #d1d5db",
              borderRadius: "6px",
              fontSize: "0.875rem",
              marginBottom: "1rem",
              color: "#666"
            }}
          />
          <Button variant="outline" className="w-full" onClick={() => {
            navigator.clipboard.writeText(fundraisingLink);
            alert("Link copied!");
          }}>
            Copy Link
          </Button>
        </div>
      </div>

      {/* Recent Activity Mini-Table */}
      <div style={{ marginTop: "2rem", backgroundColor: "#fff", border: "1px solid #e5e7eb", borderRadius: "8px", padding: "1.5rem" }}>
        <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Recent Donations</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {[
            { name: "Sarah J.", amount: 50, date: "2 hours ago" },
            { name: "Anonymous", amount: 500, date: "Yesterday" },
            { name: "Mike Ross", amount: 100, date: "Oct 12" },
          ].map((donation, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "0.75rem", borderBottom: i === 2 ? "none" : "1px solid #f3f4f6" }}>
              <div>
                <p style={{ fontWeight: 500, fontSize: "0.95rem" }}>{donation.name}</p>
                <p style={{ fontSize: "0.8rem", color: "#666" }}>{donation.date}</p>
              </div>
              <span style={{ fontWeight: 600, color: "#10b981" }}>+${donation.amount}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}