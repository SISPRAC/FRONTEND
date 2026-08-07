import { ShieldAlert } from "lucide-react";


export default function NoPermission(){

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">

            <div className="bg-white p-10 rounded-xl shadow text-center">

                <ShieldAlert 
                    size={60}
                    className="mx-auto text-red-500"
                />

                <h1 className="text-3xl font-bold mt-5">
                    Permiso no válido
                </h1>


                <p className="text-gray-600 mt-3">
                    No tienes autorización para acceder a esta sección.
                </p>


                <button
                    onClick={() => window.history.back()}
                    className="mt-6 px-5 py-2 bg-blue-600 text-white rounded-lg"
                >
                    Volver
                </button>


            </div>

        </div>
    )
}