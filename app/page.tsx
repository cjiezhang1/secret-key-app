'use client';
import React, { useState } from 'react';
import { KeyRound, ShieldAlert, Loader2, Copy, Check } from 'lucide-react';

export default function Home() {
  const [status, setStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'empty'
  const [secretKey, setSecretKey] = useState('');
  const [copied, setCopied] = useState(false);

  // 向真实的后端发送请求获取密钥
  const fetchKey = async () => {
    setStatus('loading');
    setCopied(false);
    
    try {
      // 这里的 /api/get-key 就是我们在保姆级教程里教你写的后端路由
      const response = await fetch('/api/get-key', { method: 'POST' });
      const data = await response.json();

      if (data.success) {
        setSecretKey(data.key);
        setStatus('success');
      } else {
        setStatus('empty');
      }
    } catch (error) {
      setStatus('empty'); // 遇到网络错误也显示空状态
    }
  };

  const copyToClipboard = () => {
    // 真实的浏览器环境可以直接使用现代剪贴板 API
    navigator.clipboard.writeText(secretKey).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(err => {
      console.error('复制失败:', err);
    });
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white flex flex-col items-center justify-center p-4 font-sans selection:bg-white/30">
      
      {/* 极简背景光晕效果 */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-white/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-md flex flex-col items-center space-y-8">

        {/* 核心交互区 */}
        <div className="w-full bg-white/[0.02] border border-white/[0.05] rounded-3xl p-8 backdrop-blur-sm shadow-2xl flex flex-col items-center min-h-[220px] justify-center transition-all duration-500">
          
          {/* 初始状态 或 加载状态 */}
          {(status === 'idle' || status === 'loading') && (
            <button
              onClick={fetchKey}
              disabled={status === 'loading'}
              className={`group relative overflow-hidden rounded-full px-8 py-4 transition-all duration-300 w-full max-w-[240px] flex items-center justify-center space-x-2
                ${status === 'loading' 
                  ? 'bg-white/10 text-white/50 cursor-not-allowed' 
                  : 'bg-white text-black hover:scale-105 hover:shadow-[0_0_40px_rgba(255,255,255,0.3)] active:scale-95'}`}
            >
              {status === 'loading' ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="font-medium tracking-wide">获取中...</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-5 h-5" />
                  <span className="font-medium tracking-wide">一键获取密钥</span>
                </>
              )}
            </button>
          )}

          {/* 成功状态 */}
          {status === 'success' && (
            <div className="w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="text-center text-sm text-white/40 mb-2 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 mr-1" />
                请立即保存，该密钥已从服务器永久销毁
              </div>
              
              <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-white/20 to-white/0 rounded-xl blur opacity-30 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative flex items-center justify-between bg-black border border-white/20 rounded-xl p-4 font-mono text-xl tracking-wider text-white shadow-inner">
                  <span className="truncate pr-4">{secretKey}</span>
                  <button 
                    onClick={copyToClipboard}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors text-white/60 hover:text-white shrink-0"
                    title="复制密钥"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button 
                onClick={() => setStatus('idle')}
                className="mt-6 w-full text-center text-sm text-white/30 hover:text-white/60 transition-colors underline underline-offset-4"
              >
                返回重试
              </button>
            </div>
          )}

          {/* 失败/空列表状态 */}
          {status === 'empty' && (
            <div className="flex flex-col items-center justify-center space-y-4 animate-in zoom-in-95 duration-500">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mb-2">
                <ShieldAlert className="w-8 h-8 text-red-400" />
              </div>
              <p className="text-lg font-medium text-white/90">请联系管理员</p>
              <p className="text-sm text-white/40 text-center">当前没有可用的密钥<br/>或者库存已被领完</p>
              
              <button 
                onClick={() => setStatus('idle')}
                className="mt-4 px-6 py-2 rounded-full border border-white/10 hover:bg-white/5 transition-colors text-sm"
              >
                返回重试
              </button>
            </div>
          )}

        </div>
        
        <p className="text-xs text-white/20">Secured by Vercel KV</p>
      </div>
    </div>
  );
}