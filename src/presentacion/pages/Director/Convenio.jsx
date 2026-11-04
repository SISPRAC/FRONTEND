import { useEffect, useState } from "react";

import { convenioRepository } from "../../../infraestructura/repository/convenioRepository";
import { getConvenios } from "../../../aplicacion/convenio/getConvenios";
import GenericTable from "../../components/Table/GenericTable";
import { FileSliders } from "lucide-react";
import toast from "react-hot-toast";
import EstadoBadge from "../../components/estadoBadge/EstadoBadge";
import { useNavigate } from "react-router-dom";
import { EmpresaRepository } from "../../../infraestructura/repository/empresaRepository";
import InviteModal from "../../components/modals/InviteModal";


// ==========================================
// SKELETON
// ==========================================

const ConveniosSkeleton = ({ filas = 6 }) => (
  <div
    className="overflow-hidden rounded-xl border border-slate-200 bg-white"
    aria-busy="true"
    aria-label="Cargando convenios"
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
        {/* Empresa */}
        <div className="h-3 w-2/3 rounded bg-slate-200 animate-pulse" />

        {/* Fin */}
        <div className="h-3 w-1/2 rounded bg-slate-200 animate-pulse" />

        {/* Estado */}
        <div className="h-6 w-24 rounded-full bg-slate-200 animate-pulse" />

        {/* Acciones */}
        <div className="flex justify-center">
          <div className="h-8 w-8 rounded-lg bg-slate-200 animate-pulse" />
        </div>
      </div>
    ))}

  </div>
);


export default function Convenios() {
  const navigate = useNavigate();

  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
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

    <div>

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


      {loading ? (

        <ConveniosSkeleton />

      ) : (

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

      )}


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
            rounded-xl
            shadow-sm
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

    </div>
  );
}