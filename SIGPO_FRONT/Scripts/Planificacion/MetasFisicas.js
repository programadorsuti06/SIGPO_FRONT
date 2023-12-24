var tabla;

const modalNuevaUMxPeriodo = new bootstrap.Modal(document.getElementById('modalNuevaUMxPeriodo'), null);
const modalNuevaMetaFisica = new bootstrap.Modal(document.getElementById('modalNuevaMetaFisica'), null);
var tablaMetasFisica, iCodProyecto = 1, tablaAsignarMedida, iCantidadDistritos, iCodPeriodo, tablaActividades;
var seleccionesCombo = {};
$(function () {
    ui();
    eventos();
    CargarTablaPrincipal();
    CargarDatos();

});
let eventos = function () {
    obj = {
        iCodProyecto: iCodProyecto
    };
    //***************************************************************** */
    //BOTON ABRE MODLA PARA ASIGNAR UNIDADES DE MEDIDA A LAS ACTIVIDADES
    /****************************************************************** */
    $("#btnAsignarUnidadMedida").click(function () {
        modalNuevaUMxPeriodo.show();
        CargarDatos();
        doTask('POST', "Planificacion/ObtenerListaComponentes/", obj, function (respuesta1) {

            const columnas = obtenerNodosFinales(respuesta1);
            console.log(columnas);

            if ($.fn.dataTable.isDataTable('#tablaAsignarMedida')) {
                tablaAsignarMedida.destroy();
                tablaAsignarMedida.clear().draw();
            }


            tablaAsignarMedida = $('#tablaAsignarMedida').DataTable({
                data: columnas,
                paging: false,
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
                    { "title": "CODIGO", "bSortable": false, bVisible: false, data: 'codigo' },
                    { "title": "ITEM", "bSortable": false, bVisible: true, data: 'vItem' },
                    { "title": "COMPONENTE/ACCION/ACTIVIDAD/SUBACTIVIDAD ", "bSortable": false, bVisible: true, data: 'dato' },
                    {
                        "title": "UNIDAD DE MEDIDA",
                        "bSortable": false,
                        bVisible: true,
                        "render": function (data, type, row) {
                            var codigo = row.codigo;
                            var select = $('<select class="unidadMedida form-select form-select-lg" data-id="' + codigo + '"><option value="0">Seleccione</option></select>');

                         
                            if (seleccionesCombo[codigo]) {
                                select.val(seleccionesCombo[codigo]);
                            }
                                select.on('change', function () {
                                seleccionesCombo[codigo] = $(this).val();
                            });

                            return select.prop('outerHTML');
                        }
                    },
                ],
                order: [],
                "drawCallback": function () {
                    // Llenar los combos de unidad de medida después de dibujar la tabla
                    $('.unidadMedida').each(function () {
                        var select = this;
                        var codigo = $(this).data('id');
                        var selectedValue = $(select).val(); // Almacenar la selección actual

                        // Vaciar el combo antes de volver a llenarlo
                        $(select).empty().append("<option value='0'>Seleccione</option>");

                        // Llamada a la API para obtener los datos de unidades de medida por cada código
                        var obj = {};
                        doTask('GET', "Maestros/listarUnidadMedida/", obj, function (respuesta) {
                            respuesta.forEach(function (unidad) {
                                $(select).append("<option value='" + unidad.iCodUnidadMedida + "' data-value='" + JSON.stringify(unidad.iCodUnidadMedida) + "'>" + unidad.vDescripcion + "</option>");
                            });

                            // Restaurar la selección si ya fue guardada previamente
                            if (seleccionesCombo[codigo]) {
                                $(select).val(seleccionesCombo[codigo]);
                            } else {
                                // Restaurar la selección previa si estaba almacenada
                                $(select).val(selectedValue);
                            }
                        });
                    });
                    // Evento change para guardar la selección del usuario
                    $('.unidadMedida').on('change', function () {
                        var codigo = $(this).data('id');
                        seleccionesCombo[codigo] = $(this).val();
                    });
                }


            });



        });
    });
    /******************************************************************* */
    //BOTON  GUARDAR UNIDADES DE MEDIDA ASIGNADAS
    /********************************************************************/
    $('#btnGuardarAsignacion').on('click', function () {

        var datosGuardar = obtenerDatosParaGuardar();
        
        obj = {
            iCodProyecto: iCodProyecto
        };
        doTask('POST', "Planificacion/ObtenerDetalleAmbito/", obj, function (filas) {
            iCantidadDistritos = filas.length;
            var obj = {
                iCodProyecto: iCodProyecto,
                iCodPeriodo: iCodPeriodo,
                iCantidadDistritos: iCantidadDistritos,
                iCodUsuarioRegistra: 1,
                Detalle: datosGuardar
            }
            doTask('POST', "Planificacion/agregarMetaFisicaxPeriodo/", obj, guardarData);
            function guardarData(data) {
                Swal.fire({
                    title: 'Éxito!',
                    text: 'Se agregó con éxito',
                    icon: 'success',
                    confirmButtonText: 'Ok'
                }).then((result) => {
                    if (result.isConfirmed) {

                        CargarTablaPrincipal();
                        modalNuevaUMxPeriodo.hide();
                    };

                })

            }
        });


    });

    //AGREGAR METAS FISICAS POR PERIODO
    $("#tablaMetasFisica").on("click", "#btnAgregar", function () {

        var table = $('#tablaMetasFisica').DataTable();
        var rowIndex = table.row($(this).closest('tr')).index();
        var rowData = table.row(rowIndex).data();
        CargarDatos();
        modalNuevaMetaFisica.show();
        var iCodMetaFisicaxPeriodo = rowData.iCodMetaFisicaxPeriodo;

        var obj = {
            iCodMetaFisicaxPeriodo: iCodMetaFisicaxPeriodo,
            
        };

        doTask('POST', "Planificacion/ListarActividadesPeriodo/", obj, obtenerLista);
        function obtenerLista(data) {
            if ($.fn.dataTable.isDataTable('#tablaActividades')) {
                tablaActividades.destroy();
                tablaActividades.clear().draw();
            }
            tablaActividades = $('#tablaActividades').DataTable({
                searching: false,
                paging: false,
                info: false,
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
                    { "title": "iCodMetasFiscasxPerido", "bSortable": false, "bVisible": false, data: 'iCodItem' },
                    { "title": "ITEM", "bSortable": false, "data": 'vItem' },
                    { "title": "iCodUnidadMedida ", "bSortable": false, "bVisible": false, data: 'iCodUnidadMedida' }
                    { "title": "ACTIVIDAD", "bSortable": false,  "data": 'vNombreActividad'},
                    { "title": "UNIDAD DE MEDIDA", "bSortable": false,  data: 'vNombreUnidadMedida' },
                    { "title": "CANTIDAD", "bSortable": false, "defaultContent": ''}, 
                ],
                columnDefs: [
                    {
                        targets: 1, // Índice de la columna "ACTIVIDAD"
                        width: "900px" // Establece el ancho a 70 píxeles
                    },
                    {
                        targets: [2, 3], // Índices de las columnas "UNIDAD DE MEDIDA" y "CANTIDAD"
                        width: "150px" // Establece el ancho a 150 píxeles para ambas columnas
                    },
                   
                    {  targets: -1, // Índice de la columna donde quieres el input (en este caso, -1 es la última columna)
                        render: function (data, type, full, meta) {
                            // `data` contiene los datos de la fila actual, `full` contiene todos los datos de la fila
                            return '<input class="text-center" style="width:80px;" type="text" id="input_' + full.iCodItem + '" value="">';
                            // Aquí, `full.iCodItem` se utiliza para asignar un ID único a cada input
                        }
                    }
                ]



            });

           
        };
       
    });

    //COMBOS PARA LISTAR DEPARTAMENTOS
    $('#cmbDepartamento').on('change', function (e) {
        $('#cmbProvincia').empty();
        $('#cmbProvincia').append("<option value='0'>Seleccione</option>");
        $('#cmbDistrito').empty();
        $('#cmbDistrito').append("<option value='0'>Seleccione</option>");
        var obj = {
            iCodProyecto: iCodProyecto,
            Id_Departamento: e.target.value
        }
        doTask('POST', "Planificacion/listarAmbitoProvincia/", obj, function (data) {
            $.each(data, function (key, value) {
               
                $('#cmbProvincia').append("<option value='" + value.id_Provincia + "'data-value='" + JSON.stringify(value.id_Provincia) + "'>" + value.vNombreProvincia + "</option>");
            });
        });
    });

    $('#cmbProvincia').on('change', function (e) {
        $('#cmbDistrito').empty();
        $('#cmbDistrito').append("<option value='0'>Seleccione</option>");
        var obj = {
            iCodProyecto: iCodProyecto,
            id_Provincia: e.target.value
        }
        doTask('POST', "Planificacion/listarAmbitoDistritos/", obj, function (data) {
            $.each(data, function (key, value) {
                console.log(value.ubigeo);
                $('#cmbDistrito').append("<option value='" + value.ubigeo + "'data-value='" + JSON.stringify(value.ubigeo) + "'>" + value.nombreDistrito + "</option>");
            });
        });
    });

    //BOTONES CERRAR 
    $("#btnCmodalNuevaUMxPeriodo").on('click', function () {
        modalNuevaUMxPeriodo.hide();
    });
    $("#btnCmodalNuevaUMxPeriodo2").on('click', function () {
        modalNuevaUMxPeriodo.hide();
    });
    $("#btnCmodalNuevaMetaFisica").on('click', function () {
        modalNuevaMetaFisica.hide();
    });
    $("#btnCmodalNuevaMetaFisica2").on('click', function () {
        modalNuevaMetaFisica.hide();
    });
}

//FUNCION PARA OBTENER LAS ACTIVIDADES QUE SE ASIGNARAN UNIDADES DE MEDIDA
function obtenerNodosFinales(datos) {
    const nodosFinales = [];

    datos.forEach(elemento => {
        const { vItem } = elemento;
        const tieneHijos = datos.some(e => e.vItem.startsWith(vItem + '.') && e.vItem !== vItem);

        if (!tieneHijos) {
            nodosFinales.push(elemento);
        }
    });

    return nodosFinales;
}

/*****************************************************************************
//FUNCION APARA OBTENER LOS DATOS DE LA TBALA ASIGNACION DE UNIDAD DE MEDIDA * 
 *****************************************************************************/

function obtenerDatosParaGuardar() {
    var datosAGuardar = [];
    var filas = tablaAsignarMedida.rows().data();
   
    filas.each(function (index, row) {
        var codigo = index.codigo;
     
        var descripcion = index.dato; // 'dato' contiene la descripción
        var vItem = index.vItem;
        iCodPeriodo = $("#cmbPeriodoUM").val();

        // Obtener el valor seleccionado del combo
        var valorCombo = seleccionesCombo[codigo] || 0; // Si no hay selección, asigna 0 por defecto

        // Crear el objeto con el orden específico de los datos
        var objeto = {
            "iCodPeriodo": iCodPeriodo,
            "iCodItem": codigo,
            "vItem":vItem,
            "vDescripcion": descripcion,
            "iCodUnidadMedida": valorCombo,
            "iCodUsuarioRegistra": 1

        };

        datosAGuardar.push(objeto);
    });

    return datosAGuardar;
}

/*****************************************************************************
//FUNCION PARA OBTENER LOS DATOS DE LA TABLA  ACTIVIDADES * 
 *****************************************************************************/
function obtenerDatosActividades() {
    var datosActividades= [];
    var filas = tablaActividades.rows().data();

    console.log(filas);

    filas.each(function (index, row) {
        var codigo = index.codigo;

        var descripcion = index.dato; // 'dato' contiene la descripción
        var vItem = index.vItem;
        iCodPeriodo = $("#cmbPeriodoUM").val();

        // Obtener el valor seleccionado del combo
        var valorCombo = seleccionesCombo[codigo] || 0; // Si no hay selección, asigna 0 por defecto

        // Crear el objeto con el orden específico de los datos
        var objeto = {
            "iCodPeriodo": iCodPeriodo,
            "iCodItem": codigo,
            "vItem": vItem,
            "vDescripcion": descripcion,
            "iCodUnidadMedida": valorCombo,
            "iCodUsuarioRegistra": 1

        };

        datosAGuardar.push(objeto);
    });

    return datosAGuardar;
}


/*************************************** */
// CArGAR DATOS DE COMBOS
/**************************************** */
function CargarDatos() {
    var obj = {};
    $('#cmbPeriodoUM').empty();
    $('#cmbPeriodoUM').append("<option value='0'>Seleccione</option>");
    doTask('GET', "Maestros/ListarPeriodo/", obj, function (respuesta) {
            $.each(respuesta, function (key, value) {
                $('#cmbPeriodoUM').append("<option value='" + value.iCodPeriodo + "'data-value='" + JSON.stringify(value.iCodPeriodo) + "'>" + value.vPeriodo + "</option>");
        });

    });

    $('#cmbDepartamento').empty();
    $('#cmbDepartamento').append("<option value='0'>Seleccione</option>");
    $('#cmbProvincia').empty();
    $('#cmbProvincia').append("<option value='0'>Seleccione</option>");
    $('#cmbDistrito').empty();
    $('#cmbDistrito').append("<option value='0'>Seleccione</option>");
    var obj2 = {
        iCodProyecto: iCodProyecto
    }
    doTask('POST', "Planificacion/listarAmbitoDepartamento/", obj2, function (respuesta) {
        $.each(respuesta, function (key, value) {
           
            $('#cmbDepartamento').append("<option value='" + value.id_Departamento + "'data-value='" + JSON.stringify(value.id_Departamento) + "'>" + value.vNombreDepartamento + "</option>");
        });

    });
};
let ui = function () {
};

//CARGAR TABLA PRINCIPAL METAS FISCAS POR PERIODO
function CargarTablaPrincipal() {
    obj = {
        iCodProyecto: iCodProyecto
    };

    doTask('POST', "Planificacion/listarMetasFisicasxPeriodo", obj, function (respuesta) {
        if ($.fn.dataTable.isDataTable('#tablaMetasFisica')) {
            tablaMetasFisica.destroy();
            tablaMetasFisica.clear().draw();
        }
        tablaMetasFisica = $('#tablaMetasFisica').DataTable({
            searching: false,
            paging: false,
            info: false,
            data: respuesta,
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
                { "title": "iCodMetasFiscasxPerido", "bSortable": false, bVisible: false, data: 'iCodMetaFisicaxPeriodo' },
                { "title": "PERIODO", "bSortable": false, "bVisible": true, "data": 'vPeriodo',
                    "render": function (data, type, row) {
                        return "Periodo Programado - " + data;
                    }
                },
                { "title": "DISTRITOS", "bSortable": false, bVisible: true, data: 'iCantidadDistritos' },
                { "title": "% REGISTRO", "bSortable": false, bVisible: true, data: 'dcPorcentajeRegistro' },
                // Agrega más columnas según tu estructura de datos
                {
                    "title": "Acciones",
                    "bSortable": false,
                    "bVisible": true,
                    "render": function (data, type, row) {
                        return `<div class="btn-group" role="group">
                                <button id="btnAgregar" type="button" class="btn btn-outline-primary"><i class="fas fa-fw fa-plus"></i> </button>
                                <button id="btnEditar" type="button" class="btn btn-outline-warning"><i class="fas fa-fw fa-edit"></i></button>
                                <button id="btnEliminar" type="button" class="btn btn-outline-danger"><i class="fas fa-fw fa-trash-alt"></i></button></div>`;
                    }
                }
            ]


        });
    });
}
