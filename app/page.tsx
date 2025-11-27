"use client";

import { useState, useRef, FormEvent } from "react";

export default function Home() {
  const [nickname, setNickname] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("图片大小不能超过5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImagePreview(result);
        // 提取 base64 数据（去除 data:image/xxx;base64, 前缀）
        const base64Data = result.split(",")[1];
        setImageBase64(base64Data);
        setError("");
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!nickname.trim()) {
      setError("请输入昵称");
      return;
    }

    if (!imageBase64) {
      setError("请上传头像图片");
      return;
    }

    setIsLoading(true);
    setAnalysisResult("");
    setError("");

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nickname,
          imageBase64,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "分析请求失败");
      }

      // 处理流式响应
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const data = line.slice(6);
              if (data === "[DONE]") continue;

              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || "";
                setAnalysisResult((prev) => prev + content);
              } catch {
                // 忽略解析错误
              }
            }
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "分析失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setNickname("");
    setImagePreview(null);
    setImageBase64(null);
    setAnalysisResult("");
    setError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 dark:from-gray-900 dark:via-purple-900 dark:to-gray-900 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        {/* 标题区域 */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-500 to-blue-500 bg-clip-text text-transparent mb-3">
            ✨ AI头像分析
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg">
            上传你的头像，输入你的昵称，让文心5.0大模型解读你的性格与特点！
          </p>
        </div>

        {/* 主表单卡片 */}
        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 头像上传区域 */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                📷 上传头像
              </label>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="relative cursor-pointer group"
              >
                <div
                  className={`w-full h-48 rounded-2xl border-2 border-dashed transition-all duration-300 flex items-center justify-center overflow-hidden
                    ${imagePreview
                      ? "border-purple-400 bg-purple-50 dark:bg-purple-900/30"
                      : "border-gray-300 dark:border-gray-600 hover:border-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                    }`}
                >
                  {imagePreview ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={imagePreview}
                      alt="头像预览"
                      className="w-full h-full object-contain"
                    />
                  ) : (
                    <div className="text-center">
                      <div className="text-5xl mb-2">🖼️</div>
                      <p className="text-gray-500 dark:text-gray-400">
                        点击上传头像图片
                      </p>
                      <p className="text-sm text-gray-400 dark:text-gray-500">
                        支持 JPG、PNG 格式，最大 5MB
                      </p>
                    </div>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
            </div>

            {/* 昵称输入 */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200">
                ✨ 你的昵称
              </label>
              <input
                type="text"
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                placeholder="请输入你的昵称..."
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                maxLength={20}
              />
            </div>

            {/* 错误提示 */}
            {error && (
              <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800">
                <p className="text-red-600 dark:text-red-400 text-sm">
                  ⚠️ {error}
                </p>
              </div>
            )}

            {/* 按钮组 */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 transform
                  ${isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                  }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg
                      className="animate-spin h-5 w-5"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    分析中...
                  </span>
                ) : (
                  "🚀 开始分析"
                )}
              </button>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-3 rounded-xl font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
              >
                🔄 重置
              </button>
            </div>
          </form>
        </div>

        {/* 分析结果区域 */}
        {analysisResult && (
          <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg rounded-3xl shadow-xl p-8 animate-fade-in">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
              <span>📊</span> 分析结果
            </h2>
            <div className="prose prose-purple dark:prose-invert max-w-none">
              <div className="text-gray-700 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                {analysisResult}
              </div>
            </div>
          </div>
        )}

        {/* 页脚说明 */}
        <div className="text-center mt-8 text-sm text-gray-500 dark:text-gray-400">
          <p>🤖 由文心 5.0 多模态大模型提供支持</p>
          <p className="mt-1">分析结果仅供娱乐参考，请勿当真 ~</p>
        </div>
      </div>
    </div>
  );
}
