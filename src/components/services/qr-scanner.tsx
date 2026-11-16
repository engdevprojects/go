"use client";

import { Camera, CameraOff, ScanLine } from "lucide-react";
import { useEffect, useRef, useState, type RefObject } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

type ScannerState =
  | { status: "idle" }
  | { status: "starting" }
  | { status: "scanning" }
  | { status: "denied" }
  | { status: "unavailable"; reason: string }
  | { status: "error" };

const SCAN_INTERVAL_MS = 300;

/** Stops the scan loop and every camera track held in the given refs. */
function releaseCamera(timerRef: RefObject<number | null>, streamRef: RefObject<MediaStream | null>): void {
  if (timerRef.current !== null) window.clearInterval(timerRef.current);
  timerRef.current = null;
  streamRef.current?.getTracks().forEach((track) => track.stop());
  streamRef.current = null;
}

interface QrScannerProps {
  /** Receives raw decoded text. Treat it as untrusted input. */
  onResult: (rawValue: string) => void;
}

/**
 * Camera QR scanner for the web.
 *
 * - Explains why the camera is needed before asking (permission at point of use).
 * - Needs a secure context (HTTPS or localhost) and `getUserMedia`.
 * - Decodes with the browser's `BarcodeDetector` where available; elsewhere it
 *   explains the limitation so the visitor can use the manual/test path.
 * - Always stops the camera when done or unmounted.
 */
export function QrScanner({ onResult }: QrScannerProps) {
  const [state, setState] = useState<ScannerState>({ status: "idle" });
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<number | null>(null);
  const mountedRef = useRef(false);

  function stop() {
    releaseCamera(timerRef, streamRef);
  }

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      releaseCamera(timerRef, streamRef);
    };
  }, []);

  async function start() {
    if (!window.isSecureContext || !navigator.mediaDevices?.getUserMedia) {
      setState({ status: "unavailable", reason: "Camera access needs a secure (HTTPS) page and a browser that supports it." });
      return;
    }
    const Detector = window.BarcodeDetector;
    if (!Detector) {
      setState({
        status: "unavailable",
        reason: "This browser can't decode QR codes from the camera (no BarcodeDetector support). Use a merchant code or a test code instead.",
      });
      return;
    }

    setState({ status: "starting" });
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
      // The visitor may have left while the permission prompt was open — never leave the camera on.
      if (!mountedRef.current) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }
      streamRef.current = stream;
      const video = videoRef.current;
      if (!video) {
        stop();
        return;
      }
      video.srcObject = stream;
      await video.play();
      const detector = new Detector({ formats: ["qr_code"] });
      setState({ status: "scanning" });
      let detecting = false;
      timerRef.current = window.setInterval(async () => {
        // Skip a tick if the previous detection is still running (slow devices).
        if (detecting || video.readyState < 2) return;
        detecting = true;
        try {
          const codes = await detector.detect(video);
          const first = codes[0];
          if (first && timerRef.current !== null) {
            stop();
            setState({ status: "idle" });
            onResult(first.rawValue);
          }
        } catch {
          // A single failed frame is normal (e.g. blur); keep scanning.
        } finally {
          detecting = false;
        }
      }, SCAN_INTERVAL_MS);
    } catch (error) {
      stop();
      const name = error instanceof DOMException ? error.name : "";
      if (name === "NotAllowedError" || name === "SecurityError") setState({ status: "denied" });
      else if (name === "NotFoundError" || name === "OverconstrainedError") setState({ status: "unavailable", reason: "No camera was found on this device." });
      else setState({ status: "error" });
    }
  }

  function cancel() {
    stop();
    setState({ status: "idle" });
  }

  const showVideo = state.status === "starting" || state.status === "scanning";

  return (
    <div className="space-y-4">
      <div className="relative flex aspect-square w-full max-w-sm items-center justify-center overflow-hidden rounded-xl bg-brand sm:aspect-[4/3]">
        <video ref={videoRef} muted playsInline className={showVideo ? "absolute inset-0 size-full object-cover" : "hidden"} aria-label="Camera preview" />
        {state.status === "scanning" ? (
          <div aria-hidden="true" className="absolute inset-10 rounded-lg border-2 border-accent shadow-[0_0_0_9999px_rgb(0_0_0/_0.5)]" />
        ) : null}
        {state.status === "starting" ? (
          <div className="relative flex flex-col items-center gap-2 text-ink-inverse">
            <Spinner size="lg" label="Starting camera" />
            <span className="text-sm">Starting camera…</span>
          </div>
        ) : null}
        {!showVideo ? (
          <div className="flex flex-col items-center gap-2 px-6 text-center text-ink-inverse/80">
            {state.status === "denied" || state.status === "unavailable" ? <CameraOff className="size-10" aria-hidden="true" /> : <ScanLine className="size-10" aria-hidden="true" />}
            <span className="text-sm">Point the camera at a merchant&apos;s QR code</span>
          </div>
        ) : null}
      </div>

      <div aria-live="polite">
        {state.status === "idle" ? (
          <div className="space-y-3">
            <p className="type-caption text-ink-muted">
              We only use the camera to read a QR code. Nothing is recorded or uploaded, and the camera turns off as soon as a code is read.
            </p>
            <Button onClick={start}>
              <Camera aria-hidden="true" />
              Allow camera and scan
            </Button>
          </div>
        ) : null}
        {state.status === "scanning" ? (
          <div className="flex flex-wrap items-center gap-3">
            <p className="type-caption text-ink-muted">Scanning… hold steady.</p>
            <Button variant="outline" size="sm" onClick={cancel}>
              Stop camera
            </Button>
          </div>
        ) : null}
        {state.status === "denied" ? (
          <Alert tone="warning" title="Camera access was blocked" action={<Button variant="outline" size="sm" onClick={start}>Try again</Button>}>
            Allow camera access in your browser&apos;s site settings, or use a merchant code below.
          </Alert>
        ) : null}
        {state.status === "unavailable" ? (
          <Alert tone="info" title="Camera scanning isn't available here">
            {state.reason}
          </Alert>
        ) : null}
        {state.status === "error" ? (
          <Alert tone="danger" title="The camera couldn't start" action={<Button variant="outline" size="sm" onClick={start}>Try again</Button>}>
            Another app may be using it. You can also enter the merchant code instead.
          </Alert>
        ) : null}
      </div>
    </div>
  );
}
