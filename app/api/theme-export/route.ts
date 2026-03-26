export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import fs from "fs";
import path from "path";
import os from "os";
import archiver from "archiver";
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabaseAdmin";

function jsonError(message: string, status = 400, extra?: Record<string, any>) {
  return NextResponse.json({ error: message, ...(extra ?? {}) }, { status });
}

function getBearerToken(req: Request) {
  const auth = req.headers.get("authorization") || "";
  const match = auth.match(/^Bearer\s+(.+)$/i);
  return match?.[1] ?? null;
}

async function copyDir(src: string, dest: string) {
  await fs.promises.mkdir(dest, { recursive: true });
  const entries = await fs.promises.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isSymbolicLink()) {
      const realPath = await fs.promises.readlink(srcPath);
      await fs.promises.symlink(realPath, destPath);
    } else {
      await fs.promises.copyFile(srcPath, destPath);
    }
  }
}

async function zipDirectory(sourceDir: string, outPath: string) {
  await fs.promises.mkdir(path.dirname(outPath), { recursive: true });

  return new Promise<void>((resolve, reject) => {
    const output = fs.createWriteStream(outPath);
    const archive = archiver("zip", { zlib: { level: 9 } });

    output.on("close", () => resolve());
    output.on("error", (err) => reject(err));
    archive.on("error", (err) => reject(err));

    archive.pipe(output);
    archive.directory(sourceDir, false);
    archive.finalize();
  });
}

export async function POST(req: Request) {
  try {
    const token = getBearerToken(req);
    if (!token) return jsonError("Non autorisé (Bearer token manquant)", 401);

    const { data: userData, error: userErr } = await supabaseAdmin.auth.getUser(token);
    const userId = userData?.user?.id ?? null;

    if (userErr || !userId) {
      return jsonError("Session invalide", 401);
    }

    let body: { savedShopId?: string };
    try {
      body = await req.json();
    } catch {
      return jsonError("Body JSON invalide", 400);
    }

    const savedShopId =
      typeof body.savedShopId === "string" ? body.savedShopId.trim() : "";

    if (!savedShopId) {
      return jsonError("savedShopId est requis", 400);
    }

    const { data: shop, error: shopErr } = await supabaseAdmin
      .from("generated_shops")
      .select("id, user_id, store_name, payload")
      .eq("id", savedShopId)
      .eq("user_id", userId)
      .single();

    if (shopErr || !shop) {
      return jsonError("Boutique introuvable", 404);
    }

    const themeFiles = shop?.payload?.themeFiles;
    if (!themeFiles?.indexJson || !themeFiles?.settingsDataJson) {
      return jsonError("themeFiles introuvable dans la boutique sauvegardée", 400);
    }

    const projectRoot = process.cwd();
    const themeBaseDir = path.join(projectRoot, "theme-base", "CopyshopIA-Theme");

    if (!fs.existsSync(themeBaseDir)) {
      return jsonError("Dossier theme-base/CopyshopIA-Theme introuvable", 500, {
        expectedPath: themeBaseDir,
      });
    }

    const tempRoot = await fs.promises.mkdtemp(
      path.join(os.tmpdir(), "copyshop-theme-")
    );
    const workingThemeDir = path.join(tempRoot, "CopyshopIA-Theme");

    await copyDir(themeBaseDir, workingThemeDir);

    const indexJsonPath = path.join(workingThemeDir, "templates", "index.json");
    const settingsDataJsonPath = path.join(
      workingThemeDir,
      "config",
      "settings_data.json"
    );

    await fs.promises.writeFile(
      indexJsonPath,
      JSON.stringify(themeFiles.indexJson, null, 2),
      "utf8"
    );

    await fs.promises.writeFile(
      settingsDataJsonPath,
      JSON.stringify(themeFiles.settingsDataJson, null, 2),
      "utf8"
    );

    const safeStoreName =
      (shop.store_name || "theme-copyshop")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-zA-Z0-9-_ ]/g, "")
        .trim()
        .replace(/\s+/g, "-")
        .toLowerCase() || "theme-copyshop";

    const zipFilename = `${safeStoreName}-${shop.id}.zip`;
    const zipPath = path.join(tempRoot, zipFilename);

    await zipDirectory(workingThemeDir, zipPath);

    const fileBuffer = await fs.promises.readFile(zipPath);

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${zipFilename}"`,
      },
    });
  } catch (e: any) {
    console.error("theme-export error:", e?.message ?? e);
    return jsonError("Erreur export thème", 500);
  }
}