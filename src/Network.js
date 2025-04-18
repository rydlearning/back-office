/**
 Author: Revelation.AF
 Engine: Slantapp
 Git: nusktec
 **/

 class Network {
  //baseUrl
  netData = null;
  headerConfig = { "Content-Type": "application/json" }
  baseUrl = "https://api-pro.rydlearning.com"
  // baseUrl = "http://localhost:3000";
  // baseUrl = "https://ryd-learning-api-v2.onrender.com"
  paymentBaseUrl = this.baseUrl + "/v1/stripe/ask/create-pay"

  constructor(baseUrl = null) {
    if (baseUrl) {
      this.baseUrl = baseUrl
    }
  }

  //set headers
  addHeaders(name, value) {
    this.headerConfig[name] = value
    return this
  }

  setBaseUrl(url) {
    this.baseUrl = url
    return this
  }

  async chopJson(isAsync = false) {
    if (!isAsync) return this.netData
    else return await this.netData.json()
  }

  async post(path, data, isFinal = true) {
    if (isFinal) this.netData = await (await fetch(this.baseUrl + path, {
      headers: { ...this.headerConfig },
      body: JSON.stringify(data),
      method: "post"
    })).json();
    else this.netData = await fetch(this.baseUrl, {
      headers: { ...this.headerConfig },
      body: JSON.stringify(data),
      method: "post"
    })
    return this
  }
  async get(data, isFinal = true) {
    if (isFinal) this.netData = await (await fetch(this.baseUrl + data, {
      headers: { ...this.headerConfig },
      method: "get"
    })).json();
    else this.netData = await fetch(this.baseUrl + data, { headers: { ...this.headerConfig }, method: "get" });
    return this;
  }
}
//export const baseUrl =  "http://localhost:3000";
export const promoUrl = "https://promo.rydlearning.com";
// export const baseUrl =  "https://ryd-learning-api-v2.onrender.com"
export const baseUrl =  "https://api-pro.rydlearning.com";

export default Network