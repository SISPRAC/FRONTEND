
import { useEffect, useState } from "react";

import AddButton from "../../components/buttons/Addbutton.jsx";
import GenericTable from "../../components/Table/GenericTable";
import PracticaModal from "../../components/modals/PracticaModal";
import ConfirmModal from "../../components/modals/ConfirmModal";

import { Trash, SquarePen } from "lucide-react";
import toast from "react-hot-toast";

import { practicaRepository } from "../../../infraestructura/repository/practicaRepository.js";
import { getPracticas } from "../../../aplicacion/practica/getPracticas.js";
import { getPracticaById } from "../../../aplicacion/practica/getPractica.js";
import { createPractica } from "../../../aplicacion/practica/createPractica.js";
import { updatePractica } from "../../../aplicacion/practica/updatePractica.js";
import { deletePractica } from "../../../aplicacion/practica/deletePractica.js";
import { ESTADOS_CONFIG } from "../../shared/constans/estados.js";

export default function PracticasPage() {

  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [selectedPractica, setSelectedPractica] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [practicaToDelete, setPracticaToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    loadPracticas(true);
  }, []);

  const loadPracticas = async (showLoading = false) => {
    try {

      if (showLoading) {
        setLoading(true);
      }

      const data = await getPracticas({
        practicaRepository
      });

      console.log("Practica ", data);

      setRows(data);
      setCurrentPage(1);

    } catch (error) {

      console.log(error);

      toast.error(
        error.response?.data?.message ||
        "Error al cargar las prácticas"
      );

    } finally {

      if (showLoading) {
        setLoading(false);
      }

    }
  };

  const handleCreate = () => {
    setMode("create");
    setSelectedPractica(null);
    setIsOpen(true);
  };

  const handleEdit = async (id) => {

    try {

      const practica = await getPracticaById(
        { practicaRepository },
        id
      );

      setSelectedPractica(practica);
      setMode("edit");
      setIsOpen(true);

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Error al cargar la práctica"
      );

    }

  };

  const handleSave = async (formData) => {

    try {

      await createPractica(
        { practicaRepository },
        formData
      );

      await loadPracticas();

      toast.success("Práctica creada");

      setIsOpen(false);

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Error al crear la práctica"
      );

    }

  };

  const handleUpdate = async (formData) => {

    try {

      await updatePractica(
        { practicaRepository },
        formData.id,
        formData
      );

      await loadPracticas();

      toast.success("Práctica actualizada");

      setIsOpen(false);

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Error al actualizar la práctica"
      );

    }

  };

  const deleteRow = (id) => {

    const practica = rows.find(r => r.id === id);

    setPracticaToDelete(practica);

    setDeleteModal(true);

  };

  const handleDelete = async () => {

    if (!practicaToDelete || deleting) return;

    try {

      setDeleting(true);

      await deletePractica(
        { practicaRepository },
        practicaToDelete.id
      );

      await loadPracticas();

      toast.success("Práctica eliminada correctamente");

      setDeleteModal(false);
      setPracticaToDelete(null);

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Error al eliminar la práctica"
      );

    } finally {

      setDeleting(false);

    }

  };

  return (

    <div>

      <h1
        className="
          text-[26px]
          font-extrabold
          text-slate-800
          text-center
          mb-7
          tracking-tight
        "
      >
        Gestión de Prácticas
      </h1>

      {loading ? (

        // Skeleton de la tabla
        <div className="w-full animate-pulse">

          {/* Encabezado */}
          <div className="
            grid grid-cols-5
            gap-4
            bg-slate-100
            rounded-t-xl
            px-6 py-5
            border border-slate-200
          ">
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="h-5 bg-slate-200 rounded-md"
              />
            ))}
          </div>

          {/* Filas */}
          <div className="
            border-x border-b
            border-slate-200
            rounded-b-xl
            overflow-hidden
          ">
            {[1, 2, 3, 4, 5, 6].map((item) => (

              <div
                key={item}
                className="
                  grid grid-cols-5
                  gap-4
                  items-center
                  px-6 py-5
                  border-b border-slate-100
                  last:border-b-0
                "
              >

                <div className="h-5 w-3/4 bg-slate-200 rounded-md" />

                <div className="h-5 w-2/3 bg-slate-200 rounded-md" />

                <div className="h-5 w-2/3 bg-slate-200 rounded-md" />

                <div className="h-6 w-24 bg-slate-200 rounded-full" />

                <div className="flex justify-center gap-3">
                  <div className="h-9 w-9 bg-slate-200 rounded-lg" />
                  <div className="h-9 w-9 bg-slate-200 rounded-lg" />
                </div>

              </div>

            ))}
          </div>

        </div>

      ) : (

        <GenericTable
          rows={rows}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
          columns={[
            {
              key: "Periodo",
              label: "Período",
              primary: true,
              render: row => row.Periodo?.nombre
            },
            {
              key: "fecha_inicio",
              label: "Inicio"
            },
            {
              key: "fecha_fin",
              label: "Fin"
            },
            {
              key: "estado",
              label: "Estado",
              render: row => {
                const estado = ESTADOS_CONFIG[row.estado] || {
                  bg: "bg-gray-100",
                  text: "text-gray-700",
                  dot: "bg-gray-500"
                };

                const nombreEstado = row.estado === "EN_CURSO"
                  ? "En curso"
                  : row.estado === "FINALIZADA"
                    ? "Finalizada"
                    : row.estado;

                return (
                  <span
                    className={`
                      inline-flex
                      items-center
                      gap-2
                      px-3
                      py-1
                      rounded-full
                      text-sm
                      font-medium
                      ${estado.bg}
                      ${estado.text}
                    `}
                  >
                    <span
                      className={`
                        w-2
                        h-2
                        rounded-full
                        ${estado.dot}
                      `}
                    />

                    {nombreEstado}
                  </span>
                );
              }
            }
          ]}
          actions={[
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
          emptyMessage="No hay prácticas registradas."
          pageSize={6}
        />

      )}

      <AddButton onClick={handleCreate} />

      <PracticaModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={mode === "edit" ? handleUpdate : handleSave}
        mode={mode}
        practica={selectedPractica}
        practicas={rows}
      />

      <ConfirmModal
        isOpen={deleteModal}
        onCancel={() => {

          if (deleting) return;

          setDeleteModal(false);
          setPracticaToDelete(null);

        }}
        onConfirm={handleDelete}
        loading={deleting}
        title="Eliminar práctica"
        message={`¿Está seguro de que desea eliminar la práctica del período "${practicaToDelete?.Periodo?.nombre}"? Esta acción no se puede deshacer.`}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        confirmColor="bg-red-600 hover:bg-red-700"
      />

    </div>

  );

}
