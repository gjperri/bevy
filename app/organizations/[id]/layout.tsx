"use client";

import { useParams } from "next/navigation";
import AdminSidebar from "@/components/AdminSidebar";

export default function OrganizationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const params = useParams();
  const organizationId = params.id as string;

  return (
    <>
      {/* Sidebar persists across all organization pages */}
      <AdminSidebar organizationId={organizationId} />
      
      {/* Page content with margin to account for sidebar */}
      <div style={{ marginLeft: "72px" }}>
        {children}
      </div>
    </>
  );
}