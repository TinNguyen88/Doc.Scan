import { ScannedDocument } from '../types';

const DB_NAME = 'DocumentScannerDB_NTT';
const STORE_NAME = 'documents';
const DB_VERSION = 1;

class DocumentStorageService {
  private db: IDBDatabase | null = null;

  private async openDB(): Promise<IDBDatabase> {
    if (this.db) return this.db;

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          db.createObjectStore(STORE_NAME, { keyPath: 'id' });
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve(this.db);
      };

      request.onerror = (event) => {
        console.error('IndexedDB open error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  async getAllDocuments(): Promise<ScannedDocument[]> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
          const docs: ScannedDocument[] = request.result || [];
          // Sort by updatedAt descending
          docs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
          resolve(docs);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (e) {
      console.warn('Falling back to localStorage for getAllDocuments:', e);
      const data = localStorage.getItem('ntt_scanned_documents');
      return data ? JSON.parse(data) : [];
    }
  }

  async getDocumentById(id: string): Promise<ScannedDocument | null> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);

        request.onsuccess = () => {
          resolve(request.result || null);
        };

        request.onerror = () => {
          reject(request.error);
        };
      });
    } catch (e) {
      const docs = await this.getAllDocuments();
      return docs.find((d) => d.id === id) || null;
    }
  }

  async saveDocument(doc: ScannedDocument): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put(doc);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      console.warn('IndexedDB save failed, trying localStorage:', e);
      const docs = await this.getAllDocuments();
      const existingIdx = docs.findIndex((d) => d.id === doc.id);
      if (existingIdx >= 0) {
        docs[existingIdx] = doc;
      } else {
        docs.unshift(doc);
      }
      localStorage.setItem('ntt_scanned_documents', JSON.stringify(docs));
    }
  }

  async deleteDocument(id: string): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      const docs = await this.getAllDocuments();
      const filtered = docs.filter((d) => d.id !== id);
      localStorage.setItem('ntt_scanned_documents', JSON.stringify(filtered));
    }
  }

  async clearAll(): Promise<void> {
    try {
      const db = await this.openDB();
      return new Promise((resolve, reject) => {
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.clear();

        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
      });
    } catch (e) {
      localStorage.removeItem('ntt_scanned_documents');
    }
  }

  async getStorageUsageMB(): Promise<number> {
    try {
      if (navigator.storage && navigator.storage.estimate) {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage) {
          return +(estimate.usage / (1024 * 1024)).toFixed(2);
        }
      }
      const docs = await this.getAllDocuments();
      const str = JSON.stringify(docs);
      return +(str.length / (1024 * 1024)).toFixed(2);
    } catch (e) {
      return 0.5;
    }
  }
}

export const docStorage = new DocumentStorageService();
