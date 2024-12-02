import { atom, createStore } from "jotai";

export const playerIsOnDialogue = atom(false);
export const currentLevelAtom = atom("level_01");
export const curretPositionsPlayerAtom = atom(null);
export const enemiesDefeated = atom([]);
export const isMusicPlaying = atom(false);
export const store = createStore(); 

// Átomo para almacenar las preguntas usadas
export const usedSecurityQuestions = atom([]);