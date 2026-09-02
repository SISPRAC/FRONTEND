import { useEffect, useState } from "react";
import Layout from "../../shared/Layouts/Layout";
import { convenioRepository } from "../../../infraestructura/repository/convenioRepository";
import { getConvenios } from "../../../aplicacion/convenio/getConvenios";
import GenericTable from "../../components/Table/GenericTable";
import { FileSliders } from "lucide-react";
import toast from "react-hot-toast";
import EstadoBadge from "../../components/estadoBadge/EstadoBadge";
import { useNavigate } from "react-router-dom";
import { EmpresaRepository } from "../../../infraestructura/repository/empresaRepository";
import InviteModal from "../../components/modals/InviteModal";

export default function Convenios() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  // =========================================================
  // MODAL INVITAR EMPRESA
  // =========================================================

  const [isInviteOpen, setIsInviteOpen] = useState(false);


  useEffect(() => {
    loadConvenios();
  }, []);


  // =========================================================
  // CARGAR CONVENIOS
  // =========================================================

  const loadConvenios = async () => {
    try {
      const data = await getConvenios({
        convenioRepository
      });

      const formattedData = data.map(convenio => ({
        ...convenio
      }));

      setRows(formattedData);
      setCurrentPage(1);

    } catch (error) {
      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Error al cargar los convenios"
      );
    }
  };


  // =========================================================
  // VER CONVENIO
  // =========================================================

  const handleVerConvenio = async (id) => {
    navigate("/convenio", {
      state: {
        convenioId: id
      }
    });
  };


  // =========================================================
  // ABRIR MODAL INVITAR
  // =========================================================

  const handleInvitar = () => {
    setIsInviteOpen(true);
  };


  // =========================================================
  // ENVIAR INVITACIÓN
  // =========================================================

  const handleEnviarInvitacion = async (correo) => {
    try {

      await EmpresaRepository.invitar({
        correo
      });

      toast.success("Invitación enviada con éxito");

      setIsInviteOpen(false);

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Error al enviar la invitación"
      );

    }
  };


  return (

    <Layout footerLabel="Director">

      <h1 className="
        text-[26px]
        font-extrabold
        text-slate-800
        text-center
        mb-7
        tracking-tight
      ">
        Convenios
      </h1>


      <GenericTable
        rows={rows}
        currentPage={currentPage}
        onPageChange={setCurrentPage}

        columns={[
          {
            key: "empresa",
            label: "Empresa",
            primary: true
          },
          {
            key: "fechaFin",
            label: "Fin"
          },
          {
            key: "estado",
            label: "Estado",
            render: (row) => (
              <EstadoBadge estado={row.estado} />
            ),
          }
        ]}

        actions={[
          {
            icon: <FileSliders size={24} />,
            className: "hover:bg-blue-100",
            onClick: handleVerConvenio
          },
        ]}

        emptyMessage="No hay Convenios registrados."
        pageSize={6}
      />


      {/* =====================================================
          BOTÓN INVITAR EMPRESA
      ===================================================== */}

      <div className="flex justify-end mt-8">

        <button
          onClick={handleInvitar}
          className="
            px-6 py-2.5
            bg-[#e8192c]
            hover:bg-[#c8111f]
            text-white
            font-semibold
            rounded-lg
            transition
          "
        >
          Invitar empresa
        </button>

      </div>


      {/* =====================================================
          MODAL INVITAR EMPRESA
      ===================================================== */}

      <InviteModal
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSubmit={handleEnviarInvitacion}
        tipo="empresa"
      />

    </Layout>
  );
}