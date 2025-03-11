"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoutes = registerRoutes;
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var storage_1 = require("./storage");
var deepface_1 = require("./deepface");
var schema_1 = require("@shared/schema");
var zod_1 = require("zod");
function registerRoutes(app) {
    return __awaiter(this, void 0, void 0, function () {
        var _this = this;
        return __generator(this, function (_a) {
            // User Registration
            app.post("/api/auth/register", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var validatedData, existingUser, hashedPassword, user, password, userWithoutPassword, error_1;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 5, , 6]);
                            validatedData = schema_1.insertUserSchema.parse(req.body);
                            return [4 /*yield*/, storage_1.storage.getUserByUsername(validatedData.username)];
                        case 1:
                            existingUser = _a.sent();
                            if (existingUser) {
                                return [2 /*return*/, res.status(409).json({
                                        error: "Username already exists"
                                    })];
                            }
                            return [4 /*yield*/, bcryptjs_1.default.hash(validatedData.password, 10)];
                        case 2:
                            hashedPassword = _a.sent();
                            return [4 /*yield*/, storage_1.storage.createUser(__assign(__assign({}, validatedData), { password: hashedPassword }))];
                        case 3:
                            user = _a.sent();
                            // Create activity record
                            return [4 /*yield*/, storage_1.storage.createActivity({
                                    userId: user.id,
                                    type: "register",
                                    description: "Registered a new account"
                                })];
                        case 4:
                            // Create activity record
                            _a.sent();
                            // Set session
                            req.session.userId = user.id;
                            password = user.password, userWithoutPassword = __rest(user, ["password"]);
                            return [2 /*return*/, res.status(201).json({ user: userWithoutPassword })];
                        case 5:
                            error_1 = _a.sent();
                            if (error_1 instanceof zod_1.z.ZodError) {
                                return [2 /*return*/, res.status(400).json({ error: error_1.errors })];
                            }
                            console.error('Registration error:', error_1);
                            return [2 /*return*/, res.status(500).json({ error: "Registration failed" })];
                        case 6: return [2 /*return*/];
                    }
                });
            }); });
            // User Login
            app.post("/api/auth/login", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var _a, username, password, user, isPasswordValid, _, userWithoutPassword, error_2;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            _b.trys.push([0, 4, , 5]);
                            _a = req.body, username = _a.username, password = _a.password;
                            if (!username || !password) {
                                return [2 /*return*/, res.status(400).json({ error: "Username and password are required" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUserByUsername(username)];
                        case 1:
                            user = _b.sent();
                            if (!user) {
                                return [2 /*return*/, res.status(401).json({ error: "Invalid credentials" })];
                            }
                            return [4 /*yield*/, bcryptjs_1.default.compare(password, user.password)];
                        case 2:
                            isPasswordValid = _b.sent();
                            if (!isPasswordValid) {
                                return [2 /*return*/, res.status(401).json({ error: "Invalid credentials" })];
                            }
                            // Create activity record
                            return [4 /*yield*/, storage_1.storage.createActivity({
                                    userId: user.id,
                                    type: "login",
                                    description: "Logged in to account"
                                })];
                        case 3:
                            // Create activity record
                            _b.sent();
                            // Set session
                            req.session.userId = user.id;
                            _ = user.password, userWithoutPassword = __rest(user, ["password"]);
                            return [2 /*return*/, res.json({ user: userWithoutPassword })];
                        case 4:
                            error_2 = _b.sent();
                            console.error('Login error:', error_2);
                            return [2 /*return*/, res.status(500).json({ error: "Login failed" })];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // User Logout
            app.post("/api/auth/logout", function (req, res) {
                try {
                    // Record activity if user is logged in
                    if (req.session && req.session.userId) {
                        storage_1.storage.createActivity({
                            userId: req.session.userId,
                            type: "logout",
                            description: "Logged out of account"
                        }).catch(function (err) { return console.error('Error recording logout activity:', err); });
                    }
                    // Destroy session
                    req.session.destroy(function (err) {
                        if (err) {
                            console.error('Session destruction error:', err);
                            return res.status(500).json({ error: "Logout failed" });
                        }
                        res.clearCookie('connect.sid');
                        return res.json({ message: "Logged out successfully" });
                    });
                }
                catch (error) {
                    console.error('Logout error:', error);
                    return res.status(500).json({ error: "Logout failed" });
                }
            });
            // Get Current User
            app.get("/api/auth/me", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var user, password, userWithoutPassword, error_3;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            // Check if user is logged in
                            if (!req.session || !req.session.userId) {
                                return [2 /*return*/, res.status(401).json({ error: "Not authenticated" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getUser(req.session.userId)];
                        case 1:
                            user = _a.sent();
                            if (!user) {
                                req.session.destroy(function () { });
                                return [2 /*return*/, res.status(401).json({ error: "User not found" })];
                            }
                            password = user.password, userWithoutPassword = __rest(user, ["password"]);
                            return [2 /*return*/, res.json({ user: userWithoutPassword })];
                        case 2:
                            error_3 = _a.sent();
                            console.error('Get current user error:', error_3);
                            return [2 /*return*/, res.status(500).json({ error: "Failed to get user data" })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Face Verification
            app.post("/api/verification/face", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var imageBase64, verificationResult, user, error_4;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 6, , 7]);
                            // Check if user is logged in
                            if (!req.session || !req.session.userId) {
                                return [2 /*return*/, res.status(401).json({ error: "Not authenticated" })];
                            }
                            imageBase64 = req.body.imageBase64;
                            if (!imageBase64) {
                                return [2 /*return*/, res.status(400).json({ error: "Image data is required" })];
                            }
                            return [4 /*yield*/, (0, deepface_1.verifyFace)(imageBase64)];
                        case 1:
                            verificationResult = _a.sent();
                            if (!(verificationResult.success && verificationResult.confidence > 0.7)) return [3 /*break*/, 5];
                            return [4 /*yield*/, storage_1.storage.getUser(req.session.userId)];
                        case 2:
                            user = _a.sent();
                            if (!user) return [3 /*break*/, 5];
                            return [4 /*yield*/, storage_1.storage.updateUser(user.id, { isVerified: true })];
                        case 3:
                            _a.sent();
                            // Record activity
                            return [4 /*yield*/, storage_1.storage.createActivity({
                                    userId: user.id,
                                    type: "verification",
                                    description: "Completed face verification"
                                })];
                        case 4:
                            // Record activity
                            _a.sent();
                            _a.label = 5;
                        case 5: return [2 /*return*/, res.json(verificationResult)];
                        case 6:
                            error_4 = _a.sent();
                            console.error('Face verification error:', error_4);
                            return [2 /*return*/, res.status(500).json({
                                    error: "Face verification failed",
                                    details: error_4 instanceof Error ? error_4.message : String(error_4)
                                })];
                        case 7: return [2 /*return*/];
                    }
                });
            }); });
            // Get Identity Capsules
            app.get("/api/capsules", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var capsules, error_5;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            // Check if user is logged in
                            if (!req.session || !req.session.userId) {
                                return [2 /*return*/, res.status(401).json({ error: "Not authenticated" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getCapsulesByUserId(req.session.userId)];
                        case 1:
                            capsules = _a.sent();
                            return [2 /*return*/, res.json({ capsules: capsules })];
                        case 2:
                            error_5 = _a.sent();
                            console.error('Get capsules error:', error_5);
                            return [2 /*return*/, res.status(500).json({ error: "Failed to get capsules" })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Create Identity Capsule
            app.post("/api/capsules", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var validatedData, capsule, error_6;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            // Check if user is logged in
                            if (!req.session || !req.session.userId) {
                                return [2 /*return*/, res.status(401).json({ error: "Not authenticated" })];
                            }
                            validatedData = schema_1.insertIdentityCapsuleSchema.parse(__assign(__assign({}, req.body), { userId: req.session.userId }));
                            return [4 /*yield*/, storage_1.storage.createCapsule(validatedData)];
                        case 1:
                            capsule = _a.sent();
                            // Record activity
                            return [4 /*yield*/, storage_1.storage.createActivity({
                                    userId: req.session.userId,
                                    type: "capsule_create",
                                    description: "Created identity capsule: ".concat(capsule.name)
                                })];
                        case 2:
                            // Record activity
                            _a.sent();
                            return [2 /*return*/, res.status(201).json({ capsule: capsule })];
                        case 3:
                            error_6 = _a.sent();
                            if (error_6 instanceof zod_1.z.ZodError) {
                                return [2 /*return*/, res.status(400).json({ error: error_6.errors })];
                            }
                            console.error('Create capsule error:', error_6);
                            return [2 /*return*/, res.status(500).json({ error: "Failed to create identity capsule" })];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Get Verified Data for a Capsule
            app.get("/api/capsules/:id/data", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var capsuleId, capsule, verifiedData, error_7;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            // Check if user is logged in
                            if (!req.session || !req.session.userId) {
                                return [2 /*return*/, res.status(401).json({ error: "Not authenticated" })];
                            }
                            capsuleId = parseInt(req.params.id);
                            if (isNaN(capsuleId)) {
                                return [2 /*return*/, res.status(400).json({ error: "Invalid capsule ID" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getCapsule(capsuleId)];
                        case 1:
                            capsule = _a.sent();
                            if (!capsule) {
                                return [2 /*return*/, res.status(404).json({ error: "Capsule not found" })];
                            }
                            if (capsule.userId !== req.session.userId) {
                                return [2 /*return*/, res.status(403).json({ error: "You don't have permission to access this capsule" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getVerifiedDataByCapsuleId(capsuleId)];
                        case 2:
                            verifiedData = _a.sent();
                            return [2 /*return*/, res.json({ data: verifiedData })];
                        case 3:
                            error_7 = _a.sent();
                            console.error('Get verified data error:', error_7);
                            return [2 /*return*/, res.status(500).json({ error: "Failed to get verified data" })];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Add Verified Data to a Capsule
            app.post("/api/capsules/:id/data", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var capsuleId, capsule, validatedData, data, error_8;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            // Check if user is logged in
                            if (!req.session || !req.session.userId) {
                                return [2 /*return*/, res.status(401).json({ error: "Not authenticated" })];
                            }
                            capsuleId = parseInt(req.params.id);
                            if (isNaN(capsuleId)) {
                                return [2 /*return*/, res.status(400).json({ error: "Invalid capsule ID" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getCapsule(capsuleId)];
                        case 1:
                            capsule = _a.sent();
                            if (!capsule) {
                                return [2 /*return*/, res.status(404).json({ error: "Capsule not found" })];
                            }
                            if (capsule.userId !== req.session.userId) {
                                return [2 /*return*/, res.status(403).json({ error: "You don't have permission to modify this capsule" })];
                            }
                            validatedData = schema_1.insertVerifiedDataSchema.parse(__assign(__assign({}, req.body), { capsuleId: capsuleId }));
                            return [4 /*yield*/, storage_1.storage.createVerifiedData(__assign(__assign({}, validatedData), { verifiedAt: new Date().toISOString() }))];
                        case 2:
                            data = _a.sent();
                            // Record activity
                            return [4 /*yield*/, storage_1.storage.createActivity({
                                    userId: req.session.userId,
                                    type: "data_add",
                                    description: "Added verified data to capsule: ".concat(validatedData.dataType)
                                })];
                        case 3:
                            // Record activity
                            _a.sent();
                            return [2 /*return*/, res.status(201).json({ data: data })];
                        case 4:
                            error_8 = _a.sent();
                            if (error_8 instanceof zod_1.z.ZodError) {
                                return [2 /*return*/, res.status(400).json({ error: error_8.errors })];
                            }
                            console.error('Add verified data error:', error_8);
                            return [2 /*return*/, res.status(500).json({ error: "Failed to add verified data" })];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Get AI Connections
            app.get("/api/connections", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var connections, error_9;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            // Check if user is logged in
                            if (!req.session || !req.session.userId) {
                                return [2 /*return*/, res.status(401).json({ error: "Not authenticated" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getAiConnectionsByUserId(req.session.userId)];
                        case 1:
                            connections = _a.sent();
                            return [2 /*return*/, res.json({ connections: connections })];
                        case 2:
                            error_9 = _a.sent();
                            console.error('Get connections error:', error_9);
                            return [2 /*return*/, res.status(500).json({ error: "Failed to get AI connections" })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            // Create AI Connection
            app.post("/api/connections", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var validatedData, connection, error_10;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 3, , 4]);
                            // Check if user is logged in
                            if (!req.session || !req.session.userId) {
                                return [2 /*return*/, res.status(401).json({ error: "Not authenticated" })];
                            }
                            validatedData = schema_1.insertAiConnectionSchema.parse(__assign(__assign({}, req.body), { userId: req.session.userId }));
                            return [4 /*yield*/, storage_1.storage.createAiConnection(__assign(__assign({}, validatedData), { createdAt: new Date().toISOString(), lastUsed: null }))];
                        case 1:
                            connection = _a.sent();
                            // Record activity
                            return [4 /*yield*/, storage_1.storage.createActivity({
                                    userId: req.session.userId,
                                    type: "connection_create",
                                    description: "Connected to AI service: ".concat(connection.aiServiceName)
                                })];
                        case 2:
                            // Record activity
                            _a.sent();
                            return [2 /*return*/, res.status(201).json({ connection: connection })];
                        case 3:
                            error_10 = _a.sent();
                            if (error_10 instanceof zod_1.z.ZodError) {
                                return [2 /*return*/, res.status(400).json({ error: error_10.errors })];
                            }
                            console.error('Create connection error:', error_10);
                            return [2 /*return*/, res.status(500).json({ error: "Failed to create AI connection" })];
                        case 4: return [2 /*return*/];
                    }
                });
            }); });
            // Revoke AI Connection
            app.patch("/api/connections/:id/revoke", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var connectionId, connection, updatedConnection, error_11;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 4, , 5]);
                            // Check if user is logged in
                            if (!req.session || !req.session.userId) {
                                return [2 /*return*/, res.status(401).json({ error: "Not authenticated" })];
                            }
                            connectionId = parseInt(req.params.id);
                            if (isNaN(connectionId)) {
                                return [2 /*return*/, res.status(400).json({ error: "Invalid connection ID" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getAiConnection(connectionId)];
                        case 1:
                            connection = _a.sent();
                            if (!connection) {
                                return [2 /*return*/, res.status(404).json({ error: "Connection not found" })];
                            }
                            if (connection.userId !== req.session.userId) {
                                return [2 /*return*/, res.status(403).json({ error: "You don't have permission to modify this connection" })];
                            }
                            return [4 /*yield*/, storage_1.storage.updateAiConnection(connectionId, {
                                    isActive: false
                                })];
                        case 2:
                            updatedConnection = _a.sent();
                            // Record activity
                            return [4 /*yield*/, storage_1.storage.createActivity({
                                    userId: req.session.userId,
                                    type: "connection_revoke",
                                    description: "Revoked connection to AI service: ".concat(connection.aiServiceName)
                                })];
                        case 3:
                            // Record activity
                            _a.sent();
                            return [2 /*return*/, res.json({ connection: updatedConnection })];
                        case 4:
                            error_11 = _a.sent();
                            console.error('Revoke connection error:', error_11);
                            return [2 /*return*/, res.status(500).json({ error: "Failed to revoke AI connection" })];
                        case 5: return [2 /*return*/];
                    }
                });
            }); });
            // Get Activity Log
            app.get("/api/activities", function (req, res) { return __awaiter(_this, void 0, void 0, function () {
                var activities, error_12;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            _a.trys.push([0, 2, , 3]);
                            // Check if user is logged in
                            if (!req.session || !req.session.userId) {
                                return [2 /*return*/, res.status(401).json({ error: "Not authenticated" })];
                            }
                            return [4 /*yield*/, storage_1.storage.getActivitiesByUserId(req.session.userId)];
                        case 1:
                            activities = _a.sent();
                            return [2 /*return*/, res.json({ activities: activities })];
                        case 2:
                            error_12 = _a.sent();
                            console.error('Get activities error:', error_12);
                            return [2 /*return*/, res.status(500).json({ error: "Failed to get activity log" })];
                        case 3: return [2 /*return*/];
                    }
                });
            }); });
            return [2 /*return*/, app];
        });
    });
}
