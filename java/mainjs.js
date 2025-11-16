
let carrito = JSON.parse(localStorage.getItem("carrito"))

if(carrito==null){
  carrito=[]
  localStorage.setItem("carrito",JSON.stringify(carrito))
}




// FUNCIONES PRINCIPALES DEL  DOM 

function cargarProd(){

let rubro= document.body.dataset.rubro // Identifico la Pagina 

if (rubro==="HerramientaElectrica"){    

  let productosfiltrados= productos.filter((prod=>prod.rubro===rubro))

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


  let productosfiltrados= productos.filter((prod=>prod.rubro===rubro))

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

      // Ahora sí convertir
      cantidad = parseInt(cantidad);

      if (validaInt(cantidad)) {

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


async function eliminarProductocarrito(){

  let id =  await promptSweet("Ingresar Número de ID del producto que desea eliminar")
  
 
  if(validaInt(id)){

    alertaWarning("Caracter no Válido")
  }

   if(!id){
   
    alertaWarning("Producto No Encontrado")

  }

   carrito=carrito.filter((producto)=>(producto.id!==id))
             
   alerta("Producto Eliminado Correctamente")

   mostrarCarrito()

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



//SUB FUNCIONES PARA VALIDACIONES 

function validaInt(variable){

     if(!isNaN(variable) && Number.isInteger(variable)){

       return true

     }else {
      return false
      
      
     }  
     
} 


function validaID(arreglo,id){

  let rdo=arreglo.some(prod=>(prod.id===id))
  
  if (rdo){
    return true
  }else if (rdo===false){
    alertaWarning("Op. Cancelada")
  }else{
    alerta("Prducto no encontrado")

  }

}



//FUNCIONES AUXILIARES 

function formatoMiles(numero) {
  return numero.toLocaleString("es-AR");
}






// FUNCIONES CREACION ALERTAS INPUT CONFIRM


function alertaExitosa(texto){
  Swal.fire({
  title: texto,
  icon: "success",
  draggable: true,
  theme: 'dark'
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
    return result.value;   // lo que escribió el usuario
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





//EVENTOS DOM 

  //0) CARGAR LOS PRODUCTOS 

   cargarProd()

  //1) HACER CLICK PARA AGREGAR CARRITO
    const botones = document.querySelectorAll('.btnAgregar');
    botones.forEach(boton => {

    boton.addEventListener('click', e => {

    // Busco el contenedor de la tarjeta donde está el botón
    const tarjeta = e.target.closest('.tarjeta');

    // Leo los atributos del producto
    const id = parseInt(tarjeta.dataset.id)
   
    // Agrego la funcion agregarCarrito
    agregarCarrito(id)
    
    });

   });

  //2) MOSTRA EN VENTANA FLOTANTE CARRITO 

  document.getElementById("btnCarrito").addEventListener("click", () => { mostrarCarrito()});

  //3) ELIMINAR PRODUCTO CARRITO
  
  document.getElementById("btneliminarProd").addEventListener("click", () => {eliminarProductocarrito() });

  //4) CONFIRMAR CARRITO 

  document.getElementById("btnConfirmar").addEventListener("click", () => {confirmarCarrito() });

  document.getElementById("btnVaciar").addEventListener("click", () => {vaciarCarrito() });

  document.getElementById("btnRestar").addEventListener("click", () => {restarCantidad() });



