export interface Student {
  id: string;
  name: string;
  photo: string;
  course: string;
}

export interface Company {
  id: string;
  name: string;
  address: string;
  sector: string;
  phone: string;
  students: Student[];
  hasMOA: boolean;
}

export const MOCK_COMPANIES: Company[] = [
  { id: "comp-001", name: "AA2000 Security and Technology Solutions Inc.", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-002", name: "Amsteel Structures INC.", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-003", name: "Barangay Hall Concepcion Uno", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-004", name: "Comfac IT", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-005", name: "Denso Ten Solutions Philippines Corporation", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-006", name: "ESCO Pte. Ltd.", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-007", name: "Espiritu Santo Parochial School, Inc.", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-008", name: "F.F. International Manufacturing Corporation", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-009", name: "Filinvest Business Services Corporation", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-010", name: "LBC Express, Inc.", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-011", name: "Marvill Web Development", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-012", name: "NASERIA Construction, OPC", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-013", name: "NDAS PHILS INC.", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-014", name: "One Point Contact Inc.", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-015", name: "People's Television Network Inc.", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-016", name: "Philippine Fiber Industry Development Authority (PHILFIDA)", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-017", name: "Seda Vertis North", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-018", name: "Tão Corporate Center", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-019", name: "Tão Foods Company Inc.", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-020", name: "Technavy Philippines", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-021", name: "Ten X Development", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-022", name: "Transnational E-Business Solutions, Inc. (TESI)", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-023", name: "World Citi Colleges Antipolo Inc.", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-024", name: "Yek Yeu Merchandising, Inc.", address: "", sector: "", phone: "", hasMOA: false, students: [] },
  { id: "comp-025", name: "BSCpE 2-1", address: "Test Address - Development Only", sector: "Education / Testing", phone: "", hasMOA: false, students: [] },
];
