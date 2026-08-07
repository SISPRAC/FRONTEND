import {
  SquareChartGantt,
  Users,
  UserRound,
  UserCog,
  Handshake,
  FileUser,
  ClipboardPlus,
  BookCheck,
  ChartNoAxesCombined,
  Briefcase,
  FileText,
  GraduationCap,
  MapPinned,
  BadgeInfo,
  FileStack
} from "lucide-react";

// ==========================
// DIRECTOR
// ==========================
export const Director_NAV = [
  {
    label: "Periodos",
    icon: <SquareChartGantt />,
    href: "/periodos",
  },
  {
    label: "Grupos",
    icon: <Users />,
    href: "/grupos",
  },
  {
    label: "Vacantes",
    icon: <Briefcase />,
    href: "/vacantes",
  },
  {
    label: "Convenios",
    icon: <Handshake />,
    href: "/convenios",
  },
  {
    label: "Encuestas",
    icon: <FileUser />,
    href: "/encuestas",
  },
  {
    label: "Protocolos",
    icon: <ClipboardPlus />,
    href: "/protocolos",
  },
  {
    label: "Reportes",
    icon: <BookCheck />,
    href: "/reportes",
  },
  {
    label: "Dashboard",
    icon: <ChartNoAxesCombined />,
    href: "/dashboard",
  },
  {
    label: "ARL",
    icon: <FileText />,
    href: "/arl",
  },
];

// ==========================
// EMPRESA
// ==========================
export const Empresa_NAV = [
  {
    label: "Convenios",
    icon: <Handshake />,
    href: "/convenios",
  },
  {
    label: "Prácticas",
    icon: <Briefcase />,
    href: "/practicas",
  },
  {
    label: "Candidatos",
    icon: <UserRound />,
    href: "/candidatos",
  },
  {
    label: "Protocolos",
    icon: <ClipboardPlus />,
    href: "/protocolos",
  },
  {
    label: "Encuestas",
    icon: <FileUser />,
    href: "/encuestas",
  },
];

// ==========================
// PRACTICANTE
// ==========================
export const Practicante_NAV = [
  {
    label: "Dashboard",
    icon: <ChartNoAxesCombined />,
    href: "/dashboard",
  },
  {
    label: "Informes",
    icon: <FileText />,
    href: "/informes",
  },
  {
    label: "Protocolos",
    icon: <ClipboardPlus />,
    href: "/protocolos",
  },
  {
    label: "Encuestas",
    icon: <FileUser />,
    href: "/encuestas",
  },
];

// ==========================
// CANDIDATO
// ==========================
export const Candidato_NAV = [
  {
    label: "Protocolos",
    icon: <ClipboardPlus />,
    href: "/protocolos",
  },
  {
    label: "Perfil",
    icon: <UserCog />,
    href: "/perfil",
  },
  {
    label: "Situación",
    icon: <BadgeInfo />,
    href: "/situacion",
  },
];

// ==========================
// TUTOR DOCENTE
// ==========================
export const TutorDocente_NAV = [
  {
    label: "Cursos",
    icon: <GraduationCap />,
    href: "/cursos",
  },
  {
    label: "Visitas",
    icon: <MapPinned />,
    href: "/visitas",
  },
  {
    label: "Encuestas",
    icon: <FileUser />,
    href: "/encuestas",
  },
];

// ==========================
// TUTOR EMPRESARIAL
// ==========================
export const TutorEmpresarial_NAV = [
  {
    label: "Prácticas",
    icon: <Briefcase />,
    href: "/practicas",
  },
  {
    label: "Visitas",
    icon: <MapPinned />,
    href: "/visitas",
  },
];

// ==========================
// ADMINISTRADOR
// ==========================

export const Admin_NAV = [
  {
    label: "Prácticas",
    icon: <Briefcase />,
    href: "/practicas",
  },
  {
    label: "Gestion de Usuarios",
    icon: <Users />,
    href: "/usuarios",
  },
  {
    label: "Gestion de Documentos",
    icon: <FileStack />,
    href: "/documentos",
  },
];

// ==========================
// MULTIROL
// ==========================


export const ROLE_NAV = {
  "Director de programa": Director_NAV,
  "Administrador": Admin_NAV,
  "Empresa": Empresa_NAV,
  "Practicante": Practicante_NAV,
  "Candidato": Candidato_NAV,
  "Tutor Docente": TutorDocente_NAV,
  "Tutor Empresarial": TutorEmpresarial_NAV,
};

export const HOME_ROUTES = {
  "Director de programa": "/dashboard",
  "Administrador": "/homeAdmin",
  "Empresa": "/homeEmpresa",
  "Practicante": "/homePracticante",
  "Candidato": "/homeCandidato",
  "Tutor Docente": "/homeTutorDocente",
  "Tutor Empresarial": "/homeTutorEmpresarial",
};