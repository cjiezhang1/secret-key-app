import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

// 强制动态渲染，确保每次请求都是最新的
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // 使用 LPOP 命令：从左侧弹出一个密钥。
    // 弹出的同时，Redis 会自动删除它，这就是“阅后即焚”的原理。
    const key = await kv.lpop('my_secret_keys');

    // 如果 key 为空（列表空了）
    if (!key) {
      return NextResponse.json({ success: false, message: '请联系管理员' });
    }

    // 成功拿到密钥并返回给前端
    return NextResponse.json({ success: true, key: key });
    
  } catch (error) {
    console.error("KV Error:", error);
    return NextResponse.json({ success: false, message: '服务器错误' }, { status: 500 });
  }
}