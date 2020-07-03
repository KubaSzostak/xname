/* 
    https://github.com/kubaszostak/xname
*/

interface Cache<T> {
    [name: string]: T;
}



export class XNamespace {

    public static readonly none = new XNamespace("");
    public static readonly xml = new XNamespace("http://www.w3.org/XML/1998/namespace", "xml");
    public static readonly html = new XNamespace("http://www.w3.org/1999/xhtml", "html");
    public static readonly xlink = new XNamespace("http://www.w3.org/1999/xlink", "xlink");
    public static readonly xmlns = new XNamespace("http://www.w3.org/2000/xmlns/", "xmlns");
    public static readonly svg = new XNamespace("http://www.w3.org/2000/svg", "svg");

    private static readonly namespaceCache: Cache<XNamespace> = {};


    protected constructor(public uri: string, public readonly preferredPrefix = "") {
        this.uri = uri || "";
    }


    public toString() {
        return this.uri || "XNamespace.none";
    };


    static get(uri: string, preferredPrefix?: string): XNamespace {
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
    };


    public getName(localName: string): XName {
        return XName.get(localName, this);
    };

}



export class XName {

    /** Local element name, eg. 'layout' */
    public readonly localName: string;
    /** Qualified element name, eg. 'chart:layout' */
    public readonly qualifiedName: string;

    private readonly xmlnsAttrName: string;
    private static nameCache: Cache<XName> = {};


    protected constructor(public namespace: XNamespace, localName: string) {
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


    public static get(localName: string, ns: XNamespace = XNamespace.none): XName {
        return this.getFromCache(ns, localName);
    }


    private static getFromCache(ns: XNamespace, ln: string): XName {
        let fqn = ns.uri + "{" + ln + "}";

        if (this.nameCache[fqn] === undefined) {
            let xn = new XName(ns, ln);
            this.nameCache[fqn] = xn;
        }
        return this.nameCache[fqn];
    }


    public toString() {
        return this.namespace.uri + "{" + this.localName + "}";
    };


    /** Document with root element name defined by 'localName' and default namespace defined by 'namespace.uri' */
    public createDocument(): Document {
        return document.implementation.createDocument(this.namespace.uri, this.qualifiedName, null);
    }


    public descendants(owner: Element): Element[] {
        let elColl = owner.getElementsByTagNameNS(this.namespace.uri, this.localName);
        return Array.from(elColl);
    }


    /** @deprecated use element() instead*/
    public descendant(owner: Element): Element | null {
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


    public elements(parent: Element): Element[] {
        return this.descendants(parent).filter(e => e.parentElement == parent);
    }


    public element(parent: Element, ifNotExists: "append" | "insert"): Element;
    public element(parent: Element, ifNotExists?: "append" | "insert"): Element | null;
    public element(parent: Element, ifNotExists?: "append" | "insert"): Element | null {
        
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


    public hasElement(parent: Element): boolean {
        return this.elements(parent).length > 1;
    }


    public setHasElement(parent: Element, hasElement: boolean = true) {
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


    private appendDocNs(element: Element) {
        if (this.namespace == XNamespace.none) {
            return;
        }
        let docElement = element?.ownerDocument?.documentElement
        if (docElement?.hasAttribute(this.xmlnsAttrName)) {
            return;
        }
        docElement?.setAttributeNS(XNamespace.xmlns.uri, this.xmlnsAttrName, this.namespace.uri);
    }


    public insertElement(parent: Element): Element {
        if (!parent.ownerDocument){
            const errMsg = "Element " + parent.localName + " does not have ownerDocument assigned.";
            console.warn(errMsg, parent);
            throw new Error(errMsg);
        }
        this.appendDocNs(parent);
        let e = parent.ownerDocument.createElementNS(this.namespace.uri, this.qualifiedName);
        parent.insertBefore(e, parent.firstChild);
        return e;
    }


    public appendElement(parent: Element): Element {
        if (!parent.ownerDocument){
            const errMsg = "Element " + parent.localName + " does not have ownerDocument assigned.";
            console.warn(errMsg, parent);
            throw new Error(errMsg);
        }
        this.appendDocNs(parent);
        let e = parent.ownerDocument.createElementNS(this.namespace.uri, this.qualifiedName);
        parent.appendChild(e);
        return e;
    }


    public getAttribute(element: Element): string | null {
        return element.getAttributeNS(this.namespace.uri, this.localName);
    }


    public setAttribute(element: Element, value: string) {
        this.appendDocNs(element);
        element.setAttributeNS(this.namespace.uri, this.qualifiedName, value);
    }


    public setElementValue(container: Element, value: string) {
        this.element(container, "append").textContent = value;
    }


    public getElementValue(container: Element): string | null {
        return this.element(container)?.textContent || null;
    }

}
