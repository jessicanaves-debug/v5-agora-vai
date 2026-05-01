"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Loader2,
  ImageIcon,
  X,
  RefreshCw,
  Check,
  ClipboardCopy,
} from "lucide-react";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";

export interface AnalysisOptions {
  exemplo1: string;
  exemplo2: string;
}

interface ChartSectionProps {
  /** Identificador do slot (apenas para diferenciar) */
  slot: "agressores" | "heatmap";
  /** Texto exibido como label do upload */
  uploadLabel: string;
  /** Imagem (preview blob URL) */
  preview: string;
  /** Conteúdo atual selecionado (texto da análise) */
  analysisText: string;
  /** Opções de análise da IA (2 exemplos) */
  options: AnalysisOptions | null;
  /** Está rodando a IA agora */
  loading: boolean;

  onFile: (file: File) => void;
  onClear: () => void;
  onSelectAnalysis: (text: string) => void;
  onEditAnalysis: (text: string) => void;
  onRegenerate: () => void;
}

export function ChartSection({
  slot,
  uploadLabel,
  preview,
  analysisText,
  options,
  loading,
  onFile,
  onClear,
  onSelectAnalysis,
  onEditAnalysis,
  onRegenerate,
}: ChartSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const dropRef = useRef<HTMLDivElement>(null);
  const [isFocused, setIsFocused] = useState(false);

  function handleFile(file: File | null | undefined) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Apenas imagens (PNG, JPG, etc.)");
      return;
    }
    onFile(file);
  }

  // Paste global quando o componente está focado
  useEffect(() => {
    if (!isFocused) return;
    function onPaste(e: ClipboardEvent) {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of items) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            handleFile(file);
            toast.success("Imagem colada!");
            return;
          }
        }
      }
    }
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFocused]);

  return (
    <div className="space-y-3">
      {/* ─── ANÁLISE NO TOPO (igual ao modelo PDF) ─── */}
      <div className="rounded-xl border border-border bg-white p-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="text-emerald" />
            <p className="text-xs font-semibold text-primary uppercase tracking-wide">
              Análise estratégica
            </p>
            {loading && (
              <span className="inline-flex items-center gap-1.5 text-[11px] text-emerald font-medium">
                <Loader2 size={11} className="animate-spin" />
                Gerando análise com IA...
              </span>
            )}
            {!loading && options && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald uppercase tracking-wide">
                <Check size={10} /> Gerado por IA
              </span>
            )}
          </div>
          {options && !loading && (
            <button
              type="button"
              onClick={onRegenerate}
              className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
            >
              <RefreshCw size={11} />
              Regenerar
            </button>
          )}
        </div>

        {/* Texto editável */}
        <textarea
          value={analysisText}
          onChange={(e) => onEditAnalysis(e.target.value)}
          rows={slot === "heatmap" ? 3 : 4}
          placeholder={
            preview
              ? "A análise aparecerá aqui assim que a IA terminar..."
              : "Cole, arraste ou clique abaixo para enviar o gráfico. A IA gerará a análise automaticamente aqui em cima."
          }
          className="w-full rounded-lg border border-border px-3 py-2 text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
          disabled={loading}
        />

        {/* Picker das duas opções */}
        {options && !loading && (
          <div className="mt-3">
            <p className="text-[11px] font-semibold text-primary uppercase tracking-wide mb-1.5">
              Outras opções sugeridas
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(["exemplo1", "exemplo2"] as const).map((key, idx) => {
                const text = options[key];
                const isSelected = analysisText.trim() === text.trim();
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => onSelectAnalysis(text)}
                    className={cn(
                      "text-left rounded-lg border p-2.5 transition-all text-xs leading-relaxed",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                        : "border-border bg-white hover:border-primary/40 hover:bg-primary/5"
                    )}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-primary">
                        Exemplo {idx + 1}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-semibold text-emerald flex items-center gap-1">
                          <Check size={10} /> Em uso
                        </span>
                      )}
                    </div>
                    <p className="text-foreground">{text}</p>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ─── UPLOAD DE IMAGEM ─── */}
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1.5">
          {uploadLabel}
        </p>
        <div
          ref={dropRef}
          tabIndex={0}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onClick={() => {
            setIsFocused(true);
            if (!preview) inputRef.current?.click();
          }}
          onDrop={(e) => {
            e.preventDefault();
            handleFile(e.dataTransfer.files[0]);
          }}
          onDragOver={(e) => e.preventDefault()}
          className={cn(
            "relative rounded-xl border-2 border-dashed transition-all overflow-hidden outline-none",
            preview
              ? "border-primary/30 bg-primary/5 cursor-default"
              : "border-border hover:border-primary/50 hover:bg-primary/5 cursor-pointer flex flex-col items-center justify-center gap-1.5 py-6",
            isFocused && !preview && "ring-2 ring-primary/20 border-primary/60 bg-primary/5"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => handleFile(e.target.files?.[0])}
          />

          {preview ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={preview} alt={uploadLabel} className="w-full object-contain max-h-56" />
              {loading && (
                <div className="absolute inset-0 bg-primary/85 flex flex-col items-center justify-center gap-2 backdrop-blur-sm">
                  <Loader2 size={28} className="text-white animate-spin" />
                  <p className="text-white text-sm font-medium">Analisando gráfico com IA...</p>
                  <p className="text-white/70 text-xs">Gerando duas opções de análise</p>
                </div>
              )}
              {!loading && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onClear();
                  }}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
                  title="Remover imagem"
                >
                  <X size={12} />
                </button>
              )}
            </>
          ) : (
            <>
              <ImageIcon size={20} className="text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Clique, arraste ou cole (Ctrl+V)
              </p>
              <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                <ClipboardCopy size={10} />
                Após clicar aqui, dê Ctrl+V para colar print da área de transferência
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
