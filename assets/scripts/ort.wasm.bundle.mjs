/*!
 * ONNX Runtime Web v1.22.0
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x, {
  get: (a, b) => (typeof require !== "undefined" ? require : a)[b]
}) : x)(function(x) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x + '" is not supported');
});
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// common/dist/esm/backend-impl.js
var backends, backendsSortedByPriority, registerBackend, tryResolveAndInitializeBackend, resolveBackendAndExecutionProviders;
var init_backend_impl = __esm({
  "common/dist/esm/backend-impl.js"() {
    "use strict";
    backends = /* @__PURE__ */ new Map();
    backendsSortedByPriority = [];
    registerBackend = (name, backend, priority) => {
      if (backend && typeof backend.init === "function" && typeof backend.createInferenceSessionHandler === "function") {
        const currentBackend = backends.get(name);
        if (currentBackend === void 0) {
          backends.set(name, { backend, priority });
        } else if (currentBackend.priority > priority) {
          return;
        } else if (currentBackend.priority === priority) {
          if (currentBackend.backend !== backend) {
            throw new Error(`cannot register backend "${name}" using priority ${priority}`);
          }
        }
        if (priority >= 0) {
          const i = backendsSortedByPriority.indexOf(name);
          if (i !== -1) {
            backendsSortedByPriority.splice(i, 1);
          }
          for (let i2 = 0; i2 < backendsSortedByPriority.length; i2++) {
            if (backends.get(backendsSortedByPriority[i2]).priority <= priority) {
              backendsSortedByPriority.splice(i2, 0, name);
              return;
            }
          }
          backendsSortedByPriority.push(name);
        }
        return;
      }
      throw new TypeError("not a valid backend");
    };
    tryResolveAndInitializeBackend = async (backendName) => {
      const backendInfo = backends.get(backendName);
      if (!backendInfo) {
        return "backend not found.";
      }
      if (backendInfo.initialized) {
        return backendInfo.backend;
      } else if (backendInfo.aborted) {
        return backendInfo.error;
      } else {
        const isInitializing = !!backendInfo.initPromise;
        try {
          if (!isInitializing) {
            backendInfo.initPromise = backendInfo.backend.init(backendName);
          }
          await backendInfo.initPromise;
          backendInfo.initialized = true;
          return backendInfo.backend;
        } catch (e3) {
          if (!isInitializing) {
            backendInfo.error = `${e3}`;
            backendInfo.aborted = true;
          }
          return backendInfo.error;
        } finally {
          delete backendInfo.initPromise;
        }
      }
    };
    resolveBackendAndExecutionProviders = async (options) => {
      const eps = options.executionProviders || [];
      const backendHints = eps.map((i) => typeof i === "string" ? i : i.name);
      const backendNames = backendHints.length === 0 ? backendsSortedByPriority : backendHints;
      let backend;
      const errors = [];
      const availableBackendNames = /* @__PURE__ */ new Set();
      for (const backendName of backendNames) {
        const resolveResult = await tryResolveAndInitializeBackend(backendName);
        if (typeof resolveResult === "string") {
          errors.push({ name: backendName, err: resolveResult });
        } else {
          if (!backend) {
            backend = resolveResult;
          }
          if (backend === resolveResult) {
            availableBackendNames.add(backendName);
          }
        }
      }
      if (!backend) {
        throw new Error(`no available backend found. ERR: ${errors.map((e3) => `[${e3.name}] ${e3.err}`).join(", ")}`);
      }
      for (const { name, err } of errors) {
        if (backendHints.includes(name)) {
          console.warn(`removing requested execution provider "${name}" from session options because it is not available: ${err}`);
        }
      }
      const filteredEps = eps.filter((i) => availableBackendNames.has(typeof i === "string" ? i : i.name));
      return [
        backend,
        new Proxy(options, {
          get: (target, prop) => {
            if (prop === "executionProviders") {
              return filteredEps;
            }
            return Reflect.get(target, prop);
          }
        })
      ];
    };
  }
});

// common/dist/esm/backend.js
var init_backend = __esm({
  "common/dist/esm/backend.js"() {
    "use strict";
    init_backend_impl();
  }
});

// common/dist/esm/version.js
var version;
var init_version = __esm({
  "common/dist/esm/version.js"() {
    "use strict";
    version = "1.22.0";
  }
});

// common/dist/esm/env-impl.js
var logLevelValue, env;
var init_env_impl = __esm({
  "common/dist/esm/env-impl.js"() {
    "use strict";
    init_version();
    logLevelValue = "warning";
    env = {
      wasm: {},
      webgl: {},
      webgpu: {},
      versions: { common: version },
      set logLevel(value) {
        if (value === void 0) {
          return;
        }
        if (typeof value !== "string" || ["verbose", "info", "warning", "error", "fatal"].indexOf(value) === -1) {
          throw new Error(`Unsupported logging level: ${value}`);
        }
        logLevelValue = value;
      },
      get logLevel() {
        return logLevelValue;
      }
    };
    Object.defineProperty(env, "logLevel", { enumerable: true });
  }
});

// common/dist/esm/env.js
var env2;
var init_env = __esm({
  "common/dist/esm/env.js"() {
    "use strict";
    init_env_impl();
    env2 = env;
  }
});

// common/dist/esm/tensor-conversion-impl.js
var tensorToDataURL, tensorToImageData;
var init_tensor_conversion_impl = __esm({
  "common/dist/esm/tensor-conversion-impl.js"() {
    "use strict";
    tensorToDataURL = (tensor, options) => {
      const canvas = typeof document !== "undefined" ? document.createElement("canvas") : new OffscreenCanvas(1, 1);
      canvas.width = tensor.dims[3];
      canvas.height = tensor.dims[2];
      const pixels2DContext = canvas.getContext("2d");
      if (pixels2DContext != null) {
        let width;
        let height;
        if (options?.tensorLayout !== void 0 && options.tensorLayout === "NHWC") {
          width = tensor.dims[2];
          height = tensor.dims[3];
        } else {
          width = tensor.dims[3];
          height = tensor.dims[2];
        }
        const inputformat = options?.format !== void 0 ? options.format : "RGB";
        const norm = options?.norm;
        let normMean;
        let normBias;
        if (norm === void 0 || norm.mean === void 0) {
          normMean = [255, 255, 255, 255];
        } else {
          if (typeof norm.mean === "number") {
            normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
          } else {
            normMean = [norm.mean[0], norm.mean[1], norm.mean[2], 0];
            if (norm.mean[3] !== void 0) {
              normMean[3] = norm.mean[3];
            }
          }
        }
        if (norm === void 0 || norm.bias === void 0) {
          normBias = [0, 0, 0, 0];
        } else {
          if (typeof norm.bias === "number") {
            normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
          } else {
            normBias = [norm.bias[0], norm.bias[1], norm.bias[2], 0];
            if (norm.bias[3] !== void 0) {
              normBias[3] = norm.bias[3];
            }
          }
        }
        const stride = height * width;
        let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
        if (inputformat === "RGBA") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
          aTensorPointer = stride * 3;
        } else if (inputformat === "RGB") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
        } else if (inputformat === "RBG") {
          rTensorPointer = 0;
          bTensorPointer = stride;
          gTensorPointer = stride * 2;
        }
        for (let i = 0; i < height; i++) {
          for (let j = 0; j < width; j++) {
            const R = (tensor.data[rTensorPointer++] - normBias[0]) * normMean[0];
            const G = (tensor.data[gTensorPointer++] - normBias[1]) * normMean[1];
            const B = (tensor.data[bTensorPointer++] - normBias[2]) * normMean[2];
            const A = aTensorPointer === -1 ? 255 : (tensor.data[aTensorPointer++] - normBias[3]) * normMean[3];
            pixels2DContext.fillStyle = "rgba(" + R + "," + G + "," + B + "," + A + ")";
            pixels2DContext.fillRect(j, i, 1, 1);
          }
        }
        if ("toDataURL" in canvas) {
          return canvas.toDataURL();
        } else {
          throw new Error("toDataURL is not supported");
        }
      } else {
        throw new Error("Can not access image data");
      }
    };
    tensorToImageData = (tensor, options) => {
      const pixels2DContext = typeof document !== "undefined" ? document.createElement("canvas").getContext("2d") : new OffscreenCanvas(1, 1).getContext("2d");
      let image;
      if (pixels2DContext != null) {
        let width;
        let height;
        let channels;
        if (options?.tensorLayout !== void 0 && options.tensorLayout === "NHWC") {
          width = tensor.dims[2];
          height = tensor.dims[1];
          channels = tensor.dims[3];
        } else {
          width = tensor.dims[3];
          height = tensor.dims[2];
          channels = tensor.dims[1];
        }
        const inputformat = options !== void 0 ? options.format !== void 0 ? options.format : "RGB" : "RGB";
        const norm = options?.norm;
        let normMean;
        let normBias;
        if (norm === void 0 || norm.mean === void 0) {
          normMean = [255, 255, 255, 255];
        } else {
          if (typeof norm.mean === "number") {
            normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
          } else {
            normMean = [norm.mean[0], norm.mean[1], norm.mean[2], 255];
            if (norm.mean[3] !== void 0) {
              normMean[3] = norm.mean[3];
            }
          }
        }
        if (norm === void 0 || norm.bias === void 0) {
          normBias = [0, 0, 0, 0];
        } else {
          if (typeof norm.bias === "number") {
            normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
          } else {
            normBias = [norm.bias[0], norm.bias[1], norm.bias[2], 0];
            if (norm.bias[3] !== void 0) {
              normBias[3] = norm.bias[3];
            }
          }
        }
        const stride = height * width;
        if (options !== void 0) {
          if (options.format !== void 0 && channels === 4 && options.format !== "RGBA" || channels === 3 && options.format !== "RGB" && options.format !== "BGR") {
            throw new Error("Tensor format doesn't match input tensor dims");
          }
        }
        const step = 4;
        let rImagePointer = 0, gImagePointer = 1, bImagePointer = 2, aImagePointer = 3;
        let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
        if (inputformat === "RGBA") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
          aTensorPointer = stride * 3;
        } else if (inputformat === "RGB") {
          rTensorPointer = 0;
          gTensorPointer = stride;
          bTensorPointer = stride * 2;
        } else if (inputformat === "RBG") {
          rTensorPointer = 0;
          bTensorPointer = stride;
          gTensorPointer = stride * 2;
        }
        image = pixels2DContext.createImageData(width, height);
        for (let i = 0; i < height * width; rImagePointer += step, gImagePointer += step, bImagePointer += step, aImagePointer += step, i++) {
          image.data[rImagePointer] = (tensor.data[rTensorPointer++] - normBias[0]) * normMean[0];
          image.data[gImagePointer] = (tensor.data[gTensorPointer++] - normBias[1]) * normMean[1];
          image.data[bImagePointer] = (tensor.data[bTensorPointer++] - normBias[2]) * normMean[2];
          image.data[aImagePointer] = aTensorPointer === -1 ? 255 : (tensor.data[aTensorPointer++] - normBias[3]) * normMean[3];
        }
      } else {
        throw new Error("Can not access image data");
      }
      return image;
    };
  }
});

// common/dist/esm/tensor-factory-impl.js
var bufferToTensor, tensorFromImage, tensorFromTexture, tensorFromGpuBuffer, tensorFromMLTensor, tensorFromPinnedBuffer;
var init_tensor_factory_impl = __esm({
  "common/dist/esm/tensor-factory-impl.js"() {
    "use strict";
    init_tensor_impl();
    bufferToTensor = (buffer, options) => {
      if (buffer === void 0) {
        throw new Error("Image buffer must be defined");
      }
      if (options.height === void 0 || options.width === void 0) {
        throw new Error("Image height and width must be defined");
      }
      if (options.tensorLayout === "NHWC") {
        throw new Error("NHWC Tensor layout is not supported yet");
      }
      const { height, width } = options;
      const norm = options.norm ?? { mean: 255, bias: 0 };
      let normMean;
      let normBias;
      if (typeof norm.mean === "number") {
        normMean = [norm.mean, norm.mean, norm.mean, norm.mean];
      } else {
        normMean = [norm.mean[0], norm.mean[1], norm.mean[2], norm.mean[3] ?? 255];
      }
      if (typeof norm.bias === "number") {
        normBias = [norm.bias, norm.bias, norm.bias, norm.bias];
      } else {
        normBias = [norm.bias[0], norm.bias[1], norm.bias[2], norm.bias[3] ?? 0];
      }
      const inputformat = options.format !== void 0 ? options.format : "RGBA";
      const outputformat = options.tensorFormat !== void 0 ? options.tensorFormat !== void 0 ? options.tensorFormat : "RGB" : "RGB";
      const stride = height * width;
      const float32Data = outputformat === "RGBA" ? new Float32Array(stride * 4) : new Float32Array(stride * 3);
      let step = 4, rImagePointer = 0, gImagePointer = 1, bImagePointer = 2, aImagePointer = 3;
      let rTensorPointer = 0, gTensorPointer = stride, bTensorPointer = stride * 2, aTensorPointer = -1;
      if (inputformat === "RGB") {
        step = 3;
        rImagePointer = 0;
        gImagePointer = 1;
        bImagePointer = 2;
        aImagePointer = -1;
      }
      if (outputformat === "RGBA") {
        aTensorPointer = stride * 3;
      } else if (outputformat === "RBG") {
        rTensorPointer = 0;
        bTensorPointer = stride;
        gTensorPointer = stride * 2;
      } else if (outputformat === "BGR") {
        bTensorPointer = 0;
        gTensorPointer = stride;
        rTensorPointer = stride * 2;
      }
      for (let i = 0; i < stride; i++, rImagePointer += step, bImagePointer += step, gImagePointer += step, aImagePointer += step) {
        float32Data[rTensorPointer++] = (buffer[rImagePointer] + normBias[0]) / normMean[0];
        float32Data[gTensorPointer++] = (buffer[gImagePointer] + normBias[1]) / normMean[1];
        float32Data[bTensorPointer++] = (buffer[bImagePointer] + normBias[2]) / normMean[2];
        if (aTensorPointer !== -1 && aImagePointer !== -1) {
          float32Data[aTensorPointer++] = (buffer[aImagePointer] + normBias[3]) / normMean[3];
        }
      }
      const outputTensor = outputformat === "RGBA" ? new Tensor("float32", float32Data, [1, 4, height, width]) : new Tensor("float32", float32Data, [1, 3, height, width]);
      return outputTensor;
    };
    tensorFromImage = async (image, options) => {
      const isHTMLImageEle = typeof HTMLImageElement !== "undefined" && image instanceof HTMLImageElement;
      const isImageDataEle = typeof ImageData !== "undefined" && image instanceof ImageData;
      const isImageBitmap = typeof ImageBitmap !== "undefined" && image instanceof ImageBitmap;
      const isString = typeof image === "string";
      let data;
      let bufferToTensorOptions = options ?? {};
      const createCanvas = () => {
        if (typeof document !== "undefined") {
          return document.createElement("canvas");
        } else if (typeof OffscreenCanvas !== "undefined") {
          return new OffscreenCanvas(1, 1);
        } else {
          throw new Error("Canvas is not supported");
        }
      };
      const createCanvasContext = (canvas) => {
        if (typeof HTMLCanvasElement !== "undefined" && canvas instanceof HTMLCanvasElement) {
          return canvas.getContext("2d");
        } else if (canvas instanceof OffscreenCanvas) {
          return canvas.getContext("2d");
        } else {
          return null;
        }
      };
      if (isHTMLImageEle) {
        const canvas = createCanvas();
        canvas.width = image.width;
        canvas.height = image.height;
        const pixels2DContext = createCanvasContext(canvas);
        if (pixels2DContext != null) {
          let height = image.height;
          let width = image.width;
          if (options !== void 0 && options.resizedHeight !== void 0 && options.resizedWidth !== void 0) {
            height = options.resizedHeight;
            width = options.resizedWidth;
          }
          if (options !== void 0) {
            bufferToTensorOptions = options;
            if (options.tensorFormat !== void 0) {
              throw new Error("Image input config format must be RGBA for HTMLImageElement");
            } else {
              bufferToTensorOptions.tensorFormat = "RGBA";
            }
            bufferToTensorOptions.height = height;
            bufferToTensorOptions.width = width;
          } else {
            bufferToTensorOptions.tensorFormat = "RGBA";
            bufferToTensorOptions.height = height;
            bufferToTensorOptions.width = width;
          }
          pixels2DContext.drawImage(image, 0, 0);
          data = pixels2DContext.getImageData(0, 0, width, height).data;
        } else {
          throw new Error("Can not access image data");
        }
      } else if (isImageDataEle) {
        let height;
        let width;
        if (options !== void 0 && options.resizedWidth !== void 0 && options.resizedHeight !== void 0) {
          height = options.resizedHeight;
          width = options.resizedWidth;
        } else {
          height = image.height;
          width = image.width;
        }
        if (options !== void 0) {
          bufferToTensorOptions = options;
        }
        bufferToTensorOptions.format = "RGBA";
        bufferToTensorOptions.height = height;
        bufferToTensorOptions.width = width;
        if (options !== void 0) {
          const tempCanvas = createCanvas();
          tempCanvas.width = width;
          tempCanvas.height = height;
          const pixels2DContext = createCanvasContext(tempCanvas);
          if (pixels2DContext != null) {
            pixels2DContext.putImageData(image, 0, 0);
            data = pixels2DContext.getImageData(0, 0, width, height).data;
          } else {
            throw new Error("Can not access image data");
          }
        } else {
          data = image.data;
        }
      } else if (isImageBitmap) {
        if (options === void 0) {
          throw new Error("Please provide image config with format for Imagebitmap");
        }
        const canvas = createCanvas();
        canvas.width = image.width;
        canvas.height = image.height;
        const pixels2DContext = createCanvasContext(canvas);
        if (pixels2DContext != null) {
          const height = image.height;
          const width = image.width;
          pixels2DContext.drawImage(image, 0, 0, width, height);
          data = pixels2DContext.getImageData(0, 0, width, height).data;
          bufferToTensorOptions.height = height;
          bufferToTensorOptions.width = width;
          return bufferToTensor(data, bufferToTensorOptions);
        } else {
          throw new Error("Can not access image data");
        }
      } else if (isString) {
        return new Promise((resolve, reject) => {
          const canvas = createCanvas();
          const context = createCanvasContext(canvas);
          if (!image || !context) {
            return reject();
          }
          const newImage = new Image();
          newImage.crossOrigin = "Anonymous";
          newImage.src = image;
          newImage.onload = () => {
            canvas.width = newImage.width;
            canvas.height = newImage.height;
            context.drawImage(newImage, 0, 0, canvas.width, canvas.height);
            const img = context.getImageData(0, 0, canvas.width, canvas.height);
            bufferToTensorOptions.height = canvas.height;
            bufferToTensorOptions.width = canvas.width;
            resolve(bufferToTensor(img.data, bufferToTensorOptions));
          };
        });
      } else {
        throw new Error("Input data provided is not supported - aborted tensor creation");
      }
      if (data !== void 0) {
        return bufferToTensor(data, bufferToTensorOptions);
      } else {
        throw new Error("Input data provided is not supported - aborted tensor creation");
      }
    };
    tensorFromTexture = (texture, options) => {
      const { width, height, download, dispose } = options;
      const dims = [1, height, width, 4];
      return new Tensor({ location: "texture", type: "float32", texture, dims, download, dispose });
    };
    tensorFromGpuBuffer = (gpuBuffer, options) => {
      const { dataType, dims, download, dispose } = options;
      return new Tensor({ location: "gpu-buffer", type: dataType ?? "float32", gpuBuffer, dims, download, dispose });
    };
    tensorFromMLTensor = (mlTensor, options) => {
      const { dataType, dims, download, dispose } = options;
      return new Tensor({ location: "ml-tensor", type: dataType ?? "float32", mlTensor, dims, download, dispose });
    };
    tensorFromPinnedBuffer = (type, buffer, dims) => new Tensor({ location: "cpu-pinned", type, data: buffer, dims: dims ?? [buffer.length] });
  }
});

// common/dist/esm/tensor-impl-type-mapping.js
var NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP, NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP, isTypedArrayChecked, checkTypedArray;
var init_tensor_impl_type_mapping = __esm({
  "common/dist/esm/tensor-impl-type-mapping.js"() {
    "use strict";
    NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP = /* @__PURE__ */ new Map([
      ["float32", Float32Array],
      ["uint8", Uint8Array],
      ["int8", Int8Array],
      ["uint16", Uint16Array],
      ["int16", Int16Array],
      ["int32", Int32Array],
      ["bool", Uint8Array],
      ["float64", Float64Array],
      ["uint32", Uint32Array],
      ["int4", Uint8Array],
      ["uint4", Uint8Array]
    ]);
    NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP = /* @__PURE__ */ new Map([
      [Float32Array, "float32"],
      [Uint8Array, "uint8"],
      [Int8Array, "int8"],
      [Uint16Array, "uint16"],
      [Int16Array, "int16"],
      [Int32Array, "int32"],
      [Float64Array, "float64"],
      [Uint32Array, "uint32"]
    ]);
    isTypedArrayChecked = false;
    checkTypedArray = () => {
      if (!isTypedArrayChecked) {
        isTypedArrayChecked = true;
        const isBigInt64ArrayAvailable = typeof BigInt64Array !== "undefined" && BigInt64Array.from;
        const isBigUint64ArrayAvailable = typeof BigUint64Array !== "undefined" && BigUint64Array.from;
        const Float16Array2 = globalThis.Float16Array;
        const isFloat16ArrayAvailable = typeof Float16Array2 !== "undefined" && Float16Array2.from;
        if (isBigInt64ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("int64", BigInt64Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigInt64Array, "int64");
        }
        if (isBigUint64ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("uint64", BigUint64Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigUint64Array, "uint64");
        }
        if (isFloat16ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("float16", Float16Array2);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(Float16Array2, "float16");
        } else {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("float16", Uint16Array);
        }
      }
    };
  }
});

// common/dist/esm/tensor-utils-impl.js
var calculateSize, tensorReshape;
var init_tensor_utils_impl = __esm({
  "common/dist/esm/tensor-utils-impl.js"() {
    "use strict";
    init_tensor_impl();
    calculateSize = (dims) => {
      let size = 1;
      for (let i = 0; i < dims.length; i++) {
        const dim = dims[i];
        if (typeof dim !== "number" || !Number.isSafeInteger(dim)) {
          throw new TypeError(`dims[${i}] must be an integer, got: ${dim}`);
        }
        if (dim < 0) {
          throw new RangeError(`dims[${i}] must be a non-negative integer, got: ${dim}`);
        }
        size *= dim;
      }
      return size;
    };
    tensorReshape = (tensor, dims) => {
      switch (tensor.location) {
        case "cpu":
          return new Tensor(tensor.type, tensor.data, dims);
        case "cpu-pinned":
          return new Tensor({
            location: "cpu-pinned",
            data: tensor.data,
            type: tensor.type,
            dims
          });
        case "texture":
          return new Tensor({
            location: "texture",
            texture: tensor.texture,
            type: tensor.type,
            dims
          });
        case "gpu-buffer":
          return new Tensor({
            location: "gpu-buffer",
            gpuBuffer: tensor.gpuBuffer,
            type: tensor.type,
            dims
          });
        case "ml-tensor":
          return new Tensor({
            location: "ml-tensor",
            mlTensor: tensor.mlTensor,
            type: tensor.type,
            dims
          });
        default:
          throw new Error(`tensorReshape: tensor location ${tensor.location} is not supported`);
      }
    };
  }
});

// common/dist/esm/tensor-impl.js
var Tensor;
var init_tensor_impl = __esm({
  "common/dist/esm/tensor-impl.js"() {
    "use strict";
    init_tensor_conversion_impl();
    init_tensor_factory_impl();
    init_tensor_impl_type_mapping();
    init_tensor_utils_impl();
    Tensor = class {
      /**
       * implementation.
       */
      constructor(arg0, arg1, arg2) {
        checkTypedArray();
        let type;
        let dims;
        if (typeof arg0 === "object" && "location" in arg0) {
          this.dataLocation = arg0.location;
          type = arg0.type;
          dims = arg0.dims;
          switch (arg0.location) {
            case "cpu-pinned": {
              const expectedTypedArrayConstructor = NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.get(type);
              if (!expectedTypedArrayConstructor) {
                throw new TypeError(`unsupported type "${type}" to create tensor from pinned buffer`);
              }
              if (!(arg0.data instanceof expectedTypedArrayConstructor)) {
                throw new TypeError(`buffer should be of type ${expectedTypedArrayConstructor.name}`);
              }
              this.cpuData = arg0.data;
              break;
            }
            case "texture": {
              if (type !== "float32") {
                throw new TypeError(`unsupported type "${type}" to create tensor from texture`);
              }
              this.gpuTextureData = arg0.texture;
              this.downloader = arg0.download;
              this.disposer = arg0.dispose;
              break;
            }
            case "gpu-buffer": {
              if (type !== "float32" && type !== "float16" && type !== "int32" && type !== "int64" && type !== "uint32" && type !== "uint8" && type !== "bool" && type !== "uint4" && type !== "int4") {
                throw new TypeError(`unsupported type "${type}" to create tensor from gpu buffer`);
              }
              this.gpuBufferData = arg0.gpuBuffer;
              this.downloader = arg0.download;
              this.disposer = arg0.dispose;
              break;
            }
            case "ml-tensor": {
              if (type !== "float32" && type !== "float16" && type !== "int32" && type !== "int64" && type !== "uint32" && type !== "uint64" && type !== "int8" && type !== "uint8" && type !== "bool" && type !== "uint4" && type !== "int4") {
                throw new TypeError(`unsupported type "${type}" to create tensor from MLTensor`);
              }
              this.mlTensorData = arg0.mlTensor;
              this.downloader = arg0.download;
              this.disposer = arg0.dispose;
              break;
            }
            default:
              throw new Error(`Tensor constructor: unsupported location '${this.dataLocation}'`);
          }
        } else {
          let data;
          let maybeDims;
          if (typeof arg0 === "string") {
            type = arg0;
            maybeDims = arg2;
            if (arg0 === "string") {
              if (!Array.isArray(arg1)) {
                throw new TypeError("A string tensor's data must be a string array.");
              }
              data = arg1;
            } else {
              const typedArrayConstructor = NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.get(arg0);
              if (typedArrayConstructor === void 0) {
                throw new TypeError(`Unsupported tensor type: ${arg0}.`);
              }
              if (Array.isArray(arg1)) {
                if (arg0 === "float16" && typedArrayConstructor === Uint16Array || arg0 === "uint4" || arg0 === "int4") {
                  throw new TypeError(`Creating a ${arg0} tensor from number array is not supported. Please use ${typedArrayConstructor.name} as data.`);
                } else if (arg0 === "uint64" || arg0 === "int64") {
                  data = typedArrayConstructor.from(arg1, BigInt);
                } else {
                  data = typedArrayConstructor.from(arg1);
                }
              } else if (arg1 instanceof typedArrayConstructor) {
                data = arg1;
              } else if (arg1 instanceof Uint8ClampedArray) {
                if (arg0 === "uint8") {
                  data = Uint8Array.from(arg1);
                } else {
                  throw new TypeError(`A Uint8ClampedArray tensor's data must be type of uint8`);
                }
              } else if (arg0 === "float16" && arg1 instanceof Uint16Array && typedArrayConstructor !== Uint16Array) {
                data = new globalThis.Float16Array(arg1.buffer, arg1.byteOffset, arg1.length);
              } else {
                throw new TypeError(`A ${type} tensor's data must be type of ${typedArrayConstructor}`);
              }
            }
          } else {
            maybeDims = arg1;
            if (Array.isArray(arg0)) {
              if (arg0.length === 0) {
                throw new TypeError("Tensor type cannot be inferred from an empty array.");
              }
              const firstElementType = typeof arg0[0];
              if (firstElementType === "string") {
                type = "string";
                data = arg0;
              } else if (firstElementType === "boolean") {
                type = "bool";
                data = Uint8Array.from(arg0);
              } else {
                throw new TypeError(`Invalid element type of data array: ${firstElementType}.`);
              }
            } else if (arg0 instanceof Uint8ClampedArray) {
              type = "uint8";
              data = Uint8Array.from(arg0);
            } else {
              const mappedType = NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.get(arg0.constructor);
              if (mappedType === void 0) {
                throw new TypeError(`Unsupported type for tensor data: ${arg0.constructor}.`);
              }
              type = mappedType;
              data = arg0;
            }
          }
          if (maybeDims === void 0) {
            maybeDims = [data.length];
          } else if (!Array.isArray(maybeDims)) {
            throw new TypeError("A tensor's dims must be a number array");
          }
          dims = maybeDims;
          this.cpuData = data;
          this.dataLocation = "cpu";
        }
        const size = calculateSize(dims);
        if (this.cpuData && size !== this.cpuData.length) {
          if ((type === "uint4" || type === "int4") && Math.ceil(size / 2) === this.cpuData.length) {
          } else {
            throw new Error(`Tensor's size(${size}) does not match data length(${this.cpuData.length}).`);
          }
        }
        this.type = type;
        this.dims = dims;
        this.size = size;
      }
      // #endregion
      // #region factory
      static async fromImage(image, options) {
        return tensorFromImage(image, options);
      }
      static fromTexture(texture, options) {
        return tensorFromTexture(texture, options);
      }
      static fromGpuBuffer(gpuBuffer, options) {
        return tensorFromGpuBuffer(gpuBuffer, options);
      }
      static fromMLTensor(mlTensor, options) {
        return tensorFromMLTensor(mlTensor, options);
      }
      static fromPinnedBuffer(type, buffer, dims) {
        return tensorFromPinnedBuffer(type, buffer, dims);
      }
      // #endregion
      // #region conversions
      toDataURL(options) {
        return tensorToDataURL(this, options);
      }
      toImageData(options) {
        return tensorToImageData(this, options);
      }
      // #endregion
      // #region properties
      get data() {
        this.ensureValid();
        if (!this.cpuData) {
          throw new Error("The data is not on CPU. Use `getData()` to download GPU data to CPU, or use `texture` or `gpuBuffer` property to access the GPU data directly.");
        }
        return this.cpuData;
      }
      get location() {
        return this.dataLocation;
      }
      get texture() {
        this.ensureValid();
        if (!this.gpuTextureData) {
          throw new Error("The data is not stored as a WebGL texture.");
        }
        return this.gpuTextureData;
      }
      get gpuBuffer() {
        this.ensureValid();
        if (!this.gpuBufferData) {
          throw new Error("The data is not stored as a WebGPU buffer.");
        }
        return this.gpuBufferData;
      }
      get mlTensor() {
        this.ensureValid();
        if (!this.mlTensorData) {
          throw new Error("The data is not stored as a WebNN MLTensor.");
        }
        return this.mlTensorData;
      }
      // #endregion
      // #region methods
      async getData(releaseData) {
        this.ensureValid();
        switch (this.dataLocation) {
          case "cpu":
          case "cpu-pinned":
            return this.data;
          case "texture":
          case "gpu-buffer":
          case "ml-tensor": {
            if (!this.downloader) {
              throw new Error("The current tensor is not created with a specified data downloader.");
            }
            if (this.isDownloading) {
              throw new Error("The current tensor is being downloaded.");
            }
            try {
              this.isDownloading = true;
              const data = await this.downloader();
              this.downloader = void 0;
              this.dataLocation = "cpu";
              this.cpuData = data;
              if (releaseData && this.disposer) {
                this.disposer();
                this.disposer = void 0;
              }
              return data;
            } finally {
              this.isDownloading = false;
            }
          }
          default:
            throw new Error(`cannot get data from location: ${this.dataLocation}`);
        }
      }
      dispose() {
        if (this.isDownloading) {
          throw new Error("The current tensor is being downloaded.");
        }
        if (this.disposer) {
          this.disposer();
          this.disposer = void 0;
        }
        this.cpuData = void 0;
        this.gpuTextureData = void 0;
        this.gpuBufferData = void 0;
        this.mlTensorData = void 0;
        this.downloader = void 0;
        this.isDownloading = void 0;
        this.dataLocation = "none";
      }
      // #endregion
      // #region tensor utilities
      ensureValid() {
        if (this.dataLocation === "none") {
          throw new Error("The tensor is disposed.");
        }
      }
      reshape(dims) {
        this.ensureValid();
        if (this.downloader || this.disposer) {
          throw new Error("Cannot reshape a tensor that owns GPU resource.");
        }
        return tensorReshape(this, dims);
      }
    };
  }
});

// common/dist/esm/tensor.js
var Tensor2;
var init_tensor = __esm({
  "common/dist/esm/tensor.js"() {
    "use strict";
    init_tensor_impl();
    Tensor2 = Tensor;
  }
});

// common/dist/esm/trace.js
var TRACE, TRACE_FUNC, TRACE_FUNC_BEGIN, TRACE_FUNC_END;
var init_trace = __esm({
  "common/dist/esm/trace.js"() {
    "use strict";
    init_env_impl();
    TRACE = (deviceType, label) => {
      if (typeof env.trace === "undefined" ? !env.wasm.trace : !env.trace) {
        return;
      }
      console.timeStamp(`${deviceType}::ORT::${label}`);
    };
    TRACE_FUNC = (msg, extraMsg) => {
      const stack = new Error().stack?.split(/\r\n|\r|\n/g) || [];
      let hasTraceFunc = false;
      for (let i = 0; i < stack.length; i++) {
        if (hasTraceFunc && !stack[i].includes("TRACE_FUNC")) {
          let label = `FUNC_${msg}::${stack[i].trim().split(" ")[1]}`;
          if (extraMsg) {
            label += `::${extraMsg}`;
          }
          TRACE("CPU", label);
          return;
        }
        if (stack[i].includes("TRACE_FUNC")) {
          hasTraceFunc = true;
        }
      }
    };
    TRACE_FUNC_BEGIN = (extraMsg) => {
      if (typeof env.trace === "undefined" ? !env.wasm.trace : !env.trace) {
        return;
      }
      TRACE_FUNC("BEGIN", extraMsg);
    };
    TRACE_FUNC_END = (extraMsg) => {
      if (typeof env.trace === "undefined" ? !env.wasm.trace : !env.trace) {
        return;
      }
      TRACE_FUNC("END", extraMsg);
    };
  }
});

// common/dist/esm/inference-session-impl.js
var InferenceSession;
var init_inference_session_impl = __esm({
  "common/dist/esm/inference-session-impl.js"() {
    "use strict";
    init_backend_impl();
    init_tensor();
    init_trace();
    InferenceSession = class _InferenceSession {
      constructor(handler) {
        this.handler = handler;
      }
      async run(feeds, arg1, arg2) {
        TRACE_FUNC_BEGIN();
        const fetches = {};
        let options = {};
        if (typeof feeds !== "object" || feeds === null || feeds instanceof Tensor2 || Array.isArray(feeds)) {
          throw new TypeError("'feeds' must be an object that use input names as keys and OnnxValue as corresponding values.");
        }
        let isFetchesEmpty = true;
        if (typeof arg1 === "object") {
          if (arg1 === null) {
            throw new TypeError("Unexpected argument[1]: cannot be null.");
          }
          if (arg1 instanceof Tensor2) {
            throw new TypeError("'fetches' cannot be a Tensor");
          }
          if (Array.isArray(arg1)) {
            if (arg1.length === 0) {
              throw new TypeError("'fetches' cannot be an empty array.");
            }
            isFetchesEmpty = false;
            for (const name of arg1) {
              if (typeof name !== "string") {
                throw new TypeError("'fetches' must be a string array or an object.");
              }
              if (this.outputNames.indexOf(name) === -1) {
                throw new RangeError(`'fetches' contains invalid output name: ${name}.`);
              }
              fetches[name] = null;
            }
            if (typeof arg2 === "object" && arg2 !== null) {
              options = arg2;
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'options' must be an object.");
            }
          } else {
            let isFetches = false;
            const arg1Keys = Object.getOwnPropertyNames(arg1);
            for (const name of this.outputNames) {
              if (arg1Keys.indexOf(name) !== -1) {
                const v = arg1[name];
                if (v === null || v instanceof Tensor2) {
                  isFetches = true;
                  isFetchesEmpty = false;
                  fetches[name] = v;
                }
              }
            }
            if (isFetches) {
              if (typeof arg2 === "object" && arg2 !== null) {
                options = arg2;
              } else if (typeof arg2 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else {
              options = arg1;
            }
          }
        } else if (typeof arg1 !== "undefined") {
          throw new TypeError("Unexpected argument[1]: must be 'fetches' or 'options'.");
        }
        for (const name of this.inputNames) {
          if (typeof feeds[name] === "undefined") {
            throw new Error(`input '${name}' is missing in 'feeds'.`);
          }
        }
        if (isFetchesEmpty) {
          for (const name of this.outputNames) {
            fetches[name] = null;
          }
        }
        const results = await this.handler.run(feeds, fetches, options);
        const returnValue = {};
        for (const key in results) {
          if (Object.hasOwnProperty.call(results, key)) {
            const result = results[key];
            if (result instanceof Tensor2) {
              returnValue[key] = result;
            } else {
              returnValue[key] = new Tensor2(result.type, result.data, result.dims);
            }
          }
        }
        TRACE_FUNC_END();
        return returnValue;
      }
      async release() {
        return this.handler.dispose();
      }
      static async create(arg0, arg1, arg2, arg3) {
        TRACE_FUNC_BEGIN();
        let filePathOrUint8Array;
        let options = {};
        if (typeof arg0 === "string") {
          filePathOrUint8Array = arg0;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
        } else if (arg0 instanceof Uint8Array) {
          filePathOrUint8Array = arg0;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
        } else if (arg0 instanceof ArrayBuffer || typeof SharedArrayBuffer !== "undefined" && arg0 instanceof SharedArrayBuffer) {
          const buffer = arg0;
          let byteOffset = 0;
          let byteLength = arg0.byteLength;
          if (typeof arg1 === "object" && arg1 !== null) {
            options = arg1;
          } else if (typeof arg1 === "number") {
            byteOffset = arg1;
            if (!Number.isSafeInteger(byteOffset)) {
              throw new RangeError("'byteOffset' must be an integer.");
            }
            if (byteOffset < 0 || byteOffset >= buffer.byteLength) {
              throw new RangeError(`'byteOffset' is out of range [0, ${buffer.byteLength}).`);
            }
            byteLength = arg0.byteLength - byteOffset;
            if (typeof arg2 === "number") {
              byteLength = arg2;
              if (!Number.isSafeInteger(byteLength)) {
                throw new RangeError("'byteLength' must be an integer.");
              }
              if (byteLength <= 0 || byteOffset + byteLength > buffer.byteLength) {
                throw new RangeError(`'byteLength' is out of range (0, ${buffer.byteLength - byteOffset}].`);
              }
              if (typeof arg3 === "object" && arg3 !== null) {
                options = arg3;
              } else if (typeof arg3 !== "undefined") {
                throw new TypeError("'options' must be an object.");
              }
            } else if (typeof arg2 !== "undefined") {
              throw new TypeError("'byteLength' must be a number.");
            }
          } else if (typeof arg1 !== "undefined") {
            throw new TypeError("'options' must be an object.");
          }
          filePathOrUint8Array = new Uint8Array(buffer, byteOffset, byteLength);
        } else {
          throw new TypeError("Unexpected argument[0]: must be 'path' or 'buffer'.");
        }
        const [backend, optionsWithValidatedEPs] = await resolveBackendAndExecutionProviders(options);
        const handler = await backend.createInferenceSessionHandler(filePathOrUint8Array, optionsWithValidatedEPs);
        TRACE_FUNC_END();
        return new _InferenceSession(handler);
      }
      startProfiling() {
        this.handler.startProfiling();
      }
      endProfiling() {
        this.handler.endProfiling();
      }
      get inputNames() {
        return this.handler.inputNames;
      }
      get outputNames() {
        return this.handler.outputNames;
      }
      get inputMetadata() {
        return this.handler.inputMetadata;
      }
      get outputMetadata() {
        return this.handler.outputMetadata;
      }
    };
  }
});

// common/dist/esm/inference-session.js
var InferenceSession2;
var init_inference_session = __esm({
  "common/dist/esm/inference-session.js"() {
    "use strict";
    init_inference_session_impl();
    InferenceSession2 = InferenceSession;
  }
});

// common/dist/esm/tensor-conversion.js
var init_tensor_conversion = __esm({
  "common/dist/esm/tensor-conversion.js"() {
    "use strict";
  }
});

// common/dist/esm/tensor-factory.js
var init_tensor_factory = __esm({
  "common/dist/esm/tensor-factory.js"() {
    "use strict";
  }
});

// common/dist/esm/onnx-model.js
var init_onnx_model = __esm({
  "common/dist/esm/onnx-model.js"() {
    "use strict";
  }
});

// common/dist/esm/onnx-value.js
var init_onnx_value = __esm({
  "common/dist/esm/onnx-value.js"() {
    "use strict";
  }
});

// common/dist/esm/index.js
var esm_exports = {};
__export(esm_exports, {
  InferenceSession: () => InferenceSession2,
  TRACE: () => TRACE,
  TRACE_FUNC_BEGIN: () => TRACE_FUNC_BEGIN,
  TRACE_FUNC_END: () => TRACE_FUNC_END,
  Tensor: () => Tensor2,
  env: () => env2,
  registerBackend: () => registerBackend
});
var init_esm = __esm({
  "common/dist/esm/index.js"() {
    "use strict";
    init_backend();
    init_env();
    init_inference_session();
    init_tensor();
    init_tensor_conversion();
    init_tensor_factory();
    init_trace();
    init_onnx_model();
    init_onnx_value();
  }
});

// web/lib/wasm/wasm-utils-env.ts
var isNode;
var init_wasm_utils_env = __esm({
  "web/lib/wasm/wasm-utils-env.ts"() {
    "use strict";
    isNode = false;
  }
});

// web/dist/ort-wasm-simd-threaded.jsep.mjs
var ort_wasm_simd_threaded_jsep_exports = {};
__export(ort_wasm_simd_threaded_jsep_exports, {
  default: () => ort_wasm_simd_threaded_jsep_default
});
var r, e, ort_wasm_simd_threaded_jsep_default, t;
var init_ort_wasm_simd_threaded_jsep = __esm({
  "web/dist/ort-wasm-simd-threaded.jsep.mjs"() {
    "use strict";
    e = (r = import.meta.url, async function(e3 = {}) {
      var t3, n, a = e3, o = new Promise((r3, e4) => {
        t3 = r3, n = e4;
      }), i = "object" == typeof window, u = "undefined" != typeof WorkerGlobalScope, s = u && self.name?.startsWith("em-pthread");
      a.mountExternalData = (r3, e4) => {
        r3.startsWith("./") && (r3 = r3.substring(2)), (a.Fb || (a.Fb = /* @__PURE__ */ new Map())).set(r3, e4);
      }, a.unmountExternalData = () => {
        delete a.Fb;
      };
      var f = globalThis.SharedArrayBuffer ?? new WebAssembly.Memory({ initial: 0, maximum: 0, qc: true }).buffer.constructor;
      const b = (r3) => async (...e4) => {
        try {
          if (a.Gb) throw Error("Session already started");
          const t4 = a.Gb = { ec: e4[0], errors: [] }, n2 = await r3(...e4);
          if (a.Gb !== t4) throw Error("Session mismatch");
          a.Kb?.flush();
          const o2 = t4.errors;
          if (0 < o2.length) {
            let r4 = await Promise.all(o2);
            if (r4 = r4.filter((r5) => r5), 0 < r4.length) throw Error(r4.join("\n"));
          }
          return n2;
        } finally {
          a.Gb = null;
        }
      };
      a.jsepInit = (r3, e4) => {
        if ("webgpu" === r3) {
          [a.Kb, a.Vb, a.Zb, a.Lb, a.Yb, a.kb, a.$b, a.bc, a.Wb, a.Xb, a.ac] = e4;
          const r4 = a.Kb;
          a.jsepRegisterBuffer = (e5, t4, n2, a2) => r4.registerBuffer(e5, t4, n2, a2), a.jsepGetBuffer = (e5) => r4.getBuffer(e5), a.jsepCreateDownloader = (e5, t4, n2) => r4.createDownloader(e5, t4, n2), a.jsepOnCreateSession = (e5) => {
            r4.onCreateSession(e5);
          }, a.jsepOnReleaseSession = (e5) => {
            r4.onReleaseSession(e5);
          }, a.jsepOnRunStart = (e5) => r4.onRunStart(e5), a.cc = (e5, t4) => {
            r4.upload(e5, t4);
          };
        } else if ("webnn" === r3) {
          const r4 = e4[0];
          [a.oc, a.Ob, a.webnnEnsureTensor, a.Pb, a.webnnDownloadTensor] = e4.slice(1), a.webnnReleaseTensorId = a.Ob, a.webnnUploadTensor = a.Pb, a.webnnOnRunStart = (e5) => r4.onRunStart(e5), a.webnnOnRunEnd = r4.onRunEnd.bind(r4), a.webnnRegisterMLContext = (e5, t4) => {
            r4.registerMLContext(e5, t4);
          }, a.webnnOnReleaseSession = (e5) => {
            r4.onReleaseSession(e5);
          }, a.webnnCreateMLTensorDownloader = (e5, t4) => r4.createMLTensorDownloader(e5, t4), a.webnnRegisterMLTensor = (e5, t4, n2, a2) => r4.registerMLTensor(e5, t4, n2, a2), a.webnnCreateMLContext = (e5) => r4.createMLContext(e5), a.webnnRegisterMLConstant = (e5, t4, n2, o2, i2, u2) => r4.registerMLConstant(e5, t4, n2, o2, i2, a.Fb, u2), a.webnnRegisterGraphInput = r4.registerGraphInput.bind(r4), a.webnnIsGraphInput = r4.isGraphInput.bind(r4), a.webnnRegisterGraphOutput = r4.registerGraphOutput.bind(r4), a.webnnIsGraphOutput = r4.isGraphOutput.bind(r4), a.webnnCreateTemporaryTensor = r4.createTemporaryTensor.bind(r4), a.webnnIsGraphInputOutputTypeSupported = r4.isGraphInputOutputTypeSupported.bind(r4);
        }
      };
      let m = () => {
        const r3 = (r4, e4, t4) => (...n2) => {
          const a2 = Le, o2 = e4?.();
          n2 = r4(...n2);
          const i2 = e4?.();
          return o2 !== i2 && (r4 = i2, t4(o2), e4 = t4 = null), Le != a2 ? new Promise((r5, e5) => {
            qe = { resolve: r5, reject: e5 };
          }) : n2;
        };
        (() => {
          for (const e4 of ["_OrtAppendExecutionProvider", "_OrtCreateSession", "_OrtRun", "_OrtRunWithBinding", "_OrtBindInput"]) a[e4] = r3(a[e4], () => a[e4], (r4) => a[e4] = r4);
        })(), void 0 !== b && (a._OrtRun = b(a._OrtRun), a._OrtRunWithBinding = b(a._OrtRunWithBinding)), m = void 0;
      };
      a.asyncInit = () => {
        m?.();
      };
      var l, c, d = Object.assign({}, a), p = (r3, e4) => {
        throw e4;
      }, y = "";
      (i || u) && (u ? y = self.location.href : "undefined" != typeof document && document.currentScript && (y = document.currentScript.src), r && (y = r), y = y.startsWith("blob:") ? "" : y.slice(0, y.replace(/[?#].*/, "").lastIndexOf("/") + 1), u && (c = (r3) => {
        var e4 = new XMLHttpRequest();
        return e4.open("GET", r3, false), e4.responseType = "arraybuffer", e4.send(null), new Uint8Array(e4.response);
      }), l = async (r3) => {
        if (P(r3)) return new Promise((e5, t4) => {
          var n2 = new XMLHttpRequest();
          n2.open("GET", r3, true), n2.responseType = "arraybuffer", n2.onload = () => {
            200 == n2.status || 0 == n2.status && n2.response ? e5(n2.response) : t4(n2.status);
          }, n2.onerror = t4, n2.send(null);
        });
        var e4 = await fetch(r3, { credentials: "same-origin" });
        if (e4.ok) return e4.arrayBuffer();
        throw Error(e4.status + " : " + e4.url);
      });
      var h = console.log.bind(console), v = console.error.bind(console), g = h, N = v;
      Object.assign(a, d), d = null;
      var k, w, A, C, _, O, T, W, S, E, x, R, M, H = a.wasmBinary, D = false, P = (r3) => r3.startsWith("file://");
      function F() {
        return k.buffer != C.buffer && q(), C;
      }
      function B() {
        return k.buffer != C.buffer && q(), _;
      }
      function I() {
        return k.buffer != C.buffer && q(), O;
      }
      function G() {
        return k.buffer != C.buffer && q(), T;
      }
      function L() {
        return k.buffer != C.buffer && q(), W;
      }
      function U() {
        return k.buffer != C.buffer && q(), S;
      }
      function $() {
        return k.buffer != C.buffer && q(), E;
      }
      function j() {
        return k.buffer != C.buffer && q(), M;
      }
      if (s) {
        let Rn2 = function(r3) {
          try {
            var e4 = r3.data, t4 = e4.Cb;
            if ("load" === t4) {
              let r4 = [];
              self.onmessage = (e5) => r4.push(e5), self.startWorker = () => {
                postMessage({ Cb: "loaded" });
                for (let e5 of r4) Rn2(e5);
                self.onmessage = Rn2;
              };
              for (const r5 of e4.Sb) a[r5] && !a[r5].proxy || (a[r5] = (...e5) => {
                postMessage({ Cb: "callHandler", Rb: r5, args: e5 });
              }, "print" == r5 && (g = a[r5]), "printErr" == r5 && (N = a[r5]));
              k = e4.lc, q(), z(e4.mc);
            } else if ("run" === t4) {
              kr(e4.Bb), yn(e4.Bb, 0, 0, 1, 0, 0), vr(), Te(e4.Bb), V || (ln(), V = true);
              try {
                wr(e4.hc, e4.Ib);
              } catch (r4) {
                if ("unwind" != r4) throw r4;
              }
            } else "setimmediate" !== e4.target && ("checkMailbox" === t4 ? V && We() : t4 && (N(`worker: received unknown command ${t4}`), N(e4)));
          } catch (r4) {
            throw hn(), r4;
          }
        };
        var Rn = Rn2;
        var z, V = false;
        N = function(...r3) {
          r3 = r3.join(" "), console.error(r3);
        }, self.alert = function(...r3) {
          postMessage({ Cb: "alert", text: r3.join(" "), jc: cn() });
        }, self.onunhandledrejection = (r3) => {
          throw r3.reason || r3;
        }, self.onmessage = Rn2;
      }
      function q() {
        var r3 = k.buffer;
        a.HEAP8 = C = new Int8Array(r3), a.HEAP16 = O = new Int16Array(r3), a.HEAPU8 = _ = new Uint8Array(r3), a.HEAPU16 = T = new Uint16Array(r3), a.HEAP32 = W = new Int32Array(r3), a.HEAPU32 = S = new Uint32Array(r3), a.HEAPF32 = E = new Float32Array(r3), a.HEAPF64 = M = new Float64Array(r3), a.HEAP64 = x = new BigInt64Array(r3), a.HEAPU64 = R = new BigUint64Array(r3);
      }
      function Y() {
        s ? startWorker(a) : fn.Da();
      }
      s || (k = new WebAssembly.Memory({ initial: 256, maximum: 65536, shared: true }), q());
      var J, Q = 0, X = null;
      function K() {
        if (0 == --Q && X) {
          var r3 = X;
          X = null, r3();
        }
      }
      function Z(r3) {
        throw N(r3 = "Aborted(" + r3 + ")"), D = true, r3 = new WebAssembly.RuntimeError(r3 + ". Build with -sASSERTIONS for more info."), n(r3), r3;
      }
      function rr() {
        return { a: { L: nr, Aa: tr, b: Cr, $: Or, A: Er, pa: xr, X: Hr, Z: Dr, qa: Pr, na: Fr, ga: Br, ma: Ir, J: Gr, Y: Lr, V: Ur, oa: $r, W: jr, va: qr, E: re, Q: te, O: be, D: le, v: ce, r: de, P: pe, z: Ae, R: Ce, ja: _e, T: Se, aa: xe, M: Re, F: Me, ia: Te, sa: He, t: Fe, Ca: Be, w: Qe, o: Ke, m: et, c: oe, Ba: tt, n: at, j: st, u: ft, p: bt, f: mt, s: lt, l: ct, e: dt, k: pt, h: yt, g: ht, d: vt, da: gt, ea: At, fa: Ct, ba: _t, ca: Ot, N: St, xa: Et, ua: Mt, i: Pt, C: Ft, G: Bt, ta: xt, x: It, ra: Gt, U: Lt, q: Wt, y: Ut, K: $t, S: jt, za: Yt, ya: Jt, ka: Zt, la: rn, _: lr, B: en, I: tn, ha: nn, H: on, a: k, wa: br } };
      }
      var er = { 840156: (r3, e4, t4, n2, o2) => {
        if (void 0 === a || !a.Fb) return 1;
        if ((r3 = Sr(Number(r3 >>> 0))).startsWith("./") && (r3 = r3.substring(2)), !(r3 = a.Fb.get(r3))) return 2;
        if (e4 = Number(e4 >>> 0), t4 = Number(t4 >>> 0), n2 = Number(n2 >>> 0), e4 + t4 > r3.byteLength) return 3;
        try {
          const i2 = r3.subarray(e4, e4 + t4);
          switch (o2) {
            case 0:
              B().set(i2, n2 >>> 0);
              break;
            case 1:
              a.nc ? a.nc(n2, i2) : a.cc(n2, i2);
              break;
            default:
              return 4;
          }
          return 0;
        } catch {
          return 4;
        }
      }, 840980: (r3, e4, t4) => {
        a.Pb(r3, B().subarray(e4 >>> 0, e4 + t4 >>> 0));
      }, 841044: () => a.oc(), 841086: (r3) => {
        a.Ob(r3);
      }, 841123: () => {
        a.Wb();
      }, 841154: () => {
        a.Xb();
      }, 841183: () => {
        a.ac();
      }, 841208: (r3) => a.Vb(r3), 841241: (r3) => a.Zb(r3), 841273: (r3, e4, t4) => {
        a.Lb(Number(r3), Number(e4), Number(t4), true);
      }, 841336: (r3, e4, t4) => {
        a.Lb(Number(r3), Number(e4), Number(t4));
      }, 841393: () => "undefined" != typeof wasmOffsetConverter, 841450: (r3) => {
        a.kb("Abs", r3, void 0);
      }, 841501: (r3) => {
        a.kb("Neg", r3, void 0);
      }, 841552: (r3) => {
        a.kb("Floor", r3, void 0);
      }, 841605: (r3) => {
        a.kb("Ceil", r3, void 0);
      }, 841657: (r3) => {
        a.kb("Reciprocal", r3, void 0);
      }, 841715: (r3) => {
        a.kb("Sqrt", r3, void 0);
      }, 841767: (r3) => {
        a.kb("Exp", r3, void 0);
      }, 841818: (r3) => {
        a.kb("Erf", r3, void 0);
      }, 841869: (r3) => {
        a.kb("Sigmoid", r3, void 0);
      }, 841924: (r3, e4, t4) => {
        a.kb("HardSigmoid", r3, { alpha: e4, beta: t4 });
      }, 842003: (r3) => {
        a.kb("Log", r3, void 0);
      }, 842054: (r3) => {
        a.kb("Sin", r3, void 0);
      }, 842105: (r3) => {
        a.kb("Cos", r3, void 0);
      }, 842156: (r3) => {
        a.kb("Tan", r3, void 0);
      }, 842207: (r3) => {
        a.kb("Asin", r3, void 0);
      }, 842259: (r3) => {
        a.kb("Acos", r3, void 0);
      }, 842311: (r3) => {
        a.kb("Atan", r3, void 0);
      }, 842363: (r3) => {
        a.kb("Sinh", r3, void 0);
      }, 842415: (r3) => {
        a.kb("Cosh", r3, void 0);
      }, 842467: (r3) => {
        a.kb("Asinh", r3, void 0);
      }, 842520: (r3) => {
        a.kb("Acosh", r3, void 0);
      }, 842573: (r3) => {
        a.kb("Atanh", r3, void 0);
      }, 842626: (r3) => {
        a.kb("Tanh", r3, void 0);
      }, 842678: (r3) => {
        a.kb("Not", r3, void 0);
      }, 842729: (r3, e4, t4) => {
        a.kb("Clip", r3, { min: e4, max: t4 });
      }, 842798: (r3) => {
        a.kb("Clip", r3, void 0);
      }, 842850: (r3, e4) => {
        a.kb("Elu", r3, { alpha: e4 });
      }, 842908: (r3) => {
        a.kb("Gelu", r3, void 0);
      }, 842960: (r3) => {
        a.kb("Relu", r3, void 0);
      }, 843012: (r3, e4) => {
        a.kb("LeakyRelu", r3, { alpha: e4 });
      }, 843076: (r3, e4) => {
        a.kb("ThresholdedRelu", r3, { alpha: e4 });
      }, 843146: (r3, e4) => {
        a.kb("Cast", r3, { to: e4 });
      }, 843204: (r3) => {
        a.kb("Add", r3, void 0);
      }, 843255: (r3) => {
        a.kb("Sub", r3, void 0);
      }, 843306: (r3) => {
        a.kb("Mul", r3, void 0);
      }, 843357: (r3) => {
        a.kb("Div", r3, void 0);
      }, 843408: (r3) => {
        a.kb("Pow", r3, void 0);
      }, 843459: (r3) => {
        a.kb("Equal", r3, void 0);
      }, 843512: (r3) => {
        a.kb("Greater", r3, void 0);
      }, 843567: (r3) => {
        a.kb("GreaterOrEqual", r3, void 0);
      }, 843629: (r3) => {
        a.kb("Less", r3, void 0);
      }, 843681: (r3) => {
        a.kb("LessOrEqual", r3, void 0);
      }, 843740: (r3, e4, t4, n2, o2) => {
        a.kb("ReduceMean", r3, { keepDims: !!e4, noopWithEmptyAxes: !!t4, axes: n2 ? Array.from(L().subarray(Number(n2) >>> 0, Number(o2) >>> 0)) : [] });
      }, 843915: (r3, e4, t4, n2, o2) => {
        a.kb("ReduceMax", r3, { keepDims: !!e4, noopWithEmptyAxes: !!t4, axes: n2 ? Array.from(L().subarray(Number(n2) >>> 0, Number(o2) >>> 0)) : [] });
      }, 844089: (r3, e4, t4, n2, o2) => {
        a.kb("ReduceMin", r3, { keepDims: !!e4, noopWithEmptyAxes: !!t4, axes: n2 ? Array.from(L().subarray(Number(n2) >>> 0, Number(o2) >>> 0)) : [] });
      }, 844263: (r3, e4, t4, n2, o2) => {
        a.kb("ReduceProd", r3, { keepDims: !!e4, noopWithEmptyAxes: !!t4, axes: n2 ? Array.from(L().subarray(Number(n2) >>> 0, Number(o2) >>> 0)) : [] });
      }, 844438: (r3, e4, t4, n2, o2) => {
        a.kb("ReduceSum", r3, { keepDims: !!e4, noopWithEmptyAxes: !!t4, axes: n2 ? Array.from(L().subarray(Number(n2) >>> 0, Number(o2) >>> 0)) : [] });
      }, 844612: (r3, e4, t4, n2, o2) => {
        a.kb("ReduceL1", r3, { keepDims: !!e4, noopWithEmptyAxes: !!t4, axes: n2 ? Array.from(L().subarray(Number(n2) >>> 0, Number(o2) >>> 0)) : [] });
      }, 844785: (r3, e4, t4, n2, o2) => {
        a.kb("ReduceL2", r3, { keepDims: !!e4, noopWithEmptyAxes: !!t4, axes: n2 ? Array.from(L().subarray(Number(n2) >>> 0, Number(o2) >>> 0)) : [] });
      }, 844958: (r3, e4, t4, n2, o2) => {
        a.kb("ReduceLogSum", r3, { keepDims: !!e4, noopWithEmptyAxes: !!t4, axes: n2 ? Array.from(L().subarray(Number(n2) >>> 0, Number(o2) >>> 0)) : [] });
      }, 845135: (r3, e4, t4, n2, o2) => {
        a.kb("ReduceSumSquare", r3, { keepDims: !!e4, noopWithEmptyAxes: !!t4, axes: n2 ? Array.from(L().subarray(Number(n2) >>> 0, Number(o2) >>> 0)) : [] });
      }, 845315: (r3, e4, t4, n2, o2) => {
        a.kb("ReduceLogSumExp", r3, { keepDims: !!e4, noopWithEmptyAxes: !!t4, axes: n2 ? Array.from(L().subarray(Number(n2) >>> 0, Number(o2) >>> 0)) : [] });
      }, 845495: (r3) => {
        a.kb("Where", r3, void 0);
      }, 845548: (r3, e4, t4) => {
        a.kb("Transpose", r3, { perm: e4 ? Array.from(L().subarray(Number(e4) >>> 0, Number(t4) >>> 0)) : [] });
      }, 845672: (r3, e4, t4, n2) => {
        a.kb("DepthToSpace", r3, { blocksize: e4, mode: Sr(t4), format: n2 ? "NHWC" : "NCHW" });
      }, 845805: (r3, e4, t4, n2) => {
        a.kb("DepthToSpace", r3, { blocksize: e4, mode: Sr(t4), format: n2 ? "NHWC" : "NCHW" });
      }, 845938: (r3, e4, t4, n2, o2, i2, u2, s2, f2, b2, m2, l2, c2, d2, p2) => {
        a.kb("ConvTranspose", r3, { format: f2 ? "NHWC" : "NCHW", autoPad: e4, dilations: [t4], group: n2, kernelShape: [o2], pads: [i2, u2], strides: [s2], wIsConst: () => !!F()[b2 >>> 0], outputPadding: m2 ? Array.from(L().subarray(Number(m2) >>> 0, Number(l2) >>> 0)) : [], outputShape: c2 ? Array.from(L().subarray(Number(c2) >>> 0, Number(d2) >>> 0)) : [], activation: Sr(p2) });
      }, 846371: (r3, e4, t4, n2, o2, i2, u2, s2, f2, b2, m2, l2, c2, d2) => {
        a.kb("ConvTranspose", r3, { format: s2 ? "NHWC" : "NCHW", autoPad: e4, dilations: Array.from(L().subarray(Number(t4) >>> 0, 2 + (Number(t4) >>> 0) >>> 0)), group: n2, kernelShape: Array.from(L().subarray(Number(o2) >>> 0, 2 + (Number(o2) >>> 0) >>> 0)), pads: Array.from(L().subarray(Number(i2) >>> 0, 4 + (Number(i2) >>> 0) >>> 0)), strides: Array.from(L().subarray(Number(u2) >>> 0, 2 + (Number(u2) >>> 0) >>> 0)), wIsConst: () => !!F()[f2 >>> 0], outputPadding: b2 ? Array.from(L().subarray(Number(b2) >>> 0, Number(m2) >>> 0)) : [], outputShape: l2 ? Array.from(L().subarray(Number(l2) >>> 0, Number(c2) >>> 0)) : [], activation: Sr(d2) });
      }, 847032: (r3, e4, t4, n2, o2, i2, u2, s2, f2, b2, m2, l2, c2, d2, p2) => {
        a.kb("ConvTranspose", r3, { format: f2 ? "NHWC" : "NCHW", autoPad: e4, dilations: [t4], group: n2, kernelShape: [o2], pads: [i2, u2], strides: [s2], wIsConst: () => !!F()[b2 >>> 0], outputPadding: m2 ? Array.from(L().subarray(Number(m2) >>> 0, Number(l2) >>> 0)) : [], outputShape: c2 ? Array.from(L().subarray(Number(c2) >>> 0, Number(d2) >>> 0)) : [], activation: Sr(p2) });
      }, 847465: (r3, e4, t4, n2, o2, i2, u2, s2, f2, b2, m2, l2, c2, d2) => {
        a.kb("ConvTranspose", r3, { format: s2 ? "NHWC" : "NCHW", autoPad: e4, dilations: Array.from(L().subarray(Number(t4) >>> 0, 2 + (Number(t4) >>> 0) >>> 0)), group: n2, kernelShape: Array.from(L().subarray(Number(o2) >>> 0, 2 + (Number(o2) >>> 0) >>> 0)), pads: Array.from(L().subarray(Number(i2) >>> 0, 4 + (Number(i2) >>> 0) >>> 0)), strides: Array.from(L().subarray(Number(u2) >>> 0, 2 + (Number(u2) >>> 0) >>> 0)), wIsConst: () => !!F()[f2 >>> 0], outputPadding: b2 ? Array.from(L().subarray(Number(b2) >>> 0, Number(m2) >>> 0)) : [], outputShape: l2 ? Array.from(L().subarray(Number(l2) >>> 0, Number(c2) >>> 0)) : [], activation: Sr(d2) });
      }, 848126: (r3, e4) => {
        a.kb("GlobalAveragePool", r3, { format: e4 ? "NHWC" : "NCHW" });
      }, 848217: (r3, e4, t4, n2, o2, i2, u2, s2, f2, b2, m2, l2, c2, d2) => {
        a.kb("AveragePool", r3, { format: d2 ? "NHWC" : "NCHW", auto_pad: e4, ceil_mode: t4, count_include_pad: n2, storage_order: o2, dilations: i2 ? Array.from(L().subarray(Number(i2) >>> 0, Number(u2) >>> 0)) : [], kernel_shape: s2 ? Array.from(L().subarray(Number(s2) >>> 0, Number(f2) >>> 0)) : [], pads: b2 ? Array.from(L().subarray(Number(b2) >>> 0, Number(m2) >>> 0)) : [], strides: l2 ? Array.from(L().subarray(Number(l2) >>> 0, Number(c2) >>> 0)) : [] });
      }, 848696: (r3, e4) => {
        a.kb("GlobalAveragePool", r3, { format: e4 ? "NHWC" : "NCHW" });
      }, 848787: (r3, e4, t4, n2, o2, i2, u2, s2, f2, b2, m2, l2, c2, d2) => {
        a.kb("AveragePool", r3, { format: d2 ? "NHWC" : "NCHW", auto_pad: e4, ceil_mode: t4, count_include_pad: n2, storage_order: o2, dilations: i2 ? Array.from(L().subarray(Number(i2) >>> 0, Number(u2) >>> 0)) : [], kernel_shape: s2 ? Array.from(L().subarray(Number(s2) >>> 0, Number(f2) >>> 0)) : [], pads: b2 ? Array.from(L().subarray(Number(b2) >>> 0, Number(m2) >>> 0)) : [], strides: l2 ? Array.from(L().subarray(Number(l2) >>> 0, Number(c2) >>> 0)) : [] });
      }, 849266: (r3, e4) => {
        a.kb("GlobalMaxPool", r3, { format: e4 ? "NHWC" : "NCHW" });
      }, 849353: (r3, e4, t4, n2, o2, i2, u2, s2, f2, b2, m2, l2, c2, d2) => {
        a.kb("MaxPool", r3, { format: d2 ? "NHWC" : "NCHW", auto_pad: e4, ceil_mode: t4, count_include_pad: n2, storage_order: o2, dilations: i2 ? Array.from(L().subarray(Number(i2) >>> 0, Number(u2) >>> 0)) : [], kernel_shape: s2 ? Array.from(L().subarray(Number(s2) >>> 0, Number(f2) >>> 0)) : [], pads: b2 ? Array.from(L().subarray(Number(b2) >>> 0, Number(m2) >>> 0)) : [], strides: l2 ? Array.from(L().subarray(Number(l2) >>> 0, Number(c2) >>> 0)) : [] });
      }, 849828: (r3, e4) => {
        a.kb("GlobalMaxPool", r3, { format: e4 ? "NHWC" : "NCHW" });
      }, 849915: (r3, e4, t4, n2, o2, i2, u2, s2, f2, b2, m2, l2, c2, d2) => {
        a.kb("MaxPool", r3, { format: d2 ? "NHWC" : "NCHW", auto_pad: e4, ceil_mode: t4, count_include_pad: n2, storage_order: o2, dilations: i2 ? Array.from(L().subarray(Number(i2) >>> 0, Number(u2) >>> 0)) : [], kernel_shape: s2 ? Array.from(L().subarray(Number(s2) >>> 0, Number(f2) >>> 0)) : [], pads: b2 ? Array.from(L().subarray(Number(b2) >>> 0, Number(m2) >>> 0)) : [], strides: l2 ? Array.from(L().subarray(Number(l2) >>> 0, Number(c2) >>> 0)) : [] });
      }, 850390: (r3, e4, t4, n2, o2) => {
        a.kb("Gemm", r3, { alpha: e4, beta: t4, transA: n2, transB: o2 });
      }, 850494: (r3) => {
        a.kb("MatMul", r3, void 0);
      }, 850548: (r3, e4, t4, n2) => {
        a.kb("ArgMax", r3, { keepDims: !!e4, selectLastIndex: !!t4, axis: n2 });
      }, 850656: (r3, e4, t4, n2) => {
        a.kb("ArgMin", r3, { keepDims: !!e4, selectLastIndex: !!t4, axis: n2 });
      }, 850764: (r3, e4) => {
        a.kb("Softmax", r3, { axis: e4 });
      }, 850827: (r3, e4) => {
        a.kb("Concat", r3, { axis: e4 });
      }, 850887: (r3, e4, t4, n2, o2) => {
        a.kb("Split", r3, { axis: e4, numOutputs: t4, splitSizes: n2 ? Array.from(L().subarray(Number(n2) >>> 0, Number(o2) >>> 0)) : [] });
      }, 851043: (r3) => {
        a.kb("Expand", r3, void 0);
      }, 851097: (r3, e4) => {
        a.kb("Gather", r3, { axis: Number(e4) });
      }, 851168: (r3, e4) => {
        a.kb("GatherElements", r3, { axis: Number(e4) });
      }, 851247: (r3, e4) => {
        a.kb("GatherND", r3, { batch_dims: Number(e4) });
      }, 851326: (r3, e4, t4, n2, o2, i2, u2, s2, f2, b2, m2) => {
        a.kb("Resize", r3, { antialias: e4, axes: t4 ? Array.from(L().subarray(Number(t4) >>> 0, Number(n2) >>> 0)) : [], coordinateTransformMode: Sr(o2), cubicCoeffA: i2, excludeOutside: u2, extrapolationValue: s2, keepAspectRatioPolicy: Sr(f2), mode: Sr(b2), nearestMode: Sr(m2) });
      }, 851688: (r3, e4, t4, n2, o2, i2, u2) => {
        a.kb("Slice", r3, { starts: e4 ? Array.from(L().subarray(Number(e4) >>> 0, Number(t4) >>> 0)) : [], ends: n2 ? Array.from(L().subarray(Number(n2) >>> 0, Number(o2) >>> 0)) : [], axes: i2 ? Array.from(L().subarray(Number(i2) >>> 0, Number(u2) >>> 0)) : [] });
      }, 851952: (r3) => {
        a.kb("Tile", r3, void 0);
      }, 852004: (r3, e4, t4) => {
        a.kb("InstanceNormalization", r3, { epsilon: e4, format: t4 ? "NHWC" : "NCHW" });
      }, 852118: (r3, e4, t4) => {
        a.kb("InstanceNormalization", r3, { epsilon: e4, format: t4 ? "NHWC" : "NCHW" });
      }, 852232: (r3) => {
        a.kb("Range", r3, void 0);
      }, 852285: (r3, e4) => {
        a.kb("Einsum", r3, { equation: Sr(e4) });
      }, 852366: (r3, e4, t4, n2, o2) => {
        a.kb("Pad", r3, { mode: e4, value: t4, pads: n2 ? Array.from(L().subarray(Number(n2) >>> 0, Number(o2) >>> 0)) : [] });
      }, 852509: (r3, e4, t4, n2, o2, i2) => {
        a.kb("BatchNormalization", r3, { epsilon: e4, momentum: t4, spatial: !!o2, trainingMode: !!n2, format: i2 ? "NHWC" : "NCHW" });
      }, 852678: (r3, e4, t4, n2, o2, i2) => {
        a.kb("BatchNormalization", r3, { epsilon: e4, momentum: t4, spatial: !!o2, trainingMode: !!n2, format: i2 ? "NHWC" : "NCHW" });
      }, 852847: (r3, e4, t4) => {
        a.kb("CumSum", r3, { exclusive: Number(e4), reverse: Number(t4) });
      }, 852944: (r3, e4, t4) => {
        a.kb("DequantizeLinear", r3, { axis: e4, blockSize: t4 });
      }, 853034: (r3, e4, t4, n2, o2) => {
        a.kb("GridSample", r3, { align_corners: e4, mode: Sr(t4), padding_mode: Sr(n2), format: o2 ? "NHWC" : "NCHW" });
      }, 853204: (r3, e4, t4, n2, o2) => {
        a.kb("GridSample", r3, { align_corners: e4, mode: Sr(t4), padding_mode: Sr(n2), format: o2 ? "NHWC" : "NCHW" });
      }, 853374: (r3, e4) => {
        a.kb("ScatterND", r3, { reduction: Sr(e4) });
      }, 853459: (r3, e4, t4, n2, o2, i2, u2, s2, f2) => {
        a.kb("Attention", r3, { numHeads: e4, isUnidirectional: t4, maskFilterValue: n2, scale: o2, doRotary: i2, qkvHiddenSizes: u2 ? Array.from(L().subarray(Number(s2) >>> 0, Number(s2) + u2 >>> 0)) : [], pastPresentShareBuffer: !!f2 });
      }, 853731: (r3) => {
        a.kb("BiasAdd", r3, void 0);
      }, 853786: (r3) => {
        a.kb("BiasSplitGelu", r3, void 0);
      }, 853847: (r3) => {
        a.kb("FastGelu", r3, void 0);
      }, 853903: (r3, e4, t4, n2, o2, i2, u2, s2, f2, b2, m2, l2, c2, d2, p2, y2) => {
        a.kb("Conv", r3, { format: l2 ? "NHWC" : "NCHW", auto_pad: e4, dilations: t4 ? Array.from(L().subarray(Number(t4) >>> 0, Number(n2) >>> 0)) : [], group: o2, kernel_shape: i2 ? Array.from(L().subarray(Number(i2) >>> 0, Number(u2) >>> 0)) : [], pads: s2 ? Array.from(L().subarray(Number(s2) >>> 0, Number(f2) >>> 0)) : [], strides: b2 ? Array.from(L().subarray(Number(b2) >>> 0, Number(m2) >>> 0)) : [], w_is_const: () => !!F()[Number(c2) >>> 0], activation: Sr(d2), activation_params: p2 ? Array.from($().subarray(Number(p2) >>> 0, Number(y2) >>> 0)) : [] });
      }, 854487: (r3) => {
        a.kb("Gelu", r3, void 0);
      }, 854539: (r3, e4, t4, n2, o2, i2, u2, s2, f2) => {
        a.kb("GroupQueryAttention", r3, { numHeads: e4, kvNumHeads: t4, scale: n2, softcap: o2, doRotary: i2, rotaryInterleaved: u2, smoothSoftmax: s2, localWindowSize: f2 });
      }, 854756: (r3, e4, t4, n2) => {
        a.kb("LayerNormalization", r3, { axis: e4, epsilon: t4, simplified: !!n2 });
      }, 854867: (r3, e4, t4, n2) => {
        a.kb("LayerNormalization", r3, { axis: e4, epsilon: t4, simplified: !!n2 });
      }, 854978: (r3, e4, t4, n2, o2, i2) => {
        a.kb("MatMulNBits", r3, { k: e4, n: t4, accuracyLevel: n2, bits: o2, blockSize: i2 });
      }, 855105: (r3, e4, t4, n2, o2, i2) => {
        a.kb("MultiHeadAttention", r3, { numHeads: e4, isUnidirectional: t4, maskFilterValue: n2, scale: o2, doRotary: i2 });
      }, 855264: (r3, e4) => {
        a.kb("QuickGelu", r3, { alpha: e4 });
      }, 855328: (r3, e4, t4, n2, o2) => {
        a.kb("RotaryEmbedding", r3, { interleaved: !!e4, numHeads: t4, rotaryEmbeddingDim: n2, scale: o2 });
      }, 855467: (r3, e4, t4) => {
        a.kb("SkipLayerNormalization", r3, { epsilon: e4, simplified: !!t4 });
      }, 855569: (r3, e4, t4) => {
        a.kb("SkipLayerNormalization", r3, { epsilon: e4, simplified: !!t4 });
      }, 855671: (r3, e4, t4, n2) => {
        a.kb("GatherBlockQuantized", r3, { gatherAxis: e4, quantizeAxis: t4, blockSize: n2 });
      }, 855792: (r3) => {
        a.$b(r3);
      }, 855826: (r3, e4) => a.bc(Number(r3), Number(e4), a.Gb.ec, a.Gb.errors) };
      function tr(r3, e4, t4) {
        return Je(async () => {
          await a.Yb(Number(r3), Number(e4), Number(t4));
        });
      }
      function nr() {
        return "undefined" != typeof wasmOffsetConverter;
      }
      class ar {
        name = "ExitStatus";
        constructor(r3) {
          this.message = `Program terminated with exit(${r3})`, this.status = r3;
        }
      }
      var or = (r3) => {
        r3.terminate(), r3.onmessage = () => {
        };
      }, ir = [], ur = (r3) => {
        0 == cr.length && (Nr(), gr(cr[0]));
        var e4 = cr.pop();
        if (!e4) return 6;
        dr.push(e4), yr[r3.Bb] = e4, e4.Bb = r3.Bb;
        var t4 = { Cb: "run", hc: r3.fc, Ib: r3.Ib, Bb: r3.Bb };
        return e4.postMessage(t4, r3.Nb), 0;
      }, sr = 0, fr = (r3, e4, ...t4) => {
        for (var n2 = 2 * t4.length, a2 = On(), o2 = _n(8 * n2), i2 = o2 >>> 3, u2 = 0; u2 < t4.length; u2++) {
          var s2 = t4[u2];
          "bigint" == typeof s2 ? (x[i2 + 2 * u2] = 1n, x[i2 + 2 * u2 + 1] = s2) : (x[i2 + 2 * u2] = 0n, j()[i2 + 2 * u2 + 1 >>> 0] = s2);
        }
        return r3 = vn(r3, 0, n2, o2, e4), Cn(a2), r3;
      };
      function br(r3) {
        if (s) return fr(0, 1, r3);
        if (A = r3, !(0 < sr)) {
          for (var e4 of dr) or(e4);
          for (e4 of cr) or(e4);
          cr = [], dr = [], yr = {}, D = true;
        }
        p(0, new ar(r3));
      }
      function mr(r3) {
        if (s) return fr(1, 0, r3);
        lr(r3);
      }
      var lr = (r3) => {
        if (A = r3, s) throw mr(r3), "unwind";
        br(r3);
      }, cr = [], dr = [], pr = [], yr = {}, hr = (r3) => {
        var e4 = r3.Bb;
        delete yr[e4], cr.push(r3), dr.splice(dr.indexOf(r3), 1), r3.Bb = 0, gn(e4);
      };
      function vr() {
        pr.forEach((r3) => r3());
      }
      var gr = (r3) => new Promise((e4) => {
        r3.onmessage = (t5) => {
          var n3 = (t5 = t5.data).Cb;
          if (t5.Hb && t5.Hb != cn()) {
            var o2 = yr[t5.Hb];
            o2 ? o2.postMessage(t5, t5.Nb) : N(`Internal error! Worker sent a message "${n3}" to target pthread ${t5.Hb}, but that thread no longer exists!`);
          } else "checkMailbox" === n3 ? We() : "spawnThread" === n3 ? ur(t5) : "cleanupThread" === n3 ? hr(yr[t5.ic]) : "loaded" === n3 ? (r3.loaded = true, e4(r3)) : "alert" === n3 ? alert(`Thread ${t5.jc}: ${t5.text}`) : "setimmediate" === t5.target ? r3.postMessage(t5) : "callHandler" === n3 ? a[t5.Rb](...t5.args) : n3 && N(`worker sent an unknown command ${n3}`);
        }, r3.onerror = (r4) => {
          throw N(`worker sent an error! ${r4.filename}:${r4.lineno}: ${r4.message}`), r4;
        };
        var t4, n2 = [];
        for (t4 of []) a.propertyIsEnumerable(t4) && n2.push(t4);
        r3.postMessage({ Cb: "load", Sb: n2, lc: k, mc: w });
      });
      function Nr() {
        var r3 = new Worker((() => {
          const r4 = URL;
          return import.meta.url > "file:" && import.meta.url < "file;" ? new r4("ort.wasm.bundle.mjs", import.meta.url) : new URL(import.meta.url);
        })(), { type: "module", workerData: "em-pthread", name: "em-pthread" });
        cr.push(r3);
      }
      var kr = (r3) => {
        q();
        var e4 = U()[r3 + 52 >>> 2 >>> 0];
        r3 = U()[r3 + 56 >>> 2 >>> 0], An(e4, e4 - r3), Cn(e4);
      }, wr = (r3, e4) => {
        sr = 0, r3 = Tn(r3, e4), 0 < sr ? A = r3 : Nn(r3);
      };
      class Ar {
        constructor(r3) {
          this.Jb = r3 - 24;
        }
      }
      function Cr(r3, e4, t4) {
        var n2 = new Ar(r3 >>>= 0);
        throw e4 >>>= 0, t4 >>>= 0, U()[n2.Jb + 16 >>> 2 >>> 0] = 0, U()[n2.Jb + 4 >>> 2 >>> 0] = e4, U()[n2.Jb + 8 >>> 2 >>> 0] = t4, r3;
      }
      function _r(r3, e4, t4, n2) {
        return s ? fr(2, 1, r3, e4, t4, n2) : Or(r3, e4, t4, n2);
      }
      function Or(r3, e4, t4, n2) {
        if (r3 >>>= 0, t4 >>>= 0, n2 >>>= 0, void 0 === f) return 6;
        var a2 = [];
        return s && 0 === a2.length ? _r(r3, e4 >>>= 0, t4, n2) : (r3 = { fc: t4, Bb: r3, Ib: n2, Nb: a2 }, s ? (r3.Cb = "spawnThread", postMessage(r3, a2), 0) : ur(r3));
      }
      var Tr = "undefined" != typeof TextDecoder ? new TextDecoder() : void 0, Wr = (r3, e4 = 0, t4 = NaN) => {
        var n2 = (e4 >>>= 0) + t4;
        for (t4 = e4; r3[t4] && !(t4 >= n2); ) ++t4;
        if (16 < t4 - e4 && r3.buffer && Tr) return Tr.decode(r3.buffer instanceof ArrayBuffer ? r3.subarray(e4, t4) : r3.slice(e4, t4));
        for (n2 = ""; e4 < t4; ) {
          var a2 = r3[e4++];
          if (128 & a2) {
            var o2 = 63 & r3[e4++];
            if (192 == (224 & a2)) n2 += String.fromCharCode((31 & a2) << 6 | o2);
            else {
              var i2 = 63 & r3[e4++];
              65536 > (a2 = 224 == (240 & a2) ? (15 & a2) << 12 | o2 << 6 | i2 : (7 & a2) << 18 | o2 << 12 | i2 << 6 | 63 & r3[e4++]) ? n2 += String.fromCharCode(a2) : (a2 -= 65536, n2 += String.fromCharCode(55296 | a2 >> 10, 56320 | 1023 & a2));
            }
          } else n2 += String.fromCharCode(a2);
        }
        return n2;
      }, Sr = (r3, e4) => (r3 >>>= 0) ? Wr(B(), r3, e4) : "";
      function Er(r3, e4, t4) {
        return s ? fr(3, 1, r3, e4, t4) : 0;
      }
      function xr(r3, e4) {
        if (s) return fr(4, 1, r3, e4);
      }
      var Rr = (r3) => {
        for (var e4 = 0, t4 = 0; t4 < r3.length; ++t4) {
          var n2 = r3.charCodeAt(t4);
          127 >= n2 ? e4++ : 2047 >= n2 ? e4 += 2 : 55296 <= n2 && 57343 >= n2 ? (e4 += 4, ++t4) : e4 += 3;
        }
        return e4;
      }, Mr = (r3, e4, t4) => {
        var n2 = B();
        if (e4 >>>= 0, 0 < t4) {
          var a2 = e4;
          t4 = e4 + t4 - 1;
          for (var o2 = 0; o2 < r3.length; ++o2) {
            var i2 = r3.charCodeAt(o2);
            if (55296 <= i2 && 57343 >= i2 && (i2 = 65536 + ((1023 & i2) << 10) | 1023 & r3.charCodeAt(++o2)), 127 >= i2) {
              if (e4 >= t4) break;
              n2[e4++ >>> 0] = i2;
            } else {
              if (2047 >= i2) {
                if (e4 + 1 >= t4) break;
                n2[e4++ >>> 0] = 192 | i2 >> 6;
              } else {
                if (65535 >= i2) {
                  if (e4 + 2 >= t4) break;
                  n2[e4++ >>> 0] = 224 | i2 >> 12;
                } else {
                  if (e4 + 3 >= t4) break;
                  n2[e4++ >>> 0] = 240 | i2 >> 18, n2[e4++ >>> 0] = 128 | i2 >> 12 & 63;
                }
                n2[e4++ >>> 0] = 128 | i2 >> 6 & 63;
              }
              n2[e4++ >>> 0] = 128 | 63 & i2;
            }
          }
          n2[e4 >>> 0] = 0, r3 = e4 - a2;
        } else r3 = 0;
        return r3;
      };
      function Hr(r3, e4) {
        if (s) return fr(5, 1, r3, e4);
      }
      function Dr(r3, e4, t4) {
        if (s) return fr(6, 1, r3, e4, t4);
      }
      function Pr(r3, e4, t4) {
        return s ? fr(7, 1, r3, e4, t4) : 0;
      }
      function Fr(r3, e4) {
        if (s) return fr(8, 1, r3, e4);
      }
      function Br(r3, e4, t4) {
        if (s) return fr(9, 1, r3, e4, t4);
      }
      function Ir(r3, e4, t4, n2) {
        if (s) return fr(10, 1, r3, e4, t4, n2);
      }
      function Gr(r3, e4, t4, n2) {
        if (s) return fr(11, 1, r3, e4, t4, n2);
      }
      function Lr(r3, e4, t4, n2) {
        if (s) return fr(12, 1, r3, e4, t4, n2);
      }
      function Ur(r3) {
        if (s) return fr(13, 1, r3);
      }
      function $r(r3, e4) {
        if (s) return fr(14, 1, r3, e4);
      }
      function jr(r3, e4, t4) {
        if (s) return fr(15, 1, r3, e4, t4);
      }
      var zr, Vr, qr = () => Z(""), Yr = (r3) => {
        for (var e4 = ""; B()[r3 >>> 0]; ) e4 += zr[B()[r3++ >>> 0]];
        return e4;
      }, Jr = {}, Qr = {}, Xr = {};
      function Kr(r3, e4, t4 = {}) {
        return function(r4, e5, t5 = {}) {
          var n2 = e5.name;
          if (!r4) throw new Vr(`type "${n2}" must have a positive integer typeid pointer`);
          if (Qr.hasOwnProperty(r4)) {
            if (t5.Tb) return;
            throw new Vr(`Cannot register type '${n2}' twice`);
          }
          Qr[r4] = e5, delete Xr[r4], Jr.hasOwnProperty(r4) && (e5 = Jr[r4], delete Jr[r4], e5.forEach((r5) => r5()));
        }(r3, e4, t4);
      }
      var Zr = (r3, e4, t4) => {
        switch (e4) {
          case 1:
            return t4 ? (r4) => F()[r4 >>> 0] : (r4) => B()[r4 >>> 0];
          case 2:
            return t4 ? (r4) => I()[r4 >>> 1 >>> 0] : (r4) => G()[r4 >>> 1 >>> 0];
          case 4:
            return t4 ? (r4) => L()[r4 >>> 2 >>> 0] : (r4) => U()[r4 >>> 2 >>> 0];
          case 8:
            return t4 ? (r4) => x[r4 >>> 3] : (r4) => R[r4 >>> 3];
          default:
            throw new TypeError(`invalid integer width (${e4}): ${r3}`);
        }
      };
      function re(r3, e4, t4) {
        t4 >>>= 0, Kr(r3 >>>= 0, { name: e4 = Yr(e4 >>> 0), fromWireType: (r4) => r4, toWireType: function(r4, e5) {
          if ("bigint" != typeof e5 && "number" != typeof e5) throw e5 = null === e5 ? "null" : "object" == (r4 = typeof e5) || "array" === r4 || "function" === r4 ? e5.toString() : "" + e5, new TypeError(`Cannot convert "${e5}" to ${this.name}`);
          return "number" == typeof e5 && (e5 = BigInt(e5)), e5;
        }, Db: ee, readValueFromPointer: Zr(e4, t4, -1 == e4.indexOf("u")), Eb: null });
      }
      var ee = 8;
      function te(r3, e4, t4, n2) {
        Kr(r3 >>>= 0, { name: e4 = Yr(e4 >>> 0), fromWireType: function(r4) {
          return !!r4;
        }, toWireType: function(r4, e5) {
          return e5 ? t4 : n2;
        }, Db: ee, readValueFromPointer: function(r4) {
          return this.fromWireType(B()[r4 >>> 0]);
        }, Eb: null });
      }
      var ne = [], ae = [];
      function oe(r3) {
        9 < (r3 >>>= 0) && 0 == --ae[r3 + 1] && (ae[r3] = void 0, ne.push(r3));
      }
      var ie = (r3) => {
        if (!r3) throw new Vr("Cannot use deleted val. handle = " + r3);
        return ae[r3];
      }, ue = (r3) => {
        switch (r3) {
          case void 0:
            return 2;
          case null:
            return 4;
          case true:
            return 6;
          case false:
            return 8;
          default:
            const e4 = ne.pop() || ae.length;
            return ae[e4] = r3, ae[e4 + 1] = 1, e4;
        }
      };
      function se(r3) {
        return this.fromWireType(U()[r3 >>> 2 >>> 0]);
      }
      var fe = { name: "emscripten::val", fromWireType: (r3) => {
        var e4 = ie(r3);
        return oe(r3), e4;
      }, toWireType: (r3, e4) => ue(e4), Db: ee, readValueFromPointer: se, Eb: null };
      function be(r3) {
        return Kr(r3 >>> 0, fe);
      }
      var me = (r3, e4) => {
        switch (e4) {
          case 4:
            return function(r4) {
              return this.fromWireType($()[r4 >>> 2 >>> 0]);
            };
          case 8:
            return function(r4) {
              return this.fromWireType(j()[r4 >>> 3 >>> 0]);
            };
          default:
            throw new TypeError(`invalid float width (${e4}): ${r3}`);
        }
      };
      function le(r3, e4, t4) {
        t4 >>>= 0, Kr(r3 >>>= 0, { name: e4 = Yr(e4 >>> 0), fromWireType: (r4) => r4, toWireType: (r4, e5) => e5, Db: ee, readValueFromPointer: me(e4, t4), Eb: null });
      }
      function ce(r3, e4, t4, n2, a2) {
        if (r3 >>>= 0, t4 >>>= 0, e4 = Yr(e4 >>> 0), -1 === a2 && (a2 = 4294967295), a2 = (r4) => r4, 0 === n2) {
          var o2 = 32 - 8 * t4;
          a2 = (r4) => r4 << o2 >>> o2;
        }
        var i2 = e4.includes("unsigned") ? function(r4, e5) {
          return e5 >>> 0;
        } : function(r4, e5) {
          return e5;
        };
        Kr(r3, { name: e4, fromWireType: a2, toWireType: i2, Db: ee, readValueFromPointer: Zr(e4, t4, 0 !== n2), Eb: null });
      }
      function de(r3, e4, t4) {
        function n2(r4) {
          var e5 = U()[r4 >>> 2 >>> 0];
          return r4 = U()[r4 + 4 >>> 2 >>> 0], new a2(F().buffer, r4, e5);
        }
        var a2 = [Int8Array, Uint8Array, Int16Array, Uint16Array, Int32Array, Uint32Array, Float32Array, Float64Array, BigInt64Array, BigUint64Array][e4];
        Kr(r3 >>>= 0, { name: t4 = Yr(t4 >>> 0), fromWireType: n2, Db: ee, readValueFromPointer: n2 }, { Tb: true });
      }
      function pe(r3, e4) {
        Kr(r3 >>>= 0, { name: e4 = Yr(e4 >>> 0), fromWireType: function(r4) {
          for (var e5, t4 = U()[r4 >>> 2 >>> 0], n2 = r4 + 4, a2 = n2, o2 = 0; o2 <= t4; ++o2) {
            var i2 = n2 + o2;
            o2 != t4 && 0 != B()[i2 >>> 0] || (a2 = Sr(a2, i2 - a2), void 0 === e5 ? e5 = a2 : (e5 += String.fromCharCode(0), e5 += a2), a2 = i2 + 1);
          }
          return dn(r4), e5;
        }, toWireType: function(r4, e5) {
          e5 instanceof ArrayBuffer && (e5 = new Uint8Array(e5));
          var t4 = "string" == typeof e5;
          if (!(t4 || e5 instanceof Uint8Array || e5 instanceof Uint8ClampedArray || e5 instanceof Int8Array)) throw new Vr("Cannot pass non-string to std::string");
          var n2 = t4 ? Rr(e5) : e5.length, a2 = pn(4 + n2 + 1), o2 = a2 + 4;
          if (U()[a2 >>> 2 >>> 0] = n2, t4) Mr(e5, o2, n2 + 1);
          else if (t4) for (t4 = 0; t4 < n2; ++t4) {
            var i2 = e5.charCodeAt(t4);
            if (255 < i2) throw dn(a2), new Vr("String has UTF-16 code units that do not fit in 8 bits");
            B()[o2 + t4 >>> 0] = i2;
          }
          else for (t4 = 0; t4 < n2; ++t4) B()[o2 + t4 >>> 0] = e5[t4];
          return null !== r4 && r4.push(dn, a2), a2;
        }, Db: ee, readValueFromPointer: se, Eb(r4) {
          dn(r4);
        } });
      }
      var ye = "undefined" != typeof TextDecoder ? new TextDecoder("utf-16le") : void 0, he = (r3, e4) => {
        for (var t4 = r3 >> 1, n2 = t4 + e4 / 2; !(t4 >= n2) && G()[t4 >>> 0]; ) ++t4;
        if (32 < (t4 <<= 1) - r3 && ye) return ye.decode(B().slice(r3, t4));
        for (t4 = "", n2 = 0; !(n2 >= e4 / 2); ++n2) {
          var a2 = I()[r3 + 2 * n2 >>> 1 >>> 0];
          if (0 == a2) break;
          t4 += String.fromCharCode(a2);
        }
        return t4;
      }, ve = (r3, e4, t4) => {
        if (t4 ??= 2147483647, 2 > t4) return 0;
        var n2 = e4;
        t4 = (t4 -= 2) < 2 * r3.length ? t4 / 2 : r3.length;
        for (var a2 = 0; a2 < t4; ++a2) {
          var o2 = r3.charCodeAt(a2);
          I()[e4 >>> 1 >>> 0] = o2, e4 += 2;
        }
        return I()[e4 >>> 1 >>> 0] = 0, e4 - n2;
      }, ge = (r3) => 2 * r3.length, Ne = (r3, e4) => {
        for (var t4 = 0, n2 = ""; !(t4 >= e4 / 4); ) {
          var a2 = L()[r3 + 4 * t4 >>> 2 >>> 0];
          if (0 == a2) break;
          ++t4, 65536 <= a2 ? (a2 -= 65536, n2 += String.fromCharCode(55296 | a2 >> 10, 56320 | 1023 & a2)) : n2 += String.fromCharCode(a2);
        }
        return n2;
      }, ke = (r3, e4, t4) => {
        if (e4 >>>= 0, t4 ??= 2147483647, 4 > t4) return 0;
        var n2 = e4;
        t4 = n2 + t4 - 4;
        for (var a2 = 0; a2 < r3.length; ++a2) {
          var o2 = r3.charCodeAt(a2);
          if (55296 <= o2 && 57343 >= o2 && (o2 = 65536 + ((1023 & o2) << 10) | 1023 & r3.charCodeAt(++a2)), L()[e4 >>> 2 >>> 0] = o2, (e4 += 4) + 4 > t4) break;
        }
        return L()[e4 >>> 2 >>> 0] = 0, e4 - n2;
      }, we = (r3) => {
        for (var e4 = 0, t4 = 0; t4 < r3.length; ++t4) {
          var n2 = r3.charCodeAt(t4);
          55296 <= n2 && 57343 >= n2 && ++t4, e4 += 4;
        }
        return e4;
      };
      function Ae(r3, e4, t4) {
        if (r3 >>>= 0, e4 >>>= 0, t4 = Yr(t4 >>>= 0), 2 === e4) var n2 = he, a2 = ve, o2 = ge, i2 = (r4) => G()[r4 >>> 1 >>> 0];
        else 4 === e4 && (n2 = Ne, a2 = ke, o2 = we, i2 = (r4) => U()[r4 >>> 2 >>> 0]);
        Kr(r3, { name: t4, fromWireType: (r4) => {
          for (var t5, a3 = U()[r4 >>> 2 >>> 0], o3 = r4 + 4, u2 = 0; u2 <= a3; ++u2) {
            var s2 = r4 + 4 + u2 * e4;
            u2 != a3 && 0 != i2(s2) || (o3 = n2(o3, s2 - o3), void 0 === t5 ? t5 = o3 : (t5 += String.fromCharCode(0), t5 += o3), o3 = s2 + e4);
          }
          return dn(r4), t5;
        }, toWireType: (r4, n3) => {
          if ("string" != typeof n3) throw new Vr(`Cannot pass non-string to C++ string type ${t4}`);
          var i3 = o2(n3), u2 = pn(4 + i3 + e4);
          return U()[u2 >>> 2 >>> 0] = i3 / e4, a2(n3, u2 + 4, i3 + e4), null !== r4 && r4.push(dn, u2), u2;
        }, Db: ee, readValueFromPointer: se, Eb(r4) {
          dn(r4);
        } });
      }
      function Ce(r3, e4) {
        Kr(r3 >>>= 0, { Ub: true, name: e4 = Yr(e4 >>> 0), Db: 0, fromWireType: () => {
        }, toWireType: () => {
        } });
      }
      function _e(r3) {
        yn(r3 >>> 0, !u, 1, !i, 131072, false), vr();
      }
      var Oe = (r3) => {
        if (!D) try {
          if (r3(), !(0 < sr)) try {
            s ? Nn(A) : lr(A);
          } catch (r4) {
            r4 instanceof ar || "unwind" == r4 || p(0, r4);
          }
        } catch (r4) {
          r4 instanceof ar || "unwind" == r4 || p(0, r4);
        }
      };
      function Te(r3) {
        r3 >>>= 0, "function" == typeof Atomics.kc && (Atomics.kc(L(), r3 >>> 2, r3).value.then(We), r3 += 128, Atomics.store(L(), r3 >>> 2, 1));
      }
      var We = () => {
        var r3 = cn();
        r3 && (Te(r3), Oe(wn));
      };
      function Se(r3, e4) {
        (r3 >>>= 0) == e4 >>> 0 ? setTimeout(We) : s ? postMessage({ Hb: r3, Cb: "checkMailbox" }) : (r3 = yr[r3]) && r3.postMessage({ Cb: "checkMailbox" });
      }
      var Ee = [];
      function xe(r3, e4, t4, n2, a2) {
        for (e4 >>>= 0, n2 /= 2, Ee.length = n2, t4 = a2 >>> 0 >>> 3, a2 = 0; a2 < n2; a2++) Ee[a2] = x[t4 + 2 * a2] ? x[t4 + 2 * a2 + 1] : j()[t4 + 2 * a2 + 1 >>> 0];
        return (e4 ? er[e4] : bn[r3])(...Ee);
      }
      var Re = () => {
        sr = 0;
      };
      function Me(r3) {
        r3 >>>= 0, s ? postMessage({ Cb: "cleanupThread", ic: r3 }) : hr(yr[r3]);
      }
      function He(r3) {
      }
      var De = (r3, e4) => {
        var t4 = Qr[r3];
        if (void 0 === t4) throw r3 = mn(r3), t4 = Yr(r3), dn(r3), new Vr(`${e4} has unknown type ${t4}`);
        return t4;
      }, Pe = (r3, e4, t4) => {
        var n2 = [];
        return r3 = r3.toWireType(n2, t4), n2.length && (U()[e4 >>> 2 >>> 0] = ue(n2)), r3;
      };
      function Fe(r3, e4, t4) {
        return e4 >>>= 0, t4 >>>= 0, r3 = ie(r3 >>> 0), e4 = De(e4, "emval::as"), Pe(e4, t4, r3);
      }
      function Be(r3, e4) {
        return e4 >>>= 0, r3 = ie(r3 >>> 0), (e4 = De(e4, "emval::as")).toWireType(null, r3);
      }
      var Ie = (r3) => {
        try {
          r3();
        } catch (r4) {
          Z(r4);
        }
      }, Ge = 0, Le = null, Ue = 0, $e = [], je = {}, ze = {}, Ve = 0, qe = null, Ye = [];
      function Je(r3) {
        return function(r4) {
          if (!D) {
            if (0 === Ge) {
              var e4 = false, t4 = false;
              r4((r5 = 0) => {
                if (!D && (Ue = r5, e4 = true, t4)) {
                  Ge = 2, Ie(() => En(Le)), "undefined" != typeof MainLoop && MainLoop.Qb && MainLoop.resume(), r5 = false;
                  try {
                    var n2 = function() {
                      var r6 = L()[Le + 8 >>> 2 >>> 0];
                      return r6 = fn[ze[r6]], --sr, r6();
                    }();
                  } catch (e5) {
                    n2 = e5, r5 = true;
                  }
                  var a2 = false;
                  if (!Le) {
                    var o2 = qe;
                    o2 && (qe = null, (r5 ? o2.reject : o2.resolve)(n2), a2 = true);
                  }
                  if (r5 && !a2) throw n2;
                }
              }), t4 = true, e4 || (Ge = 1, Le = function() {
                var r5 = pn(65548), e5 = r5 + 12;
                U()[r5 >>> 2 >>> 0] = e5, U()[r5 + 4 >>> 2 >>> 0] = e5 + 65536, e5 = $e[0];
                var t5 = je[e5];
                return void 0 === t5 && (t5 = Ve++, je[e5] = t5, ze[t5] = e5), e5 = t5, L()[r5 + 8 >>> 2 >>> 0] = e5, r5;
              }(), "undefined" != typeof MainLoop && MainLoop.Qb && MainLoop.pause(), Ie(() => Wn(Le)));
            } else 2 === Ge ? (Ge = 0, Ie(xn), dn(Le), Le = null, Ye.forEach(Oe)) : Z(`invalid state: ${Ge}`);
            return Ue;
          }
        }((e4) => {
          r3().then(e4);
        });
      }
      function Qe(r3) {
        return r3 >>>= 0, Je(async () => {
          var e4 = await ie(r3);
          return ue(e4);
        });
      }
      var Xe = [];
      function Ke(r3, e4, t4, n2) {
        return t4 >>>= 0, n2 >>>= 0, (r3 = Xe[r3 >>> 0])(null, e4 = ie(e4 >>> 0), t4, n2);
      }
      var Ze = {}, rt = (r3) => {
        var e4 = Ze[r3];
        return void 0 === e4 ? Yr(r3) : e4;
      };
      function et(r3, e4, t4, n2, a2) {
        return t4 >>>= 0, n2 >>>= 0, a2 >>>= 0, (r3 = Xe[r3 >>> 0])(e4 = ie(e4 >>> 0), e4[t4 = rt(t4)], n2, a2);
      }
      function tt(r3, e4) {
        return e4 >>>= 0, (r3 = ie(r3 >>> 0)) == ie(e4);
      }
      var nt = () => "object" == typeof globalThis ? globalThis : Function("return this")();
      function at(r3) {
        return 0 == (r3 >>>= 0) ? ue(nt()) : (r3 = rt(r3), ue(nt()[r3]));
      }
      var ot = (r3) => {
        var e4 = Xe.length;
        return Xe.push(r3), e4;
      }, it = (r3, e4) => {
        for (var t4 = Array(r3), n2 = 0; n2 < r3; ++n2) t4[n2] = De(U()[e4 + 4 * n2 >>> 2 >>> 0], "parameter " + n2);
        return t4;
      }, ut = (r3, e4) => Object.defineProperty(e4, "name", { value: r3 });
      function st(r3, e4, t4) {
        var n2 = (e4 = it(r3, e4 >>> 0)).shift();
        r3--;
        var a2 = "return function (obj, func, destructorsRef, args) {\n", o2 = 0, i2 = [];
        0 === t4 && i2.push("obj");
        for (var u2 = ["retType"], s2 = [n2], f2 = 0; f2 < r3; ++f2) i2.push("arg" + f2), u2.push("argType" + f2), s2.push(e4[f2]), a2 += `  var arg${f2} = argType${f2}.readValueFromPointer(args${o2 ? "+" + o2 : ""});
`, o2 += e4[f2].Db;
        return a2 += `  var rv = ${1 === t4 ? "new func" : "func.call"}(${i2.join(", ")});
`, n2.Ub || (u2.push("emval_returnValue"), s2.push(Pe), a2 += "  return emval_returnValue(retType, destructorsRef, rv);\n"), u2.push(a2 + "};\n"), r3 = function(r4) {
          var e5 = Function;
          if (!(e5 instanceof Function)) throw new TypeError(`new_ called with constructor type ${typeof e5} which is not a function`);
          var t5 = ut(e5.name || "unknownFunctionName", function() {
          });
          return t5.prototype = e5.prototype, t5 = new t5(), (r4 = e5.apply(t5, r4)) instanceof Object ? r4 : t5;
        }(u2)(...s2), t4 = `methodCaller<(${e4.map((r4) => r4.name).join(", ")}) => ${n2.name}>`, ot(ut(t4, r3));
      }
      function ft(r3) {
        return r3 = rt(r3 >>> 0), ue(a[r3]);
      }
      function bt(r3, e4) {
        return e4 >>>= 0, r3 = ie(r3 >>> 0), e4 = ie(e4), ue(r3[e4]);
      }
      function mt(r3) {
        9 < (r3 >>>= 0) && (ae[r3 + 1] += 1);
      }
      function lt() {
        return ue([]);
      }
      function ct(r3) {
        r3 = ie(r3 >>> 0);
        for (var e4 = Array(r3.length), t4 = 0; t4 < r3.length; t4++) e4[t4] = r3[t4];
        return ue(e4);
      }
      function dt(r3) {
        return ue(rt(r3 >>> 0));
      }
      function pt() {
        return ue({});
      }
      function yt(r3) {
        for (var e4 = ie(r3 >>>= 0); e4.length; ) {
          var t4 = e4.pop();
          e4.pop()(t4);
        }
        oe(r3);
      }
      function ht(r3, e4, t4) {
        e4 >>>= 0, t4 >>>= 0, r3 = ie(r3 >>> 0), e4 = ie(e4), t4 = ie(t4), r3[e4] = t4;
      }
      function vt(r3, e4) {
        return e4 >>>= 0, r3 = (r3 = De(r3 >>> 0, "_emval_take_value")).readValueFromPointer(e4), ue(r3);
      }
      function gt(r3, e4) {
        r3 = -9007199254740992 > r3 || 9007199254740992 < r3 ? NaN : Number(r3), e4 >>>= 0, r3 = new Date(1e3 * r3), L()[e4 >>> 2 >>> 0] = r3.getUTCSeconds(), L()[e4 + 4 >>> 2 >>> 0] = r3.getUTCMinutes(), L()[e4 + 8 >>> 2 >>> 0] = r3.getUTCHours(), L()[e4 + 12 >>> 2 >>> 0] = r3.getUTCDate(), L()[e4 + 16 >>> 2 >>> 0] = r3.getUTCMonth(), L()[e4 + 20 >>> 2 >>> 0] = r3.getUTCFullYear() - 1900, L()[e4 + 24 >>> 2 >>> 0] = r3.getUTCDay(), r3 = (r3.getTime() - Date.UTC(r3.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0, L()[e4 + 28 >>> 2 >>> 0] = r3;
      }
      var Nt = (r3) => 0 == r3 % 4 && (0 != r3 % 100 || 0 == r3 % 400), kt = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], wt = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
      function At(r3, e4) {
        r3 = -9007199254740992 > r3 || 9007199254740992 < r3 ? NaN : Number(r3), e4 >>>= 0, r3 = new Date(1e3 * r3), L()[e4 >>> 2 >>> 0] = r3.getSeconds(), L()[e4 + 4 >>> 2 >>> 0] = r3.getMinutes(), L()[e4 + 8 >>> 2 >>> 0] = r3.getHours(), L()[e4 + 12 >>> 2 >>> 0] = r3.getDate(), L()[e4 + 16 >>> 2 >>> 0] = r3.getMonth(), L()[e4 + 20 >>> 2 >>> 0] = r3.getFullYear() - 1900, L()[e4 + 24 >>> 2 >>> 0] = r3.getDay();
        var t4 = (Nt(r3.getFullYear()) ? kt : wt)[r3.getMonth()] + r3.getDate() - 1 | 0;
        L()[e4 + 28 >>> 2 >>> 0] = t4, L()[e4 + 36 >>> 2 >>> 0] = -60 * r3.getTimezoneOffset(), t4 = new Date(r3.getFullYear(), 6, 1).getTimezoneOffset();
        var n2 = new Date(r3.getFullYear(), 0, 1).getTimezoneOffset();
        r3 = 0 | (t4 != n2 && r3.getTimezoneOffset() == Math.min(n2, t4)), L()[e4 + 32 >>> 2 >>> 0] = r3;
      }
      function Ct(r3) {
        r3 >>>= 0;
        var e4 = new Date(L()[r3 + 20 >>> 2 >>> 0] + 1900, L()[r3 + 16 >>> 2 >>> 0], L()[r3 + 12 >>> 2 >>> 0], L()[r3 + 8 >>> 2 >>> 0], L()[r3 + 4 >>> 2 >>> 0], L()[r3 >>> 2 >>> 0], 0), t4 = L()[r3 + 32 >>> 2 >>> 0], n2 = e4.getTimezoneOffset(), a2 = new Date(e4.getFullYear(), 6, 1).getTimezoneOffset(), o2 = new Date(e4.getFullYear(), 0, 1).getTimezoneOffset(), i2 = Math.min(o2, a2);
        return 0 > t4 ? L()[r3 + 32 >>> 2 >>> 0] = Number(a2 != o2 && i2 == n2) : 0 < t4 != (i2 == n2) && (a2 = Math.max(o2, a2), e4.setTime(e4.getTime() + 6e4 * ((0 < t4 ? i2 : a2) - n2))), L()[r3 + 24 >>> 2 >>> 0] = e4.getDay(), t4 = (Nt(e4.getFullYear()) ? kt : wt)[e4.getMonth()] + e4.getDate() - 1 | 0, L()[r3 + 28 >>> 2 >>> 0] = t4, L()[r3 >>> 2 >>> 0] = e4.getSeconds(), L()[r3 + 4 >>> 2 >>> 0] = e4.getMinutes(), L()[r3 + 8 >>> 2 >>> 0] = e4.getHours(), L()[r3 + 12 >>> 2 >>> 0] = e4.getDate(), L()[r3 + 16 >>> 2 >>> 0] = e4.getMonth(), L()[r3 + 20 >>> 2 >>> 0] = e4.getYear(), r3 = e4.getTime(), BigInt(isNaN(r3) ? -1 : r3 / 1e3);
      }
      function _t(r3, e4, t4, n2, a2, o2, i2) {
        return s ? fr(16, 1, r3, e4, t4, n2, a2, o2, i2) : -52;
      }
      function Ot(r3, e4, t4, n2, a2, o2) {
        if (s) return fr(17, 1, r3, e4, t4, n2, a2, o2);
      }
      var Tt = {}, Wt = () => performance.timeOrigin + performance.now();
      function St(r3, e4) {
        if (s) return fr(18, 1, r3, e4);
        if (Tt[r3] && (clearTimeout(Tt[r3].id), delete Tt[r3]), !e4) return 0;
        var t4 = setTimeout(() => {
          delete Tt[r3], Oe(() => kn(r3, performance.timeOrigin + performance.now()));
        }, e4);
        return Tt[r3] = { id: t4, rc: e4 }, 0;
      }
      function Et(r3, e4, t4, n2) {
        r3 >>>= 0, e4 >>>= 0, t4 >>>= 0, n2 >>>= 0;
        var a2 = (/* @__PURE__ */ new Date()).getFullYear(), o2 = new Date(a2, 0, 1).getTimezoneOffset();
        a2 = new Date(a2, 6, 1).getTimezoneOffset();
        var i2 = Math.max(o2, a2);
        U()[r3 >>> 2 >>> 0] = 60 * i2, L()[e4 >>> 2 >>> 0] = Number(o2 != a2), r3 = (e4 = (r4) => {
          var e5 = Math.abs(r4);
          return `UTC${0 <= r4 ? "-" : "+"}${String(Math.floor(e5 / 60)).padStart(2, "0")}${String(e5 % 60).padStart(2, "0")}`;
        })(o2), e4 = e4(a2), a2 < o2 ? (Mr(r3, t4, 17), Mr(e4, n2, 17)) : (Mr(r3, n2, 17), Mr(e4, t4, 17));
      }
      var xt = () => Date.now(), Rt = 1;
      function Mt(r3, e4, t4) {
        if (!(0 <= r3 && 3 >= r3)) return 28;
        if (0 === r3) r3 = Date.now();
        else {
          if (!Rt) return 52;
          r3 = performance.timeOrigin + performance.now();
        }
        return x[t4 >>> 0 >>> 3] = BigInt(Math.round(1e6 * r3)), 0;
      }
      var Ht = [], Dt = (r3, e4) => {
        Ht.length = 0;
        for (var t4; t4 = B()[r3++ >>> 0]; ) {
          var n2 = 105 != t4;
          e4 += (n2 &= 112 != t4) && e4 % 8 ? 4 : 0, Ht.push(112 == t4 ? U()[e4 >>> 2 >>> 0] : 106 == t4 ? x[e4 >>> 3] : 105 == t4 ? L()[e4 >>> 2 >>> 0] : j()[e4 >>> 3 >>> 0]), e4 += n2 ? 8 : 4;
        }
        return Ht;
      };
      function Pt(r3, e4, t4) {
        return r3 >>>= 0, e4 = Dt(e4 >>> 0, t4 >>> 0), er[r3](...e4);
      }
      function Ft(r3, e4, t4) {
        return r3 >>>= 0, e4 = Dt(e4 >>> 0, t4 >>> 0), er[r3](...e4);
      }
      var Bt = () => {
      };
      function It(r3, e4) {
        return N(Sr(r3 >>> 0, e4 >>> 0));
      }
      var Gt = () => {
        throw sr += 1, "unwind";
      };
      function Lt() {
        return 4294901760;
      }
      var Ut = () => navigator.hardwareConcurrency;
      function $t() {
        return Z("Cannot use emscripten_pc_get_function without -sUSE_OFFSET_CONVERTER"), 0;
      }
      function jt(r3) {
        r3 >>>= 0;
        var e4 = B().length;
        if (r3 <= e4 || 4294901760 < r3) return false;
        for (var t4 = 1; 4 >= t4; t4 *= 2) {
          var n2 = e4 * (1 + 0.2 / t4);
          n2 = Math.min(n2, r3 + 100663296);
          r: {
            n2 = (Math.min(4294901760, 65536 * Math.ceil(Math.max(r3, n2) / 65536)) - k.buffer.byteLength + 65535) / 65536 | 0;
            try {
              k.grow(n2), q();
              var a2 = 1;
              break r;
            } catch (r4) {
            }
            a2 = void 0;
          }
          if (a2) return true;
        }
        return false;
      }
      var zt = () => (Z("Cannot use convertFrameToPC (needed by __builtin_return_address) without -sUSE_OFFSET_CONVERTER"), 0), Vt = {}, qt = (r3) => {
        r3.forEach((r4) => {
          var e4 = zt();
          e4 && (Vt[e4] = r4);
        });
      };
      function Yt() {
        var r3 = Error().stack.toString().split("\n");
        return "Error" == r3[0] && r3.shift(), qt(r3), Vt.Mb = zt(), Vt.dc = r3, Vt.Mb;
      }
      function Jt(r3, e4, t4) {
        if (r3 >>>= 0, e4 >>>= 0, Vt.Mb == r3) var n2 = Vt.dc;
        else "Error" == (n2 = Error().stack.toString().split("\n"))[0] && n2.shift(), qt(n2);
        for (var a2 = 3; n2[a2] && zt() != r3; ) ++a2;
        for (r3 = 0; r3 < t4 && n2[r3 + a2]; ++r3) L()[e4 + 4 * r3 >>> 2 >>> 0] = zt();
        return r3;
      }
      var Qt, Xt = {}, Kt = () => {
        if (!Qt) {
          var r3, e4 = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: "./this.program" };
          for (r3 in Xt) void 0 === Xt[r3] ? delete e4[r3] : e4[r3] = Xt[r3];
          var t4 = [];
          for (r3 in e4) t4.push(`${r3}=${e4[r3]}`);
          Qt = t4;
        }
        return Qt;
      };
      function Zt(r3, e4) {
        if (s) return fr(19, 1, r3, e4);
        r3 >>>= 0, e4 >>>= 0;
        var t4 = 0;
        return Kt().forEach((n2, a2) => {
          var o2 = e4 + t4;
          for (a2 = U()[r3 + 4 * a2 >>> 2 >>> 0] = o2, o2 = 0; o2 < n2.length; ++o2) F()[a2++ >>> 0] = n2.charCodeAt(o2);
          F()[a2 >>> 0] = 0, t4 += n2.length + 1;
        }), 0;
      }
      function rn(r3, e4) {
        if (s) return fr(20, 1, r3, e4);
        r3 >>>= 0, e4 >>>= 0;
        var t4 = Kt();
        U()[r3 >>> 2 >>> 0] = t4.length;
        var n2 = 0;
        return t4.forEach((r4) => n2 += r4.length + 1), U()[e4 >>> 2 >>> 0] = n2, 0;
      }
      function en(r3) {
        return s ? fr(21, 1, r3) : 52;
      }
      function tn(r3, e4, t4, n2) {
        return s ? fr(22, 1, r3, e4, t4, n2) : 52;
      }
      function nn(r3, e4, t4, n2) {
        return s ? fr(23, 1, r3, e4, t4, n2) : 70;
      }
      var an = [null, [], []];
      function on(r3, e4, t4, n2) {
        if (s) return fr(24, 1, r3, e4, t4, n2);
        e4 >>>= 0, t4 >>>= 0, n2 >>>= 0;
        for (var a2 = 0, o2 = 0; o2 < t4; o2++) {
          var i2 = U()[e4 >>> 2 >>> 0], u2 = U()[e4 + 4 >>> 2 >>> 0];
          e4 += 8;
          for (var f2 = 0; f2 < u2; f2++) {
            var b2 = B()[i2 + f2 >>> 0], m2 = an[r3];
            0 === b2 || 10 === b2 ? ((1 === r3 ? g : N)(Wr(m2)), m2.length = 0) : m2.push(b2);
          }
          a2 += u2;
        }
        return U()[n2 >>> 2 >>> 0] = a2, 0;
      }
      s || function() {
        for (var r3 = a.numThreads - 1; r3--; ) Nr();
        ir.unshift(() => {
          Q++, function(r4) {
            s ? r4() : Promise.all(cr.map(gr)).then(r4);
          }(() => K());
        });
      }();
      for (var un = Array(256), sn = 0; 256 > sn; ++sn) un[sn] = String.fromCharCode(sn);
      zr = un, Vr = a.BindingError = class extends Error {
        constructor(r3) {
          super(r3), this.name = "BindingError";
        }
      }, a.InternalError = class extends Error {
        constructor(r3) {
          super(r3), this.name = "InternalError";
        }
      }, ae.push(0, 1, void 0, 1, null, 1, true, 1, false, 1), a.count_emval_handles = () => ae.length / 2 - 5 - ne.length;
      var fn, bn = [br, mr, _r, Er, xr, Hr, Dr, Pr, Fr, Br, Ir, Gr, Lr, Ur, $r, jr, _t, Ot, St, Zt, rn, en, tn, nn, on];
      !async function() {
        function r3(r4, e5) {
          return fn = r4.exports, fn = function() {
            var r5 = fn, e6 = {};
            for (let [t5, n2] of Object.entries(r5)) e6[t5] = "function" == typeof n2 ? (...r6) => {
              $e.push(t5);
              try {
                return n2(...r6);
              } finally {
                D || ($e.pop(), Le && 1 === Ge && 0 === $e.length && (Ge = 0, sr += 1, Ie(Sn), "undefined" != typeof Fibers && Fibers.sc()));
              }
            } : n2;
            return e6;
          }(), fn = function() {
            var r5 = fn, e6 = (r6) => (e7) => r6(e7) >>> 0, t5 = (r6) => () => r6() >>> 0;
            return (r5 = Object.assign({}, r5)).Ea = e6(r5.Ea), r5.gb = t5(r5.gb), r5.ib = e6(r5.ib), r5.ub = e6(r5.ub), r5.vb = t5(r5.vb), r5.__cxa_get_exception_ptr = e6(r5.__cxa_get_exception_ptr), r5;
          }(), pr.push(fn.jb), w = e5, K(), fn;
        }
        Q++;
        var e4 = rr();
        if (a.instantiateWasm) return new Promise((t5) => {
          a.instantiateWasm(e4, (e5, n2) => {
            r3(e5, n2), t5(e5.exports);
          });
        });
        if (s) return new Promise((e5) => {
          z = (t5) => {
            var n2 = new WebAssembly.Instance(t5, rr());
            e5(r3(n2, t5));
          };
        });
        J ??= a.locateFile ? a.locateFile ? a.locateFile("ort-wasm-simd-threaded.jsep.wasm", y) : y + "ort-wasm-simd-threaded.jsep.wasm" : new URL("ort-wasm-simd-threaded.jsep.wasm", import.meta.url).href;
        try {
          var t4 = await async function(r4) {
            var e5 = J;
            if (!H && "function" == typeof WebAssembly.instantiateStreaming && !P(e5)) try {
              var t5 = fetch(e5, { credentials: "same-origin" });
              return await WebAssembly.instantiateStreaming(t5, r4);
            } catch (r5) {
              N(`wasm streaming compile failed: ${r5}`), N("falling back to ArrayBuffer instantiation");
            }
            return async function(r5, e6) {
              try {
                var t6 = await async function(r6) {
                  if (!H) try {
                    var e7 = await l(r6);
                    return new Uint8Array(e7);
                  } catch {
                  }
                  if (r6 == J && H) r6 = new Uint8Array(H);
                  else {
                    if (!c) throw "both async and sync fetching of the wasm failed";
                    r6 = c(r6);
                  }
                  return r6;
                }(r5);
                return await WebAssembly.instantiate(t6, e6);
              } catch (r6) {
                N(`failed to asynchronously prepare wasm: ${r6}`), Z(r6);
              }
            }(e5, r4);
          }(e4);
          return r3(t4.instance, t4.module);
        } catch (r4) {
          return n(r4), Promise.reject(r4);
        }
      }();
      var mn = (r3) => (mn = fn.Ea)(r3), ln = () => (ln = fn.Fa)();
      a._OrtInit = (r3, e4) => (a._OrtInit = fn.Ga)(r3, e4), a._OrtGetLastError = (r3, e4) => (a._OrtGetLastError = fn.Ha)(r3, e4), a._OrtCreateSessionOptions = (r3, e4, t4, n2, o2, i2, u2, s2, f2, b2) => (a._OrtCreateSessionOptions = fn.Ia)(r3, e4, t4, n2, o2, i2, u2, s2, f2, b2), a._OrtAppendExecutionProvider = (r3, e4, t4, n2, o2) => (a._OrtAppendExecutionProvider = fn.Ja)(r3, e4, t4, n2, o2), a._OrtAddFreeDimensionOverride = (r3, e4, t4) => (a._OrtAddFreeDimensionOverride = fn.Ka)(r3, e4, t4), a._OrtAddSessionConfigEntry = (r3, e4, t4) => (a._OrtAddSessionConfigEntry = fn.La)(r3, e4, t4), a._OrtReleaseSessionOptions = (r3) => (a._OrtReleaseSessionOptions = fn.Ma)(r3), a._OrtCreateSession = (r3, e4, t4) => (a._OrtCreateSession = fn.Na)(r3, e4, t4), a._OrtReleaseSession = (r3) => (a._OrtReleaseSession = fn.Oa)(r3), a._OrtGetInputOutputCount = (r3, e4, t4) => (a._OrtGetInputOutputCount = fn.Pa)(r3, e4, t4), a._OrtGetInputOutputMetadata = (r3, e4, t4, n2) => (a._OrtGetInputOutputMetadata = fn.Qa)(r3, e4, t4, n2), a._OrtFree = (r3) => (a._OrtFree = fn.Ra)(r3), a._OrtCreateTensor = (r3, e4, t4, n2, o2, i2) => (a._OrtCreateTensor = fn.Sa)(r3, e4, t4, n2, o2, i2), a._OrtGetTensorData = (r3, e4, t4, n2, o2) => (a._OrtGetTensorData = fn.Ta)(r3, e4, t4, n2, o2), a._OrtReleaseTensor = (r3) => (a._OrtReleaseTensor = fn.Ua)(r3), a._OrtCreateRunOptions = (r3, e4, t4, n2) => (a._OrtCreateRunOptions = fn.Va)(r3, e4, t4, n2), a._OrtAddRunConfigEntry = (r3, e4, t4) => (a._OrtAddRunConfigEntry = fn.Wa)(r3, e4, t4), a._OrtReleaseRunOptions = (r3) => (a._OrtReleaseRunOptions = fn.Xa)(r3), a._OrtCreateBinding = (r3) => (a._OrtCreateBinding = fn.Ya)(r3), a._OrtBindInput = (r3, e4, t4) => (a._OrtBindInput = fn.Za)(r3, e4, t4), a._OrtBindOutput = (r3, e4, t4, n2) => (a._OrtBindOutput = fn._a)(r3, e4, t4, n2), a._OrtClearBoundOutputs = (r3) => (a._OrtClearBoundOutputs = fn.$a)(r3), a._OrtReleaseBinding = (r3) => (a._OrtReleaseBinding = fn.ab)(r3), a._OrtRunWithBinding = (r3, e4, t4, n2, o2) => (a._OrtRunWithBinding = fn.bb)(r3, e4, t4, n2, o2), a._OrtRun = (r3, e4, t4, n2, o2, i2, u2, s2) => (a._OrtRun = fn.cb)(r3, e4, t4, n2, o2, i2, u2, s2), a._OrtEndProfiling = (r3) => (a._OrtEndProfiling = fn.db)(r3), a._JsepOutput = (r3, e4, t4) => (a._JsepOutput = fn.eb)(r3, e4, t4), a._JsepGetNodeName = (r3) => (a._JsepGetNodeName = fn.fb)(r3);
      var cn = () => (cn = fn.gb)(), dn = a._free = (r3) => (dn = a._free = fn.hb)(r3), pn = a._malloc = (r3) => (pn = a._malloc = fn.ib)(r3), yn = (r3, e4, t4, n2, a2, o2) => (yn = fn.lb)(r3, e4, t4, n2, a2, o2), hn = () => (hn = fn.mb)(), vn = (r3, e4, t4, n2, a2) => (vn = fn.nb)(r3, e4, t4, n2, a2), gn = (r3) => (gn = fn.ob)(r3), Nn = (r3) => (Nn = fn.pb)(r3), kn = (r3, e4) => (kn = fn.qb)(r3, e4), wn = () => (wn = fn.rb)(), An = (r3, e4) => (An = fn.sb)(r3, e4), Cn = (r3) => (Cn = fn.tb)(r3), _n = (r3) => (_n = fn.ub)(r3), On = () => (On = fn.vb)(), Tn = a.dynCall_ii = (r3, e4) => (Tn = a.dynCall_ii = fn.wb)(r3, e4), Wn = (r3) => (Wn = fn.xb)(r3), Sn = () => (Sn = fn.yb)(), En = (r3) => (En = fn.zb)(r3), xn = () => (xn = fn.Ab)();
      return a.stackSave = () => On(), a.stackRestore = (r3) => Cn(r3), a.stackAlloc = (r3) => _n(r3), a.setValue = function(r3, e4, t4 = "i8") {
        switch (t4.endsWith("*") && (t4 = "*"), t4) {
          case "i1":
          case "i8":
            F()[r3 >>> 0] = e4;
            break;
          case "i16":
            I()[r3 >>> 1 >>> 0] = e4;
            break;
          case "i32":
            L()[r3 >>> 2 >>> 0] = e4;
            break;
          case "i64":
            x[r3 >>> 3] = BigInt(e4);
            break;
          case "float":
            $()[r3 >>> 2 >>> 0] = e4;
            break;
          case "double":
            j()[r3 >>> 3 >>> 0] = e4;
            break;
          case "*":
            U()[r3 >>> 2 >>> 0] = e4;
            break;
          default:
            Z(`invalid type for setValue: ${t4}`);
        }
      }, a.getValue = function(r3, e4 = "i8") {
        switch (e4.endsWith("*") && (e4 = "*"), e4) {
          case "i1":
          case "i8":
            return F()[r3 >>> 0];
          case "i16":
            return I()[r3 >>> 1 >>> 0];
          case "i32":
            return L()[r3 >>> 2 >>> 0];
          case "i64":
            return x[r3 >>> 3];
          case "float":
            return $()[r3 >>> 2 >>> 0];
          case "double":
            return j()[r3 >>> 3 >>> 0];
          case "*":
            return U()[r3 >>> 2 >>> 0];
          default:
            Z(`invalid type for getValue: ${e4}`);
        }
      }, a.UTF8ToString = Sr, a.stringToUTF8 = Mr, a.lengthBytesUTF8 = Rr, function r3() {
        if (0 < Q) X = r3;
        else if (s) t3(a), Y();
        else {
          for (; 0 < ir.length; ) ir.shift()(a);
          0 < Q ? X = r3 : (a.calledRun = true, D || (Y(), t3(a)));
        }
      }(), a.PTR_SIZE = 4, o;
    });
    ort_wasm_simd_threaded_jsep_default = e;
    t = globalThis.self?.name?.startsWith("em-pthread");
    t && e();
  }
});

// web/dist/ort-wasm-simd-threaded.mjs
var ort_wasm_simd_threaded_exports = {};
__export(ort_wasm_simd_threaded_exports, {
  default: () => ort_wasm_simd_threaded_default
});
var e2, r2, ort_wasm_simd_threaded_default, t2;
var init_ort_wasm_simd_threaded = __esm({
  "web/dist/ort-wasm-simd-threaded.mjs"() {
    "use strict";
    r2 = (e2 = import.meta.url, async function(r3 = {}) {
      var t3, n, a = r3, i = new Promise((e3, r4) => {
        t3 = e3, n = r4;
      }), o = "object" == typeof window, s = "undefined" != typeof WorkerGlobalScope, u = s && self.name?.startsWith("em-pthread");
      a.mountExternalData = (e3, r4) => {
        e3.startsWith("./") && (e3 = e3.substring(2)), (a.Na || (a.Na = /* @__PURE__ */ new Map())).set(e3, r4);
      }, a.unmountExternalData = () => {
        delete a.Na;
      };
      var f, c, l = globalThis.SharedArrayBuffer ?? new WebAssembly.Memory({ initial: 0, maximum: 0, eb: true }).buffer.constructor, d = Object.assign({}, a), g = (e3, r4) => {
        throw r4;
      }, m = "";
      (o || s) && (s ? m = self.location.href : "undefined" != typeof document && document.currentScript && (m = document.currentScript.src), e2 && (m = e2), m = m.startsWith("blob:") ? "" : m.slice(0, m.replace(/[?#].*/, "").lastIndexOf("/") + 1), s && (c = (e3) => {
        var r4 = new XMLHttpRequest();
        return r4.open("GET", e3, false), r4.responseType = "arraybuffer", r4.send(null), new Uint8Array(r4.response);
      }), f = async (e3) => {
        if (U(e3)) return new Promise((r5, t4) => {
          var n2 = new XMLHttpRequest();
          n2.open("GET", e3, true), n2.responseType = "arraybuffer", n2.onload = () => {
            200 == n2.status || 0 == n2.status && n2.response ? r5(n2.response) : t4(n2.status);
          }, n2.onerror = t4, n2.send(null);
        });
        var r4 = await fetch(e3, { credentials: "same-origin" });
        if (r4.ok) return r4.arrayBuffer();
        throw Error(r4.status + " : " + r4.url);
      });
      var h = console.log.bind(console), v = console.error.bind(console), p = h, w = v;
      Object.assign(a, d), d = null;
      var b, O, y, _, T, A, M, C, E, S, k, D = a.wasmBinary, R = false, U = (e3) => e3.startsWith("file://");
      function x() {
        return b.buffer != _.buffer && H(), _;
      }
      function P() {
        return b.buffer != _.buffer && H(), T;
      }
      function F() {
        return b.buffer != _.buffer && H(), A;
      }
      function B() {
        return b.buffer != _.buffer && H(), M;
      }
      function W() {
        return b.buffer != _.buffer && H(), C;
      }
      function N() {
        return b.buffer != _.buffer && H(), E;
      }
      function L() {
        return b.buffer != _.buffer && H(), k;
      }
      if (u) {
        let Hr2 = function(e3) {
          try {
            var r4 = e3.data, t4 = r4.Ma;
            if ("load" === t4) {
              let e4 = [];
              self.onmessage = (r5) => e4.push(r5), self.startWorker = () => {
                postMessage({ Ma: "loaded" });
                for (let r5 of e4) Hr2(r5);
                self.onmessage = Hr2;
              };
              for (const e5 of r4.Ta) a[e5] && !a[e5].proxy || (a[e5] = (...r5) => {
                postMessage({ Ma: "callHandler", Sa: e5, args: r5 });
              }, "print" == e5 && (p = a[e5]), "printErr" == e5 && (w = a[e5]));
              b = r4.Za, H(), I(r4.$a);
            } else if ("run" === t4) {
              he(r4.La), Rr(r4.La, 0, 0, 1, 0, 0), le(), He(r4.La), $ ||= true;
              try {
                pe(r4.Va, r4.Qa);
              } catch (e4) {
                if ("unwind" != e4) throw e4;
              }
            } else "setimmediate" !== r4.target && ("checkMailbox" === t4 ? $ && Ge() : t4 && (w(`worker: received unknown command ${t4}`), w(r4)));
          } catch (e4) {
            throw Ur(), e4;
          }
        };
        var Hr = Hr2;
        var I, $ = false;
        w = function(...e3) {
          e3 = e3.join(" "), console.error(e3);
        }, self.alert = function(...e3) {
          postMessage({ Ma: "alert", text: e3.join(" "), Xa: Dr() });
        }, self.onunhandledrejection = (e3) => {
          throw e3.reason || e3;
        }, self.onmessage = Hr2;
      }
      function H() {
        var e3 = b.buffer;
        a.HEAP8 = _ = new Int8Array(e3), a.HEAP16 = A = new Int16Array(e3), a.HEAPU8 = T = new Uint8Array(e3), a.HEAPU16 = new Uint16Array(e3), a.HEAP32 = M = new Int32Array(e3), a.HEAPU32 = C = new Uint32Array(e3), a.HEAPF32 = E = new Float32Array(e3), a.HEAPF64 = k = new Float64Array(e3), a.HEAP64 = S = new BigInt64Array(e3), a.HEAPU64 = new BigUint64Array(e3);
      }
      function G() {
        u ? startWorker(a) : Sr.W();
      }
      u || (b = new WebAssembly.Memory({ initial: 256, maximum: 65536, shared: true }), H());
      var Y, j = 0, z = null;
      function V() {
        if (0 == --j && z) {
          var e3 = z;
          z = null, e3();
        }
      }
      function Q(e3) {
        throw w(e3 = "Aborted(" + e3 + ")"), R = true, e3 = new WebAssembly.RuntimeError(e3 + ". Build with -sASSERTIONS for more info."), n(e3), e3;
      }
      function X() {
        return { a: { b: be, D: ye, e: Me, U: Ce, y: Se, A: ke, r: De, S: Re, L: Ue, R: xe, k: Pe, z: Fe, w: Be, T: We, x: Ne, s: Le, O: Ie, u: Ye, E: ze, p: Ve, i: Qe, N: He, m: Xe, H: qe, I: er, J: rr, F: tr, G: nr, q: or, K: sr, C: cr, V: dr, j: gr, n: ur, l: mr, v: hr, c: ir, d: vr, t: pr, P: yr, Q: _r, B: ie, f: Tr, h: Ar, M: Mr, g: Er, a: b, o: ne } };
      }
      var q = { 469092: (e3, r4, t4, n2, i2) => {
        if (void 0 === a || !a.Na) return 1;
        if ((e3 = Ae(Number(e3 >>> 0))).startsWith("./") && (e3 = e3.substring(2)), !(e3 = a.Na.get(e3))) return 2;
        if (r4 = Number(r4 >>> 0), t4 = Number(t4 >>> 0), n2 = Number(n2 >>> 0), r4 + t4 > e3.byteLength) return 3;
        try {
          const o2 = e3.subarray(r4, r4 + t4);
          switch (i2) {
            case 0:
              P().set(o2, n2 >>> 0);
              break;
            case 1:
              a.ab ? a.ab(n2, o2) : a.cb(n2, o2);
              break;
            default:
              return 4;
          }
          return 0;
        } catch {
          return 4;
        }
      } };
      class J {
        name = "ExitStatus";
        constructor(e3) {
          this.message = `Program terminated with exit(${e3})`, this.status = e3;
        }
      }
      var K = (e3) => {
        e3.terminate(), e3.onmessage = () => {
        };
      }, Z = [], ee = (e3) => {
        0 == oe.length && (ge(), de(oe[0]));
        var r4 = oe.pop();
        if (!r4) return 6;
        se.push(r4), fe[e3.La] = r4, r4.La = e3.La;
        var t4 = { Ma: "run", Va: e3.Ua, Qa: e3.Qa, La: e3.La };
        return r4.postMessage(t4, e3.Ra), 0;
      }, re = 0, te = (e3, r4, ...t4) => {
        for (var n2 = 2 * t4.length, a2 = $r(), i2 = Ir(8 * n2), o2 = i2 >>> 3, s2 = 0; s2 < t4.length; s2++) {
          var u2 = t4[s2];
          "bigint" == typeof u2 ? (S[o2 + 2 * s2] = 1n, S[o2 + 2 * s2 + 1] = u2) : (S[o2 + 2 * s2] = 0n, L()[o2 + 2 * s2 + 1 >>> 0] = u2);
        }
        return e3 = xr(e3, 0, n2, i2, r4), Lr(a2), e3;
      };
      function ne(e3) {
        if (u) return te(0, 1, e3);
        if (y = e3, !(0 < re)) {
          for (var r4 of se) K(r4);
          for (r4 of oe) K(r4);
          oe = [], se = [], fe = {}, R = true;
        }
        g(0, new J(e3));
      }
      function ae(e3) {
        if (u) return te(1, 0, e3);
        ie(e3);
      }
      var ie = (e3) => {
        if (y = e3, u) throw ae(e3), "unwind";
        ne(e3);
      }, oe = [], se = [], ue = [], fe = {}, ce = (e3) => {
        var r4 = e3.La;
        delete fe[r4], oe.push(e3), se.splice(se.indexOf(e3), 1), e3.La = 0, Pr(r4);
      };
      function le() {
        ue.forEach((e3) => e3());
      }
      var de = (e3) => new Promise((r4) => {
        e3.onmessage = (t5) => {
          var n3 = (t5 = t5.data).Ma;
          if (t5.Oa && t5.Oa != Dr()) {
            var i2 = fe[t5.Oa];
            i2 ? i2.postMessage(t5, t5.Ra) : w(`Internal error! Worker sent a message "${n3}" to target pthread ${t5.Oa}, but that thread no longer exists!`);
          } else "checkMailbox" === n3 ? Ge() : "spawnThread" === n3 ? ee(t5) : "cleanupThread" === n3 ? ce(fe[t5.Wa]) : "loaded" === n3 ? (e3.loaded = true, r4(e3)) : "alert" === n3 ? alert(`Thread ${t5.Xa}: ${t5.text}`) : "setimmediate" === t5.target ? e3.postMessage(t5) : "callHandler" === n3 ? a[t5.Sa](...t5.args) : n3 && w(`worker sent an unknown command ${n3}`);
        }, e3.onerror = (e4) => {
          throw w(`worker sent an error! ${e4.filename}:${e4.lineno}: ${e4.message}`), e4;
        };
        var t4, n2 = [];
        for (t4 of []) a.propertyIsEnumerable(t4) && n2.push(t4);
        e3.postMessage({ Ma: "load", Ta: n2, Za: b, $a: O });
      });
      function ge() {
        var e3 = new Worker((() => {
          const e4 = URL;
          return import.meta.url > "file:" && import.meta.url < "file;" ? new e4("ort.wasm.bundle.mjs", import.meta.url) : new URL(import.meta.url);
        })(), { type: "module", workerData: "em-pthread", name: "em-pthread" });
        oe.push(e3);
      }
      var me, he = (e3) => {
        H();
        var r4 = W()[e3 + 52 >>> 2 >>> 0];
        e3 = W()[e3 + 56 >>> 2 >>> 0], Nr(r4, r4 - e3), Lr(r4);
      }, ve = [], pe = (e3, r4) => {
        re = 0;
        var t4 = ve[e3];
        t4 || (e3 >= ve.length && (ve.length = e3 + 1), ve[e3] = t4 = me.get(e3)), e3 = t4(r4), 0 < re ? y = e3 : Fr(e3);
      };
      class we {
        constructor(e3) {
          this.Pa = e3 - 24;
        }
      }
      function be(e3, r4, t4) {
        var n2 = new we(e3 >>>= 0);
        throw r4 >>>= 0, t4 >>>= 0, W()[n2.Pa + 16 >>> 2 >>> 0] = 0, W()[n2.Pa + 4 >>> 2 >>> 0] = r4, W()[n2.Pa + 8 >>> 2 >>> 0] = t4, e3;
      }
      function Oe(e3, r4, t4, n2) {
        return u ? te(2, 1, e3, r4, t4, n2) : ye(e3, r4, t4, n2);
      }
      function ye(e3, r4, t4, n2) {
        if (e3 >>>= 0, t4 >>>= 0, n2 >>>= 0, void 0 === l) return 6;
        var a2 = [];
        return u && 0 === a2.length ? Oe(e3, r4 >>>= 0, t4, n2) : (e3 = { Ua: t4, La: e3, Qa: n2, Ra: a2 }, u ? (e3.Ma = "spawnThread", postMessage(e3, a2), 0) : ee(e3));
      }
      var _e = "undefined" != typeof TextDecoder ? new TextDecoder() : void 0, Te = (e3, r4 = 0, t4 = NaN) => {
        var n2 = (r4 >>>= 0) + t4;
        for (t4 = r4; e3[t4] && !(t4 >= n2); ) ++t4;
        if (16 < t4 - r4 && e3.buffer && _e) return _e.decode(e3.buffer instanceof ArrayBuffer ? e3.subarray(r4, t4) : e3.slice(r4, t4));
        for (n2 = ""; r4 < t4; ) {
          var a2 = e3[r4++];
          if (128 & a2) {
            var i2 = 63 & e3[r4++];
            if (192 == (224 & a2)) n2 += String.fromCharCode((31 & a2) << 6 | i2);
            else {
              var o2 = 63 & e3[r4++];
              65536 > (a2 = 224 == (240 & a2) ? (15 & a2) << 12 | i2 << 6 | o2 : (7 & a2) << 18 | i2 << 12 | o2 << 6 | 63 & e3[r4++]) ? n2 += String.fromCharCode(a2) : (a2 -= 65536, n2 += String.fromCharCode(55296 | a2 >> 10, 56320 | 1023 & a2));
            }
          } else n2 += String.fromCharCode(a2);
        }
        return n2;
      }, Ae = (e3, r4) => (e3 >>>= 0) ? Te(P(), e3, r4) : "";
      function Me(e3, r4, t4) {
        return u ? te(3, 1, e3, r4, t4) : 0;
      }
      function Ce(e3, r4) {
        if (u) return te(4, 1, e3, r4);
      }
      var Ee = (e3, r4, t4) => {
        var n2 = P();
        if (r4 >>>= 0, 0 < t4) {
          var a2 = r4;
          t4 = r4 + t4 - 1;
          for (var i2 = 0; i2 < e3.length; ++i2) {
            var o2 = e3.charCodeAt(i2);
            if (55296 <= o2 && 57343 >= o2 && (o2 = 65536 + ((1023 & o2) << 10) | 1023 & e3.charCodeAt(++i2)), 127 >= o2) {
              if (r4 >= t4) break;
              n2[r4++ >>> 0] = o2;
            } else {
              if (2047 >= o2) {
                if (r4 + 1 >= t4) break;
                n2[r4++ >>> 0] = 192 | o2 >> 6;
              } else {
                if (65535 >= o2) {
                  if (r4 + 2 >= t4) break;
                  n2[r4++ >>> 0] = 224 | o2 >> 12;
                } else {
                  if (r4 + 3 >= t4) break;
                  n2[r4++ >>> 0] = 240 | o2 >> 18, n2[r4++ >>> 0] = 128 | o2 >> 12 & 63;
                }
                n2[r4++ >>> 0] = 128 | o2 >> 6 & 63;
              }
              n2[r4++ >>> 0] = 128 | 63 & o2;
            }
          }
          n2[r4 >>> 0] = 0, e3 = r4 - a2;
        } else e3 = 0;
        return e3;
      };
      function Se(e3, r4) {
        if (u) return te(5, 1, e3, r4);
      }
      function ke(e3, r4, t4) {
        if (u) return te(6, 1, e3, r4, t4);
      }
      function De(e3, r4, t4) {
        return u ? te(7, 1, e3, r4, t4) : 0;
      }
      function Re(e3, r4) {
        if (u) return te(8, 1, e3, r4);
      }
      function Ue(e3, r4, t4) {
        if (u) return te(9, 1, e3, r4, t4);
      }
      function xe(e3, r4, t4, n2) {
        if (u) return te(10, 1, e3, r4, t4, n2);
      }
      function Pe(e3, r4, t4, n2) {
        if (u) return te(11, 1, e3, r4, t4, n2);
      }
      function Fe(e3, r4, t4, n2) {
        if (u) return te(12, 1, e3, r4, t4, n2);
      }
      function Be(e3) {
        if (u) return te(13, 1, e3);
      }
      function We(e3, r4) {
        if (u) return te(14, 1, e3, r4);
      }
      function Ne(e3, r4, t4) {
        if (u) return te(15, 1, e3, r4, t4);
      }
      var Le = () => Q("");
      function Ie(e3) {
        Rr(e3 >>> 0, !s, 1, !o, 131072, false), le();
      }
      var $e = (e3) => {
        if (!R) try {
          if (e3(), !(0 < re)) try {
            u ? Fr(y) : ie(y);
          } catch (e4) {
            e4 instanceof J || "unwind" == e4 || g(0, e4);
          }
        } catch (e4) {
          e4 instanceof J || "unwind" == e4 || g(0, e4);
        }
      };
      function He(e3) {
        e3 >>>= 0, "function" == typeof Atomics.Ya && (Atomics.Ya(B(), e3 >>> 2, e3).value.then(Ge), e3 += 128, Atomics.store(B(), e3 >>> 2, 1));
      }
      var Ge = () => {
        var e3 = Dr();
        e3 && (He(e3), $e(Wr));
      };
      function Ye(e3, r4) {
        (e3 >>>= 0) == r4 >>> 0 ? setTimeout(Ge) : u ? postMessage({ Oa: e3, Ma: "checkMailbox" }) : (e3 = fe[e3]) && e3.postMessage({ Ma: "checkMailbox" });
      }
      var je = [];
      function ze(e3, r4, t4, n2, a2) {
        for (r4 >>>= 0, n2 /= 2, je.length = n2, t4 = a2 >>> 0 >>> 3, a2 = 0; a2 < n2; a2++) je[a2] = S[t4 + 2 * a2] ? S[t4 + 2 * a2 + 1] : L()[t4 + 2 * a2 + 1 >>> 0];
        return (r4 ? q[r4] : kr[e3])(...je);
      }
      var Ve = () => {
        re = 0;
      };
      function Qe(e3) {
        e3 >>>= 0, u ? postMessage({ Ma: "cleanupThread", Wa: e3 }) : ce(fe[e3]);
      }
      function Xe(e3) {
      }
      function qe(e3, r4) {
        e3 = -9007199254740992 > e3 || 9007199254740992 < e3 ? NaN : Number(e3), r4 >>>= 0, e3 = new Date(1e3 * e3), B()[r4 >>> 2 >>> 0] = e3.getUTCSeconds(), B()[r4 + 4 >>> 2 >>> 0] = e3.getUTCMinutes(), B()[r4 + 8 >>> 2 >>> 0] = e3.getUTCHours(), B()[r4 + 12 >>> 2 >>> 0] = e3.getUTCDate(), B()[r4 + 16 >>> 2 >>> 0] = e3.getUTCMonth(), B()[r4 + 20 >>> 2 >>> 0] = e3.getUTCFullYear() - 1900, B()[r4 + 24 >>> 2 >>> 0] = e3.getUTCDay(), e3 = (e3.getTime() - Date.UTC(e3.getUTCFullYear(), 0, 1, 0, 0, 0, 0)) / 864e5 | 0, B()[r4 + 28 >>> 2 >>> 0] = e3;
      }
      var Je = (e3) => 0 == e3 % 4 && (0 != e3 % 100 || 0 == e3 % 400), Ke = [0, 31, 60, 91, 121, 152, 182, 213, 244, 274, 305, 335], Ze = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
      function er(e3, r4) {
        e3 = -9007199254740992 > e3 || 9007199254740992 < e3 ? NaN : Number(e3), r4 >>>= 0, e3 = new Date(1e3 * e3), B()[r4 >>> 2 >>> 0] = e3.getSeconds(), B()[r4 + 4 >>> 2 >>> 0] = e3.getMinutes(), B()[r4 + 8 >>> 2 >>> 0] = e3.getHours(), B()[r4 + 12 >>> 2 >>> 0] = e3.getDate(), B()[r4 + 16 >>> 2 >>> 0] = e3.getMonth(), B()[r4 + 20 >>> 2 >>> 0] = e3.getFullYear() - 1900, B()[r4 + 24 >>> 2 >>> 0] = e3.getDay();
        var t4 = (Je(e3.getFullYear()) ? Ke : Ze)[e3.getMonth()] + e3.getDate() - 1 | 0;
        B()[r4 + 28 >>> 2 >>> 0] = t4, B()[r4 + 36 >>> 2 >>> 0] = -60 * e3.getTimezoneOffset(), t4 = new Date(e3.getFullYear(), 6, 1).getTimezoneOffset();
        var n2 = new Date(e3.getFullYear(), 0, 1).getTimezoneOffset();
        e3 = 0 | (t4 != n2 && e3.getTimezoneOffset() == Math.min(n2, t4)), B()[r4 + 32 >>> 2 >>> 0] = e3;
      }
      function rr(e3) {
        e3 >>>= 0;
        var r4 = new Date(B()[e3 + 20 >>> 2 >>> 0] + 1900, B()[e3 + 16 >>> 2 >>> 0], B()[e3 + 12 >>> 2 >>> 0], B()[e3 + 8 >>> 2 >>> 0], B()[e3 + 4 >>> 2 >>> 0], B()[e3 >>> 2 >>> 0], 0), t4 = B()[e3 + 32 >>> 2 >>> 0], n2 = r4.getTimezoneOffset(), a2 = new Date(r4.getFullYear(), 6, 1).getTimezoneOffset(), i2 = new Date(r4.getFullYear(), 0, 1).getTimezoneOffset(), o2 = Math.min(i2, a2);
        return 0 > t4 ? B()[e3 + 32 >>> 2 >>> 0] = Number(a2 != i2 && o2 == n2) : 0 < t4 != (o2 == n2) && (a2 = Math.max(i2, a2), r4.setTime(r4.getTime() + 6e4 * ((0 < t4 ? o2 : a2) - n2))), B()[e3 + 24 >>> 2 >>> 0] = r4.getDay(), t4 = (Je(r4.getFullYear()) ? Ke : Ze)[r4.getMonth()] + r4.getDate() - 1 | 0, B()[e3 + 28 >>> 2 >>> 0] = t4, B()[e3 >>> 2 >>> 0] = r4.getSeconds(), B()[e3 + 4 >>> 2 >>> 0] = r4.getMinutes(), B()[e3 + 8 >>> 2 >>> 0] = r4.getHours(), B()[e3 + 12 >>> 2 >>> 0] = r4.getDate(), B()[e3 + 16 >>> 2 >>> 0] = r4.getMonth(), B()[e3 + 20 >>> 2 >>> 0] = r4.getYear(), e3 = r4.getTime(), BigInt(isNaN(e3) ? -1 : e3 / 1e3);
      }
      function tr(e3, r4, t4, n2, a2, i2, o2) {
        return u ? te(16, 1, e3, r4, t4, n2, a2, i2, o2) : -52;
      }
      function nr(e3, r4, t4, n2, a2, i2) {
        if (u) return te(17, 1, e3, r4, t4, n2, a2, i2);
      }
      var ar = {}, ir = () => performance.timeOrigin + performance.now();
      function or(e3, r4) {
        if (u) return te(18, 1, e3, r4);
        if (ar[e3] && (clearTimeout(ar[e3].id), delete ar[e3]), !r4) return 0;
        var t4 = setTimeout(() => {
          delete ar[e3], $e(() => Br(e3, performance.timeOrigin + performance.now()));
        }, r4);
        return ar[e3] = { id: t4, fb: r4 }, 0;
      }
      function sr(e3, r4, t4, n2) {
        e3 >>>= 0, r4 >>>= 0, t4 >>>= 0, n2 >>>= 0;
        var a2 = (/* @__PURE__ */ new Date()).getFullYear(), i2 = new Date(a2, 0, 1).getTimezoneOffset();
        a2 = new Date(a2, 6, 1).getTimezoneOffset();
        var o2 = Math.max(i2, a2);
        W()[e3 >>> 2 >>> 0] = 60 * o2, B()[r4 >>> 2 >>> 0] = Number(i2 != a2), e3 = (r4 = (e4) => {
          var r5 = Math.abs(e4);
          return `UTC${0 <= e4 ? "-" : "+"}${String(Math.floor(r5 / 60)).padStart(2, "0")}${String(r5 % 60).padStart(2, "0")}`;
        })(i2), r4 = r4(a2), a2 < i2 ? (Ee(e3, t4, 17), Ee(r4, n2, 17)) : (Ee(e3, n2, 17), Ee(r4, t4, 17));
      }
      var ur = () => Date.now(), fr = 1;
      function cr(e3, r4, t4) {
        if (!(0 <= e3 && 3 >= e3)) return 28;
        if (0 === e3) e3 = Date.now();
        else {
          if (!fr) return 52;
          e3 = performance.timeOrigin + performance.now();
        }
        return S[t4 >>> 0 >>> 3] = BigInt(Math.round(1e6 * e3)), 0;
      }
      var lr = [];
      function dr(e3, r4, t4) {
        e3 >>>= 0, r4 >>>= 0, t4 >>>= 0, lr.length = 0;
        for (var n2; n2 = P()[r4++ >>> 0]; ) {
          var a2 = 105 != n2;
          t4 += (a2 &= 112 != n2) && t4 % 8 ? 4 : 0, lr.push(112 == n2 ? W()[t4 >>> 2 >>> 0] : 106 == n2 ? S[t4 >>> 3] : 105 == n2 ? B()[t4 >>> 2 >>> 0] : L()[t4 >>> 3 >>> 0]), t4 += a2 ? 8 : 4;
        }
        return q[e3](...lr);
      }
      var gr = () => {
      }, mr = () => {
        throw re += 1, "unwind";
      };
      function hr() {
        return 4294901760;
      }
      var vr = () => navigator.hardwareConcurrency;
      function pr(e3) {
        e3 >>>= 0;
        var r4 = P().length;
        if (e3 <= r4 || 4294901760 < e3) return false;
        for (var t4 = 1; 4 >= t4; t4 *= 2) {
          var n2 = r4 * (1 + 0.2 / t4);
          n2 = Math.min(n2, e3 + 100663296);
          e: {
            n2 = (Math.min(4294901760, 65536 * Math.ceil(Math.max(e3, n2) / 65536)) - b.buffer.byteLength + 65535) / 65536 | 0;
            try {
              b.grow(n2), H();
              var a2 = 1;
              break e;
            } catch (e4) {
            }
            a2 = void 0;
          }
          if (a2) return true;
        }
        return false;
      }
      var wr, br = {}, Or = () => {
        if (!wr) {
          var e3, r4 = { USER: "web_user", LOGNAME: "web_user", PATH: "/", PWD: "/", HOME: "/home/web_user", LANG: ("object" == typeof navigator && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8", _: "./this.program" };
          for (e3 in br) void 0 === br[e3] ? delete r4[e3] : r4[e3] = br[e3];
          var t4 = [];
          for (e3 in r4) t4.push(`${e3}=${r4[e3]}`);
          wr = t4;
        }
        return wr;
      };
      function yr(e3, r4) {
        if (u) return te(19, 1, e3, r4);
        e3 >>>= 0, r4 >>>= 0;
        var t4 = 0;
        return Or().forEach((n2, a2) => {
          var i2 = r4 + t4;
          for (a2 = W()[e3 + 4 * a2 >>> 2 >>> 0] = i2, i2 = 0; i2 < n2.length; ++i2) x()[a2++ >>> 0] = n2.charCodeAt(i2);
          x()[a2 >>> 0] = 0, t4 += n2.length + 1;
        }), 0;
      }
      function _r(e3, r4) {
        if (u) return te(20, 1, e3, r4);
        e3 >>>= 0, r4 >>>= 0;
        var t4 = Or();
        W()[e3 >>> 2 >>> 0] = t4.length;
        var n2 = 0;
        return t4.forEach((e4) => n2 += e4.length + 1), W()[r4 >>> 2 >>> 0] = n2, 0;
      }
      function Tr(e3) {
        return u ? te(21, 1, e3) : 52;
      }
      function Ar(e3, r4, t4, n2) {
        return u ? te(22, 1, e3, r4, t4, n2) : 52;
      }
      function Mr(e3, r4, t4, n2) {
        return u ? te(23, 1, e3, r4, t4, n2) : 70;
      }
      var Cr = [null, [], []];
      function Er(e3, r4, t4, n2) {
        if (u) return te(24, 1, e3, r4, t4, n2);
        r4 >>>= 0, t4 >>>= 0, n2 >>>= 0;
        for (var a2 = 0, i2 = 0; i2 < t4; i2++) {
          var o2 = W()[r4 >>> 2 >>> 0], s2 = W()[r4 + 4 >>> 2 >>> 0];
          r4 += 8;
          for (var f2 = 0; f2 < s2; f2++) {
            var c2 = P()[o2 + f2 >>> 0], l2 = Cr[e3];
            0 === c2 || 10 === c2 ? ((1 === e3 ? p : w)(Te(l2)), l2.length = 0) : l2.push(c2);
          }
          a2 += s2;
        }
        return W()[n2 >>> 2 >>> 0] = a2, 0;
      }
      u || function() {
        for (var e3 = a.numThreads - 1; e3--; ) ge();
        Z.unshift(() => {
          j++, function(e4) {
            u ? e4() : Promise.all(oe.map(de)).then(e4);
          }(() => V());
        });
      }();
      var Sr, kr = [ne, ae, Oe, Me, Ce, Se, ke, De, Re, Ue, xe, Pe, Fe, Be, We, Ne, tr, nr, or, yr, _r, Tr, Ar, Mr, Er];
      !async function() {
        function e3(e4, r5) {
          return Sr = e4.exports, Sr = function() {
            var e5 = Sr, r6 = (e6) => () => e6() >>> 0, t5 = (e6) => (r7) => e6(r7) >>> 0;
            return (e5 = Object.assign({}, e5)).va = r6(e5.va), e5.xa = t5(e5.xa), e5.Ja = t5(e5.Ja), e5.Ka = r6(e5.Ka), e5;
          }(), ue.push(Sr.ya), me = Sr.za, O = r5, V(), Sr;
        }
        j++;
        var r4 = X();
        if (a.instantiateWasm) return new Promise((t5) => {
          a.instantiateWasm(r4, (r5, n2) => {
            e3(r5, n2), t5(r5.exports);
          });
        });
        if (u) return new Promise((r5) => {
          I = (t5) => {
            var n2 = new WebAssembly.Instance(t5, X());
            r5(e3(n2, t5));
          };
        });
        Y ??= a.locateFile ? a.locateFile ? a.locateFile("ort-wasm-simd-threaded.wasm", m) : m + "ort-wasm-simd-threaded.wasm" : new URL("ort-wasm-simd-threaded.wasm", import.meta.url).href;
        try {
          var t4 = await async function(e4) {
            var r5 = Y;
            if (!D && "function" == typeof WebAssembly.instantiateStreaming && !U(r5)) try {
              var t5 = fetch(r5, { credentials: "same-origin" });
              return await WebAssembly.instantiateStreaming(t5, e4);
            } catch (e5) {
              w(`wasm streaming compile failed: ${e5}`), w("falling back to ArrayBuffer instantiation");
            }
            return async function(e5, r6) {
              try {
                var t6 = await async function(e6) {
                  if (!D) try {
                    var r7 = await f(e6);
                    return new Uint8Array(r7);
                  } catch {
                  }
                  if (e6 == Y && D) e6 = new Uint8Array(D);
                  else {
                    if (!c) throw "both async and sync fetching of the wasm failed";
                    e6 = c(e6);
                  }
                  return e6;
                }(e5);
                return await WebAssembly.instantiate(t6, r6);
              } catch (e6) {
                w(`failed to asynchronously prepare wasm: ${e6}`), Q(e6);
              }
            }(r5, e4);
          }(r4);
          return e3(t4.instance, t4.module);
        } catch (e4) {
          return n(e4), Promise.reject(e4);
        }
      }(), a._OrtInit = (e3, r4) => (a._OrtInit = Sr.X)(e3, r4), a._OrtGetLastError = (e3, r4) => (a._OrtGetLastError = Sr.Y)(e3, r4), a._OrtCreateSessionOptions = (e3, r4, t4, n2, i2, o2, s2, u2, f2, c2) => (a._OrtCreateSessionOptions = Sr.Z)(e3, r4, t4, n2, i2, o2, s2, u2, f2, c2), a._OrtAppendExecutionProvider = (e3, r4, t4, n2, i2) => (a._OrtAppendExecutionProvider = Sr._)(e3, r4, t4, n2, i2), a._OrtAddFreeDimensionOverride = (e3, r4, t4) => (a._OrtAddFreeDimensionOverride = Sr.$)(e3, r4, t4), a._OrtAddSessionConfigEntry = (e3, r4, t4) => (a._OrtAddSessionConfigEntry = Sr.aa)(e3, r4, t4), a._OrtReleaseSessionOptions = (e3) => (a._OrtReleaseSessionOptions = Sr.ba)(e3), a._OrtCreateSession = (e3, r4, t4) => (a._OrtCreateSession = Sr.ca)(e3, r4, t4), a._OrtReleaseSession = (e3) => (a._OrtReleaseSession = Sr.da)(e3), a._OrtGetInputOutputCount = (e3, r4, t4) => (a._OrtGetInputOutputCount = Sr.ea)(e3, r4, t4), a._OrtGetInputOutputMetadata = (e3, r4, t4, n2) => (a._OrtGetInputOutputMetadata = Sr.fa)(e3, r4, t4, n2), a._OrtFree = (e3) => (a._OrtFree = Sr.ga)(e3), a._OrtCreateTensor = (e3, r4, t4, n2, i2, o2) => (a._OrtCreateTensor = Sr.ha)(e3, r4, t4, n2, i2, o2), a._OrtGetTensorData = (e3, r4, t4, n2, i2) => (a._OrtGetTensorData = Sr.ia)(e3, r4, t4, n2, i2), a._OrtReleaseTensor = (e3) => (a._OrtReleaseTensor = Sr.ja)(e3), a._OrtCreateRunOptions = (e3, r4, t4, n2) => (a._OrtCreateRunOptions = Sr.ka)(e3, r4, t4, n2), a._OrtAddRunConfigEntry = (e3, r4, t4) => (a._OrtAddRunConfigEntry = Sr.la)(e3, r4, t4), a._OrtReleaseRunOptions = (e3) => (a._OrtReleaseRunOptions = Sr.ma)(e3), a._OrtCreateBinding = (e3) => (a._OrtCreateBinding = Sr.na)(e3), a._OrtBindInput = (e3, r4, t4) => (a._OrtBindInput = Sr.oa)(e3, r4, t4), a._OrtBindOutput = (e3, r4, t4, n2) => (a._OrtBindOutput = Sr.pa)(e3, r4, t4, n2), a._OrtClearBoundOutputs = (e3) => (a._OrtClearBoundOutputs = Sr.qa)(e3), a._OrtReleaseBinding = (e3) => (a._OrtReleaseBinding = Sr.ra)(e3), a._OrtRunWithBinding = (e3, r4, t4, n2, i2) => (a._OrtRunWithBinding = Sr.sa)(e3, r4, t4, n2, i2), a._OrtRun = (e3, r4, t4, n2, i2, o2, s2, u2) => (a._OrtRun = Sr.ta)(e3, r4, t4, n2, i2, o2, s2, u2), a._OrtEndProfiling = (e3) => (a._OrtEndProfiling = Sr.ua)(e3);
      var Dr = () => (Dr = Sr.va)();
      a._free = (e3) => (a._free = Sr.wa)(e3), a._malloc = (e3) => (a._malloc = Sr.xa)(e3);
      var Rr = (e3, r4, t4, n2, a2, i2) => (Rr = Sr.Aa)(e3, r4, t4, n2, a2, i2), Ur = () => (Ur = Sr.Ba)(), xr = (e3, r4, t4, n2, a2) => (xr = Sr.Ca)(e3, r4, t4, n2, a2), Pr = (e3) => (Pr = Sr.Da)(e3), Fr = (e3) => (Fr = Sr.Ea)(e3), Br = (e3, r4) => (Br = Sr.Fa)(e3, r4), Wr = () => (Wr = Sr.Ga)(), Nr = (e3, r4) => (Nr = Sr.Ha)(e3, r4), Lr = (e3) => (Lr = Sr.Ia)(e3), Ir = (e3) => (Ir = Sr.Ja)(e3), $r = () => ($r = Sr.Ka)();
      return a.stackSave = () => $r(), a.stackRestore = (e3) => Lr(e3), a.stackAlloc = (e3) => Ir(e3), a.setValue = function(e3, r4, t4 = "i8") {
        switch (t4.endsWith("*") && (t4 = "*"), t4) {
          case "i1":
          case "i8":
            x()[e3 >>> 0] = r4;
            break;
          case "i16":
            F()[e3 >>> 1 >>> 0] = r4;
            break;
          case "i32":
            B()[e3 >>> 2 >>> 0] = r4;
            break;
          case "i64":
            S[e3 >>> 3] = BigInt(r4);
            break;
          case "float":
            N()[e3 >>> 2 >>> 0] = r4;
            break;
          case "double":
            L()[e3 >>> 3 >>> 0] = r4;
            break;
          case "*":
            W()[e3 >>> 2 >>> 0] = r4;
            break;
          default:
            Q(`invalid type for setValue: ${t4}`);
        }
      }, a.getValue = function(e3, r4 = "i8") {
        switch (r4.endsWith("*") && (r4 = "*"), r4) {
          case "i1":
          case "i8":
            return x()[e3 >>> 0];
          case "i16":
            return F()[e3 >>> 1 >>> 0];
          case "i32":
            return B()[e3 >>> 2 >>> 0];
          case "i64":
            return S[e3 >>> 3];
          case "float":
            return N()[e3 >>> 2 >>> 0];
          case "double":
            return L()[e3 >>> 3 >>> 0];
          case "*":
            return W()[e3 >>> 2 >>> 0];
          default:
            Q(`invalid type for getValue: ${r4}`);
        }
      }, a.UTF8ToString = Ae, a.stringToUTF8 = Ee, a.lengthBytesUTF8 = (e3) => {
        for (var r4 = 0, t4 = 0; t4 < e3.length; ++t4) {
          var n2 = e3.charCodeAt(t4);
          127 >= n2 ? r4++ : 2047 >= n2 ? r4 += 2 : 55296 <= n2 && 57343 >= n2 ? (r4 += 4, ++t4) : r4 += 3;
        }
        return r4;
      }, function e3() {
        if (0 < j) z = e3;
        else if (u) t3(a), G();
        else {
          for (; 0 < Z.length; ) Z.shift()(a);
          0 < j ? z = e3 : (a.calledRun = true, R || (G(), t3(a)));
        }
      }(), a.PTR_SIZE = 4, i;
    });
    ort_wasm_simd_threaded_default = r2;
    t2 = globalThis.self?.name?.startsWith("em-pthread");
    t2 && r2();
  }
});

// web/lib/wasm/wasm-utils-import.ts
var origin, isEsmImportMetaUrlHardcodedAsFileUri, getScriptSrc, scriptSrc, inferWasmPathPrefixFromScriptSrc, isSameOrigin, normalizeUrl, fallbackUrl, preload, dynamicImportDefault, createProxyWorker, embeddedWasmModule, temp, importWasmModule;
var init_wasm_utils_import = __esm({
  "web/lib/wasm/wasm-utils-import.ts"() {
    "use strict";
    init_wasm_utils_env();
    origin = isNode || typeof location === "undefined" ? void 0 : location.origin;
    isEsmImportMetaUrlHardcodedAsFileUri = import.meta.url > "file:" && import.meta.url < "file;";
    getScriptSrc = () => {
      if (isNode) {
        return void 0;
      }
      if (true) {
        if (isEsmImportMetaUrlHardcodedAsFileUri) {
          const URL2 = URL;
          return new URL(new URL2("ort.wasm.bundle.mjs", import.meta.url).href, origin).href;
        }
        return import.meta.url;
      }
      return typeof document !== "undefined" ? document.currentScript?.src : (
        // use `self.location.href` if available
        typeof self !== "undefined" ? self.location?.href : void 0
      );
    };
    scriptSrc = getScriptSrc();
    inferWasmPathPrefixFromScriptSrc = () => {
      if (scriptSrc && !scriptSrc.startsWith("blob:")) {
        return scriptSrc.substring(0, scriptSrc.lastIndexOf("/") + 1);
      }
      return void 0;
    };
    isSameOrigin = (filename, prefixOverride) => {
      try {
        const baseUrl = prefixOverride ?? scriptSrc;
        const url = baseUrl ? new URL(filename, baseUrl) : new URL(filename);
        return url.origin === origin;
      } catch {
        return false;
      }
    };
    normalizeUrl = (filename, prefixOverride) => {
      const baseUrl = prefixOverride ?? scriptSrc;
      try {
        const url = baseUrl ? new URL(filename, baseUrl) : new URL(filename);
        return url.href;
      } catch {
        return void 0;
      }
    };
    fallbackUrl = (filename, prefixOverride) => `${prefixOverride ?? "./"}${filename}`;
    preload = async (absoluteUrl) => {
      const response = await fetch(absoluteUrl, { credentials: "same-origin" });
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    };
    dynamicImportDefault = async (url) => (await import(
      /* webpackIgnore: true */
      url
    )).default;
    createProxyWorker = // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
    true ? void 0 : null.default;
    embeddedWasmModule = true ? (
      // eslint-disable-next-line @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
      (false ? (init_ort_wasm_simd_threaded_jsep(), __toCommonJS(ort_wasm_simd_threaded_jsep_exports)) : (init_ort_wasm_simd_threaded(), __toCommonJS(ort_wasm_simd_threaded_exports))).default
    ) : void 0;
    temp = true;
    importWasmModule = async (urlOverride, prefixOverride, isMultiThreaded) => {
      if (temp || !urlOverride && !prefixOverride && embeddedWasmModule && scriptSrc && isSameOrigin(scriptSrc)) {
        return [void 0, embeddedWasmModule];
      } else {
        const wasmModuleFilename = false ? "ort-wasm-simd-threaded.jsep.mjs" : "ort-wasm-simd-threaded.mjs";
        const wasmModuleUrl = urlOverride ?? normalizeUrl(wasmModuleFilename, prefixOverride);
        const needPreload = !isNode && isMultiThreaded && wasmModuleUrl && !isSameOrigin(wasmModuleUrl, prefixOverride);
        const url = needPreload ? await preload(wasmModuleUrl) : wasmModuleUrl ?? fallbackUrl(wasmModuleFilename, prefixOverride);
        return [needPreload ? url : void 0, await dynamicImportDefault(url)];
      }
    };
  }
});

// web/lib/wasm/wasm-factory.ts
var wasm, initialized, initializing, aborted, isMultiThreadSupported, isSimdSupported, isRelaxedSimdSupported, initializeWebAssembly, getInstance;
var init_wasm_factory = __esm({
  "web/lib/wasm/wasm-factory.ts"() {
    "use strict";
    init_wasm_utils_import();
    initialized = false;
    initializing = false;
    aborted = false;
    isMultiThreadSupported = () => {
      if (typeof SharedArrayBuffer === "undefined") {
        return false;
      }
      try {
        if (typeof MessageChannel !== "undefined") {
          new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));
        }
        return WebAssembly.validate(
          new Uint8Array([
            0,
            97,
            115,
            109,
            1,
            0,
            0,
            0,
            1,
            4,
            1,
            96,
            0,
            0,
            3,
            2,
            1,
            0,
            5,
            4,
            1,
            3,
            1,
            1,
            10,
            11,
            1,
            9,
            0,
            65,
            0,
            254,
            16,
            2,
            0,
            26,
            11
          ])
        );
      } catch (e3) {
        return false;
      }
    };
    isSimdSupported = () => {
      try {
        return WebAssembly.validate(
          new Uint8Array([
            0,
            97,
            115,
            109,
            1,
            0,
            0,
            0,
            1,
            4,
            1,
            96,
            0,
            0,
            3,
            2,
            1,
            0,
            10,
            30,
            1,
            28,
            0,
            65,
            0,
            253,
            15,
            253,
            12,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            0,
            253,
            186,
            1,
            26,
            11
          ])
        );
      } catch (e3) {
        return false;
      }
    };
    isRelaxedSimdSupported = () => {
      try {
        return WebAssembly.validate(
          new Uint8Array([
            0,
            97,
            115,
            109,
            1,
            0,
            0,
            0,
            1,
            5,
            1,
            96,
            0,
            1,
            123,
            3,
            2,
            1,
            0,
            10,
            19,
            1,
            17,
            0,
            65,
            1,
            253,
            15,
            65,
            2,
            253,
            15,
            65,
            3,
            253,
            15,
            253,
            147,
            2,
            11
          ])
        );
      } catch (e3) {
        return false;
      }
    };
    initializeWebAssembly = async (flags) => {
      if (initialized) {
        return Promise.resolve();
      }
      if (initializing) {
        throw new Error("multiple calls to 'initializeWebAssembly()' detected.");
      }
      if (aborted) {
        throw new Error("previous call to 'initializeWebAssembly()' failed.");
      }
      initializing = true;
      const timeout = flags.initTimeout;
      let numThreads = flags.numThreads;
      if (flags.simd === false) {
      } else if (flags.simd === "relaxed") {
        if (!isRelaxedSimdSupported()) {
          throw new Error("Relaxed WebAssembly SIMD is not supported in the current environment.");
        }
      } else if (!isSimdSupported()) {
        throw new Error("WebAssembly SIMD is not supported in the current environment.");
      }
      const multiThreadSupported = isMultiThreadSupported();
      if (numThreads > 1 && !multiThreadSupported) {
        if (typeof self !== "undefined" && !self.crossOriginIsolated) {
          console.warn(
            "env.wasm.numThreads is set to " + numThreads + ", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."
          );
        }
        console.warn(
          "WebAssembly multi-threading is not supported in the current environment. Falling back to single-threading."
        );
        flags.numThreads = numThreads = 1;
      }
      const wasmPaths = flags.wasmPaths;
      const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;
      const mjsPathOverrideFlag = wasmPaths?.mjs;
      const mjsPathOverride = mjsPathOverrideFlag?.href ?? mjsPathOverrideFlag;
      const wasmPathOverrideFlag = wasmPaths?.wasm;
      const wasmPathOverride = wasmPathOverrideFlag?.href ?? wasmPathOverrideFlag;
      const wasmBinaryOverride = flags.wasmBinary;
      const [objectUrl, ortWasmFactory] = await importWasmModule(mjsPathOverride, wasmPrefixOverride, numThreads > 1);
      let isTimeout = false;
      const tasks = [];
      if (timeout > 0) {
        tasks.push(
          new Promise((resolve) => {
            setTimeout(() => {
              isTimeout = true;
              resolve();
            }, timeout);
          })
        );
      }
      tasks.push(
        new Promise((resolve, reject) => {
          const config = {
            /**
             * The number of threads. WebAssembly will create (Module.numThreads - 1) workers. If it is 1, no worker will be
             * created.
             */
            numThreads
          };
          if (wasmBinaryOverride) {
            config.wasmBinary = wasmBinaryOverride;
          } else if (wasmPathOverride || wasmPrefixOverride) {
            config.locateFile = (fileName) => wasmPathOverride ?? wasmPrefixOverride + fileName;
          } else if (mjsPathOverride && mjsPathOverride.indexOf("blob:") !== 0) {
            config.locateFile = (fileName) => new URL(fileName, mjsPathOverride).href;
          } else if (objectUrl) {
            const inferredWasmPathPrefix = inferWasmPathPrefixFromScriptSrc();
            if (inferredWasmPathPrefix) {
              config.locateFile = (fileName) => inferredWasmPathPrefix + fileName;
            }
          }
          if (flags.instantiateWasm) {
            config.instantiateWasm = flags.instantiateWasm;
          }
          ortWasmFactory(config).then(
            // wasm module initialized successfully
            (module) => {
              initializing = false;
              initialized = true;
              wasm = module;
              resolve();
              if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
              }
            },
            // wasm module failed to initialize
            (what) => {
              initializing = false;
              aborted = true;
              reject(what);
            }
          );
        })
      );
      await Promise.race(tasks);
      if (isTimeout) {
        throw new Error(`WebAssembly backend initializing failed due to timeout: ${timeout}ms`);
      }
    };
    getInstance = () => {
      if (initialized && wasm) {
        return wasm;
      }
      throw new Error("WebAssembly is not initialized yet.");
    };
  }
});

// web/lib/wasm/wasm-utils.ts
var allocWasmString, iterateExtraOptions, checkLastError;
var init_wasm_utils = __esm({
  "web/lib/wasm/wasm-utils.ts"() {
    "use strict";
    init_wasm_factory();
    allocWasmString = (data, allocs) => {
      const wasm2 = getInstance();
      const dataLength = wasm2.lengthBytesUTF8(data) + 1;
      const dataOffset = wasm2._malloc(dataLength);
      wasm2.stringToUTF8(data, dataOffset, dataLength);
      allocs.push(dataOffset);
      return dataOffset;
    };
    iterateExtraOptions = (options, prefix, seen, handler) => {
      if (typeof options == "object" && options !== null) {
        if (seen.has(options)) {
          throw new Error("Circular reference in options");
        } else {
          seen.add(options);
        }
      }
      Object.entries(options).forEach(([key, value]) => {
        const name = prefix ? prefix + key : key;
        if (typeof value === "object") {
          iterateExtraOptions(value, name + ".", seen, handler);
        } else if (typeof value === "string" || typeof value === "number") {
          handler(name, value.toString());
        } else if (typeof value === "boolean") {
          handler(name, value ? "1" : "0");
        } else {
          throw new Error(`Can't handle extra config type: ${typeof value}`);
        }
      });
    };
    checkLastError = (message) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const ptrSize = wasm2.PTR_SIZE;
        const paramsOffset = wasm2.stackAlloc(2 * ptrSize);
        wasm2._OrtGetLastError(paramsOffset, paramsOffset + ptrSize);
        const errorCode = Number(wasm2.getValue(paramsOffset, ptrSize === 4 ? "i32" : "i64"));
        const errorMessagePointer = wasm2.getValue(paramsOffset + ptrSize, "*");
        const errorMessage = errorMessagePointer ? wasm2.UTF8ToString(errorMessagePointer) : "";
        throw new Error(`${message} ERROR_CODE: ${errorCode}, ERROR_MESSAGE: ${errorMessage}`);
      } finally {
        wasm2.stackRestore(stack);
      }
    };
  }
});

// web/lib/wasm/run-options.ts
var setRunOptions;
var init_run_options = __esm({
  "web/lib/wasm/run-options.ts"() {
    "use strict";
    init_wasm_factory();
    init_wasm_utils();
    setRunOptions = (options) => {
      const wasm2 = getInstance();
      let runOptionsHandle = 0;
      const allocs = [];
      const runOptions = options || {};
      try {
        if (options?.logSeverityLevel === void 0) {
          runOptions.logSeverityLevel = 2;
        } else if (typeof options.logSeverityLevel !== "number" || !Number.isInteger(options.logSeverityLevel) || options.logSeverityLevel < 0 || options.logSeverityLevel > 4) {
          throw new Error(`log serverity level is not valid: ${options.logSeverityLevel}`);
        }
        if (options?.logVerbosityLevel === void 0) {
          runOptions.logVerbosityLevel = 0;
        } else if (typeof options.logVerbosityLevel !== "number" || !Number.isInteger(options.logVerbosityLevel)) {
          throw new Error(`log verbosity level is not valid: ${options.logVerbosityLevel}`);
        }
        if (options?.terminate === void 0) {
          runOptions.terminate = false;
        }
        let tagDataOffset = 0;
        if (options?.tag !== void 0) {
          tagDataOffset = allocWasmString(options.tag, allocs);
        }
        runOptionsHandle = wasm2._OrtCreateRunOptions(
          runOptions.logSeverityLevel,
          runOptions.logVerbosityLevel,
          !!runOptions.terminate,
          tagDataOffset
        );
        if (runOptionsHandle === 0) {
          checkLastError("Can't create run options.");
        }
        if (options?.extra !== void 0) {
          iterateExtraOptions(options.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {
            const keyDataOffset = allocWasmString(key, allocs);
            const valueDataOffset = allocWasmString(value, allocs);
            if (wasm2._OrtAddRunConfigEntry(runOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
              checkLastError(`Can't set a run config entry: ${key} - ${value}.`);
            }
          });
        }
        return [runOptionsHandle, allocs];
      } catch (e3) {
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        throw e3;
      }
    };
  }
});

// web/lib/wasm/session-options.ts
var getGraphOptimzationLevel, getExecutionMode, appendDefaultOptions, appendSessionConfig, setExecutionProviders, setSessionOptions;
var init_session_options = __esm({
  "web/lib/wasm/session-options.ts"() {
    "use strict";
    init_wasm_factory();
    init_wasm_utils();
    getGraphOptimzationLevel = (graphOptimizationLevel) => {
      switch (graphOptimizationLevel) {
        case "disabled":
          return 0;
        case "basic":
          return 1;
        case "extended":
          return 2;
        case "all":
          return 99;
        default:
          throw new Error(`unsupported graph optimization level: ${graphOptimizationLevel}`);
      }
    };
    getExecutionMode = (executionMode) => {
      switch (executionMode) {
        case "sequential":
          return 0;
        case "parallel":
          return 1;
        default:
          throw new Error(`unsupported execution mode: ${executionMode}`);
      }
    };
    appendDefaultOptions = (options) => {
      if (!options.extra) {
        options.extra = {};
      }
      if (!options.extra.session) {
        options.extra.session = {};
      }
      const session = options.extra.session;
      if (!session.use_ort_model_bytes_directly) {
        session.use_ort_model_bytes_directly = "1";
      }
      if (options.executionProviders && options.executionProviders.some((ep) => (typeof ep === "string" ? ep : ep.name) === "webgpu")) {
        options.enableMemPattern = false;
      }
    };
    appendSessionConfig = (sessionOptionsHandle, key, value, allocs) => {
      const keyDataOffset = allocWasmString(key, allocs);
      const valueDataOffset = allocWasmString(value, allocs);
      if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
        checkLastError(`Can't set a session config entry: ${key} - ${value}.`);
      }
    };
    setExecutionProviders = async (sessionOptionsHandle, executionProviders, allocs) => {
      for (const ep of executionProviders) {
        let epName = typeof ep === "string" ? ep : ep.name;
        const epOptions = [];
        switch (epName) {
          case "webnn":
            epName = "WEBNN";
            if (typeof ep !== "string") {
              const webnnOptions = ep;
              const deviceType = webnnOptions?.deviceType;
              if (deviceType) {
                appendSessionConfig(sessionOptionsHandle, "deviceType", deviceType, allocs);
              }
            }
            break;
          case "webgpu":
            if (false) {
              epName = "WebGPU";
              let customDevice;
              if (typeof ep !== "string") {
                const customOptions = ep;
                if (customOptions.device) {
                  if (typeof GPUDevice !== "undefined" && customOptions.device instanceof GPUDevice) {
                    customDevice = customOptions.device;
                  } else {
                    throw new Error("Invalid GPU device set in WebGPU EP options.");
                  }
                }
              }
              const info = getInstance().webgpuRegisterDevice(customDevice);
              if (info) {
                const [deviceId, instanceHandle, deviceHandle] = info;
                appendEpOption(epOptions, "deviceId", deviceId.toString(), allocs);
                appendEpOption(epOptions, "webgpuInstance", instanceHandle.toString(), allocs);
                appendEpOption(epOptions, "webgpuDevice", deviceHandle.toString(), allocs);
              }
            } else {
              epName = "JS";
              if (typeof ep !== "string") {
                const webgpuOptions = ep;
                if (webgpuOptions?.preferredLayout) {
                  if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {
                    throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${webgpuOptions.preferredLayout}`);
                  }
                  appendSessionConfig(sessionOptionsHandle, "preferredLayout", webgpuOptions.preferredLayout, allocs);
                }
              }
            }
            break;
          case "wasm":
          case "cpu":
            continue;
          default:
            throw new Error(`not supported execution provider: ${epName}`);
        }
        const epNameDataOffset = allocWasmString(epName, allocs);
        const epOptionsCount = epOptions.length;
        let keysOffset = 0;
        let valuesOffset = 0;
        if (epOptionsCount > 0) {
          keysOffset = getInstance()._malloc(epOptionsCount * getInstance().PTR_SIZE);
          allocs.push(keysOffset);
          valuesOffset = getInstance()._malloc(epOptionsCount * getInstance().PTR_SIZE);
          allocs.push(valuesOffset);
          for (let i = 0; i < epOptionsCount; i++) {
            getInstance().setValue(keysOffset + i * getInstance().PTR_SIZE, epOptions[i][0], "*");
            getInstance().setValue(valuesOffset + i * getInstance().PTR_SIZE, epOptions[i][1], "*");
          }
        }
        if (await getInstance()._OrtAppendExecutionProvider(
          sessionOptionsHandle,
          epNameDataOffset,
          keysOffset,
          valuesOffset,
          epOptionsCount
        ) !== 0) {
          checkLastError(`Can't append execution provider: ${epName}.`);
        }
      }
    };
    setSessionOptions = async (options) => {
      const wasm2 = getInstance();
      let sessionOptionsHandle = 0;
      const allocs = [];
      const sessionOptions = options || {};
      appendDefaultOptions(sessionOptions);
      try {
        const graphOptimizationLevel = getGraphOptimzationLevel(sessionOptions.graphOptimizationLevel ?? "all");
        const executionMode = getExecutionMode(sessionOptions.executionMode ?? "sequential");
        const logIdDataOffset = typeof sessionOptions.logId === "string" ? allocWasmString(sessionOptions.logId, allocs) : 0;
        const logSeverityLevel = sessionOptions.logSeverityLevel ?? 2;
        if (!Number.isInteger(logSeverityLevel) || logSeverityLevel < 0 || logSeverityLevel > 4) {
          throw new Error(`log serverity level is not valid: ${logSeverityLevel}`);
        }
        const logVerbosityLevel = sessionOptions.logVerbosityLevel ?? 0;
        if (!Number.isInteger(logVerbosityLevel) || logVerbosityLevel < 0 || logVerbosityLevel > 4) {
          throw new Error(`log verbosity level is not valid: ${logVerbosityLevel}`);
        }
        const optimizedModelFilePathOffset = typeof sessionOptions.optimizedModelFilePath === "string" ? allocWasmString(sessionOptions.optimizedModelFilePath, allocs) : 0;
        sessionOptionsHandle = wasm2._OrtCreateSessionOptions(
          graphOptimizationLevel,
          !!sessionOptions.enableCpuMemArena,
          !!sessionOptions.enableMemPattern,
          executionMode,
          !!sessionOptions.enableProfiling,
          0,
          logIdDataOffset,
          logSeverityLevel,
          logVerbosityLevel,
          optimizedModelFilePathOffset
        );
        if (sessionOptionsHandle === 0) {
          checkLastError("Can't create session options.");
        }
        if (sessionOptions.executionProviders) {
          await setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);
        }
        if (sessionOptions.enableGraphCapture !== void 0) {
          if (typeof sessionOptions.enableGraphCapture !== "boolean") {
            throw new Error(`enableGraphCapture must be a boolean value: ${sessionOptions.enableGraphCapture}`);
          }
          appendSessionConfig(
            sessionOptionsHandle,
            "enableGraphCapture",
            sessionOptions.enableGraphCapture.toString(),
            allocs
          );
        }
        if (sessionOptions.freeDimensionOverrides) {
          for (const [name, value] of Object.entries(sessionOptions.freeDimensionOverrides)) {
            if (typeof name !== "string") {
              throw new Error(`free dimension override name must be a string: ${name}`);
            }
            if (typeof value !== "number" || !Number.isInteger(value) || value < 0) {
              throw new Error(`free dimension override value must be a non-negative integer: ${value}`);
            }
            const nameOffset = allocWasmString(name, allocs);
            if (wasm2._OrtAddFreeDimensionOverride(sessionOptionsHandle, nameOffset, value) !== 0) {
              checkLastError(`Can't set a free dimension override: ${name} - ${value}.`);
            }
          }
        }
        if (sessionOptions.extra !== void 0) {
          iterateExtraOptions(sessionOptions.extra, "", /* @__PURE__ */ new WeakSet(), (key, value) => {
            appendSessionConfig(sessionOptionsHandle, key, value, allocs);
          });
        }
        return [sessionOptionsHandle, allocs];
      } catch (e3) {
        if (sessionOptionsHandle !== 0) {
          if (wasm2._OrtReleaseSessionOptions(sessionOptionsHandle) !== 0) {
            checkLastError("Can't release session options.");
          }
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        throw e3;
      }
    };
  }
});

// web/lib/wasm/wasm-common.ts
var tensorDataTypeStringToEnum, tensorDataTypeEnumToString, calculateTensorSizeInBytes, tensorTypeToTypedArrayConstructor, logLevelStringToEnum, isGpuBufferSupportedType, isMLTensorSupportedType, dataLocationStringToEnum;
var init_wasm_common = __esm({
  "web/lib/wasm/wasm-common.ts"() {
    "use strict";
    tensorDataTypeStringToEnum = (type) => {
      switch (type) {
        case "int8":
          return 3 /* int8 */;
        case "uint8":
          return 2 /* uint8 */;
        case "bool":
          return 9 /* bool */;
        case "int16":
          return 5 /* int16 */;
        case "uint16":
          return 4 /* uint16 */;
        case "int32":
          return 6 /* int32 */;
        case "uint32":
          return 12 /* uint32 */;
        case "float16":
          return 10 /* float16 */;
        case "float32":
          return 1 /* float */;
        case "float64":
          return 11 /* double */;
        case "string":
          return 8 /* string */;
        case "int64":
          return 7 /* int64 */;
        case "uint64":
          return 13 /* uint64 */;
        case "int4":
          return 22 /* int4 */;
        case "uint4":
          return 21 /* uint4 */;
        default:
          throw new Error(`unsupported data type: ${type}`);
      }
    };
    tensorDataTypeEnumToString = (typeProto) => {
      switch (typeProto) {
        case 3 /* int8 */:
          return "int8";
        case 2 /* uint8 */:
          return "uint8";
        case 9 /* bool */:
          return "bool";
        case 5 /* int16 */:
          return "int16";
        case 4 /* uint16 */:
          return "uint16";
        case 6 /* int32 */:
          return "int32";
        case 12 /* uint32 */:
          return "uint32";
        case 10 /* float16 */:
          return "float16";
        case 1 /* float */:
          return "float32";
        case 11 /* double */:
          return "float64";
        case 8 /* string */:
          return "string";
        case 7 /* int64 */:
          return "int64";
        case 13 /* uint64 */:
          return "uint64";
        case 22 /* int4 */:
          return "int4";
        case 21 /* uint4 */:
          return "uint4";
        default:
          throw new Error(`unsupported data type: ${typeProto}`);
      }
    };
    calculateTensorSizeInBytes = (dateType, dimsOrSize) => {
      const elementSize = [
        -1,
        // undefined = 0
        4,
        // float = 1
        1,
        // uint8 = 2
        1,
        // int8 = 3
        2,
        // uint16 = 4
        2,
        // int16 = 5
        4,
        // int32 = 6
        8,
        // int64 = 7
        -1,
        // string = 8
        1,
        // bool = 9
        2,
        // float16 = 10
        8,
        // double = 11
        4,
        // uint32 = 12
        8,
        // uint64 = 13
        -1,
        // complex64 = 14
        -1,
        // complex128 = 15
        -1,
        // bfloat16 = 16
        -1,
        // FLOAT8E4M3FN = 17
        -1,
        // FLOAT8E4M3FNUZ = 18
        -1,
        // FLOAT8E5M2 = 19
        -1,
        // FLOAT8E5M2FNUZ = 20
        0.5,
        // uint4 = 21
        0.5
        // int4 = 22
      ][dateType];
      const size = typeof dimsOrSize === "number" ? dimsOrSize : dimsOrSize.reduce((a, b) => a * b, 1);
      return elementSize > 0 ? Math.ceil(size * elementSize) : void 0;
    };
    tensorTypeToTypedArrayConstructor = (type) => {
      switch (type) {
        case "float16":
          return typeof Float16Array !== "undefined" && Float16Array.from ? Float16Array : Uint16Array;
        case "float32":
          return Float32Array;
        case "uint8":
          return Uint8Array;
        case "int8":
          return Int8Array;
        case "uint16":
          return Uint16Array;
        case "int16":
          return Int16Array;
        case "int32":
          return Int32Array;
        case "bool":
          return Uint8Array;
        case "float64":
          return Float64Array;
        case "uint32":
          return Uint32Array;
        case "int64":
          return BigInt64Array;
        case "uint64":
          return BigUint64Array;
        default:
          throw new Error(`unsupported type: ${type}`);
      }
    };
    logLevelStringToEnum = (logLevel) => {
      switch (logLevel) {
        case "verbose":
          return 0;
        case "info":
          return 1;
        case "warning":
          return 2;
        case "error":
          return 3;
        case "fatal":
          return 4;
        default:
          throw new Error(`unsupported logging level: ${logLevel}`);
      }
    };
    isGpuBufferSupportedType = (type) => type === "float32" || type === "float16" || type === "int32" || type === "int64" || type === "uint32" || type === "uint8" || type === "bool" || type === "uint4" || type === "int4";
    isMLTensorSupportedType = (type) => type === "float32" || type === "float16" || type === "int32" || type === "int64" || type === "uint32" || type === "uint64" || type === "int8" || type === "uint8" || type === "bool" || type === "uint4" || type === "int4";
    dataLocationStringToEnum = (location2) => {
      switch (location2) {
        case "none":
          return 0;
        case "cpu":
          return 1;
        case "cpu-pinned":
          return 2;
        case "texture":
          return 3;
        case "gpu-buffer":
          return 4;
        case "ml-tensor":
          return 5;
        default:
          throw new Error(`unsupported data location: ${location2}`);
      }
    };
  }
});

// web/lib/wasm/wasm-utils-load-file.ts
var loadFile;
var init_wasm_utils_load_file = __esm({
  "web/lib/wasm/wasm-utils-load-file.ts"() {
    "use strict";
    init_wasm_utils_env();
    loadFile = async (file) => {
      if (typeof file === "string") {
        if (isNode) {
          try {
            const { readFile } = __require("node:fs/promises");
            return new Uint8Array(await readFile(file));
          } catch (e3) {
            if (e3.code === "ERR_FS_FILE_TOO_LARGE") {
              const { createReadStream } = __require("node:fs");
              const stream = createReadStream(file);
              const chunks = [];
              for await (const chunk of stream) {
                chunks.push(chunk);
              }
              return new Uint8Array(Buffer.concat(chunks));
            }
            throw e3;
          }
        } else {
          const response = await fetch(file);
          if (!response.ok) {
            throw new Error(`failed to load external data file: ${file}`);
          }
          const contentLengthHeader = response.headers.get("Content-Length");
          const fileSize = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
          if (fileSize < 1073741824) {
            return new Uint8Array(await response.arrayBuffer());
          } else {
            if (!response.body) {
              throw new Error(`failed to load external data file: ${file}, no response body.`);
            }
            const reader = response.body.getReader();
            let buffer;
            try {
              buffer = new ArrayBuffer(fileSize);
            } catch (e3) {
              if (e3 instanceof RangeError) {
                const pages = Math.ceil(fileSize / 65536);
                buffer = new WebAssembly.Memory({ initial: pages, maximum: pages }).buffer;
              } else {
                throw e3;
              }
            }
            let offset = 0;
            while (true) {
              const { done, value } = await reader.read();
              if (done) {
                break;
              }
              const chunkSize = value.byteLength;
              const chunk = new Uint8Array(buffer, offset, chunkSize);
              chunk.set(value);
              offset += chunkSize;
            }
            return new Uint8Array(buffer, 0, fileSize);
          }
        }
      } else if (file instanceof Blob) {
        return new Uint8Array(await file.arrayBuffer());
      } else if (file instanceof Uint8Array) {
        return file;
      } else {
        return new Uint8Array(file);
      }
    };
  }
});

// web/lib/wasm/wasm-core-impl.ts
var initOrt, initRuntime, initEp, activeSessions, getSessionInputOutputCount, getSessionInputOutputMetadata, copyFromExternalBuffer, createSession, releaseSession, prepareInputOutputTensor, run, endProfiling;
var init_wasm_core_impl = __esm({
  "web/lib/wasm/wasm-core-impl.ts"() {
    "use strict";
    init_run_options();
    init_session_options();
    init_wasm_common();
    init_wasm_factory();
    init_wasm_utils();
    init_wasm_utils_load_file();
    initOrt = (numThreads, loggingLevel) => {
      const errorCode = getInstance()._OrtInit(numThreads, loggingLevel);
      if (errorCode !== 0) {
        checkLastError("Can't initialize onnxruntime.");
      }
    };
    initRuntime = async (env3) => {
      initOrt(env3.wasm.numThreads, logLevelStringToEnum(env3.logLevel));
    };
    initEp = async (env3, epName) => {
      getInstance().asyncInit?.();
      if (epName === "webgpu" && false) {
        getInstance().webgpuInit((device) => {
          env3.webgpu.device = device;
        });
      }
      if (false) {
        const initJsep = null.init;
        if (epName === "webgpu" && true) {
          if (typeof navigator === "undefined" || !navigator.gpu) {
            throw new Error("WebGPU is not supported in current environment");
          }
          let adapter = env3.webgpu.adapter;
          if (!adapter) {
            const powerPreference = env3.webgpu.powerPreference;
            if (powerPreference !== void 0 && powerPreference !== "low-power" && powerPreference !== "high-performance") {
              throw new Error(`Invalid powerPreference setting: "${powerPreference}"`);
            }
            const forceFallbackAdapter = env3.webgpu.forceFallbackAdapter;
            if (forceFallbackAdapter !== void 0 && typeof forceFallbackAdapter !== "boolean") {
              throw new Error(`Invalid forceFallbackAdapter setting: "${forceFallbackAdapter}"`);
            }
            adapter = await navigator.gpu.requestAdapter({ powerPreference, forceFallbackAdapter });
            if (!adapter) {
              throw new Error(
                'Failed to get GPU adapter. You may need to enable flag "--enable-unsafe-webgpu" if you are using Chrome.'
              );
            }
          } else {
            if (typeof adapter.limits !== "object" || typeof adapter.features !== "object" || typeof adapter.requestDevice !== "function") {
              throw new Error("Invalid GPU adapter set in `env.webgpu.adapter`. It must be a GPUAdapter object.");
            }
          }
          await initJsep("webgpu", getInstance(), env3, adapter);
        }
        if (epName === "webnn") {
          if (typeof navigator === "undefined" || !navigator.ml) {
            throw new Error("WebNN is not supported in current environment");
          }
          await initJsep("webnn", getInstance(), env3);
        }
      }
    };
    activeSessions = /* @__PURE__ */ new Map();
    getSessionInputOutputCount = (sessionHandle) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      try {
        const ptrSize = wasm2.PTR_SIZE;
        const dataOffset = wasm2.stackAlloc(2 * ptrSize);
        const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + ptrSize);
        if (errorCode !== 0) {
          checkLastError("Can't get session input/output count.");
        }
        const type = ptrSize === 4 ? "i32" : "i64";
        return [Number(wasm2.getValue(dataOffset, type)), Number(wasm2.getValue(dataOffset + ptrSize, type))];
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    getSessionInputOutputMetadata = (sessionHandle, index) => {
      const wasm2 = getInstance();
      const stack = wasm2.stackSave();
      let metadataOffset = 0;
      try {
        const ptrSize = wasm2.PTR_SIZE;
        const dataOffset = wasm2.stackAlloc(2 * ptrSize);
        const errorCode = wasm2._OrtGetInputOutputMetadata(sessionHandle, index, dataOffset, dataOffset + ptrSize);
        if (errorCode !== 0) {
          checkLastError("Can't get session input/output metadata.");
        }
        const nameOffset = Number(wasm2.getValue(dataOffset, "*"));
        metadataOffset = Number(wasm2.getValue(dataOffset + ptrSize, "*"));
        const elementType = wasm2.HEAP32[metadataOffset / 4];
        if (elementType === 0) {
          return [nameOffset, 0];
        }
        const dimsCount = wasm2.HEAPU32[metadataOffset / 4 + 1];
        const dims = [];
        for (let i = 0; i < dimsCount; i++) {
          const symbolicDimNameOffset = Number(wasm2.getValue(metadataOffset + 8 + i * ptrSize, "*"));
          dims.push(
            symbolicDimNameOffset !== 0 ? wasm2.UTF8ToString(symbolicDimNameOffset) : Number(wasm2.getValue(metadataOffset + 8 + (i + dimsCount) * ptrSize, "*"))
          );
        }
        return [nameOffset, elementType, dims];
      } finally {
        wasm2.stackRestore(stack);
        if (metadataOffset !== 0) {
          wasm2._OrtFree(metadataOffset);
        }
      }
    };
    copyFromExternalBuffer = (model) => {
      const wasm2 = getInstance();
      const modelDataOffset = wasm2._malloc(model.byteLength);
      if (modelDataOffset === 0) {
        throw new Error(`Can't create a session. failed to allocate a buffer of size ${model.byteLength}.`);
      }
      wasm2.HEAPU8.set(model, modelDataOffset);
      return [modelDataOffset, model.byteLength];
    };
    createSession = async (modelData, options) => {
      let modelDataOffset, modelDataLength;
      const wasm2 = getInstance();
      if (Array.isArray(modelData)) {
        [modelDataOffset, modelDataLength] = modelData;
      } else if (modelData.buffer === wasm2.HEAPU8.buffer) {
        [modelDataOffset, modelDataLength] = [modelData.byteOffset, modelData.byteLength];
      } else {
        [modelDataOffset, modelDataLength] = copyFromExternalBuffer(modelData);
      }
      let sessionHandle = 0;
      let sessionOptionsHandle = 0;
      let ioBindingHandle = 0;
      let allocs = [];
      const inputNamesUTF8Encoded = [];
      const outputNamesUTF8Encoded = [];
      try {
        [sessionOptionsHandle, allocs] = await setSessionOptions(options);
        if (options?.externalData && wasm2.mountExternalData) {
          const loadingPromises = [];
          for (const file of options.externalData) {
            const path = typeof file === "string" ? file : file.path;
            loadingPromises.push(
              loadFile(typeof file === "string" ? file : file.data).then((data) => {
                wasm2.mountExternalData(path, data);
              })
            );
          }
          await Promise.all(loadingPromises);
        }
        for (const provider of options?.executionProviders ?? []) {
          const providerName = typeof provider === "string" ? provider : provider.name;
          if (providerName === "webnn") {
            wasm2.shouldTransferToMLTensor = false;
            if (typeof provider !== "string") {
              const webnnOptions = provider;
              const context = webnnOptions?.context;
              const gpuDevice = webnnOptions?.gpuDevice;
              const deviceType = webnnOptions?.deviceType;
              const powerPreference = webnnOptions?.powerPreference;
              if (context) {
                wasm2.currentContext = context;
              } else if (gpuDevice) {
                wasm2.currentContext = await wasm2.webnnCreateMLContext(gpuDevice);
              } else {
                wasm2.currentContext = await wasm2.webnnCreateMLContext({ deviceType, powerPreference });
              }
            } else {
              wasm2.currentContext = await wasm2.webnnCreateMLContext();
            }
            break;
          }
        }
        sessionHandle = await wasm2._OrtCreateSession(modelDataOffset, modelDataLength, sessionOptionsHandle);
        wasm2.webgpuOnCreateSession?.(sessionHandle);
        if (sessionHandle === 0) {
          checkLastError("Can't create a session.");
        }
        wasm2.jsepOnCreateSession?.();
        if (wasm2.currentContext) {
          wasm2.webnnRegisterMLContext(sessionHandle, wasm2.currentContext);
          wasm2.currentContext = void 0;
          wasm2.shouldTransferToMLTensor = true;
        }
        const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);
        const enableGraphCapture = !!options?.enableGraphCapture;
        const inputNames = [];
        const outputNames = [];
        const inputMetadata = [];
        const outputMetadata = [];
        const outputPreferredLocations = [];
        for (let i = 0; i < inputCount; i++) {
          const [nameOffset, elementType, shape] = getSessionInputOutputMetadata(sessionHandle, i);
          if (nameOffset === 0) {
            checkLastError("Can't get an input name.");
          }
          inputNamesUTF8Encoded.push(nameOffset);
          const name = wasm2.UTF8ToString(nameOffset);
          inputNames.push(name);
          inputMetadata.push(
            elementType === 0 ? { name, isTensor: false } : { name, isTensor: true, type: tensorDataTypeEnumToString(elementType), shape }
          );
        }
        for (let i = 0; i < outputCount; i++) {
          const [nameOffset, elementType, shape] = getSessionInputOutputMetadata(sessionHandle, i + inputCount);
          if (nameOffset === 0) {
            checkLastError("Can't get an output name.");
          }
          outputNamesUTF8Encoded.push(nameOffset);
          const nameString = wasm2.UTF8ToString(nameOffset);
          outputNames.push(nameString);
          outputMetadata.push(
            elementType === 0 ? { name: nameString, isTensor: false } : { name: nameString, isTensor: true, type: tensorDataTypeEnumToString(elementType), shape }
          );
          if (false) {
            if (enableGraphCapture && options?.preferredOutputLocation === void 0) {
              outputPreferredLocations.push("gpu-buffer");
              continue;
            }
            const location2 = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";
            const isGraphOutput = wasm2.webnnIsGraphOutput;
            if (location2 === "cpu" && isGraphOutput && isGraphOutput(sessionHandle, nameString)) {
              outputPreferredLocations.push("ml-tensor-cpu-output");
              continue;
            }
            if (location2 !== "cpu" && location2 !== "cpu-pinned" && location2 !== "gpu-buffer" && location2 !== "ml-tensor") {
              throw new Error(`Not supported preferred output location: ${location2}.`);
            }
            if (enableGraphCapture && location2 !== "gpu-buffer") {
              throw new Error(
                `Not supported preferred output location: ${location2}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`
              );
            }
            outputPreferredLocations.push(location2);
          }
        }
        let bindingState = null;
        if (false) {
          ioBindingHandle = wasm2._OrtCreateBinding(sessionHandle);
          if (ioBindingHandle === 0) {
            checkLastError("Can't create IO binding.");
          }
          bindingState = {
            handle: ioBindingHandle,
            outputPreferredLocations,
            outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => l === "ml-tensor-cpu-output" ? "ml-tensor" : l).map((l) => dataLocationStringToEnum(l))
          };
        }
        activeSessions.set(sessionHandle, [
          sessionHandle,
          inputNamesUTF8Encoded,
          outputNamesUTF8Encoded,
          bindingState,
          enableGraphCapture,
          false
        ]);
        return [sessionHandle, inputNames, outputNames, inputMetadata, outputMetadata];
      } catch (e3) {
        inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
        outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
        if (ioBindingHandle !== 0) {
          if (wasm2._OrtReleaseBinding(ioBindingHandle) !== 0) {
            checkLastError("Can't release IO binding.");
          }
        }
        if (sessionHandle !== 0) {
          if (wasm2._OrtReleaseSession(sessionHandle) !== 0) {
            checkLastError("Can't release session.");
          }
        }
        throw e3;
      } finally {
        wasm2._free(modelDataOffset);
        if (sessionOptionsHandle !== 0) {
          if (wasm2._OrtReleaseSessionOptions(sessionOptionsHandle) !== 0) {
            checkLastError("Can't release session options.");
          }
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        wasm2.unmountExternalData?.();
      }
    };
    releaseSession = (sessionId) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error(`cannot release session. invalid session id: ${sessionId}`);
      }
      const [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture] = session;
      if (ioBindingState) {
        if (enableGraphCapture) {
          if (wasm2._OrtClearBoundOutputs(ioBindingState.handle) !== 0) {
            checkLastError("Can't clear bound outputs.");
          }
        }
        if (wasm2._OrtReleaseBinding(ioBindingState.handle) !== 0) {
          checkLastError("Can't release IO binding.");
        }
      }
      wasm2.jsepOnReleaseSession?.(sessionId);
      wasm2.webnnOnReleaseSession?.(sessionId);
      wasm2.webgpuOnReleaseSession?.(sessionId);
      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      if (wasm2._OrtReleaseSession(sessionHandle) !== 0) {
        checkLastError("Can't release session.");
      }
      activeSessions.delete(sessionId);
    };
    prepareInputOutputTensor = async (tensor, tensorHandles, allocs, sessionId, tensorNameUTF8Encoded, index, enableGraphCapture = false) => {
      if (!tensor) {
        tensorHandles.push(0);
        return;
      }
      const wasm2 = getInstance();
      const ptrSize = wasm2.PTR_SIZE;
      const dataType = tensor[0];
      const dims = tensor[1];
      const location2 = tensor[3];
      let actualLocation = location2;
      let rawData;
      let dataByteLength;
      if (dataType === "string" && (location2 === "gpu-buffer" || location2 === "ml-tensor")) {
        throw new Error("String tensor is not supported on GPU.");
      }
      if (enableGraphCapture && location2 !== "gpu-buffer") {
        throw new Error(
          `External buffer must be provided for input/output index ${index} when enableGraphCapture is true.`
        );
      }
      if (location2 === "gpu-buffer") {
        const gpuBuffer = tensor[2].gpuBuffer;
        dataByteLength = calculateTensorSizeInBytes(tensorDataTypeStringToEnum(dataType), dims);
        if (false) {
          const registerBuffer = wasm2.webgpuRegisterBuffer;
          if (!registerBuffer) {
            throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');
          }
          rawData = registerBuffer(gpuBuffer, sessionId);
        } else {
          const registerBuffer = wasm2.jsepRegisterBuffer;
          if (!registerBuffer) {
            throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');
          }
          rawData = registerBuffer(sessionId, index, gpuBuffer, dataByteLength);
        }
      } else if (location2 === "ml-tensor") {
        const mlTensor = tensor[2].mlTensor;
        dataByteLength = calculateTensorSizeInBytes(tensorDataTypeStringToEnum(dataType), dims);
        const registerMLTensor = wasm2.webnnRegisterMLTensor;
        if (!registerMLTensor) {
          throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');
        }
        rawData = registerMLTensor(sessionId, mlTensor, tensorDataTypeStringToEnum(dataType), dims);
      } else {
        const data = tensor[2];
        if (Array.isArray(data)) {
          dataByteLength = ptrSize * data.length;
          rawData = wasm2._malloc(dataByteLength);
          allocs.push(rawData);
          for (let i = 0; i < data.length; i++) {
            if (typeof data[i] !== "string") {
              throw new TypeError(`tensor data at index ${i} is not a string`);
            }
            wasm2.setValue(rawData + i * ptrSize, allocWasmString(data[i], allocs), "*");
          }
        } else {
          const isGraphInput = wasm2.webnnIsGraphInput;
          const isGraphOutput = wasm2.webnnIsGraphOutput;
          if (dataType !== "string" && isGraphInput && isGraphOutput) {
            const tensorName = wasm2.UTF8ToString(tensorNameUTF8Encoded);
            if (isGraphInput(sessionId, tensorName) || isGraphOutput(sessionId, tensorName)) {
              const dataTypeEnum = tensorDataTypeStringToEnum(dataType);
              dataByteLength = calculateTensorSizeInBytes(dataTypeEnum, dims);
              actualLocation = "ml-tensor";
              const createTemporaryTensor = wasm2.webnnCreateTemporaryTensor;
              const uploadTensor = wasm2.webnnUploadTensor;
              if (!createTemporaryTensor || !uploadTensor) {
                throw new Error('Tensor location "ml-tensor" is not supported without using WebNN.');
              }
              const tensorId = await createTemporaryTensor(sessionId, dataTypeEnum, dims);
              uploadTensor(tensorId, new Uint8Array(data.buffer, data.byteOffset, data.byteLength));
              rawData = tensorId;
            } else {
              dataByteLength = data.byteLength;
              rawData = wasm2._malloc(dataByteLength);
              allocs.push(rawData);
              wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);
            }
          } else {
            dataByteLength = data.byteLength;
            rawData = wasm2._malloc(dataByteLength);
            allocs.push(rawData);
            wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);
          }
        }
      }
      const stack = wasm2.stackSave();
      const dimsOffset = wasm2.stackAlloc(4 * dims.length);
      try {
        dims.forEach((d, index2) => wasm2.setValue(dimsOffset + index2 * ptrSize, d, ptrSize === 4 ? "i32" : "i64"));
        const tensor2 = wasm2._OrtCreateTensor(
          tensorDataTypeStringToEnum(dataType),
          rawData,
          dataByteLength,
          dimsOffset,
          dims.length,
          dataLocationStringToEnum(actualLocation)
        );
        if (tensor2 === 0) {
          checkLastError(`Can't create tensor for input/output. session=${sessionId}, index=${index}.`);
        }
        tensorHandles.push(tensor2);
      } finally {
        wasm2.stackRestore(stack);
      }
    };
    run = async (sessionId, inputIndices, inputTensors, outputIndices, outputTensors, options) => {
      const wasm2 = getInstance();
      const ptrSize = wasm2.PTR_SIZE;
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error(`cannot run inference. invalid session id: ${sessionId}`);
      }
      const sessionHandle = session[0];
      const inputNamesUTF8Encoded = session[1];
      const outputNamesUTF8Encoded = session[2];
      const ioBindingState = session[3];
      const enableGraphCapture = session[4];
      const inputOutputBound = session[5];
      const inputCount = inputIndices.length;
      const outputCount = outputIndices.length;
      let runOptionsHandle = 0;
      let runOptionsAllocs = [];
      const inputTensorHandles = [];
      const outputTensorHandles = [];
      const inputOutputAllocs = [];
      const beforeRunStack = wasm2.stackSave();
      const inputValuesOffset = wasm2.stackAlloc(inputCount * ptrSize);
      const inputNamesOffset = wasm2.stackAlloc(inputCount * ptrSize);
      const outputValuesOffset = wasm2.stackAlloc(outputCount * ptrSize);
      const outputNamesOffset = wasm2.stackAlloc(outputCount * ptrSize);
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        for (let i = 0; i < inputCount; i++) {
          await prepareInputOutputTensor(
            inputTensors[i],
            inputTensorHandles,
            inputOutputAllocs,
            sessionId,
            inputNamesUTF8Encoded[inputIndices[i]],
            inputIndices[i],
            enableGraphCapture
          );
        }
        for (let i = 0; i < outputCount; i++) {
          await prepareInputOutputTensor(
            outputTensors[i],
            outputTensorHandles,
            inputOutputAllocs,
            sessionId,
            outputNamesUTF8Encoded[outputIndices[i]],
            inputCount + outputIndices[i],
            enableGraphCapture
          );
        }
        for (let i = 0; i < inputCount; i++) {
          wasm2.setValue(inputValuesOffset + i * ptrSize, inputTensorHandles[i], "*");
          wasm2.setValue(inputNamesOffset + i * ptrSize, inputNamesUTF8Encoded[inputIndices[i]], "*");
        }
        for (let i = 0; i < outputCount; i++) {
          wasm2.setValue(outputValuesOffset + i * ptrSize, outputTensorHandles[i], "*");
          wasm2.setValue(outputNamesOffset + i * ptrSize, outputNamesUTF8Encoded[outputIndices[i]], "*");
        }
        if (false) {
          const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;
          if (inputNamesUTF8Encoded.length !== inputCount) {
            throw new Error(
              `input count from feeds (${inputCount}) is expected to be always equal to model's input count (${inputNamesUTF8Encoded.length}).`
            );
          }
          for (let i = 0; i < inputCount; i++) {
            const index = inputIndices[i];
            const errorCode2 = await wasm2._OrtBindInput(handle, inputNamesUTF8Encoded[index], inputTensorHandles[i]);
            if (errorCode2 !== 0) {
              checkLastError(`Can't bind input[${i}] for session=${sessionId}.`);
            }
          }
          for (let i = 0; i < outputCount; i++) {
            const index = outputIndices[i];
            const location2 = outputTensors[i]?.[3];
            if (location2) {
              const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);
              if (errorCode2 !== 0) {
                checkLastError(`Can't bind pre-allocated output[${i}] for session=${sessionId}.`);
              }
            } else {
              const errorCode2 = wasm2._OrtBindOutput(
                handle,
                outputNamesUTF8Encoded[index],
                0,
                outputPreferredLocationsEncoded[index]
              );
              if (errorCode2 !== 0) {
                checkLastError(`Can't bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);
              }
            }
          }
          activeSessions.set(sessionId, [
            sessionHandle,
            inputNamesUTF8Encoded,
            outputNamesUTF8Encoded,
            ioBindingState,
            enableGraphCapture,
            true
          ]);
        }
        wasm2.jsepOnRunStart?.(sessionHandle);
        wasm2.webnnOnRunStart?.(sessionHandle);
        let errorCode;
        if (false) {
          errorCode = await wasm2._OrtRunWithBinding(
            sessionHandle,
            ioBindingState.handle,
            outputCount,
            outputValuesOffset,
            runOptionsHandle
          );
        } else {
          errorCode = await wasm2._OrtRun(
            sessionHandle,
            inputNamesOffset,
            inputValuesOffset,
            inputCount,
            outputNamesOffset,
            outputCount,
            outputValuesOffset,
            runOptionsHandle
          );
        }
        if (errorCode !== 0) {
          checkLastError("failed to call OrtRun().");
        }
        const output = [];
        const outputPromises = [];
        for (let i = 0; i < outputCount; i++) {
          const tensor = Number(wasm2.getValue(outputValuesOffset + i * ptrSize, "*"));
          if (tensor === outputTensorHandles[i]) {
            output.push(outputTensors[i]);
            continue;
          }
          const beforeGetTensorDataStack = wasm2.stackSave();
          const tensorDataOffset = wasm2.stackAlloc(4 * ptrSize);
          let keepOutputTensor = false;
          let type, dataOffset = 0;
          try {
            const errorCode2 = wasm2._OrtGetTensorData(
              tensor,
              tensorDataOffset,
              tensorDataOffset + ptrSize,
              tensorDataOffset + 2 * ptrSize,
              tensorDataOffset + 3 * ptrSize
            );
            if (errorCode2 !== 0) {
              checkLastError(`Can't access output tensor data on index ${i}.`);
            }
            const valueType = ptrSize === 4 ? "i32" : "i64";
            const dataType = Number(wasm2.getValue(tensorDataOffset, valueType));
            dataOffset = wasm2.getValue(tensorDataOffset + ptrSize, "*");
            const dimsOffset = wasm2.getValue(tensorDataOffset + ptrSize * 2, "*");
            const dimsLength = Number(wasm2.getValue(tensorDataOffset + ptrSize * 3, valueType));
            const dims = [];
            for (let i2 = 0; i2 < dimsLength; i2++) {
              dims.push(Number(wasm2.getValue(dimsOffset + i2 * ptrSize, valueType)));
            }
            if (wasm2._OrtFree(dimsOffset) !== 0) {
              checkLastError("Can't free memory for tensor dims.");
            }
            const size = dims.reduce((a, b) => a * b, 1);
            type = tensorDataTypeEnumToString(dataType);
            const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];
            if (type === "string") {
              if (preferredLocation === "gpu-buffer" || preferredLocation === "ml-tensor") {
                throw new Error("String tensor is not supported on GPU.");
              }
              const stringData = [];
              for (let i2 = 0; i2 < size; i2++) {
                const offset = wasm2.getValue(dataOffset + i2 * ptrSize, "*");
                const nextOffset = wasm2.getValue(dataOffset + (i2 + 1) * ptrSize, "*");
                const maxBytesToRead = i2 === size - 1 ? void 0 : nextOffset - offset;
                stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));
              }
              output.push([type, dims, stringData, "cpu"]);
            } else {
              if (preferredLocation === "gpu-buffer" && size > 0) {
                const getBuffer = false ? wasm2.webgpuGetBuffer : wasm2.jsepGetBuffer;
                if (!getBuffer) {
                  throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');
                }
                const gpuBuffer = getBuffer(dataOffset);
                const bufferSize = calculateTensorSizeInBytes(dataType, size);
                if (bufferSize === void 0 || !isGpuBufferSupportedType(type)) {
                  throw new Error(`Unsupported data type: ${type}`);
                }
                keepOutputTensor = true;
                if (false) {
                  wasm2.webgpuRegisterBuffer(gpuBuffer, sessionId, dataOffset);
                  const downloadDataFunction = wasm2.webgpuCreateDownloader(gpuBuffer, bufferSize, sessionId);
                  output.push([
                    type,
                    dims,
                    {
                      gpuBuffer,
                      download: async () => {
                        const arrayBuffer = await downloadDataFunction();
                        const data = new (tensorTypeToTypedArrayConstructor(type))(arrayBuffer);
                        return data;
                      },
                      dispose: () => {
                        if (wasm2._OrtReleaseTensor(tensor) !== 0) {
                          checkLastError("Can't release tensor.");
                        }
                      }
                    },
                    "gpu-buffer"
                  ]);
                } else {
                  output.push([
                    type,
                    dims,
                    {
                      gpuBuffer,
                      download: wasm2.jsepCreateDownloader(gpuBuffer, bufferSize, type),
                      dispose: () => {
                        if (wasm2._OrtReleaseTensor(tensor) !== 0) {
                          checkLastError("Can't release tensor.");
                        }
                      }
                    },
                    "gpu-buffer"
                  ]);
                }
              } else if (preferredLocation === "ml-tensor" && size > 0) {
                const ensureTensor = wasm2.webnnEnsureTensor;
                const isGraphInputOutputTypeSupported = wasm2.webnnIsGraphInputOutputTypeSupported;
                if (!ensureTensor || !isGraphInputOutputTypeSupported) {
                  throw new Error('preferredLocation "ml-tensor" is not supported without using WebNN.');
                }
                const tensorSize = calculateTensorSizeInBytes(dataType, size);
                if (tensorSize === void 0 || !isMLTensorSupportedType(type)) {
                  throw new Error(`Unsupported data type: ${type}`);
                }
                if (!isGraphInputOutputTypeSupported(sessionId, type, false)) {
                  throw new Error(
                    `preferredLocation "ml-tensor" for ${type} output is not supported by current WebNN Context.`
                  );
                }
                const mlTensor = await ensureTensor(sessionId, dataOffset, dataType, dims, false);
                keepOutputTensor = true;
                output.push([
                  type,
                  dims,
                  {
                    mlTensor,
                    download: wasm2.webnnCreateMLTensorDownloader(dataOffset, type),
                    dispose: () => {
                      wasm2.webnnReleaseTensorId(dataOffset);
                      wasm2._OrtReleaseTensor(tensor);
                    }
                  },
                  "ml-tensor"
                ]);
              } else if (preferredLocation === "ml-tensor-cpu-output" && size > 0) {
                const data = wasm2.webnnCreateMLTensorDownloader(dataOffset, type)();
                const index = output.length;
                keepOutputTensor = true;
                outputPromises.push(
                  (async () => {
                    const result = [index, await data];
                    wasm2.webnnReleaseTensorId(dataOffset);
                    wasm2._OrtReleaseTensor(tensor);
                    return result;
                  })()
                );
                output.push([type, dims, [], "cpu"]);
              } else {
                const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);
                const data = new typedArrayConstructor(size);
                new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(
                  wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength)
                );
                output.push([type, dims, data, "cpu"]);
              }
            }
          } finally {
            wasm2.stackRestore(beforeGetTensorDataStack);
            if (type === "string" && dataOffset) {
              wasm2._free(dataOffset);
            }
            if (!keepOutputTensor) {
              wasm2._OrtReleaseTensor(tensor);
            }
          }
        }
        if (ioBindingState && !enableGraphCapture) {
          if (wasm2._OrtClearBoundOutputs(ioBindingState.handle) !== 0) {
            checkLastError("Can't clear bound outputs.");
          }
          activeSessions.set(sessionId, [
            sessionHandle,
            inputNamesUTF8Encoded,
            outputNamesUTF8Encoded,
            ioBindingState,
            enableGraphCapture,
            false
          ]);
        }
        for (const [index, data] of await Promise.all(outputPromises)) {
          output[index][2] = data;
        }
        return output;
      } finally {
        wasm2.webnnOnRunEnd?.(sessionHandle);
        wasm2.stackRestore(beforeRunStack);
        if (false) {
          inputTensors.forEach((t3) => {
            if (t3 && t3[3] === "gpu-buffer") {
              wasm2.webgpuUnregisterBuffer(t3[2].gpuBuffer);
            }
          });
          outputTensors.forEach((t3) => {
            if (t3 && t3[3] === "gpu-buffer") {
              wasm2.webgpuUnregisterBuffer(t3[2].gpuBuffer);
            }
          });
        }
        inputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        outputTensorHandles.forEach((v) => wasm2._OrtReleaseTensor(v));
        inputOutputAllocs.forEach((p) => wasm2._free(p));
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        runOptionsAllocs.forEach((p) => wasm2._free(p));
      }
    };
    endProfiling = (sessionId) => {
      const wasm2 = getInstance();
      const session = activeSessions.get(sessionId);
      if (!session) {
        throw new Error("invalid session id");
      }
      const sessionHandle = session[0];
      const profileFileName = wasm2._OrtEndProfiling(sessionHandle);
      if (profileFileName === 0) {
        checkLastError("Can't get an profile file name.");
      }
      wasm2._OrtFree(profileFileName);
    };
  }
});

// web/lib/wasm/proxy-wrapper.ts
var initializing2, initialized2, aborted2, initializeWebAssemblyAndOrtRuntime, initializeOrtEp, copyFromExternalBuffer2, createSession2, releaseSession2, run2, endProfiling2;
var init_proxy_wrapper = __esm({
  "web/lib/wasm/proxy-wrapper.ts"() {
    "use strict";
    init_esm();
    init_wasm_core_impl();
    init_wasm_factory();
    init_wasm_utils_import();
    initializing2 = false;
    initialized2 = false;
    aborted2 = false;
    initializeWebAssemblyAndOrtRuntime = async () => {
      if (initialized2) {
        return;
      }
      if (initializing2) {
        throw new Error("multiple calls to 'initWasm()' detected.");
      }
      if (aborted2) {
        throw new Error("previous call to 'initWasm()' failed.");
      }
      initializing2 = true;
      if (false) {
        return new Promise((resolve, reject) => {
          proxyWorker?.terminate();
          void importProxyWorker().then(([objectUrl, worker]) => {
            try {
              proxyWorker = worker;
              proxyWorker.onerror = (ev) => reject(ev);
              proxyWorker.onmessage = onProxyWorkerMessage;
              initWasmCallbacks = [resolve, reject];
              const message = { type: "init-wasm", in: env2 };
              if (false) {
                const inferredWasmPathPrefix = inferWasmPathPrefixFromScriptSrc2();
                if (inferredWasmPathPrefix) {
                  message.in.wasm.wasmPaths = inferredWasmPathPrefix;
                }
              }
              if (!message.in.wasm.wasmPaths && (objectUrl || isEsmImportMetaUrlHardcodedAsFileUri2)) {
                message.in.wasm.wasmPaths = {
                  wasm: false ? new URL("ort-wasm-simd-threaded.jsep.wasm", import.meta.url).href : new URL("ort-wasm-simd-threaded.wasm", import.meta.url).href
                };
              }
              proxyWorker.postMessage(message);
              temporaryObjectUrl = objectUrl;
            } catch (e3) {
              reject(e3);
            }
          }, reject);
        });
      } else {
        try {
          await initializeWebAssembly(env2.wasm);
          await initRuntime(env2);
          initialized2 = true;
        } catch (e3) {
          aborted2 = true;
          throw e3;
        } finally {
          initializing2 = false;
        }
      }
    };
    initializeOrtEp = async (epName) => {
      if (false) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("init-ep", [resolve, reject]);
          const message = { type: "init-ep", in: { epName, env: env2 } };
          proxyWorker.postMessage(message);
        });
      } else {
        await initEp(env2, epName);
      }
    };
    copyFromExternalBuffer2 = async (buffer) => {
      if (false) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("copy-from", [resolve, reject]);
          const message = { type: "copy-from", in: { buffer } };
          proxyWorker.postMessage(message, [buffer.buffer]);
        });
      } else {
        return copyFromExternalBuffer(buffer);
      }
    };
    createSession2 = async (model, options) => {
      if (false) {
        if (options?.preferredOutputLocation) {
          throw new Error('session option "preferredOutputLocation" is not supported for proxy.');
        }
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("create", [resolve, reject]);
          const message = { type: "create", in: { model, options: { ...options } } };
          const transferable = [];
          if (model instanceof Uint8Array) {
            transferable.push(model.buffer);
          }
          proxyWorker.postMessage(message, transferable);
        });
      } else {
        return createSession(model, options);
      }
    };
    releaseSession2 = async (sessionId) => {
      if (false) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("release", [resolve, reject]);
          const message = { type: "release", in: sessionId };
          proxyWorker.postMessage(message);
        });
      } else {
        releaseSession(sessionId);
      }
    };
    run2 = async (sessionId, inputIndices, inputs, outputIndices, outputs, options) => {
      if (false) {
        if (inputs.some((t3) => t3[3] !== "cpu")) {
          throw new Error("input tensor on GPU is not supported for proxy.");
        }
        if (outputs.some((t3) => t3)) {
          throw new Error("pre-allocated output tensor is not supported for proxy.");
        }
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("run", [resolve, reject]);
          const serializableInputs = inputs;
          const message = {
            type: "run",
            in: { sessionId, inputIndices, inputs: serializableInputs, outputIndices, options }
          };
          proxyWorker.postMessage(message, extractTransferableBuffers(serializableInputs));
        });
      } else {
        return run(sessionId, inputIndices, inputs, outputIndices, outputs, options);
      }
    };
    endProfiling2 = async (sessionId) => {
      if (false) {
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("end-profiling", [resolve, reject]);
          const message = { type: "end-profiling", in: sessionId };
          proxyWorker.postMessage(message);
        });
      } else {
        endProfiling(sessionId);
      }
    };
  }
});

// web/lib/wasm/session-handler-inference.ts
var encodeTensorMetadata, decodeTensorMetadata, OnnxruntimeWebAssemblySessionHandler;
var init_session_handler_inference = __esm({
  "web/lib/wasm/session-handler-inference.ts"() {
    "use strict";
    init_esm();
    init_proxy_wrapper();
    init_wasm_common();
    init_wasm_utils_env();
    init_wasm_utils_load_file();
    encodeTensorMetadata = (tensor, getName) => {
      switch (tensor.location) {
        case "cpu":
          return [tensor.type, tensor.dims, tensor.data, "cpu"];
        case "gpu-buffer":
          return [tensor.type, tensor.dims, { gpuBuffer: tensor.gpuBuffer }, "gpu-buffer"];
        case "ml-tensor":
          return [tensor.type, tensor.dims, { mlTensor: tensor.mlTensor }, "ml-tensor"];
        default:
          throw new Error(`invalid data location: ${tensor.location} for ${getName()}`);
      }
    };
    decodeTensorMetadata = (tensor) => {
      switch (tensor[3]) {
        case "cpu":
          return new Tensor2(tensor[0], tensor[2], tensor[1]);
        case "gpu-buffer": {
          const dataType = tensor[0];
          if (!isGpuBufferSupportedType(dataType)) {
            throw new Error(`not supported data type: ${dataType} for deserializing GPU tensor`);
          }
          const { gpuBuffer, download, dispose } = tensor[2];
          return Tensor2.fromGpuBuffer(gpuBuffer, { dataType, dims: tensor[1], download, dispose });
        }
        case "ml-tensor": {
          const dataType = tensor[0];
          if (!isMLTensorSupportedType(dataType)) {
            throw new Error(`not supported data type: ${dataType} for deserializing MLTensor tensor`);
          }
          const { mlTensor, download, dispose } = tensor[2];
          return Tensor2.fromMLTensor(mlTensor, { dataType, dims: tensor[1], download, dispose });
        }
        default:
          throw new Error(`invalid data location: ${tensor[3]}`);
      }
    };
    OnnxruntimeWebAssemblySessionHandler = class {
      async fetchModelAndCopyToWasmMemory(path) {
        return copyFromExternalBuffer2(await loadFile(path));
      }
      async loadModel(pathOrBuffer, options) {
        TRACE_FUNC_BEGIN();
        let model;
        if (typeof pathOrBuffer === "string") {
          if (isNode) {
            model = await loadFile(pathOrBuffer);
          } else {
            model = await this.fetchModelAndCopyToWasmMemory(pathOrBuffer);
          }
        } else {
          model = pathOrBuffer;
        }
        [this.sessionId, this.inputNames, this.outputNames, this.inputMetadata, this.outputMetadata] = await createSession2(
          model,
          options
        );
        TRACE_FUNC_END();
      }
      async dispose() {
        return releaseSession2(this.sessionId);
      }
      async run(feeds, fetches, options) {
        TRACE_FUNC_BEGIN();
        const inputArray = [];
        const inputIndices = [];
        Object.entries(feeds).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = this.inputNames.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid input '${name}'`);
          }
          inputArray.push(tensor);
          inputIndices.push(index);
        });
        const outputArray = [];
        const outputIndices = [];
        Object.entries(fetches).forEach((kvp) => {
          const name = kvp[0];
          const tensor = kvp[1];
          const index = this.outputNames.indexOf(name);
          if (index === -1) {
            throw new Error(`invalid output '${name}'`);
          }
          outputArray.push(tensor);
          outputIndices.push(index);
        });
        const inputs = inputArray.map(
          (t3, i) => encodeTensorMetadata(t3, () => `input "${this.inputNames[inputIndices[i]]}"`)
        );
        const outputs = outputArray.map(
          (t3, i) => t3 ? encodeTensorMetadata(t3, () => `output "${this.outputNames[outputIndices[i]]}"`) : null
        );
        const results = await run2(this.sessionId, inputIndices, inputs, outputIndices, outputs, options);
        const resultMap = {};
        for (let i = 0; i < results.length; i++) {
          resultMap[this.outputNames[outputIndices[i]]] = outputArray[i] ?? decodeTensorMetadata(results[i]);
        }
        TRACE_FUNC_END();
        return resultMap;
      }
      startProfiling() {
      }
      endProfiling() {
        void endProfiling2(this.sessionId);
      }
    };
  }
});

// web/lib/backend-wasm.ts
var backend_wasm_exports = {};
__export(backend_wasm_exports, {
  OnnxruntimeWebAssemblyBackend: () => OnnxruntimeWebAssemblyBackend,
  initializeFlags: () => initializeFlags,
  wasmBackend: () => wasmBackend
});
var initializeFlags, OnnxruntimeWebAssemblyBackend, wasmBackend;
var init_backend_wasm = __esm({
  "web/lib/backend-wasm.ts"() {
    "use strict";
    init_esm();
    init_proxy_wrapper();
    init_session_handler_inference();
    initializeFlags = () => {
      if (typeof env2.wasm.initTimeout !== "number" || env2.wasm.initTimeout < 0) {
        env2.wasm.initTimeout = 0;
      }
      const simd = env2.wasm.simd;
      if (typeof simd !== "boolean" && simd !== void 0 && simd !== "fixed" && simd !== "relaxed") {
        console.warn(
          `Property "env.wasm.simd" is set to unknown value "${simd}". Reset it to \`false\` and ignore SIMD feature checking.`
        );
        env2.wasm.simd = false;
      }
      if (typeof env2.wasm.proxy !== "boolean") {
        env2.wasm.proxy = false;
      }
      if (typeof env2.wasm.trace !== "boolean") {
        env2.wasm.trace = false;
      }
      if (typeof env2.wasm.numThreads !== "number" || !Number.isInteger(env2.wasm.numThreads) || env2.wasm.numThreads <= 0) {
        if (typeof self !== "undefined" && !self.crossOriginIsolated) {
          env2.wasm.numThreads = 1;
        } else {
          const numCpuLogicalCores = typeof navigator === "undefined" ? __require("node:os").cpus().length : navigator.hardwareConcurrency;
          env2.wasm.numThreads = Math.min(4, Math.ceil((numCpuLogicalCores || 1) / 2));
        }
      }
    };
    OnnxruntimeWebAssemblyBackend = class {
      /**
       * This function initializes the WebAssembly backend.
       *
       * This function will be called only once for each backend name. It will be called the first time when
       * `ort.InferenceSession.create()` is called with a registered backend name.
       *
       * @param backendName - the registered backend name.
       */
      async init(backendName) {
        initializeFlags();
        await initializeWebAssemblyAndOrtRuntime();
        await initializeOrtEp(backendName);
      }
      async createInferenceSessionHandler(pathOrBuffer, options) {
        const handler = new OnnxruntimeWebAssemblySessionHandler();
        await handler.loadModel(pathOrBuffer, options);
        return handler;
      }
    };
    wasmBackend = new OnnxruntimeWebAssemblyBackend();
  }
});

// web/lib/index.ts
init_esm();
init_esm();
init_esm();

// web/lib/version.ts
var version2 = "1.22.0";

// web/lib/index.ts
var index_default = esm_exports;
if (false) {
  const onnxjsBackend = null.onnxjsBackend;
  registerBackend("webgl", onnxjsBackend, -10);
}
if (true) {
  const wasmBackend2 = (init_backend_wasm(), __toCommonJS(backend_wasm_exports)).wasmBackend;
  if (false) {
    registerBackend("webgpu", wasmBackend2, 5);
    registerBackend("webnn", wasmBackend2, 5);
  }
  registerBackend("cpu", wasmBackend2, 10);
  registerBackend("wasm", wasmBackend2, 10);
}
Object.defineProperty(env2.versions, "web", { value: version2, enumerable: true });
export {
  InferenceSession2 as InferenceSession,
  TRACE,
  TRACE_FUNC_BEGIN,
  TRACE_FUNC_END,
  Tensor2 as Tensor,
  index_default as default,
  env2 as env,
  registerBackend
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vY29tbW9uL2xpYi9iYWNrZW5kLWltcGwudHMiLCAiLi4vLi4vY29tbW9uL2xpYi9iYWNrZW5kLnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvdmVyc2lvbi50cyIsICIuLi8uLi9jb21tb24vbGliL2Vudi1pbXBsLnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvZW52LnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvdGVuc29yLWNvbnZlcnNpb24taW1wbC50cyIsICIuLi8uLi9jb21tb24vbGliL3RlbnNvci1mYWN0b3J5LWltcGwudHMiLCAiLi4vLi4vY29tbW9uL2xpYi90ZW5zb3ItaW1wbC10eXBlLW1hcHBpbmcudHMiLCAiLi4vLi4vY29tbW9uL2xpYi90ZW5zb3ItdXRpbHMtaW1wbC50cyIsICIuLi8uLi9jb21tb24vbGliL3RlbnNvci1pbXBsLnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvdGVuc29yLnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvdHJhY2UudHMiLCAiLi4vLi4vY29tbW9uL2xpYi9pbmZlcmVuY2Utc2Vzc2lvbi1pbXBsLnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvaW5mZXJlbmNlLXNlc3Npb24udHMiLCAiLi4vLi4vY29tbW9uL2xpYi90ZW5zb3ItY29udmVyc2lvbi50cyIsICIuLi8uLi9jb21tb24vbGliL3RlbnNvci1mYWN0b3J5LnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvb25ueC1tb2RlbC50cyIsICIuLi8uLi9jb21tb24vbGliL29ubngtdmFsdWUudHMiLCAiLi4vLi4vY29tbW9uL2xpYi9pbmRleC50cyIsICIuLi9saWIvd2FzbS93YXNtLXV0aWxzLWVudi50cyIsICJvcnQtd2FzbS1zaW1kLXRocmVhZGVkLmpzZXAubWpzIiwgIm9ydC13YXNtLXNpbWQtdGhyZWFkZWQubWpzIiwgIi4uL2xpYi93YXNtL3dhc20tdXRpbHMtaW1wb3J0LnRzIiwgIi4uL2xpYi93YXNtL3dhc20tZmFjdG9yeS50cyIsICIuLi9saWIvd2FzbS93YXNtLXV0aWxzLnRzIiwgIi4uL2xpYi93YXNtL3J1bi1vcHRpb25zLnRzIiwgIi4uL2xpYi93YXNtL3Nlc3Npb24tb3B0aW9ucy50cyIsICIuLi9saWIvd2FzbS93YXNtLWNvbW1vbi50cyIsICIuLi9saWIvd2FzbS93YXNtLXV0aWxzLWxvYWQtZmlsZS50cyIsICIuLi9saWIvd2FzbS93YXNtLWNvcmUtaW1wbC50cyIsICIuLi9saWIvd2FzbS9wcm94eS13cmFwcGVyLnRzIiwgIi4uL2xpYi93YXNtL3Nlc3Npb24taGFuZGxlci1pbmZlcmVuY2UudHMiLCAiLi4vbGliL2JhY2tlbmQtd2FzbS50cyIsICIuLi9saWIvaW5kZXgudHMiLCAiLi4vbGliL3ZlcnNpb24udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgeyBCYWNrZW5kIH0gZnJvbSAnLi9iYWNrZW5kLmpzJztcbmltcG9ydCB7IEluZmVyZW5jZVNlc3Npb24gfSBmcm9tICcuL2luZmVyZW5jZS1zZXNzaW9uLmpzJztcblxuaW50ZXJmYWNlIEJhY2tlbmRJbmZvIHtcbiAgYmFja2VuZDogQmFja2VuZDtcbiAgcHJpb3JpdHk6IG51bWJlcjtcblxuICBpbml0UHJvbWlzZT86IFByb21pc2U8dm9pZD47XG4gIGluaXRpYWxpemVkPzogYm9vbGVhbjtcbiAgYWJvcnRlZD86IGJvb2xlYW47XG4gIGVycm9yPzogc3RyaW5nO1xufVxuXG5jb25zdCBiYWNrZW5kczogTWFwPHN0cmluZywgQmFja2VuZEluZm8+ID0gbmV3IE1hcCgpO1xuY29uc3QgYmFja2VuZHNTb3J0ZWRCeVByaW9yaXR5OiBzdHJpbmdbXSA9IFtdO1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgYmFja2VuZC5cbiAqXG4gKiBAcGFyYW0gbmFtZSAtIHRoZSBuYW1lIGFzIGEga2V5IHRvIGxvb2t1cCBhcyBhbiBleGVjdXRpb24gcHJvdmlkZXIuXG4gKiBAcGFyYW0gYmFja2VuZCAtIHRoZSBiYWNrZW5kIG9iamVjdC5cbiAqIEBwYXJhbSBwcmlvcml0eSAtIGFuIGludGVnZXIgaW5kaWNhdGluZyB0aGUgcHJpb3JpdHkgb2YgdGhlIGJhY2tlbmQuIEhpZ2hlciBudW1iZXIgbWVhbnMgaGlnaGVyIHByaW9yaXR5LiBpZiBwcmlvcml0eVxuICogPCAwLCBpdCB3aWxsIGJlIGNvbnNpZGVyZWQgYXMgYSAnYmV0YScgdmVyc2lvbiBhbmQgd2lsbCBub3QgYmUgdXNlZCBhcyBhIGZhbGxiYWNrIGJhY2tlbmQgYnkgZGVmYXVsdC5cbiAqXG4gKiBAaWdub3JlXG4gKi9cbmV4cG9ydCBjb25zdCByZWdpc3RlckJhY2tlbmQgPSAobmFtZTogc3RyaW5nLCBiYWNrZW5kOiBCYWNrZW5kLCBwcmlvcml0eTogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGlmIChiYWNrZW5kICYmIHR5cGVvZiBiYWNrZW5kLmluaXQgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGJhY2tlbmQuY3JlYXRlSW5mZXJlbmNlU2Vzc2lvbkhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25zdCBjdXJyZW50QmFja2VuZCA9IGJhY2tlbmRzLmdldChuYW1lKTtcbiAgICBpZiAoY3VycmVudEJhY2tlbmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYmFja2VuZHMuc2V0KG5hbWUsIHsgYmFja2VuZCwgcHJpb3JpdHkgfSk7XG4gICAgfSBlbHNlIGlmIChjdXJyZW50QmFja2VuZC5wcmlvcml0eSA+IHByaW9yaXR5KSB7XG4gICAgICAvLyBzYW1lIG5hbWUgaXMgYWxyZWFkeSByZWdpc3RlcmVkIHdpdGggYSBoaWdoZXIgcHJpb3JpdHkuIHNraXAgcmVnaXN0ZXJhdGlvbi5cbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnRCYWNrZW5kLnByaW9yaXR5ID09PSBwcmlvcml0eSkge1xuICAgICAgaWYgKGN1cnJlbnRCYWNrZW5kLmJhY2tlbmQgIT09IGJhY2tlbmQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBjYW5ub3QgcmVnaXN0ZXIgYmFja2VuZCBcIiR7bmFtZX1cIiB1c2luZyBwcmlvcml0eSAke3ByaW9yaXR5fWApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwcmlvcml0eSA+PSAwKSB7XG4gICAgICBjb25zdCBpID0gYmFja2VuZHNTb3J0ZWRCeVByaW9yaXR5LmluZGV4T2YobmFtZSk7XG4gICAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgICAgYmFja2VuZHNTb3J0ZWRCeVByaW9yaXR5LnNwbGljZShpLCAxKTtcbiAgICAgIH1cblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiYWNrZW5kc1NvcnRlZEJ5UHJpb3JpdHkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGJhY2tlbmRzLmdldChiYWNrZW5kc1NvcnRlZEJ5UHJpb3JpdHlbaV0pIS5wcmlvcml0eSA8PSBwcmlvcml0eSkge1xuICAgICAgICAgIGJhY2tlbmRzU29ydGVkQnlQcmlvcml0eS5zcGxpY2UoaSwgMCwgbmFtZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBiYWNrZW5kc1NvcnRlZEJ5UHJpb3JpdHkucHVzaChuYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcignbm90IGEgdmFsaWQgYmFja2VuZCcpO1xufTtcblxuLyoqXG4gKiBUcnkgdG8gcmVzb2x2ZSBhbmQgaW5pdGlhbGl6ZSBhIGJhY2tlbmQuXG4gKlxuICogQHBhcmFtIGJhY2tlbmROYW1lIC0gdGhlIG5hbWUgb2YgdGhlIGJhY2tlbmQuXG4gKiBAcmV0dXJucyB0aGUgYmFja2VuZCBpbnN0YW5jZSBpZiByZXNvbHZlZCBhbmQgaW5pdGlhbGl6ZWQgc3VjY2Vzc2Z1bGx5LCBvciBhbiBlcnJvciBtZXNzYWdlIGlmIGZhaWxlZC5cbiAqL1xuY29uc3QgdHJ5UmVzb2x2ZUFuZEluaXRpYWxpemVCYWNrZW5kID0gYXN5bmMgKGJhY2tlbmROYW1lOiBzdHJpbmcpOiBQcm9taXNlPEJhY2tlbmQgfCBzdHJpbmc+ID0+IHtcbiAgY29uc3QgYmFja2VuZEluZm8gPSBiYWNrZW5kcy5nZXQoYmFja2VuZE5hbWUpO1xuICBpZiAoIWJhY2tlbmRJbmZvKSB7XG4gICAgcmV0dXJuICdiYWNrZW5kIG5vdCBmb3VuZC4nO1xuICB9XG5cbiAgaWYgKGJhY2tlbmRJbmZvLmluaXRpYWxpemVkKSB7XG4gICAgcmV0dXJuIGJhY2tlbmRJbmZvLmJhY2tlbmQ7XG4gIH0gZWxzZSBpZiAoYmFja2VuZEluZm8uYWJvcnRlZCkge1xuICAgIHJldHVybiBiYWNrZW5kSW5mby5lcnJvciE7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgaXNJbml0aWFsaXppbmcgPSAhIWJhY2tlbmRJbmZvLmluaXRQcm9taXNlO1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWlzSW5pdGlhbGl6aW5nKSB7XG4gICAgICAgIGJhY2tlbmRJbmZvLmluaXRQcm9taXNlID0gYmFja2VuZEluZm8uYmFja2VuZC5pbml0KGJhY2tlbmROYW1lKTtcbiAgICAgIH1cbiAgICAgIGF3YWl0IGJhY2tlbmRJbmZvLmluaXRQcm9taXNlO1xuICAgICAgYmFja2VuZEluZm8uaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuIGJhY2tlbmRJbmZvLmJhY2tlbmQ7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKCFpc0luaXRpYWxpemluZykge1xuICAgICAgICBiYWNrZW5kSW5mby5lcnJvciA9IGAke2V9YDtcbiAgICAgICAgYmFja2VuZEluZm8uYWJvcnRlZCA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFja2VuZEluZm8uZXJyb3IhO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBkZWxldGUgYmFja2VuZEluZm8uaW5pdFByb21pc2U7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIFJlc29sdmUgZXhlY3V0aW9uIHByb3ZpZGVycyBmcm9tIHRoZSBzcGVjaWZpYyBzZXNzaW9uIG9wdGlvbnMuXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgLSB0aGUgc2Vzc2lvbiBvcHRpb25zIG9iamVjdC5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgdHVwbGUgb2YgYW4gaW5pdGlhbGl6ZWQgYmFja2VuZCBpbnN0YW5jZSBhbmQgYSBzZXNzaW9uIG9wdGlvbnMgb2JqZWN0IHdpdGhcbiAqIGZpbHRlcmVkIEVQIGxpc3QuXG4gKlxuICogQGlnbm9yZVxuICovXG5leHBvcnQgY29uc3QgcmVzb2x2ZUJhY2tlbmRBbmRFeGVjdXRpb25Qcm92aWRlcnMgPSBhc3luYyAoXG4gIG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMsXG4pOiBQcm9taXNlPFtiYWNrZW5kOiBCYWNrZW5kLCBvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zXT4gPT4ge1xuICAvLyBleHRyYWN0IGJhY2tlbmQgaGludHMgZnJvbSBzZXNzaW9uIG9wdGlvbnNcbiAgY29uc3QgZXBzID0gb3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMgfHwgW107XG4gIGNvbnN0IGJhY2tlbmRIaW50cyA9IGVwcy5tYXAoKGkpID0+ICh0eXBlb2YgaSA9PT0gJ3N0cmluZycgPyBpIDogaS5uYW1lKSk7XG4gIGNvbnN0IGJhY2tlbmROYW1lcyA9IGJhY2tlbmRIaW50cy5sZW5ndGggPT09IDAgPyBiYWNrZW5kc1NvcnRlZEJ5UHJpb3JpdHkgOiBiYWNrZW5kSGludHM7XG5cbiAgLy8gdHJ5IHRvIHJlc29sdmUgYW5kIGluaXRpYWxpemUgYWxsIHJlcXVlc3RlZCBiYWNrZW5kc1xuICBsZXQgYmFja2VuZDogQmFja2VuZCB8IHVuZGVmaW5lZDtcbiAgY29uc3QgZXJyb3JzID0gW107XG4gIGNvbnN0IGF2YWlsYWJsZUJhY2tlbmROYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBmb3IgKGNvbnN0IGJhY2tlbmROYW1lIG9mIGJhY2tlbmROYW1lcykge1xuICAgIGNvbnN0IHJlc29sdmVSZXN1bHQgPSBhd2FpdCB0cnlSZXNvbHZlQW5kSW5pdGlhbGl6ZUJhY2tlbmQoYmFja2VuZE5hbWUpO1xuICAgIGlmICh0eXBlb2YgcmVzb2x2ZVJlc3VsdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgbmFtZTogYmFja2VuZE5hbWUsIGVycjogcmVzb2x2ZVJlc3VsdCB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFiYWNrZW5kKSB7XG4gICAgICAgIGJhY2tlbmQgPSByZXNvbHZlUmVzdWx0O1xuICAgICAgfVxuICAgICAgaWYgKGJhY2tlbmQgPT09IHJlc29sdmVSZXN1bHQpIHtcbiAgICAgICAgYXZhaWxhYmxlQmFja2VuZE5hbWVzLmFkZChiYWNrZW5kTmFtZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgbm8gYmFja2VuZCBpcyBhdmFpbGFibGUsIHRocm93IGVycm9yLlxuICBpZiAoIWJhY2tlbmQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYG5vIGF2YWlsYWJsZSBiYWNrZW5kIGZvdW5kLiBFUlI6ICR7ZXJyb3JzLm1hcCgoZSkgPT4gYFske2UubmFtZX1dICR7ZS5lcnJ9YCkuam9pbignLCAnKX1gKTtcbiAgfVxuXG4gIC8vIGZvciBlYWNoIGV4cGxpY2l0bHkgcmVxdWVzdGVkIGJhY2tlbmQsIGlmIGl0J3Mgbm90IGF2YWlsYWJsZSwgb3V0cHV0IHdhcm5pbmcgbWVzc2FnZS5cbiAgZm9yIChjb25zdCB7IG5hbWUsIGVyciB9IG9mIGVycm9ycykge1xuICAgIGlmIChiYWNrZW5kSGludHMuaW5jbHVkZXMobmFtZSkpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGByZW1vdmluZyByZXF1ZXN0ZWQgZXhlY3V0aW9uIHByb3ZpZGVyIFwiJHtuYW1lfVwiIGZyb20gc2Vzc2lvbiBvcHRpb25zIGJlY2F1c2UgaXQgaXMgbm90IGF2YWlsYWJsZTogJHtlcnJ9YCxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgZmlsdGVyZWRFcHMgPSBlcHMuZmlsdGVyKChpKSA9PiBhdmFpbGFibGVCYWNrZW5kTmFtZXMuaGFzKHR5cGVvZiBpID09PSAnc3RyaW5nJyA/IGkgOiBpLm5hbWUpKTtcblxuICByZXR1cm4gW1xuICAgIGJhY2tlbmQsXG4gICAgbmV3IFByb3h5KG9wdGlvbnMsIHtcbiAgICAgIGdldDogKHRhcmdldCwgcHJvcCkgPT4ge1xuICAgICAgICBpZiAocHJvcCA9PT0gJ2V4ZWN1dGlvblByb3ZpZGVycycpIHtcbiAgICAgICAgICByZXR1cm4gZmlsdGVyZWRFcHM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcCk7XG4gICAgICB9LFxuICAgIH0pLFxuICBdO1xufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHsgSW5mZXJlbmNlU2Vzc2lvbiB9IGZyb20gJy4vaW5mZXJlbmNlLXNlc3Npb24uanMnO1xuaW1wb3J0IHsgT25ueFZhbHVlIH0gZnJvbSAnLi9vbm54LXZhbHVlLmpzJztcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmV4cG9ydCBkZWNsYXJlIG5hbWVzcGFjZSBTZXNzaW9uSGFuZGxlciB7XG4gIHR5cGUgRmVlZHNUeXBlID0geyBbbmFtZTogc3RyaW5nXTogT25ueFZhbHVlIH07XG4gIHR5cGUgRmV0Y2hlc1R5cGUgPSB7IFtuYW1lOiBzdHJpbmddOiBPbm54VmFsdWUgfCBudWxsIH07XG4gIHR5cGUgUmV0dXJuVHlwZSA9IHsgW25hbWU6IHN0cmluZ106IE9ubnhWYWx1ZSB9O1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgc2hhcmVkIFNlc3Npb25IYW5kbGVyIGZ1bmN0aW9uYWxpdHlcbiAqXG4gKiBAaWdub3JlXG4gKi9cbmludGVyZmFjZSBTZXNzaW9uSGFuZGxlciB7XG4gIGRpc3Bvc2UoKTogUHJvbWlzZTx2b2lkPjtcblxuICByZWFkb25seSBpbnB1dE5hbWVzOiByZWFkb25seSBzdHJpbmdbXTtcbiAgcmVhZG9ubHkgb3V0cHV0TmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xuXG4gIHJlYWRvbmx5IGlucHV0TWV0YWRhdGE6IHJlYWRvbmx5IEluZmVyZW5jZVNlc3Npb24uVmFsdWVNZXRhZGF0YVtdO1xuICByZWFkb25seSBvdXRwdXRNZXRhZGF0YTogcmVhZG9ubHkgSW5mZXJlbmNlU2Vzc2lvbi5WYWx1ZU1ldGFkYXRhW107XG59XG5cbi8qKlxuICogUmVwcmVzZW50IGEgaGFuZGxlciBpbnN0YW5jZSBvZiBhbiBpbmZlcmVuY2Ugc2Vzc2lvbi5cbiAqXG4gKiBAaWdub3JlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW5mZXJlbmNlU2Vzc2lvbkhhbmRsZXIgZXh0ZW5kcyBTZXNzaW9uSGFuZGxlciB7XG4gIHN0YXJ0UHJvZmlsaW5nKCk6IHZvaWQ7XG4gIGVuZFByb2ZpbGluZygpOiB2b2lkO1xuXG4gIHJ1bihcbiAgICBmZWVkczogU2Vzc2lvbkhhbmRsZXIuRmVlZHNUeXBlLFxuICAgIGZldGNoZXM6IFNlc3Npb25IYW5kbGVyLkZldGNoZXNUeXBlLFxuICAgIG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxTZXNzaW9uSGFuZGxlci5SZXR1cm5UeXBlPjtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnQgYSBiYWNrZW5kIHRoYXQgcHJvdmlkZXMgaW1wbGVtZW50YXRpb24gb2YgbW9kZWwgaW5mZXJlbmNpbmcuXG4gKlxuICogQGlnbm9yZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEJhY2tlbmQge1xuICAvKipcbiAgICogSW5pdGlhbGl6ZSB0aGUgYmFja2VuZCBhc3luY2hyb25vdXNseS4gU2hvdWxkIHRocm93IHdoZW4gZmFpbGVkLlxuICAgKi9cbiAgaW5pdChiYWNrZW5kTmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPjtcblxuICBjcmVhdGVJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcihcbiAgICB1cmlPckJ1ZmZlcjogc3RyaW5nIHwgVWludDhBcnJheSxcbiAgICBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcj47XG59XG5cbmV4cG9ydCB7IHJlZ2lzdGVyQmFja2VuZCB9IGZyb20gJy4vYmFja2VuZC1pbXBsLmpzJztcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuLy8gVGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBieSAvanMvc2NyaXB0cy91cGRhdGUtdmVyc2lvbi50c1xuLy8gRG8gbm90IG1vZGlmeSBmaWxlIGNvbnRlbnQgbWFudWFsbHkuXG5cbmV4cG9ydCBjb25zdCB2ZXJzaW9uID0gJzEuMjIuMCc7XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7IEVudiB9IGZyb20gJy4vZW52LmpzJztcbmltcG9ydCB7IHZlcnNpb24gfSBmcm9tICcuL3ZlcnNpb24uanMnO1xuXG50eXBlIExvZ0xldmVsVHlwZSA9IEVudlsnbG9nTGV2ZWwnXTtcblxubGV0IGxvZ0xldmVsVmFsdWU6IFJlcXVpcmVkPExvZ0xldmVsVHlwZT4gPSAnd2FybmluZyc7XG5cbmV4cG9ydCBjb25zdCBlbnY6IEVudiA9IHtcbiAgd2FzbToge30gYXMgRW52LldlYkFzc2VtYmx5RmxhZ3MsXG4gIHdlYmdsOiB7fSBhcyBFbnYuV2ViR0xGbGFncyxcbiAgd2ViZ3B1OiB7fSBhcyBFbnYuV2ViR3B1RmxhZ3MsXG4gIHZlcnNpb25zOiB7IGNvbW1vbjogdmVyc2lvbiB9LFxuXG4gIHNldCBsb2dMZXZlbCh2YWx1ZTogTG9nTGV2ZWxUeXBlKSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycgfHwgWyd2ZXJib3NlJywgJ2luZm8nLCAnd2FybmluZycsICdlcnJvcicsICdmYXRhbCddLmluZGV4T2YodmFsdWUpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBsb2dnaW5nIGxldmVsOiAke3ZhbHVlfWApO1xuICAgIH1cbiAgICBsb2dMZXZlbFZhbHVlID0gdmFsdWU7XG4gIH0sXG4gIGdldCBsb2dMZXZlbCgpOiBSZXF1aXJlZDxMb2dMZXZlbFR5cGU+IHtcbiAgICByZXR1cm4gbG9nTGV2ZWxWYWx1ZTtcbiAgfSxcbn07XG5cbi8vIHNldCBwcm9wZXJ0eSAnbG9nTGV2ZWwnIHNvIHRoYXQgdGhleSBjYW4gYmUgY29ycmVjdGx5IHRyYW5zZmVycmVkIHRvIHdvcmtlciBieSBgcG9zdE1lc3NhZ2UoKWAuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZW52LCAnbG9nTGV2ZWwnLCB7IGVudW1lcmFibGU6IHRydWUgfSk7XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7IGVudiBhcyBlbnZJbXBsIH0gZnJvbSAnLi9lbnYtaW1wbC5qcyc7XG5pbXBvcnQgeyBUcnlHZXRHbG9iYWxUeXBlIH0gZnJvbSAnLi90eXBlLWhlbHBlci5qcyc7XG5cbmV4cG9ydCBkZWNsYXJlIG5hbWVzcGFjZSBFbnYge1xuICBleHBvcnQgdHlwZSBXYXNtUGF0aFByZWZpeCA9IHN0cmluZztcbiAgZXhwb3J0IGludGVyZmFjZSBXYXNtRmlsZVBhdGhzIHtcbiAgICAvKipcbiAgICAgKiBTcGVjaWZ5IHRoZSBvdmVycmlkZSBwYXRoIGZvciB0aGUgbWFpbiAud2FzbSBmaWxlLlxuICAgICAqXG4gICAgICogVGhpcyBwYXRoIHNob3VsZCBiZSBhbiBhYnNvbHV0ZSBwYXRoLlxuICAgICAqXG4gICAgICogSWYgbm90IG1vZGlmaWVkLCB0aGUgZmlsZW5hbWUgb2YgdGhlIC53YXNtIGZpbGUgaXM6XG4gICAgICogLSBgb3J0LXdhc20tc2ltZC10aHJlYWRlZC53YXNtYCBmb3IgZGVmYXVsdCBidWlsZFxuICAgICAqIC0gYG9ydC13YXNtLXNpbWQtdGhyZWFkZWQuanNlcC53YXNtYCBmb3IgSlNFUCBidWlsZCAod2l0aCBXZWJHUFUgYW5kIFdlYk5OKVxuICAgICAqL1xuICAgIHdhc20/OiBVUkwgfCBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogU3BlY2lmeSB0aGUgb3ZlcnJpZGUgcGF0aCBmb3IgdGhlIG1haW4gLm1qcyBmaWxlLlxuICAgICAqXG4gICAgICogVGhpcyBwYXRoIHNob3VsZCBiZSBhbiBhYnNvbHV0ZSBwYXRoLlxuICAgICAqXG4gICAgICogSWYgbm90IG1vZGlmaWVkLCB0aGUgZmlsZW5hbWUgb2YgdGhlIC5tanMgZmlsZSBpczpcbiAgICAgKiAtIGBvcnQtd2FzbS1zaW1kLXRocmVhZGVkLm1qc2AgZm9yIGRlZmF1bHQgYnVpbGRcbiAgICAgKiAtIGBvcnQtd2FzbS1zaW1kLXRocmVhZGVkLmpzZXAubWpzYCBmb3IgSlNFUCBidWlsZCAod2l0aCBXZWJHUFUgYW5kIFdlYk5OKVxuICAgICAqL1xuICAgIG1qcz86IFVSTCB8IHN0cmluZztcbiAgfVxuICBleHBvcnQgdHlwZSBXYXNtUHJlZml4T3JGaWxlUGF0aHMgPSBXYXNtUGF0aFByZWZpeCB8IFdhc21GaWxlUGF0aHM7XG4gIGV4cG9ydCBpbnRlcmZhY2UgV2ViQXNzZW1ibHlGbGFncyB7XG4gICAgLyoqXG4gICAgICogc2V0IG9yIGdldCBudW1iZXIgb2YgdGhyZWFkKHMpLiBJZiBvbWl0dGVkIG9yIHNldCB0byAwLCBudW1iZXIgb2YgdGhyZWFkKHMpIHdpbGwgYmUgZGV0ZXJtaW5lZCBieSBzeXN0ZW0uIElmIHNldFxuICAgICAqIHRvIDEsIG5vIHdvcmtlciB0aHJlYWQgd2lsbCBiZSBzcGF3bmVkLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IHdoZW4gV2ViQXNzZW1ibHkgbXVsdGl0aHJlYWQgZmVhdHVyZSBpcyBhdmFpbGFibGUgaW4gY3VycmVudCBjb250ZXh0LlxuICAgICAqXG4gICAgICogQGRlZmF1bHRWYWx1ZSBgMGBcbiAgICAgKi9cbiAgICBudW1UaHJlYWRzPzogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogc2V0IGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRvIGVuYWJsZSBTSU1ELlxuICAgICAqXG4gICAgICogT05OWCBSdW50aW1lIHdpbGwgcGVyZm9ybSBmZWF0dXJlIGRldGVjdGlvbiBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgdGhpcyBwcm9wZXJ0eS4gU3BlY2lmaWNhbGx5LCB3aGVuIHRoZSB2YWx1ZSBpc1xuICAgICAqIHNldCB0bzpcbiAgICAgKiAtIGB1bmRlZmluZWRgLCBgdHJ1ZWAgb3IgYFwiZml4ZWRcImA6IHdpbGwgY2hlY2sgYXZhaWxhYmlsaXR5IG9mIEZpeGVkLXdpZHRoIFNJTUQuXG4gICAgICogLSBgXCJyZWxheGVkXCJgOiB3aWxsIGNoZWNrIGF2YWlsYWJpbGl0eSBvZiBSZWxheGVkIFNJTUQuXG4gICAgICogLSBgZmFsc2VgOiB3aWxsIG5vdCBwZXJmb3JtIFNJTUQgZmVhdHVyZSBjaGVja2luZy5cbiAgICAgKlxuICAgICAqIFNldHRpbmcgdGhpcyBwcm9wZXJ0eSBkb2VzIG5vdCBtYWtlIE9OTlggUnVudGltZSB0byBzd2l0Y2ggdG8gdGhlIGNvcnJlc3BvbmRpbmcgcnVudGltZSBhdXRvbWF0aWNhbGx5LiBVc2VyIG5lZWRcbiAgICAgKiB0byBzZXQgYHdhc21QYXRoc2Agb3IgYHdhc21CaW5hcnlgIHByb3BlcnR5IHRvIGxvYWQgdGhlIGNvcnJlc3BvbmRpbmcgcnVudGltZS5cbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSB3aGVuIFdlYkFzc2VtYmx5IFNJTUQgZmVhdHVyZSBpcyBhdmFpbGFibGUgaW4gY3VycmVudCBjb250ZXh0LlxuICAgICAqXG4gICAgICogQGRlZmF1bHRWYWx1ZSBgdHJ1ZWBcbiAgICAgKi9cbiAgICBzaW1kPzogYm9vbGVhbiB8ICdmaXhlZCcgfCAncmVsYXhlZCc7XG5cbiAgICAvKipcbiAgICAgKiBzZXQgb3IgZ2V0IGEgYm9vbGVhbiB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdG8gZW5hYmxlIHRyYWNlLlxuICAgICAqXG4gICAgICogQGRlZmF1bHRWYWx1ZSBgZmFsc2VgXG4gICAgICpcbiAgICAgKiBAZGVwcmVjYXRlZCBVc2UgYGVudi50cmFjZWAgaW5zdGVhZC4gSWYgYGVudi50cmFjZWAgaXMgc2V0LCB0aGlzIHByb3BlcnR5IHdpbGwgYmUgaWdub3JlZC5cbiAgICAgKi9cbiAgICB0cmFjZT86IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBTZXQgb3IgZ2V0IGEgbnVtYmVyIHNwZWNpZnlpbmcgdGhlIHRpbWVvdXQgZm9yIGluaXRpYWxpemF0aW9uIG9mIFdlYkFzc2VtYmx5IGJhY2tlbmQsIGluIG1pbGxpc2Vjb25kcy4gQSB6ZXJvXG4gICAgICogdmFsdWUgaW5kaWNhdGVzIG5vIHRpbWVvdXQgaXMgc2V0LlxuICAgICAqXG4gICAgICogQGRlZmF1bHRWYWx1ZSBgMGBcbiAgICAgKi9cbiAgICBpbml0VGltZW91dD86IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIFNldCBhIGN1c3RvbSBVUkwgcHJlZml4IHRvIHRoZSAud2FzbS8ubWpzIGZpbGVzLCBvciBhbiBvYmplY3Qgb2Ygb3ZlcnJpZGVzIGZvciBib3RoIC53YXNtLy5tanMgZmlsZS4gVGhlIG92ZXJyaWRlXG4gICAgICogcGF0aCBzaG91bGQgYmUgYW4gYWJzb2x1dGUgcGF0aC5cbiAgICAgKi9cbiAgICB3YXNtUGF0aHM/OiBXYXNtUHJlZml4T3JGaWxlUGF0aHM7XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBjdXN0b20gYnVmZmVyIHdoaWNoIGNvbnRhaW5zIHRoZSBXZWJBc3NlbWJseSBiaW5hcnkuIElmIHRoaXMgcHJvcGVydHkgaXMgc2V0LCB0aGUgYHdhc21QYXRoc2AgcHJvcGVydHkgd2lsbFxuICAgICAqIGJlIGlnbm9yZWQuXG4gICAgICovXG4gICAgd2FzbUJpbmFyeT86IEFycmF5QnVmZmVyTGlrZSB8IFVpbnQ4QXJyYXk7XG5cbiAgICAvKipcbiAgICAgKiBcdTU5ODJcdTY3OUNcdTRFMERcdTRFM0EgbnVsbCwgXHU1MjE5XHU0RjFBXHU3NTMxXHU4RkQ5XHU0RTJBXHU1MUZEXHU2NTcwXHU2NzY1XHU1MkEwXHU4RjdEIG9ubnggXHU3Njg0IHdhc20gXHU2NTg3XHU0RUY2LCBcdThGRDlcdTY1RjZcdTRGMUFcdTVGRkRcdTc1NjVcdTRFMEFcdTk3NjJcdTc2ODQgd2FzbVBhdGhzIFx1NEUwRSB3YXNtQmluYXJ5IFx1NTNDMlx1NjU3MFxuICAgICAqIEBwYXJhbSBpbXBvcnRzIFxuICAgICAqIEBwYXJhbSBzdWNjZXNzQ2FsbGJhY2sgXG4gICAgICogQHJldHVybnMgXG4gICAgICovXG4gICAgaW5zdGFudGlhdGVXYXNtPzogKGltcG9ydHM6IFdlYkFzc2VtYmx5LkltcG9ydHMsIHN1Y2Nlc3NDYWxsYmFjazogKGluc3RhbmNlOiBXZWJBc3NlbWJseS5JbnN0YW5jZSk9PnZvaWQpPT4gdm9pZDtcbiAgICAgIFxuICAgIC8qKlxuICAgICAqIFNldCBvciBnZXQgYSBib29sZWFuIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0byBwcm94eSB0aGUgZXhlY3V0aW9uIG9mIG1haW4gdGhyZWFkIHRvIGEgd29ya2VyIHRocmVhZC5cbiAgICAgKlxuICAgICAqIEBkZWZhdWx0VmFsdWUgYGZhbHNlYFxuICAgICAqL1xuICAgIHByb3h5PzogYm9vbGVhbjtcbiAgfVxuXG4gIGV4cG9ydCBpbnRlcmZhY2UgV2ViR0xGbGFncyB7XG4gICAgLyoqXG4gICAgICogU2V0IG9yIGdldCB0aGUgV2ViR0wgQ29udGV4dCBJRCAod2ViZ2wgb3Igd2ViZ2wyKS5cbiAgICAgKlxuICAgICAqIEBkZWZhdWx0VmFsdWUgYCd3ZWJnbDInYFxuICAgICAqL1xuICAgIGNvbnRleHRJZD86ICd3ZWJnbCcgfCAnd2ViZ2wyJztcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIFdlYkdMIHJlbmRlcmluZyBjb250ZXh0LlxuICAgICAqL1xuICAgIHJlYWRvbmx5IGNvbnRleHQ6IFdlYkdMUmVuZGVyaW5nQ29udGV4dDtcbiAgICAvKipcbiAgICAgKiBTZXQgb3IgZ2V0IHRoZSBtYXhpbXVtIGJhdGNoIHNpemUgZm9yIG1hdG11bC4gMCBtZWFucyB0byBkaXNhYmxlIGJhdGNoaW5nLlxuICAgICAqXG4gICAgICogQGRlcHJlY2F0ZWRcbiAgICAgKi9cbiAgICBtYXRtdWxNYXhCYXRjaFNpemU/OiBudW1iZXI7XG4gICAgLyoqXG4gICAgICogU2V0IG9yIGdldCB0aGUgdGV4dHVyZSBjYWNoZSBtb2RlLlxuICAgICAqXG4gICAgICogQGRlZmF1bHRWYWx1ZSBgJ2Z1bGwnYFxuICAgICAqL1xuICAgIHRleHR1cmVDYWNoZU1vZGU/OiAnaW5pdGlhbGl6ZXJPbmx5JyB8ICdmdWxsJztcbiAgICAvKipcbiAgICAgKiBTZXQgb3IgZ2V0IHRoZSBwYWNrZWQgdGV4dHVyZSBtb2RlXG4gICAgICpcbiAgICAgKiBAZGVmYXVsdFZhbHVlIGBmYWxzZWBcbiAgICAgKi9cbiAgICBwYWNrPzogYm9vbGVhbjtcbiAgICAvKipcbiAgICAgKiBTZXQgb3IgZ2V0IHdoZXRoZXIgZW5hYmxlIGFzeW5jIGRvd25sb2FkLlxuICAgICAqXG4gICAgICogQGRlZmF1bHRWYWx1ZSBgZmFsc2VgXG4gICAgICovXG4gICAgYXN5bmM/OiBib29sZWFuO1xuICB9XG5cbiAgZXhwb3J0IGludGVyZmFjZSBXZWJHcHVQcm9maWxpbmdEYXRhVjFUZW5zb3JNZXRhZGF0YSB7XG4gICAgZGltczogcmVhZG9ubHkgbnVtYmVyW107XG4gICAgZGF0YVR5cGU6IHN0cmluZztcbiAgfVxuICBleHBvcnQgaW50ZXJmYWNlIFdlYkdwdVByb2ZpbGluZ0RhdGFWMSB7XG4gICAgdmVyc2lvbjogMTtcbiAgICBpbnB1dHNNZXRhZGF0YTogcmVhZG9ubHkgV2ViR3B1UHJvZmlsaW5nRGF0YVYxVGVuc29yTWV0YWRhdGFbXTtcbiAgICBvdXRwdXRzTWV0YWRhdGE6IHJlYWRvbmx5IFdlYkdwdVByb2ZpbGluZ0RhdGFWMVRlbnNvck1ldGFkYXRhW107XG4gICAga2VybmVsSWQ6IG51bWJlcjtcbiAgICBrZXJuZWxUeXBlOiBzdHJpbmc7XG4gICAga2VybmVsTmFtZTogc3RyaW5nO1xuICAgIHByb2dyYW1OYW1lOiBzdHJpbmc7XG4gICAgc3RhcnRUaW1lOiBudW1iZXI7XG4gICAgZW5kVGltZTogbnVtYmVyO1xuICB9XG5cbiAgZXhwb3J0IHR5cGUgV2ViR3B1UHJvZmlsaW5nRGF0YSA9IFdlYkdwdVByb2ZpbGluZ0RhdGFWMTtcblxuICBleHBvcnQgaW50ZXJmYWNlIFdlYkdwdUZsYWdzIHtcbiAgICAvKipcbiAgICAgKiBTZXQgb3IgZ2V0IHRoZSBwcm9maWxpbmcgbW9kZS5cbiAgICAgKlxuICAgICAqIEBkZXByZWNhdGVkIFVzZSBgZW52LndlYmdwdS5wcm9maWxpbmcubW9kZWAgaW5zdGVhZC4gSWYgYGVudi53ZWJncHUucHJvZmlsaW5nLm1vZGVgIGlzIHNldCwgdGhpcyBwcm9wZXJ0eSB3aWxsIGJlXG4gICAgICogaWdub3JlZC5cbiAgICAgKi9cbiAgICBwcm9maWxpbmdNb2RlPzogJ29mZicgfCAnZGVmYXVsdCc7XG4gICAgLyoqXG4gICAgICogU2V0IG9yIGdldCB0aGUgcHJvZmlsaW5nIGNvbmZpZ3VyYXRpb24uXG4gICAgICovXG4gICAgcHJvZmlsaW5nOiB7XG4gICAgICAvKipcbiAgICAgICAqIFNldCBvciBnZXQgdGhlIHByb2ZpbGluZyBtb2RlLlxuICAgICAgICpcbiAgICAgICAqIEBkZWZhdWx0VmFsdWUgYCdvZmYnYFxuICAgICAgICovXG4gICAgICBtb2RlPzogJ29mZicgfCAnZGVmYXVsdCc7XG5cbiAgICAgIC8qKlxuICAgICAgICogU2V0IG9yIGdldCBhIGNhbGxiYWNrIGZ1bmN0aW9uIHdoZW4gYSBwcm9maWxpbmcgZGF0YSBpcyByZWNlaXZlZC4gSWYgbm90IHNldCwgdGhlIHByb2ZpbGluZyBkYXRhIHdpbGwgYmVcbiAgICAgICAqIHByaW50ZWQgdG8gY29uc29sZS5cbiAgICAgICAqL1xuICAgICAgb25kYXRhPzogKGRhdGE6IFdlYkdwdVByb2ZpbGluZ0RhdGEpID0+IHZvaWQ7XG4gICAgfTtcbiAgICAvKipcbiAgICAgKiBTZXQgb3IgZ2V0IHRoZSBwb3dlciBwcmVmZXJlbmNlLlxuICAgICAqXG4gICAgICogU2V0dGluZyB0aGlzIHByb3BlcnR5IG9ubHkgaGFzIGVmZmVjdCBiZWZvcmUgdGhlIGZpcnN0IFdlYkdQVSBpbmZlcmVuY2Ugc2Vzc2lvbiBpcyBjcmVhdGVkLiBUaGUgdmFsdWUgd2lsbCBiZVxuICAgICAqIHVzZWQgYXMgb3B0aW9ucyBmb3IgYG5hdmlnYXRvci5ncHUucmVxdWVzdEFkYXB0ZXIoKWAuXG4gICAgICpcbiAgICAgKiBTZWUge0BsaW5rIGh0dHBzOi8vZ3B1d2ViLmdpdGh1Yi5pby9ncHV3ZWIvI2RpY3RkZWYtZ3B1cmVxdWVzdGFkYXB0ZXJvcHRpb25zfSBmb3IgbW9yZSBkZXRhaWxzLlxuICAgICAqXG4gICAgICogQGRlZmF1bHRWYWx1ZSBgdW5kZWZpbmVkYFxuICAgICAqXG4gICAgICogQGRlcHJlY2F0ZWQgQ3JlYXRlIHlvdXIgb3duIEdQVUFkYXB0ZXIsIHVzZSBpdCB0byBjcmVhdGUgYSBHUFVEZXZpY2UgaW5zdGFuY2UgYW5kIHNldCB7QGxpbmsgZGV2aWNlfSBwcm9wZXJ0eSBpZlxuICAgICAqIHlvdSB3YW50IHRvIHVzZSBhIHNwZWNpZmljIHBvd2VyIHByZWZlcmVuY2UuXG4gICAgICovXG4gICAgcG93ZXJQcmVmZXJlbmNlPzogJ2xvdy1wb3dlcicgfCAnaGlnaC1wZXJmb3JtYW5jZSc7XG4gICAgLyoqXG4gICAgICogU2V0IG9yIGdldCB0aGUgZm9yY2UgZmFsbGJhY2sgYWRhcHRlciBmbGFnLlxuICAgICAqXG4gICAgICogU2V0dGluZyB0aGlzIHByb3BlcnR5IG9ubHkgaGFzIGVmZmVjdCBiZWZvcmUgdGhlIGZpcnN0IFdlYkdQVSBpbmZlcmVuY2Ugc2Vzc2lvbiBpcyBjcmVhdGVkLiBUaGUgdmFsdWUgd2lsbCBiZVxuICAgICAqIHVzZWQgYXMgb3B0aW9ucyBmb3IgYG5hdmlnYXRvci5ncHUucmVxdWVzdEFkYXB0ZXIoKWAuXG4gICAgICpcbiAgICAgKiBTZWUge0BsaW5rIGh0dHBzOi8vZ3B1d2ViLmdpdGh1Yi5pby9ncHV3ZWIvI2RpY3RkZWYtZ3B1cmVxdWVzdGFkYXB0ZXJvcHRpb25zfSBmb3IgbW9yZSBkZXRhaWxzLlxuICAgICAqXG4gICAgICogQGRlZmF1bHRWYWx1ZSBgdW5kZWZpbmVkYFxuICAgICAqXG4gICAgICogQGRlcHJlY2F0ZWQgQ3JlYXRlIHlvdXIgb3duIEdQVUFkYXB0ZXIsIHVzZSBpdCB0byBjcmVhdGUgYSBHUFVEZXZpY2UgaW5zdGFuY2UgYW5kIHNldCB7QGxpbmsgZGV2aWNlfSBwcm9wZXJ0eSBpZlxuICAgICAqIHlvdSB3YW50IHRvIHVzZSBhIHNwZWNpZmljIGZhbGxiYWNrIG9wdGlvbi5cbiAgICAgKi9cbiAgICBmb3JjZUZhbGxiYWNrQWRhcHRlcj86IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICogU2V0IG9yIGdldCB0aGUgYWRhcHRlciBmb3IgV2ViR1BVLlxuICAgICAqXG4gICAgICogU2V0dGluZyB0aGlzIHByb3BlcnR5IG9ubHkgaGFzIGVmZmVjdCBiZWZvcmUgdGhlIGZpcnN0IFdlYkdQVSBpbmZlcmVuY2Ugc2Vzc2lvbiBpcyBjcmVhdGVkLiBUaGUgdmFsdWUgd2lsbCBiZVxuICAgICAqIHVzZWQgYXMgdGhlIEdQVSBhZGFwdGVyIGZvciB0aGUgdW5kZXJseWluZyBXZWJHUFUgYmFja2VuZCB0byBjcmVhdGUgR1BVIGRldmljZS5cbiAgICAgKlxuICAgICAqIElmIHRoaXMgcHJvcGVydHkgaXMgbm90IHNldCwgaXQgd2lsbCBiZSBhdmFpbGFibGUgdG8gZ2V0IGFmdGVyIHRoZSBmaXJzdCBXZWJHUFUgaW5mZXJlbmNlIHNlc3Npb24gaXMgY3JlYXRlZC4gVGhlXG4gICAgICogdmFsdWUgd2lsbCBiZSB0aGUgR1BVIGFkYXB0ZXIgdGhhdCBjcmVhdGVkIGJ5IHRoZSB1bmRlcmx5aW5nIFdlYkdQVSBiYWNrZW5kLlxuICAgICAqXG4gICAgICogV2hlbiB1c2Ugd2l0aCBUeXBlU2NyaXB0LCB0aGUgdHlwZSBvZiB0aGlzIHByb3BlcnR5IGlzIGBHUFVBZGFwdGVyYCBkZWZpbmVkIGluIFwiQHdlYmdwdS90eXBlc1wiLlxuICAgICAqXG4gICAgICogQGRlcHJlY2F0ZWQgSXQgaXMgbm8gbG9uZ2VyIHJlY29tbWVuZGVkIHRvIHVzZSB0aGlzIHByb3BlcnR5LiBUaGUgbGF0ZXN0IFdlYkdQVSBzcGVjIGFkZHMgYEdQVURldmljZS5hZGFwdGVySW5mb2BcbiAgICAgKiAoaHR0cHM6Ly93d3cudzMub3JnL1RSL3dlYmdwdS8jZG9tLWdwdWRldmljZS1hZGFwdGVyaW5mbyksIHdoaWNoIGFsbG93cyB0byBnZXQgdGhlIGFkYXB0ZXIgaW5mb3JtYXRpb24gZnJvbSB0aGVcbiAgICAgKiBkZXZpY2UuIFdoZW4gaXQncyBhdmFpbGFibGUsIHRoZXJlIGlzIG5vIG5lZWQgdG8gc2V0L2dldCB0aGUge0BsaW5rIGFkYXB0ZXJ9IHByb3BlcnR5LlxuICAgICAqL1xuICAgIGFkYXB0ZXI6IFRyeUdldEdsb2JhbFR5cGU8J0dQVUFkYXB0ZXInPjtcbiAgICAvKipcbiAgICAgKiBTZXQgb3IgZ2V0IHRoZSBHUFUgZGV2aWNlIGZvciBXZWJHUFUuXG4gICAgICpcbiAgICAgKiBUaGVyZSBhcmUgMyB2YWxpZCBzY2VuYXJpb3Mgb2YgYWNjZXNzaW5nIHRoaXMgcHJvcGVydHk6XG4gICAgICogLSBTZXQgYSB2YWx1ZSBiZWZvcmUgdGhlIGZpcnN0IFdlYkdQVSBpbmZlcmVuY2Ugc2Vzc2lvbiBpcyBjcmVhdGVkLiBUaGUgdmFsdWUgd2lsbCBiZSB1c2VkIGJ5IHRoZSBXZWJHUFUgYmFja2VuZFxuICAgICAqIHRvIHBlcmZvcm0gY2FsY3VsYXRpb25zLiBJZiB0aGUgdmFsdWUgaXMgbm90IGEgYEdQVURldmljZWAgb2JqZWN0LCBhbiBlcnJvciB3aWxsIGJlIHRocm93bi5cbiAgICAgKiAtIEdldCB0aGUgdmFsdWUgYmVmb3JlIHRoZSBmaXJzdCBXZWJHUFUgaW5mZXJlbmNlIHNlc3Npb24gaXMgY3JlYXRlZC4gVGhpcyB3aWxsIHRyeSB0byBjcmVhdGUgYSBuZXcgR1BVRGV2aWNlXG4gICAgICogaW5zdGFuY2UuIFJldHVybnMgYSBgUHJvbWlzZWAgdGhhdCByZXNvbHZlcyB0byBhIGBHUFVEZXZpY2VgIG9iamVjdC5cbiAgICAgKiAtIEdldCB0aGUgdmFsdWUgYWZ0ZXIgdGhlIGZpcnN0IFdlYkdQVSBpbmZlcmVuY2Ugc2Vzc2lvbiBpcyBjcmVhdGVkLiBSZXR1cm5zIGEgcmVzb2x2ZWQgYFByb21pc2VgIHRvIHRoZVxuICAgICAqIGBHUFVEZXZpY2VgIG9iamVjdCB1c2VkIGJ5IHRoZSBXZWJHUFUgYmFja2VuZC5cbiAgICAgKi9cbiAgICBnZXQgZGV2aWNlKCk6IFByb21pc2U8VHJ5R2V0R2xvYmFsVHlwZTwnR1BVRGV2aWNlJz4+O1xuICAgIHNldCBkZXZpY2UodmFsdWU6IFRyeUdldEdsb2JhbFR5cGU8J0dQVURldmljZSc+KTtcbiAgICAvKipcbiAgICAgKiBTZXQgb3IgZ2V0IHdoZXRoZXIgdmFsaWRhdGUgaW5wdXQgY29udGVudC5cbiAgICAgKlxuICAgICAqIEBkZWZhdWx0VmFsdWUgYGZhbHNlYFxuICAgICAqL1xuICAgIHZhbGlkYXRlSW5wdXRDb250ZW50PzogYm9vbGVhbjtcbiAgfVxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEVudiB7XG4gIC8qKlxuICAgKiBzZXQgdGhlIHNldmVyaXR5IGxldmVsIGZvciBsb2dnaW5nLlxuICAgKlxuICAgKiBAZGVmYXVsdFZhbHVlIGAnd2FybmluZydgXG4gICAqL1xuICBsb2dMZXZlbD86ICd2ZXJib3NlJyB8ICdpbmZvJyB8ICd3YXJuaW5nJyB8ICdlcnJvcicgfCAnZmF0YWwnO1xuXG4gIC8qKlxuICAgKiBJbmRpY2F0ZSB3aGV0aGVyIHJ1biBpbiBkZWJ1ZyBtb2RlLlxuICAgKlxuICAgKiBAZGVmYXVsdFZhbHVlIGBmYWxzZWBcbiAgICovXG4gIGRlYnVnPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogc2V0IG9yIGdldCBhIGJvb2xlYW4gdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRvIGVuYWJsZSB0cmFjZS5cbiAgICpcbiAgICogQGRlZmF1bHRWYWx1ZSBgZmFsc2VgXG4gICAqL1xuICB0cmFjZT86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIEdldCB2ZXJzaW9uIG9mIHRoZSBjdXJyZW50IHBhY2thZ2UuXG4gICAqL1xuICByZWFkb25seSB2ZXJzaW9uczoge1xuICAgIHJlYWRvbmx5IGNvbW1vbjogc3RyaW5nO1xuICAgIHJlYWRvbmx5IHdlYj86IHN0cmluZztcbiAgICByZWFkb25seSBub2RlPzogc3RyaW5nO1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb25cbiAgICByZWFkb25seSAncmVhY3QtbmF0aXZlJz86IHN0cmluZztcbiAgfTtcblxuICAvKipcbiAgICogUmVwcmVzZW50IGEgc2V0IG9mIGZsYWdzIGZvciBXZWJBc3NlbWJseVxuICAgKi9cbiAgcmVhZG9ubHkgd2FzbTogRW52LldlYkFzc2VtYmx5RmxhZ3M7XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudCBhIHNldCBvZiBmbGFncyBmb3IgV2ViR0xcbiAgICovXG4gIHJlYWRvbmx5IHdlYmdsOiBFbnYuV2ViR0xGbGFncztcblxuICAvKipcbiAgICogUmVwcmVzZW50IGEgc2V0IG9mIGZsYWdzIGZvciBXZWJHUFVcbiAgICovXG4gIHJlYWRvbmx5IHdlYmdwdTogRW52LldlYkdwdUZsYWdzO1xuXG4gIFtuYW1lOiBzdHJpbmddOiB1bmtub3duO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudCBhIHNldCBvZiBmbGFncyBhcyBhIGdsb2JhbCBzaW5nbGV0b24uXG4gKi9cbmV4cG9ydCBjb25zdCBlbnY6IEVudiA9IGVudkltcGw7XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7IFRlbnNvclRvRGF0YVVybE9wdGlvbnMsIFRlbnNvclRvSW1hZ2VEYXRhT3B0aW9ucyB9IGZyb20gJy4vdGVuc29yLWNvbnZlcnNpb24uanMnO1xuaW1wb3J0IHsgVGVuc29yIH0gZnJvbSAnLi90ZW5zb3IuanMnO1xuXG4vKipcbiAqIGltcGxlbWVudGF0aW9uIG9mIFRlbnNvci50b0RhdGFVUkwoKVxuICovXG5leHBvcnQgY29uc3QgdGVuc29yVG9EYXRhVVJMID0gKHRlbnNvcjogVGVuc29yLCBvcHRpb25zPzogVGVuc29yVG9EYXRhVXJsT3B0aW9ucyk6IHN0cmluZyA9PiB7XG4gIGNvbnN0IGNhbnZhcyA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSA6IG5ldyBPZmZzY3JlZW5DYW52YXMoMSwgMSk7XG4gIGNhbnZhcy53aWR0aCA9IHRlbnNvci5kaW1zWzNdO1xuICBjYW52YXMuaGVpZ2h0ID0gdGVuc29yLmRpbXNbMl07XG4gIGNvbnN0IHBpeGVsczJEQ29udGV4dCA9IGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpIGFzXG4gICAgfCBDYW52YXNSZW5kZXJpbmdDb250ZXh0MkRcbiAgICB8IE9mZnNjcmVlbkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRFxuICAgIHwgbnVsbDtcblxuICBpZiAocGl4ZWxzMkRDb250ZXh0ICE9IG51bGwpIHtcbiAgICAvLyBEZWZhdWx0IHZhbHVlcyBmb3IgaGVpZ2h0IGFuZCB3aWR0aCAmIGZvcm1hdFxuICAgIGxldCB3aWR0aDogbnVtYmVyO1xuICAgIGxldCBoZWlnaHQ6IG51bWJlcjtcbiAgICBpZiAob3B0aW9ucz8udGVuc29yTGF5b3V0ICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy50ZW5zb3JMYXlvdXQgPT09ICdOSFdDJykge1xuICAgICAgd2lkdGggPSB0ZW5zb3IuZGltc1syXTtcbiAgICAgIGhlaWdodCA9IHRlbnNvci5kaW1zWzNdO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEZWZhdWx0IGxheW91dCBpcyBOQ1dIXG4gICAgICB3aWR0aCA9IHRlbnNvci5kaW1zWzNdO1xuICAgICAgaGVpZ2h0ID0gdGVuc29yLmRpbXNbMl07XG4gICAgfVxuXG4gICAgY29uc3QgaW5wdXRmb3JtYXQgPSBvcHRpb25zPy5mb3JtYXQgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuZm9ybWF0IDogJ1JHQic7XG5cbiAgICBjb25zdCBub3JtID0gb3B0aW9ucz8ubm9ybTtcbiAgICBsZXQgbm9ybU1lYW46IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdO1xuICAgIGxldCBub3JtQmlhczogW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XG4gICAgaWYgKG5vcm0gPT09IHVuZGVmaW5lZCB8fCBub3JtLm1lYW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgbm9ybU1lYW4gPSBbMjU1LCAyNTUsIDI1NSwgMjU1XTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBub3JtLm1lYW4gPT09ICdudW1iZXInKSB7XG4gICAgICAgIG5vcm1NZWFuID0gW25vcm0ubWVhbiwgbm9ybS5tZWFuLCBub3JtLm1lYW4sIG5vcm0ubWVhbl07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub3JtTWVhbiA9IFtub3JtLm1lYW5bMF0sIG5vcm0ubWVhblsxXSwgbm9ybS5tZWFuWzJdLCAwXTtcbiAgICAgICAgaWYgKG5vcm0ubWVhblszXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbm9ybU1lYW5bM10gPSBub3JtLm1lYW5bM107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG5vcm0gPT09IHVuZGVmaW5lZCB8fCBub3JtLmJpYXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbm9ybUJpYXMgPSBbMCwgMCwgMCwgMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2Ygbm9ybS5iaWFzID09PSAnbnVtYmVyJykge1xuICAgICAgICBub3JtQmlhcyA9IFtub3JtLmJpYXMsIG5vcm0uYmlhcywgbm9ybS5iaWFzLCBub3JtLmJpYXNdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9ybUJpYXMgPSBbbm9ybS5iaWFzWzBdLCBub3JtLmJpYXNbMV0sIG5vcm0uYmlhc1syXSwgMF07XG4gICAgICAgIGlmIChub3JtLmJpYXNbM10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG5vcm1CaWFzWzNdID0gbm9ybS5iaWFzWzNdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc3RyaWRlID0gaGVpZ2h0ICogd2lkdGg7XG4gICAgLy8gRGVmYXVsdCBwb2ludGVyIGFzc2lnbm1lbnRzXG4gICAgbGV0IHJUZW5zb3JQb2ludGVyID0gMCxcbiAgICAgIGdUZW5zb3JQb2ludGVyID0gc3RyaWRlLFxuICAgICAgYlRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAyLFxuICAgICAgYVRlbnNvclBvaW50ZXIgPSAtMTtcblxuICAgIC8vIFVwZGF0aW5nIHRoZSBwb2ludGVyIGFzc2lnbm1lbnRzIGJhc2VkIG9uIHRoZSBpbnB1dCBpbWFnZSBmb3JtYXRcbiAgICBpZiAoaW5wdXRmb3JtYXQgPT09ICdSR0JBJykge1xuICAgICAgclRlbnNvclBvaW50ZXIgPSAwO1xuICAgICAgZ1RlbnNvclBvaW50ZXIgPSBzdHJpZGU7XG4gICAgICBiVGVuc29yUG9pbnRlciA9IHN0cmlkZSAqIDI7XG4gICAgICBhVGVuc29yUG9pbnRlciA9IHN0cmlkZSAqIDM7XG4gICAgfSBlbHNlIGlmIChpbnB1dGZvcm1hdCA9PT0gJ1JHQicpIHtcbiAgICAgIHJUZW5zb3JQb2ludGVyID0gMDtcbiAgICAgIGdUZW5zb3JQb2ludGVyID0gc3RyaWRlO1xuICAgICAgYlRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAyO1xuICAgIH0gZWxzZSBpZiAoaW5wdXRmb3JtYXQgPT09ICdSQkcnKSB7XG4gICAgICByVGVuc29yUG9pbnRlciA9IDA7XG4gICAgICBiVGVuc29yUG9pbnRlciA9IHN0cmlkZTtcbiAgICAgIGdUZW5zb3JQb2ludGVyID0gc3RyaWRlICogMjtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGhlaWdodDsgaSsrKSB7XG4gICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHdpZHRoOyBqKyspIHtcbiAgICAgICAgY29uc3QgUiA9ICgodGVuc29yLmRhdGFbclRlbnNvclBvaW50ZXIrK10gYXMgbnVtYmVyKSAtIG5vcm1CaWFzWzBdKSAqIG5vcm1NZWFuWzBdOyAvLyBSIHZhbHVlXG4gICAgICAgIGNvbnN0IEcgPSAoKHRlbnNvci5kYXRhW2dUZW5zb3JQb2ludGVyKytdIGFzIG51bWJlcikgLSBub3JtQmlhc1sxXSkgKiBub3JtTWVhblsxXTsgLy8gRyB2YWx1ZVxuICAgICAgICBjb25zdCBCID0gKCh0ZW5zb3IuZGF0YVtiVGVuc29yUG9pbnRlcisrXSBhcyBudW1iZXIpIC0gbm9ybUJpYXNbMl0pICogbm9ybU1lYW5bMl07IC8vIEIgdmFsdWVcbiAgICAgICAgY29uc3QgQSA9IGFUZW5zb3JQb2ludGVyID09PSAtMSA/IDI1NSA6ICgodGVuc29yLmRhdGFbYVRlbnNvclBvaW50ZXIrK10gYXMgbnVtYmVyKSAtIG5vcm1CaWFzWzNdKSAqIG5vcm1NZWFuWzNdOyAvLyBBIHZhbHVlXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvcmVzdHJpY3QtcGx1cy1vcGVyYW5kc1xuICAgICAgICBwaXhlbHMyRENvbnRleHQuZmlsbFN0eWxlID0gJ3JnYmEoJyArIFIgKyAnLCcgKyBHICsgJywnICsgQiArICcsJyArIEEgKyAnKSc7XG4gICAgICAgIHBpeGVsczJEQ29udGV4dC5maWxsUmVjdChqLCBpLCAxLCAxKTtcbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKCd0b0RhdGFVUkwnIGluIGNhbnZhcykge1xuICAgICAgcmV0dXJuIGNhbnZhcy50b0RhdGFVUkwoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCd0b0RhdGFVUkwgaXMgbm90IHN1cHBvcnRlZCcpO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBub3QgYWNjZXNzIGltYWdlIGRhdGEnKTtcbiAgfVxufTtcblxuLyoqXG4gKiBpbXBsZW1lbnRhdGlvbiBvZiBUZW5zb3IudG9JbWFnZURhdGEoKVxuICovXG5leHBvcnQgY29uc3QgdGVuc29yVG9JbWFnZURhdGEgPSAodGVuc29yOiBUZW5zb3IsIG9wdGlvbnM/OiBUZW5zb3JUb0ltYWdlRGF0YU9wdGlvbnMpOiBJbWFnZURhdGEgPT4ge1xuICBjb25zdCBwaXhlbHMyRENvbnRleHQgPVxuICAgIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCdcbiAgICAgID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJykuZ2V0Q29udGV4dCgnMmQnKVxuICAgICAgOiAobmV3IE9mZnNjcmVlbkNhbnZhcygxLCAxKS5nZXRDb250ZXh0KCcyZCcpIGFzIE9mZnNjcmVlbkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCk7XG4gIGxldCBpbWFnZTogSW1hZ2VEYXRhO1xuICBpZiAocGl4ZWxzMkRDb250ZXh0ICE9IG51bGwpIHtcbiAgICAvLyBEZWZhdWx0IHZhbHVlcyBmb3IgaGVpZ2h0IGFuZCB3aWR0aCAmIGZvcm1hdFxuICAgIGxldCB3aWR0aDogbnVtYmVyO1xuICAgIGxldCBoZWlnaHQ6IG51bWJlcjtcbiAgICBsZXQgY2hhbm5lbHM6IG51bWJlcjtcbiAgICBpZiAob3B0aW9ucz8udGVuc29yTGF5b3V0ICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy50ZW5zb3JMYXlvdXQgPT09ICdOSFdDJykge1xuICAgICAgd2lkdGggPSB0ZW5zb3IuZGltc1syXTtcbiAgICAgIGhlaWdodCA9IHRlbnNvci5kaW1zWzFdO1xuICAgICAgY2hhbm5lbHMgPSB0ZW5zb3IuZGltc1szXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGVmYXVsdCBsYXlvdXQgaXMgTkNXSFxuICAgICAgd2lkdGggPSB0ZW5zb3IuZGltc1szXTtcbiAgICAgIGhlaWdodCA9IHRlbnNvci5kaW1zWzJdO1xuICAgICAgY2hhbm5lbHMgPSB0ZW5zb3IuZGltc1sxXTtcbiAgICB9XG4gICAgY29uc3QgaW5wdXRmb3JtYXQgPSBvcHRpb25zICE9PSB1bmRlZmluZWQgPyAob3B0aW9ucy5mb3JtYXQgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuZm9ybWF0IDogJ1JHQicpIDogJ1JHQic7XG5cbiAgICBjb25zdCBub3JtID0gb3B0aW9ucz8ubm9ybTtcbiAgICBsZXQgbm9ybU1lYW46IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdO1xuICAgIGxldCBub3JtQmlhczogW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XG4gICAgaWYgKG5vcm0gPT09IHVuZGVmaW5lZCB8fCBub3JtLm1lYW4gPT09IHVuZGVmaW5lZCkge1xuICAgICAgbm9ybU1lYW4gPSBbMjU1LCAyNTUsIDI1NSwgMjU1XTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBub3JtLm1lYW4gPT09ICdudW1iZXInKSB7XG4gICAgICAgIG5vcm1NZWFuID0gW25vcm0ubWVhbiwgbm9ybS5tZWFuLCBub3JtLm1lYW4sIG5vcm0ubWVhbl07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub3JtTWVhbiA9IFtub3JtLm1lYW5bMF0sIG5vcm0ubWVhblsxXSwgbm9ybS5tZWFuWzJdLCAyNTVdO1xuICAgICAgICBpZiAobm9ybS5tZWFuWzNdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBub3JtTWVhblszXSA9IG5vcm0ubWVhblszXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBpZiAobm9ybSA9PT0gdW5kZWZpbmVkIHx8IG5vcm0uYmlhcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBub3JtQmlhcyA9IFswLCAwLCAwLCAwXTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKHR5cGVvZiBub3JtLmJpYXMgPT09ICdudW1iZXInKSB7XG4gICAgICAgIG5vcm1CaWFzID0gW25vcm0uYmlhcywgbm9ybS5iaWFzLCBub3JtLmJpYXMsIG5vcm0uYmlhc107XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBub3JtQmlhcyA9IFtub3JtLmJpYXNbMF0sIG5vcm0uYmlhc1sxXSwgbm9ybS5iaWFzWzJdLCAwXTtcbiAgICAgICAgaWYgKG5vcm0uYmlhc1szXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbm9ybUJpYXNbM10gPSBub3JtLmJpYXNbM107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBzdHJpZGUgPSBoZWlnaHQgKiB3aWR0aDtcbiAgICBpZiAob3B0aW9ucyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAoXG4gICAgICAgIChvcHRpb25zLmZvcm1hdCAhPT0gdW5kZWZpbmVkICYmIGNoYW5uZWxzID09PSA0ICYmIG9wdGlvbnMuZm9ybWF0ICE9PSAnUkdCQScpIHx8XG4gICAgICAgIChjaGFubmVscyA9PT0gMyAmJiBvcHRpb25zLmZvcm1hdCAhPT0gJ1JHQicgJiYgb3B0aW9ucy5mb3JtYXQgIT09ICdCR1InKVxuICAgICAgKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcIlRlbnNvciBmb3JtYXQgZG9lc24ndCBtYXRjaCBpbnB1dCB0ZW5zb3IgZGltc1wiKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBEZWZhdWx0IHBvaW50ZXIgYXNzaWdubWVudHNcbiAgICBjb25zdCBzdGVwID0gNDtcbiAgICBsZXQgckltYWdlUG9pbnRlciA9IDAsXG4gICAgICBnSW1hZ2VQb2ludGVyID0gMSxcbiAgICAgIGJJbWFnZVBvaW50ZXIgPSAyLFxuICAgICAgYUltYWdlUG9pbnRlciA9IDM7XG4gICAgbGV0IHJUZW5zb3JQb2ludGVyID0gMCxcbiAgICAgIGdUZW5zb3JQb2ludGVyID0gc3RyaWRlLFxuICAgICAgYlRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAyLFxuICAgICAgYVRlbnNvclBvaW50ZXIgPSAtMTtcblxuICAgIC8vIFVwZGF0aW5nIHRoZSBwb2ludGVyIGFzc2lnbm1lbnRzIGJhc2VkIG9uIHRoZSBpbnB1dCBpbWFnZSBmb3JtYXRcbiAgICBpZiAoaW5wdXRmb3JtYXQgPT09ICdSR0JBJykge1xuICAgICAgclRlbnNvclBvaW50ZXIgPSAwO1xuICAgICAgZ1RlbnNvclBvaW50ZXIgPSBzdHJpZGU7XG4gICAgICBiVGVuc29yUG9pbnRlciA9IHN0cmlkZSAqIDI7XG4gICAgICBhVGVuc29yUG9pbnRlciA9IHN0cmlkZSAqIDM7XG4gICAgfSBlbHNlIGlmIChpbnB1dGZvcm1hdCA9PT0gJ1JHQicpIHtcbiAgICAgIHJUZW5zb3JQb2ludGVyID0gMDtcbiAgICAgIGdUZW5zb3JQb2ludGVyID0gc3RyaWRlO1xuICAgICAgYlRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAyO1xuICAgIH0gZWxzZSBpZiAoaW5wdXRmb3JtYXQgPT09ICdSQkcnKSB7XG4gICAgICByVGVuc29yUG9pbnRlciA9IDA7XG4gICAgICBiVGVuc29yUG9pbnRlciA9IHN0cmlkZTtcbiAgICAgIGdUZW5zb3JQb2ludGVyID0gc3RyaWRlICogMjtcbiAgICB9XG5cbiAgICBpbWFnZSA9IHBpeGVsczJEQ29udGV4dC5jcmVhdGVJbWFnZURhdGEod2lkdGgsIGhlaWdodCk7XG5cbiAgICBmb3IgKFxuICAgICAgbGV0IGkgPSAwO1xuICAgICAgaSA8IGhlaWdodCAqIHdpZHRoO1xuICAgICAgckltYWdlUG9pbnRlciArPSBzdGVwLCBnSW1hZ2VQb2ludGVyICs9IHN0ZXAsIGJJbWFnZVBvaW50ZXIgKz0gc3RlcCwgYUltYWdlUG9pbnRlciArPSBzdGVwLCBpKytcbiAgICApIHtcbiAgICAgIGltYWdlLmRhdGFbckltYWdlUG9pbnRlcl0gPSAoKHRlbnNvci5kYXRhW3JUZW5zb3JQb2ludGVyKytdIGFzIG51bWJlcikgLSBub3JtQmlhc1swXSkgKiBub3JtTWVhblswXTsgLy8gUiB2YWx1ZVxuICAgICAgaW1hZ2UuZGF0YVtnSW1hZ2VQb2ludGVyXSA9ICgodGVuc29yLmRhdGFbZ1RlbnNvclBvaW50ZXIrK10gYXMgbnVtYmVyKSAtIG5vcm1CaWFzWzFdKSAqIG5vcm1NZWFuWzFdOyAvLyBHIHZhbHVlXG4gICAgICBpbWFnZS5kYXRhW2JJbWFnZVBvaW50ZXJdID0gKCh0ZW5zb3IuZGF0YVtiVGVuc29yUG9pbnRlcisrXSBhcyBudW1iZXIpIC0gbm9ybUJpYXNbMl0pICogbm9ybU1lYW5bMl07IC8vIEIgdmFsdWVcbiAgICAgIGltYWdlLmRhdGFbYUltYWdlUG9pbnRlcl0gPVxuICAgICAgICBhVGVuc29yUG9pbnRlciA9PT0gLTEgPyAyNTUgOiAoKHRlbnNvci5kYXRhW2FUZW5zb3JQb2ludGVyKytdIGFzIG51bWJlcikgLSBub3JtQmlhc1szXSkgKiBub3JtTWVhblszXTsgLy8gQSB2YWx1ZVxuICAgIH1cbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBub3QgYWNjZXNzIGltYWdlIGRhdGEnKTtcbiAgfVxuICByZXR1cm4gaW1hZ2U7XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge1xuICBPcHRpb25zRGltZW5zaW9ucyxcbiAgT3B0aW9uc0Zvcm1hdCxcbiAgT3B0aW9uc05vcm1hbGl6YXRpb25QYXJhbWV0ZXJzLFxuICBPcHRpb25zVGVuc29yRm9ybWF0LFxuICBPcHRpb25zVGVuc29yTGF5b3V0LFxuICBUZW5zb3JGcm9tR3B1QnVmZmVyT3B0aW9ucyxcbiAgVGVuc29yRnJvbUltYWdlQml0bWFwT3B0aW9ucyxcbiAgVGVuc29yRnJvbUltYWdlRGF0YU9wdGlvbnMsXG4gIFRlbnNvckZyb21JbWFnZUVsZW1lbnRPcHRpb25zLFxuICBUZW5zb3JGcm9tTUxUZW5zb3JPcHRpb25zLFxuICBUZW5zb3JGcm9tVGV4dHVyZU9wdGlvbnMsXG4gIFRlbnNvckZyb21VcmxPcHRpb25zLFxufSBmcm9tICcuL3RlbnNvci1mYWN0b3J5LmpzJztcbmltcG9ydCB7IFRlbnNvciB9IGZyb20gJy4vdGVuc29yLWltcGwuanMnO1xuaW1wb3J0IHsgVGVuc29yIGFzIFRlbnNvckludGVyZmFjZSB9IGZyb20gJy4vdGVuc29yLmpzJztcblxuaW50ZXJmYWNlIEJ1ZmZlclRvVGVuc29yT3B0aW9uc1xuICBleHRlbmRzIE9wdGlvbnNEaW1lbnNpb25zLFxuICAgIE9wdGlvbnNUZW5zb3JMYXlvdXQsXG4gICAgT3B0aW9uc05vcm1hbGl6YXRpb25QYXJhbWV0ZXJzLFxuICAgIE9wdGlvbnNGb3JtYXQsXG4gICAgT3B0aW9uc1RlbnNvckZvcm1hdCB7fVxuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyB0ZW5zb3Igb2JqZWN0IGZyb20gaW1hZ2Ugb2JqZWN0XG4gKlxuICogQHBhcmFtIGJ1ZmZlciAtIEV4dHJhY3RlZCBpbWFnZSBidWZmZXIgZGF0YSAtIGFzc3VtaW5nIFJHQkEgZm9ybWF0XG4gKiBAcGFyYW0gaW1hZ2VGb3JtYXQgLSBpbnB1dCBpbWFnZSBjb25maWd1cmF0aW9uIC0gcmVxdWlyZWQgY29uZmlndXJhdGlvbnMgaGVpZ2h0LCB3aWR0aCwgZm9ybWF0XG4gKiBAcGFyYW0gdGVuc29yRm9ybWF0IC0gb3V0cHV0IHRlbnNvciBjb25maWd1cmF0aW9uIC0gRGVmYXVsdCBpcyBSR0IgZm9ybWF0XG4gKi9cbmV4cG9ydCBjb25zdCBidWZmZXJUb1RlbnNvciA9IChidWZmZXI6IFVpbnQ4Q2xhbXBlZEFycmF5IHwgdW5kZWZpbmVkLCBvcHRpb25zOiBCdWZmZXJUb1RlbnNvck9wdGlvbnMpOiBUZW5zb3IgPT4ge1xuICBpZiAoYnVmZmVyID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ltYWdlIGJ1ZmZlciBtdXN0IGJlIGRlZmluZWQnKTtcbiAgfVxuICBpZiAob3B0aW9ucy5oZWlnaHQgPT09IHVuZGVmaW5lZCB8fCBvcHRpb25zLndpZHRoID09PSB1bmRlZmluZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0ltYWdlIGhlaWdodCBhbmQgd2lkdGggbXVzdCBiZSBkZWZpbmVkJyk7XG4gIH1cbiAgaWYgKG9wdGlvbnMudGVuc29yTGF5b3V0ID09PSAnTkhXQycpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ05IV0MgVGVuc29yIGxheW91dCBpcyBub3Qgc3VwcG9ydGVkIHlldCcpO1xuICB9XG5cbiAgY29uc3QgeyBoZWlnaHQsIHdpZHRoIH0gPSBvcHRpb25zO1xuXG4gIGNvbnN0IG5vcm0gPSBvcHRpb25zLm5vcm0gPz8geyBtZWFuOiAyNTUsIGJpYXM6IDAgfTtcbiAgbGV0IG5vcm1NZWFuOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcbiAgbGV0IG5vcm1CaWFzOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcblxuICBpZiAodHlwZW9mIG5vcm0ubWVhbiA9PT0gJ251bWJlcicpIHtcbiAgICBub3JtTWVhbiA9IFtub3JtLm1lYW4sIG5vcm0ubWVhbiwgbm9ybS5tZWFuLCBub3JtLm1lYW5dO1xuICB9IGVsc2Uge1xuICAgIG5vcm1NZWFuID0gW25vcm0ubWVhbiFbMF0sIG5vcm0ubWVhbiFbMV0sIG5vcm0ubWVhbiFbMl0sIG5vcm0ubWVhbiFbM10gPz8gMjU1XTtcbiAgfVxuXG4gIGlmICh0eXBlb2Ygbm9ybS5iaWFzID09PSAnbnVtYmVyJykge1xuICAgIG5vcm1CaWFzID0gW25vcm0uYmlhcywgbm9ybS5iaWFzLCBub3JtLmJpYXMsIG5vcm0uYmlhc107XG4gIH0gZWxzZSB7XG4gICAgbm9ybUJpYXMgPSBbbm9ybS5iaWFzIVswXSwgbm9ybS5iaWFzIVsxXSwgbm9ybS5iaWFzIVsyXSwgbm9ybS5iaWFzIVszXSA/PyAwXTtcbiAgfVxuXG4gIGNvbnN0IGlucHV0Zm9ybWF0ID0gb3B0aW9ucy5mb3JtYXQgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuZm9ybWF0IDogJ1JHQkEnO1xuICAvLyBkZWZhdWx0IHZhbHVlIGlzIFJHQkEgc2luY2UgaW1hZ2VkYXRhIGFuZCBIVE1MSW1hZ2VFbGVtZW50IHVzZXMgaXRcblxuICBjb25zdCBvdXRwdXRmb3JtYXQgPVxuICAgIG9wdGlvbnMudGVuc29yRm9ybWF0ICE9PSB1bmRlZmluZWQgPyAob3B0aW9ucy50ZW5zb3JGb3JtYXQgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMudGVuc29yRm9ybWF0IDogJ1JHQicpIDogJ1JHQic7XG4gIGNvbnN0IHN0cmlkZSA9IGhlaWdodCAqIHdpZHRoO1xuICBjb25zdCBmbG9hdDMyRGF0YSA9IG91dHB1dGZvcm1hdCA9PT0gJ1JHQkEnID8gbmV3IEZsb2F0MzJBcnJheShzdHJpZGUgKiA0KSA6IG5ldyBGbG9hdDMyQXJyYXkoc3RyaWRlICogMyk7XG5cbiAgLy8gRGVmYXVsdCBwb2ludGVyIGFzc2lnbm1lbnRzXG4gIGxldCBzdGVwID0gNCxcbiAgICBySW1hZ2VQb2ludGVyID0gMCxcbiAgICBnSW1hZ2VQb2ludGVyID0gMSxcbiAgICBiSW1hZ2VQb2ludGVyID0gMixcbiAgICBhSW1hZ2VQb2ludGVyID0gMztcbiAgbGV0IHJUZW5zb3JQb2ludGVyID0gMCxcbiAgICBnVGVuc29yUG9pbnRlciA9IHN0cmlkZSxcbiAgICBiVGVuc29yUG9pbnRlciA9IHN0cmlkZSAqIDIsXG4gICAgYVRlbnNvclBvaW50ZXIgPSAtMTtcblxuICAvLyBVcGRhdGluZyB0aGUgcG9pbnRlciBhc3NpZ25tZW50cyBiYXNlZCBvbiB0aGUgaW5wdXQgaW1hZ2UgZm9ybWF0XG4gIGlmIChpbnB1dGZvcm1hdCA9PT0gJ1JHQicpIHtcbiAgICBzdGVwID0gMztcbiAgICBySW1hZ2VQb2ludGVyID0gMDtcbiAgICBnSW1hZ2VQb2ludGVyID0gMTtcbiAgICBiSW1hZ2VQb2ludGVyID0gMjtcbiAgICBhSW1hZ2VQb2ludGVyID0gLTE7XG4gIH1cblxuICAvLyBVcGRhdGluZyB0aGUgcG9pbnRlciBhc3NpZ25tZW50cyBiYXNlZCBvbiB0aGUgb3V0cHV0IHRlbnNvciBmb3JtYXRcbiAgaWYgKG91dHB1dGZvcm1hdCA9PT0gJ1JHQkEnKSB7XG4gICAgYVRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAzO1xuICB9IGVsc2UgaWYgKG91dHB1dGZvcm1hdCA9PT0gJ1JCRycpIHtcbiAgICByVGVuc29yUG9pbnRlciA9IDA7XG4gICAgYlRlbnNvclBvaW50ZXIgPSBzdHJpZGU7XG4gICAgZ1RlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAyO1xuICB9IGVsc2UgaWYgKG91dHB1dGZvcm1hdCA9PT0gJ0JHUicpIHtcbiAgICBiVGVuc29yUG9pbnRlciA9IDA7XG4gICAgZ1RlbnNvclBvaW50ZXIgPSBzdHJpZGU7XG4gICAgclRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAyO1xuICB9XG5cbiAgZm9yIChcbiAgICBsZXQgaSA9IDA7XG4gICAgaSA8IHN0cmlkZTtcbiAgICBpKyssIHJJbWFnZVBvaW50ZXIgKz0gc3RlcCwgYkltYWdlUG9pbnRlciArPSBzdGVwLCBnSW1hZ2VQb2ludGVyICs9IHN0ZXAsIGFJbWFnZVBvaW50ZXIgKz0gc3RlcFxuICApIHtcbiAgICBmbG9hdDMyRGF0YVtyVGVuc29yUG9pbnRlcisrXSA9IChidWZmZXJbckltYWdlUG9pbnRlcl0gKyBub3JtQmlhc1swXSkgLyBub3JtTWVhblswXTtcbiAgICBmbG9hdDMyRGF0YVtnVGVuc29yUG9pbnRlcisrXSA9IChidWZmZXJbZ0ltYWdlUG9pbnRlcl0gKyBub3JtQmlhc1sxXSkgLyBub3JtTWVhblsxXTtcbiAgICBmbG9hdDMyRGF0YVtiVGVuc29yUG9pbnRlcisrXSA9IChidWZmZXJbYkltYWdlUG9pbnRlcl0gKyBub3JtQmlhc1syXSkgLyBub3JtTWVhblsyXTtcbiAgICBpZiAoYVRlbnNvclBvaW50ZXIgIT09IC0xICYmIGFJbWFnZVBvaW50ZXIgIT09IC0xKSB7XG4gICAgICBmbG9hdDMyRGF0YVthVGVuc29yUG9pbnRlcisrXSA9IChidWZmZXJbYUltYWdlUG9pbnRlcl0gKyBub3JtQmlhc1szXSkgLyBub3JtTWVhblszXTtcbiAgICB9XG4gIH1cblxuICAvLyBGbG9hdDMyQXJyYXkgLT4gb3J0LlRlbnNvclxuICBjb25zdCBvdXRwdXRUZW5zb3IgPVxuICAgIG91dHB1dGZvcm1hdCA9PT0gJ1JHQkEnXG4gICAgICA/IG5ldyBUZW5zb3IoJ2Zsb2F0MzInLCBmbG9hdDMyRGF0YSwgWzEsIDQsIGhlaWdodCwgd2lkdGhdKVxuICAgICAgOiBuZXcgVGVuc29yKCdmbG9hdDMyJywgZmxvYXQzMkRhdGEsIFsxLCAzLCBoZWlnaHQsIHdpZHRoXSk7XG4gIHJldHVybiBvdXRwdXRUZW5zb3I7XG59O1xuXG4vKipcbiAqIGltcGxlbWVudGF0aW9uIG9mIFRlbnNvci5mcm9tSW1hZ2UoKS5cbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvckZyb21JbWFnZSA9IGFzeW5jIChcbiAgaW1hZ2U6IEltYWdlRGF0YSB8IEhUTUxJbWFnZUVsZW1lbnQgfCBJbWFnZUJpdG1hcCB8IHN0cmluZyxcbiAgb3B0aW9ucz86XG4gICAgfCBUZW5zb3JGcm9tSW1hZ2VEYXRhT3B0aW9uc1xuICAgIHwgVGVuc29yRnJvbUltYWdlRWxlbWVudE9wdGlvbnNcbiAgICB8IFRlbnNvckZyb21JbWFnZUJpdG1hcE9wdGlvbnNcbiAgICB8IFRlbnNvckZyb21VcmxPcHRpb25zLFxuKTogUHJvbWlzZTxUZW5zb3I+ID0+IHtcbiAgLy8gY2hlY2tpbmcgdGhlIHR5cGUgb2YgaW1hZ2Ugb2JqZWN0XG4gIGNvbnN0IGlzSFRNTEltYWdlRWxlID0gdHlwZW9mIEhUTUxJbWFnZUVsZW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGltYWdlIGluc3RhbmNlb2YgSFRNTEltYWdlRWxlbWVudDtcbiAgY29uc3QgaXNJbWFnZURhdGFFbGUgPSB0eXBlb2YgSW1hZ2VEYXRhICE9PSAndW5kZWZpbmVkJyAmJiBpbWFnZSBpbnN0YW5jZW9mIEltYWdlRGF0YTtcbiAgY29uc3QgaXNJbWFnZUJpdG1hcCA9IHR5cGVvZiBJbWFnZUJpdG1hcCAhPT0gJ3VuZGVmaW5lZCcgJiYgaW1hZ2UgaW5zdGFuY2VvZiBJbWFnZUJpdG1hcDtcbiAgY29uc3QgaXNTdHJpbmcgPSB0eXBlb2YgaW1hZ2UgPT09ICdzdHJpbmcnO1xuXG4gIGxldCBkYXRhOiBVaW50OENsYW1wZWRBcnJheSB8IHVuZGVmaW5lZDtcbiAgbGV0IGJ1ZmZlclRvVGVuc29yT3B0aW9uczogQnVmZmVyVG9UZW5zb3JPcHRpb25zID0gb3B0aW9ucyA/PyB7fTtcblxuICBjb25zdCBjcmVhdGVDYW52YXMgPSAoKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBPZmZzY3JlZW5DYW52YXMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gbmV3IE9mZnNjcmVlbkNhbnZhcygxLCAxKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW52YXMgaXMgbm90IHN1cHBvcnRlZCcpO1xuICAgIH1cbiAgfTtcbiAgY29uc3QgY3JlYXRlQ2FudmFzQ29udGV4dCA9IChjYW52YXM6IEhUTUxDYW52YXNFbGVtZW50IHwgT2Zmc2NyZWVuQ2FudmFzKSA9PiB7XG4gICAgaWYgKHR5cGVvZiBIVE1MQ2FudmFzRWxlbWVudCAhPT0gJ3VuZGVmaW5lZCcgJiYgY2FudmFzIGluc3RhbmNlb2YgSFRNTENhbnZhc0VsZW1lbnQpIHtcbiAgICAgIHJldHVybiBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICB9IGVsc2UgaWYgKGNhbnZhcyBpbnN0YW5jZW9mIE9mZnNjcmVlbkNhbnZhcykge1xuICAgICAgcmV0dXJuIGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpIGFzIE9mZnNjcmVlbkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcbiAgICB9IGVsc2Uge1xuICAgICAgcmV0dXJuIG51bGw7XG4gICAgfVxuICB9O1xuICAvLyBmaWxsaW5nIGFuZCBjaGVja2luZyBpbWFnZSBjb25maWd1cmF0aW9uIG9wdGlvbnNcbiAgaWYgKGlzSFRNTEltYWdlRWxlKSB7XG4gICAgLy8gSFRNTEltYWdlRWxlbWVudCAtIGltYWdlIG9iamVjdCAtIGZvcm1hdCBpcyBSR0JBIGJ5IGRlZmF1bHRcbiAgICBjb25zdCBjYW52YXMgPSBjcmVhdGVDYW52YXMoKTtcbiAgICBjYW52YXMud2lkdGggPSBpbWFnZS53aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xuICAgIGNvbnN0IHBpeGVsczJEQ29udGV4dCA9IGNyZWF0ZUNhbnZhc0NvbnRleHQoY2FudmFzKTtcblxuICAgIGlmIChwaXhlbHMyRENvbnRleHQgIT0gbnVsbCkge1xuICAgICAgbGV0IGhlaWdodCA9IGltYWdlLmhlaWdodDtcbiAgICAgIGxldCB3aWR0aCA9IGltYWdlLndpZHRoO1xuICAgICAgaWYgKG9wdGlvbnMgIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLnJlc2l6ZWRIZWlnaHQgIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLnJlc2l6ZWRXaWR0aCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIGhlaWdodCA9IG9wdGlvbnMucmVzaXplZEhlaWdodDtcbiAgICAgICAgd2lkdGggPSBvcHRpb25zLnJlc2l6ZWRXaWR0aDtcbiAgICAgIH1cblxuICAgICAgaWYgKG9wdGlvbnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBidWZmZXJUb1RlbnNvck9wdGlvbnMgPSBvcHRpb25zO1xuICAgICAgICBpZiAob3B0aW9ucy50ZW5zb3JGb3JtYXQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW1hZ2UgaW5wdXQgY29uZmlnIGZvcm1hdCBtdXN0IGJlIFJHQkEgZm9yIEhUTUxJbWFnZUVsZW1lbnQnKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBidWZmZXJUb1RlbnNvck9wdGlvbnMudGVuc29yRm9ybWF0ID0gJ1JHQkEnO1xuICAgICAgICB9XG4gICAgICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucy53aWR0aCA9IHdpZHRoO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLnRlbnNvckZvcm1hdCA9ICdSR0JBJztcbiAgICAgICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLmhlaWdodCA9IGhlaWdodDtcbiAgICAgICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLndpZHRoID0gd2lkdGg7XG4gICAgICB9XG5cbiAgICAgIHBpeGVsczJEQ29udGV4dC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xuICAgICAgZGF0YSA9IHBpeGVsczJEQ29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGgsIGhlaWdodCkuZGF0YTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gbm90IGFjY2VzcyBpbWFnZSBkYXRhJyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzSW1hZ2VEYXRhRWxlKSB7XG4gICAgbGV0IGhlaWdodDogbnVtYmVyO1xuICAgIGxldCB3aWR0aDogbnVtYmVyO1xuXG4gICAgaWYgKG9wdGlvbnMgIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLnJlc2l6ZWRXaWR0aCAhPT0gdW5kZWZpbmVkICYmIG9wdGlvbnMucmVzaXplZEhlaWdodCAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBoZWlnaHQgPSBvcHRpb25zLnJlc2l6ZWRIZWlnaHQ7XG4gICAgICB3aWR0aCA9IG9wdGlvbnMucmVzaXplZFdpZHRoO1xuICAgIH0gZWxzZSB7XG4gICAgICBoZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XG4gICAgICB3aWR0aCA9IGltYWdlLndpZHRoO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucyA9IG9wdGlvbnM7XG4gICAgfVxuICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucy5mb3JtYXQgPSAnUkdCQSc7XG4gICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLmhlaWdodCA9IGhlaWdodDtcbiAgICBidWZmZXJUb1RlbnNvck9wdGlvbnMud2lkdGggPSB3aWR0aDtcblxuICAgIGlmIChvcHRpb25zICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGNvbnN0IHRlbXBDYW52YXMgPSBjcmVhdGVDYW52YXMoKTtcblxuICAgICAgdGVtcENhbnZhcy53aWR0aCA9IHdpZHRoO1xuICAgICAgdGVtcENhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG5cbiAgICAgIGNvbnN0IHBpeGVsczJEQ29udGV4dCA9IGNyZWF0ZUNhbnZhc0NvbnRleHQodGVtcENhbnZhcyk7XG5cbiAgICAgIGlmIChwaXhlbHMyRENvbnRleHQgIT0gbnVsbCkge1xuICAgICAgICBwaXhlbHMyRENvbnRleHQucHV0SW1hZ2VEYXRhKGltYWdlLCAwLCAwKTtcbiAgICAgICAgZGF0YSA9IHBpeGVsczJEQ29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGgsIGhlaWdodCkuZGF0YTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG5vdCBhY2Nlc3MgaW1hZ2UgZGF0YScpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBkYXRhID0gaW1hZ2UuZGF0YTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNJbWFnZUJpdG1hcCkge1xuICAgIC8vIEltYWdlQml0bWFwIC0gaW1hZ2Ugb2JqZWN0IC0gZm9ybWF0IG11c3QgYmUgcHJvdmlkZWQgYnkgdXNlclxuICAgIGlmIChvcHRpb25zID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignUGxlYXNlIHByb3ZpZGUgaW1hZ2UgY29uZmlnIHdpdGggZm9ybWF0IGZvciBJbWFnZWJpdG1hcCcpO1xuICAgIH1cblxuICAgIGNvbnN0IGNhbnZhcyA9IGNyZWF0ZUNhbnZhcygpO1xuICAgIGNhbnZhcy53aWR0aCA9IGltYWdlLndpZHRoO1xuICAgIGNhbnZhcy5oZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XG4gICAgY29uc3QgcGl4ZWxzMkRDb250ZXh0ID0gY3JlYXRlQ2FudmFzQ29udGV4dChjYW52YXMpO1xuXG4gICAgaWYgKHBpeGVsczJEQ29udGV4dCAhPSBudWxsKSB7XG4gICAgICBjb25zdCBoZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XG4gICAgICBjb25zdCB3aWR0aCA9IGltYWdlLndpZHRoO1xuICAgICAgcGl4ZWxzMkRDb250ZXh0LmRyYXdJbWFnZShpbWFnZSwgMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICBkYXRhID0gcGl4ZWxzMkRDb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCB3aWR0aCwgaGVpZ2h0KS5kYXRhO1xuICAgICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLmhlaWdodCA9IGhlaWdodDtcbiAgICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucy53aWR0aCA9IHdpZHRoO1xuICAgICAgcmV0dXJuIGJ1ZmZlclRvVGVuc29yKGRhdGEsIGJ1ZmZlclRvVGVuc29yT3B0aW9ucyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG5vdCBhY2Nlc3MgaW1hZ2UgZGF0YScpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc1N0cmluZykge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBjb25zdCBjYW52YXMgPSBjcmVhdGVDYW52YXMoKTtcbiAgICAgIGNvbnN0IGNvbnRleHQgPSBjcmVhdGVDYW52YXNDb250ZXh0KGNhbnZhcyk7XG4gICAgICBpZiAoIWltYWdlIHx8ICFjb250ZXh0KSB7XG4gICAgICAgIHJldHVybiByZWplY3QoKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IG5ld0ltYWdlID0gbmV3IEltYWdlKCk7XG4gICAgICBuZXdJbWFnZS5jcm9zc09yaWdpbiA9ICdBbm9ueW1vdXMnO1xuICAgICAgbmV3SW1hZ2Uuc3JjID0gaW1hZ2U7XG4gICAgICBuZXdJbWFnZS5vbmxvYWQgPSAoKSA9PiB7XG4gICAgICAgIGNhbnZhcy53aWR0aCA9IG5ld0ltYWdlLndpZHRoO1xuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gbmV3SW1hZ2UuaGVpZ2h0O1xuICAgICAgICBjb250ZXh0LmRyYXdJbWFnZShuZXdJbWFnZSwgMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgICAgICAgY29uc3QgaW1nID0gY29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcblxuICAgICAgICBidWZmZXJUb1RlbnNvck9wdGlvbnMuaGVpZ2h0ID0gY2FudmFzLmhlaWdodDtcbiAgICAgICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLndpZHRoID0gY2FudmFzLndpZHRoO1xuICAgICAgICByZXNvbHZlKGJ1ZmZlclRvVGVuc29yKGltZy5kYXRhLCBidWZmZXJUb1RlbnNvck9wdGlvbnMpKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnB1dCBkYXRhIHByb3ZpZGVkIGlzIG5vdCBzdXBwb3J0ZWQgLSBhYm9ydGVkIHRlbnNvciBjcmVhdGlvbicpO1xuICB9XG5cbiAgaWYgKGRhdGEgIT09IHVuZGVmaW5lZCkge1xuICAgIHJldHVybiBidWZmZXJUb1RlbnNvcihkYXRhLCBidWZmZXJUb1RlbnNvck9wdGlvbnMpO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignSW5wdXQgZGF0YSBwcm92aWRlZCBpcyBub3Qgc3VwcG9ydGVkIC0gYWJvcnRlZCB0ZW5zb3IgY3JlYXRpb24nKTtcbiAgfVxufTtcblxuLyoqXG4gKiBpbXBsZW1lbnRhdGlvbiBvZiBUZW5zb3IuZnJvbVRleHR1cmUoKS5cbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvckZyb21UZXh0dXJlID0gPFQgZXh0ZW5kcyBUZW5zb3JJbnRlcmZhY2UuVGV4dHVyZURhdGFUeXBlcz4oXG4gIHRleHR1cmU6IFRlbnNvckludGVyZmFjZS5UZXh0dXJlVHlwZSxcbiAgb3B0aW9uczogVGVuc29yRnJvbVRleHR1cmVPcHRpb25zPFQ+LFxuKTogVGVuc29yID0+IHtcbiAgY29uc3QgeyB3aWR0aCwgaGVpZ2h0LCBkb3dubG9hZCwgZGlzcG9zZSB9ID0gb3B0aW9ucztcbiAgLy8gQWx3YXlzIGFzc3VtZSBSR0JBRjMyLiBUT0RPOiBzdXBwb3J0IGRpZmZlcmVudCB0ZXh0dXJlIGZvcm1hdFxuICBjb25zdCBkaW1zID0gWzEsIGhlaWdodCwgd2lkdGgsIDRdO1xuICByZXR1cm4gbmV3IFRlbnNvcih7IGxvY2F0aW9uOiAndGV4dHVyZScsIHR5cGU6ICdmbG9hdDMyJywgdGV4dHVyZSwgZGltcywgZG93bmxvYWQsIGRpc3Bvc2UgfSk7XG59O1xuXG4vKipcbiAqIGltcGxlbWVudGF0aW9uIG9mIFRlbnNvci5mcm9tR3B1QnVmZmVyKCkuXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW5zb3JGcm9tR3B1QnVmZmVyID0gPFQgZXh0ZW5kcyBUZW5zb3JJbnRlcmZhY2UuR3B1QnVmZmVyRGF0YVR5cGVzPihcbiAgZ3B1QnVmZmVyOiBUZW5zb3JJbnRlcmZhY2UuR3B1QnVmZmVyVHlwZSxcbiAgb3B0aW9uczogVGVuc29yRnJvbUdwdUJ1ZmZlck9wdGlvbnM8VD4sXG4pOiBUZW5zb3IgPT4ge1xuICBjb25zdCB7IGRhdGFUeXBlLCBkaW1zLCBkb3dubG9hZCwgZGlzcG9zZSB9ID0gb3B0aW9ucztcbiAgcmV0dXJuIG5ldyBUZW5zb3IoeyBsb2NhdGlvbjogJ2dwdS1idWZmZXInLCB0eXBlOiBkYXRhVHlwZSA/PyAnZmxvYXQzMicsIGdwdUJ1ZmZlciwgZGltcywgZG93bmxvYWQsIGRpc3Bvc2UgfSk7XG59O1xuXG4vKipcbiAqIGltcGxlbWVudGF0aW9uIG9mIFRlbnNvci5mcm9tTUxUZW5zb3IoKS5cbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvckZyb21NTFRlbnNvciA9IDxUIGV4dGVuZHMgVGVuc29ySW50ZXJmYWNlLk1MVGVuc29yRGF0YVR5cGVzPihcbiAgbWxUZW5zb3I6IFRlbnNvckludGVyZmFjZS5NTFRlbnNvclR5cGUsXG4gIG9wdGlvbnM6IFRlbnNvckZyb21NTFRlbnNvck9wdGlvbnM8VD4sXG4pOiBUZW5zb3IgPT4ge1xuICBjb25zdCB7IGRhdGFUeXBlLCBkaW1zLCBkb3dubG9hZCwgZGlzcG9zZSB9ID0gb3B0aW9ucztcbiAgcmV0dXJuIG5ldyBUZW5zb3IoeyBsb2NhdGlvbjogJ21sLXRlbnNvcicsIHR5cGU6IGRhdGFUeXBlID8/ICdmbG9hdDMyJywgbWxUZW5zb3IsIGRpbXMsIGRvd25sb2FkLCBkaXNwb3NlIH0pO1xufTtcblxuLyoqXG4gKiBpbXBsZW1lbnRhdGlvbiBvZiBUZW5zb3IuZnJvbVBpbm5lZEJ1ZmZlcigpLlxuICovXG5leHBvcnQgY29uc3QgdGVuc29yRnJvbVBpbm5lZEJ1ZmZlciA9IDxUIGV4dGVuZHMgVGVuc29ySW50ZXJmYWNlLkNwdVBpbm5lZERhdGFUeXBlcz4oXG4gIHR5cGU6IFQsXG4gIGJ1ZmZlcjogVGVuc29ySW50ZXJmYWNlLkRhdGFUeXBlTWFwW1RdLFxuICBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10sXG4pOiBUZW5zb3IgPT4gbmV3IFRlbnNvcih7IGxvY2F0aW9uOiAnY3B1LXBpbm5lZCcsIHR5cGUsIGRhdGE6IGJ1ZmZlciwgZGltczogZGltcyA/PyBbYnVmZmVyLmxlbmd0aF0gfSk7XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7IFRlbnNvciB9IGZyb20gJy4vdGVuc29yLmpzJztcblxuZXhwb3J0IHR5cGUgU3VwcG9ydGVkVHlwZWRBcnJheUNvbnN0cnVjdG9ycyA9XG4gIHwgRmxvYXQzMkFycmF5Q29uc3RydWN0b3JcbiAgfCBVaW50OEFycmF5Q29uc3RydWN0b3JcbiAgfCBJbnQ4QXJyYXlDb25zdHJ1Y3RvclxuICB8IFVpbnQxNkFycmF5Q29uc3RydWN0b3JcbiAgfCBJbnQxNkFycmF5Q29uc3RydWN0b3JcbiAgfCBJbnQzMkFycmF5Q29uc3RydWN0b3JcbiAgfCBCaWdJbnQ2NEFycmF5Q29uc3RydWN0b3JcbiAgfCBVaW50OEFycmF5Q29uc3RydWN0b3JcbiAgfCBGbG9hdDY0QXJyYXlDb25zdHJ1Y3RvclxuICB8IFVpbnQzMkFycmF5Q29uc3RydWN0b3JcbiAgfCBCaWdVaW50NjRBcnJheUNvbnN0cnVjdG9yO1xuZXhwb3J0IHR5cGUgU3VwcG9ydGVkVHlwZWRBcnJheSA9IEluc3RhbmNlVHlwZTxTdXBwb3J0ZWRUeXBlZEFycmF5Q29uc3RydWN0b3JzPjtcblxuLy8gYSBydW50aW1lIG1hcCB0aGF0IG1hcHMgdHlwZSBzdHJpbmcgdG8gVHlwZWRBcnJheSBjb25zdHJ1Y3Rvci4gU2hvdWxkIG1hdGNoIFRlbnNvci5EYXRhVHlwZU1hcC5cbmV4cG9ydCBjb25zdCBOVU1FUklDX1RFTlNPUl9UWVBFX1RPX1RZUEVEQVJSQVlfTUFQID0gbmV3IE1hcDxzdHJpbmcsIFN1cHBvcnRlZFR5cGVkQXJyYXlDb25zdHJ1Y3RvcnM+KFtcbiAgWydmbG9hdDMyJywgRmxvYXQzMkFycmF5XSxcbiAgWyd1aW50OCcsIFVpbnQ4QXJyYXldLFxuICBbJ2ludDgnLCBJbnQ4QXJyYXldLFxuICBbJ3VpbnQxNicsIFVpbnQxNkFycmF5XSxcbiAgWydpbnQxNicsIEludDE2QXJyYXldLFxuICBbJ2ludDMyJywgSW50MzJBcnJheV0sXG4gIFsnYm9vbCcsIFVpbnQ4QXJyYXldLFxuICBbJ2Zsb2F0NjQnLCBGbG9hdDY0QXJyYXldLFxuICBbJ3VpbnQzMicsIFVpbnQzMkFycmF5XSxcbiAgWydpbnQ0JywgVWludDhBcnJheV0sXG4gIFsndWludDQnLCBVaW50OEFycmF5XSxcbl0pO1xuXG4vLyBhIHJ1bnRpbWUgbWFwIHRoYXQgbWFwcyB0eXBlIHN0cmluZyB0byBUeXBlZEFycmF5IGNvbnN0cnVjdG9yLiBTaG91bGQgbWF0Y2ggVGVuc29yLkRhdGFUeXBlTWFwLlxuZXhwb3J0IGNvbnN0IE5VTUVSSUNfVEVOU09SX1RZUEVEQVJSQVlfVE9fVFlQRV9NQVAgPSBuZXcgTWFwPFN1cHBvcnRlZFR5cGVkQXJyYXlDb25zdHJ1Y3RvcnMsIFRlbnNvci5UeXBlPihbXG4gIFtGbG9hdDMyQXJyYXksICdmbG9hdDMyJ10sXG4gIFtVaW50OEFycmF5LCAndWludDgnXSxcbiAgW0ludDhBcnJheSwgJ2ludDgnXSxcbiAgW1VpbnQxNkFycmF5LCAndWludDE2J10sXG4gIFtJbnQxNkFycmF5LCAnaW50MTYnXSxcbiAgW0ludDMyQXJyYXksICdpbnQzMiddLFxuICBbRmxvYXQ2NEFycmF5LCAnZmxvYXQ2NCddLFxuICBbVWludDMyQXJyYXksICd1aW50MzInXSxcbl0pO1xuXG4vLyB0aGUgZm9sbG93aW5nIGNvZGUgYWxsb3dzIGRlbGF5aW5nIGV4ZWN1dGlvbiBvZiBCaWdJbnQvRmxvYXQxNkFycmF5IGNoZWNraW5nLiBUaGlzIGFsbG93cyBsYXp5IGluaXRpYWxpemF0aW9uIGZvclxuLy8gTlVNRVJJQ19URU5TT1JfVFlQRV9UT19UWVBFREFSUkFZX01BUCBhbmQgTlVNRVJJQ19URU5TT1JfVFlQRURBUlJBWV9UT19UWVBFX01BUCwgd2hpY2ggYWxsb3dzIEJpZ0ludC9GbG9hdDE2QXJyYXlcbi8vIHBvbHlmaWxsIGlmIGF2YWlsYWJsZS5cbmxldCBpc1R5cGVkQXJyYXlDaGVja2VkID0gZmFsc2U7XG5leHBvcnQgY29uc3QgY2hlY2tUeXBlZEFycmF5ID0gKCkgPT4ge1xuICBpZiAoIWlzVHlwZWRBcnJheUNoZWNrZWQpIHtcbiAgICBpc1R5cGVkQXJyYXlDaGVja2VkID0gdHJ1ZTtcbiAgICBjb25zdCBpc0JpZ0ludDY0QXJyYXlBdmFpbGFibGUgPSB0eXBlb2YgQmlnSW50NjRBcnJheSAhPT0gJ3VuZGVmaW5lZCcgJiYgQmlnSW50NjRBcnJheS5mcm9tO1xuICAgIGNvbnN0IGlzQmlnVWludDY0QXJyYXlBdmFpbGFibGUgPSB0eXBlb2YgQmlnVWludDY0QXJyYXkgIT09ICd1bmRlZmluZWQnICYmIEJpZ1VpbnQ2NEFycmF5LmZyb207XG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgY29uc3QgRmxvYXQxNkFycmF5ID0gKGdsb2JhbFRoaXMgYXMgYW55KS5GbG9hdDE2QXJyYXk7XG4gICAgY29uc3QgaXNGbG9hdDE2QXJyYXlBdmFpbGFibGUgPSB0eXBlb2YgRmxvYXQxNkFycmF5ICE9PSAndW5kZWZpbmVkJyAmJiBGbG9hdDE2QXJyYXkuZnJvbTtcblxuICAgIGlmIChpc0JpZ0ludDY0QXJyYXlBdmFpbGFibGUpIHtcbiAgICAgIE5VTUVSSUNfVEVOU09SX1RZUEVfVE9fVFlQRURBUlJBWV9NQVAuc2V0KCdpbnQ2NCcsIEJpZ0ludDY0QXJyYXkpO1xuICAgICAgTlVNRVJJQ19URU5TT1JfVFlQRURBUlJBWV9UT19UWVBFX01BUC5zZXQoQmlnSW50NjRBcnJheSwgJ2ludDY0Jyk7XG4gICAgfVxuICAgIGlmIChpc0JpZ1VpbnQ2NEFycmF5QXZhaWxhYmxlKSB7XG4gICAgICBOVU1FUklDX1RFTlNPUl9UWVBFX1RPX1RZUEVEQVJSQVlfTUFQLnNldCgndWludDY0JywgQmlnVWludDY0QXJyYXkpO1xuICAgICAgTlVNRVJJQ19URU5TT1JfVFlQRURBUlJBWV9UT19UWVBFX01BUC5zZXQoQmlnVWludDY0QXJyYXksICd1aW50NjQnKTtcbiAgICB9XG4gICAgaWYgKGlzRmxvYXQxNkFycmF5QXZhaWxhYmxlKSB7XG4gICAgICBOVU1FUklDX1RFTlNPUl9UWVBFX1RPX1RZUEVEQVJSQVlfTUFQLnNldCgnZmxvYXQxNicsIEZsb2F0MTZBcnJheSk7XG4gICAgICBOVU1FUklDX1RFTlNPUl9UWVBFREFSUkFZX1RPX1RZUEVfTUFQLnNldChGbG9hdDE2QXJyYXksICdmbG9hdDE2Jyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGlmIEZsb2F0MTZBcnJheSBpcyBub3QgYXZhaWxhYmxlLCB1c2UgJ1VpbnQxNkFycmF5JyB0byBzdG9yZSB0aGUgZGF0YS5cbiAgICAgIE5VTUVSSUNfVEVOU09SX1RZUEVfVE9fVFlQRURBUlJBWV9NQVAuc2V0KCdmbG9hdDE2JywgVWludDE2QXJyYXkpO1xuICAgIH1cbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtcbiAgQ3B1UGlubmVkQ29uc3RydWN0b3JQYXJhbWV0ZXJzLFxuICBHcHVCdWZmZXJDb25zdHJ1Y3RvclBhcmFtZXRlcnMsXG4gIE1MVGVuc29yQ29uc3RydWN0b3JQYXJhbWV0ZXJzLFxuICBUZXh0dXJlQ29uc3RydWN0b3JQYXJhbWV0ZXJzLFxufSBmcm9tICcuL3RlbnNvci1mYWN0b3J5LmpzJztcbmltcG9ydCB7IFRlbnNvciB9IGZyb20gJy4vdGVuc29yLWltcGwuanMnO1xuXG4vKipcbiAqIGNhbGN1bGF0ZSBzaXplIGZyb20gZGltcy5cbiAqXG4gKiBAcGFyYW0gZGltcyB0aGUgZGltcyBhcnJheS4gTWF5IGJlIGFuIGlsbGVnYWwgaW5wdXQuXG4gKi9cbmV4cG9ydCBjb25zdCBjYWxjdWxhdGVTaXplID0gKGRpbXM6IHJlYWRvbmx5IHVua25vd25bXSk6IG51bWJlciA9PiB7XG4gIGxldCBzaXplID0gMTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBkaW1zLmxlbmd0aDsgaSsrKSB7XG4gICAgY29uc3QgZGltID0gZGltc1tpXTtcbiAgICBpZiAodHlwZW9mIGRpbSAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc1NhZmVJbnRlZ2VyKGRpbSkpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYGRpbXNbJHtpfV0gbXVzdCBiZSBhbiBpbnRlZ2VyLCBnb3Q6ICR7ZGltfWApO1xuICAgIH1cbiAgICBpZiAoZGltIDwgMCkge1xuICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYGRpbXNbJHtpfV0gbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyLCBnb3Q6ICR7ZGltfWApO1xuICAgIH1cbiAgICBzaXplICo9IGRpbTtcbiAgfVxuICByZXR1cm4gc2l6ZTtcbn07XG5cbi8qKlxuICogaW1wbGVtZW50YXRpb24gb2YgVGVuc29yLnJlc2hhcGUoKVxuICovXG5leHBvcnQgY29uc3QgdGVuc29yUmVzaGFwZSA9ICh0ZW5zb3I6IFRlbnNvciwgZGltczogcmVhZG9ubHkgbnVtYmVyW10pOiBUZW5zb3IgPT4ge1xuICBzd2l0Y2ggKHRlbnNvci5sb2NhdGlvbikge1xuICAgIGNhc2UgJ2NwdSc6XG4gICAgICByZXR1cm4gbmV3IFRlbnNvcih0ZW5zb3IudHlwZSwgdGVuc29yLmRhdGEsIGRpbXMpO1xuICAgIGNhc2UgJ2NwdS1waW5uZWQnOlxuICAgICAgcmV0dXJuIG5ldyBUZW5zb3Ioe1xuICAgICAgICBsb2NhdGlvbjogJ2NwdS1waW5uZWQnLFxuICAgICAgICBkYXRhOiB0ZW5zb3IuZGF0YSBhcyBDcHVQaW5uZWRDb25zdHJ1Y3RvclBhcmFtZXRlcnNbJ2RhdGEnXSxcbiAgICAgICAgdHlwZTogdGVuc29yLnR5cGUgYXMgQ3B1UGlubmVkQ29uc3RydWN0b3JQYXJhbWV0ZXJzWyd0eXBlJ10sXG4gICAgICAgIGRpbXMsXG4gICAgICB9KTtcbiAgICBjYXNlICd0ZXh0dXJlJzpcbiAgICAgIHJldHVybiBuZXcgVGVuc29yKHtcbiAgICAgICAgbG9jYXRpb246ICd0ZXh0dXJlJyxcbiAgICAgICAgdGV4dHVyZTogdGVuc29yLnRleHR1cmUsXG4gICAgICAgIHR5cGU6IHRlbnNvci50eXBlIGFzIFRleHR1cmVDb25zdHJ1Y3RvclBhcmFtZXRlcnNbJ3R5cGUnXSxcbiAgICAgICAgZGltcyxcbiAgICAgIH0pO1xuICAgIGNhc2UgJ2dwdS1idWZmZXInOlxuICAgICAgcmV0dXJuIG5ldyBUZW5zb3Ioe1xuICAgICAgICBsb2NhdGlvbjogJ2dwdS1idWZmZXInLFxuICAgICAgICBncHVCdWZmZXI6IHRlbnNvci5ncHVCdWZmZXIsXG4gICAgICAgIHR5cGU6IHRlbnNvci50eXBlIGFzIEdwdUJ1ZmZlckNvbnN0cnVjdG9yUGFyYW1ldGVyc1sndHlwZSddLFxuICAgICAgICBkaW1zLFxuICAgICAgfSk7XG4gICAgY2FzZSAnbWwtdGVuc29yJzpcbiAgICAgIHJldHVybiBuZXcgVGVuc29yKHtcbiAgICAgICAgbG9jYXRpb246ICdtbC10ZW5zb3InLFxuICAgICAgICBtbFRlbnNvcjogdGVuc29yLm1sVGVuc29yLFxuICAgICAgICB0eXBlOiB0ZW5zb3IudHlwZSBhcyBNTFRlbnNvckNvbnN0cnVjdG9yUGFyYW1ldGVyc1sndHlwZSddLFxuICAgICAgICBkaW1zLFxuICAgICAgfSk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdGVuc29yUmVzaGFwZTogdGVuc29yIGxvY2F0aW9uICR7dGVuc29yLmxvY2F0aW9ufSBpcyBub3Qgc3VwcG9ydGVkYCk7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7IHRlbnNvclRvRGF0YVVSTCwgdGVuc29yVG9JbWFnZURhdGEgfSBmcm9tICcuL3RlbnNvci1jb252ZXJzaW9uLWltcGwuanMnO1xuaW1wb3J0IHsgVGVuc29yVG9EYXRhVXJsT3B0aW9ucywgVGVuc29yVG9JbWFnZURhdGFPcHRpb25zIH0gZnJvbSAnLi90ZW5zb3ItY29udmVyc2lvbi5qcyc7XG5pbXBvcnQge1xuICB0ZW5zb3JGcm9tR3B1QnVmZmVyLFxuICB0ZW5zb3JGcm9tSW1hZ2UsXG4gIHRlbnNvckZyb21NTFRlbnNvcixcbiAgdGVuc29yRnJvbVBpbm5lZEJ1ZmZlcixcbiAgdGVuc29yRnJvbVRleHR1cmUsXG59IGZyb20gJy4vdGVuc29yLWZhY3RvcnktaW1wbC5qcyc7XG5pbXBvcnQge1xuICBDcHVQaW5uZWRDb25zdHJ1Y3RvclBhcmFtZXRlcnMsXG4gIEdwdUJ1ZmZlckNvbnN0cnVjdG9yUGFyYW1ldGVycyxcbiAgTUxUZW5zb3JDb25zdHJ1Y3RvclBhcmFtZXRlcnMsXG4gIFRlbnNvckZyb21HcHVCdWZmZXJPcHRpb25zLFxuICBUZW5zb3JGcm9tSW1hZ2VCaXRtYXBPcHRpb25zLFxuICBUZW5zb3JGcm9tSW1hZ2VEYXRhT3B0aW9ucyxcbiAgVGVuc29yRnJvbUltYWdlRWxlbWVudE9wdGlvbnMsXG4gIFRlbnNvckZyb21NTFRlbnNvck9wdGlvbnMsXG4gIFRlbnNvckZyb21UZXh0dXJlT3B0aW9ucyxcbiAgVGVuc29yRnJvbVVybE9wdGlvbnMsXG4gIFRleHR1cmVDb25zdHJ1Y3RvclBhcmFtZXRlcnMsXG59IGZyb20gJy4vdGVuc29yLWZhY3RvcnkuanMnO1xuaW1wb3J0IHtcbiAgY2hlY2tUeXBlZEFycmF5LFxuICBOVU1FUklDX1RFTlNPUl9UWVBFX1RPX1RZUEVEQVJSQVlfTUFQLFxuICBOVU1FUklDX1RFTlNPUl9UWVBFREFSUkFZX1RPX1RZUEVfTUFQLFxuICBTdXBwb3J0ZWRUeXBlZEFycmF5LFxuICBTdXBwb3J0ZWRUeXBlZEFycmF5Q29uc3RydWN0b3JzLFxufSBmcm9tICcuL3RlbnNvci1pbXBsLXR5cGUtbWFwcGluZy5qcyc7XG5pbXBvcnQgeyBjYWxjdWxhdGVTaXplLCB0ZW5zb3JSZXNoYXBlIH0gZnJvbSAnLi90ZW5zb3ItdXRpbHMtaW1wbC5qcyc7XG5pbXBvcnQgeyBUZW5zb3IgYXMgVGVuc29ySW50ZXJmYWNlIH0gZnJvbSAnLi90ZW5zb3IuanMnO1xuXG4vLyB0eXBlIGFsaWFzZXMgZm9yIHRob3NlIGV4cG9ydGVkIGZyb20gVGVuc29yIGludGVyZmFjZVxuXG50eXBlIFRlbnNvclR5cGUgPSBUZW5zb3JJbnRlcmZhY2UuVHlwZTtcbnR5cGUgVGVuc29yRGF0YVR5cGUgPSBUZW5zb3JJbnRlcmZhY2UuRGF0YVR5cGU7XG50eXBlIFRlbnNvckRhdGFMb2NhdGlvbiA9IFRlbnNvckludGVyZmFjZS5EYXRhTG9jYXRpb247XG50eXBlIFRlbnNvclRleHR1cmVUeXBlID0gVGVuc29ySW50ZXJmYWNlLlRleHR1cmVUeXBlO1xudHlwZSBUZW5zb3JHcHVCdWZmZXJUeXBlID0gVGVuc29ySW50ZXJmYWNlLkdwdUJ1ZmZlclR5cGU7XG50eXBlIFRlbnNvck1MVGVuc29yVHlwZSA9IFRlbnNvckludGVyZmFjZS5NTFRlbnNvclR5cGU7XG5cbi8qKlxuICogdGhlIGltcGxlbWVudGF0aW9uIG9mIFRlbnNvciBpbnRlcmZhY2UuXG4gKlxuICogQGlnbm9yZVxuICovXG5leHBvcnQgY2xhc3MgVGVuc29yIGltcGxlbWVudHMgVGVuc29ySW50ZXJmYWNlIHtcbiAgLy8gI3JlZ2lvbiBjb25zdHJ1Y3RvcnNcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IENQVSB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIHR5cGUsIGRhdGEgYW5kIGRpbXMuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICB0eXBlOiBUZW5zb3JUeXBlLFxuICAgIGRhdGE6IFRlbnNvckRhdGFUeXBlIHwgVWludDhDbGFtcGVkQXJyYXkgfCByZWFkb25seSBzdHJpbmdbXSB8IHJlYWRvbmx5IG51bWJlcltdIHwgcmVhZG9ubHkgYm9vbGVhbltdLFxuICAgIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSxcbiAgKTtcbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBDUFUgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLiBUeXBlIGlzIGluZmVycmVkIGZyb20gZGF0YS5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIGRhdGE6IFRlbnNvckRhdGFUeXBlIHwgVWludDhDbGFtcGVkQXJyYXkgfCByZWFkb25seSBzdHJpbmdbXSB8IHJlYWRvbmx5IGJvb2xlYW5bXSxcbiAgICBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10sXG4gICk7XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBwaW5uZWQgQ1BVIGRhdGEgd2l0aCB0aGUgZ2l2ZW4gdHlwZSBhbmQgZGltcy5cbiAgICpcbiAgICogVGVuc29yJ3MgbG9jYXRpb24gd2lsbCBiZSBzZXQgdG8gJ2NwdS1waW5uZWQnLlxuICAgKlxuICAgKiBAcGFyYW0gcGFyYW1zIC0gU3BlY2lmeSB0aGUgcGFyYW1ldGVycyB0byBjb25zdHJ1Y3QgdGhlIHRlbnNvci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhcmFtczogQ3B1UGlubmVkQ29uc3RydWN0b3JQYXJhbWV0ZXJzKTtcbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIFdlYkdMIHRleHR1cmUgd2l0aCB0aGUgZ2l2ZW4gdHlwZSBhbmQgZGltcy5cbiAgICpcbiAgICogVGVuc29yJ3MgbG9jYXRpb24gd2lsbCBiZSBzZXQgdG8gJ3RleHR1cmUnLlxuICAgKlxuICAgKiBAcGFyYW0gcGFyYW1zIC0gU3BlY2lmeSB0aGUgcGFyYW1ldGVycyB0byBjb25zdHJ1Y3QgdGhlIHRlbnNvci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhcmFtczogVGV4dHVyZUNvbnN0cnVjdG9yUGFyYW1ldGVycyk7XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBXZWJHUFUgYnVmZmVyIHdpdGggdGhlIGdpdmVuIHR5cGUgYW5kIGRpbXMuXG4gICAqXG4gICAqIFRlbnNvcidzIGxvY2F0aW9uIHdpbGwgYmUgc2V0IHRvICdncHUtYnVmZmVyJy5cbiAgICpcbiAgICogQHBhcmFtIHBhcmFtcyAtIFNwZWNpZnkgdGhlIHBhcmFtZXRlcnMgdG8gY29uc3RydWN0IHRoZSB0ZW5zb3IuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXJhbXM6IEdwdUJ1ZmZlckNvbnN0cnVjdG9yUGFyYW1ldGVycyk7XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIFdlYk5OIE1MVGVuc29yIHdpdGggdGhlIGdpdmVuIHR5cGUgYW5kIGRpbXMuXG4gICAqXG4gICAqIFRlbnNvcidzIGxvY2F0aW9uIHdpbGwgYmUgc2V0IHRvICdtbC10ZW5zb3InLlxuICAgKlxuICAgKiBAcGFyYW0gcGFyYW1zIC0gU3BlY2lmeSB0aGUgcGFyYW1ldGVycyB0byBjb25zdHJ1Y3QgdGhlIHRlbnNvci5cbiAgICovXG4gIGNvbnN0cnVjdG9yKHBhcmFtczogTUxUZW5zb3JDb25zdHJ1Y3RvclBhcmFtZXRlcnMpO1xuXG4gIC8qKlxuICAgKiBpbXBsZW1lbnRhdGlvbi5cbiAgICovXG4gIGNvbnN0cnVjdG9yKFxuICAgIGFyZzA6XG4gICAgICB8IFRlbnNvclR5cGVcbiAgICAgIHwgVGVuc29yRGF0YVR5cGVcbiAgICAgIHwgVWludDhDbGFtcGVkQXJyYXlcbiAgICAgIHwgcmVhZG9ubHkgc3RyaW5nW11cbiAgICAgIHwgcmVhZG9ubHkgYm9vbGVhbltdXG4gICAgICB8IENwdVBpbm5lZENvbnN0cnVjdG9yUGFyYW1ldGVyc1xuICAgICAgfCBUZXh0dXJlQ29uc3RydWN0b3JQYXJhbWV0ZXJzXG4gICAgICB8IEdwdUJ1ZmZlckNvbnN0cnVjdG9yUGFyYW1ldGVyc1xuICAgICAgfCBNTFRlbnNvckNvbnN0cnVjdG9yUGFyYW1ldGVycyxcbiAgICBhcmcxPzogVGVuc29yRGF0YVR5cGUgfCBVaW50OENsYW1wZWRBcnJheSB8IHJlYWRvbmx5IG51bWJlcltdIHwgcmVhZG9ubHkgc3RyaW5nW10gfCByZWFkb25seSBib29sZWFuW10sXG4gICAgYXJnMj86IHJlYWRvbmx5IG51bWJlcltdLFxuICApIHtcbiAgICAvLyBwZXJmb3JtIG9uZS10aW1lIGNoZWNrIGZvciBCaWdJbnQvRmxvYXQxNkFycmF5IHN1cHBvcnRcbiAgICBjaGVja1R5cGVkQXJyYXkoKTtcblxuICAgIGxldCB0eXBlOiBUZW5zb3JUeXBlO1xuICAgIGxldCBkaW1zOiByZWFkb25seSBudW1iZXJbXTtcblxuICAgIGlmICh0eXBlb2YgYXJnMCA9PT0gJ29iamVjdCcgJiYgJ2xvY2F0aW9uJyBpbiBhcmcwKSB7XG4gICAgICAvL1xuICAgICAgLy8gY29uc3RydWN0aW5nIHRlbnNvciBmcm9tIHNwZWNpZmljIGxvY2F0aW9uXG4gICAgICAvL1xuICAgICAgdGhpcy5kYXRhTG9jYXRpb24gPSBhcmcwLmxvY2F0aW9uO1xuICAgICAgdHlwZSA9IGFyZzAudHlwZTtcbiAgICAgIGRpbXMgPSBhcmcwLmRpbXM7XG4gICAgICBzd2l0Y2ggKGFyZzAubG9jYXRpb24pIHtcbiAgICAgICAgY2FzZSAnY3B1LXBpbm5lZCc6IHtcbiAgICAgICAgICBjb25zdCBleHBlY3RlZFR5cGVkQXJyYXlDb25zdHJ1Y3RvciA9IE5VTUVSSUNfVEVOU09SX1RZUEVfVE9fVFlQRURBUlJBWV9NQVAuZ2V0KHR5cGUpO1xuICAgICAgICAgIGlmICghZXhwZWN0ZWRUeXBlZEFycmF5Q29uc3RydWN0b3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYHVuc3VwcG9ydGVkIHR5cGUgXCIke3R5cGV9XCIgdG8gY3JlYXRlIHRlbnNvciBmcm9tIHBpbm5lZCBidWZmZXJgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKCEoYXJnMC5kYXRhIGluc3RhbmNlb2YgZXhwZWN0ZWRUeXBlZEFycmF5Q29uc3RydWN0b3IpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBidWZmZXIgc2hvdWxkIGJlIG9mIHR5cGUgJHtleHBlY3RlZFR5cGVkQXJyYXlDb25zdHJ1Y3Rvci5uYW1lfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmNwdURhdGEgPSBhcmcwLmRhdGE7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAndGV4dHVyZSc6IHtcbiAgICAgICAgICBpZiAodHlwZSAhPT0gJ2Zsb2F0MzInKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGB1bnN1cHBvcnRlZCB0eXBlIFwiJHt0eXBlfVwiIHRvIGNyZWF0ZSB0ZW5zb3IgZnJvbSB0ZXh0dXJlYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMuZ3B1VGV4dHVyZURhdGEgPSBhcmcwLnRleHR1cmU7XG4gICAgICAgICAgdGhpcy5kb3dubG9hZGVyID0gYXJnMC5kb3dubG9hZDtcbiAgICAgICAgICB0aGlzLmRpc3Bvc2VyID0gYXJnMC5kaXNwb3NlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ2dwdS1idWZmZXInOiB7XG4gICAgICAgICAgaWYgKFxuICAgICAgICAgICAgdHlwZSAhPT0gJ2Zsb2F0MzInICYmXG4gICAgICAgICAgICB0eXBlICE9PSAnZmxvYXQxNicgJiZcbiAgICAgICAgICAgIHR5cGUgIT09ICdpbnQzMicgJiZcbiAgICAgICAgICAgIHR5cGUgIT09ICdpbnQ2NCcgJiZcbiAgICAgICAgICAgIHR5cGUgIT09ICd1aW50MzInICYmXG4gICAgICAgICAgICB0eXBlICE9PSAndWludDgnICYmXG4gICAgICAgICAgICB0eXBlICE9PSAnYm9vbCcgJiZcbiAgICAgICAgICAgIHR5cGUgIT09ICd1aW50NCcgJiZcbiAgICAgICAgICAgIHR5cGUgIT09ICdpbnQ0J1xuICAgICAgICAgICkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgdW5zdXBwb3J0ZWQgdHlwZSBcIiR7dHlwZX1cIiB0byBjcmVhdGUgdGVuc29yIGZyb20gZ3B1IGJ1ZmZlcmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmdwdUJ1ZmZlckRhdGEgPSBhcmcwLmdwdUJ1ZmZlcjtcbiAgICAgICAgICB0aGlzLmRvd25sb2FkZXIgPSBhcmcwLmRvd25sb2FkO1xuICAgICAgICAgIHRoaXMuZGlzcG9zZXIgPSBhcmcwLmRpc3Bvc2U7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgY2FzZSAnbWwtdGVuc29yJzoge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHR5cGUgIT09ICdmbG9hdDMyJyAmJlxuICAgICAgICAgICAgdHlwZSAhPT0gJ2Zsb2F0MTYnICYmXG4gICAgICAgICAgICB0eXBlICE9PSAnaW50MzInICYmXG4gICAgICAgICAgICB0eXBlICE9PSAnaW50NjQnICYmXG4gICAgICAgICAgICB0eXBlICE9PSAndWludDMyJyAmJlxuICAgICAgICAgICAgdHlwZSAhPT0gJ3VpbnQ2NCcgJiZcbiAgICAgICAgICAgIHR5cGUgIT09ICdpbnQ4JyAmJlxuICAgICAgICAgICAgdHlwZSAhPT0gJ3VpbnQ4JyAmJlxuICAgICAgICAgICAgdHlwZSAhPT0gJ2Jvb2wnICYmXG4gICAgICAgICAgICB0eXBlICE9PSAndWludDQnICYmXG4gICAgICAgICAgICB0eXBlICE9PSAnaW50NCdcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYHVuc3VwcG9ydGVkIHR5cGUgXCIke3R5cGV9XCIgdG8gY3JlYXRlIHRlbnNvciBmcm9tIE1MVGVuc29yYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHRoaXMubWxUZW5zb3JEYXRhID0gYXJnMC5tbFRlbnNvcjtcbiAgICAgICAgICB0aGlzLmRvd25sb2FkZXIgPSBhcmcwLmRvd25sb2FkO1xuICAgICAgICAgIHRoaXMuZGlzcG9zZXIgPSBhcmcwLmRpc3Bvc2U7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFRlbnNvciBjb25zdHJ1Y3RvcjogdW5zdXBwb3J0ZWQgbG9jYXRpb24gJyR7dGhpcy5kYXRhTG9jYXRpb259J2ApO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvL1xuICAgICAgLy8gY29uc3RydWN0aW5nIHRlbnNvciBvZiBsb2NhdGlvbiAnY3B1J1xuICAgICAgLy9cbiAgICAgIGxldCBkYXRhOiBUZW5zb3JEYXRhVHlwZTtcbiAgICAgIGxldCBtYXliZURpbXM6IHR5cGVvZiBhcmcxIHwgdHlwZW9mIGFyZzI7XG4gICAgICAvLyBjaGVjayB3aGV0aGVyIGFyZzAgaXMgdHlwZSBvciBkYXRhXG4gICAgICBpZiAodHlwZW9mIGFyZzAgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgIC8vXG4gICAgICAgIC8vIE92ZXJyaWRlOiBjb25zdHJ1Y3Rvcih0eXBlLCBkYXRhLCAuLi4pXG4gICAgICAgIC8vXG4gICAgICAgIHR5cGUgPSBhcmcwO1xuICAgICAgICBtYXliZURpbXMgPSBhcmcyO1xuICAgICAgICBpZiAoYXJnMCA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAvLyBzdHJpbmcgdGVuc29yXG4gICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGFyZzEpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiQSBzdHJpbmcgdGVuc29yJ3MgZGF0YSBtdXN0IGJlIGEgc3RyaW5nIGFycmF5LlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgLy8gd2UgZG9uJ3QgY2hlY2sgd2hldGhlciBldmVyeSBlbGVtZW50IGluIHRoZSBhcnJheSBpcyBzdHJpbmc7IHRoaXMgaXMgdG9vIHNsb3cuIHdlIGFzc3VtZSBpdCdzIGNvcnJlY3QgYW5kXG4gICAgICAgICAgLy8gZXJyb3Igd2lsbCBiZSBwb3B1bGF0ZWQgYXQgaW5mZXJlbmNlXG4gICAgICAgICAgZGF0YSA9IGFyZzE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gbnVtZXJpYyB0ZW5zb3JcbiAgICAgICAgICBjb25zdCB0eXBlZEFycmF5Q29uc3RydWN0b3IgPSBOVU1FUklDX1RFTlNPUl9UWVBFX1RPX1RZUEVEQVJSQVlfTUFQLmdldChhcmcwKTtcbiAgICAgICAgICBpZiAodHlwZWRBcnJheUNvbnN0cnVjdG9yID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFVuc3VwcG9ydGVkIHRlbnNvciB0eXBlOiAke2FyZzB9LmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShhcmcxKSkge1xuICAgICAgICAgICAgaWYgKChhcmcwID09PSAnZmxvYXQxNicgJiYgdHlwZWRBcnJheUNvbnN0cnVjdG9yID09PSBVaW50MTZBcnJheSkgfHwgYXJnMCA9PT0gJ3VpbnQ0JyB8fCBhcmcwID09PSAnaW50NCcpIHtcbiAgICAgICAgICAgICAgLy8gLSAnZmxvYXQxNic6XG4gICAgICAgICAgICAgIC8vICAgV2hlbiBubyBGbG9hdDE2QXJyYXkgcG9seWZpbGwgaXMgdXNlZCwgd2UgY2Fubm90IGNyZWF0ZSAnZmxvYXQxNicgdGVuc29yIGZyb20gbnVtYmVyIGFycmF5LlxuICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAvLyAgIFRocm93IGVycm9yIGhlcmUgYmVjYXVzZSB3aGVuIHVzZXIgdHJ5IHRvIHVzZSBudW1iZXIgYXJyYXkgYXMgZGF0YSxcbiAgICAgICAgICAgICAgLy8gICBlLmcuIG5ldyBUZW5zb3IoJ2Zsb2F0MTYnLCBbMSwgMiwgMywgNF0sIGRpbXMpKSwgaXQgd2lsbCBhY3R1YWxseSBjYWxsXG4gICAgICAgICAgICAgIC8vICAgVWludDE2QXJyYXkuZnJvbShhcmcxKSB3aGljaCBnZW5lcmF0ZXMgd3JvbmcgZGF0YS5cbiAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgLy8gLSAndWludDQnIGFuZCAnaW50NCc6XG4gICAgICAgICAgICAgIC8vICAgVWludDhBcnJheS5mcm9tKGFyZzEpIHdpbGwgZ2VuZXJhdGUgd3JvbmcgZGF0YSBmb3IgJ3VpbnQ0JyBhbmQgJ2ludDQnIHRlbnNvci5cbiAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcbiAgICAgICAgICAgICAgICBgQ3JlYXRpbmcgYSAke2FyZzB9IHRlbnNvciBmcm9tIG51bWJlciBhcnJheSBpcyBub3Qgc3VwcG9ydGVkLiBQbGVhc2UgdXNlICR7dHlwZWRBcnJheUNvbnN0cnVjdG9yLm5hbWV9IGFzIGRhdGEuYCxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYXJnMCA9PT0gJ3VpbnQ2NCcgfHwgYXJnMCA9PT0gJ2ludDY0Jykge1xuICAgICAgICAgICAgICAvLyB1c2UgJ2FzIGFueScgaGVyZSBiZWNhdXNlOlxuICAgICAgICAgICAgICAvLyAxLiBUeXBlU2NyaXB0J3MgY2hlY2sgb24gdHlwZSBvZiAnQXJyYXkuaXNBcnJheSgpJyBkb2VzIG5vdCB3b3JrIHdpdGggcmVhZG9ubHkgYXJyYXlzLlxuICAgICAgICAgICAgICAvLyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9UeXBlU2NyaXB0L2lzc3Vlcy8xNzAwMlxuICAgICAgICAgICAgICAvLyAyLiBUeXBlU2NyaXB0J3MgY2hlY2sgb24gdW5pb24gdHlwZSBvZiAnKEJpZ0ludDY0QXJyYXlDb25zdHJ1Y3RvcnxCaWdVaW50NjRBcnJheUNvbnN0cnVjdG9yKS5mcm9tKCknXG4gICAgICAgICAgICAgIC8vIGRvZXMgbm90IGFjY2VwdCBwYXJhbWV0ZXIgbWFwRm4uXG4gICAgICAgICAgICAgIC8vIDMuIHBhcmFtZXRlcnMgb2YgJ1N1cHBvcnRlZFR5cGVkQXJyYXlDb25zdHJ1Y3RvcnMuZnJvbSgpJyBkb2VzIG5vdCBtYXRjaCB0aGUgcmVxdWlyZW1lbnQgb2YgdGhlIHVuaW9uXG4gICAgICAgICAgICAgIC8vIHR5cGUuXG5cbiAgICAgICAgICAgICAgLy8gYXNzdW1lICdhcmcxJyBpcyBvZiB0eXBlIFwicmVhZG9ubHkgbnVtYmVyW118cmVhZG9ubHkgYmlnaW50W11cIiBoZXJlLlxuXG4gICAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgICAgICAgIGRhdGEgPSAodHlwZWRBcnJheUNvbnN0cnVjdG9yIGFzIGFueSkuZnJvbShhcmcxLCBCaWdJbnQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgLy8gYXNzdW1lICdhcmcxJyBpcyBvZiB0eXBlIFwicmVhZG9ubHkgbnVtYmVyW11cIiBoZXJlLlxuICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICAgICAgICBkYXRhID0gKHR5cGVkQXJyYXlDb25zdHJ1Y3RvciBhcyBhbnkpLmZyb20oYXJnMSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChhcmcxIGluc3RhbmNlb2YgdHlwZWRBcnJheUNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICBkYXRhID0gYXJnMTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGFyZzEgaW5zdGFuY2VvZiBVaW50OENsYW1wZWRBcnJheSkge1xuICAgICAgICAgICAgaWYgKGFyZzAgPT09ICd1aW50OCcpIHtcbiAgICAgICAgICAgICAgZGF0YSA9IFVpbnQ4QXJyYXkuZnJvbShhcmcxKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEEgVWludDhDbGFtcGVkQXJyYXkgdGVuc29yJ3MgZGF0YSBtdXN0IGJlIHR5cGUgb2YgdWludDhgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKGFyZzAgPT09ICdmbG9hdDE2JyAmJiBhcmcxIGluc3RhbmNlb2YgVWludDE2QXJyYXkgJiYgdHlwZWRBcnJheUNvbnN0cnVjdG9yICE9PSBVaW50MTZBcnJheSkge1xuICAgICAgICAgICAgLy8gd2hlbiBGbG9hdDE2QXJyYXkgaXMgYXZhaWxhYmxlIGFuZCBkYXRhIGlzIG9mIHR5cGUgVWludDE2QXJyYXkuXG4gICAgICAgICAgICAvLyBXZSBhbGxvdyBVaW50MTZBcnJheSB0byBiZSBwYXNzZWQgaW4gYXMgZGF0YSBmb3IgJ2Zsb2F0MTYnIHRlbnNvciB1bnRpbCBGbG9hdDE2QXJyYXkgaXMgZ2VuZXJhbGx5XG4gICAgICAgICAgICAvLyBzdXBwb3J0ZWQgaW4gSmF2YVNjcmlwdCBlbnZpcm9ubWVudC5cblxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgICAgICAgIGRhdGEgPSBuZXcgKGdsb2JhbFRoaXMgYXMgYW55KS5GbG9hdDE2QXJyYXkoYXJnMS5idWZmZXIsIGFyZzEuYnl0ZU9mZnNldCwgYXJnMS5sZW5ndGgpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBBICR7dHlwZX0gdGVuc29yJ3MgZGF0YSBtdXN0IGJlIHR5cGUgb2YgJHt0eXBlZEFycmF5Q29uc3RydWN0b3J9YCk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvL1xuICAgICAgICAvLyBPdmVycmlkZTogY29uc3RydWN0b3IoZGF0YSwgLi4uKVxuICAgICAgICAvL1xuICAgICAgICBtYXliZURpbXMgPSBhcmcxO1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShhcmcwKSkge1xuICAgICAgICAgIC8vIG9ubHkgYm9vbGVhbltdIGFuZCBzdHJpbmdbXSBpcyBzdXBwb3J0ZWRcbiAgICAgICAgICBpZiAoYXJnMC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RlbnNvciB0eXBlIGNhbm5vdCBiZSBpbmZlcnJlZCBmcm9tIGFuIGVtcHR5IGFycmF5LicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBmaXJzdEVsZW1lbnRUeXBlID0gdHlwZW9mIGFyZzBbMF07XG4gICAgICAgICAgaWYgKGZpcnN0RWxlbWVudFR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICB0eXBlID0gJ3N0cmluZyc7XG4gICAgICAgICAgICBkYXRhID0gYXJnMDtcbiAgICAgICAgICB9IGVsc2UgaWYgKGZpcnN0RWxlbWVudFR5cGUgPT09ICdib29sZWFuJykge1xuICAgICAgICAgICAgdHlwZSA9ICdib29sJztcbiAgICAgICAgICAgIC8vICdhcmcwJyBpcyBvZiB0eXBlICdib29sZWFuW10nLiBVaW50OEFycmF5LmZyb20oYm9vbGVhbltdKSBhY3R1YWxseSB3b3JrcywgYnV0IHR5cGVzY3JpcHQgdGhpbmtzIHRoaXMgaXNcbiAgICAgICAgICAgIC8vIHdyb25nIHR5cGUuIFdlIHVzZSAnYXMgYW55JyB0byBtYWtlIGl0IGhhcHB5LlxuICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgICAgICAgIGRhdGEgPSBVaW50OEFycmF5LmZyb20oYXJnMCBhcyBhbnlbXSk7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEludmFsaWQgZWxlbWVudCB0eXBlIG9mIGRhdGEgYXJyYXk6ICR7Zmlyc3RFbGVtZW50VHlwZX0uYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKGFyZzAgaW5zdGFuY2VvZiBVaW50OENsYW1wZWRBcnJheSkge1xuICAgICAgICAgIHR5cGUgPSAndWludDgnO1xuICAgICAgICAgIGRhdGEgPSBVaW50OEFycmF5LmZyb20oYXJnMCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgLy8gZ2V0IHRlbnNvciB0eXBlIGZyb20gVHlwZWRBcnJheVxuICAgICAgICAgIGNvbnN0IG1hcHBlZFR5cGUgPSBOVU1FUklDX1RFTlNPUl9UWVBFREFSUkFZX1RPX1RZUEVfTUFQLmdldChcbiAgICAgICAgICAgIGFyZzAuY29uc3RydWN0b3IgYXMgU3VwcG9ydGVkVHlwZWRBcnJheUNvbnN0cnVjdG9ycyxcbiAgICAgICAgICApO1xuICAgICAgICAgIGlmIChtYXBwZWRUeXBlID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYFVuc3VwcG9ydGVkIHR5cGUgZm9yIHRlbnNvciBkYXRhOiAke2FyZzAuY29uc3RydWN0b3J9LmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0eXBlID0gbWFwcGVkVHlwZTtcbiAgICAgICAgICBkYXRhID0gYXJnMCBhcyBTdXBwb3J0ZWRUeXBlZEFycmF5O1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHR5cGUgYW5kIGRhdGEgaXMgcHJvY2Vzc2VkLCBub3cgcHJvY2Vzc2luZyBkaW1zXG4gICAgICBpZiAobWF5YmVEaW1zID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgLy8gYXNzdW1lIDEtRCB0ZW5zb3IgaWYgZGltcyBvbWl0dGVkXG4gICAgICAgIG1heWJlRGltcyA9IFtkYXRhLmxlbmd0aF07XG4gICAgICB9IGVsc2UgaWYgKCFBcnJheS5pc0FycmF5KG1heWJlRGltcykpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkEgdGVuc29yJ3MgZGltcyBtdXN0IGJlIGEgbnVtYmVyIGFycmF5XCIpO1xuICAgICAgfVxuICAgICAgZGltcyA9IG1heWJlRGltcyBhcyByZWFkb25seSBudW1iZXJbXTtcblxuICAgICAgdGhpcy5jcHVEYXRhID0gZGF0YTtcbiAgICAgIHRoaXMuZGF0YUxvY2F0aW9uID0gJ2NwdSc7XG4gICAgfVxuXG4gICAgLy8gcGVyZm9ybSBjaGVjayBvbiBkaW1zXG4gICAgY29uc3Qgc2l6ZSA9IGNhbGN1bGF0ZVNpemUoZGltcyk7XG4gICAgLy8gaWYgZGF0YSBpcyBvbiBDUFUsIGNoZWNrIHdoZXRoZXIgZGF0YSBsZW5ndGggbWF0Y2hlcyB0ZW5zb3Igc2l6ZVxuICAgIGlmICh0aGlzLmNwdURhdGEgJiYgc2l6ZSAhPT0gdGhpcy5jcHVEYXRhLmxlbmd0aCkge1xuICAgICAgaWYgKCh0eXBlID09PSAndWludDQnIHx8IHR5cGUgPT09ICdpbnQ0JykgJiYgTWF0aC5jZWlsKHNpemUgLyAyKSA9PT0gdGhpcy5jcHVEYXRhLmxlbmd0aCkge1xuICAgICAgICAvLyBmb3IgKHUpaW50NCwgdGhlIGRhdGEgbGVuZ3RoIGlzIGhhbGYgb2YgdGhlIHRlbnNvciBzaXplLiBTbyB3ZSBjaGVjayB0aGlzIHNwZWNpYWwgY2FzZSB3aGVuIHNpemUgaXMgb2RkLlxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUZW5zb3IncyBzaXplKCR7c2l6ZX0pIGRvZXMgbm90IG1hdGNoIGRhdGEgbGVuZ3RoKCR7dGhpcy5jcHVEYXRhLmxlbmd0aH0pLmApO1xuICAgICAgfVxuICAgIH1cblxuICAgIHRoaXMudHlwZSA9IHR5cGU7XG4gICAgdGhpcy5kaW1zID0gZGltcztcbiAgICB0aGlzLnNpemUgPSBzaXplO1xuICB9XG4gIC8vICNlbmRyZWdpb25cblxuICAvLyAjcmVnaW9uIGZhY3RvcnlcbiAgc3RhdGljIGFzeW5jIGZyb21JbWFnZShcbiAgICBpbWFnZTogSW1hZ2VEYXRhIHwgSFRNTEltYWdlRWxlbWVudCB8IEltYWdlQml0bWFwIHwgc3RyaW5nLFxuICAgIG9wdGlvbnM/OlxuICAgICAgfCBUZW5zb3JGcm9tSW1hZ2VEYXRhT3B0aW9uc1xuICAgICAgfCBUZW5zb3JGcm9tSW1hZ2VFbGVtZW50T3B0aW9uc1xuICAgICAgfCBUZW5zb3JGcm9tSW1hZ2VCaXRtYXBPcHRpb25zXG4gICAgICB8IFRlbnNvckZyb21VcmxPcHRpb25zLFxuICApOiBQcm9taXNlPFRlbnNvckludGVyZmFjZT4ge1xuICAgIHJldHVybiB0ZW5zb3JGcm9tSW1hZ2UoaW1hZ2UsIG9wdGlvbnMpO1xuICB9XG5cbiAgc3RhdGljIGZyb21UZXh0dXJlPFQgZXh0ZW5kcyBUZW5zb3JJbnRlcmZhY2UuVGV4dHVyZURhdGFUeXBlcz4oXG4gICAgdGV4dHVyZTogVGVuc29yVGV4dHVyZVR5cGUsXG4gICAgb3B0aW9uczogVGVuc29yRnJvbVRleHR1cmVPcHRpb25zPFQ+LFxuICApOiBUZW5zb3JJbnRlcmZhY2Uge1xuICAgIHJldHVybiB0ZW5zb3JGcm9tVGV4dHVyZSh0ZXh0dXJlLCBvcHRpb25zKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tR3B1QnVmZmVyPFQgZXh0ZW5kcyBUZW5zb3JJbnRlcmZhY2UuR3B1QnVmZmVyRGF0YVR5cGVzPihcbiAgICBncHVCdWZmZXI6IFRlbnNvckdwdUJ1ZmZlclR5cGUsXG4gICAgb3B0aW9uczogVGVuc29yRnJvbUdwdUJ1ZmZlck9wdGlvbnM8VD4sXG4gICk6IFRlbnNvckludGVyZmFjZSB7XG4gICAgcmV0dXJuIHRlbnNvckZyb21HcHVCdWZmZXIoZ3B1QnVmZmVyLCBvcHRpb25zKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tTUxUZW5zb3I8VCBleHRlbmRzIFRlbnNvckludGVyZmFjZS5NTFRlbnNvckRhdGFUeXBlcz4oXG4gICAgbWxUZW5zb3I6IFRlbnNvck1MVGVuc29yVHlwZSxcbiAgICBvcHRpb25zOiBUZW5zb3JGcm9tTUxUZW5zb3JPcHRpb25zPFQ+LFxuICApOiBUZW5zb3JJbnRlcmZhY2Uge1xuICAgIHJldHVybiB0ZW5zb3JGcm9tTUxUZW5zb3IobWxUZW5zb3IsIG9wdGlvbnMpO1xuICB9XG5cbiAgc3RhdGljIGZyb21QaW5uZWRCdWZmZXI8VCBleHRlbmRzIFRlbnNvckludGVyZmFjZS5DcHVQaW5uZWREYXRhVHlwZXM+KFxuICAgIHR5cGU6IFQsXG4gICAgYnVmZmVyOiBUZW5zb3JJbnRlcmZhY2UuRGF0YVR5cGVNYXBbVF0sXG4gICAgZGltcz86IHJlYWRvbmx5IG51bWJlcltdLFxuICApOiBUZW5zb3Ige1xuICAgIHJldHVybiB0ZW5zb3JGcm9tUGlubmVkQnVmZmVyKHR5cGUsIGJ1ZmZlciwgZGltcyk7XG4gIH1cblxuICAvLyAjZW5kcmVnaW9uXG5cbiAgLy8gI3JlZ2lvbiBjb252ZXJzaW9uc1xuICB0b0RhdGFVUkwob3B0aW9ucz86IFRlbnNvclRvRGF0YVVybE9wdGlvbnMpOiBzdHJpbmcge1xuICAgIHJldHVybiB0ZW5zb3JUb0RhdGFVUkwodGhpcywgb3B0aW9ucyk7XG4gIH1cblxuICB0b0ltYWdlRGF0YShvcHRpb25zPzogVGVuc29yVG9JbWFnZURhdGFPcHRpb25zKTogSW1hZ2VEYXRhIHtcbiAgICByZXR1cm4gdGVuc29yVG9JbWFnZURhdGEodGhpcywgb3B0aW9ucyk7XG4gIH1cbiAgLy8gI2VuZHJlZ2lvblxuXG4gIC8vICNyZWdpb24gcHVibGljIGZpZWxkc1xuICByZWFkb25seSBkaW1zOiByZWFkb25seSBudW1iZXJbXTtcbiAgcmVhZG9ubHkgdHlwZTogVGVuc29yVHlwZTtcbiAgcmVhZG9ubHkgc2l6ZTogbnVtYmVyO1xuICAvLyAjZW5kcmVnaW9uXG5cbiAgLy8gI3JlZ2lvbiBwcml2YXRlIGZpZWxkc1xuXG4gIC8qKlxuICAgKiBzdG9yZXMgdGhlIGxvY2F0aW9uIG9mIHRoZSBkYXRhLlxuICAgKi9cbiAgcHJpdmF0ZSBkYXRhTG9jYXRpb246IFRlbnNvckRhdGFMb2NhdGlvbjtcblxuICAvKipcbiAgICogc3RvcmVzIHRoZSBkYXRhIG9uIENQVSwgaWYgbG9jYXRpb24gaXMgJ2NwdScgb3IgJ2NwdS1waW5uZWQnLiBvdGhlcndpc2UgZW1wdHkuXG4gICAqL1xuICBwcml2YXRlIGNwdURhdGE/OiBUZW5zb3JEYXRhVHlwZTtcblxuICAvKipcbiAgICogc3RvcmVzIHRoZSB1bmRlcmx5aW5nIHRleHR1cmUgd2hlbiBsb2NhdGlvbiBpcyAndGV4dHVyZScuIG90aGVyd2lzZSBlbXB0eS5cbiAgICovXG4gIHByaXZhdGUgZ3B1VGV4dHVyZURhdGE/OiBUZW5zb3JUZXh0dXJlVHlwZTtcblxuICAvKipcbiAgICogc3RvcmVzIHRoZSB1bmRlcmx5aW5nIEdQVSBidWZmZXIgd2hlbiBsb2NhdGlvbiBpcyAnZ3B1LWJ1ZmZlcicuIG90aGVyd2lzZSBlbXB0eS5cbiAgICovXG4gIHByaXZhdGUgZ3B1QnVmZmVyRGF0YT86IFRlbnNvckdwdUJ1ZmZlclR5cGU7XG5cbiAgLyoqXG4gICAqIHN0b3JlcyB0aGUgdW5kZXJseWluZyBXZWJOTiBNTFRlbnNvciB3aGVuIGxvY2F0aW9uIGlzICdtbC10ZW5zb3InLiBvdGhlcndpc2UgZW1wdHkuXG4gICAqL1xuICBwcml2YXRlIG1sVGVuc29yRGF0YT86IFRlbnNvck1MVGVuc29yVHlwZTtcblxuICAvKipcbiAgICogc3RvcmVzIGFuIG9wdGlvbmFsIGRvd25sb2FkZXIgZnVuY3Rpb24gdG8gZG93bmxvYWQgZGF0YSBmcm9tIEdQVSB0byBDUFUuXG4gICAqL1xuICBwcml2YXRlIGRvd25sb2FkZXI/KCk6IFByb21pc2U8VGVuc29yRGF0YVR5cGU+O1xuXG4gIC8qKlxuICAgKiBhIGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBkYXRhIGlzIGJlaW5nIGRvd25sb2FkZWQgZnJvbSBHUFUgdG8gQ1BVLlxuICAgKi9cbiAgcHJpdmF0ZSBpc0Rvd25sb2FkaW5nPzogYm9vbGVhbjtcblxuICAvKipcbiAgICogc3RvcmVzIGFuIG9wdGlvbmFsIGRpc3Bvc2VyIGZ1bmN0aW9uIHRvIGRpc3Bvc2UgdGhlIHVuZGVybHlpbmcgZGF0YS5cbiAgICovXG4gIHByaXZhdGUgZGlzcG9zZXI/KCk6IHZvaWQ7XG4gIC8vICNlbmRyZWdpb25cblxuICAvLyAjcmVnaW9uIHByb3BlcnRpZXNcbiAgZ2V0IGRhdGEoKTogVGVuc29yRGF0YVR5cGUge1xuICAgIHRoaXMuZW5zdXJlVmFsaWQoKTtcbiAgICBpZiAoIXRoaXMuY3B1RGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAnVGhlIGRhdGEgaXMgbm90IG9uIENQVS4gVXNlIGBnZXREYXRhKClgIHRvIGRvd25sb2FkIEdQVSBkYXRhIHRvIENQVSwgJyArXG4gICAgICAgICAgJ29yIHVzZSBgdGV4dHVyZWAgb3IgYGdwdUJ1ZmZlcmAgcHJvcGVydHkgdG8gYWNjZXNzIHRoZSBHUFUgZGF0YSBkaXJlY3RseS4nLFxuICAgICAgKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuY3B1RGF0YTtcbiAgfVxuXG4gIGdldCBsb2NhdGlvbigpOiBUZW5zb3JEYXRhTG9jYXRpb24ge1xuICAgIHJldHVybiB0aGlzLmRhdGFMb2NhdGlvbjtcbiAgfVxuXG4gIGdldCB0ZXh0dXJlKCk6IFRlbnNvclRleHR1cmVUeXBlIHtcbiAgICB0aGlzLmVuc3VyZVZhbGlkKCk7XG4gICAgaWYgKCF0aGlzLmdwdVRleHR1cmVEYXRhKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBkYXRhIGlzIG5vdCBzdG9yZWQgYXMgYSBXZWJHTCB0ZXh0dXJlLicpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5ncHVUZXh0dXJlRGF0YTtcbiAgfVxuXG4gIGdldCBncHVCdWZmZXIoKTogVGVuc29yR3B1QnVmZmVyVHlwZSB7XG4gICAgdGhpcy5lbnN1cmVWYWxpZCgpO1xuICAgIGlmICghdGhpcy5ncHVCdWZmZXJEYXRhKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBkYXRhIGlzIG5vdCBzdG9yZWQgYXMgYSBXZWJHUFUgYnVmZmVyLicpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5ncHVCdWZmZXJEYXRhO1xuICB9XG5cbiAgZ2V0IG1sVGVuc29yKCk6IFRlbnNvck1MVGVuc29yVHlwZSB7XG4gICAgdGhpcy5lbnN1cmVWYWxpZCgpO1xuICAgIGlmICghdGhpcy5tbFRlbnNvckRhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGRhdGEgaXMgbm90IHN0b3JlZCBhcyBhIFdlYk5OIE1MVGVuc29yLicpO1xuICAgIH1cbiAgICByZXR1cm4gdGhpcy5tbFRlbnNvckRhdGE7XG4gIH1cbiAgLy8gI2VuZHJlZ2lvblxuXG4gIC8vICNyZWdpb24gbWV0aG9kc1xuXG4gIGFzeW5jIGdldERhdGEocmVsZWFzZURhdGE/OiBib29sZWFuKTogUHJvbWlzZTxUZW5zb3JEYXRhVHlwZT4ge1xuICAgIHRoaXMuZW5zdXJlVmFsaWQoKTtcbiAgICBzd2l0Y2ggKHRoaXMuZGF0YUxvY2F0aW9uKSB7XG4gICAgICBjYXNlICdjcHUnOlxuICAgICAgY2FzZSAnY3B1LXBpbm5lZCc6XG4gICAgICAgIHJldHVybiB0aGlzLmRhdGE7XG4gICAgICBjYXNlICd0ZXh0dXJlJzpcbiAgICAgIGNhc2UgJ2dwdS1idWZmZXInOlxuICAgICAgY2FzZSAnbWwtdGVuc29yJzoge1xuICAgICAgICBpZiAoIXRoaXMuZG93bmxvYWRlcikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGN1cnJlbnQgdGVuc29yIGlzIG5vdCBjcmVhdGVkIHdpdGggYSBzcGVjaWZpZWQgZGF0YSBkb3dubG9hZGVyLicpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh0aGlzLmlzRG93bmxvYWRpbmcpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBjdXJyZW50IHRlbnNvciBpcyBiZWluZyBkb3dubG9hZGVkLicpO1xuICAgICAgICB9XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgdGhpcy5pc0Rvd25sb2FkaW5nID0gdHJ1ZTtcbiAgICAgICAgICBjb25zdCBkYXRhID0gYXdhaXQgdGhpcy5kb3dubG9hZGVyKCk7XG4gICAgICAgICAgdGhpcy5kb3dubG9hZGVyID0gdW5kZWZpbmVkO1xuICAgICAgICAgIHRoaXMuZGF0YUxvY2F0aW9uID0gJ2NwdSc7XG4gICAgICAgICAgdGhpcy5jcHVEYXRhID0gZGF0YTtcblxuICAgICAgICAgIGlmIChyZWxlYXNlRGF0YSAmJiB0aGlzLmRpc3Bvc2VyKSB7XG4gICAgICAgICAgICB0aGlzLmRpc3Bvc2VyKCk7XG4gICAgICAgICAgICB0aGlzLmRpc3Bvc2VyID0gdW5kZWZpbmVkO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIHJldHVybiBkYXRhO1xuICAgICAgICB9IGZpbmFsbHkge1xuICAgICAgICAgIHRoaXMuaXNEb3dubG9hZGluZyA9IGZhbHNlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBkZWZhdWx0OlxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGNhbm5vdCBnZXQgZGF0YSBmcm9tIGxvY2F0aW9uOiAke3RoaXMuZGF0YUxvY2F0aW9ufWApO1xuICAgIH1cbiAgfVxuXG4gIGRpc3Bvc2UoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuaXNEb3dubG9hZGluZykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgY3VycmVudCB0ZW5zb3IgaXMgYmVpbmcgZG93bmxvYWRlZC4nKTtcbiAgICB9XG5cbiAgICBpZiAodGhpcy5kaXNwb3Nlcikge1xuICAgICAgdGhpcy5kaXNwb3NlcigpO1xuICAgICAgdGhpcy5kaXNwb3NlciA9IHVuZGVmaW5lZDtcbiAgICB9XG4gICAgdGhpcy5jcHVEYXRhID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZ3B1VGV4dHVyZURhdGEgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5ncHVCdWZmZXJEYXRhID0gdW5kZWZpbmVkO1xuICAgIHRoaXMubWxUZW5zb3JEYXRhID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZG93bmxvYWRlciA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmlzRG93bmxvYWRpbmcgPSB1bmRlZmluZWQ7XG5cbiAgICB0aGlzLmRhdGFMb2NhdGlvbiA9ICdub25lJztcbiAgfVxuXG4gIC8vICNlbmRyZWdpb25cblxuICAvLyAjcmVnaW9uIHRlbnNvciB1dGlsaXRpZXNcbiAgcHJpdmF0ZSBlbnN1cmVWYWxpZCgpOiB2b2lkIHtcbiAgICBpZiAodGhpcy5kYXRhTG9jYXRpb24gPT09ICdub25lJykge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgdGVuc29yIGlzIGRpc3Bvc2VkLicpO1xuICAgIH1cbiAgfVxuXG4gIHJlc2hhcGUoZGltczogcmVhZG9ubHkgbnVtYmVyW10pOiBUZW5zb3JJbnRlcmZhY2Uge1xuICAgIHRoaXMuZW5zdXJlVmFsaWQoKTtcbiAgICBpZiAodGhpcy5kb3dubG9hZGVyIHx8IHRoaXMuZGlzcG9zZXIpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2Fubm90IHJlc2hhcGUgYSB0ZW5zb3IgdGhhdCBvd25zIEdQVSByZXNvdXJjZS4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHRlbnNvclJlc2hhcGUodGhpcywgZGltcyk7XG4gIH1cbiAgLy8gI2VuZHJlZ2lvblxufVxuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgeyBUZW5zb3JGYWN0b3J5IH0gZnJvbSAnLi90ZW5zb3ItZmFjdG9yeS5qcyc7XG5pbXBvcnQgeyBUZW5zb3IgYXMgVGVuc29ySW1wbCB9IGZyb20gJy4vdGVuc29yLWltcGwuanMnO1xuaW1wb3J0IHsgVHlwZWRUZW5zb3JVdGlscyB9IGZyb20gJy4vdGVuc29yLXV0aWxzLmpzJztcbmltcG9ydCB7IFRyeUdldEdsb2JhbFR5cGUgfSBmcm9tICcuL3R5cGUtaGVscGVyLmpzJztcblxuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlZGVjbGFyZSAqL1xuXG4vKipcbiAqIHJlcHJlc2VudCBhIGJhc2ljIHRlbnNvciB3aXRoIHNwZWNpZmllZCBkaW1lbnNpb25zIGFuZCBkYXRhIHR5cGUuXG4gKi9cbmludGVyZmFjZSBUeXBlZFRlbnNvckJhc2U8VCBleHRlbmRzIFRlbnNvci5UeXBlPiB7XG4gIC8qKlxuICAgKiBHZXQgdGhlIGRpbWVuc2lvbnMgb2YgdGhlIHRlbnNvci5cbiAgICovXG4gIHJlYWRvbmx5IGRpbXM6IHJlYWRvbmx5IG51bWJlcltdO1xuICAvKipcbiAgICogR2V0IHRoZSBkYXRhIHR5cGUgb2YgdGhlIHRlbnNvci5cbiAgICovXG4gIHJlYWRvbmx5IHR5cGU6IFQ7XG4gIC8qKlxuICAgKiBHZXQgdGhlIGJ1ZmZlciBkYXRhIG9mIHRoZSB0ZW5zb3IuXG4gICAqXG4gICAqIElmIHRoZSBkYXRhIGlzIG5vdCBvbiBDUFUgKGVnLiBpdCdzIGluIHRoZSBmb3JtIG9mIFdlYkdMIHRleHR1cmUgb3IgV2ViR1BVIGJ1ZmZlciksIHRocm93IGVycm9yLlxuICAgKi9cbiAgcmVhZG9ubHkgZGF0YTogVGVuc29yLkRhdGFUeXBlTWFwW1RdO1xuICAvKipcbiAgICogR2V0IHRoZSBsb2NhdGlvbiBvZiB0aGUgZGF0YS5cbiAgICovXG4gIHJlYWRvbmx5IGxvY2F0aW9uOiBUZW5zb3IuRGF0YUxvY2F0aW9uO1xuICAvKipcbiAgICogR2V0IHRoZSBXZWJHTCB0ZXh0dXJlIHRoYXQgaG9sZHMgdGhlIHRlbnNvciBkYXRhLlxuICAgKlxuICAgKiBJZiB0aGUgZGF0YSBpcyBub3Qgb24gR1BVIGFzIFdlYkdMIHRleHR1cmUsIHRocm93IGVycm9yLlxuICAgKi9cbiAgcmVhZG9ubHkgdGV4dHVyZTogVGVuc29yLlRleHR1cmVUeXBlO1xuICAvKipcbiAgICogR2V0IHRoZSBXZWJHUFUgYnVmZmVyIHRoYXQgaG9sZHMgdGhlIHRlbnNvciBkYXRhLlxuICAgKlxuICAgKiBJZiB0aGUgZGF0YSBpcyBub3Qgb24gR1BVIGFzIFdlYkdQVSBidWZmZXIsIHRocm93IGVycm9yLlxuICAgKi9cbiAgcmVhZG9ubHkgZ3B1QnVmZmVyOiBUZW5zb3IuR3B1QnVmZmVyVHlwZTtcblxuICAvKipcbiAgICogR2V0IHRoZSBXZWJOTiBNTFRlbnNvciB0aGF0IGhvbGRzIHRoZSB0ZW5zb3IgZGF0YS5cbiAgICpcbiAgICogSWYgdGhlIGRhdGEgaXMgbm90IGluIGEgV2ViTk4gTUxUZW5zb3IsIHRocm93IGVycm9yLlxuICAgKi9cbiAgcmVhZG9ubHkgbWxUZW5zb3I6IFRlbnNvci5NTFRlbnNvclR5cGU7XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgYnVmZmVyIGRhdGEgb2YgdGhlIHRlbnNvci5cbiAgICpcbiAgICogSWYgdGhlIGRhdGEgaXMgb24gQ1BVLCByZXR1cm5zIHRoZSBkYXRhIGltbWVkaWF0ZWx5LlxuICAgKiBJZiB0aGUgZGF0YSBpcyBvbiBHUFUsIGRvd25sb2FkcyB0aGUgZGF0YSBhbmQgcmV0dXJucyB0aGUgcHJvbWlzZS5cbiAgICpcbiAgICogQHBhcmFtIHJlbGVhc2VEYXRhIC0gd2hldGhlciByZWxlYXNlIHRoZSBkYXRhIG9uIEdQVS4gSWdub3JlIGlmIGRhdGEgaXMgYWxyZWFkeSBvbiBDUFUuXG4gICAqL1xuICBnZXREYXRhKHJlbGVhc2VEYXRhPzogYm9vbGVhbik6IFByb21pc2U8VGVuc29yLkRhdGFUeXBlTWFwW1RdPjtcblxuICAvKipcbiAgICogRGlzcG9zZSB0aGUgdGVuc29yIGRhdGEuXG4gICAqXG4gICAqIElmIHRoZSBkYXRhIGlzIG9uIENQVSwgcmVtb3ZlIGl0cyBpbnRlcm5hbCByZWZlcmVuY2UgdG8gdGhlIHVuZGVybHlpbmcgZGF0YS5cbiAgICogSWYgdGhlIGRhdGEgaXMgb24gR1BVLCByZWxlYXNlIHRoZSBkYXRhIG9uIEdQVS5cbiAgICpcbiAgICogQWZ0ZXIgY2FsbGluZyB0aGlzIGZ1bmN0aW9uLCB0aGUgdGVuc29yIGlzIGNvbnNpZGVyZWQgbm8gbG9uZ2VyIHZhbGlkLiBJdHMgbG9jYXRpb24gd2lsbCBiZSBzZXQgdG8gJ25vbmUnLlxuICAgKi9cbiAgZGlzcG9zZSgpOiB2b2lkO1xufVxuXG5leHBvcnQgZGVjbGFyZSBuYW1lc3BhY2UgVGVuc29yIHtcbiAgaW50ZXJmYWNlIERhdGFUeXBlTWFwIHtcbiAgICBmbG9hdDMyOiBGbG9hdDMyQXJyYXk7XG4gICAgdWludDg6IFVpbnQ4QXJyYXk7XG4gICAgaW50ODogSW50OEFycmF5O1xuICAgIHVpbnQxNjogVWludDE2QXJyYXk7XG4gICAgaW50MTY6IEludDE2QXJyYXk7XG4gICAgaW50MzI6IEludDMyQXJyYXk7XG4gICAgaW50NjQ6IEJpZ0ludDY0QXJyYXk7XG4gICAgc3RyaW5nOiBzdHJpbmdbXTtcbiAgICBib29sOiBVaW50OEFycmF5O1xuICAgIGZsb2F0MTY6IFVpbnQxNkFycmF5OyAvLyBLZWVwIHVzaW5nIFVpbnQxNkFycmF5IHVudGlsIHdlIGhhdmUgYSBjb25jcmV0ZSBzb2x1dGlvbiBmb3IgZmxvYXQgMTYuXG4gICAgZmxvYXQ2NDogRmxvYXQ2NEFycmF5O1xuICAgIHVpbnQzMjogVWludDMyQXJyYXk7XG4gICAgdWludDY0OiBCaWdVaW50NjRBcnJheTtcbiAgICAvLyBjb21wbGV4NjQ6IG5ldmVyO1xuICAgIC8vIGNvbXBsZXgxMjg6IG5ldmVyO1xuICAgIC8vIGJmbG9hdDE2OiBuZXZlcjtcbiAgICB1aW50NDogVWludDhBcnJheTtcbiAgICBpbnQ0OiBJbnQ4QXJyYXk7XG4gIH1cblxuICBpbnRlcmZhY2UgRWxlbWVudFR5cGVNYXAge1xuICAgIGZsb2F0MzI6IG51bWJlcjtcbiAgICB1aW50ODogbnVtYmVyO1xuICAgIGludDg6IG51bWJlcjtcbiAgICB1aW50MTY6IG51bWJlcjtcbiAgICBpbnQxNjogbnVtYmVyO1xuICAgIGludDMyOiBudW1iZXI7XG4gICAgaW50NjQ6IGJpZ2ludDtcbiAgICBzdHJpbmc6IHN0cmluZztcbiAgICBib29sOiBib29sZWFuO1xuICAgIGZsb2F0MTY6IG51bWJlcjsgLy8gS2VlcCB1c2luZyBVaW50MTZBcnJheSB1bnRpbCB3ZSBoYXZlIGEgY29uY3JldGUgc29sdXRpb24gZm9yIGZsb2F0IDE2LlxuICAgIGZsb2F0NjQ6IG51bWJlcjtcbiAgICB1aW50MzI6IG51bWJlcjtcbiAgICB1aW50NjQ6IGJpZ2ludDtcbiAgICAvLyBjb21wbGV4NjQ6IG5ldmVyO1xuICAgIC8vIGNvbXBsZXgxMjg6IG5ldmVyO1xuICAgIC8vIGJmbG9hdDE2OiBuZXZlcjtcbiAgICB1aW50NDogbnVtYmVyO1xuICAgIGludDQ6IG51bWJlcjtcbiAgfVxuXG4gIHR5cGUgRGF0YVR5cGUgPSBEYXRhVHlwZU1hcFtUeXBlXTtcbiAgdHlwZSBFbGVtZW50VHlwZSA9IEVsZW1lbnRUeXBlTWFwW1R5cGVdO1xuXG4gIC8qKlxuICAgKiBzdXBwb3J0ZWQgZGF0YSB0eXBlcyBmb3IgY29uc3RydWN0aW5nIGEgdGVuc29yIGZyb20gYSBwaW5uZWQgQ1BVIGJ1ZmZlclxuICAgKi9cbiAgZXhwb3J0IHR5cGUgQ3B1UGlubmVkRGF0YVR5cGVzID0gRXhjbHVkZTxUZW5zb3IuVHlwZSwgJ3N0cmluZyc+O1xuXG4gIC8qKlxuICAgKiB0eXBlIGFsaWFzIGZvciBXZWJHTCB0ZXh0dXJlXG4gICAqL1xuICBleHBvcnQgdHlwZSBUZXh0dXJlVHlwZSA9IFdlYkdMVGV4dHVyZTtcblxuICAvKipcbiAgICogc3VwcG9ydGVkIGRhdGEgdHlwZXMgZm9yIGNvbnN0cnVjdGluZyBhIHRlbnNvciBmcm9tIGEgV2ViR0wgdGV4dHVyZVxuICAgKi9cbiAgZXhwb3J0IHR5cGUgVGV4dHVyZURhdGFUeXBlcyA9ICdmbG9hdDMyJztcblxuICB0eXBlIEdwdUJ1ZmZlclR5cGVGYWxsYmFjayA9IHsgc2l6ZTogbnVtYmVyOyBtYXBTdGF0ZTogJ3VubWFwcGVkJyB8ICdwZW5kaW5nJyB8ICdtYXBwZWQnIH07XG4gIC8qKlxuICAgKiB0eXBlIGFsaWFzIGZvciBXZWJHUFUgYnVmZmVyXG4gICAqL1xuICBleHBvcnQgdHlwZSBHcHVCdWZmZXJUeXBlID0gVHJ5R2V0R2xvYmFsVHlwZTwnR1BVQnVmZmVyJywgR3B1QnVmZmVyVHlwZUZhbGxiYWNrPjtcblxuICB0eXBlIE1MVGVuc29yVHlwZUZhbGxiYWNrID0geyBkZXN0cm95KCk6IHZvaWQgfTtcbiAgLyoqXG4gICAqIHR5cGUgYWxpYXMgZm9yIFdlYk5OIE1MVGVuc29yXG4gICAqXG4gICAqIFRoZSBzcGVjaWZpY2F0aW9uIGZvciBXZWJOTidzIE1MVGVuc29yIGlzIGN1cnJlbnRseSBpbiBmbHV4LlxuICAgKi9cbiAgZXhwb3J0IHR5cGUgTUxUZW5zb3JUeXBlID0gVHJ5R2V0R2xvYmFsVHlwZTwnTUxUZW5zb3InLCBNTFRlbnNvclR5cGVGYWxsYmFjaz47XG5cbiAgLyoqXG4gICAqIHN1cHBvcnRlZCBkYXRhIHR5cGVzIGZvciBjb25zdHJ1Y3RpbmcgYSB0ZW5zb3IgZnJvbSBhIFdlYkdQVSBidWZmZXJcbiAgICovXG4gIGV4cG9ydCB0eXBlIEdwdUJ1ZmZlckRhdGFUeXBlcyA9ICdmbG9hdDMyJyB8ICdmbG9hdDE2JyB8ICdpbnQzMicgfCAnaW50NjQnIHwgJ3VpbnQzMicgfCAndWludDgnIHwgJ2Jvb2wnO1xuXG4gIC8qKlxuICAgKiBzdXBwb3J0ZWQgZGF0YSB0eXBlcyBmb3IgY29uc3RydWN0aW5nIGEgdGVuc29yIGZyb20gYSBXZWJOTiBNTFRlbnNvclxuICAgKi9cbiAgZXhwb3J0IHR5cGUgTUxUZW5zb3JEYXRhVHlwZXMgPVxuICAgIHwgJ2Zsb2F0MzInXG4gICAgfCAnZmxvYXQxNidcbiAgICB8ICdpbnQ4J1xuICAgIHwgJ3VpbnQ4J1xuICAgIHwgJ2ludDMyJ1xuICAgIHwgJ3VpbnQzMidcbiAgICB8ICdpbnQ2NCdcbiAgICB8ICd1aW50NjQnXG4gICAgfCAnYm9vbCdcbiAgICB8ICd1aW50NCdcbiAgICB8ICdpbnQ0JztcblxuICAvKipcbiAgICogcmVwcmVzZW50IHdoZXJlIHRoZSB0ZW5zb3IgZGF0YSBpcyBzdG9yZWRcbiAgICovXG4gIGV4cG9ydCB0eXBlIERhdGFMb2NhdGlvbiA9ICdub25lJyB8ICdjcHUnIHwgJ2NwdS1waW5uZWQnIHwgJ3RleHR1cmUnIHwgJ2dwdS1idWZmZXInIHwgJ21sLXRlbnNvcic7XG5cbiAgLyoqXG4gICAqIHJlcHJlc2VudCB0aGUgZGF0YSB0eXBlIG9mIGEgdGVuc29yXG4gICAqL1xuICBleHBvcnQgdHlwZSBUeXBlID0ga2V5b2YgRGF0YVR5cGVNYXA7XG59XG5cbi8qKlxuICogUmVwcmVzZW50IG11bHRpLWRpbWVuc2lvbmFsIGFycmF5cyB0byBmZWVkIHRvIG9yIGZldGNoIGZyb20gbW9kZWwgaW5mZXJlbmNpbmcuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVHlwZWRUZW5zb3I8VCBleHRlbmRzIFRlbnNvci5UeXBlPiBleHRlbmRzIFR5cGVkVGVuc29yQmFzZTxUPiwgVHlwZWRUZW5zb3JVdGlsczxUPiB7fVxuLyoqXG4gKiBSZXByZXNlbnQgbXVsdGktZGltZW5zaW9uYWwgYXJyYXlzIHRvIGZlZWQgdG8gb3IgZmV0Y2ggZnJvbSBtb2RlbCBpbmZlcmVuY2luZy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUZW5zb3IgZXh0ZW5kcyBUeXBlZFRlbnNvckJhc2U8VGVuc29yLlR5cGU+LCBUeXBlZFRlbnNvclV0aWxzPFRlbnNvci5UeXBlPiB7fVxuXG4vKipcbiAqIHR5cGUgVGVuc29yQ29uc3RydWN0b3IgZGVmaW5lcyB0aGUgY29uc3RydWN0b3JzIG9mICdUZW5zb3InIHRvIGNyZWF0ZSBDUFUgdGVuc29yIGluc3RhbmNlcy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUZW5zb3JDb25zdHJ1Y3RvciBleHRlbmRzIFRlbnNvckZhY3Rvcnkge1xuICAvLyAjcmVnaW9uIENQVSB0ZW5zb3IgLSBzcGVjaWZ5IGVsZW1lbnQgdHlwZVxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHN0cmluZyB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIHR5cGUsIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSB0eXBlIC0gU3BlY2lmeSB0aGUgZWxlbWVudCB0eXBlLlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXcgKFxuICAgIHR5cGU6ICdzdHJpbmcnLFxuICAgIGRhdGE6IFRlbnNvci5EYXRhVHlwZU1hcFsnc3RyaW5nJ10gfCByZWFkb25seSBzdHJpbmdbXSxcbiAgICBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10sXG4gICk6IFR5cGVkVGVuc29yPCdzdHJpbmcnPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IGJvb2wgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiB0eXBlLCBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gdHlwZSAtIFNwZWNpZnkgdGhlIGVsZW1lbnQgdHlwZS5cbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKi9cbiAgbmV3IChcbiAgICB0eXBlOiAnYm9vbCcsXG4gICAgZGF0YTogVGVuc29yLkRhdGFUeXBlTWFwWydib29sJ10gfCByZWFkb25seSBib29sZWFuW10sXG4gICAgZGltcz86IHJlYWRvbmx5IG51bWJlcltdLFxuICApOiBUeXBlZFRlbnNvcjwnYm9vbCc+O1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgdWludDggdGVuc29yIG9iamVjdCBmcm9tIGEgVWludDhDbGFtcGVkQXJyYXksIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSB0eXBlIC0gU3BlY2lmeSB0aGUgZWxlbWVudCB0eXBlLlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXcgKHR5cGU6ICd1aW50OCcsIGRhdGE6IFVpbnQ4Q2xhbXBlZEFycmF5LCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwndWludDgnPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IDY0LWJpdCBpbnRlZ2VyIHR5cGVkIHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gdHlwZSwgZGF0YSBhbmQgZGltcy5cbiAgICpcbiAgICogQHBhcmFtIHR5cGUgLSBTcGVjaWZ5IHRoZSBlbGVtZW50IHR5cGUuXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cbiAgICovXG4gIG5ldyA8VCBleHRlbmRzICd1aW50NjQnIHwgJ2ludDY0Jz4oXG4gICAgdHlwZTogVCxcbiAgICBkYXRhOiBUZW5zb3IuRGF0YVR5cGVNYXBbVF0gfCByZWFkb25seSBiaWdpbnRbXSB8IHJlYWRvbmx5IG51bWJlcltdLFxuICAgIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSxcbiAgKTogVHlwZWRUZW5zb3I8VD47XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBudW1lcmljIHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gdHlwZSwgZGF0YSBhbmQgZGltcy5cbiAgICpcbiAgICogQHBhcmFtIHR5cGUgLSBTcGVjaWZ5IHRoZSBlbGVtZW50IHR5cGUuXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cbiAgICovXG4gIG5ldyA8VCBleHRlbmRzIEV4Y2x1ZGU8VGVuc29yLlR5cGUsICdzdHJpbmcnIHwgJ2Jvb2wnIHwgJ3VpbnQ2NCcgfCAnaW50NjQnPj4oXG4gICAgdHlwZTogVCxcbiAgICBkYXRhOiBUZW5zb3IuRGF0YVR5cGVNYXBbVF0gfCByZWFkb25seSBudW1iZXJbXSxcbiAgICBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10sXG4gICk6IFR5cGVkVGVuc29yPFQ+O1xuICAvLyAjZW5kcmVnaW9uXG5cbiAgLy8gI3JlZ2lvbiBDUFUgdGVuc29yIC0gaW5mZXIgZWxlbWVudCB0eXBlc1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgZmxvYXQzMiB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cbiAgICovXG4gIG5ldyAoZGF0YTogRmxvYXQzMkFycmF5LCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwnZmxvYXQzMic+O1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgaW50OCB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cbiAgICovXG4gIG5ldyAoZGF0YTogSW50OEFycmF5LCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwnaW50OCc+O1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgdWludDggdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXcgKGRhdGE6IFVpbnQ4QXJyYXksIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPCd1aW50OCc+O1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgdWludDggdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXcgKGRhdGE6IFVpbnQ4Q2xhbXBlZEFycmF5LCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwndWludDgnPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHVpbnQxNiB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cbiAgICovXG4gIG5ldyAoZGF0YTogVWludDE2QXJyYXksIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPCd1aW50MTYnPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IGludDE2IHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBhbmQgZGltcy5cbiAgICpcbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKi9cbiAgbmV3IChkYXRhOiBJbnQxNkFycmF5LCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwnaW50MTYnPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IGludDMyIHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBhbmQgZGltcy5cbiAgICpcbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKi9cbiAgbmV3IChkYXRhOiBJbnQzMkFycmF5LCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwnaW50MzInPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IGludDY0IHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBhbmQgZGltcy5cbiAgICpcbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKi9cbiAgbmV3IChkYXRhOiBCaWdJbnQ2NEFycmF5LCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwnaW50NjQnPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHN0cmluZyB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cbiAgICovXG4gIG5ldyAoZGF0YTogcmVhZG9ubHkgc3RyaW5nW10sIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPCdzdHJpbmcnPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IGJvb2wgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXcgKGRhdGE6IHJlYWRvbmx5IGJvb2xlYW5bXSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVHlwZWRUZW5zb3I8J2Jvb2wnPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IGZsb2F0NjQgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXcgKGRhdGE6IEZsb2F0NjRBcnJheSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVHlwZWRUZW5zb3I8J2Zsb2F0NjQnPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHVpbnQzMiB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cbiAgICovXG4gIG5ldyAoZGF0YTogVWludDMyQXJyYXksIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPCd1aW50MzInPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHVpbnQ2NCB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cbiAgICovXG4gIG5ldyAoZGF0YTogQmlnVWludDY0QXJyYXksIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPCd1aW50NjQnPjtcblxuICAvLyAjZW5kcmVnaW9uXG5cbiAgLy8gI3JlZ2lvbiBDUFUgdGVuc29yIC0gZmFsbCBiYWNrIHRvIG5vbi1nZW5lcmljIHRlbnNvciB0eXBlIGRlY2xhcmF0aW9uXG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIHR5cGUsIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSB0eXBlIC0gU3BlY2lmeSB0aGUgZWxlbWVudCB0eXBlLlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXcgKFxuICAgIHR5cGU6IFRlbnNvci5UeXBlLFxuICAgIGRhdGE6IFRlbnNvci5EYXRhVHlwZSB8IHJlYWRvbmx5IG51bWJlcltdIHwgcmVhZG9ubHkgc3RyaW5nW10gfCByZWFkb25seSBiaWdpbnRbXSB8IHJlYWRvbmx5IGJvb2xlYW5bXSxcbiAgICBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10sXG4gICk6IFRlbnNvcjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBhbmQgZGltcy5cbiAgICpcbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKi9cbiAgbmV3IChkYXRhOiBUZW5zb3IuRGF0YVR5cGUsIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFRlbnNvcjtcbiAgLy8gI2VuZHJlZ2lvblxufVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXG5leHBvcnQgY29uc3QgVGVuc29yID0gVGVuc29ySW1wbCBhcyBUZW5zb3JDb25zdHJ1Y3RvcjtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHsgZW52IH0gZnJvbSAnLi9lbnYtaW1wbC5qcyc7XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5leHBvcnQgY29uc3QgVFJBQ0UgPSAoZGV2aWNlVHlwZTogc3RyaW5nLCBsYWJlbDogc3RyaW5nKSA9PiB7XG4gIGlmICh0eXBlb2YgZW52LnRyYWNlID09PSAndW5kZWZpbmVkJyA/ICFlbnYud2FzbS50cmFjZSA6ICFlbnYudHJhY2UpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgY29uc29sZS50aW1lU3RhbXAoYCR7ZGV2aWNlVHlwZX06Ok9SVDo6JHtsYWJlbH1gKTtcbn07XG5cbmNvbnN0IFRSQUNFX0ZVTkMgPSAobXNnOiBzdHJpbmcsIGV4dHJhTXNnPzogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IHN0YWNrID0gbmV3IEVycm9yKCkuc3RhY2s/LnNwbGl0KC9cXHJcXG58XFxyfFxcbi9nKSB8fCBbXTtcbiAgbGV0IGhhc1RyYWNlRnVuYyA9IGZhbHNlO1xuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0YWNrLmxlbmd0aDsgaSsrKSB7XG4gICAgaWYgKGhhc1RyYWNlRnVuYyAmJiAhc3RhY2tbaV0uaW5jbHVkZXMoJ1RSQUNFX0ZVTkMnKSkge1xuICAgICAgbGV0IGxhYmVsID0gYEZVTkNfJHttc2d9Ojoke3N0YWNrW2ldLnRyaW0oKS5zcGxpdCgnICcpWzFdfWA7XG4gICAgICBpZiAoZXh0cmFNc2cpIHtcbiAgICAgICAgbGFiZWwgKz0gYDo6JHtleHRyYU1zZ31gO1xuICAgICAgfVxuICAgICAgVFJBQ0UoJ0NQVScsIGxhYmVsKTtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHN0YWNrW2ldLmluY2x1ZGVzKCdUUkFDRV9GVU5DJykpIHtcbiAgICAgIGhhc1RyYWNlRnVuYyA9IHRydWU7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuZXhwb3J0IGNvbnN0IFRSQUNFX0ZVTkNfQkVHSU4gPSAoZXh0cmFNc2c/OiBzdHJpbmcpID0+IHtcbiAgaWYgKHR5cGVvZiBlbnYudHJhY2UgPT09ICd1bmRlZmluZWQnID8gIWVudi53YXNtLnRyYWNlIDogIWVudi50cmFjZSkge1xuICAgIHJldHVybjtcbiAgfVxuICBUUkFDRV9GVU5DKCdCRUdJTicsIGV4dHJhTXNnKTtcbn07XG5cbi8qKlxuICogQGlnbm9yZVxuICovXG5leHBvcnQgY29uc3QgVFJBQ0VfRlVOQ19FTkQgPSAoZXh0cmFNc2c/OiBzdHJpbmcpID0+IHtcbiAgaWYgKHR5cGVvZiBlbnYudHJhY2UgPT09ICd1bmRlZmluZWQnID8gIWVudi53YXNtLnRyYWNlIDogIWVudi50cmFjZSkge1xuICAgIHJldHVybjtcbiAgfVxuICBUUkFDRV9GVU5DKCdFTkQnLCBleHRyYU1zZyk7XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgeyByZXNvbHZlQmFja2VuZEFuZEV4ZWN1dGlvblByb3ZpZGVycyB9IGZyb20gJy4vYmFja2VuZC1pbXBsLmpzJztcbmltcG9ydCB7IEluZmVyZW5jZVNlc3Npb25IYW5kbGVyIH0gZnJvbSAnLi9iYWNrZW5kLmpzJztcbmltcG9ydCB7IEluZmVyZW5jZVNlc3Npb24gYXMgSW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZSB9IGZyb20gJy4vaW5mZXJlbmNlLXNlc3Npb24uanMnO1xuaW1wb3J0IHsgT25ueFZhbHVlIH0gZnJvbSAnLi9vbm54LXZhbHVlLmpzJztcbmltcG9ydCB7IFRlbnNvciB9IGZyb20gJy4vdGVuc29yLmpzJztcbmltcG9ydCB7IFRSQUNFX0ZVTkNfQkVHSU4sIFRSQUNFX0ZVTkNfRU5EIH0gZnJvbSAnLi90cmFjZS5qcyc7XG5cbnR5cGUgU2Vzc2lvbk9wdGlvbnMgPSBJbmZlcmVuY2VTZXNzaW9uSW50ZXJmYWNlLlNlc3Npb25PcHRpb25zO1xudHlwZSBSdW5PcHRpb25zID0gSW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZS5SdW5PcHRpb25zO1xudHlwZSBGZWVkc1R5cGUgPSBJbmZlcmVuY2VTZXNzaW9uSW50ZXJmYWNlLkZlZWRzVHlwZTtcbnR5cGUgRmV0Y2hlc1R5cGUgPSBJbmZlcmVuY2VTZXNzaW9uSW50ZXJmYWNlLkZldGNoZXNUeXBlO1xudHlwZSBSZXR1cm5UeXBlID0gSW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZS5SZXR1cm5UeXBlO1xuXG5leHBvcnQgY2xhc3MgSW5mZXJlbmNlU2Vzc2lvbiBpbXBsZW1lbnRzIEluZmVyZW5jZVNlc3Npb25JbnRlcmZhY2Uge1xuICBwcml2YXRlIGNvbnN0cnVjdG9yKGhhbmRsZXI6IEluZmVyZW5jZVNlc3Npb25IYW5kbGVyKSB7XG4gICAgdGhpcy5oYW5kbGVyID0gaGFuZGxlcjtcbiAgfVxuICBydW4oZmVlZHM6IEZlZWRzVHlwZSwgb3B0aW9ucz86IFJ1bk9wdGlvbnMpOiBQcm9taXNlPFJldHVyblR5cGU+O1xuICBydW4oZmVlZHM6IEZlZWRzVHlwZSwgZmV0Y2hlczogRmV0Y2hlc1R5cGUsIG9wdGlvbnM/OiBSdW5PcHRpb25zKTogUHJvbWlzZTxSZXR1cm5UeXBlPjtcbiAgYXN5bmMgcnVuKGZlZWRzOiBGZWVkc1R5cGUsIGFyZzE/OiBGZXRjaGVzVHlwZSB8IFJ1bk9wdGlvbnMsIGFyZzI/OiBSdW5PcHRpb25zKTogUHJvbWlzZTxSZXR1cm5UeXBlPiB7XG4gICAgVFJBQ0VfRlVOQ19CRUdJTigpO1xuICAgIGNvbnN0IGZldGNoZXM6IHsgW25hbWU6IHN0cmluZ106IE9ubnhWYWx1ZSB8IG51bGwgfSA9IHt9O1xuICAgIGxldCBvcHRpb25zOiBSdW5PcHRpb25zID0ge307XG4gICAgLy8gY2hlY2sgaW5wdXRzXG4gICAgaWYgKHR5cGVvZiBmZWVkcyAhPT0gJ29iamVjdCcgfHwgZmVlZHMgPT09IG51bGwgfHwgZmVlZHMgaW5zdGFuY2VvZiBUZW5zb3IgfHwgQXJyYXkuaXNBcnJheShmZWVkcykpIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgIFwiJ2ZlZWRzJyBtdXN0IGJlIGFuIG9iamVjdCB0aGF0IHVzZSBpbnB1dCBuYW1lcyBhcyBrZXlzIGFuZCBPbm54VmFsdWUgYXMgY29ycmVzcG9uZGluZyB2YWx1ZXMuXCIsXG4gICAgICApO1xuICAgIH1cblxuICAgIGxldCBpc0ZldGNoZXNFbXB0eSA9IHRydWU7XG4gICAgLy8gZGV0ZXJtaW5lIHdoaWNoIG92ZXJyaWRlIGlzIGJlaW5nIHVzZWRcbiAgICBpZiAodHlwZW9mIGFyZzEgPT09ICdvYmplY3QnKSB7XG4gICAgICBpZiAoYXJnMSA9PT0gbnVsbCkge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmV4cGVjdGVkIGFyZ3VtZW50WzFdOiBjYW5ub3QgYmUgbnVsbC4nKTtcbiAgICAgIH1cbiAgICAgIGlmIChhcmcxIGluc3RhbmNlb2YgVGVuc29yKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCInZmV0Y2hlcycgY2Fubm90IGJlIGEgVGVuc29yXCIpO1xuICAgICAgfVxuXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShhcmcxKSkge1xuICAgICAgICBpZiAoYXJnMS5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiJ2ZldGNoZXMnIGNhbm5vdCBiZSBhbiBlbXB0eSBhcnJheS5cIik7XG4gICAgICAgIH1cbiAgICAgICAgaXNGZXRjaGVzRW1wdHkgPSBmYWxzZTtcbiAgICAgICAgLy8gb3V0cHV0IG5hbWVzXG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBvZiBhcmcxKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIidmZXRjaGVzJyBtdXN0IGJlIGEgc3RyaW5nIGFycmF5IG9yIGFuIG9iamVjdC5cIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0aGlzLm91dHB1dE5hbWVzLmluZGV4T2YobmFtZSkgPT09IC0xKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgJ2ZldGNoZXMnIGNvbnRhaW5zIGludmFsaWQgb3V0cHV0IG5hbWU6ICR7bmFtZX0uYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGZldGNoZXNbbmFtZV0gPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHR5cGVvZiBhcmcyID09PSAnb2JqZWN0JyAmJiBhcmcyICE9PSBudWxsKSB7XG4gICAgICAgICAgb3B0aW9ucyA9IGFyZzI7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIidvcHRpb25zJyBtdXN0IGJlIGFuIG9iamVjdC5cIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGRlY2lkZSB3aGV0aGVyIGFyZzEgaXMgZmV0Y2hlcyBvciBvcHRpb25zXG4gICAgICAgIC8vIGlmIGFueSBvdXRwdXQgbmFtZSBpcyBwcmVzZW50IGFuZCBpdHMgdmFsdWUgaXMgdmFsaWQgT25ueFZhbHVlLCB3ZSBjb25zaWRlciBpdCBmZXRjaGVzXG4gICAgICAgIGxldCBpc0ZldGNoZXMgPSBmYWxzZTtcbiAgICAgICAgY29uc3QgYXJnMUtleXMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlOYW1lcyhhcmcxKTtcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIHRoaXMub3V0cHV0TmFtZXMpIHtcbiAgICAgICAgICBpZiAoYXJnMUtleXMuaW5kZXhPZihuYW1lKSAhPT0gLTEpIHtcbiAgICAgICAgICAgIGNvbnN0IHYgPSAoYXJnMSBhcyBJbmZlcmVuY2VTZXNzaW9uSW50ZXJmYWNlLk51bGxhYmxlT25ueFZhbHVlTWFwVHlwZSlbbmFtZV07XG4gICAgICAgICAgICBpZiAodiA9PT0gbnVsbCB8fCB2IGluc3RhbmNlb2YgVGVuc29yKSB7XG4gICAgICAgICAgICAgIGlzRmV0Y2hlcyA9IHRydWU7XG4gICAgICAgICAgICAgIGlzRmV0Y2hlc0VtcHR5ID0gZmFsc2U7XG4gICAgICAgICAgICAgIGZldGNoZXNbbmFtZV0gPSB2O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChpc0ZldGNoZXMpIHtcbiAgICAgICAgICBpZiAodHlwZW9mIGFyZzIgPT09ICdvYmplY3QnICYmIGFyZzIgIT09IG51bGwpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBhcmcyO1xuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiJ29wdGlvbnMnIG11c3QgYmUgYW4gb2JqZWN0LlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgb3B0aW9ucyA9IGFyZzEgYXMgUnVuT3B0aW9ucztcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzEgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5leHBlY3RlZCBhcmd1bWVudFsxXTogbXVzdCBiZSAnZmV0Y2hlcycgb3IgJ29wdGlvbnMnLlwiKTtcbiAgICB9XG5cbiAgICAvLyBjaGVjayBpZiBhbGwgaW5wdXRzIGFyZSBpbiBmZWVkXG4gICAgZm9yIChjb25zdCBuYW1lIG9mIHRoaXMuaW5wdXROYW1lcykge1xuICAgICAgaWYgKHR5cGVvZiBmZWVkc1tuYW1lXSA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnB1dCAnJHtuYW1lfScgaXMgbWlzc2luZyBpbiAnZmVlZHMnLmApO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGlmIG5vIGZldGNoZXMgaXMgc3BlY2lmaWVkLCB3ZSB1c2UgdGhlIGZ1bGwgb3V0cHV0IG5hbWVzIGxpc3RcbiAgICBpZiAoaXNGZXRjaGVzRW1wdHkpIHtcbiAgICAgIGZvciAoY29uc3QgbmFtZSBvZiB0aGlzLm91dHB1dE5hbWVzKSB7XG4gICAgICAgIGZldGNoZXNbbmFtZV0gPSBudWxsO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIGZlZWRzLCBmZXRjaGVzIGFuZCBvcHRpb25zIGFyZSBwcmVwYXJlZFxuXG4gICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHRoaXMuaGFuZGxlci5ydW4oZmVlZHMsIGZldGNoZXMsIG9wdGlvbnMpO1xuICAgIGNvbnN0IHJldHVyblZhbHVlOiB7IFtuYW1lOiBzdHJpbmddOiBPbm54VmFsdWUgfSA9IHt9O1xuICAgIGZvciAoY29uc3Qga2V5IGluIHJlc3VsdHMpIHtcbiAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChyZXN1bHRzLCBrZXkpKSB7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlc3VsdHNba2V5XTtcbiAgICAgICAgaWYgKHJlc3VsdCBpbnN0YW5jZW9mIFRlbnNvcikge1xuICAgICAgICAgIHJldHVyblZhbHVlW2tleV0gPSByZXN1bHQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgcmV0dXJuVmFsdWVba2V5XSA9IG5ldyBUZW5zb3IocmVzdWx0LnR5cGUsIHJlc3VsdC5kYXRhLCByZXN1bHQuZGltcyk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgVFJBQ0VfRlVOQ19FTkQoKTtcbiAgICByZXR1cm4gcmV0dXJuVmFsdWU7XG4gIH1cblxuICBhc3luYyByZWxlYXNlKCk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiB0aGlzLmhhbmRsZXIuZGlzcG9zZSgpO1xuICB9XG5cbiAgc3RhdGljIGNyZWF0ZShwYXRoOiBzdHJpbmcsIG9wdGlvbnM/OiBTZXNzaW9uT3B0aW9ucyk6IFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZT47XG4gIHN0YXRpYyBjcmVhdGUoYnVmZmVyOiBBcnJheUJ1ZmZlckxpa2UsIG9wdGlvbnM/OiBTZXNzaW9uT3B0aW9ucyk6IFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZT47XG4gIHN0YXRpYyBjcmVhdGUoXG4gICAgYnVmZmVyOiBBcnJheUJ1ZmZlckxpa2UsXG4gICAgYnl0ZU9mZnNldDogbnVtYmVyLFxuICAgIGJ5dGVMZW5ndGg/OiBudW1iZXIsXG4gICAgb3B0aW9ucz86IFNlc3Npb25PcHRpb25zLFxuICApOiBQcm9taXNlPEluZmVyZW5jZVNlc3Npb25JbnRlcmZhY2U+O1xuICBzdGF0aWMgY3JlYXRlKGJ1ZmZlcjogVWludDhBcnJheSwgb3B0aW9ucz86IFNlc3Npb25PcHRpb25zKTogUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uSW50ZXJmYWNlPjtcbiAgc3RhdGljIGFzeW5jIGNyZWF0ZShcbiAgICBhcmcwOiBzdHJpbmcgfCBBcnJheUJ1ZmZlckxpa2UgfCBVaW50OEFycmF5LFxuICAgIGFyZzE/OiBTZXNzaW9uT3B0aW9ucyB8IG51bWJlcixcbiAgICBhcmcyPzogbnVtYmVyLFxuICAgIGFyZzM/OiBTZXNzaW9uT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uSW50ZXJmYWNlPiB7XG4gICAgVFJBQ0VfRlVOQ19CRUdJTigpO1xuICAgIC8vIGVpdGhlciBsb2FkIGZyb20gYSBmaWxlIG9yIGJ1ZmZlclxuICAgIGxldCBmaWxlUGF0aE9yVWludDhBcnJheTogc3RyaW5nIHwgVWludDhBcnJheTtcbiAgICBsZXQgb3B0aW9uczogU2Vzc2lvbk9wdGlvbnMgPSB7fTtcblxuICAgIGlmICh0eXBlb2YgYXJnMCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGZpbGVQYXRoT3JVaW50OEFycmF5ID0gYXJnMDtcbiAgICAgIGlmICh0eXBlb2YgYXJnMSA9PT0gJ29iamVjdCcgJiYgYXJnMSAhPT0gbnVsbCkge1xuICAgICAgICBvcHRpb25zID0gYXJnMTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzEgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCInb3B0aW9ucycgbXVzdCBiZSBhbiBvYmplY3QuXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoYXJnMCBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICAgIGZpbGVQYXRoT3JVaW50OEFycmF5ID0gYXJnMDtcbiAgICAgIGlmICh0eXBlb2YgYXJnMSA9PT0gJ29iamVjdCcgJiYgYXJnMSAhPT0gbnVsbCkge1xuICAgICAgICBvcHRpb25zID0gYXJnMTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzEgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCInb3B0aW9ucycgbXVzdCBiZSBhbiBvYmplY3QuXCIpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAoXG4gICAgICBhcmcwIGluc3RhbmNlb2YgQXJyYXlCdWZmZXIgfHxcbiAgICAgICh0eXBlb2YgU2hhcmVkQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIGFyZzAgaW5zdGFuY2VvZiBTaGFyZWRBcnJheUJ1ZmZlcilcbiAgICApIHtcbiAgICAgIGNvbnN0IGJ1ZmZlciA9IGFyZzA7XG4gICAgICBsZXQgYnl0ZU9mZnNldCA9IDA7XG4gICAgICBsZXQgYnl0ZUxlbmd0aCA9IGFyZzAuYnl0ZUxlbmd0aDtcbiAgICAgIGlmICh0eXBlb2YgYXJnMSA9PT0gJ29iamVjdCcgJiYgYXJnMSAhPT0gbnVsbCkge1xuICAgICAgICBvcHRpb25zID0gYXJnMTtcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzEgPT09ICdudW1iZXInKSB7XG4gICAgICAgIGJ5dGVPZmZzZXQgPSBhcmcxO1xuICAgICAgICBpZiAoIU51bWJlci5pc1NhZmVJbnRlZ2VyKGJ5dGVPZmZzZXQpKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCInYnl0ZU9mZnNldCcgbXVzdCBiZSBhbiBpbnRlZ2VyLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoYnl0ZU9mZnNldCA8IDAgfHwgYnl0ZU9mZnNldCA+PSBidWZmZXIuYnl0ZUxlbmd0aCkge1xuICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGAnYnl0ZU9mZnNldCcgaXMgb3V0IG9mIHJhbmdlIFswLCAke2J1ZmZlci5ieXRlTGVuZ3RofSkuYCk7XG4gICAgICAgIH1cbiAgICAgICAgYnl0ZUxlbmd0aCA9IGFyZzAuYnl0ZUxlbmd0aCAtIGJ5dGVPZmZzZXQ7XG4gICAgICAgIGlmICh0eXBlb2YgYXJnMiA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgICBieXRlTGVuZ3RoID0gYXJnMjtcbiAgICAgICAgICBpZiAoIU51bWJlci5pc1NhZmVJbnRlZ2VyKGJ5dGVMZW5ndGgpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihcIidieXRlTGVuZ3RoJyBtdXN0IGJlIGFuIGludGVnZXIuXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoYnl0ZUxlbmd0aCA8PSAwIHx8IGJ5dGVPZmZzZXQgKyBieXRlTGVuZ3RoID4gYnVmZmVyLmJ5dGVMZW5ndGgpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGAnYnl0ZUxlbmd0aCcgaXMgb3V0IG9mIHJhbmdlICgwLCAke2J1ZmZlci5ieXRlTGVuZ3RoIC0gYnl0ZU9mZnNldH1dLmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodHlwZW9mIGFyZzMgPT09ICdvYmplY3QnICYmIGFyZzMgIT09IG51bGwpIHtcbiAgICAgICAgICAgIG9wdGlvbnMgPSBhcmczO1xuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiJ29wdGlvbnMnIG11c3QgYmUgYW4gb2JqZWN0LlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzIgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIidieXRlTGVuZ3RoJyBtdXN0IGJlIGEgbnVtYmVyLlwiKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYXJnMSAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIidvcHRpb25zJyBtdXN0IGJlIGFuIG9iamVjdC5cIik7XG4gICAgICB9XG4gICAgICBmaWxlUGF0aE9yVWludDhBcnJheSA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlciwgYnl0ZU9mZnNldCwgYnl0ZUxlbmd0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJVbmV4cGVjdGVkIGFyZ3VtZW50WzBdOiBtdXN0IGJlICdwYXRoJyBvciAnYnVmZmVyJy5cIik7XG4gICAgfVxuXG4gICAgLy8gcmVzb2x2ZSBiYWNrZW5kLCB1cGRhdGUgc2Vzc2lvbiBvcHRpb25zIHdpdGggdmFsaWRhdGVkIEVQcywgYW5kIGNyZWF0ZSBzZXNzaW9uIGhhbmRsZXJcbiAgICBjb25zdCBbYmFja2VuZCwgb3B0aW9uc1dpdGhWYWxpZGF0ZWRFUHNdID0gYXdhaXQgcmVzb2x2ZUJhY2tlbmRBbmRFeGVjdXRpb25Qcm92aWRlcnMob3B0aW9ucyk7XG4gICAgY29uc3QgaGFuZGxlciA9IGF3YWl0IGJhY2tlbmQuY3JlYXRlSW5mZXJlbmNlU2Vzc2lvbkhhbmRsZXIoZmlsZVBhdGhPclVpbnQ4QXJyYXksIG9wdGlvbnNXaXRoVmFsaWRhdGVkRVBzKTtcbiAgICBUUkFDRV9GVU5DX0VORCgpO1xuICAgIHJldHVybiBuZXcgSW5mZXJlbmNlU2Vzc2lvbihoYW5kbGVyKTtcbiAgfVxuXG4gIHN0YXJ0UHJvZmlsaW5nKCk6IHZvaWQge1xuICAgIHRoaXMuaGFuZGxlci5zdGFydFByb2ZpbGluZygpO1xuICB9XG4gIGVuZFByb2ZpbGluZygpOiB2b2lkIHtcbiAgICB0aGlzLmhhbmRsZXIuZW5kUHJvZmlsaW5nKCk7XG4gIH1cblxuICBnZXQgaW5wdXROYW1lcygpOiByZWFkb25seSBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuaGFuZGxlci5pbnB1dE5hbWVzO1xuICB9XG4gIGdldCBvdXRwdXROYW1lcygpOiByZWFkb25seSBzdHJpbmdbXSB7XG4gICAgcmV0dXJuIHRoaXMuaGFuZGxlci5vdXRwdXROYW1lcztcbiAgfVxuXG4gIGdldCBpbnB1dE1ldGFkYXRhKCk6IHJlYWRvbmx5IEluZmVyZW5jZVNlc3Npb25JbnRlcmZhY2UuVmFsdWVNZXRhZGF0YVtdIHtcbiAgICByZXR1cm4gdGhpcy5oYW5kbGVyLmlucHV0TWV0YWRhdGE7XG4gIH1cblxuICBnZXQgb3V0cHV0TWV0YWRhdGEoKTogcmVhZG9ubHkgSW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZS5WYWx1ZU1ldGFkYXRhW10ge1xuICAgIHJldHVybiB0aGlzLmhhbmRsZXIub3V0cHV0TWV0YWRhdGE7XG4gIH1cblxuICBwcml2YXRlIGhhbmRsZXI6IEluZmVyZW5jZVNlc3Npb25IYW5kbGVyO1xufVxuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgeyBJbmZlcmVuY2VTZXNzaW9uIGFzIEluZmVyZW5jZVNlc3Npb25JbXBsIH0gZnJvbSAnLi9pbmZlcmVuY2Utc2Vzc2lvbi1pbXBsLmpzJztcbmltcG9ydCB7IE9ubnhNb2RlbE9wdGlvbnMgfSBmcm9tICcuL29ubngtbW9kZWwuanMnO1xuaW1wb3J0IHsgT25ueFZhbHVlLCBPbm54VmFsdWVEYXRhTG9jYXRpb24gfSBmcm9tICcuL29ubngtdmFsdWUuanMnO1xuaW1wb3J0IHR5cGUgeyBUZW5zb3IgfSBmcm9tICcuL3RlbnNvci5qcyc7XG5pbXBvcnQgeyBUcnlHZXRHbG9iYWxUeXBlIH0gZnJvbSAnLi90eXBlLWhlbHBlci5qcyc7XG5cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZWRlY2xhcmUgKi9cblxuZXhwb3J0IGRlY2xhcmUgbmFtZXNwYWNlIEluZmVyZW5jZVNlc3Npb24ge1xuICAvLyAjcmVnaW9uIGlucHV0L291dHB1dCB0eXBlc1xuXG4gIHR5cGUgT25ueFZhbHVlTWFwVHlwZSA9IHsgcmVhZG9ubHkgW25hbWU6IHN0cmluZ106IE9ubnhWYWx1ZSB9O1xuICB0eXBlIE51bGxhYmxlT25ueFZhbHVlTWFwVHlwZSA9IHsgcmVhZG9ubHkgW25hbWU6IHN0cmluZ106IE9ubnhWYWx1ZSB8IG51bGwgfTtcblxuICAvKipcbiAgICogQSBmZWVkcyAobW9kZWwgaW5wdXRzKSBpcyBhbiBvYmplY3QgdGhhdCB1c2VzIGlucHV0IG5hbWVzIGFzIGtleXMgYW5kIE9ubnhWYWx1ZSBhcyBjb3JyZXNwb25kaW5nIHZhbHVlcy5cbiAgICovXG4gIHR5cGUgRmVlZHNUeXBlID0gT25ueFZhbHVlTWFwVHlwZTtcblxuICAvKipcbiAgICogQSBmZXRjaGVzIChtb2RlbCBvdXRwdXRzKSBjb3VsZCBiZSBvbmUgb2YgdGhlIGZvbGxvd2luZzpcbiAgICpcbiAgICogLSBPbWl0dGVkLiBVc2UgbW9kZWwncyBvdXRwdXQgbmFtZXMgZGVmaW5pdGlvbi5cbiAgICogLSBBbiBhcnJheSBvZiBzdHJpbmcgaW5kaWNhdGluZyB0aGUgb3V0cHV0IG5hbWVzLlxuICAgKiAtIEFuIG9iamVjdCB0aGF0IHVzZSBvdXRwdXQgbmFtZXMgYXMga2V5cyBhbmQgT25ueFZhbHVlIG9yIG51bGwgYXMgY29ycmVzcG9uZGluZyB2YWx1ZXMuXG4gICAqXG4gICAqIEByZW1hcmtcbiAgICogZGlmZmVyZW50IGZyb20gaW5wdXQgYXJndW1lbnQsIGluIG91dHB1dCwgT25ueFZhbHVlIGlzIG9wdGlvbmFsLiBJZiBhbiBPbm54VmFsdWUgaXMgcHJlc2VudCBpdCB3aWxsIGJlXG4gICAqIHVzZWQgYXMgYSBwcmUtYWxsb2NhdGVkIHZhbHVlIGJ5IHRoZSBpbmZlcmVuY2UgZW5naW5lOyBpZiBvbWl0dGVkLCBpbmZlcmVuY2UgZW5naW5lIHdpbGwgYWxsb2NhdGUgYnVmZmVyXG4gICAqIGludGVybmFsbHkuXG4gICAqL1xuICB0eXBlIEZldGNoZXNUeXBlID0gcmVhZG9ubHkgc3RyaW5nW10gfCBOdWxsYWJsZU9ubnhWYWx1ZU1hcFR5cGU7XG5cbiAgLyoqXG4gICAqIEEgaW5mZXJlbmNpbmcgcmV0dXJuIHR5cGUgaXMgYW4gb2JqZWN0IHRoYXQgdXNlcyBvdXRwdXQgbmFtZXMgYXMga2V5cyBhbmQgT25ueFZhbHVlIGFzIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICAgKi9cbiAgdHlwZSBSZXR1cm5UeXBlID0gT25ueFZhbHVlTWFwVHlwZTtcblxuICAvLyAjZW5kcmVnaW9uXG5cbiAgLy8gI3JlZ2lvbiBzZXNzaW9uIG9wdGlvbnNcblxuICAvKipcbiAgICogQSBzZXQgb2YgY29uZmlndXJhdGlvbnMgZm9yIHNlc3Npb24gYmVoYXZpb3IuXG4gICAqL1xuICBleHBvcnQgaW50ZXJmYWNlIFNlc3Npb25PcHRpb25zIGV4dGVuZHMgT25ueE1vZGVsT3B0aW9ucyB7XG4gICAgLyoqXG4gICAgICogQW4gYXJyYXkgb2YgZXhlY3V0aW9uIHByb3ZpZGVyIG9wdGlvbnMuXG4gICAgICpcbiAgICAgKiBBbiBleGVjdXRpb24gcHJvdmlkZXIgb3B0aW9uIGNhbiBiZSBhIHN0cmluZyBpbmRpY2F0aW5nIHRoZSBuYW1lIG9mIHRoZSBleGVjdXRpb24gcHJvdmlkZXIsXG4gICAgICogb3IgYW4gb2JqZWN0IG9mIGNvcnJlc3BvbmRpbmcgdHlwZS5cbiAgICAgKi9cbiAgICBleGVjdXRpb25Qcm92aWRlcnM/OiByZWFkb25seSBFeGVjdXRpb25Qcm92aWRlckNvbmZpZ1tdO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGludHJhIE9QIHRocmVhZHMgbnVtYmVyLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIChOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSkuXG4gICAgICovXG4gICAgaW50cmFPcE51bVRocmVhZHM/OiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgaW50ZXIgT1AgdGhyZWFkcyBudW1iZXIuXG4gICAgICpcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgKE5vZGUuanMgYmluZGluZyBhbmQgcmVhY3QtbmF0aXZlKS5cbiAgICAgKi9cbiAgICBpbnRlck9wTnVtVGhyZWFkcz86IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIFRoZSBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZS5cbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSAoTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUpIG9yIFdlYkFzc2VtYmx5IGJhY2tlbmRcbiAgICAgKi9cbiAgICBmcmVlRGltZW5zaW9uT3ZlcnJpZGVzPzogeyByZWFkb25seSBbZGltZW5zaW9uTmFtZTogc3RyaW5nXTogbnVtYmVyIH07XG5cbiAgICAvKipcbiAgICAgKiBUaGUgb3B0aW1pemF0aW9uIGxldmVsLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIChOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSkgb3IgV2ViQXNzZW1ibHkgYmFja2VuZFxuICAgICAqL1xuICAgIGdyYXBoT3B0aW1pemF0aW9uTGV2ZWw/OiAnZGlzYWJsZWQnIHwgJ2Jhc2ljJyB8ICdleHRlbmRlZCcgfCAnYWxsJztcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgZW5hYmxlIENQVSBtZW1vcnkgYXJlbmEuXG4gICAgICpcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgKE5vZGUuanMgYmluZGluZyBhbmQgcmVhY3QtbmF0aXZlKSBvciBXZWJBc3NlbWJseSBiYWNrZW5kXG4gICAgICovXG4gICAgZW5hYmxlQ3B1TWVtQXJlbmE/OiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBlbmFibGUgbWVtb3J5IHBhdHRlcm4uXG4gICAgICpcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgKE5vZGUuanMgYmluZGluZyBhbmQgcmVhY3QtbmF0aXZlKSBvciBXZWJBc3NlbWJseSBiYWNrZW5kXG4gICAgICovXG4gICAgZW5hYmxlTWVtUGF0dGVybj86IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBFeGVjdXRpb24gbW9kZS5cbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSAoTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUpIG9yIFdlYkFzc2VtYmx5IGJhY2tlbmRcbiAgICAgKi9cbiAgICBleGVjdXRpb25Nb2RlPzogJ3NlcXVlbnRpYWwnIHwgJ3BhcmFsbGVsJztcblxuICAgIC8qKlxuICAgICAqIE9wdGltaXplZCBtb2RlbCBmaWxlIHBhdGguXG4gICAgICpcbiAgICAgKiBJZiB0aGlzIHNldHRpbmcgaXMgc3BlY2lmaWVkLCB0aGUgb3B0aW1pemVkIG1vZGVsIHdpbGwgYmUgZHVtcGVkLiBJbiBicm93c2VyLCBhIGJsb2Igd2lsbCBiZSBjcmVhdGVkXG4gICAgICogd2l0aCBhIHBvcC11cCB3aW5kb3cuXG4gICAgICovXG4gICAgb3B0aW1pemVkTW9kZWxGaWxlUGF0aD86IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgZW5hYmxlIHByb2ZpbGluZy5cbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhIHBsYWNlaG9sZGVyIGZvciBhIGZ1dHVyZSB1c2UuXG4gICAgICovXG4gICAgZW5hYmxlUHJvZmlsaW5nPzogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIEZpbGUgcHJlZml4IGZvciBwcm9maWxpbmcuXG4gICAgICpcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYSBwbGFjZWhvbGRlciBmb3IgYSBmdXR1cmUgdXNlLlxuICAgICAqL1xuICAgIHByb2ZpbGVGaWxlUHJlZml4Pzogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogTG9nIElELlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIChOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSkgb3IgV2ViQXNzZW1ibHkgYmFja2VuZFxuICAgICAqL1xuICAgIGxvZ0lkPzogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogTG9nIHNldmVyaXR5IGxldmVsLiBTZWVcbiAgICAgKiBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L29ubnhydW50aW1lL2Jsb2IvbWFpbi9pbmNsdWRlL29ubnhydW50aW1lL2NvcmUvY29tbW9uL2xvZ2dpbmcvc2V2ZXJpdHkuaFxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIChOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSkgb3IgV2ViQXNzZW1ibHkgYmFja2VuZFxuICAgICAqL1xuICAgIGxvZ1NldmVyaXR5TGV2ZWw/OiAwIHwgMSB8IDIgfCAzIHwgNDtcblxuICAgIC8qKlxuICAgICAqIExvZyB2ZXJib3NpdHkgbGV2ZWwuXG4gICAgICpcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gV2ViQXNzZW1ibHkgYmFja2VuZC4gV2lsbCBzdXBwb3J0IE5vZGUuanMgYmluZGluZyBhbmQgcmVhY3QtbmF0aXZlIGxhdGVyXG4gICAgICovXG4gICAgbG9nVmVyYm9zaXR5TGV2ZWw/OiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBTcGVjaWZ5IHN0cmluZyBhcyBhIHByZWZlcnJlZCBkYXRhIGxvY2F0aW9uIGZvciBhbGwgb3V0cHV0cywgb3IgYW4gb2JqZWN0IHRoYXQgdXNlIG91dHB1dCBuYW1lcyBhcyBrZXlzIGFuZCBhXG4gICAgICogcHJlZmVycmVkIGRhdGEgbG9jYXRpb24gYXMgY29ycmVzcG9uZGluZyB2YWx1ZXMuXG4gICAgICpcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgV2ViIGZvciBXZWJHTCBhbmQgV2ViR1BVIEVQLlxuICAgICAqL1xuICAgIHByZWZlcnJlZE91dHB1dExvY2F0aW9uPzogT25ueFZhbHVlRGF0YUxvY2F0aW9uIHwgeyByZWFkb25seSBbb3V0cHV0TmFtZTogc3RyaW5nXTogT25ueFZhbHVlRGF0YUxvY2F0aW9uIH07XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIGVuYWJsZSBncmFwaCBjYXB0dXJlLlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSBXZWIgZm9yIFdlYkdQVSBFUC5cbiAgICAgKi9cbiAgICBlbmFibGVHcmFwaENhcHR1cmU/OiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogU3RvcmUgY29uZmlndXJhdGlvbnMgZm9yIGEgc2Vzc2lvbi4gU2VlXG4gICAgICogaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9vbm54cnVudGltZS9ibG9iL21haW4vaW5jbHVkZS9vbm54cnVudGltZS9jb3JlL3Nlc3Npb24vXG4gICAgICogb25ueHJ1bnRpbWVfc2Vzc2lvbl9vcHRpb25zX2NvbmZpZ19rZXlzLmhcbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBXZWJBc3NlbWJseSBiYWNrZW5kLiBXaWxsIHN1cHBvcnQgTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUgbGF0ZXJcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICogYGBganNcbiAgICAgKiBleHRyYToge1xuICAgICAqICAgc2Vzc2lvbjoge1xuICAgICAqICAgICBzZXRfZGVub3JtYWxfYXNfemVybzogXCIxXCIsXG4gICAgICogICAgIGRpc2FibGVfcHJlcGFja2luZzogXCIxXCJcbiAgICAgKiAgIH0sXG4gICAgICogICBvcHRpbWl6YXRpb246IHtcbiAgICAgKiAgICAgZW5hYmxlX2dlbHVfYXBwcm94aW1hdGlvbjogXCIxXCJcbiAgICAgKiAgIH1cbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICovXG4gICAgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgfVxuXG4gIC8vICNyZWdpb24gZXhlY3V0aW9uIHByb3ZpZGVyc1xuXG4gIC8vIEN1cnJlbnRseSwgd2UgaGF2ZSB0aGUgZm9sbG93aW5nIGJhY2tlbmRzIHRvIHN1cHBvcnQgZXhlY3V0aW9uIHByb3ZpZGVyczpcbiAgLy8gQmFja2VuZCBOb2RlLmpzIGJpbmRpbmc6IHN1cHBvcnRzICdjcHUnLCAnZG1sJyAod2luMzIpLCAnY29yZW1sJyAobWFjT1MpIGFuZCAnY3VkYScgKGxpbnV4KS5cbiAgLy8gQmFja2VuZCBXZWJBc3NlbWJseTogc3VwcG9ydHMgJ2NwdScsICd3YXNtJywgJ3dlYmdwdScgYW5kICd3ZWJubicuXG4gIC8vIEJhY2tlbmQgT05OWC5qczogc3VwcG9ydHMgJ3dlYmdsJy5cbiAgLy8gQmFja2VuZCBSZWFjdCBOYXRpdmU6IHN1cHBvcnRzICdjcHUnLCAneG5ucGFjaycsICdjb3JlbWwnIChpT1MpLCAnbm5hcGknIChBbmRyb2lkKS5cbiAgaW50ZXJmYWNlIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uTWFwIHtcbiAgICBjb3JlbWw6IENvcmVNTEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgIGNwdTogQ3B1RXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgY3VkYTogQ3VkYUV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgIGRtbDogRG1sRXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgbm5hcGk6IE5uYXBpRXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgdGVuc29ycnQ6IFRlbnNvclJ0RXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgd2FzbTogV2ViQXNzZW1ibHlFeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcbiAgICB3ZWJnbDogV2ViR0xFeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcbiAgICB3ZWJncHU6IFdlYkdwdUV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgIHdlYm5uOiBXZWJOTkV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgIHFubjogUW5uRXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgeG5ucGFjazogWG5ucGFja0V4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICB9XG5cbiAgdHlwZSBFeGVjdXRpb25Qcm92aWRlck5hbWUgPSBrZXlvZiBFeGVjdXRpb25Qcm92aWRlck9wdGlvbk1hcDtcbiAgdHlwZSBFeGVjdXRpb25Qcm92aWRlckNvbmZpZyA9XG4gICAgfCBFeGVjdXRpb25Qcm92aWRlck9wdGlvbk1hcFtFeGVjdXRpb25Qcm92aWRlck5hbWVdXG4gICAgfCBFeGVjdXRpb25Qcm92aWRlck9wdGlvblxuICAgIHwgRXhlY3V0aW9uUHJvdmlkZXJOYW1lXG4gICAgfCBzdHJpbmc7XG5cbiAgZXhwb3J0IGludGVyZmFjZSBFeGVjdXRpb25Qcm92aWRlck9wdGlvbiB7XG4gICAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICB9XG4gIGV4cG9ydCBpbnRlcmZhY2UgQ3B1RXhlY3V0aW9uUHJvdmlkZXJPcHRpb24gZXh0ZW5kcyBFeGVjdXRpb25Qcm92aWRlck9wdGlvbiB7XG4gICAgcmVhZG9ubHkgbmFtZTogJ2NwdSc7XG4gICAgdXNlQXJlbmE/OiBib29sZWFuO1xuICB9XG4gIGV4cG9ydCBpbnRlcmZhY2UgQ3VkYUV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIGV4dGVuZHMgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24ge1xuICAgIHJlYWRvbmx5IG5hbWU6ICdjdWRhJztcbiAgICBkZXZpY2VJZD86IG51bWJlcjtcbiAgfVxuICBleHBvcnQgaW50ZXJmYWNlIERtbEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIGV4dGVuZHMgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24ge1xuICAgIHJlYWRvbmx5IG5hbWU6ICdkbWwnO1xuICAgIGRldmljZUlkPzogbnVtYmVyO1xuICB9XG4gIGV4cG9ydCBpbnRlcmZhY2UgVGVuc29yUnRFeGVjdXRpb25Qcm92aWRlck9wdGlvbiBleHRlbmRzIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIHtcbiAgICByZWFkb25seSBuYW1lOiAndGVuc29ycnQnO1xuICAgIGRldmljZUlkPzogbnVtYmVyO1xuICB9XG4gIGV4cG9ydCBpbnRlcmZhY2UgV2ViQXNzZW1ibHlFeGVjdXRpb25Qcm92aWRlck9wdGlvbiBleHRlbmRzIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIHtcbiAgICByZWFkb25seSBuYW1lOiAnd2FzbSc7XG4gIH1cbiAgZXhwb3J0IGludGVyZmFjZSBXZWJHTEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIGV4dGVuZHMgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24ge1xuICAgIHJlYWRvbmx5IG5hbWU6ICd3ZWJnbCc7XG4gICAgLy8gVE9ETzogYWRkIGZsYWdzXG4gIH1cbiAgZXhwb3J0IGludGVyZmFjZSBYbm5wYWNrRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24gZXh0ZW5kcyBFeGVjdXRpb25Qcm92aWRlck9wdGlvbiB7XG4gICAgcmVhZG9ubHkgbmFtZTogJ3hubnBhY2snO1xuICB9XG4gIGV4cG9ydCBpbnRlcmZhY2UgV2ViR3B1RXhlY3V0aW9uUHJvdmlkZXJPcHRpb24gZXh0ZW5kcyBFeGVjdXRpb25Qcm92aWRlck9wdGlvbiB7XG4gICAgcmVhZG9ubHkgbmFtZTogJ3dlYmdwdSc7XG4gICAgcHJlZmVycmVkTGF5b3V0PzogJ05DSFcnIHwgJ05IV0MnO1xuICB9XG5cbiAgLy8gI3JlZ2lvbiBXZWJOTiBvcHRpb25zXG5cbiAgaW50ZXJmYWNlIFdlYk5ORXhlY3V0aW9uUHJvdmlkZXJOYW1lIGV4dGVuZHMgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24ge1xuICAgIHJlYWRvbmx5IG5hbWU6ICd3ZWJubic7XG4gIH1cblxuICAvKipcbiAgICogUmVwcmVzZW50cyBhIHNldCBvZiBvcHRpb25zIGZvciBjcmVhdGluZyBhIFdlYk5OIE1MQ29udGV4dC5cbiAgICpcbiAgICogQHNlZSBodHRwczovL3d3dy53My5vcmcvVFIvd2Vibm4vI2RpY3RkZWYtbWxjb250ZXh0b3B0aW9uc1xuICAgKi9cbiAgZXhwb3J0IGludGVyZmFjZSBXZWJOTkNvbnRleHRPcHRpb25zIHtcbiAgICBkZXZpY2VUeXBlPzogJ2NwdScgfCAnZ3B1JyB8ICducHUnO1xuICAgIG51bVRocmVhZHM/OiBudW1iZXI7XG4gICAgcG93ZXJQcmVmZXJlbmNlPzogJ2RlZmF1bHQnIHwgJ2xvdy1wb3dlcicgfCAnaGlnaC1wZXJmb3JtYW5jZSc7XG4gIH1cblxuICAvKipcbiAgICogUmVwcmVzZW50cyBhIHNldCBvZiBvcHRpb25zIGZvciBXZWJOTiBleGVjdXRpb24gcHJvdmlkZXIgd2l0aG91dCBNTENvbnRleHQuXG4gICAqL1xuICBleHBvcnQgaW50ZXJmYWNlIFdlYk5OT3B0aW9uc1dpdGhvdXRNTENvbnRleHQgZXh0ZW5kcyBXZWJOTkV4ZWN1dGlvblByb3ZpZGVyTmFtZSwgV2ViTk5Db250ZXh0T3B0aW9ucyB7XG4gICAgY29udGV4dD86IG5ldmVyO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgYSBzZXQgb2Ygb3B0aW9ucyBmb3IgV2ViTk4gZXhlY3V0aW9uIHByb3ZpZGVyIHdpdGggTUxDb250ZXh0LlxuICAgKlxuICAgKiBXaGVuIE1MQ29udGV4dCBpcyBwcm92aWRlZCwgdGhlIGRldmljZVR5cGUgaXMgYWxzbyByZXF1aXJlZCBzbyB0aGF0IHRoZSBXZWJOTiBFUCBjYW4gZGV0ZXJtaW5lIHRoZSBwcmVmZXJyZWRcbiAgICogY2hhbm5lbCBsYXlvdXQuXG4gICAqXG4gICAqIEBzZWUgaHR0cHM6Ly93d3cudzMub3JnL1RSL3dlYm5uLyNkb20tbWwtY3JlYXRlY29udGV4dFxuICAgKi9cbiAgZXhwb3J0IGludGVyZmFjZSBXZWJOTk9wdGlvbnNXaXRoTUxDb250ZXh0XG4gICAgZXh0ZW5kcyBXZWJOTkV4ZWN1dGlvblByb3ZpZGVyTmFtZSxcbiAgICAgIE9taXQ8V2ViTk5Db250ZXh0T3B0aW9ucywgJ2RldmljZVR5cGUnPixcbiAgICAgIFJlcXVpcmVkPFBpY2s8V2ViTk5Db250ZXh0T3B0aW9ucywgJ2RldmljZVR5cGUnPj4ge1xuICAgIGNvbnRleHQ6IFRyeUdldEdsb2JhbFR5cGU8J01MQ29udGV4dCc+O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgYSBzZXQgb2Ygb3B0aW9ucyBmb3IgV2ViTk4gZXhlY3V0aW9uIHByb3ZpZGVyIHdpdGggTUxDb250ZXh0IHdoaWNoIGlzIGNyZWF0ZWQgZnJvbSBHUFVEZXZpY2UuXG4gICAqXG4gICAqIEBzZWUgaHR0cHM6Ly93d3cudzMub3JnL1RSL3dlYm5uLyNkb20tbWwtY3JlYXRlY29udGV4dC1ncHVkZXZpY2VcbiAgICovXG4gIGV4cG9ydCBpbnRlcmZhY2UgV2ViTk5PcHRpb25zV2ViR3B1IGV4dGVuZHMgV2ViTk5FeGVjdXRpb25Qcm92aWRlck5hbWUge1xuICAgIGNvbnRleHQ6IFRyeUdldEdsb2JhbFR5cGU8J01MQ29udGV4dCc+O1xuICAgIGdwdURldmljZTogVHJ5R2V0R2xvYmFsVHlwZTwnR1BVRGV2aWNlJz47XG4gIH1cblxuICAvKipcbiAgICogT3B0aW9ucyBmb3IgV2ViTk4gZXhlY3V0aW9uIHByb3ZpZGVyLlxuICAgKi9cbiAgZXhwb3J0IHR5cGUgV2ViTk5FeGVjdXRpb25Qcm92aWRlck9wdGlvbiA9XG4gICAgfCBXZWJOTk9wdGlvbnNXaXRob3V0TUxDb250ZXh0XG4gICAgfCBXZWJOTk9wdGlvbnNXaXRoTUxDb250ZXh0XG4gICAgfCBXZWJOTk9wdGlvbnNXZWJHcHU7XG5cbiAgLy8gI2VuZHJlZ2lvblxuXG4gIGV4cG9ydCBpbnRlcmZhY2UgUW5uRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24gZXh0ZW5kcyBFeGVjdXRpb25Qcm92aWRlck9wdGlvbiB7XG4gICAgcmVhZG9ubHkgbmFtZTogJ3Fubic7XG4gICAgLyoqXG4gICAgICogU3BlY2lmeSB0aGUgUU5OIGJhY2tlbmQgdHlwZS4gRS5nLiwgJ2NwdScgb3IgJ2h0cCcuXG4gICAgICogTXV0dWFsbHkgZXhjbHVzaXZlIHdpdGggYGJhY2tlbmRQYXRoYC5cbiAgICAgKlxuICAgICAqIEBkZWZhdWx0ICdodHAnXG4gICAgICovXG4gICAgYmFja2VuZFR5cGU/OiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogU3BlY2lmeSBhIHBhdGggdG8gdGhlIFFOTiBiYWNrZW5kIGxpYnJhcnkuXG4gICAgICogTXV0dWFsbHkgZXhjbHVzaXZlIHdpdGggYGJhY2tlbmRUeXBlYC5cbiAgICAgKi9cbiAgICBiYWNrZW5kUGF0aD86IHN0cmluZztcbiAgICAvKipcbiAgICAgKiBTcGVjaWZ5IHdoZXRoZXIgdG8gZW5hYmxlIEhUUCBGUDE2IHByZWNpc2lvbi5cbiAgICAgKlxuICAgICAqIEBkZWZhdWx0IHRydWVcbiAgICAgKi9cbiAgICBlbmFibGVGcDE2UHJlY2lzaW9uPzogYm9vbGVhbjtcbiAgfVxuICBleHBvcnQgaW50ZXJmYWNlIENvcmVNTEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIGV4dGVuZHMgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24ge1xuICAgIHJlYWRvbmx5IG5hbWU6ICdjb3JlbWwnO1xuICAgIC8qKlxuICAgICAqIFRoZSBiaXQgZmxhZ3MgZm9yIENvcmVNTCBleGVjdXRpb24gcHJvdmlkZXIuXG4gICAgICpcbiAgICAgKiBgYGBcbiAgICAgKiBDT1JFTUxfRkxBR19VU0VfQ1BVX09OTFkgPSAweDAwMVxuICAgICAqIENPUkVNTF9GTEFHX0VOQUJMRV9PTl9TVUJHUkFQSCA9IDB4MDAyXG4gICAgICogQ09SRU1MX0ZMQUdfT05MWV9FTkFCTEVfREVWSUNFX1dJVEhfQU5FID0gMHgwMDRcbiAgICAgKiBDT1JFTUxfRkxBR19PTkxZX0FMTE9XX1NUQVRJQ19JTlBVVF9TSEFQRVMgPSAweDAwOFxuICAgICAqIENPUkVNTF9GTEFHX0NSRUFURV9NTFBST0dSQU0gPSAweDAxMFxuICAgICAqIENPUkVNTF9GTEFHX1VTRV9DUFVfQU5EX0dQVSA9IDB4MDIwXG4gICAgICogYGBgXG4gICAgICpcbiAgICAgKiBTZWUgaW5jbHVkZS9vbm54cnVudGltZS9jb3JlL3Byb3ZpZGVycy9jb3JlbWwvY29yZW1sX3Byb3ZpZGVyX2ZhY3RvcnkuaCBmb3IgbW9yZSBkZXRhaWxzLlxuICAgICAqXG4gICAgICogVGhpcyBmbGFnIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIChOb2RlLmpzIGJpbmRpbmcpLlxuICAgICAqL1xuICAgIGNvcmVNbEZsYWdzPzogbnVtYmVyO1xuICAgIC8qKlxuICAgICAqIFNwZWNpZnkgd2hldGhlciB0byB1c2UgQ1BVIG9ubHkgaW4gQ29yZU1MIEVQLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIChyZWFjdC1uYXRpdmUpLlxuICAgICAqL1xuICAgIHVzZUNQVU9ubHk/OiBib29sZWFuO1xuICAgIHVzZUNQVUFuZEdQVT86IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICogU3BlY2lmeSB3aGV0aGVyIHRvIGVuYWJsZSBDb3JlTUwgRVAgb24gc3ViZ3JhcGguXG4gICAgICpcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgKHJlYWN0LW5hdGl2ZSkuXG4gICAgICovXG4gICAgZW5hYmxlT25TdWJncmFwaD86IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICogU3BlY2lmeSB3aGV0aGVyIHRvIG9ubHkgZW5hYmxlIENvcmVNTCBFUCBmb3IgQXBwbGUgZGV2aWNlcyB3aXRoIEFORSAoQXBwbGUgTmV1cmFsIEVuZ2luZSkuXG4gICAgICpcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgKHJlYWN0LW5hdGl2ZSkuXG4gICAgICovXG4gICAgb25seUVuYWJsZURldmljZVdpdGhBTkU/OiBib29sZWFuO1xuICB9XG4gIGV4cG9ydCBpbnRlcmZhY2UgTm5hcGlFeGVjdXRpb25Qcm92aWRlck9wdGlvbiBleHRlbmRzIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIHtcbiAgICByZWFkb25seSBuYW1lOiAnbm5hcGknO1xuICAgIHVzZUZQMTY/OiBib29sZWFuO1xuICAgIHVzZU5DSFc/OiBib29sZWFuO1xuICAgIGNwdURpc2FibGVkPzogYm9vbGVhbjtcbiAgICBjcHVPbmx5PzogYm9vbGVhbjtcbiAgfVxuICAvLyAjZW5kcmVnaW9uXG5cbiAgLy8gI2VuZHJlZ2lvblxuXG4gIC8vICNyZWdpb24gcnVuIG9wdGlvbnNcblxuICAvKipcbiAgICogQSBzZXQgb2YgY29uZmlndXJhdGlvbnMgZm9yIGluZmVyZW5jZSBydW4gYmVoYXZpb3JcbiAgICovXG4gIGV4cG9ydCBpbnRlcmZhY2UgUnVuT3B0aW9ucyB7XG4gICAgLyoqXG4gICAgICogTG9nIHNldmVyaXR5IGxldmVsLiBTZWVcbiAgICAgKiBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L29ubnhydW50aW1lL2Jsb2IvbWFpbi9pbmNsdWRlL29ubnhydW50aW1lL2NvcmUvY29tbW9uL2xvZ2dpbmcvc2V2ZXJpdHkuaFxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIChOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSkgb3IgV2ViQXNzZW1ibHkgYmFja2VuZFxuICAgICAqL1xuICAgIGxvZ1NldmVyaXR5TGV2ZWw/OiAwIHwgMSB8IDIgfCAzIHwgNDtcblxuICAgIC8qKlxuICAgICAqIExvZyB2ZXJib3NpdHkgbGV2ZWwuXG4gICAgICpcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gV2ViQXNzZW1ibHkgYmFja2VuZC4gV2lsbCBzdXBwb3J0IE5vZGUuanMgYmluZGluZyBhbmQgcmVhY3QtbmF0aXZlIGxhdGVyXG4gICAgICovXG4gICAgbG9nVmVyYm9zaXR5TGV2ZWw/OiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBUZXJtaW5hdGUgYWxsIGluY29tcGxldGUgT3J0UnVuIGNhbGxzIGFzIHNvb24gYXMgcG9zc2libGUgaWYgdHJ1ZVxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIFdlYkFzc2VtYmx5IGJhY2tlbmQuIFdpbGwgc3VwcG9ydCBOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSBsYXRlclxuICAgICAqL1xuICAgIHRlcm1pbmF0ZT86IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBBIHRhZyBmb3IgdGhlIFJ1bigpIGNhbGxzIHVzaW5nIHRoaXNcbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSAoTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUpIG9yIFdlYkFzc2VtYmx5IGJhY2tlbmRcbiAgICAgKi9cbiAgICB0YWc/OiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBzaW5nbGUgcnVuIGNvbmZpZ3VyYXRpb24gZW50cnkuIFNlZVxuICAgICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvb25ueHJ1bnRpbWUvYmxvYi9tYWluL2luY2x1ZGUvb25ueHJ1bnRpbWUvY29yZS9zZXNzaW9uL1xuICAgICAqIG9ubnhydW50aW1lX3J1bl9vcHRpb25zX2NvbmZpZ19rZXlzLmhcbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBXZWJBc3NlbWJseSBiYWNrZW5kLiBXaWxsIHN1cHBvcnQgTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUgbGF0ZXJcbiAgICAgKlxuICAgICAqIEBleGFtcGxlXG4gICAgICpcbiAgICAgKiBgYGBqc1xuICAgICAqIGV4dHJhOiB7XG4gICAgICogICBtZW1vcnk6IHtcbiAgICAgKiAgICAgZW5hYmxlX21lbW9yeV9hcmVuYV9zaHJpbmthZ2U6IFwiMVwiLFxuICAgICAqICAgfVxuICAgICAqIH1cbiAgICAgKiBgYGBcbiAgICAgKi9cbiAgICBleHRyYT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xuICB9XG5cbiAgLy8gI2VuZHJlZ2lvblxuXG4gIC8vICNyZWdpb24gdmFsdWUgbWV0YWRhdGFcblxuICAvKipcbiAgICogVGhlIGNvbW1vbiBwYXJ0IG9mIHRoZSB2YWx1ZSBtZXRhZGF0YSB0eXBlIGZvciBib3RoIHRlbnNvciBhbmQgbm9uLXRlbnNvciB2YWx1ZXMuXG4gICAqL1xuICBleHBvcnQgaW50ZXJmYWNlIFZhbHVlTWV0YWRhdGFCYXNlIHtcbiAgICAvKipcbiAgICAgKiBUaGUgbmFtZSBvZiB0aGUgc3BlY2lmaWVkIGlucHV0IG9yIG91dHB1dC5cbiAgICAgKi9cbiAgICByZWFkb25seSBuYW1lOiBzdHJpbmc7XG4gIH1cblxuICAvKipcbiAgICogUmVwcmVzZW50cyB0aGUgbWV0YWRhdGEgb2YgYSBub24tdGVuc29yIHZhbHVlLlxuICAgKi9cbiAgZXhwb3J0IGludGVyZmFjZSBOb25UZW5zb3JWYWx1ZU1ldGFkYXRhIGV4dGVuZHMgVmFsdWVNZXRhZGF0YUJhc2Uge1xuICAgIC8qKlxuICAgICAqIEdldCBhIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0aGUgdmFsdWUgaXMgYSB0ZW5zb3IuXG4gICAgICovXG4gICAgcmVhZG9ubHkgaXNUZW5zb3I6IGZhbHNlO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgdGhlIG1ldGFkYXRhIG9mIGEgdGVuc29yIHZhbHVlLlxuICAgKi9cbiAgZXhwb3J0IGludGVyZmFjZSBUZW5zb3JWYWx1ZU1ldGFkYXRhIGV4dGVuZHMgVmFsdWVNZXRhZGF0YUJhc2Uge1xuICAgIC8qKlxuICAgICAqIEdldCBhIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0aGUgdmFsdWUgaXMgYSB0ZW5zb3IuXG4gICAgICovXG4gICAgcmVhZG9ubHkgaXNUZW5zb3I6IHRydWU7XG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBkYXRhIHR5cGUgb2YgdGhlIHRlbnNvci5cbiAgICAgKi9cbiAgICByZWFkb25seSB0eXBlOiBUZW5zb3IuVHlwZTtcbiAgICAvKipcbiAgICAgKiBHZXQgdGhlIHNoYXBlIG9mIHRoZSB0ZW5zb3IuXG4gICAgICpcbiAgICAgKiBJZiB0aGUgc2hhcGUgaXMgbm90IGRlZmluZWQsIHRoZSB2YWx1ZSB3aWxsIGFuIGVtcHR5IGFycmF5LiBPdGhlcndpc2UsIGl0IHdpbGwgYmUgYW4gYXJyYXkgcmVwcmVzZW50aW5nIHRoZSBzaGFwZVxuICAgICAqIG9mIHRoZSB0ZW5zb3IuIEVhY2ggZWxlbWVudCBpbiB0aGUgYXJyYXkgY2FuIGJlIGEgbnVtYmVyIG9yIGEgc3RyaW5nLiBJZiB0aGUgZWxlbWVudCBpcyBhIG51bWJlciwgaXQgcmVwcmVzZW50c1xuICAgICAqIHRoZSBjb3JyZXNwb25kaW5nIGRpbWVuc2lvbiBzaXplLiBJZiB0aGUgZWxlbWVudCBpcyBhIHN0cmluZywgaXQgcmVwcmVzZW50cyBhIHN5bWJvbGljIGRpbWVuc2lvbi5cbiAgICAgKi9cbiAgICByZWFkb25seSBzaGFwZTogUmVhZG9ubHlBcnJheTxudW1iZXIgfCBzdHJpbmc+O1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgdGhlIG1ldGFkYXRhIG9mIGEgdmFsdWUuXG4gICAqL1xuICBleHBvcnQgdHlwZSBWYWx1ZU1ldGFkYXRhID0gTm9uVGVuc29yVmFsdWVNZXRhZGF0YSB8IFRlbnNvclZhbHVlTWV0YWRhdGE7XG5cbiAgLy8gI2VuZHJlZ2lvblxufVxuXG4vKipcbiAqIFJlcHJlc2VudCBhIHJ1bnRpbWUgaW5zdGFuY2Ugb2YgYW4gT05OWCBtb2RlbC5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBJbmZlcmVuY2VTZXNzaW9uIHtcbiAgLy8gI3JlZ2lvbiBydW4oKVxuXG4gIC8qKlxuICAgKiBFeGVjdXRlIHRoZSBtb2RlbCBhc3luY2hyb25vdXNseSB3aXRoIHRoZSBnaXZlbiBmZWVkcyBhbmQgb3B0aW9ucy5cbiAgICpcbiAgICogQHBhcmFtIGZlZWRzIC0gUmVwcmVzZW50YXRpb24gb2YgdGhlIG1vZGVsIGlucHV0LiBTZWUgdHlwZSBkZXNjcmlwdGlvbiBvZiBgSW5mZXJlbmNlU2Vzc2lvbi5JbnB1dFR5cGVgIGZvciBkZXRhaWwuXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9uYWwuIEEgc2V0IG9mIG9wdGlvbnMgdGhhdCBjb250cm9scyB0aGUgYmVoYXZpb3Igb2YgbW9kZWwgaW5mZXJlbmNlLlxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIG1hcCwgd2hpY2ggdXNlcyBvdXRwdXQgbmFtZXMgYXMga2V5cyBhbmQgT25ueFZhbHVlIGFzIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICAgKi9cbiAgcnVuKGZlZWRzOiBJbmZlcmVuY2VTZXNzaW9uLkZlZWRzVHlwZSwgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyk6IFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbi5SZXR1cm5UeXBlPjtcblxuICAvKipcbiAgICogRXhlY3V0ZSB0aGUgbW9kZWwgYXN5bmNocm9ub3VzbHkgd2l0aCB0aGUgZ2l2ZW4gZmVlZHMsIGZldGNoZXMgYW5kIG9wdGlvbnMuXG4gICAqXG4gICAqIEBwYXJhbSBmZWVkcyAtIFJlcHJlc2VudGF0aW9uIG9mIHRoZSBtb2RlbCBpbnB1dC4gU2VlIHR5cGUgZGVzY3JpcHRpb24gb2YgYEluZmVyZW5jZVNlc3Npb24uSW5wdXRUeXBlYCBmb3IgZGV0YWlsLlxuICAgKiBAcGFyYW0gZmV0Y2hlcyAtIFJlcHJlc2VudGF0aW9uIG9mIHRoZSBtb2RlbCBvdXRwdXQuIFNlZSB0eXBlIGRlc2NyaXB0aW9uIG9mIGBJbmZlcmVuY2VTZXNzaW9uLk91dHB1dFR5cGVgIGZvclxuICAgKiBkZXRhaWwuXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9uYWwuIEEgc2V0IG9mIG9wdGlvbnMgdGhhdCBjb250cm9scyB0aGUgYmVoYXZpb3Igb2YgbW9kZWwgaW5mZXJlbmNlLlxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIG1hcCwgd2hpY2ggdXNlcyBvdXRwdXQgbmFtZXMgYXMga2V5cyBhbmQgT25ueFZhbHVlIGFzIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICAgKi9cbiAgcnVuKFxuICAgIGZlZWRzOiBJbmZlcmVuY2VTZXNzaW9uLkZlZWRzVHlwZSxcbiAgICBmZXRjaGVzOiBJbmZlcmVuY2VTZXNzaW9uLkZldGNoZXNUeXBlLFxuICAgIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMsXG4gICk6IFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbi5SZXR1cm5UeXBlPjtcblxuICAvLyAjZW5kcmVnaW9uXG5cbiAgLy8gI3JlZ2lvbiByZWxlYXNlKClcblxuICAvKipcbiAgICogUmVsZWFzZSB0aGUgaW5mZXJlbmNlIHNlc3Npb24gYW5kIHRoZSB1bmRlcmx5aW5nIHJlc291cmNlcy5cbiAgICovXG4gIHJlbGVhc2UoKTogUHJvbWlzZTx2b2lkPjtcblxuICAvLyAjZW5kcmVnaW9uXG5cbiAgLy8gI3JlZ2lvbiBwcm9maWxpbmdcblxuICAvKipcbiAgICogU3RhcnQgcHJvZmlsaW5nLlxuICAgKi9cbiAgc3RhcnRQcm9maWxpbmcoKTogdm9pZDtcblxuICAvKipcbiAgICogRW5kIHByb2ZpbGluZy5cbiAgICovXG4gIGVuZFByb2ZpbGluZygpOiB2b2lkO1xuXG4gIC8vICNlbmRyZWdpb25cblxuICAvLyAjcmVnaW9uIG1ldGFkYXRhXG5cbiAgLyoqXG4gICAqIEdldCBpbnB1dCBuYW1lcyBvZiB0aGUgbG9hZGVkIG1vZGVsLlxuICAgKi9cbiAgcmVhZG9ubHkgaW5wdXROYW1lczogcmVhZG9ubHkgc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIEdldCBvdXRwdXQgbmFtZXMgb2YgdGhlIGxvYWRlZCBtb2RlbC5cbiAgICovXG4gIHJlYWRvbmx5IG91dHB1dE5hbWVzOiByZWFkb25seSBzdHJpbmdbXTtcblxuICAvKipcbiAgICogR2V0IGlucHV0IG1ldGFkYXRhIG9mIHRoZSBsb2FkZWQgbW9kZWwuXG4gICAqL1xuICByZWFkb25seSBpbnB1dE1ldGFkYXRhOiByZWFkb25seSBJbmZlcmVuY2VTZXNzaW9uLlZhbHVlTWV0YWRhdGFbXTtcblxuICAvKipcbiAgICogR2V0IG91dHB1dCBtZXRhZGF0YSBvZiB0aGUgbG9hZGVkIG1vZGVsLlxuICAgKi9cbiAgcmVhZG9ubHkgb3V0cHV0TWV0YWRhdGE6IHJlYWRvbmx5IEluZmVyZW5jZVNlc3Npb24uVmFsdWVNZXRhZGF0YVtdO1xuXG4gIC8vICNlbmRyZWdpb25cbn1cblxuZXhwb3J0IGludGVyZmFjZSBJbmZlcmVuY2VTZXNzaW9uRmFjdG9yeSB7XG4gIC8vICNyZWdpb24gY3JlYXRlKClcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGluZmVyZW5jZSBzZXNzaW9uIGFuZCBsb2FkIG1vZGVsIGFzeW5jaHJvbm91c2x5IGZyb20gYW4gT05OWCBtb2RlbCBmaWxlLlxuICAgKlxuICAgKiBAcGFyYW0gdXJpIC0gVGhlIFVSSSBvciBmaWxlIHBhdGggb2YgdGhlIG1vZGVsIHRvIGxvYWQuXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gc3BlY2lmeSBjb25maWd1cmF0aW9uIGZvciBjcmVhdGluZyBhIG5ldyBpbmZlcmVuY2Ugc2Vzc2lvbi5cbiAgICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYW4gSW5mZXJlbmNlU2Vzc2lvbiBvYmplY3QuXG4gICAqL1xuICBjcmVhdGUodXJpOiBzdHJpbmcsIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uPjtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGluZmVyZW5jZSBzZXNzaW9uIGFuZCBsb2FkIG1vZGVsIGFzeW5jaHJvbm91c2x5IGZyb20gYW4gYXJyYXkgYnVmZXIuXG4gICAqXG4gICAqIEBwYXJhbSBidWZmZXIgLSBBbiBBcnJheUJ1ZmZlciByZXByZXNlbnRhdGlvbiBvZiBhbiBPTk5YIG1vZGVsLlxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIHNwZWNpZnkgY29uZmlndXJhdGlvbiBmb3IgY3JlYXRpbmcgYSBuZXcgaW5mZXJlbmNlIHNlc3Npb24uXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIEluZmVyZW5jZVNlc3Npb24gb2JqZWN0LlxuICAgKi9cbiAgY3JlYXRlKGJ1ZmZlcjogQXJyYXlCdWZmZXJMaWtlLCBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbj47XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBpbmZlcmVuY2Ugc2Vzc2lvbiBhbmQgbG9hZCBtb2RlbCBhc3luY2hyb25vdXNseSBmcm9tIHNlZ21lbnQgb2YgYW4gYXJyYXkgYnVmZXIuXG4gICAqXG4gICAqIEBwYXJhbSBidWZmZXIgLSBBbiBBcnJheUJ1ZmZlciByZXByZXNlbnRhdGlvbiBvZiBhbiBPTk5YIG1vZGVsLlxuICAgKiBAcGFyYW0gYnl0ZU9mZnNldCAtIFRoZSBiZWdpbm5pbmcgb2YgdGhlIHNwZWNpZmllZCBwb3J0aW9uIG9mIHRoZSBhcnJheSBidWZmZXIuXG4gICAqIEBwYXJhbSBieXRlTGVuZ3RoIC0gVGhlIGxlbmd0aCBpbiBieXRlcyBvZiB0aGUgYXJyYXkgYnVmZmVyLlxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIHNwZWNpZnkgY29uZmlndXJhdGlvbiBmb3IgY3JlYXRpbmcgYSBuZXcgaW5mZXJlbmNlIHNlc3Npb24uXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIEluZmVyZW5jZVNlc3Npb24gb2JqZWN0LlxuICAgKi9cbiAgY3JlYXRlKFxuICAgIGJ1ZmZlcjogQXJyYXlCdWZmZXJMaWtlLFxuICAgIGJ5dGVPZmZzZXQ6IG51bWJlcixcbiAgICBieXRlTGVuZ3RoPzogbnVtYmVyLFxuICAgIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zLFxuICApOiBQcm9taXNlPEluZmVyZW5jZVNlc3Npb24+O1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgaW5mZXJlbmNlIHNlc3Npb24gYW5kIGxvYWQgbW9kZWwgYXN5bmNocm9ub3VzbHkgZnJvbSBhIFVpbnQ4QXJyYXkuXG4gICAqXG4gICAqIEBwYXJhbSBidWZmZXIgLSBBIFVpbnQ4QXJyYXkgcmVwcmVzZW50YXRpb24gb2YgYW4gT05OWCBtb2RlbC5cbiAgICogQHBhcmFtIG9wdGlvbnMgLSBzcGVjaWZ5IGNvbmZpZ3VyYXRpb24gZm9yIGNyZWF0aW5nIGEgbmV3IGluZmVyZW5jZSBzZXNzaW9uLlxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBJbmZlcmVuY2VTZXNzaW9uIG9iamVjdC5cbiAgICovXG4gIGNyZWF0ZShidWZmZXI6IFVpbnQ4QXJyYXksIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uPjtcblxuICAvLyAjZW5kcmVnaW9uXG59XG5cbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb25cbmV4cG9ydCBjb25zdCBJbmZlcmVuY2VTZXNzaW9uOiBJbmZlcmVuY2VTZXNzaW9uRmFjdG9yeSA9IEluZmVyZW5jZVNlc3Npb25JbXBsO1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgeyBPcHRpb25zRm9ybWF0LCBPcHRpb25zTm9ybWFsaXphdGlvblBhcmFtZXRlcnMsIE9wdGlvbnNUZW5zb3JMYXlvdXQgfSBmcm9tICcuL3RlbnNvci1mYWN0b3J5LmpzJztcblxuZXhwb3J0IGludGVyZmFjZSBUZW5zb3JUb0RhdGFVcmxPcHRpb25zIGV4dGVuZHMgT3B0aW9uc1RlbnNvckxheW91dCwgT3B0aW9uc0Zvcm1hdCwgT3B0aW9uc05vcm1hbGl6YXRpb25QYXJhbWV0ZXJzIHt9XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGVuc29yVG9JbWFnZURhdGFPcHRpb25zIGV4dGVuZHMgT3B0aW9uc1RlbnNvckxheW91dCwgT3B0aW9uc0Zvcm1hdCwgT3B0aW9uc05vcm1hbGl6YXRpb25QYXJhbWV0ZXJzIHt9XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29udmVyc2lvblV0aWxzIHtcbiAgLyoqXG4gICAqIGNyZWF0ZXMgYSBEYXRhVVJMIGluc3RhbmNlIGZyb20gdGVuc29yXG4gICAqXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gQW4gb3B0aW9uYWwgb2JqZWN0IHJlcHJlc2VudGluZyBvcHRpb25zIGZvciBjcmVhdGluZyBhIERhdGFVUkwgaW5zdGFuY2UgZnJvbSB0aGUgdGVuc29yLlxuICAgKlxuICAgKiBUaGUgZm9sbG93aW5nIGRlZmF1bHQgc2V0dGluZ3Mgd2lsbCBiZSBhcHBsaWVkOlxuICAgKiAtIGBmb3JtYXRgOiBgJ1JHQidgXG4gICAqIC0gYHRlbnNvckxheW91dGA6IGAnTkNIVydgXG4gICAqIEByZXR1cm5zIGEgRGF0YVVSTCBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBpbWFnZSBjb252ZXJ0ZWQgZnJvbSB0ZW5zb3IgZGF0YVxuICAgKi9cbiAgdG9EYXRhVVJMKG9wdGlvbnM/OiBUZW5zb3JUb0RhdGFVcmxPcHRpb25zKTogc3RyaW5nO1xuXG4gIC8qKlxuICAgKiBjcmVhdGVzIGFuIEltYWdlRGF0YSBpbnN0YW5jZSBmcm9tIHRlbnNvclxuICAgKlxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIEFuIG9wdGlvbmFsIG9iamVjdCByZXByZXNlbnRpbmcgb3B0aW9ucyBmb3IgY3JlYXRpbmcgYW4gSW1hZ2VEYXRhIGluc3RhbmNlIGZyb20gdGhlIHRlbnNvci5cbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBkZWZhdWx0IHNldHRpbmdzIHdpbGwgYmUgYXBwbGllZDpcbiAgICogLSBgZm9ybWF0YDogYCdSR0InYFxuICAgKiAtIGB0ZW5zb3JMYXlvdXRgOiBgJ05DSFcnYFxuICAgKiBAcmV0dXJucyBhbiBJbWFnZURhdGEgaW5zdGFuY2UgcmVwcmVzZW50aW5nIHRoZSBpbWFnZSBjb252ZXJ0ZWQgZnJvbSB0ZW5zb3IgZGF0YVxuICAgKi9cbiAgdG9JbWFnZURhdGEob3B0aW9ucz86IFRlbnNvclRvSW1hZ2VEYXRhT3B0aW9ucyk6IEltYWdlRGF0YTtcbn1cbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHsgVGVuc29yLCBUeXBlZFRlbnNvciB9IGZyb20gJy4vdGVuc29yLmpzJztcblxuZXhwb3J0IHR5cGUgSW1hZ2VGb3JtYXQgPSAnUkdCJyB8ICdSR0JBJyB8ICdCR1InIHwgJ1JCRyc7XG5leHBvcnQgdHlwZSBJbWFnZVRlbnNvckxheW91dCA9ICdOSFdDJyB8ICdOQ0hXJztcblxuLy8gdGhlIGZvbGxvd2luZyByZWdpb24gY29udGFpbnMgdHlwZSBkZWZpbml0aW9ucyBmb3IgY29uc3RydWN0aW5nIHRlbnNvciBmcm9tIGEgc3BlY2lmaWMgbG9jYXRpb24uXG5cbi8vICNyZWdpb24gdHlwZXMgZm9yIGNvbnN0cnVjdGluZyBhIHRlbnNvciBmcm9tIGEgc3BlY2lmaWMgbG9jYXRpb25cblxuLyoqXG4gKiByZXByZXNlbnQgY29tbW9uIHByb3BlcnRpZXMgb2YgdGhlIHBhcmFtZXRlciBmb3IgY29uc3RydWN0aW5nIGEgdGVuc29yIGZyb20gYSBzcGVjaWZpYyBsb2NhdGlvbi5cbiAqL1xuaW50ZXJmYWNlIENvbW1vbkNvbnN0cnVjdG9yUGFyYW1ldGVyczxUPiBleHRlbmRzIFBpY2s8VGVuc29yLCAnZGltcyc+IHtcbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIGRhdGEgdHlwZSBvZiB0aGUgdGVuc29yLlxuICAgKi9cbiAgcmVhZG9ubHkgdHlwZTogVDtcbn1cblxuLyoqXG4gKiByZXByZXNlbnQgdGhlIHBhcmFtZXRlciBmb3IgY29uc3RydWN0aW5nIGEgdGVuc29yIGZyb20gYSBHUFUgcmVzb3VyY2UuXG4gKi9cbmludGVyZmFjZSBHcHVSZXNvdXJjZUNvbnN0cnVjdG9yUGFyYW1ldGVyczxUIGV4dGVuZHMgVGVuc29yLlR5cGU+IHtcbiAgLyoqXG4gICAqIGFuIG9wdGlvbmFsIGNhbGxiYWNrIGZ1bmN0aW9uIHRvIGRvd25sb2FkIGRhdGEgZnJvbSBHUFUgdG8gQ1BVLlxuICAgKlxuICAgKiBJZiBub3QgcHJvdmlkZWQsIHRoZSB0ZW5zb3IgdHJlYXQgdGhlIEdQVSBkYXRhIGFzIGV4dGVybmFsIHJlc291cmNlLlxuICAgKi9cbiAgZG93bmxvYWQ/KCk6IFByb21pc2U8VGVuc29yLkRhdGFUeXBlTWFwW1RdPjtcblxuICAvKipcbiAgICogYW4gb3B0aW9uYWwgY2FsbGJhY2sgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSB0ZW5zb3IgaXMgZGlzcG9zZWQuXG4gICAqXG4gICAqIElmIG5vdCBwcm92aWRlZCwgdGhlIHRlbnNvciB0cmVhdCB0aGUgR1BVIGRhdGEgYXMgZXh0ZXJuYWwgcmVzb3VyY2UuXG4gICAqL1xuICBkaXNwb3NlPygpOiB2b2lkO1xufVxuXG4vKipcbiAqIHJlcHJlc2VudCB0aGUgcGFyYW1ldGVyIGZvciBjb25zdHJ1Y3RpbmcgYSB0ZW5zb3IgZnJvbSBhIHBpbm5lZCBDUFUgYnVmZmVyXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgQ3B1UGlubmVkQ29uc3RydWN0b3JQYXJhbWV0ZXJzPFQgZXh0ZW5kcyBUZW5zb3IuQ3B1UGlubmVkRGF0YVR5cGVzID0gVGVuc29yLkNwdVBpbm5lZERhdGFUeXBlcz5cbiAgZXh0ZW5kcyBDb21tb25Db25zdHJ1Y3RvclBhcmFtZXRlcnM8VD4ge1xuICAvKipcbiAgICogU3BlY2lmeSB0aGUgbG9jYXRpb24gb2YgdGhlIGRhdGEgdG8gYmUgJ2NwdS1waW5uZWQnLlxuICAgKi9cbiAgcmVhZG9ubHkgbG9jYXRpb246ICdjcHUtcGlubmVkJztcbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIENQVSBwaW5uZWQgYnVmZmVyIHRoYXQgaG9sZHMgdGhlIHRlbnNvciBkYXRhLlxuICAgKi9cbiAgcmVhZG9ubHkgZGF0YTogVGVuc29yLkRhdGFUeXBlTWFwW1RdO1xufVxuXG4vKipcbiAqIHJlcHJlc2VudCB0aGUgcGFyYW1ldGVyIGZvciBjb25zdHJ1Y3RpbmcgYSB0ZW5zb3IgZnJvbSBhIFdlYkdMIHRleHR1cmVcbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUZXh0dXJlQ29uc3RydWN0b3JQYXJhbWV0ZXJzPFQgZXh0ZW5kcyBUZW5zb3IuVGV4dHVyZURhdGFUeXBlcyA9IFRlbnNvci5UZXh0dXJlRGF0YVR5cGVzPlxuICBleHRlbmRzIENvbW1vbkNvbnN0cnVjdG9yUGFyYW1ldGVyczxUPixcbiAgICBHcHVSZXNvdXJjZUNvbnN0cnVjdG9yUGFyYW1ldGVyczxUPiB7XG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSBsb2NhdGlvbiBvZiB0aGUgZGF0YSB0byBiZSAndGV4dHVyZScuXG4gICAqL1xuICByZWFkb25seSBsb2NhdGlvbjogJ3RleHR1cmUnO1xuICAvKipcbiAgICogU3BlY2lmeSB0aGUgV2ViR0wgdGV4dHVyZSB0aGF0IGhvbGRzIHRoZSB0ZW5zb3IgZGF0YS5cbiAgICovXG4gIHJlYWRvbmx5IHRleHR1cmU6IFRlbnNvci5UZXh0dXJlVHlwZTtcbn1cblxuLyoqXG4gKiByZXByZXNlbnQgdGhlIHBhcmFtZXRlciBmb3IgY29uc3RydWN0aW5nIGEgdGVuc29yIGZyb20gYSBXZWJHUFUgYnVmZmVyXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgR3B1QnVmZmVyQ29uc3RydWN0b3JQYXJhbWV0ZXJzPFQgZXh0ZW5kcyBUZW5zb3IuR3B1QnVmZmVyRGF0YVR5cGVzID0gVGVuc29yLkdwdUJ1ZmZlckRhdGFUeXBlcz5cbiAgZXh0ZW5kcyBDb21tb25Db25zdHJ1Y3RvclBhcmFtZXRlcnM8VD4sXG4gICAgR3B1UmVzb3VyY2VDb25zdHJ1Y3RvclBhcmFtZXRlcnM8VD4ge1xuICAvKipcbiAgICogU3BlY2lmeSB0aGUgbG9jYXRpb24gb2YgdGhlIGRhdGEgdG8gYmUgJ2dwdS1idWZmZXInLlxuICAgKi9cbiAgcmVhZG9ubHkgbG9jYXRpb246ICdncHUtYnVmZmVyJztcbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIFdlYkdQVSBidWZmZXIgdGhhdCBob2xkcyB0aGUgdGVuc29yIGRhdGEuXG4gICAqL1xuICByZWFkb25seSBncHVCdWZmZXI6IFRlbnNvci5HcHVCdWZmZXJUeXBlO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE1MVGVuc29yQ29uc3RydWN0b3JQYXJhbWV0ZXJzPFQgZXh0ZW5kcyBUZW5zb3IuTUxUZW5zb3JEYXRhVHlwZXMgPSBUZW5zb3IuTUxUZW5zb3JEYXRhVHlwZXM+XG4gIGV4dGVuZHMgQ29tbW9uQ29uc3RydWN0b3JQYXJhbWV0ZXJzPFQ+LFxuICAgIEdwdVJlc291cmNlQ29uc3RydWN0b3JQYXJhbWV0ZXJzPFQ+IHtcbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIGxvY2F0aW9uIG9mIHRoZSBkYXRhIHRvIGJlICdtbC10ZW5zb3InLlxuICAgKi9cbiAgcmVhZG9ubHkgbG9jYXRpb246ICdtbC10ZW5zb3InO1xuXG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSBXZWJOTiBNTFRlbnNvciB0aGF0IGhvbGRzIHRoZSB0ZW5zb3IgZGF0YS5cbiAgICovXG4gIHJlYWRvbmx5IG1sVGVuc29yOiBUZW5zb3IuTUxUZW5zb3JUeXBlO1xufVxuXG4vLyAjZW5kcmVnaW9uXG5cbi8vIHRoZSBmb2xsb3dpbmcgcmVnaW9uIGNvbnRhaW5zIHR5cGUgZGVmaW5pdGlvbnMgb2YgZWFjaCBpbmRpdmlkdWFsIG9wdGlvbnMuXG4vLyB0aGUgdGVuc29yIGZhY3RvcnkgZnVuY3Rpb25zIHVzZSBhIGNvbXBvc2l0aW9uIG9mIHRob3NlIG9wdGlvbnMgYXMgdGhlIHBhcmFtZXRlciB0eXBlLlxuXG4vLyAjcmVnaW9uIE9wdGlvbnMgZmllbGRzXG5cbmV4cG9ydCBpbnRlcmZhY2UgT3B0aW9uc0Zvcm1hdCB7XG4gIC8qKlxuICAgKiBEZXNjcmliZXMgdGhlIGltYWdlIGZvcm1hdCByZXByZXNlbnRlZCBpbiBSR0JBIGNvbG9yIHNwYWNlLlxuICAgKi9cbiAgZm9ybWF0PzogSW1hZ2VGb3JtYXQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3B0aW9uc1RlbnNvckZvcm1hdCB7XG4gIC8qKlxuICAgKiBEZXNjcmliZXMgdGhlIGltYWdlIGZvcm1hdCBvZiB0aGUgdGVuc29yLlxuICAgKlxuICAgKiBOT1RFOiB0aGlzIGlzIGRpZmZlcmVudCBmcm9tIG9wdGlvbiAnZm9ybWF0Jy4gV2hpbGUgb3B0aW9uICdmb3JtYXQnIHJlcHJlc2VudHMgdGhlIG9yaWdpbmFsIGltYWdlLCAndGVuc29yRm9ybWF0J1xuICAgKiByZXByZXNlbnRzIHRoZSB0YXJnZXQgZm9ybWF0IG9mIHRoZSB0ZW5zb3IuIEEgdHJhbnNwb3NlIHdpbGwgYmUgcGVyZm9ybWVkIGlmIHRoZXkgYXJlIGRpZmZlcmVudC5cbiAgICovXG4gIHRlbnNvckZvcm1hdD86IEltYWdlRm9ybWF0O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE9wdGlvbnNUZW5zb3JEYXRhVHlwZSB7XG4gIC8qKlxuICAgKiBEZXNjcmliZXMgdGhlIGRhdGEgdHlwZSBvZiB0aGUgdGVuc29yLlxuICAgKi9cbiAgZGF0YVR5cGU/OiAnZmxvYXQzMicgfCAndWludDgnO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE9wdGlvbnNUZW5zb3JMYXlvdXQge1xuICAvKipcbiAgICogRGVzY3JpYmVzIHRoZSB0ZW5zb3IgbGF5b3V0IHdoZW4gcmVwcmVzZW50aW5nIGRhdGEgb2Ygb25lIG9yIG1vcmUgaW1hZ2UocykuXG4gICAqL1xuICB0ZW5zb3JMYXlvdXQ/OiBJbWFnZVRlbnNvckxheW91dDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBPcHRpb25zRGltZW5zaW9ucyB7XG4gIC8qKlxuICAgKiBEZXNjcmliZXMgdGhlIGltYWdlIGhlaWdodCBpbiBwaXhlbFxuICAgKi9cbiAgaGVpZ2h0PzogbnVtYmVyO1xuICAvKipcbiAgICogRGVzY3JpYmVzIHRoZSBpbWFnZSB3aWR0aCBpbiBwaXhlbFxuICAgKi9cbiAgd2lkdGg/OiBudW1iZXI7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3B0aW9uUmVzaXplZERpbWVuc2lvbnMge1xuICAvKipcbiAgICogRGVzY3JpYmVzIHRoZSByZXNpemVkIGhlaWdodC4gSWYgb21pdHRlZCwgb3JpZ2luYWwgaGVpZ2h0IHdpbGwgYmUgdXNlZC5cbiAgICovXG4gIHJlc2l6ZWRIZWlnaHQ/OiBudW1iZXI7XG4gIC8qKlxuICAgKiBEZXNjcmliZXMgcmVzaXplZCB3aWR0aCAtIGNhbiBiZSBhY2Nlc3NlZCB2aWEgdGVuc29yIGRpbWVuc2lvbnMgYXMgd2VsbFxuICAgKi9cbiAgcmVzaXplZFdpZHRoPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE9wdGlvbnNOb3JtYWxpemF0aW9uUGFyYW1ldGVycyB7XG4gIC8qKlxuICAgKiBEZXNjcmliZXMgbm9ybWFsaXphdGlvbiBwYXJhbWV0ZXJzIHdoZW4gcHJlcHJvY2Vzc2luZyB0aGUgaW1hZ2UgYXMgbW9kZWwgaW5wdXQuXG4gICAqXG4gICAqIERhdGEgZWxlbWVudCBhcmUgcmFuZ2VkIGZyb20gMCB0byAyNTUuXG4gICAqL1xuICBub3JtPzoge1xuICAgIC8qKlxuICAgICAqIFRoZSAnYmlhcycgdmFsdWUgZm9yIGltYWdlIG5vcm1hbGl6YXRpb24uXG4gICAgICogLSBJZiBvbWl0dGVkLCB1c2UgZGVmYXVsdCB2YWx1ZSAwLlxuICAgICAqIC0gSWYgaXQncyBhIHNpbmdsZSBudW1iZXIsIGFwcGx5IHRvIGVhY2ggY2hhbm5lbFxuICAgICAqIC0gSWYgaXQncyBhbiBhcnJheSBvZiAzIG9yIDQgbnVtYmVycywgYXBwbHkgZWxlbWVudC13aXNlLiBOdW1iZXIgb2YgZWxlbWVudHMgbmVlZCB0byBtYXRjaCB0aGUgbnVtYmVyIG9mIGNoYW5uZWxzXG4gICAgICogZm9yIHRoZSBjb3JyZXNwb25kaW5nIGltYWdlIGZvcm1hdFxuICAgICAqL1xuICAgIGJpYXM/OiBudW1iZXIgfCBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl0gfCBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcbiAgICAvKipcbiAgICAgKiBUaGUgJ21lYW4nIHZhbHVlIGZvciBpbWFnZSBub3JtYWxpemF0aW9uLlxuICAgICAqIC0gSWYgb21pdHRlZCwgdXNlIGRlZmF1bHQgdmFsdWUgMjU1LlxuICAgICAqIC0gSWYgaXQncyBhIHNpbmdsZSBudW1iZXIsIGFwcGx5IHRvIGVhY2ggY2hhbm5lbFxuICAgICAqIC0gSWYgaXQncyBhbiBhcnJheSBvZiAzIG9yIDQgbnVtYmVycywgYXBwbHkgZWxlbWVudC13aXNlLiBOdW1iZXIgb2YgZWxlbWVudHMgbmVlZCB0byBtYXRjaCB0aGUgbnVtYmVyIG9mIGNoYW5uZWxzXG4gICAgICogZm9yIHRoZSBjb3JyZXNwb25kaW5nIGltYWdlIGZvcm1hdFxuICAgICAqL1xuICAgIG1lYW4/OiBudW1iZXIgfCBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl0gfCBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcbiAgfTtcbn1cblxuLy8gI2VuZHJlZ2lvblxuXG4vLyAjcmVnaW9uIE9wdGlvbnMgY29tcG9zaXRpb25cblxuZXhwb3J0IGludGVyZmFjZSBUZW5zb3JGcm9tSW1hZ2VEYXRhT3B0aW9uc1xuICBleHRlbmRzIE9wdGlvblJlc2l6ZWREaW1lbnNpb25zLFxuICAgIE9wdGlvbnNUZW5zb3JGb3JtYXQsXG4gICAgT3B0aW9uc1RlbnNvckxheW91dCxcbiAgICBPcHRpb25zVGVuc29yRGF0YVR5cGUsXG4gICAgT3B0aW9uc05vcm1hbGl6YXRpb25QYXJhbWV0ZXJzIHt9XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGVuc29yRnJvbUltYWdlRWxlbWVudE9wdGlvbnNcbiAgZXh0ZW5kcyBPcHRpb25SZXNpemVkRGltZW5zaW9ucyxcbiAgICBPcHRpb25zVGVuc29yRm9ybWF0LFxuICAgIE9wdGlvbnNUZW5zb3JMYXlvdXQsXG4gICAgT3B0aW9uc1RlbnNvckRhdGFUeXBlLFxuICAgIE9wdGlvbnNOb3JtYWxpemF0aW9uUGFyYW1ldGVycyB7fVxuXG5leHBvcnQgaW50ZXJmYWNlIFRlbnNvckZyb21VcmxPcHRpb25zXG4gIGV4dGVuZHMgT3B0aW9uc0RpbWVuc2lvbnMsXG4gICAgT3B0aW9uUmVzaXplZERpbWVuc2lvbnMsXG4gICAgT3B0aW9uc1RlbnNvckZvcm1hdCxcbiAgICBPcHRpb25zVGVuc29yTGF5b3V0LFxuICAgIE9wdGlvbnNUZW5zb3JEYXRhVHlwZSxcbiAgICBPcHRpb25zTm9ybWFsaXphdGlvblBhcmFtZXRlcnMge31cblxuZXhwb3J0IGludGVyZmFjZSBUZW5zb3JGcm9tSW1hZ2VCaXRtYXBPcHRpb25zXG4gIGV4dGVuZHMgT3B0aW9uUmVzaXplZERpbWVuc2lvbnMsXG4gICAgT3B0aW9uc1RlbnNvckZvcm1hdCxcbiAgICBPcHRpb25zVGVuc29yTGF5b3V0LFxuICAgIE9wdGlvbnNUZW5zb3JEYXRhVHlwZSxcbiAgICBPcHRpb25zTm9ybWFsaXphdGlvblBhcmFtZXRlcnMge31cblxuZXhwb3J0IGludGVyZmFjZSBUZW5zb3JGcm9tVGV4dHVyZU9wdGlvbnM8VCBleHRlbmRzIFRlbnNvci5UZXh0dXJlRGF0YVR5cGVzPlxuICBleHRlbmRzIFJlcXVpcmVkPE9wdGlvbnNEaW1lbnNpb25zPixcbiAgICBPcHRpb25zRm9ybWF0LFxuICAgIEdwdVJlc291cmNlQ29uc3RydWN0b3JQYXJhbWV0ZXJzPFQ+IC8qIFRPRE86IGFkZCBtb3JlICovIHt9XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGVuc29yRnJvbUdwdUJ1ZmZlck9wdGlvbnM8VCBleHRlbmRzIFRlbnNvci5HcHVCdWZmZXJEYXRhVHlwZXM+XG4gIGV4dGVuZHMgUGljazxUZW5zb3IsICdkaW1zJz4sXG4gICAgR3B1UmVzb3VyY2VDb25zdHJ1Y3RvclBhcmFtZXRlcnM8VD4ge1xuICAvKipcbiAgICogRGVzY3JpYmVzIHRoZSBkYXRhIHR5cGUgb2YgdGhlIHRlbnNvci5cbiAgICovXG4gIGRhdGFUeXBlPzogVDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBUZW5zb3JGcm9tTUxUZW5zb3JPcHRpb25zPFQgZXh0ZW5kcyBUZW5zb3IuTUxUZW5zb3JEYXRhVHlwZXM+XG4gIGV4dGVuZHMgUGljazxUZW5zb3IsICdkaW1zJz4sXG4gICAgR3B1UmVzb3VyY2VDb25zdHJ1Y3RvclBhcmFtZXRlcnM8VD4ge1xuICAvKipcbiAgICogRGVzY3JpYmVzIHRoZSBkYXRhIHR5cGUgb2YgdGhlIHRlbnNvci5cbiAgICovXG4gIGRhdGFUeXBlPzogVDtcbn1cblxuLy8gI2VuZHJlZ2lvblxuXG4vKipcbiAqIHR5cGUgVGVuc29yRmFjdG9yeSBkZWZpbmVzIHRoZSBmYWN0b3J5IGZ1bmN0aW9ucyBvZiAnVGVuc29yJyB0byBjcmVhdGUgdGVuc29yIGluc3RhbmNlcyBmcm9tIGV4aXN0aW5nIGRhdGEgb3JcbiAqIHJlc291cmNlcy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBUZW5zb3JGYWN0b3J5IHtcbiAgLyoqXG4gICAqIGNyZWF0ZSBhIHRlbnNvciBmcm9tIGFuIEltYWdlRGF0YSBvYmplY3RcbiAgICpcbiAgICogQHBhcmFtIGltYWdlRGF0YSAtIHRoZSBJbWFnZURhdGEgb2JqZWN0IHRvIGNyZWF0ZSB0ZW5zb3IgZnJvbVxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIEFuIG9wdGlvbmFsIG9iamVjdCByZXByZXNlbnRpbmcgb3B0aW9ucyBmb3IgY3JlYXRpbmcgdGVuc29yIGZyb20gSW1hZ2VEYXRhLlxuICAgKlxuICAgKiBUaGUgZm9sbG93aW5nIGRlZmF1bHQgc2V0dGluZ3Mgd2lsbCBiZSBhcHBsaWVkOlxuICAgKiAtIGB0ZW5zb3JGb3JtYXRgOiBgJ1JHQidgXG4gICAqIC0gYHRlbnNvckxheW91dGA6IGAnTkNIVydgXG4gICAqIC0gYGRhdGFUeXBlYDogYCdmbG9hdDMyJ2BcbiAgICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSB0ZW5zb3Igb2JqZWN0XG4gICAqL1xuICBmcm9tSW1hZ2UoXG4gICAgaW1hZ2VEYXRhOiBJbWFnZURhdGEsXG4gICAgb3B0aW9ucz86IFRlbnNvckZyb21JbWFnZURhdGFPcHRpb25zLFxuICApOiBQcm9taXNlPFR5cGVkVGVuc29yPCdmbG9hdDMyJz4gfCBUeXBlZFRlbnNvcjwndWludDgnPj47XG5cbiAgLyoqXG4gICAqIGNyZWF0ZSBhIHRlbnNvciBmcm9tIGEgSFRNTEltYWdlRWxlbWVudCBvYmplY3RcbiAgICpcbiAgICogQHBhcmFtIGltYWdlRWxlbWVudCAtIHRoZSBIVE1MSW1hZ2VFbGVtZW50IG9iamVjdCB0byBjcmVhdGUgdGVuc29yIGZyb21cbiAgICogQHBhcmFtIG9wdGlvbnMgLSBBbiBvcHRpb25hbCBvYmplY3QgcmVwcmVzZW50aW5nIG9wdGlvbnMgZm9yIGNyZWF0aW5nIHRlbnNvciBmcm9tIEhUTUxJbWFnZUVsZW1lbnQuXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZGVmYXVsdCBzZXR0aW5ncyB3aWxsIGJlIGFwcGxpZWQ6XG4gICAqIC0gYHRlbnNvckZvcm1hdGA6IGAnUkdCJ2BcbiAgICogLSBgdGVuc29yTGF5b3V0YDogYCdOQ0hXJ2BcbiAgICogLSBgZGF0YVR5cGVgOiBgJ2Zsb2F0MzInYFxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIHRlbnNvciBvYmplY3RcbiAgICovXG4gIGZyb21JbWFnZShcbiAgICBpbWFnZUVsZW1lbnQ6IEhUTUxJbWFnZUVsZW1lbnQsXG4gICAgb3B0aW9ucz86IFRlbnNvckZyb21JbWFnZUVsZW1lbnRPcHRpb25zLFxuICApOiBQcm9taXNlPFR5cGVkVGVuc29yPCdmbG9hdDMyJz4gfCBUeXBlZFRlbnNvcjwndWludDgnPj47XG5cbiAgLyoqXG4gICAqIGNyZWF0ZSBhIHRlbnNvciBmcm9tIFVSTFxuICAgKlxuICAgKiBAcGFyYW0gdXJsU291cmNlIC0gYSBzdHJpbmcgYXMgYSBVUkwgdG8gdGhlIGltYWdlIG9yIGEgZGF0YSBVUkwgY29udGFpbmluZyB0aGUgaW1hZ2UgZGF0YS5cbiAgICogQHBhcmFtIG9wdGlvbnMgLSBBbiBvcHRpb25hbCBvYmplY3QgcmVwcmVzZW50aW5nIG9wdGlvbnMgZm9yIGNyZWF0aW5nIHRlbnNvciBmcm9tIFVSTC5cbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBkZWZhdWx0IHNldHRpbmdzIHdpbGwgYmUgYXBwbGllZDpcbiAgICogLSBgdGVuc29yRm9ybWF0YDogYCdSR0InYFxuICAgKiAtIGB0ZW5zb3JMYXlvdXRgOiBgJ05DSFcnYFxuICAgKiAtIGBkYXRhVHlwZWA6IGAnZmxvYXQzMidgXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgdGVuc29yIG9iamVjdFxuICAgKi9cbiAgZnJvbUltYWdlKHVybFNvdXJjZTogc3RyaW5nLCBvcHRpb25zPzogVGVuc29yRnJvbVVybE9wdGlvbnMpOiBQcm9taXNlPFR5cGVkVGVuc29yPCdmbG9hdDMyJz4gfCBUeXBlZFRlbnNvcjwndWludDgnPj47XG5cbiAgLyoqXG4gICAqIGNyZWF0ZSBhIHRlbnNvciBmcm9tIGFuIEltYWdlQml0bWFwIG9iamVjdFxuICAgKlxuICAgKiBAcGFyYW0gYml0bWFwIC0gdGhlIEltYWdlQml0bWFwIG9iamVjdCB0byBjcmVhdGUgdGVuc29yIGZyb21cbiAgICogQHBhcmFtIG9wdGlvbnMgLSBBbiBvcHRpb25hbCBvYmplY3QgcmVwcmVzZW50aW5nIG9wdGlvbnMgZm9yIGNyZWF0aW5nIHRlbnNvciBmcm9tIFVSTC5cbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBkZWZhdWx0IHNldHRpbmdzIHdpbGwgYmUgYXBwbGllZDpcbiAgICogLSBgdGVuc29yRm9ybWF0YDogYCdSR0InYFxuICAgKiAtIGB0ZW5zb3JMYXlvdXRgOiBgJ05DSFcnYFxuICAgKiAtIGBkYXRhVHlwZWA6IGAnZmxvYXQzMidgXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgdGVuc29yIG9iamVjdFxuICAgKi9cbiAgZnJvbUltYWdlKFxuICAgIGJpdG1hcDogSW1hZ2VCaXRtYXAsXG4gICAgb3B0aW9uczogVGVuc29yRnJvbUltYWdlQml0bWFwT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxUeXBlZFRlbnNvcjwnZmxvYXQzMic+IHwgVHlwZWRUZW5zb3I8J3VpbnQ4Jz4+O1xuXG4gIC8qKlxuICAgKiBjcmVhdGUgYSB0ZW5zb3IgZnJvbSBhIFdlYkdMIHRleHR1cmVcbiAgICpcbiAgICogQHBhcmFtIHRleHR1cmUgLSB0aGUgV2ViR0xUZXh0dXJlIG9iamVjdCB0byBjcmVhdGUgdGVuc29yIGZyb21cbiAgICogQHBhcmFtIG9wdGlvbnMgLSBBbiBvcHRpb25hbCBvYmplY3QgcmVwcmVzZW50aW5nIG9wdGlvbnMgZm9yIGNyZWF0aW5nIHRlbnNvciBmcm9tIFdlYkdMIHRleHR1cmUuXG4gICAqXG4gICAqIFRoZSBvcHRpb25zIGluY2x1ZGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gICAqIC0gYHdpZHRoYDogdGhlIHdpZHRoIG9mIHRoZSB0ZXh0dXJlLiBSZXF1aXJlZC5cbiAgICogLSBgaGVpZ2h0YDogdGhlIGhlaWdodCBvZiB0aGUgdGV4dHVyZS4gUmVxdWlyZWQuXG4gICAqIC0gYGZvcm1hdGA6IHRoZSBmb3JtYXQgb2YgdGhlIHRleHR1cmUuIElmIG9taXR0ZWQsIGFzc3VtZSAnUkdCQScuXG4gICAqIC0gYGRvd25sb2FkYDogYW4gb3B0aW9uYWwgZnVuY3Rpb24gdG8gZG93bmxvYWQgdGhlIHRlbnNvciBkYXRhIGZyb20gR1BVIHRvIENQVS4gSWYgb21pdHRlZCwgdGhlIEdQVSBkYXRhXG4gICAqIHdpbGwgbm90IGJlIGFibGUgdG8gZG93bmxvYWQuIFVzdWFsbHksIHRoaXMgaXMgcHJvdmlkZWQgYnkgYSBHUFUgYmFja2VuZCBmb3IgdGhlIGluZmVyZW5jZSBvdXRwdXRzLiBVc2VycyBkb24ndFxuICAgKiBuZWVkIHRvIHByb3ZpZGUgdGhpcyBmdW5jdGlvbi5cbiAgICogLSBgZGlzcG9zZWA6IGFuIG9wdGlvbmFsIGZ1bmN0aW9uIHRvIGRpc3Bvc2UgdGhlIHRlbnNvciBkYXRhIG9uIEdQVS4gSWYgb21pdHRlZCwgdGhlIEdQVSBkYXRhIHdpbGwgbm90IGJlIGRpc3Bvc2VkLlxuICAgKiBVc3VhbGx5LCB0aGlzIGlzIHByb3ZpZGVkIGJ5IGEgR1BVIGJhY2tlbmQgZm9yIHRoZSBpbmZlcmVuY2Ugb3V0cHV0cy4gVXNlcnMgZG9uJ3QgbmVlZCB0byBwcm92aWRlIHRoaXMgZnVuY3Rpb24uXG4gICAqXG4gICAqIEByZXR1cm5zIGEgdGVuc29yIG9iamVjdFxuICAgKi9cbiAgZnJvbVRleHR1cmU8VCBleHRlbmRzIFRlbnNvci5UZXh0dXJlRGF0YVR5cGVzID0gJ2Zsb2F0MzInPihcbiAgICB0ZXh0dXJlOiBUZW5zb3IuVGV4dHVyZVR5cGUsXG4gICAgb3B0aW9uczogVGVuc29yRnJvbVRleHR1cmVPcHRpb25zPFQ+LFxuICApOiBUeXBlZFRlbnNvcjwnZmxvYXQzMic+O1xuXG4gIC8qKlxuICAgKiBjcmVhdGUgYSB0ZW5zb3IgZnJvbSBhIFdlYkdQVSBidWZmZXJcbiAgICpcbiAgICogQHBhcmFtIGJ1ZmZlciAtIHRoZSBHUFVCdWZmZXIgb2JqZWN0IHRvIGNyZWF0ZSB0ZW5zb3IgZnJvbVxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIEFuIG9wdGlvbmFsIG9iamVjdCByZXByZXNlbnRpbmcgb3B0aW9ucyBmb3IgY3JlYXRpbmcgdGVuc29yIGZyb20gV2ViR1BVIGJ1ZmZlci5cbiAgICpcbiAgICogVGhlIG9wdGlvbnMgaW5jbHVkZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAgICogLSBgZGF0YVR5cGVgOiB0aGUgZGF0YSB0eXBlIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGFzc3VtZSAnZmxvYXQzMicuXG4gICAqIC0gYGRpbXNgOiB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIFJlcXVpcmVkLlxuICAgKiAtIGBkb3dubG9hZGA6IGFuIG9wdGlvbmFsIGZ1bmN0aW9uIHRvIGRvd25sb2FkIHRoZSB0ZW5zb3IgZGF0YSBmcm9tIEdQVSB0byBDUFUuIElmIG9taXR0ZWQsIHRoZSBHUFUgZGF0YVxuICAgKiB3aWxsIG5vdCBiZSBhYmxlIHRvIGRvd25sb2FkLiBVc3VhbGx5LCB0aGlzIGlzIHByb3ZpZGVkIGJ5IGEgR1BVIGJhY2tlbmQgZm9yIHRoZSBpbmZlcmVuY2Ugb3V0cHV0cy4gVXNlcnMgZG9uJ3RcbiAgICogbmVlZCB0byBwcm92aWRlIHRoaXMgZnVuY3Rpb24uXG4gICAqIC0gYGRpc3Bvc2VgOiBhbiBvcHRpb25hbCBmdW5jdGlvbiB0byBkaXNwb3NlIHRoZSB0ZW5zb3IgZGF0YSBvbiBHUFUuIElmIG9taXR0ZWQsIHRoZSBHUFUgZGF0YSB3aWxsIG5vdCBiZSBkaXNwb3NlZC5cbiAgICogVXN1YWxseSwgdGhpcyBpcyBwcm92aWRlZCBieSBhIEdQVSBiYWNrZW5kIGZvciB0aGUgaW5mZXJlbmNlIG91dHB1dHMuIFVzZXJzIGRvbid0IG5lZWQgdG8gcHJvdmlkZSB0aGlzIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJucyBhIHRlbnNvciBvYmplY3RcbiAgICovXG4gIGZyb21HcHVCdWZmZXI8VCBleHRlbmRzIFRlbnNvci5HcHVCdWZmZXJEYXRhVHlwZXM+KFxuICAgIGJ1ZmZlcjogVGVuc29yLkdwdUJ1ZmZlclR5cGUsXG4gICAgb3B0aW9uczogVGVuc29yRnJvbUdwdUJ1ZmZlck9wdGlvbnM8VD4sXG4gICk6IFR5cGVkVGVuc29yPFQ+O1xuXG4gIC8qKlxuICAgKiBjcmVhdGUgYSB0ZW5zb3IgZnJvbSBhIFdlYk5OIE1MVGVuc29yXG4gICAqXG4gICAqIEBwYXJhbSB0ZW5zb3IgLSB0aGUgTUxUZW5zb3Igb2JqZWN0IHRvIGNyZWF0ZSB0ZW5zb3IgZnJvbVxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIEFuIG9wdGlvbmFsIG9iamVjdCByZXByZXNlbnRpbmcgb3B0aW9ucyBmb3IgY3JlYXRpbmcgdGVuc29yIGZyb20gYSBXZWJOTiBNTFRlbnNvci5cbiAgICpcbiAgICogVGhlIG9wdGlvbnMgaW5jbHVkZSBmb2xsb3dpbmcgcHJvcGVydGllczpcbiAgICogLSBgZGF0YVR5cGVgOiB0aGUgZGF0YSB0eXBlIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGFzc3VtZSAnZmxvYXQzMicuXG4gICAqIC0gYGRpbXNgOiB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIFJlcXVpcmVkLlxuICAgKiAtIGBkb3dubG9hZGA6IGFuIG9wdGlvbmFsIGZ1bmN0aW9uIHRvIGRvd25sb2FkIHRoZSB0ZW5zb3IgZGF0YSBmcm9tIHRoZSBNTFRlbnNvciB0byBDUFUuIElmIG9taXR0ZWQsIHRoZSBNTFRlbnNvclxuICAgKiBkYXRhIHdpbGwgbm90IGJlIGFibGUgdG8gZG93bmxvYWQuIFVzdWFsbHksIHRoaXMgaXMgcHJvdmlkZWQgYnkgdGhlIFdlYk5OIGJhY2tlbmQgZm9yIHRoZSBpbmZlcmVuY2Ugb3V0cHV0cy5cbiAgICogVXNlcnMgZG9uJ3QgbmVlZCB0byBwcm92aWRlIHRoaXMgZnVuY3Rpb24uXG4gICAqIC0gYGRpc3Bvc2VgOiBhbiBvcHRpb25hbCBmdW5jdGlvbiB0byBkaXNwb3NlIHRoZSB0ZW5zb3IgZGF0YSBvbiB0aGUgV2ViTk4gTUxUZW5zb3IuIElmIG9taXR0ZWQsIHRoZSBNTFRlbnNvciB3aWxsXG4gICAqIG5vdCBiZSBkaXNwb3NlZC4gVXN1YWxseSwgdGhpcyBpcyBwcm92aWRlZCBieSB0aGUgV2ViTk4gYmFja2VuZCBmb3IgdGhlIGluZmVyZW5jZSBvdXRwdXRzLiBVc2VycyBkb24ndCBuZWVkIHRvXG4gICAqIHByb3ZpZGUgdGhpcyBmdW5jdGlvbi5cbiAgICpcbiAgICogQHJldHVybnMgYSB0ZW5zb3Igb2JqZWN0XG4gICAqL1xuICBmcm9tTUxUZW5zb3I8VCBleHRlbmRzIFRlbnNvci5NTFRlbnNvckRhdGFUeXBlcz4oXG4gICAgdGVuc29yOiBUZW5zb3IuTUxUZW5zb3JUeXBlLFxuICAgIG9wdGlvbnM6IFRlbnNvckZyb21NTFRlbnNvck9wdGlvbnM8VD4sXG4gICk6IFR5cGVkVGVuc29yPFQ+O1xuXG4gIC8qKlxuICAgKiBjcmVhdGUgYSB0ZW5zb3IgZnJvbSBhIHByZS1hbGxvY2F0ZWQgYnVmZmVyLiBUaGUgYnVmZmVyIHdpbGwgYmUgdXNlZCBhcyBhIHBpbm5lZCBidWZmZXIuXG4gICAqXG4gICAqIEBwYXJhbSB0eXBlIC0gdGhlIHRlbnNvciBlbGVtZW50IHR5cGUuXG4gICAqIEBwYXJhbSBidWZmZXIgLSBhIFR5cGVkQXJyYXkgY29ycmVzcG9uZGluZyB0byB0aGUgdHlwZS5cbiAgICogQHBhcmFtIGRpbXMgLSBzcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqXG4gICAqIEByZXR1cm5zIGEgdGVuc29yIG9iamVjdFxuICAgKi9cbiAgZnJvbVBpbm5lZEJ1ZmZlcjxUIGV4dGVuZHMgRXhjbHVkZTxUZW5zb3IuVHlwZSwgJ3N0cmluZyc+PihcbiAgICB0eXBlOiBULFxuICAgIGJ1ZmZlcjogVGVuc29yLkRhdGFUeXBlTWFwW1RdLFxuICAgIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSxcbiAgKTogVHlwZWRUZW5zb3I8VD47XG59XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbi8qKlxuICogQSBzdHJpbmcgdGhhdCByZXByZXNlbnRzIGEgZmlsZSdzIFVSTCBvciBwYXRoLlxuICpcbiAqIFBhdGggaXMgdmFpbGFibGUgb25seSBpbiBvbm54cnVudGltZS1ub2RlIG9yIG9ubnhydW50aW1lLXdlYiBydW5uaW5nIGluIE5vZGUuanMuXG4gKi9cbmV4cG9ydCB0eXBlIEZpbGVVcmxPclBhdGggPSBzdHJpbmc7XG5cbi8qKlxuICogQSBCbG9iIG9iamVjdCB0aGF0IHJlcHJlc2VudHMgYSBmaWxlLlxuICovXG5leHBvcnQgdHlwZSBGaWxlQmxvYiA9IEJsb2I7XG5cbi8qKlxuICogQSBVaW50OEFycmF5LCBBcnJheUJ1ZmZlciBvciBTaGFyZWRBcnJheUJ1ZmZlciBvYmplY3QgdGhhdCByZXByZXNlbnRzIGEgZmlsZSBjb250ZW50LlxuICpcbiAqIFdoZW4gaXQgaXMgYW4gQXJyYXlCdWZmZXIgb3IgU2hhcmVkQXJyYXlCdWZmZXIsIHRoZSB3aG9sZSBidWZmZXIgaXMgYXNzdW1lZCB0byBiZSB0aGUgZmlsZSBjb250ZW50LlxuICovXG5leHBvcnQgdHlwZSBGaWxlRGF0YSA9IFVpbnQ4QXJyYXkgfCBBcnJheUJ1ZmZlckxpa2U7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhIGZpbGUgdGhhdCBjYW4gYmUgbG9hZGVkIGJ5IHRoZSBPTk5YIFJ1bnRpbWUgSmF2YVNjcmlwdCBBUEkuXG4gKi9cbmV4cG9ydCB0eXBlIEZpbGVUeXBlID0gRmlsZVVybE9yUGF0aCB8IEZpbGVCbG9iIHwgRmlsZURhdGE7XG5cbi8qKlxuICogUmVwcmVzZW50cyBhbiBleHRlcm5hbCBkYXRhIGZpbGUuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgRXh0ZXJuYWxEYXRhRmlsZURlc2NyaXB0aW9uIHtcbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIGV4dGVybmFsIGRhdGEgZmlsZS5cbiAgICovXG4gIGRhdGE6IEZpbGVUeXBlO1xuICAvKipcbiAgICogU3BlY2lmeSB0aGUgZmlsZSBwYXRoLlxuICAgKi9cbiAgcGF0aDogc3RyaW5nO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gZXh0ZXJuYWwgZGF0YSBmaWxlLlxuICpcbiAqIFdoZW4gdXNpbmcgYSBzdHJpbmcsIGl0IHNob3VsZCBiZSBhIGZpbGUgVVJMIG9yIHBhdGggdGhhdCBpbiB0aGUgc2FtZSBkaXJlY3RvcnkgYXMgdGhlIG1vZGVsIGZpbGUuXG4gKi9cbmV4cG9ydCB0eXBlIEV4dGVybmFsRGF0YUZpbGVUeXBlID0gRXh0ZXJuYWxEYXRhRmlsZURlc2NyaXB0aW9uIHwgRmlsZVVybE9yUGF0aDtcblxuLyoqXG4gKiBPcHRpb25zIGZvciBtb2RlbCBsb2FkaW5nLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIE9ubnhNb2RlbE9wdGlvbnMge1xuICAvKipcbiAgICogU3BlY2lmeWluZyBhIGxpc3Qgb2YgZmlsZXMgdGhhdCByZXByZXNlbnRzIHRoZSBleHRlcm5hbCBkYXRhLlxuICAgKi9cbiAgZXh0ZXJuYWxEYXRhPzogcmVhZG9ubHkgRXh0ZXJuYWxEYXRhRmlsZVR5cGVbXTtcbn1cbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHsgVGVuc29yIH0gZnJvbSAnLi90ZW5zb3IuanMnO1xuXG5leHBvcnQgdHlwZSBOb25UZW5zb3JUeXBlID0gbmV2ZXI7XG5cbi8qKlxuICogVHlwZSBPbm54VmFsdWUgUmVwcmVzZW50cyBib3RoIHRlbnNvcnMgYW5kIG5vbi10ZW5zb3JzIHZhbHVlIGZvciBtb2RlbCdzIGlucHV0cy9vdXRwdXRzLlxuICpcbiAqIE5PVEU6IGN1cnJlbnRseSBub3Qgc3VwcG9ydCBub24tdGVuc29yXG4gKi9cbmV4cG9ydCB0eXBlIE9ubnhWYWx1ZSA9IFRlbnNvciB8IE5vblRlbnNvclR5cGU7XG5cbi8qKlxuICogVHlwZSBPbm54VmFsdWVEYXRhTG9jYXRpb24gcmVwcmVzZW50cyB0aGUgbG9jYXRpb24gb2YgdGhlIGRhdGEgb2YgYW4gT25ueFZhbHVlLlxuICovXG5leHBvcnQgdHlwZSBPbm54VmFsdWVEYXRhTG9jYXRpb24gPSBUZW5zb3IuRGF0YUxvY2F0aW9uO1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG4vKipcbiAqICMgT05OWCBSdW50aW1lIEphdmFTY3JpcHQgQVBJXG4gKlxuICogT05OWCBSdW50aW1lIEphdmFTY3JpcHQgQVBJIGlzIGEgdW5pZmllZCBBUEkgZm9yIGFsbCBKYXZhU2NyaXB0IHVzYWdlcywgaW5jbHVkaW5nIHRoZSBmb2xsb3dpbmcgTlBNIHBhY2thZ2VzOlxuICpcbiAqIC0gW29ubnhydW50aW1lLW5vZGVdKGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL29ubnhydW50aW1lLW5vZGUpXG4gKiAtIFtvbm54cnVudGltZS13ZWJdKGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL29ubnhydW50aW1lLXdlYilcbiAqIC0gW29ubnhydW50aW1lLXJlYWN0LW5hdGl2ZV0oaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2Uvb25ueHJ1bnRpbWUtcmVhY3QtbmF0aXZlKVxuICpcbiAqIFNlZSBhbHNvOlxuICogLSBbR2V0IFN0YXJ0ZWRdKGh0dHBzOi8vb25ueHJ1bnRpbWUuYWkvZG9jcy9nZXQtc3RhcnRlZC93aXRoLWphdmFzY3JpcHQvKVxuICogLSBbSW5mZXJlbmNlIGV4YW1wbGVzXShodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L29ubnhydW50aW1lLWluZmVyZW5jZS1leGFtcGxlcy90cmVlL21haW4vanMpXG4gKlxuICogQHBhY2thZ2VEb2N1bWVudGF0aW9uXG4gKi9cblxuZXhwb3J0ICogZnJvbSAnLi9iYWNrZW5kLmpzJztcbmV4cG9ydCAqIGZyb20gJy4vZW52LmpzJztcbmV4cG9ydCAqIGZyb20gJy4vaW5mZXJlbmNlLXNlc3Npb24uanMnO1xuZXhwb3J0ICogZnJvbSAnLi90ZW5zb3IuanMnO1xuZXhwb3J0ICogZnJvbSAnLi90ZW5zb3ItY29udmVyc2lvbi5qcyc7XG5leHBvcnQgKiBmcm9tICcuL3RlbnNvci1mYWN0b3J5LmpzJztcbmV4cG9ydCAqIGZyb20gJy4vdHJhY2UuanMnO1xuZXhwb3J0ICogZnJvbSAnLi9vbm54LW1vZGVsLmpzJztcbmV4cG9ydCAqIGZyb20gJy4vb25ueC12YWx1ZS5qcyc7XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmV4cG9ydCBjb25zdCBpc05vZGUgPSAhISh0eXBlb2YgcHJvY2VzcyAhPT0gJ3VuZGVmaW5lZCcgJiYgcHJvY2Vzcy52ZXJzaW9ucyAmJiBwcm9jZXNzLnZlcnNpb25zLm5vZGUpO1xuIiwgInZhciByLGU9KHI9aW1wb3J0Lm1ldGEudXJsLGFzeW5jIGZ1bmN0aW9uKGU9e30pe3ZhciB0LG4sYT1lLG89bmV3IFByb21pc2UoKChyLGUpPT57dD1yLG49ZX0pKSxpPVwib2JqZWN0XCI9PXR5cGVvZiB3aW5kb3csdT1cInVuZGVmaW5lZFwiIT10eXBlb2YgV29ya2VyR2xvYmFsU2NvcGUscz11JiZzZWxmLm5hbWU/LnN0YXJ0c1dpdGgoXCJlbS1wdGhyZWFkXCIpO2EubW91bnRFeHRlcm5hbERhdGE9KHIsZSk9PntyLnN0YXJ0c1dpdGgoXCIuL1wiKSYmKHI9ci5zdWJzdHJpbmcoMikpLChhLkZifHwoYS5GYj1uZXcgTWFwKSkuc2V0KHIsZSl9LGEudW5tb3VudEV4dGVybmFsRGF0YT0oKT0+e2RlbGV0ZSBhLkZifTt2YXIgZj1nbG9iYWxUaGlzLlNoYXJlZEFycmF5QnVmZmVyPz9uZXcgV2ViQXNzZW1ibHkuTWVtb3J5KHtpbml0aWFsOjAsbWF4aW11bTowLHFjOiEwfSkuYnVmZmVyLmNvbnN0cnVjdG9yO2NvbnN0IGI9cj0+YXN5bmMoLi4uZSk9Pnt0cnl7aWYoYS5HYil0aHJvdyBFcnJvcihcIlNlc3Npb24gYWxyZWFkeSBzdGFydGVkXCIpO2NvbnN0IHQ9YS5HYj17ZWM6ZVswXSxlcnJvcnM6W119LG49YXdhaXQgciguLi5lKTtpZihhLkdiIT09dCl0aHJvdyBFcnJvcihcIlNlc3Npb24gbWlzbWF0Y2hcIik7YS5LYj8uZmx1c2goKTtjb25zdCBvPXQuZXJyb3JzO2lmKDA8by5sZW5ndGgpe2xldCByPWF3YWl0IFByb21pc2UuYWxsKG8pO2lmKHI9ci5maWx0ZXIoKHI9PnIpKSwwPHIubGVuZ3RoKXRocm93IEVycm9yKHIuam9pbihcIlxcblwiKSl9cmV0dXJuIG59ZmluYWxseXthLkdiPW51bGx9fTthLmpzZXBJbml0PShyLGUpPT57aWYoXCJ3ZWJncHVcIj09PXIpe1thLktiLGEuVmIsYS5aYixhLkxiLGEuWWIsYS5rYixhLiRiLGEuYmMsYS5XYixhLlhiLGEuYWNdPWU7Y29uc3Qgcj1hLktiO2EuanNlcFJlZ2lzdGVyQnVmZmVyPShlLHQsbixhKT0+ci5yZWdpc3RlckJ1ZmZlcihlLHQsbixhKSxhLmpzZXBHZXRCdWZmZXI9ZT0+ci5nZXRCdWZmZXIoZSksYS5qc2VwQ3JlYXRlRG93bmxvYWRlcj0oZSx0LG4pPT5yLmNyZWF0ZURvd25sb2FkZXIoZSx0LG4pLGEuanNlcE9uQ3JlYXRlU2Vzc2lvbj1lPT57ci5vbkNyZWF0ZVNlc3Npb24oZSl9LGEuanNlcE9uUmVsZWFzZVNlc3Npb249ZT0+e3Iub25SZWxlYXNlU2Vzc2lvbihlKX0sYS5qc2VwT25SdW5TdGFydD1lPT5yLm9uUnVuU3RhcnQoZSksYS5jYz0oZSx0KT0+e3IudXBsb2FkKGUsdCl9fWVsc2UgaWYoXCJ3ZWJublwiPT09cil7Y29uc3Qgcj1lWzBdO1thLm9jLGEuT2IsYS53ZWJubkVuc3VyZVRlbnNvcixhLlBiLGEud2Vibm5Eb3dubG9hZFRlbnNvcl09ZS5zbGljZSgxKSxhLndlYm5uUmVsZWFzZVRlbnNvcklkPWEuT2IsYS53ZWJublVwbG9hZFRlbnNvcj1hLlBiLGEud2Vibm5PblJ1blN0YXJ0PWU9PnIub25SdW5TdGFydChlKSxhLndlYm5uT25SdW5FbmQ9ci5vblJ1bkVuZC5iaW5kKHIpLGEud2Vibm5SZWdpc3Rlck1MQ29udGV4dD0oZSx0KT0+e3IucmVnaXN0ZXJNTENvbnRleHQoZSx0KX0sYS53ZWJubk9uUmVsZWFzZVNlc3Npb249ZT0+e3Iub25SZWxlYXNlU2Vzc2lvbihlKX0sYS53ZWJubkNyZWF0ZU1MVGVuc29yRG93bmxvYWRlcj0oZSx0KT0+ci5jcmVhdGVNTFRlbnNvckRvd25sb2FkZXIoZSx0KSxhLndlYm5uUmVnaXN0ZXJNTFRlbnNvcj0oZSx0LG4sYSk9PnIucmVnaXN0ZXJNTFRlbnNvcihlLHQsbixhKSxhLndlYm5uQ3JlYXRlTUxDb250ZXh0PWU9PnIuY3JlYXRlTUxDb250ZXh0KGUpLGEud2Vibm5SZWdpc3Rlck1MQ29uc3RhbnQ9KGUsdCxuLG8saSx1KT0+ci5yZWdpc3Rlck1MQ29uc3RhbnQoZSx0LG4sbyxpLGEuRmIsdSksYS53ZWJublJlZ2lzdGVyR3JhcGhJbnB1dD1yLnJlZ2lzdGVyR3JhcGhJbnB1dC5iaW5kKHIpLGEud2Vibm5Jc0dyYXBoSW5wdXQ9ci5pc0dyYXBoSW5wdXQuYmluZChyKSxhLndlYm5uUmVnaXN0ZXJHcmFwaE91dHB1dD1yLnJlZ2lzdGVyR3JhcGhPdXRwdXQuYmluZChyKSxhLndlYm5uSXNHcmFwaE91dHB1dD1yLmlzR3JhcGhPdXRwdXQuYmluZChyKSxhLndlYm5uQ3JlYXRlVGVtcG9yYXJ5VGVuc29yPXIuY3JlYXRlVGVtcG9yYXJ5VGVuc29yLmJpbmQociksYS53ZWJubklzR3JhcGhJbnB1dE91dHB1dFR5cGVTdXBwb3J0ZWQ9ci5pc0dyYXBoSW5wdXRPdXRwdXRUeXBlU3VwcG9ydGVkLmJpbmQocil9fTtsZXQgbT0oKT0+e2NvbnN0IHI9KHIsZSx0KT0+KC4uLm4pPT57Y29uc3QgYT1MZSxvPWU/LigpO249ciguLi5uKTtjb25zdCBpPWU/LigpO3JldHVybiBvIT09aSYmKHI9aSx0KG8pLGU9dD1udWxsKSxMZSE9YT9uZXcgUHJvbWlzZSgoKHIsZSk9PntxZT17cmVzb2x2ZTpyLHJlamVjdDplfX0pKTpufTsoKCk9Pntmb3IoY29uc3QgZSBvZltcIl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlclwiLFwiX09ydENyZWF0ZVNlc3Npb25cIixcIl9PcnRSdW5cIixcIl9PcnRSdW5XaXRoQmluZGluZ1wiLFwiX09ydEJpbmRJbnB1dFwiXSlhW2VdPXIoYVtlXSwoKCk9PmFbZV0pLChyPT5hW2VdPXIpKX0pKCksdm9pZCAwIT09YiYmKGEuX09ydFJ1bj1iKGEuX09ydFJ1biksYS5fT3J0UnVuV2l0aEJpbmRpbmc9YihhLl9PcnRSdW5XaXRoQmluZGluZykpLG09dm9pZCAwfTthLmFzeW5jSW5pdD0oKT0+e20/LigpfTt2YXIgbCxjLGQ9T2JqZWN0LmFzc2lnbih7fSxhKSxwPShyLGUpPT57dGhyb3cgZX0seT1cIlwiOyhpfHx1KSYmKHU/eT1zZWxmLmxvY2F0aW9uLmhyZWY6XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGRvY3VtZW50JiZkb2N1bWVudC5jdXJyZW50U2NyaXB0JiYoeT1kb2N1bWVudC5jdXJyZW50U2NyaXB0LnNyYyksciYmKHk9cikseT15LnN0YXJ0c1dpdGgoXCJibG9iOlwiKT9cIlwiOnkuc2xpY2UoMCx5LnJlcGxhY2UoL1s/I10uKi8sXCJcIikubGFzdEluZGV4T2YoXCIvXCIpKzEpLHUmJihjPXI9Pnt2YXIgZT1uZXcgWE1MSHR0cFJlcXVlc3Q7cmV0dXJuIGUub3BlbihcIkdFVFwiLHIsITEpLGUucmVzcG9uc2VUeXBlPVwiYXJyYXlidWZmZXJcIixlLnNlbmQobnVsbCksbmV3IFVpbnQ4QXJyYXkoZS5yZXNwb25zZSl9KSxsPWFzeW5jIHI9PntpZihQKHIpKXJldHVybiBuZXcgUHJvbWlzZSgoKGUsdCk9Pnt2YXIgbj1uZXcgWE1MSHR0cFJlcXVlc3Q7bi5vcGVuKFwiR0VUXCIsciwhMCksbi5yZXNwb25zZVR5cGU9XCJhcnJheWJ1ZmZlclwiLG4ub25sb2FkPSgpPT57MjAwPT1uLnN0YXR1c3x8MD09bi5zdGF0dXMmJm4ucmVzcG9uc2U/ZShuLnJlc3BvbnNlKTp0KG4uc3RhdHVzKX0sbi5vbmVycm9yPXQsbi5zZW5kKG51bGwpfSkpO3ZhciBlPWF3YWl0IGZldGNoKHIse2NyZWRlbnRpYWxzOlwic2FtZS1vcmlnaW5cIn0pO2lmKGUub2spcmV0dXJuIGUuYXJyYXlCdWZmZXIoKTt0aHJvdyBFcnJvcihlLnN0YXR1cytcIiA6IFwiK2UudXJsKX0pO3ZhciBoPWNvbnNvbGUubG9nLmJpbmQoY29uc29sZSksdj1jb25zb2xlLmVycm9yLmJpbmQoY29uc29sZSksZz1oLE49djtPYmplY3QuYXNzaWduKGEsZCksZD1udWxsO3ZhciBrLHcsQSxDLF8sTyxULFcsUyxFLHgsUixNLEg9YS53YXNtQmluYXJ5LEQ9ITEsUD1yPT5yLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpO2Z1bmN0aW9uIEYoKXtyZXR1cm4gay5idWZmZXIhPUMuYnVmZmVyJiZxKCksQ31mdW5jdGlvbiBCKCl7cmV0dXJuIGsuYnVmZmVyIT1DLmJ1ZmZlciYmcSgpLF99ZnVuY3Rpb24gSSgpe3JldHVybiBrLmJ1ZmZlciE9Qy5idWZmZXImJnEoKSxPfWZ1bmN0aW9uIEcoKXtyZXR1cm4gay5idWZmZXIhPUMuYnVmZmVyJiZxKCksVH1mdW5jdGlvbiBMKCl7cmV0dXJuIGsuYnVmZmVyIT1DLmJ1ZmZlciYmcSgpLFd9ZnVuY3Rpb24gVSgpe3JldHVybiBrLmJ1ZmZlciE9Qy5idWZmZXImJnEoKSxTfWZ1bmN0aW9uICQoKXtyZXR1cm4gay5idWZmZXIhPUMuYnVmZmVyJiZxKCksRX1mdW5jdGlvbiBqKCl7cmV0dXJuIGsuYnVmZmVyIT1DLmJ1ZmZlciYmcSgpLE19aWYocyl7dmFyIHosVj0hMTtmdW5jdGlvbiBSbihyKXt0cnl7dmFyIGU9ci5kYXRhLHQ9ZS5DYjtpZihcImxvYWRcIj09PXQpe2xldCByPVtdO3NlbGYub25tZXNzYWdlPWU9PnIucHVzaChlKSxzZWxmLnN0YXJ0V29ya2VyPSgpPT57cG9zdE1lc3NhZ2Uoe0NiOlwibG9hZGVkXCJ9KTtmb3IobGV0IGUgb2YgcilSbihlKTtzZWxmLm9ubWVzc2FnZT1Sbn07Zm9yKGNvbnN0IHIgb2YgZS5TYilhW3JdJiYhYVtyXS5wcm94eXx8KGFbcl09KC4uLmUpPT57cG9zdE1lc3NhZ2Uoe0NiOlwiY2FsbEhhbmRsZXJcIixSYjpyLGFyZ3M6ZX0pfSxcInByaW50XCI9PXImJihnPWFbcl0pLFwicHJpbnRFcnJcIj09ciYmKE49YVtyXSkpO2s9ZS5sYyxxKCkseihlLm1jKX1lbHNlIGlmKFwicnVuXCI9PT10KXtrcihlLkJiKSx5bihlLkJiLDAsMCwxLDAsMCksdnIoKSxUZShlLkJiKSxWfHwobG4oKSxWPSEwKTt0cnl7d3IoZS5oYyxlLkliKX1jYXRjaChyKXtpZihcInVud2luZFwiIT1yKXRocm93IHJ9fWVsc2VcInNldGltbWVkaWF0ZVwiIT09ZS50YXJnZXQmJihcImNoZWNrTWFpbGJveFwiPT09dD9WJiZXZSgpOnQmJihOKGB3b3JrZXI6IHJlY2VpdmVkIHVua25vd24gY29tbWFuZCAke3R9YCksTihlKSkpfWNhdGNoKHIpe3Rocm93IGhuKCkscn19Tj1mdW5jdGlvbiguLi5yKXtyPXIuam9pbihcIiBcIiksY29uc29sZS5lcnJvcihyKX0sc2VsZi5hbGVydD1mdW5jdGlvbiguLi5yKXtwb3N0TWVzc2FnZSh7Q2I6XCJhbGVydFwiLHRleHQ6ci5qb2luKFwiIFwiKSxqYzpjbigpfSl9LHNlbGYub251bmhhbmRsZWRyZWplY3Rpb249cj0+e3Rocm93IHIucmVhc29ufHxyfSxzZWxmLm9ubWVzc2FnZT1Sbn1mdW5jdGlvbiBxKCl7dmFyIHI9ay5idWZmZXI7YS5IRUFQOD1DPW5ldyBJbnQ4QXJyYXkociksYS5IRUFQMTY9Tz1uZXcgSW50MTZBcnJheShyKSxhLkhFQVBVOD1fPW5ldyBVaW50OEFycmF5KHIpLGEuSEVBUFUxNj1UPW5ldyBVaW50MTZBcnJheShyKSxhLkhFQVAzMj1XPW5ldyBJbnQzMkFycmF5KHIpLGEuSEVBUFUzMj1TPW5ldyBVaW50MzJBcnJheShyKSxhLkhFQVBGMzI9RT1uZXcgRmxvYXQzMkFycmF5KHIpLGEuSEVBUEY2ND1NPW5ldyBGbG9hdDY0QXJyYXkociksYS5IRUFQNjQ9eD1uZXcgQmlnSW50NjRBcnJheShyKSxhLkhFQVBVNjQ9Uj1uZXcgQmlnVWludDY0QXJyYXkocil9ZnVuY3Rpb24gWSgpe3M/c3RhcnRXb3JrZXIoYSk6Zm4uRGEoKX1zfHwoaz1uZXcgV2ViQXNzZW1ibHkuTWVtb3J5KHtpbml0aWFsOjI1NixtYXhpbXVtOjY1NTM2LHNoYXJlZDohMH0pLHEoKSk7dmFyIEosUT0wLFg9bnVsbDtmdW5jdGlvbiBLKCl7aWYoMD09LS1RJiZYKXt2YXIgcj1YO1g9bnVsbCxyKCl9fWZ1bmN0aW9uIFoocil7dGhyb3cgTihyPVwiQWJvcnRlZChcIityK1wiKVwiKSxEPSEwLHI9bmV3IFdlYkFzc2VtYmx5LlJ1bnRpbWVFcnJvcihyK1wiLiBCdWlsZCB3aXRoIC1zQVNTRVJUSU9OUyBmb3IgbW9yZSBpbmZvLlwiKSxuKHIpLHJ9ZnVuY3Rpb24gcnIoKXtyZXR1cm57YTp7TDpucixBYTp0cixiOkNyLCQ6T3IsQTpFcixwYTp4cixYOkhyLFo6RHIscWE6UHIsbmE6RnIsZ2E6QnIsbWE6SXIsSjpHcixZOkxyLFY6VXIsb2E6JHIsVzpqcix2YTpxcixFOnJlLFE6dGUsTzpiZSxEOmxlLHY6Y2UscjpkZSxQOnBlLHo6QWUsUjpDZSxqYTpfZSxUOlNlLGFhOnhlLE06UmUsRjpNZSxpYTpUZSxzYTpIZSx0OkZlLENhOkJlLHc6UWUsbzpLZSxtOmV0LGM6b2UsQmE6dHQsbjphdCxqOnN0LHU6ZnQscDpidCxmOm10LHM6bHQsbDpjdCxlOmR0LGs6cHQsaDp5dCxnOmh0LGQ6dnQsZGE6Z3QsZWE6QXQsZmE6Q3QsYmE6X3QsY2E6T3QsTjpTdCx4YTpFdCx1YTpNdCxpOlB0LEM6RnQsRzpCdCx0YTp4dCx4Okl0LHJhOkd0LFU6THQscTpXdCx5OlV0LEs6JHQsUzpqdCx6YTpZdCx5YTpKdCxrYTpadCxsYTpybixfOmxyLEI6ZW4sSTp0bixoYTpubixIOm9uLGE6ayx3YTpicn19fXZhciBlcj17ODQwMTU2OihyLGUsdCxuLG8pPT57aWYodm9pZCAwPT09YXx8IWEuRmIpcmV0dXJuIDE7aWYoKHI9U3IoTnVtYmVyKHI+Pj4wKSkpLnN0YXJ0c1dpdGgoXCIuL1wiKSYmKHI9ci5zdWJzdHJpbmcoMikpLCEocj1hLkZiLmdldChyKSkpcmV0dXJuIDI7aWYoZT1OdW1iZXIoZT4+PjApLHQ9TnVtYmVyKHQ+Pj4wKSxuPU51bWJlcihuPj4+MCksZSt0PnIuYnl0ZUxlbmd0aClyZXR1cm4gMzt0cnl7Y29uc3QgaT1yLnN1YmFycmF5KGUsZSt0KTtzd2l0Y2gobyl7Y2FzZSAwOkIoKS5zZXQoaSxuPj4+MCk7YnJlYWs7Y2FzZSAxOmEubmM/YS5uYyhuLGkpOmEuY2MobixpKTticmVhaztkZWZhdWx0OnJldHVybiA0fXJldHVybiAwfWNhdGNoe3JldHVybiA0fX0sODQwOTgwOihyLGUsdCk9PnthLlBiKHIsQigpLnN1YmFycmF5KGU+Pj4wLGUrdD4+PjApKX0sODQxMDQ0OigpPT5hLm9jKCksODQxMDg2OnI9PnthLk9iKHIpfSw4NDExMjM6KCk9PnthLldiKCl9LDg0MTE1NDooKT0+e2EuWGIoKX0sODQxMTgzOigpPT57YS5hYygpfSw4NDEyMDg6cj0+YS5WYihyKSw4NDEyNDE6cj0+YS5aYihyKSw4NDEyNzM6KHIsZSx0KT0+e2EuTGIoTnVtYmVyKHIpLE51bWJlcihlKSxOdW1iZXIodCksITApfSw4NDEzMzY6KHIsZSx0KT0+e2EuTGIoTnVtYmVyKHIpLE51bWJlcihlKSxOdW1iZXIodCkpfSw4NDEzOTM6KCk9PlwidW5kZWZpbmVkXCIhPXR5cGVvZiB3YXNtT2Zmc2V0Q29udmVydGVyLDg0MTQ1MDpyPT57YS5rYihcIkFic1wiLHIsdm9pZCAwKX0sODQxNTAxOnI9PnthLmtiKFwiTmVnXCIscix2b2lkIDApfSw4NDE1NTI6cj0+e2Eua2IoXCJGbG9vclwiLHIsdm9pZCAwKX0sODQxNjA1OnI9PnthLmtiKFwiQ2VpbFwiLHIsdm9pZCAwKX0sODQxNjU3OnI9PnthLmtiKFwiUmVjaXByb2NhbFwiLHIsdm9pZCAwKX0sODQxNzE1OnI9PnthLmtiKFwiU3FydFwiLHIsdm9pZCAwKX0sODQxNzY3OnI9PnthLmtiKFwiRXhwXCIscix2b2lkIDApfSw4NDE4MTg6cj0+e2Eua2IoXCJFcmZcIixyLHZvaWQgMCl9LDg0MTg2OTpyPT57YS5rYihcIlNpZ21vaWRcIixyLHZvaWQgMCl9LDg0MTkyNDoocixlLHQpPT57YS5rYihcIkhhcmRTaWdtb2lkXCIscix7YWxwaGE6ZSxiZXRhOnR9KX0sODQyMDAzOnI9PnthLmtiKFwiTG9nXCIscix2b2lkIDApfSw4NDIwNTQ6cj0+e2Eua2IoXCJTaW5cIixyLHZvaWQgMCl9LDg0MjEwNTpyPT57YS5rYihcIkNvc1wiLHIsdm9pZCAwKX0sODQyMTU2OnI9PnthLmtiKFwiVGFuXCIscix2b2lkIDApfSw4NDIyMDc6cj0+e2Eua2IoXCJBc2luXCIscix2b2lkIDApfSw4NDIyNTk6cj0+e2Eua2IoXCJBY29zXCIscix2b2lkIDApfSw4NDIzMTE6cj0+e2Eua2IoXCJBdGFuXCIscix2b2lkIDApfSw4NDIzNjM6cj0+e2Eua2IoXCJTaW5oXCIscix2b2lkIDApfSw4NDI0MTU6cj0+e2Eua2IoXCJDb3NoXCIscix2b2lkIDApfSw4NDI0Njc6cj0+e2Eua2IoXCJBc2luaFwiLHIsdm9pZCAwKX0sODQyNTIwOnI9PnthLmtiKFwiQWNvc2hcIixyLHZvaWQgMCl9LDg0MjU3MzpyPT57YS5rYihcIkF0YW5oXCIscix2b2lkIDApfSw4NDI2MjY6cj0+e2Eua2IoXCJUYW5oXCIscix2b2lkIDApfSw4NDI2Nzg6cj0+e2Eua2IoXCJOb3RcIixyLHZvaWQgMCl9LDg0MjcyOToocixlLHQpPT57YS5rYihcIkNsaXBcIixyLHttaW46ZSxtYXg6dH0pfSw4NDI3OTg6cj0+e2Eua2IoXCJDbGlwXCIscix2b2lkIDApfSw4NDI4NTA6KHIsZSk9PnthLmtiKFwiRWx1XCIscix7YWxwaGE6ZX0pfSw4NDI5MDg6cj0+e2Eua2IoXCJHZWx1XCIscix2b2lkIDApfSw4NDI5NjA6cj0+e2Eua2IoXCJSZWx1XCIscix2b2lkIDApfSw4NDMwMTI6KHIsZSk9PnthLmtiKFwiTGVha3lSZWx1XCIscix7YWxwaGE6ZX0pfSw4NDMwNzY6KHIsZSk9PnthLmtiKFwiVGhyZXNob2xkZWRSZWx1XCIscix7YWxwaGE6ZX0pfSw4NDMxNDY6KHIsZSk9PnthLmtiKFwiQ2FzdFwiLHIse3RvOmV9KX0sODQzMjA0OnI9PnthLmtiKFwiQWRkXCIscix2b2lkIDApfSw4NDMyNTU6cj0+e2Eua2IoXCJTdWJcIixyLHZvaWQgMCl9LDg0MzMwNjpyPT57YS5rYihcIk11bFwiLHIsdm9pZCAwKX0sODQzMzU3OnI9PnthLmtiKFwiRGl2XCIscix2b2lkIDApfSw4NDM0MDg6cj0+e2Eua2IoXCJQb3dcIixyLHZvaWQgMCl9LDg0MzQ1OTpyPT57YS5rYihcIkVxdWFsXCIscix2b2lkIDApfSw4NDM1MTI6cj0+e2Eua2IoXCJHcmVhdGVyXCIscix2b2lkIDApfSw4NDM1Njc6cj0+e2Eua2IoXCJHcmVhdGVyT3JFcXVhbFwiLHIsdm9pZCAwKX0sODQzNjI5OnI9PnthLmtiKFwiTGVzc1wiLHIsdm9pZCAwKX0sODQzNjgxOnI9PnthLmtiKFwiTGVzc09yRXF1YWxcIixyLHZvaWQgMCl9LDg0Mzc0MDoocixlLHQsbixvKT0+e2Eua2IoXCJSZWR1Y2VNZWFuXCIscix7a2VlcERpbXM6ISFlLG5vb3BXaXRoRW1wdHlBeGVzOiEhdCxheGVzOm4/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKG4pPj4+MCxOdW1iZXIobyk+Pj4wKSk6W119KX0sODQzOTE1OihyLGUsdCxuLG8pPT57YS5rYihcIlJlZHVjZU1heFwiLHIse2tlZXBEaW1zOiEhZSxub29wV2l0aEVtcHR5QXhlczohIXQsYXhlczpuP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihuKT4+PjAsTnVtYmVyKG8pPj4+MCkpOltdfSl9LDg0NDA4OToocixlLHQsbixvKT0+e2Eua2IoXCJSZWR1Y2VNaW5cIixyLHtrZWVwRGltczohIWUsbm9vcFdpdGhFbXB0eUF4ZXM6ISF0LGF4ZXM6bj9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIobik+Pj4wLE51bWJlcihvKT4+PjApKTpbXX0pfSw4NDQyNjM6KHIsZSx0LG4sbyk9PnthLmtiKFwiUmVkdWNlUHJvZFwiLHIse2tlZXBEaW1zOiEhZSxub29wV2l0aEVtcHR5QXhlczohIXQsYXhlczpuP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihuKT4+PjAsTnVtYmVyKG8pPj4+MCkpOltdfSl9LDg0NDQzODoocixlLHQsbixvKT0+e2Eua2IoXCJSZWR1Y2VTdW1cIixyLHtrZWVwRGltczohIWUsbm9vcFdpdGhFbXB0eUF4ZXM6ISF0LGF4ZXM6bj9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIobik+Pj4wLE51bWJlcihvKT4+PjApKTpbXX0pfSw4NDQ2MTI6KHIsZSx0LG4sbyk9PnthLmtiKFwiUmVkdWNlTDFcIixyLHtrZWVwRGltczohIWUsbm9vcFdpdGhFbXB0eUF4ZXM6ISF0LGF4ZXM6bj9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIobik+Pj4wLE51bWJlcihvKT4+PjApKTpbXX0pfSw4NDQ3ODU6KHIsZSx0LG4sbyk9PnthLmtiKFwiUmVkdWNlTDJcIixyLHtrZWVwRGltczohIWUsbm9vcFdpdGhFbXB0eUF4ZXM6ISF0LGF4ZXM6bj9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIobik+Pj4wLE51bWJlcihvKT4+PjApKTpbXX0pfSw4NDQ5NTg6KHIsZSx0LG4sbyk9PnthLmtiKFwiUmVkdWNlTG9nU3VtXCIscix7a2VlcERpbXM6ISFlLG5vb3BXaXRoRW1wdHlBeGVzOiEhdCxheGVzOm4/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKG4pPj4+MCxOdW1iZXIobyk+Pj4wKSk6W119KX0sODQ1MTM1OihyLGUsdCxuLG8pPT57YS5rYihcIlJlZHVjZVN1bVNxdWFyZVwiLHIse2tlZXBEaW1zOiEhZSxub29wV2l0aEVtcHR5QXhlczohIXQsYXhlczpuP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihuKT4+PjAsTnVtYmVyKG8pPj4+MCkpOltdfSl9LDg0NTMxNToocixlLHQsbixvKT0+e2Eua2IoXCJSZWR1Y2VMb2dTdW1FeHBcIixyLHtrZWVwRGltczohIWUsbm9vcFdpdGhFbXB0eUF4ZXM6ISF0LGF4ZXM6bj9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIobik+Pj4wLE51bWJlcihvKT4+PjApKTpbXX0pfSw4NDU0OTU6cj0+e2Eua2IoXCJXaGVyZVwiLHIsdm9pZCAwKX0sODQ1NTQ4OihyLGUsdCk9PnthLmtiKFwiVHJhbnNwb3NlXCIscix7cGVybTplP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihlKT4+PjAsTnVtYmVyKHQpPj4+MCkpOltdfSl9LDg0NTY3MjoocixlLHQsbik9PnthLmtiKFwiRGVwdGhUb1NwYWNlXCIscix7YmxvY2tzaXplOmUsbW9kZTpTcih0KSxmb3JtYXQ6bj9cIk5IV0NcIjpcIk5DSFdcIn0pfSw4NDU4MDU6KHIsZSx0LG4pPT57YS5rYihcIkRlcHRoVG9TcGFjZVwiLHIse2Jsb2Nrc2l6ZTplLG1vZGU6U3IodCksZm9ybWF0Om4/XCJOSFdDXCI6XCJOQ0hXXCJ9KX0sODQ1OTM4OihyLGUsdCxuLG8saSx1LHMsZixiLG0sbCxjLGQscCk9PnthLmtiKFwiQ29udlRyYW5zcG9zZVwiLHIse2Zvcm1hdDpmP1wiTkhXQ1wiOlwiTkNIV1wiLGF1dG9QYWQ6ZSxkaWxhdGlvbnM6W3RdLGdyb3VwOm4sa2VybmVsU2hhcGU6W29dLHBhZHM6W2ksdV0sc3RyaWRlczpbc10sd0lzQ29uc3Q6KCk9PiEhRigpW2I+Pj4wXSxvdXRwdXRQYWRkaW5nOm0/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKG0pPj4+MCxOdW1iZXIobCk+Pj4wKSk6W10sb3V0cHV0U2hhcGU6Yz9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIoYyk+Pj4wLE51bWJlcihkKT4+PjApKTpbXSxhY3RpdmF0aW9uOlNyKHApfSl9LDg0NjM3MToocixlLHQsbixvLGksdSxzLGYsYixtLGwsYyxkKT0+e2Eua2IoXCJDb252VHJhbnNwb3NlXCIscix7Zm9ybWF0OnM/XCJOSFdDXCI6XCJOQ0hXXCIsYXV0b1BhZDplLGRpbGF0aW9uczpBcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIodCk+Pj4wLDIrKE51bWJlcih0KT4+PjApPj4+MCkpLGdyb3VwOm4sa2VybmVsU2hhcGU6QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKG8pPj4+MCwyKyhOdW1iZXIobyk+Pj4wKT4+PjApKSxwYWRzOkFycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihpKT4+PjAsNCsoTnVtYmVyKGkpPj4+MCk+Pj4wKSksc3RyaWRlczpBcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIodSk+Pj4wLDIrKE51bWJlcih1KT4+PjApPj4+MCkpLHdJc0NvbnN0OigpPT4hIUYoKVtmPj4+MF0sb3V0cHV0UGFkZGluZzpiP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihiKT4+PjAsTnVtYmVyKG0pPj4+MCkpOltdLG91dHB1dFNoYXBlOmw/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKGwpPj4+MCxOdW1iZXIoYyk+Pj4wKSk6W10sYWN0aXZhdGlvbjpTcihkKX0pfSw4NDcwMzI6KHIsZSx0LG4sbyxpLHUscyxmLGIsbSxsLGMsZCxwKT0+e2Eua2IoXCJDb252VHJhbnNwb3NlXCIscix7Zm9ybWF0OmY/XCJOSFdDXCI6XCJOQ0hXXCIsYXV0b1BhZDplLGRpbGF0aW9uczpbdF0sZ3JvdXA6bixrZXJuZWxTaGFwZTpbb10scGFkczpbaSx1XSxzdHJpZGVzOltzXSx3SXNDb25zdDooKT0+ISFGKClbYj4+PjBdLG91dHB1dFBhZGRpbmc6bT9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIobSk+Pj4wLE51bWJlcihsKT4+PjApKTpbXSxvdXRwdXRTaGFwZTpjP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihjKT4+PjAsTnVtYmVyKGQpPj4+MCkpOltdLGFjdGl2YXRpb246U3IocCl9KX0sODQ3NDY1OihyLGUsdCxuLG8saSx1LHMsZixiLG0sbCxjLGQpPT57YS5rYihcIkNvbnZUcmFuc3Bvc2VcIixyLHtmb3JtYXQ6cz9cIk5IV0NcIjpcIk5DSFdcIixhdXRvUGFkOmUsZGlsYXRpb25zOkFycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcih0KT4+PjAsMisoTnVtYmVyKHQpPj4+MCk+Pj4wKSksZ3JvdXA6bixrZXJuZWxTaGFwZTpBcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIobyk+Pj4wLDIrKE51bWJlcihvKT4+PjApPj4+MCkpLHBhZHM6QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKGkpPj4+MCw0KyhOdW1iZXIoaSk+Pj4wKT4+PjApKSxzdHJpZGVzOkFycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcih1KT4+PjAsMisoTnVtYmVyKHUpPj4+MCk+Pj4wKSksd0lzQ29uc3Q6KCk9PiEhRigpW2Y+Pj4wXSxvdXRwdXRQYWRkaW5nOmI/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKGIpPj4+MCxOdW1iZXIobSk+Pj4wKSk6W10sb3V0cHV0U2hhcGU6bD9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIobCk+Pj4wLE51bWJlcihjKT4+PjApKTpbXSxhY3RpdmF0aW9uOlNyKGQpfSl9LDg0ODEyNjoocixlKT0+e2Eua2IoXCJHbG9iYWxBdmVyYWdlUG9vbFwiLHIse2Zvcm1hdDplP1wiTkhXQ1wiOlwiTkNIV1wifSl9LDg0ODIxNzoocixlLHQsbixvLGksdSxzLGYsYixtLGwsYyxkKT0+e2Eua2IoXCJBdmVyYWdlUG9vbFwiLHIse2Zvcm1hdDpkP1wiTkhXQ1wiOlwiTkNIV1wiLGF1dG9fcGFkOmUsY2VpbF9tb2RlOnQsY291bnRfaW5jbHVkZV9wYWQ6bixzdG9yYWdlX29yZGVyOm8sZGlsYXRpb25zOmk/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKGkpPj4+MCxOdW1iZXIodSk+Pj4wKSk6W10sa2VybmVsX3NoYXBlOnM/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKHMpPj4+MCxOdW1iZXIoZik+Pj4wKSk6W10scGFkczpiP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihiKT4+PjAsTnVtYmVyKG0pPj4+MCkpOltdLHN0cmlkZXM6bD9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIobCk+Pj4wLE51bWJlcihjKT4+PjApKTpbXX0pfSw4NDg2OTY6KHIsZSk9PnthLmtiKFwiR2xvYmFsQXZlcmFnZVBvb2xcIixyLHtmb3JtYXQ6ZT9cIk5IV0NcIjpcIk5DSFdcIn0pfSw4NDg3ODc6KHIsZSx0LG4sbyxpLHUscyxmLGIsbSxsLGMsZCk9PnthLmtiKFwiQXZlcmFnZVBvb2xcIixyLHtmb3JtYXQ6ZD9cIk5IV0NcIjpcIk5DSFdcIixhdXRvX3BhZDplLGNlaWxfbW9kZTp0LGNvdW50X2luY2x1ZGVfcGFkOm4sc3RvcmFnZV9vcmRlcjpvLGRpbGF0aW9uczppP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihpKT4+PjAsTnVtYmVyKHUpPj4+MCkpOltdLGtlcm5lbF9zaGFwZTpzP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihzKT4+PjAsTnVtYmVyKGYpPj4+MCkpOltdLHBhZHM6Yj9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIoYik+Pj4wLE51bWJlcihtKT4+PjApKTpbXSxzdHJpZGVzOmw/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKGwpPj4+MCxOdW1iZXIoYyk+Pj4wKSk6W119KX0sODQ5MjY2OihyLGUpPT57YS5rYihcIkdsb2JhbE1heFBvb2xcIixyLHtmb3JtYXQ6ZT9cIk5IV0NcIjpcIk5DSFdcIn0pfSw4NDkzNTM6KHIsZSx0LG4sbyxpLHUscyxmLGIsbSxsLGMsZCk9PnthLmtiKFwiTWF4UG9vbFwiLHIse2Zvcm1hdDpkP1wiTkhXQ1wiOlwiTkNIV1wiLGF1dG9fcGFkOmUsY2VpbF9tb2RlOnQsY291bnRfaW5jbHVkZV9wYWQ6bixzdG9yYWdlX29yZGVyOm8sZGlsYXRpb25zOmk/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKGkpPj4+MCxOdW1iZXIodSk+Pj4wKSk6W10sa2VybmVsX3NoYXBlOnM/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKHMpPj4+MCxOdW1iZXIoZik+Pj4wKSk6W10scGFkczpiP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihiKT4+PjAsTnVtYmVyKG0pPj4+MCkpOltdLHN0cmlkZXM6bD9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIobCk+Pj4wLE51bWJlcihjKT4+PjApKTpbXX0pfSw4NDk4Mjg6KHIsZSk9PnthLmtiKFwiR2xvYmFsTWF4UG9vbFwiLHIse2Zvcm1hdDplP1wiTkhXQ1wiOlwiTkNIV1wifSl9LDg0OTkxNToocixlLHQsbixvLGksdSxzLGYsYixtLGwsYyxkKT0+e2Eua2IoXCJNYXhQb29sXCIscix7Zm9ybWF0OmQ/XCJOSFdDXCI6XCJOQ0hXXCIsYXV0b19wYWQ6ZSxjZWlsX21vZGU6dCxjb3VudF9pbmNsdWRlX3BhZDpuLHN0b3JhZ2Vfb3JkZXI6byxkaWxhdGlvbnM6aT9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIoaSk+Pj4wLE51bWJlcih1KT4+PjApKTpbXSxrZXJuZWxfc2hhcGU6cz9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIocyk+Pj4wLE51bWJlcihmKT4+PjApKTpbXSxwYWRzOmI/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKGIpPj4+MCxOdW1iZXIobSk+Pj4wKSk6W10sc3RyaWRlczpsP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihsKT4+PjAsTnVtYmVyKGMpPj4+MCkpOltdfSl9LDg1MDM5MDoocixlLHQsbixvKT0+e2Eua2IoXCJHZW1tXCIscix7YWxwaGE6ZSxiZXRhOnQsdHJhbnNBOm4sdHJhbnNCOm99KX0sODUwNDk0OnI9PnthLmtiKFwiTWF0TXVsXCIscix2b2lkIDApfSw4NTA1NDg6KHIsZSx0LG4pPT57YS5rYihcIkFyZ01heFwiLHIse2tlZXBEaW1zOiEhZSxzZWxlY3RMYXN0SW5kZXg6ISF0LGF4aXM6bn0pfSw4NTA2NTY6KHIsZSx0LG4pPT57YS5rYihcIkFyZ01pblwiLHIse2tlZXBEaW1zOiEhZSxzZWxlY3RMYXN0SW5kZXg6ISF0LGF4aXM6bn0pfSw4NTA3NjQ6KHIsZSk9PnthLmtiKFwiU29mdG1heFwiLHIse2F4aXM6ZX0pfSw4NTA4Mjc6KHIsZSk9PnthLmtiKFwiQ29uY2F0XCIscix7YXhpczplfSl9LDg1MDg4NzoocixlLHQsbixvKT0+e2Eua2IoXCJTcGxpdFwiLHIse2F4aXM6ZSxudW1PdXRwdXRzOnQsc3BsaXRTaXplczpuP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihuKT4+PjAsTnVtYmVyKG8pPj4+MCkpOltdfSl9LDg1MTA0MzpyPT57YS5rYihcIkV4cGFuZFwiLHIsdm9pZCAwKX0sODUxMDk3OihyLGUpPT57YS5rYihcIkdhdGhlclwiLHIse2F4aXM6TnVtYmVyKGUpfSl9LDg1MTE2ODoocixlKT0+e2Eua2IoXCJHYXRoZXJFbGVtZW50c1wiLHIse2F4aXM6TnVtYmVyKGUpfSl9LDg1MTI0NzoocixlKT0+e2Eua2IoXCJHYXRoZXJORFwiLHIse2JhdGNoX2RpbXM6TnVtYmVyKGUpfSl9LDg1MTMyNjoocixlLHQsbixvLGksdSxzLGYsYixtKT0+e2Eua2IoXCJSZXNpemVcIixyLHthbnRpYWxpYXM6ZSxheGVzOnQ/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKHQpPj4+MCxOdW1iZXIobik+Pj4wKSk6W10sY29vcmRpbmF0ZVRyYW5zZm9ybU1vZGU6U3IobyksY3ViaWNDb2VmZkE6aSxleGNsdWRlT3V0c2lkZTp1LGV4dHJhcG9sYXRpb25WYWx1ZTpzLGtlZXBBc3BlY3RSYXRpb1BvbGljeTpTcihmKSxtb2RlOlNyKGIpLG5lYXJlc3RNb2RlOlNyKG0pfSl9LDg1MTY4ODoocixlLHQsbixvLGksdSk9PnthLmtiKFwiU2xpY2VcIixyLHtzdGFydHM6ZT9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIoZSk+Pj4wLE51bWJlcih0KT4+PjApKTpbXSxlbmRzOm4/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKG4pPj4+MCxOdW1iZXIobyk+Pj4wKSk6W10sYXhlczppP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihpKT4+PjAsTnVtYmVyKHUpPj4+MCkpOltdfSl9LDg1MTk1MjpyPT57YS5rYihcIlRpbGVcIixyLHZvaWQgMCl9LDg1MjAwNDoocixlLHQpPT57YS5rYihcIkluc3RhbmNlTm9ybWFsaXphdGlvblwiLHIse2Vwc2lsb246ZSxmb3JtYXQ6dD9cIk5IV0NcIjpcIk5DSFdcIn0pfSw4NTIxMTg6KHIsZSx0KT0+e2Eua2IoXCJJbnN0YW5jZU5vcm1hbGl6YXRpb25cIixyLHtlcHNpbG9uOmUsZm9ybWF0OnQ/XCJOSFdDXCI6XCJOQ0hXXCJ9KX0sODUyMjMyOnI9PnthLmtiKFwiUmFuZ2VcIixyLHZvaWQgMCl9LDg1MjI4NToocixlKT0+e2Eua2IoXCJFaW5zdW1cIixyLHtlcXVhdGlvbjpTcihlKX0pfSw4NTIzNjY6KHIsZSx0LG4sbyk9PnthLmtiKFwiUGFkXCIscix7bW9kZTplLHZhbHVlOnQscGFkczpuP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihuKT4+PjAsTnVtYmVyKG8pPj4+MCkpOltdfSl9LDg1MjUwOToocixlLHQsbixvLGkpPT57YS5rYihcIkJhdGNoTm9ybWFsaXphdGlvblwiLHIse2Vwc2lsb246ZSxtb21lbnR1bTp0LHNwYXRpYWw6ISFvLHRyYWluaW5nTW9kZTohIW4sZm9ybWF0Omk/XCJOSFdDXCI6XCJOQ0hXXCJ9KX0sODUyNjc4OihyLGUsdCxuLG8saSk9PnthLmtiKFwiQmF0Y2hOb3JtYWxpemF0aW9uXCIscix7ZXBzaWxvbjplLG1vbWVudHVtOnQsc3BhdGlhbDohIW8sdHJhaW5pbmdNb2RlOiEhbixmb3JtYXQ6aT9cIk5IV0NcIjpcIk5DSFdcIn0pfSw4NTI4NDc6KHIsZSx0KT0+e2Eua2IoXCJDdW1TdW1cIixyLHtleGNsdXNpdmU6TnVtYmVyKGUpLHJldmVyc2U6TnVtYmVyKHQpfSl9LDg1Mjk0NDoocixlLHQpPT57YS5rYihcIkRlcXVhbnRpemVMaW5lYXJcIixyLHtheGlzOmUsYmxvY2tTaXplOnR9KX0sODUzMDM0OihyLGUsdCxuLG8pPT57YS5rYihcIkdyaWRTYW1wbGVcIixyLHthbGlnbl9jb3JuZXJzOmUsbW9kZTpTcih0KSxwYWRkaW5nX21vZGU6U3IobiksZm9ybWF0Om8/XCJOSFdDXCI6XCJOQ0hXXCJ9KX0sODUzMjA0OihyLGUsdCxuLG8pPT57YS5rYihcIkdyaWRTYW1wbGVcIixyLHthbGlnbl9jb3JuZXJzOmUsbW9kZTpTcih0KSxwYWRkaW5nX21vZGU6U3IobiksZm9ybWF0Om8/XCJOSFdDXCI6XCJOQ0hXXCJ9KX0sODUzMzc0OihyLGUpPT57YS5rYihcIlNjYXR0ZXJORFwiLHIse3JlZHVjdGlvbjpTcihlKX0pfSw4NTM0NTk6KHIsZSx0LG4sbyxpLHUscyxmKT0+e2Eua2IoXCJBdHRlbnRpb25cIixyLHtudW1IZWFkczplLGlzVW5pZGlyZWN0aW9uYWw6dCxtYXNrRmlsdGVyVmFsdWU6bixzY2FsZTpvLGRvUm90YXJ5OmkscWt2SGlkZGVuU2l6ZXM6dT9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIocyk+Pj4wLE51bWJlcihzKSt1Pj4+MCkpOltdLHBhc3RQcmVzZW50U2hhcmVCdWZmZXI6ISFmfSl9LDg1MzczMTpyPT57YS5rYihcIkJpYXNBZGRcIixyLHZvaWQgMCl9LDg1Mzc4NjpyPT57YS5rYihcIkJpYXNTcGxpdEdlbHVcIixyLHZvaWQgMCl9LDg1Mzg0NzpyPT57YS5rYihcIkZhc3RHZWx1XCIscix2b2lkIDApfSw4NTM5MDM6KHIsZSx0LG4sbyxpLHUscyxmLGIsbSxsLGMsZCxwLHkpPT57YS5rYihcIkNvbnZcIixyLHtmb3JtYXQ6bD9cIk5IV0NcIjpcIk5DSFdcIixhdXRvX3BhZDplLGRpbGF0aW9uczp0P0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcih0KT4+PjAsTnVtYmVyKG4pPj4+MCkpOltdLGdyb3VwOm8sa2VybmVsX3NoYXBlOmk/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKGkpPj4+MCxOdW1iZXIodSk+Pj4wKSk6W10scGFkczpzP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihzKT4+PjAsTnVtYmVyKGYpPj4+MCkpOltdLHN0cmlkZXM6Yj9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIoYik+Pj4wLE51bWJlcihtKT4+PjApKTpbXSx3X2lzX2NvbnN0OigpPT4hIUYoKVtOdW1iZXIoYyk+Pj4wXSxhY3RpdmF0aW9uOlNyKGQpLGFjdGl2YXRpb25fcGFyYW1zOnA/QXJyYXkuZnJvbSgkKCkuc3ViYXJyYXkoTnVtYmVyKHApPj4+MCxOdW1iZXIoeSk+Pj4wKSk6W119KX0sODU0NDg3OnI9PnthLmtiKFwiR2VsdVwiLHIsdm9pZCAwKX0sODU0NTM5OihyLGUsdCxuLG8saSx1LHMsZik9PnthLmtiKFwiR3JvdXBRdWVyeUF0dGVudGlvblwiLHIse251bUhlYWRzOmUsa3ZOdW1IZWFkczp0LHNjYWxlOm4sc29mdGNhcDpvLGRvUm90YXJ5Omkscm90YXJ5SW50ZXJsZWF2ZWQ6dSxzbW9vdGhTb2Z0bWF4OnMsbG9jYWxXaW5kb3dTaXplOmZ9KX0sODU0NzU2OihyLGUsdCxuKT0+e2Eua2IoXCJMYXllck5vcm1hbGl6YXRpb25cIixyLHtheGlzOmUsZXBzaWxvbjp0LHNpbXBsaWZpZWQ6ISFufSl9LDg1NDg2NzoocixlLHQsbik9PnthLmtiKFwiTGF5ZXJOb3JtYWxpemF0aW9uXCIscix7YXhpczplLGVwc2lsb246dCxzaW1wbGlmaWVkOiEhbn0pfSw4NTQ5Nzg6KHIsZSx0LG4sbyxpKT0+e2Eua2IoXCJNYXRNdWxOQml0c1wiLHIse2s6ZSxuOnQsYWNjdXJhY3lMZXZlbDpuLGJpdHM6byxibG9ja1NpemU6aX0pfSw4NTUxMDU6KHIsZSx0LG4sbyxpKT0+e2Eua2IoXCJNdWx0aUhlYWRBdHRlbnRpb25cIixyLHtudW1IZWFkczplLGlzVW5pZGlyZWN0aW9uYWw6dCxtYXNrRmlsdGVyVmFsdWU6bixzY2FsZTpvLGRvUm90YXJ5Oml9KX0sODU1MjY0OihyLGUpPT57YS5rYihcIlF1aWNrR2VsdVwiLHIse2FscGhhOmV9KX0sODU1MzI4OihyLGUsdCxuLG8pPT57YS5rYihcIlJvdGFyeUVtYmVkZGluZ1wiLHIse2ludGVybGVhdmVkOiEhZSxudW1IZWFkczp0LHJvdGFyeUVtYmVkZGluZ0RpbTpuLHNjYWxlOm99KX0sODU1NDY3OihyLGUsdCk9PnthLmtiKFwiU2tpcExheWVyTm9ybWFsaXphdGlvblwiLHIse2Vwc2lsb246ZSxzaW1wbGlmaWVkOiEhdH0pfSw4NTU1Njk6KHIsZSx0KT0+e2Eua2IoXCJTa2lwTGF5ZXJOb3JtYWxpemF0aW9uXCIscix7ZXBzaWxvbjplLHNpbXBsaWZpZWQ6ISF0fSl9LDg1NTY3MToocixlLHQsbik9PnthLmtiKFwiR2F0aGVyQmxvY2tRdWFudGl6ZWRcIixyLHtnYXRoZXJBeGlzOmUscXVhbnRpemVBeGlzOnQsYmxvY2tTaXplOm59KX0sODU1NzkyOnI9PnthLiRiKHIpfSw4NTU4MjY6KHIsZSk9PmEuYmMoTnVtYmVyKHIpLE51bWJlcihlKSxhLkdiLmVjLGEuR2IuZXJyb3JzKX07ZnVuY3Rpb24gdHIocixlLHQpe3JldHVybiBKZSgoYXN5bmMoKT0+e2F3YWl0IGEuWWIoTnVtYmVyKHIpLE51bWJlcihlKSxOdW1iZXIodCkpfSkpfWZ1bmN0aW9uIG5yKCl7cmV0dXJuXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdhc21PZmZzZXRDb252ZXJ0ZXJ9Y2xhc3MgYXJ7bmFtZT1cIkV4aXRTdGF0dXNcIjtjb25zdHJ1Y3RvcihyKXt0aGlzLm1lc3NhZ2U9YFByb2dyYW0gdGVybWluYXRlZCB3aXRoIGV4aXQoJHtyfSlgLHRoaXMuc3RhdHVzPXJ9fXZhciBvcj1yPT57ci50ZXJtaW5hdGUoKSxyLm9ubWVzc2FnZT0oKT0+e319LGlyPVtdLHVyPXI9PnswPT1jci5sZW5ndGgmJihOcigpLGdyKGNyWzBdKSk7dmFyIGU9Y3IucG9wKCk7aWYoIWUpcmV0dXJuIDY7ZHIucHVzaChlKSx5cltyLkJiXT1lLGUuQmI9ci5CYjt2YXIgdD17Q2I6XCJydW5cIixoYzpyLmZjLEliOnIuSWIsQmI6ci5CYn07cmV0dXJuIGUucG9zdE1lc3NhZ2UodCxyLk5iKSwwfSxzcj0wLGZyPShyLGUsLi4udCk9Pntmb3IodmFyIG49Mip0Lmxlbmd0aCxhPU9uKCksbz1fbig4Km4pLGk9bz4+PjMsdT0wO3U8dC5sZW5ndGg7dSsrKXt2YXIgcz10W3VdO1wiYmlnaW50XCI9PXR5cGVvZiBzPyh4W2krMip1XT0xbix4W2krMip1KzFdPXMpOih4W2krMip1XT0wbixqKClbaSsyKnUrMT4+PjBdPXMpfXJldHVybiByPXZuKHIsMCxuLG8sZSksQ24oYSkscn07ZnVuY3Rpb24gYnIocil7aWYocylyZXR1cm4gZnIoMCwxLHIpO2lmKEE9ciwhKDA8c3IpKXtmb3IodmFyIGUgb2YgZHIpb3IoZSk7Zm9yKGUgb2YgY3Ipb3IoZSk7Y3I9W10sZHI9W10seXI9e30sRD0hMH1wKDAsbmV3IGFyKHIpKX1mdW5jdGlvbiBtcihyKXtpZihzKXJldHVybiBmcigxLDAscik7bHIocil9dmFyIGxyPXI9PntpZihBPXIscyl0aHJvdyBtcihyKSxcInVud2luZFwiO2JyKHIpfSxjcj1bXSxkcj1bXSxwcj1bXSx5cj17fSxocj1yPT57dmFyIGU9ci5CYjtkZWxldGUgeXJbZV0sY3IucHVzaChyKSxkci5zcGxpY2UoZHIuaW5kZXhPZihyKSwxKSxyLkJiPTAsZ24oZSl9O2Z1bmN0aW9uIHZyKCl7cHIuZm9yRWFjaCgocj0+cigpKSl9dmFyIGdyPXI9Pm5ldyBQcm9taXNlKChlPT57ci5vbm1lc3NhZ2U9dD0+e3ZhciBuPSh0PXQuZGF0YSkuQ2I7aWYodC5IYiYmdC5IYiE9Y24oKSl7dmFyIG89eXJbdC5IYl07bz9vLnBvc3RNZXNzYWdlKHQsdC5OYik6TihgSW50ZXJuYWwgZXJyb3IhIFdvcmtlciBzZW50IGEgbWVzc2FnZSBcIiR7bn1cIiB0byB0YXJnZXQgcHRocmVhZCAke3QuSGJ9LCBidXQgdGhhdCB0aHJlYWQgbm8gbG9uZ2VyIGV4aXN0cyFgKX1lbHNlXCJjaGVja01haWxib3hcIj09PW4/V2UoKTpcInNwYXduVGhyZWFkXCI9PT1uP3VyKHQpOlwiY2xlYW51cFRocmVhZFwiPT09bj9ocih5clt0LmljXSk6XCJsb2FkZWRcIj09PW4/KHIubG9hZGVkPSEwLGUocikpOlwiYWxlcnRcIj09PW4/YWxlcnQoYFRocmVhZCAke3QuamN9OiAke3QudGV4dH1gKTpcInNldGltbWVkaWF0ZVwiPT09dC50YXJnZXQ/ci5wb3N0TWVzc2FnZSh0KTpcImNhbGxIYW5kbGVyXCI9PT1uP2FbdC5SYl0oLi4udC5hcmdzKTpuJiZOKGB3b3JrZXIgc2VudCBhbiB1bmtub3duIGNvbW1hbmQgJHtufWApfSxyLm9uZXJyb3I9cj0+e3Rocm93IE4oYHdvcmtlciBzZW50IGFuIGVycm9yISAke3IuZmlsZW5hbWV9OiR7ci5saW5lbm99OiAke3IubWVzc2FnZX1gKSxyfTt2YXIgdCxuPVtdO2Zvcih0IG9mW10pYS5wcm9wZXJ0eUlzRW51bWVyYWJsZSh0KSYmbi5wdXNoKHQpO3IucG9zdE1lc3NhZ2Uoe0NiOlwibG9hZFwiLFNiOm4sbGM6ayxtYzp3fSl9KSk7ZnVuY3Rpb24gTnIoKXt2YXIgcj1uZXcgV29ya2VyKCgoKT0+e2NvbnN0IHI9VVJMO3JldHVybiBpbXBvcnQubWV0YS51cmw+XCJmaWxlOlwiJiZpbXBvcnQubWV0YS51cmw8XCJmaWxlO1wiP25ldyByKEJVSUxEX0RFRlMuQlVORExFX0ZJTEVOQU1FLGltcG9ydC5tZXRhLnVybCk6bmV3IFVSTChpbXBvcnQubWV0YS51cmwpfSkoKSx7dHlwZTpcIm1vZHVsZVwiLHdvcmtlckRhdGE6XCJlbS1wdGhyZWFkXCIsbmFtZTpcImVtLXB0aHJlYWRcIn0pO2NyLnB1c2gocil9dmFyIGtyPXI9PntxKCk7dmFyIGU9VSgpW3IrNTI+Pj4yPj4+MF07cj1VKClbcis1Nj4+PjI+Pj4wXSxBbihlLGUtciksQ24oZSl9LHdyPShyLGUpPT57c3I9MCxyPVRuKHIsZSksMDxzcj9BPXI6Tm4ocil9O2NsYXNzIEFye2NvbnN0cnVjdG9yKHIpe3RoaXMuSmI9ci0yNH19ZnVuY3Rpb24gQ3IocixlLHQpe3ZhciBuPW5ldyBBcihyPj4+PTApO3Rocm93IGU+Pj49MCx0Pj4+PTAsVSgpW24uSmIrMTY+Pj4yPj4+MF09MCxVKClbbi5KYis0Pj4+Mj4+PjBdPWUsVSgpW24uSmIrOD4+PjI+Pj4wXT10LHJ9ZnVuY3Rpb24gX3IocixlLHQsbil7cmV0dXJuIHM/ZnIoMiwxLHIsZSx0LG4pOk9yKHIsZSx0LG4pfWZ1bmN0aW9uIE9yKHIsZSx0LG4pe2lmKHI+Pj49MCx0Pj4+PTAsbj4+Pj0wLHZvaWQgMD09PWYpcmV0dXJuIDY7dmFyIGE9W107cmV0dXJuIHMmJjA9PT1hLmxlbmd0aD9fcihyLGU+Pj49MCx0LG4pOihyPXtmYzp0LEJiOnIsSWI6bixOYjphfSxzPyhyLkNiPVwic3Bhd25UaHJlYWRcIixwb3N0TWVzc2FnZShyLGEpLDApOnVyKHIpKX12YXIgVHI9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyP25ldyBUZXh0RGVjb2Rlcjp2b2lkIDAsV3I9KHIsZT0wLHQ9TmFOKT0+e3ZhciBuPShlPj4+PTApK3Q7Zm9yKHQ9ZTtyW3RdJiYhKHQ+PW4pOykrK3Q7aWYoMTY8dC1lJiZyLmJ1ZmZlciYmVHIpcmV0dXJuIFRyLmRlY29kZShyLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyP3Iuc3ViYXJyYXkoZSx0KTpyLnNsaWNlKGUsdCkpO2ZvcihuPVwiXCI7ZTx0Oyl7dmFyIGE9cltlKytdO2lmKDEyOCZhKXt2YXIgbz02MyZyW2UrK107aWYoMTkyPT0oMjI0JmEpKW4rPVN0cmluZy5mcm9tQ2hhckNvZGUoKDMxJmEpPDw2fG8pO2Vsc2V7dmFyIGk9NjMmcltlKytdOzY1NTM2PihhPTIyND09KDI0MCZhKT8oMTUmYSk8PDEyfG88PDZ8aTooNyZhKTw8MTh8bzw8MTJ8aTw8Nnw2MyZyW2UrK10pP24rPVN0cmluZy5mcm9tQ2hhckNvZGUoYSk6KGEtPTY1NTM2LG4rPVN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTZ8YT4+MTAsNTYzMjB8MTAyMyZhKSl9fWVsc2Ugbis9U3RyaW5nLmZyb21DaGFyQ29kZShhKX1yZXR1cm4gbn0sU3I9KHIsZSk9PihyPj4+PTApP1dyKEIoKSxyLGUpOlwiXCI7ZnVuY3Rpb24gRXIocixlLHQpe3JldHVybiBzP2ZyKDMsMSxyLGUsdCk6MH1mdW5jdGlvbiB4cihyLGUpe2lmKHMpcmV0dXJuIGZyKDQsMSxyLGUpfXZhciBScj1yPT57Zm9yKHZhciBlPTAsdD0wO3Q8ci5sZW5ndGg7Kyt0KXt2YXIgbj1yLmNoYXJDb2RlQXQodCk7MTI3Pj1uP2UrKzoyMDQ3Pj1uP2UrPTI6NTUyOTY8PW4mJjU3MzQzPj1uPyhlKz00LCsrdCk6ZSs9M31yZXR1cm4gZX0sTXI9KHIsZSx0KT0+e3ZhciBuPUIoKTtpZihlPj4+PTAsMDx0KXt2YXIgYT1lO3Q9ZSt0LTE7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDsrK28pe3ZhciBpPXIuY2hhckNvZGVBdChvKTtpZig1NTI5Njw9aSYmNTczNDM+PWkmJihpPTY1NTM2KygoMTAyMyZpKTw8MTApfDEwMjMmci5jaGFyQ29kZUF0KCsrbykpLDEyNz49aSl7aWYoZT49dClicmVhaztuW2UrKz4+PjBdPWl9ZWxzZXtpZigyMDQ3Pj1pKXtpZihlKzE+PXQpYnJlYWs7bltlKys+Pj4wXT0xOTJ8aT4+Nn1lbHNle2lmKDY1NTM1Pj1pKXtpZihlKzI+PXQpYnJlYWs7bltlKys+Pj4wXT0yMjR8aT4+MTJ9ZWxzZXtpZihlKzM+PXQpYnJlYWs7bltlKys+Pj4wXT0yNDB8aT4+MTgsbltlKys+Pj4wXT0xMjh8aT4+MTImNjN9bltlKys+Pj4wXT0xMjh8aT4+NiY2M31uW2UrKz4+PjBdPTEyOHw2MyZpfX1uW2U+Pj4wXT0wLHI9ZS1hfWVsc2Ugcj0wO3JldHVybiByfTtmdW5jdGlvbiBIcihyLGUpe2lmKHMpcmV0dXJuIGZyKDUsMSxyLGUpfWZ1bmN0aW9uIERyKHIsZSx0KXtpZihzKXJldHVybiBmcig2LDEscixlLHQpfWZ1bmN0aW9uIFByKHIsZSx0KXtyZXR1cm4gcz9mcig3LDEscixlLHQpOjB9ZnVuY3Rpb24gRnIocixlKXtpZihzKXJldHVybiBmcig4LDEscixlKX1mdW5jdGlvbiBCcihyLGUsdCl7aWYocylyZXR1cm4gZnIoOSwxLHIsZSx0KX1mdW5jdGlvbiBJcihyLGUsdCxuKXtpZihzKXJldHVybiBmcigxMCwxLHIsZSx0LG4pfWZ1bmN0aW9uIEdyKHIsZSx0LG4pe2lmKHMpcmV0dXJuIGZyKDExLDEscixlLHQsbil9ZnVuY3Rpb24gTHIocixlLHQsbil7aWYocylyZXR1cm4gZnIoMTIsMSxyLGUsdCxuKX1mdW5jdGlvbiBVcihyKXtpZihzKXJldHVybiBmcigxMywxLHIpfWZ1bmN0aW9uICRyKHIsZSl7aWYocylyZXR1cm4gZnIoMTQsMSxyLGUpfWZ1bmN0aW9uIGpyKHIsZSx0KXtpZihzKXJldHVybiBmcigxNSwxLHIsZSx0KX12YXIgenIsVnIscXI9KCk9PlooXCJcIiksWXI9cj0+e2Zvcih2YXIgZT1cIlwiO0IoKVtyPj4+MF07KWUrPXpyW0IoKVtyKys+Pj4wXV07cmV0dXJuIGV9LEpyPXt9LFFyPXt9LFhyPXt9O2Z1bmN0aW9uIEtyKHIsZSx0PXt9KXtyZXR1cm4gZnVuY3Rpb24ocixlLHQ9e30pe3ZhciBuPWUubmFtZTtpZighcil0aHJvdyBuZXcgVnIoYHR5cGUgXCIke259XCIgbXVzdCBoYXZlIGEgcG9zaXRpdmUgaW50ZWdlciB0eXBlaWQgcG9pbnRlcmApO2lmKFFyLmhhc093blByb3BlcnR5KHIpKXtpZih0LlRiKXJldHVybjt0aHJvdyBuZXcgVnIoYENhbm5vdCByZWdpc3RlciB0eXBlICcke259JyB0d2ljZWApfVFyW3JdPWUsZGVsZXRlIFhyW3JdLEpyLmhhc093blByb3BlcnR5KHIpJiYoZT1KcltyXSxkZWxldGUgSnJbcl0sZS5mb3JFYWNoKChyPT5yKCkpKSl9KHIsZSx0KX12YXIgWnI9KHIsZSx0KT0+e3N3aXRjaChlKXtjYXNlIDE6cmV0dXJuIHQ/cj0+RigpW3I+Pj4wXTpyPT5CKClbcj4+PjBdO2Nhc2UgMjpyZXR1cm4gdD9yPT5JKClbcj4+PjE+Pj4wXTpyPT5HKClbcj4+PjE+Pj4wXTtjYXNlIDQ6cmV0dXJuIHQ/cj0+TCgpW3I+Pj4yPj4+MF06cj0+VSgpW3I+Pj4yPj4+MF07Y2FzZSA4OnJldHVybiB0P3I9Pnhbcj4+PjNdOnI9PlJbcj4+PjNdO2RlZmF1bHQ6dGhyb3cgbmV3IFR5cGVFcnJvcihgaW52YWxpZCBpbnRlZ2VyIHdpZHRoICgke2V9KTogJHtyfWApfX07ZnVuY3Rpb24gcmUocixlLHQpe3Q+Pj49MCxLcihyPj4+PTAse25hbWU6ZT1ZcihlPj4+MCksZnJvbVdpcmVUeXBlOnI9PnIsdG9XaXJlVHlwZTpmdW5jdGlvbihyLGUpe2lmKFwiYmlnaW50XCIhPXR5cGVvZiBlJiZcIm51bWJlclwiIT10eXBlb2YgZSl0aHJvdyBlPW51bGw9PT1lP1wibnVsbFwiOlwib2JqZWN0XCI9PShyPXR5cGVvZiBlKXx8XCJhcnJheVwiPT09cnx8XCJmdW5jdGlvblwiPT09cj9lLnRvU3RyaW5nKCk6XCJcIitlLG5ldyBUeXBlRXJyb3IoYENhbm5vdCBjb252ZXJ0IFwiJHtlfVwiIHRvICR7dGhpcy5uYW1lfWApO3JldHVyblwibnVtYmVyXCI9PXR5cGVvZiBlJiYoZT1CaWdJbnQoZSkpLGV9LERiOmVlLHJlYWRWYWx1ZUZyb21Qb2ludGVyOlpyKGUsdCwtMT09ZS5pbmRleE9mKFwidVwiKSksRWI6bnVsbH0pfXZhciBlZT04O2Z1bmN0aW9uIHRlKHIsZSx0LG4pe0tyKHI+Pj49MCx7bmFtZTplPVlyKGU+Pj4wKSxmcm9tV2lyZVR5cGU6ZnVuY3Rpb24ocil7cmV0dXJuISFyfSx0b1dpcmVUeXBlOmZ1bmN0aW9uKHIsZSl7cmV0dXJuIGU/dDpufSxEYjplZSxyZWFkVmFsdWVGcm9tUG9pbnRlcjpmdW5jdGlvbihyKXtyZXR1cm4gdGhpcy5mcm9tV2lyZVR5cGUoQigpW3I+Pj4wXSl9LEViOm51bGx9KX12YXIgbmU9W10sYWU9W107ZnVuY3Rpb24gb2Uocil7OTwocj4+Pj0wKSYmMD09LS1hZVtyKzFdJiYoYWVbcl09dm9pZCAwLG5lLnB1c2gocikpfXZhciBpZT1yPT57aWYoIXIpdGhyb3cgbmV3IFZyKFwiQ2Fubm90IHVzZSBkZWxldGVkIHZhbC4gaGFuZGxlID0gXCIrcik7cmV0dXJuIGFlW3JdfSx1ZT1yPT57c3dpdGNoKHIpe2Nhc2Ugdm9pZCAwOnJldHVybiAyO2Nhc2UgbnVsbDpyZXR1cm4gNDtjYXNlITA6cmV0dXJuIDY7Y2FzZSExOnJldHVybiA4O2RlZmF1bHQ6Y29uc3QgZT1uZS5wb3AoKXx8YWUubGVuZ3RoO3JldHVybiBhZVtlXT1yLGFlW2UrMV09MSxlfX07ZnVuY3Rpb24gc2Uocil7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKFUoKVtyPj4+Mj4+PjBdKX12YXIgZmU9e25hbWU6XCJlbXNjcmlwdGVuOjp2YWxcIixmcm9tV2lyZVR5cGU6cj0+e3ZhciBlPWllKHIpO3JldHVybiBvZShyKSxlfSx0b1dpcmVUeXBlOihyLGUpPT51ZShlKSxEYjplZSxyZWFkVmFsdWVGcm9tUG9pbnRlcjpzZSxFYjpudWxsfTtmdW5jdGlvbiBiZShyKXtyZXR1cm4gS3Iocj4+PjAsZmUpfXZhciBtZT0ocixlKT0+e3N3aXRjaChlKXtjYXNlIDQ6cmV0dXJuIGZ1bmN0aW9uKHIpe3JldHVybiB0aGlzLmZyb21XaXJlVHlwZSgkKClbcj4+PjI+Pj4wXSl9O2Nhc2UgODpyZXR1cm4gZnVuY3Rpb24ocil7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKGooKVtyPj4+Mz4+PjBdKX07ZGVmYXVsdDp0aHJvdyBuZXcgVHlwZUVycm9yKGBpbnZhbGlkIGZsb2F0IHdpZHRoICgke2V9KTogJHtyfWApfX07ZnVuY3Rpb24gbGUocixlLHQpe3Q+Pj49MCxLcihyPj4+PTAse25hbWU6ZT1ZcihlPj4+MCksZnJvbVdpcmVUeXBlOnI9PnIsdG9XaXJlVHlwZToocixlKT0+ZSxEYjplZSxyZWFkVmFsdWVGcm9tUG9pbnRlcjptZShlLHQpLEViOm51bGx9KX1mdW5jdGlvbiBjZShyLGUsdCxuLGEpe2lmKHI+Pj49MCx0Pj4+PTAsZT1ZcihlPj4+MCksLTE9PT1hJiYoYT00Mjk0OTY3Mjk1KSxhPXI9PnIsMD09PW4pe3ZhciBvPTMyLTgqdDthPXI9PnI8PG8+Pj5vfXZhciBpPWUuaW5jbHVkZXMoXCJ1bnNpZ25lZFwiKT9mdW5jdGlvbihyLGUpe3JldHVybiBlPj4+MH06ZnVuY3Rpb24ocixlKXtyZXR1cm4gZX07S3Iocix7bmFtZTplLGZyb21XaXJlVHlwZTphLHRvV2lyZVR5cGU6aSxEYjplZSxyZWFkVmFsdWVGcm9tUG9pbnRlcjpacihlLHQsMCE9PW4pLEViOm51bGx9KX1mdW5jdGlvbiBkZShyLGUsdCl7ZnVuY3Rpb24gbihyKXt2YXIgZT1VKClbcj4+PjI+Pj4wXTtyZXR1cm4gcj1VKClbcis0Pj4+Mj4+PjBdLG5ldyBhKEYoKS5idWZmZXIscixlKX12YXIgYT1bSW50OEFycmF5LFVpbnQ4QXJyYXksSW50MTZBcnJheSxVaW50MTZBcnJheSxJbnQzMkFycmF5LFVpbnQzMkFycmF5LEZsb2F0MzJBcnJheSxGbG9hdDY0QXJyYXksQmlnSW50NjRBcnJheSxCaWdVaW50NjRBcnJheV1bZV07S3Iocj4+Pj0wLHtuYW1lOnQ9WXIodD4+PjApLGZyb21XaXJlVHlwZTpuLERiOmVlLHJlYWRWYWx1ZUZyb21Qb2ludGVyOm59LHtUYjohMH0pfWZ1bmN0aW9uIHBlKHIsZSl7S3Iocj4+Pj0wLHtuYW1lOmU9WXIoZT4+PjApLGZyb21XaXJlVHlwZTpmdW5jdGlvbihyKXtmb3IodmFyIGUsdD1VKClbcj4+PjI+Pj4wXSxuPXIrNCxhPW4sbz0wO288PXQ7KytvKXt2YXIgaT1uK287byE9dCYmMCE9QigpW2k+Pj4wXXx8KGE9U3IoYSxpLWEpLHZvaWQgMD09PWU/ZT1hOihlKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDApLGUrPWEpLGE9aSsxKX1yZXR1cm4gZG4ociksZX0sdG9XaXJlVHlwZTpmdW5jdGlvbihyLGUpe2UgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciYmKGU9bmV3IFVpbnQ4QXJyYXkoZSkpO3ZhciB0PVwic3RyaW5nXCI9PXR5cGVvZiBlO2lmKCEodHx8ZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXl8fGUgaW5zdGFuY2VvZiBVaW50OENsYW1wZWRBcnJheXx8ZSBpbnN0YW5jZW9mIEludDhBcnJheSkpdGhyb3cgbmV3IFZyKFwiQ2Fubm90IHBhc3Mgbm9uLXN0cmluZyB0byBzdGQ6OnN0cmluZ1wiKTt2YXIgbj10P1JyKGUpOmUubGVuZ3RoLGE9cG4oNCtuKzEpLG89YSs0O2lmKFUoKVthPj4+Mj4+PjBdPW4sdClNcihlLG8sbisxKTtlbHNlIGlmKHQpZm9yKHQ9MDt0PG47Kyt0KXt2YXIgaT1lLmNoYXJDb2RlQXQodCk7aWYoMjU1PGkpdGhyb3cgZG4oYSksbmV3IFZyKFwiU3RyaW5nIGhhcyBVVEYtMTYgY29kZSB1bml0cyB0aGF0IGRvIG5vdCBmaXQgaW4gOCBiaXRzXCIpO0IoKVtvK3Q+Pj4wXT1pfWVsc2UgZm9yKHQ9MDt0PG47Kyt0KUIoKVtvK3Q+Pj4wXT1lW3RdO3JldHVybiBudWxsIT09ciYmci5wdXNoKGRuLGEpLGF9LERiOmVlLHJlYWRWYWx1ZUZyb21Qb2ludGVyOnNlLEViKHIpe2RuKHIpfX0pfXZhciB5ZT1cInVuZGVmaW5lZFwiIT10eXBlb2YgVGV4dERlY29kZXI/bmV3IFRleHREZWNvZGVyKFwidXRmLTE2bGVcIik6dm9pZCAwLGhlPShyLGUpPT57Zm9yKHZhciB0PXI+PjEsbj10K2UvMjshKHQ+PW4pJiZHKClbdD4+PjBdOykrK3Q7aWYoMzI8KHQ8PD0xKS1yJiZ5ZSlyZXR1cm4geWUuZGVjb2RlKEIoKS5zbGljZShyLHQpKTtmb3IodD1cIlwiLG49MDshKG4+PWUvMik7KytuKXt2YXIgYT1JKClbcisyKm4+Pj4xPj4+MF07aWYoMD09YSlicmVhazt0Kz1TdHJpbmcuZnJvbUNoYXJDb2RlKGEpfXJldHVybiB0fSx2ZT0ocixlLHQpPT57aWYodD8/PTIxNDc0ODM2NDcsMj50KXJldHVybiAwO3ZhciBuPWU7dD0odC09Mik8MipyLmxlbmd0aD90LzI6ci5sZW5ndGg7Zm9yKHZhciBhPTA7YTx0OysrYSl7dmFyIG89ci5jaGFyQ29kZUF0KGEpO0koKVtlPj4+MT4+PjBdPW8sZSs9Mn1yZXR1cm4gSSgpW2U+Pj4xPj4+MF09MCxlLW59LGdlPXI9PjIqci5sZW5ndGgsTmU9KHIsZSk9Pntmb3IodmFyIHQ9MCxuPVwiXCI7ISh0Pj1lLzQpOyl7dmFyIGE9TCgpW3IrNCp0Pj4+Mj4+PjBdO2lmKDA9PWEpYnJlYWs7Kyt0LDY1NTM2PD1hPyhhLT02NTUzNixuKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGE+PjEwLDU2MzIwfDEwMjMmYSkpOm4rPVN0cmluZy5mcm9tQ2hhckNvZGUoYSl9cmV0dXJuIG59LGtlPShyLGUsdCk9PntpZihlPj4+PTAsdD8/PTIxNDc0ODM2NDcsND50KXJldHVybiAwO3ZhciBuPWU7dD1uK3QtNDtmb3IodmFyIGE9MDthPHIubGVuZ3RoOysrYSl7dmFyIG89ci5jaGFyQ29kZUF0KGEpO2lmKDU1Mjk2PD1vJiY1NzM0Mz49byYmKG89NjU1MzYrKCgxMDIzJm8pPDwxMCl8MTAyMyZyLmNoYXJDb2RlQXQoKythKSksTCgpW2U+Pj4yPj4+MF09bywoZSs9NCkrND50KWJyZWFrfXJldHVybiBMKClbZT4+PjI+Pj4wXT0wLGUtbn0sd2U9cj0+e2Zvcih2YXIgZT0wLHQ9MDt0PHIubGVuZ3RoOysrdCl7dmFyIG49ci5jaGFyQ29kZUF0KHQpOzU1Mjk2PD1uJiY1NzM0Mz49biYmKyt0LGUrPTR9cmV0dXJuIGV9O2Z1bmN0aW9uIEFlKHIsZSx0KXtpZihyPj4+PTAsZT4+Pj0wLHQ9WXIodD4+Pj0wKSwyPT09ZSl2YXIgbj1oZSxhPXZlLG89Z2UsaT1yPT5HKClbcj4+PjE+Pj4wXTtlbHNlIDQ9PT1lJiYobj1OZSxhPWtlLG89d2UsaT1yPT5VKClbcj4+PjI+Pj4wXSk7S3Iocix7bmFtZTp0LGZyb21XaXJlVHlwZTpyPT57Zm9yKHZhciB0LGE9VSgpW3I+Pj4yPj4+MF0sbz1yKzQsdT0wO3U8PWE7Kyt1KXt2YXIgcz1yKzQrdSplO3UhPWEmJjAhPWkocyl8fChvPW4obyxzLW8pLHZvaWQgMD09PXQ/dD1vOih0Kz1TdHJpbmcuZnJvbUNoYXJDb2RlKDApLHQrPW8pLG89cytlKX1yZXR1cm4gZG4ociksdH0sdG9XaXJlVHlwZToocixuKT0+e2lmKFwic3RyaW5nXCIhPXR5cGVvZiBuKXRocm93IG5ldyBWcihgQ2Fubm90IHBhc3Mgbm9uLXN0cmluZyB0byBDKysgc3RyaW5nIHR5cGUgJHt0fWApO3ZhciBpPW8obiksdT1wbig0K2krZSk7cmV0dXJuIFUoKVt1Pj4+Mj4+PjBdPWkvZSxhKG4sdSs0LGkrZSksbnVsbCE9PXImJnIucHVzaChkbix1KSx1fSxEYjplZSxyZWFkVmFsdWVGcm9tUG9pbnRlcjpzZSxFYihyKXtkbihyKX19KX1mdW5jdGlvbiBDZShyLGUpe0tyKHI+Pj49MCx7VWI6ITAsbmFtZTplPVlyKGU+Pj4wKSxEYjowLGZyb21XaXJlVHlwZTooKT0+e30sdG9XaXJlVHlwZTooKT0+e319KX1mdW5jdGlvbiBfZShyKXt5bihyPj4+MCwhdSwxLCFpLDEzMTA3MiwhMSksdnIoKX12YXIgT2U9cj0+e2lmKCFEKXRyeXtpZihyKCksISgwPHNyKSl0cnl7cz9ObihBKTpscihBKX1jYXRjaChyKXtyIGluc3RhbmNlb2YgYXJ8fFwidW53aW5kXCI9PXJ8fHAoMCxyKX19Y2F0Y2gocil7ciBpbnN0YW5jZW9mIGFyfHxcInVud2luZFwiPT1yfHxwKDAscil9fTtmdW5jdGlvbiBUZShyKXtyPj4+PTAsXCJmdW5jdGlvblwiPT10eXBlb2YgQXRvbWljcy5rYyYmKEF0b21pY3Mua2MoTCgpLHI+Pj4yLHIpLnZhbHVlLnRoZW4oV2UpLHIrPTEyOCxBdG9taWNzLnN0b3JlKEwoKSxyPj4+MiwxKSl9dmFyIFdlPSgpPT57dmFyIHI9Y24oKTtyJiYoVGUociksT2Uod24pKX07ZnVuY3Rpb24gU2UocixlKXsocj4+Pj0wKT09ZT4+PjA/c2V0VGltZW91dChXZSk6cz9wb3N0TWVzc2FnZSh7SGI6cixDYjpcImNoZWNrTWFpbGJveFwifSk6KHI9eXJbcl0pJiZyLnBvc3RNZXNzYWdlKHtDYjpcImNoZWNrTWFpbGJveFwifSl9dmFyIEVlPVtdO2Z1bmN0aW9uIHhlKHIsZSx0LG4sYSl7Zm9yKGU+Pj49MCxuLz0yLEVlLmxlbmd0aD1uLHQ9YT4+PjA+Pj4zLGE9MDthPG47YSsrKUVlW2FdPXhbdCsyKmFdP3hbdCsyKmErMV06aigpW3QrMiphKzE+Pj4wXTtyZXR1cm4oZT9lcltlXTpibltyXSkoLi4uRWUpfXZhciBSZT0oKT0+e3NyPTB9O2Z1bmN0aW9uIE1lKHIpe3I+Pj49MCxzP3Bvc3RNZXNzYWdlKHtDYjpcImNsZWFudXBUaHJlYWRcIixpYzpyfSk6aHIoeXJbcl0pfWZ1bmN0aW9uIEhlKHIpe312YXIgRGU9KHIsZSk9Pnt2YXIgdD1RcltyXTtpZih2b2lkIDA9PT10KXRocm93IHI9bW4ociksdD1ZcihyKSxkbihyKSxuZXcgVnIoYCR7ZX0gaGFzIHVua25vd24gdHlwZSAke3R9YCk7cmV0dXJuIHR9LFBlPShyLGUsdCk9Pnt2YXIgbj1bXTtyZXR1cm4gcj1yLnRvV2lyZVR5cGUobix0KSxuLmxlbmd0aCYmKFUoKVtlPj4+Mj4+PjBdPXVlKG4pKSxyfTtmdW5jdGlvbiBGZShyLGUsdCl7cmV0dXJuIGU+Pj49MCx0Pj4+PTAscj1pZShyPj4+MCksZT1EZShlLFwiZW12YWw6OmFzXCIpLFBlKGUsdCxyKX1mdW5jdGlvbiBCZShyLGUpe3JldHVybiBlPj4+PTAscj1pZShyPj4+MCksKGU9RGUoZSxcImVtdmFsOjphc1wiKSkudG9XaXJlVHlwZShudWxsLHIpfXZhciBJZT1yPT57dHJ5e3IoKX1jYXRjaChyKXtaKHIpfX0sR2U9MCxMZT1udWxsLFVlPTAsJGU9W10samU9e30semU9e30sVmU9MCxxZT1udWxsLFllPVtdO2Z1bmN0aW9uIEplKHIpe3JldHVybiBmdW5jdGlvbihyKXtpZighRCl7aWYoMD09PUdlKXt2YXIgZT0hMSx0PSExO3IoKChyPTApPT57aWYoIUQmJihVZT1yLGU9ITAsdCkpe0dlPTIsSWUoKCgpPT5FbihMZSkpKSxcInVuZGVmaW5lZFwiIT10eXBlb2YgTWFpbkxvb3AmJk1haW5Mb29wLlFiJiZNYWluTG9vcC5yZXN1bWUoKSxyPSExO3RyeXt2YXIgbj1mdW5jdGlvbigpe3ZhciByPUwoKVtMZSs4Pj4+Mj4+PjBdO3JldHVybiByPWZuW3plW3JdXSwtLXNyLHIoKX0oKX1jYXRjaChlKXtuPWUscj0hMH12YXIgYT0hMTtpZighTGUpe3ZhciBvPXFlO28mJihxZT1udWxsLChyP28ucmVqZWN0Om8ucmVzb2x2ZSkobiksYT0hMCl9aWYociYmIWEpdGhyb3cgbn19KSksdD0hMCxlfHwoR2U9MSxMZT1mdW5jdGlvbigpe3ZhciByPXBuKDY1NTQ4KSxlPXIrMTI7VSgpW3I+Pj4yPj4+MF09ZSxVKClbcis0Pj4+Mj4+PjBdPWUrNjU1MzYsZT0kZVswXTt2YXIgdD1qZVtlXTtyZXR1cm4gdm9pZCAwPT09dCYmKHQ9VmUrKyxqZVtlXT10LHplW3RdPWUpLGU9dCxMKClbcis4Pj4+Mj4+PjBdPWUscn0oKSxcInVuZGVmaW5lZFwiIT10eXBlb2YgTWFpbkxvb3AmJk1haW5Mb29wLlFiJiZNYWluTG9vcC5wYXVzZSgpLEllKCgoKT0+V24oTGUpKSkpfWVsc2UgMj09PUdlPyhHZT0wLEllKHhuKSxkbihMZSksTGU9bnVsbCxZZS5mb3JFYWNoKE9lKSk6WihgaW52YWxpZCBzdGF0ZTogJHtHZX1gKTtyZXR1cm4gVWV9fSgoZT0+e3IoKS50aGVuKGUpfSkpfWZ1bmN0aW9uIFFlKHIpe3JldHVybiByPj4+PTAsSmUoKGFzeW5jKCk9Pnt2YXIgZT1hd2FpdCBpZShyKTtyZXR1cm4gdWUoZSl9KSl9dmFyIFhlPVtdO2Z1bmN0aW9uIEtlKHIsZSx0LG4pe3JldHVybiB0Pj4+PTAsbj4+Pj0wLChyPVhlW3I+Pj4wXSkobnVsbCxlPWllKGU+Pj4wKSx0LG4pfXZhciBaZT17fSxydD1yPT57dmFyIGU9WmVbcl07cmV0dXJuIHZvaWQgMD09PWU/WXIocik6ZX07ZnVuY3Rpb24gZXQocixlLHQsbixhKXtyZXR1cm4gdD4+Pj0wLG4+Pj49MCxhPj4+PTAsKHI9WGVbcj4+PjBdKShlPWllKGU+Pj4wKSxlW3Q9cnQodCldLG4sYSl9ZnVuY3Rpb24gdHQocixlKXtyZXR1cm4gZT4+Pj0wLChyPWllKHI+Pj4wKSk9PWllKGUpfXZhciBudD0oKT0+XCJvYmplY3RcIj09dHlwZW9mIGdsb2JhbFRoaXM/Z2xvYmFsVGhpczpGdW5jdGlvbihcInJldHVybiB0aGlzXCIpKCk7ZnVuY3Rpb24gYXQocil7cmV0dXJuIDA9PShyPj4+PTApP3VlKG50KCkpOihyPXJ0KHIpLHVlKG50KClbcl0pKX12YXIgb3Q9cj0+e3ZhciBlPVhlLmxlbmd0aDtyZXR1cm4gWGUucHVzaChyKSxlfSxpdD0ocixlKT0+e2Zvcih2YXIgdD1BcnJheShyKSxuPTA7bjxyOysrbil0W25dPURlKFUoKVtlKzQqbj4+PjI+Pj4wXSxcInBhcmFtZXRlciBcIituKTtyZXR1cm4gdH0sdXQ9KHIsZSk9Pk9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwibmFtZVwiLHt2YWx1ZTpyfSk7ZnVuY3Rpb24gc3QocixlLHQpe3ZhciBuPShlPWl0KHIsZT4+PjApKS5zaGlmdCgpO3ItLTt2YXIgYT1cInJldHVybiBmdW5jdGlvbiAob2JqLCBmdW5jLCBkZXN0cnVjdG9yc1JlZiwgYXJncykge1xcblwiLG89MCxpPVtdOzA9PT10JiZpLnB1c2goXCJvYmpcIik7Zm9yKHZhciB1PVtcInJldFR5cGVcIl0scz1bbl0sZj0wO2Y8cjsrK2YpaS5wdXNoKFwiYXJnXCIrZiksdS5wdXNoKFwiYXJnVHlwZVwiK2YpLHMucHVzaChlW2ZdKSxhKz1gICB2YXIgYXJnJHtmfSA9IGFyZ1R5cGUke2Z9LnJlYWRWYWx1ZUZyb21Qb2ludGVyKGFyZ3Mke28/XCIrXCIrbzpcIlwifSk7XFxuYCxvKz1lW2ZdLkRiO3JldHVybiBhKz1gICB2YXIgcnYgPSAkezE9PT10P1wibmV3IGZ1bmNcIjpcImZ1bmMuY2FsbFwifSgke2kuam9pbihcIiwgXCIpfSk7XFxuYCxuLlVifHwodS5wdXNoKFwiZW12YWxfcmV0dXJuVmFsdWVcIikscy5wdXNoKFBlKSxhKz1cIiAgcmV0dXJuIGVtdmFsX3JldHVyblZhbHVlKHJldFR5cGUsIGRlc3RydWN0b3JzUmVmLCBydik7XFxuXCIpLHUucHVzaChhK1wifTtcXG5cIikscj1mdW5jdGlvbihyKXt2YXIgZT1GdW5jdGlvbjtpZighKGUgaW5zdGFuY2VvZiBGdW5jdGlvbikpdGhyb3cgbmV3IFR5cGVFcnJvcihgbmV3XyBjYWxsZWQgd2l0aCBjb25zdHJ1Y3RvciB0eXBlICR7dHlwZW9mIGV9IHdoaWNoIGlzIG5vdCBhIGZ1bmN0aW9uYCk7dmFyIHQ9dXQoZS5uYW1lfHxcInVua25vd25GdW5jdGlvbk5hbWVcIiwoZnVuY3Rpb24oKXt9KSk7cmV0dXJuIHQucHJvdG90eXBlPWUucHJvdG90eXBlLHQ9bmV3IHQsKHI9ZS5hcHBseSh0LHIpKWluc3RhbmNlb2YgT2JqZWN0P3I6dH0odSkoLi4ucyksdD1gbWV0aG9kQ2FsbGVyPCgke2UubWFwKChyPT5yLm5hbWUpKS5qb2luKFwiLCBcIil9KSA9PiAke24ubmFtZX0+YCxvdCh1dCh0LHIpKX1mdW5jdGlvbiBmdChyKXtyZXR1cm4gcj1ydChyPj4+MCksdWUoYVtyXSl9ZnVuY3Rpb24gYnQocixlKXtyZXR1cm4gZT4+Pj0wLHI9aWUocj4+PjApLGU9aWUoZSksdWUocltlXSl9ZnVuY3Rpb24gbXQocil7OTwocj4+Pj0wKSYmKGFlW3IrMV0rPTEpfWZ1bmN0aW9uIGx0KCl7cmV0dXJuIHVlKFtdKX1mdW5jdGlvbiBjdChyKXtyPWllKHI+Pj4wKTtmb3IodmFyIGU9QXJyYXkoci5sZW5ndGgpLHQ9MDt0PHIubGVuZ3RoO3QrKyllW3RdPXJbdF07cmV0dXJuIHVlKGUpfWZ1bmN0aW9uIGR0KHIpe3JldHVybiB1ZShydChyPj4+MCkpfWZ1bmN0aW9uIHB0KCl7cmV0dXJuIHVlKHt9KX1mdW5jdGlvbiB5dChyKXtmb3IodmFyIGU9aWUocj4+Pj0wKTtlLmxlbmd0aDspe3ZhciB0PWUucG9wKCk7ZS5wb3AoKSh0KX1vZShyKX1mdW5jdGlvbiBodChyLGUsdCl7ZT4+Pj0wLHQ+Pj49MCxyPWllKHI+Pj4wKSxlPWllKGUpLHQ9aWUodCkscltlXT10fWZ1bmN0aW9uIHZ0KHIsZSl7cmV0dXJuIGU+Pj49MCxyPShyPURlKHI+Pj4wLFwiX2VtdmFsX3Rha2VfdmFsdWVcIikpLnJlYWRWYWx1ZUZyb21Qb2ludGVyKGUpLHVlKHIpfWZ1bmN0aW9uIGd0KHIsZSl7cj0tOTAwNzE5OTI1NDc0MDk5Mj5yfHw5MDA3MTk5MjU0NzQwOTkyPHI/TmFOOk51bWJlcihyKSxlPj4+PTAscj1uZXcgRGF0ZSgxZTMqciksTCgpW2U+Pj4yPj4+MF09ci5nZXRVVENTZWNvbmRzKCksTCgpW2UrND4+PjI+Pj4wXT1yLmdldFVUQ01pbnV0ZXMoKSxMKClbZSs4Pj4+Mj4+PjBdPXIuZ2V0VVRDSG91cnMoKSxMKClbZSsxMj4+PjI+Pj4wXT1yLmdldFVUQ0RhdGUoKSxMKClbZSsxNj4+PjI+Pj4wXT1yLmdldFVUQ01vbnRoKCksTCgpW2UrMjA+Pj4yPj4+MF09ci5nZXRVVENGdWxsWWVhcigpLTE5MDAsTCgpW2UrMjQ+Pj4yPj4+MF09ci5nZXRVVENEYXkoKSxyPShyLmdldFRpbWUoKS1EYXRlLlVUQyhyLmdldFVUQ0Z1bGxZZWFyKCksMCwxLDAsMCwwLDApKS84NjRlNXwwLEwoKVtlKzI4Pj4+Mj4+PjBdPXJ9dmFyIE50PXI9PjA9PXIlNCYmKDAhPXIlMTAwfHwwPT1yJTQwMCksa3Q9WzAsMzEsNjAsOTEsMTIxLDE1MiwxODIsMjEzLDI0NCwyNzQsMzA1LDMzNV0sd3Q9WzAsMzEsNTksOTAsMTIwLDE1MSwxODEsMjEyLDI0MywyNzMsMzA0LDMzNF07ZnVuY3Rpb24gQXQocixlKXtyPS05MDA3MTk5MjU0NzQwOTkyPnJ8fDkwMDcxOTkyNTQ3NDA5OTI8cj9OYU46TnVtYmVyKHIpLGU+Pj49MCxyPW5ldyBEYXRlKDFlMypyKSxMKClbZT4+PjI+Pj4wXT1yLmdldFNlY29uZHMoKSxMKClbZSs0Pj4+Mj4+PjBdPXIuZ2V0TWludXRlcygpLEwoKVtlKzg+Pj4yPj4+MF09ci5nZXRIb3VycygpLEwoKVtlKzEyPj4+Mj4+PjBdPXIuZ2V0RGF0ZSgpLEwoKVtlKzE2Pj4+Mj4+PjBdPXIuZ2V0TW9udGgoKSxMKClbZSsyMD4+PjI+Pj4wXT1yLmdldEZ1bGxZZWFyKCktMTkwMCxMKClbZSsyND4+PjI+Pj4wXT1yLmdldERheSgpO3ZhciB0PShOdChyLmdldEZ1bGxZZWFyKCkpP2t0Ond0KVtyLmdldE1vbnRoKCldK3IuZ2V0RGF0ZSgpLTF8MDtMKClbZSsyOD4+PjI+Pj4wXT10LEwoKVtlKzM2Pj4+Mj4+PjBdPS02MCpyLmdldFRpbWV6b25lT2Zmc2V0KCksdD1uZXcgRGF0ZShyLmdldEZ1bGxZZWFyKCksNiwxKS5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBuPW5ldyBEYXRlKHIuZ2V0RnVsbFllYXIoKSwwLDEpLmdldFRpbWV6b25lT2Zmc2V0KCk7cj0wfCh0IT1uJiZyLmdldFRpbWV6b25lT2Zmc2V0KCk9PU1hdGgubWluKG4sdCkpLEwoKVtlKzMyPj4+Mj4+PjBdPXJ9ZnVuY3Rpb24gQ3Qocil7cj4+Pj0wO3ZhciBlPW5ldyBEYXRlKEwoKVtyKzIwPj4+Mj4+PjBdKzE5MDAsTCgpW3IrMTY+Pj4yPj4+MF0sTCgpW3IrMTI+Pj4yPj4+MF0sTCgpW3IrOD4+PjI+Pj4wXSxMKClbcis0Pj4+Mj4+PjBdLEwoKVtyPj4+Mj4+PjBdLDApLHQ9TCgpW3IrMzI+Pj4yPj4+MF0sbj1lLmdldFRpbWV6b25lT2Zmc2V0KCksYT1uZXcgRGF0ZShlLmdldEZ1bGxZZWFyKCksNiwxKS5nZXRUaW1lem9uZU9mZnNldCgpLG89bmV3IERhdGUoZS5nZXRGdWxsWWVhcigpLDAsMSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxpPU1hdGgubWluKG8sYSk7cmV0dXJuIDA+dD9MKClbciszMj4+PjI+Pj4wXT1OdW1iZXIoYSE9byYmaT09bik6MDx0IT0oaT09bikmJihhPU1hdGgubWF4KG8sYSksZS5zZXRUaW1lKGUuZ2V0VGltZSgpKzZlNCooKDA8dD9pOmEpLW4pKSksTCgpW3IrMjQ+Pj4yPj4+MF09ZS5nZXREYXkoKSx0PShOdChlLmdldEZ1bGxZZWFyKCkpP2t0Ond0KVtlLmdldE1vbnRoKCldK2UuZ2V0RGF0ZSgpLTF8MCxMKClbcisyOD4+PjI+Pj4wXT10LEwoKVtyPj4+Mj4+PjBdPWUuZ2V0U2Vjb25kcygpLEwoKVtyKzQ+Pj4yPj4+MF09ZS5nZXRNaW51dGVzKCksTCgpW3IrOD4+PjI+Pj4wXT1lLmdldEhvdXJzKCksTCgpW3IrMTI+Pj4yPj4+MF09ZS5nZXREYXRlKCksTCgpW3IrMTY+Pj4yPj4+MF09ZS5nZXRNb250aCgpLEwoKVtyKzIwPj4+Mj4+PjBdPWUuZ2V0WWVhcigpLHI9ZS5nZXRUaW1lKCksQmlnSW50KGlzTmFOKHIpPy0xOnIvMWUzKX1mdW5jdGlvbiBfdChyLGUsdCxuLGEsbyxpKXtyZXR1cm4gcz9mcigxNiwxLHIsZSx0LG4sYSxvLGkpOi01Mn1mdW5jdGlvbiBPdChyLGUsdCxuLGEsbyl7aWYocylyZXR1cm4gZnIoMTcsMSxyLGUsdCxuLGEsbyl9dmFyIFR0PXt9LFd0PSgpPT5wZXJmb3JtYW5jZS50aW1lT3JpZ2luK3BlcmZvcm1hbmNlLm5vdygpO2Z1bmN0aW9uIFN0KHIsZSl7aWYocylyZXR1cm4gZnIoMTgsMSxyLGUpO2lmKFR0W3JdJiYoY2xlYXJUaW1lb3V0KFR0W3JdLmlkKSxkZWxldGUgVHRbcl0pLCFlKXJldHVybiAwO3ZhciB0PXNldFRpbWVvdXQoKCgpPT57ZGVsZXRlIFR0W3JdLE9lKCgoKT0+a24ocixwZXJmb3JtYW5jZS50aW1lT3JpZ2luK3BlcmZvcm1hbmNlLm5vdygpKSkpfSksZSk7cmV0dXJuIFR0W3JdPXtpZDp0LHJjOmV9LDB9ZnVuY3Rpb24gRXQocixlLHQsbil7cj4+Pj0wLGU+Pj49MCx0Pj4+PTAsbj4+Pj0wO3ZhciBhPShuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKSxvPW5ldyBEYXRlKGEsMCwxKS5nZXRUaW1lem9uZU9mZnNldCgpO2E9bmV3IERhdGUoYSw2LDEpLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIGk9TWF0aC5tYXgobyxhKTtVKClbcj4+PjI+Pj4wXT02MCppLEwoKVtlPj4+Mj4+PjBdPU51bWJlcihvIT1hKSxyPShlPXI9Pnt2YXIgZT1NYXRoLmFicyhyKTtyZXR1cm5gVVRDJHswPD1yP1wiLVwiOlwiK1wifSR7U3RyaW5nKE1hdGguZmxvb3IoZS82MCkpLnBhZFN0YXJ0KDIsXCIwXCIpfSR7U3RyaW5nKGUlNjApLnBhZFN0YXJ0KDIsXCIwXCIpfWB9KShvKSxlPWUoYSksYTxvPyhNcihyLHQsMTcpLE1yKGUsbiwxNykpOihNcihyLG4sMTcpLE1yKGUsdCwxNykpfXZhciB4dD0oKT0+RGF0ZS5ub3coKSxSdD0xO2Z1bmN0aW9uIE10KHIsZSx0KXtpZighKDA8PXImJjM+PXIpKXJldHVybiAyODtpZigwPT09cilyPURhdGUubm93KCk7ZWxzZXtpZighUnQpcmV0dXJuIDUyO3I9cGVyZm9ybWFuY2UudGltZU9yaWdpbitwZXJmb3JtYW5jZS5ub3coKX1yZXR1cm4geFt0Pj4+MD4+PjNdPUJpZ0ludChNYXRoLnJvdW5kKDFlNipyKSksMH12YXIgSHQ9W10sRHQ9KHIsZSk9PntIdC5sZW5ndGg9MDtmb3IodmFyIHQ7dD1CKClbcisrPj4+MF07KXt2YXIgbj0xMDUhPXQ7ZSs9KG4mPTExMiE9dCkmJmUlOD80OjAsSHQucHVzaCgxMTI9PXQ/VSgpW2U+Pj4yPj4+MF06MTA2PT10P3hbZT4+PjNdOjEwNT09dD9MKClbZT4+PjI+Pj4wXTpqKClbZT4+PjM+Pj4wXSksZSs9bj84OjR9cmV0dXJuIEh0fTtmdW5jdGlvbiBQdChyLGUsdCl7cmV0dXJuIHI+Pj49MCxlPUR0KGU+Pj4wLHQ+Pj4wKSxlcltyXSguLi5lKX1mdW5jdGlvbiBGdChyLGUsdCl7cmV0dXJuIHI+Pj49MCxlPUR0KGU+Pj4wLHQ+Pj4wKSxlcltyXSguLi5lKX12YXIgQnQ9KCk9Pnt9O2Z1bmN0aW9uIEl0KHIsZSl7cmV0dXJuIE4oU3Iocj4+PjAsZT4+PjApKX12YXIgR3Q9KCk9Pnt0aHJvdyBzcis9MSxcInVud2luZFwifTtmdW5jdGlvbiBMdCgpe3JldHVybiA0Mjk0OTAxNzYwfXZhciBVdD0oKT0+bmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3k7ZnVuY3Rpb24gJHQoKXtyZXR1cm4gWihcIkNhbm5vdCB1c2UgZW1zY3JpcHRlbl9wY19nZXRfZnVuY3Rpb24gd2l0aG91dCAtc1VTRV9PRkZTRVRfQ09OVkVSVEVSXCIpLDB9ZnVuY3Rpb24ganQocil7cj4+Pj0wO3ZhciBlPUIoKS5sZW5ndGg7aWYocjw9ZXx8NDI5NDkwMTc2MDxyKXJldHVybiExO2Zvcih2YXIgdD0xOzQ+PXQ7dCo9Mil7dmFyIG49ZSooMSsuMi90KTtuPU1hdGgubWluKG4scisxMDA2NjMyOTYpO3I6e249KE1hdGgubWluKDQyOTQ5MDE3NjAsNjU1MzYqTWF0aC5jZWlsKE1hdGgubWF4KHIsbikvNjU1MzYpKS1rLmJ1ZmZlci5ieXRlTGVuZ3RoKzY1NTM1KS82NTUzNnwwO3RyeXtrLmdyb3cobikscSgpO3ZhciBhPTE7YnJlYWsgcn1jYXRjaChyKXt9YT12b2lkIDB9aWYoYSlyZXR1cm4hMH1yZXR1cm4hMX12YXIgenQ9KCk9PihaKFwiQ2Fubm90IHVzZSBjb252ZXJ0RnJhbWVUb1BDIChuZWVkZWQgYnkgX19idWlsdGluX3JldHVybl9hZGRyZXNzKSB3aXRob3V0IC1zVVNFX09GRlNFVF9DT05WRVJURVJcIiksMCksVnQ9e30scXQ9cj0+e3IuZm9yRWFjaCgocj0+e3ZhciBlPXp0KCk7ZSYmKFZ0W2VdPXIpfSkpfTtmdW5jdGlvbiBZdCgpe3ZhciByPUVycm9yKCkuc3RhY2sudG9TdHJpbmcoKS5zcGxpdChcIlxcblwiKTtyZXR1cm5cIkVycm9yXCI9PXJbMF0mJnIuc2hpZnQoKSxxdChyKSxWdC5NYj16dCgpLFZ0LmRjPXIsVnQuTWJ9ZnVuY3Rpb24gSnQocixlLHQpe2lmKHI+Pj49MCxlPj4+PTAsVnQuTWI9PXIpdmFyIG49VnQuZGM7ZWxzZVwiRXJyb3JcIj09KG49RXJyb3IoKS5zdGFjay50b1N0cmluZygpLnNwbGl0KFwiXFxuXCIpKVswXSYmbi5zaGlmdCgpLHF0KG4pO2Zvcih2YXIgYT0zO25bYV0mJnp0KCkhPXI7KSsrYTtmb3Iocj0wO3I8dCYmbltyK2FdOysrcilMKClbZSs0KnI+Pj4yPj4+MF09enQoKTtyZXR1cm4gcn12YXIgUXQsWHQ9e30sS3Q9KCk9PntpZighUXQpe3ZhciByLGU9e1VTRVI6XCJ3ZWJfdXNlclwiLExPR05BTUU6XCJ3ZWJfdXNlclwiLFBBVEg6XCIvXCIsUFdEOlwiL1wiLEhPTUU6XCIvaG9tZS93ZWJfdXNlclwiLExBTkc6KFwib2JqZWN0XCI9PXR5cGVvZiBuYXZpZ2F0b3ImJm5hdmlnYXRvci5sYW5ndWFnZXMmJm5hdmlnYXRvci5sYW5ndWFnZXNbMF18fFwiQ1wiKS5yZXBsYWNlKFwiLVwiLFwiX1wiKStcIi5VVEYtOFwiLF86XCIuL3RoaXMucHJvZ3JhbVwifTtmb3IociBpbiBYdCl2b2lkIDA9PT1YdFtyXT9kZWxldGUgZVtyXTplW3JdPVh0W3JdO3ZhciB0PVtdO2ZvcihyIGluIGUpdC5wdXNoKGAke3J9PSR7ZVtyXX1gKTtRdD10fXJldHVybiBRdH07ZnVuY3Rpb24gWnQocixlKXtpZihzKXJldHVybiBmcigxOSwxLHIsZSk7cj4+Pj0wLGU+Pj49MDt2YXIgdD0wO3JldHVybiBLdCgpLmZvckVhY2goKChuLGEpPT57dmFyIG89ZSt0O2ZvcihhPVUoKVtyKzQqYT4+PjI+Pj4wXT1vLG89MDtvPG4ubGVuZ3RoOysrbylGKClbYSsrPj4+MF09bi5jaGFyQ29kZUF0KG8pO0YoKVthPj4+MF09MCx0Kz1uLmxlbmd0aCsxfSkpLDB9ZnVuY3Rpb24gcm4ocixlKXtpZihzKXJldHVybiBmcigyMCwxLHIsZSk7cj4+Pj0wLGU+Pj49MDt2YXIgdD1LdCgpO1UoKVtyPj4+Mj4+PjBdPXQubGVuZ3RoO3ZhciBuPTA7cmV0dXJuIHQuZm9yRWFjaCgocj0+bis9ci5sZW5ndGgrMSkpLFUoKVtlPj4+Mj4+PjBdPW4sMH1mdW5jdGlvbiBlbihyKXtyZXR1cm4gcz9mcigyMSwxLHIpOjUyfWZ1bmN0aW9uIHRuKHIsZSx0LG4pe3JldHVybiBzP2ZyKDIyLDEscixlLHQsbik6NTJ9ZnVuY3Rpb24gbm4ocixlLHQsbil7cmV0dXJuIHM/ZnIoMjMsMSxyLGUsdCxuKTo3MH12YXIgYW49W251bGwsW10sW11dO2Z1bmN0aW9uIG9uKHIsZSx0LG4pe2lmKHMpcmV0dXJuIGZyKDI0LDEscixlLHQsbik7ZT4+Pj0wLHQ+Pj49MCxuPj4+PTA7Zm9yKHZhciBhPTAsbz0wO288dDtvKyspe3ZhciBpPVUoKVtlPj4+Mj4+PjBdLHU9VSgpW2UrND4+PjI+Pj4wXTtlKz04O2Zvcih2YXIgZj0wO2Y8dTtmKyspe3ZhciBiPUIoKVtpK2Y+Pj4wXSxtPWFuW3JdOzA9PT1ifHwxMD09PWI/KCgxPT09cj9nOk4pKFdyKG0pKSxtLmxlbmd0aD0wKTptLnB1c2goYil9YSs9dX1yZXR1cm4gVSgpW24+Pj4yPj4+MF09YSwwfXN8fGZ1bmN0aW9uKCl7Zm9yKHZhciByPWEubnVtVGhyZWFkcy0xO3ItLTspTnIoKTtpci51bnNoaWZ0KCgoKT0+e1ErKyxmdW5jdGlvbihyKXtzP3IoKTpQcm9taXNlLmFsbChjci5tYXAoZ3IpKS50aGVuKHIpfSgoKCk9PksoKSkpfSkpfSgpO2Zvcih2YXIgdW49QXJyYXkoMjU2KSxzbj0wOzI1Nj5zbjsrK3NuKXVuW3NuXT1TdHJpbmcuZnJvbUNoYXJDb2RlKHNuKTt6cj11bixWcj1hLkJpbmRpbmdFcnJvcj1jbGFzcyBleHRlbmRzIEVycm9ye2NvbnN0cnVjdG9yKHIpe3N1cGVyKHIpLHRoaXMubmFtZT1cIkJpbmRpbmdFcnJvclwifX0sYS5JbnRlcm5hbEVycm9yPWNsYXNzIGV4dGVuZHMgRXJyb3J7Y29uc3RydWN0b3Iocil7c3VwZXIociksdGhpcy5uYW1lPVwiSW50ZXJuYWxFcnJvclwifX0sYWUucHVzaCgwLDEsdm9pZCAwLDEsbnVsbCwxLCEwLDEsITEsMSksYS5jb3VudF9lbXZhbF9oYW5kbGVzPSgpPT5hZS5sZW5ndGgvMi01LW5lLmxlbmd0aDt2YXIgZm4sYm49W2JyLG1yLF9yLEVyLHhyLEhyLERyLFByLEZyLEJyLElyLEdyLExyLFVyLCRyLGpyLF90LE90LFN0LFp0LHJuLGVuLHRuLG5uLG9uXTshYXN5bmMgZnVuY3Rpb24oKXtmdW5jdGlvbiByKHIsZSl7cmV0dXJuIGZuPXIuZXhwb3J0cyxmbj1mdW5jdGlvbigpe3ZhciByPWZuLGU9e307Zm9yKGxldFt0LG5db2YgT2JqZWN0LmVudHJpZXMocikpZVt0XT1cImZ1bmN0aW9uXCI9PXR5cGVvZiBuPyguLi5yKT0+eyRlLnB1c2godCk7dHJ5e3JldHVybiBuKC4uLnIpfWZpbmFsbHl7RHx8KCRlLnBvcCgpLExlJiYxPT09R2UmJjA9PT0kZS5sZW5ndGgmJihHZT0wLHNyKz0xLEllKFNuKSxcInVuZGVmaW5lZFwiIT10eXBlb2YgRmliZXJzJiZGaWJlcnMuc2MoKSkpfX06bjtyZXR1cm4gZX0oKSxmbj1mdW5jdGlvbigpe3ZhciByPWZuLGU9cj0+ZT0+cihlKT4+PjAsdD1yPT4oKT0+cigpPj4+MDtyZXR1cm4ocj1PYmplY3QuYXNzaWduKHt9LHIpKS5FYT1lKHIuRWEpLHIuZ2I9dChyLmdiKSxyLmliPWUoci5pYiksci51Yj1lKHIudWIpLHIudmI9dChyLnZiKSxyLl9fY3hhX2dldF9leGNlcHRpb25fcHRyPWUoci5fX2N4YV9nZXRfZXhjZXB0aW9uX3B0cikscn0oKSxwci5wdXNoKGZuLmpiKSx3PWUsSygpLGZufVErKzt2YXIgZT1ycigpO2lmKGEuaW5zdGFudGlhdGVXYXNtKXJldHVybiBuZXcgUHJvbWlzZSgodD0+e2EuaW5zdGFudGlhdGVXYXNtKGUsKChlLG4pPT57cihlLG4pLHQoZS5leHBvcnRzKX0pKX0pKTtpZihzKXJldHVybiBuZXcgUHJvbWlzZSgoZT0+e3o9dD0+e3ZhciBuPW5ldyBXZWJBc3NlbWJseS5JbnN0YW5jZSh0LHJyKCkpO2UocihuLHQpKX19KSk7Sj8/PWEubG9jYXRlRmlsZT9hLmxvY2F0ZUZpbGU/YS5sb2NhdGVGaWxlKFwib3J0LXdhc20tc2ltZC10aHJlYWRlZC5qc2VwLndhc21cIix5KTp5K1wib3J0LXdhc20tc2ltZC10aHJlYWRlZC5qc2VwLndhc21cIjpuZXcgVVJMKFwib3J0LXdhc20tc2ltZC10aHJlYWRlZC5qc2VwLndhc21cIixpbXBvcnQubWV0YS51cmwpLmhyZWY7dHJ5e3ZhciB0PWF3YWl0IGFzeW5jIGZ1bmN0aW9uKHIpe3ZhciBlPUo7aWYoIUgmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nJiYhUChlKSl0cnl7dmFyIHQ9ZmV0Y2goZSx7Y3JlZGVudGlhbHM6XCJzYW1lLW9yaWdpblwifSk7cmV0dXJuIGF3YWl0IFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKHQscil9Y2F0Y2gocil7Tihgd2FzbSBzdHJlYW1pbmcgY29tcGlsZSBmYWlsZWQ6ICR7cn1gKSxOKFwiZmFsbGluZyBiYWNrIHRvIEFycmF5QnVmZmVyIGluc3RhbnRpYXRpb25cIil9cmV0dXJuIGFzeW5jIGZ1bmN0aW9uKHIsZSl7dHJ5e3ZhciB0PWF3YWl0IGFzeW5jIGZ1bmN0aW9uKHIpe2lmKCFIKXRyeXt2YXIgZT1hd2FpdCBsKHIpO3JldHVybiBuZXcgVWludDhBcnJheShlKX1jYXRjaHt9aWYocj09SiYmSClyPW5ldyBVaW50OEFycmF5KEgpO2Vsc2V7aWYoIWMpdGhyb3dcImJvdGggYXN5bmMgYW5kIHN5bmMgZmV0Y2hpbmcgb2YgdGhlIHdhc20gZmFpbGVkXCI7cj1jKHIpfXJldHVybiByfShyKTtyZXR1cm4gYXdhaXQgV2ViQXNzZW1ibHkuaW5zdGFudGlhdGUodCxlKX1jYXRjaChyKXtOKGBmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiAke3J9YCksWihyKX19KGUscil9KGUpO3JldHVybiByKHQuaW5zdGFuY2UsdC5tb2R1bGUpfWNhdGNoKHIpe3JldHVybiBuKHIpLFByb21pc2UucmVqZWN0KHIpfX0oKTt2YXIgbW49cj0+KG1uPWZuLkVhKShyKSxsbj0oKT0+KGxuPWZuLkZhKSgpO2EuX09ydEluaXQ9KHIsZSk9PihhLl9PcnRJbml0PWZuLkdhKShyLGUpLGEuX09ydEdldExhc3RFcnJvcj0ocixlKT0+KGEuX09ydEdldExhc3RFcnJvcj1mbi5IYSkocixlKSxhLl9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz0ocixlLHQsbixvLGksdSxzLGYsYik9PihhLl9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucz1mbi5JYSkocixlLHQsbixvLGksdSxzLGYsYiksYS5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9KHIsZSx0LG4sbyk9PihhLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcj1mbi5KYSkocixlLHQsbixvKSxhLl9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGU9KHIsZSx0KT0+KGEuX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZT1mbi5LYSkocixlLHQpLGEuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeT0ocixlLHQpPT4oYS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5PWZuLkxhKShyLGUsdCksYS5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPXI9PihhLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9Zm4uTWEpKHIpLGEuX09ydENyZWF0ZVNlc3Npb249KHIsZSx0KT0+KGEuX09ydENyZWF0ZVNlc3Npb249Zm4uTmEpKHIsZSx0KSxhLl9PcnRSZWxlYXNlU2Vzc2lvbj1yPT4oYS5fT3J0UmVsZWFzZVNlc3Npb249Zm4uT2EpKHIpLGEuX09ydEdldElucHV0T3V0cHV0Q291bnQ9KHIsZSx0KT0+KGEuX09ydEdldElucHV0T3V0cHV0Q291bnQ9Zm4uUGEpKHIsZSx0KSxhLl9PcnRHZXRJbnB1dE91dHB1dE1ldGFkYXRhPShyLGUsdCxuKT0+KGEuX09ydEdldElucHV0T3V0cHV0TWV0YWRhdGE9Zm4uUWEpKHIsZSx0LG4pLGEuX09ydEZyZWU9cj0+KGEuX09ydEZyZWU9Zm4uUmEpKHIpLGEuX09ydENyZWF0ZVRlbnNvcj0ocixlLHQsbixvLGkpPT4oYS5fT3J0Q3JlYXRlVGVuc29yPWZuLlNhKShyLGUsdCxuLG8saSksYS5fT3J0R2V0VGVuc29yRGF0YT0ocixlLHQsbixvKT0+KGEuX09ydEdldFRlbnNvckRhdGE9Zm4uVGEpKHIsZSx0LG4sbyksYS5fT3J0UmVsZWFzZVRlbnNvcj1yPT4oYS5fT3J0UmVsZWFzZVRlbnNvcj1mbi5VYSkociksYS5fT3J0Q3JlYXRlUnVuT3B0aW9ucz0ocixlLHQsbik9PihhLl9PcnRDcmVhdGVSdW5PcHRpb25zPWZuLlZhKShyLGUsdCxuKSxhLl9PcnRBZGRSdW5Db25maWdFbnRyeT0ocixlLHQpPT4oYS5fT3J0QWRkUnVuQ29uZmlnRW50cnk9Zm4uV2EpKHIsZSx0KSxhLl9PcnRSZWxlYXNlUnVuT3B0aW9ucz1yPT4oYS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9Zm4uWGEpKHIpLGEuX09ydENyZWF0ZUJpbmRpbmc9cj0+KGEuX09ydENyZWF0ZUJpbmRpbmc9Zm4uWWEpKHIpLGEuX09ydEJpbmRJbnB1dD0ocixlLHQpPT4oYS5fT3J0QmluZElucHV0PWZuLlphKShyLGUsdCksYS5fT3J0QmluZE91dHB1dD0ocixlLHQsbik9PihhLl9PcnRCaW5kT3V0cHV0PWZuLl9hKShyLGUsdCxuKSxhLl9PcnRDbGVhckJvdW5kT3V0cHV0cz1yPT4oYS5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9Zm4uJGEpKHIpLGEuX09ydFJlbGVhc2VCaW5kaW5nPXI9PihhLl9PcnRSZWxlYXNlQmluZGluZz1mbi5hYikociksYS5fT3J0UnVuV2l0aEJpbmRpbmc9KHIsZSx0LG4sbyk9PihhLl9PcnRSdW5XaXRoQmluZGluZz1mbi5iYikocixlLHQsbixvKSxhLl9PcnRSdW49KHIsZSx0LG4sbyxpLHUscyk9PihhLl9PcnRSdW49Zm4uY2IpKHIsZSx0LG4sbyxpLHUscyksYS5fT3J0RW5kUHJvZmlsaW5nPXI9PihhLl9PcnRFbmRQcm9maWxpbmc9Zm4uZGIpKHIpLGEuX0pzZXBPdXRwdXQ9KHIsZSx0KT0+KGEuX0pzZXBPdXRwdXQ9Zm4uZWIpKHIsZSx0KSxhLl9Kc2VwR2V0Tm9kZU5hbWU9cj0+KGEuX0pzZXBHZXROb2RlTmFtZT1mbi5mYikocik7dmFyIGNuPSgpPT4oY249Zm4uZ2IpKCksZG49YS5fZnJlZT1yPT4oZG49YS5fZnJlZT1mbi5oYikocikscG49YS5fbWFsbG9jPXI9Pihwbj1hLl9tYWxsb2M9Zm4uaWIpKHIpLHluPShyLGUsdCxuLGEsbyk9Pih5bj1mbi5sYikocixlLHQsbixhLG8pLGhuPSgpPT4oaG49Zm4ubWIpKCksdm49KHIsZSx0LG4sYSk9Pih2bj1mbi5uYikocixlLHQsbixhKSxnbj1yPT4oZ249Zm4ub2IpKHIpLE5uPXI9PihObj1mbi5wYikociksa249KHIsZSk9Pihrbj1mbi5xYikocixlKSx3bj0oKT0+KHduPWZuLnJiKSgpLEFuPShyLGUpPT4oQW49Zm4uc2IpKHIsZSksQ249cj0+KENuPWZuLnRiKShyKSxfbj1yPT4oX249Zm4udWIpKHIpLE9uPSgpPT4oT249Zm4udmIpKCksVG49YS5keW5DYWxsX2lpPShyLGUpPT4oVG49YS5keW5DYWxsX2lpPWZuLndiKShyLGUpLFduPXI9PihXbj1mbi54YikociksU249KCk9PihTbj1mbi55YikoKSxFbj1yPT4oRW49Zm4uemIpKHIpLHhuPSgpPT4oeG49Zm4uQWIpKCk7cmV0dXJuIGEuc3RhY2tTYXZlPSgpPT5PbigpLGEuc3RhY2tSZXN0b3JlPXI9PkNuKHIpLGEuc3RhY2tBbGxvYz1yPT5fbihyKSxhLnNldFZhbHVlPWZ1bmN0aW9uKHIsZSx0PVwiaThcIil7c3dpdGNoKHQuZW5kc1dpdGgoXCIqXCIpJiYodD1cIipcIiksdCl7Y2FzZVwiaTFcIjpjYXNlXCJpOFwiOkYoKVtyPj4+MF09ZTticmVhaztjYXNlXCJpMTZcIjpJKClbcj4+PjE+Pj4wXT1lO2JyZWFrO2Nhc2VcImkzMlwiOkwoKVtyPj4+Mj4+PjBdPWU7YnJlYWs7Y2FzZVwiaTY0XCI6eFtyPj4+M109QmlnSW50KGUpO2JyZWFrO2Nhc2VcImZsb2F0XCI6JCgpW3I+Pj4yPj4+MF09ZTticmVhaztjYXNlXCJkb3VibGVcIjpqKClbcj4+PjM+Pj4wXT1lO2JyZWFrO2Nhc2VcIipcIjpVKClbcj4+PjI+Pj4wXT1lO2JyZWFrO2RlZmF1bHQ6WihgaW52YWxpZCB0eXBlIGZvciBzZXRWYWx1ZTogJHt0fWApfX0sYS5nZXRWYWx1ZT1mdW5jdGlvbihyLGU9XCJpOFwiKXtzd2l0Y2goZS5lbmRzV2l0aChcIipcIikmJihlPVwiKlwiKSxlKXtjYXNlXCJpMVwiOmNhc2VcImk4XCI6cmV0dXJuIEYoKVtyPj4+MF07Y2FzZVwiaTE2XCI6cmV0dXJuIEkoKVtyPj4+MT4+PjBdO2Nhc2VcImkzMlwiOnJldHVybiBMKClbcj4+PjI+Pj4wXTtjYXNlXCJpNjRcIjpyZXR1cm4geFtyPj4+M107Y2FzZVwiZmxvYXRcIjpyZXR1cm4gJCgpW3I+Pj4yPj4+MF07Y2FzZVwiZG91YmxlXCI6cmV0dXJuIGooKVtyPj4+Mz4+PjBdO2Nhc2VcIipcIjpyZXR1cm4gVSgpW3I+Pj4yPj4+MF07ZGVmYXVsdDpaKGBpbnZhbGlkIHR5cGUgZm9yIGdldFZhbHVlOiAke2V9YCl9fSxhLlVURjhUb1N0cmluZz1TcixhLnN0cmluZ1RvVVRGOD1NcixhLmxlbmd0aEJ5dGVzVVRGOD1ScixmdW5jdGlvbiByKCl7aWYoMDxRKVg9cjtlbHNlIGlmKHMpdChhKSxZKCk7ZWxzZXtmb3IoOzA8aXIubGVuZ3RoOylpci5zaGlmdCgpKGEpOzA8UT9YPXI6KGEuY2FsbGVkUnVuPSEwLER8fChZKCksdChhKSkpfX0oKSxhLlBUUl9TSVpFPTQsb30pO2V4cG9ydCBkZWZhdWx0IGU7dmFyIHQ9Z2xvYmFsVGhpcy5zZWxmPy5uYW1lPy5zdGFydHNXaXRoKFwiZW0tcHRocmVhZFwiKTt0JiZlKCk7IiwgInZhciBlLHI9KGU9aW1wb3J0Lm1ldGEudXJsLGFzeW5jIGZ1bmN0aW9uKHI9e30pe3ZhciB0LG4sYT1yLGk9bmV3IFByb21pc2UoKChlLHIpPT57dD1lLG49cn0pKSxvPVwib2JqZWN0XCI9PXR5cGVvZiB3aW5kb3cscz1cInVuZGVmaW5lZFwiIT10eXBlb2YgV29ya2VyR2xvYmFsU2NvcGUsdT1zJiZzZWxmLm5hbWU/LnN0YXJ0c1dpdGgoXCJlbS1wdGhyZWFkXCIpO2EubW91bnRFeHRlcm5hbERhdGE9KGUscik9PntlLnN0YXJ0c1dpdGgoXCIuL1wiKSYmKGU9ZS5zdWJzdHJpbmcoMikpLChhLk5hfHwoYS5OYT1uZXcgTWFwKSkuc2V0KGUscil9LGEudW5tb3VudEV4dGVybmFsRGF0YT0oKT0+e2RlbGV0ZSBhLk5hfTt2YXIgZixjLGw9Z2xvYmFsVGhpcy5TaGFyZWRBcnJheUJ1ZmZlcj8/bmV3IFdlYkFzc2VtYmx5Lk1lbW9yeSh7aW5pdGlhbDowLG1heGltdW06MCxlYjohMH0pLmJ1ZmZlci5jb25zdHJ1Y3RvcixkPU9iamVjdC5hc3NpZ24oe30sYSksZz0oZSxyKT0+e3Rocm93IHJ9LG09XCJcIjsob3x8cykmJihzP209c2VsZi5sb2NhdGlvbi5ocmVmOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBkb2N1bWVudCYmZG9jdW1lbnQuY3VycmVudFNjcmlwdCYmKG09ZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmMpLGUmJihtPWUpLG09bS5zdGFydHNXaXRoKFwiYmxvYjpcIik/XCJcIjptLnNsaWNlKDAsbS5yZXBsYWNlKC9bPyNdLiovLFwiXCIpLmxhc3RJbmRleE9mKFwiL1wiKSsxKSxzJiYoYz1lPT57dmFyIHI9bmV3IFhNTEh0dHBSZXF1ZXN0O3JldHVybiByLm9wZW4oXCJHRVRcIixlLCExKSxyLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCIsci5zZW5kKG51bGwpLG5ldyBVaW50OEFycmF5KHIucmVzcG9uc2UpfSksZj1hc3luYyBlPT57aWYoVShlKSlyZXR1cm4gbmV3IFByb21pc2UoKChyLHQpPT57dmFyIG49bmV3IFhNTEh0dHBSZXF1ZXN0O24ub3BlbihcIkdFVFwiLGUsITApLG4ucmVzcG9uc2VUeXBlPVwiYXJyYXlidWZmZXJcIixuLm9ubG9hZD0oKT0+ezIwMD09bi5zdGF0dXN8fDA9PW4uc3RhdHVzJiZuLnJlc3BvbnNlP3Iobi5yZXNwb25zZSk6dChuLnN0YXR1cyl9LG4ub25lcnJvcj10LG4uc2VuZChudWxsKX0pKTt2YXIgcj1hd2FpdCBmZXRjaChlLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KTtpZihyLm9rKXJldHVybiByLmFycmF5QnVmZmVyKCk7dGhyb3cgRXJyb3Ioci5zdGF0dXMrXCIgOiBcIityLnVybCl9KTt2YXIgaD1jb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpLHY9Y29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpLHA9aCx3PXY7T2JqZWN0LmFzc2lnbihhLGQpLGQ9bnVsbDt2YXIgYixPLHksXyxULEEsTSxDLEUsUyxrLEQ9YS53YXNtQmluYXJ5LFI9ITEsVT1lPT5lLnN0YXJ0c1dpdGgoXCJmaWxlOi8vXCIpO2Z1bmN0aW9uIHgoKXtyZXR1cm4gYi5idWZmZXIhPV8uYnVmZmVyJiZIKCksX31mdW5jdGlvbiBQKCl7cmV0dXJuIGIuYnVmZmVyIT1fLmJ1ZmZlciYmSCgpLFR9ZnVuY3Rpb24gRigpe3JldHVybiBiLmJ1ZmZlciE9Xy5idWZmZXImJkgoKSxBfWZ1bmN0aW9uIEIoKXtyZXR1cm4gYi5idWZmZXIhPV8uYnVmZmVyJiZIKCksTX1mdW5jdGlvbiBXKCl7cmV0dXJuIGIuYnVmZmVyIT1fLmJ1ZmZlciYmSCgpLEN9ZnVuY3Rpb24gTigpe3JldHVybiBiLmJ1ZmZlciE9Xy5idWZmZXImJkgoKSxFfWZ1bmN0aW9uIEwoKXtyZXR1cm4gYi5idWZmZXIhPV8uYnVmZmVyJiZIKCksa31pZih1KXt2YXIgSSwkPSExO2Z1bmN0aW9uIEhyKGUpe3RyeXt2YXIgcj1lLmRhdGEsdD1yLk1hO2lmKFwibG9hZFwiPT09dCl7bGV0IGU9W107c2VsZi5vbm1lc3NhZ2U9cj0+ZS5wdXNoKHIpLHNlbGYuc3RhcnRXb3JrZXI9KCk9Pntwb3N0TWVzc2FnZSh7TWE6XCJsb2FkZWRcIn0pO2ZvcihsZXQgciBvZiBlKUhyKHIpO3NlbGYub25tZXNzYWdlPUhyfTtmb3IoY29uc3QgZSBvZiByLlRhKWFbZV0mJiFhW2VdLnByb3h5fHwoYVtlXT0oLi4ucik9Pntwb3N0TWVzc2FnZSh7TWE6XCJjYWxsSGFuZGxlclwiLFNhOmUsYXJnczpyfSl9LFwicHJpbnRcIj09ZSYmKHA9YVtlXSksXCJwcmludEVyclwiPT1lJiYodz1hW2VdKSk7Yj1yLlphLEgoKSxJKHIuJGEpfWVsc2UgaWYoXCJydW5cIj09PXQpe2hlKHIuTGEpLFJyKHIuTGEsMCwwLDEsMCwwKSxsZSgpLEhlKHIuTGEpLCR8fD0hMDt0cnl7cGUoci5WYSxyLlFhKX1jYXRjaChlKXtpZihcInVud2luZFwiIT1lKXRocm93IGV9fWVsc2VcInNldGltbWVkaWF0ZVwiIT09ci50YXJnZXQmJihcImNoZWNrTWFpbGJveFwiPT09dD8kJiZHZSgpOnQmJih3KGB3b3JrZXI6IHJlY2VpdmVkIHVua25vd24gY29tbWFuZCAke3R9YCksdyhyKSkpfWNhdGNoKGUpe3Rocm93IFVyKCksZX19dz1mdW5jdGlvbiguLi5lKXtlPWUuam9pbihcIiBcIiksY29uc29sZS5lcnJvcihlKX0sc2VsZi5hbGVydD1mdW5jdGlvbiguLi5lKXtwb3N0TWVzc2FnZSh7TWE6XCJhbGVydFwiLHRleHQ6ZS5qb2luKFwiIFwiKSxYYTpEcigpfSl9LHNlbGYub251bmhhbmRsZWRyZWplY3Rpb249ZT0+e3Rocm93IGUucmVhc29ufHxlfSxzZWxmLm9ubWVzc2FnZT1Icn1mdW5jdGlvbiBIKCl7dmFyIGU9Yi5idWZmZXI7YS5IRUFQOD1fPW5ldyBJbnQ4QXJyYXkoZSksYS5IRUFQMTY9QT1uZXcgSW50MTZBcnJheShlKSxhLkhFQVBVOD1UPW5ldyBVaW50OEFycmF5KGUpLGEuSEVBUFUxNj1uZXcgVWludDE2QXJyYXkoZSksYS5IRUFQMzI9TT1uZXcgSW50MzJBcnJheShlKSxhLkhFQVBVMzI9Qz1uZXcgVWludDMyQXJyYXkoZSksYS5IRUFQRjMyPUU9bmV3IEZsb2F0MzJBcnJheShlKSxhLkhFQVBGNjQ9az1uZXcgRmxvYXQ2NEFycmF5KGUpLGEuSEVBUDY0PVM9bmV3IEJpZ0ludDY0QXJyYXkoZSksYS5IRUFQVTY0PW5ldyBCaWdVaW50NjRBcnJheShlKX1mdW5jdGlvbiBHKCl7dT9zdGFydFdvcmtlcihhKTpTci5XKCl9dXx8KGI9bmV3IFdlYkFzc2VtYmx5Lk1lbW9yeSh7aW5pdGlhbDoyNTYsbWF4aW11bTo2NTUzNixzaGFyZWQ6ITB9KSxIKCkpO3ZhciBZLGo9MCx6PW51bGw7ZnVuY3Rpb24gVigpe2lmKDA9PS0taiYmeil7dmFyIGU9ejt6PW51bGwsZSgpfX1mdW5jdGlvbiBRKGUpe3Rocm93IHcoZT1cIkFib3J0ZWQoXCIrZStcIilcIiksUj0hMCxlPW5ldyBXZWJBc3NlbWJseS5SdW50aW1lRXJyb3IoZStcIi4gQnVpbGQgd2l0aCAtc0FTU0VSVElPTlMgZm9yIG1vcmUgaW5mby5cIiksbihlKSxlfWZ1bmN0aW9uIFgoKXtyZXR1cm57YTp7YjpiZSxEOnllLGU6TWUsVTpDZSx5OlNlLEE6a2UscjpEZSxTOlJlLEw6VWUsUjp4ZSxrOlBlLHo6RmUsdzpCZSxUOldlLHg6TmUsczpMZSxPOkllLHU6WWUsRTp6ZSxwOlZlLGk6UWUsTjpIZSxtOlhlLEg6cWUsSTplcixKOnJyLEY6dHIsRzpucixxOm9yLEs6c3IsQzpjcixWOmRyLGo6Z3Isbjp1cixsOm1yLHY6aHIsYzppcixkOnZyLHQ6cHIsUDp5cixROl9yLEI6aWUsZjpUcixoOkFyLE06TXIsZzpFcixhOmIsbzpuZX19fXZhciBxPXs0NjkwOTI6KGUscix0LG4saSk9PntpZih2b2lkIDA9PT1hfHwhYS5OYSlyZXR1cm4gMTtpZigoZT1BZShOdW1iZXIoZT4+PjApKSkuc3RhcnRzV2l0aChcIi4vXCIpJiYoZT1lLnN1YnN0cmluZygyKSksIShlPWEuTmEuZ2V0KGUpKSlyZXR1cm4gMjtpZihyPU51bWJlcihyPj4+MCksdD1OdW1iZXIodD4+PjApLG49TnVtYmVyKG4+Pj4wKSxyK3Q+ZS5ieXRlTGVuZ3RoKXJldHVybiAzO3RyeXtjb25zdCBvPWUuc3ViYXJyYXkocixyK3QpO3N3aXRjaChpKXtjYXNlIDA6UCgpLnNldChvLG4+Pj4wKTticmVhaztjYXNlIDE6YS5hYj9hLmFiKG4sbyk6YS5jYihuLG8pO2JyZWFrO2RlZmF1bHQ6cmV0dXJuIDR9cmV0dXJuIDB9Y2F0Y2h7cmV0dXJuIDR9fX07Y2xhc3MgSntuYW1lPVwiRXhpdFN0YXR1c1wiO2NvbnN0cnVjdG9yKGUpe3RoaXMubWVzc2FnZT1gUHJvZ3JhbSB0ZXJtaW5hdGVkIHdpdGggZXhpdCgke2V9KWAsdGhpcy5zdGF0dXM9ZX19dmFyIEs9ZT0+e2UudGVybWluYXRlKCksZS5vbm1lc3NhZ2U9KCk9Pnt9fSxaPVtdLGVlPWU9PnswPT1vZS5sZW5ndGgmJihnZSgpLGRlKG9lWzBdKSk7dmFyIHI9b2UucG9wKCk7aWYoIXIpcmV0dXJuIDY7c2UucHVzaChyKSxmZVtlLkxhXT1yLHIuTGE9ZS5MYTt2YXIgdD17TWE6XCJydW5cIixWYTplLlVhLFFhOmUuUWEsTGE6ZS5MYX07cmV0dXJuIHIucG9zdE1lc3NhZ2UodCxlLlJhKSwwfSxyZT0wLHRlPShlLHIsLi4udCk9Pntmb3IodmFyIG49Mip0Lmxlbmd0aCxhPSRyKCksaT1Jcig4Km4pLG89aT4+PjMscz0wO3M8dC5sZW5ndGg7cysrKXt2YXIgdT10W3NdO1wiYmlnaW50XCI9PXR5cGVvZiB1PyhTW28rMipzXT0xbixTW28rMipzKzFdPXUpOihTW28rMipzXT0wbixMKClbbysyKnMrMT4+PjBdPXUpfXJldHVybiBlPXhyKGUsMCxuLGksciksTHIoYSksZX07ZnVuY3Rpb24gbmUoZSl7aWYodSlyZXR1cm4gdGUoMCwxLGUpO2lmKHk9ZSwhKDA8cmUpKXtmb3IodmFyIHIgb2Ygc2UpSyhyKTtmb3IociBvZiBvZSlLKHIpO29lPVtdLHNlPVtdLGZlPXt9LFI9ITB9ZygwLG5ldyBKKGUpKX1mdW5jdGlvbiBhZShlKXtpZih1KXJldHVybiB0ZSgxLDAsZSk7aWUoZSl9dmFyIGllPWU9PntpZih5PWUsdSl0aHJvdyBhZShlKSxcInVud2luZFwiO25lKGUpfSxvZT1bXSxzZT1bXSx1ZT1bXSxmZT17fSxjZT1lPT57dmFyIHI9ZS5MYTtkZWxldGUgZmVbcl0sb2UucHVzaChlKSxzZS5zcGxpY2Uoc2UuaW5kZXhPZihlKSwxKSxlLkxhPTAsUHIocil9O2Z1bmN0aW9uIGxlKCl7dWUuZm9yRWFjaCgoZT0+ZSgpKSl9dmFyIGRlPWU9Pm5ldyBQcm9taXNlKChyPT57ZS5vbm1lc3NhZ2U9dD0+e3ZhciBuPSh0PXQuZGF0YSkuTWE7aWYodC5PYSYmdC5PYSE9RHIoKSl7dmFyIGk9ZmVbdC5PYV07aT9pLnBvc3RNZXNzYWdlKHQsdC5SYSk6dyhgSW50ZXJuYWwgZXJyb3IhIFdvcmtlciBzZW50IGEgbWVzc2FnZSBcIiR7bn1cIiB0byB0YXJnZXQgcHRocmVhZCAke3QuT2F9LCBidXQgdGhhdCB0aHJlYWQgbm8gbG9uZ2VyIGV4aXN0cyFgKX1lbHNlXCJjaGVja01haWxib3hcIj09PW4/R2UoKTpcInNwYXduVGhyZWFkXCI9PT1uP2VlKHQpOlwiY2xlYW51cFRocmVhZFwiPT09bj9jZShmZVt0LldhXSk6XCJsb2FkZWRcIj09PW4/KGUubG9hZGVkPSEwLHIoZSkpOlwiYWxlcnRcIj09PW4/YWxlcnQoYFRocmVhZCAke3QuWGF9OiAke3QudGV4dH1gKTpcInNldGltbWVkaWF0ZVwiPT09dC50YXJnZXQ/ZS5wb3N0TWVzc2FnZSh0KTpcImNhbGxIYW5kbGVyXCI9PT1uP2FbdC5TYV0oLi4udC5hcmdzKTpuJiZ3KGB3b3JrZXIgc2VudCBhbiB1bmtub3duIGNvbW1hbmQgJHtufWApfSxlLm9uZXJyb3I9ZT0+e3Rocm93IHcoYHdvcmtlciBzZW50IGFuIGVycm9yISAke2UuZmlsZW5hbWV9OiR7ZS5saW5lbm99OiAke2UubWVzc2FnZX1gKSxlfTt2YXIgdCxuPVtdO2Zvcih0IG9mW10pYS5wcm9wZXJ0eUlzRW51bWVyYWJsZSh0KSYmbi5wdXNoKHQpO2UucG9zdE1lc3NhZ2Uoe01hOlwibG9hZFwiLFRhOm4sWmE6YiwkYTpPfSl9KSk7ZnVuY3Rpb24gZ2UoKXt2YXIgZT1uZXcgV29ya2VyKCgoKT0+e2NvbnN0IGU9VVJMO3JldHVybiBpbXBvcnQubWV0YS51cmw+XCJmaWxlOlwiJiZpbXBvcnQubWV0YS51cmw8XCJmaWxlO1wiP25ldyBlKEJVSUxEX0RFRlMuQlVORExFX0ZJTEVOQU1FLGltcG9ydC5tZXRhLnVybCk6bmV3IFVSTChpbXBvcnQubWV0YS51cmwpfSkoKSx7dHlwZTpcIm1vZHVsZVwiLHdvcmtlckRhdGE6XCJlbS1wdGhyZWFkXCIsbmFtZTpcImVtLXB0aHJlYWRcIn0pO29lLnB1c2goZSl9dmFyIG1lLGhlPWU9PntIKCk7dmFyIHI9VygpW2UrNTI+Pj4yPj4+MF07ZT1XKClbZSs1Nj4+PjI+Pj4wXSxOcihyLHItZSksTHIocil9LHZlPVtdLHBlPShlLHIpPT57cmU9MDt2YXIgdD12ZVtlXTt0fHwoZT49dmUubGVuZ3RoJiYodmUubGVuZ3RoPWUrMSksdmVbZV09dD1tZS5nZXQoZSkpLGU9dChyKSwwPHJlP3k9ZTpGcihlKX07Y2xhc3Mgd2V7Y29uc3RydWN0b3IoZSl7dGhpcy5QYT1lLTI0fX1mdW5jdGlvbiBiZShlLHIsdCl7dmFyIG49bmV3IHdlKGU+Pj49MCk7dGhyb3cgcj4+Pj0wLHQ+Pj49MCxXKClbbi5QYSsxNj4+PjI+Pj4wXT0wLFcoKVtuLlBhKzQ+Pj4yPj4+MF09cixXKClbbi5QYSs4Pj4+Mj4+PjBdPXQsZX1mdW5jdGlvbiBPZShlLHIsdCxuKXtyZXR1cm4gdT90ZSgyLDEsZSxyLHQsbik6eWUoZSxyLHQsbil9ZnVuY3Rpb24geWUoZSxyLHQsbil7aWYoZT4+Pj0wLHQ+Pj49MCxuPj4+PTAsdm9pZCAwPT09bClyZXR1cm4gNjt2YXIgYT1bXTtyZXR1cm4gdSYmMD09PWEubGVuZ3RoP09lKGUscj4+Pj0wLHQsbik6KGU9e1VhOnQsTGE6ZSxRYTpuLFJhOmF9LHU/KGUuTWE9XCJzcGF3blRocmVhZFwiLHBvc3RNZXNzYWdlKGUsYSksMCk6ZWUoZSkpfXZhciBfZT1cInVuZGVmaW5lZFwiIT10eXBlb2YgVGV4dERlY29kZXI/bmV3IFRleHREZWNvZGVyOnZvaWQgMCxUZT0oZSxyPTAsdD1OYU4pPT57dmFyIG49KHI+Pj49MCkrdDtmb3IodD1yO2VbdF0mJiEodD49bik7KSsrdDtpZigxNjx0LXImJmUuYnVmZmVyJiZfZSlyZXR1cm4gX2UuZGVjb2RlKGUuYnVmZmVyIGluc3RhbmNlb2YgQXJyYXlCdWZmZXI/ZS5zdWJhcnJheShyLHQpOmUuc2xpY2Uocix0KSk7Zm9yKG49XCJcIjtyPHQ7KXt2YXIgYT1lW3IrK107aWYoMTI4JmEpe3ZhciBpPTYzJmVbcisrXTtpZigxOTI9PSgyMjQmYSkpbis9U3RyaW5nLmZyb21DaGFyQ29kZSgoMzEmYSk8PDZ8aSk7ZWxzZXt2YXIgbz02MyZlW3IrK107NjU1MzY+KGE9MjI0PT0oMjQwJmEpPygxNSZhKTw8MTJ8aTw8NnxvOig3JmEpPDwxOHxpPDwxMnxvPDw2fDYzJmVbcisrXSk/bis9U3RyaW5nLmZyb21DaGFyQ29kZShhKTooYS09NjU1MzYsbis9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxhPj4xMCw1NjMyMHwxMDIzJmEpKX19ZWxzZSBuKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGEpfXJldHVybiBufSxBZT0oZSxyKT0+KGU+Pj49MCk/VGUoUCgpLGUscik6XCJcIjtmdW5jdGlvbiBNZShlLHIsdCl7cmV0dXJuIHU/dGUoMywxLGUscix0KTowfWZ1bmN0aW9uIENlKGUscil7aWYodSlyZXR1cm4gdGUoNCwxLGUscil9dmFyIEVlPShlLHIsdCk9Pnt2YXIgbj1QKCk7aWYocj4+Pj0wLDA8dCl7dmFyIGE9cjt0PXIrdC0xO2Zvcih2YXIgaT0wO2k8ZS5sZW5ndGg7KytpKXt2YXIgbz1lLmNoYXJDb2RlQXQoaSk7aWYoNTUyOTY8PW8mJjU3MzQzPj1vJiYobz02NTUzNisoKDEwMjMmbyk8PDEwKXwxMDIzJmUuY2hhckNvZGVBdCgrK2kpKSwxMjc+PW8pe2lmKHI+PXQpYnJlYWs7bltyKys+Pj4wXT1vfWVsc2V7aWYoMjA0Nz49byl7aWYocisxPj10KWJyZWFrO25bcisrPj4+MF09MTkyfG8+PjZ9ZWxzZXtpZig2NTUzNT49byl7aWYocisyPj10KWJyZWFrO25bcisrPj4+MF09MjI0fG8+PjEyfWVsc2V7aWYociszPj10KWJyZWFrO25bcisrPj4+MF09MjQwfG8+PjE4LG5bcisrPj4+MF09MTI4fG8+PjEyJjYzfW5bcisrPj4+MF09MTI4fG8+PjYmNjN9bltyKys+Pj4wXT0xMjh8NjMmb319bltyPj4+MF09MCxlPXItYX1lbHNlIGU9MDtyZXR1cm4gZX07ZnVuY3Rpb24gU2UoZSxyKXtpZih1KXJldHVybiB0ZSg1LDEsZSxyKX1mdW5jdGlvbiBrZShlLHIsdCl7aWYodSlyZXR1cm4gdGUoNiwxLGUscix0KX1mdW5jdGlvbiBEZShlLHIsdCl7cmV0dXJuIHU/dGUoNywxLGUscix0KTowfWZ1bmN0aW9uIFJlKGUscil7aWYodSlyZXR1cm4gdGUoOCwxLGUscil9ZnVuY3Rpb24gVWUoZSxyLHQpe2lmKHUpcmV0dXJuIHRlKDksMSxlLHIsdCl9ZnVuY3Rpb24geGUoZSxyLHQsbil7aWYodSlyZXR1cm4gdGUoMTAsMSxlLHIsdCxuKX1mdW5jdGlvbiBQZShlLHIsdCxuKXtpZih1KXJldHVybiB0ZSgxMSwxLGUscix0LG4pfWZ1bmN0aW9uIEZlKGUscix0LG4pe2lmKHUpcmV0dXJuIHRlKDEyLDEsZSxyLHQsbil9ZnVuY3Rpb24gQmUoZSl7aWYodSlyZXR1cm4gdGUoMTMsMSxlKX1mdW5jdGlvbiBXZShlLHIpe2lmKHUpcmV0dXJuIHRlKDE0LDEsZSxyKX1mdW5jdGlvbiBOZShlLHIsdCl7aWYodSlyZXR1cm4gdGUoMTUsMSxlLHIsdCl9dmFyIExlPSgpPT5RKFwiXCIpO2Z1bmN0aW9uIEllKGUpe1JyKGU+Pj4wLCFzLDEsIW8sMTMxMDcyLCExKSxsZSgpfXZhciAkZT1lPT57aWYoIVIpdHJ5e2lmKGUoKSwhKDA8cmUpKXRyeXt1P0ZyKHkpOmllKHkpfWNhdGNoKGUpe2UgaW5zdGFuY2VvZiBKfHxcInVud2luZFwiPT1lfHxnKDAsZSl9fWNhdGNoKGUpe2UgaW5zdGFuY2VvZiBKfHxcInVud2luZFwiPT1lfHxnKDAsZSl9fTtmdW5jdGlvbiBIZShlKXtlPj4+PTAsXCJmdW5jdGlvblwiPT10eXBlb2YgQXRvbWljcy5ZYSYmKEF0b21pY3MuWWEoQigpLGU+Pj4yLGUpLnZhbHVlLnRoZW4oR2UpLGUrPTEyOCxBdG9taWNzLnN0b3JlKEIoKSxlPj4+MiwxKSl9dmFyIEdlPSgpPT57dmFyIGU9RHIoKTtlJiYoSGUoZSksJGUoV3IpKX07ZnVuY3Rpb24gWWUoZSxyKXsoZT4+Pj0wKT09cj4+PjA/c2V0VGltZW91dChHZSk6dT9wb3N0TWVzc2FnZSh7T2E6ZSxNYTpcImNoZWNrTWFpbGJveFwifSk6KGU9ZmVbZV0pJiZlLnBvc3RNZXNzYWdlKHtNYTpcImNoZWNrTWFpbGJveFwifSl9dmFyIGplPVtdO2Z1bmN0aW9uIHplKGUscix0LG4sYSl7Zm9yKHI+Pj49MCxuLz0yLGplLmxlbmd0aD1uLHQ9YT4+PjA+Pj4zLGE9MDthPG47YSsrKWplW2FdPVNbdCsyKmFdP1NbdCsyKmErMV06TCgpW3QrMiphKzE+Pj4wXTtyZXR1cm4ocj9xW3JdOmtyW2VdKSguLi5qZSl9dmFyIFZlPSgpPT57cmU9MH07ZnVuY3Rpb24gUWUoZSl7ZT4+Pj0wLHU/cG9zdE1lc3NhZ2Uoe01hOlwiY2xlYW51cFRocmVhZFwiLFdhOmV9KTpjZShmZVtlXSl9ZnVuY3Rpb24gWGUoZSl7fWZ1bmN0aW9uIHFlKGUscil7ZT0tOTAwNzE5OTI1NDc0MDk5Mj5lfHw5MDA3MTk5MjU0NzQwOTkyPGU/TmFOOk51bWJlcihlKSxyPj4+PTAsZT1uZXcgRGF0ZSgxZTMqZSksQigpW3I+Pj4yPj4+MF09ZS5nZXRVVENTZWNvbmRzKCksQigpW3IrND4+PjI+Pj4wXT1lLmdldFVUQ01pbnV0ZXMoKSxCKClbcis4Pj4+Mj4+PjBdPWUuZ2V0VVRDSG91cnMoKSxCKClbcisxMj4+PjI+Pj4wXT1lLmdldFVUQ0RhdGUoKSxCKClbcisxNj4+PjI+Pj4wXT1lLmdldFVUQ01vbnRoKCksQigpW3IrMjA+Pj4yPj4+MF09ZS5nZXRVVENGdWxsWWVhcigpLTE5MDAsQigpW3IrMjQ+Pj4yPj4+MF09ZS5nZXRVVENEYXkoKSxlPShlLmdldFRpbWUoKS1EYXRlLlVUQyhlLmdldFVUQ0Z1bGxZZWFyKCksMCwxLDAsMCwwLDApKS84NjRlNXwwLEIoKVtyKzI4Pj4+Mj4+PjBdPWV9dmFyIEplPWU9PjA9PWUlNCYmKDAhPWUlMTAwfHwwPT1lJTQwMCksS2U9WzAsMzEsNjAsOTEsMTIxLDE1MiwxODIsMjEzLDI0NCwyNzQsMzA1LDMzNV0sWmU9WzAsMzEsNTksOTAsMTIwLDE1MSwxODEsMjEyLDI0MywyNzMsMzA0LDMzNF07ZnVuY3Rpb24gZXIoZSxyKXtlPS05MDA3MTk5MjU0NzQwOTkyPmV8fDkwMDcxOTkyNTQ3NDA5OTI8ZT9OYU46TnVtYmVyKGUpLHI+Pj49MCxlPW5ldyBEYXRlKDFlMyplKSxCKClbcj4+PjI+Pj4wXT1lLmdldFNlY29uZHMoKSxCKClbcis0Pj4+Mj4+PjBdPWUuZ2V0TWludXRlcygpLEIoKVtyKzg+Pj4yPj4+MF09ZS5nZXRIb3VycygpLEIoKVtyKzEyPj4+Mj4+PjBdPWUuZ2V0RGF0ZSgpLEIoKVtyKzE2Pj4+Mj4+PjBdPWUuZ2V0TW9udGgoKSxCKClbcisyMD4+PjI+Pj4wXT1lLmdldEZ1bGxZZWFyKCktMTkwMCxCKClbcisyND4+PjI+Pj4wXT1lLmdldERheSgpO3ZhciB0PShKZShlLmdldEZ1bGxZZWFyKCkpP0tlOlplKVtlLmdldE1vbnRoKCldK2UuZ2V0RGF0ZSgpLTF8MDtCKClbcisyOD4+PjI+Pj4wXT10LEIoKVtyKzM2Pj4+Mj4+PjBdPS02MCplLmdldFRpbWV6b25lT2Zmc2V0KCksdD1uZXcgRGF0ZShlLmdldEZ1bGxZZWFyKCksNiwxKS5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBuPW5ldyBEYXRlKGUuZ2V0RnVsbFllYXIoKSwwLDEpLmdldFRpbWV6b25lT2Zmc2V0KCk7ZT0wfCh0IT1uJiZlLmdldFRpbWV6b25lT2Zmc2V0KCk9PU1hdGgubWluKG4sdCkpLEIoKVtyKzMyPj4+Mj4+PjBdPWV9ZnVuY3Rpb24gcnIoZSl7ZT4+Pj0wO3ZhciByPW5ldyBEYXRlKEIoKVtlKzIwPj4+Mj4+PjBdKzE5MDAsQigpW2UrMTY+Pj4yPj4+MF0sQigpW2UrMTI+Pj4yPj4+MF0sQigpW2UrOD4+PjI+Pj4wXSxCKClbZSs0Pj4+Mj4+PjBdLEIoKVtlPj4+Mj4+PjBdLDApLHQ9QigpW2UrMzI+Pj4yPj4+MF0sbj1yLmdldFRpbWV6b25lT2Zmc2V0KCksYT1uZXcgRGF0ZShyLmdldEZ1bGxZZWFyKCksNiwxKS5nZXRUaW1lem9uZU9mZnNldCgpLGk9bmV3IERhdGUoci5nZXRGdWxsWWVhcigpLDAsMSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxvPU1hdGgubWluKGksYSk7cmV0dXJuIDA+dD9CKClbZSszMj4+PjI+Pj4wXT1OdW1iZXIoYSE9aSYmbz09bik6MDx0IT0obz09bikmJihhPU1hdGgubWF4KGksYSksci5zZXRUaW1lKHIuZ2V0VGltZSgpKzZlNCooKDA8dD9vOmEpLW4pKSksQigpW2UrMjQ+Pj4yPj4+MF09ci5nZXREYXkoKSx0PShKZShyLmdldEZ1bGxZZWFyKCkpP0tlOlplKVtyLmdldE1vbnRoKCldK3IuZ2V0RGF0ZSgpLTF8MCxCKClbZSsyOD4+PjI+Pj4wXT10LEIoKVtlPj4+Mj4+PjBdPXIuZ2V0U2Vjb25kcygpLEIoKVtlKzQ+Pj4yPj4+MF09ci5nZXRNaW51dGVzKCksQigpW2UrOD4+PjI+Pj4wXT1yLmdldEhvdXJzKCksQigpW2UrMTI+Pj4yPj4+MF09ci5nZXREYXRlKCksQigpW2UrMTY+Pj4yPj4+MF09ci5nZXRNb250aCgpLEIoKVtlKzIwPj4+Mj4+PjBdPXIuZ2V0WWVhcigpLGU9ci5nZXRUaW1lKCksQmlnSW50KGlzTmFOKGUpPy0xOmUvMWUzKX1mdW5jdGlvbiB0cihlLHIsdCxuLGEsaSxvKXtyZXR1cm4gdT90ZSgxNiwxLGUscix0LG4sYSxpLG8pOi01Mn1mdW5jdGlvbiBucihlLHIsdCxuLGEsaSl7aWYodSlyZXR1cm4gdGUoMTcsMSxlLHIsdCxuLGEsaSl9dmFyIGFyPXt9LGlyPSgpPT5wZXJmb3JtYW5jZS50aW1lT3JpZ2luK3BlcmZvcm1hbmNlLm5vdygpO2Z1bmN0aW9uIG9yKGUscil7aWYodSlyZXR1cm4gdGUoMTgsMSxlLHIpO2lmKGFyW2VdJiYoY2xlYXJUaW1lb3V0KGFyW2VdLmlkKSxkZWxldGUgYXJbZV0pLCFyKXJldHVybiAwO3ZhciB0PXNldFRpbWVvdXQoKCgpPT57ZGVsZXRlIGFyW2VdLCRlKCgoKT0+QnIoZSxwZXJmb3JtYW5jZS50aW1lT3JpZ2luK3BlcmZvcm1hbmNlLm5vdygpKSkpfSkscik7cmV0dXJuIGFyW2VdPXtpZDp0LGZiOnJ9LDB9ZnVuY3Rpb24gc3IoZSxyLHQsbil7ZT4+Pj0wLHI+Pj49MCx0Pj4+PTAsbj4+Pj0wO3ZhciBhPShuZXcgRGF0ZSkuZ2V0RnVsbFllYXIoKSxpPW5ldyBEYXRlKGEsMCwxKS5nZXRUaW1lem9uZU9mZnNldCgpO2E9bmV3IERhdGUoYSw2LDEpLmdldFRpbWV6b25lT2Zmc2V0KCk7dmFyIG89TWF0aC5tYXgoaSxhKTtXKClbZT4+PjI+Pj4wXT02MCpvLEIoKVtyPj4+Mj4+PjBdPU51bWJlcihpIT1hKSxlPShyPWU9Pnt2YXIgcj1NYXRoLmFicyhlKTtyZXR1cm5gVVRDJHswPD1lP1wiLVwiOlwiK1wifSR7U3RyaW5nKE1hdGguZmxvb3Ioci82MCkpLnBhZFN0YXJ0KDIsXCIwXCIpfSR7U3RyaW5nKHIlNjApLnBhZFN0YXJ0KDIsXCIwXCIpfWB9KShpKSxyPXIoYSksYTxpPyhFZShlLHQsMTcpLEVlKHIsbiwxNykpOihFZShlLG4sMTcpLEVlKHIsdCwxNykpfXZhciB1cj0oKT0+RGF0ZS5ub3coKSxmcj0xO2Z1bmN0aW9uIGNyKGUscix0KXtpZighKDA8PWUmJjM+PWUpKXJldHVybiAyODtpZigwPT09ZSllPURhdGUubm93KCk7ZWxzZXtpZighZnIpcmV0dXJuIDUyO2U9cGVyZm9ybWFuY2UudGltZU9yaWdpbitwZXJmb3JtYW5jZS5ub3coKX1yZXR1cm4gU1t0Pj4+MD4+PjNdPUJpZ0ludChNYXRoLnJvdW5kKDFlNiplKSksMH12YXIgbHI9W107ZnVuY3Rpb24gZHIoZSxyLHQpe2U+Pj49MCxyPj4+PTAsdD4+Pj0wLGxyLmxlbmd0aD0wO2Zvcih2YXIgbjtuPVAoKVtyKys+Pj4wXTspe3ZhciBhPTEwNSE9bjt0Kz0oYSY9MTEyIT1uKSYmdCU4PzQ6MCxsci5wdXNoKDExMj09bj9XKClbdD4+PjI+Pj4wXToxMDY9PW4/U1t0Pj4+M106MTA1PT1uP0IoKVt0Pj4+Mj4+PjBdOkwoKVt0Pj4+Mz4+PjBdKSx0Kz1hPzg6NH1yZXR1cm4gcVtlXSguLi5scil9dmFyIGdyPSgpPT57fSxtcj0oKT0+e3Rocm93IHJlKz0xLFwidW53aW5kXCJ9O2Z1bmN0aW9uIGhyKCl7cmV0dXJuIDQyOTQ5MDE3NjB9dmFyIHZyPSgpPT5uYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeTtmdW5jdGlvbiBwcihlKXtlPj4+PTA7dmFyIHI9UCgpLmxlbmd0aDtpZihlPD1yfHw0Mjk0OTAxNzYwPGUpcmV0dXJuITE7Zm9yKHZhciB0PTE7ND49dDt0Kj0yKXt2YXIgbj1yKigxKy4yL3QpO249TWF0aC5taW4obixlKzEwMDY2MzI5Nik7ZTp7bj0oTWF0aC5taW4oNDI5NDkwMTc2MCw2NTUzNipNYXRoLmNlaWwoTWF0aC5tYXgoZSxuKS82NTUzNikpLWIuYnVmZmVyLmJ5dGVMZW5ndGgrNjU1MzUpLzY1NTM2fDA7dHJ5e2IuZ3JvdyhuKSxIKCk7dmFyIGE9MTticmVhayBlfWNhdGNoKGUpe31hPXZvaWQgMH1pZihhKXJldHVybiEwfXJldHVybiExfXZhciB3cixicj17fSxPcj0oKT0+e2lmKCF3cil7dmFyIGUscj17VVNFUjpcIndlYl91c2VyXCIsTE9HTkFNRTpcIndlYl91c2VyXCIsUEFUSDpcIi9cIixQV0Q6XCIvXCIsSE9NRTpcIi9ob21lL3dlYl91c2VyXCIsTEFORzooXCJvYmplY3RcIj09dHlwZW9mIG5hdmlnYXRvciYmbmF2aWdhdG9yLmxhbmd1YWdlcyYmbmF2aWdhdG9yLmxhbmd1YWdlc1swXXx8XCJDXCIpLnJlcGxhY2UoXCItXCIsXCJfXCIpK1wiLlVURi04XCIsXzpcIi4vdGhpcy5wcm9ncmFtXCJ9O2ZvcihlIGluIGJyKXZvaWQgMD09PWJyW2VdP2RlbGV0ZSByW2VdOnJbZV09YnJbZV07dmFyIHQ9W107Zm9yKGUgaW4gcil0LnB1c2goYCR7ZX09JHtyW2VdfWApO3dyPXR9cmV0dXJuIHdyfTtmdW5jdGlvbiB5cihlLHIpe2lmKHUpcmV0dXJuIHRlKDE5LDEsZSxyKTtlPj4+PTAscj4+Pj0wO3ZhciB0PTA7cmV0dXJuIE9yKCkuZm9yRWFjaCgoKG4sYSk9Pnt2YXIgaT1yK3Q7Zm9yKGE9VygpW2UrNCphPj4+Mj4+PjBdPWksaT0wO2k8bi5sZW5ndGg7KytpKXgoKVthKys+Pj4wXT1uLmNoYXJDb2RlQXQoaSk7eCgpW2E+Pj4wXT0wLHQrPW4ubGVuZ3RoKzF9KSksMH1mdW5jdGlvbiBfcihlLHIpe2lmKHUpcmV0dXJuIHRlKDIwLDEsZSxyKTtlPj4+PTAscj4+Pj0wO3ZhciB0PU9yKCk7VygpW2U+Pj4yPj4+MF09dC5sZW5ndGg7dmFyIG49MDtyZXR1cm4gdC5mb3JFYWNoKChlPT5uKz1lLmxlbmd0aCsxKSksVygpW3I+Pj4yPj4+MF09biwwfWZ1bmN0aW9uIFRyKGUpe3JldHVybiB1P3RlKDIxLDEsZSk6NTJ9ZnVuY3Rpb24gQXIoZSxyLHQsbil7cmV0dXJuIHU/dGUoMjIsMSxlLHIsdCxuKTo1Mn1mdW5jdGlvbiBNcihlLHIsdCxuKXtyZXR1cm4gdT90ZSgyMywxLGUscix0LG4pOjcwfXZhciBDcj1bbnVsbCxbXSxbXV07ZnVuY3Rpb24gRXIoZSxyLHQsbil7aWYodSlyZXR1cm4gdGUoMjQsMSxlLHIsdCxuKTtyPj4+PTAsdD4+Pj0wLG4+Pj49MDtmb3IodmFyIGE9MCxpPTA7aTx0O2krKyl7dmFyIG89VygpW3I+Pj4yPj4+MF0scz1XKClbcis0Pj4+Mj4+PjBdO3IrPTg7Zm9yKHZhciBmPTA7ZjxzO2YrKyl7dmFyIGM9UCgpW28rZj4+PjBdLGw9Q3JbZV07MD09PWN8fDEwPT09Yz8oKDE9PT1lP3A6dykoVGUobCkpLGwubGVuZ3RoPTApOmwucHVzaChjKX1hKz1zfXJldHVybiBXKClbbj4+PjI+Pj4wXT1hLDB9dXx8ZnVuY3Rpb24oKXtmb3IodmFyIGU9YS5udW1UaHJlYWRzLTE7ZS0tOylnZSgpO1oudW5zaGlmdCgoKCk9PntqKyssZnVuY3Rpb24oZSl7dT9lKCk6UHJvbWlzZS5hbGwob2UubWFwKGRlKSkudGhlbihlKX0oKCgpPT5WKCkpKX0pKX0oKTt2YXIgU3Isa3I9W25lLGFlLE9lLE1lLENlLFNlLGtlLERlLFJlLFVlLHhlLFBlLEZlLEJlLFdlLE5lLHRyLG5yLG9yLHlyLF9yLFRyLEFyLE1yLEVyXTshYXN5bmMgZnVuY3Rpb24oKXtmdW5jdGlvbiBlKGUscil7cmV0dXJuIFNyPWUuZXhwb3J0cyxTcj1mdW5jdGlvbigpe3ZhciBlPVNyLHI9ZT0+KCk9PmUoKT4+PjAsdD1lPT5yPT5lKHIpPj4+MDtyZXR1cm4oZT1PYmplY3QuYXNzaWduKHt9LGUpKS52YT1yKGUudmEpLGUueGE9dChlLnhhKSxlLkphPXQoZS5KYSksZS5LYT1yKGUuS2EpLGV9KCksdWUucHVzaChTci55YSksbWU9U3IuemEsTz1yLFYoKSxTcn1qKys7dmFyIHI9WCgpO2lmKGEuaW5zdGFudGlhdGVXYXNtKXJldHVybiBuZXcgUHJvbWlzZSgodD0+e2EuaW5zdGFudGlhdGVXYXNtKHIsKChyLG4pPT57ZShyLG4pLHQoci5leHBvcnRzKX0pKX0pKTtpZih1KXJldHVybiBuZXcgUHJvbWlzZSgocj0+e0k9dD0+e3ZhciBuPW5ldyBXZWJBc3NlbWJseS5JbnN0YW5jZSh0LFgoKSk7cihlKG4sdCkpfX0pKTtZPz89YS5sb2NhdGVGaWxlP2EubG9jYXRlRmlsZT9hLmxvY2F0ZUZpbGUoXCJvcnQtd2FzbS1zaW1kLXRocmVhZGVkLndhc21cIixtKTptK1wib3J0LXdhc20tc2ltZC10aHJlYWRlZC53YXNtXCI6bmV3IFVSTChcIm9ydC13YXNtLXNpbWQtdGhyZWFkZWQud2FzbVwiLGltcG9ydC5tZXRhLnVybCkuaHJlZjt0cnl7dmFyIHQ9YXdhaXQgYXN5bmMgZnVuY3Rpb24oZSl7dmFyIHI9WTtpZighRCYmXCJmdW5jdGlvblwiPT10eXBlb2YgV2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmcmJiFVKHIpKXRyeXt2YXIgdD1mZXRjaChyLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KTtyZXR1cm4gYXdhaXQgV2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmcodCxlKX1jYXRjaChlKXt3KGB3YXNtIHN0cmVhbWluZyBjb21waWxlIGZhaWxlZDogJHtlfWApLHcoXCJmYWxsaW5nIGJhY2sgdG8gQXJyYXlCdWZmZXIgaW5zdGFudGlhdGlvblwiKX1yZXR1cm4gYXN5bmMgZnVuY3Rpb24oZSxyKXt0cnl7dmFyIHQ9YXdhaXQgYXN5bmMgZnVuY3Rpb24oZSl7aWYoIUQpdHJ5e3ZhciByPWF3YWl0IGYoZSk7cmV0dXJuIG5ldyBVaW50OEFycmF5KHIpfWNhdGNoe31pZihlPT1ZJiZEKWU9bmV3IFVpbnQ4QXJyYXkoRCk7ZWxzZXtpZighYyl0aHJvd1wiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWRcIjtlPWMoZSl9cmV0dXJuIGV9KGUpO3JldHVybiBhd2FpdCBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZSh0LHIpfWNhdGNoKGUpe3coYGZhaWxlZCB0byBhc3luY2hyb25vdXNseSBwcmVwYXJlIHdhc206ICR7ZX1gKSxRKGUpfX0ocixlKX0ocik7cmV0dXJuIGUodC5pbnN0YW5jZSx0Lm1vZHVsZSl9Y2F0Y2goZSl7cmV0dXJuIG4oZSksUHJvbWlzZS5yZWplY3QoZSl9fSgpLGEuX09ydEluaXQ9KGUscik9PihhLl9PcnRJbml0PVNyLlgpKGUsciksYS5fT3J0R2V0TGFzdEVycm9yPShlLHIpPT4oYS5fT3J0R2V0TGFzdEVycm9yPVNyLlkpKGUsciksYS5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnM9KGUscix0LG4saSxvLHMsdSxmLGMpPT4oYS5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnM9U3IuWikoZSxyLHQsbixpLG8scyx1LGYsYyksYS5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9KGUscix0LG4saSk9PihhLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcj1Tci5fKShlLHIsdCxuLGkpLGEuX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZT0oZSxyLHQpPT4oYS5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPVNyLiQpKGUscix0KSxhLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9KGUscix0KT0+KGEuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeT1Tci5hYSkoZSxyLHQpLGEuX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucz1lPT4oYS5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPVNyLmJhKShlKSxhLl9PcnRDcmVhdGVTZXNzaW9uPShlLHIsdCk9PihhLl9PcnRDcmVhdGVTZXNzaW9uPVNyLmNhKShlLHIsdCksYS5fT3J0UmVsZWFzZVNlc3Npb249ZT0+KGEuX09ydFJlbGVhc2VTZXNzaW9uPVNyLmRhKShlKSxhLl9PcnRHZXRJbnB1dE91dHB1dENvdW50PShlLHIsdCk9PihhLl9PcnRHZXRJbnB1dE91dHB1dENvdW50PVNyLmVhKShlLHIsdCksYS5fT3J0R2V0SW5wdXRPdXRwdXRNZXRhZGF0YT0oZSxyLHQsbik9PihhLl9PcnRHZXRJbnB1dE91dHB1dE1ldGFkYXRhPVNyLmZhKShlLHIsdCxuKSxhLl9PcnRGcmVlPWU9PihhLl9PcnRGcmVlPVNyLmdhKShlKSxhLl9PcnRDcmVhdGVUZW5zb3I9KGUscix0LG4saSxvKT0+KGEuX09ydENyZWF0ZVRlbnNvcj1Tci5oYSkoZSxyLHQsbixpLG8pLGEuX09ydEdldFRlbnNvckRhdGE9KGUscix0LG4saSk9PihhLl9PcnRHZXRUZW5zb3JEYXRhPVNyLmlhKShlLHIsdCxuLGkpLGEuX09ydFJlbGVhc2VUZW5zb3I9ZT0+KGEuX09ydFJlbGVhc2VUZW5zb3I9U3IuamEpKGUpLGEuX09ydENyZWF0ZVJ1bk9wdGlvbnM9KGUscix0LG4pPT4oYS5fT3J0Q3JlYXRlUnVuT3B0aW9ucz1Tci5rYSkoZSxyLHQsbiksYS5fT3J0QWRkUnVuQ29uZmlnRW50cnk9KGUscix0KT0+KGEuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PVNyLmxhKShlLHIsdCksYS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9ZT0+KGEuX09ydFJlbGVhc2VSdW5PcHRpb25zPVNyLm1hKShlKSxhLl9PcnRDcmVhdGVCaW5kaW5nPWU9PihhLl9PcnRDcmVhdGVCaW5kaW5nPVNyLm5hKShlKSxhLl9PcnRCaW5kSW5wdXQ9KGUscix0KT0+KGEuX09ydEJpbmRJbnB1dD1Tci5vYSkoZSxyLHQpLGEuX09ydEJpbmRPdXRwdXQ9KGUscix0LG4pPT4oYS5fT3J0QmluZE91dHB1dD1Tci5wYSkoZSxyLHQsbiksYS5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9ZT0+KGEuX09ydENsZWFyQm91bmRPdXRwdXRzPVNyLnFhKShlKSxhLl9PcnRSZWxlYXNlQmluZGluZz1lPT4oYS5fT3J0UmVsZWFzZUJpbmRpbmc9U3IucmEpKGUpLGEuX09ydFJ1bldpdGhCaW5kaW5nPShlLHIsdCxuLGkpPT4oYS5fT3J0UnVuV2l0aEJpbmRpbmc9U3Iuc2EpKGUscix0LG4saSksYS5fT3J0UnVuPShlLHIsdCxuLGksbyxzLHUpPT4oYS5fT3J0UnVuPVNyLnRhKShlLHIsdCxuLGksbyxzLHUpLGEuX09ydEVuZFByb2ZpbGluZz1lPT4oYS5fT3J0RW5kUHJvZmlsaW5nPVNyLnVhKShlKTt2YXIgRHI9KCk9PihEcj1Tci52YSkoKTthLl9mcmVlPWU9PihhLl9mcmVlPVNyLndhKShlKSxhLl9tYWxsb2M9ZT0+KGEuX21hbGxvYz1Tci54YSkoZSk7dmFyIFJyPShlLHIsdCxuLGEsaSk9PihScj1Tci5BYSkoZSxyLHQsbixhLGkpLFVyPSgpPT4oVXI9U3IuQmEpKCkseHI9KGUscix0LG4sYSk9Pih4cj1Tci5DYSkoZSxyLHQsbixhKSxQcj1lPT4oUHI9U3IuRGEpKGUpLEZyPWU9PihGcj1Tci5FYSkoZSksQnI9KGUscik9PihCcj1Tci5GYSkoZSxyKSxXcj0oKT0+KFdyPVNyLkdhKSgpLE5yPShlLHIpPT4oTnI9U3IuSGEpKGUsciksTHI9ZT0+KExyPVNyLklhKShlKSxJcj1lPT4oSXI9U3IuSmEpKGUpLCRyPSgpPT4oJHI9U3IuS2EpKCk7cmV0dXJuIGEuc3RhY2tTYXZlPSgpPT4kcigpLGEuc3RhY2tSZXN0b3JlPWU9PkxyKGUpLGEuc3RhY2tBbGxvYz1lPT5JcihlKSxhLnNldFZhbHVlPWZ1bmN0aW9uKGUscix0PVwiaThcIil7c3dpdGNoKHQuZW5kc1dpdGgoXCIqXCIpJiYodD1cIipcIiksdCl7Y2FzZVwiaTFcIjpjYXNlXCJpOFwiOngoKVtlPj4+MF09cjticmVhaztjYXNlXCJpMTZcIjpGKClbZT4+PjE+Pj4wXT1yO2JyZWFrO2Nhc2VcImkzMlwiOkIoKVtlPj4+Mj4+PjBdPXI7YnJlYWs7Y2FzZVwiaTY0XCI6U1tlPj4+M109QmlnSW50KHIpO2JyZWFrO2Nhc2VcImZsb2F0XCI6TigpW2U+Pj4yPj4+MF09cjticmVhaztjYXNlXCJkb3VibGVcIjpMKClbZT4+PjM+Pj4wXT1yO2JyZWFrO2Nhc2VcIipcIjpXKClbZT4+PjI+Pj4wXT1yO2JyZWFrO2RlZmF1bHQ6UShgaW52YWxpZCB0eXBlIGZvciBzZXRWYWx1ZTogJHt0fWApfX0sYS5nZXRWYWx1ZT1mdW5jdGlvbihlLHI9XCJpOFwiKXtzd2l0Y2goci5lbmRzV2l0aChcIipcIikmJihyPVwiKlwiKSxyKXtjYXNlXCJpMVwiOmNhc2VcImk4XCI6cmV0dXJuIHgoKVtlPj4+MF07Y2FzZVwiaTE2XCI6cmV0dXJuIEYoKVtlPj4+MT4+PjBdO2Nhc2VcImkzMlwiOnJldHVybiBCKClbZT4+PjI+Pj4wXTtjYXNlXCJpNjRcIjpyZXR1cm4gU1tlPj4+M107Y2FzZVwiZmxvYXRcIjpyZXR1cm4gTigpW2U+Pj4yPj4+MF07Y2FzZVwiZG91YmxlXCI6cmV0dXJuIEwoKVtlPj4+Mz4+PjBdO2Nhc2VcIipcIjpyZXR1cm4gVygpW2U+Pj4yPj4+MF07ZGVmYXVsdDpRKGBpbnZhbGlkIHR5cGUgZm9yIGdldFZhbHVlOiAke3J9YCl9fSxhLlVURjhUb1N0cmluZz1BZSxhLnN0cmluZ1RvVVRGOD1FZSxhLmxlbmd0aEJ5dGVzVVRGOD1lPT57Zm9yKHZhciByPTAsdD0wO3Q8ZS5sZW5ndGg7Kyt0KXt2YXIgbj1lLmNoYXJDb2RlQXQodCk7MTI3Pj1uP3IrKzoyMDQ3Pj1uP3IrPTI6NTUyOTY8PW4mJjU3MzQzPj1uPyhyKz00LCsrdCk6cis9M31yZXR1cm4gcn0sZnVuY3Rpb24gZSgpe2lmKDA8ail6PWU7ZWxzZSBpZih1KXQoYSksRygpO2Vsc2V7Zm9yKDswPFoubGVuZ3RoOylaLnNoaWZ0KCkoYSk7MDxqP3o9ZTooYS5jYWxsZWRSdW49ITAsUnx8KEcoKSx0KGEpKSl9fSgpLGEuUFRSX1NJWkU9NCxpfSk7ZXhwb3J0IGRlZmF1bHQgcjt2YXIgdD1nbG9iYWxUaGlzLnNlbGY/Lm5hbWU/LnN0YXJ0c1dpdGgoXCJlbS1wdGhyZWFkXCIpO3QmJnIoKTsiLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB0eXBlIHsgT3J0V2FzbU1vZHVsZSB9IGZyb20gJy4vd2FzbS10eXBlcyc7XG5pbXBvcnQgeyBpc05vZGUgfSBmcm9tICcuL3dhc20tdXRpbHMtZW52JztcblxuLyoqXG4gKiBUaGUgb3JpZ2luIG9mIHRoZSBjdXJyZW50IGxvY2F0aW9uLlxuICpcbiAqIEluIE5vZGUuanMsIHRoaXMgaXMgdW5kZWZpbmVkLlxuICovXG5jb25zdCBvcmlnaW4gPSBpc05vZGUgfHwgdHlwZW9mIGxvY2F0aW9uID09PSAndW5kZWZpbmVkJyA/IHVuZGVmaW5lZCA6IGxvY2F0aW9uLm9yaWdpbjtcblxuLyoqXG4gKiBTb21lIGJ1bmRsZXJzIChlZy4gV2VicGFjaykgd2lsbCByZXdyaXRlIGBpbXBvcnQubWV0YS51cmxgIHRvIGEgZmlsZSBVUkwgYXQgY29tcGlsZSB0aW1lLlxuICpcbiAqIFRoaXMgZnVuY3Rpb24gY2hlY2tzIGlmIGBpbXBvcnQubWV0YS51cmxgIHN0YXJ0cyB3aXRoIGBmaWxlOmAsIGJ1dCB1c2luZyB0aGUgYD5gIGFuZCBgPGAgb3BlcmF0b3JzIGluc3RlYWQgb2ZcbiAqIGBzdGFydHNXaXRoYCBmdW5jdGlvbiBzbyB0aGF0IGNvZGUgbWluaW1pemVycyBjYW4gcmVtb3ZlIHRoZSBkZWFkIGNvZGUgY29ycmVjdGx5LlxuICpcbiAqIEZvciBleGFtcGxlLCBpZiB3ZSB1c2UgdGVyc2VyIHRvIG1pbmlmeSB0aGUgZm9sbG93aW5nIGNvZGU6XG4gKiBgYGBqc1xuICogaWYgKFwiZmlsZTovL2hhcmQtY29kZWQtZmlsZW5hbWVcIi5zdGFydHNXaXRoKFwiZmlsZTpcIikpIHtcbiAqICAgY29uc29sZS5sb2coMSlcbiAqIH0gZWxzZSB7XG4gKiAgIGNvbnNvbGUubG9nKDIpXG4gKiB9XG4gKlxuICogaWYgKFwiZmlsZTovL2hhcmQtY29kZWQtZmlsZW5hbWVcIiA+IFwiZmlsZTpcIiAmJiBcImZpbGU6Ly9oYXJkLWNvZGVkLWZpbGVuYW1lXCIgPCBcImZpbGU7XCIpIHtcbiAqICAgY29uc29sZS5sb2coMylcbiAqIH0gZWxzZSB7XG4gKiAgIGNvbnNvbGUubG9nKDQpXG4gKiB9XG4gKiBgYGBcbiAqXG4gKiBUaGUgbWluaWZpZWQgY29kZSB3aWxsIGJlOlxuICogYGBganNcbiAqIFwiZmlsZTovL2hhcmQtY29kZWQtZmlsZW5hbWVcIi5zdGFydHNXaXRoKFwiZmlsZTpcIik/Y29uc29sZS5sb2coMSk6Y29uc29sZS5sb2coMiksY29uc29sZS5sb2coMyk7XG4gKiBgYGBcbiAqXG4gKiAodXNlIFRlcnNlciA1LjM5LjAgd2l0aCBkZWZhdWx0IG9wdGlvbnMsIGh0dHBzOi8vdHJ5LnRlcnNlci5vcmcvKVxuICpcbiAqIEByZXR1cm5zIHRydWUgaWYgdGhlIGltcG9ydC5tZXRhLnVybCBpcyBoYXJkY29kZWQgYXMgYSBmaWxlIFVSSS5cbiAqL1xuZXhwb3J0IGNvbnN0IGlzRXNtSW1wb3J0TWV0YVVybEhhcmRjb2RlZEFzRmlsZVVyaSA9XG4gIEJVSUxEX0RFRlMuSVNfRVNNICYmIEJVSUxEX0RFRlMuRVNNX0lNUE9SVF9NRVRBX1VSTCEgPiAnZmlsZTonICYmIEJVSUxEX0RFRlMuRVNNX0lNUE9SVF9NRVRBX1VSTCEgPCAnZmlsZTsnO1xuXG5jb25zdCBnZXRTY3JpcHRTcmMgPSAoKTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcbiAgLy8gaWYgTm9kZWpzLCByZXR1cm4gdW5kZWZpbmVkXG4gIGlmIChpc05vZGUpIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG4gIC8vIGlmIEl0J3MgRVNNLCB1c2UgaW1wb3J0Lm1ldGEudXJsXG4gIGlmIChCVUlMRF9ERUZTLklTX0VTTSkge1xuICAgIC8vIEZvciBFU00sIGlmIHRoZSBpbXBvcnQubWV0YS51cmwgaXMgYSBmaWxlIFVSTCwgdGhpcyB1c3VhbGx5IG1lYW5zIHRoZSBidW5kbGVyIHJld3JpdGVzIGBpbXBvcnQubWV0YS51cmxgIHRvXG4gICAgLy8gdGhlIGZpbGUgcGF0aCBhdCBjb21waWxlIHRpbWUuIEluIHRoaXMgY2FzZSwgdGhpcyBmaWxlIHBhdGggY2Fubm90IGJlIHVzZWQgdG8gZGV0ZXJtaW5lIHRoZSBydW50aW1lIFVSTC5cbiAgICAvL1xuICAgIC8vIFdlIG5lZWQgdG8gdXNlIHRoZSBVUkwgY29uc3RydWN0b3IgbGlrZSB0aGlzOlxuICAgIC8vIGBgYGpzXG4gICAgLy8gbmV3IFVSTCgnYWN0dWFsLWJ1bmRsZS1uYW1lLmpzJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmXG4gICAgLy8gYGBgXG4gICAgLy8gU28gdGhhdCBidW5kbGVyIGNhbiBwcmVwcm9jZXNzIHRoZSBVUkwgY29ycmVjdGx5LlxuICAgIGlmIChpc0VzbUltcG9ydE1ldGFVcmxIYXJkY29kZWRBc0ZpbGVVcmkpIHtcbiAgICAgIC8vIGlmIHRoZSByZXdyaXR0ZW4gVVJMIGlzIGEgcmVsYXRpdmUgcGF0aCwgd2UgbmVlZCB0byB1c2UgdGhlIG9yaWdpbiB0byByZXNvbHZlIHRoZSBVUkwuXG5cbiAgICAgIC8vIFRoZSBmb2xsb3dpbmcgaXMgYSB3b3JrYXJvdW5kIGZvciBWaXRlLlxuICAgICAgLy9cbiAgICAgIC8vIFZpdGUgdXNlcyBhIGJ1bmRsZXIocm9sbHVwL3JvbGxkb3duKSB0aGF0IGRvZXMgbm90IHJld3JpdGUgYGltcG9ydC5tZXRhLnVybGAgdG8gYSBmaWxlIFVSTC4gU28gaW4gdGhlb3J5LCB0aGlzXG4gICAgICAvLyBjb2RlIHBhdGggc2hvdWxkIG5vdCBiZSBleGVjdXRlZCBpbiBWaXRlLiBIb3dldmVyLCB0aGUgYnVuZGxlciBkb2VzIG5vdCBrbm93IGl0IGFuZCBpdCBzdGlsbCB0cnkgdG8gbG9hZCB0aGVcbiAgICAgIC8vIGZvbGxvd2luZyBwYXR0ZXJuOlxuICAgICAgLy8gLSBgcmV0dXJuIG5ldyBVUkwoJ2ZpbGVuYW1lJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmYFxuICAgICAgLy9cbiAgICAgIC8vIEJ5IHJlcGxhY2luZyB0aGUgcGF0dGVybiBhYm92ZSB3aXRoIHRoZSBmb2xsb3dpbmcgY29kZSwgd2UgY2FuIHNraXAgdGhlIHJlc291cmNlIGxvYWRpbmcgYmVoYXZpb3I6XG4gICAgICAvLyAtIGBjb25zdCBVUkwyID0gVVJMOyByZXR1cm4gbmV3IFVSTDIoJ2ZpbGVuYW1lJywgaW1wb3J0Lm1ldGEudXJsKS5ocmVmO2BcbiAgICAgIC8vXG4gICAgICAvLyBBbmQgaXQgc3RpbGwgd29ya3MgaW4gV2VicGFjay5cbiAgICAgIGNvbnN0IFVSTDIgPSBVUkw7XG4gICAgICByZXR1cm4gbmV3IFVSTChuZXcgVVJMMihCVUlMRF9ERUZTLkJVTkRMRV9GSUxFTkFNRSwgQlVJTERfREVGUy5FU01fSU1QT1JUX01FVEFfVVJMKS5ocmVmLCBvcmlnaW4pLmhyZWY7XG4gICAgfVxuXG4gICAgcmV0dXJuIEJVSUxEX0RFRlMuRVNNX0lNUE9SVF9NRVRBX1VSTDtcbiAgfVxuXG4gIHJldHVybiB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICAgPyAoZG9jdW1lbnQuY3VycmVudFNjcmlwdCBhcyBIVE1MU2NyaXB0RWxlbWVudCk/LnNyY1xuICAgIDogLy8gdXNlIGBzZWxmLmxvY2F0aW9uLmhyZWZgIGlmIGF2YWlsYWJsZVxuICAgICAgdHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnXG4gICAgICA/IHNlbGYubG9jYXRpb24/LmhyZWZcbiAgICAgIDogdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBUaGUgY2xhc3NpYyBzY3JpcHQgc291cmNlIFVSTC4gVGhpcyBpcyBub3QgYWx3YXlzIGF2YWlsYWJsZSBpbiBub24gRVNNb2R1bGUgZW52aXJvbm1lbnRzLlxuICpcbiAqIEluIE5vZGUuanMsIHRoaXMgaXMgdW5kZWZpbmVkLlxuICovXG5leHBvcnQgY29uc3Qgc2NyaXB0U3JjID0gZ2V0U2NyaXB0U3JjKCk7XG5cbi8qKlxuICogSW5mZXIgdGhlIHdhc20gcGF0aCBwcmVmaXggZnJvbSB0aGUgc2NyaXB0IHNvdXJjZSBVUkwuXG4gKlxuICogQHJldHVybnMgVGhlIGluZmVycmVkIHdhc20gcGF0aCBwcmVmaXgsIG9yIHVuZGVmaW5lZCBpZiB0aGUgc2NyaXB0IHNvdXJjZSBVUkwgaXMgbm90IGF2YWlsYWJsZSBvciBpcyBhIGJsb2IgVVJMLlxuICovXG5leHBvcnQgY29uc3QgaW5mZXJXYXNtUGF0aFByZWZpeEZyb21TY3JpcHRTcmMgPSAoKTogc3RyaW5nIHwgdW5kZWZpbmVkID0+IHtcbiAgaWYgKHNjcmlwdFNyYyAmJiAhc2NyaXB0U3JjLnN0YXJ0c1dpdGgoJ2Jsb2I6JykpIHtcbiAgICByZXR1cm4gc2NyaXB0U3JjLnN1YnN0cmluZygwLCBzY3JpcHRTcmMubGFzdEluZGV4T2YoJy8nKSArIDEpO1xuICB9XG4gIHJldHVybiB1bmRlZmluZWQ7XG59O1xuXG4vKipcbiAqIENoZWNrIGlmIHRoZSBnaXZlbiBmaWxlbmFtZSB3aXRoIHByZWZpeCBpcyBmcm9tIHRoZSBzYW1lIG9yaWdpbi5cbiAqL1xuY29uc3QgaXNTYW1lT3JpZ2luID0gKGZpbGVuYW1lOiBzdHJpbmcsIHByZWZpeE92ZXJyaWRlPzogc3RyaW5nKSA9PiB7XG4gIHRyeSB7XG4gICAgY29uc3QgYmFzZVVybCA9IHByZWZpeE92ZXJyaWRlID8/IHNjcmlwdFNyYztcbiAgICBjb25zdCB1cmwgPSBiYXNlVXJsID8gbmV3IFVSTChmaWxlbmFtZSwgYmFzZVVybCkgOiBuZXcgVVJMKGZpbGVuYW1lKTtcbiAgICByZXR1cm4gdXJsLm9yaWdpbiA9PT0gb3JpZ2luO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbi8qKlxuICogTm9ybWFsaXplIHRoZSBpbnB1dHMgdG8gYW4gYWJzb2x1dGUgVVJMIHdpdGggdGhlIGdpdmVuIHByZWZpeCBvdmVycmlkZS4gSWYgZmFpbGVkLCByZXR1cm4gdW5kZWZpbmVkLlxuICovXG5jb25zdCBub3JtYWxpemVVcmwgPSAoZmlsZW5hbWU6IHN0cmluZywgcHJlZml4T3ZlcnJpZGU/OiBzdHJpbmcpID0+IHtcbiAgY29uc3QgYmFzZVVybCA9IHByZWZpeE92ZXJyaWRlID8/IHNjcmlwdFNyYztcbiAgdHJ5IHtcbiAgICBjb25zdCB1cmwgPSBiYXNlVXJsID8gbmV3IFVSTChmaWxlbmFtZSwgYmFzZVVybCkgOiBuZXcgVVJMKGZpbGVuYW1lKTtcbiAgICByZXR1cm4gdXJsLmhyZWY7XG4gIH0gY2F0Y2gge1xuICAgIHJldHVybiB1bmRlZmluZWQ7XG4gIH1cbn07XG5cbi8qKlxuICogQ3JlYXRlIGEgZmFsbGJhY2sgVVJMIGlmIGFuIGFic29sdXRlIFVSTCBjYW5ub3QgYmUgY3JlYXRlZCBieSB0aGUgbm9ybWFsaXplVXJsIGZ1bmN0aW9uLlxuICovXG5jb25zdCBmYWxsYmFja1VybCA9IChmaWxlbmFtZTogc3RyaW5nLCBwcmVmaXhPdmVycmlkZT86IHN0cmluZykgPT4gYCR7cHJlZml4T3ZlcnJpZGUgPz8gJy4vJ30ke2ZpbGVuYW1lfWA7XG5cbi8qKlxuICogVGhpcyBoZWxwZXIgZnVuY3Rpb24gaXMgdXNlZCB0byBwcmVsb2FkIGEgbW9kdWxlIGZyb20gYSBVUkwuXG4gKlxuICogSWYgdGhlIG9yaWdpbiBvZiB0aGUgd29ya2VyIFVSTCBpcyBkaWZmZXJlbnQgZnJvbSB0aGUgY3VycmVudCBvcmlnaW4sIHRoZSB3b3JrZXIgY2Fubm90IGJlIGxvYWRlZCBkaXJlY3RseS5cbiAqIFNlZSBkaXNjdXNzaW9ucyBpbiBodHRwczovL2dpdGh1Yi5jb20vd2VicGFjay1jb250cmliL3dvcmtlci1sb2FkZXIvaXNzdWVzLzE1NFxuICpcbiAqIEluIHRoaXMgY2FzZSwgd2Ugd2lsbCBmZXRjaCB0aGUgd29ya2VyIFVSTCBhbmQgY3JlYXRlIGEgbmV3IEJsb2IgVVJMIHdpdGggdGhlIHNhbWUgb3JpZ2luIGFzIGEgd29ya2Fyb3VuZC5cbiAqXG4gKiBAcGFyYW0gYWJzb2x1dGVVcmwgLSBUaGUgYWJzb2x1dGUgVVJMIHRvIHByZWxvYWQuXG4gKlxuICogQHJldHVybnMgLSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIG5ldyBCbG9iIFVSTFxuICovXG5jb25zdCBwcmVsb2FkID0gYXN5bmMgKGFic29sdXRlVXJsOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4gPT4ge1xuICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGFic29sdXRlVXJsLCB7IGNyZWRlbnRpYWxzOiAnc2FtZS1vcmlnaW4nIH0pO1xuICBjb25zdCBibG9iID0gYXdhaXQgcmVzcG9uc2UuYmxvYigpO1xuICByZXR1cm4gVVJMLmNyZWF0ZU9iamVjdFVSTChibG9iKTtcbn07XG5cbi8qKlxuICogVGhpcyBoZWxwZXIgZnVuY3Rpb24gaXMgdXNlZCB0byBkeW5hbWljYWxseSBpbXBvcnQgYSBtb2R1bGUgZnJvbSBhIFVSTC5cbiAqXG4gKiBUaGUgYnVpbGQgc2NyaXB0IGhhcyBzcGVjaWFsIGhhbmRsaW5nIGZvciB0aGlzIGZ1bmN0aW9uIHRvIGVuc3VyZSB0aGF0IHRoZSBVUkwgaXMgbm90IGJ1bmRsZWQgaW50byB0aGUgZmluYWwgb3V0cHV0LlxuICpcbiAqIEBwYXJhbSB1cmwgLSBUaGUgVVJMIHRvIGltcG9ydC5cbiAqXG4gKiBAcmV0dXJucyAtIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIHRoZSBkZWZhdWx0IGV4cG9ydCBvZiB0aGUgbW9kdWxlLlxuICovXG5jb25zdCBkeW5hbWljSW1wb3J0RGVmYXVsdCA9IGFzeW5jIDxUPih1cmw6IHN0cmluZyk6IFByb21pc2U8VD4gPT5cbiAgKGF3YWl0IGltcG9ydCgvKiB3ZWJwYWNrSWdub3JlOiB0cnVlICovIHVybCkpLmRlZmF1bHQ7XG5cbi8qKlxuICogVGhlIHByb3h5IHdvcmtlciBmYWN0b3J5IGltcG9ydGVkIGZyb20gdGhlIHByb3h5IHdvcmtlciBtb2R1bGUuXG4gKlxuICogVGhpcyBpcyBvbmx5IGF2YWlsYWJsZSB3aGVuIHRoZSBXZWJBc3NlbWJseSBwcm94eSBpcyBub3QgZGlzYWJsZWQuXG4gKi9cbmNvbnN0IGNyZWF0ZVByb3h5V29ya2VyOiAoKHVybE92ZXJyaWRlPzogc3RyaW5nKSA9PiBXb3JrZXIpIHwgdW5kZWZpbmVkID1cbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHMsIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXNcbiAgQlVJTERfREVGUy5ESVNBQkxFX1dBU01fUFJPWFkgPyB1bmRlZmluZWQgOiByZXF1aXJlKCcuL3Byb3h5LXdvcmtlci9tYWluJykuZGVmYXVsdDtcblxuLyoqXG4gKiBJbXBvcnQgdGhlIHByb3h5IHdvcmtlci5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIHdpbGwgcGVyZm9ybSB0aGUgZm9sbG93aW5nIHN0ZXBzOlxuICogMS4gSWYgYSBwcmVsb2FkIGlzIG5lZWRlZCwgaXQgd2lsbCBwcmVsb2FkIHRoZSBtb2R1bGUgYW5kIHJldHVybiB0aGUgb2JqZWN0IFVSTC5cbiAqIDIuIFVzZSB0aGUgcHJveHkgd29ya2VyIGZhY3RvcnkgdG8gY3JlYXRlIHRoZSBwcm94eSB3b3JrZXIuXG4gKlxuICogQHJldHVybnMgLSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIHR1cGxlIG9mIDIgZWxlbWVudHM6XG4gKiAgICAgICAgICAgIC0gVGhlIG9iamVjdCBVUkwgb2YgdGhlIHByZWxvYWRlZCBtb2R1bGUsIG9yIHVuZGVmaW5lZCBpZiBubyBwcmVsb2FkIGlzIG5lZWRlZC5cbiAqICAgICAgICAgICAgLSBUaGUgcHJveHkgd29ya2VyLlxuICovXG5leHBvcnQgY29uc3QgaW1wb3J0UHJveHlXb3JrZXIgPSBhc3luYyAoKTogUHJvbWlzZTxbdW5kZWZpbmVkIHwgc3RyaW5nLCBXb3JrZXJdPiA9PiB7XG4gIGlmICghc2NyaXB0U3JjKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdGYWlsZWQgdG8gbG9hZCBwcm94eSB3b3JrZXI6IGNhbm5vdCBkZXRlcm1pbmUgdGhlIHNjcmlwdCBzb3VyY2UgVVJMLicpO1xuICB9XG5cbiAgLy8gSWYgdGhlIHNjcmlwdCBzb3VyY2UgaXMgZnJvbSB0aGUgc2FtZSBvcmlnaW4sIHdlIGNhbiB1c2UgdGhlIGVtYmVkZGVkIHByb3h5IG1vZHVsZSBkaXJlY3RseS5cbiAgaWYgKGlzU2FtZU9yaWdpbihzY3JpcHRTcmMpKSB7XG4gICAgcmV0dXJuIFt1bmRlZmluZWQsIGNyZWF0ZVByb3h5V29ya2VyISgpXTtcbiAgfVxuXG4gIC8vIE90aGVyd2lzZSwgbmVlZCB0byBwcmVsb2FkXG4gIGNvbnN0IHVybCA9IGF3YWl0IHByZWxvYWQoc2NyaXB0U3JjKTtcbiAgcmV0dXJuIFt1cmwsIGNyZWF0ZVByb3h5V29ya2VyISh1cmwpXTtcbn07XG5cbi8qKlxuICogVGhlIGVtYmVkZGVkIFdlYkFzc2VtYmx5IG1vZHVsZS5cbiAqXG4gKiBUaGlzIGlzIG9ubHkgYXZhaWxhYmxlIGluIEVTTSBhbmQgd2hlbiBlbWJlZGRpbmcgaXMgbm90IGRpc2FibGVkLlxuICovXG5jb25zdCBlbWJlZGRlZFdhc21Nb2R1bGU6IEVtc2NyaXB0ZW5Nb2R1bGVGYWN0b3J5PE9ydFdhc21Nb2R1bGU+IHwgdW5kZWZpbmVkID1cbiAgQlVJTERfREVGUy5JU19FU00gJiYgQlVJTERfREVGUy5FTkFCTEVfQlVORExFX1dBU01fSlNcbiAgICA/IC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdmFyLXJlcXVpcmVzXG4gICAgICByZXF1aXJlKFxuICAgICAgICAhQlVJTERfREVGUy5ESVNBQkxFX0pTRVBcbiAgICAgICAgICA/ICcuLi8uLi9kaXN0L29ydC13YXNtLXNpbWQtdGhyZWFkZWQuanNlcC5tanMnXG4gICAgICAgICAgOiAnLi4vLi4vZGlzdC9vcnQtd2FzbS1zaW1kLXRocmVhZGVkLm1qcycsXG4gICAgICApLmRlZmF1bHRcbiAgICA6IHVuZGVmaW5lZDtcblxuY29uc3QgdGVtcCA9IHRydWU7XG5cbi8qKlxuICogSW1wb3J0IHRoZSBXZWJBc3NlbWJseSBtb2R1bGUuXG4gKlxuICogVGhpcyBmdW5jdGlvbiB3aWxsIHBlcmZvcm0gdGhlIGZvbGxvd2luZyBzdGVwczpcbiAqIDEuIElmIHRoZSBlbWJlZGRlZCBtb2R1bGUgZXhpc3RzIGFuZCBubyBjdXN0b20gVVJMIGlzIHNwZWNpZmllZCwgdXNlIHRoZSBlbWJlZGRlZCBtb2R1bGUuXG4gKiAyLiBJZiBhIHByZWxvYWQgaXMgbmVlZGVkLCBpdCB3aWxsIHByZWxvYWQgdGhlIG1vZHVsZSBhbmQgcmV0dXJuIHRoZSBvYmplY3QgVVJMLlxuICogMy4gT3RoZXJ3aXNlLCBpdCB3aWxsIHBlcmZvcm0gYSBkeW5hbWljIGltcG9ydCBvZiB0aGUgbW9kdWxlLlxuICpcbiAqIEByZXR1cm5zIC0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSB0dXBsZSBvZiAyIGVsZW1lbnRzOlxuICogICAgICAgICAgICAtIFRoZSBvYmplY3QgVVJMIG9mIHRoZSBwcmVsb2FkZWQgbW9kdWxlLCBvciB1bmRlZmluZWQgaWYgbm8gcHJlbG9hZCBpcyBuZWVkZWQuXG4gKiAgICAgICAgICAgIC0gVGhlIGRlZmF1bHQgZXhwb3J0IG9mIHRoZSBtb2R1bGUsIHdoaWNoIGlzIGEgZmFjdG9yeSBmdW5jdGlvbiB0byBjcmVhdGUgdGhlIFdlYkFzc2VtYmx5IG1vZHVsZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGltcG9ydFdhc21Nb2R1bGUgPSBhc3luYyAoXG4gIHVybE92ZXJyaWRlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gIHByZWZpeE92ZXJyaWRlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gIGlzTXVsdGlUaHJlYWRlZDogYm9vbGVhbixcbik6IFByb21pc2U8W3VuZGVmaW5lZCB8IHN0cmluZywgRW1zY3JpcHRlbk1vZHVsZUZhY3Rvcnk8T3J0V2FzbU1vZHVsZT5dPiA9PiB7XG4gIC8vIFx1NkNFODogXHU2MjExXHU0RUVDXHU3M0IwXHU1NzI4XHU1M0VBXHU0RjdGXHU3NTI4IGVtYmVkZGVkIFx1NzY4NHdhc21cdTVGMTVcdTVCRkNcdTY1ODdcdTRFRjYsIFx1NEUzQVx1NEU4Nlx1NTE3Q1x1NUJCOVx1NUMwRlx1NkUzOFx1NjIwRlx1NUU3M1x1NTNGMFxuICBpZiAodGVtcCB8fCAhdXJsT3ZlcnJpZGUgJiYgIXByZWZpeE92ZXJyaWRlICYmIGVtYmVkZGVkV2FzbU1vZHVsZSAmJiBzY3JpcHRTcmMgJiYgaXNTYW1lT3JpZ2luKHNjcmlwdFNyYykpIHtcbiAgICByZXR1cm4gW3VuZGVmaW5lZCwgZW1iZWRkZWRXYXNtTW9kdWxlIV07XG4gIH0gZWxzZSB7XG4gICAgY29uc3Qgd2FzbU1vZHVsZUZpbGVuYW1lID0gIUJVSUxEX0RFRlMuRElTQUJMRV9KU0VQXG4gICAgICA/ICdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLmpzZXAubWpzJ1xuICAgICAgOiAnb3J0LXdhc20tc2ltZC10aHJlYWRlZC5tanMnO1xuICAgIGNvbnN0IHdhc21Nb2R1bGVVcmwgPSB1cmxPdmVycmlkZSA/PyBub3JtYWxpemVVcmwod2FzbU1vZHVsZUZpbGVuYW1lLCBwcmVmaXhPdmVycmlkZSk7XG4gICAgLy8gbmVlZCB0byBwcmVsb2FkIGlmIGFsbCBvZiB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgYXJlIG1ldDpcbiAgICAvLyAxLiBub3QgaW4gTm9kZS5qcy5cbiAgICAvLyAgICAtIE5vZGUuanMgZG9lcyBub3QgaGF2ZSB0aGUgc2FtZSBvcmlnaW4gcG9saWN5IGZvciBjcmVhdGluZyB3b3JrZXJzLlxuICAgIC8vIDIuIG11bHRpLXRocmVhZGVkIGlzIGVuYWJsZWQuXG4gICAgLy8gICAgLSBJZiBtdWx0aS10aHJlYWRlZCBpcyBkaXNhYmxlZCwgbm8gd29ya2VyIHdpbGwgYmUgY3JlYXRlZC4gU28gd2UgZG9uJ3QgbmVlZCB0byBwcmVsb2FkIHRoZSBtb2R1bGUuXG4gICAgLy8gMy4gdGhlIGFic29sdXRlIFVSTCBpcyBhdmFpbGFibGUuXG4gICAgLy8gICAgLSBJZiB0aGUgYWJzb2x1dGUgVVJMIGlzIGZhaWxlZCB0byBiZSBjcmVhdGVkLCB0aGUgb3JpZ2luIGNhbm5vdCBiZSBkZXRlcm1pbmVkLiBJbiB0aGlzIGNhc2UsIHdlIHdpbGwgbm90XG4gICAgLy8gICAgcHJlbG9hZCB0aGUgbW9kdWxlLlxuICAgIC8vIDQuIHRoZSB3b3JrZXIgVVJMIGlzIG5vdCBmcm9tIHRoZSBzYW1lIG9yaWdpbi5cbiAgICAvLyAgICAtIElmIHRoZSB3b3JrZXIgVVJMIGlzIGZyb20gdGhlIHNhbWUgb3JpZ2luLCB3ZSBjYW4gY3JlYXRlIHRoZSB3b3JrZXIgZGlyZWN0bHkuXG4gICAgY29uc3QgbmVlZFByZWxvYWQgPSAhaXNOb2RlICYmIGlzTXVsdGlUaHJlYWRlZCAmJiB3YXNtTW9kdWxlVXJsICYmICFpc1NhbWVPcmlnaW4od2FzbU1vZHVsZVVybCwgcHJlZml4T3ZlcnJpZGUpO1xuICAgIGNvbnN0IHVybCA9IG5lZWRQcmVsb2FkXG4gICAgICA/IGF3YWl0IHByZWxvYWQod2FzbU1vZHVsZVVybClcbiAgICAgIDogKHdhc21Nb2R1bGVVcmwgPz8gZmFsbGJhY2tVcmwod2FzbU1vZHVsZUZpbGVuYW1lLCBwcmVmaXhPdmVycmlkZSkpO1xuICAgIHJldHVybiBbbmVlZFByZWxvYWQgPyB1cmwgOiB1bmRlZmluZWQsIGF3YWl0IGR5bmFtaWNJbXBvcnREZWZhdWx0PEVtc2NyaXB0ZW5Nb2R1bGVGYWN0b3J5PE9ydFdhc21Nb2R1bGU+Pih1cmwpXTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHsgRW52IH0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHR5cGUgeyBPcnRXYXNtTW9kdWxlIH0gZnJvbSAnLi93YXNtLXR5cGVzJztcbmltcG9ydCB7IGltcG9ydFdhc21Nb2R1bGUsIGluZmVyV2FzbVBhdGhQcmVmaXhGcm9tU2NyaXB0U3JjIH0gZnJvbSAnLi93YXNtLXV0aWxzLWltcG9ydCc7XG5cbmxldCB3YXNtOiBPcnRXYXNtTW9kdWxlIHwgdW5kZWZpbmVkO1xubGV0IGluaXRpYWxpemVkID0gZmFsc2U7XG5sZXQgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG5sZXQgYWJvcnRlZCA9IGZhbHNlO1xuXG5jb25zdCBpc011bHRpVGhyZWFkU3VwcG9ydGVkID0gKCk6IGJvb2xlYW4gPT4ge1xuICAvLyBJZiAnU2hhcmVkQXJyYXlCdWZmZXInIGlzIG5vdCBhdmFpbGFibGUsIFdlYkFzc2VtYmx5IHRocmVhZHMgd2lsbCBub3Qgd29yay5cbiAgaWYgKHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciA9PT0gJ3VuZGVmaW5lZCcpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cblxuICB0cnkge1xuICAgIC8vIFRlc3QgZm9yIHRyYW5zZmVyYWJpbGl0eSBvZiBTQUJzIChmb3IgYnJvd3NlcnMuIG5lZWRlZCBmb3IgRmlyZWZveClcbiAgICAvLyBodHRwczovL2dyb3Vwcy5nb29nbGUuY29tL2ZvcnVtLyMhbXNnL21vemlsbGEuZGV2LnBsYXRmb3JtL0lIa0JabEhFVHBBL2R3c01OY2hXRVFBSlxuICAgIGlmICh0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICBuZXcgTWVzc2FnZUNoYW5uZWwoKS5wb3J0MS5wb3N0TWVzc2FnZShuZXcgU2hhcmVkQXJyYXlCdWZmZXIoMSkpO1xuICAgIH1cblxuICAgIC8vIFRlc3QgZm9yIFdlYkFzc2VtYmx5IHRocmVhZHMgY2FwYWJpbGl0eSAoZm9yIGJvdGggYnJvd3NlcnMgYW5kIE5vZGUuanMpXG4gICAgLy8gVGhpcyB0eXBlZCBhcnJheSBpcyBhIFdlYkFzc2VtYmx5IHByb2dyYW0gY29udGFpbmluZyB0aHJlYWRlZCBpbnN0cnVjdGlvbnMuXG4gICAgcmV0dXJuIFdlYkFzc2VtYmx5LnZhbGlkYXRlKFxuICAgICAgbmV3IFVpbnQ4QXJyYXkoW1xuICAgICAgICAwLCA5NywgMTE1LCAxMDksIDEsIDAsIDAsIDAsIDEsIDQsIDEsIDk2LCAwLCAwLCAzLCAyLCAxLCAwLCA1LCA0LCAxLCAzLCAxLCAxLCAxMCwgMTEsIDEsIDksIDAsIDY1LCAwLCAyNTQsIDE2LFxuICAgICAgICAyLCAwLCAyNiwgMTEsXG4gICAgICBdKSxcbiAgICApO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCBpc1NpbWRTdXBwb3J0ZWQgPSAoKTogYm9vbGVhbiA9PiB7XG4gIHRyeSB7XG4gICAgLy8gVGVzdCBmb3IgV2ViQXNzZW1ibHkgU0lNRCBjYXBhYmlsaXR5IChmb3IgYm90aCBicm93c2VycyBhbmQgTm9kZS5qcylcbiAgICAvLyBUaGlzIHR5cGVkIGFycmF5IGlzIGEgV2ViQXNzZW1ibHkgcHJvZ3JhbSBjb250YWluaW5nIFNJTUQgaW5zdHJ1Y3Rpb25zLlxuXG4gICAgLy8gVGhlIGJpbmFyeSBkYXRhIGlzIGdlbmVyYXRlZCBmcm9tIHRoZSBmb2xsb3dpbmcgY29kZSBieSB3YXQyd2FzbTpcbiAgICAvL1xuICAgIC8vIChtb2R1bGVcbiAgICAvLyAgICh0eXBlICR0MCAoZnVuYykpXG4gICAgLy8gICAoZnVuYyAkZjAgKHR5cGUgJHQwKVxuICAgIC8vICAgICAoZHJvcFxuICAgIC8vICAgICAgIChpMzJ4NC5kb3RfaTE2eDhfc1xuICAgIC8vICAgICAgICAgKGk4eDE2LnNwbGF0XG4gICAgLy8gICAgICAgICAgIChpMzIuY29uc3QgMCkpXG4gICAgLy8gICAgICAgICAodjEyOC5jb25zdCBpMzJ4NCAweDAwMDAwMDAwIDB4MDAwMDAwMDAgMHgwMDAwMDAwMCAweDAwMDAwMDAwKSkpKSlcblxuICAgIHJldHVybiBXZWJBc3NlbWJseS52YWxpZGF0ZShcbiAgICAgIG5ldyBVaW50OEFycmF5KFtcbiAgICAgICAgMCwgOTcsIDExNSwgMTA5LCAxLCAwLCAwLCAwLCAxLCA0LCAxLCA5NiwgMCwgMCwgMywgMiwgMSwgMCwgMTAsIDMwLCAxLCAyOCwgMCwgNjUsIDAsIDI1MywgMTUsIDI1MywgMTIsIDAsIDAsIDAsXG4gICAgICAgIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDI1MywgMTg2LCAxLCAyNiwgMTEsXG4gICAgICBdKSxcbiAgICApO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCBpc1JlbGF4ZWRTaW1kU3VwcG9ydGVkID0gKCk6IGJvb2xlYW4gPT4ge1xuICB0cnkge1xuICAgIC8vIFRlc3QgZm9yIFdlYkFzc2VtYmx5IFJlbGF4ZWQgU0lNRCBjYXBhYmlsaXR5IChmb3IgYm90aCBicm93c2VycyBhbmQgTm9kZS5qcylcbiAgICAvLyBUaGlzIHR5cGVkIGFycmF5IGlzIGEgV2ViQXNzZW1ibHkgcHJvZ3JhbSBjb250YWluaW5nIFJlbGF4ZWQgU0lNRCBpbnN0cnVjdGlvbnMuXG5cbiAgICAvLyBUaGUgYmluYXJ5IGRhdGEgaXMgZ2VuZXJhdGVkIGZyb20gdGhlIGZvbGxvd2luZyBjb2RlIGJ5IHdhdDJ3YXNtOlxuICAgIC8vIChtb2R1bGVcbiAgICAvLyAgIChmdW5jIChyZXN1bHQgdjEyOClcbiAgICAvLyAgICAgIGkzMi5jb25zdCAxXG4gICAgLy8gICAgICBpOHgxNi5zcGxhdFxuICAgIC8vICAgICAgaTMyLmNvbnN0IDJcbiAgICAvLyAgICAgIGk4eDE2LnNwbGF0XG4gICAgLy8gICAgICBpMzIuY29uc3QgM1xuICAgIC8vICAgICAgaTh4MTYuc3BsYXRcbiAgICAvLyAgICAgIGkzMng0LnJlbGF4ZWRfZG90X2k4eDE2X2k3eDE2X2FkZF9zXG4gICAgLy8gICApXG4gICAgLy8gIClcbiAgICByZXR1cm4gV2ViQXNzZW1ibHkudmFsaWRhdGUoXG4gICAgICBuZXcgVWludDhBcnJheShbXG4gICAgICAgIDAsIDk3LCAxMTUsIDEwOSwgMSwgMCwgMCwgMCwgMSwgNSwgMSwgOTYsIDAsIDEsIDEyMywgMywgMiwgMSwgMCwgMTAsIDE5LCAxLCAxNywgMCwgNjUsIDEsIDI1MywgMTUsIDY1LCAyLCAyNTMsXG4gICAgICAgIDE1LCA2NSwgMywgMjUzLCAxNSwgMjUzLCAxNDcsIDIsIDExLFxuICAgICAgXSksXG4gICAgKTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGluaXRpYWxpemVXZWJBc3NlbWJseSA9IGFzeW5jIChmbGFnczogRW52LldlYkFzc2VtYmx5RmxhZ3MpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgaWYgKGluaXRpYWxpemVkKSB7XG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpO1xuICB9XG4gIGlmIChpbml0aWFsaXppbmcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJtdWx0aXBsZSBjYWxscyB0byAnaW5pdGlhbGl6ZVdlYkFzc2VtYmx5KCknIGRldGVjdGVkLlwiKTtcbiAgfVxuICBpZiAoYWJvcnRlZCkge1xuICAgIHRocm93IG5ldyBFcnJvcihcInByZXZpb3VzIGNhbGwgdG8gJ2luaXRpYWxpemVXZWJBc3NlbWJseSgpJyBmYWlsZWQuXCIpO1xuICB9XG5cbiAgaW5pdGlhbGl6aW5nID0gdHJ1ZTtcblxuICAvLyB3YXNtIGZsYWdzIGFyZSBhbHJlYWR5IGluaXRpYWxpemVkXG4gIGNvbnN0IHRpbWVvdXQgPSBmbGFncy5pbml0VGltZW91dCE7XG4gIGxldCBudW1UaHJlYWRzID0gZmxhZ3MubnVtVGhyZWFkcyE7XG5cbiAgLy8gZW5zdXJlIFNJTUQgaXMgc3VwcG9ydGVkXG4gIGlmIChmbGFncy5zaW1kID09PSBmYWxzZSkge1xuICAgIC8vIHNraXAgU0lNRCBmZWF0dXJlIGNoZWNraW5nIGFzIGl0IGlzIGRpc2FibGVkIGV4cGxpY2l0bHkgYnkgdXNlclxuICB9IGVsc2UgaWYgKGZsYWdzLnNpbWQgPT09ICdyZWxheGVkJykge1xuICAgIC8vIGNoZWNrIGlmIHJlbGF4ZWQgU0lNRCBpcyBzdXBwb3J0ZWRcbiAgICBpZiAoIWlzUmVsYXhlZFNpbWRTdXBwb3J0ZWQoKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdSZWxheGVkIFdlYkFzc2VtYmx5IFNJTUQgaXMgbm90IHN1cHBvcnRlZCBpbiB0aGUgY3VycmVudCBlbnZpcm9ubWVudC4nKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoIWlzU2ltZFN1cHBvcnRlZCgpKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdXZWJBc3NlbWJseSBTSU1EIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQuJyk7XG4gIH1cblxuICAvLyBjaGVjayBpZiBtdWx0aS10aHJlYWRpbmcgaXMgc3VwcG9ydGVkXG4gIGNvbnN0IG11bHRpVGhyZWFkU3VwcG9ydGVkID0gaXNNdWx0aVRocmVhZFN1cHBvcnRlZCgpO1xuICBpZiAobnVtVGhyZWFkcyA+IDEgJiYgIW11bHRpVGhyZWFkU3VwcG9ydGVkKSB7XG4gICAgaWYgKHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJyAmJiAhc2VsZi5jcm9zc09yaWdpbklzb2xhdGVkKSB7XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgICAgY29uc29sZS53YXJuKFxuICAgICAgICAnZW52Lndhc20ubnVtVGhyZWFkcyBpcyBzZXQgdG8gJyArXG4gICAgICAgICAgbnVtVGhyZWFkcyArXG4gICAgICAgICAgJywgYnV0IHRoaXMgd2lsbCBub3Qgd29yayB1bmxlc3MgeW91IGVuYWJsZSBjcm9zc09yaWdpbklzb2xhdGVkIG1vZGUuICcgK1xuICAgICAgICAgICdTZWUgaHR0cHM6Ly93ZWIuZGV2L2Nyb3NzLW9yaWdpbi1pc29sYXRpb24tZ3VpZGUvIGZvciBtb3JlIGluZm8uJyxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICAnV2ViQXNzZW1ibHkgbXVsdGktdGhyZWFkaW5nIGlzIG5vdCBzdXBwb3J0ZWQgaW4gdGhlIGN1cnJlbnQgZW52aXJvbm1lbnQuICcgKyAnRmFsbGluZyBiYWNrIHRvIHNpbmdsZS10aHJlYWRpbmcuJyxcbiAgICApO1xuXG4gICAgLy8gc2V0IGZsYWdzLm51bVRocmVhZHMgdG8gMSBzbyB0aGF0IE9ydEluaXQoKSB3aWxsIG5vdCBjcmVhdGUgYSBnbG9iYWwgdGhyZWFkIHBvb2wuXG4gICAgZmxhZ3MubnVtVGhyZWFkcyA9IG51bVRocmVhZHMgPSAxO1xuICB9XG5cbiAgY29uc3Qgd2FzbVBhdGhzID0gZmxhZ3Mud2FzbVBhdGhzO1xuICBjb25zdCB3YXNtUHJlZml4T3ZlcnJpZGUgPSB0eXBlb2Ygd2FzbVBhdGhzID09PSAnc3RyaW5nJyA/IHdhc21QYXRocyA6IHVuZGVmaW5lZDtcbiAgY29uc3QgbWpzUGF0aE92ZXJyaWRlRmxhZyA9ICh3YXNtUGF0aHMgYXMgRW52Lldhc21GaWxlUGF0aHMpPy5tanM7XG4gIGNvbnN0IG1qc1BhdGhPdmVycmlkZSA9IChtanNQYXRoT3ZlcnJpZGVGbGFnIGFzIFVSTCk/LmhyZWYgPz8gbWpzUGF0aE92ZXJyaWRlRmxhZztcbiAgY29uc3Qgd2FzbVBhdGhPdmVycmlkZUZsYWcgPSAod2FzbVBhdGhzIGFzIEVudi5XYXNtRmlsZVBhdGhzKT8ud2FzbTtcbiAgY29uc3Qgd2FzbVBhdGhPdmVycmlkZSA9ICh3YXNtUGF0aE92ZXJyaWRlRmxhZyBhcyBVUkwpPy5ocmVmID8/IHdhc21QYXRoT3ZlcnJpZGVGbGFnO1xuICBjb25zdCB3YXNtQmluYXJ5T3ZlcnJpZGUgPSBmbGFncy53YXNtQmluYXJ5O1xuXG4gIGNvbnN0IFtvYmplY3RVcmwsIG9ydFdhc21GYWN0b3J5XSA9IGF3YWl0IGltcG9ydFdhc21Nb2R1bGUobWpzUGF0aE92ZXJyaWRlLCB3YXNtUHJlZml4T3ZlcnJpZGUsIG51bVRocmVhZHMgPiAxKTtcblxuICBsZXQgaXNUaW1lb3V0ID0gZmFsc2U7XG5cbiAgY29uc3QgdGFza3M6IEFycmF5PFByb21pc2U8dm9pZD4+ID0gW107XG5cbiAgLy8gcHJvbWlzZSBmb3IgdGltZW91dFxuICBpZiAodGltZW91dCA+IDApIHtcbiAgICB0YXNrcy5wdXNoKFxuICAgICAgbmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcbiAgICAgICAgc2V0VGltZW91dCgoKSA9PiB7XG4gICAgICAgICAgaXNUaW1lb3V0ID0gdHJ1ZTtcbiAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgIH0sIHRpbWVvdXQpO1xuICAgICAgfSksXG4gICAgKTtcbiAgfVxuXG4gIC8vIHByb21pc2UgZm9yIG1vZHVsZSBpbml0aWFsaXphdGlvblxuICB0YXNrcy5wdXNoKFxuICAgIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGNvbnN0IGNvbmZpZzogUGFydGlhbDxPcnRXYXNtTW9kdWxlPiA9IHtcbiAgICAgICAgLyoqXG4gICAgICAgICAqIFRoZSBudW1iZXIgb2YgdGhyZWFkcy4gV2ViQXNzZW1ibHkgd2lsbCBjcmVhdGUgKE1vZHVsZS5udW1UaHJlYWRzIC0gMSkgd29ya2Vycy4gSWYgaXQgaXMgMSwgbm8gd29ya2VyIHdpbGwgYmVcbiAgICAgICAgICogY3JlYXRlZC5cbiAgICAgICAgICovXG4gICAgICAgIG51bVRocmVhZHMsXG4gICAgICB9O1xuXG4gICAgICBpZiAod2FzbUJpbmFyeU92ZXJyaWRlKSB7XG4gICAgICAgIC8vIFNldCBhIGN1c3RvbSBidWZmZXIgd2hpY2ggY29udGFpbnMgdGhlIFdlYkFzc2VtYmx5IGJpbmFyeS4gVGhpcyB3aWxsIHNraXAgdGhlIHdhc20gZmlsZSBmZXRjaGluZy5cbiAgICAgICAgY29uZmlnLndhc21CaW5hcnkgPSB3YXNtQmluYXJ5T3ZlcnJpZGU7XG4gICAgICB9IGVsc2UgaWYgKHdhc21QYXRoT3ZlcnJpZGUgfHwgd2FzbVByZWZpeE92ZXJyaWRlKSB7XG4gICAgICAgIC8vIEEgY2FsbGJhY2sgZnVuY3Rpb24gdG8gbG9jYXRlIHRoZSBXZWJBc3NlbWJseSBmaWxlLiBUaGUgZnVuY3Rpb24gc2hvdWxkIHJldHVybiB0aGUgZnVsbCBwYXRoIG9mIHRoZSBmaWxlLlxuICAgICAgICAvL1xuICAgICAgICAvLyBTaW5jZSBFbXNjcmlwdGVuIDMuMS41OCwgdGhpcyBmdW5jdGlvbiBpcyBvbmx5IGNhbGxlZCBmb3IgdGhlIC53YXNtIGZpbGUuXG4gICAgICAgIGNvbmZpZy5sb2NhdGVGaWxlID0gKGZpbGVOYW1lKSA9PiB3YXNtUGF0aE92ZXJyaWRlID8/IHdhc21QcmVmaXhPdmVycmlkZSArIGZpbGVOYW1lO1xuICAgICAgfSBlbHNlIGlmIChtanNQYXRoT3ZlcnJpZGUgJiYgbWpzUGF0aE92ZXJyaWRlLmluZGV4T2YoJ2Jsb2I6JykgIT09IDApIHtcbiAgICAgICAgLy8gaWYgbWpzIHBhdGggaXMgc3BlY2lmaWVkLCB1c2UgaXQgYXMgdGhlIGJhc2UgcGF0aCBmb3IgdGhlIC53YXNtIGZpbGUuXG4gICAgICAgIGNvbmZpZy5sb2NhdGVGaWxlID0gKGZpbGVOYW1lKSA9PiBuZXcgVVJMKGZpbGVOYW1lLCBtanNQYXRoT3ZlcnJpZGUpLmhyZWY7XG4gICAgICB9IGVsc2UgaWYgKG9iamVjdFVybCkge1xuICAgICAgICBjb25zdCBpbmZlcnJlZFdhc21QYXRoUHJlZml4ID0gaW5mZXJXYXNtUGF0aFByZWZpeEZyb21TY3JpcHRTcmMoKTtcbiAgICAgICAgaWYgKGluZmVycmVkV2FzbVBhdGhQcmVmaXgpIHtcbiAgICAgICAgICAvLyBpZiB0aGUgd2FzbSBtb2R1bGUgaXMgcHJlbG9hZGVkLCB1c2UgdGhlIGluZmVycmVkIHdhc20gcGF0aCBhcyB0aGUgYmFzZSBwYXRoIGZvciB0aGUgLndhc20gZmlsZS5cbiAgICAgICAgICBjb25maWcubG9jYXRlRmlsZSA9IChmaWxlTmFtZSkgPT4gaW5mZXJyZWRXYXNtUGF0aFByZWZpeCArIGZpbGVOYW1lO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIFx1NEUzQVx1NEU4Nlx1NTE3Q1x1NUJCOVx1NUMwRlx1NkUzOFx1NjIwRlx1NUU3M1x1NTNGMCwgXHU2MjExXHU0RUVDXHU5NzAwXHU4OTgxXHU1RjAwXHU2NTNFXHU3RUQ5XHU0RTBBXHU1QzQyXHU4MUVBXHU1REYxXHU1MkEwXHU4RjdEIHdhc20gXHU3Njg0XHU2NUI5XHU2Q0Q1XG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgaWYgKChmbGFncyBhcyBhbnkpLmluc3RhbnRpYXRlV2FzbSkge1xuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICBjb25maWcuaW5zdGFudGlhdGVXYXNtID0gKGZsYWdzIGFzIGFueSkuaW5zdGFudGlhdGVXYXNtO1xuICAgICAgfVxuXG4gICAgICBvcnRXYXNtRmFjdG9yeShjb25maWcpLnRoZW4oXG4gICAgICAgIC8vIHdhc20gbW9kdWxlIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseVxuICAgICAgICAobW9kdWxlKSA9PiB7XG4gICAgICAgICAgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICAgIHdhc20gPSBtb2R1bGU7XG4gICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgIGlmIChvYmplY3RVcmwpIHtcbiAgICAgICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwob2JqZWN0VXJsKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIC8vIHdhc20gbW9kdWxlIGZhaWxlZCB0byBpbml0aWFsaXplXG4gICAgICAgICh3aGF0KSA9PiB7XG4gICAgICAgICAgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgICAgICAgYWJvcnRlZCA9IHRydWU7XG4gICAgICAgICAgcmVqZWN0KHdoYXQpO1xuICAgICAgICB9LFxuICAgICAgKTtcbiAgICB9KSxcbiAgKTtcblxuICBhd2FpdCBQcm9taXNlLnJhY2UodGFza3MpO1xuXG4gIGlmIChpc1RpbWVvdXQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYFdlYkFzc2VtYmx5IGJhY2tlbmQgaW5pdGlhbGl6aW5nIGZhaWxlZCBkdWUgdG8gdGltZW91dDogJHt0aW1lb3V0fW1zYCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBnZXRJbnN0YW5jZSA9ICgpOiBPcnRXYXNtTW9kdWxlID0+IHtcbiAgaWYgKGluaXRpYWxpemVkICYmIHdhc20pIHtcbiAgICByZXR1cm4gd2FzbTtcbiAgfVxuXG4gIHRocm93IG5ldyBFcnJvcignV2ViQXNzZW1ibHkgaXMgbm90IGluaXRpYWxpemVkIHlldC4nKTtcbn07XG5cbmV4cG9ydCBjb25zdCBkaXNwb3NlID0gKCk6IHZvaWQgPT4ge1xuICBpZiAoaW5pdGlhbGl6ZWQgJiYgIWluaXRpYWxpemluZyAmJiAhYWJvcnRlZCkge1xuICAgIC8vIFRPRE86IGN1cnJlbnRseSBcIlBUaHJlYWQudGVybWluYXRlQWxsVGhyZWFkcygpXCIgaXMgbm90IGV4cG9zZWQgaW4gdGhlIHdhc20gbW9kdWxlLlxuICAgIC8vICAgICAgIEFuZCB0aGlzIGZ1bmN0aW9uIGlzIG5vdCB5ZXQgY2FsbGVkIGJ5IGFueSBjb2RlLlxuICAgIC8vICAgICAgIElmIGl0IGlzIG5lZWRlZCBpbiB0aGUgZnV0dXJlLCB3ZSBzaG91bGQgZXhwb3NlIGl0IGluIHRoZSB3YXNtIG1vZHVsZSBhbmQgdW5jb21tZW50IHRoZSBmb2xsb3dpbmcgbGluZS5cblxuICAgIC8vIHdhc20/LlBUaHJlYWQ/LnRlcm1pbmF0ZUFsbFRocmVhZHMoKTtcbiAgICB3YXNtID0gdW5kZWZpbmVkO1xuXG4gICAgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbiAgICBhYm9ydGVkID0gdHJ1ZTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHsgZ2V0SW5zdGFuY2UgfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5cbmV4cG9ydCBjb25zdCBhbGxvY1dhc21TdHJpbmcgPSAoZGF0YTogc3RyaW5nLCBhbGxvY3M6IG51bWJlcltdKTogbnVtYmVyID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgY29uc3QgZGF0YUxlbmd0aCA9IHdhc20ubGVuZ3RoQnl0ZXNVVEY4KGRhdGEpICsgMTtcbiAgY29uc3QgZGF0YU9mZnNldCA9IHdhc20uX21hbGxvYyhkYXRhTGVuZ3RoKTtcbiAgd2FzbS5zdHJpbmdUb1VURjgoZGF0YSwgZGF0YU9mZnNldCwgZGF0YUxlbmd0aCk7XG4gIGFsbG9jcy5wdXNoKGRhdGFPZmZzZXQpO1xuXG4gIHJldHVybiBkYXRhT2Zmc2V0O1xufTtcblxuaW50ZXJmYWNlIEV4dHJhT3B0aW9uc0hhbmRsZXIge1xuICAobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZDtcbn1cblxuZXhwb3J0IGNvbnN0IGl0ZXJhdGVFeHRyYU9wdGlvbnMgPSAoXG4gIG9wdGlvbnM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LFxuICBwcmVmaXg6IHN0cmluZyxcbiAgc2VlbjogV2Vha1NldDxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4sXG4gIGhhbmRsZXI6IEV4dHJhT3B0aW9uc0hhbmRsZXIsXG4pOiB2b2lkID0+IHtcbiAgaWYgKHR5cGVvZiBvcHRpb25zID09ICdvYmplY3QnICYmIG9wdGlvbnMgIT09IG51bGwpIHtcbiAgICBpZiAoc2Vlbi5oYXMob3B0aW9ucykpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2lyY3VsYXIgcmVmZXJlbmNlIGluIG9wdGlvbnMnKTtcbiAgICB9IGVsc2Uge1xuICAgICAgc2Vlbi5hZGQob3B0aW9ucyk7XG4gICAgfVxuICB9XG5cbiAgT2JqZWN0LmVudHJpZXMob3B0aW9ucykuZm9yRWFjaCgoW2tleSwgdmFsdWVdKSA9PiB7XG4gICAgY29uc3QgbmFtZSA9IHByZWZpeCA/IHByZWZpeCArIGtleSA6IGtleTtcbiAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xuICAgICAgaXRlcmF0ZUV4dHJhT3B0aW9ucyh2YWx1ZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgbmFtZSArICcuJywgc2VlbiwgaGFuZGxlcik7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcbiAgICAgIGhhbmRsZXIobmFtZSwgdmFsdWUudG9TdHJpbmcoKSk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykge1xuICAgICAgaGFuZGxlcihuYW1lLCB2YWx1ZSA/ICcxJyA6ICcwJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgaGFuZGxlIGV4dHJhIGNvbmZpZyB0eXBlOiAke3R5cGVvZiB2YWx1ZX1gKTtcbiAgICB9XG4gIH0pO1xufTtcblxuLyoqXG4gKiBjaGVjayB3ZWIgYXNzZW1ibHkgQVBJJ3MgbGFzdCBlcnJvciBhbmQgdGhyb3cgZXJyb3IgaWYgYW55IGVycm9yIG9jY3VycmVkLlxuICogQHBhcmFtIG1lc3NhZ2UgYSBtZXNzYWdlIHVzZWQgd2hlbiBhbiBlcnJvciBvY2N1cnJlZC5cbiAqL1xuZXhwb3J0IGNvbnN0IGNoZWNrTGFzdEVycm9yID0gKG1lc3NhZ2U6IHN0cmluZyk6IHZvaWQgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICBjb25zdCBzdGFjayA9IHdhc20uc3RhY2tTYXZlKCk7XG4gIHRyeSB7XG4gICAgY29uc3QgcHRyU2l6ZSA9IHdhc20uUFRSX1NJWkU7XG4gICAgY29uc3QgcGFyYW1zT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDIgKiBwdHJTaXplKTtcbiAgICB3YXNtLl9PcnRHZXRMYXN0RXJyb3IocGFyYW1zT2Zmc2V0LCBwYXJhbXNPZmZzZXQgKyBwdHJTaXplKTtcbiAgICBjb25zdCBlcnJvckNvZGUgPSBOdW1iZXIod2FzbS5nZXRWYWx1ZShwYXJhbXNPZmZzZXQsIHB0clNpemUgPT09IDQgPyAnaTMyJyA6ICdpNjQnKSk7XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlUG9pbnRlciA9IHdhc20uZ2V0VmFsdWUocGFyYW1zT2Zmc2V0ICsgcHRyU2l6ZSwgJyonKTtcbiAgICBjb25zdCBlcnJvck1lc3NhZ2UgPSBlcnJvck1lc3NhZ2VQb2ludGVyID8gd2FzbS5VVEY4VG9TdHJpbmcoZXJyb3JNZXNzYWdlUG9pbnRlcikgOiAnJztcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7bWVzc2FnZX0gRVJST1JfQ09ERTogJHtlcnJvckNvZGV9LCBFUlJPUl9NRVNTQUdFOiAke2Vycm9yTWVzc2FnZX1gKTtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLnN0YWNrUmVzdG9yZShzdGFjayk7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7IEluZmVyZW5jZVNlc3Npb24gfSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQgeyBnZXRJbnN0YW5jZSB9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcbmltcG9ydCB7IGFsbG9jV2FzbVN0cmluZywgY2hlY2tMYXN0RXJyb3IsIGl0ZXJhdGVFeHRyYU9wdGlvbnMgfSBmcm9tICcuL3dhc20tdXRpbHMnO1xuXG5leHBvcnQgY29uc3Qgc2V0UnVuT3B0aW9ucyA9IChvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOiBbbnVtYmVyLCBudW1iZXJbXV0gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgbGV0IHJ1bk9wdGlvbnNIYW5kbGUgPSAwO1xuICBjb25zdCBhbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3QgcnVuT3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcblxuICB0cnkge1xuICAgIGlmIChvcHRpb25zPy5sb2dTZXZlcml0eUxldmVsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJ1bk9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCA9IDI7IC8vIERlZmF1bHQgdG8gd2FybmluZ1xuICAgIH0gZWxzZSBpZiAoXG4gICAgICB0eXBlb2Ygb3B0aW9ucy5sb2dTZXZlcml0eUxldmVsICE9PSAnbnVtYmVyJyB8fFxuICAgICAgIU51bWJlci5pc0ludGVnZXIob3B0aW9ucy5sb2dTZXZlcml0eUxldmVsKSB8fFxuICAgICAgb3B0aW9ucy5sb2dTZXZlcml0eUxldmVsIDwgMCB8fFxuICAgICAgb3B0aW9ucy5sb2dTZXZlcml0eUxldmVsID4gNFxuICAgICkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgc2VydmVyaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWx9YCk7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnM/LmxvZ1ZlcmJvc2l0eUxldmVsID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJ1bk9wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWwgPSAwOyAvLyBEZWZhdWx0IHRvIDBcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgdmVyYm9zaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zPy50ZXJtaW5hdGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgcnVuT3B0aW9ucy50ZXJtaW5hdGUgPSBmYWxzZTtcbiAgICB9XG5cbiAgICBsZXQgdGFnRGF0YU9mZnNldCA9IDA7XG4gICAgaWYgKG9wdGlvbnM/LnRhZyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICB0YWdEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKG9wdGlvbnMudGFnLCBhbGxvY3MpO1xuICAgIH1cblxuICAgIHJ1bk9wdGlvbnNIYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVSdW5PcHRpb25zKFxuICAgICAgcnVuT3B0aW9ucy5sb2dTZXZlcml0eUxldmVsISxcbiAgICAgIHJ1bk9wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWwhLFxuICAgICAgISFydW5PcHRpb25zLnRlcm1pbmF0ZSEsXG4gICAgICB0YWdEYXRhT2Zmc2V0LFxuICAgICk7XG4gICAgaWYgKHJ1bk9wdGlvbnNIYW5kbGUgPT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKFwiQ2FuJ3QgY3JlYXRlIHJ1biBvcHRpb25zLlwiKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucz8uZXh0cmEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaXRlcmF0ZUV4dHJhT3B0aW9ucyhvcHRpb25zLmV4dHJhLCAnJywgbmV3IFdlYWtTZXQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KCksIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoa2V5LCBhbGxvY3MpO1xuICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcodmFsdWUsIGFsbG9jcyk7XG5cbiAgICAgICAgaWYgKHdhc20uX09ydEFkZFJ1bkNvbmZpZ0VudHJ5KHJ1bk9wdGlvbnNIYW5kbGUsIGtleURhdGFPZmZzZXQsIHZhbHVlRGF0YU9mZnNldCkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgcnVuIGNvbmZpZyBlbnRyeTogJHtrZXl9IC0gJHt2YWx1ZX0uYCk7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cblxuICAgIHJldHVybiBbcnVuT3B0aW9uc0hhbmRsZSwgYWxsb2NzXTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChydW5PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlUnVuT3B0aW9ucyhydW5PcHRpb25zSGFuZGxlKTtcbiAgICB9XG4gICAgYWxsb2NzLmZvckVhY2goKGFsbG9jKSA9PiB3YXNtLl9mcmVlKGFsbG9jKSk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHR5cGUgeyBJbmZlcmVuY2VTZXNzaW9uIH0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHsgZ2V0SW5zdGFuY2UgfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5pbXBvcnQgeyBhbGxvY1dhc21TdHJpbmcsIGNoZWNrTGFzdEVycm9yLCBpdGVyYXRlRXh0cmFPcHRpb25zIH0gZnJvbSAnLi93YXNtLXV0aWxzJztcblxuY29uc3QgZ2V0R3JhcGhPcHRpbXphdGlvbkxldmVsID0gKGdyYXBoT3B0aW1pemF0aW9uTGV2ZWw6IHN0cmluZyB8IHVua25vd24pOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGdyYXBoT3B0aW1pemF0aW9uTGV2ZWwpIHtcbiAgICBjYXNlICdkaXNhYmxlZCc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdiYXNpYyc6XG4gICAgICByZXR1cm4gMTtcbiAgICBjYXNlICdleHRlbmRlZCc6XG4gICAgICByZXR1cm4gMjtcbiAgICBjYXNlICdhbGwnOlxuICAgICAgcmV0dXJuIDk5O1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGdyYXBoIG9wdGltaXphdGlvbiBsZXZlbDogJHtncmFwaE9wdGltaXphdGlvbkxldmVsfWApO1xuICB9XG59O1xuXG5jb25zdCBnZXRFeGVjdXRpb25Nb2RlID0gKGV4ZWN1dGlvbk1vZGU6ICdzZXF1ZW50aWFsJyB8ICdwYXJhbGxlbCcpOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGV4ZWN1dGlvbk1vZGUpIHtcbiAgICBjYXNlICdzZXF1ZW50aWFsJzpcbiAgICAgIHJldHVybiAwO1xuICAgIGNhc2UgJ3BhcmFsbGVsJzpcbiAgICAgIHJldHVybiAxO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGV4ZWN1dGlvbiBtb2RlOiAke2V4ZWN1dGlvbk1vZGV9YCk7XG4gIH1cbn07XG5cbmNvbnN0IGFwcGVuZERlZmF1bHRPcHRpb25zID0gKG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOiB2b2lkID0+IHtcbiAgaWYgKCFvcHRpb25zLmV4dHJhKSB7XG4gICAgb3B0aW9ucy5leHRyYSA9IHt9O1xuICB9XG4gIGlmICghb3B0aW9ucy5leHRyYS5zZXNzaW9uKSB7XG4gICAgb3B0aW9ucy5leHRyYS5zZXNzaW9uID0ge307XG4gIH1cbiAgY29uc3Qgc2Vzc2lvbiA9IG9wdGlvbnMuZXh0cmEuc2Vzc2lvbiBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xuICBpZiAoIXNlc3Npb24udXNlX29ydF9tb2RlbF9ieXRlc19kaXJlY3RseSkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBjYW1lbGNhc2VcbiAgICBzZXNzaW9uLnVzZV9vcnRfbW9kZWxfYnl0ZXNfZGlyZWN0bHkgPSAnMSc7XG4gIH1cblxuICAvLyBpZiB1c2luZyBKU0VQIHdpdGggV2ViR1BVLCBhbHdheXMgZGlzYWJsZSBtZW1vcnkgcGF0dGVyblxuICBpZiAoXG4gICAgb3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMgJiZcbiAgICBvcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycy5zb21lKChlcCkgPT4gKHR5cGVvZiBlcCA9PT0gJ3N0cmluZycgPyBlcCA6IGVwLm5hbWUpID09PSAnd2ViZ3B1JylcbiAgKSB7XG4gICAgb3B0aW9ucy5lbmFibGVNZW1QYXR0ZXJuID0gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IGFwcGVuZFNlc3Npb25Db25maWcgPSAoc2Vzc2lvbk9wdGlvbnNIYW5kbGU6IG51bWJlciwga2V5OiBzdHJpbmcsIHZhbHVlOiBzdHJpbmcsIGFsbG9jczogbnVtYmVyW10pOiB2b2lkID0+IHtcbiAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhrZXksIGFsbG9jcyk7XG4gIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh2YWx1ZSwgYWxsb2NzKTtcbiAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT0gMCkge1xuICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJHtrZXl9IC0gJHt2YWx1ZX0uYCk7XG4gIH1cbn07XG5cbmNvbnN0IGFwcGVuZEVwT3B0aW9uID0gKGVwT3B0aW9uczogQXJyYXk8W251bWJlciwgbnVtYmVyXT4sIGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBhbGxvY3M6IG51bWJlcltdKTogdm9pZCA9PiB7XG4gIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoa2V5LCBhbGxvY3MpO1xuICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcodmFsdWUsIGFsbG9jcyk7XG4gIGVwT3B0aW9ucy5wdXNoKFtrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXRdKTtcbn07XG5cbmNvbnN0IHNldEV4ZWN1dGlvblByb3ZpZGVycyA9IGFzeW5jIChcbiAgc2Vzc2lvbk9wdGlvbnNIYW5kbGU6IG51bWJlcixcbiAgZXhlY3V0aW9uUHJvdmlkZXJzOiByZWFkb25seSBJbmZlcmVuY2VTZXNzaW9uLkV4ZWN1dGlvblByb3ZpZGVyQ29uZmlnW10sXG4gIGFsbG9jczogbnVtYmVyW10sXG4pOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgZm9yIChjb25zdCBlcCBvZiBleGVjdXRpb25Qcm92aWRlcnMpIHtcbiAgICBsZXQgZXBOYW1lID0gdHlwZW9mIGVwID09PSAnc3RyaW5nJyA/IGVwIDogZXAubmFtZTtcbiAgICBjb25zdCBlcE9wdGlvbnM6IEFycmF5PFtudW1iZXIsIG51bWJlcl0+ID0gW107XG5cbiAgICAvLyBjaGVjayBFUCBuYW1lXG4gICAgc3dpdGNoIChlcE5hbWUpIHtcbiAgICAgIGNhc2UgJ3dlYm5uJzpcbiAgICAgICAgZXBOYW1lID0gJ1dFQk5OJztcbiAgICAgICAgaWYgKHR5cGVvZiBlcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBjb25zdCB3ZWJubk9wdGlvbnMgPSBlcCBhcyBJbmZlcmVuY2VTZXNzaW9uLldlYk5ORXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgICAgICAgLy8gY29uc3QgY29udGV4dCA9ICh3ZWJubk9wdGlvbnMgYXMgSW5mZXJlbmNlU2Vzc2lvbi5XZWJOTk9wdGlvbnNXaXRoTUxDb250ZXh0KT8uY29udGV4dDtcbiAgICAgICAgICBjb25zdCBkZXZpY2VUeXBlID0gKHdlYm5uT3B0aW9ucyBhcyBJbmZlcmVuY2VTZXNzaW9uLldlYk5OQ29udGV4dE9wdGlvbnMpPy5kZXZpY2VUeXBlO1xuICAgICAgICAgIGlmIChkZXZpY2VUeXBlKSB7XG4gICAgICAgICAgICBhcHBlbmRTZXNzaW9uQ29uZmlnKHNlc3Npb25PcHRpb25zSGFuZGxlLCAnZGV2aWNlVHlwZScsIGRldmljZVR5cGUsIGFsbG9jcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnd2ViZ3B1JzpcbiAgICAgICAgaWYgKEJVSUxEX0RFRlMuVVNFX1dFQkdQVV9FUCkge1xuICAgICAgICAgIGVwTmFtZSA9ICdXZWJHUFUnO1xuICAgICAgICAgIGxldCBjdXN0b21EZXZpY2U6IEdQVURldmljZSB8IHVuZGVmaW5lZDtcblxuICAgICAgICAgIGlmICh0eXBlb2YgZXAgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICBjb25zdCBjdXN0b21PcHRpb25zID0gZXAgYXMgdW5rbm93biBhcyB7IGRldmljZTogR1BVRGV2aWNlIH07XG4gICAgICAgICAgICBpZiAoY3VzdG9tT3B0aW9ucy5kZXZpY2UpIHtcbiAgICAgICAgICAgICAgaWYgKHR5cGVvZiBHUFVEZXZpY2UgIT09ICd1bmRlZmluZWQnICYmIGN1c3RvbU9wdGlvbnMuZGV2aWNlIGluc3RhbmNlb2YgR1BVRGV2aWNlKSB7XG4gICAgICAgICAgICAgICAgY3VzdG9tRGV2aWNlID0gY3VzdG9tT3B0aW9ucy5kZXZpY2U7XG4gICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEdQVSBkZXZpY2Ugc2V0IGluIFdlYkdQVSBFUCBvcHRpb25zLicpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFRPRE86IGhhbmRsZSBtb3JlIG9wdGlvbnNcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBjb25zdCBpbmZvID0gZ2V0SW5zdGFuY2UoKS53ZWJncHVSZWdpc3RlckRldmljZSEoY3VzdG9tRGV2aWNlKTtcbiAgICAgICAgICBpZiAoaW5mbykge1xuICAgICAgICAgICAgY29uc3QgW2RldmljZUlkLCBpbnN0YW5jZUhhbmRsZSwgZGV2aWNlSGFuZGxlXSA9IGluZm87XG4gICAgICAgICAgICBhcHBlbmRFcE9wdGlvbihlcE9wdGlvbnMsICdkZXZpY2VJZCcsIGRldmljZUlkLnRvU3RyaW5nKCksIGFsbG9jcyk7XG4gICAgICAgICAgICBhcHBlbmRFcE9wdGlvbihlcE9wdGlvbnMsICd3ZWJncHVJbnN0YW5jZScsIGluc3RhbmNlSGFuZGxlLnRvU3RyaW5nKCksIGFsbG9jcyk7XG4gICAgICAgICAgICBhcHBlbmRFcE9wdGlvbihlcE9wdGlvbnMsICd3ZWJncHVEZXZpY2UnLCBkZXZpY2VIYW5kbGUudG9TdHJpbmcoKSwgYWxsb2NzKTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZXBOYW1lID0gJ0pTJztcbiAgICAgICAgICBpZiAodHlwZW9mIGVwICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY29uc3Qgd2ViZ3B1T3B0aW9ucyA9IGVwIGFzIEluZmVyZW5jZVNlc3Npb24uV2ViR3B1RXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgICAgICAgICBpZiAod2ViZ3B1T3B0aW9ucz8ucHJlZmVycmVkTGF5b3V0KSB7XG4gICAgICAgICAgICAgIGlmICh3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dCAhPT0gJ05DSFcnICYmIHdlYmdwdU9wdGlvbnMucHJlZmVycmVkTGF5b3V0ICE9PSAnTkhXQycpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHByZWZlcnJlZExheW91dCBtdXN0IGJlIGVpdGhlciAnTkNIVycgb3IgJ05IV0MnOiAke3dlYmdwdU9wdGlvbnMucHJlZmVycmVkTGF5b3V0fWApO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGFwcGVuZFNlc3Npb25Db25maWcoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsICdwcmVmZXJyZWRMYXlvdXQnLCB3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dCwgYWxsb2NzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgYnJlYWs7XG4gICAgICBjYXNlICd3YXNtJzpcbiAgICAgIGNhc2UgJ2NwdSc6XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBub3Qgc3VwcG9ydGVkIGV4ZWN1dGlvbiBwcm92aWRlcjogJHtlcE5hbWV9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgZXBOYW1lRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhlcE5hbWUsIGFsbG9jcyk7XG4gICAgY29uc3QgZXBPcHRpb25zQ291bnQgPSBlcE9wdGlvbnMubGVuZ3RoO1xuICAgIGxldCBrZXlzT2Zmc2V0ID0gMDtcbiAgICBsZXQgdmFsdWVzT2Zmc2V0ID0gMDtcbiAgICBpZiAoZXBPcHRpb25zQ291bnQgPiAwKSB7XG4gICAgICBrZXlzT2Zmc2V0ID0gZ2V0SW5zdGFuY2UoKS5fbWFsbG9jKGVwT3B0aW9uc0NvdW50ICogZ2V0SW5zdGFuY2UoKS5QVFJfU0laRSk7XG4gICAgICBhbGxvY3MucHVzaChrZXlzT2Zmc2V0KTtcbiAgICAgIHZhbHVlc09mZnNldCA9IGdldEluc3RhbmNlKCkuX21hbGxvYyhlcE9wdGlvbnNDb3VudCAqIGdldEluc3RhbmNlKCkuUFRSX1NJWkUpO1xuICAgICAgYWxsb2NzLnB1c2godmFsdWVzT2Zmc2V0KTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZXBPcHRpb25zQ291bnQ7IGkrKykge1xuICAgICAgICBnZXRJbnN0YW5jZSgpLnNldFZhbHVlKGtleXNPZmZzZXQgKyBpICogZ2V0SW5zdGFuY2UoKS5QVFJfU0laRSwgZXBPcHRpb25zW2ldWzBdLCAnKicpO1xuICAgICAgICBnZXRJbnN0YW5jZSgpLnNldFZhbHVlKHZhbHVlc09mZnNldCArIGkgKiBnZXRJbnN0YW5jZSgpLlBUUl9TSVpFLCBlcE9wdGlvbnNbaV1bMV0sICcqJyk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChcbiAgICAgIChhd2FpdCBnZXRJbnN0YW5jZSgpLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcihcbiAgICAgICAgc2Vzc2lvbk9wdGlvbnNIYW5kbGUsXG4gICAgICAgIGVwTmFtZURhdGFPZmZzZXQsXG4gICAgICAgIGtleXNPZmZzZXQsXG4gICAgICAgIHZhbHVlc09mZnNldCxcbiAgICAgICAgZXBPcHRpb25zQ291bnQsXG4gICAgICApKSAhPT0gMFxuICAgICkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGFwcGVuZCBleGVjdXRpb24gcHJvdmlkZXI6ICR7ZXBOYW1lfS5gKTtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBzZXRTZXNzaW9uT3B0aW9ucyA9IGFzeW5jIChvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFByb21pc2U8W251bWJlciwgbnVtYmVyW11dPiA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBsZXQgc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPSAwO1xuICBjb25zdCBhbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3Qgc2Vzc2lvbk9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICBhcHBlbmREZWZhdWx0T3B0aW9ucyhzZXNzaW9uT3B0aW9ucyk7XG5cbiAgdHJ5IHtcbiAgICBjb25zdCBncmFwaE9wdGltaXphdGlvbkxldmVsID0gZ2V0R3JhcGhPcHRpbXphdGlvbkxldmVsKHNlc3Npb25PcHRpb25zLmdyYXBoT3B0aW1pemF0aW9uTGV2ZWwgPz8gJ2FsbCcpO1xuICAgIGNvbnN0IGV4ZWN1dGlvbk1vZGUgPSBnZXRFeGVjdXRpb25Nb2RlKHNlc3Npb25PcHRpb25zLmV4ZWN1dGlvbk1vZGUgPz8gJ3NlcXVlbnRpYWwnKTtcbiAgICBjb25zdCBsb2dJZERhdGFPZmZzZXQgPVxuICAgICAgdHlwZW9mIHNlc3Npb25PcHRpb25zLmxvZ0lkID09PSAnc3RyaW5nJyA/IGFsbG9jV2FzbVN0cmluZyhzZXNzaW9uT3B0aW9ucy5sb2dJZCwgYWxsb2NzKSA6IDA7XG5cbiAgICBjb25zdCBsb2dTZXZlcml0eUxldmVsID0gc2Vzc2lvbk9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCA/PyAyOyAvLyBEZWZhdWx0IHRvIDIgLSB3YXJuaW5nXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGxvZ1NldmVyaXR5TGV2ZWwpIHx8IGxvZ1NldmVyaXR5TGV2ZWwgPCAwIHx8IGxvZ1NldmVyaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyBzZXJ2ZXJpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke2xvZ1NldmVyaXR5TGV2ZWx9YCk7XG4gICAgfVxuXG4gICAgY29uc3QgbG9nVmVyYm9zaXR5TGV2ZWwgPSBzZXNzaW9uT3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCA/PyAwOyAvLyBEZWZhdWx0IHRvIDAgLSB2ZXJib3NlXG4gICAgaWYgKCFOdW1iZXIuaXNJbnRlZ2VyKGxvZ1ZlcmJvc2l0eUxldmVsKSB8fCBsb2dWZXJib3NpdHlMZXZlbCA8IDAgfHwgbG9nVmVyYm9zaXR5TGV2ZWwgPiA0KSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyB2ZXJib3NpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke2xvZ1ZlcmJvc2l0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGNvbnN0IG9wdGltaXplZE1vZGVsRmlsZVBhdGhPZmZzZXQgPVxuICAgICAgdHlwZW9mIHNlc3Npb25PcHRpb25zLm9wdGltaXplZE1vZGVsRmlsZVBhdGggPT09ICdzdHJpbmcnXG4gICAgICAgID8gYWxsb2NXYXNtU3RyaW5nKHNlc3Npb25PcHRpb25zLm9wdGltaXplZE1vZGVsRmlsZVBhdGgsIGFsbG9jcylcbiAgICAgICAgOiAwO1xuXG4gICAgc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVTZXNzaW9uT3B0aW9ucyhcbiAgICAgIGdyYXBoT3B0aW1pemF0aW9uTGV2ZWwsXG4gICAgICAhIXNlc3Npb25PcHRpb25zLmVuYWJsZUNwdU1lbUFyZW5hLFxuICAgICAgISFzZXNzaW9uT3B0aW9ucy5lbmFibGVNZW1QYXR0ZXJuLFxuICAgICAgZXhlY3V0aW9uTW9kZSxcbiAgICAgICEhc2Vzc2lvbk9wdGlvbnMuZW5hYmxlUHJvZmlsaW5nLFxuICAgICAgMCxcbiAgICAgIGxvZ0lkRGF0YU9mZnNldCxcbiAgICAgIGxvZ1NldmVyaXR5TGV2ZWwsXG4gICAgICBsb2dWZXJib3NpdHlMZXZlbCxcbiAgICAgIG9wdGltaXplZE1vZGVsRmlsZVBhdGhPZmZzZXQsXG4gICAgKTtcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKFwiQ2FuJ3QgY3JlYXRlIHNlc3Npb24gb3B0aW9ucy5cIik7XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycykge1xuICAgICAgYXdhaXQgc2V0RXhlY3V0aW9uUHJvdmlkZXJzKHNlc3Npb25PcHRpb25zSGFuZGxlLCBzZXNzaW9uT3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMsIGFsbG9jcyk7XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmVuYWJsZUdyYXBoQ2FwdHVyZSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpZiAodHlwZW9mIHNlc3Npb25PcHRpb25zLmVuYWJsZUdyYXBoQ2FwdHVyZSAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgZW5hYmxlR3JhcGhDYXB0dXJlIG11c3QgYmUgYSBib29sZWFuIHZhbHVlOiAke3Nlc3Npb25PcHRpb25zLmVuYWJsZUdyYXBoQ2FwdHVyZX1gKTtcbiAgICAgIH1cbiAgICAgIGFwcGVuZFNlc3Npb25Db25maWcoXG4gICAgICAgIHNlc3Npb25PcHRpb25zSGFuZGxlLFxuICAgICAgICAnZW5hYmxlR3JhcGhDYXB0dXJlJyxcbiAgICAgICAgc2Vzc2lvbk9wdGlvbnMuZW5hYmxlR3JhcGhDYXB0dXJlLnRvU3RyaW5nKCksXG4gICAgICAgIGFsbG9jcyxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmZyZWVEaW1lbnNpb25PdmVycmlkZXMpIHtcbiAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhzZXNzaW9uT3B0aW9ucy5mcmVlRGltZW5zaW9uT3ZlcnJpZGVzKSkge1xuICAgICAgICBpZiAodHlwZW9mIG5hbWUgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZSBuYW1lIG11c3QgYmUgYSBzdHJpbmc6ICR7bmFtZX1gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcih2YWx1ZSkgfHwgdmFsdWUgPCAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmcmVlIGRpbWVuc2lvbiBvdmVycmlkZSB2YWx1ZSBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXI6ICR7dmFsdWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbmFtZU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhuYW1lLCBhbGxvY3MpO1xuICAgICAgICBpZiAod2FzbS5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlKHNlc3Npb25PcHRpb25zSGFuZGxlLCBuYW1lT2Zmc2V0LCB2YWx1ZSkgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGU6ICR7bmFtZX0gLSAke3ZhbHVlfS5gKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5leHRyYSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBpdGVyYXRlRXh0cmFPcHRpb25zKHNlc3Npb25PcHRpb25zLmV4dHJhLCAnJywgbmV3IFdlYWtTZXQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KCksIChrZXksIHZhbHVlKSA9PiB7XG4gICAgICAgIGFwcGVuZFNlc3Npb25Db25maWcoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGtleSwgdmFsdWUsIGFsbG9jcyk7XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gW3Nlc3Npb25PcHRpb25zSGFuZGxlLCBhbGxvY3NdO1xuICB9IGNhdGNoIChlKSB7XG4gICAgaWYgKHNlc3Npb25PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICBpZiAod2FzbS5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zKHNlc3Npb25PcHRpb25zSGFuZGxlKSAhPT0gMCkge1xuICAgICAgICBjaGVja0xhc3RFcnJvcihcIkNhbid0IHJlbGVhc2Ugc2Vzc2lvbiBvcHRpb25zLlwiKTtcbiAgICAgIH1cbiAgICB9XG4gICAgYWxsb2NzLmZvckVhY2goKGFsbG9jKSA9PiB3YXNtLl9mcmVlKGFsbG9jKSk7XG4gICAgdGhyb3cgZTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHsgVGVuc29yIH0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuLy8gYSBkdW1teSB0eXBlIGRlY2xhcmF0aW9uIGZvciBGbG9hdDE2QXJyYXkgaW4gY2FzZSBhbnkgcG9seWZpbGwgaXMgYXZhaWxhYmxlLlxuZGVjbGFyZSBnbG9iYWwge1xuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gIGNvbnN0IEZsb2F0MTZBcnJheTogYW55O1xufVxuXG4vLyBUaGlzIGZpbGUgaW5jbHVkZXMgY29tbW9uIGRlZmluaXRpb25zLiBUaGV5IGRvIE5PVCBoYXZlIGRlcGVuZGVuY3kgb24gdGhlIFdlYkFzc2VtYmx5IGluc3RhbmNlLlxuXG4vKipcbiAqIENvcGllZCBmcm9tIE9OTlggZGVmaW5pdGlvbi4gVXNlIHRoaXMgdG8gZHJvcCBkZXBlbmRlbmN5ICdvbm54X3Byb3RvJyB0byBkZWNyZWFzZSBjb21waWxlZCAuanMgZmlsZSBzaXplLlxuICovXG5leHBvcnQgY29uc3QgZW51bSBEYXRhVHlwZSB7XG4gIHVuZGVmaW5lZCA9IDAsXG4gIGZsb2F0ID0gMSxcbiAgdWludDggPSAyLFxuICBpbnQ4ID0gMyxcbiAgdWludDE2ID0gNCxcbiAgaW50MTYgPSA1LFxuICBpbnQzMiA9IDYsXG4gIGludDY0ID0gNyxcbiAgc3RyaW5nID0gOCxcbiAgYm9vbCA9IDksXG4gIGZsb2F0MTYgPSAxMCxcbiAgZG91YmxlID0gMTEsXG4gIHVpbnQzMiA9IDEyLFxuICB1aW50NjQgPSAxMyxcbiAgY29tcGxleDY0ID0gMTQsXG4gIGNvbXBsZXgxMjggPSAxNSxcbiAgYmZsb2F0MTYgPSAxNixcblxuICAvLyA0LWJpdCBkYXRhLXR5cGVzXG4gIHVpbnQ0ID0gMjEsXG4gIGludDQgPSAyMixcbn1cblxuLyoqXG4gKiBNYXAgc3RyaW5nIHRlbnNvciBkYXRhIHRvIGVudW0gdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtID0gKHR5cGU6IHN0cmluZyk6IERhdGFUeXBlID0+IHtcbiAgc3dpdGNoICh0eXBlKSB7XG4gICAgY2FzZSAnaW50OCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50ODtcbiAgICBjYXNlICd1aW50OCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDg7XG4gICAgY2FzZSAnYm9vbCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuYm9vbDtcbiAgICBjYXNlICdpbnQxNic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50MTY7XG4gICAgY2FzZSAndWludDE2JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50MTY7XG4gICAgY2FzZSAnaW50MzInOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDMyO1xuICAgIGNhc2UgJ3VpbnQzMic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDMyO1xuICAgIGNhc2UgJ2Zsb2F0MTYnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmZsb2F0MTY7XG4gICAgY2FzZSAnZmxvYXQzMic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuZmxvYXQ7XG4gICAgY2FzZSAnZmxvYXQ2NCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuZG91YmxlO1xuICAgIGNhc2UgJ3N0cmluZyc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuc3RyaW5nO1xuICAgIGNhc2UgJ2ludDY0JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5pbnQ2NDtcbiAgICBjYXNlICd1aW50NjQnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQ2NDtcbiAgICBjYXNlICdpbnQ0JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5pbnQ0O1xuICAgIGNhc2UgJ3VpbnQ0JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50NDtcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGRhdGEgdHlwZTogJHt0eXBlfWApO1xuICB9XG59O1xuXG4vKipcbiAqIE1hcCBlbnVtIHZhbHVlIHRvIHN0cmluZyB0ZW5zb3IgZGF0YVxuICovXG5leHBvcnQgY29uc3QgdGVuc29yRGF0YVR5cGVFbnVtVG9TdHJpbmcgPSAodHlwZVByb3RvOiBEYXRhVHlwZSk6IFRlbnNvci5UeXBlID0+IHtcbiAgc3dpdGNoICh0eXBlUHJvdG8pIHtcbiAgICBjYXNlIERhdGFUeXBlLmludDg6XG4gICAgICByZXR1cm4gJ2ludDgnO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDg6XG4gICAgICByZXR1cm4gJ3VpbnQ4JztcbiAgICBjYXNlIERhdGFUeXBlLmJvb2w6XG4gICAgICByZXR1cm4gJ2Jvb2wnO1xuICAgIGNhc2UgRGF0YVR5cGUuaW50MTY6XG4gICAgICByZXR1cm4gJ2ludDE2JztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQxNjpcbiAgICAgIHJldHVybiAndWludDE2JztcbiAgICBjYXNlIERhdGFUeXBlLmludDMyOlxuICAgICAgcmV0dXJuICdpbnQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS51aW50MzI6XG4gICAgICByZXR1cm4gJ3VpbnQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS5mbG9hdDE2OlxuICAgICAgcmV0dXJuICdmbG9hdDE2JztcbiAgICBjYXNlIERhdGFUeXBlLmZsb2F0OlxuICAgICAgcmV0dXJuICdmbG9hdDMyJztcbiAgICBjYXNlIERhdGFUeXBlLmRvdWJsZTpcbiAgICAgIHJldHVybiAnZmxvYXQ2NCc7XG4gICAgY2FzZSBEYXRhVHlwZS5zdHJpbmc6XG4gICAgICByZXR1cm4gJ3N0cmluZyc7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQ2NDpcbiAgICAgIHJldHVybiAnaW50NjQnO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDY0OlxuICAgICAgcmV0dXJuICd1aW50NjQnO1xuICAgIGNhc2UgRGF0YVR5cGUuaW50NDpcbiAgICAgIHJldHVybiAnaW50NCc7XG4gICAgY2FzZSBEYXRhVHlwZS51aW50NDpcbiAgICAgIHJldHVybiAndWludDQnO1xuXG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGVQcm90b31gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBnZXQgdGVuc29yIHNpemUgaW4gYnl0ZXMgYnkgdGhlIGdpdmVuIGRhdGEgdHlwZSBhbmQgZGltZW5zaW9uc1xuICogQHJldHVybnMgc2l6ZSBpbiBpbnRlZ2VyIG9yIHVuZGVmaW5lZCBpZiB0aGUgZGF0YSB0eXBlIGlzIG5vdCBzdXBwb3J0ZWRcbiAqL1xuZXhwb3J0IGNvbnN0IGNhbGN1bGF0ZVRlbnNvclNpemVJbkJ5dGVzID0gKFxuICBkYXRlVHlwZTogbnVtYmVyLFxuICBkaW1zT3JTaXplOiByZWFkb25seSBudW1iZXJbXSB8IG51bWJlcixcbik6IG51bWJlciB8IHVuZGVmaW5lZCA9PiB7XG4gIGNvbnN0IGVsZW1lbnRTaXplID0gW1xuICAgIC0xLCAvLyB1bmRlZmluZWQgPSAwXG4gICAgNCwgLy8gZmxvYXQgPSAxXG4gICAgMSwgLy8gdWludDggPSAyXG4gICAgMSwgLy8gaW50OCA9IDNcbiAgICAyLCAvLyB1aW50MTYgPSA0XG4gICAgMiwgLy8gaW50MTYgPSA1XG4gICAgNCwgLy8gaW50MzIgPSA2XG4gICAgOCwgLy8gaW50NjQgPSA3XG4gICAgLTEsIC8vIHN0cmluZyA9IDhcbiAgICAxLCAvLyBib29sID0gOVxuICAgIDIsIC8vIGZsb2F0MTYgPSAxMFxuICAgIDgsIC8vIGRvdWJsZSA9IDExXG4gICAgNCwgLy8gdWludDMyID0gMTJcbiAgICA4LCAvLyB1aW50NjQgPSAxM1xuICAgIC0xLCAvLyBjb21wbGV4NjQgPSAxNFxuICAgIC0xLCAvLyBjb21wbGV4MTI4ID0gMTVcbiAgICAtMSwgLy8gYmZsb2F0MTYgPSAxNlxuICAgIC0xLCAvLyBGTE9BVDhFNE0zRk4gPSAxN1xuICAgIC0xLCAvLyBGTE9BVDhFNE0zRk5VWiA9IDE4XG4gICAgLTEsIC8vIEZMT0FUOEU1TTIgPSAxOVxuICAgIC0xLCAvLyBGTE9BVDhFNU0yRk5VWiA9IDIwXG4gICAgMC41LCAvLyB1aW50NCA9IDIxXG4gICAgMC41LCAvLyBpbnQ0ID0gMjJcbiAgXVtkYXRlVHlwZV07XG5cbiAgY29uc3Qgc2l6ZSA9IHR5cGVvZiBkaW1zT3JTaXplID09PSAnbnVtYmVyJyA/IGRpbXNPclNpemUgOiBkaW1zT3JTaXplLnJlZHVjZSgoYSwgYikgPT4gYSAqIGIsIDEpO1xuICByZXR1cm4gZWxlbWVudFNpemUgPiAwID8gTWF0aC5jZWlsKHNpemUgKiBlbGVtZW50U2l6ZSkgOiB1bmRlZmluZWQ7XG59O1xuXG4vKipcbiAqIGdldCB0eXBlZCBhcnJheSBjb25zdHJ1Y3RvciBieSB0aGUgZ2l2ZW4gdGVuc29yIHR5cGVcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvclR5cGVUb1R5cGVkQXJyYXlDb25zdHJ1Y3RvciA9IChcbiAgdHlwZTogVGVuc29yLlR5cGUsXG4pOlxuICB8IEZsb2F0MzJBcnJheUNvbnN0cnVjdG9yXG4gIHwgVWludDhBcnJheUNvbnN0cnVjdG9yXG4gIHwgSW50OEFycmF5Q29uc3RydWN0b3JcbiAgfCBVaW50MTZBcnJheUNvbnN0cnVjdG9yXG4gIHwgSW50MTZBcnJheUNvbnN0cnVjdG9yXG4gIHwgSW50MzJBcnJheUNvbnN0cnVjdG9yXG4gIHwgQmlnSW50NjRBcnJheUNvbnN0cnVjdG9yXG4gIHwgVWludDhBcnJheUNvbnN0cnVjdG9yXG4gIHwgRmxvYXQ2NEFycmF5Q29uc3RydWN0b3JcbiAgfCBVaW50MzJBcnJheUNvbnN0cnVjdG9yXG4gIHwgQmlnVWludDY0QXJyYXlDb25zdHJ1Y3RvciA9PiB7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ2Zsb2F0MTYnOlxuICAgICAgLy8gYWxsb3cgRmxvYXQxNkFycmF5IHBvbHlmaWxsLlxuICAgICAgcmV0dXJuIHR5cGVvZiBGbG9hdDE2QXJyYXkgIT09ICd1bmRlZmluZWQnICYmIEZsb2F0MTZBcnJheS5mcm9tID8gRmxvYXQxNkFycmF5IDogVWludDE2QXJyYXk7XG4gICAgY2FzZSAnZmxvYXQzMic6XG4gICAgICByZXR1cm4gRmxvYXQzMkFycmF5O1xuICAgIGNhc2UgJ3VpbnQ4JzpcbiAgICAgIHJldHVybiBVaW50OEFycmF5O1xuICAgIGNhc2UgJ2ludDgnOlxuICAgICAgcmV0dXJuIEludDhBcnJheTtcbiAgICBjYXNlICd1aW50MTYnOlxuICAgICAgcmV0dXJuIFVpbnQxNkFycmF5O1xuICAgIGNhc2UgJ2ludDE2JzpcbiAgICAgIHJldHVybiBJbnQxNkFycmF5O1xuICAgIGNhc2UgJ2ludDMyJzpcbiAgICAgIHJldHVybiBJbnQzMkFycmF5O1xuICAgIGNhc2UgJ2Jvb2wnOlxuICAgICAgcmV0dXJuIFVpbnQ4QXJyYXk7XG4gICAgY2FzZSAnZmxvYXQ2NCc6XG4gICAgICByZXR1cm4gRmxvYXQ2NEFycmF5O1xuICAgIGNhc2UgJ3VpbnQzMic6XG4gICAgICByZXR1cm4gVWludDMyQXJyYXk7XG4gICAgY2FzZSAnaW50NjQnOlxuICAgICAgcmV0dXJuIEJpZ0ludDY0QXJyYXk7XG4gICAgY2FzZSAndWludDY0JzpcbiAgICAgIHJldHVybiBCaWdVaW50NjRBcnJheTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCB0eXBlOiAke3R5cGV9YCk7XG4gIH1cbn07XG5cbi8qKlxuICogTWFwIHN0cmluZyBsb2cgbGV2ZWwgdG8gaW50ZWdlciB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgbG9nTGV2ZWxTdHJpbmdUb0VudW0gPSAobG9nTGV2ZWw/OiAndmVyYm9zZScgfCAnaW5mbycgfCAnd2FybmluZycgfCAnZXJyb3InIHwgJ2ZhdGFsJyk6IG51bWJlciA9PiB7XG4gIHN3aXRjaCAobG9nTGV2ZWwpIHtcbiAgICBjYXNlICd2ZXJib3NlJzpcbiAgICAgIHJldHVybiAwO1xuICAgIGNhc2UgJ2luZm8nOlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAnd2FybmluZyc6XG4gICAgICByZXR1cm4gMjtcbiAgICBjYXNlICdlcnJvcic6XG4gICAgICByZXR1cm4gMztcbiAgICBjYXNlICdmYXRhbCc6XG4gICAgICByZXR1cm4gNDtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBsb2dnaW5nIGxldmVsOiAke2xvZ0xldmVsfWApO1xuICB9XG59O1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdGhlIGdpdmVuIHRlbnNvciB0eXBlIGlzIHN1cHBvcnRlZCBieSBHUFUgYnVmZmVyXG4gKi9cbmV4cG9ydCBjb25zdCBpc0dwdUJ1ZmZlclN1cHBvcnRlZFR5cGUgPSAodHlwZTogVGVuc29yLlR5cGUpOiB0eXBlIGlzIFRlbnNvci5HcHVCdWZmZXJEYXRhVHlwZXMgPT5cbiAgdHlwZSA9PT0gJ2Zsb2F0MzInIHx8XG4gIHR5cGUgPT09ICdmbG9hdDE2JyB8fFxuICB0eXBlID09PSAnaW50MzInIHx8XG4gIHR5cGUgPT09ICdpbnQ2NCcgfHxcbiAgdHlwZSA9PT0gJ3VpbnQzMicgfHxcbiAgdHlwZSA9PT0gJ3VpbnQ4JyB8fFxuICB0eXBlID09PSAnYm9vbCcgfHxcbiAgdHlwZSA9PT0gJ3VpbnQ0JyB8fFxuICB0eXBlID09PSAnaW50NCc7XG5cbi8qKlxuICogQ2hlY2sgd2hldGhlciB0aGUgZ2l2ZW4gdGVuc29yIHR5cGUgaXMgc3VwcG9ydGVkIGJ5IFdlYk5OIE1MVGVuc29yXG4gKi9cbmV4cG9ydCBjb25zdCBpc01MVGVuc29yU3VwcG9ydGVkVHlwZSA9ICh0eXBlOiBUZW5zb3IuVHlwZSk6IHR5cGUgaXMgVGVuc29yLk1MVGVuc29yRGF0YVR5cGVzID0+XG4gIHR5cGUgPT09ICdmbG9hdDMyJyB8fFxuICB0eXBlID09PSAnZmxvYXQxNicgfHxcbiAgdHlwZSA9PT0gJ2ludDMyJyB8fFxuICB0eXBlID09PSAnaW50NjQnIHx8XG4gIHR5cGUgPT09ICd1aW50MzInIHx8XG4gIHR5cGUgPT09ICd1aW50NjQnIHx8XG4gIHR5cGUgPT09ICdpbnQ4JyB8fFxuICB0eXBlID09PSAndWludDgnIHx8XG4gIHR5cGUgPT09ICdib29sJyB8fFxuICB0eXBlID09PSAndWludDQnIHx8XG4gIHR5cGUgPT09ICdpbnQ0JztcblxuLyoqXG4gKiBNYXAgc3RyaW5nIGRhdGEgbG9jYXRpb24gdG8gaW50ZWdlciB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtID0gKGxvY2F0aW9uOiBUZW5zb3IuRGF0YUxvY2F0aW9uKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChsb2NhdGlvbikge1xuICAgIGNhc2UgJ25vbmUnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAnY3B1JzpcbiAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgJ2NwdS1waW5uZWQnOlxuICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAndGV4dHVyZSc6XG4gICAgICByZXR1cm4gMztcbiAgICBjYXNlICdncHUtYnVmZmVyJzpcbiAgICAgIHJldHVybiA0O1xuICAgIGNhc2UgJ21sLXRlbnNvcic6XG4gICAgICByZXR1cm4gNTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBkYXRhIGxvY2F0aW9uOiAke2xvY2F0aW9ufWApO1xuICB9XG59O1xuXG4vKipcbiAqIE1hcCBpbnRlZ2VyIGRhdGEgbG9jYXRpb24gdG8gc3RyaW5nIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCBkYXRhTG9jYXRpb25FbnVtVG9TdHJpbmcgPSAobG9jYXRpb246IG51bWJlcik6IFRlbnNvci5EYXRhTG9jYXRpb24gfCB1bmRlZmluZWQgPT5cbiAgKFsnbm9uZScsICdjcHUnLCAnY3B1LXBpbm5lZCcsICd0ZXh0dXJlJywgJ2dwdS1idWZmZXInLCAnbWwtdGVuc29yJ10gYXMgY29uc3QpW2xvY2F0aW9uXTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHsgaXNOb2RlIH0gZnJvbSAnLi93YXNtLXV0aWxzLWVudic7XG5cbi8qKlxuICogTG9hZCBhIGZpbGUgaW50byBhIFVpbnQ4QXJyYXkuXG4gKlxuICogQHBhcmFtIGZpbGUgLSB0aGUgZmlsZSB0byBsb2FkLiBDYW4gYmUgYSBVUkwvcGF0aCwgYSBCbG9iLCBhbiBBcnJheUJ1ZmZlciwgb3IgYSBVaW50OEFycmF5LlxuICogQHJldHVybnMgYSBVaW50OEFycmF5IGNvbnRhaW5pbmcgdGhlIGZpbGUgZGF0YS5cbiAqL1xuZXhwb3J0IGNvbnN0IGxvYWRGaWxlID0gYXN5bmMgKGZpbGU6IHN0cmluZyB8IEJsb2IgfCBBcnJheUJ1ZmZlckxpa2UgfCBVaW50OEFycmF5KTogUHJvbWlzZTxVaW50OEFycmF5PiA9PiB7XG4gIGlmICh0eXBlb2YgZmlsZSA9PT0gJ3N0cmluZycpIHtcbiAgICBpZiAoaXNOb2RlKSB7XG4gICAgICAvLyBsb2FkIGZpbGUgaW50byBBcnJheUJ1ZmZlciBpbiBOb2RlLmpzXG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCB7IHJlYWRGaWxlIH0gPSByZXF1aXJlKCdub2RlOmZzL3Byb21pc2VzJyk7XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCByZWFkRmlsZShmaWxlKSk7XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIGlmIChlLmNvZGUgPT09ICdFUlJfRlNfRklMRV9UT09fTEFSR0UnKSB7XG4gICAgICAgICAgLy8gZmlsZSBpcyB0b28gbGFyZ2UsIHVzZSBmcy5jcmVhdGVSZWFkU3RyZWFtIGluc3RlYWRcbiAgICAgICAgICBjb25zdCB7IGNyZWF0ZVJlYWRTdHJlYW0gfSA9IHJlcXVpcmUoJ25vZGU6ZnMnKTtcbiAgICAgICAgICBjb25zdCBzdHJlYW0gPSBjcmVhdGVSZWFkU3RyZWFtKGZpbGUpO1xuICAgICAgICAgIGNvbnN0IGNodW5rczogVWludDhBcnJheVtdID0gW107XG4gICAgICAgICAgZm9yIGF3YWl0IChjb25zdCBjaHVuayBvZiBzdHJlYW0pIHtcbiAgICAgICAgICAgIGNodW5rcy5wdXNoKGNodW5rKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KEJ1ZmZlci5jb25jYXQoY2h1bmtzKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhyb3cgZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gbG9hZCBmaWxlIGludG8gQXJyYXlCdWZmZXIgaW4gYnJvd3NlcnNcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goZmlsZSk7XG4gICAgICBpZiAoIXJlc3BvbnNlLm9rKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgZmFpbGVkIHRvIGxvYWQgZXh0ZXJuYWwgZGF0YSBmaWxlOiAke2ZpbGV9YCk7XG4gICAgICB9XG4gICAgICBjb25zdCBjb250ZW50TGVuZ3RoSGVhZGVyID0gcmVzcG9uc2UuaGVhZGVycy5nZXQoJ0NvbnRlbnQtTGVuZ3RoJyk7XG4gICAgICBjb25zdCBmaWxlU2l6ZSA9IGNvbnRlbnRMZW5ndGhIZWFkZXIgPyBwYXJzZUludChjb250ZW50TGVuZ3RoSGVhZGVyLCAxMCkgOiAwO1xuICAgICAgaWYgKGZpbGVTaXplIDwgMTA3Mzc0MTgyNCAvKiAxR0IgKi8pIHtcbiAgICAgICAgLy8gd2hlbiBDb250ZW50LUxlbmd0aCBoZWFkZXIgaXMgbm90IHNldCwgd2UgY2Fubm90IGRldGVybWluZSB0aGUgZmlsZSBzaXplLiBXZSBhc3N1bWUgaXQgaXMgc21hbGwgZW5vdWdoIHRvXG4gICAgICAgIC8vIGxvYWQgaW50byBtZW1vcnkuXG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShhd2FpdCByZXNwb25zZS5hcnJheUJ1ZmZlcigpKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGZpbGUgaXMgdG9vIGxhcmdlLCB1c2Ugc3RyZWFtIGluc3RlYWRcbiAgICAgICAgaWYgKCFyZXNwb25zZS5ib2R5KSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBmYWlsZWQgdG8gbG9hZCBleHRlcm5hbCBkYXRhIGZpbGU6ICR7ZmlsZX0sIG5vIHJlc3BvbnNlIGJvZHkuYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmVhZGVyID0gcmVzcG9uc2UuYm9keS5nZXRSZWFkZXIoKTtcblxuICAgICAgICBsZXQgYnVmZmVyO1xuICAgICAgICB0cnkge1xuICAgICAgICAgIC8vIHRyeSB0byBjcmVhdGUgQXJyYXlCdWZmZXIgZGlyZWN0bHlcbiAgICAgICAgICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoZmlsZVNpemUpO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgaWYgKGUgaW5zdGFuY2VvZiBSYW5nZUVycm9yKSB7XG4gICAgICAgICAgICAvLyB1c2UgV2ViQXNzZW1ibHkgTWVtb3J5IHRvIGFsbG9jYXRlIGxhcmdlciBBcnJheUJ1ZmZlclxuICAgICAgICAgICAgY29uc3QgcGFnZXMgPSBNYXRoLmNlaWwoZmlsZVNpemUgLyA2NTUzNik7XG4gICAgICAgICAgICBidWZmZXIgPSBuZXcgV2ViQXNzZW1ibHkuTWVtb3J5KHsgaW5pdGlhbDogcGFnZXMsIG1heGltdW06IHBhZ2VzIH0pLmJ1ZmZlcjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgb2Zmc2V0ID0gMDtcbiAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnN0YW50LWNvbmRpdGlvblxuICAgICAgICB3aGlsZSAodHJ1ZSkge1xuICAgICAgICAgIGNvbnN0IHsgZG9uZSwgdmFsdWUgfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XG4gICAgICAgICAgaWYgKGRvbmUpIHtcbiAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCBjaHVua1NpemUgPSB2YWx1ZS5ieXRlTGVuZ3RoO1xuICAgICAgICAgIGNvbnN0IGNodW5rID0gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyLCBvZmZzZXQsIGNodW5rU2l6ZSk7XG4gICAgICAgICAgY2h1bmsuc2V0KHZhbHVlKTtcbiAgICAgICAgICBvZmZzZXQgKz0gY2h1bmtTaXplO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShidWZmZXIsIDAsIGZpbGVTaXplKTtcbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSBpZiAoZmlsZSBpbnN0YW5jZW9mIEJsb2IpIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgZmlsZS5hcnJheUJ1ZmZlcigpKTtcbiAgfSBlbHNlIGlmIChmaWxlIGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgIHJldHVybiBmaWxlO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBuZXcgVWludDhBcnJheShmaWxlKTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuLy8gV2ViTk4gQVBJIGN1cnJlbnRseSBkb2VzIG5vdCBoYXZlIGEgVHlwZVNjcmlwdCBkZWZpbml0aW9uIGZpbGUuIFRoaXMgZmlsZSBpcyBhIHdvcmthcm91bmQgd2l0aCB0eXBlcyBnZW5lcmF0ZWQgZnJvbVxuLy8gV2ViTk4gQVBJIHNwZWNpZmljYXRpb24uXG4vLyBodHRwczovL2dpdGh1Yi5jb20vd2VibWFjaGluZWxlYXJuaW5nL3dlYm5uL2lzc3Vlcy82Nzdcbi8vLyA8cmVmZXJlbmNlIHBhdGg9XCJqc2VwL3dlYm5uL3dlYm5uLmQudHNcIiAvPlxuXG5pbXBvcnQgeyBFbnYsIEluZmVyZW5jZVNlc3Npb24sIFRlbnNvciB9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7XG4gIFNlcmlhbGl6YWJsZUludGVybmFsQnVmZmVyLFxuICBTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGEsXG4gIFNlcmlhbGl6YWJsZVRlbnNvck1ldGFkYXRhLFxuICBUZW5zb3JNZXRhZGF0YSxcbn0gZnJvbSAnLi9wcm94eS1tZXNzYWdlcyc7XG5pbXBvcnQgeyBzZXRSdW5PcHRpb25zIH0gZnJvbSAnLi9ydW4tb3B0aW9ucyc7XG5pbXBvcnQgeyBzZXRTZXNzaW9uT3B0aW9ucyB9IGZyb20gJy4vc2Vzc2lvbi1vcHRpb25zJztcbmltcG9ydCB7XG4gIGNhbGN1bGF0ZVRlbnNvclNpemVJbkJ5dGVzLFxuICBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0sXG4gIGlzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZSxcbiAgaXNNTFRlbnNvclN1cHBvcnRlZFR5cGUsXG4gIGxvZ0xldmVsU3RyaW5nVG9FbnVtLFxuICB0ZW5zb3JEYXRhVHlwZUVudW1Ub1N0cmluZyxcbiAgdGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0sXG4gIHRlbnNvclR5cGVUb1R5cGVkQXJyYXlDb25zdHJ1Y3Rvcixcbn0gZnJvbSAnLi93YXNtLWNvbW1vbic7XG5pbXBvcnQgeyBnZXRJbnN0YW5jZSB9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcbmltcG9ydCB7IGFsbG9jV2FzbVN0cmluZywgY2hlY2tMYXN0RXJyb3IgfSBmcm9tICcuL3dhc20tdXRpbHMnO1xuaW1wb3J0IHsgbG9hZEZpbGUgfSBmcm9tICcuL3dhc20tdXRpbHMtbG9hZC1maWxlJztcblxuLy8gI3JlZ2lvbiBJbml0aWFsaXphdGlvbnNcblxuLyoqXG4gKiBUaGVyZSBhcmUgNCBkaWZmZXJlbnQgXCJpbml0aWFsaXphdGlvblwiIHN0ZXBzIGZvciBPUlQuIFRoZXkgaGFwcGVuIGluIGRpZmZlcmVudCBwbGFjZXMgYW5kIGRpZmZlcmVudCB0aW1lLlxuICpcbiAqIDEuIEphdmFTY3JpcHQgaW5pdGlhbGl6YXRpb24gZm9yIG9ubnhydW50aW1lLWNvbW1vbiBhbmQgb25ueHJ1bnRpbWUtd2ViLlxuICogICAgVGhpcyBpcyB0aGUgZmlyc3QgaW5pdGlhbGl6YXRpb24gc3RlcC4gSW4gdGhpcyBzdGVwLCBvbm54cnVudGltZS13ZWIgY2FsbHMgb25ueHJ1bnRpbWUtY29tbW9uJ3MgcmVnaXN0ZXJCYWNrZW5kKClcbiAqIGZ1bmN0aW9uIG11bHRpcGxlIHRpbWVzIHRvIHJlZ2lzdGVyIGFsbCB0aGUgYXZhaWxhYmxlIGJhY2tlbmRzLiBUaGUgYmFja2VuZCByZWdpc3RyYXRpb24gaXMgdmVyeSBmYXN0LiBJdCBvbmx5XG4gKiByZWdpc3RlcnMgdGhlIGJhY2tlbmQgbmFtZSB3aXRoIHRoZSB1bmluaXRpYWxpemVkIGJhY2tlbmQgb2JqZWN0LiBObyBoZWF2eSBpbml0aWFsaXphdGlvbiBpcyBkb25lIGluIHRoaXMgc3RlcC5cbiAqICAgIFJlZmVyIHRvIHdlYi9saWIvaW5kZXgudHMgZm9yIHRoZSBiYWNrZW5kIHJlZ2lzdHJhdGlvbi5cbiAqXG4gKiAyLiBXZWJBc3NlbWJseSBhcnRpZmFjdCBpbml0aWFsaXphdGlvbi5cbiAqICAgIFRoaXMgaGFwcGVucyB3aGVuIGFueSByZWdpc3RlcmVkIHdhc20gYmFja2VuZCBpcyB1c2VkIGZvciB0aGUgZmlyc3QgdGltZSAoaWUuIGBvcnQuSW5mZXJlbmNlU2Vzc2lvbi5jcmVhdGUoKWAgaXNcbiAqIGNhbGxlZCkuIEluIHRoaXMgc3RlcCwgb25ueHJ1bnRpbWUtd2ViIGRvZXMgdGhlIGZvbGxvd2luZ3M6XG4gKiAgICAgLSBjcmVhdGUgYSBwcm94eSB3b3JrZXIgYW5kIG1ha2Ugc3VyZSB0aGUgcHJveHkgd29ya2VyIGlzIHJlYWR5IHRvIHJlY2VpdmUgbWVzc2FnZXMsIGlmIHByb3h5IGlzIGVuYWJsZWQuXG4gKiAgICAgLSBwZXJmb3JtIGZlYXR1cmUgZGV0ZWN0aW9uLCBsb2NhdGUgY29ycmVjdCBXZWJBc3NlbWJseSBhcnRpZmFjdCBwYXRoIGFuZCBjYWxsIHRoZSBFbXNjcmlwdGVuIGdlbmVyYXRlZFxuICogSmF2YVNjcmlwdCBjb2RlIHRvIGluaXRpYWxpemUgdGhlIFdlYkFzc2VtYmx5IHJ1bnRpbWUuXG4gKiAgICAgICAgIC0gaWYgcHJveHkgaXMgZW5hYmxlZCwgdGhpcyBzdGVwIGhhcHBlbnMgaW4gdGhlIHByb3h5IHdvcmtlciB1c2luZyBtZXNzYWdlICdpbml0LXdhc20nLlxuICogICAgICAgICAtIGRvd25sb2FkaW5nIHRoZSAnb3J0LXdhc217Li4ufS53YXNtJyBmaWxlIGlzIGRvbmUgaW4gdGhpcyBzdGVwLlxuICogICAgICAgICAtIGlmIG11bHRpLXRocmVhZCBpcyBlbmFibGVkLCBvbmUgb3IgbW9yZSB3ZWJ3b3JrZXIgd2lsbCBiZSBjcmVhdGVkIHRvIGluaXRpYWxpemUgdGhlIFBUaHJlYWQgdGhyZWFkcG9vbC5cbiAqXG4gKiAzLiBPUlQgZW52aXJvbm1lbnQgaW5pdGlhbGl6YXRpb24uXG4gKiAgICBUaGlzIGhhcHBlbnMgYWZ0ZXIgc3RlcCAyLiBJbiB0aGlzIHN0ZXAsIG9ubnhydW50aW1lLXdlYiBwZXJmb3JtcyBPTk5YIFJ1bnRpbWUgZW52aXJvbm1lbnQgaW5pdGlhbGl6YXRpb24uXG4gKiBGdW5jdGlvbiBgX09ydEluaXQoKWAgaXMgY2FsbGVkIGluIHRoaXMgc3RlcC5cbiAqICAgICAtIGlmIHByb3h5IGlzIGVuYWJsZWQsIHRoaXMgc3RlcCBoYXBwZW5zIGluIHRoZSBwcm94eSB3b3JrZXIgdXNpbmcgbWVzc2FnZSAnaW5pdC1vcnQnLlxuICogICAgIC0gbG9nZ2luZyBsZXZlbCAob3J0LmVudi5sb2dMZXZlbCkgYW5kIHRocmVhZCBudW1iZXIgKG9ydC5lbnYud2FzbS5udW1UaHJlYWRzKSBhcmUgc2V0IGluIHRoaXMgc3RlcC5cbiAqXG4gKiA0LiBTZXNzaW9uIGluaXRpYWxpemF0aW9uLlxuICogICAgVGhpcyBoYXBwZW5zIHdoZW4gYG9ydC5JbmZlcmVuY2VTZXNzaW9uLmNyZWF0ZSgpYCBpcyBjYWxsZWQuIFVubGlrZSB0aGUgZmlyc3QgMyBzdGVwcyAodGhleSBvbmx5IGNhbGxlZCBvbmNlKSxcbiAqIHRoaXMgc3RlcCB3aWxsIGJlIGRvbmUgZm9yIGVhY2ggc2Vzc2lvbi4gSW4gdGhpcyBzdGVwLCBvbm54cnVudGltZS13ZWIgZG9lcyB0aGUgZm9sbG93aW5nczpcbiAqICAgIElmIHRoZSBwYXJhbWV0ZXIgaXMgYSBVUkw6XG4gKiAgICAtIGRvd25sb2FkIHRoZSBtb2RlbCBkYXRhIGZyb20gdGhlIFVSTC5cbiAqICAgIC0gY29weSB0aGUgbW9kZWwgZGF0YSB0byB0aGUgV0FTTSBoZWFwLiAocHJveHk6ICdjb3B5LWZyb20nKVxuICogICAgLSBkZXJlZmVyZW5jZSB0aGUgbW9kZWwgYnVmZmVyLiBUaGlzIHN0ZXAgYWxsb3dzIHRoZSBvcmlnaW5hbCBBcnJheUJ1ZmZlciB0byBiZSBnYXJiYWdlIGNvbGxlY3RlZC5cbiAqICAgIC0gY2FsbCBgX09ydENyZWF0ZVNlc3Npb24oKWAgdG8gY3JlYXRlIHRoZSBzZXNzaW9uLiAocHJveHk6ICdjcmVhdGUnKVxuICpcbiAqICAgIElmIHRoZSBwYXJhbWV0ZXIgaXMgYSBVaW50OEFycmF5IG9iamVjdDpcbiAqICAgIC0gY29weSB0aGUgbW9kZWwgZGF0YSB0byB0aGUgV0FTTSBoZWFwLiAocHJveHk6ICdjb3B5LWZyb20nKVxuICogICAgLSBjYWxsIGBfT3J0Q3JlYXRlU2Vzc2lvbigpYCB0byBjcmVhdGUgdGhlIHNlc3Npb24uIChwcm94eTogJ2NyZWF0ZScpXG4gKlxuICpcbiAqL1xuXG4vKipcbiAqIGluaXRpYWxpemUgT1JUIGVudmlyb25tZW50LlxuICpcbiAqIEBwYXJhbSBudW1UaHJlYWRzIFNldEdsb2JhbEludHJhT3BOdW1UaHJlYWRzKG51bVRocmVhZHMpXG4gKiBAcGFyYW0gbG9nZ2luZ0xldmVsIENyZWF0ZUVudihzdGF0aWNfY2FzdDxPcnRMb2dnaW5nTGV2ZWw+KGxvZ2dpbmdfbGV2ZWwpKVxuICovXG5jb25zdCBpbml0T3J0ID0gKG51bVRocmVhZHM6IG51bWJlciwgbG9nZ2luZ0xldmVsOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgY29uc3QgZXJyb3JDb2RlID0gZ2V0SW5zdGFuY2UoKS5fT3J0SW5pdChudW1UaHJlYWRzLCBsb2dnaW5nTGV2ZWwpO1xuICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgY2hlY2tMYXN0RXJyb3IoXCJDYW4ndCBpbml0aWFsaXplIG9ubnhydW50aW1lLlwiKTtcbiAgfVxufTtcblxuLyoqXG4gKiBpbml0aWFsaXplIHJ1bnRpbWUgZW52aXJvbm1lbnQuXG4gKiBAcGFyYW0gZW52IHBhc3NlZCBpbiB0aGUgZW52aXJvbm1lbnQgY29uZmlnIG9iamVjdC5cbiAqL1xuZXhwb3J0IGNvbnN0IGluaXRSdW50aW1lID0gYXN5bmMgKGVudjogRW52KTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIC8vIGluaXQgT1JUXG4gIGluaXRPcnQoZW52Lndhc20ubnVtVGhyZWFkcyEsIGxvZ0xldmVsU3RyaW5nVG9FbnVtKGVudi5sb2dMZXZlbCkpO1xufTtcblxuLyoqXG4gKiBwZXJmb3JtIEVQIHNwZWNpZmljIGluaXRpYWxpemF0aW9uLlxuICpcbiAqIEBwYXJhbSBlbnZcbiAqIEBwYXJhbSBlcE5hbWVcbiAqL1xuZXhwb3J0IGNvbnN0IGluaXRFcCA9IGFzeW5jIChlbnY6IEVudiwgZXBOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgLy8gaW5pdGlhbGl6ZSBBU1lOQ0lGWSBzdXBwb3J0XG4gIGdldEluc3RhbmNlKCkuYXN5bmNJbml0Py4oKTtcblxuICBpZiAoZXBOYW1lID09PSAnd2ViZ3B1JyAmJiBCVUlMRF9ERUZTLlVTRV9XRUJHUFVfRVApIHtcbiAgICBnZXRJbnN0YW5jZSgpLndlYmdwdUluaXQhKChkZXZpY2UpID0+IHtcbiAgICAgIGVudi53ZWJncHUuZGV2aWNlID0gZGV2aWNlO1xuICAgIH0pO1xuICB9XG5cbiAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfSlNFUCkge1xuICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdmFyLXJlcXVpcmVzXG4gICAgY29uc3QgaW5pdEpzZXAgPSByZXF1aXJlKCcuL2pzZXAvaW5pdCcpLmluaXQ7XG5cbiAgICBpZiAoZXBOYW1lID09PSAnd2ViZ3B1JyAmJiAhQlVJTERfREVGUy5VU0VfV0VCR1BVX0VQKSB7XG4gICAgICAvLyBwZXJmb3JtIFdlYkdQVSBhdmFpbGFiaWxpdHkgY2hlY2tcbiAgICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJyB8fCAhbmF2aWdhdG9yLmdwdSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dlYkdQVSBpcyBub3Qgc3VwcG9ydGVkIGluIGN1cnJlbnQgZW52aXJvbm1lbnQnKTtcbiAgICAgIH1cblxuICAgICAgbGV0IGFkYXB0ZXIgPSBlbnYud2ViZ3B1LmFkYXB0ZXIgYXMgR1BVQWRhcHRlciB8IG51bGw7XG4gICAgICBpZiAoIWFkYXB0ZXIpIHtcbiAgICAgICAgLy8gaWYgYWRhcHRlciBpcyBub3Qgc2V0LCByZXF1ZXN0IGEgbmV3IGFkYXB0ZXIuXG4gICAgICAgIGNvbnN0IHBvd2VyUHJlZmVyZW5jZSA9IGVudi53ZWJncHUucG93ZXJQcmVmZXJlbmNlO1xuICAgICAgICBpZiAoXG4gICAgICAgICAgcG93ZXJQcmVmZXJlbmNlICE9PSB1bmRlZmluZWQgJiZcbiAgICAgICAgICBwb3dlclByZWZlcmVuY2UgIT09ICdsb3ctcG93ZXInICYmXG4gICAgICAgICAgcG93ZXJQcmVmZXJlbmNlICE9PSAnaGlnaC1wZXJmb3JtYW5jZSdcbiAgICAgICAgKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBJbnZhbGlkIHBvd2VyUHJlZmVyZW5jZSBzZXR0aW5nOiBcIiR7cG93ZXJQcmVmZXJlbmNlfVwiYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZm9yY2VGYWxsYmFja0FkYXB0ZXIgPSBlbnYud2ViZ3B1LmZvcmNlRmFsbGJhY2tBZGFwdGVyO1xuICAgICAgICBpZiAoZm9yY2VGYWxsYmFja0FkYXB0ZXIgIT09IHVuZGVmaW5lZCAmJiB0eXBlb2YgZm9yY2VGYWxsYmFja0FkYXB0ZXIgIT09ICdib29sZWFuJykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBmb3JjZUZhbGxiYWNrQWRhcHRlciBzZXR0aW5nOiBcIiR7Zm9yY2VGYWxsYmFja0FkYXB0ZXJ9XCJgKTtcbiAgICAgICAgfVxuICAgICAgICBhZGFwdGVyID0gYXdhaXQgbmF2aWdhdG9yLmdwdS5yZXF1ZXN0QWRhcHRlcih7IHBvd2VyUHJlZmVyZW5jZSwgZm9yY2VGYWxsYmFja0FkYXB0ZXIgfSk7XG4gICAgICAgIGlmICghYWRhcHRlcikge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICdGYWlsZWQgdG8gZ2V0IEdQVSBhZGFwdGVyLiAnICtcbiAgICAgICAgICAgICAgJ1lvdSBtYXkgbmVlZCB0byBlbmFibGUgZmxhZyBcIi0tZW5hYmxlLXVuc2FmZS13ZWJncHVcIiBpZiB5b3UgYXJlIHVzaW5nIENocm9tZS4nLFxuICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGlmIGFkYXB0ZXIgaXMgc2V0LCB2YWxpZGF0ZSBpdC5cbiAgICAgICAgaWYgKFxuICAgICAgICAgIHR5cGVvZiBhZGFwdGVyLmxpbWl0cyAhPT0gJ29iamVjdCcgfHxcbiAgICAgICAgICB0eXBlb2YgYWRhcHRlci5mZWF0dXJlcyAhPT0gJ29iamVjdCcgfHxcbiAgICAgICAgICB0eXBlb2YgYWRhcHRlci5yZXF1ZXN0RGV2aWNlICE9PSAnZnVuY3Rpb24nXG4gICAgICAgICkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBHUFUgYWRhcHRlciBzZXQgaW4gYGVudi53ZWJncHUuYWRhcHRlcmAuIEl0IG11c3QgYmUgYSBHUFVBZGFwdGVyIG9iamVjdC4nKTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBhd2FpdCBpbml0SnNlcCgnd2ViZ3B1JywgZ2V0SW5zdGFuY2UoKSwgZW52LCBhZGFwdGVyKTtcbiAgICB9XG4gICAgaWYgKGVwTmFtZSA9PT0gJ3dlYm5uJykge1xuICAgICAgLy8gcGVyZm9ybSBXZWJOTiBhdmFpbGFiaWxpdHkgY2hlY2tcbiAgICAgIGlmICh0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJyB8fCAhKG5hdmlnYXRvciBhcyB1bmtub3duIGFzIHsgbWw6IHVua25vd24gfSkubWwpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXZWJOTiBpcyBub3Qgc3VwcG9ydGVkIGluIGN1cnJlbnQgZW52aXJvbm1lbnQnKTtcbiAgICAgIH1cblxuICAgICAgYXdhaXQgaW5pdEpzZXAoJ3dlYm5uJywgZ2V0SW5zdGFuY2UoKSwgZW52KTtcbiAgICB9XG4gIH1cbn07XG5cbi8vICNlbmRyZWdpb24gSW5pdGlhbGl6YXRpb25zXG5cbi8qKlxuICogdmFsaWQgZGF0YSBsb2NhdGlvbnMgZm9yIGlucHV0L291dHB1dCB0ZW5zb3JzLlxuICovXG50eXBlIFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0ID1cbiAgfCAnY3B1J1xuICB8ICdjcHUtcGlubmVkJ1xuICB8ICdncHUtYnVmZmVyJ1xuICB8ICdtbC10ZW5zb3InXG4gIC8vIFVzZSAnbWwtdGVuc29yJyBkdXJpbmcgaW5mZXJlbmNlLCBidXQgb3V0cHV0IGEgdGVuc29yIGxvY2F0ZWQgb24gdGhlIENQVS5cbiAgfCAnbWwtdGVuc29yLWNwdS1vdXRwdXQnO1xuXG50eXBlIElPQmluZGluZ1N0YXRlID0ge1xuICAvKipcbiAgICogdGhlIGhhbmRsZSBvZiBJTyBiaW5kaW5nLlxuICAgKi9cbiAgcmVhZG9ubHkgaGFuZGxlOiBudW1iZXI7XG5cbiAgLyoqXG4gICAqIHRoZSBwcmVmZXJyZWQgbG9jYXRpb24gZm9yIGVhY2ggb3V0cHV0IHRlbnNvci5cbiAgICpcbiAgICogdmFsdWUgaXMgb25lIG9mICdjcHUnLCAnY3B1LXBpbm5lZCcsICdncHUtYnVmZmVyJywgJ21sLXRlbnNvcicuXG4gICAqL1xuICByZWFkb25seSBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnM6IHJlYWRvbmx5IFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0W107XG5cbiAgLyoqXG4gICAqIGVudW0gdmFsdWUgb2YgdGhlIHByZWZlcnJlZCBsb2NhdGlvbiBmb3IgZWFjaCBvdXRwdXQgdGVuc29yLlxuICAgKi9cbiAgcmVhZG9ubHkgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZDogcmVhZG9ubHkgbnVtYmVyW107XG59O1xuXG4vKipcbiAqICB0dXBsZSBlbGVtZW50cyBhcmU6IEluZmVyZW5jZVNlc3Npb24gSUQ7IGlucHV0TmFtZXNVVEY4RW5jb2RlZDsgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZDsgYmluZGluZ1N0YXRlXG4gKi9cbnR5cGUgU2Vzc2lvbk1ldGFkYXRhID0gW1xuICBpbmZlcmVuY2VTZXNzaW9uSWQ6IG51bWJlcixcbiAgaW5wdXROYW1lc1VURjhFbmNvZGVkOiBudW1iZXJbXSxcbiAgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZDogbnVtYmVyW10sXG4gIGJpbmRpbmdTdGF0ZTogSU9CaW5kaW5nU3RhdGUgfCBudWxsLFxuICBlbmFibGVHcmFwaENhcHR1cmU6IGJvb2xlYW4sXG4gIGlucHV0T3V0cHV0Qm91bmQ6IGJvb2xlYW4sXG5dO1xuXG5jb25zdCBhY3RpdmVTZXNzaW9ucyA9IG5ldyBNYXA8bnVtYmVyLCBTZXNzaW9uTWV0YWRhdGE+KCk7XG5cbi8qKlxuICogZ2V0IHRoZSBpbnB1dC9vdXRwdXQgY291bnQgb2YgdGhlIHNlc3Npb24uXG4gKiBAcGFyYW0gc2Vzc2lvbkhhbmRsZSB0aGUgaGFuZGxlIHJlcHJlc2VudGluZyB0aGUgc2Vzc2lvbi4gc2hvdWxkIGJlIG5vbi16ZXJvLlxuICogQHJldHVybnMgYSB0dXBsZSBpbmNsdWRpbmcgMiBudW1iZXJzLCByZXByZXNlbnRpbmcgdGhlIGlucHV0IGNvdW50IGFuZCBvdXRwdXQgY291bnQuXG4gKi9cbmNvbnN0IGdldFNlc3Npb25JbnB1dE91dHB1dENvdW50ID0gKHNlc3Npb25IYW5kbGU6IG51bWJlcik6IFtudW1iZXIsIG51bWJlcl0gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICB0cnkge1xuICAgIGNvbnN0IHB0clNpemUgPSB3YXNtLlBUUl9TSVpFO1xuICAgIGNvbnN0IGRhdGFPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoMiAqIHB0clNpemUpO1xuICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEdldElucHV0T3V0cHV0Q291bnQoc2Vzc2lvbkhhbmRsZSwgZGF0YU9mZnNldCwgZGF0YU9mZnNldCArIHB0clNpemUpO1xuICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKFwiQ2FuJ3QgZ2V0IHNlc3Npb24gaW5wdXQvb3V0cHV0IGNvdW50LlwiKTtcbiAgICB9XG4gICAgY29uc3QgdHlwZSA9IHB0clNpemUgPT09IDQgPyAnaTMyJyA6ICdpNjQnO1xuICAgIHJldHVybiBbTnVtYmVyKHdhc20uZ2V0VmFsdWUoZGF0YU9mZnNldCwgdHlwZSkpLCBOdW1iZXIod2FzbS5nZXRWYWx1ZShkYXRhT2Zmc2V0ICsgcHRyU2l6ZSwgdHlwZSkpXTtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLnN0YWNrUmVzdG9yZShzdGFjayk7XG4gIH1cbn07XG5cbmNvbnN0IGdldFNlc3Npb25JbnB1dE91dHB1dE1ldGFkYXRhID0gKFxuICBzZXNzaW9uSGFuZGxlOiBudW1iZXIsXG4gIGluZGV4OiBudW1iZXIsXG4pOiBbbmFtZU9mZnNldDogbnVtYmVyLCBlbGVtZW50VHlwZTogbnVtYmVyLCBkaW1zPzogQXJyYXk8bnVtYmVyIHwgc3RyaW5nPl0gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICBsZXQgbWV0YWRhdGFPZmZzZXQgPSAwO1xuICB0cnkge1xuICAgIGNvbnN0IHB0clNpemUgPSB3YXNtLlBUUl9TSVpFO1xuICAgIGNvbnN0IGRhdGFPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoMiAqIHB0clNpemUpO1xuICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEdldElucHV0T3V0cHV0TWV0YWRhdGEoc2Vzc2lvbkhhbmRsZSwgaW5kZXgsIGRhdGFPZmZzZXQsIGRhdGFPZmZzZXQgKyBwdHJTaXplKTtcbiAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcihcIkNhbid0IGdldCBzZXNzaW9uIGlucHV0L291dHB1dCBtZXRhZGF0YS5cIik7XG4gICAgfVxuICAgIGNvbnN0IG5hbWVPZmZzZXQgPSBOdW1iZXIod2FzbS5nZXRWYWx1ZShkYXRhT2Zmc2V0LCAnKicpKTtcbiAgICBtZXRhZGF0YU9mZnNldCA9IE51bWJlcih3YXNtLmdldFZhbHVlKGRhdGFPZmZzZXQgKyBwdHJTaXplLCAnKicpKTtcbiAgICAvLyBnZXQgZWxlbWVudCB0eXBlXG4gICAgY29uc3QgZWxlbWVudFR5cGUgPSB3YXNtLkhFQVAzMlttZXRhZGF0YU9mZnNldCAvIDRdO1xuICAgIGlmIChlbGVtZW50VHlwZSA9PT0gMCkge1xuICAgICAgcmV0dXJuIFtuYW1lT2Zmc2V0LCAwXTsgLy8gbm9uLXRlbnNvclxuICAgIH1cblxuICAgIC8vIGdldCBkaW1zIGNvdW50XG4gICAgY29uc3QgZGltc0NvdW50ID0gd2FzbS5IRUFQVTMyW21ldGFkYXRhT2Zmc2V0IC8gNCArIDFdO1xuICAgIC8vIGdldCBkaW1zXG4gICAgY29uc3QgZGltczogQXJyYXk8bnVtYmVyIHwgc3RyaW5nPiA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGltc0NvdW50OyBpKyspIHtcbiAgICAgIGNvbnN0IHN5bWJvbGljRGltTmFtZU9mZnNldCA9IE51bWJlcih3YXNtLmdldFZhbHVlKG1ldGFkYXRhT2Zmc2V0ICsgOCArIGkgKiBwdHJTaXplLCAnKicpKTtcbiAgICAgIGRpbXMucHVzaChcbiAgICAgICAgc3ltYm9saWNEaW1OYW1lT2Zmc2V0ICE9PSAwXG4gICAgICAgICAgPyB3YXNtLlVURjhUb1N0cmluZyhzeW1ib2xpY0RpbU5hbWVPZmZzZXQpXG4gICAgICAgICAgOiBOdW1iZXIod2FzbS5nZXRWYWx1ZShtZXRhZGF0YU9mZnNldCArIDggKyAoaSArIGRpbXNDb3VudCkgKiBwdHJTaXplLCAnKicpKSxcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiBbbmFtZU9mZnNldCwgZWxlbWVudFR5cGUsIGRpbXNdO1xuICB9IGZpbmFsbHkge1xuICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcbiAgICBpZiAobWV0YWRhdGFPZmZzZXQgIT09IDApIHtcbiAgICAgIHdhc20uX09ydEZyZWUobWV0YWRhdGFPZmZzZXQpO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBhbGxvY2F0ZSB0aGUgbWVtb3J5IGFuZCBtZW1jcHkgdGhlIGV4dGVybmFsIGJ1ZmZlci5cbiAqXG4gKiBAcGFyYW0gbW9kZWwgLSB0aGUgZXh0ZXJuYWwgYnVmZmVyIGNvbnRhaW5pbmcgdGhlIG1vZGVsIGRhdGEuIE11c3Qgbm90IGJlIHRoZSBzYW1lIGJ1ZmZlciBhcyB0aGUgV0FTTSBoZWFwLlxuICogQHJldHVybnMgYSAyLWVsZW1lbnRzIHR1cGxlIC0gdGhlIHBvaW50ZXIgYW5kIHNpemUgb2YgdGhlIGFsbG9jYXRlZCBidWZmZXJcbiAqL1xuZXhwb3J0IGNvbnN0IGNvcHlGcm9tRXh0ZXJuYWxCdWZmZXIgPSAobW9kZWw6IFVpbnQ4QXJyYXkpOiBbbnVtYmVyLCBudW1iZXJdID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IG1vZGVsRGF0YU9mZnNldCA9IHdhc20uX21hbGxvYyhtb2RlbC5ieXRlTGVuZ3RoKTtcbiAgaWYgKG1vZGVsRGF0YU9mZnNldCA9PT0gMCkge1xuICAgIHRocm93IG5ldyBFcnJvcihgQ2FuJ3QgY3JlYXRlIGEgc2Vzc2lvbi4gZmFpbGVkIHRvIGFsbG9jYXRlIGEgYnVmZmVyIG9mIHNpemUgJHttb2RlbC5ieXRlTGVuZ3RofS5gKTtcbiAgfVxuICB3YXNtLkhFQVBVOC5zZXQobW9kZWwsIG1vZGVsRGF0YU9mZnNldCk7XG4gIHJldHVybiBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbC5ieXRlTGVuZ3RoXTtcbn07XG5cbi8qKlxuICogY3JlYXRlIGFuIGluZmVyZW5jZSBzZXNzaW9uIGZyb20gYSBtb2RlbCBkYXRhIGJ1ZmZlci5cbiAqXG4gKiBAcGFyYW0gbW9kZWxEYXRhIC0gZWl0aGVyIGEgVWludDhBcnJheSBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBtb2RlbCBkYXRhLCBvciBhIDItZWxlbWVudHMgdHVwbGUgY29udGFpbmluZyB0aGVcbiAqICAgICBwb2ludGVyIGFuZCBzaXplIG9mIHRoZSBtb2RlbCBkYXRhIGJ1ZmZlci5cbiAqIEBwYXJhbSBvcHRpb25zIGFuIG9wdGlvbmFsIHNlc3Npb24gb3B0aW9ucyBvYmplY3QuXG4gKiBAcmV0dXJucyBhIDMtZWxlbWVudHMgdHVwbGUgY29udGFpbmluZyBbc2Vzc2lvbiBoYW5kbGUsIGlucHV0IG5hbWVzLCBvdXRwdXQgbmFtZXNdXG4gKi9cbmV4cG9ydCBjb25zdCBjcmVhdGVTZXNzaW9uID0gYXN5bmMgKFxuICBtb2RlbERhdGE6IFVpbnQ4QXJyYXkgfCBTZXJpYWxpemFibGVJbnRlcm5hbEJ1ZmZlcixcbiAgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMsXG4pOiBQcm9taXNlPFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YT4gPT4ge1xuICBsZXQgbW9kZWxEYXRhT2Zmc2V0OiBudW1iZXIsIG1vZGVsRGF0YUxlbmd0aDogbnVtYmVyO1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcblxuICBpZiAoQXJyYXkuaXNBcnJheShtb2RlbERhdGEpKSB7XG4gICAgLy8gaWYgbW9kZWwgZGF0YSBpcyBhbiBhcnJheSwgaXQgbXVzdCBiZSBhIDItZWxlbWVudHMgdHVwbGUgY29udGFpbmluZyB0aGUgcG9pbnRlciBhbmQgc2l6ZSBvZiB0aGUgbW9kZWwgZGF0YVxuICAgIFttb2RlbERhdGFPZmZzZXQsIG1vZGVsRGF0YUxlbmd0aF0gPSBtb2RlbERhdGE7XG4gIH0gZWxzZSBpZiAobW9kZWxEYXRhLmJ1ZmZlciA9PT0gd2FzbS5IRUFQVTguYnVmZmVyKSB7XG4gICAgLy8gaWYgbW9kZWwgZGF0YSB1c2VzIHRoZSBzYW1lIGJ1ZmZlciBhcyB0aGUgV0FTTSBoZWFwLCB3ZSBkb24ndCBuZWVkIHRvIGNvcHkgaXQuXG4gICAgW21vZGVsRGF0YU9mZnNldCwgbW9kZWxEYXRhTGVuZ3RoXSA9IFttb2RlbERhdGEuYnl0ZU9mZnNldCwgbW9kZWxEYXRhLmJ5dGVMZW5ndGhdO1xuICB9IGVsc2Uge1xuICAgIC8vIG90aGVyd2lzZSwgY29weSB0aGUgbW9kZWwgZGF0YSB0byB0aGUgV0FTTSBoZWFwLlxuICAgIFttb2RlbERhdGFPZmZzZXQsIG1vZGVsRGF0YUxlbmd0aF0gPSBjb3B5RnJvbUV4dGVybmFsQnVmZmVyKG1vZGVsRGF0YSk7XG4gIH1cblxuICBsZXQgc2Vzc2lvbkhhbmRsZSA9IDA7XG4gIGxldCBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGxldCBpb0JpbmRpbmdIYW5kbGUgPSAwO1xuICBsZXQgYWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuICBjb25zdCBpbnB1dE5hbWVzVVRGOEVuY29kZWQgPSBbXTtcbiAgY29uc3Qgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCA9IFtdO1xuXG4gIHRyeSB7XG4gICAgW3Nlc3Npb25PcHRpb25zSGFuZGxlLCBhbGxvY3NdID0gYXdhaXQgc2V0U2Vzc2lvbk9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICBpZiAob3B0aW9ucz8uZXh0ZXJuYWxEYXRhICYmIHdhc20ubW91bnRFeHRlcm5hbERhdGEpIHtcbiAgICAgIGNvbnN0IGxvYWRpbmdQcm9taXNlcyA9IFtdO1xuICAgICAgZm9yIChjb25zdCBmaWxlIG9mIG9wdGlvbnMuZXh0ZXJuYWxEYXRhKSB7XG4gICAgICAgIGNvbnN0IHBhdGggPSB0eXBlb2YgZmlsZSA9PT0gJ3N0cmluZycgPyBmaWxlIDogZmlsZS5wYXRoO1xuICAgICAgICBsb2FkaW5nUHJvbWlzZXMucHVzaChcbiAgICAgICAgICBsb2FkRmlsZSh0eXBlb2YgZmlsZSA9PT0gJ3N0cmluZycgPyBmaWxlIDogZmlsZS5kYXRhKS50aGVuKChkYXRhKSA9PiB7XG4gICAgICAgICAgICB3YXNtLm1vdW50RXh0ZXJuYWxEYXRhKHBhdGgsIGRhdGEpO1xuICAgICAgICAgIH0pLFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyB3YWl0IGZvciBhbGwgZXh0ZXJuYWwgZGF0YSBmaWxlcyB0byBiZSBsb2FkZWRcbiAgICAgIGF3YWl0IFByb21pc2UuYWxsKGxvYWRpbmdQcm9taXNlcyk7XG4gICAgfVxuXG4gICAgZm9yIChjb25zdCBwcm92aWRlciBvZiBvcHRpb25zPy5leGVjdXRpb25Qcm92aWRlcnMgPz8gW10pIHtcbiAgICAgIGNvbnN0IHByb3ZpZGVyTmFtZSA9IHR5cGVvZiBwcm92aWRlciA9PT0gJ3N0cmluZycgPyBwcm92aWRlciA6IHByb3ZpZGVyLm5hbWU7XG4gICAgICBpZiAocHJvdmlkZXJOYW1lID09PSAnd2Vibm4nKSB7XG4gICAgICAgIHdhc20uc2hvdWxkVHJhbnNmZXJUb01MVGVuc29yID0gZmFsc2U7XG4gICAgICAgIGlmICh0eXBlb2YgcHJvdmlkZXIgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgY29uc3Qgd2Vibm5PcHRpb25zID0gcHJvdmlkZXIgYXMgSW5mZXJlbmNlU2Vzc2lvbi5XZWJOTkV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgICAgICAgIGNvbnN0IGNvbnRleHQgPSAod2Vibm5PcHRpb25zIGFzIEluZmVyZW5jZVNlc3Npb24uV2ViTk5PcHRpb25zV2l0aE1MQ29udGV4dCk/LmNvbnRleHQ7XG4gICAgICAgICAgY29uc3QgZ3B1RGV2aWNlID0gKHdlYm5uT3B0aW9ucyBhcyBJbmZlcmVuY2VTZXNzaW9uLldlYk5OT3B0aW9uc1dlYkdwdSk/LmdwdURldmljZTtcbiAgICAgICAgICBjb25zdCBkZXZpY2VUeXBlID0gKHdlYm5uT3B0aW9ucyBhcyBJbmZlcmVuY2VTZXNzaW9uLldlYk5OQ29udGV4dE9wdGlvbnMpPy5kZXZpY2VUeXBlO1xuICAgICAgICAgIGNvbnN0IHBvd2VyUHJlZmVyZW5jZSA9ICh3ZWJubk9wdGlvbnMgYXMgSW5mZXJlbmNlU2Vzc2lvbi5XZWJOTkNvbnRleHRPcHRpb25zKT8ucG93ZXJQcmVmZXJlbmNlO1xuICAgICAgICAgIGlmIChjb250ZXh0KSB7XG4gICAgICAgICAgICB3YXNtLmN1cnJlbnRDb250ZXh0ID0gY29udGV4dCBhcyBNTENvbnRleHQ7XG4gICAgICAgICAgfSBlbHNlIGlmIChncHVEZXZpY2UpIHtcbiAgICAgICAgICAgIHdhc20uY3VycmVudENvbnRleHQgPSBhd2FpdCB3YXNtLndlYm5uQ3JlYXRlTUxDb250ZXh0IShncHVEZXZpY2UpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB3YXNtLmN1cnJlbnRDb250ZXh0ID0gYXdhaXQgd2FzbS53ZWJubkNyZWF0ZU1MQ29udGV4dCEoeyBkZXZpY2VUeXBlLCBwb3dlclByZWZlcmVuY2UgfSk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHdhc20uY3VycmVudENvbnRleHQgPSBhd2FpdCB3YXNtLndlYm5uQ3JlYXRlTUxDb250ZXh0ISgpO1xuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgfVxuICAgIH1cblxuICAgIHNlc3Npb25IYW5kbGUgPSBhd2FpdCB3YXNtLl9PcnRDcmVhdGVTZXNzaW9uKG1vZGVsRGF0YU9mZnNldCwgbW9kZWxEYXRhTGVuZ3RoLCBzZXNzaW9uT3B0aW9uc0hhbmRsZSk7XG4gICAgd2FzbS53ZWJncHVPbkNyZWF0ZVNlc3Npb24/LihzZXNzaW9uSGFuZGxlKTtcbiAgICBpZiAoc2Vzc2lvbkhhbmRsZSA9PT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoXCJDYW4ndCBjcmVhdGUgYSBzZXNzaW9uLlwiKTtcbiAgICB9XG5cbiAgICB3YXNtLmpzZXBPbkNyZWF0ZVNlc3Npb24/LigpO1xuXG4gICAgLy8gY2xlYXIgY3VycmVudCBNTENvbnRleHQgYWZ0ZXIgc2Vzc2lvbiBjcmVhdGlvblxuICAgIGlmICh3YXNtLmN1cnJlbnRDb250ZXh0KSB7XG4gICAgICB3YXNtLndlYm5uUmVnaXN0ZXJNTENvbnRleHQhKHNlc3Npb25IYW5kbGUsIHdhc20uY3VycmVudENvbnRleHQpO1xuICAgICAgd2FzbS5jdXJyZW50Q29udGV4dCA9IHVuZGVmaW5lZDtcbiAgICAgIHdhc20uc2hvdWxkVHJhbnNmZXJUb01MVGVuc29yID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb25zdCBbaW5wdXRDb3VudCwgb3V0cHV0Q291bnRdID0gZ2V0U2Vzc2lvbklucHV0T3V0cHV0Q291bnQoc2Vzc2lvbkhhbmRsZSk7XG5cbiAgICBjb25zdCBlbmFibGVHcmFwaENhcHR1cmUgPSAhIW9wdGlvbnM/LmVuYWJsZUdyYXBoQ2FwdHVyZTtcblxuICAgIGNvbnN0IGlucHV0TmFtZXMgPSBbXTtcbiAgICBjb25zdCBvdXRwdXROYW1lcyA9IFtdO1xuICAgIGNvbnN0IGlucHV0TWV0YWRhdGE6IEluZmVyZW5jZVNlc3Npb24uVmFsdWVNZXRhZGF0YVtdID0gW107XG4gICAgY29uc3Qgb3V0cHV0TWV0YWRhdGE6IEluZmVyZW5jZVNlc3Npb24uVmFsdWVNZXRhZGF0YVtdID0gW107XG4gICAgY29uc3Qgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zOiBTdXBwb3J0ZWRUZW5zb3JEYXRhTG9jYXRpb25Gb3JJbnB1dE91dHB1dFtdID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgIGNvbnN0IFtuYW1lT2Zmc2V0LCBlbGVtZW50VHlwZSwgc2hhcGVdID0gZ2V0U2Vzc2lvbklucHV0T3V0cHV0TWV0YWRhdGEoc2Vzc2lvbkhhbmRsZSwgaSk7XG4gICAgICBpZiAobmFtZU9mZnNldCA9PT0gMCkge1xuICAgICAgICBjaGVja0xhc3RFcnJvcihcIkNhbid0IGdldCBhbiBpbnB1dCBuYW1lLlwiKTtcbiAgICAgIH1cbiAgICAgIGlucHV0TmFtZXNVVEY4RW5jb2RlZC5wdXNoKG5hbWVPZmZzZXQpO1xuICAgICAgY29uc3QgbmFtZSA9IHdhc20uVVRGOFRvU3RyaW5nKG5hbWVPZmZzZXQpO1xuICAgICAgaW5wdXROYW1lcy5wdXNoKG5hbWUpO1xuICAgICAgaW5wdXRNZXRhZGF0YS5wdXNoKFxuICAgICAgICBlbGVtZW50VHlwZSA9PT0gMFxuICAgICAgICAgID8geyBuYW1lLCBpc1RlbnNvcjogZmFsc2UgfVxuICAgICAgICAgIDogeyBuYW1lLCBpc1RlbnNvcjogdHJ1ZSwgdHlwZTogdGVuc29yRGF0YVR5cGVFbnVtVG9TdHJpbmcoZWxlbWVudFR5cGUpLCBzaGFwZTogc2hhcGUhIH0sXG4gICAgICApO1xuICAgIH1cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dHB1dENvdW50OyBpKyspIHtcbiAgICAgIGNvbnN0IFtuYW1lT2Zmc2V0LCBlbGVtZW50VHlwZSwgc2hhcGVdID0gZ2V0U2Vzc2lvbklucHV0T3V0cHV0TWV0YWRhdGEoc2Vzc2lvbkhhbmRsZSwgaSArIGlucHV0Q291bnQpO1xuICAgICAgaWYgKG5hbWVPZmZzZXQgPT09IDApIHtcbiAgICAgICAgY2hlY2tMYXN0RXJyb3IoXCJDYW4ndCBnZXQgYW4gb3V0cHV0IG5hbWUuXCIpO1xuICAgICAgfVxuICAgICAgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZC5wdXNoKG5hbWVPZmZzZXQpO1xuICAgICAgY29uc3QgbmFtZVN0cmluZyA9IHdhc20uVVRGOFRvU3RyaW5nKG5hbWVPZmZzZXQpO1xuICAgICAgb3V0cHV0TmFtZXMucHVzaChuYW1lU3RyaW5nKTtcbiAgICAgIG91dHB1dE1ldGFkYXRhLnB1c2goXG4gICAgICAgIGVsZW1lbnRUeXBlID09PSAwXG4gICAgICAgICAgPyB7IG5hbWU6IG5hbWVTdHJpbmcsIGlzVGVuc29yOiBmYWxzZSB9XG4gICAgICAgICAgOiB7IG5hbWU6IG5hbWVTdHJpbmcsIGlzVGVuc29yOiB0cnVlLCB0eXBlOiB0ZW5zb3JEYXRhVHlwZUVudW1Ub1N0cmluZyhlbGVtZW50VHlwZSksIHNoYXBlOiBzaGFwZSEgfSxcbiAgICAgICk7XG5cbiAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX0pTRVApIHtcbiAgICAgICAgaWYgKGVuYWJsZUdyYXBoQ2FwdHVyZSAmJiBvcHRpb25zPy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbiA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLnB1c2goJ2dwdS1idWZmZXInKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsb2NhdGlvbiA9XG4gICAgICAgICAgdHlwZW9mIG9wdGlvbnM/LnByZWZlcnJlZE91dHB1dExvY2F0aW9uID09PSAnc3RyaW5nJ1xuICAgICAgICAgICAgPyBvcHRpb25zLnByZWZlcnJlZE91dHB1dExvY2F0aW9uXG4gICAgICAgICAgICA6IChvcHRpb25zPy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbj8uW25hbWVTdHJpbmddID8/ICdjcHUnKTtcbiAgICAgICAgY29uc3QgaXNHcmFwaE91dHB1dCA9IHdhc20ud2Vibm5Jc0dyYXBoT3V0cHV0O1xuICAgICAgICBpZiAobG9jYXRpb24gPT09ICdjcHUnICYmIGlzR3JhcGhPdXRwdXQgJiYgaXNHcmFwaE91dHB1dChzZXNzaW9uSGFuZGxlLCBuYW1lU3RyaW5nKSkge1xuICAgICAgICAgIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5wdXNoKCdtbC10ZW5zb3ItY3B1LW91dHB1dCcpO1xuICAgICAgICAgIGNvbnRpbnVlO1xuICAgICAgICB9XG4gICAgICAgIGlmIChsb2NhdGlvbiAhPT0gJ2NwdScgJiYgbG9jYXRpb24gIT09ICdjcHUtcGlubmVkJyAmJiBsb2NhdGlvbiAhPT0gJ2dwdS1idWZmZXInICYmIGxvY2F0aW9uICE9PSAnbWwtdGVuc29yJykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IHN1cHBvcnRlZCBwcmVmZXJyZWQgb3V0cHV0IGxvY2F0aW9uOiAke2xvY2F0aW9ufS5gKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoZW5hYmxlR3JhcGhDYXB0dXJlICYmIGxvY2F0aW9uICE9PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgTm90IHN1cHBvcnRlZCBwcmVmZXJyZWQgb3V0cHV0IGxvY2F0aW9uOiAke2xvY2F0aW9ufS4gT25seSAnZ3B1LWJ1ZmZlcicgbG9jYXRpb24gaXMgc3VwcG9ydGVkIHdoZW4gZW5hYmxlR3JhcGhDYXB0dXJlIGlzIHRydWUuYCxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICAgIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5wdXNoKGxvY2F0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyB1c2UgSU8gYmluZGluZyBvbmx5IHdoZW4gYXQgbGVhc3Qgb25lIG91dHB1dCBpcyBwcmVmZXJyZWQgdG8gYmUgb24gR1BVLlxuICAgIGxldCBiaW5kaW5nU3RhdGU6IElPQmluZGluZ1N0YXRlIHwgbnVsbCA9IG51bGw7XG4gICAgaWYgKFxuICAgICAgIUJVSUxEX0RFRlMuRElTQUJMRV9KU0VQICYmXG4gICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMuc29tZSgobCkgPT4gbCA9PT0gJ2dwdS1idWZmZXInIHx8IGwgPT09ICdtbC10ZW5zb3InIHx8IGwgPT09ICdtbC10ZW5zb3ItY3B1LW91dHB1dCcpXG4gICAgKSB7XG4gICAgICBpb0JpbmRpbmdIYW5kbGUgPSB3YXNtLl9PcnRDcmVhdGVCaW5kaW5nKHNlc3Npb25IYW5kbGUpO1xuICAgICAgaWYgKGlvQmluZGluZ0hhbmRsZSA9PT0gMCkge1xuICAgICAgICBjaGVja0xhc3RFcnJvcihcIkNhbid0IGNyZWF0ZSBJTyBiaW5kaW5nLlwiKTtcbiAgICAgIH1cblxuICAgICAgYmluZGluZ1N0YXRlID0ge1xuICAgICAgICBoYW5kbGU6IGlvQmluZGluZ0hhbmRsZSxcbiAgICAgICAgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLFxuICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkOiBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNcbiAgICAgICAgICAvLyAnbWwtdGVuc29yLWNwdS1vdXRwdXQnIGlzIHRyZWF0ZWQgYXMgJ21sLXRlbnNvcicgZm9yIHRoZSBwdXJwb3NlIG9mIElPIGJpbmRpbmcuXG4gICAgICAgICAgLm1hcCgobCkgPT4gKGwgPT09ICdtbC10ZW5zb3ItY3B1LW91dHB1dCcgPyAnbWwtdGVuc29yJyA6IGwpKVxuICAgICAgICAgIC5tYXAoKGwpID0+IGRhdGFMb2NhdGlvblN0cmluZ1RvRW51bShsKSksXG4gICAgICB9O1xuICAgIH1cblxuICAgIGFjdGl2ZVNlc3Npb25zLnNldChzZXNzaW9uSGFuZGxlLCBbXG4gICAgICBzZXNzaW9uSGFuZGxlLFxuICAgICAgaW5wdXROYW1lc1VURjhFbmNvZGVkLFxuICAgICAgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCxcbiAgICAgIGJpbmRpbmdTdGF0ZSxcbiAgICAgIGVuYWJsZUdyYXBoQ2FwdHVyZSxcbiAgICAgIGZhbHNlLFxuICAgIF0pO1xuICAgIHJldHVybiBbc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lcywgb3V0cHV0TmFtZXMsIGlucHV0TWV0YWRhdGEsIG91dHB1dE1ldGFkYXRhXTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlucHV0TmFtZXNVVEY4RW5jb2RlZC5mb3JFYWNoKChidWYpID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG4gICAgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZC5mb3JFYWNoKChidWYpID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG5cbiAgICBpZiAoaW9CaW5kaW5nSGFuZGxlICE9PSAwKSB7XG4gICAgICBpZiAod2FzbS5fT3J0UmVsZWFzZUJpbmRpbmcoaW9CaW5kaW5nSGFuZGxlKSAhPT0gMCkge1xuICAgICAgICBjaGVja0xhc3RFcnJvcihcIkNhbid0IHJlbGVhc2UgSU8gYmluZGluZy5cIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKHNlc3Npb25IYW5kbGUgIT09IDApIHtcbiAgICAgIGlmICh3YXNtLl9PcnRSZWxlYXNlU2Vzc2lvbihzZXNzaW9uSGFuZGxlKSAhPT0gMCkge1xuICAgICAgICBjaGVja0xhc3RFcnJvcihcIkNhbid0IHJlbGVhc2Ugc2Vzc2lvbi5cIik7XG4gICAgICB9XG4gICAgfVxuICAgIHRocm93IGU7XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5fZnJlZShtb2RlbERhdGFPZmZzZXQpO1xuICAgIGlmIChzZXNzaW9uT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgaWYgKHdhc20uX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucyhzZXNzaW9uT3B0aW9uc0hhbmRsZSkgIT09IDApIHtcbiAgICAgICAgY2hlY2tMYXN0RXJyb3IoXCJDYW4ndCByZWxlYXNlIHNlc3Npb24gb3B0aW9ucy5cIik7XG4gICAgICB9XG4gICAgfVxuICAgIGFsbG9jcy5mb3JFYWNoKChhbGxvYykgPT4gd2FzbS5fZnJlZShhbGxvYykpO1xuXG4gICAgLy8gdW5tb3VudCBleHRlcm5hbCBkYXRhIGlmIG5lY2Vzc2FyeVxuICAgIHdhc20udW5tb3VudEV4dGVybmFsRGF0YT8uKCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCByZWxlYXNlU2Vzc2lvbiA9IChzZXNzaW9uSWQ6IG51bWJlcik6IHZvaWQgPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3Qgc2Vzc2lvbiA9IGFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICBpZiAoIXNlc3Npb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGNhbm5vdCByZWxlYXNlIHNlc3Npb24uIGludmFsaWQgc2Vzc2lvbiBpZDogJHtzZXNzaW9uSWR9YCk7XG4gIH1cbiAgY29uc3QgW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZCwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCwgaW9CaW5kaW5nU3RhdGUsIGVuYWJsZUdyYXBoQ2FwdHVyZV0gPSBzZXNzaW9uO1xuXG4gIGlmIChpb0JpbmRpbmdTdGF0ZSkge1xuICAgIGlmIChlbmFibGVHcmFwaENhcHR1cmUpIHtcbiAgICAgIGlmICh3YXNtLl9PcnRDbGVhckJvdW5kT3V0cHV0cyhpb0JpbmRpbmdTdGF0ZS5oYW5kbGUpICE9PSAwKSB7XG4gICAgICAgIGNoZWNrTGFzdEVycm9yKFwiQ2FuJ3QgY2xlYXIgYm91bmQgb3V0cHV0cy5cIik7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICh3YXNtLl9PcnRSZWxlYXNlQmluZGluZyhpb0JpbmRpbmdTdGF0ZS5oYW5kbGUpICE9PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcihcIkNhbid0IHJlbGVhc2UgSU8gYmluZGluZy5cIik7XG4gICAgfVxuICB9XG5cbiAgd2FzbS5qc2VwT25SZWxlYXNlU2Vzc2lvbj8uKHNlc3Npb25JZCk7XG4gIHdhc20ud2Vibm5PblJlbGVhc2VTZXNzaW9uPy4oc2Vzc2lvbklkKTtcbiAgd2FzbS53ZWJncHVPblJlbGVhc2VTZXNzaW9uPy4oc2Vzc2lvbklkKTtcblxuICBpbnB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaCgoYnVmKSA9PiB3YXNtLl9PcnRGcmVlKGJ1ZikpO1xuICBvdXRwdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goKGJ1ZikgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcbiAgaWYgKHdhc20uX09ydFJlbGVhc2VTZXNzaW9uKHNlc3Npb25IYW5kbGUpICE9PSAwKSB7XG4gICAgY2hlY2tMYXN0RXJyb3IoXCJDYW4ndCByZWxlYXNlIHNlc3Npb24uXCIpO1xuICB9XG4gIGFjdGl2ZVNlc3Npb25zLmRlbGV0ZShzZXNzaW9uSWQpO1xufTtcblxuZXhwb3J0IGNvbnN0IHByZXBhcmVJbnB1dE91dHB1dFRlbnNvciA9IGFzeW5jIChcbiAgdGVuc29yOiBUZW5zb3JNZXRhZGF0YSB8IG51bGwsXG4gIHRlbnNvckhhbmRsZXM6IG51bWJlcltdLFxuICBhbGxvY3M6IG51bWJlcltdLFxuICBzZXNzaW9uSWQ6IG51bWJlcixcbiAgdGVuc29yTmFtZVVURjhFbmNvZGVkOiBudW1iZXIsXG4gIGluZGV4OiBudW1iZXIsXG4gIGVuYWJsZUdyYXBoQ2FwdHVyZSA9IGZhbHNlLFxuKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGlmICghdGVuc29yKSB7XG4gICAgdGVuc29ySGFuZGxlcy5wdXNoKDApO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBwdHJTaXplID0gd2FzbS5QVFJfU0laRTtcblxuICBjb25zdCBkYXRhVHlwZSA9IHRlbnNvclswXTtcbiAgY29uc3QgZGltcyA9IHRlbnNvclsxXTtcbiAgY29uc3QgbG9jYXRpb24gPSB0ZW5zb3JbM107XG4gIGxldCBhY3R1YWxMb2NhdGlvbiA9IGxvY2F0aW9uO1xuXG4gIGxldCByYXdEYXRhOiBudW1iZXI7XG4gIGxldCBkYXRhQnl0ZUxlbmd0aDogbnVtYmVyO1xuXG4gIGlmIChkYXRhVHlwZSA9PT0gJ3N0cmluZycgJiYgKGxvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicgfHwgbG9jYXRpb24gPT09ICdtbC10ZW5zb3InKSkge1xuICAgIHRocm93IG5ldyBFcnJvcignU3RyaW5nIHRlbnNvciBpcyBub3Qgc3VwcG9ydGVkIG9uIEdQVS4nKTtcbiAgfVxuXG4gIGlmIChlbmFibGVHcmFwaENhcHR1cmUgJiYgbG9jYXRpb24gIT09ICdncHUtYnVmZmVyJykge1xuICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgIGBFeHRlcm5hbCBidWZmZXIgbXVzdCBiZSBwcm92aWRlZCBmb3IgaW5wdXQvb3V0cHV0IGluZGV4ICR7aW5kZXh9IHdoZW4gZW5hYmxlR3JhcGhDYXB0dXJlIGlzIHRydWUuYCxcbiAgICApO1xuICB9XG5cbiAgaWYgKGxvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICBjb25zdCBncHVCdWZmZXIgPSB0ZW5zb3JbMl0uZ3B1QnVmZmVyO1xuICAgIGRhdGFCeXRlTGVuZ3RoID0gY2FsY3VsYXRlVGVuc29yU2l6ZUluQnl0ZXModGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0oZGF0YVR5cGUpLCBkaW1zKSE7XG5cbiAgICBpZiAoQlVJTERfREVGUy5VU0VfV0VCR1BVX0VQKSB7XG4gICAgICBjb25zdCByZWdpc3RlckJ1ZmZlciA9IHdhc20ud2ViZ3B1UmVnaXN0ZXJCdWZmZXI7XG4gICAgICBpZiAoIXJlZ2lzdGVyQnVmZmVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVGVuc29yIGxvY2F0aW9uIFwiZ3B1LWJ1ZmZlclwiIGlzIG5vdCBzdXBwb3J0ZWQgd2l0aG91dCB1c2luZyBXZWJHUFUuJyk7XG4gICAgICB9XG5cbiAgICAgIHJhd0RhdGEgPSByZWdpc3RlckJ1ZmZlcihncHVCdWZmZXIsIHNlc3Npb25JZCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IHJlZ2lzdGVyQnVmZmVyID0gd2FzbS5qc2VwUmVnaXN0ZXJCdWZmZXI7XG4gICAgICBpZiAoIXJlZ2lzdGVyQnVmZmVyKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignVGVuc29yIGxvY2F0aW9uIFwiZ3B1LWJ1ZmZlclwiIGlzIG5vdCBzdXBwb3J0ZWQgd2l0aG91dCB1c2luZyBXZWJHUFUuJyk7XG4gICAgICB9XG4gICAgICByYXdEYXRhID0gcmVnaXN0ZXJCdWZmZXIoc2Vzc2lvbklkLCBpbmRleCwgZ3B1QnVmZmVyLCBkYXRhQnl0ZUxlbmd0aCk7XG4gICAgfVxuICB9IGVsc2UgaWYgKGxvY2F0aW9uID09PSAnbWwtdGVuc29yJykge1xuICAgIGNvbnN0IG1sVGVuc29yID0gdGVuc29yWzJdLm1sVGVuc29yIGFzIE1MVGVuc29yO1xuICAgIGRhdGFCeXRlTGVuZ3RoID0gY2FsY3VsYXRlVGVuc29yU2l6ZUluQnl0ZXModGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0oZGF0YVR5cGUpLCBkaW1zKSE7XG5cbiAgICBjb25zdCByZWdpc3Rlck1MVGVuc29yID0gd2FzbS53ZWJublJlZ2lzdGVyTUxUZW5zb3I7XG4gICAgaWYgKCFyZWdpc3Rlck1MVGVuc29yKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RlbnNvciBsb2NhdGlvbiBcIm1sLXRlbnNvclwiIGlzIG5vdCBzdXBwb3J0ZWQgd2l0aG91dCB1c2luZyBXZWJOTi4nKTtcbiAgICB9XG4gICAgcmF3RGF0YSA9IHJlZ2lzdGVyTUxUZW5zb3Ioc2Vzc2lvbklkLCBtbFRlbnNvciwgdGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0oZGF0YVR5cGUpLCBkaW1zKTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCBkYXRhID0gdGVuc29yWzJdO1xuXG4gICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcbiAgICAgIC8vIHN0cmluZyB0ZW5zb3JcbiAgICAgIGRhdGFCeXRlTGVuZ3RoID0gcHRyU2l6ZSAqIGRhdGEubGVuZ3RoO1xuICAgICAgcmF3RGF0YSA9IHdhc20uX21hbGxvYyhkYXRhQnl0ZUxlbmd0aCk7XG4gICAgICBhbGxvY3MucHVzaChyYXdEYXRhKTtcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xuICAgICAgICBpZiAodHlwZW9mIGRhdGFbaV0gIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgdGVuc29yIGRhdGEgYXQgaW5kZXggJHtpfSBpcyBub3QgYSBzdHJpbmdgKTtcbiAgICAgICAgfVxuICAgICAgICB3YXNtLnNldFZhbHVlKHJhd0RhdGEgKyBpICogcHRyU2l6ZSwgYWxsb2NXYXNtU3RyaW5nKGRhdGFbaV0sIGFsbG9jcyksICcqJyk7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IGlzR3JhcGhJbnB1dCA9IHdhc20ud2Vibm5Jc0dyYXBoSW5wdXQ7XG4gICAgICBjb25zdCBpc0dyYXBoT3V0cHV0ID0gd2FzbS53ZWJubklzR3JhcGhPdXRwdXQ7XG4gICAgICBpZiAoZGF0YVR5cGUgIT09ICdzdHJpbmcnICYmIGlzR3JhcGhJbnB1dCAmJiBpc0dyYXBoT3V0cHV0KSB7XG4gICAgICAgIGNvbnN0IHRlbnNvck5hbWUgPSB3YXNtLlVURjhUb1N0cmluZyh0ZW5zb3JOYW1lVVRGOEVuY29kZWQpO1xuICAgICAgICAvLyBQcm9tb3RlIHRoZSB0ZW5zb3IgdG8gJ21sLXRlbnNvcicgaWYgaXQgaXMgYSBncmFwaCBpbnB1dC5cbiAgICAgICAgaWYgKGlzR3JhcGhJbnB1dChzZXNzaW9uSWQsIHRlbnNvck5hbWUpIHx8IGlzR3JhcGhPdXRwdXQoc2Vzc2lvbklkLCB0ZW5zb3JOYW1lKSkge1xuICAgICAgICAgIGNvbnN0IGRhdGFUeXBlRW51bSA9IHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtKGRhdGFUeXBlKTtcbiAgICAgICAgICBkYXRhQnl0ZUxlbmd0aCA9IGNhbGN1bGF0ZVRlbnNvclNpemVJbkJ5dGVzKGRhdGFUeXBlRW51bSwgZGltcykhO1xuICAgICAgICAgIGFjdHVhbExvY2F0aW9uID0gJ21sLXRlbnNvcic7XG4gICAgICAgICAgY29uc3QgY3JlYXRlVGVtcG9yYXJ5VGVuc29yID0gd2FzbS53ZWJubkNyZWF0ZVRlbXBvcmFyeVRlbnNvcjtcbiAgICAgICAgICBjb25zdCB1cGxvYWRUZW5zb3IgPSB3YXNtLndlYm5uVXBsb2FkVGVuc29yO1xuICAgICAgICAgIGlmICghY3JlYXRlVGVtcG9yYXJ5VGVuc29yIHx8ICF1cGxvYWRUZW5zb3IpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGVuc29yIGxvY2F0aW9uIFwibWwtdGVuc29yXCIgaXMgbm90IHN1cHBvcnRlZCB3aXRob3V0IHVzaW5nIFdlYk5OLicpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBjb25zdCB0ZW5zb3JJZCA9IGF3YWl0IGNyZWF0ZVRlbXBvcmFyeVRlbnNvcihzZXNzaW9uSWQsIGRhdGFUeXBlRW51bSwgZGltcyBhcyBudW1iZXJbXSk7XG4gICAgICAgICAgdXBsb2FkVGVuc29yKHRlbnNvcklkLCBuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhLmJ5dGVMZW5ndGgpKTtcbiAgICAgICAgICByYXdEYXRhID0gdGVuc29ySWQ7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgZGF0YUJ5dGVMZW5ndGggPSBkYXRhLmJ5dGVMZW5ndGg7XG4gICAgICAgICAgcmF3RGF0YSA9IHdhc20uX21hbGxvYyhkYXRhQnl0ZUxlbmd0aCk7XG4gICAgICAgICAgYWxsb2NzLnB1c2gocmF3RGF0YSk7XG4gICAgICAgICAgd2FzbS5IRUFQVTguc2V0KG5ldyBVaW50OEFycmF5KGRhdGEuYnVmZmVyLCBkYXRhLmJ5dGVPZmZzZXQsIGRhdGFCeXRlTGVuZ3RoKSwgcmF3RGF0YSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gZGF0YS5ieXRlTGVuZ3RoO1xuICAgICAgICByYXdEYXRhID0gd2FzbS5fbWFsbG9jKGRhdGFCeXRlTGVuZ3RoKTtcbiAgICAgICAgYWxsb2NzLnB1c2gocmF3RGF0YSk7XG4gICAgICAgIHdhc20uSEVBUFU4LnNldChuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhQnl0ZUxlbmd0aCksIHJhd0RhdGEpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgY29uc3QgZGltc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyg0ICogZGltcy5sZW5ndGgpO1xuICB0cnkge1xuICAgIGRpbXMuZm9yRWFjaCgoZCwgaW5kZXgpID0+IHdhc20uc2V0VmFsdWUoZGltc09mZnNldCArIGluZGV4ICogcHRyU2l6ZSwgZCwgcHRyU2l6ZSA9PT0gNCA/ICdpMzInIDogJ2k2NCcpKTtcbiAgICBjb25zdCB0ZW5zb3IgPSB3YXNtLl9PcnRDcmVhdGVUZW5zb3IoXG4gICAgICB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bShkYXRhVHlwZSksXG4gICAgICByYXdEYXRhLFxuICAgICAgZGF0YUJ5dGVMZW5ndGgsXG4gICAgICBkaW1zT2Zmc2V0LFxuICAgICAgZGltcy5sZW5ndGgsXG4gICAgICBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0oYWN0dWFsTG9jYXRpb24pLFxuICAgICk7XG4gICAgaWYgKHRlbnNvciA9PT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGNyZWF0ZSB0ZW5zb3IgZm9yIGlucHV0L291dHB1dC4gc2Vzc2lvbj0ke3Nlc3Npb25JZH0sIGluZGV4PSR7aW5kZXh9LmApO1xuICAgIH1cbiAgICB0ZW5zb3JIYW5kbGVzLnB1c2godGVuc29yKTtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLnN0YWNrUmVzdG9yZShzdGFjayk7XG4gIH1cbn07XG5cbi8qKlxuICogcGVyZm9ybSBpbmZlcmVuY2UgcnVuXG4gKi9cbmV4cG9ydCBjb25zdCBydW4gPSBhc3luYyAoXG4gIHNlc3Npb25JZDogbnVtYmVyLFxuICBpbnB1dEluZGljZXM6IG51bWJlcltdLFxuICBpbnB1dFRlbnNvcnM6IFRlbnNvck1ldGFkYXRhW10sXG4gIG91dHB1dEluZGljZXM6IG51bWJlcltdLFxuICBvdXRwdXRUZW5zb3JzOiBBcnJheTxUZW5zb3JNZXRhZGF0YSB8IG51bGw+LFxuICBvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMsXG4pOiBQcm9taXNlPFRlbnNvck1ldGFkYXRhW10+ID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IHB0clNpemUgPSB3YXNtLlBUUl9TSVpFO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IHJ1biBpbmZlcmVuY2UuIGludmFsaWQgc2Vzc2lvbiBpZDogJHtzZXNzaW9uSWR9YCk7XG4gIH1cbiAgY29uc3Qgc2Vzc2lvbkhhbmRsZSA9IHNlc3Npb25bMF07XG4gIGNvbnN0IGlucHV0TmFtZXNVVEY4RW5jb2RlZCA9IHNlc3Npb25bMV07XG4gIGNvbnN0IG91dHB1dE5hbWVzVVRGOEVuY29kZWQgPSBzZXNzaW9uWzJdO1xuICBjb25zdCBpb0JpbmRpbmdTdGF0ZSA9IHNlc3Npb25bM107XG4gIGNvbnN0IGVuYWJsZUdyYXBoQ2FwdHVyZSA9IHNlc3Npb25bNF07XG4gIGNvbnN0IGlucHV0T3V0cHV0Qm91bmQgPSBzZXNzaW9uWzVdO1xuXG4gIGNvbnN0IGlucHV0Q291bnQgPSBpbnB1dEluZGljZXMubGVuZ3RoO1xuICBjb25zdCBvdXRwdXRDb3VudCA9IG91dHB1dEluZGljZXMubGVuZ3RoO1xuXG4gIGxldCBydW5PcHRpb25zSGFuZGxlID0gMDtcbiAgbGV0IHJ1bk9wdGlvbnNBbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3QgaW5wdXRUZW5zb3JIYW5kbGVzOiBudW1iZXJbXSA9IFtdO1xuICBjb25zdCBvdXRwdXRUZW5zb3JIYW5kbGVzOiBudW1iZXJbXSA9IFtdO1xuICBjb25zdCBpbnB1dE91dHB1dEFsbG9jczogbnVtYmVyW10gPSBbXTtcblxuICBjb25zdCBiZWZvcmVSdW5TdGFjayA9IHdhc20uc3RhY2tTYXZlKCk7XG4gIGNvbnN0IGlucHV0VmFsdWVzT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKGlucHV0Q291bnQgKiBwdHJTaXplKTtcbiAgY29uc3QgaW5wdXROYW1lc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhpbnB1dENvdW50ICogcHRyU2l6ZSk7XG4gIGNvbnN0IG91dHB1dFZhbHVlc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhvdXRwdXRDb3VudCAqIHB0clNpemUpO1xuICBjb25zdCBvdXRwdXROYW1lc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhvdXRwdXRDb3VudCAqIHB0clNpemUpO1xuXG4gIHRyeSB7XG4gICAgW3J1bk9wdGlvbnNIYW5kbGUsIHJ1bk9wdGlvbnNBbGxvY3NdID0gc2V0UnVuT3B0aW9ucyhvcHRpb25zKTtcblxuICAgIC8vIGNyZWF0ZSBpbnB1dCB0ZW5zb3JzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgIGF3YWl0IHByZXBhcmVJbnB1dE91dHB1dFRlbnNvcihcbiAgICAgICAgaW5wdXRUZW5zb3JzW2ldLFxuICAgICAgICBpbnB1dFRlbnNvckhhbmRsZXMsXG4gICAgICAgIGlucHV0T3V0cHV0QWxsb2NzLFxuICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgIGlucHV0TmFtZXNVVEY4RW5jb2RlZFtpbnB1dEluZGljZXNbaV1dLFxuICAgICAgICBpbnB1dEluZGljZXNbaV0sXG4gICAgICAgIGVuYWJsZUdyYXBoQ2FwdHVyZSxcbiAgICAgICk7XG4gICAgfVxuXG4gICAgLy8gY3JlYXRlIG91dHB1dCB0ZW5zb3JzXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBhd2FpdCBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IoXG4gICAgICAgIG91dHB1dFRlbnNvcnNbaV0sXG4gICAgICAgIG91dHB1dFRlbnNvckhhbmRsZXMsXG4gICAgICAgIGlucHV0T3V0cHV0QWxsb2NzLFxuICAgICAgICBzZXNzaW9uSWQsXG4gICAgICAgIG91dHB1dE5hbWVzVVRGOEVuY29kZWRbb3V0cHV0SW5kaWNlc1tpXV0sXG4gICAgICAgIGlucHV0Q291bnQgKyBvdXRwdXRJbmRpY2VzW2ldLFxuICAgICAgICBlbmFibGVHcmFwaENhcHR1cmUsXG4gICAgICApO1xuICAgIH1cblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICB3YXNtLnNldFZhbHVlKGlucHV0VmFsdWVzT2Zmc2V0ICsgaSAqIHB0clNpemUsIGlucHV0VGVuc29ySGFuZGxlc1tpXSwgJyonKTtcbiAgICAgIHdhc20uc2V0VmFsdWUoaW5wdXROYW1lc09mZnNldCArIGkgKiBwdHJTaXplLCBpbnB1dE5hbWVzVVRGOEVuY29kZWRbaW5wdXRJbmRpY2VzW2ldXSwgJyonKTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICB3YXNtLnNldFZhbHVlKG91dHB1dFZhbHVlc09mZnNldCArIGkgKiBwdHJTaXplLCBvdXRwdXRUZW5zb3JIYW5kbGVzW2ldLCAnKicpO1xuICAgICAgd2FzbS5zZXRWYWx1ZShvdXRwdXROYW1lc09mZnNldCArIGkgKiBwdHJTaXplLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkW291dHB1dEluZGljZXNbaV1dLCAnKicpO1xuICAgIH1cblxuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX0pTRVAgJiYgaW9CaW5kaW5nU3RhdGUgJiYgIWlucHV0T3V0cHV0Qm91bmQpIHtcbiAgICAgIGNvbnN0IHsgaGFuZGxlLCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMsIG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWQgfSA9IGlvQmluZGluZ1N0YXRlO1xuXG4gICAgICBpZiAoaW5wdXROYW1lc1VURjhFbmNvZGVkLmxlbmd0aCAhPT0gaW5wdXRDb3VudCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgYGlucHV0IGNvdW50IGZyb20gZmVlZHMgKCR7aW5wdXRDb3VudH0pIGlzIGV4cGVjdGVkIHRvIGJlIGFsd2F5cyBlcXVhbCB0byBtb2RlbCdzIGlucHV0IGNvdW50ICgke2lucHV0TmFtZXNVVEY4RW5jb2RlZC5sZW5ndGh9KS5gLFxuICAgICAgICApO1xuICAgICAgfVxuXG4gICAgICAvLyBwcm9jZXNzIGlucHV0c1xuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBpbnB1dEluZGljZXNbaV07XG4gICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydEJpbmRJbnB1dChoYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZFtpbmRleF0sIGlucHV0VGVuc29ySGFuZGxlc1tpXSk7XG4gICAgICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYmluZCBpbnB1dFske2l9XSBmb3Igc2Vzc2lvbj0ke3Nlc3Npb25JZH0uYCk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgLy8gcHJvY2VzcyBwcmUtYWxsb2NhdGVkIG91dHB1dHNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgICBjb25zdCBpbmRleCA9IG91dHB1dEluZGljZXNbaV07XG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gb3V0cHV0VGVuc29yc1tpXT8uWzNdOyAvLyB1bmRlZmluZWQgbWVhbnMgb3V0cHV0IGlzIG5vdCBwcmUtYWxsb2NhdGVkLlxuXG4gICAgICAgIGlmIChsb2NhdGlvbikge1xuICAgICAgICAgIC8vIG91dHB1dCBpcyBwcmUtYWxsb2NhdGVkLiBiaW5kIHRoZSB0ZW5zb3IuXG4gICAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0QmluZE91dHB1dChoYW5kbGUsIG91dHB1dE5hbWVzVVRGOEVuY29kZWRbaW5kZXhdLCBvdXRwdXRUZW5zb3JIYW5kbGVzW2ldLCAwKTtcbiAgICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYmluZCBwcmUtYWxsb2NhdGVkIG91dHB1dFske2l9XSBmb3Igc2Vzc2lvbj0ke3Nlc3Npb25JZH0uYCk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIG91dHB1dCBpcyBub3QgcHJlLWFsbG9jYXRlZC4gcmVzZXQgcHJlZmVycmVkIGxvY2F0aW9uLlxuICAgICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEJpbmRPdXRwdXQoXG4gICAgICAgICAgICBoYW5kbGUsXG4gICAgICAgICAgICBvdXRwdXROYW1lc1VURjhFbmNvZGVkW2luZGV4XSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkW2luZGV4XSxcbiAgICAgICAgICApO1xuICAgICAgICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBiaW5kIG91dHB1dFske2l9XSB0byAke291dHB1dFByZWZlcnJlZExvY2F0aW9uc1tpXX0gZm9yIHNlc3Npb249JHtzZXNzaW9uSWR9LmApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgYWN0aXZlU2Vzc2lvbnMuc2V0KHNlc3Npb25JZCwgW1xuICAgICAgICBzZXNzaW9uSGFuZGxlLFxuICAgICAgICBpbnB1dE5hbWVzVVRGOEVuY29kZWQsXG4gICAgICAgIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsXG4gICAgICAgIGlvQmluZGluZ1N0YXRlLFxuICAgICAgICBlbmFibGVHcmFwaENhcHR1cmUsXG4gICAgICAgIHRydWUsXG4gICAgICBdKTtcbiAgICB9XG5cbiAgICB3YXNtLmpzZXBPblJ1blN0YXJ0Py4oc2Vzc2lvbkhhbmRsZSk7XG4gICAgd2FzbS53ZWJubk9uUnVuU3RhcnQ/LihzZXNzaW9uSGFuZGxlKTtcblxuICAgIGxldCBlcnJvckNvZGU6IG51bWJlcjtcbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9KU0VQICYmIGlvQmluZGluZ1N0YXRlKSB7XG4gICAgICBlcnJvckNvZGUgPSBhd2FpdCB3YXNtLl9PcnRSdW5XaXRoQmluZGluZyhcbiAgICAgICAgc2Vzc2lvbkhhbmRsZSxcbiAgICAgICAgaW9CaW5kaW5nU3RhdGUuaGFuZGxlLFxuICAgICAgICBvdXRwdXRDb3VudCxcbiAgICAgICAgb3V0cHV0VmFsdWVzT2Zmc2V0LFxuICAgICAgICBydW5PcHRpb25zSGFuZGxlLFxuICAgICAgKTtcbiAgICB9IGVsc2Uge1xuICAgICAgZXJyb3JDb2RlID0gYXdhaXQgd2FzbS5fT3J0UnVuKFxuICAgICAgICBzZXNzaW9uSGFuZGxlLFxuICAgICAgICBpbnB1dE5hbWVzT2Zmc2V0LFxuICAgICAgICBpbnB1dFZhbHVlc09mZnNldCxcbiAgICAgICAgaW5wdXRDb3VudCxcbiAgICAgICAgb3V0cHV0TmFtZXNPZmZzZXQsXG4gICAgICAgIG91dHB1dENvdW50LFxuICAgICAgICBvdXRwdXRWYWx1ZXNPZmZzZXQsXG4gICAgICAgIHJ1bk9wdGlvbnNIYW5kbGUsXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdmYWlsZWQgdG8gY2FsbCBPcnRSdW4oKS4nKTtcbiAgICB9XG5cbiAgICBjb25zdCBvdXRwdXQ6IFRlbnNvck1ldGFkYXRhW10gPSBbXTtcbiAgICBjb25zdCBvdXRwdXRQcm9taXNlczogQXJyYXk8UHJvbWlzZTxbbnVtYmVyLCBUZW5zb3IuRGF0YVR5cGVdPj4gPSBbXTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgY29uc3QgdGVuc29yID0gTnVtYmVyKHdhc20uZ2V0VmFsdWUob3V0cHV0VmFsdWVzT2Zmc2V0ICsgaSAqIHB0clNpemUsICcqJykpO1xuICAgICAgaWYgKHRlbnNvciA9PT0gb3V0cHV0VGVuc29ySGFuZGxlc1tpXSkge1xuICAgICAgICAvLyBvdXRwdXQgdGVuc29yIGlzIHByZS1hbGxvY2F0ZWQuIG5vIG5lZWQgdG8gY29weSBkYXRhLlxuICAgICAgICBvdXRwdXQucHVzaChvdXRwdXRUZW5zb3JzW2ldISk7XG4gICAgICAgIGNvbnRpbnVlO1xuICAgICAgfVxuXG4gICAgICBjb25zdCBiZWZvcmVHZXRUZW5zb3JEYXRhU3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICAgICAgLy8gc3RhY2sgYWxsb2NhdGUgNCBwb2ludGVyIHZhbHVlXG4gICAgICBjb25zdCB0ZW5zb3JEYXRhT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDQgKiBwdHJTaXplKTtcblxuICAgICAgbGV0IGtlZXBPdXRwdXRUZW5zb3IgPSBmYWxzZTtcbiAgICAgIGxldCB0eXBlOiBUZW5zb3IuVHlwZSB8IHVuZGVmaW5lZCxcbiAgICAgICAgZGF0YU9mZnNldCA9IDA7XG4gICAgICB0cnkge1xuICAgICAgICBjb25zdCBlcnJvckNvZGUgPSB3YXNtLl9PcnRHZXRUZW5zb3JEYXRhKFxuICAgICAgICAgIHRlbnNvcixcbiAgICAgICAgICB0ZW5zb3JEYXRhT2Zmc2V0LFxuICAgICAgICAgIHRlbnNvckRhdGFPZmZzZXQgKyBwdHJTaXplLFxuICAgICAgICAgIHRlbnNvckRhdGFPZmZzZXQgKyAyICogcHRyU2l6ZSxcblxuICAgICAgICAgIHRlbnNvckRhdGFPZmZzZXQgKyAzICogcHRyU2l6ZSxcbiAgICAgICAgKTtcbiAgICAgICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBhY2Nlc3Mgb3V0cHV0IHRlbnNvciBkYXRhIG9uIGluZGV4ICR7aX0uYCk7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgdmFsdWVUeXBlID0gcHRyU2l6ZSA9PT0gNCA/ICdpMzInIDogJ2k2NCc7XG4gICAgICAgIGNvbnN0IGRhdGFUeXBlID0gTnVtYmVyKHdhc20uZ2V0VmFsdWUodGVuc29yRGF0YU9mZnNldCwgdmFsdWVUeXBlKSk7XG4gICAgICAgIGRhdGFPZmZzZXQgPSB3YXNtLmdldFZhbHVlKHRlbnNvckRhdGFPZmZzZXQgKyBwdHJTaXplLCAnKicpO1xuICAgICAgICBjb25zdCBkaW1zT2Zmc2V0ID0gd2FzbS5nZXRWYWx1ZSh0ZW5zb3JEYXRhT2Zmc2V0ICsgcHRyU2l6ZSAqIDIsICcqJyk7XG4gICAgICAgIGNvbnN0IGRpbXNMZW5ndGggPSBOdW1iZXIod2FzbS5nZXRWYWx1ZSh0ZW5zb3JEYXRhT2Zmc2V0ICsgcHRyU2l6ZSAqIDMsIHZhbHVlVHlwZSkpO1xuICAgICAgICBjb25zdCBkaW1zID0gW107XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGltc0xlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgZGltcy5wdXNoKE51bWJlcih3YXNtLmdldFZhbHVlKGRpbXNPZmZzZXQgKyBpICogcHRyU2l6ZSwgdmFsdWVUeXBlKSkpO1xuICAgICAgICB9XG4gICAgICAgIGlmICh3YXNtLl9PcnRGcmVlKGRpbXNPZmZzZXQpICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoXCJDYW4ndCBmcmVlIG1lbW9yeSBmb3IgdGVuc29yIGRpbXMuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHNpemUgPSBkaW1zLnJlZHVjZSgoYSwgYikgPT4gYSAqIGIsIDEpO1xuICAgICAgICB0eXBlID0gdGVuc29yRGF0YVR5cGVFbnVtVG9TdHJpbmcoZGF0YVR5cGUpO1xuXG4gICAgICAgIGNvbnN0IHByZWZlcnJlZExvY2F0aW9uID0gaW9CaW5kaW5nU3RhdGU/Lm91dHB1dFByZWZlcnJlZExvY2F0aW9uc1tvdXRwdXRJbmRpY2VzW2ldXTtcblxuICAgICAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycpIHtcbiAgICAgICAgICBpZiAocHJlZmVycmVkTG9jYXRpb24gPT09ICdncHUtYnVmZmVyJyB8fCBwcmVmZXJyZWRMb2NhdGlvbiA9PT0gJ21sLXRlbnNvcicpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignU3RyaW5nIHRlbnNvciBpcyBub3Qgc3VwcG9ydGVkIG9uIEdQVS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3Qgc3RyaW5nRGF0YTogc3RyaW5nW10gPSBbXTtcbiAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHNpemU7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgb2Zmc2V0ID0gd2FzbS5nZXRWYWx1ZShkYXRhT2Zmc2V0ICsgaSAqIHB0clNpemUsICcqJyk7XG4gICAgICAgICAgICBjb25zdCBuZXh0T2Zmc2V0ID0gd2FzbS5nZXRWYWx1ZShkYXRhT2Zmc2V0ICsgKGkgKyAxKSAqIHB0clNpemUsICcqJyk7XG4gICAgICAgICAgICBjb25zdCBtYXhCeXRlc1RvUmVhZCA9IGkgPT09IHNpemUgLSAxID8gdW5kZWZpbmVkIDogbmV4dE9mZnNldCAtIG9mZnNldDtcbiAgICAgICAgICAgIHN0cmluZ0RhdGEucHVzaCh3YXNtLlVURjhUb1N0cmluZyhvZmZzZXQsIG1heEJ5dGVzVG9SZWFkKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIG91dHB1dC5wdXNoKFt0eXBlLCBkaW1zLCBzdHJpbmdEYXRhLCAnY3B1J10pO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIElmIGEgY2VydGFpbiBvdXRwdXQncyBwcmVmZXJyZWQgbG9jYXRpb24gaXMgR1BVIGJ1dCB0aGUgdGVuc29yIGlzIGVtcHR5LCB3ZSBzdGlsbCBuZWVkIHRvIGNyZWF0ZSBhIENQVVxuICAgICAgICAgIC8vIHRlbnNvciBmb3IgaXQuIFRoZXJlIGlzIG5vIG1hcHBpbmcgR1BVIGJ1ZmZlciBmb3IgYW4gZW1wdHkgdGVuc29yLlxuICAgICAgICAgIGlmIChwcmVmZXJyZWRMb2NhdGlvbiA9PT0gJ2dwdS1idWZmZXInICYmIHNpemUgPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBnZXRCdWZmZXIgPSBCVUlMRF9ERUZTLlVTRV9XRUJHUFVfRVAgPyB3YXNtLndlYmdwdUdldEJ1ZmZlciA6IHdhc20uanNlcEdldEJ1ZmZlcjtcbiAgICAgICAgICAgIGlmICghZ2V0QnVmZmVyKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncHJlZmVycmVkTG9jYXRpb24gXCJncHUtYnVmZmVyXCIgaXMgbm90IHN1cHBvcnRlZCB3aXRob3V0IHVzaW5nIFdlYkdQVS4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IGdwdUJ1ZmZlciA9IGdldEJ1ZmZlcihkYXRhT2Zmc2V0KTtcbiAgICAgICAgICAgIGNvbnN0IGJ1ZmZlclNpemUgPSBjYWxjdWxhdGVUZW5zb3JTaXplSW5CeXRlcyhkYXRhVHlwZSwgc2l6ZSk7XG4gICAgICAgICAgICBpZiAoYnVmZmVyU2l6ZSA9PT0gdW5kZWZpbmVkIHx8ICFpc0dwdUJ1ZmZlclN1cHBvcnRlZFR5cGUodHlwZSkpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBkYXRhIHR5cGU6ICR7dHlwZX1gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gZG8gbm90IHJlbGVhc2UgdGhlIHRlbnNvciByaWdodCBub3cuIGl0IHdpbGwgYmUgcmVsZWFzZWQgd2hlbiB1c2VyIGNhbGxzIHRlbnNvci5kaXNwb3NlKCkuXG4gICAgICAgICAgICBrZWVwT3V0cHV0VGVuc29yID0gdHJ1ZTtcblxuICAgICAgICAgICAgaWYgKEJVSUxEX0RFRlMuVVNFX1dFQkdQVV9FUCkge1xuICAgICAgICAgICAgICB3YXNtLndlYmdwdVJlZ2lzdGVyQnVmZmVyIShncHVCdWZmZXIsIHNlc3Npb25JZCwgZGF0YU9mZnNldCk7XG4gICAgICAgICAgICAgIGNvbnN0IGRvd25sb2FkRGF0YUZ1bmN0aW9uID0gd2FzbS53ZWJncHVDcmVhdGVEb3dubG9hZGVyIShncHVCdWZmZXIsIGJ1ZmZlclNpemUsIHNlc3Npb25JZCk7XG4gICAgICAgICAgICAgIG91dHB1dC5wdXNoKFtcbiAgICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgICAgIGRpbXMsXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgZ3B1QnVmZmVyLFxuICAgICAgICAgICAgICAgICAgZG93bmxvYWQ6IGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYXJyYXlCdWZmZXIgPSBhd2FpdCBkb3dubG9hZERhdGFGdW5jdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBkYXRhID0gbmV3ICh0ZW5zb3JUeXBlVG9UeXBlZEFycmF5Q29uc3RydWN0b3IodHlwZSEpKShhcnJheUJ1ZmZlcik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBkYXRhIGFzIFRlbnNvci5EYXRhVHlwZU1hcFtUZW5zb3IuR3B1QnVmZmVyRGF0YVR5cGVzXTtcbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICBkaXNwb3NlOiAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGlmICh3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHRlbnNvcikgIT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgICBjaGVja0xhc3RFcnJvcihcIkNhbid0IHJlbGVhc2UgdGVuc29yLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICdncHUtYnVmZmVyJyxcbiAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBvdXRwdXQucHVzaChbXG4gICAgICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgICAgICBkaW1zLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGdwdUJ1ZmZlcixcbiAgICAgICAgICAgICAgICAgIGRvd25sb2FkOiB3YXNtLmpzZXBDcmVhdGVEb3dubG9hZGVyIShncHVCdWZmZXIsIGJ1ZmZlclNpemUsIHR5cGUpLFxuICAgICAgICAgICAgICAgICAgZGlzcG9zZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAod2FzbS5fT3J0UmVsZWFzZVRlbnNvcih0ZW5zb3IpICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoXCJDYW4ndCByZWxlYXNlIHRlbnNvci5cIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnZ3B1LWJ1ZmZlcicsXG4gICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAocHJlZmVycmVkTG9jYXRpb24gPT09ICdtbC10ZW5zb3InICYmIHNpemUgPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBlbnN1cmVUZW5zb3IgPSB3YXNtLndlYm5uRW5zdXJlVGVuc29yO1xuICAgICAgICAgICAgY29uc3QgaXNHcmFwaElucHV0T3V0cHV0VHlwZVN1cHBvcnRlZCA9IHdhc20ud2Vibm5Jc0dyYXBoSW5wdXRPdXRwdXRUeXBlU3VwcG9ydGVkO1xuICAgICAgICAgICAgaWYgKCFlbnN1cmVUZW5zb3IgfHwgIWlzR3JhcGhJbnB1dE91dHB1dFR5cGVTdXBwb3J0ZWQpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdwcmVmZXJyZWRMb2NhdGlvbiBcIm1sLXRlbnNvclwiIGlzIG5vdCBzdXBwb3J0ZWQgd2l0aG91dCB1c2luZyBXZWJOTi4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHRlbnNvclNpemUgPSBjYWxjdWxhdGVUZW5zb3JTaXplSW5CeXRlcyhkYXRhVHlwZSwgc2l6ZSk7XG4gICAgICAgICAgICBpZiAodGVuc29yU2l6ZSA9PT0gdW5kZWZpbmVkIHx8ICFpc01MVGVuc29yU3VwcG9ydGVkVHlwZSh0eXBlKSkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGRhdGEgdHlwZTogJHt0eXBlfWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKCFpc0dyYXBoSW5wdXRPdXRwdXRUeXBlU3VwcG9ydGVkKHNlc3Npb25JZCwgdHlwZSwgZmFsc2UpKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgICAgICAgICBgcHJlZmVycmVkTG9jYXRpb24gXCJtbC10ZW5zb3JcIiBmb3IgJHt0eXBlfSBvdXRwdXQgaXMgbm90IHN1cHBvcnRlZCBieSBjdXJyZW50IFdlYk5OIENvbnRleHQuYCxcbiAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gSWYgdGhlIGdyYXBoIGhhcyBiZWVuIHBhcnRpdGlvbmVkLCB0aGUgb3V0cHV0IHRlbnNvciBtYXkgaGF2ZSBub3QgYmVlbiBjcmVhdGVkLiBGb3IgdGhpcyByZWFzb24sIHdlIHVzZVxuICAgICAgICAgICAgLy8gZW5zdXJlVGVuc29yIHRvIGdldC9jcmVhdGUgdGhlIE1MVGVuc29yLiBJbiB3aGljaCBjYXNlLCB3ZSBkb24ndCBuZWVkIHRvIGNvcHkgdGhlIGRhdGEgaWYgYSBuZXcgdGVuc29yXG4gICAgICAgICAgICAvLyBoYXMgYmVlbiBjcmVhdGVkLlxuICAgICAgICAgICAgY29uc3QgbWxUZW5zb3IgPSBhd2FpdCBlbnN1cmVUZW5zb3Ioc2Vzc2lvbklkLCBkYXRhT2Zmc2V0LCBkYXRhVHlwZSwgZGltcywgZmFsc2UpO1xuXG4gICAgICAgICAgICAvLyBkbyBub3QgcmVsZWFzZSB0aGUgdGVuc29yIHJpZ2h0IG5vdy4gaXQgd2lsbCBiZSByZWxlYXNlZCB3aGVuIHVzZXIgY2FsbHMgdGVuc29yLmRpc3Bvc2UoKS5cbiAgICAgICAgICAgIGtlZXBPdXRwdXRUZW5zb3IgPSB0cnVlO1xuXG4gICAgICAgICAgICBvdXRwdXQucHVzaChbXG4gICAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICAgIGRpbXMsXG4gICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBtbFRlbnNvcixcbiAgICAgICAgICAgICAgICBkb3dubG9hZDogd2FzbS53ZWJubkNyZWF0ZU1MVGVuc29yRG93bmxvYWRlciEoZGF0YU9mZnNldCwgdHlwZSksXG4gICAgICAgICAgICAgICAgZGlzcG9zZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgd2FzbS53ZWJublJlbGVhc2VUZW5zb3JJZCEoZGF0YU9mZnNldCk7XG4gICAgICAgICAgICAgICAgICB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHRlbnNvcik7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgJ21sLXRlbnNvcicsXG4gICAgICAgICAgICBdKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKHByZWZlcnJlZExvY2F0aW9uID09PSAnbWwtdGVuc29yLWNwdS1vdXRwdXQnICYmIHNpemUgPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gd2FzbS53ZWJubkNyZWF0ZU1MVGVuc29yRG93bmxvYWRlciEoZGF0YU9mZnNldCwgdHlwZSBhcyBUZW5zb3IuTUxUZW5zb3JEYXRhVHlwZXMpKCk7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IG91dHB1dC5sZW5ndGg7XG4gICAgICAgICAgICAvLyBEZWxheSB0aGUgZGF0YSBkb3dubG9hZCBhbmQgcmVsZWFzaW5nIHRoZSB0ZW5zb3IgdW50aWwgd2UgY2FuIHdhaXQgZm9yIGFsbCBvdXRwdXQgdGVuc29ycyB0byBiZSBkb3dubG9hZGVkLlxuICAgICAgICAgICAga2VlcE91dHB1dFRlbnNvciA9IHRydWU7XG4gICAgICAgICAgICBvdXRwdXRQcm9taXNlcy5wdXNoKFxuICAgICAgICAgICAgICAoYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlc3VsdDogW251bWJlciwgVGVuc29yLkRhdGFUeXBlXSA9IFtpbmRleCwgYXdhaXQgZGF0YV07XG4gICAgICAgICAgICAgICAgd2FzbS53ZWJublJlbGVhc2VUZW5zb3JJZCEoZGF0YU9mZnNldCk7XG4gICAgICAgICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVRlbnNvcih0ZW5zb3IpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgICAgICAgICAgIH0pKCksXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goW3R5cGUsIGRpbXMsIFtdLCAnY3B1J10pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjb25zdCB0eXBlZEFycmF5Q29uc3RydWN0b3IgPSB0ZW5zb3JUeXBlVG9UeXBlZEFycmF5Q29uc3RydWN0b3IodHlwZSk7XG4gICAgICAgICAgICBjb25zdCBkYXRhID0gbmV3IHR5cGVkQXJyYXlDb25zdHJ1Y3RvcihzaXplKTtcbiAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KGRhdGEuYnVmZmVyLCBkYXRhLmJ5dGVPZmZzZXQsIGRhdGEuYnl0ZUxlbmd0aCkuc2V0KFxuICAgICAgICAgICAgICB3YXNtLkhFQVBVOC5zdWJhcnJheShkYXRhT2Zmc2V0LCBkYXRhT2Zmc2V0ICsgZGF0YS5ieXRlTGVuZ3RoKSxcbiAgICAgICAgICAgICk7XG4gICAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgZGF0YSwgJ2NwdSddKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZmluYWxseSB7XG4gICAgICAgIHdhc20uc3RhY2tSZXN0b3JlKGJlZm9yZUdldFRlbnNvckRhdGFTdGFjayk7XG4gICAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJyAmJiBkYXRhT2Zmc2V0KSB7XG4gICAgICAgICAgd2FzbS5fZnJlZShkYXRhT2Zmc2V0KTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoIWtlZXBPdXRwdXRUZW5zb3IpIHtcbiAgICAgICAgICB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHRlbnNvcik7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoaW9CaW5kaW5nU3RhdGUgJiYgIWVuYWJsZUdyYXBoQ2FwdHVyZSkge1xuICAgICAgaWYgKHdhc20uX09ydENsZWFyQm91bmRPdXRwdXRzKGlvQmluZGluZ1N0YXRlLmhhbmRsZSkgIT09IDApIHtcbiAgICAgICAgY2hlY2tMYXN0RXJyb3IoXCJDYW4ndCBjbGVhciBib3VuZCBvdXRwdXRzLlwiKTtcbiAgICAgIH1cbiAgICAgIGFjdGl2ZVNlc3Npb25zLnNldChzZXNzaW9uSWQsIFtcbiAgICAgICAgc2Vzc2lvbkhhbmRsZSxcbiAgICAgICAgaW5wdXROYW1lc1VURjhFbmNvZGVkLFxuICAgICAgICBvdXRwdXROYW1lc1VURjhFbmNvZGVkLFxuICAgICAgICBpb0JpbmRpbmdTdGF0ZSxcbiAgICAgICAgZW5hYmxlR3JhcGhDYXB0dXJlLFxuICAgICAgICBmYWxzZSxcbiAgICAgIF0pO1xuICAgIH1cbiAgICAvLyBXYWl0IGZvciBhbGwgb3V0cHV0IHRlbnNvciBkYXRhIHRvIGJlIGRvd25sb2FkZWQuXG4gICAgZm9yIChjb25zdCBbaW5kZXgsIGRhdGFdIG9mIGF3YWl0IFByb21pc2UuYWxsKG91dHB1dFByb21pc2VzKSkge1xuICAgICAgb3V0cHV0W2luZGV4XVsyXSA9IGRhdGE7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS53ZWJubk9uUnVuRW5kPy4oc2Vzc2lvbkhhbmRsZSk7XG5cbiAgICB3YXNtLnN0YWNrUmVzdG9yZShiZWZvcmVSdW5TdGFjayk7XG5cbiAgICBpZiAoQlVJTERfREVGUy5VU0VfV0VCR1BVX0VQKSB7XG4gICAgICBpbnB1dFRlbnNvcnMuZm9yRWFjaCgodCkgPT4ge1xuICAgICAgICBpZiAodCAmJiB0WzNdID09PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICAgICAgICB3YXNtLndlYmdwdVVucmVnaXN0ZXJCdWZmZXIhKHRbMl0uZ3B1QnVmZmVyKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICBvdXRwdXRUZW5zb3JzLmZvckVhY2goKHQpID0+IHtcbiAgICAgICAgaWYgKHQgJiYgdFszXSA9PT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgd2FzbS53ZWJncHVVbnJlZ2lzdGVyQnVmZmVyISh0WzJdLmdwdUJ1ZmZlcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICBpbnB1dFRlbnNvckhhbmRsZXMuZm9yRWFjaCgodikgPT4gd2FzbS5fT3J0UmVsZWFzZVRlbnNvcih2KSk7XG4gICAgb3V0cHV0VGVuc29ySGFuZGxlcy5mb3JFYWNoKCh2KSA9PiB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHYpKTtcbiAgICBpbnB1dE91dHB1dEFsbG9jcy5mb3JFYWNoKChwKSA9PiB3YXNtLl9mcmVlKHApKTtcblxuICAgIGlmIChydW5PcHRpb25zSGFuZGxlICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRSZWxlYXNlUnVuT3B0aW9ucyhydW5PcHRpb25zSGFuZGxlKTtcbiAgICB9XG4gICAgcnVuT3B0aW9uc0FsbG9jcy5mb3JFYWNoKChwKSA9PiB3YXNtLl9mcmVlKHApKTtcbiAgfVxufTtcblxuLyoqXG4gKiBlbmQgcHJvZmlsaW5nXG4gKi9cbmV4cG9ydCBjb25zdCBlbmRQcm9maWxpbmcgPSAoc2Vzc2lvbklkOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IHNlc3Npb24gPSBhY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcbiAgaWYgKCFzZXNzaW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdpbnZhbGlkIHNlc3Npb24gaWQnKTtcbiAgfVxuICBjb25zdCBzZXNzaW9uSGFuZGxlID0gc2Vzc2lvblswXTtcblxuICAvLyBwcm9maWxlIGZpbGUgbmFtZSBpcyBub3QgdXNlZCB5ZXQsIGJ1dCBpdCBtdXN0IGJlIGZyZWVkLlxuICBjb25zdCBwcm9maWxlRmlsZU5hbWUgPSB3YXNtLl9PcnRFbmRQcm9maWxpbmcoc2Vzc2lvbkhhbmRsZSk7XG4gIGlmIChwcm9maWxlRmlsZU5hbWUgPT09IDApIHtcbiAgICBjaGVja0xhc3RFcnJvcihcIkNhbid0IGdldCBhbiBwcm9maWxlIGZpbGUgbmFtZS5cIik7XG4gIH1cbiAgd2FzbS5fT3J0RnJlZShwcm9maWxlRmlsZU5hbWUpO1xufTtcblxuZXhwb3J0IGNvbnN0IGV4dHJhY3RUcmFuc2ZlcmFibGVCdWZmZXJzID0gKHRlbnNvcnM6IHJlYWRvbmx5IFNlcmlhbGl6YWJsZVRlbnNvck1ldGFkYXRhW10pOiBBcnJheUJ1ZmZlckxpa2VbXSA9PiB7XG4gIGNvbnN0IGJ1ZmZlcnM6IEFycmF5QnVmZmVyTGlrZVtdID0gW107XG4gIGZvciAoY29uc3QgdGVuc29yIG9mIHRlbnNvcnMpIHtcbiAgICBjb25zdCBkYXRhID0gdGVuc29yWzJdO1xuICAgIGlmICghQXJyYXkuaXNBcnJheShkYXRhKSAmJiAnYnVmZmVyJyBpbiBkYXRhKSB7XG4gICAgICBidWZmZXJzLnB1c2goZGF0YS5idWZmZXIpO1xuICAgIH1cbiAgfVxuICByZXR1cm4gYnVmZmVycztcbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7IGVudiwgSW5mZXJlbmNlU2Vzc2lvbiB9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7XG4gIE9ydFdhc21NZXNzYWdlLFxuICBTZXJpYWxpemFibGVJbnRlcm5hbEJ1ZmZlcixcbiAgU2VyaWFsaXphYmxlU2Vzc2lvbk1ldGFkYXRhLFxuICBTZXJpYWxpemFibGVUZW5zb3JNZXRhZGF0YSxcbiAgVGVuc29yTWV0YWRhdGEsXG59IGZyb20gJy4vcHJveHktbWVzc2FnZXMnO1xuaW1wb3J0ICogYXMgY29yZSBmcm9tICcuL3dhc20tY29yZS1pbXBsJztcbmltcG9ydCB7IGluaXRpYWxpemVXZWJBc3NlbWJseSB9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcbmltcG9ydCB7XG4gIGltcG9ydFByb3h5V29ya2VyLFxuICBpbmZlcldhc21QYXRoUHJlZml4RnJvbVNjcmlwdFNyYyxcbiAgaXNFc21JbXBvcnRNZXRhVXJsSGFyZGNvZGVkQXNGaWxlVXJpLFxufSBmcm9tICcuL3dhc20tdXRpbHMtaW1wb3J0JztcblxuY29uc3QgaXNQcm94eSA9ICgpOiBib29sZWFuID0+ICEhZW52Lndhc20ucHJveHkgJiYgdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJztcbmxldCBwcm94eVdvcmtlcjogV29ya2VyIHwgdW5kZWZpbmVkO1xubGV0IGluaXRpYWxpemluZyA9IGZhbHNlO1xubGV0IGluaXRpYWxpemVkID0gZmFsc2U7XG5sZXQgYWJvcnRlZCA9IGZhbHNlO1xubGV0IHRlbXBvcmFyeU9iamVjdFVybDogc3RyaW5nIHwgdW5kZWZpbmVkO1xuXG50eXBlIFByb21pc2VDYWxsYmFja3M8VCA9IHZvaWQ+ID0gW3Jlc29sdmU6IChyZXN1bHQ6IFQpID0+IHZvaWQsIHJlamVjdDogKHJlYXNvbjogdW5rbm93bikgPT4gdm9pZF07XG5sZXQgaW5pdFdhc21DYWxsYmFja3M6IFByb21pc2VDYWxsYmFja3M7XG5jb25zdCBxdWV1ZWRDYWxsYmFja3M6IE1hcDxPcnRXYXNtTWVzc2FnZVsndHlwZSddLCBBcnJheTxQcm9taXNlQ2FsbGJhY2tzPHVua25vd24+Pj4gPSBuZXcgTWFwKCk7XG5cbmNvbnN0IGVucXVldWVDYWxsYmFja3MgPSAodHlwZTogT3J0V2FzbU1lc3NhZ2VbJ3R5cGUnXSwgY2FsbGJhY2tzOiBQcm9taXNlQ2FsbGJhY2tzPHVua25vd24+KTogdm9pZCA9PiB7XG4gIGNvbnN0IHF1ZXVlID0gcXVldWVkQ2FsbGJhY2tzLmdldCh0eXBlKTtcbiAgaWYgKHF1ZXVlKSB7XG4gICAgcXVldWUucHVzaChjYWxsYmFja3MpO1xuICB9IGVsc2Uge1xuICAgIHF1ZXVlZENhbGxiYWNrcy5zZXQodHlwZSwgW2NhbGxiYWNrc10pO1xuICB9XG59O1xuXG5jb25zdCBlbnN1cmVXb3JrZXIgPSAoKTogdm9pZCA9PiB7XG4gIGlmIChpbml0aWFsaXppbmcgfHwgIWluaXRpYWxpemVkIHx8IGFib3J0ZWQgfHwgIXByb3h5V29ya2VyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCd3b3JrZXIgbm90IHJlYWR5Jyk7XG4gIH1cbn07XG5cbmNvbnN0IG9uUHJveHlXb3JrZXJNZXNzYWdlID0gKGV2OiBNZXNzYWdlRXZlbnQ8T3J0V2FzbU1lc3NhZ2U+KTogdm9pZCA9PiB7XG4gIHN3aXRjaCAoZXYuZGF0YS50eXBlKSB7XG4gICAgY2FzZSAnaW5pdC13YXNtJzpcbiAgICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgICAgaWYgKGV2LmRhdGEuZXJyKSB7XG4gICAgICAgIGFib3J0ZWQgPSB0cnVlO1xuICAgICAgICBpbml0V2FzbUNhbGxiYWNrc1sxXShldi5kYXRhLmVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpbml0aWFsaXplZCA9IHRydWU7XG4gICAgICAgIGluaXRXYXNtQ2FsbGJhY2tzWzBdKCk7XG4gICAgICB9XG4gICAgICBpZiAodGVtcG9yYXJ5T2JqZWN0VXJsKSB7XG4gICAgICAgIFVSTC5yZXZva2VPYmplY3RVUkwodGVtcG9yYXJ5T2JqZWN0VXJsKTtcbiAgICAgICAgdGVtcG9yYXJ5T2JqZWN0VXJsID0gdW5kZWZpbmVkO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgY2FzZSAnaW5pdC1lcCc6XG4gICAgY2FzZSAnY29weS1mcm9tJzpcbiAgICBjYXNlICdjcmVhdGUnOlxuICAgIGNhc2UgJ3JlbGVhc2UnOlxuICAgIGNhc2UgJ3J1bic6XG4gICAgY2FzZSAnZW5kLXByb2ZpbGluZyc6IHtcbiAgICAgIGNvbnN0IGNhbGxiYWNrcyA9IHF1ZXVlZENhbGxiYWNrcy5nZXQoZXYuZGF0YS50eXBlKSE7XG4gICAgICBpZiAoZXYuZGF0YS5lcnIpIHtcbiAgICAgICAgY2FsbGJhY2tzLnNoaWZ0KCkhWzFdKGV2LmRhdGEuZXJyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNhbGxiYWNrcy5zaGlmdCgpIVswXShldi5kYXRhLm91dCEpO1xuICAgICAgfVxuICAgICAgYnJlYWs7XG4gICAgfVxuICAgIGRlZmF1bHQ6XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBpbml0aWFsaXplV2ViQXNzZW1ibHlBbmRPcnRSdW50aW1lID0gYXN5bmMgKCk6IFByb21pc2U8dm9pZD4gPT4ge1xuICBpZiAoaW5pdGlhbGl6ZWQpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaWYgKGluaXRpYWxpemluZykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIm11bHRpcGxlIGNhbGxzIHRvICdpbml0V2FzbSgpJyBkZXRlY3RlZC5cIik7XG4gIH1cbiAgaWYgKGFib3J0ZWQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJwcmV2aW91cyBjYWxsIHRvICdpbml0V2FzbSgpJyBmYWlsZWQuXCIpO1xuICB9XG5cbiAgaW5pdGlhbGl6aW5nID0gdHJ1ZTtcblxuICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XQVNNX1BST1hZICYmIGlzUHJveHkoKSkge1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBwcm94eVdvcmtlcj8udGVybWluYXRlKCk7XG5cbiAgICAgIHZvaWQgaW1wb3J0UHJveHlXb3JrZXIoKS50aGVuKChbb2JqZWN0VXJsLCB3b3JrZXJdKSA9PiB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgcHJveHlXb3JrZXIgPSB3b3JrZXI7XG4gICAgICAgICAgcHJveHlXb3JrZXIub25lcnJvciA9IChldjogRXJyb3JFdmVudCkgPT4gcmVqZWN0KGV2KTtcbiAgICAgICAgICBwcm94eVdvcmtlci5vbm1lc3NhZ2UgPSBvblByb3h5V29ya2VyTWVzc2FnZTtcbiAgICAgICAgICBpbml0V2FzbUNhbGxiYWNrcyA9IFtyZXNvbHZlLCByZWplY3RdO1xuICAgICAgICAgIGNvbnN0IG1lc3NhZ2U6IE9ydFdhc21NZXNzYWdlID0geyB0eXBlOiAnaW5pdC13YXNtJywgaW46IGVudiB9O1xuXG4gICAgICAgICAgLy8gaWYgdGhlIHByb3h5IHdvcmtlciBpcyBsb2FkZWQgZnJvbSBhIGJsb2IgVVJMLCB3ZSBuZWVkIHRvIG1ha2Ugc3VyZSB0aGUgcGF0aCBpbmZvcm1hdGlvbiBpcyBub3QgbG9zdC5cbiAgICAgICAgICAvL1xuICAgICAgICAgIC8vIHdoZW4gYGVudi53YXNtLndhc21QYXRoc2AgaXMgbm90IHNldCwgd2UgbmVlZCB0byBwYXNzIHRoZSBwYXRoIGluZm9ybWF0aW9uIHRvIHRoZSB3b3JrZXIuXG4gICAgICAgICAgLy9cbiAgICAgICAgICBpZiAoIUJVSUxEX0RFRlMuRU5BQkxFX0JVTkRMRV9XQVNNX0pTICYmICFtZXNzYWdlLmluIS53YXNtLndhc21QYXRocyAmJiBvYmplY3RVcmwpIHtcbiAgICAgICAgICAgIC8vIGZvciBhIGJ1aWxkIG5vdCBidW5kbGVkIHRoZSB3YXNtIEpTLCB3ZSBuZWVkIHRvIHBhc3MgdGhlIHBhdGggcHJlZml4IHRvIHRoZSB3b3JrZXIuXG4gICAgICAgICAgICAvLyB0aGUgcGF0aCBwcmVmaXggd2lsbCBiZSB1c2VkIHRvIHJlc29sdmUgdGhlIHBhdGggdG8gYm90aCB0aGUgd2FzbSBKUyBhbmQgdGhlIHdhc20gZmlsZS5cbiAgICAgICAgICAgIGNvbnN0IGluZmVycmVkV2FzbVBhdGhQcmVmaXggPSBpbmZlcldhc21QYXRoUHJlZml4RnJvbVNjcmlwdFNyYygpO1xuICAgICAgICAgICAgaWYgKGluZmVycmVkV2FzbVBhdGhQcmVmaXgpIHtcbiAgICAgICAgICAgICAgbWVzc2FnZS5pbiEud2FzbS53YXNtUGF0aHMgPSBpbmZlcnJlZFdhc21QYXRoUHJlZml4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cblxuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIEJVSUxEX0RFRlMuSVNfRVNNICYmXG4gICAgICAgICAgICBCVUlMRF9ERUZTLkVOQUJMRV9CVU5ETEVfV0FTTV9KUyAmJlxuICAgICAgICAgICAgIW1lc3NhZ2UuaW4hLndhc20ud2FzbVBhdGhzICYmXG4gICAgICAgICAgICAob2JqZWN0VXJsIHx8IGlzRXNtSW1wb3J0TWV0YVVybEhhcmRjb2RlZEFzRmlsZVVyaSlcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIC8vIGZvciBhIGJ1aWxkIGJ1bmRsZWQgdGhlIHdhc20gSlMsIGlmIGVpdGhlciBvZiB0aGUgZm9sbG93aW5nIGNvbmRpdGlvbnMgaXMgbWV0OlxuICAgICAgICAgICAgLy8gLSB0aGUgcHJveHkgd29ya2VyIGlzIGxvYWRlZCBmcm9tIGEgYmxvYiBVUkxcbiAgICAgICAgICAgIC8vIC0gYGltcG9ydC5tZXRhLnVybGAgaXMgYSBmaWxlIFVSTCwgaXQgbWVhbnMgaXQgaXMgb3ZlcndyaXRlbiBieSB0aGUgYnVuZGxlci5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBpbiBlaXRoZXIgY2FzZSwgdGhlIHBhdGggaW5mb3JtYXRpb24gaXMgbG9zdCwgd2UgbmVlZCB0byBwYXNzIHRoZSBwYXRoIG9mIHRoZSAud2FzbSBmaWxlIHRvIHRoZSB3b3JrZXIuXG4gICAgICAgICAgICAvLyB3ZSBuZWVkIHRvIHVzZSB0aGUgYnVuZGxlciBwcmVmZXJyZWQgVVJMIGZvcm1hdDpcbiAgICAgICAgICAgIC8vIG5ldyBVUkwoJ2ZpbGVuYW1lJywgaW1wb3J0Lm1ldGEudXJsKVxuICAgICAgICAgICAgLy8gc28gdGhhdCB0aGUgYnVuZGxlciBjYW4gaGFuZGxlIHRoZSBmaWxlIHVzaW5nIGNvcnJlc3BvbmRpbmcgbG9hZGVycy5cbiAgICAgICAgICAgIG1lc3NhZ2UuaW4hLndhc20ud2FzbVBhdGhzID0ge1xuICAgICAgICAgICAgICB3YXNtOiAhQlVJTERfREVGUy5ESVNBQkxFX0pTRVBcbiAgICAgICAgICAgICAgICA/IG5ldyBVUkwoJ29ydC13YXNtLXNpbWQtdGhyZWFkZWQuanNlcC53YXNtJywgQlVJTERfREVGUy5FU01fSU1QT1JUX01FVEFfVVJMKS5ocmVmXG4gICAgICAgICAgICAgICAgOiBuZXcgVVJMKCdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLndhc20nLCBCVUlMRF9ERUZTLkVTTV9JTVBPUlRfTUVUQV9VUkwpLmhyZWYsXG4gICAgICAgICAgICB9O1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcm94eVdvcmtlci5wb3N0TWVzc2FnZShtZXNzYWdlKTtcbiAgICAgICAgICB0ZW1wb3JhcnlPYmplY3RVcmwgPSBvYmplY3RVcmw7XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICByZWplY3QoZSk7XG4gICAgICAgIH1cbiAgICAgIH0sIHJlamVjdCk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgdHJ5IHtcbiAgICAgIGF3YWl0IGluaXRpYWxpemVXZWJBc3NlbWJseShlbnYud2FzbSk7XG4gICAgICBhd2FpdCBjb3JlLmluaXRSdW50aW1lKGVudik7XG4gICAgICBpbml0aWFsaXplZCA9IHRydWU7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgYWJvcnRlZCA9IHRydWU7XG4gICAgICB0aHJvdyBlO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBpbml0aWFsaXplT3J0RXAgPSBhc3luYyAoZXBOYW1lOiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9QUk9YWSAmJiBpc1Byb3h5KCkpIHtcbiAgICBlbnN1cmVXb3JrZXIoKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZW5xdWV1ZUNhbGxiYWNrcygnaW5pdC1lcCcsIFtyZXNvbHZlLCByZWplY3RdKTtcbiAgICAgIGNvbnN0IG1lc3NhZ2U6IE9ydFdhc21NZXNzYWdlID0geyB0eXBlOiAnaW5pdC1lcCcsIGluOiB7IGVwTmFtZSwgZW52IH0gfTtcbiAgICAgIHByb3h5V29ya2VyIS5wb3N0TWVzc2FnZShtZXNzYWdlKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBhd2FpdCBjb3JlLmluaXRFcChlbnYsIGVwTmFtZSk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBjb3B5RnJvbUV4dGVybmFsQnVmZmVyID0gYXN5bmMgKGJ1ZmZlcjogVWludDhBcnJheSk6IFByb21pc2U8U2VyaWFsaXphYmxlSW50ZXJuYWxCdWZmZXI+ID0+IHtcbiAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9QUk9YWSAmJiBpc1Byb3h5KCkpIHtcbiAgICBlbnN1cmVXb3JrZXIoKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8U2VyaWFsaXphYmxlSW50ZXJuYWxCdWZmZXI+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGVucXVldWVDYWxsYmFja3MoJ2NvcHktZnJvbScsIFtyZXNvbHZlLCByZWplY3RdKTtcbiAgICAgIGNvbnN0IG1lc3NhZ2U6IE9ydFdhc21NZXNzYWdlID0geyB0eXBlOiAnY29weS1mcm9tJywgaW46IHsgYnVmZmVyIH0gfTtcbiAgICAgIHByb3h5V29ya2VyIS5wb3N0TWVzc2FnZShtZXNzYWdlLCBbYnVmZmVyLmJ1ZmZlcl0pO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjb3JlLmNvcHlGcm9tRXh0ZXJuYWxCdWZmZXIoYnVmZmVyKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGNyZWF0ZVNlc3Npb24gPSBhc3luYyAoXG4gIG1vZGVsOiBTZXJpYWxpemFibGVJbnRlcm5hbEJ1ZmZlciB8IFVpbnQ4QXJyYXksXG4gIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zLFxuKTogUHJvbWlzZTxTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGE+ID0+IHtcbiAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9QUk9YWSAmJiBpc1Byb3h5KCkpIHtcbiAgICAvLyBjaGVjayB1bnN1cHBvcnRlZCBvcHRpb25zXG4gICAgaWYgKG9wdGlvbnM/LnByZWZlcnJlZE91dHB1dExvY2F0aW9uKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3Nlc3Npb24gb3B0aW9uIFwicHJlZmVycmVkT3V0cHV0TG9jYXRpb25cIiBpcyBub3Qgc3VwcG9ydGVkIGZvciBwcm94eS4nKTtcbiAgICB9XG4gICAgZW5zdXJlV29ya2VyKCk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZW5xdWV1ZUNhbGxiYWNrcygnY3JlYXRlJywgW3Jlc29sdmUsIHJlamVjdF0pO1xuICAgICAgY29uc3QgbWVzc2FnZTogT3J0V2FzbU1lc3NhZ2UgPSB7IHR5cGU6ICdjcmVhdGUnLCBpbjogeyBtb2RlbCwgb3B0aW9uczogeyAuLi5vcHRpb25zIH0gfSB9O1xuICAgICAgY29uc3QgdHJhbnNmZXJhYmxlOiBUcmFuc2ZlcmFibGVbXSA9IFtdO1xuICAgICAgaWYgKG1vZGVsIGluc3RhbmNlb2YgVWludDhBcnJheSkge1xuICAgICAgICB0cmFuc2ZlcmFibGUucHVzaChtb2RlbC5idWZmZXIpO1xuICAgICAgfVxuICAgICAgcHJveHlXb3JrZXIhLnBvc3RNZXNzYWdlKG1lc3NhZ2UsIHRyYW5zZmVyYWJsZSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGNvcmUuY3JlYXRlU2Vzc2lvbihtb2RlbCwgb3B0aW9ucyk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCByZWxlYXNlU2Vzc2lvbiA9IGFzeW5jIChzZXNzaW9uSWQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4gPT4ge1xuICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XQVNNX1BST1hZICYmIGlzUHJveHkoKSkge1xuICAgIGVuc3VyZVdvcmtlcigpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBlbnF1ZXVlQ2FsbGJhY2tzKCdyZWxlYXNlJywgW3Jlc29sdmUsIHJlamVjdF0pO1xuICAgICAgY29uc3QgbWVzc2FnZTogT3J0V2FzbU1lc3NhZ2UgPSB7IHR5cGU6ICdyZWxlYXNlJywgaW46IHNlc3Npb25JZCB9O1xuICAgICAgcHJveHlXb3JrZXIhLnBvc3RNZXNzYWdlKG1lc3NhZ2UpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIGNvcmUucmVsZWFzZVNlc3Npb24oc2Vzc2lvbklkKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHJ1biA9IGFzeW5jIChcbiAgc2Vzc2lvbklkOiBudW1iZXIsXG4gIGlucHV0SW5kaWNlczogbnVtYmVyW10sXG4gIGlucHV0czogVGVuc29yTWV0YWRhdGFbXSxcbiAgb3V0cHV0SW5kaWNlczogbnVtYmVyW10sXG4gIG91dHB1dHM6IEFycmF5PFRlbnNvck1ldGFkYXRhIHwgbnVsbD4sXG4gIG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyxcbik6IFByb21pc2U8VGVuc29yTWV0YWRhdGFbXT4gPT4ge1xuICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XQVNNX1BST1hZICYmIGlzUHJveHkoKSkge1xuICAgIC8vIGNoZWNrIGlucHV0cyBsb2NhdGlvblxuICAgIGlmIChpbnB1dHMuc29tZSgodCkgPT4gdFszXSAhPT0gJ2NwdScpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ2lucHV0IHRlbnNvciBvbiBHUFUgaXMgbm90IHN1cHBvcnRlZCBmb3IgcHJveHkuJyk7XG4gICAgfVxuICAgIC8vIGNoZWNrIG91dHB1dHMgbG9jYXRpb25cbiAgICBpZiAob3V0cHV0cy5zb21lKCh0KSA9PiB0KSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdwcmUtYWxsb2NhdGVkIG91dHB1dCB0ZW5zb3IgaXMgbm90IHN1cHBvcnRlZCBmb3IgcHJveHkuJyk7XG4gICAgfVxuICAgIGVuc3VyZVdvcmtlcigpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxTZXJpYWxpemFibGVUZW5zb3JNZXRhZGF0YVtdPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBlbnF1ZXVlQ2FsbGJhY2tzKCdydW4nLCBbcmVzb2x2ZSwgcmVqZWN0XSk7XG4gICAgICBjb25zdCBzZXJpYWxpemFibGVJbnB1dHMgPSBpbnB1dHMgYXMgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGFbXTsgLy8gZXZlcnkgaW5wdXQgaXMgb24gQ1BVLlxuICAgICAgY29uc3QgbWVzc2FnZTogT3J0V2FzbU1lc3NhZ2UgPSB7XG4gICAgICAgIHR5cGU6ICdydW4nLFxuICAgICAgICBpbjogeyBzZXNzaW9uSWQsIGlucHV0SW5kaWNlcywgaW5wdXRzOiBzZXJpYWxpemFibGVJbnB1dHMsIG91dHB1dEluZGljZXMsIG9wdGlvbnMgfSxcbiAgICAgIH07XG4gICAgICBwcm94eVdvcmtlciEucG9zdE1lc3NhZ2UobWVzc2FnZSwgY29yZS5leHRyYWN0VHJhbnNmZXJhYmxlQnVmZmVycyhzZXJpYWxpemFibGVJbnB1dHMpKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY29yZS5ydW4oc2Vzc2lvbklkLCBpbnB1dEluZGljZXMsIGlucHV0cywgb3V0cHV0SW5kaWNlcywgb3V0cHV0cywgb3B0aW9ucyk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBlbmRQcm9maWxpbmcgPSBhc3luYyAoc2Vzc2lvbklkOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9QUk9YWSAmJiBpc1Byb3h5KCkpIHtcbiAgICBlbnN1cmVXb3JrZXIoKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZW5xdWV1ZUNhbGxiYWNrcygnZW5kLXByb2ZpbGluZycsIFtyZXNvbHZlLCByZWplY3RdKTtcbiAgICAgIGNvbnN0IG1lc3NhZ2U6IE9ydFdhc21NZXNzYWdlID0geyB0eXBlOiAnZW5kLXByb2ZpbGluZycsIGluOiBzZXNzaW9uSWQgfTtcbiAgICAgIHByb3h5V29ya2VyIS5wb3N0TWVzc2FnZShtZXNzYWdlKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBjb3JlLmVuZFByb2ZpbGluZyhzZXNzaW9uSWQpO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQge1xuICBJbmZlcmVuY2VTZXNzaW9uLFxuICBJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcixcbiAgU2Vzc2lvbkhhbmRsZXIsXG4gIFRlbnNvcixcbiAgVFJBQ0VfRlVOQ19CRUdJTixcbiAgVFJBQ0VfRlVOQ19FTkQsXG59IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7IFNlcmlhbGl6YWJsZUludGVybmFsQnVmZmVyLCBUZW5zb3JNZXRhZGF0YSB9IGZyb20gJy4vcHJveHktbWVzc2FnZXMnO1xuaW1wb3J0IHsgY29weUZyb21FeHRlcm5hbEJ1ZmZlciwgY3JlYXRlU2Vzc2lvbiwgZW5kUHJvZmlsaW5nLCByZWxlYXNlU2Vzc2lvbiwgcnVuIH0gZnJvbSAnLi9wcm94eS13cmFwcGVyJztcbmltcG9ydCB7IGlzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZSwgaXNNTFRlbnNvclN1cHBvcnRlZFR5cGUgfSBmcm9tICcuL3dhc20tY29tbW9uJztcbmltcG9ydCB7IGlzTm9kZSB9IGZyb20gJy4vd2FzbS11dGlscy1lbnYnO1xuaW1wb3J0IHsgbG9hZEZpbGUgfSBmcm9tICcuL3dhc20tdXRpbHMtbG9hZC1maWxlJztcblxuZXhwb3J0IGNvbnN0IGVuY29kZVRlbnNvck1ldGFkYXRhID0gKHRlbnNvcjogVGVuc29yLCBnZXROYW1lOiAoKSA9PiBzdHJpbmcpOiBUZW5zb3JNZXRhZGF0YSA9PiB7XG4gIHN3aXRjaCAodGVuc29yLmxvY2F0aW9uKSB7XG4gICAgY2FzZSAnY3B1JzpcbiAgICAgIHJldHVybiBbdGVuc29yLnR5cGUsIHRlbnNvci5kaW1zLCB0ZW5zb3IuZGF0YSwgJ2NwdSddO1xuICAgIGNhc2UgJ2dwdS1idWZmZXInOlxuICAgICAgcmV0dXJuIFt0ZW5zb3IudHlwZSwgdGVuc29yLmRpbXMsIHsgZ3B1QnVmZmVyOiB0ZW5zb3IuZ3B1QnVmZmVyIH0sICdncHUtYnVmZmVyJ107XG4gICAgY2FzZSAnbWwtdGVuc29yJzpcbiAgICAgIHJldHVybiBbdGVuc29yLnR5cGUsIHRlbnNvci5kaW1zLCB7IG1sVGVuc29yOiB0ZW5zb3IubWxUZW5zb3IgfSwgJ21sLXRlbnNvciddO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgZGF0YSBsb2NhdGlvbjogJHt0ZW5zb3IubG9jYXRpb259IGZvciAke2dldE5hbWUoKX1gKTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGRlY29kZVRlbnNvck1ldGFkYXRhID0gKHRlbnNvcjogVGVuc29yTWV0YWRhdGEpOiBUZW5zb3IgPT4ge1xuICBzd2l0Y2ggKHRlbnNvclszXSkge1xuICAgIGNhc2UgJ2NwdSc6XG4gICAgICByZXR1cm4gbmV3IFRlbnNvcih0ZW5zb3JbMF0sIHRlbnNvclsyXSwgdGVuc29yWzFdKTtcbiAgICBjYXNlICdncHUtYnVmZmVyJzoge1xuICAgICAgY29uc3QgZGF0YVR5cGUgPSB0ZW5zb3JbMF07XG4gICAgICBpZiAoIWlzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZShkYXRhVHlwZSkpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBub3Qgc3VwcG9ydGVkIGRhdGEgdHlwZTogJHtkYXRhVHlwZX0gZm9yIGRlc2VyaWFsaXppbmcgR1BVIHRlbnNvcmApO1xuICAgICAgfVxuICAgICAgY29uc3QgeyBncHVCdWZmZXIsIGRvd25sb2FkLCBkaXNwb3NlIH0gPSB0ZW5zb3JbMl07XG4gICAgICByZXR1cm4gVGVuc29yLmZyb21HcHVCdWZmZXIoZ3B1QnVmZmVyLCB7IGRhdGFUeXBlLCBkaW1zOiB0ZW5zb3JbMV0sIGRvd25sb2FkLCBkaXNwb3NlIH0pO1xuICAgIH1cbiAgICBjYXNlICdtbC10ZW5zb3InOiB7XG4gICAgICBjb25zdCBkYXRhVHlwZSA9IHRlbnNvclswXTtcbiAgICAgIGlmICghaXNNTFRlbnNvclN1cHBvcnRlZFR5cGUoZGF0YVR5cGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgbm90IHN1cHBvcnRlZCBkYXRhIHR5cGU6ICR7ZGF0YVR5cGV9IGZvciBkZXNlcmlhbGl6aW5nIE1MVGVuc29yIHRlbnNvcmApO1xuICAgICAgfVxuICAgICAgY29uc3QgeyBtbFRlbnNvciwgZG93bmxvYWQsIGRpc3Bvc2UgfSA9IHRlbnNvclsyXTtcbiAgICAgIHJldHVybiBUZW5zb3IuZnJvbU1MVGVuc29yKG1sVGVuc29yLCB7IGRhdGFUeXBlLCBkaW1zOiB0ZW5zb3JbMV0sIGRvd25sb2FkLCBkaXNwb3NlIH0pO1xuICAgIH1cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIGRhdGEgbG9jYXRpb246ICR7dGVuc29yWzNdfWApO1xuICB9XG59O1xuXG5leHBvcnQgY2xhc3MgT25ueHJ1bnRpbWVXZWJBc3NlbWJseVNlc3Npb25IYW5kbGVyIGltcGxlbWVudHMgSW5mZXJlbmNlU2Vzc2lvbkhhbmRsZXIge1xuICBwcml2YXRlIHNlc3Npb25JZDogbnVtYmVyO1xuXG4gIGlucHV0TmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xuICBvdXRwdXROYW1lczogcmVhZG9ubHkgc3RyaW5nW107XG4gIGlucHV0TWV0YWRhdGE6IHJlYWRvbmx5IEluZmVyZW5jZVNlc3Npb24uVmFsdWVNZXRhZGF0YVtdO1xuICBvdXRwdXRNZXRhZGF0YTogcmVhZG9ubHkgSW5mZXJlbmNlU2Vzc2lvbi5WYWx1ZU1ldGFkYXRhW107XG5cbiAgYXN5bmMgZmV0Y2hNb2RlbEFuZENvcHlUb1dhc21NZW1vcnkocGF0aDogc3RyaW5nKTogUHJvbWlzZTxTZXJpYWxpemFibGVJbnRlcm5hbEJ1ZmZlcj4ge1xuICAgIC8vIGZldGNoIG1vZGVsIGZyb20gdXJsIGFuZCBtb3ZlIHRvIHdhc20gaGVhcC5cbiAgICByZXR1cm4gY29weUZyb21FeHRlcm5hbEJ1ZmZlcihhd2FpdCBsb2FkRmlsZShwYXRoKSk7XG4gIH1cblxuICBhc3luYyBsb2FkTW9kZWwocGF0aE9yQnVmZmVyOiBzdHJpbmcgfCBVaW50OEFycmF5LCBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFByb21pc2U8dm9pZD4ge1xuICAgIFRSQUNFX0ZVTkNfQkVHSU4oKTtcbiAgICBsZXQgbW9kZWw6IFBhcmFtZXRlcnM8dHlwZW9mIGNyZWF0ZVNlc3Npb24+WzBdO1xuXG4gICAgaWYgKHR5cGVvZiBwYXRoT3JCdWZmZXIgPT09ICdzdHJpbmcnKSB7XG4gICAgICBpZiAoaXNOb2RlKSB7XG4gICAgICAgIC8vIG5vZGVcbiAgICAgICAgbW9kZWwgPSBhd2FpdCBsb2FkRmlsZShwYXRoT3JCdWZmZXIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy8gYnJvd3NlclxuICAgICAgICAvLyBmZXRjaCBtb2RlbCBhbmQgY29weSB0byB3YXNtIGhlYXAuXG4gICAgICAgIG1vZGVsID0gYXdhaXQgdGhpcy5mZXRjaE1vZGVsQW5kQ29weVRvV2FzbU1lbW9yeShwYXRoT3JCdWZmZXIpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBtb2RlbCA9IHBhdGhPckJ1ZmZlcjtcbiAgICB9XG5cbiAgICBbdGhpcy5zZXNzaW9uSWQsIHRoaXMuaW5wdXROYW1lcywgdGhpcy5vdXRwdXROYW1lcywgdGhpcy5pbnB1dE1ldGFkYXRhLCB0aGlzLm91dHB1dE1ldGFkYXRhXSA9IGF3YWl0IGNyZWF0ZVNlc3Npb24oXG4gICAgICBtb2RlbCxcbiAgICAgIG9wdGlvbnMsXG4gICAgKTtcbiAgICBUUkFDRV9GVU5DX0VORCgpO1xuICB9XG5cbiAgYXN5bmMgZGlzcG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gcmVsZWFzZVNlc3Npb24odGhpcy5zZXNzaW9uSWQpO1xuICB9XG5cbiAgYXN5bmMgcnVuKFxuICAgIGZlZWRzOiBTZXNzaW9uSGFuZGxlci5GZWVkc1R5cGUsXG4gICAgZmV0Y2hlczogU2Vzc2lvbkhhbmRsZXIuRmV0Y2hlc1R5cGUsXG4gICAgb3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zLFxuICApOiBQcm9taXNlPFNlc3Npb25IYW5kbGVyLlJldHVyblR5cGU+IHtcbiAgICBUUkFDRV9GVU5DX0JFR0lOKCk7XG4gICAgY29uc3QgaW5wdXRBcnJheTogVGVuc29yW10gPSBbXTtcbiAgICBjb25zdCBpbnB1dEluZGljZXM6IG51bWJlcltdID0gW107XG4gICAgT2JqZWN0LmVudHJpZXMoZmVlZHMpLmZvckVhY2goKGt2cCkgPT4ge1xuICAgICAgY29uc3QgbmFtZSA9IGt2cFswXTtcbiAgICAgIGNvbnN0IHRlbnNvciA9IGt2cFsxXTtcbiAgICAgIGNvbnN0IGluZGV4ID0gdGhpcy5pbnB1dE5hbWVzLmluZGV4T2YobmFtZSk7XG4gICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBpbnB1dCAnJHtuYW1lfSdgKTtcbiAgICAgIH1cbiAgICAgIGlucHV0QXJyYXkucHVzaCh0ZW5zb3IpO1xuICAgICAgaW5wdXRJbmRpY2VzLnB1c2goaW5kZXgpO1xuICAgIH0pO1xuXG4gICAgY29uc3Qgb3V0cHV0QXJyYXk6IEFycmF5PFRlbnNvciB8IG51bGw+ID0gW107XG4gICAgY29uc3Qgb3V0cHV0SW5kaWNlczogbnVtYmVyW10gPSBbXTtcbiAgICBPYmplY3QuZW50cmllcyhmZXRjaGVzKS5mb3JFYWNoKChrdnApID0+IHtcbiAgICAgIGNvbnN0IG5hbWUgPSBrdnBbMF07XG4gICAgICBjb25zdCB0ZW5zb3IgPSBrdnBbMV07XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMub3V0cHV0TmFtZXMuaW5kZXhPZihuYW1lKTtcbiAgICAgIGlmIChpbmRleCA9PT0gLTEpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIG91dHB1dCAnJHtuYW1lfSdgKTtcbiAgICAgIH1cbiAgICAgIG91dHB1dEFycmF5LnB1c2godGVuc29yKTtcbiAgICAgIG91dHB1dEluZGljZXMucHVzaChpbmRleCk7XG4gICAgfSk7XG5cbiAgICBjb25zdCBpbnB1dHMgPSBpbnB1dEFycmF5Lm1hcCgodCwgaSkgPT5cbiAgICAgIGVuY29kZVRlbnNvck1ldGFkYXRhKHQsICgpID0+IGBpbnB1dCBcIiR7dGhpcy5pbnB1dE5hbWVzW2lucHV0SW5kaWNlc1tpXV19XCJgKSxcbiAgICApO1xuICAgIGNvbnN0IG91dHB1dHMgPSBvdXRwdXRBcnJheS5tYXAoKHQsIGkpID0+XG4gICAgICB0ID8gZW5jb2RlVGVuc29yTWV0YWRhdGEodCwgKCkgPT4gYG91dHB1dCBcIiR7dGhpcy5vdXRwdXROYW1lc1tvdXRwdXRJbmRpY2VzW2ldXX1cImApIDogbnVsbCxcbiAgICApO1xuXG4gICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHJ1bih0aGlzLnNlc3Npb25JZCwgaW5wdXRJbmRpY2VzLCBpbnB1dHMsIG91dHB1dEluZGljZXMsIG91dHB1dHMsIG9wdGlvbnMpO1xuXG4gICAgY29uc3QgcmVzdWx0TWFwOiBTZXNzaW9uSGFuZGxlci5SZXR1cm5UeXBlID0ge307XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCByZXN1bHRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRNYXBbdGhpcy5vdXRwdXROYW1lc1tvdXRwdXRJbmRpY2VzW2ldXV0gPSBvdXRwdXRBcnJheVtpXSA/PyBkZWNvZGVUZW5zb3JNZXRhZGF0YShyZXN1bHRzW2ldKTtcbiAgICB9XG4gICAgVFJBQ0VfRlVOQ19FTkQoKTtcbiAgICByZXR1cm4gcmVzdWx0TWFwO1xuICB9XG5cbiAgc3RhcnRQcm9maWxpbmcoKTogdm9pZCB7XG4gICAgLy8gVE9ETzogaW1wbGVtZW50IHByb2ZpbGluZ1xuICB9XG5cbiAgZW5kUHJvZmlsaW5nKCk6IHZvaWQge1xuICAgIHZvaWQgZW5kUHJvZmlsaW5nKHRoaXMuc2Vzc2lvbklkKTtcbiAgfVxufVxuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgeyBCYWNrZW5kLCBlbnYsIEluZmVyZW5jZVNlc3Npb24sIEluZmVyZW5jZVNlc3Npb25IYW5kbGVyIH0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHsgaW5pdGlhbGl6ZU9ydEVwLCBpbml0aWFsaXplV2ViQXNzZW1ibHlBbmRPcnRSdW50aW1lIH0gZnJvbSAnLi93YXNtL3Byb3h5LXdyYXBwZXInO1xuaW1wb3J0IHsgT25ueHJ1bnRpbWVXZWJBc3NlbWJseVNlc3Npb25IYW5kbGVyIH0gZnJvbSAnLi93YXNtL3Nlc3Npb24taGFuZGxlci1pbmZlcmVuY2UnO1xuXG4vKipcbiAqIFRoaXMgZnVuY3Rpb24gaW5pdGlhbGl6ZXMgYWxsIGZsYWdzIGZvciBXZWJBc3NlbWJseS5cbiAqXG4gKiBUaG9zZSBmbGFncyBhcmUgYWNjZXNzaWJsZSBmcm9tIGBvcnQuZW52Lndhc21gLiBVc2VycyBhcmUgYWxsb3cgdG8gc2V0IHRob3NlIGZsYWdzIGJlZm9yZSB0aGUgZmlyc3QgaW5mZXJlbmNlIHNlc3Npb25cbiAqIGJlaW5nIGNyZWF0ZWQsIHRvIG92ZXJyaWRlIGRlZmF1bHQgdmFsdWUuXG4gKi9cbmV4cG9ydCBjb25zdCBpbml0aWFsaXplRmxhZ3MgPSAoKTogdm9pZCA9PiB7XG4gIGlmICh0eXBlb2YgZW52Lndhc20uaW5pdFRpbWVvdXQgIT09ICdudW1iZXInIHx8IGVudi53YXNtLmluaXRUaW1lb3V0IDwgMCkge1xuICAgIGVudi53YXNtLmluaXRUaW1lb3V0ID0gMDtcbiAgfVxuXG4gIGNvbnN0IHNpbWQgPSBlbnYud2FzbS5zaW1kO1xuICBpZiAodHlwZW9mIHNpbWQgIT09ICdib29sZWFuJyAmJiBzaW1kICE9PSB1bmRlZmluZWQgJiYgc2ltZCAhPT0gJ2ZpeGVkJyAmJiBzaW1kICE9PSAncmVsYXhlZCcpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUud2FybihcbiAgICAgIGBQcm9wZXJ0eSBcImVudi53YXNtLnNpbWRcIiBpcyBzZXQgdG8gdW5rbm93biB2YWx1ZSBcIiR7c2ltZH1cIi4gUmVzZXQgaXQgdG8gXFxgZmFsc2VcXGAgYW5kIGlnbm9yZSBTSU1EIGZlYXR1cmUgY2hlY2tpbmcuYCxcbiAgICApO1xuICAgIGVudi53YXNtLnNpbWQgPSBmYWxzZTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZW52Lndhc20ucHJveHkgIT09ICdib29sZWFuJykge1xuICAgIGVudi53YXNtLnByb3h5ID0gZmFsc2U7XG4gIH1cblxuICBpZiAodHlwZW9mIGVudi53YXNtLnRyYWNlICE9PSAnYm9vbGVhbicpIHtcbiAgICBlbnYud2FzbS50cmFjZSA9IGZhbHNlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBlbnYud2FzbS5udW1UaHJlYWRzICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihlbnYud2FzbS5udW1UaHJlYWRzKSB8fCBlbnYud2FzbS5udW1UaHJlYWRzIDw9IDApIHtcbiAgICAvLyBUaGUgZm9sbG93aW5nIGxvZ2ljIG9ubHkgYXBwbGllcyB3aGVuIGBvcnQuZW52Lndhc20ubnVtVGhyZWFkc2AgaXMgbm90IHNldCBieSB1c2VyLiBXZSB3aWxsIGFsd2F5cyBob25vciB1c2VyJ3NcbiAgICAvLyBzZXR0aW5nIGlmIGl0IGlzIHByb3ZpZGVkLlxuXG4gICAgLy8gQnJvd3Nlcjogd2hlbiBjcm9zc09yaWdpbklzb2xhdGVkIGlzIGZhbHNlLCBTaGFyZWRBcnJheUJ1ZmZlciBpcyBub3QgYXZhaWxhYmxlIHNvIFdlYkFzc2VtYmx5IHRocmVhZHMgd2lsbCBub3RcbiAgICAvLyB3b3JrLiBJbiB0aGlzIGNhc2UsIHdlIHdpbGwgc2V0IG51bVRocmVhZHMgdG8gMS5cbiAgICAvL1xuICAgIC8vIFRoZXJlIGlzIGFuIGV4Y2VwdGlvbjogd2hlbiB0aGUgYnJvd3NlciBpcyBjb25maWd1cmVkIHRvIGZvcmNlLWVuYWJsZSBTaGFyZWRBcnJheUJ1ZmZlciAoZS5nLiBDaHJvbXVpbSB3aXRoXG4gICAgLy8gLS1lbmFibGUtZmVhdHVyZXM9U2hhcmVkQXJyYXlCdWZmZXIpLCBpdCBpcyBwb3NzaWJsZSB0aGF0IGBzZWxmLmNyb3NzT3JpZ2luSXNvbGF0ZWRgIGlzIGZhbHNlIGFuZFxuICAgIC8vIFNoYXJlZEFycmF5QnVmZmVyIGlzIGF2YWlsYWJsZSBhdCB0aGUgc2FtZSB0aW1lLiBUaGlzIGlzIHVzdWFsbHkgZm9yIHRlc3RpbmcuIEluIHRoaXMgY2FzZSwgIHdlIHdpbGwgc3RpbGwgc2V0XG4gICAgLy8gbnVtVGhyZWFkcyB0byAxIGhlcmUuIElmIHdlIHdhbnQgdG8gZW5hYmxlIG11bHRpLXRocmVhZGluZyBpbiB0ZXN0LCB3ZSBzaG91bGQgc2V0IGBvcnQuZW52Lndhc20ubnVtVGhyZWFkc2AgdG8gYVxuICAgIC8vIHZhbHVlIGdyZWF0ZXIgdGhhbiAxLlxuICAgIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgJiYgIXNlbGYuY3Jvc3NPcmlnaW5Jc29sYXRlZCkge1xuICAgICAgZW52Lndhc20ubnVtVGhyZWFkcyA9IDE7XG4gICAgfSBlbHNlIHtcbiAgICAgIGNvbnN0IG51bUNwdUxvZ2ljYWxDb3JlcyA9XG4gICAgICAgIHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnID8gcmVxdWlyZSgnbm9kZTpvcycpLmNwdXMoKS5sZW5ndGggOiBuYXZpZ2F0b3IuaGFyZHdhcmVDb25jdXJyZW5jeTtcbiAgICAgIGVudi53YXNtLm51bVRocmVhZHMgPSBNYXRoLm1pbig0LCBNYXRoLmNlaWwoKG51bUNwdUxvZ2ljYWxDb3JlcyB8fCAxKSAvIDIpKTtcbiAgICB9XG4gIH1cbn07XG5cbmV4cG9ydCBjbGFzcyBPbm54cnVudGltZVdlYkFzc2VtYmx5QmFja2VuZCBpbXBsZW1lbnRzIEJhY2tlbmQge1xuICAvKipcbiAgICogVGhpcyBmdW5jdGlvbiBpbml0aWFsaXplcyB0aGUgV2ViQXNzZW1ibHkgYmFja2VuZC5cbiAgICpcbiAgICogVGhpcyBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBvbmx5IG9uY2UgZm9yIGVhY2ggYmFja2VuZCBuYW1lLiBJdCB3aWxsIGJlIGNhbGxlZCB0aGUgZmlyc3QgdGltZSB3aGVuXG4gICAqIGBvcnQuSW5mZXJlbmNlU2Vzc2lvbi5jcmVhdGUoKWAgaXMgY2FsbGVkIHdpdGggYSByZWdpc3RlcmVkIGJhY2tlbmQgbmFtZS5cbiAgICpcbiAgICogQHBhcmFtIGJhY2tlbmROYW1lIC0gdGhlIHJlZ2lzdGVyZWQgYmFja2VuZCBuYW1lLlxuICAgKi9cbiAgYXN5bmMgaW5pdChiYWNrZW5kTmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgLy8gcG9wdWxhdGUgd2FzbSBmbGFnc1xuICAgIGluaXRpYWxpemVGbGFncygpO1xuXG4gICAgLy8gaW5pdCB3YXNtXG4gICAgYXdhaXQgaW5pdGlhbGl6ZVdlYkFzc2VtYmx5QW5kT3J0UnVudGltZSgpO1xuXG4gICAgLy8gcGVyZm9ybWUgRVAgc3BlY2lmaWMgaW5pdGlhbGl6YXRpb25cbiAgICBhd2FpdCBpbml0aWFsaXplT3J0RXAoYmFja2VuZE5hbWUpO1xuICB9XG4gIGNyZWF0ZUluZmVyZW5jZVNlc3Npb25IYW5kbGVyKFxuICAgIHBhdGg6IHN0cmluZyxcbiAgICBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcj47XG4gIGNyZWF0ZUluZmVyZW5jZVNlc3Npb25IYW5kbGVyKFxuICAgIGJ1ZmZlcjogVWludDhBcnJheSxcbiAgICBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcj47XG4gIGFzeW5jIGNyZWF0ZUluZmVyZW5jZVNlc3Npb25IYW5kbGVyKFxuICAgIHBhdGhPckJ1ZmZlcjogc3RyaW5nIHwgVWludDhBcnJheSxcbiAgICBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcj4ge1xuICAgIGNvbnN0IGhhbmRsZXIgPSBuZXcgT25ueHJ1bnRpbWVXZWJBc3NlbWJseVNlc3Npb25IYW5kbGVyKCk7XG4gICAgYXdhaXQgaGFuZGxlci5sb2FkTW9kZWwocGF0aE9yQnVmZmVyLCBvcHRpb25zKTtcbiAgICByZXR1cm4gaGFuZGxlcjtcbiAgfVxufVxuXG5leHBvcnQgY29uc3Qgd2FzbUJhY2tlbmQgPSBuZXcgT25ueHJ1bnRpbWVXZWJBc3NlbWJseUJhY2tlbmQoKTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlcywgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0cyAqL1xuXG4vLyBXZSB1c2UgXCJyZXF1aXJlXCIgaW5zdGVhZCBvZiBcImltcG9ydFwiIGhlcmUgYmVjYXVzZSBpbXBvcnQgc3RhdGVtZW50IG11c3QgYmUgcHV0IGluIHRvcCBsZXZlbC4gT3VyIGN1cnJlbnQgY29kZSBkb2VzXG4vLyBub3QgYWxsb3cgYnVuZGxlciB0byB0cmVlLXNoYWtpbmcgY29kZSBhcyBleHBlY3RlZCBiZWNhdXNlIHNvbWUgY29kZXMgYXJlIHRyZWF0ZWQgYXMgaGF2aW5nIHNpZGUgZWZmZWN0cy5cbi8vIFNvIHdlIGltcG9ydCBjb2RlIGluc2lkZSB0aGUgaWYtY2xhdXNlIHRvIGFsbG93IGJ1bmRsZXIgcmVtb3ZlIHRoZSBjb2RlIHNhZmVseS5cblxuZXhwb3J0ICogZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcbmltcG9ydCAqIGFzIG9ydCBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuZXhwb3J0IGRlZmF1bHQgb3J0O1xuXG5pbXBvcnQgeyByZWdpc3RlckJhY2tlbmQsIGVudiB9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5pbXBvcnQgeyB2ZXJzaW9uIH0gZnJvbSAnLi92ZXJzaW9uJztcblxuaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR0wpIHtcbiAgY29uc3Qgb25ueGpzQmFja2VuZCA9IHJlcXVpcmUoJy4vYmFja2VuZC1vbm54anMnKS5vbm54anNCYWNrZW5kO1xuICByZWdpc3RlckJhY2tlbmQoJ3dlYmdsJywgb25ueGpzQmFja2VuZCwgLTEwKTtcbn1cblxuaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTSkge1xuICBjb25zdCB3YXNtQmFja2VuZCA9IHJlcXVpcmUoJy4vYmFja2VuZC13YXNtJykud2FzbUJhY2tlbmQ7XG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX0pTRVApIHtcbiAgICByZWdpc3RlckJhY2tlbmQoJ3dlYmdwdScsIHdhc21CYWNrZW5kLCA1KTtcbiAgICByZWdpc3RlckJhY2tlbmQoJ3dlYm5uJywgd2FzbUJhY2tlbmQsIDUpO1xuICB9XG4gIHJlZ2lzdGVyQmFja2VuZCgnY3B1Jywgd2FzbUJhY2tlbmQsIDEwKTtcbiAgcmVnaXN0ZXJCYWNrZW5kKCd3YXNtJywgd2FzbUJhY2tlbmQsIDEwKTtcbn1cblxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGVudi52ZXJzaW9ucywgJ3dlYicsIHsgdmFsdWU6IHZlcnNpb24sIGVudW1lcmFibGU6IHRydWUgfSk7XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbi8vIFRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgYnkgL2pzL3NjcmlwdHMvdXBkYXRlLXZlcnNpb24udHNcbi8vIERvIG5vdCBtb2RpZnkgZmlsZSBjb250ZW50IG1hbnVhbGx5LlxuXG5leHBvcnQgY29uc3QgdmVyc2lvbiA9ICcxLjIyLjAnO1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsSUFnQk0sVUFDQSwwQkFZTyxpQkF3Q1AsZ0NBd0NPO0FBN0diOzs7QUFnQkEsSUFBTSxXQUFxQyxvQkFBSSxJQUFHO0FBQ2xELElBQU0sMkJBQXFDLENBQUE7QUFZcEMsSUFBTSxrQkFBa0IsQ0FBQyxNQUFjLFNBQWtCLGFBQTBCO0FBQ3hGLFVBQUksV0FBVyxPQUFPLFFBQVEsU0FBUyxjQUFjLE9BQU8sUUFBUSxrQ0FBa0MsWUFBWTtBQUNoSCxjQUFNLGlCQUFpQixTQUFTLElBQUksSUFBSTtBQUN4QyxZQUFJLG1C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YUFBWSxjQUFhLENBQUM7QUFBRSxZQUFHRixHQUFFLEdBQUcsUUFBT0EsR0FBRSxZQUFZO0FBQUUsY0FBTSxNQUFNQSxHQUFFLFNBQU8sUUFBTUEsR0FBRSxHQUFHO0FBQUEsTUFBQztBQUFHLFVBQUksSUFBRSxRQUFRLElBQUksS0FBSyxPQUFPLEdBQUUsSUFBRSxRQUFRLE1BQU0sS0FBSyxPQUFPLEdBQUUsSUFBRSxHQUFFLElBQUU7QUFBRSxhQUFPLE9BQU8sR0FBRSxDQUFDLEdBQUUsSUFBRTtBQUFLLFVBQUksR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxJQUFFLEVBQUUsWUFBVyxJQUFFLE9BQUcsSUFBRSxDQUFBRSxPQUFHQSxHQUFFLFdBQVcsU0FBUztBQUFFLGVBQVMsSUFBRztBQUFDLGVBQU8sRUFBRSxVQUFRLEVBQUUsVUFBUSxFQUFFLEdBQUU7QUFBQSxNQUFDO0FBQUMsZUFBUyxJQUFHO0FBQUMsZUFBTyxFQUFFLFVBQVEsRUFBRSxVQUFRLEVBQUUsR0FBRTtBQUFBLE1BQUM7QUFBQyxlQUFTLElBQUc7QUFBQyxlQUFPLEVBQUUsVUFBUSxFQUFFLFVBQVEsRUFBRSxHQUFFO0FBQUEsTUFBQztBQUFDLGVBQVMsSUFBRztBQUFDLGVBQU8sRUFBRSxVQUFRLEVBQUUsVUFBUSxFQUFFLEdBQUU7QUFBQSxNQUFDO0FBQUMsZUFBUyxJQUFHO0FBQUMsZUFBTyxFQUFFLFVBQVEsRUFBRSxVQUFRLEVBQUUsR0FBRTtBQUFBLE1BQUM7QUFBQyxlQUFTLElBQUc7QUFBQyxlQUFPLEVBQUUsVUFBUSxFQUFFLFVBQVEsRUFBRSxHQUFFO0FBQUEsTUFBQztBQUFDLGVBQVMsSUFBRztBQUFDLGVBQU8sRUFBRSxVQUFRLEVBQUUsVUFBUSxFQUFFLEdBQUU7QUFBQSxNQUFDO0FBQUMsZUFBUyxJQUFHO0FBQUMsZUFBTyxFQUFFLFVBQVEsRUFBRSxVQUFRLEVBQUUsR0FBRTtBQUFBLE1BQUM7QUFBQyxVQUFHLEdBQUU7QUFBWSxZQUFTTSxNQUFULFNBQVlOLElBQUU7QUFBQyxjQUFHO0FBQUMsZ0JBQUlGLEtBQUVFLEdBQUUsTUFBS0QsS0FBRUQsR0FBRTtBQUFHLGdCQUFHLFdBQVNDLElBQUU7QUFBQyxrQkFBSUMsS0FBRSxDQUFDO0FBQUUsbUJBQUssWUFBVSxDQUFBRixPQUFHRSxHQUFFLEtBQUtGLEVBQUMsR0FBRSxLQUFLLGNBQVksTUFBSTtBQUFDLDRCQUFZLEVBQUMsSUFBRyxTQUFRLENBQUM7QUFBRSx5QkFBUUEsTUFBS0UsR0FBRSxDQUFBTSxJQUFHUixFQUFDO0FBQUUscUJBQUssWUFBVVE7QUFBQSxjQUFFO0FBQUUseUJBQVVOLE1BQUtGLEdBQUUsR0FBRyxHQUFFRSxFQUFDLEtBQUcsQ0FBQyxFQUFFQSxFQUFDLEVBQUUsVUFBUSxFQUFFQSxFQUFDLElBQUUsSUFBSUYsT0FBSTtBQUFDLDRCQUFZLEVBQUMsSUFBRyxlQUFjLElBQUdFLElBQUUsTUFBS0YsR0FBQyxDQUFDO0FBQUEsY0FBQyxHQUFFLFdBQVNFLE9BQUksSUFBRSxFQUFFQSxFQUFDLElBQUcsY0FBWUEsT0FBSSxJQUFFLEVBQUVBLEVBQUM7QUFBSSxrQkFBRUYsR0FBRSxJQUFHLEVBQUUsR0FBRSxFQUFFQSxHQUFFLEVBQUU7QUFBQSxZQUFDLFdBQVMsVUFBUUMsSUFBRTtBQUFDLGlCQUFHRCxHQUFFLEVBQUUsR0FBRSxHQUFHQSxHQUFFLElBQUcsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDLEdBQUUsR0FBRyxHQUFFLEdBQUdBLEdBQUUsRUFBRSxHQUFFLE1BQUksR0FBRyxHQUFFLElBQUU7QUFBSSxrQkFBRztBQUFDLG1CQUFHQSxHQUFFLElBQUdBLEdBQUUsRUFBRTtBQUFBLGNBQUMsU0FBT0UsSUFBRTtBQUFDLG9CQUFHLFlBQVVBLEdBQUUsT0FBTUE7QUFBQSxjQUFDO0FBQUEsWUFBQyxNQUFLLG9CQUFpQkYsR0FBRSxXQUFTLG1CQUFpQkMsS0FBRSxLQUFHLEdBQUcsSUFBRUEsT0FBSSxFQUFFLG9DQUFvQ0EsRUFBQyxFQUFFLEdBQUUsRUFBRUQsRUFBQztBQUFBLFVBQUcsU0FBT0UsSUFBRTtBQUFDLGtCQUFNLEdBQUcsR0FBRUE7QUFBQSxVQUFDO0FBQUEsUUFBQztBQUFybEIsaUJBQUFNO0FBQXBCLFlBQUksR0FBRSxJQUFFO0FBQWttQixZQUFFLFlBQVlOLElBQUU7QUFBQyxVQUFBQSxLQUFFQSxHQUFFLEtBQUssR0FBRyxHQUFFLFFBQVEsTUFBTUEsRUFBQztBQUFBLFFBQUMsR0FBRSxLQUFLLFFBQU0sWUFBWUEsSUFBRTtBQUFDLHNCQUFZLEVBQUMsSUFBRyxTQUFRLE1BQUtBLEdBQUUsS0FBSyxHQUFHLEdBQUUsSUFBRyxHQUFHLEVBQUMsQ0FBQztBQUFBLFFBQUMsR0FBRSxLQUFLLHVCQUFxQixDQUFBQSxPQUFHO0FBQUMsZ0JBQU1BLEdBQUUsVUFBUUE7QUFBQSxRQUFDLEdBQUUsS0FBSyxZQUFVTTtBQUFBLE1BQUU7QUFBQyxlQUFTLElBQUc7QUFBQyxZQUFJTixLQUFFLEVBQUU7QUFBTyxVQUFFLFFBQU0sSUFBRSxJQUFJLFVBQVVBLEVBQUMsR0FBRSxFQUFFLFNBQU8sSUFBRSxJQUFJLFdBQVdBLEVBQUMsR0FBRSxFQUFFLFNBQU8sSUFBRSxJQUFJLFdBQVdBLEVBQUMsR0FBRSxFQUFFLFVBQVEsSUFBRSxJQUFJLFlBQVlBLEVBQUMsR0FBRSxFQUFFLFNBQU8sSUFBRSxJQUFJLFdBQVdBLEVBQUMsR0FBRSxFQUFFLFVBQVEsSUFBRSxJQUFJLFlBQVlBLEVBQUMsR0FBRSxFQUFFLFVBQVEsSUFBRSxJQUFJLGFBQWFBLEVBQUMsR0FBRSxFQUFFLFVBQVEsSUFBRSxJQUFJLGFBQWFBLEVBQUMsR0FBRSxFQUFFLFNBQU8sSUFBRSxJQUFJLGNBQWNBLEVBQUMsR0FBRSxFQUFFLFVBQVEsSUFBRSxJQUFJLGVBQWVBLEVBQUM7QUFBQSxNQUFDO0FBQUMsZUFBUyxJQUFHO0FBQUMsWUFBRSxZQUFZLENBQUMsSUFBRSxHQUFHLEdBQUc7QUFBQSxNQUFDO0FBQUMsWUFBSSxJQUFFLElBQUksWUFBWSxPQUFPLEVBQUMsU0FBUSxLQUFJLFNBQVEsT0FBTSxRQUFPLEtBQUUsQ0FBQyxHQUFFLEVBQUU7QUFBRyxVQUFJLEdBQUUsSUFBRSxHQUFFLElBQUU7QUFBSyxlQUFTLElBQUc7QUFBQyxZQUFHLEtBQUcsRUFBRSxLQUFHLEdBQUU7QUFBQyxjQUFJQSxLQUFFO0FBQUUsY0FBRSxNQUFLQSxHQUFFO0FBQUEsUUFBQztBQUFBLE1BQUM7QUFBQyxlQUFTLEVBQUVBLElBQUU7QUFBQyxjQUFNLEVBQUVBLEtBQUUsYUFBV0EsS0FBRSxHQUFHLEdBQUUsSUFBRSxNQUFHQSxLQUFFLElBQUksWUFBWSxhQUFhQSxLQUFFLDBDQUEwQyxHQUFFLEVBQUVBLEVBQUMsR0FBRUE7QUFBQSxNQUFDO0FBQUMsZUFBUyxLQUFJO0FBQUMsZUFBTSxFQUFDLEdBQUUsRUFBQyxHQUFFLElBQUcsSUFBRyxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLElBQUcsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxJQUFHLElBQUcsR0FBRSxJQUFHLElBQUcsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxJQUFHLElBQUcsR0FBRSxJQUFHLElBQUcsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsR0FBRSxJQUFHLElBQUcsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsSUFBRyxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsR0FBRSxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsSUFBRyxJQUFHLEdBQUUsSUFBRyxJQUFHLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsSUFBRyxJQUFHLEdBQUUsSUFBRyxHQUFFLEdBQUUsSUFBRyxHQUFFLEVBQUM7QUFBQSxNQUFDO0FBQUMsVUFBSSxLQUFHLEVBQUMsUUFBTyxDQUFDQSxJQUFFRixJQUFFQyxJQUFFRSxJQUFFQyxPQUFJO0FBQUMsWUFBRyxXQUFTLEtBQUcsQ0FBQyxFQUFFLEdBQUcsUUFBTztBQUFFLGFBQUlGLEtBQUUsR0FBRyxPQUFPQSxPQUFJLENBQUMsQ0FBQyxHQUFHLFdBQVcsSUFBSSxNQUFJQSxLQUFFQSxHQUFFLFVBQVUsQ0FBQyxJQUFHLEVBQUVBLEtBQUUsRUFBRSxHQUFHLElBQUlBLEVBQUMsR0FBRyxRQUFPO0FBQUUsWUFBR0YsS0FBRSxPQUFPQSxPQUFJLENBQUMsR0FBRUMsS0FBRSxPQUFPQSxPQUFJLENBQUMsR0FBRUUsS0FBRSxPQUFPQSxPQUFJLENBQUMsR0FBRUgsS0FBRUMsS0FBRUMsR0FBRSxXQUFXLFFBQU87QUFBRSxZQUFHO0FBQUMsZ0JBQU1JLEtBQUVKLEdBQUUsU0FBU0YsSUFBRUEsS0FBRUMsRUFBQztBQUFFLGtCQUFPRyxJQUFFO0FBQUEsWUFBQyxLQUFLO0FBQUUsZ0JBQUUsRUFBRSxJQUFJRSxJQUFFSCxPQUFJLENBQUM7QUFBRTtBQUFBLFlBQU0sS0FBSztBQUFFLGdCQUFFLEtBQUcsRUFBRSxHQUFHQSxJQUFFRyxFQUFDLElBQUUsRUFBRSxHQUFHSCxJQUFFRyxFQUFDO0FBQUU7QUFBQSxZQUFNO0FBQVEscUJBQU87QUFBQSxVQUFDO0FBQUMsaUJBQU87QUFBQSxRQUFDLFFBQU07QUFBQyxpQkFBTztBQUFBLFFBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDSixJQUFFRixJQUFFQyxPQUFJO0FBQUMsVUFBRSxHQUFHQyxJQUFFLEVBQUUsRUFBRSxTQUFTRixPQUFJLEdBQUVBLEtBQUVDLE9BQUksQ0FBQyxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sTUFBSSxFQUFFLEdBQUcsR0FBRSxRQUFPLENBQUFDLE9BQUc7QUFBQyxVQUFFLEdBQUdBLEVBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxNQUFJO0FBQUMsVUFBRSxHQUFHO0FBQUEsTUFBQyxHQUFFLFFBQU8sTUFBSTtBQUFDLFVBQUUsR0FBRztBQUFBLE1BQUMsR0FBRSxRQUFPLE1BQUk7QUFBQyxVQUFFLEdBQUc7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHLEVBQUUsR0FBR0EsRUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRyxFQUFFLEdBQUdBLEVBQUMsR0FBRSxRQUFPLENBQUNBLElBQUVGLElBQUVDLE9BQUk7QUFBQyxVQUFFLEdBQUcsT0FBT0MsRUFBQyxHQUFFLE9BQU9GLEVBQUMsR0FBRSxPQUFPQyxFQUFDLEdBQUUsSUFBRTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNDLElBQUVGLElBQUVDLE9BQUk7QUFBQyxVQUFFLEdBQUcsT0FBT0MsRUFBQyxHQUFFLE9BQU9GLEVBQUMsR0FBRSxPQUFPQyxFQUFDLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxNQUFJLGVBQWEsT0FBTyxxQkFBb0IsUUFBTyxDQUFBQyxPQUFHO0FBQUMsVUFBRSxHQUFHLE9BQU1BLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsT0FBTUEsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxTQUFRQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLFFBQU9BLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsY0FBYUEsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxRQUFPQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLE9BQU1BLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsT0FBTUEsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxXQUFVQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDQSxJQUFFRixJQUFFQyxPQUFJO0FBQUMsVUFBRSxHQUFHLGVBQWNDLElBQUUsRUFBQyxPQUFNRixJQUFFLE1BQUtDLEdBQUMsQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFDLE9BQUc7QUFBQyxVQUFFLEdBQUcsT0FBTUEsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxPQUFNQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLE9BQU1BLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsT0FBTUEsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxRQUFPQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLFFBQU9BLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsUUFBT0EsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxRQUFPQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLFFBQU9BLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsU0FBUUEsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxTQUFRQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLFNBQVFBLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsUUFBT0EsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxPQUFNQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDQSxJQUFFRixJQUFFQyxPQUFJO0FBQUMsVUFBRSxHQUFHLFFBQU9DLElBQUUsRUFBQyxLQUFJRixJQUFFLEtBQUlDLEdBQUMsQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFDLE9BQUc7QUFBQyxVQUFFLEdBQUcsUUFBT0EsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ0EsSUFBRUYsT0FBSTtBQUFDLFVBQUUsR0FBRyxPQUFNRSxJQUFFLEVBQUMsT0FBTUYsR0FBQyxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUUsT0FBRztBQUFDLFVBQUUsR0FBRyxRQUFPQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLFFBQU9BLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNBLElBQUVGLE9BQUk7QUFBQyxVQUFFLEdBQUcsYUFBWUUsSUFBRSxFQUFDLE9BQU1GLEdBQUMsQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNFLElBQUVGLE9BQUk7QUFBQyxVQUFFLEdBQUcsbUJBQWtCRSxJQUFFLEVBQUMsT0FBTUYsR0FBQyxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ0UsSUFBRUYsT0FBSTtBQUFDLFVBQUUsR0FBRyxRQUFPRSxJQUFFLEVBQUMsSUFBR0YsR0FBQyxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUUsT0FBRztBQUFDLFVBQUUsR0FBRyxPQUFNQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLE9BQU1BLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsT0FBTUEsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxPQUFNQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLE9BQU1BLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsU0FBUUEsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxXQUFVQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLGtCQUFpQkEsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxRQUFPQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLGVBQWNBLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNBLElBQUVGLElBQUVDLElBQUVFLElBQUVDLE9BQUk7QUFBQyxVQUFFLEdBQUcsY0FBYUYsSUFBRSxFQUFDLFVBQVMsQ0FBQyxDQUFDRixJQUFFLG1CQUFrQixDQUFDLENBQUNDLElBQUUsTUFBS0UsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0MsRUFBQyxNQUFJLENBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ0YsSUFBRUYsSUFBRUMsSUFBRUUsSUFBRUMsT0FBSTtBQUFDLFVBQUUsR0FBRyxhQUFZRixJQUFFLEVBQUMsVUFBUyxDQUFDLENBQUNGLElBQUUsbUJBQWtCLENBQUMsQ0FBQ0MsSUFBRSxNQUFLRSxLQUFFLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPQSxFQUFDLE1BQUksR0FBRSxPQUFPQyxFQUFDLE1BQUksQ0FBQyxDQUFDLElBQUUsQ0FBQyxFQUFDLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDRixJQUFFRixJQUFFQyxJQUFFRSxJQUFFQyxPQUFJO0FBQUMsVUFBRSxHQUFHLGFBQVlGLElBQUUsRUFBQyxVQUFTLENBQUMsQ0FBQ0YsSUFBRSxtQkFBa0IsQ0FBQyxDQUFDQyxJQUFFLE1BQUtFLEtBQUUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9BLEVBQUMsTUFBSSxHQUFFLE9BQU9DLEVBQUMsTUFBSSxDQUFDLENBQUMsSUFBRSxDQUFDLEVBQUMsQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNGLElBQUVGLElBQUVDLElBQUVFLElBQUVDLE9BQUk7QUFBQyxVQUFFLEdBQUcsY0FBYUYsSUFBRSxFQUFDLFVBQVMsQ0FBQyxDQUFDRixJQUFFLG1CQUFrQixDQUFDLENBQUNDLElBQUUsTUFBS0UsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0MsRUFBQyxNQUFJLENBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ0YsSUFBRUYsSUFBRUMsSUFBRUUsSUFBRUMsT0FBSTtBQUFDLFVBQUUsR0FBRyxhQUFZRixJQUFFLEVBQUMsVUFBUyxDQUFDLENBQUNGLElBQUUsbUJBQWtCLENBQUMsQ0FBQ0MsSUFBRSxNQUFLRSxLQUFFLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPQSxFQUFDLE1BQUksR0FBRSxPQUFPQyxFQUFDLE1BQUksQ0FBQyxDQUFDLElBQUUsQ0FBQyxFQUFDLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDRixJQUFFRixJQUFFQyxJQUFFRSxJQUFFQyxPQUFJO0FBQUMsVUFBRSxHQUFHLFlBQVdGLElBQUUsRUFBQyxVQUFTLENBQUMsQ0FBQ0YsSUFBRSxtQkFBa0IsQ0FBQyxDQUFDQyxJQUFFLE1BQUtFLEtBQUUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9BLEVBQUMsTUFBSSxHQUFFLE9BQU9DLEVBQUMsTUFBSSxDQUFDLENBQUMsSUFBRSxDQUFDLEVBQUMsQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNGLElBQUVGLElBQUVDLElBQUVFLElBQUVDLE9BQUk7QUFBQyxVQUFFLEdBQUcsWUFBV0YsSUFBRSxFQUFDLFVBQVMsQ0FBQyxDQUFDRixJQUFFLG1CQUFrQixDQUFDLENBQUNDLElBQUUsTUFBS0UsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0MsRUFBQyxNQUFJLENBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ0YsSUFBRUYsSUFBRUMsSUFBRUUsSUFBRUMsT0FBSTtBQUFDLFVBQUUsR0FBRyxnQkFBZUYsSUFBRSxFQUFDLFVBQVMsQ0FBQyxDQUFDRixJQUFFLG1CQUFrQixDQUFDLENBQUNDLElBQUUsTUFBS0UsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0MsRUFBQyxNQUFJLENBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ0YsSUFBRUYsSUFBRUMsSUFBRUUsSUFBRUMsT0FBSTtBQUFDLFVBQUUsR0FBRyxtQkFBa0JGLElBQUUsRUFBQyxVQUFTLENBQUMsQ0FBQ0YsSUFBRSxtQkFBa0IsQ0FBQyxDQUFDQyxJQUFFLE1BQUtFLEtBQUUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9BLEVBQUMsTUFBSSxHQUFFLE9BQU9DLEVBQUMsTUFBSSxDQUFDLENBQUMsSUFBRSxDQUFDLEVBQUMsQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNGLElBQUVGLElBQUVDLElBQUVFLElBQUVDLE9BQUk7QUFBQyxVQUFFLEdBQUcsbUJBQWtCRixJQUFFLEVBQUMsVUFBUyxDQUFDLENBQUNGLElBQUUsbUJBQWtCLENBQUMsQ0FBQ0MsSUFBRSxNQUFLRSxLQUFFLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPQSxFQUFDLE1BQUksR0FBRSxPQUFPQyxFQUFDLE1BQUksQ0FBQyxDQUFDLElBQUUsQ0FBQyxFQUFDLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBRixPQUFHO0FBQUMsVUFBRSxHQUFHLFNBQVFBLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNBLElBQUVGLElBQUVDLE9BQUk7QUFBQyxVQUFFLEdBQUcsYUFBWUMsSUFBRSxFQUFDLE1BQUtGLEtBQUUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9BLEVBQUMsTUFBSSxHQUFFLE9BQU9DLEVBQUMsTUFBSSxDQUFDLENBQUMsSUFBRSxDQUFDLEVBQUMsQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNDLElBQUVGLElBQUVDLElBQUVFLE9BQUk7QUFBQyxVQUFFLEdBQUcsZ0JBQWVELElBQUUsRUFBQyxXQUFVRixJQUFFLE1BQUssR0FBR0MsRUFBQyxHQUFFLFFBQU9FLEtBQUUsU0FBTyxPQUFNLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDRCxJQUFFRixJQUFFQyxJQUFFRSxPQUFJO0FBQUMsVUFBRSxHQUFHLGdCQUFlRCxJQUFFLEVBQUMsV0FBVUYsSUFBRSxNQUFLLEdBQUdDLEVBQUMsR0FBRSxRQUFPRSxLQUFFLFNBQU8sT0FBTSxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ0QsSUFBRUYsSUFBRUMsSUFBRUUsSUFBRUMsSUFBRUUsSUFBRUMsSUFBRUUsSUFBRUMsSUFBRUMsSUFBRUMsSUFBRUMsSUFBRUMsSUFBRUMsSUFBRUMsT0FBSTtBQUFDLFVBQUUsR0FBRyxpQkFBZ0JkLElBQUUsRUFBQyxRQUFPUSxLQUFFLFNBQU8sUUFBTyxTQUFRVixJQUFFLFdBQVUsQ0FBQ0MsRUFBQyxHQUFFLE9BQU1FLElBQUUsYUFBWSxDQUFDQyxFQUFDLEdBQUUsTUFBSyxDQUFDRSxJQUFFQyxFQUFDLEdBQUUsU0FBUSxDQUFDRSxFQUFDLEdBQUUsVUFBUyxNQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUVFLE9BQUksQ0FBQyxHQUFFLGVBQWNDLEtBQUUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9BLEVBQUMsTUFBSSxHQUFFLE9BQU9DLEVBQUMsTUFBSSxDQUFDLENBQUMsSUFBRSxDQUFDLEdBQUUsYUFBWUMsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0MsRUFBQyxNQUFJLENBQUMsQ0FBQyxJQUFFLENBQUMsR0FBRSxZQUFXLEdBQUdDLEVBQUMsRUFBQyxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ2QsSUFBRUYsSUFBRUMsSUFBRUUsSUFBRUMsSUFBRUUsSUFBRUMsSUFBRUUsSUFBRUMsSUFBRUMsSUFBRUMsSUFBRUMsSUFBRUMsSUFBRUMsT0FBSTtBQUFDLFVBQUUsR0FBRyxpQkFBZ0JiLElBQUUsRUFBQyxRQUFPTyxLQUFFLFNBQU8sUUFBTyxTQUFRVCxJQUFFLFdBQVUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9DLEVBQUMsTUFBSSxHQUFFLEtBQUcsT0FBT0EsRUFBQyxNQUFJLE9BQUssQ0FBQyxDQUFDLEdBQUUsT0FBTUUsSUFBRSxhQUFZLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPQyxFQUFDLE1BQUksR0FBRSxLQUFHLE9BQU9BLEVBQUMsTUFBSSxPQUFLLENBQUMsQ0FBQyxHQUFFLE1BQUssTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9FLEVBQUMsTUFBSSxHQUFFLEtBQUcsT0FBT0EsRUFBQyxNQUFJLE9BQUssQ0FBQyxDQUFDLEdBQUUsU0FBUSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0MsRUFBQyxNQUFJLEdBQUUsS0FBRyxPQUFPQSxFQUFDLE1BQUksT0FBSyxDQUFDLENBQUMsR0FBRSxVQUFTLE1BQUksQ0FBQyxDQUFDLEVBQUUsRUFBRUcsT0FBSSxDQUFDLEdBQUUsZUFBY0MsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0MsRUFBQyxNQUFJLENBQUMsQ0FBQyxJQUFFLENBQUMsR0FBRSxhQUFZQyxLQUFFLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPQSxFQUFDLE1BQUksR0FBRSxPQUFPQyxFQUFDLE1BQUksQ0FBQyxDQUFDLElBQUUsQ0FBQyxHQUFFLFlBQVcsR0FBR0MsRUFBQyxFQUFDLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDYixJQUFFRixJQUFFQyxJQUFFRSxJQUFFQyxJQUFFRSxJQUFFQyxJQUFFRSxJQUFFQyxJQUFFQyxJQUFFQyxJQUFFQyxJQUFFQyxJQUFFQyxJQUFFQyxPQUFJO0FBQUMsVUFBRSxHQUFHLGlCQUFnQmQsSUFBRSxFQUFDLFFBQU9RLEtBQUUsU0FBTyxRQUFPLFNBQVFWLElBQUUsV0FBVSxDQUFDQyxFQUFDLEdBQUUsT0FBTUUsSUFBRSxhQUFZLENBQUNDLEVBQUMsR0FBRSxNQUFLLENBQUNFLElBQUVDLEVBQUMsR0FBRSxTQUFRLENBQUNFLEVBQUMsR0FBRSxVQUFTLE1BQUksQ0FBQyxDQUFDLEVBQUUsRUFBRUUsT0FBSSxDQUFDLEdBQUUsZUFBY0MsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0MsRUFBQyxNQUFJLENBQUMsQ0FBQyxJQUFFLENBQUMsR0FBRSxhQUFZQyxLQUFFLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPQSxFQUFDLE1BQUksR0FBRSxPQUFPQyxFQUFDLE1BQUksQ0FBQyxDQUFDLElBQUUsQ0FBQyxHQUFFLFlBQVcsR0FBR0MsRUFBQyxFQUFDLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDZCxJQUFFRixJQUFFQyxJQUFFRSxJQUFFQyxJQUFFRSxJQUFFQyxJQUFFRSxJQUFFQyxJQUFFQyxJQUFFQyxJQUFFQyxJQUFFQyxJQUFFQyxPQUFJO0FBQUMsVUFBRSxHQUFHLGlCQUFnQmIsSUFBRSxFQUFDLFFBQU9PLEtBQUUsU0FBTyxRQUFPLFNBQVFULElBQUUsV0FBVSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0MsRUFBQyxNQUFJLEdBQUUsS0FBRyxPQUFPQSxFQUFDLE1BQUksT0FBSyxDQUFDLENBQUMsR0FBRSxPQUFNRSxJQUFFLGFBQVksTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9DLEVBQUMsTUFBSSxHQUFFLEtBQUcsT0FBT0EsRUFBQyxNQUFJLE9BQUssQ0FBQyxDQUFDLEdBQUUsTUFBSyxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0UsRUFBQyxNQUFJLEdBQUUsS0FBRyxPQUFPQSxFQUFDLE1BQUksT0FBSyxDQUFDLENBQUMsR0FBRSxTQUFRLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPQyxFQUFDLE1BQUksR0FBRSxLQUFHLE9BQU9BLEVBQUMsTUFBSSxPQUFLLENBQUMsQ0FBQyxHQUFFLFVBQVMsTUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFRyxPQUFJLENBQUMsR0FBRSxlQUFjQyxLQUFFLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPQSxFQUFDLE1BQUksR0FBRSxPQUFPQyxFQUFDLE1BQUksQ0FBQyxDQUFDLElBQUUsQ0FBQyxHQUFFLGFBQVlDLEtBQUUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9BLEVBQUMsTUFBSSxHQUFFLE9BQU9DLEVBQUMsTUFBSSxDQUFDLENBQUMsSUFBRSxDQUFDLEdBQUUsWUFB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QUFDLENBQUMsSUFBRSxDQUFDLEdBQUUsY0FBYUUsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0MsRUFBQyxNQUFJLENBQUMsQ0FBQyxJQUFFLENBQUMsR0FBRSxNQUFLQyxLQUFFLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPQSxFQUFDLE1BQUksR0FBRSxPQUFPQyxFQUFDLE1BQUksQ0FBQyxDQUFDLElBQUUsQ0FBQyxHQUFFLFNBQVFDLEtBQUUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9BLEVBQUMsTUFBSSxHQUFFLE9BQU9DLEVBQUMsTUFBSSxDQUFDLENBQUMsSUFBRSxDQUFDLEVBQUMsQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNaLElBQUVGLE9BQUk7QUFBQyxVQUFFLEdBQUcsaUJBQWdCRSxJQUFFLEVBQUMsUUFBT0YsS0FBRSxTQUFPLE9BQU0sQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNFLElBQUVGLElBQUVDLElBQUVFLElBQUVDLElBQUVFLElBQUVDLElBQUVFLElBQUVDLElBQUVDLElBQUVDLElBQUVDLElBQUVDLElBQUVDLE9BQUk7QUFBQyxVQUFFLEdBQUcsV0FBVWIsSUFBRSxFQUFDLFFBQU9hLEtBQUUsU0FBTyxRQUFPLFVBQVNmLElBQUUsV0FBVUMsSUFBRSxtQkFBa0JFLElBQUUsZUFBY0MsSUFBRSxXQUFVRSxLQUFFLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPQSxFQUFDLE1BQUksR0FBRSxPQUFPQyxFQUFDLE1BQUksQ0FBQyxDQUFDLElBQUUsQ0FBQyxHQUFFLGNBQWFFLEtBQUUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9BLEVBQUMsTUFBSSxHQUFFLE9BQU9DLEVBQUMsTUFBSSxDQUFDLENBQUMsSUFBRSxDQUFDLEdBQUUsTUFBS0MsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0MsRUFBQyxNQUFJLENBQUMsQ0FBQyxJQUFFLENBQUMsR0FBRSxTQUFRQyxLQUFFLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPQSxFQUFDLE1BQUksR0FBRSxPQUFPQyxFQUFDLE1BQUksQ0FBQyxDQUFDLElBQUUsQ0FBQyxFQUFDLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDWixJQUFFRixJQUFFQyxJQUFFRSxJQUFFQyxPQUFJO0FBQUMsVUFBRSxHQUFHLFFBQU9GLElBQUUsRUFBQyxPQUFNRixJQUFFLE1BQUtDLElBQUUsUUFBT0UsSUFBRSxRQUFPQyxHQUFDLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBRixPQUFHO0FBQUMsVUFBRSxHQUFHLFVBQVNBLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNBLElBQUVGLElBQUVDLElBQUVFLE9BQUk7QUFBQyxVQUFFLEdBQUcsVUFBU0QsSUFBRSxFQUFDLFVBQVMsQ0FBQyxDQUFDRixJQUFFLGlCQUFnQixDQUFDLENBQUNDLElBQUUsTUFBS0UsR0FBQyxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ0QsSUFBRUYsSUFBRUMsSUFBRUUsT0FBSTtBQUFDLFVBQUUsR0FBRyxVQUFTRCxJQUFFLEVBQUMsVUFBUyxDQUFDLENBQUNGLElBQUUsaUJBQWdCLENBQUMsQ0FBQ0MsSUFBRSxNQUFLRSxHQUFDLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDRCxJQUFFRixPQUFJO0FBQUMsVUFBRSxHQUFHLFdBQVVFLElBQUUsRUFBQyxNQUFLRixHQUFDLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDRSxJQUFFRixPQUFJO0FBQUMsVUFBRSxHQUFHLFVBQVNFLElBQUUsRUFBQyxNQUFLRixHQUFDLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDRSxJQUFFRixJQUFFQyxJQUFFRSxJQUFFQyxPQUFJO0FBQUMsVUFBRSxHQUFHLFNBQVFGLElBQUUsRUFBQyxNQUFLRixJQUFFLFlBQVdDLElBQUUsWUFBV0UsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0MsRUFBQyxNQUFJLENBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUYsT0FBRztBQUFDLFVBQUUsR0FBRyxVQUFTQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDQSxJQUFFRixPQUFJO0FBQUMsVUFBRSxHQUFHLFVBQVNFLElBQUUsRUFBQyxNQUFLLE9BQU9GLEVBQUMsRUFBQyxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ0UsSUFBRUYsT0FBSTtBQUFDLFVBQUUsR0FBRyxrQkFBaUJFLElBQUUsRUFBQyxNQUFLLE9BQU9GLEVBQUMsRUFBQyxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ0UsSUFBRUYsT0FBSTtBQUFDLFVBQUUsR0FBRyxZQUFXRSxJQUFFLEVBQUMsWUFBVyxPQUFPRixFQUFDLEVBQUMsQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNFLElBQUVGLElBQUVDLElBQUVFLElBQUVDLElBQUVFLElBQUVDLElBQUVFLElBQUVDLElBQUVDLElBQUVDLE9BQUk7QUFBQyxVQUFFLEdBQUcsVUFBU1YsSUFBRSxFQUFDLFdBQVVGLElBQUUsTUFBS0MsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0UsRUFBQyxNQUFJLENBQUMsQ0FBQyxJQUFFLENBQUMsR0FBRSx5QkFBd0IsR0FBR0MsRUFBQyxHQUFFLGFBQVlFLElBQUUsZ0JBQWVDLElBQUUsb0JBQW1CRSxJQUFFLHVCQUFzQixHQUFHQyxFQUFDLEdBQUUsTUFBSyxHQUFHQyxFQUFDLEdBQUUsYUFBWSxHQUFHQyxFQUFDLEVBQUMsQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNWLElBQUVGLElBQUVDLElBQUVFLElBQUVDLElBQUVFLElBQUVDLE9BQUk7QUFBQyxVQUFFLEdBQUcsU0FBUUwsSUFBRSxFQUFDLFFBQU9GLEtBQUUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9BLEVBQUMsTUFBSSxHQUFFLE9BQU9DLEVBQUMsTUFBSSxDQUFDLENBQUMsSUFBRSxDQUFDLEdBQUUsTUFBS0UsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0MsRUFBQyxNQUFJLENBQUMsQ0FBQyxJQUFFLENBQUMsR0FBRSxNQUFLRSxLQUFFLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPQSxFQUFDLE1BQUksR0FBRSxPQUFPQyxFQUFDLE1BQUksQ0FBQyxDQUFDLElBQUUsQ0FBQyxFQUFDLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBTCxPQUFHO0FBQUMsVUFBRSxHQUFHLFFBQU9BLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNBLElBQUVGLElBQUVDLE9BQUk7QUFBQyxVQUFFLEdBQUcseUJBQXdCQyxJQUFFLEVBQUMsU0FBUUYsSUFBRSxRQUFPQyxLQUFFLFNBQU8sT0FBTSxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ0MsSUFBRUYsSUFBRUMsT0FBSTtBQUFDLFVBQUUsR0FBRyx5QkFBd0JDLElBQUUsRUFBQyxTQUFRRixJQUFFLFFBQU9DLEtBQUUsU0FBTyxPQUFNLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQyxPQUFHO0FBQUMsVUFBRSxHQUFHLFNBQVFBLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNBLElBQUVGLE9BQUk7QUFBQyxVQUFFLEdBQUcsVUFBU0UsSUFBRSxFQUFDLFVBQVMsR0FBR0YsRUFBQyxFQUFDLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDRSxJQUFFRixJQUFFQyxJQUFFRSxJQUFFQyxPQUFJO0FBQUMsVUFBRSxHQUFHLE9BQU1GLElBQUUsRUFBQyxNQUFLRixJQUFFLE9BQU1DLElBQUUsTUFBS0UsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0MsRUFB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QUFFLEtBQUcsQ0FBQ0UsSUFBRUYsT0FBSTtBQUFDLGFBQUcsR0FBRUUsS0FBRSxHQUFHQSxJQUFFRixFQUFDLEdBQUUsSUFBRSxLQUFHLElBQUVFLEtBQUUsR0FBR0EsRUFBQztBQUFBLE1BQUM7QUFBQSxNQUFFLE1BQU0sR0FBRTtBQUFBLFFBQUMsWUFBWUEsSUFBRTtBQUFDLGVBQUssS0FBR0EsS0FBRTtBQUFBLFFBQUU7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHQSxJQUFFRixJQUFFQyxJQUFFO0FBQUMsWUFBSUUsS0FBRSxJQUFJLEdBQUdELFFBQUssQ0FBQztBQUFFLGNBQU1GLFFBQUssR0FBRUMsUUFBSyxHQUFFLEVBQUUsRUFBRUUsR0FBRSxLQUFHLE9BQUssTUFBSSxDQUFDLElBQUUsR0FBRSxFQUFFLEVBQUVBLEdBQUUsS0FBRyxNQUFJLE1BQUksQ0FBQyxJQUFFSCxJQUFFLEVBQUUsRUFBRUcsR0FBRSxLQUFHLE1BQUksTUFBSSxDQUFDLElBQUVGLElBQUVDO0FBQUEsTUFBQztBQUFDLGVBQVMsR0FBR0EsSUFBRUYsSUFBRUMsSUFBRUUsSUFBRTtBQUFDLGVBQU8sSUFBRSxHQUFHLEdBQUUsR0FBRUQsSUFBRUYsSUFBRUMsSUFBRUUsRUFBQyxJQUFFLEdBQUdELElBQUVGLElBQUVDLElBQUVFLEVBQUM7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHRCxJQUFFRixJQUFFQyxJQUFFRSxJQUFFO0FBQUMsWUFBR0QsUUFBSyxHQUFFRCxRQUFLLEdBQUVFLFFBQUssR0FBRSxXQUFTLEVBQUUsUUFBTztBQUFFLFlBQUlFLEtBQUUsQ0FBQztBQUFFLGVBQU8sS0FBRyxNQUFJQSxHQUFFLFNBQU8sR0FBR0gsSUFBRUYsUUFBSyxHQUFFQyxJQUFFRSxFQUFDLEtBQUdELEtBQUUsRUFBQyxJQUFHRCxJQUFFLElBQUdDLElBQUUsSUFBR0MsSUFBRSxJQUFHRSxHQUFDLEdBQUUsS0FBR0gsR0FBRSxLQUFHLGVBQWMsWUFBWUEsSUFBRUcsRUFBQyxHQUFFLEtBQUcsR0FBR0gsRUFBQztBQUFBLE1BQUU7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QUFFLEdBQUVDLElBQUVGLElBQUVDLEVBQUM7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHQyxJQUFFRixJQUFFQyxJQUFFRSxJQUFFO0FBQUMsWUFBRyxFQUFFLFFBQU8sR0FBRyxJQUFHLEdBQUVELElBQUVGLElBQUVDLElBQUVFLEVBQUM7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHRCxJQUFFRixJQUFFQyxJQUFFRSxJQUFFO0FBQUMsWUFBRyxFQUFFLFFBQU8sR0FBRyxJQUFHLEdBQUVELElBQUVGLElBQUVDLElBQUVFLEVBQUM7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHRCxJQUFFRixJQUFFQyxJQUFFRSxJQUFFO0FBQUMsWUFBRyxFQUFFLFFBQU8sR0FBRyxJQUFHLEdBQUVELElBQUVGLElBQUVDLElBQUVFLEVBQUM7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHRCxJQUFFO0FBQUMsWUFBRyxFQUFFLFFBQU8sR0FBRyxJQUFHLEdBQUVBLEVBQUM7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHQSxJQUFFRixJQUFFO0FBQUMsWUFBRyxFQUFFLFFBQU8sR0FBRyxJQUFHLEdBQUVFLElBQUVGLEVBQUM7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHRSxJQUFFRixJQUFFQyxJQUFFO0FBQUMsWUFBRyxFQUFFLFFBQU8sR0FBRyxJQUFHLEdBQUVDLElBQUVGLElBQUVDLEVBQUM7QUFBQSxNQUFDO0FBQUMsVUFBSSxJQUFHLElBQUcsS0FBRyxNQUFJLEVBQUUsRUFBRSxHQUFFLEtBQUcsQ0FBQUMsT0FBRztBQUFDLGlCQUFRRixLQUFFLElBQUcsRUFBRSxFQUFFRSxPQUFJLENBQUMsSUFBRyxDQUFBRixNQUFHLEdBQUcsRUFBRSxFQUFFRSxTQUFNLENBQUMsQ0FBQztBQUFFLGVBQU9GO0FBQUEsTUFBQyxHQUFFLEtBQUcsQ0FBQyxHQUFFLEtBQUcsQ0FBQyxHQUFFLEtBQUcsQ0FBQztBQUFFLGVBQVMsR0FBR0UsSUFBRUYsSUFBRUMsS0FBRSxDQUFDLEdBQUU7QUFBQyxlQUFPLFNBQVNDLElBQUVGLElBQUVD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QztBQUFBLE1BQUM7QUFBQyxlQUFTLEdBQUdBLElBQUVGLElBQUU7QUFBQyxXQUFHRSxRQUFLLEdBQUUsRUFBQyxJQUFHLE1BQUcsTUFBS0YsS0FBRSxHQUFHQSxPQUFJLENBQUMsR0FBRSxJQUFHLEdBQUUsY0FBYSxNQUFJO0FBQUEsUUFBQyxHQUFFLFlBQVcsTUFBSTtBQUFBLFFBQUMsRUFBQyxDQUFDO0FBQUEsTUFBQztBQUFDLGVBQVMsR0FBR0UsSUFBRTtBQUFDLFdBQUdBLE9BQUksR0FBRSxDQUFDLEdBQUUsR0FBRSxDQUFDLEdBQUUsUUFBTyxLQUFFLEdBQUUsR0FBRztBQUFBLE1BQUM7QUFBQyxVQUFJLEtBQUcsQ0FBQUEsT0FBRztBQUFDLFlBQUcsQ0FBQyxFQUFFLEtBQUc7QUFBQyxjQUFHQSxHQUFFLEdBQUUsRUFBRSxJQUFFLElBQUksS0FBRztBQUFDLGdCQUFFLEdBQUcsQ0FBQyxJQUFFLEdBQUcsQ0FBQztBQUFBLFVBQUMsU0FBT0EsSUFBRTtBQUFDLFlBQUFBLGNBQWEsTUFBSSxZQUFVQSxNQUFHLEVBQUUsR0FBRUEsRUFBQztBQUFBLFVBQUM7QUFBQSxRQUFDLFNBQU9BLElBQUU7QUFBQyxVQUFBQSxjQUFhLE1BQUksWUFBVUEsTUFBRyxFQUFFLEdBQUVBLEVBQUM7QUFBQSxRQUFDO0FBQUEsTUFBQztBQUFFLGVBQVMsR0FBR0EsSUFBRTtBQUFDLFFBQUFBLFFBQUssR0FBRSxjQUFZLE9BQU8sUUFBUSxPQUFLLFFBQVEsR0FBRyxFQUFFLEdBQUVBLE9BQUksR0FBRUEsRUFBQyxFQUFFLE1BQU0sS0FBSyxFQUFFLEdBQUVBLE1BQUcsS0FBSSxRQUFRLE1BQU0sRUFBRSxHQUFFQSxPQUFJLEdBQUUsQ0FBQztBQUFBLE1BQUU7QUFBQyxVQUFJLEtBQUcsTUFBSTtBQUFDLFlBQUlBLEtBQUUsR0FBRztBQUFFLFFBQUFBLE9BQUksR0FBR0EsRUFBQyxHQUFFLEdBQUcsRUFBRTtBQUFBLE1BQUU7QUFBRSxlQUFTLEdBQUdBLElBQUVGLElBQUU7QUFBQyxTQUFDRSxRQUFLLE1BQUlGLE9B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SUFBRUYsSUFBRTtBQUFDLFFBQUFFLEtBQUUsb0JBQWtCQSxNQUFHLG1CQUFpQkEsS0FBRSxNQUFJLE9BQU9BLEVBQUMsR0FBRUYsUUFBSyxHQUFFRSxLQUFFLElBQUksS0FBSyxNQUFJQSxFQUFDLEdBQUUsRUFBRSxFQUFFRixPQUFJLE1BQUksQ0FBQyxJQUFFRSxHQUFFLGNBQWMsR0FBRSxFQUFFLEVBQUVGLEtBQUUsTUFBSSxNQUFJLENBQUMsSUFBRUUsR0FBRSxjQUFjLEdBQUUsRUFBRSxFQUFFRixLQUFFLE1BQUksTUFBSSxDQUFDLElBQUVFLEdBQUUsWUFBWSxHQUFFLEVBQUUsRUFBRUYsS0FBRSxPQUFLLE1BQUksQ0FBQyxJQUFFRSxHQUFFLFdBQVcsR0FBRSxFQUFFLEVBQUVGLEtBQUUsT0FBSyxNQUFJLENBQUMsSUFBRUUsR0FBRSxZQUFZLEdBQUUsRUFBRSxFQUFFRixLQUFFLE9BQUssTUFBSSxDQUFDLElBQUVFLEdBQUUsZUFBZSxJQUFFLE1BQUssRUFBRSxFQUFFRixLQUFFLE9BQUssTUFBSSxDQUFDLElBQUVFLEdBQUUsVUFBVSxHQUFFQSxNQUFHQSxHQUFFLFFBQVEsSUFBRSxLQUFLLElBQUlBLEdBQUUsZUFBZSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDLEtBQUcsUUFBTSxHQUFFLEVBQUUsRUFBRUYsS0FBRSxPQUFLLE1BQUksQ0FBQyxJQUFFRTtBQUFBLE1BQUM7QUFBQyxVQUFJLEtBQUcsQ0FBQUEsT0FBRyxLQUFHQSxLQUFFLE1BQUksS0FBR0EsS0FBRSxPQUFLLEtBQUdBLEtBQUUsTUFBSyxLQUFHLENBQUMsR0FBRSxJQUFHLElBQUcsSUFBRyxLQUFJLEtBQUksS0FBSSxLQUFJLEtBQUksS0FBSSxLQUFJLEdBQUcsR0FBRSxLQUFHLENBQUMsR0FBRSxJQUFHLElBQUcsSUFBRyxLQUFJLEtBQUksS0FBSSxLQUFJLEtBQUksS0FBSSxLQUFJLEdBQUc7QUFBRSxlQUFTLEdBQUdBLElBQUVGLElBQUU7QUFBQyxRQUFBRSxLQUFFLG9CQUFrQkEsTUFBRyxtQkFB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QUFJLEdBQUUsS0FBRztBQUFFLGVBQVMsR0FBR0MsSUFBRUYsSUFBRUMsSUFBRTtBQUFDLFlBQUcsRUFBRSxLQUFHQyxNQUFHLEtBQUdBLElBQUcsUUFBTztBQUFHLFlBQUcsTUFBSUEsR0FBRSxDQUFBQSxLQUFFLEtBQUssSUFBSTtBQUFBLGFBQU07QUFBQyxjQUFHLENBQUMsR0FBRyxRQUFPO0FBQUcsVUFBQUEsS0FBRSxZQUFZLGFBQVcsWUFBWSxJQUFJO0FBQUEsUUFBQztBQUFDLGVBQU8sRUFBRUQsT0FBSSxNQUFJLENBQUMsSUFBRSxPQUFPLEtBQUssTUFBTSxNQUFJQyxFQUFDLENBQUMsR0FBRTtBQUFBLE1BQUM7QUFBQyxVQUFJLEtBQUcsQ0FBQyxHQUFFLEtBQUcsQ0FBQ0EsSUFBRUYsT0FBSTtBQUFDLFdBQUcsU0FBTztBQUFFLGlCQUFRQyxJQUFFQSxLQUFFLEVBQUUsRUFBRUMsU0FBTSxDQUFDLEtBQUc7QUFBQyxjQUFJQyxLQUFFLE9BQUtGO0FBQUUsVUFBQUQsT0FBSUcsTUFBRyxPQUFLRixPQUFJRCxLQUFFLElBQUUsSUFBRSxHQUFFLEdBQUcsS0FBSyxPQUFLQyxLQUFFLEVBQUUsRUFBRUQsT0FBSSxNQUFJLENBQUMsSUFBRSxPQUFLQyxLQUFFLEVBQUVELE9BQUksQ0FBQyxJQUFFLE9BQUtDLEtBQUUsRUFBRSxFQUFFRCxPQUFJLE1BQUksQ0FBQyxJQUFFLEVBQUUsRUFBRUEsT0FBSSxNQUFJLENBQUMsQ0FBQyxHQUFFQSxNQUFHRyxLQUFFLElBQUU7QUFBQSxRQUFDO0FBQUMsZUFBTztBQUFBLE1BQUU7QUFBRSxlQUFTLEdBQUdELElBQUVGLElBQUVDLElBQUU7QUFBQyxlQUFPQyxRQUFLLEdBQUVGLEtBQUUsR0FBR0EsT0FBSSxHQUFFQyxPQUFJLENBQUMsR0FBRSxHQUFHQyxFQUFDLEVBQUUsR0FBR0YsRUFBQztBQUFBLE1BQUM7QUFBQyxlQUFTLEdBQUdFLElBQUVGLElBQUVDLElBQUU7QUFBQyxlQUFPQyxRQUFLLEdBQUVGLEtBQUUsR0FBR0EsT0FBSSxHQUFFQyxPQUFJ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QUFPLENBQUUsR0FBRSxFQUFFLEVBQUVGLE9BQUksTUFBSSxDQUFDLElBQUVHLElBQUU7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHRCxJQUFFO0FBQUMsZUFBTyxJQUFFLEdBQUcsSUFBRyxHQUFFQSxFQUFDLElBQUU7QUFBQSxNQUFFO0FBQUMsZUFBUyxHQUFHQSxJQUFFRixJQUFFQyxJQUFFRSxJQUFFO0FBQUMsZUFBTyxJQUFFLEdBQUcsSUFBRyxHQUFFRCxJQUFFRixJQUFFQyxJQUFFRSxFQUFDLElBQUU7QUFBQSxNQUFFO0FBQUMsZUFBUyxHQUFHRCxJQUFFRixJQUFFQyxJQUFFRSxJQUFFO0FBQUMsZUFBTyxJQUFFLEdBQUcsSUFBRyxHQUFFRCxJQUFFRixJQUFFQyxJQUFFRSxFQUFDLElBQUU7QUFBQSxNQUFFO0FBQUMsVUFBSSxLQUFHLENBQUMsTUFBSyxDQUFDLEdBQUUsQ0FBQyxDQUFDO0FBQUUsZUFBUyxHQUFHRCxJQUFFRixJQUFFQyxJQUFFRSxJQUFFO0FBQUMsWUFBRyxFQUFFLFFBQU8sR0FBRyxJQUFHLEdBQUVELElBQUVGLElBQUVDLElBQUVFLEVBQUM7QUFBRSxRQUFBSCxRQUFLLEdBQUVDLFFBQUssR0FBRUUsUUFBSztBQUFFLGlCQUFRRSxLQUFFLEdBQUVELEtBQUUsR0FBRUEsS0FBRUgsSUFBRUcsTUFBSTtBQUFDLGNBQUlFLEtBQUUsRUFBRSxFQUFFTixPQUFJLE1BQUksQ0FBQyxHQUFFTyxLQUFFLEVBQUUsRUFBRVAsS0FBRSxNQUFJLE1BQUksQ0FBQztBQUFFLFVBQUFBLE1BQUc7QUFBRSxtQkFBUVUsS0FBRSxHQUFFQSxLQUFFSCxJQUFFRyxNQUFJO0FBQUMsZ0JBQUlDLEtBQUUsRUFBRSxFQUFFTCxLQUFFSSxPQUFJLENBQUMsR0FBRUUsS0FBRSxHQUFHVixFQUFDO0FBQUUsa0JBQUlTLE1BQUcsT0FBS0EsT0FBSSxNQUFJVCxLQUFFLElBQUUsR0FBRyxHQUFHVSxFQUFDLENBQUMsR0FBRUEsR0FBRSxTQUFPLEtBQUdBLEdBQUUsS0FBS0QsRUFBQztBQUFBLFVBQUM7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RUMsUUFBSyxFQUFFLGNBQVksR0FBRyxJQUFJQyxJQUFFRixJQUFFQyxFQUFDLEdBQUUsRUFBRSxtQkFBaUIsQ0FBQUMsUUFBSSxFQUFFLG1CQUFpQixHQUFHLElBQUlBLEVBQUM7QUFBRSxVQUFJLEtBQUcsT0FBSyxLQUFHLEdBQUcsSUFBSSxHQUFFLEtBQUcsRUFBRSxRQUFNLENBQUFBLFFBQUksS0FBRyxFQUFFLFFBQU0sR0FBRyxJQUFJQSxFQUFDLEdBQUUsS0FBRyxFQUFFLFVBQVEsQ0FBQUEsUUFBSSxLQUFHLEVBQUUsVUFBUSxHQUFHLElBQUlBLEVBQUMsR0FBRSxLQUFHLENBQUNBLElBQUVGLElBQUVDLElBQUVFLElBQUVFLElBQUVELFFBQUssS0FBRyxHQUFHLElBQUlGLElBQUVGLElBQUVDLElBQUVFLElBQUVFLElBQUVELEVBQUMsR0FBRSxLQUFHLE9BQUssS0FBRyxHQUFHLElBQUksR0FBRSxLQUFHLENBQUNGLElBQUVGLElBQUVDLElBQUVFLElBQUVFLFFBQUssS0FBRyxHQUFHLElBQUlILElBQUVGLElBQUVDLElBQUVFLElBQUVFLEVBQUMsR0FBRSxLQUFHLENBQUFILFFBQUksS0FBRyxHQUFHLElBQUlBLEVBQUMsR0FBRSxLQUFHLENBQUFBLFFBQUksS0FBRyxHQUFHLElBQUlBLEVBQUMsR0FBRSxLQUFHLENBQUNBLElBQUVGLFFBQUssS0FBRyxHQUFHLElBQUlFLElBQUVGLEVBQUMsR0FBRSxLQUFHLE9BQUssS0FBRyxHQUFHLElBQUksR0FBRSxLQUFHLENBQUNFLElBQUVGLFFBQUssS0FBRyxHQUFHLElBQUlFLElBQUVGLEVBQUMsR0FBRSxLQUFHLENBQUFFLFFBQUksS0FBRyxHQUFHLElBQUlBLEVBQUMsR0FBRSxLQUFHLENBQUFBLFFBQUksS0FBRyxHQUFHLElBQUlBLEVBQUMsR0FBRSxLQUFHLE9BQUssS0FBRyxHQUFHLElBQUksR0FBRSxLQUFHLEVBQUUsYUFBVyxDQUFDQSxJQUFFRixRQUFLLEtBQUcsRUFBRSxhQUFXLEdBQUcsSUFBSUUsSUFBRUYsRUFBQyxHQUFFLEtB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YSxlQUFjQSxHQUFFLEtBQUssSUFBSSxHQUFFLElBQUksV0FBV0EsR0FBRSxRQUFRO0FBQUEsTUFBQyxJQUFHLElBQUUsT0FBTUQsT0FBRztBQUFDLFlBQUcsRUFBRUEsRUFBQyxFQUFFLFFBQU8sSUFBSSxRQUFTLENBQUNDLElBQUVDLE9BQUk7QUFBQyxjQUFJQyxLQUFFLElBQUk7QUFBZSxVQUFBQSxHQUFFLEtBQUssT0FBTUgsSUFBRSxJQUFFLEdBQUVHLEdBQUUsZUFBYSxlQUFjQSxHQUFFLFNBQU8sTUFBSTtBQUFDLG1CQUFLQSxHQUFFLFVBQVEsS0FBR0EsR0FBRSxVQUFRQSxHQUFFLFdBQVNGLEdBQUVFLEdBQUUsUUFBUSxJQUFFRCxHQUFFQyxHQUFFLE1BQU07QUFBQSxVQUFDLEdBQUVBLEdBQUUsVUFBUUQsSUFBRUMsR0FBRSxLQUFLLElBQUk7QUFBQSxRQUFDLENBQUU7QUFBRSxZQUFJRixLQUFFLE1BQU0sTUFBTUQsSUFBRSxFQUFDLGFBQVksY0FBYSxDQUFDO0FBQUUsWUFBR0MsR0FBRSxHQUFHLFFBQU9BLEdBQUUsWUFBWTtBQUFFLGNBQU0sTUFBTUEsR0FBRSxTQUFPLFFBQU1BLEdBQUUsR0FBRztBQUFBLE1BQUM7QUFBRyxVQUFJLElBQUUsUUFBUSxJQUFJLEtBQUssT0FBTyxHQUFFLElBQUUsUUFBUSxNQUFNLEtBQUssT0FBTyxHQUFFLElBQUUsR0FBRSxJQUFFO0FBQUUsYUFBTyxPQUFPLEdBQUUsQ0FBQyxHQUFFLElBQUU7QUFBSyxVQUFJLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxJQUFFLEVBQUUsWUFBVyxJQUFFLE9BQUcsSUFBRSxDQUFBRCxPQUFHQSxHQUFFLFdBQVcsU0FBUztBQUFFLGVBQVMsSUFBRztBQUFDLGVBQU8sRUFBRSxVQUFRLEVBQUUsVUFBUSxFQUFFLEdBQUU7QUFBQSxNQUFDO0FBQUMsZUFBUyxJQUFHO0FBQUMsZUFBTyxFQUFFLFVBQVEsRUFBRSxVQUFRLEVBQUUsR0FBRTtBQUFBLE1BQUM7QUFB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U0FBTyxJQUFFLElBQUksV0FBV0EsRUFBQyxHQUFFLEVBQUUsVUFBUSxJQUFFLElBQUksWUFBWUEsRUFBQyxHQUFFLEVBQUUsVUFBUSxJQUFFLElBQUksYUFBYUEsRUFBQyxHQUFFLEVBQUUsVUFBUSxJQUFFLElBQUksYUFBYUEsRUFBQyxHQUFFLEVBQUUsU0FBTyxJQUFFLElBQUksY0FBY0EsRUFBQyxHQUFFLEVBQUUsVUFBUSxJQUFJLGVBQWVBLEVBQUM7QUFBQSxNQUFDO0FBQUMsZUFBUyxJQUFHO0FBQUMsWUFBRSxZQUFZLENBQUMsSUFBRSxHQUFHLEVBQUU7QUFBQSxNQUFDO0FBQUMsWUFBSSxJQUFFLElBQUksWUFBWSxPQUFPLEVBQUMsU0FBUSxLQUFJLFNBQVEsT0FBTSxRQUFPLEtBQUUsQ0FBQyxHQUFFLEVBQUU7QUFBRyxVQUFJLEdBQUUsSUFBRSxHQUFFLElBQUU7QUFBSyxlQUFTLElBQUc7QUFBQyxZQUFHLEtBQUcsRUFBRSxLQUFHLEdBQUU7QUFBQyxjQUFJQSxLQUFFO0FBQUUsY0FBRSxNQUFLQSxHQUFFO0FBQUEsUUFBQztBQUFBLE1BQUM7QUFBQyxlQUFTLEVBQUVBLElBQUU7QUFBQyxjQUFNLEVBQUVBLEtBQUUsYUFBV0EsS0FBRSxHQUFHLEdBQUUsSUFBRSxNQUFHQSxLQUFFLElBQUksWUFBWSxhQUFhQSxLQUFFLDBDQUEwQyxHQUFFLEVBQUVBLEVBQUMsR0FBRUE7QUFBQSxNQUFDO0FBQUMsZUFBUyxJQUFHO0FBQUMsZUFBTSxFQUFDLEdBQUUsRUFBQyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFB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RSxJQUFFRSxLQUFFLE1BQUksQ0FBQyxJQUFFQztBQUFBLFFBQUU7QUFBQyxlQUFPVCxLQUFFLEdBQUdBLElBQUUsR0FBRUcsSUFBRUUsSUFBRUosRUFBQyxHQUFFLEdBQUdNLEVBQUMsR0FBRVA7QUFBQSxNQUFDO0FBQUUsZUFBUyxHQUFHQSxJQUFFO0FBQUMsWUFBRyxFQUFFLFFBQU8sR0FBRyxHQUFFLEdBQUVBLEVBQUM7QUFBRSxZQUFHLElBQUVBLElBQUUsRUFBRSxJQUFFLEtBQUk7QUFBQyxtQkFBUUMsTUFBSyxHQUFHLEdBQUVBLEVBQUM7QUFBRSxlQUFJQSxNQUFLLEdBQUcsR0FBRUEsRUFBQztBQUFFLGVBQUcsQ0FBQyxHQUFFLEtBQUcsQ0FBQyxHQUFFLEtBQUcsQ0FBQyxHQUFFLElBQUU7QUFBQSxRQUFFO0FBQUMsVUFBRSxHQUFFLElBQUksRUFBRUQsRUFBQyxDQUFDO0FBQUEsTUFBQztBQUFDLGVBQVMsR0FBR0EsSUFBRTtBQUFDLFlBQUcsRUFBRSxRQUFPLEdBQUcsR0FBRSxHQUFFQSxFQUFDO0FBQUUsV0FBR0EsRUFBQztBQUFBLE1BQUM7QUFBQyxVQUFJLEtBQUcsQ0FBQUEsT0FBRztBQUFDLFlBQUcsSUFBRUEsSUFBRSxFQUFFLE9BQU0sR0FBR0EsRUFBQyxHQUFFO0FBQVMsV0FBR0EsRUFBQztBQUFBLE1BQUMsR0FBRSxLQUFHLENBQUMsR0FBRSxLQUFHLENBQUMsR0FBRSxLQUFHLENBQUMsR0FBRSxLQUFHLENBQUMsR0FBRSxLQUFHLENBQUFBLE9BQUc7QUFBQyxZQUFJQyxLQUFFRCxHQUFFO0FBQUcsZUFBTyxHQUFHQyxFQUFDLEdBQUUsR0FBRyxLQUFLRCxFQUFDLEdBQUUsR0FBRyxPQUFPLEdBQUcsUUFBUUEsRUFBQyxHQUFFLENBQUMsR0FBRUEsR0FBRSxLQUFHLEdBQUUsR0FBR0MsRUFBQztBQUFBLE1BQUM7QUFBRSxlQUFTLEtBQUk7QUFBQyxXQUFHLFFBQVMsQ0FBQUQsT0FBR0EsR0FBRSxDQUFFO0FBQUEsTUFBQztBQUFDLFVBQUksS0FBRyxDQUFBQSxPQUFHLElB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QUVDLElBQUVDLElBQUU7QUFBQyxZQUFHLEVBQUUsUUFBTyxHQUFHLEdBQUUsR0FBRUYsSUFBRUMsSUFBRUMsRUFBQztBQUFBLE1BQUM7QUFBQyxlQUFTLEdBQUdGLElBQUVDLElBQUVDLElBQUU7QUFBQyxlQUFPLElBQUUsR0FBRyxHQUFFLEdBQUVGLElBQUVDLElBQUVDLEVBQUMsSUFBRTtBQUFBLE1BQUM7QUFBQyxlQUFTLEdBQUdGLElBQUVDLElBQUU7QUFBQyxZQUFHLEVBQUUsUUFBTyxHQUFHLEdBQUUsR0FBRUQsSUFBRUMsRUFBQztBQUFBLE1BQUM7QUFBQyxlQUFTLEdBQUdELElBQUVDLElBQUVDLElBQUU7QUFBQyxZQUFHLEVBQUUsUUFBTyxHQUFHLEdBQUUsR0FBRUYsSUFBRUMsSUFBRUMsRUFBQztBQUFBLE1BQUM7QUFBQyxlQUFTLEdBQUdGLElBQUVDLElBQUVDLElBQUVDLElBQUU7QUFBQyxZQUFHLEVBQUUsUUFBTyxHQUFHLElBQUcsR0FBRUgsSUFBRUMsSUFBRUMsSUFBRUMsRUFBQztBQUFBLE1BQUM7QUFBQyxlQUFTLEdBQUdILElBQUVDLElBQUVDLElBQUVDLElBQUU7QUFBQyxZQUFHLEVBQUUsUUFBTyxHQUFHLElBQUcsR0FBRUgsSUFBRUMsSUFBRUMsSUFBRUMsRUFBQztBQUFBLE1BQUM7QUFBQyxlQUFTLEdBQUdILElBQUVDLElBQUVDLElBQUVDLElBQUU7QUFBQyxZQUFHLEVBQUUsUUFBTyxHQUFHLElBQUcsR0FBRUgsSUFBRUMsSUFBRUMsSUFBRUMsRUFBQztBQUFBLE1BQUM7QUFBQyxlQUFTLEdBQUdILElBQUU7QUFBQyxZQUFHLEVBQUUsUUFBTyxHQUFHLElBQUcsR0FBRUEsRUFBQztBQUFBLE1BQUM7QUFBQyxlQUFTLEdBQUdBLElBQUVDLElBQUU7QUFBQyxZQUFHLEVBQUUsUUFBTyxHQUFHLElBQUcsR0FBRUQsSUFBRUMsRUFBQztBQUFBLE1BQUM7QUFBQyxlQUFTLEdBQUdELElBQUVDLElBQUVDLElBQUU7QUFBQyxZQUFHLEVBQUUsUUFBTyxHQUFHLElBQUcsR0FBRUYsSUFBRUMsSUFBRUMsRUFBQztBQUFBLE1BQUM7QUFBQyxVQUFJLEtBQUcsTUFBSSxFQUFFLEVBQUU7QUFBRSxlQUFTLEdBQUdGLElBQUU7QUFBQyxXQUFHQSxPQUFJLEdBQUUsQ0FBQyxHQUFFLEdBQUUsQ0FBQyxHQUFFLFFBQU8sS0FBRSxHQUFFLEdBQUc7QUFBQSxNQUFDO0FBQUMsVUFBSSxLQUFHLENBQUFBLE9BQUc7QUFBQyxZQUFHLENBQUMsRUFBRSxLQUFHO0FBQUMsY0FBR0EsR0FBRSxHQUFFLEVBQUUsSUFBRSxJQUFJLEtBQUc7QUFBQyxnQkFBRSxHQUFHLENBQUMsSUFBRSxHQUFHLENBQUM7QUFBQSxVQUFDLFNBQU9BLElBQUU7QUFBQyxZQUFBQSxjQUFhLEtBQUcsWUFBVUEsTUFBRyxFQUFFLEdBQUVBLEVBQUM7QUFBQSxVQUFDO0FBQUEsUUFBQyxTQUFPQSxJQUFFO0FBQUMsVUFBQUEsY0FBYSxLQUFHLFlBQVVBLE1BQUcsRUFBRSxHQUFFQSxFQUFDO0FBQUEsUUFBQztBQUFBLE1BQUM7QUFBRSxlQUFTLEdBQUdBLElBQUU7QUFBQyxRQUFBQSxRQUFLLEdBQUUsY0FBWSxPQUFPLFFBQVEsT0FBSyxRQUFRLEdBQUcsRUFBRSxHQUFFQSxPQUFJLEdBQUVBLEVBQUMsRUFBRSxNQUFNLEtBQUssRUFBRSxHQUFFQSxNQUFHLEtBQUksUUFBUSxNQUFNLEVBQUUsR0FBRUEsT0FBSSxHQUFFLENBQUM7QUFBQSxNQUFFO0FBQUMsVUFBSSxLQUFHLE1BQUk7QUFBQyxZQUFJQSxLQUFFLEdBQUc7QUFBRSxRQUFBQSxPQUFJLEdBQUdBLEVBQUMsR0FBRSxHQUFHLEVBQUU7QUFBQSxNQUFFO0FBQUUsZUFBUyxHQUFHQSxJQUFFQyxJQUFFO0FBQUMsU0FBQ0QsUUFBSyxNQUFJQyxPQUFJLElBQUUsV0FBVyxFQUFFLElBQUUsSUFBRSxZQUFZLEVBQUMsSUFBR0QsSUFBRSxJQUFHLGVBQWMsQ0FBQyxLQUFHQSxLQUFFLEdBQUdBLEVBQUMsTUFBSUEsR0FBRSxZQUFZLEVBQUMsSUFBRyxlQUFjLENBQUM7QUFBQSxNQUFDO0FBQUMsVUFBSSxLQUFHLENBQUM7QUFBRSxlQUFTLEdBQUdBLElBQUVDLElBQUVDLElBQUVDLElBQUVJLElBQUU7QUFBQyxhQUFJTixRQUFLLEdBQUVFLE1BQUcsR0FBRSxHQUFHLFNBQU9BLElBQUVELEtBQUVLLE9BQUksTUFBSSxHQUFFQSxLQUFFLEdBQUVBLEtBQUVKLElBQUVJLEtBQUksSUFBR0EsRUFBQyxJQUFFLEVBQUVMLEtBQUUsSUFBRUssRUFBQyxJQUFFLEVBQUVMLEtBQUUsSUFBRUssS0FBRSxDQUFDLElBQUUsRUFBRSxFQUFFTCxLQUFFLElBQUVLLEtBQUUsTUFBSSxDQUFDO0FBQUUsZ0JBQU9OLEtBQUUsRUFBRUEsRUFBQyxJQUFFLEdBQUdELEVBQUMsR0FBRyxHQUFHLEVBQUU7QUFBQSxNQUFDO0FBQUMsVUFBSSxLQUFHLE1BQUk7QUFBQyxhQUFHO0FBQUEsTUFBQztBQUFFLGVBQVMsR0FBR0EsSUFBRTtBQUFDLFFBQUFBLFFBQUssR0FBRSxJQUFFLFlBQVksRUFBQyxJQUFHLGlCQUFnQixJQUFHQSxHQUFDLENBQUMsSUFBRSxHQUFHLEdBQUdBLEVBQUMsQ0FBQztBQUFBLE1BQUM7QUFBQyxlQUFTLEdBQUdBLElBQUU7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHQSxJQUFFQyxJQUFFO0FBQUMsUUFBQUQsS0FBRSxvQkFBa0JBLE1BQUcsbUJBQWlCQSxLQUFFLE1BQUksT0FBT0EsRUFBQyxHQUFFQyxRQUFLLEdBQUVELEtBQUUsSUFBSSxLQUFLLE1BQUlBLEVBQUMsR0FBRSxFQUFFLEVBQUVDLE9BQUksTUFBSSxDQUFDLElBQUVELEdBQUUsY0FBYyxHQUFFLEVBQUUsRUFBRUMsS0FBRSxNQUFJLE1BQUksQ0FBQyxJQUFFRCxHQUFFLGNBQWMsR0FBRSxFQUFFLEVBQUVDLEtBQUUsTUFBSSxNQUFJLENBQUMsSUFBRUQsR0FBRSxZQUFZLEdBQUUsRUFBRSxFQUFFQyxLQUFFLE9BQUssTUFBSSxDQUFDLElBQUVELEdBQUUsV0FBVyxHQUFFLEVBQUUsRUFBRUMsS0FBRSxPQUFLLE1BQUksQ0FBQyxJQUFFRCxHQUFFLFlBQVksR0FBRSxFQUFFLEVBQUVDLEtBQUUsT0FBSyxNQUFJLENBQUMsSUFBRUQsR0FBRSxlQUFlLElBQUUsTUFBSyxFQUFFLEVBQUVDLEtBQUUsT0FBSyxNQUFJLENBQUMsSUFBRUQsR0FBRSxVQUFVLEdBQUVBLE1BQUdBLEdBQUUsUUFBUSxJQUFFLEtBQUssSUFBSUEsR0FBRSxlQUFlLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLENBQUMsS0FBRyxRQUFNLEdBQUUsRUFBRSxFQUFFQyxLQUFFLE9BQUssTUFBSSxDQUFDLElBQUVEO0FBQUEsTUFBQztBQUFDLFVBQUksS0FBRyxDQUFBQSxPQUFHLEtBQUdBLEtBQUUsTUFBSSxLQUFHQSxLQUFFLE9BQUssS0FBR0EsS0FBRSxNQUFLLEtBQUcsQ0FBQyxHQUFFLElBQUcsSUFBRyxJQUFHLEtBQUksS0FBSSxLQUFJLEtBQUksS0FBSSxLQUFJLEtBQUksR0FBRyxHQUFFLEtBQUcsQ0FBQyxHQUFFLElBQUcsSUFBRyxJQUFHLEtBQUksS0FBSSxLQUFJLEtBQUksS0FBSSxLQUFJLEtBQUksR0FBRztBQUFFLGVBQVMsR0FBR0EsSUFBRUMsSUFBRTtBQUFDLFFBQUFELEtBQUUsb0JBQWtCQSxNQUFHLG1CQUFpQkEsS0FBRSxNQUFJLE9BQU9BLEVBQUMsR0FBRUMsUUFBSyxHQUFFRCxLQUFFLElBQUksS0FBSyxNQUFJQSxFQUFDLEdBQUUsRUFBRSxFQUFFQyxPQUFJLE1BQUksQ0FBQyxJQUFFRCxHQUFFLFdBQVcsR0FBRSxFQUFFLEVBQUVDLEtBQUUsTUFBSSxNQUFJLENBQUMsSUFBRUQsR0FBRSxXQUFXLEdBQUUsRUFBRSxFQUFFQyxLQUFFLE1BQUksTUFBSSxDQUFDLElBQUVELEdBQUUsU0FBUyxHQUFFLEVBQUUsRUFBRUMsS0FBRSxPQUFLLE1BQUksQ0FBQyxJQUFFRCxHQUFFLFFBQVEsR0FBRSxFQUFFLEVBQUVDLEtBQUUsT0FBSyxNQUFJLENBQUMsSUFBRUQsR0FBRSxTQUFTLEdBQUUsRUFBRSxFQUFF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SUFBSUEsRUFBQyxHQUFFLEVBQUUscUJBQW1CLENBQUNBLElBQUVDLElBQUVDLElBQUVDLElBQUVFLFFBQUssRUFBRSxxQkFBbUIsR0FBRyxJQUFJTCxJQUFFQyxJQUFFQyxJQUFFQyxJQUFFRSxFQUFDLEdBQUUsRUFBRSxVQUFRLENBQUNMLElBQUVDLElBQUVDLElBQUVDLElBQUVFLElBQUVDLElBQUVFLElBQUVDLFFBQUssRUFBRSxVQUFRLEdBQUcsSUFBSVQsSUFBRUMsSUFBRUMsSUFBRUMsSUFBRUUsSUFBRUMsSUFBRUUsSUFBRUMsRUFBQyxHQUFFLEVBQUUsbUJBQWlCLENBQUFULFFBQUksRUFBRSxtQkFBaUIsR0FBRyxJQUFJQSxFQUFDO0FBQUUsVUFBSSxLQUFHLE9BQUssS0FBRyxHQUFHLElBQUk7QUFBRSxRQUFFLFFBQU0sQ0FBQUEsUUFBSSxFQUFFLFFBQU0sR0FBRyxJQUFJQSxFQUFDLEdBQUUsRUFBRSxVQUFRLENBQUFBLFFBQUksRUFBRSxVQUFRLEdBQUcsSUFBSUEsRUFBQztBQUFFLFVBQUksS0FBRyxDQUFDQSxJQUFFQyxJQUFFQyxJQUFFQyxJQUFFSSxJQUFFRixRQUFLLEtBQUcsR0FBRyxJQUFJTCxJQUFFQyxJQUFFQyxJQUFFQyxJQUFFSSxJQUFFRixFQUFDLEdBQUUsS0FBRyxPQUFLLEtBQUcsR0FBRyxJQUFJLEdBQUUsS0FBRyxDQUFDTCxJQUFFQyxJQUFFQyxJQUFFQyxJQUFFSSxRQUFLLEtBQUcsR0FBRyxJQUFJUCxJQUFFQyxJQUFFQyxJQUFFQyxJQUFFSSxFQUFDLEdBQUUsS0FBRyxDQUFBUCxRQUFJLEtBQUcsR0FBRyxJQUFJQSxFQUFDLEdBQUUsS0FBRyxDQUFBQSxRQUFJLEtBQUcsR0FBRyxJQUFJQSxFQUFDLEdBQUUsS0FBRyxDQUFDQSxJQUFFQyxRQUFLLEtBQUcsR0FBRyxJQUFJRCxJQUFFQyxFQUFDLEdBQUUsS0FBRyxPQUFLLEtBQUcsR0FBRyxJQUFJLEdBQUUsS0FBRyxDQUFDRCxJQUFFQyxRQUFLLEtBQUcsR0FBRyxJQUFJRCxJQUFFQyxFQUFDLEdBQUUsS0FBRyxDQUFBRCxRQUFJLEtBQUcsR0FBRyxJQUFJQSxFQUFDLEdBQUUsS0FBRyxDQUFBQSxRQUFJLEtBQUcsR0FBRyxJQUFJQSxFQUFDLEdBQUUsS0FBRyxPQUFLLEtBQUcsR0FBRyxJQUFJO0FBQUUsYUFBTyxFQUFFLFlBQVUsTUFBSSxHQUFHLEdBQUUsRUFBRSxlQUFhLENBQUFBLE9BQUcsR0FBR0EsRUFBQyxHQUFFLEVBQUUsYUFBVyxDQUFBQSxPQUFHLEdBQUdBLEVBQUMsR0FBRSxFQUFFLFdBQVMsU0FBU0EsSUFBRUMsSUFBRUMsS0FBRSxNQUFLO0FBQUMsZ0JBQU9BLEdBQUUsU0FBUyxHQUFHLE1BQUlBLEtBQUUsTUFBS0EsSUFBRTtBQUFBLFVBQUMsS0FBSTtBQUFBLFVBQUssS0FBSTtBQUFLLGNBQUUsRUFBRUYsT0FBSSxDQUFDLElBQUVDO0FBQUU7QUFBQSxVQUFNLEtBQUk7QUFBTSxjQUFFLEVBQUVELE9BQUksTUFBSSxDQUFDLElBQUVDO0FBQUU7QUFBQSxVQUFNLEtBQUk7QUFBTSxjQUFFLEVBQUVELE9BQUksTUFBSSxDQUFDLElBQUVDO0FBQUU7QUFBQSxVQUFNLEtBQUk7QUFBTSxjQUFFRCxPQUFJLENBQUMsSUFBRSxPQUFPQyxFQUFDO0FBQUU7QUFBQSxVQUFNLEtBQUk7QUFBUSxjQUFFLEVBQUVELE9BQUksTUFBSSxDQUFDLElBQUVDO0FBQUU7QUFBQSxVQUFNLEtBQUk7QUFBUyxjQUFFLEVBQUVELE9BQUksTUFBSSxDQUFDLElBQUVDO0FBQUU7QUFBQSxVQUFNLEtBQUk7QUFBSSxjQUFFLEVBQUVELE9BQUksTUFBSSxDQUFDLElBQUVDO0FBQUU7QUFBQSxVQUFNO0FBQVEsY0FBRSw4QkFBOEJDLEVBQUMsRUFBRTtBQUFBLFFBQUM7QUFBQSxNQUFDLEdBQUUsRUFBRSxXQUFTLFNBQVNGLElBQUVDLEtBQUUsTUFBSztBQUFDLGdCQUFPQSxHQUFFLFNBQVMsR0FBRyxNQUFJQSxLQUFFLE1BQUtBLElBQUU7QUFBQSxVQUFDLEtBQUk7QUFBQSxVQUFLLEtBQUk7QUFBSyxtQkFBTyxF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Z0JBQWdCLEtBQTRCO0FBQ2xELGtCQUFnQixTQUFTLGVBQWUsR0FBRztBQUM3QztBQUVBLElBQUksTUFBMEI7QUFDNUIsUUFBTUMsZUFBYywwREFBMEI7QUFDOUMsTUFBSSxPQUEwQjtBQUM1QixvQkFBZ0IsVUFBVUEsY0FBYSxDQUFDO0FBQ3hDLG9CQUFnQixTQUFTQSxjQUFhLENBQUM7QUFBQSxFQUN6QztBQUNBLGtCQUFnQixPQUFPQSxjQUFhLEVBQUU7QUFDdEMsa0JBQWdCLFFBQVFBLGNBQWEsRUFBRTtBQUN6QztBQUVBLE9BQU8sZUFBZUMsS0FBSSxVQUFVLE9BQU8sRUFBRSxPQUFPQyxVQUFTLFlBQVksS0FBSyxDQUFDOyIsCiAgIm5hbWVzIjogWyJpIiwgImUiLCAiZW52IiwgIkZsb2F0MTZBcnJheSIsICJUZW5zb3IiLCAiVGVuc29yIiwgIkluZmVyZW5jZVNlc3Npb24iLCAiSW5mZXJlbmNlU2Vzc2lvbiIsICJUZW5zb3IiLCAiZW52IiwgImUiLCAidCIsICJyIiwgIm4iLCAibyIsICJhIiwgImkiLCAidSIsICJSbiIsICJzIiwgImYiLCAiYiIsICJtIiwgImwiLCAiYyIsICJkIiwgInAiLCAieSIsICJlIiwgInIiLCAidCIsICJuIiwgIkhyIiwgImkiLCAibyIsICJhIiwgInMiLCAidSIsICJmIiwgImMiLCAibCIsICJlIiwgIndhc20iLCAid2FzbSIsICJlIiwgIndhc20iLCAiZSIsICJsb2NhdGlvbiIsICJlIiwgImVudiIsICJ3YXNtIiwgImxvY2F0aW9uIiwgImUiLCAiaW5kZXgiLCAidGVuc29yIiwgImVycm9yQ29kZSIsICJpIiwgInQiLCAiaW5pdGlhbGl6aW5nIiwgImluaXRpYWxpemVkIiwgImFib3J0ZWQiLCAiY29weUZyb21FeHRlcm5hbEJ1ZmZlciIsICJjcmVhdGVTZXNzaW9uIiwgInJlbGVhc2VTZXNzaW9uIiwgInJ1biIsICJlbmRQcm9maWxpbmciLCAiZW52IiwgImluZmVyV2FzbVBhdGhQcmVmaXhGcm9tU2NyaXB0U3JjIiwgImlzRXNtSW1wb3J0TWV0YVVybEhhcmRjb2RlZEFzRmlsZVVyaSIsICJlIiwgInQiLCAiVGVuc29yIiwgImNvcHlGcm9tRXh0ZXJuYWxCdWZmZXIiLCAiY3JlYXRlU2Vzc2lvbiIsICJyZWxlYXNlU2Vzc2lvbiIsICJ0IiwgInJ1biIsICJlbmRQcm9maWxpbmciLCAiZW52IiwgInZlcnNpb24iLCAid2FzbUJhY2tlbmQiLCAiZW52IiwgInZlcnNpb24iXQp9Cg==
