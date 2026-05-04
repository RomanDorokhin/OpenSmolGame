import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, Save, ExternalLink } from "lucide-react";
import { toast } from "sonner";

interface APISettingsModalProps {
  onClose: () => void;
}

const FREE_MODELS = [
  { name: "DeepSeek V3", value: "deepseek-chat", provider: "deepseek", docs: "https://platform.deepseek.com" },
  { name: "Mistral 7B", value: "mistral-7b-instruct", provider: "mistral", docs: "https://console.mistral.ai" },
  { name: "Llama 2 70B", value: "meta-llama/llama-2-70b-chat", provider: "openrouter", docs: "https://openrouter.ai" },
  { name: "Neural Chat", value: "intel/neural-chat-7b", provider: "openrouter", docs: "https://openrouter.ai" },
  { name: "Qwen 72B", value: "qwen/qwen-72b-chat", provider: "openrouter", docs: "https://openrouter.ai" },
];

const PAID_MODELS = [
  { name: "GPT-4 Turbo", value: "gpt-4-turbo", provider: "openai", docs: "https://platform.openai.com" },
  { name: "GPT-4o", value: "gpt-4o", provider: "openai", docs: "https://platform.openai.com" },
  { name: "Claude 3.5 Sonnet", value: "claude-3-5-sonnet-20241022", provider: "anthropic", docs: "https://console.anthropic.com" },
  { name: "Gemini 2.0 Flash", value: "gemini-2.0-flash", provider: "gemini", docs: "https://ai.google.dev" },
];

const PROVIDERS_INFO: Record<string, { name: string; docs: string; freeKey?: string }> = {
  openrouter: { name: "OpenRouter", docs: "https://openrouter.ai", freeKey: "sk-or-v1-..." },
  deepseek: { name: "DeepSeek", docs: "https://platform.deepseek.com", freeKey: "sk-..." },
  mistral: { name: "Mistral", docs: "https://console.mistral.ai", freeKey: "..." },
  openai: { name: "OpenAI", docs: "https://platform.openai.com" },
  anthropic: { name: "Anthropic", docs: "https://console.anthropic.com" },
  gemini: { name: "Google Gemini", docs: "https://ai.google.dev" },
};

export default function APISettingsModal({ onClose }: APISettingsModalProps) {
  const [apiKey, setApiKey] = useState("");
  const [selectedModel, setSelectedModel] = useState("deepseek-chat");
  const [selectedProvider, setSelectedProvider] = useState("deepseek");
  const [isFree, setIsFree] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  const settingsQuery = trpc.apiSettings.get.useQuery();
  const updateSettingsMutation = trpc.apiSettings.update.useMutation({
    onSuccess: () => {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
      settingsQuery.refetch();
    },
  });

  useEffect(() => {
    if (settingsQuery.data) {
      setSelectedProvider(settingsQuery.data.selectedProvider || "deepseek");
      setSelectedModel(settingsQuery.data.selectedModel || "deepseek-chat");
      // Don't show the actual key for security
    }
  }, [settingsQuery.data]);

  const handleModelChange = (modelValue: string) => {
    setSelectedModel(modelValue);
    const model = [...FREE_MODELS, ...PAID_MODELS].find((m) => m.value === modelValue);
    if (model) {
      setSelectedProvider(model.provider);
      setIsFree(FREE_MODELS.some((m) => m.value === modelValue));
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      toast.error("Пожалуйста, введите API ключ");
      return;
    }

    // Save to localStorage for OpenGame API
    localStorage.setItem("opengame_api_key", apiKey);
    localStorage.setItem("opengame_provider", selectedProvider);
    localStorage.setItem("opengame_model", selectedModel);

    await updateSettingsMutation.mutateAsync({
      openaiKey: selectedProvider === "openai" ? apiKey : undefined,
      anthropicKey: selectedProvider === "anthropic" ? apiKey : undefined,
      geminiKey: selectedProvider === "gemini" ? apiKey : undefined,
      selectedProvider: selectedProvider as any,
      selectedModel,
    });

    toast.success("Настройки сохранены!");
    setTimeout(() => onClose(), 500);
  };

  const currentProvider = PROVIDERS_INFO[selectedProvider];
  const selectedModelObj = [...FREE_MODELS, ...PAID_MODELS].find((m) => m.value === selectedModel);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-card rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-border p-4 sticky top-0 bg-card">
          <h2 className="font-semibold text-lg">Настройка API</h2>
          <button onClick={onClose} className="btn-ghost p-1 hover:bg-muted rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Intro */}
          <div className="bg-muted/50 border border-border rounded-lg p-4">
            <p className="text-sm text-muted-foreground">
              💡 <strong>Совет:</strong> Начните с бесплатных моделей (DeepSeek, Mistral, Llama). Они работают отлично для генерации игр!
            </p>
          </div>

          {/* Model Selection */}
          <div>
            <label className="block text-sm font-semibold mb-3">Выберите модель</label>

            {/* Free Models */}
            <div className="mb-4">
              <p className="text-xs font-medium text-green-400 mb-2">✨ БЕСПЛАТНЫЕ МОДЕЛИ</p>
              <div className="grid grid-cols-1 gap-2">
                {FREE_MODELS.map((model) => (
                  <button
                    key={model.value}
                    onClick={() => handleModelChange(model.value)}
                    className={`text-left px-4 py-3 rounded-lg border transition-colors ${
                      selectedModel === model.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-muted/50 hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs opacity-75">{model.value}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Paid Models */}
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-2">💳 ПЛАТНЫЕ МОДЕЛИ</p>
              <div className="grid grid-cols-1 gap-2">
                {PAID_MODELS.map((model) => (
                  <button
                    key={model.value}
                    onClick={() => handleModelChange(model.value)}
                    className={`text-left px-4 py-3 rounded-lg border transition-colors ${
                      selectedModel === model.value
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border bg-muted/50 hover:bg-muted text-muted-foreground"
                    }`}
                  >
                    <div className="font-medium">{model.name}</div>
                    <div className="text-xs opacity-75">{model.value}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* API Key Input */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="block text-sm font-semibold">API Ключ для {currentProvider?.name}</label>
              <a
                href={currentProvider?.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
              >
                Получить ключ
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <Input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={currentProvider?.freeKey || "Введите ваш API ключ..."}
              className="input-base font-mono text-sm"
            />

            <p className="text-xs text-muted-foreground mt-2">
              {isFree ? "✅ Это бесплатная модель" : "💳 Требуется оплаченный аккаунт"}
            </p>
          </div>

          {/* Info Box */}
          <div className="bg-muted/30 border border-border rounded-lg p-4 space-y-2">
            <p className="text-sm font-medium">ℹ️ Как это работает:</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Выберите любую модель выше</li>
              <li>Введите ваш API ключ (найдёте по ссылке "Получить ключ")</li>
              <li>Нажмите "Сохранить"</li>
              <li>Начните писать промпты для создания игр!</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border p-4 flex gap-2 justify-end sticky bottom-0 bg-card">
          <Button onClick={onClose} className="btn-ghost">
            Отмена
          </Button>
          <Button
            onClick={handleSave}
            disabled={updateSettingsMutation.isPending || !apiKey.trim()}
            className="btn-primary flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {updateSettingsMutation.isPending ? "Сохранение..." : "Сохранить"}
          </Button>
        </div>

        {showSuccess && (
          <div className="fixed bottom-4 right-4 bg-green-500/20 border border-green-500/50 rounded-lg px-4 py-2 text-sm text-green-400">
            ✅ Настройки сохранены!
          </div>
        )}
      </div>
    </div>
  );
}
