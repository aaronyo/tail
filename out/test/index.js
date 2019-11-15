"use strict";
/* global suite, test */
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
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
Object.defineProperty(exports, "__esModule", { value: true });
require("mocha");
var fs = require("fs");
var src_1 = require("../src");
var chai_1 = require("chai");
var appendFile = __dirname + '/../../test/tmp/append-file.txt';
suite('tail', function () {
    test('basic test', function () { return __awaiter(void 0, void 0, void 0, function () {
        var output;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    output = [];
                    return [4 /*yield*/, src_1.tail(function (lines) { var lines_1, lines_1_1; return __awaiter(void 0, void 0, void 0, function () {
                            var line, e_1_1;
                            var e_1, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 5, 6, 11]);
                                        lines_1 = __asyncValues(lines);
                                        _b.label = 1;
                                    case 1: return [4 /*yield*/, lines_1.next()];
                                    case 2:
                                        if (!(lines_1_1 = _b.sent(), !lines_1_1.done)) return [3 /*break*/, 4];
                                        line = lines_1_1.value;
                                        output.push(line);
                                        if (line === '4')
                                            return [3 /*break*/, 4];
                                        _b.label = 3;
                                    case 3: return [3 /*break*/, 1];
                                    case 4: return [3 /*break*/, 11];
                                    case 5:
                                        e_1_1 = _b.sent();
                                        e_1 = { error: e_1_1 };
                                        return [3 /*break*/, 11];
                                    case 6:
                                        _b.trys.push([6, , 9, 10]);
                                        if (!(lines_1_1 && !lines_1_1.done && (_a = lines_1.return))) return [3 /*break*/, 8];
                                        return [4 /*yield*/, _a.call(lines_1)];
                                    case 7:
                                        _b.sent();
                                        _b.label = 8;
                                    case 8: return [3 /*break*/, 10];
                                    case 9:
                                        if (e_1) throw e_1.error;
                                        return [7 /*endfinally*/];
                                    case 10: return [7 /*endfinally*/];
                                    case 11: return [2 /*return*/];
                                }
                            });
                        }); }, { args: ['-n4'] })(__dirname + '/../../test/test-file.txt')];
                case 1:
                    _a.sent();
                    chai_1.assert.deepEqual(output, ['1', '2', '3', '4']);
                    return [2 /*return*/];
            }
        });
    }); });
    test('non existent file', function () { return __awaiter(void 0, void 0, void 0, function () {
        var errObj, err_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    errObj = {};
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, src_1.tail(function (lines) { var lines_2, lines_2_1; return __awaiter(void 0, void 0, void 0, function () {
                            var line, e_2_1;
                            var e_2, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 5, 6, 11]);
                                        lines_2 = __asyncValues(lines);
                                        _b.label = 1;
                                    case 1: return [4 /*yield*/, lines_2.next()];
                                    case 2:
                                        if (!(lines_2_1 = _b.sent(), !lines_2_1.done)) return [3 /*break*/, 4];
                                        line = lines_2_1.value;
                                        chai_1.assert.fail(line);
                                        _b.label = 3;
                                    case 3: return [3 /*break*/, 1];
                                    case 4: return [3 /*break*/, 11];
                                    case 5:
                                        e_2_1 = _b.sent();
                                        e_2 = { error: e_2_1 };
                                        return [3 /*break*/, 11];
                                    case 6:
                                        _b.trys.push([6, , 9, 10]);
                                        if (!(lines_2_1 && !lines_2_1.done && (_a = lines_2.return))) return [3 /*break*/, 8];
                                        return [4 /*yield*/, _a.call(lines_2)];
                                    case 7:
                                        _b.sent();
                                        _b.label = 8;
                                    case 8: return [3 /*break*/, 10];
                                    case 9:
                                        if (e_2) throw e_2.error;
                                        return [7 /*endfinally*/];
                                    case 10: return [7 /*endfinally*/];
                                    case 11: return [2 /*return*/];
                                }
                            });
                        }); }, { args: ['-n4'] })('bad_filename')];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_1 = _a.sent();
                    errObj = JSON.parse(err_1.message);
                    return [3 /*break*/, 4];
                case 4:
                    chai_1.assert.equal(errObj.code, 1);
                    return [2 /*return*/];
            }
        });
    }); });
    test('nothing missed -- bufferrs until iteration begins', function () { return __awaiter(void 0, void 0, void 0, function () {
        var input, output;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    input = ['a', 'b', 'c'];
                    output = [];
                    fs.closeSync(fs.openSync(appendFile, 'w'));
                    return [4 /*yield*/, src_1.tail(function (lines) { var lines_3, lines_3_1; return __awaiter(void 0, void 0, void 0, function () {
                            var line, e_3_1;
                            var e_3, _a;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        // add to the file before we start iterating
                                        fs.appendFileSync(appendFile, input.join('\n') + '\n');
                                        // delay a bit
                                        return [4 /*yield*/, new Promise(function (r) { return setTimeout(r, 10); })];
                                    case 1:
                                        // delay a bit
                                        _b.sent();
                                        _b.label = 2;
                                    case 2:
                                        _b.trys.push([2, 7, 8, 13]);
                                        lines_3 = __asyncValues(lines);
                                        _b.label = 3;
                                    case 3: return [4 /*yield*/, lines_3.next()];
                                    case 4:
                                        if (!(lines_3_1 = _b.sent(), !lines_3_1.done)) return [3 /*break*/, 6];
                                        line = lines_3_1.value;
                                        output.push(line);
                                        if (line === 'c')
                                            return [3 /*break*/, 6];
                                        _b.label = 5;
                                    case 5: return [3 /*break*/, 3];
                                    case 6: return [3 /*break*/, 13];
                                    case 7:
                                        e_3_1 = _b.sent();
                                        e_3 = { error: e_3_1 };
                                        return [3 /*break*/, 13];
                                    case 8:
                                        _b.trys.push([8, , 11, 12]);
                                        if (!(lines_3_1 && !lines_3_1.done && (_a = lines_3.return))) return [3 /*break*/, 10];
                                        return [4 /*yield*/, _a.call(lines_3)];
                                    case 9:
                                        _b.sent();
                                        _b.label = 10;
                                    case 10: return [3 /*break*/, 12];
                                    case 11:
                                        if (e_3) throw e_3.error;
                                        return [7 /*endfinally*/];
                                    case 12: return [7 /*endfinally*/];
                                    case 13: return [2 /*return*/];
                                }
                            });
                        }); })(appendFile)];
                case 1:
                    _a.sent();
                    chai_1.assert.deepEqual(output, input);
                    return [2 /*return*/];
            }
        });
    }); });
});
