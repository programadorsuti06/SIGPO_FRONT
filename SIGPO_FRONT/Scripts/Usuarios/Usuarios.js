var tabla;

const modalNuevoUsuario = new bootstrap.Modal(document.getElementById('modalNuevoUsuario'), null);
const modalEditarUsuario = new bootstrap.Modal(document.getElementById('modalEditarUsuario'), null);

$(function () {
    ui();
    eventos();
    tabla = $('#tablaUsuarios').DataTable({
        "bFilter": false,
        "bLengthChange": false,
        "bServerSide": true,
        "language": dataTableLanguage,
        "sAjaxSource": 'Usuarios/listarUsuariosPaginado',
        "fnServerData": function (url, odata, callback) {
            console.log(odata);
            var obj = {};
            var PageSize = odata[4].value;
            var PrimerRegistro = odata[3].value;
            var CurrentPage = PrimerRegistro / PageSize;
            obj.iTamanioPagina = PageSize;
            obj.iPaginaActual = CurrentPage + 1;
            obj.vColumna = "id";
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
            { "title": "Usuario", "bSortable": false, bVisible: true, "data": "vUsuario" },
            { "title": "Correo", "bSortable": false, bVisible: true, "data": "vCorreo" },
            { "title": "DNI", "bSortable": false, bVisible: true, "data": "vDNI" },
            { "title": "Nombres", "bSortable": false, bVisible: true, "data": "vNombres" },
            { "title": "Apellido Paterno", "bSortable": false, bVisible: true, "data": "vApellidoPaterno" },
            { "title": "Apellido Materno", "bSortable": false, bVisible: true, "data": "vApellidoMaterno" },
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
    tabla.responsive.recalc();
    tabla.responsive.update();
});

let eventos = function () {
    $("#btnAgregarNuevo").click(function () {
        $("#vUsuario").val('');
        $("#vCorreo").val('');
        $("#vDNI").val('');
        $("#vNombres").val('');
        $("#vApellidoPaterno").val('');
        $("#vApellidoMaterno").val('');
        modalNuevoUsuario.show();
    });
    
    $("#vNombres").click(function () {
       
        var vDni = $('#vDNI').val();
        if (vDni.length !== 8) {
            Swal.fire({
                title: 'Error!',
                text: 'Dni no válido',
                icon: 'error',
                confirmButtonText: 'Ok'
            }).then((result) => {
                if (result.isConfirmed) {
                    $('#vDNI').focus();
                    return;
                };
            });
        }

        if (vDni.length === 8) {
            var obj = {};
            //doTask("GET", "Maestros/getDatos_Reniec/" + vDni, obj, function (respuesta) {
            //    if (respuesta !== null) {
            //        $("#vNombres").val(respuesta.vNomPersona);
            //        $("#vApellidoPaterno").val(respuesta.vApePat);
            //        $("#vApellidoMaterno").val(respuesta.vApeMat);

            //    } else {
            $.post('https://intranet.agrorural.gob.pe/php/servicios.php?servicio=validacionDNI', { DNI: vDni })
                .done((respuesta) => {
                    var obj = JSON.parse(respuesta);
                    if (obj.coResultado !== "0000") {
                        if (obj.coResultado !== "1003") {
                            Swal.fire({
                                title: 'Error!',
                                text: 'Dni ingresado no existe',
                                icon: 'error',
                                confirmButtonText: 'Ok'
                            }).then((result) => {
                                if (result.isConfirmed) {
                                    $('#vDNI').focus();
                                    return;
                                };
                            });
                        }
                        else {
                            document.getElementById("vNombres").readOnly = false;
                            document.getElementById("vApellidoPaterno").readOnly = false;
                            document.getElementById("vApellidoMaterno").readOnly = false;
                        }

                    } else {
                       // grabarInformacion(obj, vDni);
                        $("#vNombres").val(obj.NOMBRES);
                        $("#vApellidoPaterno").val(obj.APPAT);
                        $("#vApellidoMaterno").val(obj.APMAT);
                    }
                });
            //    }
            //});
        }
    });

    $("#btnGuardarNuevo").click(function () {
        var obj = {
            "vUsuario": $("#vUsuario").val(),
            "vCorreo": $("#vCorreo").val(),
            "vDNI": $("#vDNI").val(),
            "vNombres": $("#vNombres").val(),
            "vApellidoPaterno": $("#vApellidoPaterno").val(),
            "vApellidoMaterno": $("#vApellidoMaterno").val()
        };
        doTask('POST', "Usuarios/addUsuario", obj, obtenerDataAddUsuario);
        $("#vUsuario").val('');
        $("#vCorreo").val('');
        $("#vDNI").val('');
        $("#vNombres").val('');
        $("#vApellidoPaterno").val('');
        $("#vApellidoMaterno").val('');
        modalNuevoUsuario.hide();
    });

    function obtenerDataAddUsuario(data) {
        Swal.fire({
            title: 'Éxito!',
            text: 'Usuario agregado con éxito',
            icon: 'success',
            confirmButtonText: 'Ok'
        }).then((result) => {
            if (result.isConfirmed) {
                tabla.ajax.reload();
            };
        })
    };

    $("#tablaUsuarios").on("click", "#btnEliminar", function () {
        Swal.fire({
            title: 'Eliminar!',
            text: '¿Seguro de eliminar el registro?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si'
        }).then((result) => {
            if (result.isConfirmed) {
                var usuarioID = $(this).data("id");
                var obj = {};
                doTask('DELETE', "Usuarios/deleteUsuario/" + usuarioID, obj, obtenerDataDeleteUsuario);
            };
        });
    });

    function obtenerDataDeleteUsuario(data) {
        Swal.fire({
            title: 'Éxito!',
            text: 'Usuario eliminado con éxito',
            icon: 'success',
            confirmButtonText: 'Ok'
        }).then((result) => {
            if (result.isConfirmed) {
                tabla.ajax.reload();
            };
        })
    };

    $("#tablaUsuarios").on("click", "#btnEditar", function () {
        var UsuarioID = $(this).data("id");
        var obj = {};
        doTask('GET', "Usuarios/getUsuario/" + UsuarioID, obj, obtenerDataGetUsuario)
    });

    function obtenerDataGetUsuario(data) {
        $("#vUsuarioEditar").val(data.vUsuario);
        $("#vCorreoEditar").val(data.vCorreo);
        $("#vDNIEditar").val(data.vDNI);
        $("#vNombresEditar").val(data.vNombres);
        $("#vApellidoPaternoEditar").val(data.vApellidoPaterno);
        $("#vApellidoMaternoEditar").val(data.vApellidoMaterno);
        $("#usuarioIDEditar").val(data.id);
        modalEditarUsuario.show();
    };

    $("#btneditarUsuario").click(function () {
        var obj = {
            "vUsuario": $("#vUsuarioEditar").val(),
            "vCorreo": $("#vCorreoEditar").val(),
            "vDNI": $("#vDNIEditar").val(),
            "vNombres": $("#vNombresEditar").val(),
            "vApellidoPaterno": $("#vApellidoPaternoEditar").val(),
            "vApellidoMaterno": $("#vApellidoMaternoEditar").val(),
            "id": $("#usuarioIDEditar").val()
        };
        doTask('PUT', "Usuarios/updateUsuario", obj, obtenerDataUdateUsuario);
        $("#vUsuarioEditar").val('');
        $("#vCorreoEditar").val('');
        $("#vDNIEditar").val('');
        $("#vNombresEditar").val('');
        $("#vApellidoPaternoEditar").val('');
        $("#vApellidoMaternoEditar").val('');
        $("#usuarioIDEditar").val('');
        modalEditarUsuario.hide();
    });

    function obtenerDataUdateUsuario(data) {
        Swal.fire({
            title: 'Éxito!',
            text: 'Usuario actualizado con éxito',
            icon: 'success',
            confirmButtonText: 'Ok'
        }).then((result) => {
            if (result.isConfirmed) {
                tabla.ajax.reload();
            };
        })
    };
};

let ui = function () {
};