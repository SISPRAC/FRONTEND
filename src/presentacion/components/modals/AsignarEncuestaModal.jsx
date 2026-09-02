import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { X, Check } from "lucide-react";

export default function AsignarEncuestaModal({
    isOpen,
    onClose,
    onSubmit,
    encuesta,
    practicas = []
}) {

    console.log("Encuesta en AsignarEncuestaModal:", encuesta);

    const [
        practicasSeleccionadas,
        setPracticasSeleccionadas
    ] = useState([]);


    // ==========================================
    // CARGAR ASIGNACIONES ACTUALES
    // ==========================================

    useEffect(() => {

        if (!isOpen) return;

        if (encuesta) {

            setPracticasSeleccionadas(

                encuesta.practicas?.map(
                    practica =>
                        practica.id
                ).filter(Boolean) || []

            );

        } else {

            setPracticasSeleccionadas([]);

        }

    }, [isOpen, encuesta]);


    // ==========================================
    // SELECCIONAR / DESELECCIONAR
    // ==========================================

    const handleCheck = (id) => {

        if (
            practicasSeleccionadas.includes(id)
        ) {

            setPracticasSeleccionadas(

                practicasSeleccionadas.filter(
                    practicaId =>
                        practicaId !== id
                )

            );

        } else {

            setPracticasSeleccionadas([

                ...practicasSeleccionadas,

                id

            ]);

        }

    };


    // ==========================================
    // CERRAR
    // ==========================================

    const handleClose = () => {

        setPracticasSeleccionadas([]);

        onClose();

    };


    // ==========================================
    // GUARDAR
    // ==========================================

    const handleSubmit = async (e) => {

        e.preventDefault();


        await onSubmit(
            practicasSeleccionadas
        );

    };


    if (!isOpen) return null;


    return (

        <div
            className="
                fixed inset-0
                bg-black/40
                flex items-center justify-center
                z-50
                p-4
            "
        >

            <div
                className="
                    bg-white
                    w-full
                    max-w-lg
                    h-[600px]
                    rounded-2xl
                    shadow-xl
                    relative
                    flex
                    flex-col
                "
            >

                {/* ==================================
                    CERRAR
                ================================== */}

                <button
                    type="button"
                    onClick={handleClose}
                    className="
                        absolute
                        top-4
                        right-4
                        text-slate-400
                        hover:text-red-500
                        transition-colors
                        z-10
                    "
                >

                    <X size={20} />

                </button>


                {/* ==================================
                    ENCABEZADO
                ================================== */}

                <div
                    className="
                        px-8
                        pt-8
                        pb-5
                        flex-shrink-0
                    "
                >

                    <h2
                        className="
                            text-2xl
                            font-extrabold
                            text-slate-800
                            mb-2
                            text-center
                        "
                    >

                        Asignar encuesta

                    </h2>


                    <p
                        className="
                            text-center
                            text-slate-500
                            text-sm
                        "
                    >

                        Seleccione las prácticas donde
                        desea utilizar esta encuesta.

                    </p>

                </div>


                {/* ==================================
                    ENCUESTA
                ================================== */}

                <div
                    className="
                        mx-8
                        mb-5
                        p-4
                        rounded-xl
                        bg-slate-50
                        border
                        border-slate-200
                        flex-shrink-0
                    "
                >

                    <p
                        className="
                            text-xs
                            font-semibold
                            text-slate-400
                            uppercase
                            tracking-wide
                            mb-1
                        "
                    >

                        Encuesta

                    </p>


                    <p
                        className="
                            font-bold
                            text-slate-800
                        "
                    >

                        {
                            encuesta?.titulo ||
                            "Sin título"
                        }

                    </p>


                    <p
                        className="
                            text-sm
                            text-slate-500
                            mt-1
                        "
                    >

                        Dirigida a:{" "}

                        <span className="font-medium">

                            {
                                encuesta?.rol ||
                                encuesta?.Role?.nombre ||
                                "Sin rol"
                            }

                        </span>

                    </p>

                </div>


                {/* ==================================
                    LISTA DE PRÁCTICAS
                ================================== */}

                <form
                    onSubmit={handleSubmit}
                    className="
                        flex
                        flex-col
                        flex-1
                        min-h-0
                    "
                >

                    <div
                        className="
                            px-8
                            mb-2
                            flex-shrink-0
                        "
                    >

                        <p
                            className="
                                text-sm
                                font-bold
                                text-slate-700
                            "
                        >

                            Prácticas disponibles

                        </p>

                    </div>


                    <div
                        className="
                            px-8
                            overflow-y-auto
                            flex-1
                            min-h-0
                            space-y-2
                        "
                    >

                        {

                            practicas.length === 0

                                ?

                                (

                                    <div
                                        className="
                                            border
                                            border-dashed
                                            border-slate-300
                                            rounded-xl
                                            p-6
                                            text-center
                                            text-sm
                                            text-slate-400
                                        "
                                    >

                                        No hay prácticas disponibles.

                                    </div>

                                )

                                :

                                (

                                    practicas.map(
                                        practica => {

                                            const seleccionada =
                                                practicasSeleccionadas.includes(
                                                    practica.id
                                                );

                                            return (

                                                <label
                                                    key={
                                                        practica.id
                                                    }
                                                    className={`
                                                        flex
                                                        items-center
                                                        gap-3
                                                        border
                                                        rounded-xl
                                                        p-3
                                                        cursor-pointer
                                                        transition-colors
                                                        ${seleccionada
                                                            ? "border-red-300 bg-red-50"
                                                            : "border-slate-200 hover:bg-slate-50"
                                                        }
                                                    `}
                                                >

                                                    <input
                                                        type="checkbox"
                                                        checked={
                                                            seleccionada
                                                        }
                                                        onChange={() =>
                                                            handleCheck(
                                                                practica.id
                                                            )
                                                        }
                                                        className="
                                                            sr-only
                                                        "
                                                    />


                                                    <span
                                                        className={`
                                                            w-5
                                                            h-5
                                                            rounded-md
                                                            border-2
                                                            flex
                                                            items-center
                                                            justify-center
                                                            flex-shrink-0
                                                            transition-colors
                                                            ${seleccionada
                                                                ? "bg-[#e8192c] border-[#e8192c] text-white"
                                                                : "border-slate-300 bg-white"
                                                            }
                                                        `}
                                                    >

                                                        {
                                                            seleccionada && (
                                                                <Check
                                                                    size={13}
                                                                    strokeWidth={3}
                                                                />
                                                            )
                                                        }

                                                    </span>


                                                    <div
                                                        className="
                                                            min-w-0
                                                        "
                                                    >

                                                        <p
                                                            className="
                                                                font-medium
                                                                text-slate-700
                                                                truncate
                                                            "
                                                        >

                                                            {
                                                               `Práctica ${practica.Periodo.nombre}` ||
                                                                `Práctica ${practica.Periodo.nombre}`
                                                            }

                                                        </p>


                                                        {
                                                            practica.descripcion && (

                                                                <p
                                                                    className="
                                                                        text-xs
                                                                        text-slate-400
                                                                        truncate
                                                                    "
                                                                >

                                                                    {
                                                                        practica.descripcion
                                                                    }

                                                                </p>

                                                            )

                                                        }

                                                    </div>

                                                </label>

                                            );

                                        }
                                    )

                                )

                        }

                    </div>


                    {/* ==================================
                        BOTONES
                    ================================== */}

                    <div
                        className="
                            px-8
                            pt-5
                            pb-8
                            flex
                            justify-end
                            gap-3
                            flex-shrink-0
                        "
                    >

                        <button
                            type="button"
                            onClick={handleClose}
                            className="
                                px-5
                                py-2
                                rounded-xl
                                bg-slate-200
                                hover:bg-slate-300
                                text-slate-700
                                transition-colors
                            "
                        >

                            Cancelar

                        </button>


                        <button
                            type="submit"
                            className="
                                px-5
                                py-2
                                rounded-xl
                                bg-[#e8192c]
                                text-white
                                hover:bg-[#c8111f]
                                transition-colors
                            "
                        >

                            Guardar

                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}

