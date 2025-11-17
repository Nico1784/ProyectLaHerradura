
let carrito = JSON.parse(localStorage.getItem("carrito"))

if(carrito==null){
  carrito=[]
  localStorage.setItem("carrito",JSON.stringify(carrito))
}

let productos=[]




//FUNCIONES PRINCIPALES CONECCION SERVIDOR + CARGAR PRODUCTOS AL HTML 

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
                <p class="tarjeta-descripcion">$${formatoMiles(prod.precio)}</p>
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
                <p class="tarjeta-descripcion">$${formatoMiles(prod.precio)}</p>
                <button class="btnAgregar" >Agregar Carrito</button >
            </div>`
  })

  contenedorProductos.innerHTML=inner

}

}


//FUNCIONES CARRITO

async function agregarCarrito(id) {

  for (let producto of productos) {

    if (producto.id === id) {

      let cantidad = await promptSweet(`Ingresar Cantidad ${producto.nombre}`);

         // Si canceló, cortar acá
        if (cantidad === false) {
          alertaWarning("Operación Cancelada");
          return;
        }
          
        if (!validaInt(cantidad)) {
           alertaWarning("Caracter No válido");
           return; //  cortar ejecución
        }

      cantidad = parseInt(cantidad);

      let subtotal = producto.precio * cantidad;

         carrito.push({
          id: producto.id,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: cantidad,
          subtotal: subtotal
        });

        localStorage.setItem("carrito", JSON.stringify(carrito));

        alertaExitosa(`Se agregó:\n${producto.nombre} — Cantidad: ${cantidad}`);
      
    }
  }
}



function mostrarCarrito(){

     
    if (carrito.length === 0) {

     alerta("El Carrito esta Vacío")

     document.getElementById("carritoOverlay").style.display = "none"

    } else {
      
       let lista = document.getElementById("listaCarrito");

       lista.innerHTML = ""; // limpio antes de cargar

       let totalcarrito= carrito.reduce((acumulador,producto)=>{
            return acumulador+producto.subtotal
          },0)


        carrito.forEach((p, i) => {
      
         lista.innerHTML += `

         <div class="item-carrito">
           <p><strong>${i + 1}. ${p.nombre}. ID: ${p.id}</strong></p>
           <p>Precio: $${formatoMiles(p.precio)} — Cantidad: ${p.cantidad} — Subtotal: $${formatoMiles(p.subtotal)}</p>
           <hr>
         </div>
          `;

         });

          lista.innerHTML += `<h2>Total Carrito $${formatoMiles(totalcarrito)}</h2>`

          document.getElementById("carritoOverlay").style.display = "flex";   
          // Cerrar el carrito
          document.getElementById("cerrarCarrito").addEventListener("click", () => {

          document.getElementById("carritoOverlay").style.display = "none";  // desactivo overlay
       });


       
     }

  
}


async function eliminarProductocarrito() {

  let id = await promptSweet("Ingresar Número de ID del producto que desea eliminar");

  if (id === false) {
    alertaWarning("Operación Cancelada");
    return; //  cortar ejecución
  }

  id = parseInt(id);

  if (!validaID(carrito, id)) {
    alertaWarning("Producto No Encontrado");
    return; //  cortar ejecución
  }

  carrito = carrito.filter(producto => producto.id !== id);

  localStorage.setItem("carrito", JSON.stringify(carrito));

  alerta("Producto Eliminado Correctamente");

  mostrarCarrito();
}


function restarCantidad(){


  let id=parseInt(prompt("Ingrese Id Del Producto"))

  let cantidad=parseInt(prompt("Ingrese Cantidad A eliminar"))


let producto= carrito.find(p=> p.id===id)

if(!producto){
  alert("No existe en el Carrito")
}

if (!validaInt(cantidad)){
  alert("Caracter No Válido")
}

//Resto Cantidad
producto.cantidad-=cantidad
//Si llega a 0 , eliminar producto

if(producto.cantidad<=0){

  carrito=carrito.filter(p=>p.id!==id)

  localStorage.setItem("carrito", JSON.stringify(carrito))

}

mostrarCarrito()





}

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



   if (carrito.length === 0) {

      lista.innerHTML = "<p>El carrito está vacío</p>";

    } else {
              let totalcarrito= carrito.reduce((acumulador,producto)=>{
               return acumulador+producto.subtotal
               },0)
              
               let confirmacion= await confirmSweet(`Desea Adquirir el Carrito?\nTotal Carrito: $${formatoMiles(totalcarrito)}`)

             


              if(confirmacion){
               
                 carrito=[]
                 localStorage.setItem("carrito",JSON.stringify(carrito))
                 
                 document.getElementById("carritoOverlay").style.display = "none"
                 alerta("Carrito Procesado Correctamente. Gracias por su compra")
                 
                
                 //console.log(carrito)
               }
            }   
}



///FUNCIONES PARA VALIDACIONES 

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

//FUNCIONES AUXILIARES 

function formatoMiles(numero) {
  return numero.toLocaleString("es-AR");
}


// FUNCIONES CREACION ALERTAS 

function alertaExitosa(texto){
  Swal.fire({
  title: texto,
  icon: "success",
  draggable: true,
  theme: 'dark',
  customClass: {
    popup: 'mi-popup',
    title: 'mi-titulo',
    htmlContainer: 'mi-texto',
    confirmButton: 'mi-boton'
  }
});

}

function alerta(texto){
   Swal.fire({
     title: texto,
     draggable: true,
     theme: 'dark'
});
}

function alertaWarning(texto){
  Swal.fire({
  title: texto,
  icon: "warning",
  draggable: true,
  theme: 'dark'
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
    cancelButtonText: "Cancelar"
  });

  if (result.isConfirmed) {
    return result.value;
       // lo que escribió el usuario
  } else {
     return false;           // si canceló
  }
}

async function confirmSweet(mensaje) {

   const result = await Swal.fire({
    title: mensaje,
    theme:"dark",
    showCancelButton: true,
    confirmButtonText: "Aceptar",
    cancelButtonText: "Cancelar"
  });
  
 
  if (result.isConfirmed) {
 
    return true;  
  } else {
    alertaWarning("Operacion Cancelada");           // si canceló
  }
}






////// **EJECUCION DEL CODIGO** //////


//0) CONECCION +CARGAR HTML 
 coneccionServidor()

//1) HACER CLICK PARA AGREGAR CARRITO
   document.addEventListener("click", (e) => {
    
        if (e.target.classList.contains("btnAgregar")) {

           const tarjeta = e.target.closest(".tarjeta");

           const id = parseInt(tarjeta.dataset.id);

           agregarCarrito(id);
          }
   });

//2) MOSTRA EN VENTANA FLOTANTE CARRITO 

 document.getElementById("btnCarrito").addEventListener("click", () => { mostrarCarrito()});

//3) ELIMINAR PRODUCTO CARRITO
  
  document.getElementById("btneliminarProd").addEventListener("click", () => {eliminarProductocarrito() });

//4) CONFIRMAR CARRITO 

  document.getElementById("btnConfirmar").addEventListener("click", () => {confirmarCarrito() });

  document.getElementById("btnVaciar").addEventListener("click", () => {vaciarCarrito() });

  document.getElementById("btnRestar").addEventListener("click", () => {restarCantidad() });
  



