"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";

type Member = {
  id: string;
  full_name: string | null;
};

export default function TreasuryPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const organizationId = params.id as string;

  const [members, setMembers] = useState<Member[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Fetch memberships (role check + members)
      const { data: memberships, error: membershipError } = await supabase
        .from("organization_memberships")
        .select("user_id, role")
        .eq("organization_id", organizationId);

      if (membershipError || !memberships) {
        console.error("Error fetching memberships:", membershipError);
        setLoading(false);
        return;
      }

      // Is current user admin?
      const myMembership = memberships.find((m) => m.user_id === user.id);
      const userIsAdmin = myMembership?.role === "admin";
      setIsAdmin(userIsAdmin);

      // Redirect non-admins to my-balance page
      if (!userIsAdmin) {
        router.push(`/organizations/${organizationId}/treasury/my-balance`);
        return;
      }

      const userIds = memberships.map((m) => m.user_id);

      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      if (profilesError || !profiles) {
        console.error("Error fetching profiles:", profilesError);
        setLoading(false);
        return;
      }

      setMembers(
        profiles.map((p) => ({
          id: p.id,
          full_name: p.full_name || "Unnamed User",
        }))
      );

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
          Loading treasury...
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
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: "2.5rem",
            gap: "2rem",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "2.5rem",
                fontWeight: 700,
                color: "#1e293b",
                marginBottom: "0.5rem",
              }}
            >
              {isAdmin ? "Treasury Overview" : "My Balance"}
            </h1>
            <p
              style={{
                color: "#64748b",
                fontSize: "1rem",
              }}
            >
              {isAdmin
                ? "Overview of all member balances"
                : "View and manage your dues and fees"}
            </p>
          </div>

          {/* Admin: View My Balance Button */}
          {isAdmin && (
            <Button
              onClick={() =>
                router.push(`/organizations/${organizationId}/treasury/my-balance`)
              }
              style={{
                backgroundColor: "#448bfc",
                color: "white",
                fontWeight: 500,
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                border: "none",
                transition: "all 0.3s",
                boxShadow: "0 4px 12px rgba(68, 139, 252, 0.3)",
                display: "flex",
                alignItems: "center",
                gap: "0.5rem",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = "#3378e8";
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "#448bfc";
                e.currentTarget.style.transform = "translateY(0)";
              }}
            >
              👤 View My Balance
            </Button>
          )}
        </div>

        {/* Members Balance Card */}
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
            <span style={{ flex: 1 }}>Member</span>
            <span style={{ width: "150px", textAlign: "right" }}>Balance</span>
          </div>

          {/* Members List */}
          {members.length === 0 ? (
            <p
              style={{
                padding: "2rem 1.5rem",
                textAlign: "center",
                color: "#64748b",
              }}
            >
              No members found.
            </p>
          ) : (
            members.map((member, index) => (
              <div
                key={member.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "1.25rem 1.5rem",
                  borderBottom:
                    index < members.length - 1 ? "1px solid #f1f5f9" : "none",
                  transition: "background-color 0.2s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = "#f8fafc";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "1rem",
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      width: "40px",
                      height: "40px",
                      backgroundColor: "#eff6ff",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#448bfc",
                      fontSize: "1rem",
                      fontWeight: 600,
                    }}
                  >
                    {(member.full_name || "U").charAt(0).toUpperCase()}
                  </div>
                  <p
                    style={{
                      fontWeight: 500,
                      color: "#1e293b",
                      fontSize: "0.95rem",
                    }}
                  >
                    {member.full_name}
                  </p>
                </div>

                <p
                  style={{
                    fontWeight: 600,
                    fontSize: "1rem",
                    color: "#10b981",
                    width: "150px",
                    textAlign: "right",
                  }}
                >
                  $0.00
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}