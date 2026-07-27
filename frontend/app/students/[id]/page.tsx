import ClientPage from "./ClientPage";
import { MOCK_COMPANIES } from "../../data/companies";

// This is required for Next.js static export (output: 'export') with dynamic routes.
export function generateStaticParams() {
  const students = MOCK_COMPANIES.flatMap((c) => c.students).map((s) => ({
    id: s.id,
  }));
  
  if (students.length === 0) {
    return [{ id: 'dummy' }];
  }
  
  return students;
}

export default function Page({ params }: { params: { id: string } }) {
  return <ClientPage id={params.id} />;
}
