//let baseUrlApi = 'https://localhost:7123/';
//let baseUrlMvc = 'https://localhost:44334/';

let baseUrlApi = 'https://qa.agrorural.gob.pe/SIGPO_API/';
let baseUrlMvc = 'http://qa.agrorural.gob.pe/SIGPO_FRONT/'

let dataTableLanguage = {
    processing: "Procesando...",
    lengthMenu: "Mostrar _MENU_ registros",
    zeroRecords: "No se encontraron convenios",
    emptyTable: "Ningún registro de convenios según el filtro actual",
    info: "Mostrando registros del _START_ al _END_ de un total de _MAX_ registros",
    infoEmpty: "Mostrando registros del 0 al 0 de un total de 0 registros",
    infoFiltered: "(filtrado de un total de _MAX_ registros)",
    infoPostFix: "",
    search: '<span>Buscar:</span> _INPUT_',
    url: "",
    infoThousands: ",",
    loadingRecords: "Cargando...",
    paginate: {
        first: "Primero",
        last: "Último",
        next: "Siguiente",
        previous: "Anterior"
    },
    aria: {
        sortAscending: ": Activar para ordenar la columna de manera ascendente",
        sortDescending: ": Activar para ordenar la columna de manera descendente"
    }
};

var swalInit = swal.mixin({
    buttonsStyling: false,
    customClass: {
        confirmButton: 'btn btn-primary',
        cancelButton: 'btn btn-light',
        denyButton: 'btn btn-light',
        input: 'form-control'
    }
});

function doTask(verbo, controlador, dataSend, callbackOK, callbackError = null) {
    let consultaAjax = {
        type: verbo,
        url: baseUrlApi + "api/" + controlador,
        contentType: "application/json;",
        dataType: "json",
        beforeSend: function () {
            HoldOn.open({
                theme: 'sk-cube-grid',
                message: "<h4>Cargando....</h4>"
            });
        },
        cache: false,
        headers: { 'Authorization': 'bearer ' + $("#Token").val() },
        success: function (response) {
            //console.log(response);
            if (response.ok) {
                callbackOK(response.data)
            } else {
                swalInit.fire({
                    title: 'Alerta!',
                    text: response.mensaje,
                    icon: 'error'
                });
                if (callbackError !== null)
                    callbackError();
            }
        },
        complete: function (response) {
            HoldOn.close();
        }
    }

    if (verbo !== "GET" && verbo !== "DELETE")
        consultaAjax.data = JSON.stringify(dataSend);
    
    $.ajax(consultaAjax)
        .fail(function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 500) {
                console.warn("Error 500 =>", jqXHR.responseText)
                jqXHR.responseText = "Error al consultar al servicio, comuniquese con el adminstrador del sistema."
            }
            if (jqXHR.status === 401) {
                swalInit.fire({
                    title: 'Alerta!',
                    text: "El Token a Expirado",
                    icon: 'error'
                });
                //logaout();
            }
            swalInit.fire({
                title: 'Alerta!',
                text: jqXHR.responseText,
                icon: 'error'
            });
            HoldOn.close();
        });
};

function doTaskFile(verbo, controlador, dataSend, callbackOK, callbackError = null) {
    let consultaAjax = {
        type: verbo,
        url: baseUrlApi + "api/" + controlador,
        cache: false,
        processData: false,
        contentType: false,
        data: dataSend,
        beforeSend: function () {
            HoldOn.open({
                theme: 'sk-cube-grid',
                message: "<h4>Cargando....</h4>"
            });
        },
        cache: false,
        headers: { 'Authorization': 'Bearer ' + $("#Token").val() },
        success: function (response) {
            if (response.respuesta == "OK") {
                callbackOK(response)
            } else {
                swalInit.fire({
                    title: 'Alerta!',
                    text: response.respuesta,
                    icon: 'error'
                });
                if (callbackError !== null)
                    callbackError();
            }
        },
        complete: function (response) {
            HoldOn.close();
        }
    }

    //if (verbo !== "GET" && verbo !== "DELETE")
    //    consultaAjax.data = JSON.stringify(dataSend)

    $.ajax(consultaAjax)
        .fail(function (jqXHR, textStatus, errorThrown) {
            if (jqXHR.status === 500) {
                console.warn("Error 500 =>", jqXHR.responseText)
                jqXHR.responseText = "Error al consultar al servicio, comuniquese con el adminstrador del sistema."
            }
            if (jqXHR.status === 401) {
                swalInit.fire({
                    title: 'Alerta!',
                    text: "El Token a Expirado",
                    icon: 'error'
                });
                //logaout();
            }
            swalInit.fire({
                title: 'Alerta!',
                text: jqXHR.responseText,
                icon: 'error'
            });
            HoldOn.close();
        });
}