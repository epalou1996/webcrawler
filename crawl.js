const { JSDOM } = require('jsdom')

async function crawlPage(baseURL, currentURL, pages){
    console.log(`crawling ${currentURL}`)

    // probaremos primero si la url comparte dominio con la url base
    const currentUrlObj = new URL(currentURL)
    const baseUrlObj = new URL(baseURL)
    
    if (currentUrlObj.hostname !== baseUrlObj.hostname){
        return pages
    }
  
    const normalizedURL = normalizeURL(currentURL)

    // Esto sirve para que si ya hemos pasado por aqui no vuelva 
    // a realizar el proceso

    if (pages[normalizedURL] > 0) {
        pages[normalizedURL]++
        return pages
    }

    // Al haber pasado el anterior filtro, debemos inicializar
    // esta pagina
    if (currentURL === baseURL){
        pages[normalizedURL] = 0
    }else{
        pages[normalizedURL] = 1
    } 

    // Aqui comenzaremos el fetch de esta pagina
    console.log(`crawling ${currentURL}`)
    let htmlBody = ''
    try {
      const resp = await fetch(currentURL)
      if (resp.status > 399){
        console.log(`Got HTTP error, status code: ${resp.status}`)
        return pages
      }
      const contentType = resp.headers.get('content-type')
      if (!contentType.includes('text/html')){
        console.log(`Got non-html response: ${contentType}`)
        return pages
      }
      htmlBody = await resp.text()
    } catch (err){
      console.log(err.message)
    }
  
    const nextURLs = getURLsFromHTML(htmlBody, baseURL)
    for (const nextURL of nextURLs){
      pages = await crawlPage(baseURL, nextURL, pages)
    }
  
    return pages
}

function getURLsFromHTML(htmlBody, baseURL){
    const urls = []
    const dom = new JSDOM(htmlBody)
    const aElements = dom.window.document.querySelectorAll('a')
    for (const aElement of aElements){
      if (aElement.href.slice(0,1) === '/'){
        try {
          urls.push(new URL(aElement.href, baseURL).href)
        } catch (err){
          console.log(`${err.message}: ${aElement.href}`)
        }
      } else {
        try {
          urls.push(new URL(aElement.href).href)
        } catch (err){
          console.log(`${err.message}: ${aElement.href}`)
        }
      }
    }
    return urls
  }


    
async function normalizeURL(url){
    const urlObj = new URL(url)
    let fullPath = `${urlObj.host}${urlObj.pathname}`
    if (fullPath.length > 0 && fullPath.slice(-1) === '/'){
      fullPath = fullPath.slice(0, -1)
    }
    return fullPath
  }



  module.exports = {
    normalizeURL,
    getURLsFromHTML,
    crawlPage
  }