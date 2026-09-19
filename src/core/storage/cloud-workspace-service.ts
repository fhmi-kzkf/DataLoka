import {
  collection,
  doc,
  setDoc,
  getDocs,
  getDoc,
  deleteDoc,
  query,
  where,
  orderBy,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { firestore, storage, isFirebaseConfigured } from "@/lib/firebase";
import { Logger } from "@/lib/logger";
import type { DashboardState, TemplateId } from "@/types/template";

export interface SavedCloudDashboard {
  id: string;
  userId: string;
  title: string;
  subtitle: string;
  templateId: TemplateId;
  datasetName: string;
  rowCount: number;
  columnCount: number;
  dashboardState: DashboardState;
  datasetHeaders?: string[];
  createdAt: string;
  updatedAt: string;
}

const LOCAL_WORKSPACE_STORAGE_KEY = "dataloka_cloud_workspaces";

export class CloudWorkspaceService {
  /**
   * Save Dashboard to Cloud (Firestore or LocalStorage fallback)
   */
  static async saveDashboard(
    userId: string,
    dashboard: DashboardState,
    datasetName = "Dataset",
    rowCount = 0,
    columnCount = 0,
    existingId?: string
  ): Promise<SavedCloudDashboard> {
    const dashboardId = existingId || `dash_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const now = new Date().toISOString();

    const payload: SavedCloudDashboard = {
      id: dashboardId,
      userId,
      title: dashboard.title,
      subtitle: dashboard.subtitle,
      templateId: dashboard.templateId,
      datasetName,
      rowCount,
      columnCount,
      dashboardState: dashboard,
      createdAt: now,
      updatedAt: now,
    };

    if (!isFirebaseConfigured || !firestore) {
      Logger.info("Saving dashboard to resilient local storage fallback", { dashboardId, title: dashboard.title });
      this.saveToLocalStorage(payload);
      return payload;
    }

    try {
      const docRef = doc(firestore, "dashboards", dashboardId);
      await setDoc(docRef, payload);
      Logger.info("Dashboard saved to Firestore cloud", { dashboardId, userId });
      // Keep local sync
      this.saveToLocalStorage(payload);
      return payload;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal menyimpan ke Firestore";
      Logger.warn("Firestore save failed, falling back to local storage", { error: msg });
      this.saveToLocalStorage(payload);
      return payload;
    }
  }

  /**
   * List all saved dashboards for a specific user
   */
  static async listUserDashboards(userId: string): Promise<SavedCloudDashboard[]> {
    if (!isFirebaseConfigured || !firestore) {
      return this.listFromLocalStorage(userId);
    }

    try {
      const q = query(
        collection(firestore, "dashboards"),
        where("userId", "==", userId),
        orderBy("updatedAt", "desc")
      );
      const snapshot = await getDocs(q);
      const list: SavedCloudDashboard[] = [];
      snapshot.forEach((d) => {
        list.push(d.data() as SavedCloudDashboard);
      });
      return list.length > 0 ? list : this.listFromLocalStorage(userId);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Gagal mengambil data dari Firestore";
      Logger.warn("Firestore query failed, using local storage", { error: msg });
      return this.listFromLocalStorage(userId);
    }
  }

  /**
   * Get single dashboard by ID
   */
  static async getDashboard(dashboardId: string): Promise<SavedCloudDashboard | null> {
    if (!isFirebaseConfigured || !firestore) {
      return this.getFromLocalStorage(dashboardId);
    }

    try {
      const docRef = doc(firestore, "dashboards", dashboardId);
      const snapshot = await getDoc(docRef);
      if (snapshot.exists()) {
        return snapshot.data() as SavedCloudDashboard;
      }
      return this.getFromLocalStorage(dashboardId);
    } catch {
      return this.getFromLocalStorage(dashboardId);
    }
  }

  /**
   * Delete dashboard
   */
  static async deleteDashboard(dashboardId: string, userId: string): Promise<void> {
    this.deleteFromLocalStorage(dashboardId);

    if (isFirebaseConfigured && firestore) {
      try {
        const docRef = doc(firestore, "dashboards", dashboardId);
        await deleteDoc(docRef);
        Logger.info("Deleted dashboard from Firestore", { dashboardId, userId });
      } catch (err: unknown) {
        Logger.warn("Failed to delete from Firestore", { error: String(err) });
      }
    }
  }

  /**
   * Upload raw dataset file to Firebase Cloud Storage
   */
  static async uploadDatasetFile(userId: string, file: File): Promise<string> {
    if (!isFirebaseConfigured || !storage) {
      Logger.info("Simulating local file upload", { fileName: file.name, size: file.size });
      return `local://datasets/${file.name}`;
    }

    try {
      const fileRef = ref(storage, `user_datasets/${userId}/${Date.now()}_${file.name}`);
      const uploadResult = await uploadBytes(fileRef, file);
      const downloadUrl = await getDownloadURL(uploadResult.ref);
      Logger.info("File uploaded to Firebase Storage", { fileName: file.name, downloadUrl });
      return downloadUrl;
    } catch (err: unknown) {
      Logger.warn("Firebase Storage upload failed", { error: String(err) });
      return `local://datasets/${file.name}`;
    }
  }

  // --- LOCAL STORAGE HELPERS ---

  private static getAllLocalStorage(): SavedCloudDashboard[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(LOCAL_WORKSPACE_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private static saveToLocalStorage(dashboard: SavedCloudDashboard): void {
    if (typeof window === "undefined") return;
    try {
      const list = this.getAllLocalStorage();
      const existingIdx = list.findIndex((d) => d.id === dashboard.id);
      if (existingIdx >= 0) {
        list[existingIdx] = dashboard;
      } else {
        list.unshift(dashboard);
      }
      localStorage.setItem(LOCAL_WORKSPACE_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Ignore quota
    }
  }

  private static listFromLocalStorage(userId: string): SavedCloudDashboard[] {
    const list = this.getAllLocalStorage();
    return list.filter((d) => d.userId === userId || d.userId === "guest" || !d.userId);
  }

  private static getFromLocalStorage(dashboardId: string): SavedCloudDashboard | null {
    const list = this.getAllLocalStorage();
    return list.find((d) => d.id === dashboardId) || null;
  }

  private static deleteFromLocalStorage(dashboardId: string): void {
    if (typeof window === "undefined") return;
    try {
      const list = this.getAllLocalStorage().filter((d) => d.id !== dashboardId);
      localStorage.setItem(LOCAL_WORKSPACE_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Ignore
    }
  }
}
