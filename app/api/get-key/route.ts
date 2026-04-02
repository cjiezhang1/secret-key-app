import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. 获取来访者的 IP 地址（Vercel 会自动通过请求头传递这个信息）
    const ip = req.headers.get('x-forwarded-for') || 'unknown_ip';

    // 2. 去数据库查一查，这个 IP 之前领过吗？
    const hasClaimed = await kv.get(`claimed_${ip}`);
    
    if (hasClaimed) {
      // 如果查到了记录，说明是来"薅羊毛"的，直接拦截！
      return NextResponse.json({ success: false, reason: 'already_claimed' });
    }

    // 3. 如果没领过，尝试从数据库里拿出一个密钥
    const secretKey = await kv.lpop('my_secret_keys');

    if (secretKey) {
      // 4. 【关键一步】拿到密钥后，立刻在数据库里把这个 IP 记入黑名单！
      // （为了防止数据库爆满，我们可以设置这个 IP 记录 30 天后自动消失，或者永久保留）
      await kv.set(`claimed_${ip}`, 'true'); 

      return NextResponse.json({ success: true, key: secretKey });
    } else {
      // 数据库里没库存了
      return NextResponse.json({ success: false, reason: 'empty' });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, reason: 'error' });
  }
}