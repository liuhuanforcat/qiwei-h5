import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type StoreUpgradeHandler = (
  db: IDBDatabase,
  event: IDBVersionChangeEvent,
  store: IDBObjectStore
) => void;

export interface UseIndexedDBOptions {
  /**
   * 数据库名称
   * 建议使用业务唯一的标识，避免与其他项目产生冲突。
   */
  dbName: string;
  /**
   * 对象仓库名称
   * IndexedDB 支持在同一个数据库下创建多个对象仓库（object store）。
   */
  storeName: string;
  /**
   * 数据库版本号，变更时会触发升级逻辑
   * 可用于创建对象仓库、索引等结构性调整。
   */
  version?: number;
  /**
   * `createObjectStore` 的配置（首次创建时生效）
   * 常见的参数如 keyPath、autoIncrement。
   */
  storeConfig?: IDBObjectStoreParameters;
  /**
   * 自定义升级函数，可在其中创建索引等
   * 当 version 增加或首次打开数据库时触发。
   */
  onUpgrade?: StoreUpgradeHandler;
}

export interface UseIndexedDBResult<TValue> {
  /** 数据库是否已准备就绪（可执行 CRUD 操作） */
  ready: boolean;
  /** 初始化或操作过程中出现的异常 */
  error: DOMException | Error | null;
  /** 当前运行环境是否支持 IndexedDB */
  supported: boolean;
  /** 新增记录 */
  addItem: (value: TValue, key?: IDBValidKey) => Promise<IDBValidKey>;
  /** 覆盖写入记录（若主键存在则更新，不存在则新增） */
  putItem: (value: TValue, key?: IDBValidKey) => Promise<IDBValidKey | void>;
  /** 根据主键获取单条记录 */
  getItem: (key: IDBValidKey) => Promise<TValue | undefined>;
  /** 获取仓库内所有记录 */
  getAllItems: () => Promise<TValue[]>;
  /** 根据主键删除记录 */
  deleteItem: (key: IDBValidKey) => Promise<void>;
  /** 清空对象仓库 */
  clearStore: () => Promise<void>;
  /**
   * 局部更新记录
   * 会先读取旧值，合并修改后再写入，如果不存在则抛出异常。
   */
  updateItem: (key: IDBValidKey, updates: Partial<TValue>) => Promise<TValue>;
  /** 关闭数据库连接 */
  close: () => void;
}

const isBrowser = typeof window !== 'undefined';
const isSupported = isBrowser && typeof indexedDB !== 'undefined';

/**
 * 将原生 IndexedDB 请求转换为 Promise
 * 统一处理成功 / 失败的回调逻辑，方便在 hook 中直接使用 async/await。
 */
const requestToPromise = <T>(request: IDBRequest<T>): Promise<T> =>
  new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error('IndexedDB 请求失败'));
  });

/**
 * React 中使用 IndexedDB 的通用 Hook
 *
 * @example
 * const { ready, addItem, getAllItems } = useIndexedDB<Todo>({
 *   dbName: 'app-db',
 *   storeName: 'todo',
 *   version: 1,
 *   storeConfig: { keyPath: 'id', autoIncrement: true },
 *   onUpgrade: (_, __, store) => store.createIndex('status', 'status'),
 * });
 */
export function useIndexedDB<TValue>(
  options: UseIndexedDBOptions
): UseIndexedDBResult<TValue> {
  const { dbName, storeName, version = 1, storeConfig, onUpgrade } = options;

  const dbRef = useRef<IDBDatabase | null>(null);
  const [ready, setReady] = useState(false);
  const [error, setError] = useState<DOMException | Error | null>(null);

  useEffect(() => {
    if (!isSupported) {
      setError(new Error('当前环境不支持 IndexedDB'));
      setReady(false);
      return;
    }

    let cancelled = false;
    setReady(false);
    setError(null);

    const openRequest = indexedDB.open(dbName, version);

    openRequest.onupgradeneeded = (event) => {
      const db = openRequest.result;
      const transaction = openRequest.transaction;
      let store: IDBObjectStore;

      if (db.objectStoreNames.contains(storeName)) {
        if (!transaction) {
          throw new Error('升级事务缺失，无法获取对象仓库');
        }
        store = transaction.objectStore(storeName);
      } else {
        store = db.createObjectStore(storeName, storeConfig);
      }

      onUpgrade?.(db, event, store);
    };

    openRequest.onsuccess = () => {
      if (cancelled) {
        openRequest.result.close();
        return;
      }
      dbRef.current = openRequest.result;
      setReady(true);
    };

    openRequest.onerror = () => {
      if (cancelled) {
        openRequest.result.close();
        return;
      }
      setError(openRequest.error ?? new Error('IndexedDB 打开失败'));
      setReady(false);
    };

    openRequest.onblocked = () => {
      setError(new Error('IndexedDB 升级被阻塞，请关闭其他使用该数据库的页面'));
    };

    return () => {
      cancelled = true;
      if (dbRef.current) {
        dbRef.current.close();
        dbRef.current = null;
      }
      openRequest.result?.close?.();
    };
  }, [dbName, storeName, version, storeConfig, onUpgrade]);

  /**
   * 统一封装事务执行流程，确保所有操作都在同一入口
   * @param mode 事务模式（readonly 或 readwrite）
   * @param runner 业务逻辑，接受对象仓库作为参数
   */
  const runInStore = useCallback(
    <R>(mode: IDBTransactionMode, runner: (store: IDBObjectStore) => Promise<R>): Promise<R> => {
      return new Promise<R>((resolve, reject) => {
        const db = dbRef.current;
        if (!db) {
          reject(new Error('IndexedDB 尚未初始化或已关闭'));
          return;
        }

        let resultValue: R;

        const transaction = db.transaction(storeName, mode);
        const store = transaction.objectStore(storeName);

        Promise.resolve(runner(store))
          .then((value) => {
            resultValue = value;
          })
          .catch((runnerError) => {
            reject(runnerError);
            transaction.abort();
          });

        transaction.oncomplete = () => resolve(resultValue);
        transaction.onabort = () =>
          reject(transaction.error ?? new Error('IndexedDB 事务被中止'));
        transaction.onerror = () =>
          reject(transaction.error ?? new Error('IndexedDB 事务执行失败'));
      });
    },
    [storeName]
  );

  const addItem = useCallback(
    (value: TValue, key?: IDBValidKey) =>
      runInStore<IDBValidKey>('readwrite', (store) => {
        const request = key !== undefined ? store.add(value, key) : store.add(value);
        return requestToPromise(request);
      }),
    [runInStore]
  );

  const putItem = useCallback(
    (value: TValue, key?: IDBValidKey) =>
      runInStore<IDBValidKey | void>('readwrite', (store) => {
        const request = key !== undefined ? store.put(value, key) : store.put(value);
        return requestToPromise(request);
      }),
    [runInStore]
  );

  const getItem = useCallback(
    (key: IDBValidKey) =>
      runInStore<TValue | undefined>('readonly', (store) => {
        const request = store.get(key);
        return requestToPromise(request);
      }),
    [runInStore]
  );

  const getAllItems = useCallback(
    () =>
      runInStore<TValue[]>('readonly', (store) => {
        const request = store.getAll();
        return requestToPromise(request);
      }),
    [runInStore]
  );

  const deleteItem = useCallback(
    (key: IDBValidKey) =>
      runInStore<void>('readwrite', (store) => {
        const request = store.delete(key);
        return requestToPromise(request).then(() => undefined);
      }),
    [runInStore]
  );

  const clearStore = useCallback(
    () =>
      runInStore<void>('readwrite', (store) => {
        const request = store.clear();
        return requestToPromise(request).then(() => undefined);
      }),
    [runInStore]
  );

  const updateItem = useCallback(
    (key: IDBValidKey, updates: Partial<TValue>) =>
      runInStore<TValue>('readwrite', async (store) => {
        const current = await requestToPromise(store.get(key));

        if (current === undefined) {
          throw new Error(`未找到 key 为 "${String(key)}" 的记录`);
        }

        const nextValue = { ...(current as object), ...(updates as object) } as TValue;
        const hasKeyPath = store.keyPath !== null && store.keyPath !== undefined;
        if (hasKeyPath) {
          await requestToPromise(store.put(nextValue));
        } else {
          await requestToPromise(store.put(nextValue, key));
        }
        return nextValue;
      }),
    [runInStore]
  );

  const close = useCallback(() => {
    if (dbRef.current) {
      dbRef.current.close();
      dbRef.current = null;
      setReady(false);
    }
  }, []);

  return useMemo(
    () => ({
      ready,
      error,
      supported: isSupported,
      addItem,
      putItem,
      getItem,
      getAllItems,
      deleteItem,
      clearStore,
      updateItem,
      close,
    }),
    [
      ready,
      error,
      addItem,
      putItem,
      getItem,
      getAllItems,
      deleteItem,
      clearStore,
      updateItem,
      close,
    ]
  );
}

export default useIndexedDB;

