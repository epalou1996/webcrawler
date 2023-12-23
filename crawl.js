async function crawlPage(baseURL, currentURL, pages){

  //En esta parte creamos objetos url que nos ayudan a determinar si el link pertenece o no al mismo dominio
  const currentURLobj = new URL(currentURL)
  const baseURLobj = new URL(baseURL)
  if (currentURLobj.hostname !== baseURLobj.hostname){
    return pages
  }

  // Aqui vamos estableciendo en el objeto pages, los nuevos elementos que se van agregando, si ya han sido llamados antes, solo se anadira una cuenta y 
  // continuara con la busqueda del siguiente
  const normalizedURL = normalizeURLs(currentURL)
  if ( pages[normalizedURL] > 0){
    pages[normalizedURL]++
    return pages
  }


  if (baseURL === currentURL) {
    pages[normalizedURL] = 0
  }else {
    pages[normalizedURL] = 1
  }
  
  // Aqui ya se comienza el fetch, con lo que llamaremos a la funcion getURLsfromHTML
  
  let htmlBody = ''
  try{
    const resp = await fetch(currentURL)
    if (resp.status > 399){
      console.log(`La pagina ${currentURL} no ha podido ser cargada y tiene el error ${resp.status}`)
      return pages
    }
    const contentType = resp.headers.get('content-type')
    if (!contentType.includes('text/html')){
      console.log(`El formato de la pagina web: ${currentURL} es invalido por lo cual sera omitido`)
      return pages
    }
    htmlBody = await resp.text()
  }catch (err){
    console.log(`Con la pagina web ${currentURL} ha ocurrido el siguiente error: ${err.message}`)
  }
  
  const newPages = getURLsFromHTML(htmlBody, currentURL)
  for (const newPage of newPages){
    pages = await crawlPage(baseURL, newPage, pages)

  }
  
  return pages
}

const { JSDOM } = require('jsdom')
//Esta funcion, nos ayudara a obtener todas las urls que tiene una pagina, con esto podremos, de manera recursiva, navegar por todos los links de una pagina

function getURLsFromHTML(htmlBody, baseURL){
  const dom = new JSDOM(htmlBody)
  const aElements  = dom.window.document.querySelectorAll('a')
  const urls = []
  for (const aElement of aElements) {
    if (aElement.href.slice(0,1)  === '/'){
      try{
        urls.push(new URL(aElement, baseURL).href)
      }catch(err){
        console.log(`${err.message}: ${aElement.href}`)
      }  
    } else {
      try{
        urls.push(new URL(aElement.href).href)
      } catch (err) {
        console.log(`${err.message}: ${aElement.href}`)
      }
    }
  }
  return urls
}


// Esta funcion normaliza urls, lo que nos servira para verificar que las urls solo se visiten 1 vez
function normalizeURLs(url){
  const newURL = new URL(url)
  let fullURL = `${newURL.hostname}${newURL.pathname}`
  if (fullURL.length > 0 && fullURL.slice(-1) === '/') {
    fullURL = fullURL.slice(0,-1)
  }
  return fullURL
}

module.exports ={
  normalizeURLs,
  getURLsFromHTML,
  crawlPage
}

