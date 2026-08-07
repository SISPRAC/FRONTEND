import { useEffect, useState } from "react";
import Layout from "../../shared/Layouts/Layout";

import AddButton from "../../components/buttons/AddButton";
import GenericTable from "../../components/Table/GenericTable";
import PracticaModal from "../../components/modals/PracticaModal";
import DeleteModal from "../../components/modals/DeleteModal";

import { Trash, SquarePen } from "lucide-react";
import toast from "react-hot-toast";

import { practicaRepository } from "../../../infraestructura/repository/practicaRepository.js";
import { getPracticas } from "../../../aplicacion/practica/getPracticas.js";
import { getPracticaById } from "../../../aplicacion/practica/getPractica.js";
import { createPractica } from "../../../aplicacion/practica/createPractica.js";
import { updatePractica } from "../../../aplicacion/practica/updatePractica.js";
import { deletePractica } from "../../../aplicacion/practica/deletePractica.js";

export default function PracticasPage() {

  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState("create");
  const [selectedPractica, setSelectedPractica] = useState(null);

  const [deleteModal, setDeleteModal] = useState(false);
  const [practicaToDelete, setPracticaToDelete] = useState(null);

  useEffect(() => {
    loadPracticas();
  }, []);

  const loadPracticas = async () => {
    try {

      const data = await getPracticas({
        practicaRepository
      });

      setRows(data);
      setCurrentPage(1);

    } catch (error) {
      console.log(error);
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

    try {

      await deletePractica(
        { practicaRepository },
        practicaToDelete.id
      );

      await loadPracticas();

      toast.success("Práctica eliminada");

      setDeleteModal(false);
      setPracticaToDelete(null);

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        "Error al eliminar la práctica"
      );

    }

  };

  return (

    <Layout
     
      footerLabel="Administrador"
    >

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
        Prácticas
      </h1>

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

      <AddButton onClick={handleCreate} />

      <PracticaModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onSubmit={mode === "edit" ? handleUpdate : handleSave}
        mode={mode}
        practica={selectedPractica}
        practicas={rows}
      />

      <DeleteModal
        isOpen={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setPracticaToDelete(null);
        }}
        onConfirm={handleDelete}
        title="Eliminar práctica"
        message={`¿Desea eliminar la práctica del período "${practicaToDelete?.Periodo?.nombre}"?`}
      />

    </Layout>

  );

}