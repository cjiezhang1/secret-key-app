'use client';
import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Loader2, Copy, Check, Ban, User, XCircle, Zap } from 'lucide-react';

export default function Home() {
  const [status, setStatus] = useState('idle'); // idle | loading | success | invalid | used | empty
  const [secretKey, setSecretKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [account, setAccount] = useState(''); 

  const fetchKey = async () => {
    if (!account.trim()) return; 
    setStatus('loading');
    
    try {
      const response = await fetch('/api/get-key', { 
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: account.trim() })
      });
      const data = await response.json();

      if (data.success) {
        setSecretKey(data.key);
        setStatus('success');
      } else {
        if (data.reason === 'invalid_account') setStatus('invalid');
        else if (data.reason === 'already_used') setStatus('used');
        else setStatus('empty');
      }
    } catch (error) {
      setStatus('empty'); 
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(secretKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const reset = () => {
    setStatus('idle');
    setAccount('');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-white/30">
      
      {/* 极简背景光晕效果 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-10">
        
        {/* --- 新增的主标题和副标题区域 --- */}
        <div className="text-center flex flex-col items-center space-y-3animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="flex items-center space-x-2.5">
            <Zap className="w-7 h-7 text-white/90" />
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tighter bg-gradient-to-b from-white to-white/70 bg-clip-text text-transparent">
              10元密钥体验卡
            </h1>
          </div>
          <p className="text-base md:text-lg text-white/50 font-medium tracking-wide">
            可生成100张香蕉2-4k大图
          </p>
        </div>
        {/* ---------------------------------- */}

        {/* 核心交互区 */}
        <div className="w-full bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 backdrop-blur-sm shadow-2xl flex flex-col items-center min-h-[220px] justify-center transition-all duration-500">
          
          {(status === 'idle' || status === 'loading') && (
            <div className="w-full flex flex-col items-center space-y-6 animate-in fade-in zoom-in-95">
              <div className="w-full relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-white/30" />
                </div>
                <input
                  type="text"
                  value={account}
                  onChange={(e) => setAccount(e.target.value)}
                  placeholder="请输入您的专属提取码"
                  className="w-full bg-black border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder-white/30 focus:outline-none focus:border-white/30 focus:ring-1 focus:ring-white/30 transition-all text-center tracking-widest font-mono"
                  disabled={status === 'loading'}
                />
              </div>

              <button
                onClick={fetchKey}
                disabled={status === 'loading' || !account.trim()} 
                className={`group relative overflow-hidden rounded-full px-8 py-4 transition-all duration-300 w-full flex items-center justify-center space-x-2
                  ${(status === 'loading' || !account.trim())
                    ? 'bg-white/10 text-white/50 cursor-not-allowed' 
                    : 'bg-white text-black hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95'}`}
              >
                {status === 'loading' ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /><span className="font-medium tracking-wide">验证中...</span></>
                ) : (
                  <><KeyRound className="w-5 h-5" /><span className="font-medium tracking-wide">提取密钥</span></>
                )}
              </button>
            </div>
          )}

          {status === 'invalid' && (
            <div className="flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                <XCircle className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-lg font-medium text-white/90">提取码无效</p>
              <p className="text-sm text-white/40 text-center">请检查您输入的账号是否正确<br/>或联系管理员开通</p>
              <button onClick={reset} className="mt-4 px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm">重新输入</button>
            </div>
          )}

          {status === 'used' && (
            <div className="flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-2">
                <Ban className="w-8 h-8 text-white/40" />
              </div>
              <p className="text-lg font-medium text-white/90">该账号已领取</p>
              <p className="text-sm text-white/40 text-center">此专属提取码已被使用<br/>无法重复提取</p>
              <button onClick={reset} className="mt-4 px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm">更换账号</button>
            </div>
          )}

          {status === 'success' && (
            <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center text-sm text-white/40 mb-2 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 mr-1" />
                提取成功！请复制下来妥善保管，不再出现第二次。
              </div>
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-white/0 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center justify-between bg-black border border-white/20 rounded-xl p-4 font-mono text-xl tracking-wider text-white shadow-inner">
                  <span className="truncate pr-4">{secretKey}</span>
                  <button onClick={copyToClipboard} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white shrink-0">
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {status === 'empty' && (
            <div className="flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 rounded-full bg-orange-500/10 flex items-center justify-center mb-2">
                <ShieldAlert className="w-8 h-8 text-orange-400" />
              </div>
              <p className="text-lg font-medium text-white/90">库存已空</p>
              <p className="text-sm text-white/40 text-center">账号验证成功<br/>但服务器中的密钥已被领完</p>
              <button onClick={reset} className="mt-4 px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm">返回</button>
            </div>
          )}
        </div>
        
        {/* 页脚 */}
        <p className="text-xs text-white/15 tracking-widest font-mono">SECURED BY VIP ACCESS</p>
      </div>
    </div>
  );
}