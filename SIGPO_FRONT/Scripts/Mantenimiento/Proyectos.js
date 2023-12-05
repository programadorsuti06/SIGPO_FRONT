var tabla1,tabla2;

const modalNuevoProyecto = new bootstrap.Modal(document.getElementById('modalNuevoProyecto'), null);
const modalEditarUsuario = new bootstrap.Modal(document.getElementById('modalEditarUsuario'), null);

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
                debugger;
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

    // Reiniciar DataTables Responsive después de cargar la tabla dinámicamente
   // tabla1.responsive.recalc();
   // tabla1.responsive.update();
});

let eventos = function () {
    $("#btnAgregarNuevo").click(function () {
        $("#vNombreProyecto").val('');
        $("#vCUI").val('');
        $('#cmbUnidadOrga').empty();
        $('#cmbUnidadOrga').append("<option value='0'>Seleccione</option>");
        var obj = {};
        doTask('GET', "Maestros/listarUnidades/", obj, function (respuesta) {
            $.each(respuesta, function (key, value) {
                if (value.iAmbito == 1) {
                    $('#cmbUnidadOrga').append("<option value='" + value.iCodUnidad + "'data-value='" + JSON.stringify(value.iCodUnidad) + "'>" + value.vNombreUnidad +" ["+value.vSigla+"] </option>");
                }
            });
           
        });
        var obj = {};
        doTask('GET', "Maestros/listarDepartamento/", obj, function (respuesta) {
           pintarTabla(respuesta,'cuerpoDepartamento');
        });

        //$("#vUsuario").val('');
        //$("#vCorreo").val('');
        //$("#vDNI").val('');
        //$("#vNombres").val('');
        //$("#vApellidoPaterno").val('');
        //$("#vApellidoMaterno").val('');
        modalNuevoProyecto.show();
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

   
    
    function obtenerDataAddUsuario(data) {
      
    };

   


};

let ui = function () {
};

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
