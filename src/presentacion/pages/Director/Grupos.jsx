import { Trash, SquarePen, Eye, Loader2 } from "lucide-react";
import GenericTable from "../../components/Table/GenericTable";
import { useEffect, useState } from "react";
import { grupoRepository } from "../../../infraestructura/repository/grupoRepository";
import { getGrupos } from "../../../aplicacion/grupos/getGrupos";
import { getTutorDocentes } from "../../../aplicacion/tutorDocente/getTutorDocente";
import { practicaRepository } from "../../../infraestructura/repository/practicaRepository";
import { tutorDocenteRepository } from "../../../infraestructura/repository/tutorDocenteRepository";
import { getPracticas } from "../../../aplicacion/practica/getPracticas";
import { getCandidatosDisponibles } from "../../../aplicacion/candidato/getDisponiblesGrupo";
import { candidatoRepository } from "../../../infraestructura/repository/candidatoRepository";
import { getGrupo } from "../../../aplicacion/grupos/getGrupo";
import { editarGrupo } from "../../../aplicacion/grupos/editarGrupo";
import { createGrupo } from "../../../aplicacion/grupos/createGrupo";
import { deleteGrupo } from "../../../aplicacion/grupos/eliminarGrupo";
import { useNavigate } from "react-router-dom";
import AddButton from "../../components/buttons/AddButton";
import GrupoModal from "../../components/modals/GrupoModal";
import toast from "react-hot-toast";


// ==========================================
// SKELETON
// ==========================================

const GruposSkeleton = ({ filas = 6 }) => (
  <div
    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
    aria-busy="true"
    aria-label="Cargando grupos"
  >

    {/* ENCABEZADO */}
    <div className="grid grid-cols-4 gap-4 px-5 py-3 bg-slate-50 border-b border-slate-200">
      {[1, 2, 3, 4].map((item) => (
        <div
          key={item}
          className="h-3 w-20 rounded bg-slate-200 animate-pulse"
        />
      ))}
    </div>

    {/* FILAS */}
    {Array.from({ length: filas }).map((_, fila) => (
      <div
        key={fila}
        className="grid grid-cols-4 gap-4 items-center px-5 py-4 border-b border-slate-100 last:border-0"
      >
        {/* Nombre */}
        <div className="h-3 w-2/3 rounded bg-slate-200 animate-pulse" />

        {/* Práctica */}
        <div className="h-3 w-1/2 rounded bg-slate-200 animate-pulse" />

        {/* Tutor docente */}
        <div className="h-3 w-3/4 rounded bg-slate-200 animate-pulse" />

        {/* Acciones */}
        <div className="flex items-center justify-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
          <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
        </div>
      </div>
    ))}

  </div>
);


// ==========================================
// MODAL CONFIRMAR ELIMINACIÓN
// ==========================================

const ConfirmarEliminarModal = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  loading = false,
}) => {

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
      onClick={onClose}
    >

      <div
        className="w-full max-w-md rounded-xl bg-white shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >

        <h2 className="text-xl font-bold text-slate-800 mb-3">
          {title}
        </h2>

        <p className="text-sm text-slate-600 leading-6">
          {message}
        </p>

        <div className="flex justify-end gap-3 mt-6">

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="
              px-4 py-2
              rounded-lg
              border border-slate-200
              text-sm font-semibold text-slate-600
              hover:bg-slate-50
              transition
              disabled:opacity-40
              disabled:cursor-not-allowed
            "
          >
            Cancelar
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="
              inline-flex items-center justify-center gap-2
              min-w-[130px]
              px-4 py-2
              rounded-lg
              bg-[#e8192c] hover:bg-[#c8111f]
              text-white text-sm font-semibold
              transition
              disabled:opacity-60
              disabled:cursor-not-allowed
            "
          >
            {loading ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Eliminando...
              </>
            ) : (
              "Eliminar"
            )}
          </button>

        </div>

      </div>

    </div>
  );
};


const GruposDirector = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [selectedGrupo, setSelectedGrupo] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [grupoToDelete, setGrupoToDelete] = useState(null);
  const [eliminando, setEliminando] = useState(false);
  const [practica, setPractica] = useState([]);
  const [tutorDocentes, setTutorDocentes] = useState([]);
  const [candidatos, setCandidatos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGrupos();
    loadCombos();
    loadCandidatos();
  }, []);

  const loadGrupos = async () => {
    try {
      const data = await getGrupos({
        grupoRepository
      });

      const formattedData = data.map(grupo => ({
        id: grupo.id,
        nombre: grupo.nombre,
        practica: grupo.practica.Periodo.nombre,
        tutorDocente: `${grupo.TutorDocente?.Usuario?.nombres} ${grupo.TutorDocente?.Usuario?.apellidos}`
      }));
      setRows(formattedData);
      setCurrentPage(1);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const loadCombos = async () => {
    try {

      const practicasData = await getPracticas({
        practicaRepository
      });

      const docentesData = await getTutorDocentes({
        tutorDocenteRepository
      });

      setPractica(practicasData);
      setTutorDocentes(docentesData);

    } catch (error) {
      console.error(error);
      toast.error("Error cargando datos");
    }
  };

  const loadCandidatos = async () => {

    const candidatosData = await getCandidatosDisponibles({
      candidatoRepository
    });
    setCandidatos(candidatosData.data);
  };

  const handleView = (id) => {
    navigate(`/grupos/${id}/candidatos`);
  };

  const handleCreate = () => {
    setMode("create");
    setSelectedGrupo(null);
    setIsOpen(true);
  };

  const handleEdit = async (id) => {

    try {
      const grupo = await getGrupo({ grupoRepository }, id);
      setSelectedGrupo(grupo);
      setMode("edit");
      setIsOpen(true);
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
        "Error al editar el grupo"
      );
    }
  };

  // Devuelve el grupo guardado (con su id) y NO cierra el modal:
  // el modal se cierra solo cuando termina de enviar las invitaciones.
  const handleSave = async (formData) => {
    try {

      const result = await createGrupo(
        { grupoRepository },
        formData
      );

      await loadGrupos();
      await loadCandidatos();

      toast.success("Grupo creado con éxito");

      // Ajusta si tu respuesta tiene otra forma
      return result?.grupo ?? result?.data?.grupo ?? result?.data ?? result;

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Error al crear el grupo"
      );
      console.log(error);

      throw error; // para que el modal no siga con las invitaciones
    }
  };

  const handleUpdate = async (formData) => {
    try {

      await editarGrupo({ grupoRepository }, formData.id, formData);

      await loadGrupos();
      await loadCandidatos();

      toast.success("Grupo actualizado");

      return { id: formData.id };

    } catch (error) {
      console.log(error.response?.data);
      toast.error(
        error.response?.data?.message ||
        "Error al actualizar el grupo"
      );

      throw error;
    }
  };

  const cerrarModalEliminar = () => {
    if (eliminando) return;

    setDeleteModal(false);
    setGrupoToDelete(null);
  };

  const handleDelete = async () => {

    if (eliminando || !grupoToDelete) return;

    try {

      setEliminando(true);

      await deleteGrupo(
        { grupoRepository },
        grupoToDelete.id
      );

      await loadGrupos();

      toast.success("Grupo eliminado");

      setDeleteModal(false);
      setGrupoToDelete(null);

    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.message ||
        "Error al eliminar grupo"
      );
    } finally {
      setEliminando(false);
    }
  };

  const deleteRow = (id) => {
    const grupo = rows.find(r => r.id === id);
    setGrupoToDelete(grupo);
    setDeleteModal(true);
  };

  return (

    <div>

      <h1 className="
        text-[26px]
        font-extrabold
        text-slate-800
        text-center
        mb-7
        tracking-tight
      ">
        Grupos Académicos
      </h1>

      {loading ? (

        <GruposSkeleton />

      ) : (

        <GenericTable
          rows={rows}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          columns={[
            {
              key: "nombre",
              label: "Nombre",
              primary: true
            },
            {
              key: "practica",
              label: "Práctica"
            },
            {
              key: "tutorDocente",
              label: "Tutor Docente"
            }
          ]}
          actions={[
            {
              icon: <Eye size={24} />,
              className: "hover:bg-green-100",
              onClick: handleView
            },
            {
              icon: <SquarePen size={24} />,
              className: "hover:bg-blue-100",
              onClick: handleEdit
            },
            {
              icon: <Trash size={24} />,
              className: "hover:bg-red-100",
              onClick: deleteRow
            }
          ]}
          emptyMessage="No hay grupos registrados."
          pageSize={6}
        />

      )}

      <AddButton
        onClick={handleCreate}
      />

      <GrupoModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={
          mode === "edit"
            ? handleUpdate
            : handleSave
        }
        mode={mode}
        grupo={selectedGrupo}
        candidatos={candidatos}
        practicas={practica}
        tutorDocentes={tutorDocentes}
      />

      <ConfirmarEliminarModal
        isOpen={deleteModal}
        onClose={cerrarModalEliminar}
        onConfirm={handleDelete}
        loading={eliminando}
        title="Eliminar Grupo"
        message={
          grupoToDelete
            ? `¿Está seguro de eliminar el grupo "${grupoToDelete.nombre}"?`
            : "¿Está seguro de eliminar este grupo?"
        }
      />

    </div>
  );
}

export default GruposDirector;