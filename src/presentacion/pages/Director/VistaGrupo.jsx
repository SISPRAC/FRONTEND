import Layout from "../../shared/Layouts/Layout";

import { ThumbsUp, Calendar, Briefcase, UserX, Building2 } from "lucide-react";
import { getCandidatosGrupo } from "../../../aplicacion/grupos/getCandidatosGrupo";
import { grupoRepository } from "../../../infraestructura/repository/grupoRepository";
import GenericTable from "../../components/Table/GenericTable";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import EstadoBadge from "../../components/estadoBadge/EstadoBadge";
import RetirarPracticanteModal from "../../components/modals/RetirarPracticanteModal";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { crearRetiroPracticante } from "../../../aplicacion/retirarPracticante/crearRetiro";
import { retiroPracticanteRepository } from "../../../infraestructura/repository/retirarPracticanteRepository";

// ─── Vista principal ─────────────────────────────────────────────────────────
const GrupoVistaDirector = () => {
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();
  const { id } = useParams();
  const [grupo, setGrupo] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [openRetiroModal, setOpenRetiroModal] = useState(false);
  const [practicanteSeleccionado, setPracticanteSeleccionado] = useState(null);


  useEffect(() => {
    loadCandidatosGrupos();
  }, []);

  const loadCandidatosGrupos = async () => {
    try {
      const data = await getCandidatosGrupo({
        grupoRepository
      }, id);

      console.log("Candidatos del grupo obtenidos:", data);

      const formattedData = data.candidatos.map(candidato => ({
        id: candidato.id,
        codigo: candidato.codigo,
        candidatos: candidato.nombre,
        empresa: candidato.empresa,
        estado: candidato.estado
      }));

      setGrupo(data);
      setRows(formattedData);

    } catch (error) {
      console.error(error);
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
      toast.error("No se puede retirar un practicante sin empresa asignada.");
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
      toast.error(
        "No se puede retirar un practicante sin empresa asignada."
      );
      return;
    }

    try {

      await crearRetiroPracticante(
        retiroPracticanteRepository,
        {
          motivo,
          practicante_id: practicanteSeleccionado.id,
          cv: archivo
        }
      );

      toast.success(
        "El practicante fue retirado correctamente."
      );

      setOpenRetiroModal(false);

    } catch (error) {

      console.error(error);

      toast.error(
        error.response?.data?.message ||
        "Error al retirar al practicante."
      );

    }

  };

  return (
    <Layout footerLabel="Director">

      {/* ── Header: Periodo + Tutor ── */}
      <div className="flex justify-between items-start mb-6 px-1">
        <div>
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-0.5">
            Periodo Lectivo
          </p>
          <p className="text-2xl font-extrabold text-slate-800">{grupo?.practica?.Periodo?.nombre}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-slate-500 uppercase tracking-widest mb-0.5">
            Tutor Asignado
          </p>
          <p className="text-2xl font-extrabold text-slate-800">{grupo?.tutorDocente.nombre}</p>
        </div>
      </div>

      {/* ── Título ── */}
      <h1 className="
        text-[30px] font-extrabold text-slate-800
        text-center mb-7 tracking-tight
      ">
        {grupo?.nombre}
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
            // Si GenericTable soporta render personalizado:
            render: (row) => <EstadoBadge estado={row.estado} />,
          },
        ]}
        actions={[
          {
            icon: <UserX size={18} />,
            className: "hover:bg-red-100 text-red-500",
            onClick: verDetalle,
          },
          {
            icon: <Building2 />,
            className: "hover:bg-blue-100 text-blue-500",
            onClick: (id) => {
              const row = rows.find((p) => p.id === id);

              if (!row) return;

              toast.success("Función de ver empresa aún no implementada.");
              navigate(`/visitas`);
            },
          },
        ]}
        emptyMessage="No hay Practicantes registrados."
        pageSize={7}
      />

      <RetirarPracticanteModal
        open={openRetiroModal}
        practicante={practicanteSeleccionado}
        onClose={() => setOpenRetiroModal(false)}
        onRetirar={handleRetirar}
      />

    </Layout >
  );
};

export default GrupoVistaDirector;