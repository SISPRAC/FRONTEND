import { ESTADOS_CONFIG } from "../../shared/constans/estados";

const limpiar = (valor) => valor.replace(/_/g, " ").trim();

const normalizarEstado = (valor) => {
    if (!valor) return "Disponible";

    const limpio = limpiar(valor);

    return limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase();
};

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

const EstadoBadge = ({ estado, size = "md" }) => {

    const estadoMostrar = normalizarEstado(estado);
    const key = estadoMostrar.toLowerCase();

    const config =
        Object.entries(ESTADOS_CONFIG)
            .find(([nombre]) => limpiar(nombre).toLowerCase() === key)?.[1]
        ?? ESTADOS_CONFIG.Disponible;

    const currentSize = sizes[size] || sizes.md;

    return (
        <span
            className={`
                inline-flex items-center
                rounded-full
                font-semibold
                whitespace-nowrap
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