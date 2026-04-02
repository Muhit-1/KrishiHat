import path from "path";
import fs from "fs";

const UPLOAD_DIR = process.env.UPLOAD_DIR || "public/uploads";
const MAX_SIZE = parseInt(process.env.MAX_FILE_SIZE_MB || "5") * 1024 * 1024;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export interface ParsedFile {
  filepath: string;
  originalFilename: string;
  mimetype: string;
  size: number;
}

export interface ParseUploadResult {
  files: {
    [fieldName: string]: ParsedFile | ParsedFile[];
  };
}

/**
 * Parse a multipart/form-data request using the Web API (req.formData()).
 * Works correctly in Next.js App Router — no formidable / Node IncomingMessage needed.
 *
 * @param req      - The incoming NextRequest / Request
 * @param subfolder - Where under public/uploads to save the files
 * @param fieldName - The form field name to extract files from (default: "image")
 */
export async function parseUpload(
  req: Request,
  subfolder: "products" | "profiles" | "temp" = "temp",
  fieldName = "image"
): Promise<ParseUploadResult> {
  const uploadPath = path.join(process.cwd(), UPLOAD_DIR, subfolder);

  if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
  }

  let formData: FormData;
  try {
    formData = await req.formData();
  } catch (err) {
    throw new Error("Failed to parse multipart form data: " + String(err));
  }

  const rawEntries = formData.getAll(fieldName);

  if (!rawEntries.length) {
    return { files: {} };
  }

  const parsed: ParsedFile[] = [];

  for (const entry of rawEntries) {
    if (!(entry instanceof File)) continue;

    if (entry.size > MAX_SIZE) {
      throw new Error(`File "${entry.name}" exceeds the ${MAX_SIZE / 1024 / 1024}MB size limit`);
    }

    if (!ALLOWED_TYPES.includes(entry.type)) {
      throw new Error(`File type "${entry.type}" is not allowed. Accepted: jpg, png, webp, gif`);
    }

    const ext = path.extname(entry.name) || ".jpg";
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const filename = `${unique}${ext}`;
    const filepath = path.join(uploadPath, filename);

    const buffer = Buffer.from(await entry.arrayBuffer());
    fs.writeFileSync(filepath, buffer);

    parsed.push({
      filepath,
      originalFilename: entry.name,
      mimetype: entry.type,
      size: entry.size,
    });
  }

  // Return single file or array, matching the old formidable shape the route expects
  return {
    files: {
      [fieldName]: parsed.length === 1 ? parsed[0] : parsed,
    },
  };
}

/**
 * Convert an absolute filepath inside public/ to a public URL path.
 * e.g. /abs/path/public/uploads/products/foo.jpg  →  /uploads/products/foo.jpg
 */
export function getPublicUrl(filePath: string): string {
  const relative = filePath.replace(path.join(process.cwd(), "public"), "");
  return relative.replace(/\\/g, "/");
}