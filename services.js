const axios = require('axios');

const BASE_URL = 'https://jsonplaceholder.typicode.com'

const fetchData = async (url)=>{
  const result = await axios.get(`${BASE_URL}${url}`)
  .catch(err=>{
    err.response
  })

  if (result && result.data && result.data.length > 0) {
    return {
      success: true,
      message: 'success',
      data: result.data
    }
  } else {
    console.error(result.data)
    return {
      success: false,
      message: 'server error'
    }
  }
}

const getPosts = async ()=>{
  return await fetchData('/posts')
}

const getComments = async ()=>{
  return await fetchData('/comments')
}

const getUsers = async ()=>{
  return await fetchData('/users')
}

module.exports = {
  getPosts,
  getComments,
  getUsers
}