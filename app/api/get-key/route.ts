import { kv } from '@vercel/kv';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    // 1. 获取用户在网页上输入的账号
    const body = await req.json();
    const account = body.account;

    if (!account) {
      return NextResponse.json({ success: false, reason: 'invalid_account' });
    }

    // 2. 去数据库里查一查这个账号的状态
    // 我们会在数据库里存类似 user_张三: "unused" (未使用)
    const accountStatus = await kv.get(`user_${account}`);

    if (!accountStatus) {
      // 数据库里根本没有这个账号（输错了或者你没设置）
      return NextResponse.json({ success: false, reason: 'invalid_account' });
    }

    if (accountStatus === 'used') {
      // 这个账号已经领过奖励了
      return NextResponse.json({ success: false, reason: 'already_used' });
    }

    // 3. 账号有效且未被使用，去库存里拿一个密钥
    const secretKey = await kv.lpop('my_secret_keys');

    if (secretKey) {
      // 4. 【关键】拿到密钥后，立刻把这个账号的状态改成 "used"（已使用）
      await kv.set(`user_${account}`, 'used');

      return NextResponse.json({ success: true, key: secretKey });
    } else {
      // 账号是对的，但是库存被领光了
      return NextResponse.json({ success: false, reason: 'empty' });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false, reason: 'error' });
  }
}