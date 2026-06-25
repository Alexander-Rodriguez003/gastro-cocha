import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "lib", "database.json");

export function loadJSONData(): any {
  try {
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      return JSON.parse(raw);
    }
  } catch (e) {
    console.error("Error loading JSON data, using seeds:", e);
  }
  return null;
}

export function saveJSONData(data: {
  users?: any[];
  platos?: any[];
  lugares?: any[];
  platoLugarPivots?: any[];
  resenas?: any[];
  solicitudes?: any[];
}) {
  try {
    let current = {};
    if (fs.existsSync(DB_PATH)) {
      const raw = fs.readFileSync(DB_PATH, "utf-8");
      current = JSON.parse(raw);
    }

    const updated = {
      ...current,
      ...data,
    };

    fs.writeFileSync(DB_PATH, JSON.stringify(updated, null, 2), "utf-8");
  } catch (e) {
    console.error("Error saving JSON data:", e);
  }
}
