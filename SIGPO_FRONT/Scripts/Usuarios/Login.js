$("#btnLogin").click(function () {
    var obj = {
        "vUsuario": $("#vUsuario").val(),
        "vClave": $("#vClave").val(),
    };
    doTask('POST', "Login/login", obj, obtenerDataLogin);
});

function obtenerDataLogin(data) {
    console.log(data);
    if (data == "The supplied credential is invalid.") {
        Swal.fire({
            title: 'Error!',
            text: 'Usuario no encontrado o no tiene acceso al sistema',
            icon: 'error',
            confirmButtonText: 'Ok'
        }).then((result) => {
            if (result.isConfirmed) {
                $("#vUsuario").val('');
                $("#vClave").val('');
            };
        })
    } else {
        var dataObj = {
            "token": data
        };

        $.ajax({
            type: "POST",
            url: $("#urlLoginMVC").val(),
            data: dataObj, //change here....
            success: function (response) {
                if (response.Respuesta == "OK") {
                    Swal.fire({
                        title: 'Éxito!',
                        text: 'Login correcto',
                        icon: 'success',
                        confirmButtonText: 'Ok'
                    }).then((result) => {
                        if (result.isConfirmed) {
                            location.href = $("#urlHome").val()
                        };
                    })
                }
            },
            error: function () {
                alert("Error while getting files");
            }
        });
    }
};