var tabla1,tabla2;
var jsonData;
const modalElement = document.getElementById('modalNuevoProyecto'); 
const modalNuevoProyecto = new bootstrap.Modal(document.getElementById('modalNuevoProyecto'), null);
const modalEditarProyecto = new bootstrap.Modal(document.getElementById('modalEditarProyecto'), null);
const modalAgregarAmbito = new bootstrap.Modal(document.getElementById('modalAgregarAmbito'), null);
const modalVerAmbito = new bootstrap.Modal(document.getElementById('modalVerAmbito'), null);


var tablaComponentes = null;
var tablaAmbito = null;

var iAmbito, NomDepartamento;
let iCodUnidad,iCodUnidadEjecutora,iCodProyecto;

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
            { "title": "iCodProyecto", "bSortable": false, bVisible: false, "data": "iCodProyecto" },
            { "title": "Nombre del Proyecto", "bSortable": false, bVisible: true, "data": "vNomProyecto" },
            { "title": "CUI", "bSortable": false, bVisible: true, "data": "vCUI" },
            { "title": "Unidad Formuladora", "bSortable": false, bVisible: true, "data": "mae_Unidad.vSigla" },

            {
                "title": "Ambito", "sortable": false, "visible": true, "data": "iAmbito",
                "render": function (data, type, row) {
                    let buttonHTML = '';
                    if (data > 0) {
                        buttonHTML = '<button id="btnVerAmbito" data-id="' + data + '" type="button" class="btn btn-secondary btn-icon-split btn-sm">' +
                            '<span class="icon text-white-50" title="Ver Ámbito"><i class="fas fa-eye"></i></span>' +
                            '</button>';
                    }
                    // Reemplaza 'fa-icono' con la clase del icono que desees usar (por ejemplo, Font Awesome)
                    return data + '   <button id="btnAgregarAmbito" data-id="' + data + '" type="button" class="btn btn-success btn-icon-split btn-sm">' +
                        '<span class="icon text-white-50" title="Agregar ámbito"><i class="far fa-edit"></i></span>' +
                        '</button>' + buttonHTML;
                }
            },

            {
                "title": "Acciones", "bSortable": false, "visible": true, "data": null,
                "render": function (data, type) {
                    let buttonHTML = '';
                    return buttonHTML = '<button id="btnEditar" data-id="' + data.id + '" type="button" class="btn btn-info btn-icon-split btn-sm"><span class="icon text-white-50" title="Editar proyecto"><i class="fas fa-pen"></i></span></button>' +
                        '<button id="btnEliminarProyecto" data-id="' + data.id + '" type="button" class="btn btn-danger btn-icon-split btn-sm"><span class="icon text-white-50" title="Eliminar proyecto"><i class="fas fa-trash"></i></span></button>';
                    + buttonHTML;
                },
                "className": "d-sm-table-cell"
            }
        ],
        "columnDefs": [
            {
                "targets": 1, // Índice de la columna "Nombre del Proyecto"
                "width": "900px" // Ancho deseado para la columna
            }
            // Puedes agregar más definiciones para otras columnas si es necesario
        ]
    });
});


let eventos = function () {

    //EVENTOS PARA MANEJO VENTA DE PROYECTOS
    $("#btnAgregarNuevo").click(function () {
        $("#vNombreProyecto").val('');
        $("#vCUI").val('')
        $('#cmbUnidadOrga').empty();
        $('#cmbUnidadOrga').append("<option value='0'>Seleccione</option>");
        if ($.fn.dataTable.isDataTable('#tablaComponentes')) {
            tablaComponentes.destroy();
            tablaComponentes.clear().draw();
        } 
        var input = document.getElementById('archivo');
        input.value = ''; // Esto limpia el valor del campo de entrada file

        // Para navegadores modernos (a partir de IE11)
        if (input.files) {
            input.files = null;
        }
      
        var obj = {};
        doTask('GET', "Maestros/listarUnidades/", obj, function (respuesta) {
            $.each(respuesta, function (key, value) {
                if (value.iAmbito == 1) {
                    $('#cmbUnidadOrga').append("<option value='" + value.iCodUnidad + "'data-value='" + JSON.stringify(value.iCodUnidad) + "'>" + value.vNombreUnidad +" ["+value.vSigla+"] </option>");
                }
            });
           
        });
       
        modalNuevoProyecto.show();
    });

    //COMBO UNIDAD ORGANIZADORA
    $('#cmbUnidadOrga').on('change', function (e) {
        iCodUnidad = parseInt(e.target.value, 10);
    });

    //GUARDAR NUEVO PROYECTO  
    $('#btnGuardarNuevo').click(function () {
        if ($('#vNombreProyecto').val() === "") {
            Swal.fire({
                title: 'Error!',
                text: 'Ingrese el nombre del proyecto',
                icon: 'error'
            });
            $('#vNombreProyecto').focus();
            return;
        }
        if ($('#vCUI').val() === "") {
            Swal.fire({
                title: 'Error!',
                text: 'Ingrese código único identificador',
                icon: 'error'
            });
            $('#vCUI').focus();
            return;
        }

        if ($('#cmbUnidadOrga').val() === "Seleccione") {
            Swal.fire({
                title: 'Error!',
                text: 'Seleccione Unidad Formuladora ',
                icon: 'error'
            });
            $('#cmbUnidadOrga').focus();
            return;
        }
        
        var proyecto = {
            vNomProyecto: $("#vNombreProyecto").val(),
            vCUI: $("#vCUI").val(),
            iCodUnidad: $('#cmbUnidadOrga').val(),
            iCodUsuarioRegistra: 1,
            componentes: []
        };
        //cargar como json datos de excel
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

        doTask('POST', "Mantenimiento/AgregarProyecto", proyecto, obtenerDataAddProyecto);
        $("#vNombreProyecto").val('');
        $("#vCUI").val('');
        $("#cmbUnidadOrga").val('');
        modalNuevoProyecto.hide();

        function obtenerDataAddProyecto(data) {
            Swal.fire({
                title: 'Éxito!',
                text: 'Se agregó proyecto con éxito',
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then((result) => {
                if (result.isConfirmed) {
                    tabla1.ajax.reload();
                };
            })
        };
    });

    // CARGAR DATA DE COMPONENTES DESDE EXCEL   
    document.getElementById('archivo').addEventListener('change', function (e) {
        
        var file = e.target.files[0];
        var reader = new FileReader();
       
        reader.onload = function (e) {
            var data = new Uint8Array(e.target.result);
            var workbook = XLSX.read(data, { type: 'array' });

            var sheetName = workbook.SheetNames[0];
            var sheet = workbook.Sheets[sheetName];
             jsonData = XLSX.utils.sheet_to_json(sheet);

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

    //AGREGAR AMBITO DE ACCION
    $("#tablaProyectos").on("click", "#btnAgregarAmbito", function () {

       var table = $('#tablaProyectos').DataTable();
       var rowIndex = table.row($(this).closest('tr')).index();
        var rowData = table.row(rowIndex).data();
        iCodProyecto = rowData.iCodProyecto;
        $('#vNombre').val(rowData.vNomProyecto);
        $('#vCui').val(rowData.vCUI);
        $('#vUnidadFormuladora').val(rowData.mae_Unidad.vSigla);

       
        var ulLista = $('#miLista');
        ulLista.empty();
        var ulLista = $('#miLista2');
        ulLista.empty();
        iAmbito = 0;
        CargarDatos()

        modalAgregarAmbito.show();
        
    });

    // VER AMBITO DE ACCION
    $("#tablaProyectos").on("click", "#btnVerAmbito", function () {
        var table = $('#tablaProyectos').DataTable();
        var rowIndex = table.row($(this).closest('tr')).index();
        var rowData = table.row(rowIndex).data();

        $('#vNombreA').val(rowData.vNomProyecto);
        $('#vCuiA').val(rowData.vCUI);
        $('#vUnidadFormuladoraA').val(rowData.mae_Unidad.vSigla);

        iCodProyecto = rowData.iCodProyecto;
        if ($.fn.dataTable.isDataTable('#tablaAmbito')) {
            tablaAmbito.destroy();
            tablaAmbito.clear().draw();
        }

        var obj = {
            iCodProyecto: iCodProyecto
        };


        doTask('POST', "Mantenimiento/listarAmbito/", obj, obtenerAmbito);
        function obtenerAmbito(data) {

            tablaAmbito = $('#tablaAmbito').DataTable({

                data: data,
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

                },
                aoColumns: [
                    { "title": "iCodAmbito", "bSortable": false, bVisible: false, data: 'iCodAmbito' },
                    { "title": "UNIDAD EJECUTORA", "bSortable": false, bVisible: true, data: 'unidadEjecutora' },
                    { "title": "DEPARTAMENTO", "bSortable": false, bVisible: true, data: 'departamento' },
                    { "title": "PROVINCIA", "bSortable": false, bVisible: true, data: 'provincia' },
                    { "title": "DISTRITO", "bSortable": false, bVisible: true, data: 'distrito' },
                    // Agrega más columnas según tu estructura de datos
                    {
                        "title": "Acciones", "bSortable": false, "data": null,
                        "render": function (data, type) {
                            return '<button id="btnEliminar" data-id="' + data.iCodAmbito + '" type="button" class="btn btn-danger btn-icon-split btn-sm"><span class="icon text-white-50" title="Eliminar"><i class="fas fa-trash"></i></span></button>';

                        },
                        "className": "d-sm-table-cell"
                    }
                ]
            });
            modalVerAmbito.show();

        }
    });


    // BOTON EDITAR PROYECTO
    $("#tablaProyectos").on("click", "#btnEditar", function () {
        var table = $('#tablaProyectos').DataTable();
        var rowIndex = table.row($(this).closest('tr')).index();
        var rowData = table.row(rowIndex).data();
       
        modalEditarProyecto.show();
        $('#vNombreProyectoEditar').val(rowData.vNomProyecto);
        $('#vCUIEditar').val(rowData.vCUI);
        $('#cmbUnidadFormuladora').empty();
        $('#cmbUnidadFormuladora').append("<option value='0'>Seleccione</option>");
        var obj = {};
        doTask('GET', "Maestros/listarUnidades/", obj, function (respuesta) {
            $.each(respuesta, function (key, value) {
                if (value.iAmbito == 1) {
                    $('#cmbUnidadFormuladora').append("<option value='" + value.iCodUnidad + "'data-value='" + JSON.stringify(value.iCodUnidad) + "'>" + value.vNombreUnidad + "</option>");
                }
            });

        });
       // $('#vUnidadFormuladoraEditar').val(rowData.mae_Unidad.vSigla);
      
               
    });
    $("#btnEditarProyecto").click(function () {
        var table = $('#tablaProyectos').DataTable();
        var rowIndex = table.row($(this).closest('tr')).index();
        var rowData = table.row(rowIndex).data();

        iCodProyecto = rowData.iCodProyecto;

        var obj = {
            iCodProyecto: iCodProyecto,
            vNomProyecto: $('#vNombreProyectoEditar').val(),
            vCUI: $('#vCUIEditar').val(),
            iCodUnidad: $('#cmbUnidadFormuladora').val()
        };

        doTask('PUT', "Mantenimiento/EditProyecto/", obj, obtenerEditar);
        function obtenerEditar(data) {
            Swal.fire({
                title: 'Éxito!',
                text: 'Proyecto actualizado con éxito',
                icon: 'success',
                confirmButtonText: 'Ok'
            }).then((result) => {
                if (result.isConfirmed) {
                    tabla1.ajax.reload();
                    modalEditarProyecto.hide();
                };
            })
        };
    });
    //ELIMINAR PROYECTO
    $("#tablaProyectos").on("click", "#btnEliminarProyecto", function () {
        Swal.fire({
            title: 'Eliminar!',
            text: '¿Seguro de eliminar el registro?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si'
        }).then((result) => {
            if (result.isConfirmed) {
                var table = $('#tablaProyectos').DataTable();
                var rowIndex = table.row($(this).closest('tr')).index();
                var rowData = table.row(rowIndex).data();
                var iCodProyecto = rowData.iCodProyecto;
               
                var obj = {};
                doTask('DELETE', "Mantenimiento/deleteProyecto/" + iCodProyecto, obj, obtenerDataDeleteAmbito);
                function obtenerDataDeleteAmbito(data) {
                    Swal.fire({
                        title: 'Éxito!',
                        text: 'Proyecto eliminado con éxito',
                        icon: 'success',
                        confirmButtonText: 'Ok'
                    }).then((result) => {
                        if (result.isConfirmed) {
                           
                            tabla1.ajax.reload();
                        };
                    })
                };
            };
        });

    });

    // EVENTO PARA ELIMINAR AMBITO
    $("#tablaAmbito").on("click", "#btnEliminar", function () {
        Swal.fire({
            title: 'Eliminar!',
            text: '¿Seguro de eliminar el registro?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si'
        }).then((result) => {
            if (result.isConfirmed) {
                var table = $('#tablaAmbito').DataTable();
                var rowIndex = table.row($(this).closest('tr')).index();
                var rowData = table.row(rowIndex).data();
                var iCodAmbito = rowData.iCodAmbito;
                debugger;
                var obj = {};
                doTask('DELETE', "Mantenimiento/deleteAmbito/" + iCodAmbito, obj, obtenerDataDeleteAmbito);
                function obtenerDataDeleteAmbito(data) {
                    Swal.fire({
                        title: 'Éxito!',
                        text: 'Distrito eliminado con éxito',
                        icon: 'success',
                        confirmButtonText: 'Ok'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            modalVerAmbito.hide();
                            tabla1.ajax.reload();
                        };
                    })
                };
            };
        });

    });

    //COMBO CUANDO SE CAMBIA DE DEPARTAMENTOS
    $('#cmbDepartamento').on('change', function (e) {
        $('#cmbProvincia').empty();
        $('#cmbProvincia').append("<option value='0'>Seleccione</option>");
        var ulLista = $('#miLista');
        ulLista.empty();
        NomDepartamento = $(this).find('option:selected').text();
        var obj = {
            Id_Departamento: e.target.value
        }
       
        doTask('POST', "Maestros/listarProvincia/", obj, obtenerProvincia);
        function obtenerProvincia(data) {
                $.each(data, function (key, value) {
                    $('#cmbProvincia').append("<option value='" + value.id_Provincia + "'data-value='" + JSON.stringify(value.id_Provincia) + "'>" + value.vNombreProvincia + "</option>");
                });
          }
             
    });
    //COMBO CUANDO SE CAMBIA DE PROVINCIA
    $('#cmbProvincia').on('change', function (e) {

        var obj = {
            Id_Provincia: e.target.value
        }

        var ulLista = $('#miLista');
        ulLista.empty();
        doTask('POST', "Maestros/listarDistrito/", obj, obtenerDistritos);
        function obtenerDistritos(data) {
            $.each(data, function (key, value) {
                var li = $('<li>').addClass('list-group-item').text(value.vNombreDistrito).attr('data-id', value.id_Distrito);
                ulLista.append(li);
            })
        }

    });
    //COMBO UNIDAD EJECUTORA
    $('#cmbUnidadEjecutora').on('change', function (e) {
        iCodUnidadEjecutora = parseInt(e.target.value, 10);
    });

    //OBJETOS DE SELECCION DE DISTRITOS
    $('#miLista').on('click', 'li', function () {
        $(this).toggleClass('selected'); // Agrega o quita la clase 'selected' al hacer clic
    });
    $('#miLista2').on('click', 'li', function () {
        $(this).toggleClass('selected'); // Agrega o quita la clase 'selected' al hacer clic
    });
   
    $('#botonMover').on('click', function () {
        var elementosSeleccionados = $('#miLista').find('.selected');
        elementosSeleccionados.removeClass('selected').each(function () {
            var textoOriginal = $(this).text();
            var textoModificado = NomDepartamento + '/' + textoOriginal;

            // Verificar si el texto ya existe en la segunda lista
            var existe = $('#miLista2').find('li:contains("' + textoModificado + '")').length > 0;

            // Si no existe, se agrega a la segunda lista
            if (!existe) {
                var elementoClonado = $(this).clone().text(textoModificado);
                $('#miLista2').append(elementoClonado);
            }
        });
        elementosSeleccionados.remove();

        iAmbito = $('#miLista2').children().length;
        var h5Element = document.getElementById('nDistritos');
        h5Element.textContent = '(' + iAmbito + ') Distritos seleccionados';
    });

    $('#botonQuitar').click(function () {
        var elementosSeleccionados = $('#miLista2').find('.selected');
            elementosSeleccionados.removeClass('selected').each(function () {
            var textoOriginal = $(this).text(); // Obtener el texto actual del elemento
            var textoSinDepartamento = textoOriginal.replace(NomDepartamento + '/', ''); // Quitar 'NomDepartamento/' del texto

            var id_Distrito = $(this).data('id'); // Obtener el ID del distrito
            var textoOriginalLista1 = $(this).data('texto-original'); // Obtener el texto original guardado

                var nuevoElemento = $('<li>')
                .addClass('list-group-item')
                .text(textoSinDepartamento) // Restaurar el texto original
                .attr('data-id', id_Distrito);

            $('#miLista').append(nuevoElemento);
        });

        elementosSeleccionados.remove();

        iAmbito = $('#miLista2').children().length;
        var h5Element = document.getElementById('nDistritos');
        h5Element.textContent = '(' + iAmbito + ') Distritos seleccionados';
    });

    //GUARDAR AMBITO
    $("#btnGuardarAmbito").click(function () {
        //validamos los campos faltantes
        if ($('#cmbUnidadEjecutora').val() === "Seleccione") {
            Swal.fire({
                title: 'Error!',
                text: 'Debe seleccionar una Unidad Zonal Ejecutora',
                icon: 'error'
            });
            $('#cmbUnidadEjecutora').focus();
            return;
        }
        if ($('#cmbDepartamento').val() === "Seleccione") {
            Swal.fire({
                title: 'Error!',
                text: 'Debe seleccionar Departamento',
                icon: 'error'
            });
            $('#cmbDepartamento').focus();
            return;
        }
        if ($('#cmbProvincia').val() === "Seleccione") {
            Swal.fire({
                title: 'Error!',
                text: 'Debe seleccionar una Provincia',
                icon: 'error'
            });
            $('#cmbProvincia').focus();
            return;
        }
      
        if (iAmbito==0) {
            Swal.fire({
                title: 'Error!',
                text: 'Debe agregar al menos un distrito',
                icon: 'error'
            });
            $('#cmbProvincia').focus();
            return;
        }
        // Obtener los elementos de la lista #miLista2
        var listaElementos = document.getElementById('miLista2').getElementsByTagName('li');

        // Convertir los elementos a un array de valores de data-id
        var vUbigeo = Array.from(listaElementos).map(function (elemento) {
            return elemento.getAttribute('data-id');
        });



        let obj = {
            iCodProyecto: iCodProyecto,
            iCodUnidadEjecutora: iCodUnidadEjecutora,
            iCodUsuarioRegistra: 1,
            vUbigeo: vUbigeo

        }
      
        doTask('POST', "Mantenimiento/AgregarAmbito/", obj, obtenerAmbito);
        function obtenerAmbito(data) {
                Swal.fire({
                    title: 'Éxito!',
                    text: 'Se agregó Ámbito con éxito',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                }).then((result) => {
                    if (result.isConfirmed) {
                        modalAgregarAmbito.hide();
                        tabla1.ajax.reload();
                    };
                })
                
            }
             
    });

};

let ui = function () {
      
};

//CARGAR COOMBOS DE AMBITO
function CargarDatos() {
    // COMBO UNIDAD ZONAL EJECUTORA
    $('#cmbUnidadEjecutora').empty();
    $('#cmbUnidadEjecutora').append("<option value='0'>Seleccione</option>");
    var obj = {};
    doTask('GET', "Maestros/listarUnidades/", obj, function (respuesta) {
        $.each(respuesta, function (key, value) {
            if (value.iAmbito == 2) {
                $('#cmbUnidadEjecutora').append("<option value='" + value.iCodUnidad + "'data-value='" + JSON.stringify(value.iCodUnidad) + "'>" + value.vNombreUnidad +"</option>");
            }
        });

    });
    //COMBO DEPARTAMENTO
    $('#cmbDepartamento').empty();
    $('#cmbDepartamento').append("<option value='0'>Seleccione</option>");
    $('#cmbProvincia').empty();
    $('#cmbProvincia').append("<option value='0'>Seleccione</option>");
    var obj = {};
    doTask('GET', "Maestros/listarDepartamento/", obj, obtenerDepartamento);
    function obtenerDepartamento(data) {
        $.each(data, function (key, value) {
            $('#cmbDepartamento').append("<option value='" + value.id_Departamento + "'data-value='" + JSON.stringify(value.id_Departamento) + "'>" + value.vNombreDepartamento + "</option>");
        });
    }
}



