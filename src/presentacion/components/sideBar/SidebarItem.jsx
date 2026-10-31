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
  FileStack,
  User,
  Bell
} from "lucide-react";



// ==========================
// DIRECTOR
// ==========================
export const Director_NAV = [
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
    label: "Tutores Docentes",
    icon: <Users />,
    href: "/tutorDocente",
  },
  {
    label: "ARL",
    icon: <FileText />,
    href: "/arl",
  },
  {
    label: "Notificaciones",
    icon: <Bell />,
    href: "/notificaciones",
  },
  {
    label: "Perfil",
    icon: <UserCog />,
    href: "/perfil",
  },
];


// ==========================
// EMPRESA
// ==========================
export const Empresa_NAV = [
  {
    label: "Convenios",
    icon: <Handshake />,
    href: "/subirConvenio",
  },
  {
    label: "Prácticas",
    icon: <Briefcase />,
    href: "/gruposPractica",
  },
  {
    label: "Candidatos",
    icon: <UserRound />,
    href: "/candidatos",
  },
  {
    label: "Protocolos",
    icon: <ClipboardPlus />,
    href: "/protocolosEmpresa",
  },

  {
    label: "Vacantes",
    icon: <FileUser />,
    href: " /vacantesEmpresa",
  },
  {
    label: "Tutores Empresariales",
    icon: <Users />,
    href: "/tutorEmpresarial",
  },
  {
    label: "Notificaciones",
    icon: <Bell />,
    href: "/notificaciones",
  },
  {
    label: "Perfil",
    icon: <UserCog />,
    href: "/miPerfil",
  },
];


// ==========================
// PRACTICANTE
// ==========================
export const Practicante_NAV = [

  {
    label: "Practica",
    icon: <BadgeInfo />,
    href: "/homePracticante",
  },
  {
    label: "Informes",
    icon: <FileText />,
    href: "/informes",
  },
  {
    label: "Documentos Iniciales",
    icon: <ClipboardPlus />,
    href: "/documentosIniciales",
  },
  {
    label: "Encuesta",
    icon: <FileUser />,
    href: "/EncuestaPracticante",
  },
  {
    label: "Notificaciones",
    icon: <Bell />,
    href: "/notificaciones",
  },
  {
    label: "Perfil",
    icon: <UserCog />,
    href: "/perfil",
  },
];


// ==========================
// PRACTICANTE - PERFIL INCOMPLETO
// ==========================
export const PracticantePerfil_NAV = [
  {
    label: "Completar perfil",
    icon: <UserCog />,
    href: "/perfil",
  },
];


// ==========================
// CANDIDATO
// ==========================
export const Candidato_NAV = [
  {
    label: "Situación",
    icon: <BadgeInfo />,
    href: "/situacion",
  },
  {
    label: "Notificaciones",
    icon: <Bell />,
    href: "/notificaciones",
  },
  {
    label: "Perfil",
    icon: <UserCog />,
    href: "/perfil",
  },
];


// ==========================
// TUTOR DOCENTE
// ==========================
export const TutorDocente_NAV = [
  {
    label: "Mis Grupos",
    icon: <GraduationCap />,
    href: "/misGrupos",
  },
  {
    label: "Notificaciones",
    icon: <Bell />,
    href: "/notificaciones",
  },
  {
    label: "Perfil",
    icon: <UserCog />,
    href: "/perfil",
  },
];


// ==========================
// TUTOR EMPRESARIAL
// ==========================
export const TutorEmpresarial_NAV = [
  {
    label: "Mis Aperturas",
    icon: <Briefcase />,
    href: "/mis-aperturas",
  },
  {
    label: "Notificaciones",
    icon: <Bell />,
    href: "/notificaciones",
  },
  {
    label: "Perfil",
    icon: <UserCog />,
    href: "/perfil",
  },
];


// ==========================
// ADMINISTRADOR
// ==========================
export const Admin_NAV = [
  {
    label: "Periodos",
    icon: <SquareChartGantt />,
    href: "/periodos",
  },
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
  {
    label: "Gestion de Tipos de Documentos",
    icon: <FileStack />,
    href: "/tipoDocumentos",
  },
  {
    label: "Notificaciones",
    icon: <Bell />,
    href: "/notificaciones",
  },
  {
    label: "Perfil",
    icon: <UserCog />,
    href: "/perfil",
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