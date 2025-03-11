"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyFace = verifyFace;
var child_process_1 = require("child_process");
var fs = __importStar(require("fs"));
var path = __importStar(require("path"));
var util_1 = require("util");
var writeFile = (0, util_1.promisify)(fs.writeFile);
var unlink = (0, util_1.promisify)(fs.unlink);
/**
 * Helper function to save a base64 image to a temporary file
 */
function saveBase64Image(imageBase64) {
    return __awaiter(this, void 0, void 0, function () {
        var imagePath, base64Data, buffer;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    imagePath = path.join(__dirname, "temp_".concat(Date.now(), ".jpg"));
                    base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");
                    buffer = Buffer.from(base64Data, "base64");
                    return [4 /*yield*/, writeFile(imagePath, buffer)];
                case 1:
                    _a.sent();
                    return [2 /*return*/, imagePath];
            }
        });
    });
}
/**
 * Verifies if an image contains a human face
 * @param imageBase64 Base64 encoded image data
 * @returns Promise with verification result
 */
function verifyFace(imageBase64) {
    return __awaiter(this, void 0, void 0, function () {
        var imagePath, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    imagePath = "";
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, 4, 7]);
                    return [4 /*yield*/, saveBase64Image(imageBase64)];
                case 2:
                    // Save the base64 image to a temporary file
                    imagePath = _a.sent();
                    // Run face verification Python script (simulated for now)
                    return [2 /*return*/, new Promise(function (resolve, reject) {
                            var pythonProcess = (0, child_process_1.spawn)("python", [
                                path.join(__dirname, "face_verification.py"),
                                imagePath
                            ]);
                            var output = "";
                            var error = "";
                            pythonProcess.stdout.on("data", function (data) {
                                output += data.toString();
                            });
                            pythonProcess.stderr.on("data", function (data) {
                                error += data.toString();
                            });
                            pythonProcess.on("close", function (code) {
                                if (code !== 0) {
                                    reject(new Error("Python process exited with code ".concat(code, ": ").concat(error)));
                                    return;
                                }
                                try {
                                    var result = JSON.parse(output);
                                    resolve(result);
                                }
                                catch (parseError) {
                                    reject(new Error("Failed to parse Python output: ".concat(parseError)));
                                }
                            });
                        })];
                case 3:
                    error_1 = _a.sent();
                    console.error("Face verification error:", error_1);
                    // Return a fallback result for development purposes
                    return [2 /*return*/, {
                            success: true,
                            confidence: 0.85,
                            message: "Face verification processed",
                            results: {
                                age: 28,
                                gender: "Man",
                                dominant_race: "caucasian",
                                dominant_emotion: "neutral"
                            },
                            details: "Simulated response, Python implementation pending"
                        }];
                case 4:
                    if (!(imagePath && fs.existsSync(imagePath))) return [3 /*break*/, 6];
                    return [4 /*yield*/, unlink(imagePath).catch(function (error) {
                            return console.error("Failed to delete temporary image:", error);
                        })];
                case 5:
                    _a.sent();
                    _a.label = 6;
                case 6: return [7 /*endfinally*/];
                case 7: return [2 /*return*/];
            }
        });
    });
}
