import { Buffer } from "buffer";
import crypto from "crypto";
import fs from "fs";
import compressing from "compressing";
import { rimraf } from "rimraf";
import path from "path";

export function singleton<T>(impl: new () => T) {
  return (function () {
    let inst: T;
    return {
      getInstance: function (): T {
        if (!inst) {
          inst = new impl();
        }
        return inst;
      },
    };
  })();
}

export function base64Decode(str: string): string {
  return Buffer.from(str, "base64").toString("ascii");
}

export function base64Encode(str: string): string {
  return Buffer.from(str).toString("base64");
}

export function calcFileMd5(path: string): string {
  return calcFileMd5WithSalt(path, "");
}

export function calcFileMd5WithSalt(path: string, salt: string): string {
  if (!fs.existsSync(path)) {
    console.log(`${path} is not exist.`);
    return "";
  }

  const hash = crypto.createHash("md5");
  const buffer = fs.readFileSync(path);
  hash.update(buffer);
  let md5 = hash.digest("hex").toUpperCase();

  if (salt && salt.length > 0) {
    const hashSalt = crypto.createHash("md5");
    hashSalt.update(`${salt}${md5}`);
    md5 = hashSalt.digest("hex").toUpperCase();
  }
  return md5;
}

export function decompressZip(
  srcPath: string,
  destPath: string,
  callback: (_: string) => void,
): void {
  if (!fs.existsSync(srcPath)) {
    const err = `${srcPath} is not exist.`;
    console.log(err);
    callback(err);
  }

  if (!fs.existsSync(destPath)) {
    const err = `${destPath} is not exist.`;
    console.log(err);
    callback(err);
  }

  compressing.zip
    .decompress(srcPath, destPath)
    .then(() => callback(""))
    .catch((err) => callback(err));
}

export function recreateDir(dir: string): void {
  if (fs.existsSync(dir)) {
    rmDirRecursive(dir);
  }
  fs.mkdirSync(dir);
}

export function rmDirRecursive(dir: string): void {
  rimraf.sync(dir);
}

export function copyFileSync(src: string, dst: string): void {
  fs.writeFileSync(dst, fs.readFileSync(src));
}

export function copyFolderRecursiveSync(src: string, dst: string): void {
  const targetFolder = path.join(dst, path.basename(src));
  if (fs.existsSync(targetFolder)) {
    if (fs.lstatSync(targetFolder).isDirectory()) {
      rmDirRecursive(targetFolder);
    } else if (fs.lstatSync(targetFolder).isFile()) {
      fs.rmSync(targetFolder);
    }
  }
  recreateDir(targetFolder);

  if (fs.lstatSync(src).isDirectory()) {
    const files = fs.readdirSync(src);
    files.forEach((file) => {
      const curSource = path.join(src, file);
      const targetSource = path.join(targetFolder, file);
      if (fs.lstatSync(curSource).isDirectory()) {
        copyFolderRecursiveSync(curSource, targetFolder);
      } else if (fs.lstatSync(curSource).isSymbolicLink()) {
        // do nothing
      } else {
        copyFileSync(curSource, targetSource);
      }
    });
  }
}
