import { useEffect, useState, useCallback } from "react";
import { useAPI } from "../hooks/useAPI";

export type Entity = {
  id: string;
  title: string;
  api: string;
  columns: any[];
  component?: string;
  fields: any[];
  formType: "schema" | "component";
  actions?: any[];
  rows?: any[];
};

export function useEntityController() {
  const [entities, setEntities] = useState<Entity[]>([]);
  const [activeEntityMeta, setActiveEntityMeta] = useState<Entity | null>(null);
  const [activeEntity, setActiveEntity] = useState<Entity | null>(null);
  const [columnsReady, setColumnsReady] = useState(false);
  const [loading, setLoading] = useState({
    entities: true,
    entity: false,
    rows: false,
  });

  const { callAPI: fetchEntitiesAPI } = useAPI<Entity[]>("/api/entity/");
  const { callAPI: fetchEntityById } = useAPI<Entity>("", { autoFetch: false });
  const { callAPI: fetchRows } = useAPI<any[]>("", { autoFetch: false });

  /** Load entities list on mount */
  useEffect(() => {
    fetchEntitiesAPI()
      .then((data) => {
        if (data?.length) {
          setEntities(data);
          setActiveEntityMeta(data[0]);
        }
      })
      .finally(() => setLoading((prev) => ({ ...prev, entities: false })));
  }, []);

  /** Load full entity when meta changes */
  useEffect(() => {
    if (!activeEntityMeta?.id) return;

    setColumnsReady(false);
    setLoading((prev) => ({ ...prev, entity: true }));

    fetchEntityById(`/api/entity/${activeEntityMeta.id}`)
      .then((fullEntity) => {
        if (fullEntity) {
          setActiveEntity(fullEntity);
          setColumnsReady(true);
        }
      })
      .finally(() => setLoading((prev) => ({ ...prev, entity: false })));
  }, [activeEntityMeta?.id]);

  /** Fetch rows after full entity loaded */
  useEffect(() => {
    if (!activeEntity?.api) return;

    setLoading((prev) => ({ ...prev, rows: true }));

    fetchRows(activeEntity.api)
      .then((rows) => {
        setActiveEntity((prev) => prev && { ...prev, rows: rows ?? [] });
      })
      .finally(() => setLoading((prev) => ({ ...prev, rows: false })));
  }, [activeEntity?.api]);

  /** CRUD submit handler */
  const submitEntityData = useCallback(
    async (data: any, mode: "create" | "edit") => {
      if (!activeEntity) return;

      try {
        const method = mode === "create" ? "POST" : "PUT";
        const url =
          mode === "edit" && data.id
            ? `${activeEntity.api}/${data.id}`
            : activeEntity.api;

        await fetchRows(url, { method, body: data });

        // Refresh rows after submit
        const updatedRows = await fetchRows(activeEntity.api);
        setActiveEntity((prev) => prev && { ...prev, rows: updatedRows ?? [] });
      } catch (err) {
        console.error("Failed to submit:", err);
      }
    },
    [activeEntity]
  );

  return {
    entities,
    activeEntityMeta,
    setActiveEntityMeta,
    activeEntity,
    columnsReady,
    loading,
    submitEntityData,
  };
}
