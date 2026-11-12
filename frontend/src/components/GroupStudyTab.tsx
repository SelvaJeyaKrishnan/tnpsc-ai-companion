"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  Copy,
  DoorOpen,
  Lock,
  Plus,
  Trophy,
  Users,
} from "lucide-react";
import { createRoom, getApiBaseUrl, getAuthToken, getRooms, joinRoom } from "@/lib/api";
import { StudyRoom } from "@/types";

interface GroupStudyTabProps {
  currentUserId: number;
  isGuestDemo?: boolean;
  onOpenAuthModal?: () => void;
}

export const GroupStudyTab: React.FC<GroupStudyTabProps> = ({
  currentUserId,
  isGuestDemo = false,
  onOpenAuthModal,
}) => {
  const [rooms, setRooms] = useState<StudyRoom[]>([]);
  const [activeRoom, setActiveRoom] = useState<StudyRoom | null>(null);
  const [showCreateModal, setShowCreateModal] = useState<boolean>(false);
  const [showJoinModal, setShowJoinModal] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  // Form states
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");
  const [newRoomDuration, setNewRoomDuration] = useState(50);
  const [newRoomPrivate, setNewRoomPrivate] = useState(false);
  const [newRoomPass, setNewRoomPass] = useState("");

  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinPassInput, setJoinPassInput] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [createError, setCreateError] = useState<string | null>(null);

  // In-room live state
  const [isFocusing, setIsFocusing] = useState<boolean>(true);
  const [liveCelebration, setLiveCelebration] = useState<string | null>(null);
  const [remainingSecs, setRemainingSecs] = useState<number>(50 * 60);

  const wsRef = useRef<WebSocket | null>(null);

  // Load public rooms
  const loadRooms = async () => {
    try {
      const data = await getRooms();
      setRooms(data);
    } catch (err) {
      console.error("Failed to load rooms:", err);
    }
  };

  useEffect(() => {
    loadRooms();
    const interval = setInterval(loadRooms, 15000);
    return () => clearInterval(interval);
  }, []);

  // WebSocket lifecycle when inside a room
  useEffect(() => {
    if (!activeRoom) {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      return;
    }

    setRemainingSecs(activeRoom.remaining_seconds ?? activeRoom.duration_minutes * 60);

    const apiBase = getApiBaseUrl();
    const wsHost = apiBase.replace(/^http/, "ws");

    const token = getAuthToken();
    const tokenQuery = token ? `?token=${encodeURIComponent(token)}` : "";
    const wsUrl = `${wsHost}/api/rooms/${activeRoom.room_code}/ws${tokenQuery}`;
    const socket = new WebSocket(wsUrl);
    wsRef.current = socket;

    socket.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === "ROOM_STATE") {
          setActiveRoom((prev) => (prev ? { ...prev, ...msg.payload } : prev));
          if (msg.payload.remaining_seconds !== undefined) {
            setRemainingSecs(msg.payload.remaining_seconds);
          }
        } else if (msg.type === "CELEBRATION") {
          setLiveCelebration(msg.payload.message);
          setTimeout(() => setLiveCelebration(null), 6000);
        }
      } catch {
        // ignore
      }
    };

    socket.onerror = (e) => {
      console.warn("Room WebSocket error:", e);
    };

    // Shared timer countdown
    const timerInterval = setInterval(() => {
      setRemainingSecs((prev) => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearInterval(timerInterval);
      socket.close();
      wsRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeRoom?.room_code]);

  // Handle Create Room
  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    setCreateError(null);

    if (isGuestDemo) {
      setCreateError("Please sign in or register to create a live study room.");
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    try {
      const created = await createRoom({
        name: newRoomName,
        description: newRoomDesc,
        duration_minutes: newRoomDuration,
        is_private: newRoomPrivate,
        pass_code: newRoomPrivate ? newRoomPass : undefined,
      });

      setShowCreateModal(false);
      setNewRoomName("");
      setNewRoomDesc("");
      setCreateError(null);
      loadRooms();
      setActiveRoom(created);
    } catch (err: unknown) {
      setCreateError((err as Error).message || "Failed to create room");
    }
  };

  // Handle Join Room
  const handleJoinWithCode = async (code: string, pass?: string) => {
    setJoinError(null);

    if (isGuestDemo) {
      setJoinError("Please sign in or register to join an interactive study room.");
      if (onOpenAuthModal) onOpenAuthModal();
      return;
    }

    try {
      const joined = await joinRoom(code.toUpperCase(), pass);
      setActiveRoom(joined);
      setShowJoinModal(false);
      setJoinCodeInput("");
      setJoinPassInput("");
    } catch (err: unknown) {
      setJoinError((err as Error).message || "Could not join room");
    }
  };

  // Toggle my focus status in room
  const toggleFocusStatus = () => {
    const nextStatus = !isFocusing;
    setIsFocusing(nextStatus);

    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && activeRoom) {
      wsRef.current.send(
        JSON.stringify({
          action: "UPDATE_STATUS",
          user_id: currentUserId,
          is_focusing: nextStatus,
          subject: "General Studies",
          topic: "Group Study Revision",
        })
      );
    }
  };

  // Announce session completion in room
  const triggerRoomSessionComplete = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN && activeRoom) {
      wsRef.current.send(
        JSON.stringify({
          action: "SESSION_COMPLETE",
          user_id: currentUserId,
          minutes: 25,
        })
      );
    }
  };

  // Copy code helper
  const copyRoomCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2500);
  };

  // Format room clock
  const roomMin = Math.floor(remainingSecs / 60);
  const roomSec = remainingSecs % 60;
  const roomTimeStr = `${String(roomMin).padStart(2, "0")}:${String(roomSec).padStart(2, "0")}`;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Toast celebration in room */}
      {liveCelebration && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-amber-500 text-slate-950 font-bold shadow-xl border border-amber-300 animate-in slide-in-from-top duration-300">
          <Trophy className="w-5 h-5 fill-current shrink-0" />
          <span className="text-xs">{liveCelebration}</span>
        </div>
      )}

      {/* If inside active room */}
      {activeRoom ? (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Active Room Top Banner */}
          <div className="p-6 md:p-8 rounded-3xl bg-slate-900 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-2.5 w-2.5 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                </span>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Live Synchronized Room
                </span>
              </div>
              <h2 className="text-2xl font-bold mt-1 tracking-tight">{activeRoom.name}</h2>
              <p className="text-xs text-slate-400 mt-1 max-w-xl">
                {activeRoom.description || "Silent collaborative focus room for TNPSC aspirants."}
              </p>

              <div className="flex items-center gap-2 mt-4">
                <span className="text-xs text-slate-400">Invite Code:</span>
                <button
                  onClick={() => copyRoomCode(activeRoom.room_code)}
                  className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-mono font-bold text-amber-300 border border-slate-700 transition-colors"
                >
                  <span>{activeRoom.room_code}</span>
                  <Copy className="w-3.5 h-3.5" />
                </button>
                {copiedCode && <span className="text-[11px] text-emerald-400 font-semibold">Copied!</span>}
              </div>
            </div>

            {/* Room Shared Timer Widget */}
            <div className="flex flex-col items-center md:items-end justify-center w-full md:w-auto">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Shared Room Clock
              </div>
              <div className="font-mono text-5xl font-bold tracking-tight text-white tabular-nums mt-1">
                {roomTimeStr}
              </div>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={toggleFocusStatus}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    isFocusing
                      ? "bg-emerald-500 hover:bg-emerald-600 text-slate-950 shadow-md shadow-emerald-500/20"
                      : "bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700"
                  }`}
                >
                  {isFocusing ? "🟢 Focusing" : "☕ On Break"}
                </button>
                <button
                  onClick={triggerRoomSessionComplete}
                  className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  Log Cycle
                </button>
                <button
                  onClick={() => setActiveRoom(null)}
                  className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/40 text-rose-300 hover:text-rose-200 text-xs font-semibold border border-slate-700 transition-colors"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>

          {/* Participants & Leaderboard */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Live Participants List */}
            <div className="lg:col-span-2 p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>Aspirants in Room ({activeRoom.participants?.length || 1})</span>
                </h3>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Real-time sync active
                </span>
              </div>

              <div className="divide-y divide-slate-100">
                {(activeRoom.participants || []).map((p, idx) => (
                  <div key={idx} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 text-white flex items-center justify-center font-bold text-xs shrink-0">
                        {p.username.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-800 flex items-center gap-2">
                          <span className="truncate">{p.username}</span>
                          {p.user_id === currentUserId && (
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-semibold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate">
                          {p.current_subject} • {p.current_topic}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold ${
                          p.is_focusing
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                            : "bg-amber-50 text-amber-700 border border-amber-200"
                        }`}
                      >
                        {p.is_focusing ? "Focusing" : "Break"}
                      </span>
                      <span className="text-xs font-mono font-bold text-slate-700">
                        {p.completed_sessions} cycles
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Room Leaderboard Widget */}
            <div className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                  Session Leaderboard
                </h3>
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Most productive participants in this study room session.
              </p>

              <div className="space-y-3">
                {(activeRoom.participants || []).slice(0, 5).map((p, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="font-bold text-xs text-slate-400 w-4">#{idx + 1}</span>
                      <span className="text-xs font-semibold text-slate-800 truncate max-w-[110px]">
                        {p.username}
                      </span>
                    </div>
                    <div className="text-xs font-mono font-bold text-blue-600">
                      {p.total_minutes || p.completed_sessions * 25} mins
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Room Browse / Lobby View */
        <div className="space-y-6">
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-lg">
            <div>
              <div className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                Virtual Study Hall
              </div>
              <h2 className="text-xl font-bold mt-1">Study With Fellow Aspirants</h2>
              <p className="text-xs text-slate-300 mt-1 max-w-lg">
                Join focused study rooms with shared timers, peer accountability, and live leaderboards.
              </p>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setShowJoinModal(true)}
                className="px-4 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-white text-xs font-bold border border-slate-700 transition-all"
              >
                Join with Code
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-md shadow-blue-600/30 transition-all"
              >
                <Plus className="w-4 h-4" />
                <span>Create Room</span>
              </button>
            </div>
          </div>

          {/* Active Public Rooms Grid */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                Active Study Rooms
              </h3>
              <span className="text-xs text-slate-500 font-medium">
                {rooms.length} rooms available
              </span>
            </div>

            {rooms.length === 0 ? (
              <div className="p-12 text-center rounded-3xl bg-white border border-slate-200">
                <Users className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">No Active Rooms Yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Create the first study room and invite your peers to study together!
                </p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                >
                  Create Study Room
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {rooms.map((room) => (
                  <div
                    key={room.id}
                    className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                          {room.room_code}
                        </span>
                        {room.is_private ? (
                          <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">
                            <Lock className="w-3 h-3" /> Private
                          </span>
                        ) : (
                          <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            Public
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-bold text-slate-900 tracking-tight">
                        {room.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                        {room.description || "Focused revision session."}
                      </p>
                    </div>

                    <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs text-slate-600">
                        <Users className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-semibold">{room.participants_count || 1} studying</span>
                      </div>
                      <button
                        onClick={() => {
                          if (room.is_private) {
                            setJoinCodeInput(room.room_code);
                            setJoinPassInput("");
                            setJoinError(null);
                            setShowJoinModal(true);
                          } else {
                            handleJoinWithCode(room.room_code);
                          }
                        }}
                        className="flex items-center gap-1 px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs transition-colors"
                      >
                        <DoorOpen className="w-3.5 h-3.5" />
                        <span>Join</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal: Create Room */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <form
            onSubmit={handleCreateRoom}
            className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200"
          >
            <h3 className="text-base font-bold text-slate-900 mb-4">Create Study Room</h3>

            {createError && (
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium mb-3 border border-rose-200">
                {createError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TNPSC General Tamil Morning Batch"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Description / Topic Focus
                </label>
                <input
                  type="text"
                  placeholder="e.g. Silent focus on Ilakkanam and Aptitude formulas"
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Timer Duration (minutes)
                </label>
                <input
                  type="number"
                  min="15"
                  max="180"
                  value={newRoomDuration}
                  onChange={(e) => setNewRoomDuration(Number(e.target.value))}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-slate-700">Make Room Private</span>
                  <input
                    type="checkbox"
                    checked={newRoomPrivate}
                    onChange={(e) => setNewRoomPrivate(e.target.checked)}
                    className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                  />
                </div>

                {newRoomPrivate && (
                  <input
                    type="text"
                    required
                    placeholder="Set 4-digit pass code"
                    value={newRoomPass}
                    onChange={(e) => setNewRoomPass(e.target.value)}
                    className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mt-2"
                  />
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                Create & Enter
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Modal: Join with Code */}
      {showJoinModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <h3 className="text-base font-bold text-slate-900 mb-3">Join Study Room</h3>
            <p className="text-xs text-slate-500 mb-4">
              Enter the 6-character room code shared by your peer.
            </p>

            {joinError && (
              <div className="p-2.5 rounded-xl bg-rose-50 text-rose-700 text-xs font-medium mb-3 border border-rose-200">
                {joinError}
              </div>
            )}

            <div className="space-y-3">
              <input
                type="text"
                placeholder="ROOM CODE (e.g. 7KA9X2)"
                value={joinCodeInput}
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                className="w-full text-center font-mono font-bold text-sm tracking-widest p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 uppercase"
              />
              <input
                type="password"
                placeholder="Pass code (if private)"
                value={joinPassInput}
                onChange={(e) => setJoinPassInput(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowJoinModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleJoinWithCode(joinCodeInput, joinPassInput)}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
