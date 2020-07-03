/*
    https://github.com/kubaszostak/xname
*/
define(["require", "exports"], function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.XName = exports.XNamespace = void 0;
    class XNamespace {
        constructor(uri, preferredPrefix = "") {
            this.uri = uri;
            this.preferredPrefix = preferredPrefix;
            this.uri = uri || "";
        }
        toString() {
            return this.uri || "XNamespace.none";
        }
        ;
        static get(uri, preferredPrefix) {
            if (!uri) {
                return this.none;
            }
            else if (uri == XNamespace.xml.uri) {
                return XNamespace.xml;
            }
            else if (uri == XNamespace.xmlns.uri) {
                return XNamespace.xmlns;
            }
            if (XNamespace.namespaceCache[uri] == undefined) {
                XNamespace.namespaceCache[uri] = new XNamespace(uri, preferredPrefix);
            }
            return XNamespace.namespaceCache[uri];
        }
        ;
        getName(localName) {
            return XName.get(localName, this);
        }
        ;
    }
    exports.XNamespace = XNamespace;
    XNamespace.none = new XNamespace("");
    XNamespace.xml = new XNamespace("http://www.w3.org/XML/1998/namespace", "xml");
    XNamespace.html = new XNamespace("http://www.w3.org/1999/xhtml", "html");
    XNamespace.xlink = new XNamespace("http://www.w3.org/1999/xlink", "xlink");
    XNamespace.xmlns = new XNamespace("http://www.w3.org/2000/xmlns/", "xmlns");
    XNamespace.svg = new XNamespace("http://www.w3.org/2000/svg", "svg");
    XNamespace.namespaceCache = {};
    class XName {
        constructor(namespace, localName) {
            this.namespace = namespace;
            this.localName = localName || "_";
            this.namespace = namespace || XNamespace.none;
            if ((this.namespace == XNamespace.none) || !this.namespace.preferredPrefix) {
                this.xmlnsAttrName = "";
                this.qualifiedName = this.localName;
            }
            else {
                this.xmlnsAttrName = "xmlns:" + namespace.preferredPrefix;
                this.qualifiedName = namespace.preferredPrefix + ":" + this.localName;
            }
        }
        static get(localName, ns = XNamespace.none) {
            return this.getFromCache(ns, localName);
        }
        static getFromCache(ns, ln) {
            let fqn = ns.uri + "{" + ln + "}";
            if (this.nameCache[fqn] === undefined) {
                let xn = new XName(ns, ln);
                this.nameCache[fqn] = xn;
            }
            return this.nameCache[fqn];
        }
        toString() {
            return this.namespace.uri + "{" + this.localName + "}";
        }
        ;
        /** Document with root element name defined by 'localName' and default namespace defined by 'namespace.uri' */
        createDocument() {
            return document.implementation.createDocument(this.namespace.uri, this.qualifiedName, null);
        }
        descendants(owner) {
            let elColl = owner.getElementsByTagNameNS(this.namespace.uri, this.localName);
            return Array.from(elColl);
        }
        /** @deprecated use element() instead*/
        descendant(owner) {
            let elColl = owner.getElementsByTagNameNS(this.namespace.uri, this.localName);
            if (elColl.length > 1) {
                console.warn(owner);
                throw "There are many " + this.localName + " descendant elements in " + owner.nodeName;
            }
            if (elColl.length < 1) {
                return null;
            }
            return elColl[0];
        }
        elements(parent) {
            return this.descendants(parent).filter(e => e.parentElement == parent);
        }
        element(parent, ifNotExists) {
            let elements = this.elements(parent);
            if (elements.length > 1) {
                const errMsg = "There are many " + this.localName + " child elements in " + parent.nodeName;
                console.warn(errMsg, parent);
                throw new Error(errMsg);
            }
            if (elements.length === 1) {
                return elements[0];
            }
            if (ifNotExists === "append") {
                return this.appendElement(parent);
            }
            if (ifNotExists === "insert") {
                return this.insertElement(parent);
            }
            return null;
        }
        hasElement(parent) {
            return this.elements(parent).length > 1;
        }
        setHasElement(parent, hasElement = true) {
            let elements = this.elements(parent);
            if (hasElement) {
                if (elements.length < 1) {
                    this.appendElement(parent);
                }
            }
            else {
                for (const el of elements) {
                    el.remove();
                }
            }
        }
        appendDocNs(element) {
            var _a;
            if (this.namespace == XNamespace.none) {
                return;
            }
            let docElement = (_a = element === null || element === void 0 ? void 0 : element.ownerDocument) === null || _a === void 0 ? void 0 : _a.documentElement;
            if (docElement === null || docElement === void 0 ? void 0 : docElement.hasAttribute(this.xmlnsAttrName)) {
                return;
            }
            docElement === null || docElement === void 0 ? void 0 : docElement.setAttributeNS(XNamespace.xmlns.uri, this.xmlnsAttrName, this.namespace.uri);
        }
        insertElement(parent) {
            if (!parent.ownerDocument) {
                const errMsg = "Element " + parent.localName + " does not have ownerDocument assigned.";
                console.warn(errMsg, parent);
                throw new Error(errMsg);
            }
            this.appendDocNs(parent);
            let e = parent.ownerDocument.createElementNS(this.namespace.uri, this.qualifiedName);
            parent.insertBefore(e, parent.firstChild);
            return e;
        }
        appendElement(parent) {
            if (!parent.ownerDocument) {
                const errMsg = "Element " + parent.localName + " does not have ownerDocument assigned.";
                console.warn(errMsg, parent);
                throw new Error(errMsg);
            }
            this.appendDocNs(parent);
            let e = parent.ownerDocument.createElementNS(this.namespace.uri, this.qualifiedName);
            parent.appendChild(e);
            return e;
        }
        getAttribute(element) {
            return element.getAttributeNS(this.namespace.uri, this.localName);
        }
        setAttribute(element, value) {
            this.appendDocNs(element);
            element.setAttributeNS(this.namespace.uri, this.qualifiedName, value);
        }
        setElementValue(container, value) {
            this.element(container, "append").textContent = value;
        }
        getElementValue(container) {
            var _a;
            return ((_a = this.element(container)) === null || _a === void 0 ? void 0 : _a.textContent) || null;
        }
    }
    exports.XName = XName;
    XName.nameCache = {};
});
//# sourceMappingURL=xname.js.map