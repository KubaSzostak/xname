export declare class XNamespace {
    uri: string;
    readonly preferredPrefix: string;
    static readonly none: XNamespace;
    static readonly xml: XNamespace;
    static readonly html: XNamespace;
    static readonly xlink: XNamespace;
    static readonly xmlns: XNamespace;
    static readonly svg: XNamespace;
    private static readonly namespaceCache;
    protected constructor(uri: string, preferredPrefix?: string);
    toString(): string;
    static get(uri: string, preferredPrefix?: string): XNamespace;
    getName(localName: string): XName;
}
export declare class XName {
    namespace: XNamespace;
    /** Local element name, eg. 'layout' */
    readonly localName: string;
    /** Qualified element name, eg. 'chart:layout' */
    readonly qualifiedName: string;
    private readonly xmlnsAttrName;
    private static nameCache;
    protected constructor(namespace: XNamespace, localName: string);
    static get(localName: string, ns?: XNamespace): XName;
    private static getFromCache;
    toString(): string;
    /** Document with root element name defined by 'localName' and default namespace defined by 'namespace.uri' */
    createDocument(): Document;
    descendants(owner: Element): Element[];
    /** @deprecated use element() instead*/
    descendant(owner: Element): Element | null;
    elements(parent: Element): Element[];
    element(parent: Element, ifNotExists: "append" | "insert"): Element;
    element(parent: Element, ifNotExists?: "append" | "insert"): Element | null;
    hasElement(parent: Element): boolean;
    setHasElement(parent: Element, hasElement?: boolean): void;
    private appendDocNs;
    insertElement(parent: Element): Element;
    appendElement(parent: Element): Element;
    getAttribute(element: Element): string | null;
    setAttribute(element: Element, value: string): void;
    setElementValue(container: Element, value: string): void;
    getElementValue(container: Element): string | null;
}
