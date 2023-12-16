var tabla1,tablaActividades;

const modalNuevaMetaFisica = new bootstrap.Modal(document.getElementById('modalNuevaMetaFisica'), null);
//const modalEditarUsuario = new bootstrap.Modal(document.getElementById('modalEditarUsuario'), null);
var iCodProyecto;
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
            obj.filtros = {
                vCUI: $('#vCui').val()
            };
            
            doTask('POST', url, obj, function (response) {
                let registros = response.registros
              

                callback({
                    data: registros,
                    recordsTotal: response.iTotalRegistros,
                    recordsFiltered: response.iTotalRegistros
                });
            });
        },
        "aoColumns": [
            { "title": "iCodProyecto", "bSortable": false, bVisible: false, "data": "iCodProyecto" },
            { "title": "CUI", "bSortable": false, bVisible: true, "data": "vCUI" },
            { "title": "Proyecto", "bSortable": false, bVisible: true, "data": "vNomProyecto" },
            
            {
                "title": "M.FÍSICA", "sortable": false, "visible": true, "data": "iAmbito",
                "render": function (data, type) {

                    return '<button id="btnAgregarMetaFisica" data-id="' + data.iCodProyecto + '" type="button" class="btn btn-success btn-icon-split btn-sm"><span class="icon text-white-10"><i class="fas fa-file-alt"></i></span><span class="text"></span></button>';

                }
            },
           
        ],
        "columnDefs": [
            {
                //"targets": 1, // Índice de la columna "Nombre del Proyecto"
                //"width": "10px", // Ancho deseado para la columna
                "targets": 2, // Índice de la columna "Nombre del Proyecto"
                "width": "1900px" // Ancho deseado para la columna
            }
            // Puedes agregar más definiciones para otras columnas si es necesario
        ]
    });
    

});
let eventos = function () {

    $("#tablaProyectos").on("click", "#btnAgregarMetaFisica", function () {
        var table = $('#tablaProyectos').DataTable();
        var rowIndex = table.row($(this).closest('tr')).index();
        var rowData = table.row(rowIndex).data();

        iCodProyecto = rowData.iCodProyecto;
        CargarDatos(iCodProyecto);

        modalNuevaMetaFisica.show();
    });
    $('#btnBuscar').click(function () {
        debugger;
        tabla1.ajax.reload();
    });

    $('#cmbComponente').on('change', function (e) {
        $('#cmbAcciones').empty();
        $('#cmbAcciones').append("<option value='0'>Seleccione</option>");
        let dato = {
            iCodComponente: parseInt(e.target.value, 10),
            }
       doTask('POST', "Planificacion/ListarAcciones/", dato, function (respuesta) {
                  $.each(respuesta, function (key, value) {
                $('#cmbAcciones').append("<option value='" + value.iCodAccion + "'data-value='" + JSON.stringify(value.iCodAccion) + "'>" + value.vItem+" "+value.vNomAccion + "</option>");
            });

        });
    });
    $('#cmbAcciones').on('change', function (e) {
        let dato = {
            iCodAccion: parseInt(e.target.value, 10),
        };

        doTask('POST', "Planificacion/listarActividades/", dato, function (respuesta) {
            tablaActividades = $('#tablaActividad').DataTable({
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
                    { "title": "iCodAccion", "bSortable": false, bVisible: false, data: 'iCodAccion' },
                    { "title": "ITEM", "bSortable": false, bVisible: true, data: 'vItem' },
                    { "title": "ACTIVIDAD", "bSortable": false, bVisible: true, data: 'vNomActividad' },
                    {
                        "title": "UNIDAD DE MEDIDA", "data": null,
                        "render": function (data, type, row) {
                            return '<select id="cmb' + row.iCodActividad + '" class="cmbUnidadMedida"></select>';
                        }
                    },
                    {
                        "title": "CANTIDAD", "data": null,
                        "render": function (data, type, row) {
                            return '<label id="label' + row.iCodActividad + '" class="lblCantidad"></label>';
                        }
                    }
                ],
                columnDefs: [
                    {
                        targets: [3],
                        "render": function (data, type, row) {
                            obtenerUnidadesMedida().then(function (unidades) {
                                var select = $('#cmb' + row.iCodActividad);
                                unidades.forEach(function (value) {
                                    select.append("<option value='" + value.iCodUnidadMedida + "'data-value='" + JSON.stringify(value.iCodUnidadMedida) + "'>" + value.vDescripcion + "</option>");
                                });
                            });
                            return '';
                          
                        }
                    }
                ]

            });
        });
    });


}

function obtenerUnidadesMedida() {
    debugger;
    return new Promise(function (resolve, reject) {
        var obj = {};
        doTask('GET', "Maestros/listarUnidadMedida/", obj, function (respuesta) {
            resolve(respuesta.data); 
        });
              
    });
}

function CargarDatos(iCodProyecto) {
    $('#cmbPeriodo').empty();
    $('#cmbPeriodo').append("<option value='0'>Seleccione</option>");
    var obj = {};
    doTask('GET', "Maestros/listarPeriodo/", obj, function (respuesta) {
        
        $.each(respuesta, function (key, value) {
            $('#cmbPeriodo').append("<option value='" + value.iCodPeriodo + "'data-value='" + JSON.stringify(value.iCodPeriodo) + "'>" + value.vPeriodo + "</option>");
        });

    });
    $('#cmbUnidadZonal').empty();
    $('#cmbUnidadZonal').append("<option value='0'>Seleccione</option>");
    var obj2 = {
        iCodProyecto: iCodProyecto
    }
    doTask('POST', "Planificacion/listarUnidadEjecutora/", obj2, function (respuesta) {
        $.each(respuesta, function (key, value) {
            $('#cmbUnidadZonal').append("<option value='" + value.iCodUnidad + "'data-value='" + JSON.stringify(value.iCodUnidad) + "'>" + value.vSigla + "</option>");
        });

    });
    $('#cmbComponente').empty();
    $('#cmbComponente').append("<option value='0'>Seleccione</option>");
    doTask('POST', "Planificacion/listarComponentes/", obj2, function (respuesta) {
       $.each(respuesta, function (key, value) {
              $('#cmbComponente').append("<option value='" + value.iCodComponente + "'data-value='" + JSON.stringify(value.iCodComponente) + "'>" +value.vItem+" "+value.vNomComponente + "</option>");
        });
    });
   
};
let ui = function () {
};