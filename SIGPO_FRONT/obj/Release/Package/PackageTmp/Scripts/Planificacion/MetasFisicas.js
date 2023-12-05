var tabla;

const modalNuevoUsuario = new bootstrap.Modal(document.getElementById('modalNuevaMetaFisica'), null);
//const modalEditarUsuario = new bootstrap.Modal(document.getElementById('modalEditarUsuario'), null);

$(function () {
    ui();
    eventos();
    CargarDatos();

});
let eventos = function () {
   
    $("#btnAgregarNuevo").click(function () {
        debugger;
        $("#vUsuario").val('');
        $("#vCorreo").val('');
        $("#vDNI").val('');
        $("#vNombres").val('');
        $("#vApellidoPaterno").val('');
        $("#vApellidoMaterno").val('');
        modalNuevoUsuario.show();
    });

    $('#cmbComponente').on('change', function (e) {
        $('#cmbAcciones').empty();
        $('#cmbAcciones').append("<option value='0'>Seleccione</option>");
        let dato = {
            iCodComponente: parseInt(e.target.value, 10),
           
        }
       
        doTask('POST', "Maestros/ListarAcciones/", dato, function (respuesta) {
            console.log(respuesta);
            $.each(respuesta, function (key, value) {
                
                $('#cmbAcciones').append("<option value='" + value.iCodAccion + "'data-value='" + JSON.stringify(value.iCodAccion) + "'>" + value.vDescripcion + "</option>");
            });

        });
    });


}

function CargarDatos() {
    var obj = {};

    doTask('GET', "Maestros/ListarPeriodo/", obj, function (respuesta) {
        
        $.each(respuesta, function (key, value) {
            $('#cmbPeriodo').append("<option value='" + value.iCodPeriodo + "'data-value='" + JSON.stringify(value.iCodPeriodo) + "'>" + value.vPeriodo + "</option>");
        });

    });

    doTask('GET', "Maestros/ListarDepartamento/", obj, function (respuesta) {
        $.each(respuesta, function (key, value) {
             $('#cmbDepartamento').append("<option value='" + value.iCodDepartamento + "'data-value='" + JSON.stringify(value.iCodDepartamento) + "'>" + value.vNombreDepartamento + "</option>");
        });
    });

    doTask('GET', "Maestros/ListarComponente/", obj, function (respuesta) {
        $.each(respuesta, function (key, value) {
            $('#cmbComponente').append("<option value='" + value.iCodComponente + "'data-value='" + JSON.stringify(value.iCodComponente) + "'>" + value.vDescripcion + "</option>");
        });
    });
};
let ui = function () {
};