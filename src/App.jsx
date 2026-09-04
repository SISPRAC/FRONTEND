import { Routes, Route, Router } from "react-router-dom";
import LoginPage from "../src/presentacion/pages/LoginPage";

import RegisterCandidatePage from "../src/presentacion/pages/RegisterCandidatoPage";
import RegisterEmpresaPage from "../src/presentacion/pages/RegisterEmpresaPage";
import RegisterStaffPage from "../src/presentacion/pages/RegisterStaffPage";

import PeriodosAcademicos from "../src/presentacion/pages/Director/PeriodosAcademicos";
import GruposDirector from "../src/presentacion/pages/Director/Grupos";
import GrupoVistaGrupo from "../src/presentacion/pages/Director/VistaGrupo";
import VacantesDirector from "../src/presentacion/pages/Director/Vacantes";
import PostularCandidatoModal from "./presentacion/pages/Director/PostularCandidatoModal";
import VistaConvenio from "./presentacion/pages/Director/VistaConvenio";
import Convenio from "./presentacion/pages/Director/Convenio";
import AgregarEncuestaPage from "./presentacion/pages/Director/AgregarEncuestas";
import Encuestas from "./presentacion/pages/Director/Encuestas";
import ProtectedRoute from "./presentacion/components/ProtectedRoute";
import ARL from "./presentacion/pages/Director/ARL";
import ReportesPage from "./presentacion/pages/Director/ReportesPage";
import VistaVisita from "./presentacion/pages/Director/VistaVisita";
import Documentos from "./presentacion/pages/Director/Documentos";
import DashboardDirector from "./presentacion/pages/Director/DashboardDirector";
import TutoresDocentes from "./presentacion/pages/Director/GestionTutorDocente";

// tutor Docente
import HomeTutorDocente from "./presentacion/pages/TutorDocente/HomeTutorDocente"

// tutor Empresarial
import HomeTutorEmpresarial from "./presentacion/pages/TutorEmpresarial/HomeTutorEmpresarial"

// candidato
import HomeCandidato from "./presentacion/pages/Candidato/HomeCandidato"


// Candidato / Practicante
import ActualizarPerfil from "./presentacion/pages/ActualizarPerfil";

// practicante
import HomePracticante from "./presentacion/pages/Practicante/HomePracticante"

// Empresa
import HomeEmpresa from "./presentacion/pages/Empresa/HomeEmpresa"
import SubirConvenio from "./presentacion/pages/Empresa/SubirConvenio"
import CandidatosEmpresa from "./presentacion/pages/Empresa/CandidatosEmpresa"
import CandidatoDetalleEmpresa from "./presentacion/pages/Empresa/CandidatoDetalleEmpresa"
import GruposPractica from "./presentacion/pages/Empresa/GruposPractica"
import GrupoPracticaDetalle from "./presentacion/pages/Empresa/GrupoPracticaDetalle"
import VacantesEmpresa from "./presentacion/pages/Empresa/VacantesEmpresa"
import ActualizarEmpresa from "./presentacion/pages/Empresa/ActualizarDatosEmpresa";
import TutoresEmpresariales from "./presentacion/pages/Empresa/GestionTutorEmpresa";

// Admin
import HomeAdmin from "./presentacion/pages/Admin/HomeAdmin"
import Practicas from "./presentacion/pages/Admin/PracticaAdmin"
import UsersPage from "./presentacion/pages/Admin/GestionarUsuarios"
import PracticaRequisitoDocumentoPage from "./presentacion/pages/Admin/GestionDocumentos"

import "./index.css";
import { Toaster } from "react-hot-toast";


export default function App() {
  return (
    <>
      <Toaster position="top-center" />

      <Routes>
        {/* Públicas */}
        <Route path="/" element={<LoginPage />} />

        <Route
          path="/registrarCandidato"
          element={<RegisterCandidatePage />}
        />
        <Route
          path="/registrarEmpresa"
          element={<RegisterEmpresaPage />}
        />
        <Route
          path="/registrarStaff"
          element={<RegisterStaffPage />}
        />

        {/* =========================
              ADMINISTRADOR
          ========================== */}
        <Route
          element={
            <ProtectedRoute
              roles={["Administrador"]}
            />
          }
        >
          <Route path="/homeAdmin" element={<HomeAdmin />} />
          <Route path="/periodos" element={<PeriodosAcademicos />} />
          <Route path="/practicas" element={<Practicas />} />
          <Route path="/usuarios" element={<UsersPage />} />
          <Route path="/documentos" element={< PracticaRequisitoDocumentoPage />} />


        </Route>

        {/* =========================
              DIRECTOR DE PROGRAMA
          ========================== */}
        <Route
          element={
            <ProtectedRoute
              roles={[
                "Director de programa",
              ]}
            />
          }
        >
          <Route path="/dashboard" element={<DashboardDirector />} />
          <Route path="/homeDirector" element={<DashboardDirector />} />

          <Route path="/grupos" element={<GruposDirector />} />
          <Route path="/grupos/:id/candidatos" element={<GrupoVistaGrupo />} />

          <Route path="/vacantes" element={<VacantesDirector />} />

          <Route path="/convenios" element={<Convenio />} />
          <Route path="/convenio" element={<VistaConvenio />} />

          <Route path="/encuestas" element={<Encuestas />} />
          <Route path="/agregarEncuesta" element={<AgregarEncuestaPage />} />
          <Route
            path="/editarEncuesta/:id"
            element={<AgregarEncuestaPage />}
          />

          <Route path="/arl" element={<ARL />} />

          <Route path="/reportes" element={<ReportesPage />} />

          <Route path="/visitas" element={<VistaVisita />} />

          <Route path="/protocolos" element={<Documentos />} />

          <Route path="/tutorDocente" element={<TutoresDocentes />} />


        </Route>

        {/* =========================
              EMPRESA
          ========================== */}
        <Route
          element={
            <ProtectedRoute
              roles={["Empresa"]}
            />
          }
        >
          <Route path="/homeEmpresa" element={<HomeEmpresa />} />
          <Route path="/subirConvenio" element={<SubirConvenio />} />
          <Route path="/candidatos" element={<CandidatosEmpresa />} />
          <Route path="/empresa/candidatos/:id" element={<CandidatoDetalleEmpresa />} />
          <Route path="/gruposPractica" element={<GruposPractica />} />
          <Route path="/empresa/grupos/:id" element={<GrupoPracticaDetalle />} />
          <Route path="/vacantesEmpresa" element={<VacantesEmpresa />} />
          <Route path="/tutorEmpresarial" element={<TutoresEmpresariales />} />
          <Route path="/miPerfil" element={<ActualizarEmpresa />} />

        </Route>

        {/* =========================
                PRACTICANTE
            ========================== */}
        <Route
          element={
            <ProtectedRoute
              roles={["Practicante"]}
            />
          }
        >
          <Route path="/homePracticante" element={<HomePracticante />} />

        </Route>


        {/* =========================
        PERFIL CANDIDATO / PRACTICANTE
    ========================== */}
        <Route
          element={
            <ProtectedRoute
              roles={["Candidato", "Practicante"]}
            />
          }
        >
          <Route
            path="/perfil"
            element={<ActualizarPerfil />}
          />
        </Route>


        {/* =========================
                CANDIDATO
            ========================== */}
        <Route
          element={
            <ProtectedRoute
              roles={["Candidato"]}
            />
          }
        >
          <Route path="/homeCandidato" element={<HomeCandidato />} />

        </Route>

        {/* =========================
                TUTOR DOCENTE
            ========================== */}
        <Route
          element={
            <ProtectedRoute
              roles={["Tutor Docente"]}
            />
          }
        >
          <Route path="/homeTutorDocente" element={<HomeTutorDocente />} />
        </Route>

        {/* =========================
                TUTOR EMPRESARIAL
            ========================== */}
        <Route
          element={
            <ProtectedRoute
              roles={["Tutor Empresarial"]}
            />
          }
        >
          <Route
            path="/homeTutorEmpresarial"
            element={<HomeTutorEmpresarial />}
          />
        </Route>
      </Routes>
    </>
  );
}

