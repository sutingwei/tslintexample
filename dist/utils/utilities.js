"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.singleton = singleton;
exports.base64Decode = base64Decode;
exports.base64Encode = base64Encode;
exports.calcFileMd5 = calcFileMd5;
exports.calcFileMd5WithSalt = calcFileMd5WithSalt;
exports.decompressZip = decompressZip;
exports.recreateDir = recreateDir;
exports.rmDirRecursive = rmDirRecursive;
exports.copyFileSync = copyFileSync;
exports.copyFolderRecursiveSync = copyFolderRecursiveSync;
var buffer_1 = require("buffer");
var crypto_1 = __importDefault(require("crypto"));
var fs_1 = __importDefault(require("fs"));
var compressing_1 = __importDefault(require("compressing"));
var rimraf_1 = require("rimraf");
var path_1 = __importDefault(require("path"));
function singleton(impl) {
    return (function () {
        var inst;
        return {
            getInstance: function () {
                if (!inst) {
                    inst = new impl();
                }
                return inst;
            },
        };
    })();
}
function base64Decode(str) {
    return buffer_1.Buffer.from(str, "base64").toString("ascii");
}
function base64Encode(str) {
    return buffer_1.Buffer.from(str).toString("base64");
}
function calcFileMd5(path) {
    return calcFileMd5WithSalt(path, "");
}
function calcFileMd5WithSalt(path, salt) {
    if (!fs_1.default.existsSync(path)) {
        console.log("".concat(path, " is not exist."));
        return "";
    }
    var hash = crypto_1.default.createHash("md5");
    var buffer = fs_1.default.readFileSync(path);
    hash.update(buffer);
    var md5 = hash.digest("hex").toUpperCase();
    if (salt && salt.length > 0) {
        var hashSalt = crypto_1.default.createHash("md5");
        hashSalt.update("".concat(salt).concat(md5));
        md5 = hashSalt.digest("hex").toUpperCase();
    }
    return md5;
}
function decompressZip(srcPath, destPath, callback) {
    if (!fs_1.default.existsSync(srcPath)) {
        var err = "".concat(srcPath, " is not exist.");
        console.log(err);
        callback(err);
    }
    if (!fs_1.default.existsSync(destPath)) {
        var err = "".concat(destPath, " is not exist.");
        console.log(err);
        callback(err);
    }
    compressing_1.default.zip
        .decompress(srcPath, destPath)
        .then(function () { return callback(""); })
        .catch(function (err) { return callback(err); });
}
function recreateDir(dir) {
    if (fs_1.default.existsSync(dir)) {
        rmDirRecursive(dir);
    }
    fs_1.default.mkdirSync(dir);
}
function rmDirRecursive(dir) {
    rimraf_1.rimraf.sync(dir);
}
function copyFileSync(src, dst) {
    fs_1.default.writeFileSync(dst, fs_1.default.readFileSync(src));
}
function copyFolderRecursiveSync(src, dst) {
    var targetFolder = path_1.default.join(dst, path_1.default.basename(src));
    if (fs_1.default.existsSync(targetFolder)) {
        if (fs_1.default.lstatSync(targetFolder).isDirectory()) {
            rmDirRecursive(targetFolder);
        }
        else if (fs_1.default.lstatSync(targetFolder).isFile()) {
            fs_1.default.rmSync(targetFolder);
        }
    }
    recreateDir(targetFolder);
    if (fs_1.default.lstatSync(src).isDirectory()) {
        var files = fs_1.default.readdirSync(src);
        files.forEach(function (file) {
            var curSource = path_1.default.join(src, file);
            var targetSource = path_1.default.join(targetFolder, file);
            if (fs_1.default.lstatSync(curSource).isDirectory()) {
                copyFolderRecursiveSync(curSource, targetFolder);
            }
            else if (fs_1.default.lstatSync(curSource).isSymbolicLink()) {
                // do nothing
            }
            else {
                copyFileSync(curSource, targetSource);
            }
        });
    }
}
