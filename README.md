# hackstate_by_mazupa
Para el correcto funcionamiento de la aplicación se deben seguir los siguientes pasos:

## 1. BACKEND
En primer lugar, se debe **ingresar a la carpeta `backend/`**, de lo contrario no se podrá correr el servidor. Desde este punto en esta sección, al hablar de la raíz del proyecto, nos referimos a esta carpeta.

Una vez dentro, se deben instalar todas las dependencias necesarias con el comando 
```
yarn install
```

Las variables de entorno necesarias para correr la aplicación son `PORT=XXXX` y  `API_KEY=LLAVE_SECRETA_GEMINI` las cuales se debe agregar en el archivo `.env` en la raíz del proyecto.

Para iniciar el servidor, se debe ejecutar el siguiente comando
```
yarn dev
```
el cual entregará en consola la dirección local donde se está corriendo el servidor.

## 2. FRONTEND
En primer lugar, se debe **ingresar a la carpeta `frontend/mazupa/`**, de lo contrario no se podrá correr el servidor. Desde este punto en esta sección, al hablar de la raíz del proyecto, nos referimos a esta carpeta.

Una vez dentro, se deben instalar todas las dependencias necesarias con el comando 
```
yarn install
```

La variable de entorno necesaria para correr la aplicación `VITE_BACKEND_URL=URL_BACKEND` (ej: http://localhost:3000) la cual se debe agregar en el archivo `.env` en la raíz del proyecto. Esto nos permite conectarnos a la API del backend.

Para iniciar el servidor, se debe ejecutar el siguiente comando
```
yarn dev
```
el cual entregará en consola la dirección local donde se está corriendo el servidor.

## CONSIDERACIONES
1. Como MVP, para ver la malla solo funciona si se selecciona como major "Major Ingeniería de Software" y como minor "Minor de Profundidad en Data Science y Analytics". A futuro debería hacerse la mejora para que funcione para todos los majors y minores, e incluso considerar el Título.
2. Para la API_KEY del backend, deben cada uno generar su propia llave en https://aistudio.google.com/apps