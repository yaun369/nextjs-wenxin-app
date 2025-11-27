import { NextRequest, NextResponse } from "next/server";

// 分析性格喜好的提示词
const ANALYSIS_PROMPT = `你是一位资深的心理分析师和性格解读专家，擅长通过用户的头像图片和昵称来分析其性格特征和喜好。

请根据用户提供的头像图片和昵称，进行全面而有趣的性格分析。分析要求：

1. **头像分析**：
   - 观察头像的整体风格（如真人照片、卡通形象、风景、动物、抽象艺术等）
   - 分析色彩偏好（暖色调/冷色调、明亮/深沉）
   - 注意构图特点和表达方式

2. **昵称解读**：
   - 分析昵称的语言风格（文艺/幽默/简约/个性等）
   - 解读昵称可能蕴含的深层含义
   - 推测用户的自我定位和期望形象

3. **综合性格画像**：
   - 性格类型（如外向/内向、理性/感性）
   - 核心性格特征（3-5个关键词）
   - 行为风格和处事方式

4. **兴趣喜好推测**：
   - 可能的爱好和兴趣领域
   - 审美偏好
   - 生活方式倾向

5. **社交特点**：
   - 社交风格和人际关系特点
   - 在群体中可能扮演的角色

6. **温馨小建议**：
   - 根据分析结果给出1-2条个性化的生活或社交建议

请用轻松有趣、富有洞察力的语言进行分析，让用户感到被理解和认可。分析要具体、有细节，但也要保持积极正面的基调。

注意：这是一个娱乐性质的分析，请确保内容友善、积极、有趣，避免任何负面或冒犯性的描述。

避免使用 markdown 格式，直接输出纯文本内容，段落直接换行。`;

export async function POST(request: NextRequest) {
  try {
    const { nickname, imageBase64 } = await request.json();

    if (!nickname || !imageBase64) {
      return NextResponse.json(
        { error: "缺少必要参数：昵称或图片" },
        { status: 400 }
      );
    }

    // 从环境变量获取 API Key
    const apiKey = process.env.WENXIN_API_KEY;

    if (!apiKey) {
      return NextResponse.json(
        { error: "服务端未配置 API Key，请在环境变量中设置 WENXIN_API_KEY" },
        { status: 500 }
      );
    }

    // 构建请求体
    const requestBody = {
      model: "ernie-5.0-thinking-preview", // 文心5.0多模态模型
      // model: "ernie-4.5-8k-preview", // 文心4.5多模态模型
      stream: true,
      enable_thinking: false,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image_url",
              image_url: {
                url: `data:image/jpeg;base64,${imageBase64}`,
              },
            },
            {
              type: "text",
              text: `${ANALYSIS_PROMPT}\n\n用户昵称：「${nickname}」\n\n请根据上面这张头像图片和昵称，进行有趣的性格分析。`,
            },
          ],
        },
      ],
    };

    // 调用文心大模型 API
    const response = await fetch(
      "https://qianfan.baidubce.com/v2/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("文心API错误:", errorText);
      return NextResponse.json(
        { error: `API调用失败: ${response.status}` },
        { status: response.status }
      );
    }

    // 返回流式响应
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader();
        if (!reader) {
          controller.close();
          return;
        }

        const decoder = new TextDecoder();

        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) {
              controller.enqueue(encoder.encode("data: [DONE]\n\n"));
              controller.close();
              break;
            }

            const chunk = decoder.decode(value, { stream: true });
            // 直接转发原始的 SSE 数据
            controller.enqueue(encoder.encode(chunk));
          }
        } catch (error) {
          console.error("流式读取错误:", error);
          controller.error(error);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("处理请求错误:", error);
    return NextResponse.json(
      { error: "服务器内部错误" },
      { status: 500 }
    );
  }
}
