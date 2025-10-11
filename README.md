# TPI-DS2025
Esto instala el cliente oficial de Supabase que te permitirá conectarte a la base de datos.
DENTRO DE LA CARPETA back-end en la consola ingresar
npm install @supabase/supabase-js
Necesitan seguir estos dos pasos para sincronizarlo:

PASOS PARA AÑADIR EL SUBMODULO 

  Paso 1: Actualizar el repositorio principal

  Primero, deben obtener los últimos cambios de tu repositorio, lo que incluirá el commit que agregó el submódulo. Esto se hace con git 
  pull.

   1 git pull

  Después de este paso, verán la carpeta 2025-TPI (o como se llame el submódulo), pero estará vacía. También tendrán el archivo .gitmodules 
  actualizado.

  Paso 2: Inicializar y descargar el submódulo

  A continuación, necesitan decirle a Git que inicialice los submódulos locales y descargue su contenido. El siguiente comando hace ambas 
  cosas:

   1 git submodule update --init

   * --init: Inicializa los submódulos que son nuevos para el repositorio local (lee el archivo .gitmodules).
   * update: Clona los archivos del repositorio del submódulo y los deja en la versión (commit) exacta que tú registraste en el repositorio 
     principal.

  Resumen para ellos:

  Simplemente necesitan ejecutar estos dos comandos en orden:

   1 git pull
   2 git submodule update --init

  Con eso, su copia del repositorio estará completamente sincronizada, incluyendo el contenido del submódulo.
