interface Document {
  id: string;
  title: string;
  type: string;
  icon: string;
  color: string;
  bgColor: string;
  description: string;
  status: "Available" | "Pending" | "Uploaded";
}

const DOCUMENTS: Document[] = [
  {
    id: "endorsement-letter",
    title: "Endorsement Letter",
    type: "PDF",
    icon: "📄",
    color: "#0284c7",
    bgColor: "#e0f2fe",
    description: "Official endorsement letter from the school registrar",
    status: "Available",
  },
  {
    id: "moa",
    title: "Memorandum of Agreement",
    type: "PDF",
    icon: "📋",
    color: "#0f766e",
    bgColor: "#ccfbf1",
    description: "Signed MOA between school and OJT company",
    status: "Available",
  },
  {
    id: "waiver",
    title: "Parental Consent / Waiver",
    type: "PDF",
    icon: "✍️",
    color: "#0284c7",
    bgColor: "#e0f2fe",
    description: "Signed parental consent and liability waiver form",
    status: "Available",
  },
  {
    id: "daily-time-record",
    title: "Daily Time Record",
    type: "PDF",
    icon: "📅",
    color: "#0f766e",
    bgColor: "#ccfbf1",
    description: "Compiled daily time records for all OJT hours",
    status: "Available",
  },
  {
    id: "completion-cert",
    title: "Certificate of Completion",
    type: "PDF",
    icon: "🏆",
    color: "#b45309",
    bgColor: "#fef3c7",
    description: "Certificate issued by the company upon OJT completion",
    status: "Available",
  },
  {
    id: "evaluation-form",
    title: "Performance Evaluation",
    type: "PDF",
    icon: "⭐",
    color: "#0284c7",
    bgColor: "#e0f2fe",
    description: "Final performance evaluation form from supervisor",
    status: "Available",
  },
  {
    id: "narrative-report",
    title: "Narrative Report",
    type: "DOCX",
    icon: "📝",
    color: "#0f766e",
    bgColor: "#ccfbf1",
    description: "Comprehensive narrative report of OJT experience",
    status: "Available",
  },
  {
    id: "photo-documentation",
    title: "Photo Documentation",
    type: "ZIP",
    icon: "📸",
    color: "#7c3aed",
    bgColor: "#ede9fe",
    description: "Photo documentation of tasks and activities",
    status: "Pending",
  },
];

const STATUS_STYLES: Record<Document["status"], { bg: string; color: string }> = {
  Available: { bg: "#dcfce7", color: "#15803d" },
  Pending:   { bg: "#fef9c3", color: "#a16207" },
  Uploaded:  { bg: "#e0f2fe", color: "#0284c7" },
};

export default function DocumentsSection() {
  return (
    <section
      id="documents"
      className="section"
      style={{ backgroundColor: "var(--color-surface)" }}
    >
      <div className="section-inner">
        {/* Header */}
        <div style={{ marginBottom: "3rem" }}>
          <span className="section-label">Documents</span>
          <h2 className="section-title">OJT Requirements & Files</h2>
          <div className="divider" />
          <p className="section-subtitle">
            All official OJT documents, certificates, and records compiled and
            organized for easy reference and submission.
          </p>
        </div>

        {/* Documents Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
            gap: "1.25rem",
          }}
        >
          {DOCUMENTS.map((doc) => {
            const statusStyle = STATUS_STYLES[doc.status];
            return (
              <div
                key={doc.id}
                id={`doc-${doc.id}`}
                className="card"
                style={{
                  padding: "1.5rem",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.75rem",
                }}
              >
                {/* Icon */}
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "var(--radius-lg)",
                    background: doc.bgColor,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: "1.4rem",
                  }}
                >
                  {doc.icon}
                </div>

                {/* Info */}
                <div style={{ flex: 1 }}>
                  <h3
                    style={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: "var(--color-text-primary)",
                      marginBottom: "0.25rem",
                      lineHeight: 1.3,
                    }}
                  >
                    {doc.title}
                  </h3>
                  <p
                    style={{
                      fontSize: "0.78rem",
                      color: "var(--color-text-muted)",
                      lineHeight: 1.5,
                    }}
                  >
                    {doc.description}
                  </p>
                </div>

                {/* Footer */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    paddingTop: "0.5rem",
                    borderTop: "1px solid var(--color-border)",
                  }}
                >
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.55rem",
                      borderRadius: "var(--radius-full)",
                      background: statusStyle.bg,
                      color: statusStyle.color,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {doc.status}
                  </span>
                  <span
                    style={{
                      fontSize: "0.7rem",
                      fontWeight: 700,
                      padding: "0.2rem 0.55rem",
                      borderRadius: "var(--radius-full)",
                      background: "#f1f5f9",
                      color: "var(--color-text-muted)",
                      letterSpacing: "0.04em",
                    }}
                  >
                    {doc.type}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Note */}
        <div
          style={{
            marginTop: "2.5rem",
            padding: "1.25rem 1.5rem",
            background: "#f0f9ff",
            border: "1px solid #bae6fd",
            borderRadius: "var(--radius-xl)",
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
          }}
        >
          <span style={{ fontSize: "1.1rem", flexShrink: 0 }}>ℹ️</span>
          <p
            style={{
              fontSize: "0.85rem",
              color: "var(--color-text-secondary)",
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Documents are available for viewing and download. Please contact me
            directly if you need access to physical copies or originals.
          </p>
        </div>
      </div>
    </section>
  );
}
