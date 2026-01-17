"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

type Fee = {
  id: string;
  description: string;
  amount: number;
  date: string;
  status: "pending" | "paid";
};

export default function MyBalancePage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const organizationId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [currentUserName, setCurrentUserName] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);

  // Placeholder fees
  const [fees] = useState<Fee[]>([
    {
      id: "1",
      description: "Monthly Dues - January 2026",
      amount: 50.0,
      date: "2026-01-01",
      status: "pending",
    },
    {
      id: "2",
      description: "Event Registration Fee",
      amount: 25.0,
      date: "2026-01-10",
      status: "pending",
    },
    {
      id: "3",
      description: "Late Payment Fee",
      amount: 10.0,
      date: "2026-01-15",
      status: "pending",
    },
  ]);

  const totalBalance = fees
    .filter((fee) => fee.status === "pending")
    .reduce((sum, fee) => sum + fee.amount, 0);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch current user's profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .single();

      setCurrentUserName(profile?.full_name || "User");

      // Check if user is admin
      const { data: membership } = await supabase
        .from("organization_memberships")
        .select("role")
        .eq("organization_id", organizationId)
        .eq("user_id", user.id)
        .single();

      setIsAdmin(membership?.role === "admin");
      setLoading(false);
    };

    fetchData();
  }, [supabase, router, organizationId]);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #f8fafc 0%, #e0f2fe 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            backgroundColor: "white",
            padding: "2rem 3rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            color: "#64748b",
            fontSize: "1.125rem",
          }}
        >
          Loading your balance...
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#ffffff",
        padding: "3rem 2rem",
      }}
    >
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        {/* Back Button for Admins */}
        {isAdmin && (
          <button
            onClick={() => router.push(`/organizations/${organizationId}/treasury`)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5rem",
              padding: "0.5rem 1rem",
              marginBottom: "1.5rem",
              backgroundColor: "white",
              border: "1px solid #e2e8f0",
              borderRadius: "8px",
              color: "#64748b",
              cursor: "pointer",
              fontWeight: 500,
              fontSize: "0.875rem",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = "#f8fafc";
              e.currentTarget.style.borderColor = "#cbd5e1";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "white";
              e.currentTarget.style.borderColor = "#e2e8f0";
            }}
          >
            <ArrowLeft size={16} />
            Back to Treasury Overview
          </button>
        )}

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: 700,
              color: "#1e293b",
              marginBottom: "0.5rem",
            }}
          >
            My Balance
          </h1>
          <p
            style={{
              color: "#64748b",
              fontSize: "1rem",
            }}
          >
            View and manage your dues and fees
          </p>
        </div>

        {/* Balance Summary Card */}
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            padding: "2rem",
            marginBottom: "2rem",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <p
                style={{
                  fontSize: "0.875rem",
                  color: "#64748b",
                  marginBottom: "0.5rem",
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                  fontWeight: 600,
                }}
              >
                Total Balance
              </p>
              <p
                style={{
                  fontSize: "3rem",
                  fontWeight: 700,
                  color: totalBalance > 0 ? "#ef4444" : "#10b981",
                }}
              >
                ${totalBalance.toFixed(2)}
              </p>
            </div>
            <Button
              onClick={() => window.open("https://buy.stripe.com/test_9B67sL2Z0gyUgYObtY4F200")}
              style={{
                backgroundColor: "#448bfc",
                color: "white",
                fontWeight: 600,
                padding: "0.875rem 2rem",
                borderRadius: "8px",
                border: "none",
                fontSize: "1rem",
                cursor: "pointer",
                transition: "all 0.3s",
                boxShadow: "0 4px 12px rgba(68, 139, 252, 0.3)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#3378e8";
                e.currentTarget.style.transform = "translateY(-2px)";
                e.currentTarget.style.boxShadow =
                  "0 6px 16px rgba(68, 139, 252, 0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#448bfc";
                e.currentTarget.style.transform = "translateY(0)";
                e.currentTarget.style.boxShadow =
                  "0 4px 12px rgba(68, 139, 252, 0.3)";
              }}
            >
              Pay Now
            </Button>
          </div>
        </div>

        {/* Fees/Fines List Card */}
        <div
          style={{
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "1rem 1.5rem",
              backgroundColor: "#f8fafc",
              borderBottom: "1px solid #e2e8f0",
              fontWeight: 600,
              fontSize: "0.875rem",
              color: "#64748b",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            <span style={{ flex: 1 }}>Description</span>
            <span style={{ width: "120px", textAlign: "center" }}>Date</span>
            <span style={{ width: "100px", textAlign: "right" }}>Amount</span>
            <span style={{ width: "100px", textAlign: "center" }}>Status</span>
          </div>

          {/* Fees List */}
          {fees.length === 0 ? (
            <p
              style={{
                padding: "2rem 1.5rem",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              No fees or fines at this time.
            </p>
          ) : (
            fees.map((fee, index) => (
              <div
                key={fee.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1.25rem 1.5rem",
                  borderBottom:
                    index < fees.length - 1 ? "1px solid #f1f5f9" : "none",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <p
                  style={{
                    flex: 1,
                    fontWeight: 500,
                    color: "#1e293b",
                    fontSize: "0.95rem",
                  }}
                >
                  {fee.description}
                </p>

                <p
                  style={{
                    width: "120px",
                    textAlign: "center",
                    color: "#64748b",
                    fontSize: "0.875rem",
                  }}
                >
                  {new Date(fee.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </p>

                <p
                  style={{
                    width: "100px",
                    textAlign: "right",
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: fee.status === "pending" ? "#ef4444" : "#10b981",
                  }}
                >
                  ${fee.amount.toFixed(2)}
                </p>

                <div
                  style={{
                    width: "100px",
                    display: "flex",
                    justifyContent: "center",
                  }}
                >
                  <span
                    style={{
                      padding: "0.375rem 0.875rem",
                      borderRadius: "8px",
                      fontSize: "0.75rem",
                      fontWeight: 600,
                      backgroundColor:
                        fee.status === "pending" ? "#fef3c7" : "#d1fae5",
                      color: fee.status === "pending" ? "#92400e" : "#065f46",
                      textTransform: "capitalize",
                      letterSpacing: "0.025em",
                    }}
                  >
                    {fee.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}