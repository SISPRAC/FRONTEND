import Layout from "../../shared/Layouts/Layout";
import { Trash, SquarePen, Eye } from "lucide-react";
import GenericTable from "../../components/Table/GenericTable";
import { useEffect, useState } from "react";
import { grupoRepository } from "../../../infraestructura/repository/grupoRepository";
import { getGrupos } from "../../../aplicacion/grupos/getGrupos";
import { getTutorDocentes } from "../../../aplicacion/tutorDocente/getTutorDocente";
import { periodoRepository } from "../../../infraestructura/repository/periodoRepository";
import { tutorDocenteRepository } from "../../../infraestructura/repository/tutorDocenteRepository";
import { getPeriodos } from "../../../aplicacion/periodo/getPeriodos";
import { getCandidatosDisponibles } from "../../../aplicacion/candidato/getDisponiblesGrupo";
import { candidatoRepository } from "../../../infraestructura/repository/candidatoRepository";
import { getGrupo } from "../../../aplicacion/grupos/getGrupo";
import { editarGrupo } from "../../../aplicacion/grupos/editarGrupo";
import { createGrupo } from "../../../aplicacion/grupos/createGrupo";
import { deleteGrupo } from "../../../aplicacion/grupos/eliminarGrupo";
import { useNavigate } from "react-router-dom";
import DeleteModal from "../../components/modals/DeleteModal";
import AddButton from "../../components/buttons/AddButton";
import GrupoModal from "../../components/modals/GrupoModal";
import toast from "react-hot-toast";


const GruposDirector = () => {
  const navigate = useNavigate();
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [selectedGrupo, setSelectedGrupo] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [grupoToDelete, setGrupoToDelete] = useState(null);
  const [GrupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [formData, setFormData] = useState({
    nombre: "",
    periodoId: "",
    docenteId: ""
  });
  const [periodos, setPeriodos] = useState([]);
  const [tutorDocentes, setTutorDocentes] = useState([]);
  const [candidatos, setCandidatos] = useState([]);

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
        periodo: grupo.Periodo?.nombre,
        tutorDocente: `${grupo.TutorDocente?.Usuario?.nombres} ${grupo.TutorDocente?.Usuario?.apellidos}`
      }));
      setRows(formattedData);
       setCurrentPage(1);

    } catch (error) {
      console.error(error);
    }
  };

  const loadCombos = async () => {
    try {

      const periodosData = await getPeriodos({
        periodoRepository
      });

      const docentesData = await getTutorDocentes({
        tutorDocenteRepository
      });

      setPeriodos(periodosData);
      setTutorDocentes(docentesData.data);

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
      // traer grupo desde backend
      const grupo = await getGrupo({ grupoRepository }, id);
      console.log("Grupo para editar:", grupo);
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

  const handleSave = async (formData) => {
    console.log("Guardar:", formData);
    try {

      await createGrupo(
        { grupoRepository },
        formData
      );

      await loadGrupos();

      toast.success("Grupo creado con éxito");

      setIsOpen(false);

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Error al crear el grupo" + error.message
      );
      console.log(error);

    }
  };

  const handleUpdate = async (formData) => {
    try {
      console.log("Actualizar:", formData);
      await editarGrupo({ grupoRepository }, formData.id, formData);
      await loadGrupos();
      toast.success("Grupo actualizado");
      setIsOpen(false);

    } catch (error) {
      console.log(error.response?.data);
      toast.error(
        error.response?.data?.message ||
        "Error al actualizar el grupo"
      );
    }
  };

  const handleDelete = async () => {

    try {

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

    }
  };

  const deleteRow = (id) => {
    const grupo = rows.find(r => r.id === id);
    setGrupoToDelete(grupo);
    setDeleteModal(true);
  };
  return (

    <Layout 
     
      footerLabel="Director"
    >

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
            key: "periodo",
            label: "Periodo Académico"
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
        periodos={periodos}
        tutorDocentes={tutorDocentes}
      />

      <DeleteModal
        isOpen={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setGrupoToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar Grupo"
        message={
          grupoToDelete
            ? `¿Está seguro de eliminar el grupo "${grupoToDelete.nombre}"?`
            : "¿Está seguro de eliminar este grupo?"
        }
      />

    </Layout >
  );
}


export default GruposDirector
