import { useLocation, Navigate } from 'react-router-dom';
import { useState, useMemo, useRef, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { MessageCircle, X, Send, Bot, User, BookOpen, CheckSquare, Square } from 'lucide-react';

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
  const [chatOpen, setChatOpen] = useState(false);
  const [cursosAprobados, setCursosAprobados] = useState(new Set());
  const [showAprobadosPanel, setShowAprobadosPanel] = useState(false);
  
  // Estados del chat
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `¡Hola! Soy tu consejero académico para ${data.Nombre}. Puedo ayudarte con recomendaciones de cursos basándome en tu progreso actual. ¿En qué puedo ayudarte?`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

    ramos.forEach((ramo) => {
      ramo.Requisitos?.Cursos?.forEach((curso) => {
        if (curso.Sigla === selectedSigla) {
          if (curso.TipoRequisito === "Requisito" && ramo.CodSigla) unlocks.add(ramo.CodSigla);
          if (curso.TipoRequisito === "Corequisito" && ramo.CodSigla) unlocks.add(ramo.CodSigla);
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

    return { prereqs, coreqs, unlocks };
  }, [selectedSigla, ramos]);

  const toggleCursoAprobado = (ramoId) => {
    const newAprobados = new Set(cursosAprobados);
    if (newAprobados.has(ramoId)) {
      newAprobados.delete(ramoId);
    } else {
      newAprobados.add(ramoId);
    }
    setCursosAprobados(newAprobados);
  };

  // Estilo del card
  const getCardStyle = (ramo, isDragging) => {
    const blockColor = getBlockColor(ramo.BloqueAcademico);
    const ramoId = ramo.CodSigla || ramo.CodLista;
    const isAprobado = cursosAprobados.has(ramoId);
    
    const base = {
      padding: 12,
      paddingLeft: 16,
      borderRadius: 8,
      cursor: "pointer",
      color: "#1f2937",
      backgroundColor: isAprobado ? "#d1fae5" : "white",
      borderLeft: `4px solid ${blockColor}`,
      boxShadow: isDragging ? "0 8px 16px rgba(0,0,0,0.2)" : "0 2px 4px rgba(0,0,0,0.1)",
      transform: isDragging ? "rotate(2deg)" : "none",
      transition: "all 0.2s",
      position: "relative"
    };

    if (!selectedSigla) return base;
    if (ramoId === selectedSigla) return { ...base, boxShadow: "0 0 0 4px #3b82f6", transform: "scale(1.05)" };
    if (prereqs.has(ramoId)) return { ...base, boxShadow: "0 0 0 3px #22c55e" };
    if (coreqs.has(ramoId)) return { ...base, boxShadow: "0 0 0 3px #eab308" };
    if (unlocks.has(ramoId)) return { ...base, boxShadow: "0 0 0 3px #ec4899" };
    return { ...base, opacity: 0.3 };
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newRamos = [...ramos];
    
    const ramoIndex = newRamos.findIndex((r, idx) => {
      const uniqueId = r.CodSigla || r.CodLista || `ramo-${r.SemestreBloque}-${idx}-${r.Nombre.replace(/\s+/g, '-')}`;
      return uniqueId === result.draggableId;
    });
    
    if (ramoIndex !== -1) {
      newRamos[ramoIndex].SemestreBloque = parseInt(result.destination.droppableId);
      setRamos(newRamos);
    }
  };

  const handleSendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const cursosAprobadosArray = Array.from(cursosAprobados);
      
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          dataMalla: data,
          cursosAprobados: cursosAprobadosArray
        }),
      });

      const apiData = await response.json();

      if (apiData.success) {
        let cleanResponse = apiData.respuesta;
        const jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          cleanResponse = cleanResponse.replace(jsonMatch[0], '').trim();
        }

        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: cleanResponse,
          coursesData: apiData.cursosRecomendados
        }]);
      } else {
        throw new Error(apiData.error);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Lo siento, ocurrió un error al procesar tu solicitud. Por favor, intenta de nuevo.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div style={{ padding: 24, backgroundColor: "#f5f7fa", minHeight: "100vh", position: "relative" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>{data.Nombre}</h1>
        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={() => setShowAprobadosPanel(!showAprobadosPanel)}
            style={{
              padding: "10px 20px",
              backgroundColor: showAprobadosPanel ? "#3b82f6" : "white",
              color: showAprobadosPanel ? "white" : "#3b82f6",
              border: "2px solid #3b82f6",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <CheckSquare size={18} />
            Cursos Aprobados ({cursosAprobados.size})
          </button>
          <button
            onClick={() => setChatOpen(!chatOpen)}
            style={{
              padding: "10px 20px",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: 8
            }}
          >
            <MessageCircle size={18} />
            Consejero IA
          </button>
        </div>
      </div>
      
      {/* Leyenda */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, fontSize: 14 }}>
        <span>🔵 Seleccionado</span>
        <span>🟢 Prerequisito</span>
        <span>🟡 Corequisito</span>
        <span>🔴 Desbloquea</span>
        <span>✅ Aprobado</span>
      </div>

      {/* Panel de Cursos Aprobados */}
      {showAprobadosPanel && (
        <div style={{
          position: "fixed",
          top: 0,
          right: 0,
          width: 350,
          height: "100vh",
          backgroundColor: "white",
          boxShadow: "-4px 0 12px rgba(0,0,0,0.1)",
          zIndex: 100,
          display: "flex",
          flexDirection: "column"
        }}>
          <div style={{
            padding: 16,
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            backgroundColor: "#3b82f6",
            color: "white"
          }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Cursos Aprobados</h3>
              <p style={{ margin: 0, fontSize: 13, marginTop: 4, opacity: 0.9 }}>
                {cursosAprobados.size} de {data.Ramos.length} cursos
              </p>
            </div>
            <button
              onClick={() => setShowAprobadosPanel(false)}
              style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
            >
              <X size={24} />
            </button>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: 16 }}>
            {semestres.map((sem) => (
              <div key={sem} style={{ marginBottom: 16 }}>
                <h4 style={{ fontSize: 14, fontWeight: 600, marginBottom: 8, color: "#4b5563" }}>
                  Semestre {sem}
                </h4>
                {semestreGroups[sem].map((ramo) => {
                  const ramoId = ramo.CodSigla || ramo.CodLista;
                  const isAprobado = cursosAprobados.has(ramoId);
                  return (
                    <div
                      key={ramoId}
                      onClick={() => toggleCursoAprobado(ramoId)}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        padding: 8,
                        cursor: "pointer",
                        borderRadius: 6,
                        marginBottom: 4,
                        backgroundColor: isAprobado ? "#d1fae5" : "#f9fafb",
                        border: isAprobado ? "2px solid #10b981" : "1px solid #e5e7eb"
                      }}
                    >
                      {isAprobado ? (
                        <CheckSquare size={18} style={{ color: "#10b981", flexShrink: 0, marginTop: 2 }} />
                      ) : (
                        <Square size={18} style={{ color: "#9ca3af", flexShrink: 0, marginTop: 2 }} />
                      )}
                      <div style={{ flex: 1, fontSize: 13 }}>
                        <div style={{ fontWeight: 500, color: "#1f2937" }}>{ramo.Nombre}</div>
                        <div style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                          {ramoId} • {ramo.Creditos} cr
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Malla Curricular */}
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
                      const ramoId = ramo.CodSigla || ramo.CodLista;
                      const isAprobado = cursosAprobados.has(ramoId);
                      
                      return (
                        <Draggable key={uniqueId} draggableId={uniqueId} index={index}>
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
                              {isAprobado && (
                                <div style={{ position: "absolute", top: 4, right: 4 }}>
                                  <CheckSquare size={16} style={{ color: "#10b981" }} />
                                </div>
                              )}
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

      {/* Chat Flotante */}
      {chatOpen && (
        <div style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          width: 400,
          height: 600,
          backgroundColor: "white",
          borderRadius: 12,
          boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          zIndex: 1000
        }}>
          {/* Chat Header */}
          <div style={{
            background: "linear-gradient(to right, #3b82f6, #6366f1)",
            color: "white",
            padding: 16,
            borderRadius: "12px 12px 0 0",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: "50%",
                background: "rgba(255,255,255,0.2)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center"
              }}>
                <Bot size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600 }}>Consejero IA</h3>
                <p style={{ margin: 0, fontSize: 11, opacity: 0.9 }}>{cursosAprobados.size} cursos aprobados</p>
              </div>
            </div>
            <button
              onClick={() => setChatOpen(false)}
              style={{ background: "none", border: "none", color: "white", cursor: "pointer" }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: 16, backgroundColor: "#f9fafb" }}>
            {messages.map((message, index) => (
              <div key={index} style={{ marginBottom: 16 }}>
                <div style={{
                  display: "flex",
                  gap: 8,
                  justifyContent: message.role === "user" ? "flex-end" : "flex-start"
                }}>
                  {message.role === "assistant" && (
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "linear-gradient(to bottom right, #3b82f6, #6366f1)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <Bot size={16} style={{ color: "white" }} />
                    </div>
                  )}
                  <div style={{
                    maxWidth: "70%",
                    padding: "10px 14px",
                    borderRadius: 10,
                    backgroundColor: message.role === "user" ? "#3b82f6" : "white",
                    color: message.role === "user" ? "white" : "#1f2937",
                    fontSize: 13,
                    lineHeight: 1.5
                  }}>
                    {message.content}
                  </div>
                  {message.role === "user" && (
                    <div style={{
                      width: 28,
                      height: 28,
                      borderRadius: "50%",
                      background: "#6b7280",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0
                    }}>
                      <User size={16} style={{ color: "white" }} />
                    </div>
                  )}
                </div>
                {message.coursesData && (
                  <div style={{
                    marginLeft: 36,
                    marginTop: 8,
                    backgroundColor: "#dbeafe",
                    border: "1px solid #93c5fd",
                    borderRadius: 8,
                    padding: 12,
                    fontSize: 12
                  }}>
                    <div style={{ fontWeight: 600, color: "#1e40af", marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                      <BookOpen size={14} />
                      Cursos Recomendados
                    </div>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {message.coursesData.cursos_sugeridos?.map((curso, idx) => (
                        <li key={idx} style={{ color: "#1e40af", marginBottom: 2 }}>{curso}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <div style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "linear-gradient(to bottom right, #3b82f6, #6366f1)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  <Bot size={16} style={{ color: "white" }} />
                </div>
                <div style={{ display: "flex", gap: 3 }}>
                  <div style={{ width: 6, height: 6, backgroundColor: "#3b82f6", borderRadius: "50%", animation: "bounce 1s infinite" }}></div>
                  <div style={{ width: 6, height: 6, backgroundColor: "#3b82f6", borderRadius: "50%", animation: "bounce 1s infinite 0.1s" }}></div>
                  <div style={{ width: 6, height: 6, backgroundColor: "#3b82f6", borderRadius: "50%", animation: "bounce 1s infinite 0.2s" }}></div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: 12, borderTop: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                style={{
                  flex: 1,
                  border: "1px solid #d1d5db",
                  borderRadius: 6,
                  padding: "8px 12px",
                  fontSize: 13,
                  outline: "none"
                }}
                placeholder="Pregunta sobre tus cursos..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                disabled={loading}
              />
              <button
                onClick={handleSendMessage}
                disabled={!input.trim() || loading}
                style={{
                  background: loading || !input.trim() ? "#d1d5db" : "linear-gradient(to bottom right, #3b82f6, #6366f1)",
                  color: "white",
                  border: "none",
                  borderRadius: 6,
                  padding: "8px 12px",
                  cursor: loading || !input.trim() ? "not-allowed" : "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      <p style={{ textAlign: "center", color: "#888", marginTop: 24 }}>
        Click en un ramo para ver relaciones • Arrastra para reorganizar • Marca cursos aprobados
      </p>
    </div>
  );
}

export default function MallaCurricular() {
  const location = useLocation();
  
  if (!location.state || !location.state.mallaData) {
    return <Navigate to="/selection" replace />;
  }

  return <MallaContent data={location.state.mallaData} />;
}