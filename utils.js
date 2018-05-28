const jsdom = require('jsdom')
const https = require('https')
const crypto = require('crypto')
const { JSDOM } = jsdom

module.exports = {
    getNodeFromContent,
    createTelegraphPage
}

function getNodeFromContent (content) {
    const randomId = getRandomId()
    const { document } = new JSDOM(`
        <!DOCTYPE html>
        <div id="${randomId}">${content}</div>`).window
    return domToNode(document.getElementById(randomId)).children
}

function getRandomId () {
    return `id-${crypto.randomBytes(8).toString('hex')}`
}

async function createTelegraphPage (postData) {
    const options = {
        hostname: 'api.telegra.ph',
        port: 443,
        path: '/createPage',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
    };
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let content = ""
            res.setEncoding('utf8');
            res.on('data', (chunk) => {
              content += chunk
            });
            res.on('end', () => {
              resolve(content)
            });
        });
        req.on('error', (error) => {
            reject(error)
        });

        // write data to request body
        req.write(JSON.stringify(postData));
        req.end();
    })
}

function domToNode(domNode) {
    if (domNode.nodeType == domNode.TEXT_NODE) {
        return domNode.data;
    }
    if (domNode.nodeType != domNode.ELEMENT_NODE) {
        return false;
    }
    var nodeElement = {};
    nodeElement.tag = domNode.tagName.toLowerCase();
    for (var i = 0; i < domNode.attributes.length; i++) {
        var attr = domNode.attributes[i];
        if (attr.name == 'href' || attr.name == 'src') {
        if (!nodeElement.attrs) {
            nodeElement.attrs = {};
        }
        nodeElement.attrs[attr.name] = attr.value;
        }
    }
    if (domNode.childNodes.length > 0) {
        nodeElement.children = [];
        for (var i = 0; i < domNode.childNodes.length; i++) {
        var child = domNode.childNodes[i];
        nodeElement.children.push(domToNode(child));
        }
    }
    return nodeElement;
}
  
function nodeToDom(node) {
    if (typeof node === 'string' || node instanceof String) {
        return document.createTextNode(node);
    }
    if (node.tag) {
        var domNode = document.createElement(node.tag);
        if (node.attrs) {
        for (var name in node.attrs) {
            var value = node.attrs[name];
            domNode.setAttribute(name, value);
        }
        }
    } else {
        var domNode = document.createDocumentFragment();
    }
    if (node.children) {
        for (var i = 0; i < node.children.length; i++) {
        var child = node.children[i];
        domNode.appendChild(nodeToDom(child));
        }
    }
    return domNode;
}