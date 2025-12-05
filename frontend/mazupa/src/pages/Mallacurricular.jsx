import { useLocation, Navigate } from 'react-router-dom';
import { useState, useMemo } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// Colores por bloque académico
const getBlockColor = (bloque) => {
  if (bloque.includes("Matemáticas") || bloque.includes("Ciencias Básicas")) return "#3b82f6";
  if (bloque.includes("Fundamentos") || bloque.includes("Ingeniería")) return "#22c55e";
  if (bloque.includes("Formación General") || bloque.includes("Filosófica")) return "#a855f7";
  return "#f97316";
};

function MallaContent({ data }) {
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

  // Obtener prerequisitos, corequisitos y cursos que desbloquea
  const { prereqs, coreqs, unlocks } = useMemo(() => {
    const prereqs = new Set();
    const coreqs = new Set();
    const unlocks = new Set();
    if (!selectedSigla) return { prereqs, coreqs, unlocks };

    // Cursos que desbloquea el seleccionado
    ramos.forEach((ramo) => {
      ramo.Requisitos?.Cursos?.forEach((curso) => {
        if (curso.Sigla === selectedSigla) {
          if (curso.TipoRequisito === "Requisito" && ramo.CodSigla) unlocks.add(ramo.CodSigla);
          if (curso.TipoRequisito === "Corequisito" && ramo.CodSigla) unlocks.add(ramo.CodSigla);
        }
      });
    });

    // Prerequisitos y corequisitos del seleccionado
    const selected = ramos.find((r) => r.CodSigla === selectedSigla || r.CodLista === selectedSigla);
    selected?.Requisitos?.Cursos?.forEach((curso) => {
      if (curso.Sigla) {
        if (curso.TipoRequisito === "Requisito") prereqs.add(curso.Sigla);
        if (curso.TipoRequisito === "Corequisito") coreqs.add(curso.Sigla);
      }
    });

    return { prereqs, coreqs, unlocks };
  }, [selectedSigla, ramos]);

  // Estilo del card
  const getCardStyle = (ramo, isDragging) => {
    const blockColor = getBlockColor(ramo.BloqueAcademico);
    const base = {
      padding: 12,
      paddingLeft: 16,
      borderRadius: 8,
      cursor: "pointer",
      color: "#1f2937",
      backgroundColor: "white",
      borderLeft: `4px solid ${blockColor}`,
      boxShadow: isDragging ? "0 8px 16px rgba(0,0,0,0.2)" : "0 2px 4px rgba(0,0,0,0.1)",
      transform: isDragging ? "rotate(2deg)" : "none",
      transition: "all 0.2s",
    };

    if (!selectedSigla) return base;
    const ramoId = ramo.CodSigla || ramo.CodLista;
    if (ramoId === selectedSigla) return { ...base, boxShadow: "0 0 0 4px #3b82f6", transform: "scale(1.05)" };
    if (prereqs.has(ramoId)) return { ...base, boxShadow: "0 0 0 3px #22c55e" };
    if (coreqs.has(ramoId)) return { ...base, boxShadow: "0 0 0 3px #eab308" };
    if (unlocks.has(ramoId)) return { ...base, boxShadow: "0 0 0 3px #ec4899" };
    return { ...base, opacity: 0.3 };
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newRamos = [...ramos];
    
    // Buscar el ramo por su ID único
    const ramoIndex = newRamos.findIndex((r, idx) => {
      const uniqueId = r.CodSigla || r.CodLista || `ramo-${r.SemestreBloque}-${idx}-${r.Nombre.replace(/\s+/g, '-')}`;
      return uniqueId === result.draggableId;
    });
    
    if (ramoIndex !== -1) {
      newRamos[ramoIndex].SemestreBloque = parseInt(result.destination.droppableId);
      setRamos(newRamos);
    }
  };

  return (
    <div style={{ padding: 24, backgroundColor: "#f5f7fa", minHeight: "100vh" }}>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 16 }}>{data.Nombre}</h1>
      
      {/* Leyenda */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, fontSize: 14 }}>
        <span>🔵 Seleccionado</span>
        <span>🟢 Prerequisito (debes aprobar antes)</span>
        <span>🟡 Corequisito (tomar junto)</span>
        <span>🔴 Desbloquea (puedes tomar después)</span>
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
                    {semestreGroups[sem]?.map((ramo, index) => {
                      const uniqueId = ramo.CodSigla || ramo.CodLista || `ramo-${sem}-${index}-${ramo.Nombre.replace(/\s+/g, '-')}`;
                      return (
                      <Draggable
                        key={uniqueId}
                        draggableId={uniqueId}
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
                    );
                    })}
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

export default function MallaCurricular() {
  const location = useLocation();
  
  // Si no hay datos en el state, redirigir a la selección
  if (!location.state || !location.state.mallaData) {
    return <Navigate to="/selection" replace />;
  }

  return <MallaContent data={location.state.mallaData} />;
}