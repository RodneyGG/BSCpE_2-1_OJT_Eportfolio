import ClientPage from "./ClientPage";
import { MOCK_COMPANIES } from "../../data/companies";

// This is required for Next.js static export (output: 'export') with dynamic routes.
export function generateStaticParams() {
  return MOCK_COMPANIES.flatMap((c) => c.students).map((s) => ({
    id: s.id,
  }));
}

export default function Page({ params }: { params: { id: string } }) {
  return <ClientPage id={params.id} />;
}
