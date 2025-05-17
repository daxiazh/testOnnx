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
        return { a: { b: be, D: ye, d: Me, j: Ce, z: Se, B: ke, p: De, T: Re, M: Ue, S: xe, i: Pe, A: Fe, x: Be, U: We, y: Ne, q: Le, P: Ie, s: Ye, E: ze, n: Ve, g: Qe, O: He, l: Xe, H: qe, I: er, J: rr, F: tr, G: nr, o: or, L: sr, K: cr, V: dr, h: gr, t: ur, k: mr, u: hr, c: ir, v: vr, r: pr, Q: yr, R: _r, C: ie, e: Tr, f: Ar, N: Mr, w: Er, a: b, m: ne } };
      }
      var q = { 122932: (e3, r4, t4, n2, i2) => {
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
var origin, isEsmImportMetaUrlHardcodedAsFileUri, getScriptSrc, scriptSrc, inferWasmPathPrefixFromScriptSrc, isSameOrigin, normalizeUrl, fallbackUrl, preload, dynamicImportDefault, createProxyWorker, embeddedWasmModule, importWasmModule;
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
    importWasmModule = async (urlOverride, prefixOverride, isMultiThreaded) => {
      if (!urlOverride && !prefixOverride && embeddedWasmModule && scriptSrc && isSameOrigin(scriptSrc)) {
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vY29tbW9uL2xpYi9iYWNrZW5kLWltcGwudHMiLCAiLi4vLi4vY29tbW9uL2xpYi9iYWNrZW5kLnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvdmVyc2lvbi50cyIsICIuLi8uLi9jb21tb24vbGliL2Vudi1pbXBsLnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvZW52LnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvdGVuc29yLWNvbnZlcnNpb24taW1wbC50cyIsICIuLi8uLi9jb21tb24vbGliL3RlbnNvci1mYWN0b3J5LWltcGwudHMiLCAiLi4vLi4vY29tbW9uL2xpYi90ZW5zb3ItaW1wbC10eXBlLW1hcHBpbmcudHMiLCAiLi4vLi4vY29tbW9uL2xpYi90ZW5zb3ItdXRpbHMtaW1wbC50cyIsICIuLi8uLi9jb21tb24vbGliL3RlbnNvci1pbXBsLnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvdGVuc29yLnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvdHJhY2UudHMiLCAiLi4vLi4vY29tbW9uL2xpYi9pbmZlcmVuY2Utc2Vzc2lvbi1pbXBsLnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvaW5mZXJlbmNlLXNlc3Npb24udHMiLCAiLi4vLi4vY29tbW9uL2xpYi90ZW5zb3ItY29udmVyc2lvbi50cyIsICIuLi8uLi9jb21tb24vbGliL3RlbnNvci1mYWN0b3J5LnRzIiwgIi4uLy4uL2NvbW1vbi9saWIvb25ueC1tb2RlbC50cyIsICIuLi8uLi9jb21tb24vbGliL29ubngtdmFsdWUudHMiLCAiLi4vLi4vY29tbW9uL2xpYi9pbmRleC50cyIsICIuLi9saWIvd2FzbS93YXNtLXV0aWxzLWVudi50cyIsICJvcnQtd2FzbS1zaW1kLXRocmVhZGVkLmpzZXAubWpzIiwgIm9ydC13YXNtLXNpbWQtdGhyZWFkZWQubWpzIiwgIi4uL2xpYi93YXNtL3dhc20tdXRpbHMtaW1wb3J0LnRzIiwgIi4uL2xpYi93YXNtL3dhc20tZmFjdG9yeS50cyIsICIuLi9saWIvd2FzbS93YXNtLXV0aWxzLnRzIiwgIi4uL2xpYi93YXNtL3J1bi1vcHRpb25zLnRzIiwgIi4uL2xpYi93YXNtL3Nlc3Npb24tb3B0aW9ucy50cyIsICIuLi9saWIvd2FzbS93YXNtLWNvbW1vbi50cyIsICIuLi9saWIvd2FzbS93YXNtLXV0aWxzLWxvYWQtZmlsZS50cyIsICIuLi9saWIvd2FzbS93YXNtLWNvcmUtaW1wbC50cyIsICIuLi9saWIvd2FzbS9wcm94eS13cmFwcGVyLnRzIiwgIi4uL2xpYi93YXNtL3Nlc3Npb24taGFuZGxlci1pbmZlcmVuY2UudHMiLCAiLi4vbGliL2JhY2tlbmQtd2FzbS50cyIsICIuLi9saWIvaW5kZXgudHMiLCAiLi4vbGliL3ZlcnNpb24udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgeyBCYWNrZW5kIH0gZnJvbSAnLi9iYWNrZW5kLmpzJztcbmltcG9ydCB7IEluZmVyZW5jZVNlc3Npb24gfSBmcm9tICcuL2luZmVyZW5jZS1zZXNzaW9uLmpzJztcblxuaW50ZXJmYWNlIEJhY2tlbmRJbmZvIHtcbiAgYmFja2VuZDogQmFja2VuZDtcbiAgcHJpb3JpdHk6IG51bWJlcjtcblxuICBpbml0UHJvbWlzZT86IFByb21pc2U8dm9pZD47XG4gIGluaXRpYWxpemVkPzogYm9vbGVhbjtcbiAgYWJvcnRlZD86IGJvb2xlYW47XG4gIGVycm9yPzogc3RyaW5nO1xufVxuXG5jb25zdCBiYWNrZW5kczogTWFwPHN0cmluZywgQmFja2VuZEluZm8+ID0gbmV3IE1hcCgpO1xuY29uc3QgYmFja2VuZHNTb3J0ZWRCeVByaW9yaXR5OiBzdHJpbmdbXSA9IFtdO1xuXG4vKipcbiAqIFJlZ2lzdGVyIGEgYmFja2VuZC5cbiAqXG4gKiBAcGFyYW0gbmFtZSAtIHRoZSBuYW1lIGFzIGEga2V5IHRvIGxvb2t1cCBhcyBhbiBleGVjdXRpb24gcHJvdmlkZXIuXG4gKiBAcGFyYW0gYmFja2VuZCAtIHRoZSBiYWNrZW5kIG9iamVjdC5cbiAqIEBwYXJhbSBwcmlvcml0eSAtIGFuIGludGVnZXIgaW5kaWNhdGluZyB0aGUgcHJpb3JpdHkgb2YgdGhlIGJhY2tlbmQuIEhpZ2hlciBudW1iZXIgbWVhbnMgaGlnaGVyIHByaW9yaXR5LiBpZiBwcmlvcml0eVxuICogPCAwLCBpdCB3aWxsIGJlIGNvbnNpZGVyZWQgYXMgYSAnYmV0YScgdmVyc2lvbiBhbmQgd2lsbCBub3QgYmUgdXNlZCBhcyBhIGZhbGxiYWNrIGJhY2tlbmQgYnkgZGVmYXVsdC5cbiAqXG4gKiBAaWdub3JlXG4gKi9cbmV4cG9ydCBjb25zdCByZWdpc3RlckJhY2tlbmQgPSAobmFtZTogc3RyaW5nLCBiYWNrZW5kOiBCYWNrZW5kLCBwcmlvcml0eTogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGlmIChiYWNrZW5kICYmIHR5cGVvZiBiYWNrZW5kLmluaXQgPT09ICdmdW5jdGlvbicgJiYgdHlwZW9mIGJhY2tlbmQuY3JlYXRlSW5mZXJlbmNlU2Vzc2lvbkhhbmRsZXIgPT09ICdmdW5jdGlvbicpIHtcbiAgICBjb25zdCBjdXJyZW50QmFja2VuZCA9IGJhY2tlbmRzLmdldChuYW1lKTtcbiAgICBpZiAoY3VycmVudEJhY2tlbmQgPT09IHVuZGVmaW5lZCkge1xuICAgICAgYmFja2VuZHMuc2V0KG5hbWUsIHsgYmFja2VuZCwgcHJpb3JpdHkgfSk7XG4gICAgfSBlbHNlIGlmIChjdXJyZW50QmFja2VuZC5wcmlvcml0eSA+IHByaW9yaXR5KSB7XG4gICAgICAvLyBzYW1lIG5hbWUgaXMgYWxyZWFkeSByZWdpc3RlcmVkIHdpdGggYSBoaWdoZXIgcHJpb3JpdHkuIHNraXAgcmVnaXN0ZXJhdGlvbi5cbiAgICAgIHJldHVybjtcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnRCYWNrZW5kLnByaW9yaXR5ID09PSBwcmlvcml0eSkge1xuICAgICAgaWYgKGN1cnJlbnRCYWNrZW5kLmJhY2tlbmQgIT09IGJhY2tlbmQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBjYW5ub3QgcmVnaXN0ZXIgYmFja2VuZCBcIiR7bmFtZX1cIiB1c2luZyBwcmlvcml0eSAke3ByaW9yaXR5fWApO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChwcmlvcml0eSA+PSAwKSB7XG4gICAgICBjb25zdCBpID0gYmFja2VuZHNTb3J0ZWRCeVByaW9yaXR5LmluZGV4T2YobmFtZSk7XG4gICAgICBpZiAoaSAhPT0gLTEpIHtcbiAgICAgICAgYmFja2VuZHNTb3J0ZWRCeVByaW9yaXR5LnNwbGljZShpLCAxKTtcbiAgICAgIH1cblxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBiYWNrZW5kc1NvcnRlZEJ5UHJpb3JpdHkubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKGJhY2tlbmRzLmdldChiYWNrZW5kc1NvcnRlZEJ5UHJpb3JpdHlbaV0pIS5wcmlvcml0eSA8PSBwcmlvcml0eSkge1xuICAgICAgICAgIGJhY2tlbmRzU29ydGVkQnlQcmlvcml0eS5zcGxpY2UoaSwgMCwgbmFtZSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICBiYWNrZW5kc1NvcnRlZEJ5UHJpb3JpdHkucHVzaChuYW1lKTtcbiAgICB9XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhyb3cgbmV3IFR5cGVFcnJvcignbm90IGEgdmFsaWQgYmFja2VuZCcpO1xufTtcblxuLyoqXG4gKiBUcnkgdG8gcmVzb2x2ZSBhbmQgaW5pdGlhbGl6ZSBhIGJhY2tlbmQuXG4gKlxuICogQHBhcmFtIGJhY2tlbmROYW1lIC0gdGhlIG5hbWUgb2YgdGhlIGJhY2tlbmQuXG4gKiBAcmV0dXJucyB0aGUgYmFja2VuZCBpbnN0YW5jZSBpZiByZXNvbHZlZCBhbmQgaW5pdGlhbGl6ZWQgc3VjY2Vzc2Z1bGx5LCBvciBhbiBlcnJvciBtZXNzYWdlIGlmIGZhaWxlZC5cbiAqL1xuY29uc3QgdHJ5UmVzb2x2ZUFuZEluaXRpYWxpemVCYWNrZW5kID0gYXN5bmMgKGJhY2tlbmROYW1lOiBzdHJpbmcpOiBQcm9taXNlPEJhY2tlbmQgfCBzdHJpbmc+ID0+IHtcbiAgY29uc3QgYmFja2VuZEluZm8gPSBiYWNrZW5kcy5nZXQoYmFja2VuZE5hbWUpO1xuICBpZiAoIWJhY2tlbmRJbmZvKSB7XG4gICAgcmV0dXJuICdiYWNrZW5kIG5vdCBmb3VuZC4nO1xuICB9XG5cbiAgaWYgKGJhY2tlbmRJbmZvLmluaXRpYWxpemVkKSB7XG4gICAgcmV0dXJuIGJhY2tlbmRJbmZvLmJhY2tlbmQ7XG4gIH0gZWxzZSBpZiAoYmFja2VuZEluZm8uYWJvcnRlZCkge1xuICAgIHJldHVybiBiYWNrZW5kSW5mby5lcnJvciE7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgaXNJbml0aWFsaXppbmcgPSAhIWJhY2tlbmRJbmZvLmluaXRQcm9taXNlO1xuICAgIHRyeSB7XG4gICAgICBpZiAoIWlzSW5pdGlhbGl6aW5nKSB7XG4gICAgICAgIGJhY2tlbmRJbmZvLmluaXRQcm9taXNlID0gYmFja2VuZEluZm8uYmFja2VuZC5pbml0KGJhY2tlbmROYW1lKTtcbiAgICAgIH1cbiAgICAgIGF3YWl0IGJhY2tlbmRJbmZvLmluaXRQcm9taXNlO1xuICAgICAgYmFja2VuZEluZm8uaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgcmV0dXJuIGJhY2tlbmRJbmZvLmJhY2tlbmQ7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgaWYgKCFpc0luaXRpYWxpemluZykge1xuICAgICAgICBiYWNrZW5kSW5mby5lcnJvciA9IGAke2V9YDtcbiAgICAgICAgYmFja2VuZEluZm8uYWJvcnRlZCA9IHRydWU7XG4gICAgICB9XG4gICAgICByZXR1cm4gYmFja2VuZEluZm8uZXJyb3IhO1xuICAgIH0gZmluYWxseSB7XG4gICAgICBkZWxldGUgYmFja2VuZEluZm8uaW5pdFByb21pc2U7XG4gICAgfVxuICB9XG59O1xuXG4vKipcbiAqIFJlc29sdmUgZXhlY3V0aW9uIHByb3ZpZGVycyBmcm9tIHRoZSBzcGVjaWZpYyBzZXNzaW9uIG9wdGlvbnMuXG4gKlxuICogQHBhcmFtIG9wdGlvbnMgLSB0aGUgc2Vzc2lvbiBvcHRpb25zIG9iamVjdC5cbiAqIEByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgdHVwbGUgb2YgYW4gaW5pdGlhbGl6ZWQgYmFja2VuZCBpbnN0YW5jZSBhbmQgYSBzZXNzaW9uIG9wdGlvbnMgb2JqZWN0IHdpdGhcbiAqIGZpbHRlcmVkIEVQIGxpc3QuXG4gKlxuICogQGlnbm9yZVxuICovXG5leHBvcnQgY29uc3QgcmVzb2x2ZUJhY2tlbmRBbmRFeGVjdXRpb25Qcm92aWRlcnMgPSBhc3luYyAoXG4gIG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMsXG4pOiBQcm9taXNlPFtiYWNrZW5kOiBCYWNrZW5kLCBvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zXT4gPT4ge1xuICAvLyBleHRyYWN0IGJhY2tlbmQgaGludHMgZnJvbSBzZXNzaW9uIG9wdGlvbnNcbiAgY29uc3QgZXBzID0gb3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMgfHwgW107XG4gIGNvbnN0IGJhY2tlbmRIaW50cyA9IGVwcy5tYXAoKGkpID0+ICh0eXBlb2YgaSA9PT0gJ3N0cmluZycgPyBpIDogaS5uYW1lKSk7XG4gIGNvbnN0IGJhY2tlbmROYW1lcyA9IGJhY2tlbmRIaW50cy5sZW5ndGggPT09IDAgPyBiYWNrZW5kc1NvcnRlZEJ5UHJpb3JpdHkgOiBiYWNrZW5kSGludHM7XG5cbiAgLy8gdHJ5IHRvIHJlc29sdmUgYW5kIGluaXRpYWxpemUgYWxsIHJlcXVlc3RlZCBiYWNrZW5kc1xuICBsZXQgYmFja2VuZDogQmFja2VuZCB8IHVuZGVmaW5lZDtcbiAgY29uc3QgZXJyb3JzID0gW107XG4gIGNvbnN0IGF2YWlsYWJsZUJhY2tlbmROYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xuICBmb3IgKGNvbnN0IGJhY2tlbmROYW1lIG9mIGJhY2tlbmROYW1lcykge1xuICAgIGNvbnN0IHJlc29sdmVSZXN1bHQgPSBhd2FpdCB0cnlSZXNvbHZlQW5kSW5pdGlhbGl6ZUJhY2tlbmQoYmFja2VuZE5hbWUpO1xuICAgIGlmICh0eXBlb2YgcmVzb2x2ZVJlc3VsdCA9PT0gJ3N0cmluZycpIHtcbiAgICAgIGVycm9ycy5wdXNoKHsgbmFtZTogYmFja2VuZE5hbWUsIGVycjogcmVzb2x2ZVJlc3VsdCB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKCFiYWNrZW5kKSB7XG4gICAgICAgIGJhY2tlbmQgPSByZXNvbHZlUmVzdWx0O1xuICAgICAgfVxuICAgICAgaWYgKGJhY2tlbmQgPT09IHJlc29sdmVSZXN1bHQpIHtcbiAgICAgICAgYXZhaWxhYmxlQmFja2VuZE5hbWVzLmFkZChiYWNrZW5kTmFtZSk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gaWYgbm8gYmFja2VuZCBpcyBhdmFpbGFibGUsIHRocm93IGVycm9yLlxuICBpZiAoIWJhY2tlbmQpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYG5vIGF2YWlsYWJsZSBiYWNrZW5kIGZvdW5kLiBFUlI6ICR7ZXJyb3JzLm1hcCgoZSkgPT4gYFske2UubmFtZX1dICR7ZS5lcnJ9YCkuam9pbignLCAnKX1gKTtcbiAgfVxuXG4gIC8vIGZvciBlYWNoIGV4cGxpY2l0bHkgcmVxdWVzdGVkIGJhY2tlbmQsIGlmIGl0J3Mgbm90IGF2YWlsYWJsZSwgb3V0cHV0IHdhcm5pbmcgbWVzc2FnZS5cbiAgZm9yIChjb25zdCB7IG5hbWUsIGVyciB9IG9mIGVycm9ycykge1xuICAgIGlmIChiYWNrZW5kSGludHMuaW5jbHVkZXMobmFtZSkpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgIGByZW1vdmluZyByZXF1ZXN0ZWQgZXhlY3V0aW9uIHByb3ZpZGVyIFwiJHtuYW1lfVwiIGZyb20gc2Vzc2lvbiBvcHRpb25zIGJlY2F1c2UgaXQgaXMgbm90IGF2YWlsYWJsZTogJHtlcnJ9YCxcbiAgICAgICk7XG4gICAgfVxuICB9XG5cbiAgY29uc3QgZmlsdGVyZWRFcHMgPSBlcHMuZmlsdGVyKChpKSA9PiBhdmFpbGFibGVCYWNrZW5kTmFtZXMuaGFzKHR5cGVvZiBpID09PSAnc3RyaW5nJyA/IGkgOiBpLm5hbWUpKTtcblxuICByZXR1cm4gW1xuICAgIGJhY2tlbmQsXG4gICAgbmV3IFByb3h5KG9wdGlvbnMsIHtcbiAgICAgIGdldDogKHRhcmdldCwgcHJvcCkgPT4ge1xuICAgICAgICBpZiAocHJvcCA9PT0gJ2V4ZWN1dGlvblByb3ZpZGVycycpIHtcbiAgICAgICAgICByZXR1cm4gZmlsdGVyZWRFcHM7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcCk7XG4gICAgICB9LFxuICAgIH0pLFxuICBdO1xufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHsgSW5mZXJlbmNlU2Vzc2lvbiB9IGZyb20gJy4vaW5mZXJlbmNlLXNlc3Npb24uanMnO1xuaW1wb3J0IHsgT25ueFZhbHVlIH0gZnJvbSAnLi9vbm54LXZhbHVlLmpzJztcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmV4cG9ydCBkZWNsYXJlIG5hbWVzcGFjZSBTZXNzaW9uSGFuZGxlciB7XG4gIHR5cGUgRmVlZHNUeXBlID0geyBbbmFtZTogc3RyaW5nXTogT25ueFZhbHVlIH07XG4gIHR5cGUgRmV0Y2hlc1R5cGUgPSB7IFtuYW1lOiBzdHJpbmddOiBPbm54VmFsdWUgfCBudWxsIH07XG4gIHR5cGUgUmV0dXJuVHlwZSA9IHsgW25hbWU6IHN0cmluZ106IE9ubnhWYWx1ZSB9O1xufVxuXG4vKipcbiAqIFJlcHJlc2VudHMgc2hhcmVkIFNlc3Npb25IYW5kbGVyIGZ1bmN0aW9uYWxpdHlcbiAqXG4gKiBAaWdub3JlXG4gKi9cbmludGVyZmFjZSBTZXNzaW9uSGFuZGxlciB7XG4gIGRpc3Bvc2UoKTogUHJvbWlzZTx2b2lkPjtcblxuICByZWFkb25seSBpbnB1dE5hbWVzOiByZWFkb25seSBzdHJpbmdbXTtcbiAgcmVhZG9ubHkgb3V0cHV0TmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xuXG4gIHJlYWRvbmx5IGlucHV0TWV0YWRhdGE6IHJlYWRvbmx5IEluZmVyZW5jZVNlc3Npb24uVmFsdWVNZXRhZGF0YVtdO1xuICByZWFkb25seSBvdXRwdXRNZXRhZGF0YTogcmVhZG9ubHkgSW5mZXJlbmNlU2Vzc2lvbi5WYWx1ZU1ldGFkYXRhW107XG59XG5cbi8qKlxuICogUmVwcmVzZW50IGEgaGFuZGxlciBpbnN0YW5jZSBvZiBhbiBpbmZlcmVuY2Ugc2Vzc2lvbi5cbiAqXG4gKiBAaWdub3JlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW5mZXJlbmNlU2Vzc2lvbkhhbmRsZXIgZXh0ZW5kcyBTZXNzaW9uSGFuZGxlciB7XG4gIHN0YXJ0UHJvZmlsaW5nKCk6IHZvaWQ7XG4gIGVuZFByb2ZpbGluZygpOiB2b2lkO1xuXG4gIHJ1bihcbiAgICBmZWVkczogU2Vzc2lvbkhhbmRsZXIuRmVlZHNUeXBlLFxuICAgIGZldGNoZXM6IFNlc3Npb25IYW5kbGVyLkZldGNoZXNUeXBlLFxuICAgIG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxTZXNzaW9uSGFuZGxlci5SZXR1cm5UeXBlPjtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnQgYSBiYWNrZW5kIHRoYXQgcHJvdmlkZXMgaW1wbGVtZW50YXRpb24gb2YgbW9kZWwgaW5mZXJlbmNpbmcuXG4gKlxuICogQGlnbm9yZVxuICovXG5leHBvcnQgaW50ZXJmYWNlIEJhY2tlbmQge1xuICAvKipcbiAgICogSW5pdGlhbGl6ZSB0aGUgYmFja2VuZCBhc3luY2hyb25vdXNseS4gU2hvdWxkIHRocm93IHdoZW4gZmFpbGVkLlxuICAgKi9cbiAgaW5pdChiYWNrZW5kTmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPjtcblxuICBjcmVhdGVJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcihcbiAgICB1cmlPckJ1ZmZlcjogc3RyaW5nIHwgVWludDhBcnJheSxcbiAgICBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcj47XG59XG5cbmV4cG9ydCB7IHJlZ2lzdGVyQmFja2VuZCB9IGZyb20gJy4vYmFja2VuZC1pbXBsLmpzJztcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuLy8gVGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBieSAvanMvc2NyaXB0cy91cGRhdGUtdmVyc2lvbi50c1xuLy8gRG8gbm90IG1vZGlmeSBmaWxlIGNvbnRlbnQgbWFudWFsbHkuXG5cbmV4cG9ydCBjb25zdCB2ZXJzaW9uID0gJzEuMjIuMCc7XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7IEVudiB9IGZyb20gJy4vZW52LmpzJztcbmltcG9ydCB7IHZlcnNpb24gfSBmcm9tICcuL3ZlcnNpb24uanMnO1xuXG50eXBlIExvZ0xldmVsVHlwZSA9IEVudlsnbG9nTGV2ZWwnXTtcblxubGV0IGxvZ0xldmVsVmFsdWU6IFJlcXVpcmVkPExvZ0xldmVsVHlwZT4gPSAnd2FybmluZyc7XG5cbmV4cG9ydCBjb25zdCBlbnY6IEVudiA9IHtcbiAgd2FzbToge30gYXMgRW52LldlYkFzc2VtYmx5RmxhZ3MsXG4gIHdlYmdsOiB7fSBhcyBFbnYuV2ViR0xGbGFncyxcbiAgd2ViZ3B1OiB7fSBhcyBFbnYuV2ViR3B1RmxhZ3MsXG4gIHZlcnNpb25zOiB7IGNvbW1vbjogdmVyc2lvbiB9LFxuXG4gIHNldCBsb2dMZXZlbCh2YWx1ZTogTG9nTGV2ZWxUeXBlKSB7XG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycgfHwgWyd2ZXJib3NlJywgJ2luZm8nLCAnd2FybmluZycsICdlcnJvcicsICdmYXRhbCddLmluZGV4T2YodmFsdWUpID09PSAtMSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBsb2dnaW5nIGxldmVsOiAke3ZhbHVlfWApO1xuICAgIH1cbiAgICBsb2dMZXZlbFZhbHVlID0gdmFsdWU7XG4gIH0sXG4gIGdldCBsb2dMZXZlbCgpOiBSZXF1aXJlZDxMb2dMZXZlbFR5cGU+IHtcbiAgICByZXR1cm4gbG9nTGV2ZWxWYWx1ZTtcbiAgfSxcbn07XG5cbi8vIHNldCBwcm9wZXJ0eSAnbG9nTGV2ZWwnIHNvIHRoYXQgdGhleSBjYW4gYmUgY29ycmVjdGx5IHRyYW5zZmVycmVkIHRvIHdvcmtlciBieSBgcG9zdE1lc3NhZ2UoKWAuXG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZW52LCAnbG9nTGV2ZWwnLCB7IGVudW1lcmFibGU6IHRydWUgfSk7XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7IGVudiBhcyBlbnZJbXBsIH0gZnJvbSAnLi9lbnYtaW1wbC5qcyc7XG5pbXBvcnQgeyBUcnlHZXRHbG9iYWxUeXBlIH0gZnJvbSAnLi90eXBlLWhlbHBlci5qcyc7XG5cbmV4cG9ydCBkZWNsYXJlIG5hbWVzcGFjZSBFbnYge1xuICBleHBvcnQgdHlwZSBXYXNtUGF0aFByZWZpeCA9IHN0cmluZztcbiAgZXhwb3J0IGludGVyZmFjZSBXYXNtRmlsZVBhdGhzIHtcbiAgICAvKipcbiAgICAgKiBTcGVjaWZ5IHRoZSBvdmVycmlkZSBwYXRoIGZvciB0aGUgbWFpbiAud2FzbSBmaWxlLlxuICAgICAqXG4gICAgICogVGhpcyBwYXRoIHNob3VsZCBiZSBhbiBhYnNvbHV0ZSBwYXRoLlxuICAgICAqXG4gICAgICogSWYgbm90IG1vZGlmaWVkLCB0aGUgZmlsZW5hbWUgb2YgdGhlIC53YXNtIGZpbGUgaXM6XG4gICAgICogLSBgb3J0LXdhc20tc2ltZC10aHJlYWRlZC53YXNtYCBmb3IgZGVmYXVsdCBidWlsZFxuICAgICAqIC0gYG9ydC13YXNtLXNpbWQtdGhyZWFkZWQuanNlcC53YXNtYCBmb3IgSlNFUCBidWlsZCAod2l0aCBXZWJHUFUgYW5kIFdlYk5OKVxuICAgICAqL1xuICAgIHdhc20/OiBVUkwgfCBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogU3BlY2lmeSB0aGUgb3ZlcnJpZGUgcGF0aCBmb3IgdGhlIG1haW4gLm1qcyBmaWxlLlxuICAgICAqXG4gICAgICogVGhpcyBwYXRoIHNob3VsZCBiZSBhbiBhYnNvbHV0ZSBwYXRoLlxuICAgICAqXG4gICAgICogSWYgbm90IG1vZGlmaWVkLCB0aGUgZmlsZW5hbWUgb2YgdGhlIC5tanMgZmlsZSBpczpcbiAgICAgKiAtIGBvcnQtd2FzbS1zaW1kLXRocmVhZGVkLm1qc2AgZm9yIGRlZmF1bHQgYnVpbGRcbiAgICAgKiAtIGBvcnQtd2FzbS1zaW1kLXRocmVhZGVkLmpzZXAubWpzYCBmb3IgSlNFUCBidWlsZCAod2l0aCBXZWJHUFUgYW5kIFdlYk5OKVxuICAgICAqL1xuICAgIG1qcz86IFVSTCB8IHN0cmluZztcbiAgfVxuICBleHBvcnQgdHlwZSBXYXNtUHJlZml4T3JGaWxlUGF0aHMgPSBXYXNtUGF0aFByZWZpeCB8IFdhc21GaWxlUGF0aHM7XG4gIGV4cG9ydCBpbnRlcmZhY2UgV2ViQXNzZW1ibHlGbGFncyB7XG4gICAgLyoqXG4gICAgICogc2V0IG9yIGdldCBudW1iZXIgb2YgdGhyZWFkKHMpLiBJZiBvbWl0dGVkIG9yIHNldCB0byAwLCBudW1iZXIgb2YgdGhyZWFkKHMpIHdpbGwgYmUgZGV0ZXJtaW5lZCBieSBzeXN0ZW0uIElmIHNldFxuICAgICAqIHRvIDEsIG5vIHdvcmtlciB0aHJlYWQgd2lsbCBiZSBzcGF3bmVkLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IHdoZW4gV2ViQXNzZW1ibHkgbXVsdGl0aHJlYWQgZmVhdHVyZSBpcyBhdmFpbGFibGUgaW4gY3VycmVudCBjb250ZXh0LlxuICAgICAqXG4gICAgICogQGRlZmF1bHRWYWx1ZSBgMGBcbiAgICAgKi9cbiAgICBudW1UaHJlYWRzPzogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogc2V0IGEgdmFsdWUgaW5kaWNhdGluZyB3aGV0aGVyIHRvIGVuYWJsZSBTSU1ELlxuICAgICAqXG4gICAgICogT05OWCBSdW50aW1lIHdpbGwgcGVyZm9ybSBmZWF0dXJlIGRldGVjdGlvbiBiYXNlZCBvbiB0aGUgdmFsdWUgb2YgdGhpcyBwcm9wZXJ0eS4gU3BlY2lmaWNhbGx5LCB3aGVuIHRoZSB2YWx1ZSBpc1xuICAgICAqIHNldCB0bzpcbiAgICAgKiAtIGB1bmRlZmluZWRgLCBgdHJ1ZWAgb3IgYFwiZml4ZWRcImA6IHdpbGwgY2hlY2sgYXZhaWxhYmlsaXR5IG9mIEZpeGVkLXdpZHRoIFNJTUQuXG4gICAgICogLSBgXCJyZWxheGVkXCJgOiB3aWxsIGNoZWNrIGF2YWlsYWJpbGl0eSBvZiBSZWxheGVkIFNJTUQuXG4gICAgICogLSBgZmFsc2VgOiB3aWxsIG5vdCBwZXJmb3JtIFNJTUQgZmVhdHVyZSBjaGVja2luZy5cbiAgICAgKlxuICAgICAqIFNldHRpbmcgdGhpcyBwcm9wZXJ0eSBkb2VzIG5vdCBtYWtlIE9OTlggUnVudGltZSB0byBzd2l0Y2ggdG8gdGhlIGNvcnJlc3BvbmRpbmcgcnVudGltZSBhdXRvbWF0aWNhbGx5LiBVc2VyIG5lZWRcbiAgICAgKiB0byBzZXQgYHdhc21QYXRoc2Agb3IgYHdhc21CaW5hcnlgIHByb3BlcnR5IHRvIGxvYWQgdGhlIGNvcnJlc3BvbmRpbmcgcnVudGltZS5cbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSB3aGVuIFdlYkFzc2VtYmx5IFNJTUQgZmVhdHVyZSBpcyBhdmFpbGFibGUgaW4gY3VycmVudCBjb250ZXh0LlxuICAgICAqXG4gICAgICogQGRlZmF1bHRWYWx1ZSBgdHJ1ZWBcbiAgICAgKi9cbiAgICBzaW1kPzogYm9vbGVhbiB8ICdmaXhlZCcgfCAncmVsYXhlZCc7XG5cbiAgICAvKipcbiAgICAgKiBzZXQgb3IgZ2V0IGEgYm9vbGVhbiB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdG8gZW5hYmxlIHRyYWNlLlxuICAgICAqXG4gICAgICogQGRlZmF1bHRWYWx1ZSBgZmFsc2VgXG4gICAgICpcbiAgICAgKiBAZGVwcmVjYXRlZCBVc2UgYGVudi50cmFjZWAgaW5zdGVhZC4gSWYgYGVudi50cmFjZWAgaXMgc2V0LCB0aGlzIHByb3BlcnR5IHdpbGwgYmUgaWdub3JlZC5cbiAgICAgKi9cbiAgICB0cmFjZT86IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBTZXQgb3IgZ2V0IGEgbnVtYmVyIHNwZWNpZnlpbmcgdGhlIHRpbWVvdXQgZm9yIGluaXRpYWxpemF0aW9uIG9mIFdlYkFzc2VtYmx5IGJhY2tlbmQsIGluIG1pbGxpc2Vjb25kcy4gQSB6ZXJvXG4gICAgICogdmFsdWUgaW5kaWNhdGVzIG5vIHRpbWVvdXQgaXMgc2V0LlxuICAgICAqXG4gICAgICogQGRlZmF1bHRWYWx1ZSBgMGBcbiAgICAgKi9cbiAgICBpbml0VGltZW91dD86IG51bWJlcjtcblxuICAgIC8qKlxuICAgICAqIFNldCBhIGN1c3RvbSBVUkwgcHJlZml4IHRvIHRoZSAud2FzbS8ubWpzIGZpbGVzLCBvciBhbiBvYmplY3Qgb2Ygb3ZlcnJpZGVzIGZvciBib3RoIC53YXNtLy5tanMgZmlsZS4gVGhlIG92ZXJyaWRlXG4gICAgICogcGF0aCBzaG91bGQgYmUgYW4gYWJzb2x1dGUgcGF0aC5cbiAgICAgKi9cbiAgICB3YXNtUGF0aHM/OiBXYXNtUHJlZml4T3JGaWxlUGF0aHM7XG5cbiAgICAvKipcbiAgICAgKiBTZXQgYSBjdXN0b20gYnVmZmVyIHdoaWNoIGNvbnRhaW5zIHRoZSBXZWJBc3NlbWJseSBiaW5hcnkuIElmIHRoaXMgcHJvcGVydHkgaXMgc2V0LCB0aGUgYHdhc21QYXRoc2AgcHJvcGVydHkgd2lsbFxuICAgICAqIGJlIGlnbm9yZWQuXG4gICAgICovXG4gICAgd2FzbUJpbmFyeT86IEFycmF5QnVmZmVyTGlrZSB8IFVpbnQ4QXJyYXk7XG5cbiAgICAvKipcbiAgICAgKiBTZXQgb3IgZ2V0IGEgYm9vbGVhbiB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdG8gcHJveHkgdGhlIGV4ZWN1dGlvbiBvZiBtYWluIHRocmVhZCB0byBhIHdvcmtlciB0aHJlYWQuXG4gICAgICpcbiAgICAgKiBAZGVmYXVsdFZhbHVlIGBmYWxzZWBcbiAgICAgKi9cbiAgICBwcm94eT86IGJvb2xlYW47XG4gIH1cblxuICBleHBvcnQgaW50ZXJmYWNlIFdlYkdMRmxhZ3Mge1xuICAgIC8qKlxuICAgICAqIFNldCBvciBnZXQgdGhlIFdlYkdMIENvbnRleHQgSUQgKHdlYmdsIG9yIHdlYmdsMikuXG4gICAgICpcbiAgICAgKiBAZGVmYXVsdFZhbHVlIGAnd2ViZ2wyJ2BcbiAgICAgKi9cbiAgICBjb250ZXh0SWQ/OiAnd2ViZ2wnIHwgJ3dlYmdsMic7XG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBXZWJHTCByZW5kZXJpbmcgY29udGV4dC5cbiAgICAgKi9cbiAgICByZWFkb25seSBjb250ZXh0OiBXZWJHTFJlbmRlcmluZ0NvbnRleHQ7XG4gICAgLyoqXG4gICAgICogU2V0IG9yIGdldCB0aGUgbWF4aW11bSBiYXRjaCBzaXplIGZvciBtYXRtdWwuIDAgbWVhbnMgdG8gZGlzYWJsZSBiYXRjaGluZy5cbiAgICAgKlxuICAgICAqIEBkZXByZWNhdGVkXG4gICAgICovXG4gICAgbWF0bXVsTWF4QmF0Y2hTaXplPzogbnVtYmVyO1xuICAgIC8qKlxuICAgICAqIFNldCBvciBnZXQgdGhlIHRleHR1cmUgY2FjaGUgbW9kZS5cbiAgICAgKlxuICAgICAqIEBkZWZhdWx0VmFsdWUgYCdmdWxsJ2BcbiAgICAgKi9cbiAgICB0ZXh0dXJlQ2FjaGVNb2RlPzogJ2luaXRpYWxpemVyT25seScgfCAnZnVsbCc7XG4gICAgLyoqXG4gICAgICogU2V0IG9yIGdldCB0aGUgcGFja2VkIHRleHR1cmUgbW9kZVxuICAgICAqXG4gICAgICogQGRlZmF1bHRWYWx1ZSBgZmFsc2VgXG4gICAgICovXG4gICAgcGFjaz86IGJvb2xlYW47XG4gICAgLyoqXG4gICAgICogU2V0IG9yIGdldCB3aGV0aGVyIGVuYWJsZSBhc3luYyBkb3dubG9hZC5cbiAgICAgKlxuICAgICAqIEBkZWZhdWx0VmFsdWUgYGZhbHNlYFxuICAgICAqL1xuICAgIGFzeW5jPzogYm9vbGVhbjtcbiAgfVxuXG4gIGV4cG9ydCBpbnRlcmZhY2UgV2ViR3B1UHJvZmlsaW5nRGF0YVYxVGVuc29yTWV0YWRhdGEge1xuICAgIGRpbXM6IHJlYWRvbmx5IG51bWJlcltdO1xuICAgIGRhdGFUeXBlOiBzdHJpbmc7XG4gIH1cbiAgZXhwb3J0IGludGVyZmFjZSBXZWJHcHVQcm9maWxpbmdEYXRhVjEge1xuICAgIHZlcnNpb246IDE7XG4gICAgaW5wdXRzTWV0YWRhdGE6IHJlYWRvbmx5IFdlYkdwdVByb2ZpbGluZ0RhdGFWMVRlbnNvck1ldGFkYXRhW107XG4gICAgb3V0cHV0c01ldGFkYXRhOiByZWFkb25seSBXZWJHcHVQcm9maWxpbmdEYXRhVjFUZW5zb3JNZXRhZGF0YVtdO1xuICAgIGtlcm5lbElkOiBudW1iZXI7XG4gICAga2VybmVsVHlwZTogc3RyaW5nO1xuICAgIGtlcm5lbE5hbWU6IHN0cmluZztcbiAgICBwcm9ncmFtTmFtZTogc3RyaW5nO1xuICAgIHN0YXJ0VGltZTogbnVtYmVyO1xuICAgIGVuZFRpbWU6IG51bWJlcjtcbiAgfVxuXG4gIGV4cG9ydCB0eXBlIFdlYkdwdVByb2ZpbGluZ0RhdGEgPSBXZWJHcHVQcm9maWxpbmdEYXRhVjE7XG5cbiAgZXhwb3J0IGludGVyZmFjZSBXZWJHcHVGbGFncyB7XG4gICAgLyoqXG4gICAgICogU2V0IG9yIGdldCB0aGUgcHJvZmlsaW5nIG1vZGUuXG4gICAgICpcbiAgICAgKiBAZGVwcmVjYXRlZCBVc2UgYGVudi53ZWJncHUucHJvZmlsaW5nLm1vZGVgIGluc3RlYWQuIElmIGBlbnYud2ViZ3B1LnByb2ZpbGluZy5tb2RlYCBpcyBzZXQsIHRoaXMgcHJvcGVydHkgd2lsbCBiZVxuICAgICAqIGlnbm9yZWQuXG4gICAgICovXG4gICAgcHJvZmlsaW5nTW9kZT86ICdvZmYnIHwgJ2RlZmF1bHQnO1xuICAgIC8qKlxuICAgICAqIFNldCBvciBnZXQgdGhlIHByb2ZpbGluZyBjb25maWd1cmF0aW9uLlxuICAgICAqL1xuICAgIHByb2ZpbGluZzoge1xuICAgICAgLyoqXG4gICAgICAgKiBTZXQgb3IgZ2V0IHRoZSBwcm9maWxpbmcgbW9kZS5cbiAgICAgICAqXG4gICAgICAgKiBAZGVmYXVsdFZhbHVlIGAnb2ZmJ2BcbiAgICAgICAqL1xuICAgICAgbW9kZT86ICdvZmYnIHwgJ2RlZmF1bHQnO1xuXG4gICAgICAvKipcbiAgICAgICAqIFNldCBvciBnZXQgYSBjYWxsYmFjayBmdW5jdGlvbiB3aGVuIGEgcHJvZmlsaW5nIGRhdGEgaXMgcmVjZWl2ZWQuIElmIG5vdCBzZXQsIHRoZSBwcm9maWxpbmcgZGF0YSB3aWxsIGJlXG4gICAgICAgKiBwcmludGVkIHRvIGNvbnNvbGUuXG4gICAgICAgKi9cbiAgICAgIG9uZGF0YT86IChkYXRhOiBXZWJHcHVQcm9maWxpbmdEYXRhKSA9PiB2b2lkO1xuICAgIH07XG4gICAgLyoqXG4gICAgICogU2V0IG9yIGdldCB0aGUgcG93ZXIgcHJlZmVyZW5jZS5cbiAgICAgKlxuICAgICAqIFNldHRpbmcgdGhpcyBwcm9wZXJ0eSBvbmx5IGhhcyBlZmZlY3QgYmVmb3JlIHRoZSBmaXJzdCBXZWJHUFUgaW5mZXJlbmNlIHNlc3Npb24gaXMgY3JlYXRlZC4gVGhlIHZhbHVlIHdpbGwgYmVcbiAgICAgKiB1c2VkIGFzIG9wdGlvbnMgZm9yIGBuYXZpZ2F0b3IuZ3B1LnJlcXVlc3RBZGFwdGVyKClgLlxuICAgICAqXG4gICAgICogU2VlIHtAbGluayBodHRwczovL2dwdXdlYi5naXRodWIuaW8vZ3B1d2ViLyNkaWN0ZGVmLWdwdXJlcXVlc3RhZGFwdGVyb3B0aW9uc30gZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgKlxuICAgICAqIEBkZWZhdWx0VmFsdWUgYHVuZGVmaW5lZGBcbiAgICAgKlxuICAgICAqIEBkZXByZWNhdGVkIENyZWF0ZSB5b3VyIG93biBHUFVBZGFwdGVyLCB1c2UgaXQgdG8gY3JlYXRlIGEgR1BVRGV2aWNlIGluc3RhbmNlIGFuZCBzZXQge0BsaW5rIGRldmljZX0gcHJvcGVydHkgaWZcbiAgICAgKiB5b3Ugd2FudCB0byB1c2UgYSBzcGVjaWZpYyBwb3dlciBwcmVmZXJlbmNlLlxuICAgICAqL1xuICAgIHBvd2VyUHJlZmVyZW5jZT86ICdsb3ctcG93ZXInIHwgJ2hpZ2gtcGVyZm9ybWFuY2UnO1xuICAgIC8qKlxuICAgICAqIFNldCBvciBnZXQgdGhlIGZvcmNlIGZhbGxiYWNrIGFkYXB0ZXIgZmxhZy5cbiAgICAgKlxuICAgICAqIFNldHRpbmcgdGhpcyBwcm9wZXJ0eSBvbmx5IGhhcyBlZmZlY3QgYmVmb3JlIHRoZSBmaXJzdCBXZWJHUFUgaW5mZXJlbmNlIHNlc3Npb24gaXMgY3JlYXRlZC4gVGhlIHZhbHVlIHdpbGwgYmVcbiAgICAgKiB1c2VkIGFzIG9wdGlvbnMgZm9yIGBuYXZpZ2F0b3IuZ3B1LnJlcXVlc3RBZGFwdGVyKClgLlxuICAgICAqXG4gICAgICogU2VlIHtAbGluayBodHRwczovL2dwdXdlYi5naXRodWIuaW8vZ3B1d2ViLyNkaWN0ZGVmLWdwdXJlcXVlc3RhZGFwdGVyb3B0aW9uc30gZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgKlxuICAgICAqIEBkZWZhdWx0VmFsdWUgYHVuZGVmaW5lZGBcbiAgICAgKlxuICAgICAqIEBkZXByZWNhdGVkIENyZWF0ZSB5b3VyIG93biBHUFVBZGFwdGVyLCB1c2UgaXQgdG8gY3JlYXRlIGEgR1BVRGV2aWNlIGluc3RhbmNlIGFuZCBzZXQge0BsaW5rIGRldmljZX0gcHJvcGVydHkgaWZcbiAgICAgKiB5b3Ugd2FudCB0byB1c2UgYSBzcGVjaWZpYyBmYWxsYmFjayBvcHRpb24uXG4gICAgICovXG4gICAgZm9yY2VGYWxsYmFja0FkYXB0ZXI/OiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIFNldCBvciBnZXQgdGhlIGFkYXB0ZXIgZm9yIFdlYkdQVS5cbiAgICAgKlxuICAgICAqIFNldHRpbmcgdGhpcyBwcm9wZXJ0eSBvbmx5IGhhcyBlZmZlY3QgYmVmb3JlIHRoZSBmaXJzdCBXZWJHUFUgaW5mZXJlbmNlIHNlc3Npb24gaXMgY3JlYXRlZC4gVGhlIHZhbHVlIHdpbGwgYmVcbiAgICAgKiB1c2VkIGFzIHRoZSBHUFUgYWRhcHRlciBmb3IgdGhlIHVuZGVybHlpbmcgV2ViR1BVIGJhY2tlbmQgdG8gY3JlYXRlIEdQVSBkZXZpY2UuXG4gICAgICpcbiAgICAgKiBJZiB0aGlzIHByb3BlcnR5IGlzIG5vdCBzZXQsIGl0IHdpbGwgYmUgYXZhaWxhYmxlIHRvIGdldCBhZnRlciB0aGUgZmlyc3QgV2ViR1BVIGluZmVyZW5jZSBzZXNzaW9uIGlzIGNyZWF0ZWQuIFRoZVxuICAgICAqIHZhbHVlIHdpbGwgYmUgdGhlIEdQVSBhZGFwdGVyIHRoYXQgY3JlYXRlZCBieSB0aGUgdW5kZXJseWluZyBXZWJHUFUgYmFja2VuZC5cbiAgICAgKlxuICAgICAqIFdoZW4gdXNlIHdpdGggVHlwZVNjcmlwdCwgdGhlIHR5cGUgb2YgdGhpcyBwcm9wZXJ0eSBpcyBgR1BVQWRhcHRlcmAgZGVmaW5lZCBpbiBcIkB3ZWJncHUvdHlwZXNcIi5cbiAgICAgKlxuICAgICAqIEBkZXByZWNhdGVkIEl0IGlzIG5vIGxvbmdlciByZWNvbW1lbmRlZCB0byB1c2UgdGhpcyBwcm9wZXJ0eS4gVGhlIGxhdGVzdCBXZWJHUFUgc3BlYyBhZGRzIGBHUFVEZXZpY2UuYWRhcHRlckluZm9gXG4gICAgICogKGh0dHBzOi8vd3d3LnczLm9yZy9UUi93ZWJncHUvI2RvbS1ncHVkZXZpY2UtYWRhcHRlcmluZm8pLCB3aGljaCBhbGxvd3MgdG8gZ2V0IHRoZSBhZGFwdGVyIGluZm9ybWF0aW9uIGZyb20gdGhlXG4gICAgICogZGV2aWNlLiBXaGVuIGl0J3MgYXZhaWxhYmxlLCB0aGVyZSBpcyBubyBuZWVkIHRvIHNldC9nZXQgdGhlIHtAbGluayBhZGFwdGVyfSBwcm9wZXJ0eS5cbiAgICAgKi9cbiAgICBhZGFwdGVyOiBUcnlHZXRHbG9iYWxUeXBlPCdHUFVBZGFwdGVyJz47XG4gICAgLyoqXG4gICAgICogU2V0IG9yIGdldCB0aGUgR1BVIGRldmljZSBmb3IgV2ViR1BVLlxuICAgICAqXG4gICAgICogVGhlcmUgYXJlIDMgdmFsaWQgc2NlbmFyaW9zIG9mIGFjY2Vzc2luZyB0aGlzIHByb3BlcnR5OlxuICAgICAqIC0gU2V0IGEgdmFsdWUgYmVmb3JlIHRoZSBmaXJzdCBXZWJHUFUgaW5mZXJlbmNlIHNlc3Npb24gaXMgY3JlYXRlZC4gVGhlIHZhbHVlIHdpbGwgYmUgdXNlZCBieSB0aGUgV2ViR1BVIGJhY2tlbmRcbiAgICAgKiB0byBwZXJmb3JtIGNhbGN1bGF0aW9ucy4gSWYgdGhlIHZhbHVlIGlzIG5vdCBhIGBHUFVEZXZpY2VgIG9iamVjdCwgYW4gZXJyb3Igd2lsbCBiZSB0aHJvd24uXG4gICAgICogLSBHZXQgdGhlIHZhbHVlIGJlZm9yZSB0aGUgZmlyc3QgV2ViR1BVIGluZmVyZW5jZSBzZXNzaW9uIGlzIGNyZWF0ZWQuIFRoaXMgd2lsbCB0cnkgdG8gY3JlYXRlIGEgbmV3IEdQVURldmljZVxuICAgICAqIGluc3RhbmNlLiBSZXR1cm5zIGEgYFByb21pc2VgIHRoYXQgcmVzb2x2ZXMgdG8gYSBgR1BVRGV2aWNlYCBvYmplY3QuXG4gICAgICogLSBHZXQgdGhlIHZhbHVlIGFmdGVyIHRoZSBmaXJzdCBXZWJHUFUgaW5mZXJlbmNlIHNlc3Npb24gaXMgY3JlYXRlZC4gUmV0dXJucyBhIHJlc29sdmVkIGBQcm9taXNlYCB0byB0aGVcbiAgICAgKiBgR1BVRGV2aWNlYCBvYmplY3QgdXNlZCBieSB0aGUgV2ViR1BVIGJhY2tlbmQuXG4gICAgICovXG4gICAgZ2V0IGRldmljZSgpOiBQcm9taXNlPFRyeUdldEdsb2JhbFR5cGU8J0dQVURldmljZSc+PjtcbiAgICBzZXQgZGV2aWNlKHZhbHVlOiBUcnlHZXRHbG9iYWxUeXBlPCdHUFVEZXZpY2UnPik7XG4gICAgLyoqXG4gICAgICogU2V0IG9yIGdldCB3aGV0aGVyIHZhbGlkYXRlIGlucHV0IGNvbnRlbnQuXG4gICAgICpcbiAgICAgKiBAZGVmYXVsdFZhbHVlIGBmYWxzZWBcbiAgICAgKi9cbiAgICB2YWxpZGF0ZUlucHV0Q29udGVudD86IGJvb2xlYW47XG4gIH1cbn1cblxuZXhwb3J0IGludGVyZmFjZSBFbnYge1xuICAvKipcbiAgICogc2V0IHRoZSBzZXZlcml0eSBsZXZlbCBmb3IgbG9nZ2luZy5cbiAgICpcbiAgICogQGRlZmF1bHRWYWx1ZSBgJ3dhcm5pbmcnYFxuICAgKi9cbiAgbG9nTGV2ZWw/OiAndmVyYm9zZScgfCAnaW5mbycgfCAnd2FybmluZycgfCAnZXJyb3InIHwgJ2ZhdGFsJztcblxuICAvKipcbiAgICogSW5kaWNhdGUgd2hldGhlciBydW4gaW4gZGVidWcgbW9kZS5cbiAgICpcbiAgICogQGRlZmF1bHRWYWx1ZSBgZmFsc2VgXG4gICAqL1xuICBkZWJ1Zz86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIHNldCBvciBnZXQgYSBib29sZWFuIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0byBlbmFibGUgdHJhY2UuXG4gICAqXG4gICAqIEBkZWZhdWx0VmFsdWUgYGZhbHNlYFxuICAgKi9cbiAgdHJhY2U/OiBib29sZWFuO1xuXG4gIC8qKlxuICAgKiBHZXQgdmVyc2lvbiBvZiB0aGUgY3VycmVudCBwYWNrYWdlLlxuICAgKi9cbiAgcmVhZG9ubHkgdmVyc2lvbnM6IHtcbiAgICByZWFkb25seSBjb21tb246IHN0cmluZztcbiAgICByZWFkb25seSB3ZWI/OiBzdHJpbmc7XG4gICAgcmVhZG9ubHkgbm9kZT86IHN0cmluZztcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXG4gICAgcmVhZG9ubHkgJ3JlYWN0LW5hdGl2ZSc/OiBzdHJpbmc7XG4gIH07XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudCBhIHNldCBvZiBmbGFncyBmb3IgV2ViQXNzZW1ibHlcbiAgICovXG4gIHJlYWRvbmx5IHdhc206IEVudi5XZWJBc3NlbWJseUZsYWdzO1xuXG4gIC8qKlxuICAgKiBSZXByZXNlbnQgYSBzZXQgb2YgZmxhZ3MgZm9yIFdlYkdMXG4gICAqL1xuICByZWFkb25seSB3ZWJnbDogRW52LldlYkdMRmxhZ3M7XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudCBhIHNldCBvZiBmbGFncyBmb3IgV2ViR1BVXG4gICAqL1xuICByZWFkb25seSB3ZWJncHU6IEVudi5XZWJHcHVGbGFncztcblxuICBbbmFtZTogc3RyaW5nXTogdW5rbm93bjtcbn1cblxuLyoqXG4gKiBSZXByZXNlbnQgYSBzZXQgb2YgZmxhZ3MgYXMgYSBnbG9iYWwgc2luZ2xldG9uLlxuICovXG5leHBvcnQgY29uc3QgZW52OiBFbnYgPSBlbnZJbXBsO1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgeyBUZW5zb3JUb0RhdGFVcmxPcHRpb25zLCBUZW5zb3JUb0ltYWdlRGF0YU9wdGlvbnMgfSBmcm9tICcuL3RlbnNvci1jb252ZXJzaW9uLmpzJztcbmltcG9ydCB7IFRlbnNvciB9IGZyb20gJy4vdGVuc29yLmpzJztcblxuLyoqXG4gKiBpbXBsZW1lbnRhdGlvbiBvZiBUZW5zb3IudG9EYXRhVVJMKClcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvclRvRGF0YVVSTCA9ICh0ZW5zb3I6IFRlbnNvciwgb3B0aW9ucz86IFRlbnNvclRvRGF0YVVybE9wdGlvbnMpOiBzdHJpbmcgPT4ge1xuICBjb25zdCBjYW52YXMgPSB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnID8gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJykgOiBuZXcgT2Zmc2NyZWVuQ2FudmFzKDEsIDEpO1xuICBjYW52YXMud2lkdGggPSB0ZW5zb3IuZGltc1szXTtcbiAgY2FudmFzLmhlaWdodCA9IHRlbnNvci5kaW1zWzJdO1xuICBjb25zdCBwaXhlbHMyRENvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSBhc1xuICAgIHwgQ2FudmFzUmVuZGVyaW5nQ29udGV4dDJEXG4gICAgfCBPZmZzY3JlZW5DYW52YXNSZW5kZXJpbmdDb250ZXh0MkRcbiAgICB8IG51bGw7XG5cbiAgaWYgKHBpeGVsczJEQ29udGV4dCAhPSBudWxsKSB7XG4gICAgLy8gRGVmYXVsdCB2YWx1ZXMgZm9yIGhlaWdodCBhbmQgd2lkdGggJiBmb3JtYXRcbiAgICBsZXQgd2lkdGg6IG51bWJlcjtcbiAgICBsZXQgaGVpZ2h0OiBudW1iZXI7XG4gICAgaWYgKG9wdGlvbnM/LnRlbnNvckxheW91dCAhPT0gdW5kZWZpbmVkICYmIG9wdGlvbnMudGVuc29yTGF5b3V0ID09PSAnTkhXQycpIHtcbiAgICAgIHdpZHRoID0gdGVuc29yLmRpbXNbMl07XG4gICAgICBoZWlnaHQgPSB0ZW5zb3IuZGltc1szXTtcbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGVmYXVsdCBsYXlvdXQgaXMgTkNXSFxuICAgICAgd2lkdGggPSB0ZW5zb3IuZGltc1szXTtcbiAgICAgIGhlaWdodCA9IHRlbnNvci5kaW1zWzJdO1xuICAgIH1cblxuICAgIGNvbnN0IGlucHV0Zm9ybWF0ID0gb3B0aW9ucz8uZm9ybWF0ICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmZvcm1hdCA6ICdSR0InO1xuXG4gICAgY29uc3Qgbm9ybSA9IG9wdGlvbnM/Lm5vcm07XG4gICAgbGV0IG5vcm1NZWFuOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcbiAgICBsZXQgbm9ybUJpYXM6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdO1xuICAgIGlmIChub3JtID09PSB1bmRlZmluZWQgfHwgbm9ybS5tZWFuID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG5vcm1NZWFuID0gWzI1NSwgMjU1LCAyNTUsIDI1NV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2Ygbm9ybS5tZWFuID09PSAnbnVtYmVyJykge1xuICAgICAgICBub3JtTWVhbiA9IFtub3JtLm1lYW4sIG5vcm0ubWVhbiwgbm9ybS5tZWFuLCBub3JtLm1lYW5dO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9ybU1lYW4gPSBbbm9ybS5tZWFuWzBdLCBub3JtLm1lYW5bMV0sIG5vcm0ubWVhblsyXSwgMF07XG4gICAgICAgIGlmIChub3JtLm1lYW5bM10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG5vcm1NZWFuWzNdID0gbm9ybS5tZWFuWzNdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIGlmIChub3JtID09PSB1bmRlZmluZWQgfHwgbm9ybS5iaWFzID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG5vcm1CaWFzID0gWzAsIDAsIDAsIDBdO1xuICAgIH0gZWxzZSB7XG4gICAgICBpZiAodHlwZW9mIG5vcm0uYmlhcyA9PT0gJ251bWJlcicpIHtcbiAgICAgICAgbm9ybUJpYXMgPSBbbm9ybS5iaWFzLCBub3JtLmJpYXMsIG5vcm0uYmlhcywgbm9ybS5iaWFzXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIG5vcm1CaWFzID0gW25vcm0uYmlhc1swXSwgbm9ybS5iaWFzWzFdLCBub3JtLmJpYXNbMl0sIDBdO1xuICAgICAgICBpZiAobm9ybS5iaWFzWzNdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICBub3JtQmlhc1szXSA9IG5vcm0uYmlhc1szXTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cblxuICAgIGNvbnN0IHN0cmlkZSA9IGhlaWdodCAqIHdpZHRoO1xuICAgIC8vIERlZmF1bHQgcG9pbnRlciBhc3NpZ25tZW50c1xuICAgIGxldCByVGVuc29yUG9pbnRlciA9IDAsXG4gICAgICBnVGVuc29yUG9pbnRlciA9IHN0cmlkZSxcbiAgICAgIGJUZW5zb3JQb2ludGVyID0gc3RyaWRlICogMixcbiAgICAgIGFUZW5zb3JQb2ludGVyID0gLTE7XG5cbiAgICAvLyBVcGRhdGluZyB0aGUgcG9pbnRlciBhc3NpZ25tZW50cyBiYXNlZCBvbiB0aGUgaW5wdXQgaW1hZ2UgZm9ybWF0XG4gICAgaWYgKGlucHV0Zm9ybWF0ID09PSAnUkdCQScpIHtcbiAgICAgIHJUZW5zb3JQb2ludGVyID0gMDtcbiAgICAgIGdUZW5zb3JQb2ludGVyID0gc3RyaWRlO1xuICAgICAgYlRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAyO1xuICAgICAgYVRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAzO1xuICAgIH0gZWxzZSBpZiAoaW5wdXRmb3JtYXQgPT09ICdSR0InKSB7XG4gICAgICByVGVuc29yUG9pbnRlciA9IDA7XG4gICAgICBnVGVuc29yUG9pbnRlciA9IHN0cmlkZTtcbiAgICAgIGJUZW5zb3JQb2ludGVyID0gc3RyaWRlICogMjtcbiAgICB9IGVsc2UgaWYgKGlucHV0Zm9ybWF0ID09PSAnUkJHJykge1xuICAgICAgclRlbnNvclBvaW50ZXIgPSAwO1xuICAgICAgYlRlbnNvclBvaW50ZXIgPSBzdHJpZGU7XG4gICAgICBnVGVuc29yUG9pbnRlciA9IHN0cmlkZSAqIDI7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBoZWlnaHQ7IGkrKykge1xuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB3aWR0aDsgaisrKSB7XG4gICAgICAgIGNvbnN0IFIgPSAoKHRlbnNvci5kYXRhW3JUZW5zb3JQb2ludGVyKytdIGFzIG51bWJlcikgLSBub3JtQmlhc1swXSkgKiBub3JtTWVhblswXTsgLy8gUiB2YWx1ZVxuICAgICAgICBjb25zdCBHID0gKCh0ZW5zb3IuZGF0YVtnVGVuc29yUG9pbnRlcisrXSBhcyBudW1iZXIpIC0gbm9ybUJpYXNbMV0pICogbm9ybU1lYW5bMV07IC8vIEcgdmFsdWVcbiAgICAgICAgY29uc3QgQiA9ICgodGVuc29yLmRhdGFbYlRlbnNvclBvaW50ZXIrK10gYXMgbnVtYmVyKSAtIG5vcm1CaWFzWzJdKSAqIG5vcm1NZWFuWzJdOyAvLyBCIHZhbHVlXG4gICAgICAgIGNvbnN0IEEgPSBhVGVuc29yUG9pbnRlciA9PT0gLTEgPyAyNTUgOiAoKHRlbnNvci5kYXRhW2FUZW5zb3JQb2ludGVyKytdIGFzIG51bWJlcikgLSBub3JtQmlhc1szXSkgKiBub3JtTWVhblszXTsgLy8gQSB2YWx1ZVxuICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L3Jlc3RyaWN0LXBsdXMtb3BlcmFuZHNcbiAgICAgICAgcGl4ZWxzMkRDb250ZXh0LmZpbGxTdHlsZSA9ICdyZ2JhKCcgKyBSICsgJywnICsgRyArICcsJyArIEIgKyAnLCcgKyBBICsgJyknO1xuICAgICAgICBwaXhlbHMyRENvbnRleHQuZmlsbFJlY3QoaiwgaSwgMSwgMSk7XG4gICAgICB9XG4gICAgfVxuICAgIGlmICgndG9EYXRhVVJMJyBpbiBjYW52YXMpIHtcbiAgICAgIHJldHVybiBjYW52YXMudG9EYXRhVVJMKCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigndG9EYXRhVVJMIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gbm90IGFjY2VzcyBpbWFnZSBkYXRhJyk7XG4gIH1cbn07XG5cbi8qKlxuICogaW1wbGVtZW50YXRpb24gb2YgVGVuc29yLnRvSW1hZ2VEYXRhKClcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvclRvSW1hZ2VEYXRhID0gKHRlbnNvcjogVGVuc29yLCBvcHRpb25zPzogVGVuc29yVG9JbWFnZURhdGFPcHRpb25zKTogSW1hZ2VEYXRhID0+IHtcbiAgY29uc3QgcGl4ZWxzMkRDb250ZXh0ID1cbiAgICB0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnXG4gICAgICA/IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpLmdldENvbnRleHQoJzJkJylcbiAgICAgIDogKG5ldyBPZmZzY3JlZW5DYW52YXMoMSwgMSkuZ2V0Q29udGV4dCgnMmQnKSBhcyBPZmZzY3JlZW5DYW52YXNSZW5kZXJpbmdDb250ZXh0MkQpO1xuICBsZXQgaW1hZ2U6IEltYWdlRGF0YTtcbiAgaWYgKHBpeGVsczJEQ29udGV4dCAhPSBudWxsKSB7XG4gICAgLy8gRGVmYXVsdCB2YWx1ZXMgZm9yIGhlaWdodCBhbmQgd2lkdGggJiBmb3JtYXRcbiAgICBsZXQgd2lkdGg6IG51bWJlcjtcbiAgICBsZXQgaGVpZ2h0OiBudW1iZXI7XG4gICAgbGV0IGNoYW5uZWxzOiBudW1iZXI7XG4gICAgaWYgKG9wdGlvbnM/LnRlbnNvckxheW91dCAhPT0gdW5kZWZpbmVkICYmIG9wdGlvbnMudGVuc29yTGF5b3V0ID09PSAnTkhXQycpIHtcbiAgICAgIHdpZHRoID0gdGVuc29yLmRpbXNbMl07XG4gICAgICBoZWlnaHQgPSB0ZW5zb3IuZGltc1sxXTtcbiAgICAgIGNoYW5uZWxzID0gdGVuc29yLmRpbXNbM107XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERlZmF1bHQgbGF5b3V0IGlzIE5DV0hcbiAgICAgIHdpZHRoID0gdGVuc29yLmRpbXNbM107XG4gICAgICBoZWlnaHQgPSB0ZW5zb3IuZGltc1syXTtcbiAgICAgIGNoYW5uZWxzID0gdGVuc29yLmRpbXNbMV07XG4gICAgfVxuICAgIGNvbnN0IGlucHV0Zm9ybWF0ID0gb3B0aW9ucyAhPT0gdW5kZWZpbmVkID8gKG9wdGlvbnMuZm9ybWF0ICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmZvcm1hdCA6ICdSR0InKSA6ICdSR0InO1xuXG4gICAgY29uc3Qgbm9ybSA9IG9wdGlvbnM/Lm5vcm07XG4gICAgbGV0IG5vcm1NZWFuOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcbiAgICBsZXQgbm9ybUJpYXM6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdO1xuICAgIGlmIChub3JtID09PSB1bmRlZmluZWQgfHwgbm9ybS5tZWFuID09PSB1bmRlZmluZWQpIHtcbiAgICAgIG5vcm1NZWFuID0gWzI1NSwgMjU1LCAyNTUsIDI1NV07XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2Ygbm9ybS5tZWFuID09PSAnbnVtYmVyJykge1xuICAgICAgICBub3JtTWVhbiA9IFtub3JtLm1lYW4sIG5vcm0ubWVhbiwgbm9ybS5tZWFuLCBub3JtLm1lYW5dO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9ybU1lYW4gPSBbbm9ybS5tZWFuWzBdLCBub3JtLm1lYW5bMV0sIG5vcm0ubWVhblsyXSwgMjU1XTtcbiAgICAgICAgaWYgKG5vcm0ubWVhblszXSAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgbm9ybU1lYW5bM10gPSBub3JtLm1lYW5bM107XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgaWYgKG5vcm0gPT09IHVuZGVmaW5lZCB8fCBub3JtLmJpYXMgPT09IHVuZGVmaW5lZCkge1xuICAgICAgbm9ybUJpYXMgPSBbMCwgMCwgMCwgMF07XG4gICAgfSBlbHNlIHtcbiAgICAgIGlmICh0eXBlb2Ygbm9ybS5iaWFzID09PSAnbnVtYmVyJykge1xuICAgICAgICBub3JtQmlhcyA9IFtub3JtLmJpYXMsIG5vcm0uYmlhcywgbm9ybS5iaWFzLCBub3JtLmJpYXNdO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbm9ybUJpYXMgPSBbbm9ybS5iaWFzWzBdLCBub3JtLmJpYXNbMV0sIG5vcm0uYmlhc1syXSwgMF07XG4gICAgICAgIGlmIChub3JtLmJpYXNbM10gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG5vcm1CaWFzWzNdID0gbm9ybS5iaWFzWzNdO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgY29uc3Qgc3RyaWRlID0gaGVpZ2h0ICogd2lkdGg7XG4gICAgaWYgKG9wdGlvbnMgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKFxuICAgICAgICAob3B0aW9ucy5mb3JtYXQgIT09IHVuZGVmaW5lZCAmJiBjaGFubmVscyA9PT0gNCAmJiBvcHRpb25zLmZvcm1hdCAhPT0gJ1JHQkEnKSB8fFxuICAgICAgICAoY2hhbm5lbHMgPT09IDMgJiYgb3B0aW9ucy5mb3JtYXQgIT09ICdSR0InICYmIG9wdGlvbnMuZm9ybWF0ICE9PSAnQkdSJylcbiAgICAgICkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUZW5zb3IgZm9ybWF0IGRvZXNuJ3QgbWF0Y2ggaW5wdXQgdGVuc29yIGRpbXNcIik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gRGVmYXVsdCBwb2ludGVyIGFzc2lnbm1lbnRzXG4gICAgY29uc3Qgc3RlcCA9IDQ7XG4gICAgbGV0IHJJbWFnZVBvaW50ZXIgPSAwLFxuICAgICAgZ0ltYWdlUG9pbnRlciA9IDEsXG4gICAgICBiSW1hZ2VQb2ludGVyID0gMixcbiAgICAgIGFJbWFnZVBvaW50ZXIgPSAzO1xuICAgIGxldCByVGVuc29yUG9pbnRlciA9IDAsXG4gICAgICBnVGVuc29yUG9pbnRlciA9IHN0cmlkZSxcbiAgICAgIGJUZW5zb3JQb2ludGVyID0gc3RyaWRlICogMixcbiAgICAgIGFUZW5zb3JQb2ludGVyID0gLTE7XG5cbiAgICAvLyBVcGRhdGluZyB0aGUgcG9pbnRlciBhc3NpZ25tZW50cyBiYXNlZCBvbiB0aGUgaW5wdXQgaW1hZ2UgZm9ybWF0XG4gICAgaWYgKGlucHV0Zm9ybWF0ID09PSAnUkdCQScpIHtcbiAgICAgIHJUZW5zb3JQb2ludGVyID0gMDtcbiAgICAgIGdUZW5zb3JQb2ludGVyID0gc3RyaWRlO1xuICAgICAgYlRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAyO1xuICAgICAgYVRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAzO1xuICAgIH0gZWxzZSBpZiAoaW5wdXRmb3JtYXQgPT09ICdSR0InKSB7XG4gICAgICByVGVuc29yUG9pbnRlciA9IDA7XG4gICAgICBnVGVuc29yUG9pbnRlciA9IHN0cmlkZTtcbiAgICAgIGJUZW5zb3JQb2ludGVyID0gc3RyaWRlICogMjtcbiAgICB9IGVsc2UgaWYgKGlucHV0Zm9ybWF0ID09PSAnUkJHJykge1xuICAgICAgclRlbnNvclBvaW50ZXIgPSAwO1xuICAgICAgYlRlbnNvclBvaW50ZXIgPSBzdHJpZGU7XG4gICAgICBnVGVuc29yUG9pbnRlciA9IHN0cmlkZSAqIDI7XG4gICAgfVxuXG4gICAgaW1hZ2UgPSBwaXhlbHMyRENvbnRleHQuY3JlYXRlSW1hZ2VEYXRhKHdpZHRoLCBoZWlnaHQpO1xuXG4gICAgZm9yIChcbiAgICAgIGxldCBpID0gMDtcbiAgICAgIGkgPCBoZWlnaHQgKiB3aWR0aDtcbiAgICAgIHJJbWFnZVBvaW50ZXIgKz0gc3RlcCwgZ0ltYWdlUG9pbnRlciArPSBzdGVwLCBiSW1hZ2VQb2ludGVyICs9IHN0ZXAsIGFJbWFnZVBvaW50ZXIgKz0gc3RlcCwgaSsrXG4gICAgKSB7XG4gICAgICBpbWFnZS5kYXRhW3JJbWFnZVBvaW50ZXJdID0gKCh0ZW5zb3IuZGF0YVtyVGVuc29yUG9pbnRlcisrXSBhcyBudW1iZXIpIC0gbm9ybUJpYXNbMF0pICogbm9ybU1lYW5bMF07IC8vIFIgdmFsdWVcbiAgICAgIGltYWdlLmRhdGFbZ0ltYWdlUG9pbnRlcl0gPSAoKHRlbnNvci5kYXRhW2dUZW5zb3JQb2ludGVyKytdIGFzIG51bWJlcikgLSBub3JtQmlhc1sxXSkgKiBub3JtTWVhblsxXTsgLy8gRyB2YWx1ZVxuICAgICAgaW1hZ2UuZGF0YVtiSW1hZ2VQb2ludGVyXSA9ICgodGVuc29yLmRhdGFbYlRlbnNvclBvaW50ZXIrK10gYXMgbnVtYmVyKSAtIG5vcm1CaWFzWzJdKSAqIG5vcm1NZWFuWzJdOyAvLyBCIHZhbHVlXG4gICAgICBpbWFnZS5kYXRhW2FJbWFnZVBvaW50ZXJdID1cbiAgICAgICAgYVRlbnNvclBvaW50ZXIgPT09IC0xID8gMjU1IDogKCh0ZW5zb3IuZGF0YVthVGVuc29yUG9pbnRlcisrXSBhcyBudW1iZXIpIC0gbm9ybUJpYXNbM10pICogbm9ybU1lYW5bM107IC8vIEEgdmFsdWVcbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gbm90IGFjY2VzcyBpbWFnZSBkYXRhJyk7XG4gIH1cbiAgcmV0dXJuIGltYWdlO1xufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtcbiAgT3B0aW9uc0RpbWVuc2lvbnMsXG4gIE9wdGlvbnNGb3JtYXQsXG4gIE9wdGlvbnNOb3JtYWxpemF0aW9uUGFyYW1ldGVycyxcbiAgT3B0aW9uc1RlbnNvckZvcm1hdCxcbiAgT3B0aW9uc1RlbnNvckxheW91dCxcbiAgVGVuc29yRnJvbUdwdUJ1ZmZlck9wdGlvbnMsXG4gIFRlbnNvckZyb21JbWFnZUJpdG1hcE9wdGlvbnMsXG4gIFRlbnNvckZyb21JbWFnZURhdGFPcHRpb25zLFxuICBUZW5zb3JGcm9tSW1hZ2VFbGVtZW50T3B0aW9ucyxcbiAgVGVuc29yRnJvbU1MVGVuc29yT3B0aW9ucyxcbiAgVGVuc29yRnJvbVRleHR1cmVPcHRpb25zLFxuICBUZW5zb3JGcm9tVXJsT3B0aW9ucyxcbn0gZnJvbSAnLi90ZW5zb3ItZmFjdG9yeS5qcyc7XG5pbXBvcnQgeyBUZW5zb3IgfSBmcm9tICcuL3RlbnNvci1pbXBsLmpzJztcbmltcG9ydCB7IFRlbnNvciBhcyBUZW5zb3JJbnRlcmZhY2UgfSBmcm9tICcuL3RlbnNvci5qcyc7XG5cbmludGVyZmFjZSBCdWZmZXJUb1RlbnNvck9wdGlvbnNcbiAgZXh0ZW5kcyBPcHRpb25zRGltZW5zaW9ucyxcbiAgICBPcHRpb25zVGVuc29yTGF5b3V0LFxuICAgIE9wdGlvbnNOb3JtYWxpemF0aW9uUGFyYW1ldGVycyxcbiAgICBPcHRpb25zRm9ybWF0LFxuICAgIE9wdGlvbnNUZW5zb3JGb3JtYXQge31cblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgdGVuc29yIG9iamVjdCBmcm9tIGltYWdlIG9iamVjdFxuICpcbiAqIEBwYXJhbSBidWZmZXIgLSBFeHRyYWN0ZWQgaW1hZ2UgYnVmZmVyIGRhdGEgLSBhc3N1bWluZyBSR0JBIGZvcm1hdFxuICogQHBhcmFtIGltYWdlRm9ybWF0IC0gaW5wdXQgaW1hZ2UgY29uZmlndXJhdGlvbiAtIHJlcXVpcmVkIGNvbmZpZ3VyYXRpb25zIGhlaWdodCwgd2lkdGgsIGZvcm1hdFxuICogQHBhcmFtIHRlbnNvckZvcm1hdCAtIG91dHB1dCB0ZW5zb3IgY29uZmlndXJhdGlvbiAtIERlZmF1bHQgaXMgUkdCIGZvcm1hdFxuICovXG5leHBvcnQgY29uc3QgYnVmZmVyVG9UZW5zb3IgPSAoYnVmZmVyOiBVaW50OENsYW1wZWRBcnJheSB8IHVuZGVmaW5lZCwgb3B0aW9uczogQnVmZmVyVG9UZW5zb3JPcHRpb25zKTogVGVuc29yID0+IHtcbiAgaWYgKGJ1ZmZlciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbWFnZSBidWZmZXIgbXVzdCBiZSBkZWZpbmVkJyk7XG4gIH1cbiAgaWYgKG9wdGlvbnMuaGVpZ2h0ID09PSB1bmRlZmluZWQgfHwgb3B0aW9ucy53aWR0aCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbWFnZSBoZWlnaHQgYW5kIHdpZHRoIG11c3QgYmUgZGVmaW5lZCcpO1xuICB9XG4gIGlmIChvcHRpb25zLnRlbnNvckxheW91dCA9PT0gJ05IV0MnKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdOSFdDIFRlbnNvciBsYXlvdXQgaXMgbm90IHN1cHBvcnRlZCB5ZXQnKTtcbiAgfVxuXG4gIGNvbnN0IHsgaGVpZ2h0LCB3aWR0aCB9ID0gb3B0aW9ucztcblxuICBjb25zdCBub3JtID0gb3B0aW9ucy5ub3JtID8/IHsgbWVhbjogMjU1LCBiaWFzOiAwIH07XG4gIGxldCBub3JtTWVhbjogW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XG4gIGxldCBub3JtQmlhczogW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XG5cbiAgaWYgKHR5cGVvZiBub3JtLm1lYW4gPT09ICdudW1iZXInKSB7XG4gICAgbm9ybU1lYW4gPSBbbm9ybS5tZWFuLCBub3JtLm1lYW4sIG5vcm0ubWVhbiwgbm9ybS5tZWFuXTtcbiAgfSBlbHNlIHtcbiAgICBub3JtTWVhbiA9IFtub3JtLm1lYW4hWzBdLCBub3JtLm1lYW4hWzFdLCBub3JtLm1lYW4hWzJdLCBub3JtLm1lYW4hWzNdID8/IDI1NV07XG4gIH1cblxuICBpZiAodHlwZW9mIG5vcm0uYmlhcyA9PT0gJ251bWJlcicpIHtcbiAgICBub3JtQmlhcyA9IFtub3JtLmJpYXMsIG5vcm0uYmlhcywgbm9ybS5iaWFzLCBub3JtLmJpYXNdO1xuICB9IGVsc2Uge1xuICAgIG5vcm1CaWFzID0gW25vcm0uYmlhcyFbMF0sIG5vcm0uYmlhcyFbMV0sIG5vcm0uYmlhcyFbMl0sIG5vcm0uYmlhcyFbM10gPz8gMF07XG4gIH1cblxuICBjb25zdCBpbnB1dGZvcm1hdCA9IG9wdGlvbnMuZm9ybWF0ICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmZvcm1hdCA6ICdSR0JBJztcbiAgLy8gZGVmYXVsdCB2YWx1ZSBpcyBSR0JBIHNpbmNlIGltYWdlZGF0YSBhbmQgSFRNTEltYWdlRWxlbWVudCB1c2VzIGl0XG5cbiAgY29uc3Qgb3V0cHV0Zm9ybWF0ID1cbiAgICBvcHRpb25zLnRlbnNvckZvcm1hdCAhPT0gdW5kZWZpbmVkID8gKG9wdGlvbnMudGVuc29yRm9ybWF0ICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLnRlbnNvckZvcm1hdCA6ICdSR0InKSA6ICdSR0InO1xuICBjb25zdCBzdHJpZGUgPSBoZWlnaHQgKiB3aWR0aDtcbiAgY29uc3QgZmxvYXQzMkRhdGEgPSBvdXRwdXRmb3JtYXQgPT09ICdSR0JBJyA/IG5ldyBGbG9hdDMyQXJyYXkoc3RyaWRlICogNCkgOiBuZXcgRmxvYXQzMkFycmF5KHN0cmlkZSAqIDMpO1xuXG4gIC8vIERlZmF1bHQgcG9pbnRlciBhc3NpZ25tZW50c1xuICBsZXQgc3RlcCA9IDQsXG4gICAgckltYWdlUG9pbnRlciA9IDAsXG4gICAgZ0ltYWdlUG9pbnRlciA9IDEsXG4gICAgYkltYWdlUG9pbnRlciA9IDIsXG4gICAgYUltYWdlUG9pbnRlciA9IDM7XG4gIGxldCByVGVuc29yUG9pbnRlciA9IDAsXG4gICAgZ1RlbnNvclBvaW50ZXIgPSBzdHJpZGUsXG4gICAgYlRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAyLFxuICAgIGFUZW5zb3JQb2ludGVyID0gLTE7XG5cbiAgLy8gVXBkYXRpbmcgdGhlIHBvaW50ZXIgYXNzaWdubWVudHMgYmFzZWQgb24gdGhlIGlucHV0IGltYWdlIGZvcm1hdFxuICBpZiAoaW5wdXRmb3JtYXQgPT09ICdSR0InKSB7XG4gICAgc3RlcCA9IDM7XG4gICAgckltYWdlUG9pbnRlciA9IDA7XG4gICAgZ0ltYWdlUG9pbnRlciA9IDE7XG4gICAgYkltYWdlUG9pbnRlciA9IDI7XG4gICAgYUltYWdlUG9pbnRlciA9IC0xO1xuICB9XG5cbiAgLy8gVXBkYXRpbmcgdGhlIHBvaW50ZXIgYXNzaWdubWVudHMgYmFzZWQgb24gdGhlIG91dHB1dCB0ZW5zb3IgZm9ybWF0XG4gIGlmIChvdXRwdXRmb3JtYXQgPT09ICdSR0JBJykge1xuICAgIGFUZW5zb3JQb2ludGVyID0gc3RyaWRlICogMztcbiAgfSBlbHNlIGlmIChvdXRwdXRmb3JtYXQgPT09ICdSQkcnKSB7XG4gICAgclRlbnNvclBvaW50ZXIgPSAwO1xuICAgIGJUZW5zb3JQb2ludGVyID0gc3RyaWRlO1xuICAgIGdUZW5zb3JQb2ludGVyID0gc3RyaWRlICogMjtcbiAgfSBlbHNlIGlmIChvdXRwdXRmb3JtYXQgPT09ICdCR1InKSB7XG4gICAgYlRlbnNvclBvaW50ZXIgPSAwO1xuICAgIGdUZW5zb3JQb2ludGVyID0gc3RyaWRlO1xuICAgIHJUZW5zb3JQb2ludGVyID0gc3RyaWRlICogMjtcbiAgfVxuXG4gIGZvciAoXG4gICAgbGV0IGkgPSAwO1xuICAgIGkgPCBzdHJpZGU7XG4gICAgaSsrLCBySW1hZ2VQb2ludGVyICs9IHN0ZXAsIGJJbWFnZVBvaW50ZXIgKz0gc3RlcCwgZ0ltYWdlUG9pbnRlciArPSBzdGVwLCBhSW1hZ2VQb2ludGVyICs9IHN0ZXBcbiAgKSB7XG4gICAgZmxvYXQzMkRhdGFbclRlbnNvclBvaW50ZXIrK10gPSAoYnVmZmVyW3JJbWFnZVBvaW50ZXJdICsgbm9ybUJpYXNbMF0pIC8gbm9ybU1lYW5bMF07XG4gICAgZmxvYXQzMkRhdGFbZ1RlbnNvclBvaW50ZXIrK10gPSAoYnVmZmVyW2dJbWFnZVBvaW50ZXJdICsgbm9ybUJpYXNbMV0pIC8gbm9ybU1lYW5bMV07XG4gICAgZmxvYXQzMkRhdGFbYlRlbnNvclBvaW50ZXIrK10gPSAoYnVmZmVyW2JJbWFnZVBvaW50ZXJdICsgbm9ybUJpYXNbMl0pIC8gbm9ybU1lYW5bMl07XG4gICAgaWYgKGFUZW5zb3JQb2ludGVyICE9PSAtMSAmJiBhSW1hZ2VQb2ludGVyICE9PSAtMSkge1xuICAgICAgZmxvYXQzMkRhdGFbYVRlbnNvclBvaW50ZXIrK10gPSAoYnVmZmVyW2FJbWFnZVBvaW50ZXJdICsgbm9ybUJpYXNbM10pIC8gbm9ybU1lYW5bM107XG4gICAgfVxuICB9XG5cbiAgLy8gRmxvYXQzMkFycmF5IC0+IG9ydC5UZW5zb3JcbiAgY29uc3Qgb3V0cHV0VGVuc29yID1cbiAgICBvdXRwdXRmb3JtYXQgPT09ICdSR0JBJ1xuICAgICAgPyBuZXcgVGVuc29yKCdmbG9hdDMyJywgZmxvYXQzMkRhdGEsIFsxLCA0LCBoZWlnaHQsIHdpZHRoXSlcbiAgICAgIDogbmV3IFRlbnNvcignZmxvYXQzMicsIGZsb2F0MzJEYXRhLCBbMSwgMywgaGVpZ2h0LCB3aWR0aF0pO1xuICByZXR1cm4gb3V0cHV0VGVuc29yO1xufTtcblxuLyoqXG4gKiBpbXBsZW1lbnRhdGlvbiBvZiBUZW5zb3IuZnJvbUltYWdlKCkuXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW5zb3JGcm9tSW1hZ2UgPSBhc3luYyAoXG4gIGltYWdlOiBJbWFnZURhdGEgfCBIVE1MSW1hZ2VFbGVtZW50IHwgSW1hZ2VCaXRtYXAgfCBzdHJpbmcsXG4gIG9wdGlvbnM/OlxuICAgIHwgVGVuc29yRnJvbUltYWdlRGF0YU9wdGlvbnNcbiAgICB8IFRlbnNvckZyb21JbWFnZUVsZW1lbnRPcHRpb25zXG4gICAgfCBUZW5zb3JGcm9tSW1hZ2VCaXRtYXBPcHRpb25zXG4gICAgfCBUZW5zb3JGcm9tVXJsT3B0aW9ucyxcbik6IFByb21pc2U8VGVuc29yPiA9PiB7XG4gIC8vIGNoZWNraW5nIHRoZSB0eXBlIG9mIGltYWdlIG9iamVjdFxuICBjb25zdCBpc0hUTUxJbWFnZUVsZSA9IHR5cGVvZiBIVE1MSW1hZ2VFbGVtZW50ICE9PSAndW5kZWZpbmVkJyAmJiBpbWFnZSBpbnN0YW5jZW9mIEhUTUxJbWFnZUVsZW1lbnQ7XG4gIGNvbnN0IGlzSW1hZ2VEYXRhRWxlID0gdHlwZW9mIEltYWdlRGF0YSAhPT0gJ3VuZGVmaW5lZCcgJiYgaW1hZ2UgaW5zdGFuY2VvZiBJbWFnZURhdGE7XG4gIGNvbnN0IGlzSW1hZ2VCaXRtYXAgPSB0eXBlb2YgSW1hZ2VCaXRtYXAgIT09ICd1bmRlZmluZWQnICYmIGltYWdlIGluc3RhbmNlb2YgSW1hZ2VCaXRtYXA7XG4gIGNvbnN0IGlzU3RyaW5nID0gdHlwZW9mIGltYWdlID09PSAnc3RyaW5nJztcblxuICBsZXQgZGF0YTogVWludDhDbGFtcGVkQXJyYXkgfCB1bmRlZmluZWQ7XG4gIGxldCBidWZmZXJUb1RlbnNvck9wdGlvbnM6IEJ1ZmZlclRvVGVuc29yT3B0aW9ucyA9IG9wdGlvbnMgPz8ge307XG5cbiAgY29uc3QgY3JlYXRlQ2FudmFzID0gKCkgPT4ge1xuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICByZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgfSBlbHNlIGlmICh0eXBlb2YgT2Zmc2NyZWVuQ2FudmFzICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgcmV0dXJuIG5ldyBPZmZzY3JlZW5DYW52YXMoMSwgMSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FudmFzIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbiAgICB9XG4gIH07XG4gIGNvbnN0IGNyZWF0ZUNhbnZhc0NvbnRleHQgPSAoY2FudmFzOiBIVE1MQ2FudmFzRWxlbWVudCB8IE9mZnNjcmVlbkNhbnZhcykgPT4ge1xuICAgIGlmICh0eXBlb2YgSFRNTENhbnZhc0VsZW1lbnQgIT09ICd1bmRlZmluZWQnICYmIGNhbnZhcyBpbnN0YW5jZW9mIEhUTUxDYW52YXNFbGVtZW50KSB7XG4gICAgICByZXR1cm4gY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgfSBlbHNlIGlmIChjYW52YXMgaW5zdGFuY2VvZiBPZmZzY3JlZW5DYW52YXMpIHtcbiAgICAgIHJldHVybiBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKSBhcyBPZmZzY3JlZW5DYW52YXNSZW5kZXJpbmdDb250ZXh0MkQ7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBudWxsO1xuICAgIH1cbiAgfTtcbiAgLy8gZmlsbGluZyBhbmQgY2hlY2tpbmcgaW1hZ2UgY29uZmlndXJhdGlvbiBvcHRpb25zXG4gIGlmIChpc0hUTUxJbWFnZUVsZSkge1xuICAgIC8vIEhUTUxJbWFnZUVsZW1lbnQgLSBpbWFnZSBvYmplY3QgLSBmb3JtYXQgaXMgUkdCQSBieSBkZWZhdWx0XG4gICAgY29uc3QgY2FudmFzID0gY3JlYXRlQ2FudmFzKCk7XG4gICAgY2FudmFzLndpZHRoID0gaW1hZ2Uud2lkdGg7XG4gICAgY2FudmFzLmhlaWdodCA9IGltYWdlLmhlaWdodDtcbiAgICBjb25zdCBwaXhlbHMyRENvbnRleHQgPSBjcmVhdGVDYW52YXNDb250ZXh0KGNhbnZhcyk7XG5cbiAgICBpZiAocGl4ZWxzMkRDb250ZXh0ICE9IG51bGwpIHtcbiAgICAgIGxldCBoZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XG4gICAgICBsZXQgd2lkdGggPSBpbWFnZS53aWR0aDtcbiAgICAgIGlmIChvcHRpb25zICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5yZXNpemVkSGVpZ2h0ICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5yZXNpemVkV2lkdGggIT09IHVuZGVmaW5lZCkge1xuICAgICAgICBoZWlnaHQgPSBvcHRpb25zLnJlc2l6ZWRIZWlnaHQ7XG4gICAgICAgIHdpZHRoID0gb3B0aW9ucy5yZXNpemVkV2lkdGg7XG4gICAgICB9XG5cbiAgICAgIGlmIChvcHRpb25zICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zID0gb3B0aW9ucztcbiAgICAgICAgaWYgKG9wdGlvbnMudGVuc29yRm9ybWF0ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ltYWdlIGlucHV0IGNvbmZpZyBmb3JtYXQgbXVzdCBiZSBSR0JBIGZvciBIVE1MSW1hZ2VFbGVtZW50Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLnRlbnNvckZvcm1hdCA9ICdSR0JBJztcbiAgICAgICAgfVxuICAgICAgICBidWZmZXJUb1RlbnNvck9wdGlvbnMuaGVpZ2h0ID0gaGVpZ2h0O1xuICAgICAgICBidWZmZXJUb1RlbnNvck9wdGlvbnMud2lkdGggPSB3aWR0aDtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucy50ZW5zb3JGb3JtYXQgPSAnUkdCQSc7XG4gICAgICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucy53aWR0aCA9IHdpZHRoO1xuICAgICAgfVxuXG4gICAgICBwaXhlbHMyRENvbnRleHQuZHJhd0ltYWdlKGltYWdlLCAwLCAwKTtcbiAgICAgIGRhdGEgPSBwaXhlbHMyRENvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIHdpZHRoLCBoZWlnaHQpLmRhdGE7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG5vdCBhY2Nlc3MgaW1hZ2UgZGF0YScpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChpc0ltYWdlRGF0YUVsZSkge1xuICAgIGxldCBoZWlnaHQ6IG51bWJlcjtcbiAgICBsZXQgd2lkdGg6IG51bWJlcjtcblxuICAgIGlmIChvcHRpb25zICE9PSB1bmRlZmluZWQgJiYgb3B0aW9ucy5yZXNpemVkV2lkdGggIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLnJlc2l6ZWRIZWlnaHQgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaGVpZ2h0ID0gb3B0aW9ucy5yZXNpemVkSGVpZ2h0O1xuICAgICAgd2lkdGggPSBvcHRpb25zLnJlc2l6ZWRXaWR0aDtcbiAgICB9IGVsc2Uge1xuICAgICAgaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xuICAgICAgd2lkdGggPSBpbWFnZS53aWR0aDtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBidWZmZXJUb1RlbnNvck9wdGlvbnMgPSBvcHRpb25zO1xuICAgIH1cbiAgICBidWZmZXJUb1RlbnNvck9wdGlvbnMuZm9ybWF0ID0gJ1JHQkEnO1xuICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLndpZHRoID0gd2lkdGg7XG5cbiAgICBpZiAob3B0aW9ucyAhPT0gdW5kZWZpbmVkKSB7XG4gICAgICBjb25zdCB0ZW1wQ2FudmFzID0gY3JlYXRlQ2FudmFzKCk7XG5cbiAgICAgIHRlbXBDYW52YXMud2lkdGggPSB3aWR0aDtcbiAgICAgIHRlbXBDYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gICAgICBjb25zdCBwaXhlbHMyRENvbnRleHQgPSBjcmVhdGVDYW52YXNDb250ZXh0KHRlbXBDYW52YXMpO1xuXG4gICAgICBpZiAocGl4ZWxzMkRDb250ZXh0ICE9IG51bGwpIHtcbiAgICAgICAgcGl4ZWxzMkRDb250ZXh0LnB1dEltYWdlRGF0YShpbWFnZSwgMCwgMCk7XG4gICAgICAgIGRhdGEgPSBwaXhlbHMyRENvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIHdpZHRoLCBoZWlnaHQpLmRhdGE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBub3QgYWNjZXNzIGltYWdlIGRhdGEnKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgZGF0YSA9IGltYWdlLmRhdGE7XG4gICAgfVxuICB9IGVsc2UgaWYgKGlzSW1hZ2VCaXRtYXApIHtcbiAgICAvLyBJbWFnZUJpdG1hcCAtIGltYWdlIG9iamVjdCAtIGZvcm1hdCBtdXN0IGJlIHByb3ZpZGVkIGJ5IHVzZXJcbiAgICBpZiAob3B0aW9ucyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsZWFzZSBwcm92aWRlIGltYWdlIGNvbmZpZyB3aXRoIGZvcm1hdCBmb3IgSW1hZ2ViaXRtYXAnKTtcbiAgICB9XG5cbiAgICBjb25zdCBjYW52YXMgPSBjcmVhdGVDYW52YXMoKTtcbiAgICBjYW52YXMud2lkdGggPSBpbWFnZS53aWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xuICAgIGNvbnN0IHBpeGVsczJEQ29udGV4dCA9IGNyZWF0ZUNhbnZhc0NvbnRleHQoY2FudmFzKTtcblxuICAgIGlmIChwaXhlbHMyRENvbnRleHQgIT0gbnVsbCkge1xuICAgICAgY29uc3QgaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xuICAgICAgY29uc3Qgd2lkdGggPSBpbWFnZS53aWR0aDtcbiAgICAgIHBpeGVsczJEQ29udGV4dC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgZGF0YSA9IHBpeGVsczJEQ29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGgsIGhlaWdodCkuZGF0YTtcbiAgICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucy5oZWlnaHQgPSBoZWlnaHQ7XG4gICAgICBidWZmZXJUb1RlbnNvck9wdGlvbnMud2lkdGggPSB3aWR0aDtcbiAgICAgIHJldHVybiBidWZmZXJUb1RlbnNvcihkYXRhLCBidWZmZXJUb1RlbnNvck9wdGlvbnMpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbiBub3QgYWNjZXNzIGltYWdlIGRhdGEnKTtcbiAgICB9XG4gIH0gZWxzZSBpZiAoaXNTdHJpbmcpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgY2FudmFzID0gY3JlYXRlQ2FudmFzKCk7XG4gICAgICBjb25zdCBjb250ZXh0ID0gY3JlYXRlQ2FudmFzQ29udGV4dChjYW52YXMpO1xuICAgICAgaWYgKCFpbWFnZSB8fCAhY29udGV4dCkge1xuICAgICAgICByZXR1cm4gcmVqZWN0KCk7XG4gICAgICB9XG4gICAgICBjb25zdCBuZXdJbWFnZSA9IG5ldyBJbWFnZSgpO1xuICAgICAgbmV3SW1hZ2UuY3Jvc3NPcmlnaW4gPSAnQW5vbnltb3VzJztcbiAgICAgIG5ld0ltYWdlLnNyYyA9IGltYWdlO1xuICAgICAgbmV3SW1hZ2Uub25sb2FkID0gKCkgPT4ge1xuICAgICAgICBjYW52YXMud2lkdGggPSBuZXdJbWFnZS53aWR0aDtcbiAgICAgICAgY2FudmFzLmhlaWdodCA9IG5ld0ltYWdlLmhlaWdodDtcbiAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UobmV3SW1hZ2UsIDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG4gICAgICAgIGNvbnN0IGltZyA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XG5cbiAgICAgICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLmhlaWdodCA9IGNhbnZhcy5oZWlnaHQ7XG4gICAgICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucy53aWR0aCA9IGNhbnZhcy53aWR0aDtcbiAgICAgICAgcmVzb2x2ZShidWZmZXJUb1RlbnNvcihpbWcuZGF0YSwgYnVmZmVyVG9UZW5zb3JPcHRpb25zKSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHRocm93IG5ldyBFcnJvcignSW5wdXQgZGF0YSBwcm92aWRlZCBpcyBub3Qgc3VwcG9ydGVkIC0gYWJvcnRlZCB0ZW5zb3IgY3JlYXRpb24nKTtcbiAgfVxuXG4gIGlmIChkYXRhICE9PSB1bmRlZmluZWQpIHtcbiAgICByZXR1cm4gYnVmZmVyVG9UZW5zb3IoZGF0YSwgYnVmZmVyVG9UZW5zb3JPcHRpb25zKTtcbiAgfSBlbHNlIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0lucHV0IGRhdGEgcHJvdmlkZWQgaXMgbm90IHN1cHBvcnRlZCAtIGFib3J0ZWQgdGVuc29yIGNyZWF0aW9uJyk7XG4gIH1cbn07XG5cbi8qKlxuICogaW1wbGVtZW50YXRpb24gb2YgVGVuc29yLmZyb21UZXh0dXJlKCkuXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW5zb3JGcm9tVGV4dHVyZSA9IDxUIGV4dGVuZHMgVGVuc29ySW50ZXJmYWNlLlRleHR1cmVEYXRhVHlwZXM+KFxuICB0ZXh0dXJlOiBUZW5zb3JJbnRlcmZhY2UuVGV4dHVyZVR5cGUsXG4gIG9wdGlvbnM6IFRlbnNvckZyb21UZXh0dXJlT3B0aW9uczxUPixcbik6IFRlbnNvciA9PiB7XG4gIGNvbnN0IHsgd2lkdGgsIGhlaWdodCwgZG93bmxvYWQsIGRpc3Bvc2UgfSA9IG9wdGlvbnM7XG4gIC8vIEFsd2F5cyBhc3N1bWUgUkdCQUYzMi4gVE9ETzogc3VwcG9ydCBkaWZmZXJlbnQgdGV4dHVyZSBmb3JtYXRcbiAgY29uc3QgZGltcyA9IFsxLCBoZWlnaHQsIHdpZHRoLCA0XTtcbiAgcmV0dXJuIG5ldyBUZW5zb3IoeyBsb2NhdGlvbjogJ3RleHR1cmUnLCB0eXBlOiAnZmxvYXQzMicsIHRleHR1cmUsIGRpbXMsIGRvd25sb2FkLCBkaXNwb3NlIH0pO1xufTtcblxuLyoqXG4gKiBpbXBsZW1lbnRhdGlvbiBvZiBUZW5zb3IuZnJvbUdwdUJ1ZmZlcigpLlxuICovXG5leHBvcnQgY29uc3QgdGVuc29yRnJvbUdwdUJ1ZmZlciA9IDxUIGV4dGVuZHMgVGVuc29ySW50ZXJmYWNlLkdwdUJ1ZmZlckRhdGFUeXBlcz4oXG4gIGdwdUJ1ZmZlcjogVGVuc29ySW50ZXJmYWNlLkdwdUJ1ZmZlclR5cGUsXG4gIG9wdGlvbnM6IFRlbnNvckZyb21HcHVCdWZmZXJPcHRpb25zPFQ+LFxuKTogVGVuc29yID0+IHtcbiAgY29uc3QgeyBkYXRhVHlwZSwgZGltcywgZG93bmxvYWQsIGRpc3Bvc2UgfSA9IG9wdGlvbnM7XG4gIHJldHVybiBuZXcgVGVuc29yKHsgbG9jYXRpb246ICdncHUtYnVmZmVyJywgdHlwZTogZGF0YVR5cGUgPz8gJ2Zsb2F0MzInLCBncHVCdWZmZXIsIGRpbXMsIGRvd25sb2FkLCBkaXNwb3NlIH0pO1xufTtcblxuLyoqXG4gKiBpbXBsZW1lbnRhdGlvbiBvZiBUZW5zb3IuZnJvbU1MVGVuc29yKCkuXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW5zb3JGcm9tTUxUZW5zb3IgPSA8VCBleHRlbmRzIFRlbnNvckludGVyZmFjZS5NTFRlbnNvckRhdGFUeXBlcz4oXG4gIG1sVGVuc29yOiBUZW5zb3JJbnRlcmZhY2UuTUxUZW5zb3JUeXBlLFxuICBvcHRpb25zOiBUZW5zb3JGcm9tTUxUZW5zb3JPcHRpb25zPFQ+LFxuKTogVGVuc29yID0+IHtcbiAgY29uc3QgeyBkYXRhVHlwZSwgZGltcywgZG93bmxvYWQsIGRpc3Bvc2UgfSA9IG9wdGlvbnM7XG4gIHJldHVybiBuZXcgVGVuc29yKHsgbG9jYXRpb246ICdtbC10ZW5zb3InLCB0eXBlOiBkYXRhVHlwZSA/PyAnZmxvYXQzMicsIG1sVGVuc29yLCBkaW1zLCBkb3dubG9hZCwgZGlzcG9zZSB9KTtcbn07XG5cbi8qKlxuICogaW1wbGVtZW50YXRpb24gb2YgVGVuc29yLmZyb21QaW5uZWRCdWZmZXIoKS5cbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvckZyb21QaW5uZWRCdWZmZXIgPSA8VCBleHRlbmRzIFRlbnNvckludGVyZmFjZS5DcHVQaW5uZWREYXRhVHlwZXM+KFxuICB0eXBlOiBULFxuICBidWZmZXI6IFRlbnNvckludGVyZmFjZS5EYXRhVHlwZU1hcFtUXSxcbiAgZGltcz86IHJlYWRvbmx5IG51bWJlcltdLFxuKTogVGVuc29yID0+IG5ldyBUZW5zb3IoeyBsb2NhdGlvbjogJ2NwdS1waW5uZWQnLCB0eXBlLCBkYXRhOiBidWZmZXIsIGRpbXM6IGRpbXMgPz8gW2J1ZmZlci5sZW5ndGhdIH0pO1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgeyBUZW5zb3IgfSBmcm9tICcuL3RlbnNvci5qcyc7XG5cbmV4cG9ydCB0eXBlIFN1cHBvcnRlZFR5cGVkQXJyYXlDb25zdHJ1Y3RvcnMgPVxuICB8IEZsb2F0MzJBcnJheUNvbnN0cnVjdG9yXG4gIHwgVWludDhBcnJheUNvbnN0cnVjdG9yXG4gIHwgSW50OEFycmF5Q29uc3RydWN0b3JcbiAgfCBVaW50MTZBcnJheUNvbnN0cnVjdG9yXG4gIHwgSW50MTZBcnJheUNvbnN0cnVjdG9yXG4gIHwgSW50MzJBcnJheUNvbnN0cnVjdG9yXG4gIHwgQmlnSW50NjRBcnJheUNvbnN0cnVjdG9yXG4gIHwgVWludDhBcnJheUNvbnN0cnVjdG9yXG4gIHwgRmxvYXQ2NEFycmF5Q29uc3RydWN0b3JcbiAgfCBVaW50MzJBcnJheUNvbnN0cnVjdG9yXG4gIHwgQmlnVWludDY0QXJyYXlDb25zdHJ1Y3RvcjtcbmV4cG9ydCB0eXBlIFN1cHBvcnRlZFR5cGVkQXJyYXkgPSBJbnN0YW5jZVR5cGU8U3VwcG9ydGVkVHlwZWRBcnJheUNvbnN0cnVjdG9ycz47XG5cbi8vIGEgcnVudGltZSBtYXAgdGhhdCBtYXBzIHR5cGUgc3RyaW5nIHRvIFR5cGVkQXJyYXkgY29uc3RydWN0b3IuIFNob3VsZCBtYXRjaCBUZW5zb3IuRGF0YVR5cGVNYXAuXG5leHBvcnQgY29uc3QgTlVNRVJJQ19URU5TT1JfVFlQRV9UT19UWVBFREFSUkFZX01BUCA9IG5ldyBNYXA8c3RyaW5nLCBTdXBwb3J0ZWRUeXBlZEFycmF5Q29uc3RydWN0b3JzPihbXG4gIFsnZmxvYXQzMicsIEZsb2F0MzJBcnJheV0sXG4gIFsndWludDgnLCBVaW50OEFycmF5XSxcbiAgWydpbnQ4JywgSW50OEFycmF5XSxcbiAgWyd1aW50MTYnLCBVaW50MTZBcnJheV0sXG4gIFsnaW50MTYnLCBJbnQxNkFycmF5XSxcbiAgWydpbnQzMicsIEludDMyQXJyYXldLFxuICBbJ2Jvb2wnLCBVaW50OEFycmF5XSxcbiAgWydmbG9hdDY0JywgRmxvYXQ2NEFycmF5XSxcbiAgWyd1aW50MzInLCBVaW50MzJBcnJheV0sXG4gIFsnaW50NCcsIFVpbnQ4QXJyYXldLFxuICBbJ3VpbnQ0JywgVWludDhBcnJheV0sXG5dKTtcblxuLy8gYSBydW50aW1lIG1hcCB0aGF0IG1hcHMgdHlwZSBzdHJpbmcgdG8gVHlwZWRBcnJheSBjb25zdHJ1Y3Rvci4gU2hvdWxkIG1hdGNoIFRlbnNvci5EYXRhVHlwZU1hcC5cbmV4cG9ydCBjb25zdCBOVU1FUklDX1RFTlNPUl9UWVBFREFSUkFZX1RPX1RZUEVfTUFQID0gbmV3IE1hcDxTdXBwb3J0ZWRUeXBlZEFycmF5Q29uc3RydWN0b3JzLCBUZW5zb3IuVHlwZT4oW1xuICBbRmxvYXQzMkFycmF5LCAnZmxvYXQzMiddLFxuICBbVWludDhBcnJheSwgJ3VpbnQ4J10sXG4gIFtJbnQ4QXJyYXksICdpbnQ4J10sXG4gIFtVaW50MTZBcnJheSwgJ3VpbnQxNiddLFxuICBbSW50MTZBcnJheSwgJ2ludDE2J10sXG4gIFtJbnQzMkFycmF5LCAnaW50MzInXSxcbiAgW0Zsb2F0NjRBcnJheSwgJ2Zsb2F0NjQnXSxcbiAgW1VpbnQzMkFycmF5LCAndWludDMyJ10sXG5dKTtcblxuLy8gdGhlIGZvbGxvd2luZyBjb2RlIGFsbG93cyBkZWxheWluZyBleGVjdXRpb24gb2YgQmlnSW50L0Zsb2F0MTZBcnJheSBjaGVja2luZy4gVGhpcyBhbGxvd3MgbGF6eSBpbml0aWFsaXphdGlvbiBmb3Jcbi8vIE5VTUVSSUNfVEVOU09SX1RZUEVfVE9fVFlQRURBUlJBWV9NQVAgYW5kIE5VTUVSSUNfVEVOU09SX1RZUEVEQVJSQVlfVE9fVFlQRV9NQVAsIHdoaWNoIGFsbG93cyBCaWdJbnQvRmxvYXQxNkFycmF5XG4vLyBwb2x5ZmlsbCBpZiBhdmFpbGFibGUuXG5sZXQgaXNUeXBlZEFycmF5Q2hlY2tlZCA9IGZhbHNlO1xuZXhwb3J0IGNvbnN0IGNoZWNrVHlwZWRBcnJheSA9ICgpID0+IHtcbiAgaWYgKCFpc1R5cGVkQXJyYXlDaGVja2VkKSB7XG4gICAgaXNUeXBlZEFycmF5Q2hlY2tlZCA9IHRydWU7XG4gICAgY29uc3QgaXNCaWdJbnQ2NEFycmF5QXZhaWxhYmxlID0gdHlwZW9mIEJpZ0ludDY0QXJyYXkgIT09ICd1bmRlZmluZWQnICYmIEJpZ0ludDY0QXJyYXkuZnJvbTtcbiAgICBjb25zdCBpc0JpZ1VpbnQ2NEFycmF5QXZhaWxhYmxlID0gdHlwZW9mIEJpZ1VpbnQ2NEFycmF5ICE9PSAndW5kZWZpbmVkJyAmJiBCaWdVaW50NjRBcnJheS5mcm9tO1xuXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvbiwgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgIGNvbnN0IEZsb2F0MTZBcnJheSA9IChnbG9iYWxUaGlzIGFzIGFueSkuRmxvYXQxNkFycmF5O1xuICAgIGNvbnN0IGlzRmxvYXQxNkFycmF5QXZhaWxhYmxlID0gdHlwZW9mIEZsb2F0MTZBcnJheSAhPT0gJ3VuZGVmaW5lZCcgJiYgRmxvYXQxNkFycmF5LmZyb207XG5cbiAgICBpZiAoaXNCaWdJbnQ2NEFycmF5QXZhaWxhYmxlKSB7XG4gICAgICBOVU1FUklDX1RFTlNPUl9UWVBFX1RPX1RZUEVEQVJSQVlfTUFQLnNldCgnaW50NjQnLCBCaWdJbnQ2NEFycmF5KTtcbiAgICAgIE5VTUVSSUNfVEVOU09SX1RZUEVEQVJSQVlfVE9fVFlQRV9NQVAuc2V0KEJpZ0ludDY0QXJyYXksICdpbnQ2NCcpO1xuICAgIH1cbiAgICBpZiAoaXNCaWdVaW50NjRBcnJheUF2YWlsYWJsZSkge1xuICAgICAgTlVNRVJJQ19URU5TT1JfVFlQRV9UT19UWVBFREFSUkFZX01BUC5zZXQoJ3VpbnQ2NCcsIEJpZ1VpbnQ2NEFycmF5KTtcbiAgICAgIE5VTUVSSUNfVEVOU09SX1RZUEVEQVJSQVlfVE9fVFlQRV9NQVAuc2V0KEJpZ1VpbnQ2NEFycmF5LCAndWludDY0Jyk7XG4gICAgfVxuICAgIGlmIChpc0Zsb2F0MTZBcnJheUF2YWlsYWJsZSkge1xuICAgICAgTlVNRVJJQ19URU5TT1JfVFlQRV9UT19UWVBFREFSUkFZX01BUC5zZXQoJ2Zsb2F0MTYnLCBGbG9hdDE2QXJyYXkpO1xuICAgICAgTlVNRVJJQ19URU5TT1JfVFlQRURBUlJBWV9UT19UWVBFX01BUC5zZXQoRmxvYXQxNkFycmF5LCAnZmxvYXQxNicpO1xuICAgIH0gZWxzZSB7XG4gICAgICAvLyBpZiBGbG9hdDE2QXJyYXkgaXMgbm90IGF2YWlsYWJsZSwgdXNlICdVaW50MTZBcnJheScgdG8gc3RvcmUgdGhlIGRhdGEuXG4gICAgICBOVU1FUklDX1RFTlNPUl9UWVBFX1RPX1RZUEVEQVJSQVlfTUFQLnNldCgnZmxvYXQxNicsIFVpbnQxNkFycmF5KTtcbiAgICB9XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7XG4gIENwdVBpbm5lZENvbnN0cnVjdG9yUGFyYW1ldGVycyxcbiAgR3B1QnVmZmVyQ29uc3RydWN0b3JQYXJhbWV0ZXJzLFxuICBNTFRlbnNvckNvbnN0cnVjdG9yUGFyYW1ldGVycyxcbiAgVGV4dHVyZUNvbnN0cnVjdG9yUGFyYW1ldGVycyxcbn0gZnJvbSAnLi90ZW5zb3ItZmFjdG9yeS5qcyc7XG5pbXBvcnQgeyBUZW5zb3IgfSBmcm9tICcuL3RlbnNvci1pbXBsLmpzJztcblxuLyoqXG4gKiBjYWxjdWxhdGUgc2l6ZSBmcm9tIGRpbXMuXG4gKlxuICogQHBhcmFtIGRpbXMgdGhlIGRpbXMgYXJyYXkuIE1heSBiZSBhbiBpbGxlZ2FsIGlucHV0LlxuICovXG5leHBvcnQgY29uc3QgY2FsY3VsYXRlU2l6ZSA9IChkaW1zOiByZWFkb25seSB1bmtub3duW10pOiBudW1iZXIgPT4ge1xuICBsZXQgc2l6ZSA9IDE7XG4gIGZvciAobGV0IGkgPSAwOyBpIDwgZGltcy5sZW5ndGg7IGkrKykge1xuICAgIGNvbnN0IGRpbSA9IGRpbXNbaV07XG4gICAgaWYgKHR5cGVvZiBkaW0gIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNTYWZlSW50ZWdlcihkaW0pKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBkaW1zWyR7aX1dIG11c3QgYmUgYW4gaW50ZWdlciwgZ290OiAke2RpbX1gKTtcbiAgICB9XG4gICAgaWYgKGRpbSA8IDApIHtcbiAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGBkaW1zWyR7aX1dIG11c3QgYmUgYSBub24tbmVnYXRpdmUgaW50ZWdlciwgZ290OiAke2RpbX1gKTtcbiAgICB9XG4gICAgc2l6ZSAqPSBkaW07XG4gIH1cbiAgcmV0dXJuIHNpemU7XG59O1xuXG4vKipcbiAqIGltcGxlbWVudGF0aW9uIG9mIFRlbnNvci5yZXNoYXBlKClcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvclJlc2hhcGUgPSAodGVuc29yOiBUZW5zb3IsIGRpbXM6IHJlYWRvbmx5IG51bWJlcltdKTogVGVuc29yID0+IHtcbiAgc3dpdGNoICh0ZW5zb3IubG9jYXRpb24pIHtcbiAgICBjYXNlICdjcHUnOlxuICAgICAgcmV0dXJuIG5ldyBUZW5zb3IodGVuc29yLnR5cGUsIHRlbnNvci5kYXRhLCBkaW1zKTtcbiAgICBjYXNlICdjcHUtcGlubmVkJzpcbiAgICAgIHJldHVybiBuZXcgVGVuc29yKHtcbiAgICAgICAgbG9jYXRpb246ICdjcHUtcGlubmVkJyxcbiAgICAgICAgZGF0YTogdGVuc29yLmRhdGEgYXMgQ3B1UGlubmVkQ29uc3RydWN0b3JQYXJhbWV0ZXJzWydkYXRhJ10sXG4gICAgICAgIHR5cGU6IHRlbnNvci50eXBlIGFzIENwdVBpbm5lZENvbnN0cnVjdG9yUGFyYW1ldGVyc1sndHlwZSddLFxuICAgICAgICBkaW1zLFxuICAgICAgfSk7XG4gICAgY2FzZSAndGV4dHVyZSc6XG4gICAgICByZXR1cm4gbmV3IFRlbnNvcih7XG4gICAgICAgIGxvY2F0aW9uOiAndGV4dHVyZScsXG4gICAgICAgIHRleHR1cmU6IHRlbnNvci50ZXh0dXJlLFxuICAgICAgICB0eXBlOiB0ZW5zb3IudHlwZSBhcyBUZXh0dXJlQ29uc3RydWN0b3JQYXJhbWV0ZXJzWyd0eXBlJ10sXG4gICAgICAgIGRpbXMsXG4gICAgICB9KTtcbiAgICBjYXNlICdncHUtYnVmZmVyJzpcbiAgICAgIHJldHVybiBuZXcgVGVuc29yKHtcbiAgICAgICAgbG9jYXRpb246ICdncHUtYnVmZmVyJyxcbiAgICAgICAgZ3B1QnVmZmVyOiB0ZW5zb3IuZ3B1QnVmZmVyLFxuICAgICAgICB0eXBlOiB0ZW5zb3IudHlwZSBhcyBHcHVCdWZmZXJDb25zdHJ1Y3RvclBhcmFtZXRlcnNbJ3R5cGUnXSxcbiAgICAgICAgZGltcyxcbiAgICAgIH0pO1xuICAgIGNhc2UgJ21sLXRlbnNvcic6XG4gICAgICByZXR1cm4gbmV3IFRlbnNvcih7XG4gICAgICAgIGxvY2F0aW9uOiAnbWwtdGVuc29yJyxcbiAgICAgICAgbWxUZW5zb3I6IHRlbnNvci5tbFRlbnNvcixcbiAgICAgICAgdHlwZTogdGVuc29yLnR5cGUgYXMgTUxUZW5zb3JDb25zdHJ1Y3RvclBhcmFtZXRlcnNbJ3R5cGUnXSxcbiAgICAgICAgZGltcyxcbiAgICAgIH0pO1xuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHRlbnNvclJlc2hhcGU6IHRlbnNvciBsb2NhdGlvbiAke3RlbnNvci5sb2NhdGlvbn0gaXMgbm90IHN1cHBvcnRlZGApO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgeyB0ZW5zb3JUb0RhdGFVUkwsIHRlbnNvclRvSW1hZ2VEYXRhIH0gZnJvbSAnLi90ZW5zb3ItY29udmVyc2lvbi1pbXBsLmpzJztcbmltcG9ydCB7IFRlbnNvclRvRGF0YVVybE9wdGlvbnMsIFRlbnNvclRvSW1hZ2VEYXRhT3B0aW9ucyB9IGZyb20gJy4vdGVuc29yLWNvbnZlcnNpb24uanMnO1xuaW1wb3J0IHtcbiAgdGVuc29yRnJvbUdwdUJ1ZmZlcixcbiAgdGVuc29yRnJvbUltYWdlLFxuICB0ZW5zb3JGcm9tTUxUZW5zb3IsXG4gIHRlbnNvckZyb21QaW5uZWRCdWZmZXIsXG4gIHRlbnNvckZyb21UZXh0dXJlLFxufSBmcm9tICcuL3RlbnNvci1mYWN0b3J5LWltcGwuanMnO1xuaW1wb3J0IHtcbiAgQ3B1UGlubmVkQ29uc3RydWN0b3JQYXJhbWV0ZXJzLFxuICBHcHVCdWZmZXJDb25zdHJ1Y3RvclBhcmFtZXRlcnMsXG4gIE1MVGVuc29yQ29uc3RydWN0b3JQYXJhbWV0ZXJzLFxuICBUZW5zb3JGcm9tR3B1QnVmZmVyT3B0aW9ucyxcbiAgVGVuc29yRnJvbUltYWdlQml0bWFwT3B0aW9ucyxcbiAgVGVuc29yRnJvbUltYWdlRGF0YU9wdGlvbnMsXG4gIFRlbnNvckZyb21JbWFnZUVsZW1lbnRPcHRpb25zLFxuICBUZW5zb3JGcm9tTUxUZW5zb3JPcHRpb25zLFxuICBUZW5zb3JGcm9tVGV4dHVyZU9wdGlvbnMsXG4gIFRlbnNvckZyb21VcmxPcHRpb25zLFxuICBUZXh0dXJlQ29uc3RydWN0b3JQYXJhbWV0ZXJzLFxufSBmcm9tICcuL3RlbnNvci1mYWN0b3J5LmpzJztcbmltcG9ydCB7XG4gIGNoZWNrVHlwZWRBcnJheSxcbiAgTlVNRVJJQ19URU5TT1JfVFlQRV9UT19UWVBFREFSUkFZX01BUCxcbiAgTlVNRVJJQ19URU5TT1JfVFlQRURBUlJBWV9UT19UWVBFX01BUCxcbiAgU3VwcG9ydGVkVHlwZWRBcnJheSxcbiAgU3VwcG9ydGVkVHlwZWRBcnJheUNvbnN0cnVjdG9ycyxcbn0gZnJvbSAnLi90ZW5zb3ItaW1wbC10eXBlLW1hcHBpbmcuanMnO1xuaW1wb3J0IHsgY2FsY3VsYXRlU2l6ZSwgdGVuc29yUmVzaGFwZSB9IGZyb20gJy4vdGVuc29yLXV0aWxzLWltcGwuanMnO1xuaW1wb3J0IHsgVGVuc29yIGFzIFRlbnNvckludGVyZmFjZSB9IGZyb20gJy4vdGVuc29yLmpzJztcblxuLy8gdHlwZSBhbGlhc2VzIGZvciB0aG9zZSBleHBvcnRlZCBmcm9tIFRlbnNvciBpbnRlcmZhY2VcblxudHlwZSBUZW5zb3JUeXBlID0gVGVuc29ySW50ZXJmYWNlLlR5cGU7XG50eXBlIFRlbnNvckRhdGFUeXBlID0gVGVuc29ySW50ZXJmYWNlLkRhdGFUeXBlO1xudHlwZSBUZW5zb3JEYXRhTG9jYXRpb24gPSBUZW5zb3JJbnRlcmZhY2UuRGF0YUxvY2F0aW9uO1xudHlwZSBUZW5zb3JUZXh0dXJlVHlwZSA9IFRlbnNvckludGVyZmFjZS5UZXh0dXJlVHlwZTtcbnR5cGUgVGVuc29yR3B1QnVmZmVyVHlwZSA9IFRlbnNvckludGVyZmFjZS5HcHVCdWZmZXJUeXBlO1xudHlwZSBUZW5zb3JNTFRlbnNvclR5cGUgPSBUZW5zb3JJbnRlcmZhY2UuTUxUZW5zb3JUeXBlO1xuXG4vKipcbiAqIHRoZSBpbXBsZW1lbnRhdGlvbiBvZiBUZW5zb3IgaW50ZXJmYWNlLlxuICpcbiAqIEBpZ25vcmVcbiAqL1xuZXhwb3J0IGNsYXNzIFRlbnNvciBpbXBsZW1lbnRzIFRlbnNvckludGVyZmFjZSB7XG4gIC8vICNyZWdpb24gY29uc3RydWN0b3JzXG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBDUFUgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiB0eXBlLCBkYXRhIGFuZCBkaW1zLlxuICAgKi9cbiAgY29uc3RydWN0b3IoXG4gICAgdHlwZTogVGVuc29yVHlwZSxcbiAgICBkYXRhOiBUZW5zb3JEYXRhVHlwZSB8IFVpbnQ4Q2xhbXBlZEFycmF5IHwgcmVhZG9ubHkgc3RyaW5nW10gfCByZWFkb25seSBudW1iZXJbXSB8IHJlYWRvbmx5IGJvb2xlYW5bXSxcbiAgICBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10sXG4gICk7XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgQ1BVIHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBhbmQgZGltcy4gVHlwZSBpcyBpbmZlcnJlZCBmcm9tIGRhdGEuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBkYXRhOiBUZW5zb3JEYXRhVHlwZSB8IFVpbnQ4Q2xhbXBlZEFycmF5IHwgcmVhZG9ubHkgc3RyaW5nW10gfCByZWFkb25seSBib29sZWFuW10sXG4gICAgZGltcz86IHJlYWRvbmx5IG51bWJlcltdLFxuICApO1xuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHRlbnNvciBvYmplY3QgZnJvbSB0aGUgcGlubmVkIENQVSBkYXRhIHdpdGggdGhlIGdpdmVuIHR5cGUgYW5kIGRpbXMuXG4gICAqXG4gICAqIFRlbnNvcidzIGxvY2F0aW9uIHdpbGwgYmUgc2V0IHRvICdjcHUtcGlubmVkJy5cbiAgICpcbiAgICogQHBhcmFtIHBhcmFtcyAtIFNwZWNpZnkgdGhlIHBhcmFtZXRlcnMgdG8gY29uc3RydWN0IHRoZSB0ZW5zb3IuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXJhbXM6IENwdVBpbm5lZENvbnN0cnVjdG9yUGFyYW1ldGVycyk7XG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBXZWJHTCB0ZXh0dXJlIHdpdGggdGhlIGdpdmVuIHR5cGUgYW5kIGRpbXMuXG4gICAqXG4gICAqIFRlbnNvcidzIGxvY2F0aW9uIHdpbGwgYmUgc2V0IHRvICd0ZXh0dXJlJy5cbiAgICpcbiAgICogQHBhcmFtIHBhcmFtcyAtIFNwZWNpZnkgdGhlIHBhcmFtZXRlcnMgdG8gY29uc3RydWN0IHRoZSB0ZW5zb3IuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXJhbXM6IFRleHR1cmVDb25zdHJ1Y3RvclBhcmFtZXRlcnMpO1xuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHRlbnNvciBvYmplY3QgZnJvbSB0aGUgV2ViR1BVIGJ1ZmZlciB3aXRoIHRoZSBnaXZlbiB0eXBlIGFuZCBkaW1zLlxuICAgKlxuICAgKiBUZW5zb3IncyBsb2NhdGlvbiB3aWxsIGJlIHNldCB0byAnZ3B1LWJ1ZmZlcicuXG4gICAqXG4gICAqIEBwYXJhbSBwYXJhbXMgLSBTcGVjaWZ5IHRoZSBwYXJhbWV0ZXJzIHRvIGNvbnN0cnVjdCB0aGUgdGVuc29yLlxuICAgKi9cbiAgY29uc3RydWN0b3IocGFyYW1zOiBHcHVCdWZmZXJDb25zdHJ1Y3RvclBhcmFtZXRlcnMpO1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBXZWJOTiBNTFRlbnNvciB3aXRoIHRoZSBnaXZlbiB0eXBlIGFuZCBkaW1zLlxuICAgKlxuICAgKiBUZW5zb3IncyBsb2NhdGlvbiB3aWxsIGJlIHNldCB0byAnbWwtdGVuc29yJy5cbiAgICpcbiAgICogQHBhcmFtIHBhcmFtcyAtIFNwZWNpZnkgdGhlIHBhcmFtZXRlcnMgdG8gY29uc3RydWN0IHRoZSB0ZW5zb3IuXG4gICAqL1xuICBjb25zdHJ1Y3RvcihwYXJhbXM6IE1MVGVuc29yQ29uc3RydWN0b3JQYXJhbWV0ZXJzKTtcblxuICAvKipcbiAgICogaW1wbGVtZW50YXRpb24uXG4gICAqL1xuICBjb25zdHJ1Y3RvcihcbiAgICBhcmcwOlxuICAgICAgfCBUZW5zb3JUeXBlXG4gICAgICB8IFRlbnNvckRhdGFUeXBlXG4gICAgICB8IFVpbnQ4Q2xhbXBlZEFycmF5XG4gICAgICB8IHJlYWRvbmx5IHN0cmluZ1tdXG4gICAgICB8IHJlYWRvbmx5IGJvb2xlYW5bXVxuICAgICAgfCBDcHVQaW5uZWRDb25zdHJ1Y3RvclBhcmFtZXRlcnNcbiAgICAgIHwgVGV4dHVyZUNvbnN0cnVjdG9yUGFyYW1ldGVyc1xuICAgICAgfCBHcHVCdWZmZXJDb25zdHJ1Y3RvclBhcmFtZXRlcnNcbiAgICAgIHwgTUxUZW5zb3JDb25zdHJ1Y3RvclBhcmFtZXRlcnMsXG4gICAgYXJnMT86IFRlbnNvckRhdGFUeXBlIHwgVWludDhDbGFtcGVkQXJyYXkgfCByZWFkb25seSBudW1iZXJbXSB8IHJlYWRvbmx5IHN0cmluZ1tdIHwgcmVhZG9ubHkgYm9vbGVhbltdLFxuICAgIGFyZzI/OiByZWFkb25seSBudW1iZXJbXSxcbiAgKSB7XG4gICAgLy8gcGVyZm9ybSBvbmUtdGltZSBjaGVjayBmb3IgQmlnSW50L0Zsb2F0MTZBcnJheSBzdXBwb3J0XG4gICAgY2hlY2tUeXBlZEFycmF5KCk7XG5cbiAgICBsZXQgdHlwZTogVGVuc29yVHlwZTtcbiAgICBsZXQgZGltczogcmVhZG9ubHkgbnVtYmVyW107XG5cbiAgICBpZiAodHlwZW9mIGFyZzAgPT09ICdvYmplY3QnICYmICdsb2NhdGlvbicgaW4gYXJnMCkge1xuICAgICAgLy9cbiAgICAgIC8vIGNvbnN0cnVjdGluZyB0ZW5zb3IgZnJvbSBzcGVjaWZpYyBsb2NhdGlvblxuICAgICAgLy9cbiAgICAgIHRoaXMuZGF0YUxvY2F0aW9uID0gYXJnMC5sb2NhdGlvbjtcbiAgICAgIHR5cGUgPSBhcmcwLnR5cGU7XG4gICAgICBkaW1zID0gYXJnMC5kaW1zO1xuICAgICAgc3dpdGNoIChhcmcwLmxvY2F0aW9uKSB7XG4gICAgICAgIGNhc2UgJ2NwdS1waW5uZWQnOiB7XG4gICAgICAgICAgY29uc3QgZXhwZWN0ZWRUeXBlZEFycmF5Q29uc3RydWN0b3IgPSBOVU1FUklDX1RFTlNPUl9UWVBFX1RPX1RZUEVEQVJSQVlfTUFQLmdldCh0eXBlKTtcbiAgICAgICAgICBpZiAoIWV4cGVjdGVkVHlwZWRBcnJheUNvbnN0cnVjdG9yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGB1bnN1cHBvcnRlZCB0eXBlIFwiJHt0eXBlfVwiIHRvIGNyZWF0ZSB0ZW5zb3IgZnJvbSBwaW5uZWQgYnVmZmVyYCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICghKGFyZzAuZGF0YSBpbnN0YW5jZW9mIGV4cGVjdGVkVHlwZWRBcnJheUNvbnN0cnVjdG9yKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgYnVmZmVyIHNob3VsZCBiZSBvZiB0eXBlICR7ZXhwZWN0ZWRUeXBlZEFycmF5Q29uc3RydWN0b3IubmFtZX1gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5jcHVEYXRhID0gYXJnMC5kYXRhO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ3RleHR1cmUnOiB7XG4gICAgICAgICAgaWYgKHR5cGUgIT09ICdmbG9hdDMyJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgdW5zdXBwb3J0ZWQgdHlwZSBcIiR7dHlwZX1cIiB0byBjcmVhdGUgdGVuc29yIGZyb20gdGV4dHVyZWApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLmdwdVRleHR1cmVEYXRhID0gYXJnMC50ZXh0dXJlO1xuICAgICAgICAgIHRoaXMuZG93bmxvYWRlciA9IGFyZzAuZG93bmxvYWQ7XG4gICAgICAgICAgdGhpcy5kaXNwb3NlciA9IGFyZzAuZGlzcG9zZTtcbiAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBjYXNlICdncHUtYnVmZmVyJzoge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIHR5cGUgIT09ICdmbG9hdDMyJyAmJlxuICAgICAgICAgICAgdHlwZSAhPT0gJ2Zsb2F0MTYnICYmXG4gICAgICAgICAgICB0eXBlICE9PSAnaW50MzInICYmXG4gICAgICAgICAgICB0eXBlICE9PSAnaW50NjQnICYmXG4gICAgICAgICAgICB0eXBlICE9PSAndWludDMyJyAmJlxuICAgICAgICAgICAgdHlwZSAhPT0gJ3VpbnQ4JyAmJlxuICAgICAgICAgICAgdHlwZSAhPT0gJ2Jvb2wnICYmXG4gICAgICAgICAgICB0eXBlICE9PSAndWludDQnICYmXG4gICAgICAgICAgICB0eXBlICE9PSAnaW50NCdcbiAgICAgICAgICApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYHVuc3VwcG9ydGVkIHR5cGUgXCIke3R5cGV9XCIgdG8gY3JlYXRlIHRlbnNvciBmcm9tIGdwdSBidWZmZXJgKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdGhpcy5ncHVCdWZmZXJEYXRhID0gYXJnMC5ncHVCdWZmZXI7XG4gICAgICAgICAgdGhpcy5kb3dubG9hZGVyID0gYXJnMC5kb3dubG9hZDtcbiAgICAgICAgICB0aGlzLmRpc3Bvc2VyID0gYXJnMC5kaXNwb3NlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGNhc2UgJ21sLXRlbnNvcic6IHtcbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICB0eXBlICE9PSAnZmxvYXQzMicgJiZcbiAgICAgICAgICAgIHR5cGUgIT09ICdmbG9hdDE2JyAmJlxuICAgICAgICAgICAgdHlwZSAhPT0gJ2ludDMyJyAmJlxuICAgICAgICAgICAgdHlwZSAhPT0gJ2ludDY0JyAmJlxuICAgICAgICAgICAgdHlwZSAhPT0gJ3VpbnQzMicgJiZcbiAgICAgICAgICAgIHR5cGUgIT09ICd1aW50NjQnICYmXG4gICAgICAgICAgICB0eXBlICE9PSAnaW50OCcgJiZcbiAgICAgICAgICAgIHR5cGUgIT09ICd1aW50OCcgJiZcbiAgICAgICAgICAgIHR5cGUgIT09ICdib29sJyAmJlxuICAgICAgICAgICAgdHlwZSAhPT0gJ3VpbnQ0JyAmJlxuICAgICAgICAgICAgdHlwZSAhPT0gJ2ludDQnXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGB1bnN1cHBvcnRlZCB0eXBlIFwiJHt0eXBlfVwiIHRvIGNyZWF0ZSB0ZW5zb3IgZnJvbSBNTFRlbnNvcmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICB0aGlzLm1sVGVuc29yRGF0YSA9IGFyZzAubWxUZW5zb3I7XG4gICAgICAgICAgdGhpcy5kb3dubG9hZGVyID0gYXJnMC5kb3dubG9hZDtcbiAgICAgICAgICB0aGlzLmRpc3Bvc2VyID0gYXJnMC5kaXNwb3NlO1xuICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUZW5zb3IgY29uc3RydWN0b3I6IHVuc3VwcG9ydGVkIGxvY2F0aW9uICcke3RoaXMuZGF0YUxvY2F0aW9ufSdgKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy9cbiAgICAgIC8vIGNvbnN0cnVjdGluZyB0ZW5zb3Igb2YgbG9jYXRpb24gJ2NwdSdcbiAgICAgIC8vXG4gICAgICBsZXQgZGF0YTogVGVuc29yRGF0YVR5cGU7XG4gICAgICBsZXQgbWF5YmVEaW1zOiB0eXBlb2YgYXJnMSB8IHR5cGVvZiBhcmcyO1xuICAgICAgLy8gY2hlY2sgd2hldGhlciBhcmcwIGlzIHR5cGUgb3IgZGF0YVxuICAgICAgaWYgKHR5cGVvZiBhcmcwID09PSAnc3RyaW5nJykge1xuICAgICAgICAvL1xuICAgICAgICAvLyBPdmVycmlkZTogY29uc3RydWN0b3IodHlwZSwgZGF0YSwgLi4uKVxuICAgICAgICAvL1xuICAgICAgICB0eXBlID0gYXJnMDtcbiAgICAgICAgbWF5YmVEaW1zID0gYXJnMjtcbiAgICAgICAgaWYgKGFyZzAgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgLy8gc3RyaW5nIHRlbnNvclxuICAgICAgICAgIGlmICghQXJyYXkuaXNBcnJheShhcmcxKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkEgc3RyaW5nIHRlbnNvcidzIGRhdGEgbXVzdCBiZSBhIHN0cmluZyBhcnJheS5cIik7XG4gICAgICAgICAgfVxuICAgICAgICAgIC8vIHdlIGRvbid0IGNoZWNrIHdoZXRoZXIgZXZlcnkgZWxlbWVudCBpbiB0aGUgYXJyYXkgaXMgc3RyaW5nOyB0aGlzIGlzIHRvbyBzbG93LiB3ZSBhc3N1bWUgaXQncyBjb3JyZWN0IGFuZFxuICAgICAgICAgIC8vIGVycm9yIHdpbGwgYmUgcG9wdWxhdGVkIGF0IGluZmVyZW5jZVxuICAgICAgICAgIGRhdGEgPSBhcmcxO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIG51bWVyaWMgdGVuc29yXG4gICAgICAgICAgY29uc3QgdHlwZWRBcnJheUNvbnN0cnVjdG9yID0gTlVNRVJJQ19URU5TT1JfVFlQRV9UT19UWVBFREFSUkFZX01BUC5nZXQoYXJnMCk7XG4gICAgICAgICAgaWYgKHR5cGVkQXJyYXlDb25zdHJ1Y3RvciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBVbnN1cHBvcnRlZCB0ZW5zb3IgdHlwZTogJHthcmcwfS5gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXJnMSkpIHtcbiAgICAgICAgICAgIGlmICgoYXJnMCA9PT0gJ2Zsb2F0MTYnICYmIHR5cGVkQXJyYXlDb25zdHJ1Y3RvciA9PT0gVWludDE2QXJyYXkpIHx8IGFyZzAgPT09ICd1aW50NCcgfHwgYXJnMCA9PT0gJ2ludDQnKSB7XG4gICAgICAgICAgICAgIC8vIC0gJ2Zsb2F0MTYnOlxuICAgICAgICAgICAgICAvLyAgIFdoZW4gbm8gRmxvYXQxNkFycmF5IHBvbHlmaWxsIGlzIHVzZWQsIHdlIGNhbm5vdCBjcmVhdGUgJ2Zsb2F0MTYnIHRlbnNvciBmcm9tIG51bWJlciBhcnJheS5cbiAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgLy8gICBUaHJvdyBlcnJvciBoZXJlIGJlY2F1c2Ugd2hlbiB1c2VyIHRyeSB0byB1c2UgbnVtYmVyIGFycmF5IGFzIGRhdGEsXG4gICAgICAgICAgICAgIC8vICAgZS5nLiBuZXcgVGVuc29yKCdmbG9hdDE2JywgWzEsIDIsIDMsIDRdLCBkaW1zKSksIGl0IHdpbGwgYWN0dWFsbHkgY2FsbFxuICAgICAgICAgICAgICAvLyAgIFVpbnQxNkFycmF5LmZyb20oYXJnMSkgd2hpY2ggZ2VuZXJhdGVzIHdyb25nIGRhdGEuXG4gICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgIC8vIC0gJ3VpbnQ0JyBhbmQgJ2ludDQnOlxuICAgICAgICAgICAgICAvLyAgIFVpbnQ4QXJyYXkuZnJvbShhcmcxKSB3aWxsIGdlbmVyYXRlIHdyb25nIGRhdGEgZm9yICd1aW50NCcgYW5kICdpbnQ0JyB0ZW5zb3IuXG4gICAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXG4gICAgICAgICAgICAgICAgYENyZWF0aW5nIGEgJHthcmcwfSB0ZW5zb3IgZnJvbSBudW1iZXIgYXJyYXkgaXMgbm90IHN1cHBvcnRlZC4gUGxlYXNlIHVzZSAke3R5cGVkQXJyYXlDb25zdHJ1Y3Rvci5uYW1lfSBhcyBkYXRhLmAsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZzAgPT09ICd1aW50NjQnIHx8IGFyZzAgPT09ICdpbnQ2NCcpIHtcbiAgICAgICAgICAgICAgLy8gdXNlICdhcyBhbnknIGhlcmUgYmVjYXVzZTpcbiAgICAgICAgICAgICAgLy8gMS4gVHlwZVNjcmlwdCdzIGNoZWNrIG9uIHR5cGUgb2YgJ0FycmF5LmlzQXJyYXkoKScgZG9lcyBub3Qgd29yayB3aXRoIHJlYWRvbmx5IGFycmF5cy5cbiAgICAgICAgICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMTcwMDJcbiAgICAgICAgICAgICAgLy8gMi4gVHlwZVNjcmlwdCdzIGNoZWNrIG9uIHVuaW9uIHR5cGUgb2YgJyhCaWdJbnQ2NEFycmF5Q29uc3RydWN0b3J8QmlnVWludDY0QXJyYXlDb25zdHJ1Y3RvcikuZnJvbSgpJ1xuICAgICAgICAgICAgICAvLyBkb2VzIG5vdCBhY2NlcHQgcGFyYW1ldGVyIG1hcEZuLlxuICAgICAgICAgICAgICAvLyAzLiBwYXJhbWV0ZXJzIG9mICdTdXBwb3J0ZWRUeXBlZEFycmF5Q29uc3RydWN0b3JzLmZyb20oKScgZG9lcyBub3QgbWF0Y2ggdGhlIHJlcXVpcmVtZW50IG9mIHRoZSB1bmlvblxuICAgICAgICAgICAgICAvLyB0eXBlLlxuXG4gICAgICAgICAgICAgIC8vIGFzc3VtZSAnYXJnMScgaXMgb2YgdHlwZSBcInJlYWRvbmx5IG51bWJlcltdfHJlYWRvbmx5IGJpZ2ludFtdXCIgaGVyZS5cblxuICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICAgICAgICAgICAgICBkYXRhID0gKHR5cGVkQXJyYXlDb25zdHJ1Y3RvciBhcyBhbnkpLmZyb20oYXJnMSwgQmlnSW50KTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIC8vIGFzc3VtZSAnYXJnMScgaXMgb2YgdHlwZSBcInJlYWRvbmx5IG51bWJlcltdXCIgaGVyZS5cbiAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcbiAgICAgICAgICAgICAgZGF0YSA9ICh0eXBlZEFycmF5Q29uc3RydWN0b3IgYXMgYW55KS5mcm9tKGFyZzEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgIH0gZWxzZSBpZiAoYXJnMSBpbnN0YW5jZW9mIHR5cGVkQXJyYXlDb25zdHJ1Y3Rvcikge1xuICAgICAgICAgICAgZGF0YSA9IGFyZzE7XG4gICAgICAgICAgfSBlbHNlIGlmIChhcmcxIGluc3RhbmNlb2YgVWludDhDbGFtcGVkQXJyYXkpIHtcbiAgICAgICAgICAgIGlmIChhcmcwID09PSAndWludDgnKSB7XG4gICAgICAgICAgICAgIGRhdGEgPSBVaW50OEFycmF5LmZyb20oYXJnMSk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBBIFVpbnQ4Q2xhbXBlZEFycmF5IHRlbnNvcidzIGRhdGEgbXVzdCBiZSB0eXBlIG9mIHVpbnQ4YCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSBlbHNlIGlmIChhcmcwID09PSAnZmxvYXQxNicgJiYgYXJnMSBpbnN0YW5jZW9mIFVpbnQxNkFycmF5ICYmIHR5cGVkQXJyYXlDb25zdHJ1Y3RvciAhPT0gVWludDE2QXJyYXkpIHtcbiAgICAgICAgICAgIC8vIHdoZW4gRmxvYXQxNkFycmF5IGlzIGF2YWlsYWJsZSBhbmQgZGF0YSBpcyBvZiB0eXBlIFVpbnQxNkFycmF5LlxuICAgICAgICAgICAgLy8gV2UgYWxsb3cgVWludDE2QXJyYXkgdG8gYmUgcGFzc2VkIGluIGFzIGRhdGEgZm9yICdmbG9hdDE2JyB0ZW5zb3IgdW50aWwgRmxvYXQxNkFycmF5IGlzIGdlbmVyYWxseVxuICAgICAgICAgICAgLy8gc3VwcG9ydGVkIGluIEphdmFTY3JpcHQgZW52aXJvbm1lbnQuXG5cbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgICAgICBkYXRhID0gbmV3IChnbG9iYWxUaGlzIGFzIGFueSkuRmxvYXQxNkFycmF5KGFyZzEuYnVmZmVyLCBhcmcxLmJ5dGVPZmZzZXQsIGFyZzEubGVuZ3RoKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgQSAke3R5cGV9IHRlbnNvcidzIGRhdGEgbXVzdCBiZSB0eXBlIG9mICR7dHlwZWRBcnJheUNvbnN0cnVjdG9yfWApO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSBlbHNlIHtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gT3ZlcnJpZGU6IGNvbnN0cnVjdG9yKGRhdGEsIC4uLilcbiAgICAgICAgLy9cbiAgICAgICAgbWF5YmVEaW1zID0gYXJnMTtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXJnMCkpIHtcbiAgICAgICAgICAvLyBvbmx5IGJvb2xlYW5bXSBhbmQgc3RyaW5nW10gaXMgc3VwcG9ydGVkXG4gICAgICAgICAgaWYgKGFyZzAubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdUZW5zb3IgdHlwZSBjYW5ub3QgYmUgaW5mZXJyZWQgZnJvbSBhbiBlbXB0eSBhcnJheS4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgZmlyc3RFbGVtZW50VHlwZSA9IHR5cGVvZiBhcmcwWzBdO1xuICAgICAgICAgIGlmIChmaXJzdEVsZW1lbnRUeXBlID09PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgdHlwZSA9ICdzdHJpbmcnO1xuICAgICAgICAgICAgZGF0YSA9IGFyZzA7XG4gICAgICAgICAgfSBlbHNlIGlmIChmaXJzdEVsZW1lbnRUeXBlID09PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICAgIHR5cGUgPSAnYm9vbCc7XG4gICAgICAgICAgICAvLyAnYXJnMCcgaXMgb2YgdHlwZSAnYm9vbGVhbltdJy4gVWludDhBcnJheS5mcm9tKGJvb2xlYW5bXSkgYWN0dWFsbHkgd29ya3MsIGJ1dCB0eXBlc2NyaXB0IHRoaW5rcyB0aGlzIGlzXG4gICAgICAgICAgICAvLyB3cm9uZyB0eXBlLiBXZSB1c2UgJ2FzIGFueScgdG8gbWFrZSBpdCBoYXBweS5cbiAgICAgICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XG4gICAgICAgICAgICBkYXRhID0gVWludDhBcnJheS5mcm9tKGFyZzAgYXMgYW55W10pO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBJbnZhbGlkIGVsZW1lbnQgdHlwZSBvZiBkYXRhIGFycmF5OiAke2ZpcnN0RWxlbWVudFR5cGV9LmApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIGlmIChhcmcwIGluc3RhbmNlb2YgVWludDhDbGFtcGVkQXJyYXkpIHtcbiAgICAgICAgICB0eXBlID0gJ3VpbnQ4JztcbiAgICAgICAgICBkYXRhID0gVWludDhBcnJheS5mcm9tKGFyZzApO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIC8vIGdldCB0ZW5zb3IgdHlwZSBmcm9tIFR5cGVkQXJyYXlcbiAgICAgICAgICBjb25zdCBtYXBwZWRUeXBlID0gTlVNRVJJQ19URU5TT1JfVFlQRURBUlJBWV9UT19UWVBFX01BUC5nZXQoXG4gICAgICAgICAgICBhcmcwLmNvbnN0cnVjdG9yIGFzIFN1cHBvcnRlZFR5cGVkQXJyYXlDb25zdHJ1Y3RvcnMsXG4gICAgICAgICAgKTtcbiAgICAgICAgICBpZiAobWFwcGVkVHlwZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBVbnN1cHBvcnRlZCB0eXBlIGZvciB0ZW5zb3IgZGF0YTogJHthcmcwLmNvbnN0cnVjdG9yfS5gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgdHlwZSA9IG1hcHBlZFR5cGU7XG4gICAgICAgICAgZGF0YSA9IGFyZzAgYXMgU3VwcG9ydGVkVHlwZWRBcnJheTtcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICAvLyB0eXBlIGFuZCBkYXRhIGlzIHByb2Nlc3NlZCwgbm93IHByb2Nlc3NpbmcgZGltc1xuICAgICAgaWYgKG1heWJlRGltcyA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgIC8vIGFzc3VtZSAxLUQgdGVuc29yIGlmIGRpbXMgb21pdHRlZFxuICAgICAgICBtYXliZURpbXMgPSBbZGF0YS5sZW5ndGhdO1xuICAgICAgfSBlbHNlIGlmICghQXJyYXkuaXNBcnJheShtYXliZURpbXMpKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJBIHRlbnNvcidzIGRpbXMgbXVzdCBiZSBhIG51bWJlciBhcnJheVwiKTtcbiAgICAgIH1cbiAgICAgIGRpbXMgPSBtYXliZURpbXMgYXMgcmVhZG9ubHkgbnVtYmVyW107XG5cbiAgICAgIHRoaXMuY3B1RGF0YSA9IGRhdGE7XG4gICAgICB0aGlzLmRhdGFMb2NhdGlvbiA9ICdjcHUnO1xuICAgIH1cblxuICAgIC8vIHBlcmZvcm0gY2hlY2sgb24gZGltc1xuICAgIGNvbnN0IHNpemUgPSBjYWxjdWxhdGVTaXplKGRpbXMpO1xuICAgIC8vIGlmIGRhdGEgaXMgb24gQ1BVLCBjaGVjayB3aGV0aGVyIGRhdGEgbGVuZ3RoIG1hdGNoZXMgdGVuc29yIHNpemVcbiAgICBpZiAodGhpcy5jcHVEYXRhICYmIHNpemUgIT09IHRoaXMuY3B1RGF0YS5sZW5ndGgpIHtcbiAgICAgIGlmICgodHlwZSA9PT0gJ3VpbnQ0JyB8fCB0eXBlID09PSAnaW50NCcpICYmIE1hdGguY2VpbChzaXplIC8gMikgPT09IHRoaXMuY3B1RGF0YS5sZW5ndGgpIHtcbiAgICAgICAgLy8gZm9yICh1KWludDQsIHRoZSBkYXRhIGxlbmd0aCBpcyBoYWxmIG9mIHRoZSB0ZW5zb3Igc2l6ZS4gU28gd2UgY2hlY2sgdGhpcyBzcGVjaWFsIGNhc2Ugd2hlbiBzaXplIGlzIG9kZC5cbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgVGVuc29yJ3Mgc2l6ZSgke3NpemV9KSBkb2VzIG5vdCBtYXRjaCBkYXRhIGxlbmd0aCgke3RoaXMuY3B1RGF0YS5sZW5ndGh9KS5gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICB0aGlzLnR5cGUgPSB0eXBlO1xuICAgIHRoaXMuZGltcyA9IGRpbXM7XG4gICAgdGhpcy5zaXplID0gc2l6ZTtcbiAgfVxuICAvLyAjZW5kcmVnaW9uXG5cbiAgLy8gI3JlZ2lvbiBmYWN0b3J5XG4gIHN0YXRpYyBhc3luYyBmcm9tSW1hZ2UoXG4gICAgaW1hZ2U6IEltYWdlRGF0YSB8IEhUTUxJbWFnZUVsZW1lbnQgfCBJbWFnZUJpdG1hcCB8IHN0cmluZyxcbiAgICBvcHRpb25zPzpcbiAgICAgIHwgVGVuc29yRnJvbUltYWdlRGF0YU9wdGlvbnNcbiAgICAgIHwgVGVuc29yRnJvbUltYWdlRWxlbWVudE9wdGlvbnNcbiAgICAgIHwgVGVuc29yRnJvbUltYWdlQml0bWFwT3B0aW9uc1xuICAgICAgfCBUZW5zb3JGcm9tVXJsT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxUZW5zb3JJbnRlcmZhY2U+IHtcbiAgICByZXR1cm4gdGVuc29yRnJvbUltYWdlKGltYWdlLCBvcHRpb25zKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tVGV4dHVyZTxUIGV4dGVuZHMgVGVuc29ySW50ZXJmYWNlLlRleHR1cmVEYXRhVHlwZXM+KFxuICAgIHRleHR1cmU6IFRlbnNvclRleHR1cmVUeXBlLFxuICAgIG9wdGlvbnM6IFRlbnNvckZyb21UZXh0dXJlT3B0aW9uczxUPixcbiAgKTogVGVuc29ySW50ZXJmYWNlIHtcbiAgICByZXR1cm4gdGVuc29yRnJvbVRleHR1cmUodGV4dHVyZSwgb3B0aW9ucyk7XG4gIH1cblxuICBzdGF0aWMgZnJvbUdwdUJ1ZmZlcjxUIGV4dGVuZHMgVGVuc29ySW50ZXJmYWNlLkdwdUJ1ZmZlckRhdGFUeXBlcz4oXG4gICAgZ3B1QnVmZmVyOiBUZW5zb3JHcHVCdWZmZXJUeXBlLFxuICAgIG9wdGlvbnM6IFRlbnNvckZyb21HcHVCdWZmZXJPcHRpb25zPFQ+LFxuICApOiBUZW5zb3JJbnRlcmZhY2Uge1xuICAgIHJldHVybiB0ZW5zb3JGcm9tR3B1QnVmZmVyKGdwdUJ1ZmZlciwgb3B0aW9ucyk7XG4gIH1cblxuICBzdGF0aWMgZnJvbU1MVGVuc29yPFQgZXh0ZW5kcyBUZW5zb3JJbnRlcmZhY2UuTUxUZW5zb3JEYXRhVHlwZXM+KFxuICAgIG1sVGVuc29yOiBUZW5zb3JNTFRlbnNvclR5cGUsXG4gICAgb3B0aW9uczogVGVuc29yRnJvbU1MVGVuc29yT3B0aW9uczxUPixcbiAgKTogVGVuc29ySW50ZXJmYWNlIHtcbiAgICByZXR1cm4gdGVuc29yRnJvbU1MVGVuc29yKG1sVGVuc29yLCBvcHRpb25zKTtcbiAgfVxuXG4gIHN0YXRpYyBmcm9tUGlubmVkQnVmZmVyPFQgZXh0ZW5kcyBUZW5zb3JJbnRlcmZhY2UuQ3B1UGlubmVkRGF0YVR5cGVzPihcbiAgICB0eXBlOiBULFxuICAgIGJ1ZmZlcjogVGVuc29ySW50ZXJmYWNlLkRhdGFUeXBlTWFwW1RdLFxuICAgIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSxcbiAgKTogVGVuc29yIHtcbiAgICByZXR1cm4gdGVuc29yRnJvbVBpbm5lZEJ1ZmZlcih0eXBlLCBidWZmZXIsIGRpbXMpO1xuICB9XG5cbiAgLy8gI2VuZHJlZ2lvblxuXG4gIC8vICNyZWdpb24gY29udmVyc2lvbnNcbiAgdG9EYXRhVVJMKG9wdGlvbnM/OiBUZW5zb3JUb0RhdGFVcmxPcHRpb25zKTogc3RyaW5nIHtcbiAgICByZXR1cm4gdGVuc29yVG9EYXRhVVJMKHRoaXMsIG9wdGlvbnMpO1xuICB9XG5cbiAgdG9JbWFnZURhdGEob3B0aW9ucz86IFRlbnNvclRvSW1hZ2VEYXRhT3B0aW9ucyk6IEltYWdlRGF0YSB7XG4gICAgcmV0dXJuIHRlbnNvclRvSW1hZ2VEYXRhKHRoaXMsIG9wdGlvbnMpO1xuICB9XG4gIC8vICNlbmRyZWdpb25cblxuICAvLyAjcmVnaW9uIHB1YmxpYyBmaWVsZHNcbiAgcmVhZG9ubHkgZGltczogcmVhZG9ubHkgbnVtYmVyW107XG4gIHJlYWRvbmx5IHR5cGU6IFRlbnNvclR5cGU7XG4gIHJlYWRvbmx5IHNpemU6IG51bWJlcjtcbiAgLy8gI2VuZHJlZ2lvblxuXG4gIC8vICNyZWdpb24gcHJpdmF0ZSBmaWVsZHNcblxuICAvKipcbiAgICogc3RvcmVzIHRoZSBsb2NhdGlvbiBvZiB0aGUgZGF0YS5cbiAgICovXG4gIHByaXZhdGUgZGF0YUxvY2F0aW9uOiBUZW5zb3JEYXRhTG9jYXRpb247XG5cbiAgLyoqXG4gICAqIHN0b3JlcyB0aGUgZGF0YSBvbiBDUFUsIGlmIGxvY2F0aW9uIGlzICdjcHUnIG9yICdjcHUtcGlubmVkJy4gb3RoZXJ3aXNlIGVtcHR5LlxuICAgKi9cbiAgcHJpdmF0ZSBjcHVEYXRhPzogVGVuc29yRGF0YVR5cGU7XG5cbiAgLyoqXG4gICAqIHN0b3JlcyB0aGUgdW5kZXJseWluZyB0ZXh0dXJlIHdoZW4gbG9jYXRpb24gaXMgJ3RleHR1cmUnLiBvdGhlcndpc2UgZW1wdHkuXG4gICAqL1xuICBwcml2YXRlIGdwdVRleHR1cmVEYXRhPzogVGVuc29yVGV4dHVyZVR5cGU7XG5cbiAgLyoqXG4gICAqIHN0b3JlcyB0aGUgdW5kZXJseWluZyBHUFUgYnVmZmVyIHdoZW4gbG9jYXRpb24gaXMgJ2dwdS1idWZmZXInLiBvdGhlcndpc2UgZW1wdHkuXG4gICAqL1xuICBwcml2YXRlIGdwdUJ1ZmZlckRhdGE/OiBUZW5zb3JHcHVCdWZmZXJUeXBlO1xuXG4gIC8qKlxuICAgKiBzdG9yZXMgdGhlIHVuZGVybHlpbmcgV2ViTk4gTUxUZW5zb3Igd2hlbiBsb2NhdGlvbiBpcyAnbWwtdGVuc29yJy4gb3RoZXJ3aXNlIGVtcHR5LlxuICAgKi9cbiAgcHJpdmF0ZSBtbFRlbnNvckRhdGE/OiBUZW5zb3JNTFRlbnNvclR5cGU7XG5cbiAgLyoqXG4gICAqIHN0b3JlcyBhbiBvcHRpb25hbCBkb3dubG9hZGVyIGZ1bmN0aW9uIHRvIGRvd25sb2FkIGRhdGEgZnJvbSBHUFUgdG8gQ1BVLlxuICAgKi9cbiAgcHJpdmF0ZSBkb3dubG9hZGVyPygpOiBQcm9taXNlPFRlbnNvckRhdGFUeXBlPjtcblxuICAvKipcbiAgICogYSBmbGFnIGluZGljYXRpbmcgd2hldGhlciB0aGUgZGF0YSBpcyBiZWluZyBkb3dubG9hZGVkIGZyb20gR1BVIHRvIENQVS5cbiAgICovXG4gIHByaXZhdGUgaXNEb3dubG9hZGluZz86IGJvb2xlYW47XG5cbiAgLyoqXG4gICAqIHN0b3JlcyBhbiBvcHRpb25hbCBkaXNwb3NlciBmdW5jdGlvbiB0byBkaXNwb3NlIHRoZSB1bmRlcmx5aW5nIGRhdGEuXG4gICAqL1xuICBwcml2YXRlIGRpc3Bvc2VyPygpOiB2b2lkO1xuICAvLyAjZW5kcmVnaW9uXG5cbiAgLy8gI3JlZ2lvbiBwcm9wZXJ0aWVzXG4gIGdldCBkYXRhKCk6IFRlbnNvckRhdGFUeXBlIHtcbiAgICB0aGlzLmVuc3VyZVZhbGlkKCk7XG4gICAgaWYgKCF0aGlzLmNwdURhdGEpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcbiAgICAgICAgJ1RoZSBkYXRhIGlzIG5vdCBvbiBDUFUuIFVzZSBgZ2V0RGF0YSgpYCB0byBkb3dubG9hZCBHUFUgZGF0YSB0byBDUFUsICcgK1xuICAgICAgICAgICdvciB1c2UgYHRleHR1cmVgIG9yIGBncHVCdWZmZXJgIHByb3BlcnR5IHRvIGFjY2VzcyB0aGUgR1BVIGRhdGEgZGlyZWN0bHkuJyxcbiAgICAgICk7XG4gICAgfVxuICAgIHJldHVybiB0aGlzLmNwdURhdGE7XG4gIH1cblxuICBnZXQgbG9jYXRpb24oKTogVGVuc29yRGF0YUxvY2F0aW9uIHtcbiAgICByZXR1cm4gdGhpcy5kYXRhTG9jYXRpb247XG4gIH1cblxuICBnZXQgdGV4dHVyZSgpOiBUZW5zb3JUZXh0dXJlVHlwZSB7XG4gICAgdGhpcy5lbnN1cmVWYWxpZCgpO1xuICAgIGlmICghdGhpcy5ncHVUZXh0dXJlRGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgZGF0YSBpcyBub3Qgc3RvcmVkIGFzIGEgV2ViR0wgdGV4dHVyZS4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ3B1VGV4dHVyZURhdGE7XG4gIH1cblxuICBnZXQgZ3B1QnVmZmVyKCk6IFRlbnNvckdwdUJ1ZmZlclR5cGUge1xuICAgIHRoaXMuZW5zdXJlVmFsaWQoKTtcbiAgICBpZiAoIXRoaXMuZ3B1QnVmZmVyRGF0YSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgZGF0YSBpcyBub3Qgc3RvcmVkIGFzIGEgV2ViR1BVIGJ1ZmZlci4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMuZ3B1QnVmZmVyRGF0YTtcbiAgfVxuXG4gIGdldCBtbFRlbnNvcigpOiBUZW5zb3JNTFRlbnNvclR5cGUge1xuICAgIHRoaXMuZW5zdXJlVmFsaWQoKTtcbiAgICBpZiAoIXRoaXMubWxUZW5zb3JEYXRhKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBkYXRhIGlzIG5vdCBzdG9yZWQgYXMgYSBXZWJOTiBNTFRlbnNvci4nKTtcbiAgICB9XG4gICAgcmV0dXJuIHRoaXMubWxUZW5zb3JEYXRhO1xuICB9XG4gIC8vICNlbmRyZWdpb25cblxuICAvLyAjcmVnaW9uIG1ldGhvZHNcblxuICBhc3luYyBnZXREYXRhKHJlbGVhc2VEYXRhPzogYm9vbGVhbik6IFByb21pc2U8VGVuc29yRGF0YVR5cGU+IHtcbiAgICB0aGlzLmVuc3VyZVZhbGlkKCk7XG4gICAgc3dpdGNoICh0aGlzLmRhdGFMb2NhdGlvbikge1xuICAgICAgY2FzZSAnY3B1JzpcbiAgICAgIGNhc2UgJ2NwdS1waW5uZWQnOlxuICAgICAgICByZXR1cm4gdGhpcy5kYXRhO1xuICAgICAgY2FzZSAndGV4dHVyZSc6XG4gICAgICBjYXNlICdncHUtYnVmZmVyJzpcbiAgICAgIGNhc2UgJ21sLXRlbnNvcic6IHtcbiAgICAgICAgaWYgKCF0aGlzLmRvd25sb2FkZXIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBjdXJyZW50IHRlbnNvciBpcyBub3QgY3JlYXRlZCB3aXRoIGEgc3BlY2lmaWVkIGRhdGEgZG93bmxvYWRlci4nKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAodGhpcy5pc0Rvd25sb2FkaW5nKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgY3VycmVudCB0ZW5zb3IgaXMgYmVpbmcgZG93bmxvYWRlZC4nKTtcbiAgICAgICAgfVxuICAgICAgICB0cnkge1xuICAgICAgICAgIHRoaXMuaXNEb3dubG9hZGluZyA9IHRydWU7XG4gICAgICAgICAgY29uc3QgZGF0YSA9IGF3YWl0IHRoaXMuZG93bmxvYWRlcigpO1xuICAgICAgICAgIHRoaXMuZG93bmxvYWRlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB0aGlzLmRhdGFMb2NhdGlvbiA9ICdjcHUnO1xuICAgICAgICAgIHRoaXMuY3B1RGF0YSA9IGRhdGE7XG5cbiAgICAgICAgICBpZiAocmVsZWFzZURhdGEgJiYgdGhpcy5kaXNwb3Nlcikge1xuICAgICAgICAgICAgdGhpcy5kaXNwb3NlcigpO1xuICAgICAgICAgICAgdGhpcy5kaXNwb3NlciA9IHVuZGVmaW5lZDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICByZXR1cm4gZGF0YTtcbiAgICAgICAgfSBmaW5hbGx5IHtcbiAgICAgICAgICB0aGlzLmlzRG93bmxvYWRpbmcgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgZGVmYXVsdDpcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBjYW5ub3QgZ2V0IGRhdGEgZnJvbSBsb2NhdGlvbjogJHt0aGlzLmRhdGFMb2NhdGlvbn1gKTtcbiAgICB9XG4gIH1cblxuICBkaXNwb3NlKCk6IHZvaWQge1xuICAgIGlmICh0aGlzLmlzRG93bmxvYWRpbmcpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGN1cnJlbnQgdGVuc29yIGlzIGJlaW5nIGRvd25sb2FkZWQuJyk7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuZGlzcG9zZXIpIHtcbiAgICAgIHRoaXMuZGlzcG9zZXIoKTtcbiAgICAgIHRoaXMuZGlzcG9zZXIgPSB1bmRlZmluZWQ7XG4gICAgfVxuICAgIHRoaXMuY3B1RGF0YSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmdwdVRleHR1cmVEYXRhID0gdW5kZWZpbmVkO1xuICAgIHRoaXMuZ3B1QnVmZmVyRGF0YSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLm1sVGVuc29yRGF0YSA9IHVuZGVmaW5lZDtcbiAgICB0aGlzLmRvd25sb2FkZXIgPSB1bmRlZmluZWQ7XG4gICAgdGhpcy5pc0Rvd25sb2FkaW5nID0gdW5kZWZpbmVkO1xuXG4gICAgdGhpcy5kYXRhTG9jYXRpb24gPSAnbm9uZSc7XG4gIH1cblxuICAvLyAjZW5kcmVnaW9uXG5cbiAgLy8gI3JlZ2lvbiB0ZW5zb3IgdXRpbGl0aWVzXG4gIHByaXZhdGUgZW5zdXJlVmFsaWQoKTogdm9pZCB7XG4gICAgaWYgKHRoaXMuZGF0YUxvY2F0aW9uID09PSAnbm9uZScpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIHRlbnNvciBpcyBkaXNwb3NlZC4nKTtcbiAgICB9XG4gIH1cblxuICByZXNoYXBlKGRpbXM6IHJlYWRvbmx5IG51bWJlcltdKTogVGVuc29ySW50ZXJmYWNlIHtcbiAgICB0aGlzLmVuc3VyZVZhbGlkKCk7XG4gICAgaWYgKHRoaXMuZG93bmxvYWRlciB8fCB0aGlzLmRpc3Bvc2VyKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCByZXNoYXBlIGEgdGVuc29yIHRoYXQgb3ducyBHUFUgcmVzb3VyY2UuJyk7XG4gICAgfVxuICAgIHJldHVybiB0ZW5zb3JSZXNoYXBlKHRoaXMsIGRpbXMpO1xuICB9XG4gIC8vICNlbmRyZWdpb25cbn1cbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHsgVGVuc29yRmFjdG9yeSB9IGZyb20gJy4vdGVuc29yLWZhY3RvcnkuanMnO1xuaW1wb3J0IHsgVGVuc29yIGFzIFRlbnNvckltcGwgfSBmcm9tICcuL3RlbnNvci1pbXBsLmpzJztcbmltcG9ydCB7IFR5cGVkVGVuc29yVXRpbHMgfSBmcm9tICcuL3RlbnNvci11dGlscy5qcyc7XG5pbXBvcnQgeyBUcnlHZXRHbG9iYWxUeXBlIH0gZnJvbSAnLi90eXBlLWhlbHBlci5qcyc7XG5cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZWRlY2xhcmUgKi9cblxuLyoqXG4gKiByZXByZXNlbnQgYSBiYXNpYyB0ZW5zb3Igd2l0aCBzcGVjaWZpZWQgZGltZW5zaW9ucyBhbmQgZGF0YSB0eXBlLlxuICovXG5pbnRlcmZhY2UgVHlwZWRUZW5zb3JCYXNlPFQgZXh0ZW5kcyBUZW5zb3IuVHlwZT4ge1xuICAvKipcbiAgICogR2V0IHRoZSBkaW1lbnNpb25zIG9mIHRoZSB0ZW5zb3IuXG4gICAqL1xuICByZWFkb25seSBkaW1zOiByZWFkb25seSBudW1iZXJbXTtcbiAgLyoqXG4gICAqIEdldCB0aGUgZGF0YSB0eXBlIG9mIHRoZSB0ZW5zb3IuXG4gICAqL1xuICByZWFkb25seSB0eXBlOiBUO1xuICAvKipcbiAgICogR2V0IHRoZSBidWZmZXIgZGF0YSBvZiB0aGUgdGVuc29yLlxuICAgKlxuICAgKiBJZiB0aGUgZGF0YSBpcyBub3Qgb24gQ1BVIChlZy4gaXQncyBpbiB0aGUgZm9ybSBvZiBXZWJHTCB0ZXh0dXJlIG9yIFdlYkdQVSBidWZmZXIpLCB0aHJvdyBlcnJvci5cbiAgICovXG4gIHJlYWRvbmx5IGRhdGE6IFRlbnNvci5EYXRhVHlwZU1hcFtUXTtcbiAgLyoqXG4gICAqIEdldCB0aGUgbG9jYXRpb24gb2YgdGhlIGRhdGEuXG4gICAqL1xuICByZWFkb25seSBsb2NhdGlvbjogVGVuc29yLkRhdGFMb2NhdGlvbjtcbiAgLyoqXG4gICAqIEdldCB0aGUgV2ViR0wgdGV4dHVyZSB0aGF0IGhvbGRzIHRoZSB0ZW5zb3IgZGF0YS5cbiAgICpcbiAgICogSWYgdGhlIGRhdGEgaXMgbm90IG9uIEdQVSBhcyBXZWJHTCB0ZXh0dXJlLCB0aHJvdyBlcnJvci5cbiAgICovXG4gIHJlYWRvbmx5IHRleHR1cmU6IFRlbnNvci5UZXh0dXJlVHlwZTtcbiAgLyoqXG4gICAqIEdldCB0aGUgV2ViR1BVIGJ1ZmZlciB0aGF0IGhvbGRzIHRoZSB0ZW5zb3IgZGF0YS5cbiAgICpcbiAgICogSWYgdGhlIGRhdGEgaXMgbm90IG9uIEdQVSBhcyBXZWJHUFUgYnVmZmVyLCB0aHJvdyBlcnJvci5cbiAgICovXG4gIHJlYWRvbmx5IGdwdUJ1ZmZlcjogVGVuc29yLkdwdUJ1ZmZlclR5cGU7XG5cbiAgLyoqXG4gICAqIEdldCB0aGUgV2ViTk4gTUxUZW5zb3IgdGhhdCBob2xkcyB0aGUgdGVuc29yIGRhdGEuXG4gICAqXG4gICAqIElmIHRoZSBkYXRhIGlzIG5vdCBpbiBhIFdlYk5OIE1MVGVuc29yLCB0aHJvdyBlcnJvci5cbiAgICovXG4gIHJlYWRvbmx5IG1sVGVuc29yOiBUZW5zb3IuTUxUZW5zb3JUeXBlO1xuXG4gIC8qKlxuICAgKiBHZXQgdGhlIGJ1ZmZlciBkYXRhIG9mIHRoZSB0ZW5zb3IuXG4gICAqXG4gICAqIElmIHRoZSBkYXRhIGlzIG9uIENQVSwgcmV0dXJucyB0aGUgZGF0YSBpbW1lZGlhdGVseS5cbiAgICogSWYgdGhlIGRhdGEgaXMgb24gR1BVLCBkb3dubG9hZHMgdGhlIGRhdGEgYW5kIHJldHVybnMgdGhlIHByb21pc2UuXG4gICAqXG4gICAqIEBwYXJhbSByZWxlYXNlRGF0YSAtIHdoZXRoZXIgcmVsZWFzZSB0aGUgZGF0YSBvbiBHUFUuIElnbm9yZSBpZiBkYXRhIGlzIGFscmVhZHkgb24gQ1BVLlxuICAgKi9cbiAgZ2V0RGF0YShyZWxlYXNlRGF0YT86IGJvb2xlYW4pOiBQcm9taXNlPFRlbnNvci5EYXRhVHlwZU1hcFtUXT47XG5cbiAgLyoqXG4gICAqIERpc3Bvc2UgdGhlIHRlbnNvciBkYXRhLlxuICAgKlxuICAgKiBJZiB0aGUgZGF0YSBpcyBvbiBDUFUsIHJlbW92ZSBpdHMgaW50ZXJuYWwgcmVmZXJlbmNlIHRvIHRoZSB1bmRlcmx5aW5nIGRhdGEuXG4gICAqIElmIHRoZSBkYXRhIGlzIG9uIEdQVSwgcmVsZWFzZSB0aGUgZGF0YSBvbiBHUFUuXG4gICAqXG4gICAqIEFmdGVyIGNhbGxpbmcgdGhpcyBmdW5jdGlvbiwgdGhlIHRlbnNvciBpcyBjb25zaWRlcmVkIG5vIGxvbmdlciB2YWxpZC4gSXRzIGxvY2F0aW9uIHdpbGwgYmUgc2V0IHRvICdub25lJy5cbiAgICovXG4gIGRpc3Bvc2UoKTogdm9pZDtcbn1cblxuZXhwb3J0IGRlY2xhcmUgbmFtZXNwYWNlIFRlbnNvciB7XG4gIGludGVyZmFjZSBEYXRhVHlwZU1hcCB7XG4gICAgZmxvYXQzMjogRmxvYXQzMkFycmF5O1xuICAgIHVpbnQ4OiBVaW50OEFycmF5O1xuICAgIGludDg6IEludDhBcnJheTtcbiAgICB1aW50MTY6IFVpbnQxNkFycmF5O1xuICAgIGludDE2OiBJbnQxNkFycmF5O1xuICAgIGludDMyOiBJbnQzMkFycmF5O1xuICAgIGludDY0OiBCaWdJbnQ2NEFycmF5O1xuICAgIHN0cmluZzogc3RyaW5nW107XG4gICAgYm9vbDogVWludDhBcnJheTtcbiAgICBmbG9hdDE2OiBVaW50MTZBcnJheTsgLy8gS2VlcCB1c2luZyBVaW50MTZBcnJheSB1bnRpbCB3ZSBoYXZlIGEgY29uY3JldGUgc29sdXRpb24gZm9yIGZsb2F0IDE2LlxuICAgIGZsb2F0NjQ6IEZsb2F0NjRBcnJheTtcbiAgICB1aW50MzI6IFVpbnQzMkFycmF5O1xuICAgIHVpbnQ2NDogQmlnVWludDY0QXJyYXk7XG4gICAgLy8gY29tcGxleDY0OiBuZXZlcjtcbiAgICAvLyBjb21wbGV4MTI4OiBuZXZlcjtcbiAgICAvLyBiZmxvYXQxNjogbmV2ZXI7XG4gICAgdWludDQ6IFVpbnQ4QXJyYXk7XG4gICAgaW50NDogSW50OEFycmF5O1xuICB9XG5cbiAgaW50ZXJmYWNlIEVsZW1lbnRUeXBlTWFwIHtcbiAgICBmbG9hdDMyOiBudW1iZXI7XG4gICAgdWludDg6IG51bWJlcjtcbiAgICBpbnQ4OiBudW1iZXI7XG4gICAgdWludDE2OiBudW1iZXI7XG4gICAgaW50MTY6IG51bWJlcjtcbiAgICBpbnQzMjogbnVtYmVyO1xuICAgIGludDY0OiBiaWdpbnQ7XG4gICAgc3RyaW5nOiBzdHJpbmc7XG4gICAgYm9vbDogYm9vbGVhbjtcbiAgICBmbG9hdDE2OiBudW1iZXI7IC8vIEtlZXAgdXNpbmcgVWludDE2QXJyYXkgdW50aWwgd2UgaGF2ZSBhIGNvbmNyZXRlIHNvbHV0aW9uIGZvciBmbG9hdCAxNi5cbiAgICBmbG9hdDY0OiBudW1iZXI7XG4gICAgdWludDMyOiBudW1iZXI7XG4gICAgdWludDY0OiBiaWdpbnQ7XG4gICAgLy8gY29tcGxleDY0OiBuZXZlcjtcbiAgICAvLyBjb21wbGV4MTI4OiBuZXZlcjtcbiAgICAvLyBiZmxvYXQxNjogbmV2ZXI7XG4gICAgdWludDQ6IG51bWJlcjtcbiAgICBpbnQ0OiBudW1iZXI7XG4gIH1cblxuICB0eXBlIERhdGFUeXBlID0gRGF0YVR5cGVNYXBbVHlwZV07XG4gIHR5cGUgRWxlbWVudFR5cGUgPSBFbGVtZW50VHlwZU1hcFtUeXBlXTtcblxuICAvKipcbiAgICogc3VwcG9ydGVkIGRhdGEgdHlwZXMgZm9yIGNvbnN0cnVjdGluZyBhIHRlbnNvciBmcm9tIGEgcGlubmVkIENQVSBidWZmZXJcbiAgICovXG4gIGV4cG9ydCB0eXBlIENwdVBpbm5lZERhdGFUeXBlcyA9IEV4Y2x1ZGU8VGVuc29yLlR5cGUsICdzdHJpbmcnPjtcblxuICAvKipcbiAgICogdHlwZSBhbGlhcyBmb3IgV2ViR0wgdGV4dHVyZVxuICAgKi9cbiAgZXhwb3J0IHR5cGUgVGV4dHVyZVR5cGUgPSBXZWJHTFRleHR1cmU7XG5cbiAgLyoqXG4gICAqIHN1cHBvcnRlZCBkYXRhIHR5cGVzIGZvciBjb25zdHJ1Y3RpbmcgYSB0ZW5zb3IgZnJvbSBhIFdlYkdMIHRleHR1cmVcbiAgICovXG4gIGV4cG9ydCB0eXBlIFRleHR1cmVEYXRhVHlwZXMgPSAnZmxvYXQzMic7XG5cbiAgdHlwZSBHcHVCdWZmZXJUeXBlRmFsbGJhY2sgPSB7IHNpemU6IG51bWJlcjsgbWFwU3RhdGU6ICd1bm1hcHBlZCcgfCAncGVuZGluZycgfCAnbWFwcGVkJyB9O1xuICAvKipcbiAgICogdHlwZSBhbGlhcyBmb3IgV2ViR1BVIGJ1ZmZlclxuICAgKi9cbiAgZXhwb3J0IHR5cGUgR3B1QnVmZmVyVHlwZSA9IFRyeUdldEdsb2JhbFR5cGU8J0dQVUJ1ZmZlcicsIEdwdUJ1ZmZlclR5cGVGYWxsYmFjaz47XG5cbiAgdHlwZSBNTFRlbnNvclR5cGVGYWxsYmFjayA9IHsgZGVzdHJveSgpOiB2b2lkIH07XG4gIC8qKlxuICAgKiB0eXBlIGFsaWFzIGZvciBXZWJOTiBNTFRlbnNvclxuICAgKlxuICAgKiBUaGUgc3BlY2lmaWNhdGlvbiBmb3IgV2ViTk4ncyBNTFRlbnNvciBpcyBjdXJyZW50bHkgaW4gZmx1eC5cbiAgICovXG4gIGV4cG9ydCB0eXBlIE1MVGVuc29yVHlwZSA9IFRyeUdldEdsb2JhbFR5cGU8J01MVGVuc29yJywgTUxUZW5zb3JUeXBlRmFsbGJhY2s+O1xuXG4gIC8qKlxuICAgKiBzdXBwb3J0ZWQgZGF0YSB0eXBlcyBmb3IgY29uc3RydWN0aW5nIGEgdGVuc29yIGZyb20gYSBXZWJHUFUgYnVmZmVyXG4gICAqL1xuICBleHBvcnQgdHlwZSBHcHVCdWZmZXJEYXRhVHlwZXMgPSAnZmxvYXQzMicgfCAnZmxvYXQxNicgfCAnaW50MzInIHwgJ2ludDY0JyB8ICd1aW50MzInIHwgJ3VpbnQ4JyB8ICdib29sJztcblxuICAvKipcbiAgICogc3VwcG9ydGVkIGRhdGEgdHlwZXMgZm9yIGNvbnN0cnVjdGluZyBhIHRlbnNvciBmcm9tIGEgV2ViTk4gTUxUZW5zb3JcbiAgICovXG4gIGV4cG9ydCB0eXBlIE1MVGVuc29yRGF0YVR5cGVzID1cbiAgICB8ICdmbG9hdDMyJ1xuICAgIHwgJ2Zsb2F0MTYnXG4gICAgfCAnaW50OCdcbiAgICB8ICd1aW50OCdcbiAgICB8ICdpbnQzMidcbiAgICB8ICd1aW50MzInXG4gICAgfCAnaW50NjQnXG4gICAgfCAndWludDY0J1xuICAgIHwgJ2Jvb2wnXG4gICAgfCAndWludDQnXG4gICAgfCAnaW50NCc7XG5cbiAgLyoqXG4gICAqIHJlcHJlc2VudCB3aGVyZSB0aGUgdGVuc29yIGRhdGEgaXMgc3RvcmVkXG4gICAqL1xuICBleHBvcnQgdHlwZSBEYXRhTG9jYXRpb24gPSAnbm9uZScgfCAnY3B1JyB8ICdjcHUtcGlubmVkJyB8ICd0ZXh0dXJlJyB8ICdncHUtYnVmZmVyJyB8ICdtbC10ZW5zb3InO1xuXG4gIC8qKlxuICAgKiByZXByZXNlbnQgdGhlIGRhdGEgdHlwZSBvZiBhIHRlbnNvclxuICAgKi9cbiAgZXhwb3J0IHR5cGUgVHlwZSA9IGtleW9mIERhdGFUeXBlTWFwO1xufVxuXG4vKipcbiAqIFJlcHJlc2VudCBtdWx0aS1kaW1lbnNpb25hbCBhcnJheXMgdG8gZmVlZCB0byBvciBmZXRjaCBmcm9tIG1vZGVsIGluZmVyZW5jaW5nLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIFR5cGVkVGVuc29yPFQgZXh0ZW5kcyBUZW5zb3IuVHlwZT4gZXh0ZW5kcyBUeXBlZFRlbnNvckJhc2U8VD4sIFR5cGVkVGVuc29yVXRpbHM8VD4ge31cbi8qKlxuICogUmVwcmVzZW50IG11bHRpLWRpbWVuc2lvbmFsIGFycmF5cyB0byBmZWVkIHRvIG9yIGZldGNoIGZyb20gbW9kZWwgaW5mZXJlbmNpbmcuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGVuc29yIGV4dGVuZHMgVHlwZWRUZW5zb3JCYXNlPFRlbnNvci5UeXBlPiwgVHlwZWRUZW5zb3JVdGlsczxUZW5zb3IuVHlwZT4ge31cblxuLyoqXG4gKiB0eXBlIFRlbnNvckNvbnN0cnVjdG9yIGRlZmluZXMgdGhlIGNvbnN0cnVjdG9ycyBvZiAnVGVuc29yJyB0byBjcmVhdGUgQ1BVIHRlbnNvciBpbnN0YW5jZXMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGVuc29yQ29uc3RydWN0b3IgZXh0ZW5kcyBUZW5zb3JGYWN0b3J5IHtcbiAgLy8gI3JlZ2lvbiBDUFUgdGVuc29yIC0gc3BlY2lmeSBlbGVtZW50IHR5cGVcbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBzdHJpbmcgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiB0eXBlLCBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gdHlwZSAtIFNwZWNpZnkgdGhlIGVsZW1lbnQgdHlwZS5cbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKi9cbiAgbmV3IChcbiAgICB0eXBlOiAnc3RyaW5nJyxcbiAgICBkYXRhOiBUZW5zb3IuRGF0YVR5cGVNYXBbJ3N0cmluZyddIHwgcmVhZG9ubHkgc3RyaW5nW10sXG4gICAgZGltcz86IHJlYWRvbmx5IG51bWJlcltdLFxuICApOiBUeXBlZFRlbnNvcjwnc3RyaW5nJz47XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBib29sIHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gdHlwZSwgZGF0YSBhbmQgZGltcy5cbiAgICpcbiAgICogQHBhcmFtIHR5cGUgLSBTcGVjaWZ5IHRoZSBlbGVtZW50IHR5cGUuXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cbiAgICovXG4gIG5ldyAoXG4gICAgdHlwZTogJ2Jvb2wnLFxuICAgIGRhdGE6IFRlbnNvci5EYXRhVHlwZU1hcFsnYm9vbCddIHwgcmVhZG9ubHkgYm9vbGVhbltdLFxuICAgIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSxcbiAgKTogVHlwZWRUZW5zb3I8J2Jvb2wnPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHVpbnQ4IHRlbnNvciBvYmplY3QgZnJvbSBhIFVpbnQ4Q2xhbXBlZEFycmF5LCBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gdHlwZSAtIFNwZWNpZnkgdGhlIGVsZW1lbnQgdHlwZS5cbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKi9cbiAgbmV3ICh0eXBlOiAndWludDgnLCBkYXRhOiBVaW50OENsYW1wZWRBcnJheSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVHlwZWRUZW5zb3I8J3VpbnQ4Jz47XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyA2NC1iaXQgaW50ZWdlciB0eXBlZCB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIHR5cGUsIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSB0eXBlIC0gU3BlY2lmeSB0aGUgZWxlbWVudCB0eXBlLlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXcgPFQgZXh0ZW5kcyAndWludDY0JyB8ICdpbnQ2NCc+KFxuICAgIHR5cGU6IFQsXG4gICAgZGF0YTogVGVuc29yLkRhdGFUeXBlTWFwW1RdIHwgcmVhZG9ubHkgYmlnaW50W10gfCByZWFkb25seSBudW1iZXJbXSxcbiAgICBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10sXG4gICk6IFR5cGVkVGVuc29yPFQ+O1xuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgbnVtZXJpYyB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIHR5cGUsIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSB0eXBlIC0gU3BlY2lmeSB0aGUgZWxlbWVudCB0eXBlLlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXcgPFQgZXh0ZW5kcyBFeGNsdWRlPFRlbnNvci5UeXBlLCAnc3RyaW5nJyB8ICdib29sJyB8ICd1aW50NjQnIHwgJ2ludDY0Jz4+KFxuICAgIHR5cGU6IFQsXG4gICAgZGF0YTogVGVuc29yLkRhdGFUeXBlTWFwW1RdIHwgcmVhZG9ubHkgbnVtYmVyW10sXG4gICAgZGltcz86IHJlYWRvbmx5IG51bWJlcltdLFxuICApOiBUeXBlZFRlbnNvcjxUPjtcbiAgLy8gI2VuZHJlZ2lvblxuXG4gIC8vICNyZWdpb24gQ1BVIHRlbnNvciAtIGluZmVyIGVsZW1lbnQgdHlwZXNcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IGZsb2F0MzIgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXcgKGRhdGE6IEZsb2F0MzJBcnJheSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVHlwZWRUZW5zb3I8J2Zsb2F0MzInPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IGludDggdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXcgKGRhdGE6IEludDhBcnJheSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVHlwZWRUZW5zb3I8J2ludDgnPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHVpbnQ4IHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBhbmQgZGltcy5cbiAgICpcbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKi9cbiAgbmV3IChkYXRhOiBVaW50OEFycmF5LCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwndWludDgnPjtcblxuICAvKipcbiAgICogQ29uc3RydWN0IGEgbmV3IHVpbnQ4IHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBhbmQgZGltcy5cbiAgICpcbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKi9cbiAgbmV3IChkYXRhOiBVaW50OENsYW1wZWRBcnJheSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVHlwZWRUZW5zb3I8J3VpbnQ4Jz47XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyB1aW50MTYgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXcgKGRhdGE6IFVpbnQxNkFycmF5LCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwndWludDE2Jz47XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBpbnQxNiB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cbiAgICovXG4gIG5ldyAoZGF0YTogSW50MTZBcnJheSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVHlwZWRUZW5zb3I8J2ludDE2Jz47XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBpbnQzMiB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cbiAgICovXG4gIG5ldyAoZGF0YTogSW50MzJBcnJheSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVHlwZWRUZW5zb3I8J2ludDMyJz47XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBpbnQ2NCB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cbiAgICovXG4gIG5ldyAoZGF0YTogQmlnSW50NjRBcnJheSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVHlwZWRUZW5zb3I8J2ludDY0Jz47XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBzdHJpbmcgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXcgKGRhdGE6IHJlYWRvbmx5IHN0cmluZ1tdLCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwnc3RyaW5nJz47XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBib29sIHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBhbmQgZGltcy5cbiAgICpcbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKi9cbiAgbmV3IChkYXRhOiByZWFkb25seSBib29sZWFuW10sIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPCdib29sJz47XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyBmbG9hdDY0IHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBhbmQgZGltcy5cbiAgICpcbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKi9cbiAgbmV3IChkYXRhOiBGbG9hdDY0QXJyYXksIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPCdmbG9hdDY0Jz47XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyB1aW50MzIgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXcgKGRhdGE6IFVpbnQzMkFycmF5LCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwndWludDMyJz47XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyB1aW50NjQgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXG4gICAqL1xuICBuZXcgKGRhdGE6IEJpZ1VpbnQ2NEFycmF5LCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwndWludDY0Jz47XG5cbiAgLy8gI2VuZHJlZ2lvblxuXG4gIC8vICNyZWdpb24gQ1BVIHRlbnNvciAtIGZhbGwgYmFjayB0byBub24tZ2VuZXJpYyB0ZW5zb3IgdHlwZSBkZWNsYXJhdGlvblxuXG4gIC8qKlxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiB0eXBlLCBkYXRhIGFuZCBkaW1zLlxuICAgKlxuICAgKiBAcGFyYW0gdHlwZSAtIFNwZWNpZnkgdGhlIGVsZW1lbnQgdHlwZS5cbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKi9cbiAgbmV3IChcbiAgICB0eXBlOiBUZW5zb3IuVHlwZSxcbiAgICBkYXRhOiBUZW5zb3IuRGF0YVR5cGUgfCByZWFkb25seSBudW1iZXJbXSB8IHJlYWRvbmx5IHN0cmluZ1tdIHwgcmVhZG9ubHkgYmlnaW50W10gfCByZWFkb25seSBib29sZWFuW10sXG4gICAgZGltcz86IHJlYWRvbmx5IG51bWJlcltdLFxuICApOiBUZW5zb3I7XG5cbiAgLyoqXG4gICAqIENvbnN0cnVjdCBhIG5ldyB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIGRhdGEgYW5kIGRpbXMuXG4gICAqXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cbiAgICovXG4gIG5ldyAoZGF0YTogVGVuc29yLkRhdGFUeXBlLCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUZW5zb3I7XG4gIC8vICNlbmRyZWdpb25cbn1cblxuLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvblxuZXhwb3J0IGNvbnN0IFRlbnNvciA9IFRlbnNvckltcGwgYXMgVGVuc29yQ29uc3RydWN0b3I7XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7IGVudiB9IGZyb20gJy4vZW52LWltcGwuanMnO1xuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuZXhwb3J0IGNvbnN0IFRSQUNFID0gKGRldmljZVR5cGU6IHN0cmluZywgbGFiZWw6IHN0cmluZykgPT4ge1xuICBpZiAodHlwZW9mIGVudi50cmFjZSA9PT0gJ3VuZGVmaW5lZCcgPyAhZW52Lndhc20udHJhY2UgOiAhZW52LnRyYWNlKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gIGNvbnNvbGUudGltZVN0YW1wKGAke2RldmljZVR5cGV9OjpPUlQ6OiR7bGFiZWx9YCk7XG59O1xuXG5jb25zdCBUUkFDRV9GVU5DID0gKG1zZzogc3RyaW5nLCBleHRyYU1zZz86IHN0cmluZykgPT4ge1xuICBjb25zdCBzdGFjayA9IG5ldyBFcnJvcigpLnN0YWNrPy5zcGxpdCgvXFxyXFxufFxccnxcXG4vZykgfHwgW107XG4gIGxldCBoYXNUcmFjZUZ1bmMgPSBmYWxzZTtcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdGFjay5sZW5ndGg7IGkrKykge1xuICAgIGlmIChoYXNUcmFjZUZ1bmMgJiYgIXN0YWNrW2ldLmluY2x1ZGVzKCdUUkFDRV9GVU5DJykpIHtcbiAgICAgIGxldCBsYWJlbCA9IGBGVU5DXyR7bXNnfTo6JHtzdGFja1tpXS50cmltKCkuc3BsaXQoJyAnKVsxXX1gO1xuICAgICAgaWYgKGV4dHJhTXNnKSB7XG4gICAgICAgIGxhYmVsICs9IGA6OiR7ZXh0cmFNc2d9YDtcbiAgICAgIH1cbiAgICAgIFRSQUNFKCdDUFUnLCBsYWJlbCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIGlmIChzdGFja1tpXS5pbmNsdWRlcygnVFJBQ0VfRlVOQycpKSB7XG4gICAgICBoYXNUcmFjZUZ1bmMgPSB0cnVlO1xuICAgIH1cbiAgfVxufTtcblxuLyoqXG4gKiBAaWdub3JlXG4gKi9cbmV4cG9ydCBjb25zdCBUUkFDRV9GVU5DX0JFR0lOID0gKGV4dHJhTXNnPzogc3RyaW5nKSA9PiB7XG4gIGlmICh0eXBlb2YgZW52LnRyYWNlID09PSAndW5kZWZpbmVkJyA/ICFlbnYud2FzbS50cmFjZSA6ICFlbnYudHJhY2UpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgVFJBQ0VfRlVOQygnQkVHSU4nLCBleHRyYU1zZyk7XG59O1xuXG4vKipcbiAqIEBpZ25vcmVcbiAqL1xuZXhwb3J0IGNvbnN0IFRSQUNFX0ZVTkNfRU5EID0gKGV4dHJhTXNnPzogc3RyaW5nKSA9PiB7XG4gIGlmICh0eXBlb2YgZW52LnRyYWNlID09PSAndW5kZWZpbmVkJyA/ICFlbnYud2FzbS50cmFjZSA6ICFlbnYudHJhY2UpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgVFJBQ0VfRlVOQygnRU5EJywgZXh0cmFNc2cpO1xufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHsgcmVzb2x2ZUJhY2tlbmRBbmRFeGVjdXRpb25Qcm92aWRlcnMgfSBmcm9tICcuL2JhY2tlbmQtaW1wbC5qcyc7XG5pbXBvcnQgeyBJbmZlcmVuY2VTZXNzaW9uSGFuZGxlciB9IGZyb20gJy4vYmFja2VuZC5qcyc7XG5pbXBvcnQgeyBJbmZlcmVuY2VTZXNzaW9uIGFzIEluZmVyZW5jZVNlc3Npb25JbnRlcmZhY2UgfSBmcm9tICcuL2luZmVyZW5jZS1zZXNzaW9uLmpzJztcbmltcG9ydCB7IE9ubnhWYWx1ZSB9IGZyb20gJy4vb25ueC12YWx1ZS5qcyc7XG5pbXBvcnQgeyBUZW5zb3IgfSBmcm9tICcuL3RlbnNvci5qcyc7XG5pbXBvcnQgeyBUUkFDRV9GVU5DX0JFR0lOLCBUUkFDRV9GVU5DX0VORCB9IGZyb20gJy4vdHJhY2UuanMnO1xuXG50eXBlIFNlc3Npb25PcHRpb25zID0gSW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZS5TZXNzaW9uT3B0aW9ucztcbnR5cGUgUnVuT3B0aW9ucyA9IEluZmVyZW5jZVNlc3Npb25JbnRlcmZhY2UuUnVuT3B0aW9ucztcbnR5cGUgRmVlZHNUeXBlID0gSW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZS5GZWVkc1R5cGU7XG50eXBlIEZldGNoZXNUeXBlID0gSW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZS5GZXRjaGVzVHlwZTtcbnR5cGUgUmV0dXJuVHlwZSA9IEluZmVyZW5jZVNlc3Npb25JbnRlcmZhY2UuUmV0dXJuVHlwZTtcblxuZXhwb3J0IGNsYXNzIEluZmVyZW5jZVNlc3Npb24gaW1wbGVtZW50cyBJbmZlcmVuY2VTZXNzaW9uSW50ZXJmYWNlIHtcbiAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihoYW5kbGVyOiBJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcikge1xuICAgIHRoaXMuaGFuZGxlciA9IGhhbmRsZXI7XG4gIH1cbiAgcnVuKGZlZWRzOiBGZWVkc1R5cGUsIG9wdGlvbnM/OiBSdW5PcHRpb25zKTogUHJvbWlzZTxSZXR1cm5UeXBlPjtcbiAgcnVuKGZlZWRzOiBGZWVkc1R5cGUsIGZldGNoZXM6IEZldGNoZXNUeXBlLCBvcHRpb25zPzogUnVuT3B0aW9ucyk6IFByb21pc2U8UmV0dXJuVHlwZT47XG4gIGFzeW5jIHJ1bihmZWVkczogRmVlZHNUeXBlLCBhcmcxPzogRmV0Y2hlc1R5cGUgfCBSdW5PcHRpb25zLCBhcmcyPzogUnVuT3B0aW9ucyk6IFByb21pc2U8UmV0dXJuVHlwZT4ge1xuICAgIFRSQUNFX0ZVTkNfQkVHSU4oKTtcbiAgICBjb25zdCBmZXRjaGVzOiB7IFtuYW1lOiBzdHJpbmddOiBPbm54VmFsdWUgfCBudWxsIH0gPSB7fTtcbiAgICBsZXQgb3B0aW9uczogUnVuT3B0aW9ucyA9IHt9O1xuICAgIC8vIGNoZWNrIGlucHV0c1xuICAgIGlmICh0eXBlb2YgZmVlZHMgIT09ICdvYmplY3QnIHx8IGZlZWRzID09PSBudWxsIHx8IGZlZWRzIGluc3RhbmNlb2YgVGVuc29yIHx8IEFycmF5LmlzQXJyYXkoZmVlZHMpKSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxuICAgICAgICBcIidmZWVkcycgbXVzdCBiZSBhbiBvYmplY3QgdGhhdCB1c2UgaW5wdXQgbmFtZXMgYXMga2V5cyBhbmQgT25ueFZhbHVlIGFzIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlwiLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBsZXQgaXNGZXRjaGVzRW1wdHkgPSB0cnVlO1xuICAgIC8vIGRldGVybWluZSB3aGljaCBvdmVycmlkZSBpcyBiZWluZyB1c2VkXG4gICAgaWYgKHR5cGVvZiBhcmcxID09PSAnb2JqZWN0Jykge1xuICAgICAgaWYgKGFyZzEgPT09IG51bGwpIHtcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5leHBlY3RlZCBhcmd1bWVudFsxXTogY2Fubm90IGJlIG51bGwuJyk7XG4gICAgICB9XG4gICAgICBpZiAoYXJnMSBpbnN0YW5jZW9mIFRlbnNvcikge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiJ2ZldGNoZXMnIGNhbm5vdCBiZSBhIFRlbnNvclwiKTtcbiAgICAgIH1cblxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXJnMSkpIHtcbiAgICAgICAgaWYgKGFyZzEubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIidmZXRjaGVzJyBjYW5ub3QgYmUgYW4gZW1wdHkgYXJyYXkuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGlzRmV0Y2hlc0VtcHR5ID0gZmFsc2U7XG4gICAgICAgIC8vIG91dHB1dCBuYW1lc1xuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgYXJnMSkge1xuICAgICAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCInZmV0Y2hlcycgbXVzdCBiZSBhIHN0cmluZyBhcnJheSBvciBhbiBvYmplY3QuXCIpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAodGhpcy5vdXRwdXROYW1lcy5pbmRleE9mKG5hbWUpID09PSAtMSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYCdmZXRjaGVzJyBjb250YWlucyBpbnZhbGlkIG91dHB1dCBuYW1lOiAke25hbWV9LmApO1xuICAgICAgICAgIH1cbiAgICAgICAgICBmZXRjaGVzW25hbWVdID0gbnVsbDtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0eXBlb2YgYXJnMiA9PT0gJ29iamVjdCcgJiYgYXJnMiAhPT0gbnVsbCkge1xuICAgICAgICAgIG9wdGlvbnMgPSBhcmcyO1xuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCInb3B0aW9ucycgbXVzdCBiZSBhbiBvYmplY3QuXCIpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBkZWNpZGUgd2hldGhlciBhcmcxIGlzIGZldGNoZXMgb3Igb3B0aW9uc1xuICAgICAgICAvLyBpZiBhbnkgb3V0cHV0IG5hbWUgaXMgcHJlc2VudCBhbmQgaXRzIHZhbHVlIGlzIHZhbGlkIE9ubnhWYWx1ZSwgd2UgY29uc2lkZXIgaXQgZmV0Y2hlc1xuICAgICAgICBsZXQgaXNGZXRjaGVzID0gZmFsc2U7XG4gICAgICAgIGNvbnN0IGFyZzFLZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYXJnMSk7XG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBvZiB0aGlzLm91dHB1dE5hbWVzKSB7XG4gICAgICAgICAgaWYgKGFyZzFLZXlzLmluZGV4T2YobmFtZSkgIT09IC0xKSB7XG4gICAgICAgICAgICBjb25zdCB2ID0gKGFyZzEgYXMgSW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZS5OdWxsYWJsZU9ubnhWYWx1ZU1hcFR5cGUpW25hbWVdO1xuICAgICAgICAgICAgaWYgKHYgPT09IG51bGwgfHwgdiBpbnN0YW5jZW9mIFRlbnNvcikge1xuICAgICAgICAgICAgICBpc0ZldGNoZXMgPSB0cnVlO1xuICAgICAgICAgICAgICBpc0ZldGNoZXNFbXB0eSA9IGZhbHNlO1xuICAgICAgICAgICAgICBmZXRjaGVzW25hbWVdID0gdjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoaXNGZXRjaGVzKSB7XG4gICAgICAgICAgaWYgKHR5cGVvZiBhcmcyID09PSAnb2JqZWN0JyAmJiBhcmcyICE9PSBudWxsKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gYXJnMjtcbiAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIidvcHRpb25zJyBtdXN0IGJlIGFuIG9iamVjdC5cIik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIG9wdGlvbnMgPSBhcmcxIGFzIFJ1bk9wdGlvbnM7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcxICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlVuZXhwZWN0ZWQgYXJndW1lbnRbMV06IG11c3QgYmUgJ2ZldGNoZXMnIG9yICdvcHRpb25zJy5cIik7XG4gICAgfVxuXG4gICAgLy8gY2hlY2sgaWYgYWxsIGlucHV0cyBhcmUgaW4gZmVlZFxuICAgIGZvciAoY29uc3QgbmFtZSBvZiB0aGlzLmlucHV0TmFtZXMpIHtcbiAgICAgIGlmICh0eXBlb2YgZmVlZHNbbmFtZV0gPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgaW5wdXQgJyR7bmFtZX0nIGlzIG1pc3NpbmcgaW4gJ2ZlZWRzJy5gKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBpZiBubyBmZXRjaGVzIGlzIHNwZWNpZmllZCwgd2UgdXNlIHRoZSBmdWxsIG91dHB1dCBuYW1lcyBsaXN0XG4gICAgaWYgKGlzRmV0Y2hlc0VtcHR5KSB7XG4gICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgdGhpcy5vdXRwdXROYW1lcykge1xuICAgICAgICBmZXRjaGVzW25hbWVdID0gbnVsbDtcbiAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBmZWVkcywgZmV0Y2hlcyBhbmQgb3B0aW9ucyBhcmUgcHJlcGFyZWRcblxuICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCB0aGlzLmhhbmRsZXIucnVuKGZlZWRzLCBmZXRjaGVzLCBvcHRpb25zKTtcbiAgICBjb25zdCByZXR1cm5WYWx1ZTogeyBbbmFtZTogc3RyaW5nXTogT25ueFZhbHVlIH0gPSB7fTtcbiAgICBmb3IgKGNvbnN0IGtleSBpbiByZXN1bHRzKSB7XG4gICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocmVzdWx0cywga2V5KSkge1xuICAgICAgICBjb25zdCByZXN1bHQgPSByZXN1bHRzW2tleV07XG4gICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBUZW5zb3IpIHtcbiAgICAgICAgICByZXR1cm5WYWx1ZVtrZXldID0gcmVzdWx0O1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJldHVyblZhbHVlW2tleV0gPSBuZXcgVGVuc29yKHJlc3VsdC50eXBlLCByZXN1bHQuZGF0YSwgcmVzdWx0LmRpbXMpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICAgIFRSQUNFX0ZVTkNfRU5EKCk7XG4gICAgcmV0dXJuIHJldHVyblZhbHVlO1xuICB9XG5cbiAgYXN5bmMgcmVsZWFzZSgpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICByZXR1cm4gdGhpcy5oYW5kbGVyLmRpc3Bvc2UoKTtcbiAgfVxuXG4gIHN0YXRpYyBjcmVhdGUocGF0aDogc3RyaW5nLCBvcHRpb25zPzogU2Vzc2lvbk9wdGlvbnMpOiBQcm9taXNlPEluZmVyZW5jZVNlc3Npb25JbnRlcmZhY2U+O1xuICBzdGF0aWMgY3JlYXRlKGJ1ZmZlcjogQXJyYXlCdWZmZXJMaWtlLCBvcHRpb25zPzogU2Vzc2lvbk9wdGlvbnMpOiBQcm9taXNlPEluZmVyZW5jZVNlc3Npb25JbnRlcmZhY2U+O1xuICBzdGF0aWMgY3JlYXRlKFxuICAgIGJ1ZmZlcjogQXJyYXlCdWZmZXJMaWtlLFxuICAgIGJ5dGVPZmZzZXQ6IG51bWJlcixcbiAgICBieXRlTGVuZ3RoPzogbnVtYmVyLFxuICAgIG9wdGlvbnM/OiBTZXNzaW9uT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uSW50ZXJmYWNlPjtcbiAgc3RhdGljIGNyZWF0ZShidWZmZXI6IFVpbnQ4QXJyYXksIG9wdGlvbnM/OiBTZXNzaW9uT3B0aW9ucyk6IFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZT47XG4gIHN0YXRpYyBhc3luYyBjcmVhdGUoXG4gICAgYXJnMDogc3RyaW5nIHwgQXJyYXlCdWZmZXJMaWtlIHwgVWludDhBcnJheSxcbiAgICBhcmcxPzogU2Vzc2lvbk9wdGlvbnMgfCBudW1iZXIsXG4gICAgYXJnMj86IG51bWJlcixcbiAgICBhcmczPzogU2Vzc2lvbk9wdGlvbnMsXG4gICk6IFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZT4ge1xuICAgIFRSQUNFX0ZVTkNfQkVHSU4oKTtcbiAgICAvLyBlaXRoZXIgbG9hZCBmcm9tIGEgZmlsZSBvciBidWZmZXJcbiAgICBsZXQgZmlsZVBhdGhPclVpbnQ4QXJyYXk6IHN0cmluZyB8IFVpbnQ4QXJyYXk7XG4gICAgbGV0IG9wdGlvbnM6IFNlc3Npb25PcHRpb25zID0ge307XG5cbiAgICBpZiAodHlwZW9mIGFyZzAgPT09ICdzdHJpbmcnKSB7XG4gICAgICBmaWxlUGF0aE9yVWludDhBcnJheSA9IGFyZzA7XG4gICAgICBpZiAodHlwZW9mIGFyZzEgPT09ICdvYmplY3QnICYmIGFyZzEgIT09IG51bGwpIHtcbiAgICAgICAgb3B0aW9ucyA9IGFyZzE7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcxICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiJ29wdGlvbnMnIG11c3QgYmUgYW4gb2JqZWN0LlwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKGFyZzAgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgICBmaWxlUGF0aE9yVWludDhBcnJheSA9IGFyZzA7XG4gICAgICBpZiAodHlwZW9mIGFyZzEgPT09ICdvYmplY3QnICYmIGFyZzEgIT09IG51bGwpIHtcbiAgICAgICAgb3B0aW9ucyA9IGFyZzE7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcxICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiJ29wdGlvbnMnIG11c3QgYmUgYW4gb2JqZWN0LlwiKTtcbiAgICAgIH1cbiAgICB9IGVsc2UgaWYgKFxuICAgICAgYXJnMCBpbnN0YW5jZW9mIEFycmF5QnVmZmVyIHx8XG4gICAgICAodHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyICE9PSAndW5kZWZpbmVkJyAmJiBhcmcwIGluc3RhbmNlb2YgU2hhcmVkQXJyYXlCdWZmZXIpXG4gICAgKSB7XG4gICAgICBjb25zdCBidWZmZXIgPSBhcmcwO1xuICAgICAgbGV0IGJ5dGVPZmZzZXQgPSAwO1xuICAgICAgbGV0IGJ5dGVMZW5ndGggPSBhcmcwLmJ5dGVMZW5ndGg7XG4gICAgICBpZiAodHlwZW9mIGFyZzEgPT09ICdvYmplY3QnICYmIGFyZzEgIT09IG51bGwpIHtcbiAgICAgICAgb3B0aW9ucyA9IGFyZzE7XG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcxID09PSAnbnVtYmVyJykge1xuICAgICAgICBieXRlT2Zmc2V0ID0gYXJnMTtcbiAgICAgICAgaWYgKCFOdW1iZXIuaXNTYWZlSW50ZWdlcihieXRlT2Zmc2V0KSkge1xuICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKFwiJ2J5dGVPZmZzZXQnIG11c3QgYmUgYW4gaW50ZWdlci5cIik7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGJ5dGVPZmZzZXQgPCAwIHx8IGJ5dGVPZmZzZXQgPj0gYnVmZmVyLmJ5dGVMZW5ndGgpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgJ2J5dGVPZmZzZXQnIGlzIG91dCBvZiByYW5nZSBbMCwgJHtidWZmZXIuYnl0ZUxlbmd0aH0pLmApO1xuICAgICAgICB9XG4gICAgICAgIGJ5dGVMZW5ndGggPSBhcmcwLmJ5dGVMZW5ndGggLSBieXRlT2Zmc2V0O1xuICAgICAgICBpZiAodHlwZW9mIGFyZzIgPT09ICdudW1iZXInKSB7XG4gICAgICAgICAgYnl0ZUxlbmd0aCA9IGFyZzI7XG4gICAgICAgICAgaWYgKCFOdW1iZXIuaXNTYWZlSW50ZWdlcihieXRlTGVuZ3RoKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoXCInYnl0ZUxlbmd0aCcgbXVzdCBiZSBhbiBpbnRlZ2VyLlwiKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKGJ5dGVMZW5ndGggPD0gMCB8fCBieXRlT2Zmc2V0ICsgYnl0ZUxlbmd0aCA+IGJ1ZmZlci5ieXRlTGVuZ3RoKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgJ2J5dGVMZW5ndGgnIGlzIG91dCBvZiByYW5nZSAoMCwgJHtidWZmZXIuYnl0ZUxlbmd0aCAtIGJ5dGVPZmZzZXR9XS5gKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgaWYgKHR5cGVvZiBhcmczID09PSAnb2JqZWN0JyAmJiBhcmczICE9PSBudWxsKSB7XG4gICAgICAgICAgICBvcHRpb25zID0gYXJnMztcbiAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmczICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcIidvcHRpb25zJyBtdXN0IGJlIGFuIG9iamVjdC5cIik7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcyICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCInYnl0ZUxlbmd0aCcgbXVzdCBiZSBhIG51bWJlci5cIik7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzEgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCInb3B0aW9ucycgbXVzdCBiZSBhbiBvYmplY3QuXCIpO1xuICAgICAgfVxuICAgICAgZmlsZVBhdGhPclVpbnQ4QXJyYXkgPSBuZXcgVWludDhBcnJheShidWZmZXIsIGJ5dGVPZmZzZXQsIGJ5dGVMZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFwiVW5leHBlY3RlZCBhcmd1bWVudFswXTogbXVzdCBiZSAncGF0aCcgb3IgJ2J1ZmZlcicuXCIpO1xuICAgIH1cblxuICAgIC8vIHJlc29sdmUgYmFja2VuZCwgdXBkYXRlIHNlc3Npb24gb3B0aW9ucyB3aXRoIHZhbGlkYXRlZCBFUHMsIGFuZCBjcmVhdGUgc2Vzc2lvbiBoYW5kbGVyXG4gICAgY29uc3QgW2JhY2tlbmQsIG9wdGlvbnNXaXRoVmFsaWRhdGVkRVBzXSA9IGF3YWl0IHJlc29sdmVCYWNrZW5kQW5kRXhlY3V0aW9uUHJvdmlkZXJzKG9wdGlvbnMpO1xuICAgIGNvbnN0IGhhbmRsZXIgPSBhd2FpdCBiYWNrZW5kLmNyZWF0ZUluZmVyZW5jZVNlc3Npb25IYW5kbGVyKGZpbGVQYXRoT3JVaW50OEFycmF5LCBvcHRpb25zV2l0aFZhbGlkYXRlZEVQcyk7XG4gICAgVFJBQ0VfRlVOQ19FTkQoKTtcbiAgICByZXR1cm4gbmV3IEluZmVyZW5jZVNlc3Npb24oaGFuZGxlcik7XG4gIH1cblxuICBzdGFydFByb2ZpbGluZygpOiB2b2lkIHtcbiAgICB0aGlzLmhhbmRsZXIuc3RhcnRQcm9maWxpbmcoKTtcbiAgfVxuICBlbmRQcm9maWxpbmcoKTogdm9pZCB7XG4gICAgdGhpcy5oYW5kbGVyLmVuZFByb2ZpbGluZygpO1xuICB9XG5cbiAgZ2V0IGlucHV0TmFtZXMoKTogcmVhZG9ubHkgc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLmhhbmRsZXIuaW5wdXROYW1lcztcbiAgfVxuICBnZXQgb3V0cHV0TmFtZXMoKTogcmVhZG9ubHkgc3RyaW5nW10ge1xuICAgIHJldHVybiB0aGlzLmhhbmRsZXIub3V0cHV0TmFtZXM7XG4gIH1cblxuICBnZXQgaW5wdXRNZXRhZGF0YSgpOiByZWFkb25seSBJbmZlcmVuY2VTZXNzaW9uSW50ZXJmYWNlLlZhbHVlTWV0YWRhdGFbXSB7XG4gICAgcmV0dXJuIHRoaXMuaGFuZGxlci5pbnB1dE1ldGFkYXRhO1xuICB9XG5cbiAgZ2V0IG91dHB1dE1ldGFkYXRhKCk6IHJlYWRvbmx5IEluZmVyZW5jZVNlc3Npb25JbnRlcmZhY2UuVmFsdWVNZXRhZGF0YVtdIHtcbiAgICByZXR1cm4gdGhpcy5oYW5kbGVyLm91dHB1dE1ldGFkYXRhO1xuICB9XG5cbiAgcHJpdmF0ZSBoYW5kbGVyOiBJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcjtcbn1cbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHsgSW5mZXJlbmNlU2Vzc2lvbiBhcyBJbmZlcmVuY2VTZXNzaW9uSW1wbCB9IGZyb20gJy4vaW5mZXJlbmNlLXNlc3Npb24taW1wbC5qcyc7XG5pbXBvcnQgeyBPbm54TW9kZWxPcHRpb25zIH0gZnJvbSAnLi9vbm54LW1vZGVsLmpzJztcbmltcG9ydCB7IE9ubnhWYWx1ZSwgT25ueFZhbHVlRGF0YUxvY2F0aW9uIH0gZnJvbSAnLi9vbm54LXZhbHVlLmpzJztcbmltcG9ydCB0eXBlIHsgVGVuc29yIH0gZnJvbSAnLi90ZW5zb3IuanMnO1xuaW1wb3J0IHsgVHJ5R2V0R2xvYmFsVHlwZSB9IGZyb20gJy4vdHlwZS1oZWxwZXIuanMnO1xuXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVkZWNsYXJlICovXG5cbmV4cG9ydCBkZWNsYXJlIG5hbWVzcGFjZSBJbmZlcmVuY2VTZXNzaW9uIHtcbiAgLy8gI3JlZ2lvbiBpbnB1dC9vdXRwdXQgdHlwZXNcblxuICB0eXBlIE9ubnhWYWx1ZU1hcFR5cGUgPSB7IHJlYWRvbmx5IFtuYW1lOiBzdHJpbmddOiBPbm54VmFsdWUgfTtcbiAgdHlwZSBOdWxsYWJsZU9ubnhWYWx1ZU1hcFR5cGUgPSB7IHJlYWRvbmx5IFtuYW1lOiBzdHJpbmddOiBPbm54VmFsdWUgfCBudWxsIH07XG5cbiAgLyoqXG4gICAqIEEgZmVlZHMgKG1vZGVsIGlucHV0cykgaXMgYW4gb2JqZWN0IHRoYXQgdXNlcyBpbnB1dCBuYW1lcyBhcyBrZXlzIGFuZCBPbm54VmFsdWUgYXMgY29ycmVzcG9uZGluZyB2YWx1ZXMuXG4gICAqL1xuICB0eXBlIEZlZWRzVHlwZSA9IE9ubnhWYWx1ZU1hcFR5cGU7XG5cbiAgLyoqXG4gICAqIEEgZmV0Y2hlcyAobW9kZWwgb3V0cHV0cykgY291bGQgYmUgb25lIG9mIHRoZSBmb2xsb3dpbmc6XG4gICAqXG4gICAqIC0gT21pdHRlZC4gVXNlIG1vZGVsJ3Mgb3V0cHV0IG5hbWVzIGRlZmluaXRpb24uXG4gICAqIC0gQW4gYXJyYXkgb2Ygc3RyaW5nIGluZGljYXRpbmcgdGhlIG91dHB1dCBuYW1lcy5cbiAgICogLSBBbiBvYmplY3QgdGhhdCB1c2Ugb3V0cHV0IG5hbWVzIGFzIGtleXMgYW5kIE9ubnhWYWx1ZSBvciBudWxsIGFzIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICAgKlxuICAgKiBAcmVtYXJrXG4gICAqIGRpZmZlcmVudCBmcm9tIGlucHV0IGFyZ3VtZW50LCBpbiBvdXRwdXQsIE9ubnhWYWx1ZSBpcyBvcHRpb25hbC4gSWYgYW4gT25ueFZhbHVlIGlzIHByZXNlbnQgaXQgd2lsbCBiZVxuICAgKiB1c2VkIGFzIGEgcHJlLWFsbG9jYXRlZCB2YWx1ZSBieSB0aGUgaW5mZXJlbmNlIGVuZ2luZTsgaWYgb21pdHRlZCwgaW5mZXJlbmNlIGVuZ2luZSB3aWxsIGFsbG9jYXRlIGJ1ZmZlclxuICAgKiBpbnRlcm5hbGx5LlxuICAgKi9cbiAgdHlwZSBGZXRjaGVzVHlwZSA9IHJlYWRvbmx5IHN0cmluZ1tdIHwgTnVsbGFibGVPbm54VmFsdWVNYXBUeXBlO1xuXG4gIC8qKlxuICAgKiBBIGluZmVyZW5jaW5nIHJldHVybiB0eXBlIGlzIGFuIG9iamVjdCB0aGF0IHVzZXMgb3V0cHV0IG5hbWVzIGFzIGtleXMgYW5kIE9ubnhWYWx1ZSBhcyBjb3JyZXNwb25kaW5nIHZhbHVlcy5cbiAgICovXG4gIHR5cGUgUmV0dXJuVHlwZSA9IE9ubnhWYWx1ZU1hcFR5cGU7XG5cbiAgLy8gI2VuZHJlZ2lvblxuXG4gIC8vICNyZWdpb24gc2Vzc2lvbiBvcHRpb25zXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGNvbmZpZ3VyYXRpb25zIGZvciBzZXNzaW9uIGJlaGF2aW9yLlxuICAgKi9cbiAgZXhwb3J0IGludGVyZmFjZSBTZXNzaW9uT3B0aW9ucyBleHRlbmRzIE9ubnhNb2RlbE9wdGlvbnMge1xuICAgIC8qKlxuICAgICAqIEFuIGFycmF5IG9mIGV4ZWN1dGlvbiBwcm92aWRlciBvcHRpb25zLlxuICAgICAqXG4gICAgICogQW4gZXhlY3V0aW9uIHByb3ZpZGVyIG9wdGlvbiBjYW4gYmUgYSBzdHJpbmcgaW5kaWNhdGluZyB0aGUgbmFtZSBvZiB0aGUgZXhlY3V0aW9uIHByb3ZpZGVyLFxuICAgICAqIG9yIGFuIG9iamVjdCBvZiBjb3JyZXNwb25kaW5nIHR5cGUuXG4gICAgICovXG4gICAgZXhlY3V0aW9uUHJvdmlkZXJzPzogcmVhZG9ubHkgRXhlY3V0aW9uUHJvdmlkZXJDb25maWdbXTtcblxuICAgIC8qKlxuICAgICAqIFRoZSBpbnRyYSBPUCB0aHJlYWRzIG51bWJlci5cbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSAoTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUpLlxuICAgICAqL1xuICAgIGludHJhT3BOdW1UaHJlYWRzPzogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogVGhlIGludGVyIE9QIHRocmVhZHMgbnVtYmVyLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIChOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSkuXG4gICAgICovXG4gICAgaW50ZXJPcE51bVRocmVhZHM/OiBudW1iZXI7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGUuXG4gICAgICpcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgKE5vZGUuanMgYmluZGluZyBhbmQgcmVhY3QtbmF0aXZlKSBvciBXZWJBc3NlbWJseSBiYWNrZW5kXG4gICAgICovXG4gICAgZnJlZURpbWVuc2lvbk92ZXJyaWRlcz86IHsgcmVhZG9ubHkgW2RpbWVuc2lvbk5hbWU6IHN0cmluZ106IG51bWJlciB9O1xuXG4gICAgLyoqXG4gICAgICogVGhlIG9wdGltaXphdGlvbiBsZXZlbC5cbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSAoTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUpIG9yIFdlYkFzc2VtYmx5IGJhY2tlbmRcbiAgICAgKi9cbiAgICBncmFwaE9wdGltaXphdGlvbkxldmVsPzogJ2Rpc2FibGVkJyB8ICdiYXNpYycgfCAnZXh0ZW5kZWQnIHwgJ2FsbCc7XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIGVuYWJsZSBDUFUgbWVtb3J5IGFyZW5hLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIChOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSkgb3IgV2ViQXNzZW1ibHkgYmFja2VuZFxuICAgICAqL1xuICAgIGVuYWJsZUNwdU1lbUFyZW5hPzogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIFdoZXRoZXIgZW5hYmxlIG1lbW9yeSBwYXR0ZXJuLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIChOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSkgb3IgV2ViQXNzZW1ibHkgYmFja2VuZFxuICAgICAqL1xuICAgIGVuYWJsZU1lbVBhdHRlcm4/OiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogRXhlY3V0aW9uIG1vZGUuXG4gICAgICpcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgKE5vZGUuanMgYmluZGluZyBhbmQgcmVhY3QtbmF0aXZlKSBvciBXZWJBc3NlbWJseSBiYWNrZW5kXG4gICAgICovXG4gICAgZXhlY3V0aW9uTW9kZT86ICdzZXF1ZW50aWFsJyB8ICdwYXJhbGxlbCc7XG5cbiAgICAvKipcbiAgICAgKiBPcHRpbWl6ZWQgbW9kZWwgZmlsZSBwYXRoLlxuICAgICAqXG4gICAgICogSWYgdGhpcyBzZXR0aW5nIGlzIHNwZWNpZmllZCwgdGhlIG9wdGltaXplZCBtb2RlbCB3aWxsIGJlIGR1bXBlZC4gSW4gYnJvd3NlciwgYSBibG9iIHdpbGwgYmUgY3JlYXRlZFxuICAgICAqIHdpdGggYSBwb3AtdXAgd2luZG93LlxuICAgICAqL1xuICAgIG9wdGltaXplZE1vZGVsRmlsZVBhdGg/OiBzdHJpbmc7XG5cbiAgICAvKipcbiAgICAgKiBXaGV0aGVyIGVuYWJsZSBwcm9maWxpbmcuXG4gICAgICpcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYSBwbGFjZWhvbGRlciBmb3IgYSBmdXR1cmUgdXNlLlxuICAgICAqL1xuICAgIGVuYWJsZVByb2ZpbGluZz86IGJvb2xlYW47XG5cbiAgICAvKipcbiAgICAgKiBGaWxlIHByZWZpeCBmb3IgcHJvZmlsaW5nLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGEgcGxhY2Vob2xkZXIgZm9yIGEgZnV0dXJlIHVzZS5cbiAgICAgKi9cbiAgICBwcm9maWxlRmlsZVByZWZpeD86IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIExvZyBJRC5cbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSAoTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUpIG9yIFdlYkFzc2VtYmx5IGJhY2tlbmRcbiAgICAgKi9cbiAgICBsb2dJZD86IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIExvZyBzZXZlcml0eSBsZXZlbC4gU2VlXG4gICAgICogaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9vbm54cnVudGltZS9ibG9iL21haW4vaW5jbHVkZS9vbm54cnVudGltZS9jb3JlL2NvbW1vbi9sb2dnaW5nL3NldmVyaXR5LmhcbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSAoTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUpIG9yIFdlYkFzc2VtYmx5IGJhY2tlbmRcbiAgICAgKi9cbiAgICBsb2dTZXZlcml0eUxldmVsPzogMCB8IDEgfCAyIHwgMyB8IDQ7XG5cbiAgICAvKipcbiAgICAgKiBMb2cgdmVyYm9zaXR5IGxldmVsLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIFdlYkFzc2VtYmx5IGJhY2tlbmQuIFdpbGwgc3VwcG9ydCBOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSBsYXRlclxuICAgICAqL1xuICAgIGxvZ1ZlcmJvc2l0eUxldmVsPzogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogU3BlY2lmeSBzdHJpbmcgYXMgYSBwcmVmZXJyZWQgZGF0YSBsb2NhdGlvbiBmb3IgYWxsIG91dHB1dHMsIG9yIGFuIG9iamVjdCB0aGF0IHVzZSBvdXRwdXQgbmFtZXMgYXMga2V5cyBhbmQgYVxuICAgICAqIHByZWZlcnJlZCBkYXRhIGxvY2F0aW9uIGFzIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIFdlYiBmb3IgV2ViR0wgYW5kIFdlYkdQVSBFUC5cbiAgICAgKi9cbiAgICBwcmVmZXJyZWRPdXRwdXRMb2NhdGlvbj86IE9ubnhWYWx1ZURhdGFMb2NhdGlvbiB8IHsgcmVhZG9ubHkgW291dHB1dE5hbWU6IHN0cmluZ106IE9ubnhWYWx1ZURhdGFMb2NhdGlvbiB9O1xuXG4gICAgLyoqXG4gICAgICogV2hldGhlciBlbmFibGUgZ3JhcGggY2FwdHVyZS5cbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgV2ViIGZvciBXZWJHUFUgRVAuXG4gICAgICovXG4gICAgZW5hYmxlR3JhcGhDYXB0dXJlPzogYm9vbGVhbjtcblxuICAgIC8qKlxuICAgICAqIFN0b3JlIGNvbmZpZ3VyYXRpb25zIGZvciBhIHNlc3Npb24uIFNlZVxuICAgICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvb25ueHJ1bnRpbWUvYmxvYi9tYWluL2luY2x1ZGUvb25ueHJ1bnRpbWUvY29yZS9zZXNzaW9uL1xuICAgICAqIG9ubnhydW50aW1lX3Nlc3Npb25fb3B0aW9uc19jb25maWdfa2V5cy5oXG4gICAgICpcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gV2ViQXNzZW1ibHkgYmFja2VuZC4gV2lsbCBzdXBwb3J0IE5vZGUuanMgYmluZGluZyBhbmQgcmVhY3QtbmF0aXZlIGxhdGVyXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqIGBgYGpzXG4gICAgICogZXh0cmE6IHtcbiAgICAgKiAgIHNlc3Npb246IHtcbiAgICAgKiAgICAgc2V0X2Rlbm9ybWFsX2FzX3plcm86IFwiMVwiLFxuICAgICAqICAgICBkaXNhYmxlX3ByZXBhY2tpbmc6IFwiMVwiXG4gICAgICogICB9LFxuICAgICAqICAgb3B0aW1pemF0aW9uOiB7XG4gICAgICogICAgIGVuYWJsZV9nZWx1X2FwcHJveGltYXRpb246IFwiMVwiXG4gICAgICogICB9XG4gICAgICogfVxuICAgICAqIGBgYFxuICAgICAqL1xuICAgIGV4dHJhPzogUmVjb3JkPHN0cmluZywgdW5rbm93bj47XG4gIH1cblxuICAvLyAjcmVnaW9uIGV4ZWN1dGlvbiBwcm92aWRlcnNcblxuICAvLyBDdXJyZW50bHksIHdlIGhhdmUgdGhlIGZvbGxvd2luZyBiYWNrZW5kcyB0byBzdXBwb3J0IGV4ZWN1dGlvbiBwcm92aWRlcnM6XG4gIC8vIEJhY2tlbmQgTm9kZS5qcyBiaW5kaW5nOiBzdXBwb3J0cyAnY3B1JywgJ2RtbCcgKHdpbjMyKSwgJ2NvcmVtbCcgKG1hY09TKSBhbmQgJ2N1ZGEnIChsaW51eCkuXG4gIC8vIEJhY2tlbmQgV2ViQXNzZW1ibHk6IHN1cHBvcnRzICdjcHUnLCAnd2FzbScsICd3ZWJncHUnIGFuZCAnd2Vibm4nLlxuICAvLyBCYWNrZW5kIE9OTlguanM6IHN1cHBvcnRzICd3ZWJnbCcuXG4gIC8vIEJhY2tlbmQgUmVhY3QgTmF0aXZlOiBzdXBwb3J0cyAnY3B1JywgJ3hubnBhY2snLCAnY29yZW1sJyAoaU9TKSwgJ25uYXBpJyAoQW5kcm9pZCkuXG4gIGludGVyZmFjZSBFeGVjdXRpb25Qcm92aWRlck9wdGlvbk1hcCB7XG4gICAgY29yZW1sOiBDb3JlTUxFeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcbiAgICBjcHU6IENwdUV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgIGN1ZGE6IEN1ZGFFeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcbiAgICBkbWw6IERtbEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgIG5uYXBpOiBObmFwaUV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgIHRlbnNvcnJ0OiBUZW5zb3JSdEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgIHdhc206IFdlYkFzc2VtYmx5RXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgd2ViZ2w6IFdlYkdMRXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XG4gICAgd2ViZ3B1OiBXZWJHcHVFeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcbiAgICB3ZWJubjogV2ViTk5FeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcbiAgICBxbm46IFFubkV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgIHhubnBhY2s6IFhubnBhY2tFeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcbiAgfVxuXG4gIHR5cGUgRXhlY3V0aW9uUHJvdmlkZXJOYW1lID0ga2V5b2YgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb25NYXA7XG4gIHR5cGUgRXhlY3V0aW9uUHJvdmlkZXJDb25maWcgPVxuICAgIHwgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb25NYXBbRXhlY3V0aW9uUHJvdmlkZXJOYW1lXVxuICAgIHwgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb25cbiAgICB8IEV4ZWN1dGlvblByb3ZpZGVyTmFtZVxuICAgIHwgc3RyaW5nO1xuXG4gIGV4cG9ydCBpbnRlcmZhY2UgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24ge1xuICAgIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcbiAgfVxuICBleHBvcnQgaW50ZXJmYWNlIENwdUV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIGV4dGVuZHMgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24ge1xuICAgIHJlYWRvbmx5IG5hbWU6ICdjcHUnO1xuICAgIHVzZUFyZW5hPzogYm9vbGVhbjtcbiAgfVxuICBleHBvcnQgaW50ZXJmYWNlIEN1ZGFFeGVjdXRpb25Qcm92aWRlck9wdGlvbiBleHRlbmRzIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIHtcbiAgICByZWFkb25seSBuYW1lOiAnY3VkYSc7XG4gICAgZGV2aWNlSWQ/OiBudW1iZXI7XG4gIH1cbiAgZXhwb3J0IGludGVyZmFjZSBEbWxFeGVjdXRpb25Qcm92aWRlck9wdGlvbiBleHRlbmRzIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIHtcbiAgICByZWFkb25seSBuYW1lOiAnZG1sJztcbiAgICBkZXZpY2VJZD86IG51bWJlcjtcbiAgfVxuICBleHBvcnQgaW50ZXJmYWNlIFRlbnNvclJ0RXhlY3V0aW9uUHJvdmlkZXJPcHRpb24gZXh0ZW5kcyBFeGVjdXRpb25Qcm92aWRlck9wdGlvbiB7XG4gICAgcmVhZG9ubHkgbmFtZTogJ3RlbnNvcnJ0JztcbiAgICBkZXZpY2VJZD86IG51bWJlcjtcbiAgfVxuICBleHBvcnQgaW50ZXJmYWNlIFdlYkFzc2VtYmx5RXhlY3V0aW9uUHJvdmlkZXJPcHRpb24gZXh0ZW5kcyBFeGVjdXRpb25Qcm92aWRlck9wdGlvbiB7XG4gICAgcmVhZG9ubHkgbmFtZTogJ3dhc20nO1xuICB9XG4gIGV4cG9ydCBpbnRlcmZhY2UgV2ViR0xFeGVjdXRpb25Qcm92aWRlck9wdGlvbiBleHRlbmRzIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIHtcbiAgICByZWFkb25seSBuYW1lOiAnd2ViZ2wnO1xuICAgIC8vIFRPRE86IGFkZCBmbGFnc1xuICB9XG4gIGV4cG9ydCBpbnRlcmZhY2UgWG5ucGFja0V4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIGV4dGVuZHMgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24ge1xuICAgIHJlYWRvbmx5IG5hbWU6ICd4bm5wYWNrJztcbiAgfVxuICBleHBvcnQgaW50ZXJmYWNlIFdlYkdwdUV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIGV4dGVuZHMgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24ge1xuICAgIHJlYWRvbmx5IG5hbWU6ICd3ZWJncHUnO1xuICAgIHByZWZlcnJlZExheW91dD86ICdOQ0hXJyB8ICdOSFdDJztcbiAgfVxuXG4gIC8vICNyZWdpb24gV2ViTk4gb3B0aW9uc1xuXG4gIGludGVyZmFjZSBXZWJOTkV4ZWN1dGlvblByb3ZpZGVyTmFtZSBleHRlbmRzIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIHtcbiAgICByZWFkb25seSBuYW1lOiAnd2Vibm4nO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgYSBzZXQgb2Ygb3B0aW9ucyBmb3IgY3JlYXRpbmcgYSBXZWJOTiBNTENvbnRleHQuXG4gICAqXG4gICAqIEBzZWUgaHR0cHM6Ly93d3cudzMub3JnL1RSL3dlYm5uLyNkaWN0ZGVmLW1sY29udGV4dG9wdGlvbnNcbiAgICovXG4gIGV4cG9ydCBpbnRlcmZhY2UgV2ViTk5Db250ZXh0T3B0aW9ucyB7XG4gICAgZGV2aWNlVHlwZT86ICdjcHUnIHwgJ2dwdScgfCAnbnB1JztcbiAgICBudW1UaHJlYWRzPzogbnVtYmVyO1xuICAgIHBvd2VyUHJlZmVyZW5jZT86ICdkZWZhdWx0JyB8ICdsb3ctcG93ZXInIHwgJ2hpZ2gtcGVyZm9ybWFuY2UnO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgYSBzZXQgb2Ygb3B0aW9ucyBmb3IgV2ViTk4gZXhlY3V0aW9uIHByb3ZpZGVyIHdpdGhvdXQgTUxDb250ZXh0LlxuICAgKi9cbiAgZXhwb3J0IGludGVyZmFjZSBXZWJOTk9wdGlvbnNXaXRob3V0TUxDb250ZXh0IGV4dGVuZHMgV2ViTk5FeGVjdXRpb25Qcm92aWRlck5hbWUsIFdlYk5OQ29udGV4dE9wdGlvbnMge1xuICAgIGNvbnRleHQ/OiBuZXZlcjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXByZXNlbnRzIGEgc2V0IG9mIG9wdGlvbnMgZm9yIFdlYk5OIGV4ZWN1dGlvbiBwcm92aWRlciB3aXRoIE1MQ29udGV4dC5cbiAgICpcbiAgICogV2hlbiBNTENvbnRleHQgaXMgcHJvdmlkZWQsIHRoZSBkZXZpY2VUeXBlIGlzIGFsc28gcmVxdWlyZWQgc28gdGhhdCB0aGUgV2ViTk4gRVAgY2FuIGRldGVybWluZSB0aGUgcHJlZmVycmVkXG4gICAqIGNoYW5uZWwgbGF5b3V0LlxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LnczLm9yZy9UUi93ZWJubi8jZG9tLW1sLWNyZWF0ZWNvbnRleHRcbiAgICovXG4gIGV4cG9ydCBpbnRlcmZhY2UgV2ViTk5PcHRpb25zV2l0aE1MQ29udGV4dFxuICAgIGV4dGVuZHMgV2ViTk5FeGVjdXRpb25Qcm92aWRlck5hbWUsXG4gICAgICBPbWl0PFdlYk5OQ29udGV4dE9wdGlvbnMsICdkZXZpY2VUeXBlJz4sXG4gICAgICBSZXF1aXJlZDxQaWNrPFdlYk5OQ29udGV4dE9wdGlvbnMsICdkZXZpY2VUeXBlJz4+IHtcbiAgICBjb250ZXh0OiBUcnlHZXRHbG9iYWxUeXBlPCdNTENvbnRleHQnPjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXByZXNlbnRzIGEgc2V0IG9mIG9wdGlvbnMgZm9yIFdlYk5OIGV4ZWN1dGlvbiBwcm92aWRlciB3aXRoIE1MQ29udGV4dCB3aGljaCBpcyBjcmVhdGVkIGZyb20gR1BVRGV2aWNlLlxuICAgKlxuICAgKiBAc2VlIGh0dHBzOi8vd3d3LnczLm9yZy9UUi93ZWJubi8jZG9tLW1sLWNyZWF0ZWNvbnRleHQtZ3B1ZGV2aWNlXG4gICAqL1xuICBleHBvcnQgaW50ZXJmYWNlIFdlYk5OT3B0aW9uc1dlYkdwdSBleHRlbmRzIFdlYk5ORXhlY3V0aW9uUHJvdmlkZXJOYW1lIHtcbiAgICBjb250ZXh0OiBUcnlHZXRHbG9iYWxUeXBlPCdNTENvbnRleHQnPjtcbiAgICBncHVEZXZpY2U6IFRyeUdldEdsb2JhbFR5cGU8J0dQVURldmljZSc+O1xuICB9XG5cbiAgLyoqXG4gICAqIE9wdGlvbnMgZm9yIFdlYk5OIGV4ZWN1dGlvbiBwcm92aWRlci5cbiAgICovXG4gIGV4cG9ydCB0eXBlIFdlYk5ORXhlY3V0aW9uUHJvdmlkZXJPcHRpb24gPVxuICAgIHwgV2ViTk5PcHRpb25zV2l0aG91dE1MQ29udGV4dFxuICAgIHwgV2ViTk5PcHRpb25zV2l0aE1MQ29udGV4dFxuICAgIHwgV2ViTk5PcHRpb25zV2ViR3B1O1xuXG4gIC8vICNlbmRyZWdpb25cblxuICBleHBvcnQgaW50ZXJmYWNlIFFubkV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIGV4dGVuZHMgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24ge1xuICAgIHJlYWRvbmx5IG5hbWU6ICdxbm4nO1xuICAgIC8qKlxuICAgICAqIFNwZWNpZnkgdGhlIFFOTiBiYWNrZW5kIHR5cGUuIEUuZy4sICdjcHUnIG9yICdodHAnLlxuICAgICAqIE11dHVhbGx5IGV4Y2x1c2l2ZSB3aXRoIGBiYWNrZW5kUGF0aGAuXG4gICAgICpcbiAgICAgKiBAZGVmYXVsdCAnaHRwJ1xuICAgICAqL1xuICAgIGJhY2tlbmRUeXBlPzogc3RyaW5nO1xuICAgIC8qKlxuICAgICAqIFNwZWNpZnkgYSBwYXRoIHRvIHRoZSBRTk4gYmFja2VuZCBsaWJyYXJ5LlxuICAgICAqIE11dHVhbGx5IGV4Y2x1c2l2ZSB3aXRoIGBiYWNrZW5kVHlwZWAuXG4gICAgICovXG4gICAgYmFja2VuZFBhdGg/OiBzdHJpbmc7XG4gICAgLyoqXG4gICAgICogU3BlY2lmeSB3aGV0aGVyIHRvIGVuYWJsZSBIVFAgRlAxNiBwcmVjaXNpb24uXG4gICAgICpcbiAgICAgKiBAZGVmYXVsdCB0cnVlXG4gICAgICovXG4gICAgZW5hYmxlRnAxNlByZWNpc2lvbj86IGJvb2xlYW47XG4gIH1cbiAgZXhwb3J0IGludGVyZmFjZSBDb3JlTUxFeGVjdXRpb25Qcm92aWRlck9wdGlvbiBleHRlbmRzIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIHtcbiAgICByZWFkb25seSBuYW1lOiAnY29yZW1sJztcbiAgICAvKipcbiAgICAgKiBUaGUgYml0IGZsYWdzIGZvciBDb3JlTUwgZXhlY3V0aW9uIHByb3ZpZGVyLlxuICAgICAqXG4gICAgICogYGBgXG4gICAgICogQ09SRU1MX0ZMQUdfVVNFX0NQVV9PTkxZID0gMHgwMDFcbiAgICAgKiBDT1JFTUxfRkxBR19FTkFCTEVfT05fU1VCR1JBUEggPSAweDAwMlxuICAgICAqIENPUkVNTF9GTEFHX09OTFlfRU5BQkxFX0RFVklDRV9XSVRIX0FORSA9IDB4MDA0XG4gICAgICogQ09SRU1MX0ZMQUdfT05MWV9BTExPV19TVEFUSUNfSU5QVVRfU0hBUEVTID0gMHgwMDhcbiAgICAgKiBDT1JFTUxfRkxBR19DUkVBVEVfTUxQUk9HUkFNID0gMHgwMTBcbiAgICAgKiBDT1JFTUxfRkxBR19VU0VfQ1BVX0FORF9HUFUgPSAweDAyMFxuICAgICAqIGBgYFxuICAgICAqXG4gICAgICogU2VlIGluY2x1ZGUvb25ueHJ1bnRpbWUvY29yZS9wcm92aWRlcnMvY29yZW1sL2NvcmVtbF9wcm92aWRlcl9mYWN0b3J5LmggZm9yIG1vcmUgZGV0YWlscy5cbiAgICAgKlxuICAgICAqIFRoaXMgZmxhZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSAoTm9kZS5qcyBiaW5kaW5nKS5cbiAgICAgKi9cbiAgICBjb3JlTWxGbGFncz86IG51bWJlcjtcbiAgICAvKipcbiAgICAgKiBTcGVjaWZ5IHdoZXRoZXIgdG8gdXNlIENQVSBvbmx5IGluIENvcmVNTCBFUC5cbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSAocmVhY3QtbmF0aXZlKS5cbiAgICAgKi9cbiAgICB1c2VDUFVPbmx5PzogYm9vbGVhbjtcbiAgICB1c2VDUFVBbmRHUFU/OiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIFNwZWNpZnkgd2hldGhlciB0byBlbmFibGUgQ29yZU1MIEVQIG9uIHN1YmdyYXBoLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIChyZWFjdC1uYXRpdmUpLlxuICAgICAqL1xuICAgIGVuYWJsZU9uU3ViZ3JhcGg/OiBib29sZWFuO1xuICAgIC8qKlxuICAgICAqIFNwZWNpZnkgd2hldGhlciB0byBvbmx5IGVuYWJsZSBDb3JlTUwgRVAgZm9yIEFwcGxlIGRldmljZXMgd2l0aCBBTkUgKEFwcGxlIE5ldXJhbCBFbmdpbmUpLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIChyZWFjdC1uYXRpdmUpLlxuICAgICAqL1xuICAgIG9ubHlFbmFibGVEZXZpY2VXaXRoQU5FPzogYm9vbGVhbjtcbiAgfVxuICBleHBvcnQgaW50ZXJmYWNlIE5uYXBpRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24gZXh0ZW5kcyBFeGVjdXRpb25Qcm92aWRlck9wdGlvbiB7XG4gICAgcmVhZG9ubHkgbmFtZTogJ25uYXBpJztcbiAgICB1c2VGUDE2PzogYm9vbGVhbjtcbiAgICB1c2VOQ0hXPzogYm9vbGVhbjtcbiAgICBjcHVEaXNhYmxlZD86IGJvb2xlYW47XG4gICAgY3B1T25seT86IGJvb2xlYW47XG4gIH1cbiAgLy8gI2VuZHJlZ2lvblxuXG4gIC8vICNlbmRyZWdpb25cblxuICAvLyAjcmVnaW9uIHJ1biBvcHRpb25zXG5cbiAgLyoqXG4gICAqIEEgc2V0IG9mIGNvbmZpZ3VyYXRpb25zIGZvciBpbmZlcmVuY2UgcnVuIGJlaGF2aW9yXG4gICAqL1xuICBleHBvcnQgaW50ZXJmYWNlIFJ1bk9wdGlvbnMge1xuICAgIC8qKlxuICAgICAqIExvZyBzZXZlcml0eSBsZXZlbC4gU2VlXG4gICAgICogaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9vbm54cnVudGltZS9ibG9iL21haW4vaW5jbHVkZS9vbm54cnVudGltZS9jb3JlL2NvbW1vbi9sb2dnaW5nL3NldmVyaXR5LmhcbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSAoTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUpIG9yIFdlYkFzc2VtYmx5IGJhY2tlbmRcbiAgICAgKi9cbiAgICBsb2dTZXZlcml0eUxldmVsPzogMCB8IDEgfCAyIHwgMyB8IDQ7XG5cbiAgICAvKipcbiAgICAgKiBMb2cgdmVyYm9zaXR5IGxldmVsLlxuICAgICAqXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIFdlYkFzc2VtYmx5IGJhY2tlbmQuIFdpbGwgc3VwcG9ydCBOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSBsYXRlclxuICAgICAqL1xuICAgIGxvZ1ZlcmJvc2l0eUxldmVsPzogbnVtYmVyO1xuXG4gICAgLyoqXG4gICAgICogVGVybWluYXRlIGFsbCBpbmNvbXBsZXRlIE9ydFJ1biBjYWxscyBhcyBzb29uIGFzIHBvc3NpYmxlIGlmIHRydWVcbiAgICAgKlxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBXZWJBc3NlbWJseSBiYWNrZW5kLiBXaWxsIHN1cHBvcnQgTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUgbGF0ZXJcbiAgICAgKi9cbiAgICB0ZXJtaW5hdGU/OiBib29sZWFuO1xuXG4gICAgLyoqXG4gICAgICogQSB0YWcgZm9yIHRoZSBSdW4oKSBjYWxscyB1c2luZyB0aGlzXG4gICAgICpcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgKE5vZGUuanMgYmluZGluZyBhbmQgcmVhY3QtbmF0aXZlKSBvciBXZWJBc3NlbWJseSBiYWNrZW5kXG4gICAgICovXG4gICAgdGFnPzogc3RyaW5nO1xuXG4gICAgLyoqXG4gICAgICogU2V0IGEgc2luZ2xlIHJ1biBjb25maWd1cmF0aW9uIGVudHJ5LiBTZWVcbiAgICAgKiBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L29ubnhydW50aW1lL2Jsb2IvbWFpbi9pbmNsdWRlL29ubnhydW50aW1lL2NvcmUvc2Vzc2lvbi9cbiAgICAgKiBvbm54cnVudGltZV9ydW5fb3B0aW9uc19jb25maWdfa2V5cy5oXG4gICAgICpcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gV2ViQXNzZW1ibHkgYmFja2VuZC4gV2lsbCBzdXBwb3J0IE5vZGUuanMgYmluZGluZyBhbmQgcmVhY3QtbmF0aXZlIGxhdGVyXG4gICAgICpcbiAgICAgKiBAZXhhbXBsZVxuICAgICAqXG4gICAgICogYGBganNcbiAgICAgKiBleHRyYToge1xuICAgICAqICAgbWVtb3J5OiB7XG4gICAgICogICAgIGVuYWJsZV9tZW1vcnlfYXJlbmFfc2hyaW5rYWdlOiBcIjFcIixcbiAgICAgKiAgIH1cbiAgICAgKiB9XG4gICAgICogYGBgXG4gICAgICovXG4gICAgZXh0cmE/OiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPjtcbiAgfVxuXG4gIC8vICNlbmRyZWdpb25cblxuICAvLyAjcmVnaW9uIHZhbHVlIG1ldGFkYXRhXG5cbiAgLyoqXG4gICAqIFRoZSBjb21tb24gcGFydCBvZiB0aGUgdmFsdWUgbWV0YWRhdGEgdHlwZSBmb3IgYm90aCB0ZW5zb3IgYW5kIG5vbi10ZW5zb3IgdmFsdWVzLlxuICAgKi9cbiAgZXhwb3J0IGludGVyZmFjZSBWYWx1ZU1ldGFkYXRhQmFzZSB7XG4gICAgLyoqXG4gICAgICogVGhlIG5hbWUgb2YgdGhlIHNwZWNpZmllZCBpbnB1dCBvciBvdXRwdXQuXG4gICAgICovXG4gICAgcmVhZG9ubHkgbmFtZTogc3RyaW5nO1xuICB9XG5cbiAgLyoqXG4gICAqIFJlcHJlc2VudHMgdGhlIG1ldGFkYXRhIG9mIGEgbm9uLXRlbnNvciB2YWx1ZS5cbiAgICovXG4gIGV4cG9ydCBpbnRlcmZhY2UgTm9uVGVuc29yVmFsdWVNZXRhZGF0YSBleHRlbmRzIFZhbHVlTWV0YWRhdGFCYXNlIHtcbiAgICAvKipcbiAgICAgKiBHZXQgYSB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIHZhbHVlIGlzIGEgdGVuc29yLlxuICAgICAqL1xuICAgIHJlYWRvbmx5IGlzVGVuc29yOiBmYWxzZTtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXByZXNlbnRzIHRoZSBtZXRhZGF0YSBvZiBhIHRlbnNvciB2YWx1ZS5cbiAgICovXG4gIGV4cG9ydCBpbnRlcmZhY2UgVGVuc29yVmFsdWVNZXRhZGF0YSBleHRlbmRzIFZhbHVlTWV0YWRhdGFCYXNlIHtcbiAgICAvKipcbiAgICAgKiBHZXQgYSB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdGhlIHZhbHVlIGlzIGEgdGVuc29yLlxuICAgICAqL1xuICAgIHJlYWRvbmx5IGlzVGVuc29yOiB0cnVlO1xuICAgIC8qKlxuICAgICAqIEdldCB0aGUgZGF0YSB0eXBlIG9mIHRoZSB0ZW5zb3IuXG4gICAgICovXG4gICAgcmVhZG9ubHkgdHlwZTogVGVuc29yLlR5cGU7XG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBzaGFwZSBvZiB0aGUgdGVuc29yLlxuICAgICAqXG4gICAgICogSWYgdGhlIHNoYXBlIGlzIG5vdCBkZWZpbmVkLCB0aGUgdmFsdWUgd2lsbCBhbiBlbXB0eSBhcnJheS4gT3RoZXJ3aXNlLCBpdCB3aWxsIGJlIGFuIGFycmF5IHJlcHJlc2VudGluZyB0aGUgc2hhcGVcbiAgICAgKiBvZiB0aGUgdGVuc29yLiBFYWNoIGVsZW1lbnQgaW4gdGhlIGFycmF5IGNhbiBiZSBhIG51bWJlciBvciBhIHN0cmluZy4gSWYgdGhlIGVsZW1lbnQgaXMgYSBudW1iZXIsIGl0IHJlcHJlc2VudHNcbiAgICAgKiB0aGUgY29ycmVzcG9uZGluZyBkaW1lbnNpb24gc2l6ZS4gSWYgdGhlIGVsZW1lbnQgaXMgYSBzdHJpbmcsIGl0IHJlcHJlc2VudHMgYSBzeW1ib2xpYyBkaW1lbnNpb24uXG4gICAgICovXG4gICAgcmVhZG9ubHkgc2hhcGU6IFJlYWRvbmx5QXJyYXk8bnVtYmVyIHwgc3RyaW5nPjtcbiAgfVxuXG4gIC8qKlxuICAgKiBSZXByZXNlbnRzIHRoZSBtZXRhZGF0YSBvZiBhIHZhbHVlLlxuICAgKi9cbiAgZXhwb3J0IHR5cGUgVmFsdWVNZXRhZGF0YSA9IE5vblRlbnNvclZhbHVlTWV0YWRhdGEgfCBUZW5zb3JWYWx1ZU1ldGFkYXRhO1xuXG4gIC8vICNlbmRyZWdpb25cbn1cblxuLyoqXG4gKiBSZXByZXNlbnQgYSBydW50aW1lIGluc3RhbmNlIG9mIGFuIE9OTlggbW9kZWwuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgSW5mZXJlbmNlU2Vzc2lvbiB7XG4gIC8vICNyZWdpb24gcnVuKClcblxuICAvKipcbiAgICogRXhlY3V0ZSB0aGUgbW9kZWwgYXN5bmNocm9ub3VzbHkgd2l0aCB0aGUgZ2l2ZW4gZmVlZHMgYW5kIG9wdGlvbnMuXG4gICAqXG4gICAqIEBwYXJhbSBmZWVkcyAtIFJlcHJlc2VudGF0aW9uIG9mIHRoZSBtb2RlbCBpbnB1dC4gU2VlIHR5cGUgZGVzY3JpcHRpb24gb2YgYEluZmVyZW5jZVNlc3Npb24uSW5wdXRUeXBlYCBmb3IgZGV0YWlsLlxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbmFsLiBBIHNldCBvZiBvcHRpb25zIHRoYXQgY29udHJvbHMgdGhlIGJlaGF2aW9yIG9mIG1vZGVsIGluZmVyZW5jZS5cbiAgICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSBtYXAsIHdoaWNoIHVzZXMgb3V0cHV0IG5hbWVzIGFzIGtleXMgYW5kIE9ubnhWYWx1ZSBhcyBjb3JyZXNwb25kaW5nIHZhbHVlcy5cbiAgICovXG4gIHJ1bihmZWVkczogSW5mZXJlbmNlU2Vzc2lvbi5GZWVkc1R5cGUsIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOiBQcm9taXNlPEluZmVyZW5jZVNlc3Npb24uUmV0dXJuVHlwZT47XG5cbiAgLyoqXG4gICAqIEV4ZWN1dGUgdGhlIG1vZGVsIGFzeW5jaHJvbm91c2x5IHdpdGggdGhlIGdpdmVuIGZlZWRzLCBmZXRjaGVzIGFuZCBvcHRpb25zLlxuICAgKlxuICAgKiBAcGFyYW0gZmVlZHMgLSBSZXByZXNlbnRhdGlvbiBvZiB0aGUgbW9kZWwgaW5wdXQuIFNlZSB0eXBlIGRlc2NyaXB0aW9uIG9mIGBJbmZlcmVuY2VTZXNzaW9uLklucHV0VHlwZWAgZm9yIGRldGFpbC5cbiAgICogQHBhcmFtIGZldGNoZXMgLSBSZXByZXNlbnRhdGlvbiBvZiB0aGUgbW9kZWwgb3V0cHV0LiBTZWUgdHlwZSBkZXNjcmlwdGlvbiBvZiBgSW5mZXJlbmNlU2Vzc2lvbi5PdXRwdXRUeXBlYCBmb3JcbiAgICogZGV0YWlsLlxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbmFsLiBBIHNldCBvZiBvcHRpb25zIHRoYXQgY29udHJvbHMgdGhlIGJlaGF2aW9yIG9mIG1vZGVsIGluZmVyZW5jZS5cbiAgICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSBtYXAsIHdoaWNoIHVzZXMgb3V0cHV0IG5hbWVzIGFzIGtleXMgYW5kIE9ubnhWYWx1ZSBhcyBjb3JyZXNwb25kaW5nIHZhbHVlcy5cbiAgICovXG4gIHJ1bihcbiAgICBmZWVkczogSW5mZXJlbmNlU2Vzc2lvbi5GZWVkc1R5cGUsXG4gICAgZmV0Y2hlczogSW5mZXJlbmNlU2Vzc2lvbi5GZXRjaGVzVHlwZSxcbiAgICBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zLFxuICApOiBQcm9taXNlPEluZmVyZW5jZVNlc3Npb24uUmV0dXJuVHlwZT47XG5cbiAgLy8gI2VuZHJlZ2lvblxuXG4gIC8vICNyZWdpb24gcmVsZWFzZSgpXG5cbiAgLyoqXG4gICAqIFJlbGVhc2UgdGhlIGluZmVyZW5jZSBzZXNzaW9uIGFuZCB0aGUgdW5kZXJseWluZyByZXNvdXJjZXMuXG4gICAqL1xuICByZWxlYXNlKCk6IFByb21pc2U8dm9pZD47XG5cbiAgLy8gI2VuZHJlZ2lvblxuXG4gIC8vICNyZWdpb24gcHJvZmlsaW5nXG5cbiAgLyoqXG4gICAqIFN0YXJ0IHByb2ZpbGluZy5cbiAgICovXG4gIHN0YXJ0UHJvZmlsaW5nKCk6IHZvaWQ7XG5cbiAgLyoqXG4gICAqIEVuZCBwcm9maWxpbmcuXG4gICAqL1xuICBlbmRQcm9maWxpbmcoKTogdm9pZDtcblxuICAvLyAjZW5kcmVnaW9uXG5cbiAgLy8gI3JlZ2lvbiBtZXRhZGF0YVxuXG4gIC8qKlxuICAgKiBHZXQgaW5wdXQgbmFtZXMgb2YgdGhlIGxvYWRlZCBtb2RlbC5cbiAgICovXG4gIHJlYWRvbmx5IGlucHV0TmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xuXG4gIC8qKlxuICAgKiBHZXQgb3V0cHV0IG5hbWVzIG9mIHRoZSBsb2FkZWQgbW9kZWwuXG4gICAqL1xuICByZWFkb25seSBvdXRwdXROYW1lczogcmVhZG9ubHkgc3RyaW5nW107XG5cbiAgLyoqXG4gICAqIEdldCBpbnB1dCBtZXRhZGF0YSBvZiB0aGUgbG9hZGVkIG1vZGVsLlxuICAgKi9cbiAgcmVhZG9ubHkgaW5wdXRNZXRhZGF0YTogcmVhZG9ubHkgSW5mZXJlbmNlU2Vzc2lvbi5WYWx1ZU1ldGFkYXRhW107XG5cbiAgLyoqXG4gICAqIEdldCBvdXRwdXQgbWV0YWRhdGEgb2YgdGhlIGxvYWRlZCBtb2RlbC5cbiAgICovXG4gIHJlYWRvbmx5IG91dHB1dE1ldGFkYXRhOiByZWFkb25seSBJbmZlcmVuY2VTZXNzaW9uLlZhbHVlTWV0YWRhdGFbXTtcblxuICAvLyAjZW5kcmVnaW9uXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSW5mZXJlbmNlU2Vzc2lvbkZhY3Rvcnkge1xuICAvLyAjcmVnaW9uIGNyZWF0ZSgpXG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBpbmZlcmVuY2Ugc2Vzc2lvbiBhbmQgbG9hZCBtb2RlbCBhc3luY2hyb25vdXNseSBmcm9tIGFuIE9OTlggbW9kZWwgZmlsZS5cbiAgICpcbiAgICogQHBhcmFtIHVyaSAtIFRoZSBVUkkgb3IgZmlsZSBwYXRoIG9mIHRoZSBtb2RlbCB0byBsb2FkLlxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIHNwZWNpZnkgY29uZmlndXJhdGlvbiBmb3IgY3JlYXRpbmcgYSBuZXcgaW5mZXJlbmNlIHNlc3Npb24uXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIEluZmVyZW5jZVNlc3Npb24gb2JqZWN0LlxuICAgKi9cbiAgY3JlYXRlKHVyaTogc3RyaW5nLCBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbj47XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyBpbmZlcmVuY2Ugc2Vzc2lvbiBhbmQgbG9hZCBtb2RlbCBhc3luY2hyb25vdXNseSBmcm9tIGFuIGFycmF5IGJ1ZmVyLlxuICAgKlxuICAgKiBAcGFyYW0gYnVmZmVyIC0gQW4gQXJyYXlCdWZmZXIgcmVwcmVzZW50YXRpb24gb2YgYW4gT05OWCBtb2RlbC5cbiAgICogQHBhcmFtIG9wdGlvbnMgLSBzcGVjaWZ5IGNvbmZpZ3VyYXRpb24gZm9yIGNyZWF0aW5nIGEgbmV3IGluZmVyZW5jZSBzZXNzaW9uLlxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBJbmZlcmVuY2VTZXNzaW9uIG9iamVjdC5cbiAgICovXG4gIGNyZWF0ZShidWZmZXI6IEFycmF5QnVmZmVyTGlrZSwgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOiBQcm9taXNlPEluZmVyZW5jZVNlc3Npb24+O1xuXG4gIC8qKlxuICAgKiBDcmVhdGUgYSBuZXcgaW5mZXJlbmNlIHNlc3Npb24gYW5kIGxvYWQgbW9kZWwgYXN5bmNocm9ub3VzbHkgZnJvbSBzZWdtZW50IG9mIGFuIGFycmF5IGJ1ZmVyLlxuICAgKlxuICAgKiBAcGFyYW0gYnVmZmVyIC0gQW4gQXJyYXlCdWZmZXIgcmVwcmVzZW50YXRpb24gb2YgYW4gT05OWCBtb2RlbC5cbiAgICogQHBhcmFtIGJ5dGVPZmZzZXQgLSBUaGUgYmVnaW5uaW5nIG9mIHRoZSBzcGVjaWZpZWQgcG9ydGlvbiBvZiB0aGUgYXJyYXkgYnVmZmVyLlxuICAgKiBAcGFyYW0gYnl0ZUxlbmd0aCAtIFRoZSBsZW5ndGggaW4gYnl0ZXMgb2YgdGhlIGFycmF5IGJ1ZmZlci5cbiAgICogQHBhcmFtIG9wdGlvbnMgLSBzcGVjaWZ5IGNvbmZpZ3VyYXRpb24gZm9yIGNyZWF0aW5nIGEgbmV3IGluZmVyZW5jZSBzZXNzaW9uLlxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBJbmZlcmVuY2VTZXNzaW9uIG9iamVjdC5cbiAgICovXG4gIGNyZWF0ZShcbiAgICBidWZmZXI6IEFycmF5QnVmZmVyTGlrZSxcbiAgICBieXRlT2Zmc2V0OiBudW1iZXIsXG4gICAgYnl0ZUxlbmd0aD86IG51bWJlcixcbiAgICBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uPjtcblxuICAvKipcbiAgICogQ3JlYXRlIGEgbmV3IGluZmVyZW5jZSBzZXNzaW9uIGFuZCBsb2FkIG1vZGVsIGFzeW5jaHJvbm91c2x5IGZyb20gYSBVaW50OEFycmF5LlxuICAgKlxuICAgKiBAcGFyYW0gYnVmZmVyIC0gQSBVaW50OEFycmF5IHJlcHJlc2VudGF0aW9uIG9mIGFuIE9OTlggbW9kZWwuXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gc3BlY2lmeSBjb25maWd1cmF0aW9uIGZvciBjcmVhdGluZyBhIG5ldyBpbmZlcmVuY2Ugc2Vzc2lvbi5cbiAgICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYW4gSW5mZXJlbmNlU2Vzc2lvbiBvYmplY3QuXG4gICAqL1xuICBjcmVhdGUoYnVmZmVyOiBVaW50OEFycmF5LCBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbj47XG5cbiAgLy8gI2VuZHJlZ2lvblxufVxuXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXG5leHBvcnQgY29uc3QgSW5mZXJlbmNlU2Vzc2lvbjogSW5mZXJlbmNlU2Vzc2lvbkZhY3RvcnkgPSBJbmZlcmVuY2VTZXNzaW9uSW1wbDtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHsgT3B0aW9uc0Zvcm1hdCwgT3B0aW9uc05vcm1hbGl6YXRpb25QYXJhbWV0ZXJzLCBPcHRpb25zVGVuc29yTGF5b3V0IH0gZnJvbSAnLi90ZW5zb3ItZmFjdG9yeS5qcyc7XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGVuc29yVG9EYXRhVXJsT3B0aW9ucyBleHRlbmRzIE9wdGlvbnNUZW5zb3JMYXlvdXQsIE9wdGlvbnNGb3JtYXQsIE9wdGlvbnNOb3JtYWxpemF0aW9uUGFyYW1ldGVycyB7fVxuXG5leHBvcnQgaW50ZXJmYWNlIFRlbnNvclRvSW1hZ2VEYXRhT3B0aW9ucyBleHRlbmRzIE9wdGlvbnNUZW5zb3JMYXlvdXQsIE9wdGlvbnNGb3JtYXQsIE9wdGlvbnNOb3JtYWxpemF0aW9uUGFyYW1ldGVycyB7fVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbnZlcnNpb25VdGlscyB7XG4gIC8qKlxuICAgKiBjcmVhdGVzIGEgRGF0YVVSTCBpbnN0YW5jZSBmcm9tIHRlbnNvclxuICAgKlxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIEFuIG9wdGlvbmFsIG9iamVjdCByZXByZXNlbnRpbmcgb3B0aW9ucyBmb3IgY3JlYXRpbmcgYSBEYXRhVVJMIGluc3RhbmNlIGZyb20gdGhlIHRlbnNvci5cbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBkZWZhdWx0IHNldHRpbmdzIHdpbGwgYmUgYXBwbGllZDpcbiAgICogLSBgZm9ybWF0YDogYCdSR0InYFxuICAgKiAtIGB0ZW5zb3JMYXlvdXRgOiBgJ05DSFcnYFxuICAgKiBAcmV0dXJucyBhIERhdGFVUkwgc3RyaW5nIHJlcHJlc2VudGluZyB0aGUgaW1hZ2UgY29udmVydGVkIGZyb20gdGVuc29yIGRhdGFcbiAgICovXG4gIHRvRGF0YVVSTChvcHRpb25zPzogVGVuc29yVG9EYXRhVXJsT3B0aW9ucyk6IHN0cmluZztcblxuICAvKipcbiAgICogY3JlYXRlcyBhbiBJbWFnZURhdGEgaW5zdGFuY2UgZnJvbSB0ZW5zb3JcbiAgICpcbiAgICogQHBhcmFtIG9wdGlvbnMgLSBBbiBvcHRpb25hbCBvYmplY3QgcmVwcmVzZW50aW5nIG9wdGlvbnMgZm9yIGNyZWF0aW5nIGFuIEltYWdlRGF0YSBpbnN0YW5jZSBmcm9tIHRoZSB0ZW5zb3IuXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZGVmYXVsdCBzZXR0aW5ncyB3aWxsIGJlIGFwcGxpZWQ6XG4gICAqIC0gYGZvcm1hdGA6IGAnUkdCJ2BcbiAgICogLSBgdGVuc29yTGF5b3V0YDogYCdOQ0hXJ2BcbiAgICogQHJldHVybnMgYW4gSW1hZ2VEYXRhIGluc3RhbmNlIHJlcHJlc2VudGluZyB0aGUgaW1hZ2UgY29udmVydGVkIGZyb20gdGVuc29yIGRhdGFcbiAgICovXG4gIHRvSW1hZ2VEYXRhKG9wdGlvbnM/OiBUZW5zb3JUb0ltYWdlRGF0YU9wdGlvbnMpOiBJbWFnZURhdGE7XG59XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7IFRlbnNvciwgVHlwZWRUZW5zb3IgfSBmcm9tICcuL3RlbnNvci5qcyc7XG5cbmV4cG9ydCB0eXBlIEltYWdlRm9ybWF0ID0gJ1JHQicgfCAnUkdCQScgfCAnQkdSJyB8ICdSQkcnO1xuZXhwb3J0IHR5cGUgSW1hZ2VUZW5zb3JMYXlvdXQgPSAnTkhXQycgfCAnTkNIVyc7XG5cbi8vIHRoZSBmb2xsb3dpbmcgcmVnaW9uIGNvbnRhaW5zIHR5cGUgZGVmaW5pdGlvbnMgZm9yIGNvbnN0cnVjdGluZyB0ZW5zb3IgZnJvbSBhIHNwZWNpZmljIGxvY2F0aW9uLlxuXG4vLyAjcmVnaW9uIHR5cGVzIGZvciBjb25zdHJ1Y3RpbmcgYSB0ZW5zb3IgZnJvbSBhIHNwZWNpZmljIGxvY2F0aW9uXG5cbi8qKlxuICogcmVwcmVzZW50IGNvbW1vbiBwcm9wZXJ0aWVzIG9mIHRoZSBwYXJhbWV0ZXIgZm9yIGNvbnN0cnVjdGluZyBhIHRlbnNvciBmcm9tIGEgc3BlY2lmaWMgbG9jYXRpb24uXG4gKi9cbmludGVyZmFjZSBDb21tb25Db25zdHJ1Y3RvclBhcmFtZXRlcnM8VD4gZXh0ZW5kcyBQaWNrPFRlbnNvciwgJ2RpbXMnPiB7XG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSBkYXRhIHR5cGUgb2YgdGhlIHRlbnNvci5cbiAgICovXG4gIHJlYWRvbmx5IHR5cGU6IFQ7XG59XG5cbi8qKlxuICogcmVwcmVzZW50IHRoZSBwYXJhbWV0ZXIgZm9yIGNvbnN0cnVjdGluZyBhIHRlbnNvciBmcm9tIGEgR1BVIHJlc291cmNlLlxuICovXG5pbnRlcmZhY2UgR3B1UmVzb3VyY2VDb25zdHJ1Y3RvclBhcmFtZXRlcnM8VCBleHRlbmRzIFRlbnNvci5UeXBlPiB7XG4gIC8qKlxuICAgKiBhbiBvcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvbiB0byBkb3dubG9hZCBkYXRhIGZyb20gR1BVIHRvIENQVS5cbiAgICpcbiAgICogSWYgbm90IHByb3ZpZGVkLCB0aGUgdGVuc29yIHRyZWF0IHRoZSBHUFUgZGF0YSBhcyBleHRlcm5hbCByZXNvdXJjZS5cbiAgICovXG4gIGRvd25sb2FkPygpOiBQcm9taXNlPFRlbnNvci5EYXRhVHlwZU1hcFtUXT47XG5cbiAgLyoqXG4gICAqIGFuIG9wdGlvbmFsIGNhbGxiYWNrIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBjYWxsZWQgd2hlbiB0aGUgdGVuc29yIGlzIGRpc3Bvc2VkLlxuICAgKlxuICAgKiBJZiBub3QgcHJvdmlkZWQsIHRoZSB0ZW5zb3IgdHJlYXQgdGhlIEdQVSBkYXRhIGFzIGV4dGVybmFsIHJlc291cmNlLlxuICAgKi9cbiAgZGlzcG9zZT8oKTogdm9pZDtcbn1cblxuLyoqXG4gKiByZXByZXNlbnQgdGhlIHBhcmFtZXRlciBmb3IgY29uc3RydWN0aW5nIGEgdGVuc29yIGZyb20gYSBwaW5uZWQgQ1BVIGJ1ZmZlclxuICovXG5leHBvcnQgaW50ZXJmYWNlIENwdVBpbm5lZENvbnN0cnVjdG9yUGFyYW1ldGVyczxUIGV4dGVuZHMgVGVuc29yLkNwdVBpbm5lZERhdGFUeXBlcyA9IFRlbnNvci5DcHVQaW5uZWREYXRhVHlwZXM+XG4gIGV4dGVuZHMgQ29tbW9uQ29uc3RydWN0b3JQYXJhbWV0ZXJzPFQ+IHtcbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIGxvY2F0aW9uIG9mIHRoZSBkYXRhIHRvIGJlICdjcHUtcGlubmVkJy5cbiAgICovXG4gIHJlYWRvbmx5IGxvY2F0aW9uOiAnY3B1LXBpbm5lZCc7XG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSBDUFUgcGlubmVkIGJ1ZmZlciB0aGF0IGhvbGRzIHRoZSB0ZW5zb3IgZGF0YS5cbiAgICovXG4gIHJlYWRvbmx5IGRhdGE6IFRlbnNvci5EYXRhVHlwZU1hcFtUXTtcbn1cblxuLyoqXG4gKiByZXByZXNlbnQgdGhlIHBhcmFtZXRlciBmb3IgY29uc3RydWN0aW5nIGEgdGVuc29yIGZyb20gYSBXZWJHTCB0ZXh0dXJlXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGV4dHVyZUNvbnN0cnVjdG9yUGFyYW1ldGVyczxUIGV4dGVuZHMgVGVuc29yLlRleHR1cmVEYXRhVHlwZXMgPSBUZW5zb3IuVGV4dHVyZURhdGFUeXBlcz5cbiAgZXh0ZW5kcyBDb21tb25Db25zdHJ1Y3RvclBhcmFtZXRlcnM8VD4sXG4gICAgR3B1UmVzb3VyY2VDb25zdHJ1Y3RvclBhcmFtZXRlcnM8VD4ge1xuICAvKipcbiAgICogU3BlY2lmeSB0aGUgbG9jYXRpb24gb2YgdGhlIGRhdGEgdG8gYmUgJ3RleHR1cmUnLlxuICAgKi9cbiAgcmVhZG9ubHkgbG9jYXRpb246ICd0ZXh0dXJlJztcbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIFdlYkdMIHRleHR1cmUgdGhhdCBob2xkcyB0aGUgdGVuc29yIGRhdGEuXG4gICAqL1xuICByZWFkb25seSB0ZXh0dXJlOiBUZW5zb3IuVGV4dHVyZVR5cGU7XG59XG5cbi8qKlxuICogcmVwcmVzZW50IHRoZSBwYXJhbWV0ZXIgZm9yIGNvbnN0cnVjdGluZyBhIHRlbnNvciBmcm9tIGEgV2ViR1BVIGJ1ZmZlclxuICovXG5leHBvcnQgaW50ZXJmYWNlIEdwdUJ1ZmZlckNvbnN0cnVjdG9yUGFyYW1ldGVyczxUIGV4dGVuZHMgVGVuc29yLkdwdUJ1ZmZlckRhdGFUeXBlcyA9IFRlbnNvci5HcHVCdWZmZXJEYXRhVHlwZXM+XG4gIGV4dGVuZHMgQ29tbW9uQ29uc3RydWN0b3JQYXJhbWV0ZXJzPFQ+LFxuICAgIEdwdVJlc291cmNlQ29uc3RydWN0b3JQYXJhbWV0ZXJzPFQ+IHtcbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIGxvY2F0aW9uIG9mIHRoZSBkYXRhIHRvIGJlICdncHUtYnVmZmVyJy5cbiAgICovXG4gIHJlYWRvbmx5IGxvY2F0aW9uOiAnZ3B1LWJ1ZmZlcic7XG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSBXZWJHUFUgYnVmZmVyIHRoYXQgaG9sZHMgdGhlIHRlbnNvciBkYXRhLlxuICAgKi9cbiAgcmVhZG9ubHkgZ3B1QnVmZmVyOiBUZW5zb3IuR3B1QnVmZmVyVHlwZTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBNTFRlbnNvckNvbnN0cnVjdG9yUGFyYW1ldGVyczxUIGV4dGVuZHMgVGVuc29yLk1MVGVuc29yRGF0YVR5cGVzID0gVGVuc29yLk1MVGVuc29yRGF0YVR5cGVzPlxuICBleHRlbmRzIENvbW1vbkNvbnN0cnVjdG9yUGFyYW1ldGVyczxUPixcbiAgICBHcHVSZXNvdXJjZUNvbnN0cnVjdG9yUGFyYW1ldGVyczxUPiB7XG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSBsb2NhdGlvbiBvZiB0aGUgZGF0YSB0byBiZSAnbWwtdGVuc29yJy5cbiAgICovXG4gIHJlYWRvbmx5IGxvY2F0aW9uOiAnbWwtdGVuc29yJztcblxuICAvKipcbiAgICogU3BlY2lmeSB0aGUgV2ViTk4gTUxUZW5zb3IgdGhhdCBob2xkcyB0aGUgdGVuc29yIGRhdGEuXG4gICAqL1xuICByZWFkb25seSBtbFRlbnNvcjogVGVuc29yLk1MVGVuc29yVHlwZTtcbn1cblxuLy8gI2VuZHJlZ2lvblxuXG4vLyB0aGUgZm9sbG93aW5nIHJlZ2lvbiBjb250YWlucyB0eXBlIGRlZmluaXRpb25zIG9mIGVhY2ggaW5kaXZpZHVhbCBvcHRpb25zLlxuLy8gdGhlIHRlbnNvciBmYWN0b3J5IGZ1bmN0aW9ucyB1c2UgYSBjb21wb3NpdGlvbiBvZiB0aG9zZSBvcHRpb25zIGFzIHRoZSBwYXJhbWV0ZXIgdHlwZS5cblxuLy8gI3JlZ2lvbiBPcHRpb25zIGZpZWxkc1xuXG5leHBvcnQgaW50ZXJmYWNlIE9wdGlvbnNGb3JtYXQge1xuICAvKipcbiAgICogRGVzY3JpYmVzIHRoZSBpbWFnZSBmb3JtYXQgcmVwcmVzZW50ZWQgaW4gUkdCQSBjb2xvciBzcGFjZS5cbiAgICovXG4gIGZvcm1hdD86IEltYWdlRm9ybWF0O1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE9wdGlvbnNUZW5zb3JGb3JtYXQge1xuICAvKipcbiAgICogRGVzY3JpYmVzIHRoZSBpbWFnZSBmb3JtYXQgb2YgdGhlIHRlbnNvci5cbiAgICpcbiAgICogTk9URTogdGhpcyBpcyBkaWZmZXJlbnQgZnJvbSBvcHRpb24gJ2Zvcm1hdCcuIFdoaWxlIG9wdGlvbiAnZm9ybWF0JyByZXByZXNlbnRzIHRoZSBvcmlnaW5hbCBpbWFnZSwgJ3RlbnNvckZvcm1hdCdcbiAgICogcmVwcmVzZW50cyB0aGUgdGFyZ2V0IGZvcm1hdCBvZiB0aGUgdGVuc29yLiBBIHRyYW5zcG9zZSB3aWxsIGJlIHBlcmZvcm1lZCBpZiB0aGV5IGFyZSBkaWZmZXJlbnQuXG4gICAqL1xuICB0ZW5zb3JGb3JtYXQ/OiBJbWFnZUZvcm1hdDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBPcHRpb25zVGVuc29yRGF0YVR5cGUge1xuICAvKipcbiAgICogRGVzY3JpYmVzIHRoZSBkYXRhIHR5cGUgb2YgdGhlIHRlbnNvci5cbiAgICovXG4gIGRhdGFUeXBlPzogJ2Zsb2F0MzInIHwgJ3VpbnQ4Jztcbn1cblxuZXhwb3J0IGludGVyZmFjZSBPcHRpb25zVGVuc29yTGF5b3V0IHtcbiAgLyoqXG4gICAqIERlc2NyaWJlcyB0aGUgdGVuc29yIGxheW91dCB3aGVuIHJlcHJlc2VudGluZyBkYXRhIG9mIG9uZSBvciBtb3JlIGltYWdlKHMpLlxuICAgKi9cbiAgdGVuc29yTGF5b3V0PzogSW1hZ2VUZW5zb3JMYXlvdXQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgT3B0aW9uc0RpbWVuc2lvbnMge1xuICAvKipcbiAgICogRGVzY3JpYmVzIHRoZSBpbWFnZSBoZWlnaHQgaW4gcGl4ZWxcbiAgICovXG4gIGhlaWdodD86IG51bWJlcjtcbiAgLyoqXG4gICAqIERlc2NyaWJlcyB0aGUgaW1hZ2Ugd2lkdGggaW4gcGl4ZWxcbiAgICovXG4gIHdpZHRoPzogbnVtYmVyO1xufVxuXG5leHBvcnQgaW50ZXJmYWNlIE9wdGlvblJlc2l6ZWREaW1lbnNpb25zIHtcbiAgLyoqXG4gICAqIERlc2NyaWJlcyB0aGUgcmVzaXplZCBoZWlnaHQuIElmIG9taXR0ZWQsIG9yaWdpbmFsIGhlaWdodCB3aWxsIGJlIHVzZWQuXG4gICAqL1xuICByZXNpemVkSGVpZ2h0PzogbnVtYmVyO1xuICAvKipcbiAgICogRGVzY3JpYmVzIHJlc2l6ZWQgd2lkdGggLSBjYW4gYmUgYWNjZXNzZWQgdmlhIHRlbnNvciBkaW1lbnNpb25zIGFzIHdlbGxcbiAgICovXG4gIHJlc2l6ZWRXaWR0aD86IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBPcHRpb25zTm9ybWFsaXphdGlvblBhcmFtZXRlcnMge1xuICAvKipcbiAgICogRGVzY3JpYmVzIG5vcm1hbGl6YXRpb24gcGFyYW1ldGVycyB3aGVuIHByZXByb2Nlc3NpbmcgdGhlIGltYWdlIGFzIG1vZGVsIGlucHV0LlxuICAgKlxuICAgKiBEYXRhIGVsZW1lbnQgYXJlIHJhbmdlZCBmcm9tIDAgdG8gMjU1LlxuICAgKi9cbiAgbm9ybT86IHtcbiAgICAvKipcbiAgICAgKiBUaGUgJ2JpYXMnIHZhbHVlIGZvciBpbWFnZSBub3JtYWxpemF0aW9uLlxuICAgICAqIC0gSWYgb21pdHRlZCwgdXNlIGRlZmF1bHQgdmFsdWUgMC5cbiAgICAgKiAtIElmIGl0J3MgYSBzaW5nbGUgbnVtYmVyLCBhcHBseSB0byBlYWNoIGNoYW5uZWxcbiAgICAgKiAtIElmIGl0J3MgYW4gYXJyYXkgb2YgMyBvciA0IG51bWJlcnMsIGFwcGx5IGVsZW1lbnQtd2lzZS4gTnVtYmVyIG9mIGVsZW1lbnRzIG5lZWQgdG8gbWF0Y2ggdGhlIG51bWJlciBvZiBjaGFubmVsc1xuICAgICAqIGZvciB0aGUgY29ycmVzcG9uZGluZyBpbWFnZSBmb3JtYXRcbiAgICAgKi9cbiAgICBiaWFzPzogbnVtYmVyIHwgW251bWJlciwgbnVtYmVyLCBudW1iZXJdIHwgW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XG4gICAgLyoqXG4gICAgICogVGhlICdtZWFuJyB2YWx1ZSBmb3IgaW1hZ2Ugbm9ybWFsaXphdGlvbi5cbiAgICAgKiAtIElmIG9taXR0ZWQsIHVzZSBkZWZhdWx0IHZhbHVlIDI1NS5cbiAgICAgKiAtIElmIGl0J3MgYSBzaW5nbGUgbnVtYmVyLCBhcHBseSB0byBlYWNoIGNoYW5uZWxcbiAgICAgKiAtIElmIGl0J3MgYW4gYXJyYXkgb2YgMyBvciA0IG51bWJlcnMsIGFwcGx5IGVsZW1lbnQtd2lzZS4gTnVtYmVyIG9mIGVsZW1lbnRzIG5lZWQgdG8gbWF0Y2ggdGhlIG51bWJlciBvZiBjaGFubmVsc1xuICAgICAqIGZvciB0aGUgY29ycmVzcG9uZGluZyBpbWFnZSBmb3JtYXRcbiAgICAgKi9cbiAgICBtZWFuPzogbnVtYmVyIHwgW251bWJlciwgbnVtYmVyLCBudW1iZXJdIHwgW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XG4gIH07XG59XG5cbi8vICNlbmRyZWdpb25cblxuLy8gI3JlZ2lvbiBPcHRpb25zIGNvbXBvc2l0aW9uXG5cbmV4cG9ydCBpbnRlcmZhY2UgVGVuc29yRnJvbUltYWdlRGF0YU9wdGlvbnNcbiAgZXh0ZW5kcyBPcHRpb25SZXNpemVkRGltZW5zaW9ucyxcbiAgICBPcHRpb25zVGVuc29yRm9ybWF0LFxuICAgIE9wdGlvbnNUZW5zb3JMYXlvdXQsXG4gICAgT3B0aW9uc1RlbnNvckRhdGFUeXBlLFxuICAgIE9wdGlvbnNOb3JtYWxpemF0aW9uUGFyYW1ldGVycyB7fVxuXG5leHBvcnQgaW50ZXJmYWNlIFRlbnNvckZyb21JbWFnZUVsZW1lbnRPcHRpb25zXG4gIGV4dGVuZHMgT3B0aW9uUmVzaXplZERpbWVuc2lvbnMsXG4gICAgT3B0aW9uc1RlbnNvckZvcm1hdCxcbiAgICBPcHRpb25zVGVuc29yTGF5b3V0LFxuICAgIE9wdGlvbnNUZW5zb3JEYXRhVHlwZSxcbiAgICBPcHRpb25zTm9ybWFsaXphdGlvblBhcmFtZXRlcnMge31cblxuZXhwb3J0IGludGVyZmFjZSBUZW5zb3JGcm9tVXJsT3B0aW9uc1xuICBleHRlbmRzIE9wdGlvbnNEaW1lbnNpb25zLFxuICAgIE9wdGlvblJlc2l6ZWREaW1lbnNpb25zLFxuICAgIE9wdGlvbnNUZW5zb3JGb3JtYXQsXG4gICAgT3B0aW9uc1RlbnNvckxheW91dCxcbiAgICBPcHRpb25zVGVuc29yRGF0YVR5cGUsXG4gICAgT3B0aW9uc05vcm1hbGl6YXRpb25QYXJhbWV0ZXJzIHt9XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGVuc29yRnJvbUltYWdlQml0bWFwT3B0aW9uc1xuICBleHRlbmRzIE9wdGlvblJlc2l6ZWREaW1lbnNpb25zLFxuICAgIE9wdGlvbnNUZW5zb3JGb3JtYXQsXG4gICAgT3B0aW9uc1RlbnNvckxheW91dCxcbiAgICBPcHRpb25zVGVuc29yRGF0YVR5cGUsXG4gICAgT3B0aW9uc05vcm1hbGl6YXRpb25QYXJhbWV0ZXJzIHt9XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGVuc29yRnJvbVRleHR1cmVPcHRpb25zPFQgZXh0ZW5kcyBUZW5zb3IuVGV4dHVyZURhdGFUeXBlcz5cbiAgZXh0ZW5kcyBSZXF1aXJlZDxPcHRpb25zRGltZW5zaW9ucz4sXG4gICAgT3B0aW9uc0Zvcm1hdCxcbiAgICBHcHVSZXNvdXJjZUNvbnN0cnVjdG9yUGFyYW1ldGVyczxUPiAvKiBUT0RPOiBhZGQgbW9yZSAqLyB7fVxuXG5leHBvcnQgaW50ZXJmYWNlIFRlbnNvckZyb21HcHVCdWZmZXJPcHRpb25zPFQgZXh0ZW5kcyBUZW5zb3IuR3B1QnVmZmVyRGF0YVR5cGVzPlxuICBleHRlbmRzIFBpY2s8VGVuc29yLCAnZGltcyc+LFxuICAgIEdwdVJlc291cmNlQ29uc3RydWN0b3JQYXJhbWV0ZXJzPFQ+IHtcbiAgLyoqXG4gICAqIERlc2NyaWJlcyB0aGUgZGF0YSB0eXBlIG9mIHRoZSB0ZW5zb3IuXG4gICAqL1xuICBkYXRhVHlwZT86IFQ7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVGVuc29yRnJvbU1MVGVuc29yT3B0aW9uczxUIGV4dGVuZHMgVGVuc29yLk1MVGVuc29yRGF0YVR5cGVzPlxuICBleHRlbmRzIFBpY2s8VGVuc29yLCAnZGltcyc+LFxuICAgIEdwdVJlc291cmNlQ29uc3RydWN0b3JQYXJhbWV0ZXJzPFQ+IHtcbiAgLyoqXG4gICAqIERlc2NyaWJlcyB0aGUgZGF0YSB0eXBlIG9mIHRoZSB0ZW5zb3IuXG4gICAqL1xuICBkYXRhVHlwZT86IFQ7XG59XG5cbi8vICNlbmRyZWdpb25cblxuLyoqXG4gKiB0eXBlIFRlbnNvckZhY3RvcnkgZGVmaW5lcyB0aGUgZmFjdG9yeSBmdW5jdGlvbnMgb2YgJ1RlbnNvcicgdG8gY3JlYXRlIHRlbnNvciBpbnN0YW5jZXMgZnJvbSBleGlzdGluZyBkYXRhIG9yXG4gKiByZXNvdXJjZXMuXG4gKi9cbmV4cG9ydCBpbnRlcmZhY2UgVGVuc29yRmFjdG9yeSB7XG4gIC8qKlxuICAgKiBjcmVhdGUgYSB0ZW5zb3IgZnJvbSBhbiBJbWFnZURhdGEgb2JqZWN0XG4gICAqXG4gICAqIEBwYXJhbSBpbWFnZURhdGEgLSB0aGUgSW1hZ2VEYXRhIG9iamVjdCB0byBjcmVhdGUgdGVuc29yIGZyb21cbiAgICogQHBhcmFtIG9wdGlvbnMgLSBBbiBvcHRpb25hbCBvYmplY3QgcmVwcmVzZW50aW5nIG9wdGlvbnMgZm9yIGNyZWF0aW5nIHRlbnNvciBmcm9tIEltYWdlRGF0YS5cbiAgICpcbiAgICogVGhlIGZvbGxvd2luZyBkZWZhdWx0IHNldHRpbmdzIHdpbGwgYmUgYXBwbGllZDpcbiAgICogLSBgdGVuc29yRm9ybWF0YDogYCdSR0InYFxuICAgKiAtIGB0ZW5zb3JMYXlvdXRgOiBgJ05DSFcnYFxuICAgKiAtIGBkYXRhVHlwZWA6IGAnZmxvYXQzMidgXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgdGVuc29yIG9iamVjdFxuICAgKi9cbiAgZnJvbUltYWdlKFxuICAgIGltYWdlRGF0YTogSW1hZ2VEYXRhLFxuICAgIG9wdGlvbnM/OiBUZW5zb3JGcm9tSW1hZ2VEYXRhT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxUeXBlZFRlbnNvcjwnZmxvYXQzMic+IHwgVHlwZWRUZW5zb3I8J3VpbnQ4Jz4+O1xuXG4gIC8qKlxuICAgKiBjcmVhdGUgYSB0ZW5zb3IgZnJvbSBhIEhUTUxJbWFnZUVsZW1lbnQgb2JqZWN0XG4gICAqXG4gICAqIEBwYXJhbSBpbWFnZUVsZW1lbnQgLSB0aGUgSFRNTEltYWdlRWxlbWVudCBvYmplY3QgdG8gY3JlYXRlIHRlbnNvciBmcm9tXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gQW4gb3B0aW9uYWwgb2JqZWN0IHJlcHJlc2VudGluZyBvcHRpb25zIGZvciBjcmVhdGluZyB0ZW5zb3IgZnJvbSBIVE1MSW1hZ2VFbGVtZW50LlxuICAgKlxuICAgKiBUaGUgZm9sbG93aW5nIGRlZmF1bHQgc2V0dGluZ3Mgd2lsbCBiZSBhcHBsaWVkOlxuICAgKiAtIGB0ZW5zb3JGb3JtYXRgOiBgJ1JHQidgXG4gICAqIC0gYHRlbnNvckxheW91dGA6IGAnTkNIVydgXG4gICAqIC0gYGRhdGFUeXBlYDogYCdmbG9hdDMyJ2BcbiAgICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSB0ZW5zb3Igb2JqZWN0XG4gICAqL1xuICBmcm9tSW1hZ2UoXG4gICAgaW1hZ2VFbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50LFxuICAgIG9wdGlvbnM/OiBUZW5zb3JGcm9tSW1hZ2VFbGVtZW50T3B0aW9ucyxcbiAgKTogUHJvbWlzZTxUeXBlZFRlbnNvcjwnZmxvYXQzMic+IHwgVHlwZWRUZW5zb3I8J3VpbnQ4Jz4+O1xuXG4gIC8qKlxuICAgKiBjcmVhdGUgYSB0ZW5zb3IgZnJvbSBVUkxcbiAgICpcbiAgICogQHBhcmFtIHVybFNvdXJjZSAtIGEgc3RyaW5nIGFzIGEgVVJMIHRvIHRoZSBpbWFnZSBvciBhIGRhdGEgVVJMIGNvbnRhaW5pbmcgdGhlIGltYWdlIGRhdGEuXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gQW4gb3B0aW9uYWwgb2JqZWN0IHJlcHJlc2VudGluZyBvcHRpb25zIGZvciBjcmVhdGluZyB0ZW5zb3IgZnJvbSBVUkwuXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZGVmYXVsdCBzZXR0aW5ncyB3aWxsIGJlIGFwcGxpZWQ6XG4gICAqIC0gYHRlbnNvckZvcm1hdGA6IGAnUkdCJ2BcbiAgICogLSBgdGVuc29yTGF5b3V0YDogYCdOQ0hXJ2BcbiAgICogLSBgZGF0YVR5cGVgOiBgJ2Zsb2F0MzInYFxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIHRlbnNvciBvYmplY3RcbiAgICovXG4gIGZyb21JbWFnZSh1cmxTb3VyY2U6IHN0cmluZywgb3B0aW9ucz86IFRlbnNvckZyb21VcmxPcHRpb25zKTogUHJvbWlzZTxUeXBlZFRlbnNvcjwnZmxvYXQzMic+IHwgVHlwZWRUZW5zb3I8J3VpbnQ4Jz4+O1xuXG4gIC8qKlxuICAgKiBjcmVhdGUgYSB0ZW5zb3IgZnJvbSBhbiBJbWFnZUJpdG1hcCBvYmplY3RcbiAgICpcbiAgICogQHBhcmFtIGJpdG1hcCAtIHRoZSBJbWFnZUJpdG1hcCBvYmplY3QgdG8gY3JlYXRlIHRlbnNvciBmcm9tXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gQW4gb3B0aW9uYWwgb2JqZWN0IHJlcHJlc2VudGluZyBvcHRpb25zIGZvciBjcmVhdGluZyB0ZW5zb3IgZnJvbSBVUkwuXG4gICAqXG4gICAqIFRoZSBmb2xsb3dpbmcgZGVmYXVsdCBzZXR0aW5ncyB3aWxsIGJlIGFwcGxpZWQ6XG4gICAqIC0gYHRlbnNvckZvcm1hdGA6IGAnUkdCJ2BcbiAgICogLSBgdGVuc29yTGF5b3V0YDogYCdOQ0hXJ2BcbiAgICogLSBgZGF0YVR5cGVgOiBgJ2Zsb2F0MzInYFxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIHRlbnNvciBvYmplY3RcbiAgICovXG4gIGZyb21JbWFnZShcbiAgICBiaXRtYXA6IEltYWdlQml0bWFwLFxuICAgIG9wdGlvbnM6IFRlbnNvckZyb21JbWFnZUJpdG1hcE9wdGlvbnMsXG4gICk6IFByb21pc2U8VHlwZWRUZW5zb3I8J2Zsb2F0MzInPiB8IFR5cGVkVGVuc29yPCd1aW50OCc+PjtcblxuICAvKipcbiAgICogY3JlYXRlIGEgdGVuc29yIGZyb20gYSBXZWJHTCB0ZXh0dXJlXG4gICAqXG4gICAqIEBwYXJhbSB0ZXh0dXJlIC0gdGhlIFdlYkdMVGV4dHVyZSBvYmplY3QgdG8gY3JlYXRlIHRlbnNvciBmcm9tXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gQW4gb3B0aW9uYWwgb2JqZWN0IHJlcHJlc2VudGluZyBvcHRpb25zIGZvciBjcmVhdGluZyB0ZW5zb3IgZnJvbSBXZWJHTCB0ZXh0dXJlLlxuICAgKlxuICAgKiBUaGUgb3B0aW9ucyBpbmNsdWRlIGZvbGxvd2luZyBwcm9wZXJ0aWVzOlxuICAgKiAtIGB3aWR0aGA6IHRoZSB3aWR0aCBvZiB0aGUgdGV4dHVyZS4gUmVxdWlyZWQuXG4gICAqIC0gYGhlaWdodGA6IHRoZSBoZWlnaHQgb2YgdGhlIHRleHR1cmUuIFJlcXVpcmVkLlxuICAgKiAtIGBmb3JtYXRgOiB0aGUgZm9ybWF0IG9mIHRoZSB0ZXh0dXJlLiBJZiBvbWl0dGVkLCBhc3N1bWUgJ1JHQkEnLlxuICAgKiAtIGBkb3dubG9hZGA6IGFuIG9wdGlvbmFsIGZ1bmN0aW9uIHRvIGRvd25sb2FkIHRoZSB0ZW5zb3IgZGF0YSBmcm9tIEdQVSB0byBDUFUuIElmIG9taXR0ZWQsIHRoZSBHUFUgZGF0YVxuICAgKiB3aWxsIG5vdCBiZSBhYmxlIHRvIGRvd25sb2FkLiBVc3VhbGx5LCB0aGlzIGlzIHByb3ZpZGVkIGJ5IGEgR1BVIGJhY2tlbmQgZm9yIHRoZSBpbmZlcmVuY2Ugb3V0cHV0cy4gVXNlcnMgZG9uJ3RcbiAgICogbmVlZCB0byBwcm92aWRlIHRoaXMgZnVuY3Rpb24uXG4gICAqIC0gYGRpc3Bvc2VgOiBhbiBvcHRpb25hbCBmdW5jdGlvbiB0byBkaXNwb3NlIHRoZSB0ZW5zb3IgZGF0YSBvbiBHUFUuIElmIG9taXR0ZWQsIHRoZSBHUFUgZGF0YSB3aWxsIG5vdCBiZSBkaXNwb3NlZC5cbiAgICogVXN1YWxseSwgdGhpcyBpcyBwcm92aWRlZCBieSBhIEdQVSBiYWNrZW5kIGZvciB0aGUgaW5mZXJlbmNlIG91dHB1dHMuIFVzZXJzIGRvbid0IG5lZWQgdG8gcHJvdmlkZSB0aGlzIGZ1bmN0aW9uLlxuICAgKlxuICAgKiBAcmV0dXJucyBhIHRlbnNvciBvYmplY3RcbiAgICovXG4gIGZyb21UZXh0dXJlPFQgZXh0ZW5kcyBUZW5zb3IuVGV4dHVyZURhdGFUeXBlcyA9ICdmbG9hdDMyJz4oXG4gICAgdGV4dHVyZTogVGVuc29yLlRleHR1cmVUeXBlLFxuICAgIG9wdGlvbnM6IFRlbnNvckZyb21UZXh0dXJlT3B0aW9uczxUPixcbiAgKTogVHlwZWRUZW5zb3I8J2Zsb2F0MzInPjtcblxuICAvKipcbiAgICogY3JlYXRlIGEgdGVuc29yIGZyb20gYSBXZWJHUFUgYnVmZmVyXG4gICAqXG4gICAqIEBwYXJhbSBidWZmZXIgLSB0aGUgR1BVQnVmZmVyIG9iamVjdCB0byBjcmVhdGUgdGVuc29yIGZyb21cbiAgICogQHBhcmFtIG9wdGlvbnMgLSBBbiBvcHRpb25hbCBvYmplY3QgcmVwcmVzZW50aW5nIG9wdGlvbnMgZm9yIGNyZWF0aW5nIHRlbnNvciBmcm9tIFdlYkdQVSBidWZmZXIuXG4gICAqXG4gICAqIFRoZSBvcHRpb25zIGluY2x1ZGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gICAqIC0gYGRhdGFUeXBlYDogdGhlIGRhdGEgdHlwZSBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhc3N1bWUgJ2Zsb2F0MzInLlxuICAgKiAtIGBkaW1zYDogdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBSZXF1aXJlZC5cbiAgICogLSBgZG93bmxvYWRgOiBhbiBvcHRpb25hbCBmdW5jdGlvbiB0byBkb3dubG9hZCB0aGUgdGVuc29yIGRhdGEgZnJvbSBHUFUgdG8gQ1BVLiBJZiBvbWl0dGVkLCB0aGUgR1BVIGRhdGFcbiAgICogd2lsbCBub3QgYmUgYWJsZSB0byBkb3dubG9hZC4gVXN1YWxseSwgdGhpcyBpcyBwcm92aWRlZCBieSBhIEdQVSBiYWNrZW5kIGZvciB0aGUgaW5mZXJlbmNlIG91dHB1dHMuIFVzZXJzIGRvbid0XG4gICAqIG5lZWQgdG8gcHJvdmlkZSB0aGlzIGZ1bmN0aW9uLlxuICAgKiAtIGBkaXNwb3NlYDogYW4gb3B0aW9uYWwgZnVuY3Rpb24gdG8gZGlzcG9zZSB0aGUgdGVuc29yIGRhdGEgb24gR1BVLiBJZiBvbWl0dGVkLCB0aGUgR1BVIGRhdGEgd2lsbCBub3QgYmUgZGlzcG9zZWQuXG4gICAqIFVzdWFsbHksIHRoaXMgaXMgcHJvdmlkZWQgYnkgYSBHUFUgYmFja2VuZCBmb3IgdGhlIGluZmVyZW5jZSBvdXRwdXRzLiBVc2VycyBkb24ndCBuZWVkIHRvIHByb3ZpZGUgdGhpcyBmdW5jdGlvbi5cbiAgICpcbiAgICogQHJldHVybnMgYSB0ZW5zb3Igb2JqZWN0XG4gICAqL1xuICBmcm9tR3B1QnVmZmVyPFQgZXh0ZW5kcyBUZW5zb3IuR3B1QnVmZmVyRGF0YVR5cGVzPihcbiAgICBidWZmZXI6IFRlbnNvci5HcHVCdWZmZXJUeXBlLFxuICAgIG9wdGlvbnM6IFRlbnNvckZyb21HcHVCdWZmZXJPcHRpb25zPFQ+LFxuICApOiBUeXBlZFRlbnNvcjxUPjtcblxuICAvKipcbiAgICogY3JlYXRlIGEgdGVuc29yIGZyb20gYSBXZWJOTiBNTFRlbnNvclxuICAgKlxuICAgKiBAcGFyYW0gdGVuc29yIC0gdGhlIE1MVGVuc29yIG9iamVjdCB0byBjcmVhdGUgdGVuc29yIGZyb21cbiAgICogQHBhcmFtIG9wdGlvbnMgLSBBbiBvcHRpb25hbCBvYmplY3QgcmVwcmVzZW50aW5nIG9wdGlvbnMgZm9yIGNyZWF0aW5nIHRlbnNvciBmcm9tIGEgV2ViTk4gTUxUZW5zb3IuXG4gICAqXG4gICAqIFRoZSBvcHRpb25zIGluY2x1ZGUgZm9sbG93aW5nIHByb3BlcnRpZXM6XG4gICAqIC0gYGRhdGFUeXBlYDogdGhlIGRhdGEgdHlwZSBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhc3N1bWUgJ2Zsb2F0MzInLlxuICAgKiAtIGBkaW1zYDogdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBSZXF1aXJlZC5cbiAgICogLSBgZG93bmxvYWRgOiBhbiBvcHRpb25hbCBmdW5jdGlvbiB0byBkb3dubG9hZCB0aGUgdGVuc29yIGRhdGEgZnJvbSB0aGUgTUxUZW5zb3IgdG8gQ1BVLiBJZiBvbWl0dGVkLCB0aGUgTUxUZW5zb3JcbiAgICogZGF0YSB3aWxsIG5vdCBiZSBhYmxlIHRvIGRvd25sb2FkLiBVc3VhbGx5LCB0aGlzIGlzIHByb3ZpZGVkIGJ5IHRoZSBXZWJOTiBiYWNrZW5kIGZvciB0aGUgaW5mZXJlbmNlIG91dHB1dHMuXG4gICAqIFVzZXJzIGRvbid0IG5lZWQgdG8gcHJvdmlkZSB0aGlzIGZ1bmN0aW9uLlxuICAgKiAtIGBkaXNwb3NlYDogYW4gb3B0aW9uYWwgZnVuY3Rpb24gdG8gZGlzcG9zZSB0aGUgdGVuc29yIGRhdGEgb24gdGhlIFdlYk5OIE1MVGVuc29yLiBJZiBvbWl0dGVkLCB0aGUgTUxUZW5zb3Igd2lsbFxuICAgKiBub3QgYmUgZGlzcG9zZWQuIFVzdWFsbHksIHRoaXMgaXMgcHJvdmlkZWQgYnkgdGhlIFdlYk5OIGJhY2tlbmQgZm9yIHRoZSBpbmZlcmVuY2Ugb3V0cHV0cy4gVXNlcnMgZG9uJ3QgbmVlZCB0b1xuICAgKiBwcm92aWRlIHRoaXMgZnVuY3Rpb24uXG4gICAqXG4gICAqIEByZXR1cm5zIGEgdGVuc29yIG9iamVjdFxuICAgKi9cbiAgZnJvbU1MVGVuc29yPFQgZXh0ZW5kcyBUZW5zb3IuTUxUZW5zb3JEYXRhVHlwZXM+KFxuICAgIHRlbnNvcjogVGVuc29yLk1MVGVuc29yVHlwZSxcbiAgICBvcHRpb25zOiBUZW5zb3JGcm9tTUxUZW5zb3JPcHRpb25zPFQ+LFxuICApOiBUeXBlZFRlbnNvcjxUPjtcblxuICAvKipcbiAgICogY3JlYXRlIGEgdGVuc29yIGZyb20gYSBwcmUtYWxsb2NhdGVkIGJ1ZmZlci4gVGhlIGJ1ZmZlciB3aWxsIGJlIHVzZWQgYXMgYSBwaW5uZWQgYnVmZmVyLlxuICAgKlxuICAgKiBAcGFyYW0gdHlwZSAtIHRoZSB0ZW5zb3IgZWxlbWVudCB0eXBlLlxuICAgKiBAcGFyYW0gYnVmZmVyIC0gYSBUeXBlZEFycmF5IGNvcnJlc3BvbmRpbmcgdG8gdGhlIHR5cGUuXG4gICAqIEBwYXJhbSBkaW1zIC0gc3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxuICAgKlxuICAgKiBAcmV0dXJucyBhIHRlbnNvciBvYmplY3RcbiAgICovXG4gIGZyb21QaW5uZWRCdWZmZXI8VCBleHRlbmRzIEV4Y2x1ZGU8VGVuc29yLlR5cGUsICdzdHJpbmcnPj4oXG4gICAgdHlwZTogVCxcbiAgICBidWZmZXI6IFRlbnNvci5EYXRhVHlwZU1hcFtUXSxcbiAgICBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10sXG4gICk6IFR5cGVkVGVuc29yPFQ+O1xufVxuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG4vKipcbiAqIEEgc3RyaW5nIHRoYXQgcmVwcmVzZW50cyBhIGZpbGUncyBVUkwgb3IgcGF0aC5cbiAqXG4gKiBQYXRoIGlzIHZhaWxhYmxlIG9ubHkgaW4gb25ueHJ1bnRpbWUtbm9kZSBvciBvbm54cnVudGltZS13ZWIgcnVubmluZyBpbiBOb2RlLmpzLlxuICovXG5leHBvcnQgdHlwZSBGaWxlVXJsT3JQYXRoID0gc3RyaW5nO1xuXG4vKipcbiAqIEEgQmxvYiBvYmplY3QgdGhhdCByZXByZXNlbnRzIGEgZmlsZS5cbiAqL1xuZXhwb3J0IHR5cGUgRmlsZUJsb2IgPSBCbG9iO1xuXG4vKipcbiAqIEEgVWludDhBcnJheSwgQXJyYXlCdWZmZXIgb3IgU2hhcmVkQXJyYXlCdWZmZXIgb2JqZWN0IHRoYXQgcmVwcmVzZW50cyBhIGZpbGUgY29udGVudC5cbiAqXG4gKiBXaGVuIGl0IGlzIGFuIEFycmF5QnVmZmVyIG9yIFNoYXJlZEFycmF5QnVmZmVyLCB0aGUgd2hvbGUgYnVmZmVyIGlzIGFzc3VtZWQgdG8gYmUgdGhlIGZpbGUgY29udGVudC5cbiAqL1xuZXhwb3J0IHR5cGUgRmlsZURhdGEgPSBVaW50OEFycmF5IHwgQXJyYXlCdWZmZXJMaWtlO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYSBmaWxlIHRoYXQgY2FuIGJlIGxvYWRlZCBieSB0aGUgT05OWCBSdW50aW1lIEphdmFTY3JpcHQgQVBJLlxuICovXG5leHBvcnQgdHlwZSBGaWxlVHlwZSA9IEZpbGVVcmxPclBhdGggfCBGaWxlQmxvYiB8IEZpbGVEYXRhO1xuXG4vKipcbiAqIFJlcHJlc2VudHMgYW4gZXh0ZXJuYWwgZGF0YSBmaWxlLlxuICovXG5leHBvcnQgaW50ZXJmYWNlIEV4dGVybmFsRGF0YUZpbGVEZXNjcmlwdGlvbiB7XG4gIC8qKlxuICAgKiBTcGVjaWZ5IHRoZSBleHRlcm5hbCBkYXRhIGZpbGUuXG4gICAqL1xuICBkYXRhOiBGaWxlVHlwZTtcbiAgLyoqXG4gICAqIFNwZWNpZnkgdGhlIGZpbGUgcGF0aC5cbiAgICovXG4gIHBhdGg6IHN0cmluZztcbn1cblxuLyoqXG4gKiBSZXByZXNlbnRzIGFuIGV4dGVybmFsIGRhdGEgZmlsZS5cbiAqXG4gKiBXaGVuIHVzaW5nIGEgc3RyaW5nLCBpdCBzaG91bGQgYmUgYSBmaWxlIFVSTCBvciBwYXRoIHRoYXQgaW4gdGhlIHNhbWUgZGlyZWN0b3J5IGFzIHRoZSBtb2RlbCBmaWxlLlxuICovXG5leHBvcnQgdHlwZSBFeHRlcm5hbERhdGFGaWxlVHlwZSA9IEV4dGVybmFsRGF0YUZpbGVEZXNjcmlwdGlvbiB8IEZpbGVVcmxPclBhdGg7XG5cbi8qKlxuICogT3B0aW9ucyBmb3IgbW9kZWwgbG9hZGluZy5cbiAqL1xuZXhwb3J0IGludGVyZmFjZSBPbm54TW9kZWxPcHRpb25zIHtcbiAgLyoqXG4gICAqIFNwZWNpZnlpbmcgYSBsaXN0IG9mIGZpbGVzIHRoYXQgcmVwcmVzZW50cyB0aGUgZXh0ZXJuYWwgZGF0YS5cbiAgICovXG4gIGV4dGVybmFsRGF0YT86IHJlYWRvbmx5IEV4dGVybmFsRGF0YUZpbGVUeXBlW107XG59XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7IFRlbnNvciB9IGZyb20gJy4vdGVuc29yLmpzJztcblxuZXhwb3J0IHR5cGUgTm9uVGVuc29yVHlwZSA9IG5ldmVyO1xuXG4vKipcbiAqIFR5cGUgT25ueFZhbHVlIFJlcHJlc2VudHMgYm90aCB0ZW5zb3JzIGFuZCBub24tdGVuc29ycyB2YWx1ZSBmb3IgbW9kZWwncyBpbnB1dHMvb3V0cHV0cy5cbiAqXG4gKiBOT1RFOiBjdXJyZW50bHkgbm90IHN1cHBvcnQgbm9uLXRlbnNvclxuICovXG5leHBvcnQgdHlwZSBPbm54VmFsdWUgPSBUZW5zb3IgfCBOb25UZW5zb3JUeXBlO1xuXG4vKipcbiAqIFR5cGUgT25ueFZhbHVlRGF0YUxvY2F0aW9uIHJlcHJlc2VudHMgdGhlIGxvY2F0aW9uIG9mIHRoZSBkYXRhIG9mIGFuIE9ubnhWYWx1ZS5cbiAqL1xuZXhwb3J0IHR5cGUgT25ueFZhbHVlRGF0YUxvY2F0aW9uID0gVGVuc29yLkRhdGFMb2NhdGlvbjtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuLyoqXG4gKiAjIE9OTlggUnVudGltZSBKYXZhU2NyaXB0IEFQSVxuICpcbiAqIE9OTlggUnVudGltZSBKYXZhU2NyaXB0IEFQSSBpcyBhIHVuaWZpZWQgQVBJIGZvciBhbGwgSmF2YVNjcmlwdCB1c2FnZXMsIGluY2x1ZGluZyB0aGUgZm9sbG93aW5nIE5QTSBwYWNrYWdlczpcbiAqXG4gKiAtIFtvbm54cnVudGltZS1ub2RlXShodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9vbm54cnVudGltZS1ub2RlKVxuICogLSBbb25ueHJ1bnRpbWUtd2ViXShodHRwczovL3d3dy5ucG1qcy5jb20vcGFja2FnZS9vbm54cnVudGltZS13ZWIpXG4gKiAtIFtvbm54cnVudGltZS1yZWFjdC1uYXRpdmVdKGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL29ubnhydW50aW1lLXJlYWN0LW5hdGl2ZSlcbiAqXG4gKiBTZWUgYWxzbzpcbiAqIC0gW0dldCBTdGFydGVkXShodHRwczovL29ubnhydW50aW1lLmFpL2RvY3MvZ2V0LXN0YXJ0ZWQvd2l0aC1qYXZhc2NyaXB0LylcbiAqIC0gW0luZmVyZW5jZSBleGFtcGxlc10oaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9vbm54cnVudGltZS1pbmZlcmVuY2UtZXhhbXBsZXMvdHJlZS9tYWluL2pzKVxuICpcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxuICovXG5cbmV4cG9ydCAqIGZyb20gJy4vYmFja2VuZC5qcyc7XG5leHBvcnQgKiBmcm9tICcuL2Vudi5qcyc7XG5leHBvcnQgKiBmcm9tICcuL2luZmVyZW5jZS1zZXNzaW9uLmpzJztcbmV4cG9ydCAqIGZyb20gJy4vdGVuc29yLmpzJztcbmV4cG9ydCAqIGZyb20gJy4vdGVuc29yLWNvbnZlcnNpb24uanMnO1xuZXhwb3J0ICogZnJvbSAnLi90ZW5zb3ItZmFjdG9yeS5qcyc7XG5leHBvcnQgKiBmcm9tICcuL3RyYWNlLmpzJztcbmV4cG9ydCAqIGZyb20gJy4vb25ueC1tb2RlbC5qcyc7XG5leHBvcnQgKiBmcm9tICcuL29ubngtdmFsdWUuanMnO1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5leHBvcnQgY29uc3QgaXNOb2RlID0gISEodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MudmVyc2lvbnMgJiYgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlKTtcbiIsICJ2YXIgcixlPShyPWltcG9ydC5tZXRhLnVybCxhc3luYyBmdW5jdGlvbihlPXt9KXt2YXIgdCxuLGE9ZSxvPW5ldyBQcm9taXNlKCgocixlKT0+e3Q9cixuPWV9KSksaT1cIm9iamVjdFwiPT10eXBlb2Ygd2luZG93LHU9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFdvcmtlckdsb2JhbFNjb3BlLHM9dSYmc2VsZi5uYW1lPy5zdGFydHNXaXRoKFwiZW0tcHRocmVhZFwiKTthLm1vdW50RXh0ZXJuYWxEYXRhPShyLGUpPT57ci5zdGFydHNXaXRoKFwiLi9cIikmJihyPXIuc3Vic3RyaW5nKDIpKSwoYS5GYnx8KGEuRmI9bmV3IE1hcCkpLnNldChyLGUpfSxhLnVubW91bnRFeHRlcm5hbERhdGE9KCk9PntkZWxldGUgYS5GYn07dmFyIGY9Z2xvYmFsVGhpcy5TaGFyZWRBcnJheUJ1ZmZlcj8/bmV3IFdlYkFzc2VtYmx5Lk1lbW9yeSh7aW5pdGlhbDowLG1heGltdW06MCxxYzohMH0pLmJ1ZmZlci5jb25zdHJ1Y3Rvcjtjb25zdCBiPXI9PmFzeW5jKC4uLmUpPT57dHJ5e2lmKGEuR2IpdGhyb3cgRXJyb3IoXCJTZXNzaW9uIGFscmVhZHkgc3RhcnRlZFwiKTtjb25zdCB0PWEuR2I9e2VjOmVbMF0sZXJyb3JzOltdfSxuPWF3YWl0IHIoLi4uZSk7aWYoYS5HYiE9PXQpdGhyb3cgRXJyb3IoXCJTZXNzaW9uIG1pc21hdGNoXCIpO2EuS2I/LmZsdXNoKCk7Y29uc3Qgbz10LmVycm9ycztpZigwPG8ubGVuZ3RoKXtsZXQgcj1hd2FpdCBQcm9taXNlLmFsbChvKTtpZihyPXIuZmlsdGVyKChyPT5yKSksMDxyLmxlbmd0aCl0aHJvdyBFcnJvcihyLmpvaW4oXCJcXG5cIikpfXJldHVybiBufWZpbmFsbHl7YS5HYj1udWxsfX07YS5qc2VwSW5pdD0ocixlKT0+e2lmKFwid2ViZ3B1XCI9PT1yKXtbYS5LYixhLlZiLGEuWmIsYS5MYixhLlliLGEua2IsYS4kYixhLmJjLGEuV2IsYS5YYixhLmFjXT1lO2NvbnN0IHI9YS5LYjthLmpzZXBSZWdpc3RlckJ1ZmZlcj0oZSx0LG4sYSk9PnIucmVnaXN0ZXJCdWZmZXIoZSx0LG4sYSksYS5qc2VwR2V0QnVmZmVyPWU9PnIuZ2V0QnVmZmVyKGUpLGEuanNlcENyZWF0ZURvd25sb2FkZXI9KGUsdCxuKT0+ci5jcmVhdGVEb3dubG9hZGVyKGUsdCxuKSxhLmpzZXBPbkNyZWF0ZVNlc3Npb249ZT0+e3Iub25DcmVhdGVTZXNzaW9uKGUpfSxhLmpzZXBPblJlbGVhc2VTZXNzaW9uPWU9PntyLm9uUmVsZWFzZVNlc3Npb24oZSl9LGEuanNlcE9uUnVuU3RhcnQ9ZT0+ci5vblJ1blN0YXJ0KGUpLGEuY2M9KGUsdCk9PntyLnVwbG9hZChlLHQpfX1lbHNlIGlmKFwid2Vibm5cIj09PXIpe2NvbnN0IHI9ZVswXTtbYS5vYyxhLk9iLGEud2Vibm5FbnN1cmVUZW5zb3IsYS5QYixhLndlYm5uRG93bmxvYWRUZW5zb3JdPWUuc2xpY2UoMSksYS53ZWJublJlbGVhc2VUZW5zb3JJZD1hLk9iLGEud2Vibm5VcGxvYWRUZW5zb3I9YS5QYixhLndlYm5uT25SdW5TdGFydD1lPT5yLm9uUnVuU3RhcnQoZSksYS53ZWJubk9uUnVuRW5kPXIub25SdW5FbmQuYmluZChyKSxhLndlYm5uUmVnaXN0ZXJNTENvbnRleHQ9KGUsdCk9PntyLnJlZ2lzdGVyTUxDb250ZXh0KGUsdCl9LGEud2Vibm5PblJlbGVhc2VTZXNzaW9uPWU9PntyLm9uUmVsZWFzZVNlc3Npb24oZSl9LGEud2Vibm5DcmVhdGVNTFRlbnNvckRvd25sb2FkZXI9KGUsdCk9PnIuY3JlYXRlTUxUZW5zb3JEb3dubG9hZGVyKGUsdCksYS53ZWJublJlZ2lzdGVyTUxUZW5zb3I9KGUsdCxuLGEpPT5yLnJlZ2lzdGVyTUxUZW5zb3IoZSx0LG4sYSksYS53ZWJubkNyZWF0ZU1MQ29udGV4dD1lPT5yLmNyZWF0ZU1MQ29udGV4dChlKSxhLndlYm5uUmVnaXN0ZXJNTENvbnN0YW50PShlLHQsbixvLGksdSk9PnIucmVnaXN0ZXJNTENvbnN0YW50KGUsdCxuLG8saSxhLkZiLHUpLGEud2Vibm5SZWdpc3RlckdyYXBoSW5wdXQ9ci5yZWdpc3RlckdyYXBoSW5wdXQuYmluZChyKSxhLndlYm5uSXNHcmFwaElucHV0PXIuaXNHcmFwaElucHV0LmJpbmQociksYS53ZWJublJlZ2lzdGVyR3JhcGhPdXRwdXQ9ci5yZWdpc3RlckdyYXBoT3V0cHV0LmJpbmQociksYS53ZWJubklzR3JhcGhPdXRwdXQ9ci5pc0dyYXBoT3V0cHV0LmJpbmQociksYS53ZWJubkNyZWF0ZVRlbXBvcmFyeVRlbnNvcj1yLmNyZWF0ZVRlbXBvcmFyeVRlbnNvci5iaW5kKHIpLGEud2Vibm5Jc0dyYXBoSW5wdXRPdXRwdXRUeXBlU3VwcG9ydGVkPXIuaXNHcmFwaElucHV0T3V0cHV0VHlwZVN1cHBvcnRlZC5iaW5kKHIpfX07bGV0IG09KCk9Pntjb25zdCByPShyLGUsdCk9PiguLi5uKT0+e2NvbnN0IGE9TGUsbz1lPy4oKTtuPXIoLi4ubik7Y29uc3QgaT1lPy4oKTtyZXR1cm4gbyE9PWkmJihyPWksdChvKSxlPXQ9bnVsbCksTGUhPWE/bmV3IFByb21pc2UoKChyLGUpPT57cWU9e3Jlc29sdmU6cixyZWplY3Q6ZX19KSk6bn07KCgpPT57Zm9yKGNvbnN0IGUgb2ZbXCJfT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXJcIixcIl9PcnRDcmVhdGVTZXNzaW9uXCIsXCJfT3J0UnVuXCIsXCJfT3J0UnVuV2l0aEJpbmRpbmdcIixcIl9PcnRCaW5kSW5wdXRcIl0pYVtlXT1yKGFbZV0sKCgpPT5hW2VdKSwocj0+YVtlXT1yKSl9KSgpLHZvaWQgMCE9PWImJihhLl9PcnRSdW49YihhLl9PcnRSdW4pLGEuX09ydFJ1bldpdGhCaW5kaW5nPWIoYS5fT3J0UnVuV2l0aEJpbmRpbmcpKSxtPXZvaWQgMH07YS5hc3luY0luaXQ9KCk9PnttPy4oKX07dmFyIGwsYyxkPU9iamVjdC5hc3NpZ24oe30sYSkscD0ocixlKT0+e3Rocm93IGV9LHk9XCJcIjsoaXx8dSkmJih1P3k9c2VsZi5sb2NhdGlvbi5ocmVmOlwidW5kZWZpbmVkXCIhPXR5cGVvZiBkb2N1bWVudCYmZG9jdW1lbnQuY3VycmVudFNjcmlwdCYmKHk9ZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmMpLHImJih5PXIpLHk9eS5zdGFydHNXaXRoKFwiYmxvYjpcIik/XCJcIjp5LnNsaWNlKDAseS5yZXBsYWNlKC9bPyNdLiovLFwiXCIpLmxhc3RJbmRleE9mKFwiL1wiKSsxKSx1JiYoYz1yPT57dmFyIGU9bmV3IFhNTEh0dHBSZXF1ZXN0O3JldHVybiBlLm9wZW4oXCJHRVRcIixyLCExKSxlLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCIsZS5zZW5kKG51bGwpLG5ldyBVaW50OEFycmF5KGUucmVzcG9uc2UpfSksbD1hc3luYyByPT57aWYoUChyKSlyZXR1cm4gbmV3IFByb21pc2UoKChlLHQpPT57dmFyIG49bmV3IFhNTEh0dHBSZXF1ZXN0O24ub3BlbihcIkdFVFwiLHIsITApLG4ucmVzcG9uc2VUeXBlPVwiYXJyYXlidWZmZXJcIixuLm9ubG9hZD0oKT0+ezIwMD09bi5zdGF0dXN8fDA9PW4uc3RhdHVzJiZuLnJlc3BvbnNlP2Uobi5yZXNwb25zZSk6dChuLnN0YXR1cyl9LG4ub25lcnJvcj10LG4uc2VuZChudWxsKX0pKTt2YXIgZT1hd2FpdCBmZXRjaChyLHtjcmVkZW50aWFsczpcInNhbWUtb3JpZ2luXCJ9KTtpZihlLm9rKXJldHVybiBlLmFycmF5QnVmZmVyKCk7dGhyb3cgRXJyb3IoZS5zdGF0dXMrXCIgOiBcIitlLnVybCl9KTt2YXIgaD1jb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpLHY9Y29uc29sZS5lcnJvci5iaW5kKGNvbnNvbGUpLGc9aCxOPXY7T2JqZWN0LmFzc2lnbihhLGQpLGQ9bnVsbDt2YXIgayx3LEEsQyxfLE8sVCxXLFMsRSx4LFIsTSxIPWEud2FzbUJpbmFyeSxEPSExLFA9cj0+ci5zdGFydHNXaXRoKFwiZmlsZTovL1wiKTtmdW5jdGlvbiBGKCl7cmV0dXJuIGsuYnVmZmVyIT1DLmJ1ZmZlciYmcSgpLEN9ZnVuY3Rpb24gQigpe3JldHVybiBrLmJ1ZmZlciE9Qy5idWZmZXImJnEoKSxffWZ1bmN0aW9uIEkoKXtyZXR1cm4gay5idWZmZXIhPUMuYnVmZmVyJiZxKCksT31mdW5jdGlvbiBHKCl7cmV0dXJuIGsuYnVmZmVyIT1DLmJ1ZmZlciYmcSgpLFR9ZnVuY3Rpb24gTCgpe3JldHVybiBrLmJ1ZmZlciE9Qy5idWZmZXImJnEoKSxXfWZ1bmN0aW9uIFUoKXtyZXR1cm4gay5idWZmZXIhPUMuYnVmZmVyJiZxKCksU31mdW5jdGlvbiAkKCl7cmV0dXJuIGsuYnVmZmVyIT1DLmJ1ZmZlciYmcSgpLEV9ZnVuY3Rpb24gaigpe3JldHVybiBrLmJ1ZmZlciE9Qy5idWZmZXImJnEoKSxNfWlmKHMpe3ZhciB6LFY9ITE7ZnVuY3Rpb24gUm4ocil7dHJ5e3ZhciBlPXIuZGF0YSx0PWUuQ2I7aWYoXCJsb2FkXCI9PT10KXtsZXQgcj1bXTtzZWxmLm9ubWVzc2FnZT1lPT5yLnB1c2goZSksc2VsZi5zdGFydFdvcmtlcj0oKT0+e3Bvc3RNZXNzYWdlKHtDYjpcImxvYWRlZFwifSk7Zm9yKGxldCBlIG9mIHIpUm4oZSk7c2VsZi5vbm1lc3NhZ2U9Um59O2Zvcihjb25zdCByIG9mIGUuU2IpYVtyXSYmIWFbcl0ucHJveHl8fChhW3JdPSguLi5lKT0+e3Bvc3RNZXNzYWdlKHtDYjpcImNhbGxIYW5kbGVyXCIsUmI6cixhcmdzOmV9KX0sXCJwcmludFwiPT1yJiYoZz1hW3JdKSxcInByaW50RXJyXCI9PXImJihOPWFbcl0pKTtrPWUubGMscSgpLHooZS5tYyl9ZWxzZSBpZihcInJ1blwiPT09dCl7a3IoZS5CYikseW4oZS5CYiwwLDAsMSwwLDApLHZyKCksVGUoZS5CYiksVnx8KGxuKCksVj0hMCk7dHJ5e3dyKGUuaGMsZS5JYil9Y2F0Y2gocil7aWYoXCJ1bndpbmRcIiE9cil0aHJvdyByfX1lbHNlXCJzZXRpbW1lZGlhdGVcIiE9PWUudGFyZ2V0JiYoXCJjaGVja01haWxib3hcIj09PXQ/ViYmV2UoKTp0JiYoTihgd29ya2VyOiByZWNlaXZlZCB1bmtub3duIGNvbW1hbmQgJHt0fWApLE4oZSkpKX1jYXRjaChyKXt0aHJvdyBobigpLHJ9fU49ZnVuY3Rpb24oLi4ucil7cj1yLmpvaW4oXCIgXCIpLGNvbnNvbGUuZXJyb3Iocil9LHNlbGYuYWxlcnQ9ZnVuY3Rpb24oLi4ucil7cG9zdE1lc3NhZ2Uoe0NiOlwiYWxlcnRcIix0ZXh0OnIuam9pbihcIiBcIiksamM6Y24oKX0pfSxzZWxmLm9udW5oYW5kbGVkcmVqZWN0aW9uPXI9Pnt0aHJvdyByLnJlYXNvbnx8cn0sc2VsZi5vbm1lc3NhZ2U9Um59ZnVuY3Rpb24gcSgpe3ZhciByPWsuYnVmZmVyO2EuSEVBUDg9Qz1uZXcgSW50OEFycmF5KHIpLGEuSEVBUDE2PU89bmV3IEludDE2QXJyYXkociksYS5IRUFQVTg9Xz1uZXcgVWludDhBcnJheShyKSxhLkhFQVBVMTY9VD1uZXcgVWludDE2QXJyYXkociksYS5IRUFQMzI9Vz1uZXcgSW50MzJBcnJheShyKSxhLkhFQVBVMzI9Uz1uZXcgVWludDMyQXJyYXkociksYS5IRUFQRjMyPUU9bmV3IEZsb2F0MzJBcnJheShyKSxhLkhFQVBGNjQ9TT1uZXcgRmxvYXQ2NEFycmF5KHIpLGEuSEVBUDY0PXg9bmV3IEJpZ0ludDY0QXJyYXkociksYS5IRUFQVTY0PVI9bmV3IEJpZ1VpbnQ2NEFycmF5KHIpfWZ1bmN0aW9uIFkoKXtzP3N0YXJ0V29ya2VyKGEpOmZuLkRhKCl9c3x8KGs9bmV3IFdlYkFzc2VtYmx5Lk1lbW9yeSh7aW5pdGlhbDoyNTYsbWF4aW11bTo2NTUzNixzaGFyZWQ6ITB9KSxxKCkpO3ZhciBKLFE9MCxYPW51bGw7ZnVuY3Rpb24gSygpe2lmKDA9PS0tUSYmWCl7dmFyIHI9WDtYPW51bGwscigpfX1mdW5jdGlvbiBaKHIpe3Rocm93IE4ocj1cIkFib3J0ZWQoXCIrcitcIilcIiksRD0hMCxyPW5ldyBXZWJBc3NlbWJseS5SdW50aW1lRXJyb3IocitcIi4gQnVpbGQgd2l0aCAtc0FTU0VSVElPTlMgZm9yIG1vcmUgaW5mby5cIiksbihyKSxyfWZ1bmN0aW9uIHJyKCl7cmV0dXJue2E6e0w6bnIsQWE6dHIsYjpDciwkOk9yLEE6RXIscGE6eHIsWDpIcixaOkRyLHFhOlByLG5hOkZyLGdhOkJyLG1hOklyLEo6R3IsWTpMcixWOlVyLG9hOiRyLFc6anIsdmE6cXIsRTpyZSxROnRlLE86YmUsRDpsZSx2OmNlLHI6ZGUsUDpwZSx6OkFlLFI6Q2UsamE6X2UsVDpTZSxhYTp4ZSxNOlJlLEY6TWUsaWE6VGUsc2E6SGUsdDpGZSxDYTpCZSx3OlFlLG86S2UsbTpldCxjOm9lLEJhOnR0LG46YXQsajpzdCx1OmZ0LHA6YnQsZjptdCxzOmx0LGw6Y3QsZTpkdCxrOnB0LGg6eXQsZzpodCxkOnZ0LGRhOmd0LGVhOkF0LGZhOkN0LGJhOl90LGNhOk90LE46U3QseGE6RXQsdWE6TXQsaTpQdCxDOkZ0LEc6QnQsdGE6eHQseDpJdCxyYTpHdCxVOkx0LHE6V3QseTpVdCxLOiR0LFM6anQsemE6WXQseWE6SnQsa2E6WnQsbGE6cm4sXzpscixCOmVuLEk6dG4saGE6bm4sSDpvbixhOmssd2E6YnJ9fX12YXIgZXI9ezg0MDE1NjoocixlLHQsbixvKT0+e2lmKHZvaWQgMD09PWF8fCFhLkZiKXJldHVybiAxO2lmKChyPVNyKE51bWJlcihyPj4+MCkpKS5zdGFydHNXaXRoKFwiLi9cIikmJihyPXIuc3Vic3RyaW5nKDIpKSwhKHI9YS5GYi5nZXQocikpKXJldHVybiAyO2lmKGU9TnVtYmVyKGU+Pj4wKSx0PU51bWJlcih0Pj4+MCksbj1OdW1iZXIobj4+PjApLGUrdD5yLmJ5dGVMZW5ndGgpcmV0dXJuIDM7dHJ5e2NvbnN0IGk9ci5zdWJhcnJheShlLGUrdCk7c3dpdGNoKG8pe2Nhc2UgMDpCKCkuc2V0KGksbj4+PjApO2JyZWFrO2Nhc2UgMTphLm5jP2EubmMobixpKTphLmNjKG4saSk7YnJlYWs7ZGVmYXVsdDpyZXR1cm4gNH1yZXR1cm4gMH1jYXRjaHtyZXR1cm4gNH19LDg0MDk4MDoocixlLHQpPT57YS5QYihyLEIoKS5zdWJhcnJheShlPj4+MCxlK3Q+Pj4wKSl9LDg0MTA0NDooKT0+YS5vYygpLDg0MTA4NjpyPT57YS5PYihyKX0sODQxMTIzOigpPT57YS5XYigpfSw4NDExNTQ6KCk9PnthLlhiKCl9LDg0MTE4MzooKT0+e2EuYWMoKX0sODQxMjA4OnI9PmEuVmIociksODQxMjQxOnI9PmEuWmIociksODQxMjczOihyLGUsdCk9PnthLkxiKE51bWJlcihyKSxOdW1iZXIoZSksTnVtYmVyKHQpLCEwKX0sODQxMzM2OihyLGUsdCk9PnthLkxiKE51bWJlcihyKSxOdW1iZXIoZSksTnVtYmVyKHQpKX0sODQxMzkzOigpPT5cInVuZGVmaW5lZFwiIT10eXBlb2Ygd2FzbU9mZnNldENvbnZlcnRlciw4NDE0NTA6cj0+e2Eua2IoXCJBYnNcIixyLHZvaWQgMCl9LDg0MTUwMTpyPT57YS5rYihcIk5lZ1wiLHIsdm9pZCAwKX0sODQxNTUyOnI9PnthLmtiKFwiRmxvb3JcIixyLHZvaWQgMCl9LDg0MTYwNTpyPT57YS5rYihcIkNlaWxcIixyLHZvaWQgMCl9LDg0MTY1NzpyPT57YS5rYihcIlJlY2lwcm9jYWxcIixyLHZvaWQgMCl9LDg0MTcxNTpyPT57YS5rYihcIlNxcnRcIixyLHZvaWQgMCl9LDg0MTc2NzpyPT57YS5rYihcIkV4cFwiLHIsdm9pZCAwKX0sODQxODE4OnI9PnthLmtiKFwiRXJmXCIscix2b2lkIDApfSw4NDE4Njk6cj0+e2Eua2IoXCJTaWdtb2lkXCIscix2b2lkIDApfSw4NDE5MjQ6KHIsZSx0KT0+e2Eua2IoXCJIYXJkU2lnbW9pZFwiLHIse2FscGhhOmUsYmV0YTp0fSl9LDg0MjAwMzpyPT57YS5rYihcIkxvZ1wiLHIsdm9pZCAwKX0sODQyMDU0OnI9PnthLmtiKFwiU2luXCIscix2b2lkIDApfSw4NDIxMDU6cj0+e2Eua2IoXCJDb3NcIixyLHZvaWQgMCl9LDg0MjE1NjpyPT57YS5rYihcIlRhblwiLHIsdm9pZCAwKX0sODQyMjA3OnI9PnthLmtiKFwiQXNpblwiLHIsdm9pZCAwKX0sODQyMjU5OnI9PnthLmtiKFwiQWNvc1wiLHIsdm9pZCAwKX0sODQyMzExOnI9PnthLmtiKFwiQXRhblwiLHIsdm9pZCAwKX0sODQyMzYzOnI9PnthLmtiKFwiU2luaFwiLHIsdm9pZCAwKX0sODQyNDE1OnI9PnthLmtiKFwiQ29zaFwiLHIsdm9pZCAwKX0sODQyNDY3OnI9PnthLmtiKFwiQXNpbmhcIixyLHZvaWQgMCl9LDg0MjUyMDpyPT57YS5rYihcIkFjb3NoXCIscix2b2lkIDApfSw4NDI1NzM6cj0+e2Eua2IoXCJBdGFuaFwiLHIsdm9pZCAwKX0sODQyNjI2OnI9PnthLmtiKFwiVGFuaFwiLHIsdm9pZCAwKX0sODQyNjc4OnI9PnthLmtiKFwiTm90XCIscix2b2lkIDApfSw4NDI3Mjk6KHIsZSx0KT0+e2Eua2IoXCJDbGlwXCIscix7bWluOmUsbWF4OnR9KX0sODQyNzk4OnI9PnthLmtiKFwiQ2xpcFwiLHIsdm9pZCAwKX0sODQyODUwOihyLGUpPT57YS5rYihcIkVsdVwiLHIse2FscGhhOmV9KX0sODQyOTA4OnI9PnthLmtiKFwiR2VsdVwiLHIsdm9pZCAwKX0sODQyOTYwOnI9PnthLmtiKFwiUmVsdVwiLHIsdm9pZCAwKX0sODQzMDEyOihyLGUpPT57YS5rYihcIkxlYWt5UmVsdVwiLHIse2FscGhhOmV9KX0sODQzMDc2OihyLGUpPT57YS5rYihcIlRocmVzaG9sZGVkUmVsdVwiLHIse2FscGhhOmV9KX0sODQzMTQ2OihyLGUpPT57YS5rYihcIkNhc3RcIixyLHt0bzplfSl9LDg0MzIwNDpyPT57YS5rYihcIkFkZFwiLHIsdm9pZCAwKX0sODQzMjU1OnI9PnthLmtiKFwiU3ViXCIscix2b2lkIDApfSw4NDMzMDY6cj0+e2Eua2IoXCJNdWxcIixyLHZvaWQgMCl9LDg0MzM1NzpyPT57YS5rYihcIkRpdlwiLHIsdm9pZCAwKX0sODQzNDA4OnI9PnthLmtiKFwiUG93XCIscix2b2lkIDApfSw4NDM0NTk6cj0+e2Eua2IoXCJFcXVhbFwiLHIsdm9pZCAwKX0sODQzNTEyOnI9PnthLmtiKFwiR3JlYXRlclwiLHIsdm9pZCAwKX0sODQzNTY3OnI9PnthLmtiKFwiR3JlYXRlck9yRXF1YWxcIixyLHZvaWQgMCl9LDg0MzYyOTpyPT57YS5rYihcIkxlc3NcIixyLHZvaWQgMCl9LDg0MzY4MTpyPT57YS5rYihcIkxlc3NPckVxdWFsXCIscix2b2lkIDApfSw4NDM3NDA6KHIsZSx0LG4sbyk9PnthLmtiKFwiUmVkdWNlTWVhblwiLHIse2tlZXBEaW1zOiEhZSxub29wV2l0aEVtcHR5QXhlczohIXQsYXhlczpuP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihuKT4+PjAsTnVtYmVyKG8pPj4+MCkpOltdfSl9LDg0MzkxNToocixlLHQsbixvKT0+e2Eua2IoXCJSZWR1Y2VNYXhcIixyLHtrZWVwRGltczohIWUsbm9vcFdpdGhFbXB0eUF4ZXM6ISF0LGF4ZXM6bj9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIobik+Pj4wLE51bWJlcihvKT4+PjApKTpbXX0pfSw4NDQwODk6KHIsZSx0LG4sbyk9PnthLmtiKFwiUmVkdWNlTWluXCIscix7a2VlcERpbXM6ISFlLG5vb3BXaXRoRW1wdHlBeGVzOiEhdCxheGVzOm4/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKG4pPj4+MCxOdW1iZXIobyk+Pj4wKSk6W119KX0sODQ0MjYzOihyLGUsdCxuLG8pPT57YS5rYihcIlJlZHVjZVByb2RcIixyLHtrZWVwRGltczohIWUsbm9vcFdpdGhFbXB0eUF4ZXM6ISF0LGF4ZXM6bj9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIobik+Pj4wLE51bWJlcihvKT4+PjApKTpbXX0pfSw4NDQ0Mzg6KHIsZSx0LG4sbyk9PnthLmtiKFwiUmVkdWNlU3VtXCIscix7a2VlcERpbXM6ISFlLG5vb3BXaXRoRW1wdHlBeGVzOiEhdCxheGVzOm4/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKG4pPj4+MCxOdW1iZXIobyk+Pj4wKSk6W119KX0sODQ0NjEyOihyLGUsdCxuLG8pPT57YS5rYihcIlJlZHVjZUwxXCIscix7a2VlcERpbXM6ISFlLG5vb3BXaXRoRW1wdHlBeGVzOiEhdCxheGVzOm4/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKG4pPj4+MCxOdW1iZXIobyk+Pj4wKSk6W119KX0sODQ0Nzg1OihyLGUsdCxuLG8pPT57YS5rYihcIlJlZHVjZUwyXCIscix7a2VlcERpbXM6ISFlLG5vb3BXaXRoRW1wdHlBeGVzOiEhdCxheGVzOm4/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKG4pPj4+MCxOdW1iZXIobyk+Pj4wKSk6W119KX0sODQ0OTU4OihyLGUsdCxuLG8pPT57YS5rYihcIlJlZHVjZUxvZ1N1bVwiLHIse2tlZXBEaW1zOiEhZSxub29wV2l0aEVtcHR5QXhlczohIXQsYXhlczpuP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihuKT4+PjAsTnVtYmVyKG8pPj4+MCkpOltdfSl9LDg0NTEzNToocixlLHQsbixvKT0+e2Eua2IoXCJSZWR1Y2VTdW1TcXVhcmVcIixyLHtrZWVwRGltczohIWUsbm9vcFdpdGhFbXB0eUF4ZXM6ISF0LGF4ZXM6bj9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIobik+Pj4wLE51bWJlcihvKT4+PjApKTpbXX0pfSw4NDUzMTU6KHIsZSx0LG4sbyk9PnthLmtiKFwiUmVkdWNlTG9nU3VtRXhwXCIscix7a2VlcERpbXM6ISFlLG5vb3BXaXRoRW1wdHlBeGVzOiEhdCxheGVzOm4/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKG4pPj4+MCxOdW1iZXIobyk+Pj4wKSk6W119KX0sODQ1NDk1OnI9PnthLmtiKFwiV2hlcmVcIixyLHZvaWQgMCl9LDg0NTU0ODoocixlLHQpPT57YS5rYihcIlRyYW5zcG9zZVwiLHIse3Blcm06ZT9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIoZSk+Pj4wLE51bWJlcih0KT4+PjApKTpbXX0pfSw4NDU2NzI6KHIsZSx0LG4pPT57YS5rYihcIkRlcHRoVG9TcGFjZVwiLHIse2Jsb2Nrc2l6ZTplLG1vZGU6U3IodCksZm9ybWF0Om4/XCJOSFdDXCI6XCJOQ0hXXCJ9KX0sODQ1ODA1OihyLGUsdCxuKT0+e2Eua2IoXCJEZXB0aFRvU3BhY2VcIixyLHtibG9ja3NpemU6ZSxtb2RlOlNyKHQpLGZvcm1hdDpuP1wiTkhXQ1wiOlwiTkNIV1wifSl9LDg0NTkzODoocixlLHQsbixvLGksdSxzLGYsYixtLGwsYyxkLHApPT57YS5rYihcIkNvbnZUcmFuc3Bvc2VcIixyLHtmb3JtYXQ6Zj9cIk5IV0NcIjpcIk5DSFdcIixhdXRvUGFkOmUsZGlsYXRpb25zOlt0XSxncm91cDpuLGtlcm5lbFNoYXBlOltvXSxwYWRzOltpLHVdLHN0cmlkZXM6W3NdLHdJc0NvbnN0OigpPT4hIUYoKVtiPj4+MF0sb3V0cHV0UGFkZGluZzptP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihtKT4+PjAsTnVtYmVyKGwpPj4+MCkpOltdLG91dHB1dFNoYXBlOmM/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKGMpPj4+MCxOdW1iZXIoZCk+Pj4wKSk6W10sYWN0aXZhdGlvbjpTcihwKX0pfSw4NDYzNzE6KHIsZSx0LG4sbyxpLHUscyxmLGIsbSxsLGMsZCk9PnthLmtiKFwiQ29udlRyYW5zcG9zZVwiLHIse2Zvcm1hdDpzP1wiTkhXQ1wiOlwiTkNIV1wiLGF1dG9QYWQ6ZSxkaWxhdGlvbnM6QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKHQpPj4+MCwyKyhOdW1iZXIodCk+Pj4wKT4+PjApKSxncm91cDpuLGtlcm5lbFNoYXBlOkFycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihvKT4+PjAsMisoTnVtYmVyKG8pPj4+MCk+Pj4wKSkscGFkczpBcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIoaSk+Pj4wLDQrKE51bWJlcihpKT4+PjApPj4+MCkpLHN0cmlkZXM6QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKHUpPj4+MCwyKyhOdW1iZXIodSk+Pj4wKT4+PjApKSx3SXNDb25zdDooKT0+ISFGKClbZj4+PjBdLG91dHB1dFBhZGRpbmc6Yj9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIoYik+Pj4wLE51bWJlcihtKT4+PjApKTpbXSxvdXRwdXRTaGFwZTpsP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihsKT4+PjAsTnVtYmVyKGMpPj4+MCkpOltdLGFjdGl2YXRpb246U3IoZCl9KX0sODQ3MDMyOihyLGUsdCxuLG8saSx1LHMsZixiLG0sbCxjLGQscCk9PnthLmtiKFwiQ29udlRyYW5zcG9zZVwiLHIse2Zvcm1hdDpmP1wiTkhXQ1wiOlwiTkNIV1wiLGF1dG9QYWQ6ZSxkaWxhdGlvbnM6W3RdLGdyb3VwOm4sa2VybmVsU2hhcGU6W29dLHBhZHM6W2ksdV0sc3RyaWRlczpbc10sd0lzQ29uc3Q6KCk9PiEhRigpW2I+Pj4wXSxvdXRwdXRQYWRkaW5nOm0/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKG0pPj4+MCxOdW1iZXIobCk+Pj4wKSk6W10sb3V0cHV0U2hhcGU6Yz9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIoYyk+Pj4wLE51bWJlcihkKT4+PjApKTpbXSxhY3RpdmF0aW9uOlNyKHApfSl9LDg0NzQ2NToocixlLHQsbixvLGksdSxzLGYsYixtLGwsYyxkKT0+e2Eua2IoXCJDb252VHJhbnNwb3NlXCIscix7Zm9ybWF0OnM/XCJOSFdDXCI6XCJOQ0hXXCIsYXV0b1BhZDplLGRpbGF0aW9uczpBcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIodCk+Pj4wLDIrKE51bWJlcih0KT4+PjApPj4+MCkpLGdyb3VwOm4sa2VybmVsU2hhcGU6QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKG8pPj4+MCwyKyhOdW1iZXIobyk+Pj4wKT4+PjApKSxwYWRzOkFycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihpKT4+PjAsNCsoTnVtYmVyKGkpPj4+MCk+Pj4wKSksc3RyaWRlczpBcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIodSk+Pj4wLDIrKE51bWJlcih1KT4+PjApPj4+MCkpLHdJc0NvbnN0OigpPT4hIUYoKVtmPj4+MF0sb3V0cHV0UGFkZGluZzpiP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihiKT4+PjAsTnVtYmVyKG0pPj4+MCkpOltdLG91dHB1dFNoYXBlOmw/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKGwpPj4+MCxOdW1iZXIoYyk+Pj4wKSk6W10sYWN0aXZhdGlvbjpTcihkKX0pfSw4NDgxMjY6KHIsZSk9PnthLmtiKFwiR2xvYmFsQXZlcmFnZVBvb2xcIixyLHtmb3JtYXQ6ZT9cIk5IV0NcIjpcIk5DSFdcIn0pfSw4NDgyMTc6KHIsZSx0LG4sbyxpLHUscyxmLGIsbSxsLGMsZCk9PnthLmtiKFwiQXZlcmFnZVBvb2xcIixyLHtmb3JtYXQ6ZD9cIk5IV0NcIjpcIk5DSFdcIixhdXRvX3BhZDplLGNlaWxfbW9kZTp0LGNvdW50X2luY2x1ZGVfcGFkOm4sc3RvcmFnZV9vcmRlcjpvLGRpbGF0aW9uczppP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihpKT4+PjAsTnVtYmVyKHUpPj4+MCkpOltdLGtlcm5lbF9zaGFwZTpzP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihzKT4+PjAsTnVtYmVyKGYpPj4+MCkpOltdLHBhZHM6Yj9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIoYik+Pj4wLE51bWJlcihtKT4+PjApKTpbXSxzdHJpZGVzOmw/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKGwpPj4+MCxOdW1iZXIoYyk+Pj4wKSk6W119KX0sODQ4Njk2OihyLGUpPT57YS5rYihcIkdsb2JhbEF2ZXJhZ2VQb29sXCIscix7Zm9ybWF0OmU/XCJOSFdDXCI6XCJOQ0hXXCJ9KX0sODQ4Nzg3OihyLGUsdCxuLG8saSx1LHMsZixiLG0sbCxjLGQpPT57YS5rYihcIkF2ZXJhZ2VQb29sXCIscix7Zm9ybWF0OmQ/XCJOSFdDXCI6XCJOQ0hXXCIsYXV0b19wYWQ6ZSxjZWlsX21vZGU6dCxjb3VudF9pbmNsdWRlX3BhZDpuLHN0b3JhZ2Vfb3JkZXI6byxkaWxhdGlvbnM6aT9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIoaSk+Pj4wLE51bWJlcih1KT4+PjApKTpbXSxrZXJuZWxfc2hhcGU6cz9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIocyk+Pj4wLE51bWJlcihmKT4+PjApKTpbXSxwYWRzOmI/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKGIpPj4+MCxOdW1iZXIobSk+Pj4wKSk6W10sc3RyaWRlczpsP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihsKT4+PjAsTnVtYmVyKGMpPj4+MCkpOltdfSl9LDg0OTI2NjoocixlKT0+e2Eua2IoXCJHbG9iYWxNYXhQb29sXCIscix7Zm9ybWF0OmU/XCJOSFdDXCI6XCJOQ0hXXCJ9KX0sODQ5MzUzOihyLGUsdCxuLG8saSx1LHMsZixiLG0sbCxjLGQpPT57YS5rYihcIk1heFBvb2xcIixyLHtmb3JtYXQ6ZD9cIk5IV0NcIjpcIk5DSFdcIixhdXRvX3BhZDplLGNlaWxfbW9kZTp0LGNvdW50X2luY2x1ZGVfcGFkOm4sc3RvcmFnZV9vcmRlcjpvLGRpbGF0aW9uczppP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihpKT4+PjAsTnVtYmVyKHUpPj4+MCkpOltdLGtlcm5lbF9zaGFwZTpzP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihzKT4+PjAsTnVtYmVyKGYpPj4+MCkpOltdLHBhZHM6Yj9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIoYik+Pj4wLE51bWJlcihtKT4+PjApKTpbXSxzdHJpZGVzOmw/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKGwpPj4+MCxOdW1iZXIoYyk+Pj4wKSk6W119KX0sODQ5ODI4OihyLGUpPT57YS5rYihcIkdsb2JhbE1heFBvb2xcIixyLHtmb3JtYXQ6ZT9cIk5IV0NcIjpcIk5DSFdcIn0pfSw4NDk5MTU6KHIsZSx0LG4sbyxpLHUscyxmLGIsbSxsLGMsZCk9PnthLmtiKFwiTWF4UG9vbFwiLHIse2Zvcm1hdDpkP1wiTkhXQ1wiOlwiTkNIV1wiLGF1dG9fcGFkOmUsY2VpbF9tb2RlOnQsY291bnRfaW5jbHVkZV9wYWQ6bixzdG9yYWdlX29yZGVyOm8sZGlsYXRpb25zOmk/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKGkpPj4+MCxOdW1iZXIodSk+Pj4wKSk6W10sa2VybmVsX3NoYXBlOnM/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKHMpPj4+MCxOdW1iZXIoZik+Pj4wKSk6W10scGFkczpiP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihiKT4+PjAsTnVtYmVyKG0pPj4+MCkpOltdLHN0cmlkZXM6bD9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIobCk+Pj4wLE51bWJlcihjKT4+PjApKTpbXX0pfSw4NTAzOTA6KHIsZSx0LG4sbyk9PnthLmtiKFwiR2VtbVwiLHIse2FscGhhOmUsYmV0YTp0LHRyYW5zQTpuLHRyYW5zQjpvfSl9LDg1MDQ5NDpyPT57YS5rYihcIk1hdE11bFwiLHIsdm9pZCAwKX0sODUwNTQ4OihyLGUsdCxuKT0+e2Eua2IoXCJBcmdNYXhcIixyLHtrZWVwRGltczohIWUsc2VsZWN0TGFzdEluZGV4OiEhdCxheGlzOm59KX0sODUwNjU2OihyLGUsdCxuKT0+e2Eua2IoXCJBcmdNaW5cIixyLHtrZWVwRGltczohIWUsc2VsZWN0TGFzdEluZGV4OiEhdCxheGlzOm59KX0sODUwNzY0OihyLGUpPT57YS5rYihcIlNvZnRtYXhcIixyLHtheGlzOmV9KX0sODUwODI3OihyLGUpPT57YS5rYihcIkNvbmNhdFwiLHIse2F4aXM6ZX0pfSw4NTA4ODc6KHIsZSx0LG4sbyk9PnthLmtiKFwiU3BsaXRcIixyLHtheGlzOmUsbnVtT3V0cHV0czp0LHNwbGl0U2l6ZXM6bj9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIobik+Pj4wLE51bWJlcihvKT4+PjApKTpbXX0pfSw4NTEwNDM6cj0+e2Eua2IoXCJFeHBhbmRcIixyLHZvaWQgMCl9LDg1MTA5NzoocixlKT0+e2Eua2IoXCJHYXRoZXJcIixyLHtheGlzOk51bWJlcihlKX0pfSw4NTExNjg6KHIsZSk9PnthLmtiKFwiR2F0aGVyRWxlbWVudHNcIixyLHtheGlzOk51bWJlcihlKX0pfSw4NTEyNDc6KHIsZSk9PnthLmtiKFwiR2F0aGVyTkRcIixyLHtiYXRjaF9kaW1zOk51bWJlcihlKX0pfSw4NTEzMjY6KHIsZSx0LG4sbyxpLHUscyxmLGIsbSk9PnthLmtiKFwiUmVzaXplXCIscix7YW50aWFsaWFzOmUsYXhlczp0P0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcih0KT4+PjAsTnVtYmVyKG4pPj4+MCkpOltdLGNvb3JkaW5hdGVUcmFuc2Zvcm1Nb2RlOlNyKG8pLGN1YmljQ29lZmZBOmksZXhjbHVkZU91dHNpZGU6dSxleHRyYXBvbGF0aW9uVmFsdWU6cyxrZWVwQXNwZWN0UmF0aW9Qb2xpY3k6U3IoZiksbW9kZTpTcihiKSxuZWFyZXN0TW9kZTpTcihtKX0pfSw4NTE2ODg6KHIsZSx0LG4sbyxpLHUpPT57YS5rYihcIlNsaWNlXCIscix7c3RhcnRzOmU/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKGUpPj4+MCxOdW1iZXIodCk+Pj4wKSk6W10sZW5kczpuP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihuKT4+PjAsTnVtYmVyKG8pPj4+MCkpOltdLGF4ZXM6aT9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIoaSk+Pj4wLE51bWJlcih1KT4+PjApKTpbXX0pfSw4NTE5NTI6cj0+e2Eua2IoXCJUaWxlXCIscix2b2lkIDApfSw4NTIwMDQ6KHIsZSx0KT0+e2Eua2IoXCJJbnN0YW5jZU5vcm1hbGl6YXRpb25cIixyLHtlcHNpbG9uOmUsZm9ybWF0OnQ/XCJOSFdDXCI6XCJOQ0hXXCJ9KX0sODUyMTE4OihyLGUsdCk9PnthLmtiKFwiSW5zdGFuY2VOb3JtYWxpemF0aW9uXCIscix7ZXBzaWxvbjplLGZvcm1hdDp0P1wiTkhXQ1wiOlwiTkNIV1wifSl9LDg1MjIzMjpyPT57YS5rYihcIlJhbmdlXCIscix2b2lkIDApfSw4NTIyODU6KHIsZSk9PnthLmtiKFwiRWluc3VtXCIscix7ZXF1YXRpb246U3IoZSl9KX0sODUyMzY2OihyLGUsdCxuLG8pPT57YS5rYihcIlBhZFwiLHIse21vZGU6ZSx2YWx1ZTp0LHBhZHM6bj9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIobik+Pj4wLE51bWJlcihvKT4+PjApKTpbXX0pfSw4NTI1MDk6KHIsZSx0LG4sbyxpKT0+e2Eua2IoXCJCYXRjaE5vcm1hbGl6YXRpb25cIixyLHtlcHNpbG9uOmUsbW9tZW50dW06dCxzcGF0aWFsOiEhbyx0cmFpbmluZ01vZGU6ISFuLGZvcm1hdDppP1wiTkhXQ1wiOlwiTkNIV1wifSl9LDg1MjY3ODoocixlLHQsbixvLGkpPT57YS5rYihcIkJhdGNoTm9ybWFsaXphdGlvblwiLHIse2Vwc2lsb246ZSxtb21lbnR1bTp0LHNwYXRpYWw6ISFvLHRyYWluaW5nTW9kZTohIW4sZm9ybWF0Omk/XCJOSFdDXCI6XCJOQ0hXXCJ9KX0sODUyODQ3OihyLGUsdCk9PnthLmtiKFwiQ3VtU3VtXCIscix7ZXhjbHVzaXZlOk51bWJlcihlKSxyZXZlcnNlOk51bWJlcih0KX0pfSw4NTI5NDQ6KHIsZSx0KT0+e2Eua2IoXCJEZXF1YW50aXplTGluZWFyXCIscix7YXhpczplLGJsb2NrU2l6ZTp0fSl9LDg1MzAzNDoocixlLHQsbixvKT0+e2Eua2IoXCJHcmlkU2FtcGxlXCIscix7YWxpZ25fY29ybmVyczplLG1vZGU6U3IodCkscGFkZGluZ19tb2RlOlNyKG4pLGZvcm1hdDpvP1wiTkhXQ1wiOlwiTkNIV1wifSl9LDg1MzIwNDoocixlLHQsbixvKT0+e2Eua2IoXCJHcmlkU2FtcGxlXCIscix7YWxpZ25fY29ybmVyczplLG1vZGU6U3IodCkscGFkZGluZ19tb2RlOlNyKG4pLGZvcm1hdDpvP1wiTkhXQ1wiOlwiTkNIV1wifSl9LDg1MzM3NDoocixlKT0+e2Eua2IoXCJTY2F0dGVyTkRcIixyLHtyZWR1Y3Rpb246U3IoZSl9KX0sODUzNDU5OihyLGUsdCxuLG8saSx1LHMsZik9PnthLmtiKFwiQXR0ZW50aW9uXCIscix7bnVtSGVhZHM6ZSxpc1VuaWRpcmVjdGlvbmFsOnQsbWFza0ZpbHRlclZhbHVlOm4sc2NhbGU6byxkb1JvdGFyeTppLHFrdkhpZGRlblNpemVzOnU/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKHMpPj4+MCxOdW1iZXIocykrdT4+PjApKTpbXSxwYXN0UHJlc2VudFNoYXJlQnVmZmVyOiEhZn0pfSw4NTM3MzE6cj0+e2Eua2IoXCJCaWFzQWRkXCIscix2b2lkIDApfSw4NTM3ODY6cj0+e2Eua2IoXCJCaWFzU3BsaXRHZWx1XCIscix2b2lkIDApfSw4NTM4NDc6cj0+e2Eua2IoXCJGYXN0R2VsdVwiLHIsdm9pZCAwKX0sODUzOTAzOihyLGUsdCxuLG8saSx1LHMsZixiLG0sbCxjLGQscCx5KT0+e2Eua2IoXCJDb252XCIscix7Zm9ybWF0Omw/XCJOSFdDXCI6XCJOQ0hXXCIsYXV0b19wYWQ6ZSxkaWxhdGlvbnM6dD9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIodCk+Pj4wLE51bWJlcihuKT4+PjApKTpbXSxncm91cDpvLGtlcm5lbF9zaGFwZTppP0FycmF5LmZyb20oTCgpLnN1YmFycmF5KE51bWJlcihpKT4+PjAsTnVtYmVyKHUpPj4+MCkpOltdLHBhZHM6cz9BcnJheS5mcm9tKEwoKS5zdWJhcnJheShOdW1iZXIocyk+Pj4wLE51bWJlcihmKT4+PjApKTpbXSxzdHJpZGVzOmI/QXJyYXkuZnJvbShMKCkuc3ViYXJyYXkoTnVtYmVyKGIpPj4+MCxOdW1iZXIobSk+Pj4wKSk6W10sd19pc19jb25zdDooKT0+ISFGKClbTnVtYmVyKGMpPj4+MF0sYWN0aXZhdGlvbjpTcihkKSxhY3RpdmF0aW9uX3BhcmFtczpwP0FycmF5LmZyb20oJCgpLnN1YmFycmF5KE51bWJlcihwKT4+PjAsTnVtYmVyKHkpPj4+MCkpOltdfSl9LDg1NDQ4NzpyPT57YS5rYihcIkdlbHVcIixyLHZvaWQgMCl9LDg1NDUzOToocixlLHQsbixvLGksdSxzLGYpPT57YS5rYihcIkdyb3VwUXVlcnlBdHRlbnRpb25cIixyLHtudW1IZWFkczplLGt2TnVtSGVhZHM6dCxzY2FsZTpuLHNvZnRjYXA6byxkb1JvdGFyeTppLHJvdGFyeUludGVybGVhdmVkOnUsc21vb3RoU29mdG1heDpzLGxvY2FsV2luZG93U2l6ZTpmfSl9LDg1NDc1NjoocixlLHQsbik9PnthLmtiKFwiTGF5ZXJOb3JtYWxpemF0aW9uXCIscix7YXhpczplLGVwc2lsb246dCxzaW1wbGlmaWVkOiEhbn0pfSw4NTQ4Njc6KHIsZSx0LG4pPT57YS5rYihcIkxheWVyTm9ybWFsaXphdGlvblwiLHIse2F4aXM6ZSxlcHNpbG9uOnQsc2ltcGxpZmllZDohIW59KX0sODU0OTc4OihyLGUsdCxuLG8saSk9PnthLmtiKFwiTWF0TXVsTkJpdHNcIixyLHtrOmUsbjp0LGFjY3VyYWN5TGV2ZWw6bixiaXRzOm8sYmxvY2tTaXplOml9KX0sODU1MTA1OihyLGUsdCxuLG8saSk9PnthLmtiKFwiTXVsdGlIZWFkQXR0ZW50aW9uXCIscix7bnVtSGVhZHM6ZSxpc1VuaWRpcmVjdGlvbmFsOnQsbWFza0ZpbHRlclZhbHVlOm4sc2NhbGU6byxkb1JvdGFyeTppfSl9LDg1NTI2NDoocixlKT0+e2Eua2IoXCJRdWlja0dlbHVcIixyLHthbHBoYTplfSl9LDg1NTMyODoocixlLHQsbixvKT0+e2Eua2IoXCJSb3RhcnlFbWJlZGRpbmdcIixyLHtpbnRlcmxlYXZlZDohIWUsbnVtSGVhZHM6dCxyb3RhcnlFbWJlZGRpbmdEaW06bixzY2FsZTpvfSl9LDg1NTQ2NzoocixlLHQpPT57YS5rYihcIlNraXBMYXllck5vcm1hbGl6YXRpb25cIixyLHtlcHNpbG9uOmUsc2ltcGxpZmllZDohIXR9KX0sODU1NTY5OihyLGUsdCk9PnthLmtiKFwiU2tpcExheWVyTm9ybWFsaXphdGlvblwiLHIse2Vwc2lsb246ZSxzaW1wbGlmaWVkOiEhdH0pfSw4NTU2NzE6KHIsZSx0LG4pPT57YS5rYihcIkdhdGhlckJsb2NrUXVhbnRpemVkXCIscix7Z2F0aGVyQXhpczplLHF1YW50aXplQXhpczp0LGJsb2NrU2l6ZTpufSl9LDg1NTc5MjpyPT57YS4kYihyKX0sODU1ODI2OihyLGUpPT5hLmJjKE51bWJlcihyKSxOdW1iZXIoZSksYS5HYi5lYyxhLkdiLmVycm9ycyl9O2Z1bmN0aW9uIHRyKHIsZSx0KXtyZXR1cm4gSmUoKGFzeW5jKCk9Pnthd2FpdCBhLlliKE51bWJlcihyKSxOdW1iZXIoZSksTnVtYmVyKHQpKX0pKX1mdW5jdGlvbiBucigpe3JldHVyblwidW5kZWZpbmVkXCIhPXR5cGVvZiB3YXNtT2Zmc2V0Q29udmVydGVyfWNsYXNzIGFye25hbWU9XCJFeGl0U3RhdHVzXCI7Y29uc3RydWN0b3Iocil7dGhpcy5tZXNzYWdlPWBQcm9ncmFtIHRlcm1pbmF0ZWQgd2l0aCBleGl0KCR7cn0pYCx0aGlzLnN0YXR1cz1yfX12YXIgb3I9cj0+e3IudGVybWluYXRlKCksci5vbm1lc3NhZ2U9KCk9Pnt9fSxpcj1bXSx1cj1yPT57MD09Y3IubGVuZ3RoJiYoTnIoKSxncihjclswXSkpO3ZhciBlPWNyLnBvcCgpO2lmKCFlKXJldHVybiA2O2RyLnB1c2goZSkseXJbci5CYl09ZSxlLkJiPXIuQmI7dmFyIHQ9e0NiOlwicnVuXCIsaGM6ci5mYyxJYjpyLkliLEJiOnIuQmJ9O3JldHVybiBlLnBvc3RNZXNzYWdlKHQsci5OYiksMH0sc3I9MCxmcj0ocixlLC4uLnQpPT57Zm9yKHZhciBuPTIqdC5sZW5ndGgsYT1PbigpLG89X24oOCpuKSxpPW8+Pj4zLHU9MDt1PHQubGVuZ3RoO3UrKyl7dmFyIHM9dFt1XTtcImJpZ2ludFwiPT10eXBlb2Ygcz8oeFtpKzIqdV09MW4seFtpKzIqdSsxXT1zKTooeFtpKzIqdV09MG4saigpW2krMip1KzE+Pj4wXT1zKX1yZXR1cm4gcj12bihyLDAsbixvLGUpLENuKGEpLHJ9O2Z1bmN0aW9uIGJyKHIpe2lmKHMpcmV0dXJuIGZyKDAsMSxyKTtpZihBPXIsISgwPHNyKSl7Zm9yKHZhciBlIG9mIGRyKW9yKGUpO2ZvcihlIG9mIGNyKW9yKGUpO2NyPVtdLGRyPVtdLHlyPXt9LEQ9ITB9cCgwLG5ldyBhcihyKSl9ZnVuY3Rpb24gbXIocil7aWYocylyZXR1cm4gZnIoMSwwLHIpO2xyKHIpfXZhciBscj1yPT57aWYoQT1yLHMpdGhyb3cgbXIociksXCJ1bndpbmRcIjticihyKX0sY3I9W10sZHI9W10scHI9W10seXI9e30saHI9cj0+e3ZhciBlPXIuQmI7ZGVsZXRlIHlyW2VdLGNyLnB1c2gociksZHIuc3BsaWNlKGRyLmluZGV4T2YociksMSksci5CYj0wLGduKGUpfTtmdW5jdGlvbiB2cigpe3ByLmZvckVhY2goKHI9PnIoKSkpfXZhciBncj1yPT5uZXcgUHJvbWlzZSgoZT0+e3Iub25tZXNzYWdlPXQ9Pnt2YXIgbj0odD10LmRhdGEpLkNiO2lmKHQuSGImJnQuSGIhPWNuKCkpe3ZhciBvPXlyW3QuSGJdO28/by5wb3N0TWVzc2FnZSh0LHQuTmIpOk4oYEludGVybmFsIGVycm9yISBXb3JrZXIgc2VudCBhIG1lc3NhZ2UgXCIke259XCIgdG8gdGFyZ2V0IHB0aHJlYWQgJHt0LkhifSwgYnV0IHRoYXQgdGhyZWFkIG5vIGxvbmdlciBleGlzdHMhYCl9ZWxzZVwiY2hlY2tNYWlsYm94XCI9PT1uP1dlKCk6XCJzcGF3blRocmVhZFwiPT09bj91cih0KTpcImNsZWFudXBUaHJlYWRcIj09PW4/aHIoeXJbdC5pY10pOlwibG9hZGVkXCI9PT1uPyhyLmxvYWRlZD0hMCxlKHIpKTpcImFsZXJ0XCI9PT1uP2FsZXJ0KGBUaHJlYWQgJHt0LmpjfTogJHt0LnRleHR9YCk6XCJzZXRpbW1lZGlhdGVcIj09PXQudGFyZ2V0P3IucG9zdE1lc3NhZ2UodCk6XCJjYWxsSGFuZGxlclwiPT09bj9hW3QuUmJdKC4uLnQuYXJncyk6biYmTihgd29ya2VyIHNlbnQgYW4gdW5rbm93biBjb21tYW5kICR7bn1gKX0sci5vbmVycm9yPXI9Pnt0aHJvdyBOKGB3b3JrZXIgc2VudCBhbiBlcnJvciEgJHtyLmZpbGVuYW1lfToke3IubGluZW5vfTogJHtyLm1lc3NhZ2V9YCkscn07dmFyIHQsbj1bXTtmb3IodCBvZltdKWEucHJvcGVydHlJc0VudW1lcmFibGUodCkmJm4ucHVzaCh0KTtyLnBvc3RNZXNzYWdlKHtDYjpcImxvYWRcIixTYjpuLGxjOmssbWM6d30pfSkpO2Z1bmN0aW9uIE5yKCl7dmFyIHI9bmV3IFdvcmtlcigoKCk9Pntjb25zdCByPVVSTDtyZXR1cm4gaW1wb3J0Lm1ldGEudXJsPlwiZmlsZTpcIiYmaW1wb3J0Lm1ldGEudXJsPFwiZmlsZTtcIj9uZXcgcihCVUlMRF9ERUZTLkJVTkRMRV9GSUxFTkFNRSxpbXBvcnQubWV0YS51cmwpOm5ldyBVUkwoaW1wb3J0Lm1ldGEudXJsKX0pKCkse3R5cGU6XCJtb2R1bGVcIix3b3JrZXJEYXRhOlwiZW0tcHRocmVhZFwiLG5hbWU6XCJlbS1wdGhyZWFkXCJ9KTtjci5wdXNoKHIpfXZhciBrcj1yPT57cSgpO3ZhciBlPVUoKVtyKzUyPj4+Mj4+PjBdO3I9VSgpW3IrNTY+Pj4yPj4+MF0sQW4oZSxlLXIpLENuKGUpfSx3cj0ocixlKT0+e3NyPTAscj1UbihyLGUpLDA8c3I/QT1yOk5uKHIpfTtjbGFzcyBBcntjb25zdHJ1Y3RvcihyKXt0aGlzLkpiPXItMjR9fWZ1bmN0aW9uIENyKHIsZSx0KXt2YXIgbj1uZXcgQXIocj4+Pj0wKTt0aHJvdyBlPj4+PTAsdD4+Pj0wLFUoKVtuLkpiKzE2Pj4+Mj4+PjBdPTAsVSgpW24uSmIrND4+PjI+Pj4wXT1lLFUoKVtuLkpiKzg+Pj4yPj4+MF09dCxyfWZ1bmN0aW9uIF9yKHIsZSx0LG4pe3JldHVybiBzP2ZyKDIsMSxyLGUsdCxuKTpPcihyLGUsdCxuKX1mdW5jdGlvbiBPcihyLGUsdCxuKXtpZihyPj4+PTAsdD4+Pj0wLG4+Pj49MCx2b2lkIDA9PT1mKXJldHVybiA2O3ZhciBhPVtdO3JldHVybiBzJiYwPT09YS5sZW5ndGg/X3IocixlPj4+PTAsdCxuKToocj17ZmM6dCxCYjpyLEliOm4sTmI6YX0scz8oci5DYj1cInNwYXduVGhyZWFkXCIscG9zdE1lc3NhZ2UocixhKSwwKTp1cihyKSl9dmFyIFRyPVwidW5kZWZpbmVkXCIhPXR5cGVvZiBUZXh0RGVjb2Rlcj9uZXcgVGV4dERlY29kZXI6dm9pZCAwLFdyPShyLGU9MCx0PU5hTik9Pnt2YXIgbj0oZT4+Pj0wKSt0O2Zvcih0PWU7clt0XSYmISh0Pj1uKTspKyt0O2lmKDE2PHQtZSYmci5idWZmZXImJlRyKXJldHVybiBUci5kZWNvZGUoci5idWZmZXIgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlcj9yLnN1YmFycmF5KGUsdCk6ci5zbGljZShlLHQpKTtmb3Iobj1cIlwiO2U8dDspe3ZhciBhPXJbZSsrXTtpZigxMjgmYSl7dmFyIG89NjMmcltlKytdO2lmKDE5Mj09KDIyNCZhKSluKz1TdHJpbmcuZnJvbUNoYXJDb2RlKCgzMSZhKTw8NnxvKTtlbHNle3ZhciBpPTYzJnJbZSsrXTs2NTUzNj4oYT0yMjQ9PSgyNDAmYSk/KDE1JmEpPDwxMnxvPDw2fGk6KDcmYSk8PDE4fG88PDEyfGk8PDZ8NjMmcltlKytdKT9uKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGEpOihhLT02NTUzNixuKz1TdHJpbmcuZnJvbUNoYXJDb2RlKDU1Mjk2fGE+PjEwLDU2MzIwfDEwMjMmYSkpfX1lbHNlIG4rPVN0cmluZy5mcm9tQ2hhckNvZGUoYSl9cmV0dXJuIG59LFNyPShyLGUpPT4ocj4+Pj0wKT9XcihCKCkscixlKTpcIlwiO2Z1bmN0aW9uIEVyKHIsZSx0KXtyZXR1cm4gcz9mcigzLDEscixlLHQpOjB9ZnVuY3Rpb24geHIocixlKXtpZihzKXJldHVybiBmcig0LDEscixlKX12YXIgUnI9cj0+e2Zvcih2YXIgZT0wLHQ9MDt0PHIubGVuZ3RoOysrdCl7dmFyIG49ci5jaGFyQ29kZUF0KHQpOzEyNz49bj9lKys6MjA0Nz49bj9lKz0yOjU1Mjk2PD1uJiY1NzM0Mz49bj8oZSs9NCwrK3QpOmUrPTN9cmV0dXJuIGV9LE1yPShyLGUsdCk9Pnt2YXIgbj1CKCk7aWYoZT4+Pj0wLDA8dCl7dmFyIGE9ZTt0PWUrdC0xO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7KytvKXt2YXIgaT1yLmNoYXJDb2RlQXQobyk7aWYoNTUyOTY8PWkmJjU3MzQzPj1pJiYoaT02NTUzNisoKDEwMjMmaSk8PDEwKXwxMDIzJnIuY2hhckNvZGVBdCgrK28pKSwxMjc+PWkpe2lmKGU+PXQpYnJlYWs7bltlKys+Pj4wXT1pfWVsc2V7aWYoMjA0Nz49aSl7aWYoZSsxPj10KWJyZWFrO25bZSsrPj4+MF09MTkyfGk+PjZ9ZWxzZXtpZig2NTUzNT49aSl7aWYoZSsyPj10KWJyZWFrO25bZSsrPj4+MF09MjI0fGk+PjEyfWVsc2V7aWYoZSszPj10KWJyZWFrO25bZSsrPj4+MF09MjQwfGk+PjE4LG5bZSsrPj4+MF09MTI4fGk+PjEyJjYzfW5bZSsrPj4+MF09MTI4fGk+PjYmNjN9bltlKys+Pj4wXT0xMjh8NjMmaX19bltlPj4+MF09MCxyPWUtYX1lbHNlIHI9MDtyZXR1cm4gcn07ZnVuY3Rpb24gSHIocixlKXtpZihzKXJldHVybiBmcig1LDEscixlKX1mdW5jdGlvbiBEcihyLGUsdCl7aWYocylyZXR1cm4gZnIoNiwxLHIsZSx0KX1mdW5jdGlvbiBQcihyLGUsdCl7cmV0dXJuIHM/ZnIoNywxLHIsZSx0KTowfWZ1bmN0aW9uIEZyKHIsZSl7aWYocylyZXR1cm4gZnIoOCwxLHIsZSl9ZnVuY3Rpb24gQnIocixlLHQpe2lmKHMpcmV0dXJuIGZyKDksMSxyLGUsdCl9ZnVuY3Rpb24gSXIocixlLHQsbil7aWYocylyZXR1cm4gZnIoMTAsMSxyLGUsdCxuKX1mdW5jdGlvbiBHcihyLGUsdCxuKXtpZihzKXJldHVybiBmcigxMSwxLHIsZSx0LG4pfWZ1bmN0aW9uIExyKHIsZSx0LG4pe2lmKHMpcmV0dXJuIGZyKDEyLDEscixlLHQsbil9ZnVuY3Rpb24gVXIocil7aWYocylyZXR1cm4gZnIoMTMsMSxyKX1mdW5jdGlvbiAkcihyLGUpe2lmKHMpcmV0dXJuIGZyKDE0LDEscixlKX1mdW5jdGlvbiBqcihyLGUsdCl7aWYocylyZXR1cm4gZnIoMTUsMSxyLGUsdCl9dmFyIHpyLFZyLHFyPSgpPT5aKFwiXCIpLFlyPXI9Pntmb3IodmFyIGU9XCJcIjtCKClbcj4+PjBdOyllKz16cltCKClbcisrPj4+MF1dO3JldHVybiBlfSxKcj17fSxRcj17fSxYcj17fTtmdW5jdGlvbiBLcihyLGUsdD17fSl7cmV0dXJuIGZ1bmN0aW9uKHIsZSx0PXt9KXt2YXIgbj1lLm5hbWU7aWYoIXIpdGhyb3cgbmV3IFZyKGB0eXBlIFwiJHtufVwiIG11c3QgaGF2ZSBhIHBvc2l0aXZlIGludGVnZXIgdHlwZWlkIHBvaW50ZXJgKTtpZihRci5oYXNPd25Qcm9wZXJ0eShyKSl7aWYodC5UYilyZXR1cm47dGhyb3cgbmV3IFZyKGBDYW5ub3QgcmVnaXN0ZXIgdHlwZSAnJHtufScgdHdpY2VgKX1RcltyXT1lLGRlbGV0ZSBYcltyXSxKci5oYXNPd25Qcm9wZXJ0eShyKSYmKGU9SnJbcl0sZGVsZXRlIEpyW3JdLGUuZm9yRWFjaCgocj0+cigpKSkpfShyLGUsdCl9dmFyIFpyPShyLGUsdCk9Pntzd2l0Y2goZSl7Y2FzZSAxOnJldHVybiB0P3I9PkYoKVtyPj4+MF06cj0+QigpW3I+Pj4wXTtjYXNlIDI6cmV0dXJuIHQ/cj0+SSgpW3I+Pj4xPj4+MF06cj0+RygpW3I+Pj4xPj4+MF07Y2FzZSA0OnJldHVybiB0P3I9PkwoKVtyPj4+Mj4+PjBdOnI9PlUoKVtyPj4+Mj4+PjBdO2Nhc2UgODpyZXR1cm4gdD9yPT54W3I+Pj4zXTpyPT5SW3I+Pj4zXTtkZWZhdWx0OnRocm93IG5ldyBUeXBlRXJyb3IoYGludmFsaWQgaW50ZWdlciB3aWR0aCAoJHtlfSk6ICR7cn1gKX19O2Z1bmN0aW9uIHJlKHIsZSx0KXt0Pj4+PTAsS3Iocj4+Pj0wLHtuYW1lOmU9WXIoZT4+PjApLGZyb21XaXJlVHlwZTpyPT5yLHRvV2lyZVR5cGU6ZnVuY3Rpb24ocixlKXtpZihcImJpZ2ludFwiIT10eXBlb2YgZSYmXCJudW1iZXJcIiE9dHlwZW9mIGUpdGhyb3cgZT1udWxsPT09ZT9cIm51bGxcIjpcIm9iamVjdFwiPT0ocj10eXBlb2YgZSl8fFwiYXJyYXlcIj09PXJ8fFwiZnVuY3Rpb25cIj09PXI/ZS50b1N0cmluZygpOlwiXCIrZSxuZXcgVHlwZUVycm9yKGBDYW5ub3QgY29udmVydCBcIiR7ZX1cIiB0byAke3RoaXMubmFtZX1gKTtyZXR1cm5cIm51bWJlclwiPT10eXBlb2YgZSYmKGU9QmlnSW50KGUpKSxlfSxEYjplZSxyZWFkVmFsdWVGcm9tUG9pbnRlcjpacihlLHQsLTE9PWUuaW5kZXhPZihcInVcIikpLEViOm51bGx9KX12YXIgZWU9ODtmdW5jdGlvbiB0ZShyLGUsdCxuKXtLcihyPj4+PTAse25hbWU6ZT1ZcihlPj4+MCksZnJvbVdpcmVUeXBlOmZ1bmN0aW9uKHIpe3JldHVybiEhcn0sdG9XaXJlVHlwZTpmdW5jdGlvbihyLGUpe3JldHVybiBlP3Q6bn0sRGI6ZWUscmVhZFZhbHVlRnJvbVBvaW50ZXI6ZnVuY3Rpb24ocil7cmV0dXJuIHRoaXMuZnJvbVdpcmVUeXBlKEIoKVtyPj4+MF0pfSxFYjpudWxsfSl9dmFyIG5lPVtdLGFlPVtdO2Z1bmN0aW9uIG9lKHIpezk8KHI+Pj49MCkmJjA9PS0tYWVbcisxXSYmKGFlW3JdPXZvaWQgMCxuZS5wdXNoKHIpKX12YXIgaWU9cj0+e2lmKCFyKXRocm93IG5ldyBWcihcIkNhbm5vdCB1c2UgZGVsZXRlZCB2YWwuIGhhbmRsZSA9IFwiK3IpO3JldHVybiBhZVtyXX0sdWU9cj0+e3N3aXRjaChyKXtjYXNlIHZvaWQgMDpyZXR1cm4gMjtjYXNlIG51bGw6cmV0dXJuIDQ7Y2FzZSEwOnJldHVybiA2O2Nhc2UhMTpyZXR1cm4gODtkZWZhdWx0OmNvbnN0IGU9bmUucG9wKCl8fGFlLmxlbmd0aDtyZXR1cm4gYWVbZV09cixhZVtlKzFdPTEsZX19O2Z1bmN0aW9uIHNlKHIpe3JldHVybiB0aGlzLmZyb21XaXJlVHlwZShVKClbcj4+PjI+Pj4wXSl9dmFyIGZlPXtuYW1lOlwiZW1zY3JpcHRlbjo6dmFsXCIsZnJvbVdpcmVUeXBlOnI9Pnt2YXIgZT1pZShyKTtyZXR1cm4gb2UociksZX0sdG9XaXJlVHlwZToocixlKT0+dWUoZSksRGI6ZWUscmVhZFZhbHVlRnJvbVBvaW50ZXI6c2UsRWI6bnVsbH07ZnVuY3Rpb24gYmUocil7cmV0dXJuIEtyKHI+Pj4wLGZlKX12YXIgbWU9KHIsZSk9Pntzd2l0Y2goZSl7Y2FzZSA0OnJldHVybiBmdW5jdGlvbihyKXtyZXR1cm4gdGhpcy5mcm9tV2lyZVR5cGUoJCgpW3I+Pj4yPj4+MF0pfTtjYXNlIDg6cmV0dXJuIGZ1bmN0aW9uKHIpe3JldHVybiB0aGlzLmZyb21XaXJlVHlwZShqKClbcj4+PjM+Pj4wXSl9O2RlZmF1bHQ6dGhyb3cgbmV3IFR5cGVFcnJvcihgaW52YWxpZCBmbG9hdCB3aWR0aCAoJHtlfSk6ICR7cn1gKX19O2Z1bmN0aW9uIGxlKHIsZSx0KXt0Pj4+PTAsS3Iocj4+Pj0wLHtuYW1lOmU9WXIoZT4+PjApLGZyb21XaXJlVHlwZTpyPT5yLHRvV2lyZVR5cGU6KHIsZSk9PmUsRGI6ZWUscmVhZFZhbHVlRnJvbVBvaW50ZXI6bWUoZSx0KSxFYjpudWxsfSl9ZnVuY3Rpb24gY2UocixlLHQsbixhKXtpZihyPj4+PTAsdD4+Pj0wLGU9WXIoZT4+PjApLC0xPT09YSYmKGE9NDI5NDk2NzI5NSksYT1yPT5yLDA9PT1uKXt2YXIgbz0zMi04KnQ7YT1yPT5yPDxvPj4+b312YXIgaT1lLmluY2x1ZGVzKFwidW5zaWduZWRcIik/ZnVuY3Rpb24ocixlKXtyZXR1cm4gZT4+PjB9OmZ1bmN0aW9uKHIsZSl7cmV0dXJuIGV9O0tyKHIse25hbWU6ZSxmcm9tV2lyZVR5cGU6YSx0b1dpcmVUeXBlOmksRGI6ZWUscmVhZFZhbHVlRnJvbVBvaW50ZXI6WnIoZSx0LDAhPT1uKSxFYjpudWxsfSl9ZnVuY3Rpb24gZGUocixlLHQpe2Z1bmN0aW9uIG4ocil7dmFyIGU9VSgpW3I+Pj4yPj4+MF07cmV0dXJuIHI9VSgpW3IrND4+PjI+Pj4wXSxuZXcgYShGKCkuYnVmZmVyLHIsZSl9dmFyIGE9W0ludDhBcnJheSxVaW50OEFycmF5LEludDE2QXJyYXksVWludDE2QXJyYXksSW50MzJBcnJheSxVaW50MzJBcnJheSxGbG9hdDMyQXJyYXksRmxvYXQ2NEFycmF5LEJpZ0ludDY0QXJyYXksQmlnVWludDY0QXJyYXldW2VdO0tyKHI+Pj49MCx7bmFtZTp0PVlyKHQ+Pj4wKSxmcm9tV2lyZVR5cGU6bixEYjplZSxyZWFkVmFsdWVGcm9tUG9pbnRlcjpufSx7VGI6ITB9KX1mdW5jdGlvbiBwZShyLGUpe0tyKHI+Pj49MCx7bmFtZTplPVlyKGU+Pj4wKSxmcm9tV2lyZVR5cGU6ZnVuY3Rpb24ocil7Zm9yKHZhciBlLHQ9VSgpW3I+Pj4yPj4+MF0sbj1yKzQsYT1uLG89MDtvPD10Oysrbyl7dmFyIGk9bitvO28hPXQmJjAhPUIoKVtpPj4+MF18fChhPVNyKGEsaS1hKSx2b2lkIDA9PT1lP2U9YTooZSs9U3RyaW5nLmZyb21DaGFyQ29kZSgwKSxlKz1hKSxhPWkrMSl9cmV0dXJuIGRuKHIpLGV9LHRvV2lyZVR5cGU6ZnVuY3Rpb24ocixlKXtlIGluc3RhbmNlb2YgQXJyYXlCdWZmZXImJihlPW5ldyBVaW50OEFycmF5KGUpKTt2YXIgdD1cInN0cmluZ1wiPT10eXBlb2YgZTtpZighKHR8fGUgaW5zdGFuY2VvZiBVaW50OEFycmF5fHxlIGluc3RhbmNlb2YgVWludDhDbGFtcGVkQXJyYXl8fGUgaW5zdGFuY2VvZiBJbnQ4QXJyYXkpKXRocm93IG5ldyBWcihcIkNhbm5vdCBwYXNzIG5vbi1zdHJpbmcgdG8gc3RkOjpzdHJpbmdcIik7dmFyIG49dD9ScihlKTplLmxlbmd0aCxhPXBuKDQrbisxKSxvPWErNDtpZihVKClbYT4+PjI+Pj4wXT1uLHQpTXIoZSxvLG4rMSk7ZWxzZSBpZih0KWZvcih0PTA7dDxuOysrdCl7dmFyIGk9ZS5jaGFyQ29kZUF0KHQpO2lmKDI1NTxpKXRocm93IGRuKGEpLG5ldyBWcihcIlN0cmluZyBoYXMgVVRGLTE2IGNvZGUgdW5pdHMgdGhhdCBkbyBub3QgZml0IGluIDggYml0c1wiKTtCKClbbyt0Pj4+MF09aX1lbHNlIGZvcih0PTA7dDxuOysrdClCKClbbyt0Pj4+MF09ZVt0XTtyZXR1cm4gbnVsbCE9PXImJnIucHVzaChkbixhKSxhfSxEYjplZSxyZWFkVmFsdWVGcm9tUG9pbnRlcjpzZSxFYihyKXtkbihyKX19KX12YXIgeWU9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyP25ldyBUZXh0RGVjb2RlcihcInV0Zi0xNmxlXCIpOnZvaWQgMCxoZT0ocixlKT0+e2Zvcih2YXIgdD1yPj4xLG49dCtlLzI7ISh0Pj1uKSYmRygpW3Q+Pj4wXTspKyt0O2lmKDMyPCh0PDw9MSktciYmeWUpcmV0dXJuIHllLmRlY29kZShCKCkuc2xpY2Uocix0KSk7Zm9yKHQ9XCJcIixuPTA7IShuPj1lLzIpOysrbil7dmFyIGE9SSgpW3IrMipuPj4+MT4+PjBdO2lmKDA9PWEpYnJlYWs7dCs9U3RyaW5nLmZyb21DaGFyQ29kZShhKX1yZXR1cm4gdH0sdmU9KHIsZSx0KT0+e2lmKHQ/Pz0yMTQ3NDgzNjQ3LDI+dClyZXR1cm4gMDt2YXIgbj1lO3Q9KHQtPTIpPDIqci5sZW5ndGg/dC8yOnIubGVuZ3RoO2Zvcih2YXIgYT0wO2E8dDsrK2Epe3ZhciBvPXIuY2hhckNvZGVBdChhKTtJKClbZT4+PjE+Pj4wXT1vLGUrPTJ9cmV0dXJuIEkoKVtlPj4+MT4+PjBdPTAsZS1ufSxnZT1yPT4yKnIubGVuZ3RoLE5lPShyLGUpPT57Zm9yKHZhciB0PTAsbj1cIlwiOyEodD49ZS80KTspe3ZhciBhPUwoKVtyKzQqdD4+PjI+Pj4wXTtpZigwPT1hKWJyZWFrOysrdCw2NTUzNjw9YT8oYS09NjU1MzYsbis9U3RyaW5nLmZyb21DaGFyQ29kZSg1NTI5NnxhPj4xMCw1NjMyMHwxMDIzJmEpKTpuKz1TdHJpbmcuZnJvbUNoYXJDb2RlKGEpfXJldHVybiBufSxrZT0ocixlLHQpPT57aWYoZT4+Pj0wLHQ/Pz0yMTQ3NDgzNjQ3LDQ+dClyZXR1cm4gMDt2YXIgbj1lO3Q9bit0LTQ7Zm9yKHZhciBhPTA7YTxyLmxlbmd0aDsrK2Epe3ZhciBvPXIuY2hhckNvZGVBdChhKTtpZig1NTI5Njw9byYmNTczNDM+PW8mJihvPTY1NTM2KygoMTAyMyZvKTw8MTApfDEwMjMmci5jaGFyQ29kZUF0KCsrYSkpLEwoKVtlPj4+Mj4+PjBdPW8sKGUrPTQpKzQ+dClicmVha31yZXR1cm4gTCgpW2U+Pj4yPj4+MF09MCxlLW59LHdlPXI9Pntmb3IodmFyIGU9MCx0PTA7dDxyLmxlbmd0aDsrK3Qpe3ZhciBuPXIuY2hhckNvZGVBdCh0KTs1NTI5Njw9biYmNTczNDM+PW4mJisrdCxlKz00fXJldHVybiBlfTtmdW5jdGlvbiBBZShyLGUsdCl7aWYocj4+Pj0wLGU+Pj49MCx0PVlyKHQ+Pj49MCksMj09PWUpdmFyIG49aGUsYT12ZSxvPWdlLGk9cj0+RygpW3I+Pj4xPj4+MF07ZWxzZSA0PT09ZSYmKG49TmUsYT1rZSxvPXdlLGk9cj0+VSgpW3I+Pj4yPj4+MF0pO0tyKHIse25hbWU6dCxmcm9tV2lyZVR5cGU6cj0+e2Zvcih2YXIgdCxhPVUoKVtyPj4+Mj4+PjBdLG89cis0LHU9MDt1PD1hOysrdSl7dmFyIHM9cis0K3UqZTt1IT1hJiYwIT1pKHMpfHwobz1uKG8scy1vKSx2b2lkIDA9PT10P3Q9bzoodCs9U3RyaW5nLmZyb21DaGFyQ29kZSgwKSx0Kz1vKSxvPXMrZSl9cmV0dXJuIGRuKHIpLHR9LHRvV2lyZVR5cGU6KHIsbik9PntpZihcInN0cmluZ1wiIT10eXBlb2Ygbil0aHJvdyBuZXcgVnIoYENhbm5vdCBwYXNzIG5vbi1zdHJpbmcgdG8gQysrIHN0cmluZyB0eXBlICR7dH1gKTt2YXIgaT1vKG4pLHU9cG4oNCtpK2UpO3JldHVybiBVKClbdT4+PjI+Pj4wXT1pL2UsYShuLHUrNCxpK2UpLG51bGwhPT1yJiZyLnB1c2goZG4sdSksdX0sRGI6ZWUscmVhZFZhbHVlRnJvbVBvaW50ZXI6c2UsRWIocil7ZG4ocil9fSl9ZnVuY3Rpb24gQ2UocixlKXtLcihyPj4+PTAse1ViOiEwLG5hbWU6ZT1ZcihlPj4+MCksRGI6MCxmcm9tV2lyZVR5cGU6KCk9Pnt9LHRvV2lyZVR5cGU6KCk9Pnt9fSl9ZnVuY3Rpb24gX2Uocil7eW4ocj4+PjAsIXUsMSwhaSwxMzEwNzIsITEpLHZyKCl9dmFyIE9lPXI9PntpZighRCl0cnl7aWYocigpLCEoMDxzcikpdHJ5e3M/Tm4oQSk6bHIoQSl9Y2F0Y2gocil7ciBpbnN0YW5jZW9mIGFyfHxcInVud2luZFwiPT1yfHxwKDAscil9fWNhdGNoKHIpe3IgaW5zdGFuY2VvZiBhcnx8XCJ1bndpbmRcIj09cnx8cCgwLHIpfX07ZnVuY3Rpb24gVGUocil7cj4+Pj0wLFwiZnVuY3Rpb25cIj09dHlwZW9mIEF0b21pY3Mua2MmJihBdG9taWNzLmtjKEwoKSxyPj4+MixyKS52YWx1ZS50aGVuKFdlKSxyKz0xMjgsQXRvbWljcy5zdG9yZShMKCkscj4+PjIsMSkpfXZhciBXZT0oKT0+e3ZhciByPWNuKCk7ciYmKFRlKHIpLE9lKHduKSl9O2Z1bmN0aW9uIFNlKHIsZSl7KHI+Pj49MCk9PWU+Pj4wP3NldFRpbWVvdXQoV2UpOnM/cG9zdE1lc3NhZ2Uoe0hiOnIsQ2I6XCJjaGVja01haWxib3hcIn0pOihyPXlyW3JdKSYmci5wb3N0TWVzc2FnZSh7Q2I6XCJjaGVja01haWxib3hcIn0pfXZhciBFZT1bXTtmdW5jdGlvbiB4ZShyLGUsdCxuLGEpe2ZvcihlPj4+PTAsbi89MixFZS5sZW5ndGg9bix0PWE+Pj4wPj4+MyxhPTA7YTxuO2ErKylFZVthXT14W3QrMiphXT94W3QrMiphKzFdOmooKVt0KzIqYSsxPj4+MF07cmV0dXJuKGU/ZXJbZV06Ym5bcl0pKC4uLkVlKX12YXIgUmU9KCk9Pntzcj0wfTtmdW5jdGlvbiBNZShyKXtyPj4+PTAscz9wb3N0TWVzc2FnZSh7Q2I6XCJjbGVhbnVwVGhyZWFkXCIsaWM6cn0pOmhyKHlyW3JdKX1mdW5jdGlvbiBIZShyKXt9dmFyIERlPShyLGUpPT57dmFyIHQ9UXJbcl07aWYodm9pZCAwPT09dCl0aHJvdyByPW1uKHIpLHQ9WXIociksZG4ociksbmV3IFZyKGAke2V9IGhhcyB1bmtub3duIHR5cGUgJHt0fWApO3JldHVybiB0fSxQZT0ocixlLHQpPT57dmFyIG49W107cmV0dXJuIHI9ci50b1dpcmVUeXBlKG4sdCksbi5sZW5ndGgmJihVKClbZT4+PjI+Pj4wXT11ZShuKSkscn07ZnVuY3Rpb24gRmUocixlLHQpe3JldHVybiBlPj4+PTAsdD4+Pj0wLHI9aWUocj4+PjApLGU9RGUoZSxcImVtdmFsOjphc1wiKSxQZShlLHQscil9ZnVuY3Rpb24gQmUocixlKXtyZXR1cm4gZT4+Pj0wLHI9aWUocj4+PjApLChlPURlKGUsXCJlbXZhbDo6YXNcIikpLnRvV2lyZVR5cGUobnVsbCxyKX12YXIgSWU9cj0+e3RyeXtyKCl9Y2F0Y2gocil7WihyKX19LEdlPTAsTGU9bnVsbCxVZT0wLCRlPVtdLGplPXt9LHplPXt9LFZlPTAscWU9bnVsbCxZZT1bXTtmdW5jdGlvbiBKZShyKXtyZXR1cm4gZnVuY3Rpb24ocil7aWYoIUQpe2lmKDA9PT1HZSl7dmFyIGU9ITEsdD0hMTtyKCgocj0wKT0+e2lmKCFEJiYoVWU9cixlPSEwLHQpKXtHZT0yLEllKCgoKT0+RW4oTGUpKSksXCJ1bmRlZmluZWRcIiE9dHlwZW9mIE1haW5Mb29wJiZNYWluTG9vcC5RYiYmTWFpbkxvb3AucmVzdW1lKCkscj0hMTt0cnl7dmFyIG49ZnVuY3Rpb24oKXt2YXIgcj1MKClbTGUrOD4+PjI+Pj4wXTtyZXR1cm4gcj1mblt6ZVtyXV0sLS1zcixyKCl9KCl9Y2F0Y2goZSl7bj1lLHI9ITB9dmFyIGE9ITE7aWYoIUxlKXt2YXIgbz1xZTtvJiYocWU9bnVsbCwocj9vLnJlamVjdDpvLnJlc29sdmUpKG4pLGE9ITApfWlmKHImJiFhKXRocm93IG59fSkpLHQ9ITAsZXx8KEdlPTEsTGU9ZnVuY3Rpb24oKXt2YXIgcj1wbig2NTU0OCksZT1yKzEyO1UoKVtyPj4+Mj4+PjBdPWUsVSgpW3IrND4+PjI+Pj4wXT1lKzY1NTM2LGU9JGVbMF07dmFyIHQ9amVbZV07cmV0dXJuIHZvaWQgMD09PXQmJih0PVZlKyssamVbZV09dCx6ZVt0XT1lKSxlPXQsTCgpW3IrOD4+PjI+Pj4wXT1lLHJ9KCksXCJ1bmRlZmluZWRcIiE9dHlwZW9mIE1haW5Mb29wJiZNYWluTG9vcC5RYiYmTWFpbkxvb3AucGF1c2UoKSxJZSgoKCk9PlduKExlKSkpKX1lbHNlIDI9PT1HZT8oR2U9MCxJZSh4biksZG4oTGUpLExlPW51bGwsWWUuZm9yRWFjaChPZSkpOlooYGludmFsaWQgc3RhdGU6ICR7R2V9YCk7cmV0dXJuIFVlfX0oKGU9PntyKCkudGhlbihlKX0pKX1mdW5jdGlvbiBRZShyKXtyZXR1cm4gcj4+Pj0wLEplKChhc3luYygpPT57dmFyIGU9YXdhaXQgaWUocik7cmV0dXJuIHVlKGUpfSkpfXZhciBYZT1bXTtmdW5jdGlvbiBLZShyLGUsdCxuKXtyZXR1cm4gdD4+Pj0wLG4+Pj49MCwocj1YZVtyPj4+MF0pKG51bGwsZT1pZShlPj4+MCksdCxuKX12YXIgWmU9e30scnQ9cj0+e3ZhciBlPVplW3JdO3JldHVybiB2b2lkIDA9PT1lP1lyKHIpOmV9O2Z1bmN0aW9uIGV0KHIsZSx0LG4sYSl7cmV0dXJuIHQ+Pj49MCxuPj4+PTAsYT4+Pj0wLChyPVhlW3I+Pj4wXSkoZT1pZShlPj4+MCksZVt0PXJ0KHQpXSxuLGEpfWZ1bmN0aW9uIHR0KHIsZSl7cmV0dXJuIGU+Pj49MCwocj1pZShyPj4+MCkpPT1pZShlKX12YXIgbnQ9KCk9Plwib2JqZWN0XCI9PXR5cGVvZiBnbG9iYWxUaGlzP2dsb2JhbFRoaXM6RnVuY3Rpb24oXCJyZXR1cm4gdGhpc1wiKSgpO2Z1bmN0aW9uIGF0KHIpe3JldHVybiAwPT0ocj4+Pj0wKT91ZShudCgpKToocj1ydChyKSx1ZShudCgpW3JdKSl9dmFyIG90PXI9Pnt2YXIgZT1YZS5sZW5ndGg7cmV0dXJuIFhlLnB1c2gociksZX0saXQ9KHIsZSk9Pntmb3IodmFyIHQ9QXJyYXkociksbj0wO248cjsrK24pdFtuXT1EZShVKClbZSs0Km4+Pj4yPj4+MF0sXCJwYXJhbWV0ZXIgXCIrbik7cmV0dXJuIHR9LHV0PShyLGUpPT5PYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIm5hbWVcIix7dmFsdWU6cn0pO2Z1bmN0aW9uIHN0KHIsZSx0KXt2YXIgbj0oZT1pdChyLGU+Pj4wKSkuc2hpZnQoKTtyLS07dmFyIGE9XCJyZXR1cm4gZnVuY3Rpb24gKG9iaiwgZnVuYywgZGVzdHJ1Y3RvcnNSZWYsIGFyZ3MpIHtcXG5cIixvPTAsaT1bXTswPT09dCYmaS5wdXNoKFwib2JqXCIpO2Zvcih2YXIgdT1bXCJyZXRUeXBlXCJdLHM9W25dLGY9MDtmPHI7KytmKWkucHVzaChcImFyZ1wiK2YpLHUucHVzaChcImFyZ1R5cGVcIitmKSxzLnB1c2goZVtmXSksYSs9YCAgdmFyIGFyZyR7Zn0gPSBhcmdUeXBlJHtmfS5yZWFkVmFsdWVGcm9tUG9pbnRlcihhcmdzJHtvP1wiK1wiK286XCJcIn0pO1xcbmAsbys9ZVtmXS5EYjtyZXR1cm4gYSs9YCAgdmFyIHJ2ID0gJHsxPT09dD9cIm5ldyBmdW5jXCI6XCJmdW5jLmNhbGxcIn0oJHtpLmpvaW4oXCIsIFwiKX0pO1xcbmAsbi5VYnx8KHUucHVzaChcImVtdmFsX3JldHVyblZhbHVlXCIpLHMucHVzaChQZSksYSs9XCIgIHJldHVybiBlbXZhbF9yZXR1cm5WYWx1ZShyZXRUeXBlLCBkZXN0cnVjdG9yc1JlZiwgcnYpO1xcblwiKSx1LnB1c2goYStcIn07XFxuXCIpLHI9ZnVuY3Rpb24ocil7dmFyIGU9RnVuY3Rpb247aWYoIShlIGluc3RhbmNlb2YgRnVuY3Rpb24pKXRocm93IG5ldyBUeXBlRXJyb3IoYG5ld18gY2FsbGVkIHdpdGggY29uc3RydWN0b3IgdHlwZSAke3R5cGVvZiBlfSB3aGljaCBpcyBub3QgYSBmdW5jdGlvbmApO3ZhciB0PXV0KGUubmFtZXx8XCJ1bmtub3duRnVuY3Rpb25OYW1lXCIsKGZ1bmN0aW9uKCl7fSkpO3JldHVybiB0LnByb3RvdHlwZT1lLnByb3RvdHlwZSx0PW5ldyB0LChyPWUuYXBwbHkodCxyKSlpbnN0YW5jZW9mIE9iamVjdD9yOnR9KHUpKC4uLnMpLHQ9YG1ldGhvZENhbGxlcjwoJHtlLm1hcCgocj0+ci5uYW1lKSkuam9pbihcIiwgXCIpfSkgPT4gJHtuLm5hbWV9PmAsb3QodXQodCxyKSl9ZnVuY3Rpb24gZnQocil7cmV0dXJuIHI9cnQocj4+PjApLHVlKGFbcl0pfWZ1bmN0aW9uIGJ0KHIsZSl7cmV0dXJuIGU+Pj49MCxyPWllKHI+Pj4wKSxlPWllKGUpLHVlKHJbZV0pfWZ1bmN0aW9uIG10KHIpezk8KHI+Pj49MCkmJihhZVtyKzFdKz0xKX1mdW5jdGlvbiBsdCgpe3JldHVybiB1ZShbXSl9ZnVuY3Rpb24gY3Qocil7cj1pZShyPj4+MCk7Zm9yKHZhciBlPUFycmF5KHIubGVuZ3RoKSx0PTA7dDxyLmxlbmd0aDt0KyspZVt0XT1yW3RdO3JldHVybiB1ZShlKX1mdW5jdGlvbiBkdChyKXtyZXR1cm4gdWUocnQocj4+PjApKX1mdW5jdGlvbiBwdCgpe3JldHVybiB1ZSh7fSl9ZnVuY3Rpb24geXQocil7Zm9yKHZhciBlPWllKHI+Pj49MCk7ZS5sZW5ndGg7KXt2YXIgdD1lLnBvcCgpO2UucG9wKCkodCl9b2Uocil9ZnVuY3Rpb24gaHQocixlLHQpe2U+Pj49MCx0Pj4+PTAscj1pZShyPj4+MCksZT1pZShlKSx0PWllKHQpLHJbZV09dH1mdW5jdGlvbiB2dChyLGUpe3JldHVybiBlPj4+PTAscj0ocj1EZShyPj4+MCxcIl9lbXZhbF90YWtlX3ZhbHVlXCIpKS5yZWFkVmFsdWVGcm9tUG9pbnRlcihlKSx1ZShyKX1mdW5jdGlvbiBndChyLGUpe3I9LTkwMDcxOTkyNTQ3NDA5OTI+cnx8OTAwNzE5OTI1NDc0MDk5MjxyP05hTjpOdW1iZXIociksZT4+Pj0wLHI9bmV3IERhdGUoMWUzKnIpLEwoKVtlPj4+Mj4+PjBdPXIuZ2V0VVRDU2Vjb25kcygpLEwoKVtlKzQ+Pj4yPj4+MF09ci5nZXRVVENNaW51dGVzKCksTCgpW2UrOD4+PjI+Pj4wXT1yLmdldFVUQ0hvdXJzKCksTCgpW2UrMTI+Pj4yPj4+MF09ci5nZXRVVENEYXRlKCksTCgpW2UrMTY+Pj4yPj4+MF09ci5nZXRVVENNb250aCgpLEwoKVtlKzIwPj4+Mj4+PjBdPXIuZ2V0VVRDRnVsbFllYXIoKS0xOTAwLEwoKVtlKzI0Pj4+Mj4+PjBdPXIuZ2V0VVRDRGF5KCkscj0oci5nZXRUaW1lKCktRGF0ZS5VVEMoci5nZXRVVENGdWxsWWVhcigpLDAsMSwwLDAsMCwwKSkvODY0ZTV8MCxMKClbZSsyOD4+PjI+Pj4wXT1yfXZhciBOdD1yPT4wPT1yJTQmJigwIT1yJTEwMHx8MD09ciU0MDApLGt0PVswLDMxLDYwLDkxLDEyMSwxNTIsMTgyLDIxMywyNDQsMjc0LDMwNSwzMzVdLHd0PVswLDMxLDU5LDkwLDEyMCwxNTEsMTgxLDIxMiwyNDMsMjczLDMwNCwzMzRdO2Z1bmN0aW9uIEF0KHIsZSl7cj0tOTAwNzE5OTI1NDc0MDk5Mj5yfHw5MDA3MTk5MjU0NzQwOTkyPHI/TmFOOk51bWJlcihyKSxlPj4+PTAscj1uZXcgRGF0ZSgxZTMqciksTCgpW2U+Pj4yPj4+MF09ci5nZXRTZWNvbmRzKCksTCgpW2UrND4+PjI+Pj4wXT1yLmdldE1pbnV0ZXMoKSxMKClbZSs4Pj4+Mj4+PjBdPXIuZ2V0SG91cnMoKSxMKClbZSsxMj4+PjI+Pj4wXT1yLmdldERhdGUoKSxMKClbZSsxNj4+PjI+Pj4wXT1yLmdldE1vbnRoKCksTCgpW2UrMjA+Pj4yPj4+MF09ci5nZXRGdWxsWWVhcigpLTE5MDAsTCgpW2UrMjQ+Pj4yPj4+MF09ci5nZXREYXkoKTt2YXIgdD0oTnQoci5nZXRGdWxsWWVhcigpKT9rdDp3dClbci5nZXRNb250aCgpXStyLmdldERhdGUoKS0xfDA7TCgpW2UrMjg+Pj4yPj4+MF09dCxMKClbZSszNj4+PjI+Pj4wXT0tNjAqci5nZXRUaW1lem9uZU9mZnNldCgpLHQ9bmV3IERhdGUoci5nZXRGdWxsWWVhcigpLDYsMSkuZ2V0VGltZXpvbmVPZmZzZXQoKTt2YXIgbj1uZXcgRGF0ZShyLmdldEZ1bGxZZWFyKCksMCwxKS5nZXRUaW1lem9uZU9mZnNldCgpO3I9MHwodCE9biYmci5nZXRUaW1lem9uZU9mZnNldCgpPT1NYXRoLm1pbihuLHQpKSxMKClbZSszMj4+PjI+Pj4wXT1yfWZ1bmN0aW9uIEN0KHIpe3I+Pj49MDt2YXIgZT1uZXcgRGF0ZShMKClbcisyMD4+PjI+Pj4wXSsxOTAwLEwoKVtyKzE2Pj4+Mj4+PjBdLEwoKVtyKzEyPj4+Mj4+PjBdLEwoKVtyKzg+Pj4yPj4+MF0sTCgpW3IrND4+PjI+Pj4wXSxMKClbcj4+PjI+Pj4wXSwwKSx0PUwoKVtyKzMyPj4+Mj4+PjBdLG49ZS5nZXRUaW1lem9uZU9mZnNldCgpLGE9bmV3IERhdGUoZS5nZXRGdWxsWWVhcigpLDYsMSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxvPW5ldyBEYXRlKGUuZ2V0RnVsbFllYXIoKSwwLDEpLmdldFRpbWV6b25lT2Zmc2V0KCksaT1NYXRoLm1pbihvLGEpO3JldHVybiAwPnQ/TCgpW3IrMzI+Pj4yPj4+MF09TnVtYmVyKGEhPW8mJmk9PW4pOjA8dCE9KGk9PW4pJiYoYT1NYXRoLm1heChvLGEpLGUuc2V0VGltZShlLmdldFRpbWUoKSs2ZTQqKCgwPHQ/aTphKS1uKSkpLEwoKVtyKzI0Pj4+Mj4+PjBdPWUuZ2V0RGF5KCksdD0oTnQoZS5nZXRGdWxsWWVhcigpKT9rdDp3dClbZS5nZXRNb250aCgpXStlLmdldERhdGUoKS0xfDAsTCgpW3IrMjg+Pj4yPj4+MF09dCxMKClbcj4+PjI+Pj4wXT1lLmdldFNlY29uZHMoKSxMKClbcis0Pj4+Mj4+PjBdPWUuZ2V0TWludXRlcygpLEwoKVtyKzg+Pj4yPj4+MF09ZS5nZXRIb3VycygpLEwoKVtyKzEyPj4+Mj4+PjBdPWUuZ2V0RGF0ZSgpLEwoKVtyKzE2Pj4+Mj4+PjBdPWUuZ2V0TW9udGgoKSxMKClbcisyMD4+PjI+Pj4wXT1lLmdldFllYXIoKSxyPWUuZ2V0VGltZSgpLEJpZ0ludChpc05hTihyKT8tMTpyLzFlMyl9ZnVuY3Rpb24gX3QocixlLHQsbixhLG8saSl7cmV0dXJuIHM/ZnIoMTYsMSxyLGUsdCxuLGEsbyxpKTotNTJ9ZnVuY3Rpb24gT3QocixlLHQsbixhLG8pe2lmKHMpcmV0dXJuIGZyKDE3LDEscixlLHQsbixhLG8pfXZhciBUdD17fSxXdD0oKT0+cGVyZm9ybWFuY2UudGltZU9yaWdpbitwZXJmb3JtYW5jZS5ub3coKTtmdW5jdGlvbiBTdChyLGUpe2lmKHMpcmV0dXJuIGZyKDE4LDEscixlKTtpZihUdFtyXSYmKGNsZWFyVGltZW91dChUdFtyXS5pZCksZGVsZXRlIFR0W3JdKSwhZSlyZXR1cm4gMDt2YXIgdD1zZXRUaW1lb3V0KCgoKT0+e2RlbGV0ZSBUdFtyXSxPZSgoKCk9PmtuKHIscGVyZm9ybWFuY2UudGltZU9yaWdpbitwZXJmb3JtYW5jZS5ub3coKSkpKX0pLGUpO3JldHVybiBUdFtyXT17aWQ6dCxyYzplfSwwfWZ1bmN0aW9uIEV0KHIsZSx0LG4pe3I+Pj49MCxlPj4+PTAsdD4+Pj0wLG4+Pj49MDt2YXIgYT0obmV3IERhdGUpLmdldEZ1bGxZZWFyKCksbz1uZXcgRGF0ZShhLDAsMSkuZ2V0VGltZXpvbmVPZmZzZXQoKTthPW5ldyBEYXRlKGEsNiwxKS5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBpPU1hdGgubWF4KG8sYSk7VSgpW3I+Pj4yPj4+MF09NjAqaSxMKClbZT4+PjI+Pj4wXT1OdW1iZXIobyE9YSkscj0oZT1yPT57dmFyIGU9TWF0aC5hYnMocik7cmV0dXJuYFVUQyR7MDw9cj9cIi1cIjpcIitcIn0ke1N0cmluZyhNYXRoLmZsb29yKGUvNjApKS5wYWRTdGFydCgyLFwiMFwiKX0ke1N0cmluZyhlJTYwKS5wYWRTdGFydCgyLFwiMFwiKX1gfSkobyksZT1lKGEpLGE8bz8oTXIocix0LDE3KSxNcihlLG4sMTcpKTooTXIocixuLDE3KSxNcihlLHQsMTcpKX12YXIgeHQ9KCk9PkRhdGUubm93KCksUnQ9MTtmdW5jdGlvbiBNdChyLGUsdCl7aWYoISgwPD1yJiYzPj1yKSlyZXR1cm4gMjg7aWYoMD09PXIpcj1EYXRlLm5vdygpO2Vsc2V7aWYoIVJ0KXJldHVybiA1MjtyPXBlcmZvcm1hbmNlLnRpbWVPcmlnaW4rcGVyZm9ybWFuY2Uubm93KCl9cmV0dXJuIHhbdD4+PjA+Pj4zXT1CaWdJbnQoTWF0aC5yb3VuZCgxZTYqcikpLDB9dmFyIEh0PVtdLER0PShyLGUpPT57SHQubGVuZ3RoPTA7Zm9yKHZhciB0O3Q9QigpW3IrKz4+PjBdOyl7dmFyIG49MTA1IT10O2UrPShuJj0xMTIhPXQpJiZlJTg/NDowLEh0LnB1c2goMTEyPT10P1UoKVtlPj4+Mj4+PjBdOjEwNj09dD94W2U+Pj4zXToxMDU9PXQ/TCgpW2U+Pj4yPj4+MF06aigpW2U+Pj4zPj4+MF0pLGUrPW4/ODo0fXJldHVybiBIdH07ZnVuY3Rpb24gUHQocixlLHQpe3JldHVybiByPj4+PTAsZT1EdChlPj4+MCx0Pj4+MCksZXJbcl0oLi4uZSl9ZnVuY3Rpb24gRnQocixlLHQpe3JldHVybiByPj4+PTAsZT1EdChlPj4+MCx0Pj4+MCksZXJbcl0oLi4uZSl9dmFyIEJ0PSgpPT57fTtmdW5jdGlvbiBJdChyLGUpe3JldHVybiBOKFNyKHI+Pj4wLGU+Pj4wKSl9dmFyIEd0PSgpPT57dGhyb3cgc3IrPTEsXCJ1bndpbmRcIn07ZnVuY3Rpb24gTHQoKXtyZXR1cm4gNDI5NDkwMTc2MH12YXIgVXQ9KCk9Pm5hdmlnYXRvci5oYXJkd2FyZUNvbmN1cnJlbmN5O2Z1bmN0aW9uICR0KCl7cmV0dXJuIFooXCJDYW5ub3QgdXNlIGVtc2NyaXB0ZW5fcGNfZ2V0X2Z1bmN0aW9uIHdpdGhvdXQgLXNVU0VfT0ZGU0VUX0NPTlZFUlRFUlwiKSwwfWZ1bmN0aW9uIGp0KHIpe3I+Pj49MDt2YXIgZT1CKCkubGVuZ3RoO2lmKHI8PWV8fDQyOTQ5MDE3NjA8cilyZXR1cm4hMTtmb3IodmFyIHQ9MTs0Pj10O3QqPTIpe3ZhciBuPWUqKDErLjIvdCk7bj1NYXRoLm1pbihuLHIrMTAwNjYzMjk2KTtyOntuPShNYXRoLm1pbig0Mjk0OTAxNzYwLDY1NTM2Kk1hdGguY2VpbChNYXRoLm1heChyLG4pLzY1NTM2KSktay5idWZmZXIuYnl0ZUxlbmd0aCs2NTUzNSkvNjU1MzZ8MDt0cnl7ay5ncm93KG4pLHEoKTt2YXIgYT0xO2JyZWFrIHJ9Y2F0Y2gocil7fWE9dm9pZCAwfWlmKGEpcmV0dXJuITB9cmV0dXJuITF9dmFyIHp0PSgpPT4oWihcIkNhbm5vdCB1c2UgY29udmVydEZyYW1lVG9QQyAobmVlZGVkIGJ5IF9fYnVpbHRpbl9yZXR1cm5fYWRkcmVzcykgd2l0aG91dCAtc1VTRV9PRkZTRVRfQ09OVkVSVEVSXCIpLDApLFZ0PXt9LHF0PXI9PntyLmZvckVhY2goKHI9Pnt2YXIgZT16dCgpO2UmJihWdFtlXT1yKX0pKX07ZnVuY3Rpb24gWXQoKXt2YXIgcj1FcnJvcigpLnN0YWNrLnRvU3RyaW5nKCkuc3BsaXQoXCJcXG5cIik7cmV0dXJuXCJFcnJvclwiPT1yWzBdJiZyLnNoaWZ0KCkscXQociksVnQuTWI9enQoKSxWdC5kYz1yLFZ0Lk1ifWZ1bmN0aW9uIEp0KHIsZSx0KXtpZihyPj4+PTAsZT4+Pj0wLFZ0Lk1iPT1yKXZhciBuPVZ0LmRjO2Vsc2VcIkVycm9yXCI9PShuPUVycm9yKCkuc3RhY2sudG9TdHJpbmcoKS5zcGxpdChcIlxcblwiKSlbMF0mJm4uc2hpZnQoKSxxdChuKTtmb3IodmFyIGE9MztuW2FdJiZ6dCgpIT1yOykrK2E7Zm9yKHI9MDtyPHQmJm5bcithXTsrK3IpTCgpW2UrNCpyPj4+Mj4+PjBdPXp0KCk7cmV0dXJuIHJ9dmFyIFF0LFh0PXt9LEt0PSgpPT57aWYoIVF0KXt2YXIgcixlPXtVU0VSOlwid2ViX3VzZXJcIixMT0dOQU1FOlwid2ViX3VzZXJcIixQQVRIOlwiL1wiLFBXRDpcIi9cIixIT01FOlwiL2hvbWUvd2ViX3VzZXJcIixMQU5HOihcIm9iamVjdFwiPT10eXBlb2YgbmF2aWdhdG9yJiZuYXZpZ2F0b3IubGFuZ3VhZ2VzJiZuYXZpZ2F0b3IubGFuZ3VhZ2VzWzBdfHxcIkNcIikucmVwbGFjZShcIi1cIixcIl9cIikrXCIuVVRGLThcIixfOlwiLi90aGlzLnByb2dyYW1cIn07Zm9yKHIgaW4gWHQpdm9pZCAwPT09WHRbcl0/ZGVsZXRlIGVbcl06ZVtyXT1YdFtyXTt2YXIgdD1bXTtmb3IociBpbiBlKXQucHVzaChgJHtyfT0ke2Vbcl19YCk7UXQ9dH1yZXR1cm4gUXR9O2Z1bmN0aW9uIFp0KHIsZSl7aWYocylyZXR1cm4gZnIoMTksMSxyLGUpO3I+Pj49MCxlPj4+PTA7dmFyIHQ9MDtyZXR1cm4gS3QoKS5mb3JFYWNoKCgobixhKT0+e3ZhciBvPWUrdDtmb3IoYT1VKClbcis0KmE+Pj4yPj4+MF09byxvPTA7bzxuLmxlbmd0aDsrK28pRigpW2ErKz4+PjBdPW4uY2hhckNvZGVBdChvKTtGKClbYT4+PjBdPTAsdCs9bi5sZW5ndGgrMX0pKSwwfWZ1bmN0aW9uIHJuKHIsZSl7aWYocylyZXR1cm4gZnIoMjAsMSxyLGUpO3I+Pj49MCxlPj4+PTA7dmFyIHQ9S3QoKTtVKClbcj4+PjI+Pj4wXT10Lmxlbmd0aDt2YXIgbj0wO3JldHVybiB0LmZvckVhY2goKHI9Pm4rPXIubGVuZ3RoKzEpKSxVKClbZT4+PjI+Pj4wXT1uLDB9ZnVuY3Rpb24gZW4ocil7cmV0dXJuIHM/ZnIoMjEsMSxyKTo1Mn1mdW5jdGlvbiB0bihyLGUsdCxuKXtyZXR1cm4gcz9mcigyMiwxLHIsZSx0LG4pOjUyfWZ1bmN0aW9uIG5uKHIsZSx0LG4pe3JldHVybiBzP2ZyKDIzLDEscixlLHQsbik6NzB9dmFyIGFuPVtudWxsLFtdLFtdXTtmdW5jdGlvbiBvbihyLGUsdCxuKXtpZihzKXJldHVybiBmcigyNCwxLHIsZSx0LG4pO2U+Pj49MCx0Pj4+PTAsbj4+Pj0wO2Zvcih2YXIgYT0wLG89MDtvPHQ7bysrKXt2YXIgaT1VKClbZT4+PjI+Pj4wXSx1PVUoKVtlKzQ+Pj4yPj4+MF07ZSs9ODtmb3IodmFyIGY9MDtmPHU7ZisrKXt2YXIgYj1CKClbaStmPj4+MF0sbT1hbltyXTswPT09Ynx8MTA9PT1iPygoMT09PXI/ZzpOKShXcihtKSksbS5sZW5ndGg9MCk6bS5wdXNoKGIpfWErPXV9cmV0dXJuIFUoKVtuPj4+Mj4+PjBdPWEsMH1zfHxmdW5jdGlvbigpe2Zvcih2YXIgcj1hLm51bVRocmVhZHMtMTtyLS07KU5yKCk7aXIudW5zaGlmdCgoKCk9PntRKyssZnVuY3Rpb24ocil7cz9yKCk6UHJvbWlzZS5hbGwoY3IubWFwKGdyKSkudGhlbihyKX0oKCgpPT5LKCkpKX0pKX0oKTtmb3IodmFyIHVuPUFycmF5KDI1Niksc249MDsyNTY+c247Kytzbil1bltzbl09U3RyaW5nLmZyb21DaGFyQ29kZShzbik7enI9dW4sVnI9YS5CaW5kaW5nRXJyb3I9Y2xhc3MgZXh0ZW5kcyBFcnJvcntjb25zdHJ1Y3RvcihyKXtzdXBlcihyKSx0aGlzLm5hbWU9XCJCaW5kaW5nRXJyb3JcIn19LGEuSW50ZXJuYWxFcnJvcj1jbGFzcyBleHRlbmRzIEVycm9ye2NvbnN0cnVjdG9yKHIpe3N1cGVyKHIpLHRoaXMubmFtZT1cIkludGVybmFsRXJyb3JcIn19LGFlLnB1c2goMCwxLHZvaWQgMCwxLG51bGwsMSwhMCwxLCExLDEpLGEuY291bnRfZW12YWxfaGFuZGxlcz0oKT0+YWUubGVuZ3RoLzItNS1uZS5sZW5ndGg7dmFyIGZuLGJuPVticixtcixfcixFcix4cixIcixEcixQcixGcixCcixJcixHcixMcixVciwkcixqcixfdCxPdCxTdCxadCxybixlbix0bixubixvbl07IWFzeW5jIGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihyLGUpe3JldHVybiBmbj1yLmV4cG9ydHMsZm49ZnVuY3Rpb24oKXt2YXIgcj1mbixlPXt9O2ZvcihsZXRbdCxuXW9mIE9iamVjdC5lbnRyaWVzKHIpKWVbdF09XCJmdW5jdGlvblwiPT10eXBlb2Ygbj8oLi4ucik9PnskZS5wdXNoKHQpO3RyeXtyZXR1cm4gbiguLi5yKX1maW5hbGx5e0R8fCgkZS5wb3AoKSxMZSYmMT09PUdlJiYwPT09JGUubGVuZ3RoJiYoR2U9MCxzcis9MSxJZShTbiksXCJ1bmRlZmluZWRcIiE9dHlwZW9mIEZpYmVycyYmRmliZXJzLnNjKCkpKX19Om47cmV0dXJuIGV9KCksZm49ZnVuY3Rpb24oKXt2YXIgcj1mbixlPXI9PmU9PnIoZSk+Pj4wLHQ9cj0+KCk9PnIoKT4+PjA7cmV0dXJuKHI9T2JqZWN0LmFzc2lnbih7fSxyKSkuRWE9ZShyLkVhKSxyLmdiPXQoci5nYiksci5pYj1lKHIuaWIpLHIudWI9ZShyLnViKSxyLnZiPXQoci52Yiksci5fX2N4YV9nZXRfZXhjZXB0aW9uX3B0cj1lKHIuX19jeGFfZ2V0X2V4Y2VwdGlvbl9wdHIpLHJ9KCkscHIucHVzaChmbi5qYiksdz1lLEsoKSxmbn1RKys7dmFyIGU9cnIoKTtpZihhLmluc3RhbnRpYXRlV2FzbSlyZXR1cm4gbmV3IFByb21pc2UoKHQ9PnthLmluc3RhbnRpYXRlV2FzbShlLCgoZSxuKT0+e3IoZSxuKSx0KGUuZXhwb3J0cyl9KSl9KSk7aWYocylyZXR1cm4gbmV3IFByb21pc2UoKGU9Pnt6PXQ9Pnt2YXIgbj1uZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UodCxycigpKTtlKHIobix0KSl9fSkpO0o/Pz1hLmxvY2F0ZUZpbGU/YS5sb2NhdGVGaWxlP2EubG9jYXRlRmlsZShcIm9ydC13YXNtLXNpbWQtdGhyZWFkZWQuanNlcC53YXNtXCIseSk6eStcIm9ydC13YXNtLXNpbWQtdGhyZWFkZWQuanNlcC53YXNtXCI6bmV3IFVSTChcIm9ydC13YXNtLXNpbWQtdGhyZWFkZWQuanNlcC53YXNtXCIsaW1wb3J0Lm1ldGEudXJsKS5ocmVmO3RyeXt2YXIgdD1hd2FpdCBhc3luYyBmdW5jdGlvbihyKXt2YXIgZT1KO2lmKCFIJiZcImZ1bmN0aW9uXCI9PXR5cGVvZiBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyYmIVAoZSkpdHJ5e3ZhciB0PWZldGNoKGUse2NyZWRlbnRpYWxzOlwic2FtZS1vcmlnaW5cIn0pO3JldHVybiBhd2FpdCBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyh0LHIpfWNhdGNoKHIpe04oYHdhc20gc3RyZWFtaW5nIGNvbXBpbGUgZmFpbGVkOiAke3J9YCksTihcImZhbGxpbmcgYmFjayB0byBBcnJheUJ1ZmZlciBpbnN0YW50aWF0aW9uXCIpfXJldHVybiBhc3luYyBmdW5jdGlvbihyLGUpe3RyeXt2YXIgdD1hd2FpdCBhc3luYyBmdW5jdGlvbihyKXtpZighSCl0cnl7dmFyIGU9YXdhaXQgbChyKTtyZXR1cm4gbmV3IFVpbnQ4QXJyYXkoZSl9Y2F0Y2h7fWlmKHI9PUomJkgpcj1uZXcgVWludDhBcnJheShIKTtlbHNle2lmKCFjKXRocm93XCJib3RoIGFzeW5jIGFuZCBzeW5jIGZldGNoaW5nIG9mIHRoZSB3YXNtIGZhaWxlZFwiO3I9YyhyKX1yZXR1cm4gcn0ocik7cmV0dXJuIGF3YWl0IFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlKHQsZSl9Y2F0Y2gocil7TihgZmFpbGVkIHRvIGFzeW5jaHJvbm91c2x5IHByZXBhcmUgd2FzbTogJHtyfWApLFoocil9fShlLHIpfShlKTtyZXR1cm4gcih0Lmluc3RhbmNlLHQubW9kdWxlKX1jYXRjaChyKXtyZXR1cm4gbihyKSxQcm9taXNlLnJlamVjdChyKX19KCk7dmFyIG1uPXI9Pihtbj1mbi5FYSkociksbG49KCk9Pihsbj1mbi5GYSkoKTthLl9PcnRJbml0PShyLGUpPT4oYS5fT3J0SW5pdD1mbi5HYSkocixlKSxhLl9PcnRHZXRMYXN0RXJyb3I9KHIsZSk9PihhLl9PcnRHZXRMYXN0RXJyb3I9Zm4uSGEpKHIsZSksYS5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnM9KHIsZSx0LG4sbyxpLHUscyxmLGIpPT4oYS5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnM9Zm4uSWEpKHIsZSx0LG4sbyxpLHUscyxmLGIpLGEuX09ydEFwcGVuZEV4ZWN1dGlvblByb3ZpZGVyPShyLGUsdCxuLG8pPT4oYS5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9Zm4uSmEpKHIsZSx0LG4sbyksYS5fT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlPShyLGUsdCk9PihhLl9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGU9Zm4uS2EpKHIsZSx0KSxhLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9KHIsZSx0KT0+KGEuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeT1mbi5MYSkocixlLHQpLGEuX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucz1yPT4oYS5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zPWZuLk1hKShyKSxhLl9PcnRDcmVhdGVTZXNzaW9uPShyLGUsdCk9PihhLl9PcnRDcmVhdGVTZXNzaW9uPWZuLk5hKShyLGUsdCksYS5fT3J0UmVsZWFzZVNlc3Npb249cj0+KGEuX09ydFJlbGVhc2VTZXNzaW9uPWZuLk9hKShyKSxhLl9PcnRHZXRJbnB1dE91dHB1dENvdW50PShyLGUsdCk9PihhLl9PcnRHZXRJbnB1dE91dHB1dENvdW50PWZuLlBhKShyLGUsdCksYS5fT3J0R2V0SW5wdXRPdXRwdXRNZXRhZGF0YT0ocixlLHQsbik9PihhLl9PcnRHZXRJbnB1dE91dHB1dE1ldGFkYXRhPWZuLlFhKShyLGUsdCxuKSxhLl9PcnRGcmVlPXI9PihhLl9PcnRGcmVlPWZuLlJhKShyKSxhLl9PcnRDcmVhdGVUZW5zb3I9KHIsZSx0LG4sbyxpKT0+KGEuX09ydENyZWF0ZVRlbnNvcj1mbi5TYSkocixlLHQsbixvLGkpLGEuX09ydEdldFRlbnNvckRhdGE9KHIsZSx0LG4sbyk9PihhLl9PcnRHZXRUZW5zb3JEYXRhPWZuLlRhKShyLGUsdCxuLG8pLGEuX09ydFJlbGVhc2VUZW5zb3I9cj0+KGEuX09ydFJlbGVhc2VUZW5zb3I9Zm4uVWEpKHIpLGEuX09ydENyZWF0ZVJ1bk9wdGlvbnM9KHIsZSx0LG4pPT4oYS5fT3J0Q3JlYXRlUnVuT3B0aW9ucz1mbi5WYSkocixlLHQsbiksYS5fT3J0QWRkUnVuQ29uZmlnRW50cnk9KHIsZSx0KT0+KGEuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PWZuLldhKShyLGUsdCksYS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnM9cj0+KGEuX09ydFJlbGVhc2VSdW5PcHRpb25zPWZuLlhhKShyKSxhLl9PcnRDcmVhdGVCaW5kaW5nPXI9PihhLl9PcnRDcmVhdGVCaW5kaW5nPWZuLllhKShyKSxhLl9PcnRCaW5kSW5wdXQ9KHIsZSx0KT0+KGEuX09ydEJpbmRJbnB1dD1mbi5aYSkocixlLHQpLGEuX09ydEJpbmRPdXRwdXQ9KHIsZSx0LG4pPT4oYS5fT3J0QmluZE91dHB1dD1mbi5fYSkocixlLHQsbiksYS5fT3J0Q2xlYXJCb3VuZE91dHB1dHM9cj0+KGEuX09ydENsZWFyQm91bmRPdXRwdXRzPWZuLiRhKShyKSxhLl9PcnRSZWxlYXNlQmluZGluZz1yPT4oYS5fT3J0UmVsZWFzZUJpbmRpbmc9Zm4uYWIpKHIpLGEuX09ydFJ1bldpdGhCaW5kaW5nPShyLGUsdCxuLG8pPT4oYS5fT3J0UnVuV2l0aEJpbmRpbmc9Zm4uYmIpKHIsZSx0LG4sbyksYS5fT3J0UnVuPShyLGUsdCxuLG8saSx1LHMpPT4oYS5fT3J0UnVuPWZuLmNiKShyLGUsdCxuLG8saSx1LHMpLGEuX09ydEVuZFByb2ZpbGluZz1yPT4oYS5fT3J0RW5kUHJvZmlsaW5nPWZuLmRiKShyKSxhLl9Kc2VwT3V0cHV0PShyLGUsdCk9PihhLl9Kc2VwT3V0cHV0PWZuLmViKShyLGUsdCksYS5fSnNlcEdldE5vZGVOYW1lPXI9PihhLl9Kc2VwR2V0Tm9kZU5hbWU9Zm4uZmIpKHIpO3ZhciBjbj0oKT0+KGNuPWZuLmdiKSgpLGRuPWEuX2ZyZWU9cj0+KGRuPWEuX2ZyZWU9Zm4uaGIpKHIpLHBuPWEuX21hbGxvYz1yPT4ocG49YS5fbWFsbG9jPWZuLmliKShyKSx5bj0ocixlLHQsbixhLG8pPT4oeW49Zm4ubGIpKHIsZSx0LG4sYSxvKSxobj0oKT0+KGhuPWZuLm1iKSgpLHZuPShyLGUsdCxuLGEpPT4odm49Zm4ubmIpKHIsZSx0LG4sYSksZ249cj0+KGduPWZuLm9iKShyKSxObj1yPT4oTm49Zm4ucGIpKHIpLGtuPShyLGUpPT4oa249Zm4ucWIpKHIsZSksd249KCk9Pih3bj1mbi5yYikoKSxBbj0ocixlKT0+KEFuPWZuLnNiKShyLGUpLENuPXI9PihDbj1mbi50YikociksX249cj0+KF9uPWZuLnViKShyKSxPbj0oKT0+KE9uPWZuLnZiKSgpLFRuPWEuZHluQ2FsbF9paT0ocixlKT0+KFRuPWEuZHluQ2FsbF9paT1mbi53YikocixlKSxXbj1yPT4oV249Zm4ueGIpKHIpLFNuPSgpPT4oU249Zm4ueWIpKCksRW49cj0+KEVuPWZuLnpiKShyKSx4bj0oKT0+KHhuPWZuLkFiKSgpO3JldHVybiBhLnN0YWNrU2F2ZT0oKT0+T24oKSxhLnN0YWNrUmVzdG9yZT1yPT5DbihyKSxhLnN0YWNrQWxsb2M9cj0+X24ociksYS5zZXRWYWx1ZT1mdW5jdGlvbihyLGUsdD1cImk4XCIpe3N3aXRjaCh0LmVuZHNXaXRoKFwiKlwiKSYmKHQ9XCIqXCIpLHQpe2Nhc2VcImkxXCI6Y2FzZVwiaThcIjpGKClbcj4+PjBdPWU7YnJlYWs7Y2FzZVwiaTE2XCI6SSgpW3I+Pj4xPj4+MF09ZTticmVhaztjYXNlXCJpMzJcIjpMKClbcj4+PjI+Pj4wXT1lO2JyZWFrO2Nhc2VcImk2NFwiOnhbcj4+PjNdPUJpZ0ludChlKTticmVhaztjYXNlXCJmbG9hdFwiOiQoKVtyPj4+Mj4+PjBdPWU7YnJlYWs7Y2FzZVwiZG91YmxlXCI6aigpW3I+Pj4zPj4+MF09ZTticmVhaztjYXNlXCIqXCI6VSgpW3I+Pj4yPj4+MF09ZTticmVhaztkZWZhdWx0OlooYGludmFsaWQgdHlwZSBmb3Igc2V0VmFsdWU6ICR7dH1gKX19LGEuZ2V0VmFsdWU9ZnVuY3Rpb24ocixlPVwiaThcIil7c3dpdGNoKGUuZW5kc1dpdGgoXCIqXCIpJiYoZT1cIipcIiksZSl7Y2FzZVwiaTFcIjpjYXNlXCJpOFwiOnJldHVybiBGKClbcj4+PjBdO2Nhc2VcImkxNlwiOnJldHVybiBJKClbcj4+PjE+Pj4wXTtjYXNlXCJpMzJcIjpyZXR1cm4gTCgpW3I+Pj4yPj4+MF07Y2FzZVwiaTY0XCI6cmV0dXJuIHhbcj4+PjNdO2Nhc2VcImZsb2F0XCI6cmV0dXJuICQoKVtyPj4+Mj4+PjBdO2Nhc2VcImRvdWJsZVwiOnJldHVybiBqKClbcj4+PjM+Pj4wXTtjYXNlXCIqXCI6cmV0dXJuIFUoKVtyPj4+Mj4+PjBdO2RlZmF1bHQ6WihgaW52YWxpZCB0eXBlIGZvciBnZXRWYWx1ZTogJHtlfWApfX0sYS5VVEY4VG9TdHJpbmc9U3IsYS5zdHJpbmdUb1VURjg9TXIsYS5sZW5ndGhCeXRlc1VURjg9UnIsZnVuY3Rpb24gcigpe2lmKDA8USlYPXI7ZWxzZSBpZihzKXQoYSksWSgpO2Vsc2V7Zm9yKDswPGlyLmxlbmd0aDspaXIuc2hpZnQoKShhKTswPFE/WD1yOihhLmNhbGxlZFJ1bj0hMCxEfHwoWSgpLHQoYSkpKX19KCksYS5QVFJfU0laRT00LG99KTtleHBvcnQgZGVmYXVsdCBlO3ZhciB0PWdsb2JhbFRoaXMuc2VsZj8ubmFtZT8uc3RhcnRzV2l0aChcImVtLXB0aHJlYWRcIik7dCYmZSgpOyIsICJ2YXIgZSxyPShlPWltcG9ydC5tZXRhLnVybCxhc3luYyBmdW5jdGlvbihyPXt9KXt2YXIgdCxuLGE9cixpPW5ldyBQcm9taXNlKCgoZSxyKT0+e3Q9ZSxuPXJ9KSksbz1cIm9iamVjdFwiPT10eXBlb2Ygd2luZG93LHM9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFdvcmtlckdsb2JhbFNjb3BlLHU9cyYmc2VsZi5uYW1lPy5zdGFydHNXaXRoKFwiZW0tcHRocmVhZFwiKTthLm1vdW50RXh0ZXJuYWxEYXRhPShlLHIpPT57ZS5zdGFydHNXaXRoKFwiLi9cIikmJihlPWUuc3Vic3RyaW5nKDIpKSwoYS5OYXx8KGEuTmE9bmV3IE1hcCkpLnNldChlLHIpfSxhLnVubW91bnRFeHRlcm5hbERhdGE9KCk9PntkZWxldGUgYS5OYX07dmFyIGYsYyxsPWdsb2JhbFRoaXMuU2hhcmVkQXJyYXlCdWZmZXI/P25ldyBXZWJBc3NlbWJseS5NZW1vcnkoe2luaXRpYWw6MCxtYXhpbXVtOjAsZWI6ITB9KS5idWZmZXIuY29uc3RydWN0b3IsZD1PYmplY3QuYXNzaWduKHt9LGEpLGc9KGUscik9Pnt0aHJvdyByfSxtPVwiXCI7KG98fHMpJiYocz9tPXNlbGYubG9jYXRpb24uaHJlZjpcInVuZGVmaW5lZFwiIT10eXBlb2YgZG9jdW1lbnQmJmRvY3VtZW50LmN1cnJlbnRTY3JpcHQmJihtPWRvY3VtZW50LmN1cnJlbnRTY3JpcHQuc3JjKSxlJiYobT1lKSxtPW0uc3RhcnRzV2l0aChcImJsb2I6XCIpP1wiXCI6bS5zbGljZSgwLG0ucmVwbGFjZSgvWz8jXS4qLyxcIlwiKS5sYXN0SW5kZXhPZihcIi9cIikrMSkscyYmKGM9ZT0+e3ZhciByPW5ldyBYTUxIdHRwUmVxdWVzdDtyZXR1cm4gci5vcGVuKFwiR0VUXCIsZSwhMSksci5yZXNwb25zZVR5cGU9XCJhcnJheWJ1ZmZlclwiLHIuc2VuZChudWxsKSxuZXcgVWludDhBcnJheShyLnJlc3BvbnNlKX0pLGY9YXN5bmMgZT0+e2lmKFUoZSkpcmV0dXJuIG5ldyBQcm9taXNlKCgocix0KT0+e3ZhciBuPW5ldyBYTUxIdHRwUmVxdWVzdDtuLm9wZW4oXCJHRVRcIixlLCEwKSxuLnJlc3BvbnNlVHlwZT1cImFycmF5YnVmZmVyXCIsbi5vbmxvYWQ9KCk9PnsyMDA9PW4uc3RhdHVzfHwwPT1uLnN0YXR1cyYmbi5yZXNwb25zZT9yKG4ucmVzcG9uc2UpOnQobi5zdGF0dXMpfSxuLm9uZXJyb3I9dCxuLnNlbmQobnVsbCl9KSk7dmFyIHI9YXdhaXQgZmV0Y2goZSx7Y3JlZGVudGlhbHM6XCJzYW1lLW9yaWdpblwifSk7aWYoci5vaylyZXR1cm4gci5hcnJheUJ1ZmZlcigpO3Rocm93IEVycm9yKHIuc3RhdHVzK1wiIDogXCIrci51cmwpfSk7dmFyIGg9Y29uc29sZS5sb2cuYmluZChjb25zb2xlKSx2PWNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlKSxwPWgsdz12O09iamVjdC5hc3NpZ24oYSxkKSxkPW51bGw7dmFyIGIsTyx5LF8sVCxBLE0sQyxFLFMsayxEPWEud2FzbUJpbmFyeSxSPSExLFU9ZT0+ZS5zdGFydHNXaXRoKFwiZmlsZTovL1wiKTtmdW5jdGlvbiB4KCl7cmV0dXJuIGIuYnVmZmVyIT1fLmJ1ZmZlciYmSCgpLF99ZnVuY3Rpb24gUCgpe3JldHVybiBiLmJ1ZmZlciE9Xy5idWZmZXImJkgoKSxUfWZ1bmN0aW9uIEYoKXtyZXR1cm4gYi5idWZmZXIhPV8uYnVmZmVyJiZIKCksQX1mdW5jdGlvbiBCKCl7cmV0dXJuIGIuYnVmZmVyIT1fLmJ1ZmZlciYmSCgpLE19ZnVuY3Rpb24gVygpe3JldHVybiBiLmJ1ZmZlciE9Xy5idWZmZXImJkgoKSxDfWZ1bmN0aW9uIE4oKXtyZXR1cm4gYi5idWZmZXIhPV8uYnVmZmVyJiZIKCksRX1mdW5jdGlvbiBMKCl7cmV0dXJuIGIuYnVmZmVyIT1fLmJ1ZmZlciYmSCgpLGt9aWYodSl7dmFyIEksJD0hMTtmdW5jdGlvbiBIcihlKXt0cnl7dmFyIHI9ZS5kYXRhLHQ9ci5NYTtpZihcImxvYWRcIj09PXQpe2xldCBlPVtdO3NlbGYub25tZXNzYWdlPXI9PmUucHVzaChyKSxzZWxmLnN0YXJ0V29ya2VyPSgpPT57cG9zdE1lc3NhZ2Uoe01hOlwibG9hZGVkXCJ9KTtmb3IobGV0IHIgb2YgZSlIcihyKTtzZWxmLm9ubWVzc2FnZT1Icn07Zm9yKGNvbnN0IGUgb2Ygci5UYSlhW2VdJiYhYVtlXS5wcm94eXx8KGFbZV09KC4uLnIpPT57cG9zdE1lc3NhZ2Uoe01hOlwiY2FsbEhhbmRsZXJcIixTYTplLGFyZ3M6cn0pfSxcInByaW50XCI9PWUmJihwPWFbZV0pLFwicHJpbnRFcnJcIj09ZSYmKHc9YVtlXSkpO2I9ci5aYSxIKCksSShyLiRhKX1lbHNlIGlmKFwicnVuXCI9PT10KXtoZShyLkxhKSxScihyLkxhLDAsMCwxLDAsMCksbGUoKSxIZShyLkxhKSwkfHw9ITA7dHJ5e3BlKHIuVmEsci5RYSl9Y2F0Y2goZSl7aWYoXCJ1bndpbmRcIiE9ZSl0aHJvdyBlfX1lbHNlXCJzZXRpbW1lZGlhdGVcIiE9PXIudGFyZ2V0JiYoXCJjaGVja01haWxib3hcIj09PXQ/JCYmR2UoKTp0JiYodyhgd29ya2VyOiByZWNlaXZlZCB1bmtub3duIGNvbW1hbmQgJHt0fWApLHcocikpKX1jYXRjaChlKXt0aHJvdyBVcigpLGV9fXc9ZnVuY3Rpb24oLi4uZSl7ZT1lLmpvaW4oXCIgXCIpLGNvbnNvbGUuZXJyb3IoZSl9LHNlbGYuYWxlcnQ9ZnVuY3Rpb24oLi4uZSl7cG9zdE1lc3NhZ2Uoe01hOlwiYWxlcnRcIix0ZXh0OmUuam9pbihcIiBcIiksWGE6RHIoKX0pfSxzZWxmLm9udW5oYW5kbGVkcmVqZWN0aW9uPWU9Pnt0aHJvdyBlLnJlYXNvbnx8ZX0sc2VsZi5vbm1lc3NhZ2U9SHJ9ZnVuY3Rpb24gSCgpe3ZhciBlPWIuYnVmZmVyO2EuSEVBUDg9Xz1uZXcgSW50OEFycmF5KGUpLGEuSEVBUDE2PUE9bmV3IEludDE2QXJyYXkoZSksYS5IRUFQVTg9VD1uZXcgVWludDhBcnJheShlKSxhLkhFQVBVMTY9bmV3IFVpbnQxNkFycmF5KGUpLGEuSEVBUDMyPU09bmV3IEludDMyQXJyYXkoZSksYS5IRUFQVTMyPUM9bmV3IFVpbnQzMkFycmF5KGUpLGEuSEVBUEYzMj1FPW5ldyBGbG9hdDMyQXJyYXkoZSksYS5IRUFQRjY0PWs9bmV3IEZsb2F0NjRBcnJheShlKSxhLkhFQVA2ND1TPW5ldyBCaWdJbnQ2NEFycmF5KGUpLGEuSEVBUFU2ND1uZXcgQmlnVWludDY0QXJyYXkoZSl9ZnVuY3Rpb24gRygpe3U/c3RhcnRXb3JrZXIoYSk6U3IuVygpfXV8fChiPW5ldyBXZWJBc3NlbWJseS5NZW1vcnkoe2luaXRpYWw6MjU2LG1heGltdW06NjU1MzYsc2hhcmVkOiEwfSksSCgpKTt2YXIgWSxqPTAsej1udWxsO2Z1bmN0aW9uIFYoKXtpZigwPT0tLWomJnope3ZhciBlPXo7ej1udWxsLGUoKX19ZnVuY3Rpb24gUShlKXt0aHJvdyB3KGU9XCJBYm9ydGVkKFwiK2UrXCIpXCIpLFI9ITAsZT1uZXcgV2ViQXNzZW1ibHkuUnVudGltZUVycm9yKGUrXCIuIEJ1aWxkIHdpdGggLXNBU1NFUlRJT05TIGZvciBtb3JlIGluZm8uXCIpLG4oZSksZX1mdW5jdGlvbiBYKCl7cmV0dXJue2E6e2I6YmUsRDp5ZSxkOk1lLGo6Q2UsejpTZSxCOmtlLHA6RGUsVDpSZSxNOlVlLFM6eGUsaTpQZSxBOkZlLHg6QmUsVTpXZSx5Ok5lLHE6TGUsUDpJZSxzOlllLEU6emUsbjpWZSxnOlFlLE86SGUsbDpYZSxIOnFlLEk6ZXIsSjpycixGOnRyLEc6bnIsbzpvcixMOnNyLEs6Y3IsVjpkcixoOmdyLHQ6dXIsazptcix1OmhyLGM6aXIsdjp2cixyOnByLFE6eXIsUjpfcixDOmllLGU6VHIsZjpBcixOOk1yLHc6RXIsYTpiLG06bmV9fX12YXIgcT17MTIyOTMyOihlLHIsdCxuLGkpPT57aWYodm9pZCAwPT09YXx8IWEuTmEpcmV0dXJuIDE7aWYoKGU9QWUoTnVtYmVyKGU+Pj4wKSkpLnN0YXJ0c1dpdGgoXCIuL1wiKSYmKGU9ZS5zdWJzdHJpbmcoMikpLCEoZT1hLk5hLmdldChlKSkpcmV0dXJuIDI7aWYocj1OdW1iZXIocj4+PjApLHQ9TnVtYmVyKHQ+Pj4wKSxuPU51bWJlcihuPj4+MCkscit0PmUuYnl0ZUxlbmd0aClyZXR1cm4gMzt0cnl7Y29uc3Qgbz1lLnN1YmFycmF5KHIscit0KTtzd2l0Y2goaSl7Y2FzZSAwOlAoKS5zZXQobyxuPj4+MCk7YnJlYWs7Y2FzZSAxOmEuYWI/YS5hYihuLG8pOmEuY2IobixvKTticmVhaztkZWZhdWx0OnJldHVybiA0fXJldHVybiAwfWNhdGNoe3JldHVybiA0fX19O2NsYXNzIEp7bmFtZT1cIkV4aXRTdGF0dXNcIjtjb25zdHJ1Y3RvcihlKXt0aGlzLm1lc3NhZ2U9YFByb2dyYW0gdGVybWluYXRlZCB3aXRoIGV4aXQoJHtlfSlgLHRoaXMuc3RhdHVzPWV9fXZhciBLPWU9PntlLnRlcm1pbmF0ZSgpLGUub25tZXNzYWdlPSgpPT57fX0sWj1bXSxlZT1lPT57MD09b2UubGVuZ3RoJiYoZ2UoKSxkZShvZVswXSkpO3ZhciByPW9lLnBvcCgpO2lmKCFyKXJldHVybiA2O3NlLnB1c2gociksZmVbZS5MYV09cixyLkxhPWUuTGE7dmFyIHQ9e01hOlwicnVuXCIsVmE6ZS5VYSxRYTplLlFhLExhOmUuTGF9O3JldHVybiByLnBvc3RNZXNzYWdlKHQsZS5SYSksMH0scmU9MCx0ZT0oZSxyLC4uLnQpPT57Zm9yKHZhciBuPTIqdC5sZW5ndGgsYT0kcigpLGk9SXIoOCpuKSxvPWk+Pj4zLHM9MDtzPHQubGVuZ3RoO3MrKyl7dmFyIHU9dFtzXTtcImJpZ2ludFwiPT10eXBlb2YgdT8oU1tvKzIqc109MW4sU1tvKzIqcysxXT11KTooU1tvKzIqc109MG4sTCgpW28rMipzKzE+Pj4wXT11KX1yZXR1cm4gZT14cihlLDAsbixpLHIpLExyKGEpLGV9O2Z1bmN0aW9uIG5lKGUpe2lmKHUpcmV0dXJuIHRlKDAsMSxlKTtpZih5PWUsISgwPHJlKSl7Zm9yKHZhciByIG9mIHNlKUsocik7Zm9yKHIgb2Ygb2UpSyhyKTtvZT1bXSxzZT1bXSxmZT17fSxSPSEwfWcoMCxuZXcgSihlKSl9ZnVuY3Rpb24gYWUoZSl7aWYodSlyZXR1cm4gdGUoMSwwLGUpO2llKGUpfXZhciBpZT1lPT57aWYoeT1lLHUpdGhyb3cgYWUoZSksXCJ1bndpbmRcIjtuZShlKX0sb2U9W10sc2U9W10sdWU9W10sZmU9e30sY2U9ZT0+e3ZhciByPWUuTGE7ZGVsZXRlIGZlW3JdLG9lLnB1c2goZSksc2Uuc3BsaWNlKHNlLmluZGV4T2YoZSksMSksZS5MYT0wLFByKHIpfTtmdW5jdGlvbiBsZSgpe3VlLmZvckVhY2goKGU9PmUoKSkpfXZhciBkZT1lPT5uZXcgUHJvbWlzZSgocj0+e2Uub25tZXNzYWdlPXQ9Pnt2YXIgbj0odD10LmRhdGEpLk1hO2lmKHQuT2EmJnQuT2EhPURyKCkpe3ZhciBpPWZlW3QuT2FdO2k/aS5wb3N0TWVzc2FnZSh0LHQuUmEpOncoYEludGVybmFsIGVycm9yISBXb3JrZXIgc2VudCBhIG1lc3NhZ2UgXCIke259XCIgdG8gdGFyZ2V0IHB0aHJlYWQgJHt0Lk9hfSwgYnV0IHRoYXQgdGhyZWFkIG5vIGxvbmdlciBleGlzdHMhYCl9ZWxzZVwiY2hlY2tNYWlsYm94XCI9PT1uP0dlKCk6XCJzcGF3blRocmVhZFwiPT09bj9lZSh0KTpcImNsZWFudXBUaHJlYWRcIj09PW4/Y2UoZmVbdC5XYV0pOlwibG9hZGVkXCI9PT1uPyhlLmxvYWRlZD0hMCxyKGUpKTpcImFsZXJ0XCI9PT1uP2FsZXJ0KGBUaHJlYWQgJHt0LlhhfTogJHt0LnRleHR9YCk6XCJzZXRpbW1lZGlhdGVcIj09PXQudGFyZ2V0P2UucG9zdE1lc3NhZ2UodCk6XCJjYWxsSGFuZGxlclwiPT09bj9hW3QuU2FdKC4uLnQuYXJncyk6biYmdyhgd29ya2VyIHNlbnQgYW4gdW5rbm93biBjb21tYW5kICR7bn1gKX0sZS5vbmVycm9yPWU9Pnt0aHJvdyB3KGB3b3JrZXIgc2VudCBhbiBlcnJvciEgJHtlLmZpbGVuYW1lfToke2UubGluZW5vfTogJHtlLm1lc3NhZ2V9YCksZX07dmFyIHQsbj1bXTtmb3IodCBvZltdKWEucHJvcGVydHlJc0VudW1lcmFibGUodCkmJm4ucHVzaCh0KTtlLnBvc3RNZXNzYWdlKHtNYTpcImxvYWRcIixUYTpuLFphOmIsJGE6T30pfSkpO2Z1bmN0aW9uIGdlKCl7dmFyIGU9bmV3IFdvcmtlcigoKCk9Pntjb25zdCBlPVVSTDtyZXR1cm4gaW1wb3J0Lm1ldGEudXJsPlwiZmlsZTpcIiYmaW1wb3J0Lm1ldGEudXJsPFwiZmlsZTtcIj9uZXcgZShCVUlMRF9ERUZTLkJVTkRMRV9GSUxFTkFNRSxpbXBvcnQubWV0YS51cmwpOm5ldyBVUkwoaW1wb3J0Lm1ldGEudXJsKX0pKCkse3R5cGU6XCJtb2R1bGVcIix3b3JrZXJEYXRhOlwiZW0tcHRocmVhZFwiLG5hbWU6XCJlbS1wdGhyZWFkXCJ9KTtvZS5wdXNoKGUpfXZhciBtZSxoZT1lPT57SCgpO3ZhciByPVcoKVtlKzUyPj4+Mj4+PjBdO2U9VygpW2UrNTY+Pj4yPj4+MF0sTnIocixyLWUpLExyKHIpfSx2ZT1bXSxwZT0oZSxyKT0+e3JlPTA7dmFyIHQ9dmVbZV07dHx8KGU+PXZlLmxlbmd0aCYmKHZlLmxlbmd0aD1lKzEpLHZlW2VdPXQ9bWUuZ2V0KGUpKSxlPXQociksMDxyZT95PWU6RnIoZSl9O2NsYXNzIHdle2NvbnN0cnVjdG9yKGUpe3RoaXMuUGE9ZS0yNH19ZnVuY3Rpb24gYmUoZSxyLHQpe3ZhciBuPW5ldyB3ZShlPj4+PTApO3Rocm93IHI+Pj49MCx0Pj4+PTAsVygpW24uUGErMTY+Pj4yPj4+MF09MCxXKClbbi5QYSs0Pj4+Mj4+PjBdPXIsVygpW24uUGErOD4+PjI+Pj4wXT10LGV9ZnVuY3Rpb24gT2UoZSxyLHQsbil7cmV0dXJuIHU/dGUoMiwxLGUscix0LG4pOnllKGUscix0LG4pfWZ1bmN0aW9uIHllKGUscix0LG4pe2lmKGU+Pj49MCx0Pj4+PTAsbj4+Pj0wLHZvaWQgMD09PWwpcmV0dXJuIDY7dmFyIGE9W107cmV0dXJuIHUmJjA9PT1hLmxlbmd0aD9PZShlLHI+Pj49MCx0LG4pOihlPXtVYTp0LExhOmUsUWE6bixSYTphfSx1PyhlLk1hPVwic3Bhd25UaHJlYWRcIixwb3N0TWVzc2FnZShlLGEpLDApOmVlKGUpKX12YXIgX2U9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIFRleHREZWNvZGVyP25ldyBUZXh0RGVjb2Rlcjp2b2lkIDAsVGU9KGUscj0wLHQ9TmFOKT0+e3ZhciBuPShyPj4+PTApK3Q7Zm9yKHQ9cjtlW3RdJiYhKHQ+PW4pOykrK3Q7aWYoMTY8dC1yJiZlLmJ1ZmZlciYmX2UpcmV0dXJuIF9lLmRlY29kZShlLmJ1ZmZlciBpbnN0YW5jZW9mIEFycmF5QnVmZmVyP2Uuc3ViYXJyYXkocix0KTplLnNsaWNlKHIsdCkpO2ZvcihuPVwiXCI7cjx0Oyl7dmFyIGE9ZVtyKytdO2lmKDEyOCZhKXt2YXIgaT02MyZlW3IrK107aWYoMTkyPT0oMjI0JmEpKW4rPVN0cmluZy5mcm9tQ2hhckNvZGUoKDMxJmEpPDw2fGkpO2Vsc2V7dmFyIG89NjMmZVtyKytdOzY1NTM2PihhPTIyND09KDI0MCZhKT8oMTUmYSk8PDEyfGk8PDZ8bzooNyZhKTw8MTh8aTw8MTJ8bzw8Nnw2MyZlW3IrK10pP24rPVN0cmluZy5mcm9tQ2hhckNvZGUoYSk6KGEtPTY1NTM2LG4rPVN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTZ8YT4+MTAsNTYzMjB8MTAyMyZhKSl9fWVsc2Ugbis9U3RyaW5nLmZyb21DaGFyQ29kZShhKX1yZXR1cm4gbn0sQWU9KGUscik9PihlPj4+PTApP1RlKFAoKSxlLHIpOlwiXCI7ZnVuY3Rpb24gTWUoZSxyLHQpe3JldHVybiB1P3RlKDMsMSxlLHIsdCk6MH1mdW5jdGlvbiBDZShlLHIpe2lmKHUpcmV0dXJuIHRlKDQsMSxlLHIpfXZhciBFZT0oZSxyLHQpPT57dmFyIG49UCgpO2lmKHI+Pj49MCwwPHQpe3ZhciBhPXI7dD1yK3QtMTtmb3IodmFyIGk9MDtpPGUubGVuZ3RoOysraSl7dmFyIG89ZS5jaGFyQ29kZUF0KGkpO2lmKDU1Mjk2PD1vJiY1NzM0Mz49byYmKG89NjU1MzYrKCgxMDIzJm8pPDwxMCl8MTAyMyZlLmNoYXJDb2RlQXQoKytpKSksMTI3Pj1vKXtpZihyPj10KWJyZWFrO25bcisrPj4+MF09b31lbHNle2lmKDIwNDc+PW8pe2lmKHIrMT49dClicmVhaztuW3IrKz4+PjBdPTE5MnxvPj42fWVsc2V7aWYoNjU1MzU+PW8pe2lmKHIrMj49dClicmVhaztuW3IrKz4+PjBdPTIyNHxvPj4xMn1lbHNle2lmKHIrMz49dClicmVhaztuW3IrKz4+PjBdPTI0MHxvPj4xOCxuW3IrKz4+PjBdPTEyOHxvPj4xMiY2M31uW3IrKz4+PjBdPTEyOHxvPj42JjYzfW5bcisrPj4+MF09MTI4fDYzJm99fW5bcj4+PjBdPTAsZT1yLWF9ZWxzZSBlPTA7cmV0dXJuIGV9O2Z1bmN0aW9uIFNlKGUscil7aWYodSlyZXR1cm4gdGUoNSwxLGUscil9ZnVuY3Rpb24ga2UoZSxyLHQpe2lmKHUpcmV0dXJuIHRlKDYsMSxlLHIsdCl9ZnVuY3Rpb24gRGUoZSxyLHQpe3JldHVybiB1P3RlKDcsMSxlLHIsdCk6MH1mdW5jdGlvbiBSZShlLHIpe2lmKHUpcmV0dXJuIHRlKDgsMSxlLHIpfWZ1bmN0aW9uIFVlKGUscix0KXtpZih1KXJldHVybiB0ZSg5LDEsZSxyLHQpfWZ1bmN0aW9uIHhlKGUscix0LG4pe2lmKHUpcmV0dXJuIHRlKDEwLDEsZSxyLHQsbil9ZnVuY3Rpb24gUGUoZSxyLHQsbil7aWYodSlyZXR1cm4gdGUoMTEsMSxlLHIsdCxuKX1mdW5jdGlvbiBGZShlLHIsdCxuKXtpZih1KXJldHVybiB0ZSgxMiwxLGUscix0LG4pfWZ1bmN0aW9uIEJlKGUpe2lmKHUpcmV0dXJuIHRlKDEzLDEsZSl9ZnVuY3Rpb24gV2UoZSxyKXtpZih1KXJldHVybiB0ZSgxNCwxLGUscil9ZnVuY3Rpb24gTmUoZSxyLHQpe2lmKHUpcmV0dXJuIHRlKDE1LDEsZSxyLHQpfXZhciBMZT0oKT0+UShcIlwiKTtmdW5jdGlvbiBJZShlKXtScihlPj4+MCwhcywxLCFvLDEzMTA3MiwhMSksbGUoKX12YXIgJGU9ZT0+e2lmKCFSKXRyeXtpZihlKCksISgwPHJlKSl0cnl7dT9Gcih5KTppZSh5KX1jYXRjaChlKXtlIGluc3RhbmNlb2YgSnx8XCJ1bndpbmRcIj09ZXx8ZygwLGUpfX1jYXRjaChlKXtlIGluc3RhbmNlb2YgSnx8XCJ1bndpbmRcIj09ZXx8ZygwLGUpfX07ZnVuY3Rpb24gSGUoZSl7ZT4+Pj0wLFwiZnVuY3Rpb25cIj09dHlwZW9mIEF0b21pY3MuWWEmJihBdG9taWNzLllhKEIoKSxlPj4+MixlKS52YWx1ZS50aGVuKEdlKSxlKz0xMjgsQXRvbWljcy5zdG9yZShCKCksZT4+PjIsMSkpfXZhciBHZT0oKT0+e3ZhciBlPURyKCk7ZSYmKEhlKGUpLCRlKFdyKSl9O2Z1bmN0aW9uIFllKGUscil7KGU+Pj49MCk9PXI+Pj4wP3NldFRpbWVvdXQoR2UpOnU/cG9zdE1lc3NhZ2Uoe09hOmUsTWE6XCJjaGVja01haWxib3hcIn0pOihlPWZlW2VdKSYmZS5wb3N0TWVzc2FnZSh7TWE6XCJjaGVja01haWxib3hcIn0pfXZhciBqZT1bXTtmdW5jdGlvbiB6ZShlLHIsdCxuLGEpe2ZvcihyPj4+PTAsbi89MixqZS5sZW5ndGg9bix0PWE+Pj4wPj4+MyxhPTA7YTxuO2ErKylqZVthXT1TW3QrMiphXT9TW3QrMiphKzFdOkwoKVt0KzIqYSsxPj4+MF07cmV0dXJuKHI/cVtyXTprcltlXSkoLi4uamUpfXZhciBWZT0oKT0+e3JlPTB9O2Z1bmN0aW9uIFFlKGUpe2U+Pj49MCx1P3Bvc3RNZXNzYWdlKHtNYTpcImNsZWFudXBUaHJlYWRcIixXYTplfSk6Y2UoZmVbZV0pfWZ1bmN0aW9uIFhlKGUpe31mdW5jdGlvbiBxZShlLHIpe2U9LTkwMDcxOTkyNTQ3NDA5OTI+ZXx8OTAwNzE5OTI1NDc0MDk5MjxlP05hTjpOdW1iZXIoZSkscj4+Pj0wLGU9bmV3IERhdGUoMWUzKmUpLEIoKVtyPj4+Mj4+PjBdPWUuZ2V0VVRDU2Vjb25kcygpLEIoKVtyKzQ+Pj4yPj4+MF09ZS5nZXRVVENNaW51dGVzKCksQigpW3IrOD4+PjI+Pj4wXT1lLmdldFVUQ0hvdXJzKCksQigpW3IrMTI+Pj4yPj4+MF09ZS5nZXRVVENEYXRlKCksQigpW3IrMTY+Pj4yPj4+MF09ZS5nZXRVVENNb250aCgpLEIoKVtyKzIwPj4+Mj4+PjBdPWUuZ2V0VVRDRnVsbFllYXIoKS0xOTAwLEIoKVtyKzI0Pj4+Mj4+PjBdPWUuZ2V0VVRDRGF5KCksZT0oZS5nZXRUaW1lKCktRGF0ZS5VVEMoZS5nZXRVVENGdWxsWWVhcigpLDAsMSwwLDAsMCwwKSkvODY0ZTV8MCxCKClbcisyOD4+PjI+Pj4wXT1lfXZhciBKZT1lPT4wPT1lJTQmJigwIT1lJTEwMHx8MD09ZSU0MDApLEtlPVswLDMxLDYwLDkxLDEyMSwxNTIsMTgyLDIxMywyNDQsMjc0LDMwNSwzMzVdLFplPVswLDMxLDU5LDkwLDEyMCwxNTEsMTgxLDIxMiwyNDMsMjczLDMwNCwzMzRdO2Z1bmN0aW9uIGVyKGUscil7ZT0tOTAwNzE5OTI1NDc0MDk5Mj5lfHw5MDA3MTk5MjU0NzQwOTkyPGU/TmFOOk51bWJlcihlKSxyPj4+PTAsZT1uZXcgRGF0ZSgxZTMqZSksQigpW3I+Pj4yPj4+MF09ZS5nZXRTZWNvbmRzKCksQigpW3IrND4+PjI+Pj4wXT1lLmdldE1pbnV0ZXMoKSxCKClbcis4Pj4+Mj4+PjBdPWUuZ2V0SG91cnMoKSxCKClbcisxMj4+PjI+Pj4wXT1lLmdldERhdGUoKSxCKClbcisxNj4+PjI+Pj4wXT1lLmdldE1vbnRoKCksQigpW3IrMjA+Pj4yPj4+MF09ZS5nZXRGdWxsWWVhcigpLTE5MDAsQigpW3IrMjQ+Pj4yPj4+MF09ZS5nZXREYXkoKTt2YXIgdD0oSmUoZS5nZXRGdWxsWWVhcigpKT9LZTpaZSlbZS5nZXRNb250aCgpXStlLmdldERhdGUoKS0xfDA7QigpW3IrMjg+Pj4yPj4+MF09dCxCKClbciszNj4+PjI+Pj4wXT0tNjAqZS5nZXRUaW1lem9uZU9mZnNldCgpLHQ9bmV3IERhdGUoZS5nZXRGdWxsWWVhcigpLDYsMSkuZ2V0VGltZXpvbmVPZmZzZXQoKTt2YXIgbj1uZXcgRGF0ZShlLmdldEZ1bGxZZWFyKCksMCwxKS5nZXRUaW1lem9uZU9mZnNldCgpO2U9MHwodCE9biYmZS5nZXRUaW1lem9uZU9mZnNldCgpPT1NYXRoLm1pbihuLHQpKSxCKClbciszMj4+PjI+Pj4wXT1lfWZ1bmN0aW9uIHJyKGUpe2U+Pj49MDt2YXIgcj1uZXcgRGF0ZShCKClbZSsyMD4+PjI+Pj4wXSsxOTAwLEIoKVtlKzE2Pj4+Mj4+PjBdLEIoKVtlKzEyPj4+Mj4+PjBdLEIoKVtlKzg+Pj4yPj4+MF0sQigpW2UrND4+PjI+Pj4wXSxCKClbZT4+PjI+Pj4wXSwwKSx0PUIoKVtlKzMyPj4+Mj4+PjBdLG49ci5nZXRUaW1lem9uZU9mZnNldCgpLGE9bmV3IERhdGUoci5nZXRGdWxsWWVhcigpLDYsMSkuZ2V0VGltZXpvbmVPZmZzZXQoKSxpPW5ldyBEYXRlKHIuZ2V0RnVsbFllYXIoKSwwLDEpLmdldFRpbWV6b25lT2Zmc2V0KCksbz1NYXRoLm1pbihpLGEpO3JldHVybiAwPnQ/QigpW2UrMzI+Pj4yPj4+MF09TnVtYmVyKGEhPWkmJm89PW4pOjA8dCE9KG89PW4pJiYoYT1NYXRoLm1heChpLGEpLHIuc2V0VGltZShyLmdldFRpbWUoKSs2ZTQqKCgwPHQ/bzphKS1uKSkpLEIoKVtlKzI0Pj4+Mj4+PjBdPXIuZ2V0RGF5KCksdD0oSmUoci5nZXRGdWxsWWVhcigpKT9LZTpaZSlbci5nZXRNb250aCgpXStyLmdldERhdGUoKS0xfDAsQigpW2UrMjg+Pj4yPj4+MF09dCxCKClbZT4+PjI+Pj4wXT1yLmdldFNlY29uZHMoKSxCKClbZSs0Pj4+Mj4+PjBdPXIuZ2V0TWludXRlcygpLEIoKVtlKzg+Pj4yPj4+MF09ci5nZXRIb3VycygpLEIoKVtlKzEyPj4+Mj4+PjBdPXIuZ2V0RGF0ZSgpLEIoKVtlKzE2Pj4+Mj4+PjBdPXIuZ2V0TW9udGgoKSxCKClbZSsyMD4+PjI+Pj4wXT1yLmdldFllYXIoKSxlPXIuZ2V0VGltZSgpLEJpZ0ludChpc05hTihlKT8tMTplLzFlMyl9ZnVuY3Rpb24gdHIoZSxyLHQsbixhLGksbyl7cmV0dXJuIHU/dGUoMTYsMSxlLHIsdCxuLGEsaSxvKTotNTJ9ZnVuY3Rpb24gbnIoZSxyLHQsbixhLGkpe2lmKHUpcmV0dXJuIHRlKDE3LDEsZSxyLHQsbixhLGkpfXZhciBhcj17fSxpcj0oKT0+cGVyZm9ybWFuY2UudGltZU9yaWdpbitwZXJmb3JtYW5jZS5ub3coKTtmdW5jdGlvbiBvcihlLHIpe2lmKHUpcmV0dXJuIHRlKDE4LDEsZSxyKTtpZihhcltlXSYmKGNsZWFyVGltZW91dChhcltlXS5pZCksZGVsZXRlIGFyW2VdKSwhcilyZXR1cm4gMDt2YXIgdD1zZXRUaW1lb3V0KCgoKT0+e2RlbGV0ZSBhcltlXSwkZSgoKCk9PkJyKGUscGVyZm9ybWFuY2UudGltZU9yaWdpbitwZXJmb3JtYW5jZS5ub3coKSkpKX0pLHIpO3JldHVybiBhcltlXT17aWQ6dCxmYjpyfSwwfWZ1bmN0aW9uIHNyKGUscix0LG4pe2U+Pj49MCxyPj4+PTAsdD4+Pj0wLG4+Pj49MDt2YXIgYT0obmV3IERhdGUpLmdldEZ1bGxZZWFyKCksaT1uZXcgRGF0ZShhLDAsMSkuZ2V0VGltZXpvbmVPZmZzZXQoKTthPW5ldyBEYXRlKGEsNiwxKS5nZXRUaW1lem9uZU9mZnNldCgpO3ZhciBvPU1hdGgubWF4KGksYSk7VygpW2U+Pj4yPj4+MF09NjAqbyxCKClbcj4+PjI+Pj4wXT1OdW1iZXIoaSE9YSksZT0ocj1lPT57dmFyIHI9TWF0aC5hYnMoZSk7cmV0dXJuYFVUQyR7MDw9ZT9cIi1cIjpcIitcIn0ke1N0cmluZyhNYXRoLmZsb29yKHIvNjApKS5wYWRTdGFydCgyLFwiMFwiKX0ke1N0cmluZyhyJTYwKS5wYWRTdGFydCgyLFwiMFwiKX1gfSkoaSkscj1yKGEpLGE8aT8oRWUoZSx0LDE3KSxFZShyLG4sMTcpKTooRWUoZSxuLDE3KSxFZShyLHQsMTcpKX12YXIgdXI9KCk9PkRhdGUubm93KCksZnI9MTtmdW5jdGlvbiBjcihlLHIsdCl7aWYoISgwPD1lJiYzPj1lKSlyZXR1cm4gMjg7aWYoMD09PWUpZT1EYXRlLm5vdygpO2Vsc2V7aWYoIWZyKXJldHVybiA1MjtlPXBlcmZvcm1hbmNlLnRpbWVPcmlnaW4rcGVyZm9ybWFuY2Uubm93KCl9cmV0dXJuIFNbdD4+PjA+Pj4zXT1CaWdJbnQoTWF0aC5yb3VuZCgxZTYqZSkpLDB9dmFyIGxyPVtdO2Z1bmN0aW9uIGRyKGUscix0KXtlPj4+PTAscj4+Pj0wLHQ+Pj49MCxsci5sZW5ndGg9MDtmb3IodmFyIG47bj1QKClbcisrPj4+MF07KXt2YXIgYT0xMDUhPW47dCs9KGEmPTExMiE9bikmJnQlOD80OjAsbHIucHVzaCgxMTI9PW4/VygpW3Q+Pj4yPj4+MF06MTA2PT1uP1NbdD4+PjNdOjEwNT09bj9CKClbdD4+PjI+Pj4wXTpMKClbdD4+PjM+Pj4wXSksdCs9YT84OjR9cmV0dXJuIHFbZV0oLi4ubHIpfXZhciBncj0oKT0+e30sbXI9KCk9Pnt0aHJvdyByZSs9MSxcInVud2luZFwifTtmdW5jdGlvbiBocigpe3JldHVybiA0Mjk0OTAxNzYwfXZhciB2cj0oKT0+bmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3k7ZnVuY3Rpb24gcHIoZSl7ZT4+Pj0wO3ZhciByPVAoKS5sZW5ndGg7aWYoZTw9cnx8NDI5NDkwMTc2MDxlKXJldHVybiExO2Zvcih2YXIgdD0xOzQ+PXQ7dCo9Mil7dmFyIG49ciooMSsuMi90KTtuPU1hdGgubWluKG4sZSsxMDA2NjMyOTYpO2U6e249KE1hdGgubWluKDQyOTQ5MDE3NjAsNjU1MzYqTWF0aC5jZWlsKE1hdGgubWF4KGUsbikvNjU1MzYpKS1iLmJ1ZmZlci5ieXRlTGVuZ3RoKzY1NTM1KS82NTUzNnwwO3RyeXtiLmdyb3cobiksSCgpO3ZhciBhPTE7YnJlYWsgZX1jYXRjaChlKXt9YT12b2lkIDB9aWYoYSlyZXR1cm4hMH1yZXR1cm4hMX12YXIgd3IsYnI9e30sT3I9KCk9PntpZighd3Ipe3ZhciBlLHI9e1VTRVI6XCJ3ZWJfdXNlclwiLExPR05BTUU6XCJ3ZWJfdXNlclwiLFBBVEg6XCIvXCIsUFdEOlwiL1wiLEhPTUU6XCIvaG9tZS93ZWJfdXNlclwiLExBTkc6KFwib2JqZWN0XCI9PXR5cGVvZiBuYXZpZ2F0b3ImJm5hdmlnYXRvci5sYW5ndWFnZXMmJm5hdmlnYXRvci5sYW5ndWFnZXNbMF18fFwiQ1wiKS5yZXBsYWNlKFwiLVwiLFwiX1wiKStcIi5VVEYtOFwiLF86XCIuL3RoaXMucHJvZ3JhbVwifTtmb3IoZSBpbiBicil2b2lkIDA9PT1icltlXT9kZWxldGUgcltlXTpyW2VdPWJyW2VdO3ZhciB0PVtdO2ZvcihlIGluIHIpdC5wdXNoKGAke2V9PSR7cltlXX1gKTt3cj10fXJldHVybiB3cn07ZnVuY3Rpb24geXIoZSxyKXtpZih1KXJldHVybiB0ZSgxOSwxLGUscik7ZT4+Pj0wLHI+Pj49MDt2YXIgdD0wO3JldHVybiBPcigpLmZvckVhY2goKChuLGEpPT57dmFyIGk9cit0O2ZvcihhPVcoKVtlKzQqYT4+PjI+Pj4wXT1pLGk9MDtpPG4ubGVuZ3RoOysraSl4KClbYSsrPj4+MF09bi5jaGFyQ29kZUF0KGkpO3goKVthPj4+MF09MCx0Kz1uLmxlbmd0aCsxfSkpLDB9ZnVuY3Rpb24gX3IoZSxyKXtpZih1KXJldHVybiB0ZSgyMCwxLGUscik7ZT4+Pj0wLHI+Pj49MDt2YXIgdD1PcigpO1coKVtlPj4+Mj4+PjBdPXQubGVuZ3RoO3ZhciBuPTA7cmV0dXJuIHQuZm9yRWFjaCgoZT0+bis9ZS5sZW5ndGgrMSkpLFcoKVtyPj4+Mj4+PjBdPW4sMH1mdW5jdGlvbiBUcihlKXtyZXR1cm4gdT90ZSgyMSwxLGUpOjUyfWZ1bmN0aW9uIEFyKGUscix0LG4pe3JldHVybiB1P3RlKDIyLDEsZSxyLHQsbik6NTJ9ZnVuY3Rpb24gTXIoZSxyLHQsbil7cmV0dXJuIHU/dGUoMjMsMSxlLHIsdCxuKTo3MH12YXIgQ3I9W251bGwsW10sW11dO2Z1bmN0aW9uIEVyKGUscix0LG4pe2lmKHUpcmV0dXJuIHRlKDI0LDEsZSxyLHQsbik7cj4+Pj0wLHQ+Pj49MCxuPj4+PTA7Zm9yKHZhciBhPTAsaT0wO2k8dDtpKyspe3ZhciBvPVcoKVtyPj4+Mj4+PjBdLHM9VygpW3IrND4+PjI+Pj4wXTtyKz04O2Zvcih2YXIgZj0wO2Y8cztmKyspe3ZhciBjPVAoKVtvK2Y+Pj4wXSxsPUNyW2VdOzA9PT1jfHwxMD09PWM/KCgxPT09ZT9wOncpKFRlKGwpKSxsLmxlbmd0aD0wKTpsLnB1c2goYyl9YSs9c31yZXR1cm4gVygpW24+Pj4yPj4+MF09YSwwfXV8fGZ1bmN0aW9uKCl7Zm9yKHZhciBlPWEubnVtVGhyZWFkcy0xO2UtLTspZ2UoKTtaLnVuc2hpZnQoKCgpPT57aisrLGZ1bmN0aW9uKGUpe3U/ZSgpOlByb21pc2UuYWxsKG9lLm1hcChkZSkpLnRoZW4oZSl9KCgoKT0+VigpKSl9KSl9KCk7dmFyIFNyLGtyPVtuZSxhZSxPZSxNZSxDZSxTZSxrZSxEZSxSZSxVZSx4ZSxQZSxGZSxCZSxXZSxOZSx0cixucixvcix5cixfcixUcixBcixNcixFcl07IWFzeW5jIGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShlLHIpe3JldHVybiBTcj1lLmV4cG9ydHMsU3I9ZnVuY3Rpb24oKXt2YXIgZT1TcixyPWU9PigpPT5lKCk+Pj4wLHQ9ZT0+cj0+ZShyKT4+PjA7cmV0dXJuKGU9T2JqZWN0LmFzc2lnbih7fSxlKSkudmE9cihlLnZhKSxlLnhhPXQoZS54YSksZS5KYT10KGUuSmEpLGUuS2E9cihlLkthKSxlfSgpLHVlLnB1c2goU3IueWEpLG1lPVNyLnphLE89cixWKCksU3J9aisrO3ZhciByPVgoKTtpZihhLmluc3RhbnRpYXRlV2FzbSlyZXR1cm4gbmV3IFByb21pc2UoKHQ9PnthLmluc3RhbnRpYXRlV2FzbShyLCgocixuKT0+e2UocixuKSx0KHIuZXhwb3J0cyl9KSl9KSk7aWYodSlyZXR1cm4gbmV3IFByb21pc2UoKHI9PntJPXQ9Pnt2YXIgbj1uZXcgV2ViQXNzZW1ibHkuSW5zdGFuY2UodCxYKCkpO3IoZShuLHQpKX19KSk7WT8/PWEubG9jYXRlRmlsZT9hLmxvY2F0ZUZpbGU/YS5sb2NhdGVGaWxlKFwib3J0LXdhc20tc2ltZC10aHJlYWRlZC53YXNtXCIsbSk6bStcIm9ydC13YXNtLXNpbWQtdGhyZWFkZWQud2FzbVwiOm5ldyBVUkwoXCJvcnQtd2FzbS1zaW1kLXRocmVhZGVkLndhc21cIixpbXBvcnQubWV0YS51cmwpLmhyZWY7dHJ5e3ZhciB0PWF3YWl0IGFzeW5jIGZ1bmN0aW9uKGUpe3ZhciByPVk7aWYoIUQmJlwiZnVuY3Rpb25cIj09dHlwZW9mIFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nJiYhVShyKSl0cnl7dmFyIHQ9ZmV0Y2gocix7Y3JlZGVudGlhbHM6XCJzYW1lLW9yaWdpblwifSk7cmV0dXJuIGF3YWl0IFdlYkFzc2VtYmx5Lmluc3RhbnRpYXRlU3RyZWFtaW5nKHQsZSl9Y2F0Y2goZSl7dyhgd2FzbSBzdHJlYW1pbmcgY29tcGlsZSBmYWlsZWQ6ICR7ZX1gKSx3KFwiZmFsbGluZyBiYWNrIHRvIEFycmF5QnVmZmVyIGluc3RhbnRpYXRpb25cIil9cmV0dXJuIGFzeW5jIGZ1bmN0aW9uKGUscil7dHJ5e3ZhciB0PWF3YWl0IGFzeW5jIGZ1bmN0aW9uKGUpe2lmKCFEKXRyeXt2YXIgcj1hd2FpdCBmKGUpO3JldHVybiBuZXcgVWludDhBcnJheShyKX1jYXRjaHt9aWYoZT09WSYmRCllPW5ldyBVaW50OEFycmF5KEQpO2Vsc2V7aWYoIWMpdGhyb3dcImJvdGggYXN5bmMgYW5kIHN5bmMgZmV0Y2hpbmcgb2YgdGhlIHdhc20gZmFpbGVkXCI7ZT1jKGUpfXJldHVybiBlfShlKTtyZXR1cm4gYXdhaXQgV2ViQXNzZW1ibHkuaW5zdGFudGlhdGUodCxyKX1jYXRjaChlKXt3KGBmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiAke2V9YCksUShlKX19KHIsZSl9KHIpO3JldHVybiBlKHQuaW5zdGFuY2UsdC5tb2R1bGUpfWNhdGNoKGUpe3JldHVybiBuKGUpLFByb21pc2UucmVqZWN0KGUpfX0oKSxhLl9PcnRJbml0PShlLHIpPT4oYS5fT3J0SW5pdD1Tci5YKShlLHIpLGEuX09ydEdldExhc3RFcnJvcj0oZSxyKT0+KGEuX09ydEdldExhc3RFcnJvcj1Tci5ZKShlLHIpLGEuX09ydENyZWF0ZVNlc3Npb25PcHRpb25zPShlLHIsdCxuLGksbyxzLHUsZixjKT0+KGEuX09ydENyZWF0ZVNlc3Npb25PcHRpb25zPVNyLlopKGUscix0LG4saSxvLHMsdSxmLGMpLGEuX09ydEFwcGVuZEV4ZWN1dGlvblByb3ZpZGVyPShlLHIsdCxuLGkpPT4oYS5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXI9U3IuXykoZSxyLHQsbixpKSxhLl9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGU9KGUscix0KT0+KGEuX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZT1Tci4kKShlLHIsdCksYS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5PShlLHIsdCk9PihhLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnk9U3IuYWEpKGUscix0KSxhLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnM9ZT0+KGEuX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucz1Tci5iYSkoZSksYS5fT3J0Q3JlYXRlU2Vzc2lvbj0oZSxyLHQpPT4oYS5fT3J0Q3JlYXRlU2Vzc2lvbj1Tci5jYSkoZSxyLHQpLGEuX09ydFJlbGVhc2VTZXNzaW9uPWU9PihhLl9PcnRSZWxlYXNlU2Vzc2lvbj1Tci5kYSkoZSksYS5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudD0oZSxyLHQpPT4oYS5fT3J0R2V0SW5wdXRPdXRwdXRDb3VudD1Tci5lYSkoZSxyLHQpLGEuX09ydEdldElucHV0T3V0cHV0TWV0YWRhdGE9KGUscix0LG4pPT4oYS5fT3J0R2V0SW5wdXRPdXRwdXRNZXRhZGF0YT1Tci5mYSkoZSxyLHQsbiksYS5fT3J0RnJlZT1lPT4oYS5fT3J0RnJlZT1Tci5nYSkoZSksYS5fT3J0Q3JlYXRlVGVuc29yPShlLHIsdCxuLGksbyk9PihhLl9PcnRDcmVhdGVUZW5zb3I9U3IuaGEpKGUscix0LG4saSxvKSxhLl9PcnRHZXRUZW5zb3JEYXRhPShlLHIsdCxuLGkpPT4oYS5fT3J0R2V0VGVuc29yRGF0YT1Tci5pYSkoZSxyLHQsbixpKSxhLl9PcnRSZWxlYXNlVGVuc29yPWU9PihhLl9PcnRSZWxlYXNlVGVuc29yPVNyLmphKShlKSxhLl9PcnRDcmVhdGVSdW5PcHRpb25zPShlLHIsdCxuKT0+KGEuX09ydENyZWF0ZVJ1bk9wdGlvbnM9U3Iua2EpKGUscix0LG4pLGEuX09ydEFkZFJ1bkNvbmZpZ0VudHJ5PShlLHIsdCk9PihhLl9PcnRBZGRSdW5Db25maWdFbnRyeT1Tci5sYSkoZSxyLHQpLGEuX09ydFJlbGVhc2VSdW5PcHRpb25zPWU9PihhLl9PcnRSZWxlYXNlUnVuT3B0aW9ucz1Tci5tYSkoZSksYS5fT3J0Q3JlYXRlQmluZGluZz1lPT4oYS5fT3J0Q3JlYXRlQmluZGluZz1Tci5uYSkoZSksYS5fT3J0QmluZElucHV0PShlLHIsdCk9PihhLl9PcnRCaW5kSW5wdXQ9U3Iub2EpKGUscix0KSxhLl9PcnRCaW5kT3V0cHV0PShlLHIsdCxuKT0+KGEuX09ydEJpbmRPdXRwdXQ9U3IucGEpKGUscix0LG4pLGEuX09ydENsZWFyQm91bmRPdXRwdXRzPWU9PihhLl9PcnRDbGVhckJvdW5kT3V0cHV0cz1Tci5xYSkoZSksYS5fT3J0UmVsZWFzZUJpbmRpbmc9ZT0+KGEuX09ydFJlbGVhc2VCaW5kaW5nPVNyLnJhKShlKSxhLl9PcnRSdW5XaXRoQmluZGluZz0oZSxyLHQsbixpKT0+KGEuX09ydFJ1bldpdGhCaW5kaW5nPVNyLnNhKShlLHIsdCxuLGkpLGEuX09ydFJ1bj0oZSxyLHQsbixpLG8scyx1KT0+KGEuX09ydFJ1bj1Tci50YSkoZSxyLHQsbixpLG8scyx1KSxhLl9PcnRFbmRQcm9maWxpbmc9ZT0+KGEuX09ydEVuZFByb2ZpbGluZz1Tci51YSkoZSk7dmFyIERyPSgpPT4oRHI9U3IudmEpKCk7YS5fZnJlZT1lPT4oYS5fZnJlZT1Tci53YSkoZSksYS5fbWFsbG9jPWU9PihhLl9tYWxsb2M9U3IueGEpKGUpO3ZhciBScj0oZSxyLHQsbixhLGkpPT4oUnI9U3IuQWEpKGUscix0LG4sYSxpKSxVcj0oKT0+KFVyPVNyLkJhKSgpLHhyPShlLHIsdCxuLGEpPT4oeHI9U3IuQ2EpKGUscix0LG4sYSksUHI9ZT0+KFByPVNyLkRhKShlKSxGcj1lPT4oRnI9U3IuRWEpKGUpLEJyPShlLHIpPT4oQnI9U3IuRmEpKGUsciksV3I9KCk9PihXcj1Tci5HYSkoKSxOcj0oZSxyKT0+KE5yPVNyLkhhKShlLHIpLExyPWU9PihMcj1Tci5JYSkoZSksSXI9ZT0+KElyPVNyLkphKShlKSwkcj0oKT0+KCRyPVNyLkthKSgpO3JldHVybiBhLnN0YWNrU2F2ZT0oKT0+JHIoKSxhLnN0YWNrUmVzdG9yZT1lPT5McihlKSxhLnN0YWNrQWxsb2M9ZT0+SXIoZSksYS5zZXRWYWx1ZT1mdW5jdGlvbihlLHIsdD1cImk4XCIpe3N3aXRjaCh0LmVuZHNXaXRoKFwiKlwiKSYmKHQ9XCIqXCIpLHQpe2Nhc2VcImkxXCI6Y2FzZVwiaThcIjp4KClbZT4+PjBdPXI7YnJlYWs7Y2FzZVwiaTE2XCI6RigpW2U+Pj4xPj4+MF09cjticmVhaztjYXNlXCJpMzJcIjpCKClbZT4+PjI+Pj4wXT1yO2JyZWFrO2Nhc2VcImk2NFwiOlNbZT4+PjNdPUJpZ0ludChyKTticmVhaztjYXNlXCJmbG9hdFwiOk4oKVtlPj4+Mj4+PjBdPXI7YnJlYWs7Y2FzZVwiZG91YmxlXCI6TCgpW2U+Pj4zPj4+MF09cjticmVhaztjYXNlXCIqXCI6VygpW2U+Pj4yPj4+MF09cjticmVhaztkZWZhdWx0OlEoYGludmFsaWQgdHlwZSBmb3Igc2V0VmFsdWU6ICR7dH1gKX19LGEuZ2V0VmFsdWU9ZnVuY3Rpb24oZSxyPVwiaThcIil7c3dpdGNoKHIuZW5kc1dpdGgoXCIqXCIpJiYocj1cIipcIikscil7Y2FzZVwiaTFcIjpjYXNlXCJpOFwiOnJldHVybiB4KClbZT4+PjBdO2Nhc2VcImkxNlwiOnJldHVybiBGKClbZT4+PjE+Pj4wXTtjYXNlXCJpMzJcIjpyZXR1cm4gQigpW2U+Pj4yPj4+MF07Y2FzZVwiaTY0XCI6cmV0dXJuIFNbZT4+PjNdO2Nhc2VcImZsb2F0XCI6cmV0dXJuIE4oKVtlPj4+Mj4+PjBdO2Nhc2VcImRvdWJsZVwiOnJldHVybiBMKClbZT4+PjM+Pj4wXTtjYXNlXCIqXCI6cmV0dXJuIFcoKVtlPj4+Mj4+PjBdO2RlZmF1bHQ6UShgaW52YWxpZCB0eXBlIGZvciBnZXRWYWx1ZTogJHtyfWApfX0sYS5VVEY4VG9TdHJpbmc9QWUsYS5zdHJpbmdUb1VURjg9RWUsYS5sZW5ndGhCeXRlc1VURjg9ZT0+e2Zvcih2YXIgcj0wLHQ9MDt0PGUubGVuZ3RoOysrdCl7dmFyIG49ZS5jaGFyQ29kZUF0KHQpOzEyNz49bj9yKys6MjA0Nz49bj9yKz0yOjU1Mjk2PD1uJiY1NzM0Mz49bj8ocis9NCwrK3QpOnIrPTN9cmV0dXJuIHJ9LGZ1bmN0aW9uIGUoKXtpZigwPGopej1lO2Vsc2UgaWYodSl0KGEpLEcoKTtlbHNle2Zvcig7MDxaLmxlbmd0aDspWi5zaGlmdCgpKGEpOzA8aj96PWU6KGEuY2FsbGVkUnVuPSEwLFJ8fChHKCksdChhKSkpfX0oKSxhLlBUUl9TSVpFPTQsaX0pO2V4cG9ydCBkZWZhdWx0IHI7dmFyIHQ9Z2xvYmFsVGhpcy5zZWxmPy5uYW1lPy5zdGFydHNXaXRoKFwiZW0tcHRocmVhZFwiKTt0JiZyKCk7IiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgdHlwZSB7IE9ydFdhc21Nb2R1bGUgfSBmcm9tICcuL3dhc20tdHlwZXMnO1xuaW1wb3J0IHsgaXNOb2RlIH0gZnJvbSAnLi93YXNtLXV0aWxzLWVudic7XG5cbi8qKlxuICogVGhlIG9yaWdpbiBvZiB0aGUgY3VycmVudCBsb2NhdGlvbi5cbiAqXG4gKiBJbiBOb2RlLmpzLCB0aGlzIGlzIHVuZGVmaW5lZC5cbiAqL1xuY29uc3Qgb3JpZ2luID0gaXNOb2RlIHx8IHR5cGVvZiBsb2NhdGlvbiA9PT0gJ3VuZGVmaW5lZCcgPyB1bmRlZmluZWQgOiBsb2NhdGlvbi5vcmlnaW47XG5cbi8qKlxuICogU29tZSBidW5kbGVycyAoZWcuIFdlYnBhY2spIHdpbGwgcmV3cml0ZSBgaW1wb3J0Lm1ldGEudXJsYCB0byBhIGZpbGUgVVJMIGF0IGNvbXBpbGUgdGltZS5cbiAqXG4gKiBUaGlzIGZ1bmN0aW9uIGNoZWNrcyBpZiBgaW1wb3J0Lm1ldGEudXJsYCBzdGFydHMgd2l0aCBgZmlsZTpgLCBidXQgdXNpbmcgdGhlIGA+YCBhbmQgYDxgIG9wZXJhdG9ycyBpbnN0ZWFkIG9mXG4gKiBgc3RhcnRzV2l0aGAgZnVuY3Rpb24gc28gdGhhdCBjb2RlIG1pbmltaXplcnMgY2FuIHJlbW92ZSB0aGUgZGVhZCBjb2RlIGNvcnJlY3RseS5cbiAqXG4gKiBGb3IgZXhhbXBsZSwgaWYgd2UgdXNlIHRlcnNlciB0byBtaW5pZnkgdGhlIGZvbGxvd2luZyBjb2RlOlxuICogYGBganNcbiAqIGlmIChcImZpbGU6Ly9oYXJkLWNvZGVkLWZpbGVuYW1lXCIuc3RhcnRzV2l0aChcImZpbGU6XCIpKSB7XG4gKiAgIGNvbnNvbGUubG9nKDEpXG4gKiB9IGVsc2Uge1xuICogICBjb25zb2xlLmxvZygyKVxuICogfVxuICpcbiAqIGlmIChcImZpbGU6Ly9oYXJkLWNvZGVkLWZpbGVuYW1lXCIgPiBcImZpbGU6XCIgJiYgXCJmaWxlOi8vaGFyZC1jb2RlZC1maWxlbmFtZVwiIDwgXCJmaWxlO1wiKSB7XG4gKiAgIGNvbnNvbGUubG9nKDMpXG4gKiB9IGVsc2Uge1xuICogICBjb25zb2xlLmxvZyg0KVxuICogfVxuICogYGBgXG4gKlxuICogVGhlIG1pbmlmaWVkIGNvZGUgd2lsbCBiZTpcbiAqIGBgYGpzXG4gKiBcImZpbGU6Ly9oYXJkLWNvZGVkLWZpbGVuYW1lXCIuc3RhcnRzV2l0aChcImZpbGU6XCIpP2NvbnNvbGUubG9nKDEpOmNvbnNvbGUubG9nKDIpLGNvbnNvbGUubG9nKDMpO1xuICogYGBgXG4gKlxuICogKHVzZSBUZXJzZXIgNS4zOS4wIHdpdGggZGVmYXVsdCBvcHRpb25zLCBodHRwczovL3RyeS50ZXJzZXIub3JnLylcbiAqXG4gKiBAcmV0dXJucyB0cnVlIGlmIHRoZSBpbXBvcnQubWV0YS51cmwgaXMgaGFyZGNvZGVkIGFzIGEgZmlsZSBVUkkuXG4gKi9cbmV4cG9ydCBjb25zdCBpc0VzbUltcG9ydE1ldGFVcmxIYXJkY29kZWRBc0ZpbGVVcmkgPVxuICBCVUlMRF9ERUZTLklTX0VTTSAmJiBCVUlMRF9ERUZTLkVTTV9JTVBPUlRfTUVUQV9VUkwhID4gJ2ZpbGU6JyAmJiBCVUlMRF9ERUZTLkVTTV9JTVBPUlRfTUVUQV9VUkwhIDwgJ2ZpbGU7JztcblxuY29uc3QgZ2V0U2NyaXB0U3JjID0gKCk6IHN0cmluZyB8IHVuZGVmaW5lZCA9PiB7XG4gIC8vIGlmIE5vZGVqcywgcmV0dXJuIHVuZGVmaW5lZFxuICBpZiAoaXNOb2RlKSB7XG4gICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgfVxuICAvLyBpZiBJdCdzIEVTTSwgdXNlIGltcG9ydC5tZXRhLnVybFxuICBpZiAoQlVJTERfREVGUy5JU19FU00pIHtcbiAgICAvLyBGb3IgRVNNLCBpZiB0aGUgaW1wb3J0Lm1ldGEudXJsIGlzIGEgZmlsZSBVUkwsIHRoaXMgdXN1YWxseSBtZWFucyB0aGUgYnVuZGxlciByZXdyaXRlcyBgaW1wb3J0Lm1ldGEudXJsYCB0b1xuICAgIC8vIHRoZSBmaWxlIHBhdGggYXQgY29tcGlsZSB0aW1lLiBJbiB0aGlzIGNhc2UsIHRoaXMgZmlsZSBwYXRoIGNhbm5vdCBiZSB1c2VkIHRvIGRldGVybWluZSB0aGUgcnVudGltZSBVUkwuXG4gICAgLy9cbiAgICAvLyBXZSBuZWVkIHRvIHVzZSB0aGUgVVJMIGNvbnN0cnVjdG9yIGxpa2UgdGhpczpcbiAgICAvLyBgYGBqc1xuICAgIC8vIG5ldyBVUkwoJ2FjdHVhbC1idW5kbGUtbmFtZS5qcycsIGltcG9ydC5tZXRhLnVybCkuaHJlZlxuICAgIC8vIGBgYFxuICAgIC8vIFNvIHRoYXQgYnVuZGxlciBjYW4gcHJlcHJvY2VzcyB0aGUgVVJMIGNvcnJlY3RseS5cbiAgICBpZiAoaXNFc21JbXBvcnRNZXRhVXJsSGFyZGNvZGVkQXNGaWxlVXJpKSB7XG4gICAgICAvLyBpZiB0aGUgcmV3cml0dGVuIFVSTCBpcyBhIHJlbGF0aXZlIHBhdGgsIHdlIG5lZWQgdG8gdXNlIHRoZSBvcmlnaW4gdG8gcmVzb2x2ZSB0aGUgVVJMLlxuXG4gICAgICAvLyBUaGUgZm9sbG93aW5nIGlzIGEgd29ya2Fyb3VuZCBmb3IgVml0ZS5cbiAgICAgIC8vXG4gICAgICAvLyBWaXRlIHVzZXMgYSBidW5kbGVyKHJvbGx1cC9yb2xsZG93bikgdGhhdCBkb2VzIG5vdCByZXdyaXRlIGBpbXBvcnQubWV0YS51cmxgIHRvIGEgZmlsZSBVUkwuIFNvIGluIHRoZW9yeSwgdGhpc1xuICAgICAgLy8gY29kZSBwYXRoIHNob3VsZCBub3QgYmUgZXhlY3V0ZWQgaW4gVml0ZS4gSG93ZXZlciwgdGhlIGJ1bmRsZXIgZG9lcyBub3Qga25vdyBpdCBhbmQgaXQgc3RpbGwgdHJ5IHRvIGxvYWQgdGhlXG4gICAgICAvLyBmb2xsb3dpbmcgcGF0dGVybjpcbiAgICAgIC8vIC0gYHJldHVybiBuZXcgVVJMKCdmaWxlbmFtZScsIGltcG9ydC5tZXRhLnVybCkuaHJlZmBcbiAgICAgIC8vXG4gICAgICAvLyBCeSByZXBsYWNpbmcgdGhlIHBhdHRlcm4gYWJvdmUgd2l0aCB0aGUgZm9sbG93aW5nIGNvZGUsIHdlIGNhbiBza2lwIHRoZSByZXNvdXJjZSBsb2FkaW5nIGJlaGF2aW9yOlxuICAgICAgLy8gLSBgY29uc3QgVVJMMiA9IFVSTDsgcmV0dXJuIG5ldyBVUkwyKCdmaWxlbmFtZScsIGltcG9ydC5tZXRhLnVybCkuaHJlZjtgXG4gICAgICAvL1xuICAgICAgLy8gQW5kIGl0IHN0aWxsIHdvcmtzIGluIFdlYnBhY2suXG4gICAgICBjb25zdCBVUkwyID0gVVJMO1xuICAgICAgcmV0dXJuIG5ldyBVUkwobmV3IFVSTDIoQlVJTERfREVGUy5CVU5ETEVfRklMRU5BTUUsIEJVSUxEX0RFRlMuRVNNX0lNUE9SVF9NRVRBX1VSTCkuaHJlZiwgb3JpZ2luKS5ocmVmO1xuICAgIH1cblxuICAgIHJldHVybiBCVUlMRF9ERUZTLkVTTV9JTVBPUlRfTUVUQV9VUkw7XG4gIH1cblxuICByZXR1cm4gdHlwZW9mIGRvY3VtZW50ICE9PSAndW5kZWZpbmVkJ1xuICAgID8gKGRvY3VtZW50LmN1cnJlbnRTY3JpcHQgYXMgSFRNTFNjcmlwdEVsZW1lbnQpPy5zcmNcbiAgICA6IC8vIHVzZSBgc2VsZi5sb2NhdGlvbi5ocmVmYCBpZiBhdmFpbGFibGVcbiAgICAgIHR5cGVvZiBzZWxmICE9PSAndW5kZWZpbmVkJ1xuICAgICAgPyBzZWxmLmxvY2F0aW9uPy5ocmVmXG4gICAgICA6IHVuZGVmaW5lZDtcbn07XG5cbi8qKlxuICogVGhlIGNsYXNzaWMgc2NyaXB0IHNvdXJjZSBVUkwuIFRoaXMgaXMgbm90IGFsd2F5cyBhdmFpbGFibGUgaW4gbm9uIEVTTW9kdWxlIGVudmlyb25tZW50cy5cbiAqXG4gKiBJbiBOb2RlLmpzLCB0aGlzIGlzIHVuZGVmaW5lZC5cbiAqL1xuZXhwb3J0IGNvbnN0IHNjcmlwdFNyYyA9IGdldFNjcmlwdFNyYygpO1xuXG4vKipcbiAqIEluZmVyIHRoZSB3YXNtIHBhdGggcHJlZml4IGZyb20gdGhlIHNjcmlwdCBzb3VyY2UgVVJMLlxuICpcbiAqIEByZXR1cm5zIFRoZSBpbmZlcnJlZCB3YXNtIHBhdGggcHJlZml4LCBvciB1bmRlZmluZWQgaWYgdGhlIHNjcmlwdCBzb3VyY2UgVVJMIGlzIG5vdCBhdmFpbGFibGUgb3IgaXMgYSBibG9iIFVSTC5cbiAqL1xuZXhwb3J0IGNvbnN0IGluZmVyV2FzbVBhdGhQcmVmaXhGcm9tU2NyaXB0U3JjID0gKCk6IHN0cmluZyB8IHVuZGVmaW5lZCA9PiB7XG4gIGlmIChzY3JpcHRTcmMgJiYgIXNjcmlwdFNyYy5zdGFydHNXaXRoKCdibG9iOicpKSB7XG4gICAgcmV0dXJuIHNjcmlwdFNyYy5zdWJzdHJpbmcoMCwgc2NyaXB0U3JjLmxhc3RJbmRleE9mKCcvJykgKyAxKTtcbiAgfVxuICByZXR1cm4gdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBDaGVjayBpZiB0aGUgZ2l2ZW4gZmlsZW5hbWUgd2l0aCBwcmVmaXggaXMgZnJvbSB0aGUgc2FtZSBvcmlnaW4uXG4gKi9cbmNvbnN0IGlzU2FtZU9yaWdpbiA9IChmaWxlbmFtZTogc3RyaW5nLCBwcmVmaXhPdmVycmlkZT86IHN0cmluZykgPT4ge1xuICB0cnkge1xuICAgIGNvbnN0IGJhc2VVcmwgPSBwcmVmaXhPdmVycmlkZSA/PyBzY3JpcHRTcmM7XG4gICAgY29uc3QgdXJsID0gYmFzZVVybCA/IG5ldyBVUkwoZmlsZW5hbWUsIGJhc2VVcmwpIDogbmV3IFVSTChmaWxlbmFtZSk7XG4gICAgcmV0dXJuIHVybC5vcmlnaW4gPT09IG9yaWdpbjtcbiAgfSBjYXRjaCB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG4vKipcbiAqIE5vcm1hbGl6ZSB0aGUgaW5wdXRzIHRvIGFuIGFic29sdXRlIFVSTCB3aXRoIHRoZSBnaXZlbiBwcmVmaXggb3ZlcnJpZGUuIElmIGZhaWxlZCwgcmV0dXJuIHVuZGVmaW5lZC5cbiAqL1xuY29uc3Qgbm9ybWFsaXplVXJsID0gKGZpbGVuYW1lOiBzdHJpbmcsIHByZWZpeE92ZXJyaWRlPzogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IGJhc2VVcmwgPSBwcmVmaXhPdmVycmlkZSA/PyBzY3JpcHRTcmM7XG4gIHRyeSB7XG4gICAgY29uc3QgdXJsID0gYmFzZVVybCA/IG5ldyBVUkwoZmlsZW5hbWUsIGJhc2VVcmwpIDogbmV3IFVSTChmaWxlbmFtZSk7XG4gICAgcmV0dXJuIHVybC5ocmVmO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gdW5kZWZpbmVkO1xuICB9XG59O1xuXG4vKipcbiAqIENyZWF0ZSBhIGZhbGxiYWNrIFVSTCBpZiBhbiBhYnNvbHV0ZSBVUkwgY2Fubm90IGJlIGNyZWF0ZWQgYnkgdGhlIG5vcm1hbGl6ZVVybCBmdW5jdGlvbi5cbiAqL1xuY29uc3QgZmFsbGJhY2tVcmwgPSAoZmlsZW5hbWU6IHN0cmluZywgcHJlZml4T3ZlcnJpZGU/OiBzdHJpbmcpID0+IGAke3ByZWZpeE92ZXJyaWRlID8/ICcuLyd9JHtmaWxlbmFtZX1gO1xuXG4vKipcbiAqIFRoaXMgaGVscGVyIGZ1bmN0aW9uIGlzIHVzZWQgdG8gcHJlbG9hZCBhIG1vZHVsZSBmcm9tIGEgVVJMLlxuICpcbiAqIElmIHRoZSBvcmlnaW4gb2YgdGhlIHdvcmtlciBVUkwgaXMgZGlmZmVyZW50IGZyb20gdGhlIGN1cnJlbnQgb3JpZ2luLCB0aGUgd29ya2VyIGNhbm5vdCBiZSBsb2FkZWQgZGlyZWN0bHkuXG4gKiBTZWUgZGlzY3Vzc2lvbnMgaW4gaHR0cHM6Ly9naXRodWIuY29tL3dlYnBhY2stY29udHJpYi93b3JrZXItbG9hZGVyL2lzc3Vlcy8xNTRcbiAqXG4gKiBJbiB0aGlzIGNhc2UsIHdlIHdpbGwgZmV0Y2ggdGhlIHdvcmtlciBVUkwgYW5kIGNyZWF0ZSBhIG5ldyBCbG9iIFVSTCB3aXRoIHRoZSBzYW1lIG9yaWdpbiBhcyBhIHdvcmthcm91bmQuXG4gKlxuICogQHBhcmFtIGFic29sdXRlVXJsIC0gVGhlIGFic29sdXRlIFVSTCB0byBwcmVsb2FkLlxuICpcbiAqIEByZXR1cm5zIC0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSBuZXcgQmxvYiBVUkxcbiAqL1xuY29uc3QgcHJlbG9hZCA9IGFzeW5jIChhYnNvbHV0ZVVybDogc3RyaW5nKTogUHJvbWlzZTxzdHJpbmc+ID0+IHtcbiAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChhYnNvbHV0ZVVybCwgeyBjcmVkZW50aWFsczogJ3NhbWUtb3JpZ2luJyB9KTtcbiAgY29uc3QgYmxvYiA9IGF3YWl0IHJlc3BvbnNlLmJsb2IoKTtcbiAgcmV0dXJuIFVSTC5jcmVhdGVPYmplY3RVUkwoYmxvYik7XG59O1xuXG4vKipcbiAqIFRoaXMgaGVscGVyIGZ1bmN0aW9uIGlzIHVzZWQgdG8gZHluYW1pY2FsbHkgaW1wb3J0IGEgbW9kdWxlIGZyb20gYSBVUkwuXG4gKlxuICogVGhlIGJ1aWxkIHNjcmlwdCBoYXMgc3BlY2lhbCBoYW5kbGluZyBmb3IgdGhpcyBmdW5jdGlvbiB0byBlbnN1cmUgdGhhdCB0aGUgVVJMIGlzIG5vdCBidW5kbGVkIGludG8gdGhlIGZpbmFsIG91dHB1dC5cbiAqXG4gKiBAcGFyYW0gdXJsIC0gVGhlIFVSTCB0byBpbXBvcnQuXG4gKlxuICogQHJldHVybnMgLSBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byB0aGUgZGVmYXVsdCBleHBvcnQgb2YgdGhlIG1vZHVsZS5cbiAqL1xuY29uc3QgZHluYW1pY0ltcG9ydERlZmF1bHQgPSBhc3luYyA8VD4odXJsOiBzdHJpbmcpOiBQcm9taXNlPFQ+ID0+XG4gIChhd2FpdCBpbXBvcnQoLyogd2VicGFja0lnbm9yZTogdHJ1ZSAqLyB1cmwpKS5kZWZhdWx0O1xuXG4vKipcbiAqIFRoZSBwcm94eSB3b3JrZXIgZmFjdG9yeSBpbXBvcnRlZCBmcm9tIHRoZSBwcm94eSB3b3JrZXIgbW9kdWxlLlxuICpcbiAqIFRoaXMgaXMgb25seSBhdmFpbGFibGUgd2hlbiB0aGUgV2ViQXNzZW1ibHkgcHJveHkgaXMgbm90IGRpc2FibGVkLlxuICovXG5jb25zdCBjcmVhdGVQcm94eVdvcmtlcjogKCh1cmxPdmVycmlkZT86IHN0cmluZykgPT4gV29ya2VyKSB8IHVuZGVmaW5lZCA9XG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tdmFyLXJlcXVpcmVzXG4gIEJVSUxEX0RFRlMuRElTQUJMRV9XQVNNX1BST1hZID8gdW5kZWZpbmVkIDogcmVxdWlyZSgnLi9wcm94eS13b3JrZXIvbWFpbicpLmRlZmF1bHQ7XG5cbi8qKlxuICogSW1wb3J0IHRoZSBwcm94eSB3b3JrZXIuXG4gKlxuICogVGhpcyBmdW5jdGlvbiB3aWxsIHBlcmZvcm0gdGhlIGZvbGxvd2luZyBzdGVwczpcbiAqIDEuIElmIGEgcHJlbG9hZCBpcyBuZWVkZWQsIGl0IHdpbGwgcHJlbG9hZCB0aGUgbW9kdWxlIGFuZCByZXR1cm4gdGhlIG9iamVjdCBVUkwuXG4gKiAyLiBVc2UgdGhlIHByb3h5IHdvcmtlciBmYWN0b3J5IHRvIGNyZWF0ZSB0aGUgcHJveHkgd29ya2VyLlxuICpcbiAqIEByZXR1cm5zIC0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSB0dXBsZSBvZiAyIGVsZW1lbnRzOlxuICogICAgICAgICAgICAtIFRoZSBvYmplY3QgVVJMIG9mIHRoZSBwcmVsb2FkZWQgbW9kdWxlLCBvciB1bmRlZmluZWQgaWYgbm8gcHJlbG9hZCBpcyBuZWVkZWQuXG4gKiAgICAgICAgICAgIC0gVGhlIHByb3h5IHdvcmtlci5cbiAqL1xuZXhwb3J0IGNvbnN0IGltcG9ydFByb3h5V29ya2VyID0gYXN5bmMgKCk6IFByb21pc2U8W3VuZGVmaW5lZCB8IHN0cmluZywgV29ya2VyXT4gPT4ge1xuICBpZiAoIXNjcmlwdFNyYykge1xuICAgIHRocm93IG5ldyBFcnJvcignRmFpbGVkIHRvIGxvYWQgcHJveHkgd29ya2VyOiBjYW5ub3QgZGV0ZXJtaW5lIHRoZSBzY3JpcHQgc291cmNlIFVSTC4nKTtcbiAgfVxuXG4gIC8vIElmIHRoZSBzY3JpcHQgc291cmNlIGlzIGZyb20gdGhlIHNhbWUgb3JpZ2luLCB3ZSBjYW4gdXNlIHRoZSBlbWJlZGRlZCBwcm94eSBtb2R1bGUgZGlyZWN0bHkuXG4gIGlmIChpc1NhbWVPcmlnaW4oc2NyaXB0U3JjKSkge1xuICAgIHJldHVybiBbdW5kZWZpbmVkLCBjcmVhdGVQcm94eVdvcmtlciEoKV07XG4gIH1cblxuICAvLyBPdGhlcndpc2UsIG5lZWQgdG8gcHJlbG9hZFxuICBjb25zdCB1cmwgPSBhd2FpdCBwcmVsb2FkKHNjcmlwdFNyYyk7XG4gIHJldHVybiBbdXJsLCBjcmVhdGVQcm94eVdvcmtlciEodXJsKV07XG59O1xuXG4vKipcbiAqIFRoZSBlbWJlZGRlZCBXZWJBc3NlbWJseSBtb2R1bGUuXG4gKlxuICogVGhpcyBpcyBvbmx5IGF2YWlsYWJsZSBpbiBFU00gYW5kIHdoZW4gZW1iZWRkaW5nIGlzIG5vdCBkaXNhYmxlZC5cbiAqL1xuY29uc3QgZW1iZWRkZWRXYXNtTW9kdWxlOiBFbXNjcmlwdGVuTW9kdWxlRmFjdG9yeTxPcnRXYXNtTW9kdWxlPiB8IHVuZGVmaW5lZCA9XG4gIEJVSUxEX0RFRlMuSVNfRVNNICYmIEJVSUxEX0RFRlMuRU5BQkxFX0JVTkRMRV9XQVNNX0pTXG4gICAgPyAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0cywgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuICAgICAgcmVxdWlyZShcbiAgICAgICAgIUJVSUxEX0RFRlMuRElTQUJMRV9KU0VQXG4gICAgICAgICAgPyAnLi4vLi4vZGlzdC9vcnQtd2FzbS1zaW1kLXRocmVhZGVkLmpzZXAubWpzJ1xuICAgICAgICAgIDogJy4uLy4uL2Rpc3Qvb3J0LXdhc20tc2ltZC10aHJlYWRlZC5tanMnLFxuICAgICAgKS5kZWZhdWx0XG4gICAgOiB1bmRlZmluZWQ7XG5cbi8qKlxuICogSW1wb3J0IHRoZSBXZWJBc3NlbWJseSBtb2R1bGUuXG4gKlxuICogVGhpcyBmdW5jdGlvbiB3aWxsIHBlcmZvcm0gdGhlIGZvbGxvd2luZyBzdGVwczpcbiAqIDEuIElmIHRoZSBlbWJlZGRlZCBtb2R1bGUgZXhpc3RzIGFuZCBubyBjdXN0b20gVVJMIGlzIHNwZWNpZmllZCwgdXNlIHRoZSBlbWJlZGRlZCBtb2R1bGUuXG4gKiAyLiBJZiBhIHByZWxvYWQgaXMgbmVlZGVkLCBpdCB3aWxsIHByZWxvYWQgdGhlIG1vZHVsZSBhbmQgcmV0dXJuIHRoZSBvYmplY3QgVVJMLlxuICogMy4gT3RoZXJ3aXNlLCBpdCB3aWxsIHBlcmZvcm0gYSBkeW5hbWljIGltcG9ydCBvZiB0aGUgbW9kdWxlLlxuICpcbiAqIEByZXR1cm5zIC0gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSB0dXBsZSBvZiAyIGVsZW1lbnRzOlxuICogICAgICAgICAgICAtIFRoZSBvYmplY3QgVVJMIG9mIHRoZSBwcmVsb2FkZWQgbW9kdWxlLCBvciB1bmRlZmluZWQgaWYgbm8gcHJlbG9hZCBpcyBuZWVkZWQuXG4gKiAgICAgICAgICAgIC0gVGhlIGRlZmF1bHQgZXhwb3J0IG9mIHRoZSBtb2R1bGUsIHdoaWNoIGlzIGEgZmFjdG9yeSBmdW5jdGlvbiB0byBjcmVhdGUgdGhlIFdlYkFzc2VtYmx5IG1vZHVsZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGltcG9ydFdhc21Nb2R1bGUgPSBhc3luYyAoXG4gIHVybE92ZXJyaWRlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gIHByZWZpeE92ZXJyaWRlOiBzdHJpbmcgfCB1bmRlZmluZWQsXG4gIGlzTXVsdGlUaHJlYWRlZDogYm9vbGVhbixcbik6IFByb21pc2U8W3VuZGVmaW5lZCB8IHN0cmluZywgRW1zY3JpcHRlbk1vZHVsZUZhY3Rvcnk8T3J0V2FzbU1vZHVsZT5dPiA9PiB7XG4gIGlmICghdXJsT3ZlcnJpZGUgJiYgIXByZWZpeE92ZXJyaWRlICYmIGVtYmVkZGVkV2FzbU1vZHVsZSAmJiBzY3JpcHRTcmMgJiYgaXNTYW1lT3JpZ2luKHNjcmlwdFNyYykpIHtcbiAgICByZXR1cm4gW3VuZGVmaW5lZCwgZW1iZWRkZWRXYXNtTW9kdWxlXTtcbiAgfSBlbHNlIHtcbiAgICBjb25zdCB3YXNtTW9kdWxlRmlsZW5hbWUgPSAhQlVJTERfREVGUy5ESVNBQkxFX0pTRVBcbiAgICAgID8gJ29ydC13YXNtLXNpbWQtdGhyZWFkZWQuanNlcC5tanMnXG4gICAgICA6ICdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLm1qcyc7XG4gICAgY29uc3Qgd2FzbU1vZHVsZVVybCA9IHVybE92ZXJyaWRlID8/IG5vcm1hbGl6ZVVybCh3YXNtTW9kdWxlRmlsZW5hbWUsIHByZWZpeE92ZXJyaWRlKTtcbiAgICAvLyBuZWVkIHRvIHByZWxvYWQgaWYgYWxsIG9mIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9ucyBhcmUgbWV0OlxuICAgIC8vIDEuIG5vdCBpbiBOb2RlLmpzLlxuICAgIC8vICAgIC0gTm9kZS5qcyBkb2VzIG5vdCBoYXZlIHRoZSBzYW1lIG9yaWdpbiBwb2xpY3kgZm9yIGNyZWF0aW5nIHdvcmtlcnMuXG4gICAgLy8gMi4gbXVsdGktdGhyZWFkZWQgaXMgZW5hYmxlZC5cbiAgICAvLyAgICAtIElmIG11bHRpLXRocmVhZGVkIGlzIGRpc2FibGVkLCBubyB3b3JrZXIgd2lsbCBiZSBjcmVhdGVkLiBTbyB3ZSBkb24ndCBuZWVkIHRvIHByZWxvYWQgdGhlIG1vZHVsZS5cbiAgICAvLyAzLiB0aGUgYWJzb2x1dGUgVVJMIGlzIGF2YWlsYWJsZS5cbiAgICAvLyAgICAtIElmIHRoZSBhYnNvbHV0ZSBVUkwgaXMgZmFpbGVkIHRvIGJlIGNyZWF0ZWQsIHRoZSBvcmlnaW4gY2Fubm90IGJlIGRldGVybWluZWQuIEluIHRoaXMgY2FzZSwgd2Ugd2lsbCBub3RcbiAgICAvLyAgICBwcmVsb2FkIHRoZSBtb2R1bGUuXG4gICAgLy8gNC4gdGhlIHdvcmtlciBVUkwgaXMgbm90IGZyb20gdGhlIHNhbWUgb3JpZ2luLlxuICAgIC8vICAgIC0gSWYgdGhlIHdvcmtlciBVUkwgaXMgZnJvbSB0aGUgc2FtZSBvcmlnaW4sIHdlIGNhbiBjcmVhdGUgdGhlIHdvcmtlciBkaXJlY3RseS5cbiAgICBjb25zdCBuZWVkUHJlbG9hZCA9ICFpc05vZGUgJiYgaXNNdWx0aVRocmVhZGVkICYmIHdhc21Nb2R1bGVVcmwgJiYgIWlzU2FtZU9yaWdpbih3YXNtTW9kdWxlVXJsLCBwcmVmaXhPdmVycmlkZSk7XG4gICAgY29uc3QgdXJsID0gbmVlZFByZWxvYWRcbiAgICAgID8gYXdhaXQgcHJlbG9hZCh3YXNtTW9kdWxlVXJsKVxuICAgICAgOiAod2FzbU1vZHVsZVVybCA/PyBmYWxsYmFja1VybCh3YXNtTW9kdWxlRmlsZW5hbWUsIHByZWZpeE92ZXJyaWRlKSk7XG4gICAgcmV0dXJuIFtuZWVkUHJlbG9hZCA/IHVybCA6IHVuZGVmaW5lZCwgYXdhaXQgZHluYW1pY0ltcG9ydERlZmF1bHQ8RW1zY3JpcHRlbk1vZHVsZUZhY3Rvcnk8T3J0V2FzbU1vZHVsZT4+KHVybCldO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgeyBFbnYgfSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQgdHlwZSB7IE9ydFdhc21Nb2R1bGUgfSBmcm9tICcuL3dhc20tdHlwZXMnO1xuaW1wb3J0IHsgaW1wb3J0V2FzbU1vZHVsZSwgaW5mZXJXYXNtUGF0aFByZWZpeEZyb21TY3JpcHRTcmMgfSBmcm9tICcuL3dhc20tdXRpbHMtaW1wb3J0JztcblxubGV0IHdhc206IE9ydFdhc21Nb2R1bGUgfCB1bmRlZmluZWQ7XG5sZXQgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcbmxldCBpbml0aWFsaXppbmcgPSBmYWxzZTtcbmxldCBhYm9ydGVkID0gZmFsc2U7XG5cbmNvbnN0IGlzTXVsdGlUaHJlYWRTdXBwb3J0ZWQgPSAoKTogYm9vbGVhbiA9PiB7XG4gIC8vIElmICdTaGFyZWRBcnJheUJ1ZmZlcicgaXMgbm90IGF2YWlsYWJsZSwgV2ViQXNzZW1ibHkgdGhyZWFkcyB3aWxsIG5vdCB3b3JrLlxuICBpZiAodHlwZW9mIFNoYXJlZEFycmF5QnVmZmVyID09PSAndW5kZWZpbmVkJykge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHRyeSB7XG4gICAgLy8gVGVzdCBmb3IgdHJhbnNmZXJhYmlsaXR5IG9mIFNBQnMgKGZvciBicm93c2Vycy4gbmVlZGVkIGZvciBGaXJlZm94KVxuICAgIC8vIGh0dHBzOi8vZ3JvdXBzLmdvb2dsZS5jb20vZm9ydW0vIyFtc2cvbW96aWxsYS5kZXYucGxhdGZvcm0vSUhrQlpsSEVUcEEvZHdzTU5jaFdFUUFKXG4gICAgaWYgKHR5cGVvZiBNZXNzYWdlQ2hhbm5lbCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgIG5ldyBNZXNzYWdlQ2hhbm5lbCgpLnBvcnQxLnBvc3RNZXNzYWdlKG5ldyBTaGFyZWRBcnJheUJ1ZmZlcigxKSk7XG4gICAgfVxuXG4gICAgLy8gVGVzdCBmb3IgV2ViQXNzZW1ibHkgdGhyZWFkcyBjYXBhYmlsaXR5IChmb3IgYm90aCBicm93c2VycyBhbmQgTm9kZS5qcylcbiAgICAvLyBUaGlzIHR5cGVkIGFycmF5IGlzIGEgV2ViQXNzZW1ibHkgcHJvZ3JhbSBjb250YWluaW5nIHRocmVhZGVkIGluc3RydWN0aW9ucy5cbiAgICByZXR1cm4gV2ViQXNzZW1ibHkudmFsaWRhdGUoXG4gICAgICBuZXcgVWludDhBcnJheShbXG4gICAgICAgIDAsIDk3LCAxMTUsIDEwOSwgMSwgMCwgMCwgMCwgMSwgNCwgMSwgOTYsIDAsIDAsIDMsIDIsIDEsIDAsIDUsIDQsIDEsIDMsIDEsIDEsIDEwLCAxMSwgMSwgOSwgMCwgNjUsIDAsIDI1NCwgMTYsXG4gICAgICAgIDIsIDAsIDI2LCAxMSxcbiAgICAgIF0pLFxuICAgICk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IGlzU2ltZFN1cHBvcnRlZCA9ICgpOiBib29sZWFuID0+IHtcbiAgdHJ5IHtcbiAgICAvLyBUZXN0IGZvciBXZWJBc3NlbWJseSBTSU1EIGNhcGFiaWxpdHkgKGZvciBib3RoIGJyb3dzZXJzIGFuZCBOb2RlLmpzKVxuICAgIC8vIFRoaXMgdHlwZWQgYXJyYXkgaXMgYSBXZWJBc3NlbWJseSBwcm9ncmFtIGNvbnRhaW5pbmcgU0lNRCBpbnN0cnVjdGlvbnMuXG5cbiAgICAvLyBUaGUgYmluYXJ5IGRhdGEgaXMgZ2VuZXJhdGVkIGZyb20gdGhlIGZvbGxvd2luZyBjb2RlIGJ5IHdhdDJ3YXNtOlxuICAgIC8vXG4gICAgLy8gKG1vZHVsZVxuICAgIC8vICAgKHR5cGUgJHQwIChmdW5jKSlcbiAgICAvLyAgIChmdW5jICRmMCAodHlwZSAkdDApXG4gICAgLy8gICAgIChkcm9wXG4gICAgLy8gICAgICAgKGkzMng0LmRvdF9pMTZ4OF9zXG4gICAgLy8gICAgICAgICAoaTh4MTYuc3BsYXRcbiAgICAvLyAgICAgICAgICAgKGkzMi5jb25zdCAwKSlcbiAgICAvLyAgICAgICAgICh2MTI4LmNvbnN0IGkzMng0IDB4MDAwMDAwMDAgMHgwMDAwMDAwMCAweDAwMDAwMDAwIDB4MDAwMDAwMDApKSkpKVxuXG4gICAgcmV0dXJuIFdlYkFzc2VtYmx5LnZhbGlkYXRlKFxuICAgICAgbmV3IFVpbnQ4QXJyYXkoW1xuICAgICAgICAwLCA5NywgMTE1LCAxMDksIDEsIDAsIDAsIDAsIDEsIDQsIDEsIDk2LCAwLCAwLCAzLCAyLCAxLCAwLCAxMCwgMzAsIDEsIDI4LCAwLCA2NSwgMCwgMjUzLCAxNSwgMjUzLCAxMiwgMCwgMCwgMCxcbiAgICAgICAgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMCwgMjUzLCAxODYsIDEsIDI2LCAxMSxcbiAgICAgIF0pLFxuICAgICk7XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICByZXR1cm4gZmFsc2U7XG4gIH1cbn07XG5cbmNvbnN0IGlzUmVsYXhlZFNpbWRTdXBwb3J0ZWQgPSAoKTogYm9vbGVhbiA9PiB7XG4gIHRyeSB7XG4gICAgLy8gVGVzdCBmb3IgV2ViQXNzZW1ibHkgUmVsYXhlZCBTSU1EIGNhcGFiaWxpdHkgKGZvciBib3RoIGJyb3dzZXJzIGFuZCBOb2RlLmpzKVxuICAgIC8vIFRoaXMgdHlwZWQgYXJyYXkgaXMgYSBXZWJBc3NlbWJseSBwcm9ncmFtIGNvbnRhaW5pbmcgUmVsYXhlZCBTSU1EIGluc3RydWN0aW9ucy5cblxuICAgIC8vIFRoZSBiaW5hcnkgZGF0YSBpcyBnZW5lcmF0ZWQgZnJvbSB0aGUgZm9sbG93aW5nIGNvZGUgYnkgd2F0Mndhc206XG4gICAgLy8gKG1vZHVsZVxuICAgIC8vICAgKGZ1bmMgKHJlc3VsdCB2MTI4KVxuICAgIC8vICAgICAgaTMyLmNvbnN0IDFcbiAgICAvLyAgICAgIGk4eDE2LnNwbGF0XG4gICAgLy8gICAgICBpMzIuY29uc3QgMlxuICAgIC8vICAgICAgaTh4MTYuc3BsYXRcbiAgICAvLyAgICAgIGkzMi5jb25zdCAzXG4gICAgLy8gICAgICBpOHgxNi5zcGxhdFxuICAgIC8vICAgICAgaTMyeDQucmVsYXhlZF9kb3RfaTh4MTZfaTd4MTZfYWRkX3NcbiAgICAvLyAgIClcbiAgICAvLyAgKVxuICAgIHJldHVybiBXZWJBc3NlbWJseS52YWxpZGF0ZShcbiAgICAgIG5ldyBVaW50OEFycmF5KFtcbiAgICAgICAgMCwgOTcsIDExNSwgMTA5LCAxLCAwLCAwLCAwLCAxLCA1LCAxLCA5NiwgMCwgMSwgMTIzLCAzLCAyLCAxLCAwLCAxMCwgMTksIDEsIDE3LCAwLCA2NSwgMSwgMjUzLCAxNSwgNjUsIDIsIDI1MyxcbiAgICAgICAgMTUsIDY1LCAzLCAyNTMsIDE1LCAyNTMsIDE0NywgMiwgMTEsXG4gICAgICBdKSxcbiAgICApO1xuICB9IGNhdGNoIChlKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgaW5pdGlhbGl6ZVdlYkFzc2VtYmx5ID0gYXN5bmMgKGZsYWdzOiBFbnYuV2ViQXNzZW1ibHlGbGFncyk6IFByb21pc2U8dm9pZD4gPT4ge1xuICBpZiAoaW5pdGlhbGl6ZWQpIHtcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XG4gIH1cbiAgaWYgKGluaXRpYWxpemluZykge1xuICAgIHRocm93IG5ldyBFcnJvcihcIm11bHRpcGxlIGNhbGxzIHRvICdpbml0aWFsaXplV2ViQXNzZW1ibHkoKScgZGV0ZWN0ZWQuXCIpO1xuICB9XG4gIGlmIChhYm9ydGVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwicHJldmlvdXMgY2FsbCB0byAnaW5pdGlhbGl6ZVdlYkFzc2VtYmx5KCknIGZhaWxlZC5cIik7XG4gIH1cblxuICBpbml0aWFsaXppbmcgPSB0cnVlO1xuXG4gIC8vIHdhc20gZmxhZ3MgYXJlIGFscmVhZHkgaW5pdGlhbGl6ZWRcbiAgY29uc3QgdGltZW91dCA9IGZsYWdzLmluaXRUaW1lb3V0ITtcbiAgbGV0IG51bVRocmVhZHMgPSBmbGFncy5udW1UaHJlYWRzITtcblxuICAvLyBlbnN1cmUgU0lNRCBpcyBzdXBwb3J0ZWRcbiAgaWYgKGZsYWdzLnNpbWQgPT09IGZhbHNlKSB7XG4gICAgLy8gc2tpcCBTSU1EIGZlYXR1cmUgY2hlY2tpbmcgYXMgaXQgaXMgZGlzYWJsZWQgZXhwbGljaXRseSBieSB1c2VyXG4gIH0gZWxzZSBpZiAoZmxhZ3Muc2ltZCA9PT0gJ3JlbGF4ZWQnKSB7XG4gICAgLy8gY2hlY2sgaWYgcmVsYXhlZCBTSU1EIGlzIHN1cHBvcnRlZFxuICAgIGlmICghaXNSZWxheGVkU2ltZFN1cHBvcnRlZCgpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1JlbGF4ZWQgV2ViQXNzZW1ibHkgU0lNRCBpcyBub3Qgc3VwcG9ydGVkIGluIHRoZSBjdXJyZW50IGVudmlyb25tZW50LicpO1xuICAgIH1cbiAgfSBlbHNlIGlmICghaXNTaW1kU3VwcG9ydGVkKCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1dlYkFzc2VtYmx5IFNJTUQgaXMgbm90IHN1cHBvcnRlZCBpbiB0aGUgY3VycmVudCBlbnZpcm9ubWVudC4nKTtcbiAgfVxuXG4gIC8vIGNoZWNrIGlmIG11bHRpLXRocmVhZGluZyBpcyBzdXBwb3J0ZWRcbiAgY29uc3QgbXVsdGlUaHJlYWRTdXBwb3J0ZWQgPSBpc011bHRpVGhyZWFkU3VwcG9ydGVkKCk7XG4gIGlmIChudW1UaHJlYWRzID4gMSAmJiAhbXVsdGlUaHJlYWRTdXBwb3J0ZWQpIHtcbiAgICBpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnICYmICFzZWxmLmNyb3NzT3JpZ2luSXNvbGF0ZWQpIHtcbiAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXG4gICAgICBjb25zb2xlLndhcm4oXG4gICAgICAgICdlbnYud2FzbS5udW1UaHJlYWRzIGlzIHNldCB0byAnICtcbiAgICAgICAgICBudW1UaHJlYWRzICtcbiAgICAgICAgICAnLCBidXQgdGhpcyB3aWxsIG5vdCB3b3JrIHVubGVzcyB5b3UgZW5hYmxlIGNyb3NzT3JpZ2luSXNvbGF0ZWQgbW9kZS4gJyArXG4gICAgICAgICAgJ1NlZSBodHRwczovL3dlYi5kZXYvY3Jvc3Mtb3JpZ2luLWlzb2xhdGlvbi1ndWlkZS8gZm9yIG1vcmUgaW5mby4nLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxuICAgIGNvbnNvbGUud2FybihcbiAgICAgICdXZWJBc3NlbWJseSBtdWx0aS10aHJlYWRpbmcgaXMgbm90IHN1cHBvcnRlZCBpbiB0aGUgY3VycmVudCBlbnZpcm9ubWVudC4gJyArICdGYWxsaW5nIGJhY2sgdG8gc2luZ2xlLXRocmVhZGluZy4nLFxuICAgICk7XG5cbiAgICAvLyBzZXQgZmxhZ3MubnVtVGhyZWFkcyB0byAxIHNvIHRoYXQgT3J0SW5pdCgpIHdpbGwgbm90IGNyZWF0ZSBhIGdsb2JhbCB0aHJlYWQgcG9vbC5cbiAgICBmbGFncy5udW1UaHJlYWRzID0gbnVtVGhyZWFkcyA9IDE7XG4gIH1cblxuICBjb25zdCB3YXNtUGF0aHMgPSBmbGFncy53YXNtUGF0aHM7XG4gIGNvbnN0IHdhc21QcmVmaXhPdmVycmlkZSA9IHR5cGVvZiB3YXNtUGF0aHMgPT09ICdzdHJpbmcnID8gd2FzbVBhdGhzIDogdW5kZWZpbmVkO1xuICBjb25zdCBtanNQYXRoT3ZlcnJpZGVGbGFnID0gKHdhc21QYXRocyBhcyBFbnYuV2FzbUZpbGVQYXRocyk/Lm1qcztcbiAgY29uc3QgbWpzUGF0aE92ZXJyaWRlID0gKG1qc1BhdGhPdmVycmlkZUZsYWcgYXMgVVJMKT8uaHJlZiA/PyBtanNQYXRoT3ZlcnJpZGVGbGFnO1xuICBjb25zdCB3YXNtUGF0aE92ZXJyaWRlRmxhZyA9ICh3YXNtUGF0aHMgYXMgRW52Lldhc21GaWxlUGF0aHMpPy53YXNtO1xuICBjb25zdCB3YXNtUGF0aE92ZXJyaWRlID0gKHdhc21QYXRoT3ZlcnJpZGVGbGFnIGFzIFVSTCk/LmhyZWYgPz8gd2FzbVBhdGhPdmVycmlkZUZsYWc7XG4gIGNvbnN0IHdhc21CaW5hcnlPdmVycmlkZSA9IGZsYWdzLndhc21CaW5hcnk7XG5cbiAgY29uc3QgW29iamVjdFVybCwgb3J0V2FzbUZhY3RvcnldID0gYXdhaXQgaW1wb3J0V2FzbU1vZHVsZShtanNQYXRoT3ZlcnJpZGUsIHdhc21QcmVmaXhPdmVycmlkZSwgbnVtVGhyZWFkcyA+IDEpO1xuXG4gIGxldCBpc1RpbWVvdXQgPSBmYWxzZTtcblxuICBjb25zdCB0YXNrczogQXJyYXk8UHJvbWlzZTx2b2lkPj4gPSBbXTtcblxuICAvLyBwcm9taXNlIGZvciB0aW1lb3V0XG4gIGlmICh0aW1lb3V0ID4gMCkge1xuICAgIHRhc2tzLnB1c2goXG4gICAgICBuZXcgUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuICAgICAgICBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICBpc1RpbWVvdXQgPSB0cnVlO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgfSwgdGltZW91dCk7XG4gICAgICB9KSxcbiAgICApO1xuICB9XG5cbiAgLy8gcHJvbWlzZSBmb3IgbW9kdWxlIGluaXRpYWxpemF0aW9uXG4gIHRhc2tzLnB1c2goXG4gICAgbmV3IFByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgY29uc3QgY29uZmlnOiBQYXJ0aWFsPE9ydFdhc21Nb2R1bGU+ID0ge1xuICAgICAgICAvKipcbiAgICAgICAgICogVGhlIG51bWJlciBvZiB0aHJlYWRzLiBXZWJBc3NlbWJseSB3aWxsIGNyZWF0ZSAoTW9kdWxlLm51bVRocmVhZHMgLSAxKSB3b3JrZXJzLiBJZiBpdCBpcyAxLCBubyB3b3JrZXIgd2lsbCBiZVxuICAgICAgICAgKiBjcmVhdGVkLlxuICAgICAgICAgKi9cbiAgICAgICAgbnVtVGhyZWFkcyxcbiAgICAgIH07XG5cbiAgICAgIGlmICh3YXNtQmluYXJ5T3ZlcnJpZGUpIHtcbiAgICAgICAgLy8gU2V0IGEgY3VzdG9tIGJ1ZmZlciB3aGljaCBjb250YWlucyB0aGUgV2ViQXNzZW1ibHkgYmluYXJ5LiBUaGlzIHdpbGwgc2tpcCB0aGUgd2FzbSBmaWxlIGZldGNoaW5nLlxuICAgICAgICBjb25maWcud2FzbUJpbmFyeSA9IHdhc21CaW5hcnlPdmVycmlkZTtcbiAgICAgIH0gZWxzZSBpZiAod2FzbVBhdGhPdmVycmlkZSB8fCB3YXNtUHJlZml4T3ZlcnJpZGUpIHtcbiAgICAgICAgLy8gQSBjYWxsYmFjayBmdW5jdGlvbiB0byBsb2NhdGUgdGhlIFdlYkFzc2VtYmx5IGZpbGUuIFRoZSBmdW5jdGlvbiBzaG91bGQgcmV0dXJuIHRoZSBmdWxsIHBhdGggb2YgdGhlIGZpbGUuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFNpbmNlIEVtc2NyaXB0ZW4gMy4xLjU4LCB0aGlzIGZ1bmN0aW9uIGlzIG9ubHkgY2FsbGVkIGZvciB0aGUgLndhc20gZmlsZS5cbiAgICAgICAgY29uZmlnLmxvY2F0ZUZpbGUgPSAoZmlsZU5hbWUpID0+IHdhc21QYXRoT3ZlcnJpZGUgPz8gd2FzbVByZWZpeE92ZXJyaWRlICsgZmlsZU5hbWU7XG4gICAgICB9IGVsc2UgaWYgKG1qc1BhdGhPdmVycmlkZSAmJiBtanNQYXRoT3ZlcnJpZGUuaW5kZXhPZignYmxvYjonKSAhPT0gMCkge1xuICAgICAgICAvLyBpZiBtanMgcGF0aCBpcyBzcGVjaWZpZWQsIHVzZSBpdCBhcyB0aGUgYmFzZSBwYXRoIGZvciB0aGUgLndhc20gZmlsZS5cbiAgICAgICAgY29uZmlnLmxvY2F0ZUZpbGUgPSAoZmlsZU5hbWUpID0+IG5ldyBVUkwoZmlsZU5hbWUsIG1qc1BhdGhPdmVycmlkZSkuaHJlZjtcbiAgICAgIH0gZWxzZSBpZiAob2JqZWN0VXJsKSB7XG4gICAgICAgIGNvbnN0IGluZmVycmVkV2FzbVBhdGhQcmVmaXggPSBpbmZlcldhc21QYXRoUHJlZml4RnJvbVNjcmlwdFNyYygpO1xuICAgICAgICBpZiAoaW5mZXJyZWRXYXNtUGF0aFByZWZpeCkge1xuICAgICAgICAgIC8vIGlmIHRoZSB3YXNtIG1vZHVsZSBpcyBwcmVsb2FkZWQsIHVzZSB0aGUgaW5mZXJyZWQgd2FzbSBwYXRoIGFzIHRoZSBiYXNlIHBhdGggZm9yIHRoZSAud2FzbSBmaWxlLlxuICAgICAgICAgIGNvbmZpZy5sb2NhdGVGaWxlID0gKGZpbGVOYW1lKSA9PiBpbmZlcnJlZFdhc21QYXRoUHJlZml4ICsgZmlsZU5hbWU7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgb3J0V2FzbUZhY3RvcnkoY29uZmlnKS50aGVuKFxuICAgICAgICAvLyB3YXNtIG1vZHVsZSBpbml0aWFsaXplZCBzdWNjZXNzZnVsbHlcbiAgICAgICAgKG1vZHVsZSkgPT4ge1xuICAgICAgICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcbiAgICAgICAgICB3YXNtID0gbW9kdWxlO1xuICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICBpZiAob2JqZWN0VXJsKSB7XG4gICAgICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKG9iamVjdFVybCk7XG4gICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICAvLyB3YXNtIG1vZHVsZSBmYWlsZWQgdG8gaW5pdGlhbGl6ZVxuICAgICAgICAod2hhdCkgPT4ge1xuICAgICAgICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgICAgICAgIGFib3J0ZWQgPSB0cnVlO1xuICAgICAgICAgIHJlamVjdCh3aGF0KTtcbiAgICAgICAgfSxcbiAgICAgICk7XG4gICAgfSksXG4gICk7XG5cbiAgYXdhaXQgUHJvbWlzZS5yYWNlKHRhc2tzKTtcblxuICBpZiAoaXNUaW1lb3V0KSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBXZWJBc3NlbWJseSBiYWNrZW5kIGluaXRpYWxpemluZyBmYWlsZWQgZHVlIHRvIHRpbWVvdXQ6ICR7dGltZW91dH1tc2ApO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0SW5zdGFuY2UgPSAoKTogT3J0V2FzbU1vZHVsZSA9PiB7XG4gIGlmIChpbml0aWFsaXplZCAmJiB3YXNtKSB7XG4gICAgcmV0dXJuIHdhc207XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoJ1dlYkFzc2VtYmx5IGlzIG5vdCBpbml0aWFsaXplZCB5ZXQuJyk7XG59O1xuXG5leHBvcnQgY29uc3QgZGlzcG9zZSA9ICgpOiB2b2lkID0+IHtcbiAgaWYgKGluaXRpYWxpemVkICYmICFpbml0aWFsaXppbmcgJiYgIWFib3J0ZWQpIHtcbiAgICAvLyBUT0RPOiBjdXJyZW50bHkgXCJQVGhyZWFkLnRlcm1pbmF0ZUFsbFRocmVhZHMoKVwiIGlzIG5vdCBleHBvc2VkIGluIHRoZSB3YXNtIG1vZHVsZS5cbiAgICAvLyAgICAgICBBbmQgdGhpcyBmdW5jdGlvbiBpcyBub3QgeWV0IGNhbGxlZCBieSBhbnkgY29kZS5cbiAgICAvLyAgICAgICBJZiBpdCBpcyBuZWVkZWQgaW4gdGhlIGZ1dHVyZSwgd2Ugc2hvdWxkIGV4cG9zZSBpdCBpbiB0aGUgd2FzbSBtb2R1bGUgYW5kIHVuY29tbWVudCB0aGUgZm9sbG93aW5nIGxpbmUuXG5cbiAgICAvLyB3YXNtPy5QVGhyZWFkPy50ZXJtaW5hdGVBbGxUaHJlYWRzKCk7XG4gICAgd2FzbSA9IHVuZGVmaW5lZDtcblxuICAgIGluaXRpYWxpemluZyA9IGZhbHNlO1xuICAgIGluaXRpYWxpemVkID0gZmFsc2U7XG4gICAgYWJvcnRlZCA9IHRydWU7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7IGdldEluc3RhbmNlIH0gZnJvbSAnLi93YXNtLWZhY3RvcnknO1xuXG5leHBvcnQgY29uc3QgYWxsb2NXYXNtU3RyaW5nID0gKGRhdGE6IHN0cmluZywgYWxsb2NzOiBudW1iZXJbXSk6IG51bWJlciA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuXG4gIGNvbnN0IGRhdGFMZW5ndGggPSB3YXNtLmxlbmd0aEJ5dGVzVVRGOChkYXRhKSArIDE7XG4gIGNvbnN0IGRhdGFPZmZzZXQgPSB3YXNtLl9tYWxsb2MoZGF0YUxlbmd0aCk7XG4gIHdhc20uc3RyaW5nVG9VVEY4KGRhdGEsIGRhdGFPZmZzZXQsIGRhdGFMZW5ndGgpO1xuICBhbGxvY3MucHVzaChkYXRhT2Zmc2V0KTtcblxuICByZXR1cm4gZGF0YU9mZnNldDtcbn07XG5cbmludGVyZmFjZSBFeHRyYU9wdGlvbnNIYW5kbGVyIHtcbiAgKG5hbWU6IHN0cmluZywgdmFsdWU6IHN0cmluZyk6IHZvaWQ7XG59XG5cbmV4cG9ydCBjb25zdCBpdGVyYXRlRXh0cmFPcHRpb25zID0gKFxuICBvcHRpb25zOiBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPixcbiAgcHJlZml4OiBzdHJpbmcsXG4gIHNlZW46IFdlYWtTZXQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+LFxuICBoYW5kbGVyOiBFeHRyYU9wdGlvbnNIYW5kbGVyLFxuKTogdm9pZCA9PiB7XG4gIGlmICh0eXBlb2Ygb3B0aW9ucyA9PSAnb2JqZWN0JyAmJiBvcHRpb25zICE9PSBudWxsKSB7XG4gICAgaWYgKHNlZW4uaGFzKG9wdGlvbnMpKSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NpcmN1bGFyIHJlZmVyZW5jZSBpbiBvcHRpb25zJyk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHNlZW4uYWRkKG9wdGlvbnMpO1xuICAgIH1cbiAgfVxuXG4gIE9iamVjdC5lbnRyaWVzKG9wdGlvbnMpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xuICAgIGNvbnN0IG5hbWUgPSBwcmVmaXggPyBwcmVmaXggKyBrZXkgOiBrZXk7XG4gICAgaWYgKHR5cGVvZiB2YWx1ZSA9PT0gJ29iamVjdCcpIHtcbiAgICAgIGl0ZXJhdGVFeHRyYU9wdGlvbnModmFsdWUgYXMgUmVjb3JkPHN0cmluZywgdW5rbm93bj4sIG5hbWUgKyAnLicsIHNlZW4sIGhhbmRsZXIpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnc3RyaW5nJyB8fCB0eXBlb2YgdmFsdWUgPT09ICdudW1iZXInKSB7XG4gICAgICBoYW5kbGVyKG5hbWUsIHZhbHVlLnRvU3RyaW5nKCkpO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHZhbHVlID09PSAnYm9vbGVhbicpIHtcbiAgICAgIGhhbmRsZXIobmFtZSwgdmFsdWUgPyAnMScgOiAnMCcpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGhhbmRsZSBleHRyYSBjb25maWcgdHlwZTogJHt0eXBlb2YgdmFsdWV9YCk7XG4gICAgfVxuICB9KTtcbn07XG5cbi8qKlxuICogY2hlY2sgd2ViIGFzc2VtYmx5IEFQSSdzIGxhc3QgZXJyb3IgYW5kIHRocm93IGVycm9yIGlmIGFueSBlcnJvciBvY2N1cnJlZC5cbiAqIEBwYXJhbSBtZXNzYWdlIGEgbWVzc2FnZSB1c2VkIHdoZW4gYW4gZXJyb3Igb2NjdXJyZWQuXG4gKi9cbmV4cG9ydCBjb25zdCBjaGVja0xhc3RFcnJvciA9IChtZXNzYWdlOiBzdHJpbmcpOiB2b2lkID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgY29uc3Qgc3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICB0cnkge1xuICAgIGNvbnN0IHB0clNpemUgPSB3YXNtLlBUUl9TSVpFO1xuICAgIGNvbnN0IHBhcmFtc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYygyICogcHRyU2l6ZSk7XG4gICAgd2FzbS5fT3J0R2V0TGFzdEVycm9yKHBhcmFtc09mZnNldCwgcGFyYW1zT2Zmc2V0ICsgcHRyU2l6ZSk7XG4gICAgY29uc3QgZXJyb3JDb2RlID0gTnVtYmVyKHdhc20uZ2V0VmFsdWUocGFyYW1zT2Zmc2V0LCBwdHJTaXplID09PSA0ID8gJ2kzMicgOiAnaTY0JykpO1xuICAgIGNvbnN0IGVycm9yTWVzc2FnZVBvaW50ZXIgPSB3YXNtLmdldFZhbHVlKHBhcmFtc09mZnNldCArIHB0clNpemUsICcqJyk7XG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3JNZXNzYWdlUG9pbnRlciA/IHdhc20uVVRGOFRvU3RyaW5nKGVycm9yTWVzc2FnZVBvaW50ZXIpIDogJyc7XG4gICAgdGhyb3cgbmV3IEVycm9yKGAke21lc3NhZ2V9IEVSUk9SX0NPREU6ICR7ZXJyb3JDb2RlfSwgRVJST1JfTUVTU0FHRTogJHtlcnJvck1lc3NhZ2V9YCk7XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5zdGFja1Jlc3RvcmUoc3RhY2spO1xuICB9XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgeyBJbmZlcmVuY2VTZXNzaW9uIH0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcblxuaW1wb3J0IHsgZ2V0SW5zdGFuY2UgfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5pbXBvcnQgeyBhbGxvY1dhc21TdHJpbmcsIGNoZWNrTGFzdEVycm9yLCBpdGVyYXRlRXh0cmFPcHRpb25zIH0gZnJvbSAnLi93YXNtLXV0aWxzJztcblxuZXhwb3J0IGNvbnN0IHNldFJ1bk9wdGlvbnMgPSAob3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTogW251bWJlciwgbnVtYmVyW11dID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGxldCBydW5PcHRpb25zSGFuZGxlID0gMDtcbiAgY29uc3QgYWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbnN0IHJ1bk9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG5cbiAgdHJ5IHtcbiAgICBpZiAob3B0aW9ucz8ubG9nU2V2ZXJpdHlMZXZlbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBydW5PcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPSAyOyAvLyBEZWZhdWx0IHRvIHdhcm5pbmdcbiAgICB9IGVsc2UgaWYgKFxuICAgICAgdHlwZW9mIG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCAhPT0gJ251bWJlcicgfHxcbiAgICAgICFOdW1iZXIuaXNJbnRlZ2VyKG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCkgfHxcbiAgICAgIG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCA8IDAgfHxcbiAgICAgIG9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCA+IDRcbiAgICApIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbG9nIHNlcnZlcml0eSBsZXZlbCBpcyBub3QgdmFsaWQ6ICR7b3B0aW9ucy5sb2dTZXZlcml0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGlmIChvcHRpb25zPy5sb2dWZXJib3NpdHlMZXZlbCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICBydW5PcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsID0gMDsgLy8gRGVmYXVsdCB0byAwXG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIob3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbG9nIHZlcmJvc2l0eSBsZXZlbCBpcyBub3QgdmFsaWQ6ICR7b3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucz8udGVybWluYXRlID09PSB1bmRlZmluZWQpIHtcbiAgICAgIHJ1bk9wdGlvbnMudGVybWluYXRlID0gZmFsc2U7XG4gICAgfVxuXG4gICAgbGV0IHRhZ0RhdGFPZmZzZXQgPSAwO1xuICAgIGlmIChvcHRpb25zPy50YWcgIT09IHVuZGVmaW5lZCkge1xuICAgICAgdGFnRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhvcHRpb25zLnRhZywgYWxsb2NzKTtcbiAgICB9XG5cbiAgICBydW5PcHRpb25zSGFuZGxlID0gd2FzbS5fT3J0Q3JlYXRlUnVuT3B0aW9ucyhcbiAgICAgIHJ1bk9wdGlvbnMubG9nU2V2ZXJpdHlMZXZlbCEsXG4gICAgICBydW5PcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsISxcbiAgICAgICEhcnVuT3B0aW9ucy50ZXJtaW5hdGUhLFxuICAgICAgdGFnRGF0YU9mZnNldCxcbiAgICApO1xuICAgIGlmIChydW5PcHRpb25zSGFuZGxlID09PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcihcIkNhbid0IGNyZWF0ZSBydW4gb3B0aW9ucy5cIik7XG4gICAgfVxuXG4gICAgaWYgKG9wdGlvbnM/LmV4dHJhICE9PSB1bmRlZmluZWQpIHtcbiAgICAgIGl0ZXJhdGVFeHRyYU9wdGlvbnMob3B0aW9ucy5leHRyYSwgJycsIG5ldyBXZWFrU2V0PFJlY29yZDxzdHJpbmcsIHVua25vd24+PigpLCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKGtleSwgYWxsb2NzKTtcbiAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHZhbHVlLCBhbGxvY3MpO1xuXG4gICAgICAgIGlmICh3YXNtLl9PcnRBZGRSdW5Db25maWdFbnRyeShydW5PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIHJ1biBjb25maWcgZW50cnk6ICR7a2V5fSAtICR7dmFsdWV9LmApO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gW3J1bk9wdGlvbnNIYW5kbGUsIGFsbG9jc107XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpZiAocnVuT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnMocnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIGFsbG9jcy5mb3JFYWNoKChhbGxvYykgPT4gd2FzbS5fZnJlZShhbGxvYykpO1xuICAgIHRocm93IGU7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB0eXBlIHsgSW5mZXJlbmNlU2Vzc2lvbiB9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7IGdldEluc3RhbmNlIH0gZnJvbSAnLi93YXNtLWZhY3RvcnknO1xuaW1wb3J0IHsgYWxsb2NXYXNtU3RyaW5nLCBjaGVja0xhc3RFcnJvciwgaXRlcmF0ZUV4dHJhT3B0aW9ucyB9IGZyb20gJy4vd2FzbS11dGlscyc7XG5cbmNvbnN0IGdldEdyYXBoT3B0aW16YXRpb25MZXZlbCA9IChncmFwaE9wdGltaXphdGlvbkxldmVsOiBzdHJpbmcgfCB1bmtub3duKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChncmFwaE9wdGltaXphdGlvbkxldmVsKSB7XG4gICAgY2FzZSAnZGlzYWJsZWQnOlxuICAgICAgcmV0dXJuIDA7XG4gICAgY2FzZSAnYmFzaWMnOlxuICAgICAgcmV0dXJuIDE7XG4gICAgY2FzZSAnZXh0ZW5kZWQnOlxuICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAnYWxsJzpcbiAgICAgIHJldHVybiA5OTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBncmFwaCBvcHRpbWl6YXRpb24gbGV2ZWw6ICR7Z3JhcGhPcHRpbWl6YXRpb25MZXZlbH1gKTtcbiAgfVxufTtcblxuY29uc3QgZ2V0RXhlY3V0aW9uTW9kZSA9IChleGVjdXRpb25Nb2RlOiAnc2VxdWVudGlhbCcgfCAncGFyYWxsZWwnKTogbnVtYmVyID0+IHtcbiAgc3dpdGNoIChleGVjdXRpb25Nb2RlKSB7XG4gICAgY2FzZSAnc2VxdWVudGlhbCc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdwYXJhbGxlbCc6XG4gICAgICByZXR1cm4gMTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBleGVjdXRpb24gbW9kZTogJHtleGVjdXRpb25Nb2RlfWApO1xuICB9XG59O1xuXG5jb25zdCBhcHBlbmREZWZhdWx0T3B0aW9ucyA9IChvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogdm9pZCA9PiB7XG4gIGlmICghb3B0aW9ucy5leHRyYSkge1xuICAgIG9wdGlvbnMuZXh0cmEgPSB7fTtcbiAgfVxuICBpZiAoIW9wdGlvbnMuZXh0cmEuc2Vzc2lvbikge1xuICAgIG9wdGlvbnMuZXh0cmEuc2Vzc2lvbiA9IHt9O1xuICB9XG4gIGNvbnN0IHNlc3Npb24gPSBvcHRpb25zLmV4dHJhLnNlc3Npb24gYXMgUmVjb3JkPHN0cmluZywgc3RyaW5nPjtcbiAgaWYgKCFzZXNzaW9uLnVzZV9vcnRfbW9kZWxfYnl0ZXNfZGlyZWN0bHkpIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXG4gICAgc2Vzc2lvbi51c2Vfb3J0X21vZGVsX2J5dGVzX2RpcmVjdGx5ID0gJzEnO1xuICB9XG5cbiAgLy8gaWYgdXNpbmcgSlNFUCB3aXRoIFdlYkdQVSwgYWx3YXlzIGRpc2FibGUgbWVtb3J5IHBhdHRlcm5cbiAgaWYgKFxuICAgIG9wdGlvbnMuZXhlY3V0aW9uUHJvdmlkZXJzICYmXG4gICAgb3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMuc29tZSgoZXApID0+ICh0eXBlb2YgZXAgPT09ICdzdHJpbmcnID8gZXAgOiBlcC5uYW1lKSA9PT0gJ3dlYmdwdScpXG4gICkge1xuICAgIG9wdGlvbnMuZW5hYmxlTWVtUGF0dGVybiA9IGZhbHNlO1xuICB9XG59O1xuXG5jb25zdCBhcHBlbmRTZXNzaW9uQ29uZmlnID0gKHNlc3Npb25PcHRpb25zSGFuZGxlOiBudW1iZXIsIGtleTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nLCBhbGxvY3M6IG51bWJlcltdKTogdm9pZCA9PiB7XG4gIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoa2V5LCBhbGxvY3MpO1xuICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcodmFsdWUsIGFsbG9jcyk7XG4gIGlmIChnZXRJbnN0YW5jZSgpLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnkoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGtleURhdGFPZmZzZXQsIHZhbHVlRGF0YU9mZnNldCkgIT09IDApIHtcbiAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICR7a2V5fSAtICR7dmFsdWV9LmApO1xuICB9XG59O1xuXG5jb25zdCBhcHBlbmRFcE9wdGlvbiA9IChlcE9wdGlvbnM6IEFycmF5PFtudW1iZXIsIG51bWJlcl0+LCBrZXk6IHN0cmluZywgdmFsdWU6IHN0cmluZywgYWxsb2NzOiBudW1iZXJbXSk6IHZvaWQgPT4ge1xuICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKGtleSwgYWxsb2NzKTtcbiAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHZhbHVlLCBhbGxvY3MpO1xuICBlcE9wdGlvbnMucHVzaChba2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0XSk7XG59O1xuXG5jb25zdCBzZXRFeGVjdXRpb25Qcm92aWRlcnMgPSBhc3luYyAoXG4gIHNlc3Npb25PcHRpb25zSGFuZGxlOiBudW1iZXIsXG4gIGV4ZWN1dGlvblByb3ZpZGVyczogcmVhZG9ubHkgSW5mZXJlbmNlU2Vzc2lvbi5FeGVjdXRpb25Qcm92aWRlckNvbmZpZ1tdLFxuICBhbGxvY3M6IG51bWJlcltdLFxuKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGZvciAoY29uc3QgZXAgb2YgZXhlY3V0aW9uUHJvdmlkZXJzKSB7XG4gICAgbGV0IGVwTmFtZSA9IHR5cGVvZiBlcCA9PT0gJ3N0cmluZycgPyBlcCA6IGVwLm5hbWU7XG4gICAgY29uc3QgZXBPcHRpb25zOiBBcnJheTxbbnVtYmVyLCBudW1iZXJdPiA9IFtdO1xuXG4gICAgLy8gY2hlY2sgRVAgbmFtZVxuICAgIHN3aXRjaCAoZXBOYW1lKSB7XG4gICAgICBjYXNlICd3ZWJubic6XG4gICAgICAgIGVwTmFtZSA9ICdXRUJOTic7XG4gICAgICAgIGlmICh0eXBlb2YgZXAgIT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgY29uc3Qgd2Vibm5PcHRpb25zID0gZXAgYXMgSW5mZXJlbmNlU2Vzc2lvbi5XZWJOTkV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgICAgICAgIC8vIGNvbnN0IGNvbnRleHQgPSAod2Vibm5PcHRpb25zIGFzIEluZmVyZW5jZVNlc3Npb24uV2ViTk5PcHRpb25zV2l0aE1MQ29udGV4dCk/LmNvbnRleHQ7XG4gICAgICAgICAgY29uc3QgZGV2aWNlVHlwZSA9ICh3ZWJubk9wdGlvbnMgYXMgSW5mZXJlbmNlU2Vzc2lvbi5XZWJOTkNvbnRleHRPcHRpb25zKT8uZGV2aWNlVHlwZTtcbiAgICAgICAgICBpZiAoZGV2aWNlVHlwZSkge1xuICAgICAgICAgICAgYXBwZW5kU2Vzc2lvbkNvbmZpZyhzZXNzaW9uT3B0aW9uc0hhbmRsZSwgJ2RldmljZVR5cGUnLCBkZXZpY2VUeXBlLCBhbGxvY3MpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIGNhc2UgJ3dlYmdwdSc6XG4gICAgICAgIGlmIChCVUlMRF9ERUZTLlVTRV9XRUJHUFVfRVApIHtcbiAgICAgICAgICBlcE5hbWUgPSAnV2ViR1BVJztcbiAgICAgICAgICBsZXQgY3VzdG9tRGV2aWNlOiBHUFVEZXZpY2UgfCB1bmRlZmluZWQ7XG5cbiAgICAgICAgICBpZiAodHlwZW9mIGVwICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgICAgY29uc3QgY3VzdG9tT3B0aW9ucyA9IGVwIGFzIHVua25vd24gYXMgeyBkZXZpY2U6IEdQVURldmljZSB9O1xuICAgICAgICAgICAgaWYgKGN1c3RvbU9wdGlvbnMuZGV2aWNlKSB7XG4gICAgICAgICAgICAgIGlmICh0eXBlb2YgR1BVRGV2aWNlICE9PSAndW5kZWZpbmVkJyAmJiBjdXN0b21PcHRpb25zLmRldmljZSBpbnN0YW5jZW9mIEdQVURldmljZSkge1xuICAgICAgICAgICAgICAgIGN1c3RvbURldmljZSA9IGN1c3RvbU9wdGlvbnMuZGV2aWNlO1xuICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW52YWxpZCBHUFUgZGV2aWNlIHNldCBpbiBXZWJHUFUgRVAgb3B0aW9ucy4nKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBUT0RPOiBoYW5kbGUgbW9yZSBvcHRpb25zXG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY29uc3QgaW5mbyA9IGdldEluc3RhbmNlKCkud2ViZ3B1UmVnaXN0ZXJEZXZpY2UhKGN1c3RvbURldmljZSk7XG4gICAgICAgICAgaWYgKGluZm8pIHtcbiAgICAgICAgICAgIGNvbnN0IFtkZXZpY2VJZCwgaW5zdGFuY2VIYW5kbGUsIGRldmljZUhhbmRsZV0gPSBpbmZvO1xuICAgICAgICAgICAgYXBwZW5kRXBPcHRpb24oZXBPcHRpb25zLCAnZGV2aWNlSWQnLCBkZXZpY2VJZC50b1N0cmluZygpLCBhbGxvY3MpO1xuICAgICAgICAgICAgYXBwZW5kRXBPcHRpb24oZXBPcHRpb25zLCAnd2ViZ3B1SW5zdGFuY2UnLCBpbnN0YW5jZUhhbmRsZS50b1N0cmluZygpLCBhbGxvY3MpO1xuICAgICAgICAgICAgYXBwZW5kRXBPcHRpb24oZXBPcHRpb25zLCAnd2ViZ3B1RGV2aWNlJywgZGV2aWNlSGFuZGxlLnRvU3RyaW5nKCksIGFsbG9jcyk7XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGVwTmFtZSA9ICdKUyc7XG4gICAgICAgICAgaWYgKHR5cGVvZiBlcCAhPT0gJ3N0cmluZycpIHtcbiAgICAgICAgICAgIGNvbnN0IHdlYmdwdU9wdGlvbnMgPSBlcCBhcyBJbmZlcmVuY2VTZXNzaW9uLldlYkdwdUV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xuICAgICAgICAgICAgaWYgKHdlYmdwdU9wdGlvbnM/LnByZWZlcnJlZExheW91dCkge1xuICAgICAgICAgICAgICBpZiAod2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQgIT09ICdOQ0hXJyAmJiB3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dCAhPT0gJ05IV0MnKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBwcmVmZXJyZWRMYXlvdXQgbXVzdCBiZSBlaXRoZXIgJ05DSFcnIG9yICdOSFdDJzogJHt3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dH1gKTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBhcHBlbmRTZXNzaW9uQ29uZmlnKHNlc3Npb25PcHRpb25zSGFuZGxlLCAncHJlZmVycmVkTGF5b3V0Jywgd2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQsIGFsbG9jcyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGJyZWFrO1xuICAgICAgY2FzZSAnd2FzbSc6XG4gICAgICBjYXNlICdjcHUnOlxuICAgICAgICBjb250aW51ZTtcbiAgICAgIGRlZmF1bHQ6XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgbm90IHN1cHBvcnRlZCBleGVjdXRpb24gcHJvdmlkZXI6ICR7ZXBOYW1lfWApO1xuICAgIH1cblxuICAgIGNvbnN0IGVwTmFtZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoZXBOYW1lLCBhbGxvY3MpO1xuICAgIGNvbnN0IGVwT3B0aW9uc0NvdW50ID0gZXBPcHRpb25zLmxlbmd0aDtcbiAgICBsZXQga2V5c09mZnNldCA9IDA7XG4gICAgbGV0IHZhbHVlc09mZnNldCA9IDA7XG4gICAgaWYgKGVwT3B0aW9uc0NvdW50ID4gMCkge1xuICAgICAga2V5c09mZnNldCA9IGdldEluc3RhbmNlKCkuX21hbGxvYyhlcE9wdGlvbnNDb3VudCAqIGdldEluc3RhbmNlKCkuUFRSX1NJWkUpO1xuICAgICAgYWxsb2NzLnB1c2goa2V5c09mZnNldCk7XG4gICAgICB2YWx1ZXNPZmZzZXQgPSBnZXRJbnN0YW5jZSgpLl9tYWxsb2MoZXBPcHRpb25zQ291bnQgKiBnZXRJbnN0YW5jZSgpLlBUUl9TSVpFKTtcbiAgICAgIGFsbG9jcy5wdXNoKHZhbHVlc09mZnNldCk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGVwT3B0aW9uc0NvdW50OyBpKyspIHtcbiAgICAgICAgZ2V0SW5zdGFuY2UoKS5zZXRWYWx1ZShrZXlzT2Zmc2V0ICsgaSAqIGdldEluc3RhbmNlKCkuUFRSX1NJWkUsIGVwT3B0aW9uc1tpXVswXSwgJyonKTtcbiAgICAgICAgZ2V0SW5zdGFuY2UoKS5zZXRWYWx1ZSh2YWx1ZXNPZmZzZXQgKyBpICogZ2V0SW5zdGFuY2UoKS5QVFJfU0laRSwgZXBPcHRpb25zW2ldWzFdLCAnKicpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAoXG4gICAgICAoYXdhaXQgZ2V0SW5zdGFuY2UoKS5fT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXIoXG4gICAgICAgIHNlc3Npb25PcHRpb25zSGFuZGxlLFxuICAgICAgICBlcE5hbWVEYXRhT2Zmc2V0LFxuICAgICAgICBrZXlzT2Zmc2V0LFxuICAgICAgICB2YWx1ZXNPZmZzZXQsXG4gICAgICAgIGVwT3B0aW9uc0NvdW50LFxuICAgICAgKSkgIT09IDBcbiAgICApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBhcHBlbmQgZXhlY3V0aW9uIHByb3ZpZGVyOiAke2VwTmFtZX0uYCk7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgY29uc3Qgc2V0U2Vzc2lvbk9wdGlvbnMgPSBhc3luYyAob3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOiBQcm9taXNlPFtudW1iZXIsIG51bWJlcltdXT4gPT4ge1xuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgbGV0IHNlc3Npb25PcHRpb25zSGFuZGxlID0gMDtcbiAgY29uc3QgYWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbnN0IHNlc3Npb25PcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgYXBwZW5kRGVmYXVsdE9wdGlvbnMoc2Vzc2lvbk9wdGlvbnMpO1xuXG4gIHRyeSB7XG4gICAgY29uc3QgZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCA9IGdldEdyYXBoT3B0aW16YXRpb25MZXZlbChzZXNzaW9uT3B0aW9ucy5ncmFwaE9wdGltaXphdGlvbkxldmVsID8/ICdhbGwnKTtcbiAgICBjb25zdCBleGVjdXRpb25Nb2RlID0gZ2V0RXhlY3V0aW9uTW9kZShzZXNzaW9uT3B0aW9ucy5leGVjdXRpb25Nb2RlID8/ICdzZXF1ZW50aWFsJyk7XG4gICAgY29uc3QgbG9nSWREYXRhT2Zmc2V0ID1cbiAgICAgIHR5cGVvZiBzZXNzaW9uT3B0aW9ucy5sb2dJZCA9PT0gJ3N0cmluZycgPyBhbGxvY1dhc21TdHJpbmcoc2Vzc2lvbk9wdGlvbnMubG9nSWQsIGFsbG9jcykgOiAwO1xuXG4gICAgY29uc3QgbG9nU2V2ZXJpdHlMZXZlbCA9IHNlc3Npb25PcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPz8gMjsgLy8gRGVmYXVsdCB0byAyIC0gd2FybmluZ1xuICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihsb2dTZXZlcml0eUxldmVsKSB8fCBsb2dTZXZlcml0eUxldmVsIDwgMCB8fCBsb2dTZXZlcml0eUxldmVsID4gNCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgc2VydmVyaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtsb2dTZXZlcml0eUxldmVsfWApO1xuICAgIH1cblxuICAgIGNvbnN0IGxvZ1ZlcmJvc2l0eUxldmVsID0gc2Vzc2lvbk9wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWwgPz8gMDsgLy8gRGVmYXVsdCB0byAwIC0gdmVyYm9zZVxuICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihsb2dWZXJib3NpdHlMZXZlbCkgfHwgbG9nVmVyYm9zaXR5TGV2ZWwgPCAwIHx8IGxvZ1ZlcmJvc2l0eUxldmVsID4gNCkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgdmVyYm9zaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtsb2dWZXJib3NpdHlMZXZlbH1gKTtcbiAgICB9XG5cbiAgICBjb25zdCBvcHRpbWl6ZWRNb2RlbEZpbGVQYXRoT2Zmc2V0ID1cbiAgICAgIHR5cGVvZiBzZXNzaW9uT3B0aW9ucy5vcHRpbWl6ZWRNb2RlbEZpbGVQYXRoID09PSAnc3RyaW5nJ1xuICAgICAgICA/IGFsbG9jV2FzbVN0cmluZyhzZXNzaW9uT3B0aW9ucy5vcHRpbWl6ZWRNb2RlbEZpbGVQYXRoLCBhbGxvY3MpXG4gICAgICAgIDogMDtcblxuICAgIHNlc3Npb25PcHRpb25zSGFuZGxlID0gd2FzbS5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnMoXG4gICAgICBncmFwaE9wdGltaXphdGlvbkxldmVsLFxuICAgICAgISFzZXNzaW9uT3B0aW9ucy5lbmFibGVDcHVNZW1BcmVuYSxcbiAgICAgICEhc2Vzc2lvbk9wdGlvbnMuZW5hYmxlTWVtUGF0dGVybixcbiAgICAgIGV4ZWN1dGlvbk1vZGUsXG4gICAgICAhIXNlc3Npb25PcHRpb25zLmVuYWJsZVByb2ZpbGluZyxcbiAgICAgIDAsXG4gICAgICBsb2dJZERhdGFPZmZzZXQsXG4gICAgICBsb2dTZXZlcml0eUxldmVsLFxuICAgICAgbG9nVmVyYm9zaXR5TGV2ZWwsXG4gICAgICBvcHRpbWl6ZWRNb2RlbEZpbGVQYXRoT2Zmc2V0LFxuICAgICk7XG4gICAgaWYgKHNlc3Npb25PcHRpb25zSGFuZGxlID09PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcihcIkNhbid0IGNyZWF0ZSBzZXNzaW9uIG9wdGlvbnMuXCIpO1xuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5leGVjdXRpb25Qcm92aWRlcnMpIHtcbiAgICAgIGF3YWl0IHNldEV4ZWN1dGlvblByb3ZpZGVycyhzZXNzaW9uT3B0aW9uc0hhbmRsZSwgc2Vzc2lvbk9wdGlvbnMuZXhlY3V0aW9uUHJvdmlkZXJzLCBhbGxvY3MpO1xuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5lbmFibGVHcmFwaENhcHR1cmUgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaWYgKHR5cGVvZiBzZXNzaW9uT3B0aW9ucy5lbmFibGVHcmFwaENhcHR1cmUgIT09ICdib29sZWFuJykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGVuYWJsZUdyYXBoQ2FwdHVyZSBtdXN0IGJlIGEgYm9vbGVhbiB2YWx1ZTogJHtzZXNzaW9uT3B0aW9ucy5lbmFibGVHcmFwaENhcHR1cmV9YCk7XG4gICAgICB9XG4gICAgICBhcHBlbmRTZXNzaW9uQ29uZmlnKFxuICAgICAgICBzZXNzaW9uT3B0aW9uc0hhbmRsZSxcbiAgICAgICAgJ2VuYWJsZUdyYXBoQ2FwdHVyZScsXG4gICAgICAgIHNlc3Npb25PcHRpb25zLmVuYWJsZUdyYXBoQ2FwdHVyZS50b1N0cmluZygpLFxuICAgICAgICBhbGxvY3MsXG4gICAgICApO1xuICAgIH1cblxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5mcmVlRGltZW5zaW9uT3ZlcnJpZGVzKSB7XG4gICAgICBmb3IgKGNvbnN0IFtuYW1lLCB2YWx1ZV0gb2YgT2JqZWN0LmVudHJpZXMoc2Vzc2lvbk9wdGlvbnMuZnJlZURpbWVuc2lvbk92ZXJyaWRlcykpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGUgbmFtZSBtdXN0IGJlIGEgc3RyaW5nOiAke25hbWV9YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIodmFsdWUpIHx8IHZhbHVlIDwgMCkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGUgdmFsdWUgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyOiAke3ZhbHVlfWApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IG5hbWVPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcobmFtZSwgYWxsb2NzKTtcbiAgICAgICAgaWYgKHdhc20uX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZShzZXNzaW9uT3B0aW9uc0hhbmRsZSwgbmFtZU9mZnNldCwgdmFsdWUpICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IHNldCBhIGZyZWUgZGltZW5zaW9uIG92ZXJyaWRlOiAke25hbWV9IC0gJHt2YWx1ZX0uYCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnMuZXh0cmEgIT09IHVuZGVmaW5lZCkge1xuICAgICAgaXRlcmF0ZUV4dHJhT3B0aW9ucyhzZXNzaW9uT3B0aW9ucy5leHRyYSwgJycsIG5ldyBXZWFrU2V0PFJlY29yZDxzdHJpbmcsIHVua25vd24+PigpLCAoa2V5LCB2YWx1ZSkgPT4ge1xuICAgICAgICBhcHBlbmRTZXNzaW9uQ29uZmlnKHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXksIHZhbHVlLCBhbGxvY3MpO1xuICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIFtzZXNzaW9uT3B0aW9uc0hhbmRsZSwgYWxsb2NzXTtcbiAgfSBjYXRjaCAoZSkge1xuICAgIGlmIChzZXNzaW9uT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgaWYgKHdhc20uX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucyhzZXNzaW9uT3B0aW9uc0hhbmRsZSkgIT09IDApIHtcbiAgICAgICAgY2hlY2tMYXN0RXJyb3IoXCJDYW4ndCByZWxlYXNlIHNlc3Npb24gb3B0aW9ucy5cIik7XG4gICAgICB9XG4gICAgfVxuICAgIGFsbG9jcy5mb3JFYWNoKChhbGxvYykgPT4gd2FzbS5fZnJlZShhbGxvYykpO1xuICAgIHRocm93IGU7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7IFRlbnNvciB9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbi8vIGEgZHVtbXkgdHlwZSBkZWNsYXJhdGlvbiBmb3IgRmxvYXQxNkFycmF5IGluIGNhc2UgYW55IHBvbHlmaWxsIGlzIGF2YWlsYWJsZS5cbmRlY2xhcmUgZ2xvYmFsIHtcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvbiwgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxuICBjb25zdCBGbG9hdDE2QXJyYXk6IGFueTtcbn1cblxuLy8gVGhpcyBmaWxlIGluY2x1ZGVzIGNvbW1vbiBkZWZpbml0aW9ucy4gVGhleSBkbyBOT1QgaGF2ZSBkZXBlbmRlbmN5IG9uIHRoZSBXZWJBc3NlbWJseSBpbnN0YW5jZS5cblxuLyoqXG4gKiBDb3BpZWQgZnJvbSBPTk5YIGRlZmluaXRpb24uIFVzZSB0aGlzIHRvIGRyb3AgZGVwZW5kZW5jeSAnb25ueF9wcm90bycgdG8gZGVjcmVhc2UgY29tcGlsZWQgLmpzIGZpbGUgc2l6ZS5cbiAqL1xuZXhwb3J0IGNvbnN0IGVudW0gRGF0YVR5cGUge1xuICB1bmRlZmluZWQgPSAwLFxuICBmbG9hdCA9IDEsXG4gIHVpbnQ4ID0gMixcbiAgaW50OCA9IDMsXG4gIHVpbnQxNiA9IDQsXG4gIGludDE2ID0gNSxcbiAgaW50MzIgPSA2LFxuICBpbnQ2NCA9IDcsXG4gIHN0cmluZyA9IDgsXG4gIGJvb2wgPSA5LFxuICBmbG9hdDE2ID0gMTAsXG4gIGRvdWJsZSA9IDExLFxuICB1aW50MzIgPSAxMixcbiAgdWludDY0ID0gMTMsXG4gIGNvbXBsZXg2NCA9IDE0LFxuICBjb21wbGV4MTI4ID0gMTUsXG4gIGJmbG9hdDE2ID0gMTYsXG5cbiAgLy8gNC1iaXQgZGF0YS10eXBlc1xuICB1aW50NCA9IDIxLFxuICBpbnQ0ID0gMjIsXG59XG5cbi8qKlxuICogTWFwIHN0cmluZyB0ZW5zb3IgZGF0YSB0byBlbnVtIHZhbHVlXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bSA9ICh0eXBlOiBzdHJpbmcpOiBEYXRhVHlwZSA9PiB7XG4gIHN3aXRjaCAodHlwZSkge1xuICAgIGNhc2UgJ2ludDgnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDg7XG4gICAgY2FzZSAndWludDgnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQ4O1xuICAgIGNhc2UgJ2Jvb2wnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmJvb2w7XG4gICAgY2FzZSAnaW50MTYnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDE2O1xuICAgIGNhc2UgJ3VpbnQxNic6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDE2O1xuICAgIGNhc2UgJ2ludDMyJzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5pbnQzMjtcbiAgICBjYXNlICd1aW50MzInOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQzMjtcbiAgICBjYXNlICdmbG9hdDE2JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS5mbG9hdDE2O1xuICAgIGNhc2UgJ2Zsb2F0MzInOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmZsb2F0O1xuICAgIGNhc2UgJ2Zsb2F0NjQnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLmRvdWJsZTtcbiAgICBjYXNlICdzdHJpbmcnOlxuICAgICAgcmV0dXJuIERhdGFUeXBlLnN0cmluZztcbiAgICBjYXNlICdpbnQ2NCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50NjQ7XG4gICAgY2FzZSAndWludDY0JzpcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50NjQ7XG4gICAgY2FzZSAnaW50NCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUuaW50NDtcbiAgICBjYXNlICd1aW50NCc6XG4gICAgICByZXR1cm4gRGF0YVR5cGUudWludDQ7XG5cbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBkYXRhIHR5cGU6ICR7dHlwZX1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBNYXAgZW51bSB2YWx1ZSB0byBzdHJpbmcgdGVuc29yIGRhdGFcbiAqL1xuZXhwb3J0IGNvbnN0IHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nID0gKHR5cGVQcm90bzogRGF0YVR5cGUpOiBUZW5zb3IuVHlwZSA9PiB7XG4gIHN3aXRjaCAodHlwZVByb3RvKSB7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQ4OlxuICAgICAgcmV0dXJuICdpbnQ4JztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQ4OlxuICAgICAgcmV0dXJuICd1aW50OCc7XG4gICAgY2FzZSBEYXRhVHlwZS5ib29sOlxuICAgICAgcmV0dXJuICdib29sJztcbiAgICBjYXNlIERhdGFUeXBlLmludDE2OlxuICAgICAgcmV0dXJuICdpbnQxNic7XG4gICAgY2FzZSBEYXRhVHlwZS51aW50MTY6XG4gICAgICByZXR1cm4gJ3VpbnQxNic7XG4gICAgY2FzZSBEYXRhVHlwZS5pbnQzMjpcbiAgICAgIHJldHVybiAnaW50MzInO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDMyOlxuICAgICAgcmV0dXJuICd1aW50MzInO1xuICAgIGNhc2UgRGF0YVR5cGUuZmxvYXQxNjpcbiAgICAgIHJldHVybiAnZmxvYXQxNic7XG4gICAgY2FzZSBEYXRhVHlwZS5mbG9hdDpcbiAgICAgIHJldHVybiAnZmxvYXQzMic7XG4gICAgY2FzZSBEYXRhVHlwZS5kb3VibGU6XG4gICAgICByZXR1cm4gJ2Zsb2F0NjQnO1xuICAgIGNhc2UgRGF0YVR5cGUuc3RyaW5nOlxuICAgICAgcmV0dXJuICdzdHJpbmcnO1xuICAgIGNhc2UgRGF0YVR5cGUuaW50NjQ6XG4gICAgICByZXR1cm4gJ2ludDY0JztcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQ2NDpcbiAgICAgIHJldHVybiAndWludDY0JztcbiAgICBjYXNlIERhdGFUeXBlLmludDQ6XG4gICAgICByZXR1cm4gJ2ludDQnO1xuICAgIGNhc2UgRGF0YVR5cGUudWludDQ6XG4gICAgICByZXR1cm4gJ3VpbnQ0JztcblxuICAgIGRlZmF1bHQ6XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGRhdGEgdHlwZTogJHt0eXBlUHJvdG99YCk7XG4gIH1cbn07XG5cbi8qKlxuICogZ2V0IHRlbnNvciBzaXplIGluIGJ5dGVzIGJ5IHRoZSBnaXZlbiBkYXRhIHR5cGUgYW5kIGRpbWVuc2lvbnNcbiAqIEByZXR1cm5zIHNpemUgaW4gaW50ZWdlciBvciB1bmRlZmluZWQgaWYgdGhlIGRhdGEgdHlwZSBpcyBub3Qgc3VwcG9ydGVkXG4gKi9cbmV4cG9ydCBjb25zdCBjYWxjdWxhdGVUZW5zb3JTaXplSW5CeXRlcyA9IChcbiAgZGF0ZVR5cGU6IG51bWJlcixcbiAgZGltc09yU2l6ZTogcmVhZG9ubHkgbnVtYmVyW10gfCBudW1iZXIsXG4pOiBudW1iZXIgfCB1bmRlZmluZWQgPT4ge1xuICBjb25zdCBlbGVtZW50U2l6ZSA9IFtcbiAgICAtMSwgLy8gdW5kZWZpbmVkID0gMFxuICAgIDQsIC8vIGZsb2F0ID0gMVxuICAgIDEsIC8vIHVpbnQ4ID0gMlxuICAgIDEsIC8vIGludDggPSAzXG4gICAgMiwgLy8gdWludDE2ID0gNFxuICAgIDIsIC8vIGludDE2ID0gNVxuICAgIDQsIC8vIGludDMyID0gNlxuICAgIDgsIC8vIGludDY0ID0gN1xuICAgIC0xLCAvLyBzdHJpbmcgPSA4XG4gICAgMSwgLy8gYm9vbCA9IDlcbiAgICAyLCAvLyBmbG9hdDE2ID0gMTBcbiAgICA4LCAvLyBkb3VibGUgPSAxMVxuICAgIDQsIC8vIHVpbnQzMiA9IDEyXG4gICAgOCwgLy8gdWludDY0ID0gMTNcbiAgICAtMSwgLy8gY29tcGxleDY0ID0gMTRcbiAgICAtMSwgLy8gY29tcGxleDEyOCA9IDE1XG4gICAgLTEsIC8vIGJmbG9hdDE2ID0gMTZcbiAgICAtMSwgLy8gRkxPQVQ4RTRNM0ZOID0gMTdcbiAgICAtMSwgLy8gRkxPQVQ4RTRNM0ZOVVogPSAxOFxuICAgIC0xLCAvLyBGTE9BVDhFNU0yID0gMTlcbiAgICAtMSwgLy8gRkxPQVQ4RTVNMkZOVVogPSAyMFxuICAgIDAuNSwgLy8gdWludDQgPSAyMVxuICAgIDAuNSwgLy8gaW50NCA9IDIyXG4gIF1bZGF0ZVR5cGVdO1xuXG4gIGNvbnN0IHNpemUgPSB0eXBlb2YgZGltc09yU2l6ZSA9PT0gJ251bWJlcicgPyBkaW1zT3JTaXplIDogZGltc09yU2l6ZS5yZWR1Y2UoKGEsIGIpID0+IGEgKiBiLCAxKTtcbiAgcmV0dXJuIGVsZW1lbnRTaXplID4gMCA/IE1hdGguY2VpbChzaXplICogZWxlbWVudFNpemUpIDogdW5kZWZpbmVkO1xufTtcblxuLyoqXG4gKiBnZXQgdHlwZWQgYXJyYXkgY29uc3RydWN0b3IgYnkgdGhlIGdpdmVuIHRlbnNvciB0eXBlXG4gKi9cbmV4cG9ydCBjb25zdCB0ZW5zb3JUeXBlVG9UeXBlZEFycmF5Q29uc3RydWN0b3IgPSAoXG4gIHR5cGU6IFRlbnNvci5UeXBlLFxuKTpcbiAgfCBGbG9hdDMyQXJyYXlDb25zdHJ1Y3RvclxuICB8IFVpbnQ4QXJyYXlDb25zdHJ1Y3RvclxuICB8IEludDhBcnJheUNvbnN0cnVjdG9yXG4gIHwgVWludDE2QXJyYXlDb25zdHJ1Y3RvclxuICB8IEludDE2QXJyYXlDb25zdHJ1Y3RvclxuICB8IEludDMyQXJyYXlDb25zdHJ1Y3RvclxuICB8IEJpZ0ludDY0QXJyYXlDb25zdHJ1Y3RvclxuICB8IFVpbnQ4QXJyYXlDb25zdHJ1Y3RvclxuICB8IEZsb2F0NjRBcnJheUNvbnN0cnVjdG9yXG4gIHwgVWludDMyQXJyYXlDb25zdHJ1Y3RvclxuICB8IEJpZ1VpbnQ2NEFycmF5Q29uc3RydWN0b3IgPT4ge1xuICBzd2l0Y2ggKHR5cGUpIHtcbiAgICBjYXNlICdmbG9hdDE2JzpcbiAgICAgIC8vIGFsbG93IEZsb2F0MTZBcnJheSBwb2x5ZmlsbC5cbiAgICAgIHJldHVybiB0eXBlb2YgRmxvYXQxNkFycmF5ICE9PSAndW5kZWZpbmVkJyAmJiBGbG9hdDE2QXJyYXkuZnJvbSA/IEZsb2F0MTZBcnJheSA6IFVpbnQxNkFycmF5O1xuICAgIGNhc2UgJ2Zsb2F0MzInOlxuICAgICAgcmV0dXJuIEZsb2F0MzJBcnJheTtcbiAgICBjYXNlICd1aW50OCc6XG4gICAgICByZXR1cm4gVWludDhBcnJheTtcbiAgICBjYXNlICdpbnQ4JzpcbiAgICAgIHJldHVybiBJbnQ4QXJyYXk7XG4gICAgY2FzZSAndWludDE2JzpcbiAgICAgIHJldHVybiBVaW50MTZBcnJheTtcbiAgICBjYXNlICdpbnQxNic6XG4gICAgICByZXR1cm4gSW50MTZBcnJheTtcbiAgICBjYXNlICdpbnQzMic6XG4gICAgICByZXR1cm4gSW50MzJBcnJheTtcbiAgICBjYXNlICdib29sJzpcbiAgICAgIHJldHVybiBVaW50OEFycmF5O1xuICAgIGNhc2UgJ2Zsb2F0NjQnOlxuICAgICAgcmV0dXJuIEZsb2F0NjRBcnJheTtcbiAgICBjYXNlICd1aW50MzInOlxuICAgICAgcmV0dXJuIFVpbnQzMkFycmF5O1xuICAgIGNhc2UgJ2ludDY0JzpcbiAgICAgIHJldHVybiBCaWdJbnQ2NEFycmF5O1xuICAgIGNhc2UgJ3VpbnQ2NCc6XG4gICAgICByZXR1cm4gQmlnVWludDY0QXJyYXk7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgdHlwZTogJHt0eXBlfWApO1xuICB9XG59O1xuXG4vKipcbiAqIE1hcCBzdHJpbmcgbG9nIGxldmVsIHRvIGludGVnZXIgdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IGxvZ0xldmVsU3RyaW5nVG9FbnVtID0gKGxvZ0xldmVsPzogJ3ZlcmJvc2UnIHwgJ2luZm8nIHwgJ3dhcm5pbmcnIHwgJ2Vycm9yJyB8ICdmYXRhbCcpOiBudW1iZXIgPT4ge1xuICBzd2l0Y2ggKGxvZ0xldmVsKSB7XG4gICAgY2FzZSAndmVyYm9zZSc6XG4gICAgICByZXR1cm4gMDtcbiAgICBjYXNlICdpbmZvJzpcbiAgICAgIHJldHVybiAxO1xuICAgIGNhc2UgJ3dhcm5pbmcnOlxuICAgICAgcmV0dXJuIDI7XG4gICAgY2FzZSAnZXJyb3InOlxuICAgICAgcmV0dXJuIDM7XG4gICAgY2FzZSAnZmF0YWwnOlxuICAgICAgcmV0dXJuIDQ7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgbG9nZ2luZyBsZXZlbDogJHtsb2dMZXZlbH1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBnaXZlbiB0ZW5zb3IgdHlwZSBpcyBzdXBwb3J0ZWQgYnkgR1BVIGJ1ZmZlclxuICovXG5leHBvcnQgY29uc3QgaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlID0gKHR5cGU6IFRlbnNvci5UeXBlKTogdHlwZSBpcyBUZW5zb3IuR3B1QnVmZmVyRGF0YVR5cGVzID0+XG4gIHR5cGUgPT09ICdmbG9hdDMyJyB8fFxuICB0eXBlID09PSAnZmxvYXQxNicgfHxcbiAgdHlwZSA9PT0gJ2ludDMyJyB8fFxuICB0eXBlID09PSAnaW50NjQnIHx8XG4gIHR5cGUgPT09ICd1aW50MzInIHx8XG4gIHR5cGUgPT09ICd1aW50OCcgfHxcbiAgdHlwZSA9PT0gJ2Jvb2wnIHx8XG4gIHR5cGUgPT09ICd1aW50NCcgfHxcbiAgdHlwZSA9PT0gJ2ludDQnO1xuXG4vKipcbiAqIENoZWNrIHdoZXRoZXIgdGhlIGdpdmVuIHRlbnNvciB0eXBlIGlzIHN1cHBvcnRlZCBieSBXZWJOTiBNTFRlbnNvclxuICovXG5leHBvcnQgY29uc3QgaXNNTFRlbnNvclN1cHBvcnRlZFR5cGUgPSAodHlwZTogVGVuc29yLlR5cGUpOiB0eXBlIGlzIFRlbnNvci5NTFRlbnNvckRhdGFUeXBlcyA9PlxuICB0eXBlID09PSAnZmxvYXQzMicgfHxcbiAgdHlwZSA9PT0gJ2Zsb2F0MTYnIHx8XG4gIHR5cGUgPT09ICdpbnQzMicgfHxcbiAgdHlwZSA9PT0gJ2ludDY0JyB8fFxuICB0eXBlID09PSAndWludDMyJyB8fFxuICB0eXBlID09PSAndWludDY0JyB8fFxuICB0eXBlID09PSAnaW50OCcgfHxcbiAgdHlwZSA9PT0gJ3VpbnQ4JyB8fFxuICB0eXBlID09PSAnYm9vbCcgfHxcbiAgdHlwZSA9PT0gJ3VpbnQ0JyB8fFxuICB0eXBlID09PSAnaW50NCc7XG5cbi8qKlxuICogTWFwIHN0cmluZyBkYXRhIGxvY2F0aW9uIHRvIGludGVnZXIgdmFsdWVcbiAqL1xuZXhwb3J0IGNvbnN0IGRhdGFMb2NhdGlvblN0cmluZ1RvRW51bSA9IChsb2NhdGlvbjogVGVuc29yLkRhdGFMb2NhdGlvbik6IG51bWJlciA9PiB7XG4gIHN3aXRjaCAobG9jYXRpb24pIHtcbiAgICBjYXNlICdub25lJzpcbiAgICAgIHJldHVybiAwO1xuICAgIGNhc2UgJ2NwdSc6XG4gICAgICByZXR1cm4gMTtcbiAgICBjYXNlICdjcHUtcGlubmVkJzpcbiAgICAgIHJldHVybiAyO1xuICAgIGNhc2UgJ3RleHR1cmUnOlxuICAgICAgcmV0dXJuIDM7XG4gICAgY2FzZSAnZ3B1LWJ1ZmZlcic6XG4gICAgICByZXR1cm4gNDtcbiAgICBjYXNlICdtbC10ZW5zb3InOlxuICAgICAgcmV0dXJuIDU7XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSBsb2NhdGlvbjogJHtsb2NhdGlvbn1gKTtcbiAgfVxufTtcblxuLyoqXG4gKiBNYXAgaW50ZWdlciBkYXRhIGxvY2F0aW9uIHRvIHN0cmluZyB2YWx1ZVxuICovXG5leHBvcnQgY29uc3QgZGF0YUxvY2F0aW9uRW51bVRvU3RyaW5nID0gKGxvY2F0aW9uOiBudW1iZXIpOiBUZW5zb3IuRGF0YUxvY2F0aW9uIHwgdW5kZWZpbmVkID0+XG4gIChbJ25vbmUnLCAnY3B1JywgJ2NwdS1waW5uZWQnLCAndGV4dHVyZScsICdncHUtYnVmZmVyJywgJ21sLXRlbnNvciddIGFzIGNvbnN0KVtsb2NhdGlvbl07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbmltcG9ydCB7IGlzTm9kZSB9IGZyb20gJy4vd2FzbS11dGlscy1lbnYnO1xuXG4vKipcbiAqIExvYWQgYSBmaWxlIGludG8gYSBVaW50OEFycmF5LlxuICpcbiAqIEBwYXJhbSBmaWxlIC0gdGhlIGZpbGUgdG8gbG9hZC4gQ2FuIGJlIGEgVVJML3BhdGgsIGEgQmxvYiwgYW4gQXJyYXlCdWZmZXIsIG9yIGEgVWludDhBcnJheS5cbiAqIEByZXR1cm5zIGEgVWludDhBcnJheSBjb250YWluaW5nIHRoZSBmaWxlIGRhdGEuXG4gKi9cbmV4cG9ydCBjb25zdCBsb2FkRmlsZSA9IGFzeW5jIChmaWxlOiBzdHJpbmcgfCBCbG9iIHwgQXJyYXlCdWZmZXJMaWtlIHwgVWludDhBcnJheSk6IFByb21pc2U8VWludDhBcnJheT4gPT4ge1xuICBpZiAodHlwZW9mIGZpbGUgPT09ICdzdHJpbmcnKSB7XG4gICAgaWYgKGlzTm9kZSkge1xuICAgICAgLy8gbG9hZCBmaWxlIGludG8gQXJyYXlCdWZmZXIgaW4gTm9kZS5qc1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgeyByZWFkRmlsZSB9ID0gcmVxdWlyZSgnbm9kZTpmcy9wcm9taXNlcycpO1xuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgcmVhZEZpbGUoZmlsZSkpO1xuICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICBpZiAoZS5jb2RlID09PSAnRVJSX0ZTX0ZJTEVfVE9PX0xBUkdFJykge1xuICAgICAgICAgIC8vIGZpbGUgaXMgdG9vIGxhcmdlLCB1c2UgZnMuY3JlYXRlUmVhZFN0cmVhbSBpbnN0ZWFkXG4gICAgICAgICAgY29uc3QgeyBjcmVhdGVSZWFkU3RyZWFtIH0gPSByZXF1aXJlKCdub2RlOmZzJyk7XG4gICAgICAgICAgY29uc3Qgc3RyZWFtID0gY3JlYXRlUmVhZFN0cmVhbShmaWxlKTtcbiAgICAgICAgICBjb25zdCBjaHVua3M6IFVpbnQ4QXJyYXlbXSA9IFtdO1xuICAgICAgICAgIGZvciBhd2FpdCAoY29uc3QgY2h1bmsgb2Ygc3RyZWFtKSB7XG4gICAgICAgICAgICBjaHVua3MucHVzaChjaHVuayk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShCdWZmZXIuY29uY2F0KGNodW5rcykpO1xuICAgICAgICB9XG4gICAgICAgIHRocm93IGU7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGxvYWQgZmlsZSBpbnRvIEFycmF5QnVmZmVyIGluIGJyb3dzZXJzXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGZpbGUpO1xuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGZhaWxlZCB0byBsb2FkIGV4dGVybmFsIGRhdGEgZmlsZTogJHtmaWxlfWApO1xuICAgICAgfVxuICAgICAgY29uc3QgY29udGVudExlbmd0aEhlYWRlciA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdDb250ZW50LUxlbmd0aCcpO1xuICAgICAgY29uc3QgZmlsZVNpemUgPSBjb250ZW50TGVuZ3RoSGVhZGVyID8gcGFyc2VJbnQoY29udGVudExlbmd0aEhlYWRlciwgMTApIDogMDtcbiAgICAgIGlmIChmaWxlU2l6ZSA8IDEwNzM3NDE4MjQgLyogMUdCICovKSB7XG4gICAgICAgIC8vIHdoZW4gQ29udGVudC1MZW5ndGggaGVhZGVyIGlzIG5vdCBzZXQsIHdlIGNhbm5vdCBkZXRlcm1pbmUgdGhlIGZpbGUgc2l6ZS4gV2UgYXNzdW1lIGl0IGlzIHNtYWxsIGVub3VnaCB0b1xuICAgICAgICAvLyBsb2FkIGludG8gbWVtb3J5LlxuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgcmVzcG9uc2UuYXJyYXlCdWZmZXIoKSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBmaWxlIGlzIHRvbyBsYXJnZSwgdXNlIHN0cmVhbSBpbnN0ZWFkXG4gICAgICAgIGlmICghcmVzcG9uc2UuYm9keSkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZmFpbGVkIHRvIGxvYWQgZXh0ZXJuYWwgZGF0YSBmaWxlOiAke2ZpbGV9LCBubyByZXNwb25zZSBib2R5LmApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHJlYWRlciA9IHJlc3BvbnNlLmJvZHkuZ2V0UmVhZGVyKCk7XG5cbiAgICAgICAgbGV0IGJ1ZmZlcjtcbiAgICAgICAgdHJ5IHtcbiAgICAgICAgICAvLyB0cnkgdG8gY3JlYXRlIEFycmF5QnVmZmVyIGRpcmVjdGx5XG4gICAgICAgICAgYnVmZmVyID0gbmV3IEFycmF5QnVmZmVyKGZpbGVTaXplKTtcbiAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIGlmIChlIGluc3RhbmNlb2YgUmFuZ2VFcnJvcikge1xuICAgICAgICAgICAgLy8gdXNlIFdlYkFzc2VtYmx5IE1lbW9yeSB0byBhbGxvY2F0ZSBsYXJnZXIgQXJyYXlCdWZmZXJcbiAgICAgICAgICAgIGNvbnN0IHBhZ2VzID0gTWF0aC5jZWlsKGZpbGVTaXplIC8gNjU1MzYpO1xuICAgICAgICAgICAgYnVmZmVyID0gbmV3IFdlYkFzc2VtYmx5Lk1lbW9yeSh7IGluaXRpYWw6IHBhZ2VzLCBtYXhpbXVtOiBwYWdlcyB9KS5idWZmZXI7XG4gICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRocm93IGU7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG9mZnNldCA9IDA7XG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zdGFudC1jb25kaXRpb25cbiAgICAgICAgd2hpbGUgKHRydWUpIHtcbiAgICAgICAgICBjb25zdCB7IGRvbmUsIHZhbHVlIH0gPSBhd2FpdCByZWFkZXIucmVhZCgpO1xuICAgICAgICAgIGlmIChkb25lKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgY2h1bmtTaXplID0gdmFsdWUuYnl0ZUxlbmd0aDtcbiAgICAgICAgICBjb25zdCBjaHVuayA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlciwgb2Zmc2V0LCBjaHVua1NpemUpO1xuICAgICAgICAgIGNodW5rLnNldCh2YWx1ZSk7XG4gICAgICAgICAgb2Zmc2V0ICs9IGNodW5rU2l6ZTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYnVmZmVyLCAwLCBmaWxlU2l6ZSk7XG4gICAgICB9XG4gICAgfVxuICB9IGVsc2UgaWYgKGZpbGUgaW5zdGFuY2VvZiBCbG9iKSB7XG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGF3YWl0IGZpbGUuYXJyYXlCdWZmZXIoKSk7XG4gIH0gZWxzZSBpZiAoZmlsZSBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICByZXR1cm4gZmlsZTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoZmlsZSk7XG4gIH1cbn07XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbi8vIFdlYk5OIEFQSSBjdXJyZW50bHkgZG9lcyBub3QgaGF2ZSBhIFR5cGVTY3JpcHQgZGVmaW5pdGlvbiBmaWxlLiBUaGlzIGZpbGUgaXMgYSB3b3JrYXJvdW5kIHdpdGggdHlwZXMgZ2VuZXJhdGVkIGZyb21cbi8vIFdlYk5OIEFQSSBzcGVjaWZpY2F0aW9uLlxuLy8gaHR0cHM6Ly9naXRodWIuY29tL3dlYm1hY2hpbmVsZWFybmluZy93ZWJubi9pc3N1ZXMvNjc3XG4vLy8gPHJlZmVyZW5jZSBwYXRoPVwianNlcC93ZWJubi93ZWJubi5kLnRzXCIgLz5cblxuaW1wb3J0IHsgRW52LCBJbmZlcmVuY2VTZXNzaW9uLCBUZW5zb3IgfSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQge1xuICBTZXJpYWxpemFibGVJbnRlcm5hbEJ1ZmZlcixcbiAgU2VyaWFsaXphYmxlU2Vzc2lvbk1ldGFkYXRhLFxuICBTZXJpYWxpemFibGVUZW5zb3JNZXRhZGF0YSxcbiAgVGVuc29yTWV0YWRhdGEsXG59IGZyb20gJy4vcHJveHktbWVzc2FnZXMnO1xuaW1wb3J0IHsgc2V0UnVuT3B0aW9ucyB9IGZyb20gJy4vcnVuLW9wdGlvbnMnO1xuaW1wb3J0IHsgc2V0U2Vzc2lvbk9wdGlvbnMgfSBmcm9tICcuL3Nlc3Npb24tb3B0aW9ucyc7XG5pbXBvcnQge1xuICBjYWxjdWxhdGVUZW5zb3JTaXplSW5CeXRlcyxcbiAgZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtLFxuICBpc0dwdUJ1ZmZlclN1cHBvcnRlZFR5cGUsXG4gIGlzTUxUZW5zb3JTdXBwb3J0ZWRUeXBlLFxuICBsb2dMZXZlbFN0cmluZ1RvRW51bSxcbiAgdGVuc29yRGF0YVR5cGVFbnVtVG9TdHJpbmcsXG4gIHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtLFxuICB0ZW5zb3JUeXBlVG9UeXBlZEFycmF5Q29uc3RydWN0b3IsXG59IGZyb20gJy4vd2FzbS1jb21tb24nO1xuaW1wb3J0IHsgZ2V0SW5zdGFuY2UgfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5pbXBvcnQgeyBhbGxvY1dhc21TdHJpbmcsIGNoZWNrTGFzdEVycm9yIH0gZnJvbSAnLi93YXNtLXV0aWxzJztcbmltcG9ydCB7IGxvYWRGaWxlIH0gZnJvbSAnLi93YXNtLXV0aWxzLWxvYWQtZmlsZSc7XG5cbi8vICNyZWdpb24gSW5pdGlhbGl6YXRpb25zXG5cbi8qKlxuICogVGhlcmUgYXJlIDQgZGlmZmVyZW50IFwiaW5pdGlhbGl6YXRpb25cIiBzdGVwcyBmb3IgT1JULiBUaGV5IGhhcHBlbiBpbiBkaWZmZXJlbnQgcGxhY2VzIGFuZCBkaWZmZXJlbnQgdGltZS5cbiAqXG4gKiAxLiBKYXZhU2NyaXB0IGluaXRpYWxpemF0aW9uIGZvciBvbm54cnVudGltZS1jb21tb24gYW5kIG9ubnhydW50aW1lLXdlYi5cbiAqICAgIFRoaXMgaXMgdGhlIGZpcnN0IGluaXRpYWxpemF0aW9uIHN0ZXAuIEluIHRoaXMgc3RlcCwgb25ueHJ1bnRpbWUtd2ViIGNhbGxzIG9ubnhydW50aW1lLWNvbW1vbidzIHJlZ2lzdGVyQmFja2VuZCgpXG4gKiBmdW5jdGlvbiBtdWx0aXBsZSB0aW1lcyB0byByZWdpc3RlciBhbGwgdGhlIGF2YWlsYWJsZSBiYWNrZW5kcy4gVGhlIGJhY2tlbmQgcmVnaXN0cmF0aW9uIGlzIHZlcnkgZmFzdC4gSXQgb25seVxuICogcmVnaXN0ZXJzIHRoZSBiYWNrZW5kIG5hbWUgd2l0aCB0aGUgdW5pbml0aWFsaXplZCBiYWNrZW5kIG9iamVjdC4gTm8gaGVhdnkgaW5pdGlhbGl6YXRpb24gaXMgZG9uZSBpbiB0aGlzIHN0ZXAuXG4gKiAgICBSZWZlciB0byB3ZWIvbGliL2luZGV4LnRzIGZvciB0aGUgYmFja2VuZCByZWdpc3RyYXRpb24uXG4gKlxuICogMi4gV2ViQXNzZW1ibHkgYXJ0aWZhY3QgaW5pdGlhbGl6YXRpb24uXG4gKiAgICBUaGlzIGhhcHBlbnMgd2hlbiBhbnkgcmVnaXN0ZXJlZCB3YXNtIGJhY2tlbmQgaXMgdXNlZCBmb3IgdGhlIGZpcnN0IHRpbWUgKGllLiBgb3J0LkluZmVyZW5jZVNlc3Npb24uY3JlYXRlKClgIGlzXG4gKiBjYWxsZWQpLiBJbiB0aGlzIHN0ZXAsIG9ubnhydW50aW1lLXdlYiBkb2VzIHRoZSBmb2xsb3dpbmdzOlxuICogICAgIC0gY3JlYXRlIGEgcHJveHkgd29ya2VyIGFuZCBtYWtlIHN1cmUgdGhlIHByb3h5IHdvcmtlciBpcyByZWFkeSB0byByZWNlaXZlIG1lc3NhZ2VzLCBpZiBwcm94eSBpcyBlbmFibGVkLlxuICogICAgIC0gcGVyZm9ybSBmZWF0dXJlIGRldGVjdGlvbiwgbG9jYXRlIGNvcnJlY3QgV2ViQXNzZW1ibHkgYXJ0aWZhY3QgcGF0aCBhbmQgY2FsbCB0aGUgRW1zY3JpcHRlbiBnZW5lcmF0ZWRcbiAqIEphdmFTY3JpcHQgY29kZSB0byBpbml0aWFsaXplIHRoZSBXZWJBc3NlbWJseSBydW50aW1lLlxuICogICAgICAgICAtIGlmIHByb3h5IGlzIGVuYWJsZWQsIHRoaXMgc3RlcCBoYXBwZW5zIGluIHRoZSBwcm94eSB3b3JrZXIgdXNpbmcgbWVzc2FnZSAnaW5pdC13YXNtJy5cbiAqICAgICAgICAgLSBkb3dubG9hZGluZyB0aGUgJ29ydC13YXNtey4uLn0ud2FzbScgZmlsZSBpcyBkb25lIGluIHRoaXMgc3RlcC5cbiAqICAgICAgICAgLSBpZiBtdWx0aS10aHJlYWQgaXMgZW5hYmxlZCwgb25lIG9yIG1vcmUgd2Vid29ya2VyIHdpbGwgYmUgY3JlYXRlZCB0byBpbml0aWFsaXplIHRoZSBQVGhyZWFkIHRocmVhZHBvb2wuXG4gKlxuICogMy4gT1JUIGVudmlyb25tZW50IGluaXRpYWxpemF0aW9uLlxuICogICAgVGhpcyBoYXBwZW5zIGFmdGVyIHN0ZXAgMi4gSW4gdGhpcyBzdGVwLCBvbm54cnVudGltZS13ZWIgcGVyZm9ybXMgT05OWCBSdW50aW1lIGVudmlyb25tZW50IGluaXRpYWxpemF0aW9uLlxuICogRnVuY3Rpb24gYF9PcnRJbml0KClgIGlzIGNhbGxlZCBpbiB0aGlzIHN0ZXAuXG4gKiAgICAgLSBpZiBwcm94eSBpcyBlbmFibGVkLCB0aGlzIHN0ZXAgaGFwcGVucyBpbiB0aGUgcHJveHkgd29ya2VyIHVzaW5nIG1lc3NhZ2UgJ2luaXQtb3J0Jy5cbiAqICAgICAtIGxvZ2dpbmcgbGV2ZWwgKG9ydC5lbnYubG9nTGV2ZWwpIGFuZCB0aHJlYWQgbnVtYmVyIChvcnQuZW52Lndhc20ubnVtVGhyZWFkcykgYXJlIHNldCBpbiB0aGlzIHN0ZXAuXG4gKlxuICogNC4gU2Vzc2lvbiBpbml0aWFsaXphdGlvbi5cbiAqICAgIFRoaXMgaGFwcGVucyB3aGVuIGBvcnQuSW5mZXJlbmNlU2Vzc2lvbi5jcmVhdGUoKWAgaXMgY2FsbGVkLiBVbmxpa2UgdGhlIGZpcnN0IDMgc3RlcHMgKHRoZXkgb25seSBjYWxsZWQgb25jZSksXG4gKiB0aGlzIHN0ZXAgd2lsbCBiZSBkb25lIGZvciBlYWNoIHNlc3Npb24uIEluIHRoaXMgc3RlcCwgb25ueHJ1bnRpbWUtd2ViIGRvZXMgdGhlIGZvbGxvd2luZ3M6XG4gKiAgICBJZiB0aGUgcGFyYW1ldGVyIGlzIGEgVVJMOlxuICogICAgLSBkb3dubG9hZCB0aGUgbW9kZWwgZGF0YSBmcm9tIHRoZSBVUkwuXG4gKiAgICAtIGNvcHkgdGhlIG1vZGVsIGRhdGEgdG8gdGhlIFdBU00gaGVhcC4gKHByb3h5OiAnY29weS1mcm9tJylcbiAqICAgIC0gZGVyZWZlcmVuY2UgdGhlIG1vZGVsIGJ1ZmZlci4gVGhpcyBzdGVwIGFsbG93cyB0aGUgb3JpZ2luYWwgQXJyYXlCdWZmZXIgdG8gYmUgZ2FyYmFnZSBjb2xsZWN0ZWQuXG4gKiAgICAtIGNhbGwgYF9PcnRDcmVhdGVTZXNzaW9uKClgIHRvIGNyZWF0ZSB0aGUgc2Vzc2lvbi4gKHByb3h5OiAnY3JlYXRlJylcbiAqXG4gKiAgICBJZiB0aGUgcGFyYW1ldGVyIGlzIGEgVWludDhBcnJheSBvYmplY3Q6XG4gKiAgICAtIGNvcHkgdGhlIG1vZGVsIGRhdGEgdG8gdGhlIFdBU00gaGVhcC4gKHByb3h5OiAnY29weS1mcm9tJylcbiAqICAgIC0gY2FsbCBgX09ydENyZWF0ZVNlc3Npb24oKWAgdG8gY3JlYXRlIHRoZSBzZXNzaW9uLiAocHJveHk6ICdjcmVhdGUnKVxuICpcbiAqXG4gKi9cblxuLyoqXG4gKiBpbml0aWFsaXplIE9SVCBlbnZpcm9ubWVudC5cbiAqXG4gKiBAcGFyYW0gbnVtVGhyZWFkcyBTZXRHbG9iYWxJbnRyYU9wTnVtVGhyZWFkcyhudW1UaHJlYWRzKVxuICogQHBhcmFtIGxvZ2dpbmdMZXZlbCBDcmVhdGVFbnYoc3RhdGljX2Nhc3Q8T3J0TG9nZ2luZ0xldmVsPihsb2dnaW5nX2xldmVsKSlcbiAqL1xuY29uc3QgaW5pdE9ydCA9IChudW1UaHJlYWRzOiBudW1iZXIsIGxvZ2dpbmdMZXZlbDogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IGVycm9yQ29kZSA9IGdldEluc3RhbmNlKCkuX09ydEluaXQobnVtVGhyZWFkcywgbG9nZ2luZ0xldmVsKTtcbiAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgIGNoZWNrTGFzdEVycm9yKFwiQ2FuJ3QgaW5pdGlhbGl6ZSBvbm54cnVudGltZS5cIik7XG4gIH1cbn07XG5cbi8qKlxuICogaW5pdGlhbGl6ZSBydW50aW1lIGVudmlyb25tZW50LlxuICogQHBhcmFtIGVudiBwYXNzZWQgaW4gdGhlIGVudmlyb25tZW50IGNvbmZpZyBvYmplY3QuXG4gKi9cbmV4cG9ydCBjb25zdCBpbml0UnVudGltZSA9IGFzeW5jIChlbnY6IEVudik6IFByb21pc2U8dm9pZD4gPT4ge1xuICAvLyBpbml0IE9SVFxuICBpbml0T3J0KGVudi53YXNtLm51bVRocmVhZHMhLCBsb2dMZXZlbFN0cmluZ1RvRW51bShlbnYubG9nTGV2ZWwpKTtcbn07XG5cbi8qKlxuICogcGVyZm9ybSBFUCBzcGVjaWZpYyBpbml0aWFsaXphdGlvbi5cbiAqXG4gKiBAcGFyYW0gZW52XG4gKiBAcGFyYW0gZXBOYW1lXG4gKi9cbmV4cG9ydCBjb25zdCBpbml0RXAgPSBhc3luYyAoZW52OiBFbnYsIGVwTmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIC8vIGluaXRpYWxpemUgQVNZTkNJRlkgc3VwcG9ydFxuICBnZXRJbnN0YW5jZSgpLmFzeW5jSW5pdD8uKCk7XG5cbiAgaWYgKGVwTmFtZSA9PT0gJ3dlYmdwdScgJiYgQlVJTERfREVGUy5VU0VfV0VCR1BVX0VQKSB7XG4gICAgZ2V0SW5zdGFuY2UoKS53ZWJncHVJbml0ISgoZGV2aWNlKSA9PiB7XG4gICAgICBlbnYud2ViZ3B1LmRldmljZSA9IGRldmljZTtcbiAgICB9KTtcbiAgfVxuXG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX0pTRVApIHtcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0cywgQHR5cGVzY3JpcHQtZXNsaW50L25vLXZhci1yZXF1aXJlc1xuICAgIGNvbnN0IGluaXRKc2VwID0gcmVxdWlyZSgnLi9qc2VwL2luaXQnKS5pbml0O1xuXG4gICAgaWYgKGVwTmFtZSA9PT0gJ3dlYmdwdScgJiYgIUJVSUxEX0RFRlMuVVNFX1dFQkdQVV9FUCkge1xuICAgICAgLy8gcGVyZm9ybSBXZWJHUFUgYXZhaWxhYmlsaXR5IGNoZWNrXG4gICAgICBpZiAodHlwZW9mIG5hdmlnYXRvciA9PT0gJ3VuZGVmaW5lZCcgfHwgIW5hdmlnYXRvci5ncHUpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdXZWJHUFUgaXMgbm90IHN1cHBvcnRlZCBpbiBjdXJyZW50IGVudmlyb25tZW50Jyk7XG4gICAgICB9XG5cbiAgICAgIGxldCBhZGFwdGVyID0gZW52LndlYmdwdS5hZGFwdGVyIGFzIEdQVUFkYXB0ZXIgfCBudWxsO1xuICAgICAgaWYgKCFhZGFwdGVyKSB7XG4gICAgICAgIC8vIGlmIGFkYXB0ZXIgaXMgbm90IHNldCwgcmVxdWVzdCBhIG5ldyBhZGFwdGVyLlxuICAgICAgICBjb25zdCBwb3dlclByZWZlcmVuY2UgPSBlbnYud2ViZ3B1LnBvd2VyUHJlZmVyZW5jZTtcbiAgICAgICAgaWYgKFxuICAgICAgICAgIHBvd2VyUHJlZmVyZW5jZSAhPT0gdW5kZWZpbmVkICYmXG4gICAgICAgICAgcG93ZXJQcmVmZXJlbmNlICE9PSAnbG93LXBvd2VyJyAmJlxuICAgICAgICAgIHBvd2VyUHJlZmVyZW5jZSAhPT0gJ2hpZ2gtcGVyZm9ybWFuY2UnXG4gICAgICAgICkge1xuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgSW52YWxpZCBwb3dlclByZWZlcmVuY2Ugc2V0dGluZzogXCIke3Bvd2VyUHJlZmVyZW5jZX1cImApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IGZvcmNlRmFsbGJhY2tBZGFwdGVyID0gZW52LndlYmdwdS5mb3JjZUZhbGxiYWNrQWRhcHRlcjtcbiAgICAgICAgaWYgKGZvcmNlRmFsbGJhY2tBZGFwdGVyICE9PSB1bmRlZmluZWQgJiYgdHlwZW9mIGZvcmNlRmFsbGJhY2tBZGFwdGVyICE9PSAnYm9vbGVhbicpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgZm9yY2VGYWxsYmFja0FkYXB0ZXIgc2V0dGluZzogXCIke2ZvcmNlRmFsbGJhY2tBZGFwdGVyfVwiYCk7XG4gICAgICAgIH1cbiAgICAgICAgYWRhcHRlciA9IGF3YWl0IG5hdmlnYXRvci5ncHUucmVxdWVzdEFkYXB0ZXIoeyBwb3dlclByZWZlcmVuY2UsIGZvcmNlRmFsbGJhY2tBZGFwdGVyIH0pO1xuICAgICAgICBpZiAoIWFkYXB0ZXIpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAnRmFpbGVkIHRvIGdldCBHUFUgYWRhcHRlci4gJyArXG4gICAgICAgICAgICAgICdZb3UgbWF5IG5lZWQgdG8gZW5hYmxlIGZsYWcgXCItLWVuYWJsZS11bnNhZmUtd2ViZ3B1XCIgaWYgeW91IGFyZSB1c2luZyBDaHJvbWUuJyxcbiAgICAgICAgICApO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICAvLyBpZiBhZGFwdGVyIGlzIHNldCwgdmFsaWRhdGUgaXQuXG4gICAgICAgIGlmIChcbiAgICAgICAgICB0eXBlb2YgYWRhcHRlci5saW1pdHMgIT09ICdvYmplY3QnIHx8XG4gICAgICAgICAgdHlwZW9mIGFkYXB0ZXIuZmVhdHVyZXMgIT09ICdvYmplY3QnIHx8XG4gICAgICAgICAgdHlwZW9mIGFkYXB0ZXIucmVxdWVzdERldmljZSAhPT0gJ2Z1bmN0aW9uJ1xuICAgICAgICApIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0ludmFsaWQgR1BVIGFkYXB0ZXIgc2V0IGluIGBlbnYud2ViZ3B1LmFkYXB0ZXJgLiBJdCBtdXN0IGJlIGEgR1BVQWRhcHRlciBvYmplY3QuJyk7XG4gICAgICAgIH1cbiAgICAgIH1cblxuICAgICAgYXdhaXQgaW5pdEpzZXAoJ3dlYmdwdScsIGdldEluc3RhbmNlKCksIGVudiwgYWRhcHRlcik7XG4gICAgfVxuICAgIGlmIChlcE5hbWUgPT09ICd3ZWJubicpIHtcbiAgICAgIC8vIHBlcmZvcm0gV2ViTk4gYXZhaWxhYmlsaXR5IGNoZWNrXG4gICAgICBpZiAodHlwZW9mIG5hdmlnYXRvciA9PT0gJ3VuZGVmaW5lZCcgfHwgIShuYXZpZ2F0b3IgYXMgdW5rbm93biBhcyB7IG1sOiB1bmtub3duIH0pLm1sKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcignV2ViTk4gaXMgbm90IHN1cHBvcnRlZCBpbiBjdXJyZW50IGVudmlyb25tZW50Jyk7XG4gICAgICB9XG5cbiAgICAgIGF3YWl0IGluaXRKc2VwKCd3ZWJubicsIGdldEluc3RhbmNlKCksIGVudik7XG4gICAgfVxuICB9XG59O1xuXG4vLyAjZW5kcmVnaW9uIEluaXRpYWxpemF0aW9uc1xuXG4vKipcbiAqIHZhbGlkIGRhdGEgbG9jYXRpb25zIGZvciBpbnB1dC9vdXRwdXQgdGVuc29ycy5cbiAqL1xudHlwZSBTdXBwb3J0ZWRUZW5zb3JEYXRhTG9jYXRpb25Gb3JJbnB1dE91dHB1dCA9XG4gIHwgJ2NwdSdcbiAgfCAnY3B1LXBpbm5lZCdcbiAgfCAnZ3B1LWJ1ZmZlcidcbiAgfCAnbWwtdGVuc29yJ1xuICAvLyBVc2UgJ21sLXRlbnNvcicgZHVyaW5nIGluZmVyZW5jZSwgYnV0IG91dHB1dCBhIHRlbnNvciBsb2NhdGVkIG9uIHRoZSBDUFUuXG4gIHwgJ21sLXRlbnNvci1jcHUtb3V0cHV0JztcblxudHlwZSBJT0JpbmRpbmdTdGF0ZSA9IHtcbiAgLyoqXG4gICAqIHRoZSBoYW5kbGUgb2YgSU8gYmluZGluZy5cbiAgICovXG4gIHJlYWRvbmx5IGhhbmRsZTogbnVtYmVyO1xuXG4gIC8qKlxuICAgKiB0aGUgcHJlZmVycmVkIGxvY2F0aW9uIGZvciBlYWNoIG91dHB1dCB0ZW5zb3IuXG4gICAqXG4gICAqIHZhbHVlIGlzIG9uZSBvZiAnY3B1JywgJ2NwdS1waW5uZWQnLCAnZ3B1LWJ1ZmZlcicsICdtbC10ZW5zb3InLlxuICAgKi9cbiAgcmVhZG9ubHkgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zOiByZWFkb25seSBTdXBwb3J0ZWRUZW5zb3JEYXRhTG9jYXRpb25Gb3JJbnB1dE91dHB1dFtdO1xuXG4gIC8qKlxuICAgKiBlbnVtIHZhbHVlIG9mIHRoZSBwcmVmZXJyZWQgbG9jYXRpb24gZm9yIGVhY2ggb3V0cHV0IHRlbnNvci5cbiAgICovXG4gIHJlYWRvbmx5IG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWQ6IHJlYWRvbmx5IG51bWJlcltdO1xufTtcblxuLyoqXG4gKiAgdHVwbGUgZWxlbWVudHMgYXJlOiBJbmZlcmVuY2VTZXNzaW9uIElEOyBpbnB1dE5hbWVzVVRGOEVuY29kZWQ7IG91dHB1dE5hbWVzVVRGOEVuY29kZWQ7IGJpbmRpbmdTdGF0ZVxuICovXG50eXBlIFNlc3Npb25NZXRhZGF0YSA9IFtcbiAgaW5mZXJlbmNlU2Vzc2lvbklkOiBudW1iZXIsXG4gIGlucHV0TmFtZXNVVEY4RW5jb2RlZDogbnVtYmVyW10sXG4gIG91dHB1dE5hbWVzVVRGOEVuY29kZWQ6IG51bWJlcltdLFxuICBiaW5kaW5nU3RhdGU6IElPQmluZGluZ1N0YXRlIHwgbnVsbCxcbiAgZW5hYmxlR3JhcGhDYXB0dXJlOiBib29sZWFuLFxuICBpbnB1dE91dHB1dEJvdW5kOiBib29sZWFuLFxuXTtcblxuY29uc3QgYWN0aXZlU2Vzc2lvbnMgPSBuZXcgTWFwPG51bWJlciwgU2Vzc2lvbk1ldGFkYXRhPigpO1xuXG4vKipcbiAqIGdldCB0aGUgaW5wdXQvb3V0cHV0IGNvdW50IG9mIHRoZSBzZXNzaW9uLlxuICogQHBhcmFtIHNlc3Npb25IYW5kbGUgdGhlIGhhbmRsZSByZXByZXNlbnRpbmcgdGhlIHNlc3Npb24uIHNob3VsZCBiZSBub24temVyby5cbiAqIEByZXR1cm5zIGEgdHVwbGUgaW5jbHVkaW5nIDIgbnVtYmVycywgcmVwcmVzZW50aW5nIHRoZSBpbnB1dCBjb3VudCBhbmQgb3V0cHV0IGNvdW50LlxuICovXG5jb25zdCBnZXRTZXNzaW9uSW5wdXRPdXRwdXRDb3VudCA9IChzZXNzaW9uSGFuZGxlOiBudW1iZXIpOiBbbnVtYmVyLCBudW1iZXJdID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgdHJ5IHtcbiAgICBjb25zdCBwdHJTaXplID0gd2FzbS5QVFJfU0laRTtcbiAgICBjb25zdCBkYXRhT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDIgKiBwdHJTaXplKTtcbiAgICBjb25zdCBlcnJvckNvZGUgPSB3YXNtLl9PcnRHZXRJbnB1dE91dHB1dENvdW50KHNlc3Npb25IYW5kbGUsIGRhdGFPZmZzZXQsIGRhdGFPZmZzZXQgKyBwdHJTaXplKTtcbiAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcihcIkNhbid0IGdldCBzZXNzaW9uIGlucHV0L291dHB1dCBjb3VudC5cIik7XG4gICAgfVxuICAgIGNvbnN0IHR5cGUgPSBwdHJTaXplID09PSA0ID8gJ2kzMicgOiAnaTY0JztcbiAgICByZXR1cm4gW051bWJlcih3YXNtLmdldFZhbHVlKGRhdGFPZmZzZXQsIHR5cGUpKSwgTnVtYmVyKHdhc20uZ2V0VmFsdWUoZGF0YU9mZnNldCArIHB0clNpemUsIHR5cGUpKV07XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5zdGFja1Jlc3RvcmUoc3RhY2spO1xuICB9XG59O1xuXG5jb25zdCBnZXRTZXNzaW9uSW5wdXRPdXRwdXRNZXRhZGF0YSA9IChcbiAgc2Vzc2lvbkhhbmRsZTogbnVtYmVyLFxuICBpbmRleDogbnVtYmVyLFxuKTogW25hbWVPZmZzZXQ6IG51bWJlciwgZWxlbWVudFR5cGU6IG51bWJlciwgZGltcz86IEFycmF5PG51bWJlciB8IHN0cmluZz5dID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgbGV0IG1ldGFkYXRhT2Zmc2V0ID0gMDtcbiAgdHJ5IHtcbiAgICBjb25zdCBwdHJTaXplID0gd2FzbS5QVFJfU0laRTtcbiAgICBjb25zdCBkYXRhT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDIgKiBwdHJTaXplKTtcbiAgICBjb25zdCBlcnJvckNvZGUgPSB3YXNtLl9PcnRHZXRJbnB1dE91dHB1dE1ldGFkYXRhKHNlc3Npb25IYW5kbGUsIGluZGV4LCBkYXRhT2Zmc2V0LCBkYXRhT2Zmc2V0ICsgcHRyU2l6ZSk7XG4gICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoXCJDYW4ndCBnZXQgc2Vzc2lvbiBpbnB1dC9vdXRwdXQgbWV0YWRhdGEuXCIpO1xuICAgIH1cbiAgICBjb25zdCBuYW1lT2Zmc2V0ID0gTnVtYmVyKHdhc20uZ2V0VmFsdWUoZGF0YU9mZnNldCwgJyonKSk7XG4gICAgbWV0YWRhdGFPZmZzZXQgPSBOdW1iZXIod2FzbS5nZXRWYWx1ZShkYXRhT2Zmc2V0ICsgcHRyU2l6ZSwgJyonKSk7XG4gICAgLy8gZ2V0IGVsZW1lbnQgdHlwZVxuICAgIGNvbnN0IGVsZW1lbnRUeXBlID0gd2FzbS5IRUFQMzJbbWV0YWRhdGFPZmZzZXQgLyA0XTtcbiAgICBpZiAoZWxlbWVudFR5cGUgPT09IDApIHtcbiAgICAgIHJldHVybiBbbmFtZU9mZnNldCwgMF07IC8vIG5vbi10ZW5zb3JcbiAgICB9XG5cbiAgICAvLyBnZXQgZGltcyBjb3VudFxuICAgIGNvbnN0IGRpbXNDb3VudCA9IHdhc20uSEVBUFUzMlttZXRhZGF0YU9mZnNldCAvIDQgKyAxXTtcbiAgICAvLyBnZXQgZGltc1xuICAgIGNvbnN0IGRpbXM6IEFycmF5PG51bWJlciB8IHN0cmluZz4gPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbXNDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCBzeW1ib2xpY0RpbU5hbWVPZmZzZXQgPSBOdW1iZXIod2FzbS5nZXRWYWx1ZShtZXRhZGF0YU9mZnNldCArIDggKyBpICogcHRyU2l6ZSwgJyonKSk7XG4gICAgICBkaW1zLnB1c2goXG4gICAgICAgIHN5bWJvbGljRGltTmFtZU9mZnNldCAhPT0gMFxuICAgICAgICAgID8gd2FzbS5VVEY4VG9TdHJpbmcoc3ltYm9saWNEaW1OYW1lT2Zmc2V0KVxuICAgICAgICAgIDogTnVtYmVyKHdhc20uZ2V0VmFsdWUobWV0YWRhdGFPZmZzZXQgKyA4ICsgKGkgKyBkaW1zQ291bnQpICogcHRyU2l6ZSwgJyonKSksXG4gICAgICApO1xuICAgIH1cbiAgICByZXR1cm4gW25hbWVPZmZzZXQsIGVsZW1lbnRUeXBlLCBkaW1zXTtcbiAgfSBmaW5hbGx5IHtcbiAgICB3YXNtLnN0YWNrUmVzdG9yZShzdGFjayk7XG4gICAgaWYgKG1ldGFkYXRhT2Zmc2V0ICE9PSAwKSB7XG4gICAgICB3YXNtLl9PcnRGcmVlKG1ldGFkYXRhT2Zmc2V0KTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogYWxsb2NhdGUgdGhlIG1lbW9yeSBhbmQgbWVtY3B5IHRoZSBleHRlcm5hbCBidWZmZXIuXG4gKlxuICogQHBhcmFtIG1vZGVsIC0gdGhlIGV4dGVybmFsIGJ1ZmZlciBjb250YWluaW5nIHRoZSBtb2RlbCBkYXRhLiBNdXN0IG5vdCBiZSB0aGUgc2FtZSBidWZmZXIgYXMgdGhlIFdBU00gaGVhcC5cbiAqIEByZXR1cm5zIGEgMi1lbGVtZW50cyB0dXBsZSAtIHRoZSBwb2ludGVyIGFuZCBzaXplIG9mIHRoZSBhbGxvY2F0ZWQgYnVmZmVyXG4gKi9cbmV4cG9ydCBjb25zdCBjb3B5RnJvbUV4dGVybmFsQnVmZmVyID0gKG1vZGVsOiBVaW50OEFycmF5KTogW251bWJlciwgbnVtYmVyXSA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBtb2RlbERhdGFPZmZzZXQgPSB3YXNtLl9tYWxsb2MobW9kZWwuYnl0ZUxlbmd0aCk7XG4gIGlmIChtb2RlbERhdGFPZmZzZXQgPT09IDApIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGNyZWF0ZSBhIHNlc3Npb24uIGZhaWxlZCB0byBhbGxvY2F0ZSBhIGJ1ZmZlciBvZiBzaXplICR7bW9kZWwuYnl0ZUxlbmd0aH0uYCk7XG4gIH1cbiAgd2FzbS5IRUFQVTguc2V0KG1vZGVsLCBtb2RlbERhdGFPZmZzZXQpO1xuICByZXR1cm4gW21vZGVsRGF0YU9mZnNldCwgbW9kZWwuYnl0ZUxlbmd0aF07XG59O1xuXG4vKipcbiAqIGNyZWF0ZSBhbiBpbmZlcmVuY2Ugc2Vzc2lvbiBmcm9tIGEgbW9kZWwgZGF0YSBidWZmZXIuXG4gKlxuICogQHBhcmFtIG1vZGVsRGF0YSAtIGVpdGhlciBhIFVpbnQ4QXJyYXkgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgbW9kZWwgZGF0YSwgb3IgYSAyLWVsZW1lbnRzIHR1cGxlIGNvbnRhaW5pbmcgdGhlXG4gKiAgICAgcG9pbnRlciBhbmQgc2l6ZSBvZiB0aGUgbW9kZWwgZGF0YSBidWZmZXIuXG4gKiBAcGFyYW0gb3B0aW9ucyBhbiBvcHRpb25hbCBzZXNzaW9uIG9wdGlvbnMgb2JqZWN0LlxuICogQHJldHVybnMgYSAzLWVsZW1lbnRzIHR1cGxlIGNvbnRhaW5pbmcgW3Nlc3Npb24gaGFuZGxlLCBpbnB1dCBuYW1lcywgb3V0cHV0IG5hbWVzXVxuICovXG5leHBvcnQgY29uc3QgY3JlYXRlU2Vzc2lvbiA9IGFzeW5jIChcbiAgbW9kZWxEYXRhOiBVaW50OEFycmF5IHwgU2VyaWFsaXphYmxlSW50ZXJuYWxCdWZmZXIsXG4gIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zLFxuKTogUHJvbWlzZTxTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGE+ID0+IHtcbiAgbGV0IG1vZGVsRGF0YU9mZnNldDogbnVtYmVyLCBtb2RlbERhdGFMZW5ndGg6IG51bWJlcjtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG5cbiAgaWYgKEFycmF5LmlzQXJyYXkobW9kZWxEYXRhKSkge1xuICAgIC8vIGlmIG1vZGVsIGRhdGEgaXMgYW4gYXJyYXksIGl0IG11c3QgYmUgYSAyLWVsZW1lbnRzIHR1cGxlIGNvbnRhaW5pbmcgdGhlIHBvaW50ZXIgYW5kIHNpemUgb2YgdGhlIG1vZGVsIGRhdGFcbiAgICBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbERhdGFMZW5ndGhdID0gbW9kZWxEYXRhO1xuICB9IGVsc2UgaWYgKG1vZGVsRGF0YS5idWZmZXIgPT09IHdhc20uSEVBUFU4LmJ1ZmZlcikge1xuICAgIC8vIGlmIG1vZGVsIGRhdGEgdXNlcyB0aGUgc2FtZSBidWZmZXIgYXMgdGhlIFdBU00gaGVhcCwgd2UgZG9uJ3QgbmVlZCB0byBjb3B5IGl0LlxuICAgIFttb2RlbERhdGFPZmZzZXQsIG1vZGVsRGF0YUxlbmd0aF0gPSBbbW9kZWxEYXRhLmJ5dGVPZmZzZXQsIG1vZGVsRGF0YS5ieXRlTGVuZ3RoXTtcbiAgfSBlbHNlIHtcbiAgICAvLyBvdGhlcndpc2UsIGNvcHkgdGhlIG1vZGVsIGRhdGEgdG8gdGhlIFdBU00gaGVhcC5cbiAgICBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbERhdGFMZW5ndGhdID0gY29weUZyb21FeHRlcm5hbEJ1ZmZlcihtb2RlbERhdGEpO1xuICB9XG5cbiAgbGV0IHNlc3Npb25IYW5kbGUgPSAwO1xuICBsZXQgc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPSAwO1xuICBsZXQgaW9CaW5kaW5nSGFuZGxlID0gMDtcbiAgbGV0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgaW5wdXROYW1lc1VURjhFbmNvZGVkID0gW107XG4gIGNvbnN0IG91dHB1dE5hbWVzVVRGOEVuY29kZWQgPSBbXTtcblxuICB0cnkge1xuICAgIFtzZXNzaW9uT3B0aW9uc0hhbmRsZSwgYWxsb2NzXSA9IGF3YWl0IHNldFNlc3Npb25PcHRpb25zKG9wdGlvbnMpO1xuXG4gICAgaWYgKG9wdGlvbnM/LmV4dGVybmFsRGF0YSAmJiB3YXNtLm1vdW50RXh0ZXJuYWxEYXRhKSB7XG4gICAgICBjb25zdCBsb2FkaW5nUHJvbWlzZXMgPSBbXTtcbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBvcHRpb25zLmV4dGVybmFsRGF0YSkge1xuICAgICAgICBjb25zdCBwYXRoID0gdHlwZW9mIGZpbGUgPT09ICdzdHJpbmcnID8gZmlsZSA6IGZpbGUucGF0aDtcbiAgICAgICAgbG9hZGluZ1Byb21pc2VzLnB1c2goXG4gICAgICAgICAgbG9hZEZpbGUodHlwZW9mIGZpbGUgPT09ICdzdHJpbmcnID8gZmlsZSA6IGZpbGUuZGF0YSkudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgd2FzbS5tb3VudEV4dGVybmFsRGF0YShwYXRoLCBkYXRhKTtcbiAgICAgICAgICB9KSxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gd2FpdCBmb3IgYWxsIGV4dGVybmFsIGRhdGEgZmlsZXMgdG8gYmUgbG9hZGVkXG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChsb2FkaW5nUHJvbWlzZXMpO1xuICAgIH1cblxuICAgIGZvciAoY29uc3QgcHJvdmlkZXIgb2Ygb3B0aW9ucz8uZXhlY3V0aW9uUHJvdmlkZXJzID8/IFtdKSB7XG4gICAgICBjb25zdCBwcm92aWRlck5hbWUgPSB0eXBlb2YgcHJvdmlkZXIgPT09ICdzdHJpbmcnID8gcHJvdmlkZXIgOiBwcm92aWRlci5uYW1lO1xuICAgICAgaWYgKHByb3ZpZGVyTmFtZSA9PT0gJ3dlYm5uJykge1xuICAgICAgICB3YXNtLnNob3VsZFRyYW5zZmVyVG9NTFRlbnNvciA9IGZhbHNlO1xuICAgICAgICBpZiAodHlwZW9mIHByb3ZpZGVyICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIGNvbnN0IHdlYm5uT3B0aW9ucyA9IHByb3ZpZGVyIGFzIEluZmVyZW5jZVNlc3Npb24uV2ViTk5FeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcbiAgICAgICAgICBjb25zdCBjb250ZXh0ID0gKHdlYm5uT3B0aW9ucyBhcyBJbmZlcmVuY2VTZXNzaW9uLldlYk5OT3B0aW9uc1dpdGhNTENvbnRleHQpPy5jb250ZXh0O1xuICAgICAgICAgIGNvbnN0IGdwdURldmljZSA9ICh3ZWJubk9wdGlvbnMgYXMgSW5mZXJlbmNlU2Vzc2lvbi5XZWJOTk9wdGlvbnNXZWJHcHUpPy5ncHVEZXZpY2U7XG4gICAgICAgICAgY29uc3QgZGV2aWNlVHlwZSA9ICh3ZWJubk9wdGlvbnMgYXMgSW5mZXJlbmNlU2Vzc2lvbi5XZWJOTkNvbnRleHRPcHRpb25zKT8uZGV2aWNlVHlwZTtcbiAgICAgICAgICBjb25zdCBwb3dlclByZWZlcmVuY2UgPSAod2Vibm5PcHRpb25zIGFzIEluZmVyZW5jZVNlc3Npb24uV2ViTk5Db250ZXh0T3B0aW9ucyk/LnBvd2VyUHJlZmVyZW5jZTtcbiAgICAgICAgICBpZiAoY29udGV4dCkge1xuICAgICAgICAgICAgd2FzbS5jdXJyZW50Q29udGV4dCA9IGNvbnRleHQgYXMgTUxDb250ZXh0O1xuICAgICAgICAgIH0gZWxzZSBpZiAoZ3B1RGV2aWNlKSB7XG4gICAgICAgICAgICB3YXNtLmN1cnJlbnRDb250ZXh0ID0gYXdhaXQgd2FzbS53ZWJubkNyZWF0ZU1MQ29udGV4dCEoZ3B1RGV2aWNlKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgd2FzbS5jdXJyZW50Q29udGV4dCA9IGF3YWl0IHdhc20ud2Vibm5DcmVhdGVNTENvbnRleHQhKHsgZGV2aWNlVHlwZSwgcG93ZXJQcmVmZXJlbmNlIH0pO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3YXNtLmN1cnJlbnRDb250ZXh0ID0gYXdhaXQgd2FzbS53ZWJubkNyZWF0ZU1MQ29udGV4dCEoKTtcbiAgICAgICAgfVxuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICB9XG5cbiAgICBzZXNzaW9uSGFuZGxlID0gYXdhaXQgd2FzbS5fT3J0Q3JlYXRlU2Vzc2lvbihtb2RlbERhdGFPZmZzZXQsIG1vZGVsRGF0YUxlbmd0aCwgc2Vzc2lvbk9wdGlvbnNIYW5kbGUpO1xuICAgIHdhc20ud2ViZ3B1T25DcmVhdGVTZXNzaW9uPy4oc2Vzc2lvbkhhbmRsZSk7XG4gICAgaWYgKHNlc3Npb25IYW5kbGUgPT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKFwiQ2FuJ3QgY3JlYXRlIGEgc2Vzc2lvbi5cIik7XG4gICAgfVxuXG4gICAgd2FzbS5qc2VwT25DcmVhdGVTZXNzaW9uPy4oKTtcblxuICAgIC8vIGNsZWFyIGN1cnJlbnQgTUxDb250ZXh0IGFmdGVyIHNlc3Npb24gY3JlYXRpb25cbiAgICBpZiAod2FzbS5jdXJyZW50Q29udGV4dCkge1xuICAgICAgd2FzbS53ZWJublJlZ2lzdGVyTUxDb250ZXh0IShzZXNzaW9uSGFuZGxlLCB3YXNtLmN1cnJlbnRDb250ZXh0KTtcbiAgICAgIHdhc20uY3VycmVudENvbnRleHQgPSB1bmRlZmluZWQ7XG4gICAgICB3YXNtLnNob3VsZFRyYW5zZmVyVG9NTFRlbnNvciA9IHRydWU7XG4gICAgfVxuXG4gICAgY29uc3QgW2lucHV0Q291bnQsIG91dHB1dENvdW50XSA9IGdldFNlc3Npb25JbnB1dE91dHB1dENvdW50KHNlc3Npb25IYW5kbGUpO1xuXG4gICAgY29uc3QgZW5hYmxlR3JhcGhDYXB0dXJlID0gISFvcHRpb25zPy5lbmFibGVHcmFwaENhcHR1cmU7XG5cbiAgICBjb25zdCBpbnB1dE5hbWVzID0gW107XG4gICAgY29uc3Qgb3V0cHV0TmFtZXMgPSBbXTtcbiAgICBjb25zdCBpbnB1dE1ldGFkYXRhOiBJbmZlcmVuY2VTZXNzaW9uLlZhbHVlTWV0YWRhdGFbXSA9IFtdO1xuICAgIGNvbnN0IG91dHB1dE1ldGFkYXRhOiBJbmZlcmVuY2VTZXNzaW9uLlZhbHVlTWV0YWRhdGFbXSA9IFtdO1xuICAgIGNvbnN0IG91dHB1dFByZWZlcnJlZExvY2F0aW9uczogU3VwcG9ydGVkVGVuc29yRGF0YUxvY2F0aW9uRm9ySW5wdXRPdXRwdXRbXSA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCBbbmFtZU9mZnNldCwgZWxlbWVudFR5cGUsIHNoYXBlXSA9IGdldFNlc3Npb25JbnB1dE91dHB1dE1ldGFkYXRhKHNlc3Npb25IYW5kbGUsIGkpO1xuICAgICAgaWYgKG5hbWVPZmZzZXQgPT09IDApIHtcbiAgICAgICAgY2hlY2tMYXN0RXJyb3IoXCJDYW4ndCBnZXQgYW4gaW5wdXQgbmFtZS5cIik7XG4gICAgICB9XG4gICAgICBpbnB1dE5hbWVzVVRGOEVuY29kZWQucHVzaChuYW1lT2Zmc2V0KTtcbiAgICAgIGNvbnN0IG5hbWUgPSB3YXNtLlVURjhUb1N0cmluZyhuYW1lT2Zmc2V0KTtcbiAgICAgIGlucHV0TmFtZXMucHVzaChuYW1lKTtcbiAgICAgIGlucHV0TWV0YWRhdGEucHVzaChcbiAgICAgICAgZWxlbWVudFR5cGUgPT09IDBcbiAgICAgICAgICA/IHsgbmFtZSwgaXNUZW5zb3I6IGZhbHNlIH1cbiAgICAgICAgICA6IHsgbmFtZSwgaXNUZW5zb3I6IHRydWUsIHR5cGU6IHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nKGVsZW1lbnRUeXBlKSwgc2hhcGU6IHNoYXBlISB9LFxuICAgICAgKTtcbiAgICB9XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XG4gICAgICBjb25zdCBbbmFtZU9mZnNldCwgZWxlbWVudFR5cGUsIHNoYXBlXSA9IGdldFNlc3Npb25JbnB1dE91dHB1dE1ldGFkYXRhKHNlc3Npb25IYW5kbGUsIGkgKyBpbnB1dENvdW50KTtcbiAgICAgIGlmIChuYW1lT2Zmc2V0ID09PSAwKSB7XG4gICAgICAgIGNoZWNrTGFzdEVycm9yKFwiQ2FuJ3QgZ2V0IGFuIG91dHB1dCBuYW1lLlwiKTtcbiAgICAgIH1cbiAgICAgIG91dHB1dE5hbWVzVVRGOEVuY29kZWQucHVzaChuYW1lT2Zmc2V0KTtcbiAgICAgIGNvbnN0IG5hbWVTdHJpbmcgPSB3YXNtLlVURjhUb1N0cmluZyhuYW1lT2Zmc2V0KTtcbiAgICAgIG91dHB1dE5hbWVzLnB1c2gobmFtZVN0cmluZyk7XG4gICAgICBvdXRwdXRNZXRhZGF0YS5wdXNoKFxuICAgICAgICBlbGVtZW50VHlwZSA9PT0gMFxuICAgICAgICAgID8geyBuYW1lOiBuYW1lU3RyaW5nLCBpc1RlbnNvcjogZmFsc2UgfVxuICAgICAgICAgIDogeyBuYW1lOiBuYW1lU3RyaW5nLCBpc1RlbnNvcjogdHJ1ZSwgdHlwZTogdGVuc29yRGF0YVR5cGVFbnVtVG9TdHJpbmcoZWxlbWVudFR5cGUpLCBzaGFwZTogc2hhcGUhIH0sXG4gICAgICApO1xuXG4gICAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9KU0VQKSB7XG4gICAgICAgIGlmIChlbmFibGVHcmFwaENhcHR1cmUgJiYgb3B0aW9ucz8ucHJlZmVycmVkT3V0cHV0TG9jYXRpb24gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5wdXNoKCdncHUtYnVmZmVyJyk7XG4gICAgICAgICAgY29udGludWU7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgbG9jYXRpb24gPVxuICAgICAgICAgIHR5cGVvZiBvcHRpb25zPy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbiA9PT0gJ3N0cmluZydcbiAgICAgICAgICAgID8gb3B0aW9ucy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvblxuICAgICAgICAgICAgOiAob3B0aW9ucz8ucHJlZmVycmVkT3V0cHV0TG9jYXRpb24/LltuYW1lU3RyaW5nXSA/PyAnY3B1Jyk7XG4gICAgICAgIGNvbnN0IGlzR3JhcGhPdXRwdXQgPSB3YXNtLndlYm5uSXNHcmFwaE91dHB1dDtcbiAgICAgICAgaWYgKGxvY2F0aW9uID09PSAnY3B1JyAmJiBpc0dyYXBoT3V0cHV0ICYmIGlzR3JhcGhPdXRwdXQoc2Vzc2lvbkhhbmRsZSwgbmFtZVN0cmluZykpIHtcbiAgICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMucHVzaCgnbWwtdGVuc29yLWNwdS1vdXRwdXQnKTtcbiAgICAgICAgICBjb250aW51ZTtcbiAgICAgICAgfVxuICAgICAgICBpZiAobG9jYXRpb24gIT09ICdjcHUnICYmIGxvY2F0aW9uICE9PSAnY3B1LXBpbm5lZCcgJiYgbG9jYXRpb24gIT09ICdncHUtYnVmZmVyJyAmJiBsb2NhdGlvbiAhPT0gJ21sLXRlbnNvcicpIHtcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYE5vdCBzdXBwb3J0ZWQgcHJlZmVycmVkIG91dHB1dCBsb2NhdGlvbjogJHtsb2NhdGlvbn0uYCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGVuYWJsZUdyYXBoQ2FwdHVyZSAmJiBsb2NhdGlvbiAhPT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgICAgYE5vdCBzdXBwb3J0ZWQgcHJlZmVycmVkIG91dHB1dCBsb2NhdGlvbjogJHtsb2NhdGlvbn0uIE9ubHkgJ2dwdS1idWZmZXInIGxvY2F0aW9uIGlzIHN1cHBvcnRlZCB3aGVuIGVuYWJsZUdyYXBoQ2FwdHVyZSBpcyB0cnVlLmAsXG4gICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICAgICBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMucHVzaChsb2NhdGlvbik7XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gdXNlIElPIGJpbmRpbmcgb25seSB3aGVuIGF0IGxlYXN0IG9uZSBvdXRwdXQgaXMgcHJlZmVycmVkIHRvIGJlIG9uIEdQVS5cbiAgICBsZXQgYmluZGluZ1N0YXRlOiBJT0JpbmRpbmdTdGF0ZSB8IG51bGwgPSBudWxsO1xuICAgIGlmIChcbiAgICAgICFCVUlMRF9ERUZTLkRJU0FCTEVfSlNFUCAmJlxuICAgICAgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLnNvbWUoKGwpID0+IGwgPT09ICdncHUtYnVmZmVyJyB8fCBsID09PSAnbWwtdGVuc29yJyB8fCBsID09PSAnbWwtdGVuc29yLWNwdS1vdXRwdXQnKVxuICAgICkge1xuICAgICAgaW9CaW5kaW5nSGFuZGxlID0gd2FzbS5fT3J0Q3JlYXRlQmluZGluZyhzZXNzaW9uSGFuZGxlKTtcbiAgICAgIGlmIChpb0JpbmRpbmdIYW5kbGUgPT09IDApIHtcbiAgICAgICAgY2hlY2tMYXN0RXJyb3IoXCJDYW4ndCBjcmVhdGUgSU8gYmluZGluZy5cIik7XG4gICAgICB9XG5cbiAgICAgIGJpbmRpbmdTdGF0ZSA9IHtcbiAgICAgICAgaGFuZGxlOiBpb0JpbmRpbmdIYW5kbGUsXG4gICAgICAgIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucyxcbiAgICAgICAgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZDogb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zXG4gICAgICAgICAgLy8gJ21sLXRlbnNvci1jcHUtb3V0cHV0JyBpcyB0cmVhdGVkIGFzICdtbC10ZW5zb3InIGZvciB0aGUgcHVycG9zZSBvZiBJTyBiaW5kaW5nLlxuICAgICAgICAgIC5tYXAoKGwpID0+IChsID09PSAnbWwtdGVuc29yLWNwdS1vdXRwdXQnID8gJ21sLXRlbnNvcicgOiBsKSlcbiAgICAgICAgICAubWFwKChsKSA9PiBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0obCkpLFxuICAgICAgfTtcbiAgICB9XG5cbiAgICBhY3RpdmVTZXNzaW9ucy5zZXQoc2Vzc2lvbkhhbmRsZSwgW1xuICAgICAgc2Vzc2lvbkhhbmRsZSxcbiAgICAgIGlucHV0TmFtZXNVVEY4RW5jb2RlZCxcbiAgICAgIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsXG4gICAgICBiaW5kaW5nU3RhdGUsXG4gICAgICBlbmFibGVHcmFwaENhcHR1cmUsXG4gICAgICBmYWxzZSxcbiAgICBdKTtcbiAgICByZXR1cm4gW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXMsIG91dHB1dE5hbWVzLCBpbnB1dE1ldGFkYXRhLCBvdXRwdXRNZXRhZGF0YV07XG4gIH0gY2F0Y2ggKGUpIHtcbiAgICBpbnB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaCgoYnVmKSA9PiB3YXNtLl9PcnRGcmVlKGJ1ZikpO1xuICAgIG91dHB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaCgoYnVmKSA9PiB3YXNtLl9PcnRGcmVlKGJ1ZikpO1xuXG4gICAgaWYgKGlvQmluZGluZ0hhbmRsZSAhPT0gMCkge1xuICAgICAgaWYgKHdhc20uX09ydFJlbGVhc2VCaW5kaW5nKGlvQmluZGluZ0hhbmRsZSkgIT09IDApIHtcbiAgICAgICAgY2hlY2tMYXN0RXJyb3IoXCJDYW4ndCByZWxlYXNlIElPIGJpbmRpbmcuXCIpO1xuICAgICAgfVxuICAgIH1cblxuICAgIGlmIChzZXNzaW9uSGFuZGxlICE9PSAwKSB7XG4gICAgICBpZiAod2FzbS5fT3J0UmVsZWFzZVNlc3Npb24oc2Vzc2lvbkhhbmRsZSkgIT09IDApIHtcbiAgICAgICAgY2hlY2tMYXN0RXJyb3IoXCJDYW4ndCByZWxlYXNlIHNlc3Npb24uXCIpO1xuICAgICAgfVxuICAgIH1cbiAgICB0aHJvdyBlO1xuICB9IGZpbmFsbHkge1xuICAgIHdhc20uX2ZyZWUobW9kZWxEYXRhT2Zmc2V0KTtcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgIT09IDApIHtcbiAgICAgIGlmICh3YXNtLl9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnMoc2Vzc2lvbk9wdGlvbnNIYW5kbGUpICE9PSAwKSB7XG4gICAgICAgIGNoZWNrTGFzdEVycm9yKFwiQ2FuJ3QgcmVsZWFzZSBzZXNzaW9uIG9wdGlvbnMuXCIpO1xuICAgICAgfVxuICAgIH1cbiAgICBhbGxvY3MuZm9yRWFjaCgoYWxsb2MpID0+IHdhc20uX2ZyZWUoYWxsb2MpKTtcblxuICAgIC8vIHVubW91bnQgZXh0ZXJuYWwgZGF0YSBpZiBuZWNlc3NhcnlcbiAgICB3YXNtLnVubW91bnRFeHRlcm5hbERhdGE/LigpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgcmVsZWFzZVNlc3Npb24gPSAoc2Vzc2lvbklkOiBudW1iZXIpOiB2b2lkID0+IHtcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XG4gIGNvbnN0IHNlc3Npb24gPSBhY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcbiAgaWYgKCFzZXNzaW9uKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKGBjYW5ub3QgcmVsZWFzZSBzZXNzaW9uLiBpbnZhbGlkIHNlc3Npb24gaWQ6ICR7c2Vzc2lvbklkfWApO1xuICB9XG4gIGNvbnN0IFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQsIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsIGlvQmluZGluZ1N0YXRlLCBlbmFibGVHcmFwaENhcHR1cmVdID0gc2Vzc2lvbjtcblxuICBpZiAoaW9CaW5kaW5nU3RhdGUpIHtcbiAgICBpZiAoZW5hYmxlR3JhcGhDYXB0dXJlKSB7XG4gICAgICBpZiAod2FzbS5fT3J0Q2xlYXJCb3VuZE91dHB1dHMoaW9CaW5kaW5nU3RhdGUuaGFuZGxlKSAhPT0gMCkge1xuICAgICAgICBjaGVja0xhc3RFcnJvcihcIkNhbid0IGNsZWFyIGJvdW5kIG91dHB1dHMuXCIpO1xuICAgICAgfVxuICAgIH1cbiAgICBpZiAod2FzbS5fT3J0UmVsZWFzZUJpbmRpbmcoaW9CaW5kaW5nU3RhdGUuaGFuZGxlKSAhPT0gMCkge1xuICAgICAgY2hlY2tMYXN0RXJyb3IoXCJDYW4ndCByZWxlYXNlIElPIGJpbmRpbmcuXCIpO1xuICAgIH1cbiAgfVxuXG4gIHdhc20uanNlcE9uUmVsZWFzZVNlc3Npb24/LihzZXNzaW9uSWQpO1xuICB3YXNtLndlYm5uT25SZWxlYXNlU2Vzc2lvbj8uKHNlc3Npb25JZCk7XG4gIHdhc20ud2ViZ3B1T25SZWxlYXNlU2Vzc2lvbj8uKHNlc3Npb25JZCk7XG5cbiAgaW5wdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goKGJ1ZikgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcbiAgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZC5mb3JFYWNoKChidWYpID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XG4gIGlmICh3YXNtLl9PcnRSZWxlYXNlU2Vzc2lvbihzZXNzaW9uSGFuZGxlKSAhPT0gMCkge1xuICAgIGNoZWNrTGFzdEVycm9yKFwiQ2FuJ3QgcmVsZWFzZSBzZXNzaW9uLlwiKTtcbiAgfVxuICBhY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvbklkKTtcbn07XG5cbmV4cG9ydCBjb25zdCBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IgPSBhc3luYyAoXG4gIHRlbnNvcjogVGVuc29yTWV0YWRhdGEgfCBudWxsLFxuICB0ZW5zb3JIYW5kbGVzOiBudW1iZXJbXSxcbiAgYWxsb2NzOiBudW1iZXJbXSxcbiAgc2Vzc2lvbklkOiBudW1iZXIsXG4gIHRlbnNvck5hbWVVVEY4RW5jb2RlZDogbnVtYmVyLFxuICBpbmRleDogbnVtYmVyLFxuICBlbmFibGVHcmFwaENhcHR1cmUgPSBmYWxzZSxcbik6IFByb21pc2U8dm9pZD4gPT4ge1xuICBpZiAoIXRlbnNvcikge1xuICAgIHRlbnNvckhhbmRsZXMucHVzaCgwKTtcbiAgICByZXR1cm47XG4gIH1cblxuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcbiAgY29uc3QgcHRyU2l6ZSA9IHdhc20uUFRSX1NJWkU7XG5cbiAgY29uc3QgZGF0YVR5cGUgPSB0ZW5zb3JbMF07XG4gIGNvbnN0IGRpbXMgPSB0ZW5zb3JbMV07XG4gIGNvbnN0IGxvY2F0aW9uID0gdGVuc29yWzNdO1xuICBsZXQgYWN0dWFsTG9jYXRpb24gPSBsb2NhdGlvbjtcblxuICBsZXQgcmF3RGF0YTogbnVtYmVyO1xuICBsZXQgZGF0YUJ5dGVMZW5ndGg6IG51bWJlcjtcblxuICBpZiAoZGF0YVR5cGUgPT09ICdzdHJpbmcnICYmIChsb2NhdGlvbiA9PT0gJ2dwdS1idWZmZXInIHx8IGxvY2F0aW9uID09PSAnbWwtdGVuc29yJykpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0cmluZyB0ZW5zb3IgaXMgbm90IHN1cHBvcnRlZCBvbiBHUFUuJyk7XG4gIH1cblxuICBpZiAoZW5hYmxlR3JhcGhDYXB0dXJlICYmIGxvY2F0aW9uICE9PSAnZ3B1LWJ1ZmZlcicpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICBgRXh0ZXJuYWwgYnVmZmVyIG11c3QgYmUgcHJvdmlkZWQgZm9yIGlucHV0L291dHB1dCBpbmRleCAke2luZGV4fSB3aGVuIGVuYWJsZUdyYXBoQ2FwdHVyZSBpcyB0cnVlLmAsXG4gICAgKTtcbiAgfVxuXG4gIGlmIChsb2NhdGlvbiA9PT0gJ2dwdS1idWZmZXInKSB7XG4gICAgY29uc3QgZ3B1QnVmZmVyID0gdGVuc29yWzJdLmdwdUJ1ZmZlcjtcbiAgICBkYXRhQnl0ZUxlbmd0aCA9IGNhbGN1bGF0ZVRlbnNvclNpemVJbkJ5dGVzKHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtKGRhdGFUeXBlKSwgZGltcykhO1xuXG4gICAgaWYgKEJVSUxEX0RFRlMuVVNFX1dFQkdQVV9FUCkge1xuICAgICAgY29uc3QgcmVnaXN0ZXJCdWZmZXIgPSB3YXNtLndlYmdwdVJlZ2lzdGVyQnVmZmVyO1xuICAgICAgaWYgKCFyZWdpc3RlckJ1ZmZlcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RlbnNvciBsb2NhdGlvbiBcImdwdS1idWZmZXJcIiBpcyBub3Qgc3VwcG9ydGVkIHdpdGhvdXQgdXNpbmcgV2ViR1BVLicpO1xuICAgICAgfVxuXG4gICAgICByYXdEYXRhID0gcmVnaXN0ZXJCdWZmZXIoZ3B1QnVmZmVyLCBzZXNzaW9uSWQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCByZWdpc3RlckJ1ZmZlciA9IHdhc20uanNlcFJlZ2lzdGVyQnVmZmVyO1xuICAgICAgaWYgKCFyZWdpc3RlckJ1ZmZlcikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RlbnNvciBsb2NhdGlvbiBcImdwdS1idWZmZXJcIiBpcyBub3Qgc3VwcG9ydGVkIHdpdGhvdXQgdXNpbmcgV2ViR1BVLicpO1xuICAgICAgfVxuICAgICAgcmF3RGF0YSA9IHJlZ2lzdGVyQnVmZmVyKHNlc3Npb25JZCwgaW5kZXgsIGdwdUJ1ZmZlciwgZGF0YUJ5dGVMZW5ndGgpO1xuICAgIH1cbiAgfSBlbHNlIGlmIChsb2NhdGlvbiA9PT0gJ21sLXRlbnNvcicpIHtcbiAgICBjb25zdCBtbFRlbnNvciA9IHRlbnNvclsyXS5tbFRlbnNvciBhcyBNTFRlbnNvcjtcbiAgICBkYXRhQnl0ZUxlbmd0aCA9IGNhbGN1bGF0ZVRlbnNvclNpemVJbkJ5dGVzKHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtKGRhdGFUeXBlKSwgZGltcykhO1xuXG4gICAgY29uc3QgcmVnaXN0ZXJNTFRlbnNvciA9IHdhc20ud2Vibm5SZWdpc3Rlck1MVGVuc29yO1xuICAgIGlmICghcmVnaXN0ZXJNTFRlbnNvcikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUZW5zb3IgbG9jYXRpb24gXCJtbC10ZW5zb3JcIiBpcyBub3Qgc3VwcG9ydGVkIHdpdGhvdXQgdXNpbmcgV2ViTk4uJyk7XG4gICAgfVxuICAgIHJhd0RhdGEgPSByZWdpc3Rlck1MVGVuc29yKHNlc3Npb25JZCwgbWxUZW5zb3IsIHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtKGRhdGFUeXBlKSwgZGltcyk7XG4gIH0gZWxzZSB7XG4gICAgY29uc3QgZGF0YSA9IHRlbnNvclsyXTtcblxuICAgIGlmIChBcnJheS5pc0FycmF5KGRhdGEpKSB7XG4gICAgICAvLyBzdHJpbmcgdGVuc29yXG4gICAgICBkYXRhQnl0ZUxlbmd0aCA9IHB0clNpemUgKiBkYXRhLmxlbmd0aDtcbiAgICAgIHJhd0RhdGEgPSB3YXNtLl9tYWxsb2MoZGF0YUJ5dGVMZW5ndGgpO1xuICAgICAgYWxsb2NzLnB1c2gocmF3RGF0YSk7XG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRhdGEubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKHR5cGVvZiBkYXRhW2ldICE9PSAnc3RyaW5nJykge1xuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYHRlbnNvciBkYXRhIGF0IGluZGV4ICR7aX0gaXMgbm90IGEgc3RyaW5nYCk7XG4gICAgICAgIH1cbiAgICAgICAgd2FzbS5zZXRWYWx1ZShyYXdEYXRhICsgaSAqIHB0clNpemUsIGFsbG9jV2FzbVN0cmluZyhkYXRhW2ldLCBhbGxvY3MpLCAnKicpO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBpc0dyYXBoSW5wdXQgPSB3YXNtLndlYm5uSXNHcmFwaElucHV0O1xuICAgICAgY29uc3QgaXNHcmFwaE91dHB1dCA9IHdhc20ud2Vibm5Jc0dyYXBoT3V0cHV0O1xuICAgICAgaWYgKGRhdGFUeXBlICE9PSAnc3RyaW5nJyAmJiBpc0dyYXBoSW5wdXQgJiYgaXNHcmFwaE91dHB1dCkge1xuICAgICAgICBjb25zdCB0ZW5zb3JOYW1lID0gd2FzbS5VVEY4VG9TdHJpbmcodGVuc29yTmFtZVVURjhFbmNvZGVkKTtcbiAgICAgICAgLy8gUHJvbW90ZSB0aGUgdGVuc29yIHRvICdtbC10ZW5zb3InIGlmIGl0IGlzIGEgZ3JhcGggaW5wdXQuXG4gICAgICAgIGlmIChpc0dyYXBoSW5wdXQoc2Vzc2lvbklkLCB0ZW5zb3JOYW1lKSB8fCBpc0dyYXBoT3V0cHV0KHNlc3Npb25JZCwgdGVuc29yTmFtZSkpIHtcbiAgICAgICAgICBjb25zdCBkYXRhVHlwZUVudW0gPSB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bShkYXRhVHlwZSk7XG4gICAgICAgICAgZGF0YUJ5dGVMZW5ndGggPSBjYWxjdWxhdGVUZW5zb3JTaXplSW5CeXRlcyhkYXRhVHlwZUVudW0sIGRpbXMpITtcbiAgICAgICAgICBhY3R1YWxMb2NhdGlvbiA9ICdtbC10ZW5zb3InO1xuICAgICAgICAgIGNvbnN0IGNyZWF0ZVRlbXBvcmFyeVRlbnNvciA9IHdhc20ud2Vibm5DcmVhdGVUZW1wb3JhcnlUZW5zb3I7XG4gICAgICAgICAgY29uc3QgdXBsb2FkVGVuc29yID0gd2FzbS53ZWJublVwbG9hZFRlbnNvcjtcbiAgICAgICAgICBpZiAoIWNyZWF0ZVRlbXBvcmFyeVRlbnNvciB8fCAhdXBsb2FkVGVuc29yKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RlbnNvciBsb2NhdGlvbiBcIm1sLXRlbnNvclwiIGlzIG5vdCBzdXBwb3J0ZWQgd2l0aG91dCB1c2luZyBXZWJOTi4nKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgdGVuc29ySWQgPSBhd2FpdCBjcmVhdGVUZW1wb3JhcnlUZW5zb3Ioc2Vzc2lvbklkLCBkYXRhVHlwZUVudW0sIGRpbXMgYXMgbnVtYmVyW10pO1xuICAgICAgICAgIHVwbG9hZFRlbnNvcih0ZW5zb3JJZCwgbmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YS5ieXRlTGVuZ3RoKSk7XG4gICAgICAgICAgcmF3RGF0YSA9IHRlbnNvcklkO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gZGF0YS5ieXRlTGVuZ3RoO1xuICAgICAgICAgIHJhd0RhdGEgPSB3YXNtLl9tYWxsb2MoZGF0YUJ5dGVMZW5ndGgpO1xuICAgICAgICAgIGFsbG9jcy5wdXNoKHJhd0RhdGEpO1xuICAgICAgICAgIHdhc20uSEVBUFU4LnNldChuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhQnl0ZUxlbmd0aCksIHJhd0RhdGEpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkYXRhQnl0ZUxlbmd0aCA9IGRhdGEuYnl0ZUxlbmd0aDtcbiAgICAgICAgcmF3RGF0YSA9IHdhc20uX21hbGxvYyhkYXRhQnl0ZUxlbmd0aCk7XG4gICAgICAgIGFsbG9jcy5wdXNoKHJhd0RhdGEpO1xuICAgICAgICB3YXNtLkhFQVBVOC5zZXQobmV3IFVpbnQ4QXJyYXkoZGF0YS5idWZmZXIsIGRhdGEuYnl0ZU9mZnNldCwgZGF0YUJ5dGVMZW5ndGgpLCByYXdEYXRhKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICBjb25zdCBzdGFjayA9IHdhc20uc3RhY2tTYXZlKCk7XG4gIGNvbnN0IGRpbXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoNCAqIGRpbXMubGVuZ3RoKTtcbiAgdHJ5IHtcbiAgICBkaW1zLmZvckVhY2goKGQsIGluZGV4KSA9PiB3YXNtLnNldFZhbHVlKGRpbXNPZmZzZXQgKyBpbmRleCAqIHB0clNpemUsIGQsIHB0clNpemUgPT09IDQgPyAnaTMyJyA6ICdpNjQnKSk7XG4gICAgY29uc3QgdGVuc29yID0gd2FzbS5fT3J0Q3JlYXRlVGVuc29yKFxuICAgICAgdGVuc29yRGF0YVR5cGVTdHJpbmdUb0VudW0oZGF0YVR5cGUpLFxuICAgICAgcmF3RGF0YSxcbiAgICAgIGRhdGFCeXRlTGVuZ3RoLFxuICAgICAgZGltc09mZnNldCxcbiAgICAgIGRpbXMubGVuZ3RoLFxuICAgICAgZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtKGFjdHVhbExvY2F0aW9uKSxcbiAgICApO1xuICAgIGlmICh0ZW5zb3IgPT09IDApIHtcbiAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBjcmVhdGUgdGVuc29yIGZvciBpbnB1dC9vdXRwdXQuIHNlc3Npb249JHtzZXNzaW9uSWR9LCBpbmRleD0ke2luZGV4fS5gKTtcbiAgICB9XG4gICAgdGVuc29ySGFuZGxlcy5wdXNoKHRlbnNvcik7XG4gIH0gZmluYWxseSB7XG4gICAgd2FzbS5zdGFja1Jlc3RvcmUoc3RhY2spO1xuICB9XG59O1xuXG4vKipcbiAqIHBlcmZvcm0gaW5mZXJlbmNlIHJ1blxuICovXG5leHBvcnQgY29uc3QgcnVuID0gYXN5bmMgKFxuICBzZXNzaW9uSWQ6IG51bWJlcixcbiAgaW5wdXRJbmRpY2VzOiBudW1iZXJbXSxcbiAgaW5wdXRUZW5zb3JzOiBUZW5zb3JNZXRhZGF0YVtdLFxuICBvdXRwdXRJbmRpY2VzOiBudW1iZXJbXSxcbiAgb3V0cHV0VGVuc29yczogQXJyYXk8VGVuc29yTWV0YWRhdGEgfCBudWxsPixcbiAgb3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zLFxuKTogUHJvbWlzZTxUZW5zb3JNZXRhZGF0YVtdPiA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBwdHJTaXplID0gd2FzbS5QVFJfU0laRTtcbiAgY29uc3Qgc2Vzc2lvbiA9IGFjdGl2ZVNlc3Npb25zLmdldChzZXNzaW9uSWQpO1xuICBpZiAoIXNlc3Npb24pIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGNhbm5vdCBydW4gaW5mZXJlbmNlLiBpbnZhbGlkIHNlc3Npb24gaWQ6ICR7c2Vzc2lvbklkfWApO1xuICB9XG4gIGNvbnN0IHNlc3Npb25IYW5kbGUgPSBzZXNzaW9uWzBdO1xuICBjb25zdCBpbnB1dE5hbWVzVVRGOEVuY29kZWQgPSBzZXNzaW9uWzFdO1xuICBjb25zdCBvdXRwdXROYW1lc1VURjhFbmNvZGVkID0gc2Vzc2lvblsyXTtcbiAgY29uc3QgaW9CaW5kaW5nU3RhdGUgPSBzZXNzaW9uWzNdO1xuICBjb25zdCBlbmFibGVHcmFwaENhcHR1cmUgPSBzZXNzaW9uWzRdO1xuICBjb25zdCBpbnB1dE91dHB1dEJvdW5kID0gc2Vzc2lvbls1XTtcblxuICBjb25zdCBpbnB1dENvdW50ID0gaW5wdXRJbmRpY2VzLmxlbmd0aDtcbiAgY29uc3Qgb3V0cHV0Q291bnQgPSBvdXRwdXRJbmRpY2VzLmxlbmd0aDtcblxuICBsZXQgcnVuT3B0aW9uc0hhbmRsZSA9IDA7XG4gIGxldCBydW5PcHRpb25zQWxsb2NzOiBudW1iZXJbXSA9IFtdO1xuXG4gIGNvbnN0IGlucHV0VGVuc29ySGFuZGxlczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3Qgb3V0cHV0VGVuc29ySGFuZGxlczogbnVtYmVyW10gPSBbXTtcbiAgY29uc3QgaW5wdXRPdXRwdXRBbGxvY3M6IG51bWJlcltdID0gW107XG5cbiAgY29uc3QgYmVmb3JlUnVuU3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xuICBjb25zdCBpbnB1dFZhbHVlc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhpbnB1dENvdW50ICogcHRyU2l6ZSk7XG4gIGNvbnN0IGlucHV0TmFtZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2MoaW5wdXRDb3VudCAqIHB0clNpemUpO1xuICBjb25zdCBvdXRwdXRWYWx1ZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2Mob3V0cHV0Q291bnQgKiBwdHJTaXplKTtcbiAgY29uc3Qgb3V0cHV0TmFtZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2Mob3V0cHV0Q291bnQgKiBwdHJTaXplKTtcblxuICB0cnkge1xuICAgIFtydW5PcHRpb25zSGFuZGxlLCBydW5PcHRpb25zQWxsb2NzXSA9IHNldFJ1bk9wdGlvbnMob3B0aW9ucyk7XG5cbiAgICAvLyBjcmVhdGUgaW5wdXQgdGVuc29yc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICBhd2FpdCBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IoXG4gICAgICAgIGlucHV0VGVuc29yc1tpXSxcbiAgICAgICAgaW5wdXRUZW5zb3JIYW5kbGVzLFxuICAgICAgICBpbnB1dE91dHB1dEFsbG9jcyxcbiAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICBpbnB1dE5hbWVzVVRGOEVuY29kZWRbaW5wdXRJbmRpY2VzW2ldXSxcbiAgICAgICAgaW5wdXRJbmRpY2VzW2ldLFxuICAgICAgICBlbmFibGVHcmFwaENhcHR1cmUsXG4gICAgICApO1xuICAgIH1cblxuICAgIC8vIGNyZWF0ZSBvdXRwdXQgdGVuc29yc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgYXdhaXQgcHJlcGFyZUlucHV0T3V0cHV0VGVuc29yKFxuICAgICAgICBvdXRwdXRUZW5zb3JzW2ldLFxuICAgICAgICBvdXRwdXRUZW5zb3JIYW5kbGVzLFxuICAgICAgICBpbnB1dE91dHB1dEFsbG9jcyxcbiAgICAgICAgc2Vzc2lvbklkLFxuICAgICAgICBvdXRwdXROYW1lc1VURjhFbmNvZGVkW291dHB1dEluZGljZXNbaV1dLFxuICAgICAgICBpbnB1dENvdW50ICsgb3V0cHV0SW5kaWNlc1tpXSxcbiAgICAgICAgZW5hYmxlR3JhcGhDYXB0dXJlLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Q291bnQ7IGkrKykge1xuICAgICAgd2FzbS5zZXRWYWx1ZShpbnB1dFZhbHVlc09mZnNldCArIGkgKiBwdHJTaXplLCBpbnB1dFRlbnNvckhhbmRsZXNbaV0sICcqJyk7XG4gICAgICB3YXNtLnNldFZhbHVlKGlucHV0TmFtZXNPZmZzZXQgKyBpICogcHRyU2l6ZSwgaW5wdXROYW1lc1VURjhFbmNvZGVkW2lucHV0SW5kaWNlc1tpXV0sICcqJyk7XG4gICAgfVxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xuICAgICAgd2FzbS5zZXRWYWx1ZShvdXRwdXRWYWx1ZXNPZmZzZXQgKyBpICogcHRyU2l6ZSwgb3V0cHV0VGVuc29ySGFuZGxlc1tpXSwgJyonKTtcbiAgICAgIHdhc20uc2V0VmFsdWUob3V0cHV0TmFtZXNPZmZzZXQgKyBpICogcHRyU2l6ZSwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZFtvdXRwdXRJbmRpY2VzW2ldXSwgJyonKTtcbiAgICB9XG5cbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9KU0VQICYmIGlvQmluZGluZ1N0YXRlICYmICFpbnB1dE91dHB1dEJvdW5kKSB7XG4gICAgICBjb25zdCB7IGhhbmRsZSwgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkIH0gPSBpb0JpbmRpbmdTdGF0ZTtcblxuICAgICAgaWYgKGlucHV0TmFtZXNVVEY4RW5jb2RlZC5sZW5ndGggIT09IGlucHV0Q291bnQpIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxuICAgICAgICAgIGBpbnB1dCBjb3VudCBmcm9tIGZlZWRzICgke2lucHV0Q291bnR9KSBpcyBleHBlY3RlZCB0byBiZSBhbHdheXMgZXF1YWwgdG8gbW9kZWwncyBpbnB1dCBjb3VudCAoJHtpbnB1dE5hbWVzVVRGOEVuY29kZWQubGVuZ3RofSkuYCxcbiAgICAgICAgKTtcbiAgICAgIH1cblxuICAgICAgLy8gcHJvY2VzcyBpbnB1dHNcbiAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGluZGV4ID0gaW5wdXRJbmRpY2VzW2ldO1xuICAgICAgICBjb25zdCBlcnJvckNvZGUgPSBhd2FpdCB3YXNtLl9PcnRCaW5kSW5wdXQoaGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWRbaW5kZXhdLCBpbnB1dFRlbnNvckhhbmRsZXNbaV0pO1xuICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGJpbmQgaW5wdXRbJHtpfV0gZm9yIHNlc3Npb249JHtzZXNzaW9uSWR9LmApO1xuICAgICAgICB9XG4gICAgICB9XG5cbiAgICAgIC8vIHByb2Nlc3MgcHJlLWFsbG9jYXRlZCBvdXRwdXRzXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dHB1dENvdW50OyBpKyspIHtcbiAgICAgICAgY29uc3QgaW5kZXggPSBvdXRwdXRJbmRpY2VzW2ldO1xuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IG91dHB1dFRlbnNvcnNbaV0/LlszXTsgLy8gdW5kZWZpbmVkIG1lYW5zIG91dHB1dCBpcyBub3QgcHJlLWFsbG9jYXRlZC5cblxuICAgICAgICBpZiAobG9jYXRpb24pIHtcbiAgICAgICAgICAvLyBvdXRwdXQgaXMgcHJlLWFsbG9jYXRlZC4gYmluZCB0aGUgdGVuc29yLlxuICAgICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEJpbmRPdXRwdXQoaGFuZGxlLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkW2luZGV4XSwgb3V0cHV0VGVuc29ySGFuZGxlc1tpXSwgMCk7XG4gICAgICAgICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGJpbmQgcHJlLWFsbG9jYXRlZCBvdXRwdXRbJHtpfV0gZm9yIHNlc3Npb249JHtzZXNzaW9uSWR9LmApO1xuICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBvdXRwdXQgaXMgbm90IHByZS1hbGxvY2F0ZWQuIHJlc2V0IHByZWZlcnJlZCBsb2NhdGlvbi5cbiAgICAgICAgICBjb25zdCBlcnJvckNvZGUgPSB3YXNtLl9PcnRCaW5kT3V0cHV0KFxuICAgICAgICAgICAgaGFuZGxlLFxuICAgICAgICAgICAgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZFtpbmRleF0sXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZFtpbmRleF0sXG4gICAgICAgICAgKTtcbiAgICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYmluZCBvdXRwdXRbJHtpfV0gdG8gJHtvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNbaV19IGZvciBzZXNzaW9uPSR7c2Vzc2lvbklkfS5gKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGFjdGl2ZVNlc3Npb25zLnNldChzZXNzaW9uSWQsIFtcbiAgICAgICAgc2Vzc2lvbkhhbmRsZSxcbiAgICAgICAgaW5wdXROYW1lc1VURjhFbmNvZGVkLFxuICAgICAgICBvdXRwdXROYW1lc1VURjhFbmNvZGVkLFxuICAgICAgICBpb0JpbmRpbmdTdGF0ZSxcbiAgICAgICAgZW5hYmxlR3JhcGhDYXB0dXJlLFxuICAgICAgICB0cnVlLFxuICAgICAgXSk7XG4gICAgfVxuXG4gICAgd2FzbS5qc2VwT25SdW5TdGFydD8uKHNlc3Npb25IYW5kbGUpO1xuICAgIHdhc20ud2Vibm5PblJ1blN0YXJ0Py4oc2Vzc2lvbkhhbmRsZSk7XG5cbiAgICBsZXQgZXJyb3JDb2RlOiBudW1iZXI7XG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfSlNFUCAmJiBpb0JpbmRpbmdTdGF0ZSkge1xuICAgICAgZXJyb3JDb2RlID0gYXdhaXQgd2FzbS5fT3J0UnVuV2l0aEJpbmRpbmcoXG4gICAgICAgIHNlc3Npb25IYW5kbGUsXG4gICAgICAgIGlvQmluZGluZ1N0YXRlLmhhbmRsZSxcbiAgICAgICAgb3V0cHV0Q291bnQsXG4gICAgICAgIG91dHB1dFZhbHVlc09mZnNldCxcbiAgICAgICAgcnVuT3B0aW9uc0hhbmRsZSxcbiAgICAgICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bihcbiAgICAgICAgc2Vzc2lvbkhhbmRsZSxcbiAgICAgICAgaW5wdXROYW1lc09mZnNldCxcbiAgICAgICAgaW5wdXRWYWx1ZXNPZmZzZXQsXG4gICAgICAgIGlucHV0Q291bnQsXG4gICAgICAgIG91dHB1dE5hbWVzT2Zmc2V0LFxuICAgICAgICBvdXRwdXRDb3VudCxcbiAgICAgICAgb3V0cHV0VmFsdWVzT2Zmc2V0LFxuICAgICAgICBydW5PcHRpb25zSGFuZGxlLFxuICAgICAgKTtcbiAgICB9XG5cbiAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XG4gICAgICBjaGVja0xhc3RFcnJvcignZmFpbGVkIHRvIGNhbGwgT3J0UnVuKCkuJyk7XG4gICAgfVxuXG4gICAgY29uc3Qgb3V0cHV0OiBUZW5zb3JNZXRhZGF0YVtdID0gW107XG4gICAgY29uc3Qgb3V0cHV0UHJvbWlzZXM6IEFycmF5PFByb21pc2U8W251bWJlciwgVGVuc29yLkRhdGFUeXBlXT4+ID0gW107XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dHB1dENvdW50OyBpKyspIHtcbiAgICAgIGNvbnN0IHRlbnNvciA9IE51bWJlcih3YXNtLmdldFZhbHVlKG91dHB1dFZhbHVlc09mZnNldCArIGkgKiBwdHJTaXplLCAnKicpKTtcbiAgICAgIGlmICh0ZW5zb3IgPT09IG91dHB1dFRlbnNvckhhbmRsZXNbaV0pIHtcbiAgICAgICAgLy8gb3V0cHV0IHRlbnNvciBpcyBwcmUtYWxsb2NhdGVkLiBubyBuZWVkIHRvIGNvcHkgZGF0YS5cbiAgICAgICAgb3V0cHV0LnB1c2gob3V0cHV0VGVuc29yc1tpXSEpO1xuICAgICAgICBjb250aW51ZTtcbiAgICAgIH1cblxuICAgICAgY29uc3QgYmVmb3JlR2V0VGVuc29yRGF0YVN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcbiAgICAgIC8vIHN0YWNrIGFsbG9jYXRlIDQgcG9pbnRlciB2YWx1ZVxuICAgICAgY29uc3QgdGVuc29yRGF0YU9mZnNldCA9IHdhc20uc3RhY2tBbGxvYyg0ICogcHRyU2l6ZSk7XG5cbiAgICAgIGxldCBrZWVwT3V0cHV0VGVuc29yID0gZmFsc2U7XG4gICAgICBsZXQgdHlwZTogVGVuc29yLlR5cGUgfCB1bmRlZmluZWQsXG4gICAgICAgIGRhdGFPZmZzZXQgPSAwO1xuICAgICAgdHJ5IHtcbiAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0R2V0VGVuc29yRGF0YShcbiAgICAgICAgICB0ZW5zb3IsXG4gICAgICAgICAgdGVuc29yRGF0YU9mZnNldCxcbiAgICAgICAgICB0ZW5zb3JEYXRhT2Zmc2V0ICsgcHRyU2l6ZSxcbiAgICAgICAgICB0ZW5zb3JEYXRhT2Zmc2V0ICsgMiAqIHB0clNpemUsXG5cbiAgICAgICAgICB0ZW5zb3JEYXRhT2Zmc2V0ICsgMyAqIHB0clNpemUsXG4gICAgICAgICk7XG4gICAgICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgYWNjZXNzIG91dHB1dCB0ZW5zb3IgZGF0YSBvbiBpbmRleCAke2l9LmApO1xuICAgICAgICB9XG4gICAgICAgIGNvbnN0IHZhbHVlVHlwZSA9IHB0clNpemUgPT09IDQgPyAnaTMyJyA6ICdpNjQnO1xuICAgICAgICBjb25zdCBkYXRhVHlwZSA9IE51bWJlcih3YXNtLmdldFZhbHVlKHRlbnNvckRhdGFPZmZzZXQsIHZhbHVlVHlwZSkpO1xuICAgICAgICBkYXRhT2Zmc2V0ID0gd2FzbS5nZXRWYWx1ZSh0ZW5zb3JEYXRhT2Zmc2V0ICsgcHRyU2l6ZSwgJyonKTtcbiAgICAgICAgY29uc3QgZGltc09mZnNldCA9IHdhc20uZ2V0VmFsdWUodGVuc29yRGF0YU9mZnNldCArIHB0clNpemUgKiAyLCAnKicpO1xuICAgICAgICBjb25zdCBkaW1zTGVuZ3RoID0gTnVtYmVyKHdhc20uZ2V0VmFsdWUodGVuc29yRGF0YU9mZnNldCArIHB0clNpemUgKiAzLCB2YWx1ZVR5cGUpKTtcbiAgICAgICAgY29uc3QgZGltcyA9IFtdO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbXNMZW5ndGg7IGkrKykge1xuICAgICAgICAgIGRpbXMucHVzaChOdW1iZXIod2FzbS5nZXRWYWx1ZShkaW1zT2Zmc2V0ICsgaSAqIHB0clNpemUsIHZhbHVlVHlwZSkpKTtcbiAgICAgICAgfVxuICAgICAgICBpZiAod2FzbS5fT3J0RnJlZShkaW1zT2Zmc2V0KSAhPT0gMCkge1xuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKFwiQ2FuJ3QgZnJlZSBtZW1vcnkgZm9yIHRlbnNvciBkaW1zLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBzaXplID0gZGltcy5yZWR1Y2UoKGEsIGIpID0+IGEgKiBiLCAxKTtcbiAgICAgICAgdHlwZSA9IHRlbnNvckRhdGFUeXBlRW51bVRvU3RyaW5nKGRhdGFUeXBlKTtcblxuICAgICAgICBjb25zdCBwcmVmZXJyZWRMb2NhdGlvbiA9IGlvQmluZGluZ1N0YXRlPy5vdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNbb3V0cHV0SW5kaWNlc1tpXV07XG5cbiAgICAgICAgaWYgKHR5cGUgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgaWYgKHByZWZlcnJlZExvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicgfHwgcHJlZmVycmVkTG9jYXRpb24gPT09ICdtbC10ZW5zb3InKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1N0cmluZyB0ZW5zb3IgaXMgbm90IHN1cHBvcnRlZCBvbiBHUFUuJyk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IHN0cmluZ0RhdGE6IHN0cmluZ1tdID0gW107XG4gICAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzaXplOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHdhc20uZ2V0VmFsdWUoZGF0YU9mZnNldCArIGkgKiBwdHJTaXplLCAnKicpO1xuICAgICAgICAgICAgY29uc3QgbmV4dE9mZnNldCA9IHdhc20uZ2V0VmFsdWUoZGF0YU9mZnNldCArIChpICsgMSkgKiBwdHJTaXplLCAnKicpO1xuICAgICAgICAgICAgY29uc3QgbWF4Qnl0ZXNUb1JlYWQgPSBpID09PSBzaXplIC0gMSA/IHVuZGVmaW5lZCA6IG5leHRPZmZzZXQgLSBvZmZzZXQ7XG4gICAgICAgICAgICBzdHJpbmdEYXRhLnB1c2god2FzbS5VVEY4VG9TdHJpbmcob2Zmc2V0LCBtYXhCeXRlc1RvUmVhZCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgc3RyaW5nRGF0YSwgJ2NwdSddKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAvLyBJZiBhIGNlcnRhaW4gb3V0cHV0J3MgcHJlZmVycmVkIGxvY2F0aW9uIGlzIEdQVSBidXQgdGhlIHRlbnNvciBpcyBlbXB0eSwgd2Ugc3RpbGwgbmVlZCB0byBjcmVhdGUgYSBDUFVcbiAgICAgICAgICAvLyB0ZW5zb3IgZm9yIGl0LiBUaGVyZSBpcyBubyBtYXBwaW5nIEdQVSBidWZmZXIgZm9yIGFuIGVtcHR5IHRlbnNvci5cbiAgICAgICAgICBpZiAocHJlZmVycmVkTG9jYXRpb24gPT09ICdncHUtYnVmZmVyJyAmJiBzaXplID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZ2V0QnVmZmVyID0gQlVJTERfREVGUy5VU0VfV0VCR1BVX0VQID8gd2FzbS53ZWJncHVHZXRCdWZmZXIgOiB3YXNtLmpzZXBHZXRCdWZmZXI7XG4gICAgICAgICAgICBpZiAoIWdldEJ1ZmZlcikge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ3ByZWZlcnJlZExvY2F0aW9uIFwiZ3B1LWJ1ZmZlclwiIGlzIG5vdCBzdXBwb3J0ZWQgd2l0aG91dCB1c2luZyBXZWJHUFUuJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBncHVCdWZmZXIgPSBnZXRCdWZmZXIoZGF0YU9mZnNldCk7XG4gICAgICAgICAgICBjb25zdCBidWZmZXJTaXplID0gY2FsY3VsYXRlVGVuc29yU2l6ZUluQnl0ZXMoZGF0YVR5cGUsIHNpemUpO1xuICAgICAgICAgICAgaWYgKGJ1ZmZlclNpemUgPT09IHVuZGVmaW5lZCB8fCAhaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlKHR5cGUpKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGV9YCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIGRvIG5vdCByZWxlYXNlIHRoZSB0ZW5zb3IgcmlnaHQgbm93LiBpdCB3aWxsIGJlIHJlbGVhc2VkIHdoZW4gdXNlciBjYWxscyB0ZW5zb3IuZGlzcG9zZSgpLlxuICAgICAgICAgICAga2VlcE91dHB1dFRlbnNvciA9IHRydWU7XG5cbiAgICAgICAgICAgIGlmIChCVUlMRF9ERUZTLlVTRV9XRUJHUFVfRVApIHtcbiAgICAgICAgICAgICAgd2FzbS53ZWJncHVSZWdpc3RlckJ1ZmZlciEoZ3B1QnVmZmVyLCBzZXNzaW9uSWQsIGRhdGFPZmZzZXQpO1xuICAgICAgICAgICAgICBjb25zdCBkb3dubG9hZERhdGFGdW5jdGlvbiA9IHdhc20ud2ViZ3B1Q3JlYXRlRG93bmxvYWRlciEoZ3B1QnVmZmVyLCBidWZmZXJTaXplLCBzZXNzaW9uSWQpO1xuICAgICAgICAgICAgICBvdXRwdXQucHVzaChbXG4gICAgICAgICAgICAgICAgdHlwZSxcbiAgICAgICAgICAgICAgICBkaW1zLFxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgIGdwdUJ1ZmZlcixcbiAgICAgICAgICAgICAgICAgIGRvd25sb2FkOiBhc3luYyAoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGFycmF5QnVmZmVyID0gYXdhaXQgZG93bmxvYWREYXRhRnVuY3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyAodGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yKHR5cGUhKSkoYXJyYXlCdWZmZXIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gZGF0YSBhcyBUZW5zb3IuRGF0YVR5cGVNYXBbVGVuc29yLkdwdUJ1ZmZlckRhdGFUeXBlc107XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgZGlzcG9zZTogKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAod2FzbS5fT3J0UmVsZWFzZVRlbnNvcih0ZW5zb3IpICE9PSAwKSB7XG4gICAgICAgICAgICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoXCJDYW4ndCByZWxlYXNlIHRlbnNvci5cIik7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAnZ3B1LWJ1ZmZlcicsXG4gICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgb3V0cHV0LnB1c2goW1xuICAgICAgICAgICAgICAgIHR5cGUsXG4gICAgICAgICAgICAgICAgZGltcyxcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICBncHVCdWZmZXIsXG4gICAgICAgICAgICAgICAgICBkb3dubG9hZDogd2FzbS5qc2VwQ3JlYXRlRG93bmxvYWRlciEoZ3B1QnVmZmVyLCBidWZmZXJTaXplLCB0eXBlKSxcbiAgICAgICAgICAgICAgICAgIGRpc3Bvc2U6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHdhc20uX09ydFJlbGVhc2VUZW5zb3IodGVuc29yKSAhPT0gMCkge1xuICAgICAgICAgICAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKFwiQ2FuJ3QgcmVsZWFzZSB0ZW5zb3IuXCIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgJ2dwdS1idWZmZXInLFxuICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9IGVsc2UgaWYgKHByZWZlcnJlZExvY2F0aW9uID09PSAnbWwtdGVuc29yJyAmJiBzaXplID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZW5zdXJlVGVuc29yID0gd2FzbS53ZWJubkVuc3VyZVRlbnNvcjtcbiAgICAgICAgICAgIGNvbnN0IGlzR3JhcGhJbnB1dE91dHB1dFR5cGVTdXBwb3J0ZWQgPSB3YXNtLndlYm5uSXNHcmFwaElucHV0T3V0cHV0VHlwZVN1cHBvcnRlZDtcbiAgICAgICAgICAgIGlmICghZW5zdXJlVGVuc29yIHx8ICFpc0dyYXBoSW5wdXRPdXRwdXRUeXBlU3VwcG9ydGVkKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncHJlZmVycmVkTG9jYXRpb24gXCJtbC10ZW5zb3JcIiBpcyBub3Qgc3VwcG9ydGVkIHdpdGhvdXQgdXNpbmcgV2ViTk4uJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCB0ZW5zb3JTaXplID0gY2FsY3VsYXRlVGVuc29yU2l6ZUluQnl0ZXMoZGF0YVR5cGUsIHNpemUpO1xuICAgICAgICAgICAgaWYgKHRlbnNvclNpemUgPT09IHVuZGVmaW5lZCB8fCAhaXNNTFRlbnNvclN1cHBvcnRlZFR5cGUodHlwZSkpIHtcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBkYXRhIHR5cGU6ICR7dHlwZX1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghaXNHcmFwaElucHV0T3V0cHV0VHlwZVN1cHBvcnRlZChzZXNzaW9uSWQsIHR5cGUsIGZhbHNlKSkge1xuICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICAgICAgYHByZWZlcnJlZExvY2F0aW9uIFwibWwtdGVuc29yXCIgZm9yICR7dHlwZX0gb3V0cHV0IGlzIG5vdCBzdXBwb3J0ZWQgYnkgY3VycmVudCBXZWJOTiBDb250ZXh0LmAsXG4gICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSBncmFwaCBoYXMgYmVlbiBwYXJ0aXRpb25lZCwgdGhlIG91dHB1dCB0ZW5zb3IgbWF5IGhhdmUgbm90IGJlZW4gY3JlYXRlZC4gRm9yIHRoaXMgcmVhc29uLCB3ZSB1c2VcbiAgICAgICAgICAgIC8vIGVuc3VyZVRlbnNvciB0byBnZXQvY3JlYXRlIHRoZSBNTFRlbnNvci4gSW4gd2hpY2ggY2FzZSwgd2UgZG9uJ3QgbmVlZCB0byBjb3B5IHRoZSBkYXRhIGlmIGEgbmV3IHRlbnNvclxuICAgICAgICAgICAgLy8gaGFzIGJlZW4gY3JlYXRlZC5cbiAgICAgICAgICAgIGNvbnN0IG1sVGVuc29yID0gYXdhaXQgZW5zdXJlVGVuc29yKHNlc3Npb25JZCwgZGF0YU9mZnNldCwgZGF0YVR5cGUsIGRpbXMsIGZhbHNlKTtcblxuICAgICAgICAgICAgLy8gZG8gbm90IHJlbGVhc2UgdGhlIHRlbnNvciByaWdodCBub3cuIGl0IHdpbGwgYmUgcmVsZWFzZWQgd2hlbiB1c2VyIGNhbGxzIHRlbnNvci5kaXNwb3NlKCkuXG4gICAgICAgICAgICBrZWVwT3V0cHV0VGVuc29yID0gdHJ1ZTtcblxuICAgICAgICAgICAgb3V0cHV0LnB1c2goW1xuICAgICAgICAgICAgICB0eXBlLFxuICAgICAgICAgICAgICBkaW1zLFxuICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgbWxUZW5zb3IsXG4gICAgICAgICAgICAgICAgZG93bmxvYWQ6IHdhc20ud2Vibm5DcmVhdGVNTFRlbnNvckRvd25sb2FkZXIhKGRhdGFPZmZzZXQsIHR5cGUpLFxuICAgICAgICAgICAgICAgIGRpc3Bvc2U6ICgpID0+IHtcbiAgICAgICAgICAgICAgICAgIHdhc20ud2Vibm5SZWxlYXNlVGVuc29ySWQhKGRhdGFPZmZzZXQpO1xuICAgICAgICAgICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVRlbnNvcih0ZW5zb3IpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICdtbC10ZW5zb3InLFxuICAgICAgICAgICAgXSk7XG4gICAgICAgICAgfSBlbHNlIGlmIChwcmVmZXJyZWRMb2NhdGlvbiA9PT0gJ21sLXRlbnNvci1jcHUtb3V0cHV0JyAmJiBzaXplID4gMCkge1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IHdhc20ud2Vibm5DcmVhdGVNTFRlbnNvckRvd25sb2FkZXIhKGRhdGFPZmZzZXQsIHR5cGUgYXMgVGVuc29yLk1MVGVuc29yRGF0YVR5cGVzKSgpO1xuICAgICAgICAgICAgY29uc3QgaW5kZXggPSBvdXRwdXQubGVuZ3RoO1xuICAgICAgICAgICAgLy8gRGVsYXkgdGhlIGRhdGEgZG93bmxvYWQgYW5kIHJlbGVhc2luZyB0aGUgdGVuc29yIHVudGlsIHdlIGNhbiB3YWl0IGZvciBhbGwgb3V0cHV0IHRlbnNvcnMgdG8gYmUgZG93bmxvYWRlZC5cbiAgICAgICAgICAgIGtlZXBPdXRwdXRUZW5zb3IgPSB0cnVlO1xuICAgICAgICAgICAgb3V0cHV0UHJvbWlzZXMucHVzaChcbiAgICAgICAgICAgICAgKGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZXN1bHQ6IFtudW1iZXIsIFRlbnNvci5EYXRhVHlwZV0gPSBbaW5kZXgsIGF3YWl0IGRhdGFdO1xuICAgICAgICAgICAgICAgIHdhc20ud2Vibm5SZWxlYXNlVGVuc29ySWQhKGRhdGFPZmZzZXQpO1xuICAgICAgICAgICAgICAgIHdhc20uX09ydFJlbGVhc2VUZW5zb3IodGVuc29yKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgICAgICAgICAgICB9KSgpLFxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIG91dHB1dC5wdXNoKFt0eXBlLCBkaW1zLCBbXSwgJ2NwdSddKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgY29uc3QgdHlwZWRBcnJheUNvbnN0cnVjdG9yID0gdGVuc29yVHlwZVRvVHlwZWRBcnJheUNvbnN0cnVjdG9yKHR5cGUpO1xuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyB0eXBlZEFycmF5Q29uc3RydWN0b3Ioc2l6ZSk7XG4gICAgICAgICAgICBuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhLmJ5dGVMZW5ndGgpLnNldChcbiAgICAgICAgICAgICAgd2FzbS5IRUFQVTguc3ViYXJyYXkoZGF0YU9mZnNldCwgZGF0YU9mZnNldCArIGRhdGEuYnl0ZUxlbmd0aCksXG4gICAgICAgICAgICApO1xuICAgICAgICAgICAgb3V0cHV0LnB1c2goW3R5cGUsIGRpbXMsIGRhdGEsICdjcHUnXSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9IGZpbmFsbHkge1xuICAgICAgICB3YXNtLnN0YWNrUmVzdG9yZShiZWZvcmVHZXRUZW5zb3JEYXRhU3RhY2spO1xuICAgICAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgZGF0YU9mZnNldCkge1xuICAgICAgICAgIHdhc20uX2ZyZWUoZGF0YU9mZnNldCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFrZWVwT3V0cHV0VGVuc29yKSB7XG4gICAgICAgICAgd2FzbS5fT3J0UmVsZWFzZVRlbnNvcih0ZW5zb3IpO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuXG4gICAgaWYgKGlvQmluZGluZ1N0YXRlICYmICFlbmFibGVHcmFwaENhcHR1cmUpIHtcbiAgICAgIGlmICh3YXNtLl9PcnRDbGVhckJvdW5kT3V0cHV0cyhpb0JpbmRpbmdTdGF0ZS5oYW5kbGUpICE9PSAwKSB7XG4gICAgICAgIGNoZWNrTGFzdEVycm9yKFwiQ2FuJ3QgY2xlYXIgYm91bmQgb3V0cHV0cy5cIik7XG4gICAgICB9XG4gICAgICBhY3RpdmVTZXNzaW9ucy5zZXQoc2Vzc2lvbklkLCBbXG4gICAgICAgIHNlc3Npb25IYW5kbGUsXG4gICAgICAgIGlucHV0TmFtZXNVVEY4RW5jb2RlZCxcbiAgICAgICAgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCxcbiAgICAgICAgaW9CaW5kaW5nU3RhdGUsXG4gICAgICAgIGVuYWJsZUdyYXBoQ2FwdHVyZSxcbiAgICAgICAgZmFsc2UsXG4gICAgICBdKTtcbiAgICB9XG4gICAgLy8gV2FpdCBmb3IgYWxsIG91dHB1dCB0ZW5zb3IgZGF0YSB0byBiZSBkb3dubG9hZGVkLlxuICAgIGZvciAoY29uc3QgW2luZGV4LCBkYXRhXSBvZiBhd2FpdCBQcm9taXNlLmFsbChvdXRwdXRQcm9taXNlcykpIHtcbiAgICAgIG91dHB1dFtpbmRleF1bMl0gPSBkYXRhO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9IGZpbmFsbHkge1xuICAgIHdhc20ud2Vibm5PblJ1bkVuZD8uKHNlc3Npb25IYW5kbGUpO1xuXG4gICAgd2FzbS5zdGFja1Jlc3RvcmUoYmVmb3JlUnVuU3RhY2spO1xuXG4gICAgaWYgKEJVSUxEX0RFRlMuVVNFX1dFQkdQVV9FUCkge1xuICAgICAgaW5wdXRUZW5zb3JzLmZvckVhY2goKHQpID0+IHtcbiAgICAgICAgaWYgKHQgJiYgdFszXSA9PT0gJ2dwdS1idWZmZXInKSB7XG4gICAgICAgICAgd2FzbS53ZWJncHVVbnJlZ2lzdGVyQnVmZmVyISh0WzJdLmdwdUJ1ZmZlcik7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgb3V0cHV0VGVuc29ycy5mb3JFYWNoKCh0KSA9PiB7XG4gICAgICAgIGlmICh0ICYmIHRbM10gPT09ICdncHUtYnVmZmVyJykge1xuICAgICAgICAgIHdhc20ud2ViZ3B1VW5yZWdpc3RlckJ1ZmZlciEodFsyXS5ncHVCdWZmZXIpO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgaW5wdXRUZW5zb3JIYW5kbGVzLmZvckVhY2goKHYpID0+IHdhc20uX09ydFJlbGVhc2VUZW5zb3IodikpO1xuICAgIG91dHB1dFRlbnNvckhhbmRsZXMuZm9yRWFjaCgodikgPT4gd2FzbS5fT3J0UmVsZWFzZVRlbnNvcih2KSk7XG4gICAgaW5wdXRPdXRwdXRBbGxvY3MuZm9yRWFjaCgocCkgPT4gd2FzbS5fZnJlZShwKSk7XG5cbiAgICBpZiAocnVuT3B0aW9uc0hhbmRsZSAhPT0gMCkge1xuICAgICAgd2FzbS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnMocnVuT3B0aW9uc0hhbmRsZSk7XG4gICAgfVxuICAgIHJ1bk9wdGlvbnNBbGxvY3MuZm9yRWFjaCgocCkgPT4gd2FzbS5fZnJlZShwKSk7XG4gIH1cbn07XG5cbi8qKlxuICogZW5kIHByb2ZpbGluZ1xuICovXG5leHBvcnQgY29uc3QgZW5kUHJvZmlsaW5nID0gKHNlc3Npb25JZDogbnVtYmVyKTogdm9pZCA9PiB7XG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XG4gIGlmICghc2Vzc2lvbikge1xuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzZXNzaW9uIGlkJyk7XG4gIH1cbiAgY29uc3Qgc2Vzc2lvbkhhbmRsZSA9IHNlc3Npb25bMF07XG5cbiAgLy8gcHJvZmlsZSBmaWxlIG5hbWUgaXMgbm90IHVzZWQgeWV0LCBidXQgaXQgbXVzdCBiZSBmcmVlZC5cbiAgY29uc3QgcHJvZmlsZUZpbGVOYW1lID0gd2FzbS5fT3J0RW5kUHJvZmlsaW5nKHNlc3Npb25IYW5kbGUpO1xuICBpZiAocHJvZmlsZUZpbGVOYW1lID09PSAwKSB7XG4gICAgY2hlY2tMYXN0RXJyb3IoXCJDYW4ndCBnZXQgYW4gcHJvZmlsZSBmaWxlIG5hbWUuXCIpO1xuICB9XG4gIHdhc20uX09ydEZyZWUocHJvZmlsZUZpbGVOYW1lKTtcbn07XG5cbmV4cG9ydCBjb25zdCBleHRyYWN0VHJhbnNmZXJhYmxlQnVmZmVycyA9ICh0ZW5zb3JzOiByZWFkb25seSBTZXJpYWxpemFibGVUZW5zb3JNZXRhZGF0YVtdKTogQXJyYXlCdWZmZXJMaWtlW10gPT4ge1xuICBjb25zdCBidWZmZXJzOiBBcnJheUJ1ZmZlckxpa2VbXSA9IFtdO1xuICBmb3IgKGNvbnN0IHRlbnNvciBvZiB0ZW5zb3JzKSB7XG4gICAgY29uc3QgZGF0YSA9IHRlbnNvclsyXTtcbiAgICBpZiAoIUFycmF5LmlzQXJyYXkoZGF0YSkgJiYgJ2J1ZmZlcicgaW4gZGF0YSkge1xuICAgICAgYnVmZmVycy5wdXNoKGRhdGEuYnVmZmVyKTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGJ1ZmZlcnM7XG59O1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG5pbXBvcnQgeyBlbnYsIEluZmVyZW5jZVNlc3Npb24gfSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQge1xuICBPcnRXYXNtTWVzc2FnZSxcbiAgU2VyaWFsaXphYmxlSW50ZXJuYWxCdWZmZXIsXG4gIFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YSxcbiAgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGEsXG4gIFRlbnNvck1ldGFkYXRhLFxufSBmcm9tICcuL3Byb3h5LW1lc3NhZ2VzJztcbmltcG9ydCAqIGFzIGNvcmUgZnJvbSAnLi93YXNtLWNvcmUtaW1wbCc7XG5pbXBvcnQgeyBpbml0aWFsaXplV2ViQXNzZW1ibHkgfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XG5pbXBvcnQge1xuICBpbXBvcnRQcm94eVdvcmtlcixcbiAgaW5mZXJXYXNtUGF0aFByZWZpeEZyb21TY3JpcHRTcmMsXG4gIGlzRXNtSW1wb3J0TWV0YVVybEhhcmRjb2RlZEFzRmlsZVVyaSxcbn0gZnJvbSAnLi93YXNtLXV0aWxzLWltcG9ydCc7XG5cbmNvbnN0IGlzUHJveHkgPSAoKTogYm9vbGVhbiA9PiAhIWVudi53YXNtLnByb3h5ICYmIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCc7XG5sZXQgcHJveHlXb3JrZXI6IFdvcmtlciB8IHVuZGVmaW5lZDtcbmxldCBpbml0aWFsaXppbmcgPSBmYWxzZTtcbmxldCBpbml0aWFsaXplZCA9IGZhbHNlO1xubGV0IGFib3J0ZWQgPSBmYWxzZTtcbmxldCB0ZW1wb3JhcnlPYmplY3RVcmw6IHN0cmluZyB8IHVuZGVmaW5lZDtcblxudHlwZSBQcm9taXNlQ2FsbGJhY2tzPFQgPSB2b2lkPiA9IFtyZXNvbHZlOiAocmVzdWx0OiBUKSA9PiB2b2lkLCByZWplY3Q6IChyZWFzb246IHVua25vd24pID0+IHZvaWRdO1xubGV0IGluaXRXYXNtQ2FsbGJhY2tzOiBQcm9taXNlQ2FsbGJhY2tzO1xuY29uc3QgcXVldWVkQ2FsbGJhY2tzOiBNYXA8T3J0V2FzbU1lc3NhZ2VbJ3R5cGUnXSwgQXJyYXk8UHJvbWlzZUNhbGxiYWNrczx1bmtub3duPj4+ID0gbmV3IE1hcCgpO1xuXG5jb25zdCBlbnF1ZXVlQ2FsbGJhY2tzID0gKHR5cGU6IE9ydFdhc21NZXNzYWdlWyd0eXBlJ10sIGNhbGxiYWNrczogUHJvbWlzZUNhbGxiYWNrczx1bmtub3duPik6IHZvaWQgPT4ge1xuICBjb25zdCBxdWV1ZSA9IHF1ZXVlZENhbGxiYWNrcy5nZXQodHlwZSk7XG4gIGlmIChxdWV1ZSkge1xuICAgIHF1ZXVlLnB1c2goY2FsbGJhY2tzKTtcbiAgfSBlbHNlIHtcbiAgICBxdWV1ZWRDYWxsYmFja3Muc2V0KHR5cGUsIFtjYWxsYmFja3NdKTtcbiAgfVxufTtcblxuY29uc3QgZW5zdXJlV29ya2VyID0gKCk6IHZvaWQgPT4ge1xuICBpZiAoaW5pdGlhbGl6aW5nIHx8ICFpbml0aWFsaXplZCB8fCBhYm9ydGVkIHx8ICFwcm94eVdvcmtlcikge1xuICAgIHRocm93IG5ldyBFcnJvcignd29ya2VyIG5vdCByZWFkeScpO1xuICB9XG59O1xuXG5jb25zdCBvblByb3h5V29ya2VyTWVzc2FnZSA9IChldjogTWVzc2FnZUV2ZW50PE9ydFdhc21NZXNzYWdlPik6IHZvaWQgPT4ge1xuICBzd2l0Y2ggKGV2LmRhdGEudHlwZSkge1xuICAgIGNhc2UgJ2luaXQtd2FzbSc6XG4gICAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcbiAgICAgIGlmIChldi5kYXRhLmVycikge1xuICAgICAgICBhYm9ydGVkID0gdHJ1ZTtcbiAgICAgICAgaW5pdFdhc21DYWxsYmFja3NbMV0oZXYuZGF0YS5lcnIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgICAgICBpbml0V2FzbUNhbGxiYWNrc1swXSgpO1xuICAgICAgfVxuICAgICAgaWYgKHRlbXBvcmFyeU9iamVjdFVybCkge1xuICAgICAgICBVUkwucmV2b2tlT2JqZWN0VVJMKHRlbXBvcmFyeU9iamVjdFVybCk7XG4gICAgICAgIHRlbXBvcmFyeU9iamVjdFVybCA9IHVuZGVmaW5lZDtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIGNhc2UgJ2luaXQtZXAnOlxuICAgIGNhc2UgJ2NvcHktZnJvbSc6XG4gICAgY2FzZSAnY3JlYXRlJzpcbiAgICBjYXNlICdyZWxlYXNlJzpcbiAgICBjYXNlICdydW4nOlxuICAgIGNhc2UgJ2VuZC1wcm9maWxpbmcnOiB7XG4gICAgICBjb25zdCBjYWxsYmFja3MgPSBxdWV1ZWRDYWxsYmFja3MuZ2V0KGV2LmRhdGEudHlwZSkhO1xuICAgICAgaWYgKGV2LmRhdGEuZXJyKSB7XG4gICAgICAgIGNhbGxiYWNrcy5zaGlmdCgpIVsxXShldi5kYXRhLmVycik7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBjYWxsYmFja3Muc2hpZnQoKSFbMF0oZXYuZGF0YS5vdXQhKTtcbiAgICAgIH1cbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgICBkZWZhdWx0OlxuICB9XG59O1xuXG5leHBvcnQgY29uc3QgaW5pdGlhbGl6ZVdlYkFzc2VtYmx5QW5kT3J0UnVudGltZSA9IGFzeW5jICgpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgaWYgKGluaXRpYWxpemVkKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIGlmIChpbml0aWFsaXppbmcpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IoXCJtdWx0aXBsZSBjYWxscyB0byAnaW5pdFdhc20oKScgZGV0ZWN0ZWQuXCIpO1xuICB9XG4gIGlmIChhYm9ydGVkKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwicHJldmlvdXMgY2FsbCB0byAnaW5pdFdhc20oKScgZmFpbGVkLlwiKTtcbiAgfVxuXG4gIGluaXRpYWxpemluZyA9IHRydWU7XG5cbiAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9QUk9YWSAmJiBpc1Byb3h5KCkpIHtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgcHJveHlXb3JrZXI/LnRlcm1pbmF0ZSgpO1xuXG4gICAgICB2b2lkIGltcG9ydFByb3h5V29ya2VyKCkudGhlbigoW29iamVjdFVybCwgd29ya2VyXSkgPT4ge1xuICAgICAgICB0cnkge1xuICAgICAgICAgIHByb3h5V29ya2VyID0gd29ya2VyO1xuICAgICAgICAgIHByb3h5V29ya2VyLm9uZXJyb3IgPSAoZXY6IEVycm9yRXZlbnQpID0+IHJlamVjdChldik7XG4gICAgICAgICAgcHJveHlXb3JrZXIub25tZXNzYWdlID0gb25Qcm94eVdvcmtlck1lc3NhZ2U7XG4gICAgICAgICAgaW5pdFdhc21DYWxsYmFja3MgPSBbcmVzb2x2ZSwgcmVqZWN0XTtcbiAgICAgICAgICBjb25zdCBtZXNzYWdlOiBPcnRXYXNtTWVzc2FnZSA9IHsgdHlwZTogJ2luaXQtd2FzbScsIGluOiBlbnYgfTtcblxuICAgICAgICAgIC8vIGlmIHRoZSBwcm94eSB3b3JrZXIgaXMgbG9hZGVkIGZyb20gYSBibG9iIFVSTCwgd2UgbmVlZCB0byBtYWtlIHN1cmUgdGhlIHBhdGggaW5mb3JtYXRpb24gaXMgbm90IGxvc3QuXG4gICAgICAgICAgLy9cbiAgICAgICAgICAvLyB3aGVuIGBlbnYud2FzbS53YXNtUGF0aHNgIGlzIG5vdCBzZXQsIHdlIG5lZWQgdG8gcGFzcyB0aGUgcGF0aCBpbmZvcm1hdGlvbiB0byB0aGUgd29ya2VyLlxuICAgICAgICAgIC8vXG4gICAgICAgICAgaWYgKCFCVUlMRF9ERUZTLkVOQUJMRV9CVU5ETEVfV0FTTV9KUyAmJiAhbWVzc2FnZS5pbiEud2FzbS53YXNtUGF0aHMgJiYgb2JqZWN0VXJsKSB7XG4gICAgICAgICAgICAvLyBmb3IgYSBidWlsZCBub3QgYnVuZGxlZCB0aGUgd2FzbSBKUywgd2UgbmVlZCB0byBwYXNzIHRoZSBwYXRoIHByZWZpeCB0byB0aGUgd29ya2VyLlxuICAgICAgICAgICAgLy8gdGhlIHBhdGggcHJlZml4IHdpbGwgYmUgdXNlZCB0byByZXNvbHZlIHRoZSBwYXRoIHRvIGJvdGggdGhlIHdhc20gSlMgYW5kIHRoZSB3YXNtIGZpbGUuXG4gICAgICAgICAgICBjb25zdCBpbmZlcnJlZFdhc21QYXRoUHJlZml4ID0gaW5mZXJXYXNtUGF0aFByZWZpeEZyb21TY3JpcHRTcmMoKTtcbiAgICAgICAgICAgIGlmIChpbmZlcnJlZFdhc21QYXRoUHJlZml4KSB7XG4gICAgICAgICAgICAgIG1lc3NhZ2UuaW4hLndhc20ud2FzbVBhdGhzID0gaW5mZXJyZWRXYXNtUGF0aFByZWZpeDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG5cbiAgICAgICAgICBpZiAoXG4gICAgICAgICAgICBCVUlMRF9ERUZTLklTX0VTTSAmJlxuICAgICAgICAgICAgQlVJTERfREVGUy5FTkFCTEVfQlVORExFX1dBU01fSlMgJiZcbiAgICAgICAgICAgICFtZXNzYWdlLmluIS53YXNtLndhc21QYXRocyAmJlxuICAgICAgICAgICAgKG9iamVjdFVybCB8fCBpc0VzbUltcG9ydE1ldGFVcmxIYXJkY29kZWRBc0ZpbGVVcmkpXG4gICAgICAgICAgKSB7XG4gICAgICAgICAgICAvLyBmb3IgYSBidWlsZCBidW5kbGVkIHRoZSB3YXNtIEpTLCBpZiBlaXRoZXIgb2YgdGhlIGZvbGxvd2luZyBjb25kaXRpb25zIGlzIG1ldDpcbiAgICAgICAgICAgIC8vIC0gdGhlIHByb3h5IHdvcmtlciBpcyBsb2FkZWQgZnJvbSBhIGJsb2IgVVJMXG4gICAgICAgICAgICAvLyAtIGBpbXBvcnQubWV0YS51cmxgIGlzIGEgZmlsZSBVUkwsIGl0IG1lYW5zIGl0IGlzIG92ZXJ3cml0ZW4gYnkgdGhlIGJ1bmRsZXIuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gaW4gZWl0aGVyIGNhc2UsIHRoZSBwYXRoIGluZm9ybWF0aW9uIGlzIGxvc3QsIHdlIG5lZWQgdG8gcGFzcyB0aGUgcGF0aCBvZiB0aGUgLndhc20gZmlsZSB0byB0aGUgd29ya2VyLlxuICAgICAgICAgICAgLy8gd2UgbmVlZCB0byB1c2UgdGhlIGJ1bmRsZXIgcHJlZmVycmVkIFVSTCBmb3JtYXQ6XG4gICAgICAgICAgICAvLyBuZXcgVVJMKCdmaWxlbmFtZScsIGltcG9ydC5tZXRhLnVybClcbiAgICAgICAgICAgIC8vIHNvIHRoYXQgdGhlIGJ1bmRsZXIgY2FuIGhhbmRsZSB0aGUgZmlsZSB1c2luZyBjb3JyZXNwb25kaW5nIGxvYWRlcnMuXG4gICAgICAgICAgICBtZXNzYWdlLmluIS53YXNtLndhc21QYXRocyA9IHtcbiAgICAgICAgICAgICAgd2FzbTogIUJVSUxEX0RFRlMuRElTQUJMRV9KU0VQXG4gICAgICAgICAgICAgICAgPyBuZXcgVVJMKCdvcnQtd2FzbS1zaW1kLXRocmVhZGVkLmpzZXAud2FzbScsIEJVSUxEX0RFRlMuRVNNX0lNUE9SVF9NRVRBX1VSTCkuaHJlZlxuICAgICAgICAgICAgICAgIDogbmV3IFVSTCgnb3J0LXdhc20tc2ltZC10aHJlYWRlZC53YXNtJywgQlVJTERfREVGUy5FU01fSU1QT1JUX01FVEFfVVJMKS5ocmVmLFxuICAgICAgICAgICAgfTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcHJveHlXb3JrZXIucG9zdE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgICAgICAgdGVtcG9yYXJ5T2JqZWN0VXJsID0gb2JqZWN0VXJsO1xuICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgcmVqZWN0KGUpO1xuICAgICAgICB9XG4gICAgICB9LCByZWplY3QpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHRyeSB7XG4gICAgICBhd2FpdCBpbml0aWFsaXplV2ViQXNzZW1ibHkoZW52Lndhc20pO1xuICAgICAgYXdhaXQgY29yZS5pbml0UnVudGltZShlbnYpO1xuICAgICAgaW5pdGlhbGl6ZWQgPSB0cnVlO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGFib3J0ZWQgPSB0cnVlO1xuICAgICAgdGhyb3cgZTtcbiAgICB9IGZpbmFsbHkge1xuICAgICAgaW5pdGlhbGl6aW5nID0gZmFsc2U7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgY29uc3QgaW5pdGlhbGl6ZU9ydEVwID0gYXN5bmMgKGVwTmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fUFJPWFkgJiYgaXNQcm94eSgpKSB7XG4gICAgZW5zdXJlV29ya2VyKCk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGVucXVldWVDYWxsYmFja3MoJ2luaXQtZXAnLCBbcmVzb2x2ZSwgcmVqZWN0XSk7XG4gICAgICBjb25zdCBtZXNzYWdlOiBPcnRXYXNtTWVzc2FnZSA9IHsgdHlwZTogJ2luaXQtZXAnLCBpbjogeyBlcE5hbWUsIGVudiB9IH07XG4gICAgICBwcm94eVdvcmtlciEucG9zdE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgYXdhaXQgY29yZS5pbml0RXAoZW52LCBlcE5hbWUpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgY29weUZyb21FeHRlcm5hbEJ1ZmZlciA9IGFzeW5jIChidWZmZXI6IFVpbnQ4QXJyYXkpOiBQcm9taXNlPFNlcmlhbGl6YWJsZUludGVybmFsQnVmZmVyPiA9PiB7XG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fUFJPWFkgJiYgaXNQcm94eSgpKSB7XG4gICAgZW5zdXJlV29ya2VyKCk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFNlcmlhbGl6YWJsZUludGVybmFsQnVmZmVyPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICBlbnF1ZXVlQ2FsbGJhY2tzKCdjb3B5LWZyb20nLCBbcmVzb2x2ZSwgcmVqZWN0XSk7XG4gICAgICBjb25zdCBtZXNzYWdlOiBPcnRXYXNtTWVzc2FnZSA9IHsgdHlwZTogJ2NvcHktZnJvbScsIGluOiB7IGJ1ZmZlciB9IH07XG4gICAgICBwcm94eVdvcmtlciEucG9zdE1lc3NhZ2UobWVzc2FnZSwgW2J1ZmZlci5idWZmZXJdKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gY29yZS5jb3B5RnJvbUV4dGVybmFsQnVmZmVyKGJ1ZmZlcik7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBjcmVhdGVTZXNzaW9uID0gYXN5bmMgKFxuICBtb2RlbDogU2VyaWFsaXphYmxlSW50ZXJuYWxCdWZmZXIgfCBVaW50OEFycmF5LFxuICBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyxcbik6IFByb21pc2U8U2VyaWFsaXphYmxlU2Vzc2lvbk1ldGFkYXRhPiA9PiB7XG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fUFJPWFkgJiYgaXNQcm94eSgpKSB7XG4gICAgLy8gY2hlY2sgdW5zdXBwb3J0ZWQgb3B0aW9uc1xuICAgIGlmIChvcHRpb25zPy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbikge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXNzaW9uIG9wdGlvbiBcInByZWZlcnJlZE91dHB1dExvY2F0aW9uXCIgaXMgbm90IHN1cHBvcnRlZCBmb3IgcHJveHkuJyk7XG4gICAgfVxuICAgIGVuc3VyZVdvcmtlcigpO1xuICAgIHJldHVybiBuZXcgUHJvbWlzZTxTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGE+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGVucXVldWVDYWxsYmFja3MoJ2NyZWF0ZScsIFtyZXNvbHZlLCByZWplY3RdKTtcbiAgICAgIGNvbnN0IG1lc3NhZ2U6IE9ydFdhc21NZXNzYWdlID0geyB0eXBlOiAnY3JlYXRlJywgaW46IHsgbW9kZWwsIG9wdGlvbnM6IHsgLi4ub3B0aW9ucyB9IH0gfTtcbiAgICAgIGNvbnN0IHRyYW5zZmVyYWJsZTogVHJhbnNmZXJhYmxlW10gPSBbXTtcbiAgICAgIGlmIChtb2RlbCBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcbiAgICAgICAgdHJhbnNmZXJhYmxlLnB1c2gobW9kZWwuYnVmZmVyKTtcbiAgICAgIH1cbiAgICAgIHByb3h5V29ya2VyIS5wb3N0TWVzc2FnZShtZXNzYWdlLCB0cmFuc2ZlcmFibGUpO1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBjb3JlLmNyZWF0ZVNlc3Npb24obW9kZWwsIG9wdGlvbnMpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgcmVsZWFzZVNlc3Npb24gPSBhc3luYyAoc2Vzc2lvbklkOiBudW1iZXIpOiBQcm9taXNlPHZvaWQ+ID0+IHtcbiAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9QUk9YWSAmJiBpc1Byb3h5KCkpIHtcbiAgICBlbnN1cmVXb3JrZXIoKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZW5xdWV1ZUNhbGxiYWNrcygncmVsZWFzZScsIFtyZXNvbHZlLCByZWplY3RdKTtcbiAgICAgIGNvbnN0IG1lc3NhZ2U6IE9ydFdhc21NZXNzYWdlID0geyB0eXBlOiAncmVsZWFzZScsIGluOiBzZXNzaW9uSWQgfTtcbiAgICAgIHByb3h5V29ya2VyIS5wb3N0TWVzc2FnZShtZXNzYWdlKTtcbiAgICB9KTtcbiAgfSBlbHNlIHtcbiAgICBjb3JlLnJlbGVhc2VTZXNzaW9uKHNlc3Npb25JZCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBydW4gPSBhc3luYyAoXG4gIHNlc3Npb25JZDogbnVtYmVyLFxuICBpbnB1dEluZGljZXM6IG51bWJlcltdLFxuICBpbnB1dHM6IFRlbnNvck1ldGFkYXRhW10sXG4gIG91dHB1dEluZGljZXM6IG51bWJlcltdLFxuICBvdXRwdXRzOiBBcnJheTxUZW5zb3JNZXRhZGF0YSB8IG51bGw+LFxuICBvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMsXG4pOiBQcm9taXNlPFRlbnNvck1ldGFkYXRhW10+ID0+IHtcbiAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9QUk9YWSAmJiBpc1Byb3h5KCkpIHtcbiAgICAvLyBjaGVjayBpbnB1dHMgbG9jYXRpb25cbiAgICBpZiAoaW5wdXRzLnNvbWUoKHQpID0+IHRbM10gIT09ICdjcHUnKSkge1xuICAgICAgdGhyb3cgbmV3IEVycm9yKCdpbnB1dCB0ZW5zb3Igb24gR1BVIGlzIG5vdCBzdXBwb3J0ZWQgZm9yIHByb3h5LicpO1xuICAgIH1cbiAgICAvLyBjaGVjayBvdXRwdXRzIGxvY2F0aW9uXG4gICAgaWYgKG91dHB1dHMuc29tZSgodCkgPT4gdCkpIHtcbiAgICAgIHRocm93IG5ldyBFcnJvcigncHJlLWFsbG9jYXRlZCBvdXRwdXQgdGVuc29yIGlzIG5vdCBzdXBwb3J0ZWQgZm9yIHByb3h5LicpO1xuICAgIH1cbiAgICBlbnN1cmVXb3JrZXIoKTtcbiAgICByZXR1cm4gbmV3IFByb21pc2U8U2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGFbXT4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgZW5xdWV1ZUNhbGxiYWNrcygncnVuJywgW3Jlc29sdmUsIHJlamVjdF0pO1xuICAgICAgY29uc3Qgc2VyaWFsaXphYmxlSW5wdXRzID0gaW5wdXRzIGFzIFNlcmlhbGl6YWJsZVRlbnNvck1ldGFkYXRhW107IC8vIGV2ZXJ5IGlucHV0IGlzIG9uIENQVS5cbiAgICAgIGNvbnN0IG1lc3NhZ2U6IE9ydFdhc21NZXNzYWdlID0ge1xuICAgICAgICB0eXBlOiAncnVuJyxcbiAgICAgICAgaW46IHsgc2Vzc2lvbklkLCBpbnB1dEluZGljZXMsIGlucHV0czogc2VyaWFsaXphYmxlSW5wdXRzLCBvdXRwdXRJbmRpY2VzLCBvcHRpb25zIH0sXG4gICAgICB9O1xuICAgICAgcHJveHlXb3JrZXIhLnBvc3RNZXNzYWdlKG1lc3NhZ2UsIGNvcmUuZXh0cmFjdFRyYW5zZmVyYWJsZUJ1ZmZlcnMoc2VyaWFsaXphYmxlSW5wdXRzKSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIGNvcmUucnVuKHNlc3Npb25JZCwgaW5wdXRJbmRpY2VzLCBpbnB1dHMsIG91dHB1dEluZGljZXMsIG91dHB1dHMsIG9wdGlvbnMpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZW5kUHJvZmlsaW5nID0gYXN5bmMgKHNlc3Npb25JZDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiA9PiB7XG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fUFJPWFkgJiYgaXNQcm94eSgpKSB7XG4gICAgZW5zdXJlV29ya2VyKCk7XG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgIGVucXVldWVDYWxsYmFja3MoJ2VuZC1wcm9maWxpbmcnLCBbcmVzb2x2ZSwgcmVqZWN0XSk7XG4gICAgICBjb25zdCBtZXNzYWdlOiBPcnRXYXNtTWVzc2FnZSA9IHsgdHlwZTogJ2VuZC1wcm9maWxpbmcnLCBpbjogc2Vzc2lvbklkIH07XG4gICAgICBwcm94eVdvcmtlciEucG9zdE1lc3NhZ2UobWVzc2FnZSk7XG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgY29yZS5lbmRQcm9maWxpbmcoc2Vzc2lvbklkKTtcbiAgfVxufTtcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHtcbiAgSW5mZXJlbmNlU2Vzc2lvbixcbiAgSW5mZXJlbmNlU2Vzc2lvbkhhbmRsZXIsXG4gIFNlc3Npb25IYW5kbGVyLFxuICBUZW5zb3IsXG4gIFRSQUNFX0ZVTkNfQkVHSU4sXG4gIFRSQUNFX0ZVTkNfRU5ELFxufSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuXG5pbXBvcnQgeyBTZXJpYWxpemFibGVJbnRlcm5hbEJ1ZmZlciwgVGVuc29yTWV0YWRhdGEgfSBmcm9tICcuL3Byb3h5LW1lc3NhZ2VzJztcbmltcG9ydCB7IGNvcHlGcm9tRXh0ZXJuYWxCdWZmZXIsIGNyZWF0ZVNlc3Npb24sIGVuZFByb2ZpbGluZywgcmVsZWFzZVNlc3Npb24sIHJ1biB9IGZyb20gJy4vcHJveHktd3JhcHBlcic7XG5pbXBvcnQgeyBpc0dwdUJ1ZmZlclN1cHBvcnRlZFR5cGUsIGlzTUxUZW5zb3JTdXBwb3J0ZWRUeXBlIH0gZnJvbSAnLi93YXNtLWNvbW1vbic7XG5pbXBvcnQgeyBpc05vZGUgfSBmcm9tICcuL3dhc20tdXRpbHMtZW52JztcbmltcG9ydCB7IGxvYWRGaWxlIH0gZnJvbSAnLi93YXNtLXV0aWxzLWxvYWQtZmlsZSc7XG5cbmV4cG9ydCBjb25zdCBlbmNvZGVUZW5zb3JNZXRhZGF0YSA9ICh0ZW5zb3I6IFRlbnNvciwgZ2V0TmFtZTogKCkgPT4gc3RyaW5nKTogVGVuc29yTWV0YWRhdGEgPT4ge1xuICBzd2l0Y2ggKHRlbnNvci5sb2NhdGlvbikge1xuICAgIGNhc2UgJ2NwdSc6XG4gICAgICByZXR1cm4gW3RlbnNvci50eXBlLCB0ZW5zb3IuZGltcywgdGVuc29yLmRhdGEsICdjcHUnXTtcbiAgICBjYXNlICdncHUtYnVmZmVyJzpcbiAgICAgIHJldHVybiBbdGVuc29yLnR5cGUsIHRlbnNvci5kaW1zLCB7IGdwdUJ1ZmZlcjogdGVuc29yLmdwdUJ1ZmZlciB9LCAnZ3B1LWJ1ZmZlciddO1xuICAgIGNhc2UgJ21sLXRlbnNvcic6XG4gICAgICByZXR1cm4gW3RlbnNvci50eXBlLCB0ZW5zb3IuZGltcywgeyBtbFRlbnNvcjogdGVuc29yLm1sVGVuc29yIH0sICdtbC10ZW5zb3InXTtcbiAgICBkZWZhdWx0OlxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnZhbGlkIGRhdGEgbG9jYXRpb246ICR7dGVuc29yLmxvY2F0aW9ufSBmb3IgJHtnZXROYW1lKCl9YCk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBkZWNvZGVUZW5zb3JNZXRhZGF0YSA9ICh0ZW5zb3I6IFRlbnNvck1ldGFkYXRhKTogVGVuc29yID0+IHtcbiAgc3dpdGNoICh0ZW5zb3JbM10pIHtcbiAgICBjYXNlICdjcHUnOlxuICAgICAgcmV0dXJuIG5ldyBUZW5zb3IodGVuc29yWzBdLCB0ZW5zb3JbMl0sIHRlbnNvclsxXSk7XG4gICAgY2FzZSAnZ3B1LWJ1ZmZlcic6IHtcbiAgICAgIGNvbnN0IGRhdGFUeXBlID0gdGVuc29yWzBdO1xuICAgICAgaWYgKCFpc0dwdUJ1ZmZlclN1cHBvcnRlZFR5cGUoZGF0YVR5cGUpKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgbm90IHN1cHBvcnRlZCBkYXRhIHR5cGU6ICR7ZGF0YVR5cGV9IGZvciBkZXNlcmlhbGl6aW5nIEdQVSB0ZW5zb3JgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHsgZ3B1QnVmZmVyLCBkb3dubG9hZCwgZGlzcG9zZSB9ID0gdGVuc29yWzJdO1xuICAgICAgcmV0dXJuIFRlbnNvci5mcm9tR3B1QnVmZmVyKGdwdUJ1ZmZlciwgeyBkYXRhVHlwZSwgZGltczogdGVuc29yWzFdLCBkb3dubG9hZCwgZGlzcG9zZSB9KTtcbiAgICB9XG4gICAgY2FzZSAnbWwtdGVuc29yJzoge1xuICAgICAgY29uc3QgZGF0YVR5cGUgPSB0ZW5zb3JbMF07XG4gICAgICBpZiAoIWlzTUxUZW5zb3JTdXBwb3J0ZWRUeXBlKGRhdGFUeXBlKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYG5vdCBzdXBwb3J0ZWQgZGF0YSB0eXBlOiAke2RhdGFUeXBlfSBmb3IgZGVzZXJpYWxpemluZyBNTFRlbnNvciB0ZW5zb3JgKTtcbiAgICAgIH1cbiAgICAgIGNvbnN0IHsgbWxUZW5zb3IsIGRvd25sb2FkLCBkaXNwb3NlIH0gPSB0ZW5zb3JbMl07XG4gICAgICByZXR1cm4gVGVuc29yLmZyb21NTFRlbnNvcihtbFRlbnNvciwgeyBkYXRhVHlwZSwgZGltczogdGVuc29yWzFdLCBkb3dubG9hZCwgZGlzcG9zZSB9KTtcbiAgICB9XG4gICAgZGVmYXVsdDpcbiAgICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBkYXRhIGxvY2F0aW9uOiAke3RlbnNvclszXX1gKTtcbiAgfVxufTtcblxuZXhwb3J0IGNsYXNzIE9ubnhydW50aW1lV2ViQXNzZW1ibHlTZXNzaW9uSGFuZGxlciBpbXBsZW1lbnRzIEluZmVyZW5jZVNlc3Npb25IYW5kbGVyIHtcbiAgcHJpdmF0ZSBzZXNzaW9uSWQ6IG51bWJlcjtcblxuICBpbnB1dE5hbWVzOiByZWFkb25seSBzdHJpbmdbXTtcbiAgb3V0cHV0TmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xuICBpbnB1dE1ldGFkYXRhOiByZWFkb25seSBJbmZlcmVuY2VTZXNzaW9uLlZhbHVlTWV0YWRhdGFbXTtcbiAgb3V0cHV0TWV0YWRhdGE6IHJlYWRvbmx5IEluZmVyZW5jZVNlc3Npb24uVmFsdWVNZXRhZGF0YVtdO1xuXG4gIGFzeW5jIGZldGNoTW9kZWxBbmRDb3B5VG9XYXNtTWVtb3J5KHBhdGg6IHN0cmluZyk6IFByb21pc2U8U2VyaWFsaXphYmxlSW50ZXJuYWxCdWZmZXI+IHtcbiAgICAvLyBmZXRjaCBtb2RlbCBmcm9tIHVybCBhbmQgbW92ZSB0byB3YXNtIGhlYXAuXG4gICAgcmV0dXJuIGNvcHlGcm9tRXh0ZXJuYWxCdWZmZXIoYXdhaXQgbG9hZEZpbGUocGF0aCkpO1xuICB9XG5cbiAgYXN5bmMgbG9hZE1vZGVsKHBhdGhPckJ1ZmZlcjogc3RyaW5nIHwgVWludDhBcnJheSwgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOiBQcm9taXNlPHZvaWQ+IHtcbiAgICBUUkFDRV9GVU5DX0JFR0lOKCk7XG4gICAgbGV0IG1vZGVsOiBQYXJhbWV0ZXJzPHR5cGVvZiBjcmVhdGVTZXNzaW9uPlswXTtcblxuICAgIGlmICh0eXBlb2YgcGF0aE9yQnVmZmVyID09PSAnc3RyaW5nJykge1xuICAgICAgaWYgKGlzTm9kZSkge1xuICAgICAgICAvLyBub2RlXG4gICAgICAgIG1vZGVsID0gYXdhaXQgbG9hZEZpbGUocGF0aE9yQnVmZmVyKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGJyb3dzZXJcbiAgICAgICAgLy8gZmV0Y2ggbW9kZWwgYW5kIGNvcHkgdG8gd2FzbSBoZWFwLlxuICAgICAgICBtb2RlbCA9IGF3YWl0IHRoaXMuZmV0Y2hNb2RlbEFuZENvcHlUb1dhc21NZW1vcnkocGF0aE9yQnVmZmVyKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgbW9kZWwgPSBwYXRoT3JCdWZmZXI7XG4gICAgfVxuXG4gICAgW3RoaXMuc2Vzc2lvbklkLCB0aGlzLmlucHV0TmFtZXMsIHRoaXMub3V0cHV0TmFtZXMsIHRoaXMuaW5wdXRNZXRhZGF0YSwgdGhpcy5vdXRwdXRNZXRhZGF0YV0gPSBhd2FpdCBjcmVhdGVTZXNzaW9uKFxuICAgICAgbW9kZWwsXG4gICAgICBvcHRpb25zLFxuICAgICk7XG4gICAgVFJBQ0VfRlVOQ19FTkQoKTtcbiAgfVxuXG4gIGFzeW5jIGRpc3Bvc2UoKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIHJlbGVhc2VTZXNzaW9uKHRoaXMuc2Vzc2lvbklkKTtcbiAgfVxuXG4gIGFzeW5jIHJ1bihcbiAgICBmZWVkczogU2Vzc2lvbkhhbmRsZXIuRmVlZHNUeXBlLFxuICAgIGZldGNoZXM6IFNlc3Npb25IYW5kbGVyLkZldGNoZXNUeXBlLFxuICAgIG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyxcbiAgKTogUHJvbWlzZTxTZXNzaW9uSGFuZGxlci5SZXR1cm5UeXBlPiB7XG4gICAgVFJBQ0VfRlVOQ19CRUdJTigpO1xuICAgIGNvbnN0IGlucHV0QXJyYXk6IFRlbnNvcltdID0gW107XG4gICAgY29uc3QgaW5wdXRJbmRpY2VzOiBudW1iZXJbXSA9IFtdO1xuICAgIE9iamVjdC5lbnRyaWVzKGZlZWRzKS5mb3JFYWNoKChrdnApID0+IHtcbiAgICAgIGNvbnN0IG5hbWUgPSBrdnBbMF07XG4gICAgICBjb25zdCB0ZW5zb3IgPSBrdnBbMV07XG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMuaW5wdXROYW1lcy5pbmRleE9mKG5hbWUpO1xuICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgaW5wdXQgJyR7bmFtZX0nYCk7XG4gICAgICB9XG4gICAgICBpbnB1dEFycmF5LnB1c2godGVuc29yKTtcbiAgICAgIGlucHV0SW5kaWNlcy5wdXNoKGluZGV4KTtcbiAgICB9KTtcblxuICAgIGNvbnN0IG91dHB1dEFycmF5OiBBcnJheTxUZW5zb3IgfCBudWxsPiA9IFtdO1xuICAgIGNvbnN0IG91dHB1dEluZGljZXM6IG51bWJlcltdID0gW107XG4gICAgT2JqZWN0LmVudHJpZXMoZmV0Y2hlcykuZm9yRWFjaCgoa3ZwKSA9PiB7XG4gICAgICBjb25zdCBuYW1lID0ga3ZwWzBdO1xuICAgICAgY29uc3QgdGVuc29yID0ga3ZwWzFdO1xuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLm91dHB1dE5hbWVzLmluZGV4T2YobmFtZSk7XG4gICAgICBpZiAoaW5kZXggPT09IC0xKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBvdXRwdXQgJyR7bmFtZX0nYCk7XG4gICAgICB9XG4gICAgICBvdXRwdXRBcnJheS5wdXNoKHRlbnNvcik7XG4gICAgICBvdXRwdXRJbmRpY2VzLnB1c2goaW5kZXgpO1xuICAgIH0pO1xuXG4gICAgY29uc3QgaW5wdXRzID0gaW5wdXRBcnJheS5tYXAoKHQsIGkpID0+XG4gICAgICBlbmNvZGVUZW5zb3JNZXRhZGF0YSh0LCAoKSA9PiBgaW5wdXQgXCIke3RoaXMuaW5wdXROYW1lc1tpbnB1dEluZGljZXNbaV1dfVwiYCksXG4gICAgKTtcbiAgICBjb25zdCBvdXRwdXRzID0gb3V0cHV0QXJyYXkubWFwKCh0LCBpKSA9PlxuICAgICAgdCA/IGVuY29kZVRlbnNvck1ldGFkYXRhKHQsICgpID0+IGBvdXRwdXQgXCIke3RoaXMub3V0cHV0TmFtZXNbb3V0cHV0SW5kaWNlc1tpXV19XCJgKSA6IG51bGwsXG4gICAgKTtcblxuICAgIGNvbnN0IHJlc3VsdHMgPSBhd2FpdCBydW4odGhpcy5zZXNzaW9uSWQsIGlucHV0SW5kaWNlcywgaW5wdXRzLCBvdXRwdXRJbmRpY2VzLCBvdXRwdXRzLCBvcHRpb25zKTtcblxuICAgIGNvbnN0IHJlc3VsdE1hcDogU2Vzc2lvbkhhbmRsZXIuUmV0dXJuVHlwZSA9IHt9O1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcmVzdWx0cy5sZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0TWFwW3RoaXMub3V0cHV0TmFtZXNbb3V0cHV0SW5kaWNlc1tpXV1dID0gb3V0cHV0QXJyYXlbaV0gPz8gZGVjb2RlVGVuc29yTWV0YWRhdGEocmVzdWx0c1tpXSk7XG4gICAgfVxuICAgIFRSQUNFX0ZVTkNfRU5EKCk7XG4gICAgcmV0dXJuIHJlc3VsdE1hcDtcbiAgfVxuXG4gIHN0YXJ0UHJvZmlsaW5nKCk6IHZvaWQge1xuICAgIC8vIFRPRE86IGltcGxlbWVudCBwcm9maWxpbmdcbiAgfVxuXG4gIGVuZFByb2ZpbGluZygpOiB2b2lkIHtcbiAgICB2b2lkIGVuZFByb2ZpbGluZyh0aGlzLnNlc3Npb25JZCk7XG4gIH1cbn1cbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cblxuaW1wb3J0IHsgQmFja2VuZCwgZW52LCBJbmZlcmVuY2VTZXNzaW9uLCBJbmZlcmVuY2VTZXNzaW9uSGFuZGxlciB9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5cbmltcG9ydCB7IGluaXRpYWxpemVPcnRFcCwgaW5pdGlhbGl6ZVdlYkFzc2VtYmx5QW5kT3J0UnVudGltZSB9IGZyb20gJy4vd2FzbS9wcm94eS13cmFwcGVyJztcbmltcG9ydCB7IE9ubnhydW50aW1lV2ViQXNzZW1ibHlTZXNzaW9uSGFuZGxlciB9IGZyb20gJy4vd2FzbS9zZXNzaW9uLWhhbmRsZXItaW5mZXJlbmNlJztcblxuLyoqXG4gKiBUaGlzIGZ1bmN0aW9uIGluaXRpYWxpemVzIGFsbCBmbGFncyBmb3IgV2ViQXNzZW1ibHkuXG4gKlxuICogVGhvc2UgZmxhZ3MgYXJlIGFjY2Vzc2libGUgZnJvbSBgb3J0LmVudi53YXNtYC4gVXNlcnMgYXJlIGFsbG93IHRvIHNldCB0aG9zZSBmbGFncyBiZWZvcmUgdGhlIGZpcnN0IGluZmVyZW5jZSBzZXNzaW9uXG4gKiBiZWluZyBjcmVhdGVkLCB0byBvdmVycmlkZSBkZWZhdWx0IHZhbHVlLlxuICovXG5leHBvcnQgY29uc3QgaW5pdGlhbGl6ZUZsYWdzID0gKCk6IHZvaWQgPT4ge1xuICBpZiAodHlwZW9mIGVudi53YXNtLmluaXRUaW1lb3V0ICE9PSAnbnVtYmVyJyB8fCBlbnYud2FzbS5pbml0VGltZW91dCA8IDApIHtcbiAgICBlbnYud2FzbS5pbml0VGltZW91dCA9IDA7XG4gIH1cblxuICBjb25zdCBzaW1kID0gZW52Lndhc20uc2ltZDtcbiAgaWYgKHR5cGVvZiBzaW1kICE9PSAnYm9vbGVhbicgJiYgc2ltZCAhPT0gdW5kZWZpbmVkICYmIHNpbWQgIT09ICdmaXhlZCcgJiYgc2ltZCAhPT0gJ3JlbGF4ZWQnKSB7XG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIG5vLWNvbnNvbGVcbiAgICBjb25zb2xlLndhcm4oXG4gICAgICBgUHJvcGVydHkgXCJlbnYud2FzbS5zaW1kXCIgaXMgc2V0IHRvIHVua25vd24gdmFsdWUgXCIke3NpbWR9XCIuIFJlc2V0IGl0IHRvIFxcYGZhbHNlXFxgIGFuZCBpZ25vcmUgU0lNRCBmZWF0dXJlIGNoZWNraW5nLmAsXG4gICAgKTtcbiAgICBlbnYud2FzbS5zaW1kID0gZmFsc2U7XG4gIH1cblxuICBpZiAodHlwZW9mIGVudi53YXNtLnByb3h5ICE9PSAnYm9vbGVhbicpIHtcbiAgICBlbnYud2FzbS5wcm94eSA9IGZhbHNlO1xuICB9XG5cbiAgaWYgKHR5cGVvZiBlbnYud2FzbS50cmFjZSAhPT0gJ2Jvb2xlYW4nKSB7XG4gICAgZW52Lndhc20udHJhY2UgPSBmYWxzZTtcbiAgfVxuXG4gIGlmICh0eXBlb2YgZW52Lndhc20ubnVtVGhyZWFkcyAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc0ludGVnZXIoZW52Lndhc20ubnVtVGhyZWFkcykgfHwgZW52Lndhc20ubnVtVGhyZWFkcyA8PSAwKSB7XG4gICAgLy8gVGhlIGZvbGxvd2luZyBsb2dpYyBvbmx5IGFwcGxpZXMgd2hlbiBgb3J0LmVudi53YXNtLm51bVRocmVhZHNgIGlzIG5vdCBzZXQgYnkgdXNlci4gV2Ugd2lsbCBhbHdheXMgaG9ub3IgdXNlcidzXG4gICAgLy8gc2V0dGluZyBpZiBpdCBpcyBwcm92aWRlZC5cblxuICAgIC8vIEJyb3dzZXI6IHdoZW4gY3Jvc3NPcmlnaW5Jc29sYXRlZCBpcyBmYWxzZSwgU2hhcmVkQXJyYXlCdWZmZXIgaXMgbm90IGF2YWlsYWJsZSBzbyBXZWJBc3NlbWJseSB0aHJlYWRzIHdpbGwgbm90XG4gICAgLy8gd29yay4gSW4gdGhpcyBjYXNlLCB3ZSB3aWxsIHNldCBudW1UaHJlYWRzIHRvIDEuXG4gICAgLy9cbiAgICAvLyBUaGVyZSBpcyBhbiBleGNlcHRpb246IHdoZW4gdGhlIGJyb3dzZXIgaXMgY29uZmlndXJlZCB0byBmb3JjZS1lbmFibGUgU2hhcmVkQXJyYXlCdWZmZXIgKGUuZy4gQ2hyb211aW0gd2l0aFxuICAgIC8vIC0tZW5hYmxlLWZlYXR1cmVzPVNoYXJlZEFycmF5QnVmZmVyKSwgaXQgaXMgcG9zc2libGUgdGhhdCBgc2VsZi5jcm9zc09yaWdpbklzb2xhdGVkYCBpcyBmYWxzZSBhbmRcbiAgICAvLyBTaGFyZWRBcnJheUJ1ZmZlciBpcyBhdmFpbGFibGUgYXQgdGhlIHNhbWUgdGltZS4gVGhpcyBpcyB1c3VhbGx5IGZvciB0ZXN0aW5nLiBJbiB0aGlzIGNhc2UsICB3ZSB3aWxsIHN0aWxsIHNldFxuICAgIC8vIG51bVRocmVhZHMgdG8gMSBoZXJlLiBJZiB3ZSB3YW50IHRvIGVuYWJsZSBtdWx0aS10aHJlYWRpbmcgaW4gdGVzdCwgd2Ugc2hvdWxkIHNldCBgb3J0LmVudi53YXNtLm51bVRocmVhZHNgIHRvIGFcbiAgICAvLyB2YWx1ZSBncmVhdGVyIHRoYW4gMS5cbiAgICBpZiAodHlwZW9mIHNlbGYgIT09ICd1bmRlZmluZWQnICYmICFzZWxmLmNyb3NzT3JpZ2luSXNvbGF0ZWQpIHtcbiAgICAgIGVudi53YXNtLm51bVRocmVhZHMgPSAxO1xuICAgIH0gZWxzZSB7XG4gICAgICBjb25zdCBudW1DcHVMb2dpY2FsQ29yZXMgPVxuICAgICAgICB0eXBlb2YgbmF2aWdhdG9yID09PSAndW5kZWZpbmVkJyA/IHJlcXVpcmUoJ25vZGU6b3MnKS5jcHVzKCkubGVuZ3RoIDogbmF2aWdhdG9yLmhhcmR3YXJlQ29uY3VycmVuY3k7XG4gICAgICBlbnYud2FzbS5udW1UaHJlYWRzID0gTWF0aC5taW4oNCwgTWF0aC5jZWlsKChudW1DcHVMb2dpY2FsQ29yZXMgfHwgMSkgLyAyKSk7XG4gICAgfVxuICB9XG59O1xuXG5leHBvcnQgY2xhc3MgT25ueHJ1bnRpbWVXZWJBc3NlbWJseUJhY2tlbmQgaW1wbGVtZW50cyBCYWNrZW5kIHtcbiAgLyoqXG4gICAqIFRoaXMgZnVuY3Rpb24gaW5pdGlhbGl6ZXMgdGhlIFdlYkFzc2VtYmx5IGJhY2tlbmQuXG4gICAqXG4gICAqIFRoaXMgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgb25seSBvbmNlIGZvciBlYWNoIGJhY2tlbmQgbmFtZS4gSXQgd2lsbCBiZSBjYWxsZWQgdGhlIGZpcnN0IHRpbWUgd2hlblxuICAgKiBgb3J0LkluZmVyZW5jZVNlc3Npb24uY3JlYXRlKClgIGlzIGNhbGxlZCB3aXRoIGEgcmVnaXN0ZXJlZCBiYWNrZW5kIG5hbWUuXG4gICAqXG4gICAqIEBwYXJhbSBiYWNrZW5kTmFtZSAtIHRoZSByZWdpc3RlcmVkIGJhY2tlbmQgbmFtZS5cbiAgICovXG4gIGFzeW5jIGluaXQoYmFja2VuZE5hbWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgIC8vIHBvcHVsYXRlIHdhc20gZmxhZ3NcbiAgICBpbml0aWFsaXplRmxhZ3MoKTtcblxuICAgIC8vIGluaXQgd2FzbVxuICAgIGF3YWl0IGluaXRpYWxpemVXZWJBc3NlbWJseUFuZE9ydFJ1bnRpbWUoKTtcblxuICAgIC8vIHBlcmZvcm1lIEVQIHNwZWNpZmljIGluaXRpYWxpemF0aW9uXG4gICAgYXdhaXQgaW5pdGlhbGl6ZU9ydEVwKGJhY2tlbmROYW1lKTtcbiAgfVxuICBjcmVhdGVJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcihcbiAgICBwYXRoOiBzdHJpbmcsXG4gICAgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMsXG4gICk6IFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbkhhbmRsZXI+O1xuICBjcmVhdGVJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcihcbiAgICBidWZmZXI6IFVpbnQ4QXJyYXksXG4gICAgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMsXG4gICk6IFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbkhhbmRsZXI+O1xuICBhc3luYyBjcmVhdGVJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcihcbiAgICBwYXRoT3JCdWZmZXI6IHN0cmluZyB8IFVpbnQ4QXJyYXksXG4gICAgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMsXG4gICk6IFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbkhhbmRsZXI+IHtcbiAgICBjb25zdCBoYW5kbGVyID0gbmV3IE9ubnhydW50aW1lV2ViQXNzZW1ibHlTZXNzaW9uSGFuZGxlcigpO1xuICAgIGF3YWl0IGhhbmRsZXIubG9hZE1vZGVsKHBhdGhPckJ1ZmZlciwgb3B0aW9ucyk7XG4gICAgcmV0dXJuIGhhbmRsZXI7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IHdhc21CYWNrZW5kID0gbmV3IE9ubnhydW50aW1lV2ViQXNzZW1ibHlCYWNrZW5kKCk7XG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXG5cbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXMsIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHMgKi9cblxuLy8gV2UgdXNlIFwicmVxdWlyZVwiIGluc3RlYWQgb2YgXCJpbXBvcnRcIiBoZXJlIGJlY2F1c2UgaW1wb3J0IHN0YXRlbWVudCBtdXN0IGJlIHB1dCBpbiB0b3AgbGV2ZWwuIE91ciBjdXJyZW50IGNvZGUgZG9lc1xuLy8gbm90IGFsbG93IGJ1bmRsZXIgdG8gdHJlZS1zaGFraW5nIGNvZGUgYXMgZXhwZWN0ZWQgYmVjYXVzZSBzb21lIGNvZGVzIGFyZSB0cmVhdGVkIGFzIGhhdmluZyBzaWRlIGVmZmVjdHMuXG4vLyBTbyB3ZSBpbXBvcnQgY29kZSBpbnNpZGUgdGhlIGlmLWNsYXVzZSB0byBhbGxvdyBidW5kbGVyIHJlbW92ZSB0aGUgY29kZSBzYWZlbHkuXG5cbmV4cG9ydCAqIGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XG5pbXBvcnQgKiBhcyBvcnQgZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcbmV4cG9ydCBkZWZhdWx0IG9ydDtcblxuaW1wb3J0IHsgcmVnaXN0ZXJCYWNrZW5kLCBlbnYgfSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xuaW1wb3J0IHsgdmVyc2lvbiB9IGZyb20gJy4vdmVyc2lvbic7XG5cbmlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdMKSB7XG4gIGNvbnN0IG9ubnhqc0JhY2tlbmQgPSByZXF1aXJlKCcuL2JhY2tlbmQtb25ueGpzJykub25ueGpzQmFja2VuZDtcbiAgcmVnaXN0ZXJCYWNrZW5kKCd3ZWJnbCcsIG9ubnhqc0JhY2tlbmQsIC0xMCk7XG59XG5cbmlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU00pIHtcbiAgY29uc3Qgd2FzbUJhY2tlbmQgPSByZXF1aXJlKCcuL2JhY2tlbmQtd2FzbScpLndhc21CYWNrZW5kO1xuICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9KU0VQKSB7XG4gICAgcmVnaXN0ZXJCYWNrZW5kKCd3ZWJncHUnLCB3YXNtQmFja2VuZCwgNSk7XG4gICAgcmVnaXN0ZXJCYWNrZW5kKCd3ZWJubicsIHdhc21CYWNrZW5kLCA1KTtcbiAgfVxuICByZWdpc3RlckJhY2tlbmQoJ2NwdScsIHdhc21CYWNrZW5kLCAxMCk7XG4gIHJlZ2lzdGVyQmFja2VuZCgnd2FzbScsIHdhc21CYWNrZW5kLCAxMCk7XG59XG5cbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShlbnYudmVyc2lvbnMsICd3ZWInLCB7IHZhbHVlOiB2ZXJzaW9uLCBlbnVtZXJhYmxlOiB0cnVlIH0pO1xuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxuXG4vLyBUaGlzIGZpbGUgaXMgZ2VuZXJhdGVkIGJ5IC9qcy9zY3JpcHRzL3VwZGF0ZS12ZXJzaW9uLnRzXG4vLyBEbyBub3QgbW9kaWZ5IGZpbGUgY29udGVudCBtYW51YWxseS5cblxuZXhwb3J0IGNvbnN0IHZlcnNpb24gPSAnMS4yMi4wJztcbiJdLAogICJtYXBwaW5ncyI6ICI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLElBZ0JNLFVBQ0EsMEJBWU8saUJBd0NQLGdDQXdDTztBQTdHYjs7O0FBZ0JBLElBQU0sV0FBcUMsb0JBQUksSUFBRztBQUNsRCxJQUFNLDJCQUFxQyxDQUFBO0FBWXBDLElBQU0sa0JBQWtCLENBQUMsTUFBYyxTQUFrQixhQUEwQjtBQUN4RixVQUFJLFdBQVcsT0FBTyxRQUFRLFNBQVMsY0FBYyxPQUFPLFFBQVEsa0NBQWtDLFlBQVk7QUFDaEgsY0FBTSxpQkFBaUIsU0FBUyxJQUFJLElBQUk7QUFDeEMsWUFBSSxtQkFBbUIsUUFBVztBQUNoQyxtQkFBUyxJQUFJLE1BQU0sRUFBRSxTQUFTLFNBQVEsQ0FBRTttQkFDL0IsZUFBZSxXQUFXLFVBQVU7QUFFN0M7bUJBQ1MsZUFBZSxhQUFhLFVBQVU7QUFDL0MsY0FBSSxlQUFlLFlBQVksU0FBUztBQUN0QyxrQkFBTSxJQUFJLE1BQU0sNEJBQTRCLElBQUksb0JBQW9CLFFBQVEsRUFBRTs7O0FBSWxGLFlBQUksWUFBWSxHQUFHO0FBQ2pCLGdCQUFNLElBQUkseUJBQXlCLFFBQVEsSUFBSTtBQUMvQyxjQUFJLE1BQU0sSUFBSTtBQUNaLHFDQUF5QixPQUFPLEdBQUcsQ0FBQzs7QUFHdEMsbUJBQVNBLEtBQUksR0FBR0EsS0FBSSx5QkFBeUIsUUFBUUEsTUFBSztBQUN4RCxnQkFBSSxTQUFTLElBQUkseUJBQXlCQSxFQUFDLENBQUMsRUFBRyxZQUFZLFVBQVU7QUFDbkUsdUNBQXlCLE9BQU9BLElBQUcsR0FBRyxJQUFJO0FBQzFDOzs7QUFHSixtQ0FBeUIsS0FBSyxJQUFJOztBQUVwQzs7QUFHRixZQUFNLElBQUksVUFBVSxxQkFBcUI7SUFDM0M7QUFRQSxJQUFNLGlDQUFpQyxPQUFPLGdCQUFrRDtBQUM5RixZQUFNLGNBQWMsU0FBUyxJQUFJLFdBQVc7QUFDNUMsVUFBSSxDQUFDLGFBQWE7QUFDaEIsZUFBTzs7QUFHVCxVQUFJLFlBQVksYUFBYTtBQUMzQixlQUFPLFlBQVk7aUJBQ1YsWUFBWSxTQUFTO0FBQzlCLGVBQU8sWUFBWTthQUNkO0FBQ0wsY0FBTSxpQkFBaUIsQ0FBQyxDQUFDLFlBQVk7QUFDckMsWUFBSTtBQUNGLGNBQUksQ0FBQyxnQkFBZ0I7QUFDbkIsd0JBQVksY0FBYyxZQUFZLFFBQVEsS0FBSyxXQUFXOztBQUVoRSxnQkFBTSxZQUFZO0FBQ2xCLHNCQUFZLGNBQWM7QUFDMUIsaUJBQU8sWUFBWTtpQkFDWkMsSUFBRztBQUNWLGNBQUksQ0FBQyxnQkFBZ0I7QUFDbkIsd0JBQVksUUFBUSxHQUFHQSxFQUFDO0FBQ3hCLHdCQUFZLFVBQVU7O0FBRXhCLGlCQUFPLFlBQVk7O0FBRW5CLGlCQUFPLFlBQVk7OztJQUd6QjtBQVdPLElBQU0sc0NBQXNDLE9BQ2pELFlBQ3lFO0FBRXpFLFlBQU0sTUFBTSxRQUFRLHNCQUFzQixDQUFBO0FBQzFDLFlBQU0sZUFBZSxJQUFJLElBQUksQ0FBQyxNQUFPLE9BQU8sTUFBTSxXQUFXLElBQUksRUFBRSxJQUFLO0FBQ3hFLFlBQU0sZUFBZSxhQUFhLFdBQVcsSUFBSSwyQkFBMkI7QUFHNUUsVUFBSTtBQUNKLFlBQU0sU0FBUyxDQUFBO0FBQ2YsWUFBTSx3QkFBd0Isb0JBQUksSUFBRztBQUNyQyxpQkFBVyxlQUFlLGNBQWM7QUFDdEMsY0FBTSxnQkFBZ0IsTUFBTSwrQkFBK0IsV0FBVztBQUN0RSxZQUFJLE9BQU8sa0JBQWtCLFVBQVU7QUFDckMsaUJBQU8sS0FBSyxFQUFFLE1BQU0sYUFBYSxLQUFLLGNBQWEsQ0FBRTtlQUNoRDtBQUNMLGNBQUksQ0FBQyxTQUFTO0FBQ1osc0JBQVU7O0FBRVosY0FBSSxZQUFZLGVBQWU7QUFDN0Isa0NBQXNCLElBQUksV0FBVzs7OztBQU0zQyxVQUFJLENBQUMsU0FBUztBQUNaLGNBQU0sSUFBSSxNQUFNLG9DQUFvQyxPQUFPLElBQUksQ0FBQ0EsT0FBTSxJQUFJQSxHQUFFLElBQUksS0FBS0EsR0FBRSxHQUFHLEVBQUUsRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFOztBQUk1RyxpQkFBVyxFQUFFLE1BQU0sSUFBRyxLQUFNLFFBQVE7QUFDbEMsWUFBSSxhQUFhLFNBQVMsSUFBSSxHQUFHO0FBRS9CLGtCQUFRLEtBQ04sMENBQTBDLElBQUksdURBQXVELEdBQUcsRUFBRTs7O0FBS2hILFlBQU0sY0FBYyxJQUFJLE9BQU8sQ0FBQyxNQUFNLHNCQUFzQixJQUFJLE9BQU8sTUFBTSxXQUFXLElBQUksRUFBRSxJQUFJLENBQUM7QUFFbkcsYUFBTztRQUNMO1FBQ0EsSUFBSSxNQUFNLFNBQVM7VUFDakIsS0FBSyxDQUFDLFFBQVEsU0FBUTtBQUNwQixnQkFBSSxTQUFTLHNCQUFzQjtBQUNqQyxxQkFBTzs7QUFFVCxtQkFBTyxRQUFRLElBQUksUUFBUSxJQUFJO1VBQ2pDO1NBQ0Q7O0lBRUw7Ozs7O0FDbktBOzs7QUErREE7Ozs7O0FDL0RBLElBTWE7QUFOYjs7O0FBTU8sSUFBTSxVQUFVOzs7OztBQ052QixJQVFJLGVBRVM7QUFWYjs7O0FBSUE7QUFJQSxJQUFJLGdCQUF3QztBQUVyQyxJQUFNLE1BQVc7TUFDdEIsTUFBTSxDQUFBO01BQ04sT0FBTyxDQUFBO01BQ1AsUUFBUSxDQUFBO01BQ1IsVUFBVSxFQUFFLFFBQVEsUUFBTztNQUUzQixJQUFJLFNBQVMsT0FBbUI7QUFDOUIsWUFBSSxVQUFVLFFBQVc7QUFDdkI7O0FBRUYsWUFBSSxPQUFPLFVBQVUsWUFBWSxDQUFDLFdBQVcsUUFBUSxXQUFXLFNBQVMsT0FBTyxFQUFFLFFBQVEsS0FBSyxNQUFNLElBQUk7QUFDdkcsZ0JBQU0sSUFBSSxNQUFNLDhCQUE4QixLQUFLLEVBQUU7O0FBRXZELHdCQUFnQjtNQUNsQjtNQUNBLElBQUksV0FBUTtBQUNWLGVBQU87TUFDVDs7QUFJRixXQUFPLGVBQWUsS0FBSyxZQUFZLEVBQUUsWUFBWSxLQUFJLENBQUU7Ozs7O0FDL0IzRCxJQXlTYUM7QUF6U2I7OztBQUdBO0FBc1NPLElBQU1BLE9BQVc7Ozs7O0FDelN4QixJQVNhLGlCQW1HQTtBQTVHYjs7O0FBU08sSUFBTSxrQkFBa0IsQ0FBQyxRQUFnQixZQUE0QztBQUMxRixZQUFNLFNBQVMsT0FBTyxhQUFhLGNBQWMsU0FBUyxjQUFjLFFBQVEsSUFBSSxJQUFJLGdCQUFnQixHQUFHLENBQUM7QUFDNUcsYUFBTyxRQUFRLE9BQU8sS0FBSyxDQUFDO0FBQzVCLGFBQU8sU0FBUyxPQUFPLEtBQUssQ0FBQztBQUM3QixZQUFNLGtCQUFrQixPQUFPLFdBQVcsSUFBSTtBQUs5QyxVQUFJLG1CQUFtQixNQUFNO0FBRTNCLFlBQUk7QUFDSixZQUFJO0FBQ0osWUFBSSxTQUFTLGlCQUFpQixVQUFhLFFBQVEsaUJBQWlCLFFBQVE7QUFDMUUsa0JBQVEsT0FBTyxLQUFLLENBQUM7QUFDckIsbUJBQVMsT0FBTyxLQUFLLENBQUM7ZUFDakI7QUFFTCxrQkFBUSxPQUFPLEtBQUssQ0FBQztBQUNyQixtQkFBUyxPQUFPLEtBQUssQ0FBQzs7QUFHeEIsY0FBTSxjQUFjLFNBQVMsV0FBVyxTQUFZLFFBQVEsU0FBUztBQUVyRSxjQUFNLE9BQU8sU0FBUztBQUN0QixZQUFJO0FBQ0osWUFBSTtBQUNKLFlBQUksU0FBUyxVQUFhLEtBQUssU0FBUyxRQUFXO0FBQ2pELHFCQUFXLENBQUMsS0FBSyxLQUFLLEtBQUssR0FBRztlQUN6QjtBQUNMLGNBQUksT0FBTyxLQUFLLFNBQVMsVUFBVTtBQUNqQyx1QkFBVyxDQUFDLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssSUFBSTtpQkFDakQ7QUFDTCx1QkFBVyxDQUFDLEtBQUssS0FBSyxDQUFDLEdBQUcsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDdkQsZ0JBQUksS0FBSyxLQUFLLENBQUMsTUFBTSxRQUFXO0FBQzlCLHVCQUFTLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQzs7OztBQUkvQixZQUFJLFNBQVMsVUFBYSxLQUFLLFNBQVMsUUFBVztBQUNqRCxxQkFBVyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUM7ZUFDakI7QUFDTCxjQUFJLE9BQU8sS0FBSyxTQUFTLFVBQVU7QUFDakMsdUJBQVcsQ0FBQyxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLElBQUk7aUJBQ2pEO0FBQ0wsdUJBQVcsQ0FBQyxLQUFLLEtBQUssQ0FBQyxHQUFHLEtBQUssS0FBSyxDQUFDLEdBQUcsS0FBSyxLQUFLLENBQUMsR0FBRyxDQUFDO0FBQ3ZELGdCQUFJLEtBQUssS0FBSyxDQUFDLE1BQU0sUUFBVztBQUM5Qix1QkFBUyxDQUFDLElBQUksS0FBSyxLQUFLLENBQUM7Ozs7QUFLL0IsY0FBTSxTQUFTLFNBQVM7QUFFeEIsWUFBSSxpQkFBaUIsR0FDbkIsaUJBQWlCLFFBQ2pCLGlCQUFpQixTQUFTLEdBQzFCLGlCQUFpQjtBQUduQixZQUFJLGdCQUFnQixRQUFRO0FBQzFCLDJCQUFpQjtBQUNqQiwyQkFBaUI7QUFDakIsMkJBQWlCLFNBQVM7QUFDMUIsMkJBQWlCLFNBQVM7bUJBQ2pCLGdCQUFnQixPQUFPO0FBQ2hDLDJCQUFpQjtBQUNqQiwyQkFBaUI7QUFDakIsMkJBQWlCLFNBQVM7bUJBQ2pCLGdCQUFnQixPQUFPO0FBQ2hDLDJCQUFpQjtBQUNqQiwyQkFBaUI7QUFDakIsMkJBQWlCLFNBQVM7O0FBRzVCLGlCQUFTLElBQUksR0FBRyxJQUFJLFFBQVEsS0FBSztBQUMvQixtQkFBUyxJQUFJLEdBQUcsSUFBSSxPQUFPLEtBQUs7QUFDOUIsa0JBQU0sS0FBTSxPQUFPLEtBQUssZ0JBQWdCLElBQWUsU0FBUyxDQUFDLEtBQUssU0FBUyxDQUFDO0FBQ2hGLGtCQUFNLEtBQU0sT0FBTyxLQUFLLGdCQUFnQixJQUFlLFNBQVMsQ0FBQyxLQUFLLFNBQVMsQ0FBQztBQUNoRixrQkFBTSxLQUFNLE9BQU8sS0FBSyxnQkFBZ0IsSUFBZSxTQUFTLENBQUMsS0FBSyxTQUFTLENBQUM7QUFDaEYsa0JBQU0sSUFBSSxtQkFBbUIsS0FBSyxPQUFRLE9BQU8sS0FBSyxnQkFBZ0IsSUFBZSxTQUFTLENBQUMsS0FBSyxTQUFTLENBQUM7QUFFOUcsNEJBQWdCLFlBQVksVUFBVSxJQUFJLE1BQU0sSUFBSSxNQUFNLElBQUksTUFBTSxJQUFJO0FBQ3hFLDRCQUFnQixTQUFTLEdBQUcsR0FBRyxHQUFHLENBQUM7OztBQUd2QyxZQUFJLGVBQWUsUUFBUTtBQUN6QixpQkFBTyxPQUFPLFVBQVM7ZUFDbEI7QUFDTCxnQkFBTSxJQUFJLE1BQU0sNEJBQTRCOzthQUV6QztBQUNMLGNBQU0sSUFBSSxNQUFNLDJCQUEyQjs7SUFFL0M7QUFLTyxJQUFNLG9CQUFvQixDQUFDLFFBQWdCLFlBQWlEO0FBQ2pHLFlBQU0sa0JBQ0osT0FBTyxhQUFhLGNBQ2hCLFNBQVMsY0FBYyxRQUFRLEVBQUUsV0FBVyxJQUFJLElBQy9DLElBQUksZ0JBQWdCLEdBQUcsQ0FBQyxFQUFFLFdBQVcsSUFBSTtBQUNoRCxVQUFJO0FBQ0osVUFBSSxtQkFBbUIsTUFBTTtBQUUzQixZQUFJO0FBQ0osWUFBSTtBQUNKLFlBQUk7QUFDSixZQUFJLFNBQVMsaUJBQWlCLFVBQWEsUUFBUSxpQkFBaUIsUUFBUTtBQUMxRSxrQkFBUSxPQUFPLEtBQUssQ0FBQztBQUNyQixtQkFBUyxPQUFPLEtBQUssQ0FBQztBQUN0QixxQkFBVyxPQUFPLEtBQUssQ0FBQztlQUNuQjtBQUVMLGtCQUFRLE9BQU8sS0FBSyxDQUFDO0FBQ3JCLG1CQUFTLE9BQU8sS0FBSyxDQUFDO0FBQ3RCLHFCQUFXLE9BQU8sS0FBSyxDQUFDOztBQUUxQixjQUFNLGNBQWMsWUFBWSxTQUFhLFFBQVEsV0FBVyxTQUFZLFFBQVEsU0FBUyxRQUFTO0FBRXRHLGNBQU0sT0FBTyxTQUFTO0FBQ3RCLFlBQUk7QUFDSixZQUFJO0FBQ0osWUFBSSxTQUFTLFVBQWEsS0FBSyxTQUFTLFFBQVc7QUFDakQscUJBQVcsQ0FBQyxLQUFLLEtBQUssS0FBSyxHQUFHO2VBQ3pCO0FBQ0wsY0FBSSxPQUFPLEtBQUssU0FBUyxVQUFVO0FBQ2pDLHVCQUFXLENBQUMsS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxJQUFJO2lCQUNqRDtBQUNMLHVCQUFXLENBQUMsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLEtBQUssQ0FBQyxHQUFHLEtBQUssS0FBSyxDQUFDLEdBQUcsR0FBRztBQUN6RCxnQkFBSSxLQUFLLEtBQUssQ0FBQyxNQUFNLFFBQVc7QUFDOUIsdUJBQVMsQ0FBQyxJQUFJLEtBQUssS0FBSyxDQUFDOzs7O0FBSS9CLFlBQUksU0FBUyxVQUFhLEtBQUssU0FBUyxRQUFXO0FBQ2pELHFCQUFXLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQztlQUNqQjtBQUNMLGNBQUksT0FBTyxLQUFLLFNBQVMsVUFBVTtBQUNqQyx1QkFBVyxDQUFDLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssSUFBSTtpQkFDakQ7QUFDTCx1QkFBVyxDQUFDLEtBQUssS0FBSyxDQUFDLEdBQUcsS0FBSyxLQUFLLENBQUMsR0FBRyxLQUFLLEtBQUssQ0FBQyxHQUFHLENBQUM7QUFDdkQsZ0JBQUksS0FBSyxLQUFLLENBQUMsTUFBTSxRQUFXO0FBQzlCLHVCQUFTLENBQUMsSUFBSSxLQUFLLEtBQUssQ0FBQzs7OztBQUsvQixjQUFNLFNBQVMsU0FBUztBQUN4QixZQUFJLFlBQVksUUFBVztBQUN6QixjQUNHLFFBQVEsV0FBVyxVQUFhLGFBQWEsS0FBSyxRQUFRLFdBQVcsVUFDckUsYUFBYSxLQUFLLFFBQVEsV0FBVyxTQUFTLFFBQVEsV0FBVyxPQUNsRTtBQUNBLGtCQUFNLElBQUksTUFBTSwrQ0FBK0M7OztBQUtuRSxjQUFNLE9BQU87QUFDYixZQUFJLGdCQUFnQixHQUNsQixnQkFBZ0IsR0FDaEIsZ0JBQWdCLEdBQ2hCLGdCQUFnQjtBQUNsQixZQUFJLGlCQUFpQixHQUNuQixpQkFBaUIsUUFDakIsaUJBQWlCLFNBQVMsR0FDMUIsaUJBQWlCO0FBR25CLFlBQUksZ0JBQWdCLFFBQVE7QUFDMUIsMkJBQWlCO0FBQ2pCLDJCQUFpQjtBQUNqQiwyQkFBaUIsU0FBUztBQUMxQiwyQkFBaUIsU0FBUzttQkFDakIsZ0JBQWdCLE9BQU87QUFDaEMsMkJBQWlCO0FBQ2pCLDJCQUFpQjtBQUNqQiwyQkFBaUIsU0FBUzttQkFDakIsZ0JBQWdCLE9BQU87QUFDaEMsMkJBQWlCO0FBQ2pCLDJCQUFpQjtBQUNqQiwyQkFBaUIsU0FBUzs7QUFHNUIsZ0JBQVEsZ0JBQWdCLGdCQUFnQixPQUFPLE1BQU07QUFFckQsaUJBQ00sSUFBSSxHQUNSLElBQUksU0FBUyxPQUNiLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLGlCQUFpQixNQUFNLEtBQzVGO0FBQ0EsZ0JBQU0sS0FBSyxhQUFhLEtBQU0sT0FBTyxLQUFLLGdCQUFnQixJQUFlLFNBQVMsQ0FBQyxLQUFLLFNBQVMsQ0FBQztBQUNsRyxnQkFBTSxLQUFLLGFBQWEsS0FBTSxPQUFPLEtBQUssZ0JBQWdCLElBQWUsU0FBUyxDQUFDLEtBQUssU0FBUyxDQUFDO0FBQ2xHLGdCQUFNLEtBQUssYUFBYSxLQUFNLE9BQU8sS0FBSyxnQkFBZ0IsSUFBZSxTQUFTLENBQUMsS0FBSyxTQUFTLENBQUM7QUFDbEcsZ0JBQU0sS0FBSyxhQUFhLElBQ3RCLG1CQUFtQixLQUFLLE9BQVEsT0FBTyxLQUFLLGdCQUFnQixJQUFlLFNBQVMsQ0FBQyxLQUFLLFNBQVMsQ0FBQzs7YUFFbkc7QUFDTCxjQUFNLElBQUksTUFBTSwyQkFBMkI7O0FBRTdDLGFBQU87SUFDVDs7Ozs7QUNyTkEsSUFrQ2EsZ0JBOEZBLGlCQW9LQSxtQkFhQSxxQkFXQSxvQkFXQTtBQXZVYjs7O0FBaUJBO0FBaUJPLElBQU0saUJBQWlCLENBQUMsUUFBdUMsWUFBMEM7QUFDOUcsVUFBSSxXQUFXLFFBQVc7QUFDeEIsY0FBTSxJQUFJLE1BQU0sOEJBQThCOztBQUVoRCxVQUFJLFFBQVEsV0FBVyxVQUFhLFFBQVEsVUFBVSxRQUFXO0FBQy9ELGNBQU0sSUFBSSxNQUFNLHdDQUF3Qzs7QUFFMUQsVUFBSSxRQUFRLGlCQUFpQixRQUFRO0FBQ25DLGNBQU0sSUFBSSxNQUFNLHlDQUF5Qzs7QUFHM0QsWUFBTSxFQUFFLFFBQVEsTUFBSyxJQUFLO0FBRTFCLFlBQU0sT0FBTyxRQUFRLFFBQVEsRUFBRSxNQUFNLEtBQUssTUFBTSxFQUFDO0FBQ2pELFVBQUk7QUFDSixVQUFJO0FBRUosVUFBSSxPQUFPLEtBQUssU0FBUyxVQUFVO0FBQ2pDLG1CQUFXLENBQUMsS0FBSyxNQUFNLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxJQUFJO2FBQ2pEO0FBQ0wsbUJBQVcsQ0FBQyxLQUFLLEtBQU0sQ0FBQyxHQUFHLEtBQUssS0FBTSxDQUFDLEdBQUcsS0FBSyxLQUFNLENBQUMsR0FBRyxLQUFLLEtBQU0sQ0FBQyxLQUFLLEdBQUc7O0FBRy9FLFVBQUksT0FBTyxLQUFLLFNBQVMsVUFBVTtBQUNqQyxtQkFBVyxDQUFDLEtBQUssTUFBTSxLQUFLLE1BQU0sS0FBSyxNQUFNLEtBQUssSUFBSTthQUNqRDtBQUNMLG1CQUFXLENBQUMsS0FBSyxLQUFNLENBQUMsR0FBRyxLQUFLLEtBQU0sQ0FBQyxHQUFHLEtBQUssS0FBTSxDQUFDLEdBQUcsS0FBSyxLQUFNLENBQUMsS0FBSyxDQUFDOztBQUc3RSxZQUFNLGNBQWMsUUFBUSxXQUFXLFNBQVksUUFBUSxTQUFTO0FBR3BFLFlBQU0sZUFDSixRQUFRLGlCQUFpQixTQUFhLFFBQVEsaUJBQWlCLFNBQVksUUFBUSxlQUFlLFFBQVM7QUFDN0csWUFBTSxTQUFTLFNBQVM7QUFDeEIsWUFBTSxjQUFjLGlCQUFpQixTQUFTLElBQUksYUFBYSxTQUFTLENBQUMsSUFBSSxJQUFJLGFBQWEsU0FBUyxDQUFDO0FBR3hHLFVBQUksT0FBTyxHQUNULGdCQUFnQixHQUNoQixnQkFBZ0IsR0FDaEIsZ0JBQWdCLEdBQ2hCLGdCQUFnQjtBQUNsQixVQUFJLGlCQUFpQixHQUNuQixpQkFBaUIsUUFDakIsaUJBQWlCLFNBQVMsR0FDMUIsaUJBQWlCO0FBR25CLFVBQUksZ0JBQWdCLE9BQU87QUFDekIsZUFBTztBQUNQLHdCQUFnQjtBQUNoQix3QkFBZ0I7QUFDaEIsd0JBQWdCO0FBQ2hCLHdCQUFnQjs7QUFJbEIsVUFBSSxpQkFBaUIsUUFBUTtBQUMzQix5QkFBaUIsU0FBUztpQkFDakIsaUJBQWlCLE9BQU87QUFDakMseUJBQWlCO0FBQ2pCLHlCQUFpQjtBQUNqQix5QkFBaUIsU0FBUztpQkFDakIsaUJBQWlCLE9BQU87QUFDakMseUJBQWlCO0FBQ2pCLHlCQUFpQjtBQUNqQix5QkFBaUIsU0FBUzs7QUFHNUIsZUFDTSxJQUFJLEdBQ1IsSUFBSSxRQUNKLEtBQUssaUJBQWlCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQU0saUJBQWlCLE1BQzNGO0FBQ0Esb0JBQVksZ0JBQWdCLEtBQUssT0FBTyxhQUFhLElBQUksU0FBUyxDQUFDLEtBQUssU0FBUyxDQUFDO0FBQ2xGLG9CQUFZLGdCQUFnQixLQUFLLE9BQU8sYUFBYSxJQUFJLFNBQVMsQ0FBQyxLQUFLLFNBQVMsQ0FBQztBQUNsRixvQkFBWSxnQkFBZ0IsS0FBSyxPQUFPLGFBQWEsSUFBSSxTQUFTLENBQUMsS0FBSyxTQUFTLENBQUM7QUFDbEYsWUFBSSxtQkFBbUIsTUFBTSxrQkFBa0IsSUFBSTtBQUNqRCxzQkFBWSxnQkFBZ0IsS0FBSyxPQUFPLGFBQWEsSUFBSSxTQUFTLENBQUMsS0FBSyxTQUFTLENBQUM7OztBQUt0RixZQUFNLGVBQ0osaUJBQWlCLFNBQ2IsSUFBSSxPQUFPLFdBQVcsYUFBYSxDQUFDLEdBQUcsR0FBRyxRQUFRLEtBQUssQ0FBQyxJQUN4RCxJQUFJLE9BQU8sV0FBVyxhQUFhLENBQUMsR0FBRyxHQUFHLFFBQVEsS0FBSyxDQUFDO0FBQzlELGFBQU87SUFDVDtBQUtPLElBQU0sa0JBQWtCLE9BQzdCLE9BQ0EsWUFLbUI7QUFFbkIsWUFBTSxpQkFBaUIsT0FBTyxxQkFBcUIsZUFBZSxpQkFBaUI7QUFDbkYsWUFBTSxpQkFBaUIsT0FBTyxjQUFjLGVBQWUsaUJBQWlCO0FBQzVFLFlBQU0sZ0JBQWdCLE9BQU8sZ0JBQWdCLGVBQWUsaUJBQWlCO0FBQzdFLFlBQU0sV0FBVyxPQUFPLFVBQVU7QUFFbEMsVUFBSTtBQUNKLFVBQUksd0JBQStDLFdBQVcsQ0FBQTtBQUU5RCxZQUFNLGVBQWUsTUFBSztBQUN4QixZQUFJLE9BQU8sYUFBYSxhQUFhO0FBQ25DLGlCQUFPLFNBQVMsY0FBYyxRQUFRO21CQUM3QixPQUFPLG9CQUFvQixhQUFhO0FBQ2pELGlCQUFPLElBQUksZ0JBQWdCLEdBQUcsQ0FBQztlQUMxQjtBQUNMLGdCQUFNLElBQUksTUFBTSx5QkFBeUI7O01BRTdDO0FBQ0EsWUFBTSxzQkFBc0IsQ0FBQyxXQUErQztBQUMxRSxZQUFJLE9BQU8sc0JBQXNCLGVBQWUsa0JBQWtCLG1CQUFtQjtBQUNuRixpQkFBTyxPQUFPLFdBQVcsSUFBSTttQkFDcEIsa0JBQWtCLGlCQUFpQjtBQUM1QyxpQkFBTyxPQUFPLFdBQVcsSUFBSTtlQUN4QjtBQUNMLGlCQUFPOztNQUVYO0FBRUEsVUFBSSxnQkFBZ0I7QUFFbEIsY0FBTSxTQUFTLGFBQVk7QUFDM0IsZUFBTyxRQUFRLE1BQU07QUFDckIsZUFBTyxTQUFTLE1BQU07QUFDdEIsY0FBTSxrQkFBa0Isb0JBQW9CLE1BQU07QUFFbEQsWUFBSSxtQkFBbUIsTUFBTTtBQUMzQixjQUFJLFNBQVMsTUFBTTtBQUNuQixjQUFJLFFBQVEsTUFBTTtBQUNsQixjQUFJLFlBQVksVUFBYSxRQUFRLGtCQUFrQixVQUFhLFFBQVEsaUJBQWlCLFFBQVc7QUFDdEcscUJBQVMsUUFBUTtBQUNqQixvQkFBUSxRQUFROztBQUdsQixjQUFJLFlBQVksUUFBVztBQUN6QixvQ0FBd0I7QUFDeEIsZ0JBQUksUUFBUSxpQkFBaUIsUUFBVztBQUN0QyxvQkFBTSxJQUFJLE1BQU0sNkRBQTZEO21CQUN4RTtBQUNMLG9DQUFzQixlQUFlOztBQUV2QyxrQ0FBc0IsU0FBUztBQUMvQixrQ0FBc0IsUUFBUTtpQkFDekI7QUFDTCxrQ0FBc0IsZUFBZTtBQUNyQyxrQ0FBc0IsU0FBUztBQUMvQixrQ0FBc0IsUUFBUTs7QUFHaEMsMEJBQWdCLFVBQVUsT0FBTyxHQUFHLENBQUM7QUFDckMsaUJBQU8sZ0JBQWdCLGFBQWEsR0FBRyxHQUFHLE9BQU8sTUFBTSxFQUFFO2VBQ3BEO0FBQ0wsZ0JBQU0sSUFBSSxNQUFNLDJCQUEyQjs7aUJBRXBDLGdCQUFnQjtBQUN6QixZQUFJO0FBQ0osWUFBSTtBQUVKLFlBQUksWUFBWSxVQUFhLFFBQVEsaUJBQWlCLFVBQWEsUUFBUSxrQkFBa0IsUUFBVztBQUN0RyxtQkFBUyxRQUFRO0FBQ2pCLGtCQUFRLFFBQVE7ZUFDWDtBQUNMLG1CQUFTLE1BQU07QUFDZixrQkFBUSxNQUFNOztBQUdoQixZQUFJLFlBQVksUUFBVztBQUN6QixrQ0FBd0I7O0FBRTFCLDhCQUFzQixTQUFTO0FBQy9CLDhCQUFzQixTQUFTO0FBQy9CLDhCQUFzQixRQUFRO0FBRTlCLFlBQUksWUFBWSxRQUFXO0FBQ3pCLGdCQUFNLGFBQWEsYUFBWTtBQUUvQixxQkFBVyxRQUFRO0FBQ25CLHFCQUFXLFNBQVM7QUFFcEIsZ0JBQU0sa0JBQWtCLG9CQUFvQixVQUFVO0FBRXRELGNBQUksbUJBQW1CLE1BQU07QUFDM0IsNEJBQWdCLGFBQWEsT0FBTyxHQUFHLENBQUM7QUFDeEMsbUJBQU8sZ0JBQWdCLGFBQWEsR0FBRyxHQUFHLE9BQU8sTUFBTSxFQUFFO2lCQUNwRDtBQUNMLGtCQUFNLElBQUksTUFBTSwyQkFBMkI7O2VBRXhDO0FBQ0wsaUJBQU8sTUFBTTs7aUJBRU4sZUFBZTtBQUV4QixZQUFJLFlBQVksUUFBVztBQUN6QixnQkFBTSxJQUFJLE1BQU0seURBQXlEOztBQUczRSxjQUFNLFNBQVMsYUFBWTtBQUMzQixlQUFPLFFBQVEsTUFBTTtBQUNyQixlQUFPLFNBQVMsTUFBTTtBQUN0QixjQUFNLGtCQUFrQixvQkFBb0IsTUFBTTtBQUVsRCxZQUFJLG1CQUFtQixNQUFNO0FBQzNCLGdCQUFNLFNBQVMsTUFBTTtBQUNyQixnQkFBTSxRQUFRLE1BQU07QUFDcEIsMEJBQWdCLFVBQVUsT0FBTyxHQUFHLEdBQUcsT0FBTyxNQUFNO0FBQ3BELGlCQUFPLGdCQUFnQixhQUFhLEdBQUcsR0FBRyxPQUFPLE1BQU0sRUFBRTtBQUN6RCxnQ0FBc0IsU0FBUztBQUMvQixnQ0FBc0IsUUFBUTtBQUM5QixpQkFBTyxlQUFlLE1BQU0scUJBQXFCO2VBQzVDO0FBQ0wsZ0JBQU0sSUFBSSxNQUFNLDJCQUEyQjs7aUJBRXBDLFVBQVU7QUFDbkIsZUFBTyxJQUFJLFFBQVEsQ0FBQyxTQUFTLFdBQVU7QUFDckMsZ0JBQU0sU0FBUyxhQUFZO0FBQzNCLGdCQUFNLFVBQVUsb0JBQW9CLE1BQU07QUFDMUMsY0FBSSxDQUFDLFNBQVMsQ0FBQyxTQUFTO0FBQ3RCLG1CQUFPLE9BQU07O0FBRWYsZ0JBQU0sV0FBVyxJQUFJLE1BQUs7QUFDMUIsbUJBQVMsY0FBYztBQUN2QixtQkFBUyxNQUFNO0FBQ2YsbUJBQVMsU0FBUyxNQUFLO0FBQ3JCLG1CQUFPLFFBQVEsU0FBUztBQUN4QixtQkFBTyxTQUFTLFNBQVM7QUFDekIsb0JBQVEsVUFBVSxVQUFVLEdBQUcsR0FBRyxPQUFPLE9BQU8sT0FBTyxNQUFNO0FBQzdELGtCQUFNLE1BQU0sUUFBUSxhQUFhLEdBQUcsR0FBRyxPQUFPLE9BQU8sT0FBTyxNQUFNO0FBRWxFLGtDQUFzQixTQUFTLE9BQU87QUFDdEMsa0NBQXNCLFFBQVEsT0FBTztBQUNyQyxvQkFBUSxlQUFlLElBQUksTUFBTSxxQkFBcUIsQ0FBQztVQUN6RDtRQUNGLENBQUM7YUFDSTtBQUNMLGNBQU0sSUFBSSxNQUFNLGdFQUFnRTs7QUFHbEYsVUFBSSxTQUFTLFFBQVc7QUFDdEIsZUFBTyxlQUFlLE1BQU0scUJBQXFCO2FBQzVDO0FBQ0wsY0FBTSxJQUFJLE1BQU0sZ0VBQWdFOztJQUVwRjtBQUtPLElBQU0sb0JBQW9CLENBQy9CLFNBQ0EsWUFDVTtBQUNWLFlBQU0sRUFBRSxPQUFPLFFBQVEsVUFBVSxRQUFPLElBQUs7QUFFN0MsWUFBTSxPQUFPLENBQUMsR0FBRyxRQUFRLE9BQU8sQ0FBQztBQUNqQyxhQUFPLElBQUksT0FBTyxFQUFFLFVBQVUsV0FBVyxNQUFNLFdBQVcsU0FBUyxNQUFNLFVBQVUsUUFBTyxDQUFFO0lBQzlGO0FBS08sSUFBTSxzQkFBc0IsQ0FDakMsV0FDQSxZQUNVO0FBQ1YsWUFBTSxFQUFFLFVBQVUsTUFBTSxVQUFVLFFBQU8sSUFBSztBQUM5QyxhQUFPLElBQUksT0FBTyxFQUFFLFVBQVUsY0FBYyxNQUFNLFlBQVksV0FBVyxXQUFXLE1BQU0sVUFBVSxRQUFPLENBQUU7SUFDL0c7QUFLTyxJQUFNLHFCQUFxQixDQUNoQyxVQUNBLFlBQ1U7QUFDVixZQUFNLEVBQUUsVUFBVSxNQUFNLFVBQVUsUUFBTyxJQUFLO0FBQzlDLGFBQU8sSUFBSSxPQUFPLEVBQUUsVUFBVSxhQUFhLE1BQU0sWUFBWSxXQUFXLFVBQVUsTUFBTSxVQUFVLFFBQU8sQ0FBRTtJQUM3RztBQUtPLElBQU0seUJBQXlCLENBQ3BDLE1BQ0EsUUFDQSxTQUNXLElBQUksT0FBTyxFQUFFLFVBQVUsY0FBYyxNQUFNLE1BQU0sUUFBUSxNQUFNLFFBQVEsQ0FBQyxPQUFPLE1BQU0sRUFBQyxDQUFFOzs7OztBQzNVckcsSUFvQmEsdUNBZUEsdUNBY1QscUJBQ1M7QUFsRGI7OztBQW9CTyxJQUFNLHdDQUF3QyxvQkFBSSxJQUE2QztNQUNwRyxDQUFDLFdBQVcsWUFBWTtNQUN4QixDQUFDLFNBQVMsVUFBVTtNQUNwQixDQUFDLFFBQVEsU0FBUztNQUNsQixDQUFDLFVBQVUsV0FBVztNQUN0QixDQUFDLFNBQVMsVUFBVTtNQUNwQixDQUFDLFNBQVMsVUFBVTtNQUNwQixDQUFDLFFBQVEsVUFBVTtNQUNuQixDQUFDLFdBQVcsWUFBWTtNQUN4QixDQUFDLFVBQVUsV0FBVztNQUN0QixDQUFDLFFBQVEsVUFBVTtNQUNuQixDQUFDLFNBQVMsVUFBVTtLQUNyQjtBQUdNLElBQU0sd0NBQXdDLG9CQUFJLElBQWtEO01BQ3pHLENBQUMsY0FBYyxTQUFTO01BQ3hCLENBQUMsWUFBWSxPQUFPO01BQ3BCLENBQUMsV0FBVyxNQUFNO01BQ2xCLENBQUMsYUFBYSxRQUFRO01BQ3RCLENBQUMsWUFBWSxPQUFPO01BQ3BCLENBQUMsWUFBWSxPQUFPO01BQ3BCLENBQUMsY0FBYyxTQUFTO01BQ3hCLENBQUMsYUFBYSxRQUFRO0tBQ3ZCO0FBS0QsSUFBSSxzQkFBc0I7QUFDbkIsSUFBTSxrQkFBa0IsTUFBSztBQUNsQyxVQUFJLENBQUMscUJBQXFCO0FBQ3hCLDhCQUFzQjtBQUN0QixjQUFNLDJCQUEyQixPQUFPLGtCQUFrQixlQUFlLGNBQWM7QUFDdkYsY0FBTSw0QkFBNEIsT0FBTyxtQkFBbUIsZUFBZSxlQUFlO0FBRzFGLGNBQU1DLGdCQUFnQixXQUFtQjtBQUN6QyxjQUFNLDBCQUEwQixPQUFPQSxrQkFBaUIsZUFBZUEsY0FBYTtBQUVwRixZQUFJLDBCQUEwQjtBQUM1QixnREFBc0MsSUFBSSxTQUFTLGFBQWE7QUFDaEUsZ0RBQXNDLElBQUksZUFBZSxPQUFPOztBQUVsRSxZQUFJLDJCQUEyQjtBQUM3QixnREFBc0MsSUFBSSxVQUFVLGNBQWM7QUFDbEUsZ0RBQXNDLElBQUksZ0JBQWdCLFFBQVE7O0FBRXBFLFlBQUkseUJBQXlCO0FBQzNCLGdEQUFzQyxJQUFJLFdBQVdBLGFBQVk7QUFDakUsZ0RBQXNDLElBQUlBLGVBQWMsU0FBUztlQUM1RDtBQUVMLGdEQUFzQyxJQUFJLFdBQVcsV0FBVzs7O0lBR3RFOzs7OztBQzVFQSxJQWdCYSxlQWtCQTtBQWxDYjs7O0FBU0E7QUFPTyxJQUFNLGdCQUFnQixDQUFDLFNBQW9DO0FBQ2hFLFVBQUksT0FBTztBQUNYLGVBQVMsSUFBSSxHQUFHLElBQUksS0FBSyxRQUFRLEtBQUs7QUFDcEMsY0FBTSxNQUFNLEtBQUssQ0FBQztBQUNsQixZQUFJLE9BQU8sUUFBUSxZQUFZLENBQUMsT0FBTyxjQUFjLEdBQUcsR0FBRztBQUN6RCxnQkFBTSxJQUFJLFVBQVUsUUFBUSxDQUFDLDhCQUE4QixHQUFHLEVBQUU7O0FBRWxFLFlBQUksTUFBTSxHQUFHO0FBQ1gsZ0JBQU0sSUFBSSxXQUFXLFFBQVEsQ0FBQywwQ0FBMEMsR0FBRyxFQUFFOztBQUUvRSxnQkFBUTs7QUFFVixhQUFPO0lBQ1Q7QUFLTyxJQUFNLGdCQUFnQixDQUFDLFFBQWdCLFNBQW1DO0FBQy9FLGNBQVEsT0FBTyxVQUFVO1FBQ3ZCLEtBQUs7QUFDSCxpQkFBTyxJQUFJLE9BQU8sT0FBTyxNQUFNLE9BQU8sTUFBTSxJQUFJO1FBQ2xELEtBQUs7QUFDSCxpQkFBTyxJQUFJLE9BQU87WUFDaEIsVUFBVTtZQUNWLE1BQU0sT0FBTztZQUNiLE1BQU0sT0FBTztZQUNiO1dBQ0Q7UUFDSCxLQUFLO0FBQ0gsaUJBQU8sSUFBSSxPQUFPO1lBQ2hCLFVBQVU7WUFDVixTQUFTLE9BQU87WUFDaEIsTUFBTSxPQUFPO1lBQ2I7V0FDRDtRQUNILEtBQUs7QUFDSCxpQkFBTyxJQUFJLE9BQU87WUFDaEIsVUFBVTtZQUNWLFdBQVcsT0FBTztZQUNsQixNQUFNLE9BQU87WUFDYjtXQUNEO1FBQ0gsS0FBSztBQUNILGlCQUFPLElBQUksT0FBTztZQUNoQixVQUFVO1lBQ1YsVUFBVSxPQUFPO1lBQ2pCLE1BQU0sT0FBTztZQUNiO1dBQ0Q7UUFDSDtBQUNFLGdCQUFNLElBQUksTUFBTSxrQ0FBa0MsT0FBTyxRQUFRLG1CQUFtQjs7SUFFMUY7Ozs7O0FDckVBLElBaURhO0FBakRiOzs7QUFHQTtBQUVBO0FBb0JBO0FBT0E7QUFpQk0sSUFBTyxTQUFQLE1BQWE7Ozs7TUF1RGpCLFlBQ0UsTUFVQSxNQUNBLE1BQXdCO0FBR3hCLHdCQUFlO0FBRWYsWUFBSTtBQUNKLFlBQUk7QUFFSixZQUFJLE9BQU8sU0FBUyxZQUFZLGNBQWMsTUFBTTtBQUlsRCxlQUFLLGVBQWUsS0FBSztBQUN6QixpQkFBTyxLQUFLO0FBQ1osaUJBQU8sS0FBSztBQUNaLGtCQUFRLEtBQUssVUFBVTtZQUNyQixLQUFLLGNBQWM7QUFDakIsb0JBQU0sZ0NBQWdDLHNDQUFzQyxJQUFJLElBQUk7QUFDcEYsa0JBQUksQ0FBQywrQkFBK0I7QUFDbEMsc0JBQU0sSUFBSSxVQUFVLHFCQUFxQixJQUFJLHVDQUF1Qzs7QUFFdEYsa0JBQUksRUFBRSxLQUFLLGdCQUFnQixnQ0FBZ0M7QUFDekQsc0JBQU0sSUFBSSxVQUFVLDRCQUE0Qiw4QkFBOEIsSUFBSSxFQUFFOztBQUV0RixtQkFBSyxVQUFVLEtBQUs7QUFDcEI7O1lBRUYsS0FBSyxXQUFXO0FBQ2Qsa0JBQUksU0FBUyxXQUFXO0FBQ3RCLHNCQUFNLElBQUksVUFBVSxxQkFBcUIsSUFBSSxpQ0FBaUM7O0FBRWhGLG1CQUFLLGlCQUFpQixLQUFLO0FBQzNCLG1CQUFLLGFBQWEsS0FBSztBQUN2QixtQkFBSyxXQUFXLEtBQUs7QUFDckI7O1lBRUYsS0FBSyxjQUFjO0FBQ2pCLGtCQUNFLFNBQVMsYUFDVCxTQUFTLGFBQ1QsU0FBUyxXQUNULFNBQVMsV0FDVCxTQUFTLFlBQ1QsU0FBUyxXQUNULFNBQVMsVUFDVCxTQUFTLFdBQ1QsU0FBUyxRQUNUO0FBQ0Esc0JBQU0sSUFBSSxVQUFVLHFCQUFxQixJQUFJLG9DQUFvQzs7QUFFbkYsbUJBQUssZ0JBQWdCLEtBQUs7QUFDMUIsbUJBQUssYUFBYSxLQUFLO0FBQ3ZCLG1CQUFLLFdBQVcsS0FBSztBQUNyQjs7WUFFRixLQUFLLGFBQWE7QUFDaEIsa0JBQ0UsU0FBUyxhQUNULFNBQVMsYUFDVCxTQUFTLFdBQ1QsU0FBUyxXQUNULFNBQVMsWUFDVCxTQUFTLFlBQ1QsU0FBUyxVQUNULFNBQVMsV0FDVCxTQUFTLFVBQ1QsU0FBUyxXQUNULFNBQVMsUUFDVDtBQUNBLHNCQUFNLElBQUksVUFBVSxxQkFBcUIsSUFBSSxrQ0FBa0M7O0FBRWpGLG1CQUFLLGVBQWUsS0FBSztBQUN6QixtQkFBSyxhQUFhLEtBQUs7QUFDdkIsbUJBQUssV0FBVyxLQUFLO0FBQ3JCOztZQUVGO0FBQ0Usb0JBQU0sSUFBSSxNQUFNLDZDQUE2QyxLQUFLLFlBQVksR0FBRzs7ZUFFaEY7QUFJTCxjQUFJO0FBQ0osY0FBSTtBQUVKLGNBQUksT0FBTyxTQUFTLFVBQVU7QUFJNUIsbUJBQU87QUFDUCx3QkFBWTtBQUNaLGdCQUFJLFNBQVMsVUFBVTtBQUVyQixrQkFBSSxDQUFDLE1BQU0sUUFBUSxJQUFJLEdBQUc7QUFDeEIsc0JBQU0sSUFBSSxVQUFVLGdEQUFnRDs7QUFJdEUscUJBQU87bUJBQ0Y7QUFFTCxvQkFBTSx3QkFBd0Isc0NBQXNDLElBQUksSUFBSTtBQUM1RSxrQkFBSSwwQkFBMEIsUUFBVztBQUN2QyxzQkFBTSxJQUFJLFVBQVUsNEJBQTRCLElBQUksR0FBRzs7QUFFekQsa0JBQUksTUFBTSxRQUFRLElBQUksR0FBRztBQUN2QixvQkFBSyxTQUFTLGFBQWEsMEJBQTBCLGVBQWdCLFNBQVMsV0FBVyxTQUFTLFFBQVE7QUFXeEcsd0JBQU0sSUFBSSxVQUNSLGNBQWMsSUFBSSwwREFBMEQsc0JBQXNCLElBQUksV0FBVzsyQkFFMUcsU0FBUyxZQUFZLFNBQVMsU0FBUztBQVloRCx5QkFBUSxzQkFBOEIsS0FBSyxNQUFNLE1BQU07dUJBQ2xEO0FBR0wseUJBQVEsc0JBQThCLEtBQUssSUFBSTs7eUJBRXhDLGdCQUFnQix1QkFBdUI7QUFDaEQsdUJBQU87eUJBQ0UsZ0JBQWdCLG1CQUFtQjtBQUM1QyxvQkFBSSxTQUFTLFNBQVM7QUFDcEIseUJBQU8sV0FBVyxLQUFLLElBQUk7dUJBQ3RCO0FBQ0wsd0JBQU0sSUFBSSxVQUFVLHlEQUF5RDs7eUJBRXRFLFNBQVMsYUFBYSxnQkFBZ0IsZUFBZSwwQkFBMEIsYUFBYTtBQU1yRyx1QkFBTyxJQUFLLFdBQW1CLGFBQWEsS0FBSyxRQUFRLEtBQUssWUFBWSxLQUFLLE1BQU07cUJBQ2hGO0FBQ0wsc0JBQU0sSUFBSSxVQUFVLEtBQUssSUFBSSxrQ0FBa0MscUJBQXFCLEVBQUU7OztpQkFHckY7QUFJTCx3QkFBWTtBQUNaLGdCQUFJLE1BQU0sUUFBUSxJQUFJLEdBQUc7QUFFdkIsa0JBQUksS0FBSyxXQUFXLEdBQUc7QUFDckIsc0JBQU0sSUFBSSxVQUFVLHFEQUFxRDs7QUFFM0Usb0JBQU0sbUJBQW1CLE9BQU8sS0FBSyxDQUFDO0FBQ3RDLGtCQUFJLHFCQUFxQixVQUFVO0FBQ2pDLHVCQUFPO0FBQ1AsdUJBQU87eUJBQ0UscUJBQXFCLFdBQVc7QUFDekMsdUJBQU87QUFJUCx1QkFBTyxXQUFXLEtBQUssSUFBYTtxQkFDL0I7QUFDTCxzQkFBTSxJQUFJLFVBQVUsdUNBQXVDLGdCQUFnQixHQUFHOzt1QkFFdkUsZ0JBQWdCLG1CQUFtQjtBQUM1QyxxQkFBTztBQUNQLHFCQUFPLFdBQVcsS0FBSyxJQUFJO21CQUN0QjtBQUVMLG9CQUFNLGFBQWEsc0NBQXNDLElBQ3ZELEtBQUssV0FBOEM7QUFFckQsa0JBQUksZUFBZSxRQUFXO0FBQzVCLHNCQUFNLElBQUksVUFBVSxxQ0FBcUMsS0FBSyxXQUFXLEdBQUc7O0FBRTlFLHFCQUFPO0FBQ1AscUJBQU87OztBQUtYLGNBQUksY0FBYyxRQUFXO0FBRTNCLHdCQUFZLENBQUMsS0FBSyxNQUFNO3FCQUNmLENBQUMsTUFBTSxRQUFRLFNBQVMsR0FBRztBQUNwQyxrQkFBTSxJQUFJLFVBQVUsd0NBQXdDOztBQUU5RCxpQkFBTztBQUVQLGVBQUssVUFBVTtBQUNmLGVBQUssZUFBZTs7QUFJdEIsY0FBTSxPQUFPLGNBQWMsSUFBSTtBQUUvQixZQUFJLEtBQUssV0FBVyxTQUFTLEtBQUssUUFBUSxRQUFRO0FBQ2hELGVBQUssU0FBUyxXQUFXLFNBQVMsV0FBVyxLQUFLLEtBQUssT0FBTyxDQUFDLE1BQU0sS0FBSyxRQUFRLFFBQVE7aUJBRW5GO0FBQ0wsa0JBQU0sSUFBSSxNQUFNLGlCQUFpQixJQUFJLGdDQUFnQyxLQUFLLFFBQVEsTUFBTSxJQUFJOzs7QUFJaEcsYUFBSyxPQUFPO0FBQ1osYUFBSyxPQUFPO0FBQ1osYUFBSyxPQUFPO01BQ2Q7OztNQUlBLGFBQWEsVUFDWCxPQUNBLFNBSXdCO0FBRXhCLGVBQU8sZ0JBQWdCLE9BQU8sT0FBTztNQUN2QztNQUVBLE9BQU8sWUFDTCxTQUNBLFNBQW9DO0FBRXBDLGVBQU8sa0JBQWtCLFNBQVMsT0FBTztNQUMzQztNQUVBLE9BQU8sY0FDTCxXQUNBLFNBQXNDO0FBRXRDLGVBQU8sb0JBQW9CLFdBQVcsT0FBTztNQUMvQztNQUVBLE9BQU8sYUFDTCxVQUNBLFNBQXFDO0FBRXJDLGVBQU8sbUJBQW1CLFVBQVUsT0FBTztNQUM3QztNQUVBLE9BQU8saUJBQ0wsTUFDQSxRQUNBLE1BQXdCO0FBRXhCLGVBQU8sdUJBQXVCLE1BQU0sUUFBUSxJQUFJO01BQ2xEOzs7TUFLQSxVQUFVLFNBQWdDO0FBQ3hDLGVBQU8sZ0JBQWdCLE1BQU0sT0FBTztNQUN0QztNQUVBLFlBQVksU0FBa0M7QUFDNUMsZUFBTyxrQkFBa0IsTUFBTSxPQUFPO01BQ3hDOzs7TUFxREEsSUFBSSxPQUFJO0FBQ04sYUFBSyxZQUFXO0FBQ2hCLFlBQUksQ0FBQyxLQUFLLFNBQVM7QUFDakIsZ0JBQU0sSUFBSSxNQUNSLGdKQUM2RTs7QUFHakYsZUFBTyxLQUFLO01BQ2Q7TUFFQSxJQUFJLFdBQVE7QUFDVixlQUFPLEtBQUs7TUFDZDtNQUVBLElBQUksVUFBTztBQUNULGFBQUssWUFBVztBQUNoQixZQUFJLENBQUMsS0FBSyxnQkFBZ0I7QUFDeEIsZ0JBQU0sSUFBSSxNQUFNLDRDQUE0Qzs7QUFFOUQsZUFBTyxLQUFLO01BQ2Q7TUFFQSxJQUFJLFlBQVM7QUFDWCxhQUFLLFlBQVc7QUFDaEIsWUFBSSxDQUFDLEtBQUssZUFBZTtBQUN2QixnQkFBTSxJQUFJLE1BQU0sNENBQTRDOztBQUU5RCxlQUFPLEtBQUs7TUFDZDtNQUVBLElBQUksV0FBUTtBQUNWLGFBQUssWUFBVztBQUNoQixZQUFJLENBQUMsS0FBSyxjQUFjO0FBQ3RCLGdCQUFNLElBQUksTUFBTSw2Q0FBNkM7O0FBRS9ELGVBQU8sS0FBSztNQUNkOzs7TUFLQSxNQUFNLFFBQVEsYUFBcUI7QUFDakMsYUFBSyxZQUFXO0FBQ2hCLGdCQUFRLEtBQUssY0FBYztVQUN6QixLQUFLO1VBQ0wsS0FBSztBQUNILG1CQUFPLEtBQUs7VUFDZCxLQUFLO1VBQ0wsS0FBSztVQUNMLEtBQUssYUFBYTtBQUNoQixnQkFBSSxDQUFDLEtBQUssWUFBWTtBQUNwQixvQkFBTSxJQUFJLE1BQU0scUVBQXFFOztBQUV2RixnQkFBSSxLQUFLLGVBQWU7QUFDdEIsb0JBQU0sSUFBSSxNQUFNLHlDQUF5Qzs7QUFFM0QsZ0JBQUk7QUFDRixtQkFBSyxnQkFBZ0I7QUFDckIsb0JBQU0sT0FBTyxNQUFNLEtBQUssV0FBVTtBQUNsQyxtQkFBSyxhQUFhO0FBQ2xCLG1CQUFLLGVBQWU7QUFDcEIsbUJBQUssVUFBVTtBQUVmLGtCQUFJLGVBQWUsS0FBSyxVQUFVO0FBQ2hDLHFCQUFLLFNBQVE7QUFDYixxQkFBSyxXQUFXOztBQUdsQixxQkFBTzs7QUFFUCxtQkFBSyxnQkFBZ0I7OztVQUd6QjtBQUNFLGtCQUFNLElBQUksTUFBTSxrQ0FBa0MsS0FBSyxZQUFZLEVBQUU7O01BRTNFO01BRUEsVUFBTztBQUNMLFlBQUksS0FBSyxlQUFlO0FBQ3RCLGdCQUFNLElBQUksTUFBTSx5Q0FBeUM7O0FBRzNELFlBQUksS0FBSyxVQUFVO0FBQ2pCLGVBQUssU0FBUTtBQUNiLGVBQUssV0FBVzs7QUFFbEIsYUFBSyxVQUFVO0FBQ2YsYUFBSyxpQkFBaUI7QUFDdEIsYUFBSyxnQkFBZ0I7QUFDckIsYUFBSyxlQUFlO0FBQ3BCLGFBQUssYUFBYTtBQUNsQixhQUFLLGdCQUFnQjtBQUVyQixhQUFLLGVBQWU7TUFDdEI7OztNQUtRLGNBQVc7QUFDakIsWUFBSSxLQUFLLGlCQUFpQixRQUFRO0FBQ2hDLGdCQUFNLElBQUksTUFBTSx5QkFBeUI7O01BRTdDO01BRUEsUUFBUSxNQUF1QjtBQUM3QixhQUFLLFlBQVc7QUFDaEIsWUFBSSxLQUFLLGNBQWMsS0FBSyxVQUFVO0FBQ3BDLGdCQUFNLElBQUksTUFBTSxpREFBaUQ7O0FBRW5FLGVBQU8sY0FBYyxNQUFNLElBQUk7TUFDakM7Ozs7OztBQy9pQkYsSUFzWWFDO0FBdFliOzs7QUFJQTtBQWtZTyxJQUFNQSxVQUFTOzs7OztBQ3RZdEIsSUFRYSxPQVFQLFlBcUJPLGtCQVVBO0FBL0NiOzs7QUFHQTtBQUtPLElBQU0sUUFBUSxDQUFDLFlBQW9CLFVBQWlCO0FBQ3pELFVBQUksT0FBTyxJQUFJLFVBQVUsY0FBYyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsSUFBSSxPQUFPO0FBQ25FOztBQUdGLGNBQVEsVUFBVSxHQUFHLFVBQVUsVUFBVSxLQUFLLEVBQUU7SUFDbEQ7QUFFQSxJQUFNLGFBQWEsQ0FBQyxLQUFhLGFBQXFCO0FBQ3BELFlBQU0sUUFBUSxJQUFJLE1BQUssRUFBRyxPQUFPLE1BQU0sYUFBYSxLQUFLLENBQUE7QUFDekQsVUFBSSxlQUFlO0FBQ25CLGVBQVMsSUFBSSxHQUFHLElBQUksTUFBTSxRQUFRLEtBQUs7QUFDckMsWUFBSSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsRUFBRSxTQUFTLFlBQVksR0FBRztBQUNwRCxjQUFJLFFBQVEsUUFBUSxHQUFHLEtBQUssTUFBTSxDQUFDLEVBQUUsS0FBSSxFQUFHLE1BQU0sR0FBRyxFQUFFLENBQUMsQ0FBQztBQUN6RCxjQUFJLFVBQVU7QUFDWixxQkFBUyxLQUFLLFFBQVE7O0FBRXhCLGdCQUFNLE9BQU8sS0FBSztBQUNsQjs7QUFFRixZQUFJLE1BQU0sQ0FBQyxFQUFFLFNBQVMsWUFBWSxHQUFHO0FBQ25DLHlCQUFlOzs7SUFHckI7QUFLTyxJQUFNLG1CQUFtQixDQUFDLGFBQXFCO0FBQ3BELFVBQUksT0FBTyxJQUFJLFVBQVUsY0FBYyxDQUFDLElBQUksS0FBSyxRQUFRLENBQUMsSUFBSSxPQUFPO0FBQ25FOztBQUVGLGlCQUFXLFNBQVMsUUFBUTtJQUM5QjtBQUtPLElBQU0saUJBQWlCLENBQUMsYUFBcUI7QUFDbEQsVUFBSSxPQUFPLElBQUksVUFBVSxjQUFjLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxJQUFJLE9BQU87QUFDbkU7O0FBRUYsaUJBQVcsT0FBTyxRQUFRO0lBQzVCOzs7OztBQ3BEQSxJQWdCYTtBQWhCYjs7O0FBR0E7QUFJQTtBQUNBO0FBUU0sSUFBTyxtQkFBUCxNQUFPLGtCQUFnQjtNQUMzQixZQUFvQixTQUFnQztBQUNsRCxhQUFLLFVBQVU7TUFDakI7TUFHQSxNQUFNLElBQUksT0FBa0IsTUFBaUMsTUFBaUI7QUFDNUUseUJBQWdCO0FBQ2hCLGNBQU0sVUFBZ0QsQ0FBQTtBQUN0RCxZQUFJLFVBQXNCLENBQUE7QUFFMUIsWUFBSSxPQUFPLFVBQVUsWUFBWSxVQUFVLFFBQVEsaUJBQWlCQyxXQUFVLE1BQU0sUUFBUSxLQUFLLEdBQUc7QUFDbEcsZ0JBQU0sSUFBSSxVQUNSLCtGQUErRjs7QUFJbkcsWUFBSSxpQkFBaUI7QUFFckIsWUFBSSxPQUFPLFNBQVMsVUFBVTtBQUM1QixjQUFJLFNBQVMsTUFBTTtBQUNqQixrQkFBTSxJQUFJLFVBQVUseUNBQXlDOztBQUUvRCxjQUFJLGdCQUFnQkEsU0FBUTtBQUMxQixrQkFBTSxJQUFJLFVBQVUsOEJBQThCOztBQUdwRCxjQUFJLE1BQU0sUUFBUSxJQUFJLEdBQUc7QUFDdkIsZ0JBQUksS0FBSyxXQUFXLEdBQUc7QUFDckIsb0JBQU0sSUFBSSxVQUFVLHFDQUFxQzs7QUFFM0QsNkJBQWlCO0FBRWpCLHVCQUFXLFFBQVEsTUFBTTtBQUN2QixrQkFBSSxPQUFPLFNBQVMsVUFBVTtBQUM1QixzQkFBTSxJQUFJLFVBQVUsZ0RBQWdEOztBQUV0RSxrQkFBSSxLQUFLLFlBQVksUUFBUSxJQUFJLE1BQU0sSUFBSTtBQUN6QyxzQkFBTSxJQUFJLFdBQVcsMkNBQTJDLElBQUksR0FBRzs7QUFFekUsc0JBQVEsSUFBSSxJQUFJOztBQUdsQixnQkFBSSxPQUFPLFNBQVMsWUFBWSxTQUFTLE1BQU07QUFDN0Msd0JBQVU7dUJBQ0QsT0FBTyxTQUFTLGFBQWE7QUFDdEMsb0JBQU0sSUFBSSxVQUFVLDhCQUE4Qjs7aUJBRS9DO0FBR0wsZ0JBQUksWUFBWTtBQUNoQixrQkFBTSxXQUFXLE9BQU8sb0JBQW9CLElBQUk7QUFDaEQsdUJBQVcsUUFBUSxLQUFLLGFBQWE7QUFDbkMsa0JBQUksU0FBUyxRQUFRLElBQUksTUFBTSxJQUFJO0FBQ2pDLHNCQUFNLElBQUssS0FBNEQsSUFBSTtBQUMzRSxvQkFBSSxNQUFNLFFBQVEsYUFBYUEsU0FBUTtBQUNyQyw4QkFBWTtBQUNaLG1DQUFpQjtBQUNqQiwwQkFBUSxJQUFJLElBQUk7Ozs7QUFLdEIsZ0JBQUksV0FBVztBQUNiLGtCQUFJLE9BQU8sU0FBUyxZQUFZLFNBQVMsTUFBTTtBQUM3QywwQkFBVTt5QkFDRCxPQUFPLFNBQVMsYUFBYTtBQUN0QyxzQkFBTSxJQUFJLFVBQVUsOEJBQThCOzttQkFFL0M7QUFDTCx3QkFBVTs7O21CQUdMLE9BQU8sU0FBUyxhQUFhO0FBQ3RDLGdCQUFNLElBQUksVUFBVSx5REFBeUQ7O0FBSS9FLG1CQUFXLFFBQVEsS0FBSyxZQUFZO0FBQ2xDLGNBQUksT0FBTyxNQUFNLElBQUksTUFBTSxhQUFhO0FBQ3RDLGtCQUFNLElBQUksTUFBTSxVQUFVLElBQUksMEJBQTBCOzs7QUFLNUQsWUFBSSxnQkFBZ0I7QUFDbEIscUJBQVcsUUFBUSxLQUFLLGFBQWE7QUFDbkMsb0JBQVEsSUFBSSxJQUFJOzs7QUFNcEIsY0FBTSxVQUFVLE1BQU0sS0FBSyxRQUFRLElBQUksT0FBTyxTQUFTLE9BQU87QUFDOUQsY0FBTSxjQUE2QyxDQUFBO0FBQ25ELG1CQUFXLE9BQU8sU0FBUztBQUN6QixjQUFJLE9BQU8sZUFBZSxLQUFLLFNBQVMsR0FBRyxHQUFHO0FBQzVDLGtCQUFNLFNBQVMsUUFBUSxHQUFHO0FBQzFCLGdCQUFJLGtCQUFrQkEsU0FBUTtBQUM1QiwwQkFBWSxHQUFHLElBQUk7bUJBQ2Q7QUFDTCwwQkFBWSxHQUFHLElBQUksSUFBSUEsUUFBTyxPQUFPLE1BQU0sT0FBTyxNQUFNLE9BQU8sSUFBSTs7OztBQUl6RSx1QkFBYztBQUNkLGVBQU87TUFDVDtNQUVBLE1BQU0sVUFBTztBQUNYLGVBQU8sS0FBSyxRQUFRLFFBQU87TUFDN0I7TUFXQSxhQUFhLE9BQ1gsTUFDQSxNQUNBLE1BQ0EsTUFBcUI7QUFFckIseUJBQWdCO0FBRWhCLFlBQUk7QUFDSixZQUFJLFVBQTBCLENBQUE7QUFFOUIsWUFBSSxPQUFPLFNBQVMsVUFBVTtBQUM1QixpQ0FBdUI7QUFDdkIsY0FBSSxPQUFPLFNBQVMsWUFBWSxTQUFTLE1BQU07QUFDN0Msc0JBQVU7cUJBQ0QsT0FBTyxTQUFTLGFBQWE7QUFDdEMsa0JBQU0sSUFBSSxVQUFVLDhCQUE4Qjs7bUJBRTNDLGdCQUFnQixZQUFZO0FBQ3JDLGlDQUF1QjtBQUN2QixjQUFJLE9BQU8sU0FBUyxZQUFZLFNBQVMsTUFBTTtBQUM3QyxzQkFBVTtxQkFDRCxPQUFPLFNBQVMsYUFBYTtBQUN0QyxrQkFBTSxJQUFJLFVBQVUsOEJBQThCOzttQkFHcEQsZ0JBQWdCLGVBQ2YsT0FBTyxzQkFBc0IsZUFBZSxnQkFBZ0IsbUJBQzdEO0FBQ0EsZ0JBQU0sU0FBUztBQUNmLGNBQUksYUFBYTtBQUNqQixjQUFJLGFBQWEsS0FBSztBQUN0QixjQUFJLE9BQU8sU0FBUyxZQUFZLFNBQVMsTUFBTTtBQUM3QyxzQkFBVTtxQkFDRCxPQUFPLFNBQVMsVUFBVTtBQUNuQyx5QkFBYTtBQUNiLGdCQUFJLENBQUMsT0FBTyxjQUFjLFVBQVUsR0FBRztBQUNyQyxvQkFBTSxJQUFJLFdBQVcsa0NBQWtDOztBQUV6RCxnQkFBSSxhQUFhLEtBQUssY0FBYyxPQUFPLFlBQVk7QUFDckQsb0JBQU0sSUFBSSxXQUFXLG9DQUFvQyxPQUFPLFVBQVUsSUFBSTs7QUFFaEYseUJBQWEsS0FBSyxhQUFhO0FBQy9CLGdCQUFJLE9BQU8sU0FBUyxVQUFVO0FBQzVCLDJCQUFhO0FBQ2Isa0JBQUksQ0FBQyxPQUFPLGNBQWMsVUFBVSxHQUFHO0FBQ3JDLHNCQUFNLElBQUksV0FBVyxrQ0FBa0M7O0FBRXpELGtCQUFJLGNBQWMsS0FBSyxhQUFhLGFBQWEsT0FBTyxZQUFZO0FBQ2xFLHNCQUFNLElBQUksV0FBVyxvQ0FBb0MsT0FBTyxhQUFhLFVBQVUsSUFBSTs7QUFFN0Ysa0JBQUksT0FBTyxTQUFTLFlBQVksU0FBUyxNQUFNO0FBQzdDLDBCQUFVO3lCQUNELE9BQU8sU0FBUyxhQUFhO0FBQ3RDLHNCQUFNLElBQUksVUFBVSw4QkFBOEI7O3VCQUUzQyxPQUFPLFNBQVMsYUFBYTtBQUN0QyxvQkFBTSxJQUFJLFVBQVUsZ0NBQWdDOztxQkFFN0MsT0FBTyxTQUFTLGFBQWE7QUFDdEMsa0JBQU0sSUFBSSxVQUFVLDhCQUE4Qjs7QUFFcEQsaUNBQXVCLElBQUksV0FBVyxRQUFRLFlBQVksVUFBVTtlQUMvRDtBQUNMLGdCQUFNLElBQUksVUFBVSxxREFBcUQ7O0FBSTNFLGNBQU0sQ0FBQyxTQUFTLHVCQUF1QixJQUFJLE1BQU0sb0NBQW9DLE9BQU87QUFDNUYsY0FBTSxVQUFVLE1BQU0sUUFBUSw4QkFBOEIsc0JBQXNCLHVCQUF1QjtBQUN6Ryx1QkFBYztBQUNkLGVBQU8sSUFBSSxrQkFBaUIsT0FBTztNQUNyQztNQUVBLGlCQUFjO0FBQ1osYUFBSyxRQUFRLGVBQWM7TUFDN0I7TUFDQSxlQUFZO0FBQ1YsYUFBSyxRQUFRLGFBQVk7TUFDM0I7TUFFQSxJQUFJLGFBQVU7QUFDWixlQUFPLEtBQUssUUFBUTtNQUN0QjtNQUNBLElBQUksY0FBVztBQUNiLGVBQU8sS0FBSyxRQUFRO01BQ3RCO01BRUEsSUFBSSxnQkFBYTtBQUNmLGVBQU8sS0FBSyxRQUFRO01BQ3RCO01BRUEsSUFBSSxpQkFBYztBQUNoQixlQUFPLEtBQUssUUFBUTtNQUN0Qjs7Ozs7O0FDek9GLElBMm1CYUM7QUEzbUJiOzs7QUFHQTtBQXdtQk8sSUFBTUEsb0JBQTRDOzs7OztBQzNtQnpEOzs7Ozs7O0FDQUE7Ozs7Ozs7QUNBQTs7Ozs7OztBQ0FBOzs7Ozs7O0FDQUE7OzBCQUFBQztFQUFBOzs7Z0JBQUFDO0VBQUEsV0FBQUM7RUFBQTs7Ozs7QUFtQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOzs7OztBQzNCQSxJQUdhO0FBSGI7QUFBQTtBQUFBO0FBR08sSUFBTSxTQUFTO0FBQUE7QUFBQTs7O0FDSHRCO0FBQUE7QUFBQTtBQUFBO0FBQUEsSUFBSSxHQUFFLEdBQTJzekMscUNBQWM7QUFBL3R6QztBQUFBO0FBQUE7QUFBQSxJQUFNLEtBQUcsSUFBRSxZQUFZLEtBQUksZUFBZUMsS0FBRSxDQUFDLEdBQUU7QUFBQyxVQUFJQyxJQUFFLEdBQUUsSUFBRUQsSUFBRSxJQUFFLElBQUksUUFBUyxDQUFDRSxJQUFFRixPQUFJO0FBQUMsUUFBQUMsS0FBRUMsSUFBRSxJQUFFRjtBQUFBLE1BQUMsQ0FBRSxHQUFFLElBQUUsWUFBVSxPQUFPLFFBQU8sSUFBRSxlQUFhLE9BQU8sbUJBQWtCLElBQUUsS0FBRyxLQUFLLE1BQU0sV0FBVyxZQUFZO0FBQUUsUUFBRSxvQkFBa0IsQ0FBQ0UsSUFBRUYsT0FBSTtBQUFDLFFBQUFFLEdBQUUsV0FBVyxJQUFJLE1BQUlBLEtBQUVBLEdBQUUsVUFBVSxDQUFDLEtBQUksRUFBRSxPQUFLLEVBQUUsS0FBRyxvQkFBSSxRQUFNLElBQUlBLElBQUVGLEVBQUM7QUFBQSxNQUFDLEdBQUUsRUFBRSxzQkFBb0IsTUFBSTtBQUFDLGVBQU8sRUFBRTtBQUFBLE1BQUU7QUFBRSxVQUFJLElBQUUsV0FBVyxxQkFBbUIsSUFBSSxZQUFZLE9BQU8sRUFBQyxTQUFRLEdBQUUsU0FBUSxHQUFFLElBQUcsS0FBRSxDQUFDLEVBQUUsT0FBTztBQUFZLFlBQU0sSUFBRSxDQUFBRSxPQUFHLFVBQVNGLE9BQUk7QUFBQyxZQUFHO0FBQUMsY0FBRyxFQUFFLEdBQUcsT0FBTSxNQUFNLHlCQUF5QjtBQUFFLGdCQUFNQyxLQUFFLEVBQUUsS0FBRyxFQUFDLElBQUdELEdBQUUsQ0FBQyxHQUFFLFFBQU8sQ0FBQyxFQUFDLEdBQUVHLEtBQUUsTUFBTUQsR0FBRSxHQUFHRixFQUFDO0FBQUUsY0FBRyxFQUFFLE9BQUtDLEdBQUUsT0FBTSxNQUFNLGtCQUFrQjtBQUFFLFlBQUUsSUFBSSxNQUFNO0FBQUUsZ0JBQU1HLEtBQUVILEdBQUU7QUFBTyxjQUFHLElBQUVHLEdBQUUsUUFBTztBQUFDLGdCQUFJRixLQUFFLE1BQU0sUUFBUSxJQUFJRSxFQUFDO0FBQUUsZ0JBQUdGLEtBQUVBLEdBQUUsT0FBUSxDQUFBQSxPQUFHQSxFQUFFLEdBQUUsSUFBRUEsR0FBRSxPQUFPLE9BQU0sTUFBTUEsR0FBRSxLQUFLLElBQUksQ0FBQztBQUFBLFVBQUM7QUFBQyxpQkFBT0M7QUFBQSxRQUFDLFVBQUM7QUFBUSxZQUFFLEtBQUc7QUFBQSxRQUFJO0FBQUEsTUFBQztBQUFFLFFBQUUsV0FBUyxDQUFDRCxJQUFFRixPQUFJO0FBQUMsWUFBRyxhQUFXRSxJQUFFO0FBQUMsV0FBQyxFQUFFLElBQUcsRUFBRSxJQUFHLEVBQUUsSUFBRyxFQUFFLElBQUcsRUFBRSxJQUFHLEVBQUUsSUFBRyxFQUFFLElBQUcsRUFBRSxJQUFHLEVBQUUsSUFBRyxFQUFFLElBQUcsRUFBRSxFQUFFLElBQUVGO0FBQUUsZ0JBQU1FLEtBQUUsRUFBRTtBQUFHLFlBQUUscUJBQW1CLENBQUNGLElBQUVDLElBQUVFLElBQUVFLE9BQUlILEdBQUUsZUFBZUYsSUFBRUMsSUFBRUUsSUFBRUUsRUFBQyxHQUFFLEVBQUUsZ0JBQWMsQ0FBQUwsT0FBR0UsR0FBRSxVQUFVRixFQUFDLEdBQUUsRUFBRSx1QkFBcUIsQ0FBQ0EsSUFBRUMsSUFBRUUsT0FBSUQsR0FBRSxpQkFBaUJGLElBQUVDLElBQUVFLEVBQUMsR0FBRSxFQUFFLHNCQUFvQixDQUFBSCxPQUFHO0FBQUMsWUFBQUUsR0FBRSxnQkFBZ0JGLEVBQUM7QUFBQSxVQUFDLEdBQUUsRUFBRSx1QkFBcUIsQ0FBQUEsT0FBRztBQUFDLFlBQUFFLEdBQUUsaUJBQWlCRixFQUFDO0FBQUEsVUFBQyxHQUFFLEVBQUUsaUJBQWUsQ0FBQUEsT0FBR0UsR0FBRSxXQUFXRixFQUFDLEdBQUUsRUFBRSxLQUFHLENBQUNBLElBQUVDLE9BQUk7QUFBQyxZQUFBQyxHQUFFLE9BQU9GLElBQUVDLEVBQUM7QUFBQSxVQUFDO0FBQUEsUUFBQyxXQUFTLFlBQVVDLElBQUU7QUFBQyxnQkFBTUEsS0FBRUYsR0FBRSxDQUFDO0FBQUUsV0FBQyxFQUFFLElBQUcsRUFBRSxJQUFHLEVBQUUsbUJBQWtCLEVBQUUsSUFBRyxFQUFFLG1CQUFtQixJQUFFQSxHQUFFLE1BQU0sQ0FBQyxHQUFFLEVBQUUsdUJBQXFCLEVBQUUsSUFBRyxFQUFFLG9CQUFrQixFQUFFLElBQUcsRUFBRSxrQkFBZ0IsQ0FBQUEsT0FBR0UsR0FBRSxXQUFXRixFQUFDLEdBQUUsRUFBRSxnQkFBY0UsR0FBRSxTQUFTLEtBQUtBLEVBQUMsR0FBRSxFQUFFLHlCQUF1QixDQUFDRixJQUFFQyxPQUFJO0FBQUMsWUFBQUMsR0FBRSxrQkFBa0JGLElBQUVDLEVBQUM7QUFBQSxVQUFDLEdBQUUsRUFBRSx3QkFBc0IsQ0FBQUQsT0FBRztBQUFDLFlBQUFFLEdBQUUsaUJBQWlCRixFQUFDO0FBQUEsVUFBQyxHQUFFLEVBQUUsZ0NBQThCLENBQUNBLElBQUVDLE9BQUlDLEdBQUUseUJBQXlCRixJQUFFQyxFQUFDLEdBQUUsRUFBRSx3QkFBc0IsQ0FBQ0QsSUFBRUMsSUFBRUUsSUFBRUUsT0FBSUgsR0FBRSxpQkFBaUJGLElBQUVDLElBQUVFLElBQUVFLEVBQUMsR0FBRSxFQUFFLHVCQUFxQixDQUFBTCxPQUFHRSxHQUFFLGdCQUFnQkYsRUFBQyxHQUFFLEVBQUUsMEJBQXdCLENBQUNBLElBQUVDLElBQUVFLElBQUVDLElBQUVFLElBQUVDLE9BQUlMLEdBQUUsbUJBQW1CRixJQUFFQyxJQUFFRSxJQUFFQyxJQUFFRSxJQUFFLEVBQUUsSUFBR0MsRUFBQyxHQUFFLEVBQUUsMEJBQXdCTCxHQUFFLG1CQUFtQixLQUFLQSxFQUFDLEdBQUUsRUFBRSxvQkFBa0JBLEdBQUUsYUFBYSxLQUFLQSxFQUFDLEdBQUUsRUFBRSwyQkFBeUJBLEdBQUUsb0JBQW9CLEtBQUtBLEVBQUMsR0FBRSxFQUFFLHFCQUFtQkEsR0FBRSxjQUFjLEtBQUtBLEVBQUMsR0FBRSxFQUFFLDZCQUEyQkEsR0FBRSxzQkFBc0IsS0FBS0EsRUFBQyxHQUFFLEVBQUUsdUNBQXFDQSxHQUFFLGdDQUFnQyxLQUFLQSxFQUFDO0FBQUEsUUFBQztBQUFBLE1BQUM7QUFBRSxVQUFJLElBQUUsTUFBSTtBQUFDLGNBQU1BLEtBQUUsQ0FBQ0EsSUFBRUYsSUFBRUMsT0FBSSxJQUFJRSxPQUFJO0FBQUMsZ0JBQU1FLEtBQUUsSUFBR0QsS0FBRUosS0FBSTtBQUFFLFVBQUFHLEtBQUVELEdBQUUsR0FBR0MsRUFBQztBQUFFLGdCQUFNRyxLQUFFTixLQUFJO0FBQUUsaUJBQU9JLE9BQUlFLE9BQUlKLEtBQUVJLElBQUVMLEdBQUVHLEVBQUMsR0FBRUosS0FBRUMsS0FBRSxPQUFNLE1BQUlJLEtBQUUsSUFBSSxRQUFTLENBQUNILElBQUVGLE9BQUk7QUFBQyxpQkFBRyxFQUFDLFNBQVFFLElBQUUsUUFBT0YsR0FBQztBQUFBLFVBQUMsQ0FBRSxJQUFFRztBQUFBLFFBQUM7QUFBRSxTQUFDLE1BQUk7QUFBQyxxQkFBVUgsTUFBSSxDQUFDLCtCQUE4QixxQkFBb0IsV0FBVSxzQkFBcUIsZUFBZSxFQUFFLEdBQUVBLEVBQUMsSUFBRUUsR0FBRSxFQUFFRixFQUFDLEdBQUcsTUFBSSxFQUFFQSxFQUFDLEdBQUksQ0FBQUUsT0FBRyxFQUFFRixFQUFDLElBQUVFLEVBQUU7QUFBQSxRQUFDLEdBQUcsR0FBRSxXQUFTLE1BQUksRUFBRSxVQUFRLEVBQUUsRUFBRSxPQUFPLEdBQUUsRUFBRSxxQkFBbUIsRUFBRSxFQUFFLGtCQUFrQixJQUFHLElBQUU7QUFBQSxNQUFNO0FBQUUsUUFBRSxZQUFVLE1BQUk7QUFBQyxZQUFJO0FBQUEsTUFBQztBQUFFLFVBQUksR0FBRSxHQUFFLElBQUUsT0FBTyxPQUFPLENBQUMsR0FBRSxDQUFDLEdBQUUsSUFBRSxDQUFDQSxJQUFFRixPQUFJO0FBQUMsY0FBTUE7QUFBQSxNQUFDLEdBQUUsSUFBRTtBQUFHLE9BQUMsS0FBRyxPQUFLLElBQUUsSUFBRSxLQUFLLFNBQVMsT0FBSyxlQUFhLE9BQU8sWUFBVSxTQUFTLGtCQUFnQixJQUFFLFNBQVMsY0FBYyxNQUFLLE1BQUksSUFBRSxJQUFHLElBQUUsRUFBRSxXQUFXLE9BQU8sSUFBRSxLQUFHLEVBQUUsTUFBTSxHQUFFLEVBQUUsUUFBUSxVQUFTLEVBQUUsRUFBRSxZQUFZLEdBQUcsSUFBRSxDQUFDLEdBQUUsTUFBSSxJQUFFLENBQUFFLE9BQUc7QUFBQyxZQUFJRixLQUFFLElBQUk7QUFBZSxlQUFPQSxHQUFFLEtBQUssT0FBTUUsSUFBRSxLQUFFLEdBQUVGLEdBQUUsZUFBYSxlQUFjQSxHQUFFLEtBQUssSUFBSSxHQUFFLElBQUksV0FBV0EsR0FBRSxRQUFRO0FBQUEsTUFBQyxJQUFHLElBQUUsT0FBTUUsT0FBRztBQUFDLFlBQUcsRUFBRUEsRUFBQyxFQUFFLFFBQU8sSUFBSSxRQUFTLENBQUNGLElBQUVDLE9BQUk7QUFBQyxjQUFJRSxLQUFFLElBQUk7QUFBZSxVQUFBQSxHQUFFLEtBQUssT0FBTUQsSUFBRSxJQUFFLEdBQUVDLEdBQUUsZUFBYSxlQUFjQSxHQUFFLFNBQU8sTUFBSTtBQUFDLG1CQUFLQSxHQUFFLFVBQVEsS0FBR0EsR0FBRSxVQUFRQSxHQUFFLFdBQVNILEdBQUVHLEdBQUUsUUFBUSxJQUFFRixHQUFFRSxHQUFFLE1BQU07QUFBQSxVQUFDLEdBQUVBLEdBQUUsVUFBUUYsSUFBRUUsR0FBRSxLQUFLLElBQUk7QUFBQSxRQUFDLENBQUU7QUFBRSxZQUFJSCxLQUFFLE1BQU0sTUFBTUUsSUFBRSxFQUFDLGFBQVksY0FBYSxDQUFDO0FBQUUsWUFBR0YsR0FBRSxHQUFHLFFBQU9BLEdBQUUsWUFBWTtBQUFFLGNBQU0sTUFBTUEsR0FBRSxTQUFPLFFBQU1BLEdBQUUsR0FBRztBQUFBLE1BQUM7QUFBRyxVQUFJLElBQUUsUUFBUSxJQUFJLEtBQUssT0FBTyxHQUFFLElBQUUsUUFBUSxNQUFNLEtBQUssT0FBTyxHQUFFLElBQUUsR0FBRSxJQUFFO0FBQUUsYUFBTyxPQUFPLEdBQUUsQ0FBQyxHQUFFLElBQUU7QUFBSyxVQUFJLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsSUFBRSxFQUFFLFlBQVcsSUFBRSxPQUFHLElBQUUsQ0FBQUUsT0FBR0EsR0FBRSxXQUFXLFNBQVM7QUFBRSxlQUFTLElBQUc7QUFBQyxlQUFPLEVBQUUsVUFBUSxFQUFFLFVBQVEsRUFBRSxHQUFFO0FBQUEsTUFBQztBQUFDLGVBQVMsSUFBRztBQUFDLGVBQU8sRUFBRSxVQUFRLEVBQUUsVUFBUSxFQUFFLEdBQUU7QUFBQSxNQUFDO0FBQUMsZUFBUyxJQUFHO0FBQUMsZUFBTyxFQUFFLFVBQVEsRUFBRSxVQUFRLEVBQUUsR0FBRTtBQUFBLE1BQUM7QUFBQyxlQUFTLElBQUc7QUFBQyxlQUFPLEVBQUUsVUFBUSxFQUFFLFVBQVEsRUFBRSxHQUFFO0FBQUEsTUFBQztBQUFDLGVBQVMsSUFBRztBQUFDLGVBQU8sRUFBRSxVQUFRLEVBQUUsVUFBUSxFQUFFLEdBQUU7QUFBQSxNQUFDO0FBQUMsZUFBUyxJQUFHO0FBQUMsZUFBTyxFQUFFLFVBQVEsRUFBRSxVQUFRLEVBQUUsR0FBRTtBQUFBLE1BQUM7QUFBQyxlQUFTLElBQUc7QUFBQyxlQUFPLEVBQUUsVUFBUSxFQUFFLFVBQVEsRUFBRSxHQUFFO0FBQUEsTUFBQztBQUFDLGVBQVMsSUFBRztBQUFDLGVBQU8sRUFBRSxVQUFRLEVBQUUsVUFBUSxFQUFFLEdBQUU7QUFBQSxNQUFDO0FBQUMsVUFBRyxHQUFFO0FBQVksWUFBU00sTUFBVCxTQUFZTixJQUFFO0FBQUMsY0FBRztBQUFDLGdCQUFJRixLQUFFRSxHQUFFLE1BQUtELEtBQUVELEdBQUU7QUFBRyxnQkFBRyxXQUFTQyxJQUFFO0FBQUMsa0JBQUlDLEtBQUUsQ0FBQztBQUFFLG1CQUFLLFlBQVUsQ0FBQUYsT0FBR0UsR0FBRSxLQUFLRixFQUFDLEdBQUUs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O0FBQUMsZUFBUyxFQUFFQSxJQUFFO0FBQUMsY0FBTSxFQUFFQSxLQUFFLGFBQVdBLEtBQUUsR0FBRyxHQUFFLElBQUUsTUFBR0EsS0FBRSxJQUFJLFlBQVksYUFBYUEsS0FBRSwwQ0FBMEMsR0FBRSxFQUFFQSxFQUFDLEdBQUVBO0FBQUEsTUFBQztBQUFDLGVBQVMsS0FBSTtBQUFDLGVBQU0sRUFBQyxHQUFFLEVBQUMsR0FBRSxJQUFHLElBQUcsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxJQUFHLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsSUFBRyxJQUFHLEdBQUUsSUFBRyxJQUFHLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsSUFBRyxJQUFHLEdBQUUsSUFBRyxJQUFHLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLEdBQUUsSUFBRyxJQUFHLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLElBQUcsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLEdBQUUsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLElBQUcsSUFBRyxHQUFFLElBQUcsSUFBRyxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLElBQUcsSUFBRyxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLElBQUcsSUFBRyxHQUFFLElBQUcsR0FBRSxHQUFFLElBQUcsR0FBRSxFQUFDO0FBQUEsTUFBQztBQUFDLFVBQUksS0FBRyxFQUFDLFFBQU8sQ0FBQ0EsSUFBRUYsSUFBRUMsSUFBRUUsSUFBRUMsT0FBSTtBQUFDLFlBQUcsV0FBUyxLQUFHLENBQUMsRUFBRSxHQUFHLFFBQU87QUFBRSxhQUFJRixLQUFFLEdBQUcsT0FBT0EsT0FBSSxDQUFDLENBQUMsR0FBRyxXQUFXLElBQUksTUFBSUEsS0FBRUEsR0FBRSxVQUFVLENBQUMsSUFBRyxFQUFFQSxLQUFFLEVBQUUsR0FBRyxJQUFJQSxFQUFDLEdBQUcsUUFBTztBQUFFLFlBQUdGLEtBQUUsT0FBT0EsT0FBSSxDQUFDLEdBQUVDLEtBQUUsT0FBT0EsT0FBSSxDQUFDLEdBQUVFLEtBQUUsT0FBT0EsT0FBSSxDQUFDLEdBQUVILEtBQUVDLEtBQUVDLEdBQUUsV0FBVyxRQUFPO0FBQUUsWUFBRztBQUFDLGdCQUFNSSxLQUFFSixHQUFFLFNBQVNGLElBQUVBLEtBQUVDLEVBQUM7QUFBRSxrQkFBT0csSUFBRTtBQUFBLFlBQUMsS0FBSztBQUFFLGdCQUFFLEVBQUUsSUFBSUUsSUFBRUgsT0FBSSxDQUFDO0FBQUU7QUFBQSxZQUFNLEtBQUs7QUFBRSxnQkFBRSxLQUFHLEVBQUUsR0FBR0EsSUFBRUcsRUFBQyxJQUFFLEVBQUUsR0FBR0gsSUFBRUcsRUFBQztBQUFFO0FBQUEsWUFBTTtBQUFRLHFCQUFPO0FBQUEsVUFBQztBQUFDLGlCQUFPO0FBQUEsUUFBQyxRQUFNO0FBQUMsaUJBQU87QUFBQSxRQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ0osSUFBRUYsSUFBRUMsT0FBSTtBQUFDLFVBQUUsR0FBR0MsSUFBRSxFQUFFLEVBQUUsU0FBU0YsT0FBSSxHQUFFQSxLQUFFQyxPQUFJLENBQUMsQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLE1BQUksRUFBRSxHQUFHLEdBQUUsUUFBTyxDQUFBQyxPQUFHO0FBQUMsVUFBRSxHQUFHQSxFQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sTUFBSTtBQUFDLFVBQUUsR0FBRztBQUFBLE1BQUMsR0FBRSxRQUFPLE1BQUk7QUFBQyxVQUFFLEdBQUc7QUFBQSxNQUFDLEdBQUUsUUFBTyxNQUFJO0FBQUMsVUFBRSxHQUFHO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRyxFQUFFLEdBQUdBLEVBQUMsR0FBRSxRQUFPLENBQUFBLE9BQUcsRUFBRSxHQUFHQSxFQUFDLEdBQUUsUUFBTyxDQUFDQSxJQUFFRixJQUFFQyxPQUFJO0FBQUMsVUFBRSxHQUFHLE9BQU9DLEVBQUMsR0FBRSxPQUFPRixFQUFDLEdBQUUsT0FBT0MsRUFBQyxHQUFFLElBQUU7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDQyxJQUFFRixJQUFFQyxPQUFJO0FBQUMsVUFBRSxHQUFHLE9BQU9DLEVBQUMsR0FBRSxPQUFPRixFQUFDLEdBQUUsT0FBT0MsRUFBQyxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sTUFBSSxlQUFhLE9BQU8scUJBQW9CLFFBQU8sQ0FBQUMsT0FBRztBQUFDLFVBQUUsR0FBRyxPQUFNQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLE9BQU1BLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsU0FBUUEsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxRQUFPQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLGNBQWFBLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsUUFBT0EsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxPQUFNQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLE9BQU1BLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsV0FBVUEsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ0EsSUFBRUYsSUFBRUMsT0FBSTtBQUFDLFVBQUUsR0FBRyxlQUFjQyxJQUFFLEVBQUMsT0FBTUYsSUFBRSxNQUFLQyxHQUFDLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQyxPQUFHO0FBQUMsVUFBRSxHQUFHLE9BQU1BLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsT0FBTUEsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxPQUFNQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLE9BQU1BLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsUUFBT0EsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxRQUFPQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLFFBQU9BLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsUUFBT0EsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxRQUFPQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLFNBQVFBLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsU0FBUUEsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxTQUFRQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLFFBQU9BLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsT0FBTUEsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ0EsSUFBRUYsSUFBRUMsT0FBSTtBQUFDLFVBQUUsR0FBRyxRQUFPQyxJQUFFLEVBQUMsS0FBSUYsSUFBRSxLQUFJQyxHQUFDLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQyxPQUFHO0FBQUMsVUFBRSxHQUFHLFFBQU9BLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNBLElBQUVGLE9BQUk7QUFBQyxVQUFFLEdBQUcsT0FBTUUsSUFBRSxFQUFDLE9BQU1GLEdBQUMsQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFFLE9BQUc7QUFBQyxVQUFFLEdBQUcsUUFBT0EsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxRQUFPQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDQSxJQUFFRixPQUFJO0FBQUMsVUFBRSxHQUFHLGFBQVlFLElBQUUsRUFBQyxPQUFNRixHQUFDLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDRSxJQUFFRixPQUFJO0FBQUMsVUFBRSxHQUFHLG1CQUFrQkUsSUFBRSxFQUFDLE9BQU1GLEdBQUMsQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNFLElBQUVGLE9BQUk7QUFBQyxVQUFFLEdBQUcsUUFBT0UsSUFBRSxFQUFDLElBQUdGLEdBQUMsQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFFLE9BQUc7QUFBQyxVQUFFLEdBQUcsT0FBTUEsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxPQUFNQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLE9BQU1BLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsT0FBTUEsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxPQUFNQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFBQSxPQUFHO0FBQUMsVUFBRSxHQUFHLFNBQVFBLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsV0FBVUEsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxrQkFBaUJBLElBQUUsTUFBTTtBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUFBLE9BQUc7QUFBQyxVQUFFLEdBQUcsUUFBT0EsSUFBRSxNQUFNO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUEsT0FBRztBQUFDLFVBQUUsR0FBRyxlQUFjQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDQSxJQUFFRixJQUFFQyxJQUFFRSxJQUFFQyxPQUFJO0FBQUMsVUFBRSxHQUFHLGNBQWFGLElBQUUsRUFBQyxVQUFTLENBQUMsQ0FBQ0YsSUFBRSxtQkFBa0IsQ0FBQyxDQUFDQyxJQUFFLE1BQUtFLEtBQUUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9BLEVBQUMsTUFBSSxHQUFFLE9BQU9DLEVBQUMsTUFBSSxDQUFDLENBQUMsSUFBRSxDQUFDLEVBQUMsQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNGLElBQUVGLElBQUVDLElBQUVFLElBQUVDLE9BQUk7QUFBQyxVQUFFLEdBQUcsYUFBWUYsSUFBRSxFQUFDLFVBQVMsQ0FBQyxD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RSxXQUFVLENBQUNDLEVBQUMsR0FBRSxPQUFNRSxJQUFFLGFBQVksQ0FBQ0MsRUFBQyxHQUFFLE1BQUssQ0FBQ0UsSUFBRUMsRUFBQyxHQUFFLFNBQVEsQ0FBQ0UsRUFBQyxHQUFFLFVBQVMsTUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFRSxPQUFJLENBQUMsR0FBRSxlQUFjQyxLQUFFLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPQSxFQUFDLE1BQUksR0FBRSxPQUFPQyxFQUFDLE1BQUksQ0FBQyxDQUFDLElBQUUsQ0FBQyxHQUFFLGFBQVlDLEtBQUUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9BLEVBQUMsTUFBSSxHQUFFLE9BQU9DLEVBQUMsTUFBSSxDQUFDLENBQUMsSUFBRSxDQUFDLEdBQUUsWUFBVyxHQUFHQyxFQUFDLEVBQUMsQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNkLElBQUVGLElBQUVDLElBQUVFLElBQUVDLElBQUVFLElBQUVDLElBQUVFLElBQUVDLElBQUVDLElBQUVDLElBQUVDLElBQUVDLElBQUVDLE9BQUk7QUFBQyxVQUFFLEdBQUcsaUJBQWdCYixJQUFFLEVBQUMsUUFBT08sS0FBRSxTQUFPLFFBQU8sU0FBUVQsSUFBRSxXQUFVLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPQyxFQUFDLE1BQUksR0FBRSxLQUFHLE9BQU9BLEVBQUMsTUFBSSxPQUFLLENBQUMsQ0FBQyxHQUFFLE9BQU1FLElBQUUsYUFBWSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0MsRUFBQyxNQUFJLEdBQUUsS0FBRyxPQUFPQSxFQUFDLE1BQUksT0FBSyxDQUFDLENBQUMsR0FBRSxNQUFLLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPRSxFQUFDLE1BQUksR0FBRSxLQUFHLE9BQU9BLEVBQUMsTUFBSSxPQUFLLENBQUMsQ0FBQyxHQUFFLFNBQVEsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9DLEVBQUMsTUFBSSxHQUFFLEtBQUcsT0FBT0EsRUFBQyxNQUFJLE9BQUssQ0FBQyxDQUFDLEdBQUUsVUFBUyxNQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUVHLE9BQUksQ0FBQyxHQUFFLGVBQWNDLEtBQUUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9BLEVBQUMsTUFBSSxHQUFFLE9BQU9DLEVBQUMsTUFBSSxDQUFDLENBQUMsSUFBRSxDQUFDLEdBQUUsYUFBWUMsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0MsRUFBQyxNQUFJLENBQUMsQ0FBQyxJQUFFLENBQUMsR0FBRSxZQUFXLEdBQUdDLEVBQUMsRUFBQyxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ2IsSUFBRUYsSUFBRUMsSUFBRUUsSUFBRUMsSUFBRUUsSUFBRUMsSUFBRUUsSUFBRUMsSUFBRUMsSUFBRUMsSUFBRUMsSUFBRUMsSUFBRUMsSUFBRUMsT0FBSTtBQUFDLFVBQUUsR0FBRyxpQkFBZ0JkLElBQUUsRUFBQyxRQUFPUSxLQUFFLFNBQU8sUUFBTyxTQUFRVixJQUFFLFdBQVUsQ0FBQ0MsRUFBQyxHQUFFLE9BQU1FLElBQUUsYUFBWSxDQUFDQyxFQUFDLEdBQUUsTUFBSyxDQUFDRSxJQUFFQyxFQUFDLEdBQUUsU0FBUSxDQUFDRSxFQUFDLEdBQUUsVUFBUyxNQUFJLENBQUMsQ0FBQyxFQUFFLEVBQUVFLE9BQUksQ0FBQyxHQUFFLGVBQWNDLEtBQUUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9BLEVBQUMsTUFBSSxHQUFFLE9BQU9DLEVBQUMsTUFBSSxDQUFDLENBQUMsSUFBRSxDQUFDLEdBQUUsYUFBWUMsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0MsRUFBQyxNQUFJLENBQUMsQ0FBQyxJQUFFLENBQUMsR0FBRSxZQUFXLEdBQUdDLEVBQUMsRUFBQyxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ2QsSUFBRUYsSUFBRUMsSUFBRUUsSUFBRUMsSUFBRUUsSUFBRUMsSUFBRUUsSUFBRUMsSUFBRUMsSUFBRUMsSUFBRUMsSUFBRUMsSUFBRUMsT0FBSTtBQUFDLFVBQUUsR0FBRyxpQkFBZ0JiLElBQUUsRUFBQyxRQUFPTyxLQUFFLFNBQU8sUUFBTyxTQUFRVCxJQUFFLFdBQVUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9DLEVBQUMsTUFBSSxHQUFFLEtBQUcsT0FBT0EsRUFBQyxNQUFJLE9BQUssQ0FBQyxDQUFDLEdBQUUsT0FBTUUsSUFBRSxhQUFZLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPQyxFQUFDLE1BQUksR0FBRSxLQUFHLE9BQU9BLEVBQUMsTUFBSSxPQUFLLENBQUMsQ0FBQyxHQUFFLE1BQUssTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9FLEVBQUMsTUFBSSxHQUFFLEtBQUcsT0FBT0EsRUFBQyxNQUFJLE9BQUssQ0FBQyxDQUFDLEdBQUUsU0FBUSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0MsRUFBQyxNQUFJLEdBQUUsS0FBRyxPQUFPQSxFQUFDLE1BQUksT0FBSyxDQUFDLENBQUMsR0FBRSxVQUFTLE1BQUksQ0FBQyxDQUFDLEVBQUUsRUFBRUcsT0FBSSxDQUFDLEdBQUUsZUFBY0MsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0MsRUFBQyxNQUFJLENBQUMsQ0FBQyxJQUFFLENBQUMsR0FBRSxhQUFZQyxLQUFFLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPQSxFQUFDLE1BQUksR0FBRSxPQUFPQyxFQUFDLE1BQUksQ0FBQyxDQUFDLElBQUUsQ0FBQyxHQUFFLFlBQVcsR0FBR0MsRUFBQyxFQUFDLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDYixJQUFFRixPQUFJO0FBQUMsVUFBRSxHQUFHLHFCQUFvQkUsSUFBRSxFQUFDLFFBQU9GLEtBQUUsU0FBTyxPQUFNLENBQUM7QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDRSxJQUFFRixJQUFFQyxJQUFFRSxJQUFFQyxJQUFFRSxJQUFFQyxJQUFFRSxJQUFFQyxJQUFFQyxJQUFFQyxJQUFFQyxJQUFFQyxJQUFFQyxPQUFJO0FBQUMsVUFBRSxHQUFHLGVBQWNiLElBQUUsRUFBQyxRQUFPYSxLQUFFLFNBQU8sUUFBTyxVQUFTZixJQUFFLFdBQVVDLElBQUUsbUJBQWtCRSxJQUFFLGVBQWNDLElBQUUsV0FBVUUsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0MsRUFBQyxNQUFJLENBQUMsQ0FBQyxJQUFFLENBQUMsR0FBRSxjQUFhRSxLQUFFLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPQSxFQUFDLE1BQUksR0FBRSxPQUFPQyxFQUFDLE1BQUksQ0FBQyxDQUFDLElBQUUsQ0FBQyxHQUFFLE1BQUtDLEtBQUUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9BLEVBQUMsTUFBSSxHQUFFLE9BQU9DLEVBQUMsTUFBSSxDQUFDLENBQUMsSUFBRSxDQUFDLEdBQUUsU0FBUUMsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0MsRUFBQyxNQUFJLENBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ1osSUFBRUYsT0FBSTtBQUFDLFVBQUUsR0FBRyxxQkFBb0JFLElBQUUsRUFBQyxRQUFPRixLQUFFLFNBQU8sT0FBTSxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ0UsSUFBRUYsSUFBRUMsSUFBRUUsSUFBRUMsSUFBRUUsSUFBRUMsSUFBRUUsSUFBRUMsSUFBRUMsSUFBRUMsSUFBRUMsSUFBRUMsSUFBRUMsT0FBSTtBQUFDLFVBQUUsR0FBRyxlQUFjYixJQUFFLEVBQUMsUUFBT2EsS0FBRSxTQUFPLFFBQU8sVUFBU2YsSUFBRSxXQUFVQyxJQUFFLG1CQUFrQkUsSUFBRSxlQUFjQyxJQUFFLFdBQVVFLEtBQUUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9BLEVBQUMsTUFBSSxHQUFFLE9BQU9DLEVBQUMsTUFBSSxDQUFDLENBQUMsSUFBRSxDQUFDLEdBQUUsY0FBYUUsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0MsRUFBQyxNQUFJLENBQUMsQ0FBQyxJQUFFLENBQUMsR0FBRSxNQUFLQyxLQUFFLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPQSxFQUFDLE1BQUksR0FBRSxPQUFPQyxFQUFDLE1BQUksQ0FBQyxDQUFDLElBQUUsQ0FBQyxHQUFFLFNBQVFDLEtBQUUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9BLEVBQUMsTUFBSSxHQUFFLE9BQU9DLEVBQUMsTUFBSSxDQUFDLENBQUMsSUFBRSxDQUFDLEVBQUMsQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNaLElBQUVGLE9BQUk7QUFBQyxVQUFFLEdBQUcsaUJBQWdCRSxJQUFFLEVBQUMsUUFBT0YsS0FBRSxTQUFPLE9BQU0sQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNFLElBQUVGLElBQUVDLElBQUVFLElBQUVDLElBQUVFLElBQUVDLElBQUVFLElBQUVDLElBQUVDLElBQUVDLElBQUVDLElBQUVDLElBQUVDLE9BQUk7QUFBQyxVQUFFLEdBQUcsV0FBVWIsSUFBRSxFQUFDLFFBQU9hLEtBQUUsU0FBTyxRQUFPLFVBQVNmLElBQUUsV0FBVUMsSUFBRSxtQkFBa0JFLElBQUUsZUFBY0MsSUFBRSxXQUFVRSxLQUFFLE1BQU0sS0FBSyxFQUFFLEVBQUUsU0FBUyxPQUFPQSxFQUFDLE1BQUksR0FBRSxPQUFPQyxFQUFDLE1BQUksQ0FBQyxDQUFDLElBQUUsQ0FBQyxHQUFFLGNBQWFFLEtBQUUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9BLEVBQUMsTUFBSSxHQUFFLE9BQU9DLEVBQUMsTUFBSSxDQUFDLENBQUMsSUFBRSxDQUFDLEdBQUUsTUFBS0MsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FB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QUMsSUFBRSxDQUFDLEdBQUUsTUFBS0UsS0FBRSxNQUFNLEtBQUssRUFBRSxFQUFFLFNBQVMsT0FBT0EsRUFBQyxNQUFJLEdBQUUsT0FBT0MsRUFBQyxNQUFJLENBQUMsQ0FBQyxJQUFFLENBQUMsRUFBQyxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUwsT0FBRztBQUFDLFVBQUUsR0FBRyxRQUFPQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDQSxJQUFFRixJQUFFQyxPQUFJO0FBQUMsVUFBRSxHQUFHLHlCQUF3QkMsSUFBRSxFQUFDLFNBQVFGLElBQUUsUUFBT0MsS0FBRSxTQUFPLE9BQU0sQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNDLElBQUVGLElBQUVDLE9BQUk7QUFBQyxVQUFFLEdBQUcseUJBQXdCQyxJQUFFLEVBQUMsU0FBUUYsSUFBRSxRQUFPQyxLQUFFLFNBQU8sT0FBTSxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQUMsT0FBRztBQUFDLFVBQUUsR0FBRyxTQUFRQSxJQUFFLE1BQU07QUFBQSxNQUFDLEdBQUUsUUFBTyxDQUFDQSxJQUFFRixPQUFJO0FBQUMsVUFBRSxHQUFHLFVBQVNFLElBQUUsRUFBQyxVQUFTLEdBQUdGLEVBQUMsRUFBQyxDQUFDO0FBQUEsTUFBQyxHQUFFLFFBQU8sQ0FBQ0UsSUFBRUYsSUFBRUMsSUFBRUUsSUFBRUMsT0FBSTtBQUFDLFVBQUUsR0FBRyxPQUFNRixJQUFFLEVBQUMsTUFBS0YsSUFBRSxPQUFNQyxJQUFFLE1BQUtFLEtBQUUsTUFBTSxLQUFLLEVBQUUsRUFBRSxTQUFTLE9BQU9BLEVBQUMsTUFBSSxHQUFFLE9BQU9DLEVBQUMsTUFBSSxDQUFDLENBQUMsSUFBRSxDQUFDLEVBQUMsQ0FBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNGLElBQUVGLElBQUVDLElBQUVFLElBQUVDLElBQUVFLE9BQUk7QUFBQyxVQUFFLEdBQUcsc0JBQXFCSixJQUFFLEVBQUMsU0FBUUYsSUFBRSxVQUFTQyxJQUFFLFNBQVEsQ0FB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RztBQUFDLFVBQUUsR0FBR0EsRUFBQztBQUFBLE1BQUMsR0FBRSxRQUFPLENBQUNBLElBQUVGLE9BQUksRUFBRSxHQUFHLE9BQU9FLEVBQUMsR0FBRSxPQUFPRixFQUFDLEdBQUUsRUFBRSxHQUFHLElBQUcsRUFBRSxHQUFHLE1BQU0sRUFBQztBQUFFLGVBQVMsR0FBR0UsSUFBRUYsSUFBRUMsSUFBRTtBQUFDLGVBQU8sR0FBSSxZQUFTO0FBQUMsZ0JBQU0sRUFBRSxHQUFHLE9BQU9DLEVBQUMsR0FBRSxPQUFPRixFQUFDLEdBQUUsT0FBT0MsRUFBQyxDQUFDO0FBQUEsUUFBQyxDQUFFO0FBQUEsTUFBQztBQUFDLGVBQVMsS0FBSTtBQUFDLGVBQU0sZUFBYSxPQUFPO0FBQUEsTUFBbUI7QUFBQSxNQUFDLE1BQU0sR0FBRTtBQUFBLFFBQUMsT0FBSztBQUFBLFFBQWEsWUFBWUMsSUFBRTtBQUFDLGVBQUssVUFBUSxnQ0FBZ0NBLEVBQUMsS0FBSSxLQUFLLFNBQU9BO0FBQUEsUUFBQztBQUFBLE1BQUM7QUFBQyxVQUFJLEtBQUcsQ0FBQUEsT0FBRztBQUFDLFFBQUFBLEdBQUUsVUFBVSxHQUFFQSxHQUFFLFlBQVUsTUFBSTtBQUFBLFFBQUM7QUFBQSxNQUFDLEdBQUUsS0FBRyxDQUFDLEdBQUUsS0FBRyxDQUFBQSxPQUFHO0FBQUMsYUFBRyxHQUFHLFdBQVMsR0FBRyxHQUFFLEdBQUcsR0FBRyxDQUFDLENBQUM7QUFBRyxZQUFJRixLQUFFLEdBQUcsSUFBSTtBQUFFLFlBQUcsQ0FBQ0EsR0FBRSxRQUFPO0FBQUUsV0FBRyxLQUFLQSxFQUFDLEdBQUUsR0FBR0UsR0FBRSxFQUFFLElBQUVGLElBQUVBLEdBQUUsS0FBR0UsR0FBRTtBQUFHLFlBQUlELEtBQUUsRUFBQyxJQUFHLE9BQU0sSUFBR0MsR0FBRSxJQUFHLElBQUdBLEdBQUUsSUFBRyxJQUFHQSxHQUFFLEdBQUU7QUFBRSxlQUFPRixHQUFFLFlBQVlDLElBQUVDLEdBQUUsRUFBRSxHQUFFO0FBQUEsTUFBQyxHQUFFLEtBQUcsR0FBRSxLQUFHLENB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LEtBQUdBLEtBQUU7QUFBQSxRQUFFO0FBQUEsTUFBQztBQUFDLGVBQVMsR0FBR0EsSUFBRUYsSUFBRUMsSUFBRTtBQUFDLFlBQUlFLEtBQUUsSUFBSSxHQUFHRCxRQUFLLENBQUM7QUFBRSxjQUFNRixRQUFLLEdBQUVDLFFBQUssR0FBRSxFQUFFLEVBQUVFLEdBQUUsS0FBRyxPQUFLLE1BQUksQ0FBQyxJQUFFLEdBQUUsRUFBRSxFQUFFQSxHQUFFLEtBQUcsTUFBSSxNQUFJLENBQUMsSUFBRUgsSUFBRSxFQUFFLEVBQUVHLEdBQUUsS0FBRyxNQUFJLE1BQUksQ0FBQyxJQUFFRixJQUFFQztBQUFBLE1BQUM7QUFBQyxlQUFTLEdBQUdBLElBQUVGLElBQUVDLElBQUVFLElBQUU7QUFBQyxlQUFPLElBQUUsR0FBRyxHQUFFLEdBQUVELElBQUVGLElBQUVDLElBQUVFLEVBQUMsSUFBRSxHQUFHRCxJQUFFRixJQUFFQyxJQUFFRSxFQUFDO0FBQUEsTUFBQztBQUFDLGVBQVMsR0FBR0QsSUFBRUYsSUFBRUMsSUFBRUUsSUFBRTtBQUFDLFlBQUdELFFBQUssR0FBRUQsUUFBSyxHQUFFRSxRQUFLLEdBQUUsV0FBUyxFQUFFLFFBQU87QUFBRSxZQUFJRSxLQUFFLENBQUM7QUFBRSxlQUFPLEtBQUcsTUFBSUEsR0FBRSxTQUFPLEdBQUdILElBQUVGLFFBQUssR0FBRUMsSUFBRUUsRUFBQyxLQUFHRCxLQUFFLEVBQUMsSUFBR0QsSUFBRSxJQUFHQyxJQUFFLElBQUdDLElBQUUsSUFBR0UsR0FBQyxHQUFFLEtBQUdILEdBQUUsS0FBRyxlQUFjLFlBQVlBLElBQUVHLEVBQUMsR0FBRSxLQUFHLEdBQUdILEVBQUM7QUFBQSxNQUFFO0FBQUMsVUFBSSxLQUFHLGVBQWEsT0FBTyxjQUFZLElBQUksZ0JBQVksUUFBTyxLQUFHLENBQUNBLElBQUVGLEtBQUUsR0FBRUMsS0FBRSxRQUFNO0FBQUMsWUFBSUUsTUFBR0gsUUFBSyxLQUFHQztBQUFFLGFBQUlBLEtBQUVELElBQUVFLEdBQUVELEVBQUMsS0FBRyxFQUFFQSxNQUFH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QUU7QUFBTSxrQkFBQUUsR0FBRUgsU0FBTSxDQUFDLElBQUUsTUFBSU0sTUFBRyxJQUFHSCxHQUFFSCxTQUFNLENBQUMsSUFBRSxNQUFJTSxNQUFHLEtBQUc7QUFBQSxnQkFBRTtBQUFDLGdCQUFBSCxHQUFFSCxTQUFNLENBQUMsSUFBRSxNQUFJTSxNQUFHLElBQUU7QUFBQSxjQUFFO0FBQUMsY0FBQUgsR0FBRUgsU0FBTSxDQUFDLElBQUUsTUFBSSxLQUFHTTtBQUFBLFlBQUM7QUFBQSxVQUFDO0FBQUMsVUFBQUgsR0FBRUgsT0FBSSxDQUFDLElBQUUsR0FBRUUsS0FBRUYsS0FBRUs7QUFBQSxRQUFDLE1BQU0sQ0FBQUgsS0FBRTtBQUFFLGVBQU9BO0FBQUEsTUFBQztBQUFFLGVBQVMsR0FBR0EsSUFBRUYsSUFBRTtBQUFDLFlBQUcsRUFBRSxRQUFPLEdBQUcsR0FBRSxHQUFFRSxJQUFFRixFQUFDO0FBQUEsTUFBQztBQUFDLGVBQVMsR0FBR0UsSUFBRUYsSUFBRUMsSUFBRTtBQUFDLFlBQUcsRUFBRSxRQUFPLEdBQUcsR0FBRSxHQUFFQyxJQUFFRixJQUFFQyxFQUFDO0FBQUEsTUFBQztBQUFDLGVBQVMsR0FBR0MsSUFBRUYsSUFBRUMsSUFBRTtBQUFDLGVBQU8sSUFBRSxHQUFHLEdBQUUsR0FBRUMsSUFBRUYsSUFBRUMsRUFBQyxJQUFFO0FBQUEsTUFBQztBQUFDLGVBQVMsR0FBR0MsSUFBRUYsSUFBRTtBQUFDLFlBQUcsRUFBRSxRQUFPLEdBQUcsR0FBRSxHQUFFRSxJQUFFRixFQUFDO0FBQUEsTUFBQztBQUFDLGVBQVMsR0FBR0UsSUFBRUYsSUFBRUMsSUFBRTtBQUFDLFlBQUcsRUFBRSxRQUFPLEdBQUcsR0FBRSxHQUFFQyxJQUFFRixJQUFFQyxFQUFDO0FBQUEsTUFBQztBQUFDLGVBQVMsR0FBR0MsSUFBRUYsSUFBRUMsSUFBRUUsSUFBRTtBQUFDLFlBQUcsRUFBRSxRQUFPLEdBQUcsSUFBRyxHQUFFRCxJQUFFRixJQUFFQyxJQUFFRSxFQUFDO0FBQUEsTUFBQztBQUFDLGVBQVMsR0FBR0Qs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LEdBQUdBLElBQUVGLElBQUVDLElBQUVFLElBQUVFLElBQUU7QUFBQyxhQUFJTCxRQUFLLEdBQUVHLE1BQUcsR0FBRSxHQUFHLFNBQU9BLElBQUVGLEtBQUVJLE9BQUksTUFBSSxHQUFFQSxLQUFFLEdBQUVBLEtBQUVGLElBQUVFLEtBQUksSUFBR0EsRUFBQyxJQUFFLEVBQUVKLEtBQUUsSUFBRUksRUFBQyxJQUFFLEVBQUVKLEtBQUUsSUFBRUksS0FBRSxDQUFDLElBQUUsRUFBRSxFQUFFSixLQUFFLElBQUVJLEtBQUUsTUFBSSxDQUFDO0FBQUUsZ0JBQU9MLEtBQUUsR0FBR0EsRUFBQyxJQUFFLEdBQUdFLEVBQUMsR0FBRyxHQUFHLEVBQUU7QUFBQSxNQUFDO0FBQUMsVUFBSSxLQUFHLE1BQUk7QUFBQyxhQUFHO0FBQUEsTUFBQztBQUFFLGVBQVMsR0FBR0EsSUFBRTtBQUFDLFFBQUFBLFFBQUssR0FBRSxJQUFFLFlBQVksRUFBQyxJQUFHLGlCQUFnQixJQUFHQSxHQUFDLENBQUMsSUFBRSxHQUFHLEdBQUdBLEVBQUMsQ0FBQztBQUFBLE1BQUM7QUFBQyxlQUFTLEdBQUdBLElBQUU7QUFBQSxNQUFDO0FBQUMsVUFBSSxLQUFHLENBQUNBLElBQUVGLE9BQUk7QUFBQyxZQUFJQyxLQUFFLEdBQUdDLEVBQUM7QUFBRSxZQUFHLFdBQVNELEdBQUUsT0FBTUMsS0FBRSxHQUFHQSxFQUFDLEdBQUVELEtBQUUsR0FBR0MsRUFBQyxHQUFFLEdBQUdBLEVBQUMsR0FBRSxJQUFJLEdBQUcsR0FBR0YsRUFBQyxxQkFBcUJDLEVBQUMsRUFBRTtBQUFFLGVBQU9BO0FBQUEsTUFBQyxHQUFFLEtBQUcsQ0FBQ0MsSUFBRUYsSUFBRUMsT0FBSTtBQUFDLFlBQUlFLEtBQUUsQ0FBQztBQUFFLGVBQU9ELEtBQUVBLEdBQUUsV0FBV0MsSUFBRUYsRUFBQyxHQUFFRSxHQUFFLFdBQVMsRUFBRSxFQUFFSCxPQUFJLE1BQUksQ0FBQyxJQUFFLEdBQUdHLEVBQUMsSUFBR0Q7QUFBQSxNQUFDO0FBQUUsZUFBUyxHQUFHQSxJQUFF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QUUsRUFBRSxFQUFFRixLQUFFLE1BQUksTUFBSSxDQUFDLElBQUVFLEdBQUUsY0FBYyxHQUFFLEVBQUUsRUFBRUYsS0FBRSxNQUFJLE1BQUksQ0FBQyxJQUFFRSxHQUFFLFlBQVksR0FBRSxFQUFFLEVBQUVGLEtBQUUsT0FBSyxNQUFJLENBQUMsSUFBRUUsR0FBRSxXQUFXLEdBQUUsRUFBRSxFQUFFRixLQUFFLE9BQUssTUFBSSxDQUFDLElBQUVFLEdBQUUsWUFBWSxHQUFFLEVBQUUsRUFBRUYsS0FBRSxPQUFLLE1BQUksQ0FBQyxJQUFFRSxHQUFFLGVBQWUsSUFBRSxNQUFLLEVBQUUsRUFBRUYsS0FBRSxPQUFLLE1BQUksQ0FBQyxJQUFFRSxHQUFFLFVBQVUsR0FBRUEsTUFBR0EsR0FBRSxRQUFRLElBQUUsS0FBSyxJQUFJQSxHQUFFLGVBQWUsR0FBRSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsQ0FBQyxLQUFHLFFBQU0sR0FBRSxFQUFFLEVBQUVGLEtBQUUsT0FBSyxNQUFJLENBQUMsSUFBRUU7QUFBQSxNQUFDO0FBQUMsVUFBSSxLQUFHLENBQUFBLE9BQUcsS0FBR0EsS0FBRSxNQUFJLEtBQUdBLEtBQUUsT0FBSyxLQUFHQSxLQUFFLE1BQUssS0FBRyxDQUFDLEdBQUUsSUFBRyxJQUFHLElBQUcsS0FBSSxLQUFJLEtBQUksS0FBSSxLQUFJLEtBQUksS0FBSSxHQUFHLEdBQUUsS0FBRyxDQUFDLEdBQUUsSUFBRyxJQUFHLElBQUcsS0FBSSxLQUFJLEtBQUksS0FBSSxLQUFJLEtBQUksS0FBSSxHQUFHO0FBQUUsZUFBUyxHQUFHQSxJQUFFRixJQUFFO0FBQUMsUUFBQUUsS0FBRSxvQkFBa0JBLE1BQUcsbUJBQWlCQSxLQUFFLE1BQUksT0FBT0EsRUFBQyxHQUFFRixRQUFLLEdBQUVFLEtBQUUsSUFBSSxLQUFLLE1BQUlBLEVBQUMsR0FBRSxFQUFFLEVBQUVGLE9BQUksTUFBSSxDQUFDLElBQUVFLEdBQUUsV0FBVyxHQUFFLEVBQUUsRUFBRUYsS0FBRSxNQUFJLE1BQUksQ0FBQyxJQUFFRSxHQUFFLFdBQVcsR0FBRSxFQUFFLEVBQUVGLEtBQUUsTUFBSSxNQUFJLENBQUMsSUFBRUUsR0FBRSxTQUFTLEdBQUUsRUFBRSxFQUFFRixLQUFFLE9BQUssTUFBSSxDQUFDLElBQUVFLEdBQUUsUUFBUSxHQUFFLEVBQUUsRUFBRUYsS0FBRSxPQUFLLE1BQUksQ0FBQyxJQUFFRSxHQUFFLFNBQVMsR0FBRSxFQUFFLEVBQUVGLEtBQUUsT0FBSyxNQUFJLENBQUMsSUFBRUUsR0FBRSxZQUFZLElBQUUsTUFBSyxFQUFFLEVBQUVGLEtBQUUsT0FBSyxNQUFJLENBQUMsSUFBRUUsR0FBRSxPQUFPO0FBQUUsWUFBSUQsTUFBRyxHQUFHQyxHQUFFLFlBQVksQ0FBQyxJQUFFLEtBQUcsSUFBSUEsR0FBRSxTQUFTLENBQUMsSUFBRUEsR0FBRSxRQUFRLElBQUUsSUFBRTtBQUFFLFVBQUUsRUFBRUYsS0FBRSxPQUFLLE1BQUksQ0FBQyxJQUFFQyxJQUFFLEVBQUUsRUFBRUQsS0FBRSxPQUFLLE1BQUksQ0FBQyxJQUFFLE1BQUlFLEdBQUUsa0JBQWtCLEdBQUVELEtBQUUsSUFBSSxLQUFLQyxHQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFBRSxrQkFBa0I7QUFBRSxZQUFJQyxLQUFFLElBQUksS0FBS0QsR0FBRSxZQUFZLEdBQUUsR0FBRSxDQUFDLEVBQUUsa0JBQWtCO0FBQUUsUUFBQUEsS0FBRSxLQUFHRCxNQUFHRSxNQUFHRCxHQUFFLGtCQUFrQixLQUFHLEtBQUssSUFBSUMsSUFBRUYsRUFBQyxJQUFHLEVBQUUsRUFBRUQsS0FBRSxPQUFLLE1BQUksQ0FBQyxJQUFFRTtBQUFBLE1BQUM7QUFBQyxlQUFTLEdBQUdBLElBQUU7QUFBQyxRQUFBQSxRQUFLO0FBQUUsWUFBSUYsS0FBRSxJQUFJLEtBQUssRUFBRSxFQUFFRSxLQUFFLE9BQUssTUFBSSxDQUFDLElBQUUsTUFBSyxFQUFFLEVBQUVBLEtBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxFQUFFLEVBQUVBLEtBQUUsT0FBSyxNQUFJLENBQUMsR0FBRSxFQUFFLEVBQUVB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S0YsR0FBRSxDQUFBQyxHQUFFLEtBQUssR0FBR0MsRUFBQyxJQUFJRixHQUFFRSxFQUFDLENBQUMsRUFBRTtBQUFFLGVBQUdEO0FBQUEsUUFBQztBQUFDLGVBQU87QUFBQSxNQUFFO0FBQUUsZUFBUyxHQUFHQyxJQUFFRixJQUFFO0FBQUMsWUFBRyxFQUFFLFFBQU8sR0FBRyxJQUFHLEdBQUVFLElBQUVGLEVBQUM7QUFBRSxRQUFBRSxRQUFLLEdBQUVGLFFBQUs7QUFBRSxZQUFJQyxLQUFFO0FBQUUsZUFBTyxHQUFHLEVBQUUsUUFBUyxDQUFDRSxJQUFFRSxPQUFJO0FBQUMsY0FBSUQsS0FBRUosS0FBRUM7QUFBRSxlQUFJSSxLQUFFLEVBQUUsRUFBRUgsS0FBRSxJQUFFRyxPQUFJLE1BQUksQ0FBQyxJQUFFRCxJQUFFQSxLQUFFLEdBQUVBLEtBQUVELEdBQUUsUUFBTyxFQUFFQyxHQUFFLEdBQUUsRUFBRUMsU0FBTSxDQUFDLElBQUVGLEdBQUUsV0FBV0MsRUFBQztBQUFFLFlBQUUsRUFBRUMsT0FBSSxDQUFDLElBQUUsR0FBRUosTUFBR0UsR0FBRSxTQUFPO0FBQUEsUUFBQyxDQUFFLEdBQUU7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHRCxJQUFFRixJQUFFO0FBQUMsWUFBRyxFQUFFLFFBQU8sR0FBRyxJQUFHLEdBQUVFLElBQUVGLEVBQUM7QUFBRSxRQUFBRSxRQUFLLEdBQUVGLFFBQUs7QUFBRSxZQUFJQyxLQUFFLEdBQUc7QUFBRSxVQUFFLEVBQUVDLE9BQUksTUFBSSxDQUFDLElBQUVELEdBQUU7QUFBTyxZQUFJRSxLQUFFO0FBQUUsZUFBT0YsR0FBRSxRQUFTLENBQUFDLE9BQUdDLE1BQUdELEdBQUUsU0FBTyxDQUFFLEdBQUUsRUFBRSxFQUFFRixPQUFJLE1BQUksQ0FBQyxJQUFFRyxJQUFFO0FBQUEsTUFBQztBQUFDLGVBQVMsR0FBR0QsSUFBRTtBQUFDLGVBQU8sSUFBRSxHQUFHLElBQUcsR0FBRUEsRUFBQyxJQUFFO0FBQUEsTUFBRTtBQUFDLGVBQVMsR0FBR0EsSUFBRUYsSUFBRUMs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QSxRQUFJLEtBQUcsRUFBRSxRQUFNLEdBQUcsSUFBSUEsRUFBQyxHQUFFLEtBQUcsRUFBRSxVQUFRLENBQUFBLFFBQUksS0FBRyxFQUFFLFVBQVEsR0FBRyxJQUFJQSxFQUFDLEdBQUUsS0FBRyxDQUFDQSxJQUFFRixJQUFFQyxJQUFFRSxJQUFFRSxJQUFFRCxRQUFLLEtBQUcsR0FBRyxJQUFJRixJQUFFRixJQUFFQyxJQUFFRSxJQUFFRSxJQUFFRCxFQUFDLEdBQUUsS0FBRyxPQUFLLEtBQUcsR0FBRyxJQUFJLEdBQUUsS0FBRyxDQUFDRixJQUFFRixJQUFFQyxJQUFFRSxJQUFFRSxRQUFLLEtBQUcsR0FBRyxJQUFJSCxJQUFFRixJQUFFQyxJQUFFRSxJQUFFRSxFQUFDLEdBQUUsS0FBRyxDQUFBSCxRQUFJLEtBQUcsR0FBRyxJQUFJQSxFQUFDLEdBQUUsS0FBRyxDQUFBQSxRQUFJLEtBQUcsR0FBRyxJQUFJQSxFQUFDLEdBQUUsS0FBRyxDQUFDQSxJQUFFRixRQUFLLEtBQUcsR0FBRyxJQUFJRSxJQUFFRixFQUFDLEdBQUUsS0FBRyxPQUFLLEtBQUcsR0FBRyxJQUFJLEdBQUUsS0FBRyxDQUFDRSxJQUFFRixRQUFLLEtBQUcsR0FBRyxJQUFJRSxJQUFFRixFQUFDLEdBQUUsS0FBRyxDQUFBRSxRQUFJLEtBQUcsR0FBRyxJQUFJQSxFQUFDLEdBQUUsS0FBRyxDQUFBQSxRQUFJLEtBQUcsR0FBRyxJQUFJQSxFQUFDLEdBQUUsS0FBRyxPQUFLLEtBQUcsR0FBRyxJQUFJLEdBQUUsS0FBRyxFQUFFLGFBQVcsQ0FBQ0EsSUFBRUYsUUFBSyxLQUFHLEVBQUUsYUFBVyxHQUFHLElBQUlFLElBQUVGLEVBQUMsR0FBRSxLQUFHLENBQUFFLFFBQUksS0FBRyxHQUFHLElBQUlBLEVBQUMsR0FBRSxLQUFHLE9BQUssS0FBRyxHQUFHLElBQUksR0FBRSxLQUFHLENBQUFBLFFBQUksS0FBRyxHQUFHLElBQUlBLEVBQUMsR0FBRSxLQUFHLE9BQUssS0FBRyxHQUFHLElBQUk7QUFBRSxhQUFPLEVBQUUsWUFBVSxNQUFJ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QWNBLEVBQUMsR0FBRSxFQUFFLFVBQVEsSUFBSSxlQUFlQSxFQUFDO0FBQUEsTUFBQztBQUFDLGVBQVMsSUFBRztBQUFDLFlBQUUsWUFBWSxDQUFDLElBQUUsR0FBRyxFQUFFO0FBQUEsTUFBQztBQUFDLFlBQUksSUFBRSxJQUFJLFlBQVksT0FBTyxFQUFDLFNBQVEsS0FBSSxTQUFRLE9BQU0sUUFBTyxLQUFFLENBQUMsR0FBRSxFQUFFO0FBQUcsVUFBSSxHQUFFLElBQUUsR0FBRSxJQUFFO0FBQUssZUFBUyxJQUFHO0FBQUMsWUFBRyxLQUFHLEVBQUUsS0FBRyxHQUFFO0FBQUMsY0FBSUEsS0FBRTtBQUFFLGNBQUUsTUFBS0EsR0FBRTtBQUFBLFFBQUM7QUFBQSxNQUFDO0FBQUMsZUFBUyxFQUFFQSxJQUFFO0FBQUMsY0FBTSxFQUFFQSxLQUFFLGFBQVdBLEtBQUUsR0FBRyxHQUFFLElBQUUsTUFBR0EsS0FBRSxJQUFJLFlBQVksYUFBYUEsS0FBRSwwQ0FBMEMsR0FBRSxFQUFFQSxFQUFDLEdBQUVBO0FBQUEsTUFBQztBQUFDLGVBQVMsSUFBRztBQUFDLGVBQU0sRUFBQyxHQUFFLEVBQUMsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFHLEdBQUUsSUFBRyxHQUFFLElBQUcsR0FBRSxJQUFH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LEdBQUcsR0FBRSxHQUFFQSxFQUFDO0FBQUUsWUFBRyxJQUFFQSxJQUFFLEVBQUUsSUFBRSxLQUFJO0FBQUMsbUJBQVFDLE1BQUssR0FBRyxHQUFFQSxFQUFDO0FBQUUsZUFBSUEsTUFBSyxHQUFHLEdBQUVBLEVBQUM7QUFBRSxlQUFHLENBQUMsR0FBRSxLQUFHLENBQUMsR0FBRSxLQUFHLENBQUMsR0FBRSxJQUFFO0FBQUEsUUFBRTtBQUFDLFVBQUUsR0FBRSxJQUFJLEVBQUVELEVBQUMsQ0FBQztBQUFBLE1BQUM7QUFBQyxlQUFTLEdBQUdBLElBQUU7QUFBQyxZQUFHLEVBQUUsUUFBTyxHQUFHLEdBQUUsR0FBRUEsRUFBQztBQUFFLFdBQUdBLEVBQUM7QUFBQSxNQUFDO0FBQUMsVUFBSSxLQUFHLENBQUFBLE9BQUc7QUFBQyxZQUFHLElBQUVBLElBQUUsRUFBRSxPQUFNLEdBQUdBLEVBQUMsR0FBRTtBQUFTLFdBQUdBLEVBQUM7QUFBQSxNQUFDLEdBQUUsS0FBRyxDQUFDLEdBQUUsS0FBRyxDQUFDLEdBQUUsS0FBRyxDQUFDLEdBQUUsS0FBRyxDQUFDLEdBQUUsS0FBRyxDQUFBQSxPQUFHO0FBQUMsWUFBSUMsS0FBRUQsR0FBRTtBQUFHLGVBQU8sR0FBR0MsRUFBQyxHQUFFLEdBQUcsS0FBS0QsRUFBQyxHQUFFLEdBQUcsT0FBTyxHQUFHLFFBQVFBLEVBQUMsR0FBRSxDQUFDLEdBQUVBLEdBQUUsS0FBRyxHQUFFLEdBQUdDLEVBQUM7QUFBQSxNQUFDO0FBQUUsZUFBUyxLQUFJO0FBQUMsV0FBRyxRQUFTLENBQUFELE9BQUdBLEdBQUUsQ0FBRTtBQUFBLE1BQUM7QUFBQyxVQUFJLEtBQUcsQ0FBQUEsT0FBRyxJQUFJLFFBQVMsQ0FBQUMsT0FBRztBQUFDLFFBQUFELEdBQUUsWUFBVSxDQUFBRSxPQUFHO0FBQUMsY0FBSUMsTUFBR0QsS0FBRUEsR0FBRSxNQUFNO0FBQUcsY0FBR0EsR0FBRSxNQUFJQSxHQUFFLE1BQUksR0FBRyxHQUFFO0FBQUMsZ0JBQUlHLEtBQUUsR0FBR0gsR0FBRSxFQUFFO0FBQUUsWUFBQUcsS0FBRUEsR0FBRSxZQUFZSCxJQUFFQSxHQUFFLEVBQUUsSUFBRSxFQUFFLDBDQUEwQ0MsRUFBQyx1QkFBdUJELEdBQUUsRUFBRSxxQ0FBcUM7QUFBQSxVQUFDLE1BQUssb0JBQWlCQyxLQUFFLEdBQUcsSUFBRSxrQkFBZ0JBLEtBQUUsR0FBR0QsRUFBQyxJQUFFLG9CQUFrQkMsS0FBRSxHQUFHLEdBQUdELEdBQUUsRUFBRSxDQUFDLElBQUUsYUFBV0MsTUFBR0gsR0FBRSxTQUFPLE1BQUdDLEdBQUVELEVBQUMsS0FBRyxZQUFVRyxLQUFFLE1BQU0sVUFBVUQsR0FBRSxFQUFFLEtBQUtBLEdBQUUsSUFBSSxFQUFFLElBQUUsbUJBQWlCQSxHQUFFLFNBQU9GLEdBQUUsWUFBWUUsRUFBQyxJQUFFLGtCQUFnQkMsS0FBRSxFQUFFRCxHQUFFLEVBQUUsRUFBRSxHQUFHQSxHQUFFLElBQUksSUFBRUMsTUFBRyxFQUFFLGtDQUFrQ0EsRUFBQyxFQUFFO0FBQUEsUUFBQyxHQUFFSCxHQUFFLFVBQVEsQ0FBQUEsT0FBRztBQUFDLGdCQUFNLEVBQUUseUJBQXlCQSxHQUFFLFFBQVEsSUFBSUEsR0FBRSxNQUFNLEtBQUtBLEdBQUUsT0FBTyxFQUFFLEdBQUVBO0FBQUEsUUFBQztBQUFFLFlBQUlFLElBQUVDLEtBQUUsQ0FBQztBQUFFLGFBQUlELE1BQUksQ0FBQyxFQUFFLEdBQUUscUJBQXFCQSxFQUFDLEtBQUdDLEdBQUUsS0FBS0QsRUFBQztBQUFFLFFBQUFGLEdBQUUsWUFBWSxFQUFDLElBQUcsUUFBTyxJQUFHRyxJQUFFLElBQUcsR0FBRSxJQUFHLEVBQUMsQ0FBQztBQUFBLE1BQUMsQ0FBRTtBQUFFLGVBQVMsS0FBSTtBQUFDLFlBQUlILEtBQUUsSUFBSSxRQUFRLE1BQUk7QUFBQyxnQkFBTUEsS0FBRTtBQUFJLGlCQUFPLFlBQVksTUFBSSxXQUFTLFlBQVksTUFBSSxVQUFRLElBQUlBLEdBQUUsdUJBQTJCLFlBQVksR0FBRyxJQUFFLElBQUksSUFBSSxZQUFZLEdBQUc7QUFBQSxRQUFDLEdBQUcsR0FBRSxFQUFDLE1BQUssVUFBUyxZQUFXLGNBQWEsTUFBSyxhQUFZLENBQUM7QUFBRSxXQUFHLEtBQUtBLEVBQUM7QUFBQSxNQUFDO0FBQUMsVUFBSSxJQUFHLEtBQUcsQ0FBQUEsT0FBRztBQUFDLFVBQUU7QUFBRSxZQUFJQyxLQUFFLEVBQUUsRUFBRUQsS0FBRSxPQUFLLE1BQUksQ0FBQztBQUFFLFFBQUFBLEtBQUUsRUFBRSxFQUFFQSxLQUFFLE9BQUssTUFBSSxDQUFDLEdBQUUsR0FBR0MsSUFBRUEsS0FBRUQsRUFBQyxHQUFFLEdBQUdDLEVBQUM7QUFBQSxNQUFDLEdBQUUsS0FBRyxDQUFDLEdBQUUsS0FBRyxDQUFDRCxJQUFFQyxPQUFJO0FBQUMsYUFBRztBQUFFLFlBQUlDLEtBQUUsR0FBR0YsRUFBQztBQUFFLFFBQUFFLE9BQUlGLE1BQUcsR0FBRyxXQUFTLEdBQUcsU0FBT0EsS0FBRSxJQUFHLEdBQUdBLEVBQUMsSUFBRUUsS0FBRSxHQUFHLElBQUlGLEVBQUMsSUFBR0EsS0FBRUUsR0FBRUQsRUFBQyxHQUFFLElBQUUsS0FBRyxJQUFFRCxLQUFFLEdBQUdBLEVBQUM7QUFBQSxNQUFDO0FBQUEsTUFBRSxNQUFNLEdBQUU7QUFBQSxRQUFDLFlBQVlBLElBQUU7QUFBQyxlQUFLLEtBQUdBLEtBQUU7QUFBQSxRQUFFO0FBQUEsTUFBQztBQUFDLGVBQVMsR0FBR0EsSUFBRUMsSUFBRUMsSUFBRTtBQUFDLFlBQUlDLEtBQUUsSUFBSSxHQUFHSCxRQUFLLENBQUM7QUFBRSxjQUFNQyxRQUFLLEdBQUVDLFFBQUssR0FBRSxFQUFFLEVBQUVDLEdBQUUsS0FBRyxPQUFLLE1BQUksQ0FBQyxJQUFFLEdBQUUsRUFBRSxFQUFFQSxHQUFFLEtBQUcsTUFBSSxNQUFJLENBQUMsSUFBRUYsSUFBRSxFQUFFLEVBQUVFLEdBQUUsS0FBRyxNQUFJLE1BQUksQ0FBQyxJQUFFRCxJQUFFRjtBQUFBLE1BQUM7QUFBQyxlQUFTLEdBQUdBLElBQUVDLElBQUVDLElBQUVDLElBQUU7QUFBQyxlQUFPLElBQUUsR0FB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QUU7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHRixJQUFFQyxJQUFFO0FBQUMsWUFBRyxFQUFFLFFBQU8sR0FBRyxHQUFFLEdBQUVELElBQUVDLEVBQUM7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHRCxJQUFFQyxJQUFFQyxJQUFFO0FBQUMsWUFBRyxFQUFFLFFBQU8sR0FBRyxHQUFFLEdBQUVGLElBQUVDLElBQUVDLEVBQUM7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHRixJQUFFQyxJQUFFQyxJQUFFQyxJQUFFO0FBQUMsWUFBRyxFQUFFLFFBQU8sR0FBRyxJQUFHLEdBQUVILElBQUVDLElBQUVDLElBQUVDLEVBQUM7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHSCxJQUFFQyxJQUFFQyxJQUFFQyxJQUFFO0FBQUMsWUFBRyxFQUFFLFFBQU8sR0FBRyxJQUFHLEdBQUVILElBQUVDLElBQUVDLElBQUVDLEVBQUM7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHSCxJQUFFQyxJQUFFQyxJQUFFQyxJQUFFO0FBQUMsWUFBRyxFQUFFLFFBQU8sR0FBRyxJQUFHLEdBQUVILElBQUVDLElBQUVDLElBQUVDLEVBQUM7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHSCxJQUFFO0FBQUMsWUFBRyxFQUFFLFFBQU8sR0FBRyxJQUFHLEdBQUVBLEVBQUM7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHQSxJQUFFQyxJQUFFO0FBQUMsWUFBRyxFQUFFLFFBQU8sR0FBRyxJQUFHLEdBQUVELElBQUVDLEVBQUM7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHRCxJQUFFQyxJQUFFQyxJQUFFO0FBQUMsWUFBRyxFQUFFLFFBQU8sR0FBRyxJQUFHLEdBQUVGLElBQUVDLElBQUVDLEVBQUM7QUFBQSxNQUFDO0FBQUMsVUFBSSxLQUFHLE1BQUksRUFBRSxFQUFFO0FBQUUsZUFBUyxHQUFHRixJQUFFO0FBQUMsV0FBR0EsT0FBSSxHQUFFLENBQUMsR0FBRSxHQUFFLENBQUMsR0FBRSxRQUFPLEtBQUUsR0FBRSxHQUFHO0FBQUEsTUFBQztBQUFDLFVBQUksS0FBRyxDQUFBQSxPQUFHO0FBQUMsWUFBRyxDQUFDLEVBQUUsS0FBRztBQUFDLGNBQUdBLEdBQUUsR0FBRSxFQUFFLElBQUUsSUFBSSxLQUFHO0FBQUMsZ0JBQUUsR0FBRyxDQUFDLElBQUUsR0FBRyxDQUFDO0FBQUEsVUFBQyxTQUFPQSxJQUFFO0FBQUMsWUFBQUEsY0FBYSxLQUFHLFlBQVVBLE1BQUcsRUFBRSxHQUFFQSxFQUFDO0FBQUEsVUFBQztBQUFBLFFBQUMsU0FBT0EsSUFBRTtBQUFDLFVBQUFBLGNBQWEsS0FBRyxZQUFVQSxNQUFHLEVBQUUsR0FBRUEsRUFBQztBQUFBLFFBQUM7QUFBQSxNQUFDO0FBQUUsZUFBUyxHQUFHQSxJQUFFO0FBQUMsUUFBQUEsUUFBSyxHQUFFLGNBQVksT0FBTyxRQUFRLE9BQUssUUFBUSxHQUFHLEVBQUUsR0FBRUEsT0FBSSxHQUFFQSxFQUFDLEVBQUUsTUFBTSxLQUFLLEVBQUUsR0FBRUEsTUFBRyxLQUFJLFFBQVEsTUFBTSxFQUFFLEdBQUVBLE9BQUksR0FBRSxDQUFDO0FBQUEsTUFBRTtBQUFDLFVBQUksS0FBRyxNQUFJO0FBQUMsWUFBSUEsS0FBRSxHQUFHO0FBQUUsUUFBQUEsT0FBSSxHQUFHQSxFQUFDLEdBQUUsR0FBRyxFQUFFO0FBQUEsTUFBRTtBQUFFLGVBQVMsR0FBR0EsSUFBRUMsSUFBRTtBQUFDLFNBQUNELFFBQUssTUFBSUMsT0FBSSxJQUFFLFdBQVcsRUFBRSxJQUFFLElBQUUsWUFBWSxFQUFDLElBQUdELElBQUUsSUFBRyxlQUFjLENBQUMsS0FBR0EsS0FBRSxHQUFHQSxFQUFDLE1BQUlBLEdBQUUsWUFBWSxFQUFDLElBQUcsZUFBYyxDQUFDO0FBQUEsTUFBQztBQUFDLFVBQUksS0FBRyxDQUFDO0FBQUUsZUFBUyxHQUFHQSxJQUFFQyxJQUFFQyxJQUFFQyxJQUFFSSxJQUFFO0FBQUMsYUFBSU4sUUFBSyxHQUFFRSxNQUFHLEdBQUUsR0FBRyxTQUFPQSxJQUFFRCxLQUFFSyxPQUFJLE1BQUksR0FBRUEsS0FBRSxHQUFFQSxLQUFFSixJQUFFSSxLQUFJLElBQUdBLEVBQUMsSUFBRSxFQUFFTCxLQUFFLElBQUVLLEVBQUMsSUFBRSxFQUFFTCxLQUFFLElBQUVLLEtBQUUsQ0FBQyxJQUFFLEVBQUUsRUFBRUwsS0FBRSxJQUFFSyxLQUFFLE1BQUksQ0FBQztBQUFFLGdCQUFPTixLQUFFLEVBQUVBLEVBQUMsSUFBRSxHQUFHRCxFQUFDLEdBQUcsR0FBRyxFQUFFO0FBQUEsTUFBQztBQUFDLFVBQUksS0FBRyxNQUFJO0FBQUMsYUFBRztBQUFBLE1BQUM7QUFBRSxlQUFTLEdBQUdBLElBQUU7QUFBQyxRQUFBQSxRQUFLLEdBQUUsSUFBRSxZQUFZLEVBQUMsSUFBRyxpQkFBZ0IsSUFBR0EsR0FBQyxDQUFDLElBQUUsR0FBRyxHQUFHQSxFQUFDLENBQUM7QUFBQSxNQUFDO0FBQUMsZUFBUyxHQUFHQSxJQUFFO0FBQUEsTUFBQztBQUFDLGVBQVMsR0FBR0EsSUFBRUMsSUFBRTtBQUFDLFFBQUFELEtBQUUsb0JBQWtCQSxNQUFHLG1CQUFpQkEsS0FBRSxNQUFJLE9BQU9BLEVBQUMsR0FBRUMsUUFBSyxHQUFFRCxLQUFFLElBQUksS0FBSyxNQUFJQSxFQUFDLEdBQUUsRUFBRSxFQUFFQyxPQUFJLE1BQUksQ0FBQyxJQUFFRCxHQUFFLGNBQWMsR0FBRSxFQUFFLEVBQUVDLEtBQUUsTUFBSSxNQUFJLENBQUMsSUFBRUQsR0FBRSxjQUFjLEdBQUUsRUFBRSxFQUFFQyxLQUFFLE1BQUksTUFBSSxDQUFDLElBQUVELEdBQUUsWUFBWSxHQUFFLEVBQUUsRUFBRUMsS0FBRSxPQUFLLE1BQUksQ0FBQyxJQUFFRCxHQUFFLFdBQVcsR0FBRSxFQUFFLEVBQUVDLEtBQUUsT0FBSyxNQUFJLENBQUMsSUFBRUQsR0FBRSxZQUFZLEdBQUUsRUFBRSxFQUFFQyxLQUFFLE9BQUssTUFBSSxDQUFDLElBQUVELEdBQUUsZUFBZSxJQUFFLE1BQUssRUFBRSxFQUFFQyxLQUFFLE9BQUssTUFBSSxDQUFDLElBQUVELEdBQUUsVUFBVSxHQUFFQSxNQUFHQSxHQUFFLFFBQVEsSUFBRSxLQUFLLElBQUlBLEdBQUUsZUFBZSxHQUFFLEdBQUUsR0FBRSxHQUFFLEdBQUUsR0FBRSxDQUFDLEtBQUcsUUFBTSxHQUFFLEVBQUUsRUFBRUMsS0FBRSxPQUFLLE1BQUksQ0FBQyxJQUFFRDtBQUFBLE1BQUM7QUFBQyxVQUFJLEtBQUcsQ0FBQUEsT0FBRyxLQUFHQSxLQUFFLE1BQUksS0FBR0EsS0FBRSxPQUFLLEtBQUdBLEtBQUUsTUFBSyxLQUFHLENBQUMsR0FBRSxJQUFHLElBQUcsSUFBRyxLQUFJLEtBQUksS0FBSSxLQUFJLEtBQUksS0FBSSxLQUFJLEdBQUcsR0FBRSxLQUFHLENBQUMsR0FBRSxJQUFHLElBQUcsSUFBRyxLQUFJLEtBQUksS0FBSSxLQUFJLEtBQUksS0FBSSxLQUFJLEdBQUc7QUFBRSxlQUFTLEdBQUdBLElBQUVDLElBQUU7QUFBQyxRQUFBRCxLQUFFLG9CQUFrQkEsTUFBRyxtQkFBaUJBLEtBQUUsTUFBSSxPQUFPQSxFQUFDLEdBQUVDLFFBQUssR0FBRUQsS0FBRSxJQUFJLEtBQUssTUFBSUEsRUFBQyxHQUFFLEVBQUUsRUFBRUMsT0FBSSxNQUFJLENBQUMsSUFBRUQsR0FBRSxXQUFXLEdBQUUsRUFBRSxFQUFFQyxLQUFFLE1BQUksTUFBSSxDQUFDLElBQUVELEdBQUUsV0FBVyxHQUFFLEVBQUUsRUFBRUMsS0FBRSxNQUFJLE1BQUksQ0FBQyxJQUFFRCxHQUFFLFNBQVMsR0FBRSxFQUFFLEVBQUVDLEtBQUUsT0FBSyxNQUFJLENBQUMsSUFBRUQsR0FBRSxRQUFRLEdBQUUsRUFBRSxFQUFFQyxLQUFFLE9BQUssTUFBSSxDQUFDLElBQUVELEdBQUUsU0FBUyxHQUFFLEVBQUUsRUFBRUMsS0FBRSxPQUFLLE1BQUksQ0FBQyxJQUFFRCxHQUFFLFlBQVksSUFBRSxNQUFLLEVBQUUsRUFBRUMsS0FBRSxPQUFLLE1BQUksQ0FBQyxJQUFFRCxHQUFFLE9BQU87QUFBRSxZQUFJRSxNQUFHLEdBQUdGLEdBQUUsWUFBWSxDQUFDLElBQUUsS0FBRyxJQUFJQSxHQUFFLFNBQVMsQ0FBQyxJQUFFQSxHQUFFLFFBQVEsSUFBRSxJQUFFO0FBQUUsVUFBRSxFQUFFQyxLQUFFLE9BQUssTUFBSSxDQUFDLElBQUVDLElBQUUsRUFBRSxFQUFFRCxLQUFFLE9BQUssTUFBSSxDQUFDLElBQUUsTUFBSUQsR0FBRSxrQkFBa0IsR0FBRUUsS0FBRSxJQUFJLEtBQUtGLEdBQUUsWUFBWSxHQUFFLEdBQUUsQ0FBQyxFQUFFLGtCQUFrQjtBQUFFLFlBQUlHLEtBQUUsSUFBSSxLQUFLSCxHQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFBRSxrQkFBa0I7QUFBRSxRQUFBQSxLQUFFLEtBQUdFLE1BQUdDLE1BQUdILEdBQUUsa0JBQWtCLEtBQUcsS0FBSyxJQUFJRyxJQUFFRCxFQUFDLElBQUcsRUFBRSxFQUFFRCxLQUFFLE9BQUssTUFBSSxDQUFDLElBQUVEO0FBQUEsTUFBQztBQUFDLGVBQVMsR0FBR0EsSUFBRTtBQUFDLFFBQUFBLFFBQUs7QUFBRSxZQUFJQyxLQUFFLElBQUksS0FBSyxFQUFFLEVBQUVELEtBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxNQUFLLEVBQUUsRUFBRUEsS0FBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLEVBQUUsRUFBRUEsS0FBRSxPQUFLLE1BQUksQ0FBQyxHQUFFLEVBQUUsRUFBRUEsS0FBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLEVBQUUsRUFBRUEsS0FBRSxNQUFJLE1BQUksQ0FBQyxHQUFFLEVBQUUsRUFBRUEsT0FBSSxNQUFJLENBQUMsR0FBRSxDQUFDLEdBQUVFLEtBQUUsRUFBRSxFQUFFRixLQUFFLE9BQUssTUFBSSxDQUFDLEdBQUVHLEtBQUVGLEdBQUUsa0JBQWtCLEdBQUVNLEtBQUUsSUFBSSxLQUFLTixHQUFFLFlBQVksR0FBRSxHQUFFLENBQUMsRUFBRSxrQkFBa0IsR0FBRUksS0FBRSxJQUFJLEtBQUtKLEdBQUUsWUFBWSxHQUFFLEdBQUUsQ0FBQyxFQUFFLGtCQUFrQixHQUFFSyxLQUFFLEtBQUssSUFBSUQsSUFBRUUsRUFBQztBQUFFLGVBQU8sSUFBRUwsS0FBRSxFQUFFLEVBQUVGLEtBQUUsT0FBSyxNQUFJLENBQUMsSUFBRSxPQUFPTyxNQUFHRixNQUFHQyxNQUFHSCxFQUFDLElBQUUsSUFBRUQsT0FBSUksTUFBR0gsUUFBS0ksS0FBRSxLQUFLLElBQUlGLElBQUVFLEVBQUMsR0FBRU4sR0FBRSxRQUFRQSxHQUFFLFFBQVEsSUFBRSxRQUFNLElBQUVDLEtBQUVJLEtBQUVDLE1BQUdKLEdBQUUsSUFBRyxFQUFFLEVBQUVILEtBQUUsT0FBSyxNQUFJLENBQUMsSUFBRUMsR0FBRSxPQUFPLEdBQUVDLE1BQUcsR0FBR0QsR0FBRSxZQUFZLENBQUMsSUFBRSxLQUFHLElBQUlBLEdBQUUsU0FBUyxDQUFDLElBQUVBLEdBQUUsUUFBUSxJQUFFLElBQUUsR0FBRSxFQUFFLEVBQUVELEtBQUUsT0FBSyxNQUFJLENBQUMsSUFBRUUsSUFBRSxFQUFFLEVBQUVGLE9BQUksTUFBSSxDQUFDLElBQUVDLEdBQUUsV0FBVyxHQUFFLEVBQUUsRUFBRUQsS0FBRSxNQUFJLE1BQUksQ0FBQyxJQUFFQyxHQUFFLFdBQVcsR0FBRSxFQUFFLEVBQUVELEtBQUUsTUFBSSxNQUFJLENBQUMsSUFBRUMsR0FBRSxTQUFTLEdBQUUsRUFBRSxFQUFFRCxLQUFFLE9BQUssTUFBSSxDQUFDLElBQUVDLEdBQUUsUUFBUSxHQUFFLEVBQUUsRUFBRUQsS0FBRSxPQUFLLE1BQUksQ0FBQyxJQUFFQyxHQUFFLFNBQVMsR0FBRSxFQUFFLEVBQUVELEtBQUUsT0FBSyxNQUFJLENBQUMsSUFBRUMsR0FBRSxRQUFRLEdBQUVELEtBQUVDLEdBQUUsUUFBUSxHQUFFLE9BQU8sTUFBTUQsRUFBQyxJQUFFLEtBQUdBLEtBQUUsR0FBRztBQUFBLE1BQUM7QUFBQyxlQUFTLEdBQUdBLElBQUVDLElBQUVDLElBQUVDLElBQUVJLElBQUVGLElBQUVDLElBQUU7QUFBQyxlQUFPLElBQUUsR0FBRyxJQUFHLEdBQUVOLElBQUVDLElBQUVDLElBQUVDLElBQUVJLElBQUVGLElBQUVDLEVBQUMsSUFBRTtBQUFBLE1BQUc7QUFBQyxl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QUFHO0FBQUEsWUFBRztBQUFBLFlBQUc7QUFBQSxZQUFHO0FBQUEsWUFBRztBQUFBLFlBQUk7QUFBQSxZQUFHO0FBQUEsWUFBRztBQUFBLFlBQUc7QUFBQSxZQUFHO0FBQUEsWUFBRztBQUFBLFlBQUc7QUFBQSxZQUFJO0FBQUEsWUFBSTtBQUFBLFlBQUc7QUFBQSxZQUFJO0FBQUEsWUFBRztBQUFBLFlBQUk7QUFBQSxZQUFHO0FBQUEsWUFBSztBQUFBLFlBQUk7QUFBQSxZQUFLO0FBQUEsWUFBSTtBQUFBLFlBQUc7QUFBQSxZQUFHO0FBQUEsWUFDN0c7QUFBQSxZQUFHO0FBQUEsWUFBRztBQUFBLFlBQUc7QUFBQSxZQUFHO0FBQUEsWUFBRztBQUFBLFlBQUc7QUFBQSxZQUFHO0FBQUEsWUFBRztBQUFBLFlBQUc7QUFBQSxZQUFHO0FBQUEsWUFBRztBQUFBLFlBQUc7QUFBQSxZQUFHO0FBQUEsWUFBSztBQUFBLFlBQUs7QUFBQSxZQUFHO0FBQUEsWUFBSTtBQUFBLFVBQzFELENBQUM7QUFBQSxRQUNIO0FBQUEsTUFDRixTQUFTQSxJQUFHO0FBQ1YsZUFBTztBQUFBLE1BQ1Q7QUFBQSxJQUNGO0FBRUEsSUFBTSx5QkFBeUIsTUFBZTtBQUM1QyxVQUFJO0FBZ0JGLGVBQU8sWUFBWTtBQUFBLFVBQ2pCLElBQUksV0FBVztBQUFBLFlBQ2I7QUFBQSxZQUFHO0FBQUEsWUFBSTtBQUFBLFlBQUs7QUFBQSxZQUFLO0FBQUEsWUFBRztBQUFBLFlBQUc7QUFBQSxZQUFHO0FBQUEsWUFBRztBQUFBLFlBQUc7QUFBQSxZQUFHO0FBQUEsWUFBRztBQUFBLFlBQUk7QUFBQSxZQUFHO0FBQUEsWUFBRztBQUFBLFlBQUs7QUFBQSxZQUFHO0FBQUEsWUFBRztBQUFBLFlBQUc7QUFBQSxZQUFHO0FBQUEsWUFBSTtBQUFBLFlBQUk7QUFBQSxZQUFHO0FBQUEsWUFBSTtBQUFBLFlBQUc7QUFBQSxZQUFJO0FBQUEsWUFBRztBQUFBLFlBQUs7QUFBQSxZQUFJO0FBQUEsWUFBSTtBQUFBLFlBQUc7QUFBQSxZQUMxRztBQUFBLFlB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QUFPLGVBQWVDLEtBQUksVUFBVSxPQUFPLEVBQUUsT0FBT0MsVUFBUyxZQUFZLEtBQUssQ0FBQzsiLAogICJuYW1lcyI6IFsiaSIsICJlIiwgImVudiIsICJGbG9hdDE2QXJyYXkiLCAiVGVuc29yIiwgIlRlbnNvciIsICJJbmZlcmVuY2VTZXNzaW9uIiwgIkluZmVyZW5jZVNlc3Npb24iLCAiVGVuc29yIiwgImVudiIsICJlIiwgInQiLCAiciIsICJuIiwgIm8iLCAiYSIsICJpIiwgInUiLCAiUm4iLCAicyIsICJmIiwgImIiLCAibSIsICJsIiwgImMiLCAiZCIsICJwIiwgInkiLCAiZSIsICJyIiwgInQiLCAibiIsICJIciIsICJpIiwgIm8iLCAiYSIsICJzIiwgInUiLCAiZiIsICJjIiwgImwiLCAiZSIsICJ3YXNtIiwgIndhc20iLCAiZSIsICJ3YXNtIiwgImUiLCAibG9jYXRpb24iLCAiZSIsICJlbnYiLCAid2FzbSIsICJsb2NhdGlvbiIsICJlIiwgImluZGV4IiwgInRlbnNvciIsICJlcnJvckNvZGUiLCAiaSIsICJ0IiwgImluaXRpYWxpemluZyIsICJpbml0aWFsaXplZCIsICJhYm9ydGVkIiwgImNvcHlGcm9tRXh0ZXJuYWxCdWZmZXIiLCAiY3JlYXRlU2Vzc2lvbiIsICJyZWxlYXNlU2Vzc2lvbiIsICJydW4iLCAiZW5kUHJvZmlsaW5nIiwgImVudiIsICJpbmZlcldhc21QYXRoUHJlZml4RnJvbVNjcmlwdFNyYyIsICJpc0VzbUltcG9ydE1ldGFVcmxIYXJkY29kZWRBc0ZpbGVVcmkiLCAiZSIsICJ0IiwgIlRlbnNvciIsICJjb3B5RnJvbUV4dGVybmFsQnVmZmVyIiwgImNyZWF0ZVNlc3Npb24iLCAicmVsZWFzZVNlc3Npb24iLCAidCIsICJydW4iLCAiZW5kUHJvZmlsaW5nIiwgImVudiIsICJ2ZXJzaW9uIiwgIndhc21CYWNrZW5kIiwgImVudiIsICJ2ZXJzaW9uIl0KfQo=
