using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SISGEA_FRONT.Controllers
{
    public class MantenimientoController : Controller
    {
        public ActionResult Proyectos()
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

    }
}
