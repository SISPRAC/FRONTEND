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
  // 1. Gestión académica
  {
    label: "Dashboard",
    icon: <ChartNoAxesCombined />,
    href: "/dashboard",
  },
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
    label: "Documentos Practicantes",
    icon: <FileStack />,
    href: "/tipoDocumentos",
  },
  {
    label: "Grupos",
    icon: <Users />,
    href: "/grupos",
  },
  {
    label: "Tutores Docentes",
    icon: <Users />,
    href: "/tutorDocente",
  },

  // 2. Gestión empresarial
  {
    label: "Convenios",
    icon: <Handshake />,
    href: "/convenios",
  },
  {
    label: "Requisitos Convenio",
    icon: <FileStack />,
    href: "/requisitos-convenio",
  },
  {
    label: "Vacantes",
    icon: <Briefcase />,
    href: "/vacantes",
  },
  {
    label: "Candidatos",
    icon: <UserRound />,
    href: "/candidatosAPracticas",
  },

  // 3. Seguimiento y evaluación
  {
    label: "Practicantes para la ARL",
    icon: <FileText />,
    href: "/arl",
  },
  {
    label: "Retroalimentación",
    icon: <FileUser />,
    href: "/encuestas",
  },

  // 4. Información y resultados
  {
    label: "Reportes",
    icon: <BookCheck />,
    href: "/reportes",
  },

  // 5. Comunicación
  {
    label: "Notificaciones",
    icon: <Bell />,
    href: "/notificaciones",
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
    label: "Vacantes",
    icon: <FileUser />,
    href: "/vacantesEmpresa",
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
    label: "Documentos a Subir",
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
    label: "Protocolos",
    icon: <ClipboardPlus />,
    href: "/protocolos",
  },

  {
    label: "Gestión de entregas",
    icon: <FileStack />,
    href: "/documentos",
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
    label: "Mis Asignaciones",
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
    label: "Gestion de Usuarios",
    icon: <Users />,
    href: "/usuarios",
  },
  {
    label: "Notificaciones",
    icon: <Bell />,
    href: "/notificaciones",
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
  "Administrador": "/usuarios",
  "Director de programa": "/dashboard",
  "Empresa": "/subirConvenio",
  "Practicante": "/homePracticante",
  "Candidato": "/perfil",
  "Tutor Docente": "/misGrupos",
  "Tutor Empresarial": "/mis-aperturas",
};