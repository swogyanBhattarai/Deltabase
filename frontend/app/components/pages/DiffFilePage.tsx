"use client";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { fileService } from "../lib/services/FileService";
import { DiffLineDTO, DiffResponseDTO } from "@/app/components/types/types";
import { FileIcon } from "../icons/icons";

type RowKind = "equal" | "delete" | "insert" | "change-old" | "change-new";

interface FlatRow {
  kind: RowKind;
  oldLineNo: number | null;
  newLineNo: number | null;
  content: string;
}

const STYLE: Record<
  RowKind,
  { rowBg: string; gutterBg: string; prefix: string; prefixColor: string }
> = {
  equal: {
    rowBg: "",
    gutterBg: "bg-[#161b22]",
    prefix: " ",
    prefixColor: "text-[#8b949e]",
  },
  delete: {
    rowBg: "bg-[#4b1113]",
    gutterBg: "bg-[#3c0d0e]",
    prefix: "-",
    prefixColor: "text-[#f85149]",
  },
  insert: {
    rowBg: "bg-[#0d4429]",
    gutterBg: "bg-[#0d3320]",
    prefix: "+",
    prefixColor: "text-[#3fb950]",
  },
  "change-old": {
    rowBg: "bg-[#4b1113]",
    gutterBg: "bg-[#3c0d0e]",
    prefix: "-",
    prefixColor: "text-[#f85149]",
  },
  "change-new": {
    rowBg: "bg-[#0d4429]",
    gutterBg: "bg-[#0d3320]",
    prefix: "+",
    prefixColor: "text-[#3fb950]",
  },
};

function Row({ row }: { row: FlatRow }) {
  const s = STYLE[row.kind];
  return (
    <tr className={s.rowBg}>
      <td
        className={`${s.gutterBg} select-none text-right pr-3 pl-2 text-[#8b949e] w-12 border-r border-[#21262d] font-mono text-xs leading-5`}
      >
        {row.oldLineNo ?? ""}
      </td>
      <td
        className={`${s.gutterBg} select-none text-right pr-3 pl-2 text-[#8b949e] w-12 border-r border-[#21262d] font-mono text-xs leading-5`}
      >
        {row.newLineNo ?? ""}
      </td>
      <td
        className={`${s.gutterBg} select-none px-2 w-5 ${s.prefixColor} border-r border-[#21262d] font-mono text-xs leading-5`}
      >
        {s.prefix}
      </td>
      <td className="px-4 font-mono text-xs leading-5 whitespace-pre-wrap break-all text-[#e6edf3]">
        {row.content}
      </td>
    </tr>
  );
}

function buildRows(data: DiffResponseDTO): {
  rows: FlatRow[];
  added: number;
  removed: number;
  changed: number;
} {
  const { original, updated, diff } = data;

  const deltasBySource = new Map<number, DiffLineDTO>();
  const insertsBefore = new Map<number, DiffLineDTO[]>();

  for (const d of diff) {
    const t = d.type.toUpperCase();
    if (t === "INSERT") {
      const arr = insertsBefore.get(d.sourcePos) ?? [];
      arr.push(d);
      insertsBefore.set(d.sourcePos, arr);
    } else {
      deltasBySource.set(d.sourcePos, d);
    }
  }

  const rows: FlatRow[] = [];
  let added = 0,
    removed = 0,
    changed = 0;
  let newLine = 1;

  const skipOriginal = new Set<number>();

  // mark which original indices are swallowed by deltas
  for (const d of diff) {
    const t = d.type.toUpperCase();
    if (t === "DELETE" || t === "CHANGE") {
      for (let i = 0; i < d.source.length; i++) {
        skipOriginal.add(d.sourcePos + i);
      }
    }
  }

  // injecting deltas at the right positions
  for (let oi = 0; oi <= original.length; oi++) {
    const inserts = insertsBefore.get(oi) ?? [];
    for (const ins of inserts) {
      for (let j = 0; j < ins.target.length; j++) {
        rows.push({
          kind: "insert",
          oldLineNo: null,
          newLineNo: newLine++,
          content: ins.target[j],
        });
      }
      added += ins.target.length;
    }

    if (oi === original.length) break;

    const delta = deltasBySource.get(oi);

    if (delta) {
      const t = delta.type.toUpperCase();

      if (t === "DELETE") {
        for (let j = 0; j < delta.source.length; j++) {
          rows.push({
            kind: "delete",
            oldLineNo: oi + 1 + j,
            newLineNo: null,
            content: delta.source[j],
          });
        }
        removed += delta.source.length;
        oi += delta.source.length - 1;
      } else if (t === "CHANGE") {
        for (let j = 0; j < delta.source.length; j++) {
          rows.push({
            kind: "change-old",
            oldLineNo: oi + 1 + j,
            newLineNo: null,
            content: delta.source[j],
          });
        }
        for (let j = 0; j < delta.target.length; j++) {
          rows.push({
            kind: "change-new",
            oldLineNo: null,
            newLineNo: newLine++,
            content: delta.target[j],
          });
        }
        changed += Math.max(delta.source.length, delta.target.length);
        oi += delta.source.length - 1;
      }
    } else if (!skipOriginal.has(oi)) {
      // plain unchanged line
      rows.push({
        kind: "equal",
        oldLineNo: oi + 1,
        newLineNo: newLine++,
        content: original[oi],
      });
    }
  }

  return { rows, added, removed, changed };
}

export default function FileDiffPage() {
  const params = useParams();
  const projectId = Number(params.projectId);
  const fileId = Number(params.fileId);
  const fileName = (params.fileName as string) ?? "file";

  const [data, setData] = useState<DiffResponseDTO | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await fileService.generateFileDiff(projectId, fileId);
        setData(data);
      } catch {
        setError("Cannot generate file diff.");
      } finally {
        setLoading(false);
      }
    })();
  }, [projectId, fileId]);

  const result = data ? buildRows(data) : null;
  const { rows = [], added = 0, removed = 0, changed = 0 } = result ?? {};

  return (
    <main className="min-h-screen bg-[#0d1117] text-[#e6edf3] font-sans">
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-[#e6edf3]">
              File changes
            </h1>
            <p className="text-sm text-[#8b949e] mt-0.5">
              Showing diff for 1 file
            </p>
          </div>
          <div className="flex items-center gap-4 text-sm font-mono">
            <span className="text-[#3fb950]">+{added}</span>
            <span className="text-[#f85149]">-{removed}</span>
            {changed > 0 && <span className="text-[#d29922]">~{changed}</span>}
          </div>
        </div>

        {!loading && !error && data && (
          <div className="border border-[#30363d] rounded-md overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#161b22] border-b border-[#30363d]">
              <div className="flex items-center gap-2">
                <FileIcon />
                <span className="text-sm font-mono text-[#e6edf3]">
                  {fileName}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-mono text-[#8b949e]">
                  <span className="text-[#3fb950]">+{added}</span>
                  {" / "}
                  <span className="text-[#f85149]">-{removed}</span>
                  {changed > 0 && (
                    <>
                      {" "}
                      / <span className="text-[#d29922]">~{changed}</span>
                    </>
                  )}
                </span>
              </div>
            </div>

            <div className="flex text-[10px] text-[#8b949e] font-mono bg-[#161b22] border-b border-[#21262d] select-none">
              <div className="w-12 px-3 py-1 border-r border-[#21262d] text-center">
                old
              </div>
              <div className="w-12 px-3 py-1 border-r border-[#21262d] text-center">
                new
              </div>
              <div className="w-5 px-2 py-1 border-r border-[#21262d]" />
              <div className="px-4 py-1 flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-[#3fb950] inline-block" />{" "}
                  added
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-[#f85149] inline-block" />{" "}
                  deleted
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-sm bg-[#d29922] inline-block" />{" "}
                  modified
                </span>
              </div>
            </div>

            {rows.length === 0 ? (
              <div className="px-6 py-10 text-center text-sm text-[#8b949e] bg-[#0d1117]">
                No differences found — files are identical.
              </div>
            ) : (
              <div className="overflow-x-auto bg-[#0d1117]">
                <table className="w-full border-collapse">
                  <tbody>
                    {rows.map((row, i) => (
                      <Row key={i} row={row} />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {loading && (
          <div className="flex items-center justify-center py-20 text-sm text-[#8b949e]">
            <svg
              className="animate-spin mr-2 w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="3"
                strokeOpacity="0.25"
              />
              <path
                d="M12 2a10 10 0 0 1 10 10"
                stroke="currentColor"
                strokeWidth="3"
                strokeLinecap="round"
              />
            </svg>
            Loading diff...
          </div>
        )}

        {error && (
          <div className="px-4 py-3 bg-red-950/50 border border-red-700 rounded-md text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>
    </main>
  );
}
