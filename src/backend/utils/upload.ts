import formidable from "formidable";
import path from "path";
import fs from "fs";
import type { NextRequest } from "next/server";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "public/uploads";
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || "5") * 1024 * 1024;

export interface UploadedFile {
  filename: string;
  url: string;
  size: number;
  mimetype: string;
}

export async function parseUpload(
  req: Request,
  subfolder: "products" | "profiles" | "temp" = "temp"
): Promise<{ fields: formidable.Fields; files: formidable.Files }> {
  const uploadPath = path.join(process.cwd(), UPLOAD_DIR, subfolder);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  const form = formidable({
    uploadDir: uploadPath,
    keepExtensions: true,
    maxFileSize: MAX_SIZE,
    filename: (_name, _ext, part) => {
      const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      return `${unique}${path.extname(part.originalFilename || "")}`;
    },
  });

  return new Promise((resolve, reject) => {
    // formidable needs a Node.js IncomingMessage, so we convert
    const nodeReq = req as unknown as Parameters<typeof form.parse>[0];
    form.parse(nodeReq, (err, fields, files) => {
      if (err) reject(err);
      else resolve({ fields, files });
    });
  });
}

export function getPublicUrl(filePath: string): string {
  const relative = filePath.replace(path.join(process.cwd(), "public"), "");
  return relative.replace(/\\/g, "/");
}