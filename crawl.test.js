const { test, expect } = require('@jest/globals')
const { normalizeURL, getURLsFromHTML } = require('./crawl.js')
const { afterEach } = require('node:test')
const { toBindingIdentifierName } = require('@babel/types')


test('URL checking', () => {
    expect(normalizeURL('https://blog.boot.dev/path/')).toBe('blog.boot.dev/path')
})


  
test('getURLsFromHTML both', async () => {
    const fs = require('fs').promises;  // Usar promesas en lugar de callbacks
    const nombreArchivo = 'testeo.html';

    try {
        const dato = await fs.readFile(nombreArchivo, 'utf8');

        const inputURL = 'https://boot.dev';
        const inputBody = dato;
        const actual = getURLsFromHTML(inputBody, inputURL);
        const expected = ['https://boot.dev', 'https://boot.dev/path', 'https://www.youtube.com'];

        expect(actual).toEqual(expected);
    } catch (error) {
        console.log(`${error.message}`);
    }
});

  
test('getURLsFromHTML handle error', () => {
    const inputURL = 'https://blog.boot.dev'
    const inputBody = '<html><body><a href="path/one"><span>Boot.dev></span></a></body></html>'
    const actual = getURLsFromHTML(inputBody, inputURL)
    const expected = [ ]
    expect(actual).toEqual(expected)
})