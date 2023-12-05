using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace SISGEA_FRONT.Controllers
{
    public class PlanificacionController : Controller
    {
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
    }
}
