import { useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Colores por bloque académico
const getBlockColor = (bloque) => {
  if (bloque.includes("Matemáticas") || bloque.includes("Ciencias Básicas")) return "#3b82f6";
  if (bloque.includes("Fundamentos") || bloque.includes("Ingeniería")) return "#22c55e";
  if (bloque.includes("Formación General") || bloque.includes("Filosófica")) return "#a855f7";
  return "#f97316";
};

export default function MallaCurricular({ data }) {
  const [ramos, setRamos] = useState(data.Ramos);
  const [selectedSigla, setSelectedSigla] = useState(null);

  // Agrupar por semestre
  const semestreGroups = useMemo(() => {
    const groups = {};
    ramos.forEach((ramo) => {
      if (!groups[ramo.SemestreBloque]) groups[ramo.SemestreBloque] = [];
      groups[ramo.SemestreBloque].push(ramo);
    });
    Object.keys(groups).forEach((sem) => {
      groups[sem].sort((a, b) => a.OrdenSemestre - b.OrdenSemestre);
    });
    return groups;
  }, [ramos]);

  const semestres = Object.keys(semestreGroups).map(Number).sort((a, b) => a - b);

  // Obtener prerequisitos y corequisitos relacionados
  const { prereqs, coreqs } = useMemo(() => {
    const prereqs = new Set();
    const coreqs = new Set();
    if (!selectedSigla) return { prereqs, coreqs };

    ramos.forEach((ramo) => {
      ramo.Requisitos?.Cursos?.forEach((curso) => {
        if (curso.Sigla === selectedSigla) {
          if (curso.TipoRequisito === "Requisito" && ramo.CodSigla) prereqs.add(ramo.CodSigla);
          if (curso.TipoRequisito === "Corequisito" && ramo.CodSigla) coreqs.add(ramo.CodSigla);
        }
      });
    });

    const selected = ramos.find((r) => r.CodSigla === selectedSigla || r.CodLista === selectedSigla);
    selected?.Requisitos?.Cursos?.forEach((curso) => {
      if (curso.Sigla) {
        if (curso.TipoRequisito === "Requisito") prereqs.add(curso.Sigla);
        if (curso.TipoRequisito === "Corequisito") coreqs.add(curso.Sigla);
      }
    });

    return { prereqs, coreqs };
  }, [selectedSigla, ramos]);

  // Estilo del card
  const getCardStyle = (ramo, isDragging) => {
    const base = {
      padding: 12,
      borderRadius: 8,
      cursor: "pointer",
      color: "white",
      backgroundColor: getBlockColor(ramo.BloqueAcademico),
      boxShadow: isDragging ? "0 8px 16px rgba(0,0,0,0.2)" : "0 2px 4px rgba(0,0,0,0.1)",
      transform: isDragging ? "rotate(2deg)" : "none",
      transition: "all 0.2s",
    };

    if (!selectedSigla) return base;
    const ramoId = ramo.CodSigla || ramo.CodLista;
    if (ramoId === selectedSigla) return { ...base, boxShadow: "0 0 0 4px #3b82f6", transform: "scale(1.05)" };
    if (prereqs.has(ramoId)) return { ...base, boxShadow: "0 0 0 3px #22c55e" };
    if (coreqs.has(ramoId)) return { ...base, boxShadow: "0 0 0 3px #eab308" };
    return { ...base, opacity: 0.3 };
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newRamos = [...ramos];
    const ramo = newRamos.find(
      (r) => (r.CodSigla || r.CodLista || `${r.Nombre}-${r.SemestreBloque}`) === result.draggableId
    );
    if (ramo) {
      ramo.SemestreBloque = parseInt(result.destination.droppableId);
      setRamos(newRamos);
    }
  };

  return (
    <div style={{ padding: 24, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>{data.Nombre}</h1>
      
      {/* Leyenda */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, fontSize: 14 }}>
        <span>🟢 Prerequisito</span>
        <span>🟡 Corequisito</span>
        <span>🔵 Seleccionado</span>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div style={{ display: "flex", gap: 12, overflowX: "auto" }}>
          {semestres.map((sem) => (
            <div key={sem} style={{ width: 200, flexShrink: 0 }}>
              <div style={{ backgroundColor: "#3b82f6", color: "white", padding: 10, textAlign: "center", borderRadius: "8px 8px 0 0", fontWeight: 600 }}>
                Semestre {sem}
              </div>
              <Droppable droppableId={String(sem)}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={{
                      minHeight: 400,
                      backgroundColor: snapshot.isDraggingOver ? "#e8f0fe" : "white",
                      padding: 8,
                      display: "flex",
                      flexDirection: "column",
                      gap: 8,
                      border: "1px solid #e5e7eb",
                      borderTop: "none",
                      borderRadius: "0 0 8px 8px",
                    }}
                  >
                    {semestreGroups[sem]?.map((ramo, index) => (
                      <Draggable
                        key={ramo.CodSigla || ramo.CodLista || `${ramo.Nombre}-${sem}-${index}`}
                        draggableId={ramo.CodSigla || ramo.CodLista || `${ramo.Nombre}-${sem}-${index}`}
                        index={index}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            onClick={() => {
                              const id = ramo.CodSigla || ramo.CodLista;
                              setSelectedSigla(selectedSigla === id ? null : id);
                            }}
                            style={{ ...getCardStyle(ramo, snapshot.isDragging), ...provided.draggableProps.style }}
                          >
                            <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 6 }}>{ramo.Nombre}</div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, opacity: 0.85 }}>
                              <span>{ramo.CodSigla || ramo.CodLista || "Lista"}</span>
                              <span>{ramo.Creditos} cr</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
        </div>
      </DragDropContext>

      <p style={{ textAlign: "center", color: "#888", marginTop: 24 }}>
        Click en un ramo para ver relaciones • Arrastra para reorganizar
      </p>
    </div>
  );
}