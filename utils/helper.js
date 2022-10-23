module.exports = {
  extractData: (req)=>{
    return {
      params: req.params,
      query: req.query,
      body: req.body,
    }
  }
}