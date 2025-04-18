/**
 Author: Revelation.AF
 Engine: Slantapp
 Git: nusktec
 **/
import Network from "./Network"

class Apis {

  authLogin = async (data) => {
    return await (await new Network().post("/v1/parent/login", data)).chopJson()
  };

  authRegister = async (data) => {
    return await (await new Network().post("/v1/parent/signup", data)).chopJson()
  };

  authForgotPassword = async (data) => {
    return await (await new Network().post("/v1/parent/reset", data)).chopJson()
  };


  //get locals
  getLocalData = () => {
    const raw = localStorage.getItem("token")
    if (!raw) {
      localStorage.clear()
      //window.location.reload();
    }
    //convert to json
    try {
      const js = JSON.parse(raw)
      if (typeof js === "object") return js
      else localStorage.clear()
    } catch (ex) {
      console.log(ex)
      //localStorage.clear();
      //window.location.reload();
    }
  };
}

export default Apis
