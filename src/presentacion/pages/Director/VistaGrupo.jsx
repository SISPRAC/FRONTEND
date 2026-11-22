
import {
  ArrowLeft,
  UserX,
  Building2,
  LoaderCircle,
  Eye,
  ClipboardList,
  FileText,
  Award,
} from "lucide-react";

import { obtenerRespuestasEncuestasPracticante } from "../../../aplicacion/encuesta/obtenerRespuestasEncuestasPracticante";
import { encuestaRepository } from "../../../infraestructura/repository/encuestaRepository";

import EncuestasPracticanteDirectorModal from "../../components/modals/EncuestasPracticanteDirectorModal";
import EncuestaTutorEmpresarialModal from "../../components/modals/EncuestaTutorEmpresarialModal";
import VerRetiroModal from "../../components/modals/VerRetiroModal.jsx";
import CertificadoPracticanteModal from "../../components/modals/CertificadoPracticanteModal.jsx";

import { getCandidatosGrupo } from "../../../aplicacion/grupos/getCandidatosGrupo";
import { grupoRepository } from "../../../infraestructura/repository/grupoRepository";
import GenericTable from "../../components/Table/GenericTable";

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

import EstadoBadge from "../../components/estadoBadge/EstadoBadge";
import RetirarPracticanteModal from "../../components/modals/RetirarPracticanteModal";

import toast from "react-hot-toast";

import { crearRetiroPracticante } from "../../../aplicacion/retirarPracticante/crearRetiro";
import { retiroPracticanteRepository } from "../../../infraestructura/repository/retirarPracticanteRepository";

import { obtenerVisitasPorPracticante } from "../../../aplicacion/visita/obtenerVisitasPorPracticante";
import { visitaRepository } from "../../../infraestructura/repository/visitaRepository";

// ─── Skeleton de carga ──────────────────────────────────────────────────────
const GrupoVistaSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Botón volver */}
      <div className="flex items-center mb-8">
        <div className="h-10 w-24 rounded-md bg-slate-200" />
      </div>

      {/* Encabezado */}
      <div className="flex justify-between items-start mb-6 px-1 gap-6">
        <div className="w-1/2 space-y-3">
          <div className="h-3 w-28 rounded bg-slate-200" />
          <div className="h-8 w-48 rounded-lg bg-slate-200" />
        </div>

        <div className="w-1/2 flex flex-col items-end space-y-3">
          <div className="h-3 w-28 rounded bg-slate-200" />
          <div className="h-8 w-44 rounded-lg bg-slate-200" />
        </div>
      </div>

      {/* Nombre del grupo */}
      <div className="flex justify-center mb-7">
        <div className="h-9 w-64 max-w-full rounded-lg bg-slate-200" />
      </div>

      {/* Tabla */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-4 gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4">
          {["w-16", "w-28", "w-24", "w-20"].map((width, index) => (
            <div
              key={index}
              className={`h-4 ${width} rounded bg-slate-200`}
            />
          ))}
        </div>

        {[1, 2, 3, 4].map((fila) => (
          <div
            key={fila}
            className="grid grid-cols-4 items-center gap-4 border-b border-slate-100 px-6 py-5 last:border-b-0"
          >
            <div className="h-4 w-20 rounded bg-slate-200" />
            <div className="h-4 w-32 max-w-full rounded bg-slate-200" />
            <div className="h-4 w-28 max-w-full rounded bg-slate-200" />
            <div className="h-6 w-20 rounded-full bg-slate-200" />
          </div>
        ))}
      </div>

      {/* Indicador de carga */}
      <div className="mt-6 flex items-center justify-center gap-3">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
        <p className="text-sm font-medium text-slate-500">
          Cargando información del grupo...
        </p>
      </div>
    </div>
  );
};

const certificadoVacio = {
  open: false,
  practicante: null,
  certificado: null,
  loading: false,
};

// ─── Vista principal ────────────────────────────────────────────────────────
const GrupoVistaDirector = () => {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const navigate = useNavigate();
  const { id } = useParams();

  const [grupo, setGrupo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);

  const [openRetiroModal, setOpenRetiroModal] = useState(false);
  const [practicanteSeleccionado, setPracticanteSeleccionado] = useState(null);

  const [loadingVisitasId, setLoadingVisitasId] = useState(null);

  const [mostrarEncuestas, setMostrarEncuestas] = useState(false);
  const [mostrarDetalleEncuesta, setMostrarDetalleEncuesta] = useState(false);
  const [encuestasPracticante, setEncuestasPracticante] = useState([]);
  const [practicanteEncuestasSeleccionado, setPracticanteEncuestasSeleccionado] = useState(null);
  const [encuestaSeleccionada, setEncuestaSeleccionada] = useState(null);
  const [loadingEncuestasId, setLoadingEncuestasId] = useState(null);

  // Ver retiro / ver certificado
  const [verRetiroPracticante, setVerRetiroPracticante] = useState(null);
  const [certificadoModal, setCertificadoModal] = useState(certificadoVacio);

  useEffect(() => {
    loadCandidatosGrupos();
  }, [id]);

  // ─── Cargar candidatos del grupo ──────────────────────────────────────────
  const loadCandidatosGrupos = async () => {
    setLoading(true);
    setErrorCarga(false);

    try {
      const data = await getCandidatosGrupo(
        { grupoRepository },
        id
      );

      console.log("Candidatos del grupo obtenidos:", data);

      const formattedData = (data?.candidatos || []).map((candidato) => ({
        // ID único para identificar la fila en GenericTable.
        // Si no existe practicante, se utiliza un identificador temporal.
        id: candidato.practicante_id ?? `candidato-${candidato.id}`,

        // Se conservan separados los identificadores reales.
        candidato_id: candidato.id,
        practicante_id: candidato.practicante_id ?? null,

        codigo: candidato.codigo || "Sin código",
        candidatos: candidato.nombre || "Sin nombre",
        empresa: candidato.empresa || "Sin empresa",
        correo: candidato.correo || "Sin correo",
        estado: candidato.estado || "Disponible",

        retiro: candidato.retiro ?? null,
        certificado: candidato.certificado ?? null,
      }));

      setGrupo(data);
      setRows(formattedData);
      setCurrentPage(1);
    } catch (error) {
      console.error("Error al cargar los candidatos del grupo:", error);

      setErrorCarga(true);

      toast.error(
        error.response?.data?.message ||
        "No se pudo cargar la información del grupo."
      );
    } finally {
      setLoading(false);
    }
  };

  // ─── Ver visitas del practicante ──────────────────────────────────────────
  const verVisitasPracticante = async (id) => {
    const practicante = rows.find((p) => p.id === id);

    if (!practicante) {
      toast.error("No se encontró el practicante.");
      return;
    }

    if (!practicante.practicante_id) {
      toast.error("Este candidato todavía no tiene un registro de practicante.");
      return;
    }

    setLoadingVisitasId(id);

    const toastId = toast.loading(
      "Cargando visitas del practicante..."
    );

    try {
      const respuesta = await obtenerVisitasPorPracticante(
        { visitaRepository },
        practicante.practicante_id
      );

      const visitas = respuesta?.data ?? respuesta;

      console.log("Visitas del practicante:", visitas);

      if (!Array.isArray(visitas) || visitas.length === 0) {
        toast.dismiss(toastId);
        toast.error("Este practicante no tiene visitas registradas.");
        return;
      }

      const visita = visitas[0];

      if (!visita.solicitud_visita_id || !visita.solicitud) {
        toast.dismiss(toastId);
        toast.error("La visita no contiene la información de su solicitud.");
        return;
      }

      toast.dismiss(toastId);

      navigate(
        `/visita-empresarial/${visita.solicitud_visita_id}`,
        {
          state: {
            solicitud: visita.solicitud,
            visita: visita,
          },
        }
      );
    } catch (error) {
      console.error("Error al consultar las visitas:", error);

      toast.dismiss(toastId);

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "No se pudieron consultar las visitas del practicante."
      );
    } finally {
      setLoadingVisitasId(null);
    }
  };

  // ─── Ver encuestas del practicante ────────────────────────────────────────
  const verEncuestasPracticante = async (id) => {
    const practicante = rows.find((p) => p.id === id);

    console.log("Practicante a enviar:", practicante);

    if (!practicante) {
      toast.error("No se encontró el practicante.");
      return;
    }

    if (!practicante.practicante_id) {
      toast.error("Este candidato todavía no tiene un registro de practicante.");
      return;
    }

    setLoadingEncuestasId(id);

    const toastId = toast.loading(
      "Consultando encuestas del practicante..."
    );

    try {
      const respuesta = await obtenerRespuestasEncuestasPracticante(
        { encuestaRepository },
        practicante.practicante_id
      );

      console.log("Respuestas:", respuesta);

      const practicas = respuesta?.data ?? respuesta;

      if (!Array.isArray(practicas) || practicas.length === 0) {
        toast.dismiss(toastId);
        toast.error("No hay encuestas de prácticas en curso o finalizadas.");
        return;
      }

      const tieneEncuestas = practicas.some(
        (practica) =>
          Array.isArray(practica.encuestas) &&
          practica.encuestas.length > 0
      );

      if (!tieneEncuestas) {
        toast.dismiss(toastId);
        toast.error("Este practicante no tiene encuestas asignadas.");
        return;
      }

      setPracticanteEncuestasSeleccionado({
        id_practicante: practicante.practicante_id,
        nombre: practicante.candidatos,
        codigo: practicante.codigo,
        empresa: practicante.empresa,
      });

      setEncuestasPracticante(practicas);
      setMostrarEncuestas(true);

      toast.dismiss(toastId);
    } catch (error) {
      console.error("Error al consultar las encuestas:", error);

      toast.dismiss(toastId);

      toast.error(
        error.response?.data?.message ||
        "No se pudieron consultar las encuestas del practicante."
      );
    } finally {
      setLoadingEncuestasId(null);
    }
  };

  // ─── Abrir modal para retirar practicante ─────────────────────────────────
  const verDetalle = (id) => {
    const practicante = rows.find((p) => p.id === id);

    if (!practicante) {
      toast.error("No se encontró el practicante.");
      return;
    }

    if (!practicante.practicante_id) {
      toast.error("Este candidato todavía no tiene un registro de practicante.");
      return;
    }

    if (!practicante.empresa || practicante.empresa === "Sin empresa") {
      toast.error("No se puede retirar un practicante sin empresa asignada.");
      return;
    }

    if (practicante.estado === "POSTULADO") {
      toast.error("El candidato aún está en proceso de selección.");
      return;
    }

    if (
      ["Retirado", "Cancelado", "Finalizada"].includes(practicante.estado)
    ) {
      toast.error("No se puede retirar un practicante en este estado.");
      return;
    }

    setPracticanteSeleccionado(practicante);
    setOpenRetiroModal(true);
  };

  // ─── Crear retiro ─────────────────────────────────────────────────────────
  const handleRetirar = async ({ motivo, archivo }) => {
    if (
      !practicanteSeleccionado?.practicante_id ||
      !practicanteSeleccionado?.empresa ||
      practicanteSeleccionado.empresa === "Sin empresa"
    ) {
      toast.error(
        "No se puede retirar un candidato sin practicante o empresa asignada."
      );
      return;
    }

    try {
      await crearRetiroPracticante(
        { retiroPracticanteRepository },
        {
          motivo,
          practicante_id: practicanteSeleccionado.practicante_id,
          archivo,
        }
      );

      toast.success("El practicante fue retirado correctamente.");

      setOpenRetiroModal(false);
      setPracticanteSeleccionado(null);

      await loadCandidatosGrupos();
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Error al retirar al practicante."
      );
    }
  };

  // ─── Ver retiro ───────────────────────────────────────────────────────────
  const handleVerRetiro = (id) => {
    const practicante = rows.find((p) => p.id === id);

    if (!practicante) {
      toast.error("No se encontró el practicante.");
      return;
    }

    if (!practicante.practicante_id) {
      toast.error("Este candidato todavía no tiene un registro de practicante.");
      return;
    }

    if (!practicante.retiro) {
      toast.error("No se encontró información del retiro.");
      return;
    }

    setVerRetiroPracticante({
      ...practicante,
      nombres: practicante.candidatos,
      apellidos: "",
    });
  };

  // ─── Ver certificado ──────────────────────────────────────────────────────
  const handleVerCertificado = (id) => {
    const practicante = rows.find((p) => p.id === id);

    if (!practicante) {
      toast.error("No se encontró el practicante.");
      return;
    }

    if (!practicante.practicante_id) {
      toast.error("Este candidato todavía no tiene un registro de practicante.");
      return;
    }

    const cert = practicante.certificado;

    if (!cert?.archivo?.url) {
      toast.error("Aún no se le ha subido el certificado a este practicante.");
      return;
    }

    setCertificadoModal({
      open: true,
      practicante: {
        nombres: practicante.candidatos,
        apellidos: "",
      },
      certificado: {
        id: cert.id,
        nombre: cert.archivo.nombre,
        url: cert.archivo.url,
        fecha_subida: cert.fecha_subida,
      },
      loading: false,
    });
  };

  // ─── Skeleton mientras carga ──────────────────────────────────────────────
  if (loading) {
    return <GrupoVistaSkeleton />;
  }

  // ─── Error de carga ───────────────────────────────────────────────────────
  if (errorCarga) {
    return (
      <div className="flex min-h-[300px] flex-col items-center justify-center px-4 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-50">
          <Building2 size={28} className="text-red-500" />
        </div>

        <h2 className="text-lg font-bold text-slate-800">
          No se pudo cargar el grupo
        </h2>

        <p className="mt-2 max-w-md text-sm text-slate-500">
          Ocurrió un problema al consultar la información. Intenta nuevamente.
        </p>

        <button
          onClick={loadCandidatosGrupos}
          className="mt-5 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-red-700"
        >
          Reintentar
        </button>

        <button
          onClick={() => navigate(-1)}
          className="mt-3 flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100"
        >
          <ArrowLeft size={18} />
          Volver
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* ── Botón volver ── */}
      <div className="relative mb-8 flex items-center justify-center">
        <button
          onClick={() => navigate(-1)}
          className="
            absolute left-0
            flex items-center gap-2
            rounded-md px-3 py-2
            text-sm font-medium text-slate-600
            transition-colors
            hover:bg-slate-100 hover:text-slate-900
          "
        >
          <ArrowLeft size={20} />
          Volver
        </button>
      </div>

      {/* ── Header: Periodo + Tutor ── */}
      <div className="mb-6 flex items-start justify-between gap-4 px-1">
        <div className="min-w-0">
          <p className="mb-0.5 text-xs font-medium uppercase tracking-widest text-slate-500">
            Periodo Lectivo
          </p>

          <p className="break-words text-2xl font-extrabold text-slate-800">
            {grupo?.practica?.Periodo?.nombre || "Sin periodo"}
          </p>
        </div>

        <div className="min-w-0 text-right">
          <p className="mb-0.5 text-xs font-medium uppercase tracking-widest text-slate-500">
            Tutor Asignado
          </p>

          <p className="break-words text-2xl font-extrabold text-slate-800">
            {grupo?.tutorDocente?.nombre || "Sin tutor asignado"}
          </p>
        </div>
      </div>

      {/* ── Título del grupo ── */}
      <h1
        className="
          mb-7 text-center text-[30px]
          font-extrabold tracking-tight text-slate-800
        "
      >
        {grupo?.nombre || "Grupo"}
      </h1>

      {/* ── Tabla ── */}
      <GenericTable
        rows={rows}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        columns={[
          { key: "codigo", label: "Código", primary: true },
          { key: "candidatos", label: "Practicantes" },
          { key: "correo", label: "Correo" },
          { key: "empresa", label: "Empresa" },
          {
            key: "estado",
            label: "Estado",
            render: (row) => <EstadoBadge estado={row.estado} />,
          },
        ]}
        actions={[
          // ── Ver informes ──
          {
            icon: <Eye size={18} />,
            className: "text-slate-600 hover:bg-blue-100",
            title: "Ver informes",
            onClick: (id) => {
              const practicante = rows.find((p) => p.id === id);

              if (!practicante?.practicante_id) {
                toast.error("Este candidato todavía no tiene un registro de practicante.");
                return;
              }

              navigate(
                `/informes/${practicante.practicante_id}/consulta`,
                {
                  state: {
                    practicante: {
                      id: practicante.practicante_id,
                      nombre: practicante.candidatos,
                      codigo: practicante.codigo,
                      empresa: practicante.empresa,
                      estado: practicante.estado,
                    },
                  },
                }
              );
            },
            disabled: (row) =>
              !row.practicante_id ||
              [
                "Retirado",
                "Cancelado",
                "RECHAZADO",
                "POSTULADO",
              ].includes(row.estado),
            disabledTitle: "No disponible para este estado",
          },

          // ── Retirar practicante ──
          {
            icon: <UserX size={18} />,
            className: "hover:bg-red-100 text-red-500",
            title: "Retirar practicante",
            onClick: verDetalle,
            disabled: (row) =>
              !row.practicante_id ||
              !row.empresa ||
              row.empresa === "Sin empresa" ||
              [
                "Retirado",
                "Cancelado",
                "Finalizada",
                "POSTULADO",
              ].includes(row.estado),
            disabledTitle: "No se puede retirar un practicante en este estado",
          },

          // ── Ver encuestas ──
          {
            icon:
              loadingEncuestasId !== null ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <ClipboardList size={18} />
              ),
            className: "text-purple-600 hover:bg-purple-100",
            title: "Ver encuestas",
            onClick: verEncuestasPracticante,
            disabled: (row) =>
              !row.practicante_id ||
              [
                "Retirado",
                "Cancelado",
                "RECHAZADO",
                "POSTULADO",
              ].includes(row.estado) ||
              loadingEncuestasId !== null,
            disabledTitle: "No disponible para este estado",
          },

          // ── Ver visitas ──
          {
            icon:
              loadingVisitasId !== null ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Building2 size={18} />
              ),
            className: "hover:bg-blue-100 text-blue-500",
            title: "Ver visitas",
            onClick: verVisitasPracticante,
            disabled: (row) =>
              !row.practicante_id ||
              [
                "Retirado",
                "Cancelado",
                "POSTULADO",
              ].includes(row.estado) ||
              loadingVisitasId !== null,
            disabledTitle: "No disponible para este estado",
          },

          // ── Ver retiro ──
          {
            icon: <FileText size={18} />,
            className: "text-rose-600 hover:bg-rose-100",
            title: "Ver retiro",
            onClick: handleVerRetiro,
            disabled: (row) =>
              !row.practicante_id ||
              !["Retirado", "Cancelado"].includes(row.estado) ||
              !row.retiro,
            disabledTitle: "Solo disponible para practicantes retirados o cancelados",
          },

          // ── Ver certificado ──
          {
            icon: <Award size={18} />,
            className: "text-emerald-600 hover:bg-emerald-100",
            title: "Certificado",
            onClick: handleVerCertificado,
            disabled: (row) =>
              !row.practicante_id ||
              [
                "Retirado",
                "Cancelado",
                "RECHAZADO",
                "POSTULADO",
              ].includes(row.estado) ||
              !row.certificado?.archivo?.url,
            disabledTitle: "No hay certificado disponible para este practicante",
          },
        ]}
        emptyMessage="No hay practicantes registrados."
        pageSize={7}
      />

      {/* ── Modal de retiro ── */}
      <RetirarPracticanteModal
        open={openRetiroModal}
        practicante={practicanteSeleccionado}
        onClose={() => {
          setOpenRetiroModal(false);
          setPracticanteSeleccionado(null);
        }}
        onRetirar={handleRetirar}
      />

      {/* ── Modal con encuestas del practicante ── */}
      <EncuestasPracticanteDirectorModal
        mostrar={mostrarEncuestas}
        practicante={practicanteEncuestasSeleccionado}
        practicas={encuestasPracticante}
        onCerrar={() => {
          setMostrarEncuestas(false);
          setEncuestaSeleccionada(null);
        }}
        onVerDetalle={(encuesta) => {
          setEncuestaSeleccionada(encuesta);
          setMostrarDetalleEncuesta(true);
        }}
      />

      {/* ── Modal de encuesta en modo consulta ── */}
      <EncuestaTutorEmpresarialModal
        mostrar={mostrarDetalleEncuesta}
        practicante={practicanteEncuestasSeleccionado}
        rolEncuesta="Practicante"
        modoConsulta={true}
        encuestaSeleccionada={encuestaSeleccionada}
        onCerrar={() => {
          setMostrarDetalleEncuesta(false);
          setEncuestaSeleccionada(null);
        }}
      />

      {/* ── Modal para ver retiro ── */}
      <VerRetiroModal
        open={!!verRetiroPracticante}
        practicante={verRetiroPracticante}
        onClose={() => setVerRetiroPracticante(null)}
      />

      {/* ── Modal del certificado ── */}
      <CertificadoPracticanteModal
        open={certificadoModal.open}
        practicante={certificadoModal.practicante}
        certificado={certificadoModal.certificado}
        loading={certificadoModal.loading}
        soloConsulta
        onClose={() => setCertificadoModal(certificadoVacio)}
      />
    </div>
  );
};

export default GrupoVistaDirector;
