import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error in application:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#f7f4ed] dark:bg-[#0f1015] font-serif text-[#221f1d] dark:text-[#f2efe9]">
          <div className="max-w-md w-full p-6 rounded-2xl border shadow-xl bg-white dark:bg-[#181920] border-[#d8cfbe] dark:border-[#31333f] text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-[#faebea] dark:bg-[#381a17] text-[#9c2e22] dark:text-[#e05646] flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-[#8d271c] dark:text-[#df756b]">
              排盤運算暫時遇到問題
            </h2>
            <p className="text-xs text-[#666] dark:text-[#aaa] leading-relaxed">
              系統在解析特定生辰時辰時遭遇異常。已自動保護您的本地命例資料，請點擊下方按鈕重新整理回到即時時辰排盤。
            </p>
            <div className="pt-2">
              <button
                type="button"
                onClick={this.handleReset}
                className="w-full py-2.5 px-4 rounded-lg bg-[#8d271c] hover:bg-[#731f16] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                重新載入並排盤
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
