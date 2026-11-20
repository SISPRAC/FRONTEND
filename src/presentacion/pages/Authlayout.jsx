import bg from "../../assets/images/backgrounds/fondo.jpg";
import fondo from "../../assets/images/logo/logo login.png";
import programa from "../../assets/images/logo/Programa_Ingeniería_de_Sistemas.png";

// Marco compartido (fondo + tarjeta + logos) para las pantallas de autenticación
export default function AuthLayout({ children }) {

    return (
        <div
            className="relative h-screen w-full bg-cover bg-center"
            style={{ backgroundImage: `url(${bg})` }}
        >
            {/* Overlay */}
            <div className="absolute inset-0 bg-white/40 flex items-center justify-center">

                {/* Contenedor de los dos divs */}
                <div className="flex gap-6 bg-white/80 p-19 rounded-lg shadow-lg">

                    <div className="w-99 h-99 flex items-center justify-center">
                        {children}
                    </div>

                    {/* Logos */}
                    <div className="ml-5 w-[500px] h-[500px] flex flex-col items-center justify-center gap-6 mt-6 mb-12">

                        <div className="w-96 h-48 flex items-center justify-center">
                            <img
                                className="max-w-full max-h-full object-contain"
                                src={fondo}
                                alt="logo"
                            />
                        </div>

                        <div className="w-24 h-px bg-gray-300" />

                        <div className="w-80 h-40 flex items-center justify-center">
                            <img
                                className="max-w-full max-h-full object-contain"
                                src={programa}
                                alt="Programa de Ingeniería de Sistemas"
                            />
                        </div>

                    </div>

                </div>
            </div>
        </div>
    );
}