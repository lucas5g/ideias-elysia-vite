(function() {
  "use strict";
  const VERSION = "0.7.0";
  let auto = false;
  let kind = void 0;
  let fetch$1 = void 0;
  let FormData$1 = void 0;
  let File$1 = void 0;
  let ReadableStream$1 = void 0;
  let getMultipartRequestOptions = void 0;
  let getDefaultAgent = void 0;
  let fileFromPath = void 0;
  let isFsReadStream = void 0;
  function setShims(shims, options = { auto: false }) {
    if (auto) {
      throw new Error(`you must \`import 'groq-sdk/shims/${shims.kind}'\` before importing anything else from groq-sdk`);
    }
    if (kind) {
      throw new Error(`can't \`import 'groq-sdk/shims/${shims.kind}'\` after \`import 'groq-sdk/shims/${kind}'\``);
    }
    auto = options.auto;
    kind = shims.kind;
    fetch$1 = shims.fetch;
    FormData$1 = shims.FormData;
    File$1 = shims.File;
    ReadableStream$1 = shims.ReadableStream;
    getMultipartRequestOptions = shims.getMultipartRequestOptions;
    getDefaultAgent = shims.getDefaultAgent;
    fileFromPath = shims.fileFromPath;
    isFsReadStream = shims.isFsReadStream;
  }
  class MultipartBody {
    constructor(body) {
      this.body = body;
    }
    get [Symbol.toStringTag]() {
      return "MultipartBody";
    }
  }
  function getRuntime({ manuallyImported } = {}) {
    const recommendation = manuallyImported ? `You may need to use polyfills` : `Add one of these imports before your first \`import … from 'groq-sdk'\`:
- \`import 'groq-sdk/shims/node'\` (if you're running on Node)
- \`import 'groq-sdk/shims/web'\` (otherwise)
`;
    let _fetch, _Request, _Response, _Headers;
    try {
      _fetch = fetch;
      _Request = Request;
      _Response = Response;
      _Headers = Headers;
    } catch (error) {
      throw new Error(`this environment is missing the following Web Fetch API type: ${error.message}. ${recommendation}`);
    }
    return {
      kind: "web",
      fetch: _fetch,
      Request: _Request,
      Response: _Response,
      Headers: _Headers,
      FormData: (
        // @ts-ignore
        typeof FormData !== "undefined" ? FormData : class FormData {
          // @ts-ignore
          constructor() {
            throw new Error(`file uploads aren't supported in this environment yet as 'FormData' is undefined. ${recommendation}`);
          }
        }
      ),
      Blob: typeof Blob !== "undefined" ? Blob : class Blob {
        constructor() {
          throw new Error(`file uploads aren't supported in this environment yet as 'Blob' is undefined. ${recommendation}`);
        }
      },
      File: (
        // @ts-ignore
        typeof File !== "undefined" ? File : class File {
          // @ts-ignore
          constructor() {
            throw new Error(`file uploads aren't supported in this environment yet as 'File' is undefined. ${recommendation}`);
          }
        }
      ),
      ReadableStream: (
        // @ts-ignore
        typeof ReadableStream !== "undefined" ? ReadableStream : class ReadableStream {
          // @ts-ignore
          constructor() {
            throw new Error(`streaming isn't supported in this environment yet as 'ReadableStream' is undefined. ${recommendation}`);
          }
        }
      ),
      getMultipartRequestOptions: async (form, opts) => ({
        ...opts,
        body: new MultipartBody(form)
      }),
      getDefaultAgent: (url) => void 0,
      fileFromPath: () => {
        throw new Error("The `fileFromPath` function is only supported in Node. See the README for more details: https://www.github.com/groq/groq-typescript#file-uploads");
      },
      isFsReadStream: (value) => false
    };
  }
  if (!kind) setShims(getRuntime(), { auto: true });
  class Stream {
    constructor(iterator, controller) {
      this.iterator = iterator;
      this.controller = controller;
    }
    static fromSSEResponse(response, controller) {
      let consumed = false;
      const decoder = new SSEDecoder();
      async function* iterMessages() {
        if (!response.body) {
          controller.abort();
          throw new GroqError(`Attempted to iterate over a response with no body`);
        }
        const lineDecoder = new LineDecoder();
        const iter = readableStreamAsyncIterable(response.body);
        for await (const chunk of iter) {
          for (const line of lineDecoder.decode(chunk)) {
            const sse = decoder.decode(line);
            if (sse)
              yield sse;
          }
        }
        for (const line of lineDecoder.flush()) {
          const sse = decoder.decode(line);
          if (sse)
            yield sse;
        }
      }
      async function* iterator() {
        if (consumed) {
          throw new Error("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        }
        consumed = true;
        let done = false;
        try {
          for await (const sse of iterMessages()) {
            if (done)
              continue;
            if (sse.data.startsWith("[DONE]")) {
              done = true;
              continue;
            }
            if (sse.event === null || sse.event === "error") {
              let data;
              try {
                data = JSON.parse(sse.data);
              } catch (e) {
                console.error(`Could not parse message into JSON:`, sse.data);
                console.error(`From chunk:`, sse.raw);
                throw e;
              }
              if (data && data.error) {
                throw new APIError(data.error.status_code, data.error, data.error.message, void 0);
              }
              yield data;
            }
          }
          done = true;
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError")
            return;
          throw e;
        } finally {
          if (!done)
            controller.abort();
        }
      }
      return new Stream(iterator, controller);
    }
    /**
     * Generates a Stream from a newline-separated ReadableStream
     * where each item is a JSON value.
     */
    static fromReadableStream(readableStream, controller) {
      let consumed = false;
      async function* iterLines() {
        const lineDecoder = new LineDecoder();
        const iter = readableStreamAsyncIterable(readableStream);
        for await (const chunk of iter) {
          for (const line of lineDecoder.decode(chunk)) {
            yield line;
          }
        }
        for (const line of lineDecoder.flush()) {
          yield line;
        }
      }
      async function* iterator() {
        if (consumed) {
          throw new Error("Cannot iterate over a consumed stream, use `.tee()` to split the stream.");
        }
        consumed = true;
        let done = false;
        try {
          for await (const line of iterLines()) {
            if (done)
              continue;
            if (line)
              yield JSON.parse(line);
          }
          done = true;
        } catch (e) {
          if (e instanceof Error && e.name === "AbortError")
            return;
          throw e;
        } finally {
          if (!done)
            controller.abort();
        }
      }
      return new Stream(iterator, controller);
    }
    [Symbol.asyncIterator]() {
      return this.iterator();
    }
    /**
     * Splits the stream into two streams which can be
     * independently read from at different speeds.
     */
    tee() {
      const left = [];
      const right = [];
      const iterator = this.iterator();
      const teeIterator = (queue) => {
        return {
          next: () => {
            if (queue.length === 0) {
              const result = iterator.next();
              left.push(result);
              right.push(result);
            }
            return queue.shift();
          }
        };
      };
      return [
        new Stream(() => teeIterator(left), this.controller),
        new Stream(() => teeIterator(right), this.controller)
      ];
    }
    /**
     * Converts this stream to a newline-separated ReadableStream of
     * JSON stringified values in the stream
     * which can be turned back into a Stream with `Stream.fromReadableStream()`.
     */
    toReadableStream() {
      const self = this;
      let iter;
      const encoder = new TextEncoder();
      return new ReadableStream$1({
        async start() {
          iter = self[Symbol.asyncIterator]();
        },
        async pull(ctrl) {
          try {
            const { value, done } = await iter.next();
            if (done)
              return ctrl.close();
            const bytes = encoder.encode(JSON.stringify(value) + "\n");
            ctrl.enqueue(bytes);
          } catch (err) {
            ctrl.error(err);
          }
        },
        async cancel() {
          var _a2;
          await ((_a2 = iter.return) == null ? void 0 : _a2.call(iter));
        }
      });
    }
  }
  class SSEDecoder {
    constructor() {
      this.event = null;
      this.data = [];
      this.chunks = [];
    }
    decode(line) {
      if (line.endsWith("\r")) {
        line = line.substring(0, line.length - 1);
      }
      if (!line) {
        if (!this.event && !this.data.length)
          return null;
        const sse = {
          event: this.event,
          data: this.data.join("\n"),
          raw: this.chunks
        };
        this.event = null;
        this.data = [];
        this.chunks = [];
        return sse;
      }
      this.chunks.push(line);
      if (line.startsWith(":")) {
        return null;
      }
      let [fieldname, _, value] = partition(line, ":");
      if (value.startsWith(" ")) {
        value = value.substring(1);
      }
      if (fieldname === "event") {
        this.event = value;
      } else if (fieldname === "data") {
        this.data.push(value);
      }
      return null;
    }
  }
  class LineDecoder {
    constructor() {
      this.buffer = [];
      this.trailingCR = false;
    }
    decode(chunk) {
      let text = this.decodeText(chunk);
      if (this.trailingCR) {
        text = "\r" + text;
        this.trailingCR = false;
      }
      if (text.endsWith("\r")) {
        this.trailingCR = true;
        text = text.slice(0, -1);
      }
      if (!text) {
        return [];
      }
      const trailingNewline = LineDecoder.NEWLINE_CHARS.has(text[text.length - 1] || "");
      let lines = text.split(LineDecoder.NEWLINE_REGEXP);
      if (lines.length === 1 && !trailingNewline) {
        this.buffer.push(lines[0]);
        return [];
      }
      if (this.buffer.length > 0) {
        lines = [this.buffer.join("") + lines[0], ...lines.slice(1)];
        this.buffer = [];
      }
      if (!trailingNewline) {
        this.buffer = [lines.pop() || ""];
      }
      return lines;
    }
    decodeText(bytes) {
      if (bytes == null)
        return "";
      if (typeof bytes === "string")
        return bytes;
      if (typeof Buffer !== "undefined") {
        if (bytes instanceof Buffer) {
          return bytes.toString();
        }
        if (bytes instanceof Uint8Array) {
          return Buffer.from(bytes).toString();
        }
        throw new GroqError(`Unexpected: received non-Uint8Array (${bytes.constructor.name}) stream chunk in an environment with a global "Buffer" defined, which this library assumes to be Node. Please report this error.`);
      }
      if (typeof TextDecoder !== "undefined") {
        if (bytes instanceof Uint8Array || bytes instanceof ArrayBuffer) {
          this.textDecoder ?? (this.textDecoder = new TextDecoder("utf8"));
          return this.textDecoder.decode(bytes);
        }
        throw new GroqError(`Unexpected: received non-Uint8Array/ArrayBuffer (${bytes.constructor.name}) in a web platform. Please report this error.`);
      }
      throw new GroqError(`Unexpected: neither Buffer nor TextDecoder are available as globals. Please report this error.`);
    }
    flush() {
      if (!this.buffer.length && !this.trailingCR) {
        return [];
      }
      const lines = [this.buffer.join("")];
      this.buffer = [];
      this.trailingCR = false;
      return lines;
    }
  }
  LineDecoder.NEWLINE_CHARS = /* @__PURE__ */ new Set(["\n", "\r", "\v", "\f", "", "", "", "", "\u2028", "\u2029"]);
  LineDecoder.NEWLINE_REGEXP = /\r\n|[\n\r\x0b\x0c\x1c\x1d\x1e\x85\u2028\u2029]/g;
  function partition(str, delimiter) {
    const index = str.indexOf(delimiter);
    if (index !== -1) {
      return [str.substring(0, index), delimiter, str.substring(index + delimiter.length)];
    }
    return [str, "", ""];
  }
  function readableStreamAsyncIterable(stream) {
    if (stream[Symbol.asyncIterator])
      return stream;
    const reader = stream.getReader();
    return {
      async next() {
        try {
          const result = await reader.read();
          if (result == null ? void 0 : result.done)
            reader.releaseLock();
          return result;
        } catch (e) {
          reader.releaseLock();
          throw e;
        }
      },
      async return() {
        const cancelPromise = reader.cancel();
        reader.releaseLock();
        await cancelPromise;
        return { done: true, value: void 0 };
      },
      [Symbol.asyncIterator]() {
        return this;
      }
    };
  }
  const isResponseLike = (value) => value != null && typeof value === "object" && typeof value.url === "string" && typeof value.blob === "function";
  const isFileLike = (value) => value != null && typeof value === "object" && typeof value.name === "string" && typeof value.lastModified === "number" && isBlobLike(value);
  const isBlobLike = (value) => value != null && typeof value === "object" && typeof value.size === "number" && typeof value.type === "string" && typeof value.text === "function" && typeof value.slice === "function" && typeof value.arrayBuffer === "function";
  const isUploadable = (value) => {
    return isFileLike(value) || isResponseLike(value) || isFsReadStream(value);
  };
  async function toFile(value, name, options) {
    var _a2;
    value = await value;
    options ?? (options = isFileLike(value) ? { lastModified: value.lastModified, type: value.type } : {});
    if (isResponseLike(value)) {
      const blob = await value.blob();
      name || (name = new URL(value.url).pathname.split(/[\\/]/).pop() ?? "unknown_file");
      return new File$1([blob], name, options);
    }
    const bits = await getBytes(value);
    name || (name = getName(value) ?? "unknown_file");
    if (!options.type) {
      const type = (_a2 = bits[0]) == null ? void 0 : _a2.type;
      if (typeof type === "string") {
        options = { ...options, type };
      }
    }
    return new File$1(bits, name, options);
  }
  async function getBytes(value) {
    var _a2;
    let parts = [];
    if (typeof value === "string" || ArrayBuffer.isView(value) || // includes Uint8Array, Buffer, etc.
    value instanceof ArrayBuffer) {
      parts.push(value);
    } else if (isBlobLike(value)) {
      parts.push(await value.arrayBuffer());
    } else if (isAsyncIterableIterator(value)) {
      for await (const chunk of value) {
        parts.push(chunk);
      }
    } else {
      throw new Error(`Unexpected data type: ${typeof value}; constructor: ${(_a2 = value == null ? void 0 : value.constructor) == null ? void 0 : _a2.name}; props: ${propsForError(value)}`);
    }
    return parts;
  }
  function propsForError(value) {
    const props = Object.getOwnPropertyNames(value);
    return `[${props.map((p) => `"${p}"`).join(", ")}]`;
  }
  function getName(value) {
    var _a2;
    return getStringFromMaybeBuffer(value.name) || getStringFromMaybeBuffer(value.filename) || // For fs.ReadStream
    ((_a2 = getStringFromMaybeBuffer(value.path)) == null ? void 0 : _a2.split(/[\\/]/).pop());
  }
  const getStringFromMaybeBuffer = (x) => {
    if (typeof x === "string")
      return x;
    if (typeof Buffer !== "undefined" && x instanceof Buffer)
      return String(x);
    return void 0;
  };
  const isAsyncIterableIterator = (value) => value != null && typeof value === "object" && typeof value[Symbol.asyncIterator] === "function";
  const isMultipartBody = (body) => body && typeof body === "object" && body.body && body[Symbol.toStringTag] === "MultipartBody";
  const multipartFormRequestOptions = async (opts) => {
    const form = await createForm(opts.body);
    return getMultipartRequestOptions(form, opts);
  };
  const createForm = async (body) => {
    const form = new FormData$1();
    await Promise.all(Object.entries(body || {}).map(([key, value]) => addFormValue(form, key, value)));
    return form;
  };
  const addFormValue = async (form, key, value) => {
    if (value === void 0)
      return;
    if (value == null) {
      throw new TypeError(`Received null for "${key}"; to pass null in FormData, you must use the string 'null'`);
    }
    if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
      form.append(key, String(value));
    } else if (isUploadable(value)) {
      const file = await toFile(value);
      form.append(key, file);
    } else if (Array.isArray(value)) {
      await Promise.all(value.map((entry) => addFormValue(form, key + "[]", entry)));
    } else if (typeof value === "object") {
      await Promise.all(Object.entries(value).map(([name, prop]) => addFormValue(form, `${key}[${name}]`, prop)));
    } else {
      throw new TypeError(`Invalid value given to form, expected a string, number, boolean, object, Array, File or Blob but got ${value} instead`);
    }
  };
  var define_process_env_default = {};
  async function defaultParseResponse(props) {
    const { response } = props;
    if (props.options.stream) {
      debug("response", response.status, response.url, response.headers, response.body);
      if (props.options.__streamClass) {
        return props.options.__streamClass.fromSSEResponse(response, props.controller);
      }
      return Stream.fromSSEResponse(response, props.controller);
    }
    if (response.status === 204) {
      return null;
    }
    if (props.options.__binaryResponse) {
      return response;
    }
    const contentType = response.headers.get("content-type");
    const isJSON = (contentType == null ? void 0 : contentType.includes("application/json")) || (contentType == null ? void 0 : contentType.includes("application/vnd.api+json"));
    if (isJSON) {
      const json = await response.json();
      debug("response", response.status, response.url, response.headers, json);
      return json;
    }
    const text = await response.text();
    debug("response", response.status, response.url, response.headers, text);
    return text;
  }
  class APIPromise extends Promise {
    constructor(responsePromise, parseResponse = defaultParseResponse) {
      super((resolve) => {
        resolve(null);
      });
      this.responsePromise = responsePromise;
      this.parseResponse = parseResponse;
    }
    _thenUnwrap(transform) {
      return new APIPromise(this.responsePromise, async (props) => transform(await this.parseResponse(props)));
    }
    /**
     * Gets the raw `Response` instance instead of parsing the response
     * data.
     *
     * If you want to parse the response body but still get the `Response`
     * instance, you can use {@link withResponse()}.
     *
     * 👋 Getting the wrong TypeScript type for `Response`?
     * Try setting `"moduleResolution": "NodeNext"` if you can,
     * or add one of these imports before your first `import … from 'groq-sdk'`:
     * - `import 'groq-sdk/shims/node'` (if you're running on Node)
     * - `import 'groq-sdk/shims/web'` (otherwise)
     */
    asResponse() {
      return this.responsePromise.then((p) => p.response);
    }
    /**
     * Gets the parsed response data and the raw `Response` instance.
     *
     * If you just want to get the raw `Response` instance without parsing it,
     * you can use {@link asResponse()}.
     *
     *
     * 👋 Getting the wrong TypeScript type for `Response`?
     * Try setting `"moduleResolution": "NodeNext"` if you can,
     * or add one of these imports before your first `import … from 'groq-sdk'`:
     * - `import 'groq-sdk/shims/node'` (if you're running on Node)
     * - `import 'groq-sdk/shims/web'` (otherwise)
     */
    async withResponse() {
      const [data, response] = await Promise.all([this.parse(), this.asResponse()]);
      return { data, response };
    }
    parse() {
      if (!this.parsedPromise) {
        this.parsedPromise = this.responsePromise.then(this.parseResponse);
      }
      return this.parsedPromise;
    }
    then(onfulfilled, onrejected) {
      return this.parse().then(onfulfilled, onrejected);
    }
    catch(onrejected) {
      return this.parse().catch(onrejected);
    }
    finally(onfinally) {
      return this.parse().finally(onfinally);
    }
  }
  class APIClient {
    constructor({
      baseURL,
      maxRetries = 2,
      timeout = 6e4,
      // 1 minute
      httpAgent,
      fetch: overridenFetch
    }) {
      this.baseURL = baseURL;
      this.maxRetries = validatePositiveInteger("maxRetries", maxRetries);
      this.timeout = validatePositiveInteger("timeout", timeout);
      this.httpAgent = httpAgent;
      this.fetch = overridenFetch ?? fetch$1;
    }
    authHeaders(opts) {
      return {};
    }
    /**
     * Override this to add your own default headers, for example:
     *
     *  {
     *    ...super.defaultHeaders(),
     *    Authorization: 'Bearer 123',
     *  }
     */
    defaultHeaders(opts) {
      return {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": this.getUserAgent(),
        ...getPlatformHeaders(),
        ...this.authHeaders(opts)
      };
    }
    /**
     * Override this to add your own headers validation:
     */
    validateHeaders(headers, customHeaders) {
    }
    defaultIdempotencyKey() {
      return `stainless-node-retry-${uuid4()}`;
    }
    get(path, opts) {
      return this.methodRequest("get", path, opts);
    }
    post(path, opts) {
      return this.methodRequest("post", path, opts);
    }
    patch(path, opts) {
      return this.methodRequest("patch", path, opts);
    }
    put(path, opts) {
      return this.methodRequest("put", path, opts);
    }
    delete(path, opts) {
      return this.methodRequest("delete", path, opts);
    }
    methodRequest(method, path, opts) {
      return this.request(Promise.resolve(opts).then(async (opts2) => {
        const body = opts2 && isBlobLike(opts2 == null ? void 0 : opts2.body) ? new DataView(await opts2.body.arrayBuffer()) : (opts2 == null ? void 0 : opts2.body) instanceof DataView ? opts2.body : (opts2 == null ? void 0 : opts2.body) instanceof ArrayBuffer ? new DataView(opts2.body) : opts2 && ArrayBuffer.isView(opts2 == null ? void 0 : opts2.body) ? new DataView(opts2.body.buffer) : opts2 == null ? void 0 : opts2.body;
        return { method, path, ...opts2, body };
      }));
    }
    getAPIList(path, Page, opts) {
      return this.requestAPIList(Page, { method: "get", path, ...opts });
    }
    calculateContentLength(body) {
      if (typeof body === "string") {
        if (typeof Buffer !== "undefined") {
          return Buffer.byteLength(body, "utf8").toString();
        }
        if (typeof TextEncoder !== "undefined") {
          const encoder = new TextEncoder();
          const encoded = encoder.encode(body);
          return encoded.length.toString();
        }
      } else if (ArrayBuffer.isView(body)) {
        return body.byteLength.toString();
      }
      return null;
    }
    buildRequest(options) {
      var _a2;
      const { method, path, query, headers = {} } = options;
      const body = ArrayBuffer.isView(options.body) || options.__binaryRequest && typeof options.body === "string" ? options.body : isMultipartBody(options.body) ? options.body.body : options.body ? JSON.stringify(options.body, null, 2) : null;
      const contentLength = this.calculateContentLength(body);
      const url = this.buildURL(path, query);
      if ("timeout" in options)
        validatePositiveInteger("timeout", options.timeout);
      const timeout = options.timeout ?? this.timeout;
      const httpAgent = options.httpAgent ?? this.httpAgent ?? getDefaultAgent(url);
      const minAgentTimeout = timeout + 1e3;
      if (typeof ((_a2 = httpAgent == null ? void 0 : httpAgent.options) == null ? void 0 : _a2.timeout) === "number" && minAgentTimeout > (httpAgent.options.timeout ?? 0)) {
        httpAgent.options.timeout = minAgentTimeout;
      }
      if (this.idempotencyHeader && method !== "get") {
        if (!options.idempotencyKey)
          options.idempotencyKey = this.defaultIdempotencyKey();
        headers[this.idempotencyHeader] = options.idempotencyKey;
      }
      const reqHeaders = this.buildHeaders({ options, headers, contentLength });
      const req = {
        method,
        ...body && { body },
        headers: reqHeaders,
        ...httpAgent && { agent: httpAgent },
        // @ts-ignore node-fetch uses a custom AbortSignal type that is
        // not compatible with standard web types
        signal: options.signal ?? null
      };
      return { req, url, timeout };
    }
    buildHeaders({ options, headers, contentLength }) {
      const reqHeaders = {};
      if (contentLength) {
        reqHeaders["content-length"] = contentLength;
      }
      const defaultHeaders = this.defaultHeaders(options);
      applyHeadersMut(reqHeaders, defaultHeaders);
      applyHeadersMut(reqHeaders, headers);
      if (isMultipartBody(options.body) && kind !== "node") {
        delete reqHeaders["content-type"];
      }
      this.validateHeaders(reqHeaders, headers);
      return reqHeaders;
    }
    /**
     * Used as a callback for mutating the given `FinalRequestOptions` object.
     */
    async prepareOptions(options) {
    }
    /**
     * Used as a callback for mutating the given `RequestInit` object.
     *
     * This is useful for cases where you want to add certain headers based off of
     * the request properties, e.g. `method` or `url`.
     */
    async prepareRequest(request, { url, options }) {
    }
    parseHeaders(headers) {
      return !headers ? {} : Symbol.iterator in headers ? Object.fromEntries(Array.from(headers).map((header) => [...header])) : { ...headers };
    }
    makeStatusError(status, error, message, headers) {
      return APIError.generate(status, error, message, headers);
    }
    request(options, remainingRetries = null) {
      return new APIPromise(this.makeRequest(options, remainingRetries));
    }
    async makeRequest(optionsInput, retriesRemaining) {
      var _a2, _b;
      const options = await optionsInput;
      if (retriesRemaining == null) {
        retriesRemaining = options.maxRetries ?? this.maxRetries;
      }
      await this.prepareOptions(options);
      const { req, url, timeout } = this.buildRequest(options);
      await this.prepareRequest(req, { url, options });
      debug("request", url, options, req.headers);
      if ((_a2 = options.signal) == null ? void 0 : _a2.aborted) {
        throw new APIUserAbortError();
      }
      const controller = new AbortController();
      const response = await this.fetchWithTimeout(url, req, timeout, controller).catch(castToError);
      if (response instanceof Error) {
        if ((_b = options.signal) == null ? void 0 : _b.aborted) {
          throw new APIUserAbortError();
        }
        if (retriesRemaining) {
          return this.retryRequest(options, retriesRemaining);
        }
        if (response.name === "AbortError") {
          throw new APIConnectionTimeoutError();
        }
        throw new APIConnectionError({ cause: response });
      }
      const responseHeaders = createResponseHeaders(response.headers);
      if (!response.ok) {
        if (retriesRemaining && this.shouldRetry(response)) {
          const retryMessage2 = `retrying, ${retriesRemaining} attempts remaining`;
          debug(`response (error; ${retryMessage2})`, response.status, url, responseHeaders);
          return this.retryRequest(options, retriesRemaining, responseHeaders);
        }
        const errText = await response.text().catch((e) => castToError(e).message);
        const errJSON = safeJSON(errText);
        const errMessage = errJSON ? void 0 : errText;
        const retryMessage = retriesRemaining ? `(error; no more retries left)` : `(error; not retryable)`;
        debug(`response (error; ${retryMessage})`, response.status, url, responseHeaders, errMessage);
        const err = this.makeStatusError(response.status, errJSON, errMessage, responseHeaders);
        throw err;
      }
      return { response, options, controller };
    }
    requestAPIList(Page, options) {
      const request = this.makeRequest(options, null);
      return new PagePromise(this, request, Page);
    }
    buildURL(path, query) {
      const url = isAbsoluteURL(path) ? new URL(path) : new URL(this.baseURL + (this.baseURL.endsWith("/") && path.startsWith("/") ? path.slice(1) : path));
      const defaultQuery = this.defaultQuery();
      if (!isEmptyObj(defaultQuery)) {
        query = { ...defaultQuery, ...query };
      }
      if (typeof query === "object" && query && !Array.isArray(query)) {
        url.search = this.stringifyQuery(query);
      }
      return url.toString();
    }
    stringifyQuery(query) {
      return Object.entries(query).filter(([_, value]) => typeof value !== "undefined").map(([key, value]) => {
        if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
          return `${encodeURIComponent(key)}=${encodeURIComponent(value)}`;
        }
        if (value === null) {
          return `${encodeURIComponent(key)}=`;
        }
        throw new GroqError(`Cannot stringify type ${typeof value}; Expected string, number, boolean, or null. If you need to pass nested query parameters, you can manually encode them, e.g. { query: { 'foo[key1]': value1, 'foo[key2]': value2 } }, and please open a GitHub issue requesting better support for your use case.`);
      }).join("&");
    }
    async fetchWithTimeout(url, init2, ms, controller) {
      const { signal, ...options } = init2 || {};
      if (signal)
        signal.addEventListener("abort", () => controller.abort());
      const timeout = setTimeout(() => controller.abort(), ms);
      return this.getRequestClient().fetch.call(void 0, url, { signal: controller.signal, ...options }).finally(() => {
        clearTimeout(timeout);
      });
    }
    getRequestClient() {
      return { fetch: this.fetch };
    }
    shouldRetry(response) {
      const shouldRetryHeader = response.headers.get("x-should-retry");
      if (shouldRetryHeader === "true")
        return true;
      if (shouldRetryHeader === "false")
        return false;
      if (response.status === 408)
        return true;
      if (response.status === 409)
        return true;
      if (response.status === 429)
        return true;
      if (response.status >= 500)
        return true;
      return false;
    }
    async retryRequest(options, retriesRemaining, responseHeaders) {
      let timeoutMillis;
      const retryAfterMillisHeader = responseHeaders == null ? void 0 : responseHeaders["retry-after-ms"];
      if (retryAfterMillisHeader) {
        const timeoutMs = parseFloat(retryAfterMillisHeader);
        if (!Number.isNaN(timeoutMs)) {
          timeoutMillis = timeoutMs;
        }
      }
      const retryAfterHeader = responseHeaders == null ? void 0 : responseHeaders["retry-after"];
      if (retryAfterHeader && !timeoutMillis) {
        const timeoutSeconds = parseFloat(retryAfterHeader);
        if (!Number.isNaN(timeoutSeconds)) {
          timeoutMillis = timeoutSeconds * 1e3;
        } else {
          timeoutMillis = Date.parse(retryAfterHeader) - Date.now();
        }
      }
      if (!(timeoutMillis && 0 <= timeoutMillis && timeoutMillis < 60 * 1e3)) {
        const maxRetries = options.maxRetries ?? this.maxRetries;
        timeoutMillis = this.calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries);
      }
      await sleep(timeoutMillis);
      return this.makeRequest(options, retriesRemaining - 1);
    }
    calculateDefaultRetryTimeoutMillis(retriesRemaining, maxRetries) {
      const initialRetryDelay = 0.5;
      const maxRetryDelay = 8;
      const numRetries = maxRetries - retriesRemaining;
      const sleepSeconds = Math.min(initialRetryDelay * Math.pow(2, numRetries), maxRetryDelay);
      const jitter = 1 - Math.random() * 0.25;
      return sleepSeconds * jitter * 1e3;
    }
    getUserAgent() {
      return `${this.constructor.name}/JS ${VERSION}`;
    }
  }
  class PagePromise extends APIPromise {
    constructor(client, request, Page) {
      super(request, async (props) => new Page(client, props.response, await defaultParseResponse(props), props.options));
    }
    /**
     * Allow auto-paginating iteration on an unawaited list call, eg:
     *
     *    for await (const item of client.items.list()) {
     *      console.log(item)
     *    }
     */
    async *[Symbol.asyncIterator]() {
      const page = await this;
      for await (const item of page) {
        yield item;
      }
    }
  }
  const createResponseHeaders = (headers) => {
    return new Proxy(Object.fromEntries(
      // @ts-ignore
      headers.entries()
    ), {
      get(target, name) {
        const key = name.toString();
        return target[key.toLowerCase()] || target[key];
      }
    });
  };
  const getPlatformProperties = () => {
    var _a2;
    if (typeof Deno !== "undefined" && Deno.build != null) {
      return {
        "X-Stainless-Lang": "js",
        "X-Stainless-Package-Version": VERSION,
        "X-Stainless-OS": normalizePlatform(Deno.build.os),
        "X-Stainless-Arch": normalizeArch(Deno.build.arch),
        "X-Stainless-Runtime": "deno",
        "X-Stainless-Runtime-Version": typeof Deno.version === "string" ? Deno.version : ((_a2 = Deno.version) == null ? void 0 : _a2.deno) ?? "unknown"
      };
    }
    if (typeof EdgeRuntime !== "undefined") {
      return {
        "X-Stainless-Lang": "js",
        "X-Stainless-Package-Version": VERSION,
        "X-Stainless-OS": "Unknown",
        "X-Stainless-Arch": `other:${EdgeRuntime}`,
        "X-Stainless-Runtime": "edge",
        "X-Stainless-Runtime-Version": process.version
      };
    }
    if (Object.prototype.toString.call(typeof process !== "undefined" ? process : 0) === "[object process]") {
      return {
        "X-Stainless-Lang": "js",
        "X-Stainless-Package-Version": VERSION,
        "X-Stainless-OS": normalizePlatform(process.platform),
        "X-Stainless-Arch": normalizeArch(process.arch),
        "X-Stainless-Runtime": "node",
        "X-Stainless-Runtime-Version": process.version
      };
    }
    const browserInfo = getBrowserInfo();
    if (browserInfo) {
      return {
        "X-Stainless-Lang": "js",
        "X-Stainless-Package-Version": VERSION,
        "X-Stainless-OS": "Unknown",
        "X-Stainless-Arch": "unknown",
        "X-Stainless-Runtime": `browser:${browserInfo.browser}`,
        "X-Stainless-Runtime-Version": browserInfo.version
      };
    }
    return {
      "X-Stainless-Lang": "js",
      "X-Stainless-Package-Version": VERSION,
      "X-Stainless-OS": "Unknown",
      "X-Stainless-Arch": "unknown",
      "X-Stainless-Runtime": "unknown",
      "X-Stainless-Runtime-Version": "unknown"
    };
  };
  function getBrowserInfo() {
    if (typeof navigator === "undefined" || !navigator) {
      return null;
    }
    const browserPatterns = [
      { key: "edge", pattern: /Edge(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
      { key: "ie", pattern: /MSIE(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
      { key: "ie", pattern: /Trident(?:.*rv\:(\d+)\.(\d+)(?:\.(\d+))?)?/ },
      { key: "chrome", pattern: /Chrome(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
      { key: "firefox", pattern: /Firefox(?:\W+(\d+)\.(\d+)(?:\.(\d+))?)?/ },
      { key: "safari", pattern: /(?:Version\W+(\d+)\.(\d+)(?:\.(\d+))?)?(?:\W+Mobile\S*)?\W+Safari/ }
    ];
    for (const { key, pattern } of browserPatterns) {
      const match = pattern.exec(navigator.userAgent);
      if (match) {
        const major = match[1] || 0;
        const minor = match[2] || 0;
        const patch = match[3] || 0;
        return { browser: key, version: `${major}.${minor}.${patch}` };
      }
    }
    return null;
  }
  const normalizeArch = (arch) => {
    if (arch === "x32")
      return "x32";
    if (arch === "x86_64" || arch === "x64")
      return "x64";
    if (arch === "arm")
      return "arm";
    if (arch === "aarch64" || arch === "arm64")
      return "arm64";
    if (arch)
      return `other:${arch}`;
    return "unknown";
  };
  const normalizePlatform = (platform) => {
    platform = platform.toLowerCase();
    if (platform.includes("ios"))
      return "iOS";
    if (platform === "android")
      return "Android";
    if (platform === "darwin")
      return "MacOS";
    if (platform === "win32")
      return "Windows";
    if (platform === "freebsd")
      return "FreeBSD";
    if (platform === "openbsd")
      return "OpenBSD";
    if (platform === "linux")
      return "Linux";
    if (platform)
      return `Other:${platform}`;
    return "Unknown";
  };
  let _platformHeaders;
  const getPlatformHeaders = () => {
    return _platformHeaders ?? (_platformHeaders = getPlatformProperties());
  };
  const safeJSON = (text) => {
    try {
      return JSON.parse(text);
    } catch (err) {
      return void 0;
    }
  };
  const startsWithSchemeRegexp = new RegExp("^(?:[a-z]+:)?//", "i");
  const isAbsoluteURL = (url) => {
    return startsWithSchemeRegexp.test(url);
  };
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
  const validatePositiveInteger = (name, n) => {
    if (typeof n !== "number" || !Number.isInteger(n)) {
      throw new GroqError(`${name} must be an integer`);
    }
    if (n < 0) {
      throw new GroqError(`${name} must be a positive integer`);
    }
    return n;
  };
  const castToError = (err) => {
    if (err instanceof Error)
      return err;
    return new Error(err);
  };
  const readEnv = (env) => {
    var _a2, _b, _c, _d;
    if (typeof process !== "undefined") {
      return ((_a2 = define_process_env_default == null ? void 0 : define_process_env_default[env]) == null ? void 0 : _a2.trim()) ?? void 0;
    }
    if (typeof Deno !== "undefined") {
      return (_d = (_c = (_b = Deno.env) == null ? void 0 : _b.get) == null ? void 0 : _c.call(_b, env)) == null ? void 0 : _d.trim();
    }
    return void 0;
  };
  function isEmptyObj(obj) {
    if (!obj)
      return true;
    for (const _k in obj)
      return false;
    return true;
  }
  function hasOwn(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  }
  function applyHeadersMut(targetHeaders, newHeaders) {
    for (const k in newHeaders) {
      if (!hasOwn(newHeaders, k))
        continue;
      const lowerKey = k.toLowerCase();
      if (!lowerKey)
        continue;
      const val = newHeaders[k];
      if (val === null) {
        delete targetHeaders[lowerKey];
      } else if (val !== void 0) {
        targetHeaders[lowerKey] = val;
      }
    }
  }
  function debug(action, ...args) {
    if (typeof process !== "undefined" && (define_process_env_default == null ? void 0 : define_process_env_default["DEBUG"]) === "true") {
      console.log(`Groq:DEBUG:${action}`, ...args);
    }
  }
  const uuid4 = () => {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === "x" ? r : r & 3 | 8;
      return v.toString(16);
    });
  };
  const isRunningInBrowser = () => {
    return (
      // @ts-ignore
      typeof window !== "undefined" && // @ts-ignore
      typeof window.document !== "undefined" && // @ts-ignore
      typeof navigator !== "undefined"
    );
  };
  class GroqError extends Error {
  }
  class APIError extends GroqError {
    constructor(status, error, message, headers) {
      super(`${APIError.makeMessage(status, error, message)}`);
      this.status = status;
      this.headers = headers;
      this.error = error;
    }
    static makeMessage(status, error, message) {
      const msg = (error == null ? void 0 : error.message) ? typeof error.message === "string" ? error.message : JSON.stringify(error.message) : error ? JSON.stringify(error) : message;
      if (status && msg) {
        return `${status} ${msg}`;
      }
      if (status) {
        return `${status} status code (no body)`;
      }
      if (msg) {
        return msg;
      }
      return "(no status code or body)";
    }
    static generate(status, errorResponse, message, headers) {
      if (!status) {
        return new APIConnectionError({ cause: castToError(errorResponse) });
      }
      const error = errorResponse;
      if (status === 400) {
        return new BadRequestError(status, error, message, headers);
      }
      if (status === 401) {
        return new AuthenticationError(status, error, message, headers);
      }
      if (status === 403) {
        return new PermissionDeniedError(status, error, message, headers);
      }
      if (status === 404) {
        return new NotFoundError(status, error, message, headers);
      }
      if (status === 409) {
        return new ConflictError(status, error, message, headers);
      }
      if (status === 422) {
        return new UnprocessableEntityError(status, error, message, headers);
      }
      if (status === 429) {
        return new RateLimitError(status, error, message, headers);
      }
      if (status >= 500) {
        return new InternalServerError(status, error, message, headers);
      }
      return new APIError(status, error, message, headers);
    }
  }
  class APIUserAbortError extends APIError {
    constructor({ message } = {}) {
      super(void 0, void 0, message || "Request was aborted.", void 0);
      this.status = void 0;
    }
  }
  class APIConnectionError extends APIError {
    constructor({ message, cause }) {
      super(void 0, void 0, message || "Connection error.", void 0);
      this.status = void 0;
      if (cause)
        this.cause = cause;
    }
  }
  class APIConnectionTimeoutError extends APIConnectionError {
    constructor({ message } = {}) {
      super({ message: message ?? "Request timed out." });
    }
  }
  class BadRequestError extends APIError {
    constructor() {
      super(...arguments);
      this.status = 400;
    }
  }
  class AuthenticationError extends APIError {
    constructor() {
      super(...arguments);
      this.status = 401;
    }
  }
  class PermissionDeniedError extends APIError {
    constructor() {
      super(...arguments);
      this.status = 403;
    }
  }
  class NotFoundError extends APIError {
    constructor() {
      super(...arguments);
      this.status = 404;
    }
  }
  class ConflictError extends APIError {
    constructor() {
      super(...arguments);
      this.status = 409;
    }
  }
  class UnprocessableEntityError extends APIError {
    constructor() {
      super(...arguments);
      this.status = 422;
    }
  }
  class RateLimitError extends APIError {
    constructor() {
      super(...arguments);
      this.status = 429;
    }
  }
  class InternalServerError extends APIError {
  }
  class APIResource {
    constructor(client) {
      this._client = client;
    }
  }
  class Transcriptions extends APIResource {
    /**
     * Transcribes audio into the input language.
     */
    create(body, options) {
      return this._client.post("/openai/v1/audio/transcriptions", multipartFormRequestOptions({ body, ...options }));
    }
  }
  /* @__PURE__ */ (function(Transcriptions2) {
  })(Transcriptions || (Transcriptions = {}));
  class Translations extends APIResource {
    /**
     * Translates audio into English.
     */
    create(body, options) {
      return this._client.post("/openai/v1/audio/translations", multipartFormRequestOptions({ body, ...options }));
    }
  }
  /* @__PURE__ */ (function(Translations2) {
  })(Translations || (Translations = {}));
  class Audio extends APIResource {
    constructor() {
      super(...arguments);
      this.transcriptions = new Transcriptions(this._client);
      this.translations = new Translations(this._client);
    }
  }
  (function(Audio2) {
    Audio2.Transcriptions = Transcriptions;
    Audio2.Translations = Translations;
  })(Audio || (Audio = {}));
  let Completions$1 = class Completions extends APIResource {
    create(body, options) {
      return this._client.post("/openai/v1/chat/completions", {
        body,
        ...options,
        stream: body.stream ?? false
      });
    }
  };
  /* @__PURE__ */ (function(Completions2) {
  })(Completions$1 || (Completions$1 = {}));
  class Chat extends APIResource {
    constructor() {
      super(...arguments);
      this.completions = new Completions$1(this._client);
    }
  }
  (function(Chat2) {
    Chat2.Completions = Completions$1;
  })(Chat || (Chat = {}));
  class Completions extends APIResource {
  }
  /* @__PURE__ */ (function(Completions2) {
  })(Completions || (Completions = {}));
  class Embeddings extends APIResource {
    /**
     * Creates an embedding vector representing the input text.
     */
    create(body, options) {
      return this._client.post("/openai/v1/embeddings", { body, ...options });
    }
  }
  /* @__PURE__ */ (function(Embeddings2) {
  })(Embeddings || (Embeddings = {}));
  class Models extends APIResource {
    /**
     * Get a specific model
     */
    retrieve(model, options) {
      return this._client.get(`/openai/v1/models/${model}`, options);
    }
    /**
     * get all available models
     */
    list(options) {
      return this._client.get("/openai/v1/models", options);
    }
    /**
     * Delete a model
     */
    delete(model, options) {
      return this._client.delete(`/openai/v1/models/${model}`, options);
    }
  }
  /* @__PURE__ */ (function(Models2) {
  })(Models || (Models = {}));
  var _a;
  class Groq extends APIClient {
    /**
     * API Client for interfacing with the Groq API.
     *
     * @param {string | undefined} [opts.apiKey=process.env['GROQ_API_KEY'] ?? undefined]
     * @param {string} [opts.baseURL=process.env['GROQ_BASE_URL'] ?? https://api.groq.com] - Override the default base URL for the API.
     * @param {number} [opts.timeout=1 minute] - The maximum amount of time (in milliseconds) the client will wait for a response before timing out.
     * @param {number} [opts.httpAgent] - An HTTP agent used to manage HTTP(s) connections.
     * @param {Core.Fetch} [opts.fetch] - Specify a custom `fetch` function implementation.
     * @param {number} [opts.maxRetries=2] - The maximum number of times the client will retry a request.
     * @param {Core.Headers} opts.defaultHeaders - Default headers to include with every request to the API.
     * @param {Core.DefaultQuery} opts.defaultQuery - Default query parameters to include with every request to the API.
     * @param {boolean} [opts.dangerouslyAllowBrowser=false] - By default, client-side use of this library is not allowed, as it risks exposing your secret API credentials to attackers.
     */
    constructor({ baseURL = readEnv("GROQ_BASE_URL"), apiKey = readEnv("GROQ_API_KEY"), ...opts } = {}) {
      if (apiKey === void 0) {
        throw new GroqError("The GROQ_API_KEY environment variable is missing or empty; either provide it, or instantiate the Groq client with an apiKey option, like new Groq({ apiKey: 'My API Key' }).");
      }
      const options = {
        apiKey,
        ...opts,
        baseURL: baseURL || `https://api.groq.com`
      };
      if (!options.dangerouslyAllowBrowser && isRunningInBrowser()) {
        throw new GroqError("It looks like you're running in a browser-like environment.\n\nThis is disabled by default, as it risks exposing your secret API credentials to attackers.\nIf you understand the risks and have appropriate mitigations in place,\nyou can set the `dangerouslyAllowBrowser` option to `true`, e.g.,\n\nnew Groq({ apiKey, dangerouslyAllowBrowser: true })");
      }
      super({
        baseURL: options.baseURL,
        timeout: options.timeout ?? 6e4,
        httpAgent: options.httpAgent,
        maxRetries: options.maxRetries,
        fetch: options.fetch
      });
      this.completions = new Completions(this);
      this.chat = new Chat(this);
      this.embeddings = new Embeddings(this);
      this.audio = new Audio(this);
      this.models = new Models(this);
      this._options = options;
      this.apiKey = apiKey;
    }
    defaultQuery() {
      return this._options.defaultQuery;
    }
    defaultHeaders(opts) {
      return {
        ...super.defaultHeaders(opts),
        ...this._options.defaultHeaders
      };
    }
    authHeaders(opts) {
      return { Authorization: `Bearer ${this.apiKey}` };
    }
  }
  _a = Groq;
  Groq.Groq = _a;
  Groq.DEFAULT_TIMEOUT = 6e4;
  Groq.GroqError = GroqError;
  Groq.APIError = APIError;
  Groq.APIConnectionError = APIConnectionError;
  Groq.APIConnectionTimeoutError = APIConnectionTimeoutError;
  Groq.APIUserAbortError = APIUserAbortError;
  Groq.NotFoundError = NotFoundError;
  Groq.ConflictError = ConflictError;
  Groq.RateLimitError = RateLimitError;
  Groq.BadRequestError = BadRequestError;
  Groq.AuthenticationError = AuthenticationError;
  Groq.InternalServerError = InternalServerError;
  Groq.PermissionDeniedError = PermissionDeniedError;
  Groq.UnprocessableEntityError = UnprocessableEntityError;
  Groq.toFile = toFile;
  Groq.fileFromPath = fileFromPath;
  (function(Groq2) {
    Groq2.Completions = Completions;
    Groq2.Chat = Chat;
    Groq2.Embeddings = Embeddings;
    Groq2.Audio = Audio;
    Groq2.Models = Models;
  })(Groq || (Groq = {}));
  console.log("[Chatwoot Transcriber] Content script carregado");
  let groqApiKey = null;
  let processingAudios = /* @__PURE__ */ new Set();
  function logDebug(...args) {
  }
  function logInfo(...args) {
    console.log("[Chatwoot Transcriber]", ...args);
  }
  async function loadApiKey() {
    return new Promise((resolve) => {
      chrome.storage.sync.get(["groq_api_key"], (result) => {
        groqApiKey = result.groq_api_key || null;
        if (groqApiKey) {
          logInfo("API Key carregada");
        } else {
          console.warn("[Chatwoot Transcriber] API Key não encontrada. Configure no popup da extensão.");
        }
        resolve(groqApiKey);
      });
    });
  }
  loadApiKey();
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.type === "API_KEY_UPDATED") {
      logInfo("API Key atualizada");
      loadApiKey();
    }
  });
  async function fetchAudioBlob(url) {
    try {
      console.log("[Chatwoot Transcriber] Enviando mensagem para background script:", url);
      const response = await chrome.runtime.sendMessage({
        type: "FETCH_AUDIO",
        url
      });
      console.log("[Chatwoot Transcriber] Resposta do background script:", response);
      if (!response || !response.success) {
        throw new Error((response == null ? void 0 : response.error) || "Falha ao baixar áudio via background script");
      }
      const base64 = response.data;
      const byteString = atob(base64.split(",")[1]);
      const mimeString = base64.split(",")[0].split(":")[1].split(";")[0];
      const ab = new ArrayBuffer(byteString.length);
      const ia = new Uint8Array(ab);
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
      }
      const blob = new Blob([ab], { type: mimeString });
      console.log("[Chatwoot Transcriber] Blob criado:", blob.size, "bytes, tipo:", blob.type);
      return blob;
    } catch (err) {
      console.error("[Chatwoot Transcriber] fetchAudioBlob error:", err);
      throw err;
    }
  }
  function getFileExtension(url, mimeType) {
    const urlMatch = url.match(/\.([a-z0-9]+)(\?|$)/i);
    if (urlMatch) {
      let ext = urlMatch[1].toLowerCase();
      if (ext === "oga") ext = "ogg";
      const acceptedFormats = ["flac", "mp3", "mp4", "mpeg", "mpga", "m4a", "ogg", "opus", "wav", "webm"];
      if (acceptedFormats.includes(ext)) {
        return ext;
      }
    }
    const mimeMap = {
      "audio/mpeg": "mp3",
      "audio/mp4": "m4a",
      "audio/ogg": "ogg",
      "audio/wav": "wav",
      "audio/webm": "webm",
      "audio/x-m4a": "m4a",
      "audio/opus": "opus",
      "audio/flac": "flac"
    };
    return mimeMap[mimeType] || "ogg";
  }
  function createTranscriptElement(text, type = "success") {
    const div = document.createElement("div");
    div.className = `groq-transcript ${type}`;
    if (type === "loading") {
      div.innerHTML = `
      <strong>
        <span class="groq-loading-spinner"></span>
        Transcrição
      </strong>
      <div class="groq-transcript-text">${text}</div>
    `;
    } else if (type === "error") {
      div.innerHTML = `
      <strong>
        <span class="groq-error-icon">⚠️</span>
        Erro na Transcrição
      </strong>
      <div class="groq-transcript-text">${text}</div>
    `;
    } else {
      div.innerHTML = `
      <div class="groq-transcript-text">${text}</div>
    `;
    }
    return div;
  }
  function processAudioElement(audioElement) {
    try {
      const parent = audioElement.parentElement || audioElement;
      attachTranscribeButtonsIn(parent);
    } catch (err) {
    }
  }
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      logDebug("Mutation observed:", mutation.type, mutation.addedNodes ? mutation.addedNodes.length : 0);
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType !== Node.ELEMENT_NODE) {
          return;
        }
        logDebug("Node added:", node.tagName || node.nodeName, node);
        if (node.tagName === "AUDIO") {
          processAudioElement(node);
        }
        const audioElements = node.querySelectorAll ? node.querySelectorAll("audio") : [];
        if (audioElements && audioElements.length) logDebug("Áudios encontrados dentro do nó adicionado:", audioElements.length);
        audioElements.forEach(processAudioElement);
        try {
          attachTranscribeButtonsIn(node);
        } catch (e) {
        }
      });
    });
  });
  function getAudioSrcFromContainer(container) {
    try {
      let audio = container.querySelector("audio");
      if (!audio) {
        const wrapper2 = container.closest('[data-bubble-name="audio"]');
        if (wrapper2) {
          audio = wrapper2.querySelector("audio");
        }
      }
      if (audio) {
        if (audio.src) return audio.src;
        const sourceEl = audio.querySelector("source");
        if (sourceEl) {
          return sourceEl.src || sourceEl.getAttribute("src");
        }
      }
      const link = Array.from(container.querySelectorAll("a[href]")).find((a) => /\.(mp3|ogg|wav|m4a|webm)(\?|$)/i.test(a.href));
      if (link) return link.href;
      const dataElem = container.querySelector("[data-src], [data-audio], [data-url]");
      if (dataElem) {
        return dataElem.getAttribute("data-src") || dataElem.getAttribute("data-audio") || dataElem.getAttribute("data-url");
      }
      const downloadAnchor = Array.from(container.querySelectorAll("a")).find((a) => a.hasAttribute("download") || /download/i.test(a.textContent));
      if (downloadAnchor && downloadAnchor.href) return downloadAnchor.href;
      const wrapper = container.closest(".message-wrapper, .message, .tw-flex, [data-message-id]");
      if (wrapper) {
        const audio2 = wrapper.querySelector("audio");
        if (audio2 && audio2.src) return audio2.src;
        const link2 = Array.from(wrapper.querySelectorAll("a[href]")).find((a) => /\.(mp3|ogg|wav|m4a|webm)(\?|$)/i.test(a.href));
        if (link2) return link2.href;
      }
      return null;
    } catch (err) {
      return null;
    }
  }
  function insertTranscriptBelowContainer(container, transcriptElement) {
    const existing = container.parentElement.querySelector(".groq-transcript");
    if (existing) existing.remove();
    if (container.nextSibling) {
      container.parentElement.insertBefore(transcriptElement, container.nextSibling);
    } else {
      container.parentElement.appendChild(transcriptElement);
    }
  }
  async function transcribeFromUrlForContainer(url, container) {
    if (!url) {
      const errDiv = createTranscriptElement("URL do áudio não encontrada neste player.", "error");
      insertTranscriptBelowContainer(container, errDiv);
      return;
    }
    if (container.dataset.transcribed === "true" || processingAudios.has(url)) {
      return;
    }
    processingAudios.add(url);
    container.dataset.transcribed = "processing";
    const loadingDiv = createTranscriptElement("Transcrevendo áudio...", "loading");
    insertTranscriptBelowContainer(container, loadingDiv);
    try {
      if (!groqApiKey) {
        await loadApiKey();
        if (!groqApiKey) throw new Error("API Key não configurada.");
      }
      logInfo("Baixando áudio (container)...", url);
      const blob = await fetchAudioBlob(url);
      const ext = getFileExtension(url, blob.type);
      let mimeType = blob.type;
      if (ext === "ogg" && (!mimeType || !mimeType.includes("ogg"))) {
        mimeType = "audio/ogg";
      }
      const file = new File([blob], `audio.${ext}`, { type: mimeType });
      logInfo("Enviando para Groq (container)...", "arquivo:", file.name, "tipo:", file.type, "tamanho:", file.size);
      const groq = new Groq({ apiKey: groqApiKey, dangerouslyAllowBrowser: true });
      const transcription = await groq.audio.transcriptions.create({ file, model: "whisper-large-v3", response_format: "json" });
      const transcriptText = transcription && (transcription.text || transcription.transcript || transcription.data && transcription.data.text) || "";
      loadingDiv.remove();
      const transcriptDiv = createTranscriptElement(transcriptText || "Transcrição vazia", "success");
      insertTranscriptBelowContainer(container, transcriptDiv);
      container.dataset.transcribed = "true";
    } catch (err) {
      console.error("[Chatwoot Transcriber] Erro transcrevendo (container):", err);
      loadingDiv.remove();
      const errDiv = createTranscriptElement(`Erro: ${err.message || err}`, "error");
      insertTranscriptBelowContainer(container, errDiv);
      container.dataset.transcribed = "error";
    } finally {
      processingAudios.delete(url);
    }
  }
  function createTranscribeButton() {
    const btn = document.createElement("button");
    btn.type = "button";
    btn.className = "groq-transcribe-btn";
    btn.style.cssText = "margin-left:8px;padding:6px 10px;background:#667eea;color:#fff;border-radius:8px;border:none;cursor:pointer;font-size:12px;box-shadow:0 2px 6px rgba(0,0,0,0.12);z-index:9999";
    btn.textContent = "Transcrever";
    return btn;
  }
  function ensureTranscribeButtonOnContainer(container) {
    try {
      const wrapper = container.closest('[data-bubble-name="audio"], .message, .message-wrapper');
      if (wrapper && wrapper.querySelector(".groq-transcribe-btn")) return;
      const downloadSpan = container.querySelector("span.i-lucide-download");
      if (!downloadSpan) {
        logDebug("Nenhum ícone de download encontrado neste container; pulando inserção");
        return;
      }
      const downloadBtn = downloadSpan.closest("button");
      if (!downloadBtn) {
        logDebug("Ícone de download encontrado, mas botão pai não identificado; pulando");
        return;
      }
      if (downloadBtn.dataset.groqTranscribeAdded === "true") return;
      const btn = createTranscribeButton();
      btn.addEventListener("click", async (e) => {
        e.stopPropagation();
        btn.disabled = true;
        btn.textContent = "Transcrevendo...";
        const url = getAudioSrcFromContainer(container);
        await transcribeFromUrlForContainer(url, container);
        btn.textContent = "Transcrever";
        btn.disabled = false;
      });
      if (downloadBtn.parentElement) {
        downloadBtn.parentElement.insertBefore(btn, downloadBtn.nextSibling);
      } else {
        container.appendChild(btn);
      }
      downloadBtn.dataset.groqTranscribeAdded = "true";
      logDebug("Botão Transcrever adicionado após botão de download", downloadBtn);
    } catch (err) {
    }
  }
  function attachTranscribeButtonsIn(node) {
    try {
      const candidates = node.querySelectorAll ? node.querySelectorAll("div") : [];
      candidates.forEach((div) => {
        if (!div.querySelector) return;
        const hasRange = !!div.querySelector('input[type="range"]');
        const hasTime = !!div.querySelector(".tabular-nums") || /\b\d{2}:\d{2}\b/.test(div.textContent);
        if (hasRange && hasTime) {
          ensureTranscribeButtonOnContainer(div);
        }
      });
      try {
        const skips = node.querySelectorAll ? node.querySelectorAll(".skip-context-menu") : [];
        skips.forEach((el) => {
          if (el.querySelector && (el.querySelector('input[type="range"]') || el.querySelector(".tabular-nums") || /\b\d{2}:\d{2}\b/.test(el.textContent))) {
            ensureTranscribeButtonOnContainer(el);
          } else {
            attachTranscribeButtonsIn(el);
          }
        });
      } catch (e) {
        logDebug("extra skip-context-menu scan failed", e);
      }
    } catch (err) {
    }
  }
  function init() {
    logInfo("Inicializando observer...");
    const existingAudios = document.querySelectorAll("audio");
    logInfo(`${existingAudios.length} áudios encontrados na página`);
    existingAudios.forEach(processAudioElement);
    try {
      attachTranscribeButtonsIn(document.body);
    } catch (e) {
    }
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
    logInfo("Observer ativo");
  }
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
  window.addEventListener("beforeunload", () => {
    observer.disconnect();
  });
})();
