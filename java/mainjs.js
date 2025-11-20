
let carrito = JSON.parse(localStorage.getItem("carrito"))

if(carrito==null){
  carrito=[]
  localStorage.setItem("carrito",JSON.stringify(carrito))
}

let productos=[]



//FUNCIONES PRINCIPALES CONECCION SERVIDOR + CARGAR PRODUCTOS AL HTML //////////

async function coneccionServidor() {
    try {
        let res = await fetch("../../prods.json");
        let data = await res.json();
        productos = data;
        cargarProd();
    } catch (error) {
        alertaWarning("Error conexión Servidor");
        console.log(error);
    }
}

 function cargarProd(){

let rubro= document.body.dataset.rubro // Identifico la Pagina 

if (rubro==="HerramientaElectrica"){    

  let productosfiltrados=  productos.filter((prod => prod.rubro === rubro))

  let contenedorProductos= document.getElementById("contenedorProductos")

  let inner=""

  productosfiltrados.forEach((prod,i)=>{

   inner += ` <div class="tarjeta producto${i+1}" data-id="${prod.id}">
                <p class="titulo-tarjeta">${prod.nombre}</p>
                <img class="img-tarjeta" src="../img/Herramientas Electricas/${prod.img}" alt="${prod.nombre}">
                <p class="tarjeta-descripcion">${prod.descrip}</p>
                <p class="tarjeta-precio">$${formatoMiles(prod.precio)}</p>
                <button class="btnAgregar" >Agregar Carrito</button >
            </div>`
 })

   contenedorProductos.innerHTML=inner


}else if(rubro==="HerramientaManual"){


  let productosfiltrados=  productos.filter((prod=>prod.rubro===rubro))

  let contenedorProductos= document.getElementById("contenedorProductos")

  let inner=""

  productosfiltrados.forEach((prod,i)=>{

   inner += ` <div class="tarjeta producto${i+1}" data-id="${prod.id}">
                <p class="titulo-tarjeta">${prod.nombre}</p>
                <img class="img-tarjeta" src="../img/Herramientas Manuales/${prod.img}" alt="${prod.nombre}">
                <p class="tarjeta-descripcion">${prod.descrip}</p>
                <p class="tarjeta-precio">$${formatoMiles(prod.precio)}</p>
                <button class="btnAgregar" >Agregar Carrito</button >
            </div>`
  })
  contenedorProductos.innerHTML=inner

}

}


//FUNCIONES DOM DEL CARRITO //////////

async function agregarCarrito(id) {
       
  let producto=  productos.find((prod)=>(prod.id===id)) 

  let cantidad = await promptSweet(`Ingresar Cantidad ${producto.nombre}`);

         // Si canceló, cortar acá
        if (cantidad === false) {
          alertaWarning("Operación Cancelada");
          return;
        }
          
        if (!validaInt(cantidad)) {
           alertaWarning("Caracter No válido");
           return; 
        }

   cantidad = parseInt(cantidad);

   let item = carrito.find((prod)=>(prod.id===id)) // Valido existencia en carrito*/

   let subtotal=0

        if(item){  // Si existe solo sumo a la cantidad ya cargada */

          item.cantidad+=cantidad

          item.subtotal = item.precio * cantidad

          alertaExitosa(`Se agregó:\n•${item.nombre}\n•Cantidad Agregada: ${cantidad}\n•Cantidad Total: ${item.cantidad}`);
          
        }else{      // Producto No existe, se agrega al carrito. */

           subtotal = producto.precio * cantidad;
    
             carrito.push({
              id: producto.id,
              nombre: producto.nombre,
              precio: producto.precio,
              cantidad: cantidad,
              subtotal: subtotal
            });
            alertaExitosa(`Se agregó:\n•${producto.nombre}\n•Cantidad: ${cantidad}`);
          }
          
     localStorage.setItem("carrito", JSON.stringify(carrito));

}


function mostrarCarrito(){

    if (carrito.length === 0) {

     alerta("El Carrito esta Vacío")

     document.getElementById("carritoOverlay").style.display = "none" /*Desactivo Ventana Flotante*/

    } else {
      
       let lista = document.getElementById("listaCarrito");

       lista.innerHTML = ""; // limpio antes de cargar

       let totalcarrito= carrito.reduce((acumulador,producto)=>{
            return acumulador+producto.subtotal
          },0)


        carrito.forEach((p, i) => {
      
         lista.innerHTML += `
         <div class="item-carrito">

              <div class="item-descripcion">

               <p class="strong">${i + 1}. ${p.nombre}. ID:${p.id}-</p> 

               <p>Precio: $${formatoMiles(p.precio)} — Cantidad: ${p.cantidad} — Subtotal: $${formatoMiles(p.subtotal)}</p>

              </div>

              <div class="btnSecundarios">
                  <button class="btnCarritoSecundario" id="btnSuma" data-id="${p.id}">➕</button>
                  <button class="btnCarritoSecundario" id="btnRestar" data-id="${p.id}">➖</button>
                  <button class="btnCarritoSecundario" id="btnEliminarProd" data-id="${p.id}">🗑️</button>
              </div>
           </div>
           <hr>

          `;

         });

          lista.innerHTML += `<h2>Total Carrito $${formatoMiles(totalcarrito)}</h2>`

          document.getElementById("carritoOverlay").style.display = "flex";  // Activo el overlay 
         
          document.getElementById("cerrarCarrito").addEventListener("click", () => {  // Cerrar el carrito//

               document.getElementById("carritoOverlay").style.display = "none";  // desactivo overlay
           });
     }
}


//FUNCIONES BOTONES SECUNDARIOS CARRITO //////////

async function eliminarProductocarrito(id) {

 let item= carrito.find((item)=>item.id===id)

 let confirmacion = await confirmSweet(`Estas Seguro Eliminar: ${item.nombre} del Carrito?` )

 if (confirmacion === true) {
  
   carrito = carrito.filter(producto => producto.id !== id);
 
   localStorage.setItem("carrito", JSON.stringify(carrito));
 
   alerta("Producto Eliminado Correctamente");
 
   mostrarCarrito();
 }

}


async function restarCantidad(id){

  let item= carrito.find((item)=>item.id===id)

  let cantidad = await promptSweet(`Ingresar Cantidad que desea Eliminar\nProducto: ${item.nombre}`);

         // Si canceló, cortar acá
        if (cantidad === false) {
          alertaWarning("Operación Cancelada");
          return;
        }
          
        if(!validaInt(cantidad)){
          alertaWarning("Caracter No Válido")
          return;
        }

        cantidad = parseInt(cantidad);


   if(item.cantidad<=cantidad){ 
         alertaWarning(`Cantidad que Desea Eliminar Superior Igual a la existente\n •Producto: ${item.nombre}\n•Cantidad Cargada: ${item.cantidad} `)

   }else{

      item.cantidad-=cantidad //Resto Cantidad
      item.subtotal=item.cantidad*item.precio
      alertaExitosa("Cantidad Eliminada Correctamente")
   }

  mostrarCarrito()

}


async function sumarCantidad(id){

  let item= carrito.find((item)=>item.id===id)

  let cantidad = await promptSweet(`Ingresar Cantidad que desea Agregar\nProducto: ${item.nombre}`);

         // Si canceló, cortar acá
        if (cantidad === false) {
          alertaWarning("Operación Cancelada");
          return;
        }
          
        if(!validaInt(cantidad)){
          alertaWarning("Caracter No Válido")
          return;
        }

        cantidad = parseInt(cantidad);

   

      item.cantidad+=cantidad 

      item.subtotal=item.cantidad*item.precio

      alertaExitosa(`Operación Exitosa\n •Producto: ${item.nombre}\n•Cantidad Agregada: ${cantidad}\n•Cantidad Total: ${item.cantidad} `)

  mostrarCarrito()

}


///FUNCIONES PRINCIPALES CARRITO //////////

async function vaciarCarrito(){

   let lista = document.getElementById("listaCarrito");

     lista.innerHTML = ""; // limpio antes de cargar

     if (carrito.length === 0) {

      lista.innerHTML = "<p>El carrito está vacío</p>";
    }

    let confirmacion= await confirmSweet("Desea eliminar todos los productos?")

    if(confirmacion){
      carrito=[]
      localStorage.setItem("carrito", JSON.stringify(carrito))

      alertaExitosa("Todos Productos Fueron eliminados")

      document.getElementById("carritoOverlay").style.display = "none"

    }else{
      mostrarCarrito()
    }

      
  
}


async function confirmarCarrito(){

 let totalcarrito= carrito.reduce((acumulador,producto)=>{
       return acumulador+producto.subtotal
        },0)
              
 let confirmacion= await confirmSweet(`Desea Adquirir el Carrito?\nTotal Carrito: $${formatoMiles(totalcarrito)}`)

  if(confirmacion){
               
    carrito=[]
    localStorage.setItem("carrito",JSON.stringify(carrito))

    document.getElementById("carritoOverlay").style.display = "none"

    alertaExitosa("Carrito Procesado Correctamente. Gracias por su compra")
  }   
}



///FUNCIONES PARA VALIDACIONES //////////

function validaID(arreglo, id) {
  return arreglo.some(prod => prod.id === id);
}

function validaInt(valor) {

  //Elimino espacios en blanco
  valor=valor.trim()
  
  //Convierto en numero , si valor= "5", lo convierte en number, caso contrario va a dar Nan
  const numero = Number(valor);

  // Validamos:
  // 1) No es string vacío ni solo espacios
  // 2) No es NaN
  // 3) Es entero
 
  if(valor !== "" && !isNaN(numero) && Number.isInteger(numero)){

    return true
  }
  return false
}

//FUNCIONES AUXILIARES //////////

function formatoMiles(numero) {
  return numero.toLocaleString("es-AR");
}


///FUNCIONES CREACION ALERTAS //////////

function alertaExitosa(texto){
  Swal.fire({
  title: texto,
  icon: "success",
  draggable: true,
  theme: 'dark',
  customClass: {  //Estilo css//
    popup: 'mi-popup',
    title: 'mi-titulo',
    htmlContainer: 'mi-texto',
    confirmButton: 'mi-boton'
  }
});

}

function alerta(texto){
   Swal.fire({
    icon: "info", 
    title: texto,
     draggable: true,
     theme: 'dark',
      customClass: {  //Estilo css//
    popup: 'mi-popup',
    title: 'mi-titulo',
    htmlContainer: 'mi-texto',
    confirmButton: 'mi-boton btn-azul'
  }
});
}

function alertaWarning(texto){
  Swal.fire({
  title: texto,
  icon: "warning",
  draggable: true,
  theme: 'dark',
  customClass: {  //Estilo css//
    popup: 'mi-popup',
    title: 'mi-titulo',
    htmlContainer: 'mi-texto',
    confirmButton: 'mi-boton btn-azul'
  }
  
  
});


}

async function promptSweet(mensaje) {

   const result = await Swal.fire({
    title: mensaje,
    input: "text",
    theme:"dark",
    inputPlaceholder: "",
    showCancelButton: true,
    confirmButtonText: "Aceptar",
    cancelButtonText: "Cancelar",

    customClass: {  //Estilo css//
    popup: 'mi-popup',
    title: 'mi-titulo',
    htmlContainer: 'mi-texto',
    confirmButton: 'mi-boton btn-azul'
  }
  });

  if (result.isConfirmed) {
    return result.value;
       // lo que escribió el usuario
  } else {
     return false;  // si canceló
  }
}

async function confirmSweet(mensaje) {

   const result = await Swal.fire({
    title: mensaje,
    theme:"dark",
    showCancelButton: true,
    confirmButtonText: "Aceptar",
    cancelButtonText: "Cancelar",
    
     customClass: {  //Estilo css//
     popup: 'mi-popup',
     title: 'mi-titulo',
     htmlContainer: 'mi-texto',
     confirmButton: 'mi-boton btn-azul'
  }

  });
  
 
  if (result.isConfirmed) {
 
    return true;  
  } else {
    alertaWarning("Operacion Cancelada"); // si canceló
  }
}



////// **EJECUCION DEL CODIGO** //////



//0) CONECCION + CARGAR HTML //////
 coneccionServidor()

//1) HACER CLICK PARA AGREGAR CARRITO //////

 document.addEventListener("click", (e) => {
    
        if (e.target.classList.contains("btnAgregar")) {   // El btn se genera despues del DOM , por eso no puedo usar getelementbyID

           const tarjeta = e.target.closest(".tarjeta");

           const id = parseInt(tarjeta.dataset.id);

           agregarCarrito(id);
          }
   });

//2) MOSTRAR EN VENTANA FLOTANTE CARRITO //////

 document.getElementById("btnCarrito").addEventListener("click", () => { mostrarCarrito()});


//3) BOTONES PRINCIPALES CARRITO VACIAR Y CONFIRMAR //////

document.getElementById("btnConfirmar").addEventListener("click", () => {confirmarCarrito() });


document.getElementById("btnVaciar").addEventListener("click", () => {vaciarCarrito() });


//4) BOTONES SECUNDARIOS CARRITO //////


//BOTON SECUNDARIO ELIMINAR PRODUCTO //////
document.addEventListener("click", (e) => { 
                                              // El btn se genera despues del DOM , por eso no puedo usar getelementbyID
  const btn = e.target.closest("#btnEliminarProd"); 
                                           //Escucho todos los click y solo ejecuto aquel que el e.targetcloset=btnEliminarProd
  if (!btn) return;

  const id = parseInt(btn.dataset.id);

  eliminarProductocarrito(id);
});


//BOTON SECUNDARIO RESTAR CANTIDAD //////
document.addEventListener("click", (e) => {  

  const btn = e.target.closest("#btnRestar");    
  
  if (!btn) return;


  const id = parseInt(btn.dataset.id);

  restarCantidad(id);
});


//BOTON SECUNDARIO SUMAR CANTIDAD //////
document.addEventListener("click", (e) => {  

  const btn = e.target.closest("#btnSuma");  

  if (!btn) return;

  const id = parseInt(btn.dataset.id);

  sumarCantidad(id);
});




