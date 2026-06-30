import { useLanguage } from '@/hooks/use-language';
import type { MedicineResult, MedicineNotFound } from '@workspace/api-client-react';
import { 
  HeartPulse, 
  Stethoscope, 
  AlertTriangle, 
  ShieldAlert, 
  Info,
  Pill
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';

interface MedicineResultViewProps {
  result: MedicineResult | MedicineNotFound;
}

export function MedicineResultView({ result }: MedicineResultViewProps) {
  const { language } = useLanguage();

  if (!result.isMedicine) {
    const errorData = result as MedicineNotFound;
    
    // Choose appropriate error message based on language
    let errorMsg = errorData.errorMsg_EN;
    if (language === 'romanUrdu') errorMsg = errorData.errorMsg_RU;
    if (language === 'urduScript') errorMsg = errorData.errorMsg_UR;

    return (
      <div className="w-full max-w-4xl mx-auto mt-8 animate-in zoom-in-95 duration-300">
        <Card className="border-destructive/20 bg-destructive/5 shadow-none overflow-hidden">
          <CardContent className="p-8 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4 text-destructive">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-2xl font-bold text-destructive mb-2">Medicine Not Found</h3>
            <p className={cn(
              "text-lg text-destructive/80 max-w-md",
              language === 'urduScript' && "font-urdu text-2xl leading-relaxed text-right"
            )} dir={language === 'urduScript' ? "rtl" : "ltr"}>
              {errorMsg}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const medData = result as MedicineResult;
  const content = medData[language];
  const isUrdu = language === 'urduScript';

  return (
    <div 
      className={cn(
        "w-full max-w-5xl mx-auto mt-8 space-y-6 animate-in slide-in-from-bottom-8 duration-500",
        isUrdu ? "text-right" : "text-left"
      )}
      dir={isUrdu ? "rtl" : "ltr"}
    >
      {/* Banner */}
      <div className="bg-primary text-primary-foreground rounded-2xl p-6 md:p-8 shadow-lg relative overflow-hidden flex items-center gap-6">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 w-32 h-32 bg-black/10 rounded-full blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10 w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0">
          <Pill className="w-8 h-8 md:w-10 md:h-10 text-white" />
        </div>
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-2">
            {medData.medicineName}
          </h2>
          <p className="text-primary-foreground/80 text-lg md:text-xl font-medium flex items-center gap-2">
            <Info className="w-5 h-5" /> 
            {language === 'english' && 'Medicine Information'}
            {language === 'romanUrdu' && 'Dawai Ki Maloomat'}
            {language === 'urduScript' && 'دوائی کی معلومات'}
          </p>
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Uses / Benefits */}
        <InfoCard 
          icon={<HeartPulse className="w-6 h-6 text-emerald-600" />}
          title={isUrdu ? "استعمال اور فوائد" : (language === 'romanUrdu' ? "Istamal aur Fawaid" : "Uses & Benefits")}
          content={content.uses}
          headerClass="bg-emerald-50 border-emerald-100"
          titleClass="text-emerald-900"
          isUrdu={isUrdu}
        />

        {/* Dosage & Usage */}
        <InfoCard 
          icon={<Stethoscope className="w-6 h-6 text-blue-600" />}
          title={isUrdu ? "خوراک اور طریقہ استعمال" : (language === 'romanUrdu' ? "Khorak aur Tariqa" : "Dosage & Usage")}
          content={content.dosage}
          headerClass="bg-blue-50 border-blue-100"
          titleClass="text-blue-900"
          isUrdu={isUrdu}
        />

        {/* Side Effects */}
        <InfoCard 
          icon={<AlertTriangle className="w-6 h-6 text-orange-600" />}
          title={isUrdu ? "نقصانات (سائیڈ ایفیکٹس)" : (language === 'romanUrdu' ? "Nuqsanat (Side Effects)" : "Side Effects")}
          content={content.sideEffects}
          headerClass="bg-orange-50 border-orange-100"
          titleClass="text-orange-900"
          isUrdu={isUrdu}
        />

        {/* Precautions */}
        <InfoCard 
          icon={<ShieldAlert className="w-6 h-6 text-red-600" />}
          title={isUrdu ? "احتیاطی تدابیر" : (language === 'romanUrdu' ? "Ehtiyati Tadabeer" : "Precautions")}
          content={content.precautions}
          headerClass="bg-red-50 border-red-100"
          titleClass="text-red-900"
          isUrdu={isUrdu}
        />
      </div>

      {/* Disclaimer */}
      <div className="bg-muted p-5 rounded-xl border border-border text-muted-foreground flex gap-4 mt-8">
        <Info className="w-6 h-6 shrink-0 mt-0.5" />
        <p className={cn(
          "text-sm md:text-base leading-relaxed",
          isUrdu && "font-urdu text-lg leading-loose"
        )}>
          {content.disclaimer}
        </p>
      </div>
    </div>
  );
}

function InfoCard({ 
  icon, 
  title, 
  content, 
  headerClass, 
  titleClass, 
  isUrdu 
}: { 
  icon: React.ReactNode; 
  title: string; 
  content: string; 
  headerClass: string; 
  titleClass: string;
  isUrdu: boolean;
}) {
  return (
    <Card className="overflow-hidden border-border shadow-sm hover:shadow-md transition-shadow">
      <div className={cn("px-5 py-4 border-b flex items-center gap-3", headerClass)}>
        <div className="bg-white p-2 rounded-lg shadow-sm">
          {icon}
        </div>
        <h3 className={cn("font-bold text-lg", titleClass, isUrdu && "font-urdu text-xl")}>
          {title}
        </h3>
      </div>
      <CardContent className="p-5">
        <p className={cn(
          "text-foreground/80 leading-relaxed whitespace-pre-wrap",
          isUrdu ? "font-urdu text-xl leading-loose" : "text-base"
        )}>
          {content}
        </p>
      </CardContent>
    </Card>
  );
}
