import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const PetriNetNFC = () => {
  // État initial des places
  const initialPlaces = {
    P1: { id: 'P1', name: 'Attente badge', tokens: 1, x: 350, y: 50 },
    P2: { id: 'P2', name: 'Badge scanné', tokens: 0, x: 350, y: 150 },
    P3: { id: 'P3', name: 'Badge valide', tokens: 0, x: 250, y: 250 },
    P4: { id: 'P4', name: 'Badge invalide', tokens: 0, x: 450, y: 250 },
    P5: { id: 'P5', name: 'Porte fermée', tokens: 1, x: 150, y: 350 },
    P6: { id: 'P6', name: 'Porte ouverte', tokens: 0, x: 250, y: 450 },
    P7: { id: 'P7', name: 'Timer actif', tokens: 0, x: 350, y: 450 },
    P8: { id: 'P8', name: 'Accès refusé', tokens: 0, x: 450, y: 350 },
    P9: { id: 'P9', name: 'Passage détecté', tokens: 0, x: 250, y: 550 }
  };

  const transitions = {
    T1: { id: 'T1', name: 'Scanner badge', x: 350, y: 100 },
    T2: { id: 'T2', name: 'Valider badge', x: 250, y: 200 },
    T3: { id: 'T3', name: 'Rejeter badge', x: 450, y: 200 },
    T4: { id: 'T4', name: 'Ouvrir porte', x: 200, y: 400 },
    T5: { id: 'T5', name: 'Signal refus', x: 450, y: 300 },
    T6: { id: 'T6', name: 'Démarrer timer', x: 300, y: 400 },
    T7: { id: 'T7', name: 'Détecter passage', x: 250, y: 500 },
    T8: { id: 'T8', name: 'Fermer (timeout)', x: 100, y: 500 },
    T9: { id: 'T9', name: 'Fermer après passage', x: 200, y: 600 },
    T10: { id: 'T10', name: 'Reset refus', x: 350, y: 300 }
  };

  // Matrices Pre et Post
  const preMatrix = {
    T1: { P1: 1, P2: 0, P3: 0, P4: 0, P5: 0, P6: 0, P7: 0, P8: 0, P9: 0 },
    T2: { P1: 0, P2: 1, P3: 0, P4: 0, P5: 0, P6: 0, P7: 0, P8: 0, P9: 0 },
    T3: { P1: 0, P2: 1, P3: 0, P4: 0, P5: 0, P6: 0, P7: 0, P8: 0, P9: 0 },
    T4: { P1: 0, P2: 0, P3: 1, P4: 0, P5: 1, P6: 0, P7: 0, P8: 0, P9: 0 },
    T5: { P1: 0, P2: 0, P3: 0, P4: 1, P5: 0, P6: 0, P7: 0, P8: 0, P9: 0 },
    T6: { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0, P6: 1, P7: 0, P8: 0, P9: 0 },
    T7: { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0, P6: 1, P7: 0, P8: 0, P9: 0 },
    T8: { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0, P6: 0, P7: 1, P8: 0, P9: 0 },
    T9: { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0, P6: 0, P7: 0, P8: 0, P9: 1 },
    T10: { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0, P6: 0, P7: 0, P8: 1, P9: 0 }
  };

  const postMatrix = {
    T1: { P1: 0, P2: 1, P3: 0, P4: 0, P5: 0, P6: 0, P7: 0, P8: 0, P9: 0 },
    T2: { P1: 0, P2: 0, P3: 1, P4: 0, P5: 0, P6: 0, P7: 0, P8: 0, P9: 0 }, // Changé P1: 1 vers P1: 0
    T3: { P1: 0, P2: 0, P3: 0, P4: 1, P5: 0, P6: 0, P7: 0, P8: 0, P9: 0 }, // Changé P1: 1 vers P1: 0
    T4: { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0, P6: 1, P7: 0, P8: 0, P9: 0 },
    T5: { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0, P6: 0, P7: 0, P8: 1, P9: 0 },
    T6: { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0, P6: 0, P7: 1, P8: 0, P9: 0 },
    T7: { P1: 0, P2: 0, P3: 0, P4: 0, P5: 0, P6: 0, P7: 0, P8: 0, P9: 1 },
    T8: { P1: 1, P2: 0, P3: 0, P4: 0, P5: 1, P6: 0, P7: 0, P8: 0, P9: 0 }, // Ajouté P1: 1
    T9: { P1: 1, P2: 0, P3: 0, P4: 0, P5: 1, P6: 0, P7: 0, P8: 0, P9: 0 }, // Ajouté P1: 1
    T10: { P1: 1, P2: 0, P3: 0, P4: 0, P5: 0, P6: 0, P7: 0, P8: 0, P9: 0 }
  };

  // Définition des arcs
  const arcs = [
    { from: 'P1', to: 'T1' }, { from: 'T1', to: 'P2' },
    { from: 'P2', to: 'T2' }, { from: 'T2', to: 'P3' }, { from: 'T2', to: 'P1' },
    { from: 'P2', to: 'T3' }, { from: 'T3', to: 'P4' }, { from: 'T3', to: 'P1' },
    { from: 'P3', to: 'T4' }, { from: 'P5', to: 'T4' }, { from: 'T4', to: 'P6' },
    { from: 'P4', to: 'T5' }, { from: 'T5', to: 'P8' },
    { from: 'P6', to: 'T6' }, { from: 'T6', to: 'P7' },
    { from: 'P6', to: 'T7' }, { from: 'T7', to: 'P9' },
    { from: 'P7', to: 'T8' }, { from: 'T8', to: 'P5' },
    { from: 'P9', to: 'T9' }, { from: 'T9', to: 'P5' },
    { from: 'P8', to: 'T10' }, { from: 'T10', to: 'P1' }
  ];

  // États React
  const [places, setPlaces] = useState(initialPlaces);
  const [isAutoMode, setIsAutoMode] = useState(false);
  const [speed, setSpeed] = useState(1500);
  const [log, setLog] = useState(['Système initialisé - En attente...']);
  const [showManualControls, setShowManualControls] = useState(true);
  const [animatingTransition, setAnimatingTransition] = useState(null);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const autoInterval = useRef(null);

  // Vérifier si une transition est activable
  const isTransitionEnabled = useCallback((transitionId) => {
    const preConditions = preMatrix[transitionId];
    for (let placeId in preConditions) {
      if (places[placeId].tokens < preConditions[placeId]) {
        return false;
      }
    }
    return true;
  }, [places]);

  // Déclencher une transition avec animation
  const fireTransition = useCallback((transitionId) => {
    if (!isTransitionEnabled(transitionId)) {
      return false;
    }

    // Animation de la transition
    setAnimatingTransition(transitionId);
    setTimeout(() => setAnimatingTransition(null), 800);

    setPlaces(prevPlaces => {
      const newPlaces = { ...prevPlaces };
      
      // Consommer les jetons (Pre)
      const preConditions = preMatrix[transitionId];
      for (let placeId in preConditions) {
        newPlaces[placeId] = {
          ...newPlaces[placeId],
          tokens: newPlaces[placeId].tokens - preConditions[placeId]
        };
      }
      
      // Produire les jetons (Post)
      const postConditions = postMatrix[transitionId];
      for (let placeId in postConditions) {
        newPlaces[placeId] = {
          ...newPlaces[placeId],
          tokens: newPlaces[placeId].tokens + postConditions[placeId]
        };
      }
      
      return newPlaces;
    });

    // Ajouter au log
    const message = `${new Date().toLocaleTimeString()}: Transition ${transitionId} (${transitions[transitionId].name}) tirée`;
    setLog(prevLog => [...prevLog.slice(-9), message]);

    return true;
  }, [isTransitionEnabled, transitions]);

  // Réinitialiser le système
  const reset = useCallback(() => {
    setPlaces(initialPlaces);
    setIsAutoMode(false);
    if (autoInterval.current) {
      clearInterval(autoInterval.current);
    }
    setLog([`${new Date().toLocaleTimeString()}: Système réinitialisé`]);
  }, []);

  // Fonctions pour les matrices
  const getIncidenceMatrix = () => {
    const placesList = Object.keys(places);
    const transitionsList = Object.keys(transitions);
    const incidenceMatrix = {};
    
    transitionsList.forEach(t => {
      incidenceMatrix[t] = {};
      placesList.forEach(p => {
        incidenceMatrix[t][p] = postMatrix[t][p] - preMatrix[t][p];
      });
    });
    
    return incidenceMatrix;
  };

  const renderMatrix = (matrix, title) => {
    const placesList = Object.keys(places);
    const transitionsList = Object.keys(transitions);

    return (
      <div className="matrix">
        <h4>{title}</h4>
        <div className="matrix-scroll">
          <table className="matrix-table">
            <thead>
              <tr>
                <th></th>
                {placesList.map(p => <th key={p}>{p}</th>)}
              </tr>
            </thead>
            <tbody>
              {transitionsList.map(t => (
                <tr key={t}>
                  <th>{t}</th>
                  {placesList.map(p => {
                    const value = matrix[t][p];
                    const bgColor = value > 0 ? '#d4edda' : value < 0 ? '#f8d7da' : '#f8f9fa';
                    return (
                      <td key={p} style={{ backgroundColor: bgColor }}>
                        {value}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const getEnabledTransitions = () => {
    return Object.keys(transitions).filter(t => isTransitionEnabled(t));
  };

  // Composant Place
  const Place = ({ place }) => {
    const handleMouseDown = (e) => {
      if (e.button !== 0) return; // Seulement clic gauche
      const rect = e.currentTarget.getBoundingClientRect();
      const networkRect = e.currentTarget.parentElement.getBoundingClientRect();
      setDraggedElement({ type: 'place', id: place.id });
      setDragOffset({
        x: e.clientX - networkRect.left - place.x,
        y: e.clientY - networkRect.top - place.y
      });
    };

    return (
      <div
        className={`place ${place.tokens > 0 ? 'active' : ''}`}
        style={{
          position: 'absolute',
          left: place.x,
          top: place.y,
          backgroundColor: place.tokens > 0 ? '#90EE90' : '#FFB6C1',
          transform: place.tokens > 0 ? 'scale(1.1)' : 'scale(1)',
          cursor: 'move',
          userSelect: 'none'
        }}
        onMouseDown={handleMouseDown}
      >
        <div className="place-id">{place.id}</div>
        <div className="place-name">{place.name}</div>
        <div className="tokens">
          {place.tokens > 0 && (
            <span className="token-count">●{place.tokens}</span>
          )}
        </div>
      </div>
    );
  };

  // Composant Transition
  const Transition = ({ transition }) => {
    const enabled = isTransitionEnabled(transition.id);
    const isAnimating = animatingTransition === transition.id;
    
    const handleMouseDown = (e) => {
      if (e.button !== 0) return; // Seulement clic gauche
      e.stopPropagation();
      const networkRect = e.currentTarget.parentElement.getBoundingClientRect();
      setDraggedElement({ type: 'transition', id: transition.id });
      setDragOffset({
        x: e.clientX - networkRect.left - transition.x,
        y: e.clientY - networkRect.top - transition.y
      });
    };

    const handleClick = (e) => {
      if (draggedElement) return; // Ne pas déclencher si on vient de déplacer
      if (enabled) fireTransition(transition.id);
    };
    
    return (
      <div
        className={`transition ${enabled ? 'enabled' : 'disabled'} ${isAnimating ? 'firing' : ''}`}
        style={{
          position: 'absolute',
          left: transition.x,
          top: transition.y,
          backgroundColor: enabled ? '#FFD700' : '#D3D3D3',
          cursor: 'move',
          userSelect: 'none'
        }}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
      >
        <div className="transition-id">{transition.id}</div>
        <div className="transition-name">{transition.name}</div>
      </div>
    );
  };

  // Composant Arc
const Arc = ({ from, to }) => {
  const fromNode = places[from] || transitions[from];
  const toNode = places[to] || transitions[to];
  
  if (!fromNode || !toNode) return null;

  const x1 = fromNode.x + 40; // Centre du nœud source
  const y1 = fromNode.y + 25;
  const x2 = toNode.x + 40; // Centre du nœud destination
  const y2 = toNode.y + 25;

  // Calcul de l'angle pour la flèche
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const arrowLength = 10;
  const arrowAngle = Math.PI / 6;

  // Ajuster le point d'arrivée au bord du nœud (rayon ~40px)
  const nodeRadius = 35;
  const endX = x2 - nodeRadius * Math.cos(angle);
  const endY = y2 - nodeRadius * Math.sin(angle);

  // Points de la flèche
  const arrowX1 = endX - arrowLength * Math.cos(angle - arrowAngle);
  const arrowY1 = endY - arrowLength * Math.sin(angle - arrowAngle);
  const arrowX2 = endX - arrowLength * Math.cos(angle + arrowAngle);
  const arrowY2 = endY - arrowLength * Math.sin(angle + arrowAngle);

  return (
    <g className="arc">
      <line x1={x1} y1={y1} x2={endX} y2={endY} stroke="#333" strokeWidth="2" />
      <polygon
        points={`${endX},${endY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
        fill="#333"
      />
    </g>
  );
};

  // Mode automatique
  const startAutoMode = useCallback(() => {
    setIsAutoMode(true);
    autoInterval.current = setInterval(() => {
      const enabledTransitions = Object.keys(transitions).filter(t => {
        const preConditions = preMatrix[t];
        for (let placeId in preConditions) {
          if (places[placeId]?.tokens < preConditions[placeId]) {
            return false;
          }
        }
        return true;
      });

      if (enabledTransitions.length > 0) {
        const randomTransition = enabledTransitions[Math.floor(Math.random() * enabledTransitions.length)];
        fireTransition(randomTransition);
      }
    }, speed);
  }, [speed, transitions, places, fireTransition]);

  const stopAutoMode = useCallback(() => {
    setIsAutoMode(false);
    if (autoInterval.current) {
      clearInterval(autoInterval.current);
    }
    setLog(prevLog => [...prevLog, `${new Date().toLocaleTimeString()}: Mode automatique arrêté`]);
  }, []);

  // Scénarios prédéfinis
  const runScenario = useCallback((valid = true) => {
    reset();
    setTimeout(() => {
      const delays = [500, 1000, 1000, 1000, 1000];
      let step = 0;

      const executeStep = () => {
        setTimeout(() => {
          switch (step) {
            case 0:
              fireTransition('T1'); // Scanner badge
              break;
            case 1:
              fireTransition(valid ? 'T2' : 'T3'); // Validation ou rejet
              break;
            case 2:
              fireTransition(valid ? 'T4' : 'T5'); // Ouvrir porte ou refus
              break;
            case 3:
              if (valid) {
                fireTransition('T7'); // Passage détecté
              } else {
                fireTransition('T10'); // Reset
                return;
              }
              break;
            case 4:
              if (valid) {
                fireTransition('T9'); // Fermer après passage
              }
              return;
          }
          step++;
          if (step <= (valid ? 4 : 3)) {
            executeStep();
          }
        }, delays[step] || 1000);
      };

      executeStep();
    }, 100);
  }, [reset, fireTransition]);

  // Nettoyage
  useEffect(() => {
    return () => {
      if (autoInterval.current) {
        clearInterval(autoInterval.current);
      }
    };
  }, []);

  return (
    <div className="petri-app">
      <h1>🏠 Système de Contrôle d'Accès NFC - Réseau de Petri</h1>
      
      <div className="container">
        <div className="left-panel">
          <h3>Visualisation du Réseau</h3>
          <div 
            className="petri-network "
            style={{ position: 'relative', cursor: draggedElement ? 'grabbing' : 'default' ,minHeight: '100vh'}}
            onMouseMove={(e) => {
              if (!draggedElement) return;
              
              const rect = e.currentTarget.getBoundingClientRect();
              const newX = e.clientX - rect.left - dragOffset.x;
              const newY = e.clientY - rect.top - dragOffset.y;
              
              if (draggedElement.type === 'place') {
                setPlaces(prev => ({
                  ...prev,
                  [draggedElement.id]: {
                    ...prev[draggedElement.id],
                    x: Math.max(0, Math.min(newX, 720)),
                    y: Math.max(0, Math.min(newY, 350))
                  }
                }));
              } else {
                // Pour les transitions, on modifie directement l'objet
                transitions[draggedElement.id].x = Math.max(0, Math.min(newX, 720));
                transitions[draggedElement.id].y = Math.max(0, Math.min(newY, 370));
              }
            }}
            onMouseUp={() => {
              setDraggedElement(null);
            }}
            onMouseLeave={() => {
              setDraggedElement(null);
            }}
          >
            <svg width="800" height="400" className="network-svg">
              {/* Rendu des arcs en premier (arrière-plan) */}
              {arcs.map((arc, index) => (
                <Arc key={index} from={arc.from} to={arc.to} />
              ))}
            </svg>
            
            {/* Rendu des places */}
            {Object.values(places).map(place => (
              <Place key={place.id} place={place} />
            ))}
            
            {/* Rendu des transitions */}
            {Object.values(transitions).map(transition => (
              <Transition key={transition.id} transition={transition} />
            ))}
          </div>
        </div>
        
        <div className="right-panel">
          <div className="controls">
            <h3>Contrôles de Simulation</h3>
            <div className="mode-selector">
              <button 
                className={`button ${showManualControls ? 'active' : ''}`}
                onClick={() => {
                  stopAutoMode();
                  setShowManualControls(true);
                }}
              >
                Mode Manuel
              </button>
              <button 
                className={`button ${!showManualControls ? 'active' : ''}`}
                onClick={() => setShowManualControls(false)}
              >
                Mode Automatique
              </button>
              <button className="button danger" onClick={reset}>
                Reset
              </button>
            </div>
            
            <div className="scenario-buttons">
              <button 
                className="button success" 
                onClick={() => runScenario(true)}
              >
                🟢 Accès Autorisé
              </button>
              <button 
                className="button danger" 
                onClick={() => runScenario(false)}
              >
                🔴 Accès Refusé
              </button>
            </div>
            
            {showManualControls ? (
              <div className="manual-controls">
                <h4>Transitions Activables:</h4>
                <div className="enabled-transitions">
                  {getEnabledTransitions().length > 0 ? (
                    getEnabledTransitions().map(t => (
                      <div 
                        key={t}
                        className="transition-item"
                        onClick={() => fireTransition(t)}
                      >
                        <strong>{t}</strong>: {transitions[t].name}
                      </div>
                    ))
                  ) : (
                    <div className="no-transitions">
                      Aucune transition activable
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="auto-controls">
                <button 
                  className="button"
                  onClick={startAutoMode}
                  disabled={isAutoMode}
                >
                  ▶️ Démarrer Auto
                </button>
                <button 
                  className="button danger"
                  onClick={stopAutoMode}
                  disabled={!isAutoMode}
                >
                  ⏹️ Arrêter
                </button>
                <div className="speed-control">
                  <label>
                    Vitesse: 
                    <input
                      type="range"
                      min="500"
                      max="3000"
                      value={speed}
                      onChange={(e) => setSpeed(parseInt(e.target.value))}
                    />
                    <span>{(speed/1000).toFixed(1)}s</span>
                  </label>
                </div>
              </div>
            )}
          </div>
          
          <div className="state-info">
            <h3>État Actuel du Système</h3>
            <div className="state-vector">
              {Object.values(places).map(place => (
                <div 
                  key={place.id}
                  className={`token-count ${place.tokens > 0 ? 'active' : ''}`}
                >
                  {place.id}: {place.tokens}
                </div>
              ))}
            </div>
            
            <div className="log-container">
              <h4>Journal des événements</h4>
              {log.map((entry, index) => (
                <div key={index} className="log-entry">
                  {entry}
                </div>
              ))}
            </div>
          </div>
          
          <div className="matrices">
            <h3>Matrices du Réseau de Petri</h3>
            <div className="matrix-container">
              {renderMatrix(preMatrix, 'Matrice Pre')}
              {renderMatrix(postMatrix, 'Matrice Post')}
              {renderMatrix(getIncidenceMatrix(), 'Matrice d\'Incidence')}
              <div className="matrix">
                <h4>Vecteur d'État</h4>
                <div className="matrix-scroll">
                  <table className="matrix-table">
                    <thead>
                      <tr><th>Place</th><th>Jetons</th></tr>
                    </thead>
                    <tbody>
                      {Object.values(places).map(place => (
                        <tr key={place.id}>
                          <td><strong>{place.id}</strong></td>
                          <td className={place.tokens > 0 ? 'has-tokens' : ''}>
                            {place.tokens}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <PetriNetNFC />
    </div>
  );
}

export default App;