using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SIGPO_FRONT.Controllers
{
    public class UsuariosController : Controller
    {
        // GET: Usuarios
        public ActionResult Index()
        {
            if (Session["token"] != null)
            {
                ViewBag.Token = Session["token"];
                return View();
            }
            else
            {
                return RedirectToAction("Login", "Usuarios");
            }
        }

        public ActionResult Login()
        {
            return View();
        }

        [HttpPost]
        public ActionResult Login2(string token)
        {
            Session["token"] = token;
            Session.Timeout = 60;
            var data = new { Respuesta = "OK" };
            return Json(data, JsonRequestBehavior.AllowGet);
        }
    }
}
