"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Check, Lock, KeyRound, Copy } from "lucide-react";
import * as bip39 from "bip39"; 

const UMK_SALT_BYTES = 32;

interface UMKData {
  umk_salt: string;
  master_passphrase_verifier: string;
}

const generateMnemonic = (): string => {
  return bip39.generateMnemonic(256);
};

const deriveUMKData = async (masterKey: string): Promise<UMKData> => {
  const saltBuffer = new Uint8Array(UMK_SALT_BYTES);
  window.crypto.getRandomValues(saltBuffer);
  const umk_salt = btoa(String.fromCharCode(...saltBuffer));

  const encoder = new TextEncoder();
  const data = encoder.encode(masterKey + umk_salt);
  const hashBuffer = await window.crypto.subtle.digest("SHA-256", data);
  const verifierMock = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)));

  return {
    umk_salt,
    master_passphrase_verifier: verifierMock,
  };
};

const generateAndWrapOVK = (umk: string): string => {
  console.log("Wrapping OVK with UMK:", umk);
  const mockOVK = "random_org_vault_key_12345";
  return btoa(mockOVK + "-wrapped-with-umk");
};

const MasterPassphraseSetup: React.FC = () => {
  const [mnemonic, setMnemonic] = useState<string | null>(null);
  const [salt, setSalt] = useState<string | null>(null);
  const [verifier, setVerifier] = useState<string | null>(null);
  const [ovkWrapped, setOvkWrapped] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [orgName, setOrgName] = useState("My First Org");
  const [status, setStatus] = useState("");

  const runSetup = useCallback(async () => {
    setStatus("Generating Master Key...");
    const generatedMnemonic = generateMnemonic();
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

  const handleCopy = async () => {
    if (mnemonic) {
      try {
        await navigator.clipboard.writeText(mnemonic);
        setCopySuccess(true);
        setTimeout(() => setCopySuccess(false), 3000);
      } catch (err) {
        console.error("Copy failed:", err);
      }
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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-2xl bg-white shadow-2xl rounded-xl p-6 sm:p-10 border border-indigo-100">
        <div className="flex items-center space-x-3 mb-6">
          <Lock className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-extrabold text-gray-900">
            Zero-Knowledge Setup
          </h1>
        </div>

        <p className="mb-6 text-gray-700">
          Your account is secure, but you must first generate your{" "}
          <strong>Master Key</strong>. This 24-word phrase is the{" "}
          <em>only</em> way to decrypt your organization’s secrets.
          <strong className="text-red-600 font-semibold block mt-2">
            Copy and store it safely. We never store this key.
          </strong>
        </p>

        <div className="mb-8">
          <label
            htmlFor="orgName"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Organization Name
          </label>
          <input
            id="orgName"
            type="text"
            value={orgName}
            onChange={(e) => setOrgName(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-indigo-500 focus:border-indigo-500 transition duration-150"
            placeholder="e.g., Acme Corporation"
            disabled={isProcessing}
          />
        </div>

        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-5 mb-8">
          <div className="flex items-center justify-between mb-3">
            <span className="text-lg font-bold text-indigo-800 flex items-center">
              <KeyRound className="w-5 h-5 mr-2" />
              Your 24-Word Master Key
            </span>
            <button
              onClick={handleCopy}
              className={`px-3 py-1.5 text-sm font-semibold rounded-full flex items-center transition-colors ${
                copySuccess
                  ? "bg-green-500 text-white"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
              disabled={!isReady || isProcessing}
            >
              {copySuccess ? (
                <Check className="w-4 h-4 mr-1" />
              ) : (
                <Copy className="w-4 h-4 mr-1" />
              )}
              {copySuccess ? "Copied!" : "Copy Key"}
            </button>
          </div>

          <div className="font-mono text-sm break-words p-3 bg-white border border-indigo-300 rounded-lg select-all">
            {mnemonic || "Generating Key..."}
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-6">
          Status: <span className="font-medium text-indigo-600">{status}</span>
        </p>

        <button
          onClick={handleConfirmAndStore}
          disabled={!isReady || isProcessing || !copySuccess}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-200"
        >
          {isProcessing
            ? "Creating Organization..."
            : "I have copied the key. Confirm & Create Organization"}
        </button>
        {!copySuccess && (
          <p className="mt-3 text-sm text-center text-red-500">
            You must click the &quot;Copy Key&quot; button before proceeding.
          </p>
        )}
      </div>
    </div>
  );
};

export default MasterPassphraseSetup;
