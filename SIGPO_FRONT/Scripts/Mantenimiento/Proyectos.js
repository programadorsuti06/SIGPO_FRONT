var tabla1,tabla2;
var jsonData;
const modalElement = document.getElementById('modalNuevoProyecto');
const modalNuevoProyecto = new bootstrap.Modal(document.getElementById('modalNuevoProyecto'), null);
var tablaComponentes = null;


//FUNCION PRINCIPAL
$(function () {
    ui();
    eventos();
    tabla1 = $('#tablaProyectos').DataTable({
        "bFilter": false,
        "bLengthChange": false,
        "bServerSide": true,
        "language": dataTableLanguage,
        "sAjaxSource": 'Mantenimiento/listarProyectosPaginado',
        "fnServerData": function (url, odata, callback) {
            console.log(odata);
            var obj = {};
            var PageSize = odata[4].value;
            var PrimerRegistro = odata[3].value;
            var CurrentPage = PrimerRegistro / PageSize;
            obj.iTamanioPagina = PageSize;
            obj.iPaginaActual = CurrentPage + 1;
            obj.vColumna = "iCodProyecto";
            obj.vOrden = "DESC";
            obj.filtros = {};

            doTask('POST', url, obj, function (response) {
                let registros = response.registros
                console.log(registros)
               
                callback({
                    data: registros,
                    recordsTotal: response.iTotalRegistros,
                    recordsFiltered: response.iTotalRegistros
                });
            });
        },
        "aoColumns": [
            { "title": "Nombre del Proyecto", "bSortable": false, bVisible: true, "data": "vNomProyecto" },
            { "title": "CUI", "bSortable": false, bVisible: true, "data": "vCUI" },
            { "title": "Unidad Formuladora", "bSortable": false, bVisible: true, "data": "iCodUnidadFormuladora" },
            { "title": "Unidad Ejecutora", "bSortable": false, bVisible: true, "data": "iCodUnidadZonalEjecutora" },
            {
                "title": "Acciones", "bSortable": false, "data": null,
                "render": function (data, type) {
                    return '<div class="d-flex align-items-center">' +
                        '<button id="btnEditar" data-id="' + data.id + '" type="button" class="btn btn-info btn-icon-split btn-sm d-inline d-sm-none">' +
                        '<span class="icon text-white-50"><i class="fas fa-pen"></i></span>' +
                        '</button>' +
                        '<button  id="btnEliminar" data-id="' + data.id + '" type="button" class="btn btn-danger btn-icon-split btn-sm d-inline d-sm-none">' +
                        '<span class="icon text-white-50"><i class="fas fa-trash"></i></span>' +
                        '</button>' +
                        '<span class="d-none d-sm-inline">' +
                        '<button id="btnEditar" data-id="' + data.id + '" type="button" class="btn btn-info btn-icon-split btn-sm">' +
                        '<span class="icon text-white-50"><i class="fas fa-pen"></i></span><span class="text">Editar</span>' +
                        '</button>' +
                        '<button  id="btnEliminar" data-id="' + data.id + '" type="button" class="btn btn-danger btn-icon-split btn-sm">' +
                        '<span class="icon text-white-50"><i class="fas fa-trash"></i></span><span class="text">Eliminar</span>' +
                        '</button>' +
                        '</span>' +
                        '</div>';
                },
                "className": "d-sm-table-cell"
            }
        ],
        columnDefs: []
    });

});

let eventos = function () {
    $("#btnAgregarNuevo").click(function () {
        var formulario = document.getElementById('NuevoProyecto');
        formulario.reset();

        $('#cmbUnidadOrga').empty();
        $('#cmbUnidadOrga').append("<option value='0'>Seleccione</option>");
       // $('#tablaComponentes').remove();
        var obj = {};
        doTask('GET', "Maestros/listarUnidades/", obj, function (respuesta) {
            $.each(respuesta, function (key, value) {
                if (value.iAmbito == 1) {
                    $('#cmbUnidadOrga').append("<option value='" + value.iCodUnidad + "'data-value='" + JSON.stringify(value.iCodUnidad) + "'>" + value.vNombreUnidad +" ["+value.vSigla+"] </option>");
                }
            });
           
        });
       
        //$("#vUsuario").val('');
       
        modalNuevoProyecto.show();
    });

   
    $('#btnCerrar').on('click', function () {
        tablaComponentes.clear().draw();
        modalNuevoProyecto.hide();
    });
    let iCodUnidad;
    $('#cmbUnidadOrga').on('change', function (e) {
        // Obtener el valor seleccionado
        iCodUnidad = parseInt(e.target.value, 10);
    });

    $("#btnGuardarNuevo").click(function () {
        
        var obj = {
            "vNombreProyecto": $("#vNombreProyecto").val(),
            "vCUI": $("#vCUI").val(),
            "iCodUnidad": Codigo
            //"CodigoUnidades":
        };
        doTask('POST', "Mantenimiento/GuardarProyectoConUnidades", obj, obtenerDataAddUsuario);
        //$("#vUsuario").val('');
        //$("#vCorreo").val('');
        //$("#vDNI").val('');
        //$("#vNombres").val('');
        //$("#vApellidoPaterno").val('');
        //$("#vApellidoMaterno").val('');
        modalNuevoProyecto.hide();
    });

   
    //OBTENER DATOS DE EXCEL
    //$('#seleccionarArchivoBtn').click( function (e) {
    //    if ($('#vNombreProyecto').val() === "") {// || $('#vCUI').val() === "" || $('#cmbUnidadOrga').val() === 0) {
                     
    //        Swal.fire({
    //            title: 'Error!',
    //            text: 'Debe completar todos los campos antes de seleccionar un archivo',
    //            icon: 'error'
    //        });
           
    //        $('#vNombreProyecto').focus();
    //        return;
            
    //    } 
    //});
 
    document.getElementById('archivo').addEventListener('change', function (e) {
        
        var file = e.target.files[0];
        var reader = new FileReader();
       
        reader.onload = function (e) {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: 'array' });

            var sheetName = workbook.SheetNames[0];
            var sheet = workbook.Sheets[sheetName];
             jsonData = XLSX.utils.sheet_to_json(sheet);


            var proyecto = {
                vNomProyecto: $("#vNombreProyecto").val(),
                vCUI: $("#vCUI").val(),
                iCodUnidadFormuladora: $('#cmbUnidadOrga').val(),
                iCodUnidadZonalEjecutora: $('#cmbUnidadOrga').val(),
                iCodUsuarioRegistra: 1,
                componentes: []
            };

            for (var i = 0; i < jsonData.length; i++) {
                var currentItem = jsonData[i].ITEM.toString();

                if (currentItem.length === 1) {
                    var newComponente = {
                        vItem: currentItem,
                        vSec_fun: "",
                        vDescripcion: jsonData[i].COMPONENTE_ACCION_ACTIVIDAD,
                        acciones: []
                    };
                    proyecto.componentes.push(newComponente);
                } else if (currentItem.length === 3) {
                    var componente = proyecto.componentes.find(comp => comp.vItem === currentItem.substring(0, 1));
                    if (componente) {
                        var newAccion = {
                            vItem: currentItem,
                            vDescripcion: jsonData[i].COMPONENTE_ACCION_ACTIVIDAD,
                            actividades: []
                        };
                        componente.acciones.push(newAccion);
                    }
                } else if (currentItem.length === 5) {
                    var componente = proyecto.componentes.find(comp => comp.vItem === currentItem.substring(0, 1));
                    if (componente) {
                        var accion = componente.acciones.find(acc => acc.vItem === currentItem.substring(0, 3));
                        if (accion) {
                            var newActividad = {
                                vItem: currentItem,
                                vDescripcion: jsonData[i].COMPONENTE_ACCION_ACTIVIDAD,
                                bActivo: true,
                                subActividades: []
                            };
                            accion.actividades.push(newActividad);
                        }
                    }
                } else if (currentItem.length === 7) {
                    var componente = proyecto.componentes.find(comp => comp.vItem === currentItem.substring(0, 1));
                    if (componente) {
                        var accion = componente.acciones.find(acc => acc.vItem === currentItem.substring(0, 3));
                        if (accion) {
                            var actividad = accion.actividades.find(act => act.vItem === currentItem.substring(0, 5));
                            if (actividad) {
                                var newSubActividad = {
                                    vItem: currentItem,
                                    vDescripcion: jsonData[i].COMPONENTE_ACCION_ACTIVIDAD,
                                };
                                actividad.subActividades.push(newSubActividad);
                            }
                        }
                    }
                }
            }

            // Mostrar los datos en el DataTable con el idioma español en los controles
      
            if ($.fn.dataTable.isDataTable('#tablaComponentes')) {
                tablaComponentes.destroy();
               
            } 

                tablaComponentes = $('#tablaComponentes').DataTable({
                    scrollY: '200px',
                    select: 'single',
                    data: jsonData,
                    columns: Object.keys(jsonData[0]).map(function (key) {
                        return { data: key, title: key };
                    }),
                    language: {
                        "sProcessing": "Procesando...",
                        "sLengthMenu": "Mostrar _MENU_ registros",
                        "sZeroRecords": "No se encontraron resultados",
                        "sEmptyTable": "Ningún dato disponible en esta tabla",
                        "sInfo": "Mostrando registros del _START_ al _END_ de un total de _TOTAL_ registros",
                        "sInfoEmpty": "Mostrando registros del 0 al 0 de un total de 0 registros",
                        "sInfoFiltered": "(filtrado de un total de _MAX_ registros)",
                        "sInfoPostFix": "",
                        "sSearch": "Buscar:",
                        "sUrl": "",
                        "sInfoThousands": ",",
                        "sLoadingRecords": "Cargando...",
                        "oPaginate": {
                            "sFirst": "Primero",
                            "sLast": "Último",
                            "sNext": "Siguiente",
                            "sPrevious": "Anterior"
                        }
                  
                    }

                });
            
        };

        reader.readAsArrayBuffer(file);

    });

   
   
};

let ui = function () {
    // Agregar el evento click para la edición en la tabla
   
};

function editarRegistro(id) {
    // Encontrar el índice del registro en el array 'jsonData' basado en su ID
    var indice = jsonData.findIndex(function (item) {
        return item.ID === id;
    });

    if (indice !== -1) {
        var registroEditar = jsonData[indice];

        // Aquí puedes acceder a las propiedades del registro y mostrarlas
        console.log('Detalles del registro a editar:');
        console.log(registroEditar);
    } else {
        console.log('Registro no encontrado');
    }
}

function pintarTabla(datos,tabla) {
    limpiarTabla(tabla);
    const cuerpoTabla = document.getElementById(tabla);
    debugger;
    datos.forEach(dato => {
       
            const fila = document.createElement('tr');
            const celdaUnidadZonal = document.createElement('td');
            const celdaEstado = document.createElement('td');
            const checkboxContainer = document.createElement('label');
            const checkboxEstado = document.createElement('input');
            const checkboxSpan = document.createElement('span');

            celdaUnidadZonal.textContent = dato.vNombreDepartamento; // Suponiendo que 'vNombreUnidad' es una propiedad en tu objeto
            checkboxEstado.type = 'checkbox';
            checkboxEstado.checked = dato.estado; // Suponiendo que 'estado' es una propiedad en tu objeto
            

            checkboxContainer.classList.add('checkbox-container'); // Clase para el contenedor del checkbox
            checkboxEstado.classList.add('styled-checkbox'); // Clase para el checkbox

            checkboxContainer.appendChild(checkboxEstado);
            checkboxContainer.appendChild(checkboxSpan);
            celdaEstado.appendChild(checkboxContainer);
            fila.appendChild(celdaUnidadZonal);
            fila.appendChild(celdaEstado);
            cuerpoTabla.appendChild(fila);
        
    });
}

function limpiarTabla(cuerpo) {
    const cuerpoTabla = document.getElementById(cuerpo);

    // Eliminar todas las filas existentes en el cuerpo de la tabla
    while (cuerpoTabla.firstChild) {
        cuerpoTabla.removeChild(cuerpoTabla.firstChild);
    }
}
