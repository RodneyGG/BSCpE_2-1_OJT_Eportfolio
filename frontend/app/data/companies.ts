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
  {
    id: "comp-001",
    name: "TechCore Solutions Inc.",
    address: "3F Cyberzone Building, IT Park, Cebu City, Cebu",
    sector: "Information Technology",
    phone: "+63 32 123 4567",
    hasMOA: true,
    students: [
      { id: "stu-001", name: "Juan Dela Cruz",    photo: "/profile-placeholder.jpg", course: "BSCpE 2-1" },
      { id: "stu-002", name: "Maria Santos",      photo: "/profile-placeholder.jpg", course: "BSCpE 2-1" },
      { id: "stu-003", name: "Carlos Reyes",      photo: "/profile-placeholder.jpg", course: "BSCpE 2-1" },
    ],
  },
  {
    id: "comp-002",
    name: "InnovatePH Engineering",
    address: "2F Torre de Manila, Taft Ave., Manila, Metro Manila",
    sector: "Engineering Services",
    phone: "+63 2 987 6543",
    hasMOA: true,
    students: [
      { id: "stu-004", name: "Ana Lim",           photo: "/profile-placeholder.jpg", course: "BSCpE 2-1" },
      { id: "stu-005", name: "Rodel Gutierrez",   photo: "/profile-placeholder.jpg", course: "BSCpE 2-1" },
    ],
  },
  {
    id: "comp-003",
    name: "NexGen Electronics Corp.",
    address: "Lot 7, PEZA Zone, Mactan, Lapu-Lapu City, Cebu",
    sector: "Electronics Manufacturing",
    phone: "+63 32 456 7890",
    hasMOA: false,
    students: [
      { id: "stu-006", name: "Jessa Fernandez",   photo: "/profile-placeholder.jpg", course: "BSCpE 2-1" },
      { id: "stu-007", name: "Miguel Torres",     photo: "/profile-placeholder.jpg", course: "BSCpE 2-1" },
      { id: "stu-008", name: "Lovely Pascual",    photo: "/profile-placeholder.jpg", course: "BSCpE 2-1" },
      { id: "stu-009", name: "Dante Villanueva",  photo: "/profile-placeholder.jpg", course: "BSCpE 2-1" },
    ],
  },
  {
    id: "comp-004",
    name: "CloudBridge Systems",
    address: "Unit 5B, Araneta Center, Cubao, Quezon City",
    sector: "Cloud & Network Infrastructure",
    phone: "+63 2 345 6789",
    hasMOA: true,
    students: [
      { id: "stu-010", name: "Patricia Cruz",     photo: "/profile-placeholder.jpg", course: "BSCpE 2-1" },
    ],
  },
];
