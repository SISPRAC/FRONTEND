import { useEffect, useState } from "react";
import Layout from "../../shared/Layouts/Layout";
import { convenioRepository } from "../../../infraestructura/repository/convenioRepository";
import { getConvenios } from "../../../aplicacion/convenio/getConvenios";
import GenericTable from "../../components/Table/GenericTable";
import { FileSliders } from "lucide-react";
import toast from "react-hot-toast";
import EstadoBadge from "../../components/estadoBadge/EstadoBadge";
import { useNavigate } from "react-router-dom";
import { getConvenio } from "../../../aplicacion/convenio/getConvenio";

export default function Convenios() {
  const navigate = useNavigate();

  const [convenioSeleccionado, setConvenioSeleccionado] = useState(null);
  const [rows, setRows] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    loadConvenios();
  }, []);

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
    }
  };

 const handleVerConvenio = async (id) => {
    navigate("/convenio", {
        state: {
            convenioId: id
        }
    });
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
            // Si GenericTable soporta render personalizado:
            render: (row) => <EstadoBadge estado={row.estado} />,
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

    </Layout >
  );
}