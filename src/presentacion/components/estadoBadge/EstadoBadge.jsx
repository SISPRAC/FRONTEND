import { ESTADOS_CONFIG } from "../../shared/constans/estados";

const EstadoBadge = ({ estado, size = "md" }) => {

    const normalizarEstado = (valor) => {
        if (!valor) return "Disponible";

        return valor.charAt(0).toUpperCase() + valor.slice(1).toLowerCase();
    };


    const estadoMostrar = normalizarEstado(estado);

    const key = estadoMostrar.toLowerCase();


    const config =
        Object.entries(ESTADOS_CONFIG)
            .find(([nombre]) => nombre.toLowerCase() === key)?.[1]
        ?? ESTADOS_CONFIG.Disponible;


    const sizes = {
        sm: {
            container: "px-2 py-0.5 text-[11px] gap-1",
            dot: "w-1 h-1"
        },

        md: {
            container: "px-2.5 py-1 text-xs gap-1.5",
            dot: "w-1.5 h-1.5"
        },

        lg: {
            container: "px-3 py-1.5 text-sm gap-2",
            dot: "w-2 h-2"
        }
    };


    const currentSize = sizes[size];


    return (
        <span
            className={`
                inline-flex items-center
                rounded-full
                font-semibold
                ${currentSize.container}
                ${config.bg}
                ${config.text}
            `}
        >

            <span
                className={`
                    rounded-full
                    ${currentSize.dot}
                    ${config.dot}
                `}
            />

            {estadoMostrar}

        </span>
    );
};


export default EstadoBadge;