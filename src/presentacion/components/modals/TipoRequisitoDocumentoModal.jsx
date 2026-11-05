import { useEffect, useState } from "react";
import { X, FileText } from "lucide-react";
import { toast } from "react-hot-toast";


export default function TipoRequisitoDocumentoModal({

    isOpen,
    onClose,
    onSubmit,
    requisito,
    roles

}) {

    const [formData, setFormData] = useState({

        nombre: "",
        descripcion: "",
        rol_id: "",
        obligatorio: true,
        estado: true,
        archivo: null

    });


    const [archivoSeleccionado, setArchivoSeleccionado] =
        useState(null);


    useEffect(() => {

        if (!isOpen)
            return;


        if (requisito) {

            setFormData({

                id: requisito.id,

                nombre:
                    requisito.nombre || "",

                descripcion:
                    requisito.descripcion || "",

                rol_id:
                    requisito.rol_id || "",

                obligatorio:
                    requisito.obligatorio ?? true,

                estado:
                    requisito.estado ?? true,

                archivo: null

            });

            setArchivoSeleccionado(null);

        } else {

            setFormData({

                nombre: "",
                descripcion: "",
                rol_id: "",
                obligatorio: true,
                estado: true,
                archivo: null

            });

            setArchivoSeleccionado(null);

        }

    }, [isOpen, requisito]);


    if (!isOpen)
        return null;


    const handleChange = (e) => {

        const {
            name,
            value,
            type,
            checked
        } = e.target;


        setFormData(prev => ({

            ...prev,

            [name]:
                type === "checkbox"
                    ? checked
                    : value

        }));

    };


    const handleFileChange = (e) => {

        const file = e.target.files?.[0];

        if (!file)
            return;

        const tiposPermitidos = [
            "application/pdf",
            "application/msword",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ];

        if (!tiposPermitidos.includes(file.type)) {

            toast.error(
                "Solo se permiten archivos PDF, Word (.doc) o Word (.docx)."
            );

            e.target.value = "";
            return;
        }

        const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

        if (file.size > MAX_FILE_SIZE) {

            toast.error(
                "El documento es demasiado pesado. El tamaño máximo permitido es de 2MB."
            );

            e.target.value = "";
            return;
        }

        setArchivoSeleccionado(file);

        setFormData(prev => ({
            ...prev,
            archivo: file
        }));

    };


    const handleSubmit = (e) => {

        e.preventDefault();


        onSubmit(
            formData
        );

    };


    return (

        <div
            className="
                fixed
                inset-0
                z-50
                flex
                items-center
                justify-center
                bg-black/50
                px-4
            "
        >

            <div
                className="
                    w-full
                    max-w-2xl
                    max-h-[90vh]
                    overflow-y-auto
                    rounded-2xl
                    bg-white
                    shadow-xl
                "
            >

                <div
                    className="
                        flex
                        items-center
                        justify-between
                        border-b
                        px-6
                        py-4
                    "
                >

                    <h2
                        className="
                            text-xl
                            font-bold
                            text-slate-800
                        "
                    >
                        {
                            requisito
                                ? "Editar tipo de requisito"
                                : "Nuevo tipo de requisito"
                        }
                    </h2>


                    <button
                        type="button"
                        onClick={onClose}
                        className="
                            rounded-lg
                            p-2
                            text-slate-500
                            hover:bg-slate-100
                        "
                    >

                        <X size={22} />

                    </button>

                </div>


                <form
                    onSubmit={handleSubmit}
                    className="p-6 space-y-5"
                >

                    <div>

                        <label
                            className="
                                block
                                mb-2
                                text-sm
                                font-semibold
                                text-slate-700
                            "
                        >
                            Nombre del documento
                        </label>


                        <input
                            type="text"
                            name="nombre"
                            value={formData.nombre}
                            onChange={handleChange}
                            required
                            className="
                                w-full
                                rounded-xl
                                border
                                p-3
                                focus:outline-none
                                focus:ring-2
                                focus:ring-[#e8192c]
                            "
                            placeholder="Ej. Plan de trabajo"
                        />

                    </div>


                    <div>

                        <label
                            className="
                                block
                                mb-2
                                text-sm
                                font-semibold
                                text-slate-700
                            "
                        >
                            Descripción
                        </label>


                        <textarea
                            name="descripcion"
                            value={
                                formData.descripcion
                            }
                            onChange={handleChange}
                            rows={4}
                            className="
                                w-full
                                rounded-xl
                                border
                                p-3
                                resize-none
                                focus:outline-none
                                focus:ring-2
                                focus:ring-[#e8192c]
                            "
                            placeholder="Descripción del requisito documental"
                        />

                    </div>


                    <div>

                        <label
                            className="
                                block
                                mb-2
                                text-sm
                                font-semibold
                                text-slate-700
                            "
                        >
                            Rol
                        </label>


                        <select
                            name="rol_id"
                            value={formData.rol_id}
                            onChange={handleChange}
                            required
                            className="
                                w-full
                                rounded-xl
                                border
                                p-3
                                focus:outline-none
                                focus:ring-2
                                focus:ring-[#e8192c]
                            "
                        >

                            <option value="">
                                Seleccione un rol
                            </option>


                            {
                                roles.map(
                                    rol => (

                                        <option
                                            key={rol.id}
                                            value={rol.id}
                                        >
                                            {rol.nombre}
                                        </option>

                                    )
                                )
                            }

                        </select>

                    </div>


                    <div>

                        <label
                            className="
                                block
                                mb-2
                                text-sm
                                font-semibold
                                text-slate-700
                            "
                        >
                            Plantilla
                        </label>


                        <label
                            className="
                                flex
                                cursor-pointer
                                items-center
                                gap-3
                                rounded-xl
                                border
                                border-dashed
                                p-4
                                hover:bg-slate-50
                            "
                        >

                            <FileText
                                size={24}
                                className="text-slate-500"
                            />


                            <div>

                                <p
                                    className="
                                        text-sm
                                        font-semibold
                                        text-slate-700
                                    "
                                >
                                    Seleccionar plantilla
                                </p>




                            </div>


                            <input
                                type="file"
                                accept="application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                                onChange={
                                    handleFileChange
                                }
                                className="hidden"
                            />

                        </label>


                        {
                            archivoSeleccionado && (

                                <p
                                    className="
                                        mt-2
                                        text-sm
                                        text-slate-600
                                    "
                                >
                                    Archivo seleccionado:{" "}
                                    <span
                                        className="font-semibold"
                                    >
                                        {
                                            archivoSeleccionado.name
                                        }
                                    </span>
                                </p>

                            )
                        }


                        {
                            !archivoSeleccionado &&
                            requisito?.plantilla && (

                                <p
                                    className="
                                        mt-2
                                        text-sm
                                        text-green-600
                                    "
                                >
                                    Ya existe una plantilla
                                    asociada.
                                </p>

                            )
                        }

                    </div>


                    <div
                        className="
                            flex
                            flex-col
                            gap-4
                            sm:flex-row
                            sm:gap-8
                        "
                    >

                        <label
                            className="
                                flex
                                items-center
                                gap-3
                                cursor-pointer
                            "
                        >

                            <input
                                type="checkbox"
                                name="obligatorio"
                                checked={
                                    formData.obligatorio
                                }
                                onChange={handleChange}
                                className="
                                    h-4
                                    w-4
                                "
                            />

                            <span
                                className="
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                "
                            >
                                Documento obligatorio
                            </span>

                        </label>


                        <label
                            className="
                                flex
                                items-center
                                gap-3
                                cursor-pointer
                            "
                        >

                            <input
                                type="checkbox"
                                name="estado"
                                checked={
                                    formData.estado
                                }
                                onChange={handleChange}
                                className="
                                    h-4
                                    w-4
                                "
                            />

                            <span
                                className="
                                    text-sm
                                    font-semibold
                                    text-slate-700
                                "
                            >
                                Activo
                            </span>

                        </label>

                    </div>


                    <div
                        className="
                            flex
                            justify-end
                            gap-3
                            border-t
                            pt-5
                        "
                    >

                        <button
                            type="button"
                            onClick={onClose}
                            className="
                                rounded-xl
                                border
                                px-5
                                py-2.5
                                font-semibold
                                text-slate-600
                                hover:bg-slate-50
                            "
                        >
                            Cancelar
                        </button>


                        <button
                            type="submit"
                            className="
                                rounded-xl
                                bg-[#e8192c]
                                px-5
                                py-2.5
                                font-semibold
                                text-white
                                hover:bg-red-700
                            "
                        >
                            {
                                requisito
                                    ? "Actualizar"
                                    : "Crear"
                            }
                        </button>

                    </div>

                </form>

            </div>

        </div>

    );

}