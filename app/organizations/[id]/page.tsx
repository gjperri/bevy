"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import AdminSidebar from "@/components/AdminSidebar";

type Member = {
  id: string;
  membership_id: string;
  full_name: string | null;
  role: string;
  payment_class: string;
};

type PaymentClass = {
  class_name: string;
  display_name: string;
  dues_amount: number;
};

export default function OrganizationPage() {
  const supabase = createClient();
  const router = useRouter();
  const params = useParams();
  const organizationId = params.id as string;

  const [orgName, setOrgName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [members, setMembers] = useState<Member[]>([]);
  const [paymentClasses, setPaymentClasses] = useState<PaymentClass[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    show: boolean;
    membershipId: string;
    memberName: string;
    newClass: string;
    newClassName: string;
  } | null>(null);

  useEffect(() => {
    const fetchOrganization = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push("/login");
        return;
      }

      // Organization
      const { data: org } = await supabase
        .from("organizations")
        .select("name, invite_code")
        .eq("id", organizationId)
        .single();

      if (!org) return;

      setOrgName(org.name);
      setInviteCode(org.invite_code);

      // Memberships with payment classes
      const { data: memberships } = await supabase
        .from("organization_memberships")
        .select("id, user_id, role, payment_class")
        .eq("organization_id", organizationId);

      if (!memberships) return;

      // Is current user admin?
      const myMembership = memberships.find(
        (m) => m.user_id === user.id
      );
      setIsAdmin(myMembership?.role === "admin");

      // Profiles
      const userIds = memberships.map((m) => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, full_name")
        .in("id", userIds);

      const mappedMembers: Member[] = memberships.map((m) => {
        const profile = profiles?.find((p) => p.id === m.user_id);
        return {
          id: m.user_id,
          membership_id: m.id,
          full_name: profile?.full_name || "Unnamed User",
          role: m.role,
          payment_class: m.payment_class || "general_member",
        };
      });

      setMembers(mappedMembers);

      // Fetch payment classes
      const { data: classesData } = await supabase
        .from("organization_payment_classes")
        .select("class_name, display_name, dues_amount")
        .eq("organization_id", organizationId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });

      if (classesData) {
        setPaymentClasses(classesData);
      }

      setLoading(false);
    };

    fetchOrganization();
  }, [supabase, router, organizationId]);

  const handlePaymentClassChange = (
    membershipId: string,
    memberName: string,
    newClass: string
  ) => {
    const paymentClass = paymentClasses.find((pc) => pc.class_name === newClass);
    setConfirmDialog({
      show: true,
      membershipId,
      memberName,
      newClass,
      newClassName: paymentClass?.display_name || newClass,
    });
  };

  const confirmPaymentClassChange = async () => {
    if (!confirmDialog) return;

    console.log("Payment class change initiated");

    const { error } = await supabase
      .from("organization_memberships")
      .update({ payment_class: confirmDialog.newClass })
      .eq("id", confirmDialog.membershipId);

    if (error) {
      console.error("Error updating payment class:", error);
      alert("Failed to update payment class");
    } else {
      setMembers((prev) =>
        prev.map((m) =>
          m.membership_id === confirmDialog.membershipId
            ? { ...m, payment_class: confirmDialog.newClass }
            : m
        )
      );
    }

    setConfirmDialog(null);
  };

  const getPaymentClassDisplay = (className: string) => {
    const pc = paymentClasses.find((p) => p.class_name === className);
    return pc?.display_name || className;
  };

  if (loading) {
    return <p style={{ padding: "2rem" }}>Loading organization...</p>;
  }

  return (
    <>
      {/* Admin Sidebar */}
      {isAdmin && <AdminSidebar organizationId={organizationId} />}

      {/* Confirmation Dialog */}
      {confirmDialog && confirmDialog.show && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setConfirmDialog(null)}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "2rem",
              borderRadius: "12px",
              maxWidth: "400px",
              boxShadow: "0 20px 25px rgba(0, 0, 0, 0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ fontSize: "1.5rem", fontWeight: 600, marginBottom: "1rem" }}>
              Confirm Payment Class Change
            </h2>
            <p style={{ color: "#6b7280", marginBottom: "1.5rem" }}>
              Are you sure you want to change <strong>{confirmDialog.memberName}</strong>'s
              payment class to <strong>{confirmDialog.newClassName}</strong>?
            </p>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button
                onClick={() => setConfirmDialog(null)}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  border: "1px solid #d1d5db",
                  backgroundColor: "white",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
              <button
                onClick={confirmPaymentClassChange}
                style={{
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: "#6b46c1",
                  color: "white",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Content */}
      <div
        style={{
          padding: "2rem",
          maxWidth: "900px",
          margin: "0 auto",
          marginLeft: isAdmin ? "72px" : "0",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "2rem",
          }}
        >
          <div>
            <h1 style={{ fontSize: "2rem", fontWeight: 600 }}>
              {orgName}
            </h1>
            <p style={{ color: "#666" }}>Organization Members</p>
          </div>

          {isAdmin && (
            <Button onClick={async () => {
              await navigator.clipboard.writeText(inviteCode);
              alert("Invite code copied!");
            }}>
              Copy Invite Code
            </Button>
          )}
        </div>

        {/* Members */}
        <div
          style={{
            border: "1px solid #ddd",
            borderRadius: "8px",
            overflow: "hidden",
          }}
        >
          {members.map((member) => (
            <div
              key={member.id}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "1rem",
                borderBottom: "1px solid #eee",
                gap: "1rem",
              }}
            >
              <p style={{ fontWeight: 500, flex: 1 }}>
                {member.full_name}
              </p>

              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                {/* Payment Class Selector */}
                {isAdmin ? (
                  <select
                    value={member.payment_class}
                    onChange={(e) =>
                      handlePaymentClassChange(
                        member.membership_id,
                        member.full_name || "Member",
                        e.target.value
                      )
                    }
                    style={{
                      padding: "0.4rem 0.6rem",
                      borderRadius: "6px",
                      border: "1px solid #d1d5db",
                      fontSize: "0.875rem",
                      backgroundColor: "white",
                      cursor: "pointer",
                      minWidth: "140px",
                    }}
                  >
                    {paymentClasses.map((pc) => (
                      <option key={pc.class_name} value={pc.class_name}>
                        {pc.display_name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <span
                    style={{
                      padding: "0.4rem 0.75rem",
                      borderRadius: "6px",
                      fontSize: "0.875rem",
                      fontWeight: 500,
                      backgroundColor: "#f3f4f6",
                      color: "#374151",
                    }}
                  >
                    {getPaymentClassDisplay(member.payment_class)}
                  </span>
                )}

                {/* Role Badge */}
                <span
                  style={{
                    padding: "0.25rem 0.75rem",
                    borderRadius: "999px",
                    fontSize: "0.75rem",
                    fontWeight: 500,
                    backgroundColor:
                      member.role === "admin" ? "#6b46c1" : "#e5e7eb",
                    color:
                      member.role === "admin" ? "#fff" : "#374151",
                  }}
                >
                  {member.role}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}