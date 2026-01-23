"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export default function BankDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const organizationId = params.id as string;

  // Sample data - toggle between connected and not connected states
  const [isConnected, setIsConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);

  const sampleBankAccount = {
    bankName: "Chase Bank",
    accountType: "Checking",
    last4: "4242",
    status: "Active",
  };

  const handleConnectBank = () => {
    setConnecting(true);
    // Simulate connection process
    setTimeout(() => {
      setIsConnected(true);
      setConnecting(false);
    }, 1500);
  };

  const handleDisconnectBank = () => {
    if (confirm("Are you sure you want to disconnect this bank account?")) {
      setIsConnected(false);
    }
  };

  return (
    <div style={styles.pageContainer}>
      <div style={styles.contentWrapper}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h1 style={styles.title}>Bank Account Details</h1>
            <p style={styles.subtitle}>
              Connect your bank account to receive payments via Stripe
            </p>
          </div>
          <Button
            onClick={() => router.push(`/organizations/${organizationId}/treasury`)}
            style={styles.backButton}
          >
            Back to Treasury
          </Button>
        </div>

        {/* Bank Account Status */}
        <div style={styles.card}>
          {isConnected ? (
            <div>
              <div style={styles.statusHeader}>
                <div style={styles.connectedBadge}>✓ Connected</div>
              </div>

              <div style={styles.accountInfo}>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Bank Name:</span>
                  <span style={styles.infoValue}>
                    {sampleBankAccount.bankName}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Account Type:</span>
                  <span style={styles.infoValue}>
                    {sampleBankAccount.accountType}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Last 4 Digits:</span>
                  <span style={styles.infoValue}>
                    ****{sampleBankAccount.last4}
                  </span>
                </div>
                <div style={styles.infoRow}>
                  <span style={styles.infoLabel}>Status:</span>
                  <span style={styles.infoValue}>
                    {sampleBankAccount.status}
                  </span>
                </div>
              </div>

              <div style={styles.buttonContainer}>
                <Button
                  onClick={handleDisconnectBank}
                  style={styles.dangerButton}
                >
                  Disconnect Bank Account
                </Button>
              </div>
            </div>
          ) : (
            <div>
              <div style={styles.emptyState}>
                <div style={styles.emptyIcon}>🏦</div>
                <h2 style={styles.emptyTitle}>No Bank Account Connected</h2>
                <p style={styles.emptyDescription}>
                  Connect a bank account to enable direct deposits and payouts
                  through Stripe. Your account information is securely stored
                  and encrypted.
                </p>
              </div>

              <div style={styles.buttonContainer}>
                <Button
                  onClick={handleConnectBank}
                  disabled={connecting}
                  style={styles.primaryButton}
                >
                  {connecting ? "Connecting..." : "Connect Bank Account"}
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Information Section */}
        <div style={styles.infoCard}>
          <h3 style={styles.infoCardTitle}>About Bank Connections</h3>
          <ul style={styles.infoList}>
            <li>Bank connections are powered by Stripe for secure processing</li>
            <li>Your bank credentials are never stored on our servers</li>
            <li>You can disconnect your bank account at any time</li>
            <li>All transactions are encrypted and comply with banking regulations</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

const styles = {
  pageContainer: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    padding: "2rem",
  },
  contentWrapper: {
    maxWidth: "900px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: "2rem",
  },
  title: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#1a1a1a",
    marginBottom: "0.5rem",
  },
  subtitle: {
    fontSize: "1rem",
    color: "#666",
  },
  backButton: {
    backgroundColor: "#6c757d",
    color: "white",
    padding: "0.5rem 1rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "500",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "2rem",
    boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
    marginBottom: "1.5rem",
  },
  statusHeader: {
    marginBottom: "1.5rem",
  },
  connectedBadge: {
    display: "inline-block",
    backgroundColor: "#d4edda",
    color: "#155724",
    padding: "0.5rem 1rem",
    borderRadius: "20px",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  accountInfo: {
    marginBottom: "2rem",
  },
  infoRow: {
    display: "flex",
    justifyContent: "space-between",
    padding: "1rem 0",
    borderBottom: "1px solid #e9ecef",
  },
  infoLabel: {
    fontWeight: "600",
    color: "#495057",
  },
  infoValue: {
    color: "#212529",
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "2rem 0",
  },
  emptyIcon: {
    fontSize: "4rem",
    marginBottom: "1rem",
  },
  emptyTitle: {
    fontSize: "1.5rem",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "0.5rem",
  },
  emptyDescription: {
    fontSize: "1rem",
    color: "#6c757d",
    maxWidth: "500px",
    margin: "0 auto 2rem",
    lineHeight: "1.6",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    gap: "1rem",
    marginTop: "2rem",
  },
  primaryButton: {
    backgroundColor: "#007bff",
    color: "white",
    padding: "0.75rem 2rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
    fontSize: "1rem",
  },
  dangerButton: {
    backgroundColor: "#dc3545",
    color: "white",
    padding: "0.75rem 2rem",
    borderRadius: "6px",
    border: "none",
    cursor: "pointer",
    fontWeight: "600",
  },
  infoCard: {
    backgroundColor: "#e7f3ff",
    borderRadius: "12px",
    padding: "1.5rem",
    border: "1px solid #b3d9ff",
  },
  infoCardTitle: {
    fontSize: "1.25rem",
    fontWeight: "600",
    color: "#004085",
    marginBottom: "1rem",
  },
  infoList: {
    listStyle: "none",
    padding: 0,
    margin: 0,
    color: "#004085",
  },
};