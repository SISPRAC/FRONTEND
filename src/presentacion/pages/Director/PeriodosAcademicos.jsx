import { useEffect, useState } from "react";
import Layout from "../../shared/Layouts/Layout";

import AddButton from "../../components/buttons/AddButton";
import { periodoRepository } from "../../../infraestructura/repository/periodoRepository";
import { getPeriodos } from "../../../aplicacion/periodo/getPeriodos";
import PeriodoModal from "../../components/modals/PeriodoModal";
import { createPeriodo } from "../../../aplicacion/periodo/createPeriodo";
import { getPeriodoById } from "../../../aplicacion/periodo/getPeriodoByName";
import { updatePeriodo } from "../../../aplicacion/periodo/updatePeriodo";
import { deletePeriodo } from "../../../aplicacion/periodo/deletePeriodo";
import DeleteModal from "../../components/modals/DeleteModal";
import GenericTable from "../../components/Table/GenericTable";
import { Trash, SquarePen } from "lucide-react";
import toast from "react-hot-toast";

export default function PeriodosAcademicos() {

  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [selectedPeriodo, setSelectedPeriodo] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [periodoToDelete, setPeriodoToDelete] = useState(null);

  useEffect(() => {
    loadPeriodos();
  }, []);

  const loadPeriodos = async () => {
    try {
      const data = await getPeriodos({
        periodoRepository
      });

      setRows(data);

      // volver a la primera página cuando cambian los datos
      setCurrentPage(1);

    } catch (error) {
      console.error(error);
    }
  };

  const handleCreate = () => {
    setMode("create");
    setSelectedPeriodo(null);
    setIsOpen(true);
  };

  const handleEdit = async (id) => {

    try {
      // traer periodo desde backend
      const periodo = await getPeriodoById({ periodoRepository }, id);
      setSelectedPeriodo(periodo);
      setMode("edit");
      setIsOpen(true);
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Error al editar el periodo"
      );
    }
  };

  const handleSave = async (formData) => {
    try {
      await createPeriodo(
        { periodoRepository },
        formData
      );
      await loadPeriodos();
      toast.success("Periodo Creado con exito");
      setIsOpen(false);

    } catch (error) {
      toast.error(
        error.response?.data?.message ||
        "Error al crear el periodo"
      );
    }
  };

  const handleUpdate = async (formData) => {
    try {
      console.log("Actualizar:", formData);
      await updatePeriodo({ periodoRepository }, formData.id, formData);
      await loadPeriodos();
      toast.success("Periodo actualizado");
      setIsOpen(false);

    } catch (error) {
      console.log(error);
      toast.error(
        error.response?.data?.message ||
        "Error al actualizar el periodo"
      );
    }
  };

  const handleDelete = async () => {

    try {

      await deletePeriodo({ periodoRepository }, periodoToDelete.id);

      await loadPeriodos();
      toast.success("Periodo eliminado");
      setDeleteModal(false);
      setPeriodoToDelete(null);

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Error al eliminar periodo"
      );

    }
  };

  const deleteRow = (id) => {
    const periodo = rows.find(r => r.id === id);
    setPeriodoToDelete(periodo);
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
        Periodos Académicos
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
            key: "fecha_inicio",
            label: "Inicio"
          },
          {
            key: "fecha_fin",
            label: "Fin"
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
        emptyMessage="No hay períodos registrados."
        pageSize={6}
      />



      <AddButton
        onClick={handleCreate}
      />

      <PeriodoModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={
          mode === "edit"
            ? handleUpdate
            : handleSave
        }
        mode={mode}
        periodo={selectedPeriodo}
      />

      <DeleteModal
        isOpen={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setPeriodoToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar período"
        message={`¿Desea eliminar el período "${periodoToDelete?.nombre}"?`}
      />

    </Layout >
  );
}