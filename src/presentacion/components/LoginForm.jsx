import bg from "../../assets/images/backgrounds/fondo.jpg"
import fondo from "../../assets/images/logo/logo login.png"
export default function LoginForm({ onSubmit, onChange }) {

  return (
    <div
  className="relative h-screen w-full bg-cover bg-center"
  style={{ backgroundImage: `url(${bg})` }}
>
  {/* Overlay */}
  <div className="absolute inset-0 bg-white/40 flex items-center justify-center">
    {/* Contenedor de los dos divs */}
    <div className="flex gap-6 bg-white/80 p-19 rounded-lg shadow-lg">
      <div className="w-99 h-99 flex items-center justify-center text-white font-bold ">
         <form className="flex flex-col items-center justify-center mt-6 ml-12 mb-12" onSubmit={onSubmit}>
                    <h2 className="text-4xl text-gray-900 font-medium mb-3">Iniciar sesión</h2>
                    <p className="text-sm text-gray-500/90 mt-3 mb-3">¡Bienvenido de nuevo! Por favor, inicia sesión para continuar</p>
        
                    <div className="flex items-center w-full bg-white bg-transparent border border-black-900 h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <svg width="16" height="11" viewBox="0 0 16 11" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" clipRule="evenodd" d="M0 .55.571 0H15.43l.57.55v9.9l-.571.55H.57L0 10.45zm1.143 1.138V9.9h13.714V1.69l-6.503 4.8h-.697zM13.749 1.1H2.25L8 5.356z" fill="#6B7280"/>
                        </svg>
                        <input type="email" name="correo" placeholder="Correo electrónico" className="ml-2 bg-white bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full" required  onChange={onChange} />                 
                    </div>
        
                    <div className="flex items-center mt-6 w-full bg-white bg-transparent border border-black-00 h-12 rounded-full overflow-hidden pl-6 gap-2">
                        <svg width="13" height="17" viewBox="0 0 13 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 8.5c0-.938-.729-1.7-1.625-1.7h-.812V4.25C10.563 1.907 8.74 0 6.5 0S2.438 1.907 2.438 4.25V6.8h-.813C.729 6.8 0 7.562 0 8.5v6.8c0 .938.729 1.7 1.625 1.7h9.75c.896 0 1.625-.762 1.625-1.7zM4.063 4.25c0-1.406 1.093-2.55 2.437-2.55s2.438 1.144 2.438 2.55V6.8H4.061z" fill="#6B7280"/>
                        </svg>
                        <input type="password" name="password" placeholder="Contraseña" className="bg-white ml-2 bg-transparent text-gray-500/80 placeholder-gray-500/80 outline-none text-sm w-full h-full" required onChange={onChange} />                 
                    </div>
        
                    <div className="w-full flex items-center justify-between mt-8 text-gray-500/80">
                        <div className="flex items-center gap-2">
                            <input className="h-5" type="checkbox" id="checkbox" />
                            <label className="text-sm" htmlFor="checkbox">Recuerdame</label>
                        </div>
                        <a className="text-sm underline" href="#">Olvidaste la contraseña?</a>
                    </div>
        
                    <button type="submit" className="mt-8 w-full h-11 rounded-full text-white bg-red-600 hover:opacity-90 transition-opacity">
                        Iniciar sesión
                    </button>

                   {/* <div className="flex items-center gap-4 w-full my-5">
                        <div className="w-full h-px bg-gray-300/90"></div>
                        <p className="w-full text-nowrap text-sm text-gray-500/90">o ingresa con email</p>
                        <div className="w-full h-px bg-gray-300/90"></div>
                    </div>

                    <button type="button" className="w-full bg-white flex items-center justify-center h-12 rounded-full">
                        <img src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleLogo.svg" alt="googleLogo" />
                    </button>*/} 

                    <p className="text-gray-500/90 text-sm mt-4">¿No tienes una cuenta? <a className="text-red-500 hover:underline" href="/registrarCandidato">Registrarse</a></p>
                </form>
      </div>
                <div className=" ml-5 w-[500px] h-[500px] flex items-center justify-center mt-6 mb-12">
                    <img 
                        className="w-full h-full object-cover" 
                        src={fondo} 
                        alt="logo" 
                    />
                    </div>


    </div>
  </div>
</div>

   
  );
}