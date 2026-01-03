import { useState, useRef } from 'react';
import { Camera, Type, Upload, X, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

interface IngredientInputProps {
  onAnalyze: (input: string, isImage: boolean, imageBase64?: string) => void;
  isLoading: boolean;
  onClose: () => void;
}

export function IngredientInput({ onAnalyze, isLoading, onClose }: IngredientInputProps) {
  const [textInput, setTextInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('text');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (activeTab === 'text' && textInput.trim()) {
      onAnalyze(textInput, false);
    } else if (activeTab === 'image' && selectedImage) {
      onAnalyze('', true, selectedImage);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const isSubmitDisabled = isLoading || 
    (activeTab === 'text' && !textInput.trim()) ||
    (activeTab === 'image' && !selectedImage);

  return (
    <div className="bg-card rounded-3xl shadow-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h3 className="font-display font-semibold text-lg">Scan Ingredients</h3>
        <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
          <X className="w-5 h-5" />
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="p-4">
        <TabsList className="grid w-full grid-cols-2 mb-4">
          <TabsTrigger value="text" className="flex items-center gap-2">
            <Type className="w-4 h-4" />
            Text
          </TabsTrigger>
          <TabsTrigger value="image" className="flex items-center gap-2">
            <Camera className="w-4 h-4" />
            Photo
          </TabsTrigger>
        </TabsList>

        <TabsContent value="text" className="space-y-4">
          <Textarea
            placeholder="Paste or type the ingredient list here...

Example: Water, Sugar, Enriched Flour (Wheat Flour, Niacin, Reduced Iron, Thiamine Mononitrate, Riboflavin, Folic Acid), Palm Oil, Cocoa Powder..."
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="min-h-[200px] resize-none rounded-xl"
          />
        </TabsContent>

        <TabsContent value="image" className="space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
          />
          
          {selectedImage ? (
            <div className="relative rounded-xl overflow-hidden">
              <img 
                src={selectedImage} 
                alt="Ingredient label" 
                className="w-full h-auto max-h-[300px] object-contain bg-muted"
              />
              <Button
                variant="destructive"
                size="icon"
                onClick={clearImage}
                className="absolute top-2 right-2 rounded-full"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className={cn(
                "w-full h-[200px] border-2 border-dashed border-border rounded-xl",
                "flex flex-col items-center justify-center gap-3",
                "text-muted-foreground hover:text-foreground hover:border-primary/50",
                "transition-colors cursor-pointer"
              )}
            >
              <Upload className="w-10 h-10" />
              <span className="font-medium">Upload or take a photo</span>
              <span className="text-sm">of the ingredient label</span>
            </button>
          )}
        </TabsContent>

        <Button
          onClick={handleSubmit}
          disabled={isSubmitDisabled}
          className="w-full mt-4 py-6 rounded-xl text-lg font-semibold"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 mr-2" />
              Analyze Ingredients
            </>
          )}
        </Button>
      </Tabs>
    </div>
  );
}
