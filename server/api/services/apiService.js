'use strict';
const Hapi = require('@hapi/hapi');
const { Octokit } = require("@octokit/core");
const { createOAuthAppAuth } = require("@octokit/auth-oauth-app");
const {
    paginateRest,
    composePaginateRest,
  } = require("@octokit/plugin-paginate-rest");
const dataGit = require('./data.json')

require('dotenv').config();

const MyOctokit = Octokit.plugin(paginateRest);

const initOctokit = async () => {
  try{
    return new MyOctokit({
      authStrategy:createOAuthAppAuth,
      auth: {
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET
      }
    });
  }
  catch(error) {
    console.log(error)
  }
}

const octokit = initOctokit();

const getRepoByTag = async (tag="nodejs", nbPages=10) => {
  const data = await octokit.paginate(`GET /search/repositories?q=${tag}&per_page=${nbPages}`,
    (response) => response.data.map((issue) => {
      return {
        id: issue.id,
        name: issue.name,
        owner : issue.owner.login,
        desc : issue.description
      };
    })
  )
  return data;
}

//Trying to emulate the fetching from the Github's API with official results
const getRepoByTag2 = () => {
  return dataGit.items.map((issue) => {
    return {
      id: issue.id,
      name: issue.name,
      owner : issue.owner.login,
      desc : issue.description
    };
  })
}


const childSetter = (arr) => {

  let temp = [];

  for(let key in arr){
     arr[key].map((e, i) =>{
        temp = temp.concat(e)
     })
  }

  let minimalLevel = temp.reduce((acc, currVal) => acc < currVal.level ? acc : currVal.level , null)

  // we check that the index exists otherwise it would throw an error
  temp.forEach(e => {
     if (e.parent_id && temp.findIndex(f => f.id === e.parent_id) > -1)
     temp[temp.findIndex(f => f.id === e.parent_id)].children.push(e)
  })

  return temp.filter(e => e.level === minimalLevel)
}


module.exports = {
  childSetter,
  getRepoByTag,
  getRepoByTag2
}
