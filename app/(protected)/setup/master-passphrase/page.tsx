"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Check, Lock, KeyRound, Copy, AlertCircle, Shield, EyeOff, Eye } from "lucide-react";
import OrgCreationForm from "@/components/ui/org-creation-form";
import { deriveUMKData, generateAndWrapOVK, generateMnemonicPassphrase } from "@/utils/client-crypto";
import { useClipboard } from "@/hooks/useClipboard";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const MasterPassphraseSetup: React.FC = () => {

  const router = useRouter();

  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [salt, setSalt] = useState<string | null>(null);
  const [verifier, setVerifier] = useState<string | null>(null);
  const [ovkWrapped, setOvkWrapped] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [orgName, setOrgName] = useState("");
  const [status, setStatus] = useState("");
  const [showKey, setShowKey] = useState(true);
  const { isCopied, copy } = useClipboard({ successDuration: 3000 });

  const runSetup = useCallback(async () => {
    setStatus("Generating Master Key...");
    const generatedMnemonic = generateMnemonicPassphrase();
    setMnemonic(generatedMnemonic);
    try {
      setStatus("Deriving Encryption Keys...");
      const umkData = await deriveUMKData(generatedMnemonic);
      setSalt(umkData.umk_salt);
      setVerifier(umkData.master_passphrase_verifier);
      const wrappedOVK = generateAndWrapOVK("mock_umk_from_derivation");
      setOvkWrapped(wrappedOVK);
      setStatus("Ready. Please copy your Master Key.");
    } catch (error) {
      setStatus("Error during key derivation. Check console.");
      console.error(error);
    }
  }, []);

  useEffect(() => {
    if (!mnemonic) {
      runSetup();
    }
  }, [mnemonic, runSetup]);

  const handleCopy = () => {
    if (mnemonic) {
      copy(mnemonic);
    }
  };

  const handleConfirmAndStore = async () => {
    if (!mnemonic || !salt || !verifier || isProcessing || !orgName) return;
    setIsProcessing(true);
    setStatus("Sending secrets metadata and creating organization...");
    try {
      const response = await fetch("/api/setup/passphrase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          umk_salt: salt,
          master_passphrase_verifier: verifier,
          ovk_wrapped_for_user: ovkWrapped,
          org_name: orgName,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setStatus(`Success! Org created: ${data.orgId}. Redirecting...`);
        console.log("Setup successful, server response:", data);
        toast.success("Organization created successfully!");
        // redirect(`/app/org/${data.orgId}/vaults`);
        router.push('/dashboard')

      } else {
        const errorData = await response.json();
        setStatus(`API Error: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      setStatus("Network or client-side error during API call.");
      console.error("API call failed:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const isReady = mnemonic && salt && verifier && ovkWrapped;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-900 to-gray-800 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-gray-800 shadow-2xl rounded-2xl p-6 sm:p-10 border border-gray-700 relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center space-x-3 mb-6">
            <div className="p-2 bg-indigo-500/20 rounded-lg">
              <Shield className="w-8 h-8 text-indigo-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">
                Zero-Knowledge Setup
              </h1>
              <p className="text-sm text-gray-400 mt-0.5">End-to-end encrypted security</p>
            </div>
          </div>

          <div className="mb-8 bg-gradient-to-r from-amber-900/30 to-orange-900/30 border border-amber-700/50 rounded-xl p-5 backdrop-blur-sm">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
              <div className="text-sm">
                <p className="text-gray-200 leading-relaxed">
                  Your account is secure, but you must first generate your{" "}
                  <strong className="text-amber-300">Master Key</strong>. This 24-word phrase is the{" "}
                  <strong className="text-amber-200">only</strong> way to decrypt your organizations secrets.
                </p>
                <p className="text-red-400 font-semibold mt-3 flex items-center">
                  <Lock className="w-4 h-4 mr-2" />
                  Copy and store it safely. We never store this key.
                </p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <OrgCreationForm setOrgName={setOrgName} />
          </div>

          <div className="bg-gradient-to-br from-indigo-900/40 to-purple-900/40 border border-indigo-700/50 rounded-xl p-6 mb-8 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <span className="text-lg font-bold text-indigo-300 flex items-center">
                <KeyRound className="w-5 h-5 mr-2" />
                Your 24-Word Master Key
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setShowKey(!showKey)}
                  className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-gray-700/50"
                  disabled={!isReady || isProcessing}
                >
                  {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <button
                  onClick={handleCopy}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg flex items-center transition-all duration-200 ${
                    isCopied
                      ? "bg-green-600 text-white shadow-lg shadow-green-500/50"
                      : "bg-indigo-600 text-white hover:bg-indigo-500 shadow-lg shadow-indigo-500/50"
                  }`}
                  disabled={!isReady || isProcessing}
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 mr-2" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Key
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className={`font-mono text-sm break-words p-4 bg-gray-900/70 border border-gray-700 rounded-lg transition-all duration-200 ${
              showKey ? 'text-gray-200 select-all' : 'text-transparent select-none blur-sm'
            }`}>
              {mnemonic || "Generating your secure master key..."}
            </div>

            {!showKey && (
              <p className="text-xs text-gray-400 mt-2 text-center">Click the eye icon to reveal your key</p>
            )}
          </div>

          <button
            onClick={handleConfirmAndStore}
            disabled={!isReady || isProcessing || !isCopied || !orgName.trim()}
            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-semibold py-4 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-500/50 hover:shadow-indigo-500/70 hover:scale-[1.02] active:scale-[0.98]"
          >
            {isProcessing ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating Organization...
              </span>
            ) : (
              "I have copied the key. Confirm & Create Organization"
            )}
          </button>

          {!isCopied && isReady && (
            <p className="mt-4 text-sm text-center text-amber-400 flex items-center justify-center">
              <AlertCircle className="w-4 h-4 mr-2" />
              You must copy your master key before proceeding
            </p>
          )}

          <div className="mt-6 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
            <p className="text-xs text-gray-400 text-center leading-relaxed">
              🔒 Your master key is generated locally and never transmitted to our servers. 
              Store it in a secure password manager or offline location.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MasterPassphraseSetup;
