import {
  ArrowLeft,
  UserX,
  Building2,
  LoaderCircle,
  Eye,
} from "lucide-react";
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
        {/* Encabezado de tabla */}
        <div className="grid grid-cols-4 gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4">
          {["w-16", "w-28", "w-24", "w-20"].map((width, index) => (
            <div
              key={index}
              className={`h-4 ${width} rounded bg-slate-200`}
            />
          ))}
        </div>

        {/* Filas de carga */}
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

// ─── Vista principal ────────────────────────────────────────────────────────
const GrupoVistaDirector = () => {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { id } = useParams();

  const [grupo, setGrupo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorCarga, setErrorCarga] = useState(false);

  const [isEdit, setIsEdit] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [openRetiroModal, setOpenRetiroModal] = useState(false);
  const [practicanteSeleccionado, setPracticanteSeleccionado] = useState(null);
  const [loadingVisitasId, setLoadingVisitasId] = useState(null);

  useEffect(() => {
    loadCandidatosGrupos();
  }, [id]);

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
        id: candidato.id,
        codigo: candidato.codigo,
        candidatos: candidato.nombre,
        empresa: candidato.empresa,
        estado: candidato.estado,
      }));

      setGrupo(data);
      setRows(formattedData);
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

  const verVisitasPracticante = async (id) => {
    const practicante = rows.find((p) => p.id === id);

    if (!practicante) {
      toast.error("No se encontró el practicante.");
      return;
    }

    // Activar indicador de carga en el botón
    setLoadingVisitasId(id);

    // Mostrar toast de carga
    const toastId = toast.loading(
      "Cargando visitas del practicante..."
    );

    try {
      const respuesta = await obtenerVisitasPorPracticante(
        { visitaRepository },
        practicante.id
      );

      const visitas = respuesta?.data ?? respuesta;

      console.log("Visitas del practicante:", visitas);

      if (!Array.isArray(visitas) || visitas.length === 0) {
        toast.dismiss(toastId);
        toast.error(
          "Este practicante no tiene visitas registradas."
        );
        return;
      }

      // Seleccionar la visita que se va a consultar
      const visita = visitas[0];

      if (!visita.solicitud_visita_id || !visita.solicitud) {
        toast.dismiss(toastId);
        toast.error(
          "La visita no contiene la información de su solicitud."
        );
        return;
      }

      // Cerrar el toast antes de navegar
      toast.dismiss(toastId);

      navigate(
        `/visita-empresarial/${visita.solicitud_visita_id}`,
        {
          state: {
            solicitud: visita.solicitud,
            visita: visita
          }
        }
      );

    } catch (error) {
      console.error(
        "Error al consultar las visitas:",
        error
      );

      toast.dismiss(toastId);

      toast.error(
        error.response?.data?.message ||
        error.message ||
        "No se pudieron consultar las visitas del practicante."
      );
    } finally {
      // Quitar el indicador de carga siempre
      setLoadingVisitasId(null);
    }
  };

  const verDetalle = (id) => {
    const practicante = rows.find((p) => p.id === id);

    console.log("Practicante encontrado:", practicante);

    if (!practicante) {
      toast.error("No se encontró el practicante.");
      return;
    }

    if (!practicante.empresa) {
      toast.error(
        "No se puede retirar un practicante sin empresa asignada."
      );
      return;
    }

    if (practicante.estado === "POSTULADO") {
      toast.error("El candidato aún está en proceso de selección.");
      return;
    }

    if (practicante.estado === "RECHAZADO") {
      toast.error("No se puede retirar un candidato.");
      return;
    }

    setPracticanteSeleccionado(practicante);
    setOpenRetiroModal(true);
  };

  const handleEdit = (curso) => {
    setCursoSeleccionado(curso);
    setIsEdit(true);
    setOpenModal(true);
  };

  const handleAdd = () => {
    setCursoSeleccionado(null);
    setIsEdit(false);
    setOpenModal(true);
  };

  const handleRetirar = async ({ motivo, archivo }) => {
    if (!practicanteSeleccionado?.empresa) {
      toast.error("No se puede retirar un practicante sin empresa asignada.");
      return;
    }

    try {
      await crearRetiroPracticante(
        { retiroPracticanteRepository },
        {
          motivo,
          practicante_id: practicanteSeleccionado.id,
          archivo,
        }
      );
    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message || "Error al retirar al practicante."
      );
      return; // el modal se queda abierto para que puedan reintentar
    }

    toast.success("El practicante fue retirado correctamente.");

    setOpenRetiroModal(false);
    setPracticanteSeleccionado(null);

    // Si esto falla, el retiro ya se hizo; no lo mostramos como error de retiro.
    try {
      await loadCandidatosGrupos();
    } catch (error) {
      console.error(error);
      toast.error("El retiro se hizo, pero no se pudo actualizar la lista.");
    }
  };

  // Mostrar el skeleton mientras se obtiene la información.
  if (loading) {
    return <GrupoVistaSkeleton />;
  }

  // Mostrar un mensaje si ocurrió un error.
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
          { key: "empresa", label: "Empresa" },
          {
            key: "estado",
            label: "Estado",
            render: (row) => <EstadoBadge estado={row.estado} />,
          },
        ]}
        actions={[

          {
            icon: <Eye size={18} />,
            className: "text-slate-600 hover:bg-blue-100",
            title: "Ver informes",
            onClick: (id) => {
              const practicante = rows.find((p) => p.id === id);

              if (!practicante) {
                toast.error("No se encontró el practicante.");
                return;
              }

              navigate(`/informes/${practicante.id}/consulta`, {
                state: {
                  practicante: {
                    id: practicante.id,
                    nombre: practicante.candidatos,
                    codigo: practicante.codigo,
                    empresa: practicante.empresa,
                    estado: practicante.estado,
                  },
                },
              });
            },
            disabled: (row) =>
              row.estado === "Retirado" ||
              row.estado === "RECHAZADO" ||
              row.estado === "POSTULADO",
            disabledTitle: "No disponible para este estado",
          },
          {
            icon: <UserX size={18} />,
            className: "hover:bg-red-100 text-red-500",
            onClick: verDetalle,
            disabled: (row) =>
              row.estado === "Retirado" ||
              row.estado === "Finalizada" ||
              loadingVisitasId !== null,
            disabledTitle: "No se puede retirar un practicante en este estado",
          },
          {
            icon:
              loadingVisitasId !== null ? (
                <LoaderCircle size={18} className="animate-spin" />
              ) : (
                <Building2 size={18} />
              ),
            className: "hover:bg-blue-100 text-blue-500",
            onClick: verVisitasPracticante,
            disabled: (row) =>
              row.estado === "Retirado" ||
              loadingVisitasId !== null,
            disabledTitle: "No disponible para practicantes retirados",
          },
        ]}
        emptyMessage="No hay Practicantes registrados."
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
    </div>
  );
};

export default GrupoVistaDirector;
