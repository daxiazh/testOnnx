/*!
 * ONNX Runtime Web v1.18.2
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
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
        } catch (e) {
          if (!isInitializing) {
            backendInfo.error = `${e}`;
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
        throw new Error(`no available backend found. ERR: ${errors.map((e) => `[${e.name}] ${e.err}`).join(", ")}`);
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
    version = "1.18.2";
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
          if (options.format !== void 0 && (channels === 4 && options.format !== "RGBA") || channels === 3 && (options.format !== "RGB" && options.format !== "BGR")) {
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
var bufferToTensor, tensorFromImage, tensorFromTexture, tensorFromGpuBuffer, tensorFromPinnedBuffer;
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
        if (canvas instanceof HTMLCanvasElement) {
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
      ["uint32", Uint32Array]
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
        const isFloat16ArrayAvailable = typeof Float16Array !== "undefined" && Float16Array.from;
        if (isBigInt64ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("int64", BigInt64Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigInt64Array, "int64");
        }
        if (isBigUint64ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("uint64", BigUint64Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(BigUint64Array, "uint64");
        }
        if (isFloat16ArrayAvailable) {
          NUMERIC_TENSOR_TYPE_TO_TYPEDARRAY_MAP.set("float16", Float16Array);
          NUMERIC_TENSOR_TYPEDARRAY_TO_TYPE_MAP.set(Float16Array, "float16");
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
              if (type !== "float32" && type !== "float16" && type !== "int32" && type !== "int64" && type !== "uint32" && type !== "uint8" && type !== "bool") {
                throw new TypeError(`unsupported type "${type}" to create tensor from gpu buffer`);
              }
              this.gpuBufferData = arg0.gpuBuffer;
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
                if (arg0 === "float16" && typedArrayConstructor === Uint16Array) {
                  throw new TypeError("Creating a float16 tensor from number array is not supported. Please use Uint16Array as data.");
                } else if (arg0 === "uint64" || arg0 === "int64") {
                  data = typedArrayConstructor.from(arg1, BigInt);
                } else {
                  data = typedArrayConstructor.from(arg1);
                }
              } else if (arg1 instanceof typedArrayConstructor) {
                data = arg1;
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
          throw new Error(`Tensor's size(${size}) does not match data length(${this.cpuData.length}).`);
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
      // #endregion
      // #region methods
      async getData(releaseData) {
        this.ensureValid();
        switch (this.dataLocation) {
          case "cpu":
          case "cpu-pinned":
            return this.data;
          case "texture":
          case "gpu-buffer": {
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

// common/dist/esm/training-session-impl.js
var noBackendErrMsg, TrainingSession;
var init_training_session_impl = __esm({
  "common/dist/esm/training-session-impl.js"() {
    "use strict";
    init_backend_impl();
    init_tensor();
    noBackendErrMsg = "Training backend could not be resolved. Make sure you're using the correct configuration & WebAssembly files.";
    TrainingSession = class _TrainingSession {
      constructor(handler, hasOptimizerModel, hasEvalModel) {
        this.handler = handler;
        this.hasOptimizerModel = hasOptimizerModel;
        this.hasEvalModel = hasEvalModel;
      }
      get trainingInputNames() {
        return this.handler.inputNames;
      }
      get trainingOutputNames() {
        return this.handler.outputNames;
      }
      get evalInputNames() {
        if (this.hasEvalModel) {
          return this.handler.evalInputNames;
        } else {
          throw new Error("This training session has no evalModel loaded.");
        }
      }
      get evalOutputNames() {
        if (this.hasEvalModel) {
          return this.handler.evalOutputNames;
        } else {
          throw new Error("This training session has no evalModel loaded.");
        }
      }
      static async create(trainingOptions, sessionOptions) {
        const evalModel = trainingOptions.evalModel || "";
        const optimizerModel = trainingOptions.optimizerModel || "";
        const options = sessionOptions || {};
        const [backend, optionsWithValidatedEPs] = await resolveBackendAndExecutionProviders(options);
        if (backend.createTrainingSessionHandler) {
          const handler = await backend.createTrainingSessionHandler(trainingOptions.checkpointState, trainingOptions.trainModel, evalModel, optimizerModel, optionsWithValidatedEPs);
          return new _TrainingSession(handler, !!trainingOptions.optimizerModel, !!trainingOptions.evalModel);
        } else {
          throw new Error(noBackendErrMsg);
        }
      }
      /**
       * Helper function for runTrainStep and future runStep methods that handles the type-narrowing conversion from
       * the given parameters to SessionHandler.FetchesType and RunOptions.
       *
       * @param inputNames the feeds object is checked that they contain all input names in the provided list of input
       * names.
       * @param outputNames the fetches object is checked that their keys match up with valid names in the list of output
       * names.
       * @param feeds the required input
       * @param arg1 narrowed & converted into the SessionHandler.FetchesType or RunOptions object
       * @param arg2 optional RunOptions object.
       * @returns
       */
      typeNarrowingForRunStep(inputNames, outputNames, feeds, arg1, arg2) {
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
              if (outputNames.indexOf(name) === -1) {
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
            for (const name of outputNames) {
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
        for (const name of inputNames) {
          if (typeof feeds[name] === "undefined") {
            throw new Error(`input '${name}' is missing in 'feeds'.`);
          }
        }
        if (isFetchesEmpty) {
          for (const name of outputNames) {
            fetches[name] = null;
          }
        }
        return [fetches, options];
      }
      /**
       * Helper method for runTrainStep and any other runStep methods. Takes the ReturnType result from the SessionHandler
       * and changes it into a map of Tensors.
       *
       * @param results
       * @returns
       */
      convertHandlerReturnTypeToMapOfTensors(results) {
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
        return returnValue;
      }
      async lazyResetGrad() {
        await this.handler.lazyResetGrad();
      }
      async runTrainStep(feeds, arg1, arg2) {
        const [fetches, options] = this.typeNarrowingForRunStep(this.trainingInputNames, this.trainingOutputNames, feeds, arg1, arg2);
        const results = await this.handler.runTrainStep(feeds, fetches, options);
        return this.convertHandlerReturnTypeToMapOfTensors(results);
      }
      async runOptimizerStep(options) {
        if (this.hasOptimizerModel) {
          await this.handler.runOptimizerStep(options || {});
        } else {
          throw new Error("This TrainingSession has no OptimizerModel loaded.");
        }
      }
      async runEvalStep(feeds, arg1, arg2) {
        if (this.hasEvalModel) {
          const [fetches, options] = this.typeNarrowingForRunStep(this.evalInputNames, this.evalOutputNames, feeds, arg1, arg2);
          const results = await this.handler.runEvalStep(feeds, fetches, options);
          return this.convertHandlerReturnTypeToMapOfTensors(results);
        } else {
          throw new Error("This TrainingSession has no EvalModel loaded.");
        }
      }
      async getParametersSize(trainableOnly = true) {
        return this.handler.getParametersSize(trainableOnly);
      }
      async loadParametersBuffer(array, trainableOnly = true) {
        const paramsSize = await this.getParametersSize(trainableOnly);
        if (array.length !== 4 * paramsSize) {
          throw new Error("Size of the buffer passed into loadParametersBuffer must match the number of parameters in the model. Please use getParametersSize method to check.");
        }
        return this.handler.loadParametersBuffer(array, trainableOnly);
      }
      async getContiguousParameters(trainableOnly = true) {
        return this.handler.getContiguousParameters(trainableOnly);
      }
      async release() {
        return this.handler.dispose();
      }
    };
  }
});

// common/dist/esm/training-session.js
var TrainingSession2;
var init_training_session = __esm({
  "common/dist/esm/training-session.js"() {
    "use strict";
    init_training_session_impl();
    TrainingSession2 = TrainingSession;
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
  TrainingSession: () => TrainingSession2,
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
    init_training_session();
  }
});

// nodejs-ignore:node:os
var cpus;
var init_node_os = __esm({
  "nodejs-ignore:node:os"() {
    cpus = void 0;
  }
});

// nodejs-ignore:fs
var fs_exports = {};
__export(fs_exports, {
  createReadStream: () => createReadStream,
  readFile: () => readFile,
  readFileSync: () => readFileSync
});
var readFile, readFileSync, createReadStream;
var init_fs = __esm({
  "nodejs-ignore:fs"() {
    readFile = void 0;
    readFileSync = void 0;
    createReadStream = void 0;
  }
});

// nodejs-ignore:path
var path_exports = {};
__export(path_exports, {
  join: () => join
});
var join;
var init_path = __esm({
  "nodejs-ignore:path"() {
    join = void 0;
  }
});

// web/lib/wasm/binding/ort-wasm.js
var require_ort_wasm = __commonJS({
  "web/lib/wasm/binding/ort-wasm.js"(exports, module) {
    "use strict";
    var ortWasm = (() => {
      var _scriptDir = typeof document != "undefined" ? document.currentScript?.src : void 0;
      if (typeof __filename != "undefined")
        _scriptDir ||= __filename;
      return function(moduleArg = {}) {
        var Module = moduleArg;
        var readyPromiseResolve, readyPromiseReject;
        var readyPromise = new Promise((resolve, reject) => {
          readyPromiseResolve = resolve;
          readyPromiseReject = reject;
        });
        if (Module["readyPromiseRejectWrapper"]) {
          Module["readyPromiseRejectWrapper"]["value"] = readyPromiseReject;
        }
        var moduleOverrides = Object.assign({}, Module);
        var arguments_ = [];
        var thisProgram = "./this.program";
        var quit_ = (status, toThrow) => {
          throw toThrow;
        };
        var ENVIRONMENT_IS_WEB = typeof window == "object";
        var ENVIRONMENT_IS_WORKER = typeof importScripts == "function";
        var ENVIRONMENT_IS_NODE = typeof process == "object" && typeof process.versions == "object" && typeof process.versions.node == "string";
        var scriptDirectory = "";
        function locateFile(path) {
          if (Module["locateFile"]) {
            return Module["locateFile"](path, scriptDirectory);
          }
          return scriptDirectory + path;
        }
        var read_, readAsync, readBinary;
        if (ENVIRONMENT_IS_NODE) {
          var fs = (init_fs(), __toCommonJS(fs_exports));
          var nodePath = (init_path(), __toCommonJS(path_exports));
          if (ENVIRONMENT_IS_WORKER) {
            scriptDirectory = nodePath.dirname(scriptDirectory) + "/";
          } else {
            scriptDirectory = __dirname + "/";
          }
          read_ = (filename, binary) => {
            filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
            return fs.readFileSync(filename, binary ? void 0 : "utf8");
          };
          readBinary = (filename) => {
            var ret = read_(filename, true);
            if (!ret.buffer) {
              ret = new Uint8Array(ret);
            }
            return ret;
          };
          readAsync = (filename, onload, onerror, binary = true) => {
            filename = isFileURI(filename) ? new URL(filename) : nodePath.normalize(filename);
            fs.readFile(filename, binary ? void 0 : "utf8", (err2, data) => {
              if (err2)
                onerror(err2);
              else
                onload(binary ? data.buffer : data);
            });
          };
          if (!Module["thisProgram"] && process.argv.length > 1) {
            thisProgram = process.argv[1].replace(/\\/g, "/");
          }
          arguments_ = process.argv.slice(2);
          quit_ = (status, toThrow) => {
            process.exitCode = status;
            throw toThrow;
          };
        } else if (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER) {
          if (ENVIRONMENT_IS_WORKER) {
            scriptDirectory = self.location.href;
          } else if (typeof document != "undefined" && document.currentScript) {
            scriptDirectory = document.currentScript.src;
          }
          if (_scriptDir) {
            scriptDirectory = _scriptDir;
          }
          if (scriptDirectory.startsWith("blob:")) {
            scriptDirectory = "";
          } else {
            scriptDirectory = scriptDirectory.substr(
              0,
              scriptDirectory.replace(/[?#].*/, "").lastIndexOf("/") + 1
            );
          }
          {
            read_ = (url) => {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", url, false);
              xhr.send(null);
              return xhr.responseText;
            };
            if (ENVIRONMENT_IS_WORKER) {
              readBinary = (url) => {
                var xhr = new XMLHttpRequest();
                xhr.open("GET", url, false);
                xhr.responseType = "arraybuffer";
                xhr.send(null);
                return new Uint8Array(xhr.response);
              };
            }
            readAsync = (url, onload, onerror) => {
              var xhr = new XMLHttpRequest();
              xhr.open("GET", url, true);
              xhr.responseType = "arraybuffer";
              xhr.onload = () => {
                if (xhr.status == 200 || xhr.status == 0 && xhr.response) {
                  onload(xhr.response);
                  return;
                }
                onerror();
              };
              xhr.onerror = onerror;
              xhr.send(null);
            };
          }
        } else {
        }
        var out = console.log.bind(console);
        var err = console.error.bind(console);
        Object.assign(Module, moduleOverrides);
        moduleOverrides = null;
        if (Module["arguments"])
          arguments_ = Module["arguments"];
        var wasmBinary;
        var wasmMemory;
        var ABORT = false;
        var EXITSTATUS;
        var HEAP8, HEAPU8, HEAP16, HEAPU16, HEAP32, HEAPU32, HEAPF32, HEAPF64;
        function updateMemoryViews() {
          var b = wasmMemory.buffer;
          Module["HEAP8"] = HEAP8 = new Int8Array(b);
          Module["HEAP16"] = HEAP16 = new Int16Array(b);
          Module["HEAPU8"] = HEAPU8 = new Uint8Array(b);
          Module["HEAPU16"] = HEAPU16 = new Uint16Array(b);
          Module["HEAP32"] = HEAP32 = new Int32Array(b);
          Module["HEAPU32"] = HEAPU32 = new Uint32Array(b);
          Module["HEAPF32"] = HEAPF32 = new Float32Array(b);
          Module["HEAPF64"] = HEAPF64 = new Float64Array(b);
        }
        var __ATPRERUN__ = [];
        var __ATINIT__ = [];
        var __ATPOSTRUN__ = [];
        var runtimeInitialized = false;
        function preRun() {
          if (Module["preRun"]) {
            if (typeof Module["preRun"] == "function")
              Module["preRun"] = [Module["preRun"]];
            while (Module["preRun"].length) {
              addOnPreRun(Module["preRun"].shift());
            }
          }
          callRuntimeCallbacks(__ATPRERUN__);
        }
        function initRuntime2() {
          runtimeInitialized = true;
          callRuntimeCallbacks(__ATINIT__);
        }
        function postRun() {
          callRuntimeCallbacks(__ATPOSTRUN__);
        }
        function addOnPreRun(cb) {
          __ATPRERUN__.unshift(cb);
        }
        function addOnInit(cb) {
          __ATINIT__.unshift(cb);
        }
        var runDependencies = 0;
        var runDependencyWatcher = null;
        var dependenciesFulfilled = null;
        function addRunDependency(id) {
          runDependencies++;
        }
        function removeRunDependency(id) {
          runDependencies--;
          if (runDependencies == 0) {
            if (runDependencyWatcher !== null) {
              clearInterval(runDependencyWatcher);
              runDependencyWatcher = null;
            }
            if (dependenciesFulfilled) {
              var callback = dependenciesFulfilled;
              dependenciesFulfilled = null;
              callback();
            }
          }
        }
        function abort(what) {
          what = "Aborted(" + what + ")";
          err(what);
          ABORT = true;
          EXITSTATUS = 1;
          what += ". Build with -sASSERTIONS for more info.";
          var e = new WebAssembly.RuntimeError(what);
          readyPromiseReject(e);
          throw e;
        }
        var dataURIPrefix = "data:application/octet-stream;base64,";
        var isDataURI = (filename) => filename.startsWith(dataURIPrefix);
        var isFileURI = (filename) => filename.startsWith("file://");
        var wasmBinaryFile;
        wasmBinaryFile = "ort-wasm.wasm";
        if (!isDataURI(wasmBinaryFile)) {
          wasmBinaryFile = locateFile(wasmBinaryFile);
        }
        function getBinarySync(file) {
          if (file == wasmBinaryFile && wasmBinary) {
            return new Uint8Array(wasmBinary);
          }
          if (readBinary) {
            return readBinary(file);
          }
          throw "both async and sync fetching of the wasm failed";
        }
        function getBinaryPromise(binaryFile) {
          if (!wasmBinary && (ENVIRONMENT_IS_WEB || ENVIRONMENT_IS_WORKER)) {
            if (typeof fetch == "function" && !isFileURI(binaryFile)) {
              return fetch(binaryFile, { credentials: "same-origin" }).then((response) => {
                if (!response["ok"]) {
                  throw `failed to load wasm binary file at '${binaryFile}'`;
                }
                return response["arrayBuffer"]();
              }).catch(() => getBinarySync(binaryFile));
            } else if (readAsync) {
              return new Promise((resolve, reject) => {
                readAsync(
                  binaryFile,
                  (response) => resolve(new Uint8Array(response)),
                  reject
                );
              });
            }
          }
          return Promise.resolve().then(() => getBinarySync(binaryFile));
        }
        function instantiateArrayBuffer(binaryFile, imports, receiver) {
          return getBinaryPromise(binaryFile).then((binary) => WebAssembly.instantiate(binary, imports)).then(receiver, (reason) => {
            err(`failed to asynchronously prepare wasm: ${reason}`);
            abort(reason);
          });
        }
        function instantiateAsync(binary, binaryFile, imports, callback) {
          if (!binary && typeof WebAssembly.instantiateStreaming == "function" && !isDataURI(binaryFile) && !isFileURI(binaryFile) && !ENVIRONMENT_IS_NODE && typeof fetch == "function") {
            return fetch(binaryFile, { credentials: "same-origin" }).then(
              (response) => {
                var result = WebAssembly.instantiateStreaming(response, imports);
                return result.then(callback, function(reason) {
                  err(`wasm streaming compile failed: ${reason}`);
                  err("falling back to ArrayBuffer instantiation");
                  return instantiateArrayBuffer(binaryFile, imports, callback);
                });
              }
            );
          }
          return instantiateArrayBuffer(binaryFile, imports, callback);
        }
        function createWasm() {
          var info = { a: wasmImports };
          function receiveInstance(instance, module2) {
            wasmExports = instance.exports;
            wasmExports = applySignatureConversions(wasmExports);
            wasmMemory = wasmExports["K"];
            updateMemoryViews();
            addOnInit(wasmExports["L"]);
            removeRunDependency("wasm-instantiate");
            return wasmExports;
          }
          addRunDependency("wasm-instantiate");
          function receiveInstantiationResult(result) {
            receiveInstance(result["instance"]);
          }
          if (Module["instantiateWasm"]) {
            try {
              return Module["instantiateWasm"](info, receiveInstance);
            } catch (e) {
              err(`Module.instantiateWasm callback failed with error: ${e}`);
              readyPromiseReject(e);
            }
          }
          instantiateAsync(
            wasmBinary,
            wasmBinaryFile,
            info,
            receiveInstantiationResult
          ).catch(readyPromiseReject);
          return {};
        }
        var tempDouble;
        var ASM_CONSTS = {
          434096: ($0, $1, $2, $3) => {
            if (typeof Module == "undefined" || !Module.MountedFiles) {
              return 1;
            }
            let fileName = UTF8ToString($0 >>> 0);
            if (fileName.startsWith("./")) {
              fileName = fileName.substring(2);
            }
            const fileData = Module.MountedFiles.get(fileName);
            if (!fileData) {
              return 2;
            }
            const offset = $1 >>> 0;
            const length = $2 >>> 0;
            const buffer = $3 >>> 0;
            if (offset + length > fileData.byteLength) {
              return 3;
            }
            try {
              HEAPU8.set(fileData.subarray(offset, offset + length), buffer >>> 0);
              return 0;
            } catch {
              return 4;
            }
          }
        };
        var callRuntimeCallbacks = (callbacks) => {
          while (callbacks.length > 0) {
            callbacks.shift()(Module);
          }
        };
        var stackRestore = (val) => __emscripten_stack_restore(val);
        var stackSave = () => _emscripten_stack_get_current();
        class ExceptionInfo {
          constructor(excPtr) {
            this.excPtr = excPtr;
            this.ptr = excPtr - 24;
          }
          set_type(type) {
            HEAPU32[this.ptr + 4 >>> 2 >>> 0] = type;
          }
          get_type() {
            return HEAPU32[this.ptr + 4 >>> 2 >>> 0];
          }
          set_destructor(destructor) {
            HEAPU32[this.ptr + 8 >>> 2 >>> 0] = destructor;
          }
          get_destructor() {
            return HEAPU32[this.ptr + 8 >>> 2 >>> 0];
          }
          set_caught(caught) {
            caught = caught ? 1 : 0;
            HEAP8[this.ptr + 12 >>> 0] = caught;
          }
          get_caught() {
            return HEAP8[this.ptr + 12 >>> 0] != 0;
          }
          set_rethrown(rethrown) {
            rethrown = rethrown ? 1 : 0;
            HEAP8[this.ptr + 13 >>> 0] = rethrown;
          }
          get_rethrown() {
            return HEAP8[this.ptr + 13 >>> 0] != 0;
          }
          init(type, destructor) {
            this.set_adjusted_ptr(0);
            this.set_type(type);
            this.set_destructor(destructor);
          }
          set_adjusted_ptr(adjustedPtr) {
            HEAPU32[this.ptr + 16 >>> 2 >>> 0] = adjustedPtr;
          }
          get_adjusted_ptr() {
            return HEAPU32[this.ptr + 16 >>> 2 >>> 0];
          }
          get_exception_ptr() {
            var isPointer = ___cxa_is_pointer_type(this.get_type());
            if (isPointer) {
              return HEAPU32[this.excPtr >>> 2 >>> 0];
            }
            var adjusted = this.get_adjusted_ptr();
            if (adjusted !== 0)
              return adjusted;
            return this.excPtr;
          }
        }
        var exceptionLast = 0;
        var uncaughtExceptionCount = 0;
        var convertI32PairToI53Checked = (lo, hi) => hi + 2097152 >>> 0 < 4194305 - !!lo ? (lo >>> 0) + hi * 4294967296 : NaN;
        function ___cxa_throw(ptr, type, destructor) {
          ptr >>>= 0;
          type >>>= 0;
          destructor >>>= 0;
          var info = new ExceptionInfo(ptr);
          info.init(type, destructor);
          exceptionLast = ptr;
          uncaughtExceptionCount++;
          throw exceptionLast;
        }
        var UTF8Decoder = typeof TextDecoder != "undefined" ? new TextDecoder("utf8") : void 0;
        var UTF8ArrayToString = (heapOrArray, idx, maxBytesToRead) => {
          idx >>>= 0;
          var endIdx = idx + maxBytesToRead;
          var endPtr = idx;
          while (heapOrArray[endPtr] && !(endPtr >= endIdx))
            ++endPtr;
          if (endPtr - idx > 16 && heapOrArray.buffer && UTF8Decoder) {
            return UTF8Decoder.decode(heapOrArray.subarray(idx, endPtr));
          }
          var str = "";
          while (idx < endPtr) {
            var u0 = heapOrArray[idx++];
            if (!(u0 & 128)) {
              str += String.fromCharCode(u0);
              continue;
            }
            var u1 = heapOrArray[idx++] & 63;
            if ((u0 & 224) == 192) {
              str += String.fromCharCode((u0 & 31) << 6 | u1);
              continue;
            }
            var u2 = heapOrArray[idx++] & 63;
            if ((u0 & 240) == 224) {
              u0 = (u0 & 15) << 12 | u1 << 6 | u2;
            } else {
              u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | heapOrArray[idx++] & 63;
            }
            if (u0 < 65536) {
              str += String.fromCharCode(u0);
            } else {
              var ch = u0 - 65536;
              str += String.fromCharCode(55296 | ch >> 10, 56320 | ch & 1023);
            }
          }
          return str;
        };
        var UTF8ToString = (ptr, maxBytesToRead) => {
          ptr >>>= 0;
          return ptr ? UTF8ArrayToString(HEAPU8, ptr, maxBytesToRead) : "";
        };
        var SYSCALLS = {
          varargs: void 0,
          getStr(ptr) {
            var ret = UTF8ToString(ptr);
            return ret;
          }
        };
        function ___syscall_fcntl64(fd, cmd, varargs) {
          varargs >>>= 0;
          SYSCALLS.varargs = varargs;
          return 0;
        }
        function ___syscall_fstat64(fd, buf) {
          buf >>>= 0;
        }
        var lengthBytesUTF8 = (str) => {
          var len = 0;
          for (var i = 0; i < str.length; ++i) {
            var c = str.charCodeAt(i);
            if (c <= 127) {
              len++;
            } else if (c <= 2047) {
              len += 2;
            } else if (c >= 55296 && c <= 57343) {
              len += 4;
              ++i;
            } else {
              len += 3;
            }
          }
          return len;
        };
        var stringToUTF8Array = (str, heap, outIdx, maxBytesToWrite) => {
          outIdx >>>= 0;
          if (!(maxBytesToWrite > 0))
            return 0;
          var startIdx = outIdx;
          var endIdx = outIdx + maxBytesToWrite - 1;
          for (var i = 0; i < str.length; ++i) {
            var u = str.charCodeAt(i);
            if (u >= 55296 && u <= 57343) {
              var u1 = str.charCodeAt(++i);
              u = 65536 + ((u & 1023) << 10) | u1 & 1023;
            }
            if (u <= 127) {
              if (outIdx >= endIdx)
                break;
              heap[outIdx++ >>> 0] = u;
            } else if (u <= 2047) {
              if (outIdx + 1 >= endIdx)
                break;
              heap[outIdx++ >>> 0] = 192 | u >> 6;
              heap[outIdx++ >>> 0] = 128 | u & 63;
            } else if (u <= 65535) {
              if (outIdx + 2 >= endIdx)
                break;
              heap[outIdx++ >>> 0] = 224 | u >> 12;
              heap[outIdx++ >>> 0] = 128 | u >> 6 & 63;
              heap[outIdx++ >>> 0] = 128 | u & 63;
            } else {
              if (outIdx + 3 >= endIdx)
                break;
              heap[outIdx++ >>> 0] = 240 | u >> 18;
              heap[outIdx++ >>> 0] = 128 | u >> 12 & 63;
              heap[outIdx++ >>> 0] = 128 | u >> 6 & 63;
              heap[outIdx++ >>> 0] = 128 | u & 63;
            }
          }
          heap[outIdx >>> 0] = 0;
          return outIdx - startIdx;
        };
        var stringToUTF8 = (str, outPtr, maxBytesToWrite) => stringToUTF8Array(str, HEAPU8, outPtr, maxBytesToWrite);
        function ___syscall_getcwd(buf, size) {
          buf >>>= 0;
          size >>>= 0;
        }
        function ___syscall_getdents64(fd, dirp, count) {
          dirp >>>= 0;
          count >>>= 0;
        }
        function ___syscall_ioctl(fd, op, varargs) {
          varargs >>>= 0;
          SYSCALLS.varargs = varargs;
          return 0;
        }
        function ___syscall_lstat64(path, buf) {
          path >>>= 0;
          buf >>>= 0;
        }
        function ___syscall_mkdirat(dirfd, path, mode) {
          path >>>= 0;
        }
        function ___syscall_newfstatat(dirfd, path, buf, flags) {
          path >>>= 0;
          buf >>>= 0;
        }
        function ___syscall_openat(dirfd, path, flags, varargs) {
          path >>>= 0;
          varargs >>>= 0;
          SYSCALLS.varargs = varargs;
        }
        function ___syscall_readlinkat(dirfd, path, buf, bufsize) {
          path >>>= 0;
          buf >>>= 0;
          bufsize >>>= 0;
        }
        function ___syscall_rmdir(path) {
          path >>>= 0;
        }
        function ___syscall_stat64(path, buf) {
          path >>>= 0;
          buf >>>= 0;
        }
        function ___syscall_unlinkat(dirfd, path, flags) {
          path >>>= 0;
        }
        var nowIsMonotonic = 1;
        var __emscripten_get_now_is_monotonic = () => nowIsMonotonic;
        function __emscripten_memcpy_js(dest, src, num) {
          dest >>>= 0;
          src >>>= 0;
          num >>>= 0;
          return HEAPU8.copyWithin(dest >>> 0, src >>> 0, src + num >>> 0);
        }
        function __gmtime_js(time_low, time_high, tmPtr) {
          var time = convertI32PairToI53Checked(time_low, time_high);
          tmPtr >>>= 0;
          var date = new Date(time * 1e3);
          HEAP32[tmPtr >>> 2 >>> 0] = date.getUTCSeconds();
          HEAP32[tmPtr + 4 >>> 2 >>> 0] = date.getUTCMinutes();
          HEAP32[tmPtr + 8 >>> 2 >>> 0] = date.getUTCHours();
          HEAP32[tmPtr + 12 >>> 2 >>> 0] = date.getUTCDate();
          HEAP32[tmPtr + 16 >>> 2 >>> 0] = date.getUTCMonth();
          HEAP32[tmPtr + 20 >>> 2 >>> 0] = date.getUTCFullYear() - 1900;
          HEAP32[tmPtr + 24 >>> 2 >>> 0] = date.getUTCDay();
          var start = Date.UTC(date.getUTCFullYear(), 0, 1, 0, 0, 0, 0);
          var yday = (date.getTime() - start) / (1e3 * 60 * 60 * 24) | 0;
          HEAP32[tmPtr + 28 >>> 2 >>> 0] = yday;
        }
        var isLeapYear = (year) => year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
        var MONTH_DAYS_LEAP_CUMULATIVE = [
          0,
          31,
          60,
          91,
          121,
          152,
          182,
          213,
          244,
          274,
          305,
          335
        ];
        var MONTH_DAYS_REGULAR_CUMULATIVE = [
          0,
          31,
          59,
          90,
          120,
          151,
          181,
          212,
          243,
          273,
          304,
          334
        ];
        var ydayFromDate = (date) => {
          var leap = isLeapYear(date.getFullYear());
          var monthDaysCumulative = leap ? MONTH_DAYS_LEAP_CUMULATIVE : MONTH_DAYS_REGULAR_CUMULATIVE;
          var yday = monthDaysCumulative[date.getMonth()] + date.getDate() - 1;
          return yday;
        };
        function __localtime_js(time_low, time_high, tmPtr) {
          var time = convertI32PairToI53Checked(time_low, time_high);
          tmPtr >>>= 0;
          var date = new Date(time * 1e3);
          HEAP32[tmPtr >>> 2 >>> 0] = date.getSeconds();
          HEAP32[tmPtr + 4 >>> 2 >>> 0] = date.getMinutes();
          HEAP32[tmPtr + 8 >>> 2 >>> 0] = date.getHours();
          HEAP32[tmPtr + 12 >>> 2 >>> 0] = date.getDate();
          HEAP32[tmPtr + 16 >>> 2 >>> 0] = date.getMonth();
          HEAP32[tmPtr + 20 >>> 2 >>> 0] = date.getFullYear() - 1900;
          HEAP32[tmPtr + 24 >>> 2 >>> 0] = date.getDay();
          var yday = ydayFromDate(date) | 0;
          HEAP32[tmPtr + 28 >>> 2 >>> 0] = yday;
          HEAP32[tmPtr + 36 >>> 2 >>> 0] = -(date.getTimezoneOffset() * 60);
          var start = new Date(date.getFullYear(), 0, 1);
          var summerOffset = new Date(date.getFullYear(), 6, 1).getTimezoneOffset();
          var winterOffset = start.getTimezoneOffset();
          var dst = (summerOffset != winterOffset && date.getTimezoneOffset() == Math.min(winterOffset, summerOffset)) | 0;
          HEAP32[tmPtr + 32 >>> 2 >>> 0] = dst;
        }
        var setTempRet0 = (val) => __emscripten_tempret_set(val);
        var __mktime_js = function(tmPtr) {
          tmPtr >>>= 0;
          var ret = (() => {
            var date = new Date(
              HEAP32[tmPtr + 20 >>> 2 >>> 0] + 1900,
              HEAP32[tmPtr + 16 >>> 2 >>> 0],
              HEAP32[tmPtr + 12 >>> 2 >>> 0],
              HEAP32[tmPtr + 8 >>> 2 >>> 0],
              HEAP32[tmPtr + 4 >>> 2 >>> 0],
              HEAP32[tmPtr >>> 2 >>> 0],
              0
            );
            var dst = HEAP32[tmPtr + 32 >>> 2 >>> 0];
            var guessedOffset = date.getTimezoneOffset();
            var start = new Date(date.getFullYear(), 0, 1);
            var summerOffset = new Date(
              date.getFullYear(),
              6,
              1
            ).getTimezoneOffset();
            var winterOffset = start.getTimezoneOffset();
            var dstOffset = Math.min(winterOffset, summerOffset);
            if (dst < 0) {
              HEAP32[tmPtr + 32 >>> 2 >>> 0] = Number(
                summerOffset != winterOffset && dstOffset == guessedOffset
              );
            } else if (dst > 0 != (dstOffset == guessedOffset)) {
              var nonDstOffset = Math.max(winterOffset, summerOffset);
              var trueOffset = dst > 0 ? dstOffset : nonDstOffset;
              date.setTime(date.getTime() + (trueOffset - guessedOffset) * 6e4);
            }
            HEAP32[tmPtr + 24 >>> 2 >>> 0] = date.getDay();
            var yday = ydayFromDate(date) | 0;
            HEAP32[tmPtr + 28 >>> 2 >>> 0] = yday;
            HEAP32[tmPtr >>> 2 >>> 0] = date.getSeconds();
            HEAP32[tmPtr + 4 >>> 2 >>> 0] = date.getMinutes();
            HEAP32[tmPtr + 8 >>> 2 >>> 0] = date.getHours();
            HEAP32[tmPtr + 12 >>> 2 >>> 0] = date.getDate();
            HEAP32[tmPtr + 16 >>> 2 >>> 0] = date.getMonth();
            HEAP32[tmPtr + 20 >>> 2 >>> 0] = date.getYear();
            var timeMs = date.getTime();
            if (isNaN(timeMs)) {
              return -1;
            }
            return timeMs / 1e3;
          })();
          return setTempRet0(
            (tempDouble = ret, +Math.abs(tempDouble) >= 1 ? tempDouble > 0 ? +Math.floor(tempDouble / 4294967296) >>> 0 : ~~+Math.ceil(
              (tempDouble - +(~~tempDouble >>> 0)) / 4294967296
            ) >>> 0 : 0)
          ), ret >>> 0;
        };
        function __mmap_js(len, prot, flags, fd, offset_low, offset_high, allocated, addr) {
          len >>>= 0;
          var offset = convertI32PairToI53Checked(offset_low, offset_high);
          allocated >>>= 0;
          addr >>>= 0;
          return -52;
        }
        function __munmap_js(addr, len, prot, flags, fd, offset_low, offset_high) {
          addr >>>= 0;
          len >>>= 0;
          var offset = convertI32PairToI53Checked(offset_low, offset_high);
        }
        var __tzset_js = function(timezone, daylight, std_name, dst_name) {
          timezone >>>= 0;
          daylight >>>= 0;
          std_name >>>= 0;
          dst_name >>>= 0;
          var currentYear = (/* @__PURE__ */ new Date()).getFullYear();
          var winter = new Date(currentYear, 0, 1);
          var summer = new Date(currentYear, 6, 1);
          var winterOffset = winter.getTimezoneOffset();
          var summerOffset = summer.getTimezoneOffset();
          var stdTimezoneOffset = Math.max(winterOffset, summerOffset);
          HEAPU32[timezone >>> 2 >>> 0] = stdTimezoneOffset * 60;
          HEAP32[daylight >>> 2 >>> 0] = Number(winterOffset != summerOffset);
          var extractZone = (date) => date.toLocaleTimeString(void 0, {
            hour12: false,
            timeZoneName: "short"
          }).split(" ")[1];
          var winterName = extractZone(winter);
          var summerName = extractZone(summer);
          if (summerOffset < winterOffset) {
            stringToUTF8(winterName, std_name, 17);
            stringToUTF8(summerName, dst_name, 17);
          } else {
            stringToUTF8(winterName, dst_name, 17);
            stringToUTF8(summerName, std_name, 17);
          }
        };
        var _abort = () => {
          abort("");
        };
        var readEmAsmArgsArray = [];
        var readEmAsmArgs = (sigPtr, buf) => {
          readEmAsmArgsArray.length = 0;
          var ch;
          while (ch = HEAPU8[sigPtr++ >>> 0]) {
            var wide = ch != 105;
            wide &= ch != 112;
            buf += wide && buf % 8 ? 4 : 0;
            readEmAsmArgsArray.push(
              ch == 112 ? HEAPU32[buf >>> 2 >>> 0] : ch == 105 ? HEAP32[buf >>> 2 >>> 0] : HEAPF64[buf >>> 3 >>> 0]
            );
            buf += wide ? 8 : 4;
          }
          return readEmAsmArgsArray;
        };
        var runEmAsmFunction = (code, sigPtr, argbuf) => {
          var args = readEmAsmArgs(sigPtr, argbuf);
          return ASM_CONSTS[code](...args);
        };
        function _emscripten_asm_const_int(code, sigPtr, argbuf) {
          code >>>= 0;
          sigPtr >>>= 0;
          argbuf >>>= 0;
          return runEmAsmFunction(code, sigPtr, argbuf);
        }
        var _emscripten_date_now = () => Date.now();
        var getHeapMax = () => 4294901760;
        function _emscripten_get_heap_max() {
          return getHeapMax();
        }
        var _emscripten_get_now;
        _emscripten_get_now = () => performance.now();
        var growMemory = (size) => {
          var b = wasmMemory.buffer;
          var pages = (size - b.byteLength + 65535) / 65536;
          try {
            wasmMemory.grow(pages);
            updateMemoryViews();
            return 1;
          } catch (e) {
          }
        };
        function _emscripten_resize_heap(requestedSize) {
          requestedSize >>>= 0;
          var oldSize = HEAPU8.length;
          var maxHeapSize = getHeapMax();
          if (requestedSize > maxHeapSize) {
            return false;
          }
          var alignUp = (x, multiple) => x + (multiple - x % multiple) % multiple;
          for (var cutDown = 1; cutDown <= 4; cutDown *= 2) {
            var overGrownHeapSize = oldSize * (1 + 0.2 / cutDown);
            overGrownHeapSize = Math.min(
              overGrownHeapSize,
              requestedSize + 100663296
            );
            var newSize = Math.min(
              maxHeapSize,
              alignUp(Math.max(requestedSize, overGrownHeapSize), 65536)
            );
            var replacement = growMemory(newSize);
            if (replacement) {
              return true;
            }
          }
          return false;
        }
        var ENV = {};
        var getExecutableName = () => thisProgram || "./this.program";
        var getEnvStrings = () => {
          if (!getEnvStrings.strings) {
            var lang = (typeof navigator == "object" && navigator.languages && navigator.languages[0] || "C").replace("-", "_") + ".UTF-8";
            var env3 = {
              USER: "web_user",
              LOGNAME: "web_user",
              PATH: "/",
              PWD: "/",
              HOME: "/home/web_user",
              LANG: lang,
              _: getExecutableName()
            };
            for (var x in ENV) {
              if (ENV[x] === void 0)
                delete env3[x];
              else
                env3[x] = ENV[x];
            }
            var strings = [];
            for (var x in env3) {
              strings.push(`${x}=${env3[x]}`);
            }
            getEnvStrings.strings = strings;
          }
          return getEnvStrings.strings;
        };
        var stringToAscii = (str, buffer) => {
          for (var i = 0; i < str.length; ++i) {
            HEAP8[buffer++ >>> 0] = str.charCodeAt(i);
          }
          HEAP8[buffer >>> 0] = 0;
        };
        var _environ_get = function(__environ, environ_buf) {
          __environ >>>= 0;
          environ_buf >>>= 0;
          var bufSize = 0;
          getEnvStrings().forEach((string, i) => {
            var ptr = environ_buf + bufSize;
            HEAPU32[__environ + i * 4 >>> 2 >>> 0] = ptr;
            stringToAscii(string, ptr);
            bufSize += string.length + 1;
          });
          return 0;
        };
        var _environ_sizes_get = function(penviron_count, penviron_buf_size) {
          penviron_count >>>= 0;
          penviron_buf_size >>>= 0;
          var strings = getEnvStrings();
          HEAPU32[penviron_count >>> 2 >>> 0] = strings.length;
          var bufSize = 0;
          strings.forEach((string) => bufSize += string.length + 1);
          HEAPU32[penviron_buf_size >>> 2 >>> 0] = bufSize;
          return 0;
        };
        var _fd_close = (fd) => 52;
        function _fd_read(fd, iov, iovcnt, pnum) {
          iov >>>= 0;
          iovcnt >>>= 0;
          pnum >>>= 0;
          return 52;
        }
        function _fd_seek(fd, offset_low, offset_high, whence, newOffset) {
          var offset = convertI32PairToI53Checked(offset_low, offset_high);
          newOffset >>>= 0;
          return 70;
        }
        var printCharBuffers = [null, [], []];
        var printChar = (stream, curr) => {
          var buffer = printCharBuffers[stream];
          if (curr === 0 || curr === 10) {
            (stream === 1 ? out : err)(UTF8ArrayToString(buffer, 0));
            buffer.length = 0;
          } else {
            buffer.push(curr);
          }
        };
        function _fd_write(fd, iov, iovcnt, pnum) {
          iov >>>= 0;
          iovcnt >>>= 0;
          pnum >>>= 0;
          var num = 0;
          for (var i = 0; i < iovcnt; i++) {
            var ptr = HEAPU32[iov >>> 2 >>> 0];
            var len = HEAPU32[iov + 4 >>> 2 >>> 0];
            iov += 8;
            for (var j = 0; j < len; j++) {
              printChar(fd, HEAPU8[ptr + j >>> 0]);
            }
            num += len;
          }
          HEAPU32[pnum >>> 2 >>> 0] = num;
          return 0;
        }
        var arraySum = (array, index) => {
          var sum = 0;
          for (var i = 0; i <= index; sum += array[i++]) {
          }
          return sum;
        };
        var MONTH_DAYS_LEAP = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var MONTH_DAYS_REGULAR = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
        var addDays = (date, days) => {
          var newDate = new Date(date.getTime());
          while (days > 0) {
            var leap = isLeapYear(newDate.getFullYear());
            var currentMonth = newDate.getMonth();
            var daysInCurrentMonth = (leap ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR)[currentMonth];
            if (days > daysInCurrentMonth - newDate.getDate()) {
              days -= daysInCurrentMonth - newDate.getDate() + 1;
              newDate.setDate(1);
              if (currentMonth < 11) {
                newDate.setMonth(currentMonth + 1);
              } else {
                newDate.setMonth(0);
                newDate.setFullYear(newDate.getFullYear() + 1);
              }
            } else {
              newDate.setDate(newDate.getDate() + days);
              return newDate;
            }
          }
          return newDate;
        };
        function intArrayFromString(stringy, dontAddNull, length) {
          var len = length > 0 ? length : lengthBytesUTF8(stringy) + 1;
          var u8array = new Array(len);
          var numBytesWritten = stringToUTF8Array(
            stringy,
            u8array,
            0,
            u8array.length
          );
          if (dontAddNull)
            u8array.length = numBytesWritten;
          return u8array;
        }
        var writeArrayToMemory = (array, buffer) => {
          HEAP8.set(array, buffer >>> 0);
        };
        function _strftime(s, maxsize, format, tm) {
          s >>>= 0;
          maxsize >>>= 0;
          format >>>= 0;
          tm >>>= 0;
          var tm_zone = HEAPU32[tm + 40 >>> 2 >>> 0];
          var date = {
            tm_sec: HEAP32[tm >>> 2 >>> 0],
            tm_min: HEAP32[tm + 4 >>> 2 >>> 0],
            tm_hour: HEAP32[tm + 8 >>> 2 >>> 0],
            tm_mday: HEAP32[tm + 12 >>> 2 >>> 0],
            tm_mon: HEAP32[tm + 16 >>> 2 >>> 0],
            tm_year: HEAP32[tm + 20 >>> 2 >>> 0],
            tm_wday: HEAP32[tm + 24 >>> 2 >>> 0],
            tm_yday: HEAP32[tm + 28 >>> 2 >>> 0],
            tm_isdst: HEAP32[tm + 32 >>> 2 >>> 0],
            tm_gmtoff: HEAP32[tm + 36 >>> 2 >>> 0],
            tm_zone: tm_zone ? UTF8ToString(tm_zone) : ""
          };
          var pattern = UTF8ToString(format);
          var EXPANSION_RULES_1 = {
            "%c": "%a %b %d %H:%M:%S %Y",
            "%D": "%m/%d/%y",
            "%F": "%Y-%m-%d",
            "%h": "%b",
            "%r": "%I:%M:%S %p",
            "%R": "%H:%M",
            "%T": "%H:%M:%S",
            "%x": "%m/%d/%y",
            "%X": "%H:%M:%S",
            "%Ec": "%c",
            "%EC": "%C",
            "%Ex": "%m/%d/%y",
            "%EX": "%H:%M:%S",
            "%Ey": "%y",
            "%EY": "%Y",
            "%Od": "%d",
            "%Oe": "%e",
            "%OH": "%H",
            "%OI": "%I",
            "%Om": "%m",
            "%OM": "%M",
            "%OS": "%S",
            "%Ou": "%u",
            "%OU": "%U",
            "%OV": "%V",
            "%Ow": "%w",
            "%OW": "%W",
            "%Oy": "%y"
          };
          for (var rule in EXPANSION_RULES_1) {
            pattern = pattern.replace(
              new RegExp(rule, "g"),
              EXPANSION_RULES_1[rule]
            );
          }
          var WEEKDAYS = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday"
          ];
          var MONTHS = [
            "January",
            "February",
            "March",
            "April",
            "May",
            "June",
            "July",
            "August",
            "September",
            "October",
            "November",
            "December"
          ];
          function leadingSomething(value, digits, character) {
            var str = typeof value == "number" ? value.toString() : value || "";
            while (str.length < digits) {
              str = character[0] + str;
            }
            return str;
          }
          function leadingNulls(value, digits) {
            return leadingSomething(value, digits, "0");
          }
          function compareByDay(date1, date2) {
            function sgn(value) {
              return value < 0 ? -1 : value > 0 ? 1 : 0;
            }
            var compare;
            if ((compare = sgn(date1.getFullYear() - date2.getFullYear())) === 0) {
              if ((compare = sgn(date1.getMonth() - date2.getMonth())) === 0) {
                compare = sgn(date1.getDate() - date2.getDate());
              }
            }
            return compare;
          }
          function getFirstWeekStartDate(janFourth) {
            switch (janFourth.getDay()) {
              case 0:
                return new Date(janFourth.getFullYear() - 1, 11, 29);
              case 1:
                return janFourth;
              case 2:
                return new Date(janFourth.getFullYear(), 0, 3);
              case 3:
                return new Date(janFourth.getFullYear(), 0, 2);
              case 4:
                return new Date(janFourth.getFullYear(), 0, 1);
              case 5:
                return new Date(janFourth.getFullYear() - 1, 11, 31);
              case 6:
                return new Date(janFourth.getFullYear() - 1, 11, 30);
            }
          }
          function getWeekBasedYear(date2) {
            var thisDate = addDays(
              new Date(date2.tm_year + 1900, 0, 1),
              date2.tm_yday
            );
            var janFourthThisYear = new Date(thisDate.getFullYear(), 0, 4);
            var janFourthNextYear = new Date(thisDate.getFullYear() + 1, 0, 4);
            var firstWeekStartThisYear = getFirstWeekStartDate(janFourthThisYear);
            var firstWeekStartNextYear = getFirstWeekStartDate(janFourthNextYear);
            if (compareByDay(firstWeekStartThisYear, thisDate) <= 0) {
              if (compareByDay(firstWeekStartNextYear, thisDate) <= 0) {
                return thisDate.getFullYear() + 1;
              }
              return thisDate.getFullYear();
            }
            return thisDate.getFullYear() - 1;
          }
          var EXPANSION_RULES_2 = {
            "%a": (date2) => WEEKDAYS[date2.tm_wday].substring(0, 3),
            "%A": (date2) => WEEKDAYS[date2.tm_wday],
            "%b": (date2) => MONTHS[date2.tm_mon].substring(0, 3),
            "%B": (date2) => MONTHS[date2.tm_mon],
            "%C": (date2) => {
              var year = date2.tm_year + 1900;
              return leadingNulls(year / 100 | 0, 2);
            },
            "%d": (date2) => leadingNulls(date2.tm_mday, 2),
            "%e": (date2) => leadingSomething(date2.tm_mday, 2, " "),
            "%g": (date2) => getWeekBasedYear(date2).toString().substring(2),
            "%G": getWeekBasedYear,
            "%H": (date2) => leadingNulls(date2.tm_hour, 2),
            "%I": (date2) => {
              var twelveHour = date2.tm_hour;
              if (twelveHour == 0)
                twelveHour = 12;
              else if (twelveHour > 12)
                twelveHour -= 12;
              return leadingNulls(twelveHour, 2);
            },
            "%j": (date2) => leadingNulls(
              date2.tm_mday + arraySum(
                isLeapYear(date2.tm_year + 1900) ? MONTH_DAYS_LEAP : MONTH_DAYS_REGULAR,
                date2.tm_mon - 1
              ),
              3
            ),
            "%m": (date2) => leadingNulls(date2.tm_mon + 1, 2),
            "%M": (date2) => leadingNulls(date2.tm_min, 2),
            "%n": () => "\n",
            "%p": (date2) => {
              if (date2.tm_hour >= 0 && date2.tm_hour < 12) {
                return "AM";
              }
              return "PM";
            },
            "%S": (date2) => leadingNulls(date2.tm_sec, 2),
            "%t": () => "	",
            "%u": (date2) => date2.tm_wday || 7,
            "%U": (date2) => {
              var days = date2.tm_yday + 7 - date2.tm_wday;
              return leadingNulls(Math.floor(days / 7), 2);
            },
            "%V": (date2) => {
              var val = Math.floor(
                (date2.tm_yday + 7 - (date2.tm_wday + 6) % 7) / 7
              );
              if ((date2.tm_wday + 371 - date2.tm_yday - 2) % 7 <= 2) {
                val++;
              }
              if (!val) {
                val = 52;
                var dec31 = (date2.tm_wday + 7 - date2.tm_yday - 1) % 7;
                if (dec31 == 4 || dec31 == 5 && isLeapYear(date2.tm_year % 400 - 1)) {
                  val++;
                }
              } else if (val == 53) {
                var jan1 = (date2.tm_wday + 371 - date2.tm_yday) % 7;
                if (jan1 != 4 && (jan1 != 3 || !isLeapYear(date2.tm_year)))
                  val = 1;
              }
              return leadingNulls(val, 2);
            },
            "%w": (date2) => date2.tm_wday,
            "%W": (date2) => {
              var days = date2.tm_yday + 7 - (date2.tm_wday + 6) % 7;
              return leadingNulls(Math.floor(days / 7), 2);
            },
            "%y": (date2) => (date2.tm_year + 1900).toString().substring(2),
            "%Y": (date2) => date2.tm_year + 1900,
            "%z": (date2) => {
              var off = date2.tm_gmtoff;
              var ahead = off >= 0;
              off = Math.abs(off) / 60;
              off = off / 60 * 100 + off % 60;
              return (ahead ? "+" : "-") + String("0000" + off).slice(-4);
            },
            "%Z": (date2) => date2.tm_zone,
            "%%": () => "%"
          };
          pattern = pattern.replace(/%%/g, "\0\0");
          for (var rule in EXPANSION_RULES_2) {
            if (pattern.includes(rule)) {
              pattern = pattern.replace(
                new RegExp(rule, "g"),
                EXPANSION_RULES_2[rule](date)
              );
            }
          }
          pattern = pattern.replace(/\0\0/g, "%");
          var bytes = intArrayFromString(pattern, false);
          if (bytes.length > maxsize) {
            return 0;
          }
          writeArrayToMemory(bytes, s);
          return bytes.length - 1;
        }
        function _strftime_l(s, maxsize, format, tm, loc) {
          s >>>= 0;
          maxsize >>>= 0;
          format >>>= 0;
          tm >>>= 0;
          loc >>>= 0;
          return _strftime(s, maxsize, format, tm);
        }
        var stackAlloc = (sz) => __emscripten_stack_alloc(sz);
        var wasmImports = {
          a: ___cxa_throw,
          d: ___syscall_fcntl64,
          j: ___syscall_fstat64,
          z: ___syscall_getcwd,
          C: ___syscall_getdents64,
          t: ___syscall_ioctl,
          I: ___syscall_lstat64,
          E: ___syscall_mkdirat,
          H: ___syscall_newfstatat,
          i: ___syscall_openat,
          A: ___syscall_readlinkat,
          x: ___syscall_rmdir,
          J: ___syscall_stat64,
          y: ___syscall_unlinkat,
          k: __emscripten_get_now_is_monotonic,
          D: __emscripten_memcpy_js,
          n: __gmtime_js,
          o: __localtime_js,
          p: __mktime_js,
          l: __mmap_js,
          m: __munmap_js,
          v: __tzset_js,
          c: _abort,
          B: _emscripten_asm_const_int,
          f: _emscripten_date_now,
          w: _emscripten_get_heap_max,
          b: _emscripten_get_now,
          u: _emscripten_resize_heap,
          F: _environ_get,
          G: _environ_sizes_get,
          e: _fd_close,
          h: _fd_read,
          q: _fd_seek,
          g: _fd_write,
          r: _strftime,
          s: _strftime_l
        };
        var wasmExports = createWasm();
        var ___wasm_call_ctors = () => (___wasm_call_ctors = wasmExports["L"])();
        var _OrtInit = Module["_OrtInit"] = (a0, a1) => (_OrtInit = Module["_OrtInit"] = wasmExports["M"])(a0, a1);
        var _OrtGetLastError = Module["_OrtGetLastError"] = (a0, a1) => (_OrtGetLastError = Module["_OrtGetLastError"] = wasmExports["N"])(
          a0,
          a1
        );
        var _OrtCreateSessionOptions = Module["_OrtCreateSessionOptions"] = (a0, a1, a2, a3, a4, a5, a6, a7, a8, a9) => (_OrtCreateSessionOptions = Module["_OrtCreateSessionOptions"] = wasmExports["O"])(a0, a1, a2, a3, a4, a5, a6, a7, a8, a9);
        var _OrtAppendExecutionProvider = Module["_OrtAppendExecutionProvider"] = (a0, a1) => (_OrtAppendExecutionProvider = Module["_OrtAppendExecutionProvider"] = wasmExports["P"])(a0, a1);
        var _OrtAddFreeDimensionOverride = Module["_OrtAddFreeDimensionOverride"] = (a0, a1, a2) => (_OrtAddFreeDimensionOverride = Module["_OrtAddFreeDimensionOverride"] = wasmExports["Q"])(a0, a1, a2);
        var _OrtAddSessionConfigEntry = Module["_OrtAddSessionConfigEntry"] = (a0, a1, a2) => (_OrtAddSessionConfigEntry = Module["_OrtAddSessionConfigEntry"] = wasmExports["R"])(a0, a1, a2);
        var _OrtReleaseSessionOptions = Module["_OrtReleaseSessionOptions"] = (a0) => (_OrtReleaseSessionOptions = Module["_OrtReleaseSessionOptions"] = wasmExports["S"])(a0);
        var _OrtCreateSession = Module["_OrtCreateSession"] = (a0, a1, a2) => (_OrtCreateSession = Module["_OrtCreateSession"] = wasmExports["T"])(
          a0,
          a1,
          a2
        );
        var _OrtReleaseSession = Module["_OrtReleaseSession"] = (a0) => (_OrtReleaseSession = Module["_OrtReleaseSession"] = wasmExports["U"])(
          a0
        );
        var _OrtGetInputOutputCount = Module["_OrtGetInputOutputCount"] = (a0, a1, a2) => (_OrtGetInputOutputCount = Module["_OrtGetInputOutputCount"] = wasmExports["V"])(a0, a1, a2);
        var _OrtGetInputName = Module["_OrtGetInputName"] = (a0, a1) => (_OrtGetInputName = Module["_OrtGetInputName"] = wasmExports["W"])(
          a0,
          a1
        );
        var _OrtGetOutputName = Module["_OrtGetOutputName"] = (a0, a1) => (_OrtGetOutputName = Module["_OrtGetOutputName"] = wasmExports["X"])(
          a0,
          a1
        );
        var _OrtFree = Module["_OrtFree"] = (a0) => (_OrtFree = Module["_OrtFree"] = wasmExports["Y"])(a0);
        var _OrtCreateTensor = Module["_OrtCreateTensor"] = (a0, a1, a2, a3, a4, a5) => (_OrtCreateTensor = Module["_OrtCreateTensor"] = wasmExports["Z"])(
          a0,
          a1,
          a2,
          a3,
          a4,
          a5
        );
        var _OrtGetTensorData = Module["_OrtGetTensorData"] = (a0, a1, a2, a3, a4) => (_OrtGetTensorData = Module["_OrtGetTensorData"] = wasmExports["_"])(
          a0,
          a1,
          a2,
          a3,
          a4
        );
        var _OrtReleaseTensor = Module["_OrtReleaseTensor"] = (a0) => (_OrtReleaseTensor = Module["_OrtReleaseTensor"] = wasmExports["$"])(a0);
        var _OrtCreateRunOptions = Module["_OrtCreateRunOptions"] = (a0, a1, a2, a3) => (_OrtCreateRunOptions = Module["_OrtCreateRunOptions"] = wasmExports["aa"])(a0, a1, a2, a3);
        var _OrtAddRunConfigEntry = Module["_OrtAddRunConfigEntry"] = (a0, a1, a2) => (_OrtAddRunConfigEntry = Module["_OrtAddRunConfigEntry"] = wasmExports["ba"])(a0, a1, a2);
        var _OrtReleaseRunOptions = Module["_OrtReleaseRunOptions"] = (a0) => (_OrtReleaseRunOptions = Module["_OrtReleaseRunOptions"] = wasmExports["ca"])(a0);
        var _OrtCreateBinding = Module["_OrtCreateBinding"] = (a0) => (_OrtCreateBinding = Module["_OrtCreateBinding"] = wasmExports["da"])(
          a0
        );
        var _OrtBindInput = Module["_OrtBindInput"] = (a0, a1, a2) => (_OrtBindInput = Module["_OrtBindInput"] = wasmExports["ea"])(
          a0,
          a1,
          a2
        );
        var _OrtBindOutput = Module["_OrtBindOutput"] = (a0, a1, a2, a3) => (_OrtBindOutput = Module["_OrtBindOutput"] = wasmExports["fa"])(
          a0,
          a1,
          a2,
          a3
        );
        var _OrtClearBoundOutputs = Module["_OrtClearBoundOutputs"] = (a0) => (_OrtClearBoundOutputs = Module["_OrtClearBoundOutputs"] = wasmExports["ga"])(a0);
        var _OrtReleaseBinding = Module["_OrtReleaseBinding"] = (a0) => (_OrtReleaseBinding = Module["_OrtReleaseBinding"] = wasmExports["ha"])(
          a0
        );
        var _OrtRunWithBinding = Module["_OrtRunWithBinding"] = (a0, a1, a2, a3, a4) => (_OrtRunWithBinding = Module["_OrtRunWithBinding"] = wasmExports["ia"])(
          a0,
          a1,
          a2,
          a3,
          a4
        );
        var _OrtRun = Module["_OrtRun"] = (a0, a1, a2, a3, a4, a5, a6, a7) => (_OrtRun = Module["_OrtRun"] = wasmExports["ja"])(
          a0,
          a1,
          a2,
          a3,
          a4,
          a5,
          a6,
          a7
        );
        var _OrtEndProfiling = Module["_OrtEndProfiling"] = (a0) => (_OrtEndProfiling = Module["_OrtEndProfiling"] = wasmExports["ka"])(a0);
        var _malloc = Module["_malloc"] = (a0) => (_malloc = Module["_malloc"] = wasmExports["la"])(a0);
        var _free = Module["_free"] = (a0) => (_free = Module["_free"] = wasmExports["ma"])(a0);
        var __emscripten_tempret_set = (a0) => (__emscripten_tempret_set = wasmExports["oa"])(a0);
        var __emscripten_stack_restore = (a0) => (__emscripten_stack_restore = wasmExports["pa"])(a0);
        var __emscripten_stack_alloc = (a0) => (__emscripten_stack_alloc = wasmExports["qa"])(a0);
        var _emscripten_stack_get_current = () => (_emscripten_stack_get_current = wasmExports["ra"])();
        var ___cxa_increment_exception_refcount = (a0) => (___cxa_increment_exception_refcount = wasmExports["__cxa_increment_exception_refcount"])(a0);
        var ___cxa_is_pointer_type = (a0) => (___cxa_is_pointer_type = wasmExports["sa"])(a0);
        function applySignatureConversions(wasmExports2) {
          wasmExports2 = Object.assign({}, wasmExports2);
          var makeWrapper_pp = (f) => (a0) => f(a0) >>> 0;
          var makeWrapper_p = (f) => () => f() >>> 0;
          wasmExports2["la"] = makeWrapper_pp(wasmExports2["la"]);
          wasmExports2["qa"] = makeWrapper_pp(wasmExports2["qa"]);
          wasmExports2["ra"] = makeWrapper_p(wasmExports2["ra"]);
          return wasmExports2;
        }
        Module["stackSave"] = stackSave;
        Module["stackRestore"] = stackRestore;
        Module["stackAlloc"] = stackAlloc;
        Module["UTF8ToString"] = UTF8ToString;
        Module["stringToUTF8"] = stringToUTF8;
        Module["lengthBytesUTF8"] = lengthBytesUTF8;
        var calledRun;
        dependenciesFulfilled = function runCaller() {
          if (!calledRun)
            run3();
          if (!calledRun)
            dependenciesFulfilled = runCaller;
        };
        function run3() {
          if (runDependencies > 0) {
            return;
          }
          preRun();
          if (runDependencies > 0) {
            return;
          }
          function doRun() {
            if (calledRun)
              return;
            calledRun = true;
            Module["calledRun"] = true;
            if (ABORT)
              return;
            initRuntime2();
            readyPromiseResolve(Module);
            postRun();
          }
          {
            doRun();
          }
        }
        run3();
        return readyPromise;
      };
    })();
    if (typeof exports === "object" && typeof module === "object")
      module.exports = ortWasm;
    else if (typeof define === "function" && define["amd"])
      define([], () => ortWasm);
  }
});

// web/lib/wasm/wasm-factory.ts
var ortWasmFactory, ortWasmFactoryThreaded, wasm, initialized, initializing, aborted, isMultiThreadSupported, isSimdSupported, getWasmFileName, initializeWebAssembly, getInstance;
var init_wasm_factory = __esm({
  "web/lib/wasm/wasm-factory.ts"() {
    "use strict";
    if (false) {
      ortWasmFactory = null;
    } else {
      ortWasmFactory = true ? require_ort_wasm() : null;
    }
    ortWasmFactoryThreaded = false ? true ? null : null : ortWasmFactory;
    initialized = false;
    initializing = false;
    aborted = false;
    isMultiThreadSupported = (numThreads) => {
      if (numThreads === 1) {
        return false;
      }
      if (typeof SharedArrayBuffer === "undefined") {
        if (typeof self !== "undefined" && !self.crossOriginIsolated) {
          console.warn(
            "env.wasm.numThreads is set to " + numThreads + ", but this will not work unless you enable crossOriginIsolated mode. See https://web.dev/cross-origin-isolation-guide/ for more info."
          );
        }
        return false;
      }
      if (typeof process !== "undefined" && process.versions && process.versions.node) {
        console.warn(
          "env.wasm.numThreads is set to " + numThreads + ", however, currently onnxruntime-web does not support multi-threads in Node.js. Please consider using onnxruntime-node for performance critical scenarios."
        );
      }
      try {
        if (typeof MessageChannel !== "undefined") {
          new MessageChannel().port1.postMessage(new SharedArrayBuffer(1));
        }
        return WebAssembly.validate(new Uint8Array([
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
        ]));
      } catch (e) {
        return false;
      }
    };
    isSimdSupported = () => {
      try {
        return WebAssembly.validate(new Uint8Array([
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
        ]));
      } catch (e) {
        return false;
      }
    };
    getWasmFileName = (useSimd, useThreads) => {
      if (useSimd) {
        if (false) {
          return "ort-training-wasm-simd.wasm";
        }
        return useThreads ? "ort-wasm-simd-threaded.wasm" : "ort-wasm-simd.wasm";
      } else {
        return useThreads ? "ort-wasm-threaded.wasm" : "ort-wasm.wasm";
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
      const numThreads = flags.numThreads;
      const simd = flags.simd;
      const useThreads = isMultiThreadSupported(numThreads);
      const useSimd = simd && isSimdSupported();
      const wasmPaths = flags.wasmPaths;
      const wasmPrefixOverride = typeof wasmPaths === "string" ? wasmPaths : void 0;
      const wasmFileName = getWasmFileName(useSimd, useThreads);
      const wasmPathOverride = typeof wasmPaths === "object" ? wasmPaths[wasmFileName] : void 0;
      let isTimeout = false;
      const tasks = [];
      if (timeout > 0) {
        tasks.push(new Promise((resolve) => {
          setTimeout(() => {
            isTimeout = true;
            resolve();
          }, timeout);
        }));
      }
      tasks.push(new Promise((resolve, reject) => {
        const factory = useThreads ? ortWasmFactoryThreaded : ortWasmFactory;
        const config = {
          locateFile: (fileName, scriptDirectory) => {
            if (false) {
              return URL.createObjectURL(new Blob(
                [
                  // This require() function is handled by esbuild plugin to load file content as string.
                  // eslint-disable-next-line @typescript-eslint/no-require-imports
                  null
                ],
                { type: "text/javascript" }
              ));
            }
            if (fileName.endsWith(".wasm")) {
              if (wasmPathOverride) {
                return wasmPathOverride;
              }
              const prefix = wasmPrefixOverride ?? scriptDirectory;
              if (false) {
                if (wasmFileName === "ort-wasm-simd.wasm") {
                  return prefix + "ort-wasm-simd.jsep.wasm";
                } else if (wasmFileName === "ort-wasm-simd-threaded.wasm") {
                  return prefix + "ort-wasm-simd-threaded.jsep.wasm";
                }
              }
              return prefix + wasmFileName;
            }
            return scriptDirectory + fileName;
          }
        };
        if (false) {
          config.numThreads = numThreads;
          if (typeof Blob === "undefined") {
            config.mainScriptUrlOrBlob = join(__dirname, "ort-wasm-threaded.js");
          } else {
            const scriptSourceCode = `var ortWasmThreaded=${factory.toString()};`;
            config.mainScriptUrlOrBlob = new Blob([scriptSourceCode], { type: "text/javascript" });
          }
        }
        if (flags.instantiateWasm) {
          config.instantiateWasm = flags.instantiateWasm;
        }
        config.readyPromiseRejectWrapper = flags.readyPromiseRejectWrapper;
        factory(config).then(
          // wasm module initialized successfully
          (module) => {
            initializing = false;
            initialized = true;
            wasm = module;
            resolve();
          },
          // wasm module failed to initialize
          (what) => {
            initializing = false;
            aborted = true;
            reject(what);
          }
        );
      }));
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
        const paramsOffset = wasm2.stackAlloc(8);
        wasm2._OrtGetLastError(paramsOffset, paramsOffset + 4);
        const errorCode = wasm2.HEAP32[paramsOffset / 4];
        const errorMessagePointer = wasm2.HEAPU32[paramsOffset / 4 + 1];
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
      } catch (e) {
        if (runOptionsHandle !== 0) {
          wasm2._OrtReleaseRunOptions(runOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        throw e;
      }
    };
  }
});

// web/lib/wasm/session-options.ts
var getGraphOptimzationLevel, getExecutionMode, appendDefaultOptions, setExecutionProviders, setSessionOptions;
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
    setExecutionProviders = (sessionOptionsHandle, executionProviders, allocs) => {
      for (const ep of executionProviders) {
        let epName = typeof ep === "string" ? ep : ep.name;
        switch (epName) {
          case "webnn":
            epName = "WEBNN";
            if (typeof ep !== "string") {
              const webnnOptions = ep;
              if (webnnOptions?.deviceType) {
                const keyDataOffset = allocWasmString("deviceType", allocs);
                const valueDataOffset = allocWasmString(webnnOptions.deviceType, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(`Can't set a session config entry: 'deviceType' - ${webnnOptions.deviceType}.`);
                }
              }
              if (webnnOptions?.numThreads) {
                let numThreads = webnnOptions.numThreads;
                if (typeof numThreads != "number" || !Number.isInteger(numThreads) || numThreads < 0) {
                  numThreads = 0;
                }
                const keyDataOffset = allocWasmString("numThreads", allocs);
                const valueDataOffset = allocWasmString(numThreads.toString(), allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(`Can't set a session config entry: 'numThreads' - ${webnnOptions.numThreads}.`);
                }
              }
              if (webnnOptions?.powerPreference) {
                const keyDataOffset = allocWasmString("powerPreference", allocs);
                const valueDataOffset = allocWasmString(webnnOptions.powerPreference, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(
                    `Can't set a session config entry: 'powerPreference' - ${webnnOptions.powerPreference}.`
                  );
                }
              }
            }
            break;
          case "webgpu":
            epName = "JS";
            if (typeof ep !== "string") {
              const webgpuOptions = ep;
              if (webgpuOptions?.preferredLayout) {
                if (webgpuOptions.preferredLayout !== "NCHW" && webgpuOptions.preferredLayout !== "NHWC") {
                  throw new Error(`preferredLayout must be either 'NCHW' or 'NHWC': ${webgpuOptions.preferredLayout}`);
                }
                const keyDataOffset = allocWasmString("preferredLayout", allocs);
                const valueDataOffset = allocWasmString(webgpuOptions.preferredLayout, allocs);
                if (getInstance()._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
                  checkLastError(
                    `Can't set a session config entry: 'preferredLayout' - ${webgpuOptions.preferredLayout}.`
                  );
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
        if (getInstance()._OrtAppendExecutionProvider(sessionOptionsHandle, epNameDataOffset) !== 0) {
          checkLastError(`Can't append execution provider: ${epName}.`);
        }
      }
    };
    setSessionOptions = (options) => {
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
          setExecutionProviders(sessionOptionsHandle, sessionOptions.executionProviders, allocs);
        }
        if (sessionOptions.enableGraphCapture !== void 0) {
          if (typeof sessionOptions.enableGraphCapture !== "boolean") {
            throw new Error(`enableGraphCapture must be a boolean value: ${sessionOptions.enableGraphCapture}`);
          }
          const keyDataOffset = allocWasmString("enableGraphCapture", allocs);
          const valueDataOffset = allocWasmString(sessionOptions.enableGraphCapture.toString(), allocs);
          if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
            checkLastError(
              `Can't set a session config entry: 'enableGraphCapture' - ${sessionOptions.enableGraphCapture}.`
            );
          }
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
            const keyDataOffset = allocWasmString(key, allocs);
            const valueDataOffset = allocWasmString(value, allocs);
            if (wasm2._OrtAddSessionConfigEntry(sessionOptionsHandle, keyDataOffset, valueDataOffset) !== 0) {
              checkLastError(`Can't set a session config entry: ${key} - ${value}.`);
            }
          });
        }
        return [sessionOptionsHandle, allocs];
      } catch (e) {
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
        }
        allocs.forEach((alloc) => wasm2._free(alloc));
        throw e;
      }
    };
  }
});

// web/lib/wasm/wasm-common.ts
var tensorDataTypeStringToEnum, tensorDataTypeEnumToString, getTensorElementSize, tensorTypeToTypedArrayConstructor, logLevelStringToEnum, isGpuBufferSupportedType, dataLocationStringToEnum;
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
        default:
          throw new Error(`unsupported data type: ${typeProto}`);
      }
    };
    getTensorElementSize = (dateType) => [void 0, 4, 1, 1, 2, 2, 4, 8, void 0, 1, 2, 8, 4, 8, void 0, void 0, void 0][dateType];
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
    isGpuBufferSupportedType = (type) => type === "float32" || type === "float16" || type === "int32" || type === "int64" || type === "uint32" || type === "uint8" || type === "bool";
    dataLocationStringToEnum = (location) => {
      switch (location) {
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
        default:
          throw new Error(`unsupported data location: ${location}`);
      }
    };
  }
});

// nodejs-ignore:node:fs/promises
var readFile2;
var init_promises = __esm({
  "nodejs-ignore:node:fs/promises"() {
    readFile2 = void 0;
  }
});

// web/lib/wasm/wasm-utils-load-file.ts
var loadFile;
var init_wasm_utils_load_file = __esm({
  "web/lib/wasm/wasm-utils-load-file.ts"() {
    "use strict";
    init_fs();
    init_promises();
    loadFile = async (file) => {
      if (typeof file === "string") {
        if (typeof process !== "undefined" && process.versions && process.versions.node) {
          try {
            return new Uint8Array(await readFile2(file));
          } catch (e) {
            if (e.code === "ERR_FS_FILE_TOO_LARGE") {
              const stream = createReadStream(file);
              const chunks = [];
              for await (const chunk of stream) {
                chunks.push(chunk);
              }
              return new Uint8Array(Buffer.concat(chunks));
            }
            throw e;
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
            } catch (e) {
              if (e instanceof RangeError) {
                const pages = Math.ceil(fileSize / 65536);
                buffer = new WebAssembly.Memory({ initial: pages, maximum: pages }).buffer;
              } else {
                throw e;
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
var initOrt, initRuntime, initEp, activeSessions, getSessionInputOutputCount, copyFromExternalBuffer, createSession, releaseSession, prepareInputOutputTensor, run, endProfiling;
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
      if (false) {
        const initJsep = null.init;
        if (epName === "webgpu") {
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
          if (!env3.wasm.simd) {
            throw new Error(
              "Not supported for WebGPU=ON and SIMD=OFF. Please set `env.wasm.simd` to true when using `webgpu` EP"
            );
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
        const dataOffset = wasm2.stackAlloc(8);
        const errorCode = wasm2._OrtGetInputOutputCount(sessionHandle, dataOffset, dataOffset + 4);
        if (errorCode !== 0) {
          checkLastError("Can't get session input/output count.");
        }
        return [wasm2.HEAP32[dataOffset / 4], wasm2.HEAP32[dataOffset / 4 + 1]];
      } finally {
        wasm2.stackRestore(stack);
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
        [sessionOptionsHandle, allocs] = setSessionOptions(options);
        if (options?.externalData && wasm2.mountExternalData) {
          const loadingPromises = [];
          for (const file of options.externalData) {
            const path = typeof file === "string" ? file : file.path;
            loadingPromises.push(loadFile(typeof file === "string" ? file : file.data).then((data) => {
              wasm2.mountExternalData(path, data);
            }));
          }
          await Promise.all(loadingPromises);
        }
        sessionHandle = await wasm2._OrtCreateSession(modelDataOffset, modelDataLength, sessionOptionsHandle);
        if (sessionHandle === 0) {
          checkLastError("Can't create a session.");
        }
        const [inputCount, outputCount] = getSessionInputOutputCount(sessionHandle);
        const enableGraphCapture = !!options?.enableGraphCapture;
        const inputNames = [];
        const outputNames = [];
        const outputPreferredLocations = [];
        for (let i = 0; i < inputCount; i++) {
          const name = wasm2._OrtGetInputName(sessionHandle, i);
          if (name === 0) {
            checkLastError("Can't get an input name.");
          }
          inputNamesUTF8Encoded.push(name);
          inputNames.push(wasm2.UTF8ToString(name));
        }
        for (let i = 0; i < outputCount; i++) {
          const name = wasm2._OrtGetOutputName(sessionHandle, i);
          if (name === 0) {
            checkLastError("Can't get an output name.");
          }
          outputNamesUTF8Encoded.push(name);
          const nameString = wasm2.UTF8ToString(name);
          outputNames.push(nameString);
          if (false) {
            if (enableGraphCapture && options?.preferredOutputLocation === void 0) {
              outputPreferredLocations.push("gpu-buffer");
              continue;
            }
            const location = typeof options?.preferredOutputLocation === "string" ? options.preferredOutputLocation : options?.preferredOutputLocation?.[nameString] ?? "cpu";
            if (location !== "cpu" && location !== "cpu-pinned" && location !== "gpu-buffer") {
              throw new Error(`Not supported preferred output location: ${location}.`);
            }
            if (enableGraphCapture && location !== "gpu-buffer") {
              throw new Error(`Not supported preferred output location: ${location}. Only 'gpu-buffer' location is supported when enableGraphCapture is true.`);
            }
            outputPreferredLocations.push(location);
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
            outputPreferredLocationsEncoded: outputPreferredLocations.map((l) => dataLocationStringToEnum(l))
          };
        }
        activeSessions.set(
          sessionHandle,
          [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, bindingState, enableGraphCapture, false]
        );
        return [sessionHandle, inputNames, outputNames];
      } catch (e) {
        inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
        outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
        if (ioBindingHandle !== 0) {
          wasm2._OrtReleaseBinding(ioBindingHandle);
        }
        if (sessionHandle !== 0) {
          wasm2._OrtReleaseSession(sessionHandle);
        }
        throw e;
      } finally {
        wasm2._free(modelDataOffset);
        if (sessionOptionsHandle !== 0) {
          wasm2._OrtReleaseSessionOptions(sessionOptionsHandle);
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
          wasm2._OrtClearBoundOutputs(ioBindingState.handle);
        }
        wasm2._OrtReleaseBinding(ioBindingState.handle);
      }
      wasm2.jsepOnReleaseSession?.(sessionId);
      inputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      outputNamesUTF8Encoded.forEach((buf) => wasm2._OrtFree(buf));
      wasm2._OrtReleaseSession(sessionHandle);
      activeSessions.delete(sessionId);
    };
    prepareInputOutputTensor = (tensor, tensorHandles, allocs, sessionId, index, enableGraphCapture = false) => {
      if (!tensor) {
        tensorHandles.push(0);
        return;
      }
      const wasm2 = getInstance();
      const dataType = tensor[0];
      const dims = tensor[1];
      const location = tensor[3];
      let rawData;
      let dataByteLength;
      if (dataType === "string" && location === "gpu-buffer") {
        throw new Error("String tensor is not supported on GPU.");
      }
      if (enableGraphCapture && location !== "gpu-buffer") {
        throw new Error(
          `External buffer must be provided for input/output index ${index} when enableGraphCapture is true.`
        );
      }
      if (location === "gpu-buffer") {
        const gpuBuffer = tensor[2].gpuBuffer;
        const elementSizeInBytes = getTensorElementSize(tensorDataTypeStringToEnum(dataType));
        dataByteLength = dims.reduce((a, b) => a * b, 1) * elementSizeInBytes;
        const registerBuffer = wasm2.jsepRegisterBuffer;
        if (!registerBuffer) {
          throw new Error('Tensor location "gpu-buffer" is not supported without using WebGPU.');
        }
        rawData = registerBuffer(sessionId, index, gpuBuffer, dataByteLength);
      } else {
        const data = tensor[2];
        if (Array.isArray(data)) {
          dataByteLength = 4 * data.length;
          rawData = wasm2._malloc(dataByteLength);
          allocs.push(rawData);
          let dataIndex = rawData / 4;
          for (let i = 0; i < data.length; i++) {
            if (typeof data[i] !== "string") {
              throw new TypeError(`tensor data at index ${i} is not a string`);
            }
            wasm2.HEAPU32[dataIndex++] = allocWasmString(data[i], allocs);
          }
        } else {
          dataByteLength = data.byteLength;
          rawData = wasm2._malloc(dataByteLength);
          allocs.push(rawData);
          wasm2.HEAPU8.set(new Uint8Array(data.buffer, data.byteOffset, dataByteLength), rawData);
        }
      }
      const stack = wasm2.stackSave();
      const dimsOffset = wasm2.stackAlloc(4 * dims.length);
      try {
        let dimIndex = dimsOffset / 4;
        dims.forEach((d) => wasm2.HEAP32[dimIndex++] = d);
        const tensor2 = wasm2._OrtCreateTensor(
          tensorDataTypeStringToEnum(dataType),
          rawData,
          dataByteLength,
          dimsOffset,
          dims.length,
          dataLocationStringToEnum(location)
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
      const inputValuesOffset = wasm2.stackAlloc(inputCount * 4);
      const inputNamesOffset = wasm2.stackAlloc(inputCount * 4);
      const outputValuesOffset = wasm2.stackAlloc(outputCount * 4);
      const outputNamesOffset = wasm2.stackAlloc(outputCount * 4);
      try {
        [runOptionsHandle, runOptionsAllocs] = setRunOptions(options);
        for (let i = 0; i < inputCount; i++) {
          prepareInputOutputTensor(
            inputTensors[i],
            inputTensorHandles,
            inputOutputAllocs,
            sessionId,
            inputIndices[i],
            enableGraphCapture
          );
        }
        for (let i = 0; i < outputCount; i++) {
          prepareInputOutputTensor(
            outputTensors[i],
            outputTensorHandles,
            inputOutputAllocs,
            sessionId,
            inputCount + outputIndices[i],
            enableGraphCapture
          );
        }
        let inputValuesIndex = inputValuesOffset / 4;
        let inputNamesIndex = inputNamesOffset / 4;
        let outputValuesIndex = outputValuesOffset / 4;
        let outputNamesIndex = outputNamesOffset / 4;
        for (let i = 0; i < inputCount; i++) {
          wasm2.HEAPU32[inputValuesIndex++] = inputTensorHandles[i];
          wasm2.HEAPU32[inputNamesIndex++] = inputNamesUTF8Encoded[inputIndices[i]];
        }
        for (let i = 0; i < outputCount; i++) {
          wasm2.HEAPU32[outputValuesIndex++] = outputTensorHandles[i];
          wasm2.HEAPU32[outputNamesIndex++] = outputNamesUTF8Encoded[outputIndices[i]];
        }
        if (false) {
          const { handle, outputPreferredLocations, outputPreferredLocationsEncoded } = ioBindingState;
          if (inputNamesUTF8Encoded.length !== inputCount) {
            throw new Error(`input count from feeds (${inputCount}) is expected to be always equal to model's input count (${inputNamesUTF8Encoded.length}).`);
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
            const location = outputTensors[i]?.[3];
            if (location) {
              const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], outputTensorHandles[i], 0);
              if (errorCode2 !== 0) {
                checkLastError(`Can't bind pre-allocated output[${i}] for session=${sessionId}.`);
              }
            } else {
              const errorCode2 = wasm2._OrtBindOutput(handle, outputNamesUTF8Encoded[index], 0, outputPreferredLocationsEncoded[index]);
              if (errorCode2 !== 0) {
                checkLastError(`Can't bind output[${i}] to ${outputPreferredLocations[i]} for session=${sessionId}.`);
              }
            }
          }
          activeSessions.set(
            sessionId,
            [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture, true]
          );
        }
        wasm2.jsepOnRunStart?.(sessionHandle);
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
        for (let i = 0; i < outputCount; i++) {
          const tensor = wasm2.HEAPU32[outputValuesOffset / 4 + i];
          if (tensor === outputTensorHandles[i]) {
            output.push(outputTensors[i]);
            continue;
          }
          const beforeGetTensorDataStack = wasm2.stackSave();
          const tensorDataOffset = wasm2.stackAlloc(4 * 4);
          let keepOutputTensor = false;
          let type, dataOffset = 0;
          try {
            const errorCode2 = wasm2._OrtGetTensorData(
              tensor,
              tensorDataOffset,
              tensorDataOffset + 4,
              tensorDataOffset + 8,
              tensorDataOffset + 12
            );
            if (errorCode2 !== 0) {
              checkLastError(`Can't access output tensor data on index ${i}.`);
            }
            let tensorDataIndex = tensorDataOffset / 4;
            const dataType = wasm2.HEAPU32[tensorDataIndex++];
            dataOffset = wasm2.HEAPU32[tensorDataIndex++];
            const dimsOffset = wasm2.HEAPU32[tensorDataIndex++];
            const dimsLength = wasm2.HEAPU32[tensorDataIndex++];
            const dims = [];
            for (let i2 = 0; i2 < dimsLength; i2++) {
              dims.push(wasm2.HEAPU32[dimsOffset / 4 + i2]);
            }
            wasm2._OrtFree(dimsOffset);
            const size = dims.reduce((a, b) => a * b, 1);
            type = tensorDataTypeEnumToString(dataType);
            const preferredLocation = ioBindingState?.outputPreferredLocations[outputIndices[i]];
            if (type === "string") {
              if (preferredLocation === "gpu-buffer") {
                throw new Error("String tensor is not supported on GPU.");
              }
              const stringData = [];
              let dataIndex = dataOffset / 4;
              for (let i2 = 0; i2 < size; i2++) {
                const offset = wasm2.HEAPU32[dataIndex++];
                const maxBytesToRead = i2 === size - 1 ? void 0 : wasm2.HEAPU32[dataIndex] - offset;
                stringData.push(wasm2.UTF8ToString(offset, maxBytesToRead));
              }
              output.push([type, dims, stringData, "cpu"]);
            } else {
              if (preferredLocation === "gpu-buffer" && size > 0) {
                const getBuffer = wasm2.jsepGetBuffer;
                if (!getBuffer) {
                  throw new Error('preferredLocation "gpu-buffer" is not supported without using WebGPU.');
                }
                const gpuBuffer = getBuffer(dataOffset);
                const elementSize = getTensorElementSize(dataType);
                if (elementSize === void 0 || !isGpuBufferSupportedType(type)) {
                  throw new Error(`Unsupported data type: ${type}`);
                }
                keepOutputTensor = true;
                output.push([
                  type,
                  dims,
                  {
                    gpuBuffer,
                    download: wasm2.jsepCreateDownloader(gpuBuffer, size * elementSize, type),
                    dispose: () => {
                      wasm2._OrtReleaseTensor(tensor);
                    }
                  },
                  "gpu-buffer"
                ]);
              } else {
                const typedArrayConstructor = tensorTypeToTypedArrayConstructor(type);
                const data = new typedArrayConstructor(size);
                new Uint8Array(data.buffer, data.byteOffset, data.byteLength).set(wasm2.HEAPU8.subarray(dataOffset, dataOffset + data.byteLength));
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
          wasm2._OrtClearBoundOutputs(ioBindingState.handle);
          activeSessions.set(
            sessionId,
            [sessionHandle, inputNamesUTF8Encoded, outputNamesUTF8Encoded, ioBindingState, enableGraphCapture, false]
          );
        }
        return output;
      } finally {
        wasm2.stackRestore(beforeRunStack);
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
var initializing2, initialized2, aborted2, scriptSrc, initializeWebAssemblyAndOrtRuntime, initializeOrtEp, copyFromExternalBuffer2, createSession2, releaseSession2, run2, endProfiling2;
var init_proxy_wrapper = __esm({
  "web/lib/wasm/proxy-wrapper.ts"() {
    "use strict";
    init_esm();
    init_wasm_core_impl();
    init_wasm_factory();
    initializing2 = false;
    initialized2 = false;
    aborted2 = false;
    scriptSrc = typeof document !== "undefined" ? document?.currentScript?.src : void 0;
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
        if (env2.wasm.wasmPaths === void 0) {
          if (scriptSrc && scriptSrc.indexOf("blob:") !== 0) {
            env2.wasm.wasmPaths = scriptSrc.substr(0, +scriptSrc.lastIndexOf("/") + 1);
          }
        }
        return new Promise((resolve, reject) => {
          proxyWorker?.terminate();
          const workerUrl = URL.createObjectURL(new Blob(
            [
              // This require() function is handled by esbuild plugin to load file content as string.
              // eslint-disable-next-line @typescript-eslint/no-require-imports
              null
            ],
            { type: "text/javascript" }
          ));
          proxyWorker = new Worker(workerUrl, { name: "ort-wasm-proxy-worker" });
          proxyWorker.onerror = (ev) => reject(ev);
          proxyWorker.onmessage = onProxyWorkerMessage;
          URL.revokeObjectURL(workerUrl);
          initWasmCallbacks = [resolve, reject];
          const message = { type: "init-wasm", in: env2 };
          proxyWorker.postMessage(message);
        });
      } else {
        try {
          await initializeWebAssembly(env2.wasm);
          await initRuntime(env2);
          initialized2 = true;
        } catch (e) {
          aborted2 = true;
          throw e;
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
        if (inputs.some((t) => t[3] !== "cpu")) {
          throw new Error("input tensor on GPU is not supported for proxy.");
        }
        if (outputs.some((t) => t)) {
          throw new Error("pre-allocated output tensor is not supported for proxy.");
        }
        ensureWorker();
        return new Promise((resolve, reject) => {
          enqueueCallbacks("run", [resolve, reject]);
          const serializableInputs = inputs;
          const message = { type: "run", in: { sessionId, inputIndices, inputs: serializableInputs, outputIndices, options } };
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
    init_wasm_utils_load_file();
    encodeTensorMetadata = (tensor, getName) => {
      switch (tensor.location) {
        case "cpu":
          return [tensor.type, tensor.dims, tensor.data, "cpu"];
        case "gpu-buffer":
          return [tensor.type, tensor.dims, { gpuBuffer: tensor.gpuBuffer }, "gpu-buffer"];
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
          if (typeof process !== "undefined" && process.versions && process.versions.node) {
            model = await loadFile(pathOrBuffer);
          } else {
            model = await this.fetchModelAndCopyToWasmMemory(pathOrBuffer);
          }
        } else {
          model = pathOrBuffer;
        }
        [this.sessionId, this.inputNames, this.outputNames] = await createSession2(model, options);
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
        const inputs = inputArray.map((t, i) => encodeTensorMetadata(t, () => `input "${this.inputNames[inputIndices[i]]}"`));
        const outputs = outputArray.map(
          (t, i) => t ? encodeTensorMetadata(t, () => `output "${this.outputNames[outputIndices[i]]}"`) : null
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
var initializeFlags, OnnxruntimeWebAssemblyBackend;
var init_backend_wasm = __esm({
  "web/lib/backend-wasm.ts"() {
    "use strict";
    init_node_os();
    init_esm();
    init_proxy_wrapper();
    init_session_handler_inference();
    initializeFlags = () => {
      if (typeof env2.wasm.initTimeout !== "number" || env2.wasm.initTimeout < 0) {
        env2.wasm.initTimeout = 0;
      }
      if (typeof env2.wasm.simd !== "boolean") {
        env2.wasm.simd = true;
      }
      if (typeof env2.wasm.proxy !== "boolean") {
        env2.wasm.proxy = false;
      }
      if (typeof env2.wasm.trace !== "boolean") {
        env2.wasm.trace = false;
      }
      if (typeof env2.wasm.numThreads !== "number" || !Number.isInteger(env2.wasm.numThreads) || env2.wasm.numThreads <= 0) {
        if (typeof self !== "undefined" && !self.crossOriginIsolated || typeof process !== "undefined" && process.versions && process.versions.node) {
          env2.wasm.numThreads = 1;
        }
        const numCpuLogicalCores = typeof navigator === "undefined" ? cpus().length : navigator.hardwareConcurrency;
        env2.wasm.numThreads = Math.min(4, Math.ceil((numCpuLogicalCores || 1) / 2));
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
        return Promise.resolve(handler);
      }
    };
  }
});

// web/lib/backend-wasm-inference.ts
var backend_wasm_inference_exports = {};
__export(backend_wasm_inference_exports, {
  wasmBackend: () => wasmBackend
});
var wasmBackend;
var init_backend_wasm_inference = __esm({
  "web/lib/backend-wasm-inference.ts"() {
    "use strict";
    init_backend_wasm();
    wasmBackend = new OnnxruntimeWebAssemblyBackend();
  }
});

// web/lib/index.ts
init_esm();
init_esm();
init_esm();

// web/lib/version.ts
var version2 = "1.18.2";

// web/lib/index.ts
var lib_default = esm_exports;
if (false) {
  const onnxjsBackend = null.onnxjsBackend;
  registerBackend("webgl", onnxjsBackend, -10);
}
if (true) {
  const wasmBackend2 = true ? (init_backend_wasm_inference(), __toCommonJS(backend_wasm_inference_exports)).wasmBackend : null.wasmBackend;
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
  TrainingSession2 as TrainingSession,
  lib_default as default,
  env2 as env,
  registerBackend
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsiLi4vLi4vLi4vY29tbW9uL2xpYi9iYWNrZW5kLWltcGwudHMiLCAiLi4vLi4vLi4vY29tbW9uL2xpYi9iYWNrZW5kLnRzIiwgIi4uLy4uLy4uL2NvbW1vbi9saWIvdmVyc2lvbi50cyIsICIuLi8uLi8uLi9jb21tb24vbGliL2Vudi1pbXBsLnRzIiwgIi4uLy4uLy4uL2NvbW1vbi9saWIvZW52LnRzIiwgIi4uLy4uLy4uL2NvbW1vbi9saWIvdGVuc29yLWNvbnZlcnNpb24taW1wbC50cyIsICIuLi8uLi8uLi9jb21tb24vbGliL3RlbnNvci1mYWN0b3J5LWltcGwudHMiLCAiLi4vLi4vLi4vY29tbW9uL2xpYi90ZW5zb3ItaW1wbC10eXBlLW1hcHBpbmcudHMiLCAiLi4vLi4vLi4vY29tbW9uL2xpYi90ZW5zb3ItdXRpbHMtaW1wbC50cyIsICIuLi8uLi8uLi9jb21tb24vbGliL3RlbnNvci1pbXBsLnRzIiwgIi4uLy4uLy4uL2NvbW1vbi9saWIvdGVuc29yLnRzIiwgIi4uLy4uLy4uL2NvbW1vbi9saWIvdHJhY2UudHMiLCAiLi4vLi4vLi4vY29tbW9uL2xpYi9pbmZlcmVuY2Utc2Vzc2lvbi1pbXBsLnRzIiwgIi4uLy4uLy4uL2NvbW1vbi9saWIvaW5mZXJlbmNlLXNlc3Npb24udHMiLCAiLi4vLi4vLi4vY29tbW9uL2xpYi90ZW5zb3ItY29udmVyc2lvbi50cyIsICIuLi8uLi8uLi9jb21tb24vbGliL3RlbnNvci1mYWN0b3J5LnRzIiwgIi4uLy4uLy4uL2NvbW1vbi9saWIvb25ueC1tb2RlbC50cyIsICIuLi8uLi8uLi9jb21tb24vbGliL29ubngtdmFsdWUudHMiLCAiLi4vLi4vLi4vY29tbW9uL2xpYi90cmFpbmluZy1zZXNzaW9uLWltcGwudHMiLCAiLi4vLi4vLi4vY29tbW9uL2xpYi90cmFpbmluZy1zZXNzaW9uLnRzIiwgIi4uLy4uLy4uL2NvbW1vbi9saWIvaW5kZXgudHMiLCAibm9kZWpzLWlnbm9yZTpub2RlOm9zIiwgIm5vZGVqcy1pZ25vcmU6ZnMiLCAibm9kZWpzLWlnbm9yZTpwYXRoIiwgIi4uLy4uL2xpYi93YXNtL2JpbmRpbmcvb3J0LXdhc20uanMiLCAiLi4vLi4vbGliL3dhc20vd2FzbS1mYWN0b3J5LnRzIiwgIi4uLy4uL2xpYi93YXNtL3dhc20tdXRpbHMudHMiLCAiLi4vLi4vbGliL3dhc20vcnVuLW9wdGlvbnMudHMiLCAiLi4vLi4vbGliL3dhc20vc2Vzc2lvbi1vcHRpb25zLnRzIiwgIi4uLy4uL2xpYi93YXNtL3dhc20tY29tbW9uLnRzIiwgIm5vZGVqcy1pZ25vcmU6bm9kZTpmcy9wcm9taXNlcyIsICIuLi8uLi9saWIvd2FzbS93YXNtLXV0aWxzLWxvYWQtZmlsZS50cyIsICIuLi8uLi9saWIvd2FzbS93YXNtLWNvcmUtaW1wbC50cyIsICIuLi8uLi9saWIvd2FzbS9wcm94eS13cmFwcGVyLnRzIiwgIi4uLy4uL2xpYi93YXNtL3Nlc3Npb24taGFuZGxlci1pbmZlcmVuY2UudHMiLCAiLi4vLi4vbGliL2JhY2tlbmQtd2FzbS50cyIsICIuLi8uLi9saWIvYmFja2VuZC13YXNtLWluZmVyZW5jZS50cyIsICIuLi8uLi9saWIvaW5kZXgudHMiLCAiLi4vLi4vbGliL3ZlcnNpb24udHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXHJcblxyXG5pbXBvcnQge0JhY2tlbmR9IGZyb20gJy4vYmFja2VuZC5qcyc7XHJcbmltcG9ydCB7SW5mZXJlbmNlU2Vzc2lvbn0gZnJvbSAnLi9pbmZlcmVuY2Utc2Vzc2lvbi5qcyc7XHJcblxyXG5pbnRlcmZhY2UgQmFja2VuZEluZm8ge1xyXG4gIGJhY2tlbmQ6IEJhY2tlbmQ7XHJcbiAgcHJpb3JpdHk6IG51bWJlcjtcclxuXHJcbiAgaW5pdFByb21pc2U/OiBQcm9taXNlPHZvaWQ+O1xyXG4gIGluaXRpYWxpemVkPzogYm9vbGVhbjtcclxuICBhYm9ydGVkPzogYm9vbGVhbjtcclxuICBlcnJvcj86IHN0cmluZztcclxufVxyXG5cclxuY29uc3QgYmFja2VuZHM6IE1hcDxzdHJpbmcsIEJhY2tlbmRJbmZvPiA9IG5ldyBNYXAoKTtcclxuY29uc3QgYmFja2VuZHNTb3J0ZWRCeVByaW9yaXR5OiBzdHJpbmdbXSA9IFtdO1xyXG5cclxuLyoqXHJcbiAqIFJlZ2lzdGVyIGEgYmFja2VuZC5cclxuICpcclxuICogQHBhcmFtIG5hbWUgLSB0aGUgbmFtZSBhcyBhIGtleSB0byBsb29rdXAgYXMgYW4gZXhlY3V0aW9uIHByb3ZpZGVyLlxyXG4gKiBAcGFyYW0gYmFja2VuZCAtIHRoZSBiYWNrZW5kIG9iamVjdC5cclxuICogQHBhcmFtIHByaW9yaXR5IC0gYW4gaW50ZWdlciBpbmRpY2F0aW5nIHRoZSBwcmlvcml0eSBvZiB0aGUgYmFja2VuZC4gSGlnaGVyIG51bWJlciBtZWFucyBoaWdoZXIgcHJpb3JpdHkuIGlmIHByaW9yaXR5XHJcbiAqIDwgMCwgaXQgd2lsbCBiZSBjb25zaWRlcmVkIGFzIGEgJ2JldGEnIHZlcnNpb24gYW5kIHdpbGwgbm90IGJlIHVzZWQgYXMgYSBmYWxsYmFjayBiYWNrZW5kIGJ5IGRlZmF1bHQuXHJcbiAqXHJcbiAqIEBpZ25vcmVcclxuICovXHJcbmV4cG9ydCBjb25zdCByZWdpc3RlckJhY2tlbmQgPSAobmFtZTogc3RyaW5nLCBiYWNrZW5kOiBCYWNrZW5kLCBwcmlvcml0eTogbnVtYmVyKTogdm9pZCA9PiB7XHJcbiAgaWYgKGJhY2tlbmQgJiYgdHlwZW9mIGJhY2tlbmQuaW5pdCA9PT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgYmFja2VuZC5jcmVhdGVJbmZlcmVuY2VTZXNzaW9uSGFuZGxlciA9PT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgY29uc3QgY3VycmVudEJhY2tlbmQgPSBiYWNrZW5kcy5nZXQobmFtZSk7XHJcbiAgICBpZiAoY3VycmVudEJhY2tlbmQgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBiYWNrZW5kcy5zZXQobmFtZSwge2JhY2tlbmQsIHByaW9yaXR5fSk7XHJcbiAgICB9IGVsc2UgaWYgKGN1cnJlbnRCYWNrZW5kLnByaW9yaXR5ID4gcHJpb3JpdHkpIHtcclxuICAgICAgLy8gc2FtZSBuYW1lIGlzIGFscmVhZHkgcmVnaXN0ZXJlZCB3aXRoIGEgaGlnaGVyIHByaW9yaXR5LiBza2lwIHJlZ2lzdGVyYXRpb24uXHJcbiAgICAgIHJldHVybjtcclxuICAgIH0gZWxzZSBpZiAoY3VycmVudEJhY2tlbmQucHJpb3JpdHkgPT09IHByaW9yaXR5KSB7XHJcbiAgICAgIGlmIChjdXJyZW50QmFja2VuZC5iYWNrZW5kICE9PSBiYWNrZW5kKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBjYW5ub3QgcmVnaXN0ZXIgYmFja2VuZCBcIiR7bmFtZX1cIiB1c2luZyBwcmlvcml0eSAke3ByaW9yaXR5fWApO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHByaW9yaXR5ID49IDApIHtcclxuICAgICAgY29uc3QgaSA9IGJhY2tlbmRzU29ydGVkQnlQcmlvcml0eS5pbmRleE9mKG5hbWUpO1xyXG4gICAgICBpZiAoaSAhPT0gLTEpIHtcclxuICAgICAgICBiYWNrZW5kc1NvcnRlZEJ5UHJpb3JpdHkuc3BsaWNlKGksIDEpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGJhY2tlbmRzU29ydGVkQnlQcmlvcml0eS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgIGlmIChiYWNrZW5kcy5nZXQoYmFja2VuZHNTb3J0ZWRCeVByaW9yaXR5W2ldKSEucHJpb3JpdHkgPD0gcHJpb3JpdHkpIHtcclxuICAgICAgICAgIGJhY2tlbmRzU29ydGVkQnlQcmlvcml0eS5zcGxpY2UoaSwgMCwgbmFtZSk7XHJcbiAgICAgICAgICByZXR1cm47XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIGJhY2tlbmRzU29ydGVkQnlQcmlvcml0eS5wdXNoKG5hbWUpO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuXHJcbiAgdGhyb3cgbmV3IFR5cGVFcnJvcignbm90IGEgdmFsaWQgYmFja2VuZCcpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIFRyeSB0byByZXNvbHZlIGFuZCBpbml0aWFsaXplIGEgYmFja2VuZC5cclxuICpcclxuICogQHBhcmFtIGJhY2tlbmROYW1lIC0gdGhlIG5hbWUgb2YgdGhlIGJhY2tlbmQuXHJcbiAqIEByZXR1cm5zIHRoZSBiYWNrZW5kIGluc3RhbmNlIGlmIHJlc29sdmVkIGFuZCBpbml0aWFsaXplZCBzdWNjZXNzZnVsbHksIG9yIGFuIGVycm9yIG1lc3NhZ2UgaWYgZmFpbGVkLlxyXG4gKi9cclxuY29uc3QgdHJ5UmVzb2x2ZUFuZEluaXRpYWxpemVCYWNrZW5kID0gYXN5bmMoYmFja2VuZE5hbWU6IHN0cmluZyk6IFByb21pc2U8QmFja2VuZHxzdHJpbmc+ID0+IHtcclxuICBjb25zdCBiYWNrZW5kSW5mbyA9IGJhY2tlbmRzLmdldChiYWNrZW5kTmFtZSk7XHJcbiAgaWYgKCFiYWNrZW5kSW5mbykge1xyXG4gICAgcmV0dXJuICdiYWNrZW5kIG5vdCBmb3VuZC4nO1xyXG4gIH1cclxuXHJcbiAgaWYgKGJhY2tlbmRJbmZvLmluaXRpYWxpemVkKSB7XHJcbiAgICByZXR1cm4gYmFja2VuZEluZm8uYmFja2VuZDtcclxuICB9IGVsc2UgaWYgKGJhY2tlbmRJbmZvLmFib3J0ZWQpIHtcclxuICAgIHJldHVybiBiYWNrZW5kSW5mby5lcnJvciE7XHJcbiAgfSBlbHNlIHtcclxuICAgIGNvbnN0IGlzSW5pdGlhbGl6aW5nID0gISFiYWNrZW5kSW5mby5pbml0UHJvbWlzZTtcclxuICAgIHRyeSB7XHJcbiAgICAgIGlmICghaXNJbml0aWFsaXppbmcpIHtcclxuICAgICAgICBiYWNrZW5kSW5mby5pbml0UHJvbWlzZSA9IGJhY2tlbmRJbmZvLmJhY2tlbmQuaW5pdChiYWNrZW5kTmFtZSk7XHJcbiAgICAgIH1cclxuICAgICAgYXdhaXQgYmFja2VuZEluZm8uaW5pdFByb21pc2U7XHJcbiAgICAgIGJhY2tlbmRJbmZvLmluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgICAgcmV0dXJuIGJhY2tlbmRJbmZvLmJhY2tlbmQ7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGlmICghaXNJbml0aWFsaXppbmcpIHtcclxuICAgICAgICBiYWNrZW5kSW5mby5lcnJvciA9IGAke2V9YDtcclxuICAgICAgICBiYWNrZW5kSW5mby5hYm9ydGVkID0gdHJ1ZTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gYmFja2VuZEluZm8uZXJyb3IhO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgZGVsZXRlIGJhY2tlbmRJbmZvLmluaXRQcm9taXNlO1xyXG4gICAgfVxyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBSZXNvbHZlIGV4ZWN1dGlvbiBwcm92aWRlcnMgZnJvbSB0aGUgc3BlY2lmaWMgc2Vzc2lvbiBvcHRpb25zLlxyXG4gKlxyXG4gKiBAcGFyYW0gb3B0aW9ucyAtIHRoZSBzZXNzaW9uIG9wdGlvbnMgb2JqZWN0LlxyXG4gKiBAcmV0dXJucyBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIHR1cGxlIG9mIGFuIGluaXRpYWxpemVkIGJhY2tlbmQgaW5zdGFuY2UgYW5kIGEgc2Vzc2lvbiBvcHRpb25zIG9iamVjdCB3aXRoXHJcbiAqIGZpbHRlcmVkIEVQIGxpc3QuXHJcbiAqXHJcbiAqIEBpZ25vcmVcclxuICovXHJcbmV4cG9ydCBjb25zdCByZXNvbHZlQmFja2VuZEFuZEV4ZWN1dGlvblByb3ZpZGVycyA9IGFzeW5jKG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOlxyXG4gICAgUHJvbWlzZTxbYmFja2VuZDogQmFja2VuZCwgb3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9uc10+ID0+IHtcclxuICAgICAgLy8gZXh0cmFjdCBiYWNrZW5kIGhpbnRzIGZyb20gc2Vzc2lvbiBvcHRpb25zXHJcbiAgICAgIGNvbnN0IGVwcyA9IG9wdGlvbnMuZXhlY3V0aW9uUHJvdmlkZXJzIHx8IFtdO1xyXG4gICAgICBjb25zdCBiYWNrZW5kSGludHMgPSBlcHMubWFwKGkgPT4gdHlwZW9mIGkgPT09ICdzdHJpbmcnID8gaSA6IGkubmFtZSk7XHJcbiAgICAgIGNvbnN0IGJhY2tlbmROYW1lcyA9IGJhY2tlbmRIaW50cy5sZW5ndGggPT09IDAgPyBiYWNrZW5kc1NvcnRlZEJ5UHJpb3JpdHkgOiBiYWNrZW5kSGludHM7XHJcblxyXG4gICAgICAvLyB0cnkgdG8gcmVzb2x2ZSBhbmQgaW5pdGlhbGl6ZSBhbGwgcmVxdWVzdGVkIGJhY2tlbmRzXHJcbiAgICAgIGxldCBiYWNrZW5kOiBCYWNrZW5kfHVuZGVmaW5lZDtcclxuICAgICAgY29uc3QgZXJyb3JzID0gW107XHJcbiAgICAgIGNvbnN0IGF2YWlsYWJsZUJhY2tlbmROYW1lcyA9IG5ldyBTZXQ8c3RyaW5nPigpO1xyXG4gICAgICBmb3IgKGNvbnN0IGJhY2tlbmROYW1lIG9mIGJhY2tlbmROYW1lcykge1xyXG4gICAgICAgIGNvbnN0IHJlc29sdmVSZXN1bHQgPSBhd2FpdCB0cnlSZXNvbHZlQW5kSW5pdGlhbGl6ZUJhY2tlbmQoYmFja2VuZE5hbWUpO1xyXG4gICAgICAgIGlmICh0eXBlb2YgcmVzb2x2ZVJlc3VsdCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgIGVycm9ycy5wdXNoKHtuYW1lOiBiYWNrZW5kTmFtZSwgZXJyOiByZXNvbHZlUmVzdWx0fSk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmICghYmFja2VuZCkge1xyXG4gICAgICAgICAgICBiYWNrZW5kID0gcmVzb2x2ZVJlc3VsdDtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChiYWNrZW5kID09PSByZXNvbHZlUmVzdWx0KSB7XHJcbiAgICAgICAgICAgIGF2YWlsYWJsZUJhY2tlbmROYW1lcy5hZGQoYmFja2VuZE5hbWUpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gaWYgbm8gYmFja2VuZCBpcyBhdmFpbGFibGUsIHRocm93IGVycm9yLlxyXG4gICAgICBpZiAoIWJhY2tlbmQpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYG5vIGF2YWlsYWJsZSBiYWNrZW5kIGZvdW5kLiBFUlI6ICR7ZXJyb3JzLm1hcChlID0+IGBbJHtlLm5hbWV9XSAke2UuZXJyfWApLmpvaW4oJywgJyl9YCk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIGZvciBlYWNoIGV4cGxpY2l0bHkgcmVxdWVzdGVkIGJhY2tlbmQsIGlmIGl0J3Mgbm90IGF2YWlsYWJsZSwgb3V0cHV0IHdhcm5pbmcgbWVzc2FnZS5cclxuICAgICAgZm9yIChjb25zdCB7bmFtZSwgZXJyfSBvZiBlcnJvcnMpIHtcclxuICAgICAgICBpZiAoYmFja2VuZEhpbnRzLmluY2x1ZGVzKG5hbWUpKSB7XHJcbiAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxyXG4gICAgICAgICAgY29uc29sZS53YXJuKGByZW1vdmluZyByZXF1ZXN0ZWQgZXhlY3V0aW9uIHByb3ZpZGVyIFwiJHtcclxuICAgICAgICAgICAgICBuYW1lfVwiIGZyb20gc2Vzc2lvbiBvcHRpb25zIGJlY2F1c2UgaXQgaXMgbm90IGF2YWlsYWJsZTogJHtlcnJ9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICBjb25zdCBmaWx0ZXJlZEVwcyA9IGVwcy5maWx0ZXIoaSA9PiBhdmFpbGFibGVCYWNrZW5kTmFtZXMuaGFzKHR5cGVvZiBpID09PSAnc3RyaW5nJyA/IGkgOiBpLm5hbWUpKTtcclxuXHJcbiAgICAgIHJldHVybiBbXHJcbiAgICAgICAgYmFja2VuZCwgbmV3IFByb3h5KG9wdGlvbnMsIHtcclxuICAgICAgICAgIGdldDogKHRhcmdldCwgcHJvcCkgPT4ge1xyXG4gICAgICAgICAgICBpZiAocHJvcCA9PT0gJ2V4ZWN1dGlvblByb3ZpZGVycycpIHtcclxuICAgICAgICAgICAgICByZXR1cm4gZmlsdGVyZWRFcHM7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgcmV0dXJuIFJlZmxlY3QuZ2V0KHRhcmdldCwgcHJvcCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSlcclxuICAgICAgXTtcclxuICAgIH07XHJcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxyXG5cclxuaW1wb3J0IHtJbmZlcmVuY2VTZXNzaW9ufSBmcm9tICcuL2luZmVyZW5jZS1zZXNzaW9uLmpzJztcclxuaW1wb3J0IHtPbm54VmFsdWV9IGZyb20gJy4vb25ueC12YWx1ZS5qcyc7XHJcbmltcG9ydCB7VHJhaW5pbmdTZXNzaW9ufSBmcm9tICcuL3RyYWluaW5nLXNlc3Npb24uanMnO1xyXG5cclxuLyoqXHJcbiAqIEBpZ25vcmVcclxuICovXHJcbmV4cG9ydCBkZWNsYXJlIG5hbWVzcGFjZSBTZXNzaW9uSGFuZGxlciB7XHJcbiAgdHlwZSBGZWVkc1R5cGUgPSB7W25hbWU6IHN0cmluZ106IE9ubnhWYWx1ZX07XHJcbiAgdHlwZSBGZXRjaGVzVHlwZSA9IHtbbmFtZTogc3RyaW5nXTogT25ueFZhbHVlIHwgbnVsbH07XHJcbiAgdHlwZSBSZXR1cm5UeXBlID0ge1tuYW1lOiBzdHJpbmddOiBPbm54VmFsdWV9O1xyXG59XHJcblxyXG4vKipcclxuICogUmVwcmVzZW50cyBzaGFyZWQgU2Vzc2lvbkhhbmRsZXIgZnVuY3Rpb25hbGl0eVxyXG4gKlxyXG4gKiBAaWdub3JlXHJcbiAqL1xyXG5pbnRlcmZhY2UgU2Vzc2lvbkhhbmRsZXIge1xyXG4gIGRpc3Bvc2UoKTogUHJvbWlzZTx2b2lkPjtcclxuXHJcbiAgcmVhZG9ubHkgaW5wdXROYW1lczogcmVhZG9ubHkgc3RyaW5nW107XHJcbiAgcmVhZG9ubHkgb3V0cHV0TmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xyXG59XHJcblxyXG4vKipcclxuICogUmVwcmVzZW50IGEgaGFuZGxlciBpbnN0YW5jZSBvZiBhbiBpbmZlcmVuY2Ugc2Vzc2lvbi5cclxuICpcclxuICogQGlnbm9yZVxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBJbmZlcmVuY2VTZXNzaW9uSGFuZGxlciBleHRlbmRzIFNlc3Npb25IYW5kbGVyIHtcclxuICBzdGFydFByb2ZpbGluZygpOiB2b2lkO1xyXG4gIGVuZFByb2ZpbGluZygpOiB2b2lkO1xyXG5cclxuICBydW4oZmVlZHM6IFNlc3Npb25IYW5kbGVyLkZlZWRzVHlwZSwgZmV0Y2hlczogU2Vzc2lvbkhhbmRsZXIuRmV0Y2hlc1R5cGUsXHJcbiAgICAgIG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyk6IFByb21pc2U8U2Vzc2lvbkhhbmRsZXIuUmV0dXJuVHlwZT47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnQgYSBoYW5kbGVyIGluc3RhbmNlIG9mIGEgdHJhaW5pbmcgaW5mZXJlbmNlIHNlc3Npb24uXHJcbiAqXHJcbiAqIEBpZ25vcmVcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVHJhaW5pbmdTZXNzaW9uSGFuZGxlciBleHRlbmRzIFNlc3Npb25IYW5kbGVyIHtcclxuICByZWFkb25seSBldmFsSW5wdXROYW1lczogcmVhZG9ubHkgc3RyaW5nW107XHJcbiAgcmVhZG9ubHkgZXZhbE91dHB1dE5hbWVzOiByZWFkb25seSBzdHJpbmdbXTtcclxuXHJcbiAgbGF6eVJlc2V0R3JhZCgpOiBQcm9taXNlPHZvaWQ+O1xyXG4gIHJ1blRyYWluU3RlcChcclxuICAgICAgZmVlZHM6IFNlc3Npb25IYW5kbGVyLkZlZWRzVHlwZSwgZmV0Y2hlczogU2Vzc2lvbkhhbmRsZXIuRmV0Y2hlc1R5cGUsXHJcbiAgICAgIG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyk6IFByb21pc2U8U2Vzc2lvbkhhbmRsZXIuUmV0dXJuVHlwZT47XHJcbiAgcnVuT3B0aW1pemVyU3RlcChvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOiBQcm9taXNlPHZvaWQ+O1xyXG4gIHJ1bkV2YWxTdGVwKFxyXG4gICAgICBmZWVkczogU2Vzc2lvbkhhbmRsZXIuRmVlZHNUeXBlLCBmZXRjaGVzOiBTZXNzaW9uSGFuZGxlci5GZXRjaGVzVHlwZSxcclxuICAgICAgb3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTogUHJvbWlzZTxTZXNzaW9uSGFuZGxlci5SZXR1cm5UeXBlPjtcclxuXHJcbiAgZ2V0UGFyYW1ldGVyc1NpemUodHJhaW5hYmxlT25seTogYm9vbGVhbik6IFByb21pc2U8bnVtYmVyPjtcclxuICBsb2FkUGFyYW1ldGVyc0J1ZmZlcihidWZmZXI6IFVpbnQ4QXJyYXksIHRyYWluYWJsZU9ubHk6IGJvb2xlYW4pOiBQcm9taXNlPHZvaWQ+O1xyXG4gIGdldENvbnRpZ3VvdXNQYXJhbWV0ZXJzKHRyYWluYWJsZU9ubHk6IGJvb2xlYW4pOiBQcm9taXNlPE9ubnhWYWx1ZT47XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnQgYSBiYWNrZW5kIHRoYXQgcHJvdmlkZXMgaW1wbGVtZW50YXRpb24gb2YgbW9kZWwgaW5mZXJlbmNpbmcuXHJcbiAqXHJcbiAqIEBpZ25vcmVcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgQmFja2VuZCB7XHJcbiAgLyoqXHJcbiAgICogSW5pdGlhbGl6ZSB0aGUgYmFja2VuZCBhc3luY2hyb25vdXNseS4gU2hvdWxkIHRocm93IHdoZW4gZmFpbGVkLlxyXG4gICAqL1xyXG4gIGluaXQoYmFja2VuZE5hbWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD47XHJcblxyXG4gIGNyZWF0ZUluZmVyZW5jZVNlc3Npb25IYW5kbGVyKHVyaU9yQnVmZmVyOiBzdHJpbmd8VWludDhBcnJheSwgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOlxyXG4gICAgICBQcm9taXNlPEluZmVyZW5jZVNlc3Npb25IYW5kbGVyPjtcclxuXHJcbiAgY3JlYXRlVHJhaW5pbmdTZXNzaW9uSGFuZGxlcj9cclxuICAgICAgKGNoZWNrcG9pbnRTdGF0ZVVyaU9yQnVmZmVyOiBUcmFpbmluZ1Nlc3Npb24uVXJpT3JCdWZmZXIsIHRyYWluTW9kZWxVcmlPckJ1ZmZlcjogVHJhaW5pbmdTZXNzaW9uLlVyaU9yQnVmZmVyLFxyXG4gICAgICAgZXZhbE1vZGVsVXJpT3JCdWZmZXI6IFRyYWluaW5nU2Vzc2lvbi5VcmlPckJ1ZmZlciwgb3B0aW1pemVyTW9kZWxVcmlPckJ1ZmZlcjogVHJhaW5pbmdTZXNzaW9uLlVyaU9yQnVmZmVyLFxyXG4gICAgICAgb3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFByb21pc2U8VHJhaW5pbmdTZXNzaW9uSGFuZGxlcj47XHJcbn1cclxuXHJcbmV4cG9ydCB7cmVnaXN0ZXJCYWNrZW5kfSBmcm9tICcuL2JhY2tlbmQtaW1wbC5qcyc7XHJcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxyXG5cclxuLy8gVGhpcyBmaWxlIGlzIGdlbmVyYXRlZCBieSAvanMvc2NyaXB0cy91cGRhdGUtdmVyc2lvbi50c1xyXG4vLyBEbyBub3QgbW9kaWZ5IGZpbGUgY29udGVudCBtYW51YWxseS5cclxuXHJcbmV4cG9ydCBjb25zdCB2ZXJzaW9uID0gJzEuMTguMic7XHJcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxyXG5cclxuaW1wb3J0IHtFbnZ9IGZyb20gJy4vZW52LmpzJztcclxuaW1wb3J0IHt2ZXJzaW9ufSBmcm9tICcuL3ZlcnNpb24uanMnO1xyXG5cclxudHlwZSBMb2dMZXZlbFR5cGUgPSBFbnZbJ2xvZ0xldmVsJ107XHJcblxyXG5sZXQgbG9nTGV2ZWxWYWx1ZTogUmVxdWlyZWQ8TG9nTGV2ZWxUeXBlPiA9ICd3YXJuaW5nJztcclxuXHJcbmV4cG9ydCBjb25zdCBlbnY6IEVudiA9IHtcclxuICB3YXNtOiB7fSBhcyBFbnYuV2ViQXNzZW1ibHlGbGFncyxcclxuICB3ZWJnbDoge30gYXMgRW52LldlYkdMRmxhZ3MsXHJcbiAgd2ViZ3B1OiB7fSBhcyBFbnYuV2ViR3B1RmxhZ3MsXHJcbiAgdmVyc2lvbnM6IHtjb21tb246IHZlcnNpb259LFxyXG5cclxuICBzZXQgbG9nTGV2ZWwodmFsdWU6IExvZ0xldmVsVHlwZSkge1xyXG4gICAgaWYgKHZhbHVlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKHR5cGVvZiB2YWx1ZSAhPT0gJ3N0cmluZycgfHwgWyd2ZXJib3NlJywgJ2luZm8nLCAnd2FybmluZycsICdlcnJvcicsICdmYXRhbCddLmluZGV4T2YodmFsdWUpID09PSAtMSkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFVuc3VwcG9ydGVkIGxvZ2dpbmcgbGV2ZWw6ICR7dmFsdWV9YCk7XHJcbiAgICB9XHJcbiAgICBsb2dMZXZlbFZhbHVlID0gdmFsdWU7XHJcbiAgfSxcclxuICBnZXQgbG9nTGV2ZWwoKTogUmVxdWlyZWQ8TG9nTGV2ZWxUeXBlPiB7XHJcbiAgICByZXR1cm4gbG9nTGV2ZWxWYWx1ZTtcclxuICB9LFxyXG59O1xyXG5cclxuLy8gc2V0IHByb3BlcnR5ICdsb2dMZXZlbCcgc28gdGhhdCB0aGV5IGNhbiBiZSBjb3JyZWN0bHkgdHJhbnNmZXJyZWQgdG8gd29ya2VyIGJ5IGBwb3N0TWVzc2FnZSgpYC5cclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGVudiwgJ2xvZ0xldmVsJywge2VudW1lcmFibGU6IHRydWV9KTtcclxuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXHJcblxyXG5pbXBvcnQge2VudiBhcyBlbnZJbXBsfSBmcm9tICcuL2Vudi1pbXBsLmpzJztcclxuXHJcbmV4cG9ydCBkZWNsYXJlIG5hbWVzcGFjZSBFbnYge1xyXG4gIGV4cG9ydCB0eXBlIFdhc21QcmVmaXhPckZpbGVQYXRocyA9IHN0cmluZ3x7XHJcbiAgICAvKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb24gKi9cclxuICAgICdvcnQtd2FzbS53YXNtJz86IHN0cmluZztcclxuICAgICdvcnQtd2FzbS10aHJlYWRlZC53YXNtJz86IHN0cmluZztcclxuICAgICdvcnQtd2FzbS1zaW1kLndhc20nPzogc3RyaW5nO1xyXG4gICAgJ29ydC10cmFpbmluZy13YXNtLXNpbWQud2FzbSc/OiBzdHJpbmc7XHJcbiAgICAnb3J0LXdhc20tc2ltZC10aHJlYWRlZC53YXNtJz86IHN0cmluZztcclxuICAgIC8qIGVzbGludC1lbmFibGUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uICovXHJcbiAgfTtcclxuICBleHBvcnQgaW50ZXJmYWNlIFdlYkFzc2VtYmx5RmxhZ3Mge1xyXG4gICAgLyoqXHJcbiAgICAgKiBzZXQgb3IgZ2V0IG51bWJlciBvZiB0aHJlYWQocykuIElmIG9taXR0ZWQgb3Igc2V0IHRvIDAsIG51bWJlciBvZiB0aHJlYWQocykgd2lsbCBiZSBkZXRlcm1pbmVkIGJ5IHN5c3RlbS4gSWYgc2V0XHJcbiAgICAgKiB0byAxLCBubyB3b3JrZXIgdGhyZWFkIHdpbGwgYmUgc3Bhd25lZC5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgd2hlbiBXZWJBc3NlbWJseSBtdWx0aXRocmVhZCBmZWF0dXJlIGlzIGF2YWlsYWJsZSBpbiBjdXJyZW50IGNvbnRleHQuXHJcbiAgICAgKlxyXG4gICAgICogQGRlZmF1bHRWYWx1ZSBgMGBcclxuICAgICAqL1xyXG4gICAgbnVtVGhyZWFkcz86IG51bWJlcjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIHNldCBvciBnZXQgYSBib29sZWFuIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0byBlbmFibGUgU0lNRC4gSWYgc2V0IHRvIGZhbHNlLCBTSU1EIHdpbGwgYmUgZm9yY2VseSBkaXNhYmxlZC5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgd2hlbiBXZWJBc3NlbWJseSBTSU1EIGZlYXR1cmUgaXMgYXZhaWxhYmxlIGluIGN1cnJlbnQgY29udGV4dC5cclxuICAgICAqXHJcbiAgICAgKiBAZGVmYXVsdFZhbHVlIGB0cnVlYFxyXG4gICAgICovXHJcbiAgICBzaW1kPzogYm9vbGVhbjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIHNldCBvciBnZXQgYSBib29sZWFuIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0byBlbmFibGUgdHJhY2UuXHJcbiAgICAgKlxyXG4gICAgICogQGRlcHJlY2F0ZWQgVXNlIGBlbnYudHJhY2VgIGluc3RlYWQuIElmIGBlbnYudHJhY2VgIGlzIHNldCwgdGhpcyBwcm9wZXJ0eSB3aWxsIGJlIGlnbm9yZWQuXHJcbiAgICAgKiBAZGVmYXVsdFZhbHVlIGBmYWxzZWBcclxuICAgICAqL1xyXG4gICAgdHJhY2U/OiBib29sZWFuO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IG9yIGdldCBhIG51bWJlciBzcGVjaWZ5aW5nIHRoZSB0aW1lb3V0IGZvciBpbml0aWFsaXphdGlvbiBvZiBXZWJBc3NlbWJseSBiYWNrZW5kLCBpbiBtaWxsaXNlY29uZHMuIEEgemVyb1xyXG4gICAgICogdmFsdWUgaW5kaWNhdGVzIG5vIHRpbWVvdXQgaXMgc2V0LlxyXG4gICAgICpcclxuICAgICAqIEBkZWZhdWx0VmFsdWUgYDBgXHJcbiAgICAgKi9cclxuICAgIGluaXRUaW1lb3V0PzogbnVtYmVyO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IGEgY3VzdG9tIFVSTCBwcmVmaXggdG8gdGhlIC53YXNtIGZpbGVzIG9yIGEgc2V0IG9mIG92ZXJyaWRlcyBmb3IgZWFjaCAud2FzbSBmaWxlLiBUaGUgb3ZlcnJpZGUgcGF0aCBzaG91bGQgYmVcclxuICAgICAqIGFuIGFic29sdXRlIHBhdGguXHJcbiAgICAgKi9cclxuICAgIHdhc21QYXRocz86IFdhc21QcmVmaXhPckZpbGVQYXRocztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFNldCBvciBnZXQgYSBib29sZWFuIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0byBwcm94eSB0aGUgZXhlY3V0aW9uIG9mIG1haW4gdGhyZWFkIHRvIGEgd29ya2VyIHRocmVhZC5cclxuICAgICAqXHJcbiAgICAgKiBAZGVmYXVsdFZhbHVlIGBmYWxzZWBcclxuICAgICAqL1xyXG4gICAgcHJveHk/OiBib29sZWFuO1xyXG4gIH1cclxuXHJcbiAgZXhwb3J0IGludGVyZmFjZSBXZWJHTEZsYWdzIHtcclxuICAgIC8qKlxyXG4gICAgICogU2V0IG9yIGdldCB0aGUgV2ViR0wgQ29udGV4dCBJRCAod2ViZ2wgb3Igd2ViZ2wyKS5cclxuICAgICAqXHJcbiAgICAgKiBAZGVmYXVsdFZhbHVlIGAnd2ViZ2wyJ2BcclxuICAgICAqL1xyXG4gICAgY29udGV4dElkPzogJ3dlYmdsJ3wnd2ViZ2wyJztcclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBXZWJHTCByZW5kZXJpbmcgY29udGV4dC5cclxuICAgICAqL1xyXG4gICAgcmVhZG9ubHkgY29udGV4dDogV2ViR0xSZW5kZXJpbmdDb250ZXh0O1xyXG4gICAgLyoqXHJcbiAgICAgKiBTZXQgb3IgZ2V0IHRoZSBtYXhpbXVtIGJhdGNoIHNpemUgZm9yIG1hdG11bC4gMCBtZWFucyB0byBkaXNhYmxlIGJhdGNoaW5nLlxyXG4gICAgICpcclxuICAgICAqIEBkZXByZWNhdGVkXHJcbiAgICAgKi9cclxuICAgIG1hdG11bE1heEJhdGNoU2l6ZT86IG51bWJlcjtcclxuICAgIC8qKlxyXG4gICAgICogU2V0IG9yIGdldCB0aGUgdGV4dHVyZSBjYWNoZSBtb2RlLlxyXG4gICAgICpcclxuICAgICAqIEBkZWZhdWx0VmFsdWUgYCdmdWxsJ2BcclxuICAgICAqL1xyXG4gICAgdGV4dHVyZUNhY2hlTW9kZT86ICdpbml0aWFsaXplck9ubHknfCdmdWxsJztcclxuICAgIC8qKlxyXG4gICAgICogU2V0IG9yIGdldCB0aGUgcGFja2VkIHRleHR1cmUgbW9kZVxyXG4gICAgICpcclxuICAgICAqIEBkZWZhdWx0VmFsdWUgYGZhbHNlYFxyXG4gICAgICovXHJcbiAgICBwYWNrPzogYm9vbGVhbjtcclxuICAgIC8qKlxyXG4gICAgICogU2V0IG9yIGdldCB3aGV0aGVyIGVuYWJsZSBhc3luYyBkb3dubG9hZC5cclxuICAgICAqXHJcbiAgICAgKiBAZGVmYXVsdFZhbHVlIGBmYWxzZWBcclxuICAgICAqL1xyXG4gICAgYXN5bmM/OiBib29sZWFuO1xyXG4gIH1cclxuXHJcbiAgZXhwb3J0IGludGVyZmFjZSBXZWJHcHVQcm9maWxpbmdEYXRhVjFUZW5zb3JNZXRhZGF0YSB7XHJcbiAgICBkaW1zOiByZWFkb25seSBudW1iZXJbXTtcclxuICAgIGRhdGFUeXBlOiBzdHJpbmc7XHJcbiAgfVxyXG4gIGV4cG9ydCBpbnRlcmZhY2UgV2ViR3B1UHJvZmlsaW5nRGF0YVYxIHtcclxuICAgIHZlcnNpb246IDE7XHJcbiAgICBpbnB1dHNNZXRhZGF0YTogcmVhZG9ubHkgV2ViR3B1UHJvZmlsaW5nRGF0YVYxVGVuc29yTWV0YWRhdGFbXTtcclxuICAgIG91dHB1dHNNZXRhZGF0YTogcmVhZG9ubHkgV2ViR3B1UHJvZmlsaW5nRGF0YVYxVGVuc29yTWV0YWRhdGFbXTtcclxuICAgIGtlcm5lbElkOiBudW1iZXI7XHJcbiAgICBrZXJuZWxUeXBlOiBzdHJpbmc7XHJcbiAgICBrZXJuZWxOYW1lOiBzdHJpbmc7XHJcbiAgICBwcm9ncmFtTmFtZTogc3RyaW5nO1xyXG4gICAgc3RhcnRUaW1lOiBudW1iZXI7XHJcbiAgICBlbmRUaW1lOiBudW1iZXI7XHJcbiAgfVxyXG5cclxuICBleHBvcnQgdHlwZSBXZWJHcHVQcm9maWxpbmdEYXRhID0gV2ViR3B1UHJvZmlsaW5nRGF0YVYxO1xyXG5cclxuICBleHBvcnQgaW50ZXJmYWNlIFdlYkdwdUZsYWdzIHtcclxuICAgIC8qKlxyXG4gICAgICogU2V0IG9yIGdldCB0aGUgcHJvZmlsaW5nIG1vZGUuXHJcbiAgICAgKlxyXG4gICAgICogQGRlcHJlY2F0ZWQgVXNlIGBlbnYud2ViZ3B1LnByb2ZpbGluZy5tb2RlYCBpbnN0ZWFkLiBJZiBgZW52LndlYmdwdS5wcm9maWxpbmcubW9kZWAgaXMgc2V0LCB0aGlzIHByb3BlcnR5IHdpbGwgYmVcclxuICAgICAqIGlnbm9yZWQuXHJcbiAgICAgKi9cclxuICAgIHByb2ZpbGluZ01vZGU/OiAnb2ZmJ3wnZGVmYXVsdCc7XHJcbiAgICAvKipcclxuICAgICAqIFNldCBvciBnZXQgdGhlIHByb2ZpbGluZyBjb25maWd1cmF0aW9uLlxyXG4gICAgICovXHJcbiAgICBwcm9maWxpbmc/OiB7XHJcbiAgICAgIC8qKlxyXG4gICAgICAgKiBTZXQgb3IgZ2V0IHRoZSBwcm9maWxpbmcgbW9kZS5cclxuICAgICAgICpcclxuICAgICAgICogQGRlZmF1bHRWYWx1ZSBgJ29mZidgXHJcbiAgICAgICAqL1xyXG4gICAgICBtb2RlPzogJ29mZid8J2RlZmF1bHQnO1xyXG5cclxuICAgICAgLyoqXHJcbiAgICAgICAqIFNldCBvciBnZXQgYSBjYWxsYmFjayBmdW5jdGlvbiB3aGVuIGEgcHJvZmlsaW5nIGRhdGEgaXMgcmVjZWl2ZWQuIElmIG5vdCBzZXQsIHRoZSBwcm9maWxpbmcgZGF0YSB3aWxsIGJlXHJcbiAgICAgICAqIHByaW50ZWQgdG8gY29uc29sZS5cclxuICAgICAgICovXHJcbiAgICAgIG9uZGF0YT86IChkYXRhOiBXZWJHcHVQcm9maWxpbmdEYXRhKSA9PiB2b2lkO1xyXG4gICAgfTtcclxuICAgIC8qKlxyXG4gICAgICogU2V0IG9yIGdldCB0aGUgcG93ZXIgcHJlZmVyZW5jZS5cclxuICAgICAqXHJcbiAgICAgKiBTZXR0aW5nIHRoaXMgcHJvcGVydHkgb25seSBoYXMgZWZmZWN0IGJlZm9yZSB0aGUgZmlyc3QgV2ViR1BVIGluZmVyZW5jZSBzZXNzaW9uIGlzIGNyZWF0ZWQuIFRoZSB2YWx1ZSB3aWxsIGJlXHJcbiAgICAgKiB1c2VkIGFzIG9wdGlvbnMgZm9yIGBuYXZpZ2F0b3IuZ3B1LnJlcXVlc3RBZGFwdGVyKClgLlxyXG4gICAgICpcclxuICAgICAqIFNlZSB7QGxpbmsgaHR0cHM6Ly9ncHV3ZWIuZ2l0aHViLmlvL2dwdXdlYi8jZGljdGRlZi1ncHVyZXF1ZXN0YWRhcHRlcm9wdGlvbnN9IGZvciBtb3JlIGRldGFpbHMuXHJcbiAgICAgKlxyXG4gICAgICogQGRlZmF1bHRWYWx1ZSBgdW5kZWZpbmVkYFxyXG4gICAgICovXHJcbiAgICBwb3dlclByZWZlcmVuY2U/OiAnbG93LXBvd2VyJ3wnaGlnaC1wZXJmb3JtYW5jZSc7XHJcbiAgICAvKipcclxuICAgICAqIFNldCBvciBnZXQgdGhlIGZvcmNlIGZhbGxiYWNrIGFkYXB0ZXIgZmxhZy5cclxuICAgICAqXHJcbiAgICAgKiBTZXR0aW5nIHRoaXMgcHJvcGVydHkgb25seSBoYXMgZWZmZWN0IGJlZm9yZSB0aGUgZmlyc3QgV2ViR1BVIGluZmVyZW5jZSBzZXNzaW9uIGlzIGNyZWF0ZWQuIFRoZSB2YWx1ZSB3aWxsIGJlXHJcbiAgICAgKiB1c2VkIGFzIG9wdGlvbnMgZm9yIGBuYXZpZ2F0b3IuZ3B1LnJlcXVlc3RBZGFwdGVyKClgLlxyXG4gICAgICpcclxuICAgICAqIFNlZSB7QGxpbmsgaHR0cHM6Ly9ncHV3ZWIuZ2l0aHViLmlvL2dwdXdlYi8jZGljdGRlZi1ncHVyZXF1ZXN0YWRhcHRlcm9wdGlvbnN9IGZvciBtb3JlIGRldGFpbHMuXHJcbiAgICAgKlxyXG4gICAgICogQGRlZmF1bHRWYWx1ZSBgdW5kZWZpbmVkYFxyXG4gICAgICovXHJcbiAgICBmb3JjZUZhbGxiYWNrQWRhcHRlcj86IGJvb2xlYW47XHJcbiAgICAvKipcclxuICAgICAqIFNldCBvciBnZXQgdGhlIGFkYXB0ZXIgZm9yIFdlYkdQVS5cclxuICAgICAqXHJcbiAgICAgKiBTZXR0aW5nIHRoaXMgcHJvcGVydHkgb25seSBoYXMgZWZmZWN0IGJlZm9yZSB0aGUgZmlyc3QgV2ViR1BVIGluZmVyZW5jZSBzZXNzaW9uIGlzIGNyZWF0ZWQuIFRoZSB2YWx1ZSB3aWxsIGJlXHJcbiAgICAgKiB1c2VkIGFzIHRoZSBHUFUgYWRhcHRlciBmb3IgdGhlIHVuZGVybHlpbmcgV2ViR1BVIGJhY2tlbmQgdG8gY3JlYXRlIEdQVSBkZXZpY2UuXHJcbiAgICAgKlxyXG4gICAgICogSWYgdGhpcyBwcm9wZXJ0eSBpcyBub3Qgc2V0LCBpdCB3aWxsIGJlIGF2YWlsYWJsZSB0byBnZXQgYWZ0ZXIgdGhlIGZpcnN0IFdlYkdQVSBpbmZlcmVuY2Ugc2Vzc2lvbiBpcyBjcmVhdGVkLiBUaGVcclxuICAgICAqIHZhbHVlIHdpbGwgYmUgdGhlIEdQVSBhZGFwdGVyIHRoYXQgY3JlYXRlZCBieSB0aGUgdW5kZXJseWluZyBXZWJHUFUgYmFja2VuZC5cclxuICAgICAqXHJcbiAgICAgKiBXaGVuIHVzZSB3aXRoIFR5cGVTY3JpcHQsIHRoZSB0eXBlIG9mIHRoaXMgcHJvcGVydHkgaXMgYEdQVUFkYXB0ZXJgIGRlZmluZWQgaW4gXCJAd2ViZ3B1L3R5cGVzXCIuXHJcbiAgICAgKiBVc2UgYGNvbnN0IGFkYXB0ZXIgPSBlbnYud2ViZ3B1LmFkYXB0ZXIgYXMgR1BVQWRhcHRlcjtgIGluIFR5cGVTY3JpcHQgdG8gYWNjZXNzIHRoaXMgcHJvcGVydHkgd2l0aCBjb3JyZWN0IHR5cGUuXHJcbiAgICAgKlxyXG4gICAgICogc2VlIGNvbW1lbnRzIG9uIHtAbGluayBUZW5zb3IuR3B1QnVmZmVyVHlwZX1cclxuICAgICAqL1xyXG4gICAgYWRhcHRlcjogdW5rbm93bjtcclxuICAgIC8qKlxyXG4gICAgICogR2V0IHRoZSBkZXZpY2UgZm9yIFdlYkdQVS5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIHByb3BlcnR5IGlzIG9ubHkgYXZhaWxhYmxlIGFmdGVyIHRoZSBmaXJzdCBXZWJHUFUgaW5mZXJlbmNlIHNlc3Npb24gaXMgY3JlYXRlZC5cclxuICAgICAqXHJcbiAgICAgKiBXaGVuIHVzZSB3aXRoIFR5cGVTY3JpcHQsIHRoZSB0eXBlIG9mIHRoaXMgcHJvcGVydHkgaXMgYEdQVURldmljZWAgZGVmaW5lZCBpbiBcIkB3ZWJncHUvdHlwZXNcIi5cclxuICAgICAqIFVzZSBgY29uc3QgZGV2aWNlID0gZW52LndlYmdwdS5kZXZpY2UgYXMgR1BVRGV2aWNlO2AgaW4gVHlwZVNjcmlwdCB0byBhY2Nlc3MgdGhpcyBwcm9wZXJ0eSB3aXRoIGNvcnJlY3QgdHlwZS5cclxuICAgICAqXHJcbiAgICAgKiBzZWUgY29tbWVudHMgb24ge0BsaW5rIFRlbnNvci5HcHVCdWZmZXJUeXBlfSBmb3IgbW9yZSBkZXRhaWxzIGFib3V0IHdoeSBub3QgdXNlIHR5cGVzIGRlZmluZWQgaW4gXCJAd2ViZ3B1L3R5cGVzXCIuXHJcbiAgICAgKi9cclxuICAgIHJlYWRvbmx5IGRldmljZTogdW5rbm93bjtcclxuICAgIC8qKlxyXG4gICAgICogU2V0IG9yIGdldCB3aGV0aGVyIHZhbGlkYXRlIGlucHV0IGNvbnRlbnQuXHJcbiAgICAgKlxyXG4gICAgICogQGRlZmF1bHRWYWx1ZSBgZmFsc2VgXHJcbiAgICAgKi9cclxuICAgIHZhbGlkYXRlSW5wdXRDb250ZW50PzogYm9vbGVhbjtcclxuICB9XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgRW52IHtcclxuICAvKipcclxuICAgKiBzZXQgdGhlIHNldmVyaXR5IGxldmVsIGZvciBsb2dnaW5nLlxyXG4gICAqXHJcbiAgICogQGRlZmF1bHRWYWx1ZSBgJ3dhcm5pbmcnYFxyXG4gICAqL1xyXG4gIGxvZ0xldmVsPzogJ3ZlcmJvc2UnfCdpbmZvJ3wnd2FybmluZyd8J2Vycm9yJ3wnZmF0YWwnO1xyXG5cclxuICAvKipcclxuICAgKiBJbmRpY2F0ZSB3aGV0aGVyIHJ1biBpbiBkZWJ1ZyBtb2RlLlxyXG4gICAqXHJcbiAgICogQGRlZmF1bHRWYWx1ZSBgZmFsc2VgXHJcbiAgICovXHJcbiAgZGVidWc/OiBib29sZWFuO1xyXG5cclxuICAvKipcclxuICAgKiBzZXQgb3IgZ2V0IGEgYm9vbGVhbiB2YWx1ZSBpbmRpY2F0aW5nIHdoZXRoZXIgdG8gZW5hYmxlIHRyYWNlLlxyXG4gICAqXHJcbiAgICogQGRlZmF1bHRWYWx1ZSBgZmFsc2VgXHJcbiAgICovXHJcbiAgdHJhY2U/OiBib29sZWFuO1xyXG5cclxuICAvKipcclxuICAgKiBHZXQgdmVyc2lvbiBvZiB0aGUgY3VycmVudCBwYWNrYWdlLlxyXG4gICAqL1xyXG4gIHJlYWRvbmx5IHZlcnNpb25zOiB7XHJcbiAgICByZWFkb25seSBjb21tb246IHN0cmluZztcclxuICAgIHJlYWRvbmx5IHdlYj86IHN0cmluZztcclxuICAgIHJlYWRvbmx5IG5vZGU/OiBzdHJpbmc7XHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXHJcbiAgICByZWFkb25seSAncmVhY3QtbmF0aXZlJz86IHN0cmluZztcclxuICB9O1xyXG5cclxuICAvKipcclxuICAgKiBSZXByZXNlbnQgYSBzZXQgb2YgZmxhZ3MgZm9yIFdlYkFzc2VtYmx5XHJcbiAgICovXHJcbiAgcmVhZG9ubHkgd2FzbTogRW52LldlYkFzc2VtYmx5RmxhZ3M7XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlcHJlc2VudCBhIHNldCBvZiBmbGFncyBmb3IgV2ViR0xcclxuICAgKi9cclxuICByZWFkb25seSB3ZWJnbDogRW52LldlYkdMRmxhZ3M7XHJcblxyXG4gIC8qKlxyXG4gICAqIFJlcHJlc2VudCBhIHNldCBvZiBmbGFncyBmb3IgV2ViR1BVXHJcbiAgICovXHJcbiAgcmVhZG9ubHkgd2ViZ3B1OiBFbnYuV2ViR3B1RmxhZ3M7XHJcblxyXG4gIFtuYW1lOiBzdHJpbmddOiB1bmtub3duO1xyXG59XHJcblxyXG4vKipcclxuICogUmVwcmVzZW50IGEgc2V0IG9mIGZsYWdzIGFzIGEgZ2xvYmFsIHNpbmdsZXRvbi5cclxuICovXHJcbmV4cG9ydCBjb25zdCBlbnY6IEVudiA9IGVudkltcGw7XHJcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxyXG5cclxuaW1wb3J0IHtUZW5zb3JUb0RhdGFVcmxPcHRpb25zLCBUZW5zb3JUb0ltYWdlRGF0YU9wdGlvbnN9IGZyb20gJy4vdGVuc29yLWNvbnZlcnNpb24uanMnO1xyXG5pbXBvcnQge1RlbnNvcn0gZnJvbSAnLi90ZW5zb3IuanMnO1xyXG5cclxuLyoqXHJcbiAqIGltcGxlbWVudGF0aW9uIG9mIFRlbnNvci50b0RhdGFVUkwoKVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHRlbnNvclRvRGF0YVVSTCA9ICh0ZW5zb3I6IFRlbnNvciwgb3B0aW9ucz86IFRlbnNvclRvRGF0YVVybE9wdGlvbnMpOiBzdHJpbmcgPT4ge1xyXG4gIGNvbnN0IGNhbnZhcyA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgPyBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSA6IChuZXcgT2Zmc2NyZWVuQ2FudmFzKDEsIDEpKTtcclxuICBjYW52YXMud2lkdGggPSB0ZW5zb3IuZGltc1szXTtcclxuICBjYW52YXMuaGVpZ2h0ID0gdGVuc29yLmRpbXNbMl07XHJcbiAgY29uc3QgcGl4ZWxzMkRDb250ZXh0ID1cclxuICAgICAgY2FudmFzLmdldENvbnRleHQoJzJkJykgYXMgKENhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB8IE9mZnNjcmVlbkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRCB8IG51bGwpO1xyXG5cclxuICBpZiAocGl4ZWxzMkRDb250ZXh0ICE9IG51bGwpIHtcclxuICAgIC8vIERlZmF1bHQgdmFsdWVzIGZvciBoZWlnaHQgYW5kIHdpZHRoICYgZm9ybWF0XHJcbiAgICBsZXQgd2lkdGg6IG51bWJlcjtcclxuICAgIGxldCBoZWlnaHQ6IG51bWJlcjtcclxuICAgIGlmIChvcHRpb25zPy50ZW5zb3JMYXlvdXQgIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLnRlbnNvckxheW91dCA9PT0gJ05IV0MnKSB7XHJcbiAgICAgIHdpZHRoID0gdGVuc29yLmRpbXNbMl07XHJcbiAgICAgIGhlaWdodCA9IHRlbnNvci5kaW1zWzNdO1xyXG4gICAgfSBlbHNlIHsgIC8vIERlZmF1bHQgbGF5b3V0IGlzIE5DV0hcclxuICAgICAgd2lkdGggPSB0ZW5zb3IuZGltc1szXTtcclxuICAgICAgaGVpZ2h0ID0gdGVuc29yLmRpbXNbMl07XHJcbiAgICB9XHJcblxyXG4gICAgY29uc3QgaW5wdXRmb3JtYXQgPSBvcHRpb25zPy5mb3JtYXQgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMuZm9ybWF0IDogJ1JHQic7XHJcblxyXG4gICAgY29uc3Qgbm9ybSA9IG9wdGlvbnM/Lm5vcm07XHJcbiAgICBsZXQgbm9ybU1lYW46IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdO1xyXG4gICAgbGV0IG5vcm1CaWFzOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcclxuICAgIGlmIChub3JtID09PSB1bmRlZmluZWQgfHwgbm9ybS5tZWFuID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgbm9ybU1lYW4gPSBbMjU1LCAyNTUsIDI1NSwgMjU1XTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0eXBlb2YgKG5vcm0ubWVhbikgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgbm9ybU1lYW4gPSBbbm9ybS5tZWFuLCBub3JtLm1lYW4sIG5vcm0ubWVhbiwgbm9ybS5tZWFuXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBub3JtTWVhbiA9IFtub3JtLm1lYW5bMF0sIG5vcm0ubWVhblsxXSwgbm9ybS5tZWFuWzJdLCAwXTtcclxuICAgICAgICBpZiAobm9ybS5tZWFuWzNdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgIG5vcm1NZWFuWzNdID0gbm9ybS5tZWFuWzNdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKG5vcm0gPT09IHVuZGVmaW5lZCB8fCBub3JtLmJpYXMgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBub3JtQmlhcyA9IFswLCAwLCAwLCAwXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0eXBlb2YgKG5vcm0uYmlhcykgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgbm9ybUJpYXMgPSBbbm9ybS5iaWFzLCBub3JtLmJpYXMsIG5vcm0uYmlhcywgbm9ybS5iaWFzXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBub3JtQmlhcyA9IFtub3JtLmJpYXNbMF0sIG5vcm0uYmlhc1sxXSwgbm9ybS5iaWFzWzJdLCAwXTtcclxuICAgICAgICBpZiAobm9ybS5iaWFzWzNdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgIG5vcm1CaWFzWzNdID0gbm9ybS5iaWFzWzNdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN0cmlkZSA9IGhlaWdodCAqIHdpZHRoO1xyXG4gICAgLy8gRGVmYXVsdCBwb2ludGVyIGFzc2lnbm1lbnRzXHJcbiAgICBsZXQgclRlbnNvclBvaW50ZXIgPSAwLCBnVGVuc29yUG9pbnRlciA9IHN0cmlkZSwgYlRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAyLCBhVGVuc29yUG9pbnRlciA9IC0xO1xyXG5cclxuICAgIC8vIFVwZGF0aW5nIHRoZSBwb2ludGVyIGFzc2lnbm1lbnRzIGJhc2VkIG9uIHRoZSBpbnB1dCBpbWFnZSBmb3JtYXRcclxuICAgIGlmIChpbnB1dGZvcm1hdCA9PT0gJ1JHQkEnKSB7XHJcbiAgICAgIHJUZW5zb3JQb2ludGVyID0gMDtcclxuICAgICAgZ1RlbnNvclBvaW50ZXIgPSBzdHJpZGU7XHJcbiAgICAgIGJUZW5zb3JQb2ludGVyID0gc3RyaWRlICogMjtcclxuICAgICAgYVRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAzO1xyXG4gICAgfSBlbHNlIGlmIChpbnB1dGZvcm1hdCA9PT0gJ1JHQicpIHtcclxuICAgICAgclRlbnNvclBvaW50ZXIgPSAwO1xyXG4gICAgICBnVGVuc29yUG9pbnRlciA9IHN0cmlkZTtcclxuICAgICAgYlRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAyO1xyXG4gICAgfSBlbHNlIGlmIChpbnB1dGZvcm1hdCA9PT0gJ1JCRycpIHtcclxuICAgICAgclRlbnNvclBvaW50ZXIgPSAwO1xyXG4gICAgICBiVGVuc29yUG9pbnRlciA9IHN0cmlkZTtcclxuICAgICAgZ1RlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAyO1xyXG4gICAgfVxyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGVpZ2h0OyBpKyspIHtcclxuICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCB3aWR0aDsgaisrKSB7XHJcbiAgICAgICAgY29uc3QgUiA9ICgodGVuc29yLmRhdGFbclRlbnNvclBvaW50ZXIrK10gYXMgbnVtYmVyKSAtIG5vcm1CaWFzWzBdKSAqIG5vcm1NZWFuWzBdOyAgLy8gUiB2YWx1ZVxyXG4gICAgICAgIGNvbnN0IEcgPSAoKHRlbnNvci5kYXRhW2dUZW5zb3JQb2ludGVyKytdIGFzIG51bWJlcikgLSBub3JtQmlhc1sxXSkgKiBub3JtTWVhblsxXTsgIC8vIEcgdmFsdWVcclxuICAgICAgICBjb25zdCBCID0gKCh0ZW5zb3IuZGF0YVtiVGVuc29yUG9pbnRlcisrXSBhcyBudW1iZXIpIC0gbm9ybUJpYXNbMl0pICogbm9ybU1lYW5bMl07ICAvLyBCIHZhbHVlXHJcbiAgICAgICAgY29uc3QgQSA9IGFUZW5zb3JQb2ludGVyID09PSAtMSA/XHJcbiAgICAgICAgICAgIDI1NSA6XHJcbiAgICAgICAgICAgICgodGVuc29yLmRhdGFbYVRlbnNvclBvaW50ZXIrK10gYXMgbnVtYmVyKSAtIG5vcm1CaWFzWzNdKSAqIG5vcm1NZWFuWzNdOyAgLy8gQSB2YWx1ZVxyXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvcmVzdHJpY3QtcGx1cy1vcGVyYW5kc1xyXG4gICAgICAgIHBpeGVsczJEQ29udGV4dC5maWxsU3R5bGUgPSAncmdiYSgnICsgUiArICcsJyArIEcgKyAnLCcgKyBCICsgJywnICsgQSArICcpJztcclxuICAgICAgICBwaXhlbHMyRENvbnRleHQuZmlsbFJlY3QoaiwgaSwgMSwgMSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGlmICgndG9EYXRhVVJMJyBpbiBjYW52YXMpIHtcclxuICAgICAgcmV0dXJuIGNhbnZhcy50b0RhdGFVUkwoKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcigndG9EYXRhVVJMIGlzIG5vdCBzdXBwb3J0ZWQnKTtcclxuICAgIH1cclxuICB9IGVsc2Uge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gbm90IGFjY2VzcyBpbWFnZSBkYXRhJyk7XHJcbiAgfVxyXG59O1xyXG5cclxuLyoqXHJcbiAqIGltcGxlbWVudGF0aW9uIG9mIFRlbnNvci50b0ltYWdlRGF0YSgpXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgdGVuc29yVG9JbWFnZURhdGEgPSAodGVuc29yOiBUZW5zb3IsIG9wdGlvbnM/OiBUZW5zb3JUb0ltYWdlRGF0YU9wdGlvbnMpOiBJbWFnZURhdGEgPT4ge1xyXG4gIGNvbnN0IHBpeGVsczJEQ29udGV4dCA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgP1xyXG4gICAgICBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKS5nZXRDb250ZXh0KCcyZCcpIDpcclxuICAgICAgbmV3IE9mZnNjcmVlbkNhbnZhcygxLCAxKS5nZXRDb250ZXh0KCcyZCcpIGFzIE9mZnNjcmVlbkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcclxuICBsZXQgaW1hZ2U6IEltYWdlRGF0YTtcclxuICBpZiAocGl4ZWxzMkRDb250ZXh0ICE9IG51bGwpIHtcclxuICAgIC8vIERlZmF1bHQgdmFsdWVzIGZvciBoZWlnaHQgYW5kIHdpZHRoICYgZm9ybWF0XHJcbiAgICBsZXQgd2lkdGg6IG51bWJlcjtcclxuICAgIGxldCBoZWlnaHQ6IG51bWJlcjtcclxuICAgIGxldCBjaGFubmVsczogbnVtYmVyO1xyXG4gICAgaWYgKG9wdGlvbnM/LnRlbnNvckxheW91dCAhPT0gdW5kZWZpbmVkICYmIG9wdGlvbnMudGVuc29yTGF5b3V0ID09PSAnTkhXQycpIHtcclxuICAgICAgd2lkdGggPSB0ZW5zb3IuZGltc1syXTtcclxuICAgICAgaGVpZ2h0ID0gdGVuc29yLmRpbXNbMV07XHJcbiAgICAgIGNoYW5uZWxzID0gdGVuc29yLmRpbXNbM107XHJcbiAgICB9IGVsc2UgeyAgLy8gRGVmYXVsdCBsYXlvdXQgaXMgTkNXSFxyXG4gICAgICB3aWR0aCA9IHRlbnNvci5kaW1zWzNdO1xyXG4gICAgICBoZWlnaHQgPSB0ZW5zb3IuZGltc1syXTtcclxuICAgICAgY2hhbm5lbHMgPSB0ZW5zb3IuZGltc1sxXTtcclxuICAgIH1cclxuICAgIGNvbnN0IGlucHV0Zm9ybWF0ID0gb3B0aW9ucyAhPT0gdW5kZWZpbmVkID8gKG9wdGlvbnMuZm9ybWF0ICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmZvcm1hdCA6ICdSR0InKSA6ICdSR0InO1xyXG5cclxuICAgIGNvbnN0IG5vcm0gPSBvcHRpb25zPy5ub3JtO1xyXG4gICAgbGV0IG5vcm1NZWFuOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcclxuICAgIGxldCBub3JtQmlhczogW251bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlcl07XHJcbiAgICBpZiAobm9ybSA9PT0gdW5kZWZpbmVkIHx8IG5vcm0ubWVhbiA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIG5vcm1NZWFuID0gWzI1NSwgMjU1LCAyNTUsIDI1NV07XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBpZiAodHlwZW9mIChub3JtLm1lYW4pID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgIG5vcm1NZWFuID0gW25vcm0ubWVhbiwgbm9ybS5tZWFuLCBub3JtLm1lYW4sIG5vcm0ubWVhbl07XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgbm9ybU1lYW4gPSBbbm9ybS5tZWFuWzBdLCBub3JtLm1lYW5bMV0sIG5vcm0ubWVhblsyXSwgMjU1XTtcclxuICAgICAgICBpZiAobm9ybS5tZWFuWzNdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgIG5vcm1NZWFuWzNdID0gbm9ybS5tZWFuWzNdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgaWYgKG5vcm0gPT09IHVuZGVmaW5lZCB8fCBub3JtLmJpYXMgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBub3JtQmlhcyA9IFswLCAwLCAwLCAwXTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGlmICh0eXBlb2YgKG5vcm0uYmlhcykgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgbm9ybUJpYXMgPSBbbm9ybS5iaWFzLCBub3JtLmJpYXMsIG5vcm0uYmlhcywgbm9ybS5iaWFzXTtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBub3JtQmlhcyA9IFtub3JtLmJpYXNbMF0sIG5vcm0uYmlhc1sxXSwgbm9ybS5iaWFzWzJdLCAwXTtcclxuICAgICAgICBpZiAobm9ybS5iaWFzWzNdICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgIG5vcm1CaWFzWzNdID0gbm9ybS5iaWFzWzNdO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IHN0cmlkZSA9IGhlaWdodCAqIHdpZHRoO1xyXG4gICAgaWYgKG9wdGlvbnMgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBpZiAob3B0aW9ucy5mb3JtYXQgIT09IHVuZGVmaW5lZCAmJiAoY2hhbm5lbHMgPT09IDQgJiYgb3B0aW9ucy5mb3JtYXQgIT09ICdSR0JBJykgfHxcclxuICAgICAgICAgIChjaGFubmVscyA9PT0gMyAmJiAob3B0aW9ucy5mb3JtYXQgIT09ICdSR0InICYmIG9wdGlvbnMuZm9ybWF0ICE9PSAnQkdSJykpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdUZW5zb3IgZm9ybWF0IGRvZXNuXFwndCBtYXRjaCBpbnB1dCB0ZW5zb3IgZGltcycpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gRGVmYXVsdCBwb2ludGVyIGFzc2lnbm1lbnRzXHJcbiAgICBjb25zdCBzdGVwID0gNDtcclxuICAgIGxldCBySW1hZ2VQb2ludGVyID0gMCwgZ0ltYWdlUG9pbnRlciA9IDEsIGJJbWFnZVBvaW50ZXIgPSAyLCBhSW1hZ2VQb2ludGVyID0gMztcclxuICAgIGxldCByVGVuc29yUG9pbnRlciA9IDAsIGdUZW5zb3JQb2ludGVyID0gc3RyaWRlLCBiVGVuc29yUG9pbnRlciA9IHN0cmlkZSAqIDIsIGFUZW5zb3JQb2ludGVyID0gLTE7XHJcblxyXG4gICAgLy8gVXBkYXRpbmcgdGhlIHBvaW50ZXIgYXNzaWdubWVudHMgYmFzZWQgb24gdGhlIGlucHV0IGltYWdlIGZvcm1hdFxyXG4gICAgaWYgKGlucHV0Zm9ybWF0ID09PSAnUkdCQScpIHtcclxuICAgICAgclRlbnNvclBvaW50ZXIgPSAwO1xyXG4gICAgICBnVGVuc29yUG9pbnRlciA9IHN0cmlkZTtcclxuICAgICAgYlRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAyO1xyXG4gICAgICBhVGVuc29yUG9pbnRlciA9IHN0cmlkZSAqIDM7XHJcbiAgICB9IGVsc2UgaWYgKGlucHV0Zm9ybWF0ID09PSAnUkdCJykge1xyXG4gICAgICByVGVuc29yUG9pbnRlciA9IDA7XHJcbiAgICAgIGdUZW5zb3JQb2ludGVyID0gc3RyaWRlO1xyXG4gICAgICBiVGVuc29yUG9pbnRlciA9IHN0cmlkZSAqIDI7XHJcbiAgICB9IGVsc2UgaWYgKGlucHV0Zm9ybWF0ID09PSAnUkJHJykge1xyXG4gICAgICByVGVuc29yUG9pbnRlciA9IDA7XHJcbiAgICAgIGJUZW5zb3JQb2ludGVyID0gc3RyaWRlO1xyXG4gICAgICBnVGVuc29yUG9pbnRlciA9IHN0cmlkZSAqIDI7XHJcbiAgICB9XHJcblxyXG4gICAgaW1hZ2UgPSBwaXhlbHMyRENvbnRleHQuY3JlYXRlSW1hZ2VEYXRhKHdpZHRoLCBoZWlnaHQpO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaGVpZ2h0ICogd2lkdGg7XHJcbiAgICAgICAgIHJJbWFnZVBvaW50ZXIgKz0gc3RlcCwgZ0ltYWdlUG9pbnRlciArPSBzdGVwLCBiSW1hZ2VQb2ludGVyICs9IHN0ZXAsIGFJbWFnZVBvaW50ZXIgKz0gc3RlcCwgaSsrKSB7XHJcbiAgICAgIGltYWdlLmRhdGFbckltYWdlUG9pbnRlcl0gPSAoKHRlbnNvci5kYXRhW3JUZW5zb3JQb2ludGVyKytdIGFzIG51bWJlcikgLSBub3JtQmlhc1swXSkgKiBub3JtTWVhblswXTsgIC8vIFIgdmFsdWVcclxuICAgICAgaW1hZ2UuZGF0YVtnSW1hZ2VQb2ludGVyXSA9ICgodGVuc29yLmRhdGFbZ1RlbnNvclBvaW50ZXIrK10gYXMgbnVtYmVyKSAtIG5vcm1CaWFzWzFdKSAqIG5vcm1NZWFuWzFdOyAgLy8gRyB2YWx1ZVxyXG4gICAgICBpbWFnZS5kYXRhW2JJbWFnZVBvaW50ZXJdID0gKCh0ZW5zb3IuZGF0YVtiVGVuc29yUG9pbnRlcisrXSBhcyBudW1iZXIpIC0gbm9ybUJpYXNbMl0pICogbm9ybU1lYW5bMl07ICAvLyBCIHZhbHVlXHJcbiAgICAgIGltYWdlLmRhdGFbYUltYWdlUG9pbnRlcl0gPSBhVGVuc29yUG9pbnRlciA9PT0gLTEgP1xyXG4gICAgICAgICAgMjU1IDpcclxuICAgICAgICAgICgodGVuc29yLmRhdGFbYVRlbnNvclBvaW50ZXIrK10gYXMgbnVtYmVyKSAtIG5vcm1CaWFzWzNdKSAqIG5vcm1NZWFuWzNdOyAgLy8gQSB2YWx1ZVxyXG4gICAgfVxyXG5cclxuICB9IGVsc2Uge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gbm90IGFjY2VzcyBpbWFnZSBkYXRhJyk7XHJcbiAgfVxyXG4gIHJldHVybiBpbWFnZTtcclxufTtcclxuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXHJcblxyXG5pbXBvcnQge09wdGlvbnNEaW1lbnNpb25zLCBPcHRpb25zRm9ybWF0LCBPcHRpb25zTm9ybWFsaXphdGlvblBhcmFtZXRlcnMsIE9wdGlvbnNUZW5zb3JGb3JtYXQsIE9wdGlvbnNUZW5zb3JMYXlvdXQsIFRlbnNvckZyb21HcHVCdWZmZXJPcHRpb25zLCBUZW5zb3JGcm9tSW1hZ2VCaXRtYXBPcHRpb25zLCBUZW5zb3JGcm9tSW1hZ2VEYXRhT3B0aW9ucywgVGVuc29yRnJvbUltYWdlRWxlbWVudE9wdGlvbnMsIFRlbnNvckZyb21UZXh0dXJlT3B0aW9ucywgVGVuc29yRnJvbVVybE9wdGlvbnN9IGZyb20gJy4vdGVuc29yLWZhY3RvcnkuanMnO1xyXG5pbXBvcnQge1RlbnNvcn0gZnJvbSAnLi90ZW5zb3ItaW1wbC5qcyc7XHJcbmltcG9ydCB7VGVuc29yIGFzIFRlbnNvckludGVyZmFjZX0gZnJvbSAnLi90ZW5zb3IuanMnO1xyXG5cclxuaW50ZXJmYWNlIEJ1ZmZlclRvVGVuc29yT3B0aW9ucyBleHRlbmRzIE9wdGlvbnNEaW1lbnNpb25zLCBPcHRpb25zVGVuc29yTGF5b3V0LCBPcHRpb25zTm9ybWFsaXphdGlvblBhcmFtZXRlcnMsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPcHRpb25zRm9ybWF0LCBPcHRpb25zVGVuc29yRm9ybWF0IHt9XHJcblxyXG4vKipcclxuICogQ3JlYXRlIGEgbmV3IHRlbnNvciBvYmplY3QgZnJvbSBpbWFnZSBvYmplY3RcclxuICpcclxuICogQHBhcmFtIGJ1ZmZlciAtIEV4dHJhY3RlZCBpbWFnZSBidWZmZXIgZGF0YSAtIGFzc3VtaW5nIFJHQkEgZm9ybWF0XHJcbiAqIEBwYXJhbSBpbWFnZUZvcm1hdCAtIGlucHV0IGltYWdlIGNvbmZpZ3VyYXRpb24gLSByZXF1aXJlZCBjb25maWd1cmF0aW9ucyBoZWlnaHQsIHdpZHRoLCBmb3JtYXRcclxuICogQHBhcmFtIHRlbnNvckZvcm1hdCAtIG91dHB1dCB0ZW5zb3IgY29uZmlndXJhdGlvbiAtIERlZmF1bHQgaXMgUkdCIGZvcm1hdFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGJ1ZmZlclRvVGVuc29yID0gKGJ1ZmZlcjogVWludDhDbGFtcGVkQXJyYXl8dW5kZWZpbmVkLCBvcHRpb25zOiBCdWZmZXJUb1RlbnNvck9wdGlvbnMpOiBUZW5zb3IgPT4ge1xyXG4gIGlmIChidWZmZXIgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbWFnZSBidWZmZXIgbXVzdCBiZSBkZWZpbmVkJyk7XHJcbiAgfVxyXG4gIGlmIChvcHRpb25zLmhlaWdodCA9PT0gdW5kZWZpbmVkIHx8IG9wdGlvbnMud2lkdGggPT09IHVuZGVmaW5lZCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbWFnZSBoZWlnaHQgYW5kIHdpZHRoIG11c3QgYmUgZGVmaW5lZCcpO1xyXG4gIH1cclxuICBpZiAob3B0aW9ucy50ZW5zb3JMYXlvdXQgPT09ICdOSFdDJykge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdOSFdDIFRlbnNvciBsYXlvdXQgaXMgbm90IHN1cHBvcnRlZCB5ZXQnKTtcclxuICB9XHJcblxyXG4gIGNvbnN0IHtoZWlnaHQsIHdpZHRofSA9IG9wdGlvbnM7XHJcblxyXG4gIGNvbnN0IG5vcm0gPSBvcHRpb25zLm5vcm0gPz8ge21lYW46IDI1NSwgYmlhczogMH07XHJcbiAgbGV0IG5vcm1NZWFuOiBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcclxuICBsZXQgbm9ybUJpYXM6IFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdO1xyXG5cclxuICBpZiAodHlwZW9mIChub3JtLm1lYW4pID09PSAnbnVtYmVyJykge1xyXG4gICAgbm9ybU1lYW4gPSBbbm9ybS5tZWFuLCBub3JtLm1lYW4sIG5vcm0ubWVhbiwgbm9ybS5tZWFuXTtcclxuICB9IGVsc2Uge1xyXG4gICAgbm9ybU1lYW4gPSBbbm9ybS5tZWFuIVswXSwgbm9ybS5tZWFuIVsxXSwgbm9ybS5tZWFuIVsyXSwgbm9ybS5tZWFuIVszXSA/PyAyNTVdO1xyXG4gIH1cclxuXHJcbiAgaWYgKHR5cGVvZiAobm9ybS5iaWFzKSA9PT0gJ251bWJlcicpIHtcclxuICAgIG5vcm1CaWFzID0gW25vcm0uYmlhcywgbm9ybS5iaWFzLCBub3JtLmJpYXMsIG5vcm0uYmlhc107XHJcbiAgfSBlbHNlIHtcclxuICAgIG5vcm1CaWFzID0gW25vcm0uYmlhcyFbMF0sIG5vcm0uYmlhcyFbMV0sIG5vcm0uYmlhcyFbMl0sIG5vcm0uYmlhcyFbM10gPz8gMF07XHJcbiAgfVxyXG5cclxuICBjb25zdCBpbnB1dGZvcm1hdCA9IG9wdGlvbnMuZm9ybWF0ICE9PSB1bmRlZmluZWQgPyBvcHRpb25zLmZvcm1hdCA6ICdSR0JBJztcclxuICAvLyBkZWZhdWx0IHZhbHVlIGlzIFJHQkEgc2luY2UgaW1hZ2VkYXRhIGFuZCBIVE1MSW1hZ2VFbGVtZW50IHVzZXMgaXRcclxuXHJcbiAgY29uc3Qgb3V0cHV0Zm9ybWF0ID1cclxuICAgICAgb3B0aW9ucy50ZW5zb3JGb3JtYXQgIT09IHVuZGVmaW5lZCA/IChvcHRpb25zLnRlbnNvckZvcm1hdCAhPT0gdW5kZWZpbmVkID8gb3B0aW9ucy50ZW5zb3JGb3JtYXQgOiAnUkdCJykgOiAnUkdCJztcclxuICBjb25zdCBzdHJpZGUgPSBoZWlnaHQgKiB3aWR0aDtcclxuICBjb25zdCBmbG9hdDMyRGF0YSA9IG91dHB1dGZvcm1hdCA9PT0gJ1JHQkEnID8gbmV3IEZsb2F0MzJBcnJheShzdHJpZGUgKiA0KSA6IG5ldyBGbG9hdDMyQXJyYXkoc3RyaWRlICogMyk7XHJcblxyXG4gIC8vIERlZmF1bHQgcG9pbnRlciBhc3NpZ25tZW50c1xyXG4gIGxldCBzdGVwID0gNCwgckltYWdlUG9pbnRlciA9IDAsIGdJbWFnZVBvaW50ZXIgPSAxLCBiSW1hZ2VQb2ludGVyID0gMiwgYUltYWdlUG9pbnRlciA9IDM7XHJcbiAgbGV0IHJUZW5zb3JQb2ludGVyID0gMCwgZ1RlbnNvclBvaW50ZXIgPSBzdHJpZGUsIGJUZW5zb3JQb2ludGVyID0gc3RyaWRlICogMiwgYVRlbnNvclBvaW50ZXIgPSAtMTtcclxuXHJcbiAgLy8gVXBkYXRpbmcgdGhlIHBvaW50ZXIgYXNzaWdubWVudHMgYmFzZWQgb24gdGhlIGlucHV0IGltYWdlIGZvcm1hdFxyXG4gIGlmIChpbnB1dGZvcm1hdCA9PT0gJ1JHQicpIHtcclxuICAgIHN0ZXAgPSAzO1xyXG4gICAgckltYWdlUG9pbnRlciA9IDA7XHJcbiAgICBnSW1hZ2VQb2ludGVyID0gMTtcclxuICAgIGJJbWFnZVBvaW50ZXIgPSAyO1xyXG4gICAgYUltYWdlUG9pbnRlciA9IC0xO1xyXG4gIH1cclxuXHJcbiAgLy8gVXBkYXRpbmcgdGhlIHBvaW50ZXIgYXNzaWdubWVudHMgYmFzZWQgb24gdGhlIG91dHB1dCB0ZW5zb3IgZm9ybWF0XHJcbiAgaWYgKG91dHB1dGZvcm1hdCA9PT0gJ1JHQkEnKSB7XHJcbiAgICBhVGVuc29yUG9pbnRlciA9IHN0cmlkZSAqIDM7XHJcbiAgfSBlbHNlIGlmIChvdXRwdXRmb3JtYXQgPT09ICdSQkcnKSB7XHJcbiAgICByVGVuc29yUG9pbnRlciA9IDA7XHJcbiAgICBiVGVuc29yUG9pbnRlciA9IHN0cmlkZTtcclxuICAgIGdUZW5zb3JQb2ludGVyID0gc3RyaWRlICogMjtcclxuICB9IGVsc2UgaWYgKG91dHB1dGZvcm1hdCA9PT0gJ0JHUicpIHtcclxuICAgIGJUZW5zb3JQb2ludGVyID0gMDtcclxuICAgIGdUZW5zb3JQb2ludGVyID0gc3RyaWRlO1xyXG4gICAgclRlbnNvclBvaW50ZXIgPSBzdHJpZGUgKiAyO1xyXG4gIH1cclxuXHJcbiAgZm9yIChsZXQgaSA9IDA7IGkgPCBzdHJpZGU7XHJcbiAgICAgICBpKyssIHJJbWFnZVBvaW50ZXIgKz0gc3RlcCwgYkltYWdlUG9pbnRlciArPSBzdGVwLCBnSW1hZ2VQb2ludGVyICs9IHN0ZXAsIGFJbWFnZVBvaW50ZXIgKz0gc3RlcCkge1xyXG4gICAgZmxvYXQzMkRhdGFbclRlbnNvclBvaW50ZXIrK10gPSAoYnVmZmVyW3JJbWFnZVBvaW50ZXJdICsgbm9ybUJpYXNbMF0pIC8gbm9ybU1lYW5bMF07XHJcbiAgICBmbG9hdDMyRGF0YVtnVGVuc29yUG9pbnRlcisrXSA9IChidWZmZXJbZ0ltYWdlUG9pbnRlcl0gKyBub3JtQmlhc1sxXSkgLyBub3JtTWVhblsxXTtcclxuICAgIGZsb2F0MzJEYXRhW2JUZW5zb3JQb2ludGVyKytdID0gKGJ1ZmZlcltiSW1hZ2VQb2ludGVyXSArIG5vcm1CaWFzWzJdKSAvIG5vcm1NZWFuWzJdO1xyXG4gICAgaWYgKGFUZW5zb3JQb2ludGVyICE9PSAtMSAmJiBhSW1hZ2VQb2ludGVyICE9PSAtMSkge1xyXG4gICAgICBmbG9hdDMyRGF0YVthVGVuc29yUG9pbnRlcisrXSA9IChidWZmZXJbYUltYWdlUG9pbnRlcl0gKyBub3JtQmlhc1szXSkgLyBub3JtTWVhblszXTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIC8vIEZsb2F0MzJBcnJheSAtPiBvcnQuVGVuc29yXHJcbiAgY29uc3Qgb3V0cHV0VGVuc29yID0gb3V0cHV0Zm9ybWF0ID09PSAnUkdCQScgPyBuZXcgVGVuc29yKCdmbG9hdDMyJywgZmxvYXQzMkRhdGEsIFsxLCA0LCBoZWlnaHQsIHdpZHRoXSkgOlxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbmV3IFRlbnNvcignZmxvYXQzMicsIGZsb2F0MzJEYXRhLCBbMSwgMywgaGVpZ2h0LCB3aWR0aF0pO1xyXG4gIHJldHVybiBvdXRwdXRUZW5zb3I7XHJcbn07XHJcblxyXG4vKipcclxuICogaW1wbGVtZW50YXRpb24gb2YgVGVuc29yLmZyb21JbWFnZSgpLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHRlbnNvckZyb21JbWFnZSA9IGFzeW5jKFxyXG4gICAgaW1hZ2U6IEltYWdlRGF0YXxIVE1MSW1hZ2VFbGVtZW50fEltYWdlQml0bWFwfHN0cmluZyxcclxuICAgIG9wdGlvbnM/OiBUZW5zb3JGcm9tSW1hZ2VEYXRhT3B0aW9uc3xUZW5zb3JGcm9tSW1hZ2VFbGVtZW50T3B0aW9uc3xUZW5zb3JGcm9tSW1hZ2VCaXRtYXBPcHRpb25zfFxyXG4gICAgVGVuc29yRnJvbVVybE9wdGlvbnMpOiBQcm9taXNlPFRlbnNvcj4gPT4ge1xyXG4gIC8vIGNoZWNraW5nIHRoZSB0eXBlIG9mIGltYWdlIG9iamVjdFxyXG4gIGNvbnN0IGlzSFRNTEltYWdlRWxlID0gdHlwZW9mIChIVE1MSW1hZ2VFbGVtZW50KSAhPT0gJ3VuZGVmaW5lZCcgJiYgaW1hZ2UgaW5zdGFuY2VvZiBIVE1MSW1hZ2VFbGVtZW50O1xyXG4gIGNvbnN0IGlzSW1hZ2VEYXRhRWxlID0gdHlwZW9mIChJbWFnZURhdGEpICE9PSAndW5kZWZpbmVkJyAmJiBpbWFnZSBpbnN0YW5jZW9mIEltYWdlRGF0YTtcclxuICBjb25zdCBpc0ltYWdlQml0bWFwID0gdHlwZW9mIChJbWFnZUJpdG1hcCkgIT09ICd1bmRlZmluZWQnICYmIGltYWdlIGluc3RhbmNlb2YgSW1hZ2VCaXRtYXA7XHJcbiAgY29uc3QgaXNTdHJpbmcgPSB0eXBlb2YgaW1hZ2UgPT09ICdzdHJpbmcnO1xyXG5cclxuICBsZXQgZGF0YTogVWludDhDbGFtcGVkQXJyYXl8dW5kZWZpbmVkO1xyXG4gIGxldCBidWZmZXJUb1RlbnNvck9wdGlvbnM6IEJ1ZmZlclRvVGVuc29yT3B0aW9ucyA9IG9wdGlvbnMgPz8ge307XHJcblxyXG4gIGNvbnN0IGNyZWF0ZUNhbnZhcyA9ICgpID0+IHtcclxuICAgIGlmICh0eXBlb2YgZG9jdW1lbnQgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIHJldHVybiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKTtcclxuICAgIH0gZWxzZSBpZiAodHlwZW9mIE9mZnNjcmVlbkNhbnZhcyAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgcmV0dXJuIG5ldyBPZmZzY3JlZW5DYW52YXMoMSwgMSk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0NhbnZhcyBpcyBub3Qgc3VwcG9ydGVkJyk7XHJcbiAgICB9XHJcbiAgfTtcclxuICBjb25zdCBjcmVhdGVDYW52YXNDb250ZXh0ID0gKGNhbnZhczogSFRNTENhbnZhc0VsZW1lbnR8T2Zmc2NyZWVuQ2FudmFzKSA9PiB7XHJcbiAgICBpZiAoY2FudmFzIGluc3RhbmNlb2YgSFRNTENhbnZhc0VsZW1lbnQpIHtcclxuICAgICAgcmV0dXJuIGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpO1xyXG4gICAgfSBlbHNlIGlmIChjYW52YXMgaW5zdGFuY2VvZiBPZmZzY3JlZW5DYW52YXMpIHtcclxuICAgICAgcmV0dXJuIGNhbnZhcy5nZXRDb250ZXh0KCcyZCcpIGFzIE9mZnNjcmVlbkNhbnZhc1JlbmRlcmluZ0NvbnRleHQyRDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIHJldHVybiBudWxsO1xyXG4gICAgfVxyXG4gIH07XHJcbiAgLy8gZmlsbGluZyBhbmQgY2hlY2tpbmcgaW1hZ2UgY29uZmlndXJhdGlvbiBvcHRpb25zXHJcbiAgaWYgKGlzSFRNTEltYWdlRWxlKSB7XHJcbiAgICAvLyBIVE1MSW1hZ2VFbGVtZW50IC0gaW1hZ2Ugb2JqZWN0IC0gZm9ybWF0IGlzIFJHQkEgYnkgZGVmYXVsdFxyXG4gICAgY29uc3QgY2FudmFzID0gY3JlYXRlQ2FudmFzKCk7XHJcbiAgICBjYW52YXMud2lkdGggPSBpbWFnZS53aWR0aDtcclxuICAgIGNhbnZhcy5oZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XHJcbiAgICBjb25zdCBwaXhlbHMyRENvbnRleHQgPSBjcmVhdGVDYW52YXNDb250ZXh0KGNhbnZhcyk7XHJcblxyXG4gICAgaWYgKHBpeGVsczJEQ29udGV4dCAhPSBudWxsKSB7XHJcbiAgICAgIGxldCBoZWlnaHQgPSBpbWFnZS5oZWlnaHQ7XHJcbiAgICAgIGxldCB3aWR0aCA9IGltYWdlLndpZHRoO1xyXG4gICAgICBpZiAob3B0aW9ucyAhPT0gdW5kZWZpbmVkICYmIG9wdGlvbnMucmVzaXplZEhlaWdodCAhPT0gdW5kZWZpbmVkICYmIG9wdGlvbnMucmVzaXplZFdpZHRoICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICBoZWlnaHQgPSBvcHRpb25zLnJlc2l6ZWRIZWlnaHQ7XHJcbiAgICAgICAgd2lkdGggPSBvcHRpb25zLnJlc2l6ZWRXaWR0aDtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKG9wdGlvbnMgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICAgICAgaWYgKG9wdGlvbnMudGVuc29yRm9ybWF0ICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignSW1hZ2UgaW5wdXQgY29uZmlnIGZvcm1hdCBtdXN0IGJlIFJHQkEgZm9yIEhUTUxJbWFnZUVsZW1lbnQnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLnRlbnNvckZvcm1hdCA9ICdSR0JBJztcclxuICAgICAgICB9XHJcbiAgICAgICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgICBidWZmZXJUb1RlbnNvck9wdGlvbnMud2lkdGggPSB3aWR0aDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBidWZmZXJUb1RlbnNvck9wdGlvbnMudGVuc29yRm9ybWF0ID0gJ1JHQkEnO1xyXG4gICAgICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucy5oZWlnaHQgPSBoZWlnaHQ7XHJcbiAgICAgICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLndpZHRoID0gd2lkdGg7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIHBpeGVsczJEQ29udGV4dC5kcmF3SW1hZ2UoaW1hZ2UsIDAsIDApO1xyXG4gICAgICBkYXRhID0gcGl4ZWxzMkRDb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCB3aWR0aCwgaGVpZ2h0KS5kYXRhO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gbm90IGFjY2VzcyBpbWFnZSBkYXRhJyk7XHJcbiAgICB9XHJcbiAgfSBlbHNlIGlmIChpc0ltYWdlRGF0YUVsZSkge1xyXG4gICAgbGV0IGhlaWdodDogbnVtYmVyO1xyXG4gICAgbGV0IHdpZHRoOiBudW1iZXI7XHJcblxyXG4gICAgaWYgKG9wdGlvbnMgIT09IHVuZGVmaW5lZCAmJiBvcHRpb25zLnJlc2l6ZWRXaWR0aCAhPT0gdW5kZWZpbmVkICYmIG9wdGlvbnMucmVzaXplZEhlaWdodCAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIGhlaWdodCA9IG9wdGlvbnMucmVzaXplZEhlaWdodDtcclxuICAgICAgd2lkdGggPSBvcHRpb25zLnJlc2l6ZWRXaWR0aDtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGhlaWdodCA9IGltYWdlLmhlaWdodDtcclxuICAgICAgd2lkdGggPSBpbWFnZS53aWR0aDtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3B0aW9ucyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucyA9IG9wdGlvbnM7XHJcbiAgICB9XHJcbiAgICBidWZmZXJUb1RlbnNvck9wdGlvbnMuZm9ybWF0ID0gJ1JHQkEnO1xyXG4gICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLmhlaWdodCA9IGhlaWdodDtcclxuICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucy53aWR0aCA9IHdpZHRoO1xyXG5cclxuICAgIGlmIChvcHRpb25zICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgY29uc3QgdGVtcENhbnZhcyA9IGNyZWF0ZUNhbnZhcygpO1xyXG5cclxuICAgICAgdGVtcENhbnZhcy53aWR0aCA9IHdpZHRoO1xyXG4gICAgICB0ZW1wQ2FudmFzLmhlaWdodCA9IGhlaWdodDtcclxuXHJcbiAgICAgIGNvbnN0IHBpeGVsczJEQ29udGV4dCA9IGNyZWF0ZUNhbnZhc0NvbnRleHQodGVtcENhbnZhcyk7XHJcblxyXG4gICAgICBpZiAocGl4ZWxzMkRDb250ZXh0ICE9IG51bGwpIHtcclxuICAgICAgICBwaXhlbHMyRENvbnRleHQucHV0SW1hZ2VEYXRhKGltYWdlLCAwLCAwKTtcclxuICAgICAgICBkYXRhID0gcGl4ZWxzMkRDb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCB3aWR0aCwgaGVpZ2h0KS5kYXRhO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignQ2FuIG5vdCBhY2Nlc3MgaW1hZ2UgZGF0YScpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICBkYXRhID0gaW1hZ2UuZGF0YTtcclxuICAgIH1cclxuICB9IGVsc2UgaWYgKGlzSW1hZ2VCaXRtYXApIHtcclxuICAgIC8vIEltYWdlQml0bWFwIC0gaW1hZ2Ugb2JqZWN0IC0gZm9ybWF0IG11c3QgYmUgcHJvdmlkZWQgYnkgdXNlclxyXG4gICAgaWYgKG9wdGlvbnMgPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsZWFzZSBwcm92aWRlIGltYWdlIGNvbmZpZyB3aXRoIGZvcm1hdCBmb3IgSW1hZ2ViaXRtYXAnKTtcclxuICAgIH1cclxuXHJcbiAgICBjb25zdCBjYW52YXMgPSBjcmVhdGVDYW52YXMoKTtcclxuICAgIGNhbnZhcy53aWR0aCA9IGltYWdlLndpZHRoO1xyXG4gICAgY2FudmFzLmhlaWdodCA9IGltYWdlLmhlaWdodDtcclxuICAgIGNvbnN0IHBpeGVsczJEQ29udGV4dCA9IGNyZWF0ZUNhbnZhc0NvbnRleHQoY2FudmFzKTtcclxuXHJcbiAgICBpZiAocGl4ZWxzMkRDb250ZXh0ICE9IG51bGwpIHtcclxuICAgICAgY29uc3QgaGVpZ2h0ID0gaW1hZ2UuaGVpZ2h0O1xyXG4gICAgICBjb25zdCB3aWR0aCA9IGltYWdlLndpZHRoO1xyXG4gICAgICBwaXhlbHMyRENvbnRleHQuZHJhd0ltYWdlKGltYWdlLCAwLCAwLCB3aWR0aCwgaGVpZ2h0KTtcclxuICAgICAgZGF0YSA9IHBpeGVsczJEQ29udGV4dC5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGgsIGhlaWdodCkuZGF0YTtcclxuICAgICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLmhlaWdodCA9IGhlaWdodDtcclxuICAgICAgYnVmZmVyVG9UZW5zb3JPcHRpb25zLndpZHRoID0gd2lkdGg7XHJcbiAgICAgIHJldHVybiBidWZmZXJUb1RlbnNvcihkYXRhLCBidWZmZXJUb1RlbnNvck9wdGlvbnMpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdDYW4gbm90IGFjY2VzcyBpbWFnZSBkYXRhJyk7XHJcbiAgICB9XHJcbiAgfSBlbHNlIGlmIChpc1N0cmluZykge1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgY29uc3QgY2FudmFzID0gY3JlYXRlQ2FudmFzKCk7XHJcbiAgICAgIGNvbnN0IGNvbnRleHQgPSBjcmVhdGVDYW52YXNDb250ZXh0KGNhbnZhcyk7XHJcbiAgICAgIGlmICghaW1hZ2UgfHwgIWNvbnRleHQpIHtcclxuICAgICAgICByZXR1cm4gcmVqZWN0KCk7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgbmV3SW1hZ2UgPSBuZXcgSW1hZ2UoKTtcclxuICAgICAgbmV3SW1hZ2UuY3Jvc3NPcmlnaW4gPSAnQW5vbnltb3VzJztcclxuICAgICAgbmV3SW1hZ2Uuc3JjID0gaW1hZ2U7XHJcbiAgICAgIG5ld0ltYWdlLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgICBjYW52YXMud2lkdGggPSBuZXdJbWFnZS53aWR0aDtcclxuICAgICAgICBjYW52YXMuaGVpZ2h0ID0gbmV3SW1hZ2UuaGVpZ2h0O1xyXG4gICAgICAgIGNvbnRleHQuZHJhd0ltYWdlKG5ld0ltYWdlLCAwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xyXG4gICAgICAgIGNvbnN0IGltZyA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGNhbnZhcy53aWR0aCwgY2FudmFzLmhlaWdodCk7XHJcblxyXG4gICAgICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucy5oZWlnaHQgPSBjYW52YXMuaGVpZ2h0O1xyXG4gICAgICAgIGJ1ZmZlclRvVGVuc29yT3B0aW9ucy53aWR0aCA9IGNhbnZhcy53aWR0aDtcclxuICAgICAgICByZXNvbHZlKGJ1ZmZlclRvVGVuc29yKGltZy5kYXRhLCBidWZmZXJUb1RlbnNvck9wdGlvbnMpKTtcclxuICAgICAgfTtcclxuICAgIH0pO1xyXG4gIH0gZWxzZSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ0lucHV0IGRhdGEgcHJvdmlkZWQgaXMgbm90IHN1cHBvcnRlZCAtIGFib3J0ZWQgdGVuc29yIGNyZWF0aW9uJyk7XHJcbiAgfVxyXG5cclxuICBpZiAoZGF0YSAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICByZXR1cm4gYnVmZmVyVG9UZW5zb3IoZGF0YSwgYnVmZmVyVG9UZW5zb3JPcHRpb25zKTtcclxuICB9IGVsc2Uge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKCdJbnB1dCBkYXRhIHByb3ZpZGVkIGlzIG5vdCBzdXBwb3J0ZWQgLSBhYm9ydGVkIHRlbnNvciBjcmVhdGlvbicpO1xyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBpbXBsZW1lbnRhdGlvbiBvZiBUZW5zb3IuZnJvbVRleHR1cmUoKS5cclxuICovXHJcbmV4cG9ydCBjb25zdCB0ZW5zb3JGcm9tVGV4dHVyZSA9IDxUIGV4dGVuZHMgVGVuc29ySW50ZXJmYWNlLlRleHR1cmVEYXRhVHlwZXM+KFxyXG4gICAgdGV4dHVyZTogVGVuc29ySW50ZXJmYWNlLlRleHR1cmVUeXBlLCBvcHRpb25zOiBUZW5zb3JGcm9tVGV4dHVyZU9wdGlvbnM8VD4pOiBUZW5zb3IgPT4ge1xyXG4gIGNvbnN0IHt3aWR0aCwgaGVpZ2h0LCBkb3dubG9hZCwgZGlzcG9zZX0gPSBvcHRpb25zO1xyXG4gIC8vIEFsd2F5cyBhc3N1bWUgUkdCQUYzMi4gVE9ETzogc3VwcG9ydCBkaWZmZXJlbnQgdGV4dHVyZSBmb3JtYXRcclxuICBjb25zdCBkaW1zID0gWzEsIGhlaWdodCwgd2lkdGgsIDRdO1xyXG4gIHJldHVybiBuZXcgVGVuc29yKHtsb2NhdGlvbjogJ3RleHR1cmUnLCB0eXBlOiAnZmxvYXQzMicsIHRleHR1cmUsIGRpbXMsIGRvd25sb2FkLCBkaXNwb3NlfSk7XHJcbn07XHJcblxyXG4vKipcclxuICogaW1wbGVtZW50YXRpb24gb2YgVGVuc29yLmZyb21HcHVCdWZmZXIoKS5cclxuICovXHJcbmV4cG9ydCBjb25zdCB0ZW5zb3JGcm9tR3B1QnVmZmVyID0gPFQgZXh0ZW5kcyBUZW5zb3JJbnRlcmZhY2UuR3B1QnVmZmVyRGF0YVR5cGVzPihcclxuICAgIGdwdUJ1ZmZlcjogVGVuc29ySW50ZXJmYWNlLkdwdUJ1ZmZlclR5cGUsIG9wdGlvbnM6IFRlbnNvckZyb21HcHVCdWZmZXJPcHRpb25zPFQ+KTogVGVuc29yID0+IHtcclxuICBjb25zdCB7ZGF0YVR5cGUsIGRpbXMsIGRvd25sb2FkLCBkaXNwb3NlfSA9IG9wdGlvbnM7XHJcbiAgcmV0dXJuIG5ldyBUZW5zb3Ioe2xvY2F0aW9uOiAnZ3B1LWJ1ZmZlcicsIHR5cGU6IGRhdGFUeXBlID8/ICdmbG9hdDMyJywgZ3B1QnVmZmVyLCBkaW1zLCBkb3dubG9hZCwgZGlzcG9zZX0pO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIGltcGxlbWVudGF0aW9uIG9mIFRlbnNvci5mcm9tUGlubmVkQnVmZmVyKCkuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgdGVuc29yRnJvbVBpbm5lZEJ1ZmZlciA9IDxUIGV4dGVuZHMgVGVuc29ySW50ZXJmYWNlLkNwdVBpbm5lZERhdGFUeXBlcz4oXHJcbiAgICB0eXBlOiBULCBidWZmZXI6IFRlbnNvckludGVyZmFjZS5EYXRhVHlwZU1hcFtUXSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVGVuc29yID0+XHJcbiAgICBuZXcgVGVuc29yKHtsb2NhdGlvbjogJ2NwdS1waW5uZWQnLCB0eXBlLCBkYXRhOiBidWZmZXIsIGRpbXM6IGRpbXMgPz8gW2J1ZmZlci5sZW5ndGhdfSk7XHJcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxyXG5cclxuaW1wb3J0IHtUZW5zb3J9IGZyb20gJy4vdGVuc29yLmpzJztcclxuXHJcbmV4cG9ydCB0eXBlIFN1cHBvcnRlZFR5cGVkQXJyYXlDb25zdHJ1Y3RvcnMgPSBGbG9hdDMyQXJyYXlDb25zdHJ1Y3RvcnxVaW50OEFycmF5Q29uc3RydWN0b3J8SW50OEFycmF5Q29uc3RydWN0b3J8XHJcbiAgICBVaW50MTZBcnJheUNvbnN0cnVjdG9yfEludDE2QXJyYXlDb25zdHJ1Y3RvcnxJbnQzMkFycmF5Q29uc3RydWN0b3J8QmlnSW50NjRBcnJheUNvbnN0cnVjdG9yfFVpbnQ4QXJyYXlDb25zdHJ1Y3RvcnxcclxuICAgIEZsb2F0NjRBcnJheUNvbnN0cnVjdG9yfFVpbnQzMkFycmF5Q29uc3RydWN0b3J8QmlnVWludDY0QXJyYXlDb25zdHJ1Y3RvcjtcclxuZXhwb3J0IHR5cGUgU3VwcG9ydGVkVHlwZWRBcnJheSA9IEluc3RhbmNlVHlwZTxTdXBwb3J0ZWRUeXBlZEFycmF5Q29uc3RydWN0b3JzPjtcclxuXHJcbi8vIGEgcnVudGltZSBtYXAgdGhhdCBtYXBzIHR5cGUgc3RyaW5nIHRvIFR5cGVkQXJyYXkgY29uc3RydWN0b3IuIFNob3VsZCBtYXRjaCBUZW5zb3IuRGF0YVR5cGVNYXAuXHJcbmV4cG9ydCBjb25zdCBOVU1FUklDX1RFTlNPUl9UWVBFX1RPX1RZUEVEQVJSQVlfTUFQID0gbmV3IE1hcDxzdHJpbmcsIFN1cHBvcnRlZFR5cGVkQXJyYXlDb25zdHJ1Y3RvcnM+KFtcclxuICBbJ2Zsb2F0MzInLCBGbG9hdDMyQXJyYXldLFxyXG4gIFsndWludDgnLCBVaW50OEFycmF5XSxcclxuICBbJ2ludDgnLCBJbnQ4QXJyYXldLFxyXG4gIFsndWludDE2JywgVWludDE2QXJyYXldLFxyXG4gIFsnaW50MTYnLCBJbnQxNkFycmF5XSxcclxuICBbJ2ludDMyJywgSW50MzJBcnJheV0sXHJcbiAgWydib29sJywgVWludDhBcnJheV0sXHJcbiAgWydmbG9hdDY0JywgRmxvYXQ2NEFycmF5XSxcclxuICBbJ3VpbnQzMicsIFVpbnQzMkFycmF5XSxcclxuXSk7XHJcblxyXG4vLyBhIHJ1bnRpbWUgbWFwIHRoYXQgbWFwcyB0eXBlIHN0cmluZyB0byBUeXBlZEFycmF5IGNvbnN0cnVjdG9yLiBTaG91bGQgbWF0Y2ggVGVuc29yLkRhdGFUeXBlTWFwLlxyXG5leHBvcnQgY29uc3QgTlVNRVJJQ19URU5TT1JfVFlQRURBUlJBWV9UT19UWVBFX01BUCA9IG5ldyBNYXA8U3VwcG9ydGVkVHlwZWRBcnJheUNvbnN0cnVjdG9ycywgVGVuc29yLlR5cGU+KFtcclxuICBbRmxvYXQzMkFycmF5LCAnZmxvYXQzMiddLFxyXG4gIFtVaW50OEFycmF5LCAndWludDgnXSxcclxuICBbSW50OEFycmF5LCAnaW50OCddLFxyXG4gIFtVaW50MTZBcnJheSwgJ3VpbnQxNiddLFxyXG4gIFtJbnQxNkFycmF5LCAnaW50MTYnXSxcclxuICBbSW50MzJBcnJheSwgJ2ludDMyJ10sXHJcbiAgW0Zsb2F0NjRBcnJheSwgJ2Zsb2F0NjQnXSxcclxuICBbVWludDMyQXJyYXksICd1aW50MzInXSxcclxuXSk7XHJcblxyXG4vLyBhIGR1bW15IHR5cGUgZGVjbGFyYXRpb24gZm9yIEZsb2F0MTZBcnJheSBpbiBjYXNlIGFueSBwb2x5ZmlsbCBpcyBhdmFpbGFibGUuXHJcbmRlY2xhcmUgZ2xvYmFsIHtcclxuICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uLCBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZXhwbGljaXQtYW55XHJcbiAgY29uc3QgRmxvYXQxNkFycmF5OiBhbnk7XHJcbn1cclxuXHJcbi8vIHRoZSBmb2xsb3dpbmcgY29kZSBhbGxvd3MgZGVsYXlpbmcgZXhlY3V0aW9uIG9mIEJpZ0ludC9GbG9hdDE2QXJyYXkgY2hlY2tpbmcuIFRoaXMgYWxsb3dzIGxhenkgaW5pdGlhbGl6YXRpb24gZm9yXHJcbi8vIE5VTUVSSUNfVEVOU09SX1RZUEVfVE9fVFlQRURBUlJBWV9NQVAgYW5kIE5VTUVSSUNfVEVOU09SX1RZUEVEQVJSQVlfVE9fVFlQRV9NQVAsIHdoaWNoIGFsbG93cyBCaWdJbnQvRmxvYXQxNkFycmF5XHJcbi8vIHBvbHlmaWxsIGlmIGF2YWlsYWJsZS5cclxubGV0IGlzVHlwZWRBcnJheUNoZWNrZWQgPSBmYWxzZTtcclxuZXhwb3J0IGNvbnN0IGNoZWNrVHlwZWRBcnJheSA9ICgpID0+IHtcclxuICBpZiAoIWlzVHlwZWRBcnJheUNoZWNrZWQpIHtcclxuICAgIGlzVHlwZWRBcnJheUNoZWNrZWQgPSB0cnVlO1xyXG4gICAgY29uc3QgaXNCaWdJbnQ2NEFycmF5QXZhaWxhYmxlID0gdHlwZW9mIEJpZ0ludDY0QXJyYXkgIT09ICd1bmRlZmluZWQnICYmIEJpZ0ludDY0QXJyYXkuZnJvbTtcclxuICAgIGNvbnN0IGlzQmlnVWludDY0QXJyYXlBdmFpbGFibGUgPSB0eXBlb2YgQmlnVWludDY0QXJyYXkgIT09ICd1bmRlZmluZWQnICYmIEJpZ1VpbnQ2NEFycmF5LmZyb207XHJcbiAgICBjb25zdCBpc0Zsb2F0MTZBcnJheUF2YWlsYWJsZSA9IHR5cGVvZiBGbG9hdDE2QXJyYXkgIT09ICd1bmRlZmluZWQnICYmIEZsb2F0MTZBcnJheS5mcm9tO1xyXG5cclxuICAgIGlmIChpc0JpZ0ludDY0QXJyYXlBdmFpbGFibGUpIHtcclxuICAgICAgTlVNRVJJQ19URU5TT1JfVFlQRV9UT19UWVBFREFSUkFZX01BUC5zZXQoJ2ludDY0JywgQmlnSW50NjRBcnJheSk7XHJcbiAgICAgIE5VTUVSSUNfVEVOU09SX1RZUEVEQVJSQVlfVE9fVFlQRV9NQVAuc2V0KEJpZ0ludDY0QXJyYXksICdpbnQ2NCcpO1xyXG4gICAgfVxyXG4gICAgaWYgKGlzQmlnVWludDY0QXJyYXlBdmFpbGFibGUpIHtcclxuICAgICAgTlVNRVJJQ19URU5TT1JfVFlQRV9UT19UWVBFREFSUkFZX01BUC5zZXQoJ3VpbnQ2NCcsIEJpZ1VpbnQ2NEFycmF5KTtcclxuICAgICAgTlVNRVJJQ19URU5TT1JfVFlQRURBUlJBWV9UT19UWVBFX01BUC5zZXQoQmlnVWludDY0QXJyYXksICd1aW50NjQnKTtcclxuICAgIH1cclxuICAgIGlmIChpc0Zsb2F0MTZBcnJheUF2YWlsYWJsZSkge1xyXG4gICAgICBOVU1FUklDX1RFTlNPUl9UWVBFX1RPX1RZUEVEQVJSQVlfTUFQLnNldCgnZmxvYXQxNicsIEZsb2F0MTZBcnJheSk7XHJcbiAgICAgIE5VTUVSSUNfVEVOU09SX1RZUEVEQVJSQVlfVE9fVFlQRV9NQVAuc2V0KEZsb2F0MTZBcnJheSwgJ2Zsb2F0MTYnKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIC8vIGlmIEZsb2F0MTZBcnJheSBpcyBub3QgYXZhaWxhYmxlLCB1c2UgJ1VpbnQxNkFycmF5JyB0byBzdG9yZSB0aGUgZGF0YS5cclxuICAgICAgTlVNRVJJQ19URU5TT1JfVFlQRV9UT19UWVBFREFSUkFZX01BUC5zZXQoJ2Zsb2F0MTYnLCBVaW50MTZBcnJheSk7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cclxuXHJcbmltcG9ydCB7Q3B1UGlubmVkQ29uc3RydWN0b3JQYXJhbWV0ZXJzLCBHcHVCdWZmZXJDb25zdHJ1Y3RvclBhcmFtZXRlcnMsIFRleHR1cmVDb25zdHJ1Y3RvclBhcmFtZXRlcnN9IGZyb20gJy4vdGVuc29yLWZhY3RvcnkuanMnO1xyXG5pbXBvcnQge1RlbnNvcn0gZnJvbSAnLi90ZW5zb3ItaW1wbC5qcyc7XHJcblxyXG4vKipcclxuICogY2FsY3VsYXRlIHNpemUgZnJvbSBkaW1zLlxyXG4gKlxyXG4gKiBAcGFyYW0gZGltcyB0aGUgZGltcyBhcnJheS4gTWF5IGJlIGFuIGlsbGVnYWwgaW5wdXQuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgY2FsY3VsYXRlU2l6ZSA9IChkaW1zOiByZWFkb25seSB1bmtub3duW10pOiBudW1iZXIgPT4ge1xyXG4gIGxldCBzaXplID0gMTtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IGRpbXMubGVuZ3RoOyBpKyspIHtcclxuICAgIGNvbnN0IGRpbSA9IGRpbXNbaV07XHJcbiAgICBpZiAodHlwZW9mIGRpbSAhPT0gJ251bWJlcicgfHwgIU51bWJlci5pc1NhZmVJbnRlZ2VyKGRpbSkpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgZGltc1ske2l9XSBtdXN0IGJlIGFuIGludGVnZXIsIGdvdDogJHtkaW19YCk7XHJcbiAgICB9XHJcbiAgICBpZiAoZGltIDwgMCkge1xyXG4gICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgZGltc1ske2l9XSBtdXN0IGJlIGEgbm9uLW5lZ2F0aXZlIGludGVnZXIsIGdvdDogJHtkaW19YCk7XHJcbiAgICB9XHJcbiAgICBzaXplICo9IGRpbTtcclxuICB9XHJcbiAgcmV0dXJuIHNpemU7XHJcbn07XHJcblxyXG4vKipcclxuICogaW1wbGVtZW50YXRpb24gb2YgVGVuc29yLnJlc2hhcGUoKVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHRlbnNvclJlc2hhcGUgPSAodGVuc29yOiBUZW5zb3IsIGRpbXM6IHJlYWRvbmx5IG51bWJlcltdKTogVGVuc29yID0+IHtcclxuICBzd2l0Y2ggKHRlbnNvci5sb2NhdGlvbikge1xyXG4gICAgY2FzZSAnY3B1JzpcclxuICAgICAgcmV0dXJuIG5ldyBUZW5zb3IodGVuc29yLnR5cGUsIHRlbnNvci5kYXRhLCBkaW1zKTtcclxuICAgIGNhc2UgJ2NwdS1waW5uZWQnOlxyXG4gICAgICByZXR1cm4gbmV3IFRlbnNvcih7XHJcbiAgICAgICAgbG9jYXRpb246ICdjcHUtcGlubmVkJyxcclxuICAgICAgICBkYXRhOiB0ZW5zb3IuZGF0YSBhcyBDcHVQaW5uZWRDb25zdHJ1Y3RvclBhcmFtZXRlcnNbJ2RhdGEnXSxcclxuICAgICAgICB0eXBlOiB0ZW5zb3IudHlwZSBhcyBDcHVQaW5uZWRDb25zdHJ1Y3RvclBhcmFtZXRlcnNbJ3R5cGUnXSxcclxuICAgICAgICBkaW1zLFxyXG4gICAgICB9KTtcclxuICAgIGNhc2UgJ3RleHR1cmUnOlxyXG4gICAgICByZXR1cm4gbmV3IFRlbnNvcih7XHJcbiAgICAgICAgbG9jYXRpb246ICd0ZXh0dXJlJyxcclxuICAgICAgICB0ZXh0dXJlOiB0ZW5zb3IudGV4dHVyZSxcclxuICAgICAgICB0eXBlOiB0ZW5zb3IudHlwZSBhcyBUZXh0dXJlQ29uc3RydWN0b3JQYXJhbWV0ZXJzWyd0eXBlJ10sXHJcbiAgICAgICAgZGltcyxcclxuICAgICAgfSk7XHJcbiAgICBjYXNlICdncHUtYnVmZmVyJzpcclxuICAgICAgcmV0dXJuIG5ldyBUZW5zb3Ioe1xyXG4gICAgICAgIGxvY2F0aW9uOiAnZ3B1LWJ1ZmZlcicsXHJcbiAgICAgICAgZ3B1QnVmZmVyOiB0ZW5zb3IuZ3B1QnVmZmVyLFxyXG4gICAgICAgIHR5cGU6IHRlbnNvci50eXBlIGFzIEdwdUJ1ZmZlckNvbnN0cnVjdG9yUGFyYW1ldGVyc1sndHlwZSddLFxyXG4gICAgICAgIGRpbXMsXHJcbiAgICAgIH0pO1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB0ZW5zb3JSZXNoYXBlOiB0ZW5zb3IgbG9jYXRpb24gJHt0ZW5zb3IubG9jYXRpb259IGlzIG5vdCBzdXBwb3J0ZWRgKTtcclxuICB9XHJcbn07XHJcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxyXG5cclxuaW1wb3J0IHt0ZW5zb3JUb0RhdGFVUkwsIHRlbnNvclRvSW1hZ2VEYXRhfSBmcm9tICcuL3RlbnNvci1jb252ZXJzaW9uLWltcGwuanMnO1xyXG5pbXBvcnQge1RlbnNvclRvRGF0YVVybE9wdGlvbnMsIFRlbnNvclRvSW1hZ2VEYXRhT3B0aW9uc30gZnJvbSAnLi90ZW5zb3ItY29udmVyc2lvbi5qcyc7XHJcbmltcG9ydCB7dGVuc29yRnJvbUdwdUJ1ZmZlciwgdGVuc29yRnJvbUltYWdlLCB0ZW5zb3JGcm9tUGlubmVkQnVmZmVyLCB0ZW5zb3JGcm9tVGV4dHVyZX0gZnJvbSAnLi90ZW5zb3ItZmFjdG9yeS1pbXBsLmpzJztcclxuaW1wb3J0IHtDcHVQaW5uZWRDb25zdHJ1Y3RvclBhcmFtZXRlcnMsIEdwdUJ1ZmZlckNvbnN0cnVjdG9yUGFyYW1ldGVycywgVGVuc29yRnJvbUdwdUJ1ZmZlck9wdGlvbnMsIFRlbnNvckZyb21JbWFnZUJpdG1hcE9wdGlvbnMsIFRlbnNvckZyb21JbWFnZURhdGFPcHRpb25zLCBUZW5zb3JGcm9tSW1hZ2VFbGVtZW50T3B0aW9ucywgVGVuc29yRnJvbVRleHR1cmVPcHRpb25zLCBUZW5zb3JGcm9tVXJsT3B0aW9ucywgVGV4dHVyZUNvbnN0cnVjdG9yUGFyYW1ldGVyc30gZnJvbSAnLi90ZW5zb3ItZmFjdG9yeS5qcyc7XHJcbmltcG9ydCB7Y2hlY2tUeXBlZEFycmF5LCBOVU1FUklDX1RFTlNPUl9UWVBFX1RPX1RZUEVEQVJSQVlfTUFQLCBOVU1FUklDX1RFTlNPUl9UWVBFREFSUkFZX1RPX1RZUEVfTUFQLCBTdXBwb3J0ZWRUeXBlZEFycmF5LCBTdXBwb3J0ZWRUeXBlZEFycmF5Q29uc3RydWN0b3JzfSBmcm9tICcuL3RlbnNvci1pbXBsLXR5cGUtbWFwcGluZy5qcyc7XHJcbmltcG9ydCB7Y2FsY3VsYXRlU2l6ZSwgdGVuc29yUmVzaGFwZX0gZnJvbSAnLi90ZW5zb3ItdXRpbHMtaW1wbC5qcyc7XHJcbmltcG9ydCB7VGVuc29yIGFzIFRlbnNvckludGVyZmFjZX0gZnJvbSAnLi90ZW5zb3IuanMnO1xyXG5cclxuLy8gdHlwZSBhbGlhc2VzIGZvciB0aG9zZSBleHBvcnRlZCBmcm9tIFRlbnNvciBpbnRlcmZhY2VcclxuXHJcbnR5cGUgVGVuc29yVHlwZSA9IFRlbnNvckludGVyZmFjZS5UeXBlO1xyXG50eXBlIFRlbnNvckRhdGFUeXBlID0gVGVuc29ySW50ZXJmYWNlLkRhdGFUeXBlO1xyXG50eXBlIFRlbnNvckRhdGFMb2NhdGlvbiA9IFRlbnNvckludGVyZmFjZS5EYXRhTG9jYXRpb247XHJcbnR5cGUgVGVuc29yVGV4dHVyZVR5cGUgPSBUZW5zb3JJbnRlcmZhY2UuVGV4dHVyZVR5cGU7XHJcbnR5cGUgVGVuc29yR3B1QnVmZmVyVHlwZSA9IFRlbnNvckludGVyZmFjZS5HcHVCdWZmZXJUeXBlO1xyXG5cclxuLyoqXHJcbiAqIHRoZSBpbXBsZW1lbnRhdGlvbiBvZiBUZW5zb3IgaW50ZXJmYWNlLlxyXG4gKlxyXG4gKiBAaWdub3JlXHJcbiAqL1xyXG5leHBvcnQgY2xhc3MgVGVuc29yIGltcGxlbWVudHMgVGVuc29ySW50ZXJmYWNlIHtcclxuICAvLyAjcmVnaW9uIGNvbnN0cnVjdG9yc1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgQ1BVIHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gdHlwZSwgZGF0YSBhbmQgZGltcy5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvcihcclxuICAgICAgdHlwZTogVGVuc29yVHlwZSwgZGF0YTogVGVuc29yRGF0YVR5cGV8cmVhZG9ubHkgc3RyaW5nW118cmVhZG9ubHkgbnVtYmVyW118cmVhZG9ubHkgYm9vbGVhbltdLFxyXG4gICAgICBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pO1xyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdCBhIG5ldyBDUFUgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLiBUeXBlIGlzIGluZmVycmVkIGZyb20gZGF0YS5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvcihkYXRhOiBUZW5zb3JEYXRhVHlwZXxyZWFkb25seSBzdHJpbmdbXXxyZWFkb25seSBib29sZWFuW10sIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk7XHJcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0IGEgbmV3IHRlbnNvciBvYmplY3QgZnJvbSB0aGUgcGlubmVkIENQVSBkYXRhIHdpdGggdGhlIGdpdmVuIHR5cGUgYW5kIGRpbXMuXHJcbiAgICpcclxuICAgKiBUZW5zb3IncyBsb2NhdGlvbiB3aWxsIGJlIHNldCB0byAnY3B1LXBpbm5lZCcuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcGFyYW1zIC0gU3BlY2lmeSB0aGUgcGFyYW1ldGVycyB0byBjb25zdHJ1Y3QgdGhlIHRlbnNvci5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvcihwYXJhbXM6IENwdVBpbm5lZENvbnN0cnVjdG9yUGFyYW1ldGVycyk7XHJcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0IGEgbmV3IHRlbnNvciBvYmplY3QgZnJvbSB0aGUgV2ViR0wgdGV4dHVyZSB3aXRoIHRoZSBnaXZlbiB0eXBlIGFuZCBkaW1zLlxyXG4gICAqXHJcbiAgICogVGVuc29yJ3MgbG9jYXRpb24gd2lsbCBiZSBzZXQgdG8gJ3RleHR1cmUnLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHBhcmFtcyAtIFNwZWNpZnkgdGhlIHBhcmFtZXRlcnMgdG8gY29uc3RydWN0IHRoZSB0ZW5zb3IuXHJcbiAgICovXHJcbiAgY29uc3RydWN0b3IocGFyYW1zOiBUZXh0dXJlQ29uc3RydWN0b3JQYXJhbWV0ZXJzKTtcclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBXZWJHUFUgYnVmZmVyIHdpdGggdGhlIGdpdmVuIHR5cGUgYW5kIGRpbXMuXHJcbiAgICpcclxuICAgKiBUZW5zb3IncyBsb2NhdGlvbiB3aWxsIGJlIHNldCB0byAnZ3B1LWJ1ZmZlcicuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gcGFyYW1zIC0gU3BlY2lmeSB0aGUgcGFyYW1ldGVycyB0byBjb25zdHJ1Y3QgdGhlIHRlbnNvci5cclxuICAgKi9cclxuICBjb25zdHJ1Y3RvcihwYXJhbXM6IEdwdUJ1ZmZlckNvbnN0cnVjdG9yUGFyYW1ldGVycyk7XHJcblxyXG4gIC8qKlxyXG4gICAqIGltcGxlbWVudGF0aW9uLlxyXG4gICAqL1xyXG4gIGNvbnN0cnVjdG9yKFxyXG4gICAgICBhcmcwOiBUZW5zb3JUeXBlfFRlbnNvckRhdGFUeXBlfHJlYWRvbmx5IHN0cmluZ1tdfHJlYWRvbmx5IGJvb2xlYW5bXXxDcHVQaW5uZWRDb25zdHJ1Y3RvclBhcmFtZXRlcnN8XHJcbiAgICAgIFRleHR1cmVDb25zdHJ1Y3RvclBhcmFtZXRlcnN8R3B1QnVmZmVyQ29uc3RydWN0b3JQYXJhbWV0ZXJzLFxyXG4gICAgICBhcmcxPzogVGVuc29yRGF0YVR5cGV8cmVhZG9ubHkgbnVtYmVyW118cmVhZG9ubHkgc3RyaW5nW118cmVhZG9ubHkgYm9vbGVhbltdLCBhcmcyPzogcmVhZG9ubHkgbnVtYmVyW10pIHtcclxuICAgIC8vIHBlcmZvcm0gb25lLXRpbWUgY2hlY2sgZm9yIEJpZ0ludC9GbG9hdDE2QXJyYXkgc3VwcG9ydFxyXG4gICAgY2hlY2tUeXBlZEFycmF5KCk7XHJcblxyXG4gICAgbGV0IHR5cGU6IFRlbnNvclR5cGU7XHJcbiAgICBsZXQgZGltczogcmVhZG9ubHkgbnVtYmVyW107XHJcblxyXG4gICAgaWYgKHR5cGVvZiBhcmcwID09PSAnb2JqZWN0JyAmJiAnbG9jYXRpb24nIGluIGFyZzApIHtcclxuICAgICAgLy9cclxuICAgICAgLy8gY29uc3RydWN0aW5nIHRlbnNvciBmcm9tIHNwZWNpZmljIGxvY2F0aW9uXHJcbiAgICAgIC8vXHJcbiAgICAgIHRoaXMuZGF0YUxvY2F0aW9uID0gYXJnMC5sb2NhdGlvbjtcclxuICAgICAgdHlwZSA9IGFyZzAudHlwZTtcclxuICAgICAgZGltcyA9IGFyZzAuZGltcztcclxuICAgICAgc3dpdGNoIChhcmcwLmxvY2F0aW9uKSB7XHJcbiAgICAgICAgY2FzZSAnY3B1LXBpbm5lZCc6IHtcclxuICAgICAgICAgIGNvbnN0IGV4cGVjdGVkVHlwZWRBcnJheUNvbnN0cnVjdG9yID0gTlVNRVJJQ19URU5TT1JfVFlQRV9UT19UWVBFREFSUkFZX01BUC5nZXQodHlwZSk7XHJcbiAgICAgICAgICBpZiAoIWV4cGVjdGVkVHlwZWRBcnJheUNvbnN0cnVjdG9yKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYHVuc3VwcG9ydGVkIHR5cGUgXCIke3R5cGV9XCIgdG8gY3JlYXRlIHRlbnNvciBmcm9tIHBpbm5lZCBidWZmZXJgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICghKGFyZzAuZGF0YSBpbnN0YW5jZW9mIGV4cGVjdGVkVHlwZWRBcnJheUNvbnN0cnVjdG9yKSkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKGBidWZmZXIgc2hvdWxkIGJlIG9mIHR5cGUgJHtleHBlY3RlZFR5cGVkQXJyYXlDb25zdHJ1Y3Rvci5uYW1lfWApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5jcHVEYXRhID0gYXJnMC5kYXRhO1xyXG4gICAgICAgICAgYnJlYWs7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNhc2UgJ3RleHR1cmUnOiB7XHJcbiAgICAgICAgICBpZiAodHlwZSAhPT0gJ2Zsb2F0MzInKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYHVuc3VwcG9ydGVkIHR5cGUgXCIke3R5cGV9XCIgdG8gY3JlYXRlIHRlbnNvciBmcm9tIHRleHR1cmVgKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHRoaXMuZ3B1VGV4dHVyZURhdGEgPSBhcmcwLnRleHR1cmU7XHJcbiAgICAgICAgICB0aGlzLmRvd25sb2FkZXIgPSBhcmcwLmRvd25sb2FkO1xyXG4gICAgICAgICAgdGhpcy5kaXNwb3NlciA9IGFyZzAuZGlzcG9zZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjYXNlICdncHUtYnVmZmVyJzoge1xyXG4gICAgICAgICAgaWYgKCh0eXBlICE9PSAnZmxvYXQzMicgJiYgdHlwZSAhPT0gJ2Zsb2F0MTYnICYmIHR5cGUgIT09ICdpbnQzMicgJiYgdHlwZSAhPT0gJ2ludDY0JyAmJiB0eXBlICE9PSAndWludDMyJyAmJlxyXG4gICAgICAgICAgICAgICB0eXBlICE9PSAndWludDgnICYmIHR5cGUgIT09ICdib29sJykpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgdW5zdXBwb3J0ZWQgdHlwZSBcIiR7dHlwZX1cIiB0byBjcmVhdGUgdGVuc29yIGZyb20gZ3B1IGJ1ZmZlcmApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgdGhpcy5ncHVCdWZmZXJEYXRhID0gYXJnMC5ncHVCdWZmZXI7XHJcbiAgICAgICAgICB0aGlzLmRvd25sb2FkZXIgPSBhcmcwLmRvd25sb2FkO1xyXG4gICAgICAgICAgdGhpcy5kaXNwb3NlciA9IGFyZzAuZGlzcG9zZTtcclxuICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgIH1cclxuICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBUZW5zb3IgY29uc3RydWN0b3I6IHVuc3VwcG9ydGVkIGxvY2F0aW9uICcke3RoaXMuZGF0YUxvY2F0aW9ufSdgKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy9cclxuICAgICAgLy8gY29uc3RydWN0aW5nIHRlbnNvciBvZiBsb2NhdGlvbiAnY3B1J1xyXG4gICAgICAvL1xyXG4gICAgICBsZXQgZGF0YTogVGVuc29yRGF0YVR5cGU7XHJcbiAgICAgIGxldCBtYXliZURpbXM6IHR5cGVvZiBhcmcxfHR5cGVvZiBhcmcyO1xyXG4gICAgICAvLyBjaGVjayB3aGV0aGVyIGFyZzAgaXMgdHlwZSBvciBkYXRhXHJcbiAgICAgIGlmICh0eXBlb2YgYXJnMCA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgICAvL1xyXG4gICAgICAgIC8vIE92ZXJyaWRlOiBjb25zdHJ1Y3Rvcih0eXBlLCBkYXRhLCAuLi4pXHJcbiAgICAgICAgLy9cclxuICAgICAgICB0eXBlID0gYXJnMDtcclxuICAgICAgICBtYXliZURpbXMgPSBhcmcyO1xyXG4gICAgICAgIGlmIChhcmcwID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgLy8gc3RyaW5nIHRlbnNvclxyXG4gICAgICAgICAgaWYgKCFBcnJheS5pc0FycmF5KGFyZzEpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ0Egc3RyaW5nIHRlbnNvclxcJ3MgZGF0YSBtdXN0IGJlIGEgc3RyaW5nIGFycmF5LicpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgLy8gd2UgZG9uJ3QgY2hlY2sgd2hldGhlciBldmVyeSBlbGVtZW50IGluIHRoZSBhcnJheSBpcyBzdHJpbmc7IHRoaXMgaXMgdG9vIHNsb3cuIHdlIGFzc3VtZSBpdCdzIGNvcnJlY3QgYW5kXHJcbiAgICAgICAgICAvLyBlcnJvciB3aWxsIGJlIHBvcHVsYXRlZCBhdCBpbmZlcmVuY2VcclxuICAgICAgICAgIGRhdGEgPSBhcmcxO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBudW1lcmljIHRlbnNvclxyXG4gICAgICAgICAgY29uc3QgdHlwZWRBcnJheUNvbnN0cnVjdG9yID0gTlVNRVJJQ19URU5TT1JfVFlQRV9UT19UWVBFREFSUkFZX01BUC5nZXQoYXJnMCk7XHJcbiAgICAgICAgICBpZiAodHlwZWRBcnJheUNvbnN0cnVjdG9yID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgVW5zdXBwb3J0ZWQgdGVuc29yIHR5cGU6ICR7YXJnMH0uYCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShhcmcxKSkge1xyXG4gICAgICAgICAgICBpZiAoYXJnMCA9PT0gJ2Zsb2F0MTYnICYmIHR5cGVkQXJyYXlDb25zdHJ1Y3RvciA9PT0gVWludDE2QXJyYXkpIHtcclxuICAgICAgICAgICAgICAvLyBXaGVuIG5vIEZsb2F0MTZBcnJheSBwb2x5ZmlsbCBpcyB1c2VkLCB3ZSBjYW5ub3QgY3JlYXRlICdmbG9hdDE2JyB0ZW5zb3IgZnJvbSBudW1iZXIgYXJyYXkuXHJcbiAgICAgICAgICAgICAgLy9cclxuICAgICAgICAgICAgICAvLyBUaHJvdyBlcnJvciBoZXJlIGJlY2F1c2Ugd2hlbiB1c2VyIHRyeSB0byB1c2UgbnVtYmVyIGFycmF5IGFzIGRhdGEsXHJcbiAgICAgICAgICAgICAgLy8gZS5nLiBuZXcgVGVuc29yKCdmbG9hdDE2JywgWzEsIDIsIDMsIDRdLCBkaW1zKSksIGl0IHdpbGwgYWN0dWFsbHkgY2FsbFxyXG4gICAgICAgICAgICAgIC8vIFVpbnQxNkFycmF5LmZyb20oYXJnMSkgd2hpY2ggZ2VuZXJhdGVzIHdyb25nIGRhdGEuXHJcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihcclxuICAgICAgICAgICAgICAgICAgJ0NyZWF0aW5nIGEgZmxvYXQxNiB0ZW5zb3IgZnJvbSBudW1iZXIgYXJyYXkgaXMgbm90IHN1cHBvcnRlZC4gUGxlYXNlIHVzZSBVaW50MTZBcnJheSBhcyBkYXRhLicpO1xyXG4gICAgICAgICAgICB9IGVsc2UgaWYgKGFyZzAgPT09ICd1aW50NjQnIHx8IGFyZzAgPT09ICdpbnQ2NCcpIHtcclxuICAgICAgICAgICAgICAvLyB1c2UgJ2FzIGFueScgaGVyZSBiZWNhdXNlOlxyXG4gICAgICAgICAgICAgIC8vIDEuIFR5cGVTY3JpcHQncyBjaGVjayBvbiB0eXBlIG9mICdBcnJheS5pc0FycmF5KCknIGRvZXMgbm90IHdvcmsgd2l0aCByZWFkb25seSBhcnJheXMuXHJcbiAgICAgICAgICAgICAgLy8gc2VlIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvVHlwZVNjcmlwdC9pc3N1ZXMvMTcwMDJcclxuICAgICAgICAgICAgICAvLyAyLiBUeXBlU2NyaXB0J3MgY2hlY2sgb24gdW5pb24gdHlwZSBvZiAnKEJpZ0ludDY0QXJyYXlDb25zdHJ1Y3RvcnxCaWdVaW50NjRBcnJheUNvbnN0cnVjdG9yKS5mcm9tKCknXHJcbiAgICAgICAgICAgICAgLy8gZG9lcyBub3QgYWNjZXB0IHBhcmFtZXRlciBtYXBGbi5cclxuICAgICAgICAgICAgICAvLyAzLiBwYXJhbWV0ZXJzIG9mICdTdXBwb3J0ZWRUeXBlZEFycmF5Q29uc3RydWN0b3JzLmZyb20oKScgZG9lcyBub3QgbWF0Y2ggdGhlIHJlcXVpcmVtZW50IG9mIHRoZSB1bmlvblxyXG4gICAgICAgICAgICAgIC8vIHR5cGUuXHJcblxyXG4gICAgICAgICAgICAgIC8vIGFzc3VtZSAnYXJnMScgaXMgb2YgdHlwZSBcInJlYWRvbmx5IG51bWJlcltdfHJlYWRvbmx5IGJpZ2ludFtdXCIgaGVyZS5cclxuXHJcbiAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuICAgICAgICAgICAgICBkYXRhID0gKHR5cGVkQXJyYXlDb25zdHJ1Y3RvciBhcyBhbnkpLmZyb20oYXJnMSwgQmlnSW50KTtcclxuICAgICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgICAvLyBhc3N1bWUgJ2FyZzEnIGlzIG9mIHR5cGUgXCJyZWFkb25seSBudW1iZXJbXVwiIGhlcmUuXHJcbiAgICAgICAgICAgICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1leHBsaWNpdC1hbnlcclxuICAgICAgICAgICAgICBkYXRhID0gKHR5cGVkQXJyYXlDb25zdHJ1Y3RvciBhcyBhbnkpLmZyb20oYXJnMSk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH0gZWxzZSBpZiAoYXJnMSBpbnN0YW5jZW9mIHR5cGVkQXJyYXlDb25zdHJ1Y3Rvcikge1xyXG4gICAgICAgICAgICBkYXRhID0gYXJnMTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoYEEgJHt0eXBlfSB0ZW5zb3IncyBkYXRhIG11c3QgYmUgdHlwZSBvZiAke3R5cGVkQXJyYXlDb25zdHJ1Y3Rvcn1gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy9cclxuICAgICAgICAvLyBPdmVycmlkZTogY29uc3RydWN0b3IoZGF0YSwgLi4uKVxyXG4gICAgICAgIC8vXHJcbiAgICAgICAgbWF5YmVEaW1zID0gYXJnMTtcclxuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheShhcmcwKSkge1xyXG4gICAgICAgICAgLy8gb25seSBib29sZWFuW10gYW5kIHN0cmluZ1tdIGlzIHN1cHBvcnRlZFxyXG4gICAgICAgICAgaWYgKGFyZzAubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1RlbnNvciB0eXBlIGNhbm5vdCBiZSBpbmZlcnJlZCBmcm9tIGFuIGVtcHR5IGFycmF5LicpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc3QgZmlyc3RFbGVtZW50VHlwZSA9IHR5cGVvZiBhcmcwWzBdO1xyXG4gICAgICAgICAgaWYgKGZpcnN0RWxlbWVudFR5cGUgPT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgIHR5cGUgPSAnc3RyaW5nJztcclxuICAgICAgICAgICAgZGF0YSA9IGFyZzA7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKGZpcnN0RWxlbWVudFR5cGUgPT09ICdib29sZWFuJykge1xyXG4gICAgICAgICAgICB0eXBlID0gJ2Jvb2wnO1xyXG4gICAgICAgICAgICAvLyAnYXJnMCcgaXMgb2YgdHlwZSAnYm9vbGVhbltdJy4gVWludDhBcnJheS5mcm9tKGJvb2xlYW5bXSkgYWN0dWFsbHkgd29ya3MsIGJ1dCB0eXBlc2NyaXB0IHRoaW5rcyB0aGlzIGlzXHJcbiAgICAgICAgICAgIC8vIHdyb25nIHR5cGUuIFdlIHVzZSAnYXMgYW55JyB0byBtYWtlIGl0IGhhcHB5LlxyXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxyXG4gICAgICAgICAgICBkYXRhID0gVWludDhBcnJheS5mcm9tKGFyZzAgYXMgYW55W10pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgSW52YWxpZCBlbGVtZW50IHR5cGUgb2YgZGF0YSBhcnJheTogJHtmaXJzdEVsZW1lbnRUeXBlfS5gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgLy8gZ2V0IHRlbnNvciB0eXBlIGZyb20gVHlwZWRBcnJheVxyXG4gICAgICAgICAgY29uc3QgbWFwcGVkVHlwZSA9XHJcbiAgICAgICAgICAgICAgTlVNRVJJQ19URU5TT1JfVFlQRURBUlJBWV9UT19UWVBFX01BUC5nZXQoYXJnMC5jb25zdHJ1Y3RvciBhcyBTdXBwb3J0ZWRUeXBlZEFycmF5Q29uc3RydWN0b3JzKTtcclxuICAgICAgICAgIGlmIChtYXBwZWRUeXBlID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgVW5zdXBwb3J0ZWQgdHlwZSBmb3IgdGVuc29yIGRhdGE6ICR7YXJnMC5jb25zdHJ1Y3Rvcn0uYCk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICB0eXBlID0gbWFwcGVkVHlwZTtcclxuICAgICAgICAgIGRhdGEgPSBhcmcwIGFzIFN1cHBvcnRlZFR5cGVkQXJyYXk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyB0eXBlIGFuZCBkYXRhIGlzIHByb2Nlc3NlZCwgbm93IHByb2Nlc3NpbmcgZGltc1xyXG4gICAgICBpZiAobWF5YmVEaW1zID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgICAvLyBhc3N1bWUgMS1EIHRlbnNvciBpZiBkaW1zIG9taXR0ZWRcclxuICAgICAgICBtYXliZURpbXMgPSBbZGF0YS5sZW5ndGhdO1xyXG4gICAgICB9IGVsc2UgaWYgKCFBcnJheS5pc0FycmF5KG1heWJlRGltcykpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdBIHRlbnNvclxcJ3MgZGltcyBtdXN0IGJlIGEgbnVtYmVyIGFycmF5Jyk7XHJcbiAgICAgIH1cclxuICAgICAgZGltcyA9IG1heWJlRGltcyBhcyByZWFkb25seSBudW1iZXJbXTtcclxuXHJcbiAgICAgIHRoaXMuY3B1RGF0YSA9IGRhdGE7XHJcbiAgICAgIHRoaXMuZGF0YUxvY2F0aW9uID0gJ2NwdSc7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gcGVyZm9ybSBjaGVjayBvbiBkaW1zXHJcbiAgICBjb25zdCBzaXplID0gY2FsY3VsYXRlU2l6ZShkaW1zKTtcclxuICAgIC8vIGlmIGRhdGEgaXMgb24gQ1BVLCBjaGVjayB3aGV0aGVyIGRhdGEgbGVuZ3RoIG1hdGNoZXMgdGVuc29yIHNpemVcclxuICAgIGlmICh0aGlzLmNwdURhdGEgJiYgc2l6ZSAhPT0gdGhpcy5jcHVEYXRhLmxlbmd0aCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYFRlbnNvcidzIHNpemUoJHtzaXplfSkgZG9lcyBub3QgbWF0Y2ggZGF0YSBsZW5ndGgoJHt0aGlzLmNwdURhdGEubGVuZ3RofSkuYCk7XHJcbiAgICB9XHJcblxyXG4gICAgdGhpcy50eXBlID0gdHlwZTtcclxuICAgIHRoaXMuZGltcyA9IGRpbXM7XHJcbiAgICB0aGlzLnNpemUgPSBzaXplO1xyXG4gIH1cclxuICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gIC8vICNyZWdpb24gZmFjdG9yeVxyXG4gIHN0YXRpYyBhc3luYyBmcm9tSW1hZ2UoXHJcbiAgICAgIGltYWdlOiBJbWFnZURhdGF8SFRNTEltYWdlRWxlbWVudHxJbWFnZUJpdG1hcHxzdHJpbmcsXHJcbiAgICAgIG9wdGlvbnM/OiBUZW5zb3JGcm9tSW1hZ2VEYXRhT3B0aW9uc3xUZW5zb3JGcm9tSW1hZ2VFbGVtZW50T3B0aW9uc3xUZW5zb3JGcm9tSW1hZ2VCaXRtYXBPcHRpb25zfFxyXG4gICAgICBUZW5zb3JGcm9tVXJsT3B0aW9ucyk6IFByb21pc2U8VGVuc29ySW50ZXJmYWNlPiB7XHJcbiAgICByZXR1cm4gdGVuc29yRnJvbUltYWdlKGltYWdlLCBvcHRpb25zKTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBmcm9tVGV4dHVyZTxUIGV4dGVuZHMgVGVuc29ySW50ZXJmYWNlLlRleHR1cmVEYXRhVHlwZXM+KFxyXG4gICAgICB0ZXh0dXJlOiBUZW5zb3JUZXh0dXJlVHlwZSwgb3B0aW9uczogVGVuc29yRnJvbVRleHR1cmVPcHRpb25zPFQ+KTogVGVuc29ySW50ZXJmYWNlIHtcclxuICAgIHJldHVybiB0ZW5zb3JGcm9tVGV4dHVyZSh0ZXh0dXJlLCBvcHRpb25zKTtcclxuICB9XHJcblxyXG4gIHN0YXRpYyBmcm9tR3B1QnVmZmVyPFQgZXh0ZW5kcyBUZW5zb3JJbnRlcmZhY2UuR3B1QnVmZmVyRGF0YVR5cGVzPihcclxuICAgICAgZ3B1QnVmZmVyOiBUZW5zb3JHcHVCdWZmZXJUeXBlLCBvcHRpb25zOiBUZW5zb3JGcm9tR3B1QnVmZmVyT3B0aW9uczxUPik6IFRlbnNvckludGVyZmFjZSB7XHJcbiAgICByZXR1cm4gdGVuc29yRnJvbUdwdUJ1ZmZlcihncHVCdWZmZXIsIG9wdGlvbnMpO1xyXG4gIH1cclxuXHJcbiAgc3RhdGljIGZyb21QaW5uZWRCdWZmZXI8VCBleHRlbmRzIFRlbnNvckludGVyZmFjZS5DcHVQaW5uZWREYXRhVHlwZXM+KFxyXG4gICAgICB0eXBlOiBULCBidWZmZXI6IFRlbnNvckludGVyZmFjZS5EYXRhVHlwZU1hcFtUXSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVGVuc29yIHtcclxuICAgIHJldHVybiB0ZW5zb3JGcm9tUGlubmVkQnVmZmVyKHR5cGUsIGJ1ZmZlciwgZGltcyk7XHJcbiAgfVxyXG5cclxuICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gIC8vICNyZWdpb24gY29udmVyc2lvbnNcclxuICB0b0RhdGFVUkwob3B0aW9ucz86IFRlbnNvclRvRGF0YVVybE9wdGlvbnMpOiBzdHJpbmcge1xyXG4gICAgcmV0dXJuIHRlbnNvclRvRGF0YVVSTCh0aGlzLCBvcHRpb25zKTtcclxuICB9XHJcblxyXG4gIHRvSW1hZ2VEYXRhKG9wdGlvbnM/OiBUZW5zb3JUb0ltYWdlRGF0YU9wdGlvbnMpOiBJbWFnZURhdGEge1xyXG4gICAgcmV0dXJuIHRlbnNvclRvSW1hZ2VEYXRhKHRoaXMsIG9wdGlvbnMpO1xyXG4gIH1cclxuICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gIC8vICNyZWdpb24gcHVibGljIGZpZWxkc1xyXG4gIHJlYWRvbmx5IGRpbXM6IHJlYWRvbmx5IG51bWJlcltdO1xyXG4gIHJlYWRvbmx5IHR5cGU6IFRlbnNvclR5cGU7XHJcbiAgcmVhZG9ubHkgc2l6ZTogbnVtYmVyO1xyXG4gIC8vICNlbmRyZWdpb25cclxuXHJcbiAgLy8gI3JlZ2lvbiBwcml2YXRlIGZpZWxkc1xyXG5cclxuICAvKipcclxuICAgKiBzdG9yZXMgdGhlIGxvY2F0aW9uIG9mIHRoZSBkYXRhLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZGF0YUxvY2F0aW9uOiBUZW5zb3JEYXRhTG9jYXRpb247XHJcblxyXG4gIC8qKlxyXG4gICAqIHN0b3JlcyB0aGUgZGF0YSBvbiBDUFUsIGlmIGxvY2F0aW9uIGlzICdjcHUnIG9yICdjcHUtcGlubmVkJy4gb3RoZXJ3aXNlIGVtcHR5LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgY3B1RGF0YT86IFRlbnNvckRhdGFUeXBlO1xyXG5cclxuICAvKipcclxuICAgKiBzdG9yZXMgdGhlIHVuZGVybHlpbmcgdGV4dHVyZSB3aGVuIGxvY2F0aW9uIGlzICd0ZXh0dXJlJy4gb3RoZXJ3aXNlIGVtcHR5LlxyXG4gICAqL1xyXG4gIHByaXZhdGUgZ3B1VGV4dHVyZURhdGE/OiBUZW5zb3JUZXh0dXJlVHlwZTtcclxuXHJcbiAgLyoqXHJcbiAgICogc3RvcmVzIHRoZSB1bmRlcmx5aW5nIEdQVSBidWZmZXIgd2hlbiBsb2NhdGlvbiBpcyAnZ3B1LWJ1ZmZlcicuIG90aGVyd2lzZSBlbXB0eS5cclxuICAgKi9cclxuICBwcml2YXRlIGdwdUJ1ZmZlckRhdGE/OiBUZW5zb3JHcHVCdWZmZXJUeXBlO1xyXG5cclxuICAvKipcclxuICAgKiBzdG9yZXMgYW4gb3B0aW9uYWwgZG93bmxvYWRlciBmdW5jdGlvbiB0byBkb3dubG9hZCBkYXRhIGZyb20gR1BVIHRvIENQVS5cclxuICAgKi9cclxuICBwcml2YXRlIGRvd25sb2FkZXI/KCk6IFByb21pc2U8VGVuc29yRGF0YVR5cGU+O1xyXG5cclxuICAvKipcclxuICAgKiBhIGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIHRoZSBkYXRhIGlzIGJlaW5nIGRvd25sb2FkZWQgZnJvbSBHUFUgdG8gQ1BVLlxyXG4gICAqL1xyXG4gIHByaXZhdGUgaXNEb3dubG9hZGluZz86IGJvb2xlYW47XHJcblxyXG4gIC8qKlxyXG4gICAqIHN0b3JlcyBhbiBvcHRpb25hbCBkaXNwb3NlciBmdW5jdGlvbiB0byBkaXNwb3NlIHRoZSB1bmRlcmx5aW5nIGRhdGEuXHJcbiAgICovXHJcbiAgcHJpdmF0ZSBkaXNwb3Nlcj8oKTogdm9pZDtcclxuICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gIC8vICNyZWdpb24gcHJvcGVydGllc1xyXG4gIGdldCBkYXRhKCk6IFRlbnNvckRhdGFUeXBlIHtcclxuICAgIHRoaXMuZW5zdXJlVmFsaWQoKTtcclxuICAgIGlmICghdGhpcy5jcHVEYXRhKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICdUaGUgZGF0YSBpcyBub3Qgb24gQ1BVLiBVc2UgYGdldERhdGEoKWAgdG8gZG93bmxvYWQgR1BVIGRhdGEgdG8gQ1BVLCAnICtcclxuICAgICAgICAgICdvciB1c2UgYHRleHR1cmVgIG9yIGBncHVCdWZmZXJgIHByb3BlcnR5IHRvIGFjY2VzcyB0aGUgR1BVIGRhdGEgZGlyZWN0bHkuJyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5jcHVEYXRhO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGxvY2F0aW9uKCk6IFRlbnNvckRhdGFMb2NhdGlvbiB7XHJcbiAgICByZXR1cm4gdGhpcy5kYXRhTG9jYXRpb247XHJcbiAgfVxyXG5cclxuICBnZXQgdGV4dHVyZSgpOiBUZW5zb3JUZXh0dXJlVHlwZSB7XHJcbiAgICB0aGlzLmVuc3VyZVZhbGlkKCk7XHJcbiAgICBpZiAoIXRoaXMuZ3B1VGV4dHVyZURhdGEpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGUgZGF0YSBpcyBub3Qgc3RvcmVkIGFzIGEgV2ViR0wgdGV4dHVyZS4nKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLmdwdVRleHR1cmVEYXRhO1xyXG4gIH1cclxuXHJcbiAgZ2V0IGdwdUJ1ZmZlcigpOiBUZW5zb3JHcHVCdWZmZXJUeXBlIHtcclxuICAgIHRoaXMuZW5zdXJlVmFsaWQoKTtcclxuICAgIGlmICghdGhpcy5ncHVCdWZmZXJEYXRhKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGRhdGEgaXMgbm90IHN0b3JlZCBhcyBhIFdlYkdQVSBidWZmZXIuJyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGhpcy5ncHVCdWZmZXJEYXRhO1xyXG4gIH1cclxuICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gIC8vICNyZWdpb24gbWV0aG9kc1xyXG5cclxuICBhc3luYyBnZXREYXRhKHJlbGVhc2VEYXRhPzogYm9vbGVhbik6IFByb21pc2U8VGVuc29yRGF0YVR5cGU+IHtcclxuICAgIHRoaXMuZW5zdXJlVmFsaWQoKTtcclxuICAgIHN3aXRjaCAodGhpcy5kYXRhTG9jYXRpb24pIHtcclxuICAgICAgY2FzZSAnY3B1JzpcclxuICAgICAgY2FzZSAnY3B1LXBpbm5lZCc6XHJcbiAgICAgICAgcmV0dXJuIHRoaXMuZGF0YTtcclxuICAgICAgY2FzZSAndGV4dHVyZSc6XHJcbiAgICAgIGNhc2UgJ2dwdS1idWZmZXInOiB7XHJcbiAgICAgICAgaWYgKCF0aGlzLmRvd25sb2FkZXIpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcignVGhlIGN1cnJlbnQgdGVuc29yIGlzIG5vdCBjcmVhdGVkIHdpdGggYSBzcGVjaWZpZWQgZGF0YSBkb3dubG9hZGVyLicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodGhpcy5pc0Rvd25sb2FkaW5nKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBjdXJyZW50IHRlbnNvciBpcyBiZWluZyBkb3dubG9hZGVkLicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgdGhpcy5pc0Rvd25sb2FkaW5nID0gdHJ1ZTtcclxuICAgICAgICAgIGNvbnN0IGRhdGEgPSBhd2FpdCB0aGlzLmRvd25sb2FkZXIoKTtcclxuICAgICAgICAgIHRoaXMuZG93bmxvYWRlciA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgIHRoaXMuZGF0YUxvY2F0aW9uID0gJ2NwdSc7XHJcbiAgICAgICAgICB0aGlzLmNwdURhdGEgPSBkYXRhO1xyXG5cclxuICAgICAgICAgIGlmIChyZWxlYXNlRGF0YSAmJiB0aGlzLmRpc3Bvc2VyKSB7XHJcbiAgICAgICAgICAgIHRoaXMuZGlzcG9zZXIoKTtcclxuICAgICAgICAgICAgdGhpcy5kaXNwb3NlciA9IHVuZGVmaW5lZDtcclxuICAgICAgICAgIH1cclxuXHJcbiAgICAgICAgICByZXR1cm4gZGF0YTtcclxuXHJcbiAgICAgICAgfSBmaW5hbGx5IHtcclxuICAgICAgICAgIHRoaXMuaXNEb3dubG9hZGluZyA9IGZhbHNlO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBkZWZhdWx0OlxyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IGdldCBkYXRhIGZyb20gbG9jYXRpb246ICR7dGhpcy5kYXRhTG9jYXRpb259YCk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICBkaXNwb3NlKCk6IHZvaWQge1xyXG4gICAgaWYgKHRoaXMuaXNEb3dubG9hZGluZykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSBjdXJyZW50IHRlbnNvciBpcyBiZWluZyBkb3dubG9hZGVkLicpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmICh0aGlzLmRpc3Bvc2VyKSB7XHJcbiAgICAgIHRoaXMuZGlzcG9zZXIoKTtcclxuICAgICAgdGhpcy5kaXNwb3NlciA9IHVuZGVmaW5lZDtcclxuICAgIH1cclxuICAgIHRoaXMuY3B1RGF0YSA9IHVuZGVmaW5lZDtcclxuICAgIHRoaXMuZ3B1VGV4dHVyZURhdGEgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLmdwdUJ1ZmZlckRhdGEgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLmRvd25sb2FkZXIgPSB1bmRlZmluZWQ7XHJcbiAgICB0aGlzLmlzRG93bmxvYWRpbmcgPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgdGhpcy5kYXRhTG9jYXRpb24gPSAnbm9uZSc7XHJcbiAgfVxyXG5cclxuICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gIC8vICNyZWdpb24gdGVuc29yIHV0aWxpdGllc1xyXG4gIHByaXZhdGUgZW5zdXJlVmFsaWQoKTogdm9pZCB7XHJcbiAgICBpZiAodGhpcy5kYXRhTG9jYXRpb24gPT09ICdub25lJykge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoZSB0ZW5zb3IgaXMgZGlzcG9zZWQuJyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICByZXNoYXBlKGRpbXM6IHJlYWRvbmx5IG51bWJlcltdKTogVGVuc29ySW50ZXJmYWNlIHtcclxuICAgIHRoaXMuZW5zdXJlVmFsaWQoKTtcclxuICAgIGlmICh0aGlzLmRvd25sb2FkZXIgfHwgdGhpcy5kaXNwb3Nlcikge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ0Nhbm5vdCByZXNoYXBlIGEgdGVuc29yIHRoYXQgb3ducyBHUFUgcmVzb3VyY2UuJyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gdGVuc29yUmVzaGFwZSh0aGlzLCBkaW1zKTtcclxuICB9XHJcbiAgLy8gI2VuZHJlZ2lvblxyXG59XHJcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxyXG5cclxuaW1wb3J0IHtUZW5zb3JGYWN0b3J5fSBmcm9tICcuL3RlbnNvci1mYWN0b3J5LmpzJztcclxuaW1wb3J0IHtUZW5zb3IgYXMgVGVuc29ySW1wbH0gZnJvbSAnLi90ZW5zb3ItaW1wbC5qcyc7XHJcbmltcG9ydCB7VHlwZWRUZW5zb3JVdGlsc30gZnJvbSAnLi90ZW5zb3ItdXRpbHMuanMnO1xyXG5cclxuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlZGVjbGFyZSAqL1xyXG5cclxuLyoqXHJcbiAqIHJlcHJlc2VudCBhIGJhc2ljIHRlbnNvciB3aXRoIHNwZWNpZmllZCBkaW1lbnNpb25zIGFuZCBkYXRhIHR5cGUuXHJcbiAqL1xyXG5pbnRlcmZhY2UgVHlwZWRUZW5zb3JCYXNlPFQgZXh0ZW5kcyBUZW5zb3IuVHlwZT4ge1xyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgZGltZW5zaW9ucyBvZiB0aGUgdGVuc29yLlxyXG4gICAqL1xyXG4gIHJlYWRvbmx5IGRpbXM6IHJlYWRvbmx5IG51bWJlcltdO1xyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgZGF0YSB0eXBlIG9mIHRoZSB0ZW5zb3IuXHJcbiAgICovXHJcbiAgcmVhZG9ubHkgdHlwZTogVDtcclxuICAvKipcclxuICAgKiBHZXQgdGhlIGJ1ZmZlciBkYXRhIG9mIHRoZSB0ZW5zb3IuXHJcbiAgICpcclxuICAgKiBJZiB0aGUgZGF0YSBpcyBub3Qgb24gQ1BVIChlZy4gaXQncyBpbiB0aGUgZm9ybSBvZiBXZWJHTCB0ZXh0dXJlIG9yIFdlYkdQVSBidWZmZXIpLCB0aHJvdyBlcnJvci5cclxuICAgKi9cclxuICByZWFkb25seSBkYXRhOiBUZW5zb3IuRGF0YVR5cGVNYXBbVF07XHJcbiAgLyoqXHJcbiAgICogR2V0IHRoZSBsb2NhdGlvbiBvZiB0aGUgZGF0YS5cclxuICAgKi9cclxuICByZWFkb25seSBsb2NhdGlvbjogVGVuc29yLkRhdGFMb2NhdGlvbjtcclxuICAvKipcclxuICAgKiBHZXQgdGhlIFdlYkdMIHRleHR1cmUgdGhhdCBob2xkcyB0aGUgdGVuc29yIGRhdGEuXHJcbiAgICpcclxuICAgKiBJZiB0aGUgZGF0YSBpcyBub3Qgb24gR1BVIGFzIFdlYkdMIHRleHR1cmUsIHRocm93IGVycm9yLlxyXG4gICAqL1xyXG4gIHJlYWRvbmx5IHRleHR1cmU6IFRlbnNvci5UZXh0dXJlVHlwZTtcclxuICAvKipcclxuICAgKiBHZXQgdGhlIFdlYkdQVSBidWZmZXIgdGhhdCBob2xkcyB0aGUgdGVuc29yIGRhdGEuXHJcbiAgICpcclxuICAgKiBJZiB0aGUgZGF0YSBpcyBub3Qgb24gR1BVIGFzIFdlYkdQVSBidWZmZXIsIHRocm93IGVycm9yLlxyXG4gICAqL1xyXG4gIHJlYWRvbmx5IGdwdUJ1ZmZlcjogVGVuc29yLkdwdUJ1ZmZlclR5cGU7XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCB0aGUgYnVmZmVyIGRhdGEgb2YgdGhlIHRlbnNvci5cclxuICAgKlxyXG4gICAqIElmIHRoZSBkYXRhIGlzIG9uIENQVSwgcmV0dXJucyB0aGUgZGF0YSBpbW1lZGlhdGVseS5cclxuICAgKiBJZiB0aGUgZGF0YSBpcyBvbiBHUFUsIGRvd25sb2FkcyB0aGUgZGF0YSBhbmQgcmV0dXJucyB0aGUgcHJvbWlzZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSByZWxlYXNlRGF0YSAtIHdoZXRoZXIgcmVsZWFzZSB0aGUgZGF0YSBvbiBHUFUuIElnbm9yZSBpZiBkYXRhIGlzIGFscmVhZHkgb24gQ1BVLlxyXG4gICAqL1xyXG4gIGdldERhdGEocmVsZWFzZURhdGE/OiBib29sZWFuKTogUHJvbWlzZTxUZW5zb3IuRGF0YVR5cGVNYXBbVF0+O1xyXG5cclxuICAvKipcclxuICAgKiBEaXNwb3NlIHRoZSB0ZW5zb3IgZGF0YS5cclxuICAgKlxyXG4gICAqIElmIHRoZSBkYXRhIGlzIG9uIENQVSwgcmVtb3ZlIGl0cyBpbnRlcm5hbCByZWZlcmVuY2UgdG8gdGhlIHVuZGVybHlpbmcgZGF0YS5cclxuICAgKiBJZiB0aGUgZGF0YSBpcyBvbiBHUFUsIHJlbGVhc2UgdGhlIGRhdGEgb24gR1BVLlxyXG4gICAqXHJcbiAgICogQWZ0ZXIgY2FsbGluZyB0aGlzIGZ1bmN0aW9uLCB0aGUgdGVuc29yIGlzIGNvbnNpZGVyZWQgbm8gbG9uZ2VyIHZhbGlkLiBJdHMgbG9jYXRpb24gd2lsbCBiZSBzZXQgdG8gJ25vbmUnLlxyXG4gICAqL1xyXG4gIGRpc3Bvc2UoKTogdm9pZDtcclxufVxyXG5cclxuZXhwb3J0IGRlY2xhcmUgbmFtZXNwYWNlIFRlbnNvciB7XHJcbiAgaW50ZXJmYWNlIERhdGFUeXBlTWFwIHtcclxuICAgIGZsb2F0MzI6IEZsb2F0MzJBcnJheTtcclxuICAgIHVpbnQ4OiBVaW50OEFycmF5O1xyXG4gICAgaW50ODogSW50OEFycmF5O1xyXG4gICAgdWludDE2OiBVaW50MTZBcnJheTtcclxuICAgIGludDE2OiBJbnQxNkFycmF5O1xyXG4gICAgaW50MzI6IEludDMyQXJyYXk7XHJcbiAgICBpbnQ2NDogQmlnSW50NjRBcnJheTtcclxuICAgIHN0cmluZzogc3RyaW5nW107XHJcbiAgICBib29sOiBVaW50OEFycmF5O1xyXG4gICAgZmxvYXQxNjogVWludDE2QXJyYXk7ICAvLyBLZWVwIHVzaW5nIFVpbnQxNkFycmF5IHVudGlsIHdlIGhhdmUgYSBjb25jcmV0ZSBzb2x1dGlvbiBmb3IgZmxvYXQgMTYuXHJcbiAgICBmbG9hdDY0OiBGbG9hdDY0QXJyYXk7XHJcbiAgICB1aW50MzI6IFVpbnQzMkFycmF5O1xyXG4gICAgdWludDY0OiBCaWdVaW50NjRBcnJheTtcclxuICAgIC8vIGNvbXBsZXg2NDogbmV2ZXI7XHJcbiAgICAvLyBjb21wbGV4MTI4OiBuZXZlcjtcclxuICAgIC8vIGJmbG9hdDE2OiBuZXZlcjtcclxuICB9XHJcblxyXG4gIGludGVyZmFjZSBFbGVtZW50VHlwZU1hcCB7XHJcbiAgICBmbG9hdDMyOiBudW1iZXI7XHJcbiAgICB1aW50ODogbnVtYmVyO1xyXG4gICAgaW50ODogbnVtYmVyO1xyXG4gICAgdWludDE2OiBudW1iZXI7XHJcbiAgICBpbnQxNjogbnVtYmVyO1xyXG4gICAgaW50MzI6IG51bWJlcjtcclxuICAgIGludDY0OiBiaWdpbnQ7XHJcbiAgICBzdHJpbmc6IHN0cmluZztcclxuICAgIGJvb2w6IGJvb2xlYW47XHJcbiAgICBmbG9hdDE2OiBudW1iZXI7ICAvLyBLZWVwIHVzaW5nIFVpbnQxNkFycmF5IHVudGlsIHdlIGhhdmUgYSBjb25jcmV0ZSBzb2x1dGlvbiBmb3IgZmxvYXQgMTYuXHJcbiAgICBmbG9hdDY0OiBudW1iZXI7XHJcbiAgICB1aW50MzI6IG51bWJlcjtcclxuICAgIHVpbnQ2NDogYmlnaW50O1xyXG4gICAgLy8gY29tcGxleDY0OiBuZXZlcjtcclxuICAgIC8vIGNvbXBsZXgxMjg6IG5ldmVyO1xyXG4gICAgLy8gYmZsb2F0MTY6IG5ldmVyO1xyXG4gIH1cclxuXHJcbiAgdHlwZSBEYXRhVHlwZSA9IERhdGFUeXBlTWFwW1R5cGVdO1xyXG4gIHR5cGUgRWxlbWVudFR5cGUgPSBFbGVtZW50VHlwZU1hcFtUeXBlXTtcclxuXHJcbiAgLyoqXHJcbiAgICogc3VwcG9ydGVkIGRhdGEgdHlwZXMgZm9yIGNvbnN0cnVjdGluZyBhIHRlbnNvciBmcm9tIGEgcGlubmVkIENQVSBidWZmZXJcclxuICAgKi9cclxuICBleHBvcnQgdHlwZSBDcHVQaW5uZWREYXRhVHlwZXMgPSBFeGNsdWRlPFRlbnNvci5UeXBlLCAnc3RyaW5nJz47XHJcblxyXG4gIC8qKlxyXG4gICAqIHR5cGUgYWxpYXMgZm9yIFdlYkdMIHRleHR1cmVcclxuICAgKi9cclxuICBleHBvcnQgdHlwZSBUZXh0dXJlVHlwZSA9IFdlYkdMVGV4dHVyZTtcclxuXHJcbiAgLyoqXHJcbiAgICogc3VwcG9ydGVkIGRhdGEgdHlwZXMgZm9yIGNvbnN0cnVjdGluZyBhIHRlbnNvciBmcm9tIGEgV2ViR0wgdGV4dHVyZVxyXG4gICAqL1xyXG4gIGV4cG9ydCB0eXBlIFRleHR1cmVEYXRhVHlwZXMgPSAnZmxvYXQzMic7XHJcblxyXG4gIC8qKlxyXG4gICAqIHR5cGUgYWxpYXMgZm9yIFdlYkdQVSBidWZmZXJcclxuICAgKlxyXG4gICAqIFRoZSByZWFzb24gd2h5IHdlIGRvbid0IHVzZSB0eXBlIFwiR1BVQnVmZmVyXCIgZGVmaW5lZCBpbiB3ZWJncHUuZC50cyBmcm9tIEB3ZWJncHUvdHlwZXMgaXMgYmVjYXVzZSBcIkB3ZWJncHUvdHlwZXNcIlxyXG4gICAqIHJlcXVpcmVzIFwiQHR5cGVzL2RvbS13ZWJjb2RlY3NcIiBhcyBwZWVyIGRlcGVuZGVuY3kgd2hlbiB1c2luZyBUeXBlU2NyaXB0IDwgdjUuMSBhbmQgaXRzIHZlcnNpb24gbmVlZCB0byBiZSBjaG9zZW5cclxuICAgKiBjYXJlZnVsbHkgYWNjb3JkaW5nIHRvIHRoZSBUeXBlU2NyaXB0IHZlcnNpb24gYmVpbmcgdXNlZC4gVGhpcyBtZWFucyBzbyBmYXIgdGhlcmUgaXMgbm90IGEgd2F5IHRvIGtlZXAgZXZlcnlcclxuICAgKiBUeXBlU2NyaXB0IHZlcnNpb24gaGFwcHkuIEl0IHR1cm5zIG91dCB0aGF0IHdlIHdpbGwgZWFzaWx5IGJyb2tlIHVzZXJzIG9uIHNvbWUgVHlwZVNjcmlwdCB2ZXJzaW9uLlxyXG4gICAqXHJcbiAgICogZm9yIG1vcmUgaW5mbyBzZWUgaHR0cHM6Ly9naXRodWIuY29tL2dwdXdlYi90eXBlcy9pc3N1ZXMvMTI3XHJcbiAgICovXHJcbiAgZXhwb3J0IHR5cGUgR3B1QnVmZmVyVHlwZSA9IHtzaXplOiBudW1iZXI7IG1hcFN0YXRlOiAndW5tYXBwZWQnIHwgJ3BlbmRpbmcnIHwgJ21hcHBlZCd9O1xyXG5cclxuICAvKipcclxuICAgKiBzdXBwb3J0ZWQgZGF0YSB0eXBlcyBmb3IgY29uc3RydWN0aW5nIGEgdGVuc29yIGZyb20gYSBXZWJHUFUgYnVmZmVyXHJcbiAgICovXHJcbiAgZXhwb3J0IHR5cGUgR3B1QnVmZmVyRGF0YVR5cGVzID0gJ2Zsb2F0MzInfCdmbG9hdDE2J3wnaW50MzInfCdpbnQ2NCd8J3VpbnQzMid8J3VpbnQ4J3wnYm9vbCc7XHJcblxyXG4gIC8qKlxyXG4gICAqIHJlcHJlc2VudCB3aGVyZSB0aGUgdGVuc29yIGRhdGEgaXMgc3RvcmVkXHJcbiAgICovXHJcbiAgZXhwb3J0IHR5cGUgRGF0YUxvY2F0aW9uID0gJ25vbmUnfCdjcHUnfCdjcHUtcGlubmVkJ3wndGV4dHVyZSd8J2dwdS1idWZmZXInO1xyXG5cclxuICAvKipcclxuICAgKiByZXByZXNlbnQgdGhlIGRhdGEgdHlwZSBvZiBhIHRlbnNvclxyXG4gICAqL1xyXG4gIGV4cG9ydCB0eXBlIFR5cGUgPSBrZXlvZiBEYXRhVHlwZU1hcDtcclxufVxyXG5cclxuLyoqXHJcbiAqIFJlcHJlc2VudCBtdWx0aS1kaW1lbnNpb25hbCBhcnJheXMgdG8gZmVlZCB0byBvciBmZXRjaCBmcm9tIG1vZGVsIGluZmVyZW5jaW5nLlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBUeXBlZFRlbnNvcjxUIGV4dGVuZHMgVGVuc29yLlR5cGU+IGV4dGVuZHMgVHlwZWRUZW5zb3JCYXNlPFQ+LCBUeXBlZFRlbnNvclV0aWxzPFQ+IHt9XHJcbi8qKlxyXG4gKiBSZXByZXNlbnQgbXVsdGktZGltZW5zaW9uYWwgYXJyYXlzIHRvIGZlZWQgdG8gb3IgZmV0Y2ggZnJvbSBtb2RlbCBpbmZlcmVuY2luZy5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGVuc29yIGV4dGVuZHMgVHlwZWRUZW5zb3JCYXNlPFRlbnNvci5UeXBlPiwgVHlwZWRUZW5zb3JVdGlsczxUZW5zb3IuVHlwZT4ge31cclxuXHJcbi8qKlxyXG4gKiB0eXBlIFRlbnNvckNvbnN0cnVjdG9yIGRlZmluZXMgdGhlIGNvbnN0cnVjdG9ycyBvZiAnVGVuc29yJyB0byBjcmVhdGUgQ1BVIHRlbnNvciBpbnN0YW5jZXMuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFRlbnNvckNvbnN0cnVjdG9yIGV4dGVuZHMgVGVuc29yRmFjdG9yeSB7XHJcbiAgLy8gI3JlZ2lvbiBDUFUgdGVuc29yIC0gc3BlY2lmeSBlbGVtZW50IHR5cGVcclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgc3RyaW5nIHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gdHlwZSwgZGF0YSBhbmQgZGltcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB0eXBlIC0gU3BlY2lmeSB0aGUgZWxlbWVudCB0eXBlLlxyXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxyXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxyXG4gICAqL1xyXG4gIG5ldyh0eXBlOiAnc3RyaW5nJywgZGF0YTogVGVuc29yLkRhdGFUeXBlTWFwWydzdHJpbmcnXXxyZWFkb25seSBzdHJpbmdbXSxcclxuICAgICAgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVHlwZWRUZW5zb3I8J3N0cmluZyc+O1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgYm9vbCB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIHR5cGUsIGRhdGEgYW5kIGRpbXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdHlwZSAtIFNwZWNpZnkgdGhlIGVsZW1lbnQgdHlwZS5cclxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cclxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cclxuICAgKi9cclxuICBuZXcodHlwZTogJ2Jvb2wnLCBkYXRhOiBUZW5zb3IuRGF0YVR5cGVNYXBbJ2Jvb2wnXXxyZWFkb25seSBib29sZWFuW10sIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPCdib29sJz47XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdCBhIG5ldyA2NC1iaXQgaW50ZWdlciB0eXBlZCB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIHR5cGUsIGRhdGEgYW5kIGRpbXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdHlwZSAtIFNwZWNpZnkgdGhlIGVsZW1lbnQgdHlwZS5cclxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cclxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cclxuICAgKi9cclxuICBuZXc8VCBleHRlbmRzICd1aW50NjQnfCdpbnQ2NCc+KFxyXG4gICAgICB0eXBlOiBULCBkYXRhOiBUZW5zb3IuRGF0YVR5cGVNYXBbVF18cmVhZG9ubHkgYmlnaW50W118cmVhZG9ubHkgbnVtYmVyW10sXHJcbiAgICAgIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPFQ+O1xyXG5cclxuICAvKipcclxuICAgKiBDb25zdHJ1Y3QgYSBuZXcgbnVtZXJpYyB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIHR5cGUsIGRhdGEgYW5kIGRpbXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdHlwZSAtIFNwZWNpZnkgdGhlIGVsZW1lbnQgdHlwZS5cclxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cclxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cclxuICAgKi9cclxuICBuZXc8VCBleHRlbmRzIEV4Y2x1ZGU8VGVuc29yLlR5cGUsICdzdHJpbmcnfCdib29sJ3wndWludDY0J3wnaW50NjQnPj4oXHJcbiAgICAgIHR5cGU6IFQsIGRhdGE6IFRlbnNvci5EYXRhVHlwZU1hcFtUXXxyZWFkb25seSBudW1iZXJbXSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVHlwZWRUZW5zb3I8VD47XHJcbiAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAvLyAjcmVnaW9uIENQVSB0ZW5zb3IgLSBpbmZlciBlbGVtZW50IHR5cGVzXHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdCBhIG5ldyBmbG9hdDMyIHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBhbmQgZGltcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxyXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxyXG4gICAqL1xyXG4gIG5ldyhkYXRhOiBGbG9hdDMyQXJyYXksIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPCdmbG9hdDMyJz47XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdCBhIG5ldyBpbnQ4IHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBhbmQgZGltcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxyXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxyXG4gICAqL1xyXG4gIG5ldyhkYXRhOiBJbnQ4QXJyYXksIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPCdpbnQ4Jz47XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdCBhIG5ldyB1aW50OCB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIGRhdGEgYW5kIGRpbXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cclxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cclxuICAgKi9cclxuICBuZXcoZGF0YTogVWludDhBcnJheSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVHlwZWRUZW5zb3I8J3VpbnQ4Jz47XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdCBhIG5ldyB1aW50MTYgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXHJcbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXHJcbiAgICovXHJcbiAgbmV3KGRhdGE6IFVpbnQxNkFycmF5LCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwndWludDE2Jz47XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdCBhIG5ldyBpbnQxNiB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIGRhdGEgYW5kIGRpbXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cclxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cclxuICAgKi9cclxuICBuZXcoZGF0YTogSW50MTZBcnJheSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVHlwZWRUZW5zb3I8J2ludDE2Jz47XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdCBhIG5ldyBpbnQzMiB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIGRhdGEgYW5kIGRpbXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cclxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cclxuICAgKi9cclxuICBuZXcoZGF0YTogSW50MzJBcnJheSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVHlwZWRUZW5zb3I8J2ludDMyJz47XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdCBhIG5ldyBpbnQ2NCB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIGRhdGEgYW5kIGRpbXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cclxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cclxuICAgKi9cclxuICBuZXcoZGF0YTogQmlnSW50NjRBcnJheSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVHlwZWRUZW5zb3I8J2ludDY0Jz47XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdCBhIG5ldyBzdHJpbmcgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXHJcbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXHJcbiAgICovXHJcbiAgbmV3KGRhdGE6IHJlYWRvbmx5IHN0cmluZ1tdLCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwnc3RyaW5nJz47XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdCBhIG5ldyBib29sIHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBhbmQgZGltcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxyXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxyXG4gICAqL1xyXG4gIG5ldyhkYXRhOiByZWFkb25seSBib29sZWFuW10sIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPCdib29sJz47XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdCBhIG5ldyBmbG9hdDY0IHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBhbmQgZGltcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxyXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxyXG4gICAqL1xyXG4gIG5ldyhkYXRhOiBGbG9hdDY0QXJyYXksIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFR5cGVkVGVuc29yPCdmbG9hdDY0Jz47XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdCBhIG5ldyB1aW50MzIgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXHJcbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXHJcbiAgICovXHJcbiAgbmV3KGRhdGE6IFVpbnQzMkFycmF5LCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwndWludDMyJz47XHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdCBhIG5ldyB1aW50NjQgdGVuc29yIG9iamVjdCBmcm9tIHRoZSBnaXZlbiBkYXRhIGFuZCBkaW1zLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGRhdGEgLSBTcGVjaWZ5IHRoZSBDUFUgdGVuc29yIGRhdGEuXHJcbiAgICogQHBhcmFtIGRpbXMgLSBTcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXHJcbiAgICovXHJcbiAgbmV3KGRhdGE6IEJpZ1VpbnQ2NEFycmF5LCBkaW1zPzogcmVhZG9ubHkgbnVtYmVyW10pOiBUeXBlZFRlbnNvcjwndWludDY0Jz47XHJcblxyXG4gIC8vICNlbmRyZWdpb25cclxuXHJcbiAgLy8gI3JlZ2lvbiBDUFUgdGVuc29yIC0gZmFsbCBiYWNrIHRvIG5vbi1nZW5lcmljIHRlbnNvciB0eXBlIGRlY2xhcmF0aW9uXHJcblxyXG4gIC8qKlxyXG4gICAqIENvbnN0cnVjdCBhIG5ldyB0ZW5zb3Igb2JqZWN0IGZyb20gdGhlIGdpdmVuIHR5cGUsIGRhdGEgYW5kIGRpbXMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdHlwZSAtIFNwZWNpZnkgdGhlIGVsZW1lbnQgdHlwZS5cclxuICAgKiBAcGFyYW0gZGF0YSAtIFNwZWNpZnkgdGhlIENQVSB0ZW5zb3IgZGF0YS5cclxuICAgKiBAcGFyYW0gZGltcyAtIFNwZWNpZnkgdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBJZiBvbWl0dGVkLCBhIDEtRCB0ZW5zb3IgaXMgYXNzdW1lZC5cclxuICAgKi9cclxuICBuZXcodHlwZTogVGVuc29yLlR5cGUsIGRhdGE6IFRlbnNvci5EYXRhVHlwZXxyZWFkb25seSBudW1iZXJbXXxyZWFkb25seSBzdHJpbmdbXXxyZWFkb25seSBiaWdpbnRbXXxyZWFkb25seSBib29sZWFuW10sXHJcbiAgICAgIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFRlbnNvcjtcclxuXHJcbiAgLyoqXHJcbiAgICogQ29uc3RydWN0IGEgbmV3IHRlbnNvciBvYmplY3QgZnJvbSB0aGUgZ2l2ZW4gZGF0YSBhbmQgZGltcy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBkYXRhIC0gU3BlY2lmeSB0aGUgQ1BVIHRlbnNvciBkYXRhLlxyXG4gICAqIEBwYXJhbSBkaW1zIC0gU3BlY2lmeSB0aGUgZGltZW5zaW9uIG9mIHRoZSB0ZW5zb3IuIElmIG9taXR0ZWQsIGEgMS1EIHRlbnNvciBpcyBhc3N1bWVkLlxyXG4gICAqL1xyXG4gIG5ldyhkYXRhOiBUZW5zb3IuRGF0YVR5cGUsIGRpbXM/OiByZWFkb25seSBudW1iZXJbXSk6IFRlbnNvcjtcclxuICAvLyAjZW5kcmVnaW9uXHJcbn1cclxuXHJcbi8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbmFtaW5nLWNvbnZlbnRpb25cclxuZXhwb3J0IGNvbnN0IFRlbnNvciA9IFRlbnNvckltcGwgYXMgVGVuc29yQ29uc3RydWN0b3I7XHJcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxyXG5cclxuaW1wb3J0IHtlbnZ9IGZyb20gJy4vZW52LWltcGwuanMnO1xyXG5cclxuLyoqXHJcbiAqIEBpZ25vcmVcclxuICovXHJcbmV4cG9ydCBjb25zdCBUUkFDRSA9IChkZXZpY2VUeXBlOiBzdHJpbmcsIGxhYmVsOiBzdHJpbmcpID0+IHtcclxuICBpZiAodHlwZW9mIGVudi50cmFjZSA9PT0gJ3VuZGVmaW5lZCcgPyAhZW52Lndhc20udHJhY2UgOiAhZW52LnRyYWNlKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zb2xlXHJcbiAgY29uc29sZS50aW1lU3RhbXAoYCR7ZGV2aWNlVHlwZX06Ok9SVDo6JHtsYWJlbH1gKTtcclxufTtcclxuXHJcbmNvbnN0IFRSQUNFX0ZVTkMgPSAobXNnOiBzdHJpbmcsIGV4dHJhTXNnPzogc3RyaW5nKSA9PiB7XHJcbiAgY29uc3Qgc3RhY2sgPSBuZXcgRXJyb3IoKS5zdGFjaz8uc3BsaXQoL1xcclxcbnxcXHJ8XFxuL2cpIHx8IFtdO1xyXG4gIGxldCBoYXNUcmFjZUZ1bmMgPSBmYWxzZTtcclxuICBmb3IgKGxldCBpID0gMDsgaSA8IHN0YWNrLmxlbmd0aDsgaSsrKSB7XHJcbiAgICBpZiAoaGFzVHJhY2VGdW5jICYmICFzdGFja1tpXS5pbmNsdWRlcygnVFJBQ0VfRlVOQycpKSB7XHJcbiAgICAgIGxldCBsYWJlbCA9IGBGVU5DXyR7bXNnfTo6JHtzdGFja1tpXS50cmltKCkuc3BsaXQoJyAnKVsxXX1gO1xyXG4gICAgICBpZiAoZXh0cmFNc2cpIHtcclxuICAgICAgICBsYWJlbCArPSBgOjoke2V4dHJhTXNnfWA7XHJcbiAgICAgIH1cclxuICAgICAgVFJBQ0UoJ0NQVScsIGxhYmVsKTtcclxuICAgICAgcmV0dXJuO1xyXG4gICAgfVxyXG4gICAgaWYgKHN0YWNrW2ldLmluY2x1ZGVzKCdUUkFDRV9GVU5DJykpIHtcclxuICAgICAgaGFzVHJhY2VGdW5jID0gdHJ1ZTtcclxuICAgIH1cclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogQGlnbm9yZVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IFRSQUNFX0ZVTkNfQkVHSU4gPSAoZXh0cmFNc2c/OiBzdHJpbmcpID0+IHtcclxuICBpZiAodHlwZW9mIGVudi50cmFjZSA9PT0gJ3VuZGVmaW5lZCcgPyAhZW52Lndhc20udHJhY2UgOiAhZW52LnRyYWNlKSB7XHJcbiAgICByZXR1cm47XHJcbiAgfVxyXG4gIFRSQUNFX0ZVTkMoJ0JFR0lOJywgZXh0cmFNc2cpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIEBpZ25vcmVcclxuICovXHJcbmV4cG9ydCBjb25zdCBUUkFDRV9GVU5DX0VORCA9IChleHRyYU1zZz86IHN0cmluZykgPT4ge1xyXG4gIGlmICh0eXBlb2YgZW52LnRyYWNlID09PSAndW5kZWZpbmVkJyA/ICFlbnYud2FzbS50cmFjZSA6ICFlbnYudHJhY2UpIHtcclxuICAgIHJldHVybjtcclxuICB9XHJcbiAgVFJBQ0VfRlVOQygnRU5EJywgZXh0cmFNc2cpO1xyXG59O1xyXG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cclxuXHJcbmltcG9ydCB7cmVzb2x2ZUJhY2tlbmRBbmRFeGVjdXRpb25Qcm92aWRlcnN9IGZyb20gJy4vYmFja2VuZC1pbXBsLmpzJztcclxuaW1wb3J0IHtJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcn0gZnJvbSAnLi9iYWNrZW5kLmpzJztcclxuaW1wb3J0IHtJbmZlcmVuY2VTZXNzaW9uIGFzIEluZmVyZW5jZVNlc3Npb25JbnRlcmZhY2V9IGZyb20gJy4vaW5mZXJlbmNlLXNlc3Npb24uanMnO1xyXG5pbXBvcnQge09ubnhWYWx1ZX0gZnJvbSAnLi9vbm54LXZhbHVlLmpzJztcclxuaW1wb3J0IHtUZW5zb3J9IGZyb20gJy4vdGVuc29yLmpzJztcclxuaW1wb3J0IHtUUkFDRV9GVU5DX0JFR0lOLCBUUkFDRV9GVU5DX0VORH0gZnJvbSAnLi90cmFjZS5qcyc7XHJcblxyXG50eXBlIFNlc3Npb25PcHRpb25zID0gSW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZS5TZXNzaW9uT3B0aW9ucztcclxudHlwZSBSdW5PcHRpb25zID0gSW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZS5SdW5PcHRpb25zO1xyXG50eXBlIEZlZWRzVHlwZSA9IEluZmVyZW5jZVNlc3Npb25JbnRlcmZhY2UuRmVlZHNUeXBlO1xyXG50eXBlIEZldGNoZXNUeXBlID0gSW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZS5GZXRjaGVzVHlwZTtcclxudHlwZSBSZXR1cm5UeXBlID0gSW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZS5SZXR1cm5UeXBlO1xyXG5cclxuZXhwb3J0IGNsYXNzIEluZmVyZW5jZVNlc3Npb24gaW1wbGVtZW50cyBJbmZlcmVuY2VTZXNzaW9uSW50ZXJmYWNlIHtcclxuICBwcml2YXRlIGNvbnN0cnVjdG9yKGhhbmRsZXI6IEluZmVyZW5jZVNlc3Npb25IYW5kbGVyKSB7XHJcbiAgICB0aGlzLmhhbmRsZXIgPSBoYW5kbGVyO1xyXG4gIH1cclxuICBydW4oZmVlZHM6IEZlZWRzVHlwZSwgb3B0aW9ucz86IFJ1bk9wdGlvbnMpOiBQcm9taXNlPFJldHVyblR5cGU+O1xyXG4gIHJ1bihmZWVkczogRmVlZHNUeXBlLCBmZXRjaGVzOiBGZXRjaGVzVHlwZSwgb3B0aW9ucz86IFJ1bk9wdGlvbnMpOiBQcm9taXNlPFJldHVyblR5cGU+O1xyXG4gIGFzeW5jIHJ1bihmZWVkczogRmVlZHNUeXBlLCBhcmcxPzogRmV0Y2hlc1R5cGV8UnVuT3B0aW9ucywgYXJnMj86IFJ1bk9wdGlvbnMpOiBQcm9taXNlPFJldHVyblR5cGU+IHtcclxuICAgIFRSQUNFX0ZVTkNfQkVHSU4oKTtcclxuICAgIGNvbnN0IGZldGNoZXM6IHtbbmFtZTogc3RyaW5nXTogT25ueFZhbHVlfG51bGx9ID0ge307XHJcbiAgICBsZXQgb3B0aW9uczogUnVuT3B0aW9ucyA9IHt9O1xyXG4gICAgLy8gY2hlY2sgaW5wdXRzXHJcbiAgICBpZiAodHlwZW9mIGZlZWRzICE9PSAnb2JqZWN0JyB8fCBmZWVkcyA9PT0gbnVsbCB8fCBmZWVkcyBpbnN0YW5jZW9mIFRlbnNvciB8fCBBcnJheS5pc0FycmF5KGZlZWRzKSkge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxyXG4gICAgICAgICAgJ1xcJ2ZlZWRzXFwnIG11c3QgYmUgYW4gb2JqZWN0IHRoYXQgdXNlIGlucHV0IG5hbWVzIGFzIGtleXMgYW5kIE9ubnhWYWx1ZSBhcyBjb3JyZXNwb25kaW5nIHZhbHVlcy4nKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgaXNGZXRjaGVzRW1wdHkgPSB0cnVlO1xyXG4gICAgLy8gZGV0ZXJtaW5lIHdoaWNoIG92ZXJyaWRlIGlzIGJlaW5nIHVzZWRcclxuICAgIGlmICh0eXBlb2YgYXJnMSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgaWYgKGFyZzEgPT09IG51bGwpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmV4cGVjdGVkIGFyZ3VtZW50WzFdOiBjYW5ub3QgYmUgbnVsbC4nKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoYXJnMSBpbnN0YW5jZW9mIFRlbnNvcikge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1xcJ2ZldGNoZXNcXCcgY2Fubm90IGJlIGEgVGVuc29yJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGFyZzEpKSB7XHJcbiAgICAgICAgaWYgKGFyZzEubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcXCdmZXRjaGVzXFwnIGNhbm5vdCBiZSBhbiBlbXB0eSBhcnJheS4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaXNGZXRjaGVzRW1wdHkgPSBmYWxzZTtcclxuICAgICAgICAvLyBvdXRwdXQgbmFtZXNcclxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgYXJnMSkge1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcXCdmZXRjaGVzXFwnIG11c3QgYmUgYSBzdHJpbmcgYXJyYXkgb3IgYW4gb2JqZWN0LicpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKHRoaXMub3V0cHV0TmFtZXMuaW5kZXhPZihuYW1lKSA9PT0gLTEpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYCdmZXRjaGVzJyBjb250YWlucyBpbnZhbGlkIG91dHB1dCBuYW1lOiAke25hbWV9LmApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgZmV0Y2hlc1tuYW1lXSA9IG51bGw7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAodHlwZW9mIGFyZzIgPT09ICdvYmplY3QnICYmIGFyZzIgIT09IG51bGwpIHtcclxuICAgICAgICAgIG9wdGlvbnMgPSBhcmcyO1xyXG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzIgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcXCdvcHRpb25zXFwnIG11c3QgYmUgYW4gb2JqZWN0LicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICAvLyBkZWNpZGUgd2hldGhlciBhcmcxIGlzIGZldGNoZXMgb3Igb3B0aW9uc1xyXG4gICAgICAgIC8vIGlmIGFueSBvdXRwdXQgbmFtZSBpcyBwcmVzZW50IGFuZCBpdHMgdmFsdWUgaXMgdmFsaWQgT25ueFZhbHVlLCB3ZSBjb25zaWRlciBpdCBmZXRjaGVzXHJcbiAgICAgICAgbGV0IGlzRmV0Y2hlcyA9IGZhbHNlO1xyXG4gICAgICAgIGNvbnN0IGFyZzFLZXlzID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXMoYXJnMSk7XHJcbiAgICAgICAgZm9yIChjb25zdCBuYW1lIG9mIHRoaXMub3V0cHV0TmFtZXMpIHtcclxuICAgICAgICAgIGlmIChhcmcxS2V5cy5pbmRleE9mKG5hbWUpICE9PSAtMSkge1xyXG4gICAgICAgICAgICBjb25zdCB2ID0gKGFyZzEgYXMgSW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZS5OdWxsYWJsZU9ubnhWYWx1ZU1hcFR5cGUpW25hbWVdO1xyXG4gICAgICAgICAgICBpZiAodiA9PT0gbnVsbCB8fCB2IGluc3RhbmNlb2YgVGVuc29yKSB7XHJcbiAgICAgICAgICAgICAgaXNGZXRjaGVzID0gdHJ1ZTtcclxuICAgICAgICAgICAgICBpc0ZldGNoZXNFbXB0eSA9IGZhbHNlO1xyXG4gICAgICAgICAgICAgIGZldGNoZXNbbmFtZV0gPSB2O1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoaXNGZXRjaGVzKSB7XHJcbiAgICAgICAgICBpZiAodHlwZW9mIGFyZzIgPT09ICdvYmplY3QnICYmIGFyZzIgIT09IG51bGwpIHtcclxuICAgICAgICAgICAgb3B0aW9ucyA9IGFyZzI7XHJcbiAgICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcyICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcXCdvcHRpb25zXFwnIG11c3QgYmUgYW4gb2JqZWN0LicpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBvcHRpb25zID0gYXJnMSBhcyBSdW5PcHRpb25zO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfSBlbHNlIGlmICh0eXBlb2YgYXJnMSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignVW5leHBlY3RlZCBhcmd1bWVudFsxXTogbXVzdCBiZSBcXCdmZXRjaGVzXFwnIG9yIFxcJ29wdGlvbnNcXCcuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY2hlY2sgaWYgYWxsIGlucHV0cyBhcmUgaW4gZmVlZFxyXG4gICAgZm9yIChjb25zdCBuYW1lIG9mIHRoaXMuaW5wdXROYW1lcykge1xyXG4gICAgICBpZiAodHlwZW9mIGZlZWRzW25hbWVdID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgaW5wdXQgJyR7bmFtZX0nIGlzIG1pc3NpbmcgaW4gJ2ZlZWRzJy5gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIG5vIGZldGNoZXMgaXMgc3BlY2lmaWVkLCB3ZSB1c2UgdGhlIGZ1bGwgb3V0cHV0IG5hbWVzIGxpc3RcclxuICAgIGlmIChpc0ZldGNoZXNFbXB0eSkge1xyXG4gICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgdGhpcy5vdXRwdXROYW1lcykge1xyXG4gICAgICAgIGZldGNoZXNbbmFtZV0gPSBudWxsO1xyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgLy8gZmVlZHMsIGZldGNoZXMgYW5kIG9wdGlvbnMgYXJlIHByZXBhcmVkXHJcblxyXG4gICAgY29uc3QgcmVzdWx0cyA9IGF3YWl0IHRoaXMuaGFuZGxlci5ydW4oZmVlZHMsIGZldGNoZXMsIG9wdGlvbnMpO1xyXG4gICAgY29uc3QgcmV0dXJuVmFsdWU6IHtbbmFtZTogc3RyaW5nXTogT25ueFZhbHVlfSA9IHt9O1xyXG4gICAgZm9yIChjb25zdCBrZXkgaW4gcmVzdWx0cykge1xyXG4gICAgICBpZiAoT2JqZWN0Lmhhc093blByb3BlcnR5LmNhbGwocmVzdWx0cywga2V5KSkge1xyXG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHJlc3VsdHNba2V5XTtcclxuICAgICAgICBpZiAocmVzdWx0IGluc3RhbmNlb2YgVGVuc29yKSB7XHJcbiAgICAgICAgICByZXR1cm5WYWx1ZVtrZXldID0gcmVzdWx0O1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICByZXR1cm5WYWx1ZVtrZXldID0gbmV3IFRlbnNvcihyZXN1bHQudHlwZSwgcmVzdWx0LmRhdGEsIHJlc3VsdC5kaW1zKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIFRSQUNFX0ZVTkNfRU5EKCk7XHJcbiAgICByZXR1cm4gcmV0dXJuVmFsdWU7XHJcbiAgfVxyXG5cclxuICBhc3luYyByZWxlYXNlKCk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgcmV0dXJuIHRoaXMuaGFuZGxlci5kaXNwb3NlKCk7XHJcbiAgfVxyXG5cclxuICBzdGF0aWMgY3JlYXRlKHBhdGg6IHN0cmluZywgb3B0aW9ucz86IFNlc3Npb25PcHRpb25zKTogUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uSW50ZXJmYWNlPjtcclxuICBzdGF0aWMgY3JlYXRlKGJ1ZmZlcjogQXJyYXlCdWZmZXJMaWtlLCBvcHRpb25zPzogU2Vzc2lvbk9wdGlvbnMpOiBQcm9taXNlPEluZmVyZW5jZVNlc3Npb25JbnRlcmZhY2U+O1xyXG4gIHN0YXRpYyBjcmVhdGUoYnVmZmVyOiBBcnJheUJ1ZmZlckxpa2UsIGJ5dGVPZmZzZXQ6IG51bWJlciwgYnl0ZUxlbmd0aD86IG51bWJlciwgb3B0aW9ucz86IFNlc3Npb25PcHRpb25zKTpcclxuICAgICAgUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uSW50ZXJmYWNlPjtcclxuICBzdGF0aWMgY3JlYXRlKGJ1ZmZlcjogVWludDhBcnJheSwgb3B0aW9ucz86IFNlc3Npb25PcHRpb25zKTogUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uSW50ZXJmYWNlPjtcclxuICBzdGF0aWMgYXN5bmMgY3JlYXRlKFxyXG4gICAgICBhcmcwOiBzdHJpbmd8QXJyYXlCdWZmZXJMaWtlfFVpbnQ4QXJyYXksIGFyZzE/OiBTZXNzaW9uT3B0aW9uc3xudW1iZXIsIGFyZzI/OiBudW1iZXIsXHJcbiAgICAgIGFyZzM/OiBTZXNzaW9uT3B0aW9ucyk6IFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbkludGVyZmFjZT4ge1xyXG4gICAgVFJBQ0VfRlVOQ19CRUdJTigpO1xyXG4gICAgLy8gZWl0aGVyIGxvYWQgZnJvbSBhIGZpbGUgb3IgYnVmZmVyXHJcbiAgICBsZXQgZmlsZVBhdGhPclVpbnQ4QXJyYXk6IHN0cmluZ3xVaW50OEFycmF5O1xyXG4gICAgbGV0IG9wdGlvbnM6IFNlc3Npb25PcHRpb25zID0ge307XHJcblxyXG4gICAgaWYgKHR5cGVvZiBhcmcwID09PSAnc3RyaW5nJykge1xyXG4gICAgICBmaWxlUGF0aE9yVWludDhBcnJheSA9IGFyZzA7XHJcbiAgICAgIGlmICh0eXBlb2YgYXJnMSA9PT0gJ29iamVjdCcgJiYgYXJnMSAhPT0gbnVsbCkge1xyXG4gICAgICAgIG9wdGlvbnMgPSBhcmcxO1xyXG4gICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcxICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1xcJ29wdGlvbnNcXCcgbXVzdCBiZSBhbiBvYmplY3QuJyk7XHJcbiAgICAgIH1cclxuICAgIH0gZWxzZSBpZiAoYXJnMCBpbnN0YW5jZW9mIFVpbnQ4QXJyYXkpIHtcclxuICAgICAgZmlsZVBhdGhPclVpbnQ4QXJyYXkgPSBhcmcwO1xyXG4gICAgICBpZiAodHlwZW9mIGFyZzEgPT09ICdvYmplY3QnICYmIGFyZzEgIT09IG51bGwpIHtcclxuICAgICAgICBvcHRpb25zID0gYXJnMTtcclxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYXJnMSAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcXCdvcHRpb25zXFwnIG11c3QgYmUgYW4gb2JqZWN0LicpO1xyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKFxyXG4gICAgICAgIGFyZzAgaW5zdGFuY2VvZiBBcnJheUJ1ZmZlciB8fFxyXG4gICAgICAgICh0eXBlb2YgU2hhcmVkQXJyYXlCdWZmZXIgIT09ICd1bmRlZmluZWQnICYmIGFyZzAgaW5zdGFuY2VvZiBTaGFyZWRBcnJheUJ1ZmZlcikpIHtcclxuICAgICAgY29uc3QgYnVmZmVyID0gYXJnMDtcclxuICAgICAgbGV0IGJ5dGVPZmZzZXQgPSAwO1xyXG4gICAgICBsZXQgYnl0ZUxlbmd0aCA9IGFyZzAuYnl0ZUxlbmd0aDtcclxuICAgICAgaWYgKHR5cGVvZiBhcmcxID09PSAnb2JqZWN0JyAmJiBhcmcxICE9PSBudWxsKSB7XHJcbiAgICAgICAgb3B0aW9ucyA9IGFyZzE7XHJcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzEgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgYnl0ZU9mZnNldCA9IGFyZzE7XHJcbiAgICAgICAgaWYgKCFOdW1iZXIuaXNTYWZlSW50ZWdlcihieXRlT2Zmc2V0KSkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoJ1xcJ2J5dGVPZmZzZXRcXCcgbXVzdCBiZSBhbiBpbnRlZ2VyLicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoYnl0ZU9mZnNldCA8IDAgfHwgYnl0ZU9mZnNldCA+PSBidWZmZXIuYnl0ZUxlbmd0aCkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IFJhbmdlRXJyb3IoYCdieXRlT2Zmc2V0JyBpcyBvdXQgb2YgcmFuZ2UgWzAsICR7YnVmZmVyLmJ5dGVMZW5ndGh9KS5gKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgYnl0ZUxlbmd0aCA9IGFyZzAuYnl0ZUxlbmd0aCAtIGJ5dGVPZmZzZXQ7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBhcmcyID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgYnl0ZUxlbmd0aCA9IGFyZzI7XHJcbiAgICAgICAgICBpZiAoIU51bWJlci5pc1NhZmVJbnRlZ2VyKGJ5dGVMZW5ndGgpKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKCdcXCdieXRlTGVuZ3RoXFwnIG11c3QgYmUgYW4gaW50ZWdlci4nKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmIChieXRlTGVuZ3RoIDw9IDAgfHwgYnl0ZU9mZnNldCArIGJ5dGVMZW5ndGggPiBidWZmZXIuYnl0ZUxlbmd0aCkge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgUmFuZ2VFcnJvcihgJ2J5dGVMZW5ndGgnIGlzIG91dCBvZiByYW5nZSAoMCwgJHtidWZmZXIuYnl0ZUxlbmd0aCAtIGJ5dGVPZmZzZXR9XS5gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGlmICh0eXBlb2YgYXJnMyA9PT0gJ29iamVjdCcgJiYgYXJnMyAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBvcHRpb25zID0gYXJnMztcclxuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzMgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1xcJ29wdGlvbnNcXCcgbXVzdCBiZSBhbiBvYmplY3QuJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgYXJnMiAhPT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1xcJ2J5dGVMZW5ndGhcXCcgbXVzdCBiZSBhIG51bWJlci4nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzEgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXFwnb3B0aW9uc1xcJyBtdXN0IGJlIGFuIG9iamVjdC4nKTtcclxuICAgICAgfVxyXG4gICAgICBmaWxlUGF0aE9yVWludDhBcnJheSA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlciwgYnl0ZU9mZnNldCwgYnl0ZUxlbmd0aCk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmV4cGVjdGVkIGFyZ3VtZW50WzBdOiBtdXN0IGJlIFxcJ3BhdGhcXCcgb3IgXFwnYnVmZmVyXFwnLicpO1xyXG4gICAgfVxyXG5cclxuICAgIC8vIHJlc29sdmUgYmFja2VuZCwgdXBkYXRlIHNlc3Npb24gb3B0aW9ucyB3aXRoIHZhbGlkYXRlZCBFUHMsIGFuZCBjcmVhdGUgc2Vzc2lvbiBoYW5kbGVyXHJcbiAgICBjb25zdCBbYmFja2VuZCwgb3B0aW9uc1dpdGhWYWxpZGF0ZWRFUHNdID0gYXdhaXQgcmVzb2x2ZUJhY2tlbmRBbmRFeGVjdXRpb25Qcm92aWRlcnMob3B0aW9ucyk7XHJcbiAgICBjb25zdCBoYW5kbGVyID0gYXdhaXQgYmFja2VuZC5jcmVhdGVJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcihmaWxlUGF0aE9yVWludDhBcnJheSwgb3B0aW9uc1dpdGhWYWxpZGF0ZWRFUHMpO1xyXG4gICAgVFJBQ0VfRlVOQ19FTkQoKTtcclxuICAgIHJldHVybiBuZXcgSW5mZXJlbmNlU2Vzc2lvbihoYW5kbGVyKTtcclxuICB9XHJcblxyXG4gIHN0YXJ0UHJvZmlsaW5nKCk6IHZvaWQge1xyXG4gICAgdGhpcy5oYW5kbGVyLnN0YXJ0UHJvZmlsaW5nKCk7XHJcbiAgfVxyXG4gIGVuZFByb2ZpbGluZygpOiB2b2lkIHtcclxuICAgIHRoaXMuaGFuZGxlci5lbmRQcm9maWxpbmcoKTtcclxuICB9XHJcblxyXG4gIGdldCBpbnB1dE5hbWVzKCk6IHJlYWRvbmx5IHN0cmluZ1tdIHtcclxuICAgIHJldHVybiB0aGlzLmhhbmRsZXIuaW5wdXROYW1lcztcclxuICB9XHJcbiAgZ2V0IG91dHB1dE5hbWVzKCk6IHJlYWRvbmx5IHN0cmluZ1tdIHtcclxuICAgIHJldHVybiB0aGlzLmhhbmRsZXIub3V0cHV0TmFtZXM7XHJcbiAgfVxyXG5cclxuICBwcml2YXRlIGhhbmRsZXI6IEluZmVyZW5jZVNlc3Npb25IYW5kbGVyO1xyXG59XHJcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxyXG5cclxuaW1wb3J0IHtJbmZlcmVuY2VTZXNzaW9uIGFzIEluZmVyZW5jZVNlc3Npb25JbXBsfSBmcm9tICcuL2luZmVyZW5jZS1zZXNzaW9uLWltcGwuanMnO1xyXG5pbXBvcnQge09ubnhNb2RlbE9wdGlvbnN9IGZyb20gJy4vb25ueC1tb2RlbC5qcyc7XHJcbmltcG9ydCB7T25ueFZhbHVlLCBPbm54VmFsdWVEYXRhTG9jYXRpb259IGZyb20gJy4vb25ueC12YWx1ZS5qcyc7XHJcblxyXG4vKiBlc2xpbnQtZGlzYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVkZWNsYXJlICovXHJcblxyXG5leHBvcnQgZGVjbGFyZSBuYW1lc3BhY2UgSW5mZXJlbmNlU2Vzc2lvbiB7XHJcbiAgLy8gI3JlZ2lvbiBpbnB1dC9vdXRwdXQgdHlwZXNcclxuXHJcbiAgdHlwZSBPbm54VmFsdWVNYXBUeXBlID0ge3JlYWRvbmx5IFtuYW1lOiBzdHJpbmddOiBPbm54VmFsdWV9O1xyXG4gIHR5cGUgTnVsbGFibGVPbm54VmFsdWVNYXBUeXBlID0ge3JlYWRvbmx5IFtuYW1lOiBzdHJpbmddOiBPbm54VmFsdWUgfCBudWxsfTtcclxuXHJcbiAgLyoqXHJcbiAgICogQSBmZWVkcyAobW9kZWwgaW5wdXRzKSBpcyBhbiBvYmplY3QgdGhhdCB1c2VzIGlucHV0IG5hbWVzIGFzIGtleXMgYW5kIE9ubnhWYWx1ZSBhcyBjb3JyZXNwb25kaW5nIHZhbHVlcy5cclxuICAgKi9cclxuICB0eXBlIEZlZWRzVHlwZSA9IE9ubnhWYWx1ZU1hcFR5cGU7XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgZmV0Y2hlcyAobW9kZWwgb3V0cHV0cykgY291bGQgYmUgb25lIG9mIHRoZSBmb2xsb3dpbmc6XHJcbiAgICpcclxuICAgKiAtIE9taXR0ZWQuIFVzZSBtb2RlbCdzIG91dHB1dCBuYW1lcyBkZWZpbml0aW9uLlxyXG4gICAqIC0gQW4gYXJyYXkgb2Ygc3RyaW5nIGluZGljYXRpbmcgdGhlIG91dHB1dCBuYW1lcy5cclxuICAgKiAtIEFuIG9iamVjdCB0aGF0IHVzZSBvdXRwdXQgbmFtZXMgYXMga2V5cyBhbmQgT25ueFZhbHVlIG9yIG51bGwgYXMgY29ycmVzcG9uZGluZyB2YWx1ZXMuXHJcbiAgICpcclxuICAgKiBAcmVtYXJrXHJcbiAgICogZGlmZmVyZW50IGZyb20gaW5wdXQgYXJndW1lbnQsIGluIG91dHB1dCwgT25ueFZhbHVlIGlzIG9wdGlvbmFsLiBJZiBhbiBPbm54VmFsdWUgaXMgcHJlc2VudCBpdCB3aWxsIGJlXHJcbiAgICogdXNlZCBhcyBhIHByZS1hbGxvY2F0ZWQgdmFsdWUgYnkgdGhlIGluZmVyZW5jZSBlbmdpbmU7IGlmIG9taXR0ZWQsIGluZmVyZW5jZSBlbmdpbmUgd2lsbCBhbGxvY2F0ZSBidWZmZXJcclxuICAgKiBpbnRlcm5hbGx5LlxyXG4gICAqL1xyXG4gIHR5cGUgRmV0Y2hlc1R5cGUgPSByZWFkb25seSBzdHJpbmdbXXxOdWxsYWJsZU9ubnhWYWx1ZU1hcFR5cGU7XHJcblxyXG4gIC8qKlxyXG4gICAqIEEgaW5mZXJlbmNpbmcgcmV0dXJuIHR5cGUgaXMgYW4gb2JqZWN0IHRoYXQgdXNlcyBvdXRwdXQgbmFtZXMgYXMga2V5cyBhbmQgT25ueFZhbHVlIGFzIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxyXG4gICAqL1xyXG4gIHR5cGUgUmV0dXJuVHlwZSA9IE9ubnhWYWx1ZU1hcFR5cGU7XHJcblxyXG4gIC8vICNlbmRyZWdpb25cclxuXHJcbiAgLy8gI3JlZ2lvbiBzZXNzaW9uIG9wdGlvbnNcclxuXHJcbiAgLyoqXHJcbiAgICogQSBzZXQgb2YgY29uZmlndXJhdGlvbnMgZm9yIHNlc3Npb24gYmVoYXZpb3IuXHJcbiAgICovXHJcbiAgZXhwb3J0IGludGVyZmFjZSBTZXNzaW9uT3B0aW9ucyBleHRlbmRzIE9ubnhNb2RlbE9wdGlvbnMge1xyXG4gICAgLyoqXHJcbiAgICAgKiBBbiBhcnJheSBvZiBleGVjdXRpb24gcHJvdmlkZXIgb3B0aW9ucy5cclxuICAgICAqXHJcbiAgICAgKiBBbiBleGVjdXRpb24gcHJvdmlkZXIgb3B0aW9uIGNhbiBiZSBhIHN0cmluZyBpbmRpY2F0aW5nIHRoZSBuYW1lIG9mIHRoZSBleGVjdXRpb24gcHJvdmlkZXIsXHJcbiAgICAgKiBvciBhbiBvYmplY3Qgb2YgY29ycmVzcG9uZGluZyB0eXBlLlxyXG4gICAgICovXHJcbiAgICBleGVjdXRpb25Qcm92aWRlcnM/OiByZWFkb25seSBFeGVjdXRpb25Qcm92aWRlckNvbmZpZ1tdO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIGludHJhIE9QIHRocmVhZHMgbnVtYmVyLlxyXG4gICAgICpcclxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSAoTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUpLlxyXG4gICAgICovXHJcbiAgICBpbnRyYU9wTnVtVGhyZWFkcz86IG51bWJlcjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIFRoZSBpbnRlciBPUCB0aHJlYWRzIG51bWJlci5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgKE5vZGUuanMgYmluZGluZyBhbmQgcmVhY3QtbmF0aXZlKS5cclxuICAgICAqL1xyXG4gICAgaW50ZXJPcE51bVRocmVhZHM/OiBudW1iZXI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGUuXHJcbiAgICAgKlxyXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIChOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSkgb3IgV2ViQXNzZW1ibHkgYmFja2VuZFxyXG4gICAgICovXHJcbiAgICBmcmVlRGltZW5zaW9uT3ZlcnJpZGVzPzoge3JlYWRvbmx5IFtkaW1lbnNpb25OYW1lOiBzdHJpbmddOiBudW1iZXJ9O1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogVGhlIG9wdGltaXphdGlvbiBsZXZlbC5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgKE5vZGUuanMgYmluZGluZyBhbmQgcmVhY3QtbmF0aXZlKSBvciBXZWJBc3NlbWJseSBiYWNrZW5kXHJcbiAgICAgKi9cclxuICAgIGdyYXBoT3B0aW1pemF0aW9uTGV2ZWw/OiAnZGlzYWJsZWQnfCdiYXNpYyd8J2V4dGVuZGVkJ3wnYWxsJztcclxuXHJcbiAgICAvKipcclxuICAgICAqIFdoZXRoZXIgZW5hYmxlIENQVSBtZW1vcnkgYXJlbmEuXHJcbiAgICAgKlxyXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIChOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSkgb3IgV2ViQXNzZW1ibHkgYmFja2VuZFxyXG4gICAgICovXHJcbiAgICBlbmFibGVDcHVNZW1BcmVuYT86IGJvb2xlYW47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGV0aGVyIGVuYWJsZSBtZW1vcnkgcGF0dGVybi5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgKE5vZGUuanMgYmluZGluZyBhbmQgcmVhY3QtbmF0aXZlKSBvciBXZWJBc3NlbWJseSBiYWNrZW5kXHJcbiAgICAgKi9cclxuICAgIGVuYWJsZU1lbVBhdHRlcm4/OiBib29sZWFuO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogRXhlY3V0aW9uIG1vZGUuXHJcbiAgICAgKlxyXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIChOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSkgb3IgV2ViQXNzZW1ibHkgYmFja2VuZFxyXG4gICAgICovXHJcbiAgICBleGVjdXRpb25Nb2RlPzogJ3NlcXVlbnRpYWwnfCdwYXJhbGxlbCc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBPcHRpbWl6ZWQgbW9kZWwgZmlsZSBwYXRoLlxyXG4gICAgICpcclxuICAgICAqIElmIHRoaXMgc2V0dGluZyBpcyBzcGVjaWZpZWQsIHRoZSBvcHRpbWl6ZWQgbW9kZWwgd2lsbCBiZSBkdW1wZWQuIEluIGJyb3dzZXIsIGEgYmxvYiB3aWxsIGJlIGNyZWF0ZWRcclxuICAgICAqIHdpdGggYSBwb3AtdXAgd2luZG93LlxyXG4gICAgICovXHJcbiAgICBvcHRpbWl6ZWRNb2RlbEZpbGVQYXRoPzogc3RyaW5nO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogV2hldGhlciBlbmFibGUgcHJvZmlsaW5nLlxyXG4gICAgICpcclxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhIHBsYWNlaG9sZGVyIGZvciBhIGZ1dHVyZSB1c2UuXHJcbiAgICAgKi9cclxuICAgIGVuYWJsZVByb2ZpbGluZz86IGJvb2xlYW47XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBGaWxlIHByZWZpeCBmb3IgcHJvZmlsaW5nLlxyXG4gICAgICpcclxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhIHBsYWNlaG9sZGVyIGZvciBhIGZ1dHVyZSB1c2UuXHJcbiAgICAgKi9cclxuICAgIHByb2ZpbGVGaWxlUHJlZml4Pzogc3RyaW5nO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogTG9nIElELlxyXG4gICAgICpcclxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSAoTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUpIG9yIFdlYkFzc2VtYmx5IGJhY2tlbmRcclxuICAgICAqL1xyXG4gICAgbG9nSWQ/OiBzdHJpbmc7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBMb2cgc2V2ZXJpdHkgbGV2ZWwuIFNlZVxyXG4gICAgICogaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9vbm54cnVudGltZS9ibG9iL21haW4vaW5jbHVkZS9vbm54cnVudGltZS9jb3JlL2NvbW1vbi9sb2dnaW5nL3NldmVyaXR5LmhcclxuICAgICAqXHJcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgKE5vZGUuanMgYmluZGluZyBhbmQgcmVhY3QtbmF0aXZlKSBvciBXZWJBc3NlbWJseSBiYWNrZW5kXHJcbiAgICAgKi9cclxuICAgIGxvZ1NldmVyaXR5TGV2ZWw/OiAwfDF8MnwzfDQ7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBMb2cgdmVyYm9zaXR5IGxldmVsLlxyXG4gICAgICpcclxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBXZWJBc3NlbWJseSBiYWNrZW5kLiBXaWxsIHN1cHBvcnQgTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUgbGF0ZXJcclxuICAgICAqL1xyXG4gICAgbG9nVmVyYm9zaXR5TGV2ZWw/OiBudW1iZXI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBTcGVjaWZ5IHN0cmluZyBhcyBhIHByZWZlcnJlZCBkYXRhIGxvY2F0aW9uIGZvciBhbGwgb3V0cHV0cywgb3IgYW4gb2JqZWN0IHRoYXQgdXNlIG91dHB1dCBuYW1lcyBhcyBrZXlzIGFuZCBhXHJcbiAgICAgKiBwcmVmZXJyZWQgZGF0YSBsb2NhdGlvbiBhcyBjb3JyZXNwb25kaW5nIHZhbHVlcy5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgV2ViIGZvciBXZWJHTCBhbmQgV2ViR1BVIEVQLlxyXG4gICAgICovXHJcbiAgICBwcmVmZXJyZWRPdXRwdXRMb2NhdGlvbj86IE9ubnhWYWx1ZURhdGFMb2NhdGlvbnx7cmVhZG9ubHkgW291dHB1dE5hbWU6IHN0cmluZ106IE9ubnhWYWx1ZURhdGFMb2NhdGlvbn07XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBXaGV0aGVyIGVuYWJsZSBncmFwaCBjYXB0dXJlLlxyXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIE9OTlhSdW50aW1lIFdlYiBmb3IgV2ViR1BVIEVQLlxyXG4gICAgICovXHJcbiAgICBlbmFibGVHcmFwaENhcHR1cmU/OiBib29sZWFuO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU3RvcmUgY29uZmlndXJhdGlvbnMgZm9yIGEgc2Vzc2lvbi4gU2VlXHJcbiAgICAgKiBodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L29ubnhydW50aW1lL2Jsb2IvbWFpbi9pbmNsdWRlL29ubnhydW50aW1lL2NvcmUvc2Vzc2lvbi9cclxuICAgICAqIG9ubnhydW50aW1lX3Nlc3Npb25fb3B0aW9uc19jb25maWdfa2V5cy5oXHJcbiAgICAgKlxyXG4gICAgICogVGhpcyBzZXR0aW5nIGlzIGF2YWlsYWJsZSBvbmx5IGluIFdlYkFzc2VtYmx5IGJhY2tlbmQuIFdpbGwgc3VwcG9ydCBOb2RlLmpzIGJpbmRpbmcgYW5kIHJlYWN0LW5hdGl2ZSBsYXRlclxyXG4gICAgICpcclxuICAgICAqIEBleGFtcGxlXHJcbiAgICAgKiBgYGBqc1xyXG4gICAgICogZXh0cmE6IHtcclxuICAgICAqICAgc2Vzc2lvbjoge1xyXG4gICAgICogICAgIHNldF9kZW5vcm1hbF9hc196ZXJvOiBcIjFcIixcclxuICAgICAqICAgICBkaXNhYmxlX3ByZXBhY2tpbmc6IFwiMVwiXHJcbiAgICAgKiAgIH0sXHJcbiAgICAgKiAgIG9wdGltaXphdGlvbjoge1xyXG4gICAgICogICAgIGVuYWJsZV9nZWx1X2FwcHJveGltYXRpb246IFwiMVwiXHJcbiAgICAgKiAgIH1cclxuICAgICAqIH1cclxuICAgICAqIGBgYFxyXG4gICAgICovXHJcbiAgICBleHRyYT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xyXG4gIH1cclxuXHJcbiAgLy8gI3JlZ2lvbiBleGVjdXRpb24gcHJvdmlkZXJzXHJcblxyXG4gIC8vIEN1cnJlbnRseSwgd2UgaGF2ZSB0aGUgZm9sbG93aW5nIGJhY2tlbmRzIHRvIHN1cHBvcnQgZXhlY3V0aW9uIHByb3ZpZGVyczpcclxuICAvLyBCYWNrZW5kIE5vZGUuanMgYmluZGluZzogc3VwcG9ydHMgJ2NwdScsICdkbWwnICh3aW4zMiksICdjb3JlbWwnIChtYWNPUykgYW5kICdjdWRhJyAobGludXgpLlxyXG4gIC8vIEJhY2tlbmQgV2ViQXNzZW1ibHk6IHN1cHBvcnRzICdjcHUnLCAnd2FzbScsICd3ZWJncHUnIGFuZCAnd2Vibm4nLlxyXG4gIC8vIEJhY2tlbmQgT05OWC5qczogc3VwcG9ydHMgJ3dlYmdsJy5cclxuICAvLyBCYWNrZW5kIFJlYWN0IE5hdGl2ZTogc3VwcG9ydHMgJ2NwdScsICd4bm5wYWNrJywgJ2NvcmVtbCcgKGlPUyksICdubmFwaScgKEFuZHJvaWQpLlxyXG4gIGludGVyZmFjZSBFeGVjdXRpb25Qcm92aWRlck9wdGlvbk1hcCB7XHJcbiAgICBjb3JlbWw6IENvcmVNTEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xyXG4gICAgY3B1OiBDcHVFeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcclxuICAgIGN1ZGE6IEN1ZGFFeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcclxuICAgIGRtbDogRG1sRXhlY3V0aW9uUHJvdmlkZXJPcHRpb247XHJcbiAgICBubmFwaTogTm5hcGlFeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcclxuICAgIHRlbnNvcnJ0OiBUZW5zb3JSdEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xyXG4gICAgd2FzbTogV2ViQXNzZW1ibHlFeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcclxuICAgIHdlYmdsOiBXZWJHTEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xyXG4gICAgd2ViZ3B1OiBXZWJHcHVFeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcclxuICAgIHdlYm5uOiBXZWJOTkV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xyXG4gICAgeG5ucGFjazogWG5ucGFja0V4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xyXG4gIH1cclxuXHJcbiAgdHlwZSBFeGVjdXRpb25Qcm92aWRlck5hbWUgPSBrZXlvZiBFeGVjdXRpb25Qcm92aWRlck9wdGlvbk1hcDtcclxuICB0eXBlIEV4ZWN1dGlvblByb3ZpZGVyQ29uZmlnID1cclxuICAgICAgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb25NYXBbRXhlY3V0aW9uUHJvdmlkZXJOYW1lXXxFeGVjdXRpb25Qcm92aWRlck9wdGlvbnxFeGVjdXRpb25Qcm92aWRlck5hbWV8c3RyaW5nO1xyXG5cclxuICBleHBvcnQgaW50ZXJmYWNlIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIHtcclxuICAgIHJlYWRvbmx5IG5hbWU6IHN0cmluZztcclxuICB9XHJcbiAgZXhwb3J0IGludGVyZmFjZSBDcHVFeGVjdXRpb25Qcm92aWRlck9wdGlvbiBleHRlbmRzIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIHtcclxuICAgIHJlYWRvbmx5IG5hbWU6ICdjcHUnO1xyXG4gICAgdXNlQXJlbmE/OiBib29sZWFuO1xyXG4gIH1cclxuICBleHBvcnQgaW50ZXJmYWNlIEN1ZGFFeGVjdXRpb25Qcm92aWRlck9wdGlvbiBleHRlbmRzIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIHtcclxuICAgIHJlYWRvbmx5IG5hbWU6ICdjdWRhJztcclxuICAgIGRldmljZUlkPzogbnVtYmVyO1xyXG4gIH1cclxuICBleHBvcnQgaW50ZXJmYWNlIERtbEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIGV4dGVuZHMgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24ge1xyXG4gICAgcmVhZG9ubHkgbmFtZTogJ2RtbCc7XHJcbiAgICBkZXZpY2VJZD86IG51bWJlcjtcclxuICB9XHJcbiAgZXhwb3J0IGludGVyZmFjZSBUZW5zb3JSdEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIGV4dGVuZHMgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24ge1xyXG4gICAgcmVhZG9ubHkgbmFtZTogJ3RlbnNvcnJ0JztcclxuICAgIGRldmljZUlkPzogbnVtYmVyO1xyXG4gIH1cclxuICBleHBvcnQgaW50ZXJmYWNlIFdlYkFzc2VtYmx5RXhlY3V0aW9uUHJvdmlkZXJPcHRpb24gZXh0ZW5kcyBFeGVjdXRpb25Qcm92aWRlck9wdGlvbiB7XHJcbiAgICByZWFkb25seSBuYW1lOiAnd2FzbSc7XHJcbiAgfVxyXG4gIGV4cG9ydCBpbnRlcmZhY2UgV2ViR0xFeGVjdXRpb25Qcm92aWRlck9wdGlvbiBleHRlbmRzIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIHtcclxuICAgIHJlYWRvbmx5IG5hbWU6ICd3ZWJnbCc7XHJcbiAgICAvLyBUT0RPOiBhZGQgZmxhZ3NcclxuICB9XHJcbiAgZXhwb3J0IGludGVyZmFjZSBYbm5wYWNrRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24gZXh0ZW5kcyBFeGVjdXRpb25Qcm92aWRlck9wdGlvbiB7XHJcbiAgICByZWFkb25seSBuYW1lOiAneG5ucGFjayc7XHJcbiAgfVxyXG4gIGV4cG9ydCBpbnRlcmZhY2UgV2ViR3B1RXhlY3V0aW9uUHJvdmlkZXJPcHRpb24gZXh0ZW5kcyBFeGVjdXRpb25Qcm92aWRlck9wdGlvbiB7XHJcbiAgICByZWFkb25seSBuYW1lOiAnd2ViZ3B1JztcclxuICAgIHByZWZlcnJlZExheW91dD86ICdOQ0hXJ3wnTkhXQyc7XHJcbiAgfVxyXG4gIGV4cG9ydCBpbnRlcmZhY2UgV2ViTk5FeGVjdXRpb25Qcm92aWRlck9wdGlvbiBleHRlbmRzIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIHtcclxuICAgIHJlYWRvbmx5IG5hbWU6ICd3ZWJubic7XHJcbiAgICBkZXZpY2VUeXBlPzogJ2NwdSd8J2dwdSd8J25wdSc7XHJcbiAgICBudW1UaHJlYWRzPzogbnVtYmVyO1xyXG4gICAgcG93ZXJQcmVmZXJlbmNlPzogJ2RlZmF1bHQnfCdsb3ctcG93ZXInfCdoaWdoLXBlcmZvcm1hbmNlJztcclxuICB9XHJcbiAgZXhwb3J0IGludGVyZmFjZSBDb3JlTUxFeGVjdXRpb25Qcm92aWRlck9wdGlvbiBleHRlbmRzIEV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIHtcclxuICAgIHJlYWRvbmx5IG5hbWU6ICdjb3JlbWwnO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgYml0IGZsYWdzIGZvciBDb3JlTUwgZXhlY3V0aW9uIHByb3ZpZGVyLlxyXG4gICAgICpcclxuICAgICAqIGBgYFxyXG4gICAgICogQ09SRU1MX0ZMQUdfVVNFX0NQVV9PTkxZID0gMHgwMDFcclxuICAgICAqIENPUkVNTF9GTEFHX0VOQUJMRV9PTl9TVUJHUkFQSCA9IDB4MDAyXHJcbiAgICAgKiBDT1JFTUxfRkxBR19PTkxZX0VOQUJMRV9ERVZJQ0VfV0lUSF9BTkUgPSAweDAwNFxyXG4gICAgICogQ09SRU1MX0ZMQUdfT05MWV9BTExPV19TVEFUSUNfSU5QVVRfU0hBUEVTID0gMHgwMDhcclxuICAgICAqIENPUkVNTF9GTEFHX0NSRUFURV9NTFBST0dSQU0gPSAweDAxMFxyXG4gICAgICogYGBgXHJcbiAgICAgKlxyXG4gICAgICogU2VlIGluY2x1ZGUvb25ueHJ1bnRpbWUvY29yZS9wcm92aWRlcnMvY29yZW1sL2NvcmVtbF9wcm92aWRlcl9mYWN0b3J5LmggZm9yIG1vcmUgZGV0YWlscy5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIGZsYWcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgKE5vZGUuanMgYmluZGluZykuXHJcbiAgICAgKi9cclxuICAgIGNvcmVNbEZsYWdzPzogbnVtYmVyO1xyXG4gICAgLyoqXHJcbiAgICAgKiBTcGVjaWZ5IHdoZXRoZXIgdG8gdXNlIENQVSBvbmx5IGluIENvcmVNTCBFUC5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgKHJlYWN0LW5hdGl2ZSkuXHJcbiAgICAgKi9cclxuICAgIHVzZUNQVU9ubHk/OiBib29sZWFuO1xyXG4gICAgLyoqXHJcbiAgICAgKiBTcGVjaWZ5IHdoZXRoZXIgdG8gZW5hYmxlIENvcmVNTCBFUCBvbiBzdWJncmFwaC5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgKHJlYWN0LW5hdGl2ZSkuXHJcbiAgICAgKi9cclxuICAgIGVuYWJsZU9uU3ViZ3JhcGg/OiBib29sZWFuO1xyXG4gICAgLyoqXHJcbiAgICAgKiBTcGVjaWZ5IHdoZXRoZXIgdG8gb25seSBlbmFibGUgQ29yZU1MIEVQIGZvciBBcHBsZSBkZXZpY2VzIHdpdGggQU5FIChBcHBsZSBOZXVyYWwgRW5naW5lKS5cclxuICAgICAqXHJcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgKHJlYWN0LW5hdGl2ZSkuXHJcbiAgICAgKi9cclxuICAgIG9ubHlFbmFibGVEZXZpY2VXaXRoQU5FPzogYm9vbGVhbjtcclxuICB9XHJcbiAgZXhwb3J0IGludGVyZmFjZSBObmFwaUV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uIGV4dGVuZHMgRXhlY3V0aW9uUHJvdmlkZXJPcHRpb24ge1xyXG4gICAgcmVhZG9ubHkgbmFtZTogJ25uYXBpJztcclxuICAgIHVzZUZQMTY/OiBib29sZWFuO1xyXG4gICAgdXNlTkNIVz86IGJvb2xlYW47XHJcbiAgICBjcHVEaXNhYmxlZD86IGJvb2xlYW47XHJcbiAgICBjcHVPbmx5PzogYm9vbGVhbjtcclxuICB9XHJcbiAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gIC8vICNyZWdpb24gcnVuIG9wdGlvbnNcclxuXHJcbiAgLyoqXHJcbiAgICogQSBzZXQgb2YgY29uZmlndXJhdGlvbnMgZm9yIGluZmVyZW5jZSBydW4gYmVoYXZpb3JcclxuICAgKi9cclxuICBleHBvcnQgaW50ZXJmYWNlIFJ1bk9wdGlvbnMge1xyXG4gICAgLyoqXHJcbiAgICAgKiBMb2cgc2V2ZXJpdHkgbGV2ZWwuIFNlZVxyXG4gICAgICogaHR0cHM6Ly9naXRodWIuY29tL21pY3Jvc29mdC9vbm54cnVudGltZS9ibG9iL21haW4vaW5jbHVkZS9vbm54cnVudGltZS9jb3JlL2NvbW1vbi9sb2dnaW5nL3NldmVyaXR5LmhcclxuICAgICAqXHJcbiAgICAgKiBUaGlzIHNldHRpbmcgaXMgYXZhaWxhYmxlIG9ubHkgaW4gT05OWFJ1bnRpbWUgKE5vZGUuanMgYmluZGluZyBhbmQgcmVhY3QtbmF0aXZlKSBvciBXZWJBc3NlbWJseSBiYWNrZW5kXHJcbiAgICAgKi9cclxuICAgIGxvZ1NldmVyaXR5TGV2ZWw/OiAwfDF8MnwzfDQ7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBMb2cgdmVyYm9zaXR5IGxldmVsLlxyXG4gICAgICpcclxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBXZWJBc3NlbWJseSBiYWNrZW5kLiBXaWxsIHN1cHBvcnQgTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUgbGF0ZXJcclxuICAgICAqL1xyXG4gICAgbG9nVmVyYm9zaXR5TGV2ZWw/OiBudW1iZXI7XHJcblxyXG4gICAgLyoqXHJcbiAgICAgKiBUZXJtaW5hdGUgYWxsIGluY29tcGxldGUgT3J0UnVuIGNhbGxzIGFzIHNvb24gYXMgcG9zc2libGUgaWYgdHJ1ZVxyXG4gICAgICpcclxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBXZWJBc3NlbWJseSBiYWNrZW5kLiBXaWxsIHN1cHBvcnQgTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUgbGF0ZXJcclxuICAgICAqL1xyXG4gICAgdGVybWluYXRlPzogYm9vbGVhbjtcclxuXHJcbiAgICAvKipcclxuICAgICAqIEEgdGFnIGZvciB0aGUgUnVuKCkgY2FsbHMgdXNpbmcgdGhpc1xyXG4gICAgICpcclxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBPTk5YUnVudGltZSAoTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUpIG9yIFdlYkFzc2VtYmx5IGJhY2tlbmRcclxuICAgICAqL1xyXG4gICAgdGFnPzogc3RyaW5nO1xyXG5cclxuICAgIC8qKlxyXG4gICAgICogU2V0IGEgc2luZ2xlIHJ1biBjb25maWd1cmF0aW9uIGVudHJ5LiBTZWVcclxuICAgICAqIGh0dHBzOi8vZ2l0aHViLmNvbS9taWNyb3NvZnQvb25ueHJ1bnRpbWUvYmxvYi9tYWluL2luY2x1ZGUvb25ueHJ1bnRpbWUvY29yZS9zZXNzaW9uL1xyXG4gICAgICogb25ueHJ1bnRpbWVfcnVuX29wdGlvbnNfY29uZmlnX2tleXMuaFxyXG4gICAgICpcclxuICAgICAqIFRoaXMgc2V0dGluZyBpcyBhdmFpbGFibGUgb25seSBpbiBXZWJBc3NlbWJseSBiYWNrZW5kLiBXaWxsIHN1cHBvcnQgTm9kZS5qcyBiaW5kaW5nIGFuZCByZWFjdC1uYXRpdmUgbGF0ZXJcclxuICAgICAqXHJcbiAgICAgKiBAZXhhbXBsZVxyXG4gICAgICpcclxuICAgICAqIGBgYGpzXHJcbiAgICAgKiBleHRyYToge1xyXG4gICAgICogICBtZW1vcnk6IHtcclxuICAgICAqICAgICBlbmFibGVfbWVtb3J5X2FyZW5hX3Nocmlua2FnZTogXCIxXCIsXHJcbiAgICAgKiAgIH1cclxuICAgICAqIH1cclxuICAgICAqIGBgYFxyXG4gICAgICovXHJcbiAgICBleHRyYT86IFJlY29yZDxzdHJpbmcsIHVua25vd24+O1xyXG4gIH1cclxuXHJcbiAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAvLyAjcmVnaW9uIHZhbHVlIG1ldGFkYXRhXHJcblxyXG4gIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tZW1wdHktaW50ZXJmYWNlXHJcbiAgaW50ZXJmYWNlIFZhbHVlTWV0YWRhdGEge1xyXG4gICAgLy8gVEJEXHJcbiAgfVxyXG5cclxuICAvLyAjZW5kcmVnaW9uXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnQgYSBydW50aW1lIGluc3RhbmNlIG9mIGFuIE9OTlggbW9kZWwuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIEluZmVyZW5jZVNlc3Npb24ge1xyXG4gIC8vICNyZWdpb24gcnVuKClcclxuXHJcbiAgLyoqXHJcbiAgICogRXhlY3V0ZSB0aGUgbW9kZWwgYXN5bmNocm9ub3VzbHkgd2l0aCB0aGUgZ2l2ZW4gZmVlZHMgYW5kIG9wdGlvbnMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZmVlZHMgLSBSZXByZXNlbnRhdGlvbiBvZiB0aGUgbW9kZWwgaW5wdXQuIFNlZSB0eXBlIGRlc2NyaXB0aW9uIG9mIGBJbmZlcmVuY2VTZXNzaW9uLklucHV0VHlwZWAgZm9yIGRldGFpbC5cclxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbmFsLiBBIHNldCBvZiBvcHRpb25zIHRoYXQgY29udHJvbHMgdGhlIGJlaGF2aW9yIG9mIG1vZGVsIGluZmVyZW5jZS5cclxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIG1hcCwgd2hpY2ggdXNlcyBvdXRwdXQgbmFtZXMgYXMga2V5cyBhbmQgT25ueFZhbHVlIGFzIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxyXG4gICAqL1xyXG4gIHJ1bihmZWVkczogSW5mZXJlbmNlU2Vzc2lvbi5GZWVkc1R5cGUsIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOiBQcm9taXNlPEluZmVyZW5jZVNlc3Npb24uUmV0dXJuVHlwZT47XHJcblxyXG4gIC8qKlxyXG4gICAqIEV4ZWN1dGUgdGhlIG1vZGVsIGFzeW5jaHJvbm91c2x5IHdpdGggdGhlIGdpdmVuIGZlZWRzLCBmZXRjaGVzIGFuZCBvcHRpb25zLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGZlZWRzIC0gUmVwcmVzZW50YXRpb24gb2YgdGhlIG1vZGVsIGlucHV0LiBTZWUgdHlwZSBkZXNjcmlwdGlvbiBvZiBgSW5mZXJlbmNlU2Vzc2lvbi5JbnB1dFR5cGVgIGZvciBkZXRhaWwuXHJcbiAgICogQHBhcmFtIGZldGNoZXMgLSBSZXByZXNlbnRhdGlvbiBvZiB0aGUgbW9kZWwgb3V0cHV0LiBTZWUgdHlwZSBkZXNjcmlwdGlvbiBvZiBgSW5mZXJlbmNlU2Vzc2lvbi5PdXRwdXRUeXBlYCBmb3JcclxuICAgKiBkZXRhaWwuXHJcbiAgICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25hbC4gQSBzZXQgb2Ygb3B0aW9ucyB0aGF0IGNvbnRyb2xzIHRoZSBiZWhhdmlvciBvZiBtb2RlbCBpbmZlcmVuY2UuXHJcbiAgICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSBtYXAsIHdoaWNoIHVzZXMgb3V0cHV0IG5hbWVzIGFzIGtleXMgYW5kIE9ubnhWYWx1ZSBhcyBjb3JyZXNwb25kaW5nIHZhbHVlcy5cclxuICAgKi9cclxuICBydW4oZmVlZHM6IEluZmVyZW5jZVNlc3Npb24uRmVlZHNUeXBlLCBmZXRjaGVzOiBJbmZlcmVuY2VTZXNzaW9uLkZldGNoZXNUeXBlLFxyXG4gICAgICBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTogUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uLlJldHVyblR5cGU+O1xyXG5cclxuICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gIC8vICNyZWdpb24gcmVsZWFzZSgpXHJcblxyXG4gIC8qKlxyXG4gICAqIFJlbGVhc2UgdGhlIGluZmVyZW5jZSBzZXNzaW9uIGFuZCB0aGUgdW5kZXJseWluZyByZXNvdXJjZXMuXHJcbiAgICovXHJcbiAgcmVsZWFzZSgpOiBQcm9taXNlPHZvaWQ+O1xyXG5cclxuICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gIC8vICNyZWdpb24gcHJvZmlsaW5nXHJcblxyXG4gIC8qKlxyXG4gICAqIFN0YXJ0IHByb2ZpbGluZy5cclxuICAgKi9cclxuICBzdGFydFByb2ZpbGluZygpOiB2b2lkO1xyXG5cclxuICAvKipcclxuICAgKiBFbmQgcHJvZmlsaW5nLlxyXG4gICAqL1xyXG4gIGVuZFByb2ZpbGluZygpOiB2b2lkO1xyXG5cclxuICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gIC8vICNyZWdpb24gbWV0YWRhdGFcclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGlucHV0IG5hbWVzIG9mIHRoZSBsb2FkZWQgbW9kZWwuXHJcbiAgICovXHJcbiAgcmVhZG9ubHkgaW5wdXROYW1lczogcmVhZG9ubHkgc3RyaW5nW107XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBvdXRwdXQgbmFtZXMgb2YgdGhlIGxvYWRlZCBtb2RlbC5cclxuICAgKi9cclxuICByZWFkb25seSBvdXRwdXROYW1lczogcmVhZG9ubHkgc3RyaW5nW107XHJcblxyXG4gIC8vIC8qKlxyXG4gIC8vICAqIEdldCBpbnB1dCBtZXRhZGF0YSBvZiB0aGUgbG9hZGVkIG1vZGVsLlxyXG4gIC8vICAqL1xyXG4gIC8vIHJlYWRvbmx5IGlucHV0TWV0YWRhdGE6IFJlYWRvbmx5QXJyYXk8UmVhZG9ubHk8SW5mZXJlbmNlU2Vzc2lvbi5WYWx1ZU1ldGFkYXRhPj47XHJcblxyXG4gIC8vIC8qKlxyXG4gIC8vICAqIEdldCBvdXRwdXQgbWV0YWRhdGEgb2YgdGhlIGxvYWRlZCBtb2RlbC5cclxuICAvLyAgKi9cclxuICAvLyByZWFkb25seSBvdXRwdXRNZXRhZGF0YTogUmVhZG9ubHlBcnJheTxSZWFkb25seTxJbmZlcmVuY2VTZXNzaW9uLlZhbHVlTWV0YWRhdGE+PjtcclxuXHJcbiAgLy8gI2VuZHJlZ2lvblxyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIEluZmVyZW5jZVNlc3Npb25GYWN0b3J5IHtcclxuICAvLyAjcmVnaW9uIGNyZWF0ZSgpXHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIG5ldyBpbmZlcmVuY2Ugc2Vzc2lvbiBhbmQgbG9hZCBtb2RlbCBhc3luY2hyb25vdXNseSBmcm9tIGFuIE9OTlggbW9kZWwgZmlsZS5cclxuICAgKlxyXG4gICAqIEBwYXJhbSB1cmkgLSBUaGUgVVJJIG9yIGZpbGUgcGF0aCBvZiB0aGUgbW9kZWwgdG8gbG9hZC5cclxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIHNwZWNpZnkgY29uZmlndXJhdGlvbiBmb3IgY3JlYXRpbmcgYSBuZXcgaW5mZXJlbmNlIHNlc3Npb24uXHJcbiAgICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYW4gSW5mZXJlbmNlU2Vzc2lvbiBvYmplY3QuXHJcbiAgICovXHJcbiAgY3JlYXRlKHVyaTogc3RyaW5nLCBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbj47XHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZSBhIG5ldyBpbmZlcmVuY2Ugc2Vzc2lvbiBhbmQgbG9hZCBtb2RlbCBhc3luY2hyb25vdXNseSBmcm9tIGFuIGFycmF5IGJ1ZmVyLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGJ1ZmZlciAtIEFuIEFycmF5QnVmZmVyIHJlcHJlc2VudGF0aW9uIG9mIGFuIE9OTlggbW9kZWwuXHJcbiAgICogQHBhcmFtIG9wdGlvbnMgLSBzcGVjaWZ5IGNvbmZpZ3VyYXRpb24gZm9yIGNyZWF0aW5nIGEgbmV3IGluZmVyZW5jZSBzZXNzaW9uLlxyXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIEluZmVyZW5jZVNlc3Npb24gb2JqZWN0LlxyXG4gICAqL1xyXG4gIGNyZWF0ZShidWZmZXI6IEFycmF5QnVmZmVyTGlrZSwgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOiBQcm9taXNlPEluZmVyZW5jZVNlc3Npb24+O1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYSBuZXcgaW5mZXJlbmNlIHNlc3Npb24gYW5kIGxvYWQgbW9kZWwgYXN5bmNocm9ub3VzbHkgZnJvbSBzZWdtZW50IG9mIGFuIGFycmF5IGJ1ZmVyLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGJ1ZmZlciAtIEFuIEFycmF5QnVmZmVyIHJlcHJlc2VudGF0aW9uIG9mIGFuIE9OTlggbW9kZWwuXHJcbiAgICogQHBhcmFtIGJ5dGVPZmZzZXQgLSBUaGUgYmVnaW5uaW5nIG9mIHRoZSBzcGVjaWZpZWQgcG9ydGlvbiBvZiB0aGUgYXJyYXkgYnVmZmVyLlxyXG4gICAqIEBwYXJhbSBieXRlTGVuZ3RoIC0gVGhlIGxlbmd0aCBpbiBieXRlcyBvZiB0aGUgYXJyYXkgYnVmZmVyLlxyXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gc3BlY2lmeSBjb25maWd1cmF0aW9uIGZvciBjcmVhdGluZyBhIG5ldyBpbmZlcmVuY2Ugc2Vzc2lvbi5cclxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhbiBJbmZlcmVuY2VTZXNzaW9uIG9iamVjdC5cclxuICAgKi9cclxuICBjcmVhdGUoYnVmZmVyOiBBcnJheUJ1ZmZlckxpa2UsIGJ5dGVPZmZzZXQ6IG51bWJlciwgYnl0ZUxlbmd0aD86IG51bWJlciwgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOlxyXG4gICAgICBQcm9taXNlPEluZmVyZW5jZVNlc3Npb24+O1xyXG5cclxuICAvKipcclxuICAgKiBDcmVhdGUgYSBuZXcgaW5mZXJlbmNlIHNlc3Npb24gYW5kIGxvYWQgbW9kZWwgYXN5bmNocm9ub3VzbHkgZnJvbSBhIFVpbnQ4QXJyYXkuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gYnVmZmVyIC0gQSBVaW50OEFycmF5IHJlcHJlc2VudGF0aW9uIG9mIGFuIE9OTlggbW9kZWwuXHJcbiAgICogQHBhcmFtIG9wdGlvbnMgLSBzcGVjaWZ5IGNvbmZpZ3VyYXRpb24gZm9yIGNyZWF0aW5nIGEgbmV3IGluZmVyZW5jZSBzZXNzaW9uLlxyXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGFuIEluZmVyZW5jZVNlc3Npb24gb2JqZWN0LlxyXG4gICAqL1xyXG4gIGNyZWF0ZShidWZmZXI6IFVpbnQ4QXJyYXksIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uPjtcclxuXHJcbiAgLy8gI2VuZHJlZ2lvblxyXG59XHJcblxyXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXHJcbmV4cG9ydCBjb25zdCBJbmZlcmVuY2VTZXNzaW9uOiBJbmZlcmVuY2VTZXNzaW9uRmFjdG9yeSA9IEluZmVyZW5jZVNlc3Npb25JbXBsO1xyXG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cclxuXHJcbmltcG9ydCB7T3B0aW9uc0Zvcm1hdCwgT3B0aW9uc05vcm1hbGl6YXRpb25QYXJhbWV0ZXJzLCBPcHRpb25zVGVuc29yTGF5b3V0fSBmcm9tICcuL3RlbnNvci1mYWN0b3J5LmpzJztcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGVuc29yVG9EYXRhVXJsT3B0aW9ucyBleHRlbmRzIE9wdGlvbnNUZW5zb3JMYXlvdXQsIE9wdGlvbnNGb3JtYXQsIE9wdGlvbnNOb3JtYWxpemF0aW9uUGFyYW1ldGVycyB7fVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBUZW5zb3JUb0ltYWdlRGF0YU9wdGlvbnMgZXh0ZW5kcyBPcHRpb25zVGVuc29yTGF5b3V0LCBPcHRpb25zRm9ybWF0LCBPcHRpb25zTm9ybWFsaXphdGlvblBhcmFtZXRlcnMge31cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgQ29udmVyc2lvblV0aWxzIHtcclxuICAvKipcclxuICAgKiBjcmVhdGVzIGEgRGF0YVVSTCBpbnN0YW5jZSBmcm9tIHRlbnNvclxyXG4gICAqXHJcbiAgICogQHBhcmFtIG9wdGlvbnMgLSBBbiBvcHRpb25hbCBvYmplY3QgcmVwcmVzZW50aW5nIG9wdGlvbnMgZm9yIGNyZWF0aW5nIGEgRGF0YVVSTCBpbnN0YW5jZSBmcm9tIHRoZSB0ZW5zb3IuXHJcbiAgICpcclxuICAgKiBUaGUgZm9sbG93aW5nIGRlZmF1bHQgc2V0dGluZ3Mgd2lsbCBiZSBhcHBsaWVkOlxyXG4gICAqIC0gYGZvcm1hdGA6IGAnUkdCJ2BcclxuICAgKiAtIGB0ZW5zb3JMYXlvdXRgOiBgJ05DSFcnYFxyXG4gICAqIEByZXR1cm5zIGEgRGF0YVVSTCBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBpbWFnZSBjb252ZXJ0ZWQgZnJvbSB0ZW5zb3IgZGF0YVxyXG4gICAqL1xyXG4gIHRvRGF0YVVSTChvcHRpb25zPzogVGVuc29yVG9EYXRhVXJsT3B0aW9ucyk6IHN0cmluZztcclxuXHJcbiAgLyoqXHJcbiAgICogY3JlYXRlcyBhbiBJbWFnZURhdGEgaW5zdGFuY2UgZnJvbSB0ZW5zb3JcclxuICAgKlxyXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gQW4gb3B0aW9uYWwgb2JqZWN0IHJlcHJlc2VudGluZyBvcHRpb25zIGZvciBjcmVhdGluZyBhbiBJbWFnZURhdGEgaW5zdGFuY2UgZnJvbSB0aGUgdGVuc29yLlxyXG4gICAqXHJcbiAgICogVGhlIGZvbGxvd2luZyBkZWZhdWx0IHNldHRpbmdzIHdpbGwgYmUgYXBwbGllZDpcclxuICAgKiAtIGBmb3JtYXRgOiBgJ1JHQidgXHJcbiAgICogLSBgdGVuc29yTGF5b3V0YDogYCdOQ0hXJ2BcclxuICAgKiBAcmV0dXJucyBhbiBJbWFnZURhdGEgaW5zdGFuY2UgcmVwcmVzZW50aW5nIHRoZSBpbWFnZSBjb252ZXJ0ZWQgZnJvbSB0ZW5zb3IgZGF0YVxyXG4gICAqL1xyXG4gIHRvSW1hZ2VEYXRhKG9wdGlvbnM/OiBUZW5zb3JUb0ltYWdlRGF0YU9wdGlvbnMpOiBJbWFnZURhdGE7XHJcbn1cclxuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXHJcblxyXG5pbXBvcnQge1RlbnNvciwgVHlwZWRUZW5zb3J9IGZyb20gJy4vdGVuc29yLmpzJztcclxuXHJcbmV4cG9ydCB0eXBlIEltYWdlRm9ybWF0ID0gJ1JHQid8J1JHQkEnfCdCR1InfCdSQkcnO1xyXG5leHBvcnQgdHlwZSBJbWFnZVRlbnNvckxheW91dCA9ICdOSFdDJ3wnTkNIVyc7XHJcblxyXG4vLyB0aGUgZm9sbG93aW5nIHJlZ2lvbiBjb250YWlucyB0eXBlIGRlZmluaXRpb25zIGZvciBjb25zdHJ1Y3RpbmcgdGVuc29yIGZyb20gYSBzcGVjaWZpYyBsb2NhdGlvbi5cclxuXHJcbi8vICNyZWdpb24gdHlwZXMgZm9yIGNvbnN0cnVjdGluZyBhIHRlbnNvciBmcm9tIGEgc3BlY2lmaWMgbG9jYXRpb25cclxuXHJcbi8qKlxyXG4gKiByZXByZXNlbnQgY29tbW9uIHByb3BlcnRpZXMgb2YgdGhlIHBhcmFtZXRlciBmb3IgY29uc3RydWN0aW5nIGEgdGVuc29yIGZyb20gYSBzcGVjaWZpYyBsb2NhdGlvbi5cclxuICovXHJcbmludGVyZmFjZSBDb21tb25Db25zdHJ1Y3RvclBhcmFtZXRlcnM8VD4gZXh0ZW5kcyBQaWNrPFRlbnNvciwgJ2RpbXMnPiB7XHJcbiAgLyoqXHJcbiAgICogU3BlY2lmeSB0aGUgZGF0YSB0eXBlIG9mIHRoZSB0ZW5zb3IuXHJcbiAgICovXHJcbiAgcmVhZG9ubHkgdHlwZTogVDtcclxufVxyXG5cclxuLyoqXHJcbiAqIHJlcHJlc2VudCB0aGUgcGFyYW1ldGVyIGZvciBjb25zdHJ1Y3RpbmcgYSB0ZW5zb3IgZnJvbSBhIEdQVSByZXNvdXJjZS5cclxuICovXHJcbmludGVyZmFjZSBHcHVSZXNvdXJjZUNvbnN0cnVjdG9yUGFyYW1ldGVyczxUIGV4dGVuZHMgVGVuc29yLlR5cGU+IHtcclxuICAvKipcclxuICAgKiBhbiBvcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvbiB0byBkb3dubG9hZCBkYXRhIGZyb20gR1BVIHRvIENQVS5cclxuICAgKlxyXG4gICAqIElmIG5vdCBwcm92aWRlZCwgdGhlIHRlbnNvciB0cmVhdCB0aGUgR1BVIGRhdGEgYXMgZXh0ZXJuYWwgcmVzb3VyY2UuXHJcbiAgICovXHJcbiAgZG93bmxvYWQ/KCk6IFByb21pc2U8VGVuc29yLkRhdGFUeXBlTWFwW1RdPjtcclxuXHJcbiAgLyoqXHJcbiAgICogYW4gb3B0aW9uYWwgY2FsbGJhY2sgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGNhbGxlZCB3aGVuIHRoZSB0ZW5zb3IgaXMgZGlzcG9zZWQuXHJcbiAgICpcclxuICAgKiBJZiBub3QgcHJvdmlkZWQsIHRoZSB0ZW5zb3IgdHJlYXQgdGhlIEdQVSBkYXRhIGFzIGV4dGVybmFsIHJlc291cmNlLlxyXG4gICAqL1xyXG4gIGRpc3Bvc2U/KCk6IHZvaWQ7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiByZXByZXNlbnQgdGhlIHBhcmFtZXRlciBmb3IgY29uc3RydWN0aW5nIGEgdGVuc29yIGZyb20gYSBwaW5uZWQgQ1BVIGJ1ZmZlclxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBDcHVQaW5uZWRDb25zdHJ1Y3RvclBhcmFtZXRlcnM8VCBleHRlbmRzIFRlbnNvci5DcHVQaW5uZWREYXRhVHlwZXMgPSBUZW5zb3IuQ3B1UGlubmVkRGF0YVR5cGVzPiBleHRlbmRzXHJcbiAgICBDb21tb25Db25zdHJ1Y3RvclBhcmFtZXRlcnM8VD4ge1xyXG4gIC8qKlxyXG4gICAqIFNwZWNpZnkgdGhlIGxvY2F0aW9uIG9mIHRoZSBkYXRhIHRvIGJlICdjcHUtcGlubmVkJy5cclxuICAgKi9cclxuICByZWFkb25seSBsb2NhdGlvbjogJ2NwdS1waW5uZWQnO1xyXG4gIC8qKlxyXG4gICAqIFNwZWNpZnkgdGhlIENQVSBwaW5uZWQgYnVmZmVyIHRoYXQgaG9sZHMgdGhlIHRlbnNvciBkYXRhLlxyXG4gICAqL1xyXG4gIHJlYWRvbmx5IGRhdGE6IFRlbnNvci5EYXRhVHlwZU1hcFtUXTtcclxufVxyXG5cclxuLyoqXHJcbiAqIHJlcHJlc2VudCB0aGUgcGFyYW1ldGVyIGZvciBjb25zdHJ1Y3RpbmcgYSB0ZW5zb3IgZnJvbSBhIFdlYkdMIHRleHR1cmVcclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGV4dHVyZUNvbnN0cnVjdG9yUGFyYW1ldGVyczxUIGV4dGVuZHMgVGVuc29yLlRleHR1cmVEYXRhVHlwZXMgPSBUZW5zb3IuVGV4dHVyZURhdGFUeXBlcz4gZXh0ZW5kc1xyXG4gICAgQ29tbW9uQ29uc3RydWN0b3JQYXJhbWV0ZXJzPFQ+LCBHcHVSZXNvdXJjZUNvbnN0cnVjdG9yUGFyYW1ldGVyczxUPiB7XHJcbiAgLyoqXHJcbiAgICogU3BlY2lmeSB0aGUgbG9jYXRpb24gb2YgdGhlIGRhdGEgdG8gYmUgJ3RleHR1cmUnLlxyXG4gICAqL1xyXG4gIHJlYWRvbmx5IGxvY2F0aW9uOiAndGV4dHVyZSc7XHJcbiAgLyoqXHJcbiAgICogU3BlY2lmeSB0aGUgV2ViR0wgdGV4dHVyZSB0aGF0IGhvbGRzIHRoZSB0ZW5zb3IgZGF0YS5cclxuICAgKi9cclxuICByZWFkb25seSB0ZXh0dXJlOiBUZW5zb3IuVGV4dHVyZVR5cGU7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiByZXByZXNlbnQgdGhlIHBhcmFtZXRlciBmb3IgY29uc3RydWN0aW5nIGEgdGVuc29yIGZyb20gYSBXZWJHUFUgYnVmZmVyXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIEdwdUJ1ZmZlckNvbnN0cnVjdG9yUGFyYW1ldGVyczxUIGV4dGVuZHMgVGVuc29yLkdwdUJ1ZmZlckRhdGFUeXBlcyA9IFRlbnNvci5HcHVCdWZmZXJEYXRhVHlwZXM+IGV4dGVuZHNcclxuICAgIENvbW1vbkNvbnN0cnVjdG9yUGFyYW1ldGVyczxUPiwgR3B1UmVzb3VyY2VDb25zdHJ1Y3RvclBhcmFtZXRlcnM8VD4ge1xyXG4gIC8qKlxyXG4gICAqIFNwZWNpZnkgdGhlIGxvY2F0aW9uIG9mIHRoZSBkYXRhIHRvIGJlICdncHUtYnVmZmVyJy5cclxuICAgKi9cclxuICByZWFkb25seSBsb2NhdGlvbjogJ2dwdS1idWZmZXInO1xyXG4gIC8qKlxyXG4gICAqIFNwZWNpZnkgdGhlIFdlYkdQVSBidWZmZXIgdGhhdCBob2xkcyB0aGUgdGVuc29yIGRhdGEuXHJcbiAgICovXHJcbiAgcmVhZG9ubHkgZ3B1QnVmZmVyOiBUZW5zb3IuR3B1QnVmZmVyVHlwZTtcclxufVxyXG5cclxuLy8gI2VuZHJlZ2lvblxyXG5cclxuLy8gdGhlIGZvbGxvd2luZyByZWdpb24gY29udGFpbnMgdHlwZSBkZWZpbml0aW9ucyBvZiBlYWNoIGluZGl2aWR1YWwgb3B0aW9ucy5cclxuLy8gdGhlIHRlbnNvciBmYWN0b3J5IGZ1bmN0aW9ucyB1c2UgYSBjb21wb3NpdGlvbiBvZiB0aG9zZSBvcHRpb25zIGFzIHRoZSBwYXJhbWV0ZXIgdHlwZS5cclxuXHJcbi8vICNyZWdpb24gT3B0aW9ucyBmaWVsZHNcclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgT3B0aW9uc0Zvcm1hdCB7XHJcbiAgLyoqXHJcbiAgICogRGVzY3JpYmVzIHRoZSBpbWFnZSBmb3JtYXQgcmVwcmVzZW50ZWQgaW4gUkdCQSBjb2xvciBzcGFjZS5cclxuICAgKi9cclxuICBmb3JtYXQ/OiBJbWFnZUZvcm1hdDtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBPcHRpb25zVGVuc29yRm9ybWF0IHtcclxuICAvKipcclxuICAgKiBEZXNjcmliZXMgdGhlIGltYWdlIGZvcm1hdCBvZiB0aGUgdGVuc29yLlxyXG4gICAqXHJcbiAgICogTk9URTogdGhpcyBpcyBkaWZmZXJlbnQgZnJvbSBvcHRpb24gJ2Zvcm1hdCcuIFdoaWxlIG9wdGlvbiAnZm9ybWF0JyByZXByZXNlbnRzIHRoZSBvcmlnaW5hbCBpbWFnZSwgJ3RlbnNvckZvcm1hdCdcclxuICAgKiByZXByZXNlbnRzIHRoZSB0YXJnZXQgZm9ybWF0IG9mIHRoZSB0ZW5zb3IuIEEgdHJhbnNwb3NlIHdpbGwgYmUgcGVyZm9ybWVkIGlmIHRoZXkgYXJlIGRpZmZlcmVudC5cclxuICAgKi9cclxuICB0ZW5zb3JGb3JtYXQ/OiBJbWFnZUZvcm1hdDtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBPcHRpb25zVGVuc29yRGF0YVR5cGUge1xyXG4gIC8qKlxyXG4gICAqIERlc2NyaWJlcyB0aGUgZGF0YSB0eXBlIG9mIHRoZSB0ZW5zb3IuXHJcbiAgICovXHJcbiAgZGF0YVR5cGU/OiAnZmxvYXQzMid8J3VpbnQ4JztcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBPcHRpb25zVGVuc29yTGF5b3V0IHtcclxuICAvKipcclxuICAgKiBEZXNjcmliZXMgdGhlIHRlbnNvciBsYXlvdXQgd2hlbiByZXByZXNlbnRpbmcgZGF0YSBvZiBvbmUgb3IgbW9yZSBpbWFnZShzKS5cclxuICAgKi9cclxuICB0ZW5zb3JMYXlvdXQ/OiBJbWFnZVRlbnNvckxheW91dDtcclxufVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBPcHRpb25zRGltZW5zaW9ucyB7XHJcbiAgLyoqXHJcbiAgICogRGVzY3JpYmVzIHRoZSBpbWFnZSBoZWlnaHQgaW4gcGl4ZWxcclxuICAgKi9cclxuICBoZWlnaHQ/OiBudW1iZXI7XHJcbiAgLyoqXHJcbiAgICogRGVzY3JpYmVzIHRoZSBpbWFnZSB3aWR0aCBpbiBwaXhlbFxyXG4gICAqL1xyXG4gIHdpZHRoPzogbnVtYmVyO1xyXG59XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIE9wdGlvblJlc2l6ZWREaW1lbnNpb25zIHtcclxuICAvKipcclxuICAgKiBEZXNjcmliZXMgdGhlIHJlc2l6ZWQgaGVpZ2h0LiBJZiBvbWl0dGVkLCBvcmlnaW5hbCBoZWlnaHQgd2lsbCBiZSB1c2VkLlxyXG4gICAqL1xyXG4gIHJlc2l6ZWRIZWlnaHQ/OiBudW1iZXI7XHJcbiAgLyoqXHJcbiAgICogRGVzY3JpYmVzIHJlc2l6ZWQgd2lkdGggLSBjYW4gYmUgYWNjZXNzZWQgdmlhIHRlbnNvciBkaW1lbnNpb25zIGFzIHdlbGxcclxuICAgKi9cclxuICByZXNpemVkV2lkdGg/OiBudW1iZXI7XHJcbn1cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgT3B0aW9uc05vcm1hbGl6YXRpb25QYXJhbWV0ZXJzIHtcclxuICAvKipcclxuICAgKiBEZXNjcmliZXMgbm9ybWFsaXphdGlvbiBwYXJhbWV0ZXJzIHdoZW4gcHJlcHJvY2Vzc2luZyB0aGUgaW1hZ2UgYXMgbW9kZWwgaW5wdXQuXHJcbiAgICpcclxuICAgKiBEYXRhIGVsZW1lbnQgYXJlIHJhbmdlZCBmcm9tIDAgdG8gMjU1LlxyXG4gICAqL1xyXG4gIG5vcm0/OiB7XHJcbiAgICAvKipcclxuICAgICAqIFRoZSAnYmlhcycgdmFsdWUgZm9yIGltYWdlIG5vcm1hbGl6YXRpb24uXHJcbiAgICAgKiAtIElmIG9taXR0ZWQsIHVzZSBkZWZhdWx0IHZhbHVlIDAuXHJcbiAgICAgKiAtIElmIGl0J3MgYSBzaW5nbGUgbnVtYmVyLCBhcHBseSB0byBlYWNoIGNoYW5uZWxcclxuICAgICAqIC0gSWYgaXQncyBhbiBhcnJheSBvZiAzIG9yIDQgbnVtYmVycywgYXBwbHkgZWxlbWVudC13aXNlLiBOdW1iZXIgb2YgZWxlbWVudHMgbmVlZCB0byBtYXRjaCB0aGUgbnVtYmVyIG9mIGNoYW5uZWxzXHJcbiAgICAgKiBmb3IgdGhlIGNvcnJlc3BvbmRpbmcgaW1hZ2UgZm9ybWF0XHJcbiAgICAgKi9cclxuICAgIGJpYXM/OiBudW1iZXJ8W251bWJlciwgbnVtYmVyLCBudW1iZXJdfFtudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXJdO1xyXG4gICAgLyoqXHJcbiAgICAgKiBUaGUgJ21lYW4nIHZhbHVlIGZvciBpbWFnZSBub3JtYWxpemF0aW9uLlxyXG4gICAgICogLSBJZiBvbWl0dGVkLCB1c2UgZGVmYXVsdCB2YWx1ZSAyNTUuXHJcbiAgICAgKiAtIElmIGl0J3MgYSBzaW5nbGUgbnVtYmVyLCBhcHBseSB0byBlYWNoIGNoYW5uZWxcclxuICAgICAqIC0gSWYgaXQncyBhbiBhcnJheSBvZiAzIG9yIDQgbnVtYmVycywgYXBwbHkgZWxlbWVudC13aXNlLiBOdW1iZXIgb2YgZWxlbWVudHMgbmVlZCB0byBtYXRjaCB0aGUgbnVtYmVyIG9mIGNoYW5uZWxzXHJcbiAgICAgKiBmb3IgdGhlIGNvcnJlc3BvbmRpbmcgaW1hZ2UgZm9ybWF0XHJcbiAgICAgKi9cclxuICAgIG1lYW4/OiBudW1iZXIgfCBbbnVtYmVyLCBudW1iZXIsIG51bWJlcl0gfCBbbnVtYmVyLCBudW1iZXIsIG51bWJlciwgbnVtYmVyXTtcclxuICB9O1xyXG59XHJcblxyXG4vLyAjZW5kcmVnaW9uXHJcblxyXG4vLyAjcmVnaW9uIE9wdGlvbnMgY29tcG9zaXRpb25cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGVuc29yRnJvbUltYWdlRGF0YU9wdGlvbnMgZXh0ZW5kcyBPcHRpb25SZXNpemVkRGltZW5zaW9ucywgT3B0aW9uc1RlbnNvckZvcm1hdCwgT3B0aW9uc1RlbnNvckxheW91dCxcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIE9wdGlvbnNUZW5zb3JEYXRhVHlwZSwgT3B0aW9uc05vcm1hbGl6YXRpb25QYXJhbWV0ZXJzIHt9XHJcblxyXG5leHBvcnQgaW50ZXJmYWNlIFRlbnNvckZyb21JbWFnZUVsZW1lbnRPcHRpb25zIGV4dGVuZHMgT3B0aW9uUmVzaXplZERpbWVuc2lvbnMsIE9wdGlvbnNUZW5zb3JGb3JtYXQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPcHRpb25zVGVuc29yTGF5b3V0LCBPcHRpb25zVGVuc29yRGF0YVR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPcHRpb25zTm9ybWFsaXphdGlvblBhcmFtZXRlcnMge31cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGVuc29yRnJvbVVybE9wdGlvbnMgZXh0ZW5kcyBPcHRpb25zRGltZW5zaW9ucywgT3B0aW9uUmVzaXplZERpbWVuc2lvbnMsIE9wdGlvbnNUZW5zb3JGb3JtYXQsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPcHRpb25zVGVuc29yTGF5b3V0LCBPcHRpb25zVGVuc29yRGF0YVR5cGUsXHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPcHRpb25zTm9ybWFsaXphdGlvblBhcmFtZXRlcnMge31cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGVuc29yRnJvbUltYWdlQml0bWFwT3B0aW9ucyBleHRlbmRzIE9wdGlvblJlc2l6ZWREaW1lbnNpb25zLCBPcHRpb25zVGVuc29yRm9ybWF0LCBPcHRpb25zVGVuc29yTGF5b3V0LFxyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBPcHRpb25zVGVuc29yRGF0YVR5cGUsIE9wdGlvbnNOb3JtYWxpemF0aW9uUGFyYW1ldGVycyB7fVxyXG5cclxuZXhwb3J0IGludGVyZmFjZSBUZW5zb3JGcm9tVGV4dHVyZU9wdGlvbnM8VCBleHRlbmRzIFRlbnNvci5UZXh0dXJlRGF0YVR5cGVzPiBleHRlbmRzXHJcbiAgICBSZXF1aXJlZDxPcHRpb25zRGltZW5zaW9ucz4sIE9wdGlvbnNGb3JtYXQsIEdwdVJlc291cmNlQ29uc3RydWN0b3JQYXJhbWV0ZXJzPFQ+LyogVE9ETzogYWRkIG1vcmUgKi8ge31cclxuXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGVuc29yRnJvbUdwdUJ1ZmZlck9wdGlvbnM8VCBleHRlbmRzIFRlbnNvci5HcHVCdWZmZXJEYXRhVHlwZXM+IGV4dGVuZHNcclxuICAgIFBpY2s8VGVuc29yLCAnZGltcyc+LCBHcHVSZXNvdXJjZUNvbnN0cnVjdG9yUGFyYW1ldGVyczxUPiB7XHJcbiAgLyoqXHJcbiAgICogRGVzY3JpYmVzIHRoZSBkYXRhIHR5cGUgb2YgdGhlIHRlbnNvci5cclxuICAgKi9cclxuICBkYXRhVHlwZT86IFQ7XHJcbn1cclxuXHJcbi8vICNlbmRyZWdpb25cclxuXHJcbi8qKlxyXG4gKiB0eXBlIFRlbnNvckZhY3RvcnkgZGVmaW5lcyB0aGUgZmFjdG9yeSBmdW5jdGlvbnMgb2YgJ1RlbnNvcicgdG8gY3JlYXRlIHRlbnNvciBpbnN0YW5jZXMgZnJvbSBleGlzdGluZyBkYXRhIG9yXHJcbiAqIHJlc291cmNlcy5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgVGVuc29yRmFjdG9yeSB7XHJcbiAgLyoqXHJcbiAgICogY3JlYXRlIGEgdGVuc29yIGZyb20gYW4gSW1hZ2VEYXRhIG9iamVjdFxyXG4gICAqXHJcbiAgICogQHBhcmFtIGltYWdlRGF0YSAtIHRoZSBJbWFnZURhdGEgb2JqZWN0IHRvIGNyZWF0ZSB0ZW5zb3IgZnJvbVxyXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gQW4gb3B0aW9uYWwgb2JqZWN0IHJlcHJlc2VudGluZyBvcHRpb25zIGZvciBjcmVhdGluZyB0ZW5zb3IgZnJvbSBJbWFnZURhdGEuXHJcbiAgICpcclxuICAgKiBUaGUgZm9sbG93aW5nIGRlZmF1bHQgc2V0dGluZ3Mgd2lsbCBiZSBhcHBsaWVkOlxyXG4gICAqIC0gYHRlbnNvckZvcm1hdGA6IGAnUkdCJ2BcclxuICAgKiAtIGB0ZW5zb3JMYXlvdXRgOiBgJ05DSFcnYFxyXG4gICAqIC0gYGRhdGFUeXBlYDogYCdmbG9hdDMyJ2BcclxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIHRlbnNvciBvYmplY3RcclxuICAgKi9cclxuICBmcm9tSW1hZ2UoaW1hZ2VEYXRhOiBJbWFnZURhdGEsIG9wdGlvbnM/OiBUZW5zb3JGcm9tSW1hZ2VEYXRhT3B0aW9ucyk6XHJcbiAgICAgIFByb21pc2U8VHlwZWRUZW5zb3I8J2Zsb2F0MzInPnxUeXBlZFRlbnNvcjwndWludDgnPj47XHJcblxyXG4gIC8qKlxyXG4gICAqIGNyZWF0ZSBhIHRlbnNvciBmcm9tIGEgSFRNTEltYWdlRWxlbWVudCBvYmplY3RcclxuICAgKlxyXG4gICAqIEBwYXJhbSBpbWFnZUVsZW1lbnQgLSB0aGUgSFRNTEltYWdlRWxlbWVudCBvYmplY3QgdG8gY3JlYXRlIHRlbnNvciBmcm9tXHJcbiAgICogQHBhcmFtIG9wdGlvbnMgLSBBbiBvcHRpb25hbCBvYmplY3QgcmVwcmVzZW50aW5nIG9wdGlvbnMgZm9yIGNyZWF0aW5nIHRlbnNvciBmcm9tIEhUTUxJbWFnZUVsZW1lbnQuXHJcbiAgICpcclxuICAgKiBUaGUgZm9sbG93aW5nIGRlZmF1bHQgc2V0dGluZ3Mgd2lsbCBiZSBhcHBsaWVkOlxyXG4gICAqIC0gYHRlbnNvckZvcm1hdGA6IGAnUkdCJ2BcclxuICAgKiAtIGB0ZW5zb3JMYXlvdXRgOiBgJ05DSFcnYFxyXG4gICAqIC0gYGRhdGFUeXBlYDogYCdmbG9hdDMyJ2BcclxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIHRlbnNvciBvYmplY3RcclxuICAgKi9cclxuICBmcm9tSW1hZ2UoaW1hZ2VFbGVtZW50OiBIVE1MSW1hZ2VFbGVtZW50LCBvcHRpb25zPzogVGVuc29yRnJvbUltYWdlRWxlbWVudE9wdGlvbnMpOlxyXG4gICAgICBQcm9taXNlPFR5cGVkVGVuc29yPCdmbG9hdDMyJz58VHlwZWRUZW5zb3I8J3VpbnQ4Jz4+O1xyXG5cclxuICAvKipcclxuICAgKiBjcmVhdGUgYSB0ZW5zb3IgZnJvbSBVUkxcclxuICAgKlxyXG4gICAqIEBwYXJhbSB1cmxTb3VyY2UgLSBhIHN0cmluZyBhcyBhIFVSTCB0byB0aGUgaW1hZ2Ugb3IgYSBkYXRhIFVSTCBjb250YWluaW5nIHRoZSBpbWFnZSBkYXRhLlxyXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gQW4gb3B0aW9uYWwgb2JqZWN0IHJlcHJlc2VudGluZyBvcHRpb25zIGZvciBjcmVhdGluZyB0ZW5zb3IgZnJvbSBVUkwuXHJcbiAgICpcclxuICAgKiBUaGUgZm9sbG93aW5nIGRlZmF1bHQgc2V0dGluZ3Mgd2lsbCBiZSBhcHBsaWVkOlxyXG4gICAqIC0gYHRlbnNvckZvcm1hdGA6IGAnUkdCJ2BcclxuICAgKiAtIGB0ZW5zb3JMYXlvdXRgOiBgJ05DSFcnYFxyXG4gICAqIC0gYGRhdGFUeXBlYDogYCdmbG9hdDMyJ2BcclxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIHRlbnNvciBvYmplY3RcclxuICAgKi9cclxuICBmcm9tSW1hZ2UodXJsU291cmNlOiBzdHJpbmcsIG9wdGlvbnM/OiBUZW5zb3JGcm9tVXJsT3B0aW9ucyk6IFByb21pc2U8VHlwZWRUZW5zb3I8J2Zsb2F0MzInPnxUeXBlZFRlbnNvcjwndWludDgnPj47XHJcblxyXG4gIC8qKlxyXG4gICAqIGNyZWF0ZSBhIHRlbnNvciBmcm9tIGFuIEltYWdlQml0bWFwIG9iamVjdFxyXG4gICAqXHJcbiAgICogQHBhcmFtIGJpdG1hcCAtIHRoZSBJbWFnZUJpdG1hcCBvYmplY3QgdG8gY3JlYXRlIHRlbnNvciBmcm9tXHJcbiAgICogQHBhcmFtIG9wdGlvbnMgLSBBbiBvcHRpb25hbCBvYmplY3QgcmVwcmVzZW50aW5nIG9wdGlvbnMgZm9yIGNyZWF0aW5nIHRlbnNvciBmcm9tIFVSTC5cclxuICAgKlxyXG4gICAqIFRoZSBmb2xsb3dpbmcgZGVmYXVsdCBzZXR0aW5ncyB3aWxsIGJlIGFwcGxpZWQ6XHJcbiAgICogLSBgdGVuc29yRm9ybWF0YDogYCdSR0InYFxyXG4gICAqIC0gYHRlbnNvckxheW91dGA6IGAnTkNIVydgXHJcbiAgICogLSBgZGF0YVR5cGVgOiBgJ2Zsb2F0MzInYFxyXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgdGVuc29yIG9iamVjdFxyXG4gICAqL1xyXG4gIGZyb21JbWFnZShiaXRtYXA6IEltYWdlQml0bWFwLCBvcHRpb25zOiBUZW5zb3JGcm9tSW1hZ2VCaXRtYXBPcHRpb25zKTpcclxuICAgICAgUHJvbWlzZTxUeXBlZFRlbnNvcjwnZmxvYXQzMic+fFR5cGVkVGVuc29yPCd1aW50OCc+PjtcclxuXHJcbiAgLyoqXHJcbiAgICogY3JlYXRlIGEgdGVuc29yIGZyb20gYSBXZWJHTCB0ZXh0dXJlXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdGV4dHVyZSAtIHRoZSBXZWJHTFRleHR1cmUgb2JqZWN0IHRvIGNyZWF0ZSB0ZW5zb3IgZnJvbVxyXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gQW4gb3B0aW9uYWwgb2JqZWN0IHJlcHJlc2VudGluZyBvcHRpb25zIGZvciBjcmVhdGluZyB0ZW5zb3IgZnJvbSBXZWJHTCB0ZXh0dXJlLlxyXG4gICAqXHJcbiAgICogVGhlIG9wdGlvbnMgaW5jbHVkZSBmb2xsb3dpbmcgcHJvcGVydGllczpcclxuICAgKiAtIGB3aWR0aGA6IHRoZSB3aWR0aCBvZiB0aGUgdGV4dHVyZS4gUmVxdWlyZWQuXHJcbiAgICogLSBgaGVpZ2h0YDogdGhlIGhlaWdodCBvZiB0aGUgdGV4dHVyZS4gUmVxdWlyZWQuXHJcbiAgICogLSBgZm9ybWF0YDogdGhlIGZvcm1hdCBvZiB0aGUgdGV4dHVyZS4gSWYgb21pdHRlZCwgYXNzdW1lICdSR0JBJy5cclxuICAgKiAtIGBkb3dubG9hZGA6IGFuIG9wdGlvbmFsIGZ1bmN0aW9uIHRvIGRvd25sb2FkIHRoZSB0ZW5zb3IgZGF0YSBmcm9tIEdQVSB0byBDUFUuIElmIG9taXR0ZWQsIHRoZSBHUFUgZGF0YVxyXG4gICAqIHdpbGwgbm90IGJlIGFibGUgdG8gZG93bmxvYWQuIFVzdWFsbHksIHRoaXMgaXMgcHJvdmlkZWQgYnkgYSBHUFUgYmFja2VuZCBmb3IgdGhlIGluZmVyZW5jZSBvdXRwdXRzLiBVc2VycyBkb24ndFxyXG4gICAqIG5lZWQgdG8gcHJvdmlkZSB0aGlzIGZ1bmN0aW9uLlxyXG4gICAqIC0gYGRpc3Bvc2VgOiBhbiBvcHRpb25hbCBmdW5jdGlvbiB0byBkaXNwb3NlIHRoZSB0ZW5zb3IgZGF0YSBvbiBHUFUuIElmIG9taXR0ZWQsIHRoZSBHUFUgZGF0YSB3aWxsIG5vdCBiZSBkaXNwb3NlZC5cclxuICAgKiBVc3VhbGx5LCB0aGlzIGlzIHByb3ZpZGVkIGJ5IGEgR1BVIGJhY2tlbmQgZm9yIHRoZSBpbmZlcmVuY2Ugb3V0cHV0cy4gVXNlcnMgZG9uJ3QgbmVlZCB0byBwcm92aWRlIHRoaXMgZnVuY3Rpb24uXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyBhIHRlbnNvciBvYmplY3RcclxuICAgKi9cclxuICBmcm9tVGV4dHVyZTxUIGV4dGVuZHMgVGVuc29yLlRleHR1cmVEYXRhVHlwZXMgPSAnZmxvYXQzMic+KFxyXG4gICAgICB0ZXh0dXJlOiBUZW5zb3IuVGV4dHVyZVR5cGUsIG9wdGlvbnM6IFRlbnNvckZyb21UZXh0dXJlT3B0aW9uczxUPik6IFR5cGVkVGVuc29yPCdmbG9hdDMyJz47XHJcblxyXG4gIC8qKlxyXG4gICAqIGNyZWF0ZSBhIHRlbnNvciBmcm9tIGEgV2ViR1BVIGJ1ZmZlclxyXG4gICAqXHJcbiAgICogQHBhcmFtIGJ1ZmZlciAtIHRoZSBHUFVCdWZmZXIgb2JqZWN0IHRvIGNyZWF0ZSB0ZW5zb3IgZnJvbVxyXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gQW4gb3B0aW9uYWwgb2JqZWN0IHJlcHJlc2VudGluZyBvcHRpb25zIGZvciBjcmVhdGluZyB0ZW5zb3IgZnJvbSBXZWJHUFUgYnVmZmVyLlxyXG4gICAqXHJcbiAgICogVGhlIG9wdGlvbnMgaW5jbHVkZSBmb2xsb3dpbmcgcHJvcGVydGllczpcclxuICAgKiAtIGBkYXRhVHlwZWA6IHRoZSBkYXRhIHR5cGUgb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYXNzdW1lICdmbG9hdDMyJy5cclxuICAgKiAtIGBkaW1zYDogdGhlIGRpbWVuc2lvbiBvZiB0aGUgdGVuc29yLiBSZXF1aXJlZC5cclxuICAgKiAtIGBkb3dubG9hZGA6IGFuIG9wdGlvbmFsIGZ1bmN0aW9uIHRvIGRvd25sb2FkIHRoZSB0ZW5zb3IgZGF0YSBmcm9tIEdQVSB0byBDUFUuIElmIG9taXR0ZWQsIHRoZSBHUFUgZGF0YVxyXG4gICAqIHdpbGwgbm90IGJlIGFibGUgdG8gZG93bmxvYWQuIFVzdWFsbHksIHRoaXMgaXMgcHJvdmlkZWQgYnkgYSBHUFUgYmFja2VuZCBmb3IgdGhlIGluZmVyZW5jZSBvdXRwdXRzLiBVc2VycyBkb24ndFxyXG4gICAqIG5lZWQgdG8gcHJvdmlkZSB0aGlzIGZ1bmN0aW9uLlxyXG4gICAqIC0gYGRpc3Bvc2VgOiBhbiBvcHRpb25hbCBmdW5jdGlvbiB0byBkaXNwb3NlIHRoZSB0ZW5zb3IgZGF0YSBvbiBHUFUuIElmIG9taXR0ZWQsIHRoZSBHUFUgZGF0YSB3aWxsIG5vdCBiZSBkaXNwb3NlZC5cclxuICAgKiBVc3VhbGx5LCB0aGlzIGlzIHByb3ZpZGVkIGJ5IGEgR1BVIGJhY2tlbmQgZm9yIHRoZSBpbmZlcmVuY2Ugb3V0cHV0cy4gVXNlcnMgZG9uJ3QgbmVlZCB0byBwcm92aWRlIHRoaXMgZnVuY3Rpb24uXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyBhIHRlbnNvciBvYmplY3RcclxuICAgKi9cclxuICBmcm9tR3B1QnVmZmVyPFQgZXh0ZW5kcyBUZW5zb3IuR3B1QnVmZmVyRGF0YVR5cGVzPihcclxuICAgICAgYnVmZmVyOiBUZW5zb3IuR3B1QnVmZmVyVHlwZSwgb3B0aW9uczogVGVuc29yRnJvbUdwdUJ1ZmZlck9wdGlvbnM8VD4pOiBUeXBlZFRlbnNvcjxUPjtcclxuXHJcbiAgLyoqXHJcbiAgICogY3JlYXRlIGEgdGVuc29yIGZyb20gYSBwcmUtYWxsb2NhdGVkIGJ1ZmZlci4gVGhlIGJ1ZmZlciB3aWxsIGJlIHVzZWQgYXMgYSBwaW5uZWQgYnVmZmVyLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIHR5cGUgLSB0aGUgdGVuc29yIGVsZW1lbnQgdHlwZS5cclxuICAgKiBAcGFyYW0gYnVmZmVyIC0gYSBUeXBlZEFycmF5IGNvcnJlc3BvbmRpbmcgdG8gdGhlIHR5cGUuXHJcbiAgICogQHBhcmFtIGRpbXMgLSBzcGVjaWZ5IHRoZSBkaW1lbnNpb24gb2YgdGhlIHRlbnNvci4gSWYgb21pdHRlZCwgYSAxLUQgdGVuc29yIGlzIGFzc3VtZWQuXHJcbiAgICpcclxuICAgKiBAcmV0dXJucyBhIHRlbnNvciBvYmplY3RcclxuICAgKi9cclxuICBmcm9tUGlubmVkQnVmZmVyPFQgZXh0ZW5kcyBFeGNsdWRlPFRlbnNvci5UeXBlLCAnc3RyaW5nJz4+KFxyXG4gICAgICB0eXBlOiBULCBidWZmZXI6IFRlbnNvci5EYXRhVHlwZU1hcFtUXSwgZGltcz86IHJlYWRvbmx5IG51bWJlcltdKTogVHlwZWRUZW5zb3I8VD47XHJcbn1cclxuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXHJcblxyXG4vKipcclxuICogQSBzdHJpbmcgdGhhdCByZXByZXNlbnRzIGEgZmlsZSdzIFVSTCBvciBwYXRoLlxyXG4gKlxyXG4gKiBQYXRoIGlzIHZhaWxhYmxlIG9ubHkgaW4gb25ueHJ1bnRpbWUtbm9kZSBvciBvbm54cnVudGltZS13ZWIgcnVubmluZyBpbiBOb2RlLmpzLlxyXG4gKi9cclxuZXhwb3J0IHR5cGUgRmlsZVVybE9yUGF0aCA9IHN0cmluZztcclxuXHJcbi8qKlxyXG4gKiBBIEJsb2Igb2JqZWN0IHRoYXQgcmVwcmVzZW50cyBhIGZpbGUuXHJcbiAqL1xyXG5leHBvcnQgdHlwZSBGaWxlQmxvYiA9IEJsb2I7XHJcblxyXG4vKipcclxuICogQSBVaW50OEFycmF5LCBBcnJheUJ1ZmZlciBvciBTaGFyZWRBcnJheUJ1ZmZlciBvYmplY3QgdGhhdCByZXByZXNlbnRzIGEgZmlsZSBjb250ZW50LlxyXG4gKlxyXG4gKiBXaGVuIGl0IGlzIGFuIEFycmF5QnVmZmVyIG9yIFNoYXJlZEFycmF5QnVmZmVyLCB0aGUgd2hvbGUgYnVmZmVyIGlzIGFzc3VtZWQgdG8gYmUgdGhlIGZpbGUgY29udGVudC5cclxuICovXHJcbmV4cG9ydCB0eXBlIEZpbGVEYXRhID0gVWludDhBcnJheXxBcnJheUJ1ZmZlckxpa2U7XHJcblxyXG4vKipcclxuICogUmVwcmVzZW50cyBhIGZpbGUgdGhhdCBjYW4gYmUgbG9hZGVkIGJ5IHRoZSBPTk5YIFJ1bnRpbWUgSmF2YVNjcmlwdCBBUEkuXHJcbiAqL1xyXG5leHBvcnQgdHlwZSBGaWxlVHlwZSA9IEZpbGVVcmxPclBhdGh8RmlsZUJsb2J8RmlsZURhdGE7XHJcblxyXG4vKipcclxuICogUmVwcmVzZW50cyBhbiBleHRlcm5hbCBkYXRhIGZpbGUuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIEV4dGVybmFsRGF0YUZpbGVEZXNjcmlwdGlvbiB7XHJcbiAgLyoqXHJcbiAgICogU3BlY2lmeSB0aGUgZXh0ZXJuYWwgZGF0YSBmaWxlLlxyXG4gICAqL1xyXG4gIGRhdGE6IEZpbGVUeXBlO1xyXG4gIC8qKlxyXG4gICAqIFNwZWNpZnkgdGhlIGZpbGUgcGF0aC5cclxuICAgKi9cclxuICBwYXRoOiBzdHJpbmc7XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIGFuIGV4dGVybmFsIGRhdGEgZmlsZS5cclxuICpcclxuICogV2hlbiB1c2luZyBhIHN0cmluZywgaXQgc2hvdWxkIGJlIGEgZmlsZSBVUkwgb3IgcGF0aCB0aGF0IGluIHRoZSBzYW1lIGRpcmVjdG9yeSBhcyB0aGUgbW9kZWwgZmlsZS5cclxuICovXHJcbmV4cG9ydCB0eXBlIEV4dGVybmFsRGF0YUZpbGVUeXBlID0gRXh0ZXJuYWxEYXRhRmlsZURlc2NyaXB0aW9ufEZpbGVVcmxPclBhdGg7XHJcblxyXG4vKipcclxuICogT3B0aW9ucyBmb3IgbW9kZWwgbG9hZGluZy5cclxuICovXHJcbmV4cG9ydCBpbnRlcmZhY2UgT25ueE1vZGVsT3B0aW9ucyB7XHJcbiAgLyoqXHJcbiAgICogU3BlY2lmeWluZyBhIGxpc3Qgb2YgZmlsZXMgdGhhdCByZXByZXNlbnRzIHRoZSBleHRlcm5hbCBkYXRhLlxyXG4gICAqL1xyXG4gIGV4dGVybmFsRGF0YT86IHJlYWRvbmx5IEV4dGVybmFsRGF0YUZpbGVUeXBlW107XHJcbn1cclxuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXHJcblxyXG5pbXBvcnQge1RlbnNvcn0gZnJvbSAnLi90ZW5zb3IuanMnO1xyXG5cclxuZXhwb3J0IHR5cGUgTm9uVGVuc29yVHlwZSA9IG5ldmVyO1xyXG5cclxuLyoqXHJcbiAqIFR5cGUgT25ueFZhbHVlIFJlcHJlc2VudHMgYm90aCB0ZW5zb3JzIGFuZCBub24tdGVuc29ycyB2YWx1ZSBmb3IgbW9kZWwncyBpbnB1dHMvb3V0cHV0cy5cclxuICpcclxuICogTk9URTogY3VycmVudGx5IG5vdCBzdXBwb3J0IG5vbi10ZW5zb3JcclxuICovXHJcbmV4cG9ydCB0eXBlIE9ubnhWYWx1ZSA9IFRlbnNvcnxOb25UZW5zb3JUeXBlO1xyXG5cclxuLyoqXHJcbiAqIFR5cGUgT25ueFZhbHVlRGF0YUxvY2F0aW9uIHJlcHJlc2VudHMgdGhlIGxvY2F0aW9uIG9mIHRoZSBkYXRhIG9mIGFuIE9ubnhWYWx1ZS5cclxuICovXHJcbmV4cG9ydCB0eXBlIE9ubnhWYWx1ZURhdGFMb2NhdGlvbiA9IFRlbnNvci5EYXRhTG9jYXRpb247XHJcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxyXG5cclxuaW1wb3J0IHtyZXNvbHZlQmFja2VuZEFuZEV4ZWN1dGlvblByb3ZpZGVyc30gZnJvbSAnLi9iYWNrZW5kLWltcGwuanMnO1xyXG5pbXBvcnQge1Nlc3Npb25IYW5kbGVyLCBUcmFpbmluZ1Nlc3Npb25IYW5kbGVyfSBmcm9tICcuL2JhY2tlbmQuanMnO1xyXG5pbXBvcnQge0luZmVyZW5jZVNlc3Npb24gYXMgSW5mZXJlbmNlU2Vzc2lvbn0gZnJvbSAnLi9pbmZlcmVuY2Utc2Vzc2lvbi5qcyc7XHJcbmltcG9ydCB7T25ueFZhbHVlfSBmcm9tICcuL29ubngtdmFsdWUuanMnO1xyXG5pbXBvcnQge1RlbnNvcn0gZnJvbSAnLi90ZW5zb3IuanMnO1xyXG5pbXBvcnQge1RyYWluaW5nU2Vzc2lvbiBhcyBUcmFpbmluZ1Nlc3Npb25JbnRlcmZhY2UsIFRyYWluaW5nU2Vzc2lvbkNyZWF0ZU9wdGlvbnN9IGZyb20gJy4vdHJhaW5pbmctc2Vzc2lvbi5qcyc7XHJcblxyXG50eXBlIFNlc3Npb25PcHRpb25zID0gSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucztcclxudHlwZSBGZWVkc1R5cGUgPSBJbmZlcmVuY2VTZXNzaW9uLkZlZWRzVHlwZTtcclxudHlwZSBGZXRjaGVzVHlwZSA9IEluZmVyZW5jZVNlc3Npb24uRmV0Y2hlc1R5cGU7XHJcbnR5cGUgUmV0dXJuVHlwZSA9IEluZmVyZW5jZVNlc3Npb24uUmV0dXJuVHlwZTtcclxudHlwZSBSdW5PcHRpb25zID0gSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zO1xyXG5cclxuY29uc3Qgbm9CYWNrZW5kRXJyTXNnOiBzdHJpbmcgPSAnVHJhaW5pbmcgYmFja2VuZCBjb3VsZCBub3QgYmUgcmVzb2x2ZWQuICcgK1xyXG4gICAgJ01ha2Ugc3VyZSB5b3VcXCdyZSB1c2luZyB0aGUgY29ycmVjdCBjb25maWd1cmF0aW9uICYgV2ViQXNzZW1ibHkgZmlsZXMuJztcclxuXHJcbmV4cG9ydCBjbGFzcyBUcmFpbmluZ1Nlc3Npb24gaW1wbGVtZW50cyBUcmFpbmluZ1Nlc3Npb25JbnRlcmZhY2Uge1xyXG4gIHByaXZhdGUgY29uc3RydWN0b3IoaGFuZGxlcjogVHJhaW5pbmdTZXNzaW9uSGFuZGxlciwgaGFzT3B0aW1pemVyTW9kZWw6IGJvb2xlYW4sIGhhc0V2YWxNb2RlbDogYm9vbGVhbikge1xyXG4gICAgdGhpcy5oYW5kbGVyID0gaGFuZGxlcjtcclxuICAgIHRoaXMuaGFzT3B0aW1pemVyTW9kZWwgPSBoYXNPcHRpbWl6ZXJNb2RlbDtcclxuICAgIHRoaXMuaGFzRXZhbE1vZGVsID0gaGFzRXZhbE1vZGVsO1xyXG4gIH1cclxuICBwcml2YXRlIGhhbmRsZXI6IFRyYWluaW5nU2Vzc2lvbkhhbmRsZXI7XHJcbiAgcHJpdmF0ZSBoYXNPcHRpbWl6ZXJNb2RlbDogYm9vbGVhbjtcclxuICBwcml2YXRlIGhhc0V2YWxNb2RlbDogYm9vbGVhbjtcclxuXHJcbiAgZ2V0IHRyYWluaW5nSW5wdXROYW1lcygpOiByZWFkb25seSBzdHJpbmdbXSB7XHJcbiAgICByZXR1cm4gdGhpcy5oYW5kbGVyLmlucHV0TmFtZXM7XHJcbiAgfVxyXG4gIGdldCB0cmFpbmluZ091dHB1dE5hbWVzKCk6IHJlYWRvbmx5IHN0cmluZ1tdIHtcclxuICAgIHJldHVybiB0aGlzLmhhbmRsZXIub3V0cHV0TmFtZXM7XHJcbiAgfVxyXG5cclxuICBnZXQgZXZhbElucHV0TmFtZXMoKTogcmVhZG9ubHkgc3RyaW5nW10ge1xyXG4gICAgaWYgKHRoaXMuaGFzRXZhbE1vZGVsKSB7XHJcbiAgICAgIHJldHVybiB0aGlzLmhhbmRsZXIuZXZhbElucHV0TmFtZXM7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgdHJhaW5pbmcgc2Vzc2lvbiBoYXMgbm8gZXZhbE1vZGVsIGxvYWRlZC4nKTtcclxuICAgIH1cclxuICB9XHJcbiAgZ2V0IGV2YWxPdXRwdXROYW1lcygpOiByZWFkb25seSBzdHJpbmdbXSB7XHJcbiAgICBpZiAodGhpcy5oYXNFdmFsTW9kZWwpIHtcclxuICAgICAgcmV0dXJuIHRoaXMuaGFuZGxlci5ldmFsT3V0cHV0TmFtZXM7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgdHJhaW5pbmcgc2Vzc2lvbiBoYXMgbm8gZXZhbE1vZGVsIGxvYWRlZC4nKTtcclxuICAgIH1cclxuICB9XHJcblxyXG4gIHN0YXRpYyBhc3luYyBjcmVhdGUodHJhaW5pbmdPcHRpb25zOiBUcmFpbmluZ1Nlc3Npb25DcmVhdGVPcHRpb25zLCBzZXNzaW9uT3B0aW9ucz86IFNlc3Npb25PcHRpb25zKTpcclxuICAgICAgUHJvbWlzZTxUcmFpbmluZ1Nlc3Npb24+IHtcclxuICAgIGNvbnN0IGV2YWxNb2RlbDogc3RyaW5nfFVpbnQ4QXJyYXkgPSB0cmFpbmluZ09wdGlvbnMuZXZhbE1vZGVsIHx8ICcnO1xyXG4gICAgY29uc3Qgb3B0aW1pemVyTW9kZWw6IHN0cmluZ3xVaW50OEFycmF5ID0gdHJhaW5pbmdPcHRpb25zLm9wdGltaXplck1vZGVsIHx8ICcnO1xyXG4gICAgY29uc3Qgb3B0aW9uczogU2Vzc2lvbk9wdGlvbnMgPSBzZXNzaW9uT3B0aW9ucyB8fCB7fTtcclxuXHJcbiAgICAvLyByZXNvbHZlIGJhY2tlbmQsIHVwZGF0ZSBzZXNzaW9uIG9wdGlvbnMgd2l0aCB2YWxpZGF0ZWQgRVBzLCBhbmQgY3JlYXRlIHNlc3Npb24gaGFuZGxlclxyXG4gICAgY29uc3QgW2JhY2tlbmQsIG9wdGlvbnNXaXRoVmFsaWRhdGVkRVBzXSA9IGF3YWl0IHJlc29sdmVCYWNrZW5kQW5kRXhlY3V0aW9uUHJvdmlkZXJzKG9wdGlvbnMpO1xyXG4gICAgaWYgKGJhY2tlbmQuY3JlYXRlVHJhaW5pbmdTZXNzaW9uSGFuZGxlcikge1xyXG4gICAgICBjb25zdCBoYW5kbGVyID0gYXdhaXQgYmFja2VuZC5jcmVhdGVUcmFpbmluZ1Nlc3Npb25IYW5kbGVyKFxyXG4gICAgICAgICAgdHJhaW5pbmdPcHRpb25zLmNoZWNrcG9pbnRTdGF0ZSwgdHJhaW5pbmdPcHRpb25zLnRyYWluTW9kZWwsIGV2YWxNb2RlbCwgb3B0aW1pemVyTW9kZWwsXHJcbiAgICAgICAgICBvcHRpb25zV2l0aFZhbGlkYXRlZEVQcyk7XHJcbiAgICAgIHJldHVybiBuZXcgVHJhaW5pbmdTZXNzaW9uKGhhbmRsZXIsICEhdHJhaW5pbmdPcHRpb25zLm9wdGltaXplck1vZGVsLCAhIXRyYWluaW5nT3B0aW9ucy5ldmFsTW9kZWwpO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKG5vQmFja2VuZEVyck1zZyk7XHJcbiAgICB9XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIZWxwZXIgZnVuY3Rpb24gZm9yIHJ1blRyYWluU3RlcCBhbmQgZnV0dXJlIHJ1blN0ZXAgbWV0aG9kcyB0aGF0IGhhbmRsZXMgdGhlIHR5cGUtbmFycm93aW5nIGNvbnZlcnNpb24gZnJvbVxyXG4gICAqIHRoZSBnaXZlbiBwYXJhbWV0ZXJzIHRvIFNlc3Npb25IYW5kbGVyLkZldGNoZXNUeXBlIGFuZCBSdW5PcHRpb25zLlxyXG4gICAqXHJcbiAgICogQHBhcmFtIGlucHV0TmFtZXMgdGhlIGZlZWRzIG9iamVjdCBpcyBjaGVja2VkIHRoYXQgdGhleSBjb250YWluIGFsbCBpbnB1dCBuYW1lcyBpbiB0aGUgcHJvdmlkZWQgbGlzdCBvZiBpbnB1dFxyXG4gICAqIG5hbWVzLlxyXG4gICAqIEBwYXJhbSBvdXRwdXROYW1lcyB0aGUgZmV0Y2hlcyBvYmplY3QgaXMgY2hlY2tlZCB0aGF0IHRoZWlyIGtleXMgbWF0Y2ggdXAgd2l0aCB2YWxpZCBuYW1lcyBpbiB0aGUgbGlzdCBvZiBvdXRwdXRcclxuICAgKiBuYW1lcy5cclxuICAgKiBAcGFyYW0gZmVlZHMgdGhlIHJlcXVpcmVkIGlucHV0XHJcbiAgICogQHBhcmFtIGFyZzEgbmFycm93ZWQgJiBjb252ZXJ0ZWQgaW50byB0aGUgU2Vzc2lvbkhhbmRsZXIuRmV0Y2hlc1R5cGUgb3IgUnVuT3B0aW9ucyBvYmplY3RcclxuICAgKiBAcGFyYW0gYXJnMiBvcHRpb25hbCBSdW5PcHRpb25zIG9iamVjdC5cclxuICAgKiBAcmV0dXJuc1xyXG4gICAqL1xyXG4gIHR5cGVOYXJyb3dpbmdGb3JSdW5TdGVwKFxyXG4gICAgICBpbnB1dE5hbWVzOiByZWFkb25seSBzdHJpbmdbXSwgb3V0cHV0TmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdLCBmZWVkczogRmVlZHNUeXBlLCBhcmcxPzogRmV0Y2hlc1R5cGV8UnVuT3B0aW9ucyxcclxuICAgICAgYXJnMj86IFJ1bk9wdGlvbnMpOiBbU2Vzc2lvbkhhbmRsZXIuRmV0Y2hlc1R5cGUsIFJ1bk9wdGlvbnNdIHtcclxuICAgIGNvbnN0IGZldGNoZXM6IHtbbmFtZTogc3RyaW5nXTogT25ueFZhbHVlfG51bGx9ID0ge307XHJcbiAgICBsZXQgb3B0aW9uczogUnVuT3B0aW9ucyA9IHt9O1xyXG4gICAgLy8gY2hlY2sgaW5wdXRzXHJcbiAgICBpZiAodHlwZW9mIGZlZWRzICE9PSAnb2JqZWN0JyB8fCBmZWVkcyA9PT0gbnVsbCB8fCBmZWVkcyBpbnN0YW5jZW9mIFRlbnNvciB8fCBBcnJheS5pc0FycmF5KGZlZWRzKSkge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKFxyXG4gICAgICAgICAgJ1xcJ2ZlZWRzXFwnIG11c3QgYmUgYW4gb2JqZWN0IHRoYXQgdXNlIGlucHV0IG5hbWVzIGFzIGtleXMgYW5kIE9ubnhWYWx1ZSBhcyBjb3JyZXNwb25kaW5nIHZhbHVlcy4nKTtcclxuICAgIH1cclxuXHJcbiAgICBsZXQgaXNGZXRjaGVzRW1wdHkgPSB0cnVlO1xyXG4gICAgLy8gZGV0ZXJtaW5lIHdoaWNoIG92ZXJyaWRlIGlzIGJlaW5nIHVzZWRcclxuICAgIGlmICh0eXBlb2YgYXJnMSA9PT0gJ29iamVjdCcpIHtcclxuICAgICAgaWYgKGFyZzEgPT09IG51bGwpIHtcclxuICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmV4cGVjdGVkIGFyZ3VtZW50WzFdOiBjYW5ub3QgYmUgbnVsbC4nKTtcclxuICAgICAgfVxyXG4gICAgICBpZiAoYXJnMSBpbnN0YW5jZW9mIFRlbnNvcikge1xyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1xcJ2ZldGNoZXNcXCcgY2Fubm90IGJlIGEgVGVuc29yJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGFyZzEpKSB7XHJcbiAgICAgICAgaWYgKGFyZzEubGVuZ3RoID09PSAwKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcXCdmZXRjaGVzXFwnIGNhbm5vdCBiZSBhbiBlbXB0eSBhcnJheS4nKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaXNGZXRjaGVzRW1wdHkgPSBmYWxzZTtcclxuICAgICAgICAvLyBvdXRwdXQgbmFtZXNcclxuICAgICAgICBmb3IgKGNvbnN0IG5hbWUgb2YgYXJnMSkge1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiBuYW1lICE9PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdcXCdmZXRjaGVzXFwnIG11c3QgYmUgYSBzdHJpbmcgYXJyYXkgb3IgYW4gb2JqZWN0LicpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgaWYgKG91dHB1dE5hbWVzLmluZGV4T2YobmFtZSkgPT09IC0xKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBSYW5nZUVycm9yKGAnZmV0Y2hlcycgY29udGFpbnMgaW52YWxpZCBvdXRwdXQgbmFtZTogJHtuYW1lfS5gKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGZldGNoZXNbbmFtZV0gPSBudWxsO1xyXG4gICAgICAgIH1cclxuXHJcbiAgICAgICAgaWYgKHR5cGVvZiBhcmcyID09PSAnb2JqZWN0JyAmJiBhcmcyICE9PSBudWxsKSB7XHJcbiAgICAgICAgICBvcHRpb25zID0gYXJnMjtcclxuICAgICAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcyICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcignXFwnb3B0aW9uc1xcJyBtdXN0IGJlIGFuIG9iamVjdC4nKTtcclxuICAgICAgICB9XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gZGVjaWRlIHdoZXRoZXIgYXJnMSBpcyBmZXRjaGVzIG9yIG9wdGlvbnNcclxuICAgICAgICAvLyBpZiBhbnkgb3V0cHV0IG5hbWUgaXMgcHJlc2VudCBhbmQgaXRzIHZhbHVlIGlzIHZhbGlkIE9ubnhWYWx1ZSwgd2UgY29uc2lkZXIgaXQgZmV0Y2hlc1xyXG4gICAgICAgIGxldCBpc0ZldGNoZXMgPSBmYWxzZTtcclxuICAgICAgICBjb25zdCBhcmcxS2V5cyA9IE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKGFyZzEpO1xyXG4gICAgICAgIGZvciAoY29uc3QgbmFtZSBvZiBvdXRwdXROYW1lcykge1xyXG4gICAgICAgICAgaWYgKGFyZzFLZXlzLmluZGV4T2YobmFtZSkgIT09IC0xKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHYgPSAoYXJnMSBhcyBJbmZlcmVuY2VTZXNzaW9uLk51bGxhYmxlT25ueFZhbHVlTWFwVHlwZSlbbmFtZV07XHJcbiAgICAgICAgICAgIGlmICh2ID09PSBudWxsIHx8IHYgaW5zdGFuY2VvZiBUZW5zb3IpIHtcclxuICAgICAgICAgICAgICBpc0ZldGNoZXMgPSB0cnVlO1xyXG4gICAgICAgICAgICAgIGlzRmV0Y2hlc0VtcHR5ID0gZmFsc2U7XHJcbiAgICAgICAgICAgICAgZmV0Y2hlc1tuYW1lXSA9IHY7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGlmIChpc0ZldGNoZXMpIHtcclxuICAgICAgICAgIGlmICh0eXBlb2YgYXJnMiA9PT0gJ29iamVjdCcgJiYgYXJnMiAhPT0gbnVsbCkge1xyXG4gICAgICAgICAgICBvcHRpb25zID0gYXJnMjtcclxuICAgICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGFyZzIgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoJ1xcJ29wdGlvbnNcXCcgbXVzdCBiZSBhbiBvYmplY3QuJyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIG9wdGlvbnMgPSBhcmcxIGFzIFJ1bk9wdGlvbnM7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBhcmcxICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICB0aHJvdyBuZXcgVHlwZUVycm9yKCdVbmV4cGVjdGVkIGFyZ3VtZW50WzFdOiBtdXN0IGJlIFxcJ2ZldGNoZXNcXCcgb3IgXFwnb3B0aW9uc1xcJy4nKTtcclxuICAgIH1cclxuXHJcbiAgICAvLyBjaGVjayBpZiBhbGwgaW5wdXRzIGFyZSBpbiBmZWVkXHJcbiAgICBmb3IgKGNvbnN0IG5hbWUgb2YgaW5wdXROYW1lcykge1xyXG4gICAgICBpZiAodHlwZW9mIGZlZWRzW25hbWVdID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgaW5wdXQgJyR7bmFtZX0nIGlzIG1pc3NpbmcgaW4gJ2ZlZWRzJy5gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIGlmIG5vIGZldGNoZXMgaXMgc3BlY2lmaWVkLCB3ZSB1c2UgdGhlIGZ1bGwgb3V0cHV0IG5hbWVzIGxpc3RcclxuICAgIGlmIChpc0ZldGNoZXNFbXB0eSkge1xyXG4gICAgICBmb3IgKGNvbnN0IG5hbWUgb2Ygb3V0cHV0TmFtZXMpIHtcclxuICAgICAgICBmZXRjaGVzW25hbWVdID0gbnVsbDtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBbZmV0Y2hlcywgb3B0aW9uc107XHJcbiAgfVxyXG5cclxuICAvKipcclxuICAgKiBIZWxwZXIgbWV0aG9kIGZvciBydW5UcmFpblN0ZXAgYW5kIGFueSBvdGhlciBydW5TdGVwIG1ldGhvZHMuIFRha2VzIHRoZSBSZXR1cm5UeXBlIHJlc3VsdCBmcm9tIHRoZSBTZXNzaW9uSGFuZGxlclxyXG4gICAqIGFuZCBjaGFuZ2VzIGl0IGludG8gYSBtYXAgb2YgVGVuc29ycy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSByZXN1bHRzXHJcbiAgICogQHJldHVybnNcclxuICAgKi9cclxuICBjb252ZXJ0SGFuZGxlclJldHVyblR5cGVUb01hcE9mVGVuc29ycyhyZXN1bHRzOiBTZXNzaW9uSGFuZGxlci5SZXR1cm5UeXBlKTogUmV0dXJuVHlwZSB7XHJcbiAgICBjb25zdCByZXR1cm5WYWx1ZToge1tuYW1lOiBzdHJpbmddOiBPbm54VmFsdWV9ID0ge307XHJcbiAgICBmb3IgKGNvbnN0IGtleSBpbiByZXN1bHRzKSB7XHJcbiAgICAgIGlmIChPYmplY3QuaGFzT3duUHJvcGVydHkuY2FsbChyZXN1bHRzLCBrZXkpKSB7XHJcbiAgICAgICAgY29uc3QgcmVzdWx0ID0gcmVzdWx0c1trZXldO1xyXG4gICAgICAgIGlmIChyZXN1bHQgaW5zdGFuY2VvZiBUZW5zb3IpIHtcclxuICAgICAgICAgIHJldHVyblZhbHVlW2tleV0gPSByZXN1bHQ7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHJldHVyblZhbHVlW2tleV0gPSBuZXcgVGVuc29yKHJlc3VsdC50eXBlLCByZXN1bHQuZGF0YSwgcmVzdWx0LmRpbXMpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIHJldHVyblZhbHVlO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgbGF6eVJlc2V0R3JhZCgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGF3YWl0IHRoaXMuaGFuZGxlci5sYXp5UmVzZXRHcmFkKCk7XHJcbiAgfVxyXG5cclxuICBydW5UcmFpblN0ZXAoZmVlZHM6IEZlZWRzVHlwZSwgb3B0aW9ucz86IFJ1bk9wdGlvbnMpOiBQcm9taXNlPFJldHVyblR5cGU+O1xyXG4gIHJ1blRyYWluU3RlcChmZWVkczogRmVlZHNUeXBlLCBmZXRjaGVzOiBGZXRjaGVzVHlwZSwgb3B0aW9ucz86IFJ1bk9wdGlvbnMpOiBQcm9taXNlPFJldHVyblR5cGU+O1xyXG4gIGFzeW5jIHJ1blRyYWluU3RlcChmZWVkczogRmVlZHNUeXBlLCBhcmcxPzogRmV0Y2hlc1R5cGV8UnVuT3B0aW9ucywgYXJnMj86IFJ1bk9wdGlvbnMpOiBQcm9taXNlPFJldHVyblR5cGU+IHtcclxuICAgIGNvbnN0IFtmZXRjaGVzLCBvcHRpb25zXSA9XHJcbiAgICAgICAgdGhpcy50eXBlTmFycm93aW5nRm9yUnVuU3RlcCh0aGlzLnRyYWluaW5nSW5wdXROYW1lcywgdGhpcy50cmFpbmluZ091dHB1dE5hbWVzLCBmZWVkcywgYXJnMSwgYXJnMik7XHJcbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgdGhpcy5oYW5kbGVyLnJ1blRyYWluU3RlcChmZWVkcywgZmV0Y2hlcywgb3B0aW9ucyk7XHJcbiAgICByZXR1cm4gdGhpcy5jb252ZXJ0SGFuZGxlclJldHVyblR5cGVUb01hcE9mVGVuc29ycyhyZXN1bHRzKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIHJ1bk9wdGltaXplclN0ZXAob3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9uc3x1bmRlZmluZWQpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIGlmICh0aGlzLmhhc09wdGltaXplck1vZGVsKSB7XHJcbiAgICAgIGF3YWl0IHRoaXMuaGFuZGxlci5ydW5PcHRpbWl6ZXJTdGVwKG9wdGlvbnMgfHwge30pO1xyXG4gICAgfSBlbHNlIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKCdUaGlzIFRyYWluaW5nU2Vzc2lvbiBoYXMgbm8gT3B0aW1pemVyTW9kZWwgbG9hZGVkLicpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgcnVuRXZhbFN0ZXAoZmVlZHM6IEZlZWRzVHlwZSwgb3B0aW9ucz86IFJ1bk9wdGlvbnN8dW5kZWZpbmVkKTogUHJvbWlzZTxSZXR1cm5UeXBlPjtcclxuICBydW5FdmFsU3RlcChmZWVkczogRmVlZHNUeXBlLCBmZXRjaGVzOiBGZXRjaGVzVHlwZSwgb3B0aW9ucz86IFJ1bk9wdGlvbnN8dW5kZWZpbmVkKTogUHJvbWlzZTxSZXR1cm5UeXBlPjtcclxuICBhc3luYyBydW5FdmFsU3RlcChmZWVkczogRmVlZHNUeXBlLCBhcmcxPzogRmV0Y2hlc1R5cGV8UnVuT3B0aW9ucywgYXJnMj86IFJ1bk9wdGlvbnMpOiBQcm9taXNlPFJldHVyblR5cGU+IHtcclxuICAgIGlmICh0aGlzLmhhc0V2YWxNb2RlbCkge1xyXG4gICAgICBjb25zdCBbZmV0Y2hlcywgb3B0aW9uc10gPVxyXG4gICAgICAgICAgdGhpcy50eXBlTmFycm93aW5nRm9yUnVuU3RlcCh0aGlzLmV2YWxJbnB1dE5hbWVzLCB0aGlzLmV2YWxPdXRwdXROYW1lcywgZmVlZHMsIGFyZzEsIGFyZzIpO1xyXG4gICAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgdGhpcy5oYW5kbGVyLnJ1bkV2YWxTdGVwKGZlZWRzLCBmZXRjaGVzLCBvcHRpb25zKTtcclxuICAgICAgcmV0dXJuIHRoaXMuY29udmVydEhhbmRsZXJSZXR1cm5UeXBlVG9NYXBPZlRlbnNvcnMocmVzdWx0cyk7XHJcbiAgICB9IGVsc2Uge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RoaXMgVHJhaW5pbmdTZXNzaW9uIGhhcyBubyBFdmFsTW9kZWwgbG9hZGVkLicpO1xyXG4gICAgfVxyXG4gIH1cclxuXHJcbiAgYXN5bmMgZ2V0UGFyYW1ldGVyc1NpemUodHJhaW5hYmxlT25seSA9IHRydWUpOiBQcm9taXNlPG51bWJlcj4ge1xyXG4gICAgcmV0dXJuIHRoaXMuaGFuZGxlci5nZXRQYXJhbWV0ZXJzU2l6ZSh0cmFpbmFibGVPbmx5KTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGxvYWRQYXJhbWV0ZXJzQnVmZmVyKGFycmF5OiBVaW50OEFycmF5LCB0cmFpbmFibGVPbmx5ID0gdHJ1ZSk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgY29uc3QgcGFyYW1zU2l6ZSA9IGF3YWl0IHRoaXMuZ2V0UGFyYW1ldGVyc1NpemUodHJhaW5hYmxlT25seSk7XHJcbiAgICAvLyBjaGVja2luZyB0aGF0IHRoZSBzaXplIG9mIHRoZSBVaW50OEFycmF5IGlzIGVxdWl2YWxlbnQgdG8gdGhlIGJ5dGUgbGVuZ3RoIG9mIGEgRmxvYXQzMkFycmF5IG9mIHRoZSBudW1iZXJcclxuICAgIC8vIG9mIHBhcmFtZXRlcnNcclxuICAgIGlmIChhcnJheS5sZW5ndGggIT09IDQgKiBwYXJhbXNTaXplKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcclxuICAgICAgICAgICdTaXplIG9mIHRoZSBidWZmZXIgcGFzc2VkIGludG8gbG9hZFBhcmFtZXRlcnNCdWZmZXIgbXVzdCBtYXRjaCB0aGUgbnVtYmVyIG9mIHBhcmFtZXRlcnMgaW4gJyArXHJcbiAgICAgICAgICAndGhlIG1vZGVsLiBQbGVhc2UgdXNlIGdldFBhcmFtZXRlcnNTaXplIG1ldGhvZCB0byBjaGVjay4nKTtcclxuICAgIH1cclxuICAgIHJldHVybiB0aGlzLmhhbmRsZXIubG9hZFBhcmFtZXRlcnNCdWZmZXIoYXJyYXksIHRyYWluYWJsZU9ubHkpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZ2V0Q29udGlndW91c1BhcmFtZXRlcnModHJhaW5hYmxlT25seSA9IHRydWUpOiBQcm9taXNlPE9ubnhWYWx1ZT4ge1xyXG4gICAgcmV0dXJuIHRoaXMuaGFuZGxlci5nZXRDb250aWd1b3VzUGFyYW1ldGVycyh0cmFpbmFibGVPbmx5KTtcclxuICB9XHJcblxyXG4gIGFzeW5jIHJlbGVhc2UoKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICByZXR1cm4gdGhpcy5oYW5kbGVyLmRpc3Bvc2UoKTtcclxuICB9XHJcbn1cclxuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXHJcblxyXG5pbXBvcnQge0luZmVyZW5jZVNlc3Npb259IGZyb20gJy4vaW5mZXJlbmNlLXNlc3Npb24uanMnO1xyXG5pbXBvcnQge09ubnhWYWx1ZX0gZnJvbSAnLi9vbm54LXZhbHVlLmpzJztcclxuaW1wb3J0IHtUcmFpbmluZ1Nlc3Npb24gYXMgVHJhaW5pbmdTZXNzaW9uSW1wbH0gZnJvbSAnLi90cmFpbmluZy1zZXNzaW9uLWltcGwuanMnO1xyXG5cclxuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlZGVjbGFyZSAqL1xyXG5cclxuZXhwb3J0IGRlY2xhcmUgbmFtZXNwYWNlIFRyYWluaW5nU2Vzc2lvbiB7XHJcbiAgLyoqXHJcbiAgICogRWl0aGVyIFVSSSBmaWxlIHBhdGggKHN0cmluZykgb3IgVWludDhBcnJheSBjb250YWluaW5nIG1vZGVsIG9yIGNoZWNrcG9pbnQgaW5mb3JtYXRpb24uXHJcbiAgICovXHJcbiAgdHlwZSBVcmlPckJ1ZmZlciA9IHN0cmluZ3xVaW50OEFycmF5O1xyXG59XHJcblxyXG4vKipcclxuICogUmVwcmVzZW50IGEgcnVudGltZSBpbnN0YW5jZSBvZiBhbiBPTk5YIHRyYWluaW5nIHNlc3Npb24sXHJcbiAqIHdoaWNoIGNvbnRhaW5zIGEgbW9kZWwgdGhhdCBjYW4gYmUgdHJhaW5lZCwgYW5kLCBvcHRpb25hbGx5LFxyXG4gKiBhbiBldmFsIGFuZCBvcHRpbWl6ZXIgbW9kZWwuXHJcbiAqL1xyXG5leHBvcnQgaW50ZXJmYWNlIFRyYWluaW5nU2Vzc2lvbiB7XHJcbiAgLy8gI3JlZ2lvbiBydW4oKVxyXG5cclxuICAvKipcclxuICAgKiBMYXppbHkgcmVzZXRzIHRoZSBncmFkaWVudHMgb2YgYWxsIHRyYWluYWJsZSBwYXJhbWV0ZXJzIHRvIHplcm8uIFNob3VsZCBoYXBwZW4gYWZ0ZXIgdGhlIGludm9jYXRpb24gb2ZcclxuICAgKiBydW5PcHRpbWl6ZXJTdGVwLlxyXG4gICAqL1xyXG4gIGxhenlSZXNldEdyYWQoKTogUHJvbWlzZTx2b2lkPjtcclxuXHJcbiAgLyoqXHJcbiAgICogUnVuIFRyYWluU3RlcCBhc3luY2hyb25vdXNseSB3aXRoIHRoZSBnaXZlbiBmZWVkcyBhbmQgb3B0aW9ucy5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBmZWVkcyAtIFJlcHJlc2VudGF0aW9uIG9mIHRoZSBtb2RlbCBpbnB1dC4gU2VlIHR5cGUgZGVzY3JpcHRpb24gb2YgYEluZmVyZW5jZVNlc3Npb24uSW5wdXRUeXBlYCBmb3JcclxuICAgZGV0YWlsLlxyXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9uYWwuIEEgc2V0IG9mIG9wdGlvbnMgdGhhdCBjb250cm9scyB0aGUgYmVoYXZpb3Igb2YgbW9kZWwgdHJhaW5pbmcuXHJcbiAgICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgdG8gYSBtYXAsIHdoaWNoIHVzZXMgb3V0cHV0IG5hbWVzIGFzIGtleXMgYW5kIE9ubnhWYWx1ZSBhcyBjb3JyZXNwb25kaW5nIHZhbHVlcy5cclxuICAgKi9cclxuICBydW5UcmFpblN0ZXAoZmVlZHM6IEluZmVyZW5jZVNlc3Npb24uRmVlZHNUeXBlLCBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTpcclxuICAgICAgUHJvbWlzZTxJbmZlcmVuY2VTZXNzaW9uLlJldHVyblR5cGU+O1xyXG5cclxuICAvKipcclxuICAgKiBSdW4gYSBzaW5nbGUgdHJhaW4gc3RlcCB3aXRoIHRoZSBnaXZlbiBpbnB1dHMgYW5kIG9wdGlvbnMuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZmVlZHMgLSBSZXByZXNlbnRhdGlvbiBvZiB0aGUgbW9kZWwgaW5wdXQuXHJcbiAgICogQHBhcmFtIGZldGNoZXMgLSBSZXByZXNlbnRhdGlvbiBvZiB0aGUgbW9kZWwgb3V0cHV0LlxyXG4gICAqIGRldGFpbC5cclxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbmFsLiBBIHNldCBvZiBvcHRpb25zIHRoYXQgY29udHJvbHMgdGhlIGJlaGF2aW9yIG9mIG1vZGVsIHRyYWluaW5nLlxyXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgbWFwLCB3aGljaCB1c2VzIG91dHB1dCBuYW1lcyBhcyBrZXlzIGFuZCBPbm54VmFsdWUgYXMgY29ycmVzcG9uZGluZ1xyXG4gICB2YWx1ZXMuXHJcbiAgICovXHJcbiAgcnVuVHJhaW5TdGVwKFxyXG4gICAgICBmZWVkczogSW5mZXJlbmNlU2Vzc2lvbi5GZWVkc1R5cGUsIGZldGNoZXM6IEluZmVyZW5jZVNlc3Npb24uRmV0Y2hlc1R5cGUsXHJcbiAgICAgIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOiBQcm9taXNlPEluZmVyZW5jZVNlc3Npb24uUmV0dXJuVHlwZT47XHJcblxyXG4gIC8qKlxyXG4gICAqIFJ1bnMgYSBzaW5nbGUgb3B0aW1pemVyIHN0ZXAsIHdoaWNoIHBlcmZvcm1zIHdlaWdodCB1cGRhdGVzIGZvciB0aGUgdHJhaW5hYmxlIHBhcmFtZXRlcnMgdXNpbmcgdGhlIG9wdGltaXplciBtb2RlbC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9uYWwuIEEgc2V0IG9mIG9wdGlvbnMgdGhhdCBjb250cm9scyB0aGUgYmVoYXZpb3Igb2YgbW9kZWwgb3B0aW1pemluZy5cclxuICAgKi9cclxuICBydW5PcHRpbWl6ZXJTdGVwKG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOiBQcm9taXNlPHZvaWQ+O1xyXG5cclxuICAvKipcclxuICAgKiBSdW4gYSBzaW5nbGUgZXZhbCBzdGVwIHdpdGggdGhlIGdpdmVuIGlucHV0cyBhbmQgb3B0aW9ucyB1c2luZyB0aGUgZXZhbCBtb2RlbC5cclxuICAgKlxyXG4gICAqIEBwYXJhbSBmZWVkcyAtIFJlcHJlc2VudGF0aW9uIG9mIHRoZSBtb2RlbCBpbnB1dC5cclxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbmFsLiBBIHNldCBvZiBvcHRpb25zIHRoYXQgY29udHJvbHMgdGhlIGJlaGF2aW9yIG9mIG1vZGVsIGV2YWwgc3RlcC5cclxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIG1hcCwgd2hpY2ggdXNlcyBvdXRwdXQgbmFtZXMgYXMga2V5cyBhbmQgT25ueFZhbHVlIGFzIGNvcnJlc3BvbmRpbmdcclxuICAgdmFsdWVzLlxyXG4gICAqL1xyXG4gIHJ1bkV2YWxTdGVwKGZlZWRzOiBJbmZlcmVuY2VTZXNzaW9uLkZlZWRzVHlwZSwgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyk6XHJcbiAgICAgIFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbi5SZXR1cm5UeXBlPjtcclxuXHJcbiAgLyoqXHJcbiAgICogUnVuIGEgc2luZ2xlIGV2YWwgc3RlcCB3aXRoIHRoZSBnaXZlbiBpbnB1dHMgYW5kIG9wdGlvbnMgdXNpbmcgdGhlIGV2YWwgbW9kZWwuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gZmVlZHMgLSBSZXByZXNlbnRhdGlvbiBvZiB0aGUgbW9kZWwgaW5wdXQuXHJcbiAgICogQHBhcmFtIGZldGNoZXMgLSBSZXByZXNlbnRhdGlvbiBvZiB0aGUgbW9kZWwgb3V0cHV0LlxyXG4gICAqIGRldGFpbC5cclxuICAgKiBAcGFyYW0gb3B0aW9ucyAtIE9wdGlvbmFsLiBBIHNldCBvZiBvcHRpb25zIHRoYXQgY29udHJvbHMgdGhlIGJlaGF2aW9yIG9mIG1vZGVsIGV2YWwgc3RlcC5cclxuICAgKiBAcmV0dXJucyBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB0byBhIG1hcCwgd2hpY2ggdXNlcyBvdXRwdXQgbmFtZXMgYXMga2V5cyBhbmQgT25ueFZhbHVlIGFzIGNvcnJlc3BvbmRpbmdcclxuICAgdmFsdWVzLlxyXG4gICAqL1xyXG4gIHJ1bkV2YWxTdGVwKFxyXG4gICAgICBmZWVkczogSW5mZXJlbmNlU2Vzc2lvbi5GZWVkc1R5cGUsIGZldGNoZXM6IEluZmVyZW5jZVNlc3Npb24uRmV0Y2hlc1R5cGUsXHJcbiAgICAgIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlJ1bk9wdGlvbnMpOiBQcm9taXNlPEluZmVyZW5jZVNlc3Npb24uUmV0dXJuVHlwZT47XHJcblxyXG4gIC8vICNlbmRyZWdpb25cclxuXHJcbiAgLy8gI3JlZ2lvbiBjb3B5IHBhcmFtZXRlcnNcclxuXHJcbiAgLyoqXHJcbiAgICogUmV0cmlldmVzIHRoZSBzaXplIG9mIGFsbCBwYXJhbWV0ZXJzIGZvciB0aGUgdHJhaW5pbmcgc3RhdGUuIENhbGN1bGF0ZXMgdGhlIHRvdGFsIG51bWJlciBvZiBwcmltaXRpdmUgKGRhdGF0eXBlIG9mXHJcbiAgICogdGhlIHBhcmFtZXRlcnMpIGVsZW1lbnRzIG9mIGFsbCB0aGUgcGFyYW1ldGVycyBpbiB0aGUgdHJhaW5pbmcgc3RhdGUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdHJhaW5hYmxlT25seSAtIFdoZW4gc2V0IHRvIHRydWUsIHRoZSBzaXplIGlzIGNhbGN1bGF0ZWQgZm9yIHRyYWluYWJsZSBwYXJhbXMgb25seS4gRGVmYXVsdCB2YWx1ZSBpcyB0cnVlLlxyXG4gICAqL1xyXG4gIGdldFBhcmFtZXRlcnNTaXplKHRyYWluYWJsZU9ubHk6IGJvb2xlYW4pOiBQcm9taXNlPG51bWJlcj47XHJcblxyXG4gIC8qKlxyXG4gICAqIENvcGllcyBwYXJhbWV0ZXIgdmFsdWVzIGZyb20gdGhlIGdpdmVuIGJ1ZmZlciB0byB0aGUgdHJhaW5pbmcgc3RhdGUuIEN1cnJlbnRseSwgb25seSBzdXBwb3J0aW5nIG1vZGVscyB3aXRoXHJcbiAgICogcGFyYW1ldGVycyBvZiB0eXBlIEZsb2F0MzIuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gYnVmZmVyIC0gQSBVaW50OEFycmF5IHJlcHJlc2VudGF0aW9uIG9mIEZsb2F0MzIgcGFyYW1ldGVycy5cclxuICAgKiBAcGFyYW0gdHJhaW5hYmxlT25seSAtIFRydWUgaWYgdHJhaW5hYmxlIHBhcmFtZXRlcnMgb25seSB0byBiZSBtb2RpZmllZCwgZmFsc2Ugb3RoZXJ3aXNlLiBEZWZhdWx0IHZhbHVlIGlzIHRydWUuXHJcbiAgICovXHJcbiAgbG9hZFBhcmFtZXRlcnNCdWZmZXIoYnVmZmVyOiBVaW50OEFycmF5LCB0cmFpbmFibGVPbmx5OiBib29sZWFuKTogUHJvbWlzZTx2b2lkPjtcclxuXHJcbiAgLyoqXHJcbiAgICogQ29waWVzIHRoZSBtb2RlbCBwYXJhbWV0ZXJzIHRvIGEgY29udGlndW91cyBidWZmZXIuIFVzdWFsbHkgdXNlZCBpbiB0aGUgY29udGV4dCBvZiBGZWRlcmF0ZWQgTGVhcm5pbmcuXHJcbiAgICogQ3VycmVudGx5LCBvbmx5IHN1cHBvcnRpbmcgbW9kZWxzIHdpdGggcGFyYW1ldGVycyBvZiB0eXBlIEZsb2F0MzIuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gdHJhaW5hYmxlT25seSAtIFdoZW4gc2V0IHRvIHRydWUsIG9ubHkgdHJhaW5hYmxlIHBhcmFtZXRlcnMgYXJlIGNvcGllZC4gVHJhaW5hYmxlIHBhcmFtZXRlcnMgYXJlIHBhcmFtZXRlcnNcclxuICAgKiBmb3Igd2hpY2ggcmVxdWlyZXNfZ3JhZCBpcyBzZXQgdG8gdHJ1ZS4gRGVmYXVsdCB2YWx1ZSBpcyB0cnVlLlxyXG4gICAqIEByZXR1cm5zIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgRmxvYXQzMiBPbm54VmFsdWUgb2YgdGhlIHJlcXVlc3RlZCBwYXJhbWV0ZXJzLlxyXG4gICAqL1xyXG4gIGdldENvbnRpZ3VvdXNQYXJhbWV0ZXJzKHRyYWluYWJsZU9ubHk6IGJvb2xlYW4pOiBQcm9taXNlPE9ubnhWYWx1ZT47XHJcbiAgLy8gI2VuZHJlZ2lvblxyXG5cclxuICAvLyAjcmVnaW9uIHJlbGVhc2UoKVxyXG5cclxuICAvKipcclxuICAgKiBSZWxlYXNlIHRoZSBpbmZlcmVuY2Ugc2Vzc2lvbiBhbmQgdGhlIHVuZGVybHlpbmcgcmVzb3VyY2VzLlxyXG4gICAqL1xyXG4gIHJlbGVhc2UoKTogUHJvbWlzZTx2b2lkPjtcclxuICAvLyAjZW5kcmVnaW9uXHJcblxyXG4gIC8vICNyZWdpb24gbWV0YWRhdGFcclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IGlucHV0IG5hbWVzIG9mIHRoZSBsb2FkZWQgdHJhaW5pbmcgbW9kZWwuXHJcbiAgICovXHJcbiAgcmVhZG9ubHkgdHJhaW5pbmdJbnB1dE5hbWVzOiByZWFkb25seSBzdHJpbmdbXTtcclxuXHJcbiAgLyoqXHJcbiAgICogR2V0IG91dHB1dCBuYW1lcyBvZiB0aGUgbG9hZGVkIHRyYWluaW5nIG1vZGVsLlxyXG4gICAqL1xyXG4gIHJlYWRvbmx5IHRyYWluaW5nT3V0cHV0TmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xyXG5cclxuICAvKipcclxuICAgKiBHZXQgaW5wdXQgbmFtZXMgb2YgdGhlIGxvYWRlZCBldmFsIG1vZGVsLiBJcyBhbiBlbXB0eSBhcnJheSBpZiBubyBldmFsIG1vZGVsIGlzIGxvYWRlZC5cclxuICAgKi9cclxuICByZWFkb25seSBldmFsSW5wdXROYW1lczogcmVhZG9ubHkgc3RyaW5nW107XHJcblxyXG4gIC8qKlxyXG4gICAqIEdldCBvdXRwdXQgbmFtZXMgb2YgdGhlIGxvYWRlZCBldmFsIG1vZGVsLiBJcyBhbiBlbXB0eSBhcnJheSBpZiBubyBldmFsIG1vZGVsIGlzIGxvYWRlZC5cclxuICAgKi9cclxuICByZWFkb25seSBldmFsT3V0cHV0TmFtZXM6IHJlYWRvbmx5IHN0cmluZ1tdO1xyXG5cclxuICAvLyAjZW5kcmVnaW9uXHJcbn1cclxuXHJcbi8qKlxyXG4gKiBSZXByZXNlbnRzIHRoZSBvcHRpb25hbCBwYXJhbWV0ZXJzIHRoYXQgY2FuIGJlIHBhc3NlZCBpbnRvIHRoZSBUcmFpbmluZ1Nlc3Npb25GYWN0b3J5LlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBUcmFpbmluZ1Nlc3Npb25DcmVhdGVPcHRpb25zIHtcclxuICAvKipcclxuICAgKiBVUkkgb3IgYnVmZmVyIGZvciBhIC5ja3B0IGZpbGUgdGhhdCBjb250YWlucyB0aGUgY2hlY2twb2ludCBmb3IgdGhlIHRyYWluaW5nIG1vZGVsLlxyXG4gICAqL1xyXG4gIGNoZWNrcG9pbnRTdGF0ZTogVHJhaW5pbmdTZXNzaW9uLlVyaU9yQnVmZmVyO1xyXG4gIC8qKlxyXG4gICAqIFVSSSBvciBidWZmZXIgZm9yIHRoZSAub25ueCB0cmFpbmluZyBmaWxlLlxyXG4gICAqL1xyXG4gIHRyYWluTW9kZWw6IFRyYWluaW5nU2Vzc2lvbi5VcmlPckJ1ZmZlcjtcclxuICAvKipcclxuICAgKiBPcHRpb25hbC4gVVJJIG9yIGJ1ZmZlciBmb3IgdGhlIC5vbm54IG9wdGltaXplciBtb2RlbCBmaWxlLlxyXG4gICAqL1xyXG4gIG9wdGltaXplck1vZGVsPzogVHJhaW5pbmdTZXNzaW9uLlVyaU9yQnVmZmVyO1xyXG4gIC8qKlxyXG4gICAqIE9wdGlvbmFsLiBVUkkgb3IgYnVmZmVyIGZvciB0aGUgLm9ubnggZXZhbCBtb2RlbCBmaWxlLlxyXG4gICAqL1xyXG4gIGV2YWxNb2RlbD86IFRyYWluaW5nU2Vzc2lvbi5VcmlPckJ1ZmZlcjtcclxufVxyXG5cclxuLyoqXHJcbiAqIERlZmluZXMgbWV0aG9kIG92ZXJsb2FkIHBvc3NpYmlsaXRpZXMgZm9yIGNyZWF0aW5nIGEgVHJhaW5pbmdTZXNzaW9uLlxyXG4gKi9cclxuZXhwb3J0IGludGVyZmFjZSBUcmFpbmluZ1Nlc3Npb25GYWN0b3J5IHtcclxuICAvLyAjcmVnaW9uIGNyZWF0ZSgpXHJcblxyXG4gIC8qKlxyXG4gICAqIENyZWF0ZXMgYSBuZXcgVHJhaW5pbmdTZXNzaW9uIGFuZCBhc3luY2hyb25vdXNseSBsb2FkcyBhbnkgbW9kZWxzIHBhc3NlZCBpbiB0aHJvdWdoIHRyYWluaW5nT3B0aW9uc1xyXG4gICAqXHJcbiAgICogQHBhcmFtIHRyYWluaW5nT3B0aW9ucyBzcGVjaWZ5IG1vZGVscyBhbmQgY2hlY2twb2ludHMgdG8gbG9hZCBpbnRvIHRoZSBUcmFpbmluZyBTZXNzaW9uXHJcbiAgICogQHBhcmFtIHNlc3Npb25PcHRpb25zIHNwZWNpZnkgY29uZmlndXJhdGlvbiBmb3IgdHJhaW5pbmcgc2Vzc2lvbiBiZWhhdmlvclxyXG4gICAqXHJcbiAgICogQHJldHVybnMgUHJvbWlzZSB0aGF0IHJlc29sdmVzIHRvIGEgVHJhaW5pbmdTZXNzaW9uIG9iamVjdFxyXG4gICAqL1xyXG4gIGNyZWF0ZSh0cmFpbmluZ09wdGlvbnM6IFRyYWluaW5nU2Vzc2lvbkNyZWF0ZU9wdGlvbnMsIHNlc3Npb25PcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6XHJcbiAgICAgIFByb21pc2U8VHJhaW5pbmdTZXNzaW9uPjtcclxuXHJcbiAgLy8gI2VuZHJlZ2lvblxyXG59XHJcblxyXG4vLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25hbWluZy1jb252ZW50aW9uXHJcbmV4cG9ydCBjb25zdCBUcmFpbmluZ1Nlc3Npb246IFRyYWluaW5nU2Vzc2lvbkZhY3RvcnkgPSBUcmFpbmluZ1Nlc3Npb25JbXBsO1xyXG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cclxuXHJcbi8qKlxyXG4gKiAjIE9OTlggUnVudGltZSBKYXZhU2NyaXB0IEFQSVxyXG4gKlxyXG4gKiBPTk5YIFJ1bnRpbWUgSmF2YVNjcmlwdCBBUEkgaXMgYSB1bmlmaWVkIEFQSSBmb3IgYWxsIEphdmFTY3JpcHQgdXNhZ2VzLCBpbmNsdWRpbmcgdGhlIGZvbGxvd2luZyBOUE0gcGFja2FnZXM6XHJcbiAqXHJcbiAqIC0gW29ubnhydW50aW1lLW5vZGVdKGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL29ubnhydW50aW1lLW5vZGUpXHJcbiAqIC0gW29ubnhydW50aW1lLXdlYl0oaHR0cHM6Ly93d3cubnBtanMuY29tL3BhY2thZ2Uvb25ueHJ1bnRpbWUtd2ViKVxyXG4gKiAtIFtvbm54cnVudGltZS1yZWFjdC1uYXRpdmVdKGh0dHBzOi8vd3d3Lm5wbWpzLmNvbS9wYWNrYWdlL29ubnhydW50aW1lLXJlYWN0LW5hdGl2ZSlcclxuICpcclxuICogU2VlIGFsc286XHJcbiAqIC0gW0dldCBTdGFydGVkXShodHRwczovL29ubnhydW50aW1lLmFpL2RvY3MvZ2V0LXN0YXJ0ZWQvd2l0aC1qYXZhc2NyaXB0LylcclxuICogLSBbSW5mZXJlbmNlIGV4YW1wbGVzXShodHRwczovL2dpdGh1Yi5jb20vbWljcm9zb2Z0L29ubnhydW50aW1lLWluZmVyZW5jZS1leGFtcGxlcy90cmVlL21haW4vanMpXHJcbiAqXHJcbiAqIEBwYWNrYWdlRG9jdW1lbnRhdGlvblxyXG4gKi9cclxuXHJcbmV4cG9ydCAqIGZyb20gJy4vYmFja2VuZC5qcyc7XHJcbmV4cG9ydCAqIGZyb20gJy4vZW52LmpzJztcclxuZXhwb3J0ICogZnJvbSAnLi9pbmZlcmVuY2Utc2Vzc2lvbi5qcyc7XHJcbmV4cG9ydCAqIGZyb20gJy4vdGVuc29yLmpzJztcclxuZXhwb3J0ICogZnJvbSAnLi90ZW5zb3ItY29udmVyc2lvbi5qcyc7XHJcbmV4cG9ydCAqIGZyb20gJy4vdGVuc29yLWZhY3RvcnkuanMnO1xyXG5leHBvcnQgKiBmcm9tICcuL3RyYWNlLmpzJztcclxuZXhwb3J0ICogZnJvbSAnLi9vbm54LW1vZGVsLmpzJztcclxuZXhwb3J0ICogZnJvbSAnLi9vbm54LXZhbHVlLmpzJztcclxuZXhwb3J0ICogZnJvbSAnLi90cmFpbmluZy1zZXNzaW9uLmpzJztcclxuIiwgImV4cG9ydCBjb25zdCBjcHVzID0gdW5kZWZpbmVkOyIsICJleHBvcnQgY29uc3QgcmVhZEZpbGUgPSB1bmRlZmluZWQ7ZXhwb3J0IGNvbnN0IHJlYWRGaWxlU3luYyA9IHVuZGVmaW5lZDtleHBvcnQgY29uc3QgY3JlYXRlUmVhZFN0cmVhbSA9IHVuZGVmaW5lZDsiLCAiZXhwb3J0IGNvbnN0IGpvaW4gPSB1bmRlZmluZWQ7IiwgInZhciBvcnRXYXNtID0gKCgpID0+IHtcclxuICB2YXIgX3NjcmlwdERpciA9XHJcbiAgICB0eXBlb2YgZG9jdW1lbnQgIT0gXCJ1bmRlZmluZWRcIiA/IGRvY3VtZW50LmN1cnJlbnRTY3JpcHQ/LnNyYyA6IHVuZGVmaW5lZDtcclxuICBpZiAodHlwZW9mIF9fZmlsZW5hbWUgIT0gXCJ1bmRlZmluZWRcIikgX3NjcmlwdERpciB8fD0gX19maWxlbmFtZTtcclxuICByZXR1cm4gZnVuY3Rpb24gKG1vZHVsZUFyZyA9IHt9KSB7XHJcbiAgICB2YXIgTW9kdWxlID0gbW9kdWxlQXJnO1xyXG4gICAgdmFyIHJlYWR5UHJvbWlzZVJlc29sdmUsIHJlYWR5UHJvbWlzZVJlamVjdDtcclxuICAgIHZhciByZWFkeVByb21pc2UgPSBuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIHJlYWR5UHJvbWlzZVJlc29sdmUgPSByZXNvbHZlO1xyXG4gICAgICByZWFkeVByb21pc2VSZWplY3QgPSByZWplY3Q7XHJcbiAgICB9KTtcclxuICAgIGlmIChNb2R1bGVbXCJyZWFkeVByb21pc2VSZWplY3RXcmFwcGVyXCJdKSB7XHJcbiAgICAgIE1vZHVsZVtcInJlYWR5UHJvbWlzZVJlamVjdFdyYXBwZXJcIl1bXCJ2YWx1ZVwiXSA9IHJlYWR5UHJvbWlzZVJlamVjdDtcclxuICAgIH1cclxuICAgIHZhciBtb2R1bGVPdmVycmlkZXMgPSBPYmplY3QuYXNzaWduKHt9LCBNb2R1bGUpO1xyXG4gICAgdmFyIGFyZ3VtZW50c18gPSBbXTtcclxuICAgIHZhciB0aGlzUHJvZ3JhbSA9IFwiLi90aGlzLnByb2dyYW1cIjtcclxuICAgIHZhciBxdWl0XyA9IChzdGF0dXMsIHRvVGhyb3cpID0+IHtcclxuICAgICAgdGhyb3cgdG9UaHJvdztcclxuICAgIH07XHJcbiAgICB2YXIgRU5WSVJPTk1FTlRfSVNfV0VCID0gdHlwZW9mIHdpbmRvdyA9PSBcIm9iamVjdFwiO1xyXG4gICAgdmFyIEVOVklST05NRU5UX0lTX1dPUktFUiA9IHR5cGVvZiBpbXBvcnRTY3JpcHRzID09IFwiZnVuY3Rpb25cIjtcclxuICAgIHZhciBFTlZJUk9OTUVOVF9JU19OT0RFID1cclxuICAgICAgdHlwZW9mIHByb2Nlc3MgPT0gXCJvYmplY3RcIiAmJlxyXG4gICAgICB0eXBlb2YgcHJvY2Vzcy52ZXJzaW9ucyA9PSBcIm9iamVjdFwiICYmXHJcbiAgICAgIHR5cGVvZiBwcm9jZXNzLnZlcnNpb25zLm5vZGUgPT0gXCJzdHJpbmdcIjtcclxuICAgIHZhciBzY3JpcHREaXJlY3RvcnkgPSBcIlwiO1xyXG4gICAgZnVuY3Rpb24gbG9jYXRlRmlsZShwYXRoKSB7XHJcbiAgICAgIGlmIChNb2R1bGVbXCJsb2NhdGVGaWxlXCJdKSB7XHJcbiAgICAgICAgcmV0dXJuIE1vZHVsZVtcImxvY2F0ZUZpbGVcIl0ocGF0aCwgc2NyaXB0RGlyZWN0b3J5KTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gc2NyaXB0RGlyZWN0b3J5ICsgcGF0aDtcclxuICAgIH1cclxuICAgIHZhciByZWFkXywgcmVhZEFzeW5jLCByZWFkQmluYXJ5O1xyXG4gICAgaWYgKEVOVklST05NRU5UX0lTX05PREUpIHtcclxuICAgICAgdmFyIGZzID0gcmVxdWlyZShcImZzXCIpO1xyXG4gICAgICB2YXIgbm9kZVBhdGggPSByZXF1aXJlKFwicGF0aFwiKTtcclxuICAgICAgaWYgKEVOVklST05NRU5UX0lTX1dPUktFUikge1xyXG4gICAgICAgIHNjcmlwdERpcmVjdG9yeSA9IG5vZGVQYXRoLmRpcm5hbWUoc2NyaXB0RGlyZWN0b3J5KSArIFwiL1wiO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHNjcmlwdERpcmVjdG9yeSA9IF9fZGlybmFtZSArIFwiL1wiO1xyXG4gICAgICB9XHJcbiAgICAgIHJlYWRfID0gKGZpbGVuYW1lLCBiaW5hcnkpID0+IHtcclxuICAgICAgICBmaWxlbmFtZSA9IGlzRmlsZVVSSShmaWxlbmFtZSlcclxuICAgICAgICAgID8gbmV3IFVSTChmaWxlbmFtZSlcclxuICAgICAgICAgIDogbm9kZVBhdGgubm9ybWFsaXplKGZpbGVuYW1lKTtcclxuICAgICAgICByZXR1cm4gZnMucmVhZEZpbGVTeW5jKGZpbGVuYW1lLCBiaW5hcnkgPyB1bmRlZmluZWQgOiBcInV0ZjhcIik7XHJcbiAgICAgIH07XHJcbiAgICAgIHJlYWRCaW5hcnkgPSAoZmlsZW5hbWUpID0+IHtcclxuICAgICAgICB2YXIgcmV0ID0gcmVhZF8oZmlsZW5hbWUsIHRydWUpO1xyXG4gICAgICAgIGlmICghcmV0LmJ1ZmZlcikge1xyXG4gICAgICAgICAgcmV0ID0gbmV3IFVpbnQ4QXJyYXkocmV0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHJldDtcclxuICAgICAgfTtcclxuICAgICAgcmVhZEFzeW5jID0gKGZpbGVuYW1lLCBvbmxvYWQsIG9uZXJyb3IsIGJpbmFyeSA9IHRydWUpID0+IHtcclxuICAgICAgICBmaWxlbmFtZSA9IGlzRmlsZVVSSShmaWxlbmFtZSlcclxuICAgICAgICAgID8gbmV3IFVSTChmaWxlbmFtZSlcclxuICAgICAgICAgIDogbm9kZVBhdGgubm9ybWFsaXplKGZpbGVuYW1lKTtcclxuICAgICAgICBmcy5yZWFkRmlsZShmaWxlbmFtZSwgYmluYXJ5ID8gdW5kZWZpbmVkIDogXCJ1dGY4XCIsIChlcnIsIGRhdGEpID0+IHtcclxuICAgICAgICAgIGlmIChlcnIpIG9uZXJyb3IoZXJyKTtcclxuICAgICAgICAgIGVsc2Ugb25sb2FkKGJpbmFyeSA/IGRhdGEuYnVmZmVyIDogZGF0YSk7XHJcbiAgICAgICAgfSk7XHJcbiAgICAgIH07XHJcbiAgICAgIGlmICghTW9kdWxlW1widGhpc1Byb2dyYW1cIl0gJiYgcHJvY2Vzcy5hcmd2Lmxlbmd0aCA+IDEpIHtcclxuICAgICAgICB0aGlzUHJvZ3JhbSA9IHByb2Nlc3MuYXJndlsxXS5yZXBsYWNlKC9cXFxcL2csIFwiL1wiKTtcclxuICAgICAgfVxyXG4gICAgICBhcmd1bWVudHNfID0gcHJvY2Vzcy5hcmd2LnNsaWNlKDIpO1xyXG4gICAgICBxdWl0XyA9IChzdGF0dXMsIHRvVGhyb3cpID0+IHtcclxuICAgICAgICBwcm9jZXNzLmV4aXRDb2RlID0gc3RhdHVzO1xyXG4gICAgICAgIHRocm93IHRvVGhyb3c7XHJcbiAgICAgIH07XHJcbiAgICB9IGVsc2UgaWYgKEVOVklST05NRU5UX0lTX1dFQiB8fCBFTlZJUk9OTUVOVF9JU19XT1JLRVIpIHtcclxuICAgICAgaWYgKEVOVklST05NRU5UX0lTX1dPUktFUikge1xyXG4gICAgICAgIHNjcmlwdERpcmVjdG9yeSA9IHNlbGYubG9jYXRpb24uaHJlZjtcclxuICAgICAgfSBlbHNlIGlmICh0eXBlb2YgZG9jdW1lbnQgIT0gXCJ1bmRlZmluZWRcIiAmJiBkb2N1bWVudC5jdXJyZW50U2NyaXB0KSB7XHJcbiAgICAgICAgc2NyaXB0RGlyZWN0b3J5ID0gZG9jdW1lbnQuY3VycmVudFNjcmlwdC5zcmM7XHJcbiAgICAgIH1cclxuICAgICAgaWYgKF9zY3JpcHREaXIpIHtcclxuICAgICAgICBzY3JpcHREaXJlY3RvcnkgPSBfc2NyaXB0RGlyO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChzY3JpcHREaXJlY3Rvcnkuc3RhcnRzV2l0aChcImJsb2I6XCIpKSB7XHJcbiAgICAgICAgc2NyaXB0RGlyZWN0b3J5ID0gXCJcIjtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBzY3JpcHREaXJlY3RvcnkgPSBzY3JpcHREaXJlY3Rvcnkuc3Vic3RyKFxyXG4gICAgICAgICAgMCxcclxuICAgICAgICAgIHNjcmlwdERpcmVjdG9yeS5yZXBsYWNlKC9bPyNdLiovLCBcIlwiKS5sYXN0SW5kZXhPZihcIi9cIikgKyAxXHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICB7XHJcbiAgICAgICAgcmVhZF8gPSAodXJsKSA9PiB7XHJcbiAgICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICB4aHIub3BlbihcIkdFVFwiLCB1cmwsIGZhbHNlKTtcclxuICAgICAgICAgIHhoci5zZW5kKG51bGwpO1xyXG4gICAgICAgICAgcmV0dXJuIHhoci5yZXNwb25zZVRleHQ7XHJcbiAgICAgICAgfTtcclxuICAgICAgICBpZiAoRU5WSVJPTk1FTlRfSVNfV09SS0VSKSB7XHJcbiAgICAgICAgICByZWFkQmluYXJ5ID0gKHVybCkgPT4ge1xyXG4gICAgICAgICAgICB2YXIgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0KCk7XHJcbiAgICAgICAgICAgIHhoci5vcGVuKFwiR0VUXCIsIHVybCwgZmFsc2UpO1xyXG4gICAgICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gXCJhcnJheWJ1ZmZlclwiO1xyXG4gICAgICAgICAgICB4aHIuc2VuZChudWxsKTtcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KHhoci5yZXNwb25zZSk7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgIH1cclxuICAgICAgICByZWFkQXN5bmMgPSAodXJsLCBvbmxvYWQsIG9uZXJyb3IpID0+IHtcclxuICAgICAgICAgIHZhciB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3QoKTtcclxuICAgICAgICAgIHhoci5vcGVuKFwiR0VUXCIsIHVybCwgdHJ1ZSk7XHJcbiAgICAgICAgICB4aHIucmVzcG9uc2VUeXBlID0gXCJhcnJheWJ1ZmZlclwiO1xyXG4gICAgICAgICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcclxuICAgICAgICAgICAgaWYgKHhoci5zdGF0dXMgPT0gMjAwIHx8ICh4aHIuc3RhdHVzID09IDAgJiYgeGhyLnJlc3BvbnNlKSkge1xyXG4gICAgICAgICAgICAgIG9ubG9hZCh4aHIucmVzcG9uc2UpO1xyXG4gICAgICAgICAgICAgIHJldHVybjtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBvbmVycm9yKCk7XHJcbiAgICAgICAgICB9O1xyXG4gICAgICAgICAgeGhyLm9uZXJyb3IgPSBvbmVycm9yO1xyXG4gICAgICAgICAgeGhyLnNlbmQobnVsbCk7XHJcbiAgICAgICAgfTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgIH1cclxuICAgIHZhciBvdXQgPSBjb25zb2xlLmxvZy5iaW5kKGNvbnNvbGUpO1xyXG4gICAgdmFyIGVyciA9IGNvbnNvbGUuZXJyb3IuYmluZChjb25zb2xlKTtcclxuICAgIE9iamVjdC5hc3NpZ24oTW9kdWxlLCBtb2R1bGVPdmVycmlkZXMpO1xyXG4gICAgbW9kdWxlT3ZlcnJpZGVzID0gbnVsbDtcclxuICAgIGlmIChNb2R1bGVbXCJhcmd1bWVudHNcIl0pIGFyZ3VtZW50c18gPSBNb2R1bGVbXCJhcmd1bWVudHNcIl07XHJcbiAgICB2YXIgd2FzbUJpbmFyeTtcclxuICAgIHZhciB3YXNtTWVtb3J5O1xyXG4gICAgdmFyIEFCT1JUID0gZmFsc2U7XHJcbiAgICB2YXIgRVhJVFNUQVRVUztcclxuICAgIHZhciBIRUFQOCwgSEVBUFU4LCBIRUFQMTYsIEhFQVBVMTYsIEhFQVAzMiwgSEVBUFUzMiwgSEVBUEYzMiwgSEVBUEY2NDtcclxuICAgIGZ1bmN0aW9uIHVwZGF0ZU1lbW9yeVZpZXdzKCkge1xyXG4gICAgICB2YXIgYiA9IHdhc21NZW1vcnkuYnVmZmVyO1xyXG4gICAgICBNb2R1bGVbXCJIRUFQOFwiXSA9IEhFQVA4ID0gbmV3IEludDhBcnJheShiKTtcclxuICAgICAgTW9kdWxlW1wiSEVBUDE2XCJdID0gSEVBUDE2ID0gbmV3IEludDE2QXJyYXkoYik7XHJcbiAgICAgIE1vZHVsZVtcIkhFQVBVOFwiXSA9IEhFQVBVOCA9IG5ldyBVaW50OEFycmF5KGIpO1xyXG4gICAgICBNb2R1bGVbXCJIRUFQVTE2XCJdID0gSEVBUFUxNiA9IG5ldyBVaW50MTZBcnJheShiKTtcclxuICAgICAgTW9kdWxlW1wiSEVBUDMyXCJdID0gSEVBUDMyID0gbmV3IEludDMyQXJyYXkoYik7XHJcbiAgICAgIE1vZHVsZVtcIkhFQVBVMzJcIl0gPSBIRUFQVTMyID0gbmV3IFVpbnQzMkFycmF5KGIpO1xyXG4gICAgICBNb2R1bGVbXCJIRUFQRjMyXCJdID0gSEVBUEYzMiA9IG5ldyBGbG9hdDMyQXJyYXkoYik7XHJcbiAgICAgIE1vZHVsZVtcIkhFQVBGNjRcIl0gPSBIRUFQRjY0ID0gbmV3IEZsb2F0NjRBcnJheShiKTtcclxuICAgIH1cclxuICAgIHZhciBfX0FUUFJFUlVOX18gPSBbXTtcclxuICAgIHZhciBfX0FUSU5JVF9fID0gW107XHJcbiAgICB2YXIgX19BVFBPU1RSVU5fXyA9IFtdO1xyXG4gICAgdmFyIHJ1bnRpbWVJbml0aWFsaXplZCA9IGZhbHNlO1xyXG4gICAgZnVuY3Rpb24gcHJlUnVuKCkge1xyXG4gICAgICBpZiAoTW9kdWxlW1wicHJlUnVuXCJdKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBNb2R1bGVbXCJwcmVSdW5cIl0gPT0gXCJmdW5jdGlvblwiKVxyXG4gICAgICAgICAgTW9kdWxlW1wicHJlUnVuXCJdID0gW01vZHVsZVtcInByZVJ1blwiXV07XHJcbiAgICAgICAgd2hpbGUgKE1vZHVsZVtcInByZVJ1blwiXS5sZW5ndGgpIHtcclxuICAgICAgICAgIGFkZE9uUHJlUnVuKE1vZHVsZVtcInByZVJ1blwiXS5zaGlmdCgpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgY2FsbFJ1bnRpbWVDYWxsYmFja3MoX19BVFBSRVJVTl9fKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGluaXRSdW50aW1lKCkge1xyXG4gICAgICBydW50aW1lSW5pdGlhbGl6ZWQgPSB0cnVlO1xyXG4gICAgICBjYWxsUnVudGltZUNhbGxiYWNrcyhfX0FUSU5JVF9fKTtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIHBvc3RSdW4oKSB7XHJcbiAgICAgIGNhbGxSdW50aW1lQ2FsbGJhY2tzKF9fQVRQT1NUUlVOX18pO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gYWRkT25QcmVSdW4oY2IpIHtcclxuICAgICAgX19BVFBSRVJVTl9fLnVuc2hpZnQoY2IpO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gYWRkT25Jbml0KGNiKSB7XHJcbiAgICAgIF9fQVRJTklUX18udW5zaGlmdChjYik7XHJcbiAgICB9XHJcbiAgICB2YXIgcnVuRGVwZW5kZW5jaWVzID0gMDtcclxuICAgIHZhciBydW5EZXBlbmRlbmN5V2F0Y2hlciA9IG51bGw7XHJcbiAgICB2YXIgZGVwZW5kZW5jaWVzRnVsZmlsbGVkID0gbnVsbDtcclxuICAgIGZ1bmN0aW9uIGFkZFJ1bkRlcGVuZGVuY3koaWQpIHtcclxuICAgICAgcnVuRGVwZW5kZW5jaWVzKys7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiByZW1vdmVSdW5EZXBlbmRlbmN5KGlkKSB7XHJcbiAgICAgIHJ1bkRlcGVuZGVuY2llcy0tO1xyXG4gICAgICBpZiAocnVuRGVwZW5kZW5jaWVzID09IDApIHtcclxuICAgICAgICBpZiAocnVuRGVwZW5kZW5jeVdhdGNoZXIgIT09IG51bGwpIHtcclxuICAgICAgICAgIGNsZWFySW50ZXJ2YWwocnVuRGVwZW5kZW5jeVdhdGNoZXIpO1xyXG4gICAgICAgICAgcnVuRGVwZW5kZW5jeVdhdGNoZXIgPSBudWxsO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZGVwZW5kZW5jaWVzRnVsZmlsbGVkKSB7XHJcbiAgICAgICAgICB2YXIgY2FsbGJhY2sgPSBkZXBlbmRlbmNpZXNGdWxmaWxsZWQ7XHJcbiAgICAgICAgICBkZXBlbmRlbmNpZXNGdWxmaWxsZWQgPSBudWxsO1xyXG4gICAgICAgICAgY2FsbGJhY2soKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGFib3J0KHdoYXQpIHtcclxuICAgICAgd2hhdCA9IFwiQWJvcnRlZChcIiArIHdoYXQgKyBcIilcIjtcclxuICAgICAgZXJyKHdoYXQpO1xyXG4gICAgICBBQk9SVCA9IHRydWU7XHJcbiAgICAgIEVYSVRTVEFUVVMgPSAxO1xyXG4gICAgICB3aGF0ICs9IFwiLiBCdWlsZCB3aXRoIC1zQVNTRVJUSU9OUyBmb3IgbW9yZSBpbmZvLlwiO1xyXG4gICAgICB2YXIgZSA9IG5ldyBXZWJBc3NlbWJseS5SdW50aW1lRXJyb3Iod2hhdCk7XHJcbiAgICAgIHJlYWR5UHJvbWlzZVJlamVjdChlKTtcclxuICAgICAgdGhyb3cgZTtcclxuICAgIH1cclxuICAgIHZhciBkYXRhVVJJUHJlZml4ID0gXCJkYXRhOmFwcGxpY2F0aW9uL29jdGV0LXN0cmVhbTtiYXNlNjQsXCI7XHJcbiAgICB2YXIgaXNEYXRhVVJJID0gKGZpbGVuYW1lKSA9PiBmaWxlbmFtZS5zdGFydHNXaXRoKGRhdGFVUklQcmVmaXgpO1xyXG4gICAgdmFyIGlzRmlsZVVSSSA9IChmaWxlbmFtZSkgPT4gZmlsZW5hbWUuc3RhcnRzV2l0aChcImZpbGU6Ly9cIik7XHJcbiAgICB2YXIgd2FzbUJpbmFyeUZpbGU7XHJcbiAgICB3YXNtQmluYXJ5RmlsZSA9IFwib3J0LXdhc20ud2FzbVwiO1xyXG4gICAgaWYgKCFpc0RhdGFVUkkod2FzbUJpbmFyeUZpbGUpKSB7XHJcbiAgICAgIHdhc21CaW5hcnlGaWxlID0gbG9jYXRlRmlsZSh3YXNtQmluYXJ5RmlsZSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBnZXRCaW5hcnlTeW5jKGZpbGUpIHtcclxuICAgICAgaWYgKGZpbGUgPT0gd2FzbUJpbmFyeUZpbGUgJiYgd2FzbUJpbmFyeSkge1xyXG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheSh3YXNtQmluYXJ5KTtcclxuICAgICAgfVxyXG4gICAgICBpZiAocmVhZEJpbmFyeSkge1xyXG4gICAgICAgIHJldHVybiByZWFkQmluYXJ5KGZpbGUpO1xyXG4gICAgICB9XHJcbiAgICAgIHRocm93IFwiYm90aCBhc3luYyBhbmQgc3luYyBmZXRjaGluZyBvZiB0aGUgd2FzbSBmYWlsZWRcIjtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIGdldEJpbmFyeVByb21pc2UoYmluYXJ5RmlsZSkge1xyXG4gICAgICBpZiAoIXdhc21CaW5hcnkgJiYgKEVOVklST05NRU5UX0lTX1dFQiB8fCBFTlZJUk9OTUVOVF9JU19XT1JLRVIpKSB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBmZXRjaCA9PSBcImZ1bmN0aW9uXCIgJiYgIWlzRmlsZVVSSShiaW5hcnlGaWxlKSkge1xyXG4gICAgICAgICAgcmV0dXJuIGZldGNoKGJpbmFyeUZpbGUsIHsgY3JlZGVudGlhbHM6IFwic2FtZS1vcmlnaW5cIiB9KVxyXG4gICAgICAgICAgICAudGhlbigocmVzcG9uc2UpID0+IHtcclxuICAgICAgICAgICAgICBpZiAoIXJlc3BvbnNlW1wib2tcIl0pIHtcclxuICAgICAgICAgICAgICAgIHRocm93IGBmYWlsZWQgdG8gbG9hZCB3YXNtIGJpbmFyeSBmaWxlIGF0ICcke2JpbmFyeUZpbGV9J2A7XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIHJldHVybiByZXNwb25zZVtcImFycmF5QnVmZmVyXCJdKCk7XHJcbiAgICAgICAgICAgIH0pXHJcbiAgICAgICAgICAgIC5jYXRjaCgoKSA9PiBnZXRCaW5hcnlTeW5jKGJpbmFyeUZpbGUpKTtcclxuICAgICAgICB9IGVsc2UgaWYgKHJlYWRBc3luYykge1xyXG4gICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgcmVhZEFzeW5jKFxyXG4gICAgICAgICAgICAgIGJpbmFyeUZpbGUsXHJcbiAgICAgICAgICAgICAgKHJlc3BvbnNlKSA9PiByZXNvbHZlKG5ldyBVaW50OEFycmF5KHJlc3BvbnNlKSksXHJcbiAgICAgICAgICAgICAgcmVqZWN0XHJcbiAgICAgICAgICAgICk7XHJcbiAgICAgICAgICB9KTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZSgpLnRoZW4oKCkgPT4gZ2V0QmluYXJ5U3luYyhiaW5hcnlGaWxlKSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBpbnN0YW50aWF0ZUFycmF5QnVmZmVyKGJpbmFyeUZpbGUsIGltcG9ydHMsIHJlY2VpdmVyKSB7XHJcbiAgICAgIHJldHVybiBnZXRCaW5hcnlQcm9taXNlKGJpbmFyeUZpbGUpXHJcbiAgICAgICAgLnRoZW4oKGJpbmFyeSkgPT4gV2ViQXNzZW1ibHkuaW5zdGFudGlhdGUoYmluYXJ5LCBpbXBvcnRzKSlcclxuICAgICAgICAudGhlbihyZWNlaXZlciwgKHJlYXNvbikgPT4ge1xyXG4gICAgICAgICAgZXJyKGBmYWlsZWQgdG8gYXN5bmNocm9ub3VzbHkgcHJlcGFyZSB3YXNtOiAke3JlYXNvbn1gKTtcclxuICAgICAgICAgIGFib3J0KHJlYXNvbik7XHJcbiAgICAgICAgfSk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBpbnN0YW50aWF0ZUFzeW5jKGJpbmFyeSwgYmluYXJ5RmlsZSwgaW1wb3J0cywgY2FsbGJhY2spIHtcclxuICAgICAgaWYgKFxyXG4gICAgICAgICFiaW5hcnkgJiZcclxuICAgICAgICB0eXBlb2YgV2ViQXNzZW1ibHkuaW5zdGFudGlhdGVTdHJlYW1pbmcgPT0gXCJmdW5jdGlvblwiICYmXHJcbiAgICAgICAgIWlzRGF0YVVSSShiaW5hcnlGaWxlKSAmJlxyXG4gICAgICAgICFpc0ZpbGVVUkkoYmluYXJ5RmlsZSkgJiZcclxuICAgICAgICAhRU5WSVJPTk1FTlRfSVNfTk9ERSAmJlxyXG4gICAgICAgIHR5cGVvZiBmZXRjaCA9PSBcImZ1bmN0aW9uXCJcclxuICAgICAgKSB7XHJcbiAgICAgICAgcmV0dXJuIGZldGNoKGJpbmFyeUZpbGUsIHsgY3JlZGVudGlhbHM6IFwic2FtZS1vcmlnaW5cIiB9KS50aGVuKFxyXG4gICAgICAgICAgKHJlc3BvbnNlKSA9PiB7XHJcbiAgICAgICAgICAgIHZhciByZXN1bHQgPSBXZWJBc3NlbWJseS5pbnN0YW50aWF0ZVN0cmVhbWluZyhyZXNwb25zZSwgaW1wb3J0cyk7XHJcbiAgICAgICAgICAgIHJldHVybiByZXN1bHQudGhlbihjYWxsYmFjaywgZnVuY3Rpb24gKHJlYXNvbikge1xyXG4gICAgICAgICAgICAgIGVycihgd2FzbSBzdHJlYW1pbmcgY29tcGlsZSBmYWlsZWQ6ICR7cmVhc29ufWApO1xyXG4gICAgICAgICAgICAgIGVycihcImZhbGxpbmcgYmFjayB0byBBcnJheUJ1ZmZlciBpbnN0YW50aWF0aW9uXCIpO1xyXG4gICAgICAgICAgICAgIHJldHVybiBpbnN0YW50aWF0ZUFycmF5QnVmZmVyKGJpbmFyeUZpbGUsIGltcG9ydHMsIGNhbGxiYWNrKTtcclxuICAgICAgICAgICAgfSk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgKTtcclxuICAgICAgfVxyXG4gICAgICByZXR1cm4gaW5zdGFudGlhdGVBcnJheUJ1ZmZlcihiaW5hcnlGaWxlLCBpbXBvcnRzLCBjYWxsYmFjayk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBjcmVhdGVXYXNtKCkge1xyXG4gICAgICB2YXIgaW5mbyA9IHsgYTogd2FzbUltcG9ydHMgfTtcclxuICAgICAgZnVuY3Rpb24gcmVjZWl2ZUluc3RhbmNlKGluc3RhbmNlLCBtb2R1bGUpIHtcclxuICAgICAgICB3YXNtRXhwb3J0cyA9IGluc3RhbmNlLmV4cG9ydHM7XHJcbiAgICAgICAgd2FzbUV4cG9ydHMgPSBhcHBseVNpZ25hdHVyZUNvbnZlcnNpb25zKHdhc21FeHBvcnRzKTtcclxuICAgICAgICB3YXNtTWVtb3J5ID0gd2FzbUV4cG9ydHNbXCJLXCJdO1xyXG4gICAgICAgIHVwZGF0ZU1lbW9yeVZpZXdzKCk7XHJcbiAgICAgICAgYWRkT25Jbml0KHdhc21FeHBvcnRzW1wiTFwiXSk7XHJcbiAgICAgICAgcmVtb3ZlUnVuRGVwZW5kZW5jeShcIndhc20taW5zdGFudGlhdGVcIik7XHJcbiAgICAgICAgcmV0dXJuIHdhc21FeHBvcnRzO1xyXG4gICAgICB9XHJcbiAgICAgIGFkZFJ1bkRlcGVuZGVuY3koXCJ3YXNtLWluc3RhbnRpYXRlXCIpO1xyXG4gICAgICBmdW5jdGlvbiByZWNlaXZlSW5zdGFudGlhdGlvblJlc3VsdChyZXN1bHQpIHtcclxuICAgICAgICByZWNlaXZlSW5zdGFuY2UocmVzdWx0W1wiaW5zdGFuY2VcIl0pO1xyXG4gICAgICB9XHJcbiAgICAgIGlmIChNb2R1bGVbXCJpbnN0YW50aWF0ZVdhc21cIl0pIHtcclxuICAgICAgICB0cnkge1xyXG4gICAgICAgICAgcmV0dXJuIE1vZHVsZVtcImluc3RhbnRpYXRlV2FzbVwiXShpbmZvLCByZWNlaXZlSW5zdGFuY2UpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgIGVycihgTW9kdWxlLmluc3RhbnRpYXRlV2FzbSBjYWxsYmFjayBmYWlsZWQgd2l0aCBlcnJvcjogJHtlfWApO1xyXG4gICAgICAgICAgcmVhZHlQcm9taXNlUmVqZWN0KGUpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBpbnN0YW50aWF0ZUFzeW5jKFxyXG4gICAgICAgIHdhc21CaW5hcnksXHJcbiAgICAgICAgd2FzbUJpbmFyeUZpbGUsXHJcbiAgICAgICAgaW5mbyxcclxuICAgICAgICByZWNlaXZlSW5zdGFudGlhdGlvblJlc3VsdFxyXG4gICAgICApLmNhdGNoKHJlYWR5UHJvbWlzZVJlamVjdCk7XHJcbiAgICAgIHJldHVybiB7fTtcclxuICAgIH1cclxuICAgIHZhciB0ZW1wRG91YmxlO1xyXG4gICAgdmFyIEFTTV9DT05TVFMgPSB7XHJcbiAgICAgIDQzNDA5NjogKCQwLCAkMSwgJDIsICQzKSA9PiB7XHJcbiAgICAgICAgaWYgKHR5cGVvZiBNb2R1bGUgPT0gXCJ1bmRlZmluZWRcIiB8fCAhTW9kdWxlLk1vdW50ZWRGaWxlcykge1xyXG4gICAgICAgICAgcmV0dXJuIDE7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCBmaWxlTmFtZSA9IFVURjhUb1N0cmluZygkMCA+Pj4gMCk7XHJcbiAgICAgICAgaWYgKGZpbGVOYW1lLnN0YXJ0c1dpdGgoXCIuL1wiKSkge1xyXG4gICAgICAgICAgZmlsZU5hbWUgPSBmaWxlTmFtZS5zdWJzdHJpbmcoMik7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGZpbGVEYXRhID0gTW9kdWxlLk1vdW50ZWRGaWxlcy5nZXQoZmlsZU5hbWUpO1xyXG4gICAgICAgIGlmICghZmlsZURhdGEpIHtcclxuICAgICAgICAgIHJldHVybiAyO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBvZmZzZXQgPSAkMSA+Pj4gMDtcclxuICAgICAgICBjb25zdCBsZW5ndGggPSAkMiA+Pj4gMDtcclxuICAgICAgICBjb25zdCBidWZmZXIgPSAkMyA+Pj4gMDtcclxuICAgICAgICBpZiAob2Zmc2V0ICsgbGVuZ3RoID4gZmlsZURhdGEuYnl0ZUxlbmd0aCkge1xyXG4gICAgICAgICAgcmV0dXJuIDM7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICBIRUFQVTguc2V0KGZpbGVEYXRhLnN1YmFycmF5KG9mZnNldCwgb2Zmc2V0ICsgbGVuZ3RoKSwgYnVmZmVyID4+PiAwKTtcclxuICAgICAgICAgIHJldHVybiAwO1xyXG4gICAgICAgIH0gY2F0Y2gge1xyXG4gICAgICAgICAgcmV0dXJuIDQ7XHJcbiAgICAgICAgfVxyXG4gICAgICB9LFxyXG4gICAgfTtcclxuICAgIHZhciBjYWxsUnVudGltZUNhbGxiYWNrcyA9IChjYWxsYmFja3MpID0+IHtcclxuICAgICAgd2hpbGUgKGNhbGxiYWNrcy5sZW5ndGggPiAwKSB7XHJcbiAgICAgICAgY2FsbGJhY2tzLnNoaWZ0KCkoTW9kdWxlKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIHZhciBzdGFja1Jlc3RvcmUgPSAodmFsKSA9PiBfX2Vtc2NyaXB0ZW5fc3RhY2tfcmVzdG9yZSh2YWwpO1xyXG4gICAgdmFyIHN0YWNrU2F2ZSA9ICgpID0+IF9lbXNjcmlwdGVuX3N0YWNrX2dldF9jdXJyZW50KCk7XHJcbiAgICBjbGFzcyBFeGNlcHRpb25JbmZvIHtcclxuICAgICAgY29uc3RydWN0b3IoZXhjUHRyKSB7XHJcbiAgICAgICAgdGhpcy5leGNQdHIgPSBleGNQdHI7XHJcbiAgICAgICAgdGhpcy5wdHIgPSBleGNQdHIgLSAyNDtcclxuICAgICAgfVxyXG4gICAgICBzZXRfdHlwZSh0eXBlKSB7XHJcbiAgICAgICAgSEVBUFUzMlsoKHRoaXMucHRyICsgNCkgPj4+IDIpID4+PiAwXSA9IHR5cGU7XHJcbiAgICAgIH1cclxuICAgICAgZ2V0X3R5cGUoKSB7XHJcbiAgICAgICAgcmV0dXJuIEhFQVBVMzJbKCh0aGlzLnB0ciArIDQpID4+PiAyKSA+Pj4gMF07XHJcbiAgICAgIH1cclxuICAgICAgc2V0X2Rlc3RydWN0b3IoZGVzdHJ1Y3Rvcikge1xyXG4gICAgICAgIEhFQVBVMzJbKCh0aGlzLnB0ciArIDgpID4+PiAyKSA+Pj4gMF0gPSBkZXN0cnVjdG9yO1xyXG4gICAgICB9XHJcbiAgICAgIGdldF9kZXN0cnVjdG9yKCkge1xyXG4gICAgICAgIHJldHVybiBIRUFQVTMyWygodGhpcy5wdHIgKyA4KSA+Pj4gMikgPj4+IDBdO1xyXG4gICAgICB9XHJcbiAgICAgIHNldF9jYXVnaHQoY2F1Z2h0KSB7XHJcbiAgICAgICAgY2F1Z2h0ID0gY2F1Z2h0ID8gMSA6IDA7XHJcbiAgICAgICAgSEVBUDhbKHRoaXMucHRyICsgMTIpID4+PiAwXSA9IGNhdWdodDtcclxuICAgICAgfVxyXG4gICAgICBnZXRfY2F1Z2h0KCkge1xyXG4gICAgICAgIHJldHVybiBIRUFQOFsodGhpcy5wdHIgKyAxMikgPj4+IDBdICE9IDA7XHJcbiAgICAgIH1cclxuICAgICAgc2V0X3JldGhyb3duKHJldGhyb3duKSB7XHJcbiAgICAgICAgcmV0aHJvd24gPSByZXRocm93biA/IDEgOiAwO1xyXG4gICAgICAgIEhFQVA4Wyh0aGlzLnB0ciArIDEzKSA+Pj4gMF0gPSByZXRocm93bjtcclxuICAgICAgfVxyXG4gICAgICBnZXRfcmV0aHJvd24oKSB7XHJcbiAgICAgICAgcmV0dXJuIEhFQVA4Wyh0aGlzLnB0ciArIDEzKSA+Pj4gMF0gIT0gMDtcclxuICAgICAgfVxyXG4gICAgICBpbml0KHR5cGUsIGRlc3RydWN0b3IpIHtcclxuICAgICAgICB0aGlzLnNldF9hZGp1c3RlZF9wdHIoMCk7XHJcbiAgICAgICAgdGhpcy5zZXRfdHlwZSh0eXBlKTtcclxuICAgICAgICB0aGlzLnNldF9kZXN0cnVjdG9yKGRlc3RydWN0b3IpO1xyXG4gICAgICB9XHJcbiAgICAgIHNldF9hZGp1c3RlZF9wdHIoYWRqdXN0ZWRQdHIpIHtcclxuICAgICAgICBIRUFQVTMyWygodGhpcy5wdHIgKyAxNikgPj4+IDIpID4+PiAwXSA9IGFkanVzdGVkUHRyO1xyXG4gICAgICB9XHJcbiAgICAgIGdldF9hZGp1c3RlZF9wdHIoKSB7XHJcbiAgICAgICAgcmV0dXJuIEhFQVBVMzJbKCh0aGlzLnB0ciArIDE2KSA+Pj4gMikgPj4+IDBdO1xyXG4gICAgICB9XHJcbiAgICAgIGdldF9leGNlcHRpb25fcHRyKCkge1xyXG4gICAgICAgIHZhciBpc1BvaW50ZXIgPSBfX19jeGFfaXNfcG9pbnRlcl90eXBlKHRoaXMuZ2V0X3R5cGUoKSk7XHJcbiAgICAgICAgaWYgKGlzUG9pbnRlcikge1xyXG4gICAgICAgICAgcmV0dXJuIEhFQVBVMzJbKHRoaXMuZXhjUHRyID4+PiAyKSA+Pj4gMF07XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHZhciBhZGp1c3RlZCA9IHRoaXMuZ2V0X2FkanVzdGVkX3B0cigpO1xyXG4gICAgICAgIGlmIChhZGp1c3RlZCAhPT0gMCkgcmV0dXJuIGFkanVzdGVkO1xyXG4gICAgICAgIHJldHVybiB0aGlzLmV4Y1B0cjtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gICAgdmFyIGV4Y2VwdGlvbkxhc3QgPSAwO1xyXG4gICAgdmFyIHVuY2F1Z2h0RXhjZXB0aW9uQ291bnQgPSAwO1xyXG4gICAgdmFyIGNvbnZlcnRJMzJQYWlyVG9JNTNDaGVja2VkID0gKGxvLCBoaSkgPT5cclxuICAgICAgKGhpICsgMjA5NzE1MikgPj4+IDAgPCA0MTk0MzA1IC0gISFsb1xyXG4gICAgICAgID8gKGxvID4+PiAwKSArIGhpICogNDI5NDk2NzI5NlxyXG4gICAgICAgIDogTmFOO1xyXG4gICAgZnVuY3Rpb24gX19fY3hhX3Rocm93KHB0ciwgdHlwZSwgZGVzdHJ1Y3Rvcikge1xyXG4gICAgICBwdHIgPj4+PSAwO1xyXG4gICAgICB0eXBlID4+Pj0gMDtcclxuICAgICAgZGVzdHJ1Y3RvciA+Pj49IDA7XHJcbiAgICAgIHZhciBpbmZvID0gbmV3IEV4Y2VwdGlvbkluZm8ocHRyKTtcclxuICAgICAgaW5mby5pbml0KHR5cGUsIGRlc3RydWN0b3IpO1xyXG4gICAgICBleGNlcHRpb25MYXN0ID0gcHRyO1xyXG4gICAgICB1bmNhdWdodEV4Y2VwdGlvbkNvdW50Kys7XHJcbiAgICAgIHRocm93IGV4Y2VwdGlvbkxhc3Q7XHJcbiAgICB9XHJcbiAgICB2YXIgVVRGOERlY29kZXIgPVxyXG4gICAgICB0eXBlb2YgVGV4dERlY29kZXIgIT0gXCJ1bmRlZmluZWRcIiA/IG5ldyBUZXh0RGVjb2RlcihcInV0ZjhcIikgOiB1bmRlZmluZWQ7XHJcbiAgICB2YXIgVVRGOEFycmF5VG9TdHJpbmcgPSAoaGVhcE9yQXJyYXksIGlkeCwgbWF4Qnl0ZXNUb1JlYWQpID0+IHtcclxuICAgICAgaWR4ID4+Pj0gMDtcclxuICAgICAgdmFyIGVuZElkeCA9IGlkeCArIG1heEJ5dGVzVG9SZWFkO1xyXG4gICAgICB2YXIgZW5kUHRyID0gaWR4O1xyXG4gICAgICB3aGlsZSAoaGVhcE9yQXJyYXlbZW5kUHRyXSAmJiAhKGVuZFB0ciA+PSBlbmRJZHgpKSArK2VuZFB0cjtcclxuICAgICAgaWYgKGVuZFB0ciAtIGlkeCA+IDE2ICYmIGhlYXBPckFycmF5LmJ1ZmZlciAmJiBVVEY4RGVjb2Rlcikge1xyXG4gICAgICAgIHJldHVybiBVVEY4RGVjb2Rlci5kZWNvZGUoaGVhcE9yQXJyYXkuc3ViYXJyYXkoaWR4LCBlbmRQdHIpKTtcclxuICAgICAgfVxyXG4gICAgICB2YXIgc3RyID0gXCJcIjtcclxuICAgICAgd2hpbGUgKGlkeCA8IGVuZFB0cikge1xyXG4gICAgICAgIHZhciB1MCA9IGhlYXBPckFycmF5W2lkeCsrXTtcclxuICAgICAgICBpZiAoISh1MCAmIDEyOCkpIHtcclxuICAgICAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKHUwKTtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgdTEgPSBoZWFwT3JBcnJheVtpZHgrK10gJiA2MztcclxuICAgICAgICBpZiAoKHUwICYgMjI0KSA9PSAxOTIpIHtcclxuICAgICAgICAgIHN0ciArPSBTdHJpbmcuZnJvbUNoYXJDb2RlKCgodTAgJiAzMSkgPDwgNikgfCB1MSk7XHJcbiAgICAgICAgICBjb250aW51ZTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHUyID0gaGVhcE9yQXJyYXlbaWR4KytdICYgNjM7XHJcbiAgICAgICAgaWYgKCh1MCAmIDI0MCkgPT0gMjI0KSB7XHJcbiAgICAgICAgICB1MCA9ICgodTAgJiAxNSkgPDwgMTIpIHwgKHUxIDw8IDYpIHwgdTI7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIHUwID1cclxuICAgICAgICAgICAgKCh1MCAmIDcpIDw8IDE4KSB8XHJcbiAgICAgICAgICAgICh1MSA8PCAxMikgfFxyXG4gICAgICAgICAgICAodTIgPDwgNikgfFxyXG4gICAgICAgICAgICAoaGVhcE9yQXJyYXlbaWR4KytdICYgNjMpO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAodTAgPCA2NTUzNikge1xyXG4gICAgICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUodTApO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICB2YXIgY2ggPSB1MCAtIDY1NTM2O1xyXG4gICAgICAgICAgc3RyICs9IFN0cmluZy5mcm9tQ2hhckNvZGUoNTUyOTYgfCAoY2ggPj4gMTApLCA1NjMyMCB8IChjaCAmIDEwMjMpKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHN0cjtcclxuICAgIH07XHJcbiAgICB2YXIgVVRGOFRvU3RyaW5nID0gKHB0ciwgbWF4Qnl0ZXNUb1JlYWQpID0+IHtcclxuICAgICAgcHRyID4+Pj0gMDtcclxuICAgICAgcmV0dXJuIHB0ciA/IFVURjhBcnJheVRvU3RyaW5nKEhFQVBVOCwgcHRyLCBtYXhCeXRlc1RvUmVhZCkgOiBcIlwiO1xyXG4gICAgfTtcclxuICAgIHZhciBTWVNDQUxMUyA9IHtcclxuICAgICAgdmFyYXJnczogdW5kZWZpbmVkLFxyXG4gICAgICBnZXRTdHIocHRyKSB7XHJcbiAgICAgICAgdmFyIHJldCA9IFVURjhUb1N0cmluZyhwdHIpO1xyXG4gICAgICAgIHJldHVybiByZXQ7XHJcbiAgICAgIH0sXHJcbiAgICB9O1xyXG4gICAgZnVuY3Rpb24gX19fc3lzY2FsbF9mY250bDY0KGZkLCBjbWQsIHZhcmFyZ3MpIHtcclxuICAgICAgdmFyYXJncyA+Pj49IDA7XHJcbiAgICAgIFNZU0NBTExTLnZhcmFyZ3MgPSB2YXJhcmdzO1xyXG4gICAgICByZXR1cm4gMDtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIF9fX3N5c2NhbGxfZnN0YXQ2NChmZCwgYnVmKSB7XHJcbiAgICAgIGJ1ZiA+Pj49IDA7XHJcbiAgICB9XHJcbiAgICB2YXIgbGVuZ3RoQnl0ZXNVVEY4ID0gKHN0cikgPT4ge1xyXG4gICAgICB2YXIgbGVuID0gMDtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICB2YXIgYyA9IHN0ci5jaGFyQ29kZUF0KGkpO1xyXG4gICAgICAgIGlmIChjIDw9IDEyNykge1xyXG4gICAgICAgICAgbGVuKys7XHJcbiAgICAgICAgfSBlbHNlIGlmIChjIDw9IDIwNDcpIHtcclxuICAgICAgICAgIGxlbiArPSAyO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoYyA+PSA1NTI5NiAmJiBjIDw9IDU3MzQzKSB7XHJcbiAgICAgICAgICBsZW4gKz0gNDtcclxuICAgICAgICAgICsraTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbGVuICs9IDM7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBsZW47XHJcbiAgICB9O1xyXG4gICAgdmFyIHN0cmluZ1RvVVRGOEFycmF5ID0gKHN0ciwgaGVhcCwgb3V0SWR4LCBtYXhCeXRlc1RvV3JpdGUpID0+IHtcclxuICAgICAgb3V0SWR4ID4+Pj0gMDtcclxuICAgICAgaWYgKCEobWF4Qnl0ZXNUb1dyaXRlID4gMCkpIHJldHVybiAwO1xyXG4gICAgICB2YXIgc3RhcnRJZHggPSBvdXRJZHg7XHJcbiAgICAgIHZhciBlbmRJZHggPSBvdXRJZHggKyBtYXhCeXRlc1RvV3JpdGUgLSAxO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IHN0ci5sZW5ndGg7ICsraSkge1xyXG4gICAgICAgIHZhciB1ID0gc3RyLmNoYXJDb2RlQXQoaSk7XHJcbiAgICAgICAgaWYgKHUgPj0gNTUyOTYgJiYgdSA8PSA1NzM0Mykge1xyXG4gICAgICAgICAgdmFyIHUxID0gc3RyLmNoYXJDb2RlQXQoKytpKTtcclxuICAgICAgICAgIHUgPSAoNjU1MzYgKyAoKHUgJiAxMDIzKSA8PCAxMCkpIHwgKHUxICYgMTAyMyk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh1IDw9IDEyNykge1xyXG4gICAgICAgICAgaWYgKG91dElkeCA+PSBlbmRJZHgpIGJyZWFrO1xyXG4gICAgICAgICAgaGVhcFtvdXRJZHgrKyA+Pj4gMF0gPSB1O1xyXG4gICAgICAgIH0gZWxzZSBpZiAodSA8PSAyMDQ3KSB7XHJcbiAgICAgICAgICBpZiAob3V0SWR4ICsgMSA+PSBlbmRJZHgpIGJyZWFrO1xyXG4gICAgICAgICAgaGVhcFtvdXRJZHgrKyA+Pj4gMF0gPSAxOTIgfCAodSA+PiA2KTtcclxuICAgICAgICAgIGhlYXBbb3V0SWR4KysgPj4+IDBdID0gMTI4IHwgKHUgJiA2Myk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh1IDw9IDY1NTM1KSB7XHJcbiAgICAgICAgICBpZiAob3V0SWR4ICsgMiA+PSBlbmRJZHgpIGJyZWFrO1xyXG4gICAgICAgICAgaGVhcFtvdXRJZHgrKyA+Pj4gMF0gPSAyMjQgfCAodSA+PiAxMik7XHJcbiAgICAgICAgICBoZWFwW291dElkeCsrID4+PiAwXSA9IDEyOCB8ICgodSA+PiA2KSAmIDYzKTtcclxuICAgICAgICAgIGhlYXBbb3V0SWR4KysgPj4+IDBdID0gMTI4IHwgKHUgJiA2Myk7XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGlmIChvdXRJZHggKyAzID49IGVuZElkeCkgYnJlYWs7XHJcbiAgICAgICAgICBoZWFwW291dElkeCsrID4+PiAwXSA9IDI0MCB8ICh1ID4+IDE4KTtcclxuICAgICAgICAgIGhlYXBbb3V0SWR4KysgPj4+IDBdID0gMTI4IHwgKCh1ID4+IDEyKSAmIDYzKTtcclxuICAgICAgICAgIGhlYXBbb3V0SWR4KysgPj4+IDBdID0gMTI4IHwgKCh1ID4+IDYpICYgNjMpO1xyXG4gICAgICAgICAgaGVhcFtvdXRJZHgrKyA+Pj4gMF0gPSAxMjggfCAodSAmIDYzKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgaGVhcFtvdXRJZHggPj4+IDBdID0gMDtcclxuICAgICAgcmV0dXJuIG91dElkeCAtIHN0YXJ0SWR4O1xyXG4gICAgfTtcclxuICAgIHZhciBzdHJpbmdUb1VURjggPSAoc3RyLCBvdXRQdHIsIG1heEJ5dGVzVG9Xcml0ZSkgPT5cclxuICAgICAgc3RyaW5nVG9VVEY4QXJyYXkoc3RyLCBIRUFQVTgsIG91dFB0ciwgbWF4Qnl0ZXNUb1dyaXRlKTtcclxuICAgIGZ1bmN0aW9uIF9fX3N5c2NhbGxfZ2V0Y3dkKGJ1Ziwgc2l6ZSkge1xyXG4gICAgICBidWYgPj4+PSAwO1xyXG4gICAgICBzaXplID4+Pj0gMDtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIF9fX3N5c2NhbGxfZ2V0ZGVudHM2NChmZCwgZGlycCwgY291bnQpIHtcclxuICAgICAgZGlycCA+Pj49IDA7XHJcbiAgICAgIGNvdW50ID4+Pj0gMDtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIF9fX3N5c2NhbGxfaW9jdGwoZmQsIG9wLCB2YXJhcmdzKSB7XHJcbiAgICAgIHZhcmFyZ3MgPj4+PSAwO1xyXG4gICAgICBTWVNDQUxMUy52YXJhcmdzID0gdmFyYXJncztcclxuICAgICAgcmV0dXJuIDA7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBfX19zeXNjYWxsX2xzdGF0NjQocGF0aCwgYnVmKSB7XHJcbiAgICAgIHBhdGggPj4+PSAwO1xyXG4gICAgICBidWYgPj4+PSAwO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gX19fc3lzY2FsbF9ta2RpcmF0KGRpcmZkLCBwYXRoLCBtb2RlKSB7XHJcbiAgICAgIHBhdGggPj4+PSAwO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gX19fc3lzY2FsbF9uZXdmc3RhdGF0KGRpcmZkLCBwYXRoLCBidWYsIGZsYWdzKSB7XHJcbiAgICAgIHBhdGggPj4+PSAwO1xyXG4gICAgICBidWYgPj4+PSAwO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gX19fc3lzY2FsbF9vcGVuYXQoZGlyZmQsIHBhdGgsIGZsYWdzLCB2YXJhcmdzKSB7XHJcbiAgICAgIHBhdGggPj4+PSAwO1xyXG4gICAgICB2YXJhcmdzID4+Pj0gMDtcclxuICAgICAgU1lTQ0FMTFMudmFyYXJncyA9IHZhcmFyZ3M7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBfX19zeXNjYWxsX3JlYWRsaW5rYXQoZGlyZmQsIHBhdGgsIGJ1ZiwgYnVmc2l6ZSkge1xyXG4gICAgICBwYXRoID4+Pj0gMDtcclxuICAgICAgYnVmID4+Pj0gMDtcclxuICAgICAgYnVmc2l6ZSA+Pj49IDA7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBfX19zeXNjYWxsX3JtZGlyKHBhdGgpIHtcclxuICAgICAgcGF0aCA+Pj49IDA7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBfX19zeXNjYWxsX3N0YXQ2NChwYXRoLCBidWYpIHtcclxuICAgICAgcGF0aCA+Pj49IDA7XHJcbiAgICAgIGJ1ZiA+Pj49IDA7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBfX19zeXNjYWxsX3VubGlua2F0KGRpcmZkLCBwYXRoLCBmbGFncykge1xyXG4gICAgICBwYXRoID4+Pj0gMDtcclxuICAgIH1cclxuICAgIHZhciBub3dJc01vbm90b25pYyA9IDE7XHJcbiAgICB2YXIgX19lbXNjcmlwdGVuX2dldF9ub3dfaXNfbW9ub3RvbmljID0gKCkgPT4gbm93SXNNb25vdG9uaWM7XHJcbiAgICBmdW5jdGlvbiBfX2Vtc2NyaXB0ZW5fbWVtY3B5X2pzKGRlc3QsIHNyYywgbnVtKSB7XHJcbiAgICAgIGRlc3QgPj4+PSAwO1xyXG4gICAgICBzcmMgPj4+PSAwO1xyXG4gICAgICBudW0gPj4+PSAwO1xyXG4gICAgICByZXR1cm4gSEVBUFU4LmNvcHlXaXRoaW4oZGVzdCA+Pj4gMCwgc3JjID4+PiAwLCAoc3JjICsgbnVtKSA+Pj4gMCk7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBfX2dtdGltZV9qcyh0aW1lX2xvdywgdGltZV9oaWdoLCB0bVB0cikge1xyXG4gICAgICB2YXIgdGltZSA9IGNvbnZlcnRJMzJQYWlyVG9JNTNDaGVja2VkKHRpbWVfbG93LCB0aW1lX2hpZ2gpO1xyXG4gICAgICB0bVB0ciA+Pj49IDA7XHJcbiAgICAgIHZhciBkYXRlID0gbmV3IERhdGUodGltZSAqIDFlMyk7XHJcbiAgICAgIEhFQVAzMlsodG1QdHIgPj4+IDIpID4+PiAwXSA9IGRhdGUuZ2V0VVRDU2Vjb25kcygpO1xyXG4gICAgICBIRUFQMzJbKCh0bVB0ciArIDQpID4+PiAyKSA+Pj4gMF0gPSBkYXRlLmdldFVUQ01pbnV0ZXMoKTtcclxuICAgICAgSEVBUDMyWygodG1QdHIgKyA4KSA+Pj4gMikgPj4+IDBdID0gZGF0ZS5nZXRVVENIb3VycygpO1xyXG4gICAgICBIRUFQMzJbKCh0bVB0ciArIDEyKSA+Pj4gMikgPj4+IDBdID0gZGF0ZS5nZXRVVENEYXRlKCk7XHJcbiAgICAgIEhFQVAzMlsoKHRtUHRyICsgMTYpID4+PiAyKSA+Pj4gMF0gPSBkYXRlLmdldFVUQ01vbnRoKCk7XHJcbiAgICAgIEhFQVAzMlsoKHRtUHRyICsgMjApID4+PiAyKSA+Pj4gMF0gPSBkYXRlLmdldFVUQ0Z1bGxZZWFyKCkgLSAxOTAwO1xyXG4gICAgICBIRUFQMzJbKCh0bVB0ciArIDI0KSA+Pj4gMikgPj4+IDBdID0gZGF0ZS5nZXRVVENEYXkoKTtcclxuICAgICAgdmFyIHN0YXJ0ID0gRGF0ZS5VVEMoZGF0ZS5nZXRVVENGdWxsWWVhcigpLCAwLCAxLCAwLCAwLCAwLCAwKTtcclxuICAgICAgdmFyIHlkYXkgPSAoKGRhdGUuZ2V0VGltZSgpIC0gc3RhcnQpIC8gKDFlMyAqIDYwICogNjAgKiAyNCkpIHwgMDtcclxuICAgICAgSEVBUDMyWygodG1QdHIgKyAyOCkgPj4+IDIpID4+PiAwXSA9IHlkYXk7XHJcbiAgICB9XHJcbiAgICB2YXIgaXNMZWFwWWVhciA9ICh5ZWFyKSA9PlxyXG4gICAgICB5ZWFyICUgNCA9PT0gMCAmJiAoeWVhciAlIDEwMCAhPT0gMCB8fCB5ZWFyICUgNDAwID09PSAwKTtcclxuICAgIHZhciBNT05USF9EQVlTX0xFQVBfQ1VNVUxBVElWRSA9IFtcclxuICAgICAgMCwgMzEsIDYwLCA5MSwgMTIxLCAxNTIsIDE4MiwgMjEzLCAyNDQsIDI3NCwgMzA1LCAzMzUsXHJcbiAgICBdO1xyXG4gICAgdmFyIE1PTlRIX0RBWVNfUkVHVUxBUl9DVU1VTEFUSVZFID0gW1xyXG4gICAgICAwLCAzMSwgNTksIDkwLCAxMjAsIDE1MSwgMTgxLCAyMTIsIDI0MywgMjczLCAzMDQsIDMzNCxcclxuICAgIF07XHJcbiAgICB2YXIgeWRheUZyb21EYXRlID0gKGRhdGUpID0+IHtcclxuICAgICAgdmFyIGxlYXAgPSBpc0xlYXBZZWFyKGRhdGUuZ2V0RnVsbFllYXIoKSk7XHJcbiAgICAgIHZhciBtb250aERheXNDdW11bGF0aXZlID0gbGVhcFxyXG4gICAgICAgID8gTU9OVEhfREFZU19MRUFQX0NVTVVMQVRJVkVcclxuICAgICAgICA6IE1PTlRIX0RBWVNfUkVHVUxBUl9DVU1VTEFUSVZFO1xyXG4gICAgICB2YXIgeWRheSA9IG1vbnRoRGF5c0N1bXVsYXRpdmVbZGF0ZS5nZXRNb250aCgpXSArIGRhdGUuZ2V0RGF0ZSgpIC0gMTtcclxuICAgICAgcmV0dXJuIHlkYXk7XHJcbiAgICB9O1xyXG4gICAgZnVuY3Rpb24gX19sb2NhbHRpbWVfanModGltZV9sb3csIHRpbWVfaGlnaCwgdG1QdHIpIHtcclxuICAgICAgdmFyIHRpbWUgPSBjb252ZXJ0STMyUGFpclRvSTUzQ2hlY2tlZCh0aW1lX2xvdywgdGltZV9oaWdoKTtcclxuICAgICAgdG1QdHIgPj4+PSAwO1xyXG4gICAgICB2YXIgZGF0ZSA9IG5ldyBEYXRlKHRpbWUgKiAxZTMpO1xyXG4gICAgICBIRUFQMzJbKHRtUHRyID4+PiAyKSA+Pj4gMF0gPSBkYXRlLmdldFNlY29uZHMoKTtcclxuICAgICAgSEVBUDMyWygodG1QdHIgKyA0KSA+Pj4gMikgPj4+IDBdID0gZGF0ZS5nZXRNaW51dGVzKCk7XHJcbiAgICAgIEhFQVAzMlsoKHRtUHRyICsgOCkgPj4+IDIpID4+PiAwXSA9IGRhdGUuZ2V0SG91cnMoKTtcclxuICAgICAgSEVBUDMyWygodG1QdHIgKyAxMikgPj4+IDIpID4+PiAwXSA9IGRhdGUuZ2V0RGF0ZSgpO1xyXG4gICAgICBIRUFQMzJbKCh0bVB0ciArIDE2KSA+Pj4gMikgPj4+IDBdID0gZGF0ZS5nZXRNb250aCgpO1xyXG4gICAgICBIRUFQMzJbKCh0bVB0ciArIDIwKSA+Pj4gMikgPj4+IDBdID0gZGF0ZS5nZXRGdWxsWWVhcigpIC0gMTkwMDtcclxuICAgICAgSEVBUDMyWygodG1QdHIgKyAyNCkgPj4+IDIpID4+PiAwXSA9IGRhdGUuZ2V0RGF5KCk7XHJcbiAgICAgIHZhciB5ZGF5ID0geWRheUZyb21EYXRlKGRhdGUpIHwgMDtcclxuICAgICAgSEVBUDMyWygodG1QdHIgKyAyOCkgPj4+IDIpID4+PiAwXSA9IHlkYXk7XHJcbiAgICAgIEhFQVAzMlsoKHRtUHRyICsgMzYpID4+PiAyKSA+Pj4gMF0gPSAtKGRhdGUuZ2V0VGltZXpvbmVPZmZzZXQoKSAqIDYwKTtcclxuICAgICAgdmFyIHN0YXJ0ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCAwLCAxKTtcclxuICAgICAgdmFyIHN1bW1lck9mZnNldCA9IG5ldyBEYXRlKGRhdGUuZ2V0RnVsbFllYXIoKSwgNiwgMSkuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuICAgICAgdmFyIHdpbnRlck9mZnNldCA9IHN0YXJ0LmdldFRpbWV6b25lT2Zmc2V0KCk7XHJcbiAgICAgIHZhciBkc3QgPVxyXG4gICAgICAgIChzdW1tZXJPZmZzZXQgIT0gd2ludGVyT2Zmc2V0ICYmXHJcbiAgICAgICAgICBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCkgPT0gTWF0aC5taW4od2ludGVyT2Zmc2V0LCBzdW1tZXJPZmZzZXQpKSB8IDA7XHJcbiAgICAgIEhFQVAzMlsoKHRtUHRyICsgMzIpID4+PiAyKSA+Pj4gMF0gPSBkc3Q7XHJcbiAgICB9XHJcbiAgICB2YXIgc2V0VGVtcFJldDAgPSAodmFsKSA9PiBfX2Vtc2NyaXB0ZW5fdGVtcHJldF9zZXQodmFsKTtcclxuICAgIHZhciBfX21rdGltZV9qcyA9IGZ1bmN0aW9uICh0bVB0cikge1xyXG4gICAgICB0bVB0ciA+Pj49IDA7XHJcbiAgICAgIHZhciByZXQgPSAoKCkgPT4ge1xyXG4gICAgICAgIHZhciBkYXRlID0gbmV3IERhdGUoXHJcbiAgICAgICAgICBIRUFQMzJbKCh0bVB0ciArIDIwKSA+Pj4gMikgPj4+IDBdICsgMTkwMCxcclxuICAgICAgICAgIEhFQVAzMlsoKHRtUHRyICsgMTYpID4+PiAyKSA+Pj4gMF0sXHJcbiAgICAgICAgICBIRUFQMzJbKCh0bVB0ciArIDEyKSA+Pj4gMikgPj4+IDBdLFxyXG4gICAgICAgICAgSEVBUDMyWygodG1QdHIgKyA4KSA+Pj4gMikgPj4+IDBdLFxyXG4gICAgICAgICAgSEVBUDMyWygodG1QdHIgKyA0KSA+Pj4gMikgPj4+IDBdLFxyXG4gICAgICAgICAgSEVBUDMyWyh0bVB0ciA+Pj4gMikgPj4+IDBdLFxyXG4gICAgICAgICAgMFxyXG4gICAgICAgICk7XHJcbiAgICAgICAgdmFyIGRzdCA9IEhFQVAzMlsoKHRtUHRyICsgMzIpID4+PiAyKSA+Pj4gMF07XHJcbiAgICAgICAgdmFyIGd1ZXNzZWRPZmZzZXQgPSBkYXRlLmdldFRpbWV6b25lT2Zmc2V0KCk7XHJcbiAgICAgICAgdmFyIHN0YXJ0ID0gbmV3IERhdGUoZGF0ZS5nZXRGdWxsWWVhcigpLCAwLCAxKTtcclxuICAgICAgICB2YXIgc3VtbWVyT2Zmc2V0ID0gbmV3IERhdGUoXHJcbiAgICAgICAgICBkYXRlLmdldEZ1bGxZZWFyKCksXHJcbiAgICAgICAgICA2LFxyXG4gICAgICAgICAgMVxyXG4gICAgICAgICkuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuICAgICAgICB2YXIgd2ludGVyT2Zmc2V0ID0gc3RhcnQuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuICAgICAgICB2YXIgZHN0T2Zmc2V0ID0gTWF0aC5taW4od2ludGVyT2Zmc2V0LCBzdW1tZXJPZmZzZXQpO1xyXG4gICAgICAgIGlmIChkc3QgPCAwKSB7XHJcbiAgICAgICAgICBIRUFQMzJbKCh0bVB0ciArIDMyKSA+Pj4gMikgPj4+IDBdID0gTnVtYmVyKFxyXG4gICAgICAgICAgICBzdW1tZXJPZmZzZXQgIT0gd2ludGVyT2Zmc2V0ICYmIGRzdE9mZnNldCA9PSBndWVzc2VkT2Zmc2V0XHJcbiAgICAgICAgICApO1xyXG4gICAgICAgIH0gZWxzZSBpZiAoZHN0ID4gMCAhPSAoZHN0T2Zmc2V0ID09IGd1ZXNzZWRPZmZzZXQpKSB7XHJcbiAgICAgICAgICB2YXIgbm9uRHN0T2Zmc2V0ID0gTWF0aC5tYXgod2ludGVyT2Zmc2V0LCBzdW1tZXJPZmZzZXQpO1xyXG4gICAgICAgICAgdmFyIHRydWVPZmZzZXQgPSBkc3QgPiAwID8gZHN0T2Zmc2V0IDogbm9uRHN0T2Zmc2V0O1xyXG4gICAgICAgICAgZGF0ZS5zZXRUaW1lKGRhdGUuZ2V0VGltZSgpICsgKHRydWVPZmZzZXQgLSBndWVzc2VkT2Zmc2V0KSAqIDZlNCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIEhFQVAzMlsoKHRtUHRyICsgMjQpID4+PiAyKSA+Pj4gMF0gPSBkYXRlLmdldERheSgpO1xyXG4gICAgICAgIHZhciB5ZGF5ID0geWRheUZyb21EYXRlKGRhdGUpIHwgMDtcclxuICAgICAgICBIRUFQMzJbKCh0bVB0ciArIDI4KSA+Pj4gMikgPj4+IDBdID0geWRheTtcclxuICAgICAgICBIRUFQMzJbKHRtUHRyID4+PiAyKSA+Pj4gMF0gPSBkYXRlLmdldFNlY29uZHMoKTtcclxuICAgICAgICBIRUFQMzJbKCh0bVB0ciArIDQpID4+PiAyKSA+Pj4gMF0gPSBkYXRlLmdldE1pbnV0ZXMoKTtcclxuICAgICAgICBIRUFQMzJbKCh0bVB0ciArIDgpID4+PiAyKSA+Pj4gMF0gPSBkYXRlLmdldEhvdXJzKCk7XHJcbiAgICAgICAgSEVBUDMyWygodG1QdHIgKyAxMikgPj4+IDIpID4+PiAwXSA9IGRhdGUuZ2V0RGF0ZSgpO1xyXG4gICAgICAgIEhFQVAzMlsoKHRtUHRyICsgMTYpID4+PiAyKSA+Pj4gMF0gPSBkYXRlLmdldE1vbnRoKCk7XHJcbiAgICAgICAgSEVBUDMyWygodG1QdHIgKyAyMCkgPj4+IDIpID4+PiAwXSA9IGRhdGUuZ2V0WWVhcigpO1xyXG4gICAgICAgIHZhciB0aW1lTXMgPSBkYXRlLmdldFRpbWUoKTtcclxuICAgICAgICBpZiAoaXNOYU4odGltZU1zKSkge1xyXG4gICAgICAgICAgcmV0dXJuIC0xO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGltZU1zIC8gMWUzO1xyXG4gICAgICB9KSgpO1xyXG4gICAgICByZXR1cm4gKFxyXG4gICAgICAgIHNldFRlbXBSZXQwKFxyXG4gICAgICAgICAgKCh0ZW1wRG91YmxlID0gcmV0KSxcclxuICAgICAgICAgICtNYXRoLmFicyh0ZW1wRG91YmxlKSA+PSAxXHJcbiAgICAgICAgICAgID8gdGVtcERvdWJsZSA+IDBcclxuICAgICAgICAgICAgICA/ICtNYXRoLmZsb29yKHRlbXBEb3VibGUgLyA0Mjk0OTY3Mjk2KSA+Pj4gMFxyXG4gICAgICAgICAgICAgIDogfn4rTWF0aC5jZWlsKFxyXG4gICAgICAgICAgICAgICAgICAodGVtcERvdWJsZSAtICsofn50ZW1wRG91YmxlID4+PiAwKSkgLyA0Mjk0OTY3Mjk2XHJcbiAgICAgICAgICAgICAgICApID4+PiAwXHJcbiAgICAgICAgICAgIDogMClcclxuICAgICAgICApLFxyXG4gICAgICAgIHJldCA+Pj4gMFxyXG4gICAgICApO1xyXG4gICAgfTtcclxuICAgIGZ1bmN0aW9uIF9fbW1hcF9qcyhcclxuICAgICAgbGVuLFxyXG4gICAgICBwcm90LFxyXG4gICAgICBmbGFncyxcclxuICAgICAgZmQsXHJcbiAgICAgIG9mZnNldF9sb3csXHJcbiAgICAgIG9mZnNldF9oaWdoLFxyXG4gICAgICBhbGxvY2F0ZWQsXHJcbiAgICAgIGFkZHJcclxuICAgICkge1xyXG4gICAgICBsZW4gPj4+PSAwO1xyXG4gICAgICB2YXIgb2Zmc2V0ID0gY29udmVydEkzMlBhaXJUb0k1M0NoZWNrZWQob2Zmc2V0X2xvdywgb2Zmc2V0X2hpZ2gpO1xyXG4gICAgICBhbGxvY2F0ZWQgPj4+PSAwO1xyXG4gICAgICBhZGRyID4+Pj0gMDtcclxuICAgICAgcmV0dXJuIC01MjtcclxuICAgIH1cclxuICAgIGZ1bmN0aW9uIF9fbXVubWFwX2pzKGFkZHIsIGxlbiwgcHJvdCwgZmxhZ3MsIGZkLCBvZmZzZXRfbG93LCBvZmZzZXRfaGlnaCkge1xyXG4gICAgICBhZGRyID4+Pj0gMDtcclxuICAgICAgbGVuID4+Pj0gMDtcclxuICAgICAgdmFyIG9mZnNldCA9IGNvbnZlcnRJMzJQYWlyVG9JNTNDaGVja2VkKG9mZnNldF9sb3csIG9mZnNldF9oaWdoKTtcclxuICAgIH1cclxuICAgIHZhciBfX3R6c2V0X2pzID0gZnVuY3Rpb24gKHRpbWV6b25lLCBkYXlsaWdodCwgc3RkX25hbWUsIGRzdF9uYW1lKSB7XHJcbiAgICAgIHRpbWV6b25lID4+Pj0gMDtcclxuICAgICAgZGF5bGlnaHQgPj4+PSAwO1xyXG4gICAgICBzdGRfbmFtZSA+Pj49IDA7XHJcbiAgICAgIGRzdF9uYW1lID4+Pj0gMDtcclxuICAgICAgdmFyIGN1cnJlbnRZZWFyID0gbmV3IERhdGUoKS5nZXRGdWxsWWVhcigpO1xyXG4gICAgICB2YXIgd2ludGVyID0gbmV3IERhdGUoY3VycmVudFllYXIsIDAsIDEpO1xyXG4gICAgICB2YXIgc3VtbWVyID0gbmV3IERhdGUoY3VycmVudFllYXIsIDYsIDEpO1xyXG4gICAgICB2YXIgd2ludGVyT2Zmc2V0ID0gd2ludGVyLmdldFRpbWV6b25lT2Zmc2V0KCk7XHJcbiAgICAgIHZhciBzdW1tZXJPZmZzZXQgPSBzdW1tZXIuZ2V0VGltZXpvbmVPZmZzZXQoKTtcclxuICAgICAgdmFyIHN0ZFRpbWV6b25lT2Zmc2V0ID0gTWF0aC5tYXgod2ludGVyT2Zmc2V0LCBzdW1tZXJPZmZzZXQpO1xyXG4gICAgICBIRUFQVTMyWyh0aW1lem9uZSA+Pj4gMikgPj4+IDBdID0gc3RkVGltZXpvbmVPZmZzZXQgKiA2MDtcclxuICAgICAgSEVBUDMyWyhkYXlsaWdodCA+Pj4gMikgPj4+IDBdID0gTnVtYmVyKHdpbnRlck9mZnNldCAhPSBzdW1tZXJPZmZzZXQpO1xyXG4gICAgICB2YXIgZXh0cmFjdFpvbmUgPSAoZGF0ZSkgPT5cclxuICAgICAgICBkYXRlXHJcbiAgICAgICAgICAudG9Mb2NhbGVUaW1lU3RyaW5nKHVuZGVmaW5lZCwge1xyXG4gICAgICAgICAgICBob3VyMTI6IGZhbHNlLFxyXG4gICAgICAgICAgICB0aW1lWm9uZU5hbWU6IFwic2hvcnRcIixcclxuICAgICAgICAgIH0pXHJcbiAgICAgICAgICAuc3BsaXQoXCIgXCIpWzFdO1xyXG4gICAgICB2YXIgd2ludGVyTmFtZSA9IGV4dHJhY3Rab25lKHdpbnRlcik7XHJcbiAgICAgIHZhciBzdW1tZXJOYW1lID0gZXh0cmFjdFpvbmUoc3VtbWVyKTtcclxuICAgICAgaWYgKHN1bW1lck9mZnNldCA8IHdpbnRlck9mZnNldCkge1xyXG4gICAgICAgIHN0cmluZ1RvVVRGOCh3aW50ZXJOYW1lLCBzdGRfbmFtZSwgMTcpO1xyXG4gICAgICAgIHN0cmluZ1RvVVRGOChzdW1tZXJOYW1lLCBkc3RfbmFtZSwgMTcpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIHN0cmluZ1RvVVRGOCh3aW50ZXJOYW1lLCBkc3RfbmFtZSwgMTcpO1xyXG4gICAgICAgIHN0cmluZ1RvVVRGOChzdW1tZXJOYW1lLCBzdGRfbmFtZSwgMTcpO1xyXG4gICAgICB9XHJcbiAgICB9O1xyXG4gICAgdmFyIF9hYm9ydCA9ICgpID0+IHtcclxuICAgICAgYWJvcnQoXCJcIik7XHJcbiAgICB9O1xyXG4gICAgdmFyIHJlYWRFbUFzbUFyZ3NBcnJheSA9IFtdO1xyXG4gICAgdmFyIHJlYWRFbUFzbUFyZ3MgPSAoc2lnUHRyLCBidWYpID0+IHtcclxuICAgICAgcmVhZEVtQXNtQXJnc0FycmF5Lmxlbmd0aCA9IDA7XHJcbiAgICAgIHZhciBjaDtcclxuICAgICAgd2hpbGUgKChjaCA9IEhFQVBVOFtzaWdQdHIrKyA+Pj4gMF0pKSB7XHJcbiAgICAgICAgdmFyIHdpZGUgPSBjaCAhPSAxMDU7XHJcbiAgICAgICAgd2lkZSAmPSBjaCAhPSAxMTI7XHJcbiAgICAgICAgYnVmICs9IHdpZGUgJiYgYnVmICUgOCA/IDQgOiAwO1xyXG4gICAgICAgIHJlYWRFbUFzbUFyZ3NBcnJheS5wdXNoKFxyXG4gICAgICAgICAgY2ggPT0gMTEyXHJcbiAgICAgICAgICAgID8gSEVBUFUzMlsoYnVmID4+PiAyKSA+Pj4gMF1cclxuICAgICAgICAgICAgOiBjaCA9PSAxMDVcclxuICAgICAgICAgICAgPyBIRUFQMzJbKGJ1ZiA+Pj4gMikgPj4+IDBdXHJcbiAgICAgICAgICAgIDogSEVBUEY2NFsoYnVmID4+PiAzKSA+Pj4gMF1cclxuICAgICAgICApO1xyXG4gICAgICAgIGJ1ZiArPSB3aWRlID8gOCA6IDQ7XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIHJlYWRFbUFzbUFyZ3NBcnJheTtcclxuICAgIH07XHJcbiAgICB2YXIgcnVuRW1Bc21GdW5jdGlvbiA9IChjb2RlLCBzaWdQdHIsIGFyZ2J1ZikgPT4ge1xyXG4gICAgICB2YXIgYXJncyA9IHJlYWRFbUFzbUFyZ3Moc2lnUHRyLCBhcmdidWYpO1xyXG4gICAgICByZXR1cm4gQVNNX0NPTlNUU1tjb2RlXSguLi5hcmdzKTtcclxuICAgIH07XHJcbiAgICBmdW5jdGlvbiBfZW1zY3JpcHRlbl9hc21fY29uc3RfaW50KGNvZGUsIHNpZ1B0ciwgYXJnYnVmKSB7XHJcbiAgICAgIGNvZGUgPj4+PSAwO1xyXG4gICAgICBzaWdQdHIgPj4+PSAwO1xyXG4gICAgICBhcmdidWYgPj4+PSAwO1xyXG4gICAgICByZXR1cm4gcnVuRW1Bc21GdW5jdGlvbihjb2RlLCBzaWdQdHIsIGFyZ2J1Zik7XHJcbiAgICB9XHJcbiAgICB2YXIgX2Vtc2NyaXB0ZW5fZGF0ZV9ub3cgPSAoKSA9PiBEYXRlLm5vdygpO1xyXG4gICAgdmFyIGdldEhlYXBNYXggPSAoKSA9PiA0Mjk0OTAxNzYwO1xyXG4gICAgZnVuY3Rpb24gX2Vtc2NyaXB0ZW5fZ2V0X2hlYXBfbWF4KCkge1xyXG4gICAgICByZXR1cm4gZ2V0SGVhcE1heCgpO1xyXG4gICAgfVxyXG4gICAgdmFyIF9lbXNjcmlwdGVuX2dldF9ub3c7XHJcbiAgICBfZW1zY3JpcHRlbl9nZXRfbm93ID0gKCkgPT4gcGVyZm9ybWFuY2Uubm93KCk7XHJcbiAgICB2YXIgZ3Jvd01lbW9yeSA9IChzaXplKSA9PiB7XHJcbiAgICAgIHZhciBiID0gd2FzbU1lbW9yeS5idWZmZXI7XHJcbiAgICAgIHZhciBwYWdlcyA9IChzaXplIC0gYi5ieXRlTGVuZ3RoICsgNjU1MzUpIC8gNjU1MzY7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgd2FzbU1lbW9yeS5ncm93KHBhZ2VzKTtcclxuICAgICAgICB1cGRhdGVNZW1vcnlWaWV3cygpO1xyXG4gICAgICAgIHJldHVybiAxO1xyXG4gICAgICB9IGNhdGNoIChlKSB7fVxyXG4gICAgfTtcclxuICAgIGZ1bmN0aW9uIF9lbXNjcmlwdGVuX3Jlc2l6ZV9oZWFwKHJlcXVlc3RlZFNpemUpIHtcclxuICAgICAgcmVxdWVzdGVkU2l6ZSA+Pj49IDA7XHJcbiAgICAgIHZhciBvbGRTaXplID0gSEVBUFU4Lmxlbmd0aDtcclxuICAgICAgdmFyIG1heEhlYXBTaXplID0gZ2V0SGVhcE1heCgpO1xyXG4gICAgICBpZiAocmVxdWVzdGVkU2l6ZSA+IG1heEhlYXBTaXplKSB7XHJcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBhbGlnblVwID0gKHgsIG11bHRpcGxlKSA9PlxyXG4gICAgICAgIHggKyAoKG11bHRpcGxlIC0gKHggJSBtdWx0aXBsZSkpICUgbXVsdGlwbGUpO1xyXG4gICAgICBmb3IgKHZhciBjdXREb3duID0gMTsgY3V0RG93biA8PSA0OyBjdXREb3duICo9IDIpIHtcclxuICAgICAgICB2YXIgb3Zlckdyb3duSGVhcFNpemUgPSBvbGRTaXplICogKDEgKyAwLjIgLyBjdXREb3duKTtcclxuICAgICAgICBvdmVyR3Jvd25IZWFwU2l6ZSA9IE1hdGgubWluKFxyXG4gICAgICAgICAgb3Zlckdyb3duSGVhcFNpemUsXHJcbiAgICAgICAgICByZXF1ZXN0ZWRTaXplICsgMTAwNjYzMjk2XHJcbiAgICAgICAgKTtcclxuICAgICAgICB2YXIgbmV3U2l6ZSA9IE1hdGgubWluKFxyXG4gICAgICAgICAgbWF4SGVhcFNpemUsXHJcbiAgICAgICAgICBhbGlnblVwKE1hdGgubWF4KHJlcXVlc3RlZFNpemUsIG92ZXJHcm93bkhlYXBTaXplKSwgNjU1MzYpXHJcbiAgICAgICAgKTtcclxuICAgICAgICB2YXIgcmVwbGFjZW1lbnQgPSBncm93TWVtb3J5KG5ld1NpemUpO1xyXG4gICAgICAgIGlmIChyZXBsYWNlbWVudCkge1xyXG4gICAgICAgICAgcmV0dXJuIHRydWU7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBmYWxzZTtcclxuICAgIH1cclxuICAgIHZhciBFTlYgPSB7fTtcclxuICAgIHZhciBnZXRFeGVjdXRhYmxlTmFtZSA9ICgpID0+IHRoaXNQcm9ncmFtIHx8IFwiLi90aGlzLnByb2dyYW1cIjtcclxuICAgIHZhciBnZXRFbnZTdHJpbmdzID0gKCkgPT4ge1xyXG4gICAgICBpZiAoIWdldEVudlN0cmluZ3Muc3RyaW5ncykge1xyXG4gICAgICAgIHZhciBsYW5nID1cclxuICAgICAgICAgIChcclxuICAgICAgICAgICAgKHR5cGVvZiBuYXZpZ2F0b3IgPT0gXCJvYmplY3RcIiAmJlxyXG4gICAgICAgICAgICAgIG5hdmlnYXRvci5sYW5ndWFnZXMgJiZcclxuICAgICAgICAgICAgICBuYXZpZ2F0b3IubGFuZ3VhZ2VzWzBdKSB8fFxyXG4gICAgICAgICAgICBcIkNcIlxyXG4gICAgICAgICAgKS5yZXBsYWNlKFwiLVwiLCBcIl9cIikgKyBcIi5VVEYtOFwiO1xyXG4gICAgICAgIHZhciBlbnYgPSB7XHJcbiAgICAgICAgICBVU0VSOiBcIndlYl91c2VyXCIsXHJcbiAgICAgICAgICBMT0dOQU1FOiBcIndlYl91c2VyXCIsXHJcbiAgICAgICAgICBQQVRIOiBcIi9cIixcclxuICAgICAgICAgIFBXRDogXCIvXCIsXHJcbiAgICAgICAgICBIT01FOiBcIi9ob21lL3dlYl91c2VyXCIsXHJcbiAgICAgICAgICBMQU5HOiBsYW5nLFxyXG4gICAgICAgICAgXzogZ2V0RXhlY3V0YWJsZU5hbWUoKSxcclxuICAgICAgICB9O1xyXG4gICAgICAgIGZvciAodmFyIHggaW4gRU5WKSB7XHJcbiAgICAgICAgICBpZiAoRU5WW3hdID09PSB1bmRlZmluZWQpIGRlbGV0ZSBlbnZbeF07XHJcbiAgICAgICAgICBlbHNlIGVudlt4XSA9IEVOVlt4XTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdmFyIHN0cmluZ3MgPSBbXTtcclxuICAgICAgICBmb3IgKHZhciB4IGluIGVudikge1xyXG4gICAgICAgICAgc3RyaW5ncy5wdXNoKGAke3h9PSR7ZW52W3hdfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBnZXRFbnZTdHJpbmdzLnN0cmluZ3MgPSBzdHJpbmdzO1xyXG4gICAgICB9XHJcbiAgICAgIHJldHVybiBnZXRFbnZTdHJpbmdzLnN0cmluZ3M7XHJcbiAgICB9O1xyXG4gICAgdmFyIHN0cmluZ1RvQXNjaWkgPSAoc3RyLCBidWZmZXIpID0+IHtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBzdHIubGVuZ3RoOyArK2kpIHtcclxuICAgICAgICBIRUFQOFtidWZmZXIrKyA+Pj4gMF0gPSBzdHIuY2hhckNvZGVBdChpKTtcclxuICAgICAgfVxyXG4gICAgICBIRUFQOFtidWZmZXIgPj4+IDBdID0gMDtcclxuICAgIH07XHJcbiAgICB2YXIgX2Vudmlyb25fZ2V0ID0gZnVuY3Rpb24gKF9fZW52aXJvbiwgZW52aXJvbl9idWYpIHtcclxuICAgICAgX19lbnZpcm9uID4+Pj0gMDtcclxuICAgICAgZW52aXJvbl9idWYgPj4+PSAwO1xyXG4gICAgICB2YXIgYnVmU2l6ZSA9IDA7XHJcbiAgICAgIGdldEVudlN0cmluZ3MoKS5mb3JFYWNoKChzdHJpbmcsIGkpID0+IHtcclxuICAgICAgICB2YXIgcHRyID0gZW52aXJvbl9idWYgKyBidWZTaXplO1xyXG4gICAgICAgIEhFQVBVMzJbKChfX2Vudmlyb24gKyBpICogNCkgPj4+IDIpID4+PiAwXSA9IHB0cjtcclxuICAgICAgICBzdHJpbmdUb0FzY2lpKHN0cmluZywgcHRyKTtcclxuICAgICAgICBidWZTaXplICs9IHN0cmluZy5sZW5ndGggKyAxO1xyXG4gICAgICB9KTtcclxuICAgICAgcmV0dXJuIDA7XHJcbiAgICB9O1xyXG4gICAgdmFyIF9lbnZpcm9uX3NpemVzX2dldCA9IGZ1bmN0aW9uIChwZW52aXJvbl9jb3VudCwgcGVudmlyb25fYnVmX3NpemUpIHtcclxuICAgICAgcGVudmlyb25fY291bnQgPj4+PSAwO1xyXG4gICAgICBwZW52aXJvbl9idWZfc2l6ZSA+Pj49IDA7XHJcbiAgICAgIHZhciBzdHJpbmdzID0gZ2V0RW52U3RyaW5ncygpO1xyXG4gICAgICBIRUFQVTMyWyhwZW52aXJvbl9jb3VudCA+Pj4gMikgPj4+IDBdID0gc3RyaW5ncy5sZW5ndGg7XHJcbiAgICAgIHZhciBidWZTaXplID0gMDtcclxuICAgICAgc3RyaW5ncy5mb3JFYWNoKChzdHJpbmcpID0+IChidWZTaXplICs9IHN0cmluZy5sZW5ndGggKyAxKSk7XHJcbiAgICAgIEhFQVBVMzJbKHBlbnZpcm9uX2J1Zl9zaXplID4+PiAyKSA+Pj4gMF0gPSBidWZTaXplO1xyXG4gICAgICByZXR1cm4gMDtcclxuICAgIH07XHJcbiAgICB2YXIgX2ZkX2Nsb3NlID0gKGZkKSA9PiA1MjtcclxuICAgIGZ1bmN0aW9uIF9mZF9yZWFkKGZkLCBpb3YsIGlvdmNudCwgcG51bSkge1xyXG4gICAgICBpb3YgPj4+PSAwO1xyXG4gICAgICBpb3ZjbnQgPj4+PSAwO1xyXG4gICAgICBwbnVtID4+Pj0gMDtcclxuICAgICAgcmV0dXJuIDUyO1xyXG4gICAgfVxyXG4gICAgZnVuY3Rpb24gX2ZkX3NlZWsoZmQsIG9mZnNldF9sb3csIG9mZnNldF9oaWdoLCB3aGVuY2UsIG5ld09mZnNldCkge1xyXG4gICAgICB2YXIgb2Zmc2V0ID0gY29udmVydEkzMlBhaXJUb0k1M0NoZWNrZWQob2Zmc2V0X2xvdywgb2Zmc2V0X2hpZ2gpO1xyXG4gICAgICBuZXdPZmZzZXQgPj4+PSAwO1xyXG4gICAgICByZXR1cm4gNzA7XHJcbiAgICB9XHJcbiAgICB2YXIgcHJpbnRDaGFyQnVmZmVycyA9IFtudWxsLCBbXSwgW11dO1xyXG4gICAgdmFyIHByaW50Q2hhciA9IChzdHJlYW0sIGN1cnIpID0+IHtcclxuICAgICAgdmFyIGJ1ZmZlciA9IHByaW50Q2hhckJ1ZmZlcnNbc3RyZWFtXTtcclxuICAgICAgaWYgKGN1cnIgPT09IDAgfHwgY3VyciA9PT0gMTApIHtcclxuICAgICAgICAoc3RyZWFtID09PSAxID8gb3V0IDogZXJyKShVVEY4QXJyYXlUb1N0cmluZyhidWZmZXIsIDApKTtcclxuICAgICAgICBidWZmZXIubGVuZ3RoID0gMDtcclxuICAgICAgfSBlbHNlIHtcclxuICAgICAgICBidWZmZXIucHVzaChjdXJyKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuICAgIGZ1bmN0aW9uIF9mZF93cml0ZShmZCwgaW92LCBpb3ZjbnQsIHBudW0pIHtcclxuICAgICAgaW92ID4+Pj0gMDtcclxuICAgICAgaW92Y250ID4+Pj0gMDtcclxuICAgICAgcG51bSA+Pj49IDA7XHJcbiAgICAgIHZhciBudW0gPSAwO1xyXG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGlvdmNudDsgaSsrKSB7XHJcbiAgICAgICAgdmFyIHB0ciA9IEhFQVBVMzJbKGlvdiA+Pj4gMikgPj4+IDBdO1xyXG4gICAgICAgIHZhciBsZW4gPSBIRUFQVTMyWygoaW92ICsgNCkgPj4+IDIpID4+PiAwXTtcclxuICAgICAgICBpb3YgKz0gODtcclxuICAgICAgICBmb3IgKHZhciBqID0gMDsgaiA8IGxlbjsgaisrKSB7XHJcbiAgICAgICAgICBwcmludENoYXIoZmQsIEhFQVBVOFsocHRyICsgaikgPj4+IDBdKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgbnVtICs9IGxlbjtcclxuICAgICAgfVxyXG4gICAgICBIRUFQVTMyWyhwbnVtID4+PiAyKSA+Pj4gMF0gPSBudW07XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgfVxyXG4gICAgdmFyIGFycmF5U3VtID0gKGFycmF5LCBpbmRleCkgPT4ge1xyXG4gICAgICB2YXIgc3VtID0gMDtcclxuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPD0gaW5kZXg7IHN1bSArPSBhcnJheVtpKytdKSB7fVxyXG4gICAgICByZXR1cm4gc3VtO1xyXG4gICAgfTtcclxuICAgIHZhciBNT05USF9EQVlTX0xFQVAgPSBbMzEsIDI5LCAzMSwgMzAsIDMxLCAzMCwgMzEsIDMxLCAzMCwgMzEsIDMwLCAzMV07XHJcbiAgICB2YXIgTU9OVEhfREFZU19SRUdVTEFSID0gWzMxLCAyOCwgMzEsIDMwLCAzMSwgMzAsIDMxLCAzMSwgMzAsIDMxLCAzMCwgMzFdO1xyXG4gICAgdmFyIGFkZERheXMgPSAoZGF0ZSwgZGF5cykgPT4ge1xyXG4gICAgICB2YXIgbmV3RGF0ZSA9IG5ldyBEYXRlKGRhdGUuZ2V0VGltZSgpKTtcclxuICAgICAgd2hpbGUgKGRheXMgPiAwKSB7XHJcbiAgICAgICAgdmFyIGxlYXAgPSBpc0xlYXBZZWFyKG5ld0RhdGUuZ2V0RnVsbFllYXIoKSk7XHJcbiAgICAgICAgdmFyIGN1cnJlbnRNb250aCA9IG5ld0RhdGUuZ2V0TW9udGgoKTtcclxuICAgICAgICB2YXIgZGF5c0luQ3VycmVudE1vbnRoID0gKGxlYXAgPyBNT05USF9EQVlTX0xFQVAgOiBNT05USF9EQVlTX1JFR1VMQVIpW1xyXG4gICAgICAgICAgY3VycmVudE1vbnRoXHJcbiAgICAgICAgXTtcclxuICAgICAgICBpZiAoZGF5cyA+IGRheXNJbkN1cnJlbnRNb250aCAtIG5ld0RhdGUuZ2V0RGF0ZSgpKSB7XHJcbiAgICAgICAgICBkYXlzIC09IGRheXNJbkN1cnJlbnRNb250aCAtIG5ld0RhdGUuZ2V0RGF0ZSgpICsgMTtcclxuICAgICAgICAgIG5ld0RhdGUuc2V0RGF0ZSgxKTtcclxuICAgICAgICAgIGlmIChjdXJyZW50TW9udGggPCAxMSkge1xyXG4gICAgICAgICAgICBuZXdEYXRlLnNldE1vbnRoKGN1cnJlbnRNb250aCArIDEpO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgbmV3RGF0ZS5zZXRNb250aCgwKTtcclxuICAgICAgICAgICAgbmV3RGF0ZS5zZXRGdWxsWWVhcihuZXdEYXRlLmdldEZ1bGxZZWFyKCkgKyAxKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgbmV3RGF0ZS5zZXREYXRlKG5ld0RhdGUuZ2V0RGF0ZSgpICsgZGF5cyk7XHJcbiAgICAgICAgICByZXR1cm4gbmV3RGF0ZTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgcmV0dXJuIG5ld0RhdGU7XHJcbiAgICB9O1xyXG4gICAgZnVuY3Rpb24gaW50QXJyYXlGcm9tU3RyaW5nKHN0cmluZ3ksIGRvbnRBZGROdWxsLCBsZW5ndGgpIHtcclxuICAgICAgdmFyIGxlbiA9IGxlbmd0aCA+IDAgPyBsZW5ndGggOiBsZW5ndGhCeXRlc1VURjgoc3RyaW5neSkgKyAxO1xyXG4gICAgICB2YXIgdThhcnJheSA9IG5ldyBBcnJheShsZW4pO1xyXG4gICAgICB2YXIgbnVtQnl0ZXNXcml0dGVuID0gc3RyaW5nVG9VVEY4QXJyYXkoXHJcbiAgICAgICAgc3RyaW5neSxcclxuICAgICAgICB1OGFycmF5LFxyXG4gICAgICAgIDAsXHJcbiAgICAgICAgdThhcnJheS5sZW5ndGhcclxuICAgICAgKTtcclxuICAgICAgaWYgKGRvbnRBZGROdWxsKSB1OGFycmF5Lmxlbmd0aCA9IG51bUJ5dGVzV3JpdHRlbjtcclxuICAgICAgcmV0dXJuIHU4YXJyYXk7XHJcbiAgICB9XHJcbiAgICB2YXIgd3JpdGVBcnJheVRvTWVtb3J5ID0gKGFycmF5LCBidWZmZXIpID0+IHtcclxuICAgICAgSEVBUDguc2V0KGFycmF5LCBidWZmZXIgPj4+IDApO1xyXG4gICAgfTtcclxuICAgIGZ1bmN0aW9uIF9zdHJmdGltZShzLCBtYXhzaXplLCBmb3JtYXQsIHRtKSB7XHJcbiAgICAgIHMgPj4+PSAwO1xyXG4gICAgICBtYXhzaXplID4+Pj0gMDtcclxuICAgICAgZm9ybWF0ID4+Pj0gMDtcclxuICAgICAgdG0gPj4+PSAwO1xyXG4gICAgICB2YXIgdG1fem9uZSA9IEhFQVBVMzJbKCh0bSArIDQwKSA+Pj4gMikgPj4+IDBdO1xyXG4gICAgICB2YXIgZGF0ZSA9IHtcclxuICAgICAgICB0bV9zZWM6IEhFQVAzMlsodG0gPj4+IDIpID4+PiAwXSxcclxuICAgICAgICB0bV9taW46IEhFQVAzMlsoKHRtICsgNCkgPj4+IDIpID4+PiAwXSxcclxuICAgICAgICB0bV9ob3VyOiBIRUFQMzJbKCh0bSArIDgpID4+PiAyKSA+Pj4gMF0sXHJcbiAgICAgICAgdG1fbWRheTogSEVBUDMyWygodG0gKyAxMikgPj4+IDIpID4+PiAwXSxcclxuICAgICAgICB0bV9tb246IEhFQVAzMlsoKHRtICsgMTYpID4+PiAyKSA+Pj4gMF0sXHJcbiAgICAgICAgdG1feWVhcjogSEVBUDMyWygodG0gKyAyMCkgPj4+IDIpID4+PiAwXSxcclxuICAgICAgICB0bV93ZGF5OiBIRUFQMzJbKCh0bSArIDI0KSA+Pj4gMikgPj4+IDBdLFxyXG4gICAgICAgIHRtX3lkYXk6IEhFQVAzMlsoKHRtICsgMjgpID4+PiAyKSA+Pj4gMF0sXHJcbiAgICAgICAgdG1faXNkc3Q6IEhFQVAzMlsoKHRtICsgMzIpID4+PiAyKSA+Pj4gMF0sXHJcbiAgICAgICAgdG1fZ210b2ZmOiBIRUFQMzJbKCh0bSArIDM2KSA+Pj4gMikgPj4+IDBdLFxyXG4gICAgICAgIHRtX3pvbmU6IHRtX3pvbmUgPyBVVEY4VG9TdHJpbmcodG1fem9uZSkgOiBcIlwiLFxyXG4gICAgICB9O1xyXG4gICAgICB2YXIgcGF0dGVybiA9IFVURjhUb1N0cmluZyhmb3JtYXQpO1xyXG4gICAgICB2YXIgRVhQQU5TSU9OX1JVTEVTXzEgPSB7XHJcbiAgICAgICAgXCIlY1wiOiBcIiVhICViICVkICVIOiVNOiVTICVZXCIsXHJcbiAgICAgICAgXCIlRFwiOiBcIiVtLyVkLyV5XCIsXHJcbiAgICAgICAgXCIlRlwiOiBcIiVZLSVtLSVkXCIsXHJcbiAgICAgICAgXCIlaFwiOiBcIiViXCIsXHJcbiAgICAgICAgXCIlclwiOiBcIiVJOiVNOiVTICVwXCIsXHJcbiAgICAgICAgXCIlUlwiOiBcIiVIOiVNXCIsXHJcbiAgICAgICAgXCIlVFwiOiBcIiVIOiVNOiVTXCIsXHJcbiAgICAgICAgXCIleFwiOiBcIiVtLyVkLyV5XCIsXHJcbiAgICAgICAgXCIlWFwiOiBcIiVIOiVNOiVTXCIsXHJcbiAgICAgICAgXCIlRWNcIjogXCIlY1wiLFxyXG4gICAgICAgIFwiJUVDXCI6IFwiJUNcIixcclxuICAgICAgICBcIiVFeFwiOiBcIiVtLyVkLyV5XCIsXHJcbiAgICAgICAgXCIlRVhcIjogXCIlSDolTTolU1wiLFxyXG4gICAgICAgIFwiJUV5XCI6IFwiJXlcIixcclxuICAgICAgICBcIiVFWVwiOiBcIiVZXCIsXHJcbiAgICAgICAgXCIlT2RcIjogXCIlZFwiLFxyXG4gICAgICAgIFwiJU9lXCI6IFwiJWVcIixcclxuICAgICAgICBcIiVPSFwiOiBcIiVIXCIsXHJcbiAgICAgICAgXCIlT0lcIjogXCIlSVwiLFxyXG4gICAgICAgIFwiJU9tXCI6IFwiJW1cIixcclxuICAgICAgICBcIiVPTVwiOiBcIiVNXCIsXHJcbiAgICAgICAgXCIlT1NcIjogXCIlU1wiLFxyXG4gICAgICAgIFwiJU91XCI6IFwiJXVcIixcclxuICAgICAgICBcIiVPVVwiOiBcIiVVXCIsXHJcbiAgICAgICAgXCIlT1ZcIjogXCIlVlwiLFxyXG4gICAgICAgIFwiJU93XCI6IFwiJXdcIixcclxuICAgICAgICBcIiVPV1wiOiBcIiVXXCIsXHJcbiAgICAgICAgXCIlT3lcIjogXCIleVwiLFxyXG4gICAgICB9O1xyXG4gICAgICBmb3IgKHZhciBydWxlIGluIEVYUEFOU0lPTl9SVUxFU18xKSB7XHJcbiAgICAgICAgcGF0dGVybiA9IHBhdHRlcm4ucmVwbGFjZShcclxuICAgICAgICAgIG5ldyBSZWdFeHAocnVsZSwgXCJnXCIpLFxyXG4gICAgICAgICAgRVhQQU5TSU9OX1JVTEVTXzFbcnVsZV1cclxuICAgICAgICApO1xyXG4gICAgICB9XHJcbiAgICAgIHZhciBXRUVLREFZUyA9IFtcclxuICAgICAgICBcIlN1bmRheVwiLFxyXG4gICAgICAgIFwiTW9uZGF5XCIsXHJcbiAgICAgICAgXCJUdWVzZGF5XCIsXHJcbiAgICAgICAgXCJXZWRuZXNkYXlcIixcclxuICAgICAgICBcIlRodXJzZGF5XCIsXHJcbiAgICAgICAgXCJGcmlkYXlcIixcclxuICAgICAgICBcIlNhdHVyZGF5XCIsXHJcbiAgICAgIF07XHJcbiAgICAgIHZhciBNT05USFMgPSBbXHJcbiAgICAgICAgXCJKYW51YXJ5XCIsXHJcbiAgICAgICAgXCJGZWJydWFyeVwiLFxyXG4gICAgICAgIFwiTWFyY2hcIixcclxuICAgICAgICBcIkFwcmlsXCIsXHJcbiAgICAgICAgXCJNYXlcIixcclxuICAgICAgICBcIkp1bmVcIixcclxuICAgICAgICBcIkp1bHlcIixcclxuICAgICAgICBcIkF1Z3VzdFwiLFxyXG4gICAgICAgIFwiU2VwdGVtYmVyXCIsXHJcbiAgICAgICAgXCJPY3RvYmVyXCIsXHJcbiAgICAgICAgXCJOb3ZlbWJlclwiLFxyXG4gICAgICAgIFwiRGVjZW1iZXJcIixcclxuICAgICAgXTtcclxuICAgICAgZnVuY3Rpb24gbGVhZGluZ1NvbWV0aGluZyh2YWx1ZSwgZGlnaXRzLCBjaGFyYWN0ZXIpIHtcclxuICAgICAgICB2YXIgc3RyID0gdHlwZW9mIHZhbHVlID09IFwibnVtYmVyXCIgPyB2YWx1ZS50b1N0cmluZygpIDogdmFsdWUgfHwgXCJcIjtcclxuICAgICAgICB3aGlsZSAoc3RyLmxlbmd0aCA8IGRpZ2l0cykge1xyXG4gICAgICAgICAgc3RyID0gY2hhcmFjdGVyWzBdICsgc3RyO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gc3RyO1xyXG4gICAgICB9XHJcbiAgICAgIGZ1bmN0aW9uIGxlYWRpbmdOdWxscyh2YWx1ZSwgZGlnaXRzKSB7XHJcbiAgICAgICAgcmV0dXJuIGxlYWRpbmdTb21ldGhpbmcodmFsdWUsIGRpZ2l0cywgXCIwXCIpO1xyXG4gICAgICB9XHJcbiAgICAgIGZ1bmN0aW9uIGNvbXBhcmVCeURheShkYXRlMSwgZGF0ZTIpIHtcclxuICAgICAgICBmdW5jdGlvbiBzZ24odmFsdWUpIHtcclxuICAgICAgICAgIHJldHVybiB2YWx1ZSA8IDAgPyAtMSA6IHZhbHVlID4gMCA/IDEgOiAwO1xyXG4gICAgICAgIH1cclxuICAgICAgICB2YXIgY29tcGFyZTtcclxuICAgICAgICBpZiAoKGNvbXBhcmUgPSBzZ24oZGF0ZTEuZ2V0RnVsbFllYXIoKSAtIGRhdGUyLmdldEZ1bGxZZWFyKCkpKSA9PT0gMCkge1xyXG4gICAgICAgICAgaWYgKChjb21wYXJlID0gc2duKGRhdGUxLmdldE1vbnRoKCkgLSBkYXRlMi5nZXRNb250aCgpKSkgPT09IDApIHtcclxuICAgICAgICAgICAgY29tcGFyZSA9IHNnbihkYXRlMS5nZXREYXRlKCkgLSBkYXRlMi5nZXREYXRlKCkpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gY29tcGFyZTtcclxuICAgICAgfVxyXG4gICAgICBmdW5jdGlvbiBnZXRGaXJzdFdlZWtTdGFydERhdGUoamFuRm91cnRoKSB7XHJcbiAgICAgICAgc3dpdGNoIChqYW5Gb3VydGguZ2V0RGF5KCkpIHtcclxuICAgICAgICAgIGNhc2UgMDpcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGphbkZvdXJ0aC5nZXRGdWxsWWVhcigpIC0gMSwgMTEsIDI5KTtcclxuICAgICAgICAgIGNhc2UgMTpcclxuICAgICAgICAgICAgcmV0dXJuIGphbkZvdXJ0aDtcclxuICAgICAgICAgIGNhc2UgMjpcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGphbkZvdXJ0aC5nZXRGdWxsWWVhcigpLCAwLCAzKTtcclxuICAgICAgICAgIGNhc2UgMzpcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGphbkZvdXJ0aC5nZXRGdWxsWWVhcigpLCAwLCAyKTtcclxuICAgICAgICAgIGNhc2UgNDpcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGphbkZvdXJ0aC5nZXRGdWxsWWVhcigpLCAwLCAxKTtcclxuICAgICAgICAgIGNhc2UgNTpcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGphbkZvdXJ0aC5nZXRGdWxsWWVhcigpIC0gMSwgMTEsIDMxKTtcclxuICAgICAgICAgIGNhc2UgNjpcclxuICAgICAgICAgICAgcmV0dXJuIG5ldyBEYXRlKGphbkZvdXJ0aC5nZXRGdWxsWWVhcigpIC0gMSwgMTEsIDMwKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgICAgZnVuY3Rpb24gZ2V0V2Vla0Jhc2VkWWVhcihkYXRlKSB7XHJcbiAgICAgICAgdmFyIHRoaXNEYXRlID0gYWRkRGF5cyhcclxuICAgICAgICAgIG5ldyBEYXRlKGRhdGUudG1feWVhciArIDE5MDAsIDAsIDEpLFxyXG4gICAgICAgICAgZGF0ZS50bV95ZGF5XHJcbiAgICAgICAgKTtcclxuICAgICAgICB2YXIgamFuRm91cnRoVGhpc1llYXIgPSBuZXcgRGF0ZSh0aGlzRGF0ZS5nZXRGdWxsWWVhcigpLCAwLCA0KTtcclxuICAgICAgICB2YXIgamFuRm91cnRoTmV4dFllYXIgPSBuZXcgRGF0ZSh0aGlzRGF0ZS5nZXRGdWxsWWVhcigpICsgMSwgMCwgNCk7XHJcbiAgICAgICAgdmFyIGZpcnN0V2Vla1N0YXJ0VGhpc1llYXIgPSBnZXRGaXJzdFdlZWtTdGFydERhdGUoamFuRm91cnRoVGhpc1llYXIpO1xyXG4gICAgICAgIHZhciBmaXJzdFdlZWtTdGFydE5leHRZZWFyID0gZ2V0Rmlyc3RXZWVrU3RhcnREYXRlKGphbkZvdXJ0aE5leHRZZWFyKTtcclxuICAgICAgICBpZiAoY29tcGFyZUJ5RGF5KGZpcnN0V2Vla1N0YXJ0VGhpc1llYXIsIHRoaXNEYXRlKSA8PSAwKSB7XHJcbiAgICAgICAgICBpZiAoY29tcGFyZUJ5RGF5KGZpcnN0V2Vla1N0YXJ0TmV4dFllYXIsIHRoaXNEYXRlKSA8PSAwKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB0aGlzRGF0ZS5nZXRGdWxsWWVhcigpICsgMTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiB0aGlzRGF0ZS5nZXRGdWxsWWVhcigpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByZXR1cm4gdGhpc0RhdGUuZ2V0RnVsbFllYXIoKSAtIDE7XHJcbiAgICAgIH1cclxuICAgICAgdmFyIEVYUEFOU0lPTl9SVUxFU18yID0ge1xyXG4gICAgICAgIFwiJWFcIjogKGRhdGUpID0+IFdFRUtEQVlTW2RhdGUudG1fd2RheV0uc3Vic3RyaW5nKDAsIDMpLFxyXG4gICAgICAgIFwiJUFcIjogKGRhdGUpID0+IFdFRUtEQVlTW2RhdGUudG1fd2RheV0sXHJcbiAgICAgICAgXCIlYlwiOiAoZGF0ZSkgPT4gTU9OVEhTW2RhdGUudG1fbW9uXS5zdWJzdHJpbmcoMCwgMyksXHJcbiAgICAgICAgXCIlQlwiOiAoZGF0ZSkgPT4gTU9OVEhTW2RhdGUudG1fbW9uXSxcclxuICAgICAgICBcIiVDXCI6IChkYXRlKSA9PiB7XHJcbiAgICAgICAgICB2YXIgeWVhciA9IGRhdGUudG1feWVhciArIDE5MDA7XHJcbiAgICAgICAgICByZXR1cm4gbGVhZGluZ051bGxzKCh5ZWFyIC8gMTAwKSB8IDAsIDIpO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCIlZFwiOiAoZGF0ZSkgPT4gbGVhZGluZ051bGxzKGRhdGUudG1fbWRheSwgMiksXHJcbiAgICAgICAgXCIlZVwiOiAoZGF0ZSkgPT4gbGVhZGluZ1NvbWV0aGluZyhkYXRlLnRtX21kYXksIDIsIFwiIFwiKSxcclxuICAgICAgICBcIiVnXCI6IChkYXRlKSA9PiBnZXRXZWVrQmFzZWRZZWFyKGRhdGUpLnRvU3RyaW5nKCkuc3Vic3RyaW5nKDIpLFxyXG4gICAgICAgIFwiJUdcIjogZ2V0V2Vla0Jhc2VkWWVhcixcclxuICAgICAgICBcIiVIXCI6IChkYXRlKSA9PiBsZWFkaW5nTnVsbHMoZGF0ZS50bV9ob3VyLCAyKSxcclxuICAgICAgICBcIiVJXCI6IChkYXRlKSA9PiB7XHJcbiAgICAgICAgICB2YXIgdHdlbHZlSG91ciA9IGRhdGUudG1faG91cjtcclxuICAgICAgICAgIGlmICh0d2VsdmVIb3VyID09IDApIHR3ZWx2ZUhvdXIgPSAxMjtcclxuICAgICAgICAgIGVsc2UgaWYgKHR3ZWx2ZUhvdXIgPiAxMikgdHdlbHZlSG91ciAtPSAxMjtcclxuICAgICAgICAgIHJldHVybiBsZWFkaW5nTnVsbHModHdlbHZlSG91ciwgMik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIiVqXCI6IChkYXRlKSA9PlxyXG4gICAgICAgICAgbGVhZGluZ051bGxzKFxyXG4gICAgICAgICAgICBkYXRlLnRtX21kYXkgK1xyXG4gICAgICAgICAgICAgIGFycmF5U3VtKFxyXG4gICAgICAgICAgICAgICAgaXNMZWFwWWVhcihkYXRlLnRtX3llYXIgKyAxOTAwKVxyXG4gICAgICAgICAgICAgICAgICA/IE1PTlRIX0RBWVNfTEVBUFxyXG4gICAgICAgICAgICAgICAgICA6IE1PTlRIX0RBWVNfUkVHVUxBUixcclxuICAgICAgICAgICAgICAgIGRhdGUudG1fbW9uIC0gMVxyXG4gICAgICAgICAgICAgICksXHJcbiAgICAgICAgICAgIDNcclxuICAgICAgICAgICksXHJcbiAgICAgICAgXCIlbVwiOiAoZGF0ZSkgPT4gbGVhZGluZ051bGxzKGRhdGUudG1fbW9uICsgMSwgMiksXHJcbiAgICAgICAgXCIlTVwiOiAoZGF0ZSkgPT4gbGVhZGluZ051bGxzKGRhdGUudG1fbWluLCAyKSxcclxuICAgICAgICBcIiVuXCI6ICgpID0+IFwiXFxuXCIsXHJcbiAgICAgICAgXCIlcFwiOiAoZGF0ZSkgPT4ge1xyXG4gICAgICAgICAgaWYgKGRhdGUudG1faG91ciA+PSAwICYmIGRhdGUudG1faG91ciA8IDEyKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBcIkFNXCI7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gXCJQTVwiO1xyXG4gICAgICAgIH0sXHJcbiAgICAgICAgXCIlU1wiOiAoZGF0ZSkgPT4gbGVhZGluZ051bGxzKGRhdGUudG1fc2VjLCAyKSxcclxuICAgICAgICBcIiV0XCI6ICgpID0+IFwiXFx0XCIsXHJcbiAgICAgICAgXCIldVwiOiAoZGF0ZSkgPT4gZGF0ZS50bV93ZGF5IHx8IDcsXHJcbiAgICAgICAgXCIlVVwiOiAoZGF0ZSkgPT4ge1xyXG4gICAgICAgICAgdmFyIGRheXMgPSBkYXRlLnRtX3lkYXkgKyA3IC0gZGF0ZS50bV93ZGF5O1xyXG4gICAgICAgICAgcmV0dXJuIGxlYWRpbmdOdWxscyhNYXRoLmZsb29yKGRheXMgLyA3KSwgMik7XHJcbiAgICAgICAgfSxcclxuICAgICAgICBcIiVWXCI6IChkYXRlKSA9PiB7XHJcbiAgICAgICAgICB2YXIgdmFsID0gTWF0aC5mbG9vcihcclxuICAgICAgICAgICAgKGRhdGUudG1feWRheSArIDcgLSAoKGRhdGUudG1fd2RheSArIDYpICUgNykpIC8gN1xyXG4gICAgICAgICAgKTtcclxuICAgICAgICAgIGlmICgoZGF0ZS50bV93ZGF5ICsgMzcxIC0gZGF0ZS50bV95ZGF5IC0gMikgJSA3IDw9IDIpIHtcclxuICAgICAgICAgICAgdmFsKys7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBpZiAoIXZhbCkge1xyXG4gICAgICAgICAgICB2YWwgPSA1MjtcclxuICAgICAgICAgICAgdmFyIGRlYzMxID0gKGRhdGUudG1fd2RheSArIDcgLSBkYXRlLnRtX3lkYXkgLSAxKSAlIDc7XHJcbiAgICAgICAgICAgIGlmIChcclxuICAgICAgICAgICAgICBkZWMzMSA9PSA0IHx8XHJcbiAgICAgICAgICAgICAgKGRlYzMxID09IDUgJiYgaXNMZWFwWWVhcigoZGF0ZS50bV95ZWFyICUgNDAwKSAtIDEpKVxyXG4gICAgICAgICAgICApIHtcclxuICAgICAgICAgICAgICB2YWwrKztcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgfSBlbHNlIGlmICh2YWwgPT0gNTMpIHtcclxuICAgICAgICAgICAgdmFyIGphbjEgPSAoZGF0ZS50bV93ZGF5ICsgMzcxIC0gZGF0ZS50bV95ZGF5KSAlIDc7XHJcbiAgICAgICAgICAgIGlmIChqYW4xICE9IDQgJiYgKGphbjEgIT0gMyB8fCAhaXNMZWFwWWVhcihkYXRlLnRtX3llYXIpKSkgdmFsID0gMTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIHJldHVybiBsZWFkaW5nTnVsbHModmFsLCAyKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiJXdcIjogKGRhdGUpID0+IGRhdGUudG1fd2RheSxcclxuICAgICAgICBcIiVXXCI6IChkYXRlKSA9PiB7XHJcbiAgICAgICAgICB2YXIgZGF5cyA9IGRhdGUudG1feWRheSArIDcgLSAoKGRhdGUudG1fd2RheSArIDYpICUgNyk7XHJcbiAgICAgICAgICByZXR1cm4gbGVhZGluZ051bGxzKE1hdGguZmxvb3IoZGF5cyAvIDcpLCAyKTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiJXlcIjogKGRhdGUpID0+IChkYXRlLnRtX3llYXIgKyAxOTAwKS50b1N0cmluZygpLnN1YnN0cmluZygyKSxcclxuICAgICAgICBcIiVZXCI6IChkYXRlKSA9PiBkYXRlLnRtX3llYXIgKyAxOTAwLFxyXG4gICAgICAgIFwiJXpcIjogKGRhdGUpID0+IHtcclxuICAgICAgICAgIHZhciBvZmYgPSBkYXRlLnRtX2dtdG9mZjtcclxuICAgICAgICAgIHZhciBhaGVhZCA9IG9mZiA+PSAwO1xyXG4gICAgICAgICAgb2ZmID0gTWF0aC5hYnMob2ZmKSAvIDYwO1xyXG4gICAgICAgICAgb2ZmID0gKG9mZiAvIDYwKSAqIDEwMCArIChvZmYgJSA2MCk7XHJcbiAgICAgICAgICByZXR1cm4gKGFoZWFkID8gXCIrXCIgOiBcIi1cIikgKyBTdHJpbmcoXCIwMDAwXCIgKyBvZmYpLnNsaWNlKC00KTtcclxuICAgICAgICB9LFxyXG4gICAgICAgIFwiJVpcIjogKGRhdGUpID0+IGRhdGUudG1fem9uZSxcclxuICAgICAgICBcIiUlXCI6ICgpID0+IFwiJVwiLFxyXG4gICAgICB9O1xyXG4gICAgICBwYXR0ZXJuID0gcGF0dGVybi5yZXBsYWNlKC8lJS9nLCBcIlxcMFxcMFwiKTtcclxuICAgICAgZm9yICh2YXIgcnVsZSBpbiBFWFBBTlNJT05fUlVMRVNfMikge1xyXG4gICAgICAgIGlmIChwYXR0ZXJuLmluY2x1ZGVzKHJ1bGUpKSB7XHJcbiAgICAgICAgICBwYXR0ZXJuID0gcGF0dGVybi5yZXBsYWNlKFxyXG4gICAgICAgICAgICBuZXcgUmVnRXhwKHJ1bGUsIFwiZ1wiKSxcclxuICAgICAgICAgICAgRVhQQU5TSU9OX1JVTEVTXzJbcnVsZV0oZGF0ZSlcclxuICAgICAgICAgICk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICAgIHBhdHRlcm4gPSBwYXR0ZXJuLnJlcGxhY2UoL1xcMFxcMC9nLCBcIiVcIik7XHJcbiAgICAgIHZhciBieXRlcyA9IGludEFycmF5RnJvbVN0cmluZyhwYXR0ZXJuLCBmYWxzZSk7XHJcbiAgICAgIGlmIChieXRlcy5sZW5ndGggPiBtYXhzaXplKSB7XHJcbiAgICAgICAgcmV0dXJuIDA7XHJcbiAgICAgIH1cclxuICAgICAgd3JpdGVBcnJheVRvTWVtb3J5KGJ5dGVzLCBzKTtcclxuICAgICAgcmV0dXJuIGJ5dGVzLmxlbmd0aCAtIDE7XHJcbiAgICB9XHJcbiAgICBmdW5jdGlvbiBfc3RyZnRpbWVfbChzLCBtYXhzaXplLCBmb3JtYXQsIHRtLCBsb2MpIHtcclxuICAgICAgcyA+Pj49IDA7XHJcbiAgICAgIG1heHNpemUgPj4+PSAwO1xyXG4gICAgICBmb3JtYXQgPj4+PSAwO1xyXG4gICAgICB0bSA+Pj49IDA7XHJcbiAgICAgIGxvYyA+Pj49IDA7XHJcbiAgICAgIHJldHVybiBfc3RyZnRpbWUocywgbWF4c2l6ZSwgZm9ybWF0LCB0bSk7XHJcbiAgICB9XHJcbiAgICB2YXIgc3RhY2tBbGxvYyA9IChzeikgPT4gX19lbXNjcmlwdGVuX3N0YWNrX2FsbG9jKHN6KTtcclxuICAgIHZhciB3YXNtSW1wb3J0cyA9IHtcclxuICAgICAgYTogX19fY3hhX3Rocm93LFxyXG4gICAgICBkOiBfX19zeXNjYWxsX2ZjbnRsNjQsXHJcbiAgICAgIGo6IF9fX3N5c2NhbGxfZnN0YXQ2NCxcclxuICAgICAgejogX19fc3lzY2FsbF9nZXRjd2QsXHJcbiAgICAgIEM6IF9fX3N5c2NhbGxfZ2V0ZGVudHM2NCxcclxuICAgICAgdDogX19fc3lzY2FsbF9pb2N0bCxcclxuICAgICAgSTogX19fc3lzY2FsbF9sc3RhdDY0LFxyXG4gICAgICBFOiBfX19zeXNjYWxsX21rZGlyYXQsXHJcbiAgICAgIEg6IF9fX3N5c2NhbGxfbmV3ZnN0YXRhdCxcclxuICAgICAgaTogX19fc3lzY2FsbF9vcGVuYXQsXHJcbiAgICAgIEE6IF9fX3N5c2NhbGxfcmVhZGxpbmthdCxcclxuICAgICAgeDogX19fc3lzY2FsbF9ybWRpcixcclxuICAgICAgSjogX19fc3lzY2FsbF9zdGF0NjQsXHJcbiAgICAgIHk6IF9fX3N5c2NhbGxfdW5saW5rYXQsXHJcbiAgICAgIGs6IF9fZW1zY3JpcHRlbl9nZXRfbm93X2lzX21vbm90b25pYyxcclxuICAgICAgRDogX19lbXNjcmlwdGVuX21lbWNweV9qcyxcclxuICAgICAgbjogX19nbXRpbWVfanMsXHJcbiAgICAgIG86IF9fbG9jYWx0aW1lX2pzLFxyXG4gICAgICBwOiBfX21rdGltZV9qcyxcclxuICAgICAgbDogX19tbWFwX2pzLFxyXG4gICAgICBtOiBfX211bm1hcF9qcyxcclxuICAgICAgdjogX190enNldF9qcyxcclxuICAgICAgYzogX2Fib3J0LFxyXG4gICAgICBCOiBfZW1zY3JpcHRlbl9hc21fY29uc3RfaW50LFxyXG4gICAgICBmOiBfZW1zY3JpcHRlbl9kYXRlX25vdyxcclxuICAgICAgdzogX2Vtc2NyaXB0ZW5fZ2V0X2hlYXBfbWF4LFxyXG4gICAgICBiOiBfZW1zY3JpcHRlbl9nZXRfbm93LFxyXG4gICAgICB1OiBfZW1zY3JpcHRlbl9yZXNpemVfaGVhcCxcclxuICAgICAgRjogX2Vudmlyb25fZ2V0LFxyXG4gICAgICBHOiBfZW52aXJvbl9zaXplc19nZXQsXHJcbiAgICAgIGU6IF9mZF9jbG9zZSxcclxuICAgICAgaDogX2ZkX3JlYWQsXHJcbiAgICAgIHE6IF9mZF9zZWVrLFxyXG4gICAgICBnOiBfZmRfd3JpdGUsXHJcbiAgICAgIHI6IF9zdHJmdGltZSxcclxuICAgICAgczogX3N0cmZ0aW1lX2wsXHJcbiAgICB9O1xyXG4gICAgdmFyIHdhc21FeHBvcnRzID0gY3JlYXRlV2FzbSgpO1xyXG4gICAgdmFyIF9fX3dhc21fY2FsbF9jdG9ycyA9ICgpID0+IChfX193YXNtX2NhbGxfY3RvcnMgPSB3YXNtRXhwb3J0c1tcIkxcIl0pKCk7XHJcbiAgICB2YXIgX09ydEluaXQgPSAoTW9kdWxlW1wiX09ydEluaXRcIl0gPSAoYTAsIGExKSA9PlxyXG4gICAgICAoX09ydEluaXQgPSBNb2R1bGVbXCJfT3J0SW5pdFwiXSA9IHdhc21FeHBvcnRzW1wiTVwiXSkoYTAsIGExKSk7XHJcbiAgICB2YXIgX09ydEdldExhc3RFcnJvciA9IChNb2R1bGVbXCJfT3J0R2V0TGFzdEVycm9yXCJdID0gKGEwLCBhMSkgPT5cclxuICAgICAgKF9PcnRHZXRMYXN0RXJyb3IgPSBNb2R1bGVbXCJfT3J0R2V0TGFzdEVycm9yXCJdID0gd2FzbUV4cG9ydHNbXCJOXCJdKShcclxuICAgICAgICBhMCxcclxuICAgICAgICBhMVxyXG4gICAgICApKTtcclxuICAgIHZhciBfT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnMgPSAoTW9kdWxlW1wiX09ydENyZWF0ZVNlc3Npb25PcHRpb25zXCJdID0gKFxyXG4gICAgICBhMCxcclxuICAgICAgYTEsXHJcbiAgICAgIGEyLFxyXG4gICAgICBhMyxcclxuICAgICAgYTQsXHJcbiAgICAgIGE1LFxyXG4gICAgICBhNixcclxuICAgICAgYTcsXHJcbiAgICAgIGE4LFxyXG4gICAgICBhOVxyXG4gICAgKSA9PlxyXG4gICAgICAoX09ydENyZWF0ZVNlc3Npb25PcHRpb25zID0gTW9kdWxlW1wiX09ydENyZWF0ZVNlc3Npb25PcHRpb25zXCJdID1cclxuICAgICAgICB3YXNtRXhwb3J0c1tcIk9cIl0pKGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUsIGE2LCBhNywgYTgsIGE5KSk7XHJcbiAgICB2YXIgX09ydEFwcGVuZEV4ZWN1dGlvblByb3ZpZGVyID0gKE1vZHVsZVtcIl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlclwiXSA9IChcclxuICAgICAgYTAsXHJcbiAgICAgIGExXHJcbiAgICApID0+XHJcbiAgICAgIChfT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXIgPSBNb2R1bGVbXCJfT3J0QXBwZW5kRXhlY3V0aW9uUHJvdmlkZXJcIl0gPVxyXG4gICAgICAgIHdhc21FeHBvcnRzW1wiUFwiXSkoYTAsIGExKSk7XHJcbiAgICB2YXIgX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZSA9IChNb2R1bGVbXCJfT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlXCJdID1cclxuICAgICAgKGEwLCBhMSwgYTIpID0+XHJcbiAgICAgICAgKF9PcnRBZGRGcmVlRGltZW5zaW9uT3ZlcnJpZGUgPSBNb2R1bGVbXCJfT3J0QWRkRnJlZURpbWVuc2lvbk92ZXJyaWRlXCJdID1cclxuICAgICAgICAgIHdhc21FeHBvcnRzW1wiUVwiXSkoYTAsIGExLCBhMikpO1xyXG4gICAgdmFyIF9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnkgPSAoTW9kdWxlW1wiX09ydEFkZFNlc3Npb25Db25maWdFbnRyeVwiXSA9IChcclxuICAgICAgYTAsXHJcbiAgICAgIGExLFxyXG4gICAgICBhMlxyXG4gICAgKSA9PlxyXG4gICAgICAoX09ydEFkZFNlc3Npb25Db25maWdFbnRyeSA9IE1vZHVsZVtcIl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnlcIl0gPVxyXG4gICAgICAgIHdhc21FeHBvcnRzW1wiUlwiXSkoYTAsIGExLCBhMikpO1xyXG4gICAgdmFyIF9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnMgPSAoTW9kdWxlW1wiX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9uc1wiXSA9IChcclxuICAgICAgYTBcclxuICAgICkgPT5cclxuICAgICAgKF9PcnRSZWxlYXNlU2Vzc2lvbk9wdGlvbnMgPSBNb2R1bGVbXCJfT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zXCJdID1cclxuICAgICAgICB3YXNtRXhwb3J0c1tcIlNcIl0pKGEwKSk7XHJcbiAgICB2YXIgX09ydENyZWF0ZVNlc3Npb24gPSAoTW9kdWxlW1wiX09ydENyZWF0ZVNlc3Npb25cIl0gPSAoYTAsIGExLCBhMikgPT5cclxuICAgICAgKF9PcnRDcmVhdGVTZXNzaW9uID0gTW9kdWxlW1wiX09ydENyZWF0ZVNlc3Npb25cIl0gPSB3YXNtRXhwb3J0c1tcIlRcIl0pKFxyXG4gICAgICAgIGEwLFxyXG4gICAgICAgIGExLFxyXG4gICAgICAgIGEyXHJcbiAgICAgICkpO1xyXG4gICAgdmFyIF9PcnRSZWxlYXNlU2Vzc2lvbiA9IChNb2R1bGVbXCJfT3J0UmVsZWFzZVNlc3Npb25cIl0gPSAoYTApID0+XHJcbiAgICAgIChfT3J0UmVsZWFzZVNlc3Npb24gPSBNb2R1bGVbXCJfT3J0UmVsZWFzZVNlc3Npb25cIl0gPSB3YXNtRXhwb3J0c1tcIlVcIl0pKFxyXG4gICAgICAgIGEwXHJcbiAgICAgICkpO1xyXG4gICAgdmFyIF9PcnRHZXRJbnB1dE91dHB1dENvdW50ID0gKE1vZHVsZVtcIl9PcnRHZXRJbnB1dE91dHB1dENvdW50XCJdID0gKFxyXG4gICAgICBhMCxcclxuICAgICAgYTEsXHJcbiAgICAgIGEyXHJcbiAgICApID0+XHJcbiAgICAgIChfT3J0R2V0SW5wdXRPdXRwdXRDb3VudCA9IE1vZHVsZVtcIl9PcnRHZXRJbnB1dE91dHB1dENvdW50XCJdID1cclxuICAgICAgICB3YXNtRXhwb3J0c1tcIlZcIl0pKGEwLCBhMSwgYTIpKTtcclxuICAgIHZhciBfT3J0R2V0SW5wdXROYW1lID0gKE1vZHVsZVtcIl9PcnRHZXRJbnB1dE5hbWVcIl0gPSAoYTAsIGExKSA9PlxyXG4gICAgICAoX09ydEdldElucHV0TmFtZSA9IE1vZHVsZVtcIl9PcnRHZXRJbnB1dE5hbWVcIl0gPSB3YXNtRXhwb3J0c1tcIldcIl0pKFxyXG4gICAgICAgIGEwLFxyXG4gICAgICAgIGExXHJcbiAgICAgICkpO1xyXG4gICAgdmFyIF9PcnRHZXRPdXRwdXROYW1lID0gKE1vZHVsZVtcIl9PcnRHZXRPdXRwdXROYW1lXCJdID0gKGEwLCBhMSkgPT5cclxuICAgICAgKF9PcnRHZXRPdXRwdXROYW1lID0gTW9kdWxlW1wiX09ydEdldE91dHB1dE5hbWVcIl0gPSB3YXNtRXhwb3J0c1tcIlhcIl0pKFxyXG4gICAgICAgIGEwLFxyXG4gICAgICAgIGExXHJcbiAgICAgICkpO1xyXG4gICAgdmFyIF9PcnRGcmVlID0gKE1vZHVsZVtcIl9PcnRGcmVlXCJdID0gKGEwKSA9PlxyXG4gICAgICAoX09ydEZyZWUgPSBNb2R1bGVbXCJfT3J0RnJlZVwiXSA9IHdhc21FeHBvcnRzW1wiWVwiXSkoYTApKTtcclxuICAgIHZhciBfT3J0Q3JlYXRlVGVuc29yID0gKE1vZHVsZVtcIl9PcnRDcmVhdGVUZW5zb3JcIl0gPSAoXHJcbiAgICAgIGEwLFxyXG4gICAgICBhMSxcclxuICAgICAgYTIsXHJcbiAgICAgIGEzLFxyXG4gICAgICBhNCxcclxuICAgICAgYTVcclxuICAgICkgPT5cclxuICAgICAgKF9PcnRDcmVhdGVUZW5zb3IgPSBNb2R1bGVbXCJfT3J0Q3JlYXRlVGVuc29yXCJdID0gd2FzbUV4cG9ydHNbXCJaXCJdKShcclxuICAgICAgICBhMCxcclxuICAgICAgICBhMSxcclxuICAgICAgICBhMixcclxuICAgICAgICBhMyxcclxuICAgICAgICBhNCxcclxuICAgICAgICBhNVxyXG4gICAgICApKTtcclxuICAgIHZhciBfT3J0R2V0VGVuc29yRGF0YSA9IChNb2R1bGVbXCJfT3J0R2V0VGVuc29yRGF0YVwiXSA9IChcclxuICAgICAgYTAsXHJcbiAgICAgIGExLFxyXG4gICAgICBhMixcclxuICAgICAgYTMsXHJcbiAgICAgIGE0XHJcbiAgICApID0+XHJcbiAgICAgIChfT3J0R2V0VGVuc29yRGF0YSA9IE1vZHVsZVtcIl9PcnRHZXRUZW5zb3JEYXRhXCJdID0gd2FzbUV4cG9ydHNbXCJfXCJdKShcclxuICAgICAgICBhMCxcclxuICAgICAgICBhMSxcclxuICAgICAgICBhMixcclxuICAgICAgICBhMyxcclxuICAgICAgICBhNFxyXG4gICAgICApKTtcclxuICAgIHZhciBfT3J0UmVsZWFzZVRlbnNvciA9IChNb2R1bGVbXCJfT3J0UmVsZWFzZVRlbnNvclwiXSA9IChhMCkgPT5cclxuICAgICAgKF9PcnRSZWxlYXNlVGVuc29yID0gTW9kdWxlW1wiX09ydFJlbGVhc2VUZW5zb3JcIl0gPSB3YXNtRXhwb3J0c1tcIiRcIl0pKGEwKSk7XHJcbiAgICB2YXIgX09ydENyZWF0ZVJ1bk9wdGlvbnMgPSAoTW9kdWxlW1wiX09ydENyZWF0ZVJ1bk9wdGlvbnNcIl0gPSAoXHJcbiAgICAgIGEwLFxyXG4gICAgICBhMSxcclxuICAgICAgYTIsXHJcbiAgICAgIGEzXHJcbiAgICApID0+XHJcbiAgICAgIChfT3J0Q3JlYXRlUnVuT3B0aW9ucyA9IE1vZHVsZVtcIl9PcnRDcmVhdGVSdW5PcHRpb25zXCJdID1cclxuICAgICAgICB3YXNtRXhwb3J0c1tcImFhXCJdKShhMCwgYTEsIGEyLCBhMykpO1xyXG4gICAgdmFyIF9PcnRBZGRSdW5Db25maWdFbnRyeSA9IChNb2R1bGVbXCJfT3J0QWRkUnVuQ29uZmlnRW50cnlcIl0gPSAoXHJcbiAgICAgIGEwLFxyXG4gICAgICBhMSxcclxuICAgICAgYTJcclxuICAgICkgPT5cclxuICAgICAgKF9PcnRBZGRSdW5Db25maWdFbnRyeSA9IE1vZHVsZVtcIl9PcnRBZGRSdW5Db25maWdFbnRyeVwiXSA9XHJcbiAgICAgICAgd2FzbUV4cG9ydHNbXCJiYVwiXSkoYTAsIGExLCBhMikpO1xyXG4gICAgdmFyIF9PcnRSZWxlYXNlUnVuT3B0aW9ucyA9IChNb2R1bGVbXCJfT3J0UmVsZWFzZVJ1bk9wdGlvbnNcIl0gPSAoYTApID0+XHJcbiAgICAgIChfT3J0UmVsZWFzZVJ1bk9wdGlvbnMgPSBNb2R1bGVbXCJfT3J0UmVsZWFzZVJ1bk9wdGlvbnNcIl0gPVxyXG4gICAgICAgIHdhc21FeHBvcnRzW1wiY2FcIl0pKGEwKSk7XHJcbiAgICB2YXIgX09ydENyZWF0ZUJpbmRpbmcgPSAoTW9kdWxlW1wiX09ydENyZWF0ZUJpbmRpbmdcIl0gPSAoYTApID0+XHJcbiAgICAgIChfT3J0Q3JlYXRlQmluZGluZyA9IE1vZHVsZVtcIl9PcnRDcmVhdGVCaW5kaW5nXCJdID0gd2FzbUV4cG9ydHNbXCJkYVwiXSkoXHJcbiAgICAgICAgYTBcclxuICAgICAgKSk7XHJcbiAgICB2YXIgX09ydEJpbmRJbnB1dCA9IChNb2R1bGVbXCJfT3J0QmluZElucHV0XCJdID0gKGEwLCBhMSwgYTIpID0+XHJcbiAgICAgIChfT3J0QmluZElucHV0ID0gTW9kdWxlW1wiX09ydEJpbmRJbnB1dFwiXSA9IHdhc21FeHBvcnRzW1wiZWFcIl0pKFxyXG4gICAgICAgIGEwLFxyXG4gICAgICAgIGExLFxyXG4gICAgICAgIGEyXHJcbiAgICAgICkpO1xyXG4gICAgdmFyIF9PcnRCaW5kT3V0cHV0ID0gKE1vZHVsZVtcIl9PcnRCaW5kT3V0cHV0XCJdID0gKGEwLCBhMSwgYTIsIGEzKSA9PlxyXG4gICAgICAoX09ydEJpbmRPdXRwdXQgPSBNb2R1bGVbXCJfT3J0QmluZE91dHB1dFwiXSA9IHdhc21FeHBvcnRzW1wiZmFcIl0pKFxyXG4gICAgICAgIGEwLFxyXG4gICAgICAgIGExLFxyXG4gICAgICAgIGEyLFxyXG4gICAgICAgIGEzXHJcbiAgICAgICkpO1xyXG4gICAgdmFyIF9PcnRDbGVhckJvdW5kT3V0cHV0cyA9IChNb2R1bGVbXCJfT3J0Q2xlYXJCb3VuZE91dHB1dHNcIl0gPSAoYTApID0+XHJcbiAgICAgIChfT3J0Q2xlYXJCb3VuZE91dHB1dHMgPSBNb2R1bGVbXCJfT3J0Q2xlYXJCb3VuZE91dHB1dHNcIl0gPVxyXG4gICAgICAgIHdhc21FeHBvcnRzW1wiZ2FcIl0pKGEwKSk7XHJcbiAgICB2YXIgX09ydFJlbGVhc2VCaW5kaW5nID0gKE1vZHVsZVtcIl9PcnRSZWxlYXNlQmluZGluZ1wiXSA9IChhMCkgPT5cclxuICAgICAgKF9PcnRSZWxlYXNlQmluZGluZyA9IE1vZHVsZVtcIl9PcnRSZWxlYXNlQmluZGluZ1wiXSA9IHdhc21FeHBvcnRzW1wiaGFcIl0pKFxyXG4gICAgICAgIGEwXHJcbiAgICAgICkpO1xyXG4gICAgdmFyIF9PcnRSdW5XaXRoQmluZGluZyA9IChNb2R1bGVbXCJfT3J0UnVuV2l0aEJpbmRpbmdcIl0gPSAoXHJcbiAgICAgIGEwLFxyXG4gICAgICBhMSxcclxuICAgICAgYTIsXHJcbiAgICAgIGEzLFxyXG4gICAgICBhNFxyXG4gICAgKSA9PlxyXG4gICAgICAoX09ydFJ1bldpdGhCaW5kaW5nID0gTW9kdWxlW1wiX09ydFJ1bldpdGhCaW5kaW5nXCJdID0gd2FzbUV4cG9ydHNbXCJpYVwiXSkoXHJcbiAgICAgICAgYTAsXHJcbiAgICAgICAgYTEsXHJcbiAgICAgICAgYTIsXHJcbiAgICAgICAgYTMsXHJcbiAgICAgICAgYTRcclxuICAgICAgKSk7XHJcbiAgICB2YXIgX09ydFJ1biA9IChNb2R1bGVbXCJfT3J0UnVuXCJdID0gKGEwLCBhMSwgYTIsIGEzLCBhNCwgYTUsIGE2LCBhNykgPT5cclxuICAgICAgKF9PcnRSdW4gPSBNb2R1bGVbXCJfT3J0UnVuXCJdID0gd2FzbUV4cG9ydHNbXCJqYVwiXSkoXHJcbiAgICAgICAgYTAsXHJcbiAgICAgICAgYTEsXHJcbiAgICAgICAgYTIsXHJcbiAgICAgICAgYTMsXHJcbiAgICAgICAgYTQsXHJcbiAgICAgICAgYTUsXHJcbiAgICAgICAgYTYsXHJcbiAgICAgICAgYTdcclxuICAgICAgKSk7XHJcbiAgICB2YXIgX09ydEVuZFByb2ZpbGluZyA9IChNb2R1bGVbXCJfT3J0RW5kUHJvZmlsaW5nXCJdID0gKGEwKSA9PlxyXG4gICAgICAoX09ydEVuZFByb2ZpbGluZyA9IE1vZHVsZVtcIl9PcnRFbmRQcm9maWxpbmdcIl0gPSB3YXNtRXhwb3J0c1tcImthXCJdKShhMCkpO1xyXG4gICAgdmFyIF9tYWxsb2MgPSAoTW9kdWxlW1wiX21hbGxvY1wiXSA9IChhMCkgPT5cclxuICAgICAgKF9tYWxsb2MgPSBNb2R1bGVbXCJfbWFsbG9jXCJdID0gd2FzbUV4cG9ydHNbXCJsYVwiXSkoYTApKTtcclxuICAgIHZhciBfZnJlZSA9IChNb2R1bGVbXCJfZnJlZVwiXSA9IChhMCkgPT5cclxuICAgICAgKF9mcmVlID0gTW9kdWxlW1wiX2ZyZWVcIl0gPSB3YXNtRXhwb3J0c1tcIm1hXCJdKShhMCkpO1xyXG4gICAgdmFyIF9fZW1zY3JpcHRlbl90ZW1wcmV0X3NldCA9IChhMCkgPT5cclxuICAgICAgKF9fZW1zY3JpcHRlbl90ZW1wcmV0X3NldCA9IHdhc21FeHBvcnRzW1wib2FcIl0pKGEwKTtcclxuICAgIHZhciBfX2Vtc2NyaXB0ZW5fc3RhY2tfcmVzdG9yZSA9IChhMCkgPT5cclxuICAgICAgKF9fZW1zY3JpcHRlbl9zdGFja19yZXN0b3JlID0gd2FzbUV4cG9ydHNbXCJwYVwiXSkoYTApO1xyXG4gICAgdmFyIF9fZW1zY3JpcHRlbl9zdGFja19hbGxvYyA9IChhMCkgPT5cclxuICAgICAgKF9fZW1zY3JpcHRlbl9zdGFja19hbGxvYyA9IHdhc21FeHBvcnRzW1wicWFcIl0pKGEwKTtcclxuICAgIHZhciBfZW1zY3JpcHRlbl9zdGFja19nZXRfY3VycmVudCA9ICgpID0+XHJcbiAgICAgIChfZW1zY3JpcHRlbl9zdGFja19nZXRfY3VycmVudCA9IHdhc21FeHBvcnRzW1wicmFcIl0pKCk7XHJcbiAgICB2YXIgX19fY3hhX2luY3JlbWVudF9leGNlcHRpb25fcmVmY291bnQgPSAoYTApID0+XHJcbiAgICAgIChfX19jeGFfaW5jcmVtZW50X2V4Y2VwdGlvbl9yZWZjb3VudCA9XHJcbiAgICAgICAgd2FzbUV4cG9ydHNbXCJfX2N4YV9pbmNyZW1lbnRfZXhjZXB0aW9uX3JlZmNvdW50XCJdKShhMCk7XHJcbiAgICB2YXIgX19fY3hhX2lzX3BvaW50ZXJfdHlwZSA9IChhMCkgPT5cclxuICAgICAgKF9fX2N4YV9pc19wb2ludGVyX3R5cGUgPSB3YXNtRXhwb3J0c1tcInNhXCJdKShhMCk7XHJcbiAgICBmdW5jdGlvbiBhcHBseVNpZ25hdHVyZUNvbnZlcnNpb25zKHdhc21FeHBvcnRzKSB7XHJcbiAgICAgIHdhc21FeHBvcnRzID0gT2JqZWN0LmFzc2lnbih7fSwgd2FzbUV4cG9ydHMpO1xyXG4gICAgICB2YXIgbWFrZVdyYXBwZXJfcHAgPSAoZikgPT4gKGEwKSA9PiBmKGEwKSA+Pj4gMDtcclxuICAgICAgdmFyIG1ha2VXcmFwcGVyX3AgPSAoZikgPT4gKCkgPT4gZigpID4+PiAwO1xyXG4gICAgICB3YXNtRXhwb3J0c1tcImxhXCJdID0gbWFrZVdyYXBwZXJfcHAod2FzbUV4cG9ydHNbXCJsYVwiXSk7XHJcbiAgICAgIHdhc21FeHBvcnRzW1wicWFcIl0gPSBtYWtlV3JhcHBlcl9wcCh3YXNtRXhwb3J0c1tcInFhXCJdKTtcclxuICAgICAgd2FzbUV4cG9ydHNbXCJyYVwiXSA9IG1ha2VXcmFwcGVyX3Aod2FzbUV4cG9ydHNbXCJyYVwiXSk7XHJcbiAgICAgIHJldHVybiB3YXNtRXhwb3J0cztcclxuICAgIH1cclxuICAgIE1vZHVsZVtcInN0YWNrU2F2ZVwiXSA9IHN0YWNrU2F2ZTtcclxuICAgIE1vZHVsZVtcInN0YWNrUmVzdG9yZVwiXSA9IHN0YWNrUmVzdG9yZTtcclxuICAgIE1vZHVsZVtcInN0YWNrQWxsb2NcIl0gPSBzdGFja0FsbG9jO1xyXG4gICAgTW9kdWxlW1wiVVRGOFRvU3RyaW5nXCJdID0gVVRGOFRvU3RyaW5nO1xyXG4gICAgTW9kdWxlW1wic3RyaW5nVG9VVEY4XCJdID0gc3RyaW5nVG9VVEY4O1xyXG4gICAgTW9kdWxlW1wibGVuZ3RoQnl0ZXNVVEY4XCJdID0gbGVuZ3RoQnl0ZXNVVEY4O1xyXG4gICAgdmFyIGNhbGxlZFJ1bjtcclxuICAgIGRlcGVuZGVuY2llc0Z1bGZpbGxlZCA9IGZ1bmN0aW9uIHJ1bkNhbGxlcigpIHtcclxuICAgICAgaWYgKCFjYWxsZWRSdW4pIHJ1bigpO1xyXG4gICAgICBpZiAoIWNhbGxlZFJ1bikgZGVwZW5kZW5jaWVzRnVsZmlsbGVkID0gcnVuQ2FsbGVyO1xyXG4gICAgfTtcclxuICAgIGZ1bmN0aW9uIHJ1bigpIHtcclxuICAgICAgaWYgKHJ1bkRlcGVuZGVuY2llcyA+IDApIHtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgcHJlUnVuKCk7XHJcbiAgICAgIGlmIChydW5EZXBlbmRlbmNpZXMgPiAwKSB7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGZ1bmN0aW9uIGRvUnVuKCkge1xyXG4gICAgICAgIGlmIChjYWxsZWRSdW4pIHJldHVybjtcclxuICAgICAgICBjYWxsZWRSdW4gPSB0cnVlO1xyXG4gICAgICAgIE1vZHVsZVtcImNhbGxlZFJ1blwiXSA9IHRydWU7XHJcbiAgICAgICAgaWYgKEFCT1JUKSByZXR1cm47XHJcbiAgICAgICAgaW5pdFJ1bnRpbWUoKTtcclxuICAgICAgICByZWFkeVByb21pc2VSZXNvbHZlKE1vZHVsZSk7XHJcbiAgICAgICAgcG9zdFJ1bigpO1xyXG4gICAgICB9XHJcbiAgICAgIHtcclxuICAgICAgICBkb1J1bigpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgICBydW4oKTtcclxuXHJcbiAgICByZXR1cm4gcmVhZHlQcm9taXNlO1xyXG4gIH07XHJcbn0pKCk7XHJcbmlmICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIiAmJiB0eXBlb2YgbW9kdWxlID09PSBcIm9iamVjdFwiKVxyXG4gIG1vZHVsZS5leHBvcnRzID0gb3J0V2FzbTtcclxuZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZVtcImFtZFwiXSlcclxuICBkZWZpbmUoW10sICgpID0+IG9ydFdhc20pO1xyXG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cclxuXHJcbmltcG9ydCAqIGFzIHBhdGggZnJvbSAnbm9kZTpwYXRoJztcclxuaW1wb3J0IHtFbnZ9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XHJcblxyXG5pbXBvcnQge09ydFdhc21Nb2R1bGV9IGZyb20gJy4vYmluZGluZy9vcnQtd2FzbSc7XHJcbi8vIEZpeDogXHU1RkFFXHU0RkUxXHU0RTBEXHU2NTJGXHU2MzAxXHU1OTFBXHU3RUJGXHU3QTBCXHJcbi8vIGltcG9ydCB7T3J0V2FzbVRocmVhZGVkTW9kdWxlfSBmcm9tICcuL2JpbmRpbmcvb3J0LXdhc20tdGhyZWFkZWQnO1xyXG5cclxuLyogZXNsaW50LWRpc2FibGUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0cyAqL1xyXG5sZXQgb3J0V2FzbUZhY3Rvcnk6IEVtc2NyaXB0ZW5Nb2R1bGVGYWN0b3J5PE9ydFdhc21Nb2R1bGU+O1xyXG5cclxuaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfVFJBSU5JTkcpIHtcclxuICBvcnRXYXNtRmFjdG9yeSA9IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtdHJhaW5pbmctd2FzbS1zaW1kLmpzJyk7XHJcbn0gZWxzZSB7XHJcbiAgb3J0V2FzbUZhY3RvcnkgPVxyXG4gICAgICBCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVID8gcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLmpzJykgOiByZXF1aXJlKCcuL2JpbmRpbmcvb3J0LXdhc20tc2ltZC5qc2VwLmpzJyk7XHJcbn1cclxuXHJcbmNvbnN0IG9ydFdhc21GYWN0b3J5VGhyZWFkZWQ6IEVtc2NyaXB0ZW5Nb2R1bGVGYWN0b3J5PE9ydFdhc21Nb2R1bGU+ID0gIUJVSUxEX0RFRlMuRElTQUJMRV9XQVNNX1RIUkVBRCA/XHJcbiAgICAoQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSA/IHJlcXVpcmUoJy4vYmluZGluZy9vcnQtd2FzbS10aHJlYWRlZC5qcycpIDpcclxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXNpbWQtdGhyZWFkZWQuanNlcC5qcycpKSA6XHJcbiAgICBvcnRXYXNtRmFjdG9yeTtcclxuLyogZXNsaW50LWVuYWJsZSBAdHlwZXNjcmlwdC1lc2xpbnQvbm8tcmVxdWlyZS1pbXBvcnRzICovXHJcblxyXG5sZXQgd2FzbTogT3J0V2FzbU1vZHVsZXx1bmRlZmluZWQ7XHJcbmxldCBpbml0aWFsaXplZCA9IGZhbHNlO1xyXG5sZXQgaW5pdGlhbGl6aW5nID0gZmFsc2U7XHJcbmxldCBhYm9ydGVkID0gZmFsc2U7XHJcblxyXG5jb25zdCBpc011bHRpVGhyZWFkU3VwcG9ydGVkID0gKG51bVRocmVhZHM6IG51bWJlcik6IGJvb2xlYW4gPT4ge1xyXG4gIC8vIFdlYkFzc2VtYmx5IHRocmVhZHMgYXJlIHNldCB0byAxIChzaW5nbGUgdGhyZWFkKS5cclxuICBpZiAobnVtVGhyZWFkcyA9PT0gMSkge1xyXG4gICAgcmV0dXJuIGZhbHNlO1xyXG4gIH1cclxuXHJcbiAgLy8gSWYgJ1NoYXJlZEFycmF5QnVmZmVyJyBpcyBub3QgYXZhaWxhYmxlLCBXZWJBc3NlbWJseSB0aHJlYWRzIHdpbGwgbm90IHdvcmsuXHJcbiAgaWYgKHR5cGVvZiBTaGFyZWRBcnJheUJ1ZmZlciA9PT0gJ3VuZGVmaW5lZCcpIHtcclxuICAgIGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgJiYgIXNlbGYuY3Jvc3NPcmlnaW5Jc29sYXRlZCkge1xyXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxyXG4gICAgICBjb25zb2xlLndhcm4oXHJcbiAgICAgICAgICAnZW52Lndhc20ubnVtVGhyZWFkcyBpcyBzZXQgdG8gJyArIG51bVRocmVhZHMgK1xyXG4gICAgICAgICAgJywgYnV0IHRoaXMgd2lsbCBub3Qgd29yayB1bmxlc3MgeW91IGVuYWJsZSBjcm9zc09yaWdpbklzb2xhdGVkIG1vZGUuICcgK1xyXG4gICAgICAgICAgJ1NlZSBodHRwczovL3dlYi5kZXYvY3Jvc3Mtb3JpZ2luLWlzb2xhdGlvbi1ndWlkZS8gZm9yIG1vcmUgaW5mby4nKTtcclxuICAgIH1cclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcblxyXG4gIC8vIG9ubnhydW50aW1lLXdlYiBkb2VzIG5vdCBzdXBwb3J0IG11bHRpLXRocmVhZHMgaW4gTm9kZS5qcy5cclxuICBpZiAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MudmVyc2lvbnMgJiYgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlKSB7XHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgbm8tY29uc29sZVxyXG4gICAgY29uc29sZS53YXJuKFxyXG4gICAgICAgICdlbnYud2FzbS5udW1UaHJlYWRzIGlzIHNldCB0byAnICsgbnVtVGhyZWFkcyArXHJcbiAgICAgICAgJywgaG93ZXZlciwgY3VycmVudGx5IG9ubnhydW50aW1lLXdlYiBkb2VzIG5vdCBzdXBwb3J0IG11bHRpLXRocmVhZHMgaW4gTm9kZS5qcy4gJyArXHJcbiAgICAgICAgJ1BsZWFzZSBjb25zaWRlciB1c2luZyBvbm54cnVudGltZS1ub2RlIGZvciBwZXJmb3JtYW5jZSBjcml0aWNhbCBzY2VuYXJpb3MuJyk7XHJcbiAgfVxyXG5cclxuICB0cnkge1xyXG4gICAgLy8gVGVzdCBmb3IgdHJhbnNmZXJhYmlsaXR5IG9mIFNBQnMgKGZvciBicm93c2Vycy4gbmVlZGVkIGZvciBGaXJlZm94KVxyXG4gICAgLy8gaHR0cHM6Ly9ncm91cHMuZ29vZ2xlLmNvbS9mb3J1bS8jIW1zZy9tb3ppbGxhLmRldi5wbGF0Zm9ybS9JSGtCWmxIRVRwQS9kd3NNTmNoV0VRQUpcclxuICAgIGlmICh0eXBlb2YgTWVzc2FnZUNoYW5uZWwgIT09ICd1bmRlZmluZWQnKSB7XHJcbiAgICAgIG5ldyBNZXNzYWdlQ2hhbm5lbCgpLnBvcnQxLnBvc3RNZXNzYWdlKG5ldyBTaGFyZWRBcnJheUJ1ZmZlcigxKSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gVGVzdCBmb3IgV2ViQXNzZW1ibHkgdGhyZWFkcyBjYXBhYmlsaXR5IChmb3IgYm90aCBicm93c2VycyBhbmQgTm9kZS5qcylcclxuICAgIC8vIFRoaXMgdHlwZWQgYXJyYXkgaXMgYSBXZWJBc3NlbWJseSBwcm9ncmFtIGNvbnRhaW5pbmcgdGhyZWFkZWQgaW5zdHJ1Y3Rpb25zLlxyXG4gICAgcmV0dXJuIFdlYkFzc2VtYmx5LnZhbGlkYXRlKG5ldyBVaW50OEFycmF5KFtcclxuICAgICAgMCwgOTcsIDExNSwgMTA5LCAxLCAwLCAgMCwgIDAsIDEsIDQsIDEsICA5NiwgMCwgICAwLCAgMywgMiwgMSwgIDAsIDUsXHJcbiAgICAgIDQsIDEsICAzLCAgIDEsICAgMSwgMTAsIDExLCAxLCA5LCAwLCA2NSwgMCwgIDI1NCwgMTYsIDIsIDAsIDI2LCAxMVxyXG4gICAgXSkpO1xyXG4gIH0gY2F0Y2ggKGUpIHtcclxuICAgIHJldHVybiBmYWxzZTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBpc1NpbWRTdXBwb3J0ZWQgPSAoKTogYm9vbGVhbiA9PiB7XHJcbiAgdHJ5IHtcclxuICAgIC8vIFRlc3QgZm9yIFdlYkFzc2VtYmx5IFNJTUQgY2FwYWJpbGl0eSAoZm9yIGJvdGggYnJvd3NlcnMgYW5kIE5vZGUuanMpXHJcbiAgICAvLyBUaGlzIHR5cGVkIGFycmF5IGlzIGEgV2ViQXNzZW1ibHkgcHJvZ3JhbSBjb250YWluaW5nIFNJTUQgaW5zdHJ1Y3Rpb25zLlxyXG5cclxuICAgIC8vIFRoZSBiaW5hcnkgZGF0YSBpcyBnZW5lcmF0ZWQgZnJvbSB0aGUgZm9sbG93aW5nIGNvZGUgYnkgd2F0Mndhc206XHJcbiAgICAvL1xyXG4gICAgLy8gKG1vZHVsZVxyXG4gICAgLy8gICAodHlwZSAkdDAgKGZ1bmMpKVxyXG4gICAgLy8gICAoZnVuYyAkZjAgKHR5cGUgJHQwKVxyXG4gICAgLy8gICAgIChkcm9wXHJcbiAgICAvLyAgICAgICAoaTMyeDQuZG90X2kxNng4X3NcclxuICAgIC8vICAgICAgICAgKGk4eDE2LnNwbGF0XHJcbiAgICAvLyAgICAgICAgICAgKGkzMi5jb25zdCAwKSlcclxuICAgIC8vICAgICAgICAgKHYxMjguY29uc3QgaTMyeDQgMHgwMDAwMDAwMCAweDAwMDAwMDAwIDB4MDAwMDAwMDAgMHgwMDAwMDAwMCkpKSkpXHJcblxyXG4gICAgcmV0dXJuIFdlYkFzc2VtYmx5LnZhbGlkYXRlKG5ldyBVaW50OEFycmF5KFtcclxuICAgICAgMCwgICA5NywgMTE1LCAxMDksIDEsIDAsIDAsIDAsIDEsIDQsIDEsIDk2LCAwLCAwLCAzLCAyLCAxLCAwLCAxMCwgMzAsIDEsICAgMjgsICAwLCA2NSwgMCxcclxuICAgICAgMjUzLCAxNSwgMjUzLCAxMiwgIDAsIDAsIDAsIDAsIDAsIDAsIDAsIDAsICAwLCAwLCAwLCAwLCAwLCAwLCAwLCAgMCwgIDI1MywgMTg2LCAxLCAyNiwgMTFcclxuICAgIF0pKTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICByZXR1cm4gZmFsc2U7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3QgZ2V0V2FzbUZpbGVOYW1lID0gKHVzZVNpbWQ6IGJvb2xlYW4sIHVzZVRocmVhZHM6IGJvb2xlYW4pID0+IHtcclxuICBpZiAodXNlU2ltZCkge1xyXG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfVFJBSU5JTkcpIHtcclxuICAgICAgcmV0dXJuICdvcnQtdHJhaW5pbmctd2FzbS1zaW1kLndhc20nO1xyXG4gICAgfVxyXG4gICAgcmV0dXJuIHVzZVRocmVhZHMgPyAnb3J0LXdhc20tc2ltZC10aHJlYWRlZC53YXNtJyA6ICdvcnQtd2FzbS1zaW1kLndhc20nO1xyXG4gIH0gZWxzZSB7XHJcbiAgICByZXR1cm4gdXNlVGhyZWFkcyA/ICdvcnQtd2FzbS10aHJlYWRlZC53YXNtJyA6ICdvcnQtd2FzbS53YXNtJztcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgaW5pdGlhbGl6ZVdlYkFzc2VtYmx5ID0gYXN5bmMoZmxhZ3M6IEVudi5XZWJBc3NlbWJseUZsYWdzKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgaWYgKGluaXRpYWxpemVkKSB7XHJcbiAgICByZXR1cm4gUHJvbWlzZS5yZXNvbHZlKCk7XHJcbiAgfVxyXG4gIGlmIChpbml0aWFsaXppbmcpIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignbXVsdGlwbGUgY2FsbHMgdG8gXFwnaW5pdGlhbGl6ZVdlYkFzc2VtYmx5KClcXCcgZGV0ZWN0ZWQuJyk7XHJcbiAgfVxyXG4gIGlmIChhYm9ydGVkKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3ByZXZpb3VzIGNhbGwgdG8gXFwnaW5pdGlhbGl6ZVdlYkFzc2VtYmx5KClcXCcgZmFpbGVkLicpO1xyXG4gIH1cclxuXHJcbiAgaW5pdGlhbGl6aW5nID0gdHJ1ZTtcclxuXHJcbiAgLy8gd2FzbSBmbGFncyBhcmUgYWxyZWFkeSBpbml0aWFsaXplZFxyXG4gIGNvbnN0IHRpbWVvdXQgPSBmbGFncy5pbml0VGltZW91dCE7XHJcbiAgY29uc3QgbnVtVGhyZWFkcyA9IGZsYWdzLm51bVRocmVhZHMhO1xyXG4gIGNvbnN0IHNpbWQgPSBmbGFncy5zaW1kITtcclxuXHJcbiAgY29uc3QgdXNlVGhyZWFkcyA9IGlzTXVsdGlUaHJlYWRTdXBwb3J0ZWQobnVtVGhyZWFkcyk7XHJcbiAgY29uc3QgdXNlU2ltZCA9IHNpbWQgJiYgaXNTaW1kU3VwcG9ydGVkKCk7XHJcblxyXG4gIGNvbnN0IHdhc21QYXRocyA9IGZsYWdzLndhc21QYXRocztcclxuICBjb25zdCB3YXNtUHJlZml4T3ZlcnJpZGUgPSB0eXBlb2Ygd2FzbVBhdGhzID09PSAnc3RyaW5nJyA/IHdhc21QYXRocyA6IHVuZGVmaW5lZDtcclxuICBjb25zdCB3YXNtRmlsZU5hbWUgPSBnZXRXYXNtRmlsZU5hbWUodXNlU2ltZCwgdXNlVGhyZWFkcyk7XHJcbiAgY29uc3Qgd2FzbVBhdGhPdmVycmlkZSA9IHR5cGVvZiB3YXNtUGF0aHMgPT09ICdvYmplY3QnID8gd2FzbVBhdGhzW3dhc21GaWxlTmFtZV0gOiB1bmRlZmluZWQ7XHJcblxyXG4gIGxldCBpc1RpbWVvdXQgPSBmYWxzZTtcclxuXHJcbiAgY29uc3QgdGFza3M6IEFycmF5PFByb21pc2U8dm9pZD4+ID0gW107XHJcblxyXG4gIC8vIHByb21pc2UgZm9yIHRpbWVvdXRcclxuICBpZiAodGltZW91dCA+IDApIHtcclxuICAgIHRhc2tzLnB1c2gobmV3IFByb21pc2UoKHJlc29sdmUpID0+IHtcclxuICAgICAgc2V0VGltZW91dCgoKSA9PiB7XHJcbiAgICAgICAgaXNUaW1lb3V0ID0gdHJ1ZTtcclxuICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgIH0sIHRpbWVvdXQpO1xyXG4gICAgfSkpO1xyXG4gIH1cclxuXHJcbiAgLy8gcHJvbWlzZSBmb3IgbW9kdWxlIGluaXRpYWxpemF0aW9uXHJcbiAgdGFza3MucHVzaChuZXcgUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICBjb25zdCBmYWN0b3J5ID0gdXNlVGhyZWFkcyA/IG9ydFdhc21GYWN0b3J5VGhyZWFkZWQgOiBvcnRXYXNtRmFjdG9yeTtcclxuICAgIGNvbnN0IGNvbmZpZzogUGFydGlhbDxPcnRXYXNtTW9kdWxlPiA9IHtcclxuICAgICAgbG9jYXRlRmlsZTogKGZpbGVOYW1lOiBzdHJpbmcsIHNjcmlwdERpcmVjdG9yeTogc3RyaW5nKSA9PiB7XHJcbiAgICAgICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9USFJFQUQgJiYgdXNlVGhyZWFkcyAmJiBmaWxlTmFtZS5lbmRzV2l0aCgnLndvcmtlci5qcycpICYmXHJcbiAgICAgICAgICAgIHR5cGVvZiBCbG9iICE9PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgICAgcmV0dXJuIFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoXHJcbiAgICAgICAgICAgICAgW1xyXG4gICAgICAgICAgICAgICAgLy8gVGhpcyByZXF1aXJlKCkgZnVuY3Rpb24gaXMgaGFuZGxlZCBieSBlc2J1aWxkIHBsdWdpbiB0byBsb2FkIGZpbGUgY29udGVudCBhcyBzdHJpbmcuXHJcbiAgICAgICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0c1xyXG4gICAgICAgICAgICAgICAgcmVxdWlyZSgnLi9iaW5kaW5nL29ydC13YXNtLXRocmVhZGVkLndvcmtlci5qcycpXHJcbiAgICAgICAgICAgICAgXSxcclxuICAgICAgICAgICAgICB7dHlwZTogJ3RleHQvamF2YXNjcmlwdCd9KSk7XHJcbiAgICAgICAgfVxyXG5cclxuICAgICAgICBpZiAoZmlsZU5hbWUuZW5kc1dpdGgoJy53YXNtJykpIHtcclxuICAgICAgICAgIGlmICh3YXNtUGF0aE92ZXJyaWRlKSB7XHJcbiAgICAgICAgICAgIHJldHVybiB3YXNtUGF0aE92ZXJyaWRlO1xyXG4gICAgICAgICAgfVxyXG5cclxuICAgICAgICAgIGNvbnN0IHByZWZpeCA9IHdhc21QcmVmaXhPdmVycmlkZSA/PyBzY3JpcHREaXJlY3Rvcnk7XHJcblxyXG4gICAgICAgICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVKSB7XHJcbiAgICAgICAgICAgIGlmICh3YXNtRmlsZU5hbWUgPT09ICdvcnQtd2FzbS1zaW1kLndhc20nKSB7XHJcbiAgICAgICAgICAgICAgcmV0dXJuIHByZWZpeCArICdvcnQtd2FzbS1zaW1kLmpzZXAud2FzbSc7XHJcbiAgICAgICAgICAgIH0gZWxzZSBpZiAod2FzbUZpbGVOYW1lID09PSAnb3J0LXdhc20tc2ltZC10aHJlYWRlZC53YXNtJykge1xyXG4gICAgICAgICAgICAgIHJldHVybiBwcmVmaXggKyAnb3J0LXdhc20tc2ltZC10aHJlYWRlZC5qc2VwLndhc20nO1xyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICB9XHJcblxyXG4gICAgICAgICAgcmV0dXJuIHByZWZpeCArIHdhc21GaWxlTmFtZTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIHJldHVybiBzY3JpcHREaXJlY3RvcnkgKyBmaWxlTmFtZTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbiAgICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XQVNNX1RIUkVBRCAmJiB1c2VUaHJlYWRzKSB7XHJcbiAgICAgIGNvbmZpZy5udW1UaHJlYWRzID0gbnVtVGhyZWFkcztcclxuICAgICAgaWYgKHR5cGVvZiBCbG9iID09PSAndW5kZWZpbmVkJykge1xyXG4gICAgICAgIGNvbmZpZy5tYWluU2NyaXB0VXJsT3JCbG9iID0gcGF0aC5qb2luKF9fZGlybmFtZSwgJ29ydC13YXNtLXRocmVhZGVkLmpzJyk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3Qgc2NyaXB0U291cmNlQ29kZSA9IGB2YXIgb3J0V2FzbVRocmVhZGVkPSR7ZmFjdG9yeS50b1N0cmluZygpfTtgO1xyXG4gICAgICAgIGNvbmZpZy5tYWluU2NyaXB0VXJsT3JCbG9iID0gbmV3IEJsb2IoW3NjcmlwdFNvdXJjZUNvZGVdLCB7dHlwZTogJ3RleHQvamF2YXNjcmlwdCd9KTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIFx1NEUzQVx1NEU4Nlx1NTE3Q1x1NUJCOVx1NUMwRlx1NkUzOFx1NjIwRlx1NUU3M1x1NTNGMCwgXHU2MjExXHU0RUVDXHU5NzAwXHU4OTgxXHU1RjAwXHU2NTNFXHU3RUQ5XHU0RTBBXHU1QzQyXHU4MUVBXHU1REYxXHU1MkEwXHU4RjdEIHdhc20gXHU3Njg0XHU2NUI5XHU2Q0Q1XHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxyXG4gICAgaWYgKChmbGFncyBhcyBhbnkpLmluc3RhbnRpYXRlV2FzbSkge1xyXG4gICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxyXG4gICAgICBjb25maWcuaW5zdGFudGlhdGVXYXNtID0gKGZsYWdzIGFzIGFueSkuaW5zdGFudGlhdGVXYXNtO1xyXG4gICAgfVxyXG4gICAgKGNvbmZpZyBhcyBhbnkpLnJlYWR5UHJvbWlzZVJlamVjdFdyYXBwZXIgPSAoZmxhZ3MgYXMgYW55KS5yZWFkeVByb21pc2VSZWplY3RXcmFwcGVyO1xyXG5cclxuICAgIGZhY3RvcnkoY29uZmlnKS50aGVuKFxyXG4gICAgICAgIC8vIHdhc20gbW9kdWxlIGluaXRpYWxpemVkIHN1Y2Nlc3NmdWxseVxyXG4gICAgICAgIG1vZHVsZSA9PiB7XHJcbiAgICAgICAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcclxuICAgICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgICAgICAgIHdhc20gPSBtb2R1bGU7XHJcbiAgICAgICAgICByZXNvbHZlKCk7XHJcbiAgICAgICAgfSxcclxuICAgICAgICAvLyB3YXNtIG1vZHVsZSBmYWlsZWQgdG8gaW5pdGlhbGl6ZVxyXG4gICAgICAgICh3aGF0KSA9PiB7XHJcbiAgICAgICAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcclxuICAgICAgICAgIGFib3J0ZWQgPSB0cnVlO1xyXG4gICAgICAgICAgcmVqZWN0KHdoYXQpO1xyXG4gICAgICAgIH0pO1xyXG4gIH0pKTtcclxuXHJcbiAgYXdhaXQgUHJvbWlzZS5yYWNlKHRhc2tzKTtcclxuXHJcbiAgaWYgKGlzVGltZW91dCkge1xyXG4gICAgdGhyb3cgbmV3IEVycm9yKGBXZWJBc3NlbWJseSBiYWNrZW5kIGluaXRpYWxpemluZyBmYWlsZWQgZHVlIHRvIHRpbWVvdXQ6ICR7dGltZW91dH1tc2ApO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBnZXRJbnN0YW5jZSA9ICgpOiBPcnRXYXNtTW9kdWxlID0+IHtcclxuICBpZiAoaW5pdGlhbGl6ZWQgJiYgd2FzbSkge1xyXG4gICAgcmV0dXJuIHdhc207XHJcbiAgfVxyXG5cclxuICB0aHJvdyBuZXcgRXJyb3IoJ1dlYkFzc2VtYmx5IGlzIG5vdCBpbml0aWFsaXplZCB5ZXQuJyk7XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgZGlzcG9zZSA9ICgpOiB2b2lkID0+IHtcclxuICBpZiAoaW5pdGlhbGl6ZWQgJiYgIWluaXRpYWxpemluZyAmJiAhYWJvcnRlZCkge1xyXG4gICAgaW5pdGlhbGl6aW5nID0gdHJ1ZTtcclxuXHJcbiAgICAvLyAod2FzbSBhcyBPcnRXYXNtVGhyZWFkZWRNb2R1bGUpLlBUaHJlYWQ/LnRlcm1pbmF0ZUFsbFRocmVhZHMoKTtcclxuICAgIHdhc20gPSB1bmRlZmluZWQ7XHJcblxyXG4gICAgaW5pdGlhbGl6aW5nID0gZmFsc2U7XHJcbiAgICBpbml0aWFsaXplZCA9IGZhbHNlO1xyXG4gICAgYWJvcnRlZCA9IHRydWU7XHJcbiAgfVxyXG59O1xyXG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cclxuXHJcbmltcG9ydCB7Z2V0SW5zdGFuY2V9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcclxuXHJcbmV4cG9ydCBjb25zdCBhbGxvY1dhc21TdHJpbmcgPSAoZGF0YTogc3RyaW5nLCBhbGxvY3M6IG51bWJlcltdKTogbnVtYmVyID0+IHtcclxuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcclxuXHJcbiAgY29uc3QgZGF0YUxlbmd0aCA9IHdhc20ubGVuZ3RoQnl0ZXNVVEY4KGRhdGEpICsgMTtcclxuICBjb25zdCBkYXRhT2Zmc2V0ID0gd2FzbS5fbWFsbG9jKGRhdGFMZW5ndGgpO1xyXG4gIHdhc20uc3RyaW5nVG9VVEY4KGRhdGEsIGRhdGFPZmZzZXQsIGRhdGFMZW5ndGgpO1xyXG4gIGFsbG9jcy5wdXNoKGRhdGFPZmZzZXQpO1xyXG5cclxuICByZXR1cm4gZGF0YU9mZnNldDtcclxufTtcclxuXHJcbmludGVyZmFjZSBFeHRyYU9wdGlvbnNIYW5kbGVyIHtcclxuICAobmFtZTogc3RyaW5nLCB2YWx1ZTogc3RyaW5nKTogdm9pZDtcclxufVxyXG5cclxuZXhwb3J0IGNvbnN0IGl0ZXJhdGVFeHRyYU9wdGlvbnMgPVxyXG4gICAgKG9wdGlvbnM6IFJlY29yZDxzdHJpbmcsIHVua25vd24+LCBwcmVmaXg6IHN0cmluZywgc2VlbjogV2Vha1NldDxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4sXHJcbiAgICAgaGFuZGxlcjogRXh0cmFPcHRpb25zSGFuZGxlcik6IHZvaWQgPT4ge1xyXG4gICAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT0gJ29iamVjdCcgJiYgb3B0aW9ucyAhPT0gbnVsbCkge1xyXG4gICAgICAgIGlmIChzZWVuLmhhcyhvcHRpb25zKSkge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdDaXJjdWxhciByZWZlcmVuY2UgaW4gb3B0aW9ucycpO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICBzZWVuLmFkZChvcHRpb25zKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIE9iamVjdC5lbnRyaWVzKG9wdGlvbnMpLmZvckVhY2goKFtrZXksIHZhbHVlXSkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG5hbWUgPSAocHJlZml4KSA/IHByZWZpeCArIGtleSA6IGtleTtcclxuICAgICAgICBpZiAodHlwZW9mIHZhbHVlID09PSAnb2JqZWN0Jykge1xyXG4gICAgICAgICAgaXRlcmF0ZUV4dHJhT3B0aW9ucyh2YWx1ZSBhcyBSZWNvcmQ8c3RyaW5nLCB1bmtub3duPiwgbmFtZSArICcuJywgc2VlbiwgaGFuZGxlcik7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IHR5cGVvZiB2YWx1ZSA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgIGhhbmRsZXIobmFtZSwgdmFsdWUudG9TdHJpbmcoKSk7XHJcbiAgICAgICAgfSBlbHNlIGlmICh0eXBlb2YgdmFsdWUgPT09ICdib29sZWFuJykge1xyXG4gICAgICAgICAgaGFuZGxlcihuYW1lLCAodmFsdWUpID8gJzEnIDogJzAnKTtcclxuICAgICAgICB9IGVsc2Uge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW4ndCBoYW5kbGUgZXh0cmEgY29uZmlnIHR5cGU6ICR7dHlwZW9mIHZhbHVlfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9O1xyXG5cclxuLyoqXHJcbiAqIGNoZWNrIHdlYiBhc3NlbWJseSBBUEkncyBsYXN0IGVycm9yIGFuZCB0aHJvdyBlcnJvciBpZiBhbnkgZXJyb3Igb2NjdXJyZWQuXHJcbiAqIEBwYXJhbSBtZXNzYWdlIGEgbWVzc2FnZSB1c2VkIHdoZW4gYW4gZXJyb3Igb2NjdXJyZWQuXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgY2hlY2tMYXN0RXJyb3IgPSAobWVzc2FnZTogc3RyaW5nKTogdm9pZCA9PiB7XHJcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XHJcblxyXG4gIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcclxuICB0cnkge1xyXG4gICAgY29uc3QgcGFyYW1zT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDgpO1xyXG4gICAgd2FzbS5fT3J0R2V0TGFzdEVycm9yKHBhcmFtc09mZnNldCwgcGFyYW1zT2Zmc2V0ICsgNCk7XHJcbiAgICBjb25zdCBlcnJvckNvZGUgPSB3YXNtLkhFQVAzMltwYXJhbXNPZmZzZXQgLyA0XTtcclxuICAgIGNvbnN0IGVycm9yTWVzc2FnZVBvaW50ZXIgPSB3YXNtLkhFQVBVMzJbcGFyYW1zT2Zmc2V0IC8gNCArIDFdO1xyXG4gICAgY29uc3QgZXJyb3JNZXNzYWdlID0gZXJyb3JNZXNzYWdlUG9pbnRlciA/IHdhc20uVVRGOFRvU3RyaW5nKGVycm9yTWVzc2FnZVBvaW50ZXIpIDogJyc7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYCR7bWVzc2FnZX0gRVJST1JfQ09ERTogJHtlcnJvckNvZGV9LCBFUlJPUl9NRVNTQUdFOiAke2Vycm9yTWVzc2FnZX1gKTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgd2FzbS5zdGFja1Jlc3RvcmUoc3RhY2spO1xyXG4gIH1cclxufTtcclxuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXHJcblxyXG5pbXBvcnQge0luZmVyZW5jZVNlc3Npb259IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XHJcblxyXG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XHJcbmltcG9ydCB7YWxsb2NXYXNtU3RyaW5nLCBjaGVja0xhc3RFcnJvciwgaXRlcmF0ZUV4dHJhT3B0aW9uc30gZnJvbSAnLi93YXNtLXV0aWxzJztcclxuXHJcbmV4cG9ydCBjb25zdCBzZXRSdW5PcHRpb25zID0gKG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyk6IFtudW1iZXIsIG51bWJlcltdXSA9PiB7XHJcbiAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XHJcbiAgbGV0IHJ1bk9wdGlvbnNIYW5kbGUgPSAwO1xyXG4gIGNvbnN0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcclxuXHJcbiAgY29uc3QgcnVuT3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGlmIChvcHRpb25zPy5sb2dTZXZlcml0eUxldmVsID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgcnVuT3B0aW9ucy5sb2dTZXZlcml0eUxldmVsID0gMjsgIC8vIERlZmF1bHQgdG8gd2FybmluZ1xyXG4gICAgfSBlbHNlIGlmIChcclxuICAgICAgICB0eXBlb2Ygb3B0aW9ucy5sb2dTZXZlcml0eUxldmVsICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwpIHx8XHJcbiAgICAgICAgb3B0aW9ucy5sb2dTZXZlcml0eUxldmVsIDwgMCB8fCBvcHRpb25zLmxvZ1NldmVyaXR5TGV2ZWwgPiA0KSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgbG9nIHNlcnZlcml0eSBsZXZlbCBpcyBub3QgdmFsaWQ6ICR7b3B0aW9ucy5sb2dTZXZlcml0eUxldmVsfWApO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChvcHRpb25zPy5sb2dWZXJib3NpdHlMZXZlbCA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHJ1bk9wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWwgPSAwOyAgLy8gRGVmYXVsdCB0byAwXHJcbiAgICB9IGVsc2UgaWYgKHR5cGVvZiBvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsICE9PSAnbnVtYmVyJyB8fCAhTnVtYmVyLmlzSW50ZWdlcihvcHRpb25zLmxvZ1ZlcmJvc2l0eUxldmVsKSkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyB2ZXJib3NpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke29wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWx9YCk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKG9wdGlvbnM/LnRlcm1pbmF0ZSA9PT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHJ1bk9wdGlvbnMudGVybWluYXRlID0gZmFsc2U7XHJcbiAgICB9XHJcblxyXG4gICAgbGV0IHRhZ0RhdGFPZmZzZXQgPSAwO1xyXG4gICAgaWYgKG9wdGlvbnM/LnRhZyAhPT0gdW5kZWZpbmVkKSB7XHJcbiAgICAgIHRhZ0RhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcob3B0aW9ucy50YWcsIGFsbG9jcyk7XHJcbiAgICB9XHJcblxyXG4gICAgcnVuT3B0aW9uc0hhbmRsZSA9IHdhc20uX09ydENyZWF0ZVJ1bk9wdGlvbnMoXHJcbiAgICAgICAgcnVuT3B0aW9ucy5sb2dTZXZlcml0eUxldmVsISwgcnVuT3B0aW9ucy5sb2dWZXJib3NpdHlMZXZlbCEsICEhcnVuT3B0aW9ucy50ZXJtaW5hdGUhLCB0YWdEYXRhT2Zmc2V0KTtcclxuICAgIGlmIChydW5PcHRpb25zSGFuZGxlID09PSAwKSB7XHJcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBydW4gb3B0aW9ucy4nKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAob3B0aW9ucz8uZXh0cmEgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBpdGVyYXRlRXh0cmFPcHRpb25zKG9wdGlvbnMuZXh0cmEsICcnLCBuZXcgV2Vha1NldDxSZWNvcmQ8c3RyaW5nLCB1bmtub3duPj4oKSwgKGtleSwgdmFsdWUpID0+IHtcclxuICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKGtleSwgYWxsb2NzKTtcclxuICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcodmFsdWUsIGFsbG9jcyk7XHJcblxyXG4gICAgICAgIGlmICh3YXNtLl9PcnRBZGRSdW5Db25maWdFbnRyeShydW5PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PSAwKSB7XHJcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgcnVuIGNvbmZpZyBlbnRyeTogJHtrZXl9IC0gJHt2YWx1ZX0uYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9KTtcclxuICAgIH1cclxuXHJcbiAgICByZXR1cm4gW3J1bk9wdGlvbnNIYW5kbGUsIGFsbG9jc107XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgaWYgKHJ1bk9wdGlvbnNIYW5kbGUgIT09IDApIHtcclxuICAgICAgd2FzbS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnMocnVuT3B0aW9uc0hhbmRsZSk7XHJcbiAgICB9XHJcbiAgICBhbGxvY3MuZm9yRWFjaChhbGxvYyA9PiB3YXNtLl9mcmVlKGFsbG9jKSk7XHJcbiAgICB0aHJvdyBlO1xyXG4gIH1cclxufTtcclxuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXHJcblxyXG5pbXBvcnQge0luZmVyZW5jZVNlc3Npb259IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XHJcblxyXG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XHJcbmltcG9ydCB7YWxsb2NXYXNtU3RyaW5nLCBjaGVja0xhc3RFcnJvciwgaXRlcmF0ZUV4dHJhT3B0aW9uc30gZnJvbSAnLi93YXNtLXV0aWxzJztcclxuXHJcbmNvbnN0IGdldEdyYXBoT3B0aW16YXRpb25MZXZlbCA9IChncmFwaE9wdGltaXphdGlvbkxldmVsOiBzdHJpbmd8dW5rbm93bik6IG51bWJlciA9PiB7XHJcbiAgc3dpdGNoIChncmFwaE9wdGltaXphdGlvbkxldmVsKSB7XHJcbiAgICBjYXNlICdkaXNhYmxlZCc6XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgY2FzZSAnYmFzaWMnOlxyXG4gICAgICByZXR1cm4gMTtcclxuICAgIGNhc2UgJ2V4dGVuZGVkJzpcclxuICAgICAgcmV0dXJuIDI7XHJcbiAgICBjYXNlICdhbGwnOlxyXG4gICAgICByZXR1cm4gOTk7XHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIGdyYXBoIG9wdGltaXphdGlvbiBsZXZlbDogJHtncmFwaE9wdGltaXphdGlvbkxldmVsfWApO1xyXG4gIH1cclxufTtcclxuXHJcbmNvbnN0IGdldEV4ZWN1dGlvbk1vZGUgPSAoZXhlY3V0aW9uTW9kZTogJ3NlcXVlbnRpYWwnfCdwYXJhbGxlbCcpOiBudW1iZXIgPT4ge1xyXG4gIHN3aXRjaCAoZXhlY3V0aW9uTW9kZSkge1xyXG4gICAgY2FzZSAnc2VxdWVudGlhbCc6XHJcbiAgICAgIHJldHVybiAwO1xyXG4gICAgY2FzZSAncGFyYWxsZWwnOlxyXG4gICAgICByZXR1cm4gMTtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZXhlY3V0aW9uIG1vZGU6ICR7ZXhlY3V0aW9uTW9kZX1gKTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBhcHBlbmREZWZhdWx0T3B0aW9ucyA9IChvcHRpb25zOiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogdm9pZCA9PiB7XHJcbiAgaWYgKCFvcHRpb25zLmV4dHJhKSB7XHJcbiAgICBvcHRpb25zLmV4dHJhID0ge307XHJcbiAgfVxyXG4gIGlmICghb3B0aW9ucy5leHRyYS5zZXNzaW9uKSB7XHJcbiAgICBvcHRpb25zLmV4dHJhLnNlc3Npb24gPSB7fTtcclxuICB9XHJcbiAgY29uc3Qgc2Vzc2lvbiA9IG9wdGlvbnMuZXh0cmEuc2Vzc2lvbiBhcyBSZWNvcmQ8c3RyaW5nLCBzdHJpbmc+O1xyXG4gIGlmICghc2Vzc2lvbi51c2Vfb3J0X21vZGVsX2J5dGVzX2RpcmVjdGx5KSB7XHJcbiAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgY2FtZWxjYXNlXHJcbiAgICBzZXNzaW9uLnVzZV9vcnRfbW9kZWxfYnl0ZXNfZGlyZWN0bHkgPSAnMSc7XHJcbiAgfVxyXG5cclxuICAvLyBpZiB1c2luZyBKU0VQIHdpdGggV2ViR1BVLCBhbHdheXMgZGlzYWJsZSBtZW1vcnkgcGF0dGVyblxyXG4gIGlmIChvcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycyAmJlxyXG4gICAgICBvcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycy5zb21lKGVwID0+ICh0eXBlb2YgZXAgPT09ICdzdHJpbmcnID8gZXAgOiBlcC5uYW1lKSA9PT0gJ3dlYmdwdScpKSB7XHJcbiAgICBvcHRpb25zLmVuYWJsZU1lbVBhdHRlcm4gPSBmYWxzZTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBzZXRFeGVjdXRpb25Qcm92aWRlcnMgPVxyXG4gICAgKHNlc3Npb25PcHRpb25zSGFuZGxlOiBudW1iZXIsIGV4ZWN1dGlvblByb3ZpZGVyczogcmVhZG9ubHkgSW5mZXJlbmNlU2Vzc2lvbi5FeGVjdXRpb25Qcm92aWRlckNvbmZpZ1tdLFxyXG4gICAgIGFsbG9jczogbnVtYmVyW10pOiB2b2lkID0+IHtcclxuICAgICAgZm9yIChjb25zdCBlcCBvZiBleGVjdXRpb25Qcm92aWRlcnMpIHtcclxuICAgICAgICBsZXQgZXBOYW1lID0gdHlwZW9mIGVwID09PSAnc3RyaW5nJyA/IGVwIDogZXAubmFtZTtcclxuXHJcbiAgICAgICAgLy8gY2hlY2sgRVAgbmFtZVxyXG4gICAgICAgIHN3aXRjaCAoZXBOYW1lKSB7XHJcbiAgICAgICAgICBjYXNlICd3ZWJubic6XHJcbiAgICAgICAgICAgIGVwTmFtZSA9ICdXRUJOTic7XHJcbiAgICAgICAgICAgIGlmICh0eXBlb2YgZXAgIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgY29uc3Qgd2Vibm5PcHRpb25zID0gZXAgYXMgSW5mZXJlbmNlU2Vzc2lvbi5XZWJOTkV4ZWN1dGlvblByb3ZpZGVyT3B0aW9uO1xyXG4gICAgICAgICAgICAgIGlmICh3ZWJubk9wdGlvbnM/LmRldmljZVR5cGUpIHtcclxuICAgICAgICAgICAgICAgIGNvbnN0IGtleURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoJ2RldmljZVR5cGUnLCBhbGxvY3MpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHdlYm5uT3B0aW9ucy5kZXZpY2VUeXBlLCBhbGxvY3MpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cclxuICAgICAgICAgICAgICAgICAgICAwKSB7XHJcbiAgICAgICAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJ2RldmljZVR5cGUnIC0gJHt3ZWJubk9wdGlvbnMuZGV2aWNlVHlwZX0uYCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmICh3ZWJubk9wdGlvbnM/Lm51bVRocmVhZHMpIHtcclxuICAgICAgICAgICAgICAgIGxldCBudW1UaHJlYWRzID0gd2Vibm5PcHRpb25zLm51bVRocmVhZHM7XHJcbiAgICAgICAgICAgICAgICAvLyBKdXN0IGlnbm9yZSBpbnZhbGlkIHdlYm5uT3B0aW9ucy5udW1UaHJlYWRzLlxyXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBudW1UaHJlYWRzICE9ICdudW1iZXInIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKG51bVRocmVhZHMpIHx8IG51bVRocmVhZHMgPCAwKSB7XHJcbiAgICAgICAgICAgICAgICAgIG51bVRocmVhZHMgPSAwO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZygnbnVtVGhyZWFkcycsIGFsbG9jcyk7XHJcbiAgICAgICAgICAgICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcobnVtVGhyZWFkcy50b1N0cmluZygpLCBhbGxvY3MpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cclxuICAgICAgICAgICAgICAgICAgICAwKSB7XHJcbiAgICAgICAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBzZXQgYSBzZXNzaW9uIGNvbmZpZyBlbnRyeTogJ251bVRocmVhZHMnIC0gJHt3ZWJubk9wdGlvbnMubnVtVGhyZWFkc30uYCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIGlmICh3ZWJubk9wdGlvbnM/LnBvd2VyUHJlZmVyZW5jZSkge1xyXG4gICAgICAgICAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZygncG93ZXJQcmVmZXJlbmNlJywgYWxsb2NzKTtcclxuICAgICAgICAgICAgICAgIGNvbnN0IHZhbHVlRGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyh3ZWJubk9wdGlvbnMucG93ZXJQcmVmZXJlbmNlLCBhbGxvY3MpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cclxuICAgICAgICAgICAgICAgICAgICAwKSB7XHJcbiAgICAgICAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAncG93ZXJQcmVmZXJlbmNlJyAtICR7d2Vibm5PcHRpb25zLnBvd2VyUHJlZmVyZW5jZX0uYCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB9XHJcbiAgICAgICAgICAgIGJyZWFrO1xyXG4gICAgICAgICAgY2FzZSAnd2ViZ3B1JzpcclxuICAgICAgICAgICAgZXBOYW1lID0gJ0pTJztcclxuICAgICAgICAgICAgaWYgKHR5cGVvZiBlcCAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgICAgICBjb25zdCB3ZWJncHVPcHRpb25zID0gZXAgYXMgSW5mZXJlbmNlU2Vzc2lvbi5XZWJHcHVFeGVjdXRpb25Qcm92aWRlck9wdGlvbjtcclxuICAgICAgICAgICAgICBpZiAod2ViZ3B1T3B0aW9ucz8ucHJlZmVycmVkTGF5b3V0KSB7XHJcbiAgICAgICAgICAgICAgICBpZiAod2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXQgIT09ICdOQ0hXJyAmJiB3ZWJncHVPcHRpb25zLnByZWZlcnJlZExheW91dCAhPT0gJ05IV0MnKSB7XHJcbiAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgcHJlZmVycmVkTGF5b3V0IG11c3QgYmUgZWl0aGVyICdOQ0hXJyBvciAnTkhXQyc6ICR7d2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXR9YCk7XHJcbiAgICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdwcmVmZXJyZWRMYXlvdXQnLCBhbGxvY3MpO1xyXG4gICAgICAgICAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHdlYmdwdU9wdGlvbnMucHJlZmVycmVkTGF5b3V0LCBhbGxvY3MpO1xyXG4gICAgICAgICAgICAgICAgaWYgKGdldEluc3RhbmNlKCkuX09ydEFkZFNlc3Npb25Db25maWdFbnRyeShzZXNzaW9uT3B0aW9uc0hhbmRsZSwga2V5RGF0YU9mZnNldCwgdmFsdWVEYXRhT2Zmc2V0KSAhPT1cclxuICAgICAgICAgICAgICAgICAgICAwKSB7XHJcbiAgICAgICAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKFxyXG4gICAgICAgICAgICAgICAgICAgICAgYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAncHJlZmVycmVkTGF5b3V0JyAtICR7d2ViZ3B1T3B0aW9ucy5wcmVmZXJyZWRMYXlvdXR9LmApO1xyXG4gICAgICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIGNhc2UgJ3dhc20nOlxyXG4gICAgICAgICAgY2FzZSAnY3B1JzpcclxuICAgICAgICAgICAgY29udGludWU7XHJcbiAgICAgICAgICBkZWZhdWx0OlxyXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYG5vdCBzdXBwb3J0ZWQgZXhlY3V0aW9uIHByb3ZpZGVyOiAke2VwTmFtZX1gKTtcclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGNvbnN0IGVwTmFtZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoZXBOYW1lLCBhbGxvY3MpO1xyXG4gICAgICAgIGlmIChnZXRJbnN0YW5jZSgpLl9PcnRBcHBlbmRFeGVjdXRpb25Qcm92aWRlcihzZXNzaW9uT3B0aW9uc0hhbmRsZSwgZXBOYW1lRGF0YU9mZnNldCkgIT09IDApIHtcclxuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBhcHBlbmQgZXhlY3V0aW9uIHByb3ZpZGVyOiAke2VwTmFtZX0uYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9O1xyXG5cclxuZXhwb3J0IGNvbnN0IHNldFNlc3Npb25PcHRpb25zID0gKG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogW251bWJlciwgbnVtYmVyW11dID0+IHtcclxuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcclxuICBsZXQgc2Vzc2lvbk9wdGlvbnNIYW5kbGUgPSAwO1xyXG4gIGNvbnN0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcclxuXHJcbiAgY29uc3Qgc2Vzc2lvbk9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xyXG4gIGFwcGVuZERlZmF1bHRPcHRpb25zKHNlc3Npb25PcHRpb25zKTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIGNvbnN0IGdyYXBoT3B0aW1pemF0aW9uTGV2ZWwgPSBnZXRHcmFwaE9wdGltemF0aW9uTGV2ZWwoc2Vzc2lvbk9wdGlvbnMuZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCA/PyAnYWxsJyk7XHJcbiAgICBjb25zdCBleGVjdXRpb25Nb2RlID0gZ2V0RXhlY3V0aW9uTW9kZShzZXNzaW9uT3B0aW9ucy5leGVjdXRpb25Nb2RlID8/ICdzZXF1ZW50aWFsJyk7XHJcbiAgICBjb25zdCBsb2dJZERhdGFPZmZzZXQgPVxyXG4gICAgICAgIHR5cGVvZiBzZXNzaW9uT3B0aW9ucy5sb2dJZCA9PT0gJ3N0cmluZycgPyBhbGxvY1dhc21TdHJpbmcoc2Vzc2lvbk9wdGlvbnMubG9nSWQsIGFsbG9jcykgOiAwO1xyXG5cclxuICAgIGNvbnN0IGxvZ1NldmVyaXR5TGV2ZWwgPSBzZXNzaW9uT3B0aW9ucy5sb2dTZXZlcml0eUxldmVsID8/IDI7ICAvLyBEZWZhdWx0IHRvIDIgLSB3YXJuaW5nXHJcbiAgICBpZiAoIU51bWJlci5pc0ludGVnZXIobG9nU2V2ZXJpdHlMZXZlbCkgfHwgbG9nU2V2ZXJpdHlMZXZlbCA8IDAgfHwgbG9nU2V2ZXJpdHlMZXZlbCA+IDQpIHtcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGBsb2cgc2VydmVyaXR5IGxldmVsIGlzIG5vdCB2YWxpZDogJHtsb2dTZXZlcml0eUxldmVsfWApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IGxvZ1ZlcmJvc2l0eUxldmVsID0gc2Vzc2lvbk9wdGlvbnMubG9nVmVyYm9zaXR5TGV2ZWwgPz8gMDsgIC8vIERlZmF1bHQgdG8gMCAtIHZlcmJvc2VcclxuICAgIGlmICghTnVtYmVyLmlzSW50ZWdlcihsb2dWZXJib3NpdHlMZXZlbCkgfHwgbG9nVmVyYm9zaXR5TGV2ZWwgPCAwIHx8IGxvZ1ZlcmJvc2l0eUxldmVsID4gNCkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGxvZyB2ZXJib3NpdHkgbGV2ZWwgaXMgbm90IHZhbGlkOiAke2xvZ1ZlcmJvc2l0eUxldmVsfWApO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG9wdGltaXplZE1vZGVsRmlsZVBhdGhPZmZzZXQgPSB0eXBlb2Ygc2Vzc2lvbk9wdGlvbnMub3B0aW1pemVkTW9kZWxGaWxlUGF0aCA9PT0gJ3N0cmluZycgP1xyXG4gICAgICAgIGFsbG9jV2FzbVN0cmluZyhzZXNzaW9uT3B0aW9ucy5vcHRpbWl6ZWRNb2RlbEZpbGVQYXRoLCBhbGxvY3MpIDpcclxuICAgICAgICAwO1xyXG5cclxuICAgIHNlc3Npb25PcHRpb25zSGFuZGxlID0gd2FzbS5fT3J0Q3JlYXRlU2Vzc2lvbk9wdGlvbnMoXHJcbiAgICAgICAgZ3JhcGhPcHRpbWl6YXRpb25MZXZlbCwgISFzZXNzaW9uT3B0aW9ucy5lbmFibGVDcHVNZW1BcmVuYSwgISFzZXNzaW9uT3B0aW9ucy5lbmFibGVNZW1QYXR0ZXJuLCBleGVjdXRpb25Nb2RlLFxyXG4gICAgICAgICEhc2Vzc2lvbk9wdGlvbnMuZW5hYmxlUHJvZmlsaW5nLCAwLCBsb2dJZERhdGFPZmZzZXQsIGxvZ1NldmVyaXR5TGV2ZWwsIGxvZ1ZlcmJvc2l0eUxldmVsLFxyXG4gICAgICAgIG9wdGltaXplZE1vZGVsRmlsZVBhdGhPZmZzZXQpO1xyXG4gICAgaWYgKHNlc3Npb25PcHRpb25zSGFuZGxlID09PSAwKSB7XHJcbiAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBzZXNzaW9uIG9wdGlvbnMuJyk7XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKHNlc3Npb25PcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycykge1xyXG4gICAgICBzZXRFeGVjdXRpb25Qcm92aWRlcnMoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIHNlc3Npb25PcHRpb25zLmV4ZWN1dGlvblByb3ZpZGVycywgYWxsb2NzKTtcclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnMuZW5hYmxlR3JhcGhDYXB0dXJlICE9PSB1bmRlZmluZWQpIHtcclxuICAgICAgaWYgKHR5cGVvZiBzZXNzaW9uT3B0aW9ucy5lbmFibGVHcmFwaENhcHR1cmUgIT09ICdib29sZWFuJykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgZW5hYmxlR3JhcGhDYXB0dXJlIG11c3QgYmUgYSBib29sZWFuIHZhbHVlOiAke3Nlc3Npb25PcHRpb25zLmVuYWJsZUdyYXBoQ2FwdHVyZX1gKTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBrZXlEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKCdlbmFibGVHcmFwaENhcHR1cmUnLCBhbGxvY3MpO1xyXG4gICAgICBjb25zdCB2YWx1ZURhdGFPZmZzZXQgPSBhbGxvY1dhc21TdHJpbmcoc2Vzc2lvbk9wdGlvbnMuZW5hYmxlR3JhcGhDYXB0dXJlLnRvU3RyaW5nKCksIGFsbG9jcyk7XHJcbiAgICAgIGlmICh3YXNtLl9PcnRBZGRTZXNzaW9uQ29uZmlnRW50cnkoc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGtleURhdGFPZmZzZXQsIHZhbHVlRGF0YU9mZnNldCkgIT09IDApIHtcclxuICAgICAgICBjaGVja0xhc3RFcnJvcihcclxuICAgICAgICAgICAgYENhbid0IHNldCBhIHNlc3Npb24gY29uZmlnIGVudHJ5OiAnZW5hYmxlR3JhcGhDYXB0dXJlJyAtICR7c2Vzc2lvbk9wdGlvbnMuZW5hYmxlR3JhcGhDYXB0dXJlfS5gKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIGlmIChzZXNzaW9uT3B0aW9ucy5mcmVlRGltZW5zaW9uT3ZlcnJpZGVzKSB7XHJcbiAgICAgIGZvciAoY29uc3QgW25hbWUsIHZhbHVlXSBvZiBPYmplY3QuZW50cmllcyhzZXNzaW9uT3B0aW9ucy5mcmVlRGltZW5zaW9uT3ZlcnJpZGVzKSkge1xyXG4gICAgICAgIGlmICh0eXBlb2YgbmFtZSAhPT0gJ3N0cmluZycpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGUgbmFtZSBtdXN0IGJlIGEgc3RyaW5nOiAke25hbWV9YCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGlmICh0eXBlb2YgdmFsdWUgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKHZhbHVlKSB8fCB2YWx1ZSA8IDApIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGUgdmFsdWUgbXVzdCBiZSBhIG5vbi1uZWdhdGl2ZSBpbnRlZ2VyOiAke3ZhbHVlfWApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBuYW1lT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKG5hbWUsIGFsbG9jcyk7XHJcbiAgICAgICAgaWYgKHdhc20uX09ydEFkZEZyZWVEaW1lbnNpb25PdmVycmlkZShzZXNzaW9uT3B0aW9uc0hhbmRsZSwgbmFtZU9mZnNldCwgdmFsdWUpICE9PSAwKSB7XHJcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgZnJlZSBkaW1lbnNpb24gb3ZlcnJpZGU6ICR7bmFtZX0gLSAke3ZhbHVlfS5gKTtcclxuICAgICAgICB9XHJcbiAgICAgIH1cclxuICAgIH1cclxuXHJcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnMuZXh0cmEgIT09IHVuZGVmaW5lZCkge1xyXG4gICAgICBpdGVyYXRlRXh0cmFPcHRpb25zKHNlc3Npb25PcHRpb25zLmV4dHJhLCAnJywgbmV3IFdlYWtTZXQ8UmVjb3JkPHN0cmluZywgdW5rbm93bj4+KCksIChrZXksIHZhbHVlKSA9PiB7XHJcbiAgICAgICAgY29uc3Qga2V5RGF0YU9mZnNldCA9IGFsbG9jV2FzbVN0cmluZyhrZXksIGFsbG9jcyk7XHJcbiAgICAgICAgY29uc3QgdmFsdWVEYXRhT2Zmc2V0ID0gYWxsb2NXYXNtU3RyaW5nKHZhbHVlLCBhbGxvY3MpO1xyXG5cclxuICAgICAgICBpZiAod2FzbS5fT3J0QWRkU2Vzc2lvbkNvbmZpZ0VudHJ5KHNlc3Npb25PcHRpb25zSGFuZGxlLCBrZXlEYXRhT2Zmc2V0LCB2YWx1ZURhdGFPZmZzZXQpICE9PSAwKSB7XHJcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3Qgc2V0IGEgc2Vzc2lvbiBjb25maWcgZW50cnk6ICR7a2V5fSAtICR7dmFsdWV9LmApO1xyXG4gICAgICAgIH1cclxuICAgICAgfSk7XHJcbiAgICB9XHJcblxyXG4gICAgcmV0dXJuIFtzZXNzaW9uT3B0aW9uc0hhbmRsZSwgYWxsb2NzXTtcclxuICB9IGNhdGNoIChlKSB7XHJcbiAgICBpZiAoc2Vzc2lvbk9wdGlvbnNIYW5kbGUgIT09IDApIHtcclxuICAgICAgd2FzbS5fT3J0UmVsZWFzZVNlc3Npb25PcHRpb25zKHNlc3Npb25PcHRpb25zSGFuZGxlKTtcclxuICAgIH1cclxuICAgIGFsbG9jcy5mb3JFYWNoKGFsbG9jID0+IHdhc20uX2ZyZWUoYWxsb2MpKTtcclxuICAgIHRocm93IGU7XHJcbiAgfVxyXG59O1xyXG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cclxuXHJcbmltcG9ydCB7VGVuc29yfSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xyXG5cclxuLy8gYSBkdW1teSB0eXBlIGRlY2xhcmF0aW9uIGZvciBGbG9hdDE2QXJyYXkgaW4gY2FzZSBhbnkgcG9seWZpbGwgaXMgYXZhaWxhYmxlLlxyXG5kZWNsYXJlIGdsb2JhbCB7XHJcbiAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uYW1pbmctY29udmVudGlvbiwgQHR5cGVzY3JpcHQtZXNsaW50L25vLWV4cGxpY2l0LWFueVxyXG4gIGNvbnN0IEZsb2F0MTZBcnJheTogYW55O1xyXG59XHJcblxyXG4vLyBUaGlzIGZpbGUgaW5jbHVkZXMgY29tbW9uIGRlZmluaXRpb25zLiBUaGV5IGRvIE5PVCBoYXZlIGRlcGVuZGVuY3kgb24gdGhlIFdlYkFzc2VtYmx5IGluc3RhbmNlLlxyXG5cclxuLyoqXHJcbiAqIENvcGllZCBmcm9tIE9OTlggZGVmaW5pdGlvbi4gVXNlIHRoaXMgdG8gZHJvcCBkZXBlbmRlbmN5ICdvbm54X3Byb3RvJyB0byBkZWNyZWFzZSBjb21waWxlZCAuanMgZmlsZSBzaXplLlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGVudW0gRGF0YVR5cGUge1xyXG4gIHVuZGVmaW5lZCA9IDAsXHJcbiAgZmxvYXQgPSAxLFxyXG4gIHVpbnQ4ID0gMixcclxuICBpbnQ4ID0gMyxcclxuICB1aW50MTYgPSA0LFxyXG4gIGludDE2ID0gNSxcclxuICBpbnQzMiA9IDYsXHJcbiAgaW50NjQgPSA3LFxyXG4gIHN0cmluZyA9IDgsXHJcbiAgYm9vbCA9IDksXHJcbiAgZmxvYXQxNiA9IDEwLFxyXG4gIGRvdWJsZSA9IDExLFxyXG4gIHVpbnQzMiA9IDEyLFxyXG4gIHVpbnQ2NCA9IDEzLFxyXG4gIGNvbXBsZXg2NCA9IDE0LFxyXG4gIGNvbXBsZXgxMjggPSAxNSxcclxuICBiZmxvYXQxNiA9IDE2XHJcbn1cclxuXHJcbi8qKlxyXG4gKiBNYXAgc3RyaW5nIHRlbnNvciBkYXRhIHRvIGVudW0gdmFsdWVcclxuICovXHJcbmV4cG9ydCBjb25zdCB0ZW5zb3JEYXRhVHlwZVN0cmluZ1RvRW51bSA9ICh0eXBlOiBzdHJpbmcpOiBEYXRhVHlwZSA9PiB7XHJcbiAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICBjYXNlICdpbnQ4JzpcclxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDg7XHJcbiAgICBjYXNlICd1aW50OCc6XHJcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50ODtcclxuICAgIGNhc2UgJ2Jvb2wnOlxyXG4gICAgICByZXR1cm4gRGF0YVR5cGUuYm9vbDtcclxuICAgIGNhc2UgJ2ludDE2JzpcclxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDE2O1xyXG4gICAgY2FzZSAndWludDE2JzpcclxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQxNjtcclxuICAgIGNhc2UgJ2ludDMyJzpcclxuICAgICAgcmV0dXJuIERhdGFUeXBlLmludDMyO1xyXG4gICAgY2FzZSAndWludDMyJzpcclxuICAgICAgcmV0dXJuIERhdGFUeXBlLnVpbnQzMjtcclxuICAgIGNhc2UgJ2Zsb2F0MTYnOlxyXG4gICAgICByZXR1cm4gRGF0YVR5cGUuZmxvYXQxNjtcclxuICAgIGNhc2UgJ2Zsb2F0MzInOlxyXG4gICAgICByZXR1cm4gRGF0YVR5cGUuZmxvYXQ7XHJcbiAgICBjYXNlICdmbG9hdDY0JzpcclxuICAgICAgcmV0dXJuIERhdGFUeXBlLmRvdWJsZTtcclxuICAgIGNhc2UgJ3N0cmluZyc6XHJcbiAgICAgIHJldHVybiBEYXRhVHlwZS5zdHJpbmc7XHJcbiAgICBjYXNlICdpbnQ2NCc6XHJcbiAgICAgIHJldHVybiBEYXRhVHlwZS5pbnQ2NDtcclxuICAgIGNhc2UgJ3VpbnQ2NCc6XHJcbiAgICAgIHJldHVybiBEYXRhVHlwZS51aW50NjQ7XHJcblxyXG4gICAgZGVmYXVsdDpcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBkYXRhIHR5cGU6ICR7dHlwZX1gKTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogTWFwIGVudW0gdmFsdWUgdG8gc3RyaW5nIHRlbnNvciBkYXRhXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgdGVuc29yRGF0YVR5cGVFbnVtVG9TdHJpbmcgPSAodHlwZVByb3RvOiBEYXRhVHlwZSk6IFRlbnNvci5UeXBlID0+IHtcclxuICBzd2l0Y2ggKHR5cGVQcm90bykge1xyXG4gICAgY2FzZSBEYXRhVHlwZS5pbnQ4OlxyXG4gICAgICByZXR1cm4gJ2ludDgnO1xyXG4gICAgY2FzZSBEYXRhVHlwZS51aW50ODpcclxuICAgICAgcmV0dXJuICd1aW50OCc7XHJcbiAgICBjYXNlIERhdGFUeXBlLmJvb2w6XHJcbiAgICAgIHJldHVybiAnYm9vbCc7XHJcbiAgICBjYXNlIERhdGFUeXBlLmludDE2OlxyXG4gICAgICByZXR1cm4gJ2ludDE2JztcclxuICAgIGNhc2UgRGF0YVR5cGUudWludDE2OlxyXG4gICAgICByZXR1cm4gJ3VpbnQxNic7XHJcbiAgICBjYXNlIERhdGFUeXBlLmludDMyOlxyXG4gICAgICByZXR1cm4gJ2ludDMyJztcclxuICAgIGNhc2UgRGF0YVR5cGUudWludDMyOlxyXG4gICAgICByZXR1cm4gJ3VpbnQzMic7XHJcbiAgICBjYXNlIERhdGFUeXBlLmZsb2F0MTY6XHJcbiAgICAgIHJldHVybiAnZmxvYXQxNic7XHJcbiAgICBjYXNlIERhdGFUeXBlLmZsb2F0OlxyXG4gICAgICByZXR1cm4gJ2Zsb2F0MzInO1xyXG4gICAgY2FzZSBEYXRhVHlwZS5kb3VibGU6XHJcbiAgICAgIHJldHVybiAnZmxvYXQ2NCc7XHJcbiAgICBjYXNlIERhdGFUeXBlLnN0cmluZzpcclxuICAgICAgcmV0dXJuICdzdHJpbmcnO1xyXG4gICAgY2FzZSBEYXRhVHlwZS5pbnQ2NDpcclxuICAgICAgcmV0dXJuICdpbnQ2NCc7XHJcbiAgICBjYXNlIERhdGFUeXBlLnVpbnQ2NDpcclxuICAgICAgcmV0dXJuICd1aW50NjQnO1xyXG5cclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSB0eXBlOiAke3R5cGVQcm90b31gKTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogZ2V0IHRlbnNvciBlbGVtZW50IHNpemUgaW4gYnl0ZXMgYnkgdGhlIGdpdmVuIGRhdGEgdHlwZVxyXG4gKiBAcmV0dXJucyBzaXplIGluIGludGVnZXIgb3IgdW5kZWZpbmVkIGlmIHRoZSBkYXRhIHR5cGUgaXMgbm90IHN1cHBvcnRlZFxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGdldFRlbnNvckVsZW1lbnRTaXplID0gKGRhdGVUeXBlOiBudW1iZXIpOiBudW1iZXJ8XHJcbiAgICB1bmRlZmluZWQgPT4gW3VuZGVmaW5lZCwgNCwgMSwgMSwgMiwgMiwgNCwgOCwgdW5kZWZpbmVkLCAxLCAyLCA4LCA0LCA4LCB1bmRlZmluZWQsIHVuZGVmaW5lZCwgdW5kZWZpbmVkXVtkYXRlVHlwZV07XHJcblxyXG4vKipcclxuICogZ2V0IHR5cGVkIGFycmF5IGNvbnN0cnVjdG9yIGJ5IHRoZSBnaXZlbiB0ZW5zb3IgdHlwZVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IHRlbnNvclR5cGVUb1R5cGVkQXJyYXlDb25zdHJ1Y3RvciA9ICh0eXBlOiBUZW5zb3IuVHlwZSk6IEZsb2F0MzJBcnJheUNvbnN0cnVjdG9yfFVpbnQ4QXJyYXlDb25zdHJ1Y3RvcnxcclxuICAgIEludDhBcnJheUNvbnN0cnVjdG9yfFVpbnQxNkFycmF5Q29uc3RydWN0b3J8SW50MTZBcnJheUNvbnN0cnVjdG9yfEludDMyQXJyYXlDb25zdHJ1Y3RvcnxCaWdJbnQ2NEFycmF5Q29uc3RydWN0b3J8XHJcbiAgICBVaW50OEFycmF5Q29uc3RydWN0b3J8RmxvYXQ2NEFycmF5Q29uc3RydWN0b3J8VWludDMyQXJyYXlDb25zdHJ1Y3RvcnxCaWdVaW50NjRBcnJheUNvbnN0cnVjdG9yID0+IHtcclxuICAgICAgc3dpdGNoICh0eXBlKSB7XHJcbiAgICAgICAgY2FzZSAnZmxvYXQxNic6XHJcbiAgICAgICAgICAvLyBhbGxvdyBGbG9hdDE2QXJyYXkgcG9seWZpbGwuXHJcbiAgICAgICAgICByZXR1cm4gdHlwZW9mIEZsb2F0MTZBcnJheSAhPT0gJ3VuZGVmaW5lZCcgJiYgRmxvYXQxNkFycmF5LmZyb20gPyBGbG9hdDE2QXJyYXkgOiBVaW50MTZBcnJheTtcclxuICAgICAgICBjYXNlICdmbG9hdDMyJzpcclxuICAgICAgICAgIHJldHVybiBGbG9hdDMyQXJyYXk7XHJcbiAgICAgICAgY2FzZSAndWludDgnOlxyXG4gICAgICAgICAgcmV0dXJuIFVpbnQ4QXJyYXk7XHJcbiAgICAgICAgY2FzZSAnaW50OCc6XHJcbiAgICAgICAgICByZXR1cm4gSW50OEFycmF5O1xyXG4gICAgICAgIGNhc2UgJ3VpbnQxNic6XHJcbiAgICAgICAgICByZXR1cm4gVWludDE2QXJyYXk7XHJcbiAgICAgICAgY2FzZSAnaW50MTYnOlxyXG4gICAgICAgICAgcmV0dXJuIEludDE2QXJyYXk7XHJcbiAgICAgICAgY2FzZSAnaW50MzInOlxyXG4gICAgICAgICAgcmV0dXJuIEludDMyQXJyYXk7XHJcbiAgICAgICAgY2FzZSAnYm9vbCc6XHJcbiAgICAgICAgICByZXR1cm4gVWludDhBcnJheTtcclxuICAgICAgICBjYXNlICdmbG9hdDY0JzpcclxuICAgICAgICAgIHJldHVybiBGbG9hdDY0QXJyYXk7XHJcbiAgICAgICAgY2FzZSAndWludDMyJzpcclxuICAgICAgICAgIHJldHVybiBVaW50MzJBcnJheTtcclxuICAgICAgICBjYXNlICdpbnQ2NCc6XHJcbiAgICAgICAgICByZXR1cm4gQmlnSW50NjRBcnJheTtcclxuICAgICAgICBjYXNlICd1aW50NjQnOlxyXG4gICAgICAgICAgcmV0dXJuIEJpZ1VpbnQ2NEFycmF5O1xyXG4gICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYHVuc3VwcG9ydGVkIHR5cGU6ICR7dHlwZX1gKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbi8qKlxyXG4gKiBNYXAgc3RyaW5nIGxvZyBsZXZlbCB0byBpbnRlZ2VyIHZhbHVlXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgbG9nTGV2ZWxTdHJpbmdUb0VudW0gPSAobG9nTGV2ZWw/OiAndmVyYm9zZSd8J2luZm8nfCd3YXJuaW5nJ3wnZXJyb3InfCdmYXRhbCcpOiBudW1iZXIgPT4ge1xyXG4gIHN3aXRjaCAobG9nTGV2ZWwpIHtcclxuICAgIGNhc2UgJ3ZlcmJvc2UnOlxyXG4gICAgICByZXR1cm4gMDtcclxuICAgIGNhc2UgJ2luZm8nOlxyXG4gICAgICByZXR1cm4gMTtcclxuICAgIGNhc2UgJ3dhcm5pbmcnOlxyXG4gICAgICByZXR1cm4gMjtcclxuICAgIGNhc2UgJ2Vycm9yJzpcclxuICAgICAgcmV0dXJuIDM7XHJcbiAgICBjYXNlICdmYXRhbCc6XHJcbiAgICAgIHJldHVybiA0O1xyXG4gICAgZGVmYXVsdDpcclxuICAgICAgdGhyb3cgbmV3IEVycm9yKGB1bnN1cHBvcnRlZCBsb2dnaW5nIGxldmVsOiAke2xvZ0xldmVsfWApO1xyXG4gIH1cclxufTtcclxuXHJcbi8qKlxyXG4gKiBDaGVjayB3aGV0aGVyIHRoZSBnaXZlbiB0ZW5zb3IgdHlwZSBpcyBzdXBwb3J0ZWQgYnkgR1BVIGJ1ZmZlclxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGlzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZSA9ICh0eXBlOiBUZW5zb3IuVHlwZSk6IHR5cGUgaXMgVGVuc29yLkdwdUJ1ZmZlckRhdGFUeXBlcyA9PiB0eXBlID09PSAnZmxvYXQzMicgfHxcclxuICAgIHR5cGUgPT09ICdmbG9hdDE2JyB8fCB0eXBlID09PSAnaW50MzInIHx8IHR5cGUgPT09ICdpbnQ2NCcgfHwgdHlwZSA9PT0gJ3VpbnQzMicgfHwgdHlwZSA9PT0gJ3VpbnQ4JyB8fFxyXG4gICAgdHlwZSA9PT0gJ2Jvb2wnO1xyXG5cclxuLyoqXHJcbiAqIE1hcCBzdHJpbmcgZGF0YSBsb2NhdGlvbiB0byBpbnRlZ2VyIHZhbHVlXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtID0gKGxvY2F0aW9uOiBUZW5zb3IuRGF0YUxvY2F0aW9uKTogbnVtYmVyID0+IHtcclxuICBzd2l0Y2ggKGxvY2F0aW9uKSB7XHJcbiAgICBjYXNlICdub25lJzpcclxuICAgICAgcmV0dXJuIDA7XHJcbiAgICBjYXNlICdjcHUnOlxyXG4gICAgICByZXR1cm4gMTtcclxuICAgIGNhc2UgJ2NwdS1waW5uZWQnOlxyXG4gICAgICByZXR1cm4gMjtcclxuICAgIGNhc2UgJ3RleHR1cmUnOlxyXG4gICAgICByZXR1cm4gMztcclxuICAgIGNhc2UgJ2dwdS1idWZmZXInOlxyXG4gICAgICByZXR1cm4gNDtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgdW5zdXBwb3J0ZWQgZGF0YSBsb2NhdGlvbjogJHtsb2NhdGlvbn1gKTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogTWFwIGludGVnZXIgZGF0YSBsb2NhdGlvbiB0byBzdHJpbmcgdmFsdWVcclxuICovXHJcbmV4cG9ydCBjb25zdCBkYXRhTG9jYXRpb25FbnVtVG9TdHJpbmcgPSAobG9jYXRpb246IG51bWJlcik6IFRlbnNvci5EYXRhTG9jYXRpb258dW5kZWZpbmVkID0+XHJcbiAgICAoWydub25lJywgJ2NwdScsICdjcHUtcGlubmVkJywgJ3RleHR1cmUnLCAnZ3B1LWJ1ZmZlciddIGFzIGNvbnN0KVtsb2NhdGlvbl07XHJcbiIsICJleHBvcnQgY29uc3QgcmVhZEZpbGUgPSB1bmRlZmluZWQ7ZXhwb3J0IGNvbnN0IHJlYWRGaWxlU3luYyA9IHVuZGVmaW5lZDtleHBvcnQgY29uc3QgY3JlYXRlUmVhZFN0cmVhbSA9IHVuZGVmaW5lZDsiLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cclxuXHJcbmltcG9ydCAqIGFzIGZzIGZyb20gJ2ZzJztcclxuaW1wb3J0IHtyZWFkRmlsZX0gZnJvbSAnbm9kZTpmcy9wcm9taXNlcyc7XHJcblxyXG4vKipcclxuICogTG9hZCBhIGZpbGUgaW50byBhIFVpbnQ4QXJyYXkuXHJcbiAqXHJcbiAqIEBwYXJhbSBmaWxlIC0gdGhlIGZpbGUgdG8gbG9hZC4gQ2FuIGJlIGEgVVJML3BhdGgsIGEgQmxvYiwgYW4gQXJyYXlCdWZmZXIsIG9yIGEgVWludDhBcnJheS5cclxuICogQHJldHVybnMgYSBVaW50OEFycmF5IGNvbnRhaW5pbmcgdGhlIGZpbGUgZGF0YS5cclxuICovXHJcbmV4cG9ydCBjb25zdCBsb2FkRmlsZSA9IGFzeW5jKGZpbGU6IHN0cmluZ3xCbG9ifEFycmF5QnVmZmVyTGlrZXxVaW50OEFycmF5KTogUHJvbWlzZTxVaW50OEFycmF5PiA9PiB7XHJcbiAgaWYgKHR5cGVvZiBmaWxlID09PSAnc3RyaW5nJykge1xyXG4gICAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBwcm9jZXNzLnZlcnNpb25zICYmIHByb2Nlc3MudmVyc2lvbnMubm9kZSkge1xyXG4gICAgICAvLyBsb2FkIGZpbGUgaW50byBBcnJheUJ1ZmZlciBpbiBOb2RlLmpzXHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGF3YWl0IHJlYWRGaWxlKGZpbGUpKTtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIGlmIChlLmNvZGUgPT09ICdFUlJfRlNfRklMRV9UT09fTEFSR0UnKSB7XHJcbiAgICAgICAgICAvLyBmaWxlIGlzIHRvbyBsYXJnZSwgdXNlIGZzLmNyZWF0ZVJlYWRTdHJlYW0gaW5zdGVhZFxyXG4gICAgICAgICAgY29uc3Qgc3RyZWFtID0gZnMuY3JlYXRlUmVhZFN0cmVhbShmaWxlKTtcclxuICAgICAgICAgIGNvbnN0IGNodW5rczogVWludDhBcnJheVtdID0gW107XHJcbiAgICAgICAgICBmb3IgYXdhaXQgKGNvbnN0IGNodW5rIG9mIHN0cmVhbSkge1xyXG4gICAgICAgICAgICBjaHVua3MucHVzaChjaHVuayk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoQnVmZmVyLmNvbmNhdChjaHVua3MpKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgdGhyb3cgZTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgLy8gbG9hZCBmaWxlIGludG8gQXJyYXlCdWZmZXIgaW4gYnJvd3NlcnNcclxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChmaWxlKTtcclxuICAgICAgaWYgKCFyZXNwb25zZS5vaykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgZmFpbGVkIHRvIGxvYWQgZXh0ZXJuYWwgZGF0YSBmaWxlOiAke2ZpbGV9YCk7XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgY29udGVudExlbmd0aEhlYWRlciA9IHJlc3BvbnNlLmhlYWRlcnMuZ2V0KCdDb250ZW50LUxlbmd0aCcpO1xyXG4gICAgICBjb25zdCBmaWxlU2l6ZSA9IGNvbnRlbnRMZW5ndGhIZWFkZXIgPyBwYXJzZUludChjb250ZW50TGVuZ3RoSGVhZGVyLCAxMCkgOiAwO1xyXG4gICAgICBpZiAoZmlsZVNpemUgPCAxMDczNzQxODI0IC8qIDFHQiAqLykge1xyXG4gICAgICAgIC8vIHdoZW4gQ29udGVudC1MZW5ndGggaGVhZGVyIGlzIG5vdCBzZXQsIHdlIGNhbm5vdCBkZXRlcm1pbmUgdGhlIGZpbGUgc2l6ZS4gV2UgYXNzdW1lIGl0IGlzIHNtYWxsIGVub3VnaCB0b1xyXG4gICAgICAgIC8vIGxvYWQgaW50byBtZW1vcnkuXHJcbiAgICAgICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGF3YWl0IHJlc3BvbnNlLmFycmF5QnVmZmVyKCkpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGZpbGUgaXMgdG9vIGxhcmdlLCB1c2Ugc3RyZWFtIGluc3RlYWRcclxuICAgICAgICBpZiAoIXJlc3BvbnNlLmJvZHkpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgZmFpbGVkIHRvIGxvYWQgZXh0ZXJuYWwgZGF0YSBmaWxlOiAke2ZpbGV9LCBubyByZXNwb25zZSBib2R5LmApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCByZWFkZXIgPSByZXNwb25zZS5ib2R5LmdldFJlYWRlcigpO1xyXG5cclxuICAgICAgICBsZXQgYnVmZmVyO1xyXG4gICAgICAgIHRyeSB7XHJcbiAgICAgICAgICAvLyB0cnkgdG8gY3JlYXRlIEFycmF5QnVmZmVyIGRpcmVjdGx5XHJcbiAgICAgICAgICBidWZmZXIgPSBuZXcgQXJyYXlCdWZmZXIoZmlsZVNpemUpO1xyXG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICAgIGlmIChlIGluc3RhbmNlb2YgUmFuZ2VFcnJvcikge1xyXG4gICAgICAgICAgICAvLyB1c2UgV2ViQXNzZW1ibHkgTWVtb3J5IHRvIGFsbG9jYXRlIGxhcmdlciBBcnJheUJ1ZmZlclxyXG4gICAgICAgICAgICBjb25zdCBwYWdlcyA9IE1hdGguY2VpbChmaWxlU2l6ZSAvIDY1NTM2KTtcclxuICAgICAgICAgICAgYnVmZmVyID0gbmV3IFdlYkFzc2VtYmx5Lk1lbW9yeSh7aW5pdGlhbDogcGFnZXMsIG1heGltdW06IHBhZ2VzfSkuYnVmZmVyO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgdGhyb3cgZTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcblxyXG4gICAgICAgIGxldCBvZmZzZXQgPSAwO1xyXG4gICAgICAgIC8vIGVzbGludC1kaXNhYmxlLW5leHQtbGluZSBuby1jb25zdGFudC1jb25kaXRpb25cclxuICAgICAgICB3aGlsZSAodHJ1ZSkge1xyXG4gICAgICAgICAgY29uc3Qge2RvbmUsIHZhbHVlfSA9IGF3YWl0IHJlYWRlci5yZWFkKCk7XHJcbiAgICAgICAgICBpZiAoZG9uZSkge1xyXG4gICAgICAgICAgICBicmVhaztcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnN0IGNodW5rU2l6ZSA9IHZhbHVlLmJ5dGVMZW5ndGg7XHJcbiAgICAgICAgICBjb25zdCBjaHVuayA9IG5ldyBVaW50OEFycmF5KGJ1ZmZlciwgb2Zmc2V0LCBjaHVua1NpemUpO1xyXG4gICAgICAgICAgY2h1bmsuc2V0KHZhbHVlKTtcclxuICAgICAgICAgIG9mZnNldCArPSBjaHVua1NpemU7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHJldHVybiBuZXcgVWludDhBcnJheShidWZmZXIsIDAsIGZpbGVTaXplKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICB9IGVsc2UgaWYgKGZpbGUgaW5zdGFuY2VvZiBCbG9iKSB7XHJcbiAgICByZXR1cm4gbmV3IFVpbnQ4QXJyYXkoYXdhaXQgZmlsZS5hcnJheUJ1ZmZlcigpKTtcclxuICB9IGVsc2UgaWYgKGZpbGUgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XHJcbiAgICByZXR1cm4gZmlsZTtcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIG5ldyBVaW50OEFycmF5KGZpbGUpO1xyXG4gIH1cclxufTtcclxuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXHJcblxyXG5pbXBvcnQge0VudiwgSW5mZXJlbmNlU2Vzc2lvbiwgVGVuc29yfSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xyXG5cclxuaW1wb3J0IHtTZXJpYWxpemFibGVJbnRlcm5hbEJ1ZmZlciwgU2VyaWFsaXphYmxlU2Vzc2lvbk1ldGFkYXRhLCBTZXJpYWxpemFibGVUZW5zb3JNZXRhZGF0YSwgVGVuc29yTWV0YWRhdGF9IGZyb20gJy4vcHJveHktbWVzc2FnZXMnO1xyXG5pbXBvcnQge3NldFJ1bk9wdGlvbnN9IGZyb20gJy4vcnVuLW9wdGlvbnMnO1xyXG5pbXBvcnQge3NldFNlc3Npb25PcHRpb25zfSBmcm9tICcuL3Nlc3Npb24tb3B0aW9ucyc7XHJcbmltcG9ydCB7ZGF0YUxvY2F0aW9uU3RyaW5nVG9FbnVtLCBnZXRUZW5zb3JFbGVtZW50U2l6ZSwgaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlLCBsb2dMZXZlbFN0cmluZ1RvRW51bSwgdGVuc29yRGF0YVR5cGVFbnVtVG9TdHJpbmcsIHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtLCB0ZW5zb3JUeXBlVG9UeXBlZEFycmF5Q29uc3RydWN0b3J9IGZyb20gJy4vd2FzbS1jb21tb24nO1xyXG5pbXBvcnQge2dldEluc3RhbmNlfSBmcm9tICcuL3dhc20tZmFjdG9yeSc7XHJcbmltcG9ydCB7YWxsb2NXYXNtU3RyaW5nLCBjaGVja0xhc3RFcnJvcn0gZnJvbSAnLi93YXNtLXV0aWxzJztcclxuaW1wb3J0IHtsb2FkRmlsZX0gZnJvbSAnLi93YXNtLXV0aWxzLWxvYWQtZmlsZSc7XHJcblxyXG4vLyAjcmVnaW9uIEluaXRpYWxpemF0aW9uc1xyXG5cclxuLyoqXHJcbiAqIFRoZXJlIGFyZSA0IGRpZmZlcmVudCBcImluaXRpYWxpemF0aW9uXCIgc3RlcHMgZm9yIE9SVC4gVGhleSBoYXBwZW4gaW4gZGlmZmVyZW50IHBsYWNlcyBhbmQgZGlmZmVyZW50IHRpbWUuXHJcbiAqXHJcbiAqIDEuIEphdmFTY3JpcHQgaW5pdGlhbGl6YXRpb24gZm9yIG9ubnhydW50aW1lLWNvbW1vbiBhbmQgb25ueHJ1bnRpbWUtd2ViLlxyXG4gKiAgICBUaGlzIGlzIHRoZSBmaXJzdCBpbml0aWFsaXphdGlvbiBzdGVwLiBJbiB0aGlzIHN0ZXAsIG9ubnhydW50aW1lLXdlYiBjYWxscyBvbm54cnVudGltZS1jb21tb24ncyByZWdpc3RlckJhY2tlbmQoKVxyXG4gKiBmdW5jdGlvbiBtdWx0aXBsZSB0aW1lcyB0byByZWdpc3RlciBhbGwgdGhlIGF2YWlsYWJsZSBiYWNrZW5kcy4gVGhlIGJhY2tlbmQgcmVnaXN0cmF0aW9uIGlzIHZlcnkgZmFzdC4gSXQgb25seVxyXG4gKiByZWdpc3RlcnMgdGhlIGJhY2tlbmQgbmFtZSB3aXRoIHRoZSB1bmluaXRpYWxpemVkIGJhY2tlbmQgb2JqZWN0LiBObyBoZWF2eSBpbml0aWFsaXphdGlvbiBpcyBkb25lIGluIHRoaXMgc3RlcC5cclxuICogICAgUmVmZXIgdG8gd2ViL2xpYi9pbmRleC50cyBmb3IgdGhlIGJhY2tlbmQgcmVnaXN0cmF0aW9uLlxyXG4gKlxyXG4gKiAyLiBXZWJBc3NlbWJseSBhcnRpZmFjdCBpbml0aWFsaXphdGlvbi5cclxuICogICAgVGhpcyBoYXBwZW5zIHdoZW4gYW55IHJlZ2lzdGVyZWQgd2FzbSBiYWNrZW5kIGlzIHVzZWQgZm9yIHRoZSBmaXJzdCB0aW1lIChpZS4gYG9ydC5JbmZlcmVuY2VTZXNzaW9uLmNyZWF0ZSgpYCBvclxyXG4gKiBgb3J0LlRyYWluaW5nU2Vzc2lvbi5jcmVhdGUoKWAgaXMgY2FsbGVkKS4gSW4gdGhpcyBzdGVwLCBvbm54cnVudGltZS13ZWIgZG9lcyB0aGUgZm9sbG93aW5nczpcclxuICogICAgIC0gY3JlYXRlIGEgcHJveHkgd29ya2VyIGFuZCBtYWtlIHN1cmUgdGhlIHByb3h5IHdvcmtlciBpcyByZWFkeSB0byByZWNlaXZlIG1lc3NhZ2VzLCBpZiBwcm94eSBpcyBlbmFibGVkLlxyXG4gKiAgICAgLSBwZXJmb3JtIGZlYXR1cmUgZGV0ZWN0aW9uLCBsb2NhdGUgY29ycmVjdCBXZWJBc3NlbWJseSBhcnRpZmFjdCBwYXRoIGFuZCBjYWxsIHRoZSBFbXNjcmlwdGVuIGdlbmVyYXRlZFxyXG4gKiBKYXZhU2NyaXB0IGNvZGUgdG8gaW5pdGlhbGl6ZSB0aGUgV2ViQXNzZW1ibHkgcnVudGltZS5cclxuICogICAgICAgICAtIGlmIHByb3h5IGlzIGVuYWJsZWQsIHRoaXMgc3RlcCBoYXBwZW5zIGluIHRoZSBwcm94eSB3b3JrZXIgdXNpbmcgbWVzc2FnZSAnaW5pdC13YXNtJy5cclxuICogICAgICAgICAtIGRvd25sb2FkaW5nIHRoZSAnb3J0LXdhc217Li4ufS53YXNtJyBmaWxlIGlzIGRvbmUgaW4gdGhpcyBzdGVwLlxyXG4gKiAgICAgICAgIC0gaWYgbXVsdGktdGhyZWFkIGlzIGVuYWJsZWQsIG9uZSBvciBtb3JlIHdlYndvcmtlciB3aWxsIGJlIGNyZWF0ZWQgdG8gaW5pdGlhbGl6ZSB0aGUgUFRocmVhZCB0aHJlYWRwb29sLlxyXG4gKlxyXG4gKiAzLiBPUlQgZW52aXJvbm1lbnQgaW5pdGlhbGl6YXRpb24uXHJcbiAqICAgIFRoaXMgaGFwcGVucyBhZnRlciBzdGVwIDIuIEluIHRoaXMgc3RlcCwgb25ueHJ1bnRpbWUtd2ViIHBlcmZvcm1zIE9OTlggUnVudGltZSBlbnZpcm9ubWVudCBpbml0aWFsaXphdGlvbi5cclxuICogRnVuY3Rpb24gYF9PcnRJbml0KClgIGlzIGNhbGxlZCBpbiB0aGlzIHN0ZXAuXHJcbiAqICAgICAtIGlmIHByb3h5IGlzIGVuYWJsZWQsIHRoaXMgc3RlcCBoYXBwZW5zIGluIHRoZSBwcm94eSB3b3JrZXIgdXNpbmcgbWVzc2FnZSAnaW5pdC1vcnQnLlxyXG4gKiAgICAgLSBsb2dnaW5nIGxldmVsIChvcnQuZW52LmxvZ0xldmVsKSBhbmQgdGhyZWFkIG51bWJlciAob3J0LmVudi53YXNtLm51bVRocmVhZHMpIGFyZSBzZXQgaW4gdGhpcyBzdGVwLlxyXG4gKlxyXG4gKiA0LiBTZXNzaW9uIGluaXRpYWxpemF0aW9uLlxyXG4gKiAgICBUaGlzIGhhcHBlbnMgd2hlbiBgb3J0LkluZmVyZW5jZVNlc3Npb24uY3JlYXRlKClgIG9yIGBvcnQuVHJhaW5pbmdTZXNzaW9uLmNyZWF0ZSgpYCBpcyBjYWxsZWQuIFVubGlrZSB0aGUgZmlyc3QgM1xyXG4gKiBzdGVwcyAodGhleSBvbmx5IGNhbGxlZCBvbmNlKSwgdGhpcyBzdGVwIHdpbGwgYmUgZG9uZSBmb3IgZWFjaCBzZXNzaW9uLiBJbiB0aGlzIHN0ZXAsIG9ubnhydW50aW1lLXdlYiBkb2VzIHRoZVxyXG4gKiBmb2xsb3dpbmdzOlxyXG4gKiAgICBJZiB0aGUgcGFyYW1ldGVyIGlzIGEgVVJMOlxyXG4gKiAgICAtIGRvd25sb2FkIHRoZSBtb2RlbCBkYXRhIGZyb20gdGhlIFVSTC5cclxuICogICAgLSBjb3B5IHRoZSBtb2RlbCBkYXRhIHRvIHRoZSBXQVNNIGhlYXAuIChwcm94eTogJ2NvcHktZnJvbScpXHJcbiAqICAgIC0gZGVyZWZlcmVuY2UgdGhlIG1vZGVsIGJ1ZmZlci4gVGhpcyBzdGVwIGFsbG93cyB0aGUgb3JpZ2luYWwgQXJyYXlCdWZmZXIgdG8gYmUgZ2FyYmFnZSBjb2xsZWN0ZWQuXHJcbiAqICAgIC0gY2FsbCBgX09ydENyZWF0ZVNlc3Npb24oKWAgdG8gY3JlYXRlIHRoZSBzZXNzaW9uLiAocHJveHk6ICdjcmVhdGUnKVxyXG4gKlxyXG4gKiAgICBJZiB0aGUgcGFyYW1ldGVyIGlzIGEgVWludDhBcnJheSBvYmplY3Q6XHJcbiAqICAgIC0gY29weSB0aGUgbW9kZWwgZGF0YSB0byB0aGUgV0FTTSBoZWFwLiAocHJveHk6ICdjb3B5LWZyb20nKVxyXG4gKiAgICAtIGNhbGwgYF9PcnRDcmVhdGVTZXNzaW9uKClgIHRvIGNyZWF0ZSB0aGUgc2Vzc2lvbi4gKHByb3h5OiAnY3JlYXRlJylcclxuICpcclxuICpcclxuICovXHJcblxyXG4vKipcclxuICogaW5pdGlhbGl6ZSBPUlQgZW52aXJvbm1lbnQuXHJcbiAqXHJcbiAqIEBwYXJhbSBudW1UaHJlYWRzIFNldEdsb2JhbEludHJhT3BOdW1UaHJlYWRzKG51bVRocmVhZHMpXHJcbiAqIEBwYXJhbSBsb2dnaW5nTGV2ZWwgQ3JlYXRlRW52KHN0YXRpY19jYXN0PE9ydExvZ2dpbmdMZXZlbD4obG9nZ2luZ19sZXZlbCkpXHJcbiAqL1xyXG5jb25zdCBpbml0T3J0ID0gKG51bVRocmVhZHM6IG51bWJlciwgbG9nZ2luZ0xldmVsOiBudW1iZXIpOiB2b2lkID0+IHtcclxuICBjb25zdCBlcnJvckNvZGUgPSBnZXRJbnN0YW5jZSgpLl9PcnRJbml0KG51bVRocmVhZHMsIGxvZ2dpbmdMZXZlbCk7XHJcbiAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xyXG4gICAgY2hlY2tMYXN0RXJyb3IoJ0NhblxcJ3QgaW5pdGlhbGl6ZSBvbm54cnVudGltZS4nKTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogaW50aWFsaXplIHJ1bnRpbWUgZW52aXJvbm1lbnQuXHJcbiAqIEBwYXJhbSBlbnYgcGFzc2VkIGluIHRoZSBlbnZpcm9ubWVudCBjb25maWcgb2JqZWN0LlxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGluaXRSdW50aW1lID0gYXN5bmMoZW52OiBFbnYpOiBQcm9taXNlPHZvaWQ+ID0+IHtcclxuICAvLyBpbml0IE9SVFxyXG4gIGluaXRPcnQoZW52Lndhc20ubnVtVGhyZWFkcyEsIGxvZ0xldmVsU3RyaW5nVG9FbnVtKGVudi5sb2dMZXZlbCkpO1xyXG59O1xyXG5cclxuLyoqXHJcbiAqIHBlcmZvcm0gRVAgc3BlY2lmaWMgaW5pdGlhbGl6YXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSBlbnZcclxuICogQHBhcmFtIGVwTmFtZVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGluaXRFcCA9IGFzeW5jKGVudjogRW52LCBlcE5hbWU6IHN0cmluZyk6IFByb21pc2U8dm9pZD4gPT4ge1xyXG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSkge1xyXG4gICAgLy8gZXNsaW50LWRpc2FibGUtbmV4dC1saW5lIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHMsIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXNcclxuICAgIGNvbnN0IGluaXRKc2VwID0gcmVxdWlyZSgnLi9qc2VwL2luaXQnKS5pbml0O1xyXG5cclxuICAgIGlmIChlcE5hbWUgPT09ICd3ZWJncHUnKSB7XHJcbiAgICAgIC8vIHBlcmZvcm0gV2ViR1BVIGF2YWlsYWJpbGl0eSBjaGVja1xyXG4gICAgICBpZiAodHlwZW9mIG5hdmlnYXRvciA9PT0gJ3VuZGVmaW5lZCcgfHwgIW5hdmlnYXRvci5ncHUpIHtcclxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1dlYkdQVSBpcyBub3Qgc3VwcG9ydGVkIGluIGN1cnJlbnQgZW52aXJvbm1lbnQnKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgbGV0IGFkYXB0ZXIgPSBlbnYud2ViZ3B1LmFkYXB0ZXIgYXMgR1BVQWRhcHRlciB8IG51bGw7XHJcbiAgICAgIGlmICghYWRhcHRlcikge1xyXG4gICAgICAgIC8vIGlmIGFkYXB0ZXIgaXMgbm90IHNldCwgcmVxdWVzdCBhIG5ldyBhZGFwdGVyLlxyXG4gICAgICAgIGNvbnN0IHBvd2VyUHJlZmVyZW5jZSA9IGVudi53ZWJncHUucG93ZXJQcmVmZXJlbmNlO1xyXG4gICAgICAgIGlmIChwb3dlclByZWZlcmVuY2UgIT09IHVuZGVmaW5lZCAmJiBwb3dlclByZWZlcmVuY2UgIT09ICdsb3ctcG93ZXInICYmXHJcbiAgICAgICAgICAgIHBvd2VyUHJlZmVyZW5jZSAhPT0gJ2hpZ2gtcGVyZm9ybWFuY2UnKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgcG93ZXJQcmVmZXJlbmNlIHNldHRpbmc6IFwiJHtwb3dlclByZWZlcmVuY2V9XCJgKTtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgZm9yY2VGYWxsYmFja0FkYXB0ZXIgPSBlbnYud2ViZ3B1LmZvcmNlRmFsbGJhY2tBZGFwdGVyO1xyXG4gICAgICAgIGlmIChmb3JjZUZhbGxiYWNrQWRhcHRlciAhPT0gdW5kZWZpbmVkICYmIHR5cGVvZiBmb3JjZUZhbGxiYWNrQWRhcHRlciAhPT0gJ2Jvb2xlYW4nKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEludmFsaWQgZm9yY2VGYWxsYmFja0FkYXB0ZXIgc2V0dGluZzogXCIke2ZvcmNlRmFsbGJhY2tBZGFwdGVyfVwiYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGFkYXB0ZXIgPSBhd2FpdCBuYXZpZ2F0b3IuZ3B1LnJlcXVlc3RBZGFwdGVyKHtwb3dlclByZWZlcmVuY2UsIGZvcmNlRmFsbGJhY2tBZGFwdGVyfSk7XHJcbiAgICAgICAgaWYgKCFhZGFwdGVyKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXHJcbiAgICAgICAgICAgICAgJ0ZhaWxlZCB0byBnZXQgR1BVIGFkYXB0ZXIuICcgK1xyXG4gICAgICAgICAgICAgICdZb3UgbWF5IG5lZWQgdG8gZW5hYmxlIGZsYWcgXCItLWVuYWJsZS11bnNhZmUtd2ViZ3B1XCIgaWYgeW91IGFyZSB1c2luZyBDaHJvbWUuJyk7XHJcbiAgICAgICAgfVxyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIC8vIGlmIGFkYXB0ZXIgaXMgc2V0LCB2YWxpZGF0ZSBpdC5cclxuICAgICAgICBpZiAodHlwZW9mIGFkYXB0ZXIubGltaXRzICE9PSAnb2JqZWN0JyB8fCB0eXBlb2YgYWRhcHRlci5mZWF0dXJlcyAhPT0gJ29iamVjdCcgfHxcclxuICAgICAgICAgICAgdHlwZW9mIGFkYXB0ZXIucmVxdWVzdERldmljZSAhPT0gJ2Z1bmN0aW9uJykge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdJbnZhbGlkIEdQVSBhZGFwdGVyIHNldCBpbiBgZW52LndlYmdwdS5hZGFwdGVyYC4gSXQgbXVzdCBiZSBhIEdQVUFkYXB0ZXIgb2JqZWN0LicpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKCFlbnYud2FzbS5zaW1kKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICAnTm90IHN1cHBvcnRlZCBmb3IgV2ViR1BVPU9OIGFuZCBTSU1EPU9GRi4gUGxlYXNlIHNldCBgZW52Lndhc20uc2ltZGAgdG8gdHJ1ZSB3aGVuIHVzaW5nIGB3ZWJncHVgIEVQJyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGF3YWl0IGluaXRKc2VwKCd3ZWJncHUnLCBnZXRJbnN0YW5jZSgpLCBlbnYsIGFkYXB0ZXIpO1xyXG4gICAgfVxyXG4gICAgaWYgKGVwTmFtZSA9PT0gJ3dlYm5uJykge1xyXG4gICAgICAvLyBwZXJmb3JtIFdlYk5OIGF2YWlsYWJpbGl0eSBjaGVja1xyXG4gICAgICBpZiAodHlwZW9mIG5hdmlnYXRvciA9PT0gJ3VuZGVmaW5lZCcgfHwgIShuYXZpZ2F0b3IgYXMgdW5rbm93biBhcyB7bWw6IHVua25vd259KS5tbCkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignV2ViTk4gaXMgbm90IHN1cHBvcnRlZCBpbiBjdXJyZW50IGVudmlyb25tZW50Jyk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGF3YWl0IGluaXRKc2VwKCd3ZWJubicsIGdldEluc3RhbmNlKCksIGVudik7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxuLy8gI2VuZHJlZ2lvbiBJbml0aWFsaXphdGlvbnNcclxuXHJcbi8qKlxyXG4gKiB2YWxpZCBkYXRhIGxvY2F0aW9ucyBmb3IgaW5wdXQvb3V0cHV0IHRlbnNvcnMuXHJcbiAqL1xyXG50eXBlIFN1cHBvcnRlZFRlbnNvckRhdGFMb2NhdGlvbkZvcklucHV0T3V0cHV0ID0gJ2NwdSd8J2NwdS1waW5uZWQnfCdncHUtYnVmZmVyJztcclxuXHJcbnR5cGUgSU9CaW5kaW5nU3RhdGUgPSB7XHJcbiAgLyoqXHJcbiAgICogdGhlIGhhbmRsZSBvZiBJTyBiaW5kaW5nLlxyXG4gICAqL1xyXG4gIHJlYWRvbmx5IGhhbmRsZTogbnVtYmVyO1xyXG5cclxuICAvKipcclxuICAgKiB0aGUgcHJlZmVycmVkIGxvY2F0aW9uIGZvciBlYWNoIG91dHB1dCB0ZW5zb3IuXHJcbiAgICpcclxuICAgKiB2YWx1ZSBpcyBvbmUgb2YgJ2NwdScsICdjcHUtcGlubmVkJywgJ2dwdS1idWZmZXInLlxyXG4gICAqL1xyXG4gIHJlYWRvbmx5IG91dHB1dFByZWZlcnJlZExvY2F0aW9uczogcmVhZG9ubHkgU3VwcG9ydGVkVGVuc29yRGF0YUxvY2F0aW9uRm9ySW5wdXRPdXRwdXRbXTtcclxuXHJcbiAgLyoqXHJcbiAgICogZW51bSB2YWx1ZSBvZiB0aGUgcHJlZmVycmVkIGxvY2F0aW9uIGZvciBlYWNoIG91dHB1dCB0ZW5zb3IuXHJcbiAgICovXHJcbiAgcmVhZG9ubHkgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZDogcmVhZG9ubHkgbnVtYmVyW107XHJcbn07XHJcblxyXG4vKipcclxuICogIHR1cGxlIGVsZW1lbnRzIGFyZTogSW5mZXJlbmNlU2Vzc2lvbiBJRDsgaW5wdXROYW1lc1VURjhFbmNvZGVkOyBvdXRwdXROYW1lc1VURjhFbmNvZGVkOyBiaW5kaW5nU3RhdGVcclxuICovXHJcbnR5cGUgU2Vzc2lvbk1ldGFkYXRhID0gW1xyXG4gIGluZmVyZW5jZVNlc3Npb25JZDogbnVtYmVyLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQ6IG51bWJlcltdLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkOiBudW1iZXJbXSxcclxuICBiaW5kaW5nU3RhdGU6IElPQmluZGluZ1N0YXRlfG51bGwsIGVuYWJsZUdyYXBoQ2FwdHVyZTogYm9vbGVhbiwgaW5wdXRPdXRwdXRCb3VuZDogYm9vbGVhblxyXG5dO1xyXG5cclxuY29uc3QgYWN0aXZlU2Vzc2lvbnMgPSBuZXcgTWFwPG51bWJlciwgU2Vzc2lvbk1ldGFkYXRhPigpO1xyXG5cclxuLyoqXHJcbiAqIGdldCB0aGUgaW5wdXQvb3V0cHV0IGNvdW50IG9mIHRoZSBzZXNzaW9uLlxyXG4gKiBAcGFyYW0gc2Vzc2lvbkhhbmRsZSB0aGUgaGFuZGxlIHJlcHJlc2VudGluZyB0aGUgc2Vzc2lvbi4gc2hvdWxkIGJlIG5vbi16ZXJvLlxyXG4gKiBAcmV0dXJucyBhIHR1cGxlIGluY2x1ZGluZyAyIG51bWJlcnMsIHJlcHJlc2VudGluZyB0aGUgaW5wdXQgY291bnQgYW5kIG91dHB1dCBjb3VudC5cclxuICovXHJcbmNvbnN0IGdldFNlc3Npb25JbnB1dE91dHB1dENvdW50ID0gKHNlc3Npb25IYW5kbGU6IG51bWJlcik6IFtudW1iZXIsIG51bWJlcl0gPT4ge1xyXG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xyXG4gIGNvbnN0IHN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcclxuICB0cnkge1xyXG4gICAgY29uc3QgZGF0YU9mZnNldCA9IHdhc20uc3RhY2tBbGxvYyg4KTtcclxuICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEdldElucHV0T3V0cHV0Q291bnQoc2Vzc2lvbkhhbmRsZSwgZGF0YU9mZnNldCwgZGF0YU9mZnNldCArIDQpO1xyXG4gICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xyXG4gICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBnZXQgc2Vzc2lvbiBpbnB1dC9vdXRwdXQgY291bnQuJyk7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gW3dhc20uSEVBUDMyW2RhdGFPZmZzZXQgLyA0XSwgd2FzbS5IRUFQMzJbZGF0YU9mZnNldCAvIDQgKyAxXV07XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogYWxsb2NhdGUgdGhlIG1lbW9yeSBhbmQgbWVtY3B5IHRoZSBleHRlcm5hbCBidWZmZXIuXHJcbiAqXHJcbiAqIEBwYXJhbSBtb2RlbCAtIHRoZSBleHRlcm5hbCBidWZmZXIgY29udGFpbmluZyB0aGUgbW9kZWwgZGF0YS4gTXVzdCBub3QgYmUgdGhlIHNhbWUgYnVmZmVyIGFzIHRoZSBXQVNNIGhlYXAuXHJcbiAqIEByZXR1cm5zIGEgMi1lbGVtZW50cyB0dXBsZSAtIHRoZSBwb2ludGVyIGFuZCBzaXplIG9mIHRoZSBhbGxvY2F0ZWQgYnVmZmVyXHJcbiAqL1xyXG5leHBvcnQgY29uc3QgY29weUZyb21FeHRlcm5hbEJ1ZmZlciA9IChtb2RlbDogVWludDhBcnJheSk6IFtudW1iZXIsIG51bWJlcl0gPT4ge1xyXG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xyXG4gIGNvbnN0IG1vZGVsRGF0YU9mZnNldCA9IHdhc20uX21hbGxvYyhtb2RlbC5ieXRlTGVuZ3RoKTtcclxuICBpZiAobW9kZWxEYXRhT2Zmc2V0ID09PSAwKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYENhbid0IGNyZWF0ZSBhIHNlc3Npb24uIGZhaWxlZCB0byBhbGxvY2F0ZSBhIGJ1ZmZlciBvZiBzaXplICR7bW9kZWwuYnl0ZUxlbmd0aH0uYCk7XHJcbiAgfVxyXG4gIHdhc20uSEVBUFU4LnNldChtb2RlbCwgbW9kZWxEYXRhT2Zmc2V0KTtcclxuICByZXR1cm4gW21vZGVsRGF0YU9mZnNldCwgbW9kZWwuYnl0ZUxlbmd0aF07XHJcbn07XHJcblxyXG4vKipcclxuICogY3JlYXRlIGFuIGluZmVyZW5jZSBzZXNzaW9uIGZyb20gYSBtb2RlbCBkYXRhIGJ1ZmZlci5cclxuICpcclxuICogQHBhcmFtIG1vZGVsRGF0YSAtIGVpdGhlciBhIFVpbnQ4QXJyYXkgb2JqZWN0IHJlcHJlc2VudGluZyB0aGUgbW9kZWwgZGF0YSwgb3IgYSAyLWVsZW1lbnRzIHR1cGxlIGNvbnRhaW5pbmcgdGhlXHJcbiAqICAgICBwb2ludGVyIGFuZCBzaXplIG9mIHRoZSBtb2RlbCBkYXRhIGJ1ZmZlci5cclxuICogQHBhcmFtIG9wdGlvbnMgYW4gb3B0aW9uYWwgc2Vzc2lvbiBvcHRpb25zIG9iamVjdC5cclxuICogQHJldHVybnMgYSAzLWVsZW1lbnRzIHR1cGxlIGNvbnRhaW5pbmcgW3Nlc3Npb24gaGFuZGxlLCBpbnB1dCBuYW1lcywgb3V0cHV0IG5hbWVzXVxyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGNyZWF0ZVNlc3Npb24gPSBhc3luYyhcclxuICAgIG1vZGVsRGF0YTogVWludDhBcnJheXxTZXJpYWxpemFibGVJbnRlcm5hbEJ1ZmZlcixcclxuICAgIG9wdGlvbnM/OiBJbmZlcmVuY2VTZXNzaW9uLlNlc3Npb25PcHRpb25zKTogUHJvbWlzZTxTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGE+ID0+IHtcclxuICBsZXQgbW9kZWxEYXRhT2Zmc2V0OiBudW1iZXIsIG1vZGVsRGF0YUxlbmd0aDogbnVtYmVyO1xyXG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xyXG5cclxuICBpZiAoQXJyYXkuaXNBcnJheShtb2RlbERhdGEpKSB7XHJcbiAgICAvLyBpZiBtb2RlbCBkYXRhIGlzIGFuIGFycmF5LCBpdCBtdXN0IGJlIGEgMi1lbGVtZW50cyB0dXBsZSBjb250YWluaW5nIHRoZSBwb2ludGVyIGFuZCBzaXplIG9mIHRoZSBtb2RlbCBkYXRhXHJcbiAgICBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbERhdGFMZW5ndGhdID0gbW9kZWxEYXRhO1xyXG4gIH0gZWxzZSBpZiAobW9kZWxEYXRhLmJ1ZmZlciA9PT0gd2FzbS5IRUFQVTguYnVmZmVyKSB7XHJcbiAgICAvLyBpZiBtb2RlbCBkYXRhIHVzZXMgdGhlIHNhbWUgYnVmZmVyIGFzIHRoZSBXQVNNIGhlYXAsIHdlIGRvbid0IG5lZWQgdG8gY29weSBpdC5cclxuICAgIFttb2RlbERhdGFPZmZzZXQsIG1vZGVsRGF0YUxlbmd0aF0gPSBbbW9kZWxEYXRhLmJ5dGVPZmZzZXQsIG1vZGVsRGF0YS5ieXRlTGVuZ3RoXTtcclxuICB9IGVsc2Uge1xyXG4gICAgLy8gb3RoZXJ3aXNlLCBjb3B5IHRoZSBtb2RlbCBkYXRhIHRvIHRoZSBXQVNNIGhlYXAuXHJcbiAgICBbbW9kZWxEYXRhT2Zmc2V0LCBtb2RlbERhdGFMZW5ndGhdID0gY29weUZyb21FeHRlcm5hbEJ1ZmZlcihtb2RlbERhdGEpO1xyXG4gIH1cclxuXHJcbiAgbGV0IHNlc3Npb25IYW5kbGUgPSAwO1xyXG4gIGxldCBzZXNzaW9uT3B0aW9uc0hhbmRsZSA9IDA7XHJcbiAgbGV0IGlvQmluZGluZ0hhbmRsZSA9IDA7XHJcbiAgbGV0IGFsbG9jczogbnVtYmVyW10gPSBbXTtcclxuICBjb25zdCBpbnB1dE5hbWVzVVRGOEVuY29kZWQgPSBbXTtcclxuICBjb25zdCBvdXRwdXROYW1lc1VURjhFbmNvZGVkID0gW107XHJcblxyXG4gIHRyeSB7XHJcbiAgICBbc2Vzc2lvbk9wdGlvbnNIYW5kbGUsIGFsbG9jc10gPSBzZXRTZXNzaW9uT3B0aW9ucyhvcHRpb25zKTtcclxuXHJcbiAgICBpZiAob3B0aW9ucz8uZXh0ZXJuYWxEYXRhICYmIHdhc20ubW91bnRFeHRlcm5hbERhdGEpIHtcclxuICAgICAgY29uc3QgbG9hZGluZ1Byb21pc2VzID0gW107XHJcbiAgICAgIGZvciAoY29uc3QgZmlsZSBvZiBvcHRpb25zLmV4dGVybmFsRGF0YSkge1xyXG4gICAgICAgIGNvbnN0IHBhdGggPSB0eXBlb2YgZmlsZSA9PT0gJ3N0cmluZycgPyBmaWxlIDogZmlsZS5wYXRoO1xyXG4gICAgICAgIGxvYWRpbmdQcm9taXNlcy5wdXNoKGxvYWRGaWxlKHR5cGVvZiBmaWxlID09PSAnc3RyaW5nJyA/IGZpbGUgOiBmaWxlLmRhdGEpLnRoZW4oZGF0YSA9PiB7XHJcbiAgICAgICAgICB3YXNtLm1vdW50RXh0ZXJuYWxEYXRhIShwYXRoLCBkYXRhKTtcclxuICAgICAgICB9KSk7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIC8vIHdhaXQgZm9yIGFsbCBleHRlcm5hbCBkYXRhIGZpbGVzIHRvIGJlIGxvYWRlZFxyXG4gICAgICBhd2FpdCBQcm9taXNlLmFsbChsb2FkaW5nUHJvbWlzZXMpO1xyXG4gICAgfVxyXG5cclxuICAgIHNlc3Npb25IYW5kbGUgPSBhd2FpdCB3YXNtLl9PcnRDcmVhdGVTZXNzaW9uKG1vZGVsRGF0YU9mZnNldCwgbW9kZWxEYXRhTGVuZ3RoLCBzZXNzaW9uT3B0aW9uc0hhbmRsZSk7XHJcbiAgICBpZiAoc2Vzc2lvbkhhbmRsZSA9PT0gMCkge1xyXG4gICAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBjcmVhdGUgYSBzZXNzaW9uLicpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IFtpbnB1dENvdW50LCBvdXRwdXRDb3VudF0gPSBnZXRTZXNzaW9uSW5wdXRPdXRwdXRDb3VudChzZXNzaW9uSGFuZGxlKTtcclxuXHJcbiAgICBjb25zdCBlbmFibGVHcmFwaENhcHR1cmUgPSAhIW9wdGlvbnM/LmVuYWJsZUdyYXBoQ2FwdHVyZTtcclxuXHJcbiAgICBjb25zdCBpbnB1dE5hbWVzID0gW107XHJcbiAgICBjb25zdCBvdXRwdXROYW1lcyA9IFtdO1xyXG4gICAgY29uc3Qgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zOiBTdXBwb3J0ZWRUZW5zb3JEYXRhTG9jYXRpb25Gb3JJbnB1dE91dHB1dFtdID0gW107XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Q291bnQ7IGkrKykge1xyXG4gICAgICBjb25zdCBuYW1lID0gd2FzbS5fT3J0R2V0SW5wdXROYW1lKHNlc3Npb25IYW5kbGUsIGkpO1xyXG4gICAgICBpZiAobmFtZSA9PT0gMCkge1xyXG4gICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBhbiBpbnB1dCBuYW1lLicpO1xyXG4gICAgICB9XHJcbiAgICAgIGlucHV0TmFtZXNVVEY4RW5jb2RlZC5wdXNoKG5hbWUpO1xyXG4gICAgICBpbnB1dE5hbWVzLnB1c2god2FzbS5VVEY4VG9TdHJpbmcobmFtZSkpO1xyXG4gICAgfVxyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XHJcbiAgICAgIGNvbnN0IG5hbWUgPSB3YXNtLl9PcnRHZXRPdXRwdXROYW1lKHNlc3Npb25IYW5kbGUsIGkpO1xyXG4gICAgICBpZiAobmFtZSA9PT0gMCkge1xyXG4gICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGdldCBhbiBvdXRwdXQgbmFtZS4nKTtcclxuICAgICAgfVxyXG4gICAgICBvdXRwdXROYW1lc1VURjhFbmNvZGVkLnB1c2gobmFtZSk7XHJcbiAgICAgIGNvbnN0IG5hbWVTdHJpbmcgPSB3YXNtLlVURjhUb1N0cmluZyhuYW1lKTtcclxuICAgICAgb3V0cHV0TmFtZXMucHVzaChuYW1lU3RyaW5nKTtcclxuXHJcbiAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSkge1xyXG4gICAgICAgIGlmIChlbmFibGVHcmFwaENhcHR1cmUgJiYgb3B0aW9ucz8ucHJlZmVycmVkT3V0cHV0TG9jYXRpb24gPT09IHVuZGVmaW5lZCkge1xyXG4gICAgICAgICAgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLnB1c2goJ2dwdS1idWZmZXInKTtcclxuICAgICAgICAgIGNvbnRpbnVlO1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBsb2NhdGlvbiA9IHR5cGVvZiBvcHRpb25zPy5wcmVmZXJyZWRPdXRwdXRMb2NhdGlvbiA9PT0gJ3N0cmluZycgP1xyXG4gICAgICAgICAgICBvcHRpb25zLnByZWZlcnJlZE91dHB1dExvY2F0aW9uIDpcclxuICAgICAgICAgICAgb3B0aW9ucz8ucHJlZmVycmVkT3V0cHV0TG9jYXRpb24/LltuYW1lU3RyaW5nXSA/PyAnY3B1JztcclxuICAgICAgICBpZiAobG9jYXRpb24gIT09ICdjcHUnICYmIGxvY2F0aW9uICE9PSAnY3B1LXBpbm5lZCcgJiYgbG9jYXRpb24gIT09ICdncHUtYnVmZmVyJykge1xyXG4gICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBOb3Qgc3VwcG9ydGVkIHByZWZlcnJlZCBvdXRwdXQgbG9jYXRpb246ICR7bG9jYXRpb259LmApO1xyXG4gICAgICAgIH1cclxuICAgICAgICBpZiAoZW5hYmxlR3JhcGhDYXB0dXJlICYmIGxvY2F0aW9uICE9PSAnZ3B1LWJ1ZmZlcicpIHtcclxuICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm90IHN1cHBvcnRlZCBwcmVmZXJyZWQgb3V0cHV0IGxvY2F0aW9uOiAke1xyXG4gICAgICAgICAgICAgIGxvY2F0aW9ufS4gT25seSAnZ3B1LWJ1ZmZlcicgbG9jYXRpb24gaXMgc3VwcG9ydGVkIHdoZW4gZW5hYmxlR3JhcGhDYXB0dXJlIGlzIHRydWUuYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5wdXNoKGxvY2F0aW9uKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIC8vIHVzZSBJTyBiaW5kaW5nIG9ubHkgd2hlbiBhdCBsZWFzdCBvbmUgb3V0cHV0IGlzIHByZWZmZXJlZCB0byBiZSBvbiBHUFUuXHJcbiAgICBsZXQgYmluZGluZ1N0YXRlOiBJT0JpbmRpbmdTdGF0ZXxudWxsID0gbnVsbDtcclxuICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSAmJiBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnMuc29tZShsID0+IGwgPT09ICdncHUtYnVmZmVyJykpIHtcclxuICAgICAgaW9CaW5kaW5nSGFuZGxlID0gd2FzbS5fT3J0Q3JlYXRlQmluZGluZyhzZXNzaW9uSGFuZGxlKTtcclxuICAgICAgaWYgKGlvQmluZGluZ0hhbmRsZSA9PT0gMCkge1xyXG4gICAgICAgIGNoZWNrTGFzdEVycm9yKCdDYW5cXCd0IGNyZWF0ZSBJTyBiaW5kaW5nLicpO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBiaW5kaW5nU3RhdGUgPSB7XHJcbiAgICAgICAgaGFuZGxlOiBpb0JpbmRpbmdIYW5kbGUsXHJcbiAgICAgICAgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zLFxyXG4gICAgICAgIG91dHB1dFByZWZlcnJlZExvY2F0aW9uc0VuY29kZWQ6IG91dHB1dFByZWZlcnJlZExvY2F0aW9ucy5tYXAobCA9PiBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0obCkpLFxyXG4gICAgICB9O1xyXG4gICAgfVxyXG5cclxuICAgIGFjdGl2ZVNlc3Npb25zLnNldChcclxuICAgICAgICBzZXNzaW9uSGFuZGxlLFxyXG4gICAgICAgIFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQsIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsIGJpbmRpbmdTdGF0ZSwgZW5hYmxlR3JhcGhDYXB0dXJlLCBmYWxzZV0pO1xyXG4gICAgcmV0dXJuIFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzLCBvdXRwdXROYW1lc107XHJcbiAgfSBjYXRjaCAoZSkge1xyXG4gICAgaW5wdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XHJcbiAgICBvdXRwdXROYW1lc1VURjhFbmNvZGVkLmZvckVhY2goYnVmID0+IHdhc20uX09ydEZyZWUoYnVmKSk7XHJcblxyXG4gICAgaWYgKGlvQmluZGluZ0hhbmRsZSAhPT0gMCkge1xyXG4gICAgICB3YXNtLl9PcnRSZWxlYXNlQmluZGluZyhpb0JpbmRpbmdIYW5kbGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChzZXNzaW9uSGFuZGxlICE9PSAwKSB7XHJcbiAgICAgIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uKHNlc3Npb25IYW5kbGUpO1xyXG4gICAgfVxyXG4gICAgdGhyb3cgZTtcclxuICB9IGZpbmFsbHkge1xyXG4gICAgd2FzbS5fZnJlZShtb2RlbERhdGFPZmZzZXQpO1xyXG4gICAgaWYgKHNlc3Npb25PcHRpb25zSGFuZGxlICE9PSAwKSB7XHJcbiAgICAgIHdhc20uX09ydFJlbGVhc2VTZXNzaW9uT3B0aW9ucyhzZXNzaW9uT3B0aW9uc0hhbmRsZSk7XHJcbiAgICB9XHJcbiAgICBhbGxvY3MuZm9yRWFjaChhbGxvYyA9PiB3YXNtLl9mcmVlKGFsbG9jKSk7XHJcblxyXG4gICAgLy8gdW5tb3VudCBleHRlcm5hbCBkYXRhIGlmIG5lY2Vzc2FyeVxyXG4gICAgd2FzbS51bm1vdW50RXh0ZXJuYWxEYXRhPy4oKTtcclxuICB9XHJcbn07XHJcblxyXG5leHBvcnQgY29uc3QgcmVsZWFzZVNlc3Npb24gPSAoc2Vzc2lvbklkOiBudW1iZXIpOiB2b2lkID0+IHtcclxuICBjb25zdCB3YXNtID0gZ2V0SW5zdGFuY2UoKTtcclxuICBjb25zdCBzZXNzaW9uID0gYWN0aXZlU2Vzc2lvbnMuZ2V0KHNlc3Npb25JZCk7XHJcbiAgaWYgKCFzZXNzaW9uKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoYGNhbm5vdCByZWxlYXNlIHNlc3Npb24uIGludmFsaWQgc2Vzc2lvbiBpZDogJHtzZXNzaW9uSWR9YCk7XHJcbiAgfVxyXG4gIGNvbnN0IFtzZXNzaW9uSGFuZGxlLCBpbnB1dE5hbWVzVVRGOEVuY29kZWQsIG91dHB1dE5hbWVzVVRGOEVuY29kZWQsIGlvQmluZGluZ1N0YXRlLCBlbmFibGVHcmFwaENhcHR1cmVdID0gc2Vzc2lvbjtcclxuXHJcbiAgaWYgKGlvQmluZGluZ1N0YXRlKSB7XHJcbiAgICBpZiAoZW5hYmxlR3JhcGhDYXB0dXJlKSB7XHJcbiAgICAgIHdhc20uX09ydENsZWFyQm91bmRPdXRwdXRzKGlvQmluZGluZ1N0YXRlLmhhbmRsZSk7XHJcbiAgICB9XHJcbiAgICB3YXNtLl9PcnRSZWxlYXNlQmluZGluZyhpb0JpbmRpbmdTdGF0ZS5oYW5kbGUpO1xyXG4gIH1cclxuXHJcbiAgd2FzbS5qc2VwT25SZWxlYXNlU2Vzc2lvbj8uKHNlc3Npb25JZCk7XHJcblxyXG4gIGlucHV0TmFtZXNVVEY4RW5jb2RlZC5mb3JFYWNoKGJ1ZiA9PiB3YXNtLl9PcnRGcmVlKGJ1ZikpO1xyXG4gIG91dHB1dE5hbWVzVVRGOEVuY29kZWQuZm9yRWFjaChidWYgPT4gd2FzbS5fT3J0RnJlZShidWYpKTtcclxuICB3YXNtLl9PcnRSZWxlYXNlU2Vzc2lvbihzZXNzaW9uSGFuZGxlKTtcclxuICBhY3RpdmVTZXNzaW9ucy5kZWxldGUoc2Vzc2lvbklkKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBwcmVwYXJlSW5wdXRPdXRwdXRUZW5zb3IgPVxyXG4gICAgKHRlbnNvcjogVGVuc29yTWV0YWRhdGF8bnVsbCwgdGVuc29ySGFuZGxlczogbnVtYmVyW10sIGFsbG9jczogbnVtYmVyW10sIHNlc3Npb25JZDogbnVtYmVyLCBpbmRleDogbnVtYmVyLFxyXG4gICAgIGVuYWJsZUdyYXBoQ2FwdHVyZSA9IGZhbHNlKTogdm9pZCA9PiB7XHJcbiAgICAgIGlmICghdGVuc29yKSB7XHJcbiAgICAgICAgdGVuc29ySGFuZGxlcy5wdXNoKDApO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3Qgd2FzbSA9IGdldEluc3RhbmNlKCk7XHJcblxyXG4gICAgICBjb25zdCBkYXRhVHlwZSA9IHRlbnNvclswXTtcclxuICAgICAgY29uc3QgZGltcyA9IHRlbnNvclsxXTtcclxuICAgICAgY29uc3QgbG9jYXRpb24gPSB0ZW5zb3JbM107XHJcblxyXG4gICAgICBsZXQgcmF3RGF0YTogbnVtYmVyO1xyXG4gICAgICBsZXQgZGF0YUJ5dGVMZW5ndGg6IG51bWJlcjtcclxuXHJcbiAgICAgIGlmIChkYXRhVHlwZSA9PT0gJ3N0cmluZycgJiYgbG9jYXRpb24gPT09ICdncHUtYnVmZmVyJykge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcignU3RyaW5nIHRlbnNvciBpcyBub3Qgc3VwcG9ydGVkIG9uIEdQVS4nKTtcclxuICAgICAgfVxyXG5cclxuICAgICAgaWYgKGVuYWJsZUdyYXBoQ2FwdHVyZSAmJiBsb2NhdGlvbiAhPT0gJ2dwdS1idWZmZXInKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKFxyXG4gICAgICAgICAgICBgRXh0ZXJuYWwgYnVmZmVyIG11c3QgYmUgcHJvdmlkZWQgZm9yIGlucHV0L291dHB1dCBpbmRleCAke2luZGV4fSB3aGVuIGVuYWJsZUdyYXBoQ2FwdHVyZSBpcyB0cnVlLmApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICBpZiAobG9jYXRpb24gPT09ICdncHUtYnVmZmVyJykge1xyXG4gICAgICAgIGNvbnN0IGdwdUJ1ZmZlciA9IHRlbnNvclsyXS5ncHVCdWZmZXIgYXMgR1BVQnVmZmVyO1xyXG4gICAgICAgIGNvbnN0IGVsZW1lbnRTaXplSW5CeXRlcyA9IGdldFRlbnNvckVsZW1lbnRTaXplKHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtKGRhdGFUeXBlKSkhO1xyXG4gICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gZGltcy5yZWR1Y2UoKGEsIGIpID0+IGEgKiBiLCAxKSAqIGVsZW1lbnRTaXplSW5CeXRlcztcclxuXHJcbiAgICAgICAgY29uc3QgcmVnaXN0ZXJCdWZmZXIgPSB3YXNtLmpzZXBSZWdpc3RlckJ1ZmZlcjtcclxuICAgICAgICBpZiAoIXJlZ2lzdGVyQnVmZmVyKSB7XHJcbiAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1RlbnNvciBsb2NhdGlvbiBcImdwdS1idWZmZXJcIiBpcyBub3Qgc3VwcG9ydGVkIHdpdGhvdXQgdXNpbmcgV2ViR1BVLicpO1xyXG4gICAgICAgIH1cclxuICAgICAgICByYXdEYXRhID0gcmVnaXN0ZXJCdWZmZXIoc2Vzc2lvbklkLCBpbmRleCwgZ3B1QnVmZmVyLCBkYXRhQnl0ZUxlbmd0aCk7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY29uc3QgZGF0YSA9IHRlbnNvclsyXTtcclxuXHJcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoZGF0YSkpIHtcclxuICAgICAgICAgIC8vIHN0cmluZyB0ZW5zb3JcclxuICAgICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gNCAqIGRhdGEubGVuZ3RoO1xyXG4gICAgICAgICAgcmF3RGF0YSA9IHdhc20uX21hbGxvYyhkYXRhQnl0ZUxlbmd0aCk7XHJcbiAgICAgICAgICBhbGxvY3MucHVzaChyYXdEYXRhKTtcclxuICAgICAgICAgIGxldCBkYXRhSW5kZXggPSByYXdEYXRhIC8gNDtcclxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGF0YS5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAodHlwZW9mIGRhdGFbaV0gIT09ICdzdHJpbmcnKSB7XHJcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IFR5cGVFcnJvcihgdGVuc29yIGRhdGEgYXQgaW5kZXggJHtpfSBpcyBub3QgYSBzdHJpbmdgKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICB3YXNtLkhFQVBVMzJbZGF0YUluZGV4KytdID0gYWxsb2NXYXNtU3RyaW5nKGRhdGFbaV0sIGFsbG9jcyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgIGRhdGFCeXRlTGVuZ3RoID0gZGF0YS5ieXRlTGVuZ3RoO1xyXG4gICAgICAgICAgcmF3RGF0YSA9IHdhc20uX21hbGxvYyhkYXRhQnl0ZUxlbmd0aCk7XHJcbiAgICAgICAgICBhbGxvY3MucHVzaChyYXdEYXRhKTtcclxuICAgICAgICAgIHdhc20uSEVBUFU4LnNldChuZXcgVWludDhBcnJheShkYXRhLmJ1ZmZlciwgZGF0YS5ieXRlT2Zmc2V0LCBkYXRhQnl0ZUxlbmd0aCksIHJhd0RhdGEpO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgY29uc3Qgc3RhY2sgPSB3YXNtLnN0YWNrU2F2ZSgpO1xyXG4gICAgICBjb25zdCBkaW1zT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDQgKiBkaW1zLmxlbmd0aCk7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgbGV0IGRpbUluZGV4ID0gZGltc09mZnNldCAvIDQ7XHJcbiAgICAgICAgZGltcy5mb3JFYWNoKGQgPT4gd2FzbS5IRUFQMzJbZGltSW5kZXgrK10gPSBkKTtcclxuICAgICAgICBjb25zdCB0ZW5zb3IgPSB3YXNtLl9PcnRDcmVhdGVUZW5zb3IoXHJcbiAgICAgICAgICAgIHRlbnNvckRhdGFUeXBlU3RyaW5nVG9FbnVtKGRhdGFUeXBlKSwgcmF3RGF0YSwgZGF0YUJ5dGVMZW5ndGgsIGRpbXNPZmZzZXQsIGRpbXMubGVuZ3RoLFxyXG4gICAgICAgICAgICBkYXRhTG9jYXRpb25TdHJpbmdUb0VudW0obG9jYXRpb24pKTtcclxuICAgICAgICBpZiAodGVuc29yID09PSAwKSB7XHJcbiAgICAgICAgICBjaGVja0xhc3RFcnJvcihgQ2FuJ3QgY3JlYXRlIHRlbnNvciBmb3IgaW5wdXQvb3V0cHV0LiBzZXNzaW9uPSR7c2Vzc2lvbklkfSwgaW5kZXg9JHtpbmRleH0uYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIHRlbnNvckhhbmRsZXMucHVzaCh0ZW5zb3IpO1xyXG4gICAgICB9IGZpbmFsbHkge1xyXG4gICAgICAgIHdhc20uc3RhY2tSZXN0b3JlKHN0YWNrKTtcclxuICAgICAgfVxyXG4gICAgfTtcclxuXHJcbi8qKlxyXG4gKiBwZXJmb3JtIGluZmVyZW5jZSBydW5cclxuICovXHJcbmV4cG9ydCBjb25zdCBydW4gPSBhc3luYyhcclxuICAgIHNlc3Npb25JZDogbnVtYmVyLCBpbnB1dEluZGljZXM6IG51bWJlcltdLCBpbnB1dFRlbnNvcnM6IFRlbnNvck1ldGFkYXRhW10sIG91dHB1dEluZGljZXM6IG51bWJlcltdLFxyXG4gICAgb3V0cHV0VGVuc29yczogQXJyYXk8VGVuc29yTWV0YWRhdGF8bnVsbD4sIG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyk6IFByb21pc2U8VGVuc29yTWV0YWRhdGFbXT4gPT4ge1xyXG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xyXG4gIGNvbnN0IHNlc3Npb24gPSBhY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcclxuICBpZiAoIXNlc3Npb24pIHtcclxuICAgIHRocm93IG5ldyBFcnJvcihgY2Fubm90IHJ1biBpbmZlcmVuY2UuIGludmFsaWQgc2Vzc2lvbiBpZDogJHtzZXNzaW9uSWR9YCk7XHJcbiAgfVxyXG4gIGNvbnN0IHNlc3Npb25IYW5kbGUgPSBzZXNzaW9uWzBdO1xyXG4gIGNvbnN0IGlucHV0TmFtZXNVVEY4RW5jb2RlZCA9IHNlc3Npb25bMV07XHJcbiAgY29uc3Qgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCA9IHNlc3Npb25bMl07XHJcbiAgY29uc3QgaW9CaW5kaW5nU3RhdGUgPSBzZXNzaW9uWzNdO1xyXG4gIGNvbnN0IGVuYWJsZUdyYXBoQ2FwdHVyZSA9IHNlc3Npb25bNF07XHJcbiAgY29uc3QgaW5wdXRPdXRwdXRCb3VuZCA9IHNlc3Npb25bNV07XHJcblxyXG4gIGNvbnN0IGlucHV0Q291bnQgPSBpbnB1dEluZGljZXMubGVuZ3RoO1xyXG4gIGNvbnN0IG91dHB1dENvdW50ID0gb3V0cHV0SW5kaWNlcy5sZW5ndGg7XHJcblxyXG4gIGxldCBydW5PcHRpb25zSGFuZGxlID0gMDtcclxuICBsZXQgcnVuT3B0aW9uc0FsbG9jczogbnVtYmVyW10gPSBbXTtcclxuXHJcbiAgY29uc3QgaW5wdXRUZW5zb3JIYW5kbGVzOiBudW1iZXJbXSA9IFtdO1xyXG4gIGNvbnN0IG91dHB1dFRlbnNvckhhbmRsZXM6IG51bWJlcltdID0gW107XHJcbiAgY29uc3QgaW5wdXRPdXRwdXRBbGxvY3M6IG51bWJlcltdID0gW107XHJcblxyXG4gIGNvbnN0IGJlZm9yZVJ1blN0YWNrID0gd2FzbS5zdGFja1NhdmUoKTtcclxuICBjb25zdCBpbnB1dFZhbHVlc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhpbnB1dENvdW50ICogNCk7XHJcbiAgY29uc3QgaW5wdXROYW1lc09mZnNldCA9IHdhc20uc3RhY2tBbGxvYyhpbnB1dENvdW50ICogNCk7XHJcbiAgY29uc3Qgb3V0cHV0VmFsdWVzT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKG91dHB1dENvdW50ICogNCk7XHJcbiAgY29uc3Qgb3V0cHV0TmFtZXNPZmZzZXQgPSB3YXNtLnN0YWNrQWxsb2Mob3V0cHV0Q291bnQgKiA0KTtcclxuXHJcbiAgdHJ5IHtcclxuICAgIFtydW5PcHRpb25zSGFuZGxlLCBydW5PcHRpb25zQWxsb2NzXSA9IHNldFJ1bk9wdGlvbnMob3B0aW9ucyk7XHJcblxyXG4gICAgLy8gY3JlYXRlIGlucHV0IHRlbnNvcnNcclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgaW5wdXRDb3VudDsgaSsrKSB7XHJcbiAgICAgIHByZXBhcmVJbnB1dE91dHB1dFRlbnNvcihcclxuICAgICAgICAgIGlucHV0VGVuc29yc1tpXSwgaW5wdXRUZW5zb3JIYW5kbGVzLCBpbnB1dE91dHB1dEFsbG9jcywgc2Vzc2lvbklkLCBpbnB1dEluZGljZXNbaV0sIGVuYWJsZUdyYXBoQ2FwdHVyZSk7XHJcbiAgICB9XHJcblxyXG4gICAgLy8gY3JlYXRlIG91dHB1dCB0ZW5zb3JzXHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IG91dHB1dENvdW50OyBpKyspIHtcclxuICAgICAgcHJlcGFyZUlucHV0T3V0cHV0VGVuc29yKFxyXG4gICAgICAgICAgb3V0cHV0VGVuc29yc1tpXSwgb3V0cHV0VGVuc29ySGFuZGxlcywgaW5wdXRPdXRwdXRBbGxvY3MsIHNlc3Npb25JZCwgaW5wdXRDb3VudCArIG91dHB1dEluZGljZXNbaV0sXHJcbiAgICAgICAgICBlbmFibGVHcmFwaENhcHR1cmUpO1xyXG4gICAgfVxyXG5cclxuICAgIGxldCBpbnB1dFZhbHVlc0luZGV4ID0gaW5wdXRWYWx1ZXNPZmZzZXQgLyA0O1xyXG4gICAgbGV0IGlucHV0TmFtZXNJbmRleCA9IGlucHV0TmFtZXNPZmZzZXQgLyA0O1xyXG4gICAgbGV0IG91dHB1dFZhbHVlc0luZGV4ID0gb3V0cHV0VmFsdWVzT2Zmc2V0IC8gNDtcclxuICAgIGxldCBvdXRwdXROYW1lc0luZGV4ID0gb3V0cHV0TmFtZXNPZmZzZXQgLyA0O1xyXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBpbnB1dENvdW50OyBpKyspIHtcclxuICAgICAgd2FzbS5IRUFQVTMyW2lucHV0VmFsdWVzSW5kZXgrK10gPSBpbnB1dFRlbnNvckhhbmRsZXNbaV07XHJcbiAgICAgIHdhc20uSEVBUFUzMltpbnB1dE5hbWVzSW5kZXgrK10gPSBpbnB1dE5hbWVzVVRGOEVuY29kZWRbaW5wdXRJbmRpY2VzW2ldXTtcclxuICAgIH1cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xyXG4gICAgICB3YXNtLkhFQVBVMzJbb3V0cHV0VmFsdWVzSW5kZXgrK10gPSBvdXRwdXRUZW5zb3JIYW5kbGVzW2ldO1xyXG4gICAgICB3YXNtLkhFQVBVMzJbb3V0cHV0TmFtZXNJbmRleCsrXSA9IG91dHB1dE5hbWVzVVRGOEVuY29kZWRbb3V0cHV0SW5kaWNlc1tpXV07XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVICYmIGlvQmluZGluZ1N0YXRlICYmICFpbnB1dE91dHB1dEJvdW5kKSB7XHJcbiAgICAgIGNvbnN0IHtoYW5kbGUsIG91dHB1dFByZWZlcnJlZExvY2F0aW9ucywgb3V0cHV0UHJlZmVycmVkTG9jYXRpb25zRW5jb2RlZH0gPSBpb0JpbmRpbmdTdGF0ZTtcclxuXHJcbiAgICAgIGlmIChpbnB1dE5hbWVzVVRGOEVuY29kZWQubGVuZ3RoICE9PSBpbnB1dENvdW50KSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBpbnB1dCBjb3VudCBmcm9tIGZlZWRzICgke1xyXG4gICAgICAgICAgICBpbnB1dENvdW50fSkgaXMgZXhwZWN0ZWQgdG8gYmUgYWx3YXlzIGVxdWFsIHRvIG1vZGVsJ3MgaW5wdXQgY291bnQgKCR7aW5wdXROYW1lc1VURjhFbmNvZGVkLmxlbmd0aH0pLmApO1xyXG4gICAgICB9XHJcblxyXG4gICAgICAvLyBwcm9jZXNzIGlucHV0c1xyXG4gICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGlucHV0Q291bnQ7IGkrKykge1xyXG4gICAgICAgIGNvbnN0IGluZGV4ID0gaW5wdXRJbmRpY2VzW2ldO1xyXG4gICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydEJpbmRJbnB1dChoYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZFtpbmRleF0sIGlucHV0VGVuc29ySGFuZGxlc1tpXSk7XHJcbiAgICAgICAgaWYgKGVycm9yQ29kZSAhPT0gMCkge1xyXG4gICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGJpbmQgaW5wdXRbJHtpfV0gZm9yIHNlc3Npb249JHtzZXNzaW9uSWR9LmApO1xyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG5cclxuICAgICAgLy8gcHJvY2VzcyBwcmUtYWxsb2NhdGVkIG91dHB1dHNcclxuICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBvdXRwdXRDb3VudDsgaSsrKSB7XHJcbiAgICAgICAgY29uc3QgaW5kZXggPSBvdXRwdXRJbmRpY2VzW2ldO1xyXG4gICAgICAgIGNvbnN0IGxvY2F0aW9uID0gb3V0cHV0VGVuc29yc1tpXT8uWzNdOyAgLy8gdW5kZWZpbmVkIG1lYW5zIG91dHB1dCBpcyBub3QgcHJlLWFsbG9jYXRlZC5cclxuXHJcbiAgICAgICAgaWYgKGxvY2F0aW9uKSB7XHJcbiAgICAgICAgICAvLyBvdXRwdXQgaXMgcHJlLWFsbG9jYXRlZC4gYmluZCB0aGUgdGVuc29yLlxyXG4gICAgICAgICAgY29uc3QgZXJyb3JDb2RlID0gd2FzbS5fT3J0QmluZE91dHB1dChoYW5kbGUsIG91dHB1dE5hbWVzVVRGOEVuY29kZWRbaW5kZXhdLCBvdXRwdXRUZW5zb3JIYW5kbGVzW2ldLCAwKTtcclxuICAgICAgICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcclxuICAgICAgICAgICAgY2hlY2tMYXN0RXJyb3IoYENhbid0IGJpbmQgcHJlLWFsbG9jYXRlZCBvdXRwdXRbJHtpfV0gZm9yIHNlc3Npb249JHtzZXNzaW9uSWR9LmApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBvdXRwdXQgaXMgbm90IHByZS1hbGxvY2F0ZWQuIHJlc2V0IHByZWZlcnJlZCBsb2NhdGlvbi5cclxuICAgICAgICAgIGNvbnN0IGVycm9yQ29kZSA9XHJcbiAgICAgICAgICAgICAgd2FzbS5fT3J0QmluZE91dHB1dChoYW5kbGUsIG91dHB1dE5hbWVzVVRGOEVuY29kZWRbaW5kZXhdLCAwLCBvdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNFbmNvZGVkW2luZGV4XSk7XHJcbiAgICAgICAgICBpZiAoZXJyb3JDb2RlICE9PSAwKSB7XHJcbiAgICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBiaW5kIG91dHB1dFske2l9XSB0byAke291dHB1dFByZWZlcnJlZExvY2F0aW9uc1tpXX0gZm9yIHNlc3Npb249JHtzZXNzaW9uSWR9LmApO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgIH1cclxuICAgICAgfVxyXG4gICAgICBhY3RpdmVTZXNzaW9ucy5zZXQoXHJcbiAgICAgICAgICBzZXNzaW9uSWQsXHJcbiAgICAgICAgICBbc2Vzc2lvbkhhbmRsZSwgaW5wdXROYW1lc1VURjhFbmNvZGVkLCBvdXRwdXROYW1lc1VURjhFbmNvZGVkLCBpb0JpbmRpbmdTdGF0ZSwgZW5hYmxlR3JhcGhDYXB0dXJlLCB0cnVlXSk7XHJcbiAgICB9XHJcblxyXG4gICAgd2FzbS5qc2VwT25SdW5TdGFydD8uKHNlc3Npb25IYW5kbGUpO1xyXG4gICAgbGV0IGVycm9yQ29kZTogbnVtYmVyO1xyXG4gICAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0VCR1BVICYmIGlvQmluZGluZ1N0YXRlKSB7XHJcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bldpdGhCaW5kaW5nKFxyXG4gICAgICAgICAgc2Vzc2lvbkhhbmRsZSwgaW9CaW5kaW5nU3RhdGUuaGFuZGxlLCBvdXRwdXRDb3VudCwgb3V0cHV0VmFsdWVzT2Zmc2V0LCBydW5PcHRpb25zSGFuZGxlKTtcclxuICAgIH0gZWxzZSB7XHJcbiAgICAgIGVycm9yQ29kZSA9IGF3YWl0IHdhc20uX09ydFJ1bihcclxuICAgICAgICAgIHNlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNPZmZzZXQsIGlucHV0VmFsdWVzT2Zmc2V0LCBpbnB1dENvdW50LCBvdXRwdXROYW1lc09mZnNldCwgb3V0cHV0Q291bnQsXHJcbiAgICAgICAgICBvdXRwdXRWYWx1ZXNPZmZzZXQsIHJ1bk9wdGlvbnNIYW5kbGUpO1xyXG4gICAgfVxyXG5cclxuICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcclxuICAgICAgY2hlY2tMYXN0RXJyb3IoJ2ZhaWxlZCB0byBjYWxsIE9ydFJ1bigpLicpO1xyXG4gICAgfVxyXG5cclxuICAgIGNvbnN0IG91dHB1dDogVGVuc29yTWV0YWRhdGFbXSA9IFtdO1xyXG5cclxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgb3V0cHV0Q291bnQ7IGkrKykge1xyXG4gICAgICBjb25zdCB0ZW5zb3IgPSB3YXNtLkhFQVBVMzJbb3V0cHV0VmFsdWVzT2Zmc2V0IC8gNCArIGldO1xyXG4gICAgICBpZiAodGVuc29yID09PSBvdXRwdXRUZW5zb3JIYW5kbGVzW2ldKSB7XHJcbiAgICAgICAgLy8gb3V0cHV0IHRlbnNvciBpcyBwcmUtYWxsb2NhdGVkLiBubyBuZWVkIHRvIGNvcHkgZGF0YS5cclxuICAgICAgICBvdXRwdXQucHVzaChvdXRwdXRUZW5zb3JzW2ldISk7XHJcbiAgICAgICAgY29udGludWU7XHJcbiAgICAgIH1cclxuXHJcbiAgICAgIGNvbnN0IGJlZm9yZUdldFRlbnNvckRhdGFTdGFjayA9IHdhc20uc3RhY2tTYXZlKCk7XHJcbiAgICAgIC8vIHN0YWNrIGFsbG9jYXRlIDQgcG9pbnRlciB2YWx1ZVxyXG4gICAgICBjb25zdCB0ZW5zb3JEYXRhT2Zmc2V0ID0gd2FzbS5zdGFja0FsbG9jKDQgKiA0KTtcclxuXHJcbiAgICAgIGxldCBrZWVwT3V0cHV0VGVuc29yID0gZmFsc2U7XHJcbiAgICAgIGxldCB0eXBlOiBUZW5zb3IuVHlwZXx1bmRlZmluZWQsIGRhdGFPZmZzZXQgPSAwO1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IGVycm9yQ29kZSA9IHdhc20uX09ydEdldFRlbnNvckRhdGEoXHJcbiAgICAgICAgICAgIHRlbnNvciwgdGVuc29yRGF0YU9mZnNldCwgdGVuc29yRGF0YU9mZnNldCArIDQsIHRlbnNvckRhdGFPZmZzZXQgKyA4LCB0ZW5zb3JEYXRhT2Zmc2V0ICsgMTIpO1xyXG4gICAgICAgIGlmIChlcnJvckNvZGUgIT09IDApIHtcclxuICAgICAgICAgIGNoZWNrTGFzdEVycm9yKGBDYW4ndCBhY2Nlc3Mgb3V0cHV0IHRlbnNvciBkYXRhIG9uIGluZGV4ICR7aX0uYCk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGxldCB0ZW5zb3JEYXRhSW5kZXggPSB0ZW5zb3JEYXRhT2Zmc2V0IC8gNDtcclxuICAgICAgICBjb25zdCBkYXRhVHlwZSA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XHJcbiAgICAgICAgZGF0YU9mZnNldCA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XHJcbiAgICAgICAgY29uc3QgZGltc09mZnNldCA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XHJcbiAgICAgICAgY29uc3QgZGltc0xlbmd0aCA9IHdhc20uSEVBUFUzMlt0ZW5zb3JEYXRhSW5kZXgrK107XHJcbiAgICAgICAgY29uc3QgZGltcyA9IFtdO1xyXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZGltc0xlbmd0aDsgaSsrKSB7XHJcbiAgICAgICAgICBkaW1zLnB1c2god2FzbS5IRUFQVTMyW2RpbXNPZmZzZXQgLyA0ICsgaV0pO1xyXG4gICAgICAgIH1cclxuICAgICAgICB3YXNtLl9PcnRGcmVlKGRpbXNPZmZzZXQpO1xyXG5cclxuICAgICAgICBjb25zdCBzaXplID0gZGltcy5yZWR1Y2UoKGEsIGIpID0+IGEgKiBiLCAxKTtcclxuICAgICAgICB0eXBlID0gdGVuc29yRGF0YVR5cGVFbnVtVG9TdHJpbmcoZGF0YVR5cGUpO1xyXG5cclxuICAgICAgICBjb25zdCBwcmVmZXJyZWRMb2NhdGlvbiA9IGlvQmluZGluZ1N0YXRlPy5vdXRwdXRQcmVmZXJyZWRMb2NhdGlvbnNbb3V0cHV0SW5kaWNlc1tpXV07XHJcblxyXG4gICAgICAgIGlmICh0eXBlID09PSAnc3RyaW5nJykge1xyXG4gICAgICAgICAgaWYgKHByZWZlcnJlZExvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicpIHtcclxuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdTdHJpbmcgdGVuc29yIGlzIG5vdCBzdXBwb3J0ZWQgb24gR1BVLicpO1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc3Qgc3RyaW5nRGF0YTogc3RyaW5nW10gPSBbXTtcclxuICAgICAgICAgIGxldCBkYXRhSW5kZXggPSBkYXRhT2Zmc2V0IC8gNDtcclxuICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgc2l6ZTsgaSsrKSB7XHJcbiAgICAgICAgICAgIGNvbnN0IG9mZnNldCA9IHdhc20uSEVBUFUzMltkYXRhSW5kZXgrK107XHJcbiAgICAgICAgICAgIGNvbnN0IG1heEJ5dGVzVG9SZWFkID0gaSA9PT0gc2l6ZSAtIDEgPyB1bmRlZmluZWQgOiB3YXNtLkhFQVBVMzJbZGF0YUluZGV4XSAtIG9mZnNldDtcclxuICAgICAgICAgICAgc3RyaW5nRGF0YS5wdXNoKHdhc20uVVRGOFRvU3RyaW5nKG9mZnNldCwgbWF4Qnl0ZXNUb1JlYWQpKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIG91dHB1dC5wdXNoKFt0eXBlLCBkaW1zLCBzdHJpbmdEYXRhLCAnY3B1J10pO1xyXG4gICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAvLyBJZiBhIGNlcnRhaW4gb3V0cHV0J3MgcHJlZmVycmVkIGxvY2F0aW9uIGlzIEdQVSBidXQgdGhlIHRlbnNvciBpcyBlbXB0eSwgd2Ugc3RpbGwgbmVlZCB0byBjcmVhdGUgYSBDUFVcclxuICAgICAgICAgIC8vIHRlbnNvciBmb3IgaXQuIFRoZXJlIGlzIG5vIG1hcHBpbmcgR1BVIGJ1ZmZlciBmb3IgYW4gZW1wdHkgdGVuc29yLlxyXG4gICAgICAgICAgaWYgKHByZWZlcnJlZExvY2F0aW9uID09PSAnZ3B1LWJ1ZmZlcicgJiYgc2l6ZSA+IDApIHtcclxuICAgICAgICAgICAgY29uc3QgZ2V0QnVmZmVyID0gd2FzbS5qc2VwR2V0QnVmZmVyO1xyXG4gICAgICAgICAgICBpZiAoIWdldEJ1ZmZlcikge1xyXG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcigncHJlZmVycmVkTG9jYXRpb24gXCJncHUtYnVmZmVyXCIgaXMgbm90IHN1cHBvcnRlZCB3aXRob3V0IHVzaW5nIFdlYkdQVS4nKTtcclxuICAgICAgICAgICAgfVxyXG4gICAgICAgICAgICBjb25zdCBncHVCdWZmZXIgPSBnZXRCdWZmZXIoZGF0YU9mZnNldCk7XHJcbiAgICAgICAgICAgIGNvbnN0IGVsZW1lbnRTaXplID0gZ2V0VGVuc29yRWxlbWVudFNpemUoZGF0YVR5cGUpO1xyXG4gICAgICAgICAgICBpZiAoZWxlbWVudFNpemUgPT09IHVuZGVmaW5lZCB8fCAhaXNHcHVCdWZmZXJTdXBwb3J0ZWRUeXBlKHR5cGUpKSB7XHJcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBVbnN1cHBvcnRlZCBkYXRhIHR5cGU6ICR7dHlwZX1gKTtcclxuICAgICAgICAgICAgfVxyXG5cclxuICAgICAgICAgICAgLy8gZG8gbm90IHJlbGVhc2UgdGhlIHRlbnNvciByaWdodCBub3cuIGl0IHdpbGwgYmUgcmVsZWFzZWQgd2hlbiB1c2VyIGNhbGxzIHRlbnNvci5kaXNwb3NlKCkuXHJcbiAgICAgICAgICAgIGtlZXBPdXRwdXRUZW5zb3IgPSB0cnVlO1xyXG5cclxuICAgICAgICAgICAgb3V0cHV0LnB1c2goW1xyXG4gICAgICAgICAgICAgIHR5cGUsIGRpbXMsIHtcclxuICAgICAgICAgICAgICAgIGdwdUJ1ZmZlcixcclxuICAgICAgICAgICAgICAgIGRvd25sb2FkOiB3YXNtLmpzZXBDcmVhdGVEb3dubG9hZGVyIShncHVCdWZmZXIsIHNpemUgKiBlbGVtZW50U2l6ZSwgdHlwZSksXHJcbiAgICAgICAgICAgICAgICBkaXNwb3NlOiAoKSA9PiB7XHJcbiAgICAgICAgICAgICAgICAgIHdhc20uX09ydFJlbGVhc2VUZW5zb3IodGVuc29yKTtcclxuICAgICAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgICB9LFxyXG4gICAgICAgICAgICAgICdncHUtYnVmZmVyJ1xyXG4gICAgICAgICAgICBdKTtcclxuICAgICAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgICAgIGNvbnN0IHR5cGVkQXJyYXlDb25zdHJ1Y3RvciA9IHRlbnNvclR5cGVUb1R5cGVkQXJyYXlDb25zdHJ1Y3Rvcih0eXBlKTtcclxuICAgICAgICAgICAgY29uc3QgZGF0YSA9IG5ldyB0eXBlZEFycmF5Q29uc3RydWN0b3Ioc2l6ZSk7XHJcbiAgICAgICAgICAgIG5ldyBVaW50OEFycmF5KGRhdGEuYnVmZmVyLCBkYXRhLmJ5dGVPZmZzZXQsIGRhdGEuYnl0ZUxlbmd0aClcclxuICAgICAgICAgICAgICAgIC5zZXQod2FzbS5IRUFQVTguc3ViYXJyYXkoZGF0YU9mZnNldCwgZGF0YU9mZnNldCArIGRhdGEuYnl0ZUxlbmd0aCkpO1xyXG4gICAgICAgICAgICBvdXRwdXQucHVzaChbdHlwZSwgZGltcywgZGF0YSwgJ2NwdSddKTtcclxuICAgICAgICAgIH1cclxuICAgICAgICB9XHJcbiAgICAgIH0gZmluYWxseSB7XHJcbiAgICAgICAgd2FzbS5zdGFja1Jlc3RvcmUoYmVmb3JlR2V0VGVuc29yRGF0YVN0YWNrKTtcclxuICAgICAgICBpZiAodHlwZSA9PT0gJ3N0cmluZycgJiYgZGF0YU9mZnNldCkge1xyXG4gICAgICAgICAgd2FzbS5fZnJlZShkYXRhT2Zmc2V0KTtcclxuICAgICAgICB9XHJcbiAgICAgICAgaWYgKCFrZWVwT3V0cHV0VGVuc29yKSB7XHJcbiAgICAgICAgICB3YXNtLl9PcnRSZWxlYXNlVGVuc29yKHRlbnNvcik7XHJcbiAgICAgICAgfVxyXG4gICAgICB9XHJcbiAgICB9XHJcblxyXG4gICAgaWYgKGlvQmluZGluZ1N0YXRlICYmICFlbmFibGVHcmFwaENhcHR1cmUpIHtcclxuICAgICAgd2FzbS5fT3J0Q2xlYXJCb3VuZE91dHB1dHMoaW9CaW5kaW5nU3RhdGUuaGFuZGxlKTtcclxuICAgICAgYWN0aXZlU2Vzc2lvbnMuc2V0KFxyXG4gICAgICAgICAgc2Vzc2lvbklkLFxyXG4gICAgICAgICAgW3Nlc3Npb25IYW5kbGUsIGlucHV0TmFtZXNVVEY4RW5jb2RlZCwgb3V0cHV0TmFtZXNVVEY4RW5jb2RlZCwgaW9CaW5kaW5nU3RhdGUsIGVuYWJsZUdyYXBoQ2FwdHVyZSwgZmFsc2VdKTtcclxuICAgIH1cclxuICAgIHJldHVybiBvdXRwdXQ7XHJcbiAgfSBmaW5hbGx5IHtcclxuICAgIHdhc20uc3RhY2tSZXN0b3JlKGJlZm9yZVJ1blN0YWNrKTtcclxuXHJcbiAgICBpbnB1dFRlbnNvckhhbmRsZXMuZm9yRWFjaCh2ID0+IHdhc20uX09ydFJlbGVhc2VUZW5zb3IodikpO1xyXG4gICAgb3V0cHV0VGVuc29ySGFuZGxlcy5mb3JFYWNoKHYgPT4gd2FzbS5fT3J0UmVsZWFzZVRlbnNvcih2KSk7XHJcbiAgICBpbnB1dE91dHB1dEFsbG9jcy5mb3JFYWNoKHAgPT4gd2FzbS5fZnJlZShwKSk7XHJcblxyXG4gICAgaWYgKHJ1bk9wdGlvbnNIYW5kbGUgIT09IDApIHtcclxuICAgICAgd2FzbS5fT3J0UmVsZWFzZVJ1bk9wdGlvbnMocnVuT3B0aW9uc0hhbmRsZSk7XHJcbiAgICB9XHJcbiAgICBydW5PcHRpb25zQWxsb2NzLmZvckVhY2gocCA9PiB3YXNtLl9mcmVlKHApKTtcclxuICB9XHJcbn07XHJcblxyXG4vKipcclxuICogZW5kIHByb2ZpbGluZ1xyXG4gKi9cclxuZXhwb3J0IGNvbnN0IGVuZFByb2ZpbGluZyA9IChzZXNzaW9uSWQ6IG51bWJlcik6IHZvaWQgPT4ge1xyXG4gIGNvbnN0IHdhc20gPSBnZXRJbnN0YW5jZSgpO1xyXG4gIGNvbnN0IHNlc3Npb24gPSBhY3RpdmVTZXNzaW9ucy5nZXQoc2Vzc2lvbklkKTtcclxuICBpZiAoIXNlc3Npb24pIHtcclxuICAgIHRocm93IG5ldyBFcnJvcignaW52YWxpZCBzZXNzaW9uIGlkJyk7XHJcbiAgfVxyXG4gIGNvbnN0IHNlc3Npb25IYW5kbGUgPSBzZXNzaW9uWzBdO1xyXG5cclxuICAvLyBwcm9maWxlIGZpbGUgbmFtZSBpcyBub3QgdXNlZCB5ZXQsIGJ1dCBpdCBtdXN0IGJlIGZyZWVkLlxyXG4gIGNvbnN0IHByb2ZpbGVGaWxlTmFtZSA9IHdhc20uX09ydEVuZFByb2ZpbGluZyhzZXNzaW9uSGFuZGxlKTtcclxuICBpZiAocHJvZmlsZUZpbGVOYW1lID09PSAwKSB7XHJcbiAgICBjaGVja0xhc3RFcnJvcignQ2FuXFwndCBnZXQgYW4gcHJvZmlsZSBmaWxlIG5hbWUuJyk7XHJcbiAgfVxyXG4gIHdhc20uX09ydEZyZWUocHJvZmlsZUZpbGVOYW1lKTtcclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBleHRyYWN0VHJhbnNmZXJhYmxlQnVmZmVycyA9ICh0ZW5zb3JzOiByZWFkb25seSBTZXJpYWxpemFibGVUZW5zb3JNZXRhZGF0YVtdKTogQXJyYXlCdWZmZXJMaWtlW10gPT4ge1xyXG4gIGNvbnN0IGJ1ZmZlcnM6IEFycmF5QnVmZmVyTGlrZVtdID0gW107XHJcbiAgZm9yIChjb25zdCB0ZW5zb3Igb2YgdGVuc29ycykge1xyXG4gICAgY29uc3QgZGF0YSA9IHRlbnNvclsyXTtcclxuICAgIGlmICghQXJyYXkuaXNBcnJheShkYXRhKSAmJiAnYnVmZmVyJyBpbiBkYXRhKSB7XHJcbiAgICAgIGJ1ZmZlcnMucHVzaChkYXRhLmJ1ZmZlcik7XHJcbiAgICB9XHJcbiAgfVxyXG4gIHJldHVybiBidWZmZXJzO1xyXG59O1xyXG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cclxuXHJcbmltcG9ydCB7ZW52LCBJbmZlcmVuY2VTZXNzaW9ufSBmcm9tICdvbm54cnVudGltZS1jb21tb24nO1xyXG5cclxuaW1wb3J0IHtPcnRXYXNtTWVzc2FnZSwgU2VyaWFsaXphYmxlSW50ZXJuYWxCdWZmZXIsIFNlcmlhbGl6YWJsZVNlc3Npb25NZXRhZGF0YSwgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGEsIFRlbnNvck1ldGFkYXRhfSBmcm9tICcuL3Byb3h5LW1lc3NhZ2VzJztcclxuaW1wb3J0ICogYXMgY29yZSBmcm9tICcuL3dhc20tY29yZS1pbXBsJztcclxuaW1wb3J0IHtpbml0aWFsaXplV2ViQXNzZW1ibHl9IGZyb20gJy4vd2FzbS1mYWN0b3J5JztcclxuXHJcbmNvbnN0IGlzUHJveHkgPSAoKTogYm9vbGVhbiA9PiAhIWVudi53YXNtLnByb3h5ICYmIHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCc7XHJcbmxldCBwcm94eVdvcmtlcjogV29ya2VyfHVuZGVmaW5lZDtcclxubGV0IGluaXRpYWxpemluZyA9IGZhbHNlO1xyXG5sZXQgaW5pdGlhbGl6ZWQgPSBmYWxzZTtcclxubGV0IGFib3J0ZWQgPSBmYWxzZTtcclxuXHJcbnR5cGUgUHJvbWlzZUNhbGxiYWNrczxUID0gdm9pZD4gPSBbcmVzb2x2ZTogKHJlc3VsdDogVCkgPT4gdm9pZCwgcmVqZWN0OiAocmVhc29uOiB1bmtub3duKSA9PiB2b2lkXTtcclxubGV0IGluaXRXYXNtQ2FsbGJhY2tzOiBQcm9taXNlQ2FsbGJhY2tzO1xyXG5jb25zdCBxdWV1ZWRDYWxsYmFja3M6IE1hcDxPcnRXYXNtTWVzc2FnZVsndHlwZSddLCBBcnJheTxQcm9taXNlQ2FsbGJhY2tzPHVua25vd24+Pj4gPSBuZXcgTWFwKCk7XHJcblxyXG5jb25zdCBlbnF1ZXVlQ2FsbGJhY2tzID0gKHR5cGU6IE9ydFdhc21NZXNzYWdlWyd0eXBlJ10sIGNhbGxiYWNrczogUHJvbWlzZUNhbGxiYWNrczx1bmtub3duPik6IHZvaWQgPT4ge1xyXG4gIGNvbnN0IHF1ZXVlID0gcXVldWVkQ2FsbGJhY2tzLmdldCh0eXBlKTtcclxuICBpZiAocXVldWUpIHtcclxuICAgIHF1ZXVlLnB1c2goY2FsbGJhY2tzKTtcclxuICB9IGVsc2Uge1xyXG4gICAgcXVldWVkQ2FsbGJhY2tzLnNldCh0eXBlLCBbY2FsbGJhY2tzXSk7XHJcbiAgfVxyXG59O1xyXG5cclxuY29uc3QgZW5zdXJlV29ya2VyID0gKCk6IHZvaWQgPT4ge1xyXG4gIGlmIChpbml0aWFsaXppbmcgfHwgIWluaXRpYWxpemVkIHx8IGFib3J0ZWQgfHwgIXByb3h5V29ya2VyKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3dvcmtlciBub3QgcmVhZHknKTtcclxuICB9XHJcbn07XHJcblxyXG5jb25zdCBvblByb3h5V29ya2VyTWVzc2FnZSA9IChldjogTWVzc2FnZUV2ZW50PE9ydFdhc21NZXNzYWdlPik6IHZvaWQgPT4ge1xyXG4gIHN3aXRjaCAoZXYuZGF0YS50eXBlKSB7XHJcbiAgICBjYXNlICdpbml0LXdhc20nOlxyXG4gICAgICBpbml0aWFsaXppbmcgPSBmYWxzZTtcclxuICAgICAgaWYgKGV2LmRhdGEuZXJyKSB7XHJcbiAgICAgICAgYWJvcnRlZCA9IHRydWU7XHJcbiAgICAgICAgaW5pdFdhc21DYWxsYmFja3NbMV0oZXYuZGF0YS5lcnIpO1xyXG4gICAgICB9IGVsc2Uge1xyXG4gICAgICAgIGluaXRpYWxpemVkID0gdHJ1ZTtcclxuICAgICAgICBpbml0V2FzbUNhbGxiYWNrc1swXSgpO1xyXG4gICAgICB9XHJcbiAgICAgIGJyZWFrO1xyXG4gICAgY2FzZSAnaW5pdC1lcCc6XHJcbiAgICBjYXNlICdjb3B5LWZyb20nOlxyXG4gICAgY2FzZSAnY3JlYXRlJzpcclxuICAgIGNhc2UgJ3JlbGVhc2UnOlxyXG4gICAgY2FzZSAncnVuJzpcclxuICAgIGNhc2UgJ2VuZC1wcm9maWxpbmcnOiB7XHJcbiAgICAgIGNvbnN0IGNhbGxiYWNrcyA9IHF1ZXVlZENhbGxiYWNrcy5nZXQoZXYuZGF0YS50eXBlKSE7XHJcbiAgICAgIGlmIChldi5kYXRhLmVycikge1xyXG4gICAgICAgIGNhbGxiYWNrcy5zaGlmdCgpIVsxXShldi5kYXRhLmVycik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgY2FsbGJhY2tzLnNoaWZ0KCkhWzBdKGV2LmRhdGEub3V0ISk7XHJcbiAgICAgIH1cclxuICAgICAgYnJlYWs7XHJcbiAgICB9XHJcbiAgICBkZWZhdWx0OlxyXG4gIH1cclxufTtcclxuXHJcbmNvbnN0IHNjcmlwdFNyYyA9IHR5cGVvZiBkb2N1bWVudCAhPT0gJ3VuZGVmaW5lZCcgPyAoZG9jdW1lbnQ/LmN1cnJlbnRTY3JpcHQgYXMgSFRNTFNjcmlwdEVsZW1lbnQpPy5zcmMgOiB1bmRlZmluZWQ7XHJcblxyXG5leHBvcnQgY29uc3QgaW5pdGlhbGl6ZVdlYkFzc2VtYmx5QW5kT3J0UnVudGltZSA9IGFzeW5jKCk6IFByb21pc2U8dm9pZD4gPT4ge1xyXG4gIGlmIChpbml0aWFsaXplZCkge1xyXG4gICAgcmV0dXJuO1xyXG4gIH1cclxuICBpZiAoaW5pdGlhbGl6aW5nKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ211bHRpcGxlIGNhbGxzIHRvIFxcJ2luaXRXYXNtKClcXCcgZGV0ZWN0ZWQuJyk7XHJcbiAgfVxyXG4gIGlmIChhYm9ydGVkKSB7XHJcbiAgICB0aHJvdyBuZXcgRXJyb3IoJ3ByZXZpb3VzIGNhbGwgdG8gXFwnaW5pdFdhc20oKVxcJyBmYWlsZWQuJyk7XHJcbiAgfVxyXG5cclxuICBpbml0aWFsaXppbmcgPSB0cnVlO1xyXG5cclxuICBpZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XQVNNX1BST1hZICYmIGlzUHJveHkoKSkge1xyXG4gICAgLy8gb3ZlcndyaXRlIHdhc20gZmlsZXBhdGhzXHJcbiAgICBpZiAoZW52Lndhc20ud2FzbVBhdGhzID09PSB1bmRlZmluZWQpIHtcclxuICAgICAgaWYgKHNjcmlwdFNyYyAmJiBzY3JpcHRTcmMuaW5kZXhPZignYmxvYjonKSAhPT0gMCkge1xyXG4gICAgICAgIGVudi53YXNtLndhc21QYXRocyA9IHNjcmlwdFNyYy5zdWJzdHIoMCwgKyhzY3JpcHRTcmMpLmxhc3RJbmRleE9mKCcvJykgKyAxKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG5cclxuICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIHByb3h5V29ya2VyPy50ZXJtaW5hdGUoKTtcclxuXHJcbiAgICAgIGNvbnN0IHdvcmtlclVybCA9IFVSTC5jcmVhdGVPYmplY3RVUkwobmV3IEJsb2IoXHJcbiAgICAgICAgICBbXHJcbiAgICAgICAgICAgIC8vIFRoaXMgcmVxdWlyZSgpIGZ1bmN0aW9uIGlzIGhhbmRsZWQgYnkgZXNidWlsZCBwbHVnaW4gdG8gbG9hZCBmaWxlIGNvbnRlbnQgYXMgc3RyaW5nLlxyXG4gICAgICAgICAgICAvLyBlc2xpbnQtZGlzYWJsZS1uZXh0LWxpbmUgQHR5cGVzY3JpcHQtZXNsaW50L25vLXJlcXVpcmUtaW1wb3J0c1xyXG4gICAgICAgICAgICByZXF1aXJlKCcuL3Byb3h5LXdvcmtlci9tYWluJylcclxuICAgICAgICAgIF0sXHJcbiAgICAgICAgICB7dHlwZTogJ3RleHQvamF2YXNjcmlwdCd9KSk7XHJcbiAgICAgIHByb3h5V29ya2VyID0gbmV3IFdvcmtlcih3b3JrZXJVcmwsIHtuYW1lOiAnb3J0LXdhc20tcHJveHktd29ya2VyJ30pO1xyXG4gICAgICBwcm94eVdvcmtlci5vbmVycm9yID0gKGV2OiBFcnJvckV2ZW50KSA9PiByZWplY3QoZXYpO1xyXG4gICAgICBwcm94eVdvcmtlci5vbm1lc3NhZ2UgPSBvblByb3h5V29ya2VyTWVzc2FnZTtcclxuICAgICAgVVJMLnJldm9rZU9iamVjdFVSTCh3b3JrZXJVcmwpO1xyXG4gICAgICBpbml0V2FzbUNhbGxiYWNrcyA9IFtyZXNvbHZlLCByZWplY3RdO1xyXG4gICAgICBjb25zdCBtZXNzYWdlOiBPcnRXYXNtTWVzc2FnZSA9IHt0eXBlOiAnaW5pdC13YXNtJywgaW4gOiBlbnZ9O1xyXG4gICAgICBwcm94eVdvcmtlci5wb3N0TWVzc2FnZShtZXNzYWdlKTtcclxuICAgIH0pO1xyXG5cclxuICB9IGVsc2Uge1xyXG4gICAgdHJ5IHtcclxuICAgICAgYXdhaXQgaW5pdGlhbGl6ZVdlYkFzc2VtYmx5KGVudi53YXNtKTtcclxuICAgICAgYXdhaXQgY29yZS5pbml0UnVudGltZShlbnYpO1xyXG4gICAgICBpbml0aWFsaXplZCA9IHRydWU7XHJcbiAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgIGFib3J0ZWQgPSB0cnVlO1xyXG4gICAgICB0aHJvdyBlO1xyXG4gICAgfSBmaW5hbGx5IHtcclxuICAgICAgaW5pdGlhbGl6aW5nID0gZmFsc2U7XHJcbiAgICB9XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IGluaXRpYWxpemVPcnRFcCA9IGFzeW5jKGVwTmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9QUk9YWSAmJiBpc1Byb3h5KCkpIHtcclxuICAgIGVuc3VyZVdvcmtlcigpO1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgZW5xdWV1ZUNhbGxiYWNrcygnaW5pdC1lcCcsIFtyZXNvbHZlLCByZWplY3RdKTtcclxuICAgICAgY29uc3QgbWVzc2FnZTogT3J0V2FzbU1lc3NhZ2UgPSB7dHlwZTogJ2luaXQtZXAnLCBpbiA6IHtlcE5hbWUsIGVudn19O1xyXG4gICAgICBwcm94eVdvcmtlciEucG9zdE1lc3NhZ2UobWVzc2FnZSk7XHJcbiAgICB9KTtcclxuICB9IGVsc2Uge1xyXG4gICAgYXdhaXQgY29yZS5pbml0RXAoZW52LCBlcE5hbWUpO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBjb3B5RnJvbUV4dGVybmFsQnVmZmVyID0gYXN5bmMoYnVmZmVyOiBVaW50OEFycmF5KTogUHJvbWlzZTxTZXJpYWxpemFibGVJbnRlcm5hbEJ1ZmZlcj4gPT4ge1xyXG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fUFJPWFkgJiYgaXNQcm94eSgpKSB7XHJcbiAgICBlbnN1cmVXb3JrZXIoKTtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZTxTZXJpYWxpemFibGVJbnRlcm5hbEJ1ZmZlcj4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xyXG4gICAgICBlbnF1ZXVlQ2FsbGJhY2tzKCdjb3B5LWZyb20nLCBbcmVzb2x2ZSwgcmVqZWN0XSk7XHJcbiAgICAgIGNvbnN0IG1lc3NhZ2U6IE9ydFdhc21NZXNzYWdlID0ge3R5cGU6ICdjb3B5LWZyb20nLCBpbiA6IHtidWZmZXJ9fTtcclxuICAgICAgcHJveHlXb3JrZXIhLnBvc3RNZXNzYWdlKG1lc3NhZ2UsIFtidWZmZXIuYnVmZmVyXSk7XHJcbiAgICB9KTtcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIGNvcmUuY29weUZyb21FeHRlcm5hbEJ1ZmZlcihidWZmZXIpO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBjcmVhdGVTZXNzaW9uID1cclxuICAgIGFzeW5jKG1vZGVsOiBTZXJpYWxpemFibGVJbnRlcm5hbEJ1ZmZlcnxVaW50OEFycmF5LCBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6XHJcbiAgICAgICAgUHJvbWlzZTxTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGE+ID0+IHtcclxuICAgICAgICAgIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fUFJPWFkgJiYgaXNQcm94eSgpKSB7XHJcbiAgICAgICAgICAgIC8vIGNoZWNrIHVuc3VwcG9ydGVkIG9wdGlvbnNcclxuICAgICAgICAgICAgaWYgKG9wdGlvbnM/LnByZWZlcnJlZE91dHB1dExvY2F0aW9uKSB7XHJcbiAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKCdzZXNzaW9uIG9wdGlvbiBcInByZWZlcnJlZE91dHB1dExvY2F0aW9uXCIgaXMgbm90IHN1cHBvcnRlZCBmb3IgcHJveHkuJyk7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgZW5zdXJlV29ya2VyKCk7XHJcbiAgICAgICAgICAgIHJldHVybiBuZXcgUHJvbWlzZTxTZXJpYWxpemFibGVTZXNzaW9uTWV0YWRhdGE+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgICAgICAgICBlbnF1ZXVlQ2FsbGJhY2tzKCdjcmVhdGUnLCBbcmVzb2x2ZSwgcmVqZWN0XSk7XHJcbiAgICAgICAgICAgICAgY29uc3QgbWVzc2FnZTogT3J0V2FzbU1lc3NhZ2UgPSB7dHlwZTogJ2NyZWF0ZScsIGluIDoge21vZGVsLCBvcHRpb25zOiB7Li4ub3B0aW9uc319fTtcclxuICAgICAgICAgICAgICBjb25zdCB0cmFuc2ZlcmFibGU6IFRyYW5zZmVyYWJsZVtdID0gW107XHJcbiAgICAgICAgICAgICAgaWYgKG1vZGVsIGluc3RhbmNlb2YgVWludDhBcnJheSkge1xyXG4gICAgICAgICAgICAgICAgdHJhbnNmZXJhYmxlLnB1c2gobW9kZWwuYnVmZmVyKTtcclxuICAgICAgICAgICAgICB9XHJcbiAgICAgICAgICAgICAgcHJveHlXb3JrZXIhLnBvc3RNZXNzYWdlKG1lc3NhZ2UsIHRyYW5zZmVyYWJsZSk7XHJcbiAgICAgICAgICAgIH0pO1xyXG4gICAgICAgICAgfSBlbHNlIHtcclxuICAgICAgICAgICAgcmV0dXJuIGNvcmUuY3JlYXRlU2Vzc2lvbihtb2RlbCwgb3B0aW9ucyk7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgfTtcclxuXHJcbmV4cG9ydCBjb25zdCByZWxlYXNlU2Vzc2lvbiA9IGFzeW5jKHNlc3Npb25JZDogbnVtYmVyKTogUHJvbWlzZTx2b2lkPiA9PiB7XHJcbiAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9QUk9YWSAmJiBpc1Byb3h5KCkpIHtcclxuICAgIGVuc3VyZVdvcmtlcigpO1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPHZvaWQ+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgZW5xdWV1ZUNhbGxiYWNrcygncmVsZWFzZScsIFtyZXNvbHZlLCByZWplY3RdKTtcclxuICAgICAgY29uc3QgbWVzc2FnZTogT3J0V2FzbU1lc3NhZ2UgPSB7dHlwZTogJ3JlbGVhc2UnLCBpbiA6IHNlc3Npb25JZH07XHJcbiAgICAgIHByb3h5V29ya2VyIS5wb3N0TWVzc2FnZShtZXNzYWdlKTtcclxuICAgIH0pO1xyXG4gIH0gZWxzZSB7XHJcbiAgICBjb3JlLnJlbGVhc2VTZXNzaW9uKHNlc3Npb25JZCk7XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNvbnN0IHJ1biA9IGFzeW5jKFxyXG4gICAgc2Vzc2lvbklkOiBudW1iZXIsIGlucHV0SW5kaWNlczogbnVtYmVyW10sIGlucHV0czogVGVuc29yTWV0YWRhdGFbXSwgb3V0cHV0SW5kaWNlczogbnVtYmVyW10sXHJcbiAgICBvdXRwdXRzOiBBcnJheTxUZW5zb3JNZXRhZGF0YXxudWxsPiwgb3B0aW9uczogSW5mZXJlbmNlU2Vzc2lvbi5SdW5PcHRpb25zKTogUHJvbWlzZTxUZW5zb3JNZXRhZGF0YVtdPiA9PiB7XHJcbiAgaWYgKCFCVUlMRF9ERUZTLkRJU0FCTEVfV0FTTV9QUk9YWSAmJiBpc1Byb3h5KCkpIHtcclxuICAgIC8vIGNoZWNrIGlucHV0cyBsb2NhdGlvblxyXG4gICAgaWYgKGlucHV0cy5zb21lKHQgPT4gdFszXSAhPT0gJ2NwdScpKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcignaW5wdXQgdGVuc29yIG9uIEdQVSBpcyBub3Qgc3VwcG9ydGVkIGZvciBwcm94eS4nKTtcclxuICAgIH1cclxuICAgIC8vIGNoZWNrIG91dHB1dHMgbG9jYXRpb25cclxuICAgIGlmIChvdXRwdXRzLnNvbWUodCA9PiB0KSkge1xyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoJ3ByZS1hbGxvY2F0ZWQgb3V0cHV0IHRlbnNvciBpcyBub3Qgc3VwcG9ydGVkIGZvciBwcm94eS4nKTtcclxuICAgIH1cclxuICAgIGVuc3VyZVdvcmtlcigpO1xyXG4gICAgcmV0dXJuIG5ldyBQcm9taXNlPFNlcmlhbGl6YWJsZVRlbnNvck1ldGFkYXRhW10+KChyZXNvbHZlLCByZWplY3QpID0+IHtcclxuICAgICAgZW5xdWV1ZUNhbGxiYWNrcygncnVuJywgW3Jlc29sdmUsIHJlamVjdF0pO1xyXG4gICAgICBjb25zdCBzZXJpYWxpemFibGVJbnB1dHMgPSBpbnB1dHMgYXMgU2VyaWFsaXphYmxlVGVuc29yTWV0YWRhdGFbXTsgIC8vIGV2ZXJ5IGlucHV0IGlzIG9uIENQVS5cclxuICAgICAgY29uc3QgbWVzc2FnZTogT3J0V2FzbU1lc3NhZ2UgPVxyXG4gICAgICAgICAge3R5cGU6ICdydW4nLCBpbiA6IHtzZXNzaW9uSWQsIGlucHV0SW5kaWNlcywgaW5wdXRzOiBzZXJpYWxpemFibGVJbnB1dHMsIG91dHB1dEluZGljZXMsIG9wdGlvbnN9fTtcclxuICAgICAgcHJveHlXb3JrZXIhLnBvc3RNZXNzYWdlKG1lc3NhZ2UsIGNvcmUuZXh0cmFjdFRyYW5zZmVyYWJsZUJ1ZmZlcnMoc2VyaWFsaXphYmxlSW5wdXRzKSk7XHJcbiAgICB9KTtcclxuICB9IGVsc2Uge1xyXG4gICAgcmV0dXJuIGNvcmUucnVuKHNlc3Npb25JZCwgaW5wdXRJbmRpY2VzLCBpbnB1dHMsIG91dHB1dEluZGljZXMsIG91dHB1dHMsIG9wdGlvbnMpO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBlbmRQcm9maWxpbmcgPSBhc3luYyhzZXNzaW9uSWQ6IG51bWJlcik6IFByb21pc2U8dm9pZD4gPT4ge1xyXG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dBU01fUFJPWFkgJiYgaXNQcm94eSgpKSB7XHJcbiAgICBlbnN1cmVXb3JrZXIoKTtcclxuICAgIHJldHVybiBuZXcgUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XHJcbiAgICAgIGVucXVldWVDYWxsYmFja3MoJ2VuZC1wcm9maWxpbmcnLCBbcmVzb2x2ZSwgcmVqZWN0XSk7XHJcbiAgICAgIGNvbnN0IG1lc3NhZ2U6IE9ydFdhc21NZXNzYWdlID0ge3R5cGU6ICdlbmQtcHJvZmlsaW5nJywgaW4gOiBzZXNzaW9uSWR9O1xyXG4gICAgICBwcm94eVdvcmtlciEucG9zdE1lc3NhZ2UobWVzc2FnZSk7XHJcbiAgICB9KTtcclxuICB9IGVsc2Uge1xyXG4gICAgY29yZS5lbmRQcm9maWxpbmcoc2Vzc2lvbklkKTtcclxuICB9XHJcbn07XHJcbiIsICIvLyBDb3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi4gQWxsIHJpZ2h0cyByZXNlcnZlZC5cclxuLy8gTGljZW5zZWQgdW5kZXIgdGhlIE1JVCBMaWNlbnNlLlxyXG5cclxuaW1wb3J0IHtJbmZlcmVuY2VTZXNzaW9uLCBJbmZlcmVuY2VTZXNzaW9uSGFuZGxlciwgU2Vzc2lvbkhhbmRsZXIsIFRlbnNvciwgVFJBQ0VfRlVOQ19CRUdJTiwgVFJBQ0VfRlVOQ19FTkR9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XHJcblxyXG5pbXBvcnQge1NlcmlhbGl6YWJsZUludGVybmFsQnVmZmVyLCBUZW5zb3JNZXRhZGF0YX0gZnJvbSAnLi9wcm94eS1tZXNzYWdlcyc7XHJcbmltcG9ydCB7Y29weUZyb21FeHRlcm5hbEJ1ZmZlciwgY3JlYXRlU2Vzc2lvbiwgZW5kUHJvZmlsaW5nLCByZWxlYXNlU2Vzc2lvbiwgcnVufSBmcm9tICcuL3Byb3h5LXdyYXBwZXInO1xyXG5pbXBvcnQge2lzR3B1QnVmZmVyU3VwcG9ydGVkVHlwZX0gZnJvbSAnLi93YXNtLWNvbW1vbic7XHJcbmltcG9ydCB7bG9hZEZpbGV9IGZyb20gJy4vd2FzbS11dGlscy1sb2FkLWZpbGUnO1xyXG5cclxuZXhwb3J0IGNvbnN0IGVuY29kZVRlbnNvck1ldGFkYXRhID0gKHRlbnNvcjogVGVuc29yLCBnZXROYW1lOiAoKSA9PiBzdHJpbmcpOiBUZW5zb3JNZXRhZGF0YSA9PiB7XHJcbiAgc3dpdGNoICh0ZW5zb3IubG9jYXRpb24pIHtcclxuICAgIGNhc2UgJ2NwdSc6XHJcbiAgICAgIHJldHVybiBbdGVuc29yLnR5cGUsIHRlbnNvci5kaW1zLCB0ZW5zb3IuZGF0YSwgJ2NwdSddO1xyXG4gICAgY2FzZSAnZ3B1LWJ1ZmZlcic6XHJcbiAgICAgIHJldHVybiBbdGVuc29yLnR5cGUsIHRlbnNvci5kaW1zLCB7Z3B1QnVmZmVyOiB0ZW5zb3IuZ3B1QnVmZmVyfSwgJ2dwdS1idWZmZXInXTtcclxuICAgIGRlZmF1bHQ6XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBkYXRhIGxvY2F0aW9uOiAke3RlbnNvci5sb2NhdGlvbn0gZm9yICR7Z2V0TmFtZSgpfWApO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjb25zdCBkZWNvZGVUZW5zb3JNZXRhZGF0YSA9ICh0ZW5zb3I6IFRlbnNvck1ldGFkYXRhKTogVGVuc29yID0+IHtcclxuICBzd2l0Y2ggKHRlbnNvclszXSkge1xyXG4gICAgY2FzZSAnY3B1JzpcclxuICAgICAgcmV0dXJuIG5ldyBUZW5zb3IodGVuc29yWzBdLCB0ZW5zb3JbMl0sIHRlbnNvclsxXSk7XHJcbiAgICBjYXNlICdncHUtYnVmZmVyJzoge1xyXG4gICAgICBjb25zdCBkYXRhVHlwZSA9IHRlbnNvclswXTtcclxuICAgICAgaWYgKCFpc0dwdUJ1ZmZlclN1cHBvcnRlZFR5cGUoZGF0YVR5cGUpKSB7XHJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBub3Qgc3VwcG9ydGVkIGRhdGEgdHlwZTogJHtkYXRhVHlwZX0gZm9yIGRlc2VyaWFsaXppbmcgR1BVIHRlbnNvcmApO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IHtncHVCdWZmZXIsIGRvd25sb2FkLCBkaXNwb3NlfSA9IHRlbnNvclsyXTtcclxuICAgICAgcmV0dXJuIFRlbnNvci5mcm9tR3B1QnVmZmVyKGdwdUJ1ZmZlciwge2RhdGFUeXBlLCBkaW1zOiB0ZW5zb3JbMV0sIGRvd25sb2FkLCBkaXNwb3NlfSk7XHJcbiAgICB9XHJcbiAgICBkZWZhdWx0OlxyXG4gICAgICB0aHJvdyBuZXcgRXJyb3IoYGludmFsaWQgZGF0YSBsb2NhdGlvbjogJHt0ZW5zb3JbM119YCk7XHJcbiAgfVxyXG59O1xyXG5cclxuZXhwb3J0IGNsYXNzIE9ubnhydW50aW1lV2ViQXNzZW1ibHlTZXNzaW9uSGFuZGxlciBpbXBsZW1lbnRzIEluZmVyZW5jZVNlc3Npb25IYW5kbGVyIHtcclxuICBwcml2YXRlIHNlc3Npb25JZDogbnVtYmVyO1xyXG5cclxuICBpbnB1dE5hbWVzOiBzdHJpbmdbXTtcclxuICBvdXRwdXROYW1lczogc3RyaW5nW107XHJcblxyXG4gIGFzeW5jIGZldGNoTW9kZWxBbmRDb3B5VG9XYXNtTWVtb3J5KHBhdGg6IHN0cmluZyk6IFByb21pc2U8U2VyaWFsaXphYmxlSW50ZXJuYWxCdWZmZXI+IHtcclxuICAgIC8vIGZldGNoIG1vZGVsIGZyb20gdXJsIGFuZCBtb3ZlIHRvIHdhc20gaGVhcC5cclxuICAgIHJldHVybiBjb3B5RnJvbUV4dGVybmFsQnVmZmVyKGF3YWl0IGxvYWRGaWxlKHBhdGgpKTtcclxuICB9XHJcblxyXG4gIGFzeW5jIGxvYWRNb2RlbChwYXRoT3JCdWZmZXI6IHN0cmluZ3xVaW50OEFycmF5LCBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6IFByb21pc2U8dm9pZD4ge1xyXG4gICAgVFJBQ0VfRlVOQ19CRUdJTigpO1xyXG4gICAgbGV0IG1vZGVsOiBQYXJhbWV0ZXJzPHR5cGVvZiBjcmVhdGVTZXNzaW9uPlswXTtcclxuXHJcbiAgICBpZiAodHlwZW9mIHBhdGhPckJ1ZmZlciA9PT0gJ3N0cmluZycpIHtcclxuICAgICAgaWYgKHR5cGVvZiBwcm9jZXNzICE9PSAndW5kZWZpbmVkJyAmJiBwcm9jZXNzLnZlcnNpb25zICYmIHByb2Nlc3MudmVyc2lvbnMubm9kZSkge1xyXG4gICAgICAgIC8vIG5vZGVcclxuICAgICAgICBtb2RlbCA9IGF3YWl0IGxvYWRGaWxlKHBhdGhPckJ1ZmZlcik7XHJcbiAgICAgIH0gZWxzZSB7XHJcbiAgICAgICAgLy8gYnJvd3NlclxyXG4gICAgICAgIC8vIGZldGNoIG1vZGVsIGFuZCBjb3B5IHRvIHdhc20gaGVhcC5cclxuICAgICAgICBtb2RlbCA9IGF3YWl0IHRoaXMuZmV0Y2hNb2RlbEFuZENvcHlUb1dhc21NZW1vcnkocGF0aE9yQnVmZmVyKTtcclxuICAgICAgfVxyXG4gICAgfSBlbHNlIHtcclxuICAgICAgbW9kZWwgPSBwYXRoT3JCdWZmZXI7XHJcbiAgICB9XHJcblxyXG4gICAgW3RoaXMuc2Vzc2lvbklkLCB0aGlzLmlucHV0TmFtZXMsIHRoaXMub3V0cHV0TmFtZXNdID0gYXdhaXQgY3JlYXRlU2Vzc2lvbihtb2RlbCwgb3B0aW9ucyk7XHJcbiAgICBUUkFDRV9GVU5DX0VORCgpO1xyXG4gIH1cclxuXHJcbiAgYXN5bmMgZGlzcG9zZSgpOiBQcm9taXNlPHZvaWQ+IHtcclxuICAgIHJldHVybiByZWxlYXNlU2Vzc2lvbih0aGlzLnNlc3Npb25JZCk7XHJcbiAgfVxyXG5cclxuICBhc3luYyBydW4oZmVlZHM6IFNlc3Npb25IYW5kbGVyLkZlZWRzVHlwZSwgZmV0Y2hlczogU2Vzc2lvbkhhbmRsZXIuRmV0Y2hlc1R5cGUsIG9wdGlvbnM6IEluZmVyZW5jZVNlc3Npb24uUnVuT3B0aW9ucyk6XHJcbiAgICAgIFByb21pc2U8U2Vzc2lvbkhhbmRsZXIuUmV0dXJuVHlwZT4ge1xyXG4gICAgVFJBQ0VfRlVOQ19CRUdJTigpO1xyXG4gICAgY29uc3QgaW5wdXRBcnJheTogVGVuc29yW10gPSBbXTtcclxuICAgIGNvbnN0IGlucHV0SW5kaWNlczogbnVtYmVyW10gPSBbXTtcclxuICAgIE9iamVjdC5lbnRyaWVzKGZlZWRzKS5mb3JFYWNoKGt2cCA9PiB7XHJcbiAgICAgIGNvbnN0IG5hbWUgPSBrdnBbMF07XHJcbiAgICAgIGNvbnN0IHRlbnNvciA9IGt2cFsxXTtcclxuICAgICAgY29uc3QgaW5kZXggPSB0aGlzLmlucHV0TmFtZXMuaW5kZXhPZihuYW1lKTtcclxuICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBpbnB1dCAnJHtuYW1lfSdgKTtcclxuICAgICAgfVxyXG4gICAgICBpbnB1dEFycmF5LnB1c2godGVuc29yKTtcclxuICAgICAgaW5wdXRJbmRpY2VzLnB1c2goaW5kZXgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3Qgb3V0cHV0QXJyYXk6IEFycmF5PFRlbnNvcnxudWxsPiA9IFtdO1xyXG4gICAgY29uc3Qgb3V0cHV0SW5kaWNlczogbnVtYmVyW10gPSBbXTtcclxuICAgIE9iamVjdC5lbnRyaWVzKGZldGNoZXMpLmZvckVhY2goa3ZwID0+IHtcclxuICAgICAgY29uc3QgbmFtZSA9IGt2cFswXTtcclxuICAgICAgY29uc3QgdGVuc29yID0ga3ZwWzFdO1xyXG4gICAgICBjb25zdCBpbmRleCA9IHRoaXMub3V0cHV0TmFtZXMuaW5kZXhPZihuYW1lKTtcclxuICAgICAgaWYgKGluZGV4ID09PSAtMSkge1xyXG4gICAgICAgIHRocm93IG5ldyBFcnJvcihgaW52YWxpZCBvdXRwdXQgJyR7bmFtZX0nYCk7XHJcbiAgICAgIH1cclxuICAgICAgb3V0cHV0QXJyYXkucHVzaCh0ZW5zb3IpO1xyXG4gICAgICBvdXRwdXRJbmRpY2VzLnB1c2goaW5kZXgpO1xyXG4gICAgfSk7XHJcblxyXG4gICAgY29uc3QgaW5wdXRzID1cclxuICAgICAgICBpbnB1dEFycmF5Lm1hcCgodCwgaSkgPT4gZW5jb2RlVGVuc29yTWV0YWRhdGEodCwgKCkgPT4gYGlucHV0IFwiJHt0aGlzLmlucHV0TmFtZXNbaW5wdXRJbmRpY2VzW2ldXX1cImApKTtcclxuICAgIGNvbnN0IG91dHB1dHMgPSBvdXRwdXRBcnJheS5tYXAoXHJcbiAgICAgICAgKHQsIGkpID0+IHQgPyBlbmNvZGVUZW5zb3JNZXRhZGF0YSh0LCAoKSA9PiBgb3V0cHV0IFwiJHt0aGlzLm91dHB1dE5hbWVzW291dHB1dEluZGljZXNbaV1dfVwiYCkgOiBudWxsKTtcclxuXHJcbiAgICBjb25zdCByZXN1bHRzID0gYXdhaXQgcnVuKHRoaXMuc2Vzc2lvbklkLCBpbnB1dEluZGljZXMsIGlucHV0cywgb3V0cHV0SW5kaWNlcywgb3V0cHV0cywgb3B0aW9ucyk7XHJcblxyXG4gICAgY29uc3QgcmVzdWx0TWFwOiBTZXNzaW9uSGFuZGxlci5SZXR1cm5UeXBlID0ge307XHJcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHJlc3VsdHMubGVuZ3RoOyBpKyspIHtcclxuICAgICAgcmVzdWx0TWFwW3RoaXMub3V0cHV0TmFtZXNbb3V0cHV0SW5kaWNlc1tpXV1dID0gb3V0cHV0QXJyYXlbaV0gPz8gZGVjb2RlVGVuc29yTWV0YWRhdGEocmVzdWx0c1tpXSk7XHJcbiAgICB9XHJcbiAgICBUUkFDRV9GVU5DX0VORCgpO1xyXG4gICAgcmV0dXJuIHJlc3VsdE1hcDtcclxuICB9XHJcblxyXG4gIHN0YXJ0UHJvZmlsaW5nKCk6IHZvaWQge1xyXG4gICAgLy8gVE9ETzogaW1wbGVtZW50IHByb2ZpbGluZ1xyXG4gIH1cclxuXHJcbiAgZW5kUHJvZmlsaW5nKCk6IHZvaWQge1xyXG4gICAgdm9pZCBlbmRQcm9maWxpbmcodGhpcy5zZXNzaW9uSWQpO1xyXG4gIH1cclxufVxyXG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cclxuXHJcbmltcG9ydCB7Y3B1c30gZnJvbSAnbm9kZTpvcyc7XHJcbmltcG9ydCB7QmFja2VuZCwgZW52LCBJbmZlcmVuY2VTZXNzaW9uLCBJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcn0gZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcclxuXHJcbmltcG9ydCB7aW5pdGlhbGl6ZU9ydEVwLCBpbml0aWFsaXplV2ViQXNzZW1ibHlBbmRPcnRSdW50aW1lfSBmcm9tICcuL3dhc20vcHJveHktd3JhcHBlcic7XHJcbmltcG9ydCB7T25ueHJ1bnRpbWVXZWJBc3NlbWJseVNlc3Npb25IYW5kbGVyfSBmcm9tICcuL3dhc20vc2Vzc2lvbi1oYW5kbGVyLWluZmVyZW5jZSc7XHJcblxyXG4vKipcclxuICogVGhpcyBmdW5jdGlvbiBpbml0aWFsaXplcyBhbGwgZmxhZ3MgZm9yIFdlYkFzc2VtYmx5LlxyXG4gKlxyXG4gKiBUaG9zZSBmbGFncyBhcmUgYWNjZXNzaWJsZSBmcm9tIGBvcnQuZW52Lndhc21gLiBVc2VycyBhcmUgYWxsb3cgdG8gc2V0IHRob3NlIGZsYWdzIGJlZm9yZSB0aGUgZmlyc3QgaW5mZXJlbmNlIHNlc3Npb25cclxuICogYmVpbmcgY3JlYXRlZCwgdG8gb3ZlcnJpZGUgZGVmYXVsdCB2YWx1ZS5cclxuICovXHJcbmV4cG9ydCBjb25zdCBpbml0aWFsaXplRmxhZ3MgPSAoKTogdm9pZCA9PiB7XHJcbiAgaWYgKHR5cGVvZiBlbnYud2FzbS5pbml0VGltZW91dCAhPT0gJ251bWJlcicgfHwgZW52Lndhc20uaW5pdFRpbWVvdXQgPCAwKSB7XHJcbiAgICBlbnYud2FzbS5pbml0VGltZW91dCA9IDA7XHJcbiAgfVxyXG5cclxuICBpZiAodHlwZW9mIGVudi53YXNtLnNpbWQgIT09ICdib29sZWFuJykge1xyXG4gICAgZW52Lndhc20uc2ltZCA9IHRydWU7XHJcbiAgfVxyXG5cclxuICBpZiAodHlwZW9mIGVudi53YXNtLnByb3h5ICE9PSAnYm9vbGVhbicpIHtcclxuICAgIGVudi53YXNtLnByb3h5ID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBpZiAodHlwZW9mIGVudi53YXNtLnRyYWNlICE9PSAnYm9vbGVhbicpIHtcclxuICAgIGVudi53YXNtLnRyYWNlID0gZmFsc2U7XHJcbiAgfVxyXG5cclxuICBpZiAodHlwZW9mIGVudi53YXNtLm51bVRocmVhZHMgIT09ICdudW1iZXInIHx8ICFOdW1iZXIuaXNJbnRlZ2VyKGVudi53YXNtLm51bVRocmVhZHMpIHx8IGVudi53YXNtLm51bVRocmVhZHMgPD0gMCkge1xyXG4gICAgLy8gV2ViOiB3aGVuIGNyb3NzT3JpZ2luSXNvbGF0ZWQgaXMgZmFsc2UsIFNoYXJlZEFycmF5QnVmZmVyIGlzIG5vdCBhdmFpbGFibGUgc28gV2ViQXNzZW1ibHkgdGhyZWFkcyB3aWxsIG5vdCB3b3JrLlxyXG4gICAgLy8gTm9kZS5qczogb25ueHJ1bnRpbWUtd2ViIGRvZXMgbm90IHN1cHBvcnQgbXVsdGktdGhyZWFkcyBpbiBOb2RlLmpzLlxyXG4gICAgaWYgKCh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcgJiYgIXNlbGYuY3Jvc3NPcmlnaW5Jc29sYXRlZCkgfHxcclxuICAgICAgICAodHlwZW9mIHByb2Nlc3MgIT09ICd1bmRlZmluZWQnICYmIHByb2Nlc3MudmVyc2lvbnMgJiYgcHJvY2Vzcy52ZXJzaW9ucy5ub2RlKSkge1xyXG4gICAgICBlbnYud2FzbS5udW1UaHJlYWRzID0gMTtcclxuICAgIH1cclxuICAgIGNvbnN0IG51bUNwdUxvZ2ljYWxDb3JlcyA9IHR5cGVvZiBuYXZpZ2F0b3IgPT09ICd1bmRlZmluZWQnID8gY3B1cygpLmxlbmd0aCA6IG5hdmlnYXRvci5oYXJkd2FyZUNvbmN1cnJlbmN5O1xyXG4gICAgZW52Lndhc20ubnVtVGhyZWFkcyA9IE1hdGgubWluKDQsIE1hdGguY2VpbCgobnVtQ3B1TG9naWNhbENvcmVzIHx8IDEpIC8gMikpO1xyXG4gIH1cclxufTtcclxuXHJcbmV4cG9ydCBjbGFzcyBPbm54cnVudGltZVdlYkFzc2VtYmx5QmFja2VuZCBpbXBsZW1lbnRzIEJhY2tlbmQge1xyXG4gIC8qKlxyXG4gICAqIFRoaXMgZnVuY3Rpb24gaW5pdGlhbGl6ZXMgdGhlIFdlYkFzc2VtYmx5IGJhY2tlbmQuXHJcbiAgICpcclxuICAgKiBUaGlzIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIG9ubHkgb25jZSBmb3IgZWFjaCBiYWNrZW5kIG5hbWUuIEl0IHdpbGwgYmUgY2FsbGVkIHRoZSBmaXJzdCB0aW1lIHdoZW5cclxuICAgKiBgb3J0LkluZmVyZW5jZVNlc3Npb24uY3JlYXRlKClgIGlzIGNhbGxlZCB3aXRoIGEgcmVnaXN0ZXJlZCBiYWNrZW5kIG5hbWUuXHJcbiAgICpcclxuICAgKiBAcGFyYW0gYmFja2VuZE5hbWUgLSB0aGUgcmVnaXN0ZXJlZCBiYWNrZW5kIG5hbWUuXHJcbiAgICovXHJcbiAgYXN5bmMgaW5pdChiYWNrZW5kTmFtZTogc3RyaW5nKTogUHJvbWlzZTx2b2lkPiB7XHJcbiAgICAvLyBwb3B1bGF0ZSB3YXNtIGZsYWdzXHJcbiAgICBpbml0aWFsaXplRmxhZ3MoKTtcclxuXHJcbiAgICAvLyBpbml0IHdhc21cclxuICAgIGF3YWl0IGluaXRpYWxpemVXZWJBc3NlbWJseUFuZE9ydFJ1bnRpbWUoKTtcclxuXHJcbiAgICAvLyBwZXJmb3JtZSBFUCBzcGVjaWZpYyBpbml0aWFsaXphdGlvblxyXG4gICAgYXdhaXQgaW5pdGlhbGl6ZU9ydEVwKGJhY2tlbmROYW1lKTtcclxuICB9XHJcbiAgY3JlYXRlSW5mZXJlbmNlU2Vzc2lvbkhhbmRsZXIocGF0aDogc3RyaW5nLCBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6XHJcbiAgICAgIFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbkhhbmRsZXI+O1xyXG4gIGNyZWF0ZUluZmVyZW5jZVNlc3Npb25IYW5kbGVyKGJ1ZmZlcjogVWludDhBcnJheSwgb3B0aW9ucz86IEluZmVyZW5jZVNlc3Npb24uU2Vzc2lvbk9wdGlvbnMpOlxyXG4gICAgICBQcm9taXNlPEluZmVyZW5jZVNlc3Npb25IYW5kbGVyPjtcclxuICBhc3luYyBjcmVhdGVJbmZlcmVuY2VTZXNzaW9uSGFuZGxlcihwYXRoT3JCdWZmZXI6IHN0cmluZ3xVaW50OEFycmF5LCBvcHRpb25zPzogSW5mZXJlbmNlU2Vzc2lvbi5TZXNzaW9uT3B0aW9ucyk6XHJcbiAgICAgIFByb21pc2U8SW5mZXJlbmNlU2Vzc2lvbkhhbmRsZXI+IHtcclxuICAgIGNvbnN0IGhhbmRsZXIgPSBuZXcgT25ueHJ1bnRpbWVXZWJBc3NlbWJseVNlc3Npb25IYW5kbGVyKCk7XHJcbiAgICBhd2FpdCBoYW5kbGVyLmxvYWRNb2RlbChwYXRoT3JCdWZmZXIsIG9wdGlvbnMpO1xyXG4gICAgcmV0dXJuIFByb21pc2UucmVzb2x2ZShoYW5kbGVyKTtcclxuICB9XHJcbn1cclxuIiwgIi8vIENvcHlyaWdodCAoYykgTWljcm9zb2Z0IENvcnBvcmF0aW9uLiBBbGwgcmlnaHRzIHJlc2VydmVkLlxyXG4vLyBMaWNlbnNlZCB1bmRlciB0aGUgTUlUIExpY2Vuc2UuXHJcblxyXG5pbXBvcnQge09ubnhydW50aW1lV2ViQXNzZW1ibHlCYWNrZW5kfSBmcm9tICcuL2JhY2tlbmQtd2FzbSc7XHJcbmV4cG9ydCBjb25zdCB3YXNtQmFja2VuZCA9IG5ldyBPbm54cnVudGltZVdlYkFzc2VtYmx5QmFja2VuZCgpO1xyXG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cclxuXHJcbi8qIGVzbGludC1kaXNhYmxlIEB0eXBlc2NyaXB0LWVzbGludC9uby12YXItcmVxdWlyZXMsIEB0eXBlc2NyaXB0LWVzbGludC9uby1yZXF1aXJlLWltcG9ydHMgKi9cclxuLy8gV2UgdXNlIFwicmVxdWlyZVwiIGluc3RlYWQgb2YgXCJpbXBvcnRcIiBoZXJlIGJlY2F1c2UgaW1wb3J0IHN0YXRlbWVudCBtdXN0IGJlIHB1dCBpbiB0b3AgbGV2ZWwuIE91ciBjdXJyZW50IGNvZGUgZG9lc1xyXG4vLyBub3QgYWxsb3cgYnVuZGxlciB0byB0cmVlLXNoYWtpbmcgY29kZSBhcyBleHBlY3RlZCBiZWNhdXNlIHNvbWUgY29kZXMgYXJlIHRyZWF0ZWQgYXMgaGF2aW5nIHNpZGUgZWZmZWN0cy5cclxuLy8gU28gd2UgaW1wb3J0IGNvZGUgaW5zaWRlIHRoZSBpZi1jbGF1c2UgdG8gYWxsb3cgYnVuZGxlciByZW1vdmUgdGhlIGNvZGUgc2FmZWx5LlxyXG5cclxuZXhwb3J0ICogZnJvbSAnb25ueHJ1bnRpbWUtY29tbW9uJztcclxuaW1wb3J0ICogYXMgb3J0IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XHJcbmV4cG9ydCBkZWZhdWx0IG9ydDtcclxuXHJcbmltcG9ydCB7cmVnaXN0ZXJCYWNrZW5kLCBlbnZ9IGZyb20gJ29ubnhydW50aW1lLWNvbW1vbic7XHJcbmltcG9ydCB7dmVyc2lvbn0gZnJvbSAnLi92ZXJzaW9uJztcclxuXHJcbmlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdMKSB7XHJcbiAgY29uc3Qgb25ueGpzQmFja2VuZCA9IHJlcXVpcmUoJy4vYmFja2VuZC1vbm54anMnKS5vbm54anNCYWNrZW5kO1xyXG4gIHJlZ2lzdGVyQmFja2VuZCgnd2ViZ2wnLCBvbm54anNCYWNrZW5kLCAtMTApO1xyXG59XHJcblxyXG5pZiAoIUJVSUxEX0RFRlMuRElTQUJMRV9XQVNNKSB7XHJcbiAgY29uc3Qgd2FzbUJhY2tlbmQgPSBCVUlMRF9ERUZTLkRJU0FCTEVfVFJBSU5JTkcgPyByZXF1aXJlKCcuL2JhY2tlbmQtd2FzbS1pbmZlcmVuY2UnKS53YXNtQmFja2VuZCA6XHJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXF1aXJlKCcuL2JhY2tlbmQtd2FzbS10cmFpbmluZycpLndhc21CYWNrZW5kO1xyXG4gIGlmICghQlVJTERfREVGUy5ESVNBQkxFX1dFQkdQVSkge1xyXG4gICAgcmVnaXN0ZXJCYWNrZW5kKCd3ZWJncHUnLCB3YXNtQmFja2VuZCwgNSk7XHJcbiAgICByZWdpc3RlckJhY2tlbmQoJ3dlYm5uJywgd2FzbUJhY2tlbmQsIDUpO1xyXG4gIH1cclxuICByZWdpc3RlckJhY2tlbmQoJ2NwdScsIHdhc21CYWNrZW5kLCAxMCk7XHJcbiAgcmVnaXN0ZXJCYWNrZW5kKCd3YXNtJywgd2FzbUJhY2tlbmQsIDEwKTtcclxufVxyXG5cclxuT2JqZWN0LmRlZmluZVByb3BlcnR5KGVudi52ZXJzaW9ucywgJ3dlYicsIHt2YWx1ZTogdmVyc2lvbiwgZW51bWVyYWJsZTogdHJ1ZX0pO1xyXG4iLCAiLy8gQ29weXJpZ2h0IChjKSBNaWNyb3NvZnQgQ29ycG9yYXRpb24uIEFsbCByaWdodHMgcmVzZXJ2ZWQuXHJcbi8vIExpY2Vuc2VkIHVuZGVyIHRoZSBNSVQgTGljZW5zZS5cclxuXHJcbi8vIFRoaXMgZmlsZSBpcyBnZW5lcmF0ZWQgYnkgL2pzL3NjcmlwdHMvdXBkYXRlLXZlcnNpb24udHNcclxuLy8gRG8gbm90IG1vZGlmeSBmaWxlIGNvbnRlbnQgbWFudWFsbHkuXHJcblxyXG5leHBvcnQgY29uc3QgdmVyc2lvbiA9ICcxLjE4LjInO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSxJQWdCTSxVQUNBLDBCQVlPLGlC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bnNvciIsICJUcmFpbmluZ1Nlc3Npb24iLCAiSW5mZXJlbmNlU2Vzc2lvbiIsICJUZW5zb3IiLCAiVHJhaW5pbmdTZXNzaW9uIiwgImVudiIsICJlcnIiLCAiaW5pdFJ1bnRpbWUiLCAibW9kdWxlIiwgImVudiIsICJkYXRlIiwgIndhc21FeHBvcnRzIiwgInJ1biIsICJ3YXNtIiwgIndhc20iLCAid2FzbSIsICJyZWFkRmlsZSIsICJyZWFkRmlsZSIsICJlbnYiLCAid2FzbSIsICJ0ZW5zb3IiLCAiZXJyb3JDb2RlIiwgImkiLCAiaW5pdGlhbGl6aW5nIiwgImluaXRpYWxpemVkIiwgImFib3J0ZWQiLCAiY29weUZyb21FeHRlcm5hbEJ1ZmZlciIsICJjcmVhdGVTZXNzaW9uIiwgInJlbGVhc2VTZXNzaW9uIiwgInJ1biIsICJlbmRQcm9maWxpbmciLCAiZW52IiwgIlRlbnNvciIsICJjb3B5RnJvbUV4dGVybmFsQnVmZmVyIiwgImNyZWF0ZVNlc3Npb24iLCAicmVsZWFzZVNlc3Npb24iLCAicnVuIiwgImVuZFByb2ZpbGluZyIsICJlbnYiLCAidmVyc2lvbiIsICJ3YXNtQmFja2VuZCIsICJlbnYiLCAidmVyc2lvbiJdCn0K
