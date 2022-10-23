const axios = require('axios')

const BASE_URL_1 = 'https://jsonplaceholder.typicode.com'
const BASE_URL_2 = 'https://dummyjson.com'

const fetchData = async (url)=>{
  const result = await axios.get(`${url}`, {
    headers: { 'access-control-allow-origin': '*' }
  }).catch(err=>{
    return err.response
  })

  if (result && result.data) {
    return {
      success: true,
      message: 'success',
      data: result.data
    }
  } else {
    // console.error(result)
    return {
      success: false,
      message: 'server error'
    }
  }
}

const getPosts = async ()=>{
  return await fetchData(`${BASE_URL_1}/posts`)
}

const getComments = async ()=>{
  return await fetchData(`${BASE_URL_1}/comments`)
}

const getUsers = async ()=>{
  return await fetchData(`${BASE_URL_1}/users`)
}

const getProducts = async ()=>{
  return await fetchData(`${BASE_URL_2}/products`)
}

module.exports = {
  getPosts,
  getComments,
  getUsers,
  getProducts
}