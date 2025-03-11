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
Object.defineProperty(exports, "__esModule", { value: true });
exports.storage = exports.MemStorage = void 0;
var MemStorage = /** @class */ (function () {
    function MemStorage() {
        this.users = new Map();
        this.identityCapsules = new Map();
        this.verifiedData = new Map();
        this.aiConnections = new Map();
        this.activities = new Map();
        this.userIdCounter = 1;
        this.capsuleIdCounter = 1;
        this.dataIdCounter = 1;
        this.connectionIdCounter = 1;
        this.activityIdCounter = 1;
    }
    MemStorage.prototype.getUser = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.users.get(id)];
            });
        });
    };
    MemStorage.prototype.getUserByUsername = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, user;
            return __generator(this, function (_b) {
                for (_i = 0, _a = this.users.values(); _i < _a.length; _i++) {
                    user = _a[_i];
                    if (user.username.toLowerCase() === username.toLowerCase()) {
                        return [2 /*return*/, user];
                    }
                }
                return [2 /*return*/, undefined];
            });
        });
    };
    MemStorage.prototype.createUser = function (insertUser) {
        return __awaiter(this, void 0, void 0, function () {
            var user;
            return __generator(this, function (_a) {
                user = __assign(__assign({}, insertUser), { id: this.userIdCounter++, isVerified: false, memberSince: new Date().toISOString(), avatar: null });
                this.users.set(user.id, user);
                return [2 /*return*/, user];
            });
        });
    };
    MemStorage.prototype.updateUser = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var user, updatedUser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getUser(id)];
                    case 1:
                        user = _a.sent();
                        if (!user)
                            return [2 /*return*/, undefined];
                        updatedUser = __assign(__assign({}, user), updates);
                        this.users.set(id, updatedUser);
                        return [2 /*return*/, updatedUser];
                }
            });
        });
    };
    MemStorage.prototype.getCapsule = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.identityCapsules.get(id)];
            });
        });
    };
    MemStorage.prototype.getCapsulesByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var capsules, _i, _a, capsule;
            return __generator(this, function (_b) {
                capsules = [];
                for (_i = 0, _a = this.identityCapsules.values(); _i < _a.length; _i++) {
                    capsule = _a[_i];
                    if (capsule.userId === userId) {
                        capsules.push(capsule);
                    }
                }
                return [2 /*return*/, capsules];
            });
        });
    };
    MemStorage.prototype.createCapsule = function (insertCapsule) {
        return __awaiter(this, void 0, void 0, function () {
            var capsule;
            return __generator(this, function (_a) {
                capsule = __assign(__assign({}, insertCapsule), { id: this.capsuleIdCounter++, createdAt: new Date().toISOString() });
                this.identityCapsules.set(capsule.id, capsule);
                return [2 /*return*/, capsule];
            });
        });
    };
    MemStorage.prototype.updateCapsule = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var capsule, updatedCapsule;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getCapsule(id)];
                    case 1:
                        capsule = _a.sent();
                        if (!capsule)
                            return [2 /*return*/, undefined];
                        updatedCapsule = __assign(__assign({}, capsule), updates);
                        this.identityCapsules.set(id, updatedCapsule);
                        return [2 /*return*/, updatedCapsule];
                }
            });
        });
    };
    MemStorage.prototype.getVerifiedData = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.verifiedData.get(id)];
            });
        });
    };
    MemStorage.prototype.getVerifiedDataByCapsuleId = function (capsuleId) {
        return __awaiter(this, void 0, void 0, function () {
            var data, _i, _a, item;
            return __generator(this, function (_b) {
                data = [];
                for (_i = 0, _a = this.verifiedData.values(); _i < _a.length; _i++) {
                    item = _a[_i];
                    if (item.capsuleId === capsuleId) {
                        data.push(item);
                    }
                }
                return [2 /*return*/, data];
            });
        });
    };
    MemStorage.prototype.createVerifiedData = function (insertData) {
        return __awaiter(this, void 0, void 0, function () {
            var data;
            return __generator(this, function (_a) {
                data = __assign(__assign({}, insertData), { id: this.dataIdCounter++ });
                this.verifiedData.set(data.id, data);
                return [2 /*return*/, data];
            });
        });
    };
    MemStorage.prototype.getAiConnection = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.aiConnections.get(id)];
            });
        });
    };
    MemStorage.prototype.getAiConnectionsByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var connections, _i, _a, connection;
            return __generator(this, function (_b) {
                connections = [];
                for (_i = 0, _a = this.aiConnections.values(); _i < _a.length; _i++) {
                    connection = _a[_i];
                    if (connection.userId === userId) {
                        connections.push(connection);
                    }
                }
                return [2 /*return*/, connections];
            });
        });
    };
    MemStorage.prototype.createAiConnection = function (insertConnection) {
        return __awaiter(this, void 0, void 0, function () {
            var connection;
            return __generator(this, function (_a) {
                connection = __assign(__assign({}, insertConnection), { id: this.connectionIdCounter++ });
                this.aiConnections.set(connection.id, connection);
                return [2 /*return*/, connection];
            });
        });
    };
    MemStorage.prototype.updateAiConnection = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var connection, updatedConnection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getAiConnection(id)];
                    case 1:
                        connection = _a.sent();
                        if (!connection)
                            return [2 /*return*/, undefined];
                        updatedConnection = __assign(__assign({}, connection), updates);
                        this.aiConnections.set(id, updatedConnection);
                        return [2 /*return*/, updatedConnection];
                }
            });
        });
    };
    MemStorage.prototype.getActivity = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.activities.get(id)];
            });
        });
    };
    MemStorage.prototype.getActivitiesByUserId = function (userId) {
        return __awaiter(this, void 0, void 0, function () {
            var activities, _i, _a, activity;
            return __generator(this, function (_b) {
                activities = [];
                for (_i = 0, _a = this.activities.values(); _i < _a.length; _i++) {
                    activity = _a[_i];
                    if (activity.userId === userId) {
                        activities.push(activity);
                    }
                }
                return [2 /*return*/, activities];
            });
        });
    };
    MemStorage.prototype.createActivity = function (insertActivity) {
        return __awaiter(this, void 0, void 0, function () {
            var activity;
            return __generator(this, function (_a) {
                activity = __assign(__assign({}, insertActivity), { id: this.activityIdCounter++, createdAt: new Date().toISOString() });
                this.activities.set(activity.id, activity);
                return [2 /*return*/, activity];
            });
        });
    };
    return MemStorage;
}());
exports.MemStorage = MemStorage;
exports.storage = new MemStorage();
