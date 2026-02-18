import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RotateCcw, TrendingUp, TrendingDown, AlertTriangle, BarChart3, Target, Shield } from 'lucide-react';
import { calculateRoundNumber, calculateStrikes, calculatePanicPrice, calculateManagement, type CalculationInputs, type CalculationResults } from '@/lib/calculations';

export default function CalculatorPage() {
  const [inputs, setInputs] = useState<CalculationInputs>({
    niftyClose: '',
    cePremium: '',
    pePremium: '',
    rnCePremium: '',
    rnPePremium: '',
    entryPrice: ''
  });

  const [results, setResults] = useState<CalculationResults>({
    roundNumber: null,
    ceStrike: null,
    peStrike: null,
    panicPrice: null,
    stopLoss: null,
    target: null,
    gapUpEntry: null,
    gapDownEntry: null
  });

  const [signal, setSignal] = useState<'idle' | 'gap-up' | 'gap-down'>('idle');

  useEffect(() => {
    const niftyClose = parseFloat(inputs.niftyClose);
    const cePremium = parseFloat(inputs.cePremium);
    const pePremium = parseFloat(inputs.pePremium);
    const rnCePremium = parseFloat(inputs.rnCePremium);
    const rnPePremium = parseFloat(inputs.rnPePremium);
    const entryPrice = parseFloat(inputs.entryPrice);

    let newResults: CalculationResults = {
      roundNumber: null,
      ceStrike: null,
      peStrike: null,
      panicPrice: null,
      stopLoss: null,
      target: null,
      gapUpEntry: null,
      gapDownEntry: null
    };

    if (!isNaN(niftyClose)) {
      const rn = calculateRoundNumber(niftyClose);
      const strikes = calculateStrikes(rn);
      newResults.roundNumber = rn;
      newResults.ceStrike = strikes.ce;
      newResults.peStrike = strikes.pe;
    }

    if (!isNaN(cePremium) && !isNaN(pePremium)) {
      newResults.panicPrice = calculatePanicPrice(cePremium, pePremium);
    }

    if (!isNaN(rnCePremium)) {
      newResults.gapUpEntry = rnCePremium;
    }

    if (!isNaN(rnPePremium)) {
      newResults.gapDownEntry = rnPePremium;
    }

    if (!isNaN(entryPrice)) {
      const mgmt = calculateManagement(entryPrice);
      newResults.stopLoss = mgmt.stopLoss;
      newResults.target = mgmt.target;
    }

    setResults(newResults);

    // Determine signal
    if (!isNaN(cePremium) && !isNaN(pePremium) && newResults.panicPrice !== null) {
      if (cePremium > newResults.panicPrice && pePremium < newResults.panicPrice) {
        setSignal('gap-up');
      } else if (pePremium > newResults.panicPrice && cePremium < newResults.panicPrice) {
        setSignal('gap-down');
      } else {
        setSignal('idle');
      }
    } else {
      setSignal('idle');
    }
  }, [inputs]);

  const handleInputChange = (field: keyof CalculationInputs, value: string) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleReset = () => {
    setInputs({
      niftyClose: '',
      cePremium: '',
      pePremium: '',
      rnCePremium: '',
      rnPePremium: '',
      entryPrice: ''
    });
  };

  const getSignalColor = () => {
    switch (signal) {
      case 'gap-up':
        return 'bg-success';
      case 'gap-down':
        return 'bg-destructive';
      default:
        return 'bg-muted';
    }
  };

  const getSignalText = () => {
    switch (signal) {
      case 'gap-up':
        return '📈 GAP UP DETECTED → Trade CE Option';
      case 'gap-down':
        return '📉 GAP DOWN DETECTED → Trade PE Option';
      default:
        return '⌛ Enter data to generate signal...';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Animated grid background */}
      <div className="fixed inset-0 bg-grid-pattern opacity-[0.03] pointer-events-none" />
      
      <div className="relative z-10 max-w-[430px] mx-auto min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-50 bg-gradient-to-br from-card to-card/95 border-b border-border backdrop-blur-sm">
          <div className="px-5 py-4">
            <div className="flex items-center justify-between mb-1">
              <h1 className="text-[13px] font-bold tracking-[2px] text-accent uppercase font-mono">
                NIFTY OPTIONS
              </h1>
              <div className="w-2 h-2 rounded-full bg-success animate-pulse shadow-[0_0_8px_currentColor]" />
            </div>
            <p className="text-[11px] text-muted-foreground tracking-[1px] font-mono">
              PANIC STRATEGY CALCULATOR v3.0
            </p>
          </div>
        </header>

        <main className="pb-6">
          {/* Market Data Section */}
          <section className="mt-4 px-4">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-[9px] font-bold tracking-[3px] text-muted-foreground uppercase font-mono">
                MARKET DATA
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Card className="border-border overflow-hidden">
              <div className="flex items-center gap-3 p-3 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[11px] text-muted-foreground uppercase tracking-[0.5px] font-medium block mb-1">
                    Yesterday Nifty Close
                  </label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="e.g. 25542"
                    value={inputs.niftyClose}
                    onChange={(e) => handleInputChange('niftyClose', e.target.value)}
                    className="h-auto p-0 border-0 text-xl font-mono bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-3.5 h-3.5 text-accent" />
                </div>
                <div className="flex-1">
                  <div className="text-[11px] text-muted-foreground uppercase tracking-[0.5px] font-medium mb-1">
                    Round Number (RN)
                  </div>
                  <div className="text-xl font-mono text-accent">
                    {results.roundNumber !== null ? results.roundNumber : '—'}
                  </div>
                </div>
                <Badge variant="outline" className="text-[9px] font-mono tracking-[1px] border-accent/20 bg-accent/5 text-accent">
                  AUTO
                </Badge>
              </div>
            </Card>

            {/* Strike Prices */}
            <div className="grid grid-cols-2 gap-2 mt-2">
              <Card className="border-t-2 border-t-success border-border text-center p-3.5">
                <div className="text-[9px] font-bold tracking-[2px] text-success uppercase font-mono mb-1.5">
                  OTM CE ▲
                </div>
                <div className="text-[22px] font-mono text-success leading-none">
                  {results.ceStrike !== null ? results.ceStrike : '—'}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">RN + 100</div>
              </Card>

              <Card className="border-t-2 border-t-destructive border-border text-center p-3.5">
                <div className="text-[9px] font-bold tracking-[2px] text-destructive uppercase font-mono mb-1.5">
                  OTM PE ▼
                </div>
                <div className="text-[22px] font-mono text-destructive leading-none">
                  {results.peStrike !== null ? results.peStrike : '—'}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">RN − 100</div>
              </Card>
            </div>
          </section>

          {/* Premium Data Section */}
          <section className="mt-4 px-4">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-[9px] font-bold tracking-[3px] text-muted-foreground uppercase font-mono">
                PREMIUM DATA
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Card className="border-border overflow-hidden">
              <div className="flex items-center gap-3 p-3 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-3.5 h-3.5 text-success" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[11px] text-muted-foreground uppercase tracking-[0.5px] font-medium block mb-1">
                    OTM CE Close Premium
                  </label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={inputs.cePremium}
                    onChange={(e) => handleInputChange('cePremium', e.target.value)}
                    className="h-auto p-0 border-0 text-xl font-mono bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <TrendingDown className="w-3.5 h-3.5 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[11px] text-muted-foreground uppercase tracking-[0.5px] font-medium block mb-1">
                    OTM PE Close Premium
                  </label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={inputs.pePremium}
                    onChange={(e) => handleInputChange('pePremium', e.target.value)}
                    className="h-auto p-0 border-0 text-xl font-mono bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">⚡</span>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[11px] text-muted-foreground uppercase tracking-[0.5px] font-medium block mb-1">
                    RN CE Close → Gap Down PE Entry
                  </label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={inputs.rnCePremium}
                    onChange={(e) => handleInputChange('rnCePremium', e.target.value)}
                    className="h-auto p-0 border-0 text-xl font-mono bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 rounded-lg bg-warning/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">⚡</span>
                </div>
                <div className="flex-1 min-w-0">
                  <label className="text-[11px] text-muted-foreground uppercase tracking-[0.5px] font-medium block mb-1">
                    RN PE Close → Gap Up CE Entry
                  </label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={inputs.rnPePremium}
                    onChange={(e) => handleInputChange('rnPePremium', e.target.value)}
                    className="h-auto p-0 border-0 text-xl font-mono bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                  />
                </div>
              </div>
            </Card>
          </section>

          {/* Panic Price Section */}
          <section className="mt-4 px-4">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-[9px] font-bold tracking-[3px] text-muted-foreground uppercase font-mono">
                PANIC THRESHOLD
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Card className="bg-gradient-to-br from-warning/5 to-warning/10 border-warning/30 p-4">
              <div className="flex items-center gap-3.5">
                <div className="text-3xl animate-pulse">
                  <AlertTriangle className="w-7 h-7 text-warning" />
                </div>
                <div className="flex-1">
                  <div className="text-[9px] text-warning tracking-[2px] uppercase font-mono mb-1">
                    PANIC PRICE
                  </div>
                  <div className="text-[28px] font-mono text-warning leading-none">
                    {results.panicPrice !== null ? results.panicPrice.toFixed(2) : '—'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-muted-foreground font-mono">(CE+PE)÷2</div>
                </div>
              </div>
            </Card>
          </section>

          {/* Live Signal Section */}
          <section className="mt-4 px-4">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-[9px] font-bold tracking-[3px] text-muted-foreground uppercase font-mono">
                LIVE SIGNAL
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Card className="border-border overflow-hidden">
              <div className="bg-card/50 p-4 border-b border-border min-h-[76px] flex items-center gap-3">
                <div className={`w-1 h-12 rounded-full ${getSignalColor()} transition-colors duration-400`} />
                <div className="text-lg font-semibold leading-tight transition-colors duration-400">
                  {getSignalText()}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-px bg-border">
                <div className="bg-card p-2.5">
                  <div className="text-[10px] text-muted-foreground tracking-[1px] uppercase mb-1">
                    GAP UP → CE
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {results.gapUpEntry !== null ? (
                      <>
                        Entry: <span className="text-success text-[13px]">{results.gapUpEntry.toFixed(2)}</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>

                <div className="bg-card p-2.5 border-l border-border">
                  <div className="text-[10px] text-muted-foreground tracking-[1px] uppercase mb-1">
                    GAP DOWN → PE
                  </div>
                  <div className="text-xs font-mono text-muted-foreground">
                    {results.gapDownEntry !== null ? (
                      <>
                        Entry: <span className="text-destructive text-[13px]">{results.gapDownEntry.toFixed(2)}</span>
                      </>
                    ) : (
                      '—'
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </section>

          {/* Trade Management Section */}
          <section className="mt-4 px-4">
            <div className="flex items-center gap-2 mb-3">
              <h2 className="text-[9px] font-bold tracking-[3px] text-muted-foreground uppercase font-mono">
                TRADE MANAGEMENT
              </h2>
              <div className="flex-1 h-px bg-border" />
            </div>

            <Card className="border-border overflow-hidden">
              <div className="flex items-center gap-3 p-3 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-foreground/5 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">💰</span>
                </div>
                <div className="flex-1">
                  <div className="text-[11px] text-muted-foreground uppercase tracking-[0.5px] font-medium mb-1">
                    Your Entry Price
                  </div>
                </div>
                <Input
                  type="number"
                  inputMode="decimal"
                  placeholder="—"
                  value={inputs.entryPrice}
                  onChange={(e) => handleInputChange('entryPrice', e.target.value)}
                  className="w-[120px] h-auto p-0 border-0 text-xl font-mono text-right bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>

              <div className="flex items-center gap-3 p-3 border-b border-border/50">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-3.5 h-3.5 text-destructive" />
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="text-[11px] text-muted-foreground uppercase tracking-[0.5px] font-medium">
                    Stop Loss
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono tracking-[1px] border-destructive/30 bg-destructive/10 text-destructive">
                    −30%
                  </Badge>
                </div>
                <div className="text-xl font-mono text-destructive">
                  {results.stopLoss !== null ? results.stopLoss.toFixed(2) : '—'}
                </div>
              </div>

              <div className="flex items-center gap-3 p-3">
                <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center flex-shrink-0">
                  <Target className="w-3.5 h-3.5 text-success" />
                </div>
                <div className="flex-1 flex items-center gap-2">
                  <div className="text-[11px] text-muted-foreground uppercase tracking-[0.5px] font-medium">
                    Target
                  </div>
                  <Badge variant="outline" className="text-[9px] font-mono tracking-[1px] border-success/30 bg-success/10 text-success">
                    +60%
                  </Badge>
                </div>
                <div className="text-xl font-mono text-success">
                  {results.target !== null ? results.target.toFixed(2) : '—'}
                </div>
              </div>
            </Card>
          </section>

          {/* Reset Button */}
          <div className="mt-4 px-4">
            <Button
              variant="outline"
              onClick={handleReset}
              className="w-full flex items-center justify-center gap-2 h-auto py-3.5 text-[13px] font-semibold tracking-[2px] uppercase border-border hover:border-accent hover:text-accent transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              RESET ALL FIELDS
            </Button>
          </div>

          {/* Footer */}
          <footer className="mt-6 px-4 pb-2">
            <div className="text-center text-[9px] text-muted-foreground/40 tracking-[2px] font-mono">
              NIFTY OPTIONS PANIC STRATEGY CALCULATOR
            </div>
            <div className="text-center text-xs text-muted-foreground/60 mt-3">
              Built with ❤️ using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'nifty-calculator')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent hover:underline"
              >
                caffeine.ai
              </a>
            </div>
            <div className="text-center text-[10px] text-muted-foreground/40 mt-1">
              © {new Date().getFullYear()}
            </div>
          </footer>
        </main>
      </div>
    </div>
  );
}
